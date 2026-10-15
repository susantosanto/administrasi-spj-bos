# 🏗️ ARSITEKTUR.md — Arsitektur Sistem Aplikasi LPJ BOS/BOSP

> **Tanggal:** 15 Okt 2026 · **Branch:** `redesign/v2-foundation`
> **Status:** dalam redesign UI/UX v2 (pendekatan strangler fig) — Step 0–5.5 selesai
> **Sumber:** inspeksi langsung codebase (`spj-frontend/`)

---

## 1. Gambaran Umum

Aplikasi web **frontend-only** (tanpa backend) untuk cetak dokumen LPJ dana BOS/BOSP sekolah.

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React 18 SPA, Vite 5)                         │
│                                                         │
│  Lapisan Presentasi (diganti bertahap → src/ui/ v2)     │
│  Lapisan Logika (dipertahankan: parser, storage, AI)    │
│  Penyimpanan Lokal (localStorage prefix spj_*)          │
│                                                         │
│  Keluar: serverless proxy /api/* (AI) · cetak A4 → PDF  │
└─────────────────────────────────────────────────────────┘
```

| Aspek | Keputusan |
|---|---|
| Framework | React 18.2 + Vite 5 + Tailwind 3.4 + React Router v6 |
| Backend | Tidak ada (MVP/demo); satu fungsi serverless `api/[...path].js` sebagai proxy AI |
| State | `localStorage` via `storageAdapter.js` (quota guard ±5 MB, `spj_schema_version`) |
| Auth | Dummy (`spj_auth`) — belum untuk produksi |
| Excel | SheetJS (`xlsx`) — parser BKU ARKAS + Dapodik, murni di frontend |
| AI | Puter.js + Cerebras/Groq/Gemini via proxy `/api/*` |
| Ikon | **lucide-react saja** (Material Symbols dihapus di v2) |
| Font | Self-host via `@fontsource` (Inter + Hanken Grotesk + JetBrains Mono) |
| Test | Vitest 2 + jsdom + Testing Library — **125/125 hijau** |

---

## 2. Strategi Redesign: Strangler Fig

UI lama (`src/components/`, `src/pages/`) **hidup berdampingan** dengan UI baru (`src/ui/`) sampai migrasi halaman selesai (Step 5+). Yang dibekukan dan tidak disentuh:

- `src/utils/` — parser BKU/Dapodik, storage, nomor surat, AI (logic layer)
- `src/data/templateConfig.js` — **18 template SSOT**
- `api/[...path].js` — proxy AI

Titik rollback: tag `v1.0-pre-redesign` + 6 file `*.v1-backup`.

---

## 3. Design System v2 — "Tenang"

Dokumen terkunci: `DESIGN_AUDIT.md` · `DESIGN_PRINCIPLES.md` · `DESIGN_TOKENS.md` · `DESIGN.md`.

- **Satu token warna** (`primary #004AC6`), semantic via **CSS variables** — dark mode solid otomatis, tanpa `!important` war (kecuali 2 dari spek: reduced-motion + print edit-mode)
- Spacing grid 8px · radius 8/12/16/24/full · shadow `sm/md/lg/primary` · motion 150/250/400ms
- Prinsip: Calm, Trustworthy, Print-first, Accessible (WCAG AA), Token-driven

---

## 4. Library Komponen `src/ui/` (25 komponen)

```
src/ui/
├── cn.js                  ← merger className (clsx + tailwind-merge)
├── atoms/           (12)  ← Button, Input, Textarea, Select, Checkbox, Radio,
│                            Badge, Avatar, Spinner, Skeleton, IconButton, Divider
├── molecules/      (8)    ← Card(+5 sub), FormField, Alert, Breadcrumb,
│                            Toast(+provider), Tabs, Modal, Dropdown(+item/sep)
├── organisms/      (5)    ← Sidebar, Topbar, PageContainer, PageHeader, AppShell
└── __tests__/     (26)    ← 1 test per komponen + setup.js
```

Konvensi: token-driven, forward ref, ARIA/keyboard, `cn()` untuk merge class, default export.

---

## 5. Routing (`src/App.jsx`)

- **Publik:** `/` (Landing) · `/login` (sudah migrasi v2 ✅) · `/pratinjau`
- **Proteksi** (`ProtectedRoute`, `/dashboard`): index + 13 halaman
  `data-sekolah`, `pejabat-sekolah`, `data-guru`, `bku`, `dokumen-lpj`
  (+redirect `dokumen-spj`), `dokumen-kelengkapan` (+redirect `dokumen-wajib`),
  `realisasi`, `nomor-surat`, `template-surat`, `catatan`, `kode-referensi`, `pengaturan`
- `AskAIButton` hanya di area login; toast lama di-mount di root (`App.jsx`)

---

## 6. Alur Data Inti

```
Dapodik/ARKAS (.xlsx)
  → parser (bkuParser / sekolahParser / guruTendikParser)
  → localStorage spj_* (+ checklist LPJ, progress dashboard)
  → TemplateEngine (templateConfig JSON → 9 tipe blok)
  → preview A4 (.preview-container) → cetak (.print-container) → PDF
```

Nomor surat auto-increment + roman bulan; nominal dokumen di-match dari BKU (nama + bulan + kode rekening); SPPD auto-fill dari daftar penerima transport.

---

## 7. Peran dalam Proyek

| Peran | Pemegang | Tugas |
|---|---|---|
| Arsitek UI/UX | Pengguna (Anda) | Prompt STEP per tahap, dokumen fondasi, keputusan desain |
| Eksekutor | AI (sesi ini) | Menjalankan instruksi + lapor format baku, tanpa asumsi |

---

*Dokumen hidup — perbarui saat Step 6+ (migrasi halaman) mengubah peta di atas.*
