# 📋 PRD: Upload Data Sekolah dari BKU Excel

> **PRD Version**: 1.0  
> **Status**: Draft  
> **Target Page**: `DataSekolahPage.jsx`

---

## 1. Latar Belakang

Halaman Data Sekolah saat ini memiliki **2 tab**:
1. **Form Input** — form manual untuk mengisi data profil sekolah & data pejabat
2. **Upload Excel** — placeholder kosong (belum berfungsi)

User ingin mengaktifkan fitur upload file Excel BKU (Buku Kas Umum) yang otomatis mengisi **data profil sekolah** (NPSN, nama sekolah, alamat, dll), sementara **data pejabat** (Kepala Sekolah, Bendahara, Pengawas Bina, Sekretaris Dinas Pendidikan) tetap diisi secara manual.

---

## 2. File Excel Sumber

- **File**: `Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx`
- **Sheet**: `Page1`
- **Sumber**: ARKAS (Aplikasi Rencana Kegiatan dan Anggaran Sekolah)

### 2.1 Struktur Header (School Profile)

File BKU Excel memiliki header informasi sekolah di baris awal (baris 1-13):

| Baris (0-indexed) | Kolom A (0)      | Kolom E (4) - Value      |
|-------------------|-------------------|--------------------------|
| 2                 | TAHUN : 2026      | (tahun)                  |
| 4                 | NPSN              | `: 20205293`            |
| 6                 | NAMA SEKOLAH      | `: SD NEGERI PASIRHALANG` |
| 8                 | ALAMAT            | `: Kp. Pasirhalang RT.03 RW.14` |
| 10                | KABUPATEN/KOTA    | `: Kab. Bandung Barat`   |
| 12                | PROVINSI          | `: Prov. Jawa Barat`     |

Data header ini sudah diparse oleh **bkuParser.js** yang sudah ada di project.

---

## 3. Mapping Data ke Form Aplikasi

### 3.1 Auto-fill dari BKU Excel

| Field Form Aplikasi | Header BKU Excel    | Keterangan                    |
|---------------------|---------------------|-------------------------------|
| `npsn`              | `NPSN`              | Auto-fill dari BKU            |
| `namaSekolah`       | `NAMA SEKOLAH`      | Auto-fill dari BKU            |
| `alamat`            | `ALAMAT`            | Auto-fill dari BKU            |
| `kabupaten`         | `KABUPATEN/KOTA`    | Auto-fill dari BKU            |
| `provinsi`          | `PROVINSI`          | Auto-fill dari BKU **\***     |
| `tahunAnggaran`     | `TAHUN`             | Auto-fill dari BKU **\***     |

> **\*** Catatan: Field `provinsi` dan `tahunAnggaran` saat ini belum ada di form. Perlu ditambahkan agar sinkron dengan data BKU.

### 3.2 Manual Input (Tetap Dipertahankan)

| Section              | Fields                      | Keterangan                    |
|----------------------|-----------------------------|-------------------------------|
| `kecamatan`          | input text                  | Tidak ada di BKU, manual      |
| `email`              | input email                 | Tidak ada di BKU, manual      |
| `pejabat.ks`         | nama + NIP                  | Manual (Kepala Sekolah)       |
| `pejabat.bendahara`  | nama + NIP                  | Manual (Bendahara)            |
| `pejabat.pengawas`   | nama + NIP                  | Manual (Pengawas Bina)        |
| `pejabat.sekdik`     | nama + NIP                  | Manual (Sekretaris Disdik)    |

---

## 4. Fitur yang Diminta

### 4.1 Upload BKU Excel untuk Data Sekolah

Tombol upload di tab "Upload Excel" yang memproses file BKU Excel (.xlsx) dan:
1. Parse header sekolah dari file BKU
2. Auto-fill form input dengan data yang ter-parse
3. **Tidak mengubah** data pejabat yang sudah diisi manual
4. Tampilkan preview data sebelum menyimpan

### 4.2 Reuse bkuParser.js

Gunakan fungsi **`parseBKUExcel()`** yang sudah ada di `bkuParser.js` untuk:
- Membaca file Excel
- Parse header sekolah
- Ekstrak field: npsn, namaSekolah, alamat, kabupaten, provinsi, tahunAnggaran

### 4.3 UI/UX Alur

```
Tab Upload Excel:
┌──────────────────────────────────────────────┐
│  ☁️ Upload File BKU Excel                   │
│                                              │
│  File Excel (.xlsx) export dari ARKAS        │
│  ┌──────────────────────────────────────┐    │
│  │  [Pilih File BKU Excel] → Biru      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ℹ️ Data sekolah akan otomatis terisi       │
│  Data pejabat tetap diisi manual             │
└──────────────────────────────────────────────┘

Setelah upload berhasil:
┌──────────────────────────────────────────────┐
│  ✅ Data Sekolah berhasil diupload!         │
│                                              │
│  📋 Preview Data:                           │
│  NPSN: 20205293                             │
│  Sekolah: SD NEGERI PASIRHALANG             │
│  Alamat: Kp. Pasirhalang RT.03 RW.14        │
│  Kabupaten: Kab. Bandung Barat              │
│  Provinsi: Prov. Jawa Barat                 │
│  Tahun: 2026                                │
│                                              │
│  [Terapkan ke Form] [Batal]                 │
└──────────────────────────────────────────────┘

Tab Form Input (after upload):
- Fields terisi otomatis dari BKU
- Data pejabat tetap seperti sebelumnya
- User bisa edit manual jika perlu
```

### 4.4 Storage

Data tetap disimpan ke localStorage dengan key `data_sekolah`.
Format data yang ada saat ini **tidak diubah** — hanya field yang terisi otomatis.

---

## 5. Spesifikasi Teknis

### 5.1 Parser: Reuse `bkuParser.js`

Tidak perlu membuat parser baru. Cukup gunakan `parseBKUExcel()` dari `bkuParser.js` yang sudah ada dan sudah terverifikasi dengan file BKU asli.

```javascript
import { parseBKUExcel } from '../../utils/bkuParser'
```

### 5.2 Data Flow

```
Pilih file BKU .xlsx
  → FileReader → XLSX.read()
  → parseBKUExcel() → result.header
    → { npsn, nama_sekolah, alamat, kabupaten, provinsi, tahunAnggaran }
  → Map ke form state
    → npsn: result.header.npsn
    → namaSekolah: result.header.nama_sekolah
    → alamat: result.header.alamat
    → kabupaten: result.header.kabupaten
    → (tambah provinsi & tahunAnggaran ke state)
  → Tampilkan preview → User konfirmasi → Simpan ke form
```

### 5.3 Tambahan Field Form

Untuk mengakomodasi data dari BKU, tambahkan 2 field baru di form:
- `provinsi` — string, input text
- `tahunAnggaran` — string, input text

Kedua field ini akan auto-fill dari BKU tetapi tetap bisa diedit manual.

---

## 6. Acceptance Criteria

- [ ] User bisa upload file BKU Excel (.xlsx) dari tab Upload Excel
- [ ] NPSN terisi otomatis setelah upload
- [ ] Nama Sekolah terisi otomatis setelah upload
- [ ] Alamat terisi otomatis setelah upload
- [ ] Kabupaten terisi otomatis setelah upload
- [ ] Provinsi terisi otomatis setelah upload
- [ ] Tahun Anggaran terisi otomatis setelah upload
- [ ] Data pejabat (KS, Bendahara, Pengawas, Sekdik) **tidak berubah**
- [ ] Ada preview/konfirmasi sebelum data diterapkan
- [ ] Ada error handling untuk format file salah
- [ ] Data tetap bisa diedit manual setelah auto-fill
- [ ] Data persist ke localStorage

---

## 7. Wireframe UI

```
┌─────────────────────────────────────────────────────┐
│ [Tab: Form Input] [Tab: Upload Excel] ✅           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  ☁️ Upload File BKU Excel                   │   │
│  │  📄 Realisasi Sekolah Buku Kas Umum ...     │   │
│  │                                              │   │
│  │  ┌──────────────────────────────────────┐    │   │
│  │  │ [Pilih File BKU Excel]              │    │   │
│  │  └──────────────────────────────────────┘    │   │
│  │                                              │   │
│  │  ℹ️ Format: .xlsx dari ARKAS                │   │
│  │  Data pejabat tidak terpengaruh              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  [Sudah upload BKU sebelumnya]                       │
│  ┌── Preview ──────────────────────────────────┐   │
│  │ SD NEGERI PASIRHALANG                       │   │
│  │ NPSN: 20205293 | Tahun: 2026               │   │
│  │ Kp. Pasirhalang RT.03 RW.14                │   │
│  │ Kab. Bandung Barat, Prov. Jawa Barat       │   │
│  ├────────────────────────────────────────────┤   │
│  │ [Terapkan ke Form] [Upload Ulang]          │   │
│  └────────────────────────────────────────────┘   │
│                                                      │
│  ⚠️ Peringatan: Menerapkan data akan              │
│  menimpa data sekolah yang sudah ada                │
└─────────────────────────────────────────────────────┘
```

---

## 8. Pertanyaan / Diskusi

1. Apakah perlu menambahkan field `provinsi` dan `tahunAnggaran` ke form input? (Saya rekomendasikan **YA** agar data BKU bisa dimanfaatkan sepenuhnya)
2. Apakah data BKU yang diupload di **halaman BKU** bisa dipakai bersama? Atau upload ulang khusus untuk halaman Data Sekolah?
3. Apakah perlu konfirmasi sebelum menerapkan data auto-fill, atau langsung terapkan?
4. Apakah field `kecamatan` dan `email` tetap dipertahankan meskipun tidak ada di BKU?
