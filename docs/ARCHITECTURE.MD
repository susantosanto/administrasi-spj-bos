# ARCHITECTURE.MD — Peta Sistem & Komponen

(Backfill dari kondisi aktual saat adopsi workflow 2026-09-13 — ritel 3 Jalur A 27.8.2.
Diekstrak dari docs/STANDAR-TEKNIS.md agar mengikuti struktur standar docs/ Bab 6.1.)

## 📁 PROJECT STRUCTURE (kondisi per 2026-07-30)

```
D:/project/spj-app/
├── 📄 AGENTS.MD                   ← router agent (baca dulu!)
├── 📁 docs/                       ← dokumentasi (5 file standar + riset/PRD lama)
├── 📁 spj-frontend/               ← Frontend React (MAIN APP)
│   ├── 📄 package.json / vite.config.js / tailwind.config.js
│   ├── 📁 src/
│   │   ├── 📄 App.jsx             ← Routes & navigation
│   │   ├── 📄 main.jsx            ← Entry point
│   │   ├── 📄 index.css           ← Design system + print CSS
│   │   ├── 📁 components/
│   │   │   ├── 📁 layout/         ← Sidebar, Topbar
│   │   │   ├── 📁 templates/      ← Template Engine
│   │   │   │   ├── TemplateEngine.jsx
│   │   │   │   └── blocks/        ← Block components + *Editor.jsx
│   │   │   └── 📁 ui/             ← Toast
│   │   ├── 📁 data/
│   │   │   ├── mockData.js
│   │   │   ├── templateConfig.js  ← 13 template definitions
│   │   │   └── skPasal.js         ← Default pasal SK honorer (CRUD + reset)
│   │   ├── 📁 layouts/DashboardLayout.jsx
│   │   ├── 📁 pages/
│   │   │   ├── LandingPage.jsx / LoginPage.jsx
│   │   │   └── dashboard/
│   │   │       ├── DashboardHome.jsx
│   │   │       ├── DokumenSPJPage.jsx      ← HALAMAN UTAMA (LPJ)
│   │   │       ├── DokumenKelengkapanPage.jsx
│   │   │       ├── BKUPage.jsx / DataSekolahPage.jsx / DataGuruPage.jsx
│   │   │       ├── RealisasiPage.jsx / PengaturanPage.jsx
│   │   └── 📁 utils/
│   │       ├── storageHelper.js / templateHelpers.jsx
│   │       ├── signatureRoles.js / sekolahData.js
│   └── 📁 public/docs/            ← Download referensi
├── 📁 template/                   ← File template asli (DOCX + Excel)
└── 📁 template-data/
```

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

## 🔄 FLOW KERJA TEMPLATE (Konsep Accordion/Toggle, updated 2026-07-13)

### Prinsip Utama
- **TIDAK ADA MODAL** untuk card dokumen
- **Detail muncul di bawah** section cards (inline accordion)
- **Satu card aktif** pada satu waktu + **highlight visual** pada card terpilih

### State Management

```javascript
const [selectedCard, setSelectedCard] = useState(null)              // ID card aktif
const [selectedSubKategori, setSelectedSubKategori] = useState(null) // Sub-kategori aktif

const handleCardClick = (cardId) => {
  if (selectedCard === cardId) {
    setSelectedCard(null)              // klik card sama → tutup
    setSelectedSubKategori(null)
  } else {
    setSelectedCard(cardId)            // klik card lain → buka baru
    setSelectedSubKategori(null)       // reset sub-kategori
  }
}
```

### CSS Classes

```jsx
const cardBaseClass = "bg-white border-2 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer"
const cardNormalClass = "border-slate-200"
const cardSelectedClass = "border-primary ring-4 ring-primary/10"
const detailPanelClass = "bg-primary/5 rounded-2xl border border-primary/20 p-6 space-y-4 animate-fade-in"
```

Referensi konsep: website `pekppp.disdikkbb.org` (section "Ringkasan Capaian 6 Aspek").

## 📄 KONSEP DETAIL DOKUMEN PREMIUM (2 Wajah: Layar vs Cetak) — WAJIB

> **Referensi implementasi pertama**: Tab "SK Honorer" (2026-08). Semua template dokumen
> yang ditambahkan nanti WAJIB mengikuti konsep ini.

### Prinsip Utama

| Wajah | Muncul saat | Isi | Contoh |
|-------|-------------|-----|--------|
| **Wajah Layar** | Tab dibuka (SEBELUM cetak) | Workspace PREMIUM: editor/review — BUKAN dokumen formal | `SkHonorerEditor.jsx` |
| **Wajah Cetak** | Tombol Cetak/Print diklik | Dokumen FORMAL lengkap persis template asli (kop, judul, tabel, pasal, TTD) | `SKHonorer.jsx` |

> ⚠️ **DILARANG** menampilkan dokumen formal lengkap sebagai tampilan tab.
> Tampilan tab = tempat user *menyiapkan* dokumen. Dokumen formal = *hasil* cetak.

### Aturan Wajah Layar (tab / sebelum cetak)

1. **Data Surat** — field isian utama (nomor surat, dibuat di, tanggal ttd) editable inline.
2. **Data Penerima** — kartu per penerima, data di-ENRICH otomatis dari Data Guru/Tendik
   (nama, jabatan, NUPTK, NIP, golongan, tempatLahir, tanggalLahir, alamat); field kosong
   bisa dilengkapi manual (write back ke formData).
3. **Konten berulang (pasal/poin/baris)** — editor CRUD premium: tambah/edit/hapus/urutkan;
   default konten di `src/data/<nama>.js` (`DEFAULT_*` + `cloneDefault*()` deep clone);
   tombol "Reset ke Standar"; persistensi formData + localStorage (prefix `spj_`).
4. **Readiness check** — field kosong wajib di-highlight INLINE (dashed underline) +
   checklist + badge status per penerima ("Siap Cetak" / "N perlu diisi").
5. **Toolbar cetak** — "Cetak Semua (N)" + per-dokumen, via `window.print()`.

### 🎨 Premium Design Language — Wajah Layar (referensi: `SkHonorerEditor.jsx`)

#### 1. Layout
- Kontainer antar section: `space-y-6`
- Kartu penerima: `grid gap-3 md:grid-cols-2`
- Data surat: `grid gap-3 md:grid-cols-3`; field dalam kartu: `grid grid-cols-2 gap-2`

#### 2. Design Tokens (Tailwind) — WAJIB konsisten

| Elemen | Class |
|--------|-------|
| Kartu / section | `rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all` |
| Icon tile (toolbar) | `rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25` |
| Avatar penerima | `rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-md shadow-primary/20` |
| Badge nomor (pasal) | `rounded-lg bg-gradient-to-br from-primary to-blue-600 text-white` |
| Input / textarea | `bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent` |
| Label field | `text-[10px] font-semibold uppercase text-slate-500` |
| CTA utama (Cetak) | `bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 hover:brightness-110 active:scale-[0.98]` |
| Tombol sekunder (Reset) | `border border-slate-200 bg-white text-slate-600 hover:bg-slate-50` |
| Tombol aksi kecil (up/down) | `p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30` |
| Tombol hapus | `text-slate-400 hover:bg-red-50 hover:text-red-500` |
| Pill jumlah | `rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary` |
| Strip identitas read-only | `rounded-xl bg-slate-50 px-3 py-2 text-[10px] text-slate-500` |
| Tombol tambah halus (per pasal) | `text-primary bg-primary/5 hover:bg-primary/10 rounded-lg text-[11px] font-semibold` |
| Tombol tambah besar (dashed) | `w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold` |

#### 3. Anatomy Komponen Tab (urutan WAJIB)

1. **Toolbar** — icon tile gradient (material icon) + judul "Editor <Nama Dokumen>" + subtitle meta; kanan: Reset + CTA "Cetak Semua (N)" gradient primary.
2. **Data Surat** — kartu dengan section header + grid isian.
3. **Daftar Penerima** — kartu per penerima: avatar initials gradient + nama + meta + hapus; strip identitas read-only (NUPTK, NIP); field manual (TTL, Pendidikan, Alamat, Kelas) write back ke formData.
4. **Konten berulang (pasal/poin)** — kartu per item: badge nomor gradient + judul editable + aksi up/down/delete; pembuka opsional + poin dengan badge level penomoran; tombol tambah halus + tombol tambah besar dashed.

#### 4. Section Header Pattern

```
[icon text-primary]  JUDUL UPPERCASE  [count pill]  — hint muted (text-[10px] text-slate-400)
```

#### 5. Micro-Interactions WAJIB
- Semua tombol/kartu: `transition-all`
- CTA utama: `hover:brightness-110 active:scale-[0.98]`
- Kartu: `hover:shadow-md`; tombol aksi disabled: `disabled:opacity-30`
- Ikon: `material-symbols-outlined` (size `text-sm` s/d `text-lg`)

#### 6. Warna
- Blue-only (#004ac6 + slate); gradient `primary → blue-600` untuk elemen hero.
- Pengecualian: warna sinyal hanya untuk indikator status sementara di layar
  (badge kesiapan, highlight field kosong) — tidak pernah ikut cetak.

### Aturan Wajah Cetak (saat print)

1. Komponen format formal HANYA dirender di **area cetak tersembunyi**:
   ```css
   .print-area { display: none; }        /* dokumen formal: sembunyi di layar */
   .screen-only { display: block; }      /* konten layar */
   @media print {
     .print-area { display: block !important; }
     .print-area .doc-print:not(:last-child) { page-break-after: always; }
     .screen-only { display: none !important; }
   }
   ```
   (Implementasi saat ini: `.sk-print-area` / `.sk-screen-only` di `spj-frontend/src/index.css`.)
2. Per dokumen: `page-break-after: always`, dokumen terakhir `auto`.
3. Chrome layar (shadow, warna, badge, highlight, tombol) TIDAK PERNAH ikut cetak.
4. Isi format formal = persis file template asli (DOCX/Excel); nomor surat dsb. dari formData.
5. Token isian per penerima pakai `{{field}}` → diganti per dokumen saat render (mis. `{{kelasGuru}}`).

### Aturan Penomoran Konten Berulang
- level 0 → **angka** (1., 2., 3.) — style decimal
- level 1 → **huruf** (a., b., c.) — style lower-letter
- JANGAN pakai satu class CSS untuk semua level (bug di `template/sk-honorer.html`:
  sub-item ikut angka, padahal DOCX asli memakai huruf)

### Checklist Template Dokumen Baru (WAJIB)

- [ ] Buat editor wajah layar (`blocks/<Nama>Editor.jsx`) — workspace premium, BUKAN dokumen formal
- [ ] Ikuti **Premium Design Language** (tokens + anatomy + section header + micro-interactions)
- [ ] Buat block format formal (`blocks/<Nama>.jsx`) yang dirender HANYA di print-area
- [ ] Default konten + `cloneDefault*()` di `src/data/<nama>.js`
- [ ] Enrich data penerima dari Data Guru/Tendik
- [ ] Readiness check + highlight field kosong (layar only)
- [ ] CSS `print-area` / `screen-only` + page-break
- [ ] Build: `cd spj-frontend && npm run build`
- [ ] Smoke-test render server-side (editor + format formal, mode preview & edit)
- [ ] Update `docs/PROGRESS.md`

## 📄 UKURAN KERTAS: A4 (WAJIB)

| Mode | Orientasi | Ukuran | Padding |
|------|-----------|--------|---------|
| **Portrait** | Vertikal | 210mm × 297mm | 20mm × 25mm |
| **Landscape** | Horizontal | 297mm × 210mm | 15mm × 20mm |

### CSS Print Settings

```css
.print-container.portrait  { width: 210mm; min-height: 297mm; padding: 20mm 25mm; }
.print-container.landscape { width: 297mm; min-height: 210mm; padding: 15mm 20mm; }
@page { size: A4; margin: 0; }
```

### Template Orientations

| Template | Orientasi | Keterangan |
|----------|-----------|------------|
| Honor (Guru/Tendik/Perpus/Penjaga) | **Landscape** | Tabel lebar |
| Transport (Rapat/Koordinasi/Bank/Pendamping) | **Landscape** | Tabel lebar |
| Upah Kerja / Pulsa | **Landscape** | Tabel lebar |
| SPPD / Surat Tugas | **Portrait** | Surat formal, auto-include di transport |
| Notulen / Buku Tamu / BKU | **Portrait** | Dokumen formal |

### ⚠️ ATURAN PENTING

1. **JANGAN** mengubah ukuran kertas dari A4
2. **Gunakan** `mm` sebagai satuan (bukan `px` atau `em`)
3. **Preview** harus menampilkan ukuran yang sama dengan print
4. **Orientasi** ditentukan di `templateConfig.js` → `orientation: 'landscape'`

## 🔧 KEY FILES untuk DIPAHAMI

### Template Engine
1. `docs/RESEARCH_TEMPLATE_ENGINE.md` — arsitektur lengkap
2. `spj-frontend/src/data/templateConfig.js` — 13 template definitions
3. `spj-frontend/src/components/templates/TemplateEngine.jsx` — universal renderer
4. `spj-frontend/src/components/templates/blocks/` — block components

### Struktur Card
1. `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` — card definitions
2. `spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx` — category grouping

### Data Template
1. `docs/ANALISIS_TEMPLATE.md` — field mapping tiap template
2. `template/Form. Honor_2026.xlsx` — Excel structure
3. `template/*.docx` — DOCX structure
