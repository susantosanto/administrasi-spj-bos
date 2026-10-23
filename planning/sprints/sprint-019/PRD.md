# PRD — Sprint 019: Rapikan Sidebar Detail Transaksi + Menu "Kas & Dokumen" + Dokumentasi Masuk Tab Dokumen LPJ + Fix Crash Sidebar

> Disusun 2026-10-23 dari Idea Brief idea-clarifier (5 permintaan user + 5 jawaban keputusan)
> dan verifikasi kode + browser 2026-10-23. Builder TIDAK boleh menambah/mengubah requirement
> tanpa persetujuan user (AGENTS.MD).

## 1. Keputusan User yang Sudah Dikunci (JANGAN diputuskan ulang)

| # | Pertanyaan idea-clarifier | Jawaban user | Konsekuensi |
|---|---|---|---|
| K-1 | Tombol mana yang dihapus dari kartu Ringkasan? | **"Buka di LPJ"** (konfirmasi eksplisit: "Lihat Dokumen SPJ" = tombol "Buka di LPJ") | 2 varian tombol (aktif + disabled) dihapus |
| K-2 | Tombol "Lihat Dokumen" yang mana? | **Terkonfirmasi 2026-10-23**: card **"Cetak Dokumen"** ("Buka halaman Cetak Dokumen") — user paste elemen persisnya | card dihapus |
| K-3 | Tombol "Lengkapi PBJ"? | **Hapus** | tombol + deep-link PBJ dihapus |
| K-9 | Tombol **"Kirim ke PBJ"** di topbar halaman Kas (sebelah Upload Excel/PDF, `BKUPage.jsx:383-390`)? | **Hapus** (user paste elemen persisnya) | tombol + navigate `?dok=PBJ` dihapus |
| K-4 | Nama menu baru untuk "Data BKU"? | **"Kas & Dokumen"** | 7 titik UI di-rename; string konsep-data TETAP |
| K-5 | Tab Dokumentasi untuk baris non-LPJ? | **"Hapus juga"** — tab Dokumentasi dihapus total untuk SEMUA baris | non-LPJ kehilangan akses upload foto (diterima user) |
| K-6 | Dokumentasi jadi apa? | **Blok seksi di dalam tab Dokumen LPJ**, sebelum Panel Preview; tab bar "Dokumentasi" hilang total | urutan: Toolbar → Form → PBJ → Dokumentasi → Preview |
| K-7 | Perbaikan form? | **"Kombinasi semua"**: urutan+prioritas, ringkas+jelas, sticky aksi | diwujudkan: sticky toolbar + chip progres + banner gate clickable (lihat D-1) |
| K-8 | Bayar via Coretax (baris pajak)? | **Tetap** | tombol Coretax di baris pajak TIDAK disentuh |

## 2. Kondisi Kode Hari Ini (bukti per baris, verifikasi 2026-10-23)

### 2.1 🔴 BUG AKTIF: sidebar CRASH setiap dibuka
`BKUSidebar.jsx:122-123` memanggil `setSpjOpen(false)` dan `setSpjChecked({})` — **kedua
setter TIDAK PERNAH dideklarasikan** (grep seluruh file: hanya 2 hit itu). Keduanya berada di
dalam `useEffect` reset dengan deps `[transaction, isLpj]` yang berjalan **setiap kali sidebar
dibuka** → `ReferenceError: setSpjOpen is not defined` → React me-unmount sidebar.

**Bukti browser (Playwright, 2026-10-23):** klik baris "Terima Dana BOSP" di /dashboard/bku →
Console: **8 error**, termasuk `ReferenceError: setSpjOpen is not defined` dan
`The above error occurred in the <BKUSidebar> component`. Sidebar hilang dari layar.
Screenshot: `bug-sidebar-crash.png`. Bug diperkenalkan di commit `c149a28` (Sprint 017).

### 2.2 ⚠️ Warning duplicate React key
Bersama crash muncul `Encountered two children with the same key, "1"` yang berasal dari
`BKUSidebar`. Kandidat list: `<li key={r.row}>` grup se-Bukti (`BKUSidebar.jsx:590`) — data
localStorage user bisa memuat `row` ganda (data lama). Prefix `REKENING_KE_MENU`
(`utils/bkuKategori.js:8-15`) semuanya unik → bukan sumbernya.

### 2.3 Tombol yang dihapus (lokasi pasti)
| Tombol | Lokasi | Catatan |
|---|---|---|
| "Buka di LPJ" (aktif) | `BKUSidebar.jsx:388-395` | memanggil `handleDeepLink()` |
| "Buka di LPJ" (disabled) | `BKUSidebar.jsx:397-405` | varian non-LPJ; user paste elemen persisnya |
| "Kirim ke PBJ" | `BKUPage.jsx:383-390` | topbar halaman; navigate `/dashboard/dokumen-kelengkapan?dok=PBJ`; user paste elemen persisnya |
| "Lengkapi PBJ" | `BKUSidebar.jsx:408-424` | navigate ke dokumen-kelengkapan |
| Card "Cetak Dokumen" | `BKUSidebar.jsx:741-753` | toast "Buka halaman Dokumen untuk mencetak"; user paste elemen persisnya |
| Tombol Coretax (baris pajak) | tetap | K-8: tidak disentuh |

### 2.4 Dead code yang ikut yatim
- `handleDeepLink` (`BKUSidebar.jsx:181-190`) — hanya dipakai tombol "Buka di LPJ" (:389).
- Blok navigate PBJ (`:409-417`) — hanya dipakai tombol "Lengkapi PBJ".
- `useNavigate`/`navigate` — setelah 2 di atas hilang, cek sisa pemakaian; hapus bila 0.
- `showToast` **TETAP** (dipakai `handleKoreksi` :107). `bkuPrefill` **TETAP** (dipakai
  `BKUSidebarLpj`). `katEfektif` **TETAP**.
- Deep-link consumer di halaman (`DokumenSPJPage.jsx:61`, `DokumenKelengkapanPage.jsx:505,1030`)
  jadi yatim tapi harmless — **dibiarkan** (A-4), dibersihkan di sprint lain.

### 2.5 Tab & blok Dokumentasi
- Array `tabs` (`BKUSidebar.jsx:174-179`): `dokumen-lpj` + `dokumentasi`. Setelah tab
  `dokumentasi` dihapus, tiap baris punya **1 tab** → guard `tabs.length > 1` membuat baris tab
  hilang otomatis (perilaku diinginkan, K-6).
- Blok Dokumentasi `:635-815` (~180 baris JSX): template terdeteksi, upload foto
  (`fileInputRef` :681), `DokumentasiAIGenerate`, preview modal cetak foto. State terkait:
  `uploadedPhotos`/`showPhotoPreview` (:75-76), listener event `addGeneratedPhoto` (:78-87),
  handler foto (:119-125, :213-245), `detectedTemplate` (:193).
- `DetailDokumenLpjBody.jsx`: urutan render `form → {blokTambahan} (:87) → <aside> preview`.
  Prop `blokTambahan` mengalir `DetailDokumenLpj.jsx:49 → :113 → Body:39 → :87`. Pola yang sama
  dipakai untuk prop baru `blokDokumentasi`.

### 2.6 Titik rename "Data BKU" → "Kas & Dokumen"
| Lokasi | Baris | Jenis |
|---|---|---|
| `components/layout/Sidebar.jsx` | :21 | label menu kiri |
| `pages/dashboard/BKUPage.jsx` | :353 (+subtitle sekitar) | judul Topbar |
| `pages/dashboard/DashboardHome.jsx` | :51, :259, :280, :430 | kartu ringkasan/judul |
| `data/contextMap.js` | :17 | title (dipakai `utils/aiHelper.js:70-71`) |
| `pages/dashboard/DokumenKelengkapanPage.jsx` | :1569 | teks UI |

**TETAP (konsep data, bukan nama menu):** `BKUUploadPdf.jsx:408` "Simpan ke Data BKU",
`PengaturanPage.jsx:104`, `RincianPajak.jsx:91`, toast/prompt AI yang menyebut "Data BKU".

## 3. User Stories

### US-01 — Sidebar tidak crash (bug fix, prasyarat semua fitur)
Sebagai operator, saat saya klik baris transaksi, sidebar detail terbuka utuh tanpa error console.

### US-02 — Kartu Ringkasan bersih
Sebagai operator, kartu Ringkasan hanya berisi data + tombol Coretax (baris pajak); tombol
"Buka di LPJ", "Lengkapi PBJ", dan card "Cetak Dokumen" hilang.

### US-03 — Menu bernama benar
Sebagai operator, menu kiri, judul halaman, dan kartu dashboard menyebut "Kas & Dokumen".

### US-04 — Dokumentasi di tempat yang benar
Sebagai operator, di tab Dokumen LPJ saya melihat: Toolbar → Form → blok PBJ → **blok
Dokumentasi** (upload foto + AI generate + cetak foto) → Panel Preview — tanpa pindah tab.

### US-05 — Form mudah dijangkau
Sebagai operator, toolbar form menempel saat scroll, menunjukkan progres field wajib, dan
banner gate bisa diklik untuk melompat ke field yang kurang.

## 4. Data Access Surface

| Key | Aksi | Perubahan |
|---|---|---|
| `spj_*` (semua) | baca/tulis via `storageHelper` | **0 key baru, 0 migrasi** |
| `spj_pbj_bku` | baca/tulis (Sprint 018) | tidak disentuh |
| Foto dokumentasi | state komponen + event window | pindah file, perilaku sama |

## 5. Non-Functional Requirements

| Kategori | Requirement |
|---|---|
| Visual | Blue-only `#004ac6` + slate; 0 kelas emerald/amber/rose/violet/cyan |
| Storage | Prefix `spj_` utuh; `rg "localStorage\."` di file baru = 0 |
| Cetak | `templateConfig.js` **0 diff**; area cetak foto tidak berubah perilaku |
| Ukuran | File baru ≤300 baris (BKUSidebarDokumentasi); `BKUSidebar.jsx` turun signifikan |
| Regresi | Halaman LPJ (`DokumenSPJPage.jsx`) **0 diff**; `DokumenKelengkapanPage.jsx` diff = hanya baris rename :1569 |
| Tabu | `bkuParser.js`, `SummaryCard.jsx`, `templateConfig.js`, `bkuKategori.js` 0 diff |
| Dependency | `package.json` / `package-lock.json` 0 diff |

## 6. Success Metrics

1. Klik baris → sidebar terbuka, **0 error console** (bukti: console Playwright kosong).
2. 0 warning duplicate key saat sidebar terbuka dengan data ber-grup.
3. Kartu Ringkasan tanpa 3 tombol/card yang dihapus; Coretax tetap.
4. Menu/judul/kartu = "Kas & Dokumen" (7 titik).
5. Tab bar hilang; urutan blok di tab Dokumen LPJ benar; upload foto + AI generate + cetak foto
   berfungsi di posisi baru.
6. Sticky toolbar + chip progres + banner gate clickable berfungsi.
7. `npm run build` exit 0; oracle PASS; halaman LPJ hash identik.

## 7. Out of Scope

- Reorder penuh field `DokumenFormPreview.jsx` (1896 baris) — lihat D-1.
- Membersihkan deep-link yatim di `DokumenSPJPage.jsx` / `DokumenKelengkapanPage.jsx`.
- Mengubah `bkuParser.js`, `SummaryCard.jsx`, `bkuKategori.js`, `templateConfig.js`.
- Perubahan halaman Dokumen LPJ / Dokumen Kelengkapan (di luar 1 string rename).
- Dependency baru, backend, migrasi data.

## 8. Risiko

| # | Risiko | Mitigasi |
|---|---|---|
| R-1 | Ekstraksi Dokumentasi memutus listener `addGeneratedPhoto` → foto AI tak masuk daftar | listener ikut pindah utuh; ACCEPTANCE punya test eksplisit generate→masuk daftar |
| R-2 | Sticky offset salah (tabrakan header) | verifikasi visual 2 ukuran layar |
| R-3 | Rename menyentuh `contextMap.js` yang dipakai AI helper | hanya `title`; perilaku aiHelper tidak berubah |
| R-4 | Fix crash mengubah perilaku yang selama ini "menutupi" bug lain | verifikasi penuh alur sidebar + oracle |
| R-5 | Non-LPJ kehilangan upload foto | keputusan user K-5 ("Hapus juga") — terdokumentasi |

## 9. Keputusan yang Masih Terbuka

**D-1 — "Urutan + prioritas" form:** reorder penuh field di `DokumenFormPreview.jsx` berisiko
tinggi (file 1896 baris, dipakai halaman LPJ juga). Usulan: **tanpa reorder penuh** —
"prioritas" diwujudkan lewat chip progres + sorot field + banner gate clickable (K-7 tetap
terpenuhi secara fungsi). User konfirmasi di dry run; bila menolak → sprint diperluas dengan
task reorder terpisah.

**Asumsi yang dikunci untuk pack (konfirmasi di dry run):**
- **A-1** ~~"Lihat Dokumen" = card "Cetak Dokumen"~~ → **TERKONFIRMASI user 2026-10-23** (elemen di-paste persis).
- **A-2** Tombol Coretax tetap (K-8).
- **A-3** String konsep-data "Data BKU" (toast, AI, tombol simpan PDF) tidak di-rename.
- **A-4** Deep-link yatim di halaman dibiarkan (harmless).
- **A-5** Blok Dokumentasi selalu terbuka (bukan accordion).
- **A-6** Fix duplicate key = composite key defensif (`row` + uraian + index), tanpa menyentuh parser.

## 10. Self-Review

- Semua 5 permintaan user terpetakan ke fitur F0–F5 + keputusan K-1…K-8. ✓
- Bug crash punya bukti console + lokasi baris + commit asal. ✓
- Out of scope eksplisit; file tabu tercantum. ✓
- D-1 jujur disajikan sebagai pertanyaan, bukan diputuskan diam-diam. ✓
