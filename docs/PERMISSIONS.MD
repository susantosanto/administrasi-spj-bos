# PERMISSIONS.MD — Role & Aturan Akses

(Masih kosong — diisi oleh skill perencanaan yang relevan.)

## Kondisi Saat Ini (as adopted 2026-09-13)
- **Belum terdokumentasi adanya sistem auth/manajemen akses multi-user**
  (aplikasi localStorage-based tanpa backend; halaman `LoginPage.jsx` ada di kode,
  perilaku autentikasinya legacy — belum terdokumentasi)
- Konsep peran yang ada saat ini = **peran TTD dokumen**, bukan permission sistem:
  - `utils/signatureRoles.js` → `kepala-sekolah` (label, defaultName `BADRUDDIN, S.Ag.`,
    defaultNIP) dan peran penandatangan lain
  - Peran pengguna (Bendahara = penyusun/cetak, Kepala Sekolah = TTD) → lihat DOMAIN.MD
- Router paths (`/dashboard/*`) — guard/ proteksi halaman belum terdokumentasi (legacy)

Aturan akses baru (role, permission, guard) didokumentasikan di file ini saat dibangun.
