# Product Requirements Document (PRD) - UI Prototype
**Aplikasi Administrasi Laporan BOS**

## 1. Overview
Aplikasi ini adalah prototype UI interaktif untuk sistem Administrasi Laporan Bantuan Operasional Sekolah (BOS). Prototype dibangun menggunakan **React + Vite** (tanpa backend). Fokus utama adalah simulasi navigasi interaktif, aliran data (form-to-table), dan estetika UI super premium.

## 2. Component Architecture
Menggunakan **Feature-Based Architecture** yang memadukan konsep Atomic Design untuk UI toolkit.

### Struktur Hierarki Utama
```text
App
├── Routes
│   ├── Public (Landing, Login)
│   └── Protected (Dashboard Layout)
│       ├── Sidebar (Kiri, Dropdown Menu, Glassmorphism)
│       └── Topbar / Main Content
```

### Struktur Folder Frontend (React)
```text
src/
├── components/          # Reusable UI (Button, Card, Input, Toast) - Glassmorphism style
├── features/
│   ├── landing/         # Halaman Sampurasun & Login Form
│   ├── pendataan/       # Form Profil, KS, Bendahara
│   ├── upload/          # Upload Dokumen
│   ├── bukti-fisik/     # Honor, Perjalanan Dinas, Mamin, dll
│   ├── workshop/        # Internal & Eksternal
│   ├── dokumen-wajib/   # SIPLAH & Non-SIPLAH
│   └── realisasi/       # Realisasi Dana BOSP
├── layouts/             # Dashboard Layout (Sidebar + Main Content wrapper)
├── data/                # Mock Data awal (Dummy JSON/JS)
├── utils/               # Helper fungsi localStorage & state
└── App.jsx
```

## 3. State Management & Data Flow
- **Penyimpanan:** `localStorage`
- **Data Awal (Mock Data):** Prototype akan di-seeding (diisi otomatis) dengan data dummy (contoh data Guru, data Honor, Mamin) saat pertama kali diakses. Ini bertujuan agar tabel dan dashboard terlihat hidup saat presentasi/demo.
- **Feedback & Interaksi:** Saat user melakukan aksi (submit/simpan/hapus), sistem akan langsung menampilkan notifikasi **Toast/Snackbar sukses yang elegan** (super premium design) di pojok atas layar tanpa jeda loading (optimistic update).

## 4. Routing & Navigation Strategy
Routing diatur dengan alur pengguna yang terstruktur.

| Route Path | Keterangan Halaman | Auth |
|---|---|---|
| `/` | **Landing Page (Sampurasun):** Desain super premium pembuka aplikasi. Terdapat tombol "Masuk Aplikasi" / Login. | Public |
| `/login` | **Login Form:** Form sederhana berisi Email dan Password. (Mock login, langsung redirect). | Public |
| `/dashboard` | **Dashboard / Pendataan Utama:** Menampilkan Sidebar di sebelah kiri. | Protected |
| `/dashboard/pendataan` | Form Profil Sekolah & Pejabat | Protected |
| `/dashboard/upload` | Upload Dokumen Profil & GTK | Protected |
| `/dashboard/bukti-fisik/*` | Menu Dropdown: Honor, Perdin, Mamin, Penggandaan, Cetak, Sewa, Pemeliharaan, Tagihan | Protected |
| `/dashboard/workshop/*` | Menu Dropdown: Internal, Eksternal | Protected |
| `/dashboard/dokumen-wajib`| SIPLAH dan Non-SIPLAH | Protected |
| `/dashboard/realisasi` | Realisasi Dana BOSP | Protected |

## 5. Design System & Aesthetics
Visi utama UI: **"Web App Coretax DJP - Super Premium Glassmorphism"**

- **Framework:** Tailwind CSS
- **Color Palette & Theme:** Biru Formal (Pemerintahan) dipadukan dengan aksen modern dan bersih.
- **Glassmorphism Effect:**
  - **Background Layar:** Akan menggunakan gambar/pattern background khusus, elegan, dan statis (full screen).
  - **Komponen UI:** Setiap Sidebar, Card, Table, dan Form akan menggunakan efek background transparan blur (`backdrop-blur`). Background abstrak di belakang akan tembus memberikan efek mewah.
- **Responsivitas:** Fokus optimalisasi **Desktop dan Tablet**. Desain *tidak* difokuskan untuk Mobile HP, menyesuaikan skenario penggunaan administrasi yang kompleks (tabel besar, data padat).

## 6. Quality Gate
- [ ] UI sesuai standar Glassmorphism Coretax
- [ ] Navigasi sidebar dropdown berjalan lancar
- [ ] Form dapat menyimpan ke `localStorage`
- [ ] Data dummy termuat otomatis di tabel
- [ ] Toast notification muncul saat aksi berhasil

---
*Blue-print ini siap digunakan sebagai acuan pengembangan menggunakan React + Vite.*
