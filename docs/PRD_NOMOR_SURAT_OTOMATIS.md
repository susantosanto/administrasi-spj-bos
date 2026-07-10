# 📄 Product Requirements Document (PRD)
## Fitur: Generate Nomor Surat Keluar Otomatis

---

## 📋 Table of Contents

1. [Overview](#1-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Target Audience](#3-target-audience)
4. [User Stories](#4-user-stories)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Design Considerations](#7-design-considerations)
8. [Data Model](#8-data-model)
9. [Numbering Format](#9-numbering-format)
10. [Success Metrics](#10-success-metrics)
11. [Open Questions](#11-open-questions)

---

## 1. Overview

### 1.1 Product Context

**Nama Fitur:** Generate Nomor Surat Keluar Otomatis

**Aplikasi:** LPJ BOS/BOSP - Aplikasi Administrasi Sekolah

**Versi:** 1.0

**Tanggal:** 10 Juli 2026

### 1.2 Problem Statement

Operator sekolah mengalami masalah dengan penomoran surat:
- Nomor surat sering terduplikasi
- Format nomor tidak konsisten
- Sulit melacak surat mana yang sudah dibuat
- Lupa nomor terakhir yang digunakan
- Manual tracking di Excel/Kertas

### 1.3 Solution Overview

Fitur yang secara otomatis:
- Generate nomor surat berdasarkan format yang ditentukan
- Mencegah duplikasi nomor
- Menampilkan daftar nomor yang sudah digunakan
- Tracking otomatis tanpa perlu catatan manual

### 1.4 Scope

**In Scope:**
- ✅ Auto-generate nomor surat
- ✅ Format penomoran yang fleksibel
- ✅ Daftar nomor yang sudah digunakan
- ✅ Preview nomor sebelum digunakan
- ✅ Filter & search nomor surat
- ✅ Copy nomor ke clipboard

**Out of Scope:**
- ❌ Integrasi dengan sistem eksternal
- ❌ Approval workflow
- ❌ Status surat (dikirim/diterima)
- ❌ Ekspor daftar nomor

---

## 2. Goals & Objectives

### 2.1 Business Goals

| Goal | Metric | Target |
|------|--------|--------|
| Eliminasi duplikasi | Duplikasi rate | Dari ~5% → 0% |
| Hemat waktu | Waktu numbering | Dari 2-3 menit → detik |
| Konsistensi format | Format compliance | 100% konsisten |
| Kemudahan tracking | Waktu cari nomor | <5 detik |

### 2.2 User Goals

- Tidak perlu ingat nomor terakhir
- Tidak ada duplikasi nomor
- Format selalu benar
- Bisa melihat nomor yang sudah dipakai

### 2.3 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Duplikasi nomor | ~5% | 0% | Audit |
| Waktu numbering | 2-3 menit | <5 detik | User tracking |
| User error rate | ~8% | 0% | Error logs |
| User satisfaction | - | >4.5/5 | Survey |

---

## 3. Target Audience

### 3.1 Primary User

| Attribute | Detail |
|-----------|--------|
| **Role** | Operator Sekolah / TU |
| **Age** | 25-50 tahun |
| **Tech Skill** | Intermediate |
| **Frequency** | Setiap hari membuat surat |
| **Pain Point** | Lupa nomor, duplikasi, format salah |

### 3.2 Secondary User

| Attribute | Detail |
|-----------|--------|
| **Role** | Kepala Sekolah |
| **Purpose** | Verifikasi nomor surat |
| **Need** | Nomor surat terdaftar dan valid |

---

## 4. User Stories

### 4.1 User Stories Utama

```
US-01: Sebagai operator sekolah, saya ingin nomor surat digenerate 
       otomatis sehingga saya tidak perlu menghitung manual.

Acceptance Criteria:
- Nomor otomatis bertambah setiap kali digunakan
- Format sesuai template yang dipilih
- Tidak ada duplikasi
```

```
US-02: Sebagai operator sekolah, saya ingin melihat daftar nomor 
       yang sudah digunakan sehingga saya tahu nomor terakhir.

Acceptance Criteria:
- Daftar nomor ditampilkan dalam tabel
- Urutkan dari yang terbaru
- Tampilkan tanggal dan jenis surat
```

```
US-03: Sebagai operator sekolah, saya ingin mencari nomor surat 
       tertentu dengan cepat.

Acceptance Criteria:
- Search by nomor
- Filter by bulan/tahun
- Filter by jenis surat
```

```
US-04: Sebagai operator sekolah, saya ingin format nomor surat 
       bisa dikustomisasi sesuai kebutuhan sekolah.

Acceptance Criteria:
- Template format tersedia
- Kode sekolah bisa diatur
- Kode jenis surat bisa diatur
```

```
US-05: Sebagai operator sekolah, saya ingin copy nomor surat ke 
       clipboard dengan satu klik.

Acceptance Criteria:
- Tombol copy di sebelah nomor
- Notifikasi berhasil copy
- Format sesuai yang ditampilkan
```

```
US-06: Sebagai operator sekolah, saya ingin melihat detail nomor 
       surat beserta informasi terkait.

Acceptance Criteria:
- Klik nomor → detail view
- Tampilkan: jenis surat, tanggal, tujuan
- Tampilkan: apakah sudah di-print
```

---

## 5. Functional Requirements

### 5.1 Numbering System

#### 5.1.1 Format Penomoran

```
FORMAT DEFAULT:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  [KODE_SURAT]/[NOMOR_URUT]/[BULAN_ROMAWI]/[TAHUN]         │
│                                                             │
│  Contoh:                                                   │
│  STS/001/VII/2026                                          │
│  │    │    │    │                                           │
│  │    │    │    └── Tahun                                  │
│  │    │    └─────── Bulan (Romawi)                         │
│  │    └────────── Nomor urut (3 digit)                    │
│  └────────────── Kode Surat                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.1.2 Kode Surat

| Kode | Jenis Surat | Contoh |
|------|-------------|--------|
| STS | Surat Tugas | STS/001/VII/2026 |
| SK | Surat Keterangan | SK/001/VII/2026 |
| SU | Surat Undangan | SU/001/VII/2026 |
| SP | Surat Pernyataan | SP/001/VII/2026 |
| SKU | Surat Kuasa | SKU/001/VII/2026 |
| STL | Surat Telaah | STL/001/VII/2026 |
| SL | Surat Lingkungan | SL/001/VII/2026 |
| SN | Surat Nyata | SN/001/VII/2026 |

#### 5.1.3 Bulan Romawi

| Bulan | Romawi |
|-------|--------|
| Januari | I |
| Februari | II |
| Maret | III |
| April | IV |
| Mei | V |
| Juni | VI |
| Juli | VII |
| Agustus | VIII |
| September | IX |
| Oktober | X |
| November | XI |
| Desember | XII |

### 5.2 Auto-Increment Logic

```
ALGORITHM:

1. User pilih jenis surat (e.g., STS)
2. System check: bulan ini + tahun ini + jenis surat
3. Hitung nomor terakhir:
   - STS/003/VII/2026 → nomor = 3
4. Increment: 3 + 1 = 4
5. Generate: STS/004/VII/2026
6. Validasi: cek tidak ada duplikasi
7. Return nomor baru

RULES:
- Reset counter setiap bulan baru
- Nomor urut selalu 3 digit (001, 002, ...)
- Tidak ada skipping number
- Tidak ada reuse number
```

### 5.3 Interface Requirements

#### 5.3.1 Dashboard Nomor Surat

```
┌─────────────────────────────────────────────────────────────┐
│  🔢 NOMOR SURAT KELUAR                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 STATISTIK                                       │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  Bulan Ini: 23 surat │ Tahun Ini: 156 surat       │   │
│  │  Hari Ini: 5 surat   │ Terakhir: STS/023/VII/2026 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🔢 GENERATE NOMOR BARU                             │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  Jenis Surat:                                       │   │
│  │  [▼ Surat Tugas (STS)]                             │   │
│  │                                                     │   │
│  │  Nomor Otomatis:                                    │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  STS/024/VII/2026                    [📋]  │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  │                                                     │   │
│  │  [📥 Gunakan Nomor Ini]                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📋 DAFTAR NOMOR YANG SUDAH DIGUNAKAN              │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  🔍 [Search nomor...]           Filter: [▼ Semua]  │   │
│  │                                                     │   │
│  │  ┌──────┬────────────────┬──────────┬──────┬─────┐ │   │
│  │  │ No   │ Nomor Surat    │ Jenis    │ Tgl  │     │ │   │
│  │  ├──────┼────────────────┼──────────┼──────┼─────┤ │   │
│  │  │ 1    │ STS/023/VII/26 │ Tugas    │ 10/7 │ 📋  │ │   │
│  │  │ 2    │ SK/012/VII/26  │ Keterangan│ 10/7 │ 📋  │ │   │
│  │  │ 3    │ SU/008/VII/26  │ Undangan │ 09/7 │ 📋  │ │   │
│  │  │ 4    │ STS/022/VII/26 │ Tugas    │ 09/7 │ 📋  │ │   │
│  │  │ 5    │ STS/021/VII/26 │ Tugas    │ 08/7 │ 📋  │ │   │
│  │  └──────┴────────────────┴──────────┴──────┴─────┘ │   │
│  │                                                     │   │
│  │  Showing 1-5 of 23 │ [← Prev] [1] [2] [3] ... [5] │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3.2 Detail Nomor Surat (Modal)

```
┌─────────────────────────────────────────────────────────────┐
│  📄 DETAIL NOMOR SURAT                                 [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nomor Surat:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     STS/023/VII/2026                              │   │
│  │                                                     │   │
│  │     [📋 Copy Nomor]                                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Informasi:                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Jenis Surat:    Surat Tugas (STS)                 │   │
│  │  Nomor Urut:     23                                 │   │
│  │  Bulan:          Juli (VII)                         │   │
│  │  Tahun:          2026                               │   │
│  │  Dibuat:         10 Juli 2026, 14:30               │   │
│  │  Status:         ✅ Digunakan                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [🗑️ Hapus] [✏️ Edit] [📥 Download] [🖨️ Print]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3.3 Pengaturan Format

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ PENGATURAN FORMAT NOMOR                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Format Template:                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [KODE]/[NOMOR]/[BULAN]/[TAHUN]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Pengaturan:                                               │
│  ├─ Kode Sekolah: [STS]                                   │
│  ├─ Nomor Digit: [3] (001-999)                            │
│  ├─ Format Bulan: [▼ Romawi] (I, II, III...)              │
│  └─ Tahun: [▼ 4 digit] (2026)                            │
│                                                             │
│  Preview:                                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STS/024/VII/2026                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [💾 Simpan] [↩️ Reset Default]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Auto-generate | Nomor otomatis bertambah | P0 |
| Prevent duplicate | Cek duplikasi sebelum save | P0 |
| List view | Daftar nomor yang sudah dipakai | P0 |
| Search | Cari nomor | P1 |
| Filter | Filter by bulan/jenis | P1 |
| Copy to clipboard | Copy nomor | P1 |
| Detail view | Lihat detail nomor | P1 |
| Statistics | Jumlah surat per bulan | P2 |
| Custom format | Kustomisasi format | P2 |
| Export | Export daftar nomor | P3 |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target |
|--------|--------|
| Generate time | <100ms |
| Search time | <200ms |
| Load list | <500ms |
| Max records | 10,000+ |

### 6.2 Data Integrity

| Aspect | Requirement |
|--------|-------------|
| Atomicity | Nomor hanya bertambah, tidak berkurang |
| Uniqueness | Tidak ada duplikasi nomor |
| Persistence | Tersimpan di localStorage |
| Backup | Auto-backup setiap perubahan |

### 6.3 Concurrency

| Scenario | Handling |
|----------|----------|
| Same user, multiple tabs | Last write wins + warning |
| Same user, rapid clicks | Debounce 500ms |
| Data corruption | Fallback to last valid state |

### 6.4 Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Duplicate | "Nomor sudah digunakan" | Generate new |
| Invalid format | "Format tidak valid" | Show example |
| Storage full | "Penyimpanan penuh" | Suggest cleanup |
| Load error | "Gagal memuat data" | Retry button |

---

## 7. Design Considerations

### 7.1 Visual Design

| Element | Style |
|---------|-------|
| Header | Gradient primary blue |
| Cards | Glass morphism (bg-white/60 backdrop-blur-2xl) |
| Table | Striped rows, hover effect |
| Nomor display | Monospace font, highlighted |
| Status | Colored badges |

### 7.2 Interaction Design

| Interaction | Behavior |
|-------------|----------|
| Select jenis | Nomor preview langsung muncul |
| Click generate | Nomor baru ditambah ke list |
| Click copy | Notifikasi "Tersalin!" |
| Hover row | Highlight + show actions |
| Click nomor | Buka detail modal |

### 7.3 Responsive Design

```
Desktop (≥1024px):
├─ 2-column layout
├─ Stat cards on top
├─ Table full width

Tablet (768px-1023px):
├─ 2-column layout
├─ Smaller stat cards

Mobile (<768px):
├─ 1-column layout
├─ Stacked cards
├─ Compact table
```

---

## 8. Data Model

### 8.1 Number Record

```javascript
const nomorSurat = {
  id: "ns_20260710_001",
  nomor: "STS/023/VII/2026",
  kode: "STS",
  jenis: "Surat Tugas",
  nomorUrut: 23,
  bulan: 7,
  bulanRomawi: "VII",
  tahun: 2026,
  createdAt: "2026-07-10T14:30:00Z",
  usedAt: "2026-07-10T14:30:00Z",
  status: "used", // used, draft, cancelled
  relatedDocument: "surat_tugas_001" // optional
};
```

### 8.2 Counter Record

```javascript
const counter = {
  "STS": {
    "2026-07": 23, // nomor terakhir Juli 2026
    "2026-08": 0   // belum ada Agustus
  },
  "SK": {
    "2026-07": 12
  }
};
```

### 8.3 localStorage Keys

| Key | Description |
|-----|-------------|
| `spj_nomor_surat` | Array of nomor records |
| `spj_counter_surat` | Counter per jenis/bulan |
| `spj_format_surat` | Custom format settings |

---

## 9. Numbering Format

### 9.1 Default Format

```
[KODE]/[NOMOR]/[BULAN_ROMAWI]/[TAHUN]

Example: STS/023/VII/2026

Components:
├─ KODE: 2-3 huruf (STS, SK, SU, etc.)
├─ NOMOR: 3 digit (001-999)
├─ BULAN: Romawi (I-XII)
└─ TAHUN: 4 digit (2026)
```

### 9.2 Alternative Formats

| Format | Example | Use Case |
|--------|---------|----------|
| Default | STS/023/VII/2026 | Standard |
| With School | SDN01/STS/023/07/2026 | Multi-school |
| Simple | STS/23/07/26 | Compact |
| Yearly | STS/156/2026 | No monthly reset |

### 9.3 Customization Options

| Option | Values | Default |
|--------|--------|---------|
| Kode Sekolah | Custom text | - |
| Nomor Digit | 2-5 | 3 |
| Bulan Format | Romawi/Arabic/Number | Romawi |
| Tahun Format | 2/4 digit | 4 |
| Separator | / - . | / |

---

## 10. Success Metrics

### 10.1 KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Zero duplicate | 0 duplikasi | Audit |
| Time to generate | <5 detik | User tracking |
| Accuracy | 100% | System logs |
| User satisfaction | >4.5/5 | Survey |

### 10.2 Monitoring

| Metric | Frequency | Alert |
|--------|-----------|-------|
| Total nomor generated | Daily | Spike detection |
| Duplicate attempts | Real-time | Any duplicate |
| Storage usage | Weekly | >80% capacity |
| Error rate | Weekly | >1% |

---

## 11. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Apakah perlu reset counter manual? | No - auto reset per bulan |
| 2 | Bagaimana jika tahun berganti? | Auto new year counter |
| 3 | Apakah perlu undo hapus nomor? | Future consideration |
| 4 | Limit maksimal nomor per bulan? | 999 (3 digit) |
| 5 | Format khusus untuk surat rahasia? | Not in scope |

---

## 📎 Appendix

### A. Roman Number Conversion

```javascript
const romanMonths = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
  5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
  9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};
```

### B. Generate Algorithm

```javascript
function generateNomorSurat(kode, bulan, tahun) {
  const key = `${kode}/${tahun}-${bulan}`;
  const lastNumber = counter[key] || 0;
  const newNumber = lastNumber + 1;
  
  const formattedNumber = String(newNumber).padStart(3, '0');
  const romanMonth = romanMonths[bulan];
  
  return `${kode}/${formattedNumber}/${romanMonth}/${tahun}`;
}
```

### C. Validation Rules

| Rule | Description |
|------|-------------|
| No duplicate | Check all existing records |
| Valid format | Match pattern [A-Z]+/\d{3}/[I-XII]+/\d{4} |
| Within range | Number 001-999 |
| Valid month | 1-12 |

---

*Document Version: 1.0*
*Created: 10 Juli 2026*
*Author: Product Manager*
*Status: Draft*
