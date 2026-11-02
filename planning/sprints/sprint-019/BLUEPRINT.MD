# BLUEPRINT — Sprint 019: Rapikan Sidebar Detail Transaksi + Menu "Kas & Dokumen" + Dokumentasi Masuk Tab Dokumen LPJ + Fix Crash Sidebar

> Status: **DRAFT — menunggu persetujuan user.** Menjawab **bagaimana**: rencana per file,
> task T-01…T-17 dengan gate, urutan eksekusi, dan skrip uji. Sumber requirement:
> `REQUIREMENTS.MD` sprint ini.

---

## 1. Arsitektur Perubahan

```
BKUSidebar.jsx (823 → ±600 baris)
├─ FASE 0: hapus 2 baris crash (:122-123) + composite key (:590)
├─ FASE 1: hapus 3 tombol/card + dead code (handleDeepLink, navigate PBJ, useNavigate)
├─ FASE 3: hapus tab 'dokumentasi' + blok :635-815 + state/handler foto → pindah ke komponen baru
└─ FASE 3: render <BKUSidebarLpj> dengan blokDokumentasi

BKUSidebarDokumentasi.jsx (BARU, ≤300 baris, self-contained)
└─ state uploadedPhotos/showPhotoPreview, fileInputRef, handler foto,
   listener addGeneratedPhoto, detectedTemplate, preview modal cetak foto
   prop: transaction

DetailDokumenLpj.jsx / DetailDokumenLpjBody.jsx
└─ prop baru blokDokumentasi (pola sama dengan blokTambahan), render setelah {blokTambahan} sebelum <aside>

BKUSidebarLpj.jsx (274 baris)
└─ oper blokDokumentasi = <BKUSidebarDokumentasi transaction={transaction} />

BKUSidebarLpjToolbar.jsx (66 baris)
└─ sticky top-[64px] z-10 + chip progres (klik → sorotPelanggaran) + hint otomatis BKU

DetailDokumenLpjBody.jsx (Zona B banner)
└─ pelanggaran dirender sebagai chip tombol → onSorot(violation) bila prop ada

Rename "Data BKU" → "Kas & Dokumen" (7 titik):
Sidebar.jsx:21 · BKUPage.jsx:353(+subtitle) · DashboardHome.jsx:51,259,280,430 ·
contextMap.js:17 · DokumenKelengkapanPage.jsx:1569
```

**Prinsip:** komponen Dokumentasi self-contained (state + listener ikut pindah) — `BKUSidebar`
hanya kehilangan kode, tidak membagi state. Halaman LPJ tidak mengoper `blokDokumentasi` →
render halaman LPJ **identik**.

## 2. Rencana Per File

| # | File | Aksi | Estimasi akhir |
|---|---|---|---|
| 1 | `components/bku/BKUSidebar.jsx` | edit (F0+F1+F3) | ±600 baris (dari 823) |
| 2 | `components/bku/BKUSidebarDokumentasi.jsx` | **baru** | ≤300 baris |
| 3 | `components/bku/BKUSidebarLpj.jsx` | edit (oper prop) | ±278 baris |
| 4 | `components/dokumen/DetailDokumenLpj.jsx` | edit (prop baru) | ±158 baris |
| 5 | `components/dokumen/DetailDokumenLpjBody.jsx` | edit (prop + banner clickable) | ±130 baris |
| 6 | `components/bku/BKUSidebarLpjToolbar.jsx` | edit (sticky + chip + hint) | ±95 baris |
| 7 | `components/layout/Sidebar.jsx` | edit (1 string) | ±1 baris |
| 8 | `pages/dashboard/BKUPage.jsx` | edit (title+subtitle + hapus "Kirim ke PBJ" :383-390) | ±-9 baris |
| 9 | `pages/dashboard/DashboardHome.jsx` | edit (4 string) | ±4 baris |
| 10 | `data/contextMap.js` | edit (1 string) | ±1 baris |
| 11 | `pages/dashboard/DokumenKelengkapanPage.jsx` | edit (1 string :1569) | ±1 baris |

**Tabu (0 diff):** `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js`,
`previewDocs.js`, `DokumenSPJPage.jsx`, `package.json`, `package-lock.json`.
**Dibiarkan (yatim, harmless):** deep-link consumer `DokumenSPJPage.jsx:61`,
`DokumenKelengkapanPage.jsx:505,1030`.

## 3. Task Breakdown

### FASE 0 — Fix crash (prasyarat; STOP-1 bila gagal)

| Task | Aksi | Gate |
|---|---|---|
| T-01 | Hapus `setSpjOpen(false)` + `setSpjChecked({})` (`BKUSidebar.jsx:122-123`); sederhanakan effect reset (hanya `setActiveTab('dokumen-lpj')` bila perlu) | klik baris di browser → sidebar terbuka; console **0 error** |
| T-02 | Composite key list grup se-Bukti (`:590`): `key={`${r.row}-${r.uraian || 'x'}-${i}`}` | buka baris ber-grup → console **0 warning duplicate key** |

### FASE 1 — Hapus tombol + dead code

| Task | Aksi | Gate |
|---|---|---|
| T-03 | Hapus tombol "Buka di LPJ" 2 varian (`:388-405`) | grep "Buka di LPJ" = 0; kartu Ringkasan utuh |
| T-04 | Hapus tombol "Lengkapi PBJ" (`:408-424`) + blok navigate PBJ; hapus tombol **"Kirim ke PBJ"** topbar (`BKUPage.jsx:383-390`) | grep "Lengkapi PBJ" = 0; grep "Kirim ke PBJ" di `BKUPage.jsx` = 0; baris tombol tinggal Upload Excel/PDF |
| T-05 | Hapus card "Cetak Dokumen" (`:741-753`) | grep "Cetak Dokumen" = 0 |
| T-06 | Hapus `handleDeepLink` (`:181-190`); cek sisa `navigate`/`useNavigate` → hapus import bila 0 pemakai; **JANGAN** sentuh `showToast`/`bkuPrefill`/`katEfektif` | `npm run build` exit 0; grep `useNavigate` di file = 0 (atau masih dipakai legit) |

### FASE 2 — Rename menu

| Task | Aksi | Gate |
|---|---|---|
| T-07 | Rename 7 titik (Sidebar:21, BKUPage:353+subtitle, DashboardHome:51/259/280/430, contextMap:17, DokumenKelengkapanPage:1569). Subtitle BKUPage jadi deskriptif alur (kas + dokumen) | grep "Data BKU" sisa = hanya daftar putih (BKUUploadPdf:408, PengaturanPage:104, RincianPajak:91, toast/prompt AI); build exit 0 |

### FASE 3 — Pindah Dokumentasi

| Task | Aksi | Gate |
|---|---|---|
| T-08 | Buat `BKUSidebarDokumentasi.jsx`: pindah utuh blok `:635-815` + state `uploadedPhotos`/`showPhotoPreview` + `fileInputRef` + handler foto + listener `addGeneratedPhoto` + `detectedTemplate` + preview modal. Prop: `transaction`. Blue-only | build exit 0; file ≤300 baris |
| T-09 | `BKUSidebar.jsx`: hapus tab `dokumentasi` dari `tabs`, hapus blok + state/handler/import yang sudah pindah; rapikan effect reset | grep `DokumentasiAIGenerate` di BKUSidebar = 0; `tabs.length === 1` |
| T-10 | `DetailDokumenLpj.jsx` + `DetailDokumenLpjBody.jsx`: prop `blokDokumentasi` (default null), render setelah `{blokTambahan}` sebelum `<aside>`; banner Zona B jadi chip clickable via prop opsional `onSorot` | build exit 0; halaman LPJ **tidak mengoper** prop → hash identik |
| T-11 | `BKUSidebarLpj.jsx`: oper `blokDokumentasi={<BKUSidebarDokumentasi transaction={transaction} />}` | urutan DOM: form → PBJ → Dokumentasi → aside |

### FASE 4 — Form mudah dijangkau

| Task | Aksi | Gate |
|---|---|---|
| T-12 | `BKUSidebarLpjToolbar.jsx`: wrapper `sticky top-[64px] z-10` (nilai diverifikasi visual, A-7) | scroll panel → toolbar menempel di bawah header, tidak tabrakan |
| T-13 | Chip progres: dari `pelanggaran` (readinessSidebar) → "N field wajib belum terisi" (slate) / "Lengkap — siap cetak" (primary solid); klik → `sorotPelanggaran(pelanggaran[0])` | klik chip → panel scroll + field tersorot |
| T-14 | Banner gate Zona B: tiap pelanggaran jadi chip tombol → `onSorot(v)`; halaman LPJ tanpa `onSorot` → tetap teks biasa | klik chip banner → sorot field terkait |
| T-15 | Hint otomatis BKU: baris kecil di toolbar "Isian otomatis dari baris BKU: Tanggal · No Bukti · Nominal" | tampil; blue-only |

### FASE 5 — Gate + verifikasi

| Task | Aksi | Gate |
|---|---|---|
| T-16 | `npm run build` exit 0; grep gates (blue-only, localStorage, dependency); `git diff --stat` cocok dengan §2; hash render halaman LPJ 4 kategori identik baseline; oracle | semua PASS |
| T-17 | Verifikasi browser end-to-end (AF-01…AF-10) + screenshot sebelum/sesudah | 0 error console; semua kriteria PASS |

## 4. Urutan Eksekusi & STOP

```
T-01 → T-02 → [STOP-1: crash fix terbukti] → T-03…T-06 → [build gate]
→ T-07 → T-08…T-11 → [STOP-2: hash halaman LPJ identik] → T-12…T-15
→ T-16 → T-17 → laporan + update STATE/DECISIONS/RISKS/QUESTIONS + pack checklist
```

| STOP | Kapan | Tindakan |
|---|---|---|
| STOP-1 | Setelah T-02, sidebar masih crash / warning masih ada | Perbaiki dulu; FASE 1 dilarang |
| STOP-2 | Setelah T-11, hash halaman LPJ berubah | Perbaiki; FASE 4 dilarang |
| STOP-3 | Muncul kebutuhan menyentuh file tabu | Berhenti, lapor, tunggu keputusan |
| STOP-4 | User menolak A-1…A-7 atau menjawab D-1 berbeda | Revisi pack dulu |

## 5. Skrip Uji (dibuat saat eksekusi, dihapus saat penutupan — C-05)

| Skrip | Untuk | Bundel |
|---|---|---|
| `test-lpj-hash-baseline.mjs` | hash render halaman LPJ 4 kategori (sebelum & sesudah) | `npx esbuild … --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env='{}'` |
| `test-sidebar-store.mjs` | store BKU + grup se-Bukti key unik | `--format=cjs` (tanpa JSX) |

> ⚠️ Pola esbuild dari Sprint 017/018: `--format=esm` gagal "Dynamic require of stream";
> tanpa `--jsx=automatic` gagal "React is not defined"; tanpa
> `--define:import.meta.env='{}'` gagal env undefined.

## 6. Verifikasi Browser (Playwright, /dashboard/bku)

1. Klik baris LPJ (mamin) → sidebar terbuka; console 0 error, 0 warning.
2. Kartu Ringkasan: tanpa 3 tombol/card; baris pajak: Coretax masih ada.
3. Tab bar tidak tampil (1 tab per baris).
4. Urutan blok di tab Dokumen LPJ: Toolbar → Form → PBJ → Dokumentasi → Panel Preview.
5. Upload foto → preview modal → cetak foto berfungsi.
6. Generate AI foto → masuk daftar (listener hidup).
7. Menu kiri + topbar + dashboard = "Kas & Dokumen".
8. Scroll panel → toolbar sticky; chip progres; klik chip → sorot field.
9. Banner gate chip → klik → sorot field terkait.
10. Simpan per NoBukti → reload → isian utuh (regresi Sprint 018).
