# Konsep Arsitektur: Excel Parser Frontend vs Backend API BKU

> **Lampiran Riset:** Dokumen ini menjelaskan dua pendekatan arsitektur untuk fitur Upload BKU di Aplikasi LPJ BOS/BOSP.
>
> **Referensi:** `RESEARCH_BKU_UPLOAD.md` — Riset mendalam struktur file BKU Excel dari ARKAS

---

## Daftar Isi

- [1. Latar Belakang](#1-latar-belakang)
- [2. Konsep 1: Excel Parser Frontend](#2-konsep-1-excel-parser-frontend)
  - [2.1 Definisi](#21-definisi)
  - [2.2 Alur Kerja](#22-alur-kerja)
  - [2.3 Contoh Implementasi](#23-contoh-implementasi)
  - [2.4 Kelebihan & Kekurangan](#24-kelebihan--kekurangan)
- [3. Konsep 2: Backend API BKU](#3-konsep-2-backend-api-bku)
  - [3.1 Definisi](#31-definisi)
  - [3.2 Alur Kerja](#32-alur-kerja)
  - [3.3 Arsitektur API](#33-arsitektur-api)
  - [3.4 Kelebihan & Kekurangan](#34-kelebihan--kekurangan)
- [4. Perbandingan Langsung](#4-perbandingan-langsung)
- [5. Strategi Implementasi Bertahap](#5-strategi-implementasi-bertahap)
- [6. Rekomendasi untuk Aplikasi Ini](#6-rekomendasi-untuk-aplikasi-ini)
- [7. Referensi](#7-referensi)

---

## 1. Latar Belakang

Fitur Upload BKU adalah komponen yang memungkinkan operator sekolah mengunggah file **Buku Kas Umum (BKU)** — yang diekspor dari aplikasi **ARKAS** dalam format `.xlsx` — kemudian data transaksi di dalamnya digunakan sebagai referensi untuk pembuatan dokumen LPJ dan bukti fisik.

Dalam pengembangannya, ada **dua pendekatan arsitektur** yang bisa dipilih:

| Pendekatan | Lokasi Parsing | Storage | Kapan Cocok |
|------------|---------------|---------|-------------|
| **Excel Parser Frontend** | Browser (JavaScript) | localStorage / IndexedDB | Prototype, single-user, offline |
| **Backend API BKU** | Server (Node.js/Python) | Database (MySQL/PostgreSQL) | Produksi, multi-user, kolaborasi |

Kedua pendekatan ini **tidak mutually exclusive**. Aplikasi bisa memulai dengan frontend parser untuk rapid prototyping, lalu bertahap migrasi ke backend API untuk production.

---

## 2. Konsep 1: Excel Parser Frontend

### 2.1 Definisi

**Excel Parser Frontend** adalah proses membaca dan mengurai (parse) file Excel langsung di **browser pengguna** menggunakan **JavaScript**. Seluruh proses — dari upload hingga penyimpanan — terjadi di sisi klien tanpa melibatkan server.

### 2.2 Alur Kerja

```
┌──────────────────────────────────────────────────────────┐
│                  BROWSER (Frontend)                       │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Upload   │───►│ FileReader   │───►│ Library       │  │
│  │ File     │    │ (baca file)  │    │ xlsx/exceljs  │  │
│  │ .xlsx    │    │              │    │ (parse Excel)  │  │
│  └──────────┘    └──────────────┘    └───────┬───────┘  │
│                                                │         │
│                                                ▼         │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │ Tampilkan│◄───│ localStorage │◄───│ Mapping       │  │
│  │ Tabel    │    │ simpan data  │    │ kolom →       │  │
│  │ Referensi│    │ sebagai JSON │    │ array object  │  │
│  └──────────┘    └──────────────┘    └───────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Langkah detail:**

1. **User memilih file** `.xlsx` melalui `<input type="file">` atau drag & drop
2. **FileReader API** membaca file sebagai `ArrayBuffer`
3. **Library parsing** (misal `xlsx`) mengkonversi binary Excel ke JSON
4. **Mapping kolom** sesuai format ARKAS:
   - Tanggal → kolom A
   - Kode Kegiatan → kolom D
   - Kode Rekening → kolom F
   - No. Bukti → kolom I
   - Uraian → kolom K
   - Penerimaan → kolom N
   - Pengeluaran → kolom Q
   - Saldo → kolom T
5. **Filter data valid** — skip section header, column number row, footer
6. **Simpan ke localStorage** sebagai JSON string
7. **Render tabel** referensi di halaman

### 2.3 Contoh Implementasi

```javascript
import * as XLSX from 'xlsx'

/**
 * Parse file Excel BKU langsung di browser
 * @param {File} file - File .xlsx dari input upload
 * @returns {Promise<{sekolahInfo: object, transactions: array}>}
 */
function parseBKUExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        // 1. Baca file sebagai binary
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // 2. Ambil sheet "Page1" (format ARKAS)
        const sheet = workbook.Sheets['Page1']
        if (!sheet) return reject(new Error('Sheet Page1 tidak ditemukan'))

        // 3. Konversi ke array of arrays (baris × kolom)
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        const transactions = []
        let sekolahInfo = {}

        // 4. Iterasi setiap baris
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          const rowNum = i + 1 // 1-indexed

          // Ekstrak info sekolah dari header (Row 5-13)
          if (rowNum === 5 && row[0] === 'NPSN') sekolahInfo.npsn = row[4]
          if (rowNum === 7 && row[0] === 'Nama Sekolah') sekolahInfo.nama = row[4]
          if (rowNum === 9 && row[0] === 'Alamat') sekolahInfo.alamat = row[4]

          // Skip baris yang tidak perlu
          if (rowNum <= 14) continue
          if (String(row[0] || '').includes('BKU-ALL Tahun')) continue
          if (row[0] === 1 && row[3] === 2) continue // column number row
          if (!row[0] || !String(row[0]).match(/^\d{2}-\d{2}-\d{4}$/)) continue

          // Parse transaksi dengan mapping kolom yang sudah diverifikasi
          transactions.push({
            tanggal: row[0],                    // A - String DD-MM-YYYY
            kodeKegiatan: row[3] || null,        // D
            kodeRekening: row[5] || null,        // F
            noBukti: row[8] || null,             // I
            uraian: row[10] || '',               // K
            penerimaan: row[13] || 0,            // N - Number (integer)
            pengeluaran: row[16] || 0,           // Q - Number (integer)
            saldo: row[19] || 0,                 // T - Number (integer)
          })
        }

        resolve({ sekolahInfo, transactions })
      } catch (err) {
        reject(err)
      }
    }

    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}
```

### 2.4 Kelebihan & Kekurangan

| Aspek | Penjelasan |
|-------|-----------|
| **✅ Kecepatan** | Proses instan — tidak perlu request jaringan |
| **✅ Sederhana** | Cukup tambahkan library JS, tidak perlu backend |
| **✅ Offline** | Bisa berfungsi tanpa koneksi internet |
| **✅ Biaya** | Tidak perlu server / hosting backend |
| **✅ Privasi** | Data tidak meninggalkan perangkat user |
| **❌ Performa file besar** | File >10MB bisa bikin browser lambat |
| **❌ Storage terbatas** | localStorage max ~5-10MB per domain |
| **❌ Tidak persisten** | Data hilang jika hapus cache/ganti browser |
| **❌ Single-device** | Tidak bisa diakses dari perangkat lain |
| **❌ Tidak ada backup** | Risiko kehilangan data jika device rusak |
| **❌ Validasi terbatas** | Tidak bisa validasi mendalam seperti server |

---

## 3. Konsep 2: Backend API BKU

### 3.1 Definisi

**Backend API BKU** adalah endpoint REST API di sisi server yang menangani upload, parsing, validasi, penyimpanan, dan penyediaan data BKU. Frontend hanya mengirim file, sementara semua pemrosesan dilakukan di server. Data disimpan di database sehingga persisten dan bisa diakses multi-user.

### 3.2 Alur Kerja

```
┌──────────────────────┐         ┌──────────────────────────────────────┐
│     FRONTEND         │         │             BACKEND                  │
│     (Browser)        │         │             (Server)                 │
├──────────────────────┤         ├──────────────────────────────────────┤
│                      │         │                                      │
│  POST /api/bku/upload│         │  ┌──────────────────────────────┐    │
│  Content-Type:       │────────►│  │  1. Terima file multipart    │    │
│  multipart/form-data │         │  │  2. Validasi format file      │    │
│  (file .xlsx)        │         │  │  3. Parse dengan xlsx/        │    │
│                      │         │  │     openpyxl                  │    │
│                      │         │  └──────────┬───────────────────┘    │
│                      │         │             ▼                        │
│                      │         │  ┌──────────────────────────────┐    │
│                      │         │  │  4. Mapping kolom ARKAS      │    │
│                      │         │  │  5. Validasi data transaksi  │    │
│                      │         │  │  6. Extract info sekolah     │    │
│                      │         │  └──────────┬───────────────────┘    │
│                      │         │             ▼                        │
│                      │         │  ┌──────────────────────────────┐    │
│                      │         │  │          DATABASE            │    │
│                      │         │  │  ┌──────────────────────┐   │    │
│                      │         │  │  │ bku_uploads          │   │    │
│                      │         │  │  ├──────────────────────┤   │    │
│                      │         │  │  │ id, npsn, tahun,     │   │    │
│                      │         │  │  │ filename, file_path, │   │    │
│                      │         │  │  │ status, uploaded_at  │   │    │
│                      │         │  │  └──────────────────────┘   │    │
│                      │         │  │  ┌──────────────────────┐   │    │
│                      │         │  │  │ bku_transactions     │   │    │
│                      │         │  │  ├──────────────────────┤   │    │
│                      │         │  │  │ id, upload_id, no,   │   │    │
│                      │         │  │  │ tanggal, uraian,     │   │    │
│                      │         │  │  │ kode_kegiatan,       │   │    │
│                      │         │  │  │ kode_rekening,       │   │    │
│                      │         │  │  │ no_bukti,            │   │    │
│                      │         │  │  │ penerimaan,          │   │    │
│                      │         │  │  │ pengeluaran, saldo   │   │    │
│                      │         │  │  └──────────────────────┘   │    │
│                      │         │  └──────────────────────────────┘    │
│                      │         │             │                        │
│  ◄──201 Created      │◄────────┤  7. Response JSON                   │
│  {                   │         │     { status: 'success',            │
│   id, transactions,  │         │       transactions: [...],          │
│   sekolahInfo,       │         │       sekolahInfo: {...} }          │
│   summary }          │         │                                      │
│                      │         │                                      │
│  GET /api/bku/       │         │                                      │
│  transactions        │────────►│  Query database berdasarkan          │
│  ?upload_id=1&       │         │  filter (bulan, tahun,               │
│   bulan=1&           │         │  upload_id, keyword)                 │
│   tahun=2026         │         │                                      │
│                      │◄────────│  Response: filtered transactions     │
│                      │         │                                      │
│  GET /api/bku/       │         │                                      │
│  summary             │────────►│  Hitung total penerimaan,            │
│  ?upload_id=1        │         │  pengeluaran, saldo                  │
│                      │◄────────│  Response: summary object            │
│                      │         │                                      │
│  DELETE /api/bku/    │         │                                      │
│  upload/:id          │────────►│  Hapus upload & semua transaksinya   │
│                      │◄────────│  200 OK atau 404 Not Found           │
│                      │         │                                      │
└──────────────────────┘         └──────────────────────────────────────┘
```

### 3.3 Arsitektur API

#### Endpoints

| Method | Endpoint | Deskripsi | Request | Response |
|--------|----------|-----------|---------|----------|
| `POST` | `/api/bku/upload` | Upload & parse file BKU | `multipart/form-data` (file .xlsx) | `201` → `{ id, transactions, sekolahInfo, summary }` |
| `GET`  | `/api/bku/transactions` | Ambil data transaksi | Query: `upload_id`, `bulan`, `tahun`, `keyword`, `page`, `limit` | `200` → `{ data, total, page, totalPages }` |
| `GET`  | `/api/bku/uploads` | Daftar riwayat upload | Query: `npsn`, `tahun` | `200` → `[{ id, filename, tahun, status, uploaded_at, summary }]` |
| `GET`  | `/api/bku/summary` | Ringkasan keuangan | Query: `upload_id`, `bulan`, `tahun` | `200` → `{ totalPenerimaan, totalPengeluaran, saldoAkhir, jumlahTransaksi }` |
| `GET`  | `/api/bku/upload/:id` | Detail upload & file | Path: upload ID | `200` → `{ id, sekolahInfo, fileMetadata }` |
| `DELETE` | `/api/bku/upload/:id` | Hapus upload | Path: upload ID | `200` → `{ message }` |

#### Database Schema

```sql
-- Tabel: bku_uploads (informasi file upload)
CREATE TABLE bku_uploads (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    npsn         VARCHAR(20) NOT NULL,
    nama_sekolah VARCHAR(200),
    tahun        INT NOT NULL,
    filename     VARCHAR(255) NOT NULL,
    file_path    VARCHAR(500),          -- path file di server
    file_size    BIGINT,                -- ukuran file dalam bytes
    status       ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    total_transaksi INT DEFAULT 0,
    total_penerimaan DECIMAL(15,2) DEFAULT 0,
    total_pengeluaran DECIMAL(15,2) DEFAULT 0,
    saldo_akhir  DECIMAL(15,2) DEFAULT 0,
    uploaded_by  INT,                   -- foreign key ke users
    uploaded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    INDEX idx_npsn_tahun (npsn, tahun),
    INDEX idx_status (status)
);

-- Tabel: bku_transactions (detail transaksi)
CREATE TABLE bku_transactions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    upload_id       INT NOT NULL,
    nomor_urut      INT,                -- nomor urut dalam file
    tanggal         DATE NOT NULL,
    kode_kegiatan   VARCHAR(20),
    kode_rekening   VARCHAR(30),
    no_bukti        VARCHAR(50),
    uraian          TEXT,
    penerimaan      DECIMAL(15,2) DEFAULT 0,
    pengeluaran     DECIMAL(15,2) DEFAULT 0,
    saldo           DECIMAL(15,2) DEFAULT 0,
    kategori        VARCHAR(50),        -- deteksi otomatis: Honor, Mamin, DLL
    FOREIGN KEY (upload_id) REFERENCES bku_uploads(id) ON DELETE CASCADE,
    INDEX idx_upload (upload_id),
    INDEX idx_tanggal (tanggal),
    INDEX idx_kategori (kategori)
);
```

#### Contoh Response API

```json
// POST /api/bku/upload → 201 Created
{
  "status": "success",
  "message": "File BKU berhasil diproses",
  "data": {
    "id": 1,
    "sekolahInfo": {
      "npsn": "20205293",
      "nama": "SD NEGERI PASIRHALANG",
      "alamat": "Kp. Pasirhalang RT.03 RW.14",
      "kabupaten": "Kab. Bandung Barat",
      "provinsi": "Prov. Jawa Barat"
    },
    "transactions": [
      {
        "id": 1,
        "tanggal": "2026-01-01",
        "uraian": "Saldo Bank Bulan Desember 2025",
        "penerimaan": 0,
        "pengeluaran": 0,
        "saldo": 0
      },
      {
        "id": 2,
        "tanggal": "2026-01-20",
        "kodeKegiatan": null,
        "kodeRekening": null,
        "noBukti": "BBU01",
        "uraian": "Terima Dana BOSP Tahap 1 2026",
        "penerimaan": 82560000,
        "pengeluaran": 0,
        "saldo": 82560000
      }
    ],
    "summary": {
      "totalPenerimaan": 82560000,
      "totalPengeluaran": 0,
      "saldoAkhir": 82560000,
      "jumlahTransaksi": 2
    }
  }
}
```

```json
// GET /api/bku/summary?upload_id=1&bulan=1&tahun=2026 → 200 OK
{
  "status": "success",
  "data": {
    "uploadId": 1,
    "bulan": 1,
    "tahun": 2026,
    "totalPenerimaan": 82560000,
    "totalPengeluaran": 24500000,
    "saldoAwal": 0,
    "saldoAkhir": 58060000,
    "jumlahTransaksi": 12,
    "kategoriSummary": [
      { "kategori": "Honor", "total": 15000000, "jumlah": 3 },
      { "kategori": "ATK", "total": 3500000, "jumlah": 2 },
      { "kategori": "Makan & Minum", "total": 2000000, "jumlah": 1 },
      { "kategori": "Lainnya", "total": 4000000, "jumlah": 6 }
    ]
  }
}
```

### 3.4 Kelebihan & Kekurangan

| Aspek | Penjelasan |
|-------|-----------|
| **✅ Data persisten** | Tersimpan di database → aman, tidak hilang |
| **✅ Multi-user** | Operator, bendahara, kepala sekolah bisa akses bersama |
| **✅ Performa** | Server punya resource lebih untuk parse file besar |
| **✅ Validasi kuat** | Validasi format, integritas, duplicate detection |
| **✅ Backup & recovery** | Database bisa di-backup secara rutin |
| **✅ Integrasi** | Bisa connect ke sistem lain (Dapodik, ARKAS, SISKEUDES) |
| **✅ Audit trail** | Riwayat upload, siapa, kapan — tercatat |
| **❌ Butuh development** | Setup server, database, API — waktu & biaya |
| **❌ Ketergantungan koneksi** | Tidak bisa offline |
| **❌ Maintenance** | Server perlu di-patch, di-monitor, di-backup |
| **❌ Latensi** | Setiap request butuh waktu jaringan |
| **❌ Biaya hosting** | Server VPS / cloud berbayar |

---

## 4. Perbandingan Langsung

| Aspek | Excel Parser Frontend | Backend API BKU |
|-------|----------------------|-----------------|
| **Lokasi parsing** | Browser (JavaScript) | Server (Node.js/Python) |
| **Library** | `xlsx`, `exceljs` (frontend) | `xlsx`, `openpyxl`, `exceljs` (server) |
| **Penyimpanan** | localStorage / IndexedDB | MySQL / PostgreSQL |
| **Kapasitas** | ~5-10 MB (terbatas browser) | Tak terbatas (skalabel) |
| **Kecepatan akses** | Instant (0ms latency) | ~100-500ms (tergantung jaringan) |
| **Persistensi data** | ❌ Hilang jika hapus cache | ✅ Permanen di database |
| **Multi-user** | ❌ Hanya 1 device/browser | ✅ Banyak user bersamaan |
| **Offline** | ✅ Bisa tanpa internet | ❌ Butuh koneksi |
| **Kompleksitas dev** | Rendah (1 komponen React + library) | Sedang-Tinggi (API + DB + deployment) |
| **Biaya operasional** | Gratis | Biaya server/hosting |
| **Keamanan data** | Data di device user | Data di server (perlu proteksi) |
| **Audit trail** | ❌ Tidak ada | ✅ Lengkap (siapa upload, kapan) |
| **Duplicate detection** | ❌ Tidak bisa | ✅ Cek NPSN + Tahun |
| **Integrasi eksternal** | ❌ Terbatas | ✅ Bisa integrasi Dapodik/ARKAS |
| **Backup** | ❌ Tidak ada | ✅ Backup database |

---

## 5. Strategi Implementasi Bertahap

Rekomendasi implementasi untuk aplikasi ini — mulai dari yang paling sederhana hingga produksi:

```
Tahap 0 ─── Tahap 1 ─── Tahap 2 ───→ Tahap 3
(Sekarang)   (MVP)      (Produksi)     (Enterprise)
─────────────────────────────────────────────────────► Waktu

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ MOCK     │  │ EXCEL    │  │ BACKEND  │  │ FULL     │
│ DATA     │  │ PARSER   │  │ API BKU  │  │ INTEGRASI│
│          │  │ FRONTEND │  │          │  │          │
├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│ Data     │  │ Parse    │  │ REST API │  │ Sinkron  │
│ hardcode │  │ Excel    │  │ database │  │ ARKAS    │
│ (6 item) │  │ sungguhan│  │ multi-   │  │ otomatis │
│          │  │ 277      │  │ user     │  │ realtime │
│          │  │ transaksi│  │          │  │          │
├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│ Storage  │  │ Storage  │  │ Storage  │  │ Storage  │
│ local-   │  │ local-   │  │ MySQL/   │  │ MySQL/   │
│ Storage  │  │ Storage  │  │ Postgres │  │ Postgres │
├──────────┤  ├──────────┤  ├──────────┤  ├──────────┤
│ Waktu    │  │ 1-2 hari │  │ 1-2     │  │ 1-2 bulan│
│          │  │          │  │ minggu  │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

### Detail Setiap Tahap

#### Tahap 0 — Mock Data (Saat Ini)

**Status:** ✅ Sudah ada

**Karakteristik:**
- 6 transaksi hardcode di `MOCK_BKU`
- Tombol upload hanya simulasi (toast)
- Semua data di localStorage
- Tidak ada parsing Excel sungguhan

**Cocok untuk:** Demo awal, prototyping UI

#### Tahap 1 — Excel Parser Frontend (MVP)

**Status:** ⏳ Belum diimplementasi

**Yang perlu dilakukan:**
1. Install library: `npm install xlsx` atau `npm install exceljs`
2. Buat fungsi parser di `utils/` — `bkuParser.js`
3. Ganti mock data dengan hasil parse sungguhan
4. Validasi format file sebelum parse
5. Tampilkan info sekolah dari header Excel
6. Loading state selama proses parsing

**Cocok untuk:** UAT (User Acceptance Testing), pilot testing di 1-2 sekolah

#### Tahap 2 — Backend API BKU (Produksi)

**Status:** ⏳ Belum ada

**Yang perlu dilakukan:**
1. Setup backend framework (Laravel / Node.js / Python FastAPI)
2. Setup database (MySQL / PostgreSQL)
3. Buat endpoint POST `/api/bku/upload`
4. Buat endpoint GET `/api/bku/transactions`
5. Buat endpoint GET `/api/bku/summary`
6. Integrasi frontend → panggil API, bukan localStorage
7. Auth & authorization (siapa boleh upload)
8. History upload & manajemen file

**Cocok untuk:** Produksi, multi-sekolah

#### Tahap 3 — Full Integrasi ARKAS (Enterprise)

**Status:** 🔮 Future

**Yang perlu dilakukan:**
1. Sinkronisasi otomatis data ARKAS via API atau web scraping
2. Realtime update saldo dan transaksi
3. Validasi silang dengan RKAS dan realisasi
4. Dashboard monitoring multi-sekolah (dinas pendidikan)
5. Export otomatis ke format SISKEUDES

**Cocok untuk:** Skala kabupaten/kota, dinas pendidikan

---

## 6. Rekomendasi untuk Aplikasi Ini

### Pilihan Jangka Pendek

✅ **Mulai dengan Excel Parser Frontend (Tahap 1)**

Alasan:
- **Aplikasi masih prototype** — belum perlu backend
- **File BKU relatif kecil** (~277 transaksi) — parsing di browser OK
- **Operator biasanya single-user** — satu orang mengelola di satu komputer
- **Cepat diimplementasi** — 1-2 hari sudah bisa parsing sungguhan
- **Tidak perlu setup server** — langsung bisa diuji

### Pilihan Jangka Panjang

✅ **Migrasi ke Backend API BKU (Tahap 2)**

Alasan:
- **Data harus persisten** — jangan sampai hilang jika ganti browser
- **Multi-user penting** — kepala sekolah perlu lihat data tanpa login ke komputer operator
- **Audit trail** — siapa upload, kapan, berapa kali — penting untuk transparansi
- **Backup** — database lebih aman daripada localStorage

### Rekomendasi Hybrid (Opsional)

```
Frontend Parser (cepat)
       +             =   Best of both worlds
Backend Storage

┌─────────────────────────────────────────────────────┐
│ 1. User upload file                                  │
│ 2. Parse di FRONTEND (langsung tampilkan tabel)      │
│ 3. Kirim hasil parse ke BACKEND (simpan di database) │
│ 4. Next visit → ambil dari BACKEND                   │
│ 5. Jika offline → fallback ke localStorage           │
└─────────────────────────────────────────────────────┘
```

Dengan pendekatan hybrid:
- **User experience cepat** — tabel muncul instan setelah upload (parsing di frontend)
- **Data tetap aman** — otomatis disimpan ke backend di background
- **Offline-friendly** — localStorage sebagai cache jika tidak ada koneksi
- **Progressive enhancement** — backend bisa ditambahkan tanpa mengubah alur frontend

---

## 7. Referensi

1. **`RESEARCH_BKU_UPLOAD.md`** — Riset struktur file BKU Excel dari ARKAS
2. **`spj-frontend/src/pages/dashboard/BKUPage.jsx`** — Implementasi UI upload BKU saat ini
3. **Library: `xlsx`** (SheetJS) — https://sheetjs.com/
4. **Library: `exceljs`** — https://github.com/exceljs/exceljs
5. **Library: `openpyxl`** (Python) — https://openpyxl.readthedocs.io/
6. **MDN: FileReader API** — https://developer.mozilla.org/en-US/docs/Web/API/FileReader
7. **MDN: localStorage** — https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

*Dokumen ini dibuat sebagai referensi arsitektur untuk pengembangan fitur Upload BKU di Aplikasi LPJ BOS/BOSP.*
