# 📌 KEPUTUSAN FINAL — Akun, Lisensi & Aktivasi Aplikasi SPJ

> **Status:** TERKUNCI (final) — 13 November 2026
> **Fungsi file:** Sumber kebenaran (single source of truth) untuk membangun fitur
> **login/aktivasi** di aplikasi SPJ (`spj-frontend` → Electron) dan backend Supabase
> yang menyertainya. Jika ada implementasi yang bertentangan dengan file ini,
> **file inilah yang benar**.
> **Konteks:** Aplikasi SPJ = Electron + SQLite (lokal per sekolah). Backend pusat =
> Supabase (Free tier) + keep-alive ping harian. TANPA fingerprint laptop.

---

## 1. KEPUTUSAN DASAR (TERKUNCI)

| # | Keputusan | Nilai Final |
|---|---|---|
| D1 | Model lisensi | **1 NPSN = 1 lisensi = 1 akun = 1 kali bayar seumur hidup** |
| D2 | Trial 14 hari | **TIDAK ADA di produksi.** Demo hanya di laptop owner, sebelum produksi. Alur produksi mulai dari "daftar pertama" |
| D3 | Harga | **Seragam, TANPA diskon/paket multi-NPSN.** Operator 4 sekolah = beli 4 lisensi normal |
| D4 | Perpindahan antar-sekolah | Operator multi-sekolah memegang beberapa akun. Ganti sekolah = **Keluar → Masuk** dengan akun sekolah lain (pola familiar BOS Online/ARKAS) |
| D5 | Pengikat perangkat | **TANPA fingerprint laptop.** Pengganti: (a) ikatan NPSN pada lisensi/akun, (b) device slot lembut (ID acak, bukan hardware), maks 2–3 slot aktif per lisensi + tombol self-service "Pindah Perangkat" |
| D6 | Identitas sekolah di app | **App mulai KOSONG (upload-first).** Identitas sekolah TERBENTUK dari upload pertama (Data Sekolah Dapodik / BKU ARKAS), bukan bawaan app |
| D7 | Penghalang antar-sekolah | **NPSN Gate** (detail bagian 3) — bukan fingerprint, bukan pengetikan bebas |
| D8 | Backend pusat | **Supabase Free** + GitHub Actions ping 1x/hari (anti-pause) + UptimeRobot (monitor luar) |
| D9 | Kuota AI | **Wajib dihitung server-side** (Edge Function proxy AI + tabel counter). Kunci API provider TIDAK PERNAH ada di aplikasi klien |
| D10 | Logging error | Tabel `error_logs` + endpoint `POST /client-errors`; digest harian via GitHub Actions; UptimeRobot untuk deteksi server down |
| D11 | Update aplikasi | Auto-update Electron (electron-updater); heartbeat melaporkan `appVersion`; server dapat menandai `update_required` |
| D12 | Email (reminder/reset password) | Via HTTP API (mis. Resend) — bukan SMTP, karena Edge Functions tidak mendukung nodemailer |

---

## 2. ALUR RESMI PRODUKSI (dari nol)

```
A. PEMBELIAN (luar aplikasi)
   Form: Nama Sekolah + NPSN + WA/Email operator
   → Bayar 1x (Midtrans QRIS/VA) → webhook → PAID
   → Sistem buat: Lisensi (terikat NPSN) + layanan akun operator
   → Kirim Kode Lisensi (format ASIK-XXXX-XXXX-XXXX) via WA/email

B. AKTIVASI PERTAMA (di aplikasi)
   Layar aktivasi: masukkan Kode Lisensi + NPSN (diketik ulang, bukan copy)
   → Server validasi: lisensi ada? NPSN cocok? slot device tersedia?
   → Berhasil → setel akun (username + password pertama kali)
   → App simpan token aktivasi (JWT, berisi NPSN) → dashboard kosong terbuka

C. ONBOARDING (app kosong → dibangun lewat upload)
   1. Upload Data Sekolah (Excel Dapodik)  ← profil sekolah terisi otomatis
   2. Upload Data Guru & Tendik
   3. Upload BKU (Excel/PDF ARKAS)
   4. Isi pejabat (Kepsek/Bendahara) + logo (opsional)

D. PEMAKAIAN (loop)
   - Tiap buka app → silent check lisensi (cache: kalau server tak terjangkau,
     pakai status terakhir — aplikasi TIDAK dikunci paksa saat internet mati)
   - Semua upload → lewat NPSN Gate (bagian 3)
   - Kop dokumen SPJ → DITARIK dari profil, tidak bisa diketik bebas

E. GANTI SEKOLAH (operator multi-sekolah)
   Menu Akun → Keluar → layar login → akun sekolah lain

F. PERAWATAN
   Error app → error_logs → digest harian ke owner → perbaiki → rilis versi baru
   → app mendeteksi update → unduh + install otomatis
```

---

## 3. ATURAN EMAS: NPSN GATE (kunci keamanan utama)

**Prinsip:** satu-satunya pintu masuk data ke app adalah UPLOAD, dan setiap upload
dipolisi NPSN. Tidak ada pintu lain.

```
ATURAN: NPSN di file yang di-upload HARUS = NPSN akun yang sedang login.

Kasus 1 — Upload PERTAMA (app masih kosong):
  NPSN file ≠ NPSN lisensi → TOLAK sebelum satu data pun masuk,
  pesan edukatif: "File ini kop-nya NPSN <X> (<Nama Sekolah B>).
  Lisensi Anda untuk NPSN <Y> (<Nama Sekolah A>).
  Operator di sekolah lain? Keluar → Masuk dengan akun sekolah itu."

Kasus 2 — Upload berikutnya (profil sudah ada):
  NPSN file dicek ke DUA sumber:
    1) NPSN akun/lisensi (server)
    2) NPSN profil tersimpan di app (SQLite)
  beda salah satu → tolak + catat ke error_logs.

Kasus 3 — NPSN tidak terbaca (file rusak):
  → TIDAK otomatis ditolak, tapi WAJIB konfirmasi manual:
    "NPSN tidak terbaca di file. Pastikan file ini milik
     <Nama Sekolah A> (NPSN <Y>)?"
  Hasil konfirmasi tetap dicatat (event).

Lapis server (polisi kedua):
  Saat sync/heartbeat/aktivitas, app melaporkan NPSN-aktivitas.
  Server cek NPSN itu milik lisensi/akun yang bersangkutan.
  Pelanggaran (mis. konfirmasi manual salah) → tolak + catat audit/error_logs.

Dokumen keluar:
  Kop surat SPJ otomatis dari profil/lisensi — operator TIDAK BISA
  mengetik NPSN/nama sekolah lain di kop.
```

**Fakta kode pendukung (sudah ada):** `bkuParser.js` membaca NPSN dari kop BKU
(baris 5, format 8 digit) — `bkuParser.js` line 32–348. Gate tinggal memakai
nilai `header.npsn` hasil parse.

---

## 4. KONTRAK BACKEND (Supabase) — endpoint yang dibutuhkan

Base URL: `VITE_CP_API` / override `localStorage spj_cp_api` (sudah ada di
`cpClient.js`). Format respons error tetap seperti `cpClient.js` sekarang:
`{ message: "KODE_ERROR", ... }` + HTTP status.

| Endpoint | Fungsi | Catatan penting |
|---|---|---|
| `POST /public/register` | Daftar + bayar → buat lisensi+akun | idempoten per NPSN (`NPSN_ALREADY_EXISTS`) |
| `POST /auth/activate` | Aktivasi: `{licenseCode, npsn}` → token JWT (berisi NPSN) + info akun | TANPA fingerprint; device slot lembut |
| `POST /auth/login` | Login akun (username/email + password) → token | Kode error: `INVALID_CREDENTIALS` |
| `POST /auth/forgot-password` / `POST /auth/reset-password` | Reset via WA/email | WAJIB ADA (mencegah drama "lupa password") |
| `POST /auth/logout` | Cabut token sesi | Hapus token lokal di klien |
| `GET /device/status` | Pengganti heartbeat ringan: `{status, readOnly, validUntil, updateRequired}` | klien cache jika gagal (`unreachable`) |
| `POST /device/sync/push`, `GET /device/sync/pull` | Sync metadata | whitelist + scrub TIDAK berubah (lihat bagian 5) |
| `POST /ai/proxy` | Proxy AI + counter kuota per lisensi | kuota DILARANG dihitung di klien |
| `POST /webhooks/payment/midtrans` | Webhook bayar (SHA512, idempoten) | → PAID → lisensi aktif (lifetime) |
| `POST /client-errors` | Terima error dari app → tabel `error_logs` | tanpa data LPJ/keuangan |
| `GET /health` (untuk UptimeRobot + ping GitHub Actions) | Anti-pause + monitoring | 1x/hari cukup |

**Kode error yang wajib dipertahankan** (klien `cpClient.js` sudah menampilkan
pesannya): `NPSN_ALREADY_EXISTS`, `LICENSE_NOT_FOUND`, `DEVICE_LIMIT_REACHED`,
`SUSPENDED`, `EXPIRED`, `NPSN_MISMATCH` (baru — untuk gate), `INVALID_CREDENTIALS`.

---

## 5. SYNC: DATA YANG BOLEH/TIDAK KE SERVER (tidak berubah)

- ✅ **Boleh** (whitelist): `data_sekolah`, `profil_sekolah`, `pejabat_sekolah`,
  `data_guru`, `data_tendik`, `auth_user` (HANYA `name`+`role`), `notes`,
  `spj_nomor_surat`
- ❌ **DILARANG**: `bku_data`/realisasi (keuangan), isi dokumen LPJ, `logo_*`,
  kredensial/password/token apa pun
- Server: batas 64 KB, kedalaman 6, array ≤500, scrub field sensitif
  (`pass|secret|token|api key|credential|pin`)
- Sumber: `syncService.js` (SYNC_KEYS) + `sync.service.ts` (whitelist) — jangan diubah.

---

## 6. SPESIFIK FITUR LOGIN/AKTIVASI (untuk implementasi di repo ini)

### 6.1 Kondisi layar
| Kondisi | Layar |
|---|---|
| Belum ada token aktivasi (first run / setelah logout) | **Layar Aktivasi** → input Kode Lisensi + NPSN + (pertama kali) buat username/password |
| Sudah punya token, belum login | **Layar Login** → username + password (+ "Lupa Password") |
| Token valid & sudah login | Dashboard (app kosong → onboarding checklist) |

### 6.2 Penyimpanan lokal (pola `storageHelper`, prefix `spj_`)
| Key | Isi |
|---|---|
| `license_code` | kode lisensi |
| `license_npsn` | NPSN yang terikat (sumber gate lokal) |
| `license_token` | JWT aktivasi |
| `device_id` | ID acak perangkat (BUKAN hardware fingerprint) |
| `license_status` | cache status terakhir `{status, readOnly, validUntil, checkedAt, unreachable}` |
| `sync_last_push/pull/apply` | jejak sinkron (sudah ada) |

### 6.3 Aturan perilaku (wajib)
1. **NPSN Gate di klien**: fungsi util `assertNpsnMatches(parsedNpsn)` — dipanggil
   di handler upload `DataSekolahPage`, `BKUPage` (Excel & PDF), `DataGuruPage`
   SEBELUM data ditulis ke storage. Sumber pembanding: `license_npsn`
   (dan profil tersimpan untuk upload berikutnya).
2. **Offline tidak boleh mengunci**: gagal kontak server → pakai `license_status`
   cache (pola `licenseService.js` sekarang: `unreachable: true`), TIDAK memaksa
   read-only.
3. **Logout**: hapus `license_token` + sesi UI; JANGAN menghapus data SQLite
   per NPSN (data sekolah tetap aman).
4. **Tidak ada fingerprint**: jangan baca serial/hostname/macam hardware.
   `device_id` = `crypto.randomUUID()` acak (pola `cpClient.js` sekarang — sudah benar).
5. **Kop dokumen**: selalu dari profil (`data_sekolah` hasil upload) — larang
   edit manual NPSN/nama sekolah di template kop.
6. **Password**: tidak pernah dikirim ke server sync; akun = tanggung jawab
   endpoint auth (hash server-side, argon2/bcrypt di Supabase).

### 6.4 Kriteria selesai (DoD) fitur login/aktivasi
- [ ] Aktivasi dengan kode+NPSN cocok → dashboard terbuka, token tersimpan
- [ ] Aktivasi dengan NPSN salah → pesan jelas, tidak ada token diterbitkan
- [ ] Login/logout berfungsi; logout tidak menghapus data sekolah
- [ ] Lupa password → reset via email/WA berfungsi
- [ ] Upload BKU dengan NPSN sekolah lain → TERTOLAK dengan pesan arahan
      (termasuk kasus operator multi-sekolah)
- [ ] Upload pertama saat app kosong → profil sekolah terisi otomatis dari file
- [ ] Server tak terjangkau → app tetap jalan dengan cache status (tidak terkunci)
- [ ] `error_logs` menerima error aktivasi/gate dari klien
- [ ] Tidak ada satu pun fingerprint hardware yang dibaca/dikirim

---

## 7. PENGUASAAN BIAYA (keputusan pendukung)

| Item | Keputusan |
|---|---|
| Backend | Supabase **Free** ($0) — cukup untuk <200 sekolah (500 MB >> kebutuhan) |
| Anti-pause | GitHub Actions ping 1x/hari (`/health`) + UptimeRobot free |
| Email | Resend (tier gratis) untuk reset password & notifikasi |
| Kuota AI | Free tier provider AI dulu; proxy di Edge Function |
| Saat >200 sekolah / butuh nyaman | Naik Supabase Pro $25/bln (~2% revenue) atau CF Workers — keputusan NANTI, bukan sekarang |

---

## 8. YANG TIDAK DIPUTUSKAN DI FILE INI (jangan diubah tanpa rapat owner)

- Harga nominal lisensi lifetime (cukup: "3–5x setahun, update besar v2.0 = upsell terpisah")
- Penyusunan UI/UX visual (DESIGN.md / tailwind tetap SSOT visual)
- Provider AI final (Gemini/GROQ/Cerebras) — hanya keputusan arsitekturnya yang terkunci (D9)

---

*Referensi riset biaya/arsitektur: percakapan riset 13 Nov 2026 (Keygen, Lemon Squeezy,
Cryptolens, Supabase, Cloudflare — harga resmi per Nov 2026; periksa ulang saat kontrak).*
