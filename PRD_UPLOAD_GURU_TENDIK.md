# 📋 PRD: Upload Data Guru & Tenaga Kependidikan (Tendik)

> **PRD Version**: 1.0  
> **Status**: Draft  
> **Target Page**: `DataGuruPage.jsx`

---

## 1. Latar Belakang

Halaman Data Guru saat ini menampilkan data dummy (12 mock data) dan menyediakan form manual untuk menambah data guru. User ingin dapat mengupload file Excel dari Dapodik untuk mengisi data secara otomatis, baik untuk **Guru** maupun **Tenaga Kependidikan (Tendik)**.

---

## 2. File Excel Sumber

### 2.1 Daftar Guru
- **File**: `daftar-guru-SD NEGERI PASIRHALANG-2026-07-08 16_10_25.xlsx`
- **Sheet**: `Daftar guru`
- **Sumber**: Dapodik Web Service
- **Jumlah data**: 8 guru
- **Kolom**: 51 kolom (standar Dapodik)

### 2.2 Daftar Tendik
- **File**: `daftar-tendik-SD NEGERI PASIRHALANG-2026-07-08 16_12_25.xlsx`
- **Sheet**: `Daftar tendik`
- **Sumber**: Dapodik Web Service
- **Jumlah data**: 3 tendik
- **Kolom**: 51 kolom (standar Dapodik)

---

## 3. Struktur Excel (51 Kolom Dapodik)

```
No | Nama | NUPTK | JK | Tempat Lahir | Tanggal Lahir | NIP |
Status Kepegawaian | Jenis PTK | Agama | Alamat Jalan | RT/RW |
Nama Dusun | Desa/Kelurahan | Kecamatan | Kode Pos | Telepon |
HP | Email | Tugas Tambahan | SK CPNS | Tanggal CPNS |
SK Pengangkatan | TMT Pengangkatan | Lembaga Pengangkatan |
Pangkat Golongan | Sumber Gaji | Nama Ibu Kandung |
Status Perkawinan | Nama Suami/Istri | NIP Suami/Istri |
Pekerjaan Suami/Istri | TMT PNS | Sudah Lisensi Kepala Sekolah |
Pernah Diklat Kepengawasan | Keahlian Braille |
Keahlian Bahasa Isyarat | NPWP | Nama Wajib Pajak |
Kewarganegaraan | Bank | Nomor Rekening Bank |
Rekening Atas Nama | NIK | No KK | Karpeg | Karis/Karsu |
Lintang | Bujur | NUKS
```

---

## 4. Mapping Data ke Aplikasi

Dari 51 kolom Dapodik, hanya **data esensial** yang ditampilkan di aplikasi:

| Field Aplikasi    | Kolom Excel            | Keterangan                        |
|-------------------|------------------------|-----------------------------------|
| `nama`            | `Nama`                 | Nama lengkap                      |
| `nip`             | `NIP`                  | NIP (kosong untuk honorer)        |
| `nuptk`           | `NUPTK`                | NUPTK                             |
| `golongan`        | `Pangkat Golongan`     | Pangkat/Golongan (III/a, IV/b dll)|
| `jabatan`         | `Jenis PTK`            | Jenis PTK (Guru Mapel, Kepala Sekolah, Tenaga Honor Sekolah, dll) |
| `status`          | `Status Kepegawaian`   | PNS, PPPK, PPPK Paruh Waktu, Guru Honor Sekolah |
| `jk`              | `JK`                   | Jenis Kelamin (L/P)               |
| `tempatLahir`     | `Tempat Lahir`         | Tempat lahir                      |
| `tanggalLahir`    | `Tanggal Lahir`        | Tanggal lahir                     |
| `jenisPtk`        | `Jenis PTK`            | Penuh: Guru Mapel, Kepala Sekolah |
| `nik`             | `NIK`                  | NIK                               |
| `noHp`            | `HP`                   | Nomor HP                          |
| `email`           | `Email`                | Alamat email                       |

---

## 5. Fitur yang Diminta

### 5.1 Dua Tombol Upload
Halaman Data Guru mendapatkan **2 tombol upload** terpisah:

1. **Upload Data Guru** — untuk file Excel Dapodik daftar guru (`.xlsx`)
2. **Upload Data Tendik** — untuk file Excel Dapodik daftar tendik (`.xlsx`)

### 5.2 Tab Pemisah
Tab baru ditambahkan:
- **Tab "Guru"** — menampilkan data guru hasil upload + form tambah manual
- **Tab "Tendik"** — menampilkan data tendik hasil upload + form tambah manual
- **Tab "Upload Excel"** — area upload dengan 2 tombol

Atau alternatif: tombol upload ada langsung di masing-masing tab Guru/Tendik.

### 5.3 Parser Excel
Parser khusus untuk format Dapodik (51 kolom):
- Deteksi header otomatis berdasarkan kolom `No`, `Nama`, `NUPTK`
- Mapping kolom menggunakan indeks numerik
- Ekstraksi hanya field yang diperlukan

### 5.4 Storage
Data disimpan ke localStorage:
- `data_guru` — untuk guru
- `data_tendik` — untuk tendik
- Struktur data: array of objects dengan field yang sudah di-mapping

### 5.5 Tampilan Data
Tabel menampilkan data yang sudah di-mapping:
| Tabel | Fields |
|-------|--------|
| Guru  | Nama, NIP, NUPTK, Golongan, Jenis PTK, Status, Aksi |
| Tendik| Nama, NIP, NUPTK, Jenis PTK, Status, Aksi |

---

## 6. Spesifikasi Teknis

### 6.1 Parser Utility: `guruTendikParser.js`
- Function: `parseGuruExcel(file)` — parse file guru
- Function: `parseTendikExcel(file)` — parse file tendik
- Menggunakan library `xlsx` (sudah ada di dependencies)
- Mapping kolom berdasarkan index (konsisten antara file guru dan tendik)

### 6.2 Data Flow
```
User klik "Upload Data Guru" → Pilih file .xlsx
  → FileReader → XLSX.read() → sheet_to_json({header:1})
  → Map array index → filter field esensial
  → Simpan ke localStorage('data_guru')
  → Tampilkan di tabel Guru
```

### 6.3 UI/UX
- **Drag & drop** atau klik untuk memilih file
- **Progress indicator** selama parsing
- **Toast notification** sukses/gagal
- **Clear data button** untuk menghapus data upload
- **Fallback** jika data tidak ada: tampilkan pesan "Belum ada data"

---

## 7. Acceptance Criteria

- [ ] User bisa upload file Excel daftar guru Dapodik
- [ ] User bisa upload file Excel daftar tendik Dapodik
- [ ] Data yang muncul hanya field esensial (bukan 51 kolom)
- [ ] Tab Guru menampilkan data guru
- [ ] Tab Tendik menampilkan data tendik
- [ ] Data persist ke localStorage
- [ ] Tombol hapus untuk menghapus data
- [ ] Bisa tambah data manual (existing form)
- [ ] Format tabel konsisten dengan existing design
- [ ] Error handling untuk file format salah

---

## 8. Desain UI (Wireframe)

```
┌─────────────────────────────────────────────────────┐
│ [Tab: Guru] [Tab: Tendik] [Tab: Upload Excel]       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Tab Upload Excel:                                   │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │  ☁️ Upload Data Guru                       │   │
│  │  [Pilih File Excel Guru] ← Tombol biru      │   │
│  │                                              │   │
│  │  ☁️ Upload Data Tendik                      │   │
│  │  [Pilih File Excel Tendik] ← Tombol biru    │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Tab Guru / Tendik:                                  │
│  ┌──[Nama]──[NIP]──[NUPTK]──[Gol]──[Jabatan]─[Aksi]│
│  │ Guru A   12345   98765   III/b  Guru M.  [🗑️]   │
│  │ Guru B   12346   98766   IV/a  KS       [🗑️]   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [+ Tambah Guru Manual]                              │
└─────────────────────────────────────────────────────┘
```

---

## 9. Pertanyaan / Diskusi

1. Apakah tab Guru dan Tendik terpisah, atau digabung dalam satu tabel dengan filter "Jenis"?
2. Apakah form tambah manual tetap diperlukan setelah ada upload?
3. Apakah data tendik perlu field "Tugas Tambahan" juga?
4. Apakah perlu fitur export/download data yang sudah diupload?
