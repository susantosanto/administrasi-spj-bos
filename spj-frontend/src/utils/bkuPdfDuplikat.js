/**
 * bkuPdfDuplikat.js — Sprint 016: penanda baris duplikat + ringkasan per bulan.
 *
 * Fungsi MURNI: tanpa React, tanpa storage, tanpa efek samping. Dipakai
 * `BKUUploadPdf.jsx` untuk (a) menandai baris yang identik — TIDAK membuangnya
 * (keputusan Idea Brief #3: tandai, user periksa), dan (b) meringkas per
 * (tahun, bulan) untuk kartu ringkasan + pilihan penyaring.
 */

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const teks = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim()
const angka = (n) => Number(n) || 0

/**
 * Kunci identitas satu baris: tanggal + noBukti + uraian + kedua nominal.
 * Baris dengan kunci sama dianggap duplikat.
 */
export function kunciDuplikat(r) {
  return [r.tanggalStr || '', teks(r.noBukti), teks(r.uraian),
    angka(r.penerimaan), angka(r.pengeluaran)].join('|')
}

/**
 * Tandai baris ke-2 dan seterusnya yang punya kunci sama.
 * Baris pertama tetap `duplikat: false` (dianggap asli). Array baru, input utuh.
 * @returns {Array} baris + { duplikat: boolean, urutanDuplikat: number }
 */
export function tandaiDuplikat(rows) {
  const seen = new Map()
  return (rows || []).map((r) => {
    const k = kunciDuplikat(r)
    const n = (seen.get(k) || 0) + 1
    seen.set(k, n)
    return { ...r, duplikat: n > 1, urutanDuplikat: n }
  })
}

/**
 * Ringkas per (tahun, bulan) — BUKAN per bulan saja, supaya saldo awal tahun
 * sebelumnya (mis. 31-12-2025) tidak bercampur dengan tahun dokumen.
 * @returns {Array<{kunci:string,bulan:number,tahun:number,namaBulan:string,
 *   jumlah:number,masuk:number,keluar:number,saldoAkhir:number}>}
 */
export function ringkasPerBulan(rows) {
  const grup = new Map()
  for (const r of rows || []) {
    const bulan = Number(r.bulan)
    const tahun = Number(r.tahun)
    if (!(bulan >= 1 && bulan <= 12) || !tahun) continue
    const kunci = `${bulan}-${tahun}`
    if (!grup.has(kunci)) {
      grup.set(kunci, { kunci, bulan, tahun, jumlah: 0, masuk: 0, keluar: 0, saldoAkhir: 0, _akhir: null })
    }
    const g = grup.get(kunci)
    g.jumlah++
    // Masuk/Keluar memakai DEFINISI RIIL yang SAMA dengan ringkasan
    // (hitungRingkasan / ADR §T): Masuk = PENERIMAAN_BOSP saja,
    // Keluar = PEMBAYARAN saja.
    //
    // Alasan: PPh 23 (PUNGUT_PPH masuk -> SETOR_PAJAK keluar) dan
    // pergeseran bank (PERGESERAN_BANK masuk -> TARIK_TUNAI keluar) adalah
    // lintas-akun: uang masuk lalu keluar lagi, bukan pendapatan/belanja.
    // Kalau ikut dijumlah, "Masuk" Agustus jadi 82.721.000 padahal dana
    // BOSP tahap 2 hanya 82.560.000 (selisih 161.000 = PPh 23).
    //
    // Dengan definisi riil, tiap bulan TETAP runtun:
    //   Masuk − Keluar = saldo akhir − saldo awal
    // (terverifikasi 9/9 bulan pada bku-output.pdf). Baris detail di tabel
    // bawah TETAP menampilkan semua transaksi, termasuk PPh/pergeseran.
    if (r.tipe === 'PENERIMAAN_BOSP') g.masuk += angka(r.penerimaan)
    if (r.tipe === 'PEMBAYARAN') g.keluar += angka(r.pengeluaran)
    // saldo akhir = saldo baris TERAKHIR menurut tanggal (bukan urutan array)
    const iso = r.tanggalISO || r.tanggalStr || ''
    if (!g._akhir || iso >= g._akhir.iso) {
      g._akhir = { iso, saldo: angka(r.saldo) }
      g.saldoAkhir = angka(r.saldo)
    }
  }
  return [...grup.values()]
    .map(({ _akhir, ...g }) => ({ ...g, namaBulan: NAMA_BULAN[g.bulan - 1] }))
    .sort((a, b) => a.tahun - b.tahun || a.bulan - b.bulan)
}
