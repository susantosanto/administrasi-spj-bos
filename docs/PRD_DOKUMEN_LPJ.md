# PRD — Redesain Fitur "Dokumen LPJ" (Konsep Form Input + Preview)

> **Status**: Draft v1 (menunggu klarifikasi — lihat bagian "Open Questions")
> **Tanggal**: 2026-07-13
> **Penulis**: Product (draft oleh assistant)
> **Skill**: prd-generator → (selanjutnya) ux-user-flow

---

## 1. Introduction / Overview

Fitur **Dokumen LPJ** saat ini menggunakan konsep *accordion*: ketika user mengklik sebuah card (mis. Honorarium), dokumen yang siap diisi langsung ditampilkan di bawah card tersebut (TemplateEngine merender layout dokumen lengkap dengan field yang bisa diedit inline).

PRD ini mengusulkan **perubahan konsep** menjadi alur **Form Input → Preview → Revisi**:

- Mengklik card Dokumen LPJ membuka **Form** yang bersih: kumpulan *input box* dan *dropdown* saja (bukan dokumen langsung).
- Dropdown diisi otomatis dari **data yang sudah ada** (Data Guru, Data Tendik, Pejabat/Kepala Sekolah, Bendahara, Logo) — sehingga field tersebut **tidak perlu diisi manual** lagi.
- Tombol **Preview** menampilkan dokumen final yang **siap cetak**.
- Jika ada kesalahan, user dapat **kembali ke Form** untuk merevisi, lalu Preview lagi.

Tujuannya: menyederhanakan pengisian dokumen LPJ, mengurangi input manual berulang, dan memisahkan secara jelas antara *pengisian data* (form) dan *hasil akhir* (preview cetak).

---

## 2. Goals / Objectives

| # | Goal | SMART / Metric |
|---|------|----------------|
| G1 | Kurangi input manual pada dokumen LPJ | ≥ 80% field diisi otomatis dari data tersimpan (guru, tendik, pejabat, logo, nomor surat) |
| G2 | Percepat penyelesaian 1 dokumen LPJ | Waktu pengisian turun dari ~5 menit ke < 2 menit (estimasi) |
| G3 | Hindari kesalahan pengetikan nama/NIP/ttd | Field pejabat & logo 100% diambil dari data tersimpan (tidak bisa salah ketik) |
| G4 | Berikan jalur revisi yang jelas | Setiap dokumen memiliki tombol "Kembali ke Form" dari Preview |
| G5 | Pertahankan generate nomor surat | Fitur generate nomor surat tetap tersedia di dalam Form |

---

## 3. Target Audience / User Personas

- **Persona A — Operator Sekolah (Buku/Tata Usaha)**: pengguna utama. Bertugas menyusun LPJ BOS tiap bulan. Sudah menginput Data Guru, Data Tendik, dan Data Sekolah. Menginginkan proses cepat & minim salah ketik.
- **Persona B — Kepala Sekolah / Bendahara**: sebagai pihak yang ditandatangani di dokumen; namun di konsep baru ini data mereka **otomatis** (tidak mengisi form).
- **Persona C — Verifikator/Dinas**: konsumen akhir dokumen cetak (PDF). Menginginkan dokumen rapi & sesuai standar.

---

## 4. User Stories / Use Cases

**Honorarium**
- *US-1*: Sebagai operator, ketika saya klik card **Honorarium**, saya ingin melihat Form dengan dropdown penerima dari Data Guru & Tendik, agar saya tidak mengetik ulang nama/NIP.
- *US-2*: Saya ingin memilih periode (Bulan/Tahun) dan nomor surat lewat form, lalu klik **Preview** untuk melihat Daftar Honorer yang sudah rapi.
- *US-3*: Jika ada kesalahan, saya ingin klik **Kembali ke Form** untuk merevisi, lalu Preview ulang.
- *US-4*: Saya tidak ingin mengisi nama Kepala Sekolah, Bendahara, dan Logo — itu harus otomatis dari data sekolah.

**Perjalanan Dinas**
- *US-5*: Ketika saya klik card **Perjalanan Dinas**, saya ingin Form input & dropdown untuk field transport (penerima, tujuan, tanggal, dll).
- *US-6*: Saat Preview, saya ingin dokumen **Daftar Penerima Transport** DAN **Surat Perintah Tugas (SPPD)** ditampilkan bersama.
- *US-7*: Nomor surat untuk transport & SPPD dapat digenerate di Form (terpisah, sesuai implementasi sebelumnya).

**Umum**
- *US-8*: Saya ingin tombol **Cetak/Print** tersedia di layar Preview.

---

## 5. Functional Requirements

### 5.1 Alur Umum (semua card Dokumen LPJ)
- **FR-1**: Klik card → buka **Form view** (bukan langsung dokumen).
- **FR-2**: Form terdiri dari *input box* + *dropdown* yang nilainya diambil dari data tersimpan bila memungkinkan.
- **FR-3**: Tombol **Preview** di Form → buka **Preview view** (dokumen siap cetak).
- **FR-4**: Preview memiliki tombol **"Kembali ke Form"** untuk revisi.
- **FR-5**: Preview memiliki tombol **"Cetak"** (print browser / export PDF).
- **FR-6**: Data form disimpan ke `localStorage` agar tidak hilang saat navigasi.

### 5.2 Card Honorarium
- **FR-7**: Dropdown **"Pilih Penerima Honor"** diisi dari:
  - Data Guru (status *Honorer*) → `data_guru`
  - Data Tendik (honorer / perpus / penjaga, via `roleHonor`) → `data_tendik`
- **FR-8**: Pemilihan penerima (multi-select) → otomatis mengisi baris Daftar Honorer (Nama, NIP/NUPTK, Jabatan, Gol/Ruang, dan perhitungan JUMLAH / PPh 21 / YANG DITERIMA).
- **FR-9**: Input **Periode** (Bulan dropdown + Tahun input).
- **FR-10**: Field **Kepala Sekolah**, **Bendahara**, dan **Logo** → **otomatis** dari `data_sekolah` (pejabat.ks, pejabat.bendahara, logo_sekolah). Tidak ada input manual.
- **FR-11**: **Nomor Surat** → input box dengan tombol generate (popup nomor surat standar `[Klasifikasi]/[Kode Surat]-[Nomor]/[Nama SD]/[Bulan]/[Tahun]`).
- **FR-12**: Preview menampilkan **Daftar Penerima Honorarium** (format Excel/standar) yang siap cetak.

### 5.3 Card Perjalanan Dinas
- **FR-13**: Form input & dropdown untuk field transport (penerima dari guru/tendik, tujuan, tanggal, lama perjalanan, dll).
- **FR-14**: Dropdown penerima diisi dari Data Guru & Tendik (sama seperti FR-7).
- **FR-15**: **Nomor Surat** transport & **Nomor Surat SPPD** → masing-masing bisa digenerate di Form (terpisah).
- **FR-16**: Preview menampilkan **dua dokumen**:
  1. **Daftar Penerima Transport**
  2. **Surat Perintah Tugas (SPPD)** — format 1 surat tugas + list nama penerima.
- **FR-17**: Kepala Sekolah, Bendahara, Logo → otomatis (sama seperti FR-10).

### 5.4 Generate Nomor Surat (tetap ada)
- **FR-18**: Fitur generate nomor surat tetap tersedia **di dalam Form input** (bukan di preview) ketika card diklik.
- **FR-19**: Format nomor surat konsisten dengan menu Nomor Surat (`422.1/SK-001/SDN-PSR/VII/2026`).

---

## 6. Non-Functional Requirements

- **NFR-1 (Usability)**: Form harus jauh lebih sederhana dari dokumen; hanya kontrol input, tanpa dekorasi dokumen.
- **NFR-2 (Performance)**: Preview dirender < 1 detik setelah klik.
- **NFR-3 (Data Integrity)**: Field otomatis (pejabat, logo) selalu diambil dari sumber tersimpan; jika kosong, tampilkan peringatan agar user melengkapi Data Sekolah.
- **NFR-4 (Persistence)**: Draft form tersimpan di localStorage per card.
- **NFR-5 (Print)**: Preview mendukung print A4 rapi (CSS print sudah ada).
- **NFR-6 (Consistency)**: Tetap menggunakan primary color biru #004ac6, tanpa warna lain (design system MD3).

---

## 7. Design Considerations

- **Form View**: Layout vertikal, label di kiri, input/dropdown di kanan. Mengelompokkan: (a) Periode & Nomor Surat, (b) Pilih Penerima (dropdown multi-select), (c) Field tambahan (jika ada).
- **Preview View**: Full dokumen A4 (reuse TemplateEngine blocks: Header, InfoKeuangan, TabelDinamis, SignatureFooter).
- **Transisi**: Tombol Preview & Kembali menggunakan animasi halus (fade/slide) seperti accordion saat ini.
- **Multi-document (Perjalanan Dinas)**: Preview menampilkan Transport lalu SPPD (scroll berurutan atau tab "Transport | SPPD").
- Mockup: akan dibuat di tahap `ux-user-flow` berikutnya.

---

## 8. Success Metrics

- Tingkat adopsi: ≥ 90% dokumen LPJ diselesaikan lewat alur Form→Preview (bukan edit inline lama).
- Waktu pengisian rata-rata turun (target < 2 menit/dokumen).
- 0 keluhan salah ketik nama pejabat/logo (karena otomatis).
- Build & print berhasil di semua template terkait (honor, transport, SPPD).

---

## 9. Open Questions / Clarifications Needed

1. **Cakupan card** — Apakah konsep Form+Preview ini berlaku untuk **semua** card Dokumen LPJ (Honorarium, Perjalanan Dinas, Makan & Minum, Pemeliharaan, dst.) sekaligus, atau **baru Honorarium & Perjalanan Dinas** dulu (card lain menyusul)?
2. **Field Honorarium** — Selain *Pilih Penerima* (multi-select dari Guru/Tendik), *Periode*, dan *Nomor Surat*, apakah masih ada **input manual lain** yang diinginkan (mis. keterangan kegiatan, program/kegiatan/kode rekening)? Atau semua diambil otomatis?
3. **Layout Preview Perjalanan Dinas** — Apakah Daftar Transport & SPPD ditampilkan **bersamaan (scroll)** atau **tab terpisah** di layar Preview?
4. **Multi-select penerima** — Untuk Honorarium, apakah user memilih beberapa PTK sekaligus (centang banyak) yang lalu jadi banyak baris di daftar honorer? Atau satu per satu?
5. **Handling data kosong** — Jika Data Guru/Tendik/Pejabat belum diinput, apakah Form tetap bisa dibuka dengan peringatan, atau diblokir?
6. **Migrasi** — Apakah implementasi lama (accordion + TemplateEngine inline) langsung **diganti**, atau dipertahankan sebagai fallback?

---

*Draft ini dibuat berdasarkan brain dump user (3 poin). Setelah poin di atas dijawab, PRD akan difinalisasi dan dapat dilanjutkan ke skill `ux-user-flow`.*
