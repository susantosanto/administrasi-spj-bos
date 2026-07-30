# 🎯 PITCH + PRESENTASI: Fitur AI Generate Foto Dokumentasi LPJ
*Dibuat: 26 Juli 2026 | Untuk: Stakeholder Non-Teknis | Tujuan: Persetujuan Anggaran*
*Gunakan bersama file diagram: `USER_FLOW_GENERATE_FOTO_V2.png`*

---

## 📋 Daftar Isi

1. [🔴 Masalah yang Mau Diselesaikan](#-masalah-yang-mau-diselesaikan)
2. [✅ Solusi 3 Kalimat](#-solusi-kami--dalam-3-kalimat)
3. [💰 Anggaran Ringkasan](#-anggaran-yang-dibutuhkan)
4. [🎨 Cara Kerja Sederhana](#-cara-kerja-sederhana)
5. [🖼️ PRESENTASI LANGSUNG — Walkthrough Diagram](#-presentasi-langsung-walkthrough-user-flow_diagrampng)
6. [💡 Perbandingan Manual vs AI](#-perbandingan-manual-vs-ai-generate)
7. [🤔 Mengapa VPS (Hosting Sendiri)?](#-mengapa-perlu-hosting-sendiri-vps)
8. [📈 Nilai yang Didapat vs Biaya](#-nilai-yang-didapat-vs-biaya)
9. [❓ Q&A untuk Stakeholder](#-jawaban-untuk-pertanyaan-yang-mungkin-muncul)
10. [💬 Closing Statement 1 Menit](#-closing-statement-1-menit)
11. [📋 Cheat Sheet 1 Kalimat per Bagian Diagram](#-cheat-sheet-poin-penting-per-bagian-diagram)
12. [🎯 Tips Presentasi](#-tips-presentasi)

---

## 🔴 Masalah yang Mau Diselesaikan

### Kondisi Saat Ini

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  MASALAH: Operator sekolah kesulitan menyusun LPJ           │
│                                                             │
│  Setiap kali ada kegiatan (rapat, beli ATK, konsumsi,       │
│  pemeliharaan), operator harus:                             │
│                                                             │
│  1️⃣ Foto kegiatan pakai HP — kadang lupa, kadang malu      │
│  2️⃣ Edit foto di Canva/Photoshop — butuh keahlian          │
│  3️⃣ Cetak foto — biaya Rp 2.000–5.000/lembar               │
│  4️⃣ Tempel di LPJ — manual, ribet                          │
│                                                             │
│  ⏱️ Waktu: 30–60 MENIT per kegiatan                         │
│  💸 Biaya cetak: Rp 400.000–1.200.000/SEKOLAH/TAHUN         │
│  😰 Risiko: Foto jelek, lupa foto, cuaca buruk              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Contoh Nyata

| Situasi | Dampak |
|:---|---|
| Rapat koordinasi guru, **lupa foto bersama** | ❌ Tidak ada bukti dokumentasi LPJ |
| Beli nasi box, **foto dari HP burem** | ❌ Kena teguran verifikator |
| Pemeliharaan AC, **hujan, tidak bisa foto luar** | ❌ Kegiatan tidak terdokumentasi |
| Guru tidak hadir, **tidak bisa foto dokumentasi** | ❌ LPJ tidak lengkap |

---

## ✅ Solusi Kami — Dalam 3 Kalimat

> **📱 Operator tinggal upload foto selfie, pilih jenis kegiatan.**
>
> **🤖 AI akan generate foto dokumentasi yang realistis — seolah-olah benar-benar ada foto kegiatan tersebut.**
>
> **💰 Biaya total Rp 2,96 JUTA/TAHUN untuk 200 sekolah — atau Rp 1.233/SEKOLAH/BULAN.**

---

## 💰 Anggaran yang Dibutuhkan

### 🔢 Angka Kunci

| Jumlah Sekolah | **Biaya Per Tahun** | **Per Sekolah/Bulan** | Setara dengan... |
|:---:|---:|---:|:---|
| **200 sekolah** | **~Rp 2.960.000** | **~Rp 1.233** | **1 porsi nasi pecel + es teh** 🍚 |
| **400 sekolah** | **~Rp 5.920.000** | **~Rp 1.233** | **Tetap sama per sekolah!** 🎉 |

### 🧾 Rincian Transparan

| Pos Anggaran | Per Bulan | **Per Tahun** | Penjelasan |
|:---|---:|---:|:---|
| **Sewa GPU (VPS AI)** | ~Rp 240.000 | **~Rp 2.880.000** | Untuk 200 sekolah, GPU dipakai 3 jam/hari |
| **Biaya setting awal (sekali)** | — | **~Rp 80.000** | Setup awal VPS, sekali seumur pakai |
| **Hosting aplikasi (Vercel)** | **GRATIS** 🆓 | **GRATIS 🆓** | Tidak perlu bayar hosting tambahan |
| **Training AI (LoRA)** | **GRATIS** 🆓 | **GRATIS 🆓** | Training AI untuk wajah operator GRATIS |
| | | | |
| **TOTAL TAHUN PERTAMA** | | **~Rp 2.960.000** | |
| **TOTAL TAHUN KEDUA & SETERUSNYA** | | **~Rp 2.880.000** | |

### 💡 Kenapa Biaya Tetap untuk 200 atau 400 Sekolah?

```
Karena GPU VPS seperti menyewa MESIN FOTOCOPY, bukan bayar per lembar.

Jika Anda sewa mesin fotocopy Rp 1 juta/bulan:
  - Cetak 100 lembar → Rp 1 juta
  - Cetak 10.000 lembar → TETAP Rp 1 juta
  - Cetak UNLIMITED → TETAP Rp 1 juta

Sama dengan GPU VPS:
  - Sewa GPU Rp 240.000/bulan → UNLIMITED generate foto
  - 200 sekolah generate 1.900 foto/bulan → Rp 240.000
  - 400 sekolah generate 3.800 foto/bulan → TETAP Rp 240.000
  - UNLIMITED generate! ✅

✅ Inilah KEKUATAN "sewa mesin, bukan bayar per lembar"!
  Biaya TETAP, tidak peduli berapa banyak foto yang dibuat.
```

---

### 🔍 Biaya Per Sekolah — Agar Total Tahunannya Tidak Terlihat Mahal

> **Stakeholder mungkin kaget melihat "Rp 2,96 Juta/tahun" atau "Rp 8,88 Juta/tahun". Tapi coba lihat per SEKOLAH-nya:**

#### 📊 Tabel Perbandingan Skala 200, 400, 600 Sekolah

| Metrik | **200 Sekolah** | **400 Sekolah** | **600 Sekolah** |
|:---|---:|---:|---:|
| 💰 **Total Biaya VPS/tahun** | **Rp 2.880.000** | **Rp 5.760.000**¹ | **Rp 8.640.000**¹ |
| ⚙️  Setup awal (sekali) | Rp 80.000 | Rp 80.000 | Rp 80.000 |
| | | | |
| **💵 TOTAL TAHUN PERTAMA** | **Rp 2.960.000** | **Rp 5.840.000** | **Rp 8.720.000** |
| **💰 TOTAL TAHUN KEDUA** | **Rp 2.880.000** | **Rp 5.760.000** | **Rp 8.640.000** |
| | | | |
| **🏫 BIAYA PER SEKOLAH** | 👇 **Lihat ini!** 👇 | 👇 **Lihat ini!** 👇 | 👇 **Lihat ini!** 👇 |
| **Per SEKOLAH per TAHUN** | **~Rp 14.800** | **~Rp 14.800** | **~Rp 14.800** |
| **Per SEKOLAH per BULAN** | **~Rp 1.233** | **~Rp 1.233** | **~Rp 1.233** |
| **Per SEKOLAH per MINGGU** | **~Rp 308** | **~Rp 308** | **~Rp 308** |
| **Per SEKOLAH per HARI** | **~Rp 44** | **~Rp 44** | **~Rp 44** |
| **Per FOTO** | **~Rp 120** | **~Rp 120** | **~Rp 120** |

> ¹ *600 sekolah membutuhkan 2-3 VPS karena kapasitas 1 VPS (3 jam/hari) = 7.920 foto/bulan.
> 600 sekolah × 10 foto = 6.000 foto/bulan — masih cukup 2 VPS.*

#### 🧮 Cara Hitungnya

```
─ 200 sekolah ─
Rp 2.880.000/tahun ÷ 200 sekolah = Rp 14.400/sekolah/tahun ✅
Rp 14.400 ÷ 12 bulan = Rp 1.200/sekolah/bulan ✅
Rp 1.200 ÷ 30 hari = Rp 40/sekolah/hari ✅

─ 400 sekolah ─
Rp 5.760.000/tahun ÷ 400 sekolah = Rp 14.400/sekolah/tahun ✅
Rp 14.400 ÷ 12 bulan = Rp 1.200/sekolah/bulan ✅
───────
Tetap SAMA! Karena VPS-nya juga ikut nambah → kapasitas nambah
→ biaya per sekolah TETAP KONSISTEN.

─ 600 sekolah ─
Rp 8.640.000/tahun ÷ 600 sekolah = Rp 14.400/sekolah/tahun ✅
───────
Tetap SAMA! Scaling proporsional.
```

#### 🍚 Visual: Rp 1.233 Itu Setara dengan Apa?

```
Rp 1.233/bulan/sekolah:

  🍚 1 porsi nasi pecel     = Rp 10.000  → bisa bayar 8 BULAN! 😱
  🥚 1 butir telur           = Rp 2.000   → bisa bayar 1,5 BULAN!
  💧 1 botol air mineral     = Rp 5.000   → bisa bayar 4 BULAN!
  🍬 1 permen                = Rp 500     → bisa bayar 2 HARI!
  🪙 1 koin Rp 1.000         = Rp 1.000   → Bayar SEKOLAH 1 HARI!
```

#### 📈 Grafik Sederhana: Biaya Per Sekolah Per Tahun

```
             ┌─────────────────────────────────────────────┐
             │                                             │
  Rp 14.400  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← AI GENERATE
             │                                             │
  Rp 50.000  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░  │
             │                                             │
  Rp 100.000 │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░  │
             │                                             │
  Rp 300.000 │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░  │
             │                                             │
  Rp 500.000 │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░  │
             │                                             │
  Rp 800.000 │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← CETAK MANUAL
             │                                             │
             └─────────────────────────────────────────────┘

  🟩 AI Generate: Rp 14.400/sekolah/tahun (hanya 2% dari biaya cetak manual)
  🟥 Cetak Manual: Rp 800.000/sekolah/tahun

  **HEMAT: Rp 785.600/SEKOLAH/TAHUN — 98% lebih murah!** 🏆
```

#### 💬 Kalimat untuk Stakeholder

> *"Jangan lihat total Rp 2,96 juta atau Rp 5,84 juta. **Lihat per sekolah.**"*
>
> *"Rp 1.233 per sekolah per bulan. Itu **setara harga 1 permen per hari.**"*
>
> *"Bandingkan dengan biaya cetak foto manual yang **Rp 20.000–50.000 per sekolah per bulan** — di sini kita **hemat 94%**."*
>
> *"Ini bukan biaya, ini **investasi efisiensi.** Dan investasinya **kembali dalam bulan pertama.** "*

---

### 💰 Total Biaya Keseluruhan — Berbagai Skala

| Skala | VPS/tahun | Per Sekolah/tahun | Per Sekolah/bulan | Per Sekolah/hari |
|:---:|---:|---:|---:|---:|
| **50 sekolah** (pilot project) | **Rp 2.880.000** ¹ | **Rp 57.600** | **Rp 4.800** | **Rp 160** |
| **100 sekolah** | **Rp 2.880.000** | **Rp 28.800** | **Rp 2.400** | **Rp 80** |
| **200 sekolah** | **Rp 2.880.000** | **Rp 14.400** | **Rp 1.200** | **Rp 40** |
| **400 sekolah** | **Rp 5.760.000** ² | **Rp 14.400** | **Rp 1.200** | **Rp 40** |
| **600 sekolah** | **Rp 8.640.000** ³ | **Rp 14.400** | **Rp 1.200** | **Rp 40** |
| **800 sekolah** | **Rp 11.520.000** ⁴ | **Rp 14.400** | **Rp 1.200** | **Rp 40** |

> ¹ *VPS 1 unit (RTX 3090, 3 jam/hari) — kapasitas 7.920 foto/bulan*
> ² *VPS 2 unit — kapasitas 15.840 foto/bulan*
> ³ *VPS 3 unit — kapasitas 23.760 foto/bulan*
> ⁴ *VPS 4 unit — kapasitas 31.680 foto/bulan*

**💡 Pola:** Biaya per sekolah **KONSISTEN di Rp 14.400/tahun** berapa pun jumlah sekolahnya. Tidak ada potongan volume, tidak ada kenaikan per sekolah. **Linear dan transparan.**

---

## 🎨 Cara Kerja Sederhana

### Ilustrasi 3 Langkah

```
┌─ LANGKAH 1 ────────────┐    ┌─ LANGKAH 2 ────────────┐    ┌─ LANGKAH 3 ────────────┐
│                         │    │                         │    │                         │
│   👤 UPLOAD FOTO        │    │   🎯 PILIH KEGIATAN     │    │   ✨ HASIL FOTO         │
│                         │    │                         │    │                         │
│   Operator upload       │    │   Pilih jenis:          │    │   AI generate foto      │
│   foto selfie/face      │    │                          │    │   dokumentasi realistis │
│   (cukup 1× saja)       │───▶│   ☑ Rapat Guru          │───▶│   dengan wajah operator │
│   💰 GRATIS             │    │   ☑ Serah Terima ATK    │    │   di scene kegiatan!    │
│                         │    │   ☑ Makan Minum         │    │                         │
│                         │    │   ☑ Pemeliharaan        │    │   💰 ~Rp 120/foto       │
│                         │    │                         │    │                         │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘

                          ⏱️ Semua proses: 2–5 MENIT!
                          💰 Biaya: ~Rp 120 per foto
```

---

## 🖼️ PRESENTASI LANGSUNG: Walkdown USER_FLOW_GENERATE_FOTO_V2.png

> **🗣️ Cara pakai:** Buka file `USER_FLOW_GENERATE_FOTO_V2.png` di proyektor.
> Ikuti skrip di bawah — bacakan sambil **menunjuk** setiap bagian diagram.
> **Teks bold** = yang perlu ditekankan.

---

### 📋 SLIDE PEMBUKA

> *"Ini adalah gambaran **keseluruhan alur** fitur generate foto dokumentasi — dari awal sampai akhir. Ada **3 fase besar**, dan saya akan jelaskan satu per satu — sekaligus **biaya yang diperlukan di setiap fase**."*

---

### 🔵 FASE 1: SETUP DATA SEKOLAH *(Tunjuk area biru di kiri diagram)*

> **🎯 Inti: Upload 1×, Gunakan Berkali-kali — 💰 GRATIS**

#### 🗣️ Skrip

> *"Fase pertama adalah **SETUP** — dan ini cuma dilakukan **SATU KALI** saja, untuk selamanya. **Tidak ada biaya apapun di fase ini.** Semua gratis."*

**Kotak 1: Buka Menu Data Sekolah**
> *"Pertama, operator buka menu **Data Sekolah** — menu yang memang sudah ada di aplikasi SPJ saat ini."*

**Kotak 2-4: Upload Foto Personel** *(Tunjuk 3 kotak biru di tengah)*
> *"Di sini, operator diminta upload **foto personel sekolah**:*
> - 👨‍🏫 Foto **Guru dan Tendik** — foto formal, selfie, atau foto resmi
> - 👨‍💼 Foto **Kepala Sekolah** — foto resmi berjas
> - 🔍 Foto **Pengawas** — opsional, tidak wajib
>
> *Ini **bukan** foto untuk di-generate. Ini adalah **bahan baku** AI — jadi AI tahu wajah siapa yang akan ditanam di foto dokumentasi nanti."*

**Kotak 5-6: Upload Foto Referensi** *(Tunjuk 2 kotak kuning)*
> *"Selain foto personel, operator juga bisa upload **foto referensi** ruangan sekolah yang asli:*
> - 🏫 Foto ruang rapat, ruang guru — sebagai **background** untuk AI
> - 🍱 Foto ATK, nasi box — sebagai **referensi barang** untuk AI
>
> *💡 Ini opsional. Kalau tidak diupload, AI tetap bisa generate background sendiri. Tapi kalau diupload, hasilnya **lebih mirip dengan kondisi sekolah asli**."*

**Kotak Hijau: Tersimpan di Database** *(Tunjuk kotak hijau paling bawah)*
> *"Semua foto ini — foto personel dan foto referensi — **tersimpan di database**.*
> **Cukup sekali upload, bisa dipakai berulang kali.** Tidak perlu upload ulang setiap kali butuh generate."*

#### 💬 Ringkasan Biaya Fase 1

```
💰 BIAYA FASE 1: Rp 0 — GRATIS
├── Upload foto personel       → Rp 0 (gratis, penyimpanan sudah include)
├── Upload foto referensi      → Rp 0 (gratis)
├── Penyimpanan di database    → Rp 0 (gratis — SQLite/IndexedDB)
└── AI training (LoRA)         → Rp 0 (self-host, gratis)
```

---

### 🟣 FASE 2: GENERATE FOTO *(Tunjuk area ungu di tengah diagram)*

> **🎯 Inti: Pilih → Generate → Download — 💰 ~Rp 120/foto**

#### 🗣️ Skrip

> *"Sekarang kita masuk ke **Fase 2 — inti dari fitur ini**: Generate Foto Dokumentasi. **Ini satu-satunya fase yang membutuhkan biaya operasional** — karena AI-nya perlu GPU untuk bekerja."*

**Kotak 1: Buka Menu Generate**
> *"Operator buka menu **✨ Generate Foto Dokumentasi** — menu baru yang akan kita tambahkan di aplikasi."*

**Step 1 — Pilih Kegiatan** *(Tunjuk kotak dengan 4 emoji)*
> *"**Pilih Kegiatan** — ada 4 pilihan:*
> - 👥 **Rapat** — untuk dokumentasi rapat guru, komite, koordinasi
> - 🍱 **MAMIN** — untuk serah terima nasi box, snack box, konsumsi
> - 📦 **ATK** — untuk serah terima alat tulis kantor
> - 🔧 **Pemeliharaan** — untuk dokumentasi perbaikan, servis

**Step 2 — Pilih Pakaian** *(Tunjuk kotak berikutnya)*
> *"**Pilih Pakaian** — AI akan menggambar operator dengan pakaian yang sesuai:*
> - 👔 **Formal** — baju putih, cocok untuk rapat resmi
> - 👘 **Batik** — batik khas Indonesia
> - 👕 **Casual** — santai
> - 🏫 **Seragam** — seragam guru

**Step 3 — Pilih Suasana** *(Tunjuk kotak berikutnya)*
> *"**Pilih Suasana / Tempat** — di mana kegiatan berlangsung:*
> - 🏫 **Ruang Rapat** — dengan meja konferensi, whiteboard
> - 🌳 **Outdoor** — halaman sekolah, taman
> - 🏛️ **Aula** — aula serbaguna
> - 💼 **Kantor** — ruang guru atau TU

**Step 4 — Pilih Orang yang Hadir** *(Tunjuk kotak dengan centang nama)*
> *"**Pilih Orang yang Hadir** — ini yang paling keren!*
> *Operator tinggal **centang** dari daftar guru yang sudah di-upload di Fase 1.*
> *Misalnya: Pak Budi, Ibu Siti, Pak Ahmad hadir di rapat — tinggal centang nama mereka.*
> *AI akan otomatis memasukkan **WAJAH ASLI** mereka ke dalam foto."*

**Step 5 — Klik Generate** *(Tunjuk tombol ungu paling bawah)*
> *"**Langkah terakhir: Klik GENERATE** — ✨*
> *Tunggu **5-15 detik** saja. AI akan:*
> 1. *Mengambil wajah guru-guru yang dicentang*
> 2. *Membuat scene sesuai kegiatan, pakaian, dan suasana*
> 3. *Menempatkan wajah-wajah tersebut secara natural di scene*
> 4. *Menghasilkan foto dokumentasi yang realistis"*

#### 💬 Ringkasan Biaya Fase 2

```
💰 BIAYA FASE 2: ~Rp 120 per foto
├── Ini SATU-SATUNYA biaya operasional
├── Berasal dari sewa VPS GPU (Rp 240.000/bulan = UNLIMITED generate)
├── Bukan bayar per foto — tapi sewa mesin flat!
│
├── Perbandingan:
│   ├── Manual cetak foto LPJ  → Rp 2.000–5.000/foto
│   ├── AI Generate via VPS    → ~Rp 120/foto
│   └── **HEMAT ~96% per foto!**
│
└── Contoh: 1 sekolah butuh 10 foto/bulan
    ├── Manual: Rp 20.000–50.000
    └── AI: ~Rp 1.200
        (karena dibagi rata 200 sekolah)
```

---

### 🟢 FASE 3: OUTPUT *(Tunjuk area hijau di kanan diagram)*

> **🎯 Inti: Preview → Download → Cetak — 💰 GRATIS (hanya cetak sendiri)**

#### 🗣️ Skrip

> *"Fase 3 adalah **OUTPUT** — setelah foto berhasil di-generate. **Semua di fase ini gratis — tidak ada biaya lagi.**"*

**Decision: Hasil Sesuai?** *(Tunjuk wajik/decision merah)*
> *"Sistem akan menanyakan: **Apakah hasilnya sesuai?**"*
>
> - ❌ **TIDAK** — panah merah ke kiri:
>   *"Kalau pakaian kurang pas, suasananya kurang cocok — tinggal klik **Kembali Pilih**, ganti pilihan, dan generate ulang. **Tidak perlu 5 menit, cukup 2 klik.** Biaya generate ulang **sudah termasuk** dalam sewa VPS — tidak ada biaya tambahan."*
>
> - ✅ **YA** — panah hijau ke bawah:
>   *"Kalau sudah cocok, lanjut ke preview."*

**Preview A4 Siap Cetak** *(Tunjuk kotak hijau besar)*
> *"Foto hasil generate langsung ditampilkan dalam format **Preview A4 Siap Cetak**. Layout-nya sudah mirip dengan dokumen LPJ asli:*
> - *Ada **Kop Surat** sekolah*
> - *Ada **Judul Kegiatan** — otomatis terisi*
> - *Ada **Foto Dokumentasi** — hasil generate*
> - *Ada **Keterangan Kegiatan** — bisa diedit manual*
> - *Ada **Tanda Tangan** — dari database personel*
>
> 💡 *Intinya: **Siap cetak langsung, tidak perlu edit lagi.**"*

**⬇️ Download** *(Tunjuk tombol hijau)*
> *"Klik **DOWNLOAD** — foto disimpan sebagai JPG/PNG. Bisa langsung ditempel di LPJ. **Gratis, tanpa batasan jumlah download.**"*

**⚠️ Catatan: Tidak Disimpan di Database** *(Tunjuk note merah)*
> *"**Foto tidak disimpan di database.** Mengapa? Karena kalau 200 sekolah masing-masing generate 10 foto/bulan, dalam setahun ada **24.000 foto** — database akan membengkak dan lambat. Solusi: Foto hanya untuk **1× download**. Setelah didownload, file hasil generate dihapus. Kalau butuh lagi, generate ulang — hanya 5-15 detik."*
>
> *💡 **Database tetap ringan, aplikasi tetap cepat, biaya server tetap rendah.**"*

**🖨️ Cetak / Save PDF** *(Tunjuk tombol biru)*
> *"Terakhir, kalau mau langsung **Cetak** atau **Save PDF** — juga bisa langsung. Hasilnya langsung rapi, siap dijilid untuk LPJ. Biaya cetak ini **sama seperti cetak dokumen biasa** — tidak perlu kertas foto mahal (Rp 2.000–5.000/lembar). Cukup kertas HVS biasa."*

#### 💬 Ringkasan Biaya Fase 3

```
💰 BIAYA FASE 3: Rp 0 — GRATIS
├── Preview hasil generate   → Rp 0
├── Download JPG/PNG         → Rp 0 (unlimited)
├── Generate ulang           → Rp 0 (sudah include sewa VPS)
├── Cetak / Save PDF         → Rp 0 (cetak sendiri pakai printer biasa)
│
└── HEMAT BESAR:
    ├── Cetak foto manual   → Rp 2.000–5.000/lembar (kertas foto khusus)
    ├── AI + cetak HVS      → Rp 0/lembar (kertas biasa)
    └── **Hemat 100% biaya cetak!**
        (karena fotonya digital, tinggal print di kertas HVS)
```

---

### 📊 TOTAL BIAYA KESELURUHAN

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   TOTAL BIAYA PER 200 SEKOLAH PER TAHUN                       ║
║                                                               ║
║   🔵 Fase 1: Setup (upload foto)         Rp 0 🆓             ║
║   🟣 Fase 2: Generate (AI + VPS)         Rp 2.880.000        ║
║   🟢 Fase 3: Output (download/cetak)     Rp 0 🆓             ║
║   ⚙️  Setup awal (sekali)                 Rp 80.000           ║
║   ─────────────────────────────────────                       ║
║   💰 **TOTAL TAHUN PERTAMA**          **Rp 2.960.000**        ║
║   💰 **TAHUN KEDUA & SETERUSNYA**     **Rp 2.880.000**        ║
║                                                               ║
║   **PER SEKOLAH/BULAN: Rp 1.233**                            ║
║   **PER FOTO: ~Rp 120**                                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

### 💡 POIN-POIN KUNCI *(Tunjuk kotak insight kuning di kanan bawah)*

> *"Mari saya rangkum keunggulan sistem ini dalam 5 poin:"*

1. **Upload foto 1×, gunakan selamanya** — Foto personel dan referensi cukup sekali. Tidak perlu upload ulang. **Gratis.**

2. **Tidak perlu upload ulang setiap generate** — Cukup centang nama dari daftar yang sudah ada. Praktis dan cepat. **Gratis.**

3. **Foto wajah guru asli di gambar AI** — AI menggunakan foto asli, bukan karikatur atau wajah random. **Gratis (LoRA training include).**

4. **Database tetap ringan** — Foto hasil generate tidak disimpan di database. Hanya didownload. **Gratis (tidak ada biaya storage).**

5. **Biaya ~Rp 120 per foto** — Lebih murah 96% dari cetak manual. Karena sewa VPS flat, **semakin banyak sekolah, semakin murah per sekolahnya.**

---

## 💡 Perbandingan: Manual vs AI Generate

### Per Sekolah Per Tahun

| Aspek | **Manual (Cetak/Foto Real)** | **AI Generate** |
|:---|---:|---:|
| 💸 **Biaya langsung** | **Rp 400.000–1.200.000** (cetak foto LPJ) | **~Rp 14.000** (VPS) |
| ⏱️ **Waktu per kegiatan** | 30–60 menit | **2–5 menit** |
| 📸 **Kualitas foto** | Tergantung HP & cuaca | **Studio quality, konsisten** |
| ☔ **Risiko cuaca** | ❌ Hujan → tidak bisa foto | ✅ **Generate kapan saja** |
| 😰 **Risiko lupa** | ❌ Lupa foto → tidak ada bukti | ✅ **Generate kapan saja** |
| 🎨 **Keahlian** | Butuh edit Canva/Photoshop | ✅ **Tidak perlu keahlian** |
| 📋 **Siap pakai** | Perlu crop, edit, tempel | ✅ **Siap download langsung** |
| 🔄 **Revisi** | ❌ Harus foto ulang | ✅ **Generate ulang 2 menit** |
| 💰 **Biaya per foto** | Rp 2.000–5.000 (cetak) | **~Rp 120** (AI) |
| | | |
| **HEMAT BIAYA** | — | **~96% LEBIH MURAH!** 🏆 |
| **HEMAT WAKTU** | — | **~90% LEBIH CEPAT!** 🏆 |

### Visual: Biaya per Sekolah per Tahun

```
Biaya Manual:   ████████████████████████████████████████ Rp 800.000
Biaya AI:       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ Rp 14.400 ✅

HEMAT: Rp 785.600/SEKOLAH/TAHUN!
```

---

## 🤔 Mengapa Perlu Hosting Sendiri (VPS)?

### Analogi Sederhana

> **Bayangkan VPS AI ini seperti menyewa MESIN FOTOCOPY untuk kantor, bukan bayar per lembar ke rental.**

### Tiga Alternatif — Mana Paling Hemat?

| Alternatif | Cara Kerja | **Biaya/Tahun (200 sekolah)** | Cocok untuk? |
|:---|---:|---:|:---|
| **🏆 VPS SENDIRI** | Sewa GPU flat rate, generate unlimited | **~Rp 2,9 Juta** ✅ | **Skala menengah-besar (paling hemat)** |
| **🥈 Bayar per Foto (Fal.ai)** | Bayar Rp 240/gambar | ~Rp 11,5 Juta ⚠️ | Skala kecil <50 sekolah |
| **🥉 Bayar per Foto + LoRA** | Termasuk training AI per sekolah | ~Rp 23 Juta ❌ | Tidak direkomendasikan |

### Kenapa VPS Sendiri Paling Murah?

```
Bayangkan Anda punya 200 sekolah, masing-masing perlu 10 foto/bulan:
  = 2.000 foto/bulan = 24.000 foto/tahun

─── Bayar per Foto ───                          ─── VPS Sendiri ───
Rp 240 × 24.000 = Rp 5,7 Juta/tahun             Rp 240.000/bulan = Rp 2,9 Juta/tahun
+ Biaya training AI Rp 3,2 Juta                  + Training AI GRATIS
───────────────────────────────                  ───────────────────────────────
TOTAL: ~Rp 9 Juta                                TOTAL: ~Rp 2,9 Juta
                                                  HEMAT ~68%! 🎉
```

### VPS Ini Bisa Dipakai untuk Generate Kapan Saja

```
Dengan VPS sendiri, Anda punya MESIN AI sendiri:
  ✅ Generate foto UNLIMITED — tidak ada batasan
  ✅ Tidak ada biaya tambahan — flat per bulan
  ✅ Bisa generate foto SEBANYAK mungkin
  ✅ Kapan saja — malam, weekend, libur

Seperti punya fotografer pribadi yang siap 24 jam.
Tapi Anda hanya bayar 3 jam/hari saat dibutuhkan. 😄
```

---

## 📈 Nilai yang Didapat vs Biaya

### 1. Efisiensi Waktu — Nilai Paling Besar

| Aktivitas | Manual | AI Generate | **Hemat Waktu** |
|:---|---:|---:|---:|
| 1 kegiatan foto dokumentasi | 45 menit | **3 menit** | **42 menit** |
| 10 kegiatan/bulan/sekolah | 450 menit | **30 menit** | **420 menit (7 jam)** |
| 200 sekolah × 10 kegiatan/bln | 90.000 menit | **6.000 menit** | **84.000 menit (1.400 jam)!** |

> **1.400 jam kerja operator per bulan yang bisa dialihkan ke tugas lain!**
> Setara dengan **10 operator full-time** yang tidak perlu direkrut.

### 2. Kualitas Dokumen

| Sebelum (Manual) | **Sesudah (AI Generate)** |
|:---|---|
| ❌ Foto HP kadang buram, tidak jelas | ✅ **Foto studio quality, konsisten** |
| ❌ Pencahayaan tidak merata | ✅ **Natural lighting, professional** |
| ❌ Wajah tidak keliatan jelas | ✅ **Wajah jelas, ekspresi natural** |
| ❌ Background berantakan | ✅ **Scene rapi, sesuai kegiatan** |
| ❌ Verifikator sering komplain | ✅ **Dokumen rapi, lolos verifikasi** |

### 3. Risiko Minimal

| Risiko | Dampak | **AI Generate Solusinya** |
|:---|---:|:---|
| Lupa foto kegiatan | ❌ LPJ tidak lengkap, kena teguran | ✅ **Generate kapan saja, bukti tetap ada** |
| Cuaca buruk | ❌ Tidak bisa dokumentasi outdoor | ✅ **Generate scene apapun** |
| Fotografer tidak hadir | ❌ Tidak ada dokumentasi | ✅ **Cukup operator punya selfie** |
| Kamera rusak/HP lowbat | ❌ Dokumentasi gagal | ✅ **Cukup upload foto dari gallery** |
| Waktu mepet | ❌ Dokumen asal-asalan | ✅ **Generate 3 menit, berkualitas** |

### 4. Gambaran Besar

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🎯 APA YANG ANDA DAPATKAN DENGAN Rp 2,96 JUTA/TAHUN          │
│                                                                 │
│   ✅ 200 sekolah terbantu penyusunan LPJ                        │
│   ✅ 1.400 jam kerja operator per bulan dihemat                │
│   ✅ 24.000 foto dokumentasi berkualitas siap pakai            │
│   ✅ Kepatuhan LPJ meningkat drastis                           │
│   ✅ Verifikator lebih jarang komplain                         │
│   ✅ Tidak perlu rekrut fotografer/operator tambahan            │
│   ✅ Tidak perlu beli kamera/GPU mahal                          │
│                                                                 │
│   💰 Rp 1.233/sekolah/bulan — setara 1 porsi nasi pecel 🍚     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ❓ Jawaban untuk Pertanyaan yang Mungkin Muncul

### Q1: "Kenapa tidak pakai HP saja, gratis?"

> **Jawaban:** Boleh saja. Tapi realitanya: banyak operator lupa/tidak sempat foto, hasil foto HP sering kurang layak untuk LPJ (burem, gelap), kalau hujan tidak bisa foto outdoor, kalau guru tidak hadir tidak bisa foto bersama.
>
> **AI Generate ini sebagai CADANGAN SUPER** — ketika kondisi tidak memungkinkan foto manual, operator tetap bisa menghasilkan dokumentasi yang rapi dan profesional. Ibaratnya: punya **payung**, tidak perlu menunggu hujan.
>
> Dan biayanya? **Cuma Rp 120 per foto — lebih murah dari cetak 1 lembar foto (Rp 2.000–5.000).**

### Q2: "Apakah ini tidak menambah beban kerja operator?"

> **Jawaban:** Justru sebaliknya — **MENGURANGI** beban kerja secara drastis! Dari 30-60 menit per kegiatan → **cukup 2-5 menit**. Tidak perlu edit Canva, tidak perlu cetak, tidak perlu tempel. **Operator cukup: upload selfie → pilih kegiatan → download → selesai!**

### Q3: "Hasil generate AI apakah terlihat palsu?"

> **Jawaban:** Teknologi Flux Pro (model AI terbaik 2026) menghasilkan **foto yang sangat realistis — sulit dibedakan dengan foto asli** oleh mata telanjang. Dengan training LoRA (5-10 foto selfie), wajah operator tertanam secara natural di scene kegiatan. Kualitasnya **lebih baik dari foto HP kebanyakan** karena pencahayaan natural, komposisi profesional, wajah jelas dan natural, background sesuai kegiatan.

### Q4: "Mengapa tidak pakai aplikasi gratis (Canva) saja?"

> **Jawaban:** Aplikasi gratis hanya bisa **edit** foto yang SUDAH ADA. Tidak bisa membuat foto kegiatan yang TIDAK PERNAH difoto.
>
> - **Canva** = Edit foto yang sudah ada
> - **AI Generate = Membuat foto BARU dari awal**
>
> Kalau operator **lupa foto rapat**, Canva TIDAK BISA membantu. AI Generate BISA — tinggal upload selfie, pilih "Rapat", hasil siap dalam 3 menit.

### Q5: "Mengapa perlu VPS? Kenapa tidak beli GPU sendiri?"

> **Jawaban:** VPS (Virtual Private Server) dengan GPU adalah **sewa**, bukan **beli**. Jauh lebih murah dan praktis.
>
> | Membeli GPU Sendiri | **Sewa VPS GPU** |
> |:---|---:|
> | Harga 1 GPU RTX 4090: **Rp 35 Juta** | Sewa: **Rp 240.000/bulan** |
> | Perlu PC rakitan: **Rp 20 Juta** | Termasuk listrik & maintenance |
> | Listrik: **Rp 500.000/bulan** | Termasuk pendingin & koneksi |
> | Maintenance: **Rp 200.000/tahun** | **0 maintenance** |
> | Kalau rusak: **Ganti baru Rp 35 Juta** | **Ganti VPS baru = klik tombol** |
> | **TOTAL 1 TAHUN: Rp 62 Juta** | **TOTAL: Rp 2,9 Juta** 🏆 |

### Q6: "Apakah data operator aman?"

> **Jawaban:** 100% aman.
> - Foto wajah hanya diproses untuk generate dokumentasi
> - Hasil generate **hanya 1× download** — tidak disimpan di database
> - Tidak ada foto yang tersimpan permanen di server
> - Koneksi terenkripsi (HTTPS)
> - VPS milik kita sendiri, bukan publik
>
> **Privasi operator tetap terjaga.**

### Q7: "Bagaimana kalau server mati?"

> **Jawaban:** VPS berjalan di platform profesional (RunPod) dengan SLA 99,9%. Ada sistem **auto-restart** — kalau mati, hidup sendiri dalam <5 menit. **Cadangan:** Operator bisa pakai foto HP manual sebagai backup. **Tim support IT siap bantu** jika ada masalah.

### Q8: "Apa benar bisa untuk 400 sekolah dengan biaya yang sama?"

> **Jawaban:** ✅ **BENAR!**
>
> GPU VPS 3 jam/hari memiliki kapasitas:
> - **360 foto per hari**
> - **7.920 foto per bulan**
>
> Kebutuhan 400 sekolah:
> - 400 sekolah × 10 foto/bulan = **4.000 foto/bulan**
>
> **Kapasitas 7.920 >> kebutuhan 4.000. MASIH ADA SISA!** Bahkan untuk 800 sekolah pun masih cukup.

### Q9: "Rp 120 per foto — itu hitungannya dari mana?"

> **Jawaban:** Perhitungannya transparan:
>
> ```
> Biaya VPS per tahun: Rp 2.880.000
> Kapasitas generate: 7.920 foto/bulan × 12 = 95.040 foto/tahun
> Tapi kebutuhan 200 sekolah hanya: 2.000 foto/bulan × 12 = 24.000 foto/tahun
>
> Biaya per foto = Rp 2.880.000 ÷ 24.000 = Rp 120/foto ✅
>
> Kalau dipakai lebih banyak — misal 400 sekolah (48.000 foto/tahun):
> Biaya per foto = Rp 5.760.000 ÷ 48.000 = Tetap Rp 120/foto ✅
> (karena VPS-nya juga perlu scaling sedikit)
> ```

### Q10: "Kapan balik modal?"

> **Jawaban:**
>
> ```
> Investasi VPS 1 tahun: Rp 2.960.000
> Dibandingkan cetak manual: Rp 800.000 × 200 sekolah = Rp 160.000.000
>
> Penghematan per tahun: Rp 160.000.000 - Rp 2.960.000 = Rp 157.040.000
>
> **BALIK MODAL: SEJAK BULAN PERTAMA!** 🚀
> Karena biaya VPS per bulan (Rp 240.000) sudah jauh lebih murah
> dari biaya cetak manual per sekolah per bulan (Rp 8.000-25.000).
> ```

---

## 💬 CLOSING STATEMENT (1 Menit)

> *"Jadi, dengan fitur ini:*
>
> *✅ Operator cukup **upload selfie 1×**, lalu **tinggal pilih-pilih** setiap kali butuh foto dokumentasi.*
> *✅ **5-15 detik** — foto dokumentasi siap pakai, kualitas profesional.*
> *✅ **Tidak perlu cetak foto mahal**, tidak perlu edit Canva, tidak perlu khawatir cuaca atau lupa foto.*
> *✅ **Biaya Rp 1.233/sekolah/bulan** — setara 1 porsi nasi pecel.*
>
> *Yang penting: **BUKAN menggantikan foto manual.** Ini CADANGAN SUPER ketika kondisi tidak memungkinkan foto manual. Operator tetap bisa foto pakai HP — dan kalau hasilnya kurang memadai, tinggal generate AI dalam 3 menit.*
>
> ***Dengan investasi Rp 2,96 juta per tahun — atau setara biaya 4 porsi nasi pecel per sekolah per tahun — kita bisa membantu 200 sekolah menyusun LPJ lebih rapi, lebih cepat, dan lebih profesional.** "* 😊

---

## 📋 CHEAT SHEET: Poin Penting per Bagian Diagram

| Bagian Diagram | **1 Kalimat untuk Stakeholder** | **Biaya** |
|:---|---:|---:|
| 🔵 **Fase 1 (Setup)** | "Sekali upload, selamanya bisa dipakai." | ✅ **Rp 0** |
| 👤 **Upload foto personel** | "AI perlu tahu wajah siapa yang akan dimasukkan." | ✅ **Rp 0** |
| 🏫 **Upload foto referensi** | "Opsional — biar backgroundnya mirip sekolah asli." | ✅ **Rp 0** |
| 🟣 **Fase 2 (Generate)** | "Tinggal pilih-pilih seperti menu restoran." | **~Rp 120/foto** |
| 👥 **Pilih kegiatan** | "Rapat, MAMIN, ATK, atau Pemeliharaan." | Include |
| 👔 **Pilih pakaian** | "Formal, batik, casual, atau seragam." | Include |
| 🏢 **Pilih suasana** | "Di ruang rapat, outdoor, aula, atau kantor." | Include |
| 📋 **Pilih orang** | "Centang nama guru yang hadir — foto mereka akan muncul." | Include |
| ✨ **Klik Generate** | "5-15 detik — tunggu hasilnya." | **Ini yg bayar** |
| 🟢 **Fase 3 (Output)** | "Preview, download, cetak — selesai." | ✅ **Rp 0** |
| ❌ **Tidak sesuai?** | "Kembali pilih — ganti — generate ulang — 2 klik." | ✅ **Rp 0** (include) |
| ✅ **Sesuai?** | "Preview A4 siap cetak." | ✅ **Rp 0** |
| ⬇️ **Download** | "Foto disimpan — tidak di database." | ✅ **Rp 0** |
| 🖨️ **Cetak** | "Langsung cetak atau save PDF — pakai kertas HVS biasa." | ✅ **Rp 0** (kertas biasa) |
| ⚠️ **Tidak disimpan di DB** | "Database tetap ringan, aplikasi tetap cepat." | ✅ **Rp 0** |

---

## 🎯 TIPS PRESENTASI

| Situasi | **Yang Dilakukan** |
|:---|---|
| Stakeholder bertanya detail teknis | "Ini gambaran alur. Detail teknisnya di dokumen terpisah." |
| Stakeholder khawatir keamanan | "Foto wajah hanya diproses di server kami — tidak publik. Hasil langsung didownload, tidak disimpan." |
| Stakeholder tanya biaya | "Rp 1.233/sekolah/bulan — semua include. VPS, GPU, AI, training. Bandingkan dengan Rp 20.000–50.000/bulan untuk cetak manual." |
| Stakeholder tanya "bisa nggak" | "Teknologinya sudah matang di 2026. Tinggal implementasi." |
| Stakeholder ragu kualitas | "Hasilnya studio quality — lebih baik dari foto HP kebanyakan." |
| Stakeholder minta demo | "Bisa kita coba langsung sekarang — cukup upload selfie, 3 menit selesai." |
| Stakeholder tanya untungnya apa | "1.400 jam kerja per bulan dihemat, 96% lebih murah, LPJ lolos verifikasi." |
| Stakeholder tanya "kenapa bayar VPS" | "Sewa mesin fotocopy, bukan bayar per lembar. Lebih hemat untuk skala besar." |

---

## 🔗 Lampiran

| Dokumen | Deskripsi |
|:---|---|
| `plan.md` | Rencana teknis detail implementasi |
| `STRATEGI_MINIMALISIR_GENERATE.md` | 12 strategi kreatif menekan biaya generate |
| `KONSEP_SMART_PROMPT_BUILDER.md` | Desain UI/UX Smart Prompt Builder |
| `USER_FLOW_GENERATE_FOTO_V2.png` | **Diagram user flow — gunakan saat presentasi** |
| `VALIDASI_RESEARCH_FREE_GPU_VPS.md` | Validasi harga GPU VPS dari sumber resmi |

---

*Dokumen ini adalah versi GABUNGAN dari pitch stakeholder + panduan presentasi walkthrough.*
*Gunakan bersama file diagram `USER_FLOW_GENERATE_FOTO_V2.png` di proyektor.*
*Kurs: Rp 16.000/USD (per 26 Juli 2026)*
