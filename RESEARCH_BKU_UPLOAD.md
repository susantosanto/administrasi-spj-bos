# Research Report: Fitur Upload BKU di Aplikasi SPJ
*Generated: 2026-07-08 | Sources: 5 | Confidence: High*

---

## Executive Summary

Fitur upload BKU (Buku Kas Umum) di aplikasi SPJ merupakan komponen penting yang berfungsi sebagai referensi data untuk pembuatan dokumen SPJ dan bukti fisik. Saat ini fitur ini masih dalam tahap **simulasi/prototype** — belum ada backend processing atau parsing Excel yang sesungguhnya. Format BKU Excel yang digunakan adalah file export dari ARKAS (Aplikasi Rencana Kegiatan dan Anggaran Sekolah) dengan struktur **single sheet** yang berisi **multiple repeating sections** (BKU-ALL) sepanjang tahun. Data BKU yang diupload akan disimpan di localStorage dan ditampilkan dalam tabel referensi dengan fitur filter bulanan dan integrasi dengan modul dokumen Makan & Minum (Mamin).

---

## 1. Lokasi File BKU Excel

File template BKU Excel berada di folder `template-data/` dengan nama:

```
Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx
```

File ini adalah export dari ARKAS untuk tahun 2026 dengan NPSN `20205293` (SD Negeri Pasirhalang).

---

## 2. Struktur Format BKU Excel (Corrected)

Berdasarkan analisis mendalam file Excel, struktur BKU dari ARKAS memiliki format sebagai berikut:

### 2.1 Sheet Structure

- **Satu sheet saja**: `Page1`
- **Range**: A1:X365 (24 kolom, 365 baris)
- **Tidak ada multiple sheets** — semua data dalam satu sheet

### 2.2 Pattern Section yang Berulang

File BKU terdiri dari **multiple repeating sections** yang pola nya sama:

```
┌─────────────────────────────────────────────────────────────┐
│ SECTION HEADER                                              │
│ "BKU-ALL Tahun 2026 - NPSN : 20205293,                      │
│  Nama Sekolah : SD NEGERI PASIRHALANG"                      │
├─────────────────────────────────────────────────────────────┤
│ COLUMN NUMBER ROW (PEMBATAS - HARUS DILEWATI)               │
│ "1" (col A) | "2" (col D) | "3" (col G) | "4" (col H/I)    │
├─────────────────────────────────────────────────────────────┤
│ DATA ROWS (transaksi bulanan)                               │
│ TANGGAL | KODE KEGIATAN | KODE REKENING | NO.BUKTI | URAIAN │
│ PENERIMAAN | PENGELUARAN | SALDO                            │
└─────────────────────────────────────────────────────────────┘
```

**PEMBATAS (separator rows) yang harus dilewati:**
- Baris dengan teks "BKU-ALL Tahun 2026 - NPSN : ..." → **SECTION HEADER**
- Baris dengan angka "1", "2", "3", "4" di kolom A, D, G, H → **COLUMN NUMBER ROW (pembatas)**

### 2.3 Kolom Data yang Benar

Setelah melewati pembatas, data transaksi berada di kolom-kolom berikut:

| No | Kolom Excel | Nama Field | Contoh Data |
|----|-------------|------------|-------------|
| 1 | A | TANGGAL | `09-02-2026`, `10-04-2026` |
| 2 | D | KODE KEGIATAN | `07.12.01.`, `03.03.19.`, `06.05.08.` |
| 3 | G | KODE REKENING | `5.1.02.02.01.0013`, `5.1.02.01.01.0024` |
| 4 | H / I | NO. BUKTI | `BBU01`, `BNU01`, `BPU01` |
| 5 | K | URAIAN | `Terima Dana BOSP Tahap 1 2026`, `Vani (0162778679230113)` |
| 6 | N | PENERIMAAN | `82.560.000`, `0` |
| 7 | Q | PENGELUARAN | `1.000.000`, `700.000` |
| 8 | T | SALDO | `82.560.000`, `81.560.000` |

**Catatan penting:**
- Kolom B, C, E, F, J, L, M, O, P, R, S, U, V, W, X **kosong** (tidak digunakan)
- Format angka: **Indonesian format** dengan titik sebagai pemisah ribuan (contoh: `82.560.000`)
- Format tanggal: **DD-MM-YYYY**

### 2.4 Contoh Data Transaksi

```
Row 19: 09-02-2026 | 03.03.19. | 5.1.02.02.01.0037 | BNU03 | Herman | 0 | 700.000 | 77.160.000
Row 22: 09-02-2026 | 07.12.01. | 5.1.02.02.01.0013 | BBU01 | Terima Dana BOSP Tahap 1 2026 | 82.560.000 | 0 | 82.560.000
Row 30: 09-02-2026 | 06.07.05. | 5.1.02.02.01.0063 | BNU10 | Beban Kursus Singkat/Pelatihan | 0 | 300.000 | 69.460.000
```

### 2.5 Kode Kegiatan yang Muncul

| Kode Kegiatan | Frekuensi | Jenis Transaksi |
|---------------|-----------|-----------------|
| `07.12.01.` | Tinggi | Honorarium (Guru, Tendik) |
| `03.03.19.` | Tinggi | Honor Penjaga, PPh 21 |
| `06.05.08.` | Tinggi | ATK, Alat Tulis Kantor |
| `06.07.05.` | Sedang | Pulsa Internet |
| `06.07.01.` | Sedang | Honor Tenaga Perpustakaan |
| `04.06.13.` | Sedang | Beban Makanan & Minuman |
| `05.02.03.` | Sedang | Beban Tagihan Listrik |
| `08.04.13.` | Rendah | Beban Makanan & Minuman Rapat |

### 2.6 Kode Rekening yang Muncul

| Kode Rekening | Fungsi |
|---------------|--------|
| `5.1.02.02.01.0013` | Honorarium Guru/Tendik |
| `5.1.02.02.01.0037` | Honor Penjaga |
| `5.1.02.02.01.0061` | Honor Tenaga Perpustakaan |
| `5.1.02.02.01.0063` | Pulsa Internet |
| `5.1.02.01.01.0024` | Alat Tulis Kantor (ATK) |
| `5.1.02.01.01.0025` | Bahan Cetak |
| `5.1.02.01.01.0052` | Beban Makanan & Minuman |
| `5.1.02.02.12.0001` | Pengeluaran Lainnya |
| `5.2.05.01.01.0001` | Beban Tagihan Listrik |

---

## 3. Implementasi Fitur Upload BKU di Aplikasi

### 3.1 Komponen BKUPage.jsx

Fitur upload BKU diimplementasikan di `spj-frontend/src/pages/dashboard/BKUPage.jsx` dengan karakteristik:

**Status: PROTOTYPE / SIMULASI**
- Belum ada parsing Excel yang sesungguhnya
- DataBK U masih menggunakan `MOCK_BKU` (hardcoded)
- Upload button hanya menampilkan toast simulasi

**Fitur yang ada:**
1. **Upload Area** - Drag & drop atau klik untuk pilih file Excel (.xlsx)
2. **Summary Cards** - Menampilkan Total Penerimaan, Total Pengeluaran, Saldo Akhir
3. **Reference Table** - Tabel data BKU dengan kolom: No, Tanggal, Uraian, Kode, Debet, Kredit, Saldo, Aksi
4. **Filter Bulanan** - Dropdown filter untuk bulan (Januari-Juni)
5. **Mamin Integration** - Untuk transaksi "Makan & Minum", ada tombol aksi untuk melihat dokumen SPJ yang diperlukan

### 3.2 Data Storage

Data BKU disimpan menggunakan `storageHelper` (localStorage):

```javascript
// Key: 'spj_bku_reference'
// Value: Array of BKU items
storageHelper.set('bku_reference', MOCK_BKU)
```

Struktur data BKU:

```javascript
{
  id: 1,
  tanggal: '02 Jan 2024',
  uraian: 'Saldo Awal Tahun 2024',
  kode: '4.2.1.01.01',
  debet: 85000000,
  kredit: 0,
  saldo: 85000000
}
```

### 3.3 Integrasi dengan Modul Lain

**DokumenSPJPage.jsx:**
- BKU Utama adalah salah satu dokumen type yang tersedia
- Filter "BKU Utama" digunakan untuk menampilkan dokumen terkait

**PengaturanPage.jsx:**
- Ada fitur "Export BKU Saja" yang masih dalam tahap pengembangan
- Download data BKU per periode (.xlsx)

**LandingPage.jsx:**
- Menampilkan fitur "Manajemen BKU" sebagai salah satu fitur utama aplikasi

---

## 4. Alur Upload BKU (Current Implementation)

```
User akses /dashboard/bku
    ↓
Upload Area (drag & drop / klik)
    ↓
[Simulasi] Toast success "File BKU berhasil diupload"
    ↓
Data ditampilkan dari MOCK_BKU (localStorage)
    ↓
Summary Cards (Total Debet, Total Kredit, Saldo Akhir)
    ↓
Reference Table dengan filter bulanan
    ↓
Untuk transaksi Mamin → Menu aksi dokumen SPJ
```

---

## 5. Format File BKU yang Diharapkan (Corrected)

Berdasarkan analisis file Excel ARKAS, format yang diharapkan untuk upload:

### 5.1 Struktur Umum

- **Satu sheet**: `Page1`
- **Range**: A1:X365
- **Multiple sections** yang berulang dengan pattern:
  1. Section header: "BKU-ALL Tahun [YYYY] - NPSN : [NPSN], Nama Sekolah : [Nama]"
  2. Column number row: "1" | "2" | "3" | "4" (pembatas, harus dilewati)
  3. Data rows: TANGGAL | KODE KEGIATAN | KODE REKENING | NO.BUKTI | URAIAN | PENERIMAAN | PENGELUARAN | SALDO

### 5.2 Kolom Data

| Kolom | Field | Tipe | Contoh |
|-------|-------|------|--------|
| A | TANGGAL | Date (DD-MM-YYYY) | `09-02-2026` |
| D | KODE KEGIATAN | String (XX.XX.XX.) | `07.12.01.` |
| G | KODE REKENING | String (X.X.XX.XX.XXXX) | `5.1.02.02.01.0013` |
| H/I | NO. BUKTI | String | `BBU01`, `BNU01` |
| K | URAIAN | String | `Terima Dana BOSP Tahap 1 2026` |
| N | PENERIMAAN | Number (Indonesian format) | `82.560.000` |
| Q | PENGELUARAN | Number (Indonesian format) | `1.000.000` |
| T | SALDO | Number (Indonesian format) | `82.560.000` |

### 5.3 Baris yang Harus Dilewati (PEMBATAS)

Saat parsing Excel, baris berikut harus **dilewati**:

1. **Section Header Row**: Baris yang contains "BKU-ALL Tahun" + NPSN + Nama Sekolah
2. **Column Number Row**: Baris yang contains angka "1", "2", "3", "4" di kolom A, D, G, H
3. **Empty Rows**: Baris yang semua kolom kosong

### 5.4 Pattern Deteksi Section Baru

```javascript
function isSectionHeader(row) {
  return row[0].toString().includes('BKU-ALL Tahun')
}

function isColumnNumberRow(row) {
  return row[0] === '1' && row[3] === '2' && row[6] === '3' && row[7] === '4'
}

function isValidDataRow(row) {
  return row[0] && row[0].toString().match(/\d{2}-\d{2}-\d{4}/)
}
```

---

## 6. Kebutuhan Pengembangan

### 6.1 Excel Parser

Untuk parsing file BKU Excel yang sebenarnya, dibutuhkan:

1. **Library**: `xlsx` (SheetJS) atau `exceljs` untuk membaca file Excel di browser
2. **Sheet Detection**: Mengidentifikasi sheet `Page1`
3. **Section Detection**: Skip baris pembatas (BKU-ALL header + column number row)
4. **Data Extraction**: Parse transaksi dari kolom A, D, G, H/I, K, N, Q, T
5. **Date Parsing**: Parse format `DD-MM-YYYY`
6. **Number Parsing**: Parse format Indonesia (`82.560.000` → `82560000`)
7. **Validation**: Validasi struktur file sesuai format ARKAS

### 6.2 Backend Integration

Saat ini tidak ada backend untuk handle upload BKU. Perlu:

1. **API Endpoint**: POST `/api/bku/upload` untuk upload file
2. **File Storage**: Simpan file Excel di server
3. **Data Extraction**: Parse Excel di backend (Node.js dengan `exceljs` atau Python dengan `openpyxl`)
4. **Database Schema**: Tabel untuk menyimpan data BKU
5. **Validation**: Validasi format dan integritas data

### 6.3 Enhanced Features

1. **Preview before upload** - Tampilkan preview data sebelum disimpan
2. **Error handling** - Validasi format dan tampilkan error yang jelas
3. **Duplicate detection** - Cek apakah BKU sudah pernah diupload
4. **Period selection** - Pilih bulan/tahun BKU yang diupload
5. **Export functionality** - Download BKU yang sudah diupload

---

## 7. Referensi ke Fitur Lain

### 7.1 Template Engine

BKU yang diupload akan menjadi referensi untuk:
- Pembuatan dokumen SPJ (K7, BKU, Pajak)
- Bukti fisik transaksi
- Validasi data realisasi

### 7.2 Mamin Integration

Transaksi dengan uraian "Makan dan Minum" di BKU akan terintegrasi dengan modul Mamin:
- Mamin Rapat
- Mamin Kegiatan
- Mamin Tamu

Setiap jenis Mamin memiliki dokumen yang diperlukan:
- Surat Undangan
- Daftar Hadir
- Resume Kegiatan
- Foto Kegiatan

---

## 8. Kesimpulan

Fitur upload BKU di aplikasi SPJ saat ini berada pada tahap **prototype** dengan karakteristik:

✅ **Yang sudah ada:**
- UI upload dengan drag & drop
- Tabel referensi BKU dengan summary cards
- Filter bulanan
- Integrasi dengan modul Mamin
- localStorage untuk penyimpanan sementara

⚠️ **Yang belum ada:**
- Parsing Excel yang sesungguhnya
- Backend API untuk upload
- Database storage
- Validasi format BKU
- Export functionality

📋 **Format BKU Excel** mengikuti standar ARKAS dengan struktur:
- **Satu sheet** (`Page1`)
- **Multiple repeating sections** (BKU-ALL headers) yang harus dilewati saat parsing
- **Kolom data**: TANGGAL (A), KODE KEGIATAN (D), KODE REKENING (G), NO.BUKTI (H/I), URAIAN (K), PENERIMAAN (N), PENGELUARAN (Q), SALDO (T)
- **Pembatas**: Section header rows + column number rows (1,2,3,4) harus dilewati
- Format tanggal: `DD-MM-YYYY`, Currency: format Indonesia (`82.560.000`)

---

## Sources

1. `D:\project\spj-app\template-data\Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx` — File BKU Excel asli dari ARKAS (single sheet, multiple sections)
2. `D:\project\spj-app\spj-frontend\src\pages\dashboard\BKUPage.jsx` — Implementasi UI upload BKU
3. `D:\project\spj-app\spj-frontend\src\utils\storageHelper.js` — Helper untuk localStorage
4. `D:\project\spj-app\PRD_IMPLEMENTASI.md` — PRD implementasi aplikasi SPJ
5. `D:\project\spj-app\template\ANALISIS_TEMPLATE.md` — Analisis template dokumen SPJ

---

## Methodology

Analisis dilakukan dengan membaca dan meneliti:
- File Excel BKU asli dari ARKAS (membaca struktur sheet, header, dan data transaksi secara menyeluruh)
- Source code komponen BKUPage.jsx untuk memahami implementasi UI
- storageHelper.js untuk memahami cara penyimpanan data
- PRD dan dokumentasi proyek untuk konteks aplikasi

Sub-questions yang diselidiki:
1. Apa struktur sebenarnya dari file BKU Excel ARKAS?
2. Bagaimana pattern repeating sections (BKU-ALL) bekerja?
3. Kolom mana saja yang berisi data transaksi?
4. Baris mana yang harus dilewati (pembatas) saat parsing?
5. Bagaimana implementasi fitur upload BKU di aplikasi?
