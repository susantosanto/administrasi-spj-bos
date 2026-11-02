# BUILD REPORT — Sprint 015: Import BKU PDF (OCR)

> Builder = ZCode · Branch `feat/bku-upload-pdf` (HEAD `d46edbc`) ·
> Mulai **2026-10-19**. Semua isi berdasar **output nyata**, bukan klaim.
> Rujukan: `DRYRUN-REPORT.MD` (disetujui user) + pack sprint-015 v2.

---

## TASK 0.1 — Tulis ulang generator fixture ✅

**File:** `scratch-pdf-check/gen_fixture_rest.py` (BARU, dev-only, sudah masuk `.gitignore`)

### ⚠️ TEMUAN PENTING: Akurasi OCRUMMERAH — Penyebabnya ROTASI, bukan engine

Saat menjalankan generator pertama kali (tanpa rotasi), hasilnya jelek — persis
risiko yang saya tandai 🔴 di DRYRUN-REPORT §5:

```
halaman 1 (ROTASI 0):  2.560.000 ×4 · 1.560.000 · .160.000 · 79.560.000
```
Dijemput screenshot halaman 1 → **ternyata seluruh halaman berorientasi SISI
(teks 90 derajat)**, bukan miring. Angka rupiah tercetak vertikal, sehingga
OCR mengacaukan digit.

**Bukti perbandingan (halaman 1, engine sama, DPI sama):**

| Metrik | Tanpa rotasi | **Dengan rotasi 90°** |
|---|---|---|
| Item OCR | 113 | **117** |
| Teks sampah | `009′660't` | tidak ada |
| `.160.000` (digit depan hilang) | ada | **0** |
| `82.560.000` | terbaca | **terbaca utuh** |
| Rantai saldo | tidak konsisten | **82.560.000 → 81.560.000 → 80.560.000 → 79.560.000 → … → 75.910.000** |
| Teks kop | kacau | `Nama Sekolah : SD NEGERI PASIRHALANG`, `Kabupaten / Kota : Kab. Bandung Barat` (sempurna) |

**Kesimpulan:** seluruh risiko akurasi yang saya eskalasikan di dry run
**hilang karena rotasi**, bukan karena penggantian engine. A/B engine
(tugas 2.2) tetap dijalankan sesuai pack, tapi ekspektasinya sekarang jauh
lebih tinggi dan murah.

Rotasi diterapkan di generator (`--rotate 90`, default) **dan** akan diterapkan
di `bkuPdfPages.js` (BLUEPRINT 0.3) supaya koordinat fixture = koordinat runtime.

### DoD (terpenuhi)
```
$ python scratch-pdf-check\gen_fixture_rest.py --force
  halaman  1/21  item=117  (5.9s)
  ...
  halaman 21/21  item= 91  (117.3s)
Selesai: 3267 item / 21 halaman (117.3s)

$ node -e "..."   # pencacah
total item = 3267 | jumlah hal = 21
PASS 21/21 = true
meta = {"pdf":"template/contoh format BKU-PDF tahunan.pdf","dpi":200,"rotate":90,
        "total_pages":21,"engine":"rapidocr_onnxruntime"}

token rupiah unik = 485   → 82.560.000  1.000.000  81.560.000  80.560.000 …
token diawali titik (sampah) = 0
```
✅ fixture 21/21 halaman · ✅ pencacah = 21 · ✅ 3 halaman pertama tercetak

### Struktur tabel yang terpetakan (bahan task 1.1/1.2)

Kolom terdeteksi dari header (`y≈540`, sudah dirotasi):

| Kolom | x-header | Asal |
|---|---|---|
| TANGGAL | 125 | — |
| KODE KEGIATAN | 288 | — |
| KODE REKENING | 445 | — |
| NO. BUKTI | 569 | — |
| URAIAN | 1136 | — |
| PENERIMAAN | 1691 | — |
| PENGELUARAN | 1873 | — |
| SALDO | 2106 | — |

**Baris Januari di PDF = 5, cocok persis dengan Excel:**

| # | Tanggal (PDF) | Uraian (PDF) | Excel |
|---|---|---|---|
| 1 | 01-01-2026 | SaldoBankBulanDesember2025 | ✓ |
| 2 | 01-01-2026 | Saldo Tunai Bulan Desember 2025 | ✓ |
| 3 | 20-01-2026 | Terima Dana BOSP Tahap 1 2026 | ✓ |
| 4 | 31-01-2026 | Bunga Bank | ✓ |
| 5 | 31-01-2026 | Pajak Bunga | ✓ |

> Catatan koreksi diri: pada dry run saya sempat melihat `02-02-2026 Pajak Bunga`
> dan menduga ada selisih tanggal vs Excel. Setelah dirotasi, terbaca
> **`31-01-2026`** — **tidak ada selisih**. Kem prevailed-reading saya hilang
> setelah rotasi.

### Cacat OCR yang masih ada (bahan `problems[]` task 1.4 + koreksi inline 3.2)

| Gejala | Contoh | Dampak |
|---|---|---|
| Spasi hilang | `SaldoBankBulanDesember2025` | uraian string-match (T-08) |
| Kode rekening terpotong | `5.1.02.02.01.00` (asli `…0013`) | `detectKategoriBelanja` |
| Kode rekening pecah 2 baris | `5.1.02.02.01.00` + `13` | perlu healing baris (1.1) |
| Uraian terpotong | `Vani (0162778679230113)` | uraian string-match |
| Header kolom pecah 2 baris | `KODE`+`KEGIATAN` | anchor header (1.2) |
| Baris *y*ebar spread ±12px | `y~828` & `y~852` | toleransi clustering |

Semua **tidak** memengaruhi 4 angka target (jumlah/masuk/keluar/saldo) karena
berada di kolom kode & uraian.

Koreksi terhadap diri sendiri: pada draft laporan di atas sempat tertulis
"bahasa Mandarin" dan "margin error nol" yang keduanya tidak akurat. Angka
OCR tidak pernah "pasti nol margin" — yang berubah adalah **kualitas inputnya**,
dan itu yang membuat rantai saldo konsisten.

### Catatan penyimpangan (wajib disclosed)

1. **`.gitignore` ditambah 1 baris** (`scratch-pdf-check/`). Pack §G-4
   mengasumsikan folder ini "sudah di-`.gitignore`", padahal belum.
   `allowlist` G-4 tidak memuat `.gitignore` -> secara formal melatonin allowlist.
   Alasan: tanpa ini, G-4 akan gagal karena file dev ikut `git status`.
2. `gen_fixture_rest.py` menambah 2 field di luar spesifikasi pack
   (`score`, `box`) - keduanya invaluable untuk parser (filter confidence,
   polygon untuk kolom miring). Field wajib `str,x,y,w,h,page` tetap ada.

---
---

## TASK 0.2 — Oracle angka target ✅

**File:** `spj-frontend/test-bku-pdf-parse.mjs` (BARU)

```
$ node test-bku-pdf-parse.mjs
sheet : Page1 | baris transaksi 2026 = 300
--- TARGET JANUARI 2026 (golden) ---
jumlah  : 5      masuk  : 82.560.000      keluar : 0      saldo : 82.560.000

$ node test-bku-pdf-parse.mjs --reconcile
saldo awal : Rp 0 | masuk Rp 82.560.000 | keluar Rp 0 | saldo akhir Rp 82.560.000
ok : true
```

**Bug yang ketemu saat menulis oracle #1:** `import * as XLSX from 'xlsx'` tidak
mengekspos `readFile`/`SSF` di ESM (hanya ada di `.default`) → `TypeError`.
Diperbaiki ke default import.

**Bug #2 (penting):** tebakan indeks kolom memberi `jumlah 5 / masuk 0 /
keluar 0 / saldo 0` — palsu. Peta resmi `bkuParser.js:39-48` ternyata
`PENERIMAAN 13 · PENGELUARAN 16 · SALDO 19` (bukan 12/15/18). Angka acuan
sudah dipatok di `ACCEPTANCE` T-07 sebagai kontrak oracle.

---

## TASK 1.1–1.4 — Parser (GENERALISASI) ✅

**File:** `src/utils/bkuPdfLayout.js` (BARU, 197 baris) +
`src/utils/bkuPdfParser.js` (BARU, 129 baris)

> Pemecahan 2 file **sesuai klausul MODULE-PLAN.md:100** —
> "bkuPdfParser.js … (≤200 baris; **boleh 2 file**)". Bukan penyimpangan
> di luar pack, melainkan opsi yang sudah disetujui arsitek.

### Permintaan user: file sekolah lain harus terbaca

User menegaskan: *"file BKU tipe pdf sekolah lain sama formatnya, hanya nilai
dan angka dan nama sekolah yang berbeda"*. Untuk membuktikannya saya buat
generator PDF sekolah lain (`scratch-pdf-check/gen_sekolah_lain.py`) yang
**formatnya identik** dengan file asli — geometri halaman, posisi kolom,
jarak baris, format angka (`96.475.000`) dan tanggal (`01-01-2026`) disalin
persis dari fixture asli — tetapi seluruh nilainya diganti:

| Besaran | File asli | File sekolah lain (sintetis) |
|---|---|---|
| Nama sekolah | SD NEGERI PASIRHALANG | **SD NEGERI KAMPUNG BARU** |
| NPSN | 20205293 | **20551234** |
| Masuk Januari | 82.560.000 | **96.475.000** |
| Keluar Januari | 0 | **8.225.000** |
| Saldo akhir | 82.560.000 | **88.250.000** |
| No. Bukti | BBU01 / BNU01 | BBU04 / BNU08 / BNU09 / BNU10 |

### Hasil uji sekolah lain

```
masuk  : 96475000 vs 96475000 OK
keluar : 8225000  vs 8225000  OK
saldo  : 88250000 vs 88250000 OK
reconcile.ok : true | mismatch : 0
baris hasil : 8 / 8   (sejajar 8/8 berdasarkan tanggal)
kop terbaca : namaSekolah + npsn + tahun benar untuk kedua file
```

### 4 kelemahan yang HANYA ketahuan karena uji ini

Parser versi pertama **gagal total** di sekolah lain (`kolomKiri: 1 run`,
`kolomKanan: []`, `0/12 baris`). Empat asumsi keras yang patah:

1. **`RE_NOMINAL` hanya terima `82.560.000`** — sekolah lain bisa cetak
   `82560000`. → kini menerima keduanya + prefix `Rp`.
2. **`RE_TANGGAL` hanya terima `DD-MM-YYYY`** — sekolah lain bisa cetak
   `DD/MM/YYYY`. → kini toleran `-`, `/`, `.`, tahun 2 atau 4 digit.
3. **`MIN_DENSITAS=20` tetap** — dokumen 12 baris, semua kolom tersaring.
   → diganti deteksi semantik per kolom, bukan ambang kepadatan.
4. **Label kop/header bocor jadi "uraian"** pada baris pertama/terakhir.
   → filter label format + buang item di atas jangkai data pertama.

### 1 kerentanan nyata yang ditemukan dan ditutup

```
y=211  "81-01-2826"   <- OCR salah baca tanggal "01-01-2026"
y=214  "SaldoBankBulanDesember2025"
y=238  "01-01-2026"
```

Satu tanggal rusak → baris itu kehilangan **jangkai** → **seluruh angka di
bawahnya bergeser satu baris** (terbukti: 96.475.000 menempel ke baris yang
salah). Ini akan terjadi di sekolah mana pun.

**Perbaikan:** jangkai baris memakai **bentuk** tanggal
(`RE_TANGGAL_BENTUK`), bukan tanggal yang valid. Baris tetap dibuat supaya
angka tidak bergeser, dan ditandai `tanggal_tidak_valid` → masuk `problems[]`
→ muncul sebagai badge di preview dan bisa dikoreksi user (sesuai rancangan
task 3.2).

Sebelum: 7/8 baris, angka meleset. Sesudah: **8/8 baris, semua angka tepat.**

### Prinsip yang dipakai (anti-hardcode)

Tidak ada koordinat maupun format angka/tanggal yang dipatok:

| Kolom | Cara deteksi |
|---|---|
| TANGGAL | bentuk d-m-y / d/m/y + uji rentang |
| KODE KEGIATAN | titik bertingkat ≤2 titik |
| KODE REKENING | titik bertingkat ≥3 titik, atau polos `13` bila tidak ada yang bertingkat |
| PENERIMAAN/PENGELUARAN/SALDO | 3 **puncak tepi-kanan** token angka (angka rata-kanan) |
| NO BUKTI vs URAIAN | celah x terbesar di antara sisa token |
| Baris | cluster y **per halaman**, jangkai = cluster bertanggal |

Efeknya: scan bergeser, kolom melebar, atau format angka sekolah lain tetap
terbaca **tanpa perubahan kode**.

### DoD 1.1–1.4
- G-1 `git diff --stat bkuParser.js` → **kosong** (file TABU tidak disentuh)
- T-12 `redetectTypes` dipakai (bukan menyalin logika) → `bkuParser.js` 0 diff
- Bentuk baris = **17 field** persis sama dengan jalur Excel
- `problems[]` **tidak** ikut ke baris (dilepas sebelum return)
- T-16 baris: 143 / 197 / 129 — semua ≤200

---

## TASK 1.5 — PINTU GERBANG 1 ✅ LULUS

```
$ node test-bku-pdf-parse.mjs --pdf
Januari  jumlah OK 0 | masuk OK Rp 0 | keluar OK Rp 0 | saldo OK Rp 0
         excel: n=5 masuk=Rp 82.560.000 keluar=Rp 0 saldo=Rp 82.560.000
         pdf  : n=5 masuk=Rp 82.560.000 keluar=Rp 0 saldo=Rp 82.560.000

--- SELISIH JANUARI (PDF - Excel) ---
  jumlah: 0      masuk : 0      keluar: 0      saldo : 0

--- AKURASI URAIAN JANUARI ---
akurasi uraian: 100%  (5/5)  target >= 90%  OK

HASIL: 0 selisih          (exit code 0)
```

| Kriteria | Target | Hasil |
|---|---|---|
| T-03 jumlah | 0 selisih | ✅ 0 |
| T-04 masuk/keluar | 0 selisih | ✅ 0 / 0 |
| T-05 saldo akhir | 0 selisih | ✅ 0 |
| T-08 akurasi uraian | ≥ 90% | ✅ **100%** (5/5) |

**Konfirmasi silang:** total baris PDF = **421**, cocok dengan klaim
REQUIREMENTS "±421 transaksi/tahun". Distribusi bulanan PDF
(Jan 5 · Feb 106 · Mar 35 · Apr 118 · Mei 8 · Jun 28) **identik** dengan
Excel untuk keenam bulan yang dipunyai Excel.

---

## TASK 0.3 — Modul render ✅

**File:** `src/utils/bkuPdfPages.js` (BARU, 143 baris)

DoD: `BUILD_EXIT=0` + `node -e` import → 9 export terdefinisi
(`DPI_AWAL, DibatalkanError, ROTASI_AWAL, bukaPdf, cekPdf, prosesSemuaHalaman,
renderHalaman, sudahDibatalkan, ukurTextLayer`).

Verifikasi di Node (pdfjs = pustaka yang sama dengan browser):
```
viewport rotation 90 : 2338 x 1653   (cocok render PyMuPDF 2339 x 1654)
viewport rotation 0  : 1653 x 2338
text-layer char      : 0  => hasText = false
```
Rotasi 90° sudah menjadi **default modul** — temuan yang membatalkan
seluruh risiko akurasi yang saya eskalasikan di dry run.

**Catatan urutan (penyimpangan kecil):** Task 0.4 ("smoke render di browser")
menuntut ada UI, sedangkan UI baru ada di Fase 3 (task 3.1). Saya verifikasi
render di Node sebagai gantinya; smoke render browser **ditunda ke setelah
task 3.1** dan dicatat sebagai tertunda, bukan dianggap selesai.

---

## Status Gerbang (per 2026-10-19)

| Gate | Hasil |
|---|---|
| **G-1** `bkuParser.js` 0 diff | ✅ PASS |
| **G-2** T-02 15 pola, delta vs `main` | ✅ 0 hit |
| **G-3** `localStorage.` delta vs `main` | ✅ 0 hit |
| **G-4** allowlist BLUEPRINT | ✅ semua file dalam allowlist |
| **T-16** batas baris | ✅ 143 / 197 / 129 |
| Anti-hardcode nama sekolah | ✅ `Pasirhalang`, `Kampung Baru`, `20205293`, `20551234` **tidak ada** di kode |
| `npm run build` | ✅ `BUILD_EXIT=0` |
| Oracle file asli | ✅ 0 selisih, akurasi 100% |
| Uji sekolah lain | ✅ angka 100%, 8/8 baris |

### Penyimpangan yang harus disclosed
1. `.gitignore` +1 baris (`scratch-pdf-check/`) — pack mengasumsikan folder ini
   sudah di-gitignore, padahal belum.
2. `src/utils/bkuPdfLayout.js` — file baru di luar tabel BLUEPRINT §File,
   **tetapi klausul MODULE-PLAN M3 "boleh 2 file" sudah menyatakannya**.
3. `gen_fixture_rest.py` menambah field `score` + `box` di luar spesifikasi pack
   (berguna: filter confidence + polygon kolom miring).
4. Task 0.4 ditunda sampai UI ada (Fase 3).
5. Fixture + PDF sekolah lain adalah artefak dev di `scratch-pdf-check/`
   (git-ignored), bukan bagian repo.

**BELUM ada** engine OCR yang dipasang (Fase 2) dan **belum ada UI** (Fase 3).
Sampai titik ini tidak ada satu pun dependency baru di `package.json`.---

## FASE 2 — Adapter OCR (2.1) + smoke test (2.5), A/B **DILEWATI**

### Keputusan dicatat
`DECISIONS.MD` **bagian Q** — engine tunggal `tesseract.js@7.0.0` (pin eksak),
tanpa A/B atas perintah user. Alasan memilih tesseract: tidak butuh COOP/COEP,
tidak butuh model `.onnx` self-host, aset bisa di-vendor ke `public/`.

**File:** `src/utils/bkuPdfOcr.js` (BARU, 125 baris) · `package.json` +1 dep.

### 🔴 TEMUAN PENTING: tesseract.js measurable lebih lemah dari RapidOCR

Ini adalah risiko yang saya tulis di ADR bagian Q, dan sekarang **terukur**:

| Ukuran (Januari, halaman 1) | RapidOCR (fixture) | tesseract.js (runtime) |
|---|---|---|
| jumlah baris | 5 ✅ | **5 ✅** |
| masuk | 82.560.000 ✅ | **82.560.000 ✅** |
| keluar | 0 ✅ | **0 ✅** |
| **saldo akhir** | 82.560.000 ✅ | **0 ❌** |
| recall angka | 100% | **82%** |
| reconcile | ok | 17 mismatch |

**Penyebab:** tesseract **tidak membaca 2 sel SALDO** di baris `31-01-2026`
(`Bunga Bank` dan `Pajak Bunga`). Sel itu tercetak `82.560.000` dan terlihat
jelas, tapi dilewati. Konsekuensinya `saldo akhir = 0` → **T-05 GAGAL** lewat
jalur runtime.

### Upaya perbaikan yang sudah dicoba (semua failsafe)
| Upaya | Hasil |
|---|---|
| Binarisasi ambang >150 | **lebih buruk** (masuk=3, semua saldo 0) |
| Binarisasi ambang >120 | **lebih buruk** |
| DPI 300 | struktur hilang (`baris=5, jan=0`) |
| PSM 6 | `baris=8, jan=0` — worse |
| PSM 4 / 11 / 12 | `baris=15, jan=5` tapi angka tetap salah |

Yang **berhasil** (dan sudah masuk kode): rotasi 90°, PSM 3, serta dua perbaikan
parser yang ditemukan justru lewat jalur tesseract:
1. **Kalibrasi kolom hanya dari item di dalam baris data.** Baris nomor kolom
   ("1 2 3 4 5 6 7 8")Kadang tesseract menaruhnya satu baris dengan data
   pertama → 8 angka kecil mengalahkan kolom rupiah → semua nilai jadi 0.
2. **Kalibrasi hanya token ≥4 digit** (≥5 tanpa pemisah ribuan) supaya "2026"
   tidak ikut.
3. **Normalisasi konfusi nol-huruf** (`0` → `ol`, `l`) di kolom angka.

Setelah perbaikan itu: `edges [1840,2040,2220]` ✅, `jan=5` ✅, `masuk=82560000` ✅.

### Test permanen
`spj-frontend/test-bku-ocr-smoke.mjs` — smoke test satu engine (bukan A/B),
pagar risiko: `recall >= 80%`. **Status: LULUS (82%)**. Test ini yang akan
menangkap regresi bila engine/OCR diganti nanti.

### ⚠️ Yang BELUM tuntas
1. **T-05 (saldo akhir 0 selisih) belum terpenuhi lewat jalur runtime** —
   hanya lewat fixture RapidOCR.
2. **Aset tesseract belum di-vendor.** `public/tesseract/` masih kosong:
   `worker.min.js` (109 KB) + `tesseract-core-simd-lstm.wasm(.js)` (±6,6 MB)
   + `ind.traineddata.gz` (±4 MB). Tanpa ini UI tidak bisa OCR offline.
   Decisions: commit ±10 MB ke repo, atau coastal CDN (melanggar aturan
   "tidak ada file yang dikirim ke layanan mana pun").
3. **UI belum ada sama sekali** — `BKUUploadPdf.jsx` belum ditulis.

### Status gerbang (masih hijau)
```
G-1 PASS · G-2 PASS · BUILD_EXIT=0 · T-16 143/200/162/125 (semua <=200)
Oracle fixture RapidOCR: 0 selisih, akurasi uraian 100%
Smoke test tesseract: recall 82% AMAN
```---

## PILIHAN B (user) — Whati ditemukan, dan kenapa B-lite mentok

User memilih **B** setelah melihat data: tesseract.js hanya achieves 3 dari 4
target Januari (saldo akhir = 0).

### B bukan sekadar menambah satu dependency
Tidak ada paket RapidOCR di npm (`rapidocr`, `rapidocr-onnxruntime`,
`@rapidocr/rapidocr` → semua 404). Jalur B harfiah berarti **mem-port sendiri**
model ONNX RapidOCR ke `onnxruntime-web`: deteksi DB + pengenalan CRNN + CTC
decode + post-processing kontur tanpa OpenCV. Estimasi ±350 baris JS baru +
±13,4 MB model. Jauh di luar sprint ini.

### B-lite: `@paddleocr/paddleocr-js@0.4.2` (kandidat A, sudah diverifikasi)
Paketnya nyata dan lengkap: 7,3 MB packed / 23,8 MB unpacked, membawa
`onnxruntime-web`, `@techstark/opencv-js`, `clipper-lib` — jadi post-processing
DB sudah beres, tidak perlu ditulis tangan.

**Tapi gagal di lingkungan ini.** Diuji sungguhan di browser (bukan asumsi):

```
Error: Cannot read properties of undefined (reading 'runtimeDefaults')
  at new OcrPipelineRunner (@paddleocr_paddleocr-js)
```

Upaya yang sudah dicoba:
| Upaya | Hasil |
|---|---|
| Pin `onnxruntime-web` ke 1.22.0 (sesuai rantainya; ter-hoist 1.30.0) | tetap sama |
| Hapus cache `.vite` + restart dev server | tetap sama (hash bundel berubah → bukan cache) |

Kesimpulan: **incompatibility nyata** antara paddleocr-js 0.4.2 dan
Vite/ORT-web, bukan masalah konfigurasi sepele. Memperbaikinya berarti
gali dependensi pihak ketiga — di luar lingkup sprint.

**Catatan tambahan:** paddleocr-js mengambil model dari CDN Baidu
(`paddle-model-ecology.bj.bcebos.com`, PP-OCRv5/v6 — **bukan** model RapidOCR).
Artinya jalur ini pun tidak langsung memenuhi tujuan "pakai yang terbukti 100%",
dan perlu self-hosting model pula agar sesuai aturan offline.

### Keputusan: kembali ke tesseract.js,_aset offline sudah/vendor_
`@paddleocr/paddleocr-js` + `onnxruntime-web` **di-uninstall** lagi. Kembali ke
satu dependency: `tesseract.js@7.0.0` (pin eksak).

### ✅ Hasil nyata dari usaha B: aset OCR offline sudah lengkap
Setelah smoke test, `ind.traineddata` tesseract mengunduh ke root repo — itu
justru aset yang dibutuhkan. Dipindah + di-vendor ke `public/tesseract/`:

```
public/tesseract/worker.min.js                       0,11 MB
public/tesseract/tesseract-core-simd-lstm.wasm.js    3,72 MB
public/tesseract/tesseract-core-simd-lstm.wasm       2,73 MB
public/tesseract/lang/ind.traineddata.gz             3,67 MB   (gzip valid: 1F 8B 08 08)
TOTAL                                                 10,22 MB
```

`bkuPdfOcr.js` `KONFIG_ASET` sekarang menunjuk **path lokal** — tidak ada CDN,
sesuai aturan "tidak ada file yang dikirim ke layanan mana pun".

**Dua perbaikan yang lahir dari uji browser:**
1. `corePath` di-pin ke **file tertentu**, bukan direktori. Kalau direktori,
   tesseract memilih varian core sendiri (relaxedsimd/simd/plain) sesuai CPU dan
   meminta file yang tidak kita vendor. Dengan pin, hanya 1 varian (6,5 MB) perlu
   ikut repo — bukan 3 varian (±19 MB).
2. `logger` hanya diteruskan kalau memang function; tesseract memanggilnya
   tanpa cek tipe → `TypeError: logger is not a function`.

### Verifikasi: semua aset ter-serve 200 dari origin sendiri
```
GET /tesseract/worker.min.js                       -> 200 OK
GET /tesseract/tesseract-core-simd-lstm.wasm.js    -> 200 OK
GET /tesseract/lang/ind.traineddata.gz             -> 204 "Intercepted by the IDM Advanced Integration"
```

⚠️ Baris terakhir **bukan cacat kode**: ekstensi *Internet Download Manager*
di profil browser agent menyita unduhan `.gz` sehingga body-nya kosong, dan
tesseract lalu gagal membuka `./ind.traineddata`. Semua aset lain 200.
Ini kendala lingkungan uji, bukan aplikasi — user nyata tidak punya IDM.
**Konsekuensi: jalur OCR di browser belum terverifikasi end-to-end di sini**,
padahal jalur yang sama di Node terbukti jalan (82% recall).

### Status sekarang
| Komponen | Status |
|---|---|
| **Parser** (bkuPdfLayout + bkuPdfParser) | ✅ **terbukti**: 0 selisih, akurasi uraian 100%,generalisasi ke sekolah lain ✅ |
| **Adapter OCR** (bkuPdfOcr.js) | ✅ ada, 125 baris, aset offline ter-vendor 10,22 MB |
| **Render** (bkuPdfPages.js) | ✅ ada, 143 baris, rotasi 90° default |
| **Engine** | tesseract.js — 3/4 target, **T-05 saldo masih 0 lewat runtime** |
| **UI** (BKUUploadPdf.jsx) | ❌ **belum ada sama sekali** |

Gate tetap hijau: `G-1 PASS · G-2 PASS · BUILD_EXIT=0 · T-16 semua ≤200 ·
oracle RapidOCR 0 selisih`.

### Catatan arsitektural penting
Engine OCR **sudah terisolasi di balik `ocrPage(canvas)`**. UI dan parser tidak
perlu diubah kalau nanti engine diganti — cukup satu adapter. Jadi sprint ini
**tidak terblokir** oleh engine: UI bisa dibangun sekarang, dan kualitas OCR
bisa ditingkatkan terpisah tanpa menyentuh UI/parser.---

## FASE 3 — UI (3.1–3.5)

**File:** `src/components/bku/BKUUploadPdf.jsx` (BARU, 298 baris ≤300)

### Alur yang dibangun
pilih file PDF → pilih bulan → proses (progres per halaman + tombol batal) →
tabel preview → koreksi inline / kecualikan baris → dialog konfirmasi →
tulis ATOMIK ke `spj_bku_data`.

- **Tulis atomik** = satu `storageHelper.set`, `replace-by-month`:
  baris bulan terpilih diganti, sisa bulan lain + meta tidak tersentuh.
- **Bentuk baris 17 field** identik jalur Excel; `problems[]` **tidak** ikut
  ke baris (dilepas sebelum return).
- `tipe`/`kategori` dihitung ulang setelah koreksi user lewat
  `redetectTypes()` — bukan disalin.
- Semua komponen `print:hidden`.

### 🔧 Cacat yang ditemukan & diperbaiki saat runtime

**1. `TAHUN = 2026` ter-hardcode.** Untuk file sekolah lain (atau tahun lain)
filter bulan selalu gagal → panel kembali ke "Pilih file" tanpa penjelasan.
Diganti: tahun diambil dari kop PDF (`hasil.kop.tahun`), fallback ke tahun baris
pertama, baru `TAHUN_AWAL`. Pesan error kini menyebutkan **bulan apa saja yang
terbaca** supaya user tidak menebak.

**2. Dua panel upload tampil bersamaan** (keluhan user). Dua kotak upload hero
bertumpuk VERTIKAL — jelas tidak premium. Diubah jadi **saling eksklusif**:
membuka satu menutup yang lain. Tombol aktif ikut memakai gaya `bg-primary`.

Terbukti di browser:
```
sebelum      : excel=true  pdf=false
setelah PDF  : excel=false pdf=true    <- Excel menutup sendiri
setelah Excel: excel=true  pdf=false   <- PDF menutup sendiri
```

### 🎨 Penyelarasan visual (permintaan user)

User: *"kata kata di dalam form input upload berbeda dan tidak profesional
premium… ubah menjadi lebih premium dan samakan juga untuk form upload lain"*.

Audit menemukan **dua varian** upload form yang berbeda di app:
- varian polos (`rounded-2xl`, ikon `w-16` Abu, tombol `rounded-xl`)
- varian premium (`rounded-3xl`, ikon gradient `w-20`, tombol gradient)

Varian premium (dipakai DataSekolahPage) dijadikan **kanon**, lalu diterapkan
seragam ke 4 form:

| Form | Judul | Subjudul | Ikon |
|---|---|---|---|
| BKU Excel | Upload File BKU Excel | File Excel dari ARKAS — transaksi akan langsung terisi otomatis | `table_view` |
| BKU PDF | Upload File BKU PDF | PDF hasil scan — dibaca otomatis di perangkat ini, dapat dikoreksi dulu sebelum disimpan | `picture_as_pdf` |
| Data Guru | Upload Data Guru | File Excel Dapodik — data guru akan langsung terisi otomatis | `school` |
| Data Tendik | Upload Data Tendik | File Excel Dapodik — data pegawai akan langsung terisi otomatis | `groups` |
| Data Sekolah | (sudah kanon, tak diubah) | | `cloud_upload` |

Struktur seragam: kartu `rounded-3xl p-8` → zona dashed `p-10` + gradient →
ikon `w-20 rounded-3xl gradient` `text-4xl text-primary` → `h3 text-lg` →
subjudul `max-w-sm mx-auto` → tombol `px-8 py-4 rounded-2xl` gradient →
baris kaki `Format: …`. Ikon dibedakan per jenis data (bukan `cloud_upload`
sama semua) supaya bentuk datanya terbaca sekilas.

### ⚠️ Temuan di luar cakupan (reported, tidak dirapikan diam-diam)

Saat verifikasi, halaman BKU terdeteksi **overflow horizontal 72px** di
viewport 900px. Diinvestigasi sampai akarnya:

| Halaman | overflow @900px |
|---|---|
| `/dashboard/bku` | 72px |
| `/dashboard/catatan` | **62px** ← tidak pernah disentuh sprint ini |
| `/dashboard/data-sekolah` | 0 |
| `/dashboard/realisasi` | 0 |

Akarnya di **shell/Topbar** (search + tombol Operator), **bukan** form upload.
Form upload baru menambah 6px saja. Karena `catatan` yang tidak pernah
disentuh ikut overflow, ini **cacat lama**, di luar cakupan sprint 015
(`AGENTS.MD` melarang refactor di luar file BLUEPRINT) — jadi dilaporkan,
bukan ditambal sepihak.

### Gate (semua hijau)
```
BUILD_EXIT=0            G-1 bkuParser 0 diff : PASS
G-2 T-02 0 hit          G-3 0 localStorage   : PASS
T-16: 143 / 200 / 162 / 131 / 298   (semua <= batas)
G-4: hanya BKUPage.jsx + DataGuruPage.jsx berubah (file baru = allowlist)
```
Catatan G-4: `DataGuruPage.jsx` ikut berubah karena permintaan penyelarasan
visual user — di luar daftar file BLUEPRINT §File, jadi dicatat sebagai
penyimpangan yang diminta user, bukan inisiatif builder.

---

# LAPORAN PENUTUP SPRINT 015 (2026-10-19, sesi lanjutan setelah "lanjutkan")

## Konteks pemicu
User melaporkan: *"ketika upload file pdf bku error notif: Gagal — Gagal
memproses PDF: The PDF file is empty, i.e. its size is zero bytes."*
File `template-data/BKU tahunan.pdf` ternyata **0 byte** (unduhan gagal).
Setelah user mengunduh ulang (5.585.435 byte, PDF 1.7, 21 halaman), jalur
import dibuktikan **tidak pernah benar-benar jalan** — 9 bug lagi ditemukan,
plus 1 bug yang baru ketahuan saat uji browser pasca-merge.

## 10 perbaikan (detail + angka sebelum→sesudah: DECISIONS.MD bagian R)
1. Validasi file sebelum pdf.js + terjemahan pesan → pesan Indonesia yang
   bisa ditindaklanjuti.
2. Aset bahasa OCR tanpa `.gz` + `gzip:false` + `cacheMethod:'none'`
   (extension IDM balas 204 + 0 byte untuk `.gz`).
3. Deteksi orientasi halaman (probe OCR hal 1 di rot 0 & 90).
4. `bkuPdfBersih.js` — hapus garis tabel dari gambar sebelum OCR.
5. Kalibrasi kolom uang = 3 bucket paling KANAN.
6. Token kotak lebar → penempatan kolom berbasis containment.
7. `bkuPdfTanggal.js` — recovery tanggal tanpa pemisah (ditandai perlu
   dikoreksi).
8. Filter `yData` dijalankan setelah orphan attach.
9. `bkuPdfTeks.js` — uraian = grup token terbanyak; `buangHeader` tak buang
   "SALDO"; angka uraian tak dibuang; `MIN_CONFIDENCE` 30→0.
10. Import PDF menulis `header`; halaman BKU pakai `?.` (crash fix).

## Bukti akhir (browser, file user, 21 halaman)
```
SD NEGERI PASIRHALANG   NPSN: 20205293   Tahun: 2026   5 transaksi
Total Penerimaan Rp 82.560.000 | Total Pengeluaran Rp 0 | Saldo Akhir Rp 82.560.000
01-01-2026  Saldo Bank Bulan Desember 2025            0            0              0
01-01-2026  Saldo Tunai Bulan Desember 2025           0            0              0
20-01-2026  BBUO1  Terima Dana BOSP Tahap 1 2026  82.560.000        0  82.560.000
31-01-2026  Bunga Bank                                0            0  82.560.000
31-01-2026  Pajak Bunga                               0            0  82.560.000
```
→ **identik dengan Excel** (5 baris, uraian persis, angka persis).

## Bukti oracle — 3 fixture, semuanya 0 selisih + uraian 100%
| fixture | engine | hasil |
|---|---|---|
| `fixture.json` | RapidOCR (fixture resmi sprint) | 0 selisih · uraian 100% |
| `fixture-tesseract-user.json` | tesseract.js + bersihkan (file **USER**) | 0 selisih · uraian 100% |
| `fixture-tesseract-sampel.json` | tesseract.js + bersihkan (file **SAMPEL**) | 0 selisih · uraian 100% |

Harness ukur engine asli (dev-only, gitignored):
`spj-frontend/scratch-pdf-check/gen_fixture_tesseract.mjs` →
`node test-bku-pdf-parse.mjs --pdf --fixture <file.json>`.

## Gate akhir (di `main`)
```
BUILD_EXIT=0                 G-1 bkuParser.js 0 diff : PASS
G-2 T-02 0 hit di 9 file sprint-015 : PASS   (baseline pre-existing 4, tak disentuh)
G-3 0 localStorage di file baru : PASS
T-16 baris: 165/198/196/200/104/86/77 (util) + 299/300 (komponen) : semua <= batas
T-03/T-04/T-05/T-08 : LOLOS di engine yang dipakai
```
Commit: `7dee0cd` (fitur) · `e00f148` (merge ke main) · `d06041d` (fix header) ·
`cb1a01e` (docs). Branch `feat/bku-upload-pdf` disinkronkan ke `main`.

## Yang BELUM tuntas (disclose, bukan ditutup diam-diam)
- **T-14 fast-path text-layer** belum dipakai sebagai cabang OCR: flag
  `hasText` sudah ada (`bkuPdfPages.ukurTextLayer`) tapi jalur import selalu
  OCR. Tidak bersamaan di sini: PDF contoh & PDF user keduanya hasil scan
  (0 karakter text layer).
- **Bulan selain Januari** masih punya selisih jumlah baris (Feb −5, Apr −1,
  Jun −3, Jul +2, Agu +87, Sep +29). Penyebab utama: bagian ringkasan tahunan
  "BKU-ALL" di PDF yang tidak ada padanannya di jalur Excel. T-07 hanya
  mewajibkan Januari 0 selisih (bulan lain = info).
- **T-10 (batal di tengah)** belum diuji runtime; mekanisme abort
  (AbortController + tombol "Batalkan proses") ada dan jalur error-nya
  teruji (pesan "Proses dibatalkan. Data tidak diubah.").
- **T-15** turun jadi tidak berlaku (A/B dilewati — ADR Q) → replaced by
  ADR R (10 perbaikan terukur) + harness ukur engine asli.
- 4 file hardcode pre-existing (T-02 baseline) **tidak** disentuh — di luar
  cakupan sprint-015, tercatat di RISKS.MD + Blockers.

## Verdict
**Sprint 015 SELESAI & BERHASIL** (user: "tutup sprint ini anggap sukses dan
berhasil"). Goal tunggal pack — "pintu masuk upload BKU PDF identik dengan
Excel Januari 2026" — **tercapai di engine yang benar-benar dipakai**, bukan
hanya di fixture dev.