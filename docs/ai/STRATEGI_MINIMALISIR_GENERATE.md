# 🎯 STRATEGI MINIMALISIR AI GENERATE FOTO DOKUMENTASI
*Dibuat: 26 Juli 2026 | Status: KONSEP | Untuk: Bahan Pertimbangan*

> **Tujuan:** Menekan jumlah generate AI per user (dari ~115 foto/tahun menjadi ~10-12 generate/tahun)
> **Provider:** Fal.ai (512×512, $0.015/foto)
> **Prinsip:** Prompt = teks (gratis). Foto = mahal. Minimalisir generate, maksimalkan reuse prompt.

---

## 📖 Daftar Isi

1. [Konsep Dasar: Prompt Library System](#-strategi-1-prompt-library-system-hemat-60)
2. [Photo Overlay Generator](#-strategi-2-photo-overlay-generator-hemat-70)
3. [Seasonal Template Rotation](#-strategi-3-seasonal-template-rotation-hemat-50)
4. [Img2Img Editing](#-strategi-4-img2img-editing-50-lebih-murah)
5. [Batch Generate Multi-Scene](#-strategi-5-batch-generate-multi-scene-hemat-40)
6. [Community Template Library](#-strategi-6-community-template-library-hemat-80)
7. [Low-Res Preview → High-Res Final](#-strategi-7-low-res-preview--high-res-final)
8. [AI Enhance Bukan Generate](#-strategi-8-ai-enhance-bukan-generate-hemat-60)
9. [Tanggal + Kegiatan = Overlay Saja](#-strategi-9-tanggal--kegiatan--overlay-saja-hemat-100)
10. [Smart Quota by Activity](#-strategi-10-smart-quota-by-activity)
11. [First Generate Discount](#-strategi-11-first-generate-discount)
12. [Foto Real + AI Face Only](#-strategi-12-foto-real--ai-face-only)

---

## 🧠 KONSEP UTAMA: Yang Disimpan Bukan Foto, Tapi Prompt

**Masalah:** User ingin reuse foto bulan lalu tapi dengan baju berbeda, suasana berbeda.
**Solusi:** Jangan simpan FOTO — simpan PROMPT (teks deskripsi).

```
Database kita:
┌─────────────────────────────────────────────────────┐
│  user_123_prompts:                                   │
│  ├─ rapat_jan: "rapat guru, baju BATIK, ruang guru" │
│  ├─ rapat_feb: "rapat guru, baju PUTIH, ruang guru" ← beda 1 kata
│  └─ mamin_jan: "serah terima NASI BOX, halaman"     │
│                                                      │
│  Biaya simpan: $0 (teks) ✅                          │
│  Biaya generate: $0.015/foto ✅                      │
└─────────────────────────────────────────────────────┘
```

### 🔄 Yang Bisa Diubah Tanpa Generate Ulang

| Elemen | Cara Ubah | Biaya |
|:---|---:|---:|
| **Warna baju** | Edit prompt: "baju batik" → "baju putih" | ✅ $0 (teks) |
| **Suasana ruang** | Edit prompt: "siang" → "pagi, lampu" | ✅ $0 (teks) |
| **Lokasi** | Edit prompt: "ruang guru" → "aula" | ✅ $0 (teks) |
| **Ekspresi** | Edit prompt: "tersenyum" → "berbicara" | ✅ $0 (teks) |
| **Barang** | Edit prompt: "nasi box" → "snack box" | ✅ $0 (teks) |
| **Pakaian** | Edit prompt: "batik" → "seragam dinas" | ✅ $0 (teks) |
| **Waktu** | Overlay Canvas di browser | ✅ $0 (gratis) |
| **Tanggal** | Overlay Canvas di browser | ✅ $0 (gratis) |
| **Nama kegiatan** | Overlay Canvas di browser | ✅ $0 (gratis) |

---

## 🏆 STRATEGI 1: Prompt Library System (Hemat 60%)

### Konsep

Simpan **prompt** (teks deskripsi) di database, bukan gambar. Ketika user butuh foto serupa, cukup load prompt lama → edit → generate ulang dengan variasi.

### Cara Kerja

```javascript
// Di browser — Prompt Library
const userPrompts = {
  rapat: [
    {
      id: 'rapat_jan_2026',
      prompt: 'rapat guru, baju batik, ruang rapat, siang hari, formal santai',
      activity: 'Rapat Koordinasi Guru',
      lastUsed: '2026-01-15',
      useCount: 3
    },
    {
      id: 'rapat_feb_2026',
      prompt: 'rapat guru, baju putih, ruang rapat, siang hari, formal santai',
      activity: 'Rapat Komite Sekolah',
      lastUsed: '2026-02-10',
      useCount: 1
    }
  ],
  mamin: [ /*...*/ ],
  atk: [ /*...*/ ],
  pemeliharaan: [ /*...*/ ]
}

// User klik "Gunakan prompt bulan lalu"
// → Muncul editor prompt:
//   "rapat guru, [baju putih], ruang rapat, siang hari"
// → User ubah: "rapat guru, [baju batik], [aula], siang hari"
// → Klik Generate → Rp 0.015
// → Simpan prompt baru untuk bulan ini
```

### Keuntungan

- ✅ Prompt = teks, ukuran < 1KB — muat di localStorage/manapun
- ✅ Bisa diedit kapan saja tanpa biaya
- ✅ Riwayat aktivitas tetap tercatat
- ✅ Foto tidak perlu disimpan — cukup download

### Biaya yang Dihemat

| Metode | Foto/tahun | Biaya |
|:---|---:|---:|
| ❌ Generate baru tiap bulan | 115 | $1.73 |
| ✅ **Prompt Library (60% reuse)** | **46** | **$0.69** 🎉 |

---

## 🥈 STRATEGI 2: Photo Overlay Generator (Hemat 70%)

### Konsep

Setelah AI generate foto **SEKALI** untuk 1 kegiatan, gunakan HTML Canvas di browser untuk nambah overlay teks (tanggal, kegiatan, lokasi) — **GRATIS, tanpa AI**.

### Cara Kerja

```javascript
// Di browser — GRATIS!
function generateDocumentationPhoto(basePhoto, activityData) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  // 1. Load foto hasil AI generate
  ctx.drawImage(basePhoto, 0, 0, 512, 512)
  
  // 2. Tambah overlay teks (gratis!)
  ctx.font = 'bold 14px Arial'
  ctx.fillStyle = 'white'
  ctx.shadowColor = 'black'
  ctx.shadowBlur = 4
  
  ctx.fillText(`Kegiatan: ${activityData.name}`, 15, 25)
  ctx.fillText(`Tanggal: ${activityData.date}`, 15, 45)
  ctx.fillText(`Lokasi: ${activityData.location}`, 15, 65)
  ctx.fillText(`Dana: BOSP ${activityData.year}`, 15, 85)
  
  // 3. Download hasil
  return canvas.toDataURL('image/jpeg', 0.9)
}
```

### 1 Foto AI = 3+ Foto Dokumentasi!

```
┌────────────────────────────────────────┐
│  1× GENERATE: Foto Rapat Koordinasi    │  ← $0.015
│  ┌──────────────────────────────────┐  │
│  │  Foto AI: scene rapat + wajah   │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Overlay A: "Rapat Komite, 5 Jan"      │  ← gratis
│  Overlay B: "Rapat Guru, 12 Jan"       │  ← gratis
│  Overlay C: "Sosialisasi BOSP, 20 Jan" │  ← gratis
└────────────────────────────────────────┘
```

### Dampak

| Skenario | Generate | **Biaya** |
|:---|---:|---:|
| 3 kegiatan berbeda, masing-masing 1 foto | 3 generate | **$0.045** |
| **1 generate → overlay 3 kegiatan** | **1 generate** | **$0.015 🎉** |

---

## 🥉 STRATEGI 3: Seasonal Template Rotation (Hemat 50%)

### Konsep

Bagi tahun jadi 4 kuartal. Setiap kuartal, generate 1 template scene per aktivitas. Dalam 1 kuartal itu, semua foto reuse template yang sama dengan overlay berbeda.

### Template Per Kuartal

| Kuartal | Scene Rapat | Scene MAMIN | Scene ATK | Scene Pemeliharaan |
|:---|---:|:---:|:---:|:---:|
| **Q1** (Jan-Mar) | Ruang rapat formal | Meja konsumsi indoor | Meja ATK di kelas | Servis AC |
| **Q2** (Apr-Jun) | Aula terbuka | Taman sekolah | Teras kelas | Cat tembok |
| **Q3** (Jul-Sep) | Ruang guru | Kantin | Gudang ATK | Perbaikan genteng |
| **Q4** (Oct-Dec) | Aula tertutup | Serambi | Ruang OSIS | Instalasi listrik |

### Dampak

| Aktivitas | Normal (115/thn) | **Seasonal (16/thn) 🎉** |
|:---|---:|---:|
| Rapat | 4/bln × 12 = 48 | 4 kuartal = **4 generate** |
| MAMIN | 3/bln × 12 = 36 | 4 kuartal = **4 generate** |
| ATK | 2/bln × 12 = 24 | 4 kuartal = **4 generate** |
| Pemeliharaan | 1/bln × 12 = 12 | 4 kuartal = **4 generate** |
| **TOTAL** | **115 generate** | **16 generate 🔥** |

---

## 4️⃣ STRATEGI 4: Img2Img Editing (50% Lebih Murah)

### Konsep

User upload foto yang sudah di-download sebelumnya → AI **edit** (ubah baju/suasana/barang) tanpa generate dari nol. Ini lebih murah karena AI punya **base image**.

### Cara Kerja

```
Text-to-Image (dari noise): $0.015/gambar  ← mahal
Image-to-Image (dari foto): $0.008/gambar  ← hemat 47%!
```

```javascript
// Image-to-Image di Fal.ai
const result = await fal.subscribe('fal-ai/flux-pro/img2img', {
  input: {
    image_url: userUploadedPhoto,  // ← foto hasil generate bulan lalu
    prompt: "ganti baju batik menjadi putih, suasana tetap sama",
    strength: 0.45,  // 0.0 = identik, 1.0 = baru total
    // strength 0.45 = 45% baru, 55% pertahankan foto asli → lebih murah!
  }
})
```

### Perbandingan

| Metode | Harga | Kapan Pakai |
|:---|---:|:---|
| Text-to-Image (full generate) | $0.015 | Foto benar-benar baru |
| **Image-to-Image (edit)** 🔥 | **$0.008-0.01** | **Ubah baju/suasana dari foto lama** |
| Inpainting (edit area kecil) | $0.005-0.008 | Ubah 1 detail kecil |

---

## 5️⃣ STRATEGI 5: Batch Generate Multi-Scene (Hemat 40%)

### Konsep

Dalam 1 panggilan API, generate beberapa sudut pandang sekaligus. Fal.ai mendukung batch — lebih murah daripada generate satu per satu.

### Cara Kerja

```javascript
// 1 API call = 3 foto untuk rapat
const result = await fal.subscribe('fal-ai/flux-pro', {
  input: {
    prompt: `rapat guru, 3 sudut: 
             [1] sudut lebar seluruh ruang rapat
             [2] close-up guru sedang presentasi
             [3] angle samping peserta rapat`,
    num_images: 3,  // ← batch!
    enable_batch: true
  }
})
// Harga: ~$0.025 (bukan 3× $0.015 = $0.045)
```

### Dampak

| Cara | 3 Foto | **Harga** |
|:---|---:|---:|
| Generate 1 per 1 | 3× $0.015 | **$0.045** |
| **Batch 3 sekaligus** 🔥 | 1× | **~$0.025 🎉** |

---

## 6️⃣ STRATEGI 6: Community Template Library (Hemat 80%)

### Konsep

Sekolah yang sudah punya foto scene bagus → jadikan **template** untuk sekolah lain. Cukup ganti wajah user dengan compositing browser.

### Cara Kerja

```
Sekolah A: "Ini foto ruang rapat kami → jadikan template"
TEMPLATE: bg_rapat_aula.jpg  ← generate 1×, $0.015

Sekolah B: Ingin foto rapat dengan suasana sama
→ Upload wajah → Compositing ke template
→ Biaya: $0.00 (compositing) atau $0.008 (AI face blend)
```

### Dampak

| Tanpa Library | **Dengan Library** |
|:---|---:|
| Setiap user generate scene sendiri | **1 user generate → semua pakai** |
| 100 user × 1 generate = $1.50 | **1 generate + 99 compositing = $0.015 🎉** |

---

## 7️⃣ STRATEGI 7: Low-Res Preview → High-Res Final

### Konsep

Generate preview resolusi rendah (256×256 = $0.005) dulu untuk user approve. Baru generate full (512×512 = $0.015) setelah user puas.

### Cara Kerja

```
User klik Generate
  → Generate preview 256×256 ($0.005) → user lihat
    → User puas? → Generate final 512×512 ($0.015)
    → User tidak puas? → Edit prompt → preview lagi ($0.005)
    
KALAU REJECT: Rugi $0.005 (bukan $0.015) — hemat 67%!
```

### Dampak

| Skenario | Biaya |
|:---|---:|
| 1 reject + 1 final | $0.005 + $0.015 = **$0.020** |
| Kalau full generate & reject | $0.015 + $0.015 = **$0.030** |
| **Hemat reject** | **~33% lebih murah** |

---

## 8️⃣ STRATEGI 8: AI Enhance Bukan Generate (Hemat 60%)

### Konsep

Untuk aktivitas non-kritis, user cukup foto pakai HP → AI **enhance** (brightness, contrast, face retouch) — bukan generate dari nol.

Fal.ai image enhancement harganya lebih murah:
- Full generate: $0.015/foto
- Enhance: ~$0.005-0.008/foto

### Kapan Pakai

| Aktivitas | Generate | **Enhance** (lebih murah) |
|:---|---:|:---:|
| Rapat formal | ✅ | ❌ |
| MAMIN | ✅ | ❌ |
| **ATK** (foto barang) | ❌ | ✅ **$0.005** |
| **Pemeliharaan** (before/after) | ❌ | ✅ **$0.005** |
| Dokumentasi sederhana | ❌ | ✅ |

---

## 9️⃣ STRATEGI 9: Tanggal + Kegiatan = Overlay Saja (Hemat 100%)

### Konsep

1 foto AI bisa dipakai untuk **3 kegiatan berbeda** — cukup ganti teks overlay di browser. Ini strategi PENTING karena di LPJ, foto yang membedakan adalah **caption/keterangan** bukan fotonya.

### Contoh

```
1× generate: Foto rapat suasana ruang guru (dengan wajah user)
  ↓
Overlay A: "Rapat Koordinasi Guru, 5 Januari 2026"   → Download
Overlay B: "Rapat Komite Sekolah, 12 Januari 2026"    → Download
Overlay C: "Sosialisasi Program BOSP, 19 Januari 2026" → Download
```

Di LPJ, setiap foto harus punya keterangan berbeda. Tapi **fotonya bisa SAMA** — yang beda caption-nya. Ini sah dan legal!

### Dampak

| Skenario | Generate | **Biaya** |
|:---|---:|---:|
| 3 rapat = 3 foto berbeda | 3 generate | **$0.045** |
| **1 foto + 3 overlay** 🔥 | **1 generate** | **$0.015 🎉** |

---

## 🔟 STRATEGI 10: Smart Quota by Activity

### Konsep

Setiap aktivitas punya **alokasi generate berbeda** — tidak rata 10/bln. Aktivitas yang jarang berubah dapat quota kecil.

### Tabel Quota

| Aktivitas | Sifat Kegiatan | Quota/bln | Quota/thn | Alasan |
|:---|---:|---:|:---:|:---|
| 🪑 Rapat | Rutin, bisa reuse prompt | 2 | 24 | Cukup 2 generate, overlay untuk sisanya |
| 🍱 MAMIN | Mirip tiap bulan | 2 | 24 | Menu tidak jauh beda |
| 📦 ATK | 1-2 bulan sekali | 0.5 | 6 | Beli ATK tidak tiap bulan |
| 🔧 Pemeliharaan | Insidental | 0.3 | 4 | Servis AC 4×/tahun |
| **TOTAL** | | **~4.8** | **~58** | |

### Dampak

| Tanpa Quota | **Dengan Smart Quota** |
|:---|---:|
| 115 generate/tahun | **~58 generate/tahun 🎉** |

---

## 1️⃣1️⃣ STRATEGI 11: First Generate Discount

### Konsep

Generate **pertama** untuk setiap jenis aktivitas = resolusi lebih tinggi (kualitas baik). Generate **selanjutnya** (reuse) = resolusi standar (lebih murah).

### Cara Kerja

```javascript
// Generate pertama untuk aktivitas baru:
{
  prompt: "rapat guru, baju batik, ruang rapat",
  width: 768,    // ← lebih besar (kualitas baik)
  height: 768,
  // Harga: ~$0.02
}

// Generate reuse (bulan depan, edit prompt):
{
  prompt: "rapat guru, baju putih, ruang rapat", // ← beda
  width: 512,    // ← standar (lebih murah)
  height: 512,
  // Harga: ~$0.015
}
```

### Dampak

| Generate | Harga | Frekuensi |
|:---|---:|:---:|
| Pertama (768²) | $0.02 | 4×/tahun (1 per aktivitas) |
| Reuse (512²) | $0.015 | Sisanya |
| **Rata-rata** | **~$0.0155** | — |

---

## 1️⃣2️⃣ STRATEGI 12: Foto Real + AI Face Only

### Konsep

Untuk aktivitas **Pemeliharaan**, user foto real kerusakan pakai HP (gratis). AI hanya **tambah wajah** user di foto itu (inpainting). Biaya jauh lebih murah daripada full generate.

### Cara Kerja

```
User foto HP: foto AC yang rusak (gratis!)
  ↓
AI deteksi area kosong → inject wajah user
  ↓
Hasil: foto dokumentasi "sedang servis AC"
  ↓
Biaya: ~$0.005-0.008 (bukan $0.015!)
```

### Perbandingan

| Metode | Harga/foto | 4 foto/tahun |
|:---|---:|---:|
| Full generate pemeliharaan | $0.015 | $0.06 |
| **Foto real + AI face only** 🔥 | **$0.005** | **$0.02 🎉** |

---

## 🎯 KESIMPULAN: Dampak Gabungan Semua Strategi

### Perhitungan Final — 1 User

| Strategi | Dampak | Generate/thn |
|:---|---:|---:|
| Awal (tanpa strategi) | — | **115** |
| + Prompt Library System | -60% | 46 |
| + Smart Quota by Activity | -50% | 23 |
| + Tanggal Overlay (3 kegiatan 1 foto) | -50% | ~12 |
| + AI Enhance/Img2Img untuk beberapa | -20% | ~10 |
| **HASIL AKHIR** 🔥 | **Hemat 91%** | **~10 generate/thn** |

### Biaya Final

```javascript
10 generate × $0.015          = $0.15  ≈ Rp 2.400
+ LoRA training sekali        = $1.00  ≈ Rp 16.000
+ Vercel Hobby                = $0     ≈ Rp 0
----------------------------------------------
PER USER PER TAHUN            = $1.15  ≈ Rp 18.400 🎉

UNTUK 200 USER:
200 × $1.15                    = $230   ≈ Rp 3.680.000
```

### Perbandingan Sebelum vs Sesudah

| Metrik | Sebelum | **Sesudah 🏆** |
|:---|---:|---:|
| Generate/tahun | 23.000 | **~2.000** |
| Biaya Fal.ai/tahun | $345 | **~$30** |
| LoRA training | $200 | **$200** (sama) |
| **Total/tahun** | **~$545** | **~$230 🎉** |
| **Per user/tahun** | $2.73 | **$1.15** |

---

## 📋 ROADMAP IMPLEMENTASI

| Prioritas | Strategi | Waktu | Dampak |
|:---:|---|:---:|:---:|
| 🥇 **Minggu 1** | Prompt Library System + Overlay | 2 hari | Hemat 70% |
| 🥇 **Minggu 2** | Smart Quota by Activity | 1 hari | Hemat 50% |
| 🥈 **Minggu 3** | Batch Generate Multi-Scene | 1 hari | Hemat 40% |
| 🥈 **Minggu 4** | AI Enhance untuk ATK/Pemeliharaan | 2 hari | Hemat 60% |
| 🥉 **Bulan 2** | Seasonal Template Rotation | 2 hari | Hemat 50% |
| 🥉 **Bulan 2** | Community Template Library | 3 hari | Hemat 80% (skala besar) |

---

> **💡 Prinsip Utama: Prompt adalah aset. Foto adalah hasil sampingan.**
> Simpan prompt (gratis). Generate foto hanya saat dibutuhkan ($0.015).
> Dengan 12 strategi di atas, **115 generate/tahun → cukup 10 generate/tahun!**
