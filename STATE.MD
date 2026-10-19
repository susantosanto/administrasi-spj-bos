# STATE.MD — Status Proyek

## Informasi Proyek
- Nama: spj-app (Aplikasi LPJ BOS/BOSP)
- Mulai (titik adopsi workflow): 2026-09-13

## Status Saat Ini
- **2026-10-19 — Sprint 015 (Import BKU PDF OCR): SUDAH JADI — import PDF hasil scan = identik Excel (Januari 0 selisih, uraian 100%) DI ENGINE YANG DIPAKAI (tesseract.js).** Awalnya user lapor *"Gagal memproses PDF: The PDF file is empty"*. Penyebabnya BERANTAI — 9 bug, semua diperbaiki + diverifikasi browser & oracle:
  1. **File 0 byte** (`template-data/BKU tahunan.pdf` = 0 byte, unduhan gagal) → pdf.js melempar exception teknis Inggris. Fix: validasi awal `periksaFilePdf()` + `headerPdfValid()` di `bkuPdfPages.js` → pesan Indonesia *"File PDF kosong (0 byte) — file belum terunduh sempurna atau rusak. Unduh ulang dari sumber…"* + `pesanGagalPdf()` terjemahan pesan pdf.js. **Bukti: toast baru tampil, preview tidak muncul, data tak berubah.**
  2. **Data bahasa OCR tidak termuat** — IDM "Advanced Integration" (extension browser) membalas **204 + body 0 byte** untuk `/tesseract/lang/ind.traineddata.gz` → tesseract tulis `./ind.traineddata` kosong → *"Error opening data file ./ind.traineddata"*. Fix: `gzip:false` + `cacheMethod:'none'`, aset disajikan sebagai `ind.traineddata` (isi tetap gzip — tesseract.js deteksi magic 1F 8B sendiri, `worker-script/index.js:161-166`). **Bukti: 200 / 3.847.026 byte, OCR jalan 21/21 halaman.**
  3. **Kalibrasi kolom salah** — `kalibrasiNominal()` mengurutkan puncak menurut JUMLAH lalu langsung mengurutkan ulang menurut x dan mengambil 3 bucket paling KIRI; peringkat jumlah jadi kode mati → tebakan acak x=220/480/600, bukan kolom uang. Fix: 3 bucket paling KANAN (kolom uang = 3 kolom TERAKHIR tabel BKU, bersebelahan) → kode rekening "5102020100" (65 hit) kalah dari kolom uang. **Bukti: edges → 1840/2040/2220; RapidOCR tetap 0 selisih.**
  4. **Token kotak lebar salah kolom** — OCR menggabung 2 sel jadi 1 kotak ("82560000" w=320px) → tepi-kanan jatuh di kolom sebelah. Fix: token milik kolom X kalau tepi X ada DI DALAM kotaknya (paling kiri kalau beberapa). **Bukti: masuk Januari 0 → Rp 82.560.000.**
  5. **Baris hilang diam-diam** — tesseract sering kehilangan pemisah tanggal ("01-01-2026"→"01012026)", "20-01-2026"→"20-012028)/") → regex berpemisah tidak kena → baris utuh hilang. Fix: modul baru `bkuPdfTanggal.js` (tanggal tanpa pemisah 8/6/7 digit + noise trailing), setiap tebakan ditandai `pasti:false` → problem `tanggal_perlu_dikoreksi` + ring biru di kolom tanggal preview. **Bukti: Januari tesseract 0 baris → 3 baris; uji `test-bku-tanggal.mjs` 13/13 PASS.**
  6. **Rotasi halaman hardcode 90** — BKU RKAS bisa TEGAK (halaman landscape) atau MENYAMPING (isi diputar 90° di halaman portrait). File user = landscape 842×595 teks tegak; file sampel repo = portrait 595×842 teks miring. Rotasi salah → semua karakter miring (conf-rata 62.6 → 28.7) & 0 transaksi. Fix: `deteksiOrientasiHalaman()` (bkuPdfOcr.js) — probe OCR halaman 1 pada rotasi 0 & 90, ambil confidence rata-rata lebih tinggi; item halaman 1 dipakai ulang. **Bukti: file user → rotasi 0 (skor 0.626 vs 0.287).**
  7. **Garis tabel mengotori OCR** — tesseract baca garis sbg "|" & menggabung 2 sel jadi 1 kotak ("op" w=557px) → uraian tercemar, kolom ketuker. Fix: modul baru `bkuPdfBersih.js` — hapus run pixel gelap ≥90 px (garis tabel) dari gambar SEBELUM OCR; tanpa dependensi baru. **Bukti (hal 1): noise 22→4, tanggal terbaca 8→14, kotak gabungan 5→0, conf 62.6→80.8.**
  8. **Baris header menempel** — baris "1 2 3 4 5 6 7 8" (40 px di atas jangkai pertama, masih < JEND_ORPHAN) ikut menempel ke baris data pertama. Fix: filter yData dijalankan SETELAH orphan attach.
  9. **Kata uraian terpotong + angka uraian dibuang** — "celah x terbesar" memotong kata pertama uraian (celah antar-kata "Desember"→"2025" = 107 px > celah antar-kolom 99 px); kata "SALDO" ikut terbuang oleh filter header; angka "Tahap 1"/"2026" dibuang sbg nominal. Fix: pecah kolom teks pindah ke modul baru `bkuPdfTeks.js` (URAIAN = grup token TERBANYAK); `buangHeader` tak lagi membuang "SALDO"; angka uraian tidak dibuang (hanya kolom uang, diposisi, yang dikeluarkan). Plus `MIN_CONFIDENCE` 30 → **0** (tesseract beri confidence 0.0/0.0/13.0 utk 3 nilai SALDO yang BENAR di render rotasi 90 — ambang 30 membuangnya).
  **HASIL (browser, file user `template-data/BKU tahunan.pdf`):** *"5 baris akan disimpan · Masuk Rp 82.560.000 · Keluar Rp 0 · Saldo Rp 82.560.000"* — 5 baris (Excel 5), uraian PERSIS ("Saldo Bank Bulan Desember 2025", "Saldo Tunai Bulan Desember 2025", "Terima Dana BOSP Tahap 1 2026", "Bunga Bank", "Pajak Bunga"), angka PERSIS. **Oracle (`test-bku-pdf-parse.mjs --pdf --fixture`):** 3 fixture — RapidOCR (resmi sprint) 0 selisih + uraian 100% · tesseract+bersih file USER 0 selisih + uraian 100% · tesseract+bersih file SAMPEL 0 selisih + uraian 100% → **T-03/T-04/T-05/T-08 LOLOS di engine yang benar-benar dipakai.** Build exit 0 · G-1 `bkuParser.js` 0 diff · G-3 0 hit · baris file: bkuPdfLayout 165/200 · bkuPdfOcr 200/200 · bkuPdfPages 196/200 · bkuPdfParser 191/200 · bkuPdfTanggal 104/200 · bkuPdfTeks 86/200 · bkuPdfBersih 77/200 · BKUUploadPdf 299/300.
  **SISA (bukan target hard sprint):** bulan Feb/Apr/Jun/Jul/Agus/Sep masih ada selisih jumlah baris (Agus +87, Sep +29 → bagian "BKU-ALL" ringkasan tahunan di PDF yang tak ada padanannya di jalur Excel). T-07 hanya mewajibkan Januari 0 selisih; bulan lain = info. Harness ukur engine asli: `spj-frontend/scratch-pdf-check/gen_fixture_tesseract.mjs` (dev-only, gitignored) → `node test-bku-pdf-parse.mjs --pdf --fixture <file.json>`.
  Regresi: build exit 0 · oracle RapidOCR 0 selisih + uraian 100% · `test-bku-tanggal.mjs` 13/13 · baris file: bkuPdfLayout 200/200 · bkuPdfOcr 186/200 · bkuPdfPages 196/200 · bkuPdfParser 187/200 · bkuPdfTanggal 104/200 · BKUUploadPdf 299/300. `bkuParser.js` (TABU) = 0 diff.
- **2026-10-19 — Sprint 015 (Import BKU PDF OCR): PACK v2 DIREVIEW + DIKOREKSI, siap approval user.** Review 4 dokumen (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT) + bahan (PRD · DATA-MODEL · MODULE-PLAN) dengan verifikasi langsung ke repo/node/npm — **14 cacat ditemukan & dikoreksi, 0变了 requirements** (isi, 21 task, T-01..T-16 + E-1/E-2 semua tetap). **2 BLOCKER:** (1) BLUEPRINT task 1.3 + MODULE-PLAN T-32 + ACCEPTANCE T-12 menyuruh "IMPORT EXPLICIT `detectTransactionType`" — tapi fungsi itu `bkuParser.js:156` & `detectKategoriBelanja` `:217` **tidak punya `export`** (terbukti) → import mustahil, dan menambah `export` = ubah file TABU (G-1). Diganti **`redetectTypes()`** (`:654`, sudah export, memanggil logika internal yg sama; precedent `BKUPage.jsx:6,152`) → 0 diff, 0 salin. (2) `scratch-pdf-check/gen_fixture_rest.py` **sudah DIHAPUS** saat reset 013 tapi pack menyebut "existing" + bootstrap `ls` itu → task 0.1 ditulis ulang jadi "tulis ulang generator". **4 HIGH:** `src/components/pencatatan/` tidak ada → `components/bku/` (sibling `BKUSidebar.jsx`); SEMUA perintah gate bash (`grep`/`wc`/`tail`/`ls`) tak jalan — mesin ini **PowerShell 5.1 tanpa `bash`**, hanya ada `rg` → ditulis ulang; **`rg -E` = `--encoding`, bukan regex** (sudah terbukti gate gagal) → harus `rg -n`; **G-3 mustahil 0-hit** — pola `localStorage\.(get|set)` ikut cocok `getItem`/`setItem`, baseline **24 hit/12 file** (longgar `localStorage\.` = 34/16), semua sudah di `main` → dinilai **delta vs `main`** + 0-hit wajib di 4 file baru. **6 MEDIUM/LOW:** T-01 `…|tail; echo $?` = hijau palsu (tangkap exit `tail`) → `$LASTEXITCODE` langsung; T-09/DATA-MODEL "16 field" → **17** (hitung ulang `bkuParser.js:346-366`); "T-21" bentrok antara test ID vs MODULE-PLAN task ID → dibedakan; total "17 satuan ≈5,5 jam" → **21 task ≈7,75 jam** (Σ 465 mnt); path oracle dipin `spj-frontend/` (butuh `xlsx`); G-4 tambah allowlist `package.json`+`package-lock.json` (A/B engine wajib ubah keduanya); paragraf aturan engine terduplikasi dipangkas; T-08 akurasi diukur **seluruh halaman Januari** (bukan halaman 1 saja = gate lemah); `rapidocr-onnxruntime` 1.2.3 **terverifikasi benar**: `pip show` OK + `import rapidocr_onnxruntime` exit 0 + kelas `RapidOCR` tersedia (Python 3.14) → prasyarat OCR dev siap, TIDAK perlu reinstall. **TERVERIFIKASI BENAR:** PDF 21 hal + 0 char text-layer · Excel `Page1 A1:X365` · `pdfjs-dist 4.10.38`/`xlsx 0.18.5`/`react 18.3.1` pin eksak · `@paddleocr/paddleocr-js 0.4.2` + `tesseract.js 7.0.0` ada di npm · route `/dashboard/bku` (`App.jsx:57`) · **baseline T-02 = 4 hit pre-existing** (bukan 2 — Sprint 014 nambah `CoverHeader.jsx:14` + `exportPajakExcel.js:29`), delta-vs-main = 0 ✅ · aset `sourceFile` = 0 ✅. **2 hal butuh keputusan user:** (a) `template/contoh format BKU-PDF tahunan.pdf` 5,4MB **untracked** — clone ulang = sprint mati; (b) 4 hit T-02 residual di luar cakupan → buka = sprint tersendiri. Next: approval user → builder HANDOFF (dry run) → coding per BLUEPRINT fase 0..4. Coding DILARANG sebelum approval.
- **2026-10-19 — Sprint 015 pack v1 disusun (sprint-planner).** Goal tunggal: pintu masuk upload BKU PDF identik Excel Jan 2026 (0 selisih, akurasi uraian ≥90%). 17 task 2–40 mnt. Salinan audit `architect-packs/architect-pack-015-bku-pdf-import.md`. **[SUPERSEDED oleh entri di atas — v1 punya 14 cacat; lihat blok "REVISI 2026-10-19 v2" di BLUEPRINT/ACCEPTANCE/HANDOFF.]**
- **2026-10-19 — Sprint 015 (Import BKU PDF OCR): PACK DISUSUN (sprint-planner), siap review + dry run.** Bahan disetujui user sepanjang hari ini: PRD (10 US, idea-clarifier ✓ “saya setuju”) + tech stack D1–D6 ✓ “ya lanjutkan setujui” + DATA-MODEL E1–E4 + MODULE-PLAN M0–M5. Isi pack (planning/sprints/sprint-015/): REQUIREMENTS.MD (apa&mengapa, tanpa implementasi) · BLUEPRINT.MD (pin versi eksak terverifikasi npm: paddleocr-js 0.4.2 · tesseract.js 7.0.0 → tensor kandidat A/B, satu dilepas; pdfjs-dist 4.10.38; 17 task 2–40 mnt dengan DoD pasti per task: build exit 0 / node oracle / grep G-1..G-4; DSA line hot-path task 1.5 & 3.3) · ACCEPTANCE.MD (Task Gate di paling atas + T-01..T-16 + E-1/E-2, runtime delegasi acceptance-runner) · HANDOFF-PROMPT.MD (blok bootstrap pasti, dry-run-first, JANGAN list, stop-rule bila kedua engine < target akurasi). Salinan audit: architect-packs/architect-pack-015-bku-pdf-import.md (422 baris) + cross-artifact check 7/7 ✔. Goal tunggal sprint: pintu masuk upload BKU PDF identik Excel Jan 2026 (0 selisih, akurasi uraian ≥90%). Next: user review pack → builder HANDOFF (dry run dulu) → approval → coding per BLUEPRINT fase 0..4. Coding DILARANG sebelum approval (AGENTS.MD). Verifikasi kualitas dokumen: garble-sweep 14 pola = 0 hit; semua versi pin dicek `npm view` + package.json langsung.
- **2026-10-19 — Sprint 013 (Upload BKU PDF) DIHAPUS TOTAL + RESET: dibuat ulang dari awal (keputusan user).**
  Kebijakan user: PRD baru ditulis dari nol — semua artefak sprint-013 lama tidak diwariskan.
  Eksekusi: (1) branch `feat/bku-upload-pdf` di-reset `--hard` ke `main` (`d46edbc`, memuat
  sprint-014) → commit WIP `f04ef1d` (parser `bkuPdfLayout.js` + oracle test + generator fixture)
  dan `bc48ae7` (SESSION-HANDOFF) hilang permanen; (2) pack `planning/sprints/sprint-013/`
  (REQUIREMENTS/BLUEPRINT/ACCEPTANCE/HANDOFF-PROMPT + PRD + fixtures + SESSION-HANDOFF)
  terhapus bersama reset; (3) file scratch riset dihapus: `scratch-pdf-check/` (gen_fixture_rest.py,
  fx/p01–p21.png, cek oracle) + 15 script/shot temporer di `spj-frontend/` (dump-*, inspect-*,
  dbg-*, render-audit, shot-*). Yang SENGaja dipertahankan (keputusan user, di luar sprint-013):
  `spj-frontend/public/logo-dinas.png` (aset fallback Cover di `CoverHeader.jsx`), test-kas-*/
  test-pajak-barisa.mjs, dan template contoh di `template/` — khususnya
  `template/contoh format BKU-PDF tahunan.pdf` (sumber utama PRD baru).
  (4) Rekomendasi engine OCR dari sesi lama (`@paddleocr/paddleocr-js@0.4.2`, butuh persetujuan
  dependency baru) TIDAK mengikat lagi — riset engine dimulai ulang saat PRD baru selesai;
  setiap keputusan baru dicatat di DECISIONS.MD.
  Sprint berikutnya: tulis PRD baru untuk fitur upload BKU PDF (isi tetap sama: PDF BKU
  scanned tanpa text layer → render pdfjs-dist → OCR → parse → preview → tulis `spj_bku_data`).
- **Sprint 014 — Laporan Rincian Pajak: ✅ SELESAI (2026-10-19).**
  Branch `feat/laporan-rincian-pajak` siap merge ke `main`. Fitur lengkap:
  - Panel preview dokumen `rincian-pajak` landscape A4 (16 kolom, header 2 tingkat, skala cetak 45%).
  - Menu `RPAJAK` di kategori **Keuangan** halaman Dokumen Kelengkapan.
  - Baris auto dari BKU tipe `SETOR_PAJAK` + `PAJAK_BUNGA` urut bulan→tanggal.
  - Jenis pajak auto-detect dari uraian BKU (PPh 21/22/23/PPN).
  - Editor manual per baris (NTPN, kode billing, tanggal bayar/NTPN, keterangan) persisten di `spj_pajak_manual`.
  - **Download Excel** — format persis template + rumus SUM + styling header abu-abu + border medium.
  - Uraian tampil = nama kegiatan dari `kodeKegiatan` (sama panel preview & Excel).
  File baru: `utils/dokPajak.js`, `utils/exportPajakExcel.js`, `components/templates/blocks/RincianPajak.jsx`. File diubah: 9 file lain.
  Gate: `npm run build` exit 0 (12,02s, 204 modul) · oracle 28/28 PASS · PDF landscape 841,9×595,0 pt.
  **Aksi user**: commit branch + merge ke `main`.
- **2026-10-18 (sesi "cek project" ronde-3 — Register Kas tabel + nilai lembar/keping + cover nama SD + sekat biru): 3 KELUHAN USER DITUTUP DENGAN BUKTI.** User melaporkan ronde-2: (1) nilai lembar/keping/jumlah uang kertas & logam salah di Register Kas, (2) Register Kas "tidak memakai tabel", (3) nama SD tidak ada di bar biru Cover, (4) biru sekat ≠ biru cover. Semua dilacak ke akar + diperbaiki + diverifikasi: **(a) REGISTER KAS jadi TABEL bergaris putus-putus** persis sumber (kolom LEMBAR/KEPING dan JUMLAH bergaris bawah putus-putus; baris ke-2+ juga garis atas di kolom lembar/keping) + `<colgroup>` lebar kolom sumber (3,5/24/18,5/9/16/29 %) + `table-fixed`; **bug kolon ganda `": :"** dan `width:9%16%` (tak valid) dihapus; **(b) Sub Jumlah (1)/(2) SELALU "Rp 0"** — builder kirim string terformat (`"Rp 300.000"`) lalu komponen format ulang → `Number("Rp 300.000")` = NaN → 0. Kini string terpakai apa ada; **(c) input LEMBAR & KEPING ditambah** (11 baris di form Register KAS — sebelumnya TIDAK ADA inputnya sama sekali) + **OTOMATIS dari Saldo Kas Tunai** (greedy kertas 100.000→1.000 lalu logam 1.000→100; ketikan menang per baris); **(d) nama SD di bar biru Cover** kosong karena parser hanya mengenali label "NAMA SEKOLAH" sedangkan sheet Data contoh memakai label **"SEKOLAH"** → ditambah fallback label persis di `sekolahParser.js` (SCAN 3) + resolver `allFields` di `getSchoolData()`; **(e) bar sekat kini SAMA PERSIS dengan cover** (#002060, lebar 235,6mm, teks putih bold 31pt — dulu #004ac6 + padding/min-width sendiri) lewat konstanta `BAR_GAYA` bersama; **(f) dokumen landscape (cover/sekat) tercetak PORTRAIT** — akar: named page `page: landscape` tak berlaku untuk box `position: absolute` (terbukti Edge 155: absolute → 595×842, static/relative → 842×595) + `min-height: 297mm` bikin halaman ke-2 → `.print-container.landscape` jadi `position: relative` + `min-height: 210mm`. Gate: build exit 0 (`✓ built in 9.58s`) · node oracle **24/24 PASS** (kasus baru: auto-fill tunai 406.000 → 4×100rb+1×5rb+1×1rb, sisa <1.000 pakai logam, ketikan menang, BAP a/b ikut otomatis, nama SD dari allFields "SEKOLAH") · PDF bukti: sekat **1 halaman 841,92×594,96 LANDSCAPE + navy #002060 tanpa #004ac6**, register portrait dengan semua nilai benar. TANPA commit/push (kuasa user). ADR baru seksi P di DECISIONS.MD + fakta tahan-lama di `.workbuddy-ai/memory/`.
- **2026-10-18 (sesi "cek project" ronde-2 — audit format + eksekusi 4 keputusan user): SELARAS FILE REFERENSI + NILAI DARI BKU.** 4 keputusan user (font aplikasi · uang "Rp 100.000,-" · tanggal Indonesia · sekat landscape 4 elemen) + nilai Register/BAP dari BKU (`spj_bku_data`) → 8 file diubah (`dokKas.js`, `previewDocs.js`, `BapKas.jsx`, `RegisterKas.jsx`, `LembarPengaduan.jsx`, `LembarKritikSaran.jsx`, `CoverHeader.jsx`, `templateConfig.js`). Perbaikan dari audit ekstraksi file referensi: judul/PERIODE Pengaduan & judul/baris-dana Kritik-Saran jadi non-bold; kolom lembar kosong cetak "0"/"Rp 0" (mirror fmt sumber); BAP label "Tanggal :" + nomor SK baris terpisah + SK Bupati kabupaten dari Data Sekolah; bug "BULAN BULAN JANUARI" sekat diperbaiki; logo cover 58×54 → 40,4×38,9mm (persis PDF). Gate: build exit 0 (`✓ built in 12.43s`) · node oracle **38/38 PASS** (BKU Januari+Februari: D/K/A, Sub3, BAP a/b/c/Jumlah, tanggal Indonesia, sekat, tanpa namaSekolah) · artefak tes dihapus. ADR baru seksi O di DECISIONS.MD. UNTESTED: render browser/cetak fisik (printer-gated) + acceptance-runner. WIP 6 dokumen TANPA architect pack **masih** belum di-commit (kuasa user).
- **2026-10-18 (sesi "cek project" + perbaikan): BUILD DIPULIHKAN, gate T-02 5 → 2 residual, junk root dibersihkan.**
  Temuan: `npm run build` **EXIT 1** — `templateConfig.js` blok `bap_kas` **terpaste dua kali**
  (baris 1193–1262 = kurung yatim + blok duplikat) → parser gagal, proyek tak bisa dijalankan.
  Perbaikan: hapus 70 baris yatim/duplikat (blok sah 1157–1192 dipertahankan, komentar header
  Pengaduan dipulihkan) → **35 → 34 key template, 0 duplikat**; build hijau `✓ built in 7.81s` (exit 0).
  Gate T-02 (15 pola, wajib 0 hit): **5 → 2 hit**. Dibersihkan: `templateConfig.js` defaults
  `namaPemeriksa`/`namaDiperiksa` (`'YUNIARTI, S.Pd'`/`'AHMAD, S.Pd'`) → `''` — `previewDocs.js:316–317`
  sudah meng-override dari Pejabat Sekolah (`sig['kepala-sekolah']`/`sig['bendahara']`) jadi **0 dampak print** ·
  `previewDocs.js` fallback `barisPemda` `'PEMERINTAH KABUPATEN BANDUNG BARAT'` → kosong-jujur (ikut pola `KopSurat`) ·
  fallback `tempatBku` `'Bandung Barat'` → `''`.
  ⚠️ **Residual 2 hit PRE-EXISTING di HEAD (di luar cakupan sesi, TIDAK disentuh):**
  `blocks/KopGugus.jsx:17` `kabupaten: 'PEMERINTAH KABUPATEN BANDUNG BARAT'` (bertentangan ADR F-4
  "baris 9 prop-driven") + `blocks/SignatureFooter.jsx:8` komentar `SDN Pasirhalang` → **klaim
  "T-02 = 0 hit" di STATE/pack tidak akurat**; masuk sprint berikutnya.
  Kebersihan repo: **28 file junk 0-byte** di root (jebakan quoting PowerShell: `'`, `500kB)`,
  `section+deep-link`, dst) + **5 `*.log`** dihapus; `.gitignore` +4 direktori agent (`.birdview/`,
  `.intent/`, `.playwright-mcp/`, `pencil.dev/`) + `*.log` + `/*.png` + `~$*` (lock Excel masih
  terkunci aplikasi user — tak terhapus, sudah diabaikan).
  🔴 **WIP tak-ter-commit tanpa architect pack (melanggar AGENTS.MD "DILARANG coding tanpa pack"):**
  Cover/Sekat + 6 template kas baru (`register_kas`, `bap_kas`, `pengaduan_masyarakat`,
  `kritik_saran`, `cover_lpj`, `sekat_lpj`) + `blocks/CoverHeader.jsx` (67 baris, varian cover/sekat) +
  `utils/dokKas.js` (helper ringkasan kas bulanan dari BKU) + form kas di `DokumenKelengkapanPage.jsx`
  + `kasDocs()` di `previewDocs.js` + `docs/PRD_PAKET_SUMBER_BARIS_SIPLAH.md` (PRD Sprint 011 belum di-commit)
  → **butuh architect pack Sprint 012** sebelum lanjut.
  UNTESTED: semua runtime (sesi ini murni statis + build; belum ada uji browser/cetak).
- **Sprint 011 Paket Sumber Baris + Toggle SIPLAH — SELESAI 2026-10-10 (merge `e28e976` + state `9a14f88`; main sinkron origin/main).** Acceptance fresh: laporan utama REWORK (8 PASS / 2 GAP-desain G-1/G-2 / E-2 UNTESTED) → adendum task 70 opsi (a): terima desain cari+centang, pack 4 dokumen diselaraskan (T-04'/T-05'/C-03/C-04 ditulis ulang, TOLAK_KEY dihapus dari BLUEPRINT/storage-list, G-1/G-3 CLOSED) → adendum kedua task 71 verifikasi ulang fresh mini **T-04'/T-05'/C-03/C-04 4/4 PASS** (console 0 errors; build di main exit 0, 195 modul, warning xlsx pre-existing). Checklist ACCEPTANCE.MD C-01..C-08 [x] penuh. Sisa: G-2 OPEN-kode (`TOLAK_KEY` export + komentar yatim — pembersihan kode untuk sprint berikut) + G-4 observasi flip-mode (bukan bug) + E-2 & cetak fisik UNTESTED (lihat Blockers).
- **Sprint 011 builder (detail arsip):** branch `feat/sprint-011-paket-sumber` (dari main @a176947, memuat kerja 010): 1 baru (`paketPbj.js`: kunci A1 isSudahBerdokumen + kandidatKeranjang + bkuKePaketRow + manualKePaketRow subset A5 + arsipkanBaris/kembalikanBaris + terapkanMode) + 3 ubah (previewDocs: pbjDocs gate SIPLAH=1 doc; DokumenKelengkapanPage: toggle SIPLAH/NON-SIPLAH persist `spj_pbj_mode` default non + panel cari+centang + guard tanpa auto-tambah + edit inline + arsip; BKUPage: tombol "Kirim ke PBJ").
- **MERGE main 2026-10-10 (`e28e976`): feat/sprint-011-paket-sumber → main fast-forward, memuat tumpukan 010 (`1ff8e97`) + 011.** C-03/C-04 dicentang pack-keeper (verdict task 71: T-04'/T-05'/C-03/C-04 4/4 PASS). Isi: 10 file (pack sprint-011: ACCEPTANCE C-01..C-08 penuh + BLUEPRINT/REQUIREMENTS/HANDOFF selaras cari+centang + VERIFICATION-REPORT adendum; src: paketPbj.js baru + DokumenKelengkapanPage cari+centang + BKUPage + previewDocs). Build di main exit 0 (7.85s, 195 modul, warning xlsx pre-existing). Junk/artefak lokal TIDAK ikut commit. Main lokal ahead origin, tanpa push (kuasa user).

- **Sprint 011 Paket Sumber Baris + Toggle SIPLAH — 🟡 BUILDER SELESAI (STATIK+NODE) 2026-10-10 di branch `feat/sprint-011-paket-sumber` (dari main @a176947, memuat kerja 010), tanpa commit/push (kuasa user).**
  1 baru (`paketPbj.js` ~130 baris: isSudahBerdokumen kunci A1 + kandidatKeranjang + bkuKePaketRow + manualKePaketRow subset A5 + arsipkanBaris/kembalikanBaris + terapkanMode; aturanPbj.js STERIL) + 3 ubah (previewDocs: pbjDocs(pbjForm, mode) gate SIPLAH=1 doc; DokumenKelengkapanPage: toggle SIPLAH/NON-SIPLAH persist spj_pbj_mode default non + gate tab/badge/cetak/panel ikut mode + command-bar Upload PDF/Dari BKU/Manual + keranjang Terima/Tolak tanpa auto-tambah + chips konfirmasi + edit inline expand + arsip halus Kembalikan/Kosongkan + form Manual A5; BKUPage: tombol "Kirim ke PBJ" → ?dok=PBJ).
  Gate: build exit 0 (5.81s, 195 modul, warning xlsx pre-existing) · node unit paketPbj (A1 case-insensitive, kandidat, arsip round-trip, mode 1 vs 6) · DoD grep B-01..B-07 hijau · T-09 diff templateConfig/TemplateEngine/blocks KOSONG + package.json KOSONG + larangan 0 + print:hidden 13 hit.
  UNTESTED: browser runtime + screenshot (playwright-mcp ERR_CONNECTION_REFUSED ke localhost:5173, workspace browser webview tak mount, pencil app tak konek — dev server :5173 jawab 200) → /acceptance-runner konteks segar + cetak fisik.
- **MERGE main 2026-10-08 (`1ff8e97`): feat/sprint-010-pbj → main, push sinkron origin (bypass rule PR tercatat remote).** Isi: 11 file tasks 51-58 (tabel 1-invoice-1-baris 15 kolom + card full-width premium + contain fix sidebar) + pack sprint-010 + architect-pack-010. Build di main exit 0 (6.40s). Junk/artefak lokal (template PDF/XLSX, screenshot, log) TIDAK ikut commit.
- **PBJ konsisten LPJ + tabel sheet-data + card-flow — 🟢 BUILDER SELESAI (STATIK+RUNTIME) 2026-10-08, tanpa commit/push (kuasa user).**
  Perintah user: (1) panel preview PBJ konsisten LPJ (split form + tombol lengkap), (2) tabel generate-PDF sama format `template/Dokumen PBJ_2026_Lbs.xlsx` sheet data, (3) card Kelengkapan PBJ tampil di bawah card Dokumen PBJ setelah diklik.
  0 baru + 5 ubah (templateConfig: pesanan +kolom SATUAN header persis Excel + config baru `pbj_data` landscape 14 kolom persis header sheet data; aturanPbj 174→198/200: form `data` + prefill invoice/BKU + satuan rows + bulanDariISO; previewDocs: doc ke-7 `Data — Rekap Pengadaan`; PanelPreviewDocument: prop opsional `cetakAktif` backward-compatible; KelengkapanPage: section selalu-tampil DIHAPUS → accordion di bawah kategori SIPLAH via klik card, split-view LPJ `1fr_620px` + aside sticky, status/Cek/Cetak gate, tab ke-6 Data 13 field, tabel pesanan +kolom Satuan editable, modal skip PBJ, deep-link BKU auto-buka accordion).
  Gate: build exit 0 (7.04s, 193 modul, warning xlsx pre-existing) · browser :5173 console 0 errors · klik card → detail di bawah SIPLAH tanpa modal · isi 2 field → panel live + badge 5-PERLU-DIISI + A4/F4 + Cek + Cetak + zoom + fullscreen · Cek lompat ke tab Surat Pesanan · tab Data 13 field · panel doc `Data — Rekap Pengadaan (landscape)` header 14 kolom = sheet data (node+browser) · pesanan header Excel 6 kolom (node).
  UNTESTED: acceptance-runner fresh + cetak fisik + upload invoice ulang (kolom Satuan kosong jujur).
- **Sprint 010 PBJ — 🟢 BUILDER SELESAI (STATIK+RUNTIME) 2026-10-08 di branch `feat/sprint-010-pbj` (@ec748c4), tanpa commit/push (kuasa user).**
  Upload invoice TERBACA OTOMATIS (3 item + Rp 7.055.000 + Himalaya Store) + 5 dokumen PBJ + 6 halaman cetak + panel mirror + deep-link BKU. 1 baru (`aturanPbj.js` 174/200: parseInvoiceSIPLah 2 format + terapkanPrefillPbj user&gt;invoice&gt;BKU + pbjFormKosong) + 4 ubah (templateConfig +139/-0: 6 key PBJ portrait blocks-reuse; KelengkapanPage 595→895: section PBJ selalu tampil + upload pdfjs-local-worker + 5 tabs + ringkasan + .sk-print-area 6 docs + panel; previewDocs +42: pbjDocs() skip-jujur; BKUSidebar +18: tombol Lengkapi PBJ khusus PEMBAYARAN → ?dok=PBJ).
  Gate: build exit 0 (6-7s) · browser :5173 console 0 errors · T-02 badge "Terbaca 3 item · Rp 7.055.000" (screenshot) · T-03 fallback jujur + arsip meta (bukti browser) · T-04 D2 3 rows qty=Terima + PRODUK II strip · T-05 panel 6 label F-PBJ6 + skip kosong (node) · T-06 prefill BKU mapping (node) + Urungkan restore (browser) · T-07 PBJ tampil off+on toggle (browser) · T-08 config existing +0/-0, TemplateEngine/blocks diff kosong, package.json utuh, larangan 0, print:hidden ada · T-09 spj_pbj_* via storageHelper, BLUE-ONLY, blob 0.
  Catatan: templateConfig aktual 21 key existing (pack tulis 13 — existing tetap steril, tanpa keputusan baru). UNTESTED: acceptance-runner fresh + cetak fisik.
- **SINKRON 2026-10-07 — main sinkron origin (`0c5d986`), blockers nihil, acceptance runtime terbuka.**
  Merge ke main: `0c5d986` (TTD tunggal Kepala Sekolah rata kanan; feat `da4c37a` user-verified).
  Push sinkron origin `14e5077..0c5d986`; `git status -sb`: main == origin/main tanpa ahead/behind
  (hanya file untracked artefak lokal). TTD tunggal (undangan_mamin, pesanan_mamin, buku_tamu,
  daftar_hadir) → kanan (`justify-end` / `ml-auto mr-0`); multi-TTD tak berubah; format 4 baris
  task 39 tak tersentuh. ADR baru 1 di DECISIONS.MD (TTD tunggal rata kanan).
  UNTESTED: acceptance-runner fresh Sprint 005/007/008 + cetak fisik F4.
- **SINKRON 2026-10-06 — main sinkron origin (`14e5077`), blockers nihil, acceptance runtime terbuka.**
  Merge ke main: `14e5077` (BKU-pajak: tab Belanja/Pajak terpisah + tombol Coretax tunggal; feat `9944828` user-verified).
  Push sinkron origin `0ae1638..14e5077`; `git status -sb`: main == origin/main tanpa ahead/behind
  (hanya file untracked artefak lokal). Tab Belanja = default, satu sumber transaksi view-filter;
  baris SETOR pajak → satu tombol "Bayar via Coretax" (tab baru, bukan halaman dokumen LPJ).
  ADR baru 2 di DECISIONS.MD (tab Belanja default + Coretax tunggal; risiko false-positive kata kunci).
  UNTESTED: acceptance-runner fresh Sprint 005/007/008 + cetak fisik F4.
- **TUTUP SESI 2026-10-06 — main sinkron origin (`0ae1638`), blockers nihil, acceptance runtime terbuka.**
  Merge ke main: `9659372` (sprint-008-009: preview A4 + pecah pesanan + sticky + ringkasan satu alur) +
  `32c5b7e` (audit SPT+SPPD + kertas A4/F4) + `0ae1638` (BKU-detail: tab Detail ringkasan+aksi + Dokumen dinamis).
  `git status -sb`: main == origin/main tanpa ahead/behind (hanya file untracked artefak lokal).
  Sprint aktif: **009** (Fase B sticky SELESAI; Fase A pecah pesanan in-progress) + Sprint 007 eksekusi menunggu +
  dev server :5173 menyala untuk uji manual. ADR baru 6 di DECISIONS.MD (prefix Kegiatan, Panel A4 ganti Cermin,
  hapus Ringkasan satu alur, TTD 4 baris, audit font dikecualikan, Dokumentasi steril;
  kertas A4/F4 + SPD + cabut-batas sudah tercatat sebelumnya).
  UNTESTED: acceptance-runner fresh Sprint 005/007/008 + cetak fisik F4.
- **Kertas A4/F4 + SPD meniru docx — 🟢 BUILDER SELESAI (STATIK+RUNTIME) 2026-10-06, belum di-commit (kuasa user).**
  Perintah user: (1) kertas opsional A4/F4 utk semua dokumen, (2) lengkapi format + SPD ulang meniru tabel docx.
  2 baru (`paperSize.js` 70/200: spj_kertas default A4 + event + suntik @page; `PaperSizeSelector.jsx` 49/300)
  + 8 ubah (TemplateEngine paper-aware; PanelPreview selector+lebar F4; index.css F4/kop-ganda/spd-tabel/surat-polos;
  SPDForm 232→269/300: TABLE3 berbingkai 1–10 + TABLE4 kotak berdampingan; SuratTugas polos+Untuk italic;
  SuratUndangan polos+detail 4 baris+TTD kanan; KopSurat/KopGugus garis ganda; main.js init; DokumenSPJPage selector;
  SkHonorerEditor selector+paper class).
  Gate: build exit 0 (7.35s, 191 modul, warning xlsx pre-existing) · browser :5173 console 0 errors ·
  F4→spj_kertas tersimpan + panel 215.9mm + @page 215.9x330.2 · SPD berbingkai ter-render (screenshot).
  ADR baru 2 di DECISIONS.MD (kertas opsional, SPD tabel). UNTESTED: cetak fisik F4 + acceptance-runner fresh.
  **FIX 09:55Z (panel potong kertas):** akar = CSS F4 memaksa `.print-container` 215,9mm JUGA di layar
  (kontainer itu wajib isi kertas induk) + skala ukur pakai clientWidth termasuk padding (meluber 16px).
  Perbaikan: aturan F4 layar hanya `.preview-container`, cetak via `@media print`; measure pakai
  content-box + margin aman 2px. Gate ulang: build exit 0 (9.42s) · console 0 errors ·
  TemplateEngine 627px pas isi kertas + scrollWidth bersih + TTD utuh di dalam kertas (screenshot F4).
- Sprint 009 Fase A — Pecah Surat Pesanan 2 Dokumen — 🟢 **BUILDER SELESAI (STATIK+RUNTIME) 2026-10-06 di branch `feat/sprint-009-pecah-pesanan` (dari ec2eb85, working tree src hanya 3M+1U milik 009), belum di-commit (kuasa user), Fase B sticky menunggu.**
  Keputusan user/koordinator 04:34Z: (1) PECAH FILE DULU, (2) branch 009 dari 008 yg di-commit, (3) uji OTOMATIS. 1 baru `MaminPreview.jsx` 237/300 (ekstraksi murni renderMaminPreview; DokumenFormPreview 2370→~2162) + 3 ubah (aturanMamin.js 185/200: `bagiPesananPerSeksi` 1 logika utk A1/A2/A3; MaminPreview A1 2 kartu + A2 2x .sk-doc-print; previewDocs.js 189/200: docs pesanan-nasi/snack mirror 1:1). Nomor SAMA, perihal suffix display-only, warisan ikut Nasi, seksi mati di-skip, kedua mati pesan jujur (legacy).
  Gate: build exit 0 ×2 (pecah `8.63s` 189 modul, Fase A `7.72s`) · browser :5173 console 0 errors · panel 5 docs (Undangan+Nasi+Snack+Notulen+Hadir) · Nasi 6 (no 1-6) + Snack 4 (no 1-4) · nomor "800/TEST/2026" sama + perihal "Surat Pesanan — Nasi/Snack Box" · snack-off→hanya Nasi · both-off→panel tanpa pesanan · node unit warisan snippet/kustom→Nasi renumber · T-06 diff cetak kosong + larangan 0 + print:hidden ada · T-08 package.json utuh + blue-only 0. Screenshot 3 viewport. Batasan sadar: nomor berbeda per surat = ubah manual antar cetak (bukan FAIL).
- Sprint 009 Fase B — Sticky Panel Preview — 🟢 **BUILDER SELESAI (STATIK+RUNTIME) 2026-10-06 di branch `feat/sprint-009-pecah-pesanan`, tanpa commit (kuasa user).** 2 file CSS-only: `DokumenSPJPage.jsx` aside `lg:sticky lg:top-[88px] self-start` + wrapper kartu `overflow-hidden`→`overflow-x-clip` (tanpa ini sticky mati — ancestor overflow-hidden jadi scrollport), `PanelPreviewDocument.jsx` root lepas sticky-dalam + `max-h-[calc(100vh-104px)]` + `overflow-y-auto` dipertahankan, print:hidden + @media print utuh. Mobile <lg static menumpuk, cetak steril.
  Gate: build exit 0 (7.41s, 189 modul, warning xlsx pre-existing) · console 0 errors · T-07 grep 8 hit 2 file · desktop scroll asideTop=88 panel terlihat (screenshot) · mobile 390px static menumpuk (screenshot) · T-06 diff cetak kosong + larangan 0 · T-08 package.json utuh + panel blue-only 0. UNTESTED: print-preview live (Cetak ter-gate, bukti statik print:hidden saja) + acceptance-runner fresh.
- Sprint 007 — Revisi Parser + Hadir + Menu Pesanan — 🟡 **BUILDER SELESAI (STATIK) 2026-10-05 di branch `feat/sprint-005-autogen` (Pilihan B, 005+006 ikut kebawa), belum di-commit, belum acceptance.**
  Dry run disetujui user/koordinator 2026-10-05; eksekusi A.1→E.2. 0 baru (`aturanMamin.js`
  160/200: MENU_PESANAN Nasi-6/Snack-4 + rincianMenu + templatePesananMamin per-jenis + fallback konsumsi) + 3 ubah
  (bkuKategori.js kupasEkorJamuan + kupasPrefiksKonsumsi + bacaGTKUntukHadir Guru→Tendik;
  DokumenSPJPage.jsx hadir via bacaGTKUntukHadir; DokumenFormPreview.jsx tombol Isi menu baku).
  B.2/D.1/D.2 reuse-006 verified-existing tanpa ubah logika; cetak formal tak tersentuh
  (diff blocks/templateConfig/TemplateEngine kosong).
  Gate: build exit 0 ×2 (baseline `5.03s`, final `4.99s`) · node oracle 18/18
  (parser jamuan 3 + konsumsi 2 + fallback + multi-baris lama; hadir kosong/isi; menu 6/4/fallback) ✅ ·
  T-08 15 pola = 0 · fetch/AI = 0 · blue-only tambah 0 · spj_otomatis_snapshot = 3 · Urungkan = 7 ·
  grep Jamuan/parseMamin/data_tendik/templateDaftarHadir/templatePesananMamin/MENU_PESANAN semua ≥ DoD.
  Catatan jujur: `bkuKategori.js` 382 baris = warisan 337 pra-007 (refactor luar cakupan, dilarang AGENTS.MD);
  node `-e` langsung terhalang impor extensionless warisan → harness temp (logika byte-identical).
  UNTESTED runtime (T-04/T-05 klik-baris + screenshot, T-06 screenshot 6/4, T-07 3 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  **REWORK ronde-1 2026-10-05 (verdict NOT APPROVED High, tanpa commit):**
  `aturanPesanan.js` BARU 192/200 (parser 007 + bacaGTK + gabung/kelompok/dominan,
  byte-identical, pola 006) + `bkuKategori.js` 382→194/200 (re-export 1 pintu,
  API identik) + impor `.js` (node prescribed T-02/T-03/T-05/T-06 exit 0 TANPA
  harness). Gate: build exit 0 `5.03s` (186 modul) · oracle 22/22 · util ≤200
  semua · hardcode 0 · offline 0 · diff cetak kosong. → acceptance ulang.
  Laporan: `planning/sprints/sprint-007/BUILD-REPORT.MD`.
- Sprint 006 — Autogen Semua Tab Mamin — 🟡 **BUILDER SELESAI (STATIK) 2026-10-03 di branch `feat/sprint-005-autogen` (Pilihan B, 005 ikut kebawa), belum di-commit, belum acceptance.**
  Dry run + pecah `aturanMamin.js` disetujui user/koordinator; eksekusi A.1→F.2. 1 baru `aturanMamin.js`
  (132/200: templatePesananMamin + templateDaftarHadir + templateBukuTamu + lengkapiNotulen) + 4 ubah
  (aturanUndangan.js re-export 4 fn, 148/200; bkuKategori.js subId routing kegiatan→pesanan;
  DokumenSPJPage.jsx prefill per-sub + GTK rows + tempat default sekolah + snapshot otomatis;
  DokumenFormPreview.jsx toggle hadir via template + input perihalPesanan + 3 baku-hint BKU-gated).
  Cetak formal tak tersentuh (diff blocks/templateConfig/TemplateEngine kosong); E.1/E.2 reuse 005 tanpa ubah kode.
  Gate: build exit 0 ×2 (final `7.89s`) · node 4 template (T-03 jujur "" + F1–F4 oracle) ✅ ·
  T-08 15 pola = 0 · fetch/AI = 0 (komentar "fetch" dibuang) · blue-only tambah 0 ·
  spj_otomatis_snapshot = 3 · Urungkan ≥ 6.
  UNTESTED runtime (T-02/T-04/T-05/T-06/T-07 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  Deviasi tercatat: pembuka = kalimat baku 005 (T-06 menang atas nama pejabat); waktu = '' (tanpa sumber BKU);
  node-test bkuKategori terhalang import extensionless warisan (build vite lolos).
  Laporan: `planning/sprints/sprint-006/BUILD-REPORT.MD`.
- Sprint 005 — Autogenerate Undangan + Resume — 🟡 **BUILDER SELESAI (STATIK) 2026-10-03 di branch `feat/sprint-005-autogen`, belum di-commit, belum acceptance.**
  Dry run disetujui user; eksekusi A.1→E.2. 1 baru `aturanUndangan.js` (142/200) + 3 ubah
  (bkuKategori SELALU TIMPA + parsePerjalanan, DokumenSPJPage template+snapshot+badge+Urungkan,
  DokumenFormPreview chip "dari BKU"); BKUSidebar verified-existing tanpa diff; parseMamin
  byte-identical (lindungi T3 6/6).
  Gate: build exit 0 ×3 (final `4.92s`) · node import 11 exports + 7 kasus parser ✅ ·
  5 pola T-08 = 0 · added-lines 15 pola + fetch/AI = 0 · diff warisan kosong ·
  E-2 = 0 · spj_otomatis_snapshot = 3 · Urungkan = 6.
  UNTESTED runtime (T-03…T-07 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  Laporan: `planning/sprints/sprint-005/BUILD-REPORT.MD`.
- **REVISI BKU grup+Mamin+hapus LPJ+hapus panel ATK — ✅ T1-T7 DONE di main lokal 2026-10-02, belum push, belum acceptance fresh.**
  HEAD `cc2456e` ahead 3 dari `origin/main` (`08e4078` parsial warisan + `a53fd61` revisi T1-T4 + `cc2456e` hapus panel ATK T6-T7).
  T1 hapus kolom LPJ · T2 grup dominan kode rekening + auto filter cerdas · T3 parser Mamin ketat Q3 ·
  T4 bahasa tanpa ubah cetak · T5 merge a53fd61 · T6 hapus panel ATK (BKUPage 1 ins 50 del) · T7 merge cc2456e.
  Verifier FINAL **APPROVED Medium** — batas: live klik + screenshot belum jalan → ke acceptance-runner fresh.
  Sisa: acceptance-runner fresh (seed grup 2 baris BNU sama, 1 Mamin Rapat, 1 snack, klik filter/expand, screenshot BKU tanpa panel ATK) + push.
  Laporan: `planning/sprints/sprint-004/BUILD-REPORT.MD` (§ADDENDUM REVISI 2026-10-02).
- Sprint 004 — BKU → LPJ Smart Bridge — 🟡 **BUILDER SELESAI (STATIK) 2026-10-01, belum di-commit, belum acceptance.**
  Dry run disetujui ("setuju"); eksekusi A.1→D.2 (13 task). 1 baru `bkuKategori.js` (199/200) + 5 ubah
  (BKUPage badge/filter/panel ATK, BKUSidebar detail/koreksi/deep-link/grup, DokumenSPJPage prefill/badge/undo/kunci,
  PejabatSekolahPage riwayat, DokumenKelengkapanPage terima kelompok). 0 dependency.
  Gate: build exit 0 ×10+ · 15 pola 0 · diff warisan kosong · blue-only 0 baru ·
  logika node 28/28 (kategori/koreksi/merge/flag/pejabat/prefill).
  UNTESTED runtime (T-03…T-07, E-1, C.3 manual) → /acceptance-runner konteks segar.
  Laporan: `planning/sprints/sprint-004/BUILD-REPORT.MD` + `DRYRUN-REPORT.MD`.
- Sprint Aktif: **Sprint 003 — ✅ DITUTUP 2026-10-01 (risiko diterima user;
  ronde-2 dibatalkan).** /acceptance-runner RONDE-1: 12 PASS / 0 FAIL /
  8 UNTESTED (gap = browser mati, 0 bug). Question ronde-2 vs risiko → CLOSED
  (QUESTIONS.MD): user pilih terima risiko (preseden 001/002).
  Laporan final: `planning/sprints/sprint-003/VERIFICATION-REPORT.MD`.
  Rincian ronde-1 —
  PASS runtime: T-08(a) auto-open + T-08(h) jump-tetap-buka + badge 0/6→1/6,
  T-02 rename, T-03 kartu ringkasan, E-1 kosong-jujur (0 console error).
  PASS statik: T-01 build EXIT=0, T-07 2 cabang + honor-only, T-08 ronde-2
  (jump=21, tabseen=0), T-10 (15 pola 0, warisan kosong), C-11/C-12.
  Gap = browser Playwright mati tengah sesi (8 item runtime: T-04 penuh, T-05
  penuh, T-06, T-07 picker, T-08 b/c/d/e/f/g, T-09 revert-test, T-10 Honorarium,
  E-2). TIDAK ADA temuan bug. Laporan:
  `planning/sprints/sprint-003/VERIFICATION-REPORT.MD` (belum di-commit).
  Builder: dry run disetujui user; komit `17a266d`→`45129a9` + revisi R1…R9
  `414b53d`; build exit 0 ×7; runtime pencil/Playwright — pill+popover+rename+
  jump terbukti, 8 gap diterima sebagai risiko.**
  **REVISI PANDUAN (keputusan user 2026-10-01 sesi 2) — kode selesai, gate statik lulus,
  BELUM di-commit:** (1) konten langkah = tab nyata tiap menu (`when(ctx)` utk sub
  Koordinasi/Bank) · (2) auto-open SETIAP masuk menu · (3) trigger "selesai isi tab"
  selalu muncul (lewati dismiss) · (4) popover tutup saat ganti tab/menu
  (`key={menuId}`, `spj_guide_tabseen_*`). File: guideConfig + MenuGuide ditulis ulang,
  formTab/previewTab diangkat ke DokumenSPJPage, 4 pack + BUILD-REPORT direvisi
  (T-08 REVISI 2026-10-01). Gate: build exit 0 · 15 pola 0 · blue-only 0 baru ·
  MenuGuide 232/300 · guideConfig 68/150. UNTESTED: interaksi popover (pencil browser
  tanpa klik) → acceptance-runner.
  **RONDE-2 (temuan uji manual user 2026-10-01):** (1) pindah jenis/sub popover tidak
  muncul → aturan baru **selalu tampil setiap pindah konteks** (jenis/tab/mode;
  SUPERSEDE "1× per tab" + "tutup saat ganti tab", `spj_guide_tabseen_` DIHAPUS);
  (2) list langkah **bisa diklik** → jump ke tab/mode + scroll, popover tetap
  (task R8/R9). Kode+pack selesai, gate: build exit 0 `5.83s` · jump=21 · 15 pola=0 ·
  MenuGuide 225/300 · guideConfig 69/150. **Belum di-commit.**
  Pack 4 dokumen (Bab 8.4): `planning/sprints/sprint-003/` REQUIREMENTS · BLUEPRINT ·
  ACCEPTANCE · HANDOFF-PROMPT. PRD: `planning/sprints/sprint-003/PRD.md` (US-19…US-30).
  Salinan audit: `architect-packs/architect-pack-003-rework-preview-dan-panduan.md`
  (593 baris). Isi: Fitur A — preview → kartu ringkasan (tanpa kop/TTD), rename
  tombol, cetak Perjalanan Dinas 5 dokumen + Mamin set lengkap, penerima semua
  status; Fitur B — MenuGuide pill+popover sadar-state di 4 menu, config-driven.
  **23 task / 5 fase / 3 file baru / 3-4 file diubah / 0 dependency baru / 12 test
  case (T-01…T-10 + C-11/C-12)**. Cross-artifact check: LULUS (1 cacat ketemu &
  diperbaiki — task 5.4 tanpa kriteria → C-12 ditambah).
  Keputusan tertunda ke dry run: nama final tombol (usulan "Lihat Ringkasan"),
  pemetaan docx Mamin, Pemeliharaan pola penuh/parsial.
- Sprint 001 + 002 resmi DITUTUP & APPROVED 2026-09-30
  (lihat blok penutupan di bawah).
- **PENUTUPAN RESMI SPRINT 001 + 002 — 2026-09-30 (/acceptance-runner konteks segar).**
  Kedua ACCEPTANCE dijalankan ulang: **T-01 build exit 0** (`✓ built in 8.09s`,
  Node v24.19.0) · **T-02 Sprint 001** 15 pola `-i` = 0 hit + aset 0 · **T-02 Sprint
  002** rescoped = 0 · **T-04** 3 blok 0 `<input>/<textarea>` · **T-10** 0 warna baru
  (`git diff 264c431..HEAD` terverifikasi) · **T-13** 0 caret, MATCH 14/14, lockfile
  bersih · jalur auto-fill T-12/T-15, banner 2 varian, logo kop, SKHonorer
  prop-driven, 3 blok resmi SPD, reset `dokumen_lpj` — semua **PASS statik segar**.
  Bukti lengkap: `planning/sprints/sprint-001/VERIFICATION-REPORT.MD` +
  `planning/sprints/sprint-002/VERIFICATION-REPORT.MD`.
  ⚠️ **Kriteria UI runtime = UNTESTED, risiko DITERIMA EKSPLISIT oleh user
  2026-09-30** (tool browser tidak tersedia di sesi runner; user memilih menutup
  sprint & lanjut Sprint 003). Mitigasi: uji manual user (`fix-template-document.md`)
  tidak menemukan cacat di lingkup 001/002 — temuan ulasan ada di lapisan preview
  (lingkup Sprint 003). Status kedua sprint: **✅ SELESAI (APPROVED, risiko
  diterima)**. **Push ke origin MASIH tertunda** (±14 commit lokal).
- **2026-09-30: PRD Sprint 003 DIBUAT (draft — belum pack, belum disetujui).**
  `planning/sprints/sprint-003/PRD.md` (US-19…US-30): (A) rework lapisan preview →
  kartu ringkasan data tanpa kop/TTD, rename tombol "Preview Dokumen", Cetak Semua
  Perjalanan Dinas = 5 dokumen, set cetak Mamin = semua docx di `template/`,
  penerima = semua pegawai semua status (Honorarium tetap honorer-only);
  (B) Panduan langkah = pill+popover sadar-state di 4 menu, config-driven.
  Sumber: feedback `fix-template-document.md` + 2 ronde keputusan user sesi ini.
  Urutan tetap: /acceptance-runner konteks segar dulu (Sprint 001+002), baru
  planning pack Sprint 003. Kode TIDAK disentuh.
- Sprint 001 — Fondasi Data Sekolah & Pejabat — 🟡 **TUTUP (STATIK)**
  (**FASE 1–6 SELESAI (STATIK)** — FASE 1–4 di-commit `8398fe1` 2026-09-18; FASE 5–6
  selesai + lulus gate Builder 2026-09-18, di-commit `73174c0` (`feat:`) + `2e23441`
  (`docs:`); **belum di-push**;
  verifikasi UI runtime menunggu /acceptance-runner ulang utuh)
  Pack: DIBUAT + di-realign Bab 8.4 + dipecah jadi 2 sprint + **direvisi 2026-09-17
  v2/v3/v4 (verifikasi)** + **v5 (dry run Fase 1+4)**.
  ⏸️ **SPRINT 001 TUTUP (statik)** — sesuai AGENTS.MD semua keputusan commit/push = kewenangan user.
  Requirement: `planning/sprints/sprint-001/PRD.md` (18 user story, **umbrella untuk
  dua sprint**) — hasil `/idea-clarifier` + `/prd-generator`, dikonfirmasi user 2026-09-14.
  Pack teknis (4 dokumen, Bab 8.4): `planning/sprints/sprint-001/`
  `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` · `HANDOFF-PROMPT.MD`.
  Salinan audit trail (Bab 8.5): `architect-packs/architect-pack-001-fondasi-data-sekolah-pejabat.md`
  (**1459 baris**, diregenerasi 2026-09-17 v3 — Lampiran check #5 **per-baris**:
  73 baris baseline T-02 terukur, setiap baris punya satu task bernama di BLUEPRINT;
  riwayat check #5 v1/v2/v3 tercatat di §5e).
  Isi: US-13…US-18 (+US-11 sebagian) · **6 fase / 53 task** · **2 file baru +
  19 file diubah** · **14 test case** (T-01…T-14) · 4 gate build · jalur kritis
  `1 → 2 → 3 → 4 → 5 → 6`. Gate T-02 v3: **15 pola** `grep -rniE`
  (`-i` wajib), baseline terukur **73 baris di 15 file**.
  `BLUEPRINT.MD` memuat versi dependency ter-pin eksak — memenuhi temuan F8
  `docs/SECURITY-AUDIT-001.md` §5. ⚠️ **Koreksi 2026-09-17:** catatan lama "0 mismatch /
  14 paket vs lockfile" **hanya berlaku untuk tabel BLUEPRINT ↔ `package-lock.json`**;
  `package.json` sendiri masih memakai `^` untuk 14 paket → dijadikan **task 1.11 + T-13**.
  **Status: DRAFT v3 — menunggu persetujuan user; coding DILARANG dimulai sebelum
  pack disetujui (aturan AGENTS.MD).**
- Sprint Terbaru: **Sprint 002 — Rework Modul Perjalanan Dinas** — 🟡 **FASE 1–5 SELESAI (STATIK) 2026-09-19**
  (di-commit `36b408f`→`5b11f10`, **belum di-push**; verifikasi UI runtime menunggu
  /acceptance-runner konteks segar). Pack: `planning/sprints/sprint-002/` (4 dokumen +
  `DRYRUN-REPORT.MD`) ·
  salinan audit `architect-packs/architect-pack-002-perjalanan-dinas.md` (656 baris,
  Lampiran **5 LULUS**). Isi: US-01…US-10, US-12 (+US-11 sebagian, + regresi US-16) ·
  5 fase / 27 task. ⚠️ **Prasyarat keras** — memakai `getSignatureRoles()`,
  `getPejabat()`, `getPejabatStatus()`, `PEJABAT_ROLES`, `mergePejabat()`,
  `blocks/PeringatanData.jsx` yang baru ada setelah Sprint 001 selesai.
  **Disesuaikan 2026-09-17** (`HANDOFF-PROMPT.MD` saja, 3 titik) akibat perluasan scope
  Sprint 001: (a) verifikasi prasyarat ditambah **grep anti-hardcode wajib 0 hasil**;
  (b) peringatan "tujuh blok sudah data-driven" (bukan hanya `KopSurat`/`SignatureFooter`);
  (c) klaim lama "perubahan `DokumenFormPreview.jsx` **aditif**" **dikoreksi** jadi
  **substantif** — Sprint 001 memasang auto-fill pejabat + mengganti 5 literal nama sekolah
  + membersihkan 5 placeholder nama/NIP di file itu. ⚠️ **5 file tumpang tindih** dengan
  Sprint 001 (`SPDForm`, `SuratTugas`, `SuratUndangan`, `templateConfig.js`,
  `DokumenFormPreview.jsx`) — batas tegas: **001 = sumber nilai · 002 = struktur & layout**.
  **FASE 1–5 SELESAI & LULUS GATE BUILDER (STATIK) 2026-09-19** — 6 file disentuh, 0 file
  baru. **FASE 1** (`36b408f`) hapus tab & config `surat_tugas` (satu dokumen = satu tab).
  **FASE 2** (`6a5408f`) form SPT/SPD/Undangan selaras docx sumber: SPT per-penerima
  (Nama/NIP/Pangkat/Jabatan), pengikut SPD multi-baris, 2 paragraf penutup + tembusan
  undangan, `sifat` default `-`; efek auto-sync SPPD diperbaiki dengan `...prev`.
  **FASE 3** (`e7c0150`) 3 blok cetak murni — 0 `<input>`/`<textarea>`, placeholder nama
  riil → label generik (D-2), pengikut SPD tampil data. **FASE 4** (`6746d66`) print-area
  SPD lengkap: 3 blok resmi kalimat persis docx ("Telah diperiksa…", "Catatan Lain-Lain",
  "PERHATIAN :") + anti-terpotong halaman. **FASE 5** (`5b11f10`) tombol "Reset Data
  Dokumen LPJ" (`storageHelper.remove('dokumen_lpj')` + confirm, tanpa migrasi; Data
  Sekolah utuh) + gate akhir. **3 koreksi dry run disetujui user 2026-09-19:** D-1 rescope
  T-02 (kecualikan `templateSuratHelper.js` — fitur "Template Surat Cerdas" lain) · D-2
  placeholder generik · D-3 perluas T-04 ke `<textarea`. Bukti gate: build exit 0 ·
  grep `surat_tugas` (rescoped) = 0 · grep `<input|<textarea` 3 blok = 0 · 4 string legal
  SPD persis · 15 pola anti-hardcode Sprint 001 tetap 0 hit · 6 konsumen tidak tersentuh.
  Detail di `DRYRUN-REPORT.MD` + ADR bagian M di `DECISIONS.MD`. ⚠️ **UI runtime
  (T-03…T-11) belum terbukti — wajib /acceptance-runner konteks segar.**
  Juga selesai pra-sprint: fix `nama_sekolah` snake_case → camelCase di
  `DokumentasiAIGenerate.jsx` (commit `c955019`, 2 titik: kop preview + HTML cetak).
- Status: Sprint 000 (ONBOARDING) sudah **DITUTUP**. Baseline keamanan `aedd65c`
  (FINDINGS: 2 TINGGI terjadwal RISKS.MD, 0 KRITIS). Checklist A 27.7.1 hijau —
  posisi aman untuk pindah agent. **5 pertanyaan OPEN** di QUESTIONS.MD (keputusan parser
  xlsx, duplikat xlsx di root `package.json`, `NomorSuratPopup` `'SDN-PSR'`, batas literal
  tempat/tanggal dokumen, `templateSuratHelper.js` fitur "Template Surat Cerdas" — dua
  terakhir tidak memblok sprint; pertanyaan `nama_sekolah` CLOSED 2026-09-19).
  Posisi ritel 27.3: Tahap 2 langkah 4 (/idea-clarifier) **selesai**.
- **VERIFIKASI INDEPENDEN 2026-09-17 (v4)** — 11 klaim pack v3 diukur ulang terhadap
  kode nyata (dipicu permintaan user "cek AGENTS/STATE/DECISIONS"). **Semua COCOK:**
  gate T-02 baseline terukur **73 baris / 15 file** (setiap angka per file persis sama
  tabel `ACCEPTANCE.MD:94-111`); cek aset `grep … | grep -i sourceFile` = **0** (11 path
  `.xlsx` aman); **53 task** (F1=12 · F2=8 · F3=6 · F4=20 · F5=4 · F6=3); 14 caret
  `package.json` (`lockfileVersion: 3`); `export default` `sekolahData.js:83` +
  `signatureRoles.js:39` **terbukti 0 konsumen**; temuan F-1a, D-3, D-6, F-4 semuanya
  terbukti di kode. Gate T-01 `npm run build` **lulus** (`177 modules`, `10,42 s`).
  **1 cacat ditemukan & diperbaiki:** koreksi F-2 v3 menulis Node **v24.19.0** sebagai
  "runtime mesin pengembangan" — **terbalik**. Runtime gate yang benar = **v22.22.2 /
  npm 10.9.7** (*managed*, yang dipakai agent); v24.19.0 hanya *system fallback*.
  **Determinisme terverifikasi:** build di kedua runtime → **hash artefak identik**
  (hanya waktu beda: 10,42 s vs 6,89 s) → tidak memengaruhi gate.
  Dampak v4: `BLUEPRINT.MD` (Tech Stack + catatan koreksi dibalik + header revisi),
  `ACCEPTANCE.MD` (T-01 wajib sebut versi runtime + header revisi), salinan audit
  `architect-pack-001` (2 titik sama), 1 ADR baru + 1 catatan supersesi di `DECISIONS.MD`.
  **Isi task (53), jumlah file (19), gate, dan 14 test case TIDAK berubah** —
  v4 murni koreksi akurasi klaim. `sprint-002/BLUEPRINT.MD:54` sudah benar sejak awal.
- **DRY RUN FASE 1 + FASE 4 SELESAI 2026-09-17 (v5)** — `DRYRUN-T1.md` **ditulis ulang
  jadi v2** (versi 2026-09-14 hanya mencakup inti Fase 1). Hasil: **FASE 1 ✅ dapat
  dijalankan apa adanya** (2 konsumen konstanta basi terkonfirmasi = `KopSurat` +
  `SignatureFooter`; kedua `export default` terbukti 0 konsumen; semua baris task 1.4–1.11
  cocok dengan kode). **FASE 4 menemukan 3 cacat preskripsi** — lolos dari v3/v4 karena
  keduanya memeriksa "apakah baris tertaut task", bukan "apakah task-nya benar":
  **D-7** tab `surat_tugas` memakai `buildSptData` (`DokumenFormPreview:1790`) yang hanya
  spread `spt.defaults` (1617) → `surat_tugas.defaults` **tidak pernah tercetak**; task 4.3
  tetap wajib hanya untuk gate T-02. **D-8 ⚠️ TINGGI** — `templateConfig:48` punya signature
  `['pimpinan','notulen']`; task 4.1 tidak menyentuh jalur notulen → setelah task 1.10
  menghapus fallback, **TTD notulen & pimpinan cetak KOSONG permanen** (mundur dari
  perilaku sekarang); **T-12 tidak menjangkau**. **D-9** `SignatureFooter` punya **2 cabang**
  (`useTwoColumn`, baris 22) → fallback ada di **8 baris** (94, 99, 106, 109, 137, 140,
  148, 151), bukan 1. Dampak: task **4.1 diperluas** (+notulen) · **4.3** diberi catatan ·
  **1.10** = 8 baris/2 cabang · **T-15 + C-15 baru** (test case **14 → 15**, checklist
  **14 → 15**) · gate 4.20 menambah T-15. **Task tetap 53 · file tetap 19 · T-02 tetap
  15 pola/73 baris · 0 dependency baru** — v5 memperjelas preskripsi + 1 guard, bukan
  memperluas cakupan. Terverifikasi juga: helper `val()` (`SPDForm:23-36`) vs `F()`
  (`SuratTugas:23-44`) **memang beda** → **D-2 benar**, Kelas B wajib label generik.
  ⏸️ **Menunggu keputusan user** atas 3 pertanyaan di `DRYRUN-T1.md` §8.
- **FASE 4 SPRINT 001 SELESAI & LULUS GATE BUILDER 2026-09-18** (task 4.1–4.20;
  **di-commit `8398fe1`** 2026-09-18, belum di-push; verifikasi UI runtime penuh
  menunggu /acceptance-runner konteks segar).
  Isi: **4.1** auto-fill `getSignatureRoles()` di `DokumenFormPreview.jsx` (SPT/SPPD:
  `namaPenandatangan`/`nipPenandatangan` dari `kepala-sekolah`, `namaMengetahui`/`nipMengetahui`
  dari `ketua-gugus`; notulen: `ttd_pimpinan_*`/`ttd_notulen_*` per D-8; undangan:
  `namaKetuaGugus`/`nipKetuaGugus`) · **4.2–4.8** `templateConfig.js` defaults dikosongkan
  (spt, surat_tugas ×2, undangan, sk_honorer, notulen.tempat, sppd.pengguna, bku npsn+namaSekolah)
  · **4.9–4.13** fallback cetak dihapus di SPDForm/SuratTugas/SuratUndangan + placeholder label
  generik · **4.14** SKHonorer 9 titik identitas kedua → prop-driven `sekolah`
  (baris kop kabupaten dikomposisi runtime; baris 98 `DINAS PENDIDIKAN` sengaja tetap)
  · **4.15–4.17** fallback cetak + placeholder di DokumenFormPreview/InfoKeuangan generik
  · **4.18–4.19** komentar JSDoc generik (dataContextBuilder, guruTendikParser,
  TabelLetterHeader — termasuk koreksi "PEMERINTAH KABUPATEN" di komentar SKHonorer:5).
  **Bukti gate (4.20):**
  (a) **T-01** `npm run build` **LULUS** — `✓ built in 4.63s`, 178 modules,
  `BUILD_EXIT_0` (exit code 0 diverifikasi; runtime Node **v24.19.0 / npm 11.17.0**
  *system fallback* — hash artefak terverifikasi identik di kedua runtime, koreksi v4);
  warning chunk >500 kB sudah ada sebelumnya, bukan regresi.
  (b) **T-02: 0 hit / 0 aset terjaring** — 15 pola via
  `Get-ChildItem -Recurse | Select-String` (Set-String -Recurse tidak ada di PS 5.1),
  hasil: `T-02: 0 HIT - BERSIH`, `TOTAL: 0`, aset `sourceFile` 0.
  (c) **T-12/T-15 (statik)** — jalur auto-fill terverifikasi di
  `DokumenFormPreview.jsx:1622-1705`: `sig['kepala-sekolah']`, `sig['ketua-gugus']`,
  `sig['pimpinan']`, `sig['notulen']` semua terhubung dengan prioritas
  formData → Data Sekolah → `''`; verifikasi runtime `getSignatureRoles()` via
  node langsung terhalang import extensionless (Vite-only) → uji UI runtime
  didelegasikan ke /acceptance-runner.
  (d) **T-14 (statik)** — SKHonorer baris 94/96/100/117/142/144/150/227 prop-driven
  dari `getSchoolData()`; T-02 menjamin 0 literal `Pasirhalang`/`Mandalamukti`.
- **FASE 6 SPRINT 001 SELESAI — SPRINT TUTUP (STATIK) 2026-09-18** (task 6.1–6.3;
  tanpa file kode — dokumentasi termasuk dalam commit `2e23441`).
  **6.1 Regresi 6 konsumen × 2 kondisi (T-11) — 12/12 kombinasi statik LULUS:**
  KopSurat (identitas+logo baca saat render, kosong → baris kosong, tanpa crash) ·
  SignatureFooter (2 cabang, `data.ttd_*_nama || roleConfig.nama` → '' jujur-kosong) ·
  SKHonorer (prop-driven `data.namaPihakKesatu || ks.nama`, null-safe) ·
  InfoKeuangan (`data.X || schoolData.X || ''`) · DokumentasiAIGenerate (fallback
  generik `'SD NEGERI ...'`, bukan nama riil — ⚠️ **observasi Sprint 002**: key
  `nama_sekolah` snake_case di baris 432 tak pernah cocok `getSchoolData()`
  camelCase → fallback generik selalu terpakai; tidak crash, di luar scope) ·
  signatureRoles (5 peran → `{label, nama:'', nip:''}` saat kosong).
  **6.2 GATE AKHIR LULUS:** (a) `npm run build` — `GATE62_BUILD_EXIT_0`,
  **179 modules**, `✓ built in 7.38s`; (b) **T-02 final verbatim** (pola diekstrak
  programatik dari ACCEPTANCE.MD, tidak diketik ulang) — `GREP EXIT: 1` = **0 HIT**;
  (c) smoke statik `DataSekolahPage.jsx` — load `mergePejabat(stored.pejabat)`
  null-safe, tulis deep-merge per peran, import `PEJABAT_ROLES`/`DEFAULT_PEJABAT`
  bersama; `PejabatSekolahPage.jsx` 226 baris ≤ batas.
  **6.3** `STATE.MD` + `ACCEPTANCE.MD` (checklist C-01…C-15 hijau + status T-11) +
  `DRYRUN-T1.md` (status V1/V3–V7) diperbarui — sprint ditutup **statik**;
  UI runtime (T-03…T-15, V2–V12, E-1/E-2) menunggu /acceptance-runner ulang utuh.
- **FASE 5 SPRINT 001 SELESAI & LULUS GATE BUILDER 2026-09-18** (task 5.1–5.4;
  di-commit `73174c0` — `feat:` terpisah; dokumentasi di `2e23441`).
  Isi: **5.1** `blocks/PeringatanData.jsx` BARU (67 baris ≤ batas 300; banner merah
  `border-red-300 bg-red-50` + `role="alert"`; **2 varian**: identitas sekolah kosong →
  teks "upload data sekolah terlebih dahulu" + tautan "Buka tab Data Sekolah"
  (`/dashboard/data-sekolah`) untuk T-05; identitas terisi → menyebut **HANYA** peran
  kosong dari `getPejabatStatus()` + tautan "Buka tab Pejabat Sekolah"
  (`/dashboard/pejabat-sekolah`) untuk T-06/E-2; `print:hidden`; baca storage SAAT
  RENDER → tidak basi, mendukung T-07) · **5.2** `TemplateEngine.jsx:82`
  `{mode === 'edit' && <PeringatanData />}` → mencakup **semua** form template ·
  **5.3** `DokumenFormPreview.jsx:1757` `{isTransport && <PeringatanData />}` di area
  tab Perjalanan Dinas — spt/sppd/undangan merender `mode="print"` di layar sehingga
  tidak tertutup pemasangan 5.2 (+ re-export `blocks/index.js`) · **5.4** gate di bawah.
  **Bukti gate (5.4):**
  (a) **T-01** `npm run build` **LULUS** — `BUILD_EXIT_0`, **179 modules** (+1 =
  modul `PeringatanData`);
  (b) **statik banner** — `print:hidden` ada; teks T-05 persis; 2 tautan aksi ada;
  0 warna terlarang (T-10: merah = indikator status layar, pengecualian sah per
  AGENTS.MD/CONSTITUTION — tidak pernah ikut cetak); 0 hit pola hardcode identitas;
  (c) banner terpasang di 2 titik (TemplateEngine edit-mode; DokumenFormPreview
  transport), di luar `.print-container` → tidak ikut tercetak;
  (d) **UI runtime** (screenshot T-05/T-06, V12 banner tidak ikut cetak) →
  /acceptance-runner konteks segar (sesi 2026-09-18 terputus di tengah eksekusi).
- **FASE 2 + FASE 3 SPRINT 001 SELESAI & LULUS GATE 2026-09-18** (task 2.1–2.8 + 3.1–3.6;
  user setujui lanjut 2026-09-18; **di-commit `8398fe1`** 2026-09-18).
  File: **2 halaman + 3 blok/preview diubah** —
  `pages/dashboard/DataSekolahPage.jsx` (import `PEJABAT_ROLES`/`mergePejabat` bersama,
  hapus definisi lokal 4 peran; load/upload/update `mergePejabat()`; kartu pejabat
  `idx===` + emerald/violet/amber → blue-only `bg-primary/10` + `text-primary`;
  badge "Terisi" → primary; header kartu logo amber/violet/blue → slate/primary netral;
  seksi **Data Gugus** baru: input `gugusNama` + `gugusAlamat` via `handleSaveGugus`
  ke `spj_data_sekolah`; akses `data.pejabat?.[role.key]` null-safe) ·
  `pages/dashboard/PejabatSekolahPage.jsx` (import bersama; `PEJABAT_ROLES` lokal +
  `gradient` + `defaultPejabat` dihapus → `PEJABAT_SUBLABELS` tampilan saja;
  load/update/reset `mergePejabat()`; header kartu `role.gradient` → `from-primary
  to-blue-600`; akses `?.[]` null-safe) ·
  `blocks/KopSurat.jsx` (logo sekolah kiri atas `spj_logo_sekolah` + logo dinas
  kanan atas `spj_logo_dinas` baca saat render; baris 13 → `PEMERINTAH {kabupaten}`
  dari Data Sekolah, kosong bila data kosong; baris dinas + provinsi bila ada) ·
  `blocks/KopGugus.jsx` (**prop-driven** per ADR F-4: `gugusNama`/`gugusAlamat` tanpa
  fallback literal; baris 9 → `PEMERINTAH {kabupaten}` dari prop; logo dari prop
  `data.logoGugus`; 0 pemanggilan storage di blok) ·
  `components/templates/DokumenFormPreview.jsx` (`undanganData` diisi
  `gugusNama`/`gugusAlamat`/`kabupaten`/`provinsi` dari `getSchoolData()` +
  `logoGugus` dari `spj_logo_gugus` — pemanggil yang baca storage, bukan blok).
  **Bukti gate (task 2.8 + FASE 3):**
  (a) `npm run build` **LULUS 2×** — `✓ 178 modules transformed` (`5.62s`, lalu `8.68s`),
  runtime **v24.19.0 / npm 11.17.0** (system fallback; determinisme vs v22.22.2
  sudah terverifikasi identik di v4);
  (b) **uji peran ke-6 data LAMA**: `roles: 6`, `old4-in-6-out: true`
  (4 lama utuh + ketuaGugus/notulen kosong), `null-safe: true`;
  (c) **T-10**: grep `emerald|violet|amber|rose-|cyan|gradient|idx ===` di kedua
  halaman = **0 hasil** (sisa `blue-*` sah, `primary/slate` sah);
  (d) **T-09 storage check**: grep pemanggilan storage di `KopGugus.jsx` = **0 hasil**
  (satu-satunya hit kata `storageHelper` ada di komentar keputusan F-4, bukan kode).
  ⚠️ **Catatan desain:** `KopSurat` sengaja tetap baca storage sendiri (pola blok lain
  + baca saat render anti nilai basi G6); yang prop-driven hanya `KopGugus` (ADR F-4).
  CSS hash berubah (`index-DdzAS_Re.css`) — wajar (warna kartu berubah).
- **FASE 1 SPRINT 001 SELESAI & LULUS GATE 2026-09-17** (task 1.1–1.12; **di-commit `8398fe1`** 2026-09-18).
  File: **1 baru + 5 diubah** — `utils/pejabatRoles.js` (baru, 47 baris) ·
  `utils/sekolahData.js` (84 → 116 baris, tanpa fallback, +resolver `allFields`,
  +`getPejabat`/`getPejabatStatus`/`isSchoolDataEmpty`/`findFieldByLabel`) ·
  `utils/signatureRoles.js` (40 → 47, konstanta → `getSignatureRoles()`) ·
  `blocks/KopSurat.jsx` · `blocks/SignatureFooter.jsx` (**8 fallback dihapus, 2 cabang**) ·
  `package.json` (14 dependency eksak).
  **Bukti gate (task 1.12):**
  (a) `npm run build` **LULUS** — `✓ 178 modules transformed` (naik dari 177 = modul baru),
  `✓ built in 7.38s`, runtime **v22.22.2**;
  (b) **T-02: 73 → 64 baris** — FASE 1 menutup **9** (sekolahData 6 + signatureRoles 2 +
  SignatureFooter 1), akuntansi cocok persis; `KopSurat:14` sengaja tetap (task 3.3/FASE 3);
  (c) **T-13**: 0 caret · **14/14 versi cocok `package-lock.json`** · lockfile tidak berubah;
  (d) **Uji data layer 22 PASS / 0 FAIL** — data kosong → semua kosong (tidak jatuh ke
  `BADRUDDIN`), `mergePejabat()` aman untuk data lama, `ketua-gugus` baca
  `pejabat.ketuaGugus` (**bug G7 tertutup**), `notulen` baca `pejabat.notulen`
  (**bukan `DEWI ERMIRAWATI`**), email/telepon/website terbaca dari `allFields`.
  ⚠️ **Catatan lingkungan:** `npm ci` diblokir sandbox (efek samping menghapus
  `@esbuild/win32-x64` — dipulihkan via `npm install @esbuild/win32-x64 --no-save`);
  build verifikasi memakai `--outDir dist-verify` karena `rm -rf dist` diblokir.
  Sisa artefak (`dist-verify/`, `dist/`, `verify-*.mjs`, cache vite) sudah masuk
  `.gitignore`, perlu dibersihkan manual oleh user.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v5)** — **FASE 1 Sprint 001 dikerjakan**:
  1 file baru + 5 file diubah (lihat blok FASE 1 di atas) + 6 file dokumentasi
  (`.gitignore`, `DECISIONS.MD`, `STATE.MD`, salinan audit 001, `BLUEPRINT.MD`,
  `ACCEPTANCE.MD`, `DRYRUN-T1.md`).
- **VERIFIKASI ULANG FASE 1 (2026-09-17, pasca-penutupan)** — seluruh angka gate diukur
  ulang dari worktree nyata sebelum laporan: `npm run build` **LULUS** (`✓ built in 7.61s`,
  artefak `index-DnR8JQGI.css` + `index-BOHDDs2P.js` — **hash CSS identik** dengan build
  v4 → build deterministik); **T-02 = 64 baris** memakai perintah kanonik 15 pola
  (`ACCEPTANCE.MD:77`), akuntansi cocok (73 − 9); cek aset `grep … | grep -i sourceFile`
  = **0**; **T-13 = 0 caret · 14/14 cocok lockfile**; `SignatureFooter.jsx` terbukti
  **8 fallback terhapus di 2 cabang** (`|| roleConfig.nama`/`.nip` di 8 titik, 0 sisa
  `defaultName`/`defaultNip`). ⚠️ **Catatan proses:** verifikasi pertama memakai grep
  ad-hoc 13 pola (salah) → hasil 25 baris; **perintah kanonik wajib disalin dari
  `ACCEPTANCE.MD`**, bukan diketik ulang.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v4)** — **verifikasi independen**
  terhadap 11 klaim pack v3 (semua COCOK) + koreksi klaim runtime (F-2 dibalik:
  runtime gate = **v22.22.2 managed**, bukan v24.19.0 system fallback; hash artefak
  build **identik** di kedua runtime). 5 file dokumentasi diubah, kode tidak disentuh.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v3)** — **revisi pack Sprint 001
  hasil DRY RUN Fase 1 + Fase 4 terhadap kode nyata**: 4 temuan baru (D-1 residual
  `templateConfig:51,295` + `DokumenFormPreview:1669` · D-2 literal dipecah Kelas A
  fallback-cetak vs Kelas B placeholder · D-3 NPSN dari Data Sekolah, `20212345` vs
  `20228636` · D-6 identitas sekolah KEDUA `Pasirhalang` di `SKHonorer.jsx`).
  Keempat dijawab user 2026-09-17: D-1 & D-2 "setuju", D-3 "npsn diambil dari data
  sekolah", D-6 "bersihkan semua sekarang (Rekomendasi)". Dampak: FASE 4 15 → **20
  task** · total 48 → **53 task** · file diubah 17 → **19** · test case 13 → **14**
  · pola gate T-02 11 → **15** (dengan flag `-i` wajib) · baseline T-02 terukur
  **73 baris di 15 file** · baris 98 `SKHonorer.jsx` (`DINAS PENDIDIKAN`) **sengaja
  tidak dibersihkan** (nama instansi tetap, identik `KopSurat.jsx:16` &
  `templateSuratHelper.js:486`). 4 ADR baru + section audit trail supersesi F-1c/F-1
  masuk `DECISIONS.MD`. 4 dokumen pack (REQUIREMENTS, BLUEPRINT, ACCEPTANCE,
  HANDOFF-PROMPT) + `DECISIONS.MD` + `STATE.MD` direvisi. Salinan audit
  `architect-pack-001…md` **diregenerasi v3** (**1459 baris** — v2 1143 baris
  diganti) dengan Lampiran check #5 **diperketat jadi per-baris**: 73 baris
  baseline T-02 terukur, setiap baris punya satu task bernama di BLUEPRINT.
  Riwayat check #5 (v1 → v2 → v3) tercatat di Lampiran §5e.
  `DRYRUN-T1.md` makin basi (predates v2 & v3 — hanya inti Fase 1; dry run
  Fase 4 belum pernah dilakukan sebelum sesi ini). Kode `spj-frontend/`
  **tidak disentuh**.
- Ledger perubahan sebelumnya **BELUM DI-COMMIT (2026-09-17 v2)** —
  revisi pack Sprint 001 hasil review: 5 temuan (F-1…F-5), 6 fase / 48 task,
  17 file diubah, 13 test case, baseline gate T-02 terukur 57 baris di 11 file.
  6 ADR masuk `DECISIONS.MD`. `REQUIREMENTS.MD:69` dikoreksi
  ("5 NIP 15× di 6 file" → 18× di 8 file).
- Ledger commit: `68de37f` (2026-09-14) — **pemecahan Sprint 001 → 001 + 002**:
  pack Sprint 001 ditulis ulang ke scope fondasi (4 dokumen), `planning/sprints/sprint-002/`
  baru (4 dokumen), salinan audit 001 di-rename + diregenerasi (677 baris) &
  002 baru (656 baris), `PRD.md` (kolom Sprint + DoD per sprint), `DECISIONS.MD`
  (+3 ADR, 2 superseded), `QUESTIONS.MD`, `.gitignore` (BKU tahunan.pdf).
  **Belum di-push** ke `origin/main`.
- Ledger sebelumnya: `cdc5abe` (2026-09-14) — **realign pack ke Bab 8.4**: pack = 4 dokumen,
  salinan audit Bab 8.5, `DRYRUN-T1.md` keluar pack, `PACK.md` + `BLUEPRINT.MD` lama
  dihapus, `STATE.MD` + `RISKS.MD` (insiden worktree #2). **Belum di-push.**
- Ledger: **Sprint 002 (2026-09-19)** — `c955019` (`fix:` nama_sekolah pra-sprint) ·
  `36b408f` (F1) · `6a5408f` (F2) · `e7c0150` (F3) · `6746d66` (F4) · `5b11f10` (F5) ·
  `c5872d8` (`docs:` task 5.4 STATE/DECISIONS/QUESTIONS/ACCEPTANCE) · `b2b0728`
  (`docs:` re-verifikasi §6 + koreksi C-09/R-1). 6 file kode disentuh (DokumenFormPreview,
  templateConfig, SuratTugas, SPDForm, SuratUndangan, DokumenSPJPage) + DokumentasiAIGenerate
  (fix). **RE-VERIFIKASI statik independen 2026-09-19: 11/11 gate + build LULUS, 0 cacat
  kode, 1 cacat dokumen (R-1, sudah dibereskan)** → `DRYRUN-REPORT.MD` §6. **UI runtime
  (T-03, T-05…T-09, T-11, E-1/E-2) BELUM diverifikasi** — acceptance-runner via subagent
  konteks-segar DITOLAK user sesi ini; wajib dijalankan di chat baru. **Belum di-push**
  (14 commit lokal ahead origin/main).
- Ledger: `73174c0` + `2e23441` (2026-09-18) — **Sprint 001 FASE 5+6**: `73174c0`
  (`feat:`) = 1 file baru (`blocks/PeringatanData.jsx`, 67 baris) + 3 file diubah
  (`blocks/index.js` re-export, `TemplateEngine.jsx` pasang edit-mode 5.2,
  `DokumenFormPreview.jsx` pasang tab Perjalanan Dinas 5.3); `2e23441` (`docs:`) =
  `STATE.MD`/`ACCEPTANCE.MD`/`DRYRUN-T1.md` diperbarui.
  FASE 6 = tanpa file kode: regresi statik 12/12 + gate akhir (build 179 modules
  exit 0, T-02 final 0 hit verbatim, smoke statik DataSekolahPage) + tutup loop.
  **Belum di-push.**
- Ledger: `8398fe1` (2026-09-18) — **Sprint 001 FASE 1–4**: 1 file baru
  (`pejabatRoles.js`) + 19 file kode diubah (FASE 1–4) + 14 file pack/dokumen
  (pack sprint-001 6 berkas, pack sprint-002 4 berkas, salinan audit 2 berkas,
  AGENTS/STATE/DECISIONS/QUESTIONS/RISKS/CONSTITUTION/README/ARCHITECTURE,
  `docs/PROGRESS.md` dihapus, `.gitignore`, `package.json` pin eksak).
  Gate FASE 4: T-01 build 178 modules exit 0 · T-02 15 pola → 0 hit / 0 aset.
  **Belum di-push.**
- Ledger sebelumnya: `9759c20` (2026-09-14) — pack Sprint 001 awal: PRD (18 user story,
  13 temuan G1–G13), `DECISIONS.MD` +14 ADR, `QUESTIONS.MD` tutup 1/buka 1. **Belum di-push.**
- Ledger sebelumnya: `21b7713` (2026-09-13) — koreksi sprint aktif → Sprint 001, hapus
  `docs/PROGRESS.md`, `.gitignore` agent dirs (`.zcode/`, `.workbuddy-ai/`),
  `README.md` GitHub-only. Juga **belum di-push**.
- Ledger: **/acceptance-runner RONDE-1 Sprint 003 (2026-10-01, sesi segar)** —
  12 PASS / 0 FAIL / 8 UNTESTED → REWORK (gap = browser mati, bukan bug).
  Detail: `planning/sprints/sprint-003/VERIFICATION-REPORT.MD` (untracked).
  HEAD sesi ini `983735b`; ledger ronde-2 `414b53d` (kode R8/R9) + `983735b`
  (pack+status). **Belum di-push** (branch ahead ±24+).
- Ledger: **Sprint 003 FASE 1–4 (2026-10-01)** — `17a266d` (F1 penerima+rename) ·
  `a3bd7e6` (F2 SummaryCard+jalur layar) · `41369ce` (F3 print-area 5-doc) ·
  `45129a9` (F4 MenuGuide) · `27c036b` (`docs:` BUILD-REPORT + STATE + ACCEPTANCE C-11/C-12) ·
  `e8af618` (`docs:` pack 003 masuk repo). 3 file baru + 3 file diubah, 0 dependency.
  Gate: build exit 0 ×6 · 15 pola 0 · 3 blok 0 input · blue-only 0 · diff warisan kosong.
  Runtime pencil browser: pill+popover+rename terbukti (R-1/R-2), cetak/T-09/E-2 UNTESTED.
  Detail: `planning/sprints/sprint-003/BUILD-REPORT.MD`. **Belum di-push** (branch kini ahead ±24).
- Ledger: **REVISI BKU T1-T7 (2026-10-02)** — `a53fd61` (T1-T4: 4 file, 370 ins 277 del) · `cc2456e` (T6 panel ATK: BKUPage 1 ins 50 del).
  Merge fast-forward tanpa konflik (T5, T7). Gate: build exit 0 tiap task (183 modul, 5.58s–15.85s) ·
  LPJ-mati 0 hit · non-blue tambah 0 · package 0 · cetak tak tersentuh · prefix spj utuh.
  Verifier FINAL APPROVED Medium (batas live klik+screenshot). **Belum push** (ahead 3), **belum acceptance fresh**.
  Detail: `planning/sprints/sprint-004/BUILD-REPORT.MD` §ADDENDUM REVISI 2026-10-02.
- Terakhir Diperbarui: 2026-10-18 (sesi "cek project" ronde-3 — Register Kas jadi tabel + Sub Jumlah (1)/(2) tidak lagi "Rp 0" + input lembar/keping + auto dari saldo tunai + nama SD di bar biru cover + bar sekat sama persis dengan cover + landscape fix; build exit 0, oracle 24/24, PDF bukti; tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-18 (sesi "cek project" ronde-2 — build dipulihkan dari `bap_kas` duplikat, 4 keputusan user dieksekusi, gate T-02 5→2 residual, junk root + .gitignore bersih, WIP Cover/Sekat dicatat sebagai blocker proses; tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-10 (state-keeper tutup Sprint 011 — SELESAI + push 9a14f88 + ADR cari+centang + risiko TOLAK_KEY yatim + QUESTIONS G-1/E-1 closed; E-2/cetak fisik jadi blocker; tanpa ubah pack/src, tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-07 (state-keeper sinkron pasca-push TTD kanan — merge 0c5d986 + push 14e5077..0c5d986 masuk STATE + 1 ADR baru; main sinkron origin; tanpa ubah src, tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-06 (state-keeper sinkron pasca-push tab pajak — merge 14e5077 + push 0ae1638..14e5077 masuk STATE + 2 ADR baru; main sinkron origin; tanpa ubah src, tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-06 (state-keeper tutup sesi — merge 9659372/32c5b7e/0ae1638 masuk STATE + 6 ADR baru; main sinkron origin; tanpa ubah src, tanpa commit/push)
- Terakhir Diperbarui sebelumnya: 2026-10-02 (T8 docs — revisi BKU T1-T7 masuk STATE + BUILD-REPORT; commit docs terpisah, tanpa merge/push)
- Terakhir Diperbarui sebelumnya: 2026-10-01 (/state-keeper — Sprint 003 Fase 1–4 tutup builder;
  ledger komit `17a266d`…`e8af618`; risiko cetak-fisik UNTESTED; ARCHITECTURE.MD stale
  bertambah: SummaryCard/MenuGuide/guideConfig/print-area)
- Terakhir Diperbarui sebelumnya: 2026-09-30 (pack Sprint 003 jadi + cross-artifact check lulus;
  Sprint 001+002 APPROVED via /acceptance-runner — VERIFICATION-REPORT.MD ×2; risiko
  UI runtime UNTESTED diterima eksplisit user)
- Terakhir Diperbarui sebelumnya: 2026-09-19 (/state-keeper — Sprint 002 tutup statik + re-verifikasi 11/11 LULUS + R-1 dibereskan; ledger commit `c955019`…`b2b0728`; RISKS `nama_sekolah` RESOLVED; blocker UI runtime dicatat)

## Riwayat Sprint
| Sprint | Nama | Status | Tanggal |
|--------|------|--------|---------|
| 000 | ONBOARDING — titik adopsi workflow (ditutup `2ad42e9`, commit terakhir `2bd80cb`) | ✅ Selesai | 2026-09-13 |
| 001 | Fondasi Data Sekolah & Pejabat — US-13…US-18 (**APPROVED 2026-09-30** acceptance-runner konteks segar; commit `8398fe1` + `73174c0` + `2e23441`; UI runtime UNTESTED — risiko diterima user) | ✅ Selesai | 2026-09-17 |
| 002 | Rework Modul Perjalanan Dinas — US-01…US-12 (**APPROVED 2026-09-30** acceptance-runner konteks segar; commit `36b408f`→`5b11f10` + `c955019`; UI runtime UNTESTED — risiko diterima user) | ✅ Selesai | 2026-09-19 |
| 003 | Rework Lapisan Preview & Panduan Langkah — US-19…US-30 (FASE 1–4 + revisi R1…R9 `17a266d`→`414b53d`; acceptance ronde-1 12 PASS/0 FAIL/8 UNTESTED → **✅ DITUTUP 2026-10-01, risiko diterima user**, ronde-2 dibatalkan) | ✅ Selesai | 2026-10-01 |
| 005 | Autogenerate Undangan + Resume — builder statik selesai (1 baru + 3 ubah, gate hijau, runtime UNTESTED → acceptance-runner) | 🟡 Builder selesai | 2026-10-03 |

| 008 | Panel Preview Document A4 ala SIMENULIS + SK Honor + fixes blank/logo (merge `9659372`; acceptance manual runtime TERBUKA) | U0001F7E1 Menunggu acceptance | 2026-10-06 |
| 009 | Pecah pesanan Nasi/Snack + sticky preview + hapus Ringkasan + logo/TTD preview + TTD 4 baris (merge `9659372`; Fase A in-progress, Fase B selesai) | U0001F7E1 Berjalan | 2026-10-06 |
| 011 | Paket Sumber Baris + Toggle SIPLAH PBJ — panel cari+centang ganti chips/Tolak-per-kartu (merge `e28e976` + state `9a14f88`; T-04'/T-05'/C-03/C-04 4/4 PASS task 71; E-2 + cetak fisik UNTESTED) | SELESAI | 2026-10-10 |
## Langkah Selanjutnya
- **Sesi 2026-10-18. Berikutnya (urutan):**
  1. **Architect pack Sprint 012** untuk WIP Cover/Sekat + dokumen kas (6 template) — WIP sudah ada di working tree tapi tanpa pack; sesuai AGENTS.MD pack dulu, lalu dry run, lalu eksekusi.
  2. **Commit WIP** (hanya setelah paket Reviewed — `templateConfig.js`, `DokumenKelengkapanPage.jsx`, `previewDocs.js`, `TemplateEngine.jsx`, `blocks/index.js` + baru `CoverHeader.jsx`, `dokKas.js`, `public/logo-dinas.png`) — **tanpa** artefak junk; commit/push = kuasa user.
  3. **Bersihkan residual T-02** (`KopGugus.jsx:17` + komentar `SignatureFooter.jsx:8`) — blok `KopGugus` shared → butuh task sendiri di pack, tidak boleh di luar cakupan.
  4. **Bersihkan `TOLAK_KEY` yatim** (G-2 Sprint 011) — `paketPbj.js` export + param `tolakSet` + komentar; grep `keranjang_tolak|tolakSet` = 0.
  5. `/acceptance-runner konteks segar` — Sprint 005 (task 12), Sprint 007 (task 18), Sprint 008 (task 28) masih antre.
- **Tutup Sprint 011 2026-10-10 (`9a14f88`, main sinkron origin). Berikutnya:**
- **Tutup Sprint 011 2026-10-10 (`9a14f88`, main sinkron origin). Berikutnya:**
  1. **E-2 + cetak fisik** — upload PDF asing di mode SIPLAH (fallback manual jujur) + cetak fisik panel cari+centang & gate 1-dokumen SIPLAH (UNTESTED, printer-gated).
  2. **Sprint berikut: bersihkan `TOLAK_KEY` yatim (G-2 OPEN-kode)** — export + param `tolakSet` + komentar tanpa UI di `paketPbj.js`/`DokumenKelengkapanPage.jsx` (pack sudah steril: key dihapus dari BLUEPRINT/storage-list).
  3. **/acceptance-runner konteks segar** — Sprint 005 (task 12), Sprint 007 (task 18), Sprint 008 (task 28) masih antre (acceptance runtime TERBUKA).
- **Sinkron pasca-push TTD kanan 2026-10-07 (`0c5d986`). Berikutnya (acceptance runtime TERBUKA):**
  1. **/acceptance-runner konteks segar** — Sprint 005 (task 12), Sprint 007 (task 18), Sprint 008 (task 28: 3 zona + form kosong + landscape).
  2. Lanjutkan **Sprint 009 Fase A** (task 35, in-progress) + eksekusi Sprint 007 (task 17).
  3. Cetak fisik F4 + print-preview live (UNTESTED, printer-gated).
- **Sinkron pasca-push tab pajak 2026-10-06 (`14e5077`). Berikutnya (acceptance runtime TERBUKA):**
  1. **/acceptance-runner konteks segar** — Sprint 005 (task 12), Sprint 007 (task 18), Sprint 008 (task 28: 3 zona + form kosong + landscape).
  2. Lanjutkan **Sprint 009 Fase A** (task 35, in-progress) + eksekusi Sprint 007 (task 17).
  3. Cetak fisik F4 + print-preview live (UNTESTED, printer-gated).
- **Tutup sesi 2026-10-06. Berikutnya (acceptance runtime TERBUKA):**
  1. **/acceptance-runner konteks segar** — Sprint 005 (task 12), Sprint 007 (task 18), Sprint 008 (task 28: 3 zona + form kosong + landscape).
  2. Lanjutkan **Sprint 009 Fase A** (task 35, in-progress) + eksekusi Sprint 007 (task 17).
  3. Cetak fisik F4 + print-preview live (UNTESTED, printer-gated).
- **Sprint 003 SELESAI (risiko diterima). Berikutnya:**
  1. **Push ke origin** — branch ahead ±24+ commit (pelajaran insiden #3).
  (aturan AGENTS.MD) — wajib membuktikan runtime T-04/T-05 (cetak 5-doc fisik),
  T-06/T-07 (PNS/PPPK muncul, honor-only), T-09 (config-driven revert-test),
  E-2, dismiss permanen, print-hidden. Statik sudah lulus (BUILD-REPORT.MD).
  1. **Push ke origin** — branch ahead ±24 commit (pelajaran insiden #3).
- **Sprint 002 FASE 1–5 SELESAI (STATIK) 2026-09-19 — seluruh fase di-commit
  `36b408f`→`5b11f10` (+ fix pra-sprint `c955019`); docs task 5.4 (STATE/DECISIONS/
  QUESTIONS/ACCEPTANCE) di-commit terpisah. Menunggu: push + acceptance-runner.**
  ⏸️ **Berhenti di sini.** Yang menunggu user:
  1. **Push ke origin** — 12 commit lokal masih **belum di-push** (Sprint 001 + 002 +
     fix; pelajaran insiden #3: push = jaring pengaman sesungguhnya).
  2. **/acceptance-runner ulang utuh di konteks segar** (aturan AGENTS.MD) — wajib
     membuktikan UI runtime Sprint 002 (T-03…T-11: form SPT/SPD/Undangan, print-area
     kop→TTD, 3 blok SPD, reset localStorage) **dan** Sprint 001 (T-03…T-15, V2–V12,
     E-1/E-2) sebelum kedua sprint dinyatakan lulus penuh.
  3. Setelah itu → sprint berikutnya (lihat PRD umbrella; sisa US di luar 001/002) atau
     REWORK keamanan bertahap (docs/SECURITY-AUDIT-001.md §8).
- **Sprint 001 FASE 1–6 SELESAI (STATIK) — seluruh fase di-commit: FASE 1–4 `8398fe1`,
  FASE 5 `73174c0` (`feat:`), FASE 5–6 docs `2e23441`; menunggu: push +
  acceptance-runner ulang utuh.**
  ⏸️ **Berhenti di sini.** Yang menunggu user:
  1. **Push ke origin** — commit `8398fe1` + `2dde982` + `73174c0` + `2e23441` +
     riwayat (9759c20, 21b7713) masih **belum di-push** (pelajaran insiden #3:
     push = jaring pengaman sesungguhnya).
  2. **/acceptance-runner ulang utuh di konteks segar** (aturan AGENTS.MD) — sesi
     2026-09-18 terputus di tengah (baru T-01/T-13); wajib membuktikan UI runtime
     T-03…T-15 + V2–V12 + E-1/E-2 sebelum sprint dinyatakan lulus penuh.
  3. Setelah itu → **Sprint 002** (Rework Modul Perjalanan Dinas) — prasyarat
     `blocks/PeringatanData.jsx` & kontrak data Sprint 001 sudah tersedia.
     **(SUPERSEDED — Sprint 002 kini sudah dikerjakan & tutup statik 2026-09-19;
     lihat blok di atas.)**
  Blok "Sprint 001 FASE 1–3 SELESAI — menunggu keputusan user: commit + izin FASE 4"
  di bawah **superseded** oleh blok ini (FASE 4 sudah dikerjakan 2026-09-18 atas
  persetujuan user; riwayat dibiarkan untuk audit trail).
- **Bersihkan artefak verifikasi manual** (sandbox menolak hapus; sudah di `.gitignore`):
  `spj-frontend/dist/`, `spj-frontend/dist-verify*/`, `spj-frontend/verify-*.mjs`,
  `spj-frontend/vite.config.js.timestamp-*.mjs`.
- Setelah Sprint 001 selesai → **Sprint 002** (`planning/sprints/sprint-002/HANDOFF-PROMPT.MD`);
  verifikasi prasyarat dulu (langkah pertama prompt Builder).
- ✅ /idea-clarifier (ritel 27.3 Tahap 2 langkah 4) SELESAI 2026-09-14 — brief final
  16 user story; `/prd-generator` juga selesai → PRD ditulis ke
  `planning/sprints/sprint-001/PRD.md`
- Verifikasi test cetak 13 template (lihat RISKS.MD)
- REWORK keamanan bertahap → lihat docs/SECURITY-AUDIT-001.md §8 (sprint berikutnya)
- Warisan NEXT STEPS `docs/PROGRESS.md` yang masih terbuka (dipindah 2026-09-13
  saat file itu dihapus): implementasi sub-kategori "Coming Soon",
  deploy ke Vercel
- Sisa dokumen legacy: `docs/PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md` usang
  (menyarankan Laravel, padahal stack aktual = React + Vite tanpa backend).
  Riset Jul–Agu lain = arsip riset, bukan spec — jangan dijadikan acuan implementasi.
  (`README.md` sudah beres 2026-09-13 — GitHub-only, lihat DECISIONS.MD.)

## Blockers
- **2026-10-18 (proses): WIP Cover/Sekat + dokumen kas tanpa architect pack.** Kode sudah ada di working tree tapi belum punya pack Sprint 012 → sesuai AGENTS.MD, pack + dry run dulu sebelum lanjut eksekusi/acceptance. Blocking untuk sprint berikutnya, TIDAK memblok build (build hijau).
- **2026-10-18 (data): 2 residual hardcode T-02 yang sudah ada di HEAD** — `blocks/KopGugus.jsx:17` (kabupaten literal) + komentar `blocks/SignatureFooter.jsx:8`. Keduanya di blok cetak SHARED → tidak boleh disentuh di luar task pack sendiri.
- **2026-10-10 (tutup Sprint 011): E-2 UNTESTED + cetak fisik UNTESTED (printer-gated).** Upload PDF non-invoice di mode SIPLAH belum diuji live (butuh fixture PDF asing; jalur fallback manual jujur ada di kode). Cetak fisik panel cari+centang + gate 1-dokumen SIPLAH belum terbukti di printer. Non-blocking: sprint dinyatakan SELESAI (4/4 PASS task 71); temuan cetak masuk sprint berikut.
- **2026-10-07 (sinkron TTD kanan): TIDAK ADA blocker.** Main sinkron origin/main (`0c5d986`); baris push-tertunda di bawah SUPERSEDED.
- **2026-10-06 (sinkron pajak): TIDAK ADA blocker.** Main sinkron origin/main (`14e5077`); baris push-tertunda di bawah SUPERSEDED.
- **2026-10-06: TIDAK ADA blocker.** Main sinkron origin/main (`0ae1638`); baris push-tertunda di bawah SUPERSEDED.
- **TIDAK ADA blocker sprint.** Pencatatan risiko (non-blocking, diterima user
  2026-09-30): kriteria UI runtime Sprint 001+002 tetap UNTESTED — uji manual
  operator sekolah adalah jaring pengamat; temuan masuk Sprint 003.
- **Push ke origin tertunda** — ±14 commit lokal (Sprint 001 + 002 + fix) belum
  di-push (pelajaran insiden #3: push = jaring pengaman sesungguhnya).

## Catatan Penting
- **Sprint 002 ditutup STATIK 2026-09-19** (dicatat Builder, task 5.4): FASE 1–5
  selesai, semua lulus gate Builder (build exit 0 · grep `surat_tugas` rescoped = 0 ·
  grep `<input|<textarea` 3 blok = 0 · 4 string legal SPD persis docx · 15 pola
  anti-hardcode Sprint 001 tetap 0 hit · 6 konsumen tidak tersentuh · blue-only).
  Commit: `c955019` (fix pra-sprint `nama_sekolah`) · `36b408f` (F1) · `6a5408f` (F2) ·
  `e7c0150` (F3) · `6746d66` (F4) · `5b11f10` (F5) + commit docs ini. **3 koreksi dry
  run disetujui user** (D-1 rescope T-02, D-2 placeholder generik, D-3 perluas T-04) —
  ADR bagian M di `DECISIONS.MD`, detail di `DRYRUN-REPORT.MD`. **UI runtime (T-03…T-11)
  belum terbukti — wajib /acceptance-runner ulang utuh di konteks segar.** Batas tegas
  dipertahankan: **001 = sumber nilai · 002 = struktur & layout** (5 file tumpang tindih).
  ⚠️ **docs/ARCHITECTURE.MD STALE** (refresh saat planning sprint berikutnya): belum
  mencatat (a) `blocks/PeringatanData.jsx` baru [Sprint 001], (b) tab "Surat Tugas"
  dihapus → satu dokumen = satu tab, (c) 3 blok cetak kini murni (0 `<input>`/`<textarea>`),
  (d) tombol Reset Data Dokumen LPJ di DokumenSPJPage, (e) [Sprint 003]
  `SummaryCard.jsx` + `guide/MenuGuide.jsx` + `data/guideConfig.js` baru,
  (f) jalur layar transport/mamin = kartu ringkasan + print-area 5-doc,
  (g) `renderMaminPreview()` terpisah di `DokumenFormPreview.jsx`,
  (h) `getSemuaPegawai()` di `honorHelper.js`.
- **Sprint 001 ditutup STATIK 2026-09-18** (dicatat /state-keeper): FASE 1–6 selesai,
  semua lulus gate Builder (build exit 0, T-02 15 pola 0 hit verbatim, regresi
  6 konsumen × 2 kondisi = 12/12). Commit: `8398fe1` (FASE 1–4) · `73174c0`
  (`feat:` FASE 5) · `2e23441` + `58ecc25` (`docs:`). **UI runtime (T-03…T-15,
  V2–V12, E-1/E-2) belum terbukti — wajib /acceptance-runner ulang utuh di konteks
  segar sebelum sprint dinyatakan lulus penuh** (sesi runner 2026-09-18 terputus
  di T-01/T-13). `docs/ARCHITECTURE.MD` STALE: `blocks/PeringatanData.jsx` baru
  belum terdokumentasi (refresh saat planning sprint berikutnya).
- File agent lama `docs/AGENT.md` (2026-07-30) dipindah 2026-09-13: router → `AGENTS.MD`
  (root), domain → `DOMAIN.MD`, keputusan → `DECISIONS.MD`. Kini HANYA ADA SATU
  file agent: `AGENTS.MD`.
- Spesifikasi teknis monolit `docs/STANDAR-TEKNIS.md` (2026-09-13) diekstrak 2026-09-13
  ke 5 dokumen standar Bab 6.1: `docs/ARCHITECTURE.MD`, `docs/DATA-MODEL.MD`,
  `docs/API.MD`, `docs/PERMISSIONS.MD`, `docs/VALIDATION.MD` — file monolit dihapus.
- **`docs/PROGRESS.md` DIHAPUS 2026-09-13** — tracker legacy di luar struktur workflow
  standar; tidak pernah di-update sejak adopsi (terakhir 2026-09-08). Status kini
  HANYA di `STATE.MD` (+ pack sprint aktif). Referensi ke file itu di `AGENTS.MD`,
  `CONSTITUTION.md`, `docs/ARCHITECTURE.MD`, `README.md` sudah dialihkan ke `STATE.MD`.
  Isi lama tetap ada di git history (`git log -- docs/PROGRESS.md`).
- Status legacy per docs/AGENT.md (2026-07-30): ~95% fitur selesai — klaim tidak
  diverifikasi ulang. Tidak ada lagi tracker status terpisah.
- Titik adopsi: commit `9cdcd10` (2026-08-21, "fix ai response") — commit terakhir
  SEBELUM adopsi. Hasil adopsi ter-commit di `8544246` (scaffold + konstitusi) dan
  `6ed57d6` (pekerjaan fitur legacy yang tertunda), keduanya sudah di-push ke main.
- Kode existing TIDAK dipindah/diubah saat adopsi (aturan emas adopsi 27.8)
- Workflow berlaku MAJU: semua kerja baru ikuti pipeline penuh; TIDAK ADA sprint fitur
  sebelum baseline keamanan selesai (27.8.2)
- INSIDEN 2026-09-13: seluruh folder `docs/` (68 file tracked) hilang dari worktree
  saat `git rm docs/PROGRESS.md` dijalankan — penyebab belum diketahui (tidak ada
  hook non-sample, `core.sparseCheckout` tidak aktif, `git reflog` bersih). Dipulihkan
  penuh via `git checkout -- docs/`; verifikasi `git diff HEAD` hanya berisi perubahan
  yang diniatkan. Terjadwal di RISKS.MD.
- **INSIDEN #2, 2026-09-14: TERULANG, trigger sekarang TERKONFIRMASI = `git rm`.**
  Menjalankan `git rm -q architect-packs/sprint-001/PACK.md architect-packs/sprint-001/BLUEPRINT.MD`
  membuat SELURUH direktori `architect-packs/` hilang dari worktree — termasuk
  `architect-packs/architect-pack-001-perjalanan-dinas.md` yang **untracked**
  (file itu HILANG TOTAL, tanpa jaring pengaman git) dan `architect-packs/.gitkeep`
  yang terlihat ` D` di `git status`. Pola identik dengan insiden #1.
  **Dua insiden, satu trigger sama → `git rm` DIANGGAP PENYEBAB.** Aturan baru:
  hapus file lewat `git rm` hanya bila direktori sudah bersih & tidak ada file
  untracked di dalamnya; jika tidak, pindahkan/hapus manual lalu `git add -A`.
  Pemulihan: `mkdir -p <dir>` → `git checkout -- <dir>/.gitkeep` → regenerasi
  file untracked yang hilang. Terjadwal di RISKS.MD.
- ⚠️ **INSIDEN #3 (2026-09-17) — `.git/` RUSAK TOTAL, PALING BERAT.** `git stash push -u`
  yang **ter-SIGTERM di tengah jalan** menghapus `.git/refs/`, `.git/packed-refs`, dan
  **seluruh isi `.git/objects/`** (0 objek tersisa; `.pack` hilang, hanya `.idx` orphan sisa)
  → git tidak mengenali repo (`fatal: not a git repository`).
  **Kehilangan permanen: 5 commit lokal** (`bb561c6`, `cdc5abe`, `68de37f`, `849a75b`,
  `5c2b400`) — semuanya belum pernah di-push, objeknya tidak ada di mana pun.
  **Isi file SELAMAT 100%** (disk + backup 100 file) — hanya riwayat git yang hilang.
  **Pemulihan BERHASIL**: `mkdir .git/refs/heads` → `git fetch` → tulis ref manual →
  `rm .git/index && git reset` → `git fetch --refetch` → tulis `origin/main` →
  bersihkan reflog basi. Hasil: `git fsck --connectivity-only` **BERSIH**,
  `[origin/main]` tracking normal. HEAD kini di **`2bd80cb`** (2026-09-13), sehingga
  seluruh kerja 2026-09-14…17 tampil sebagai perubahan **belum di-commit**.
  Detail prosedur + aturan baru di `RISKS.MD` (insiden #3).
  🔴 **ATURAN BARU: DILARANG `git stash` · `git gc` · `git repack` · `git prune` ·
  `git rm` · `git clean -fd` · `git reset --hard`.** Untuk membatalkan perubahan:
  backup `cp -r` dulu + `git checkout -- <file>` per file. **Commit + PUSH sesering
  mungkin** — commit lokal saja bukan jaring pengaman.
- 2026-09-13: `.zcode/` + `.workbuddy-ai/` masuk `.gitignore` (direktori kerja agent,
  bukan bagian repo). `README.md` ditetapkan **GitHub-only** — agent tidak membacanya
  (lihat DECISIONS.MD + marker di kepala README + AGENTS.MD).
- **Struktur pack sprint (2026-09-14):** pack = **4 dokumen Bab 8.4** di
  `planning/sprints/sprint-XXX/` (`REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
  `HANDOFF-PROMPT.MD`). `architect-packs/architect-pack-XXX-<slug>.md` = **salinan audit
  trail** Bab 8.5 (gabungan 4 dokumen + **Lampiran cross-artifact consistency check**).
  Struktur lama (`PACK.md` + `BLUEPRINT.MD` di `architect-packs/sprint-001/`) **dihapus**;
  lihat ADR "Struktur pack sprint = 4 dokumen Bab 8.4".
- **`PRD.md` = umbrella dua sprint.** PRD (18 user story) tetap di
  `planning/sprints/sprint-001/` dan **tidak dipecah** — ia sumber requirement untuk
  Sprint 001 **dan** Sprint 002. Pembagiannya: US-13…US-18 → Sprint 001 ·
  US-01…US-12 → Sprint 002 (kolom "Sprint" di PRD §9 Traceability).
- **Pemecahan sprint (2026-09-14):** Sprint 001 dipecah jadi 001 (fondasi) + 002 (rework
  dokumen) setelah cross-artifact check #5 menemukan dua kandidat tujuan. Sprint 002
  **wajib menunggu** Sprint 001 selesai (kontrak fungsi belum ada). Lihat ADR.
- **Aturan baru akibat insiden worktree #2:** **HINDARI `git rm`.** Hapus file dengan
  `rm <path>` lalu `git add -A`. `git rm` dua kali membuat seluruh direktori induk hilang
  dari worktree (2026-09-13 `docs/`, 2026-09-14 `architect-packs/`), dan file **untracked**
  di dalamnya hilang permanen. Detail + prosedur pemulihan di `RISKS.MD`.
