/**
 * BKU Helper — Ambil nominal transaksi dari data BKU (Buku Kas Umum)
 * untuk diisi otomatis ke dokumen LPJ (Honor / Transport).
 */
import storageHelper from './storageHelper'

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** Ambil semua transaksi BKU tersimpan */
export function getBkuTransactions() {
  const stored = storageHelper.get('bku_data', null)
  return stored?.transactions || []
}

/** Konversi nama bulan → angka (1-12) */
export function bulanNameToNum(name) {
  return name ? BULAN.indexOf(name) + 1 : null
}

/**
 * Cari nominal (pengeluaran) dari BKU untuk 1 penerima.
 * Cocokkan berdasarkan: pengeluaran > 0, bulan sama, uraian mengandung nama,
 * dan (opsional) kode rekening sesuai kategori.
 *
 * @param {Object} params
 * @param {string} params.nama - Nama penerima
 * @param {string} params.bulanName - Nama bulan (mis. 'Januari')
 * @param {string} [params.kodeRekeningPrefix] - Prefix kode rekening kategori
 * @returns {number|null}
 */
export function findBkuNominal({ nama, bulanName, kodeRekeningPrefix }) {
  const txs = getBkuTransactions()
  if (!nama) return null
  const n = bulanNameToNum(bulanName)
  const q = String(nama).toLowerCase()

  const matches = txs.filter((t) => {
    if (!t.pengeluaran || t.pengeluaran <= 0) return false
    if (n && t.bulan !== n) return false
    if (kodeRekeningPrefix && !String(t.kodeRekening || '').startsWith(kodeRekeningPrefix)) return false
    if (!String(t.uraian || '').toLowerCase().includes(q)) return false
    return true
  })

  if (matches.length === 0) return null
  return matches.reduce((s, t) => s + (t.pengeluaran || 0), 0)
}
