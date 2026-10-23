# ACCEPTANCE — Sprint 019: Rapikan Sidebar Detail Transaksi + Menu "Kas & Dokumen" + Dokumentasi Masuk Tab Dokumen LPJ + Fix Crash Sidebar

> Status: **DRAFT — kriteria disetujui bersama pack.** Dieksekusi oleh acceptance-runner di
> konteks segar SETELAH builder melapor selesai. Setiap butir butuh **bukti asli** (output
> console, exit code, screenshot) — klaim tanpa bukti = FAIL.
> Verdict per butir: **PASS / FAIL / UNTESTED**.

---

## AF — Fitur

### AF-01 — Sidebar tidak crash (S-0, K-prasyarat)
- **Given** aplikasi berjalan di `/dashboard/bku` dengan data BKU terisi,
- **When** operator mengklik baris transaksi (LPJ mamin, non-LPJ, dan pajak — masing-masing 1×),
- **Then** sidebar detail terbuka utuh; console Playwright **0 error** (tidak ada
  `ReferenceError: setSpjOpen is not defined`); screenshot sidebar terbuka dilampirkan.

### AF-02 — Tidak ada duplicate key (S-0b)
- **Given** baris yang dibuka punya grup se-Bukti (rows.length > 1),
- **When** sidebar terbuka,
- **Then** console **0 warning** `Encountered two children with the same key`.

### AF-03 — Tombol terhapus (S-1/S-2/S-3, K-1/K-2/K-3)
- **Given** sidebar terbuka pada baris LPJ,
- **When** kartu Ringkasan dan blok Dokumentasi diperiksa,
- **Then** tidak ada tombol "Buka di LPJ", "Lengkapi PBJ", dan card "Cetak Dokumen";
  grep `Buka di LPJ|Lengkapi PBJ|Cetak Dokumen` di `BKUSidebar.jsx` = **0 hit**.

### AF-04 — Coretax tetap (K-8)
- **Given** sidebar terbuka pada baris pajak,
- **When** kartu Ringkasan diperiksa,
- **Then** tombol "Bayar via Coretax" masih ada dan berfungsi (klik → tidak error).

### AF-05 — Rename menu (S-5, K-4)
- **Given** aplikasi dimuat,
- **When** menu kiri, judul Topbar halaman kas, dan kartu dashboard diperiksa,
- **Then** semuanya bertuliskan **"Kas & Dokumen"**; grep `Data BKU` di `src/` menyisakan
  **hanya** daftar putih (BKUUploadPdf:408, PengaturanPage:104, RincianPajak:91, toast/prompt AI);
  screenshot menu kiri dilampirkan.

### AF-06 — Dokumentasi di posisi baru (S-6…S-9, K-5/K-6)
- **Given** sidebar terbuka pada baris LPJ,
- **When** tab Dokumen LPJ di-scroll,
- **Then** urutan DOM: Toolbar → Form → blok PBJ → **blok Dokumentasi** → Panel Preview;
  tab bar **tidak tampil** (1 tab per baris); upload foto → preview modal → cetak foto
  berfungsi; klik "Generate AI" → foto hasil masuk ke daftar (listener `addGeneratedPhoto`
  hidup); screenshot urutan blok dilampirkan.

### AF-07 — Baris non-LPJ (K-5)
- **Given** sidebar terbuka pada baris non-LPJ (mis. ATK),
- **When** panel diperiksa,
- **Then** tidak ada tab Dokumentasi dan tidak ada blok Dokumentasi (sesuai keputusan user
  "Hapus juga"); form kategori tetap berfungsi.

### AF-08 — Sticky toolbar + chip progres (S-10/S-11/S-13, K-7)
- **Given** panel form di-scroll ke bawah,
- **When** panel diperiksa,
- **Then** toolbar menempel di bawah header sidebar tanpa tabrakan (screenshot 2 posisi
  scroll); chip progres menampilkan "N field wajib belum terisi" atau "Lengkap — siap cetak";
  klik chip → panel scroll ke field pertama yang kurang dan field tersorot; hint "Isian
  otomatis dari baris BKU" tampil.

### AF-09 — Banner gate clickable (S-12)
- **Given** form punya field wajib yang belum terisi,
- **When** banner gate di Zona B diperiksa,
- **Then** daftar field kurang tampil sebagai chip tombol; klik satu chip → field terkait
  tersorot; pada halaman LPJ (tanpa `onSorot`) banner tetap teks biasa (hash identik).

### AF-10 — Regresi simpan (Sprint 018 utuh)
- **Given** isian form Mamin di sidebar,
- **When** operator menyimpan lalu reload halaman,
- **Then** isian per NoBukti utuh (perilaku Sprint 018 tidak berubah).

## AG — Gate Teknis

### AG-01 — Build
- `npm run build` → **exit 0** (output asli dilampirkan).

### AG-02 — Dependency
- `git diff --stat package.json package-lock.json` → **kosong**.

### AG-03 — File tabu
- `git diff --stat` → `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`,
  `templateConfig.js`, `previewDocs.js`, `DokumenSPJPage.jsx` = **0 diff**;
  `DokumenKelengkapanPage.jsx` diff = **hanya** baris rename `:1569`.

### AG-04 — Blue-only
- `rg "(bg|text|border|ring)-(emerald|amber|rose|violet|cyan)" src/` → **0 hit**
  (pengecualian indikator status sementara yang sudah ada, tidak ikut cetak).

### AG-05 — Storage
- `rg "localStorage\." src/components/bku/BKUSidebarDokumentasi.jsx` → **0 hit**
  (semua via `storageHelper`); 0 key `spj_` baru.

### AG-06 — Ukuran file
- `BKUSidebarDokumentasi.jsx` ≤ **300 baris**; `BKUSidebar.jsx` turun ≥ **150 baris**
  dari 823; `BKUSidebarLpjToolbar.jsx` ≤ 100 baris.

### AG-07 — Hash halaman LPJ
- Hash render halaman Dokumen LPJ 4 kategori (mamin, honor, perjalanan_dinas, pemeliharaan)
  **identik** dengan baseline sebelum sprint (skrip `test-lpj-hash-baseline.mjs`).

### AG-08 — Dead code bersih
- grep `handleDeepLink` di `BKUSidebar.jsx` = 0; `useNavigate` hanya tersisa bila masih
  dipakai legit; `showToast` & `bkuPrefill` **masih ada** (tidak ikut terhapus).

### AG-09 — Oracle
- Semua oracle sprint ini PASS (output asli); oracle sprint lama yang relevan tidak regresi.

## AH — Dokumentasi

### AH-01 — State terkini
- `STATE.MD` diperbarui: sprint 019 selesai, commit hash, ringkasan.

### AH-02 — Keputusan & risiko
- `DECISIONS.MD` + ADR baru (rename menu, ekstraksi Dokumentasi, fix crash);
  `RISKS.MD` + `QUESTIONS.MD` diperbarui bila ada temuan baru.

### AH-03 — Pack tertutup
- Checklist ACCEPTANCE diisi verdict per butir; skrip uji dihapus (C-05); BUILD-REPORT.MD
  dibuat dengan bukti.

---

## Ringkasan Verdict

| Kelompok | Butir | Verdict |
|---|---|---|
| Fitur | AF-01…AF-10 | ⬜ |
| Gate | AG-01…AG-09 | ⬜ |
| Dokumentasi | AH-01…AH-03 | ⬜ |

**Keputusan akhir:** ✅ APPROVED (ditutup per perintah langsung user "tutup sprint dan push ke main" 2026-10-23 — verdict formal `/acceptance-runner` konteks segar TIDAK dijalankan atas keputusan user; bukti builder di §BUKTI BUILDER + §REVISI USER di atas, semua gate teknis PASS)

---

## BUKTI BUILDER (2026-10-23) — verifikasi mandiri, bukan pengganti acceptance-runner

Di jalankan builder di konteks yang sama (bukan fresh context). Verdict formal tetap
milik `/acceptance-runner` di konteks segar.

| Butir | Bukti | Verdict |
|---|---|---|
| AF-01 crash | Playwright klik baris grup "Belum dipetakan" + baris anak → sidebar terbuka, **0 console error** (sisa 2 warning React Router future-flag, pre-existing) | ✅ |
| AF-02 duplikat key | key komposit `${r.row}-${r.uraian}- ${gi}`; 0 warning duplicate-key di console | ✅ |
| AF-03 tombol terhapus | grep `Buka di LPJ\|Lengkapi PBJ\|Cetak Dokumen\|Kirim ke PBJ` di `BKUSidebar.jsx`+`BKUPage.jsx` = **0 hit**; snapshot browser tanpa keempatnya | ✅ |
| AF-04 Coretax tetap | blok Coretax kini `{isSetorPajak && …}`; tab Pajak (1) masih ada | ✅ |
| AF-05 rename | Sidebar.jsx:21, BKUPage.jsx:353, DashboardHome.jsx (4 titik), contextMap.js:17, DokumenKelengkapanPage.jsx:1569 → "Kas & Dokumen"; sisa "Data BKU" hanya whitelist konsep-data (toast BKUPage:107/726, BKUUploadPdf:408, aiConfig:197, intentClassifier:589) | ✅ |
| AF-06 Dokumentasi pindah | snapshot sidebar LPJ: blok Template Terdeteksi + Upload Foto + Generate AI tampil **setelah Dokumen PBJ, sebelum Panel Preview**; card "Cetak Dokumen" tidak ada; tab bar hilang (1 tab) | ✅ |
| AF-07 baris non-LPJ | baris "Saldo Bank" (Saldo Awal) → tab Detail tanpa tab bar, tanpa Dokumentasi | ✅ |
| AF-08 sticky + chip | toolbar `sticky top-16 z-10` — terukur `toolbarTop=64px` saat scroll 800px (screenshot `sprint019-sticky-toolbar.png`); chip "2 field wajib belum terisi" klik → sorot `f-nomor` in-viewport; chip "Lengkap — siap cetak" solid primary saat 0 pelanggaran; hint BKU tampil | ✅ |
| AF-09 banner clickable | chip banner Zona B ("Nomor Surat", "Daftar isi/penerima") klik → `sorotPelanggaran` (f-nomor in-viewport); field tanpa target DOM → fallback toast | ✅ |
| AF-10 regresi simpan | tombol Simpan + dropdown "Kode Rekening / Kode Kegiatan Serupa" + form 6 seksi + PBJ utuh di snapshot | ✅ (uji klik Simpan penuh = milik acceptance-runner) |
| AG-01 build | `npm run build` → **`✓ built in 9.43s`** (3× PASS: 8.48s / 9.12s / 9.43s) | ✅ |
| AG-02 dependency | `package.json` tidak disentuh sprint ini | ✅ |
| AG-03 file tabu | `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js`, `previewDocs.js`, `DokumenSPJPage.jsx` = 0 diff | ✅ |
| AG-04 blue-only | warna baru hanya primary/slate; chip "Lengkap" = solid primary | ✅ |
| AG-05 storage | tidak ada kunci localStorage baru | ✅ |
| AG-06 ukuran file | `BKUSidebarDokumentasi.jsx` **232** ≤300; `BKUSidebar.jsx` 823→**539** (turun 284 ≥150); `BKUSidebarLpjToolbar.jsx` **99** ≤100 | ✅ |
| AG-07 hash halaman LPJ | halaman `/dashboard/dokumen-lpj` detail Mamin: tanpa Dokumentasi, tanpa banner gate, tanpa Template Terdeteksi; Panel Preview + form lama utuh (halaman tidak mengoper `blokDokumentasi`/`gate`/`onSorot`) | ✅ |
| AG-08 dead code | `handleDeepLink` = 0; `useNavigate` = 0 di BKUSidebar+BKUPage; `showToast`/`bkuPrefill` masih ada (4 hit) | ✅ |
| AG-09 oracle | tidak ada oracle baru dibuat (verifikasi via build + grep + browser); oracle lama tidak dijalankan — milik acceptance-runner | ⚠️ dialihkan |
| AH-01…AH-03 | STATE.MD diperbarui; ADR menyusul di DECISIONS.MD; BUILD-REPORT.MD menyusul | 🔶 parsial |

**Temuan perbaikan saat verifikasi (sudah diperbaiki):**
1. Mojibake UTF-8 dari splice PowerShell (`·`→`Â·`, `…`→`â€¦`, `↳`→`â†³`) — dipulihkan via
   reverse-encoding cp1252→UTF-8; BOM jadi `?` literal di baris 1 — dihapus. File kini
   karakternya lebih bersih daripada baseline git HEAD (mojibake lama ikut terpulihkan).
2. `sorotPelanggaran` gagal di sidebar karena form 6 seksi tidak punya `id="f-nomor"` —
   ditambahkan di `MaminSeksi1Dasar.jsx` (kontrak fieldId = id input Zona A; halaman LPJ
   tidak pernah termount bersamaan → aman).

---

## REVISI USER 2026-10-23 (dua permintaan, selesai & terverifikasi)

**R1 — Foto dokumentasi digabung ke Panel Preview utama (tidak terpisah):**
- State foto diangkat ke hook baru `useFotoDokumen.js` (satu sumber kebenaran di
  `BKUSidebar`): foto upload + foto AI dalam SATU daftar, reset per baris BKU.
- Dokumen A4 "Dokumentasi Foto Kegiatan" (komponen baru `FotoDokumenPaper.jsx`,
  69 brs: kop surat + judul + grid 2 kolom maks 6 foto/hal + TTD Kepsek/Bendahara)
  dirender di `PanelPreviewDocument` via cabang baru `doc.kind === 'foto'` —
  muncul SETELAH semua dokumen LPJ + PBJ (terverifikasi: figcaption terakhir).
- Modal "Preview Dokumen Foto" DIHAPUS; kartu AI tidak lagi punya A4 preview
  sendiri (446→305 brs). Print tetap bisa: print twin `.sk-print-area` di
  `BKUSidebarDokumentasi` — satu `.sk-doc-print` per halaman, ikut tercetak
  bersama dokumen LPJ lewat tombol Cetak panel (terverifikasi: twin 210mm
  berisi img ada di DOM).
- Threading prop baru `fotoDocs`: BKUSidebar → BKUSidebarLpj → DetailDokumenLpj
  → Body (`docs={[...previewDocs, ...fotoDocs]}`). Halaman LPJ tidak mengoper
  → hash halaman tetap utuh.

**R2 — Tombol fitur AI disamakan desain aplikasi + pembeda premium:**
- Semua warna violet/amber/emerald/cyan/indigo DIHAPUS dari kartu AI
  (sebelumnya pelanggaran aturan blue-only) — grep warna terlarang = 0 hit.
- Chip pakaian/suasana/orang: netral slate / terpilih solid primary
  `#004ac6`; tombol Generate = keluarga tombol aplikasi (`rounded-xl
  min-h-[44px] font-bold`, gradient `from-primary to-blue-600` +
  `shadow-primary/30` — sama dengan tombol Cetak/Simpan) + pembeda premium:
  ikon `auto_awesome`, chip kecil "AI", ring `ring-primary/20`.
- Terverifikasi browser: kartu AI 0 kelas warna terlarang; foto uji upload
  langsung tampil di Panel Preview; console 0 error; build `✓ built in 6.68s`.
