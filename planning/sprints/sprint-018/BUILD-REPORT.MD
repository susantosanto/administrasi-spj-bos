# BUILD-REPORT — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **SELESAI 2026-10-22.** Kode dibangun 2026-10-22 13:41–15:29; verifikasi & dokumentasi
> 16:2x–16:4x. Build final `✓ built in 12.35s` (sebelum C-05: 14.11s) · oracle **189 PASS / 0 FAIL** · browser
> **89 PASS / 0 FAIL** · gate file tabu **0 diff**.
> Pack: `PRD.md` · `REQUIREMENTS.MD` · `BLUEPRINT.md` · `ACCEPTANCE.MD` · `HANDOFF-PROMPT.MD`
> (+ salinan `architect-packs/architect-pack-018-*`).
> **Yang BELUM diuji ditulis jujur di §7** — sprint ini bukan "lulus penuh".

---

## 1. Tujuan (dari PRD, bukan hasil)

Tiga permintaan user dalam satu sprint (AD-0):
1. **Dropdown NoBukti mirip** — baris dengan kode rekening + kode kegiatan sama tetapi **bulan berbeda**
   bisa dilompati tanpa kehilangan isian (peringatan "simpan dulu?").
2. **Form Mamin 6 seksi** di sidebar BKU — satu sumber data, teks bawaan tampil di preview (bukan input).
3. **Dokumen PBJ per NoBukti** di sidebar, dengan preview **satu daftar** (LPJ dulu → PBJ menyusul).

Keputusan yang mengikat: D-1 = **satu** field `tanggalSurat` untuk Undangan & Pesanan (A-9) ·
D-2 = label PBJ bersufiks **" PBJ"**, LPJ menang bila bentrok (K-12).

---

## 2. Yang Dibuat / Diubah

### File baru (20)
| File | Isi | Baris | Batas |
|---|---|---|---|
| `utils/bkuMirip.js` | `kandidatMirip` · `labelKandidat` · `alasanKosong` | 92 | ≤120 ✅ |
| `utils/maminOtomatis.js` | `terapkanOtomatisMamin` · `DAFTAR_FIELD_OTOMATIS` | 143 | ≤200 ✅ |
| `utils/readinessSidebar.js` | `readinessSidebar` (buang `f-tanggalDanaMasuk`) | 30 | ≤60 ✅ |
| `utils/pbjBkuStore.js` | `kunciEntri` · `bacaEntri` · `simpanEntri` · `hapusEntri` (`spj_pbj_bku`) | 96 | ≤110 ✅ |
| `utils/pbjPrefill.js` | `prefillPbjDariBku` (Tanggal · Kegiatan · Alokasi · No. Bukti) | 79 | — |
| `utils/pbjTabs.js` | `PBJ_TABS` (salinan config, tanpa coupling ke halaman) | 69 | — |
| `utils/lpjSidebarMuat.js` | `muatAwalSidebar` (muat di inisialisasi, bukan `useEffect`) | 43 | — |
| `components/bku/DropdownNoBuktiMirip.jsx` | dropdown kandidat + dialog "simpan dulu?" | 123 | ≤180 ✅ |
| `components/bku/BKUSidebarLpjToolbar.jsx` | konteks baris + dropdown + Simpan | 66 | — |
| `components/bku/SidebarPbj.jsx` | shell 6 tab PBJ + Simpan PBJ | 92 | ≤200 ✅ |
| `components/bku/SidebarPbjForm.jsx` | isi tab (field config) | 51 | ≤200 ✅ |
| `components/dokumen/mamin/MaminForm6Seksi.jsx` | shell 6 seksi | 58 | ≤200 ✅ |
| `components/dokumen/mamin/MaminSeksiCard.jsx` | pembungkus kartu seksi | 21 | — |
| `components/dokumen/mamin/MaminSeksi1Dasar.jsx` | Tanggal · No Surat · Waktu · Tempat · Kegiatan | 114 | ≤180 ✅ |
| `components/dokumen/mamin/MaminSeksi2DaftarHadir.jsx` | pilih peserta + tabel NO/NAMA/NIP/JABATAN | 186 | ≤200 ✅ |
| `components/dokumen/mamin/MaminPesertaPicker.jsx` | modal pilih peserta Data Guru/Tendik | 50 | — |
| `components/dokumen/mamin/MaminSeksi3Undangan.jsx` | Tanggal Surat + Nomor Undangan | 56 | ≤120 ✅ |
| `components/dokumen/mamin/MaminSeksi4Pesanan.jsx` | Pesanan 2 seksi + "Isi menu baku" | 182 | ≤200 ✅ |
| `components/dokumen/mamin/MaminSeksi5BukuTamu.jsx` | No Urut · Tiba · Kembali · Identitas Tamu | 84 | ≤150 ✅ |
| `components/dokumen/mamin/MaminSeksi6Notulen.jsx` | tombol "Generate AI Notulen" | 82 | ≤120 ✅ |

### File diubah (9)
| File | Perubahan | Baris kini | Batas |
|---|---|---|---|
| `components/bku/BKUSidebarLpj.jsx` | dropdown + merge otomatis + gate sidebar + blok PBJ + preview gabungan | 248 | ≤260 ✅ (+127/−75) |
| `components/bku/BKUSidebar.jsx` | teruskan `allTransactions`/`onNavigate` | 955 | ≤1000 ✅ (+2) |
| `components/dokumen/DetailDokumenLpj.jsx` | prop `varianForm` · `bkuInfo` · `blokTambahan` | 156 | ≤200 ✅ (+7) |
| `components/dokumen/DetailDokumenLpjBody.jsx` | slot `blokTambahan` antara form & preview | 111 | ≤130 ✅ (+10) |
| `components/templates/DokumenFormPreview.jsx` | `varianForm` + cabang 6 seksi + sembunyikan tanggal dana masuk (2 titik) | 2087 | +21/−3 ✅ |
| `components/templates/MaminPreview.jsx` | kolom NIP di ringkasan layar | 258 | ≤260 ✅ |
| `data/templateConfig.js` | kolom NIP di `daftar_hadir` (NAMA 30→26 · NIP 18 · JABATAN 25→20) | — | **hanya blok itu** ✅ |
| `utils/aturanMamin.js` | `templateDaftarHadir` mengisi `nip` | 202 | ≤200 ⚠️ +2 |
| `utils/previewDocs.js` | `buildPreviewDocs` menerima `formPbj` → docs PBJ menyusul + sufiks " PBJ" | 485 | ≤480 ⚠️ +5 |

### Tidak disentuh (diverifikasi kosong)
`utils/bkuParser.js` · `components/templates/SummaryCard.jsx` · `pages/dashboard/DokumenSPJPage.jsx` ·
`pages/dashboard/DokumenKelengkapanPage.jsx` · `package.json` · `package-lock.json`.

---

## 3. Gate G-0…G-9 (output apa adanya)

| Gate | Hasil |
|---|---|
| G-0 Build | `✓ built in 14.11s` (pra-C-05) · `✓ built in 12.35s` (final, exit 0) |
| G-1 `bkuParser.js` | `git diff --stat` → **kosong** |
| G-2 Dependency | `git diff --stat` → **kosong** |
| G-3 `localStorage.` di file baru | **0 hit** |
| G-4 warna terlarang | **0 hit**; satu-satunya hex = `#004ac6` (`MaminSeksiCard.jsx:6`) |
| G-5 Batas modul | 18 file ≤ batas; **2 file lewat**: `previewDocs.js` 486/480, `aturanMamin.js` 202/200 |
| G-6 Halaman LPJ utuh | hash 4/4 sama dengan baseline EX-1 · `DokumenSPJPage.jsx` 0 diff |
| G-7 `SummaryCard.jsx` | 0 diff |
| G-8 `templateConfig.js` | +5/−2, hanya blok `daftar_hadir` |
| G-9 `DokumenKelengkapanPage.jsx` | 0 diff |

---

## 4. Oracle (10 skrip, 189 PASS / 0 FAIL)

| Skrip | PASS | Cakupan |
|---|---|---|
| `test-bku-mirip.mjs` | 20 | T-02 kandidat dropdown (bulan sama/aktif/rekening beda ditolak) |
| `test-mamin-otomatis.mjs` | 41 | T-03 merge 21 field otomatis, tidak menimpa isian user, murni |
| `test-pbj-bku-store.mjs` | 21 | T-12 round-trip, 2 NoBukti tidak saling timpa, JSON rusak → `null` |
| `test-pbj-prefill.mjs` | 20 | T-14 prefill 10 field + 6 tab |
| `test-readiness-sidebar.mjs` | 11 | T-04 gate sidebar tanpa "Tanggal dana masuk" |
| `test-mamin-seksi.mjs` | 31 | T-06/T-07/T-08 6 seksi, varian lama utuh, 0 input field §3.2 |
| `test-preview-gabung.mjs` | 10 | T-15 urutan LPJ→PBJ, sufiks " PBJ", 0 dobel |
| `test-dropdown-mirip.mjs` | 9 | T-13 render dropdown + dialog dirty |
| `test-daftar-hadir-nip.mjs` | 13 | T-10 kolom NIP, TTD tetap kosong |
| `test-daftar-hadir-delta.mjs` | 13 | Delta NIP = kolom lama + `nip`, isi lama tetap tercetak |
| `test-mamin-baseline.mjs` | 4 hash | honor `72e3a69d…` · perjalanan `45d43328…` · mamin `5a479f2c…` · pemeliharaan `0cebac48…` |

---

## 5. Uji Browser (Edge headless, dev server `:5199`, fixture 15 transaksi sintetis)

| Skrip | PASS | Isi |
|---|---|---|
| `cek-018-t17.cjs` | **31** | alur lengkap: dropdown 2 kandidat → pindah → dialog "simpan dulu?" (Batal & Simpan-pindah) → 6 seksi → PBJ prefill → simpan LPJ+PBJ → reload utuh → preview LPJ→PBJ |
| `cek-018-t18.cjs` | **51** | 4 kategori LPJ (full width · dropdown · 0 input tanggal dana masuk · blok PBJ · hanya Mamin 6 seksi) + 8 tipe non-LPJ (≤576px · tab Detail · tanpa dropdown/PBJ) |
| `cek-018-t19.cjs` | **7** | halaman LPJ utuh: input tanggal dana masuk ada · tanpa dropdown/PBJ/6 seksi · Cek tetap menagih "Tanggal dana masuk" |

Total **89 PASS / 0 FAIL**, **0 console error** di ketiga skrip.
Screenshot: `.workbuddy-ai/bukti-ui-20261022/AF-01…AF-06*.png` + `T18-*` + `T19-*`.

Skrip browser disimpan **di luar repo** (`D:/project/scratch-pw/cek-018-*.cjs`) sesuai pola
Sprint 017 (Playwright tidak masuk `package.json`).

---

## 6. Deviasi dari BLUEPRINT (yang benar-benar terjadi)

| # | Deviasi | Alasan / dampak |
|---|---|---|
| D-1 | T-15 memakai parameter **`formPbj`** (bukan `varianSidebar`/`docsPbj` seperti §2/§3) | Perilaku AD-7 tetap: docs PBJ menyusul, sufiks " PBJ", LPJ menang. Nama param beda dari kontrak dokumen |
| D-2 | `utils/prefillLpj.js` **tidak** diubah (T-09 butir 3) | `tanggalDanaMasuk` diisi di `maminOtomatis.js` (`isi(fd,'tanggalDanaMasuk', bku.tanggal)`) — satu jalur, bukan dua |
| D-3 | Field otomatis = **21** (16 top-level + 5 `bukuTamu`), bukan 17 seperti REQUIREMENTS §3.2 | Tidak menimpa isian user; tapi angka di REQUIREMENTS jadi tidak akurat |
| D-4 | 6 file tambahan di luar inventaris: `BKUSidebarLpjToolbar` · `MaminPesertaPicker` · `MaminSeksiCard` · `pbjTabs` · `lpjSidebarMuat` · `pbjPrefill` | Semua ≤79 baris; memecah file agar batas 200 baris terpenuhi |
| D-5 | `previewDocs.js` 486 (batas 480) & `aturanMamin.js` 202 (batas 200) | Kelebihan 5 dan 2 baris; tidak diperbaiki agar tidak menyentuh kode yang sudah lulus gate |
| D-6 | `DropdownNoBuktiMirip` dipasang di `BKUSidebarLpjToolbar`, bukan langsung di `BKUSidebarLpj` | Pemecahan file; wiring tetap lewat `BKUSidebarLpj` |

---

## 7. BELUM / UNTESTED (jujur)

1. **Preview = cetakan** (AF-03) — belum ada perbandingan PDF cetak vs panel preview.
2. **Cetak A4 tidak meluber** (AF-04 butir 3) — butuh PDF/cetak.
3. **Isi Notulen AI** + **E-12 kegagalan generate** — butuh API/internet.
4. **Wrap Nama Kegiatan** (AF-02 butir 2) — tanpa asersi khusus.
5. **E-4** (data BKU kosong) & **E-8** (Data GTK kosong) — belum diuji browser.
6. **`PUNGUT_PPH`** — baris tidak bisa dibuka (desain Sprint 017) → 8/9 tipe non-LPJ diuji.
7. **Data BKU nyata xcode** — semua uji memakai fixture sintetis.
8. **Commit/push** — belum dilakukan; menunggu keputusan user.

---

## 8. Keadaan Repo

- Branch `main` @ `c149a28` (**ahead 1, belum di-push**).
- Working tree: 13 file berubah + 31 untracked (20 file kode baru, pack sprint-018, 12 artefak uji, 2 scratch encoding).
- Skrip uji repo dihapus (C-05) → salinan `.workbuddy-ai/backup-sprint018-tests/`.

---

## 9. Revisi UI 2026-10-22 17:0x (6 permintaan user)

### 9.1 Berkas disentuh (14 diubah, 2 baru)

| Berkas | Baris | Perubahan |
|---|---|---|
| `bku/DropdownNoBuktiMirip.jsx` | 123 | judul tombol → **"Baris Serupa"** + chip jumlah; popover "Kegiatan serupa · periode berbeda" |
| `dokumen/DetailDokumenLpjHeader.jsx` | 108 | chip `…dari BKU …` **dihapus**; Undo hanya tampil bila ada field tertimpa |
| `templates/DokumenFormPreview.jsx` | 2078 | chip `formData.bkuSumber` **dihapus** (diganti komentar) |
| `dokumen/mamin/MaminSeksiCard.jsx` | 27 | nomor jadi chip `01`…`06`, judul rapat, ikon kanan |
| `dokumen/mamin/MaminSeksi1Dasar.jsx` | 114 | judul → **Identitas Kegiatan** |
| `dokumen/mamin/MaminSeksi2DaftarHadir.jsx` | 131 | judul → **Kehadiran Peserta**; tabel dipecah ke berkas baru |
| `dokumen/mamin/MaminSeksi3Undangan.jsx` | 56 | judul → **Undangan Kedinasan** |
| `dokumen/mamin/MaminSeksi4Pesanan.jsx` | 100 | judul → **Pesanan Konsumsi**; rincian dipecah ke berkas baru |
| `dokumen/mamin/MaminSeksi5BukuTamu.jsx` | 84 | judul → **Buku Tamu** |
| `dokumen/mamin/MaminSeksi6Notulen.jsx` | 82 | judul → **Notulen Rapat** |
| `bku/SidebarPbj.jsx` | 146 | toggle **NON-SIPLAH / SIPLAH**, tab difilter, header dirapikan, `data-blok="pbj"` |
| `bku/BKUSidebarLpj.jsx` | 258 | state `modePbj` (kunci `pbj_mode`), diteruskan ke `SidebarPbj` + `buildPreviewDocs` |
| `utils/pbjTabs.js` | 79 | tambah `tabsUntukMode(mode)` |
| `utils/previewDocs.js` | 485 | `pbjMode` param; `pbjDocs(formPbj, pbjMode)` |
| **`dokumen/mamin/MaminDaftarHadirTabel.jsx`** (baru) | 119 | tabel `<table table-fixed>` + `<colgroup>` — No/Nama/NIP/Jabatan |
| **`dokumen/mamin/MaminPesananRincian.jsx`** (baru) | 134 | blok Rincian Pesanan paritas LPJ |

Dua berkas baru lahir dari **pemecahan** `MaminSeksi2DaftarHadir` (212) dan
`MaminSeksi4Pesanan` (213) yang melewati batas 200 baris — bukan fitur baru.

### 9.2 Hasil uji pasca-revisi

| Skrip | PASS | Isi |
|---|---|---|
| `cek-018-revisi.cjs` | **31** | R1 judul tombol · R2 banner hilang · R3 enam judul baru · R4 tabel daftar hadir (8 asersi) · R5 rincian pesanan (9, termasuk lebar input) · R6 SIPLAH/NON-SIPLAH (7) · R7 0 console error |
| `cek-018-paritas.cjs` | **8** | membandingkan form rincian pesanan sidebar vs halaman LPJ secara langsung (jumlah baris, placeholder kolom, penomoran global, judul grup, jumlah toggle, uraian menu baku) |
| `cek-018-t17.cjs` | **31** | regresi penuh alur sidebar |
| `cek-018-t18.cjs` | **51** | regresi 4 kategori LPJ + 8 tipe non-LPJ |
| `cek-018-t19.cjs` | **7** | regresi halaman LPJ tetap utuh |

**Total 128 PASS / 0 FAIL**, 0 console error. Build `✓ built in 9.76s` · `12.76s` · `11.39s`.

### 9.3 Deviasi tambahan

| # | Deviasi | Alasan / dampak |
|---|---|---|
| D-7 | Label toggle rincian pesanan: sidebar `Nasi Box (6)`, halaman LPJ `Seksi Nasi Box (6)` | Kata "Seksi" dibuang sesuai permintaan poin 3. Struktur & perilaku identik (paritas P2–P8 lulus) |
| D-8 | 2 berkas baru hasil pemecahan (`MaminDaftarHadirTabel`, `MaminPesananRincian`) | Agar G-5 kembali hijau: 212→131+119 dan 213→100+134 |
| D-9 | Assertion uji T-17.17/T-17.19/T-18/T-19 diubah dari cocok-teks `Dokumen PBJ — NoBukti` menjadi `section[data-blok="pbj"]` | Header PBJ dipecah jadi judul + `No. Bukti …`; pencocokan teks jadi rapuh, selector DOM lebih jujur |

### 9.4 Bug nyata yang ketemu SAAT verifikasi (bukan rencana)

**B-1 — input `flex-1` + `w-full` menyusut jadi 18px, teks hilang.**
`MaminPesananRincian` (Uraian) dan `MaminSeksi5BukuTamu` (Nama tamu) memakai
`className={`${INPUT_SM} flex-1`}` sedangkan `INPUT_SM` berisi `w-full`.
Hasil ukur di DOM: `width:18px`, `clientWidth:16`, `scrollWidth:119` untuk
"Ayam Goreng Kremes" → teks terpotong total, kolom tampak kosong di screenshot.
Bandingkan dengan sumber LPJ (`DokumenFormPreview.jsx:1389`) yang hanya memakai
`flex-1` tanpa `w-full` — itulah bedanya.

Perbaikan: kelas dasar dipisah dari utilitas lebar —
`DASAR` (tanpa lebar) + `flex-1 min-w-0` untuk kolom lentur, `w-16`/`w-14` untuk
kolom tetap. Sesudah perbaikan: `width` kolom Uraian > 800px, teks tampil utuh.

Asersi penjaga ditambahkan (**R5.8/R5.9**): lebar ≥300px **dan**
`scrollWidth <= clientWidth + 2`. Tanpa asersi ini bug lolos karena uji lama
hanya memeriksa *keberadaan* input, bukan apakah teksnya terlihat.

### 9.5 Catatan proses

- `find` pada `<section>` **menipu**: `<section>` terluar membungkus seluruh form,
  jadi pencarian "seksi yang memuat X" selalu mengembalikan pembungkus. Selector yang
  benar = `innerText.trim().startsWith('02')`.
- `storageHelper.set` menulis `JSON.stringify`, jadi `localStorage.getItem('spj_pbj_mode')`
  bernilai `"siplah"` **dengan tanda kutip**. Asersi harus `JSON.parse` dulu.

---

## 10. Revisi lanjutan 2026-10-22 17:3x (3 permintaan user)

### 10.1 Yang diubah

| # | Permintaan | Yang dikerjakan | Bukti |
|---|---|---|---|
| 1 | Judul tombol "Baris Serupa" → "Kode Rekening / Kode Kegiatan Serupa" | Label diganti utuh (teks panjang, `whitespace-nowrap`); chip jumlah kandidat tetap | R1.1 / R1.3 PASS |
| 2 | "input form rincian pesanan masih acak-acakan sekali" | Baris `flex` diganti **`<table table-fixed>` + `<colgroup>`** dengan kepala kolom **No · Uraian · Satuan · Jumlah**; input tanpa kotak (hover/fokus saja); grup seksi jadi baris `colSpan`; lebar tetap 32/auto/72/72/32 px | R5.1b PASS · `FINAL-2-rincian-pesanan.png` · `FINAL-lpj-rincian.png` |
| 3 | "di dokumen non-tabel ada garis tipis — hilangkan untuk semua format non-tabel" | Grid global `.template-engine td/th { border: 1px solid #d1d5db }` **dihapus**; blok surat memakai `.surat-polos` (garis sel, garis putus-putus baris, dan garis bawah field dihilangkan; muncul lagi saat hover/fokus) | uji `cek-019-garis.cjs` 7/7 PASS · `ZOOM-kertas-undangan.png` |

**Kenapa aman menghapus grid global:** semua tabel yang MEMANG perlu garis menyatakan
sendiri — `TabelDinamis` (`border border-gray-300` per sel), `.spd-tabel` (hitam 1px),
`.kas-tabel` (titik, inline), `.pajak-tabel` (hitam). Diaudit per dokumen: 15 kertas dari
2 kategori (Mamin & Honor) → **0 sel bergaris tanpa dasar kelas tabel**.

**Berkas disentuh (10):** `DropdownNoBuktiMirip.jsx` · `MaminPesananRincian.jsx` (ditulis
ulang jadi tabel) · `DokumenFormPreview.jsx` (blok rincian inline 115 baris → 1 baris
komponen bersama, 2078 → 1965) · `index.css` (grid global dihapus + aturan `.surat-polos`
untuk layar) · `TabelLetterHeader` · `TabelFields` · `InfoKeuangan` · `HeaderDokumen` ·
`SignatureFooter` · `UraianKegiatan` (semua diberi `surat-polos`).

### 10.2 Hasil uji

| Skrip | PASS | Isi |
|---|---|---|
| `cek-018-revisi.cjs` | **33** | +R1.3 label lama hilang, +R5.1b tabel rincian |
| `cek-018-paritas.cjs` | **8** | sidebar vs halaman LPJ (kini satu komponen) |
| `cek-019-garis.cjs` | **7** | invarian "tidak ada sel bergaris tanpa dasar kelas tabel" + surat polos + tabel tetap utuh |
| `cek-018-t17.cjs` | **31** | regresi alur sidebar |
| `cek-018-t18.cjs` | **51** | regresi 4 kategori LPJ + 8 tipe non-LPJ |
| `cek-018-t19.cjs` | **7** | regresi halaman LPJ |

**Total 137 PASS / 0 FAIL**, 0 console error. Build `✓ built in 12.58s` · `11.74s`.

### 10.3 Catatan teknis

- **Satu komponen, dua tempat.** `MaminPesananRincian` sekarang dipakai sidebar DAN
  `DokumenFormPreview` (halaman LPJ) lewat prop `baku` (default dari `templatePesananMamin`).
  Efek samping: label toggle di halaman LPJ ikut menjadi `Nasi Box (6)` — **Q-7 terjawab
  dengan pilihan C** (kedua halaman sama-sama tanpa kata "Seksi").
- **Lebar kolom diuji di dua lebar berbeda.** Versi pertama memakai Satuan/Jumlah 104px →
  di halaman LPJ (tabel 414px) kolom Uraian tinggal 126px sehingga "Ayam Goreng Kremes"
  terpotong. Diperkecil ke 72px + No/hapus 32px → terbaca di 414px maupun 1367px.
- **Garis kop surat TETAP ADA** (`kop-ganda`, border-bottom 4px) — itu bagian resmi surat,
  bukan garis tabel. Yang dihapus hanya grid sel & garis dekoratif.

---

## §11 — Revisi panel preview & duplikat input (2026-10-22 18:0x)

Empat permintaan user, semuanya dieksekusi setelah akar masalah diukur di DOM (bukan ditebak).

### 11.1 Tinggi kartu preview = tinggi kertas (A4 / F4)

Kartu dipatok `lg:max-h-[calc(100vh-104px)]` → pada layar 1000px kartu hanya **896px**,
sementara satu lembar A4 = 297mm ≈ **1123px**. Akibatnya lembar terpotong dan harus
di-scroll di dalam kartu.

Perbaikan (`PanelPreviewDocument.jsx`): state `kertas` dinaikkan ke induk, area dokumen
diberi `maxHeight: calc(<297mm|330mm> + 30px)`. Terukur: **A4 → 1153px**, **F4 → 1277px**
(30px = baris judul dokumen). Orientasi diambil dari dokumen pertama; dokumen landscape
memakai tinggi 210mm.

### 11.2 Dokumen di tengah kiri-kanan

Akar masalah: `transform-origin: top left` + `transform: scale()` tanpa pergeseran, sehingga
kertas selalu menempel tepi kiri. Terukur pada panel 1377px: **kiri 8px, kanan 575px**.

Perbaikan: `transform: translateX((avail − natural×scale)/2) scale(scale)` — `translateX`
ditulis DI DEPAN `scale` supaya satuannya px induk (tidak ikut diperkecil). Terukur:
**kiri 291px / kanan 293px**; tetap ≤2px setelah ganti ke F4 dan pada viewport 900/800/700px.

### 11.3 Duplikat input "Nama Kegiatan" (card Kehadiran Peserta)

`MaminSeksi2DaftarHadir.jsx` merender input read-only "Keterangan / Judul Acara" yang
nilainya `formData.judulDaftarHadir || formData.acara` — duplikat "Nama Kegiatan" di seksi 1.
Blok itu dihapus (212 → 119 baris). Nilai tetap tercetak karena `templateDaftarHadir`
mengisinya dari `acara` (sumber tunggal).

### 11.4 Duplikat input "Tanggal" & "Kegiatan/Pekerjaan" (card Dokumen PBJ)

Dua field di tab Perencanaan punya sumber tunggal tetapi dirender sebagai input kedua.

- `utils/pbjTabs.js`: field ditandai `turunan: 'tanggalBku' | 'namaKegiatan'` + helper
  `fieldsTampil()`; `SidebarPbjForm` hanya merender field non-turunan dan menampilkan
  keterangan sumber.
- `utils/pbjPrefill.js`: `sinkronPbjDariSumber(form, {tanggal, acara})` — fungsi MURNI,
  MENIMPA nilai turunan (beda dengan `prefillPbjDariBku` yang hanya mengisi kosong),
  mempertahankan nilai lama bila sumber kosong, mengembalikan objek yang SAMA bila tidak
  berubah (setState bail-out, tanpa render berulang).
- `BKUSidebarLpj.jsx`: satu `useEffect` memanggil fungsi itu saat `bkuPrefill.tanggal` atau
  `formData.acara` berubah. Dokumen PBJ di preview ikut berubah — dibuktikan uji P16.

### 11.5 Dua efek samping yang ditemukan sendiri dari screenshot (bukan dilaporkan user)

1. **Toolbar panel menabrak header aplikasi.** Begitu kartu tidak lagi menjadi wadah scroll,
   `sticky top-0` pada bar A4/F4/Cek/Cetak menempel ke VIEWPORT. Dilepas → `relative`.
2. **`sticky` pada layout `side` jadi memaku kartu yang lebih tinggi dari layar**, sehingga
   bagian bawah dokumen tak pernah bisa dilihat. Kolom preview diberi
   `lg:max-h-[calc(100vh-104px)] lg:overflow-y-auto` (dulu batas itu ada di kartu).

### 11.6 Bukti

```
npx vite build   ✓ built in 10.49s   (exit 0)
                 ✓ built in 11.71s   (exit 0)

cek-020-revisi.cjs   17 PASS / 0 FAIL   (P1…P17)
cek-018-revisi.cjs   33 PASS / 0 FAIL
cek-018-paritas.cjs   8 PASS / 0 FAIL
cek-019-garis.cjs     7 PASS / 0 FAIL
cek-018-t17.cjs      31 PASS / 0 FAIL
cek-018-t18.cjs      51 PASS / 0 FAIL
cek-018-t19.cjs       7 PASS / 0 FAIL
TOTAL               154 PASS / 0 FAIL   0 console error
```

Screenshot diperiksa sendiri: `VIEW-sesudah-panel.png` (kertas di tengah, satu lembar utuh),
`VIEW-lpj-panel.png` (layout side, kertas mengisi kolom), `VIEW-kehadiran.png` (tanpa input
duplikat), `CARD-pbj2.png` (label PBJ tanpa Tanggal/Kegiatan).

### 11.7 Jujur — belum diuji

- Hasil **cetak/PDF** setelah perubahan panel (verifikasi hanya di layar; lihat `RISKS.MD`).
- Tampilan pada viewport < 700px.
- Penilaian visual subjektif ("premium/profesional") — tetap milik user.

---

## §12 — Tempat di atas TTD = "Cikalongwetan" (2026-10-22 18:2x)

### 12.1 Bug yang ditemukan sebelum mengubah apa pun

Probe (`cek-021-probe-tempat.cjs`) membuka 4 kategori BKU dan membaca baris
`<tempat>, <tanggal>` di atas tanda tangan pada SEMUA kertas preview:

```
BNU-01 (mamin)   doc0-3  Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026   ← salah
BNU-04 (honor)   doc0    Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026   ← salah
BNU-05 (transport) doc0  Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026   ← salah
BNU-06 (upah)    doc0    Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026   ← salah
```

Akar: `SignatureFooter` memakai `data.tempat`, padahal `tempat` adalah **tempat ACARA**
yang diisi otomatis `terapkanOtomatisMamin()` (`"Ruang Rapat <nama sekolah>"`) dan fungsi
itu dipanggil untuk SEMUA kategori di `BKUSidebarLpj`, bukan hanya Mamin.

### 12.2 Perbaikan

- `utils/tempatTtd.js` (baru): `TEMPAT_TTD = 'Cikalongwetan'` + `tempatTtdDari(data)`
  → `data.tempatTtd` bila terisi, selain itu default.
- `SignatureFooter.jsx`: `tempat = tempatTtdDari(data)`; input mode edit terikat ke
  `tempatTtd` (sebelumnya `tempat`) supaya mengubah tempat TTD tidak ikut mengubah
  tempat acara di Undangan.
- `previewDocs.js`: Lembar Pengaduan & Kritik-Saran memakai `TEMPAT_TTD`
  (sebelumnya `bku.footer.tempat || sekolah.kabupaten` → "KABUPATEN BANDUNG BARAT").
- `templateConfig.js`: default SK Honorer `tempatTtd: 'Bandung Barat'` → `'Cikalongwetan'`.

### 12.3 Bukti

```
npx vite build   ✓ built in 9.96s (exit 0)

cek-021-revisi.cjs   6 PASS / 0 FAIL   (T1…T6)
cek-020-revisi.cjs  17 PASS / 0 FAIL
cek-018-revisi.cjs  33 PASS / 0 FAIL
cek-018-paritas.cjs  8 PASS / 0 FAIL
cek-019-garis.cjs    7 PASS / 0 FAIL
cek-018-t17.cjs     31 PASS / 0 FAIL
cek-018-t18.cjs     51 PASS / 0 FAIL
cek-018-t19.cjs      7 PASS / 0 FAIL
TOTAL              160 PASS / 0 FAIL · 0 console error
```

Sesudah perbaikan, **17 dokumen dari 4 kategori** semuanya berbunyi
`Cikalongwetan, 22 Oktober 2026` (0 temuan "Ruang Rapat", 0 temuan "Bandung Barat").

### 12.4 Jujur — belum diuji

- Dokumen **SK Honorer** (butuh baris penerima dulu agar dokumennya terbentuk).
- **Lembar Pengaduan / Kritik-Saran** — tidak terjangkau dari data seed BKU.
- Hasil **cetak/PDF** (verifikasi hanya di layar).

---

## §13 — Struktur blok penerima Undangan / Pesanan (2026-10-22 18:4x)

### 13.1 Gejala & akar (diukur sebelum mengubah)

Probe `cek-022-probe-undangan.cjs` membuka `BNU-01` dan membaca 14 baris pertama
setiap kertas:

```
=== doc0 | SURAT UNDANGAN ===
 7 | Nomor	:	[ Nomor]
 8 | Sifat	:	Biasa
 9 | Lampiran	:	-
10 | Perihal	:	Undangan Rapat Guru	Kepada Yth,	Bapak/Ibu Guru
11 | Jl. Raya Cikalongwetan No. 1     ← bocor
12 | Jl. Raya Cikalongwetan No. 1     ← bocor (2x)
13 | Di	Di                            ← label + nilai default sama
14 | Tempat
=== doc1 | SURAT PESANAN ===
 7 | Nomor	:	[ Nomor]	Kepada Yth,	[ Kepada Yth,]
 9 | Lampiran	:	-	Di	Di tempat
```

Akar (4 lapis): `terapkanOtomatisMamin()` mengisi `alamatUndangan` +
`instansiUndangan` dengan `alamatSekolah` (keduanya label `''` → tercetak mentah);
`diUndangan` label `'Di'` + default `'Di'`; `diPesanan` label `'Di'` + default
`'Di tempat'`; `TabelLetterHeader` merender `<PlaceholderText label="">` → "[ isi]".

### 13.2 Perbaikan

| File | Perubahan |
|---|---|
| `utils/maminOtomatis.js` | cabut 2× `isi(fd, 'alamatUndangan'/'instansiUndangan', …)` + variabel `alamatSekolah`; komentar temuan + `DAFTAR_FIELD_OTOMATIS` dikoreksi |
| `data/templateConfig.js` | `diUndangan`+`tempatUndangan` dan `diPesanan`+**`tempatPesanan` (baru)**: label → `''`, default nilai `'di'`/`'tempat'` |
| `components/templates/blocks/TabelLetterHeader.jsx` | helper `kosongTanpaLabel(r)` — baris/sel kanan tanpa label DAN tanpa nilai tidak dicetak (mode edit tetap render) |

Prinsipnya: pada blok kanan "di / tempat" yang katanya tetap, **label dikosongkan dan
NILAI default yang dicetak** — bukan label. Itu menghilangkan "Di Di" tanpa
menghilangkan kemampuan mengedit.

### 13.3 Bukti

```
npx vite build   ✓ built in 8.91s (exit 0)

cek-022-revisi.cjs  35 PASS / 0 FAIL   (U1…U9 + per-kertas U3…U6)
cek-021-revisi.cjs   6 PASS / 0 FAIL
cek-020-revisi.cjs  17 PASS / 0 FAIL
cek-018-revisi.cjs  33 PASS / 0 FAIL
cek-018-paritas.cjs  8 PASS / 0 FAIL
cek-019-garis.cjs    7 PASS / 0 FAIL
cek-018-t17.cjs     31 PASS / 0 FAIL
cek-018-t18.cjs     51 PASS / 0 FAIL
cek-018-t19.cjs      7 PASS / 0 FAIL
TOTAL              195 PASS / 0 FAIL · 0 console error
```

Sesudah: blok penerima Undangan = `Kepada Yth, / Bapak/Ibu Guru / di / tempat`;
Pesanan = `Kepada Yth, / … / di / tempat`. Alamat sekolah tinggal di kop (1×).
Screenshot: `KERTAS-BNU-01-0.png`, `KERTAS-BNU-01-1.png`.

### 13.4 Temuan sampingan (diputuskan TIDAK diubah)

`pbj_pesanan` (kartu Kelengkapan) juga berjudul "SURAT PESANAN" tapi tidak punya
baris "di/tempat" — struktur asli sheet xlsx PBJ. Tidak diubah (bukan temuan user,
dan menambah baris = menambah struktur yang tidak diminta). Regression test
melewatkannya lewat penanda `Sifat`/`Isi Surat Pesanan`.

---

## §14 — PENUTUPAN SPRINT (2026-10-22 19:5x, keputusan user "tutup sprint dan simpan state terakhir")

### 14.1 Oracle dijalankan ULANG pada kode akhir

Angka sprint sebelumnya (189 PASS / 10 skrip) dikutip dari sesi 16:4x. Saat penutupan
seluruh 11 skrip oracle dibundel ulang (`esbuild --bundle --platform=node --format=cjs
--jsx=automatic --define:import.meta.env='{}'`) dari `.workbuddy-ai/backup-sprint018-tests/`
dan dijalankan dengan node terhadap kode FINAL:

```
test-bku-mirip.mjs        20 PASS / 0 FAIL
test-daftar-hadir-delta   13 PASS / 0 FAIL
test-daftar-hadir-nip     13 PASS / 0 FAIL
test-dropdown-mirip        9 PASS / 0 FAIL
test-mamin-baseline        1 PASS / 0 FAIL   (hash 4 kategori)
test-mamin-otomatis       41 PASS / 0 FAIL
test-mamin-seksi          31 PASS / 0 FAIL
test-pbj-bku-store        21 PASS / 0 FAIL
test-pbj-prefill          20 PASS / 0 FAIL
test-preview-gabung       10 PASS / 0 FAIL
test-readiness-sidebar    11 PASS / 0 FAIL
TOTAL                    190 PASS / 0 FAIL   (11 skrip; dokumen lama: 189 / 10 skrip)
```

**14 asersi sempat FAIL — semunya basi** (mengunci label/perilaku lama yang sengaja
diubah revisi user): label tombol dropdown ("NoBukti mirip" → "Kode Rekening / Kode
Kegiatan Serupa", revisi 17:0x & 17:3x), judul 6 seksi ("Seksi N — …" → judul
fungsional, revisi 17:0x), dan pengisian otomatis `alamatUndangan`/`instansiUndangan`
(dicabut 18:4x). Rincian per asersi + nilai baru: `ACCEPTANCE.MD` §11.2. Skrip di
folder backup diperbarui; salinan sementara di `spj-frontend/` dihapus lagi (C-05).

### 14.2 Browser (skrip `cek-*.cjs` di luar repo)

195 PASS / 0 FAIL (9 skrip) · build `✓ built in 8.91s` · 0 console error.

### 14.3 Keadaan repo

`main` @ `c149a28` (ahead 1, belum di-push) · 22 file berubah + 21 untracked.
**Belum di-commit** — menunggu kuasa user (aturan repo: dry run → lapor → tunggu user).

### 14.4 Baseline render halaman LPJ — hash BARU (referensi sprint berikutnya)

`test-mamin-baseline.mjs` adalah **regenerator** (bukan pembanding): ia render 4 kategori,
hitung hash, tulis JSON. Saat penutupan dijalankan ulang → hash BERUBAH dari baseline sprint
(karena 5 putaran revisi mengubah render). Baseline lama tetap di backup sebagai arsip
sprint; hash baru ini jadi rujukan untuk sprint mendatang:

```
honor             html=e472f1a78abf267a  docs=b216ae75780b2022  len=97900   (sprint: 72e3a69d…)
perjalanan_dinas  html=6103ddc05d030a28  docs=2bfb23cabeee19a2  len=34946   (sprint: 45d43328…)
mamin             html=253f8cb86a84fabc  docs=71b255b1603f583e  len=32081   (sprint: 5a479f2c…, EX-1 delta NIP)
pemeliharaan      html=c31696bc9b40ba0b  docs=6a6e30b6c16d2a85  len=14961   (sprint: 0cebac48…)
```
