# BLUEPRINT — Sprint 015: Import BKU PDF (OCR)

> Format: Bab 8.4 Dokumen 2 (MATERI 08-Workflow-Lengkap-6-Tahap.md).
> Sumber: REQUIREMENTS.MD + tech stack D1–D6 (disetujui) + DATA-MODEL.md
> (E1–E4) + MODULE-PLAN.md (M0–M5). Karena repo belum punya lint/typecheck
> (tidak ada CONSTRAINTS.md dan tidak ada script lint di package.json),
> DoD per task memakai sensor proyek yang ada: `npm run build` exit 0,
> oracle node `test-*.mjs`, dan grep gate — sesuai pola sprint sebelumnya.
>
> **REVISI 2026-10-19 v2 (hasil review pack + verifikasi langsung ke repo)**
> 13 cacat dikoreksi; isi/target/lingkup **tidak berubah**. Yang berubah hanya
> preskripsi yang terbukti salah atau tidak bisa dijalankan:
> - **D1** task 1.3: `detectTransactionType`/`detectKategoriBelanja` **TIDAK
>   terekspor** (`bkuParser.js:156,217` — `function` polos) → import mustahil,
>   menambah `export` = diff ke file TABU. Diganti **`redetectTypes()`**
>   (`:654`, sudah export) — 0 diff, 0 salin.
> - **D2** `scratch-pdf-check/` **sudah dihapus** (reset sprint-013) → task 0.1 +
>   bootstrap HANDOFF_points ke file yang tidak ada.
> - **D3** `src/components/pencatatan/` **tidak ada** → dipakai `components/bku/`.
> - **D4** semua perintah gate ditulis ulang ke **PowerShell 5.1 + `rg`**;
>   `bash` TIDAK ada di PATH mesin ini (`grep`/`wc`/`tail` tak bisa dipakai).
>   Exit-code build juga diperbaiki (versi lama `…| tail; echo $?` **selalu 0**).
> - **D5** "T-21" (ID task MODULE-PLAN) dibedakan dari T-01..T-16 (ID test).
> - **D6** TransactionRow = **17 field**, bukan 16 (hitung ulang dari
>   `bkuParser.js:346-366`).
> - **D7** total task **21** (bukan 17) ≈ **7,75 jam** (bukan 5,5).
> - **D8** paragraf aturan engine terduplikasi → dipangkas 1×.
> - **D9** path oracle dipin ke `spj-frontend/` (butuh `xlsx`).
> - **D10** G-4 menambah `package.json` + `package-lock.json` ke allowlist.
> - **D11** task 0.1 Estimasi 5m → 45m (menunggu OCR 21 halaman).
> - **D12** quickstart kontrak runner (halaman PDF + item golden).
> - **D13** versi runtime gate dicatat (Node v24.19.0 / npm 11.17.0).
- **D14** G-3 `localStorage\.(get|set)` **gagal total** — cocok dengan
>   `getItem`/`setItem`; baseline **24 hit / 12 file** (pola longgar
>   `localStorage\.` = 34/16), semuanya sudah di `main`. Diubah jadi
>   delta-vs-`main` + 0-hit wajib di 4 file baru sprint ini.
> - **D15** T-07 "Jan..Des" tidak mungkin — **Excel hanya Jan–Jun 2026**
>   (300 baris). Target keras hanya Januari.
> - **D16** indeks kolom oracle: pakai `DATA_COLUMNS` `bkuParser.js:39-48`
>   (SALDO = **19**, PENERIMAAN = 13, PENGELUARAN = 16). Tebakan indeks
>   "bolt" menghasilkan 0/0/0 yang palsu.

## Arsitektur Sistem

```
┌────────────────────── BROWSER (Edge/Chrome desktop) ──────────────────────┐
│ BKUUploadPdf.jsx : Upload → pilih bulan → preview+badge → koreksi inline  │
│        │           → dialog konfirmasi → Simpan                          │
│        ▼                                                                 │
│ bkuPdfPages.js (pdfjs-dist pinned) → canvas + flag text-layer per halaman│
│        │                                                                 │
│        ├── text-layer > ambang ──▶ parse langsung (tanpa OCR, bonus)     │
│        ▼                                                                 │
│ bkuPdfOcr.js ▶ engine: paddleocr-js ATAU tesseract.js (A/B = task 2.2)        │
│        ▼                                                                 │
│ bkuPdfParser.js : items → TransactionRow (import detect* dari bkuParser) │
│        ▼                                                                 │
│ reconcile() → preview state → KONFIRMASI → storageHelper.set('bku_data') │
└────────────────────────────── localStorage (spj_) ────────────────────────┘
```

## Tech Stack (D1–D6 — TIDAK diubah ulang)

| Lapisan | Pilihan | Status |
|---|---|---|
| Framework | React 18 + Vite 5 + Tailwind (existing) | frozen |
| Render PDF | pdfjs-dist (existing) | frozen |
| Persister | storageHelper / localStorage `spj_` | frozen |
| OCR | **pemenang A/B terukur (task 2.2)** dari 2 kandidat pinned | keputusan berangka |
| Parser layout | kustom (tanpa library) | baru |
| Tooling fixture | Python RapidOCR — dev-only, tidak terkirim | dev |

## Dependensi (versi eksak — dilarang `^`)

| Paket | Versi pin | Keterangan |
|---|---|---|
| `pdfjs-dist` | 4.10.38 | terpasang (existing), tidak berubah |
| `xlsx` | 0.18.5 | existing, jalur Excel — tidak disentuh |
| `react` / `react-dom` | 18.3.1 | existing |
| `@paddleocr/paddleocr-js` | 0.4.2 | **KANDIDAT A/B** — terpasang hanya bila menang task 2.2 |
| `tesseract.js` | 7.0.0 | **KANDIDAT A/B** — pin eksak terverifikasi npm 2026-10-19; dilepas bila kalah |
| Python dev: `rapidocr-onnxruntime` | 1.2.3 | **terverifikasi terpasang** (`import rapidocr_onnxruntime` OK, Python 3.14) — dev-only, TIDAK masuk package.json |

Aturan (satu kalimat, tanpa pengulangan): HANYA SATU engine tetap di
`package.json` setelah A/B; engine yang kalah di-`npm uninstall` dan `rg`
memastikan 0 sisa referensinya. Sesuai keputusan D8 (dependensi baru wajib
ADR + pin eksak).

## File yang Akan Dibuat / Diubah

| # | File | Aksi | Baris target |
|---|---|---|---|
| 1 | `src/utils/bkuPdfPages.js` | BARU — render + text-layer flag + rotasi + progress + abort | ≤200 |
| 2 | `src/utils/bkuPdfOcr.js` | BARU — interface adapter + 2 engine (lazy load) | ≤200 |
| 3 | `src/utils/bkuPdfParser.js` | BARU — items → TransactionRow + reconcile + problems | ≤200 |
| 4 | `src/components/bku/BKUUploadPdf.jsx` | BARU — UI preview + koreksi + dialog konfirmasi commit | ≤300 |
| 5 | `src/pages/dashboard/BKUPage.jsx` | UBAH — tombol Upload PDF + state minimal (diff KECIL) | +15 |
| 6 | `public/models/` | BARU (kondisional) — model .onnx bila paddleocr-js menang | assets |
| 7 | `spj-frontend/test-bku-pdf-parse.mjs` | BARU — oracle node vs Excel (wajib di `spj-frontend/` agar `xlsx` resolve) | dev |
| 8 | `scratch-pdf-check/gen_fixture_rest.py` | **BARU (ditulis ulang)** — DIHAPUS saat reset sprint-013 | dev |
| 9 | `vite.config.js` | UBAH (kondisional) — COOP/COEP bila paddleocr-js menang | +10 |
| 10 | `bkuParser.js` | **TABU — WAJIB 0 diff** | 0 |

> ⚠️ **Path relatif ada relatif `spj-frontend/`.** Repo `src/components/`
> hanya punya `bku/ · dokumentasi/ · guide/ · layout/ · templates/ · ui/` —
> **tidak ada `pencatatan/`** (koreksi D3). Sibling `BKUSidebar.jsx` sudah ada
> di `components/bku/`, jadi komponen baru placed di sana.
>
> ⚠️ **Oracle WAJIB di `spj-frontend/`** (koreksi D3→D9): `xlsx` adalah
> dependency `spj-frontend`, dan `node` merezolusi `node_modules` dari lokasi
> file. Precedent: `test-pajak-barisa.mjs`, `test-kas-*.mjs` semuanya di sana.

## Rencana Implementasi (task 2–5 menit per unit; DoD pasted sebagai bukti)

> **Sensor standar (SB) — PowerShell 5.1, JANGAN pakai bash:**
> ```powershell
> Push-Location spj-frontend
> npm run build; $sb = $LASTEXITCODE
> Pop-Location
> Write-Output "BUILD_EXIT=$sb"     # harus BUILD_EXIT=0
> ```
> ⚠️ **Kenapa tidak pakai `$?` seperti di bash.** Bentuk bash
> `npm run build | tail -3; echo $?` **hijau palsu**: `$?` di bash =
> exit code elemen terakhir pipeline (`tail`) → selalu 0.
> Di **PowerShell** aturan ini berbeda: `$LASTEXITCODE` menyimpan exit code
> **native command terakhir di pipeline** (cmdlet diakhiri tidak mengubahnya),
> jadi bentuk ber-pipe pun aman. Tetap dipakai bentuk **tanpa pipe** karena
> eksplisit dan tidak bergantung pada aturan tersebut.
> **Bukti capture benar (2026-10-19):** kontrol negatif
> `node -e "process.exit(7)"` → `$LASTEXITCODE = 7` (bukan 0).
> Gate tambahan spesifik diberi kode G-xx (bagian bawah dokumen ini).

### Fase 0 — Fondasi (fixture + render)
- **0.1** **Tulis ulang** generator fixture
  `scratch-pdf-check/gen_fixture_rest.py`. ⚠️ File ini **DIPERLUKAN tapi
  TIDAK ADA** — dihapus saat reset sprint-013 (`STATE.MD`: "`scratch-pdf-check/`
  … terhapus bersama reset"). Preset: Python 3.14 + `rapidocr_onnxruntime`
  **1.2.3 sudah terpasang & import_OK**; pdf → gambar via pypdfium2/PyMuPDF
  (jika belum ada, `pip install` dicatat sebagai langkah eksplisit, bukan
  diasumsikan). Output: `scratch-pdf-check/fixture.json` berisi item
  `{str,x,y,w,h,page}` untuk **21/21 halaman**, resumable (sisa halaman
  dilanjutkan, tidak mengulang). ⚠️ Yang **belum** terverifikasi = renderer
  PDF→gambar (pypdfium2/PyMuPDF) — cek `pip show` dulu; kalau kosong, `pip
  install` dicatat sebagai langkah eksplisit, jangan diasumsikan.
  DoD: `node -e` pencacah fixture
  = 21 halaman; total item > 0; skeptrum 3 halaman pertama dicetak.
  | Est 45m (menunggu OCR 21 halaman — bukan 5m).
  DSA: proses generate fixture = tool build-time — bukan hot path.
- **0.2** Tulis oracle `spj-frontend/test-bku-pdf-parse.mjs` (baca Excel
  Januari via `xlsx` + `fixture.json`): hitung jumlah baris/masuk/keluar/
  saldo Januari, tampilkan target.
  ⚠️ **Jangan menebak indeks kolom** — pakai peta resmi
  `DATA_COLUMNS` `bkuParser.js:39-48`: TANGGAL 0 · KODE_KEGIATAN 3 ·
  KODE_REKENING 5 · NO_BUKTI 8 · URAIAN 10 · PENERIMAAN 13 · PENGELUARAN 16 ·
  SALDO **19**. Header di baris 14 (0-indexed), data mulai baris **15**.
  (Tebakan indeks "bolak-balik" menghasilkan 0/0/0 palsu — sudah terjadi
  saat verifikasi pack ini, koreksi D16.)
  **Angka acuan Jan 2026 sudah terukur** (lihat `ACCEPTANCE` T-07):
  5 baris · masuk Rp 82.560.000 · keluar Rp 0 · saldo akhir Rp 82.560.000.
  DoD: `node test-bku-pdf-parse.mjs` (cwd `spj-frontend`) mencetak 4 angka
  tsb dan **cocok** dengan tabel. | Est 5m
- **0.3** File `bkuPdfPages.js` + tanda text-layer + rotasi + `onProgress`
  + AbortController. DoD: SB; `node -e` import module (definisi export
  ada). | Est 25m
- **0.4** SB + smoke render di browser (dev server `/dashboard/bku`):
  21 canvas ter-render, batal di tengah = tidak ada perubahan storage.
  DoD: SB + `BUILD_EXIT=0` + catat screenshot path. | Est 15m

### Fase 1 — Parser (murni dari fixture, tanpa OCR hidup)
- **1.1** `bkuPdfParser.js`: grouping baris per-y + koreksi baris
  terpotong antar-halaman. | Est 30m
- **1.2** Pemetaan kolom per-x (anchor header tabel per halaman) +
  format angka Indonesia. | Est 30m
- **1.3** `TransactionRow` builder — **REUSE DETEKSI TIPE/KATEGORI TANPA
  MENYENTUH `bkuParser.js`.**
  ⚠️ **Koreksi D1 (blocker, sudah diverifikasi ke source):**
  `detectTransactionType` (`bkuParser.js:156`) dan `detectKategoriBelanja`
  (`:217`) **TIDAK punya kata kunci `export`** — keduanya `function` biasa di
  level modul. **Tidak mungkin di-`import`.** Menambahkan `export` berarti
  MENGUBA `bkuParser.js`, yang melanggar G-1 **dan** baris #10 pack ini
  ("TABU — WAJIB 0 diff"). Preskripsi versi lama ("IMPORT EXPLICIT") adalah
  **tidak bisa dijalankan**.
  **Jalur sah yang tersedia — `redetectTypes()` (`bkuParser.js:654`, sudah
  `export`):**
  ```js
  import { redetectTypes } from '../utils/bkuParser.js'
  // bangun baris dengan 15 field (tanpa tipe/kategori), lalu:
  const typed = redetectTypes(rows)   // isi tipe + kategori via logika internal yg sama
  ```
  `redetectTypes` memanggil **fungsi internal yang persis sama** dan
  mengembalikan `{...tx, tipe, kategori}` → hasil identik jalur Excel,
  **0 diff ke `bkuParser.js`, 0 salin-manual logika**.
  Precedent pemakaian: `BKUPage.jsx:6` (import) + `:152` (pemakaian).
  DoD G-1: `rg -n "redetectTypes" src/utils/bkuPdfParser.js` → **≥1 hit**, DAN
  `git diff --stat -- src/utils/bkuParser.js` → **kosong**. | Est 20m
- **1.4** `reconcile()` jaring pengaman + detector `problems[]`
  (uraian_kosong, angka_gagal_parse, kolom_geser, saldo_tak_runtun). | Est 20m
- **1.5** Oracle PDF: `node test-bku-pdf-parse.mjs --pdf` (cwd `spj-frontend`)
  → **0 selisih vs Januari Excel** + akurasi uraian ≥ 90%. | Est 30m
  **DSA: cluster baris per y → sort O(n log n) + pemetaan kolom O(k)
  per baris — hot path parser: ±421 baris × ±20 sel; sort dipilih agar
  lookup header per halaman O(1).**
- **1.6** SB + oracle rerun + gate reuse (G-1). | Est 5m

### Fase 2 — A/B Gate + kompleksitas engine
- **2.1** Adapter interface: `ocrPage(canvas) → items[]` + lazy `import()`
  untuk kedua engine (pin 0.4.2 / 7.0.0). | Est 20m
- **2.2** **A/B terukur** di browser dev: fixture hal 1–4 lalu seluruh 21; di
  masing-masing: akurasi uraian, sel-golden, waktu. DoD: tabel akurasi
  2 baris di-paste di ADR; pemenang dipilih berangka.
  ⚠️ Koreksi D5: task ini = **T-21 di MODULE-PLAN M2** — BUKAN test ID
  `T-21` di ACCEPTANCE (test ID sprint ini hanya **T-01..T-16**).
  | Est 40m
- **2.3** Keputusan: uninstall engine yang kalah; ADR di `DECISIONS.MD`
  (nama pemenang + tabel akurasi + alasan); amend BLUEPRINT bila perlu
  (kondisional di task 2.4 menjadi non-kondisional). | Est 10m
- **2.4** Kondisional bila paddleocr-js menang: `public/models/`
  model self-host + COOP/COEP di `vite.config.js`. Bila tesseract menang:
  langsung lanjut. DoD: SB (`BUILD_EXIT=0`) + dev server hidup + smoke
  page muat. | Est 30m

### Fase 3 — UI preview + commit
- **3.1** `BKUUploadPdf.jsx` kerangka: file input + pilih bulan +
  state `PreviewRow[]`. | Est 40m
- **3.2** Tabel preview + tanda bermasalah + koreksi inline + hapus
  baris + compute live. | Est 40m
- **3.3** Dialog konfirmasi + tulis atomik `Q4 DATA-MODEL` (replace-by-
  month, recompute summary, `uploadedAt`) + fallback jujur "gunakan
  Excel". | Est 25m
  **DSA: tulis atomik = satu `storageHelper.set` — O(1) JSON serial
  dari wrapper statt N set per-baris (alasan: localStorage kalah ke
  partial write yang bisa re-cast data lama).**
- **3.4** Integrasikan `BKUPage.jsx`: tombol Upload PDF + state default
  bulan terakhir; print gate. | Est 20m
- **3.5** Gate UI: US-1..US-5 + US-6/10 (node/browser) klik manual + T-02
  15-pola = 0 hit (G-2) + storage hanya `spj_` (G-3). | Est 25m

### Fase 4 — Gate akhir
- **4.1** Gate: T-02 15-pola 0-hit + G-1 + G-3 + `bkuParser.js` 0 diff
  (G-4 `git diff --stat`) + SB (`BUILD_EXIT=0`) + oracle full. | Est 20m
- **4.2** Pembaruan status di STATE.MD + checklist ACCEPTANCE.MD universals
  → /acceptance-runner konteks segar. | Est 10m

**Total: 21 task** (Fase 0 = 4 · Fase 1 = 6 · Fase 2 = 4 · Fase 3 = 5 ·
Fase 4 = 2) — Σ estimasi **465 menit ≈ 7,75 jam** coding, ±50% buffer uji.
> Koreksi D7: versi lama menulis "17 satuan ≈ 5,5 jam" — keduanya salah hitung
> (dihitung ulang dari daftar task di atas).

## Definisi Gate (perintah eksak + harapan output — PowerShell 5.1)

> ⚠️ Semua perintah di bawah sudah **diverifikasi jalan di mesin ini**:
> `bash` TIDAK ada di PATH; `rg` (ripgrep) tersedia; `git`, `node`, `npm` ada.
> Jalankan dari root repo `D:\project\spj-app` kecuali disebut lain.

- **G-1** — `bkuParser.js` 0 diff (TABU):
  ```powershell
  git diff --stat -- spj-frontend/src/utils/bkuParser.js
  ```
  → **output kosong**. Pairing (terbukti `redetectTypes` dipakai, bukan disalin):
  ```powershell
  rg -n "redetectTypes" spj-frontend/src/utils/bkuPdfParser.js   # → ≥1 hit
  ```
- **G-2** — T-02 anti-hardcode 15 pola → 0 hit. **Perintah lengkap ada di
  `ACCEPTANCE.MD` §T-02** (15 pola dituliskan, boleh diekstrak programatik —
  jangan diketik ulang).
- **G-3** — storage hanya via `storageHelper`.
  ⚠️ **Koreksi D14 (terbukti saat verifikasi):** pola lama
  `localStorage\.(get|set)` juga cocok dengan `getItem`/`setItem`, dan repo
  sudah punya **24 hit di 12 file** (storageHelper sendiri, mockData, App.jsx,
  LoginPage, NomorSuratPage, PersonelFotoTab, …). Pola longgar `localStorage\.`
  = **34 hit / 16 file**. Semuanya sudah ada di `main` (terverifikasi identik).
  Gate "0 hit total" **tidak mungkin reached** tanpa menyentuh file di luar
  cakupan. **Aturan yang benar — delta vs `main`:**
  ```powershell
  git diff main -- spj-frontend/src | rg -n "localStorage\."   # → 0 hit WAJIB
  ```
  Dan file baru sprint ini **wajib** 0 akses `localStorage` langsung:
  ```powershell
  rg -n "localStorage\." spj-frontend/src/utils/bkuPdfPages.js spj-frontend/src/utils/bkuPdfOcr.js spj-frontend/src/utils/bkuPdfParser.js spj-frontend/src/components/bku/BKUUploadPdf.jsx   # → 0 hit
  ```
  Semua baca/tulis storage **wajib lewat `storageHelper`** (`spj_` prefix
  otomatis — lihat `storageHelper.js:6` yang sudah meng-prefix `PREFIX`).
- **G-4** — `git diff --stat main` → **hanya file ini**:
  | Boleh berubah | Alasan |
  |---|---|
  | `bkuPdfPages.js`, `bkuPdfOcr.js`, `bkuPdfParser.js` | BARU (blueprint #1–3) |
  | `components/bku/BKUUploadPdf.jsx` | BARU (blueprint #4) |
  | `pages/dashboard/BKUPage.jsx` | UBAH diff kecil (blueprint #5) |
  | `package.json` + `package-lock.json` | **WAJIB berubah** — A/B engine (koreksi D10) |
  | `vite.config.js` | kondisional COOP/COEP (blueprint #9) |
  | `public/models/` | kondisional (blueprint #6) |

  Setiap file lain yang muncul = **regresi di luar cakupan** (dilarang,
  lihat HANDOFF §JANGAN). File dev `scratch-pdf-check/` + `test-*.mjs`
  **tidak** masuk `git diff main` bila sudah di-`.gitignore`.
