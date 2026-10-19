# ACCEPTANCE CRITERIA — Sprint 015: Import BKU PDF (OCR)

> Format: Bab 8.4 Dokumen 3 + aturan Task Gate. Kriteria yang butuh browser
> runtime ditandai [RUNTIME] — dieksekusi oleh /acceptance-runner konteks
> segar. Kriteria command murni bisa dijalankan di sesi builder apa pun.
>
> **REVISI 2026-10-19 v2 (review pack + verifikasi langsung ke repo)**
> 9 cacat dikoreksi; daftar kriteria **T-01..T-16 + E-1/E-2 TETAP** (tidak
> ada yang ditambah/dihapus). Yang diperbaiki:
> - **A1** T-01: `… | tail -3; echo EXIT=$?` **selalu hijau palsu** (menangkap
>   exit `tail`, bukan `npm`). Diganti `$LASTEXITCODE` langsung.
> - **A2** Semua perintah ditulis ulang ke **PowerShell 5.1 + `rg`**. `bash`
>   tidak ada di PATH mesin ini → `grep`/`wc`/`tail`/`ls` tidak bisa dipakai.
> - **A3** T-02: 15 pola **dituliskan lengkap di dokumen ini** (sebelumnya
>   hanya "format sprint lama" — acceptance fresh tidak bisa menjalankannya).
> - **A4** T-12/Mekanisme reuse: `detectTransactionType` **tidak terekspor**
>   (`bkuParser.js:156`) → kriteria diubah ke `redetectTypes()` (`:654`).
> - **A5** T-09: TransactionRow = **17 field**, bukan 16.
> - **A6** T-16: path `pencatatan/` → `components/bku/` + penghitung baris PS.
> - **A7** T-15: "A/B T-21" dibedakan dari test ID T-01..T-16.
> - **A8** T-03/T-06/T-07: cwd `spj-frontend` (oracle butuh `xlsx`).
> - **A9** T-08: akurasi uraian diukur **seluruh halaman Januari**, bukan
>   hanya halaman 1 (halaman-1-saja = gate lemah, parser bisa lulus katak
>   di separuh bulan).
> **A11** T-07 tadinya "Jan..Des" — **Excel hanya Jan–Jun 2026** (300 baris,
>   rentang `2025-12-31 → 2026-06-29`). TARGET keras hanya Januari;
>   Feb–Jun = info; Jul–Des = `N/A`.
> - **A10** **G-3 tidak bisa "0 hit total"** — pola `localStorage\.(get|set)`
>   ikut cocok `getItem`/`setItem`; baseline **24 hit / 12 file** (pola longgar
>   `localStorage\.` = **34 hit / 16 file**), semuanya sudah di `main`.
>   Diubah jadi **delta vs `main`** + 0-hit wajib di 4 file baru sprint ini.
>
> **Konteks mesin (terverifikasi 2026-10-19):** Node **v24.19.0** / npm
> **11.17.0** · PowerShell **5.1** · `bash` **tidak ada** · `rg` ada ·
> Python **3.14** + `rapidocr_onnxruntime` **1.2.3** import_OK.

## TASK GATE (cek DoD per task, TERMASUK DSA — wajib hijau SEBELUM kriteria sprint dinilai)

- [ ] Semua task Fase 0..4 (21 task) punya DoD hijau + output di-paste (bukti
      per task, bukan klaim)
- [ ] **G-1** `git diff --stat -- spj-frontend/src/utils/bkuParser.js`
      → output kosong (file TABU)
- [ ] **G-2** T-02: 15 pola hardcode (`rg -i`) → 0 hit
- [ ] **G-3** `git diff main -- spj-frontend/src | rg -n "localStorage\."`
      → **0 hit** (lihat catatan baseline di bawah)
- [ ] **G-4** `git diff --stat main` → hanya file di allowlist BLUEPRINT §G-4
- [ ] DSA line hadir & konsisten di task hot-path (1.5, 3.3)

## Definisi "Selesai"

Sprint SELESAI bila: seluruh kriteria T-01..T-16 hijau (statik/terminal
dan/atau runtime), Task Gate hijau, ADR engine tersimpan berangka,
dan STATE.MD diperbarui. Kriteria runtime dieksekusi acceptance-runner.

> ⚠️ **Dua kumpulan ID** — jangan ketuker:
> `T-01..T-16` = **test ID sprint ini** (dokumen ini).
> `T-00/T-01/T-10/T-20/T-21/T-22/T-30/T-31/T-32/T-40/T-41/T-42/T-50` =
> **task ID MODULE-PLAN.md** (bahan berangka, bukan kriteria).
> Saat keduanya muncul, sebut eksplisit: "T-21 (MODULE-PLAN M2 = BLUEPRINT
> task 2.2)". `T-01` & `T-10` & `T-21` **ada di kedua daftar** — beware.

## Kriteria (T-01..T-16, E-1/E-2)

**T-01 — Build hijau** [STATIK]
- Given: working tree berisi implementasi BLUEPRINT
- When (PowerShell, dari root repo):
  ```powershell
  Push-Location spj-frontend
  npm run build; $sb = $LASTEXITCODE
  Pop-Location
  Write-Output "BUILD_EXIT=$sb"
  ```
- Then: `BUILD_EXIT=0` + baris `✓ built in` **dan jumlah modul** tercatat
- ⚠️ **Jangan** pakai `$?` seperti di bash (`npm run build | tail -3; echo
  $?` → hijau palsu: `$?` bash = exit `tail`, selalu 0). Di PowerShell
  `$LASTEXITCODE` benar even dengan pipe (terbukti 2026-10-19: kontrol
  negatif `node -e "process.exit(7)"` → `$LASTEXITCODE = 7`), tapi bentuk
  tanpa pipe tetap dipakai karena eksplisit.

**T-02 — Anti-hardcode 15 pola** [STATIK]
- Given: file baru `bkuPdf*.js`, `BKUUploadPdf.jsx`, `BKUPage.jsx`
- When (PowerShell, dari root repo) — **15 pola, case-insensitive wajib**:
  ```powershell
  rg -ni "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src
  Write-Output "T-02_EXIT=$LASTEXITCODE"   # 0 = ada hit, 1 = 0 hit (BERSIH)
  ```
  ⚠️ **JANGAN pakai `-E`** — pada ripgrep `-E` berarti `--encoding`, bukan
  "extended regex" → `rg: unknown encoding: ...` dan gate **selalu gagal**.
  Regex di ripgrep sudah aktif secara default. (Terbukti salah saat verifikasi
  pack ini — koreksi A2.)
- Then: **0 hit BARU** — aturan baseline lengkap di bawah.
- Verifikasi tambahan — aset tidak ikut terjaring (harus 0):
  ```powershell
  (rg -ni "<15 pola di atas>" spj-frontend/src | rg -i "sourceFile" | Measure-Object).Count   # → 0 (TERUKUR 0)
  ```
- **Cakupan 15 pola** (diteruskan dari Sprint 001 v3 — JANGANG ditambah/
  dikurangi tanpa alasan tertulis): 5 nama orang · 5 NIP · 2 NPSN ·
  2 nama sekolah · 1 literal kabupaten (`PEMERINTAH KABUPATEN`).
- **Sengaja BUKAN pola** (jangan "diperbaiki" builder): `Mandalamukti`
  (mock data demo), `Cikalongwetan`/literal tempat-tanggal (di luar cakupan,
  OPEN di `QUESTIONS.MD`), `SDN-PSR` (`NomorSuratPopup.jsx`).
> 📌 **BASELINE TERUKUR 2026-10-19 = 4 hit, semuanya PRE-EXISTING di `main`.**
> Catatan: `STATE.MD` 2026-10-18 hanya mencatat 2; Sprint 014 menambah 2 lagi.
>
> | # | File:baris | Isi | Asal |
> |---|---|---|---|
> | 1 | `blocks/KopGugus.jsx:17` | literal kabupaten hardcode | warisan (ADR F-4) |
> | 2 | `blocks/SignatureFooter.jsx:8` | komentar nama sekolah | warisan |
> | 3 | `blocks/CoverHeader.jsx:14` | komentar nama kabupaten | Sprint 014 |
> | 4 | `utils/exportPajakExcel.js:29` | fallback nama sekolah | Sprint 014 |
>
> **Aturan penilaian (WAJIB):** T-02 dinilai pada **selisih vs `main`**:
> ```powershell
> git diff main -- spj-frontend/src | rg -ni "<15 pola di atas>"   # harus → 0 hit
> ```
> Builder **dilarang** menyentuh 4 file di atas (di luar cakupan sprint-015)
> dan **dilarang** menurunkan/menggeser target supaya "total 0" — 4 hit itu
> fakta baseline, bukan regresi sprint ini. Membukanya = **tugas sprint
> tersendiri** dengan pack sendiri.

**T-03 — Jumlah transaksi Januari IDENTIK**
- Given: fixture 21/21 halaman + oracle `spj-frontend/test-bku-pdf-parse.mjs`
- When (cwd = `spj-frontend`):
  ```powershell
  Push-Location spj-frontend; node test-bku-pdf-parse.mjs --pdf; Pop-Location
  ```
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
- When: `node test-bku-pdf-parse.mjs --reconcile` (cwd `spj-frontend`)
- Then: `saldo awal + masuk − keluar = saldo akhir` → `ok: true`;
  selisih sekecil apapun → `mismatches[]` terisi (bukan diam)

**T-07 — Semua bulan yang ada (profil penuh)** [STATIK]
- ⚠️ **Koreksi A11 (terbukti 2026-10-19):** versi lama menyebut
  "Jan..Des". **Excel baseline hanya berisi Jan–Jun 2026** (rentang
  `2025-12-31 → 2026-06-29`, 300 baris,distribution:
  Jan 5 · Feb 106 · Mar 35 · Apr 118 · Mei 8 · Jun 28). **Bulan Jul–Des tidak
  ada pembanding** → tidak bisa dinilai. PDF 21 halaman 可能 memuat Jul–Des,
  tapi itu tidak bisa diuji tanpa oracle.
- Given: oracle --pdf full 21 halaman
- When: `node test-bku-pdf-parse.mjs --pdf --all-months` (cwd `spj-frontend`)
- Then: **tiap bulan Jan..Jun** mencetak pasangan angka PDF vs Excel;
  **Januari wajib 0 selisih** (target keras); Feb–Jun dilaporkan sebagai
  **info** (target keras TIDAK Berlaku ke sana). Bulan tanpa data Excel
  (Jul–Des) printed sebagai `N/A — tidak ada pembanding`, bukan `0`.
- Angka acuan yang sudah terukur (Extraction 2026-10-19, kolom benar
  `bkuParser.js:39-48` — catatan: indeks kolom SALDO = **19**, bukan 18):
  | Besaran | Nilai |
  |---|---|
  | jumlah Januari | **5 baris** |
  | masuk Januari | **Rp 82.560.000** |
  | keluar Januari | **Rp 0** |
  | saldo akhir Januari | **Rp 82.560.000** |

**T-08 — Akurasi uraian ≥ 90%**
- Given: fixture utuh + uraian Excel per baris **seluruh halaman Januari**
- When: bagian oracle pengukuran string-match (normalisasi: lowercase,
  collapse spasi, buang tanda baca)
- Then: `akurasi uraian Januari: >= 90%` tercetak, **dan** tabel per halaman
  ikut tercetak (aggregate saja tidak sah — koreksi A9)
- Pengecualian yang **tidak boleh** dipakai untuk menaikkan angka: baris
  bertanda `excluded` dihitung sebagai tidak-cocok, bukan dihapus dari penyebut.

**T-09 — Storage & bentuk baris identik**
- Given: implementasi tulis-commit (Q4 DATA-MODEL)
- When (PowerShell, dari root repo):
  ```powershell
  # (a) 0 akses localStorage langsung di file baru sprint ini → WAJIB 0 hit
  rg -n "localStorage\." spj-frontend/src/utils/bkuPdfPages.js spj-frontend/src/utils/bkuPdfOcr.js spj-frontend/src/utils/bkuPdfParser.js spj-frontend/src/components/bku/BKUUploadPdf.jsx
  # (b) delta vs main → WAJIB 0 hit (baseline 24 hit/12 file sudah di main)
  git diff main -- spj-frontend/src | rg -n "localStorage\."
  ```
- Then: (a) semua key berawalan `spj_` dan **0** akses `localStorage`
  langsung di file baru (semua lewat `storageHelper`); (b) tiap baris
  tertulis punya **17 field** yang **persis** sama dengan
  `bkuParser.js:346-366` — `row, tanggal, tanggalStr, tanggalISO, bulan, tahun,
  kodeKegiatan, kodeRekening, noBukti, uraian, penerimaan, pengeluaran, saldo,
  debet, kredit, tipe, kategori` — **0 field asing** (mis. **tidak ada**
  `source:'pdf'`)
- Bukti: `Set of keys PDF` === `Set of keys Excel` dicetak oracle.

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

**T-12 — tipe/kategori hasil REUSE (bukan salin)** [STATIK]
- ⚠️ **Koreksi A4.** Preskripsi lama ("import `detectTransactionType`")
  **tidak bisa dijalankan**: fungsi itu `bkuParser.js:156` (dan
  `detectKategoriBelanja` `:217`) **tidak punya kata kunci `export`** —
  `function` biasa level modul. Import akan crash; menambahkan `export`
  berarti mengubah file TABU (G-1).
- When (dari root repo):
  ```powershell
  rg -n "redetectTypes" spj-frontend/src/utils/bkuPdfParser.js       # → ≥1 hit
  rg -n "detectTransactionType|detectKategoriBelanja" spj-frontend/src/utils/bkuPdfParser.js   # → 0 hit (tidak ada redefinisi/salin)
  git diff --stat -- spj-frontend/src/utils/bkuParser.js            # → kosong
  ```
- Then: `bkuPdfParser.js` memakai **API publik `redetectTypes()`**
  (`bkuParser.js:654`) yang memanggil logika internal yang sama → hasil
  identik jalur Excel, `bkuParser.js` 0 diff, dan **tidak ada** definisi
  ulang `detectTransactionType`/`detectKategoriBelanja` di file baru.

**T-13 — Fallback jujur** [RUNTIME]
- Given: input file non-PDF (.xlsx) / PDF percobaan OCR gagal
- When: upload dicoba
- Then: pesan "gunakan jalur Excel" muncul; tidak ada penulisan data;
  console tidak error

**T-14 — Fast-path text-layer (PDF ber-text-layer)** [STATIK]
- Given: modul `bkuPdfPages.js`
- When: unit node: halaman dummy ber-text-layer > ambang
- Then: flag `hasText=true` dikembalikan tanpa mengalami OCR
- Catatan: fixture contoh **0 char text-layer** di 21/21 halaman (terverifikasi
  2026-10-19 via pdfjs `getTextContent`) → jalur ini **tidak** ter-cover
  fixture; wajib diuji dengan PDF dummy buatan sendiri.

**T-15 — ADR engine berangka tersimpan**
- Given: A/B **task 2.2** (= T-21 MODULE-PLAN M2) selesai
- When: baca `DECISIONS.MD` bagian ADR terakhir
- Then: ada tabel akurasi minimum 2 baris (paddleocr-js 0.4.2 vs
  tesseract.js 7.0.0) + nama pemenang + versi pin; pilihan berangka
  angka bukan opini
- Plus: engine kalah **tidak** ada di `package.json` dan `rg` 0 sisa
  referensinya.

**T-16 — Batas baris BLUEPRINT**
- When (PowerShell, dari `spj-frontend`):
  ```powershell
  foreach ($f in @(
    'src/utils/bkuPdfPages.js','src/utils/bkuPdfOcr.js','src/utils/bkuPdfParser.js',
    'src/components/bku/BKUUploadPdf.jsx')) {
    "{0,-40} {1}" -f $f, (Get-Content $f | Measure-Object -Line).Lines
  }
  ```
- Then: 3 util pertama **≤ 200** baris; `BKUUploadPdf.jsx` **≤ 300** baris
- ⚠️ Path `src/components/pencatatan/` **tidak ada** — pakai
  `src/components/bku/` (koreksi A6).

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
  1 baris → simpan → tabel BKU memuat data Januari
- Terminal: `node test-bku-pdf-parse.mjs --pdf` (cwd `spj-frontend`) →
  `selisih: 0` + `akurasi uraian Januari: >= 90%` + tabel per halaman

## Bukti Verifikasi Pack Ini (2026-10-19, sebelum disetujui)

Semua klaim pack di bawah **diperiksa langsung ke repo/node/npm**, bukan
dibaca dari dokumen:

| Klaim pack | Hasil |
|---|---|
| PDF contoh 21 halaman | ✅ `numPages: 21` (pdfjs) |
| PDF tanpa text layer | ✅ `getTextContent()` = **0 char** di 21/21 halaman |
| Excel oracle terbaca | ✅ sheet `Page1`, range `A1:X365` |
| `pdfjs-dist 4.10.38` terpasang | ✅ `package.json` pin eksak |
| `xlsx 0.18.5`, `react 18.3.1` | ✅ pin eksak, tanpa `^` |
| `@paddleocr/paddleocr-js 0.4.2` ada | ✅ `npm view` → 0.4.2 |
| `tesseract.js 7.0.0` ada | ✅ `npm view` → 7.0.0 |
| `rapidocr-onnxruntime 1.2.3` terpasang | ✅ `pip show` + `import` OK (Python 3.14) |
| Route `/dashboard/bku` | ✅ `App.jsx:57` |
| `redetectTypes` terekspor | ✅ `bkuParser.js:654` (jalur reuse — koreksi D1) |
| `detectTransactionType` **tidak** terekspor | ✅ `bkuParser.js:156` — blocker, sudah dikoreksi |
| `src/components/pencatatan/` | ❌ **tidak ada** → `components/bku/` (koreksi D3) |
| `scratch-pdf-check/` | ❌ **tidak ada** (dihapus reset 013) → ditulis ulang (koreksi D2) |
| Baseline T-02 | **4 hit pre-existing** (bukan 2) — semua di `main` |
| Aset ikut terjaring T-02 | ✅ **0** |
| `bash` tersedia | ❌ **tidak ada** → semua gate ditulis ulang PowerShell + `rg` |
| Baseline G-3 (`localStorage.`) | **34 hit / 16 file** — identik di `main` → dinilai via delta |
| Baseline T-02 (`git diff main`) | ✅ **0 hit** (4 hit lama semuanya pre-existing) |
| Node / npm | `v24.19.0` / `11.17.0` |

> ⚠️ **1 hal masih terbuka (bukan cacat pack, tapi wajib diketahui):**
> `template/contoh format BKU-PDF tahunan.pdf` (5,4 MB) saat ini **untracked**
> di git (`git status` → `??`). Sprint 015 bergantung penuh pada file ini.
> Jika repo di-clone ulang, file hilang → sprint **tidak bisa dijalankan**.
> Commit file contoh (atau sediakan lokasi pengganti) = keputusan user.
