# Panduan Arsitektur, Deployment & Distribusi Aplikasi SPJ (Laravel + SQLite)
*Dibuat: 4 Juli 2026 | Untuk: Operator Sekolah & Developer*

---

## Daftar Isi
1. [Bagian 1: Alur Arsitektur Seperti eRapor](#bagian-1-alur-arsitektur-seperti-erapor)
2. [Bagian 2: Deployment Gratis Laravel (Alternatif Vercel)](#bagian-2-deployment-gratis-laravel-alternatif-vercel)
3. [Bagian 3: Install di Laptop Lain untuk Non-IT](#bagian-3-install-di-laptop-lain-untuk-non-it)
4. [Bagian 4: Kesimpulan & Rekomendasi](#bagian-4-kesimpulan--rekomendasi)

---

# Bagian 1: Alur Arsitektur Seperti eRapor

## 1.1 Apa yang Dimaksud "Struktur Seperti eRapor"?

eRapor adalah **aplikasi web yang di-install di komputer sekolah** dan berjalan secara **lokal (localhost)**. Database (PostgreSQL/MySQL) juga berjalan di komputer yang sama. Data hanya bisa diakses dari komputer tersebut (atau dari komputer lain dalam satu jaringan LAN sekolah).

## 1.2 Alur Instalasi eRapor

```
1. Download Installer (.exe)
         │
         ▼
2. Jalankan Installer
   - Pilih folder tujuan (C:\eRapor\)
   - Installer otomatis memasang:
     ├── Web Server (Apache)
     ├── PHP Engine
     ├── Database Server (PostgreSQL/MySQL)
     └── Aplikasi eRapor
         │
         ▼
3. Konfigurasi Awal
   - Hubungkan dengan Dapodik (via Web Service Token)
   - Import data referensi siswa & guru dari Dapodik
         │
         ▼
4. Akses via Browser
   - Buka Chrome/Edge → ketik: http://localhost:8154 (contoh port)
   - Login sebagai admin/operator/guru
         │
         ▼
5. Input & Olah Data
   - Guru input nilai
   - Operator kelola data siswa
   - Cetak rapor
         │
         ▼
6. Sinkronisasi (saat online)
   - Kirim data nilai ke server pusat Kemendikbud
   - Download update aplikasi jika ada
```

## 1.3 Perbedaan eRapor dengan Aplikasi SPJ Anda

| Aspek | eRapor | Aplikasi SPJ Anda |
|:------|:-------|:-------------------|
| **Database** | PostgreSQL/MySQL (butuh instalasi server db) | **SQLite** (file-based, tanpa instalasi) |
| **Web Server** | Apache (install terpisah) | **PHP built-in server** atau **Laragon** |
| **Kebutuhan Instalasi** | Installer besar (~500MB+) | **Portable / satu folder** |
| **Sinkronisasi** | Sync ke server pusat Kemendikbud | **Tidak perlu sync ke pusat** (kecuali online nanti) |
| **Backup Data** | Export SQL via menu | **Copy file .db** — jauh lebih mudah |
| **Kebutuhan Admin IT** | Butuh orang paham database server | **Tidak perlu** — cukup copy-paste |

## 1.4 Alur Arsitektur yang SAMA dengan eRapor (Untuk SPJ Anda)

```
┌─────────────────────────────────────────────────────────────────┐
│              KOMPUTER SEKOLAH (Lokal)                           │
│                                                                 │
│  ┌──────────────┐       ┌──────────────────────────────┐       │
│  │   Browser     │◄─────►│   Web App (Laravel + SQLite) │       │
│  │  (Chrome)     │       │                              │       │
│  │  localhost:8000│       │  http://localhost:8000       │       │
│  └──────────────┘       │  Atau http://192.168.x.x:8000 │       │
│                          │  (dalam satu jaringan LAN)    │       │
│                          └──────────┬───────────────────┘       │
│                                     │                           │
│                          ┌──────────▼───────────────────┐       │
│                          │  SQLite Database              │       │
│                          │  (database.sqlite)            │       │
│                          │  ▶ 1 file, mudah di-copy      │       │
│                          │  ▶ Backup = copy file ke USB  │       │
│                          └──────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
         │
         │ (Optional, jika nanti mau online)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              INTERNET / HOSTING                                 │
│  Shared Hosting / VPS / Railway.app / dll                       │
└─────────────────────────────────────────────────────────────────┘
```

## 1.5 Alur Backup-Restore Data (Seperti eRapor)

### Backup (Membuat Cadangan Data)

```
Di dalam Aplikasi SPJ
         │
         ▼
Klik menu "Backup Data"
         │
         ▼
Sistem akan meng-copy file database.sqlite
ke folder yang Anda pilih
         │
         ▼
Simpan file backup di:
├── Flashdisk
├── Google Drive
└── Email sendiri
```

### Restore (Memulihkan Data)

```
Di komputer baru / setelah install ulang
         │
         ▼
Install aplikasi SPJ di komputer baru
         │
         ▼
Klik menu "Restore Data" di aplikasi
         │
         ▼
Pilih file backup .sqlite dari flashdisk
         │
         ▼
Selesai! Semua data kembali seperti semula
```

**Kelebihan SQLite dibanding PostgreSQL eRapor:**
- Backup = **cukup copy 1 file** (database.sqlite)
- Restore = **cukup timpa 1 file**
- Tidak perlu export/import SQL dump
- Tidak perlu khawatir versi database server

---

# Bagian 2: Deployment Gratis Laravel (Alternatif Vercel)

## 2.1 Vercel untuk React/Next.js vs ?

| Untuk React/Next.js | Untuk Laravel |
|:--------------------|:--------------|
| Vercel (gratis) | ❌ **Tidak bisa** — Vercel tidak support PHP |
| Netlify (gratis) | ❌ Tidak bisa — Netlify hanya untuk static site |
| **Alternatif Laravel** | ✅ **Lihat tabel di bawah** |

## 2.2 Perbandingan Semua Opsi Hosting Laravel

| Platform | Biaya | RAM/CPU | Cocok untuk | Kemudahan |
|:---------|:-----:|:--------|:------------|:---------:|
| **🏠 LOKAL (Laragon Portable)** | **✅ Gratis Rp0** | Pakai RAM komputer sendiri | ✅ **Rekomendasi Utama** — untuk offline sekolah | ⭐⭐⭐⭐⭐ |
| **🏠 Lokal (PHP artisan serve)** | **✅ Gratis Rp0** | Pakai RAM sendiri | ✅ Bisa untuk 1 komputer | ⭐⭐⭐⭐ |
| **Railway.app** | **💰 $5-10/bln** (~Rp80-160rb) | 512MB-1GB RAM | Bisa untuk online production | ⭐⭐⭐⭐ |
| **Render.com** | **💰 $7/bln** (~Rp110rb) | 512MB RAM | Bisa untuk online, ada free tier (tidur) | ⭐⭐⭐ |
| **Fly.io** | **💰 ~$2-5/bln** (~Rp30-80rb) | Pay-as-you-go | Ringan, bisa free tier terbatas | ⭐⭐⭐ |
| **Shared Hosting Indo** | **💰 Rp20-50rb/bln** | Shared CPU | ✅ Paling murah untuk online | ⭐⭐⭐⭐⭐ |
| **DigitalOcean + Forge** | **💰 ~$16/bln** (~Rp250rb) | 1GB RAM dedicated | Performa tinggi | ⭐⭐⭐ |
| **InfinityFree/000webhost** | **✅ Gratis Rp0** | Sangat terbatas | ❌ **Tidak direkomendasikan** — sering error | ⭐ |
| **Laravel Vapor** | **💰 $39/bln** (~Rp620rb) | Serverless AWS | Enterprise / Traffic besar | ⭐⭐⭐ |

## 2.3 Penjelasan Detail Opsi Hosting

### ✅ Pilihan #1: JALAN LOKAL (Gratis Rp0) — Paling Direkomendasikan

Untuk kebutuhan **offline di sekolah**, aplikasi Laravel + SQLite bisa jalan sepenuhnya lokal tanpa hosting.

**Cara:**
```
Laragon Portable (di flashdisk)
        │
        ▼
Copy folder Laragon + project ke flashdisk
        │
        ▼
Colok flashdisk ke komputer sekolah
        │
        ▼
Double-click "Start Aplikasi.bat"
        │
        ▼
Buka browser → http://localhost:8000
```

### ✅ Pilihan #2: Shared Hosting Indonesia (Rp20-50rb/bln)

Jika nanti ingin **online**, hosting shared termurah adalah pilihan terbaik.

**Rekomendasi Provider:**
| Provider | Harga Mulai | Fitur untuk Laravel |
|:---------|:-----------|:--------------------|
| **Niagahoster** | ~Rp25rb/bln | PHP 8.x, cPanel, MySQL, SSL gratis |
| **Dewaweb** | ~Rp30rb/bln | PHP 8.x, cPanel, support Laravel |
| **Hostinger** | ~Rp20rb/bln | PHP 8.x, hPanel, performa cukup |
| **JagoHosting** | ~Rp25rb/bln | PHP 8.x, support lokal Indonesia |
| **Qwords** | ~Rp35rb/bln | Cloud hosting, support Laravel |

**Cara Deploy Laravel ke Shared Hosting:**
```
1. Build project Laravel di lokal
2. Compress folder project (kecuali node_modules, .env)
3. Upload via cPanel File Manager atau FTP
4. Set document root ke folder /public
5. Import database (jika pakai MySQL) atau upload file .sqlite
6. Setting .env untuk production
7. Selesai! Aplikasi online
```

### ✅ Pilihan #3: Railway.app / Render (Modern PaaS)

Cocok untuk developer yang ingin deployment cepat via Git.

**Railway.app:**
- Kelebihan: Auto-deploy dari GitHub, support Docker
- Kekurangan: Tidak ada free tier permanen (mulai $5-10/bln)
- Cocok untuk: Developer yang nyaman dengan CLI

**Render.com:**
- Kelebihan: Ada free tier (web service tidur otomatis saat tidak dipakai)
- Kekurangan: Cold start lambat (15-30 detik), cocok untuk testing
- Cocok untuk: Staging / prototyping

## 2.4 Berapa Biaya Sebenarnya untuk Online?

| Skenario | Biaya/bulan | Biaya/tahun | Catatan |
|:---------|:-----------:|:-----------:|:--------|
| **Rp0 (Lokal saja)** | Rp0 | Rp0 | ✅ Paling direkomendasikan untuk awal |
| **Testing online** | Rp0 (Render free) | Rp0 | Slow, cold start |
| **Production kecil** | Rp25-50rb (Shared Hosting) | Rp300-600rb | Termurah untuk online beneran |
| **Production medium** | Rp80-160rb (Railway) | Rp960k-1.9jt | Performa lebih baik |

---

# Bagian 3: Install di Laptop Lain untuk Non-IT

## 3.1 Masalah: Operator Sekolah Bukan IT

Operator sekolah tidak bisa:
- Install PHP, Composer, Node.js
- Setting environment variables
- Mengetik perintah `php artisan serve` di terminal
- Konfigurasi web server

**Solusi: Buat aplikasi yang "double-click → langsung jalan"**

## 3.2 Perbandingan Metode Distribusi

| Metode | Tingkat Kesulitan | Untuk Non-IT | Kelebihan | Kekurangan |
|:-------|:-----------------:|:------------:|:----------|:-----------|
| **🥇 Laragon Portable + .bat** | ⭐ Mudah | ✅ **Sangat cocok** | Tinggal copy folder + double-click | Perlu flashdisk / folder sharing |
| **🥈 FrankenPHP (1 file .exe)** | ⭐⭐ Sedang | ✅ **Cocok** | 1 file executable, paling praktis | Teknologi baru, masih berkembang |
| **🥉 InnoSetup (Installer .exe)** | ⭐⭐⭐ Agak sulit | ✅ **Cocok** | Seperti install aplikasi biasa | Setup awal butuh waktu |
| **NativePHP (Desktop App)** | ⭐⭐⭐⭐ Sulit | ✅ **Sangat cocok** | Tampilan seperti aplikasi desktop | Ukuran file besar (~100MB+) |

## 3.3 🥇 Metode Paling Direkomendasikan: Laragon Portable

### Apa itu Laragon?
Laragon adalah **paket PHP + Apache + MySQL** yang **portable** (bisa di-copy ke flashdisk dan jalan di komputer mana pun tanpa instalasi).

### Step-by-Step untuk Developer

**Langkah 1: Siapkan Laragon Portable**
```
1. Download Laragon Portable dari https://laragon.org/download/
   (Pilih "Laragon Portable" — versi ZIP, bukan installer)
2. Extract ke folder: D:\AplikasiSPJ\laragon
3. Setting Laragon:
   - Buka laragon → Menu → Preferences
   - Auto start: OFF
   - Service: Apache ON, MySQL OFF (kita pakai SQLite)
```

**Langkah 2: Siapkan Project Laravel**
```
1. Buat project Laravel di: D:\AplikasiSPJ\laragon\www\spj
2. Setting .env:
   DB_CONNECTION=sqlite
   DB_DATABASE=D:\AplikasiSPJ\data\database.sqlite
3. Setting storage & cache
```

**Langkah 3: Buat File "Jalanin Aplikasi.bat"**
Buat file di `D:\AplikasiSPJ\Jalanin Aplikasi.bat`:
```batch
@echo off
title Aplikasi SPJ Sekolah
echo ====================================
echo    APLIKASI SPJ SEKOLAH
echo ====================================
echo.
echo 1. Menjalankan Laragon...
cd /d "%~dp0laragon"
start /B laragon.exe start
echo.
echo 2. Menunggu server siap...
timeout /t 5 /nobreak >nul
echo.
echo 3. Membuka Aplikasi...
start http://localhost/spj/public
echo.
echo ====================================
echo Aplikasi sudah siap!
echo Jika browser tidak terbuka otomatis,
echo buka manual: http://localhost/spj/public
echo.
echo Tekan tombol apa saja untuk menutup...
pause >nul
```

**Langkah 4: Testing**
```
Copy folder D:\AplikasiSPJ ke flashdisk
Colok flashdisk ke komputer lain
Double-click "Jalanin Aplikasi.bat"
Aplikasi langsung terbuka di browser!
```

### Step-by-Step untuk Operator (Non-IT)

```
CARA MENJALANKAN APLIKASI SPJ
================================

1. Colok flashdisk ke komputer
2. Buka folder "Aplikasi SPJ" di flashdisk
3. Double-click file "Jalanin Aplikasi.bat"
4. Tunggu 5 detik...
5. Browser akan terbuka otomatis
6. Login dengan username & password Anda

INFO PENTING:
- Aplikasi jalan di komputer ini saja (offline)
- Tidak perlu internet
- Tutup browser dulu sebelum cabut flashdisk
- Klik "Backup Data" secara berkala untuk cadangan
```

## 3.4 🥈 Alternatif: FrankenPHP (1 File .exe)

FrankenPHP memungkinkan Anda bundle **PHP + Laravel + Web Server** menjadi **1 file executable**.

**Cara:**
```
1. Download FrankenPHP dari https://frankenphp.dev/
2. Copy project Laravel Anda ke folder yang sama
3. Jalankan: .\frankenphp php-cli artisan app:build
   (Atau setting sederhana dengan static binary)
4. Hasilnya: 1 file aplikasi-spj.exe (~40MB)
5. User tinggal double-click file ini → langsung jalan!
```

**Kelebihan:**
- Benar-benar 1 file
- Tidak perlu folder terpisah
- User tidak bingung harus klik apa

**Kekurangan:**
- Teknologi relatif baru
- Butuh setup awal lebih rumit
- Ukuran file ~40-50MB

## 3.5 🥉 Alternatif: InnoSetup (Installer .exe)

Membuat file installer seperti aplikasi pada umumnya.

**Cara Membuat Installer:**
```
1. Siapkan folder aplikasi lengkap (Laragon + Project)
2. Download InnoSetup (gratis) dari https://jrsoftware.org/
3. Buat script installer:

; Script InnoSetup untuk Aplikasi SPJ
[Setup]
AppName=Aplikasi SPJ Sekolah
AppVersion=1.0
DefaultDirName=C:\AplikasiSPJ
OutputDir=.\installer
OutputBaseFilename=AplikasiSPJ_Setup

[Files]
Source: "D:\AplikasiSPJ\*"; DestDir: "{app}"; Flags: recursesubdirs

[Icons]
Name: "{commondesktop}\Aplikasi SPJ"; Filename: "{app}\Jalanin Aplikasi.bat"

[Run]
Filename: "{app}\Jalanin Aplikasi.bat"; Description: "Jalankan Aplikasi SPJ"; Flags: postinstall nowait skipifsilent

4. Compile → hasil: AplikasiSPJ_Setup.exe
5. User tinggal double-click installer → next → finish
6. Shortcut "Aplikasi SPJ" muncul di desktop
```

**Hasil untuk Non-IT:**
```
Install seperti aplikasi biasa:
1. Double-click "AplikasiSPJ_Setup.exe"
2. Klik "Next" beberapa kali
3. Klik "Install"
4. Klik "Finish"
5. Double-click shortcut "Aplikasi SPJ" di desktop
6. Browser terbuka, aplikasi siap dipakai!
```

## 3.6 🔄 Alur Distribusi & Update

### Alur Distribusi Awal

```
┌──────────────────────────────────────────────────┐
│              DEVELOPER                            │
│                                                   │
│  1. Buat project Laravel + SQLite                 │
│  2. Setup Laragon Portable dengan project         │
│  3. Buat file "Jalanin Aplikasi.bat"              │
│  4. Buat installer (InnoSetup)                    │
│  5. Upload ke:                                    │
│     ├── Google Drive (tautan download)            │
│     └── Flashdisk (distribusi langsung)           │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              OPERATOR SEKOLAH                     │
│                                                   │
│  1. Download dari Google Drive atau terima USB    │
│  2. Double-click "AplikasiSPJ_Setup.exe"          │
│  3. Klik Next → Next → Install → Finish           │
│  4. Double-click shortcut di desktop              │
│  5. Browser terbuka → Login → Aplikasi siap!      │
└──────────────────────────────────────────────────┘
```

### Alur Update Aplikasi

```
VERSI BARU DIRILIS
         │
         ▼
Developer upload installer versi baru
Hanya file aplikasi (bukan database)
         │
         ▼
Operator download installer baru
         │
         ▼
Jalankan installer baru
Installer akan menimpa file aplikasi
TAPI TIDAK menghapus database.sqlite
         │
         ▼
Selesai! Data tetap aman, aplikasi versi baru
```

### Alur Pindah ke Komputer Baru

```
KOMPUTER LAMA                     KOMPUTER BARU
═══════════════                   ═══════════════
                                  Install Aplikasi SPJ
                                  (dari installer / flashdisk)
         │
Klik "Backup Data"               
         │                       
Copy file backup ke flashdisk     
         │                       
         ─── flashdisk ─────────►  Klik "Restore Data"
                                   Pilih file backup
                                   ↓
                                  Semua data kembali!
                                  Siap dipakai!
```

## 3.7 Perbandingan: Aplikasi SPJ vs Dapodik vs eRapor (Dari Sisi Non-IT)

| Aktivitas | Dapodik | eRapor | **Aplikasi SPJ Anda** |
|:----------|:--------|:-------|:----------------------|
| **Instalasi** | Installer .exe (~500MB) | Installer .exe (~500MB) | **Installer kecil (~100MB) atau portable** |
| **Database** | SQLite (file) | PostgreSQL (server) | **SQLite (file) — paling mudah** |
| **Backup** | Copy file .db atau prefill | Export SQL via menu | **Copy 1 file .sqlite** |
| **Restore** | Import file prefill | Import SQL via menu | **Copy balik file .sqlite** |
| **Pindah komputer** | Butuh file kunci prefill | Backup → Install baru → Restore | **Backup → Install baru → Restore (3 langkah)** |
| **Butuh IT?** | ✅ Sedang | ❌ Butuh IT | **✅ Tidak butuh IT sama sekali** |
| **Online** | Wajib sinkron | Wajib sinkron | **Optional — bisa murni offline** |

---

# Bagian 4: Kesimpulan & Rekomendasi

## Ringkasan Visual

```
ARISITEKTUR: Seperti eRapor (Web App Lokal)
DATABASE:    Seperti Dapodik (SQLite — lebih mudah dari eRapor)
FRAMEWORK:   Laravel + SQLite
HOSTING:     ✅ GRATIS — jalan lokal di komputer sekolah
DEPLOY:      Installer/Portable — non-IT friendly
BIAYA:       ✅ Rp0 (offline) atau Rp20-50rb/bln (jika online)
```

## Tahapan Implementasi

### Fase 1: 🆓 Lokal (Biaya Rp0)
```
Frontend: Laravel Blade (ringan, tidak perlu React/Vue)
Backend:  Laravel 11 + SQLite
Deploy:   Laragon Portable di flashdisk
Akses:    http://localhost:8000 (offline)
Biaya:    Rp0
Kelebihan: ✅ Paling mudah, non-IT friendly, zero biaya
```

### Fase 2: 🌐 Online (Jika Diperlukan — Biaya Rp25-50rb/bln)
```
Hosting:  Shared Hosting Indonesia (Niagahoster/Dewaweb)
Database: SQLite atau migrasi ke MySQL
Domain:   .sch.id (gratis untuk sekolah) atau .com (Rp100-200rb/thn)
Biaya:    ~Rp25-50rb/bulan + domain
Kelebihan: ✅ Bisa diakses dari mana saja
```

## Rekomendasi Akhir

```
┌────────────────────────────────────────────────────────────┐
│                    KESIMPULAN                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🏗️ ARSITEKTUR:                                            │
│     • Sama seperti eRapor (Web App Lokal di komputer)      │
│     • TAPI lebih sederhana: SQLite (tidak perlu server DB) │
│     • Backup/Restore = copy 1 file (mudah banget)          │
│                                                            │
│  🌐 DEPLOYMENT GRATIS:                                     │
│     • Vercel = untuk React/Next.js (tidak support PHP)     │
│     • Alternatif Laravel: Shared Hosting Rp20-50rb/bln     │
│     • TAPI untuk offline: GRATIS pakai komputer sekolah    │
│                                                            │
│  💻 INSTALL DI LAPTOP LAIN (NON-IT):                       │
│     • Metode: Laragon Portable di flashdisk                │
│     👉 Double-click "Jalanin Aplikasi.bat"                 │
│     👉 Browser terbuka otomatis                            │
│     👉 Selesai! Tidak perlu install apa-apa                │
│                                                            │
│  🎯 KESIMPULAN:                                            │
│     Aplikasi SPJ dengan Laravel + SQLite:                  │
│     ✅ Arsitektur terbukti (seperti Dapodik & eRapor)      │
│     ✅ Biaya Rp0 untuk offline                             │
│     ✅ Non-IT friendly (double-click → jalan)              │
│     ✅ Backup 1 file → aman                                │
│     ✅ Bisa online nanti kapan saja (upgrade ke hosting)   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Lampiran: Perintah Penting untuk Developer

### Setup Laravel + SQLite
```bash
# Buat project
composer create-project laravel/laravel aplikasi-spj

# Setting .env untuk SQLite
DB_CONNECTION=sqlite
DB_DATABASE=/path/ke/database.sqlite

# Buat file database
touch database/database.sqlite

# Jalankan migrasi
php artisan migrate

# Jalankan server
php artisan serve
```

### Buat File .bat untuk Non-IT (Minimal)
```batch
@echo off
php artisan serve --port=8000
start http://localhost:8000
```

### Laragon Portable — Struktur Folder
```
Flashdisk:\
├── AplikasiSPJ\
│   ├── laragon\
│   │   ├── laragon.exe
│   │   ├── usr\
│   │   └── www\
│   │       └── spj\          <-- Project Laravel
│   │           ├── app\
│   │           ├── database\
│   │           │   └── database.sqlite   <-- Data penting!
│   │           ├── public\
│   │           └── ...
│   ├── data\
│   │   └── database.sqlite   <-- (atau di sini biar aman)
│   └── Jalanin Aplikasi.bat  <-- Double-click ini!
└── Backup Data.sqlite        <-- Hasil backup
```
