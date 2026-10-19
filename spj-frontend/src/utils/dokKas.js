/** dokKas.js — Helper ringkasan kas per bulan dari BKU (murni, offline).
 * Sumber: spj_bku_data.transactions (bkuParser.js) + spj_data_sekolah.
 * Rumus mirror sheet Data contoh App_Register-BA Kas:
 *   D (Penerimaan) = saldoAwal = saldo akhir bulan lalu
 *   K (Pengeluaran) = D - saldoAkhir
 *   A (Saldo Buku) = D - K = saldoAkhir
 */
export const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

export const bulanNameToNum = (nama) => {
  if (nama === '' || nama == null) return null
  const i = BULAN_ID.findIndex((b) => b.toLowerCase() === String(nama).toLowerCase())
  if (i >= 0) return i + 1
  // Toleran: angka 1-12 atau string "1".."12" (data lama) tetap dikenali.
  const n = Number(nama)
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : null
}

const num = (v) => Number(v ?? 0) || 0

/** Transaksi BKU bulan M (1-12), urut tanggal menaik. */
export function transaksiBulan(transactions = [], bulanNum) {
  const list = (transactions || []).filter((t) => Number(t?.bulan) === Number(bulanNum))
  return [...list].sort((a, b) => String(a.tanggalISO || '').localeCompare(String(b.tanggalISO || '')))
}

/** Saldo akhir bulan M = saldo transaksi terakhir (kolom T BKU). */
export function saldoAkhirBulan(transactions = [], bulanNum) {
  const list = transaksiBulan(transactions, bulanNum)
  if (list.length === 0) return null
  return num(list[list.length - 1].saldo)
}

/**
 * Ringkasan kas 1 bulan mirror F10/F11/F12 sheet Data.
 *   D (Penerimaan) = saldoAwal + dana BOSP masuk bulan ini
 *     (Jan: 0 + 82,56jt = 82,56jt; Feb: 82,56jt + 0 = 82,56jt)
 *   K (Pengeluaran) = D - saldoAkhir
 *   A (Saldo Buku) = saldoAkhir
 * @returns { adaData, D, K, A, saldoAkhir, tglTutupISO, tglLaluISO, jmlTx }
 */
export function ringkasanKasPerBulan(transactions = [], bulanNum) {
  const list = transaksiBulan(transactions, bulanNum)
  if (list.length === 0) return { adaData: false, D: 0, K: 0, A: 0, saldoAkhir: 0, tglTutupISO: '', tglLaluISO: '', jmlTx: 0 }
  const saldoAkhir = num(list[list.length - 1].saldo)
  const pertama = list[0]
  const saldoAwal = num(pertama.saldo) - num(pertama.penerimaan) + num(pertama.pengeluaran)
  const masukBosp = list.filter((t) => t?.tipe === 'PENERIMAAN_BOSP').reduce((s, t) => s + num(t.penerimaan), 0)
  const D = saldoAwal + masukBosp
  const K = D - saldoAkhir
  const tglTutupISO = String(list[list.length - 1].tanggalISO || '')
  const prev = bulanNum > 1 ? transaksiBulan(transactions, bulanNum - 1) : []
  const tglLaluISO = prev.length > 0 ? String(prev[prev.length - 1].tanggalISO || '') : ''
  return { adaData: true, D, K, A: saldoAkhir, saldoAkhir, tglTutupISO, tglLaluISO, jmlTx: list.length }
}

/** Total penerimaan riil BOSP (tipe PENERIMAAN_BOSP) — untuk validasi E6 = E9*2. */
export function totalPenerimaanBosp(transactions = []) {
  return (transactions || [])
    .filter((t) => t?.tipe === 'PENERIMAAN_BOSP')
    .reduce((s, t) => s + num(t.penerimaan), 0)
}

/** Total pengeluaran riil (tipe PEMBAYARAN) — untuk validasi realisasi. */
export function totalPengeluaranRiil(transactions = []) {
  return (transactions || [])
    .filter((t) => t?.tipe === 'PEMBAYARAN')
    .reduce((s, t) => s + num(t.pengeluaran), 0)
}

const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const TGL_KATA = { 1: 'satu', 2: 'dua', 3: 'tiga', 4: 'empat', 5: 'lima', 6: 'enam', 7: 'tujuh', 8: 'delapan', 9: 'sembilan', 10: 'sepuluh', 11: 'sebelas', 12: 'dua belas', 13: 'tiga belas', 14: 'empat belas', 15: 'lima belas', 16: 'enam belas', 17: 'tujuh belas', 18: 'delapan belas', 19: 'sembilan belas', 20: 'dua puluh', 21: 'dua puluh satu', 22: 'dua puluh dua', 23: 'dua puluh tiga', 24: 'dua puluh empat', 25: 'dua puluh lima', 26: 'dua puluh enam', 27: 'dua puluh tujuh', 28: 'dua puluh delapan', 29: 'dua puluh sembilan', 30: 'tiga puluh', 31: 'tiga puluh satu' }
const TAHUN_KATA = { 2024: 'Dua ribu dua puluh empat', 2025: 'Dua ribu dua puluh lima', 2026: 'Dua ribu dua puluh enam', 2027: 'Dua ribu dua puluh tujuh' }

/** Narasi BAP mirror kolom R Data: "Sabtu tanggal tiga puluh satu bulan Januari tahun Dua ribu dua puluh enam". */
export function teksTanggalPanjang(iso = '') {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''))
  if (!m) return ''
  const d = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10))
  if (isNaN(d.getTime())) return ''
  const hari = HARI_ID[d.getDay()]
  const tgl = TGL_KATA[parseInt(m[3], 10)] || m[3]
  const bulan = BULAN_ID[parseInt(m[2], 10) - 1] || ''
  const tahun = TAHUN_KATA[parseInt(m[1], 10)] || m[1]
  return `${hari} tanggal ${tgl} bulan ${bulan} tahun ${tahun}`
}

/** Format "31 Januari 2026" ala F7/H39 contoh (locale Indonesia — keputusan user
 * 2026-10-18: bahasa Indonesia; sumber xlsx date-format `[$-421]` = id-ID). */
export function formatTanggalContoh(iso = '') {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''))
  if (!m) return ''
  const ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  return `${parseInt(m[3], 10)} ${ID[parseInt(m[2], 10) - 1] || ''} ${m[1]}`
}

/** Denominasi kertas contoh: [100000, 50000, 20000, 10000, 5000, 2000, 1000]. */
export const NOMINAL_KERTAS = [100000, 50000, 20000, 10000, 5000, 2000, 1000]
/** Denominasi logam contoh: [1000, 500, 200, 100]. */
export const NOMINAL_LOGAM = [1000, 500, 200, 100]

/**
 * 11 baris pecahan Register Kas, urutan & id persis sumber (D16:D22 kertas,
 * D25:D28 logam). id stabil agar ketikan lama tetap cocok setelah di-merge.
 */
export const PECAHAN_DAFTAR = [
  ...NOMINAL_KERTAS.map((n) => ({ id: `k-${n}`, jenis: 'Kertas', nominal: n, satuan: 'Lembar' })),
  ...NOMINAL_LOGAM.map((n) => ({ id: `l-${n}`, jenis: 'Logam', nominal: n, satuan: 'Keping' })),
]

/**
 * Pecahan otomatis dari SALDO KAS TUNAI (fisik) — greedy: kertas terbesar
 * dulu (100.000→1.000), baru logam (1.000→100). Rp 1.000 dihitung sebagai
 * LEMBARAN KERTAS (kertas didahulukan, seperti kolom D sumber).
 *
 * Permintaan user 2026-10-18: "nilai jumlah lembar & keping fisik di dokumen
 * register kas tolong automasi terisi berdasarkan jumlah saldo kas tunai nya".
 * Ini matematika deterministik, bukan penilaian manusia — aman diotomasi.
 *
 * @param {number} nominal saldo tunai (Rp)
 * @returns {Object<string, number>} { 'k-100000': 3, 'l-100': 10, ... }
 */
export function pecahanDariSaldo(nominal = 0) {
  let sisa = Math.max(0, Math.floor(Number(nominal) || 0))
  const out = {}
  for (const d of PECAHAN_DAFTAR) {
    const jml = Math.floor(sisa / d.nominal)
    if (jml > 0) {
      out[d.id] = jml
      sisa -= jml * d.nominal
    }
  }
  return out
}

/**
 * Lembar/keping akhir: ketikan user MENANG per baris, kosong → otomatis dari
 * saldo tunai, tak ada → '' (dicetak 0 seperti sumber). Selalu 11 baris urut.
 *
 * @param {Array<{id:string, lembar:*}>} tersimpan spj_kas_form → RK.pecahan
 * @param {number} saldoTunai saldo kas tunai (fisik) Rp
 */
export function lembarPecahan(tersimpan = [], saldoTunai = 0) {
  const auto = pecahanDariSaldo(saldoTunai)
  const byId = new Map((Array.isArray(tersimpan) ? tersimpan : [])
    .filter((r) => r && r.id != null)
    .map((r) => [String(r.id), r]))
  return PECAHAN_DAFTAR.map((d) => {
    const t = byId.get(d.id)
    const ketikan = t ? String(t.lembar ?? '').trim() : ''
    const lembar = ketikan !== '' ? t.lembar : (auto[d.id] ?? '')
    return { ...d, lembar }
  })
}

/** Subtotal pecahan array: Σ nominal × lembar, per jenis (Kertas/Logam). */
export function subtotalPecahanJenis(pecahan = [], jenis) {
  return (Array.isArray(pecahan) ? pecahan : [])
    .filter((r) => r && r.jenis === jenis)
    .reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)
}

/** Subtotal pecahan: Σ nominal × lembar. */
export function subtotalPecahan(pecahan = {}) {
  return Object.entries(pecahan || {}).reduce((s, [nom, jml]) => s + (Number(nom) || 0) * (Number(jml) || 0), 0)
}

export default { BULAN_ID, bulanNameToNum, transaksiBulan, saldoAkhirBulan, ringkasanKasPerBulan, totalPenerimaanBosp, totalPengeluaranRiil, teksTanggalPanjang, formatTanggalContoh, NOMINAL_KERTAS, NOMINAL_LOGAM, PECAHAN_DAFTAR, pecahanDariSaldo, lembarPecahan, subtotalPecahanJenis, subtotalPecahan }
