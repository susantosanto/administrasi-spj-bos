# RINGKASAN: Format Nomor Surat Formal Indonesia

## 📋 FORMAT STANDAR NASIONAL

### Format Dasar:
```
[Nomor Urut] / [Kode Unit] / [Kode Klasifikasi] / [Bulan Romawi] / [Tahun]
```

### Contoh Umum:
```
001 / Disdik / 420 / III / 2026
```

---

## 🏫 FORMAT SEKOLAH (SD/SMP/SMA)

### Format Umum:
```
[Nomor] / [Kode Sekolah] / [Kode Klasifikasi] / [Bulan] / [Tahun]
```

### Contoh:
```
001 / SDN.001.02.001 / 420 / III / 2026
```

---

## 📝 FORMAT BERDASARKAN JENIS SURAT

### A. Surat Tugas (STS)
```
[Nomor] / STS / [Kode Sekolah] / [Bulan] / [Tahun]
Contoh: 001 / STS / SDN.001.02 / VII / 2026
```

### B. Surat Keterangan (SK)
```
[Nomor] / SK / [Kode Sekolah] / [Bulan] / [Tahun]
Contoh: 001 / SK / SDN.001.02 / VII / 2026
```

### C. Surat Undangan (SU)
```
[Nomor] / SU / [Kode Sekolah] / [Bulan] / [Tahun]
Contoh: 001 / SU / SDN.001.02 / VII / 2026
```

### D. Surat Pernyataan (SP)
```
[Nomor] / SP / [Kode Sekolah] / [Bulan] / [Tahun]
Contoh: 001 / SP / SDN.001.02 / VII / 2026
```

### E. Surat Kuasa (SKU)
```
[Nomor] / SKU / [Kode Sekolah] / [Bulan] / [Tahun]
Contoh: 001 / SKU / SDN.001.02 / VII / 2026
```

---

## 🏛️ FORMAT DINAS PENDIDIKAN

### Format Resmi:
```
[Nomor] / Disdik / [Kode Klasifikasi] / [Bulan] / [Tahun]
```

### Contoh:
```
001 / Disdik / 001 / VIII / 2026
```

---

## 🔢 KODE KLASIFIKASI SURAT

| Kode | Jenis Surat |
|------|-------------|
| 100 | Surat Perintah (SP) |
| 200 | Surat Undangan (SU) |
| 300 | Surat Keterangan (SK) |
| 400 | Surat Tugas (STS) |
| 500 | Surat Pernyataan (SP) |
| 600 | Surat Kuasa (SKU) |
| 700 | Surat Edaran (SE) |
| 800 | Surat Pemberitahuan (SP) |

---

## 📊 KOMPONEN NOMOR SURAT

| Komponen | Keterangan | Contoh |
|----------|------------|--------|
| Nomor Urut | 3-5 digit | 001, 002, 003 |
| Kode Unit | Nama instansi/sekolah | SDN, Disdik |
| Kode Klasifikasi | Kode jenis surat | STS, SK, SU |
| Bulan | Romawi atau Angka | VII, 07 |
| Tahun | 4 digit atau 2 digit | 2026, 26 |

---

## ✅ REKOMENDASI UNTUK APLIKASI

### Format Default yang Disarankan:
```
[Nama SD] / [Kode Surat] / [Nomor Urut] / [Bulan] / [Tahun]
```

### Contoh:
```
SDN / STS / 001 / VII / 2026
```

### Format dengan Kode Sekolah:
```
[Kode SD] / [Kode Surat] / [Nomor Urut] / [Bulan] / [Tahun]
```

### Contoh:
```
SDN.001.02 / STS / 001 / VII / 2026
```

---

## 🎯 KOMPONEN YANG HARUS DI-IMPLEMENTASIKAN

1. **Nama Sekolah / Kode Sekolah**
   - Wajib diisi
   - Bisa berupa nama bebas atau kode resmi

2. **Kode Jenis Surat**
   - STS (Surat Tugas)
   - SK (Surat Keterangan)
   - SU (Surat Undangan)
   - SP (Surat Pernyataan)
   - SKU (Surat Kuasa)
   - SE (Surat Edaran)
   - Custom (sesuai kebutuhan)

3. **Nomor Urut**
   - 3 digit (001-999)
   - Auto-increment per bulan

4. **Bulan**
   - Romawi (I-XII) - **Format Standar**
   - Angka (01-12) - Alternatif
   - Nama (Januari-Desember) - Alternatif

5. **Tahun**
   - 4 digit (2026) - **Format Standar**
   - 2 digit (26) - Alternatif

---

## 📝 FORMAT YANG DIGUNAKAN SEKOLAH SD

### Format Umum SD:
```
001 / STS / SDN.001.02 / VII / 2026
```

### Penjelasan:
- `001` = Nomor urut surat ke-1 di bulan Juli
- `STS` = Surat Tugas
- `SDN.001.02` = SD Negeri 001 Kabupaten 02
- `VII` = Bulan Juli (Romawi)
- `2026` = Tahun 2026

---

## 🎯 KESIMPULAN

### Format Standar yang Harus Diimplementasikan:
```
[Nama/Kode Sekolah] / [Kode Surat] / [Nomor Urut] / [Bulan Romawi] / [Tahun]
```

### Contoh Implementasi:
```
SDN / STS / 001 / VII / 2026
```

### Komponen Custom (Optional):
- Kode Sekolah (misal: SDN.001.02)
- Kode Klasifikasi (misal: 420)
- Kode Instansi (misal: Disdik)
- Pemisah lainnya sesuai kebutuhan

---

*Research completed for: SPJ/BOSP Application*
*Purpose: Implement proper formal letter numbering format*
