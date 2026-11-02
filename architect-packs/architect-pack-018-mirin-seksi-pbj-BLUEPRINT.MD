# BLUEPRINT — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG sebelum pack disetujui.
> Menjawab **bagaimana**; **apa & mengapa** ada di REQUIREMENTS.MD.
> Asumsi A-1…A-9 (REQUIREMENTS §5) berlaku untuk seluruh dokumen ini.
> Dependency baru: **TIDAK ADA** (0 perubahan `package.json` / `package-lock.json`).
> Versi terpasang (dari `spj-frontend/package.json`, tidak diubah): react 18.3.1 · vite 5.4.21 ·
> tailwindcss 3.4.19 · react-router-dom 6.30.4 · xlsx 0.18.5 · pdfjs-dist 4.10.38 ·
> tesseract.js 7.0.0 · @heyputer/puter.js 2.5.4 · lucide-react 0.344.0.

---

## 1. Keputusan Arsitektur

### AD-0 — Tiga permintaan = satu tujuan operasional (catatan_one-goal_)
Bab 10.3: satu sprint = satu tujuan. Sprint 018 menerima **3 permintaan** dari user
(dropdown · 6 seksi · PBJ), tetapi ketiganya adalah **satu rewrite panel sidebar transaksi
BKU**: "satu tempat untuk mencetak kegiatan berulang tanpa mengetik ulang, dengan isian
sekali dan dokumen lengkap per NoBukti". Ketiganya berbagi 1 komponen (`BKUSidebarLpj`), 1
lapisan data (`formData` + merge otomatis), dan 1 preview — sehingga **dipisah jadi 3 sprint
justru memaksa 3× menyentuh file yang sama** dan mengorbankan hasil utuh (panel +
preview + cetak harus sinkron).
**Catatan jujur untuk user:** bila ini tetap terlalu besar, urutan pemecahan paling aman =
(1) dropdown + merge otomatis (T-01…T-11) → (2) PBJ per baris (T-12…T-15) → (3) revisi
6 seksi (T-06…T-08 sebagai tahap lanjutan). Pakus ini memakai urutan aslinya (6 seksi dulu,
lalu PBJ) karena 6 seksi bergantung pada merge otomatis yang dibangun di FASE 0.

### AD-1 — Dropdown = navigasi baris yang sudah ada (bukan state baru)
`BKUSidebar` sudah menerima `allTransactions` + `onNavigate` (`BKUSidebar.jsx:60`, dipakai
tombol ‹ › `:260-263`; `BKUPage.jsx:841` → `setSidebarTransaction(tx)`). Kandidat dropdown
dipanggil lewat **`onNavigate(kandidat)`** → panel detail berpindah ke baris itu **utuh**
(rekap, form, preview, target penyimpanan) karena sidebar memang digerakkan oleh state
transaksi. Tidak ada state "baris aktif kedua" → tidak ada dua sumber kebenaran (R-2 pola).
**Peringatan "simpan dulu"** dijaga di `BKUSidebarLpj` (satu-satunya holders `formData`),
karena dirty-state hanya diketahui di sana.

### AD-2 — Gate sidebar = fungsi baru; `SummaryCard.jsx` 0 diff
`readinessCheck` (`SummaryCard.jsx:20-26`) dipakai **halaman LPJ** (gate cetak) — mengubahnya
melanggar K-5. Sidebar memakai `utils/readinessSidebar.js`:
`readinessSidebar(formData)` = `readinessCheck(formData)` **minus** pelanggaran
`fieldId === 'f-tanggalDanaMasuk'`. Satu-satunya perubahan `readinessCheck` = **0 diff**.

### AD-3 — 6 seksi = komponen baru + 1 cabang pada `DokumenFormPreview`
`DokumenFormPreview.jsx` (2069 baris) dipakai sidebar **dan** halaman LPJ. Menaruh 6 seksi
di dalamnya tanpa pembatas = halaman LPJ ikut berubah (F-2). Solusi:
- `DokumenFormPreview` menerima prop baru `varianForm` (`'lama'` default | `'sidebar6'`).
- Cabang Mamin menjadi: `varianForm === 'sidebar6' && isMamin ? <MaminForm6Seksi …/> : <cabang lama>`.
- **Cabang lama tidak disentuh** (bukti: hash render halaman LPJ identik, T-01 → T-14).
- Input "Tanggal dana masuk" disembunyikan **hanya** saat `varianForm === 'sidebar6'`
  (2 titik: `:541` recipient & `:1081` mamin/upah) → 4 kategori LPJ ikut (K-10).
- Area cetak (`renderPrintArea()` → `MaminPreview`) **tetap di `DokumenFormPreview`** → tidak
  ada duplikasi area cetak, tombol Cetak sidebar tetap punya sumber (AD-3 sekaligus menjawab
  kekhawatiran "area cetak ikut hilang").

### AD-4 — Nilai otomatis: SATU fungsi merge di lapisan formData
Preview Mamin (`maminDocs()`) dan area cetak Mamin (`MaminPreview.jsx`) adalah **dua builder
terpisah** (F-3). Kalau nilai otomatis hanya dipasang di preview → yang tampil ≠ yang tercetak.
Keputusan: `utils/maminOtomatis.js` exports
`terapkanOtomatisMamin(formData, ctx)` → **formData baru** (formData-first: hanya mengisi
field **kosong**). Dipanggil **satu kali** di `BKUSidebarLpj` (sebelum state form dipakai),
sehingga form, preview, dan cetak membaca **nilai yang sama**. Nilai ikut tersimpan
(konsisten dengan prefill Sprint 017 yang juga menulis nilai turunan ke `formData`).
Template resmi dipakai, bukan string salinan: `templateUndanganMamin()` (aturanUndangan.js:65),
`templatePesananMamin()` (aturanMamin.js:93), `drafNotulen()` (aturanUndangan.js:114).

### AD-5 — PBJ per baris = store baru, satu pola dengan `lpjBkuStore`
`utils/pbjBkuStore.js` (baru) meniru `utils/lpjBkuStore.js`: kunci `pbj_bku` (→ `spj_pbj_bku`),
entri `<kategori>|<noBukti>`, `noBuktiSah()` menolak NoBukti kosong, data rusak → `null`.
`spj_pbj_form` (global, halaman Kelengkapan) **tidak** dibaca/tulis di sprint ini (A-5).

### AD-6 — Blok PBJ = slot di `DetailDokumenLpjBody`
Kebutuhan: blok PBJ **di bawah form LPJ, di atas Panel Preview**. `DetailDokumenLpjBody`
sudah menandai layout `stack` = 1 kolom → cukup menyisipkan slot `blokTambahan` antara `<section>`
form dan `<aside>` preview. Slot hanya diisi bila prop diberikan → halaman LPJ (tanpa prop)
**tidak berubah**. Label dokumen PBJ diberi sufiks " PBJ" (D-2) → nama unik (K-12); aturan
"LPJ menang" tetap dipasang sebagai jaring pengaman.

### AD-7 — Preview satu daftar: LPJ dulu, PBJ menyusul
`buildPreviewDocs()` (previewDocs.js) menerima opsi baru `varianSidebar` + `docsPbj`:
- `varianSidebar` → `maminDocs()` memakai **formData yang sudah di-merge** (nilai otomatis sudah
  ada di formData, jadi `maminDocs` tidak perlu tahu aturan baru) → **preview = cetakan**.
- `docsPbj` → `pbjDocs(formPbj, mode)` (fungsi yang sudah ada, dipakai halaman Kelengkapan)
  digabung **setelah** docs LPJ, dengan label bersufiks " PBJ".
- Halaman LPJ memanggil `buildPreviewDocs` **tanpa** opsi baru → perilakunya sama.

### AD-8 — NIP masuk Daftar Hadir (perubahan template yang disengaja)
`templateConfig.daftar_hadir` kolom tabel-dinamis: tambah `{ key: 'nip', label: 'NIP', width: 18 }`
danecilkan lebar NAMA/JABATAN/TTD (total tetap 100). `templateDaftarHadir()` (aturanMamin.js)
mengisi `nip` dari data GTK. `MaminPreview`/`maminDocs` meneruskan `rows` apa adanya (sudah
memakai spread `...r`) → **tanpa** perubahan tambahan. Kolom TANDA TANGAN (K-9) tetap ada.

---

## 2. Inventaris File

### Baru
| File | Isi | Batas baris |
|---|---|---|
| `spj-frontend/src/utils/bkuMirip.js` | `kandidatMirip(allTransactions, transaction)` → kandidat NoBukti mirip (A-1) + `labelKandidat(tx)` | ≤120 |
| `spj-frontend/src/utils/maminOtomatis.js` | `terapkanOtomatisMamin(formData, ctx)` → formData ter-merge (AD-4) + `DAFTAR_FIELD_OTOMATIS` (17 field, REQUIREMENTS §3.2) | ≤200 |
| `spj-frontend/src/utils/readinessSidebar.js` | `readinessSidebar(formData)` = `readinessCheck` tanpa `f-tanggalDanaMasuk` (AD-2) | ≤60 |
| `spj-frontend/src/utils/pbjBkuStore.js` | `kunciEntri` · `noBuktiSah` (reuse) · `bacaEntri` · `simpanEntri` · `hapusEntri` (AD-5) | ≤110 |
| `spj-frontend/src/components/bku/DropdownNoBuktiMirip.jsx` | dropdown kandidat + dialog "simpan dulu?" (AD-1, A-3) | ≤180 |
| `spj-frontend/src/components/bku/SidebarPbj.jsx` | shell blok PBJ: 6 tab + tombol Simpan + label jujur (AD-5/AD-6) | ≤200 |
| `spj-frontend/src/components/bku/SidebarPbjForm.jsx` | isi 6 tab PBJ (field config) + prefill otomatis BKU | ≤200 |
| `spj-frontend/src/components/dokumen/mamin/MaminForm6Seksi.jsx` | shell 6 seksi (judul seksi + isi) | ≤200 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi1Dasar.jsx` | Tanggal · No Surat · Waktu · Tempat · Nama Kegiatan | ≤180 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi2DaftarHadir.jsx` | pilih peserta + tabel NO/NAMA/NIP/JABATAN/kolom opsional | ≤200 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi3Undangan.jsx` | Tanggal Surat + Nomor (generate) | ≤120 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi4Pesanan.jsx` | Tanggal Surat · Nomor · Hari/Tanggal · Jenis · Jumlah · Kepada · Alamat · Rincian | ≤200 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi5BukuTamu.jsx` | No Urut · Tiba · Kembali · Identitas Tamu | ≤150 |
| `spj-frontend/src/components/dokumen/mamin/MaminSeksi6Notulen.jsx` | tombol "Generate AI Notulen" + hasil (K-9 tambahan) | ≤120 |
| `spj-frontend/test-mamin-otomatis.mjs` (sementara) | oracle merge + daftar field otomatis | — |
| `spj-frontend/test-bku-mirip.mjs` (sementara) | oracle kandidat dropdown | — |
| `spj-frontend/test-pbj-bku-store.mjs` (sementara) | oracle store PBJ per baris | — |
| `spj-frontend/test-mamin-seksi.mjs` (sementara) | oracle render 6 seksi + cek field | — |

> Skrip uji **dihapus** saat sprint ditutup (pola Sprint 017 C-05); hasilnya dikutip di BUILD-REPORT.

### Diubah
| File | Perubahan | Batas |
|---|---|---|
| `components/templates/DokumenFormPreview.jsx` | (a) prop `varianForm`; (b) cabang Mamin → `MaminForm6Seksi` bila `varianForm==='sidebar6'`; (c) sembunyikan input "Tanggal dana masuk" di varian sidebar (2 titik) | **naik ≤ 60 baris**, cabang lama utuh |
| `components/dokumen/DetailDokumenLpj.jsx` | teruskan prop `varianForm` + `blokTambahan` | ≤200 |
| `components/dokumen/DetailDokumenLpjBody.jsx` | slot `blokTambahan` antara form & preview (hanya bila prop ada) | ≤130 |
| `components/bku/BKUSidebarLpj.jsx` | (a) dropdown kandidat; (b) merge otomatis (AD-4); (c) gate sidebar; (d) blok PBJ + simpan; (e) preview gabungan | ≤260 |
| `components/bku/BKUSidebar.jsx` | teruskan `allTransactions` + `onNavigate` ke `BKUSidebarLpj` (sudah ada di props sidebar) | ≤1000 |
| `utils/previewDocs.js` | opsi `varianSidebar` + `docsPbj` → docs digabung (AD-7); `maminDocs` memakai merge | ≤480 |
| `utils/aturanMamin.js` | `templateDaftarHadir` mengisi `nip` (AD-8) | ≤200 |
| `utils/prefillLpj.js` | `tanggalDanaMasuk` terisi otomatis dari tanggal BKU (nilai, tanpa input) | ≤160 |
| `data/templateConfig.js` | kolom NIP pada `daftar_hadir` (+ setelan lebar) | **diff hanya blok `daftar_hadir`** |
| `components/templates/MaminPreview.jsx` | ringkasan layar: kolom NIP ikut (opsional, ≤5 baris) | ≤260 |

### Dilarang disentuh
`utils/bkuParser.js` (TABU) · `components/templates/SummaryCard.jsx` (0 diff) ·
`components/templates/PanelPreviewDocument.jsx` · `pages/dashboard/DokumenSPJPage.jsx` ·
`pages/dashboard/DokumenKelengkapanPage.jsx` · `utils/aturanPbj.js` · `utils/paketPbj.js` ·
`utils/aturanUndangan.js` · `package.json` · `package-lock.json` · seluruh `utils/bkuPdf*`.

> **Izin khusus (KE-1):** `data/templateConfig.js` **boleh** berubah **hanya** pada blok
> `daftar_hadir` (kolom NIP). Perubahan lain di file itu = STOP-3.
> **Izin khusus (KE-2):** `utils/previewDocs.js` **boleh** berubah **hanya** pada
> `buildPreviewDocs`/`maminDocs` (opsi baru + penggabungan PBJ). Perubahan logika dokumen
> kategori lain = STOP-3.

---

## 3. Kontrak Data

### 3.1 Kandidat dropdown (A-1)
```js
// utils/bkuMirip.js
export function kandidatMirip(allTransactions = [], transaction = {}) {
  const rek = String(transaction.kodeRekening || '').trim()
  const keg = String(transaction.kodeKegiatan || '').trim()
  if (!rek || !keg) return []                 // tanpa kode → tidak ada kandidat (A-1)
  return allTransactions.filter((t) =>
    t.row !== transaction.row &&
    String(t.kodeRekening || '').trim() === rek &&
    String(t.kodeKegiatan || '').trim() === keg &&
    Number(t.bulan) !== Number(transaction.bulan)   // bulan berbeda
  ).map((t) => ({
    row: t.row, noBukti: t.noBukti || '', bulan: t.bulan,
    tanggalStr: t.tanggalStr || t.tanggal || '', uraian: t.uraian || '',
    pengeluaran: t.pengeluaran || 0,
  }))
}
```
Label kandidat: `Februari · #BNU-12 · Rapat Guru · Rp 1.500.000` (bagian kosong → kosong, jujur).

### 3.2 Merge nilai otomatis (AD-4)
```js
// utils/maminOtomatis.js
export const DAFTAR_FIELD_OTOMATIS = [
  'sifatUndangan','lampiranUndangan','perihalUndangan','kepadaUndangan','isiUndangan',
  'hariUndangan','tanggalAcara','tempatAcara','waktuAcara','alamatUndangan','instansiUndangan',
  'sifatPesanan','perihalPesanan','isiPesanan','hariPesanan',
  'tanggalDanaMasuk',
]   // + group bukuTamu: tanggal, bertemu, diterima, tujuan, uraian (di dalam formData.bukuTamu)

export function terapkanOtomatisMamin(formData = {}, ctx = {}) → formDataBaru
```
Aturan:
- **formData-first**: field yang sudah terisi (user) **tidak** ditimpa.
- Nilai diambil dari: template resmi (`templateUndanganMamin`, `templatePesananMamin`,
  `drafNotulen`), Data Sekolah (`getSchoolData()`), Data Pejabat (`getPejabat('ks')`), dan baris BKU.
- `bukuTamu` digabung **per-field** (object merge), bukan diganti utuh.
- Tanpa sumber → `''` (jujur, bukan karangan).
- `tanggalDanaMasuk` = `bku.tanggal` (nilai dari baris BKU) — tetap tersimpan, **tanpa input**.

### 3.3 Store PBJ per baris (AD-5)
```json
// key: spj_pbj_bku
{
  "mamin|BNU-07": {
    "kategori": "mamin",
    "noBukti": "BNU-07",
    "form": { "perencanaan": {}, "pesanan": {}, "bahp": {}, "bast": {}, "nego": {}, "data": {} },
    "savedAt": "2026-10-21T20:00:00.000Z"
  }
}
```
- `noBukti` kosong/`'-'` → `{ ok:false, alasan:'no-bukti' }`, storage **tidak bertambah**.
- Data rusak → `bacaEntri` = `null` (tidak melempar).
- Satu entri = satu baris; menulis entri tidak menyentuh entri lain **dan tidak menyentuh**
  `spj_pbj_form`.

### 3.4 Prefill PBJ dari BKU (K-11)
| Field PBJ | Sumber |
|---|---|
| `perencanaan.tanggalSurat` | `bku.tanggal` (ISO) |
| `perencanaan.kegiatan` | `bku.uraian` (atau `kegiatanNama`) |
| `perencanaan.alokasi` | `bku.pengeluaran` (format Rp) |
| `pesanan.tanggalPesanan` | `bku.tanggal` |
| `pesanan.grandTotal` | `bku.pengeluaran` |
| `data.bulan` | `bulanDariISO(bku.tanggal)` (pola `paketPbj.bulanDariISO`) |
| `data.noBukti` | `bku.noBukti` |
| `data.tanggalPesanan` | `bku.tanggal` |
| `data.alokasi` | `bku.pengeluaran` |
| `data.spesifikasi` | `bku.uraian` |

Prefill **tidak menimpa** isian user (formData-first) dan **hanya** untuk baris tanpa entri
tersimpan.

### 3.5 Props baru
```js
// DetailDokumenLpj
{ varianForm = 'lama',        // 'lama' | 'sidebar6'
  blokTambahan = null }        // node (blok PBJ) — hanya dirender bila ada

// DetailDokumenLpjBody
{ varianForm = 'lama', blokTambahan = null }

// DokumenFormPreview
{ varianForm = 'lama' }

// buildPreviewDocs (previewDocs.js)
{ ..., varianSidebar = false, docsPbj = [] }
```

---

## 4. Fase & Task

> Estimasi jujur (menit). Gate setiap task WAJIB dijalankan, bukan diasumsikan.
> Semua perintah dijalankan dari `D:\project\spj-app` (PowerShell 5.1, `rg` tersedia,
> `bash` **tidak** tersedia — pakai PowerShell).

### FASE 0 — Fondasi & baseline (0 perubahan perilaku)

**T-01 — Baseline render (halaman LPJ + sidebar)** · 30 mnt
- Tulis `spj-frontend/test-mamin-baseline.mjs`: `renderToStaticMarkup` untuk 4 kategori
  (`honor`, `perjalanan_dinas`, `mamin`, `pemeliharaan`) → hash HTML form+docs → simpan
  `test-mamin-baseline.json`.
- Bundel: `npx esbuild test-mamin-baseline.mjs --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env='{}'`
  (EX-1 Sprint 017: tanpa `--define` → `import.meta.env` undefined; tanpa `--jsx=automatic` → "React is not defined").
- **DoD:** 4 hash tercetak, JSON ada. Ini pembanding mutlak R-2 (AF-08).

**T-02 — `utils/bkuMirip.js`** · 30 mnt
- `kandidatMirip()` + `labelKandidat()` sesuai §3.1.
- **DoD oracle `test-bku-mirip.mjs`** (fixture 6 baris):
  1. baris tanpa `kodeKegiatan` → `[]`;
  2. 2 baris cocok (kode rekening + kode kegiatan sama, bulan beda) → **2 kandidat**;
  3. baris dengan `kodeRekening` berbeda → **ditolak**;
  4. baris dengan `kodeKegiatan` berbeda → **ditolak**;
  5. baris **bulan sama** → **ditolak** (A-1);
  6. baris aktif sendiri → **ditolak**;
  7. label memuat bulan + NoBukti + uraian + nominal.

**T-03 — `utils/maminOtomatis.js`** · 45 mnt
- `terapkanOtomatisMamin()` sesuai §3.2 + `DAFTAR_FIELD_OTOMATIS`.
- **DoD oracle `test-mamin-otomatis.mjs`**:
  1. `formData` kosong → 17 field terisi sesuai sumber (template/sekolah/pejabat/BKU);
  2. field yang **sudah** terisi user **tidak** ditimpa;
  3. `bukuTamu` digabung per-field (field lain tetap);
  4. tanpa Data Sekolah → field sekolah = `''` (jujur);
  5. `tanggalDanaMasuk` = `bku.tanggal`;
  6. fungsi **murni** (argumen sama → hasil sama; tanpa I/O).

**T-04 — `utils/readinessSidebar.js`** · 15 mnt
- **DoD oracle (bagian T-03 script atau script kecil):** `readinessSidebar({})` → 2 pelanggaran
  (Nomor Surat + Daftar isi) dan **tidak** memuat "Tanggal dana masuk"; `SummaryCard.jsx` 0 diff.

**T-05 — Gate FASE 0** ⛔ · 10 mnt
- **DoD:** build exit 0 · T-01 4 hash · T-02/T-03/T-04 oracle PASS · `git diff --stat`
  hanya 3 file util baru + 3 skrip uji.
- **STOP-1:** bila hash baseline gagal dibuat → STOP, jangan lanjut (tanpa baseline, R-2 tak terukur).

### FASE 1 — Form Mamin 6 seksi (sidebar)

**T-06 — Komponen 6 seksi (shell + seksi 1–3)** · 90 mnt
- `MaminForm6Seksi.jsx` (shell, 6 kartu berlabel seksi) + `MaminSeksi1Dasar.jsx` +
  `MaminSeksi2DaftarHadir.jsx` + `MaminSeksi3Undangan.jsx`.
- Seksi 1: Tanggal (otomatis, **read-only**), No. Surat (input + tombol Generate), Waktu, Tempat
  (default "Ruang Rapat <nama sekolah>"), Nama Kegiatan (textarea auto-grow → wrap).
- Seksi 2: tombol "Pilih Peserta" (Data Guru/Tendik) + tabel NO/NAMA/**NIP**/JABATAN/(kolom opsional);
  **tanpa input TTD**; NIP terisi otomatis dari peserta terpilih, bisa dikoreksi.
- Seksi 3: hanya **Tanggal Surat** + **Nomor + Generate**.
- **DoD:** build exit 0 · 4 file ≤200 baris · oracle render 6 seksi: label seksi 1–6 tampil ·
  **0 field** dari §3.2 muncul sebagai input · **0** `localStorage.` langsung.

**T-07 — Komponen seksi 4–6** · 75 mnt
- `MaminSeksi4Pesanan.jsx` (Tanggal Surat, Nomor+Generate, Hari/Tanggal, Jenis Pesanan, Jumlah,
  Kepada Yth, Alamat Toko, Rincian Pesanan 2 seksi + tombol "Isi menu baku" — **tanpa** Sifat,
  Perihal, Isi Surat Pesanan) · `MaminSeksi5BukuTamu.jsx` (No Urut, Tiba, Kembali, Identitas Tamu —
  **tanpa** Tanggal/Bertemu/Tujuan/Uraian/Diterima) · `MaminSeksi6Notulen.jsx` (tombol
  **"Generate AI Notulen"** → `generateRingkasanNotulen()` → `formData.resume`; menampilkan hasil).
- **DoD:** build exit 0 · 3 file ≤200 baris · oracle: field §3.2 (Sifat/Perihal/Isi Pesanan/
  Tujuan/Uraian/Bertemu/Diterima/Tanggal BT) **tidak ada** sebagai input · 0 key form dobel
  antar seksi (oracle memeriksa daftar key yang di-set).

**T-08 — Sambung ke `DokumenFormPreview` (AD-3)** · 45 mnt
- Tambah prop `varianForm`; cabang Mamin → `<MaminForm6Seksi/>` bila `varianForm==='sidebar6'`;
  sembunyikan input "Tanggal dana masuk" (2 titik) bila varian sidebar.
- **DoD:** build exit 0 · `git diff --stat -- .../DokumenFormPreview.jsx` → **+≤60 baris** ·
  **cabang lama tak berubah** (bukti: diff hanya menunjukkan 1 kondisi + 2 kondisi sembunyikan) ·
  hash baseline halaman LPJ **4/4 identik** (T-01) · 0 error render.

**T-09 — Merge otomatis + gate sidebar di `BKUSidebarLpj`** · 45 mnt
- Panggil `terapkanOtomatisMamin(formData, ctx)` **satu kali** saat state form dibuat
  (inisialisasi `useState`, bukan `useEffect` → avoid kedipan, pola Sprint 017 DEV-2).
- Ganti `readinessCheck` → `readinessSidebar` **di file sidebar saja**.
- `prefillLpj`: `tanggalDanaMasuk` = tanggal BKU (nilai).
- **DoD:** build exit 0 · oracle: formData sidebar berisi 17 field otomatis · gate sidebar tidak
  memuat "Tanggal dana masuk" · **halaman LPJ 0 diff** (`git diff --stat` kosong untuk
  `DokumenSPJPage.jsx`) · hash 4/4 identik.

**T-10 — Kolom NIP di Daftar Hadir (AD-8)** · 30 mnt
- `templateConfig.daftar_hadir`: + kolom NIP (lebar disetel ulang); `aturanMamin.templateDaftarHadir`
  mengisi `nip`; `MaminPreview` ringkasan layar ikut kolom NIP.
- **DoD:** build exit 0 · `git diff --stat -- .../templateConfig.js` → **hanya blok `daftar_hadir`** ·
  oracle: rows bawa `nip` dari fixture GTK (1 peserta tanpa NIP → kolom kosong) · kolom
  "TANDA TANGAN" **tetap ada** di config.

**T-11 — Gate FASE 1** ⛔ · 15 mnt
- **DoD:** build exit 0 · oracle T-06/T-07/T-09/T-10 PASS · hash halaman LPJ 4/4 identik ·
  `SummaryCard.jsx` & `bkuParser.js` 0 diff.
- **STOP-2:** bila hash LPJ berubah → STOP, perbaiki AD-3 (jangan lanjut).

### FASE 2 — Dropdown kandidat & Dokumen PBJ

**T-12 — `utils/pbjBkuStore.js`** · 30 mnt
- **DoD oracle `test-pbj-bku-store.mjs`:** round-trip simpan→baca · 2 NoBukti tidak saling
  timpa · `noBukti` kosong → `{ok:false}` & storage tidak bertambah · data rusak (`'{{'`) →
  `bacaEntri` = `null` · `hapusEntri` hanya menghapus satu entri · `spj_pbj_form` **tidak**
  berubah (dicek via panjang objek global).

**T-13 — `DropdownNoBuktiMirip.jsx` + integrasi** · 60 mnt
- Dropdown (kustom, tanpa library) menampilkan kandidat `kandidatMirip(allTransactions, transaction)`
  + jumlah kandidat + pesan jujur bila 0.
- Dialog "simpan dulu?" bila form dirty: tombol **Simpan & pindah** / **Batal** (A-3).
- Integrasi `BKUSidebarLpj` ← props `allTransactions` & `onNavigate` (dari `BKUSidebar`).
- **DoD:** build exit 0 · oracle render: 0 kandidat → pesan jujur; ≥1 kandidat → `<option>`/item
  memuat bulan+NoBukti+uraian+nominal · dialog muncul saat dirty · `onNavigate` dipanggil dengan
  kandidat saat dipilih (oracle pakai stub) · file ≤180 baris.

**T-14 — Blok PBJ di sidebar** · 90 mnt
- `SidebarPbj.jsx` (shell: judul "Dokumen PBJ untuk NoBukti <x>", 6 tab, tombol Simpan, toast) +
  `SidebarPbjForm.jsx` (6 tab field config — **salin pola** `PBJ_TABS` dari
  `DokumenKelengkapanPage.jsx:288-343`, **jangan** impor dari sana agar tidak ada coupling ke halaman).
- Prefill otomatis BKU (§3.4) saat baris dibuka; entri tersimpan menang.
- Slot `blokTambahan` di `DetailDokumenLpjBody` → PBJ **di bawah form LPJ, di atas preview**.
- **DoD:** build exit 0 · 2 file ≤200 baris · oracle: prefill 10 field BKU benar · entri
  tersimpan menang atas prefill · `DokumenKelengkapanPage.jsx` **0 diff** · halaman LPJ 0 diff ·
  slot PBJ **tidak** muncul di layout `side`.

**T-15 — Preview satu daftar (AD-7)** · 45 mnt
- `buildPreviewDocs({ varianSidebar, docsPbj })`: docs LPJ dulu → docs PBJ (`pbjDocs()` +
  sufiks label " PBJ") menyusul; nama unik (LPJ menang bila bentrok).
- **DoD:** build exit 0 · oracle: urutan docs = LPJ (≥1) lalu PBJ (≥1) · **0 nama dobel** ·
  `previewDocs.js` diff hanya pada `buildPreviewDocs`/`maminDocs` (KE-2) · halaman LPJ 0 diff.

**T-16 — Gate FASE 2** ⛔ · 15 mnt
- **DoD:** build exit 0 · oracle T-12/T-13/T-14/T-15 PASS · hash LPJ 4/4 identik ·
  `SummaryCard.jsx`, `bkuParser.js`, `DokumenSPJPage.jsx`, `DokumenKelengkapanPage.jsx` 0 diff.

### FASE 3 — Verifikasi browser & dokumentasi

**T-17 — Uji browser alur lengkap** · 60 mnt
- Dev server `:5173` → Data BKU → klik baris Mamin → dropdown kandidat → pilih → panel berpindah ·
  isi 6 seksi → tombol Cek → blok PBJ terisi otomatis → Simpan LPJ → Simpan PBJ → reload → utuh ·
  cetak (preview = cetakan).
- **DoD:** 4/4 bagian benar · 0 console error · screenshot AF-01…AF-06.

**T-18 — Uji 4 kategori + non-LPJ** · 30 mnt
- 4 kategori berform: dropdown & 6 seksi (Mamin) & tanpa input tanggal dana masuk (semua).
- 9 tipe non-LPJ: sidebar tetap ≤576px, tab Detail, **tanpa** dropdown/PBJ.
- **DoD:** 4/4 + 9/9 benar, 0 console error.

**T-19 — Regresi halaman Dokumen LPJ** · 30 mnt
- **DoD:** hash T-01 **4/4 identik** · tombol **Cek** halaman LPJ masih menagih "Tanggal dana
  masuk" (perilaku lama) · input tanggal dana masuk **masih ada** di halaman LPJ · `MenuGuide`
  4 menu tetap · build exit 0.

**T-20 — Gate akhir + dokumentasi** · 40 mnt
- `npm run build` exit 0 · semua oracle PASS · `git diff --stat` (bkuParser/SummaryCard/
  DokumenSPJPage/DokumenKelengkapanPage = kosong) · blue-only 0 · `wc -l` semua file baru ≤ batas ·
  `rg "localStorage\."` file baru = 0.
- Dokumentasi: `STATE.MD` entri sprint 018 + `DECISIONS.MD` ADR baru (A-1…A-9 yang disetujui) +
  `RISKS.MD` + `QUESTIONS.MD` (D-1/D-2) + checklist ACCEPTANCE + BUILD-REPORT.
- **DoD:** 5 file diperbarui, angka di dokumen = angka hasil uji (bukan klaim).

Σ estimasi: **±10 jam** (T-01…T-20).

---

## 5. Urutan Eksekusi & Titik Berhenti

```
T-01 → T-02 → T-03 → T-04 → T-05 ⛔STOP-1
                            ↓ (baseline + oracle hijau)
T-06 → T-07 → T-08 → T-09 → T-10 → T-11 ⛔STOP-2
                                                      ↓ (hash LPJ identik)
T-12 → T-13 → T-14 → T-15 → T-16 ⛔STOP-3
                                            ↓
T-17 → T-18 → T-19 → T-20
```

- **STOP-1** (setelah T-05): baseline/oracle gagal → STOP, jangan lanjut.
- **STOP-2** (setelah T-11): hash halaman LPJ berubah → perbaiki AD-3, jangan lanjut FASE 2.
- **STOP-3** (kapan pun): muncul kebutuhan mengubah `bkuParser.js`, `SummaryCard.jsx`,
  `DokumenSPJPage.jsx`, `DokumenKelengkapanPage.jsx`, `package.json`, atau `templateConfig.js`
  **di luar blok `daftar_hadir`** → **berhenti dan lapor**.
- **STOP-4** (kapan pun): user menolak A-1…A-9 atau menjawab D-1/D-2 berbeda → revisi pack dulu.

## 6. Perintah Gate (Windows PowerShell 5.1)

```powershell
cd D:\project\spj-app\spj-frontend
npm run build                                    # exit 0 wajib
node test-bku-mirip.mjs                          # PASS
node test-mamin-otomatis.mjs                     # PASS
node test-pbj-bku-store.mjs                      # PASS
node test-mamin-seksi.mjs                        # PASS
rg -n "localStorage\." src/utils/bkuMirip.js src/utils/maminOtomatis.js src/utils/readinessSidebar.js src/utils/pbjBkuStore.js src/components/bku/DropdownNoBuktiMirip.jsx src/components/bku/SidebarPbj.jsx src/components/bku/SidebarPbjForm.jsx src/components/dokumen/mamin   # 0 hit
rg -n "\b(bg|text|border|ring)-(emerald|amber|rose|violet|cyan)" src/components/dokumen/mamin src/components/bku/DropdownNoBuktiMirip.jsx src/components/bku/SidebarPbj.jsx src/components/bku/SidebarPbjForm.jsx src/utils/maminOtomatis.js src/utils/bkuMirip.js src/utils/pbjBkuStore.js   # 0 hit
git -C D:\project\spj-app diff --stat -- spj-frontend/src/utils/bkuParser.js spj-frontend/src/components/templates/SummaryCard.jsx spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx   # kosong
git -C D:\project\spj-app diff --stat -- spj-frontend/src/data/templateConfig.js   # hanya blok daftar_hadir
```

> ⚠️ Pola grep bisa berbohong: setiap hit **wajib dibuka isinya** (RISKS.MD).
> Bundel skrip uji JSX: `npx esbuild <file> --bundle --platform=node --format=cjs --jsx=automatic --define:import.meta.env='{}'`
> (ESM gagal "Dynamic require of stream"; tanpa `--jsx=automatic` gagal "React is not defined").
> Skrip uji **dihapus** setelah sprint ditutup; hasilnya dikutip di BUILD-REPORT.

## 7. Rollback

Tidak ada migrasi data. Rollback = `git checkout -- <file>` per file (BUKAN `git reset --hard`,
BUKAN `git stash` — RISKS.MD). Kunci `spj_pbj_bku` boleh dibiarkan (tidak dibaca kode lama).

## 8. Catatan Eksekusi (diperbarui saat jalan)

| # | Catatan | Bukti |
|---|---|---|
| — | (kosong — diisi saat eksekusi) | — |
