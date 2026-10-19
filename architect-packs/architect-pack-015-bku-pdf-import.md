# ARCHITECT PACK — Sprint 015: Import BKU PDF (OCR)
> Salinan audit trail (Bab 8.5) — 4 dokumen, disusun & diverifikasi 2026-10-19.

## Cross-Artifact Consistency Check (2026-10-19)
- [x] Setiap item REQUIREMENTS muncul di BLUEPRINT (alur upload→preview→koreksi→konfirmasi → task 3.1–3.4; oracle Januari → task 0.2/1.5, T-03..T-05; A/B engine → task 2.2, T-15)
- [x] Setiap task BLUEPRINT punya DoD command/output (SB exit 0 / node oracle / grep G-1..G-4)
- [x] Task hot-path punya DSA line: task 1.5 (sort O(n log n) + pemetaan O(k)) dan task 3.3 (tulis atomik O(1)); task 0.1 dicatat non-hot-path
- [x] Kriteria ACCEPTANCE tidak menuntut fitur di luar BLUEPRINT (fast-path T-14 sesuai kondisional §file; fallback T-13 sesuai task 3.3)
- [x] HANDOFF-PROMPT memuat bootstrap block (npm install + build sanity + dev server + path file uji)
- [x] Dependensi BLUEPRINT == keputusan advisor: paddleocr-js 0.4.2 · tesseract.js 7.0.0 (kandidat A/B, satu dilepas) · pdfjs-dist 4.10.38 · xlsx 0.18.5 · rapidocr 1.2.3 dev-only — semua versi terverifikasi npm/package.json 2026-10-19
- [x] Satu sprint satu goal (pintu masuk PDF identik) — A/B adalah gate di dalam sprint, bukan goal kedua


==================== 1. REQUIREMENTS.MD ====================
# REQUIREMENTS — Sprint 015: Import BKU PDF (OCR) — Pintu Masuk Alternatif Identik dengan Excel

> Status: Pack DISUSUN 2026-10-19 dari bahan yang sudah disetujui user:
> PRD (10 US) · tech stack D1–D6 · DATA-MODEL E1–E4 · MODULE-PLAN M0–M5.
> Format mengikuti Bab 8.4 Dokumen 1 (MATERI 08-Workflow-Lengkap-6-Tahap.md):
> apa & mengapa saja — TANPA detail implementasi.

## Tujuan Sprint
Satu goal: memberi pintu masuk import BKU kedua dari **PDF hasil scan**
yang hasilnya **identik** dengan jalur import Excel yang sudah berjalan.

## Apa yang Dibangun
- Tombol "Upload PDF" di halaman BKU, di sebelah jalur Excel yang ada
- Alur: pilih file PDF → pilih bulan (persis alur Excel) → proses
  (progres per halaman) → tabel preview hasil → koreksi inline baris
  bermasalah → dialog konfirmasi → data masuk `spj_bku_data`
- Hanya baris bulan terpilih yang menggantikan transaksi bulan itu;
  sisa data (hasil Excel, meta lain) tidak tersentuh

## Mengapa
- BKU terpecah dua format sumber: Excel yang bisa di-import (terbukti
  akurat) dan PDF hasil scan yang sama sekali tidak bisa dibaca aplikasi
  (terverifikasi: file contoh 21 halaman tanpa text layer sama sekali)
- Hari ini PDF berarti ketik ulang manual ±421 transaksi/tahun, rawan salah

## Pengguna
- Primary: Bendahara SPJ SD (1 user, aplikasi desktop Edge/Chrome,
  sudah terbiasa alur import Excel → pilih bulan)
- Secondary: Penyuluh/operator yang menyalin PDF BKU dari aplikasi RKAS

## Data Sumber
- `template/contoh format BKU-PDF tahunan.pdf` — 21 halaman A4 hasil
  scan, tanpa text layer (terverifikasi), contoh file aktual
- `template-data/Realisasi Sekolah Buku Kas Umum (BKU) ... 2026.xlsx` —
  baseline pembanding sebagai angka kebenaran (oracle)
- Simpan: `spj_bku_data` (localStorage, prefix `spj_`) — bentuk baris
  SAMA PERSIS hasil jalur Excel

## Output yang Diharapkan
- Import Januari dari PDF contoh menghasilkan data IDENTIK dengan
  import Excel Januari: jumlah transaksi, total Masuk/Keluar, dan
  saldo akhir — 0 selisih
- Akurasi uraian OCR ≥ 90% di halaman contoh (terukur via script
  oracle, bukan perkiraan)
- Baris bermasalah bisa dikoreksi sampai bersih sebelum disimpan
- Keputusan engine OCR berangka: dua kandidat diuji, yang menang
  terukur dipilih, hasilnya dicatat di ADR

## Batasan (dari keputusan user + aturan proyek)
- Jalur import Excel STERIL: `bkuParser.js` wajib 0 diff
- Tanpa backend; semua proses di perangkat; tidak ada file yang
  dikirim ke layanan mana pun
- Stack existing frozen (React/Vite/Tailwind/xlsx tanpa upgrade)
- Dependency baru HANYA engine OCR pemenang A/B — wajib pin versi
  + catat ADR sebelum dipasang permanen
- Bila kedua engine tidak mencapai target akurasi → sprint pause,
  keputusan dikembalikan ke user (preseden sprint-013)

==================== 2. BLUEPRINT.MD ====================
# BLUEPRINT — Sprint 015: Import BKU PDF (OCR)

> Format: Bab 8.4 Dokumen 2 (MATERI 08-Workflow-Lengkap-6-Tahap.md).
> Sumber: REQUIREMENTS.MD + tech stack D1–D6 (disetujui) + DATA-MODEL.md
> (E1–E4) + MODULE-PLAN.md (M0–M5). Karena repo belum punya lint/typecheck
> (tidak ada CONSTRAINTS.md dan tidak ada script lint di package.json),
> DoD per task memakai sensor proyek yang ada: `npm run build` exit 0,
> oracle node `test-*.mjs`, dan grep gate — sesuai pola sprint sebelumnya.

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
│ bkuPdfOcr.js ▶ engine: paddleocr-js ATAU tesseract.js (A/B T-21)         │
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
| `@paddleocr/paddleocr-js` | 0.4.2 | **KANDIDAT A/B** — terpasang hanya bila menang T-21 |
| `tesseract.js` | 7.0.0 | **KANDIDAT A/B** — pin eksak terverifikasi npm 2026-10-19; dilepas bila kalah |
| Python dev: `rapidocr-onnxruntime` | 1.2.3 | sudah terpasang — dev-only, TIDAK masuk package.json |

Aturan: HANYA SATU engine tetap di package.json setelah A/B; kalah
dilepas (npm uninstall) dan grep memastikan 0 sisa referensinya.
Sesuai keputusan D8 (keputusan dependensi baru wajib ADR + pin):
hanya SATU engine tetap di package.json setelah A/B; engine yang kalah
harus dilepas + grep memastikan tidak ada referensi yang tersisa.

## File yang Akan Dibuat / Diubah

| # | File | Aksi | Baris target |
|---|---|---|---|
| 1 | `src/utils/bkuPdfPages.js` | BARU — render + text-layer flag + rotasi + progress + abort | ≤200 |
| 2 | `src/utils/bkuPdfOcr.js` | BARU — interface adapter + 2 engine (lazy load) | ≤200 |
| 3 | `src/utils/bkuPdfParser.js` | BARU — items → TransactionRow + reconcile + problems | ≤200 |
| 4 | `src/components/pencatatan/BKUUploadPdf.jsx` | BARU — UI preview + koreksi + dialog paket commit | ≤300 |
| 5 | `src/pages/dashboard/BKUPage.jsx` | UBAH — tombol Upload PDF + state minimal (diff KECIL) | +15 |
| 6 | `public/models/` | BARU (kondisional) — model .onnx bila paddleocr-js menang | assets |
| 7 | `test-bku-pdf-parse.mjs` | BARU — oracle node vs Excel | dev |
| 8 | `scratch-pdf-check/gen_fixture_rest.py` | existing (dari 013) — dev-only, git-ignore kandidat | dev |
| 9 | `vite.config.js` | UBAH (kondisional) — COOP/COEP bila paddleocr-js menang | +10 |
| 10 | `bkuParser.js` | **TABU — WAJIB 0 diff** | 0 |

## Rencana Implementasi (task 2–5 menit per unit; DoD pasted sebagai bukti)

> Sensor standar: `SB = cd spj-frontend && npm run build 2>&1 | tail -3; echo EXIT=$?`
> (harus `EXIT=0`). Gate tambahan spesifik diberi kode G-xx.

### Fase 0 — Fondasi (fixture + render)
- **0.1** Regenerasi fixture: `python scratch-pdf-check/gen_fixture_rest.py`
  sampai 21/21 halaman (background, resumable). DoD: jumlah halaman 21;
  jumlah item hal 1–4 = nilai fixture lama. | Est 5m (menunggu OCR).
  DSA: proses generate fixture = tool build-time — bukan hot path.
- **0.2** Tulis oracle `test-bku-pdf-parse.mjs` (baca Excel Januari via
  `xlsx` + fixture JSON): hitung jumlah baris/masuk/keluar/saldo Januari,
  tampilkan target. DoD: `node test-bku-pdf-parse.mjs` mencetak 4 angka
  Januari dari Excel. | Est 5m
- **0.3** File `bkuPdfPages.js` + tanda text-layer + rotasi + `onProgress`
  + AbortController. DoD: SB; `node -e` import module (definisi export
  ada). | Est 25m
- **0.4** SB + smoke render di browser (dev server): 21 canvas ter-render,
  batal di tengah = tidak ada perubahan storage. DoD: SB + catat screenshot path. | Est 15m

### Fase 1 — Parser (murni dari fixture, tanpa OCR hidup)
- **1.1** `bkuPdfParser.js`: grouping baris per-y + koreksi baris
  terpotong antar-halaman. | Est 30m
- **1.2** Pemetaan kolom per-x (anchor header tabel per halaman) +
  format angka Indonesia. | Est 30m
- **1.3** `TransactionRow` builder: REUSE `detectTransactionType` /
  `detectKategoriBelanja` via IMPORT EXPLICIT. DoD G-1:
  `grep -rn "detectTransactionType" src/utils/bkuPdfParser.js`
  + `git diff --stat src/utils/bkuParser.js` = 0 file. | Est 20m
- **1.4** `reconcile()` jaring pengaman + detector `problems[]`
  (uraian_kosong, angka_gagal_parse, kolom_geser, saldo_tak_runtun). | Est 20m
- **1.5** Oracle PDF: `node test-bku-pdf-parse.mjs --pdf` → **0 selisih
  vs Januari Excel** + akurasi uraian ≥ 90%. | Est 30m
  **DSA: cluster baris per y → sort O(n log n) + pemetaan kolom O(k)
  per baris — hot path parser: ±421 baris × ±20 sel; sort dipilih agar
  lookup header per halaman O(1).**
- **1.6** SB + oracle rerun + gate grep (G-1). | Est 5m

### Fase 2 — A/B Gate + kompleksitas engine
- **2.1** Adapter interface: `ocrPage(canvas) → items[]` + lazy `import()`
  untuk kedua engine (pin 0.4.2 / 7.0.0). | Est 20m
- **2.2** A/B di browser dev: fixture hal 1–4 lalu seluruh 21; di
  masing-masing: akurasi uraian, sel-golden, waktu. DoD: tabel akurasi
  2 baris di-paste di ADR; pemenang dipilih berangka. | Est 40m
- **2.3** Keputusan: uninstall engine yang kalah; ADR di `DECISIONS.MD`
  (nama pemenang + tabel akurasi + alasan); amend BLUEPRINT bila perlu
  (kondisional di task 2.4 menjadi non-kondisional). | Est 10m
- **2.4** Kondisional bila paddleocr-js menang: `public/models/`
  model self-host + COOP/COEP di `vite.config.js`. Bila tesseract menang:
  langsung lanjut. DoD: SB + dev server hidup + smoke page muat. | Est 30m

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
  (G-4 `git diff --stat`) + SB + oracle full. | Est 20m
- **4.2** Pembaruan status di STATE.MD + checklist ACCEPTANCE.MD universals
  → /acceptance-runner konteks segar. | Est 10m

Total task: 17 satuan × 2–40 menit ≈ 5,5 jam coding, ±50% buffer uji.

## Definisi Khusus Gate (perintah eksak + harapan output)
- **G-1**: `git diff main -- src/utils/bkuParser.js` → kosong
- **G-2**: T-02 15 pola (format sprint lama `-i`) → 0 hit
- **G-3**: `grep -rEn "localStorage\.(get|set)" src` → hanya via storageHelper
- **G-4**: `git diff main --stat` → file BARU saja + BKUPage.jsx +
  (kondisional) vite.config.js; tanpa file tidak terpakai

==================== 3. ACCEPTANCE.MD ====================
# ACCEPTANCE CRITERIA — Sprint 015: Import BKU PDF (OCR)

> Format: Bab 8.4 Dokumen 3 + aturan Task Gate. Kriteria yang butuh browser
> runtime ditandai [RUNTIME] — dieksekusi oleh /acceptance-runner konteks
> segar. Kriteria command murni bisa dijalankan di sesi builder apa pun.

## TASK GATE (cek DoD per task, TERMASUK DSA — wajib hijau SEBELUM kriteria sprint dinilai)

- [ ] Semua task Fase 0..4 punya DoD hijau + output di-paste (bukti
      per task, bukan klaim)
- [ ] **G-1** `git diff main -- src/utils/bkuParser.js` → output kosong
- [ ] **G-2** T-02: 15 pola hardcode (`-i`) → 0 hit
- [ ] **G-3** `grep -rEn "localStorage\.(get|set)" src` → hanya via
      storageHelper (0 pemanggilan langsung)
- [ ] **G-4** `git diff main --stat` → hanya file di daftar BLUEPRINT §File
- [ ] DSA line hadir & konsisten di task hot-path (1.5, 3.3)

## Definisi "Selesai"

Sprint SELESAI bila: seluruh kriteria T-01..T-16 hijau (statik/terminal
ing dan/or runtime), Task Gate hijau, ADR engine tersimpan berangka,
dan STATE.MD diperbarui. Kriteria runtime dieksekusi acceptance-runner.

## Kriteria (T-01..T-16, E-1/E-2)

**T-01 — Build hijau** [STATIK]
- Given: working tree berisi implementasi BLUEPRINT
- When: `cd spj-frontend && npm run build 2>&1 | tail -3; echo EXIT=$?`
- Then: output baris terakhir `EXIT=0` + `✓ built in`

**T-02 — Anti-hardcode 15 pola** [STATIK]
- Given: file baru bkuPdf*.js, BKUUploadPdf.jsx, BKUPage.jsx diff
- When: T-02 15 pola `-i` (format sprint lama)
- Then: 0 hit — tidak ada nama sekolah/kabupaten/NIP hardcode

**T-03 — Jumlah transaksi Januari IDENTIK**
- Given: fixture 21/21 halaman + oracle `test-bku-pdf-parse.mjs`
- When: `node test-bku-pdf-parse.mjs --pdf`
- Then: `jumlah Januari: PDF == Excel == <nilai Excel>`; selisih = 0

**T-04 — Total masuk/keluar Januari IDENTIK**
- Given/When: perintah T-03
- Then: `masuk Januari` + `keluar Januari` sama persis Excel (angka
  rupiah persis, bukan ± toleransi)

**T-05 — Saldo akhir Januari IDENTIK**
- Given/When: perintah T-03
- Then: `saldo akhir Januari` = Excel persis

**T-06 — reconcile jaring pengaman**
- Given: fixture utuh + hasil parse
- When: `node test-bku-pdf-parse.mjs --reconcile`
- Then: `saldo awal + masuk − keluar = saldo akhir` → `ok: true`;
  selisih sekecil apapun → `mismatches[]` terisi (bukan diam)

**T-07 — Semua bulan lulus (prof penuh)** [STATIK]
- Given: oracle --pdf full 21 halaman
- When: `node test-bku-pdf-parse.mjs --pdf --all-months`
- Then: tiap bulan Jan..Des mencetak pasangan angka PDF vs Excel;
  Januari wajib 0 selisih; bulan lain dilaporkan sebagai info (target
  hard hanya Januari)

**T-08 — Akurasi uraian ≥ 90%**
- Given: halaman 1 fixture + uraian Excel per baris Januari
- When: bagian oracle pengukuran string-match
- Then: `akurasi uraian: >= 90%` tercetak

**T-09 — Storage & bentuk baris identik**
- Given: implementasi tulis-commit (Q4 DATA-MODEL)
- When: grep storage + JSON sample
- Then: (a) hanya prefix `spj_`; (b) baris tertulis memiliki 16 field
  identik jalur Excel, 0 field asing (mis. tidak ada `source:'pdf'`)

**T-10 — Batal di tengah = data utuh** [RUNTIME]
- Given: hasil Excel sudah ada di `spj_bku_data`
- When: proses render/OCR dijalankan lalu tombol Batal diklik
- Then: dialog tidak muncul; `spj_bku_data` tidak berubah (cek
  storage sebelum/sesudah identik)

**T-11 — KONFIRMASI SEBELUM MENULIS** [RUNTIME]
- Given: preview terisi
- When: klik Simpan
- Then: dialog konfirmasi muncul DULU (menyebut jumlah baris) —
  `spj_bku_data` baru berubah SETELAH "Ya" diklik

**T-12 — tipe/kategori hasil REUSE** [STATIK]
- When: `grep -rn "function detectTransactionType" src/utils`
  + `grep -c "detectTransactionType" src/utils/bkuPdfParser.js`
- Then: definisi hanya di `bkuParser.js` (1 file), konsumen pakai
  import; tidak ada salin-manual di file baru

**T-13 — Fallback jujur** [RUNTIME]
- Given: input file non-PDF (.xlsx) / PDF percobaan OCR gagal
- When: upload dicoba
- Then: pesan "gunakan jalur Excel" muncul; tidak ada penulisan data;
  console tidak error

**T-14 — Fast-path text-layer (PDF ber-text-layer)** [STATIK]
- Given: modul `bkuPdfPages.js`
- When: unit node: halaman dummy ber-text-layer > ambang
- Then: flag `hasText=true` dikembalikan tanpa mengalami OCR

**T-15 — ADR engine berangka tersimpan**
- Given: A/B T-21 selesai
- When: baca `DECISIONS.MD` bagian ADR terakhir
- Then: ada tabel akurasi minimum 2 baris (paddleocr-js 0.4.2 vs
  tesseract.js 7.0.0) + nama pemenang + versi pin; pilihan berangka
  angka bukan opini

**T-16 — Batas baris BLUEPRINT**
- Given: file util/komponen baru
- When: `wc -l src/utils/bkuPdfPages.js src/utils/bkuPdfOcr.js
  src/utils/bkuPdfParser.js src/components/pencatatan/BKUUploadPdf.jsx`
- Then: tiap util ≤ 200 baris; BKUUploadPdf.jsx ≤ 300 baris

## Kasus Tepi

**E-1 — Input bukan PDF**
- When: file .xlsx/.png di-upload ke tombol Upload PDF
- Then: ditolak dengan pesan jujur "format file PDF"; jalur Excel tetap
  jalan; tidak ada penulisan data

**E-2 — Bulan terpilih tanpa transaksi di PDF**
- When: pilih bulan yang 0 baris di PDF, klik lanjut
- Then: preview menampilkan pesan "0 baris di bulan ini" — tidak ada
  dialog timpa dan tidak ada penulisan kosong ke data

## Output yang Bisa Didemonstrasikan
- Browser: alur upload PDF contoh bulan Januari → preview → koreksi
  1 baris → simpan → tabel BKU Bertahap-Terkiris memuat data Januari
- Terminal: oracle satu-test setelah korekti uji resep: `0 selisih`

==================== 4. HANDOFF-PROMPT.MD ====================
# HANDOFF PROMPT — Sprint 015: Import BKU PDF (OCR)

## Prompt untuk Builder

Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.4 — Tahap 4).

Tugas Anda untuk Sprint 015:
1. Baca dulu, berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
   `DOMAIN.MD` → `CONSTITUTION.md` → pack sprint-015 ini
   (REQUIREMENTS.MD · BLUEPRINT.MD · ACCEPTANCE.MD + bahan:
   PRD.md, DATA-MODEL.md, MODULE-PLAN.md)
2. Lakukan DRY RUN dulu: laporkan rencana implementasi, file yang
   akan dibuat/diubah, dependensi kandidat yang akan dipin
   (paddleocr-js 0.4.2 / tesseract.js 7.0.0 — hanya SATU yang
   tetap terpasang setelah A/B), dan risikonya
3. TUNGGU persetujuan user SEBELUM coding (aturan AGENTS.MD)

## Bootstrap Command Block (jangan tebak sendiri — jalankan ini)

```bash
# 1. Instal dependensi + build sanity
cd spj-frontend
npm install
npm run build 2>&1 | tail -3; echo BUILD_EXIT=$?      # harap BUILD_EXIT=0

# 2. Jalankan dev server untuk pengujian manual (proses berjalan di background)
npm run dev   # harap local: http://localhost:5173 (browser manual)

# 3. Sanity oracle start (opsional tapi disarankan)
ls scratch-pdf-check/gen_fixture_rest.py && ls "template/contoh format BKU-PDF tahunan.pdf" -la
```

Sanity yang diperlukan sebelum lanjut: `BUILD_EXIT=0`, URL dev
server 200, file PDF contoh + generator fixture evidence.

## Aturan kerja (ikuti BLUEPRINT fase 0..4, jangan melompat)

- Fase 0 (fixture+oracle) → Fase 1 (parser, 0 selisih Januari) →
  Fase 2 (A/B engine berangka + ADR) → Fase 3 (UI+commit) →
  Fase 4 (gate akhir)
- Satu task selesai = DoD hijau + output di-paste (shift-left)
- DSA-line hot path wajib: parser & commit tulis atomik (lihat
  BLUEPRINT)
- ENGINE GAGAL: bila hasil A/B kedua engine tidak mencapai
  T-08 ≥ 90% → STOP; lapor user; JANGAN lanjut paksa
  (preseden sprint-013)

## JANGAN

- DILARANG mulai coding sebelum dry run disetujui
- DILARANG mengubah requirements/pack tanpa persetujuan user
- DILARANG memakai dependency di luar BLUEPRINT (versi ter-pin eksak)
- DILARANG menyentuh `src/utils/bkuParser.js` (G-1 = 0 diff) atau
  mengubah jalur Excel yang ada
- DILARANG melemahkan/mematikan test/kriteria (skip, expected
  diturunkan, konstanta dipoles agar lulus)
- DILARANG commit/push tanpa kuasa user
- DILARANG refactor kode legacy di luar cakupan file di BLUEPRINT
- DILARANG membuat artefak junk baru; fixture + file uji
  E-1/E-2 jangan dihapus

## SETUJU (kalau sudah disetujui)

- coding per fase + DoD bukti per fase
- update STATE.MD + checklist ACCEPTANCE saat checkpoint besar
- lapor hasil dengan bukti (build log, oracle output, screenshot path)
- jika harus berhenti: pause bersih + catat status di STATE.MD
  untuk handoff berikutnya

## Cek yang harus diuji pertama kali saat runtime
- Halaman: /dashboard/bku (menu BKU), tombol Upload PDF
- File uji: `template/contoh format BKU-PDF tahunan.pdf`
