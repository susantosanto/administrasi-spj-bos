# HANDOFF PROMPT — Sprint 019: Rapikan Sidebar Detail Transaksi + Menu "Kas & Dokumen" + Dokumentasi Masuk Tab Dokumen LPJ + Fix Crash Sidebar

> Disusun 2026-10-23. Ditujukan ke **builder** (ZCode / agen berikutnya).
> Pack lengkap: `PRD.md` · `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
> `HANDOFF-PROMPT.MD` (ini).
> **Jangan mulai coding sebelum dry run dilaporkan dan user menyetujuinya.**

## Prompt untuk Builder

Anda adalah BUILDER dalam metode Architect-Builder.

Tugas Anda untuk **Sprint 019** (semua di sidebar BKU; halaman Dokumen LPJ TIDAK berubah):

0. **FIX CRASH (prasyarat)**: `BKUSidebar.jsx:122-123` memanggil `setSpjOpen(false)` dan
   `setSpjChecked({})` yang **tidak pernah dideklarasikan** → `ReferenceError` → sidebar
   crash setiap dibuka (terbukti di browser, 8 error console, bug dari commit `c149a28`
   Sprint 017). Hapus 2 baris itu + perbaiki duplicate key list grup se-Bukti (`:590`,
   composite key defensif).
1. **Hapus 4 tombol/card**: "Buka di LPJ" (2 varian, `:388-405`), "Lengkapi PBJ"
   (`:408-424`), card "Cetak Dokumen" (`:741-753`) — semuanya di `BKUSidebar.jsx` — plus
   tombol **"Kirim ke PBJ"** di topbar halaman (`BKUPage.jsx:383-390`, sebelah Upload
   Excel/PDF) + dead code yatim (`handleDeepLink`, blok navigate PBJ, `useNavigate` bila
   0 pemakai). **Tombol Coretax di baris pajak TETAP.**
2. **Rename "Data BKU" → "Kas & Dokumen"** di 7 titik UI (Sidebar:21, BKUPage:353+subtitle,
   DashboardHome:51/259/280/430, contextMap:17, DokumenKelengkapanPage:1569). String
   konsep-data (toast, AI, "Simpan ke Data BKU") TIDAK di-rename.
3. **Pindah Dokumentasi**: ekstrak blok `:635-815` + state/handler foto + listener
   `addGeneratedPhoto` → komponen baru **`BKUSidebarDokumentasi.jsx`** (self-contained,
   ≤300 baris); hapus tab `dokumentasi` (tab bar hilang otomatis); render blok itu di tab
   Dokumen LPJ **sebelum Panel Preview** via prop baru `blokDokumentasi`
   (`DetailDokumenLpj.jsx` → `DetailDokumenLpjBody.jsx`, pola sama dengan `blokTambahan`;
   halaman LPJ tidak mengoper prop → render identik).
4. **Form mudah dijangkau**: `BKUSidebarLpjToolbar` sticky di bawah header + chip progres
   ("N field wajib belum terisi" / "Lengkap — siap cetak", klik → `sorotPelanggaran`) +
   banner gate Zona B jadi chip clickable (prop opsional `onSorot`) + hint "Isian otomatis
   dari baris BKU". **TANPA reorder penuh field** (D-1 — keputusan user di dry run).

Langkah:
1. Baca berurutan: `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` → `DOMAIN.MD` →
   `CONSTITUTION.md` → `RISKS.MD` → pack `planning/sprints/sprint-019/`
   (`PRD.md` → `REQUIREMENTS.MD` → `BLUEPRINT.MD` → `ACCEPTANCE.MD`).
2. **Dry run**: laporkan per file (BLUEPRINT §2), urutan task T-01…T-17, **7 asumsi
   A-1…A-7** (REQUIREMENTS §5) + **pertanyaan D-1** (PRD §9) — asumsi yang belum
   dikonfirmasi user **wajib** disebut, bukan dianggap benar.
3. **TUNGGU persetujuan user.** Jangan menulis kode sebelum itu.
4. Implementasi per fase. Jalankan gate setiap task. **STOP-1/2/3/4** berlaku mutlak.
5. Laporkan dengan output asli (bukan klaim), lalu update `STATE.MD` + `DECISIONS.MD` +
   `RISKS.MD` + `QUESTIONS.MD` + checklist pack. Commit **hanya** setelah user menyetujui.

## Aturan Keras (pelanggaran = sprint ditolak)

| Larangan | Alasan |
|---|---|
| Mengubah `utils/bkuParser.js` | TABU, 0 diff (AG-03) |
| Mengubah `components/templates/SummaryCard.jsx` | `sorotPelanggaran`/readiness dipakai halaman LPJ |
| Mengubah `utils/bkuKategori.js` | Peta rekening dipakai lintas fitur |
| Mengubah `data/templateConfig.js` | Cetak A4/orientasi tidak boleh tersentuh |
| Mengubah `pages/dashboard/DokumenSPJPage.jsx` | Halaman LPJ harus identik (AG-03, hash) |
| Mengubah `DokumenKelengkapanPage.jsx` di luar string `:1569` | Halaman Kelengkapan tidak tersentuh |
| Menghapus `showToast`, `bkuPrefill`, `katEfektif` dari BKUSidebar | Masih dipakai (handleKoreksi, BKUSidebarLpj) |
| Membersihkan deep-link yatim di halaman | A-4: dibiarkan, sprint lain |
| Reorder penuh field `DokumenFormPreview.jsx` | D-1: butuh keputusan user eksplisit |
| Menambah dependency | 0 perubahan `package.json` / `package-lock.json` (AG-02) |
| Warna di luar BLUE-ONLY `#004ac6` + slate | Aturan proyek |
| `git stash` / `git rm` / `git reset --hard` / `git clean -fd` | 3 insiden perusakan `.git/` |
| `npm ci` | Diblokir sandbox, merusak `@esbuild/win32-x64` |
| Commit skrip uji ke repo | C-05: skrip dibuat saat eksekusi, dihapus saat penutupan |

## Titik Berhenti (STOP)

| # | Kapan | Tindakan |
|---|---|---|
| STOP-1 | Setelah T-02, sidebar masih crash / warning masih ada | Perbaiki; FASE 1 dilarang dimulai |
| STOP-2 | Setelah T-11, hash halaman LPJ berubah | Perbaiki; FASE 4 dilarang dimulai |
| STOP-3 | Muncul kebutuhan mengubah file terlarang | Berhenti, lapor, tunggu keputusan |
| STOP-4 | User menolak A-1…A-7 atau menjawab D-1 berbeda | Revisi pack dulu (REQUIREMENTS §5 + task terkait) |

## Bootstrap Command Block

> Lingkungan: **PowerShell 5.1** (`&&` tidak didukung — pakai `;`); `rg` ada; `bash` **tidak**
> ada. Jalankan dari `D:\project\spj-app`.

```powershell
# 1. Sanity — SEMUA harus ada
Test-Path spj-frontend/src/components/bku/BKUSidebar.jsx
Test-Path spj-frontend/src/components/bku/BKUSidebarLpj.jsx
Test-Path spj-frontend/src/components/bku/BKUSidebarLpjToolbar.jsx
Test-Path spj-frontend/src/components/dokumen/DetailDokumenLpj.jsx
Test-Path spj-frontend/src/components/dokumen/DetailDokumenLpjBody.jsx
Test-Path planning/sprints/sprint-019/

# 2. Baseline build (harus BUILD_EXIT=0)
cd spj-frontend
npm run build
if ($?) { "BUILD_EXIT=0" } else { "BUILD_EXIT=1" }
node -v

# 3. Baseline fakta yang dijanjikan pack (angka harus cocok dengan dokumen)
cd D:\project\spj-app\spj-frontend
(Get-Content src/components/bku/BKUSidebar.jsx).Count                    # 823
(Get-Content src/components/bku/BKUSidebarLpj.jsx).Count                # 274
(Get-Content src/components/bku/BKUSidebarLpjToolbar.jsx).Count         # 66
(Get-Content src/components/dokumen/DetailDokumenLpjBody.jsx).Count     # 120
(Get-Content src/components/dokumen/DetailDokumenLpj.jsx).Count         # 156
rg -n "setSpjOpen|setSpjChecked" src/components/bku/BKUSidebar.jsx      # tepat 2 hit (:122-123)
rg -n "Buka di LPJ|Lengkapi PBJ|Cetak Dokumen" src/components/bku/BKUSidebar.jsx  # ada
rg -n "Kirim ke PBJ" src/pages/dashboard/BKUPage.jsx                     # :383-390 ada
rg -n "dokumentasi" src/components/bku/BKUSidebar.jsx                   # tab + blok ada
rg -n "blokTambahan" src/components/dokumen/DetailDokumenLpjBody.jsx    # :39, :87
rg -n "Data BKU" src -l                                                # 8 file (PRD §2.6 + daftar putih)
```

Bila salah satu angka berbeda dari pack → **lapor dulu**, jangan menyesuaikan pack diam-diam.

## Skrip Uji (dibuat saat eksekusi, dihapus saat penutupan)

| Skrip | Untuk | Bundel |
|---|---|---|
| `test-lpj-hash-baseline.mjs` | hash render halaman LPJ 4 kategori (sebelum & sesudah) | `npx esbuild … --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env='{}'` |
| `test-sidebar-store.mjs` | store BKU + key unik grup se-Bukti | `--format=cjs` (tanpa JSX) |

> ⚠️ `--format=esm` gagal "Dynamic require of stream"; tanpa `--jsx=automatic` gagal
> "React is not defined"; tanpa `--define:import.meta.env='{}'` gagal env undefined
> (EX-1 Sprint 017).

## Yang Wajib Dilaporkan di Dry Run

1. Daftar file yang akan dibuat/diubah + estimasi baris akhir (BLUEPRINT §2).
2. Urutan task + gate tiap task (T-01…T-17).
3. Pernyataan eksplisit untuk **A-1…A-7**: setuju / minta diubah.
4. Usulan jawaban **D-1** (tanpa reorder penuh — prioritas via chip progres + sorot +
   banner clickable; atau reorder penuh dengan sprint diperluas).
5. Rencana pembuktian R-1 (listener foto ikut pindah) & R-4 (alur sidebar penuh).
6. Hal yang **tidak** akan dikerjakan (REQUIREMENTS §3.2) — supaya tidak melebar.
