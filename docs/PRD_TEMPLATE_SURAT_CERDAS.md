# 📄 Product Requirements Document (PRD)
## Fitur: Template Surat Cerdas (Auto-Fill)

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
9. [Success Metrics](#9-success-metrics)
10. [Open Questions](#10-open-questions)

---

## 1. Overview

### 1.1 Product Context

**Nama Fitur:** Template Surat Cerdas (Smart Letter Template)

**Aplikasi:** LPJ BOS/BOSP - Aplikasi Administrasi Sekolah

**Versi:** 1.0

**Tanggal:** 10 Juli 2026

### 1.2 Problem Statement

Operator sekolah menghabiskan waktu 15-30 menit untuk membuat satu surat keluar karena:
- Mengetik ulang data sekolah secara manual
- Mencari NIP Kepala Sekolah dan Bendahara
- Format surat tidak konsisten
- Rentan terhadap typo pada data penting

### 1.3 Solution Overview

Fitur Template Surat Cerdas yang secara otomatis:
- Mengisi data sekolah dari profil yang sudah tersimpan
- Mengisi nama dan NIP Kepala Sekolah
- Mengisi nama dan NIP Bendahara
- Menghasilkan surat dalam format yang konsisten dan profesional

### 1.4 Scope

**In Scope:**
- ✅ Auto-fill data sekolah
- ✅ Auto-fill Kepala Sekolah + NIP
- ✅ Auto-fill Bendahara + NIP
- ✅ Multiple template surat
- ✅ Preview sebelum print
- ✅ Download sebagai PDF

**Out of Scope:**
- ❌ History surat yang sudah dikirim
- ❌ Tanggal surat (diambil dari BKU)
- ❌ Digital signature
- ❌ Email/WhatsApp integration

---

## 2. Goals & Objectives

### 2.1 Business Goals

| Goal | Metric | Target |
|------|--------|--------|
| Hemat waktu operator | Waktu pembuatan surat | Dari 15-30 menit → 3-5 menit |
| Kurangi kesalahan input | Error rate | Dari 10% → <1% |
| Konsistensi format | Format compliance | 100% konsisten |

### 2.2 User Goals

- Operator bisa membuat surat dalam waktu <5 menit
- Data sekolah dan pejabat tidak perlu diketik ulang
- Format surat selalu benar dan profesional
- Tidak perlu menghafal NIP pejabat

### 2.3 Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Waktu pembuatan surat | 15-30 menit | 3-5 menit | User tracking |
| Error rate | ~10% | <1% | Audit sample |
| User satisfaction | - | >4.5/5 | Survey |
| Adoption rate | 0% | >80% dalam 1 bulan | Usage analytics |

---

## 3. Target Audience

### 3.1 Primary User

| Attribute | Detail |
|-----------|--------|
| **Role** | Operator Sekolah / TU |
| **Age** | 25-50 tahun |
| **Tech Skill** | Intermediate |
| **Daily Task** | Membuat surat, mengelola administrasi |
| **Pain Point** | Waktu habis untuk ketik manual data yang sama |

### 3.2 Secondary User

| Attribute | Detail |
|-----------|--------|
| **Role** | Kepala Sekolah |
| **Purpose** | Review dan tanda tangan |
| **Need** | Surat sudah benar sebelum ditandatangani |

---

## 4. User Stories

### 4.1 User Stories Utama

```
US-01: Sebagai operator sekolah, saya ingin memilih template surat 
       sehingga saya tidak perlu membuat format dari awal.

Acceptance Criteria:
- Tersedia minimal 5 template surat yang umum digunakan
- Template bisa dipilih dari dropdown/card
- Preview template ditampilkan sebelum diedit
```

```
US-02: Sebagai operator sekolah, saya ingin data sekolah terisi 
       otomatis sehingga saya tidak perlu mengetik ulang.

Acceptance Criteria:
- Nama sekolah, alamat, telepon otomatis terisi
- Logo sekolah otomatis muncul
- Data diambil dari Data Sekolah yang sudah tersimpan
```

```
US-03: Sebagai operator sekolah, saya ingin nama dan NIP Kepala 
       Sekolah terisi otomatis.

Acceptance Criteria:
- Nama Kepala Sekolah terisi dari Data Pejabat
- NIP terisi otomatis
- Jabatan terisi otomatis
```

```
US-04: Sebagai operator sekolah, saya ingin nama dan NIP Bendahara 
       terisi otomatis.

Acceptance Criteria:
- Nama Bendahara terisi dari Data Pejabat
- NIP terisi otomatis
- Jabatan terisi otomatis
```

```
US-05: Sebagai operator sekolah, saya ingin bisa mengedit konten 
       surat setelah auto-fill.

Acceptance Criteria:
- Semua field bisa diedit setelah auto-fill
- Perubahan tidak mempengaruhi data master
- Undo/Redo tersedia
```

```
US-06: Sebagai operator sekolah, saya ingin preview surat sebelum 
       di-print atau di-download.

Acceptance Criteria:
- Preview menampilkan surat persis seperti yang akan di-print
- Bisa zoom in/out
- Format A4 sesuai standar
```

```
US-07: Sebagai operator sekolah, saya ingin download surat sebagai 
       PDF.

Acceptance Criteria:
- File tersimpan sebagai .pdf
- Format sesuai preview
- Nama file sesuai nomor surat
```

### 4.2 User Stories Tambahan

```
US-08: Sebagai operator sekolah, saya ingin membuat nomor surat 
       otomatis sehingga tidak ada duplikasi.

Acceptance Criteria:
- Nomor surat generate otomatis berdasarkan format yang dipilih
- Format: [Kode]/[Kode Unit]/[Bulan]/[Tahun]
- Contoh: STS/001/VII/2026
```

---

## 5. Functional Requirements

### 5.1 Data Sources

#### 5.1.1 Data Sekolah (Auto-Fill)

| Field | Source | Example |
|-------|--------|---------|
| Nama Sekolah | DataSekolahPage | "SDN 01 Bandung" |
| Alamat | DataSekolahPage | "Jl. Merdeka No. 123" |
| Telepon | DataSekolahPage | "(022) 1234567" |
| Email | DataSekolahPage | "sdn01@gmail.com" |
| Website | DataSekolahPage | "sdn01.sch.id" |
| Logo | DataSekolahPage | (image file) |

#### 5.1.2 Pejabat Sekolah (Auto-Fill)

| Field | Source | Example |
|-------|--------|---------|
| **Kepala Sekolah** | PejabatSekolahPage | |
| - Nama | - | "Drs. H. Ahmad Fauzi, M.Pd" |
| - NIP | - | "196801012005011002" |
| - Jabatan | - | "Kepala Sekolah" |
| **Bendahara** | PejabatSekolahPage | |
| - Nama | - | "Siti Aminah, S.Pd" |
| - NIP | - | "198505152010012003" |
| - Jabatan | - | "Bendahara BOS" |

### 5.2 Template Types

#### 5.2.1 Daftar Template

| ID | Nama Template | Kategori | Field Khusus |
|----|---------------|----------|--------------|
| 01 | Surat Tugas | Umum | - Yang ditugaskan (nama, NIP) - Tugas yang diberikan - Waktu pelaksanaan |
| 02 | Surat Keterangan | Umum | - Untuk keperluan apa - Keterangan yang diberikan |
| 03 | Surat Undangan | Umum | - Acara - Waktu & tempat |
| 04 | Surat Pernyataan | Umum | - Isi pernyataan |
| 05 | Surat Kuasa | Keuangan | - Yang dikuasakan - Yang memberi kuasa - Bentuk kuasa |

### 5.3 Auto-Fill Logic

```
FLOW AUTO-FILL:

1. User pilih template
   │
   ▼
2. Load data dari localStorage
   │
   ├─ DataSekolahPage → nama, alamat, telepon, logo
   ├─ PejabatSekolahPage → KepSek + Bendahara
   │
   ▼
3. Inject ke template
   │
   ▼
4. User edit konten (opsional)
   │
   ▼
5. Preview
   │
   ▼
6. Download/Print
```

### 5.4 Interface Requirements

#### 5.4.1 Halaman Template Surat

```
┌─────────────────────────────────────────────────────────────┐
│  📝 TEMPLATE SURAT CERDAS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Pilih Template:                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ 📄       │ │ 📄       │ │ 📄       │ │ 📄       │     │
│  │ Surat    │ │ Surat    │ │ Surat    │ │ Surat    │     │
│  │ Tugas    │ │ Keterangan│ │ Undangan │ │ Pernyataan│    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  Data Otomatis (Auto-Fill):                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏫 Nama Sekolah: SDN 01 Bandung                   │   │
│  │  📍 Alamat: Jl. Merdeka No. 123                     │   │
│  │  👨‍💼 Kepala Sekolah: Drs. H. Ahmad Fauzi, M.Pd    │   │
│  │  📋 NIP: 196801012005011002                         │   │
│  │  💰 Bendahara: Siti Aminah, S.Pd                   │   │
│  │  📋 NIP: 198505152010012003                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [✏️ Edit Data Jika Perlu]                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.4.2 Editor Surat

```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ EDITOR SURAT                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [KOP SURAT - OTOMATIS]                            │   │
│  │                                                     │   │
│  │  PEMERINTAH KOTA BANDUNG                           │   │
│  │  DINAS PENDIDIKAN                                   │   │
│  │  SDN 01 BANDUNG                                     │   │
│  │  Jl. Merdeka No. 123 Telp (022) 1234567            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Nomor Surat: [STS/001/VII/2026] (auto)                   │
│                                                             │
│  Yang bertugas:                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1. [Nama Guru ▼] NIP: [auto]                      │   │
│  │  2. [Nama Guru ▼] NIP: [auto]                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Tugas: [________________________]                         │
│                                                             │
│  Waktu Pelaksanaan: [________________]                     │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  Tanda Tangan:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                    Bandung, [Tanggal dari BKU]      │   │
│  │                    KEPALA SEKOLAH                   │   │
│  │                                                     │   │
│  │                    [________________]               │   │
│  │                    [Nama KepSek - AUTO]             │   │
│  │                    NIP. [NIP KepSek - AUTO]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [💾 Simpan Draft] [📥 Download PDF] [🖨️ Print]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Print/Export Requirements

| Requirement | Detail |
|-------------|--------|
| Format Export | PDF |
| Paper Size | A4 (210mm × 297mm) |
| Margins | Kiri: 4cm, Kanan: 3cm, Atas: 3cm, Bawah: 3cm |
| Font | Times New Roman 12pt (isi), 14pt (kop) |
| Header | Logo + Kop Surat |
| Footer | Tanda tangan + NIP |

---

## 6. Non-Functional Requirements

### 6.1 Performance

| Metric | Target |
|--------|--------|
| Load time template | <500ms |
| Auto-fill time | <300ms |
| PDF generation | <2 detik |
| File size PDF | <1MB |

### 6.2 Usability

| Aspect | Requirement |
|--------|-------------|
| Learning curve | <5 menit untuk first-time user |
| Click to complete | Maks 5 klik untuk buat surat |
| Error prevention | Validasi sebelum download |
| Help text | Tooltips pada setiap field |

### 6.3 Data Integrity

| Aspect | Requirement |
|--------|-------------|
| Data source | Selalu dari DataSekolah & PejabatSekolah |
| Sync | Auto-sync jika data pejabat berubah |
| Backup | Tersimpan di localStorage |
| Validation | Wajib isi semua field auto-fill |

### 6.4 Compatibility

| Aspect | Requirement |
|--------|-------------|
| Browser | Chrome, Firefox, Edge (latest) |
| Resolution | Min 1024x768, responsive |
| Print | Compatible dengan semua printer |

---

## 7. Design Considerations

### 7.1 Visual Design

| Aspect | Guideline |
|--------|-----------|
| Color | Primary Blue (#004ac6) untuk aksen |
| Typography | Hanken Grotesk (heading), Inter (body) |
| Icons | Material Symbols Outlined |
| Cards | Glass morphism (bg-white/60 backdrop-blur-2xl) |

### 7.2 Layout

```
┌─────────────────────────────────────────────────────────────┐
│  LAYOUT STRUCTURE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Header (Gradient Primary)                          │   │
│  │  📝 Template Surat Cerdas                          │   │
│  │  Buat surat dengan data otomatis                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Template Selection (Cards/Grid)                    │   │
│  │  [Surat Tugas] [Keterangan] [Undangan] [Lainnya]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Auto-Fill Info (Highlighted Box)                   │   │
│  │  🏫 Sekolah: SDN 01                                │   │
│  │  👨‍💼 KepSek: Ahmad Fauzi                           │   │
│  │  💰 Bendahara: Siti Aminah                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Editor (if needed)                                 │   │
│  │  [Rich text editor or form fields]                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Preview (Live)                                     │   │
│  │  [Document preview on the right or modal]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Actions (Bottom Bar)                               │   │
│  │  [💾 Draft] [📥 PDF] [🖨️ Print]                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Interaction Design

| Interaction | Behavior |
|-------------|----------|
| Select template | Auto-fill langsung terjadi |
| Edit field | Perubahan real-time di preview |
| Download | Loading indicator → selesai |
| Print | Buka print dialog browser |
| Empty data | Warning "Lengkapi Data Sekolah dulu" |

---

## 8. Data Model

### 8.1 Data Structure

```javascript
// Template Surat
const templateData = {
  id: "surat_tugas",
  name: "Surat Tugas",
  category: "umum",
  fields: {
    // Auto-filled (readonly)
    namaSekolah: { type: "text", autoFill: true, source: "sekolah.nama" },
    alamat: { type: "text", autoFill: true, source: "sekolah.alamat" },
    telepon: { type: "text", autoFill: true, source: "sekolah.telepon" },
    logo: { type: "image", autoFill: true, source: "sekolah.logo" },
    
    namaKepsek: { type: "text", autoFill: true, source: "pejabat.kepsek.nama" },
    nipKepsek: { type: "text", autoFill: true, source: "pejabat.kepsek.nip" },
    namaBendahara: { type: "text", autoFill: true, source: "pejabat.bendahara.nama" },
    nipBendahara: { type: "text", autoFill: true, source: "pejabat.bendahara.nip" },
    
    // User input (editable)
    yangBertugas: { type: "array", autoFill: false },
    tugas: { type: "textarea", autoFill: false },
    waktuPelaksanaan: { type: "text", autoFill: false },
    
    // From BKU (readonly)
    tanggal: { type: "date", autoFill: true, source: "bku.tanggal" }
  }
};

// Generated Letter Number
const nomorSurat = {
  id: "STS-2026-001",
  templateId: "surat_tugas",
  nomor: "STS/001/VII/2026",
  bulan: 7,
  tahun: 2026,
  createdAt: "2026-07-10T10:00:00Z"
};
```

### 8.2 localStorage Keys

| Key | Description |
|-----|-------------|
| `spj_data_sekolah` | Data sekolah (auto-fill) |
| `spj_pejabat_sekolah` | Data pejabat (auto-fill) |
| `spj_nomor_surat` | Daftar nomor surat |
| `spj_surat_draft` | Draft surat tersimpan |

---

## 9. Success Metrics

### 9.1 KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Time to create letter | <5 minutes | User tracking |
| Auto-fill accuracy | 100% | Audit |
| User satisfaction | >4.5/5 | Survey |
| Print success rate | >99% | Error logs |
| Adoption rate | >80% in 1 month | Usage analytics |

### 9.2 Monitoring

| Metric | Frequency | Alert |
|--------|-----------|-------|
| Daily active users | Daily | <10 users |
| Letters created | Daily | <5 letters |
| Error rate | Weekly | >5% |
| PDF generation time | Weekly | >3 seconds |

---

## 10. Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | Berapa banyak template yang dibutuhkan di Phase 1? | Resolved: 5 template |
| 2 | Apakah perlu upload custom template? | Future consideration |
| 3 | Bagaimana jika data pejabat belum diisi? | Need validation flow |
| 4 | Apakah perlu versi mobile? | Future consideration |
| 5 | Format nomor surat seperti apa? | To be confirmed with user |

---

## 📎 Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| Auto-fill | Mengisi data secara otomatis dari sumber data |
| Template | Format/kerangka surat yang sudah ditentukan |
| BKU | Buku Kas Umum |
| NIP | Nomor Induk Pegawai |

### B. References

- Data Sekolah Page: `DataSekolahPage.jsx`
- Pejabat Sekolah Page: `PejabatSekolahPage.jsx`
- BKU Parser: `bkuParser.js`
- Design System: `DESIGN.md`

---

*Document Version: 1.0*
*Created: 10 Juli 2026*
*Author: Product Manager*
*Status: Draft*
