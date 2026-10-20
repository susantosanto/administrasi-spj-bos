# HANDOFF PROMPT — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Disusun 2026-10-20. Ditujukan ke **builder** (ZCode / agen berikutnya).
> Pack ini sudah lengkap: `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
> `PRD.md` · `HANDOFF-PROMPT.MD` (ini).
> **Jangan mulai coding sebelum dry run dilaporkan dan user menyetujuinya.**

## Prompt untuk Builder

Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.4 — Tahap 4).

Tugas Anda untuk **Sprint 016**: membuat jalur impor PDF BKU menulis **semua bulan
sekaligus** dan mengganti seluruh `spj_bku_data`, dengan hasil identik jalur Excel.

Langkah:
1. Baca berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` (khususnya **§S1–S3**) →
   `DOMAIN.MD` → `CONSTITUTION.md` → pack `planning/sprints/sprint-016/`
   (`REQUIREMENTS.MD` → `BLUEPRINT.MD` → `ACCEPTANCE.MD` → `PRD.md`).
2. **Dry run**: laporkan rencana per file (M1–M5 di `BLUEPRINT.MD` §0), termasuk
   **angka `recalcSummary` sebelum vs sesudah** untuk data Excel (risiko #1 BLUEPRINT §3.2).
3. **TUNGGU persetujuan user** sebelum menulis kode (AGENTS.MD).
4. Implementasi → jalankan **semua** gate ACCEPTANCE → laporkan dengan output asli.
5. Update `STATE.MD` + checklist pack. Commit **hanya** setelah user menyetujui.

## Aturan Keras (pelanggaran = sprint ditolak)

| Larangan | Alasan |
|---|---|
| Mengubah `src/utils/bkuParser.js` | TABU, 0 diff |
| Mengubah `handleFileUpload` di `BKUPage.jsx` | Jalur Excel tidak boleh berubah |
| Mengubah `bkuPdfParser.js` / `bkuPdfRapi.js` / `bkuPdfTanggal.js` / OCR | Akurasi sudah terverifikasi; sprint ini bukan sprint akurasi |
| Menyentuh `previewDocs.js` / `dokKas.js` / `templateConfig.js` / `template/**` | Di luar cakupan |
| Menambah dependency | Sprint ini murni rework alur |
| Memakai `git stash` / `git rm` / `git reset --hard` / `git clean -fd` | 3 insiden perusakan `.git/` (lihat `RISKS.MD`) |
| `npm ci` | Diblokir sandbox, merusak `@esbuild/win32-x64` |
| Warna di luar BLUE-ONLY `#004ac6` + slate | Aturan proyek |

## Bootstrap Command Block

> **Lingkungan (terverifikasi 2026-10-20):** sesi ini punya **Git Bash** dan
> **PowerShell 5.1**. Perintah di bawah memakai **bash** (sudah terbukti jalan).
> Bila Anda hanya punya PowerShell, padanan: `Test-Path` untuk `ls`, `rg` tetap `rg`.
> Jalankan dari root repo `D:\project\spj-app`.

```bash
# 1. Sanity file masukan — SEMUA harus ada
ls -la template/"contoh format BKU-PDF tahunan.pdf"
ls -la "template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx"
ls -la spj-frontend/src/utils/bkuParser.js
ls -la spj-frontend/src/components/bku/BKUUploadPdf.jsx
ls -la scratch-pdf-check/fixture.json scratch-pdf-check/fx-user-c0-runtime.json

# 2. Baseline build (harus BUILD_EXIT=0)
cd spj-frontend && npm run build; echo "BUILD_EXIT=$?"; node -v

# 3. Baseline akurasi (harus 0 selisih di 3 fixture) — JANGAN lanjut bila gagal
for f in fixture.json fx-sampel-c0-runtime.json fx-user-c0-runtime.json; do
  node test-bku-pdf-parse.mjs --pdf --all-months --fixture "../scratch-pdf-check/$f" \
    | tail -4; echo "EXIT=$?"
done
node test-bku-tanggal.mjs | tail -3

# 4. Baseline T-02 (0 hit = ideal; 4 hit pre-existing = tercatat, bukan regresi)
rg -ni "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|SD NEGERI LEBAKLEUNGSIR|Pasirhalang" spj-frontend/src

# 5. Titik yang akan diubah — baca dulu, jangan tebak
sed -n '90,150p'  spj-frontend/src/pages/dashboard/BKUPage.jsx   # recalcSummary
sed -n '440,455p' spj-frontend/src/pages/dashboard/BKUPage.jsx   # prop bulanAwal
sed -n '32,60p'   spj-frontend/src/components/bku/BKUUploadPdf.jsx # state
sed -n '88,120p'  spj-frontend/src/components/bku/BKUUploadPdf.jsx # pilihFile (gating bulan)
sed -n '140,165p' spj-frontend/src/components/bku/BKUUploadPdf.jsx # simpan()
sed -n '285,310p' spj-frontend/src/components/bku/BKUUploadPdf.jsx # dialog konfirmasi

# 6. Dev server (untuk uji manual T-05/T-07/T-14)
cd spj-frontend && npm run dev    # http://localhost:5173
```

## Titik Integrasi yang Mudah Terlewat

1. **`recalcSummary` dipakai dua jalur.** `loadFromStorage` (`BKUPage.jsx:157`) dan
   `BKUUploadPdf` (prop). Perbaiki **satu** fungsi → dua jalur ikut benar. Jangan
   menghitung summary sendiri di komponen.
2. **`onSelesai` = `loadFromStorage(true)`** (`BKUPage.jsx:451`) — inilah yang membuat
   halaman langsung menampilkan hasil (T-14). `loadFromStorage` sudah menetapkan
   `filterBulan('Semua')`, jadi jangan menambah state filter baru di parent.
3. **`redetectTypes()` wajib dipanggil setelah koreksi user**, bukan menyalin `tipe` dari
   hasil parse (aturan Sprint 015, dipertahankan).
4. **`header` wajib ada.** `BKUPage.jsx:512-513` membaca `uploadedInfo.header`; data BKU
   tanpa `header` membuat halaman crash (catatan Sprint 015).
5. **`header.tahunAnggaran` wajib terisi.** `previewDocs.js:242` memakainya untuk judul
   dokumen; kosong → dokumen cetak memakai `new Date().getFullYear()` (tahun salah,
   tanpa peringatan).
6. **`footer` boleh kosong.** TTD cetak berasal dari `getSignatureRoles()`, dan
   `footer.tempat` punya fallback `sekolah.kabupaten` (`previewDocs.js:379`).
7. **`page`/`problems`/`excluded` harus dibuang sebelum simpan.** Sprint 015 menyimpannya
   (bug kontrak halus); sprint ini wajib 17 field (T-11).
8. **`esbuild` tidak paham path MSYS `/d/...`** — untuk skrip test pakai path relatif
   atau `C:/...`. `--format=esm` menolak top-level `await` → pakai `import fs` biasa.

## Format Laporan Dry Run yang Diharapkan

```
DRY RUN — Sprint 016
1. File yang akan diubah/dibuat (M1–M5) + perkiraan baris
2. Perubahan recalcSummary: SEBELUM totalPengeluaran=…  SESUDAH=…  (Δ = total TARIK_TUNAI)
3. Perubahan perilaku yang terlihat user (angka, tombol, dialog)
4. Risiko + mitigasi (BLUEPRINT §3.2)
5. Rencana urutan eksekusi + gate yang akan dijalankan
6. Hal yang TIDAK akan disentuh (daftar larangan di atas)
```

## Setelah Selesai

1. Jalankan seluruh ACCEPTANCE, kumpulkan **bukti asli** (8 butir di ACCEPTANCE
   "Bukti yang Wajib Dikumpulkan").
2. Update `STATE.MD` (status sprint + "Langkah Selanjutnya").
3. Update checklist pack sprint-016 + tulis `BUILD-REPORT.MD`.
4. Commit **dry run dulu** → lapor rencana → **tunggu persetujuan user** (commit = kuasa user).
5. `/acceptance-runner` di **konteks segar** sebelum sprint ditutup.
