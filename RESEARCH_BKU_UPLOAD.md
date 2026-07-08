# Research Report: Fitur Upload BKU di Aplikasi SPJ
*Generated: 2026-07-08 | Updated: 2026-07-08 | Sources: 6 | Confidence: Very High*

---

## Executive Summary

Fitur upload BKU (Buku Kas Umum) di aplikasi SPJ merupakan komponen penting yang berfungsi sebagai referensi data untuk pembuatan dokumen SPJ dan bukti fisik. Saat ini fitur ini masih dalam tahap **simulasi/prototype** — belum ada backend processing atau parsing Excel yang sesungguhnya. Format BKU Excel yang digunakan adalah file export dari **ARKAS** (Aplikasi Rencana Kegiatan dan Anggaran Sekolah) dengan struktur **single sheet (`Page1`)** yang berisi **10 halaman BKU-ALL** (multiple repeating sections) sepanjang tahun. Data BKU yang diupload akan disimpan di localStorage dan ditampilkan dalam tabel referensi dengan fitur filter bulanan dan integrasi dengan modul dokumen Makan & Minum (Mamin).

> ⚠️ **Catatan Revisi:** Dokumen ini telah diperbarui berdasarkan analisis mendalam terhadap file Excel asli. Koreksi utama ada pada **mapping kolom** (KODE REKENING di kolom **F**, bukan G; NO. BUKTI di kolom **I**, bukan H/I) dan penambahan dokumentasi **header informasi sekolah** dan **footer signature**.

---

## 1. Lokasi File BKU Excel

File template BKU Excel berada di folder `template-data/` dengan nama:

```
Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx
```

File ini adalah export dari ARKAS untuk tahun 2026 dengan NPSN `20205293` (SD Negeri Pasirhalang, Kec. Cikalongwetan, Kab. Bandung Barat, Prov. Jawa Barat).

---

## 2. Struktur Lengkap File BKU Excel

### 2.1 Informasi Dasar

| Atribut | Nilai |
|---------|-------|
| Sheet | `Page1` (1 sheet) |
| Range | **A1:X365** (24 kolom, 365 baris) |
| Total Sections | **10 section** BKU-ALL (halaman 1-10) |
| Total Transaksi | **277 transaksi** |
| Sekolah | SD NEGERI PASIRHALANG |
| NPSN | 20205293 |
| Tahun | 2026 |

### 2.2 Struktur Berlapis File

File memiliki **3 area utama**:

```
┌─────────────────────────────────────────────────────┐
│ AREA 1: HEADER INFORMASI SEKOLAH (Row 1-14)         │
│   - Judul: BUKU KAS UMUM TAHUNAN                     │
│   - Tahun, NPSN, Nama Sekolah, Alamat, Kab/Kota, Prov│
├─────────────────────────────────────────────────────┤
│ AREA 2: DATA TRANSAKSI (Row 15-339)                 │
│   - Header kolom (Row 15)                           │
│   - Nomor kolom (Row 16): 1(A) 2(D) 3(F) 4(H) ...  │
│   - Data transaksi (Row 17+)                        │
│   - Diikuti 10 section BKU-ALL berulang             │
├─────────────────────────────────────────────────────┤
│ AREA 3: FOOTER / PENUTUP (Row 340-365)              │
│   - Summary transaksi akhir (PPh, Bunga)             │
│   - Closing statement & saldo penutup                │
│   - Tanda tangan Kepala Sekolah & Bendahara          │
│   - Tanggal & tempat penutupan buku                  │
└─────────────────────────────────────────────────────┘
```

---

## 3. AREA 1: Header Informasi Sekolah (Row 1-14)

Sebelum data transaksi, terdapat header informasi sekolah:

```
Row 1:  B U K U   K A S   U M U M   T A H U N A N
Row 2:  [kosong]
Row 3:  TAHUN : 2026
Row 4:  BKU-ALL                    (kolom S)
Row 5:  NPSN                       → : 20205293       (kolom E)
Row 6:  [kosong]
Row 7:  Nama Sekolah               → : SD NEGERI PASIRHALANG
Row 8:  [kosong]
Row 9:  Alamat                     → : Kp. Pasirhalang RT.03 RW.14, Kec. Cikalongwetan
Row 10: [kosong]
Row 11: Kabupaten/Kota             → : Kab. Bandung Barat
Row 12: [kosong]
Row 13: Provinsi                   → : Prov. Jawa Barat
Row 14: [kosong]
```

**Untuk parsing:** Info sekolah bisa diekstrak dari kolom A (label) dan E (value) pada baris 5-13.

---

## 4. AREA 2: Data Transaksi & Repeating Sections

### 4.1 Header Kolom (Row 15)

| Kolom | Header Label | Deskripsi |
|-------|-------------|-----------|
| A | `TANGGAL` | Tanggal transaksi |
| D | `KODE KEGIATAN` | Kode kegiatan ARKAS |
| F | `KODE REKENING` | Kode rekening |
| I | `NO. BUKTI` | Nomor bukti transaksi |
| K | `URAIAN` | Uraian transaksi (⚠️ Header label di kolom **J**, data di **K**) |
| N | `PENERIMAAN` | Penerimaan (debit) |
| Q | `PENGELUARAN` | Pengeluaran (kredit) |
| T | `SALDO` | Saldo setelah transaksi |

### 4.2 Row Nomor Kolom (Row 16)

Baris ini berfungsi sebagai **separator / pembatas** yang harus dilewati saat parsing:

```
A16 = 1    (Tanggal)
D16 = 2    (Kode Kegiatan)
F16 = 3    (Kode Rekening)    ← KOREKSI: bukan G
H16 = 4    (No. Bukti)
J16 = 5    (Uraian)
N16 = 6    (Penerimaan)
Q16 = 7    (Pengeluaran)
T16 = 8    (Saldo)
```

> ⚠️ **Koreksi dari versi sebelumnya:** Ada **8 angka (1-8)**, bukan 4. Posisi 3 ada di **kolom F**, bukan G. Posisi 4 di **kolom H**, dan ada angka 5,6,7,8 untuk kolom J, N, Q, T.

### 4.3 Mapping Kolom Lengkap (YANG BENAR)

| Data | Kolom | Header | Num | Tipe Data | Contoh |
|------|-------|--------|-----|-----------|--------|
| TANGGAL | **A** | TANGGAL | 1 | String `DD-MM-YYYY` | `"01-01-2026"` |
| (signature) | **B** | - | - | String | TTD Kepala Sekolah |
| (closing) | **C** | - | - | String | Closing statement |
| KODE KEGIATAN | **D** | KODE KEGIATAN | 2 | String `XX.XX.XX.` | `"07.12.01."` |
| (info) | **E** | - | - | String | Nama Sekolah dll |
| **KODE REKENING** | **F** 🔴 | KODE REKENING | **3** | String | `"5.1.02.02.01.0013"` |
| (kosong) | **G** | - | - | - | Format Rp. 0 |
| (kosong) | **H** | NO. BUKTI | 4 | - | (hanya angka 4) |
| **NO. BUKTI** | **I** 🔴 | NO. BUKTI | - | String | `"BBU01"`, `"BNU01"` |
| (kosong) | **J** | URAIAN | 5 | - | (hanya label) |
| **URAIAN** | **K** | - | - | String | `"Terima Dana BOSP..."` |
| URAIAN (lanj.) | **L** | - | - | - | (kosong) |
| (signature) | **M** | - | - | String | TTD Bendahara |
| **PENERIMAAN** | **N** | PENERIMAAN | **6** | Number | `82560000` |
| (kosong) | **O** | - | - | - | (kosong) |
| (page num) | **P** | - | - | String | `"Halaman 1 dari 10"` |
| **PENGELUARAN** | **Q** | PENGELUARAN | **7** | Number | `1000000` |
| (kosong) | **R** | - | - | - | (kosong) |
| (label) | **S** | - | - | String | `"BKU-ALL"` |
| **SALDO** | **T** | SALDO | **8** | Number | `82560000` |
| (kosong) | **U-W** | - | - | - | (kosong) |
| (kosong) | **X** | - | - | - | (kosong) |

🔴 = **Koreksi kritis dari versi research sebelumnya**

### 4.4 Pattern Repeating Sections (BKU-ALL)

File memiliki **10 section** yang masing-masing diawali header BKU-ALL:

| Section | Header Row | Halaman | Rentang Data |
|---------|-----------|---------|-------------|
| 1 | Row 41 | Halaman 1 | Row 43-77 |
| 2 | Row 78 | Halaman 2 | Row 80-113 |
| 3 | Row 114 | Halaman 3 | Row 116-150 |
| 4 | Row 151 | Halaman 4 | Row 153-187 |
| 5 | Row 188 | Halaman 5 | Row 190-224 |
| 6 | Row 225 | Halaman 6 | Row 227-261 |
| 7 | Row 262 | Halaman 7 | Row 264-298 |
| 8 | Row 299 | Halaman 8 | Row 301-335 |
| 9 | Row 336 | Halaman 9 | Row 338-364 |
| 10 | Row 365 | Halaman 10 | (halaman terakhir kosong) |

Setiap section memiliki struktur:
```
Row N:   BKU-ALL Tahun 2026 - NPSN : 20205293, Nama Sekolah : SD NEGERI PASIRHALANG
Row N+1: [kosong]
Row N+2: 1 (A) | 2 (D) | 3 (F) | 4 (H) | 5 (J) | 6 (N) | 7 (Q) | 8 (T)   ← PEMBATAS
Row N+3 dst: Data transaksi
```

### 4.5 Contoh Data Transaksi Aktual

```
Row 17: 01-01-2026 | -          | -           | -     | Saldo Bank Bulan Desember 2025     | 0           | 0           | 0
Row 18: 01-01-2026 | -          | -           | -     | Saldo Tunai Bulan Desember 2025    | 0           | 0           | 0
Row 19: 20-01-2026 | -          | -           | BBU01 | Terima Dana BOSP Tahap 1 2026      | 82.560.000  | 0           | 82.560.000
Row 20: 31-01-2026 | -          | -           | -     | Bunga Bank                         | 0           | 0           | 82.560.000
Row 22: 09-02-2026 | 07.12.01.  | 5.1.02.02.01.0013 | BNU01 | Vani (0162778679230113)          | 0           | 1.000.000   | 81.560.000
Row 26: 09-02-2026 | 07.12.02.  | 5.1.02.02.01.0013 | BNU03 | Herman                           | 0           | 700.000     | 77.860.000
Row 30: 09-02-2026 | 03.03.19.  | 5.1.02.02.01.0037 | BNU04 | Pendaftaran Lomba-lomba O2SN      | 0           | 1.250.000   | 75.910.000
```

### 4.6 Deteksi Baris yang Harus Dilewati (PEMBATAS)

```javascript
// 1. SECTION HEADER
function isSectionHeader(row) {
  return row[0] && row[0].toString().includes('BKU-ALL Tahun')
}

// 2. COLUMN NUMBER ROW (8 angka: 1-8)
function isColumnNumberRow(row) {
  return row[0] === 1 && row[3] === 2 && row[5] === 3 && row[7] === 4
      && row[9] === 5 && row[13] === 6 && row[16] === 7 && row[19] === 8
}

// 3. HEADER INFO ROWS (1-14)
function isInfoHeaderRow(row) {
  const rowNum = /* row index */;
  return rowNum >= 1 && rowNum <= 14;
}

// 4. VALID DATA ROW (memiliki tanggal)
function isValidDataRow(row) {
  return row[0] && typeof row[0] === 'string' && row[0].match(/^\d{2}-\d{2}-\d{4}$/)
}
```

---

## 5. AREA 3: Footer / Penutup (Row 340-365)

### 5.1 Struktur Footer

```
Row 340-343: Transaksi final (PPh 23, Bunga Bank, Pajak Bunga)
Row 344-345: [kosong]
Row 346:     "Pada hari ini Tuesday, July 7, 2026 Buku Kas Umum ditutup..."
             (kolom C)
Row 347:     [kosong]
Row 348:     "Saldo Buku Kas Umum" (kolom C)
Row 349:     "Terdiri Dari :" (kolom C)
Row 350-351: Saldo Bank = Rp. 0   (kolom G)
Row 352-353: Saldo Tunai = Rp. 0  (kolom G)
Row 354:     [kosong]
Row 355:     [Total penerimaan & pengeluaran summary]
Row 356-357: [kosong]
Row 358:     "Cikalongwetan, 07 July 2026" (kolom C)
Row 359:     "Bendahara," (kolom M)
Row 360:     [kosong]
Row 361:     "Ahmad" (kolom M)
Row 362:     "NIP. 196805251992121003" (kolom M)
Row 363-364: [kosong]
Row 365:     Header BKU-ALL + "Halaman 10 dari 10"
```

### 5.2 Signature Blocks

| Posisi | Kolom | Isi |
|--------|-------|-----|
| Kepala Sekolah | **B** (Row 358-362) | `"Menyetujui,\nKepala Sekolah"` → Yuniarti → NIP. 196607071986102005 |
| Bendahara | **M** (Row 358-362) | `"Cikalongwetan, 07 July 2026\nBendahara,"` → Ahmad → NIP. 196805251992121003 |

---

## 6. Analisis Data Transaksi

### 6.1 Kode Kegiatan Terbanyak

| Kode Kegiatan | Frekuensi | Deskripsi |
|---------------|-----------|-----------|
| `05.02.03.` | **73x** | Beban Tagihan Listrik |
| `03.03.19.` | **41x** | Honor Penjaga, PPh 21 |
| `03.03.18.` | **39x** | Honor Pegawai |
| `06.05.08.` | **21x** | ATK, Alat Tulis Kantor |
| `07.12.01.` | **20x** | Honorarium Guru |
| `06.07.05.` | **11x** | Pulsa Internet |
| `04.06.13.` | **10x** | Beban Makanan & Minuman |
| `06.07.01.` | **8x** | Honor Tenaga Perpustakaan |
| `07.12.02.` | **7x** | Honorarium Tendik |
| `08.04.13.` | **6x** | Beban Makanan & Minuman Rapat |
| Lainnya | **~41x** | 20 kode kegiatan lainnya |

### 6.2 Kode Rekening Terbanyak

| Kode Rekening | Frekuensi | Fungsi |
|---------------|-----------|--------|
| `5.2.05.01.01.0001` | **73x** | Beban Tagihan Listrik |
| `5.1.02.02.01.0037` | **47x** | Honor Penjaga |
| `5.1.02.02.01.0013` | **37x** | Honorarium Guru/Tendik |
| `5.1.02.01.01.0024` | **21x** | Alat Tulis Kantor (ATK) |
| `5.1.02.02.01.0063` | **11x** | Pulsa Internet |
| `5.1.02.01.01.0052` | **10x** | Beban Makanan & Minuman |
| `5.1.02.02.01.0061` | **8x** | Honor Tenaga Perpustakaan |
| `5.1.02.02.12.0001` | **7x** | Pengeluaran Lainnya |
| `5.1.02.01.01.0025` | **6x** | Bahan Cetak |
| `5.1.02.02.01.0053` | **5x** | Honor Narasumber |
| Lainnya | **~8x** | 8 kode rekening lainnya |

### 6.3 Pola Nomor Bukti

| Prefix | Jenis | Contoh |
|--------|-------|--------|
| **BBU** | **B**ank **B**uku **U**mum | BBU01 (Terima Dana BOSP) |
| **BNU** | **B**ank **N**on **U**mum (Pengeluaran) | BNU01-BNU72 |
| **BPU** | **B**ank **P**ajak **U**mum | BPU01 (Setor Pajak) |

### 6.4 Format Data Penting

| Field | Format | Contoh | Cara Parse |
|-------|--------|--------|-----------|
| Tanggal | **String** `DD-MM-YYYY` | `"20-01-2026"` | Baca langsung sebagai string, parse dengan regex |
| Kode Kegiatan | **String** `XX.XX.XX.` | `"07.12.01."` | Baca langsung |
| Kode Rekening | **String** | `"5.1.02.02.01.0013"` | Baca langsung |
| No. Bukti | **String** | `"BBU01"` | Baca langsung |
| **Penerimaan/Pengeluaran/Saldo** | **Number (Integer)** 🔴 | `82560000` | **Langsung sebagai number, bukan string format Indonesia!** |

> ⚠️ **Koreksi penting:** Angka tersimpan sebagai **integer murni** (`82560000`), bukan string format Indonesia (`"82.560.000"`). Format tampilan titik adalah format cell Excel `#,##0;(#,##0)`. Saat parsing, angka bisa langsung digunakan tanpa perlu parse string.

---

## 7. Implementasi Fitur Upload BKU di Aplikasi

### 7.1 Komponen BKUPage.jsx

Fitur upload BKU diimplementasikan di `spj-frontend/src/pages/dashboard/BKUPage.jsx` dengan karakteristik:

**Status: PROTOTYPE / SIMULASI**
- Belum ada parsing Excel yang sesungguhnya
- Data BKU masih menggunakan `MOCK_BKU` (hardcoded)
- Upload button hanya menampilkan toast simulasi

**Fitur yang ada:**
1. **Upload Area** - Drag & drop atau klik untuk pilih file Excel (.xlsx)
2. **Summary Cards** - Menampilkan Total Penerimaan, Total Pengeluaran, Saldo Akhir
3. **Reference Table** - Tabel data BKU dengan kolom: No, Tanggal, Uraian, Kode, Debet, Kredit, Saldo, Aksi
4. **Filter Bulanan** - Dropdown filter untuk bulan (Januari-Juni)
5. **Mamin Integration** - Untuk transaksi "Makan & Minum", ada tombol aksi untuk melihat dokumen SPJ yang diperlukan

### 7.2 Data Storage

Data BKU disimpan menggunakan `storageHelper` (localStorage):

```javascript
storageHelper.set('bku_reference', MOCK_BKU)
```

---

## 8. Panduan Implementasi Excel Parser

### 8.1 Library

```bash
npm install xlsx    # atau
npm install exceljs
```

### 8.2 Algoritma Parsing

```
1. LOAD file Excel dengan xlsx/exceljs
2. SELECT sheet "Page1"
3. EXTRACT header sekolah (Row 5-13, kolom A & E):
   - NPSN, Nama Sekolah, Alamat, Kab/Kota, Provinsi
4. ITERATE semua row dari 15-365:
   a. SKIP row jika:
      - Row 1-14 (info header)
      - Row 16 (column number row)
      - Row berisi "BKU-ALL Tahun" (section header)
      - Row kosong
      - Row footer (≥340 atau mengandung "ditutup"/"Saldo")
   b. PARSE jika row memiliki tanggal valid (DD-MM-YYYY di kolom A):
      - tanggal = kolom A
      - kode_kegiatan = kolom D   (nullable)
      - kode_rekening = kolom F   (nullable)
      - no_bukti = kolom I        (nullable)
      - uraian = kolom K
      - penerimaan = kolom N      (number)
      - pengeluaran = kolom Q     (number)
      - saldo = kolom T           (number)
5. RETURN array of transaksi + info sekolah
```

### 8.3 Kode Referensi Parsing

```javascript
import * as XLSX from 'xlsx'

function parseBKUExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets['Page1']
      if (!sheet) return reject(new Error('Sheet Page1 tidak ditemukan'))
      
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      const transactions = []
      let sekolahInfo = {}
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 1
        
        // Ekstrak info sekolah dari header
        if (rowNum === 5 && row[0] === 'NPSN') sekolahInfo.npsn = row[4]
        if (rowNum === 7 && row[0] === 'Nama Sekolah') sekolahInfo.nama = row[4]
        
        // Skip: header info, section header, column number row, empty
        if (rowNum <= 14) continue
        if (row[0] && String(row[0]).includes('BKU-ALL Tahun')) continue
        if (row[0] === 1 && row[3] === 2) continue  // column number row
        if (!row[0] || !String(row[0]).match(/^\d{2}-\d{2}-\d{4}$/)) continue
        
        // Parse transaksi
        transactions.push({
          tanggal: row[0],                    // A
          kodeKegiatan: row[3] || null,        // D
          kodeRekening: row[5] || null,        // F
          noBukti: row[8] || null,             // I
          uraian: row[10] || '',               // K
          penerimaan: row[13] || 0,            // N
          pengeluaran: row[16] || 0,           // Q
          saldo: row[19] || 0,                 // T
        })
      }
      
      resolve({ sekolahInfo, transactions })
    }
    reader.readAsArrayBuffer(file)
  })
}
```

### 8.4 Validasi Struktur File

```javascript
function validateBKUFormat(rows) {
  const errors = []
  
  // Cek sheet Page1
  if (!rows || rows.length === 0) {
    errors.push('File kosong atau tidak dapat dibaca')
  }
  
  // Cek header kolom
  const headerRow = rows[14] // row 15 (0-indexed: 14)
  if (headerRow[0] !== 'TANGGAL' || headerRow[3] !== 'KODE KEGIATAN') {
    errors.push('Format header kolom tidak sesuai standar ARKAS')
  }
  
  // Cek ada data transaksi
  const dataRows = rows.filter(r => 
    r[0] && String(r[0]).match(/^\d{2}-\d{2}-\d{4}$/)
  )
  if (dataRows.length === 0) {
    errors.push('Tidak ditemukan data transaksi')
  }
  
  return errors
}
```

---

## 9. Kebutuhan Pengembangan

### 9.1 Excel Parser (Prioritas Tinggi)

| Item | Status | Keterangan |
|------|--------|------------|
| Library xlsx/exceljs | ⏳ Belum | Perlu instalasi |
| Sheet detection (Page1) | ✅ Siap | Mapping sudah benar |
| Section detection (skip BKU-ALL) | ✅ Siap | Pattern sudah benar |
| Column mapping (F=kode_rekening, I=no_bukti) | 🔴 Dikoreksi | Mapping sudah diperbaiki |
| Date parsing (DD-MM-YYYY) | ✅ Siap | String langsung |
| Number parsing (integer murni) | ✅ Siap | Tidak perlu parse format |
| Info sekolah extraction | ✅ Siap | Header row 5-13 |
| Footer/signature extraction | ➕ Baru | Bisa diekstrak untuk preview |

### 9.2 Backend Integration

Saat ini tidak ada backend untuk handle upload BKU. Perlu:

1. **API Endpoint**: POST `/api/bku/upload` untuk upload file
2. **File Storage**: Simpan file Excel di server
3. **Data Extraction**: Parse Excel di backend (Node.js dengan `xlsx`/`exceljs` atau Python dengan `openpyxl`)
4. **Database Schema**: Tabel untuk menyimpan data BKU (transaksi + info sekolah)
5. **Validation**: Validasi format dan integritas data

### 9.3 Enhanced Features

1. **Preview before upload** - Tampilkan preview data (termasuk info sekolah) sebelum disimpan
2. **Error handling** - Validasi format dan tampilkan error yang jelas
3. **Duplicate detection** - Cek apakah BKU sudah pernah diupload (berdasarkan NPSN + Tahun)
4. **Period selection** - Pilih bulan/tahun BKU yang diupload
5. **Export functionality** - Download BKU yang sudah diupload

---

## 10. Integrasi dengan Modul Lain

### 10.1 Template Engine

BKU yang diupload akan menjadi referensi untuk:
- Pembuatan dokumen SPJ (K7, BKU, Pajak)
- Bukti fisik transaksi
- Validasi data realisasi

### 10.2 Mamin Integration

Transaksi dengan kode kegiatan tertentu di BKU akan terintegrasi dengan modul Mamin:
- `04.06.13.` → Beban Makanan & Minuman
- `08.04.13.` → Beban Makanan & Minuman Rapat

Setiap jenis Mamin memiliki dokumen yang diperlukan:
- Surat Undangan
- Daftar Hadir
- Resume Kegiatan
- Foto Kegiatan

---

## 11. Kesimpulan

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

📋 **Format BKU Excel** mengikuti standar ARKAS dengan struktur telah dimapping dengan benar:

| Aspek | Detail |
|-------|--------|
| Sheet | `Page1` (1 sheet) |
| Range | A1:X365 |
| Sections | 10 BKU-ALL (halaman 1-10) |
| Header Sekolah | Row 1-14 (NPSN, Nama, Alamat, Kab/Kota, Prov) |
| Data Transaksi | ~277 transaksi |
| Footer | Row 340-365 (closing + signature) |
| **Tanggal** | **A** - String `DD-MM-YYYY` |
| **Kode Kegiatan** | **D** |
| **Kode Rekening** | **F** 🔴 |
| **No. Bukti** | **I** 🔴 |
| **Uraian** | **K** |
| **Penerimaan** | **N** - Integer |
| **Pengeluaran** | **Q** - Integer |
| **Saldo** | **T** - Integer |

---

## Sources

1. `template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx` — File BKU Excel asli dari ARKAS (analisis langsung dengan openpyxl)
2. `spj-frontend/src/pages/dashboard/BKUPage.jsx` — Implementasi UI upload BKU
3. `spj-frontend/src/utils/storageHelper.js` — Helper untuk localStorage
4. `PRD_IMPLEMENTASI.md` — PRD implementasi aplikasi SPJ
5. `template/ANALISIS_TEMPLATE.md` — Analisis template dokumen SPJ
6. Verifikasi lapangan: Python script dengan openpyxl untuk ekstraksi data Excel aktual

---

## Methodology

Analisis dilakukan dengan:
1. **Membaca file Excel asli** menggunakan Python openpyxl untuk ekstraksi data struktural
2. **Verifikasi setiap klaim** mapping kolom dengan data aktual dari file
3. **Dokumentasi header dan footer** yang sebelumnya tidak tercatat
4. **Cross-reference** dengan source code aplikasi dan PRD

**Change log:**
- **v2 (2026-07-08):** Koreksi mapping kolom (KODE REKENING = F, NO. BUKTI = I), penambahan header info sekolah, footer signature, format angka integer, column number pattern 1-8
