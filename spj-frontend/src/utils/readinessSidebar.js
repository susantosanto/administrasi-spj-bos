/**
 * readinessSidebar — gate "Cek" untuk SIDEBAR BKU (Sprint 018, AD-2).
 *
 * Latar (K-10): input "Tanggal dana masuk" DIHAPUS dari form sidebar untuk semua
 * kategori LPJ. Field itu **tidak tercetak** di template mana pun — hanya
 * "menagih" lewat `readinessCheck` (`SummaryCard.jsx:20-26`). Kalau gate sidebar
 * tetap menagihnya → user tidak bisa pernah lolos, dan tombol "Cek" selalu
 * complaining atas field yang tak ada inputnya.
 *
 * `readinessCheck` dipakai juga oleh HALAMAN Dokumen LPJ (gate cetak) → file
 * `SummaryCard.jsx` **tidak boleh berubah**. Karena itu filter dibuat di modul
 * terpisah (ini), bukan di dalam `readinessCheck`.
 *
 * Fungsi MURNI: hanya menyaring daftar pelanggaran.
 */

/** fieldId dari `readinessCheck` yang tidak lagi bisa diisi di sidebar. */
export const FIELD_TIDAK_ADA_INPUT = ['f-tanggalDanaMasuk']

/**
 * Saring daftar pelanggaran untuk sidebar.
 * @param {Array} pelanggaran  hasil `readinessCheck(formData)`
 * @returns {Array} pelanggaran tanpa field yang tidak ada inputnya
 */
export function readinessSidebar(pelanggaran = []) {
  const list = Array.isArray(pelanggaran) ? pelanggaran : []
  return list.filter((v) => !FIELD_TIDAK_ADA_INPUT.includes(v?.fieldId))
}

export default { readinessSidebar, FIELD_TIDAK_ADA_INPUT }
