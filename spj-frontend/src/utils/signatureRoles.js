/**
 * Signature Roles — Konfigurasi Tanda Tangan
 *
 * Membaca dari Data Sekolah → tab Pejabat Sekolah.
 *
 * Bentuk **fungsi** (bukan konstanta) supaya nilai dibaca saat render —
 * konstanta level-modul menyebabkan bug "nilai basi": nama pejabat dibekukan
 * saat aplikasi dimuat, sehingga perubahan Data Sekolah tidak ikut tercetak
 * sampai halaman di-reload.
 *
 * Tanpa fallback hardcoded: bila pejabat belum diisi, nilai kosong dan
 * `blocks/PeringatanData.jsx` yang memberi tahu pengguna.
 */
import { getPejabat, getSchoolData } from './sekolahData'

/**
 * Peta peran tanda tangan → sumber data pejabat.
 *
 * `pimpinan` dan `kepala-sekolah` sama-sama memakai Kepala Sekolah;
 * `ketua-gugus` punya sumber SENDIRI (ketuaGugus), bukan Kepala Sekolah —
 * keduanya orang yang berbeda.
 */
const ROLE_SOURCES = {
  'kepala-sekolah': { label: 'Kepala Sekolah,', pejabat: 'ks' },
  'bendahara': { label: 'Bendahara BOS,', pejabat: 'bendahara' },
  'pimpinan': { label: 'Pimpinan Rapat/Kepala Sekolah,', pejabat: 'ks' },
  'notulen': { label: 'Notulen,', pejabat: 'notulen' },
  'ketua-gugus': { label: 'Ketua Gugus,', pejabat: 'ketuaGugus' },
}

/**
 * Ambil konfigurasi tanda tangan untuk semua peran.
 *
 * Format TTD 4 baris (keputusan user 2026-10-06): Kepala / nama SD /
 * nama orang / NIP. `sekolah` dibaca live dari Data Sekolah agar
 * preview + cetak selalu sama tanpa reload.
 *
 * @returns {Record<string, {label: string, nama: string, nip: string, sekolah: string}>}
 */
export function getSignatureRoles() {
  const sekolah = getSchoolData().namaSekolah || ''
  const out = {}
  for (const [role, cfg] of Object.entries(ROLE_SOURCES)) {
    const pejabat = getPejabat(cfg.pejabat)
    out[role] = {
      label: cfg.label,
      nama: pejabat.nama,
      nip: pejabat.nip,
      sekolah,
    }
  }
  return out
}

/** Peran yang TTD-nya memakai format 4 baris (Kepala/SDL/Nama/NIP). */
export const KS_ROLES = ['kepala-sekolah', 'pimpinan']
