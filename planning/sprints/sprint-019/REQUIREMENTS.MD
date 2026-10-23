# REQUIREMENTS — Sprint 019: Rapikan Sidebar Detail Transaksi + Menu "Kas & Dokumen" + Dokumentasi Masuk Tab Dokumen LPJ + Fix Crash Sidebar

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG sebelum pack ini disetujui
> (AGENTS.MD). Dokumen ini menjawab **apa & mengapa**, bukan **bagaimana** (itu BLUEPRINT).
> Input: `planning/sprints/sprint-019/PRD.md` (Idea Brief 2026-10-23 + verifikasi kode/browser).
> Runtime: React 18 + Vite + Tailwind, **tanpa backend**, localStorage prefix `spj_`.

---

## 1. Tujuan Sprint

Satu kalimat: **sidebar detail transaksi terbuka tanpa crash, bersih dari tombol yang menyesatkan,
bernama "Kas & Dokumen", dan Dokumentasi foto hidup di dalam tab Dokumen LPJ — dengan form yang
mudah dijangkau lewat toolbar menempel dan gate yang bisa diklik.**

Ukuran keberhasilan (bukan opini): klik baris → sidebar terbuka, **0 error console** → kartu
Ringkasan tanpa "Buka di LPJ"/"Lengkapi PBJ"/"Cetak Dokumen" → menu kiri & judul = "Kas &
Dokumen" → tab Dokumen LPJ berisi Toolbar → Form → PBJ → **Dokumentasi** → Panel Preview →
upload foto + AI generate + cetak foto berfungsi di posisi baru → toolbar menempel + chip
progres + banner gate clickable → build exit 0, halaman LPJ hash identik.

## 2. Masalah yang Diselesaikan

1. **Sidebar crash setiap dibuka** (bug Sprint 017, `c149a28`): `setSpjOpen`/`setSpjChecked`
   tak terdeklarasi di `BKUSidebar.jsx:122-123` → `ReferenceError` → sidebar hilang. Ini
   **prasyarat** semua fitur lain di sprint ini.
2. **Tombol yang menyesatkan**: "Buka di LPJ" dan "Lengkapi PBJ" membawa operator keluar dari
   konteks baris; card "Cetak Dokumen" hanya memunculkan toast "buka halaman Dokumen" — tiga
   pintu mati yang membingungkan.
3. **Nama menu tidak menggambarkan isi**: halaman berisi kas (BKU) + dokumen (LPJ, Kelengkapan,
   Pajak) tapi bernama "Data BKU".
4. **Dokumentasi foto tersembunyi di tab terpisah** yang hanya relevan untuk baris LPJ — dan
   tab bar 2 item hanya menambah klik.
5. **Form panjang sulit dijangkau**: aksi simpan jauh, tidak ada indikator progres field wajib,
   banner gate hanya teks statis.

## 3. Ruang Lingkup

### 3.1 Termasuk
| # | Item |
|---|---|
| S-0 | **Fix crash sidebar**: hapus 2 baris `setSpjOpen(false)` / `setSpjChecked({})` (`BKUSidebar.jsx:122-123`) |
| S-0b | **Fix duplicate key**: key list grup se-Bukti jadi composite defensif (`:590`) |
| S-1 | Hapus tombol **"Buka di LPJ"** (2 varian, `:388-405`) dari kartu Ringkasan |
| S-2 | Hapus tombol **"Lengkapi PBJ"** (`:408-424`) |
| S-2b | Hapus tombol **"Kirim ke PBJ"** di topbar halaman (`BKUPage.jsx:383-390`, sebelah Upload Excel/PDF) |
| S-3 | Hapus card **"Cetak Dokumen"** (`:741-753`) — **terkonfirmasi user** (elemen di-paste persis) |
| S-4 | Bersihkan dead code yatim: `handleDeepLink`, blok navigate PBJ, `useNavigate` bila 0 pemakai |
| S-5 | Rename **"Data BKU" → "Kas & Dokumen"** di 7 titik UI (PRD §2.6); string konsep-data tetap |
| S-6 | Ekstrak blok Dokumentasi (`:635-815` + state/handler terkait) → komponen baru **`BKUSidebarDokumentasi.jsx`** (self-contained) |
| S-7 | Hapus tab `dokumentasi` dari array `tabs`; baris tab hilang otomatis (guard `tabs.length > 1`) |
| S-8 | Prop baru **`blokDokumentasi`** di `DetailDokumenLpj.jsx` + `DetailDokumenLpjBody.jsx`, render setelah `{blokTambahan}` sebelum `<aside>` preview |
| S-9 | `BKUSidebarLpj` me-render `<BKUSidebarDokumentasi transaction={transaction} />` via prop itu |
| S-10 | **Sticky toolbar**: `BKUSidebarLpjToolbar` menempel di bawah header sidebar saat scroll |
| S-11 | **Chip progres** di toolbar: "N field wajib belum terisi" / "Lengkap — siap cetak"; klik → `sorotPelanggaran(pelanggaran[0])` |
| S-12 | **Banner gate clickable** (Zona B): daftar field kurang jadi chip tombol → klik → sorot field terkait (hanya varian sidebar; halaman LPJ tak memakai banner ini) |
| S-13 | Hint otomatis BKU di toolbar: baris kecil "Isian otomatis dari baris BKU: Tanggal · No Bukti · Nominal" |

### 3.2 Tidak termasuk (dilarang dikerjakan)
- Reorder penuh field `DokumenFormPreview.jsx` (D-1 — keputusan user di dry run).
- Membersihkan deep-link yatim di `DokumenSPJPage.jsx:61`, `DokumenKelengkapanPage.jsx:505,1030`.
- Mengubah `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js`, `previewDocs.js`.
- Perubahan halaman Dokumen LPJ (`DokumenSPJPage.jsx` 0 diff) dan Dokumen Kelengkapan
  (diff = **hanya** string rename `:1569`).
- Perubahan area cetak foto / template cetak mana pun.
- Dependency baru (`package.json` & `package-lock.json` 0 diff).
- Backend, migrasi data, sinkronisasi antar perangkat.

## 4. Keputusan User yang Dikunci (dari Idea Brief 2026-10-23)

| # | Keputusan | Bukti penerapan |
|---|---|---|
| K-1 | "Buka di LPJ" dihapus (2 varian) | 0 hit string di `BKUSidebar.jsx` |
| K-2 | "Lihat Dokumen" = card "Cetak Dokumen" dihapus — **terkonfirmasi** | 0 hit "Cetak Dokumen" |
| K-3 | "Lengkapi PBJ" dihapus | 0 hit string + blok navigate hilang |
| K-9 | "Kirim ke PBJ" (topbar halaman) dihapus | 0 hit string di `BKUPage.jsx`; baris tombol tinggal Upload Excel/PDF |
| K-4 | Menu = "Kas & Dokumen" | 7 titik UI renamed; grep "Data BKU" sisa = hanya konsep-data |
| K-5 | Tab Dokumentasi dihapus untuk SEMUA baris | array `tabs` 1 item; tab bar tak tampil |
| K-6 | Dokumentasi = blok sebelum Panel Preview | urutan DOM: form → PBJ → Dokumentasi → aside |
| K-7 | Form "kombinasi semua" | sticky + chip progres + banner clickable + hint BKU |
| K-8 | Coretax tetap | tombol Coretax utuh di baris pajak |

## 5. Asumsi yang Dikunci untuk Pack (WAJIB dikonfirmasi saat dry run)

| # | Asumsi | Alasan memilih | Dampak bila ditolak |
|---|---|---|---|
| **A-1** | ~~"Lihat Dokumen" = card "Cetak Dokumen"~~ **TERKONFIRMASI user 2026-10-23** (elemen di-paste persis) | — | — |
| **A-2** | Tombol Coretax tetap | K-8 eksplisit | — |
| **A-3** | String konsep-data "Data BKU" tidak di-rename | makna data, bukan nama menu | daftar rename membesar |
| **A-4** | Deep-link yatim di halaman dibiarkan | harmless, di luar cakupan | +2 file disentuh |
| **A-5** | Blok Dokumentasi selalu terbuka | konsisten dengan blok PBJ | +1 state accordion |
| **A-6** | Fix duplicate key = composite key defensif | data user bisa punya `row` ganda; parser TABU | investigasi lebih dalam |
| **A-7** | Sticky offset = tepat di bawah header sidebar (≈`top-[64px]`, diverifikasi visual) | header sidebar sticky | nilai disesuaikan saat verifikasi |

## 6. Fakta Kode yang Mengikat Rancangan (terverifikasi 2026-10-23)

| Fakta | Lokasi | Konsekuensi requirement |
|---|---|---|
| `setSpjOpen`/`setSpjChecked` hanya 2 hit, tak terdeklarasi | `BKUSidebar.jsx:122-123` | S-0: hapus 2 baris; effect reset disederhanakan |
| Crash terbukti di browser (8 error console) | Playwright 2026-10-23 | S-0 = prasyarat FASE 1 |
| Duplicate key `1` dari list BKUSidebar | console warning | S-0b: composite key `:590` |
| Tombol "Buka di LPJ" 2 varian | `:388-395`, `:397-405` | S-1 |
| Tombol "Lengkapi PBJ" | `:408-424` | S-2 |
| Tombol "Kirim ke PBJ" topbar | `BKUPage.jsx:383-390` | S-2b: hapus; baris tombol tinggal Upload Excel/PDF |
| `handleDeepLink` hanya dipakai `:389` | `:181-190` | S-4: hapus fungsi |
| Card "Cetak Dokumen" + toast | `:741-753` | S-3 |
| `showToast` dipakai `handleKoreksi` | `:107` | prop `showToast` TETAP |
| `bkuPrefill` dipakai `BKUSidebarLpj` | — | TETAP |
| Array `tabs` 2 item | `:174-179` | S-7: hapus `dokumentasi`; guard `tabs.length > 1` otomatis menyembunyikan tab bar |
| Blok Dokumentasi + state/handler | `:635-815`, `:75-76`, `:78-87`, `:119-125`, `:213-245`, `:193`, `:681` | S-6: pindah utuh ke komponen baru |
| Urutan render Body: form → `blokTambahan`(:87) → aside | `DetailDokumenLpjBody.jsx:39,87` | S-8: `blokDokumentasi` setelah `:87` |
| Aliran prop `blokTambahan` | `DetailDokumenLpj.jsx:49→:113` | S-8: pola sama untuk prop baru |
| `BKUSidebarLpjToolbar.jsx` 66 baris | — | S-10/S-11/S-13: modifikasi di file ini |
| Rename 7 titik | PRD §2.6 | S-5 |
| `contextMap.js:17` dipakai `aiHelper.js:70-71` | — | hanya `title` berubah; logika aiHelper utuh |

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement | Cara diperiksa |
|---|---|---|
| Stabilitas | Sidebar terbuka tanpa crash; 0 error console | Playwright console |
| Stabilitas | 0 warning duplicate key | Playwright console |
| Performa | Ekstraksi tidak menambah render berat | komponen murni, tanpa I/O baru |
| Jaringan | 0 request baru | tab Network kosong |
| Storage | Semua lewat `storageHelper`, prefix `spj_` | `rg "localStorage\."` file baru = 0 |
| Visual | Blue-only `#004ac6` + slate | regex `(bg|text|border|ring)-(emerald|amber|rose|violet|cyan)` = 0 |
| Cetak | `templateConfig.js` 0 diff; area cetak foto utuh | `git diff --stat` |
| Ukuran | `BKUSidebarDokumentasi.jsx` ≤300 baris; `BKUSidebar.jsx` turun ≥150 baris | `wc -l` |
| Regresi | `DokumenSPJPage.jsx` 0 diff; `DokumenKelengkapanPage.jsx` diff hanya `:1569` | `git diff` |
| Tabu | `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js` 0 diff | `git diff --stat` |
| Dependency | 0 perubahan `package.json` / `package-lock.json` | `git diff --stat` |

## 8. Risiko Requirement

| # | Risiko | Mitigasi (dibuktikan di ACCEPTANCE) |
|---|---|---|
| R-1 | Listener `addGeneratedPhoto` tidak ikut pindah → foto AI hilang | listener pindah utuh; test generate→masuk daftar (AF-06) |
| R-2 | Sticky offset bertabrakan header | verifikasi visual 2 ukuran (AF-08) |
| R-3 | Rename bocor ke string konsep-data | grep sisa "Data BKU" = daftar putih saja (AF-04) |
| R-4 | Fix crash menyembunyikan bug lain yang selama ini tertutup | verifikasi alur sidebar penuh + oracle (AF-01) |
| R-5 | Ekstraksi merusak preview modal cetak foto | test upload→preview→cetak di posisi baru (AF-06) |
| R-6 | `BKUSidebar.jsx` disentuh luas → regresi lintas fitur | diff terbatas + oracle + hash halaman LPJ (AF-09) |

## 9. Definition of Done (sprint)

1. Klik baris → sidebar terbuka utuh; **0 error console; 0 warning duplicate key**.
2. Kartu Ringkasan tanpa "Buka di LPJ"/"Lengkapi PBJ"/"Cetak Dokumen"; Coretax tetap.
3. "Kas & Dokumen" di 7 titik UI; string konsep-data utuh.
4. Tab bar hilang; urutan Toolbar → Form → PBJ → Dokumentasi → Preview benar; upload + AI
   generate + cetak foto berfungsi di posisi baru.
5. Sticky toolbar + chip progres (klik → sorot) + banner gate clickable + hint BKU berfungsi.
6. `npm run build` exit 0; oracle PASS; halaman LPJ hash identik; file tabu 0 diff.
7. `STATE.MD` + `DECISIONS.MD` + `RISKS.MD` + `QUESTIONS.MD` + checklist pack diperbarui.

---

**MULAI:** pack ini disetujui (termasuk A-1…A-7 dan jawaban D-1).
**SELESAI:** butir §9 terbukti dengan output asli, bukan klaim.
