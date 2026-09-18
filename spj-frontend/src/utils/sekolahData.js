/**
 * Sekolah Data — Akses identitas sekolah & pejabat
 *
 * Membaca dari localStorage (halaman Data Sekolah, prefix `spj_`).
 *
 * Prinsip sprint 001: **tidak ada nilai identitas yang diam-diam diisi**.
 * Bila data belum diisi, fungsi mengembalikan string kosong — bukan nama
 * sekolah/orang hardcoded. Peringatan merah (`blocks/PeringatanData.jsx`)
 * yang memberi tahu pengguna, bukan dokumen yang mencetak nama orang lain.
 *
 * Semua fungsi membaca storage **saat dipanggil** (bukan saat import) supaya
 * nilai tidak basi setelah Data Sekolah diubah tanpa reload.
 */
import storageHelper from './storageHelper'
import { PEJABAT_ROLES } from './pejabatRoles'

/**
 * Cari nilai field di `allFields` berdasarkan label (regex).
 *
 * Diperlukan karena `LABEL_MAP` (sekolahParser.js) tidak memuat semua key —
 * mis. `email` tidak pernah masuk `data.email` walau sudah ada di `allFields`.
 * Dengan resolver ini data yang SUDAH ter-upload langsung terbaca.
 *
 * @param {Array<{label?: string, value?: string}>|undefined} allFields
 * @param {RegExp} regex - pola label, mis. /email/i
 * @returns {string} nilai, atau '' bila tidak ditemukan
 */
export function findFieldByLabel(allFields, regex) {
  if (!Array.isArray(allFields)) return ''
  const hit = allFields.find((f) => f && typeof f.label === 'string' && regex.test(f.label))
  return hit?.value || ''
}

/**
 * Ambil nilai identitas: utamakan key tersimpan, jatuh ke `allFields` by label.
 */
function pick(stored, key, allFields, regex) {
  return stored?.[key] || findFieldByLabel(allFields, regex) || ''
}

/**
 * Get identitas sekolah dari localStorage.
 * Tidak ada fallback — nilai kosong dikembalikan apa adanya.
 */
export function getSchoolData() {
  const stored = storageHelper.get('data_sekolah', null)
  const allFields = stored?.allFields

  return {
    namaSekolah: stored?.namaSekolah || '',
    npsn: stored?.npsn || '',
    alamat: stored?.alamat || '',
    email: pick(stored, 'email', allFields, /email/i),
    telepon: pick(stored, 'telepon', allFields, /nomor telepon|telepon/i),
    website: pick(stored, 'website', allFields, /website/i),
    kabupaten: stored?.kabupaten || '',
    provinsi: stored?.provinsi || '',
    kecamatan: stored?.kecamatan || '',
    kelurahan: stored?.kelurahan || '',
    kodePos: stored?.kodePos || '',
    // Data Gugus (US-18) — dipakai kop gugus pada surat undangan
    gugusNama: stored?.gugusNama || '',
    gugusAlamat: stored?.gugusAlamat || '',
  }
}

/**
 * Get pejabat berdasarkan role.
 * @param {string} role - salah satu key PEJABAT_ROLES
 * @returns {{nama: string, nip: string}}
 */
export function getPejabat(role) {
  const stored = storageHelper.get('data_sekolah', null)
  const pejabat = stored?.pejabat?.[role]
  return {
    nama: pejabat?.nama || '',
    nip: pejabat?.nip || '',
  }
}

/**
 * Daftar peran pejabat yang masih kosong (tidak punya nama).
 * Bahan peringatan merah US-15.
 *
 * @returns {Array<{key: string, label: string}>}
 */
export function getPejabatStatus() {
  const stored = storageHelper.get('data_sekolah', null)
  const pejabat = stored?.pejabat || {}
  return PEJABAT_ROLES.filter((r) => !pejabat?.[r.key]?.nama).map((r) => ({
    key: r.key,
    label: r.label,
  }))
}

/** Apakah identitas sekolah sudah diisi (minimal nama sekolah). */
export function isSchoolDataEmpty() {
  const stored = storageHelper.get('data_sekolah', null)
  return !stored?.namaSekolah
}

/**
 * Get Kepala Sekolah. Tanpa fallback hardcoded.
 * @returns {{nama: string, nip: string}}
 */
export function getKepalaSekolah() {
  return getPejabat('ks')
}

/**
 * Get Bendahara. Tanpa fallback hardcoded.
 * @returns {{nama: string, nip: string}}
 */
export function getBendahara() {
  return getPejabat('bendahara')
}
