# HANDOFF PROMPT — Sprint 015: Import BKU PDF (OCR)

> **REVISI 2026-10-19 v2 (review pack + verifikasi ke repo)** — 4 cacat
> diperbaiki di dokumen ini: bootstrap tidak lagi menunjuk file yang sudah
> dihapus, perintah dari bash → PowerShell 5.1, dan mekanisme reuse
> `redetectTypes()` stated eksplisit supaya builder tidak ikut menulis
> `export` ke file TABU.

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
3. TUNGGI persetujuan user SEBELUM coding (aturan AGENTS.MD)

## Bootstrap Command Block (jangan tebak sendiri — jalankan ini)

> ⚠️ **Semua perintah = PowerShell 5.1.** Mesin ini **tidak punya `bash`**;
> `grep`/`wc`/`tail`/`ls` **tidak tersedia**. Yang ada: `rg` (ripgrep), `git`,
> `node`, `npm`, `python`. Jalankan dari root repo `D:\project\spj-app`.

```powershell
# 1. Sanity file masukan (SEMUA harus True sebelum lanjut)
Write-Output ("PDF contoh     : " + (Test-Path 'template/contoh format BKU-PDF tahunan.pdf'))
Write-Output ("Excel baseline : " + (Test-Path 'template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx'))
Write-Output ("bkuParser.js   : " + (Test-Path 'spj-frontend/src/utils/bkuParser.js'))
Write-Output ("gen_fixture.py : " + (Test-Path 'scratch-pdf-check/gen_fixture_rest.py') + "  <- False itu NORMAL, tugas 0.1")

# 2. Baseline build (Harus BUILD_EXIT=0)
Push-Location spj-frontend
npm run build; $sb = $LASTEXITCODE
Pop-Location
Write-Output "BUILD_EXIT=$sb"
node -v; npm -v          # expect v24.19.0 / 11.17.0

# 3. Baseline T-02 (boleh 4 hit pre-existing — lihat ACCEPTANCE §T-02)
rg -ni "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src
# JANGAN pakai -E (itu = --encoding di ripgrep)

# 4. Dev server (background, untuk pengujian manual)
Push-Location spj-frontend; npm run dev; Pop-Location   # http://localhost:5173
```

**Exit-code build dibaca via `$LASTEXITCODE` — JANGAN pakai `$?` ala bash.**
`npm run build | tail -3; echo $?` di bash = hijau palsu (`$?` = exit `tail`).
Di PowerShell `$LASTEXITCODE` benar (terbukti: kontrol negatif
`node -e "process.exit(7)"` → `7`). Bentuk tanpa pipe tetap dipakai karena eksplisit.

> ⚠️ **Generator fixture TIDAK ADA** — `scratch-pdf-check/` dihapus saat
> reset sprint-013. `gen_fixture_rest.py` **wajib ditulis ulang** (tugas 0.1);
> reset sprint-013. `gen_fixture_rest.py` **wajib ditulis ulang** (tugas 0.1);
> jangan menunggu file yang tidak ada. Prasyarat OCR **sudah terverifikasi**:
> `python -c "from rapidocr_onnxruntime import RapidOCR"` → OK (Python 3.14).
> Yang **belum** terverifikasi = renderer PDF→gambar:
> ```powershell
> pip show pypdfium2; pip show PyMuPDF    # kalau kosong → pip install (catat eksplisit)
> ```

Sanity yang diperlukan sebelum lanjut: `BUILD_EXIT=0`, URL dev
server 200, file PDF contoh + Excel ada, dan TASK 0.1 punya rencana.

## Aturan kerja (ikuti BLUEPRINT fase 0..4, jangan melompat)

- Fase 0 (fixture+oracle) → Fase 1 (parser, 0 selisih Januari) →
  Fase 2 (A/B engine berangka + ADR) → Fase 3 (UI+commit) →
  Fase 4 (gate akhir)
- Satu task selesai = DoD hijau + output di-paste (shift-left)
- DSA-line hot path wajib: parser & commit tulis atomik (lihat
  BLUEPRINT)
- **REUSE deteksi tipe/kategori lewat `redetectTypes()`** yang sudah
  diekspor dari `bkuParser.js` — JANGAN menambah `export` ke
  `detectTransactionType`/`detectKategoriBelanja` (file itu TABU, G-1 = 0 diff),
  dan JANGAN menyalin logikanya ke file baru
- ENGINE GAGAL: bila hasil A/B kedua engine tidak mencapai
  T-08 ≥ 90% → STOP; lapor user; JANGAN lanjut paksa
  (preseden sprint-013)

## JANGAN

- DILARANG mulai coding sebelum dry run disetujui
- DILARANG mengubah requirements/pack tanpa persetujuan user
- DILARANG memakai dependency di luar BLUEPRINT (versi ter-pin eksak)
- DILARANG menyentuh `src/utils/bkuParser.js` (G-1 = 0 diff) atau
  mengubah jalur Excel yang ada
- DILARANG mengexport/redefine fungsi dari `bkuParser.js` di file lain —
  pakai `redetectTypes()` (lihat Aturan kerja)
- DILARANG melemahkan/mematikan test/kriteria (skip, expected
  diturunkan, konstanta dipoles agar lulus) — termasuk "mengoreksi" 4 hit
  baseline T-02 yang memang di luar cakupan
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
- Halaman: `/dashboard/bku` (menu BKU — route `App.jsx:57`), tombol Upload PDF
- File uji: `template/contoh format BKU-PDF tahunan.pdf` (21 hal, tanpa text layer)
- Bulan uji: Januari (target oracle)
- Devtools → Console harus **0 error**; Network tidak boleh ada 404/500
