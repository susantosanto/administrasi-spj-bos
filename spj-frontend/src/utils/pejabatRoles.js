/**
 * Pejabat Roles — Satu sumber definisi peran pejabat sekolah
 *
 * Sebelumnya PEJABAT_ROLES didefinisikan terpisah di 2 halaman
 * (DataSekolahPage & PejabatSekolahPage) sehingga mudah menyimpang.
 * Modul ini jadi satu-satunya sumber.
 *
 * 6 peran: Kepala Sekolah, Bendahara, Pengawas Bina, Sekretaris Dinas,
 * Ketua Gugus, Notulen.
 */

/** Definisi peran pejabat — urutan = urutan tampil di UI */
export const PEJABAT_ROLES = [
  { key: 'ks', label: 'Kepala Sekolah', icon: 'person', color: 'primary' },
  { key: 'bendahara', label: 'Bendahara', icon: 'account_balance', color: 'primary' },
  { key: 'pengawas', label: 'Pengawas Bina', icon: 'supervisor_account', color: 'primary' },
  { key: 'sekdik', label: 'Sekretaris Dinas', icon: 'badge', color: 'primary' },
  { key: 'ketuaGugus', label: 'Ketua Gugus', icon: 'groups', color: 'primary' },
  { key: 'notulen', label: 'Notulen', icon: 'edit_note', color: 'primary' },
]

/**
 * Bentuk kosong pejabat — dipakai sebagai basis deep-merge.
 * Nilai sengaja KOSONG (bukan nama default) supaya dokumen tidak pernah
 * tercetak dengan nama orang yang salah.
 */
export const DEFAULT_PEJABAT = Object.fromEntries(
  PEJABAT_ROLES.map((r) => [r.key, { nama: '', nip: '' }])
)

/**
 * Deep-merge pejabat tersimpan dengan bentuk default.
 *
 * Wajib dipakai saat membaca `spj_data_sekolah.pejabat` supaya data LAMA
 * (yang belum punya role baru seperti `ketuaGugus`/`notulen`) tidak
 * menyebabkan `Cannot read properties of undefined`.
 *
 * @param {object|null|undefined} stored - pejabat dari localStorage
 * @returns {object} 6 peran, selalu lengkap
 */
export function mergePejabat(stored) {
  const out = {}
  for (const r of PEJABAT_ROLES) {
    out[r.key] = { ...DEFAULT_PEJABAT[r.key], ...(stored?.[r.key] || {}) }
  }
  return out
}
