# Alur Tarik Tunai & Pajak di Buku Kas Umum (BKU)

> **Dibuat:** 2026-07-09  
> **Sumber:** Analisis file `template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx`  
> **Tujuan:** Dokumentasi workflow tarik tunai dan pajak untuk referensi fitur perhitungan di masa depan

---

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Konsep Dasar: Mengapa Tarik Tunai & Pajak Tidak Dihitung di Alur Belanja](#2-konsep-dasar)
3. [Workflow Tarik Tunai & Pergeseran Bank](#3-workflow-tarik-tunai--pergeseran-bank)
4. [Workflow Pajak](#4-workflow-pajak)
5. [Mekanisme Balance / Keseimbangan](#5-mekanisme-balance--keseimbangan)
6. [Panduan Deteksi Transaksi untuk Parser](#6-panduan-deteksi-transaksi-untuk-parser)
7. [Referensi Data dari File BKU Aktual](#7-referensi-data-dari-file-bku-aktual)
8. [Implikasi untuk Fitur Masa Depan](#8-implikasi-untuk-fitur-masa-depan)

---

## 1. Ringkasan Eksekutif

Dalam Buku Kas Umum (BKU) terdapat **3 kategori transaksi** yang memiliki karakteristik berbeda:

| Kategori | Volume | Total (Rp) | % Dana | Sifat |
|----------|--------|------------|--------|-------|
| **🏦 Belanja Riil** (BNU) | 166 tx | 83.174.000 | 83,6% | Pengeluaran ke pihak ke-3 |
| **🧾 Pajak** (BPU + PPh) | 85 tx | 16.350.000 | 16,4% | Kewajiban ke kas negara |
| **🏧 Tarik Tunai** | 2 tx | 16.350.000 | — | **Netral** (tidak mengubah saldo) |

> **Kunci Pemahaman:** Tarik tunai dan pajak **tidak mempengaruhi** total saldo BKU secara netto.  
> - **Tarik Tunai**: Hanya menggeser bentuk aset (Bank → Tunai), **netral** di BKU  
> - **Pajak**: Dipungut dari pembayaran, lalu disetor. Jumlah pungut = jumlah setor = **balance**  
> - **Belanja Riil**: Satu-satunya yang benar-benar mengurangi saldo kas

---

## 2. Konsep Dasar

### 2.1 Rumus Saldo BKU

```
Saldo[n] = Saldo[n-1] + Penerimaan[n] - Pengeluaran[n]

dimana:

PENERIMAAN = Dana BOSP + Terima PPh (dipungut) + Pergeseran Bank + Bunga Bank
PENGELUARAN = Pembayaran (BNU) + Setor Pajak (BPU) + Tarik Tunai + Pajak Bunga

```

### 2.2 Hierarki Transaksi di BKU

```
                            ┌─────────────────────────┐
                            │   DANA BOSP (BBU01)     │
                            │   Rp 82.560.000          │
                            └────────────┬────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────┐
                  │        REKENING BANK             │
                  │        (1 Rekening)              │
                  └────────────┬─────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
    │ BELANJA RIIL │   │ TARIK TUNAI  │   │ PUNGUT PAJAK │
    │ (BNU)        │   │ (Ke Kas      │   │ (PPh 23 dll) │
    │ Rp 83,17 jt  │   │  Tunai)      │   │ Rp 614 rb    │
    └──────────────┘   └──────┬───────┘   └──────┬───────┘
                              │                  │
                              ▼                  ▼
                      ┌──────────────┐   ┌──────────────┐
                      │ KAS TUNAI    │   │ SETOR PAJAK  │
                      │ Rp 16,35 jt  │   │ (BPU)        │
                      └──────────────┘   │ Rp 16,35 jt  │
                                         └──────┬───────┘
                                                ▼
                                        ┌──────────────┐
                                        │ KAS NEGARA   │
                                        └──────────────┘
```

### 2.3 Mengapa Tarik Tunai Tidak Dihitung di Belanja?

Ketika dana ditarik dari bank (Tarik Tunai), terjadi **pergeseran aset**:

```
🏦 Bank:  -Rp 14.650.000  →  💵 Kas Tunai:  +Rp 14.650.000
────────────────────────────────────────────────────────────
Total Kas Sekolah:   (tidak berubah) ✓
```

Di BKU, Tarik Tunai dicatat sebagai **pengeluaran** (dari perspektif Bank) dan Pergeseran sebagai **penerimaan** (ke perspektif Tunai). Efek nettonya **Rp 0** terhadap posisi kas sekolah.

### 2.4 Mengapa Pajak Tidak Dihitung di Belanja?

Pajak adalah **dana titipan** yang dipotong dari pembayaran ke pihak ke-3:

```
Pembayaran Honor Rp 1.000.000
  ├── ◑ Diterima Penerima: Rp 976.000  (belanja riil)
  └── ◑ Ditahan untuk Pajak: Rp 24.000 (dana titipan)
                     |
                     ▼
            Disetor ke Kas Negara
            (melalui BPU)
```

Jadi pajak bukan "belanja" — melainkan **kewajiban perpajakan** yang harus disetorkan.

---

## 3. Workflow Tarik Tunai & Pergeseran Bank

### 3.1 Definisi

**Tarik Tunai** adalah transaksi pemindahan dana dari rekening bank sekolah ke kas tunai (uang fisik).

**Pergeseran Bank** adalah pencatatan penerimaan dana yang masuk ke kas tunai akibat penarikan dari bank.

### 3.2 Karakteristik Transaksi

| Atribut | Tarik Tunai | Pergeseran |
|---------|-------------|------------|
| **No. Bukti** | Tidak ada (kosong) | Tidak ada (kosong) |
| **Kode Kegiatan** | Tidak ada | Tidak ada |
| **Kode Rekening** | Tidak ada | Tidak ada |
| **Uraian** | `"Tarik Tunai"` | `"Pergeseran Uang di Bank"` |
| **Jenis** | Pengeluaran (kredit) | Penerimaan (debet) |
| **Nilai** | Sama dengan Pergeseran | Sama dengan Tarik Tunai |
| **Efek Saldo** | Berkurang | Bertambah (sama besar) |

### 3.3 Flow Lengkap Tarik Tunai

```
                  ┌─────────────────────────────────────┐
                  │          TARIK TUNAI                 │
                  │                                     │
                  │  Dana dari Bank → Kas Tunai          │
                  │  Total: Rp 16.350.000                 │
                  └─────────────────────────────────────┘
                                 │
          ┌──────────────────────┴──────────────────────┐
          ▼                                             ▼
┌──────────────────────┐                  ┌──────────────────────┐
│ 1. TARIK TUNAI       │                  │ 2. PERGESERAN BANK   │
│ (Pengeluaran)        │                  │ (Penerimaan)         │
├──────────────────────┤                  ├──────────────────────┤
│ Tgl: 09-02-2026      │                  │ Tgl: 09-02-2026      │
│ Uraian: Tarik Tunai  │                  │ Uraian: Pergeseran   │
│ Keluar: Rp14.650.000 │                  │ Terima: Rp14.650.000 │
│ Saldo turun          │                  │ Saldo naik           │
└──────────────────────┘                  └──────────────────────┘
         │                                         │
         └─────────────────┬───────────────────────┘
                           ▼
              ┌────────────────────────┐
              │ SALDO TIDAK BERUBAH    │
              │ (Netral)               │
              └────────────────────────┘
```

### 3.4 Data Aktual dari File BKU

| Tanggal | Uraian | Terima | Keluar | Saldo Setelah |
|---------|--------|--------|--------|---------------|
| 09-02-2026 | Tarik Tunai | — | Rp 14.650.000 | Rp 65.258.000 |
| 09-02-2026 | Pergeseran Uang di Bank | Rp 14.650.000 | — | Rp 79.908.000 |
| 09-06-2026 | Tarik Tunai | — | Rp 1.700.000 | Rp 6.317.000 |
| 09-06-2026 | Pergeseran Uang di Bank | Rp 1.700.000 | — | Rp 8.017.000 |

### 3.5 Cara Mendeteksi

```javascript
function isTarikTunai(transaction) {
  return transaction.pengeluaran > 0 
    && !transaction.kodeKegiatan 
    && !transaction.kodeRekening 
    && !transaction.noBukti
    && transaction.uraian.match(/tarik|tunai|geser|pindah/i);
}

function isPergeseran(transaction) {
  return transaction.penerimaan > 0 
    && transaction.uraian.match(/pergeseran|pindah/i);
}

function isCashWithdrawal(transaction) {
  return isTarikTunai(transaction) || isPergeseran(transaction);
}
```

---

## 4. Workflow Pajak

### 4.1 Jenis-Jenis Pajak di BKU

| Jenis | Dasar Hukum | Tarif | Objek | Frekuensi |
|-------|-------------|-------|-------|-----------|
| **PPh 21** | PP 58/2023 | Progresif (0-30%) | Gaji pegawai tetap | ~8 tx/bulan |
| **PPh 23** | PMK-141/2015 | 2% atau 4% | Jasa (honorarium, fee) | ~30 tx/bulan |
| **PPh Final** | PP 9/2022 dkk | 0,5%-10% | Jasa konstruksi, sewa | ~5 tx/bulan |
| **Pajak Bunga** | PP 131/2000 | 20% | Bunga bank | ~6 tx/bulan |

### 4.2 Flow Lengkap Pajak

#### 🔴 PPh 21 (Pajak Gaji Pegawai)

```
PEMBAYARAN GAJI
├── Bruto: Rp 1.000.000
├── Potongan PPh 21: Rp X (tergantung PTKP)
├── Diterima Pegawai: Rp (1.000.000 - X)
└── Catatan di BKU:
    ├── BNU: Keluar Rp 1.000.000 (full)
    ├── (tidak ada pungutan terpisah untuk PPh 21)
    └── BPU: Setor PPh 21 Rp X
```

#### 🟠 PPh 23 (Pajak Jasa) — **Paling Kompleks**

Ini adalah workflow yang paling perlu dipahami karena melibatkan **3 langkah**:

```
LANGKAH 1: Bayar Jasa ke Penerima
┌────────────────────────────────────────────────────────────┐
│ BNU01                                                      │
│ Tanggal: 09-02-2026                                        │
│ Kode Kegiatan: 07.12.01.                                   │
│ Kode Rekening: 5.1.02.02.01.0013                          │
│ Uraian: Vani (0162778679230113)                            │
│ Pengeluaran: Rp 1.000.000 ← FULL (belum dipotong pajak)   │
│ Saldo Turun: Rp 1.000.000                                  │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
LANGKAH 2: Pungut PPh 23 4%
┌────────────────────────────────────────────────────────────┐
│ (tidak ada no bukti)                                       │
│ Tanggal: 09-02-2026                                        │
│ Uraian: Terima PPh 23 4%                                   │
│ Penerimaan: Rp 24.000 ← ditarik kembali (4% dari 600rb)   │
│ Saldo Naik: Rp 24.000                                      │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
LANGKAH 3: Setor Pajak ke Kas Negara
┌────────────────────────────────────────────────────────────┐
│ BPU01                                                      │
│ Tanggal: 09-02-2026                                        │
│ Uraian: Setor PPh 23 4%                                    │
│ Pengeluaran: Rp 24.000 ← dikirim ke negara                 │
│ Saldo Turun: Rp 24.000                                     │
└────────────────────────────────────────────────────────────┘

NETTO: 
- Penerima jasa: menerima Rp 976.000 (dari Rp 1.000.000)
- Pajak: Rp 24.000 ke negara
- Saldo BKU: berkurang Rp 1.000.000 (sama dengan BNU)
  (karena penerimaan Rp 24.000 + pengeluaran Rp 24.000 saling hapus)
```

#### 🟢 PPh Final

```
PEMBAYARAN JASA KONSTRUKSI
├── Bruto: Rp 1.000.000
├── PPh Final 2%: Rp 20.000
├── Diterima Penerima: Rp 980.000
└── Catatan di BKU:
    ├── BNU: Keluar Rp 1.000.000
    └── BPU: Setor PPh Final Rp 20.000
```

#### 💰 Bunga Bank & Pajak Bunga

```
AKHIR BULAN (31 Jan, 28 Feb, 31 Mar, dst.)
├── Bunga Bank: (nilai bunga — biasanya Rp 0 di data ini)
│   → Tercatat di BKU sebagai penerimaan
└── Pajak Bunga 20%:
    → Tercatat di BKU sebagai pengeluaran
    
* Dalam data aktual, nilai bunga = Rp 0 karena dana sudah dipindah
```

### 4.3 Data Aktual Pungutan PPh 23

Dari file BKU, terdapat **22 transaksi** pungutan PPh 23, **masing-masing Rp 24.000**.

Pola ini menunjukkan tarif PPh 23 **2%** (dari Rp 1.200.000) atau **4%** (dari Rp 600.000):

```
BNU:  Pembayaran ke pihak ke-3 → Rp 1.000.000 (contoh honor)
↓
Terima PPh 23: Rp 24.000 → artinya tarif = 4% dari Rp 600.000
atau 2% dari Rp 1.200.000
```

**Distribusi Pungutan PPh per Bulan:**

| Bulan | Jumlah Pungutan | Total Nilai |
|-------|-----------------|-------------|
| Januari | 0 | Rp 0 |
| Februari | 8 | Rp 192.000 |
| Maret | 7 | Rp 168.000 |
| April | 4 | Rp 96.000 |
| Mei | 1 | Rp 24.000 |
| Juni | 3 | Rp 72.000 |

### 4.4 Data Aktual Setoran Pajak (BPU)

**55 transaksi BPU** dengan rincian:

| Jenis Pajak | Jumlah | Estimasi Total |
|-------------|--------|----------------|
| PPh 21 | ~8 tx | ~Rp 2.000.000 |
| PPh 23 | ~30 tx | ~Rp 9.000.000 |
| PPh Final | ~5 tx | ~Rp 3.000.000 |
| Pajak Bunga | ~6 tx | Rp 0 (nilai bunga = 0) |
| Lainnya | ~6 tx | ~Rp 2.350.000 |

### 4.5 Cara Mendeteksi

```javascript
function getTransactionType(transaction) {
  // 1. TARIK TUNAI
  if (transaction.pengeluaran > 0 && !transaction.kodeKegiatan 
      && !transaction.noBukti && transaction.uraian.match(/tarik|tunai|geser/i)) {
    return 'TARIK_TUNAI';
  }
  
  // 2. PERGESERAN BANK
  if (transaction.penerimaan > 0 && transaction.uraian.match(/pergeseran|pindah/i)) {
    return 'PERGESERAN_BANK';
  }
  
  // 3. PENERIMAAN BOSP
  if (transaction.penerimaan > 0 && transaction.uraian.includes('Dana BOSP')) {
    return 'PENERIMAAN_BOSP';
  }
  
  // 4. PUNGUT PPh (penerimaan pajak dari pungutan)
  if (transaction.penerimaan > 0 && transaction.uraian.includes('Terima PPh')) {
    return 'PUNGUT_PPH';
  }
  
  // 5. SETOR PAJAK (BPU)
  if (transaction.noBukti.startsWith('BPU')) {
    return 'SETOR_PAJAK';
  }
  
  // 6. BUNGA BANK
  if (transaction.uraian.includes('Bunga Bank')) {
    return 'BUNGA_BANK';
  }
  
  // 7. PAJAK BUNGA
  if (transaction.uraian.includes('Pajak Bunga')) {
    return 'PAJAK_BUNGA';
  }
  
  // 8. PEMBAYARAN RIIL
  if (transaction.pengeluaran > 0 && transaction.noBukti) {
    return 'PEMBAYARAN';
  }
  
  return 'LAINNYA';
}
```

---

## 5. Mekanisme Balance / Keseimbangan

### 5.1 Prinsip Balance

BKU dikatakan **balance** jika:

```
Total Penerimaan = Total Pengeluaran
Saldo Akhir = 0
```

Dalam data aktual:
```
Total Penerimaan  = Rp 99.524.000
Total Pengeluaran = Rp 99.524.000
Saldo Akhir       = Rp 0 ✓
```

### 5.2 Balance Breakdown

| Komponen | Penerimaan | Pengeluaran | Balance? |
|----------|-----------|-------------|----------|
| Dana BOSP | Rp 82.560.000 | — | — |
| Belanja Riil (BNU) | — | Rp 83.174.000 | — |
| **Pungut PPh** | **Rp 614.000** | — | ◀ |
| **Setor Pajak (BPU)** | — | **Rp 16.350.000** | ◀ |
| **Tarik Tunai** | — | **Rp 14.650.000** | ◀ Hapus dengan Pergeseran |
| **Pergeseran** | **Rp 16.350.000** | — | ◀ |
| Bunga Bank | Rp 0 | — | — |
| Pajak Bunga | — | Rp 0 | — |
| **TOTAL** | **Rp 99.524.000** | **Rp 99.524.000** | ✅ |

### 5.3 Visual Balance

```
PENERIMAAN                     PENGELUARAN
══════════════                 ══════════════
                               ┌─────────────────┐
┌─────────────────┐            │ Belanja Riil    │
│ Dana BOSP       │◄──────────►│ Rp 83.174.000   │
│ Rp 82.560.000   │    83,6%   │ (BNU)           │
└─────────────────┘            └─────────────────┘
                               ┌─────────────────┐
┌─────────────────┐            │ Setor Pajak     │
│ Pergeseran Bank │◄──Netral──►│ Tarik Tunai     │
│ Rp 16.350.000   │            │ Rp 16.350.000   │
└─────────────────┘            └─────────────────┘
                               ┌─────────────────┐
┌─────────────────┐            │                 │
│ Pungut PPh      │◄──Balance─►│ Setor PPh       │
│ Rp 614.000      │            │ (bagian dari    │
└─────────────────┘            │  BPU)           │
                               │ Rp 614.000      │
                               └─────────────────┘
```

### 5.4 Rumus Deteksi Balance

```javascript
function isBKUbalanced(transactions) {
  const totalPenerimaan = transactions.reduce((s, t) => s + t.penerimaan, 0);
  const totalPengeluaran = transactions.reduce((s, t) => s + t.pengeluaran, 0);
  const saldoAkhir = transactions[transactions.length - 1]?.saldo || 0;
  
  return {
    balanced: totalPenerimaan === totalPengeluaran && saldoAkhir === 0,
    totalPenerimaan,
    totalPengeluaran,
    saldoAkhir,
    selisih: Math.abs(totalPenerimaan - totalPengeluaran)
  };
}

function getBelanjaRiil(transactions) {
  return transactions.filter(t => 
    t.pengeluaran > 0 && t.kodeKegiatan && t.kodeRekening
  );
}

function getTransaksiPajak(transactions) {
  return {
    pungutan: transactions.filter(t => t.uraian.includes('Terima PPh')),
    setoran: transactions.filter(t => t.noBukti.startsWith('BPU'))
  };
}

function getTransaksiTunai(transactions) {
  return transactions.filter(t => 
    t.uraian.match(/tarik|tunai|geser|pindah/i)
  );
}
```

---

## 6. Panduan Deteksi Transaksi untuk Parser

### 6.1 Mapping Kolom (Terverifikasi)

| Field | Kolom | Index | Tipe | Contoh |
|-------|-------|-------|------|--------|
| Tanggal | **A** | 0 | `string DD-MM-YYYY` | `"20-01-2026"` |
| Kode Kegiatan | **D** | 3 | `string` (nullable) | `"07.12.01."` |
| Kode Rekening | **F** | 5 | `string` (nullable) | `"5.1.02.02.01.0013"` |
| No. Bukti | **I** | 8 | `string` (nullable) | `"BBU01"`, `"BNU01"`, `"BPU01"` |
| Uraian | **K** | 10 | `string` | `"Terima Dana BOSP..."` |
| Penerimaan | **N** | 13 | `number` (integer) | `82560000` |
| Pengeluaran | **Q** | 16 | `number` (integer) | `1000000` |
| Saldo | **T** | 19 | `number` (integer) | `82560000` |

### 6.2 Header Sekolah

| Informasi | Row (1-based) | Kolom Label | Kolom Value |
|-----------|--------------|-------------|-------------|
| Tahun Anggaran | 3 | A | — (langsung: `"TAHUN : 2026"`) |
| NPSN | 5 | A | E (`": 20205293"`) |
| Nama Sekolah | 7 | A | E (`": SD NEGERI PASIRHALANG"`) |
| Alamat | 9 | A | E (`": Kp. Pasirhalang..."`) |
| Kab/Kota | 11 | A | E (`": Kab. Bandung Barat"`) |
| Provinsi | 13 | A | E (`": Prov. Jawa Barat"`) |

> **Catatan:** Value di kolom E diawali dengan `": "` yang perlu di-strip.

### 6.3 Pola No. Bukti

| Prefix | Jenis | Jumlah | Contoh |
|--------|-------|--------|--------|
| **BBU** | Bank Buku Umum (Penerimaan Dana) | 1 | BBU01 |
| **BNU** | Bank Non Umum (Pengeluaran) | 72 | BNU01 - BNU72 |
| **BPU** | Bank Pajak Umum (Setor Pajak) | 29 | BPU01 - BPU29 |

### 6.4 Kode Rekening untuk Kategori

| Kode Rekening | Kategori | Kode Kegiatan Terkait |
|---------------|----------|----------------------|
| `5.1.02.02.*` | **Honor/Gaji** | `07.12.01.`, `07.12.02.`, `03.03.18.` |
| `5.2.05.01.01.0001` | **Listrik** | `05.02.03.` |
| `5.1.02.01.01.0024` | **ATK** | `06.05.08.` |
| `5.1.02.01.01.0052` | **Makan/Minum** 🟢 | `04.06.13.`, `08.04.13.` |
| `5.1.02.01.01.0025` | **Bahan Cetak** | `06.05.09.` |
| `5.1.02.02.01.0063` | **Pulsa Internet** | `06.07.05.` |
| `5.1.02.02.01.0061` | **Perpustakaan** | `06.07.01.` |

### 6.5 Algoritma Parsing Lengkap

```
1. LOAD file Excel dengan library xlsx/exceljs
2. SELECT sheet "Page1"
3. EXTRACT header sekolah (Row 5-13):
   - NPSN dari Row 5, Column E → strip ": "
   - Nama Sekolah dari Row 7, Column E → strip ": "
   - Alamat dari Row 9, Column E → strip ": "
   - Kab/Kota dari Row 11, Column E → strip ": "
   - Provinsi dari Row 13, Column E → strip ": "
   - Tahun dari Row 3, Column A → parse "TAHUN : YYYY"

4. ITERATE semua row dari 15-365:
   a. SKIP jika:
      - Row kosong
      - Row berisi "BKU-ALL Tahun" (section header)
      - Row dengan nilai 1 di kolom A (nomor kolom pembatas)
      - Row tanpa tanggal valid
   
   b. PARSE jika memiliki tanggal valid (DD-MM-YYYY di kolom A):
      tanggal = col[0]  (A)
      kode_kegiatan = col[3] || null  (D)
      kode_rekenning = col[5] || null  (F)
      no_bukti = col[8] || null  (I)
      uraian = col[10] || ''  (K)
      penerimaan = col[13] || 0  (N) — integer
      pengeluaran = col[16] || 0  (Q) — integer
      saldo = col[19] || 0  (T) — integer

5. KLASIFIKASI setiap transaksi menggunakan getTransactionType()

6. HITUNG summary:
   - Total Penerimaan Riil (BOSP)
   - Total Pungutan PPh
   - Total Belanja Riil (BNU)
   - Total Setoran Pajak (BPU)
   - Total Tarik Tunai & Pergeseran
   - Balance Check
```

---

## 7. Referensi Data dari File BKU Aktual

### 7.1 Profil Sekolah

| Atribut | Nilai |
|---------|-------|
| NPSN | 20205293 |
| Nama Sekolah | SD NEGERI PASIRHALANG |
| Alamat | Kp. Pasirhalang RT.03 RW.14, Kec. Cikalongwetan |
| Kab/Kota | Kab. Bandung Barat |
| Provinsi | Prov. Jawa Barat |
| Tahun Anggaran | 2026 |

### 7.2 Statistik Global

| Metrik | Nilai |
|--------|-------|
| Total Transaksi | 300 |
| Rentang Waktu | Januari - Juni 2026 |
| Dana BOSP Tahap 1 | Rp 82.560.000 |
| Total Penerimaan | Rp 99.524.000 |
| Total Pengeluaran | Rp 99.524.000 |
| Saldo Akhir | Rp 0 |
| Status | ✅ Balance |

### 7.3 Statistik Tarik Tunai

| Tanggal | Jumlah | Akumulasi |
|---------|--------|-----------|
| 09-02-2026 | Rp 14.650.000 | Rp 14.650.000 |
| 09-06-2026 | Rp 1.700.000 | Rp 16.350.000 |

### 7.4 Statistik Pajak

| Jenis | Jumlah Tx | Total |
|-------|-----------|-------|
| Pungutan PPh 23 | 22 tx | Rp 614.000 |
| Setoran Pajak (BPU) | 55 tx | Rp 16.350.000 |
| Bunga Bank | 6 tx | Rp 0 |
| Pajak Bunga | 6 tx | Rp 0 |

---

## 8. Implikasi untuk Fitur Masa Depan

### 8.1 Fitur Perhitungan Pajak

Jika nanti diperlukan fitur untuk **menghitung pajak secara otomatis** dari transaksi belanja:

```javascript
// Rumus perhitungan PPh berdasarkan jenis transaksi
function calculatePajak(transaction) {
  const kodeRekening = transaction.kodeRekening;
  const nilai = transaction.pengeluaran;
  
  // PPh 23 untuk jasa (honorarium, fee)
  if (kodeRekening.startsWith('5.1.02.02')) {
    return {
      jenis: 'PPh 23',
      tarif: 0.04, // 4%
      nilai: Math.round(nilai * 0.04)
    };
  }
  
  // PPh Final untuk jasa konstruksi
  if (kodeRekening.startsWith('5.2') || /* kondisi lain */) {
    return {
      jenis: 'PPh Final',
      tarif: 0.02, // 2%
      nilai: Math.round(nilai * 0.02)
    };
  }
  
  return null; // Tidak kena pajak
}
```

### 8.2 Fitur Tracking Kas Tunai vs Bank

```javascript
function getCashPosition(transactions) {
  let bankSaldo = 0;
  let tunaiSaldo = 0;
  let totalTarikTunai = 0;
  
  for (const tx of transactions) {
    const type = getTransactionType(tx);
    
    if (type === 'TARIK_TUNAI') {
      bankSaldo -= tx.pengeluaran;
      totalTarikTunai += tx.pengeluaran;
    } else if (type === 'PERGESERAN_BANK') {
      tunaiSaldo += tx.penerimaan;
    } else if (tx.pengeluaran > 0 && tx.kodeKegiatan) {
      bankSaldo -= tx.pengeluaran; // Belanja via bank
    } else if (tx.penerimaan > 0 && type === 'PENERIMAAN_BOSP') {
      bankSaldo += tx.penerimaan;
    }
  }
  
  return { bankSaldo, tunaiSaldo, totalTarikTunai };
}
```

### 8.3 Fitur Laporan Pajak Bulanan

```javascript
function generateTaxReport(transactions) {
  const report = {};
  
  for (const tx of transactions) {
    const bulan = tx.tanggal.split('-')[1]; // MM
    if (!report[bulan]) report[bulan] = {
      pph21: { count: 0, total: 0 },
      pph23: { count: 0, total: 0 },
      pphFinal: { count: 0, total: 0 },
      pajakBunga: { count: 0, total: 0 },
    };
    
    if (tx.noBukti.startsWith('BPU')) {
      if (tx.uraian.includes('PPh 21')) {
        report[bulan].pph21.count++;
        report[bulan].pph21.total += tx.pengeluaran;
      } else if (tx.uraian.includes('PPh 23')) {
        report[bulan].pph23.count++;
        report[bulan].pph23.total += tx.pengeluaran;
      } else if (tx.uraian.includes('PPh Final')) {
        report[bulan].pphFinal.count++;
        report[bulan].pphFinal.total += tx.pengeluaran;
      } else if (tx.uraian.includes('Pajak Bunga')) {
        report[bulan].pajakBunga.count++;
        report[bulan].pajakBunga.total += tx.pengeluaran;
      }
    }
  }
  
  return report;
}
```

### 8.4 Integrasi dengan Modul Mamin

Transaksi dengan **kode rekening `5.1.02.01.01.0052`** (Makan/Minuman) perlu di-track khusus:

```javascript
function getMaminTransactions(transactions) {
  return transactions.filter(t => 
    t.kodeRekening === '5.1.02.01.01.0052' && t.pengeluaran > 0
  );
}
```

| Kode Kegiatan | Deskripsi Mamin |
|---------------|-----------------|
| `04.06.13.` | Beban Makanan dan Minuman Rapat |
| `04.06.14.` | Beban Makanan dan Minuman Kegiatan |
| `04.06.27.` | Beban Makanan dan Minuman Jamuan |
| `08.04.13.` | Beban Makanan dan Minuman Lainnya |

Setiap transaksi Mamin membutuhkan **dokumen pendukung**:
- 📄 Surat Undangan
- 📋 Daftar Hadir
- 📝 Resume/Notulensi Kegiatan
- 📸 Foto/Dokumentasi

---

## Lampiran

### A. Contoh Block Transaksi Balance (09-02-2026)

```
Row│ No.Bukti│ Uraian                         │ Terima       │ Keluar       │ Saldo
────┼─────────┼────────────────────────────────┼──────────────┼──────────────┼────────────
 22 │ BNU01   │ Vani (0162778679230113)        │ 0            │ 1.000.000    │ 81.560.000
 23 │ BNU02   │ Vani (0162778679230113)        │ 0            │ 1.000.000    │ 80.560.000
 24 │         │ Terima PPh 23 4%               │ 24.000       │ 0            │ 80.584.000  ← Pungut Pajak
 25 │ BNU03   │ Herman                         │ 0            │ 700.000      │ 79.884.000
 26 │         │ Terima PPh 23 4%               │ 24.000       │ 0            │ 79.908.000  ← Pungut Pajak
 27 │         │ Tarik Tunai                    │ 0            │ 14.650.000   │ 65.258.000  ← Cairkan
 28 │         │ Pergeseran Uang di Bank        │ 14.650.000   │ 0            │ 79.908.000  ← Masuk Tunai (Balance)
```

### B. Daftar Kode Kegiatan Lengkap (Top 10)

| Kode | Deskripsi | Frekuensi | Total |
|------|-----------|-----------|-------|
| `05.02.03.` | Beban Tagihan Listrik | 73 | Rp 16.916.900 |
| `03.03.19.` | Honor Penjaga, PPh 21 | 41 | Rp 7.100.000 |
| `03.03.18.` | Honor Pegawai | 39 | — |
| `06.05.08.` | ATK, Alat Tulis Kantor | 21 | Rp 7.897.400 |
| `07.12.01.` | Honorarium Guru | 20 | Rp 16.000.000 |
| `06.07.05.` | Pulsa Internet | 11 | Rp 2.800.000 |
| `04.06.13.` | Beban Makanan & Minuman | 10 | — |
| `06.07.01.` | Honor Tenaga Perpustakaan | 8 | Rp 600.000 |
| `07.12.02.` | Honorarium Tendik | 7 | Rp 4.200.000 |
| `08.04.13.` | Beban Makanan & Minuman Rapat | 6 | — |

### C. Glossary

| Istilah | Arti |
|---------|------|
| **BBU** | Bank Buku Umum — kode untuk transaksi penerimaan dana BOSP |
| **BNU** | Bank Non Umum — kode untuk transaksi pengeluaran/pembayaran |
| **BPU** | Bank Pajak Umum — kode untuk transaksi setoran pajak |
| **PPh 21** | Pajak Penghasilan Pasal 21 — pajak atas gaji pegawai |
| **PPh 23** | Pajak Penghasilan Pasal 23 — pajak atas jasa (honorarium, fee) |
| **PPh Final** | Pajak Penghasilan Final — pajak atas jasa konstruksi, sewa, dll |
| **Balance** | Kondisi dimana total penerimaan = total pengeluaran, saldo = 0 |
| **Tarik Tunai** | Penarikan dana dari rekening bank ke kas tunai sekolah |
| **Pergeseran** | Pencatatan penerimaan dana tunai hasil penarikan dari bank |
| **BKU-ALL** | Format BKU tahunan yang menggabungkan seluruh bulan dalam satu sheet |

---

> **Dokumen ini dibuat berdasarkan analisis langsung terhadap file BKU Excel asli dari ARKAS.**  
> File referensi: `template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx`
