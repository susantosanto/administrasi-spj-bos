# 📋 Implementation Plan: Generate Nomor Surat Otomatis

## 🎯 Goal
Implementasi fitur Generate Nomor Surat Keluar Otomatis berdasarkan PRD yang sudah dibuat.

## 📦 Dependencies
- Tidak ada dependency baru
- Menggunakan localStorage untuk storage
- Menggunakan design system yang sudah ada

---

## 📝 Task List

### Tahap 1: Core Logic (nomorSuratHelper.js)
- [ ] Definisikan kode surat (STS, SK, SU, etc.)
- [ ] Implementasi Roman numeral conversion
- [ ] Implementasi generate nomor otomatis
- [ ] Implementasi counter management
- [ ] Implementasi validation (cek duplikasi)
- [ ] Export functions

### Tahap 2: Nomor Surat Page
- [ ] Buat component NomorSuratPage.jsx
- [ ] Header section (gradient)
- [ ] Statistik cards (bulan ini, tahun ini, hari ini, terakhir)
- [ ] Generate section (pilih jenis, preview nomor)
- [ ] Tabel daftar nomor yang sudah dipakai
- [ ] Search & filter functionality
- [ ] Copy to clipboard
- [ ] Detail modal

### Tahap 3: Integration
- [ ] Tambah route di App.jsx
- [ ] Tambah menu di Sidebar
- [ ] Update Topbar jika perlu

### Tahap 4: Testing & Polish
- [ ] Test generate nomor
- [ ] Test cek duplikasi
- [ ] Test search & filter
- [ ] Test copy to clipboard
- [ ] Responsive design check

---

## 📁 Files to Create/Modify

### Create:
1. `src/utils/nomorSuratHelper.js` - Core logic
2. `src/pages/dashboard/NomorSuratPage.jsx` - Main page

### Modify:
1. `src/App.jsx` - Add route
2. `src/components/layout/Sidebar.jsx` - Add menu item

---

## ⏱️ Estimated Time
- Tahap 1: 30 menit
- Tahap 2: 1.5 jam
- Tahap 3: 15 menit
- Tahap 4: 15 menit
- **Total: ~2.5 jam**
