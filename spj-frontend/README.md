# 📋 LPJ BOS/BOSP — Frontend (`spj-frontend`)

> Frontend React untuk cetak dokumen LPJ. **Dokumen sinkron dengan kode per 13 Okt 2026.**
> README root (`../README.md`) adalah overview repo; file ini detail frontend.

## 🎯 Fitur (terverifikasi kode)

- **📄 Dokumen LPJ** (`pages/dashboard/DokumenSPJPage.jsx`) — 8 card:
  - BKU Utama: Honorarium (guru/tendik/perpus/penjaga), Perjalanan Dinas (rapat/koordinasi/bank/pendamping + SPPD auto-fill), Makan & Minum (rapat/kegiatan/tamu), Pemeliharaan (alat/upah)
  - Dokumen Pendukung info-only: Penggandaan, Cetak Foto, Cetak Banner, Tagihan
  - Alur khusus Honor/Transport/Mamin/Upah via `components/templates/DokumenFormPreview.jsx` (Form → Preview → Revisi, pilih penerima dari Data Guru/Tendik, nominal dari BKU, generate nomor surat + ringkasan AI untuk notulen)
- **📁 Dokumen Kelengkapan** (`DokumenKelengkapanPage.jsx`) — 12 item / 5 kategori: SIPLAH (PBJ), Keuangan (RK/BAP/Papan BOS), Umum (KS/PD), Laporan (R-CVR/R-SKT/R-ALR/R-ILB), Blanko (DH/SU) + toggle SIPLAH + progress
- **📊 BKU** (`BKUPage.jsx` + `utils/bkuParser.js` + `components/bku/BKUSidebar.jsx`) — upload Excel ARKAS `Page1`, 10 tipe transaksi, 7 kategori belanja, filter bulan/tahun
- **🏫 Data Sekolah + Pejabat** (`DataSekolahPage.jsx`, `PejabatSekolahPage.jsx` + `utils/sekolahParser.js`) — upload Dapodik/ARKAS
- **👥 Data Guru** (`DataGuruPage.jsx` + `utils/guruTendikParser.js`) — upload Dapodik 51 kolom, filter PNS/PPPK/Honorer
- **🔢 Nomor Surat + Template Surat** (`NomorSuratPage.jsx`, `TemplateSuratPage.jsx` + `utils/nomorSuratHelper.js`, `templateSuratHelper.js`, `data/formatNomorSurat.js`, `data/kodeReferensi.js`)
- **📈 Realisasi, Referensi Kode, Catatan, Pengaturan** (`RealisasiPage.jsx`, `ReferensiKodePage.jsx`, `NotesPage.jsx`, `PengaturanPage.jsx`)
- **🤖 AI** (`components/ai/`, `contexts/AIContext.jsx`, `utils/aiHelper.js`, `aiConfig.js`, `queryEngine.js`, `intentClassifier.js`, `dataContextBuilder.js`) — AskAI panel + proxy Vite `/api/gemini|groq|cerebras`
- **🖨️ Cetak** — print CSS A4 portrait/landscape per `templateConfig.orientation`

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Framework | React 18.2 |
| Build Tool | Vite 5.1 (+ `scripts/copy-docs.js` di `dev/build/preview`) |
| Styling | Tailwind CSS 3.4 — token di `tailwind.config.js` = Single Source of Truth (lihat `DESIGN.md` untuk panduan) |
| Routing | React Router v6 (lihat `src/App.jsx`) — `/`, `/login`, `/pratinjau`, `/dashboard/*` (13 nested + 2 redirect kompatibilitas) |
| Ikon | Material Symbols Outlined + lucide-react |
| State | localStorage prefix `spj_*` (auth dummy `spj_auth`) |
| Excel | xlsx (SheetJS) |
| PDF | pdfjs-dist |
| AI image | @heyputer/puter.js (`services/imageGenerator.js`, masih placeholder) |

## 🚀 Getting Started

```bash
cd spj-frontend
npm install
npm run dev      # http://localhost:5173/
npm run build
npm run preview
```

Node 18+.

## 📁 Struktur Aktual (`src/`, 74 file)

```
src/
├── App.jsx, main.jsx (force light mode), index.css
├── components/
│   ├── layout/      ← Sidebar.jsx, Topbar.jsx
│   ├── templates/   ← TemplateEngine.jsx, DokumenFormPreview.jsx, blocks/ (11: KopSurat, HeaderDokumen, TabelFields, TabelDinamis, TabelLetterHeader, InfoKeuangan, PoinPembahasan, UraianKegiatan, SignatureFooter + AutoFillHonorButton, NomorSuratPopup)
│   ├── ai/          ← AskAIButton.jsx, AskAIPanel.jsx
│   ├── bku/         ← BKUSidebar.jsx
│   ├── dokumentasi/ ← DokumentasiAIGenerate.jsx, PersonelFotoTab.jsx
│   └── ui/          ← Toast.jsx, DownloadConfirmModal.jsx
├── pages/
│   ├── LandingPage.jsx, LoginPage.jsx, PratinjauPage.jsx, DokumentasiAIPage.jsx
│   └── dashboard/   ← 13: DashboardHome, DataSekolah, PejabatSekolah, DataGuru, BKU, DokumenSPJ, DokumenKelengkapan, Realisasi, NomorSurat, TemplateSurat, ReferensiKode, Notes, Pengaturan
├── layouts/         ← DashboardLayout.jsx (+ seedMockData)
├── data/            ← templateConfig.js (18 template = SoT), mockData.js, kodeReferensi.js, spjRequirements.js, contextMap.js, formatNomorSurat.js
├── contexts/        ← AIContext.jsx, SidebarContext.jsx
├── services/        ← imageGenerator.js
└── utils/ (20)      ← bkuParser, sekolahParser, guruTendikParser, nomorSuratHelper, templateSuratHelper, honorHelper, bkuHelper, sekolahData, signatureRoles, storageHelper, templateHelpers, templateDetector, queryEngine, intentClassifier, dataContextBuilder, semanticCache, docHelper, pdfTableExtractor, aiHelper, aiConfig
```

## 🧩 18 Template (`data/templateConfig.js`)

| ID | Card | Sub | Sumber |
|----|------|-----|--------|
| honor_guru / honor_tendik / honor_perpus / honor_penjaga | honor | guru/tendik/perpus/penjaga | Excel |
| transpor_rapat / koordinasi / bank / pendamping | perjalanan_dinas | rapat/koordinasi/bank/pendamping | Excel |
| sppd | perjalanan_dinas | auto-fill dari transport | DOCX |
| lampiran_daftar_tugas | perjalanan_dinas | lampiran | — |
| notulen / undangan_mamin / pesanan_mamin / buku_tamu / daftar_hadir | mamin | notulen/rapat/kegiatan/buku_tamu | DOCX |
| upah | pemeliharaan | alat | Excel |
| pulsa | tagihan | pulsa | Excel |
| bku | keuangan | bku | Excel Page1 |

Rumus tabel: `JUMLAH = VOL × UNIT COST` (mul), `DITERIMA = JUMLAH − PPh` (sub). Kode default: honor `5.1.02.02.01.0013`, transport `5.1.02.04.01.0003`, upah `5.1.02.02.01.0016`, pulsa `5.1.02.02.01.0063`.

## 📄 License

MIT
