# 📊 PROGRESS.md — Task Tracking

> **Auto-generated**: File ini untuk tracking progress task. Update saat ada perubahan.

---

## 🎯 STATUS: 98% COMPLETE

| Tahap | Status | Selesai |
|-------|--------|---------|
| 1. Global Rename SPJ→LPJ | ✅ DONE | 2026-07-09 |
| 2. Dashboard Download | ✅ DONE | 2026-07-09 |
| 3. Template Engine Core | ✅ DONE | 2026-07-09 |
| 4. Template Config (13) | ✅ DONE | 2026-07-09 |
| 5. Dokumen Kelengkapan | ✅ DONE | 2026-07-09 |
| 6. Dokumen LPJ Page | ✅ DONE | 2026-07-09 |
| 7. CSS Print + Final | ✅ DONE | 2026-07-09 |
| 8. BKU Excel Parser Engine | ✅ DONE | 2026-07-09 |
| 9. Premium Toggle Sidebar | ✅ DONE | 2026-07-09 |
| 10. BKU Detail Sidebar | ✅ DONE | 2026-07-09 |
| 11. **Upload Data Sekolah (Profil Sekolah Excel)** | ✅ DONE | 2026-07-10 |
| 12. **Upload Data Guru & Tendik (Dapodik Excel)** | ✅ DONE | 2026-07-10 |

---

## 📋 TASK CHECKLIST

### Core Features
- [x] Landing page
- [x] Login page
- [x] Dashboard layout + toggleable sidebar
- [x] Data Sekolah page — premium single-card display + upload profil sekolah + pejabat form
- [x] Data Guru page — 3 tabs (Guru, Tendik, Upload Excel)
- [x] BKU upload page
- [x] Dokumen LPJ page (main)
- [x] Dokumen Kelengkapan page
- [x] Realisasi page
- [x] Pengaturan page

### Sekolah Excel Parser (`sekolahParser.js`)
- [x] Generic label-value scanning (format Dapodik + BKU)
- [x] `scanAllFields()` — captures ALL fields from file, not just mapped
- [x] Separator-only cell skipping (`getValueRight`/`getValueBelow`)
- [x] `extractValueFromLabel()` — handles "TAHUN : 2026" pattern
- [x] `extractYear()` — word-boundary regex, avoids matching "2020" in NPSN
- [x] `extractKecamatanFromAlamat()` — fallback from alamat string
- [x] Multi-sheet fallback support
- [x] Section detection (Identitas, Pelengkap, Kontak, Periodik, Sanitasi)

### Guru & Tendik Parser (`guruTendikParser.js`)
- [x] 51-column Dapodik format support
- [x] Auto-detect Guru vs Tendik from sheet title
- [x] Column mapping: Nama, NIP, NUPTK, JK, Tempat Lahir, Tanggal Lahir, Status, Jenis PTK, Golongan, Agama, Alamat, dll
- [x] Essential fields extraction (7 fields for display)
- [x] Format validation (header: No, Nama, NUPTK)

### Data Sekolah Page (redesigned)
- [x] 3 tabs: Data Sekolah, Pejabat, Upload Excel
- [x] Premium single-card display with gradient header (no separate cards)
- [x] All data shown in sections (Identitas, Pelengkap, Kontak, Periodik)
- [x] Hero card showing school name, NPSN, lokasi
- [x] Pejabat manual form (KS, Bendahara, Pengawas, Sekdik)
- [x] Upload Excel → langsung terisi data

### Data Guru Page (redesigned)
- [x] 3 tabs: Guru, Tendik, Upload Excel
- [x] Two upload buttons (biru untuk Guru, amber untuk Tendik)
- [x] Display table: Nama, NIP, NUPTK, Golongan, Jabatan, Status
- [x] JK gender badge (L/P)
- [x] Status badge colors (PNS/PPPK/Honorer)
- [x] Manual add form for Guru
- [x] Storage: `data_guru` & `data_tendik` terpisah

### Upload Data Sekolah Flow
- [x] Parse file → langsung apply ke data
- [x] Save to localStorage (merge with existing pejabat data)
- [x] Auto-switch ke tab Data Sekolah
- [x] Both Dapodik and BKU format support

### Premium Sidebar Navigation
- [x] SidebarContext (global toggle state via React Context)
- [x] Glass morphism design (backdrop-blur-2xl, bg-white/80)
- [x] Smooth slide animation (cubic-bezier spring)
- [x] Premium NavLink with active indicator bar
- [x] Hamburger toggle button in Topbar
- [x] Animated main content margin (ml-64 ↔ ml-0)
- [x] Mobile overlay backdrop
- [x] Super premium Logout button (glow, icon scale, chevron slide)
- [x] Blue + white color scheme (primary #004ac6)

### BKU Detail Sidebar
- [x] Slide-in panel from right with spring animation
- [x] Glass morphism premium design
- [x] Full transaction details (Uraian, Debet/Kredit, Saldo, Ref info, Kategori)
- [x] Prev/next navigation + keyboard shortcuts (← → Esc)
- [x] Row selection highlight + click-to-open
- [x] Mamin document integration

### BKU Excel Parser
- [x] Column mapping (A=Tanggal, D=Kegiatan, F=Rekening, I=NoBukti, K=Uraian, N=Penerimaan, Q=Pengeluaran, T=Saldo)
- [x] Transaction type detection (BOSP, PPh, TarikTunai, SetorPajak, PergeseranBank, dll)
- [x] Real totals calculation (Rp 82.560.000 eksklusif transaksi internal)
- [x] Old data format fallback (tanpa field tipe)
- [x] Header sekolah parser (NPSN, Alamat, Kab/Kota, Provinsi)
- [x] Footer signature parser (dinamis dari bawah)
- [x] Balance verification (BKU balance + real balance)
- [x] Filter by month + transaction type
- [x] Mamin transaction detection (Kode 5.1.02.01.01.0052)
- [x] Refresh data from localStorage
- [x] Dynamic row detection from worksheet
- [x] Multi-sheet support
- [x] Tahun Anggaran regex fleksibel

### Template Engine
- [x] TemplateEngine.jsx (universal renderer)
- [x] KopSurat block
- [x] HeaderDokumen block
- [x] TabelFields block
- [x] TabelDinamis block
- [x] InfoKeuangan block
- [x] PoinPembahasan block
- [x] UraianKegiatan block
- [x] SignatureFooter block
- [x] 13 template configs

### Design
- [x] Material Design 3 theme
- [x] Premium card design
- [x] Premium single-card profile display
- [x] Print CSS A4
- [x] Responsive design
- [x] Glass morphism effects
- [x] Spring animations

### Data
- [x] Mock data guru (12 entries)
- [x] School data defaults
- [x] Signature roles config

### Documentation
- [x] ALUR_TARIK_TUNAI_DAN_PAJAK.md — workflow tarik tunai & pajak BKU
- [x] RESEARCH_BKU_UPLOAD.md — format file BKU Excel
- [x] PRD_UPLOAD_GURU_TENDIK.md — PRD upload data guru & tendik
- [x] PRD_UPLOAD_DATA_SEKOLAH.md — PRD upload data sekolah

---

## 🐛 KNOWN ISSUES

- [ ] Cetak 13 template belum di-test (perlu running app)
- [ ] Beberapa sub-kategori masih "Coming Soon" (Pelaksana, Workshop, dll)
- [ ] Sidebar state belum persist ke localStorage

---

## 📝 REVISI YANG DITERIMA

1. ✅ SPJ → LPJ (user-facing text)
2. ✅ Dokumen Wajib → Dokumen Kelengkapan
3. ✅ Card = multiple sub-kategori (pill/dropdown)
4. ✅ Info-only cards (Penggandaan, Cetak Foto, dll)
5. ✅ BKU = upload only, bukan management
6. ✅ Row click → select + buka sidebar
7. ✅ Data Sekolah → premium single-card (bukan form input)
8. ✅ Upload profil sekolah — file Dapodik format (bukan BKU)

---

## 🔮 NEXT STEPS (jika ada)

- Test cetak semua template
- Implementasi "Coming Soon" sub-kategori
- Persist sidebar state ke localStorage
- Deploy ke Vercel
- Integrasi backend (jika diperlukan)

---

*Last updated: 2026-07-10 | Session: Implementasi Upload Data Sekolah + Upload Guru/Tendik*
