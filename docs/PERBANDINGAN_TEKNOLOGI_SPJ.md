# Perbandingan Teknologi: Aplikasi SPJ (Surat Pertanggungjawaban) Sekolah

> **Tanggal:** 4 Juli 2026
> **Kapasitas User:** 600 user
> **Sumber:** Riset multidisiplin dari 25+ sumber

---

## Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Skema Aplikasi SPJ](#skema-aplikasi-spj)
3. [Opsi Teknologi yang Dibandingkan](#opsi-teknologi-yang-dibandingkan)
4. [Analisis Per Opsi](#analisis-per-opsi)
5. [Skenario Blueprint (Prototype) — Prioritaskan Gratis!](#skenario-blueprint-prototype--prioritaskan-gratis)
6. [Analisis Biaya Server & Database Saja](#analisis-biaya-server--database-saja)
7. [Jalur Migrasi (Free → Paid)](#jalur-migrasi-free--paid)
8. [Tabel Perbandingan Lengkap](#tabel-perbandingan-lengkap)
9. [Matriks Keputusan](#matriks-keputusan)
10. [Rekomendasi Akhir](#rekomendasi-akhir)

---

## Ringkasan Eksekutif

Aplikasi SPJ ini memiliki kompleksitas sedang-tinggi: **pendataan multi-tabel, upload file (dokumen/foto), manajemen bukti fisik (9+ kategori), workshop, dan dokumen PBJ**.

### Kesimpulan Utama

| Peringkat | Teknologi | Biaya Server/DB | Kelayakan 600 User | Kapan Dipakai |
|---|---|---|---|---|
| 🥇 | **Supabase Free → Pro** | Rp0 → ~Rp395rb/bln | ✅ Sangat Layak | Blueprint Rp0 → Produksi |
| 🥈 | **VPS + PostgreSQL** | Rp87-190rb/bln | ✅ Layak | Jika ada admin IT |
| 🥉 | **SQLite (Lokal)** | **Rp0** (tidak ada server) | ⚠️ MVP saja | Jika offline & darurat |
| ❌ | **Google Apps Script + Sheets** | **Rp0** | ❌ Tidak Layak 600 user | Hanya < 50 user |
| ❌ | **Electron** | Rp0 (aplikasi) | ❌ Tidak Praktis | Tidak untuk 600 user |
| ❌ | **File-Based JSON** | **Rp0** | ❌ Tidak Layak | Tidak untuk SPJ |

> **Prioritas #1:** Buat **Blueprint (prototype) dengan biaya Rp0** dulu menggunakan **Supabase Free Tier** atau **SQLite**. Setelah blueprint terbukti, baru upgrade ke yang berbayar.

---

## Skema Aplikasi SPJ

### Fitur Utama
1. **PENDATAAN** — Data sekolah (NPSN, nama, kecamatan, alamat) + data pejabat (KS, Bendahara, Pengawas, Sekdik)
2. **UPLOAD** — Upload Data Profil Sekolah + Data Guru & Tendik

### Bukti Fisik (9+ Kategori)
| Kategori | Sub-Kategori | Dokumen Terkait |
|---|---|---|
| **A. Honor** | Guru, Tendik, Penjaga, Perpus, Ekskul, Narsum, Upah Kerja | SK, Daftar Penerima |
| **B. Perjalanan Dinas** | Penerima, Surat Tugas, SPPD | Resume, Dokumen, Undangan |
| **C. Mamin** | Rapat, Kegiatan, Tamu | Undangan, Daftar Hadir, Resume, Foto |
| **D. Penggandaan** | Master dokumen | - |
| **E. Cetak Foto** | Bukti dokumen foto | - |
| **F. Cetak Banner** | Bukti foto banner | - |
| **G. Sewa** | Mobilitas, Sound, Kendaraan | SIM/STNK, foto |
| **H. Pemeliharaan** | Fasilitas, Peralatan, Bangunan | - |
| **I. Tagihan** | Listrik, Air | Data klasifikasi |

### Workshop
- **Internal:** Undangan, Daftar Hadir, Proposal, Resume, Foto, Honor Narsum
- **Eksternal:** + Surat Tugas Pemberangkatan

### Dokumen PBJ
- Perencanaan, Surat Pesanan, BAST, BAHP, Negosiasi Perbandingan
- Register KAS, BA Pemeriksaan KAS, Lembar Kritik/Saran, Papan BOS

### Lainnya
- Realisasi Dana BOSP, Cover, Sekat
- RKT, RKJM (opsional)
- Proposal, Program Kerja

### Pola Relasi Data (Kritis — Penting untuk Pilihan Database)

```
Sekolah → Pejabat (KS, Bendahara, Pengawas, Sekdik)
  ├── Honor → Penerima Honor → SK → Daftar Hadir
  ├── Perjalanan Dinas → Surat Tugas → SPPD → Resume → Dokumen
  ├── Mamin → Undangan → Daftar Hadir → Resume → Foto
  ├── Workshop → Proposal → Undangan → Daftar Hadir → Foto
  └── PBJ → Perencanaan → Surat Pesanan → BAST → BAHP
```

> **Implikasi:** Butuh database relasional (SQL). File-based JSON/CSV **tidak mampu** handle ini.

---

## Opsi Teknologi yang Dibandingkan

| No | Opsi | Database | Framework | Biaya Server/DB | Kebutuhan Internet |
|---|---|---|---|---|---|
| A | Web App + SQLite | SQLite (lokal) | Flask/PHP/Node.js | **Rp0** | ❌ Bisa offline |
| B | Web File-Based JSON | JSON/CSV | HTML+JS murni | **Rp0** | ❌ Bisa offline |
| C | Electron + JSON/SQLite | JSON/electron-store | Electron + React | **Rp0** | ❌ Bisa offline |
| D | Google Apps Script + Sheets | Google Sheets | GAS JavaScript | **Rp0** | ✅ Wajib online |
| E | **Supabase (Cloud)** | **PostgreSQL** | **React/Next.js** | **Rp0 → $25/bln** | ✅ Wajib online |
| F | VPS + PostgreSQL | PostgreSQL | React/Next.js/Vue | Rp87-190rb/bln | ✅ Wajib online |
| G | Firebase Firestore | Firestore NoSQL | React/Next.js | **Rp0 → pay/usage** | ✅ Wajib online |

---

## Analisis Per Opsi

### A. Web App + SQLite (Lokal) — 🆓 GRATIS

| Aspek | Detail |
|---|---|
| **Stack** | Python Flask + SQLite / PHP + SQLite / Node.js + better-sqlite3 |
| **Biaya Server/DB** | **Rp0** (tidak perlu server, database file `.db`) |
| **Cara Pakai** | Double-click script start server → buka browser → pakai |

**✅ Kelebihan:**
- **Offline 100%** — Tidak perlu internet
- **Database relasional** — SQL penuh (JOIN, Foreign Key, Transaction)
- **Satu file database** — Backup = copy file `.db`
- **Zero konfigurasi** — Tidak perlu install server DB
- **Ringan** — Bisa di PC RAM 2GB
- **Portabel** — Bisa dari flashdisk

**❌ Kekurangan:**
- **Single writer** — 1 tulis per waktu. 600 user perlu WAL mode + queue
- **Tidak multi-server** — Hanya 1 server melayani semua
- **Backup manual** — Harus ingat backup sendiri
- **Tidak ada akses remote** — Hanya jaringan lokal
- **Update manual** — Setiap rilis baru harus deploy ulang

**📊 600 User:** ⚠️ WAL mode + busy_timeout diperlukan. Risiko error `SQLITE_BUSY` jika banyak write bersamaan.

**🎯 Cocok untuk:** **Blueprint offline**, sekolah tanpa internet, atau MVP sementara sebelum migrasi ke PostgreSQL.

---

### B. Web App File-Based JSON — 🆓 GRATIS

**Database:** JSON/CSV file | **Biaya Server:** Rp0

**❌ TIDAK DIREKOMENDASIKAN** untuk aplikasi SPJ. Alasan:
- Tidak ada relasi data — Anda harus manual hubungkan honor→SK→penerima
- **Race condition** — 2 user nulis bersamaan → data corrupt
- Pencarian lambat — Harus load semua data ke RAM
- LocalStorage terbatas 5-10MB

> Hanya cocok untuk prototipe read-only **< 5 user**.

---

### C. Electron + JSON/SQLite — 🆓 GRATIS

**Database:** JSON/electron-store atau SQLite/better-sqlite3
**Biaya:** Rp0 (aplikasi desktop)

**❌ TIDAK DIREKOMENDASIKAN** untuk 600 user:
- Data **terisolasi** — Setiap komputer punya database sendiri. Untuk SPJ yang butuh data terpusat, ini **fatal**.
- Distribusi — Install aplikasi ke 600 komputer
- Update — Setiap bug fix, update 600 komputer
- Installer 150-250MB, RAM 300-500MB idle

> Hanya cocok untuk **aplikasi personal/single-user**.

---

### D. Google Apps Script + Spreadsheet — 🆓 GRATIS

**Database:** Google Sheets | **Biaya:** **Rp0** (Google Workspace for Education gratis)
**Cara Pakai:** Share link spreadsheet → user buka browser → langsung pakai

**✅ Kelebihan:**
- Gratis, tidak perlu install, distribusi instan
- Backup otomatis (version history Google Drive)
- Upload file ke Drive built-in
- Bisa generate PDF

**❌ FATAL untuk 600 User:**
| Limitasi | Nilai | Dampak |
|---|---|---|
| Concurrent editors | Maks ~100 | 600 user — 500 sisanya cuma bisa lihat |
| Sheets API write | 300/menit/project | 600 user → overload |
| GAS runtime | 6 menit/eksekusi | Batch processing bisa gagal |
| Bukan relasional | Spreadsheet | Data SPJ kompleks sulit di-maintain |
| Row Level Security | ❌ Tidak ada | Semua data di 1 sheet |

> **🎯 Hanya untuk < 50 user.** Untuk 600 user, aplikasi akan sering error dan lambat.

---

### E. Supabase (Cloud PostgreSQL) — 🆓 GRATIS untuk Blueprint

| Aspek | Detail |
|---|---|
| **Database** | PostgreSQL (full-featured RDBMS) |
| **Fitur** | Auth, Storage, Realtime, RLS, API auto-generated |
| **Framework** | React/Next.js/Vue + Supabase JS SDK |
| **Cara Pakai** | Deploy web app → user buka URL → login → pakai |

**✅ Kelebihan:**
- **PostgreSQL penuh** — Foreign key, constraint, JOIN, RLS, indexing
- **Auto REST API** — Setiap tabel langsung punya endpoint
- **Built-in Auth** — Email, Google OAuth, magic link
- **Built-in Storage** — Upload file/foto bukti fisik
- **Row Level Security** — Atur akses per role (Guru, Bendahara, KS, Admin)
- **Scalable** — 600 → 6000, tinggal upgrade tier
- **Self-host option** — Bisa host sendiri jika mau

**❌ Kekurangan:**
- **WAJIB internet** — Tidak bisa offline
- Free tier ada auto-pause (7 hari idle)
- Perlu paham SQL & RLS policies

**📊 600 User:**

| Aspek | Free Tier ($0) | Pro Tier ($25/bln) |
|---|---|---|
| Database | 500 MB ⚠️ MVP | 8 GB ✅ |
| Storage file | 1 GB ⚠️ MVP | 100 GB ✅ |
| MAU (user) | 50.000 ✅ | Unlimited ✅ |
| Daily backup | ❌ | ✅ 7 hari |
| Auto-pause | ❌ Ya (7 hari idle) | ✅ Tidak |
| Bandwidth | 5 GB/bln ⚠️ | 250 GB/bln ✅ |

**🎯 REKOMENDASI UTAMA:** Blueprint dengan **Free Tier (Rp0)**, lalu upgrade ke **Pro ($25/bln)** untuk produksi.

---

### F. VPS + PostgreSQL — Berbayar Mulai Rp87rb/bln

| Provider | Spesifikasi | Harga/Bulan | Harga/Tahun |
|---|---|---|---|
| **IDCloudHost** | 2 vCPU, 2GB RAM, 20GB NVMe | **Rp87.000** | Rp1.044.000 |
| **Hostinger** | 1 vCPU, 4GB RAM, 50GB NVMe | Rp116.900 | Rp1.402.800 |
| **Dewaweb** | 2 vCPU, 2GB RAM, 30GB SSD | Rp130.000 | Rp1.560.000 |
| **Biznet Gio** | 2 vCPU, 2GB RAM, 50GB | Rp135.000 | Rp1.620.000 |
| **DigitalOcean** | 2 vCPU, 2GB RAM, 60GB SSD | $12 (~Rp190.000) | Rp2.280.000 |

**Biaya Tambahan:**
- Domain .sch.id: Rp60.000 – Rp80.000/tahun
- SSL Let's Encrypt: **Gratis**

> **🎯 Alternatif jika ingin kontrol penuh & ada admin IT.** Wajib setup sendiri PostgreSQL, backup, security.

---

### G. Firebase Firestore — 🆓 GRATIS untuk Penggunaan Normal

**Database:** Firestore NoSQL | **Model:** Pay-per-operation

**Kuota Gratis Harian:** 50.000 reads, 20.000 writes, 20.000 deletes, 1GB storage

**Estimasi 600 User SPJ:**
- Reads/hari: 3.000 ✅ (di bawah 50.000)
- Writes/hari: 600 ✅ (di bawah 20.000)
- **Biaya: $0/bulan** untuk penggunaan normal

**❌ Kekurangan:**
- **NoSQL** — Tidak native JOIN/aggregate. Skema SPJ yang relasional harus di-denormalize manual
- **Write limit** — 1 write/detik per dokumen
- **Vendor lock-in tinggi** — Migrasi dari Firestore sangat sulit
- **Biaya tidak terprediksi** — Bisa melonjak jika ada bug

> **🎯 Alternatif jika Anda nyaman dengan NoSQL.** Tapi untuk skema SPJ yang kompleks, Supabase (PostgreSQL) lebih cocok.

---

## Skenario Blueprint (Prototype) — Prioritaskan Gratis!

> **Strategi:** Buat prototype dulu dengan biaya Rp0. Setelah aplikasi jadi dan terbukti bermanfaat, baru keluar biaya untuk produksi.

### 🥇 Skenario A: Supabase Free Tier (Rekomendasi untuk Online)

```
BIAYA BLUEPRINT: Rp0
──────────────────────────────────────────────

Yang Didapat:
✅ PostgreSQL 500MB — cukup untuk 600 user data SPJ
✅ Auth — email/password, Google OAuth
✅ Storage 1GB — upload foto bukti fisik (terbatas)
✅ REST API — auto-generated
✅ Row Level Security — atur akses per role

Cara Mulai:
1. Daftar akun Supabase (gratis) → https://supabase.com
2. Buat project baru → dapatkan URL + anon key
3. Buat tabel-tabel SPJ di SQL Editor
4. Buat frontend (Next.js/React) + Supabase SDK
5. Deploy ke Vercel (gratis) → share URL ke 600 user

Keterbatasan Free Tier (yang perlu diantisipasi):
- Storage 1GB → habis jika upload banyak foto
- Bandwidth 5GB/bln → cukup untuk akses data saja
- Auto-pause setelah 7 hari idle → akses tiap minggu
- Tidak ada backup otomatis → backup manual via dashboard

Durasi Blueprint: 3-6 bulan (cukup untuk uji coba)
→ Jika blueprint berhasil, upgrade ke Pro ($25/bln)
```

### 🥈 Skenario B: SQLite Lokal (Rekomendasi untuk Offline)

```
BIAYA BLUEPRINT: Rp0
──────────────────────────────────────────────

Yang Didapat:
✅ Database relasional SQL penuh (JOIN, FK, Transaction)
✅ Offline 100% — tidak perlu internet
✅ Satu file .db — backup tinggal copy
✅ Ringan — bisa di PC sekolah RAM 2GB

Cara Mulai:
1. Install Python/Node.js/PHP di komputer server
2. Buat aplikasi web dengan SQLite
3. Jalankan server lokal → akses via browser
4. Backup database seminggu sekali ke flashdisk

Durasi Blueprint: 3-6 bulan
→ Jika butuh akses dari luar, migrasi ke PostgreSQL
→ Jika butuh online, migrasi ke Supabase

Migrasi: SQLite → PostgreSQL/MYSQL relatif mudah
- Export SQL: sqlite3 spj.db .dump > backup.sql
- Import ke PostgreSQL: psql -d db_spj < backup.sql
- (Beberapa penyesuaian tipe data mungkin diperlukan)
```

### 🥉 Skenario C: Firebase (Alternatif Online)

```
BIAYA BLUEPRINT: Rp0
──────────────────────────────────────────────

Yang Didapat:
✅ Firestore NoSQL (kuota gratis harian)
✅ Authentication built-in
✅ Storage (Cloud Storage)
✅ Hosting gratis (Firebase Hosting)

Cocok untuk:
- Jika Anda sudah familiar dengan ekosistem Google/Firebase
- Jika aplikasi tidak memerlukan JOIN/relasi kompleks

Keterbatasan:
- NoSQL → harus denormalize data SPJ
- Query aggregate (SUM, COUNT) harus export ke BigQuery
- Migrasi ke database lain sangat sulit

Durasi Blueprint: 3-6 bulan
→ Jika sukses, siapkan budget untuk Blaze Plan (pay-as-you-go)
```

---

## Analisis Biaya Server & Database Saja

> **Catatan:** Biaya di bawah hanya untuk **server & database** — TIDAK termasuk listrik, internet, atau gaji IT.

### Ringkasan Biaya Server/Database

| Opsi | Biaya Bulanan | Biaya Tahunan | Biaya 5 Tahun | Gratis? |
|---|---|---|---|---|
| **SQLite (Lokal)** | **Rp0** ✅ | **Rp0** ✅ | **Rp0** ✅ | ✅ Sepenuhnya gratis |
| **GAS + Sheets** | **Rp0** ✅ | **Rp0** ✅ | **Rp0** ✅ | ✅ Sepenuhnya gratis |
| **Supabase Free** | **Rp0** ✅ | **Rp0** ✅ | **Rp0** ✅ | ✅ Sepenuhnya gratis |
| **Firebase (normal)** | **Rp0** ✅ | **Rp0** ✅ | **Rp0** ✅ | ✅ Dalam kuota gratis |
| **VPS PostgreSQL** (IDCloudHost) | Rp87.000 | Rp1.044.000 | Rp5.220.000 | ❌ |
| **VPS PostgreSQL** (DigitalOcean) | Rp190.000 | Rp2.280.000 | Rp11.376.000 | ❌ |
| **Supabase Pro** | Rp395.000 | Rp4.740.000 | Rp23.700.000 | ❌ |
| **Supabase Team** | Rp9.464.000 | Rp113.568.000 | Rp567.840.000 | ❌ |

### A. Biaya: Supabase (Cloud)

| Tier | Biaya | Database | Storage | Backup | Catatan |
|---|---|---|---|---|---|
| **Free** | **Rp0/bln** | 500 MB | 1 GB | ❌ | **Untuk Blueprint** |
| **Pro** | **$25/bln (~Rp395.000)** | 8 GB | 100 GB | ✅ 7 hari | **Produksi 600 user** |
| Team | $599/bln (~Rp9.464.000) | 8 GB | 100 GB | ✅ 14 hari | Untuk enterprise |

**Add-on (jika melebihi kuota):**
- Database tambahan: $0,125/GB/bln (~Rp2.000)
- Storage tambahan: $0,021/GB/bln (~Rp332)
- Bandwidth tambahan: $0,09/GB (~Rp1.422)
- Custom domain: $10/bln (~Rp158.000) — opsional

### B. Biaya: VPS + PostgreSQL

| Provider | Spesifikasi | Harga/Bln | Harga/Thn | Domain .sch.id/thn |
|---|---|---|---|---|
| **IDCloudHost** | 2 vCPU, 2GB, 20GB NVMe | **Rp87.000** | Rp1.044.000 | Rp60.000-80.000 |
| Hostinger | 1 vCPU, 4GB, 50GB NVMe | Rp116.900 | Rp1.402.800 | Rp60.000-80.000 |
| Dewaweb | 2 vCPU, 2GB, 30GB SSD | Rp130.000 | Rp1.560.000 | Rp60.000-80.000 |
| Biznet Gio | 2 vCPU, 2GB, 50GB | Rp135.000 | Rp1.620.000 | Rp60.000-80.000 |
| DigitalOcean | 2 vCPU, 2GB, 60GB SSD | $12 (~Rp190.000) | Rp2.280.000 | Rp60.000-80.000 |

**SSL:** Let's Encrypt **gratis**

### C. Biaya: Firebase Firestore

**Kuota gratis harian:** 50.000 reads, 20.000 writes, 20.000 deletes, 1GB storage

**Estimasi 600 user (pemakaian normal):**
- Total reads/hari: ~3.000 ✅ (di bawah 50.000)
- Total writes/hari: ~600 ✅ (di bawah 20.000)
- **Biaya: Rp0/bulan** ✅

**Skenario jika melebihi kuota:**
| Skenario | Biaya Tambahan |
|---|---|
| Bug infinite loop (1 juta writes) | ~$1,76 |
| Bot scraping (10 juta reads) | ~$5,97 |
| Upload 10.000 foto (20GB) | ~$3,60/bln |
| **Total skenario terburuk** | **~$12/bln (~Rp190.000)** |

⚠️ **Peringatan:** Pasang **Budget Alert** di Google Cloud Console!

---

## Jalur Migrasi (Free → Paid)

### Jalur 1: Supabase Free → Pro → Self-Host

```
BLUEPRINT (Rp0)              PRODUKSI (~Rp395rb/bln)       SELF-HOST (Rp0 server)
──────────────────────────    ────────────────────────    ────────────────────────
Supabase Free Tier            Supabase Pro Tier            Supabase Self-Host
                              ↓                             ↑
├─ PostgreSQL 500MB      →   ├─ PostgreSQL 8 GB        →   ├─ PostgreSQL (unlimited)
├─ Storage 1GB           →   ├─ Storage 100 GB             ├─ Storage (SSD sendiri)
├─ Auth 50.000 MAU       →   ├─ Auth unlimited             ├─ Auth (sama)
├─ Backup: ❌             →   ├─ Backup: ✅ 7 hari          ├─ Backup: script manual
├─ Auto-pause: ❌         →   ├─ Auto-pause: ✅ tidak       ├─ Auto-pause: ✅ tidak
│                           │                              │
└─ Migrasi: SQL export       └─ Migrasi: pg_dump            └─ Docker + Supabase stack
   & import ke Pro              & import ke self-host          di server sekolah

Waktu: 3-6 bulan              Waktu: 6-12 bulan              Waktu: kapan saja
```

### Jalur 2: SQLite → PostgreSQL (VPS) → Supabase

```
BLUEPRINT (Rp0)              PRODUKSI (Rp87-190rb/bln)     MIGRASI LANJUTAN
──────────────────────────    ──────────────────────────    ────────────────────────
SQLite Lokal                  VPS + PostgreSQL              Supabase Cloud
                              ↓                             ↑
├─ 1 file .db lokal       →   ├─ PostgreSQL di VPS      →   ├─ PostgreSQL managed
├─ Backup: copy file .db      ├─ Backup: pg_dump script     ├─ Backup: ✅ otomatis
├─ Offline 100%               ├─ Online (URL)               ├─ Online (URL)
├─ Single writer              ├─ Multi-writer               ├─ Multi-writer ✅
│                             │                             │
└─ Migrasi:                   └─ Migrasi:                   └─ Bisa tetap di VPS
   sqlite3 db.db .dump          pg_dump > backup.sql          (tidak wajib migrasi)
   > backup.sql                 psql -d db_spj < backup.sql
```

### Jalur 3: Firebase → Supabase (Jika Butuh Migrasi)

⚠️ **Migrasi dari Firestore (NoSQL) ke PostgreSQL (SQL) tidak sepele:**
- Data harus di-export dari Firestore ke JSON
- Schema PostgreSQL harus dibuat ulang
- Data di-transform dari dokumen NoSQL ke tabel relasional
- Kode frontend perlu diubah (Firebase SDK → Supabase SDK)

> **Saran:** Jika Anda ragu antara Firebase dan Supabase untuk aplikasi SPJ, **langsung pilih Supabase dari awal**. Migrasi NoSQL → SQL sangat merepotkan.

---

## Tabel Perbandingan Lengkap

| Kriteria | Web+SQLite | Web JSON | Electron | GAS Sheets | **Supabase** | VPS+PG | Firebase |
|---|---|---|---|---|---|---|---|
| **Biaya Server/DB/bln** | **Rp0** | **Rp0** | **Rp0** | **Rp0** | **Rp0-$395rb** | Rp87-190rb | Rp0-$190rb |
| **Biaya Server/DB/thn** | **Rp0** | **Rp0** | **Rp0** | **Rp0** | **Rp0-Rp4,7jt** | Rp1-2,3jt | Rp0-Rp2,3jt |
| **Database Relasional** | ✅✅✅ | ❌ | ❌✅ (SQLite) | ⚠️ | **✅✅✅** | ✅✅✅ | ❌ NoSQL |
| **Offline** | ✅✅✅ | ✅✅✅ | ✅✅✅ | ❌ | ❌ | ❌ | ⚠️ Parsial |
| **600 User Concurrent** | ⚠️ WAL | ❌ | ❌ | ❌ | **✅✅✅** | ✅✅✅ | ⚠️ |
| **Upload File** | ⚠️ Manual | ❌ | ❌ | ✅✅ Drive | **✅✅ Storage** | ⚠️ Manual | ✅✅ Storage |
| **Auth Built-in** | ❌ | ❌ | ❌ | ❌ | **✅✅✅** | ❌ | ✅✅ |
| **RLS (Role Access)** | ❌ | ❌ | ❌ | ❌ | **✅✅✅** | ❌ Buat manual | ⚠️ Custom Claims |
| **Distribusi 600 User** | ⚠️ Setup | ⚠️ Setup | ❌ Install | ✅✅ Link | **✅✅ URL** | ✅✅ URL | ✅✅ URL |
| **Update Otomatis** | ❌ Manual | ❌ Manual | ❌ Manual | ✅✅✅ | **✅✅✅** | ⚠️ Manual | ✅✅✅ |
| **Backup Otomatis** | ❌ Manual | ❌ Manual | ❌ Manual | ✅✅✅ | **✅✅ (Pro)** | ❌ Manual | ⚠️ Manual |
| **Kustomisasi UI** | ✅✅ | ✅✅ | ✅✅✅ | ⚠️ | **✅✅✅** | ✅✅✅ | ✅✅✅ |
| **Kemudahan Setup** | ✅✅ Mudah | ✅✅✅ | ⚠️ | ✅✅✅ | **✅✅ Cukup** | ⚠️ Kompleks | ✅✅ |
| **Skalabilitas** | ❌ 1 server | ❌ | ❌ | ❌ | **✅✅✅** | ⚠️ Upgrade VPS | ✅✅✅ |

---

## Matriks Keputusan

### Untuk Blueprint (Awal) — Prioritaskan GRATIS

| Kondisi | Pilihan Blueprint (Rp0) | Biaya |
|---|---|---|
| Ada internet, ingin cepet jadi | **Supabase Free Tier** ✅ | **Rp0** |
| Tidak ada internet / offline | **SQLite Lokal** ✅ | **Rp0** |
| Sudah familiar Google/Firebase | **Firebase Free** ✅ | **Rp0** |
| Hanya < 50 user, ingin paling cepat | **GAS + Sheets** ⚠️ | **Rp0** |

### Untuk Produksi (Setelah Blueprint Berhasil)

| Kondisi | Pilihan Produksi | Biaya Server/DB |
|---|---|---|
| Internet stabil, ingin praktis | **Supabase Pro** 🥇 | ~Rp395rb/bln |
| Ada admin IT, ingin murah | **VPS PostgreSQL** 🥈 | Rp87-190rb/bln |
| Offline, tidak ada internet | **SQLite + migrasi ke VPS** 🥉 | Rp0 → Rp87rb |
| Ingin NoSQL, sudah pengalaman Firebase | **Firebase Blaze** | Rp0-Rp190rb/bln |

### Keputusan Cepat

```
Rp0/bln     → Pakai Supabase Free Tier untuk blueprint
              (atau SQLite jika offline)
Rp87rb/bln  → VPS IDCloudHost + PostgreSQL (jika ada admin IT)
Rp395rb/bln → Supabase Pro (paling praktis, no maintenance)
```

---

## Rekomendasi Akhir

### 🥇 Supabase: Blueprint (Rp0) → Produksi ($25/bln)

```
┌──────────────────────────────────────────────────────────┐
│  REKOMENDASI UTAMA                                        │
│                                                           │
│  BLUEPRINT (Bulan 1-6): Supabase Free Tier                │
│  ─────────────────────────────────────                    │
│  Biaya:                    Rp0                            │
│  Database:                 PostgreSQL 500MB               │
│  Storage:                  1 GB                           │
│  Auth:                     Email/Google OAuth             │
│  User:                     600 user ✅                   │
│  Cukup untuk:              Uji coba fitur SPJ lengkap     │
│                                                           │
│  ↓ Setelah blueprint berhasil...                          │
│                                                           │
│  PRODUKSI (Bulan 7+): Supabase Pro ($25/bln)             │
│  ─────────────────────────────────────                    │
│  Biaya:                    ~Rp395.000/bulan               │
│  Database:                 PostgreSQL 8 GB ✅             │
│  Storage:                  100 GB ✅                     │
│  Backup:                   Daily ✅                       │
│  No auto-pause:            ✅                             │
│                                                           │
│  Kelebihan:                                               │
│  ✅ Mulai gratis untuk blueprint                          │
│  ✅ PostgreSQL — relasi data SPJ terhandle               │
│  ✅ RLS — atur akses 600 user per role                    │
│  ✅ Storage — upload bukti fisik                          │
│  ✅ Auth — login langsung jadi                            │
│  ✅ Distribusi — cukup share URL                          │
│  ✅ Update — otomatis                                     │
│  ✅ Scalable — 600 → 6000, tinggal upgrade               │
│  ✅ Backup otomatis — tidak perlu khawatir                │
└──────────────────────────────────────────────────────────┘
```

### 🥈 VPS PostgreSQL: Jika Ada Admin IT

```
┌──────────────────────────────────────────────────────────┐
│  ALTERNATIF MURAH (Self-Managed)                          │
│                                                           │
│  Biaya: Rp87.000 - Rp190.000/bulan (VPS)                 │
│         Rp1.044.000 - Rp2.280.000/tahun                  │
│                                                           │
│  Cocok: Sekolah dengan staf IT                           │
│  Risiko: Backup & security manual                        │
│  Setup: 40-80 jam (instalasi PostgreSQL, konfigurasi)    │
└──────────────────────────────────────────────────────────┘
```

### 🥉 SQLite Lokal: Jika Offline / Darurat

```
┌──────────────────────────────────────────────────────────┐
│  DARURAT / OFFLINE (Hanya Sementara)                      │
│                                                           │
│  Biaya Server/DB: Rp0                                    │
│  Offline: ✅ 100%                                        │
│                                                           │
│  Risiko:                                                  │
│  ⚠️ Error SQLITE_BUSY jika banyak write bersamaan        │
│  ⚠️ Tidak bisa akses dari luar sekolah                   │
│  ⚠️ Backup manual — risiko hilang data                   │
│                                                           │
│  Rencanakan migrasi ke PostgreSQL ASAP!                   │
└──────────────────────────────────────────────────────────┘
```

---

## Ringkasan Biaya Berdasarkan Tahap

| Tahap | Biaya Server/DB | Aktivitas |
|---|---|---|
| **Blueprint (Rp0)** | **Rp0** | Supabase Free / SQLite / Firebase Free |
| **Produksi Awal** | ~Rp87-395rb/bln | VPS atau Supabase Pro |
| **Skala Besar** | ~Rp395rb-9,5jt/bln | Supabase Pro/Team atau VPS di-upgrade |

---

> **Kurs USD:** $1 = Rp15.800 (estimasi). Harga dapat berubah sewaktu-waktu.
> **Biaya di atas hanya untuk SERVER & DATABASE.** Tidak termasuk listrik, internet, atau gaji staf IT.
> **Dokumen ini dibuat berdasarkan riset dari 25+ sumber.**
> **Untuk info harga terkini, cek langsung ke website provider masing-masing.**
