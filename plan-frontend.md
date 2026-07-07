# Frontend Blueprint: Aplikasi SPJ (Surat Pertanggungjawaban)

## Overview

Aplikasi web untuk mengelola dokumen SPJ (Surat Pertanggungjawaban) dana BOS/BOSP sekolah. Membantu operator sekolah upload data BKU (Buku Kas Umum), mengelola bukti fisik, menyusun dokumen SPJ, dan cetak/export laporan ke PDF.

**Target User:** Admin/Operator Sekolah
**Tech Stack:** React + Vite + Tailwind CSS (Prototype/UI Blueprint)
**Output:** PDF + Print

---

## Tech Requirements

| Component | Technology |
|-----------|------------|
| Framework | React 18+ with Vite |
| Styling | Tailwind CSS |
| State Management | React Context / Zustand (lightweight) |
| Routing | React Router v6 |
| PDF Generation | html2pdf.js / react-to-print / jsPDF |
| Icons | Lucide React / Heroicons |

---

## Route Map

```
/                    -> Landing Page (Sampurasun)
/login               -> Halaman Login
/dashboard           -> Dashboard Utama
/data-sekolah        -> Input/Upload Data Sekolah
/data-guru           -> Input/Upload Data Guru & Tendik
/bku                 -> BKU (Buku Kas Umum) - Tabel Transaksi
/bku/cetak/:id       -> Halaman Cetak Dokumen SPJ (per transaksi)
/dokumen-wajib       -> Dokumen Wajib (Luar ARKAS)
/realisasi           -> Realisasi Dana BOSP
/pengaturan          -> Pengaturan Aplikasi
```

---

## Page: Landing Page (`/`)

**Tujuan:** Halaman pembuka dengan branding sekolah dan informasi aplikasi.

**Layout:**
- Header: Logo Sekolah + Menu (Berita, Kontak)
- Hero Section: "Sampurasun! Selamat Datang" + Deskripsi + Tombol Login
- Features Section: 3-4 Card fitur utama
- Info Section: Tentang Aplikasi, Kontak, Version
- Footer: Copyright

**Components:** LandingNavbar, HeroSection, FeaturesSection, InfoSection, Footer

---

## Page: Login (`/login`)

**Tujuan:** Halaman login dengan animasi profesional dan informasi aplikasi.

**Layout (Split):**
- Kiri: Animasi Ilustrasi (SVG/Video loop)
- Kanan: Form Login (Username + Password + Tombol Login)
- Bawah: Info Versi, Copyright, Developer

**Components:** LoginIllustration, LoginForm, AppInfo

**Features:** Form validation, Loading state, Error message, Animasi transisi smooth

---

## Page: Dashboard (`/dashboard`)

**Tujuan:** Ringkasan data sekolah, status dokumen, dan akses cepat.

**Layout:**
- Sidebar navigasi (kiri)
- Content (kanan):
  - Stats Cards: Total BKU, Total Dokumen
  - Tabel BKU Terbaru (5 baris terakhir)
  - Status Dokumen: Progress bar per jenis

**Components:** StatsCards, RecentBKUTable, DocumentProgress

---

## Sidebar Menu Structure

```
+-----------------+
|  LOGO SEKOLAH   |
|  Nama Sekolah   |
+-----------------+
|  Dashboard      |
|  Data Sekolah   |
|  Data Guru      |
|  BKU            |
|  Dokumen SPJ    |
|  Dokumen Wajib  |
|  Realisasi      |
|  Pengaturan     |
+-----------------+
|  User Info      |
|  [Logout]       |
+-----------------+
```

**Menu Items:**

| Label | Route | Deskripsi |
|-------|-------|-----------|
| Dashboard | /dashboard | Ringkasan data |
| Data Sekolah | /data-sekolah | Input/upload data sekolah |
| Data Guru | /data-guru | Input/upload data guru & tendik |
| BKU | /bku | Tabel transaksi BKU |
| Dokumen SPJ | /bku/cetak/:id | Halaman cetak dokumen per transaksi |
| Dokumen Wajib | /dokumen-wajib | Dokumen di luar ARKAS (PBJ, Register KAS, dll) |
| Realisasi | /realisasi | Realisasi Dana BOSP (Cover, Sekat, Alur) |
| Pengaturan | /pengaturan | Konfigurasi aplikasi |

---

## Page: Data Sekolah (`/data-sekolah`)

**Tujuan:** Input dan upload data profil sekolah.

**Layout:**
- Tab Switcher: Form | Upload
- Form Tab: Input manual field-field data sekolah + pejabat
- Upload Tab: Drag & Drop / Browse file Excel (.xlsx)

**Form Fields (Data Sekolah):**

| Field | Type | Required |
|-------|------|----------|
| NPSN | text | Yes |
| Nama Sekolah | text | Yes |
| Kecamatan | text | Yes |
| Kabupaten | text | Yes |
| Alamat Sekolah | text | Yes |
| Email | email | No |

**Form Fields (Data Pejabat):**

| Field | Type | Required |
|-------|------|----------|
| Nama KS | text | Yes |
| NIP KS | text | Yes |
| Nama Bendahara | text | Yes |
| NIP Bendahara | text | Yes |
| Nama Pengawas | text | Yes |
| NIP Pengawas | text | Yes |
| Nama Sekdik | text | Yes |
| NIP Sekdik | text | Yes |

**Components:** DataSekolahForm, DataSekolahUpload, TabSwitcher

---

## Page: Data Guru (`/data-guru`)

**Tujuan:** Input dan upload data guru & tendik.

**Layout:** Sama seperti Data Sekolah - Form + Upload tab + Tabel daftar guru

**Form Fields:**

| Field | Type | Required |
|-------|------|----------|
| Nama Guru | text | Yes |
| NIP | text | Yes |
| NUPTK | text | No |
| Golongan | select | Yes |
| Jabatan | text | Yes |
| Mata Pelajaran | text | Yes |
| Status | select (PNS/CPNS/PPP/Honorer) | Yes |

**Components:** DataGuruForm, DataGuruUpload, DataGuruTable

---

## Page: BKU (`/bku`)

**Tujuan:** Tabel transaksi BKU seperti Excel, dengan fitur filter periode dan aksi cetak.

**Layout:**
- Filter Periode: Dropdown Bulan, Tahun, Semester
- Tabel BKU dengan kolom:
  - No | Tanggal | Uraian | Kode Rekening | Debet | Kredit | Saldo | Bukti | Aksi (Print Icon)
- Tombol Aksi: + Tambah Transaksi | Import Excel | Export PDF

**Features:**
- Sort by column (ascending/descending)
- Filter by period (Bulan, Tahun, Semester)
- Auto-calculate Saldo (Debet - Kredit berjalan)
- Click print icon -> Navigate to `/bku/cetak/:id`

**Components:** BKUTable, BKUFilter, BKUActions, PrintButton

---

## Page: Cetak Dokumen (`/bku/cetak/:id`)

**Tujuan:** Halaman utama untuk menyusun dan mencetak dokumen SPJ per transaksi BKU. Mendukung multi-document switching dan multi-page preview.

**Layout (Split View):**

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Info Transaksi (No, Tanggal, Uraian)   [← Kembali]   │
├───────────────────┬─────────────────────────────────────────────┤
│                   │                                             │
│  Card Grid        │  Document Editor        Document Preview   │
│  (Kategori)       │  (Form Input)           (Real-time)        │
│                   │                                             │
│  ┌─────────────┐  │  ┌──────────────────┐  ┌────────────────┐  │
│  │ Honor       │  │  │ Isian Dokumen    │  │                │  │
│  │ 🟢 Lengkap  │  │  │                  │  │  [Preview]     │  │
│  ├─────────────┤  │  │ Field 1: ____    │  │                │  │
│  │ Perjalanan  │  │  │ Field 2: ____    │  │                │  │
│  │ 🟡 Draft    │  │  │ Field 3: ____    │  │                │  │
│  ├─────────────┤  │  │                  │  │                │  │
│  │ Mamin Rapat │  │  │ [Simpan Draft]   │  │                │  │
│  │ 🔴 Belum    │  │  │                  │  │                │  │
│  ├─────────────┤  │  └──────────────────┘  └────────────────┘  │
│  │ ...         │  │                                             │
│  └─────────────┘  ├─────────────────────────────────────────────┤
│                   │  [Cetak Dokumen] [Export PDF] [Cetak Semua] │
└───────────────────┴─────────────────────────────────────────────┘
```

### 1. Card Grid — Multi-Document Type Switching

**Tujuan:** User bisa switch antar jenis dokumen tanpa mengubah data BKU yang dipilih.

**Kategori Card:**

| Card | Ikon | Keterangan | Status Indicator |
|------|------|------------|------------------|
| Honor | 💰 | Daftar penerima honor, SK, Narsum | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Perjalanan Dinas | ✈️ | SPPD, Surat Tugas, Resume | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Mamin Rapat | ☕ | Undangan, Daftar Hadir, Foto | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Mamin Kegiatan | ☕ | Undangan/Surat Perintah, Daftar Hadir | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Mamin Tamu | ☕ | Undangan, Daftar Hadir, Foto | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Penggandaan | 📄 | Master dokumen yang digandakan | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Cetak Foto | 📷 | Bukti foto | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Cetak Banner | 🖼️ | Bukti foto banner/spanduk | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Sewa | 🚗 | Sewa mobilitas, sound, kendaraan | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Pemeliharaan | 🔧 | Servis fasilitas, peralatan, bangunan | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Tagihan | ⚡ | Listrik, Air | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Workshop Internal | 🎓 | Undangan, Daftar Hadir, Proposal | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| Workshop Eksternal | 🎓 | Undangan, Daftar Hadir, Surat Tugas | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |
| PR (Pengadaan) | 📋 | Proposal, Program Kerja, Surat | 🟢 Lengkap / 🟡 Draft / 🔴 Belum |

**Status Legend:**

| Status | Icon | Warna | Keterangan |
|--------|------|-------|------------|
| Lengkap | 🟢 | Hijau | Semua field sudah terisi |
| Draft | 🟡 | Kuning | Sebagian field terisi, belum lengkap |
| Belum | 🔴 | Merah | Belum ada data |

**Switching Behavior:**

| Aksi | Hasil |
|------|-------|
| Klik Card | Load form dokumen + preview per jenis |
| Card sudah ada data | Tampilkan data yang sudah diisi |
| Card belum ada data | Tampilkan form kosong dengan default value dari BKU |
| Switch card | Simpan draft otomatis, load card baru |

### 2. Document Editor — Form Input

**Tujuan:** Form input/edit dokumen per jenis. Default value diambil dari BKU, user bisa override.

**Form Fields per Jenis:**

| Jenis Dokumen | Field Utama |
|---------------|-------------|
| Honor | Nama, Jabatan, Golongan, SK, Narsum, Jumlah |
| Perjalanan Dinas | Nama, Pangkat, Gol, SKP, Tanggal, Tujuan, transport |
| Mamin Rapat | Undangan, Daftar Hadir, Foto, Notulensi |
| Mamin Kegiatan | Undangan/Surat Perintah, Daftar Hadir, Foto, Notulensi |
| Mamin Tamu | Undangan, Daftar Hadir, Foto, Notulensi |
| Penggandaan | Master Dokumen, Jumlah Lembar, Biaya |
| Cetak Foto | Deskripsi, Ukuran, Biaya |
| Cetak Banner | Deskripsi, Ukuran, Biaya |
| Sewa | Jenis Sewa, Lama Sewa, Biaya |
| Pemeliharaan | Jenis Pemeliharaan, Biaya |
| Tagihan | Jenis Tagihan, Jumlah Bulan, Biaya |
| Workshop Internal | Undangan, Daftar Hadir, Proposal, Notulensi |
| Workshop Eksternal | Undangan, Daftar Hadir, Surat Tugas, Notulensi |
| PR (Pengadaan) | Proposal, Program Kerja, Surat Pengadaan |

**Editor Actions:**

| Tombol | Fungsi |
|--------|--------|
| Simpan Draft | Simpan data tanpa publish |
| Preview | Update preview kanan |
| Reset | Kosongkan form |
| Copy dari BKU | Auto-fill dari data BKU |

### 3. Document Preview — Multi-Page Handling

**Tujuan:** Preview real-time dokumen yang sedang di-edit. Mendukung multi-page preview dengan navigasi halaman.

**Preview Layout:**

```
┌─────────────────────────────────────────┐
│  Preview Controls                        │
│  [Zoom -] [100%] [Zoom +] | [1] [2] [3] │
│  Halaman 1 dari 3          [◀] [▶]      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │     Document Preview Area       │   │
│  │     (Real-time update)          │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Preview Controls:**

| Control | Fungsi | Default |
|---------|--------|---------|
| Zoom In | Perbesar preview | 100% |
| Zoom Out | Perkecil preview | — |
| Page Number | Input nomor halaman | 1 |
| Prev/Next | Navigasi halaman | — |
| Fullscreen | Preview full screen | — |
| Fit to Width | Sesuaikan lebar | — |

**Multi-Page Logic:**

| Kondisi | Handling |
|---------|----------|
| Dokumen 1 halaman | Preview statis, navigasi halaman disabled |
| Dokumen multi-halaman | Preview per halaman, navigasi aktif |
| Data melebihi 1 halaman | Auto-split ke halaman berikutnya |
| Preview update | Highlight area yang baru diubah |

### 4. Footer Actions — Cetak & Export

**Tombol Aksi:**

| Tombol | Fungsi | Output |
|--------|--------|--------|
| Cetak Dokumen | Cetak dokumen yang sedang dipilih | Printer dialog |
| Export PDF | Generate PDF dokumen yang dipilih | `.pdf` download |
| Cetak Semua | Cetak semua dokumen yang sudah lengkap | Printer dialog (batch) |
| Export Semua | Export semua dokumen jadi 1 PDF gabungan | `.pdf` download (multi-page) |

**Batch Processing:**

| Aksi | Keterangan |
|------|------------|
| Cetak Semua | Loop semua card dengan status 🟢, cetak satu per satu |
| Export Semua | Gabung semua dokumen lengkap jadi 1 file PDF |
| Progress Bar | Tampilkan progress saat cetak/export batch |

**Components:** DocumentSidebar, DocumentCard, DocumentEditor, DocumentPreview, PreviewControls, PrintActions, BatchProcessor

---

## Page: Dokumen Wajib (`/dokumen-wajib`)

**Tujuan:** Mengelola dokumen wajib di luar ARKAS yang harus dilampirkan dalam SPJ.

**Layout:**
- Header: Judul + Info mode (SIPLAH / Tidak SIPLAH)
- Toggle Switch: "Menggunakan SIPLAH?" (Yes/No)
- Section Cards: Dokumen PBJ, Dokumen Tambahan (conditional)

**Section 1 — Dokumen PBJ (selalu tampil):**

| Card | Ikon | Status | Field |
|------|------|--------|-------|
| Dok. PBJ | FileText | uploaded/pending | Upload foto dokumen |

**Section 2 — Jika SIPLAH (tampil saat toggle ON):**
Hanya Dok. PBJ (sudah ada di atas).

**Section 3 — Jika Tidak SIPLAH (tampil saat toggle OFF):**

| Card | Ikon | Status | Field |
|------|------|--------|-------|
| Register KAS | BookOpen | uploaded/pending | Upload foto |
| Berita Acara Pemeriksaan KAS | ClipboardCheck | uploaded/pending | Upload foto |
| Lembar Kritik & Saran | MessageSquare | uploaded/pending | Upload foto |
| Lembar Pengaduan | AlertCircle | uploaded/pending | Upload foto |
| Papan BOS | Monitor | uploaded/pending | Upload foto |

**Features:**
- Toggle SIPLAH/Non-SIPLAH mengubah jumlah dokumen yang ditampilkan
- Upload foto langsung (bukti fisik)
- Status badge: "Lengkap" (hijau) / "Belum Lengkap" (kuning)
- Progress bar: X dari Y dokumen sudah diupload

**Components:** DokumenWajibPage, DokumenCard, UploadDokumen, SiplahToggle

---

## Page: Realisasi Dana BOSP (`/realisasi`)

**Tujuan:** Mengelola dokumen realisasi dana BOSP — cover, sekat, dan alur penggunaan dana.

**Layout:**
- Header: Judul + Tahun Anggaran
- Tab Navigation: Cover | Sekat | Alur
- Content: Form / Upload per tab

**Tab 1 — Cover:**

| Field | Type | Required |
|-------|------|----------|
| Tahun Anggaran | text | Yes |
| Nama Sekolah | text (auto) | Yes |
| Dana BOSP | number | Yes |
| Sumber Dana | text | Yes |

**Tab 2 — Sekat:**

| Field | Type | Required |
|-------|------|----------|
| Kode Rekening | text | Yes |
| Uraian | text | Yes |
| Anggaran | number | Yes |
| Realisasi | number | Yes |
| Selisih | number (auto) | Auto |

**Tab 3 — Alur:**
- Upload / Input alur penggunaan dana
- Format: urutan langkah penggunaan dana

**Features:**
- Auto-hitung selisih (Anggaran - Realisasi)
- Export per tab ke PDF
- Real-time validation

**Components:** RealisasiPage, CoverForm, SekatTable, AlurFlow

---

### Filter Tab Kategori

```
┌─────────────────────────────────────────────────────────────┐
│  [Semua] [BKU Utama] [Dokumen Wajib] [Realisasi]           │
└─────────────────────────────────────────────────────────────┘
```

---

### 1. BKU Utama (17 Template)

#### Kartu Tipe A: BKU Utama (Edit + Download)

```
┌──────────────────────────────────────┐
│  ╔══════════════════════════════════╗ │  ← Gradient Header (per kategori)
│  ║  💰                             ║ │
│  ╚══════════════════════════════════╝ │
│                                      │
│  Honorarium                          │  ← Judul (font-semibold)
│  SK + Daftar Penerima + Kwitansi     │  ← Sub-jenis (text-gray-500)
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐        │  ← Action Buttons
│  │ 👁️ │ │ ✏️ │ │ 🖨 │ │ ⬇️ │        │     (Lihat/Preview, Edit,
│  └────┘ └────┘ └────┘ └────┘        │      Cetak, Download)
└──────────────────────────────────────┘
```

#### Layout Kartu — Spesifikasi

| Properti | Nilai Tailwind |
|----------|----------------|
| Container | `bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300` |
| Lebar | `w-full sm:w-64 lg:w-72` (responsif grid) |
| Padding | `p-6` |
| Icon Area | `w-12 h-12 rounded-xl bg-gradient-to-br from-[color1] to-[color2] flex items-center justify-center` |
| Judul | `text-lg font-semibold text-gray-900 mt-4` |
| Sub-jenis | `text-sm text-gray-500 mt-1` |
| Action Buttons | `rounded-full p-2 hover:bg-gray-100 transition-colors` |

#### Gradient Warna per Sub-Kategori BKU

| Sub-Kategori | Gradient | Contoh Dokumen |
|--------------|----------|----------------|
| **Honor & Narasumber** | `from-blue-500 to-indigo-600` | HON, HON-P, NSB |
| **Perjalanan Dinas** | `from-emerald-500 to-teal-600` | PD |
| **Makan & Minum** | `from-orange-500 to-amber-600` | MR, MK, MT |
| **Dokumen Pendukung** | `from-purple-500 to-violet-600` | PG, CF, CB |
| **Sewa & Pemeliharaan** | `from-rose-500 to-pink-600` | SW, PL, TG |
| **Workshop** | `from-cyan-500 to-sky-600` | WS-I, WS-E |
| **Pengadaan & Koran** | `from-gray-600 to-slate-700` | PR, RK |

#### Contoh Kartu per Jenis

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  ╔═══════════════╗  │  │  ╔═══════════════╗  │  │  ╔═══════════════╗  │
│  ║  💰  (biru)   ║  │  │  ║  🎤  (biru)   ║  │  │  ║  🚗  (hijau)  ║  │
│  ╚═══════════════╝  │  │  ╚═══════════════╝  │  │  ╚═══════════════╝  │
│                     │  │                     │  │                     │
│  Honorarium         │  │  Narasumber         │  │  Perjalanan Dinas   │
│  SK + Daftar +      │  │  Surat Undangan +   │  │  SPPD + Surat +     │
│  Kwitansi           │  │  Kwitansi           │  │  Resume + Kwitansi  │
│                     │  │                     │  │                     │
│  👁️ ✏️ 🖨 ⬇️        │  │  👁️ ✏️ 🖨 ⬇️        │  │  👁️ ✏️ 🖨 ⬇️        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

### 2. Dokumen Wajib (6 Template)

#### Kartu Tipe B: Dokumen Wajib (Upload Foto)

```
┌──────────────────────────────────────┐
│  ╔══════════════════════════════════╗ │  ← Gradient: emerald → teal
│  ║  📑                             ║ │
│  ╚══════════════════════════════════╝ │
│                                      │
│  Dokumen PBJ                         │
│  Upload foto dokumen                 │
│                                      │
│  ┌────────────────────────────────┐  │
│  │      ⬆️ Upload Foto            │  │  ← CTA Button (primary)
│  └────────────────────────────────┘  │
│                                      │
│  Status: ✅ Tersedia                 │  ← Status Badge
│  Last update: 15 Jan 2025            │
└──────────────────────────────────────┘
```

#### Spesifikasi Kartu Dokumen Wajib

| Properti | Nilai |
|----------|-------|
| Gradient | `from-emerald-500 to-teal-600` |
| Status Badge | ✅ Tersedia (`bg-green-100 text-green-700`) / ⏳ Belum Diisi (`bg-yellow-100 text-yellow-700`) |
| Upload Button | `w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90` |
| Hover Effect | Card: `hover:shadow-xl hover:-translate-y-1` |

#### Contoh Kartu per Jenis (Non-SIPLAH)

```
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  ╔═════════════╗  │ │  ╔═════════════╗  │ │  ╔═════════════╗  │
│  ║  📑  (hijau)║  │ │  ║  📒  (hijau)║  │ │  ║  📋  (hijau)║  │
│  ╚═════════════╝  │ │  ╚═════════════╝  │ │  ╚═════════════╝  │
│                   │ │                   │ │                   │
│  Dok. PBJ         │ │  Register KAS     │ │  BAP KAS          │
│  Upload foto      │ │  Upload foto      │ │  Upload foto      │
│                   │ │                   │ │                   │
│  [⬆️ Upload]      │ │  [⬆️ Upload]      │ │  [⬆️ Upload]      │
│  ✅ Tersedia      │ │  ⏳ Belum Diisi   │ │  ⏳ Belum Diisi   │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

### 3. Realisasi Dana BOSP (3 Template)

#### Kartu Tipe C: Realisasi (Form Input)

```
┌──────────────────────────────────────┐
│  ╔══════════════════════════════════╗ │  ← Gradient: orange → red
│  ║  📊                             ║ │
│  ╚══════════════════════════════════╝ │
│                                      │
│  Cover Realisasi                     │
│  Form input data cover realisasi     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │      ✏️ Isi Form               │  │  ← CTA Button (warning)
│  └────────────────────────────────┘  │
│                                      │
│  Status: ⏳ Belum Diisi              │
└──────────────────────────────────────┘
```

#### Contoh Kartu per Jenis

```
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│  ╔═════════════╗  │ │  ╔═════════════╗  │ │  ╔═════════════╗  │
│  ║  📊 (oranye)║  │ │  ║  📊 (oranye)║  │ │  ║  📊 (oranye)║  │
│  ╚═════════════╝  │ │  ╚═════════════╝  │ │  ╚═════════════╝  │
│                   │ │                   │ │                   │
│  Cover Realisasi  │ │  Sekat Realisasi  │ │  Alur Realisasi   │
│  Form input data  │ │  Tabel anggaran   │ │  Alur penggunaan  │
│                   │ │  vs realisasi     │ │  dana             │
│  [✏️ Isi Form]    │ │  [✏️ Isi Form]    │ │  [✏️ Isi Form]    │
│  ⏳ Belum Diisi   │ │  ⏳ Belum Diisi   │ │  ⏳ Belum Diisi   │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

---

### Summary Semua Template (26 Jenis)

**Kelompok BKU Utama (17 jenis):**

| No | Kode | Template | Sub-Kategori | Gradient |
|----|------|----------|--------------|----------|
| 1 | HON | Honor | Honor & Narasumber | `blue → indigo` |
| 2 | HON-P | Honor Pelaksana | Honor & Narasumber | `blue → indigo` |
| 3 | NSB | Narasumber | Honor & Narasumber | `blue → indigo` |
| 4 | PD | Perjalanan Dinas | Perjalanan Dinas | `emerald → teal` |
| 5 | MR | Makan Rapat | Makan & Minum | `orange → amber` |
| 6 | MK | Makan Kegiatan | Makan & Minum | `orange → amber` |
| 7 | MT | Makan Tamu | Makan & Minum | `orange → amber` |
| 8 | PG | Penggandaan | Dokumen Pendukung | `purple → violet` |
| 9 | CF | Cetak Foto | Dokumen Pendukung | `purple → violet` |
| 10 | CB | Cetak Banner | Dokumen Pendukung | `purple → violet` |
| 11 | SW | Sewa | Sewa & Pemeliharaan | `rose → pink` |
| 12 | PL | Pemeliharaan | Sewa & Pemeliharaan | `rose → pink` |
| 13 | TG | Tagihan | Sewa & Pemeliharaan | `rose → pink` |
| 14 | WS-I | Workshop Internal | Workshop | `cyan → sky` |
| 15 | WS-E | Workshop Eksternal | Workshop | `cyan → sky` |
| 16 | PR | PR Pengadaan | Pengadaan & Koran | `gray → slate` |
| 17 | RK | Rekening Koran | Pengadaan & Koran | `gray → slate` |

**Kelompok Dokumen Wajib (6 jenis, upload foto):**

| No | Kode | Template | Keterangan | Gradient |
|----|------|----------|------------|----------|
| 18 | D-PBJ | Dok. PBJ | Upload foto dokumen PBJ | `emerald → teal` |
| 19 | D-RK | Register KAS | Upload foto (Non-SIPLAH) | `emerald → teal` |
| 20 | D-BK | BAP KAS | Upload foto (Non-SIPLAH) | `emerald → teal` |
| 21 | D-KS | Kritik & Saran | Upload foto (Non-SIPLAH) | `emerald → teal` |
| 22 | D-PD | Pengaduan | Upload foto (Non-SIPLAH) | `emerald → teal` |
| 23 | D-PB | Papan BOS | Upload foto (Non-SIPLAH) | `emerald → teal` |

**Kelompok Realisasi (3 jenis, form input):**

| No | Kode | Template | Keterangan | Gradient |
|----|------|----------|------------|----------|
| 24 | R-CVR | Cover Realisasi | Cover realisasi dana BOSP | `orange → red` |
| 25 | R-SKT | Sekat Realisasi | Tabel sekat anggaran vs realisasi | `orange → red` |
| 26 | R-ALR | Alur Realisasi | Alur penggunaan dana | `orange → red` |

---

## Page: Pengaturan (`/pengaturan`)

**Tujuan:** Konfigurasi aplikasi — pengaturan profil sekolah, data master, backup/restore, dan info aplikasi.

**Layout:**
- Sidebar navigasi (kiri) — tetap
- Content (kanan):
  - Tab Navigation: **Profil Sekolah** | **Data Master** | **Backup & Restore** | **Tentang**

### Tab 1 — Profil Sekolah

| Field | Type | Keterangan |
|-------|------|------------|
| Logo Sekolah | image upload | Upload logo, preview sebelum simpan |
| Nama Sekolah | text | Auto dari Data Sekolah, bisa override |
| Alamat | text | Auto dari Data Sekolah |
| Kecamatan | text | Auto |
| Kabupaten | text | Auto |
| Email | email | Kontak sekolah |
| Tahun Anggaran | select | 2024, 2025, 2026, dst |
| Semester | select | Ganjil / Genap |

### Tab 2 — Data Master

| Setting | Keterangan |
|---------|------------|
| Toggle SIPLAH/Non-SIPLAH | Mengubah daftar Dokumen Wajib |
| Kode Rekening List | Daftar kode rekening BKU yang tersedia |
| Golongan Guru | Daftar golongan untuk form Data Guru |
| Status Guru | Daftar status (PNS/CPNS/PPP/Honorer) |

### Tab 3 — Backup & Restore

| Aksi | Deskripsi | Output |
|------|-----------|--------|
| Export Semua Data | Download seluruh data sekolah + BKU | `.json` |
| Export BKU Saja | Download data BKU per periode | `.xlsx` |
| Import Data | Upload file backup sebelumnya | `.json` |
| Reset Semua Data | Hapus semua data (dengan konfirmasi) | — |

**Konfirmasi Reset:**

```
┌──────────────────────────────────────┐
│  ⚠️  Reset Semua Data?              │
├──────────────────────────────────────┤
│                                      │
│  Semua data BKU, Dokumen, dan        │
│  Pengaturan akan dihapus permanen.   │
│                                      │
│  Ketik "RESET" untuk konfirmasi:     │
│  ┌────────────────────────────────┐  │
│  │  ____________________________  │  │
│  └────────────────────────────────┘  │
│                                      │
│       [Batal]     [Reset Semua]      │
└──────────────────────────────────────┘
```

### Tab 4 — Tentang

| Info | Nilai |
|------|-------|
| Nama Aplikasi | SPJ BOS/BOSP |
| Versi | 1.0.0 |
| Tech Stack | React + Vite + Tailwind CSS |
| Developer | [Nama Developer] |
| Tahun | 2025 |

**Components:** PengaturanPage, ProfilForm, BackupRestore, AboutSection, SiplahToggle

---

## UI State Patterns

### 1. Empty State

**Kapan muncul:** Belum ada data sama sekali (tabel kosong, belum upload file, dll).

```
+-------------------------------------+
|                                     |
|        [Ikon Dokumen]               |
|                                     |
|     Belum ada data BKU              |
|  Upload file Excel (.xlsx) untuk    |
|  memulai.                           |
|                                     |
|     [Upload File BKU]               |
|                                     |
+-------------------------------------+
```

**Elemen:**
- Ikon (Lucide): `FileText`, `Upload`, `Database`, dll
- Judul: "Belum ada data [X]"
- Deskripsi: "Upload file / tambah data untuk memulai"
- CTA Button: "Upload File" / "Tambah Data"

**Warna:** abu-abu muda (`bg-gray-50`), teks (`text-gray-500`)

---

### 2. Loading State

**Kapan muncul:** Saat fetch data, upload file, proses cetak.

#### 2a. Skeleton Loading (Tabel)

```
+-------------------------------------+
| No | Tanggal | Uraian | Nominal     |
|----|---------|--------|-------------|
| ░░ | ░░░░░░░ | ░░░░░░ | ░░░░░░░░░░ |
| ░░ | ░░░░░░░ | ░░░░░░ | ░░░░░░░░░░ |
| ░░ | ░░░░░░░ | ░░░░░░ | ░░░░░░░░░░ |
+-------------------------------------+
```

#### 2b. Skeleton Loading (Card)

```
+------------------+------------------+
|   ░░░░░░░░░░     |   ░░░░░░░░░░     |
|   ░░░░░░░░░░     |   ░░░░░░░░░░     |
|   ░░░░░░░░       |   ░░░░░░░░       |
+------------------+------------------+
```

#### 2c. Spinner + Overlay

```
+-------------------------------------+
|                                     |
|              [Spinner]              |
|          "Memuat data..."           |
|                                     |
+-------------------------------------+
```

**Warna skeleton:** `bg-gray-200 animate-pulse` (Tailwind)

---

### 3. Error State

**Kapan muncul:** Gagal fetch data, upload gagal, validasi error.

```
+-------------------------------------+
|                                     |
|        [Ikon Error ⚠️]              |
|                                     |
|     Gagal memuat data               |
|  Periksa koneksi internet dan       |
|  coba lagi.                         |
|                                     |
|     [Coba Lagi]                     |
|                                     |
+-------------------------------------+
```

**Elemen:**
- Ikon: `AlertTriangle` (merah)
- Judul: "Gagal memuat data" / "Terjadi kesalahan"
- Deskripsi: pesan error yang dipahami user
- CTA Button: "Coba Lagi"
- Detail: expandable error detail (untuk debugging)

**Warna:** merah muda (`bg-red-50`), teks (`text-red-600`), border (`border-red-200`)

---

### 4. Confirmation Dialog

**Kapan muncul:** Hapus data, cetak dokumen, aksi destructive.

#### 4a. Hapus Data

```
+-------------------------------------+
|  ⚠️  Hapus Data BKU?               |
+-------------------------------------+
|                                     |
|  Transaksi "Honor Narasumber"       |
|  tanggal 15 Januari 2025 akan      |
|  dihapus permanen.                  |
|                                     |
|  Aksi ini tidak dapat dibatalkan.   |
|                                     |
|        [Batal]    [Hapus]           |
+-------------------------------------+
```

#### 4b. Cetak Dokumen

```
+-------------------------------------+
|  🖨️  Cetak Dokumen SPJ              |
+-------------------------------------+
|                                     |
|  Siap mencetak dokumen:             |
|  • Honor Narasumber (3 lembar)      |
|  • Makan Rapat (1 lembar)           |
|                                     |
|  Gunakan kertas A4.                 |
|                                     |
|    [Batal]  [Cetak Semua]           |
+-------------------------------------+
```

**Elemen:**
- Header: Ikon + judul
- Body: detail aksi + dampak
- Footer: tombol aksi (secondary = batal, primary/destructive = konfirmasi)

---

### 5. Toast Notification

**Kapan muncul:** Sukses simpan, info singkat, error kecil.

#### 5a. Sukses

```
+-------------------------------------+
| ✓  Data BKU berhasil disimpan       |
+-------------------------------------+
```

#### 5b. Error

```
+-------------------------------------+
| ✗  Gagal upload file                |
|   Format file tidak valid           |
+-------------------------------------+
```

#### 5c. Info

```
+-------------------------------------+
| ℹ️  File Excel berhasil diunduh     |
+-------------------------------------+
```

**Warna:**
- Sukses: hijau (`bg-green-500`)
- Error: merah (`bg-red-500`)
- Info: biru (`bg-blue-500`)
- Warning: kuning (`bg-yellow-500`)

**Posisi:** kanan atas, auto-dismiss 3-5 detik

---

## Component Architecture

```
src/
+-- components/
|   +-- layout/
|   |   +-- Sidebar.jsx          # Sidebar navigasi utama
|   |   +-- Header.jsx           # Header dengan user info
|   |   +-- MainLayout.jsx       # Layout sidebar + content
|   |   +-- AuthLayout.jsx       # Layout untuk login
|   +-- ui/
|   |   +-- Button.jsx           # Tombol (primary, secondary, danger)
|   |   +-- Input.jsx            # Form input field
|   |   +-- Select.jsx           # Dropdown select
|   |   +-- Table.jsx            # Tabel data
|   |   +-- Card.jsx             # Card container
|   |   +-- Modal.jsx            # Modal dialog
|   |   +-- Tabs.jsx             # Tab navigation
|   |   +-- Badge.jsx            # Status badge
|   |   +-- Alert.jsx            # Alert notification
|   |   +-- Loading.jsx          # Loading spinner
|   +-- features/
|   |   +-- landing/
|   |   |   +-- HeroSection.jsx
|   |   |   +-- FeaturesSection.jsx
|   |   |   +-- LandingNavbar.jsx
|   |   +-- auth/
|   |   |   +-- LoginForm.jsx
|   |   |   +-- LoginIllustration.jsx
|   |   +-- dashboard/
|   |   |   +-- StatsCards.jsx
|   |   |   +-- RecentBKUTable.jsx
|   |   |   +-- DocumentProgress.jsx
|   |   +-- data-sekolah/
|   |   |   +-- DataSekolahForm.jsx
|   |   |   +-- DataSekolahUpload.jsx
|   |   +-- data-guru/
|   |   |   +-- DataGuruForm.jsx
|   |   |   +-- DataGuruUpload.jsx
|   |   |   +-- DataGuruTable.jsx
|   |   +-- bku/
|   |   |   +-- BKUTable.jsx
|   |   |   +-- BKUFilter.jsx
|   |   |   +-- BKUActions.jsx
|   |   |   +-- BKUUpload.jsx
|   |   +-- cetak/
|   |   |   +-- DocumentSidebar.jsx
|   |   |   +-- DocumentEditor.jsx
|   |   |   +-- DocumentPreview.jsx
|   |   |   +-- PrintActions.jsx
|   |   +-- dokumen-wajib/
|   |   |   +-- DokumenWajibPage.jsx
|   |   |   +-- DokumenCard.jsx
|   |   |   +-- UploadDokumen.jsx
|   |   |   +-- SiplahToggle.jsx
|   |   +-- realisasi/
|   |   |   +-- RealisasiPage.jsx
|   |   |   +-- CoverForm.jsx
|   |   |   +-- SekatTable.jsx
|   |   |   +-- AlurFlow.jsx
|   |   +-- ui-states/
|   |       +-- EmptyState.jsx
|   |       +-- LoadingSkeleton.jsx
|   |       +-- ErrorState.jsx
|   |       +-- ConfirmationDialog.jsx
|   |       +-- Toast.jsx
|   +-- templates/
|       +-- HonorTemplate.jsx
|       +-- PerjalananDinasTemplate.jsx
|       +-- MaminTemplate.jsx
|       +-- WorkshopTemplate.jsx
|       +-- PenggandaanTemplate.jsx
|       +-- CetakFotoTemplate.jsx
|       +-- CetakBannerTemplate.jsx
|       +-- SewaTemplate.jsx
|       +-- PemeliharaanTemplate.jsx
|       +-- TagihanTemplate.jsx
|       +-- PRPengadaanTemplate.jsx
|       +-- RekeningKoranTemplate.jsx
|       +-- CoverRealisasiTemplate.jsx
|       +-- SekatRealisasiTemplate.jsx
|       +-- AlurRealisasiTemplate.jsx
+-- contexts/
|   +-- AuthContext.jsx
|   +-- AppContext.jsx
+-- hooks/
|   +-- useAuth.js
|   +-- useBKU.js
+-- pages/
|   +-- LandingPage.jsx
|   +-- LoginPage.jsx
|   +-- DashboardPage.jsx
|   +-- DataSekolahPage.jsx
|   +-- DataGuruPage.jsx
|   +-- BKUPage.jsx
|   +-- CetakPage.jsx
|   +-- DokumenWajibPage.jsx
|   +-- RealisasiPage.jsx
|   +-- PengaturanPage.jsx
+-- utils/
|   +-- formatCurrency.js
|   +-- formatDate.js
|   +-- exportPDF.js
+-- App.jsx
+-- main.jsx
+-- index.css
```

---

## State Management

### Global State Structure

```javascript
// App State
{
  auth: {
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
  },
  sekolah: {
    npsn: '',
    nama: '',
    kecamatan: '',
    kabupaten: '',
    alamat: '',
    email: '',
    pejabat: {
      ks: { nama: '', nip: '' },
      bendahara: { nama: '', nip: '' },
      pengawas: { nama: '', nip: '' },
      sekdik: { nama: '', nip: '' },
    },
  },
  guru: [
    {
      id: 1,
      nama: '',
      nip: '',
      nuptk: '',
      golongan: '',
      jabatan: '',
      mataPelajaran: '',
      status: '',
    }
  ],
  bku: [
    {
      id: 1,
      tanggal: '',
      uraian: '',
      kodeRekening: '',
      debet: 0,
      kredit: 0,
      saldo: 0,
      bukti: null,
      // Semua jenis dokumen per transaksi (lengkap)
      documents: {
        // === Kelompok BKU Utama (14 jenis) ===
        honor: null,                   // Honor Narasumber & Pelaksana
        honorPelaksana: null,          // Honor Pelaksana Kegiatan
        narasumber: null,              // Narasumber/Speaker
        perjalananDinas: null,         // SPPD, Surat Tugas, Resume
        maminRapat: null,              // Makan Rapat
        maminKegiatan: null,           // Makan Kegiatan
        maminTamu: null,               // Makan Tamu
        penggandaan: null,             // Penggandaan/Fotokopi
        cetakFoto: null,               // Cetak Foto
        cetakBanner: null,             // Cetak Banner/Spanduk
        sewa: null,                    // Sewa Mobilitas/Sound/Kendaraan
        pemeliharaan: null,            // Pemeliharaan Fasilitas/Peralatan
        tagihan: null,                 // Tagihan Listrik/Air
        workshopInternal: null,        // Workshop/Sosialisasi Internal
        workshopEksternal: null,       // Workshop/Sosialisasi Eksternal
        // === Kelompok Pengadaan (PR) ===
        prPengadaan: null,             // Proposal/Program Kerja/Surat Tugas
        // === Kelompok Rekening Koran ===
        rekeningKoran: null,           // Surat Permohonan/Pengantar/Kuasa
        // === Total: 17 jenis dokumen ===
      }
    }
  ],
  // === Dokumen Wajib (Luar ARKAS) ===
  dokumenWajib: {
    siplah: false, // Toggle mode SIPLAH / Non-SIPLAH
    dokPbj: null,  // Dokumen PBJ (selalu ada)
    // Berikut ini hanya muncul jika siplah === false
    registerKas: null,
    beritaAcaraPemeriksaanKas: null,
    lembarKritikSaran: null,
    lembarPengaduan: null,
    papanBos: null,
  },
  // === Realisasi Dana BOSP ===
  realisasi: {
    cover: {
      tahunAnggaran: '',
      namaSekolah: '', // auto dari sekolah
      danaBosp: 0,
      sumberDana: '',
    },
    sekat: [
      // Array baris tabel sekat
      { id: 1, kodeRekening: '', uraian: '', anggaran: 0, realisasi: 0, selisih: 0 },
    ],
    alur: {
      urutan: [], // Array langkah penggunaan dana
      file: null, // Upload alur (jika format gambar)
    },
  },
  },
  settings: {
    logo: null,
    namaSekolah: '',
    alamat: '',
    tahunAnggaran: '',
    semester: '',
    versi: '1.0.0',
  },
  // === UI State ===
  ui: {
    loading: false,
    error: null,
    sidebarCollapsed: false,
    confirmationDialog: { open: false, message: '', onConfirm: null },
  }
}
```

---

## UI/UX Guidelines

### Color Palette

| Color | Usage | Tailwind Class |
|-------|-------|----------------|
| Primary | Tombol utama, link, aksi | `bg-blue-600` |
| Success | Simpan, sukses | `bg-green-600` |
| Warning | Peringatan | `bg-yellow-500` |
| Danger | Hapus, error | `bg-red-600` |
| Neutral | Background, border | `bg-gray-100`, `border-gray-300` |

### Typography

| Element | Size | Weight | Tailwind |
|---------|------|--------|----------|
| H1 | 2rem | Bold | `text-3xl font-bold` |
| H2 | 1.5rem | Semibold | `text-2xl font-semibold` |
| H3 | 1.25rem | Medium | `text-xl font-medium` |
| Body | 1rem | Normal | `text-base` |
| Small | 0.875rem | Normal | `text-sm` |

### Responsive Breakpoints

- Mobile: `< 640px` (single column)
- Tablet: `640px - 1024px` (2 columns)
- Desktop: `> 1024px` (sidebar + content)

---

## Development Phases

### Phase 1: Setup & Core Layout (Week 1)
- [ ] Setup React + Vite + Tailwind
- [ ] Buat layout (Sidebar, Header, MainLayout)
- [ ] Setup routing (React Router)
- [ ] Buat UI components (Button, Input, Table, Card)

### Phase 2: Landing & Auth (Week 1-2)
- [ ] Landing Page (Hero, Features, Info)
- [ ] Login Page dengan animasi
- [ ] Auth context & state management

### Phase 3: Data Input (Week 2)
- [ ] Data Sekolah (Form + Upload)
- [ ] Data Guru (Form + Upload + Table)
- [ ] State management untuk data

### Phase 4: BKU & Cetak (Week 3)
- [ ] BKU Table dengan filter
- [ ] Halaman cetak dengan Split View
- [ ] Document templates (placeholder)
- [ ] Preview real-time

### Phase 5: Export & Polish (Week 4)
- [ ] Export ke PDF
- [ ] Print functionality
- [ ] Responsive design
- [ ] Testing & bug fixes
