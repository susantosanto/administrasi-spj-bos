/**
 * fotoReferensi.js — Sprint 027-verifikasi: normalisasi foto referensi (MURNI).
 *
 * Writer tunggal = PersonelFotoTab (keyed by ROLE id: kepsek/guru/tendik/
 * pengawas). SEMUA reader wajib lewat fungsi di sini — jangan baca
 * `personel_photos` langsung dengan asumsi bentuk lain (insiden key mismatch
 * by-nama 2026-11-02: wajah tidak pernah terkirim ke AI).
 */

/** Label peran — SAMA dengan PERSONEL_ROLES di PersonelFotoTab.jsx. */
export const PERAN_LABEL = {
  kepsek: 'Kepala Sekolah',
  guru: 'Guru',
  tendik: 'Tenaga Kependidikan',
  pengawas: 'Pengawas Sekolah',
}

/**
 * Daftar wajah terupload: [{ id, nama, jabatan, dataUrl }].
 * Entri tanpa dataUrl dilewati. Objek kosong → [] (bukan null).
 */
export function daftarWajahTerupload(personelPhotos) {
  return Object.entries(personelPhotos || {})
    .filter(([, v]) => v?.dataUrl)
    .map(([id, v]) => ({
      id,
      nama: PERAN_LABEL[id] || id,
      jabatan: PERAN_LABEL[id] || id,
      dataUrl: v.dataUrl,
    }))
}

/** Peta nama→dataUrl untuk perakitan faceImages. */
export function petaWajahTerupload(daftar) {
  return Object.fromEntries((daftar || []).map((o) => [o.nama, o.dataUrl]))
}

/** Fallback: nama entri pertama, atau null bila kosong. */
export function wajahFallback(daftar) {
  return daftar && daftar.length > 0 ? daftar[0].nama : null
}
