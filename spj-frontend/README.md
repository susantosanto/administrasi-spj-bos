# 📋 SPJ BOS/BOSP - Administrasi Laporan Sekolah

Aplikasi web untuk mengelola dan mencetak dokumen SPJ (Surat Pertanggungjawaban) dana BOS/BOSP sekolah. Membantu operator sekolah dalam menyusun, mengelola, dan mencetak dokumen pertanggungjawaban dengan mudah dan efisien.

## 🎯 Fitur Utama

- **📄 Dokumen SPJ** - 26+ jenis dokumen SPJ (Honor, Perjalanan Dinas, Makan & Minum, Workshop, dll)
- **📁 Dokumen Wajib** - Kelola dokumen wajib di luar ARKAS (SIPLAH & Non-SIPLAH)
- **📊 Dokumen Pelengkap** - Cover, Sekat, Realisasi Penggunaan Dana, Instrumen Laporan BOS
- **🏫 Data Sekolah** - Form input dan upload data profil sekolah
- **👥 Data Guru** - Manajemen data guru dan tenaga kependidikan
- **📁 Upload BKU** - Upload BKU Excel sebagai referensi pembuatan dokumen
- **🖨️ Cetak Dokumen** - Cetak dan export dokumen ke PDF

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | React 18+ |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Icons | Material Symbols Outlined |
| Fonts | Hanken Grotesk + Inter |
| State | localStorage |

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

### Development Server

Buka browser dan akses `http://localhost:5173`

## 📁 Struktur Folder

```
spj-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Topbar.jsx
│   │   └── ui/
│   │       └── Toast.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── dashboard/
│   │       ├── DashboardHome.jsx
│   │       ├── DataSekolahPage.jsx
│   │       ├── DataGuruPage.jsx
│   │       ├── BKUPage.jsx
│   │       ├── DokumenSPJPage.jsx
│   │       ├── DokumenWajibPage.jsx
│   │       └── PengaturanPage.jsx
│   ├── layouts/
│   │   └── DashboardLayout.jsx
│   ├── data/
│   │   └── mockData.js
│   ├── utils/
│   │   └── storageHelper.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 📋 Daftar Dokumen SPJ

### BKU Utama (17 Jenis)
| Kode | Dokumen | Kategori |
|------|---------|----------|
| HON | Honorarium | Honor & Narasumber |
| HON-P | Honor Pelaksana | Honor & Narasumber |
| NSB | Narasumber | Honor & Narasumber |
| PD | Perjalanan Dinas | Perjalanan Dinas |
| MR | Mamin Rapat | Makan & Minum |
| MK | Mamin Kegiatan | Makan & Minum |
| MT | Mamin Tamu | Makan & Minum |
| PG | Penggandaan | Dokumen Pendukung |
| CF | Cetak Foto | Dokumen Pendukung |
| CB | Cetak Banner | Dokumen Pendukung |
| SW | Sewa | Sewa & Pemeliharaan |
| PL | Pemeliharaan | Sewa & Pemeliharaan |
| TG | Tagihan | Sewa & Pemeliharaan |
| WS-I | Workshop Internal | Workshop |
| WS-E | Workshop Eksternal | Workshop |
| PR | PR Pengadaan | Pengadaan & Rekening Koran |
| RK | Rekening Koran | Pengadaan & Rekening Koran |

### Dokumen Pelengkap (4 Jenis)
| Kode | Dokumen |
|------|---------|
| R-CVR | Cover |
| R-SKT | Sekat Cover |
| R-ALR | Realisasi Penggunaan Dana |
| R-ILB | Instrumen Laporan BOS |

### Dokumen Wajib (6 Jenis)
| Kode | Dokumen | Keterangan |
|------|---------|------------|
| D-PBJ | Dokumen PBJ | Selalu ada |
| D-RK | Register KAS | Non-SIPLAH |
| D-BK | BAP KAS | Non-SIPLAH |
| D-KS | Kritik & Saran | Non-SIPLAH |
| D-PD | Pengaduan | Non-SIPLAH |
| D-PB | Papan BOS | Non-SIPLAH |

## 🎨 Design System

Menggunakan Material Design 3-inspired Corporate Modern:

- **Primary**: `#004ac6` (Biru)
- **Secondary**: `#006c4a` (Hijau)
- **Background**: `#f8f9fb` (Abu-abu muda)
- **Typography**: Hanken Grotesk (Headlines) + Inter (Body)
- **Icons**: Material Symbols Outlined

## 📱 Halaman Aplikasi

| Halaman | Deskripsi |
|---------|-----------|
| Landing Page | Halaman pembuka dengan informasi aplikasi |
| Login | Form login dengan ilustrasi |
| Dashboard | Ringkasan status dokumen SPJ |
| Data Sekolah | Form input & upload data sekolah |
| Data Guru | Tabel data guru & tendik |
| Upload BKU | Upload BKU Excel + tabel referensi |
| Dokumen SPJ | Card grid 26+ dokumen + template preview |
| Dokumen Wajib | Toggle SIPLAH + template dokumen |
| Pengaturan | Profil, Data Master, Backup |

## 🔧 Konfigurasi

### Tailwind CSS

Konfigurasi Tailwind menggunakan custom design tokens sesuai Material Design 3:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#004ac6',
      secondary: '#006c4a',
      background: '#f8f9fb',
      // ...
    }
  }
}
```

## 📄 License

MIT License

## 👨‍💻 Developer

Dikembangkan oleh Tim IT Pendidikan

---

**SPJ BOS/BOSP** © 2025
