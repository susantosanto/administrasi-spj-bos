# 🔄 Revisi Aplikasi SPJ BOS/BOSP

> Dokumen referensi revisi fitur untuk pengembangan aplikasi SPJ BOS/BOSP.
> Format dirancang agar mudah dipahami oleh **AI Agent** — struktur jelas, konsisten, dan machine-readable.

---

## 1. Dashboard — Penambahan Fitur Unduhan

Tambahkan **tombol/section download** di Dashboard untuk mengunduh dokumen referensi berikut:

| No | Dokumen | Keterangan |
|----|---------|------------|
| 1 | **PERMENDAGRI** | Peraturan Menteri Dalam Negeri terkait |
| 2 | **PERMENDIKDASMEN Juknis BOSP** | Juknis BOSP dari Kemendikdasmen |
| 3 | **PERMENDIKDASMEN TKA** | TKA dari Kemendikdasmen |
| 4 | **PERBUP Kab. Bandung Barat** | Peraturan Bupati tentang transaksi tunai & non tunai |
| 5 | **Standar Satuan Harga (SSH)** | SSH tahun terkini |
| 6 | **PERMENDIKBUDRISTEK No. 18 Th 2022** | Permendikbudristek nomor 18 tahun 2022 |

**Spec:**
- Tampilkan sebagai daftar/kartu download di halaman Dashboard
- Setiap item: judul + tombol/ikon download
- File bisa berupa PDF yang disimpan di `public/` atau link eksternal

---

## 2. Klasifikasi Surat / Dokumen SPJ

---

### 2.2. Perjalanan Dinas

Setiap sub-jenis Perjalanan Dinas memiliki **satu ruangan (modal/form)** sendiri.

| Sub-jenis | Input Data | Output |
|-----------|-----------|--------|
| **Rapat** | data rapat | dokumen SP perjalanan dinas |
| **Workshop** | data workshop | dokumen SP perjalanan dinas |
| **Koordinasi** | data koordinasi | dokumen SP perjalanan dinas |
| **Bank** | data bank | dokumen SP perjalanan dinas |
| **Pendamping** | nama gugus + ketua gugus | dokumen SP perjalanan dinas |

**Rule:**
- Masing-masing sub-jenis memiliki form input terpisah
- Khusus **Pendamping**: input berupa `nama_gugus` dan `ketua_gugus`

---

### 2.3. Upah

  - Sediakan **checkbox (ceklis)** untuk akumulasi pembayaran berdasarkan jumlah kehadiran.
  - Contoh: jika hadir 3x, total upah = 3 × tarif per kehadiran.

---

### 2.4. Mamin (Makan & Minum)

#### a. Mamin Kegiatan

Satu ruangan dengan **2 kolom**:

| Kolom | Dokumen Pendukung |
|-------|------------------|
| **IHT** | Surat Undangan, Daftar Hadir (Peserta + Narasumber), Dokumentasi |
| **Kegiatan** | SP (Surat Perintah), Daftar Hadir, Dokumentasi |

#### b. Mamin Tamu

  - Tidak perlu daftar hadir.

#### c. Mamin Buku Tamu

  - _(ikuti ketentuan lebih lanjut)_

---

### 2.5. Notulen

  ikuti: data mentah (raw data)

---

### 2.6. Penggandaan

Hanya informasi yang diperlukan untuk penggandaan. tidak ada action apapun yang diperlukan.

---

### 2.7. Sewa

Tampilkan **3 kolom**:

| Kolom | Keterangan | Dokumen |
|-------|-----------|---------|
| **Sewa Mobilitas** | kendaraan, transportasi | Surat Perjanjian |
| **Sewa Peralatan** | alat, perlengkapan | - |
| **Sewa Bangunan/Aula** | gedung, ruangan | - |

**Spec:**
- Sewa Mobilitas wajib menyertakan **Surat Perjanjian**

---

### 2.8. Pemeliharaan

hanya informasi yang diperlukan untuk pemeliharaan. tidak ada action apapun yang diperlukan.

---

### 2.9. Tagihan

  _(ikuti ketentuan lebih lanjut)_

---

### 2.10. Workshop

#### a. Workshop Internal

  dokumen:
    - Permohonan Narasumber
    - Proposal

#### b. Workshop Eksternal (Gugus)

  _(ikuti ketentuan lebih lanjut)_

---

## 3. Dokumen Kelengkapan

Kumpulan dokumen pendukung yang bersifat **kelengkapan**:

| Dokumen | Keterangan |
|---------|-----------|
| **Kumpulan Proposal** | Arsip proposal kegiatan |
| **Kumpulan Program Kerja (Proker)** | Arsip program kerja |
| **Kumpulan Surat Menyurat** | Arsip surat keluar/masuk |
| **Kumpulan Blanko Daftar Hadir** | Template daftar hadir |
| **Kumpulan Surat Undangan** | Arsip undangan kegiatan |
| **Kumpulan Cover** | Kumpulan cover dokumen |
| **Kumpulan Sekat** | Kumpulan sekat/pemisah dokumen |

---

## 📋 Ringkasan Perubahan per Halaman

| Halaman | Perubahan |
|---------|-----------|
| **Dashboard** | + Fitur download 6 dokumen referensi (Permendagri, Juknis, dll) |
| **Dokumen SPJ - Honorarium** | Sub-jenis: honorer |
| **Dokumen SPJ - Perjalanan Dinas** | 5 sub-jenis dengan form terpisah (Rapat, Workshop, Koordinasi, Bank, Pendamping) |
| **Dokumen SPJ - Upah** | + Checkbox akumulasi kehadiran |
| **Dokumen SPJ - Mamin** | Mamin Kegiatan: 2 kolom (IHT + Kegiatan). Mamin Tamu: tanpa daftar hadir |
| **Dokumen SPJ - Notulen** | Data mentah |
| **Dokumen SPJ - Penggandaan** | Berita acara saja |
| **Dokumen SPJ - Sewa** | 3 kolom (Mobilitas + Surat Perjanjian, Peralatan, Bangunan) |
| **Dokumen SPJ - Pemeliharaan** | 3 jenis (Alat, Mebeler, Bangunan) — berita acara |
| **Dokumen SPJ - Workshop** | Internal: Permohonan Narsum + Proposal. Eksternal: menyusul |
| **Dokumen Kelengkapan** | 7 jenis kumpulan dokumen |
| **Seluruh Aplikasi** | Judul "Dokumen Wajib" → "Dokumen Kelengkapan" |
| **Seluruh Aplikasi** | Dokumen Kelengkapan dipindah dari halaman SPJ ke halaman sendiri |
| **Seluruh Aplikasi** | Global replace kata "SPJ" → "LPJ" (user-facing text) |

---

## 4. Perubahan Global / Seluruh Aplikasi

| # | Perubahan | Keterangan |
|---|-----------|------------|
| 1 | **Ubah judul "Dokumen Wajib" → "Dokumen Kelengkapan"** | Judul halaman & navigasi sidebar diganti |
| 2 | **Pindahkan section Dokumen Kelengkapan dari halaman "Dokumen SPJ"** | Semua konten Dokumen Kelengkapan dipindah ke halaman "Dokumen Kelengkapan" (ex-Dokumen Wajib) |
| 3 | **Ubah kata "SPJ" → "LPJ" di seluruh aplikasi** | Global replace: semua teks, judul, navigasi, tombol yang mengandung "SPJ" diganti "LPJ" |

### 4.1. Detail Perubahan Global

#### a. Halaman "Dokumen Wajib" → "Dokumen Kelengkapan"
- Ubah `DokumenWajibPage.jsx` → judul halaman jadi "Dokumen Kelengkapan"
- Ubah navigasi di `Sidebar.jsx` → label jadi "Dokumen Kelengkapan"
- Route `/dokumen-wajib` tetap bisa dipertahankan atau diubah jadi `/dokumen-kelengkapan`
- icon sidebar bisa diganti jadi `folder` atau `description`

#### b. Pindahkan Dokumen Kelengkapan dari Dokumen SPJ
- Semua card section **Dokumen Kelengkapan** (7 jenis: Proposal, Proker, Surat Menyurat, Blanko Daftar Hadir, Surat Undangan, Cover, Sekat) yang saat ini ada di `DokumenSPJPage.jsx` → **hapus dari halaman Dokumen SPJ**
- Pindahkan ke `DokumenWajibPage.jsx` (yang sudah diubah jadi halaman "Dokumen Kelengkapan")
- Di halaman baru, tampilkan sebagai card grid seperti di Dokumen SPJ

#### c. Global Replace "SPJ" → "LPJ"
Cari dan ganti di seluruh file source:

| Cari | Ganti | Contoh Lokasi |
|------|-------|--------------|
| `SPJ` | `LPJ` | Judul halaman, navigasi sidebar, heading |
| `spj` | `lpj` | Nama route, variable, localStorage key? |
| `Surat Pertanggungjawaban` | `Laporan Pertanggungjawaban` | Landing page, footer |
| `SPJ BOS/BOSP` | `LPJ BOS/BOSP` | Hero, title tags |

> ⚠️ **Hati-hati**: Jangan replace "SPJ" yang merupakan bagian dari nama file, component, atau kode teknis lainnya. Fokus pada **user-facing text** saja.

---

## 🏷️ Format Data untuk AI Agent

Gunakan format berikut untuk menyimpan konfigurasi revisi di kode:

```js
// Contoh struktur data untuk AI Agent
const REVISI_CONFIG = {
  dashboard: {
    unduhan: [
      { id: 'permendagri', label: 'PERMENDAGRI', file: 'permendagri.pdf' },
      { id: 'juknis-bosp', label: 'PERMENDIKDASMEN Juknis BOSP', file: 'juknis_bosp.pdf' },
      { id: 'tka', label: 'PERMENDIKDASMEN TKA', file: 'tka.pdf' },
      { id: 'perbup', label: 'PERBUP Bandung Barat', file: 'perbup_bb.pdf' },
      { id: 'ssh', label: 'Standar Satuan Harga (SSH)', file: 'ssh.pdf' },
      { id: 'permendikbudristek-18-2022', label: 'PERMENDIKBUDRISTEK No.18/2022', file: 'permendikbudristek_18_2022.pdf' },
    ]
  },
  dokumenSPJ: {
    honorarium: { subjenis: ['honorer'] },
    perjalananDinas: {
      subjenis: ['rapat', 'workshop', 'koordinasi', 'bank', 'pendamping'],
      pendampingFields: ['nama_gugus', 'ketua_gugus']
    },
    upah: { checkboxAkumulasi: true },
    mamin: {
      kegiatan: { kolom: ['IHT', 'Kegiatan'] },
      tamu: { daftarHadir: false }
    },
    notulen: { mode: 'data-mentah' },
    penggandaan: { hanya: 'berita-acara' },
    sewa: { kolom: ['mobilitas', 'peralatan', 'bangunan'] },
    pemeliharaan: { jenis: ['alat', 'mebeler', 'bangunan'], hanya: 'berita-acara' },
    workshop: {
      internal: { dokumen: ['permohonan-narsum', 'proposal'] },
      eksternal: {} // menyusul
    }
  },
  dokumenKelengkapan: [
    'kumpulan-proposal',
    'kumpulan-proker',
    'kumpulan-surat-menyurat',
    'kumpulan-blanko-daftar-hadir',
    'kumpulan-surat-undangan',
    'kumpulan-cover',
    'kumpulan-sekat'
  ],
  globalChanges: {
    renameDokumenWajibToKelengkapan: true,
    moveKelengkapanFromSPJ: true,
    replaceSpjWithLpj: {
      targetTexts: ['SPJ', 'spj', 'Surat Pertanggungjawaban', 'SPJ BOS/BOSP'],
      replaceWith: ['LPJ', 'lpj', 'Laporan Pertanggungjawaban', 'LPJ BOS/BOSP'],
      scope: 'user-facing-text-only' // jangan replace di kode teknis
    }
  }
}
```
