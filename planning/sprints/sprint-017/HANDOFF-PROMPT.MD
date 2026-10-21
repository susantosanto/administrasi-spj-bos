# HANDOFF PROMPT — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> Disusun 2026-10-21. Ditujukan ke **builder** (ZCode / agen berikutnya).
> Pack lengkap: `PRD.md` · `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
> `HANDOFF-PROMPT.MD` (ini).
> **Jangan mulai coding sebelum dry run dilaporkan dan user menyetujuinya.**

## Prompt untuk Builder

Anda adalah BUILDER dalam metode Architect-Builder.

Tugas Anda untuk **Sprint 017**: di halaman Data BKU, klik satu baris kegiatan belanja →
sidebar melebar **100% viewport**, tab pertama **Dokumen LPJ** berisi panel dokumen LPJ
kategori baris itu (komponen yang sama dengan menu Dokumen LPJ), form bisa diisi dan
**disimpan per NoBukti**; **preview SELALU tampil** — field wajib yang belum lengkap hanya
memunculkan banner peringatan (revisi user 2026-10-21, lihat BLUEPRINT EX-5; rancangan awal
"preview muncul hanya bila lengkap" **dibatalkan**); baris non-LPJ tetap memakai sidebar sempit.

Langkah:
1. Baca berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` → `DOMAIN.MD` →
   `CONSTITUTION.md` → `RISKS.MD` → pack `planning/sprints/sprint-017/`
   (`PRD.md` → `REQUIREMENTS.MD` → `BLUEPRINT.MD` → `ACCEPTANCE.MD`).
2. **Dry run**: laporkan per file (BLUEPRINT §2), urutan task T-01…T-15, dan **4 asumsi
   A-1…A-4** (REQUIREMENTS §5) — asumsi yang belum dikonfirmasi user **wajib** disebut,
   bukan dianggap benar.
3. **TUNGGU persetujuan user.** Jangan menulis kode sebelum itu.
4. Implementasi per fase. Jalankan gate setiap task. **STOP-1/STOP-2** berlaku mutlak.
5. Laporkan dengan output asli (bukan klaim), lalu update `STATE.MD` + checklist pack.
   Commit **hanya** setelah user menyetujui.

## Aturan Keras (pelanggaran = sprint ditolak)

| Larangan | Alasan |
|---|---|
| Menyalin JSX `renderDetailPanel` ke sidebar | Wajib **ekstraksi** — salinan = dua sumber kebenaran (R-1) |
| Mengubah `utils/bkuParser.js` | TABU, 0 diff |
| Mengubah `data/templateConfig.js` / `utils/previewDocs.js` | Di luar cakupan (G-6) |
| Mengubah `DokumenFormPreview.jsx` / `PanelPreviewDocument.jsx` / `SummaryCard.jsx` | Dipakai lintas fitur; regresi risiko tinggi |
| Mengubah tombol **Cek** / gate cetak menu LPJ | Gate preview hanya untuk sidebar (AD-4) |
| Menambah dependency | 0 perubahan `package.json` / `package-lock.json` |
| Menyimpan tanpa NoBukti | E-1: tolak dengan alasan, jangan tulis kunci kosong |
| Menyimpan otomatis saat mengetik | AD-5: hanya tombol Simpan |
| Warna di luar BLUE-ONLY `#004ac6` + slate | Aturan proyek |
| `git stash` / `git rm` / `git reset --hard` / `git clean -fd` | 3 insiden perusakan `.git/` |
| `npm ci` | Diblokir sandbox, merusak `@esbuild/win32-x64` |
| Memperlebar scope ke ATK/Penggandaan | A-2: dianggap non-LPJ |

## Titik Berhenti (STOP)

| # | Kapan | Tindakan |
|---|---|---|
| STOP-1 | Setelah T-04, hash panel 4 kategori **tidak identik** | Perbaiki ekstraksi; FASE 1 dilarang dimulai |
| STOP-2 | Setelah T-06, `lengkap` tak pernah `true` untuk isian wajar | Lapor user; aturan A-1 direvisi, jangan mengarang daftar field |
| STOP-3 | Muncul kebutuhan mengubah file terlarang | Berhenti, lapor, tunggu keputusan |
| STOP-4 | User menolak A-1/A-2/A-3/A-4 saat dry run | Revisi pack dulu (REQUIREMENTS §5 + task terkait) |

## Bootstrap Command Block

> Lingkungan: **Git Bash** + **PowerShell 5.1** tersedia; `rg` ada. Jalankan dari
> `D:\project\spj-app`.

```bash
# 1. Sanity — SEMUA harus ada
ls -la spj-frontend/src/components/bku/BKUSidebar.jsx
ls -la spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx
ls -la spj-frontend/src/pages/dashboard/BKUPage.jsx
ls -la spj-frontend/src/components/templates/DokumenFormPreview.jsx
ls -la spj-frontend/src/components/templates/PanelPreviewDocument.jsx
ls -la spj-frontend/src/data/templateConfig.js
ls -la planning/sprints/sprint-017/

# 2. Baseline build (harus BUILD_EXIT=0)
cd spj-frontend && npm run build; echo "BUILD_EXIT=$?"; node -v

# 3. Baseline fakta yang dijanjikan pack (angka harus cocok dengan dokumen)
wc -l src/components/bku/BKUSidebar.jsx src/pages/dashboard/DokumenSPJPage.jsx
rg -n "storageHelper.set" src/pages/dashboard/DokumenSPJPage.jsx   # 0 hit (memang belum ada simpan)
rg -n "w-full max-w-xl" src/components/bku/BKUSidebar.jsx          # 1 hit (:278)
rg -n "hasTemplate: false" src/pages/dashboard/DokumenSPJPage.jsx  # >=1 (penggandaan infoOnly)
```

Bila salah satu angka berbeda dari pack → **lapor dulu**, jangan menyesuaikan pack diam-diam.

## Skrip Uji (dibuat saat eksekusi, dihapus saat penutupan)

| Skrip | Untuk | Bundel |
|---|---|---|
| `test-lpj-baseline.mjs` | hash panel 4 kategori | `npx esbuild … --bundle --platform=node --format=cjs --jsx=automatic` |
| `test-lpj-store.mjs` | round-trip `lpjBkuStore` | `--format=cjs` (tanpa JSX) |
| `test-lpj-fieldwajib.mjs` | aturan A-1 | `--format=cjs` (tanpa JSX) |

⚠️ `--format=esm` gagal "Dynamic require of stream" untuk render JSX; tanpa `--jsx=automatic`
gagal "React is not defined". `--loader=jsx` hanya untuk stdin.

## Yang Wajib Dilaporkan di Dry Run

1. Daftar file yang akan dibuat/diubah + estimasi baris akhir.
2. Urutan task + gate tiap task (T-01…T-15).
3. Pernyataan eksplisit untuk **A-1…A-4**: setuju / minta diubah.
4. Rencana pembuktian R-1/R-2 (snapshot panel & oracle prefill).
5. Hal yang **tidak** akan dikerjakan (REQUIREMENTS §3.3) — supaya tidak melebar.
