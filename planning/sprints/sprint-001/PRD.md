# PRD — Sprint 001: Rework Modul Perjalanan Dinas

| Field | Isi |
|---|---|
| Sprint | **001 + 002** — PRD ini adalah **umbrella**; dipecah jadi 2 sprint pada 2026-09-14 (lihat ADR pemecahan sprint di `DECISIONS.MD`) |
| Status | **DRAFT — menunggu persetujuan user sebelum coding** (aturan AGENTS.MD: dry run → lapor → tunggu persetujuan) |
| Tanggal | 2026-09-14 |
| Sumber | Idea Brief final — hasil `/idea-clarifier`, dikonfirmasi user 2026-09-14 |
| Dokumen rujukan sumber | `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` |
| Rujukan aturan | `AGENTS.MD`, `CONSTITUTION.md`, `docs/ARCHITECTURE.MD`, `docs/VALIDATION.MD` |
| Rujukan risiko/keamanan | `RISKS.MD` F8, `docs/SECURITY-AUDIT-001.md` §5 |
| Pack teknis | `planning/sprints/sprint-001/` (fondasi — US-13…US-18) · `planning/sprints/sprint-002/` (rework dokumen — US-01…US-12) — masing-masing **4 dokumen Bab 8.4** |
| Salinan audit (Bab 8.5) | `architect-packs/architect-pack-001-fondasi-data-sekolah-pejabat.md` · `architect-packs/architect-pack-002-perjalanan-dinas.md` |
| User story | **18** (US-01 … US-18) |

> **Catatan pemecahan sprint (2026-09-14).** Semula seluruh 18 user story berada dalam satu
> Sprint 001. Pemeriksaan cross-artifact #5 ("satu sprint satu tujuan") menemukan **dua
> kandidat tujuan** dan user memilih **memisahkannya**:
> **Sprint 001 = fondasi** (data pejabat, halaman Data Sekolah, kop + logo, peringatan) ·
> **Sprint 002 = rework dokumen Perjalanan Dinas** (tab, form, print-area, reset).
> Sprint 002 **wajib menunggu** Sprint 001 selesai — kontrak fungsinya belum ada sebelum itu.
> PRD ini **tidak dipecah** dan tetap tinggal di folder ini sebagai sumber requirement
> tunggal (menghindari duplikasi) — lihat ADR.

> **Catatan nomor revisi:** PRD ini menggantikan draf 12 user story sebelumnya
> (dibuat 2026-09-14 13:05, tidak pernah ditulis ke disk). Draf lama kurang 3
> user story dari klarifikasi lanjutan (pejabat dari Data Sekolah) — ditambahkan
> sebagai **US-13 / US-14 / US-15**, plus **US-16** (guard regresi) karena
> keputusan cakupan notifikasi diperluas ke **semua dokumen**.
> Revisi berikutnya (2026-09-14, sore) menambahkan **US-17** (kop sekolah dari
> Data Sekolah + logo) dan **US-18** (data gugus baru + kop gugus data-driven),
> serta memperluas **US-14** menjadi 2 role baru dan **US-15** menjadi 2 varian pesan.

---

## 1. Latar Belakang & Masalah

### 1.1 Bukti masalah (dari kode nyata, bukan asumsi)

| # | Gejala yang dilaporkan user | Bukti di kode |
|---|---|---|
| G1 | Tab **"Surat Perintah Tugas"** dan **"Surat Tugas"** tampil identik | `components/templates/DokumenFormPreview.jsx:1786-1791` — kedua tab preview memakai **data builder yang sama**: `renderPerRecipient(TEMPLATE_CONFIGS.spt, buildSptData, …)` dan `renderPerRecipient(TEMPLATE_CONFIGS.surat_tugas, buildSptData, …)` |
| G2 | Tidak ada bedanya secara konten | `data/templateConfig.js:306-358` — blok config `spt` dan `surat_tugas` identik; beda **hanya** field `judul` (`'SURAT PERINTAH TUGAS'` vs `'SURAT TUGAS'`). Komentar di kode mengakui: *"Sama dengan SPT, judul 'SURAT TUGAS'"* |
| G3 | Rujukan format tidak ada untuk tab Surat Tugas | Dokumen referensi **tidak punya** bagian "SURAT TUGAS" — hanya 3 dokumen: Undangan, SPT, SPD |
| G4 | Data yang di-CRUD tidak mencerminkan dokumen asli | `blocks/SPDForm.jsx` kehilangan **3 elemen** dokumen sumber (lihat §5.2) |
| G5 | Nama pejabat bisa tidak sinkron dengan Data Sekolah | `templateConfig.js` masih hardcode `namaPenandatangan: 'BADRUDDIN, S.Ag.'`, `namaMengetahui: 'WAHYUDIN, S.Pd.SD.'`; `blocks/SuratTugas.jsx`, `blocks/SPDForm.jsx`, `blocks/SuratUndangan.jsx` belum membaca `utils/sekolahData.js` |
| G6 | Nilai pejabat bisa **basi** setelah user mengubah Data Sekolah | `utils/sekolahData.js` + `utils/signatureRoles.js` menghitung konstanta **sekali saat module load** |
| G7 | Ketua Gugus dipetakan ke orang yang salah | `utils/signatureRoles.js` memetakan `ketua-gugus` → `kepalaSekolah.nama`. Padahal menurut docx: Ketua Gugus = **WAHYUDIN, S.Pd.SD.** (`197912222014121003`) — orang **berbeda** dari Kepala Sekolah BADRUDDIN |
| G8 | Menambah pejabat baru akan **crash** | `pages/dashboard/DataSekolahPage.jsx:60-62` → `if (stored) setData(stored)` **tanpa deep-merge**. Baris `571`/`590`/`602` mengakses `data.pejabat[role.key].nama` → `Cannot read properties of undefined`. Pola sama di `pages/dashboard/PejabatSekolahPage.jsx:66` + `181`/`200`/`209`/`213`/`215` |
| G9 | Field Data Sekolah hilang saat dibaca | `utils/sekolahData.js` — `getSchoolData()` menjatuhkan `telepon`, `kelurahan`, `kodePos` (ada di `DEFAULTS`, tidak ikut di-`return`) |
| G10 | Duplikasi definisi pejabat | `PEJABAT_ROLES` didefinisikan **dua kali**: `DataSekolahPage.jsx:34-39` dan `PejabatSekolahPage.jsx:14-43` — bisa divergen |
| G11 | Kop sekolah tidak bersumber dari Data Sekolah & **tanpa logo** | `blocks/KopSurat.jsx:5,8` memakai konstanta basi `SEKOLAH_DEFAULT` dan **tidak merender satu pun logo** — padahal `DataSekolahPage.jsx:806-807` sudah mendokumentasikan niat: *"Logo Sekolah — ditampilkan di pojok kiri atas dokumen surat; Logo Dinas — pojok kanan atas"*. Data sekolah kosong → kop tetap mencetak 'SD NEGERI LEBAKLEUNGSIR' |
| G12 | Kop gugus **hardcoded**, tidak punya sumber data | `blocks/KopGugus.jsx:12,15` → `'GUGUS KI HAJAR DEWANTARA'` + alamat sekretariat literal. Data Sekolah belum punya field Nama Gugus / Alamat Gugus. (Dokumen sumber menulis *"Gugus K.H. Dewantara"* — ejaan pun sudah menyimpang) |
| G13 | Email sekolah **ada** di Data Sekolah, tapi tidak pernah terbaca | `utils/sekolahParser.js:16-24` — `LABEL_MAP` **tidak memuat `email`** (hanya `npsn`, `nama_sekolah`, `alamat`, `kabupaten`, `provinsi`, `tahunAnggaran`, `kecamatan`), sehingga `handleFileUpload` (`DataSekolahPage.jsx:199-209`) tidak pernah mengisi `data.email` → key itu selalu `''`. Padahal email **tersimpan di `allFields`** (label `"Email"`, seksi `"Kontak Sekolah"`) dan tampil di UI tab Data Sekolah. Terbukti di Excel sumber baris 36: `sdnpasirhalang123@gmail.com` |

### 1.2 Dokumen referensi sumber (hasil baca `editor_sdk`, 2026-09-14)

`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` memuat **tepat 3 dokumen,
5 tabel, 0 heading**:

| # | Dokumen di docx | Kop surat | Tab aplikasi terkait |
|---|---|---|---|
| 1 | **SURAT UNDANGAN** (Undangan Rapat Operator) | Gugus K.H. Dewantara | `undangan` (config `undangan_gugus`) |
| 2 | **SURAT PERINTAH TUGAS** | SDN Lebakleungsir | `spt` |
| 3 | **SURAT PERJALANAN DINAS (SPD)** | SDN Lebakleungsir | `sppd` |
| — | *(tidak ada di docx)* | — | `surat_tugas` → **DIHAPUS** (lihat US-01) |
| — | *(tidak ada di docx)* | — | `resume` / notulen → **di luar cakupan** |

---

## 2. Tujuan

1. **Satu dokumen = satu tab.** Tidak ada lagi dua tab yang menghasilkan output sama.
2. **Struktur data form memetakan ke dokumen asli.** Setiap elemen dokumen referensi
   punya padanan field yang bisa di-CRUD (struktur sama, label dirapikan — bukan
   salinan verbatim).
3. **Dua wajah yang benar-benar terpisah.** Tab = tampilan data (tanpa kop & TTD);
   print-area = dokumen formal lengkap (kop → TTD), sama persis dokumen sumber.
4. **Satu sumber kebenaran pejabat.** Bendahara / Kepala Sekolah / Ketua Gugus
   diambil dari **Data Sekolah → tab Pejabat Sekolah**, tanpa nilai hardcoded.
5. **Jujur saat data kosong.** Data Sekolah kosong → field dokumen kosong +
   notifikasi merah. Tidak ada fallback diam-diam ke nama default.

---

## 3. Persona

| Persona | Jumlah | Kebutuhan | Pengetahuan |
|---|---|---|---|
| **Operator Sekolah** (primer) | 1–2 per sekolah | Menyusun SPT / SPD / Undangan untuk perjalanan dinas, lalu mencetak | Paham format surat dinas; **bukan** power-user aplikasi |
| **Bendahara Sekolah** (primer) | 1 per sekolah | Menyiapkan dokumen pertanggungjawaban; memastikan pembebanan anggaran benar | Paham kode akun & BOS |
| **Kepala Sekolah** (sekunder) | 1 per sekolah | Menandatangani; memastikan nama/NIP-nya benar di semua dokumen | Hanya memeriksa hasil cetak |
| **Pengawas Bina** (sekunder) | 1 per kecamatan | Menerima tembusan undangan | Hanya menerima dokumen |

---

## 4. Success Metrics

| Kriteria di Idea Brief | Metrik terukur | Target |
|---|---|---|
| Tidak ada dua tab beroutput identik | Jumlah tab dokumen dengan output duplikat | **0** |
| Field form memetakan ke dokumen referensi | % elemen docx punya field CRUD padanan | **100%** untuk SPT/SPD/Undangan |
| Print-area lengkap kop → TTD | % elemen docx muncul di print-area | **100%** (lihat checklist §5) |
| Pejabat dari Data Sekolah | Jumlah nilai pejabat hardcoded di modul ini | **0** |
| Data Sekolah kosong → kosong + notif merah | Fallback diam-diam ke nama default | **0** |
| Tidak merusak dokumen lain | Jumlah regresi pada 6 konsumen existing | **0** |
| Gate build | `cd spj-frontend && npm run build` | **sukses** |

---

## 5. Spesifikasi Dokumen (rujukan implementasi)

### 5.1 SPT — Surat Perintah Tugas (kop SDN Lebakleungsir)

Urutan elemen docx:
1. Kop surat SDN
2. Judul **SURAT PERINTAH TUGAS** (underline)
3. `Nomor :`
4. **"Yang bertandatangan di bawah ini :"** → `Nama:`, `Jabatan:` (Kepala Sekolah)
5. **"M E N U G A S K A N"**
6. **"Kepada:"** → `Nama:`, `NIP:`, `Pangkat/Gol.:`, `Jabatan:`
7. **"Untuk :"**
8. Hari / tanggal / Tempat
9. Paragraf penutup
10. TTD 2 kolom — kiri `Mengetahui/Mengesahkan Kepala, WAHYUDIN` · kanan
    `Cikalongwetan, <tanggal>` / `Kepala Sekolah, BADRUDDIN, S.Ag.`

Status blok cetak `blocks/SuratTugas.jsx`: **sudah sesuai** struktur docx.

### 5.2 SPD — Surat Perjalanan Dinas (kop SDN Lebakleungsir)

Tabel utama butir 1–10:

| Butir | Isi docx | Status `blocks/SPDForm.jsx` |
|---|---|---|
| 1 | Pengguna Anggaran / Kuasa Pengguna Anggaran | ✅ ada |
| 2 | Nama PNS & NIP/PTT (contoh: `Operator: RISNA MARSELA HARTINI`) | ✅ ada |
| 3 | Pangkat dan Golongan / Jabatan-Instansi / Tingkat Biaya Perjalanan Dinas | ✅ ada |
| 4 | Maksud Perjalanan Dinas | ✅ ada |
| 5 | Alat angkutan (`Kendaraan darat`) | ✅ ada |
| 6 | a. Tempat berangkat · b. Tempat tujuan | ✅ ada |
| 7 | a. Lamanya (1 hari) · b. Tanggal berangkat · c. Tanggal kembali | ✅ ada |
| 8 | Pengikut (Nama \| Tanggal lahir \| Keterangan) | ✅ ada |
| 9 | Pembebanan Anggaran (SKPD: `BOS Reguler` \| Akun: `5.1.02.04.01.0003`) | ✅ ada |
| 10 | Keterangan lain-lain | ✅ ada |

Tabel verifikasi (8 baris): SPD Nomor · Berangkat dari (tempat kedudukan) · Ke ·
Pada tanggal · Kepala Sekolah · TTD · 4 blok "Tiba di / Berangkat dari"
(2 terisi, 2 kosong).

| Elemen verifikasi | Status `blocks/SPDForm.jsx` |
|---|---|
| Blok "Tiba di / Berangkat dari" | ✅ ada |
| **"Telah diperiksa dengan keterangan bahwa perjalanan tersebut atas perintah pejabat yang berwenang…"** | ❌ **BELUM ADA** |
| **"Catatan Lain-Lain"** | ❌ **BELUM ADA** |
| **"PERHATIAN : … bertanggungjawab berdasarkan peraturan-peraturan Keuangan Daerah apabila daerah menderita rugi akibat kesalahan dan kelalaian."** | ❌ **BELUM ADA** |

> **3 elemen hilang ini adalah blocker syarat "print-area sama persis".**

### 5.3 Undangan (kop Gugus K.H. Dewantara)

- Tabel kanan: `Nomor: 400.3.7.6/018/G-KHD/2026` · `Lampiran: -` · `Perihal: Undangan Rapat Operator`
- `Cikalongwetan, 7 Mei 2026`
- `Yth. Kepala Sekolah SD / se-gugus K.H Dewantara / di / Tempat`
- `Dengan hormat,`
- Isi: *"Ketua gugus K.H. Dewantara melalui Kepala Sekolah dapat menghadirkan Operator Sekolah untuk mengikuti Rapat Kerja Teknis Operator Tingkat Gugus pada:"*
- Hari / Tanggal / Pukul / Tempat
- **2 paragraf penutup**: *"Mengingat pentingnya acara tersebut…"* + *"Demikian undangan ini kami sampaikan…"*
- TTD: `Ketua Gugus, WAHYUDIN, S.Pd.SD.` / `NIP. 197912222014121003`
- **Tembusan** (list decimal): 1) Yth. Pengawas Bina Satuan Pendidikan SD Kec. Cikalongwetan · 2) Yth. Kepala (mohon izin tempat)

Gap sisi aplikasi (`DokumenFormPreview.jsx:684-723`): sudah ada nomor/sifat/lampiran/
perihal/tanggal surat/kepada/alamat/hari/tanggal/pukul/tempat/isi/ketua gugus
(nama+nip)/tembusan. Yang belum sepadan: **(a)** docx tidak punya field "Sifat"
(aplikasi menambah — keputusan: **dipertahankan, default `"-"`**), **(b)** docx punya
**2 paragraf penutup**, aplikasi hanya 1 field `Isi Undangan`, **(c)** docx punya
baris **"di"** sebelum Tempat.

---

## 6. User Stories

### US-01 — Konsolidasi tab: hapus tab "Surat Tugas"
**As** Operator Sekolah, **I want** hanya melihat tab dokumen yang benar-benar ada di
dokumen referensi, **so that** saya tidak bingung memilih di antara dua tab yang
hasilnya sama.

Acceptance Criteria:
- [ ] Tab `surat_tugas` dihapus dari `TRANSPORT_FORM_TABS` (`DokumenFormPreview.jsx:182-189`)
- [ ] Blok preview `previewTab === 'surat_tugas'` (`DokumenFormPreview.jsx:1789-1791`) dihapus
- [ ] Config `surat_tugas` di `templateConfig.js:334-358` dihapus
- [ ] `grep -rn "surat_tugas" spj-frontend/src` → **0 hasil**
- [ ] Tab `spt` tetap berfungsi penuh (memakai blok `blocks/SuratTugas.jsx`)
- [ ] `TRANSPORT_TABS_BY_SUB` (baris 193-203) tetap konsisten untuk sub-kategori `koordinasi` & `bank`

### US-02 — Form SPT sesuai struktur dokumen referensi
**As** Operator Sekolah, **I want** mengisi SPT lewat field yang memetakan ke elemen
dokumen asli, **so that** tidak ada elemen dokumen yang lupa saya isi.

Acceptance Criteria:
- [ ] Field form mencakup: nomor surat · nama & jabatan penandatangan · nama · NIP ·
      pangkat/gol. · jabatan penerima · "Untuk" · hari · tanggal · tempat
- [ ] Field dikelompokkan sesuai urutan dokumen (§5.1), label dirapikan (Title Case, bukan `M E N U G A S K A N`)
- [ ] Nilai default pejabat diambil dari Data Sekolah (lihat US-13), **bukan** hardcoded
- [ ] Tidak ada field di form yang tidak punya padanan di dokumen (kecuali "Sifat" — US-09)

### US-03 — Form SPD sesuai struktur dokumen referensi
**As** Bendahara Sekolah, **I want** mengisi SPD butir 1–10 + blok verifikasi,
**so that** SPD saya lengkap sesuai format dinas.

Acceptance Criteria:
- [ ] Form memuat field untuk **butir 1–10** (§5.2) dengan label sesuai dokumen
- [ ] Form memuat field untuk **blok verifikasi**: SPD Nomor · Berangkat dari · Ke ·
      Pada tanggal · "Tiba di / Berangkat dari" (4 blok) · "Telah diperiksa…" ·
      "Catatan Lain-Lain" · "PERHATIAN :"
- [ ] Baris **Pengikut** bisa tambah/hapus (multi-baris: Nama | Tanggal lahir | Keterangan)
- [ ] Pembebanan Anggaran memuat `SKPD` + `Akun`
- [ ] Field "Tingkat Biaya Perjalanan Dinas" tersedia (docx butir 3)

### US-04 — Form Undangan sesuai struktur dokumen referensi
**As** Operator Sekolah, **I want** mengisi undangan lengkap termasuk **2 paragraf
penutup** dan **Tembusan**, **so that** undangan saya sama dengan format gugus.

Acceptance Criteria:
- [ ] Field tersedia: nomor · sifat · lampiran · perihal · tanggal surat · kepada ·
      alamat · hari · tanggal · pukul · tempat · isi · **paragraf penutup 1** ·
      **paragraf penutup 2** · nama & NIP ketua gugus · tembusan (multi-baris)
- [ ] Baris **"di"** sebelum Tempat direpresentasikan (field alamat / baris tetap)
- [ ] Tembusan bisa tambah/hapus baris, dirender sebagai list decimal saat cetak

### US-05 — Dua wajah benar-benar terpisah untuk 3 dokumen ini
**As** Operator Sekolah, **I want** tab menampilkan **data** saja sementara hasil
cetak menampilkan **dokumen formal**, **so that** layar kerja tidak penuh elemen
cetak dan hasil cetak tetap resmi.

Acceptance Criteria:
- [ ] Preview tab (`previewTab`) **tidak** merender kop surat maupun blok TTD
- [ ] `blocks/SuratTugas.jsx` & `blocks/SPDForm.jsx` **tidak lagi** merender `<input>`
      saat `mode === 'edit'` — editor dipisahkan dari blok cetak
- [ ] Print-area merender kop surat (SDN / Gugus) sesuai dokumen
- [ ] Print-area merender blok TTD 2 kolom sesuai dokumen
- [ ] `@page { size: A4 }`, semua satuan `mm`, orientasi dibaca dari `templateConfig.js → orientation`

### US-06 — Print-area SPT lengkap kop → TTD
**As** Kepala Sekolah, **I want** mencetak SPT yang sama persis dengan dokumen sumber,
**so that** dokumen sah dan tidak ditolak.

Acceptance Criteria:
- [ ] Elemen §5.1 muncul **semua** di print-area, urutannya sama
- [ ] Kop surat SDN + TTD 2 kolom (Mengetahui / Kepala Sekolah) tercetak
- [ ] Nama & NIP di TTD diambil dari Data Sekolah (US-13)

### US-07 — Print-area SPD lengkap kop → TTD
**As** Bendahara Sekolah, **I want** SPD cetak memuat seluruh elemen termasuk blok
verifikasi, **so that** SPD tidak ditolak pemeriksa.

Acceptance Criteria:
- [ ] 3 elemen yang **BELUM ADA** (§5.2) ditambahkan ke `blocks/SPDForm.jsx`:
      "Telah diperiksa…", "Catatan Lain-Lain", "PERHATIAN :"
- [ ] Tabel butir 1–10 tercetak utuh (tanpa terpotong antar halaman)
- [ ] Blok "Tiba di / Berangkat dari" (4 blok) tercetak; 2 kosong tetap kosong (untuk diisi tangan)
- [ ] Kop surat SDN + TTD tercetak

### US-08 — Print-area Undangan lengkap kop → TTD
**As** Operator Sekolah, **I want** undangan cetak memuat kop gugus, 2 paragraf
penutup, TTD Ketua Gugus, dan Tembusan, **so that** undangan siap dikirim.

Acceptance Criteria:
- [ ] Kop **Gugus K.H. Dewantara** tercetak
- [ ] Kedua paragraf penutup tercetak terpisah
- [ ] TTD `Ketua Gugus, <nama> / NIP. <nip>` tercetak (sumber: US-14)
- [ ] **Tembusan** tercetak sebagai list decimal bernomor

### US-09 — Field "Sifat" pada Undangan dipertahankan dengan default "-"
**As** Operator Sekolah, **I want** field Sifat tetap ada dengan nilai default `"-"`,
**so that** tampilan undangan konsisten meski dokumen sumber tidak memuatnya.

Acceptance Criteria:
- [ ] Field `sifat` tetap ada di form undangan
- [ ] Nilai default = `"-"` (strip), bukan string kosong
- [ ] Nilai `"-"` ikut tercetak apa adanya di print-area
- [ ] Field ini **tidak** dihapus (keputusan user 2026-09-14)

### US-10 — Kertas A4, satuan mm, orientasi dari config
**As** Operator Sekolah, **I want** semua dokumen tercetak pas di A4,
**so that** tidak ada halaman terpotong.

Acceptance Criteria:
- [ ] `@page { size: A4; margin: …mm }` untuk ketiga dokumen
- [ ] Semua nilai ukuran di print CSS memakai `mm` (bukan `px`/`pt`)
- [ ] Orientasi dibaca dari `templateConfig.js → orientation`, bukan hardcoded
- [ ] Hasil print-preview tidak menghasilkan halaman kosong tambahan

### US-11 — Blue-only pada modul yang disentuh
**As** pengembang, **I want** kode yang saya sentuh patuh design system,
**so that** utangan teknis tidak bertambah.

Acceptance Criteria:
- [ ] Semua warna baru di modul Perjalanan Dinas memakai `#004ac6` (primary) + slate
- [ ] **Kartu Pejabat** (`DataSekolahPage.jsx:554-565` & `PejabatSekolahPage.jsx:20-41`)
      yang memakai `emerald` / `violet` / `amber` **diganti** ke blue/slate —
      file ini disentuh sprint ini (aturan CONSTITUTION: pelanggaran legacy
      dibenahi saat file terkait disentuh)
- [ ] Warna sinyal status di layar (mis. notif merah US-15) **tidak** ikut tercetak
- [ ] `grep -rn "dangerouslySetInnerHTML" spj-frontend/src` → tetap **0**

### US-12 — Reset bersih data lama (tanpa migrasi)
**As** pengembang, **I want** data lama yang tidak sesuai skema baru dibuang bersih,
**so that** tidak ada state campuran yang membingungkan.

Acceptance Criteria:
- [ ] Tidak ada fungsi migrasi data lama
- [ ] Data dokumen Perjalanan Dinas lama (`spj_dokumen_lpj`) di-reset ke bentuk skema baru
- [ ] Aplikasi tidak crash saat membuka data lama (harus dibuang, bukan diparsial)
- [ ] Reset hanya menyentuh data Perjalanan Dinas — **tidak** menghapus `spj_data_sekolah`

### US-13 — Pejabat diambil dari Data Sekolah → tab Pejabat Sekolah
**As** Operator Sekolah, **I want** nama Bendahara / Kepala Sekolah / Ketua Gugus
terisi otomatis dari Data Sekolah, **so that** saya tidak perlu mengetik ulang dan
tidak ada salah nama.

Acceptance Criteria:
- [ ] `blocks/SuratTugas.jsx`, `blocks/SPDForm.jsx`, `blocks/SuratUndangan.jsx` membaca `utils/sekolahData.js`
- [ ] `templateConfig.js` — hapus hardcode `namaPenandatangan: 'BADRUDDIN, S.Ag.'` & `namaMengetahui: 'WAHYUDIN, S.Pd.SD.'`
- [ ] `utils/signatureRoles.js` — perbaiki pemetaan `ketua-gugus` (jangan lagi → `kepalaSekolah`)
- [ ] **Bug G6:** nilai pejabat dibaca **saat render**, bukan konstanta module-level yang basi
- [ ] **Bug G9:** `getSchoolData()` tidak lagi menjatuhkan `telepon`, `kelurahan`, `kodePos`
- [ ] Perubahan bersifat **aditif** — perilaku konsumen existing (`KopSurat.jsx`,
      `InfoKeuangan.jsx`, `SKHonorer.jsx`, `SignatureFooter.jsx`) tidak berubah diam-diam
- [ ] Mekanisme auto-fill **tersedia**, tapi **tidak dipaksa muncul** di 3 dokumen ini
      (keputusan user 2026-09-14)

### US-14 — Field baru "Ketua Gugus" + "Notulen" di Data Sekolah → tab Pejabat Sekolah
**As** Operator Sekolah, **I want** bisa menyimpan data Ketua Gugus dan Notulen,
**so that** undangan & notulen tercetak dengan nama yang benar, bukan nama hardcoded.

Acceptance Criteria:
- [ ] **Dua** role baru ditambahkan ke `PEJABAT_ROLES`: `ketuaGugus` ("Ketua Gugus") dan
      `notulen` ("Notulen") → total **6 role** (dari 4)
- [ ] `PEJABAT_ROLES` **satu sumber** — diekspor dari `utils/pejabatRoles.js`, **tidak**
      diduplikasi di `DataSekolahPage.jsx:34-39` dan `PejabatSekolahPage.jsx:14-43` (**tutup G10**)
- [ ] `defaultData.pejabat` / `defaultPejabat` memuat `ketuaGugus` **dan** `notulen`
- [ ] **Bug G8 (blocker):** load handler **deep-merge** `pejabat` dengan default →
      data lama tanpa role baru **tidak crash** (`DataSekolahPage.jsx:60-62`,
      `PejabatSekolahPage.jsx:63-68`)
- [ ] `utils/signatureRoles.js:29-30` — `notulen` dibaca dari `pejabat.notulen`
      (hardcode `'DEWI ERMIRAWATI, S.Pd.Gr.'` dihapus)
- [ ] Pewarnaan kartu **tidak lagi berbasis indeks** (`idx === 0/1/2/else`) — pakai `role.key`
- [ ] Data tersimpan di `spj_data_sekolah.pejabat.ketuaGugus` dan `.notulen`

### US-15 — Data kosong → field kosong + notifikasi merah
**As** Operator Sekolah, **I want** diberi tahu jelas kalau Data Sekolah belum diisi,
**so that** saya tidak mencetak dokumen dengan nama kosong atau nama orang lain.

Acceptance Criteria:
- [ ] `utils/sekolahData.js` **tidak lagi** fallback ke nilai hardcoded — **termasuk
      identitas sekolah** (`SEKOLAH_DEFAULTS`), bukan hanya pejabat (keputusan user 2026-09-14)
- [ ] `getKepalaSekolah()` / `getBendahara()` mengembalikan `{ nama: '', nip: '' }` bila kosong
- [ ] Field pejabat di dokumen ter-render **kosong** bila Data Sekolah kosong
- [ ] **Kop surat juga kosong** bila identitas sekolah belum diisi (konsekuensi keputusan —
      bukan regresi)
- [ ] Muncul **notifikasi merah**, dengan **dua pesan berbeda** sesuai apa yang kosong:
      - **Identitas sekolah kosong** → *"Data sekolah belum diisi. Upload data sekolah
        terlebih dahulu."* + arahkan ke **Data Sekolah → tab Data Sekolah** (aksi upload
        Excel `.xlsx/.xls` via `handleFileUpload` → `parseSekolahExcel`)
      - **Pejabat kosong** → sebutkan peran mana yang kosong + arahkan ke
        **Data Sekolah → tab Pejabat Sekolah**
- [ ] Notifikasi memuat **teks**, bukan hanya warna (aksesibilitas — jangan andalkan warna saja)
- [ ] Notifikasi **memperingatkan, tidak memblokir** — user masih boleh mencetak (keputusan user)
- [ ] **Cakupan: SEMUA dokumen** (keputusan user 2026-09-14) — bukan hanya Perjalanan Dinas
- [ ] Wajib regresi: 6 konsumen existing + template lain tetap benar (lihat US-16)

### US-16 — Guard regresi akibat perubahan global `sekolahData.js`
**As** pengembang, **I want** bukti bahwa perubahan sumber pejabat tidak merusak
dokumen lain, **so that** perluasan aturan ke semua dokumen aman.

Acceptance Criteria:
- [ ] Keempat konsumen diuji render: `KopSurat.jsx`, `InfoKeuangan.jsx`, `SKHonorer.jsx`, `SignatureFooter.jsx`
- [ ] Template lain yang memakai pejabat diuji render (min. SK Honorer + Info Keuangan)
- [ ] Uji 2 kondisi: (a) Data Sekolah **terisi**, (b) Data Sekolah **kosong**
- [ ] `npm run build` sukses
- [ ] Bukti dilampirkan (output build asli + screenshot), bukan klaim

### US-17 — Kop sekolah bersumber dari Data Sekolah (identitas + logo)
**As** Operator Sekolah, **I want** kop surat terisi otomatis dari Data Sekolah,
**so that** saya tidak perlu mengedit kop dan tidak ada kop basi/salah sekolah.

Acceptance Criteria:
- [ ] `blocks/KopSurat.jsx` membaca identitas dari **`spj_data_sekolah` → tab Data Sekolah**:
      `namaSekolah`, `alamat`, `email`, `npsn` — lewat `getSchoolData()` (fungsi, **bukan**
      konstanta `SEKOLAH_DEFAULT` — hilangkan bug nilai basi G6/G11)
- [ ] **`email` diambil dari `allFields`** — label `"Email"`, seksi `"Kontak Sekolah"`.
      Terbukti ada di Excel sumber: `template-data/profil-SD NEGERI PASIRHALANG-…xlsx`
      baris 36 → `sdnpasirhalang123@gmail.com` (baris 34 `Nomor Telepon`, 37 `Website`).
      `utils/sekolahData.js` **WAJIB** mencari di `allFields` berdasarkan label — sebab
      `LABEL_MAP` (`utils/sekolahParser.js:16-24`) **tidak memuat `email`**, sehingga
      `handleFileUpload` tidak pernah mengisi `data.email` dan key itu selalu `''`
- [ ] Urutan prioritas nilai: `stored.email` (bila diisi manual) → `allFields` (label `"Email"`)
- [ ] Perlakuan sama untuk **`telepon`** (label `"Nomor Telepon"`) dan **`website`** —
      jangan dijatuhkan dari return `getSchoolData()` (tutup G9)
- [ ] Baris **"PEMERINTAH KABUPATEN BANDUNG BARAT"** + **"DINAS PENDIDIKAN"** diambil dari
      `kabupaten` / `provinsi` bila tersedia (bukan literal)
- [ ] **Logo sekolah tampil di pojok kiri atas** — sumber `spj_logo_sekolah`
- [ ] **Logo dinas tampil di pojok kanan atas** — sumber `spj_logo_dinas`
      (sesuai niat yang sudah didokumentasikan di `DataSekolahPage.jsx:806-807`)
- [ ] Bila logo belum diupload → area logo **kosong** (tanpa ikon pengganti), tidak merusak tata letak kop
- [ ] Identitas sekolah kosong → **kop kosong** + notifikasi merah "upload data sekolah
      terlebih dahulu" (lihat US-15)
- [ ] Kop tetap A4, satuan `mm`, dan tercetak utuh (tidak terpotong)

### US-18 — Data Gugus baru + kop gugus data-driven
**As** Operator Sekolah, **I want** menyimpan identitas gugus sekali lalu dipakai otomatis
di surat gugus, **so that** undangan tidak lagi memakai nama/alamat gugus yang hardcoded.

Acceptance Criteria:
- [ ] **Field baru** di Data Sekolah → tab **Data Sekolah**, seksi "Data Gugus":
      `gugusNama` ("Nama Gugus") dan `gugusAlamat` ("Alamat Sekretariat Gugus")
- [ ] Field dapat disimpan & dibaca ulang dari `spj_data_sekolah` (bertahan setelah reload)
- [ ] `blocks/KopGugus.jsx` membaca `gugusNama` / `gugusAlamat` dari `spj_data_sekolah`
      — literal `'GUGUS KI HAJAR DEWANTARA'` dan alamat sekretariat **dihapus** (tutup G12)
- [ ] **Ketua Gugus** dibaca dari `spj_data_sekolah.pejabat.ketuaGugus` (role yang sudah
      direncanakan di US-14) → dipakai di TTD undangan, **bukan** dari Kepala Sekolah
- [ ] `spj_logo_gugus` dirender di kop gugus bila tersedia (sesuai `DataSekolahPage.jsx:808`)
- [ ] Data gugus kosong → **kosong** + notifikasi merah (tanpa fallback literal)
- [ ] Ejaan nama gugus mengikuti isian user — tidak dipaksa jadi satu varian tertentu
- [ ] Undangan tetap A4, satuan `mm`

---

## 7. Data Contract (localStorage — tanpa backend)

Prefix wajib `spj_` (JANGAN diubah — `utils/storageHelper.js:1`).

| Key | Dipakai oleh | Shape |
|---|---|---|
| `spj_data_sekolah` | `DataSekolahPage`, `PejabatSekolahPage`, `sekolahData.js` | `{ namaSekolah, npsn, alamat, email, telepon, kelurahan, kodePos, kabupaten, provinsi, kecamatan, tahunAnggaran, allFields: [], **gugusNama**, **gugusAlamat**, pejabat: { ks, bendahara, pengawas, sekdik, ketuaGugus, notulen } }` |
| `spj_dokumen_lpj` | `DokumenSPJPage.jsx:140` | store dokumen LPJ (Perjalanan Dinas dll) |
| `spj_counter_surat` | penomoran surat | counter nomor surat |
| `spj_nomor_surat` | penomoran surat | data nomor surat |
| `spj_template_surat_settings` | pengaturan template surat | settings |
| `spj_logo_sekolah` / `spj_logo_dinas` / `spj_logo_gugus` | kop surat | data URL logo |

**Shape `pejabat` setelah perubahan (US-14) — 6 role:**
```json
{
  "pejabat": {
    "ks":         { "nama": "", "nip": "" },
    "bendahara":  { "nama": "", "nip": "" },
    "pengawas":   { "nama": "", "nip": "" },
    "sekdik":     { "nama": "", "nip": "" },
    "ketuaGugus": { "nama": "", "nip": "" },
    "notulen":    { "nama": "", "nip": "" }
  }
}
```
> **Aturan load:** WAJIB deep-merge dengan default (`{...DEFAULT_PEJABAT[r.key], ...stored.pejabat[r.key]}`
> per-role) agar data lama tanpa role baru **tidak menyebabkan crash**.
> Definisi role tunggal ada di `utils/pejabatRoles.js` (`PEJABAT_ROLES`, `DEFAULT_PEJABAT`, `mergePejabat`).

---

## 8. Non-Functional Requirements

**Performance**
- Perpindahan tab < 100 ms (tanpa refetch)
- Render print-area < 300 ms untuk satu dokumen
- **Tidak menambah dependency baru** (lihat `BLUEPRINT.MD`)

**Security**
- Tidak ada secret baru di sisi client; tetap patuh `CONSTITUTION.md` Security Rules
- Semua input user divalidasi sebelum disimpan
- `dangerouslySetInnerHTML` tetap **0 penggunaan**
- Tidak ada `console.log` tertinggal di kode baru

**Print**
- A4 (210 × 297 mm), satuan `mm`, `@page { size: A4 }`
- Warna cetak tidak membawa sinyal status layar
- Tabel panjang tidak terpotong di tengah baris antar halaman

**Compatibility**
- Chrome / Edge 2 versi terakhir (target cetak utama)
- Tidak mengandalkan API eksperimental

**Accessibility**
- Setiap input punya `<label>`
- Fokus terlihat (focus ring)
- Kontras teks ≥ 4.5:1
- Notifikasi merah menyertakan **teks**, tidak mengandalkan warna saja

**Maintainability (CONSTITUTION.md)**
- Maks fungsi 50 baris · komponen 300 baris · utility 200 baris · config 150 baris
- Comment menjelaskan **MENGAPA**, bukan apa
- Guard clause dipakai

---

## 9. Traceability (user story → berkas utama)

| US | Sprint | Berkas utama |
|---|---|---|
| US-01 | **002** | `DokumenFormPreview.jsx`, `data/templateConfig.js` |
| US-02 | **002** | `DokumenFormPreview.jsx` (form tab SPT), `data/templateConfig.js` |
| US-03 | **002** | `DokumenFormPreview.jsx` (form tab SPPD) |
| US-04 | **002** | `DokumenFormPreview.jsx` (form tab Undangan) |
| US-05 | **002** | `DokumenFormPreview.jsx`, `blocks/SuratTugas.jsx`, `blocks/SPDForm.jsx`, `blocks/SuratUndangan.jsx` |
| US-06 | **002** | `blocks/SuratTugas.jsx`, `blocks/KopSurat.jsx` (kop dari 001) |
| US-07 | **002** | `blocks/SPDForm.jsx`, `blocks/KopSurat.jsx` (kop dari 001) |
| US-08 | **002** | `blocks/SuratUndangan.jsx`, `blocks/KopGugus.jsx` (kop dari 001) |
| US-09 | **002** | `DokumenFormPreview.jsx` (form undangan), `blocks/SuratUndangan.jsx` |
| US-10 | **002** | print CSS / `data/templateConfig.js` (`orientation`) |
| US-11 | **001 + 002** | `DataSekolahPage.jsx`, `PejabatSekolahPage.jsx` (001) · blok cetak (002) |
| US-12 | **002** | `pages/dashboard/DokumenSPJPage.jsx`, `utils/storageHelper.js` |
| US-13 | **001** | `utils/sekolahData.js`, `utils/signatureRoles.js`, `utils/pejabatRoles.js`, 3 blok cetak |
| US-14 | **001** | `DataSekolahPage.jsx`, `PejabatSekolahPage.jsx`, `utils/pejabatRoles.js` |
| US-15 | **001** | `utils/sekolahData.js`, `blocks/PeringatanData.jsx`, `TemplateEngine.jsx` |
| US-16 | **001 + 002** | 6 konsumen + template lain (uji, bukan ubah) — gate di kedua sprint |
| US-17 | **001** | `blocks/KopSurat.jsx`, `utils/sekolahData.js` |
| US-18 | **001** | `blocks/KopGugus.jsx`, `pages/dashboard/DataSekolahPage.jsx` (field baru), `utils/sekolahData.js` |

> Kolom **Sprint** menentukan pack mana yang menjadi acuan kerja:
> **001** → `planning/sprints/sprint-001/` · **002** → `planning/sprints/sprint-002/`.
> Bila sebuah US menyebut berkas milik sprint lain, berkas itu **prasyarat**, bukan target
> perubahan sprint tersebut (mis. US-06/07/08 memakai kop hasil Sprint 001).

---

## 10. Definition of Done (gate sprint)

DoD kini **per sprint** — pack masing-masing sprint memuat kriteria rinci di `ACCEPTANCE.MD`.

### Sprint 001 — Fondasi Data Sekolah & Pejabat

- [ ] `cd spj-frontend && npm run build` **sukses** — bukti output asli dilampirkan
- [ ] `grep -rn "BADRUDDIN\|WAHYUDIN\|DEWI ERMIRAWATI\|DEDE GUNAWAN" spj-frontend/src` → tidak ada sebagai **default hardcoded**
- [ ] Uji Data Sekolah **kosong** → field pejabat **dan kop surat** kosong + notif merah (US-15)
- [ ] Uji Data Sekolah **terisi** → semua nama/NIP benar
- [ ] Kop sekolah memuat **logo sekolah (kiri atas)** + **logo dinas (kanan atas)** bila sudah diupload (US-17)
- [ ] Kop gugus memuat **Nama Gugus** + **Alamat Gugus** dari Data Sekolah, tanpa literal (US-18)
- [ ] Uji ubah Data Sekolah **tanpa reload** → kop & TTD langsung ikut berubah (bug nilai basi hilang)
- [ ] Data sekolah bentuk LAMA → 6 kartu peran tampil, tanpa crash (US-14)
- [ ] Regresi **6 konsumen** existing lulus (US-16)
- [ ] `STATE.MD` + pack sprint 001 diperbarui

### Sprint 002 — Rework Modul Perjalanan Dinas

- [ ] **Prasyarat:** Sprint 001 sudah selesai
- [ ] `cd spj-frontend && npm run build` **sukses** — bukti output asli dilampirkan
- [ ] Smoke-test render: setiap tab (daftar, spt, sppd, undangan) terbuka tanpa error
- [ ] Print-preview ketiga dokumen dibandingkan berdampingan dengan docx sumber
- [ ] `grep -rn "surat_tugas" spj-frontend/src` → 0 hasil
- [ ] `grep -n "<input"` pada 3 blok cetak → 0 hasil
- [ ] SPD memuat 3 blok resmi yang sebelumnya hilang, kalimat **persis** dokumen sumber
- [ ] TTD Undangan = **Ketua Gugus**, bukan Kepala Sekolah
- [ ] Data lama Perjalanan Dinas di-reset bersih, **tanpa** menghapus `spj_data_sekolah`
- [ ] Regresi **6 konsumen** existing lulus (US-16 — warisan guard)
- [ ] `STATE.MD` + pack sprint 002 diperbarui

### Berlaku untuk kedua sprint

- [ ] Tidak ada `console.log` baru
- [ ] Tidak ada file di luar daftar "File yang Akan Diubah" yang tersentuh

---

## 11. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Perubahan global `sekolahData.js` (US-15) merusak dokumen lain | Tinggi | Perubahan **aditif** (fungsi baru ber-opsi); regresi wajib US-16; uji 2 kondisi data |
| Menambah role baru (→ 6 peran) → crash pada data lama | Tinggi | **Deep-merge** `pejabat` saat load (US-14) — ini blocker, bukan opsional |
| Duplikasi `PEJABAT_ROLES` (2 file) → divergen | Sedang | Jadikan satu modul sumber `utils/pejabatRoles.js` (US-14) |
| `templateConfig.js` dibatasi 150 baris (CONSTITUTION) | Sedang | Cek panjang file setelah perubahan; ekstrak bila lewat |
| Blok cetak merangkap editor (`<input>` di mode edit) | Sedang | Pemisahan 2 wajah (US-05, Sprint 002) — **bukan** refactor di luar cakupan |
| Insiden worktree — **2×: `docs/` (2026-09-13), `architect-packs/` (2026-09-14)**, trigger terkonfirmasi = `git rm` | Tinggi | **Hindari `git rm`** — pakai `rm <path>` + `git add -A`; commit sering; `git status --short` sebelum & sesudah operasi git; `git diff HEAD --stat` cocokkan (RISKS.MD) |
| `xlsx@0.18.5` tanpa fix (F1) | Tinggi | Di luar cakupan sprint ini; **wajib selesai sebelum deploy publik** |

---

## 12. Out of Scope — JANGAN diimplementasikan

- Backend / API — data tetap di localStorage
- Dokumen **"Surat Tugas"** — tidak ada di dokumen referensi
- **Resume** / notulen rapat
- Refactor blok cetak / template **di luar** 3 dokumen Perjalanan Dinas
- Migrasi data lama (keputusan: reset bersih)
- Migrasi TypeScript, pemasangan ESLint/Prettier/Vitest (sprint terpisah)
- Perbaikan temuan keamanan F1–F9 `SECURITY-AUDIT-001` (kecuali F8 pinning → `BLUEPRINT.MD`)

> Item di atas **dikecualikan secara eksplisit**. Jika sebuah user story menyiratkan
> fitur di atas, story itu harus dihapus atau dicatat sebagai backlog — bukan dikerjakan diam-diam.
