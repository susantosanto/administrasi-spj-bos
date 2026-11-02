/**
 * bkuMirip — kandidat baris BKU "mirip" untuk dropdown Sprint 018.
 *
 * Tujuan (K-1): dari satu baris belanja, user bisa melompat ke baris lain yang
 * **kode rekening + kode kegiatan sama** (bulan berbeda) untuk mencetak kegiatan
 * rutin tiap bulan tanpa mengisi form dari nol.
 *
 * Aturan (A-1, keputusan user "Kode rekening + kode kegiatan sama"):
 * - `kodeRekening` dan `kodeKegiatan` harus **identik** dan **tidak kosong**;
 * - **bulan berbeda** dari baris aktif;
 * - bukan baris aktif itu sendiri.
 * - Baris tanpa kode → **tidak ada** kandidat (0, bukan daftar asal).
 *
 * Fungsi MURNI: tidak menyentuh storage, tidak memanggil setState.
 */
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/** Nama bulan dari angka 1-12 (atau string angka). '' bila tidak dikenal. */
export function namaBulan(n) {
  const i = Number(n)
  return Number.isInteger(i) && i >= 1 && i <= 12 ? BULAN[i - 1] : ''
}

const bersih = (v) => String(v == null ? '' : v).trim()

/**
 * Kandidat baris yang mirip dengan `transaction`.
 * @param {Array}  allTransactions  seluruh transaksi BKU
 * @param {Object} transaction     baris aktif
 * @returns {Array} daftar kandidat (ringkas, siap dipakai dropdown)
 */
export function kandidatMirip(allTransactions = [], transaction = {}) {
  const rek = bersih(transaction.kodeRekening)
  const keg = bersih(transaction.kodeKegiatan)
  if (!rek || !keg) return []
  const bulanAktif = Number(transaction.bulan) || 0
  const list = Array.isArray(allTransactions) ? allTransactions : []
  return list
    .filter((t) => {
      if (!t) return false
      if (transaction.row != null && t.row === transaction.row) return false
      if (bersih(t.kodeRekening) !== rek) return false
      if (bersih(t.kodeKegiatan) !== keg) return false
      if (bulanAktif && Number(t.bulan) === bulanAktif) return false
      return true
    })
    .map((t) => ({
      row: t.row,
      noBukti: bersih(t.noBukti),
      bulan: t.bulan,
      bulanNama: namaBulan(t.bulan),
      tanggalStr: bersih(t.tanggalStr),
      uraian: bersih(t.uraian),
      pengeluaran: Number(t.pengeluaran) || 0,
    }))
}

/**
 * Label kandidat untuk dropdown: "Februari · #BNU-12 · Rapat Guru · Rp 1.500.000".
 * Bagian kosong ditampilkan kosong (jujur, bukan karangan).
 */
export function labelKandidat(t = {}) {
  const rp = (n) => `Rp ${(Number(n) || 0).toLocaleString('id-ID')}`
  return [
    t.bulanNama || namaBulan(t.bulan),
    t.noBukti ? `#${t.noBukti}` : '',
    t.uraian || '',
    t.pengeluaran ? rp(t.pengeluaran) : '',
  ].filter(Boolean).join(' · ')
}

/**
 * Alasan dropdown kosong (pesan jujur untuk UI).
 * @returns {string} teks singkat
 */
export function alasanKosong(transaction = {}) {
  if (!bersih(transaction.kodeRekening) && !bersih(transaction.kodeKegiatan)) {
    return 'Baris ini belum punya kode rekening & kode kegiatan — tidak ada baris yang bisa dicocokkan.'
  }
  if (!bersih(transaction.kodeRekening)) {
    return 'Baris ini belum punya kode rekening — tidak ada baris yang bisa dicocokkan.'
  }
  if (!bersih(transaction.kodeKegiatan)) {
    return 'Baris ini belum punya kode kegiatan — tidak ada baris yang bisa dicocokkan.'
  }
  return 'Tidak ada baris lain dengan kode rekening & kode kegiatan yang sama di bulan berbeda.'
}

export default { kandidatMirip, labelKandidat, alasanKosong, namaBulan }
