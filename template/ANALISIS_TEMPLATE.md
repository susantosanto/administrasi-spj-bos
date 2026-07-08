# 📋 Analisis Template Dokumen SPJ/LPJ

> **Lokasi:** `D:/project/spj-app/template/`
> **Tujuan:** Riset mendalam setiap template dokumen sebagai referensi implementasi aplikasi
> **Total:** 4 file (3 `.docx` + 1 `.xlsx`)

---

## Daftar Isi

1. [NOTULEN RAPAT.docx](#1-notulen-rapatdocx)
2. [Surat Tugas + SPPD_rapat ops_gugus_2026.docx](#2-surat-tugas--sppd_rapat-ops_gugus_2026docx)
3. [BUKU TAMU KEDINASAN.docx](#3-buku-tamu-kedinasandocx)
4. [Form. Honor_2026_SDN lebakleungsir.xlsx](#4-form-honor_2026_sdn-lebakleungsirxlsx)
5. [Kesimpulan & Mapping ke Aplikasi](#5-kesimpulan--mapping-ke-aplikasi)

---

## 1. NOTULEN RAPAT.docx

### 📝 Deskripsi
Template notulen rapat untuk mencatat jalannya pertemuan/rapat di sekolah.

### 🏗️ Struktur Dokumen

| Bagian | Konten |
|--------|--------|
| **Header** | PEMERINTAH KABUPATEN BANDUNG BARAT |
| **Identitas Sekolah** | SD NEGERI LEBAKLEUNGSIR + Alamat lengkap + Email |
| **Judul** | NOTULA RAPAT |
| **Info Rapat** | Hari, Tanggal, Waktu, Tempat, Acara, Pimpinan Rapat, Pembuka, Notulen, Peserta |
| **Isi Notulen** | Butir-butir pembahasan & kesimpulan (10+ poin) |
| **Signature** | Tabel 2 kolom: Pimpinan Rapat/Kepala Sekolah + Notulen |

### 📋 Field yang perlu diisi

| Field | Tipe | Contoh |
|-------|------|--------|
| Hari | string | KAMIS |
| Tanggal | date | 10 JULI 2025 |
| Waktu | string | 10.00 s.d 12.30 |
| Tempat | string | SD NEGERI LEBAKLEUNGSIR |
| Acara | string | Rapat Pembagian Tugas... |
| Pimpinan Rapat | string | WAHYUDIN, S.Pd.SD. |
| Pembuka | string | BADRUDDIN, S.Ag. |
| Notulen | string | DEWI ERMIRAWATI, S.Pd.Gr. |
| Peserta | string | 12 Orang (daftar Hadir terlampir) |
| Poin Pembahasan | array of text | 10+ poin kesimpulan rapat |
| TTD Pimpinan | string | Wahyudin, S.Pd.SD. + NIP |
| TTD Notulen | string | Dewi Ermirawati, S.Pd.Gr. + NIP |

### 🔑 Key Insights untuk Aplikasi
- Notulen menggunakan **data mentah** (free text) — sesuai revisi
- Butir pembahasan bersifat dinamis (jumlah tidak tetap)
- Format signature: 2 kolom (Pimpinan & Notulen)

---

## 2. Surat Tugas + SPPD_rapat ops_gugus_2026.docx

### 📝 Deskripsi
Dokumen gabungan yang terdiri dari **3 bagian** dalam 1 file:

1. **Surat Undangan Rapat** (dari Ketua Gugus)
2. **Surat Perintah Tugas** (dari Kepala Sekolah)
3. **Surat Perjalanan Dinas (SPD)** — format standar pemerintah

### 🏗️ Struktur Dokumen

#### Bagian 1: Surat Undangan Rapat (dari Gugus)

| Elemen | Detail |
|--------|--------|
| Pengirim | GUGUS KI HAJAR DEWANTARA |
| Alamat | Kp. Lembang Dano Desa Cipada |
| Kepada | Kepala Sekolah SD se-Gugus |
| Perihal | Undangan Rapat Operator |
| Isi | Ketua gugus mengundang Operator untuk Rapat Kerja Teknis |
| Info Acara | Hari, Tanggal, Pukul, Tempat |
| Tembusan | Pengawas Bina, Kepala SD Cipada |
| TTD | Ketua Gugus: WAHYUDIN, S.Pd.SD. |

#### Bagian 2: Surat Perintah Tugas (dari Sekolah)

| Elemen | Detail |
|--------|--------|
| Header | PEMERINTAH KABUPATEN BANDUNG BARAT / SD NEGERI LEBAKLEUNGSIR |
| Judul | SURAT PERINTAH TUGAS |
| Nomor | 400.3.7.6/018-SD/2026 |
| Pemberi Tugas | BADRUDDIN, S.Ag. — Kepala Sekolah |
| Yang Ditugaskan | RISNA MARSELA HARTINI — Operator Sekolah |
| Tujuan | Rapat Kerja Teknis Operator Tingkat Gugus |
| Waktu | Jumat, 8 Mei 2026, di SD Negeri Cipada |
| TTD | Kepala Sekolah: BADRUDDIN, S.Ag. |

#### Bagian 3: Surat Perjalanan Dinas (SPD)

Tabel standar SPD dengan 10 item:

| No | Item | Contoh |
|----|------|--------|
| 1 | Pengguna Anggaran | Kepala SD NEGERI LEBAKLEUNGSIR |
| 2 | Nama PNS | RISNA MARSELA HARTINI / - |
| 3 | Pangkat/Gol/Jabatan/Biaya | - / Operator / Gugus/Kecamatan |
| 4 | Maksud Perjalanan | Rapat Kerja Teknis Operator... |
| 5 | Alat Angkutan | Kendaraan darat |
| 6 | Tempat berangkat & tujuan | SDN LEBAKLEUNGSIR → SDN Cipada |
| 7 | Lamanya & tanggal | 1 hari, 8 Mei 2026 |
| 8 | Pengikut | (kosong) |
| 9 | Pembebanan Anggaran | BOS Reguler / 5.1.02.04.01.0003 |
| 10 | Keterangan lain | (kosong) |

### 🔑 Key Insights untuk Aplikasi
- **1 dokumen = 3 fungsi**: Undangan + Tugas + SPD
- Nomor surat mengikuti format: `400.3.7.6/{nomor_urut}/SD/tahun`
- Kode rekening BOS: `5.1.02.04.01.0003` untuk Perjalanan Dinas
- Ada kolom stempel/verifikasi keberangkatan & kepulangan
- Format SPD standar pemerintah (10 item tabel)

---

## 3. BUKU TAMU KEDINASAN.docx

### 📝 Deskripsi
Buku tamu untuk mencatat kunjungan kedinasan ke sekolah.

### 🏗️ Struktur Dokumen

#### Halaman Cover

| Elemen | Detail |
|--------|--------|
| Judul | BUKU TAMU / KEDINASAN |
| Sekolah | SD NEGERI LEBAKLEUNGSIR |
| Pemerintah | PEMERINTAH KABUPATEN BANDUNG BARAT / DINAS PENDIDIKAN |
| Alamat | Lengkap + Email |

#### Halaman Isi (Per-entry)

| Field | Tipe |
|-------|------|
| No. Urut | nomor |
| Hari/Tanggal | date |
| Ingin bertemu dengan | string (Kepala Sekolah/Guru/Tendik) |
| Tiba Pukul | time |
| Kembali Pukul | time |
| Tujuan | free text |
| Uraian Kegiatan/Temuan/Saran/Pesan | free text (14 baris) |

#### Tabel Tamu (6 baris)

| Kolom | Keterangan |
|-------|-----------|
| No. | Nomor urut |
| NAMA | Nama tamu |
| JABATAN | Jabatan tamu |
| ALAMAT KANTOR | Instansi asal |
| TANDA TANGAN | TTD tamu |

### 🔑 Key Insights untuk Aplikasi
- Ada 2 format: **per-entry** (dengan uraian detail) dan **tabel** (daftar tamu)
- Buku tamu kedinasan = untuk tamu dinas (bukan tamu umum)
- Ada field "Ingin bertemu dengan" — pilihan: Kepala Sekolah/Guru/Tendik
- Sesuai revisi: **mamin buku tamu** — masih perlu dikembangkan lebih lanjut

---

## 4. Form. Honor_2026_SDN lebakleungsir.xlsx

### 📝 Deskripsi
Workbook Excel komprehensif untuk pengelolaan honorarium, transport, upah, dan pulsa. Ini adalah **dokumen inti** yang menjadi referensi utama pembuatan aplikasi.

### 📊 11 Sheet (Tab)

| No | Sheet | Kegiatan | Kode Rekening |
|----|-------|----------|---------------|
| 1 | **Data** | Info sekolah, kepala sekolah, bendahara | — |
| 2 | **Honor_guru** | Pembayaran Honor Guru (GTT) | 5.1.02.02.01.0013 |
| 3 | **Honor_tendik** | Pembayaran Honor Tenaga Kependidikan | 5.1.02.02.01.0013 |
| 4 | **Honor_Perpus** | Pembayaran Honor Tenaga Perpustakaan | 5.1.02.02.01.0013 |
| 5 | **Honor_penjaga** | Pembayaran Honor Penjaga Sekolah | 5.1.02.02.01.0013 |
| 6 | **Transpor_bank** | Perjalanan Dinas ke Bank | 5.1.02.04.01.0003 |
| 7 | **Transpor_koordinasi** | Perjalanan Dinas Koordinasi | 5.1.02.04.01.0003 |
| 8 | **Transpor_rapat** | Perjalanan Dinas Rakernis Operator | 5.1.02.04.01.0003 |
| 9 | **Transpor_pendamping** | Perjalanan Dinas Pendamping TKA | 5.1.02.04.01.0003 |
| 10 | **Upah** | Upah Kerja Pemeliharaan Halaman | 5.1.02.02.01.0016 |
| 11 | **Pulsa** | Pengisian Pulsa Internet Operator | 5.1.02.02.01.0063 |

### 🏗️ Struktur Umum (setiap sheet)

```
BARIS 1:  JUDUL DOKUMEN (DAFTAR PENERIMA HONORARIUM/...)
BARIS 2:  BULAN TAHUN (BULAN JANUARI 2026)
BARIS 4-7: Info header:
           Nomor        : _______
           Nama Sekolah : SD NEGERI LEBAKLEUNGSIR
           Kecamatan    : Cikalongwetan
           Kabupaten    : Bandung Barat
           Program      : 07 Pengembangan Standar Pembiayaan
           Kegiatan     : Pembayaran Honor ...
           Kode Rekening: 5.1.02.02.01.0013
           Kode Penggunaan: 12

BARIS 9:   Header kolom (NO, NAMA, JABATAN, COST per komponen, JUMLAH, PPh 21, YANG DITERIMA, TTD)
BARIS 10:  Sub-header (breakdown per jenis: Guru, TAS/Operator, Pembina Ekskul)
BARIS 11+: Data penerima (1 baris per orang)
BARIS 17:  JUMLAH (total)
BARIS 19:  Tempat, Tanggal
BARIS 20:  Mengetahui/Menyetujui | Dibayar Lunas Tgl.
BARIS 21:  Kepala Sekolah,         | Bendahara BOS,
BARIS 27:  BADRUDDIN, S.Ag.        | DEDE GUNAWAN, S.Pd.
BARIS 28:  NIP. ...               | NIP. ...
```

### 🏗️ Struktur Detail per Kategori

#### Honor Guru (Sheet 2)
| Kolom | Field | Contoh |
|-------|-------|--------|
| A | NO | 1 |
| B | NAMA PTK | RACHMAWATI |
| D | NUPTK | 9563779680230043 |
| E | JABATAN | Guru Kelas |
| F | Cost - Guru | 650,000 |
| G | Cost - TAS/Operator | 250,000 |
| H | Cost - Pembina Ekskul | 100,000 |
| J | JUMLAH (Rp) | 1,000,000 |
| K | Gol. / Ruang | GTT |
| L | VOLUME | 1 |
| M | SATUAN | Bulan |
| N | PPh 21 | 0 |
| O | JUMLAH YANG DITERIMA | 1,000,000 |
| P | TANDA TANGAN | 1 |

> **Rumus:** Jumlah = Guru + TAS/Operator + Pembina Ekskul
> **PPh 21:** 0 (karena di bawah PTKP)
> **Jumlah Diterima:** Jumlah - PPh 21

#### Honor Tendik (Sheet 3)
| Kolom | Field |
|-------|-------|
| A | NO |
| B | NAMA PTK |
| D | JABATAN |
| E-H | Cost: TAS/Operator, Guru, Pembina Ekskul, Tenaga Perpustakaan |
| I | JUMLAH (Rp) |
| J | Gol. / Ruang |
| K | VOLUME |
| L | SATUAN |
| M | PPh 21 |
| N | JUMLAH YANG DITERIMA |
| O | TANDA TANGAN |

#### Honor Perpustakaan (Sheet 4)
| Kolom | Field |
|-------|-------|
| A | NO |
| B | NAMA PTK |
| D | JABATAN |
| E-H | Cost: Tenaga Perpustakaan, Pembina Ekskul, Guru, TAS/Operator |
| I | JUMLAH (Rp) |
| J | Gol. / Ruang (PTT) |
| K | VOLUME |
| L | SATUAN |
| M | PPh 21 |
| N | JUMLAH YANG DITERIMA |
| O | TANDA TANGAN |

Contoh: LINDAWATI — Tenaga Perpustakaan — Rp700,000

#### Honor Penjaga (Sheet 5)
| Kolom | Field |
|-------|-------|
| E-H | Cost: Penjaga, Guru, Pembina Ekskul, Tenaga Perpustakaan |

Contoh: USEP PUDIN — Penjaga Sekolah — Rp750,000

#### Transport Bank (Sheet 6)
| Kolom | Field | Contoh |
|-------|-------|--------|
| A | NO | 1 |
| B | NAMA PTK | DEDE GUNAWAN |
| D | JABATAN | Guru/Bendahara |
| E | Gol. / Ruang | III/b |
| F | VOL | 2 |
| G | SATUAN | Perjalanan |
| H | UNIT COST (Rp) | 75,000 |
| I | JUMLAH (Rp) | 150,000 |
| J | TANDA TANGAN | 1 |

> **Unit Cost:** Rp75,000/perjalanan
> **Jumlah:** Vol × Unit Cost

#### Transport Koordinasi (Sheet 7)
Struktur sama dengan Transport Bank.
Contoh: DEDE GUNAWAN — Bendahara — Rp150,000/perjalanan — Rp150,000

#### Transport Rapat (Sheet 8)
Struktur sama.
Contoh: RISNA MARSELA HARTINI — Operator — 2 perjalanan × Rp75,000 = Rp150,000

#### Transport Pendamping (Sheet 9)
Struktur sama.
Contoh: DEDE GUNAWAN — Guru Kelas — 2 perjalanan × Rp75,000 = Rp150,000

#### Upah (Sheet 10)
| Kolom | Field | Contoh |
|-------|-------|--------|
| A | NO | 1 |
| B | NAMA PTK | IMAN |
| D | JABATAN | Pekerja/Tukang |
| E | Gol. / Ruang | - |
| F | VOLUME | 3 |
| G | SATUAN | Hari |
| H | UNIT COST (Rp) | 125,000 |
| I | JUMLAH (Rp) | 375,000 |
| J | PPh 21 | 0 |
| K | JUMLAH YANG DITERIMA | 375,000 |
| L | TANDA TANGAN | 1 |

> **Upah:** Rp125,000/hari, dibayar per kehadiran
> **Sesuai revisi:** perlu checkbox akumulasi kehadiran

#### Pulsa (Sheet 11)
| Kolom | Field | Contoh |
|-------|-------|--------|
| A | NO | 1 |
| B | NAMA PTK | RISNA MARSELA HARTINI |
| D | JABATAN | Operator |
| E | NOMOR HP | +62 882-2908-8313 |
| F | VOL | 1 |
| G | SATUAN | Paket |
| H | UNIT COST (Rp) | 105,000 |
| I | JUMLAH (Rp) | 105,000 |
| J | TANDA TANGAN | 1 |

### 💰 Ringkasan Biaya

| Item | Biaya | Satuan |
|------|-------|--------|
| Honor Guru | Rp650,000 | Bulan |
| Honor TAS/Operator | Rp250,000 | Bulan |
| Honor Pembina Ekskul | Rp100,000 | Bulan |
| Honor Perpustakaan | Rp700,000 | Bulan |
| Honor Penjaga | Rp750,000 | Bulan |
| Transport | Rp75,000 | Perjalanan |
| Upah Kerja | Rp125,000 | Hari |
| Pulsa Internet | Rp105,000 | Bulan |

### 👥 Data SDN Lebakleungsir (dari Excel)

| Nama | Jabatan | NUPTK/NIP |
|------|---------|-----------|
| BADRUDDIN, S.Ag. | Kepala Sekolah | NIP. 197405082014121002 |
| DEDE GUNAWAN, S.Pd. | Guru/Bendahara | NIP. 198507172020121003 |
| RACHMAWATI | Guru Kelas | NUPTK 9563779680230043 |
| RISNA MARSELA HARTINI | Operator | - |
| LINDAWATI | Tenaga Perpustakaan | - |
| USEP PUDIN | Penjaga Sekolah | - |

---

## 5. Kesimpulan & Mapping ke Aplikasi

### Mapping Template ↔ Fitur Aplikasi

| Template | Sheet/Fungsi | Halaman Aplikasi | Kode Dokumen |
|----------|-------------|-------------------|--------------|
| Form. Honor → Honor_guru | Honor Guru | Dokumen SPJ → Honorarium | HON |
| Form. Honor → Honor_tendik | Honor Tendik | Dokumen SPJ → Honorarium | HON |
| Form. Honor → Honor_Perpus | Honor Perpus | Dokumen SPJ → Honorarium | HON |
| Form. Honor → Honor_penjaga | Honor Penjaga | Dokumen SPJ → Honorarium | HON |
| Form. Honor → Transpor_bank | Transport Bank | Dokumen SPJ → Perjalanan Dinas → Bank | PD |
| Form. Honor → Transpor_koordinasi | Transport Koordinasi | Dokumen SPJ → Perjalanan Dinas → Koordinasi | PD |
| Form. Honor → Transpor_rapat | Transport Rapat | Dokumen SPJ → Perjalanan Dinas → Rapat | PD |
| Form. Honor → Transpor_pendamping | Transport Pendamping | Dokumen SPJ → Perjalanan Dinas → Pendamping | PD |
| Form. Honor → Upah | Upah Kerja | Dokumen SPJ → Upah | — |
| Form. Honor → Pulsa | Pulsa Internet | (need to map) | — |
| Surat Tugas + SPPD | Surat Tugas + SPD | Dokumen SPJ → Perjalanan Dinas | PD |
| NOTULEN RAPAT | Notulen Rapat | Dokumen SPJ → Notulen | — |
| BUKU TAMU KEDINASAN | Buku Tamu | Dokumen SPJ → Mamin → Buku Tamu | — |

### Pola Template yang Konsisten

Setiap dokumen template mengikuti pola:

```
1. HEADER
   - Pemerintah Kabupaten Bandung Barat
   - Identitas Sekolah (Nama, Alamat, Email)

2. JUDUL DOKUMEN
   - Nama dokumen yang jelas (DAFTAR PENERIMA..., SURAT PERINTAH..., NOTULA...)
   - Nomor dokumen (untuk surat menyurat)

3. INFO HEADER
   - Bulan/Tahun
   - Program, Kegiatan, Kode Rekening, Kode Penggunaan (khusus keuangan)

4. TABEL DATA
   - Kolom: NO, NAMA, JABATAN, BESARAN (cost × volume = jumlah), PPh, YANG DITERIMA, TTD
   - Baris total (JUMLAH)

5. FOOTER / SIGNATURE
   - Tempat, Tanggal
   - Mengetahui/Menyetujui
   - Kepala Sekolah + Bendahara (atau pejabat terkait)
   - Nama jelas + NIP
```

### Struktur Data untuk API/Database

```js
const TEMPLATE_CONFIG = {
  sekolah_default: {
    nama: 'SD NEGERI LEBAKLEUNGSIR',
    kecamatan: 'Cikalongwetan',
    kabupaten: 'Bandung Barat',
    provinsi: 'Jawa Barat',
    kepala_sekolah: 'BADRUDDIN, S.Ag.',
    nip_kepsek: '197405082014121002',
    bendahara: 'DEDE GUNAWAN, S.Pd.',
    nip_bendahara: '198507172020121003',
    alamat: 'Kp. Lebakleungsir RT 02 RW 10, Desa Mekarjaya, Kec. Cikalongwetan, Kab. Bandung Barat 40556',
    email: 'sdn.lebakleungsir@gmail.com'
  },
  kode_rekening: {
    honor: '5.1.02.02.01.0013',
    transport: '5.1.02.04.01.0003',
    upah: '5.1.02.02.01.0016',
    pulsa: '5.1.02.02.01.0063'
  },
  format_nomor_surat: '400.3.7.6/{nomor_urut}/[kode]/[tahun]',
  biaya_default: {
    honor_guru: 650000,
    honor_operator: 250000,
    honor_ekskul: 100000,
    honor_perpus: 700000,
    honor_penjaga: 750000,
    transport: 75000,
    upah_harian: 125000,
    pulsa: 105000
  }
}
```
