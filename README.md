# 📋 LPJ BOS/BOSP - Aplikasi Cetak Dokumen Pertanggungjawaban

Aplikasi web frontend untuk **cetak dokumen pertanggungjawaban (LPJ)** dana BOS/BOSP sekolah. Membantu operator sekolah dalam menyusun, mengelola, dan mencetak dokumen LPJ dengan mudah dan efisien.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Fitur Utama

### 📄 Dokumen LPJ (8 card di `DokumenSPJPage.jsx`)
- **Honorarium** — Guru, Tendik, Perpustakaan, Penjaga (+ Pelaksana coming soon)
- **Perjalanan Dinas** — Transport Rapat, Koordinasi, Bank, Pendamping + SPPD auto-fill (+ Workshop coming soon)
- **Makan & Minum** — Rapat, Kegiatan, Tamu via `DokumenFormPreview` (Undangan, Pesanan, Notulen, Buku Tamu, Daftar Hadir + generate ringkasan AI)
- **Pemeliharaan** — Alat/Upah Kerja (+ Mebeler & Bangunan coming soon)
- **Info Only** — Penggandaan, Cetak Foto, Cetak Banner, Tagihan (tanpa template, hanya info kelengkapan)

### 📁 Dokumen Kelengkapan (12 item, 5 kategori di `DokumenKelengkapanPage.jsx`)
- SIPLAH (1): Dokumen PBJ — toggle SIPLAH/Non-SIPLAH
- Keuangan (3): Register KAS, BAP KAS, Papan BOS
- Umum (2): Kritik & Saran, Pengaduan
- Laporan (4): Cover LPJ, Sekat Cover, Realisasi Dana, Instrumen BOS
- Blanko (2): Daftar Hadir, Surat Undangan

### 🏫 Data Sekolah
- Upload profil sekolah dari file Dapodik/ARKAS
- Premium hero header dengan data grid
- Form pejabat (Kepala Sekolah, Bendahara, dll)

### 👥 Data Guru & Tendik
- Upload data dari file Dapodik Excel
- Upload toggle per tab (Guru & Tendik)
- Tabel dengan filter dan status (PNS/PPPK/Honorer)

### 📊 Upload BKU
- Parse file BKU Excel dari ARKAS
- Toggle upload form (hidden after upload)
- Otomatis deteksi transaksi (BOSP, PPh, Tarik Tunai, dll)
- Integrasi dengan modul Makan & Minum

### 🖨️ Cetak Dokumen
- Print CSS A4 format (portrait/landscape per template)
- Template engine dengan 18 konfigurasi (`src/data/templateConfig.js` = Single Source of Truth)

### 📝 Catatan
- **Note-Taking Premium** — Simpan catatan penting terkait BOS
- **Kategori** — BOS, Dokumen, Keuangan, Jadwal, Lainnya
- **Fitur** — Pin, warna, grid/list view, pencarian
- **Auto-save** — Tersimpan otomatis di localStorage

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 (token di `tailwind.config.js` = SSOT; `DESIGN.md` = panduan visual) |
| Routing | React Router v6 |
| Icons | Material Symbols Outlined + Lucide |
| Fonts | Hanken Grotesk + Inter (README lama) / Plus Jakarta Sans + Montserrat (DESIGN.md Coretax) |
| State | localStorage (`spj_*`) |
| Excel Parser | SheetJS (xlsx) |
| AI | Puter.js + Gemini/Groq/Cerebras via proxy Vite `/api/*` |
| PDF | pdfjs-dist |

---

## 📁 Project Structure

```
administrasi-spj-bos/
├── 📄 README.md                    ← overview (18 template, terverifikasi kode)
├── 📄 ANALISIS_PROYEK.md            ← hasil analisis statis codebase
├── 📄 test-bku-parser.js            ← skrip uji parser BKU (Node + xlsx)
├── 📄 test-bku-template.js          ← skrip inspeksi mentah sheet Page1
│
├── 📁 spj-frontend/               ← Frontend React (rute: /, /login, /pratinjau, /dashboard/*)
│   ├── 📁 src/
│   │   ├── 📄 App.jsx             ← routing + ProtectedRoute (spj_auth)
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/         ← Sidebar, Topbar
│   │   │   ├── 📁 templates/      ← TemplateEngine, DokumenFormPreview + blocks/
│   │   │   ├── 📁 ai/             ← AskAIButton, AskAIPanel
│   │   │   ├── 📁 bku/            ← BKUSidebar
│   │   │   ├── 📁 dokumentasi/    ← DokumentasiAIGenerate
│   │   │   └── 📁 ui/             ← Toast, DownloadConfirmModal
│   │   ├── 📁 data/
│   │   │   ├── 📄 templateConfig.js ← 18 template (Single Source of Truth)
│   │   │   ├── 📄 kodeReferensi.js, spjRequirements.js, formatNomorSurat.js, contextMap.js
│   │   │   └── 📄 mockData.js     ← seed localStorage
│   │   ├── 📁 pages/
│   │   │   ├── 📄 LandingPage.jsx, LoginPage.jsx, PratinjauPage.jsx, DokumentasiAIPage.jsx
│   │   │   └── 📁 dashboard/      ← 13 halaman (DashboardHome, DataSekolah, PejabatSekolah,
│   │   │                              DataGuru, BKU, DokumenSPJ, DokumenKelengkapan, Realisasi,
│   │   │                              NomorSurat, TemplateSurat, ReferensiKode, Notes, Pengaturan)
│   │   ├── 📁 contexts/           ← AIContext, SidebarContext
│   │   ├── 📁 services/           ← imageGenerator.js
│   │   └── 📁 utils/              ← bkuParser, sekolahParser, guruTendikParser, nomorSuratHelper,
│   │                                  templateSuratHelper, honorHelper, bkuHelper, aiHelper, dll (20 file)
│   └── 📄 package.json
│
├── 📁 template/                   ← 6 .docx + 1 .xlsx honor asli
│
├── 📁 template-data/              ← sample Dapodik/ARKAS + juknis/ (5 PDF regulasi)
│
└── 📁 docs/ (65 file)             ← PRD, riset, roadmap Electron/SQLite, AI
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/susantosanto/administrasi-spj-bos.git
cd administrasi-spj-bos/spj-frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Access

- **Landing Page**: `http://localhost:5173/`
- **Login**: `http://localhost:5173/login`
- **Dashboard**: `http://localhost:5173/dashboard`

---

## 📸 Screenshots

| Landing Page | Dashboard | Dokumen LPJ |
|-------------|-----------|-------------|
| ![Landing](docs/landing.png) | ![Dashboard](docs/dashboard.png) | ![LPJ](docs/lpj.png) |

---

## 🧩 Template Engine

Aplikasi menggunakan **Data-Driven Template Engine** untuk render 18 template dokumen (`TEMPLATE_CONFIGS` di `spj-frontend/src/data/templateConfig.js`):

```
templateConfig (JSON) → TemplateEngine → Block Components
                                           ├── KopSurat
                                           ├── HeaderDokumen
                                           ├── TabelFields
                                           ├── TabelDinamis
                                           ├── TabelLetterHeader
                                           ├── InfoKeuangan
                                           ├── PoinPembahasan
                                           ├── UraianKegiatan
                                           └── SignatureFooter
```

### 18 Template Config (terverifikasi dari kode)

| ID | Card | Sub-kategori | Source |
|----|------|--------------|--------|
| `honor_guru` | honor | guru | Excel |
| `honor_tendik` | honor | tendik | Excel |
| `honor_perpus` | honor | perpus | Excel |
| `honor_penjaga` | honor | penjaga | Excel |
| `transpor_rapat` | perjalanan_dinas | rapat | Excel |
| `transpor_koordinasi` | perjalanan_dinas | koordinasi | Excel |
| `transpor_bank` | perjalanan_dinas | bank | Excel |
| `transpor_pendamping` | perjalanan_dinas | pendamping | Excel |
| `sppd` | perjalanan_dinas | — (auto-fill dari transport) | DOCX |
| `lampiran_daftar_tugas` | perjalanan_dinas | — (lampiran) | — |
| `notulen` | mamin | notulen | DOCX |
| `undangan_mamin` | mamin | rapat | DOCX |
| `pesanan_mamin` | mamin | kegiatan | DOCX |
| `buku_tamu` | mamin | buku_tamu | DOCX |
| `daftar_hadir` | mamin | rapat | DOCX |
| `upah` | pemeliharaan | alat | Excel |
| `pulsa` | tagihan | pulsa | Excel |
| `bku` | keuangan | bku | Excel (Page1 A/D/F/I/K/N/Q/T, baris 16–340) |

> Catatan: Card LPJ di UI (`DokumenSPJPage.jsx`) = 8 card: 4 BKU Utama (`honor`, `perjalanan_dinas`, `mamin`, `pemeliharaan`) + 4 Dokumen Pendukung info-only (`penggandaan`, `cetak_foto`, `cetak_banner`, `tagihan`). Alur Mamin/Upah memakai `DokumenFormPreview.jsx` (Form → Preview → Revisi) dengan auto-fill penerima dari Data Guru/Tendik + nominal dari BKU.

---

## 📊 Progress

**Status: 100% Complete**

| Tahap | Status |
|-------|--------|
| Global Rename SPJ→LPJ | ✅ |
| Dashboard Download | ✅ |
| Template Engine Core | ✅ |
| Template Config (13) | ✅ |
| Dokumen Kelengkapan | ✅ |
| Dokumen LPJ Page | ✅ |
| CSS Print + Final | ✅ |
| BKU Excel Parser | ✅ |
| Premium Sidebar | ✅ |
| BKU Detail Sidebar | ✅ |
| Upload Data Sekolah | ✅ |
| Upload Data Guru/Tendik | ✅ |
| Dashboard Redesign | ✅ |
| Premium UI/UX | ✅ |
| Catatan (Notes) | ✅ |

---

## 📝 Revisi

1. ✅ SPJ → LPJ (user-facing text)
2. ✅ Dokumen Wajib → Dokumen Kelengkapan
3. ✅ Card = multiple sub-kategori (pill/dropdown)
4. ✅ Info-only cards (Penggandaan, Cetak Foto, dll)
5. ✅ BKU = upload only, bukan management
6. ✅ Data Sekolah → premium single-card display
7. ✅ Consistent upload toggle buttons
8. ✅ Catatan premium note-taking

---

## 📄 Documentation

- [ANALISIS_PROYEK.md](ANALISIS_PROYEK.md) — Analisis statis codebase (terverifikasi, 13 Okt 2026)
- [docs/AGENT.md](docs/AGENT.md) — AI Agent Quick Start
- [docs/PROGRESS.md](docs/PROGRESS.md) — Task Tracking
- [docs/PRD_IMPLEMENTASI.md](docs/PRD_IMPLEMENTASI.md) — Master Plan
- [docs/RESEARCH_TEMPLATE_ENGINE.md](docs/RESEARCH_TEMPLATE_ENGINE.md) — Template Engine Architecture
- [docs/RESEARCH_BKU_UPLOAD.md](docs/RESEARCH_BKU_UPLOAD.md) — BKU Upload Research

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Contact

**SDN Lebakleungsir** — Kec. Cikalongwetan, Kab. Bandung Barat

- Email: sdn.lebakleungsir@gmail.com
- GitHub: [susantosanto](https://github.com/susantosanto)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for Indonesian Education*
