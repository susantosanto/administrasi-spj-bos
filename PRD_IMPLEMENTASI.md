# 📋 PRD: Implementasi Revisi + Template Engine LPJ BOS/BOSP

*Generated: 2026-07-08 | Version: 3.0*
*Status: PLAN — Siap Eksekusi*

---

## 📌 Executive Summary

Implementasi 3 area utama:
1. **Global Rename** — SPJ → LPJ di seluruh user-facing text
2. **Revisi Halaman** — Dashboard download, Dokumen LPJ interaktif, Dokumen Kelengkapan (renamed)
3. **Template Engine** — Data-driven React component untuk **13 template format** dari 4 file

> **Prinsip**: Satu card = banyak sub-kategori (pill/dropdown). Klik sub-kategori → modal template.

---

## 📚 Source Documents

| Dokumen | Lokasi | Fungsi dalam PRD |
|---------|--------|------------------|
| Revisi | `revisi.md` | Struktur card, sub-kategori, spesifikasi fitur |
| Research Template | `RESEARCH_TEMPLATE_ENGINE.md` | Arsitektur template engine, block components, clean code patterns |
| Template Analisis | `template/ANALISIS_TEMPLATE.md` | Struktur field tiap template, mapping kolom Excel/DOCX |
| Template Files | `template/` (4 file) | File asli untuk dijadikan referensi format |
| PRD Implementasi | `PRD_IMPLEMENTASI.md` | Dokumen ini — plan eksekusi |

---

## 🔗 Struktur Card di Aplikasi (Berdasarkan revisi.md)

### Prinsip: 1 Card = Banyak Sub-kategori

```
Card Honorarium
├── [Pill] Guru          → template: honor_guru (Excel)
├── [Pill] Tendik        → template: honor_tendik (Excel)
├── [Pill] Pelaksana     → ⚠️ belum ada template
├── [Pill] Perpustakaan  → template: honor_perpus (Excel)
└── [Pill] Penjaga       → template: honor_penjaga (Excel)
```

### Daftar Lengkap Card + Sub-kategori

#### 1. Card: HONORARIUM

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Guru | `honor_guru` | Excel sheet Honor_guru | ✅ Ada |
| Tendik | `honor_tendik` | Excel sheet Honor_tendik | ✅ Ada |
| Pelaksana | — | — | ⚠️ Belum ada template |
| Perpustakaan | `honor_perpus` | Excel sheet Honor_Perpus | ✅ Ada |
| Penjaga | `honor_penjaga` | Excel sheet Honor_penjaga | ✅ Ada |

> Klik card → pilih pill sub-kategori → buka modal template

---

#### 2. Card: PERJALANAN DINAS

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Rapat | `transpor_rapat` | Excel sheet Transpor_rapat | ✅ Ada |
| Workshop | — | — | ⚠️ Belum ada template |
| Koordinasi | `transpor_koordinasi` | Excel sheet Transpor_koordinasi | ✅ Ada |
| Bank | `transpor_bank` | Excel sheet Transpor_bank | ✅ Ada |
| Pendamping | `transpor_pendamping` | Excel sheet Transpor_pendamping | ✅ Ada |

> **Pendamping**: input khusus `nama_gugus` + `ketua_gugus`
> Klik card → pilih pill sub-kategori → buka modal template

---

#### 3. Card: MAKAN & MINUM (Mamin)

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Mamin Kegiatan | — | — | ⚠️ Belum ada template |
| Mamin Tamu | — | — | ⚠️ Belum ada template |
| Mamin Rapat | — | — | ⚠️ Belum ada template |
| Notulen | `notulen` | DOCX NOTULEN RAPAT | ✅ Ada |
| Buku Tamu | `buku_tamu` | DOCX BUKU TAMU KEDINASAN | ✅ Ada |

> **Mamin Kegiatan**: 2 kolom (IHT + Kegiatan)
> **Mamin Tamu**: tidak perlu daftar hadir
> **Notulen**: data mentah (raw data)
> **Buku Tamu**: ikuti ketentuan lebih lanjut

---

#### 4. Card: HONOR NARASUMBER

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(default)* | — | — | ⚠️ Belum ada template |

---

#### 5. Card: HONOR PELAKSANA

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(default)* | — | — | ⚠️ Belum ada template |

---

#### 6. Card: PENGGANDAAN

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(info only)* | — | — | ℹ️ Hanya informasi, tidak perlu action |

> Berdasarkan revisi.md: "Hanya informasi yang diperlukan untuk penggandaan. tidak ada action apapun yang diperlukan."

---

#### 7. Card: CETAK FOTO

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(info only)* | — | — | ℹ️ Hanya informasi, tidak perlu action |

---

#### 8. Card: CETAK BANNER

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(info only)* | — | — | ℹ️ Hanya informasi, tidak perlu action |

---

#### 9. Card: SEWA

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Sewa Mobilitas | — | — | ⚠️ Belum ada template |
| Sewa Peralatan | — | — | ⚠️ Belum ada template |
| Sewa Bangunan/Aula | — | — | ⚠️ Belum ada template |

> **Sewa Mobilitas**: wajib menyertakan Surat Perjanjian

---

#### 10. Card: PEMELIHARAAN

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Alat | `upah` | Excel sheet Upah | ✅ Ada |
| Mebeler | — | — | ⚠️ Belum ada template |
| Bangunan | — | — | ⚠️ Belum ada template |

> Berdasarkan revisi.md: "hanya informasi yang diperlukan untuk pemeliharaan. tidak ada action apapun yang diperlukan."
> Template `upah` = Daftar Bukti Penerima Upah Kerja Pemeliharaan

---

#### 11. Card: TAGIHAN

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Pulsa Internet | `pulsa` | Excel sheet Pulsa | ✅ Ada (info only) |
| *(lainnya)* | — | — | ℹ️ Ikuti ketentuan lebih lanjut |

> Berdasarkan revisi.md: "ikuti ketentuan lebih lanjut"
> Pulsa Internet masuk di sini, tapi status = hanya informasi (tidak perlu action form)

---

#### 12. Card: WORKSHOP

| Sub-kategori (Pill) | Config ID | Template Source | Status |
|--------------------|-----------|----------------|--------|
| Internal | — | — | ⚠️ Belum ada template |
| Eksternal (Gugus) | — | — | ⚠️ Belum ada template |

> **Internal**: dokumen = Permohonan Narasumber + Proposal
> **Eksternal**: _(ikuti ketentuan lebih lanjut)_

---

#### 13. Card: REKENING KORAN

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(default)* | — | — | ⚠️ Belum ada template |

---

#### 14. Card: REALISASI PENGGUNAAN DANA

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(default)* | — | — | ⚠️ Belum ada template |

---

#### 15. Card: INSTRUMEN LAPORAN BOS

| Sub-kategori | Config ID | Template Source | Status |
|-------------|-----------|----------------|--------|
| *(default)* | — | — | ⚠️ Belum ada template |

---

### Card yang Tidak Perlu Action (Info Only)

| Card | Sub-kategori | Keterangan |
|------|-------------|-----------|
| Penggandaan | — | Hanya informasi |
| Cetak Foto | — | Hanya informasi |
| Cetak Banner | — | Hanya informasi |
| Tagihan | Pulsa Internet | Hanya informasi (template ada tapi tidak dibuka form)
| Tagihan | *(lainnya)* | Ikuti ketentuan lebih lanjut |

> Card info only: klik → tampilkan deskripsi info, **tidak buka modal form/template**

---

## 🔗 Korelasi Template → Sub-kategori di Aplikasi

### 13 Template yang SUDAH Ada

| # | Config ID | Sub-kategori di Card | Card | Template Source |
|---|-----------|---------------------|------|----------------|
| 1 | `honor_guru` | Honorarium → Guru | HONORARIUM | Excel sheet 2 |
| 2 | `honor_tendik` | Honorarium → Tendik | HONORARIUM | Excel sheet 3 |
| 3 | `honor_perpus` | Honorarium → Perpustakaan | HONORARIUM | Excel sheet 4 |
| 4 | `honor_penjaga` | Honorarium → Penjaga | HONORARIUM | Excel sheet 5 |
| 5 | `transpor_rapat` | Perjalanan Dinas → Rapat | PERJALANAN DINAS | Excel sheet 8 |
| 6 | `transpor_koordinasi` | Perjalanan Dinas → Koordinasi | PERJALANAN DINAS | Excel sheet 7 |
| 7 | `transpor_bank` | Perjalanan Dinas → Bank | PERJALANAN DINAS | Excel sheet 6 |
| 8 | `transpor_pendamping` | Perjalanan Dinas → Pendamping | PERJALANAN DINAS | Excel sheet 9 |
| 9 | `sppd` | Perjalanan Dinas → *(dokumen SPPD)* | PERJALANAN DINAS | DOCX |
| 10 | `notulen` | Mamin → Notulen | MAKAN & MINUM | DOCX |
| 11 | `buku_tamu` | Mamin → Buku Tamu | MAKAN & MINUM | DOCX |
| 12 | `upah` | Pemeliharaan → *(Upah Kerja)* | PEMELIHARAAN | Excel sheet 10 |
| 13 | `pulsa` | Tagihan → Pulsa Internet | TAGIHAN | Excel sheet 11 |

> **Pulsa** masuk ke card Tagihan, status = info only

---

## 📝 PHASE 1: Global Rename (SPJ → LPJ)

### 1.1. Scope Replace

| Target | Replace | Lokasi |
|--------|---------|--------|
| `SPJ` | `LPJ` | Sidebar, heading, tombol, stat cards |
| `Surat Pertanggungjawaban` | `Laporan Pertanggungjawaban` | Landing page |
| `SPJ BOS/BOSP` | `LPJ BOS/BOSP` | Title, hero, meta |

> ⚠️ **JANGAN replace**: `spj_` localStorage prefix, nama komponen

### 1.2. Route Rename

```
/dokumen-wajib → /dokumen-kelengkapan (redirect lama ke baru)
```

### 1.3. Sidebar Update

```js
// Sesudah
{ label: 'Dokumen LPJ', path: '/dokumen-lpj' }
{ label: 'Dokumen Kelengkapan', path: '/dokumen-kelengkapan' }
```

---

## 📝 PHASE 2: Dashboard — Download Section

6 kartu download: PERMENDAGRI, Juknis BOSP, TKA, PERBUP, SSH, Permendikbudristek No.18

---

## 📝 PHASE 3: Template Engine — Core Architecture

### 3.1. Arsitektur

> **Detail arsitektur**: Lihat `RESEARCH_TEMPLATE_ENGINE.md` bagian 1-3 (Arsitektur Template Engine, Arsitektur Detail, Block Components)

```
templateConfig (JSON) → TemplateEngine.jsx → Block Components
                                               ├── KopSurat
                                               ├── HeaderDokumen
                                               ├── TabelFields
                                               ├── TabelDinamis
                                               ├── InfoKeuangan
                                               ├── PoinPembahasan
                                               ├── UraianKegiatan
                                               └── SignatureFooter
```

### 3.2. Data Flow

```
User klik card → pilih pill sub-kategori → Modal buka
  → TemplateEngine baca config dari templateConfig.js
  → Render blocks berurutan
  → User isi form → state update → preview real-time
  → Klik "Cetak" → window.print()
  → Data disimpan ke localStorage
```

### 3.3. Block Types

> **Implementasi block**: Lihat `RESEARCH_TEMPLATE_ENGINE.md` bagian 2.3 (Block Components) untuk kode contoh setiap block

| Type | Komponen | Fungsi | Dipakai di | Ref Kode |
|------|----------|--------|-----------|----------|
| `kop-surat` | KopSurat.jsx | Header pemerintah + sekolah | Semua | RESEARCH §2.3 KopSurat |
| `header` | HeaderDokumen.jsx | Judul + nomor | Semua | RESEARCH §2.3 HeaderDokumen |
| `table-fields` | TabelFields.jsx | Form key-value | sppd, notulen, buku_tamu | RESEARCH §2.3 TabelFields |
| `table-dinamis` | TabelDinamis.jsx | Tabel + baris dinamis | honor_*, transpor_*, upah | RESEARCH §2.3 TabelDinamis |
| `info-keuangan` | InfoKeuangan.jsx | Program, Kegiatan, Kode Rekening | honor_*, transpor_*, upah | RESEARCH §2.3 InfoKeuangan |
| `poin-pembahasan` | PoinPembahasan.jsx | Notulen poin-poin | notulen | RESEARCH §2.3 PoinPembahasan |
| `uraian-kegiatan` | UraianKegiatan.jsx | Text area bebas | buku_tamu | RESEARCH §2.3 UraianKegiatan |
| `signature` | SignatureFooter.jsx | TTD pejabat | Semua | RESEARCH §2.3 SignatureFooter |

---

## 📝 PHASE 4: Template Config — 13 Template

### A. SPPD (DOCX)

```js
sppd: {
  id: 'sppd',
  label: 'Surat Perintah Tugas + SPD',
  card: 'perjalanan-dinas',
  sub_kategori: 'sppd',
  sourceFile: '/templates/Surat Tugas + SPPD_rapat ops_gugus_2026.docx',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'SURAT PERINTAH TUGAS', nomor: true },
    { type: 'table-fields', fields: [
      { key: 'nama', label: 'Nama', type: 'text' },
      { key: 'nip', label: 'NIP', type: 'text' },
      { key: 'jabatan', label: 'Jabatan', type: 'text' },
      { key: 'pangkat', label: 'Pangkat/Golongan', type: 'text' },
      { key: 'tujuan', label: 'Untuk', type: 'textarea' },
      { key: 'hari', label: 'Hari', type: 'text' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'tempat', label: 'Tempat', type: 'text' },
    ]},
    { type: 'signature', roles: ['kepala-sekolah'] },
  ],
  defaults: { nomorSurat: '400.3.7.6/___-SD/2026', tempat: 'SD Negeri Cipada', hari: 'Jumat' }
}
```

### B. Notulen (DOCX)

```js
notulen: {
  id: 'notulen',
  label: 'Notulen Rapat',
  card: 'mamin',
  sub_kategori: 'notulen',
  sourceFile: '/templates/NOTULEN RAPAT.docx',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'NOTULA RAPAT' },
    { type: 'table-fields', fields: [
      { key: 'hari', label: 'Hari', type: 'text' },
      { key: 'tanggal', label: 'Tanggal', type: 'date' },
      { key: 'waktu', label: 'Waktu', type: 'text' },
      { key: 'tempat', label: 'Tempat', type: 'text' },
      { key: 'acara', label: 'Acara', type: 'textarea' },
      { key: 'pimpinan', label: 'Pimpinan Rapat', type: 'text' },
      { key: 'pembuka', label: 'Rapat dibuka oleh', type: 'text' },
      { key: 'notulen', label: 'Notulen', type: 'text' },
      { key: 'peserta', label: 'Peserta Rapat', type: 'text' },
    ]},
    { type: 'poin-pembahasan', label: 'Rapat membahas dan menyimpulkan sebagai berikut' },
    { type: 'signature', roles: ['pimpinan', 'notulen'] },
  ],
  defaults: { tempat: 'SD NEGERI LEBAKLEUNGSIR' }
}
```

### C. Buku Tamu (DOCX)

```js
buku_tamu: {
  id: 'buku_tamu',
  label: 'Buku Tamu Kedinasan',
  card: 'mamin',
  sub_kategori: 'buku-tamu',
  sourceFile: '/templates/BUKU TAMU KEDINASAN.docx',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'BUKU TAMU KEDINASAN' },
    { type: 'table-fields', fields: [
      { key: 'noUrut', label: 'No. Urut', type: 'number' },
      { key: 'tanggal', label: 'Hari/Tanggal', type: 'date' },
      { key: 'bertemu', label: 'Ingin bertemu dengan', type: 'select', options: ['Kepala Sekolah', 'Guru', 'Tendik'] },
      { key: 'tiba', label: 'Tiba Pukul', type: 'time' },
      { key: 'kembali', label: 'Kembali Pukul', type: 'time' },
    ]},
    { type: 'table-dinamis', columns: [
      { key: 'no', label: 'No.', width: 5 },
      { key: 'nama', label: 'NAMA', width: 25 },
      { key: 'jabatan', label: 'JABATAN', width: 20 },
      { key: 'alamat', label: 'ALAMAT KANTOR', width: 30 },
      { key: 'ttd', label: 'TANDA TANGAN', width: 20 },
    ]},
    { type: 'uraian-kegiatan', label: 'URAIAN KEGIATAN/TEMUAN/SARAN/PESAN' },
    { type: 'signature', roles: ['kepala-sekolah'] },
  ],
}
```

### D. Honor Guru (Excel)

```js
honor_guru: {
  id: 'honor_guru',
  label: 'Honor Guru Tidak Tetap',
  card: 'honorarium',
  sub_kategori: 'guru',
  sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
  sourceSheet: 'Honor_guru',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'DAFTAR PENERIMA HONORARIUM/GAJI GURU TIDAK TETAP (PEMBAYARAN NON TUNAI)' },
    { type: 'info-keuangan', fields: ['program', 'kegiatan', 'kodeRekening'] },
    { type: 'table-dinamis', columns: [
      { key: 'no', label: 'No', width: 5 },
      { key: 'nama', label: 'NAMA PTK', width: 20 },
      { key: 'nuptk', label: 'NUPTK', width: 15 },
      { key: 'jabatan', label: 'JABATAN', width: 15 },
      { key: 'cost_guru', label: 'Cost Guru', width: 10, format: 'currency' },
      { key: 'cost_tas', label: 'Cost TAS/Operator', width: 10, format: 'currency' },
      { key: 'cost_ekskul', label: 'Cost Pembina Ekskul', width: 10, format: 'currency' },
      { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency', computed: 'cost_guru+cost_tas+cost_ekskul' },
      { key: 'gol', label: 'Gol./Ruang', width: 8 },
      { key: 'vol', label: 'VOL', width: 5 },
      { key: 'satuan', label: 'Satuan', width: 7 },
      { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
      { key: 'diterima', label: 'YANG DITERIMA', width: 12, format: 'currency', computed: 'jumlah-pph' },
    ]},
    { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
  ],
  defaults: {
    bulan: 'Januari', tahun: '2026',
    program: '07 Pengembangan Standar Pembiayaan',
    kegiatan: 'Pembayaran Honor Guru',
    kodeRekening: '5.1.02.02.01.0013',
    vol: 1, satuan: 'Bulan',
  }
}
```

### E. Honor Tendik (Excel)

```js
honor_tendik: {
  id: 'honor_tendik',
  label: 'Honor Tenaga Administrasi Sekolah',
  card: 'honorarium',
  sub_kategori: 'tendik',
  sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
  sourceSheet: 'Honor_tendik',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'DAFTAR PENERIMA HONORARIUM/GAJI TENAGA ADMINISTRASI SEKOLAH TIDAK TETAP (PEMBAYARAN NON TUNAI)' },
    { type: 'info-keuangan', fields: ['program', 'kegiatan', 'kodeRekening'] },
    { type: 'table-dinamis', columns: [
      { key: 'no', label: 'No', width: 5 },
      { key: 'nama', label: 'NAMA PTK', width: 22 },
      { key: 'jabatan', label: 'JABATAN', width: 15 },
      { key: 'cost_tas', label: 'Cost TAS/Operator', width: 10, format: 'currency' },
      { key: 'cost_guru', label: 'Cost Guru', width: 10, format: 'currency' },
      { key: 'cost_ekskul', label: 'Cost Pembina Ekskul', width: 10, format: 'currency' },
      { key: 'cost_perpus', label: 'Cost Tenaga Perpustakaan', width: 10, format: 'currency' },
      { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency' },
      { key: 'gol', label: 'Gol./Ruang', width: 8 },
      { key: 'vol', label: 'VOL', width: 5 },
      { key: 'satuan', label: 'Satuan', width: 7 },
      { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
      { key: 'diterima', label: 'YANG DITERIMA', width: 12, format: 'currency' },
    ]},
    { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
  ],
  defaults: {
    bulan: 'Januari', tahun: '2026',
    program: '07 Pengembangan Standar Pembiayaan',
    kegiatan: 'Pembayaran Honor Tenaga Kependidikan',
    kodeRekening: '5.1.02.02.01.0013',
    vol: 1, satuan: 'Bulan', gol: 'PTT',
  }
}
```

### F-J. Honor Perpus / Penjaga / Transpor Bank / Koordinasi / Rapat / Pendamping

> Struktur sama — beda di: judul, kolom cost breakdown, kegiatan, kode rekening.
> **Field detail**: Lihat `template/ANALISIS_TEMPLATE.md` bagian 4 (Form. Honor) untuk mapping kolom Excel lengkap.

### K. Upah (Excel)

```js
upah: {
  id: 'upah',
  label: 'Upah Kerja Pemeliharaan',
  card: 'pemeliharaan',
  sub_kategori: 'alat',
  sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
  sourceSheet: 'Upah',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'DAFTAR BUKTI PENERIMA JASA/UPAH KERJA PEMELIHARAAN HALAMAN SEKOLAH' },
    { type: 'info-keuangan', fields: ['program', 'kegiatan', 'kodeRekening'] },
    { type: 'table-dinamis', columns: [
      { key: 'no', label: 'No', width: 5 },
      { key: 'nama', label: 'NAMA PTK', width: 22 },
      { key: 'jabatan', label: 'JABATAN', width: 15 },
      { key: 'gol', label: 'Gol./Ruang', width: 8 },
      { key: 'vol', label: 'VOLUME', width: 8 },
      { key: 'satuan', label: 'SATUAN', width: 10 },
      { key: 'unit_cost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
      { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency', computed: 'vol*unit_cost' },
      { key: 'pph', label: 'PPh 21', width: 10, format: 'currency' },
      { key: 'diterima', label: 'YANG DITERIMA', width: 12, format: 'currency', computed: 'jumlah-pph' },
    ]},
    { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
  ],
  defaults: {
    program: '05 Pengembangan Standar Sarpras',
    kegiatan: 'Upah Kerja Pemeliharaan',
    kodeRekening: '5.1.02.02.01.0016',
    satuan: 'Hari', unit_cost: 125000,
  }
}
```

### L. Pulsa (Excel) — Info Only

```js
pulsa: {
  id: 'pulsa',
  label: 'Pulsa Internet Operator',
  card: 'tagihan',
  sub_kategori: 'pulsa-internet',
  infoOnly: true, // tidak buka modal form, hanya info
  sourceFile: '/templates/Form. Honor_2026_SDN lebakleungsir.xlsx',
  sourceSheet: 'Pulsa',
  blocks: [
    { type: 'kop-surat' },
    { type: 'header', judul: 'DAFTAR PENERIMA KUOTA/PULSA INTERNET OPERATOR' },
    { type: 'info-keuangan', fields: ['program', 'kegiatan', 'kodeRekening'] },
    { type: 'table-dinamis', columns: [
      { key: 'no', label: 'No', width: 5 },
      { key: 'nama', label: 'NAMA PTK', width: 22 },
      { key: 'jabatan', label: 'JABATAN', width: 15 },
      { key: 'no_hp', label: 'NOMOR HP', width: 15 },
      { key: 'vol', label: 'VOL', width: 5 },
      { key: 'satuan', label: 'SATUAN', width: 8 },
      { key: 'unit_cost', label: 'UNIT COST (Rp)', width: 12, format: 'currency' },
      { key: 'jumlah', label: 'JUMLAH (Rp)', width: 12, format: 'currency', computed: 'vol*unit_cost' },
    ]},
    { type: 'signature', roles: ['kepala-sekolah', 'bendahara'] },
  ],
  defaults: {
    program: '06 Pengembangan Standar Pengelolaan',
    kegiatan: 'Pengisian Pulsa Internet',
    kodeRekening: '5.1.02.02.01.0063',
    vol: 1, satuan: 'Paket', unit_cost: 105000,
  }
}
```

---

## 📝 PHASE 5: Dokumen Kelengkapan Page (ex-Dokumen Wajib)

- Rename: Sidebar, Route, Page file
- Content: 7 cards (proposal, proker, surat menyurat, blanko hadir, surat undangan, cover, sekat)
- Toggle SIPLAH tetap ada, upload button tidak ada

---

## 📝 PHASE 6: Dokumen LPJ Page — Struktur Card + Template Engine

### Card Info Only (tanpa modal form)

| Card | Keterangan |
|------|-----------|
| Penggandaan | Info: "Hanya informasi penggandaan. Tidak perlu action." |
| Cetak Foto | Info: "Bukti dokumentasi foto." |
| Cetak Banner | Info: "Bukti foto banner/spanduk." |
| Tagihan | Info: "Ikuti ketentuan lebih lanjut." |

### Card dengan Sub-kategori (pill dropdown)

| Card | Sub-kategori | Config ID | Status |
|------|-------------|-----------|--------|
| HONORARIUM | Guru | `honor_guru` | ✅ |
| | Tendik | `honor_tendik` | ✅ |
| | Pelaksana | — | ⚠️ |
| | Perpustakaan | `honor_perpus` | ✅ |
| | Penjaga | `honor_penjaga` | ✅ |
| PERJALANAN DINAS | Rapat | `transpor_rapat` | ✅ |
| | Workshop | — | ⚠️ |
| | Koordinasi | `transpor_koordinasi` | ✅ |
| | Bank | `transpor_bank` | ✅ |
| | Pendamping | `transpor_pendamping` | ✅ |
| | SPPD | `sppd` | ✅ |
| MAKAN & MINUM | Mamin Kegiatan | — | ⚠️ |
| | Mamin Tamu | — | ⚠️ |
| | Mamin Rapat | — | ⚠️ |
| | Notulen | `notulen` | ✅ |
| | Buku Tamu | `buku_tamu` | ✅ |
| SEWA | Mobilitas | — | ⚠️ |
| | Peralatan | — | ⚠️ |
| | Bangunan/Aula | — | ⚠️ |
| PEMELIHARAAN | Alat | `upah` | ✅ |
| | Mebeler | — | ⚠️ |
| | Bangunan | — | ⚠️ |
| WORKSHOP | Internal | — | ⚠️ |
| | Eksternal | — | ⚠️ |

---

## ⏱️ Execution Plan

> **Scope**: 3 DOCX + 1 Excel (10 sheet) = **13 template format**

### Tahap 1: Global Rename (Hari ke-1)
- [ ] `Sidebar.jsx` — rename + route + icon
- [ ] `App.jsx` — route update + redirect
- [ ] `Topbar.jsx` — SPJ→LPJ
- [ ] `LandingPage.jsx` — SPJ→LPJ
- [ ] `LoginPage.jsx` — SPJ→LPJ
- [ ] `DashboardHome.jsx` — SPJ→LPJ
- [ ] Build test

### Tahap 2: Dashboard Download (Hari ke-1)
- [ ] `DashboardHome.jsx` — tambah download section
- [ ] Buat placeholder PDF di `public/docs/`

### Tahap 3: Template Engine Core (Hari ke-2)

> **Ikuti arsitektur**: `RESEARCH_TEMPLATE_ENGINE.md` bagian 2 (Arsitektur Detail) + 3 (Clean Code Patterns)

- [ ] Buat `templateHelpers.js` (RESEARCH §3.3 format helpers)
- [ ] Buat `signatureRoles.js` + `sekolahData.js`
- [ ] Buat 8 block components (RESEARCH §2.3)
- [ ] Buat `TemplateEngine.jsx` (RESEARCH §2.2)
- [ ] Test dengan `notulen`

### Tahap 4: Template Config — 13 Template (Hari ke-2-3)

> **Field mapping**: Lihat `template/ANALISIS_TEMPLATE.md` untuk setiap sheet Excel (kolom, header, data penerima)

- [ ] Buat `templateConfig.js` dengan 13 config:
  - DOCX: `sppd`, `notulen`, `buku_tamu` (ANALISIS §1-3)
  - Excel: `honor_guru/tendik/perpus/penjaga`, `transpor_*`, `upah`, `pulsa` (ANALISIS §4)

### Tahap 5: Dokumen Kelengkapan Page (Hari ke-3)
- [ ] Rename + rewrite + route

### Tahap 6: Dokumen LPJ Page (Hari ke-3-4)
- [ ] Tambah pill sub-kategori ke card yang punya banyak sub-tipe
- [ ] Integrasikan TemplateEngine ke 13 sub-kategori
- [ ] Card info only: Penggandaan, Cetak Foto, Cetak Banner, Tagihan (Pulsa Internet = sub-kategori info)

### Tahap 7: CSS Print + Final (Hari ke-4-5)
- [ ] Print CSS A4
- [ ] Test cetak 13 template
- [ ] Responsive testing
- [ ] Build + push

---

## ✅ Definition of Done

- [ ] SPJ → LPJ (user-facing text)
- [ ] Dokumen Wajib → Dokumen Kelengkapan
- [ ] Dashboard: 6 download cards
- [ ] Template Engine render 13 template
- [ ] Card HONORARIUM punya pill: Guru, Tendik, Perpustakaan, Penjaga (+ Pelaksana placeholder)
- [ ] Card PERJALANAN DINAS punya pill: Rapat, Koordinasi, Bank, Pendamping, SPPD (+ Workshop placeholder)
- [ ] Card MAKAN & MINUM punya pill: Notulen, Buku Tamu (+ Mamin Kegiatan/Tamu/Rapat placeholder)
- [ ] Card PEMELIHARAAN punya pill: Alat (upah template) (+ Mebeler/Bangunan placeholder)
- [ ] Card info only: Penggandaan, Cetak Foto, Cetak Banner, Tagihan (termasuk Pulsa Internet)
- [ ] Cetak via browser = A4 rapi
- [ ] Build passing
