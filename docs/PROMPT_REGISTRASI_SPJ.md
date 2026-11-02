# PROMPT — Registrasi Sekolah dari Aplikasi SPJ ke ASIK Control Plane

> Kirimkan file ini ke agent yang mengerjakan aplikasi SPJ (`spj-frontend`). // Sampai di sini, endpoint di Control Plane sudah aktif di `http://localhost:4000`.
> Paste ke agent yang mengerjakan `spj-frontend` (aplikasi ASIK versi sekolah).
> Endpoint di Control Plane sudah AKTIF dan TERUJI di `http://localhost:4000`.
> Kode terkait CP: module `apps/api/src/modules/public/` di repo `Control Plane ASIK`.

## Konteks

Aplikasi ASIK versi sekolah sekarang punya alur registrasi baru: setelah berhasil mendaftar,
sekolah user otomatis terdaftar di ASIK Control Plane (server pusat lisensi) sebagai
`School` + `License` status `TRIAL` (14 hari), lalu langsung aktifkan device.

## Endpoint yang tersedia di CP

### 1) `POST http://localhost:4000/public/register`
Tanpa autentikasi. Rate limit 5/menit/IP (jangan spam — simpan payload sampai responsnya jelas).

Request (JSON, semua wajib kecuali `phone` & `address`):
```json
{
  "schoolName": "SDN Uji Integrasi",
  "npsn": "12345678",            // tepat 8 digit angka
  "operatorName": "Andi Operator",
  "email": "operator@sekolah.sch.id",
  "phone": "0812xxx",            // opsional
  "address": "Jl. ..."           // opsional
}
```

Respons sukses (201):
```json
{
  "schoolId": "<uuid>",
  "licenseCode": "ASIK-6805-FE85-C1BA",
  "status": "TRIAL",
  "trialDays": 14,
  "endDate": "2026-11-15T07:11:16.972Z"
}
```

Error yang WAJIB ditangani:
- `409` body `NPSN_ALREADY_EXISTS` → tampilkan pesan: "NPSN 12345678 sudah terdaftar. Gunakan 'Masuk' /
  'Hubungkan lisensi'; jika berasal dari device lain, hubungi admin pusat."
- `403` body `DEVICE_LIMIT_REACHED` → batas perangkat lisensi penuh; pesan ramah user.
- `400` → pesan validasi field (array di `message`)
- `429` → "Terlalu banyak percobaan. Coba lagi dalam satu menit." (JANGAN retry otomatis di atas 1x)
- Timeout/jaringan gagal → data form tetap disimpan lokal (storageHelper key `spj_registration_pending`) agar user bisa kirim ulang tanpa isi ulang.

### 2) `POST http://localhost:4000/device/activate`
Dipanggil langsung setelah register sukses (jangan minta user input kode manual).

Header:
- `x-license-code`: nilai `licenseCode` dari respons register
- `x-app-version`: versi aplikasi, mis. `1.0.0`

Body:
```json
{ "fingerprint": "<fingerprint device stabil>", "appVersion": "1.0.0" }
```

Respons sukses (201): `{ "licenseToken": "<JWT>", ... }` → simpan `licenseToken` + `licenseCode`
via storageHelper (`spj_license_token`, `spj_license_code`).

### 3) `POST http://localhost:4000/device/heartbeat`
Header: `x-license-code`, `x-device-fingerprint`. Body: `{ "status": "ok", "appVersion": "..." }`.
Respons: `{ "status": "TRIAL", "readOnly": false, "validUntil": "..." }`.
Mode `readOnly: true` → kunci fitur editor LPJ (tetap boleh lihat/cetak).

## Tugas di aplikasi SPJ (`spj-frontend`)

1. **Halaman `RegisterPage.jsx`** (route `/daftar`), gaya Premium Blue mengikuti `LoginPage.jsx`:
   card glass, mesh gradient, font & warna konsisten.
   Field: **Nama Sekolah, NPSN (8 digit), Nama Operator, Email**, opsional No. HP & Alamat.
   Kontrawan validasi client: NPSN harus 8 digit, email format, minimal 2 karakter lainnya.
2. **Link "Daftar" dari LoginPage** → `/daftar`; di RegisterPage ada "Sudah punya lisensi? Masuk".
3. Setelah sukses:
   - `storageHelper.set("license_pending", { licenseCode, schoolId, endDate })`
   - Panggil otomatis `POST /device/activate` (2), simpan `licenseToken`.
   - Toast sukses + banner trial: "Masa percobaan 14 hari, berlaku sampai [endDate]".
   - Ke `/dashboard`.
4. **Fingerprint device**: impor/boolahkan helper `src/services/fingerprint.js` yang menyimpan
   ID perangkat stabil di storageHelper (`spj_device_id`, dibuat sekali pakai `crypto.randomUUID()`).
5. **Sinkron UI**: setelah aktivasi, di `PengaturanPage` tampilkan status lisensi
   (TRIAL/ACTIVE, validUntil, readOnly) — boleh memakai endpoint `/device/heartbeat` atau
   `/device/sync/status` (GET, header yang sama).
6. DataBKU/LPJ TIDAK dikirim ke CP — hanya identitas di atas (sesuai PRD: pusat tidak boleh
   menyimpan data keuangan).

## Yang TIDAK boleh
- Tidak menghindari validasi server-side; tidak menyimpan email/password user di CP.
- Tidak membuat retry loop / queue spam saat 429.
- Tidak mengubah `spj_auth` mock: boleh tetap dipakai untuk sesi lokal, tapi setelah
  registrasi sukses simpan juga data lisensi untuk penyambungan berikutnya.

## Pengujian yang diharapkan
- Registrasi sekolah baru → sukses, otomatis aktivasi, banner trial muncul.
- Registrasi ulang NPSN sama → pesan `NPSN_ALREADY_EXISTS` yang ramah user.
- NPSN 5 digit / email tidak valid → blok di form (client) + tampilkan 400 (server) kalau lolos.
- Regenerasi: pastikan tombol submit disabled saat loading; pesan timeout tetap menyimpan draf
  input di lokal (`spj_registration_pending`).
