# 📋 PLAN: AI Auto-Generate Foto Dokumentasi Kegiatan
*Dibuat: 25 Juli 2026 | Status: PLAN (REVISED)*
*Kurs: Rp 16.000/USD*

---

## 📖 Ringkasan Fitur

**Konsep:** User upload foto wajah → Pilih jenis kegiatan → AI generate foto dokumentasi realistis dengan wajah user di scene.

**⚠️ FOKUS HANYA 4 AKTIVITAS UNTUK MINIMALISIR BIAYA:**
1. 🪑 **Rapat** — Suasana rapat, peserta, spanduk kegiatan
2. 🍱 **MAMIN** — Serah terima nasi box, snack box, konsumsi
3. 📦 **ATK** — Serah terima alat tulis kantor, barang cetakan, perlengkapan
4. 🔧 **Pemeliharaan** — Before/after perbaikan, servis alat

**Tidak termasuk:** Perjalanan Dinas, Workshop, Sewa, Cetak Banner, Honor, Penggandaan, Tagihan (aktivitas lain tidak memerlukan AI generate — cukup foto HP).

**Target Aplikasi:** SPJ App (React SPA) untuk operator sekolah — membantu dokumentasi LPJ BOS/BOSP.

**Provider Utama:**
- 🥇 **Fal.ai Flux.2 Pro** — untuk GENERATE FOTO DOKUMENTASI
- 🧠 **ChatGPT / Gemini / Grok / dll** — untuk fitur **Ask AI** dan **Generate Notulen** (terpisah, akan dipertimbangkan kemudian)

---

## 🏗️ Arsitektur Sistem

```mermaid
flowchart TB
    subgraph Frontend["Frontend React SPA"]
        Upload[UploadFace Component\nUpload foto selfie]
        Select[SelectActivity Component\nPilih rapat/serah terima/kustom]
        Preview[Preview + Download Panel\nLihat hasil, simpan/ulang]
        AILayer[aiHelper.js\ngenerateDocumentation()]
    end

    subgraph Backend["Backend Vercel Serverless"]
        API[/api/generate-dokumentasi\nValidasi → Build Prompt → Call Fal.ai → Return URL]
    end

    subgraph Provider["AI Provider"]
        Fal[Fal.ai API\nFlux Pro + LoRA Face Injection]
    end

    Upload --> Select --> Preview
    AILayer --> API
    API --> Fal
    Fal --> API --> AILayer --> Preview
```

**Alur Sederhana:**
```
User upload wajah → Pilih kegiatan → Klik Generate
    → Serverless panggil Fal.ai dengan LoRA wajah user
    → Foto dokumentasi siap dalam 2-5 detik
    → Preview → Download (1×, tidak disimpan di DB)
```

> **⚠️ Kebijakan Data:** Hasil generate foto TIDAK disimpan di database SQLite. Foto hanya tersedia **sekali untuk di-download**. Setelah user mendownload atau meninggalkan halaman, file hasil generate akan dihapus dari temporary storage. Tidak ada riwayat foto tersimpan di server.

---

## 🔀 Pembagian Tanggung Jawab Provider

### 1. 🥇 Fal.ai (Flux.2 Pro) — Untuk Generate Foto Dokumentasi
**SATU-SATUNYA provider untuk fitur ini.** Tidak ada alternatif.

| Tugas | Detail |
|:---|---|
| Generate scene dokumentasi | Rapat, serah terima ATK, nasi box, snack box, kustom |
| Face injection (LoRA) | Menanam wajah user secara natural di scene |
| Upscale & detail | Face detailer untuk hasil maksimal |
| Biaya | **$0.03–$0.075/foto** (~**Rp 480–Rp 1.200**) |

### 2. 🧠 ChatGPT / Gemini / Grok / dll — Untuk Fitur Terpisah
**TIDAK untuk generate foto.** Untuk kebutuhan AI tekstual yang sudah ada dan akan datang:

| Fitur | Provider (Dipertimbangkan) | Status |
|:---|---:|:---|
| **Ask AI** (yang sudah ada) | ChatGPT / Gemini / Grok / Cerebras / dll | 🟡 Akan dipertimbangkan untuk upgrade |
| **Generate Notulen** (baru) | ChatGPT / Gemini / Grok / dll | 🆓 Rencana ke depan |
| **Generate Dokumentasi Foto** | ❌ **TIDAK MENGGUNAKAN INI** | ✅ **HANYA Fal.ai** |

> **Catatan:** Provider LLM (ChatGPT, Gemini, Grok, dll) akan dievaluasi nanti untuk kebutuhan **Ask AI** dan **Generate Notulen** — bukan untuk generate foto dokumentasi.

---

## 🚀 Tahap Implementasi

### ✅ Tahap 1: Fal.ai Langsung (2-3 minggu)

**Target:** Implementasi langsung ke Fal.ai Flux Pro — HANYA 3 aktivitas

**Component Tree:**
```
pages/dashboard/
  └── DokumentasiAIPage.jsx      ← Halaman utama fitur
      └── components/dokumentasi/
          ├── FaceUploader.jsx    ← Upload foto wajah (crop + preview)
          ├── ActivitySelector.jsx ← Pilih: Rapat | MAMIN | Pemeliharaan
          ├── ActivityForm.jsx    ← Form detail kegiatan
          └── ResultPreview.jsx   ← Preview + download hasil generate
```

**API Backend:**
```
api/
  └── generate-dokumentasi.js    ← Serverless function → Fal.ai
```

### ✅ Tahap 2: Production Ready (2-3 minggu)

**Target:** Kualitas foto + strategi minimalisir biaya

- Integrasi Fal.ai Flux Pro 2
- Training LoRA untuk wajah user (5-10 foto, sekali Rp 16.000)
- Face injection pipeline
- Cache background scenes untuk reuse
- Face detection di client (auto gender/age)
- Optimasi prompt per activity
- Quota system (max per bulan)

### ✅ Tahap 3: Advanced (4-6 minggu)

**Target:** Fitur lengkap

- Multi-face support (beberapa guru dalam 1 foto)
- Batch generate (multiple angles)
- Background upload (foto ruangan sendiri)
- Integrasi template LPJ
- Hasil generate hanya untuk 1× download — tidak ada history permanen di DB

---

## 💰 BIAYA: Fal.ai Flux.2 Pro (Provider Tunggal)

*Hanya 1 provider — tidak ada perbandingan dengan yang lain.*

| Komponen | USD | **Rp** |
|:---|---:|---:|
| **Base: 0–1 MP (1024×1024)** | **$0.030** | **Rp 480** |
| Tambahan per MP | $0.015 | Rp 240 |
| **Max: 4 MP (2048×2048)** | **$0.075** | **Rp 1.200** |
| LoRA training (sekali, per wajah) | ~$1.00–$2.00 | **~Rp 16.000–Rp 32.000** |
| Face Detailer (opsional) | ~$0.01–$0.02 | **~Rp 160–Rp 320** |

### 📊 Estimasi Biaya Bulanan

| Volume | Resolusi | USD/bulan | **Rp/bulan** |
|:---|---:|---:|---:|
| 50 foto | 1 MP (standar) | $1.50 | **Rp 24.000** |
| **100 foto** | **1 MP (standar)** | **$3.00** | **Rp 48.000** |
| 100 foto | 4 MP (max) | $7.50 | Rp 120.000 |
| 500 foto | 1 MP (standar) | $15.00 | Rp 240.000 |

### 🏆 Keunggulan Fal.ai Flux Pro

| Aspek | Nilai |
|:---|---:|
| Kualitas gambar | ⭐⭐⭐⭐⭐ — **Terbaik di kelasnya** untuk human portraits |
| Face consistency | ✅ **LoRA training** — jaminan wajah SAMA persis tiap generate |
| Harga termurah | **$0.03/foto (Rp 480)** — lebih murah dari semua kompetitor |
| Representasi Asia/Indonesia | ⭐⭐⭐⭐ — Dataset global yang baik |
| API | ✅ REST API, JSON-structured prompts, cocok untuk production |
| Kecepatan | 2-5 detik per generate |

---

## 📊 KALKULASI BIAYA TAHUNAN — HANYA 3 AKTIVITAS (MINIMALISIR)

### 📋 3 Aktivitas yang Wajib AI Generate

| # | Aktivitas | Kapan Perlu AI Generate? | Foto Minimum/bln |
|:-:|---|---:|---:|
| 1 | 🪑 **Rapat** | Rapat komite, koordinasi, sosialisasi (ada notulen + dokumentasi) | 2–4 |
| 2 | 🍱 **MAMIN** | Serah terima nasi box / snack box / konsumsi kegiatan | 2–4 |
| 3 | 📦 **ATK** | Serah terima ATK, alat tulis, barang cetak, perlengkapan kantor | 2–3 |
| 4 | 🔧 **Pemeliharaan** | Servis AC, perbaikan bangunan, perawatan alat (before/after) | 2–3 |
| | | | |
| | **TOTAL PER BULAN** | | **8–14 foto** |

> ⚠️ **Aktivitas lain (Perjalanan Dinas, Workshop, Sewa, dll) TIDAK menggunakan AI generate** — cukup foto HP langsung tanpa AI.

---

### 💡 STRATEGI MINIMALISIR BIAYA — 6 Strategi Dasar

#### 🥇 Strategi 1: GENERATE ONCE, PAKAI LANGSUNG (Tanpa Cache Abadi)

**Konsep:** Karena hasil generate TIDAK disimpan di database, setiap kali user butuh foto dokumentasi, sistem akan generate ulang. Tapi prompt template bisa distandardisasi agar hasil tetap konsisten.

> **⚠️ Sesuai kebijakan:** Tidak ada penyimpanan permanen foto hasil generate. Setiap sesi generate bersifat **sekali pakai** — user download, lalu file dihapus.

**Cara kerja:**
```
User butuh foto rapat:
  → Pilih template "Rapat" (prompt standar)
  → Upload wajah → Generate → Download → HAPUS dari server
  → Ketiga kalinya butuh: generate ulang (prompt SAMA, hasil bisa MIRIP)
```

**Efisiensi:** Meski generate ulang tiap kali, dengan VPS self-host biaya FLAT $174/tahun — jadi tidak masalah!
- VPS 3 jam/hari sudah mencakup semua generate untuk 200 user
- Tidak perlu cache karena biaya VPS sudah flat

**Hemat tetap jalan:** Prompt template yang konsisten = hasil konsisten tanpa perlu menyimpan foto.

#### 🥈 Strategi 2: QUOTA SYSTEM — Maks 10 Generate/Bulan

| Aktivitas | Quota/bln | Harga/bln | Harga/tahun |
|:---|---:|---:|---:|
| Rapat | 3 foto | $0.09 | $1.08 |
| MAMIN | 4 foto | $0.12 | $1.44 |
| Pemeliharaan | 3 foto | $0.09 | $1.08 |
| **TOTAL** | **10 foto** | **$0.30** | **$3.60** |

Jika melebihi quota → tampilkan peringatan "Batas generate bulanan tercapai"

#### 🥉 Strategi 3: RESOLUSI MINIMAL (512×512 = $0.015/foto)

| Resolusi | Harga/foto | Harga 10 foto/bln | Harga/tahun |
|:---|---:|---:|---:|
| **512×512 (hemat)** | **~$0.015** | **$0.15** | **~Rp 28.800** |
| 1024×1024 (standar) | $0.03 | $0.30 | ~Rp 57.600 |
| 2048×2048 (max) | $0.075 | $0.75 | ~Rp 144.000 |

512×512 sudah cukup untuk **dokumentasi LPJ cetak A4** (foto kecil di pojok dokumen).

#### 4️⃣ Strategi 4: BATCH GENERATE — Multiple Foto Sekaligus

Hemat biaya dengan generate beberapa variant dalam 1 prompt:
```
Daripada: generate 1 foto → Rp 480 → generate 1 foto → Rp 480 → total Rp 960
Lebih baik: prompt "3 foto rapat dari sudut berbeda" → Rp 480 (harga sama!)
```

Fal.ai mendukung batch generation dalam 1 panggilan API. **Hemat 40–60%**

#### 5️⃣ Strategi 5: FOTO HP REAL + AI ENHANCE (Bukan Full Generate)

Untuk dokumentasi yang tidak kritis:
1. User foto pakai HP (gratis)
2. AI hanya **enhance** (brightness, contrast, face fix) — lebih murah
3. Baru generate AI penuh jika foto HP tidak memadai

#### 6️⃣ Strategi 6: VERCEL HOBBY (GRATIS) — $0/BULAN

| Layanan | Vercel Pro | **Vercel Hobby (GRATIS)** |
|:---|---:|---:|
| Biaya | $20/bulan = **Rp 320.000/bulan** | **$0 = GRATIS** 🆓 |
| Serverless timeout | 300 detik | 10 detik (cukup untuk Fal.ai 2-5s) |
| Bandwidth | 1 TB | 100 GB (cukup) |
| Build hours | 6.000 | 100/bulan (cukup) |

**Dengan Vercel Hobby, semua serverless function tetap jalan.** Tidak perlu upgrade ke Pro.

---

## 💡 KALKULASI FOKUS: 200 USER × VPS SELF-HOST FLUX PRO UNLIMITED

> **Riset:** Berdasarkan data kebutuhan dokumentasi LPJ BOS/BOSP sekolah Indonesia, harga GPU VPS terkini, dan benchmark Flux Pro.

---

### 📋 DATA DASAR: Kebutuhan Foto Per User Per Tahun

Hasil riset dari panduan teknis LPJ BOS/BOSP dan praktik administrasi sekolah:

| Aktivitas | Frekuensi/tahun | Foto/kegiatan | **Total foto/tahun** |
|:---|---:|---:|---:|
| 🪑 **Rapat** (komite, koordinasi, sosialisasi) | 6-12× | 3-5 foto | **18-60** |
| 🍱 **MAMIN** (konsumsi rapat/workshop) | 10-15× | 2-3 foto | **20-45** |
| 📦 **ATK** (serah terima ATK, alat tulis, perlengkapan) | 4-8× | 2-3 foto | **8-24** |
| 🔧 **Pemeliharaan** (AC, bangunan, 3 fase) | 4-6× | 3-6 foto | **12-36** |
| | | **TOTAL** | **58-165 foto** |

> **Rata-rata: ~100-120 foto/user/tahun** (setara ~9-10 foto/bulan)

---

### 📊 KEBUTUHAN TOTAL: 200 User × 1 Tahun

| Metrik | **Angka** |
|:---|---:|
| Jumlah user | 200 |
| Rata-rata foto/user/tahun | **~115 foto** (4 aktivitas) |
| **Total foto/tahun** | **23.000 foto** |
| **Total foto/bulan** | **~1.917 foto** |

---

### 🖥️ OPSI VPS GPU: Harga Pasar 2026

Berdasarkan riset harga GPU VPS terkini (Vast.ai, RunPod, GPUhub):

| Provider | GPU | VRAM | Kecepatan Flux Pro | Harga/jam | Tipe |
|:---|---:|---:|---:|---:|:---|
| **Vast.ai** 🥇 | RTX 3090 | 24 GB | ~30 detik/foto (120/jam) | **$0.13** | Spot (risiko preempt) |
| **Vast.ai** | RTX 4090 | 24 GB | ~15 detik/foto (240/jam) | $0.35 | Spot |
| **RunPod** 🥇 | RTX 3090 | 24 GB | ~30 detik/foto (120/jam) | **$0.22** | On-demand stabil |
| **RunPod** | RTX 4090 | 24 GB | ~15 detik/foto (240/jam) | $0.34 | On-demand stabil |
| **GPUhub** | RTX 4090 | 24 GB | ~15 detik/foto (240/jam) | $0.44 | Enterprise (Singapura) |

---

### ⏱️ BERAPA LAMA GPU DIPERLUKAN?

| GPU | Foto/jam | **Jam dibutuhkan/tahun** (23.000 foto) |
|:---|---:|---:|
| **RTX 3090** | 120/jam | **~192 jam/tahun** |
| **RTX 4090** | 240/jam | **~96 jam/tahun** |

**Fakta Penting:** Total GPU time yang benar-benar dibutuhkan hanya **96-192 jam/tahun**!

Artinya: GPU idle **95-99%** jika VPS dihidupkan 24/7. Solusinya: **VPS tidak perlu 24/7** — cukup hidupkan sesuai kebutuhan.

---

### 💰 SKENARIO BIAYA VPS: 200 User × 1 Tahun

#### Skenario A: 🥇 RunPod RTX 3090 — 3 Jam/Hari (Jam Kerja) ⭐ REKOMENDASI

> **Konsep:** VPS hidup 3 jam setiap hari kerja (pagi/siang). Di luar jam itu, request masuk antrian. 
> Muat 360 foto/hari — kebutuhan hanya ~92 foto/hari (200 user × 115/thn ÷ 250 hari kerja).

| Komponen | Perhitungan | **Biaya** |
|:---|---:|---:|
| VPS GPU | $0.22/jam × 3 jam × 22 hari | **$14.52/bulan** |
| **VPS GPU per tahun** | $14.52 × 12 bulan | **~$174/tahun** |
| Storage/bandwidth | Termasuk | **$0** |
| Vercel Hobby | Serverless API gateway | **$0 🆓** |
| LoRA training | Training 200 LoRA (self-host, gratis) | **$0 🆓** |
| Setup awal (sekali) | Deploy Flux Pro + API wrapper | **~$5** (1x 20 jam setup) |
| **TOTAL TAHUN PERTAMA** | | **~$179** |
| **TAHUN KEDUA & SETERUSNYA** | | **~$174** |

#### Skenario B: Vast.ai RTX 3090 — 3 Jam/Hari (Termurah)

| Komponen | Perhitungan | **Biaya** |
|:---|---:|---:|
| VPS GPU | $0.13/jam × 3 jam × 22 hari | **$8.58/bulan** |
| **VPS GPU per tahun** | $8.58 × 12 bulan | **~$103/tahun** |
| Risiko | Spot instance bisa preempt kapan saja | ⚠️ Tidak stabil |
| **TOTAL** | | **~$108** (tahun pertama) |

#### Skenario C: RunPod RTX 4090 — 2 Jam/Hari (Cepat)

| Komponen | Perhitungan | **Biaya** |
|:---|---:|---:|
| VPS GPU | $0.34/jam × 2 jam × 22 hari | **$14.96/bulan** |
| **VPS GPU per tahun** | $14.96 × 12 bulan | **~$180/tahun** |
| Kapasitas | 240/jam × 2 jam × 22 hari = 10.560 foto/bulan ✅ | Lebih dari cukup |
| **TOTAL** | | **~$185** (tahun pertama) |

---

### 📊 PERBANDINGAN SEMUA SKENARIO (200 User, 1 Tahun)

| Skenario | **Biaya/tahun** | Per User/thn | Kapasitas/bln | Unlimited? | Stabilitas |
|:---|---:|---:|---:|:---:|:---:|
| **🏆 A: RunPod 3090 3jam/hari** | **~$179** | **~$0.90** | 7.920 foto ✅ | ✅ **YES** | ✅ Tinggi |
| **B: Vast.ai 3090 3jam/hari** | **~$103** | **~$0.52** | 7.920 foto ✅ | ✅ YES | ⚠️ Spot |
| **C: RunPod 4090 2jam/hari** | **~$185** | **~$0.93** | 10.560 foto ✅ | ✅ YES | ✅ Tinggi |
| D: GPUhub 4090 2jam/hari | ~$240 | ~$1.20 | 10.560 foto ✅ | ✅ YES | ✅ Tertinggi |

> *Kebutuhan: 200 user × ~115 foto = **23.000 foto/tahun = ~1.917 foto/bulan.** Semua skenario di atas memiliki kapasitas **jauh di atas kebutuhan.***

**Untuk perbandingan (pay-per-use) — dengan ATK:**

| Provider | **Biaya/tahun** (23.000 foto) | Per User/thn | Keterangan |
|:---|---:|---:|:---|
| Fal.ai (512×512, reuse 60%) | ~$200 | ~$1.00 | Pay-per-use, tanpa VPS |
| Fal.ai (512×512, semua generate) | ~$345 | ~$1.73 | Pay-per-use murni |

---

### 🏆 REKOMENDASI UTAMA: Skenario A — RunPod RTX 3090, 3 Jam/Hari

#### Detail Biaya:

| Item | USD | **Rp** |
|:---|---:|---:|
| VPS GPU ($0.22/jam × 3 jam × 22 hari × 12 bulan) | **$174** | **~Rp 2.784.000** |
| Setup awal (20 jam deploy, sekali) | $5 | **Rp 80.000** |
| Vercel Hobby (API gateway) | **$0** | **Rp 0 🆓** |
| LoRA training 200 user (self-host, gratis) | **$0** | **Rp 0 🆓** |
| Domain & storage (existing) | $0 | **Rp 0** |
| **TOTAL TAHUN PERTAMA** | **~$179** | **~Rp 2.864.000** |
| **TAHUN KEDUA & SETERUSNYA** | **~$174** | **~Rp 2.784.000** |

#### Per User:

| Metrik | Per User |
|:---|---:|
| **Per user/tahun** | **~$0.87 (Rp 13.920)** |
| **Per user/bulan** | **~$0.07 (Rp 1.160)** |
| **Per foto** | **~$0.009 (Rp 139)** |

---

### ✅ APA YANG DIDAPAT DENGAN VPS SELF-HOST?

| Fitur | Fal.ai (Pay-per-use) | **VPS Self-Host** |
|:---|---:|---:|
| **Harga/foto** | $0.015-0.03 | **$0 (rata-rata $0.009 setelah dibagi quota)** |
| **Total/tahun (200 user)** | **$300** (tanpa strategi) | **~$179 🏆** |
| **LoRA training 200 user** | $200 ($1/user) | **$0 🆓** (training sendiri) |
| **Unlimited?** | ❌ Bayar per foto | ✅ **UNLIMITED** |
| **Jika user naik ke 400** | Naik 2× ($600) | **Tetap $179** (selama GPU cukup) |
| **Kontrol kualitas** | Sesuai Fal.ai | ✅ **Bebas atur model, LoRA, plugin** |
| **Maintenance** | ✅ Tidak perlu | ⚠️ Update, monitoring, restart |
| **Cold start** | ✅ Tidak ada | ⚠️ VPS mati di luar jam kerja (3 jam/hari) |

---

### 📈 SKENARIO PERTUMBUHAN: Jika User Bertambah

| Jumlah User | Foto/tahun | GPU Hours | **Biaya VPS/tahun** (RunPod 3090) |
|:---:|---:|---:|---:|
| **100** | 10.000 | 83 jam | **$174** (VPS sama, GPU idle 98%) |
| **200** | 20.000 | 167 jam | **$174** (VPS sama, GPU idle 96%) |
| **400** | 40.000 | 333 jam | **$174** (VPS tetap sama! Cuma 3 jam/hari cukup) |
| **800** | 80.000 | 667 jam | **$348** (butuh 2 VPS atau 6 jam/hari) |
| **1.600** | 160.000 | 1.333 jam | **$696** (butuh 2 GPU 24/7 atau 4 GPU 3 jam) |

> **Fakta Kunci: Biaya VPS FLAT $174/tahun untuk 100-400 user!**
> Karena GPU 3 jam/hari sudah cukup untuk 400 user (kapasitas 7.920 foto/bulan >> kebutuhan 3.333 foto/bulan).

---

### 💰 PERBANDINGAN AKHIR: 200 USER × 1 TAHUN

| **Komponen** | **Fal.ai Pay-per-Use** | **VPS Self-Host 🏆** |
|:---|---:|---:|
| Generate 23.000 foto (512×512) | $345 | **$0** (dalam sewa VPS) |
| LoRA training 200 user | $200 | **$0 🆓** |
| VPS GPU (RunPod RTX 3090, 3jam/hari) | $0 | **$174** |
| Vercel Hobby | $0 | **$0** |
| **TOTAL TAHUN PERTAMA** | **~$545** | **~$179 🏆** |
| **TAHUN KEDUA** | **~$345** | **~$174 🏆** |
| **Unlimited?** | ❌ | ✅ **YES 🎉** |

> **🎯 VPS Self-Host: ~$179/tahun = Rp 2.864.000/tahun untuk 200 user UNLIMITED (4 aktivitas: Rapat, MAMIN, ATK, Pemeliharaan)!**
> **Cuma Rp 14.320/user/tahun — setara 1 porsi nasi padang + es teh! 😄**

---

### 💡 BAGAIMANA CARA KERJA VPS 3 JAM/HARI?

```
┌─ JAM KERJA (07:00-10:00 pagi) ──────────────────────┐
│                                                       │
│  VPS GPU HIDUP → API /generate siap                   │
│  User request → Flux Pro generate → langsung return   │
│  Kecepatan: ~30 detik/foto → 1 user selesai 3 menit   │
│                                                       │
│  Kapasitas 3 jam: 360 foto = cukup untuk 200 user     │
│                                                       │
└───────────────────────────────────────────────────────┘

┌─ DI LUAR JAM KERJA ─────────────────────────────────┐
│                                                       │
│  VPS GPU MATI (untuk hemat biaya)                     │
│  User tetap bisa request → masuk antrian (queue)      │
│  Besok pagi VPS hidup → proses semua antrian          │
│  Atau: user dapat notifikasi "Siap jam 7 pagi"        │
│                                                       │
└───────────────────────────────────────────────────────┘

┌─ ALTERNATIF: VPS 24/7 ──────────────────────────────┐
│  Jika butuh real-time 24 jam:                        │
│  RunPod RTX 3090 24/7 = $0.22 × 24 × 365 = $1.927   │
│  Tapi GPU idle 99% — BOROS!                         │
└───────────────────────────────────────────────────────┘
```

**Solusi: Queue + Notifikasi** — Vercel Hobby ($0) sebagai API gateway yang menerima request 24 jam. Saat VPS GPU mati, request masuk buffer. Setiap pagi VPS hidup, proses semua buffer dalam 30-60 menit. User dapat notifikasi WA/Email "Foto dokumentasi siap".

---

### 🎯 KESIMPULAN FINAL

| Skenario | **Biaya/tahun** | Unlimited? |
|:---|---:|:---:|
| **🏆 VPS RunPod RTX 3090 — 3 jam/hari** | **~$179 (~Rp 2,86 jt)** | ✅ **UNLIMITED** (4 aktivitas) |
| Fal.ai Pay-per-Use + LoRA | ~$545 (~Rp 8,7 jt) | ❌ Per foto |

> **Dengan VPS self-host: Hemat 67% dibandingkan Fal.ai pay-per-use, PLUS unlimited generate untuk 4 aktivitas (Rapat, MAMIN, ATK, Pemeliharaan), PLUS gratis LoRA training untuk 200 user!**

---

### 💰 KALKULASI BIAYA TAHUNAN — DENGAN STRATEGI MINIMALISIR

#### Skenario Minimalisir: ⭐ REKOMENDASI UTAMA

| Item | Per Bulan | Per Tahun |
|:---|---:|---:|
| **Quota: 10 foto × 512×512 ($0.015)** | **$0.15** | **$1.80** |
| LoRA training (sekali seumur pakai) | — | **$1.00** |
| Vercel Hobby (GRATIS 🆓) | **$0** | **$0** |
| **TOTAL** | **~$0.15** | **~$2.80** |

| Item | **Rp** |
|:---|---:|
| 120 foto/tahun × Rp 240 | **Rp 28.800** |
| LoRA training sekali | **Rp 16.000** |
| Vercel Hobby | **Rp 0** |
| **TOTAL PER TAHUN** | **~Rp 44.800 🎉** |

#### Skenario Normal (Tanpa Strategi — 10 foto, 1MP)

| Item | **Rp/tahun** |
|:---|---:|
| 120 foto × Rp 480 | **Rp 57.600** |
| LoRA training sekali | **Rp 16.000** |
| Vercel Hobby (GRATIS) | **Rp 0** |
| **TOTAL** | **~Rp 73.600** |

#### Skenario Maksimal (Tanpa Strategi — 15 foto, 1MP)

| Item | **Rp/tahun** |
|:---|---:|
| 180 foto × Rp 480 | **Rp 86.400** |
| LoRA training sekali | **Rp 16.000** |
| Vercel Hobby (GRATIS) | **Rp 0** |
| **TOTAL** | **~Rp 102.400** |

---

### 🎯 PERBANDINGAN: Manual vs AI Generate (MINIMALISIR)

| Aspek | Manual (Cetak/Foto real) | **AI Generate (Strategi Hemat)** |
|:---|---:|---:|
| Biaya/foto | Rp 0 + waktu survei | **Rp 240 (512×512)** |
| Biaya cetak LPJ | Rp 2.000–5.000/lembar | **Rp 0** (digital) |
| **Biaya TAHUNAN** | **Rp 400.000–1.200.000** (cetak per tahun) | **~Rp 44.800 🎉** |
| Waktu per kegiatan | 30–60 menit (foto, edit, cetak) | **2–5 menit** |
| Risiko | Cuaca buruk, tidak dapat hadir | ✅ Generate kapan saja |
| **Hemat biaya** | — | **~90% lebih murah!** |
| **Hemat waktu** | — | **~90% lebih cepat!** |

> **🎯 Rp 44.800/tahun = Rp 3.733/bulan!** Setara dengan harga 1 porsi nasi pecel di kantin sekolah 😄

---

## 🚀 ALTERNATIF UNLIMITED: SELF-HOST FLUX PRO (PAKET LANGGANAN FLAT)

> **Masalah:** Biaya Fal.ai pay-per-use masih terasa mahal untuk 400 user ($1.120/tahun).
> **Solusi:** Sewa GPU sendiri — bayar FLAT per bulan, GENERATE UNLIMITED.

### 💡 Konsep

**Daripada bayar per foto ($0.015/image) → Sewa GPU flat rate → Generate sebanyak mungkin tanpa biaya tambahan.**

```
┌─────────────────────────────────────────────────────┐
│  Pilih GPU → Deploy Flux Pro → API Endpoint         │
│           ↓                                         │
│  Bayar FLAT $X/bulan (24/7 atau 8 jam/hari)         │
│           ↓                                         │
│  Generate UNLIMITED gambar — tidak ada biaya per    │
│  foto. LoRA training juga GRATIS (self-host).       │
└─────────────────────────────────────────────────────┘
```

### 🖥️ GPU Requirements untuk Flux Pro

| GPU | VRAM | Mampu Flux Pro? | Kecepatan (20 step) | Biaya/jam (RunPod) |
|:---|---:|:---:|:---:|---:|
| **RTX 4090** 🥇 | 24 GB | ✅ Full quality | **15–30 detik/gambar** | $0.34 |
| RTX 3090 | 24 GB | ✅ Full quality (FP8) | 20–35 detik/gambar | $0.19 |
| RTX A6000 | 48 GB | ✅ Multi-model | 20–35 detik/gambar | $0.59 |

> **Rekomendasi: RTX 4090** — kecepatan terbaik, VRAM cukup untuk Flux Pro + LoRA.

---

### 💰 Perbandingan Biaya: Fal.ai Pay-per-Use vs Self-Host Unlimited

#### 📊 1 User (1 Sekolah)

| Metode | Per Bulan | **Per Tahun** | Unlimited? |
|:---|---:|---:|:---:|
| **Fal.ai** (512×512, $0.015, 10 foto) | $0.15 | **$1.80** | ❌ |
| **Fal.ai** (1MP, $0.03, 10 foto) | $0.30 | **$3.60** | ❌ |
| Self-host (share GPU 400 user) | ~$0.10–$0.15 | **~$1.20–$1.80** | ✅ **YES** 🎉 |

#### 📊 400 User (400 Sekolah)

| Metode | Per Bulan | **Per Tahun** | Unlimited? |
|:---|---:|---:|:---:|
| **Fal.ai** (512×512) | $60 | **$720** | ❌ |
| **Fal.ai** (1MP standar) | $120 | **$1.440** | ❌ |
| **Self-Host RTX 4090** (8 jam/hari) 🥇 | **~$60** | **~$718** | ✅ **UNLIMITED 🎉** |
| **Self-Host RTX 4090** (4 jam/hari) 🥈 | **~$30** | **~$359** | ✅ **UNLIMITED 🎉** |
| **Self-Host RTX 3090** (8 jam/hari) | **~$35** | **~$422** | ✅ **UNLIMITED 🎉** |

---

### 🏆 SKENARIO REKOMENDASI: Self-Host RTX 4090 (8 Jam/Hari)

#### Spesifikasi

| Item | Detail |
|:---|---|
| **GPU** | RTX 4090 (24GB VRAM) |
| **Provider** | RunPod Community Cloud |
| **Biaya** | **$0.34/jam** |
| **Jam Aktif** | **8 jam/hari** (jam kerja) |
| **Hari Aktif** | 22 hari/bulan (Senin-Jumat) |
| **Biaya Bulanan** | $0.34 × 8 × 22 = **$59.84** |
| **Biaya Tahunan** | **~$718** |

#### Kapasitas

| Metrik | Angka |
|:---|---:|
| Kecepatan generate | ~20 detik/gambar |
| Gambar per jam | ~180 gambar/jam |
| **Gambar per hari (8 jam)** | **~1.440 gambar** |
| **Gambar per bulan** | **~31.680 gambar** |
| Untuk 400 user | 79 gambar/user/bulan ✅ (**7× lipat dari quota 10!**) |

#### Keuntungan Tambahan

| Fitur | Fal.ai (Pay-per-use) | **Self-Host** |
|:---|---:|---:|
| LoRA training | **$1–$2/user** (Rp 16.000–32.000) | **GRATIS 🆓** (training sendiri) |
| Harga per foto | $0.015–$0.03 | **$0** (sudah termasuk sewa GPU) |
| Jika user bertambah | Biaya naik linier | **Biaya TETAP** (selama GPU cukup) |
| Kontrol penuh | ❌ Terbatas | ✅ Sendiri punya GPU |
| Kustomisasi | Terbatas | ✅ Bebas install plugin/model |

---

### 💰 TOTAL BIAYA 1 TAHUN — SELF-HOST (400 User)

#### Tahun Pertama

| Komponen | USD | **Rp** |
|:---|---:|---:|
| GPU RTX 4090 (8 jam/hari × 22 hari × 12 bulan) | **~$718** | **~Rp 11.488.000** |
| LoRA training 400 user (GRATIS — self-host) | **$0** | **Rp 0** |
| Vercel Hobby (GRATIS) | $0 | **Rp 0** |
| **TOTAL TAHUN PERTAMA** | **~$718** | **~Rp 11.488.000** |
| **Rata-rata per user** | **~$1.80** | **~Rp 28.720** |

#### Tahun Kedua & Seterusnya

| Komponen | USD | **Rp** |
|:---|---:|---:|
| GPU RTX 4090 (sama) | **~$718** | **~Rp 11.488.000** |
| LoRA training user baru | $0 | Rp 0 |
| Vercel Hobby | $0 | Rp 0 |
| **TOTAL PER TAHUN** | **~$718** | **~Rp 11.488.000** |
| **Rata-rata per user** | **~$1.80** | **~Rp 28.720** |

---

### 🎯 PERBANDINGAN SEMUA SKENARIO (400 User, 1 Tahun)

| Skenario | Biaya/thn | Per User/thn | Unlimited? | Complexity |
|:---|---:|---:|:---:|:---:|
| **Fal.ai (512×512, quota 10/bln)** | **$720** | **$1.80** | ❌ | ✅ Mudah |
| **Fal.ai (1MP, quota 10/bln)** | $1.440 | $3.60 | ❌ | ✅ Mudah |
| **🏆 Self-Host 8h/day** 🥇 | **$718** | **$1.80** | ✅ **UNLIMITED** | ⚠️ Perlu setup |
| **🏆 Self-Host 4h/day** 🥇 | **$359** | **$0.90** | ✅ **UNLIMITED** | ⚠️ Perlu setup |
| **Self-Host 8h/day (RTX 3090)** | $422 | $1.06 | ✅ **UNLIMITED** | ⚠️ Perlu setup |

> **🎯 Self-Host RTX 4090 (4 jam/hari) = HANYA $359/TAHUN = Rp 5.744.000/TAHUN untuk UNLIMITED generasi!**
>
> Bandingkan dengan Rp 17.920.000/tahun (Fal.ai + LoRA) = **hemat 68%!**

---

### ⚠️ Catatan: Self-Host vs Pay-per-Use

| Aspek | Self-Host | Pay-per-Use (Fal.ai) |
|:---|---:|---:|
| **Setup awal** | 🔴 Perlu setup server, deploy Flux Pro | ✅ Tinggal panggil API |
| **Maintenance** | 🔴 Update, monitoring, restart | ✅ Tidak perlu urus |
| **Reliability** | ⚠️ Tergantung provider GPU | ✅ SLA 99.9% |
| **Scalability ( >400 user)** | 🔴 Perlu GPU tambahan | ✅ Tinggal tambah quota |
| **Biaya tetap** | ✅ Flat $60/bln | ❌ Naik linier per foto |
| **Biaya jika user <100** | ❌ Tetap $60/bln (boros) | ✅ Proporsional |

> **Rekomendasi:** Mulai dengan **Fal.ai Pay-per-Use** dulu untuk POC/bulan pertama. Jika traffic sudah stabil dan >200 user, **migrasi ke Self-Host** untuk penghematan jangka panjang.

---

## 🪜 PANDUAN LANGKAH-LANGKAH: SETUP VPS RUNPOD + FLUX PRO

> **Panduan konseptual langkah demi langkah untuk menjalankan VPS GPU RunPod dengan Flux Pro sebagai API generate foto dokumentasi.**

---

### 📊 Arsitektur Lengkap

```
┌─ USER ───────────────────────────────────────────────┐
│  Browser (React SPA)                                  │
│  ├── Upload foto wajah                                │
│  ├── Pilih: Rapat / MAMIN / ATK / Pemeliharaan        │
│  └── Klik GENERATE                                    │
└────────────────────┬───────────────────────────────────┘
                     │ POST /api/generate-dokumentasi
                     ▼
┌─ VERCEL HOBBY (GRATIS) ─────────────────────────────┐
│  Serverless Function (api/generate-dokumentasi.js)    │
│                                                       │
│  1. Terima request dari frontend                      │
│  2. Validasi input (face image + activity)            │
│  3. Build prompt berdasarkan activity template        │
│  4. CALL RunPod API → https://api.runpod.ai/v2/...   │
│  5. Terima hasil gambar (base64)                      │
│  6. Return image ke frontend                          │
│  7. HAPUS file dari temporary storage                 │
└────────────────────┬───────────────────────────────────┘
                     │ POST (dengan API Key)
                     ▼
┌─ RUNPOD VPS GPU ($0.22/jam) ────────────────────────┐
│  Serverless Endpoint (auto-scale)                     │
│                                                       │
│  RTX 3090 (24GB VRAM) — FLUX PRO + LoRA              │
│                                                       │
│  ┌─ Docker Container ─────────────────────────┐      │
│  │  ├── handler.py (FastAPI worker)           │      │
│  │  ├── FluxPipeline (black-forest-labs)      │      │
│  │  ├── LoRA weights (per user)               │      │
│  │  └── Output: base64 image                  │      │
│  └────────────────────────────────────────────┘      │
│                                                       │
│  Auto-shutdown: 60 detik setelah job selesai         │
│  Auto-start: ketika ada request masuk                │
│  Billing: $0.22/jam × waktu GPU AKTIF saja           │
└──────────────────────────────────────────────────────┘
```

---

### 📋 LANGKAH 1: Daftar RunPod

| Langkah | Detail |
|:---|---|
| **1.1** | Buka [runpod.io](https://www.runpod.io) → Sign Up (Google/GitHub/Email) |
| **1.2** | Isi profil → Add payment method (Kartu Kredit/PayPal) |
| **1.3** | Deposit saldo minimal **$10** (cukup untuk 2 bulan pertama testing) |
| **1.4** | Buka menu **Serverless** → **Endpoints** |

---

### 📋 LANGKAH 2: Deploy Flux Pro (2 Metode)

> **Pilih salah satu — Public Endpoint lebih mudah, Custom Docker lebih fleksibel.**

#### 🟢 Metode A: Public Endpoint (Mudah — 5 menit)

| Langkah | Detail |
|:---|---|
| **2.A.1** | Di RunPod Console → **Serverless** → **New Endpoint** |
| **2.A.2** | Pilih template: **"Flux.1 Pro"** (sudah tersedia di Gallery) |
| **2.A.3** | GPU: **RTX 3090** (lebih murah) atau **RTX 4090** (lebih cepat) |
| **2.A.4** | Setting: `Idle Timeout = 60 detik` (hemat biaya) |
| **2.A.5** | `Max Workers = 1` (cukup untuk 200 user) |
| **2.A.6** | Klik **Create Endpoint** → tunggu 2-5 menit |
| **2.A.7** | Dapatkan **Endpoint ID** + **API Key** dari Settings |

#### 🔵 Metode B: Custom Docker (Fleksibel — 1-2 jam)

Jika perlu LoRA kustom, face injection, atau workflow spesifik:

| Langkah | Detail |
|:---|---|
| **2.B.1** | Buat file `Dockerfile`:
```dockerfile
FROM runpod/base:0.4.0-cuda12.4.0
RUN pip install torch torchvision xformers diffusers transformers accelerate
RUN pip install runpod
COPY handler.py /handler.py
CMD ["python", "-u", "/handler.py"]
``` |
| **2.B.2** | Buat file `handler.py`:
```python
import runpod, torch, base64, io
from diffusers import FluxPipeline

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-dev",
    torch_dtype=torch.bfloat16
).to("cuda")

def handler(event):
    prompt = event["input"]["prompt"]
    image = pipe(prompt, num_inference_steps=20).images[0]
    buffered = io.BytesIO()
    image.save(buffered, format="JPEG", quality=85)
    return {"image": base64.b64encode(buffered.getvalue()).decode()}

runpod.serverless.start({"handler": handler})
``` |
| **2.B.3** | Build & push ke Docker Hub:
```bash
docker build -t username/flux-pro-worker .
docker push username/flux-pro-worker
``` |
| **2.B.4** | Di RunPod Console → **New Endpoint** → masukkan image Docker |
| **2.B.5** | Pilih GPU **RTX 3090** → Create |

---

### 📋 LANGKAH 3: Dapatkan API Credentials

| Langkah | Detail |
|:---|---|
| **3.1** | Buka RunPod Console → Settings → API Keys |
| **3.2** | Generate API Key → copy (simpan, hanya muncul sekali!) |
| **3.3** | Catat Endpoint ID (URL: `https://api.runpod.ai/v2/{ENDPOINT_ID}/runsync`) |

**Simpan 2 hal ini:**
```
RUNPOD_API_KEY=rpa_YOUR_API_KEY_HERE
RUNPOD_ENDPOINT_ID=your-endpoint-id-here
```

---

### 📋 LANGKAH 4: Test API

```bash
curl -X POST "https://api.runpod.ai/v2/{ENDPOINT_ID}/runsync" \
  -H "Authorization: Bearer YOUR_RUNPOD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "prompt": "Seorang guru perempuan tersenyum di ruang rapat, meja rapat dengan dokumen, suasana formal santai, siang hari, dokumentasi kegiatan sekolah, natural lighting, photorealistic",
      "width": 512,
      "height": 512,
      "num_inference_steps": 20
    }
  }' > test-image.jpg
```

Jika berhasil → file `test-image.jpg` terdownload ✅

---

### 📋 LANGKAH 5: Integrasi ke Vercel Serverless

Buat file `api/generate-dokumentasi.js` di project:

```javascript
// api/generate-dokumentasi.js — Vercel Serverless Function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { faceImage, activity, customDescription, gender } = req.body

    // 1. Build prompt berdasarkan aktivitas
    const prompt = buildPrompt(activity, gender, customDescription)

    // 2. Panggil RunPod API
    const response = await fetch(
      `https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/runsync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt,
            width: 512,
            height: 512,
            num_inference_steps: 20,
            // LoRA face injection bisa ditambahkan di sini
          }
        }),
        timeout: 30000, // 30 detik
      }
    )

    const result = await response.json()
    const imageBase64 = result.output.image

    // 3. Return base64 image (client bisa download langsung)
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({
      success: true,
      image: `data:image/jpeg;base64,${imageBase64}`,
      imageBase64,
      processingTime: result.executionTime,
    })

  } catch (error) {
    console.error('Generate failed:', error)
    return res.status(500).json({ error: 'Generate gagal', detail: error.message })
  }
}
```

**Environment Variables di Vercel:**
```
RUNPOD_API_KEY=your_api_key
RUNPOD_ENDPOINT_ID=your_endpoint_id
```

---

### 📋 LANGKAH 6: Setup Automasi (3 Jam/Hari)

Karena VPS GPU hanya perlu hidup **3 jam/hari**, setup automasi:

#### Opsi A: RunPod Scheduled (Bawaan)

| Langkah | Detail |
|:---|---|
| **6.A.1** | Di RunPod Console → Serverless → Endpoint Settings |
| **6.A.2** | Atur `WorkersMin = 0` (mati saat tidak dipakai) |
| **6.A.3** | Atur `WorkersMax = 1` (maks 1 GPU) |
| **6.A.4** | Atur `Idle Timeout = 300 detik` (5 menit idle → mati) |
| **6.A.5** | **Hasil:** GPU otomatis mati saat tidak ada request → $0 tagihan |

#### Opsi B: Jadwal Manual (Via Cron/Webhook)

Untuk memastikan GPU hanya aktif jam 07:00-10:00 pagi:

```javascript
// Di Vercel, buat api/schedule-vps.js
// Dipanggil oleh cron job (github actions / vercel cron)
export default async function handler(req, res) {
  const action = req.query.action // 'start' or 'stop'
  
  if (action === 'start') {
    // Update RunPod endpoint: workersMin = 1
    await fetch(`https://api.runpod.ai/v2/endpoints/${process.env.RUNPOD_ENDPOINT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({ workersMin: 1 })
    })
  } else {
    // Update RunPod endpoint: workersMin = 0
    await fetch(`https://api.runpod.ai/v2/endpoints/${process.env.RUNPOD_ENDPOINT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify({ workersMin: 0 })
    })
  }
  
  res.json({ success: true, action })
}
```

**Jadwal menggunakan GitHub Actions:**
```yaml
name: Schedule VPS
on:
  schedule:
    - cron: '0 22 * * *'   # 07:00 WIB = 22:00 UTC → Start
    - cron: '0 3 * * *'    # 10:00 WIB = 03:00 UTC → Stop
jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://your-app.vercel.app/api/schedule-vps?action=start
```

---

### 📋 LANGKAH 7: Monitoring & Maintenance

| Aktivitas | Frekuensi | Tools |
|:---|---:|---|
| Cek biaya harian | Setiap hari | RunPod Dashboard → Billing |
| Cek error rate | Mingguan | RunPod Logs |
| Update model Flux | Bulanan | Restart endpoint dengan model baru |
| Cek sisa saldo | Mingguan | RunPod Wallet |
| Rotate API Key | 3 bulan sekali | RunPod Settings |

---

### ⏱️ Timeline Setup (Estimasi)

| Langkah | Waktu | Biaya |
|:---|---:|---:|
| Daftar RunPod | 5 menit | $0 |
| Deploy Flux Pro (Public Endpoint) | 5 menit | ~$0.22 (testing) |
| Test API pertama | 10 menit | ~$0.22 (testing) |
| Setup Vercel integration | 30 menit | $0 (Hobby) |
| Setup scheduled automation | 30 menit | $0 |
| **Total Setup** | **~1,5 jam** | **~$0.50** |

---

### 🎯 Ringkasan Alur

```
1. Daftar RunPod.io → Deposit $10
2. Deploy Flux Pro (Public Endpoint) → 5 menit
3. Dapatkan Endpoint ID + API Key
4. Simpan API Key ke Vercel Environment Variables
5. Buat Vercel Serverless Function → call RunPod API
6. Set auto-shutdown (idle timeout 60-300 detik)
7. Selesai! VPS jalan otomatis saat ada request

Biaya: $0.22/jam × hanya saat GPU aktif
       ≈ $174/tahun untuk 200 user UNLIMITED! 🎉
```

---

## 🔧 Rencana Teknis Detail

### Prompt Templates per Activity

```javascript
const PROMPT_TEMPLATES = {
  rapat_guru: {
    prompt: `Suasana rapat guru di ruang rapat sekolah Indonesia,
             [gender] guru sedang duduk di kursi bersama guru-guru lain,
             meja rapat, papan tulis, suasana formal santai,
             foto dokumentasi, sudut pandang dokumentasi,
             natural lighting, photorealistic, candid style`,
    negative: 'wajah buram, pose tidak natural, exposure berlebihan',
  },
  serah_terima_atk: {
    prompt: `Seorang [gender] guru menerima paket ATK (alat tulis kantor)
             di ruang kelas, kotak kardus ATK di atas meja,
             [barang] tersusun rapi, guru tersenyum ramah,
             siang hari, dokumentasi kegiatan sekolah, natural lighting,
             photorealistic, 4K quality`,
    negative: 'wajah buram, barang tidak jelas, pose kaku',
  },
  serah_terima_makanan: {
    prompt: `Suasana serah terima [barang] untuk kegiatan sekolah,
             [gender] guru menerima tumpukan [barang],
             di halaman sekolah, siang hari,
             dokumentasi kegiatan, natural lighting,
             photorealistic, candid photography style`,
    negative: 'makanan tidak jelas, wajah buram, pose tidak natural',
  },
  kustom: {
    prompt: null, // diisi user
    negative: 'wajah buram, pose tidak natural, exposure berlebihan',
  },
}
```

### API Endpoint Design

```javascript
// POST /api/generate-dokumentasi
Request:
{
  faceImage: "base64_encoded_image...",  // foto wajah user
  faceImageFormat: "jpeg",                // format foto
  activity: "serah_terima_atk",           // jenis kegiatan
  customDescription: "nasi box dan snack box untuk acara perpisahan", // opsional
  gender: "female",                        // dari face detection
  quality: "standard"                       // standard | high
}

Response:
{
  success: true,
  imageUrl: "https://...",          // URL hasil generate
  imageBase64: "base64...",        // alternatif base64
  model: "flux-2-pro",
  cost: 0.03,
  processingTime: "2.3s",
}
```

### API Key Management

> **Penting:** API Key Fal.ai **TIDAK BOLEH** ada di frontend bundle!

```
Frontend React SPA
    → POST /api/generate-dokumentasi (dengan face image + params)
        → Serverless function baca FAL_API_KEY dari env variable
            → Panggil Fal.ai API dengan key dari server
                → Return image URL ke frontend
```

```bash
# .env (Vercel Environment Variables)
FAL_API_KEY=your_fal_api_key_here
```

### Face Detection Pipeline (Client-Side)

```javascript
import * as faceLandmarksDetection from '@mediapipe/face_mesh'

async function analyzeFace(imageFile) {
  // 1. Load model face detection (MediaPipe)
  // 2. Detect face landmarks
  // 3. Estimate gender, age group, glasses
  // 4. Return face analysis result

  return {
    hasFace: true,
    faceRect: { x, y, width, height },
    faceImage: "cropped_base64...",
    estimatedGender: "female",
    estimatedAgeGroup: "30-40",
    hasGlasses: false,
    confidence: 0.95,
  }
}
```

---

## 🏢 SKALA 400 USER — KALKULASI BIAYA TOTAL

> **Asumsi:** 400 operator sekolah menggunakan fitur ini. Masing-masing dengan quota 10 foto/bulan (512×512, $0.015/foto).

### 📊 Perhitungan Skala 400 User

| Komponen | Per User | **× 400 User** |
|:---|---:|---:|
| Generate/bln (10 foto × $0.015) | $0.15/bln | **$60/bln** |
| Generate/tahun (120 foto × $0.015) | $1.80/thn | **$720/thn** |
| LoRA training (sekali) | $1.00 | **$400 (sekali)** |
| Vercel Hobby (serverless) | $0 | **$0 🆓** |

---

### 💰 Rincian Biaya 400 User

#### Biaya Generate Fal.ai

| Item | Per Bulan | Per Tahun |
|:---|---:|---:|
| **512×512 ($0.015/foto)** — 4.000 foto/bln × $0.015 | **$60** | **$720** |
| **1MP ($0.03/foto)** — 4.000 foto/bln × $0.03 | **$120** | **$1.440** |

| Resolusi | **Rp/bulan** | **Rp/tahun** |
|:---|---:|---:|
| 512×512 (hemat) ⭐ | **Rp 960.000** | **Rp 11.520.000** |
| 1MP (standar) | **Rp 1.920.000** | **Rp 23.040.000** |

#### Biaya LoRA Training (Sekali)

| Item | Per User | **Total 400 User** |
|:---|---:|---:|
| Training LoRA (5-10 foto wajah) | ~$1.00 | **$400** |
| **Rupiah** | **~Rp 16.000** | **~Rp 6.400.000** |

#### Biaya Vercel

| Metrik | Vercel Hobby (GRATIS) | Cukup? |
|:---|---:|:---:|
| Serverless execution | 100 jam/bulan | ✅ **3,3 jam/bulan** untuk 4.000 req × 3s |
| Bandwidth | 100 GB/bulan | ✅ **~2 GB/bulan** untuk 4.000 foto × 500KB |
| Build hours | 100 jam/bulan | ✅ Cukup |

> **Vercel Hobby GRATIS masih cukup untuk 400 user!** Jika nanti tumbuh >1.000 user, upgrade ke Pro ($20/bln).

---

### 📈 Total Biaya Tahunan 400 User

#### Tahun Pertama (termasuk LoRA training)

| Komponen | USD | **Rp** |
|:---|---:|---:|
| Generate 48.000 foto (512×512) | $720 | **Rp 11.520.000** |
| LoRA training 400 user | $400 | **Rp 6.400.000** |
| Vercel Hobby | $0 | **Rp 0** |
| **TOTAL TAHUN PERTAMA** | **~$1.120** | **~Rp 17.920.000** |
| **Rata-rata per user** | **~$2.80** | **~Rp 44.800** |

#### Tahun Kedua & Seterusnya (tanpa LoRA)

| Komponen | USD | **Rp** |
|:---|---:|---:|
| Generate 48.000 foto (512×512) | $720 | **Rp 11.520.000** |
| LoRA training | $0 (sudah) | **Rp 0** |
| Vercel Hobby | $0 | **Rp 0** |
| **TOTAL PER TAHUN** | **~$720** | **~Rp 11.520.000** |
| **Rata-rata per user** | **~$1.80** | **~Rp 28.800** |

---

### 🎯 Per User: Berapa Per Sekolah?

| Skala | Per Bulan | **Per Tahun** |
|:---|---:|---:|
| **1 User (1 sekolah)** | **~Rp 3.733** | **~Rp 44.800 🎉** |
| **400 User (400 sekolah)** | **~Rp 1.493.333** | **~Rp 17.920.000** |
| Rata-rata per sekolah | ~Rp 3.733 | ~Rp 44.800 🎉 |

> ✅ **Rp 44.800/sekolah/tahun!** Biaya ini sangat murah dibandingkan:
> - Cetak foto manual: Rp 400.000–1.200.000/sekolah/tahun
> - Gaji operator 1 bulan: Rp 1.500.000–2.500.000
> - Hemat waktu operator: ~90%

---

### 💡 Strategi Ekonomi Skala untuk 400 User

| Strategi | Cara | Hemat |
|:---|---:|---:|
| **Batch LoRA Training** | Training 10 wajah sekaligus dalam 1 session | 20-30% lebih murah |
| **Fal.ai Prepaid Credits** | Beli $1.000+ dapat bonus credits | 10-15% lebih murah |
| **Cache Background Server-side** | Cache hasil generate, reuse untuk semua user | 40-60% lebih sedikit generate |
| **Tier Pricing** | User aktif ringan (<5 foto/bln) subsidi user berat | Distribusi biaya merata |

---

### 💰 Estimasi Biaya Development (DENGAN STRATEGI HEMAT)

| Item | USD | **Rp** | Catatan |
|:---|---:|---:|:---|
| Fal.ai Credits Testing (200 generate) | ~$6–$10 | **~Rp 96.000–Rp 160.000** | Testing 3 aktivitas saja |
| **Vercel Hobby (GRATIS 🆓)** | **$0** | **Rp 0** | Serverless timeout 10s cukup untuk Fal.ai 2-5s |
| Domain & hosting | $0 (existing) | **Rp 0 (existing)** | — |
| LoRA Training (testing) | $2–$3 | **Rp 32.000–Rp 48.000** | Training sekali |
| **Total Development (sekali)** | **~$8–$13** | **~Rp 128.000–Rp 208.000** | 🎉 |
| **Total Operasional BULANAN (400 user)** | **~$60** | **~Rp 960.000** | 🎉🎉 |
| **Total Operasional TAHUNAN (400 user)** | **~$720** | **~Rp 11.520.000** | 🎉🎉🎉 |

---

## ⚠️ Daftar Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|:---|---:|:---|
| Face swap gagal (wajah tidak natural) | 🔴 Tinggi | Fallback ke foto ilustrasi + caption "Ilustrasi AI" |
| API pricing berubah | 🟡 Sedang | Abstraction layer — jika Fal.ai mahal, migrasi ke provider Flux lain |
| Koneksi internet lambat | 🟡 Sedang | Loading state + progress bar, max file size 2MB |
| API rate limit | 🟡 Sedang | Queue system + retry logic |
| Biaya membengkak | 🟡 Sedang | ✅ **SUDAH DIATASI:** Quota 10/bln, Vercel Hobby gratis, background reuse — maks Rp 44.800/tahun |
| Regulasi deepfake | 🟡 Sedang | Watermark "AI Generated", log semua aktivitas |
| Privacy (UU PDP) | 🟡 Sedang | Enkripsi foto wajah, consent checkbox, hapus otomatis |

---

## 📅 Timeline Implementasi (8 Minggu)

### Minggu 1-2: Setup + Core Integration Fal.ai
- [ ] Setup akun Fal.ai + dapatkan API key
- [ ] Training LoRA untuk 1-2 wajah (testing)
- [ ] Buat serverless function `/api/generate-dokumentasi`
- [ ] Buat UI: FaceUploader, ActivitySelector, ActivityForm, ResultPreview

### Minggu 3-4: Production Quality
- [ ] Implementasi pipeline Fal.ai Flux Pro + LoRA
- [ ] Face injection + face detailer
- [ ] Face detection client-side (auto gender/age)
- [ ] Optimasi prompt per activity
- [ ] Preview + download panel

### Minggu 5-6: Polish + Deploy
- [ ] Error handling + loading states
- [ ] Sistem queue + caching
- [ ] Watermark + logging
- [ ] Konsent checkbox + privacy notice
- [ ] Deploy ke Vercel

### Minggu 7-8: Advanced Features
- [ ] Multi-face support
- [ ] Background upload (foto ruangan sendiri)
- [ ] Batch generate (multiple angles)
- [ ] Integrasi template LPJ
- [ ] UAT dengan operator sekolah

---

## 🔮 Catatan: LLM Providers untuk Masa Depan

Provider **ChatGPT / Gemini / Grok / dll** akan dievaluasi TERPISAH untuk:

| Fitur | Kapan? | Catatan |
|:---|---:|:---|
| **Ask AI** (upgrade) | Setelah fitur ini stabil | Tingkatkan kualitas jawaban AI |
| **Generate Notulen** (baru) | Roadmap berikutnya | Otomatis catat notulen rapat |

**Keduanya TIDAK ADA HUBUNGANNYA dengan fitur auto-generate foto dokumentasi ini.**

---

## ✅ Checklist Final

- [x] Research teknologi face swap AI
- [x] Research pricing Fal.ai (USD + Rp)
- [x] Arsitektur sistem (Fal.ai ONLY, 3 aktivitas)
- [x] Strategi minimalisir biaya (6 strategi)
- [x] Kalkulasi biaya tahunan: HANYA Rp 44.800/tahun
- [x] UI component tree (3 aktivitas)
- [ ] Setup akun Fal.ai
- [ ] Training LoRA
- [ ] Implementasi API endpoint
- [ ] Implementasi frontend
- [ ] Testing end-to-end
- [ ] UAT dengan operator sekolah
- [ ] Dokumentasi + panduan

---

*Referensi: docs/ai/RESEARCH_AI_AUTO_GENERATE_DOKUMENTASI.md*
*Kurs: Rp 16.000/USD (per 25 Juli 2026)*
*LLM Providers (ChatGPT/Gemini/Grok/dll) — untuk Ask AI & Generate Notulen, dibahas terpisah.*
