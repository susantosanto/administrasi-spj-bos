/**
 * bkuPdfRapi.js — perapian baris hasil OCR sebelum jadi transaksi.
 *
 * Dua masalah nyata yang terbukti dari pengukuran (2026-10-20):
 *
 * 1. BARIS RINGKASAN IKUT JADI TRANSAKSI.
 *    Halaman terakhir BKU memuat baris total tahunan ("Jumlah" dengan
 *    nominal = total setahun). Baris itu punya tanggal sah (30-09-2026)
 *    sehingga lolos sebagai baris data dan MENGGANDAKAN seluruh nominal
 *    setahun ke bulan September. Ciri: uraian BERAKHIR dengan kata
 *    "Jumlah" (sering menempel ke uraian baris sebelumnya karena OCR).
 *
 * 2. TANGGAL TAHUNNYA SALAH BACA.
 *    Tesseract kadang salah baca digit tahun ("2026" -> "2003"/"2008"/
 *    "2028"). Tanggal tetap "sah" secara bentuk, jadi parser menerimanya
 *    dan baris itu HILANG dari bulan asalnya (atau pindah tahun). Bukti
 *    terukur: 11 baris di fixture RapidOCR + 3 baris di fixture tesseract
 *    runtime; jumlahnya persis menutup selisih Februari/April/Agustus/
 *    September terhadap Excel.
 *
 *    Perbaikan memakai URUTAN DOKUMEN, bukan tebakan angka: BKU selalu
 *    urut kronologis, jadi baris bermasalah yang diapit dua baris sah
 *    pada bulan yang sama PASTI bulan itu. Hari dipertahankan bila sah,
 *    dan baris selalu ditandai 'tanggal_perlu_dikoreksi' supaya user
 *    memeriksanya — hasil perbaikan tidak pernah diam-diam dianggap benar.
 *
 * Tidak ada tanggal/bulan/tahun yang di-hardcode: tahun acuan datang dari
 * kop dokumen (atau modus tahun baris), bukan konstanta.
 */

const pad = (n) => String(n).padStart(2, '0')

/** Jumlah hari dalam bulan (1-12) pada tahun tertentu. */
export function hariMaks(bulan, tahun) {
  return new Date(tahun, bulan, 0).getDate()
}

/**
 * Tahun acuan dokumen dari baris-baris yang sudah terbaca.
 * Dipakai hanya bila kop tidak memberi tahun.
 */
export function modusTahun(rows) {
  const hitung = new Map()
  for (const r of rows) {
    if (r.bulan >= 1 && r.bulan <= 12 && r.tahun >= 2000 && r.tahun <= 2099) {
      hitung.set(r.tahun, (hitung.get(r.tahun) || 0) + 1)
    }
  }
  let terbaik = 0, n = 0
  for (const [t, c] of hitung) if (c > n) { n = c; terbaik = t }
  return terbaik
}

/**
 * Perbaiki baris yang tahunnya tidak wajar dengan bulan dari tetangga
 * terdekat yang sah (urutan dokumen = urutan kronologis).
 *
 * @param {Array} rows baris mentah (dimutasi)
 * @param {number} tahunDok tahun acuan dokumen (mis. 2026)
 * @returns {number} jumlah baris yang diperbaiki
 */
export function perbaikiTanggalTakWajar(rows, tahunDok) {
  if (!tahunDok) return 0
  const sah = (r) => r.tahun === tahunDok && r.bulan >= 1 && r.bulan <= 12
  let diperbaiki = 0
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    if (sah(r)) continue
    // Tahun sebelum tahun dokumen (mis. 31-12-2025 saldo awal) masih
    // masuk akal secara isi -> jangan diubah.
    if (r.tahun === tahunDok - 1 && r.bulan >= 1 && r.bulan <= 12) continue
    let prev = null, next = null
    for (let k = i - 1; k >= 0; k--) if (sah(rows[k])) { prev = rows[k]; break }
    for (let k = i + 1; k < rows.length; k++) if (sah(rows[k])) { next = rows[k]; break }
    if (!prev && !next) continue
    // Dua tetangga sepakat = bukti kuat. Bila berbeda (baris di batas
    // bulan), pakai tetangga SEBELUMNYA dan tetap ditandai untuk koreksi.
    const bulan = prev && next && prev.bulan === next.bulan
      ? prev.bulan
      : (prev ? prev.bulan : next.bulan)
    if (!bulan) continue
    const hari = r.tanggal.day >= 1 && r.tanggal.day <= hariMaks(bulan, tahunDok)
      ? r.tanggal.day : 1
    r.bulan = bulan
    r.tahun = tahunDok
    r.tanggal = { day: hari, month: bulan, year: tahunDok }
    r.tanggalStr = `${pad(hari)}-${pad(bulan)}-${tahunDok}`
    r.tanggalISO = `${tahunDok}-${pad(bulan)}-${pad(hari)}`
    r.problems = (r.problems || []).filter((p) => p !== 'tanggal_tidak_valid')
    if (!r.problems.includes('tanggal_perlu_dikoreksi')) r.problems.push('tanggal_perlu_dikoreksi')
    diperbaiki++
  }
  return diperbaiki
}

/**
 * Buang baris ringkasan/total (bukan transaksi).
 *
 * Dua penanda, sengaja berlapis:
 *  1. TEKS — uraian BERAKHIR dengan kata "Jumlah". Di PDF baris total
 *     tahunan tampil sebagai "Jumlah", dan karena OCR menempelkan uraian
 *     baris di atasnya, hasilnya bisa "Pajak Bunga Jumlah". Uraian
 *     transaksi sah yang memuat kata "Jumlah" di TENGAH ("... Jumlah
 *     pole 12") tidak ikut terbuang.
 *  2. STRUKTUR — nominal baris SAMA DENGAN jumlah nominal baris lain.
 *     Ini perlu karena mesin OCR bisa membaca teks baris total sebagai
 *     "—" (terbukti pada fixture 300 DPI), sehingga penanda teks lolos.
 *     Secara matematis transaksi biasa tidak mungkin bernilai sama dengan
 *     total seluruh transaksi lain, jadi penanda ini aman.
 *
 * @param {Array} rows baris mentah
 * @returns {{rows:Array, dilewati:Array}}
 */
export function saringBarisRingkasan(rows) {
  const totalM = rows.reduce((a, r) => a + (Number(r.penerimaan) || 0), 0)
  const totalK = rows.reduce((a, r) => a + (Number(r.pengeluaran) || 0), 0)
  const lolos = [], dilewati = []
  for (const r of rows) {
    const u = String(r.uraian || '').trim()
    const m = Number(r.penerimaan) || 0
    const k = Number(r.pengeluaran) || 0
    const teksTotal = /\bjumlah\s*$/i.test(u) && (m > 0 || k > 0)
    const nilaiTotal = (m > 0 && Math.abs(m - (totalM - m)) <= 1) ||
      (k > 0 && Math.abs(k - (totalK - k)) <= 1)
    if (teksTotal || nilaiTotal) {
      dilewati.push({
        tanggal: r.tanggalStr, halaman: r.row,
        jenis: 'baris_ringkasan_dilewati',
        uraian: u, penerimaan: m, pengeluaran: k,
      })
      continue
    }
    lolos.push(r)
  }
  return { rows: lolos, dilewati }
}

/**
 * Koreksi nominal yang salah baca memakai RANTAI SALDO.
 *
 * Tesseract kadang salah baca satu digit nominal (terbukti: 270.000 ->
 * 210.000, 278.400 -> 218.400, 275.000 -> 215.000 — digit 7 terbaca 1).
 * Kolom SALDO di PDF tetap benar pada kasus itu, sehingga nominal bisa
 * dihitung ulang: pengeluaran = saldo sebelumnya - saldo baris ini.
 *
 * PENJAGAAN (wajib, karena kolom saldo sendiri bisa salah baca):
 *  1. Hanya baris dengan SATU sisi nominal (masuk saja / keluar saja).
 *  2. Rantai baris ini memang putus (kalau utuh, tidak diapa-apakan).
 *  3. Saldo baris ini DIKONFIRMASI baris berikutnya (saldo + nominal
 *     berikutnya = saldo berikutnya). Kalau tidak, saldonya yang salah —
 *     nominal jangan diubah.
 *  4. Saldo baris sebelumnya juga dikonfirmasi baris sebelum itu.
 *  5. Nominal hasil hitung harus positif dan tidak lebih dari 2x nominal
 *     lama (salah digit, bukan nilai yang sama sekali lain).
 * Baris yang dikoreksi ditandai 'nominal_diperbaiki' agar user tahu.
 *
 * @param {Array} rows baris mentah (dimutasi)
 * @returns {number} jumlah baris yang dikoreksi
 */
export function perbaikiNominalDariSaldo(rows) {
  let n = 0
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1], cur = rows[i], next = rows[i + 1]
    if (!prev || !cur || !next) continue
    const sisi = cur.pengeluaran > 0 && cur.penerimaan === 0 ? 'K'
      : cur.penerimaan > 0 && cur.pengeluaran === 0 ? 'M' : null
    if (!sisi) continue
    const harus = prev.saldo + cur.penerimaan - cur.pengeluaran
    if (Math.abs(harus - cur.saldo) <= 0.5) continue
    if (Math.abs(cur.saldo + next.penerimaan - next.pengeluaran - next.saldo) > 0.5) continue
    if (i >= 2) {
      const p2 = rows[i - 2]
      if (Math.abs(p2.saldo + prev.penerimaan - prev.pengeluaran - prev.saldo) > 0.5) continue
    }
    const baru = sisi === 'K' ? prev.saldo - cur.saldo : cur.saldo - prev.saldo
    if (baru <= 0) continue
    const lama = sisi === 'K' ? cur.pengeluaran : cur.penerimaan
    if (lama > 0 && baru > lama * 2) continue
    if (sisi === 'K') { cur.pengeluaran = baru; cur.kredit = baru }
    else { cur.penerimaan = baru; cur.debet = baru }
    cur.problems = cur.problems || []
    if (!cur.problems.includes('nominal_diperbaiki')) cur.problems.push('nominal_diperbaiki')
    n++
  }
  return n
}

export default { hariMaks, modusTahun, perbaikiTanggalTakWajar, saringBarisRingkasan, perbaikiNominalDariSaldo }
