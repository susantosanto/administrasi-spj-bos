# PRD — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG dimulai sebelum pack
> (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT) disusun & disetujui (AGENTS.MD).
> Input: **Idea Brief `/idea-clarifier` 2026-10-21** (12 keputusan user — §1) + 3 putaran
> pertanyaan klarifikasi (9 + 8 + 3 pertanyaan).
> Runtime: React 18 + Vite + Tailwind, **tanpa backend**, data ke localStorage (prefix `spj_`).
> ⚠️ **4 temuan kode** (§2.1–2.4) mengubah sebagian asumsi brief. Baca §2 & §10 sebelum menyetujui.

---

## 1. Keputusan User yang Sudah Dikunci (JANGAN dippedusulkan)

| # | Keputusan | Konsekuensi rancangan |
|---|---|---|
| K-1 | Dropdown "NoBukti mirip" = **baris BKU lain dengan kode rekening + kode kegiatan sama** | Kandidat = `kodeRekening` identik & `kodeKegiatan` identik |
| K-2 | Cakupan dropdown = **semua kategori** (bukan hanya Mamin) | Kandidat tidak dibatasi kategori LPJ |
| K-3 | Memilih kandidat = **berpindah konteks detail transaksi** ke baris itu | Pakai mekanisme navigasi baris yang sudah ada (`onNavigate`) |
| K-4 | Isian **belum disimpan** → **peringatan "simpan dulu"** sebelum berpindah | Dialog konfirmasi wajib, bukan diam-diam pindah |
| K-5 | Form Mamin jadi **6 seksi**, berlaku **di sidebar BKU saja** | Halaman Dokumen LPJ (menu kiri) **tidak berubah** |
| K-6 | Prinsip: **satu data = satu sumber** — field yang bisa diambil dari seksi sebelumnya / Data Sekolah / BKU **dibuang dari form** | Form Mamin sidebar jauh lebih ringkas |
| K-7 | Teks bawaan (Isi Undangan, Isi Pesanan, Perihal, Sifat, Lampiran, dst.) **dipindah ke preview**, tidak diedit di form | Hardcode/otomatis di lapisan preview |
| K-8 | **Nomor surat tetap 3** (Utama / Undangan / Pesanan) — masing-masing mengacu pada bukti suratnya | Tidak ada penggabungan nomor |
| K-9 | Daftar Hadir: input **TTD dihapus**, kolom **NIP ditambahkan**; kolom TANDA TANGAN **tetap tercetak** (kosong) | `templateConfig.daftar_hadir` berubah (kolom NIP) |
| K-10 | Input **"Tanggal dana masuk" dihapus** dari semua dokumen LPJ **di sidebar** | Gate sidebar tak boleh menagih field yang tak bisa diisi |
| K-11 | Dokumen **PBJ** masuk sidebar, **semua kategori**, **tersimpan per NoBukti** | Kunci storage baru, terpisah dari PBJ global |
| K-12 | Panel preview **satu daftar**: LPJ dulu → PBJ menyusul; **nama surat tidak boleh dobel** (bila sama → LPJ menang) | Label PBJ diberi sufiks agar tidak bentrok |

Tambahan dari user (2026-10-21): **input "Generate AI" untuk hasil notulen rapat/kegiatan** — data
notulen diambil dari input form di atasnya; yang ditampilkan hanya tombol generate (pola sekarang).

---

## 2. Kondisi Kode Hari Ini (bukti per baris)

| Fakta | Lokasi | Akibat |
|---|---|---|
| Sidebar BKU sudah menerima **`allTransactions`** + **`onNavigate`** | `BKUSidebar.jsx:60` | perpindahan baris **sudah ada** (tombol ‹ › `:260-263`) → K-3 murah |
| `onNavigate` = `setSidebarTransaction(tx)` | `BKUPage.jsx:841` | sidebar **tidak** dikontrol penuh; pindah = ganti state transaksi |
| Panel LPJ di sidebar = komponen terpisah | `BKUSidebarLpj.jsx` (196 baris) | tempat dropdown + blok PBJ |
| Layout `stack` (sidebar) = 1 kolom: form → preview | `DetailDokumenLpjBody.jsx:43-50` | blok PBJ masuk **antara** form & preview (§4 US-05) |
| Form Mamin = cabang besar di dalam `DokumenFormPreview.jsx` | `:1023-1637` (file 2069 baris) | 6 seksi = **komponen baru**, cabang lama utuh untuk halaman LPJ |
| "Tanggal dana masuk" ada **2×** di form | `:541` (recipient) & `:1081` (mamin/upah) | K-10 → sembunyikan di varian sidebar |
| `readinessCheck` menagih `nomor` + `tanggalDanaMasuk` + `rows` | `SummaryCard.jsx:20-26` | K-10 → butuh gate **sidebar terpisah** (fungsi `readinessCheck` sendiri **tidak boleh** berubah; dipakai halaman LPJ) |
| Area cetak Mamin = `MaminPreview` (5 dokumen) | `MaminPreview.jsx:198-253` | nilai otomatis harus masuk ke **satu** data agar form & cetak sinkron |
| Preview Mamin built di `maminDocs()` | `previewDocs.js:90-138` | tempat menerapkan nilai otomatis + menggabung PBJ |
| Template Undangan Mamin memuat `hari/tanggal/tempat/waktu` + `sifat/lampiran/perihal/kepada/isi` | `templateConfig.js:56-113` | K-7 → 9 field ini tak perlu input di sidebar |
| Template Pesanan Mamin memuat `sifat/lampiran/perihal/kepada/alamat/isi` + `hariPesanan/jenisPesanan/jumlahPesanan` | `templateConfig.js:114-176` | K-7 → `sifat` & `perihal` & `isi` dibuang dari form |
| Template Buku Tamu memuat `diterima/tiba/kembali/tujuan/uraian` | `templateConfig.js:219-235` | K-6 → 5 field itu dibuang dari form |
| Daftar Hadir cetak kolom NO/NAMA/JABATAN/TTD/TTD2 | `templateConfig.js:265-271` | K-9 → **tambah kolom NIP** (perubahan template) |
| Rows Daftar Hadir **belum** membawa NIP | `aturanMamin.js:116-134` | K-9 → `templateDaftarHadir` harus isi `nip` |
| Data Guru/Tendik **memiliki** NIP | `aturanPesanan.js:76-90` (`bacaGTKUntukHadir` → `spj_data_guru` + `spj_data_tendik`) | NIP bisa auto-isi saat peserta dipilih |
| PBJ global: 6 tab + `pbjFormKosong()` + `pbjDocs()` | `DokumenKelengkapanPage.jsx:288-343`, `previewDocs.js:184+` | K-11 → **salin pola**, jangan tulis ulang |
| Mapping BKU → baris paket PBJ sudah ada | `paketPbj.js:55-76` (`bkuKePaketRow`) | prefill PBJ sidebar pakai pola ini |
| Generator nomor surat = komponen mandiri | `blocks/NomorSuratPopup.jsx` | seksi baru cukup memakainya (tanpa AI/API) |

### 2.1 ⚠️ "Tanggal dana masuk" **tidak tercetak** di template mana pun
`grep` seluruh `src/` → **9 hit**: 8 di `DokumenFormPreview.jsx` (2 blok input: 4 baris masing-masing) + 1 di `SummaryCard.jsx:23` (gate). **0 hit** di `templateConfig.js` & `blocks/`.
`templateConfig.js` & `blocks/` **tidak** memuat `tanggalDanaMasuk`. Artinya field ini
hanya **menagih** (gate), tidak pernah tampil di surat. Konsekuensi K-10:
- Input dihapus → gate sidebar **wajib** berhenti menagihnya (fungsi baru, bukan ubah `readinessCheck`).
- Surat tetap menampilkan tanggal acara/tanggal surat (dari Seksi 1 & Tanggal Surat), jadi
  пользователь tidak kehilangan tanggal di dokumen.

### 2.2 ⚠️ Ada **2 pintu data** Mamin (sidebar vs halaman LPJ) — konsekuensi K-5
`DokumenFormPreview` dipakai dua tempat. Kalau 6 seksi dipasang di dalam komponen itu tanpa
pembatas, **halaman LPJ ikut berubah** (melanggar K-5). Solusi: parameter
`varianForm='sidebar6'` → cabang 6 seksi hanya untuk `layout='stack'`; **cabang lama tidak
disentuh** (bukti: hash render halaman LPJ identik — T-01/T-14).

### 2.3 ⚠️ Panel preview Mamin & area cetak Mamin **bukan objek yang sama**
Preview panel dibangun `maminDocs()` (`previewDocs.js`), sedangkan area cetak dibangun
`MaminPreview.jsx` (`:198-253`) — dua builder terpisah yang kebetulan memakai `formData` sama.
Artinya **nilai otomatis harus diterapkan di lapisan formData**, bukan hanya di preview;
kalau tidak, yang tampil di layar ≠ yang tercetak. → Keputusan rancangan: **satu fungsi
merge** (`maminOtomatis.js`) yang hasilnya dipakai form, preview, dan cetak.

### 2.4 ⚠️ Nomor surat: 3 jenis, popup-nya di dalam `DokumenFormPreview`
`showNomorPopup` / `showUndanganNomorPopup` / `showPesananNomorPopup` adalah state internal
komponen itu. Komponen 6 seksi baru butuh popup sendiri → `NomorSuratPopup` dipakai ulang
(komponen mandiri, tanpa logika AI/API) — **tanpa** menduplikasi logika generator.

---

## 3. User Stories

### US-01 — Melompat ke baris serupa (dropdown NoBukti mirip)
**As** bendahara sekolah, **I want** melihat baris belanja lain yang kode rekening & kegiatan-nya sama, **so that** saya bisa mencetak kegiatan rutin tiap bulan tanpa mengetik ulang dari nol.

Acceptance Criteria:
- [ ] Dropdown menampilkan hanya baris dengan `kodeRekening` **dan** `kodeKegiatan` identik dengan baris aktif, **bulan berbeda**, dan bukan baris aktif.
- [ ] Label kandidat memuat bulan + NoBukti + uraian + nominal (jujur: bagian kosong ditampilkan kosong).
- [ ] Baris yang **tidak punya** `kodeRekening`/`kodeKegiatan` → dropdown menampilkan pesan jujur ("tidak ada baris lain yang bisa dicocokkan"), bukan daftar asal.
- [ ] Memilih kandidat → **panel detail berpindah** ke baris itu: header rekap, form, preview, dan target penyimpanan ikut baris baru.
- [ ] Bila isian belum disimpan → muncul **peringatan "simpan dulu?"**; user bisa Simpan dulu / Batal, tanpa kehilangan data.

### US-02 — Form Mamin ringkas 6 seksi (sidebar)
**As** bendahara sekolah, **I want** form Mamin di sidebar tidak lagi meminta data yang sama di dua tempat, **so that** saya cukup mengisi data yang benar-benar belum ada.

Acceptance Criteria:
- [ ] Sidebar Mamin menampilkan 6 seksi berlabel: **1 Data Dasar · 2 Daftar Hadir · 3 Surat Undangan · 4 Surat Pesanan · 5 Buku Tamu · 6 Notulen (AI)**.
- [ ] **Seksi 1**: Tanggal (otomatis dari BKU) · No. Surat (generate) · Waktu · Tempat (default "Ruang Rapat <nama sekolah>", bisa diubah) · Nama Kegiatan (satu field, teks panjang wrap).
- [ ] **Seksi 2**: tabel NO · NAMA · **NIP** · JABATAN (+ kolom opsional); **input TTD tidak ada**.
- [ ] **Seksi 3**: form hanya **Tanggal Surat** + **Nomor (generate)**; 9 field lain (hari/tanggal/tempat/waktu/perihal/alamat/sifat/lampiran/kepada) **tanpa input**, nilainya tampil di preview.
- [ ] **Seksi 4**: form = Tanggal Surat, Nomor (generate), Hari/Tanggal, Jenis Pesanan, Jumlah, Kepada Yth (toko), Alamat Toko, Rincian Pesanan; **Sifat, Perihal, Isi Surat Pesanan tanpa input**.
- [ ] **Seksi 5**: form = No. Urut, Tiba Pukul, Kembali Pukul, Identitas Tamu; **Tanggal, Ingin Bertemu, Tujuan, Uraian, Diterima Oleh tanpa input**.
- [ ] **Seksi 6**: satu tombol **"Generate AI Notulen"**; hasil AI masuk ke Poin Pembahasan; tidak ada input manual data notulen.
- [ ] **Nilai otomatis tampil di preview** dan **sama persis dengan yang tercetak** (satu sumber data).

### US-03 — Daftar Hadir pakai NIP
**As** bendahara sekolah, **I want** NIP peserta tampil di Daftar Hadir, **so that** absensi bisa dicek cepat.

Acceptance Criteria:
- [ ] NIP terisi otomatis dari Data Guru/Tendik saat peserta dipilih; bisa dikoreksi manual.
- [ ] Kolom **NIP tercetak** di Daftar Hadir; kolom **TANDA TANGAN tetap tercetak** (kosong, ditandatangani tangan).
- [ ] Baris peserta tanpa NIP (honorer) → kolom NIP kosong (tidak dikarang).

### US-04 — Tanggal dana masuk tidak lagi diinput
**As** bendahara sekolah, **I want** tidak ada lagi input "Tanggal dana masuk", **so that** form tidak menagih data yang tak terpakai.

Acceptance Criteria:
- [ ] Input "Tanggal dana masuk" **tidak ada** di sidebar untuk 4 kategori LPJ (Makan & Minum, Honorarium, Perjalanan Dinas, Pemeliharaan).
- [ ] Tombol **Cek** di sidebar **tidak** lagi menagih "Tanggal dana masuk" (tidak ada pelanggaran mustahil).
- [ ] Halaman Dokumen LPJ (menu kiri) **tetap** punya input tersebut (K-5).

### US-05 — Dokumen PBJ di sidebar
**As** bendahara sekolah, **I want** dokumen PBJ untuk baris belanja yang sedang saya kerjakan, **so that** saya tidak perlu pindah halaman.

Acceptance Criteria:
- [ ] Blok **Dokumen PBJ** tampil **di bawah form LPJ dan di atas Panel Preview Document** pada layout sidebar.
- [ ] Form PBJ punya 6 tab (Perencanaan · Pesanan · BAHP · BAST · Negosiasi · Data) — sama seperti di Dokumen Kelengkapan.
- [ ] Isian otomatis dari baris BKU: **Tanggal** · **Kegiatan/Pekerjaan** · **Alokasi Anggaran (nominal)** · **No. Bukti**.
- [ ] Tombol **Simpan** menyimpan PBJ **per NoBukti**; NoBukti lain tidak tertimpa; form PBJ global di Dokumen Kelengkapan tidak tersentuh.
- [ ] Panel preview menampilkan **satu daftar**: dokumen LPJ dulu, dokumen PBJ menyusul; **tidak ada nama dokumen dobel** (bila nama sama → LPJ menang).

### US-06 — Halaman Dokumen LPJ tidak berubah
**As** pengelola produk, **I want** halaman Dokumen LPJ tetap seperti semula, **so that** perbaikan sidebar tidak merusak pintu masuk lain.

Acceptance Criteria:
- [ ] Render halaman LPJ (form + docs) **hash identik** sebelum/sesudah (oracle baseline T-01 → T-14).
- [ ] Halaman LPJ tetap memakai `layout='side'` → **tanpa** blok PBJ, **tanpa** dropdown, **tanpa** 6 seksi.
- [ ] `readinessCheck` (dipakai halaman LPJ) **tidak berubah**.

---

## 4. Data Access Surface

Aplikasi **tanpa backend** — tidak ada endpoint HTTP. "API" = kontrak akses storage.

| Operasi | Kunci storage | Fungsi | Deskripsi |
|---|---|---|---|
| Baca isian LPJ | `spj_lpj_bku` | `bacaEntri(kategori, noBukti)` | **dipakai** (Sprint 017) — tidak berubah |
| Tulis isian LPJ | `spj_lpj_bku` | `simpanEntri(kategori, noBukti, payload)` | **dipakai** — tidak berubah |
| Baca PBJ per baris | `spj_pbj_bku` *(baru)* | `bacaEntriPbj(kategori, noBukti)` | entri PBJ milik baris itu |
| Tulis PBJ per baris | `spj_pbj_bku` | `simpanEntriPbj(kategori, noBukti, payload)` | tidak menyentuh entri lain / PBJ global |
| Hapus PBJ per baris | `spj_pbj_bku` | `hapusEntriPbj(kategori, noBukti)` | opsional (belum diminta) |
| Baca PBJ global | `spj_pbj_form` | `storageHelper.get('pbj_form', {})` | **read-only** di sprint ini (halaman Kelengkapan pemilik) |
| Baca BKU | `spj_bku_data` | `storageHelper.get('bku_data')` | sumber baris & kandidat |

Bentuk payload PBJ (kunci `<kategori>|<noBukti>`,mirip `spj_lpj_bku`):

```json
{
  "mamin|BNU-07": {
    "kategori": "mamin",
    "noBukti": "BNU-07",
    "form": {
      "perencanaan": { "nomorSurat": "", "tanggalSurat": "2026-02-14", "kegiatan": "Rapat Guru", "alokasi": "1500000" },
      "pesanan": {}, "bahp": {}, "bast": {}, "nego": {},
      "data": { "bulan": "Februari", "noBukti": "BNU-07", "tanggalPesanan": "2026-02-14", "alokasi": "1500000" }
    },
    "savedAt": "2026-10-21T20:00:00.000Z"
  }
}
```

Aturan:
- Prefix `spj_` **wajib** lewat `storageHelper` — tidak boleh `localStorage` langsung.
- NoBukti kosong/`'-'` → **tidak menyimpan** (pola `noBuktiSah`).
- Data rusak → `null`, tidak melempar.
- PBJ per baris **tidak** bercampur dengan `spj_pbj_form` (D-3 di `QUESTIONS.MD`).

---

## 5. Data Requirements

| Entity | Key Fields | Hubungan |
|---|---|---|
| `BkuTransaction` (ada) | `row`, `tanggal`, `tanggalStr`, `bulan`, `noBukti`, `uraian`, `kodeRekening`, `kodeKegiatan`, `pengeluaran`, `kategori` | sumber baris + kandidat dropdown |
| `KandidatMirip` (baru, turunan) | `row`, `noBukti`, `bulan`, `tanggalStr`, `uraian`, `pengeluaran` | hasil filter `bkuMirip.kandidatMirip()` |
| `LpjBkuEntry` (ada) | `kategori`, `noBukti`, `subId`, `templateId`, `formData`, `sppdData`, `savedAt` | Sprint 017 — dipakai ulang |
| `PbjBkuEntry` (baru) | `kategori`, `noBukti`, `form` (6 tab), `savedAt` | milik satu baris BKU |
| `MaminOtomatis` (baru, nilai turunan) | `sifatUndangan`, `lampiranUndangan`, `perihalUndangan`, `kepadaUndangan`, `isiUndangan`, `sifatPesanan`, `perihalPesanan`, `isiPesanan`, `hariPesanan`, `bukuTamu.{tanggal,bertemu,tujuan,uraian,diterima}`, `tanggalDanaMasuk` | hasil merge, **ikut tersimpan** (A-4) |

Tidak ada migrasi data lama: `spj_pbj_bku` mulai kosong; entri `spj_lpj_bku` lama tetap terbaca
(field yang tak lagi punya input menjadi field tak terpakai — bukan error).

---

## 6. Non-Functional Requirements

**Performance**
- Dropdown kandidat: filter 421 transaksi < **50 ms**; render daftar < 200 ms.
- Merge nilai otomatis: < 5 ms per render form (fungsi murni tanpa I/O).

**Security / privasi**
- 0 request jaringan baru (tab Network kosong saat memakai dropdown/6 seksi/PBJ).
- Semua akses storage lewat `storageHelper` (prefix `spj_`); 0 `localStorage.` langsung di file baru.
- Tidak ada data yang dikirim ke AI kecuali kolom "Nama Kegiatan"/ringkasan yang memang sudah
  dikirim hari ini (tombol Generate AI Notulen) — **tidak ada** data baru yang dikirim.

**Konsistensi visual**
- Blue-only `#004ac6` + slate. 0 hit `emerald|amber|rose|violet|cyan` di file baru/diubah.
- Kertas cetak tetap A4, satuan `mm`, orientasi dari `templateConfig` (tidak berubah).
- Nama kegiatan panjang **wrap** (tidak terpotong) — sesuai permintaan user.

**Maintainability**
- Enam seksi = **enam komponen** (1 file per seksi), tidak menumpuk di `DokumenFormPreview.jsx`.
- Modul baru ≤ 200 baris (konvensi repo); file > 200 wajib dipecah.
- `bkuParser.js` **0 diff** (TABU). `SummaryCard.jsx` **0 diff** (dipakai halaman LPJ).
- `bakuParser`/OCR/PDF jalur impor tidak tersentuh.

**Kompatibilitas**
- Data lama tanpa `spj_pbj_bku` → blok PBJ tampil kosong (form default), 0 crash.
- Browser target: Chromium (Edge) — perilaku cetak tidak berubah.

---

## 7. Success Metrics

| Kriteria brief | Metrik | Target |
|---|---|---|
| Dropdown kandidat benar | Oracle filter: fixture 6 baris (2 cocok, 2 kode berbeda, 1 bulan sama, 1 tanpa kode) | 1/1 benar, 3/3 non-kandidat tertolak |
| Panel berpindah konteks | Uji browser: pilih kandidat → header/form/preview/storage ikut baris baru | 4/4 bagian ikut |
| Peringatan simpan-dulu | Uji: isian dirty → pilih kandidat → dialog muncul; Batal → data utuh | 2/2 benar |
| Form Mamin ringkas | Oracle: jumlah field input per seksi + **0 duplikat** (tiap key form unique) | 6 seksi, 0 key dobel |
| Teks bawaan di preview | Oracle: 9 field Undangan + 3 field Pesanan + 5 field Buku Tamu terisi tanpa input | 17/17 terisi |
| NIP di Daftar Hadir | Oracle: rows bawa `nip`; config punya kolom NIP; TTD tetap ada | 3/3 benar |
| Tanggal dana masuk hilang | Grep 2 cabang form + gate sidebar | 0 input di sidebar, 0 pelanggaran gate |
| PBJ per NoBukti | Round-trip simpan→baca; 2 NoBukti tidak saling timpa; global tak tersentuh | 3/3 benar |
| Preview satu daftar | Urutan docs: LPJ (≥1) → PBJ (≥1); nama unik | 100% unik |
| Halaman LPJ aman | Hash render form+docs 4 kategori | 4/4 identik |
| Tidak merusak halaman lain | `npm run build` + oracle | exit 0, semua PASS |

---

## 8. Out of Scope

> Item berikut **dikecualikan eksplisit**. JANGAN diimplementasikan. Bila sebuah user story
> menyiratkan fitur di sini, story itu yang dikoreksi — bukan scope yang dilebarkan.

- **Halaman Dokumen LPJ (menu kiri)**: tidak memakai 6 seksi, tidak memakai dropdown, tidak memakai
  blok PBJ, tetap punya input "Tanggal dana masuk".
- **Halaman Dokumen Kelengkapan** & form PBJ global (`spj_pbj_form`): tidak diubah, tidak
  disinkronkan dua arah dengan PBJ per baris.
- Perubahan isi/nomor/urutan dokumen cetak selain **kolom NIP pada Daftar Hadir**.
- Penghapusan input "Tanggal dana masuk" di halaman Dokumen LPJ.
- Penghapusan kolom TANDA TANGAN di Daftar Hadir / Buku Tamu.
- OCR, impor PDF/Excel, `bkuParser.js`, jalur impor BKU.
- Migrasi data lama (entri `spj_lpj_bku` lama tetap dibaca apa adanya).
- Upload invoice SIPLah, arsip/keranjang PBJ, mode SIPLAH/NON-SIPLAH.
- Dependency baru; `package.json` & `package-lock.json` **0 diff**.
- Backend, akun, sinkronisasi antar perangkat.

---

## 9. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Nilai otomatis hanya masuk preview, tidak masuk cetak (2 builder terpisah) | Yang tampil ≠ yang tercetak | **Satu** fungsi merge di lapisan formData (AD-4) + oracle yang membandingkan preview vs area cetak |
| 6 seksi bocor ke halaman LPJ | Melanggar K-5 | Varian `sidebar6` + hash render halaman LPJ identik (T-01/T-14) |
| Gate sidebar menagih field yang tak ada inputnya | "Cek" selalu gagal | Gate sidebar = fungsi baru; `SummaryCard.readinessCheck` **0 diff** |
| Dropdown kosong (kode kegiatan kosong di BKU) | Fitur tak berguna | Pesan jujur + indicator jumlah kandidat;Matched rule didokumentasikan (A-1) |
| Kolom NIP membuat tabel exceed A4 | Cetak terpotong | Lebar kolom diturunkan; uji cetak A4 + kolom TTD tetap ada |
| PBJ per NoBukti ≠ PBJ global → data "hilang" | Bingung | Label jujur "Dokumen PBJ untuk NoBukti ini" + blok PBJ kosong tampil form default |
| Label PBJ bentrok dengan LPJ ("Surat Pesanan") | Dua surat dobel di daftar | Sufiks " PBJ" + aturan LPJ menang (K-12) |
| Merge otomatis menimpa isian user | Isian hilang | Merge hanya mengisi field **kosong** (formData-first) |
| `DokumenFormPreview.jsx` 2069 baris disentuh | Regresi lintas fitur | Diff **hanya** 1 cabang + 2 kondisi sembunyikan; hash halaman LPJ wajib identik |

---

## 10. Keputusan yang Masih Terbuka (A-1…A-9 = asumsi pack; D-1/D-2 = pertanyaan user)

Asumsi pack (dipakai agar pack bisa disusun; **wajib dikonfirmasi saat dry run** — lihat
REQUIREMENTS §5):

| # | Asumsi | Alasan | Bila ditolak |
|---|---|---|---|
| **A-1** | Kandidat = `kodeRekening` **dan** `kodeKegiatan` identik, **bulan berbeda**, bukan baris aktif; kode kosong → tidak jadi kandidat | menempel pada jawaban user "Kode rekening + kode kegiatan sama" | longgar/ketat lain → task T-02 berubah |
| **A-2** | "Berpindah" = memakai `onNavigate` yang sudah ada | sidebar sudah punya navigasi baris (tombol ‹ ›) | butuh callback baru → +1 task |
| **A-3** | Peringatan "simpan dulu" = **dialog konfirmasi di dalam sidebar** (bukan `window.confirm`) | konsisten dengan UI aplikasi | `window.confirm` → 1 baris |
| **A-4** | Nilai otomatis/hardcode diterapkan di **lapisan formData** (form + preview + cetak pakai satu sumber) & **ikut tersimpan** | 2 builder cetak/preview (F-3) | computed di render → harus ubah 2 builder |
| **A-5** | PBJ per baris memakai kunci baru **`spj_pbj_bku`**, entri `<kategori>\|<noBukti>` | terpisah dari `spj_pbj_form` | menumpang global → risiko data tertimpa |
| **A-6** | Semua perubahan form Mamin berlaku **hanya** `layout='stack'` (sidebar) | K-5 | seluruh kategori ikut berubah → +2 task |
| **A-7** | Kolom **NIP ikut tercetak** di Daftar Hadir | K-9 | NIP hanya di app → 1 task lebih kecil |
| **A-8** | "Hari/Tanggal" (Seksi 4) **tetap ada di form**, nilainya default = hari+tanggal dari **Tanggal Surat Pesanan**; setelah diketik, menjadi milik user | user: "hanya 3 yang dibuang" + "tgl dari tgl surat pesanan" | dibuang juga → checklist seksi 4 berubah |
| **A-9** | **Satu** field `tanggalSurat` dipakai Undangan **dan** Pesanan (label Seksi 4: "Tanggal Surat (sama dengan Surat Undangan)") | prinsip "satu data satu sumber" (K-6) | dua field terpisah → +1 field, 1 keputusan UI |

Pertanyaan yang **wajib** dijawab user sebelum eksekusi penuh:

**D-1 — Tanggal Surat Undangan vs Pesanan.** Apakah kedua surat memakai **tanggal yang sama**
(A-9) atau tanggal berbeda (dua field)? (pengaruh: 1 field vs 2 field + label)

**D-2 — Label dokumen PBJ di panel preview.** Suffix "PBJ" pada semua label PBJ
("Surat Pesanan PBJ", "Data Rekap PBJ", …) — setelah itu baru aturan "LPJ menang" jadi
tidak pernah dipakai. Atau label apa adanya + aturan LPJ menang (berarti sebagian dokumen
PBJ tidak terlihat).

---

## 11. Self-Review

- [x] Setiap user story punya acceptance criteria yang bisa diuji (6 story, 28 kriteria).
- [x] "API surface" diganti **Data Access Surface** — aplikasi tanpa backend; mengarang endpoint = palsu.
- [x] Data requirements mencakup semua entitas yang disebut story (`KandidatMirip`, `PbjBkuEntry`, `MaminOtomatis`).
- [x] NFR spesifik & terukur (50 ms, 200 ms, 0 request, ≤200 baris, blue-only, hash identik).
- [x] Out-of-scope eksplisit (11 butir) dan tidak dilanggar story mana pun.
- [x] Success metrics memetakan 7 kriteria brief.
- [x] 4 temuan kode didokumentasikan dengan lokasi baris (bukan asumsi).
- [ ] **D-1 & D-2 belum dijawab user** → PRD ini belum boleh masuk BLUEPRINT final; A-1…A-9 menunggu konfirmasi dry run.

---

**MULAI:** PRD ini disetujui + D-1/D-2 dijawab + A-1…A-9 dikonfirmasi saat dry run.
**SELESAI:** Architect pack Sprint 018 (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT)
ada di `planning/sprints/sprint-018/`, dry run disetujui, dan terbukti di browser:
dropdown kandidat → berpindah baris → form 6 seksi → isi → PBJ per NoBukti → preview satu daftar → cetak.
