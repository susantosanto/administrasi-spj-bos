# 🤖 AGENT.md — AI Agent Quick Start

> **File ini dibuat untuk AI Agent** agar langsung paham project saat buka sesi baru di folder `D:/project/spj-app/`

---

## 🎯 TUJUAN APLIKASI

**Aplikasi LPJ BOS/BOSP** — Frontend React untuk **cetak dokumen pertanggungjawaban BOS/BOSP** (bukan BKU management).

**Fokus utama**: Cetak dokumen LPJ (Surat Pertanggungjawaban) beserta dokumen pendukungnya.

---

## 📁 PROJECT STRUCTURE

```
D:/project/spj-app/
├── 📄 AGENT.md                    ← FILE INI (baca dulu!)
├── 📄 PRD_IMPLEMENTASI.md          ← Master plan implementasi
├── 📄 RESEARCH_TEMPLATE_ENGINE.md  ← Arsitektur template engine
├── 📄 ANALISIS_TEMPLATE.md         ← Analisis 4 file template
├── 📄 revisi.md                    ← Daftar revisi dari user
│
├── 📁 spj-frontend/               ← Frontend React (MAIN APP)
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📁 src/
│   │   ├── 📄 App.jsx             ← Routes & navigation
│   │   ├── 📄 main.jsx            ← Entry point
│   │   ├── 📄 index.css           ← Design system + print CSS
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/         ← Sidebar, Topbar
│   │   │   ├── 📁 templates/      ← Template Engine
│   │   │   │   ├── TemplateEngine.jsx
│   │   │   │   └── blocks/        ← 8 block components
│   │   │   └── 📁 ui/             ← Toast
│   │   │
│   │   ├── 📁 data/
│   │   │   ├── mockData.js
│   │   │   └── templateConfig.js  ← 13 template definitions
│   │   │
│   │   ├── 📁 layouts/
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   ├── 📁 pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── dashboard/
│   │   │       ├── DashboardHome.jsx
│   │   │       ├── DokumenSPJPage.jsx      ← HALAMAN UTAMA (LPJ)
│   │   │       ├── DokumenKelengkapanPage.jsx
│   │   │       ├── BKUPage.jsx
│   │   │       ├── DataSekolahPage.jsx
│   │   │       ├── DataGuruPage.jsx
│   │   │       ├── RealisasiPage.jsx
│   │   │       └── PengaturanPage.jsx
│   │   │
│   │   └── 📁 utils/
│   │       ├── storageHelper.js
│   │       ├── templateHelpers.jsx
│   │       ├── signatureRoles.js
│   │       └── sekolahData.js
│   │
│   └── 📁 public/docs/            ← Download referensi
│
├── 📁 template/                   ← File template asli
│   ├── NOTULEN RAPAT.docx
│   ├── BUKU TAMU KEDINASAN.docx
│   ├── Surat Tugas + SPPD.docx
│   └── Form. Honor_2026.xlsx
│
└── 📁 stitch_reference_based_prototype/  ← Reference prototypes
```

---

## 🚀 QUICK COMMANDS

```bash
# Development
cd spj-frontend && npm run dev

# Build
cd spj-frontend && npm run build

# Preview build
cd spj-frontend && npm run preview
```

---

## 📊 PROGRESS STATUS: 95% COMPLETE

### ✅ Yang Sudah Selesai

| Tahap | Status | File |
|-------|--------|------|
| 1. Global Rename SPJ→LPJ | ✅ | Sidebar, App, LandingPage, LoginPage, DashboardHome |
| 2. Dashboard Download | ✅ | DashboardHome.jsx (6 download cards) |
| 3. Template Engine Core | ✅ | TemplateEngine.jsx + 8 blocks |
| 4. Template Config (13) | ✅ | templateConfig.js |
| 5. Dokumen Kelengkapan | ✅ | DokumenKelengkapanPage.jsx |
| 6. Dokumen LPJ Page | ✅ | DokumenSPJPage.jsx |
| 7. CSS Print + Final | ✅ | index.css |

### ⏳ Yang Belum

- Test cetak 13 template (perlu running app)

---

## 🏗️ ARSITEKTUR TEMPLATE ENGINE

```
templateConfig (JSON) → TemplateEngine.jsx → Block Components
                                               ├── KopSurat
                                               ├── HeaderDokumen
                                               ├── TabelFields
                                               ├── TabelDinamis
                                               ├── InfoKeuangan
                                               ├── PoinPembahasan
                                               ├── UraianKegiatan
                                               └── SignatureFooter
```

### 13 Template Config IDs

| ID | Card | Sub-Kategori | Source |
|----|------|--------------|--------|
| `honor_guru` | Honor | Guru | Excel |
| `honor_tendik` | Honor | Tendik | Excel |
| `honor_perpus` | Honor | Perpustakaan | Excel |
| `honor_penjaga` | Honor | Penjaga | Excel |
| `transpor_rapat` | Perjalanan | Rapat | Excel |
| `transpor_koordinasi` | Perjalanan | Koordinasi | Excel |
| `transpor_bank` | Perjalanan | Bank | Excel |
| `transpor_pendamping` | Perjalanan | Pendamping | Excel |
| `sppd` | Perjalanan | SPPD | DOCX |
| `notulen` | Mamin | Notulen | DOCX |
| `buku_tamu` | Mamin | Buku Tamu | DOCX |
| `upah` | Pemeliharaan | Alat | Excel |
| `pulsa` | Tagihan | Pulsa | Excel |

---

## 🎨 DESIGN SYSTEM

- **Framework**: React 18 + Vite + Tailwind CSS
- **Design**: Material Design 3 Corporate Modern
- **Primary**: `#004ac6` (Biru)
- **Secondary**: `#006c4a` (Hijau)
- **Background**: `#f8f9fb`
- **Fonts**: Hanken Grotesk (Headlines), Inter (Body)
- **Icons**: Material Symbols Outlined

---

## 📝 REVISI Penting

1. **"SPJ" → "LPJ"** — Ganti semua user-facing text (bukan variable/localStorage)
2. **"Dokumen Wajib" → "Dokumen Kelengkapan"** — Rename halaman
3. **Card = multiple sub-kategori** — Satu card bisa punya pill/dropdown
4. **Info-only cards** — Penggandaan, Cetak Foto, Cetak Banner, Tagihan (tidak ada form)
5. **BKU = upload only** — Bukan BKU management app

---

## 🔧 KEY FILES untuk DIPAHAMI

### Untuk Memahami Template Engine
1. `RESEARCH_TEMPLATE_ENGINE.md` — Arsitektur lengkap
2. `spj-frontend/src/data/templateConfig.js` — 13 template definitions
3. `spj-frontend/src/components/templates/TemplateEngine.jsx` — Universal renderer
4. `spj-frontend/src/components/templates/blocks/` — 8 block components

### Untuk Memahami Struktur Card
1. `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` — Card definitions
2. `spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx` — Category grouping

### Untuk Memahami Data
1. `template/ANALISIS_TEMPLATE.md` — Field mapping tiap template
2. `template/Form. Honor_2026.xlsx` — Excel structure
3. `template/*.docx` — DOCX structure

---

## ⚠️ HAL YANG PERLU DIINGAT

1. **LocalStorage prefix**: `spj_` (jangan diubah)
2. **Router paths**:
   - `/dashboard/dokumen-lpj` (bukan `/dokumen-spj`)
   - `/dashboard/dokumen-kelengkapan` (bukan `/dokumen-wajib`)
3. **Backward compatibility**: Redirect dari旧route ada di App.jsx
4. **Template files**: Hanya 4 file di folder `template/` (3 DOCX + 1 Excel)
5. **Info-only cards**: Tidak ada form/modal, hanya informasi

---

## 🔄 FLOW KERJA TEMPLATE

```
User klik card → Pilih sub-kategori (pill) → Modal buka
  → TemplateEngine baca config dari templateConfig.js
  → Render blocks berurutan (kop → header → table → signature)
  → User isi form → Data tersimpan ke localStorage
  → User klik "Cetak" → Print CSS A4
```

---

## 📞 KONTAK SEKOLAH (Default Data)

```
Nama: SD NEGERI LEBAKLEUNGSIR
NPSN: 20228636
Alamat: Kp. Lebakleungsir RT 02 RW 10, Desa Mekarjaya
Kecamatan: Cikalongwetan
Kabupaten: Bandung Barat
Kode Pos: 40556
Email: sdn.lebakleungsir@gmail.com

Kepsek: BADRUDDIN, S.Ag. (NIP. 197405082014121002)
Bendahara: DEDE GUNAWAN, S.Pd. (NIP. 198507172020121003)
```

---

## 💡 TIPS UNTUK AI AGENT

1. **Mulai dari**: Baca file ini → `PRD_IMPLEMENTASI.md` → `RESEARCH_TEMPLATE_ENGINE.md`
2. **Untuk edit template**: Lihat `templateConfig.js` → `blocks/` components
3. **Untuk tambah card**: Edit `DokumenSPJPage.jsx` → add ke `CARDS` array
4. **Untuk tambah template**: Edit `templateConfig.js` → add ke `TEMPLATE_CONFIGS`
5. **Build test selalu**: `cd spj-frontend && npm run build`

---

*Last updated: 2026-07-09 | Commit: d32e84f*
