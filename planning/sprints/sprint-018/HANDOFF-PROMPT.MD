# HANDOFF PROMPT — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Disusun 2026-10-21. Ditujukan ke **builder** (ZCode / agen berikutnya).
> Pack lengkap: `PRD.md` · `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
> `HANDOFF-PROMPT.MD` (ini).
> **Jangan mulai coding sebelum dry run dilaporkan dan user menyetujuinya.**

## Prompt untuk Builder

Anda adalah BUILDER dalam metode Architect-Builder.

Tugas Anda untuk **Sprint 018** (di sidebar Data BKU, halaman **Dokumen LPJ menu kiri TIDAK
berubah**):

1. **Dropdown NoBukti mirip** di detail transaksi: menampilkan baris BKU lain dengan **kode
   rekening + kode kegiatan sama** dan **bulan berbeda** (semua kategori). Memilih satu kandidat
   → **panel detail berpindah** ke baris itu (rekap + form + preview + target simpan ikut).
   Bila isian form belum disimpan → **peringatan "simpan dulu?"** (dialog: Simpan & pindah / Batal).
2. **Form Mamin di sidebar jadi 6 seksi**: 1 Data Dasar · 2 Daftar Hadir · 3 Surat Undangan ·
   4 Surat Pesanan · 5 Buku Tamu · 6 Notulen (AI). Prinsip: **satu data satu sumber** — field yang
   datanya sudah ada (seksi sebelumnya / Data Sekolah / BKU) **tidak punya input**; teks bawaan
   (isi surat, sifat, lampiran, perhatian) dipindah ke **preview**. Daftar Hadir: input TTD dihapus,
   kolom **NIP** ditambahkan (ikut tercetak). Input **"Tanggal dana masuk" dihapus** dari sidebar
   (semua kategori LPJ) dan gate sidebar berhenti menagihnya. Tombol **"Generate AI Notulen"**.
3. **Dokumen PBJ di sidebar**: blok di **bawah form LPJ, di atas Panel Preview Document**;
   6 tab; isian otomatis dari baris BKU (Tanggal, Kegiatan, Nominal, No Bukti); **tersimpan per
   NoBukti** (kunci baru). Panel preview **satu daftar**: dokumen LPJ dulu → dokumen PBJ menyusul,
   **nama surat tidak boleh dobel**.

Langkah:
1. Baca berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` → `DOMAIN.MD` →
   `CONSTITUTION.md` → `RISKS.MD` → pack `planning/sprints/sprint-018/`
   (`PRD.md` → `REQUIREMENTS.MD` → `BLUEPRINT.MD` → `ACCEPTANCE.MD`).
2. **Dry run**: laporkan per file (BLUEPRINT §2), urutan task T-01…T-20, dan **9 asumsi
   A-1…A-9** (REQUIREMENTS §5) + **2 pertanyaan D-1/D-2** (PRD §10) — asumsi yang belum
   dikonfirmasi user **wajib** disebut, bukan dianggap benar.
3. **TUNGGU persetujuan user.** Jangan menulis kode sebelum itu.
4. Implementasi per fase. Jalankan gate setiap task. **STOP-1/2/3/4** berlaku mutlak.
5. Laporkan dengan output asli (bukan klaim), lalu update `STATE.MD` + `DECISIONS.MD` + `RISKS.MD`
   + `QUESTIONS.MD` + checklist pack. Commit **hanya** setelah user menyetujui.

## Aturan Keras (pelanggaran = sprint ditolak)

| Larangan | Alasan |
|---|---|
| Mengubah `utils/bkuParser.js` | TABU, 0 diff (G-1) |
| Mengubah `components/templates/SummaryCard.jsx` | Gate dipakai halaman LPJ → 0 diff (G-7, AD-2) |
| Mengubah `pages/dashboard/DokumenSPJPage.jsx` | Halaman LPJ harus identik (G-6) |
| Mengubah `pages/dashboard/DokumenKelengkapanPage.jsx` | Halaman Kelengkapan + PBJ global tidak boleh tersentuh (G-9) |
| Mengubah `data/templateConfig.js` **di luar blok `daftar_hadir`** | KE-1: hanya kolom NIP (G-8) |
| Mengubah `utils/previewDocs.js` **di luar `buildPreviewDocs`/`maminDocs`** | KE-2 (AD-7) |
| Menjalankan 6 seksi di halaman LPJ | K-5/A-6: hanya `layout='stack'` (AD-3) |
| Menghapus kolom TANDA TANGAN di Daftar Hadir / Buku Tamu | K-9: kolom tetap tercetak |
| Menagih field yang tak ada inputnya (gate sidebar) | K-10 → gate sidebar fungsi baru (AD-2) |
| Mengubah `readinessCheck` | Dipakai halaman LPJ |
| Menambah dependency | 0 perubahan `package.json` / `package-lock.json` (G-2) |
| Menyalin string template (isi surat, dsb.) | Pakai `templateUndanganMamin`/`templatePesananMamin` (AD-4) |
| Duplikasi logika PBJ dari `DokumenKelengkapanPage` | Salin **pola/config**, jangan coupling halaman (T-14) |
| Mengganti `previewDocs`/`MaminPreview` untuk semua kategori | Preview harus sama dengan cetakan (AD-4/AD-7) |
| Warna di luar BLUE-ONLY `#004ac6` + slate | Aturan proyek |
| `git stash` / `git rm` / `git reset --hard` / `git clean -fd` | 3 insiden perusakan `.git/` |
| `npm ci` | Diblokir sandbox, merusak `@esbuild/win32-x64` |

## Titik Berhenti (STOP)

| # | Kapan | Tindakan |
|---|---|---|
| STOP-1 | Setelah T-05, baseline/oracle FASE 0 gagal | Perbaiki; FASE 1 dilarang dimulai |
| STOP-2 | Setelah T-11, hash halaman LPJ berubah | Perbaiki AD-3; FASE 2 dilarang dimulai |
| STOP-3 | Muncul kebutuhan mengubah file terlarang | Berhenti, lapor, tunggu keputusan |
| STOP-4 | User menolak A-1…A-9 atau menjawab D-1/D-2 berbeda | Revisi pack dulu (REQUIREMENTS §5 + task terkait) |

## Bootstrap Command Block

> Lingkungan: **PowerShell 5.1** + **Git Bash** tersedia; `rg` ada; `bash` **tidak** ada
> (pakai PowerShell). Jalankan dari `D:\project\spj-app`.

```powershell
# 1. Sanity — SEMUA harus ada
Test-Path spj-frontend/src/components/bku/BKUSidebar.jsx
Test-Path spj-frontend/src/components/bku/BKUSidebarLpj.jsx
Test-Path spj-frontend/src/components/templates/DokumenFormPreview.jsx
Test-Path spj-frontend/src/components/templates/MaminPreview.jsx
Test-Path spj-frontend/src/components/dokumen/DetailDokumenLpjBody.jsx
Test-Path spj-frontend/src/utils/previewDocs.js
Test-Path spj-frontend/src/utils/prefillLpj.js
Test-Path planning/sprints/sprint-018/

# 2. Baseline build (harus BUILD_EXIT=0)
cd spj-frontend
npm run build
if ($?) { "BUILD_EXIT=0" } else { "BUILD_EXIT=1" }
node -v

# 3. Baseline fakta yang dijanjikan pack (angka harus cocok dengan dokumen)
cd D:\project\spj-app\spj-frontend
(Get-Content src/components/templates/DokumenFormPreview.jsx).Count      # 2069
(Get-Content src/components/templates/MaminPreview.jsx).Count             # 256
(Get-Content src/components/bku/BKUSidebarLpj.jsx).Count                  # 196
(Get-Content src/utils/previewDocs.js).Count                              # 473
rg -n "tanggalDanaMasuk" src/components/templates/DokumenFormPreview.jsx  # 8 hit (2 blok input + isi)
rg -n "tanggalDanaMasuk" src/data/templateConfig.js src/components/templates/blocks  # 0 hit (F-1!)
rg -n "allTransactions|onNavigate" src/components/bku/BKUSidebar.jsx      # ada
rg -n "readinessCheck" src/components/templates/SummaryCard.jsx           # 1 definisi
rg -n "storageHelper.set" src/pages/dashboard/DokumenSPJPage.jsx          # 0 hit (menolak)
```

Bila salah satu angka berbeda dari pack → **lapor dulu**, jangan menyesuaikan pack diam-diam.

## Skrip Uji (dibuat saat eksekusi, dihapus saat penutupan)

| Skrip | Untuk | Bundel |
|---|---|---|
| `test-mamin-baseline.mjs` | hash render halaman LPJ 4 kategori | `npx esbuild … --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env='{}'` |
| `test-bku-mirip.mjs` | kandidat dropdown (A-1) | `--format=cjs` (tanpa JSX) |
| `test-mamin-otomatis.mjs` | merge nilai otomatis + 17 field | `--format=cjs` (tanpa JSX) |
| `test-pbj-bku-store.mjs` | store PBJ per baris | `--format=cjs` (tanpa JSX) |
| `test-mamin-seksi.mjs` | render 6 seksi + cek field | `--bundle --jsx=automatic` |

> ⚠️ `--format=esm` gagal "Dynamic require of stream" untuk render JSX; tanpa `--jsx=automatic`
> gagal "React is not defined"; tanpa `--define:import.meta.env='{}'` gagal
> "Cannot read properties of undefined (reading 'env')" (EX-1 Sprint 017).

## Yang Wajib Dilaporkan di Dry Run

1. Daftar file yang akan dibuat/diubah + estimasi baris akhir.
2. Urutan task + gate tiap task (T-01…T-20).
3. Pernyataan eksplisit untuk **A-1…A-9**: setuju / minta diubah.
4. Usulan jawaban **D-1** (satu field `tanggalSurat` atau dua) dan **D-2** (suffix " PBJ" pada
   label atau label apa adanya + aturan LPJ menang).
5. Rencana pembuktian R-1 (preview = cetakan) & R-2 (hash halaman LPJ).
6. Hal yang **tidak** akan dikerjakan (REQUIREMENTS §3.3) — supaya tidak melebar.
