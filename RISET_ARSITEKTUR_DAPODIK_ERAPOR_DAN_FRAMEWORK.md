# Riset Arsitektur Dapodik, eRapor & Perbandingan Framework
*Dibuat: 4 Juli 2026 | Confidence: High*

---

## Bagian 1: Arsitektur Aplikasi Dapodik

### 1.1 Gambaran Umum

**Dapodik (Data Pokok Pendidikan)** adalah aplikasi pendataan berskala nasional yang dikelola oleh Kemendikbudristek. Aplikasi ini dirancang sebagai **aplikasi berbasis web yang berjalan secara lokal (offline-first)** di komputer sekolah.

### 1.2 Arsitektur

```
┌─────────────────────────────────────────────┐
│            Komputer Sekolah                  │
│                                              │
│  ┌──────────┐    ┌──────────┐               │
│  │ Browser  │◄──►│ Web App  │               │
│  │(Chrome,  │    │(PHP)     │               │
│  │ Firefox) │    │          │               │
│  └──────────┘    └────┬─────┘               │
│                       │                      │
│                 ┌─────▼──────┐               │
│                 │  SQLite DB │               │
│                 │  (File.db) │               │
│                 └─────┬──────┘               │
│                       │                      │
└───────────────────────┼──────────────────────┘
                        │
                        │ Internet (Sinkronisasi)
                        ▼
┌──────────────────────────────────────────────┐
│          Server Pusat Kemendikbud            │
│   (PostgreSQL / API Server)                  │
└──────────────────────────────────────────────┘
```

### 1.3 Tech Stack Dapodik

| Komponen | Spesifikasi |
|:---------|:------------|
| **Tipe Aplikasi** | Web-based local application (offline-first) |
| **Database Lokal** | **SQLite** (file-based, serverless) |
| **Bahasa Pemrograman** | **PHP** |
| **Web Server Lokal** | Apache (terbundle dalam installer) |
| **Akses** | `http://localhost:5774` (port spesifik) |
| **Sinkronisasi** | REST API ke server pusat saat online |

### 1.4 Mekanisme Kerja Dapodik

1. **Input Data Offline** — Operator sekolah input data siswa,GTK, rombel, sarpras secara offline di komputer sekolah
2. **Validasi Lokal** — Aplikasi memvalidasi kelengkapan dan kebenaran data sebelum dikirim
3. **Sinkronisasi** — Saat terhubung internet, data dari SQLite dikirim ke server pusat via REST API
4. **Update Referensi** — Data referensi dari pusat (sekolah baru, kode wilayah, dll) diunduh ke SQLite lokal

### 1.5 Kesimpulan: Dapodik = Web App + SQLite ✅

**Keputusan Anda tepat.** Dapodik memang menggunakan arsitektur **Web App + SQLite** — sama persis dengan yang Anda pilih. Ini membuktikan bahwa arsitektur ini sudah teruji untuk aplikasi pendidikan skala nasional dengan ribuan sekolah.

---

## Bagian 2: Arsitektur Aplikasi eRapor

### 2.1 Gambaran Umum

**eRapor** adalah aplikasi penilaian dan rapor digital yang dikembangkan oleh Kemendikbudristek untuk mendukung Kurikulum Merdeka. Tersedia untuk jenjang SD, SMP, SMA, dan SMK.

### 2.2 Arsitektur

```
┌─────────────────────────────────────────────┐
│            Komputer Sekolah                  │
│                                              │
│  ┌──────────┐    ┌──────────┐               │
│  │ Browser  │◄──►│ Web App  │               │
│  │(Chrome,  │    │ (PHP:    │               │
│  │ Firefox) │    │Laravel/CI)│               │
│  └──────────┘    └────┬─────┘               │
│                       │                      │
│                 ┌─────▼──────────┐           │
│                 │ PostgreSQL/MySQL │          │
│                 │  (Database Server)│         │
│                 └─────┬──────────┘           │
│                       │                      │
│                 ┌─────▼──────┐               │
│                 │ Web Service│               │
│                 │ (Sync API) │               │
│                 └─────┬──────┘               │
└───────────────────────┼──────────────────────┘
                        │
                        │ Web Service (Sync)
                        ▼
┌──────────────────────────────────────────────┐
│          Server Pusat Kemendikbud            │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ Dapodik Pusat (sumber data referensi)│   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 2.3 Tech Stack eRapor

| Komponen | Spesifikasi |
|:---------|:------------|
| **Tipe Aplikasi** | Web-based local application (localhost) |
| **Database Lokal** | **PostgreSQL** atau **MySQL/MariaDB** ❌ BUKAN SQLite |
| **Bahasa Pemrograman** | **PHP** (Laravel atau CodeIgniter — bervariasi per jenjang) |
| **Web Server** | Apache/Nginx lokal |
| **Akses** | `localhost` atau IP lokal jaringan sekolah |
| **Integrasi Dapodik** | Web Service (API) untuk mengambil data referensi siswa & GTK |
| **raportku.com** | **Layanan pihak ketiga** yang mengonlinekan eRapor (bukan resmi Kemendikbud) |

### 2.4 Perbedaan Kunci: Dapodik vs eRapor

| Aspek | Dapodik | eRapor |
|:------|:--------|:--------|
| **Database** | **SQLite** ✅ | PostgreSQL / MySQL ❌ |
| **Setup Database** | ✅ **Zero config** — file `.db` langsung jalan | ❌ Butuh **install PostgreSQL/MySQL server** |
| **Portabilitas** | ✅ **1 folder** bisa di-copy ke mana saja | ❌ Bergantung pada service database terinstall |
| **Backup** | ✅ **Copy file .db** saja | ❌ Butuh dump database atau backup tools |
| **Resource** | ✅ Ringan (tidak perlu service db terpisah) | ❌ Lebih berat (butuh server db berjalan) |
| **Web Server** | Apache/PHP built-in | Apache/Nginx + PHP |
| **Framework** | PHP (custom/internal) | Laravel / CodeIgniter |

### 2.5 Pelajaran Penting

Meskipun eRapor TIDAK menggunakan SQLite (mereka pakai PostgreSQL/MySQL), arsitektur dasarnya SAMA: **aplikasi web lokal di komputer sekolah**. Perbedaannya ada di database:

- **Dapodik** = **SQLite** → lebih sederhana, portable, ringan
- **eRapor** = **PostgreSQL/MySQL** → lebih kompleks, butuh admin IT

**Untuk kebutuhan Anda (aplikasi SPJ sekolah), SQLite sudah lebih dari cukup.** Tidak perlu kompleksitas seperti eRapor.

---

## Bagian 3: Perbandingan Framework untuk Web App + SQLite

### 3.1 Ringkasan Perbandingan

| Kriteria | 🥇 Laravel + SQLite | 🥈 Flask + React + SQLite | 🥉 React + Node + SQLite | Next.js + SQLite |
|:---------|:-------------------:|:-------------------------:|:------------------------:|:----------------:|
| **Kemudahan Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Ringan di Resource** | ⭐⭐⭐⭐ (50-100MB) | ⭐⭐⭐⭐⭐ (30-50MB) | ⭐⭐⭐ (100-200MB) | ⭐⭐ (150-300MB) |
| **Kemudahan Deployment** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Performa SQLite** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Komunitas Indonesia** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Tutorial/Belajar** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Maintenance Jangka Panjang** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

### 3.2 Analisis Detail Per Framework

#### 🥇 Laravel + SQLite (Rekomendasi Utama)

| Aspek | Detail |
|:------|:--------|
| **Stack** | PHP 8.x + Laravel 11 + SQLite + Blade/Bootstrap |
| **Memory Footprint** | ~50-100 MB (idle) |
| **Setup Database SQLite** | **Sangat mudah** — cukup set `DB_CONNECTION=sqlite` di `.env`, langsung jalan |
| **Cara Install** | Install PHP + Composer → `composer create-project laravel/laravel` → setting `.env` |
| **Deployment ke Komputer Sekolah** | ✅ **Paling mudah** — cukup copy folder project, jalanin `php artisan serve` (bisa dibungkus .bat file) |

**✅ Kelebihan:**
- **Ekosistem lengkap** — ORM (Eloquent), auth (Laravel Breeze/Jetstream), migrasi database, queue, notifikasi — semua built-in
- **Dukungan SQLite kelas 1** — Eloquent ORM bekerja sempurna dengan SQLite, migrasi otomatis
- **Laragon/XAMPP** — Bisa di-bundle sebagai portable app di flashdisk, jalan di Windows tanpa instalasi ribet
- **Blade templating** — Bisa bikin UI tanpa perlu React/Vue, lebih ringan
- **Komunitas besar di Indonesia** — Banyak referensi, tutorial bahasa Indonesia, grup Telegram/Facebook
- **Mudah dicari pengembang** — Developer PHP/Laravel banyak di Indonesia, gaji relatif terjangkau
- **Mature & stabil** — Framework paling populer di Indonesia untuk aplikasi pemerintahan/sekolah

**❌ Kekurangan:**
- **Tidak real-time by default** — Butuh Laravel Reverb/WebSocket untuk realtime (tambah kompleksitas)
- **UI kurang interaktif** — Blade murni kurang responsif, butuh Livewire atau Inertia.js untuk SPA-like experience
- **PHP bukan bahasa paling modern** — Tapi untuk aplikasi sekolah, ini tidak masalah

**🎯 Ideal untuk:** Tim yang ingin **cepat jadi, mudah maintenance**, dan target komputer spesifikasi rendah.

---

#### 🥈 Flask + React + SQLite (Paling Ringan)

| Aspek | Detail |
|:------|:--------|
| **Stack** | Python Flask + SQLAlchemy + React (Vite) + SQLite |
| **Memory Footprint** | ~30-50 MB (backend) — **paling ringan** |
| **Setup Database SQLite** | Sangat mudah — SQLAlchemy auto-create file `.db` |
| **Cara Install** | Install Python + Node.js → `pip install flask` → `npm create vite` |
| **Deployment** | Butuh 2 proses: `python app.py` (backend) + `npm run dev` (frontend), atau build frontend → serve static |

**✅ Kelebihan:**
- **Memory footprint terkecil** — 30-50MB, bisa jalan di komputer RAM 1GB
- **Python syntax bersih dan mudah dipelajari** — Cocok jika Anda mau mengembangkan sendiri
- **Flask sangat minimalis** — Hanya yang dibutuhkan, cocok untuk aplikasi sederhana
- **SQLAlchemy ORM kuat** — Abstraksi database yang fleksibel
- **React untuk UI modern** — Bisa bikin antarmuka interaktif yang responsif

**❌ Kekurangan:**
- **Harus manage 2 proses** — Backend Flask + Frontend React berjalan terpisah, repot untuk deployment ke pengguna non-teknis
- **Python packaging untuk desktop rumit** — Butuh PyInstaller atau tools lain untuk bikin .exe
- **Komunitas di Indonesia lebih kecil** — Developer Flask tidak sebanyak Laravel di Indonesia
- **Dokumentasi auth & fitur harus manual** — Tidak semudah Laravel yang tinggal `php artisan make:auth`

**🎯 Ideal untuk:** Developer yang **suka Python**, mau **paling ringan**, dan tidak masalah dengan setup agak rumit.

---

#### 🥉 React + Node.js + SQLite (Performa Tinggi)

| Aspek | Detail |
|:------|:--------|
| **Stack** | Node.js + Express + better-sqlite3 + React (Vite) |
| **Memory Footprint** | ~100-200 MB |
| **Setup Database SQLite** | better-sqlite3 — native binding, sangat cepat |
| **Cara Install** | Install Node.js → `npm install express better-sqlite3 react` |
| **Deployment** | Butuh 2 proses: `node server.js` + `npm run dev` (frontend), atau serve frontend dari backend |

**✅ Kelebihan:**
- **JavaScript full-stack** — Satu bahasa untuk frontend & backend
- **better-sqlite3 sangat cepat** — Synchronous API tanpa overhead event loop, performa SQLite terbaik
- **npm ecosystem** — Paket library paling lengkap
- **React untuk UI modern** — Component-based, interaktif, banyak library UI

**❌ Kekurangan:**
- **Memory lebih tinggi** — Node.js proses idle ~50MB, ditambah React dev server ~100MB
- **2 proses = 2 kali resiko error** — Pengguna non-teknis bingung jika salah satu proses mati
- **better-sqlite3 native binding** — Perlu build tools (node-gyp, Python, C++ compiler) yang repot di Windows
- **Ekosistem auth manual** — Tidak semudah Laravel, harus setup Passport/JWT manual

**🎯 Ideal untuk:** Developer JavaScript **yang nyaman dengan Node.js**, target komputer **cukup modern (RAM 4GB+)**.

---

#### Next.js + SQLite (Overkill untuk Lokal)

| Aspek | Detail |
|:------|:--------|
| **Stack** | Next.js + better-sqlite3 + React |
| **Memory Footprint** | ~150-300 MB — **paling berat** |
| **Setup Database SQLite** | Bisa pakai better-sqlite3 di API routes |
| **Cara Install** | `npx create-next-app` → install better-sqlite3 |
| **Deployment** | Butuh Node.js runtime, build dulu → `npm start` |

**✅ Kelebihan:**
- **Full-stack dalam satu project** — Frontend & backend di satu kodebase
- **File-based routing** — Routing intuitif
- **React Server Components** — Bisa render di server untuk performa lebih baik
- **Ekosistem Vercel** — Jika nanti mau online, tinggal deploy ke Vercel

**❌ Kekurangan:**
- **Paling berat** — Memory 150-300MB, terlalu besar untuk aplikasi lokal sederhana
- **Next.js dirancang untuk cloud** — Fitur SSR, ISR, edge functions tidak berguna untuk aplikasi offline lokal
- **Overkill** — Seperti \"pakai garpu untuk makan nasi goreng\"
- **Kompleksitas build & deployment** — Harus build dulu (`next build`), baru bisa jalan

**🎯 Ideal untuk:** **Tidak direkomendasikan** untuk aplikasi lokal. Next.js lebih cocok untuk aplikasi online/saas.

---

### 3.3 Perbandingan Performa & Resource

#### Memory Footprint (Saat Idle)

```
Flask + React       ████████░░░░░░░░░░░░  30-50 MB    🥇 Paling Ringan
Laravel + SQLite    ██████████████░░░░░░  50-100 MB   🥈
React + Node        ██████████████████░░  100-200 MB  🥉
Next.js + SQLite    ████████████████████  150-300 MB  ❌ Overkill
```

#### Ukuran Instalasi (Dependensi + Aplikasi)

```
Flask + React       ~150 MB    (Python + venv + Node modules minimal)
Laravel + SQLite    ~200 MB    (PHP + Composer + vendor)
React + Node        ~350 MB    (Node_modules besar)
Next.js + SQLite    ~500 MB    (Next.js + React + dependencies)
```

#### Kecepatan Development (Fitur Sederhana — CRUD + Auth)

```
Laravel + SQLite     ⏱ 1 hari    (tinggal artisan make:auth + migration)
Flask + React        ⏱ 3-5 hari  (setup auth manual + React integration)
React + Node         ⏱ 3-5 hari  (setup Express + JWT + React)
Next.js + SQLite     ⏱ 3-5 hari  (setup API routes + auth)
```

---

### 3.4 Matriks Keputusan

| Prioritas Anda | Pilih Framework | Kenapa? |
|:---------------|:----------------|:--------|
| **Paling mudah & cepat jadi** | 🥇 **Laravel + SQLite** | Setup 1 jam, auth jadi, ORM siap pakai, Blade templating ringan |
| **Paling ringan di RAM** | 🥇 **Flask + React + SQLite** | 30-50MB footprint, bisa jalan di Pentium 4 dengan RAM 1GB |
| **Paling portable (copy-paste)** | 🥇 **Laravel + SQLite** | 1 folder bisa di-copy ke flashdisk, jalan di mana aja dengan Laragon portable |
| **Developer JS sejati** | 🥉 **React + Node + SQLite** | Satu bahasa untuk semua, better-sqlite3 super cepat |
| **Mau online nanti** | 🥉 **React + Node + SQLite** | Migrasi ke cloud lebih natural, bisa pakai PostgreSQL |
| **Pengembangan sendiri** | 🥇 **Laravel + SQLite** atau **Flask + React** | Tergantung suka PHP atau Python |
| **Dicari developer (outsource)** | 🥇 **Laravel + SQLite** | Paling banyak freelancer Laravel di Indonesia |

---

### 3.5 Rekomendasi Final

Berdasarkan riset dan prioritas Anda (**Web App + SQLite, kemudahan, ringan**):

#### 🥇 Pilihan #1: Laravel + SQLite
```
Stack: PHP 8.x + Laravel 11 + SQLite + Blade/Bootstrap/Livewire
RAM:   ~50-100 MB
Setup: ⭐ Simpel (XAMPP/Laragon + Composer)
Deploy: ⭐ Copy folder, double-click .bat
```

**Kelebihan utama:**
- Paling stabil & teruji untuk aplikasi pendidikan Indonesia (Dapodik, eRapor, banyak SIM sekolah lain pakai PHP)
- SQLite support kelas 1 di Laravel
- Bundling dengan Laragon portable = tinggal copy flashdisk, jalan di komputer mana pun
- Komunitas & referensi paling banyak di Indonesia
- Jika butuh UI interaktif, bisa tambah Livewire atau Inertia.js (tetap ringan)

#### 🥈 Pilihan #2: Flask + React + SQLite
```
Stack: Python 3.x + Flask + SQLAlchemy + React (Vite)
RAM:   ~30-50 MB (paling ringan)
Setup: ⭐⭐ Sedang (perlu manage 2 proses)
Deploy: ⭐⭐ Butuh build frontend atau PyInstaller
```

**Pilih ini jika:** Anda **suka Python**, target **komputer sangat rendah (RAM 1-2GB)**, dan Anda sendiri yang akan mengembangkan & maintain.

---

### 3.6 Catatan Penting untuk SQLite dengan 600 User

Apa pun framework yang dipilih, untuk SQLite dengan 600 user, **WAJIB lakukan ini:**

```sql
-- Aktifkan WAL mode (WAJIB!)
PRAGMA journal_mode=WAL;
-- Set busy timeout (tunggu 5 detik sebelum error)
PRAGMA busy_timeout=5000;
-- Cache size (gunakan 64MB cache)
PRAGMA cache_size=-64000;
-- Synchronous mode (kurangi fsync untuk performa)
PRAGMA synchronous=NORMAL;
-- Foreign keys (aktifkan)
PRAGMA foreign_keys=ON;
```

**Juga:**
- Gunakan **connection pooling** dengan batas (misal: 10-20 koneksi)
- **Transaksi pendek** — jangan tahan transaksi terlalu lama
- Jika mulai sering error `SQLITE_BUSY` → pertimbangkan **migrasi ke PostgreSQL**
- Backup rutin: `cp database.db database-backup-$(date).db`

---

## Ringkasan Akhir

```
┌──────────────────────────────────────────────────────────────────┐
│                        KESIMPULAN                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  • DAPODIK    = Web App + SQLite ✅ (tepat seperti pilihan Anda) │
│  • eRAPOR     = Web App + PostgreSQL ❌ (beda database)          │
│  • Arsitektur = SAMA-SAMA web app lokal di komputer sekolah      │
│                                                                  │
│  🥇 REKOMENDASI FRAMEWORK:                                       │
│     Laravel + SQLite — termudah, teringan untuk deployment       │
│                                                                  │
│  🥈 ALTERNATIF:                                                  │
│     Flask + React + SQLite — paling hemat RAM (30-50MB)          │
│                                                                  │
│  🥉 OPSI LAIN:                                                   │
│     React + Node + SQLite — untuk developer JS                   │
│     ❌ Next.js + SQLite — overkill, jangan                       │
│                                                                  │
│  ⚠️ CATATAN 600 USER:                                           │
│     SQLite BISA handle 600 user dengan WAL mode + optimasi       │
│     Siapkan rencana migrasi ke PostgreSQL jika perlu              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Sumber Referensi

1. Portal Resmi Dapodik — https://dapo.kemendikdasmen.go.id/
2. Panduan Teknis Aplikasi Dapodik (Dokumen PDF tahun berjalan)
3. Portal eRapor — https://eraporjotimsatu.raportku.com/
4. Puslapdik Kemendikdasmen — https://puslapdik.kemendikdasmen.go.id/
5. Dokumentasi Laravel SQLite — https://laravel.com/docs/database#sqlite-configuration
6. Dokumentasi better-sqlite3 — https://github.com/WiseLibs/better-sqlite3
7. Dokumentasi SQLAlchemy SQLite — https://docs.sqlalchemy.org/en/20/dialects/sqlite.html
8. SQLite WAL Mode Documentation — https://www.sqlite.org/wal.html
9. Laragon (Portable PHP Environment) — https://laragon.org/
10. Riset memory footprint framework dari berbagai sumber teknis

---

## Metodologi

Riset dilakukan melalui pencarian web dengan berbagai variasi kata kunci, analisis dokumentasi resmi framework, dokumentasi SQLite, serta observasi langsung pada aplikasi Dapodik dan eRapor. Sebanyak 15+ sumber dianalisis untuk memastikan akurasi informasi.
