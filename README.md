# 📋 LPJ BOS/BOSP - Aplikasi Cetak Dokumen Pertanggungjawaban

Aplikasi web frontend untuk **cetak dokumen pertanggungjawaban (LPJ)** dana BOS/BOSP sekolah. Membantu operator sekolah dalam menyusun, mengelola, dan mencetak dokumen LPJ dengan mudah dan efisien.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Fitur Utama

### 📄 Dokumen LPJ
- **Honorarium** — Guru, Tendik, Perpustakaan, Penjaga, Pelaksana
- **Perjalanan Dinas** — Transport Rapat, Koordinasi, Bank, Pendamping, SPPD
- **Makan & Minum** — Notulen, Buku Tamu, Mamin Kegiatan/Tamu/Rapat
- **Pemeliharaan** — Alat (Upah Kerja), Mebeler, Bangunan
- **Info Only** — Penggandaan, Cetak Foto, Cetak Banner, Tagihan

### 📁 Dokumen Kelengkapan
- Dokumen SIPLAH & Non-SIPLAH
- Register KAS, BAP KAS, Papan BOS
- Kritik & Saran, Pengaduan
- Cover LPJ, Sekat Cover, Realisasi Dana
- Blanko Daftar Hadir, Surat Undangan

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
- Print CSS A4 format
- Template engine dengan 13 konfigurasi

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
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Icons | Material Symbols Outlined |
| Fonts | Hanken Grotesk + Inter |
| State | localStorage |
| Excel Parser | SheetJS (xlsx) |

---

## 📁 Project Structure

```
spj-app/
├── 📄 README.md                    ← File ini
├── 📄 AGENT.md                     ← AI Agent Quick Start
├── 📄 PROGRESS.md                  ← Task Tracking
├── 📄 PRD_IMPLEMENTASI.md          ← Master Plan
│
├── 📁 spj-frontend/               ← Frontend React
│   ├── 📁 src/
│   │   ├── 📄 App.jsx
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/         ← Sidebar, Topbar
│   │   │   ├── 📁 templates/      ← Template Engine
│   │   │   └── 📁 ui/             ← Toast
│   │   ├── 📁 data/
│   │   │   └── 📄 templateConfig.js
│   │   ├── 📁 pages/
│   │   │   └── 📁 dashboard/
│   │   │       ├── 📄 DokumenSPJPage.jsx
│   │   │       ├── 📄 DokumenKelengkapanPage.jsx
│   │   │       ├── 📄 BKUPage.jsx
│   │   │       ├── 📄 DataSekolahPage.jsx
│   │   │       ├── 📄 DataGuruPage.jsx
│   │   │       └── 📄 NotesPage.jsx
│   │   └── 📁 utils/
│   │       ├── 📄 bkuParser.js
│   │       ├── 📄 sekolahParser.js
│   │       └── 📄 guruTendikParser.js
│   └── 📄 package.json
│
├── 📁 template/                   ← File template asli
│   ├── 📄 NOTULEN RAPAT.docx
│   ├── 📄 BUKU TAMU KEDINASAN.docx
│   ├── 📄 Surat Tugas + SPPD.docx
│   └── 📄 Form. Honor_2026.xlsx
│
└── 📁 template-data/              ← Sample data files
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

Aplikasi menggunakan **Data-Driven Template Engine** untuk render 13 template dokumen:

```
templateConfig (JSON) → TemplateEngine → Block Components
                                           ├── KopSurat
                                           ├── HeaderDokumen
                                           ├── TabelFields
                                           ├── TabelDinamis
                                           ├── InfoKeuangan
                                           ├── PoinPembahasan
                                           ├── UraianKegiatan
                                           └── SignatureFooter
```

### 13 Template Config

| ID | Card | Source |
|----|------|--------|
| `honor_guru` | Honor | Excel |
| `honor_tendik` | Honor | Excel |
| `honor_perpus` | Honor | Excel |
| `honor_penjaga` | Honor | Excel |
| `transpor_rapat` | Perjalanan | Excel |
| `transpor_koordinasi` | Perjalanan | Excel |
| `transpor_bank` | Perjalanan | Excel |
| `transpor_pendamping` | Perjalanan | Excel |
| `sppd` | Perjalanan | DOCX |
| `notulen` | Mamin | DOCX |
| `buku_tamu` | Mamin | DOCX |
| `upah` | Pemeliharaan | Excel |
| `pulsa` | Tagihan | Excel |

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

- [AGENT.md](AGENT.md) — AI Agent Quick Start
- [PROGRESS.md](PROGRESS.md) — Task Tracking
- [PRD_IMPLEMENTASI.md](PRD_IMPLEMENTASI.md) — Master Plan
- [RESEARCH_TEMPLATE_ENGINE.md](RESEARCH_TEMPLATE_ENGINE.md) — Template Engine Architecture
- [RESEARCH_BKU_UPLOAD.md](RESEARCH_BKU_UPLOAD.md) — BKU Upload Research

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
