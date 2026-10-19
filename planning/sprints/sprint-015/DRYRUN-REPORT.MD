# DRY RUN REPORT — Sprint 015: Import BKU PDF (OCR)

> **MODE: DRY RUN.** Tidak ada satu baris kode aplikasi yang ditulis pada
> laporan ini. Sesuai skill `/ai-coding-coach` Tahap 4-5: dry run wajib
> mendahului build, dan **tanpa persetujuan eksplisit = tidak ada build**.
>
> Tanggal: **2026-10-19** · Branch: **`feat/bku-upload-pdf`** (HEAD `d46edbc`)
> · Sumber: HANDOFF-PROMPT.MD v2 + pack sprint-015 v2

---

## 0. Ringkasan Eksekutif

| Aspek | Nilai |
|---|---|
| Status pack | v1 direview → **v2, 16 cacat dikoreksi**, semua terverifikasi ke repo |
| Task | **21** (bukan 17) · Σ estimasi **465 mnt ≈ 7,75 jam** + buffer uji |
| File baru | 5 (3 util + 1 komponen + 1 oracle) · dev: 1 generator Python |
| File diubah | 2 (`BKUPage.jsx` +15 baris, `vite.config.js` kondisional) |
| File TABU | `src/utils/bkuParser.js` — **0 diff, mutlak** |
| Dependency baru | 2 kandidat A/B → **hanya 1 yang tetap** |
| Risiko terbuka | **1 besar** (akurasi OCR angka) + 2 kecil |
| Blocked | **Tidak** — bootstrap hijau |

**Rekomendasi: Lanjut ke MODE BUILD, dengan reorder 1 hal (lihat §5).**

---

## 1. Bootstrap — Dijalankan Sungguhan

Semua perintah di blok bootstrap HANDOFF-PROMPT.MD v2 dieksekusi apa adanya.

### 1.1 Sanity file masukan
```
PDF contoh     : True
Excel baseline : True
bkuParser.js   : True
gen_fixture.py : False  <- False itu NORMAL, tugas 0.1
```

### 1.2 Baseline build
```
> spj-frontend@0.1.0 build
✓ built in 9.76s
BUILD_EXIT=0
v24.19.0 / npm 11.17.0
```
Baseline **hijau sebelum sprint dimulai** → tidak ada regresi yang diwarisi.

> **Kontrol negatif capture exit-code** (agar "BUILD_EXIT=0" bukan kebetulan):
> `node -e "process.exit(7)"` → `$LASTEXITCODE = 7`. ✅ capture terbukti benar.

### 1.3 Baseline T-02 (anti-hardcode)
```
utils/exportPajakExcel.js:29          'SD Negeri Pasirhalang'
blocks/CoverHeader.jsx:14             "PEMERINTAH KABUPATEN BANDUNG BARAT"
blocks/KopGugus.jsx:17                'PEMERINTAH KABUPATEN BANDUNG BARAT'
blocks/SignatureFooter.jsx:8          SDN Pasirhalang
T-02_EXIT=0   → 4 hit pre-existing (semua sudah ada di `main`)
git diff main -- spj-frontend/src | rg -ni "<15 pola>"   → 0 HIT ✅
(rg -niE … | rg -i sourceFile | Measure-Object).Count     → 0 ✅
```

### 1.4 Prasyarat OCR (untuk task 0.1)
```
python -c "from rapidocr_onnxruntime import RapidOCR"   → RapidOCR OK
pip show pypdfium2  → not found
pip show PyMuPDF    → Name: pymupdf                       ✅renderer tersedia
```

### 1.5 Eksekusi nyata pipeline OCR (de-risking, in-memory, tanpa artefak)
```
PyMuPDF: pages = 21, load 0,02s
page 1 @200dpi = 1654 x 2339 px  (414.959 bytes PNG)
page 1 text layer = 0 char                               <- PDF hasil scan, terkonfirmasi
RapidOCR page 1  = 113 item dalam 5,1 detik
token mengandung angka = 84
```

**Artinya:** task 0.1 **tidak blocked**. Fixture 21 halaman ≈ **21 × 5,1 s ≈
1,8 menit** OCR (di luar I/O render). Estimasi 45 menit pada pack sudah realistis.

---

## 2. Rencana Kerja — 21 Task

> Sprint mode: `pushd spj-frontend` sebelum setiap perintah; `popd` setelahnya.

### FASE 0 — Fondasi (4 task · 90 mnt)

| # | Task | File | Est | DoD (perintah) |
|---|---|---|---|---|
| **0.1** | Tulis ulang generator fixture | `scratch-pdf-check/gen_fixture_rest.py` **BARU** | 45m | `python gen_fixture_rest.py` → `fixture.json` 21 halaman; pencacah `node -e` = 21; 3 halaman pertama tercetak |
| **0.2** | Oracle angka target | `spj-frontend/test-bku-pdf-parse.mjs` **BARU** | 5m | `node test-bku-pdf-parse.mjs` → 4 angka Jan **= 5 / 82.560.000 / 0 / 82.560.000** |
| **0.3** | Modul render + text-layer + abort | `src/utils/bkuPdfPages.js` **BARU** | 25m | `BUILD_EXIT=0` + `node -e` import OK |
| **0.4** | Smoke render browser | — | 15m | `BUILD_EXIT=0` + screenshot path dicatat |

> ⚠️ **0.2 WAJIB pakai peta kolom resmi** `bkuParser.js:39-48`
> (`PENERIMAAN 13 · PENGELUARAN 16 · SALDO 19`, header baris 14, data mulai 15).
> Saat verifikasi pack ini, indeks "tebakan" menghasilkan **0/0/0 palsu** —
> sudah dikoreksi (D16).

### FASE 1 — Parser (6 task · 135 mnt)

| # | Task | Est | DoD |
|---|---|---|---|
| **1.1** | Grouping baris per-y + healing baris terpotong antar-halaman | 30m | oracle jalan |
| **1.2** | Pemetaan kolom per-x (anchor header per halaman) + format angka Indonesia | 30m | angka ter-parse |
| **1.3** | **`redetectTypes()`** → isi `tipe`+`kategori` | 20m | **G-1**: `git diff --stat bkuParser.js` kosong **DAN** `rg -n redetectTypes bkuPdfParser.js` ≥1 hit |
| **1.4** | `reconcile()` + detector `problems[]` (4 jenis) | 20m | `--reconcile` → `ok:true` |
| **1.5** | **PINTU GERBANG 1** — oracle `--pdf` | 30m | **0 selisih** Jan + akurasi uraian **≥90%** seluruh halaman Jan + tabel per halaman |
| **1.6** | Re-run SB + G-1 | 5m | `BUILD_EXIT=0` + G-1 hijau |

**DSA hot-path (wajib, sudah ada di pack):** cluster per-y → sort
`O(n log n)` + lookup header per halaman `O(1)`; ±421 baris × ±20 sel.

### FASE 2 — A/B engine (4 task · 100 mnt)

| # | Task | Est | DoD |
|---|---|---|---|
| **2.1** | Adapter `ocrPage(canvas) → items[]` + lazy `import()` 2 engine | 20m | kedua engine output format sama |
| **2.2** | **A/B TERUKUR** (hal 1–4 → 21 hal) | 40m | tabel akurasi **2 baris** di-paste ADR; pemenang berangka |
| **2.3** | `npm uninstall` engine kalah + tulis ADR | 10m | `DECISIONS.MD` berisi tabel + pemenang + alasan |
| **2.4** | *Kondisional* — `public/models/` + COOP/COEP `vite.config.js` | 30m | `BUILD_EXIT=0` + dev server hidup |

### FASE 3 — UI + commit (5 task · 150 mnt)

| # | Task | File | Est | DoD |
|---|---|---|---|---|
| **3.1** | Kerangka: input PDF + pilih bulan + `PreviewRow[]` | `components/bku/BKUUploadPdf.jsx` **BARU** | 40m | US-1/2 |
| **3.2** | Tabel preview + badge bermasalah + koreksi inline + hapus + total live | (sama) | 40m | US-3/4/5 |
| **3.3** | Dialog konfirmasi + tulis atomik (replace-by-month) | (sama) | 25m | US-6/10 |
| **3.4** | Integrasi tombol "Upload PDF" | `pages/dashboard/BKUPage.jsx` **UBAH +15** | 20m | diff kecil |
| **3.5** | Gate UI + G-2 + G-3 | — | 25m | delta-vs-main = 0 hit |

**DSA hot-path:** tulis **atomik** = satu `storageHelper.set` (O(1) JSON),
bukan N set per-baris (partial write bisa merusak data lama).

### FASE 4 — Gate akhir (2 task · 30 mnt)

| # | Task | Est | DoD |
|---|---|---|---|
| **4.1** | Gate penuh G-1+G-2+G-3+G-4 + SB + oracle | 20m | semua hijau, bukti di-paste |
| **4.2** | Update `STATE.MD` + checklist `ACCEPTANCE` → `/acceptance-runner` | 10m | dokumen terupdate |

---

## 3. File yang Akan Disentuh

```
BARU (5)   src/utils/bkuPdfPages.js            ≤200 baris
           src/utils/bkuPdfOcr.js              ≤200 baris
           src/utils/bkuPdfParser.js           ≤200 baris
           src/components/bku/BKUUploadPdf.jsx ≤300 baris
           spj-frontend/test-bku-pdf-parse.mjs  (oracle)
UBAH (2)   src/pages/dashboard/BKUPage.jsx     +15 baris
           vite.config.js                      +10 (KONDISIONAL)
DEV  (1)   scratch-pdf-check/gen_fixture_rest.py  (git-ignored)
TABU (1)   src/utils/bkuParser.js              0 diff  ← JANGAN DISENTUH
```

> Koreksi penting: `src/components/pencatatan/` **tidak pernah ada**.
> Dipakai `src/components/bku/` — sibling `BKUSidebar.jsx`.

---

## 4. Dependency — A/B Berangka

| Kandidat | Versi pin | Verifikasi | Nasib |
|---|---|---|---|
| `@paddleocr/paddleocr-js` | **0.4.2** | ✅ `npm view` → ada | Tetap **hanya bila menang** |
| `tesseract.js` | **7.0.0** | ✅ `npm view` → ada | Tetap **hanya bila menang** |

**Aturan:** setelah A/B, **tepat satu** engine di `package.json`. Yang kalah
di-`npm uninstall` + `rg` 0 sisa referensinya + tercatat di ADR.
`package.json` + `package-lock.json` **wajib berubah** (sudah dimasukkan
allowlist G-4).

---

## 5. Risiko

### RISIKO BESAR - Akurasi OCR angka (risiko utama sprint)

**Bukti lapangan** (RapidOCR, page 1, 113 item):
```
 2.560.000  x4      <- nilai yang sama muncul 4x (indeks kolom bergeser)
 1.560.000          <- digit tengah tertukar, bukan 500
 79.560.000
.160.000           ← digit depan HILANG
5.910.000  ×2
7.160.000  ×2
```
 Pola kesalahan: **digit hilang / digit tertukar** pada angka ribuan.
  Konsekuensi: `0 selisih` pada `masuk = Rp 82.560.000` berarti
 **tiap digit harus benar** — margin error = nol.

**Tanda bacaan yang balk.** Tapi ada dua kabar baik yang terukur:
1. `Halaman 1 dari 21` ✅ terbaca sempurna
2. `82.560.000` ✅ **terbaca persis** di baris PENGELUARAN — cocok dengan
   `masuk Januari = Rp 82.560.000` di Excel

**Dampak:** kalau T-08 (≥90%) atau T-03/04/05 (0 selisih) gagal di Fase 1.5,
itu **bukan tanda parser salah** — parserDPun pure-fixture. Itu sinyal
kurangnya kualitas OCR → **pindah ke keputusan engine di 2.2**.

**Mitigasi:**
 - Task 1.5 dipecah lebih awal (Fase 1, sebelum UI) -> kegagalan terdeteksi dini
- Dua kandidat A/B sudah disiapkan (2.2) → ada cadangan
- `problems[]` + koreksi inline (3.2) → user bisa repairing
- **Stop-rule:** bila kedua engine < 90% → **STOP**, lapor user
  (preseden sprint-013). **Dilarang lanjut paksa.**

### 🟡 RISIKO SEDANG — Oracle salah baca Excel
*Bukan* keraguan tentang angka target (sudah terukur), tapi tentang **kode**
yang menghitung ulang. Selama 0.2 memakai peta kolom resmi, aman.
**Mitigasi:** angka acuan Jan 2026 dipatok di `ACCEPTANCE` T-07 sebagai
kontrak — oracle yang keluar ≠ itu = bug oracle.

### 🟢 RISIKO KECIL
| Risiko | Mitigasi |
|---|---|
| Renderer PDF→gambar hilang | PyMuPDF ✅ **sudah terverifikasi ada** |
| OCR lambat | 5,1 s/hal → 21 hal ≈ 1,8 mnt. Job background + resumable |
| Build pecah karena model .onnx | 2.4 kondisional; dev server harus tetap hidup |
| G-1 dilanggar (builder menambah `export`) | Warning di task 1.3 + T-12 + gate per-tugas |

---

## 6. Gate — Sudah Dibuktikan Berjalan (Pratasan)

| Gate | Perintah | Hasil sekarang |
|---|---|---|
| G-1 | `git diff --stat -- spj-frontend/src/utils/bkuParser.js` | ✅ kosong |
| G-2 | `git diff main -- spj-frontend/src \| rg -ni "<15 pola>"` | ✅ 0 hit |
| G-3 | `git diff main -- spj-frontend/src \| rg -n "localStorage\."` | ✅ 0 hit |
| G-4 | `git diff --stat main` → allowlist BLUEPRINT §G-4 | allowlist sudah diperluas (`package.json` + lock) |
| T-02 aset | `… \| rg -i sourceFile \| Measure-Object` | ✅ 0 |
| T-16 | loop `Get-Content \| Measure-Object -Line` | ✅ jalan (file belum ada — normal) |

---

## 7. Permintaan Keputusan_User (2 hal — bukan blocker coding)

**① File contoh PDF tidak ter-track git.**
`template/contoh format BKU-PDF tahunan.pdf` (5,4 MB) berstatus `??`.
Sprint 015 bergantung 100% padanya. Kalau repo di-clone ulang → sprint mati.
→ **Commit file contoh, atau sediakan lokasi pengganti?**
*(Rekomendasi: commit — 5,4 MB masuk akal untuk fixture regression.)*

**② 4 hit T-02 residual.**
`KopGugus.jsx:17` · `SignatureFooter.jsx:8` · `CoverHeader.jsx:14` ·
`exportPajakExcel.js:29`. Semuanya pre-existing, semuanya di luar cakupan
sprint 015. Pack menyatakan **delta-vs-main**, jadi **tidak menghalangi**.
→ **Biarkan (rekomendasi), atau buka sprint tersendiri?**
*(Membuka sekarang = melanggar G-4 + keluar dari cakupan pack.)*

---

## 8. Permintaan Persetujuan

Sesuai `/ai-coding-coach`: **laporkan → tunggu → baru build.**

Berikut yang saya mohon diputuskan:

| Opsi | Isi |
|---|---|
| **A** | **Setujui penuh** — mulai dari task 0.1 (write ulang generator fixture) |
| **B** | Setujui, **tapi** selesaikan dulu 2 keputusan di §7 (commit PDF / 4 hit T-02) |
| **C** | Setujui **dengan reorder** — langsung ke Fase 1 parser (0.1–0.2 paralel di background) karena OCR sudah terbukti 5,1 s/hal |
| **D** | Tunda — baca ulang pack dulu |

> Rekomendasi saya: **A atau B**. Semua cacat pack sudah diperbaiki dan
> diverifikasi; bootstrap hijau; tidak ada blocker teknis yang tersisa.
> Yang tersisa murni keputusan ruang lingkup (2 hal di §7).

---

**STATUS: MENUNGGU PERSETUJUAN — belum ada kode yang ditulis.**
