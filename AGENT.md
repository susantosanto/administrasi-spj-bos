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
- **Primary**: `#004ac6` (Biru) — **WARNA UTAMA & SATU-SATUNYA WARNA BRANDED**
- **Background**: `#f8f9fb`
- **Fonts**: Hanken Grotesk (Headlines), Inter (Body)
- **Icons**: Material Symbols Outlined

### ⚠️ ATURAN WARNA WAJIB

**HANYA gunakan warna biru primary (#004ac6) dan variasinya!**

| Komponen | Warna |
|----------|-------|
| Primary | `bg-primary` / `#004ac6` |
| Primary Light | `bg-primary/10` / `bg-primary/20` |
| Primary Dark | `text-primary` / `bg-primary` |
| Background | `bg-white` / `bg-slate-50` / `bg-slate-100` |
| Text | `text-slate-900` / `text-slate-700` / `text-slate-500` |
| Border | `border-slate-200` / `border-slate-100`

**DILARANG menggunakan warna lain:**
- ❌ NO emerald/green (bg-emerald-*)
- ❌ NO amber/yellow (bg-amber-*)
- ❌ NO rose/red (bg-rose-*)
- ❌ NO violet/purple (bg-violet-*)
- ❌ NO cyan (bg-cyan-*)

Gunakan shade slate untuk variasi, BUKAN warna lain!

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

## 📐 CLEAN CODE STANDARDS

> **WAJIB**: Semua code yang ditulis harus mengikuti standar ini agar mudah dibaca oleh manusia (pemula) dan dipahami oleh AI agent.

### 1. Naming Convention

| Tipe | Format | Contoh |
|------|--------|--------|
| Component | PascalCase | `TemplateEngine.jsx`, `KopSurat.jsx` |
| Function | camelCase | `handleOpenCard()`, `getStatus()` |
| Variable | camelCase | `selectedSubKategori`, `formData` |
| Constant | UPPER_SNAKE | `COLOR_MAP`, `TEMPLATE_CONFIGS` |
| CSS Class | kebab-case | `bg-primary`, `text-on-surface` |
| File | PascalCase (components), camelCase (utils) | `TemplateEngine.jsx`, `templateHelpers.js` |

### 2. File Structure Pattern

```javascript
// ═══════════════════════════════════════════════════════════════════════════
// NAMA BAGIAN (misal: CONSTANTS, TYPES, COMPONENT)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Imports (diurutkan: external → internal → utils)
import { useState } from 'react'
import storageHelper from '../../utils/storageHelper'
import TemplateEngine from '../templates/TemplateEngine'

// 2. Constants/Config
const COLORS = { ... }
const CARDS = [ ... ]

// 3. Component
export default function MyComponent() {
  // 3.1 State declarations
  const [data, setData] = useState({})
  
  // 3.2 Effects
  useEffect(() => { ... }, [])
  
  // 3.3 Helper functions
  const getStatus = () => { ... }
  
  // 3.4 Event handlers
  const handleClick = () => { ... }
  
  // 3.5 Render
  return ( ... )
}
```

### 3. Comments & Documentation

```javascript
// ✅ BAIK: Comment menjelaskan MENGAPA, bukan APA
// Filter transaksi yang valid (tanggal + uraian harus ada)
const validTransactions = transactions.filter(t => t.tanggal && t.uraian)

// ❌ JELEK: Comment menjelaskan APA (redundan)
// Filter transaksi
const validTransactions = transactions.filter(t => t.tanggal && t.uraian)

// ✅ BAIK: Section divider untuk bagian besar
// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// ✅ BAIK: JSDoc untuk functions yang kompleks
/**
 * Parse BKU Excel file from ARKAS
 * @param {File} file - Excel file to parse
 * @returns {Promise<Object>} Parsed BKU data
 */
```

### 4. Component Guidelines

```javascript
// ✅ BAIK: Single responsibility, props jelas
function TabelFields({ blockConfig, data, onChange, mode }) {
  // blockConfig = konfigurasi kolom
  // data = data yang akan ditampilkan
  // onChange = callback saat data berubah
  // mode = 'edit' | 'print'
  
  return ( ... )
}

// ❌ JELEK: Terlalu banyak props, tidak jelas
function TabelFields({ config, d, cb, m, foo, bar }) {
  return ( ... )
}
```

### 5. Code Readability Rules

| Rule | Contoh ❌ | Contoh ✅ |
|------|-----------|-----------|
| Hindari magic numbers | `if (x > 5)` | `if (x > MAX_RETRY)` |
| Hindari nested terlalu dalam | `if (a) { if (b) { if (c) { ... } } }` | Guard clause: `if (!a) return; if (!b) return; ...` |
| Function < 50 baris | Function 200 baris | Split menjadi beberapa function |
| Variable names deskriptif | `const d = items.filter(...)` | `const completedItems = items.filter(...)` |
| Hindari `any` type | `let data: any` | `let data: BKUData \| null` |

### 6. File Size Guidelines

| Tipe | Maks | Jika lebih dari itu |
|------|------|---------------------|
| Component | 300 baris | Split ke child components |
| Utility | 200 baris | Split ke multiple files |
| Config | 150 baris | Group ke separate files |

### 7. AI Agent Compatibility

```javascript
// ✅ BAIK: AI agent bisa langsung pahami
// Component: HeaderDokumen
// Fungsi: Menampilkan judul + nomor surat
// Props: blockConfig (konfigurasi), data (form data), onChange (callback)

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const SIGNATURE_ROLES = {
  'kepala-sekolah': {
    label: 'Kepala Sekolah,',        // Label untuk tampilan
    defaultName: 'BADRUDDIN, S.Ag.',  // Default nama
    defaultNip: 'NIP. 197405082014121002',  // Default NIP
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function SignatureFooter({ blockConfig, data, onChange, mode }) {
  // Extract props untuk readability
  const roles = blockConfig.roles || ['kepala-sekolah']
  const tempat = data.tempat || 'Cikalongwetan'
  
  return ( ... )
}
```

### 8. Testing Checklist

Sebelum commit, pastikan:
- [ ] Code bisa dibaca tanpa comment (variable names jelas)
- [ ] Function tidak lebih dari 50 baris
- [ ] Tidak ada magic numbers (gunakan constants)
- [ ] Comments menjelaskan MENGAPA, bukan APA
- [ ] Build berhasil: `npm run build`
- [ ] Tidak ada console.log yang tertinggal

---

## 💡 TIPS UNTUK AI AGENT

1. **Mulai dari**: Baca file ini → `PRD_IMPLEMENTASI.md` → `RESEARCH_TEMPLATE_ENGINE.md`
2. **Untuk edit template**: Lihat `templateConfig.js` → `blocks/` components
3. **Untuk tambah card**: Edit `DokumenSPJPage.jsx` → add ke `CARDS` array
4. **Untuk tambah template**: Edit `templateConfig.js` → add ke `TEMPLATE_CONFIGS`
5. **Build test selalu**: `cd spj-frontend && npm run build`
6. **Ikuti Clean Code Standards** di atas saat menulis code baru
7. **Baca comments** yang sudah ada untuk memahami konteks

---

*Last updated: 2026-07-09 | Commit: d32e84f*
