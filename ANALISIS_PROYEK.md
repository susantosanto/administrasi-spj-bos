# Analisis Proyek — Administrasi SPJ / LPJ BOS

> Hasil analisis statis codebase per 13 Okt 2026, branch `feat/light-dark-living`.
> Lokasi: `administrasi-spj-bos/` | Frontend utama: `spj-frontend/src/` (74 file) | Docs: `docs/` (65 file)

---

## 1. Ringkasan Eksekutif

Aplikasi web **frontend-only** untuk membantu operator sekolah menyusun dan **mencetak dokumen LPJ (Laporan Pertanggungjawaban) dana BOS/BOSP**. Alur inti: upload profil sekolah (Dapodik) → upload guru/tendik (Dapodik) → upload BKU (ARKAS Excel) → isi form dokumen via **Template Engine data-driven** → cetak A4 ke PDF.

- **Stack:** React 18 + Vite 5 + Tailwind 3 + React Router v6 + SheetJS (`xlsx`) + `lucide-react` + `pdfjs-dist` + `@heyputer/puter.js`.
- **State:** tanpa backend. Semua persisten di `localStorage` prefix `spj_*`. Auth dummy (`spj_auth === 'true'`).
- **Status docs:** `PROGRESS.md` klaim 100% complete, tapi git log masih aktif (landing redesign, light/dark, AI panel) dan ada uncommitted changes — proyek masih berkembang.
- **File analisis ini:** `ANALISIS_PROYEK.md` (baru dibuat dari task ini).

---

## 2. Tujuan & Domain

Domain pendidikan Indonesia: BOS/BOSP, ARKAS, Dapodik, BKU, kode kegiatan/rekening (`5.1.02.xx`), nomor surat dinas (`001/421.2/VII/2026`), dokumen honor / perjalanan dinas / mamin / pemeliharaan / tagihan. Target pengguna: operator SDN (contoh: SDN Lebakleungsir, SDN Pasirhalang di sample data).

---

## 3. Tech Stack

| Lapisan | Teknologi | Keterangan |
|---|---|---|
| Framework | React 18.2, Vite 5.1 | `spj-frontend/package.json`, alias `@` → `/src` |
| Styling | Tailwind 3.4, PostCSS, Autoprefixer | Token custom, `DESIGN.md` referensi Coretax (Plus Jakarta Sans + Montserrat) vs README lama (Hanken Grotesk + Inter + Material Symbols) — tidak sinkron |
| Routing | React Router v6 | Lihat `src/App.jsx:35-80` |
| Excel | SheetJS `xlsx` 0.18.5 | Satu-satunya dep di root `package.json` (untuk `test-bku-*.js`) |
| AI | `@heyputer/puter.js` 2.5.4 + proxy Vite `/api/gemini`, `/api/groq`, `/api/cerebras` | `vite.config.js:15-34`, `src/utils/aiConfig.js`, `src/utils/aiHelper.js` |
| Dokumen | `pdfjs-dist` 4.10.38 | Preview/ekstrak tabel PDF (`pdfTableExtractor.js`) |
| Ikon | `lucide-react` 0.344 | — |
| Deploy | `vercel.json`, `dist/`, `scripts/copy-docs.js` | `dev/build/preview` selalu jalankan `copy-docs.js` dulu |

---

## 4. Struktur Repo

```
administrasi-spj-bos/
├── README.md                  ← overview LPJ, 13 template (sudah usang, kini 18)
├── ANALISIS_PROYEK.md         ← file ini
├── package.json               ← hanya { xlsx } untuk skrip root
├── opencode.jsonc             ← hanya $schema, tanpa custom config
├── test-bku-parser.js         ← parser lengkap BKU (316 baris)
├── test-bku-template.js       ← inspeksi mentah sheet Page1 (93 baris)
├── docs/ (65 file)            ← PRD, riset, roadmap — lihat §10
├── template/ (7 file)         ← 6 .docx + 1 .xlsx honor asli
├── template-data/             ← 4 .xlsx sample (guru, tendik, profil, BKU) + juknis/ (5 PDF regulasi)
└── spj-frontend/              ← aplikasi utama
    ├── api/[...path].js       ← 1 file (fungsi serverless/proxy, perlu dicek sebelum deploy)
    ├── src/ (74 file)         ← lihat §5
    ├── public/, dist/, scripts/copy-docs.js
    ├── index.html, vite.config.js, tailwind.config.js, vercel.json, DESIGN.md
    └── README.md              ← versi lama (SPJ 26+ dokumen, usang vs README root)
```

---

## 5. Arsitektur Frontend (`spj-frontend/src/`)

### 5.1 Entry & Routing — `src/App.jsx:1-80`, `src/main.jsx`

- `main.jsx`: force light mode (hapus `spj_theme`, hapus class `dark`), render `StrictMode<App/>`.
- `App.jsx`: `ToastProvider` + `AIProvider` + `BrowserRouter`.
- `ProtectedRoute`: cek `localStorage spj_auth`, inject `<AskAIButton/>` hanya saat login.
- Routes publik: `/`, `/login`, `/pratinjau` (file uncommitted, baru).
- Routes proteksi `/dashboard` dalam `DashboardLayout`:
  `index` (DashboardHome), `data-sekolah`, `pejabat-sekolah`, `data-guru`, `bku`, `dokumen-lpj` (+redirect `dokumen-spj` → `dokumen-lpj`), `dokumen-kelengkapan` (+redirect `dokumen-wajib`), `realisasi`, `nomor-surat`, `template-surat`, `catatan`, `kode-referensi`, `pengaturan`.

### 5.2 Layout & Context

- `layouts/DashboardLayout.jsx` (42 baris): `SidebarProvider` + `Sidebar` + `<Outlet/>` (`ml-[260px]` desktop), panggil `seedMockData()` saat mount.
- `contexts/SidebarContext.jsx`: state sidebar + auto-close `<1024px`.
- `contexts/AIContext.jsx` (214 baris): chat panel (max 50 pesan, streaming via `askAIStream` + `AbortController`, fallback `askAI`), persist `ai_chat_history`.
- `components/layout/Sidebar.jsx`, `Topbar.jsx` (sedang dimodifikasi, uncommitted), `components/ui/Toast.jsx`, `DownloadConfirmModal.jsx`.

### 5.3 Halaman (17)

Top-level: `LandingPage`, `LoginPage`, `PratinjauPage` (baru), `DokumentasiAIPage`.
Dashboard (13): `DashboardHome`, `DataSekolahPage`, `PejabatSekolahPage`, `DataGuruPage`, `BKUPage`, `DokumenSPJPage` (= Dokumen LPJ), `DokumenKelengkapanPage`, `RealisasiPage`, `NomorSuratPage`, `TemplateSuratPage`, `ReferensiKodePage`, `NotesPage`, `PengaturanPage`.

Fungsi ringkas: Dashboard = ringkasan + download; Data Sekolah/Pejabat/Guru = form + upload Dapodik; BKU = upload ARKAS + sidebar detail + deteksi transaksi; Dokumen LPJ/Kelengkapan = grid card + TemplateEngine + print A4; Realisasi = rekap dana; Nomor Surat/Template Surat = generate + auto-fill; Catatan = notes pin/warna/grid; Pengaturan = profil/master/backup.

---

## 6. Template Engine (Inti Aplikasi)

Lokasi: `components/templates/TemplateEngine.jsx`, `DokumenFormPreview.jsx`, `components/templates/blocks/` (11 file), `data/templateConfig.js` (898 baris), `utils/templateHelpers.jsx`, `templateDetector.js`, `honorHelper.js`, `bkuHelper.js`.

Pola: `templateConfig (JSON) → TemplateEngine → Block Components`.

**18 template** di `TEMPLATE_CONFIGS` (README root masih tulis 13 — usang):

| ID | Card | Sumber |
|---|---|---|
| `notulen`, `undangan_mamin`, `pesanan_mamin`, `buku_tamu`, `daftar_hadir` | `mamin` | DOCX |
| `sppd`, `lampiran_daftar_tugas`, `transpor_rapat`, `transpor_koordinasi`, `transpor_bank`, `transpor_pendamping` | `perjalanan_dinas` | DOCX (sppd) / Excel |
| `honor_guru`, `honor_tendik`, `honor_perpus`, `honor_penjaga` | `honor` | Excel |
| `upah` | `pemeliharaan` | Excel |
| `pulsa` | `tagihan` | Excel |
| `bku` | `keuangan` | Excel (`sheet Page1`, kolom A/D/F/I/K/N/Q/T, baris 16–340) |

Struktur per template: `id, label, card, sub_kategori, sourceFile, orientation, blocks[], defaults{bulan, tahun, program, kegiatan, kodeRekening, kodePenggunaan}`.
Jenis `blocks` (9 di `blocks/index.js`): `kop-surat`, `header`, `table-fields`, `table-letter-header`, `uraian-kegiatan`, `table-dinamis` (kolom currency + auto mul/sub), `info-keuangan`, `poin-pembahasan`, `signature` (+ `AutoFillHonorButton`, `NomorSuratPopup`).

---

## 7. Parser Excel (Tanpa Backend)

| Parser | File | Format & fungsi export |
|---|---|---|
| BKU ARKAS | `utils/bkuParser.js` (691 baris) | Sheet `Page1` A1:X365, kolom A=tanggal DD-MM-YYYY, D=kode kegiatan, F=kode rekening, I=no bukti BBU/BNU/BPU, K=uraian, N=penerimaan, Q=pengeluaran, T=saldo. Export: `validateBKUFormat`, `parseBKUExcel` → `{header, transactions[], footer, summary{totalPenerimaanRiil, totalPengeluaranRiil, isBalanced, byType, monthly}}`, `filterByMonth/Year`, `getMaminTransactions` (kode `5.1.02.01.01.0052`), `TRANSACTION_TYPES` (10), `KATEGORI_BELANJA` (7) |
| Sekolah | `utils/sekolahParser.js` (335 baris) | Dapodik `[col1 label][col3 value]` + BKU `[col0][col4]`, `LABEL_MAP` (npsn, nama, alamat, kabupaten, provinsi, tahun, kecamatan). Export `parseSekolahExcel` |
| Guru/Tendik | `utils/guruTendikParser.js` (255 baris) | Dapodik 51 kolom, `HEADER_ROW=4`, `DATA_START=5`. Export `validateDapodikFormat`, `parseGuruTendikExcel` → `{jenis, header, items[{nama, nip, nuptk, status, jenisPtk, ...}], total}` |

Helper terkait: `sekolahData.js` (getSchoolData/Kepala/Bendahara + default), `signatureRoles.js`, `honorHelper.js` (filter honorer per template), `bkuHelper.js` (`findBkuNominal`), `docHelper.js`, `storageHelper.js` (wrapper `spj_*`).

Logika pajak/tarik-tunai: `docs/ALUR_TARIK_TUNAI_DAN_PAJAK.md` — tarik tunai tidak dihitung belanja riil, hanya `PEMBAYARAN + TARIK_TUNAI` di summary.

---

## 8. Fitur AI & Dokumentasi Foto

- `components/ai/AskAIButton.jsx`, `AskAIPanel.jsx` + `README.md`.
- `utils/aiConfig.js`: `PROVIDERS {puter, cerebras, groq, gemini}` + `PROMPTS {intentClassifier, systemQuery, general, notulen, fileAnalysis}`.
- `utils/aiHelper.js`, `queryEngine.js` (`executeQuery`), `intentClassifier.js`, `dataContextBuilder.js` (`buildFullContext`), `semanticCache.js`, `data/contextMap.js`.
- `components/dokumentasi/DokumentasiAIGenerate.jsx`, `PersonelFotoTab.jsx`, `pages/DokumentasiAIPage.jsx`, `services/imageGenerator.js` (279 baris, MVP canvas placeholder — Flux Pro masih dikomen).
- Upload file di AI Panel: PDF/Excel/Image/TXT, limit 4 KB/file (lihat git log).
- Riset: `docs/ai/` (27 file — Flux/Gemini/Grok/GPU VPS/PuterJS, prompt builder, preview cetak).

---

## 9. Nomor Surat, Template Surat, Referensi

- `data/formatNomorSurat.js`: `FORMAT_STANDAR {SD, SMP, SMA, DISDIK}`, `JENIS_SURAT_DEFAULT` (7: STS/SK/SU/SP/SKU/SE/SPD).
- `utils/nomorSuratHelper.js` + `data/kodeReferensi.js` (`KEGIATAN_BOS` 100+ entri, `REKENING_MAP` 16, fetch proxy ARKAS) + `utils/templateSuratHelper.js` (CRUD draft + `generateSuratHTML/download/print`).
- `data/spjRequirements.js`: `SPJ_REQUIREMENTS` 11 kategori + `detectSpjCategory`, `buildSpjChecklist({viaSiplah})`, `isBpuBnu`.
- Halaman: `NomorSuratPage`, `TemplateSuratPage`, `ReferensiKodePage`.

---

## 10. Peta `docs/` (Sorotan)

- Master: `PRD_IMPLEMENTASI.md` (v3, rename SPJ→LPJ + template engine), `PROGRESS.md` (60+ tahap), `AGENT.md` (quick-start AI).
- Arsitektur: `RESEARCH_TEMPLATE_ENGINE.md` (Opsi A React Component), `RESEARCH_BKU_UPLOAD.md` (Page1 + 277 transaksi Pasirhalang), `REVIEW_ARSITEKTUR.md` (SPA + localStorage tepat untuk MVP; produksi: Electron+SQLite), `KONSEP_EXCEL_PARSER_VS_BACKEND_API.md`.
- Aturan: `template-data/juknis/` (5 PDF: Permendikbud 18/2022, Permendikdasmen 8/2026, Permendagri 3/2023, Perbup 34/2022 + perubahan).
- Fitur baru: `PRD_NOMOR_SURAT_OTOMATIS.md`, `PRD_TEMPLATE_SURAT_CERDAS.md`, `PLAN_NOMOR_SURAT.md` (SELESAI), `PRD_DOKUMEN_LPJ.md` (usulan Form→Preview→Revisi), `RESEARCH_FORMAT_NOMOR_SURAT.md`, `RESEARCH_KODE_KLASIFIKASI.md`.
- Deploy: `PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md`, `RISET_SUPABASE_VS_ALTERNATIF.md`, `PERBANDINGAN_TEKNOLOGI_SPJ.md`, `elektron/` (5 PRD/roadmap SQLite + update).
- Desain: `prd-design-prototype.md`, `plan-frontend.md`, `REDESIGN_LANDING_PAGE.md`, `CHANGELOG_REDESIGN.md` (uncommitted).

---

## 11. Template Asli & Sample Data

- `template/`: `NOTULEN RAPAT.docx`, `BUKU TAMU KEDINASAN.docx`, `Daftar Hadir.docx`, `Surat Pesanan Mamin.docx`, `Surat Tugas + SPPD_rapat ops_gugus_2026.docx`, `Surat Undangan Mamin.docx`, `Form. Honor_2026_SDN lebakleungsir.xlsx`.
- `template-data/`: `daftar-guru/tendik-SD NEGERI PASIRHALANG-2026-07-08.xlsx`, `profil-SD NEGERI PASIRHALANG-2026-07-10.xlsx`, `Realisasi Sekolah BKU - RKAS - 2026.xlsx`.
- `test-bku-parser.js` / `test-bku-template.js`: skrip Node validasi struktur BKU sebelum parser final (deteksi section `PENERIMAAN_/PENGELUARAN_/SALDO_`, merge cells).

---

## 12. Penyimpanan & Auth

Semua `localStorage`: `spj_auth`, `spj_seeded`, `spj_pendataan`, `spj_uploads`, `spj_bukti_fisik`, `spj_workshop`, `spj_dokumen_wajib`, `spj_realisasi`, `ai_chat_history`, `spj_theme` (deprecated, dihapus di `main.jsx`), counter/format/nomor surat, draft surat, data sekolah/pejabat/guru/BKU. `mockData.js:seedMockData()` isi data contoh 3 sekolah Mandalamukti saat pertama buka. Tanpa enkripsi, tanpa multi-user, tanpa backend — cocok demo/MVP, tidak untuk produksi multi-sekolah.

---

## 13. Kekuatan

1. Template engine JSON-driven — tambah dokumen tanpa komponen baru.
2. Parser ARKAS/Dapodik toleran (multi-sheet, multi-format, validasi + warning).
3. Nol backend — jalan langsung via Vite/Vercel, mudah didemo.
4. Dokumentasi sangat lengkap (65 file docs + PRD + riset).
5. AI assistant + generate foto terintegrasi konteks data lokal.

## 14. Risiko & Tech Debt

1. **README tidak sinkron:** root tulis 13 template (realita 18), `spj-frontend/README.md` masih 26+ dokumen era SPJ lama; `DESIGN.md` (Coretax) vs README (M3 Corporate Modern).
2. **Skalabilitas localStorage:** limit ~5 MB, rentan penuh oleh BKU besar + chat history; tanpa migrasi/skema versioning.
3. **Auth dummy & tanpa validasi server:** siapa pun bisa set `spj_auth=true`.
4. **Uncommitted changes besar** (11 modified, 3 baru termasuk `PratinjauPage.jsx`) di branch `feat/light-dark-living` — risiko konflik.
5. **Logika keuangan di frontend** (tarik tunai/pajak/saldo) tanpa test otomatis; hanya skrip manual `test-bku-*.js`.
6. **`api/[...path].js` belum dianalisis deploy-nya; proxy AI hanya untuk dev Vite — perlu verifikasi untuk Vercel/prod.**
7. Image generator masih placeholder canvas; Flux Pro belum aktif.

## 15. Rekomendasi Prioritas

1. Sinkronkan README + hapus duplikasi (`spj-frontend/README.md` vs root).
2. Commit/stash perubahan branch aktif sebelum refactor.
3. Tambah test unit untuk `bkuParser` (saldo balance, edge DD-MM-YYYY, serial Excel) — pindahkan `test-bku-*.js` ke `vitest/jest`.
4. Versioning storage (`spj_schema_version`) + migrasi + kuota check.
5. Lanjut roadmap `docs/elektron/` (Electron+SQLite) jika butuh multi-user/offline; atau ikuti `PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md` untuk backend.
6. Amankan kunci AI (jangan di frontend prod) — pindah ke `api/` serverless.

---

## 16. Cara Menjalankan

```bash
cd spj-frontend
npm install
npm run dev     # http://localhost:5173/  (landing), /login, /dashboard
npm run build   # + scripts/copy-docs.js
npm run preview
```

Node 18+. Uji parser manual: `node ../test-bku-parser.js` (butuh `npm i` di root untuk `xlsx`).

---

*Dibuat otomatis dari inspeksi file — bukan dari klaim docs semata. Jika butuh, lanjutkan ke audit per-modul (TemplateEngine, BKUPage, AI) atau rapikan README duplikat.*
