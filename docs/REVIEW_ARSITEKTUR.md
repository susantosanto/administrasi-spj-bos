# REVIEW ARSITEKTUR — Aplikasi SPJ (Surat Pertanggungjawaban Dana BOS/BOSP)

> Tanggal review: 3 Agustus 2026 | Update: 4 Agustus 2026 — keputusan produksi: Electron + SQLite
> Scope: `spj-frontend/` (React SPA) + `api/` (Vercel serverless) + `docs/`
> Diagram alur data: lihat `docs/ALUR_DATA_SPJ.drawio`

---

## 1. Ringkasan Eksekutif

Aplikasi SPJ adalah **aplikasi web frontend-only (SPA React)** untuk membantu operator sekolah
mengelola administrasi pelaporan dana BOS/BOSP. **Seluruh data disimpan di `localStorage`
browser** — tidak ada backend, tidak ada database server, tidak ada autentikasi sungguhan.

**Arsitektur saat ini sudah tepat untuk fase prototype/MVP** (cepat, murah, tanpa server).
Namun **belum siap untuk target 600 sekolah / produksi multi-user**, karena tiga masalah
fundamental:

1. 🔴 **API key AI bocor di bundle frontend** (`VITE_*_API_KEY`)
2. 🔴 **Data tidak persisten lintas perangkat** (localStorage = data per browser)
3. 🔴 **Kapasitas terbatas** (foto base64 + riwayat chat akan memenuhi batas ~5–10 MB)

> **Keputusan produksi: konversi ke Electron + SQLite** ✅ (lihat
> `docs/elektron/RESEARCH_ELECTRON_SQLITE_BERAT.md`). Riset menyimpulkan aplikasi
> **TIDAK menjadi berat**: SQLite justru meringankan (hilangkan batas 5–10 MB; query
> 100rb baris = 2–15 ms), dan beban ±100 MB disk / ±150 MB RAM idle adalah **pajak
> standar platform Electron** — sama untuk semua aplikasi Electron, tidak berbanding
> lurus dengan kompleksitas aplikasi (data per sekolah cuma ~110 KB).

Bagian yang **sudah sangat baik**: lapisan AI (dual-path architecture, semantic cache,
modular provider) — ini contoh abstraksi dan loose coupling yang bagus.

---

## 2. Tujuan, User, Fitur

### 🎯 Tujuan
Mendigitalkan penyusunan **LPJ/SPJ dana BOS/BOSP** di sekolah dasar negeri:
pendataan sekolah & GTK, pengelolaan bukti fisik per jenis belanja (honor, perjalanan dinas,
mamin, penggandaan, sewa, pemeliharaan, tagihan), monitoring realisasi anggaran,
pembuatan dokumen (nomor surat otomatis, template surat, preview A4), dan asisten AI
untuk menjawab pertanyaan serta menganalisis file.

### 👤 User
| Aspek | Jawaban |
|---|---|
| Siapa | **Operator sekolah / bendahara BOS / kepala sekolah SD** (non-teknis) |
| Jumlah per sekolah | 1–3 orang (single device, karena data di localStorage) |
| Target maksimal | **600 sekolah** (dari riset `docs/ai/PRD_ASK_TO_AI.md`) |
| Kapasitas user (saat ini) | **1 user aktif per browser** (tanpa backend) |
| Kapasitas user (dengan backend) | ±**1.800 user** (600 sekolah × 3) — skenario lama, hanya relevan jika kelak ada sinkronisasi lintas perangkat |
| Skala saat ini | Prototype — 1 user per browser |

### ⚙️ Fitur (16 modul)
| Modul | Kompleksitas | Lokasi |
|---|---|---|
| Landing Page & Login | Rendah (auth fake: `spj_auth`) | `pages/LandingPage.jsx`, `LoginPage.jsx` |
| Dashboard Home | Rendah | `pages/dashboard/DashboardHome.jsx` |
| Data Sekolah & Pejabat | Rendah | `DataSekolahPage.jsx`, `PejabatSekolahPage.jsx` |
| Data Guru & Tendik (import Excel Dapodik) | **Sedang** (parser Excel) | `DataGuruPage.jsx` + `guruTendikParser.js` |
| BKU (import Excel ARKAS, analisis) | **Tinggi** (parser + kalkulasi) | `BKUPage.jsx` + `bkuParser.js`, `bkuHelper.js` |
| Dokumen LPJ & Kelengkapan (checklist) | Sedang | `DokumenSPJPage.jsx`, `DokumenKelengkapanPage.jsx` |
| Realisasi Dana BOSP | Sedang | `RealisasiPage.jsx` |
| Nomor Surat (format otomatis per segmen) | **Tinggi** (rule format) | `NomorSuratPage.jsx` + `nomorSuratHelper.js` |
| Template Surat + Preview A4 + cetak | **Tinggi** (template engine) | `TemplateSuratPage.jsx` + `TemplateEngine.jsx` + blocks/ |
| Referensi Kode (fetch klasifikasi) | Sedang | `ReferensiKodePage.jsx` + `kodeReferensi.js` |
| Catatan | Rendah | `NotesPage.jsx` |
| Pengaturan (API key) | Rendah | `PengaturanPage.jsx` |
| **Ask AI** (chat + upload file, streaming) | **Tinggi** (dual-path, intent classifier, query engine, semantic cache) | `AskAIPanel.jsx` + `AIContext.jsx` + utils AI |
| Generate Foto Dokumentasi (AI image) | Sedang | `DokumentasiAIPage.jsx` + `imageGenerator.js` |
| Generate Notulen (multi-agent) | Sedang | `aiHelper.generateRingkasanNotulen()` |

**Tingkat kompleksitas keseluruhan: sedang.** Banyak fitur, tetapi semuanya berjalan
di satu proses browser tanpa backend.

---

## 3. Arsitektur Detail (Kondisi Saat Ini)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — USER                                                         │
│  Operator Sekolah / Bendahara BOS                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 2 — UI LAYER (React 18 SPA + Vite + Tailwind)                   │
│  App.jsx (Router) → 14 halaman dashboard + Landing + Login              │
│  AskAIPanel · DokumenFormPreview (A4) · DokumentasiAIGenerate           │
│  Contexts: AIContext (chat+streaming) · SidebarContext · ToastContext   │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 3 — DOMAIN & BUSINESS SERVICES (src/utils, src/services)         │
│  Parser: bkuParser · guruTendikParser · sekolahParser · pdfTableExtractor│
│  AI:     aiConfig → aiHelper → semanticCache → intentClassifier →       │
│          queryEngine → dataContextBuilder                               │
│  Template: TemplateEngine + blocks/ · nomorSuratHelper · honorHelper    │
│  Export: docHelper (.docx) · imageGenerator (foto AI)                   │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 4 — DATA ACCESS                                                  │
│  storageHelper (prefix "spj_") → localStorage                           │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 5 — EXTERNAL / INTEGRATION                                       │
│  Vite dev proxy / Vercel serverless ([...path].js)                      │
│  AI: Groq · Gemini · Cerebras · Puter.js · fal.run (foto) · allorigins  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Tech Stack
| Komponen | Teknologi |
|---|---|
| Framework | React 18 + Vite 5 + Tailwind 3 |
| Routing | react-router-dom v6 (client-side) |
| State | Context API (AIContext, SidebarContext, ToastContext) — tanpa Redux/Zustand |
| Database | **localStorage** (via `storageHelper`) + seed dari `mockData.js` |
| AI | Puter.js (default, gratis), Cerebras/Groq (OpenAI-compatible), Gemini |
| AI parsing | pdfjs-dist (PDF), xlsx (Excel), parser kustom |
| Deploy | Vercel (static + 1 serverless function `api/[...path].js`) |
| **Target produksi** | **Electron + better-sqlite3** — React ~90% reuse, API key di main process, data di 1 file `.db` + folder foto (lihat `docs/elektron/`) |

### 3.2 Alur Data Utama (ringkas — detail di diagram drawio)

**A. Input data (upload Excel Dapodik/ARKAS)**
```
User → halaman (DataGuru/BKU) → parser (guruTendikParser/bkuParser)
     → storageHelper.set('spj_*') → localStorage → re-render UI
```

**B. Ask AI (dual-path — ini desain terbaik aplikasi)**
```
User → AskAIPanel → AIContext.sendMessage → aiHelper.askAIStream
  ├─ 1. semanticCache.get → hit? stream balik (0 token)
  ├─ 2. intentClassifier (AI decide) → query | chat
  │     ├─ PATH A (query): queryEngine.executeQuery(localStorage) → format → jawab
  │     └─ PATH B (chat):  dataContextBuilder(localStorage) → callAI → jawab
  ├─ 3. callAI → aiConfig.getProviderUrl → fetch → (dev: Vite proxy / prod: direct URL) → provider
  ├─ 4. fallback lokal (fallbackLocalAnswer, 0 token) jika AI gagal
  └─ 5. semanticCache.set
```

**C. Generate foto dokumentasi**
```
DokumentasiAIPage → imageGenerator.generateDocumentationImage
     → fetch fal.run (Flux Pro) / Gemini → hasil disimpan (base64 di localStorage)
```

**D. Template surat**
```
TemplateSuratPage → pilih template → isi data → TemplateEngine render
     → DokumenFormPreview (A4) → cetak/print / export .docx (docHelper)
```

---

## 4. Klasifikasi Level Arsitektur

| Level | Cocok? |
|---|---|
| Monolith | ✅ Ya — ini **client-side monolith** (semua logic dalam 1 aplikasi browser) |
| Layered | ✅ Ada — 5 lapisan internal yang jelas (UI → Domain → Data → External) |
| Component-based | ✅ Ya — UI dipecah komponen React + Context untuk shared state |
| Microservices | ❌ Tidak relevan saat ini (tidak ada service terpisah) |

### Verdict: **Client-side monolith dengan pola layered internal** (component-based UI)

**Apakah sudah tepat?**
- ✅ **Tepat untuk fase sekarang** (prototype/single-user): biaya server Rp 0, deploy
  statis di Vercel, fitur lengkap, cepat diiterasi.
- ✅ **Siap untuk deployment 600 sekolah setelah migrasi Electron + SQLite** (1 PC per
  sekolah, data lokal); kesenjangan tinggal kolaborasi lintas perangkat / sinkronisasi
  (lihat bagian 8 poin 1).

**Rekomendasi arsitektur produksi — KEPUTUSAN: Electron + SQLite** (lihat `docs/elektron/`):
```
Electron App (React SPA reuse ~90%)
├── Main process (Node) ── better-sqlite3 (data) + AI calls (API key AMAN di sini)
├── Renderer (React) ── UI + streaming chat via IPC
├── Storage ── 1 file `.db` per PC (< 1 MB) + folder foto sebagai file
└── AI Providers ── dipanggil dari main process; key tidak pernah masuk renderer
```
Aplikasi ini TIDAK butuh microservices — cukup **monolith desktop (Electron)** dengan
pola layered internal yang sudah ada. Alternatif lebih ringan (**Tauri v2**, 5–15 MB,
30–50 MB RAM) dipertimbangkan jika uji lapangan 50 sekolah menunjukkan masalah RAM —
kode React 100% portabel, migrasi tetap mudah.

---

## 5. Evaluasi Mental Model

### ✅ Separation of Concerns (satu komponen satu tugas)
| Area | Nilai | Catatan |
|---|---|---|
| UI (pages/components) | ⭐⭐⭐⭐⭐ | Pisah rapi per modul |
| AI layer | ⭐⭐⭐⭐⭐ | aiConfig / aiHelper / intentClassifier / queryEngine / dataContextBuilder terpisah jelas |
| Parser | ⭐⭐⭐⭐⭐ | 1 parser per format (bku, guru, sekolah) |
| **Storage access** | ⭐⭐ | **Duplikasi**: `storageHelper.js` + `storageGet()` di `aiHelper.js` (baris 511) + `storageGet()` di `intentClassifier.js` (baris 470) — 3 implementasi dengan `PREFIX = 'spj_'` digandakan |
| **aiConfig.js** | ⭐⭐ | Menjadi "god object": provider config + settings + prompts + URL resolver + headers — 5 tanggung jawab dalam 1 class |

### ✅ Single Source of Truth (data sama hanya di satu tempat)
| Area | Nilai | Catatan |
|---|---|---|
| Data aplikasi | ⭐⭐⭐⭐ | Hanya di localStorage (satu sumber) — bagus untuk aplikasi offline |
| Definisi sumber data | ⭐⭐ | `DATA_SOURCES` (queryEngine) vs `QUERY_KEYWORDS` (intentClassifier) vs `storageHelper.get` — definisi key `spj_*` tersebar & bisa tidak sinkron |
| Riwayat chat | ⭐⭐⭐ | Dobel (React state + localStorage) — wajar untuk persistensi |
| Nomor surat | ⭐⭐⭐ | Format & daftar nomor di localStorage + cache di helper |

### ✅ Abstraction (sembunyikan kompleksitas)
| Area | Nilai | Catatan |
|---|---|---|
| **Provider AI** | ⭐⭐⭐⭐⭐ | Ganti provider = edit 1 file (`aiConfig`), fallback otomatis antar provider — contoh terbaik |
| Parser format file | ⭐⭐⭐⭐ | UI tidak tahu detail format Excel |
| **Akses storage** | ⭐⭐ | Banyak halaman panggil `localStorage.getItem` LANGSUNG (BKUPage, PersonelFotoTab, DokumentasiAIGenerate) — melewati `storageHelper` |
| Template engine | ⭐⭐⭐⭐ | Blok dinamis (KopSurat, TabelDinamis, dll) diisolasi di `components/templates/blocks/` |

### ✅ Loose Coupling (keterikatan rendah antar modul)
| Area | Nilai | Catatan |
|---|---|---|
| AI ↔ UI | ⭐⭐⭐⭐⭐ | AIContext hanya memanggil `askAI/askAIStream` — tidak tahu detail provider |
| Parser ↔ Storage | ⭐⭐⭐⭐ | Parser mengembalikan objek, halaman yang menyimpan |
| **Halaman ↔ Storage** | ⭐⭐ | Halaman terikat langsung ke `localStorage` (tight coupling ke browser storage) |
| **AI ↔ data** | ⭐⭐⭐ | `dataContextBuilder` membaca SEMUA localStorage setiap request (bukan incremental) — coupling lebar |

**Skor mental model: SoC 3.8/5 · SSOT 3.3/5 · Abstraction 3.8/5 · Loose Coupling 3.5/5**

> Migrasi ke Electron + SQLite otomatis memperbaiki skor SSOT & Loose Coupling:
> semua akses data digantikan **satu lapisan data (better-sqlite3)** — menghilangkan
> duplikasi `storageGet()` di aiHelper/intentClassifier dan panggilan `localStorage`
> langsung dari halaman.

---

## 6. Yang Perlu Diperbaiki (prioritas)

### 🔴 KRITIS
1. **API key AI bocor ke bundle publik** — `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`,
   `VITE_GEMINI_API_KEY` dibaca di `aiConfig.js` dari `import.meta.env` → ikut ter-bundle.
   Siapa pun bisa ekstrak key & mencuri kuota/kuota berbayar.
   **Fix (web):** pindahkan key ke serverless function — frontend cukup kirim
   `{ provider, model, messages }` tanpa key. **Fix (Electron — direkomendasikan):**
   key hanya ada di main process; renderer meminta via IPC. **Ini keuntungan utama
   migrasi Electron**: API key aman selamanya tanpa butuh backend.

2. **Auth palsu** — `localStorage.setItem("spj_auth", "true")` di `LoginPage.jsx` dan
   `localStorage.getItem('spj_auth')` di `App.jsx`. Siapa pun bisa membuka DevTools dan
   set `spj_auth=true`. Tidak ada sesi, password, atau otorisasi per sekolah.

### 🟠 PENTING
3. **localStorage sebagai database** — batas ~5–10 MB/browser. `PersonelFotoTab` dan
   `DokumentasiAIGenerate` menyimpan **foto base64** di localStorage → akan cepat penuh
   dan aplikasi crash (quota exceeded). **Fix (web):** IndexedDB untuk file/foto.
   **Fix (Electron — direkomendasikan):** SQLite + foto sebagai file di folder
   `userData/fotos/`, DB hanya simpan path (RESEARCH_ELECTRON_SQLITE_BERAT.md §8).

4. **Risiko kehilangan data** — clear browser data / ganti perangkat = semua data hilang.
   Tidak ada backup, ekspor, atau migrasi. **Fix (Electron):** seluruh data di 1 file
   `.db` + folder foto → backup = copy file; otomatiskan backup berkala saat startup.

5. **Duplikasi storage access** — konsolidasi ke satu helper (`storageHelper`), hapus
   `storageGet()` di aiHelper & intentClassifier.

6. **Debug log di produksi** — `queryEngine.js` masih berisi blok `console.log('🔍 QueryEngine...')`
   dan `executeQuery` banyak log debug. Bersihkan sebelum rilis.

### 🟡 MINOR
7. **Tidak ada test otomatis** — hanya script ad-hoc (`test-bku-parser.js`,
   `test-bku-template.js`) yang harus dijalankan manual. Tidak ada unit test untuk
   parser/queryEngine (yang paling rawan regresi).
8. **Ketergantungan pada Puter.js** (GPT-4o gratis) — data keuangan sekolah dikirim ke
   server pihak ketiga tanpa jaminan privasi; kualitas/token dapat berubah sewaktu-waktu.
9. **`vite.config.js` proxy vs `api/[...path].js` duplikasi** — dua tempat mendefinisikan
   mapping provider (dev vs prod), berisiko tidak sinkron. **Lebih parah: di production
   frontend TIDAK PERNAH memanggil `/api/*`** — `getProviderUrl()` mengembalikan URL
   langsung ke provider, sehingga serverless function **sepenuhnya dilewati (dead code
   di production)**. **Catatan (Electron):** dengan API key pindah ke main process,
   masalah ini otomatis hilang — `api/[...path].js` hanya relevan untuk versi web demo/MVP.

---

## 7. Optimasi yang Disarankan

| # | Optimasi | Dampak |
|---|---|---|
| 1 | **Lazy loading route** (`React.lazy` + `Suspense`) — 16 halaman saat ini jadi 1 bundle | Load awal jauh lebih cepat |
| 2 | **SQLite (Electron)** — ganti `storageHelper` dengan lapisan better-sqlite3; foto sebagai file | Hapus risiko quota, backup 1 file, SSOT data |
| 3 | **Konsolidasi storage** ke satu helper + satu file konstanta key | SSOT, mudah migrasi |
| 4 | **Hapus console.log debug** | Output bersih, lebih ringan |
| 5 | **Semantic cache: invalidasi otomatis** — `clearCache()` saat ini **tidak pernah dipanggil** di mana pun; panggil setelah mutasi data (BKU/notes) | Jawaban tidak basi |
| 6 | **Reuse `dataContextBuilder`** untuk query path juga (hindari 2 jalur baca data) | Hemat maintenance |
| 7 | ~~PWA + Service Worker~~ → **digantikan Electron** (offline penuh + installer exe) | Offline-first + distribusi exe ke sekolah |
| 8 | **CI: unit test parser + queryEngine** (Vitest) di pipeline | Cegah regresi di logika paling rawan |
| 9 | **Pindahkan `kodeReferensi` fetch ke proxy sendiri** (hindari allorigins pihak ketiga) | Lebih andal & cepat |
| 10 | **Lazy-load `xlsx`** — dynamic import di `bkuParser.js`/`guruTendikParser.js`/`sekolahParser.js` (terbukti masih import statis) | Hemat ~800 KB bundle awal, startup lebih cepat |

---

## 8. Potensi Masalah di Masa Depan

1. **Skala 600 sekolah** — Electron + SQLite menyelesaikan penyimpanan per sekolah
   (1 file `.db` per PC), **tapi belum menyelesaikan kolaborasi lintas perangkat**
   (backup pusat / sinkronisasi antar operator tetap butuh backend jika diinginkan).
   Untuk tahap awal: distribusi installer + backup file cukup.
2. **Biaya AI tak terkendali** jika API key dicuri (lihat §6.1) atau provider gratis
   berubah menjadi berbayar (Puter/Gemini free tier).
3. **Reproduktifitas dokumen resmi** — cetak/preview A4 via browser bergantung pada
   browser & printer user. Untuk dokumen yang harus dikirim ke dinas, lebih aman
   generate PDF/docx deterministik server-side.
4. **Rantai data manual** (ARKAS SQLite → export Excel → upload → parse) rawan error
   format; perubahan format ARKAS bisa memutus parser.
5. ~~Dua arah pengembangan~~ — **KEPUTUSAN DIAMBIL: Electron + SQLite** (lihat
   `docs/elektron/`). Arahkan seluruh pengembangan ke jalur ini agar tidak membangun
   dua basis kode; versi web Vercel dipertahankan sebagai demo/MVP.
6. **Tidak ada versioning skema data** — jika struktur objek di localStorage berubah,
   data lama user akan corrupt tanpa migrasi.

---

## 9. Roadmap Rekomendasi

| Fase | Langkah | Sasaran |
|---|---|---|
| **Fase 1 — Hardening (1–2 minggu)** | Konsolidasi storage, hapus debug log, unit test parser, lazy-load `xlsx` | Stabil sebelum migrasi |
| **Fase 2 — Migrasi Electron + SQLite (12–16 hari, `PRD_ELEKTRON_SQLITE.md`)** | Electron shell + better-sqlite3 + lapisan data baru; API key ke main process; foto sebagai file | Desktop exe, data aman, offline penuh |
| **Fase 3 — Uji lapangan & distribusi (2–4 minggu)** | Installer NSIS + ASAR + code signing; backup `.db` otomatis; uji 50 sekolah PC low-end (4 GB) | Siap distribusi massal; evaluasi Tauri jika RAM bermasalah |
| **Fase 4 — Dokumen & sinkronisasi (opsional)** | PDF/docx deterministik; backup pusat / sinkronisasi antar operator jika dibutuhkan | Dokumen siap kirim, data tidak hilang |

---

## 10. Referensi File Kunci

| File | Peran |
|---|---|
| `spj-frontend/src/App.jsx` | Routing & protected routes |
| `spj-frontend/src/utils/aiConfig.js` | Konfigurasi provider AI (god object ⚠️) |
| `spj-frontend/src/utils/aiHelper.js` | Orchestrator AI (dual-path, streaming, fallback) |
| `spj-frontend/src/utils/intentClassifier.js` | Klasifikasi intent (AI + rules fallback) |
| `spj-frontend/src/utils/queryEngine.js` | Eksekusi query JSON ke localStorage |
| `spj-frontend/src/utils/dataContextBuilder.js` | Bangun konteks data untuk AI |
| `spj-frontend/src/utils/storageHelper.js` | Akses localStorage (SSOT akses data) |
| `spj-frontend/src/contexts/AIContext.jsx` | State chat + streaming |
| `spj-frontend/api/[...path].js` | Vercel serverless AI proxy |
| `spj-frontend/src/utils/bkuParser.js` | Parser Excel ARKAS → BKU |
| `docs/Skema_Aplikasi_SPJ.md` | Skema domain aplikasi |
| `docs/elektron/RESEARCH_ELECTRON_SQLITE_BERAT.md` | Riset: apakah Electron + SQLite membuat aplikasi berat |
| `docs/elektron/PRD_ELEKTRON_SQLITE.md` | PRD migrasi Electron + SQLite |
| `docs/elektron/ROADMAP_ELEKTRON_SQLITE.md` | Roadmap implementasi |

---

*Diagram: `docs/ALUR_DATA_SPJ.drawio` (buka dengan draw.io desktop atau diagrams.net)*
