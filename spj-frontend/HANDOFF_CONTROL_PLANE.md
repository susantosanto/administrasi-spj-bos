# Handoff dari agent Control Plane ASIK

**Tanggal:** 2026-11-02
**Untuk:** agent yang mengerjakan `spj-frontend`

Repo ini sudah diubah langsung oleh agent Control Plane. Tidak ada pesan lintas-agent;
baca file ini + `git diff` sebelum melanjutkan agar tidak menimpa pekerjaan.

## File yang berubah

| File | Status | Isi |
|---|---|---|
| `src/pages/RegisterPage.jsx` | modified | field username/password/konfirmasi + popup kartu lisensi |
| `src/pages/LoginPage.jsx` | modified | verifikasi login ke akun lokal |
| `src/utils/localAccount.js` | baru | simpan/verifikasi akun lokal (hash password) |
| `src/components/LicenseCardModal.jsx` | baru | popup kartu lisensi + Cetak + Download PNG |

Catatan: `D src/components/layout/LicenseBanner.jsx` **bukan** dari agent Control Plane.
Jangan di-restore tanpa konfirmasi user.

## Perilaku baru

1. `/daftar`: user wajib mengisi `Username` (3–32, huruf/angka/`.`/`_`/`-`),
   `Password` (min 8, huruf + angka), `Konfirmasi Password`.
   Password tidak dikirim ke Control Plane dan tidak disimpan di `registration_pending`.
2. Registrasi sukses → popup "Selamat, registrasi Anda berhasil!" berisi kartu:
   sekolah, NPSN, kode lisensi, status, masa berlaku, **username & password**.
   Tombol: Cetak Kartu (iframe print), Download PNG (canvas), Buka Dashboard.
3. `localAccount.saveLocalAccount()` menyimpan `{ username, passwordHash, name, email }`
   di `spj_local_account` dan mengisi `spj_auth_user`. Hash: `sha256:` (fallback `fnv:`
   bila Web Crypto tidak tersedia).
4. `/login` memverifikasi username+password ke akun lokal. Instalasi lama tanpa akun
   lokal tetap memakai perilaku lama (username/password apa pun) agar tidak terkunci.

## Kontrak dengan Control Plane (sudah disesuaikan)

- `POST /public/register` **tidak berubah** — tidak menerima password.
- `GET /device/sync/pull` sekarang mengembalikan key **snake_case**
  (`data_sekolah`, `data_guru`, `data_tendik`, `auth_user`, `notes`, `spj_nomor_surat`),
  sesuai `SYNC_KEYS` di `src/services/syncService.js`. Sebelumnya camelCase dan
  membuat `pull()` membuang semua update.

## Verifikasi yang sudah dilakukan

- `npm run build` sukses (0 error), route `/daftar` 200.
- Uji integrasi HTTP Control Plane ↔ sync klien: 5/5 PASS.
- Belum ada uji UI otomatis (tidak ada browser driver di repo ini).

## Sisa / saran

- Belum ada reset password lokal; password hanya terlihat saat popup registrasi.
- Perlu uji manual: daftar → popup → cetak/download → login pakai kredensial tersebut.
- Jika mengubah nama key sync, samakan dengan `apps/api/src/modules/sync/sync.service.ts`
  di repo Control Plane.
