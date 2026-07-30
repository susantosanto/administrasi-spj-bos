# 📄 PRD — Fitur "Ask to AI" (Asisten AI Cerdas)

> **Status**: Draft v1  
> **Tanggal**: 17 Juli 2026  
> **Penulis**: Product  
> **Target Aplikasi**: LPJ BOS/BOSP — Aplikasi Administrasi Sekolah  
> **Target Users**: 600 Sekolah (Operator Sekolah)

---

## 📋 DAFTAR ISI

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Problem Statement](#2-latar-belakang--problem-statement)
3. [Tujuan & Metrik](#3-tujuan--metrik)
4. [Target Pengguna](#4-target-pengguna)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Desain & UI/UX](#8-desain--uiux)
9. [Data Flow & Arsitektur](#9-data-flow--arsitektur)
10. [Context-Aware Logic per Halaman](#10-context-aware-logic-per-halaman)
11. [Provider AI & Biaya](#11-provider-ai--biaya)
12. [Implementasi](#12-implementasi)
13. [Risiko & Mitigasi](#13-risiko--mitigasi)
14. [Open Questions](#14-open-questions)
15. [Lampiran](#15-lampiran)

---

## 1. RINGKASAN EKSEKUTIF

### 1.1 Product Context

**Fitur**: `Ask to AI` — Asisten AI serbaguna berbasis chat yang bisa diakses dari semua halaman.

**Konsep**: Satu tombol Floating Action Button (FAB) ⚡ di pojok kanan bawah yang membuka panel chat. User bisa bertanya apa pun tentang data dan proses di aplikasi, dan AI akan menjawab dengan konteks yang sesuai.

### 1.2 Perbedaan dengan Fitur AI Lain

| Fitur AI Spesifik (saran sebelumnya) | ✅ Ask to AI |
|---------------------------------------|-------------|
| Dibuat untuk 1 tugas spesifik | 🔥 **Satu fitur untuk SEMUA pertanyaan** |
| Harus tebak kebutuhan user | 🔥 **User yang decide mau tanya apa** |
| Implementasi: banyak komponen | 🔥 **Implementasi: 1 komponen + data functions** |
| Maintenance tinggi (10 fitur = 10x) | 🔥 **Maintenance rendah (1 fitur)** |
| Token usage fixed per fitur | 🔥 **Token usage sesuai kebutuhan user** |

### 1.3 Key Metrics

| Metrik | Target |
|--------|--------|
| % user yang menggunakan Ask AI | ≥ 60% user dalam 1 bulan pertama |
| Rata-rata pertanyaan/user/hari | ≥ 3 pertanyaan |
| Waktu jawab AI | ≤ 3 detik |
| Kepuasan jawaban | ≥ 85% akurat |
| Token/hari/600 sekolah | ≤ 1.000.000 token |

---

## 2. LATAR BELAKANG & PROBLEM STATEMENT

### 2.1 Masalah yang Dipecahkan

Berdasarkan riset mendalam terhadap aplikasi dan pain point operator sekolah, ditemukan:

| # | Masalah | Dampak | Solusi Ask AI |
|---|---------|--------|---------------|
| 1 | Operator tidak paham data di BKU | Sering salah input dokumen | Tanya AI: "Jelaskan transaksi ini" |
| 2 | Bingung cara isi form LPJ | Dokumen ditolak/dikembalikan | Tanya AI: "Cara isi kolom PPh 21?" |
| 3 | Sulit cari data spesifik | Waktu habis scroll manual | Tanya AI: "Cari guru bernama Ahmad" |
| 4 | Lupa proses/langkah | Harus buka panduan manual | Tanya AI: "Cara upload data guru?" |
| 5 | Tidak tahu data apa yang kurang | Dokumen tidak lengkap | Tanya AI: "Apa yang kurang untuk Januari?" |

### 2.2 Mengapa "Ask to AI" Bukan Fitur AI Lainnya

```
┌────────────────────────────────────────────────────────────────────┐
│  MENGAPA BUKAN DIBUAT 10 FITUR AI TERPISAH?                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Karena user tidak selalu tahu fitur AI apa yang tersedia.         │
│  Dengan Ask AI, user cukup:                                        │
│                                                                     │
│  1. Klik tombol ⚡                                                  │
│  2. Ketik pertanyaan dalam bahasa sehari-hari                      │
│  3. Dapat jawaban langsung                                          │
│                                                                     │
│  Sederhana, intuitif, dan mencakup SEMUA kebutuhan.                │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. TUJUAN & METRIK

### 3.1 Tujuan

| # | Tujuan | SMART Metric |
|---|--------|-------------|
| G1 | Kurangi waktu operator mencari informasi | Waktu pencarian turun dari ~5 menit ke < 30 detik |
| G2 | Kurangi kesalahan pengisian dokumen | Jumlah dokumen ditolak turun 50% |
| G3 | Tingkatkan kemandirian operator | 80% pertanyaan dijawab AI tanpa perlu tanya helpdesk |
| G4 | Gunakan token minimal | Rata-rata ≤ 200 token/pertanyaan |

### 3.2 Success Metrics

| Metrik | Target | Cara Ukur |
|--------|--------|-----------|
| Adoption Rate | ≥ 60% user | Hitung user yang buka chat > 3x |
| Engagement | ≥ 3 pertanyaan/hari/user | Hitung total query / total user |
| Accuracy | ≥ 85% | User feedback (like/dislike) |
| Token Efficiency | ≤ 200 token/query | Monitor API usage |
| Cost | ≤ Rp 50.000/tahun | Total tagihan API / 600 sekolah |

---

## 4. TARGET PENGGUNA

### Persona A — Operator Sekolah (Primary)

| Aspek | Detail |
|-------|--------|
| **Usia** | 25-50 tahun |
| **Literasi Teknologi** | Menengah — bisa pakai aplikasi, tapi bukan programmer |
| **Kesibukan** | Tinggi — handle banyak administrasi sekaligus |
| **Kebutuhan** | Cepat, praktis, tidak ribet |
| **Bahasa** | Bahasa Indonesia sehari-hari (campur dengan istilah teknis) |
| **Contoh Pertanyaan** | "Kenapa saldo tidak balance?", "Cara isi SPPD?" |

### Persona B — Kepala Sekolah (Secondary)

| Aspek | Detail |
|-------|--------|
| **Kebutuhan** | Ingin lihat ringkasan kondisi keuangan |
| **Contoh Pertanyaan** | "Berapa total pengeluaran bulan ini?", "Ringkasan LPJ" |

### Persona C — Bendahara / Tata Usaha (Secondary)

| Aspek | Detail |
|-------|--------|
| **Kebutuhan** | Verifikasi data, cek kelengkapan |
| **Contoh Pertanyaan** | "Apa saja yang kurang?", "Cek duplikasi nomor surat" |

---

## 5. USER STORIES

### 5.1 Epic: Akses & Navigasi

| ID | User Story | Priority |
|----|-----------|----------|
| US-01 | Sebagai operator, saya ingin melihat tombol ⚡ di semua halaman agar saya bisa bertanya kapan saja | P0 |
| US-02 | Sebagai operator, saya ingin tombol ⚡ tidak mengganggu saat saya bekerja | P0 |
| US-03 | Sebagai operator, saya ingin panel chat bisa dibuka/tutup dengan smooth animation | P0 |

### 5.2 Epic: Tanya Data BKU

| ID | User Story | Priority |
|----|-----------|----------|
| US-10 | Sebagai operator, saya ingin bertanya "Berapa total pengeluaran bulan Januari?" dan AI menjawab dengan angka real-time dari data BKU | P0 |
| US-11 | Sebagai operator, saya ingin bertanya "Kenapa saldo tidak balance?" dan AI menjelaskan penyebabnya | P0 |
| US-12 | Sebagai operator, saya ingin bertanya "Tunjukkan transaksi di atas 5 juta" dan AI menampilkan daftarnya | P1 |
| US-13 | Sebagai operator, saya ingin bertanya "Apa saja transaksi yang belum lengkap dokumennya?" dan AI menunjukkannya | P0 |

### 5.3 Epic: Tanya Dokumen LPJ

| ID | User Story | Priority |
|----|-----------|----------|
| US-20 | Sebagai operator, saya ingin bertanya "Dokumen apa yang kurang untuk bulan Januari?" dan AI cek checklist | P0 |
| US-21 | Sebagai operator, saya ingin bertanya "Cara mengisi kolom PPh 21?" dan AI menjelaskan langkahnya | P1 |
| US-22 | Sebagai operator, saya ingin bertanya "Template mana untuk kegiatan ini?" dan AI merekomendasikan | P2 |
| US-23 | Sebagai operator, saya ingin bertanya "Apa perbedaan honor guru dan tendik?" dan AI menjelaskan | P2 |

### 5.4 Epic: Tanya Data Guru & Tendik

| ID | User Story | Priority |
|----|-----------|----------|
| US-30 | Sebagai operator, saya ingin bertanya "Berapa jumlah guru honorer?" dan AI menghitung dari data | P0 |
| US-31 | Sebagai operator, saya ingin bertanya "Cari guru bernama Budi" dan AI menampilkan hasil | P0 |
| US-32 | Sebagai operator, saya ingin bertanya "Kenapa nama ini tidak muncul di daftar penerima honor?" dan AI menjelaskan | P1 |

### 5.5 Epic: Tanya Data Sekolah

| ID | User Story | Priority |
|----|-----------|----------|
| US-40 | Sebagai operator, saya ingin bertanya "Siapa kepala sekolah?" dan AI menjawab dari data tersimpan | P0 |
| US-41 | Sebagai operator, saya ingin bertanya "Tunjukkan alamat sekolah" dan AI menampilkannya | P1 |

### 5.6 Epic: Tanya Nomor Surat

| ID | User Story | Priority |
|----|-----------|----------|
| US-50 | Sebagai operator, saya ingin bertanya "Nomor surat terakhir?" dan AI menjawab | P1 |
| US-51 | Sebagai operator, saya ingin bertanya "Cek duplikasi nomor ini" dan AI memeriksa | P2 |

### 5.7 Epic: Tanya Proses & Panduan

| ID | User Story | Priority |
|----|-----------|----------|
| US-60 | Sebagai operator, saya ingin bertanya "Bagaimana cara upload data guru?" dan AI memberi panduan langkah | P1 |
| US-61 | Sebagai operator, saya ingin bertanya "Apa saja dokumen wajib SPJ?" dan AI memberi daftar | P1 |

### 5.8 Epic: Ringkasan & Rekap

| ID | User Story | Priority |
|----|-----------|----------|
| US-70 | Sebagai kepala sekolah, saya ingin bertanya "Ringkasan keuangan bulan ini" dan AI memberi laporan | P1 |
| US-71 | Sebagai operator, saya ingin bertanya "Apa yang harus saya selesaikan hari ini?" dan AI memprioritaskan | P2 |

### 5.9 Epic: Fitur Lanjutan

| ID | User Story | Priority |
|----|-----------|----------|
| US-80 | Sebagai operator, saya ingin bertanya dengan suara (voice input) agar tidak perlu mengetik | P3 |
| US-81 | Sebagai operator, saya ingin AI membantu mengisi form dari chat ("Isikan SPPD untuk Pak Budi") | P3 |
| US-82 | Sebagai operator, saya ingin melihat riwayat chat saya sebelumnya | P2 |

---

## 6. FUNCTIONAL REQUIREMENTS

### 6.1 ⚡ FAB (Floating Action Button)

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-01 | Tombol ⚡ (Tanya AI) berada di pojok kanan bawah, fixed position | P0 |
| FR-02 | Tombol menggunakan desain premium sesuai design system (primary color) | P0 |
| FR-03 | Tombol memiliki tooltip "Tanya AI" saat di-hover | P0 |
| FR-04 | Tombol memiliki animasi pulse/glow halus agar terlihat | P1 |
| FR-05 | Tombol tidak menutupi konten penting (posisi di atas FAB Cetak yang sudah ada) | P0 |

**Visual:**

```
                    ┌──────────────────┐
                    │   FAB Cetak      │  ← existing
                    └──────────────────┘
                    
                    ╔══════════════════╗
                    ║   ⚡ Tanya AI    ║  ← NEW (di atasnya)
                    ╚══════════════════╝
```

### 6.2 Panel Chat

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-10 | Panel chat muncul dari kanan dengan slide animation | P0 |
| FR-11 | Panel memiliki lebar 380px (mobile: full width) | P0 |
| FR-12 | Panel memiliki tinggi penuh (full height) dengan header & footer fixed | P0 |
| FR-13 | Panel dapat ditutup dengan: klik ✕, klik backdrop, tekan Escape | P0 |
| FR-14 | Panel memiliki backdrop semi-transparan di belakangnya | P0 |
| FR-15 | Panel memiliki z-index tinggi (≥ 200) agar di atas semua elemen | P0 |

### 6.3 Header Panel Chat

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-20 | Header menampilkan: ikon ⚡, judul "Tanya AI", nama halaman saat ini | P0 |
| FR-21 | Header memiliki tombol ✕ untuk menutup panel | P0 |
| FR-22 | Header menampilkan indikator status AI (Online/Offline) | P1 |
| FR-23 | Header memiliki tombol "Hapus Riwayat Chat" | P2 |

### 6.4 Area Chat (Message List)

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-30 | Area chat menampilkan pesan user (kanan) dan respon AI (kiri) | P0 |
| FR-31 | Setiap pesan AI memiliki avatar/ikon ⚡ di sebelah kirinya | P0 |
| FR-32 | Chat bubble memiliki desain premium (rounded-xl, shadow) | P0 |
| FR-33 | Chat bubble untuk angka/nominal menggunakan format Rupiah (Rp) | P1 |
| FR-34 | Chat bubble untuk data tabel menggunakan format list/table sederhana | P1 |
| FR-35 | Chat bubble mendukung Markdown sederhana (bold, list, link) | P1 |
| FR-36 | Chat otomatis scroll ke bawah saat pesan baru masuk | P0 |
| FR-37 | Loading indicator (typing animation) saat AI sedang memproses | P0 |
| FR-38 | Riwayat chat disimpan di localStorage (max 50 pesan) | P2 |

### 6.5 Quick Chips (Pertanyaan Cepat)

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-40 | Panel chat menampilkan 4-5 "pertanyaan cepat" yang relevan dengan halaman saat ini | P0 |
| FR-41 | Quick chips ditampilkan sebagai tombol pill yang bisa diklik | P0 |
| FR-42 | Quick chips berbeda-beda tergantung halaman (context-aware) | P0 |
| FR-43 | Quick chips hilang setelah user mengirim 1 pesan (agar tidak mengganggu) | P1 |
| FR-44 | Quick chips ditampilkan kembali jika chat di-reset | P2 |

### 6.6 Input Chat

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-50 | Input berupa text field dengan placeholder sesuai konteks halaman | P0 |
| FR-51 | Tombol kirim ➤ (enter juga bisa kirim) | P0 |
| FR-52 | Input mendukung multiline (Shift+Enter untuk newline) | P1 |
| FR-53 | Input tidak bisa kirim jika kosong (disabled state) | P0 |
| FR-54 | Tombol mic 🎤 untuk voice input (Phase 3) | P3 |

### 6.7 AI Response Engine

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-60 | AI bisa membaca data dari localStorage (BKU, Guru, Sekolah, dll) | P0 |
| FR-61 | AI tahu halaman yang sedang dibuka user (context-aware) | P0 |
| FR-62 | AI menjawab dalam Bahasa Indonesia | P0 |
| FR-63 | AI menjawab dalam 1-3 kalimat (ringkas, tidak bertele-tele) | P0 |
| FR-64 | AI menyertakan angka/data spesifik dari aplikasi (bukan general answer) | P0 |
| FR-65 | AI menyertakan sumber data jika relevan ("Dari BKU: ...") | P1 |
| FR-66 | Jika AI tidak bisa menjawab, tampilkan pesan "Maaf, saya belum bisa menjawab pertanyaan itu" | P0 |
| FR-67 | Jika data kosong, AI bilang "Data belum tersedia, upload dulu ya" | P0 |

### 6.8 Error Handling

| FR | Deskripsi | Prioritas |
|----|-----------|-----------|
| FR-70 | Jika API gagal (network error), tampilkan pesan error yang user-friendly | P0 |
| FR-71 | Jika API timeout (>10 detik), tampilkan "Mohon maaf, sedang sibuk. Coba lagi." | P0 |
| FR-72 | Jika rate limit API tercapai, tampilkan "Terlalu banyak pertanyaan. Tunggu sebentar." | P1 |
| FR-73 | Jika localStorage penuh, kasih peringatan | P2 |

---

## 7. NON-FUNCTIONAL REQUIREMENTS

| NFR | Deskripsi | Target |
|-----|-----------|--------|
| NFR-01 | Performance — Panel chat terbuka < 300ms | ≤ 300ms |
| NFR-02 | Performance — AI menjawab < 3 detik (rata-rata) | ≤ 3 detik |
| NFR-03 | Token Efficiency — Rata-rata token per pertanyaan | ≤ 200 token |
| NFR-04 | Cost — Total biaya API per tahun | ≤ Rp 50.000 |
| NFR-05 | Data Privacy — Semua data tetap di localStorage | Tidak ada data dikirim ke server kecuali ke API AI |
| NFR-06 | Consistency — Desain mengikuti design system (primary #004ac6) | Warna, font, spacing konsisten |
| NFR-07 | Responsive — Bekerja di semua ukuran layar | Mobile (360px) - Desktop (1920px) |
| NFR-08 | Accessibility — Dapat diakses keyboard (Tab, Enter, Escape) | Keyboard navigable |
| NFR-09 | Availability — Chat history tersimpan di localStorage | Persistent |

---

## 8. DESAIN & UI/UX

### 8.1 Flow Aplikasi

```
┌──────────────────────────────────────────────────────────────────┐
│  USER ADA DI HALAMAN [X]                                         │
│  (BKU / Dokumen LPJ / Data Guru / Dashboard / dll)              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  KLIK FAB ⚡                                                      │
│                                                                  │
│  Panel Chat terbuka dari kanan:                                  │
│  ┌──────────────────────────────────────┐                       │
│  │ ⚡ Tanya AI — Halaman: Data BKU   ✕  │ ← header              │
│  ├──────────────────────────────────────┤                       │
│  │                                      │                       │
│  │ 💬 Hai! Ada yang bisa saya bantu?   │ ← chat area            │
│  │    Saya bisa akses data BKU Anda.   │                       │
│  │                                      │                       │
│  │ ┌──────────────────────────────────┐ │                       │
│  │ │ 📊 Total pengeluaran bulan ini?  │ │ ← quick chips         │
│  │ │ 🔍 Transaksi yang belum lengkap  │ │                       │
│  │ │ ⚠️ Kenapa saldo tidak balance?   │ │                       │
│  │ └──────────────────────────────────┘ │                       │
│  │                                      │                       │
│  ├──────────────────────────────────────┤                       │
│  │ 💬 Tanya sesuatu...           ➤    │ ← input                │
│  └──────────────────────────────────────┘                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  USER KETIK PERTANYAAN                                           │
│                                                                  │
│  "Berapa total pengeluaran bulan Januari?"                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  AI MEMPROSES                                                    │
│                                                                  │
│  1. Tangkap konteks halaman → "bku"                             │
│  2. Baca data dari localStorage → bku_data                     │
│  3. Filter: bulan=Januari, ambil total pengeluaran             │
│  4. Generate jawaban → template prompt                         │
│  5. Tampilkan ke user                                           │
│                                                                  │
│  Total: ~150 token                                              │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  AI MENJAWAB                                                     │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │ ⚡ Total pengeluaran bulan Januari 2026       │               │
│  │ adalah Rp 45.250.000.                        │               │
│  │                                              │               │
│  │ Rincian:                                     │               │
│  │ • Honorarium   : Rp 25.000.000 (55%)        │               │
│  │ • Transport     : Rp 8.500.000  (19%)       │               │
│  │ • Mamin         : Rp 6.750.000  (15%)       │               │
│  │ • Pemeliharaan  : Rp 5.000.000  (11%)       │               │
│  │                                              │               │
│  │ Sumber: Data BKU - Jan 2026                 │               │
│  └──────────────────────────────────────────────┘               │
│                                                                  │
│  [👍 / 👎]  ← feedback button (Phase 2)                       │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Wireframe Panel Chat

```
┌─────────────────────────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════════════════════╗       │
│ ║  ⚡ Tanya AI        ··  Halaman: Data BKU       ✕      ║       │
│ ╚═══════════════════════════════════════════════════════════╝       │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ ⚡ Hai! 👋                                            │          │
│  │ Ada yang bisa saya bantu tentang data BKU?           │          │
│  │                                                       │          │
│  │ Saya bisa menjawab:                                   │          │
│  │ • Total penerimaan & pengeluaran                      │          │
│  │ • Transaksi spesifik                                  │          │
│  │ • Status kelengkapan LPJ                              │          │
│  │ • Dan lainnya seputar data keuangan                   │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                     │
│  ┌────────────────┐  ┌────────────────────┐  ┌────────────────┐   │
│  │ 📊 Total       │  │ 🔍 Transaksi       │  │ ⚠️ Kenapa      │   │
│  │ pengeluaran    │  │ belum lengkap      │  │ saldo tidak    │   │
│  │ bulan ini?     │  │                    │  │ balance?       │   │
│  └────────────────┘  └────────────────────┘  └────────────────┘   │
│                                                                     │
│                                                                     │
│                                                                     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ 💬 Ketik pertanyaan di sini...                   ➤  │          │
│  └──────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Desain Desktop vs Mobile

| Elemen | Desktop (≥ 1024px) | Mobile (< 1024px) |
|--------|-------------------|-------------------|
| Lebar Panel | 400px | 100% (full width) |
| Posisi Panel | Slide dari kanan | Slide dari bawah / full overlay |
| FAB | Pojok kanan bawah | Pojok kanan bawah (lebih kecil) |
| Quick Chips | 4-5 chips horizontal | 2-3 chips, wrap |
| Input | Text + Send button | Text + Send + Voice button |

---

## 9. DATA FLOW & ARSITEKTUR

### 9.1 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Client-side)                            │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  APLIKASI SPJ/LPJ (React)                                       │   │
│  │                                                                  │   │
│  │  ┌─────────────┐   ┌──────────────────────────────────────┐    │   │
│  │  │ Topbar      │   │  AskAIPanel (Komponen)               │    │   │
│  │  │ (⚡ Tanya AI) │   │                                      │    │   │
│  │  └─────────────┘   │  ├ Header                            │    │   │
│  │                     │  ├ ChatList (message bubbles)       │    │   │
│  │  ┌─────────────┐   │  ├ QuickChips (context-aware)       │    │   │
│  │  │ FAB ⚡       │   │  ├ ChatInput                        │    │   │
│  │  │ (pojok)     │   │  └──────────────────────────────────┘    │   │
│  │  └─────────────┘   │                                          │   │
│  │                     │  ┌──────────────────────────────────┐    │   │
│  │  ┌─────────────┐   │  │  AI Agent Core                   │    │   │
│  │  │ Halaman     │   │  │  ├ detectContext() → halaman     │    │   │
│  │  │ (konten)    │   │  │  ├ getDataSources() → localStorage│   │   │
│  │  └─────────────┘   │  │  ├ buildPrompt() → context+data  │    │   │
│  │                     │  │  ├ callApi() → Gemini/Groq       │    │   │
│  │                     │  │  └ parseResponse() → format output│   │   │
│  │                     │  └──────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  LOCAL STORAGE (Semua data aplikasi)                            │   │
│  │                                                                  │   │
│  │  spj_bku_data        → BKU transactions                         │   │
│  │  spj_data_guru       → Data guru                                │   │
│  │  spj_data_tendik     → Data tendik                              │   │
│  │  spj_data_sekolah    → Data sekolah + pejabat                   │   │
│  │  spj_dokumen_lpj     → Status dokumen LPJ                       │   │
│  │  spj_bku_lpj_checklist → Checklist LPJ                          │   │
│  │  spj_notes           → Catatan                                  │   │
│  │  spj_spj_nomor_surat → Riwayat nomor surat                      │   │
│  │  spj_ai_chat_history → Riwayat chat AI                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌─────────────────────────────┐
              │     AI API (Cloud)          │
              │                             │
              │  Gemini Flash / Groq        │
              │  llama-3.1-8b / Qwen 2.5    │
              │                             │
              │  Input: prompt + data       │
              │  Output: jawaban teks       │
              └─────────────────────────────┘
```

### 9.2 Data Flow per Pertanyaan

```
STEP 1: User klik FAB atau ketik pertanyaan
─────────────────────────────────────────────
  → AskAIPanel terbuka
  → Detect halaman saat ini (dari URL)
  → Tampilkan quick chips sesuai halaman

STEP 2: User kirim pertanyaan
─────────────────────────────────────────────
  → Ambil riwayat chat (last 5 messages for context)
  → Ambil data relevan dari localStorage
  → Build system prompt
  → Build user prompt (pertanyaan + data)

STEP 3: Panggil API AI
─────────────────────────────────────────────
  → Kirim ke Gemini Flash / Groq
  → Terima response (1-3 kalimat)
  → Parse & format (currency, bold, dll)

STEP 4: Tampilkan ke user
─────────────────────────────────────────────
  → Render chat bubble
  → Simpan ke riwayat chat
  → Auto-scroll ke bawah
```

### 9.3 Prompt Engineering (Template System Prompt)

```javascript
// System Prompt — dikirim sekali di awal chat
const SYSTEM_PROMPT = `Kamu adalah asisten AI untuk aplikasi LPJ BOS/BOSP.
Tugasmu membantu operator sekolah menjawab pertanyaan tentang data di aplikasi.

ATURAN:
1. Jawab dalam Bahasa Indonesia
2. Jawab RINGKAS — maksimal 3 kalimat
3. Sertakan ANGKA SPESIFIK dari data (bukan perkiraan)
4. Jika data kosong, bilang "Data belum tersedia"
5. Jika tidak tahu, bilang "Maaf, saya belum bisa menjawab itu"
6. Format Rupiah: Rp 1.000.000
7. Jangan gunakan markdown yang rumit

HALAMAN SAAT INI: {{currentPage}}
DATA TERKAIT:
{{relevantData}}
`
```

### 9.4 Fungsi Data Sources

```javascript
// Fungsi untuk mendapatkan data dari localStorage
const DATA_SOURCES = {
  // BKU
  getBkuData: () => storageHelper.get('bku_data', null),
  getBkuChecklist: () => storageHelper.get('bku_lpj_checklist', {}),
  
  // Data Guru & Tendik
  getDataGuru: () => storageHelper.get('data_guru', []),
  getDataTendik: () => storageHelper.get('data_tendik', []),
  
  // Data Sekolah
  getDataSekolah: () => storageHelper.get('data_sekolah', null),
  getLogoSekolah: () => storageHelper.get('logo_sekolah', null),
  
  // Dokumen LPJ
  getDokumenLpj: () => storageHelper.get('dokumen_lpj', {}),
  getDokumenKelengkapan: () => storageHelper.get('dokumen_kelengkapan_status', {}),
  
  // Nomor Surat
  getNomorSurat: () => storageHelper.get('spj_nomor_surat', []),
  
  // Catatan
  getNotes: () => storageHelper.get('notes', []),
}
```

### 9.5 Context Detection

```javascript
// Deteksi halaman dari URL path
function detectContext(pathname) {
  if (pathname.includes('/bku')) return {
    page: 'bku',
    title: 'Data BKU',
    icon: 'account_balance',
    dataSources: ['bku_data', 'bku_lpj_checklist'],
    quickChips: BKU_QUICK_CHIPS,
  }
  if (pathname.includes('/dokumen-lpj')) return {
    page: 'dokumen-lpj',
    title: 'Dokumen LPJ',
    icon: 'description',
    dataSources: ['dokumen_lpj', 'templateConfig', 'data_guru', 'data_tendik'],
    quickChips: DOKUMEN_LPJ_QUICK_CHIPS,
  }
  if (pathname.includes('/data-guru')) return {
    page: 'data-guru',
    title: 'Data Guru & Tendik',
    icon: 'groups',
    dataSources: ['data_guru', 'data_tendik'],
    quickChips: GURU_QUICK_CHIPS,
  }
  // ... dan seterusnya untuk setiap halaman
}
```

---

## 10. CONTEXT-AWARE LOGIC PER HALAMAN

Setiap halaman memiliki **quick chips** dan **data sources** yang berbeda.

### 10.1 Halaman: Dashboard (Beranda)

| Aspek | Detail |
|-------|--------|
| **Icon** | `🏠` |
| **Quick Chips** | `📈 Ringkasan keuangan`, `✅ Progress LPJ`, `🎯 Anggaran tersisa`, `📋 Yang perlu diselesaikan` |
| **Data Sources** | bku_data, bku_lpj_checklist, data_sekolah |
| **Contoh Jawaban** | "Total pengeluaran: Rp 45.250.000. Progress LPJ: 15/20 (75%). Sisa anggaran: Rp 104.750.000." |

### 10.2 Halaman: Data BKU

| Aspek | Detail |
|-------|--------|
| **Icon** | `🏦` |
| **Quick Chips** | `📊 Total pengeluaran bulan ini`, `🔍 Transaksi belum lengkap`, `⚠️ Kenapa saldo tidak balance?`, `💰 Total penerimaan BOSP` |
| **Data Sources** | bku_data, bku_lpj_checklist |
| **Contoh Jawaban** | "Total pengeluaran bulan Januari: Rp 45.250.000 dari 12 transaksi. Ada 3 transaksi yang belum lengkap dokumennya." |

### 10.3 Halaman: Dokumen LPJ

| Aspek | Detail |
|-------|--------|
| **Icon** | `📋` |
| **Quick Chips** | `📋 Dokumen apa yang kurang?`, `🤔 Template mana untuk kegiatan X?`, `❓ Cara isi PPh 21?`, `📑 Cara buat SPPD?` |
| **Data Sources** | dokumen_lpj, templateConfig, data_guru, data_tendik, bku_data |
| **Contoh Jawaban** | "Untuk kegiatan 'Transport Rapat', gunakan template 'Transport Rapat' di card Perjalanan Dinas. Jangan lupa isi tujuan SPPD." |

### 10.4 Halaman: Data Guru & Tendik

| Aspek | Detail |
|-------|--------|
| **Icon** | `👥` |
| **Quick Chips** | `👤 Berapa jumlah guru honorer?`, `🔍 Cari guru [nama]`, `📊 Statistik status guru`, `❓ Kenapa tidak muncul di daftar penerima?` |
| **Data Sources** | data_guru, data_tendik |
| **Contoh Jawaban** | "Jumlah guru honorer: 12 orang. Tendik honorer: 3 orang. Perpustakaan: 1 orang. Penjaga: 1 orang." |

### 10.5 Halaman: Nomor Surat

| Aspek | Detail |
|-------|--------|
| **Icon** | `📝` |
| **Quick Chips** | `📄 Nomor surat terakhir`, `🔍 Cari nomor surat`, `❓ Format nomor surat?` |
| **Data Sources** | spj_nomor_surat |
| **Contoh Jawaban** | "Nomor surat terakhir: 422.1/SK-005/SDN-PSR/VII/2026 (Surat Keputusan, 15 Juli 2026)." |

### 10.6 Halaman: Catatan (Notes)

| Aspek | Detail |
|-------|--------|
| **Icon** | `📒` |
| **Quick Chips** | `📝 Tampilkan catatan BOS`, `🔍 Cari catatan tentang deadline`, `📊 Ringkasan catatan` |
| **Data Sources** | notes |
| **Contoh Jawaban** | "Ada 3 catatan tentang deadline: (1) Deadline LPJ 15 Juli, (2) Upload bukti 20 Juli, (3) Rapat evaluasi 25 Juli." |

### 10.7 Halaman: Pengaturan

| Aspek | Detail |
|-------|--------|
| **Icon** | `⚙️` |
| **Quick Chips** | `❓ Cara export data?`, `❓ Apa itu mode SIPLAH?` |
| **Data Sources** | - (umum) |
| **Contoh Jawaban** | "Mode SIPLAH: Jika sekolah Anda bertransaksi melalui SIPLAH, aktifkan mode ini. Dokumen wajib luar ARKAS tidak perlu ditampilkan." |

### 10.8 Fallback (Halaman Tidak Terdeteksi)

| Aspek | Detail |
|-------|--------|
| **Icon** | `💡` |
| **Quick Chips** | `📊 Total pengeluaran`, `👤 Cari data guru`, `📋 Dokumen kurang`, `🏫 Data sekolah` |
| **Data Sources** | Ambil semua data yang tersedia |

---

## 11. PROVIDER AI & BIAYA

### 11.1 Perbandingan Provider

| Provider | Model | Cost/1M Token | Kecepatan | Kualitas BI | Cocok untuk |
|----------|-------|---------------|-----------|-------------|-------------|
| **Gemini Free** | 2.0 Flash | **$0** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **MVP & Testing** |
| **Groq** | Llama 3.1 8B | $0.05 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | **Production unlimited** |
| **Groq** | Qwen 2.5 3B | ~$0.03 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | **Production (irit)** |

### 11.2 Estimasi Biaya per Tahun (600 Sekolah)

| Skenario | Token/Hari | Token/Bulan | Provider | Biaya/Bulan | Biaya/Tahun |
|----------|-----------|-------------|----------|-------------|-------------|
| **Ringan** (3 query/hari/sekolah) | 540.000 | 16.200.000 | Gemini Free | **Rp 0** | **Rp 0** |
| **Normal** (6 query/hari/sekolah) | 1.080.000 | 32.400.000 | Gemini Free | **Rp 0** | **Rp 0** |
| **Berat** (10 query/hari/sekolah) | 1.800.000 | 54.000.000 | Gemini Free | **Rp 0** | **Rp 0** |
| **Beralih ke Groq** (10 query/hari) | 1.800.000 | 54.000.000 | Groq | ~$2.70 | **~Rp 42.000** |

### 11.3 Rekomendasi

```
┌──────────────────────────────────────────────────────────────────┐
│  ✅ REKOMENDASI PROVIDER                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Phase 1 (MVP):   Gemini Free → Rp 0/tahun                     │
│  Phase 2 (Scale): Groq Paid    → ~Rp 42.000/tahun              │
│                                                                  │
│  Total biaya SETAHUN: Rp 0 - Rp 42.000                          │
│  (lebih murah dari 1 liter bensin!)                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 12. IMPLEMENTASI

### 12.1 Struktur File

```
spj-frontend/src/
├── components/
│   └── ai/
│       ├── AskAIButton.jsx           ← FAB + Panel Chat Container
│       ├── AskAIPanel.jsx            ← Slide-in Chat Panel
│       ├── ChatMessage.jsx           ← Chat Bubble Component
│       ├── ChatInput.jsx             ← Input + Send Button
│       ├── QuickChips.jsx            ← Context-aware Quick Chips
│       └── AiAgent.js               ← AI Logic (prompt, data, API)
├── contexts/
│   └── AIContext.jsx                 ← Context untuk state AI
├── utils/
│   └── aiHelper.js                   ← Helper: format, data sources, prompt builder
```

### 12.2 Phase 1: MVP (Minggu 1-2)

**Fokus**: FAB + Panel Chat + Quick Chips + Integrasi API dasar

| Task | Estimasi |
|------|----------|
| Buat komponen AskAIButton (FAB) | 1 hari |
| Buat komponen AskAIPanel (slide panel) | 2 hari |
| Buat komponen ChatMessage (bubble) | 1 hari |
| Buat komponen ChatInput | 0.5 hari |
| Buat komponen QuickChips | 1 hari |
| Buat AiAgent (prompt + API call) | 2 hari |
| Buat aiHelper (data sources, formatter) | 1 hari |
| Integrasi dengan halaman (App.jsx) | 0.5 hari |
| **Total** | **~9 hari** |

### 12.3 Phase 2: Context-Aware (Minggu 3-4)

**Fokus**: Context detection per halaman, quick chips yang relevan

| Task | Estimasi |
|------|----------|
| Implementasi context detection (URL) | 1 hari |
| Buat quick chips untuk 8 halaman | 2 hari |
| Optimasi prompt per konteks | 1 hari |
| Chat history (localStorage) | 1 hari |
| Feedback buttons (👍/👎) | 1 hari |
| **Total** | **~6 hari** |

### 12.4 Phase 3: Advanced (Opsional, Minggu 5-6)

**Fokus**: Voice input, action dari chat, analytics

| Task | Estimasi |
|------|----------|
| Voice input (Web Speech API) | 2 hari |
| AI actions (isi form dari chat) | 3 hari |
| Usage analytics dashboard | 2 hari |
| **Total** | **~7 hari** |

### 12.5 Teknologi yang Digunakan

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **UI Framework** | React 18 + Tailwind CSS | Sudah dipakai |
| **Icons** | Material Symbols | Sudah dipakai |
| **AI API** | Google Gemini API | Free tier, kualitas BI terbaik |
| **Fallback API** | Groq API | Unlimited, murah |
| **State** | React Context + localStorage | Data sudah di localStorage |
| **Speech-to-Text** | Web Speech API | Gratis, built-in browser |
| **HTTP Client** | Fetch API | Native, tanpa library tambahan |

### 12.6 Kode Sket: Komponen Utama

```jsx
// AskAIButton.jsx — FAB
export default function AskAIButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { showToast } = useToast()
  
  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 
                   bg-gradient-to-r from-primary to-blue-600 
                   text-white rounded-2xl shadow-2xl shadow-primary/30
                   hover:scale-105 active:scale-95 
                   transition-all duration-300 group"
        title="Tanya AI"
      >
        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
        <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white 
                     rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 
                     transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Tanya AI
        </span>
      </button>

      {/* Panel Chat */}
      {isOpen && <AskAIPanel onClose={() => setIsOpen(false)} />}
    </>
  )
}
```

```jsx
// AiAgent.js — AI Logic
export class AiAgent {
  constructor(context) {
    this.context = context // halaman saat ini
    this.messages = []     // riwayat chat
  }

  async answer(question) {
    // 1. Ambil data dari localStorage
    const data = this.getRelevantData()
    
    // 2. Build prompt
    const prompt = this.buildPrompt(question, data)
    
    // 3. Panggil API
    const response = await this.callApi(prompt)
    
    // 4. Format jawaban
    return this.formatResponse(response)
  }

  getRelevantData() {
    // Ambil data sesuai konteks halaman
    const sources = CONTEXT_MAP[this.context]?.dataSources || []
    const data = {}
    sources.forEach(key => {
      data[key] = DATA_SOURCES[key]?.()
    })
    return data
  }

  buildPrompt(question, data) {
    return {
      systemPrompt: `Kamu adalah asisten AI untuk aplikasi LPJ BOS/BOSP...`,
      userPrompt: `Pertanyaan: ${question}\n\nData:\n${JSON.stringify(data)}`,
    }
  }

  async callApi({ systemPrompt, userPrompt }) {
    // Panggil Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }]
        })
      }
    )
    const result = await response.json()
    return result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, saya tidak bisa menjawab.'
  }

  formatResponse(text) {
    // Format Rupiah, bold, list
    return text
      .replace(/\d+(\.\d+)?/g, m => `Rp ${Number(m).toLocaleString('id-ID')}`)
  }
}
```

---

## 13. RISIKO & MITIGASI

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| **API Key bocor** | Orang lain pakai API kita | Simpan API key di environment variable. Gunakan proxy jika perlu |
| **Rate limit tercapai** | User tidak bisa bertanya | Tampilkan pesan "Tunggu sebentar". Cache jawaban umum |
| **AI jawab salah** | User dapat info salah | Tambahkan disclaimer "AI bisa salah". Beri feedback button |
| **Data privacy** | Data sekolah terkirim ke API | Hanya kirim data yang diperlukan. Minimalisasi data |
| **Token usage membengkak** | Biaya naik | Set daily/monthly limit. Monitoring dashboard |
| **User tidak tertarik** | Fitur tidak dipakai | Quick chips membantu user mulai. Edukasi via tooltip |
| **Offline mode** | Tidak ada internet | Tampilkan pesan "Tidak ada koneksi". Tidak ada fallback |
| **API deprecation** | API berubah | Abstraksi layer API. Bisa ganti provider kapan saja |

---

## 14. OPEN QUESTIONS

1. **Api key storage** — Apakah API key disimpan di frontend (env variable) atau perlu backend proxy?

2. **Feedback mechanism** — Apakah perlu feedback button (👍/👎) di setiap jawaban? Atau cukup lapor error?

3. **Rate limiting** — Berapa maksimal pertanyaan/user/hari? Rekomendasi: 20 pertanyaan/user/hari (cukup)

4. **Offline fallback** — Apakah perlu fallback jika offline? (Tidak ada AI, cukup tampilkan pesan)

5. **Multi-bahasa** — Apakah perlu support bahasa asing? Atau cukup Bahasa Indonesia?

6. **Copy ke form** — Apakah di Phase 3 perlu fitur "Isikan ke form" dari chat? (Rekomendasi: Ya, sangat berguna)

---

## 15. LAMPIRAN

### 15.1 Daftar Semua Quick Chips

| Halaman | Quick Chips |
|---------|-------------|
| **Dashboard** | `📈 Ringkasan keuangan`, `✅ Progress LPJ`, `🎯 Anggaran tersisa`, `📋 Yang perlu diselesaikan` |
| **Data BKU** | `📊 Total pengeluaran`, `🔍 Transaksi belum lengkap`, `⚠️ Kenapa saldo tidak balance?`, `💰 Total penerimaan BOSP` |
| **Dokumen LPJ** | `📋 Dokumen apa yang kurang?`, `🤔 Template mana?`, `❓ Cara isi PPh 21?`, `📑 Cara buat SPPD?` |
| **Data Guru** | `👤 Jumlah guru honorer?`, `🔍 Cari guru`, `📊 Statistik`, `❓ Kenapa tidak muncul?` |
| **Data Sekolah** | `🏫 Siapa kepala sekolah?`, `📍 Alamat sekolah`, `📞 Kontak sekolah` |
| **Nomor Surat** | `📄 Nomor surat terakhir`, `🔍 Cari nomor surat`, `❓ Format nomor?` |
| **Catatan** | `📝 Catatan BOS`, `🔍 Cari catatan`, `📊 Ringkasan` |
| **Dok. Kelengkapan** | `📋 Dokumen wajib?`, `❓ Bedanya SIPLAH & Non?` |
| **Realisasi** | `💰 Realisasi vs anggaran`, `📊 Kategori terbesar` |
| **Pengaturan** | `❓ Cara export?`, `❓ Mode SIPLAH?` |

### 15.2 Data Storage Keys

| Key | Data | Format |
|-----|------|--------|
| `spj_bku_data` | Transaksi BKU | `{ transactions: [], header: {}, summary: {} }` |
| `spj_data_guru` | Data guru | `[ { nama, nip, nuptk, status, golongan, ... } ]` |
| `spj_data_tendik` | Data tendik | `[ { nama, nip, nuptk, status, roleHonor, ... } ]` |
| `spj_data_sekolah` | Data sekolah | `{ npsn, nama, alamat, pejabat: { ks, bendahara }, logo }` |
| `spj_bku_lpj_checklist` | Checklist LPJ | `{ "row-1": true, "row-2": false }` |
| `spj_dokumen_lpj` | Status dokumen | `{ "honor_guru": { status: "Lengkap" } }` |
| `spj_spj_nomor_surat` | Riwayat nomor | `[ { nomor, jenis, tanggal, ... } ]` |
| `spj_notes` | Catatan | `[ { id, title, content, category, ... } ]` |
| `spj_ai_chat_history` | Riwayat chat AI | `[ { role, content, timestamp, context } ]` |

### 15.3 Daftar UI States untuk Setiap Komponen

| Komponen | States |
|----------|--------|
| **AskAIButton (FAB)** | `default`, `hover`, `active`, `hidden` (saat panel terbuka) |
| **AskAIPanel** | `closed`, `opening` (animasi), `open`, `closing` (animasi) |
| **ChatMessage (AI)** | `sending` (loading), `sent`, `error` |
| **ChatInput** | `empty`, `typing`, `sending` (disabled), `error` |
| **QuickChips** | `visible` (belum ada chat), `hidden` (sudah ada chat) |
| **AiAgent** | `idle`, `loading`, `answering`, `error`, `rate_limited` |

---

## 16. GLOSARIUM

| Istilah | Definisi |
|---------|----------|
| **FAB** | Floating Action Button — tombol yang melayang di pojok layar |
| **Context-Aware** | Kemampuan AI untuk tahu halaman/data apa yang sedang dilihat user |
| **Quick Chips** | Tombol pertanyaan cepat yang bisa diklik (tanpa mengetik) |
| **RAG** | Retrieval-Augmented Generation — teknik menjawab dengan data lokal |
| **Token** | Unit pengukuran untuk input/output AI API |
| **Gemini Flash** | Model AI Google yang cepat dan murah, gratis untuk pemakaian tertentu |
| **Groq** | Provider AI dengan kecepatan super cepat dan harga murah |

---

*PRD ini dibuat berdasarkan hasil riset mendalam terhadap aplikasi LPJ BOS/BOSP, pain point operator sekolah, dan studi implementasi AI assistant di aplikasi administrasi.*

*Draft v1 — 17 Juli 2026*
