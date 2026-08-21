# 📋 PLAN: Relokasi Fitur Generate Foto Dokumentasi

> **Status:** Brainstorming / RFC
> **Tanggal:** 21 Agustus 2026
> **Masalah:** Fitur Generate Foto tersembunyi di BKU Sidebar, tidak terikat dengan alur pembuatan dokumen LPJ

---

## 1. 🔍 Analisis Masalah

### Posisi Saat Ini

| # | Lokasi | Komponen | Status |
|---|--------|----------|--------|
| 1 | BKU Sidebar → Tab "Dokumentasi LPJ" | `DokumentasiAIGenerate` | ✅ Aktif, tapi tersembunyi |
| 2 | Dashboard Home → "Fitur Unggulan" | Link card → `/dashboard/bku` | ⚠️ Arahkan ke BKU, bukan halaman foto |
| 3 | Landing Page | Typing animation + feature card | ✅ Promosi |
| 4 | `DokumentasiAIPage.jsx` | Standalone page | ❌ **TIDAK di-route** — kode mati |
| 5 | `PersonelFotoTab.jsx` | Upload foto personel | ✅ Di Data Sekolah |

### Masalah Utama

1. **Fitur tersembunyi** — User harus klik transaksi BKU → tab Dokumentasi LPJ → scroll → baru ketemu. 3 langkah untuk akses fitur utama.
2. **Tidak terikat alur LPJ** — Foto dokumentasi adalah BAGIAN dari dokumen LPJ, tapi diakses terpisah di BKU Sidebar.
3. **DokumentasiAIPage.jsx orphan** — Ada halaman standalone yang tidak terhubung ke manapun.
4. **Dashboard card salah arah** — Mengarah ke `/dashboard/bku` bukan ke halaman foto.
5. **BKU Sidebar terlalu padat** — Detail + SPJ + Upload Foto + Generate AI dalam satu sidebar.

### Insight dari User

> "Setiap laporan dokumen LPJ harus ada alur di akhir untuk menambahkan foto dokumentasi kegiatan — contoh: mamin, perjalanan dinas, pemeliharaan."

Ini sangat logis karena:
- Foto dokumentasi adalah **syarat kelengkapan LPJ**
- Setiap jenis belanja (mamin, transport, pemeliharaan) butuh foto bukti
- Alami jika foto di-generate **setelah** dokumen LPJ diisi

---

## 2. 💡 Konsep: "Foto Dokumentasi sebagai Langkah Akhir LPJ"

### User Flow Baru

```
┌─────────────────────────────────────────────────────────────┐
│  ALUR LPJ DENGAN FOTO DOKUMENTASI                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1️⃣  User buka halaman Dokumen LPJ                         │
│      → Klik card (Mamin / Transport / Pemeliharaan)         │
│                                                             │
│  2️⃣  User isi form dokumen LPJ                              │
│      → Pilih penerima, nominal, dll                         │
│                                                             │
│  3️⃣  User preview dokumen A4                                │
│      → Surat Undangan, Daftar Hadir, Resume, dll            │
│                                                             │
│  4️⃣  ✨ LANGKAH BARU: Foto Dokumentasi                      │
│      → Upload foto asli ATAU generate dengan AI              │
│      → Foto otomatis masuk ke dokumen A4                    │
│                                                             │
│  5️⃣  User cetak/export dokumen LENGKAP                      │
│      → Termasuk foto dokumentasi di halaman terakhir         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Perubahan UX

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| Akses generate foto | BKU Sidebar (tersembunyi) | Langkah akhir di setiap dokumen LPJ |
| Konteks | Per transaksi BKU | Per dokumen LPJ (lebih natural) |
| Foto masuk dokumen | Manual (upload di sidebar) | Otomatis (terintegrasi di A4) |
| Akses cepat | Tidak ada | Dashboard card + halaman khusus |

---

## 3. 🏗️ Arsitektur yang Direkomendasikan

### 3.1 Integrasi di Dokumen LPJ (Prioritas Utama)

**File yang diubah:**
- `spj-frontend/src/components/templates/DokumenFormPreview.jsx`

**Perubahan:**
Tambahkan **langkah ke-4** setelah Preview A4:

```
Form Input → Preview A4 → ✨ Foto Dokumentasi → Cetak/Export
```

**Implementasi:**
```jsx
// Di DokumenFormPreview.jsx, tambah tab/steps baru:
const STEPS = ['form', 'preview', 'foto', 'print']

// Setelah preview, tampilkan section Foto Dokumentasi:
{currentStep === 'foto' && (
  <FotoDokumentasiSection
    cardId={card.id}        // 'mamin', 'perjalanan_dinas', 'pemeliharaan'
    formData={formData}      // Data dokumen yang sudah diisi
    onPhotosReady={handlePhotosReady}
  />
)}
```

**Component baru:** `FotoDokumentasiSection.jsx`
- Komponen ringkas (bukan full page)
- Pilihan: Upload foto asli **ATAU** Generate dengan AI
- Preview thumbnail foto yang sudah di-upload
- Foto tersimpan per dokumen (bukan global)

### 3.2 Halaman Dashboard Khusus (Akses Mandiri)

**Route baru:** `/dashboard/foto-dokumentasi`

**File baru:** `spj-frontend/src/pages/dashboard/FotoDokumentasiPage.jsx`

**Fungsi:**
- Setup foto personel (gabung dari `PersonelFotoTab`)
- Generate foto dokumentasi (dari `DokumentasiAIGenerate`)
- Galeri foto yang sudah di-generate
- Download/cetak foto satuan

**Kenapa perlu halaman terpisah:**
- User mungkin ingin generate foto **sebelum** mengisi dokumen LPJ
- User mungkin ingin generate foto **tanpa** konteks dokumen tertentu
- Tempat untuk manage foto personel + ruangan

### 3.3 Shortcut di BKU Sidebar (Dipertahankan, tapi Disederhanakan)

**File yang diubah:**
- `spj-frontend/src/components/bku/BKUSidebar.jsx`

**Perubahan:**
- Hapus `DokumentasiAIGenerate` dari BKU Sidebar (pindah ke halaman khusus)
- Ganti dengan **tombol shortcut** sederhana:
  ```jsx
  <Link to="/dashboard/foto-dokumentasi" className="...">
    ✨ Generate Foto Dokumentasi
  </Link>
  ```
- BKU Sidebar jadi lebih ringan dan fokus

### 3.4 Update Dashboard Card

**File yang diubah:**
- `spj-frontend/src/pages/dashboard/DashboardHome.jsx`

**Perubahan:**
```jsx
// Ganti path dari '/dashboard/bku' ke '/dashboard/foto-dokumentasi'
{
  id: 'dokumentasi-ai',
  title: 'Generate Foto Dokumentasi',
  path: '/dashboard/foto-dokumentasi',  // ← PERUBAHAN
  // ...
}
```

### 3.5 Route Baru

**File yang diubah:**
- `spj-frontend/src/App.jsx`

**Tambahkan:**
```jsx
import FotoDokumentasiPage from './pages/dashboard/FotoDokumentasiPage'

// Di dalam Routes:
<Route path="foto-dokumentasi" element={<FotoDokumentasiPage />} />
```

---

## 4. 📁 Struktur File (Hasil Relokasi)

```
spj-frontend/src/
├── App.jsx                          ← Tambah route /foto-dokumentasi
├── pages/dashboard/
│   ├── DashboardHome.jsx            ← Update path card
│   ├── DokumenSPJPage.jsx          ← Tidak berubah
│   └── FotoDokumentasiPage.jsx     ← 🆕 Halaman khusus generate foto
├── components/
│   ├── bku/
│   │   └── BKUSidebar.jsx          ← Hapus DokumentasiAIGenerate, ganti shortcut
│   ├── templates/
│   │   └── DokumenFormPreview.jsx  ← Tambah langkah Foto Dokumentasi
│   └── dokumentasi/
│       ├── FotoDokumentasiSection.jsx  ← 🆕 Section inline di LPJ flow
│       ├── DokumentasiAIGenerate.jsx   ← Pindah ke FotoDokumentasiPage
│       └── PersonelFotoTab.jsx         ← Pindah ke FotoDokumentasiPage
└── pages/
    └── DokumentasiAIPage.jsx       ← 🗑️ Hapus (orphan, sudah digantikan)
```

---

## 5. 🎯 Prioritas Implementasi

### Fase 1: Foundation (MVP)
1. ✅ Buat `FotoDokumentasiPage.jsx` — halaman khusus
2. ✅ Tambah route `/dashboard/foto-dokumentasi`
3. ✅ Update Dashboard card path
4. ✅ Hapus `DokumentasiAIPage.jsx` (orphan)
5. ✅ BKU Sidebar → ganti dengan shortcut button

### Fase 2: Integrasi LPJ
6. Buat `FotoDokumentasiSection.jsx` — component inline
7. Integrasi ke `DokumenFormPreview.jsx` sebagai langkah ke-4
8. Foto otomatis masuk ke dokumen A4 saat cetak

### Fase 3: Polish
9. Galeri foto per dokumen (lihat semua foto yang sudah di-generate)
10. Re-use foto dari dokumen lain
11. Export foto sebagai lampiran dokumen LPJ

---

## 6. ⚖️ Trade-off & Pertimbangan

| Aspek | Kelebihan | Kekurangan |
|-------|-----------|------------|
| Integrasi di LPJ flow | Natural, terikat konteks | Perlu ubah DokumenFormPreview ( kompleks) |
| Halaman khusus | Akses mandiri, full-screen | User harus navigate ke halaman lain |
| Shortcut di BKU | Masih bisa akses dari BKU | BKU Sidebar jadi lebih ringan |

### Risiko
- `DokumenFormPreview.jsx` sudah kompleks (1226 baris) — integrasi foto harus hati-hati
- Foto base64 di localStorage bisa cepat penuh (sudah jadi issue di REVIEW_ARSITEKTUR.md)

---

## 7. ❓ Pertanyaan untuk User

1. **Apakah foto harus masuk ke dokumen A4 saat cetak?** Atau cukup sebagai lampiran terpisah?
2. **Apakah butuh Galeri Foto** (lihat semua foto yang sudah di-generate) atau cukup generate per dokumen?
3. **Prioritas:** Fase 1 (halaman khusus) dulu, atau langsung Fase 2 (integrasi LPJ)?
4. **Apakah perlu hapus** `DokumentasiAIPage.jsx` yang orphan, atau simpan sebagai backup?

---

## 8. 📊 Ringkasan

| Item | Status |
|------|--------|
| Brainstorming | ✅ Selesai |
| User Confirmation | ⏳ Menunggu |
| Fase 1: Halaman Khusus | ⏳ Belum mulai |
| Fase 2: Integrasi LPJ | ⏳ Belum mulai |
| Fase 3: Polish | ⏳ Belum mulai |

---

*Document generated by Buffy (Codebuff agent)*
