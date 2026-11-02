/**
 * bkuPdfParser.js — Sprint 015 · M3b: baris → TransactionRow (≤200 baris)
 *
 * Masukan : fixture / hasil OCR engine  { items:[{str,x,y,w,h,page}], meta }
 * Keluaran: { transactions, problems, dilewati, reconcile, kop, meta }
 *
 * Bentuk baris WAJIB 17 field identik jalur Excel (bkuParser.js:346-366).
 * `problems` TIDAK ikut ke baris — hanya untuk badge di layar preview.
 * Deteksi tipe/kategori TIDAK disalin: memakai API publik redetectTypes()
 * milik bkuParser.js (file itu TABU — harus 0 diff).
 * Bentuk kolom/baris: bkuPdfLayout.js · kolom teks: bkuPdfTeks.js ·
 * pembacaan tanggal: bkuPdfTanggal.js · perapian baris: bkuPdfRapi.js.
 */
import { redetectTypes } from './bkuParser.js'
import { kalibrasiNominal, barisPerHalaman, kolomAngka } from './bkuPdfLayout.js'
import { pisahTeks } from './bkuPdfTeks.js'
import { bacaTanggal, tanggalPemisah, tanggalGabung, tanggalPolos } from './bkuPdfTanggal.js'
import { perbaikiTanggalTakWajar, saringBarisRingkasan, modusTahun, perbaikiNominalDariSaldo, gabungBarisLanjutan } from './bkuPdfRapi.js'
const pad = (n) => String(n).padStart(2, '0')

/**
 * Buang label footer ("HALAMAN ..."). Label HEADER tabel sengaja TIDAK
 * dibuang di sini — "SALDO" bisa jadi kata sah di uraian; area kop sudah
 * terpisah oleh filter yData di barisPerHalaman.
 */
function buangHeader(items) {
  return items.filter((it) => !/^HALAMAN\b/i.test(it.str.trim()))
}

/**
 * Identitas sekolah dari blok kop: nama, NPSN, tahun. Urutan item OCR tidak
 * tepercaya, jadi dicari lewat KEDEKATAN (token berlabel + token terdekat di
 * kanannya). Tidak ada nama sekolah yang di-hardcode di modul ini.
 */export function bacaKop(items) {
  const hal1 = items.filter((it) => it.page === 1 && it.y < 560)
  const bersih = (v) => v.replace(/^[^:]{0,4}:\s*/, '').replace(/[\s,._-]+$/, '').trim()
  const cari = (label) => {
    const l = hal1.find((it) => new RegExp(label, 'i').test(it.str))
    if (!l) return ''
    const dekat = hal1
      .filter((it) => it !== l && it.x > l.x && Math.abs(it.y - l.y) < 12 && bersih(it.str) !== '')
      .sort((a, b) => Math.abs(a.y - l.y) - Math.abs(b.y - l.y) || a.x - b.x)[0]
    if (dekat) return bersih(dekat.str)
    const pisah = l.str.split(':')
    return pisah.length > 1 ? bersih(pisah.slice(1).join(':')) : ''
  }
  const th = hal1.map((i) => i.str).join(' ').match(/\b(20\d{2})\b/)
  // "Nama Sekolah" bisa terbagi 2 token ("Nama" + "Sekolah") — cari pasangan
  // berurutan dengan y sama, lalu nilainya di sebelah kanannya.
  const a = hal1.find((it) => /^nama$/i.test(it.str.trim()))
  const b = a && hal1.find((it) => it.x > a.x && Math.abs(it.y - a.y) < 12 && /^sekolah$/i.test(it.str.trim()))
  const label = b || hal1.find((it) => /nama[\s,._-]*sekolah/i.test(it.str))
  let namaSekolah = ''
  if (label) {
    // Nilai = semua token huruf/angka di kanan label pada baris yang sama
    // (kata "SD" + "NEGERI" + nama sekolah); token ":" (pemisah) dan "|"
    // (sisa garis tabel) dilewati.
    const nilai = hal1
      .filter((it) => it.x > label.x && Math.abs(it.y - label.y) < 12 && /[A-Za-z0-9]/.test(it.str))
      .sort((p, q) => p.x - q.x).map((it) => bersih(it.str)).join(' ')
    if (nilai) namaSekolah = nilai
  }
  return {
    namaSekolah: namaSekolah || cari('Nama[\\s,._-]*Sekolah'),
    npsn: cari('NPSN'),
    tahun: th ? th[1] : '',
    terbaca: hal1.length > 0,
  }
}

/** "82.560.000" | "82560000" | "Rp 82.560.000" -> 82560000 */
export function potongNominal(s) {
  const v = String(s).replace(/[^\d]/g, '')
  return v ? Number(v) : 0
}

/**
 * Token tanggal satu baris. Urutan = paling tepercaya dulu: berpemisah
 * ("01-01-2026"), hari+bulan menyatu ("0802-2026"), lalu tanpa pemisah
 * ("01012026)"). Dua bentuk terakhir mencegah baris hilang saat OCR
 * menghilangkan tanda hubung.
 */
function cariTokenTanggal(items) {
  for (const it of items) if (tanggalPemisah(it.str.trim())) return it
  for (const it of items) if (tanggalGabung(it.str.trim())) return it
  for (const it of items) if (tanggalPolos(it.str.trim())) return it
  return null
}

/** Bangun 1 baris mentah (tanpa tipe & kategori). */
function barisMentah(baris, edges) {
  const tgl = cariTokenTanggal(baris.items)
  if (!tgl) return null
  const dibaca = bacaTanggal(tgl.str.trim())
  const teks = pisahTeks(baris, edges)
  const problems = []
  if (!teks.uraian) problems.push('uraian_kosong')
  if (!teks.kodeRekening && !teks.kodeKegiatan && !teks.noBukti) problems.push('kolom_geser')

  const [penerimaan, pengeluaran, saldo] = kolomAngka(baris, edges, potongNominal)

  // Tanggal tak terbaca -> baris TETAP dibuat (men-drop baris menggeser
  // semua saldo), ditandai 'tanggal_perlu_dikoreksi' untuk diperiksa user.
  const oke = !!dibaca
  if (!dibaca) problems.push('tanggal_tidak_valid')
  else if (!dibaca.pasti) problems.push('tanggal_perlu_dikoreksi')
  const year = oke ? dibaca.year : 0
  const day = oke ? dibaca.day : 0
  const month = oke ? dibaca.month : 0

  return {
    problems,
    row: baris.page,
    tanggal: { day, month, year },
    tanggalStr: oke ? `${pad(day)}-${pad(month)}-${year}` : tgl.str.trim(),
    tanggalISO: oke ? `${year}-${pad(month)}-${pad(day)}` : '',
    bulan: month,
    tahun: year,
    kodeKegiatan: teks.kodeKegiatan,
    kodeRekening: teks.kodeRekening,
    noBukti: teks.noBukti,
    uraian: teks.uraian,
    penerimaan,
    pengeluaran,
    saldo,
    debet: penerimaan,
    kredit: pengeluaran,
    tipe: null,
    kategori: null,
  }
}

/** Jaring pengaman: saldo harus runtun antar-baris. */
export function reconcile(transaksi) {
  const mismatches = []
  for (let i = 1; i < transaksi.length; i++) {
    const s = transaksi[i - 1]
    const c = transaksi[i]
    const harus = s.saldo + c.penerimaan - c.pengeluaran
    if (Math.abs(harus - c.saldo) > 0.5) {
      mismatches.push({
        baris: i + 1, tanggal: c.tanggalStr, alasan: 'saldo_tak_runtun',
        harus, dapat: c.saldo,
      })
    }
  }
  const masuk = transaksi.reduce((a, t) => a + t.penerimaan, 0)
  const keluar = transaksi.reduce((a, t) => a + t.pengeluaran, 0)
  const awal = transaksi.length
    ? transaksi[0].saldo - transaksi[0].penerimaan + transaksi[0].pengeluaran : 0
  const akhir = transaksi.length ? transaksi[transaksi.length - 1].saldo : 0
  if (Math.abs(awal + masuk - keluar - akhir) > 0.5) {
    mismatches.push({ alasan: 'saldo_tak_runtun_total', harus: akhir, dapat: awal + masuk - keluar })
  }
  return { ok: mismatches.length === 0, mismatches, saldoAwal: awal, masuk, keluar, saldoAkhir: akhir }
}

/**
 * API utama.
 * @param {{items:Array, meta?:object}} fixture
 */
export function parseBkuFixture(fixture) {
  const semua = (Array.isArray(fixture) ? fixture : fixture.items || [])
    .filter((it) => it && typeof it.str === 'string' && it.str.trim())
  const kop = bacaKop(semua)
  const items = buangHeader(semua)
  const baris = barisPerHalaman(items)
  // Kalibrasi HANYA dari item yang benar-benar ada di dalam baris data.
  // Kalau ikut menghitung header, baris nomor kolom ("1 2 3 4 5 6 7 8")
  // bisa mengalahkan kolom rupiah dan membuat semua angka masuk 0.
  const itemsData = baris.flatMap((b) => b.items)
  const edges = kalibrasiNominal(itemsData)
  const mentah = baris.map((b) => barisMentah(b, edges)).filter(Boolean)
  // Perapian sebelum jadi transaksi (bkuPdfRapi.js): tahun salah baca
  // dipulihkan dari urutan dokumen, nominal salah digit dari rantai saldo,
  // lalu baris total tahunan ("... Jumlah") dibuang.
  const tahunDok = Number(kop.tahun) || modusTahun(mentah)
  perbaikiTanggalTakWajar(mentah, tahunDok)
  perbaikiNominalDariSaldo(mentah)
  const { rows: tanpaRingkasan, dilewati } = saringBarisRingkasan(mentah)
  // Uraian panjang yang membungkus 2 baris di PDF terbaca sebagai 2 baris
  // parser. Baris kedua digabung ke induknya (numerik induk tidak berubah).
  const { rows: rapi } = gabungBarisLanjutan(tanpaRingkasan)
  const bertipe = redetectTypes(rapi)

  const problems = [...dilewati]
  const transactions = bertipe.map(({ problems: p, ...row }) => {
    for (const jenis of p || []) {
      problems.push({ tanggal: row.tanggalStr, halaman: row.row, jenis })
    }
    return row
  })

  return {
    transactions,
    problems,
    dilewati,
    reconcile: reconcile(transactions),
    kop,
    meta: { ...(fixture.meta || {}), kolomAngka: edges, totalBaris: baris.length, tahunDokumen: tahunDok },
  }
}

export default { parseBkuFixture, reconcile, potongNominal }