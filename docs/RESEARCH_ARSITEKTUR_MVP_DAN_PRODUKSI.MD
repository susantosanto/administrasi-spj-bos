# RISET — Dari Demo ke Produksi: Arsitektur SPJ untuk 700 Sekolah

> Tanggal: 2026-10-24 · Status: **riset, bukan spesifikasi**
> Ditulis dengan bahasa sederhana. Bagian teknis tetap ada, tetapi setiap bagian dimulai dengan penjelasan awam.
> **Keputusan yang dipakai sebagai dasar dokumen ini (dari user):**
> 1. **MVP**: ReactJS saja, tanpa Electron, data sementara di `localStorage` (untuk demo).
> 2. **Produksi**: Electron + ReactJS, database SQLite.
> 3. **Provider AI** untuk generate dokumen/foto: masih dipertimbangkan.
> 4. **Pengguna**: ±700 sekolah = ±700 operator BOS (1 operator per sekolah).
>
> Catatan: dokumen riset sebelumnya (`docs/RESEARCH_ARSITEKTUR_4_SIFAT.MD`) menyarankan SaaS + cloud.
> Keputusan user di atas **menggantikan** arah itu. Dokumen lama tetap disimpan sebagai bahan jika
> suatu hari butuh akses lintas perangkat.
>
> **Koreksi 2026-10-24 (keputusan user):** **tidak ada impor/ekspor data dari MVP ke produksi.**
> Data produksi diisi ulang lewat fitur yang sudah ada (upload data sekolah, upload BKU Excel/PDF,
> input dokumen). Karena itu perbaikan tombol export MVP **bukan prasyarat migrasi**; catatan tentang
> backup di §3.2, §8, dan §12 dibaca dengan koreksi ini. Rencana penulisan PRD:
> `planning/sprints/sprint-021/PLANNING-PRD-MIGRASI-ELEKTRON-SQLITE.MD`.

---

## 0. Ringkasan untuk yang Belum Paham Teknis

### 0.1 Tiga kotak yang perlu dibedakan

Bayangkan aplikasi ini seperti **warung administrasi**:

| Istilah | Ibaratnya | Fungsinya |
|---|---|---|
| **ReactJS** | Etalase dan meja kerja warung | Tampilan yang dilihat operator: tombol, form, preview dokumen |
| **localStorage** | **Buku catatan sementara** di meja | Tempat menulis data di browser. Cepat, tapi tipis, mudah hilang, dan hanya ada di komputer itu |
| **SQLite** | **Lemari arsip besi** di belakang | Tempat menyimpan data permanen dalam satu file. Bisa besar, rapi, dan bisa dicadangkan |
| **Electron** | **Bangunan warung permanen** | Membungkus ReactJS menjadi aplikasi `.exe` yang bisa dibuka tanpa browser |
| **Backup** | **Fotokopi arsip** yang disimpan di tempat lain | Kalau lemari rusak, fotokopinya masih ada |

### 0.2 Inti masalahnya (satu kalimat)

**Aplikasi sekarang menyimpan data penting di "buku catatan sementara" yang hanya ada di satu browser, dan tombol cadangkan yang terlihat di menu ternyata belum benar-benar mencadangkan apa pun.**

### 0.3 Lima kesimpulan utama

1. **Untuk demo, MVP sekarang sudah cukup** — asalkan data yang dimasukkan bukan data asli yang tidak boleh hilang.
2. **Sebelum dipakai 700 sekolah, ada 3 hal yang wajib diperbaiki lebih dulu**: tombol backup yang benar-benar bekerja, peringatan saat penyimpanan penuh, dan penangkap error agar aplikasi tidak "layar putih".
3. **Electron + SQLite adalah pilihan yang masuk akal untuk 700 sekolah dengan 1 operator per sekolah.** Ini bukan aplikasi jutaan pengguna; ini 700 "mini-server" yang berdiri sendiri.
4. **Yang paling berbahaya di mode Electron bukan database-nya, tapi kehilangan komputer.** Kalau laptop rusak/hilang dan tidak ada backup, data sekolah hilang. Backup otomatis adalah fitur nomor satu, bukan pelengkap.
5. **AI sebaiknya dianggap "fitur tambahan", bukan jantung aplikasi.** Form dan cetak harus tetap 100% jalan tanpa AI.

---

## 1. Kamus Mini (biar tidak bingung)

| Istilah | Arti sederhana |
|---|---|
| **Browser** | Chrome/Edge yang dipakai membuka aplikasi sekarang |
| **localStorage** | Tempat simpan kecil di browser, batasnya sekitar 5 MB (kira-kira 60 foto kecil) |
| **SQLite** | Database berupa **satu file** di komputer, bisa menyimpan data sangat banyak |
| **Electron** | "Bungkus" agar aplikasi React bisa jadi aplikasi desktop (`.exe`) |
| **Main process** | Bagian "otak" aplikasi Electron yang boleh mengakses file dan database |
| **Renderer** | Bagian tampilan (React) yang **tidak boleh** langsung mengakses file |
| **IPC** | Jembatan pesan aman antara tampilan dan otak aplikasi |
| **Backup** | Salinan data untuk berjaga-jaga |
| **Restore** | Mengembalikan data dari salinan |
| **Migrasi** | Memindahkan data lama ke tempat baru tanpa merusak isinya |
| **WAL** | Mode penyimpanan SQLite yang lebih tahan mati listrik |
| **Code signing** | "Tanda tangan digital" agar Windows/antivirus tidak curiga aplikasi kita virus |
| **Auto-update** | Aplikasi bisa memperbarui dirinya sendiri |

---

## 2. Apa yang Sebenarnya Terjadi Saat Operator Memakai Aplikasi Sekarang

**Intinya:** semua pekerjaan terjadi di dalam browser operator. Tidak ada server. Komputer operator itulah "server"-nya.

Alur nyata (disederhanakan):

```
Operator buka aplikasi (Vite/React di browser)
        │
        ├─ Upload Excel BKU / Dapodik
        │      └─ dibaca oleh JavaScript di browser (xlsx)
        │
        ├─ Data disimpan ke localStorage (prefix spj_)
        │      └─ hanya ada di browser itu, di komputer itu
        │
        ├─ Operator mengisi form dokumen
        │      └─ disimpan lagi ke localStorage
        │
        └─ Klik Cetak
               └─ browser merender dokumen A4 lalu window.print()
```

**Artinya:**
- Kalau browser di-*clear* (hapus riwayat/data situs) → data hilang.
- Kalau operator pindah komputer → data tidak ikut.
- Kalau operator membuka di HP → data tidak ada.
- Tidak ada "pusat" yang bisa menyelamatkan data kalau komputer rusak.

Ini bukan kesalahan React. Ini konsekuensi wajar dari aplikasi demo tanpa server. Yang penting: **jangan sampai operator mengira data demo ini aman.**

---

## 3. Kondisi Nyata MVP — Apa yang Sudah Bagus dan Apa yang Berbahaya

### 3.1 Yang sudah bagus (pertahankan)

| Hal | Kenapa bagus |
|---|---|
| Cetak dilakukan di browser | Tidak butuh server mahal; hasil langsung terlihat |
| Template berbasis config (13 template) | Menambah jenis dokumen tidak perlu membangun ulang aplikasi |
| Parser Excel/PDF berjalan lokal | File sekolah tidak dikirim ke mana-mana |
| Tampilan/desain konsisten | Operator tidak perlu belajar ulang tiap halaman |
| Data per sekolah kecil (teks ±110 KB) | Tidak butuh database raksasa; SQLite nanti sangat cukup |

### 3.2 Tujuh masalah nyata (dengan bukti)

#### Masalah 1 — Data hanya hidup di satu browser

- **Analogi:** menulis arsip sekolah di buku tulis yang disimpan di laci meja. Laci hilang = arsip hilang.
- **Bukti:** semua data disimpan lewat `localStorage` dengan awalan `spj_` (41 kunci).
- **Akibat:** ganti komputer, ganti browser, atau "clear browsing data" = data hilang.
- **Untuk MVP:** beri label jelas "MODE DEMO — data bisa hilang". Jangan pakai data asli yang tidak ada salinannya.

#### Masalah 2 — Tombol Backup & Restore belum benar-benar bekerja (temuan paling penting)

- **Bukti:** di `PengaturanPage.jsx`:
  - Tombol "Export Semua Data" hanya menampilkan pesan sukses (`toast.success`) — **tidak membuat file**.
  - Tombol "Import Data" hanya menampilkan "akan segera tersedia".
  - Tombol "Reset Semua Data" **tidak punya aksi** sama sekali.
  - Tombol "Export BKU Saja" juga hanya pesan "akan segera tersedia".
- **Akibat:** operator (dan kita) **tidak punya jalan resmi** untuk menyelamatkan data dari MVP. Ini juga membuat migrasi ke produksi nanti tidak punya bahan.
- **Untuk MVP:** sebaiknya diperbaiki agar demo tidak menipu. **Tetapi bukan prasyarat migrasi**, karena data MVP memang tidak dibawa ke produksi (keputusan user 2026-10-24).

#### Masalah 3 — Penyimpanan penuh, tetapi aplikasi diam saja

- **Bukti:** `storageHelper.set()` mengembalikan `false` kalau gagal (mis. kuota penuh), tetapi dari **48 tempat pemanggilan, tidak ada satu pun yang memeriksa** hasilnya.
- **Analogi:** kasir menekan tombol "simpan", mesin menolak, tapi layar tetap bilang "berhasil".
- **Akibat:** operator mengira sudah tersimpan, padahal belum. Ini bisa terjadi saat menyimpan foto.
- **Untuk MVP:** tampilkan peringatan keras jika penyimpanan gagal.

#### Masalah 4 — Data rusak dianggap "data kosong"

- **Bukti:** `storageHelper.get()` menangkap error dan mengembalikan nilai default. Data yang korup tidak pernah dilaporkan.
- **Akibat:** aplikasi terlihat normal dengan data kosong; kalau operator menyimpan lagi, data lama bisa tertimpa.
- **Untuk MVP:** minimal tampilkan tanda "data tidak terbaca" dan tawarkan pemulihan.

#### Masalah 5 — Satu error membuat seluruh aplikasi "layar putih"

- **Bukti:** tidak ada `ErrorBoundary` di seluruh `src/`.
- **Analogi:** satu lampu rusak membuat seluruh rumah mati listrik.
- **Akibat:** operator bingung, tidak tahu harus apa, dan bisa kehilangan pekerjaan yang belum disimpan.
- **Untuk MVP:** pasang penangkap error per halaman + tombol "muat ulang" dan "unduh data".

#### Masalah 6 — Login hanya formalitas

- **Bukti:** `LoginPage.jsx` hanya menulis `localStorage.setItem("spj_auth","true")`. Tidak ada password yang diperiksa, tidak ada server.
- **Akibat:** siapa pun yang bisa membuka komputer bisa masuk. Tidak ada pemisahan data antar sekolah.
- **Untuk MVP:** tidak masalah untuk demo, **tetapi jangan diklaim sebagai keamanan**. Di produksi, login harus benar (atau aplikasi desktop dikunci per komputer).

#### Masalah 7 — Dua kunci foto "lupa diberi awalan"

- **Bukti:** `PersonelFotoTab.jsx` dan `DokumentasiAIGenerate.jsx` menyimpan foto dengan kunci `personel_photos` dan `ruangan_photos` — **tanpa awalan `spj_`**.
- **Akibat:**
  - Fungsi "hapus semua data `spj_`" tidak menghapus foto ini.
  - Skrip migrasi yang mencari awalan `spj_` akan **melewatkan** foto ini.
  - Aturan proyek sendiri dilanggar (semua kunci wajib `spj_`).
- **Untuk MVP:** perbaiki nama kuncinya sekarang, sebelum ada data sungguhan.

#### Masalah 8 — Kunci AI bisa diambil siapa pun dari aplikasi

- **Bukti:** `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_GEMINI_API_KEY` ikut masuk ke file aplikasi. Di produksi, aplikasi bahkan memanggil provider langsung (melewati proxy).
- **Akibat:** orang bisa mencuri kunci dan memakai kuota/biaya kita.
- **Untuk MVP:** sadari risikonya; jangan pakai kunci berbayar besar.
- **Untuk produksi:** Electron menyelesaikan ini — kunci disimpan di "otak" aplikasi (main process), tidak pernah masuk tampilan.

---

## 4. Kalau 700 Sekolah Memakai MVP Apa yang Terjadi?

**Intinya:** dengan 1 operator per sekolah, 700 orang berarti 700 titik risiko. Satu kejadian kehilangan data sudah cukup untuk menghancurkan kepercayaan.

### 4.1 Hitungan sederhana

| Hal | Angka |
|---|---|
| Sekolah | 700 |
| Operator | 700 (1 per sekolah) |
| Data teks per sekolah/tahun | ±110 KB |
| Foto per sekolah/tahun (estimasi) | 30–100 MB |
| Kalau 5% operator kena masalah data/tahun | **35 sekolah** |
| Kalau 1 laptop rusak tanpa backup | **1 sekolah kehilangan seluruh riwayat** |

### 4.2 Empat hal yang pasti terjadi

1. **Ada yang menghapus data browser** (mis. "bersihkan komputer" oleh teknisi).
2. **Ada laptop rusak / hilang / kena virus.**
3. **Ada yang ingin membuka data dari komputer lain** (kepala sekolah, operator pengganti).
4. **Penyimpanan penuh** karena foto, lalu simpanan terakhir hilang tanpa pesan.

### 4.3 Kesimpulan untuk MVP

MVP **boleh** dipakai untuk:
- Demo ke dinas/kepala sekolah.
- Uji coba 1–5 sekolah dengan pendampingan.
- Pengumpulan masukan fitur.

MVP **jangan** dipakai untuk:
- Data resmi satu tahun anggaran tanpa salinan.
- Dipasang ke 700 sekolah tanpa pendampingan.
- Dijadikan dasar pencairan/pertanggungjawaban resmi.

---

## 5. Kenapa Electron + SQLite Masuk Akal untuk 700 Sekolah

### 5.1 Cara berpikir yang perlu diubah

Kalau mendengar "scalable", biasanya orang membayangkan server besar. Untuk kasus ini, **skalanya bukan jumlah request, tetapi jumlah instalasi**.

| Pertanyaan | Jawaban untuk 700 sekolah |
|---|---|
| Berapa pengguna bersamaan? | 1 orang per sekolah |
| Butuh server 24 jam? | Tidak |
| Butuh database online? | Tidak wajib |
| Yang bertambah saat sekolah bertambah? | Jumlah installer, update, dan dukungan |
| Biaya server | Rp 0 (kecuali server update/backup opsional) |

Artinya: **700 sekolah = 700 "mini-server" di laptop masing-masing.** Ini justru sederhana dan murah.

### 5.2 Keuntungan nyata Electron + SQLite

| Keuntungan | Penjelasan sederhana |
|---|---|
| Data permanen | Tersimpan di file, bukan di buku catatan browser |
| Tidak takut "clear browser" | Data tidak bergantung pada browser |
| Bisa offline penuh | Tidak butuh internet untuk mengisi dan mencetak |
| Backup mudah | Cukup salin 1 file database + folder foto |
| Kunci AI aman | Disimpan di "otak" aplikasi, bukan di tampilan |
| Performa | Data ratusan ribu baris tetap cepat |
| Distribusi | Satu installer `.exe`, klik dua kali |

### 5.3 Yang TIDAK diselesaikan Electron (jujur)

| Masalah | Tetap ada? | Solusi |
|---|---|---|
| Laptop rusak/hilang | **Ya** | Backup otomatis ke folder lain / cloud drive |
| Dua komputer ingin data sama | **Ya** | Ekspor–impor, atau sinkronisasi (proyek terpisah) |
| Kepala sekolah ingin lihat dari HP | **Ya** | Ekspor PDF/Excel, atau versi web terpisah |
| Update aplikasi di 700 komputer | **Ya** | Auto-update + server rilis |
| Dukungan pengguna | **Ya** | Panduan, menu diagnosa, grup bantuan |

**Kesimpulan:** Electron + SQLite adalah pilihan tepat **jika** requirement-nya "satu operator, satu komputer, offline". Kalau nanti requirement berubah menjadi "banyak perangkat melihat data yang sama", itu proyek sinkronisasi tersendiri, bukan sekadar tambah fitur.

---

## 6. Arsitektur Produksi yang Diusulkan (Sederhana)

```
┌────────────────────────── Satu komputer sekolah ──────────────────────────┐
│                                                                           │
│  ┌──────────────────────────┐        ┌───────────────────────────────┐    │
│  │  TAMPILAN (Renderer)     │        │  OTAK (Main Process)          │    │
│  │  ReactJS + Tailwind      │◄─IPC──►│  - akses file                 │    │
│  │  - form, tabel, preview  │        │  - database SQLite            │    │
│  │  - cetak A4              │        │  - panggilan AI (kunci aman)  │    │
│  │  - TIDAK akses file/DB   │        │  - backup otomatis            │    │
│  └──────────────────────────┘        └───────────────┬───────────────┘    │
│                                                       │                   │
│                                       ┌───────────────▼───────────────┐   │
│                                       │  FILE DATA                    │   │
│                                       │  spj.db (SQLite)              │   │
│                                       │  foto/  (gambar sebagai file) │   │
│                                       │  backup/ (salinan otomatis)   │   │
│                                       └───────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────────────┘
                                   │
                          (opsional)│ update & bantuan
                                   ▼
                    Server rilis aplikasi (GitHub Releases / VPS kecil)
```

### 6.1 Penjelasan tiap kotak

| Kotak | Tugas | Aturan penting |
|---|---|---|
| **Renderer (React)** | Menampilkan semua UI dan mencetak | Tidak boleh menyentuh file/database langsung |
| **Preload** | Jembatan aman | Hanya membuka fungsi yang memang perlu |
| **Main process** | Menyimpan data, mengelola file, memanggil AI, backup | Satu-satunya yang boleh menyentuh disk |
| **SQLite (`spj.db`)** | Menyimpan data terstruktur | Hidup di folder data aplikasi, bukan di folder Program Files |
| **Folder `foto/`** | Menyimpan gambar sebagai file | Jangan simpan gambar di dalam database |
| **Folder `backup/`** | Salinan otomatis | Minimal harian + sebelum update |
| **Server rilis** | Menyediakan installer/update | Boleh GitHub Releases (gratis) atau VPS kecil |

### 6.2 Aturan IPC yang aman

**Jangan** membuat satu perintah "jalankan SQL apa saja" dari tampilan. Itu sama seperti memberi kunci gudang kepada siapa pun yang bisa mengetik.

Yang benar: daftar perintah tetap, misalnya:
- `db:getBku(periode)`
- `db:simpanDokumen(dokumen)`
- `db:ambilDokumen(jenis, nomor)`
- `file:simpanFoto(buffer)`
- `backup:jalankanSekarang()`

Setiap perintah divalidasi di main process.

---

## 7. Database SQLite: Cara Menyimpan Data

### 7.1 Analogi

SQLite itu seperti **lemari arsip dengan laci berlabel**. Setiap laci = tabel. Setiap lembar = baris. Setiap kolom = kolom keterangan (tanggal, nomor, jumlah).

### 7.2 Prinsip: campur tabel dan JSON

Tidak semua data perlu dipecah menjadi puluhan tabel.

- **Data yang sering dihitung/difilter** (BKU, tanggal, nominal, kode rekening) → **tabel**.
- **Isi formulir dokumen yang bentuknya berbeda-beda per template** → **satu kolom JSON**.

Ini menjaga aplikasi tetap sederhana, tetapi laporan tetap cepat.

### 7.3 Tabel inti yang disarankan

| Tabel | Isi | Asal data sekarang |
|---|---|---|
| `sekolah` | Profil sekolah (1 baris) | `spj_data_sekolah` |
| `guru` | Daftar guru | `spj_data_guru` |
| `tendik` | Daftar tendik | `spj_data_tendik` |
| `periode` | Tahun anggaran | turunan dari BKU |
| `bku` | Satu baris transaksi BKU | `spj_bku_data.transactions` |
| `dokumen` | Dokumen LPJ/PBJ (jenis, nomor, isi JSON) | `spj_lpj_bku`, `spj_dokumen_lpj`, `spj_pbj_bku` |
| `berkas` | Daftar foto/lampiran (lokasi file) | `personel_photos`, `ruangan_photos`, `spj_dok_ai_items` |
| `nomor_surat` | Nomor surat yang sudah dipakai | `spj_nomor_surat`, `spj_counter_surat` |
| `pengaturan` | Pengaturan kecil (key–value) | `spj_kertas`, `spj_pbj_mode`, dll. |
| `ai_cache` | Cache jawaban AI (opsional) | cache di memori sekarang |
| `log_aktivitas` | Catatan siapa mengubah apa | belum ada |

### 7.4 Contoh skema sederhana

```sql
PRAGMA journal_mode = WAL;        -- lebih tahan mati listrik
PRAGMA foreign_keys = ON;

CREATE TABLE sekolah (
  id        INTEGER PRIMARY KEY CHECK (id = 1),  -- hanya 1 sekolah per instalasi
  npsn      TEXT,
  nama      TEXT NOT NULL,
  alamat    TEXT,
  kepsek    TEXT,
  bendahara TEXT
);

CREATE TABLE guru (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  nip       TEXT,
  nama      TEXT NOT NULL,
  jabatan   TEXT,
  golongan  TEXT,
  aktif     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE periode (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  tahun     INTEGER NOT NULL UNIQUE
);

CREATE TABLE bku (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_id    INTEGER NOT NULL REFERENCES periode(id),
  tanggal       TEXT NOT NULL,          -- format 'YYYY-MM-DD'
  no_bukti      TEXT,
  uraian        TEXT NOT NULL,
  kode_rekening TEXT,
  kode_kegiatan TEXT,
  debit         INTEGER NOT NULL DEFAULT 0,   -- rupiah bulat
  kredit        INTEGER NOT NULL DEFAULT 0,
  kategori      TEXT,
  sumber        TEXT
);
CREATE INDEX idx_bku_periode_tanggal ON bku(periode_id, tanggal);
CREATE INDEX idx_bku_no_bukti        ON bku(no_bukti);
CREATE INDEX idx_bku_kode            ON bku(kode_rekening);

CREATE TABLE dokumen (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_id  INTEGER NOT NULL REFERENCES periode(id),
  jenis       TEXT NOT NULL,            -- honor_guru, sppd, undangan_mamin, ...
  nomor       TEXT,
  status      TEXT NOT NULL DEFAULT 'draft',
  data_json   TEXT NOT NULL DEFAULT '{}',
  dibuat_pada TEXT NOT NULL,
  diubah_pada TEXT NOT NULL,
  UNIQUE (periode_id, jenis, nomor)
);

CREATE TABLE berkas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  dokumen_id INTEGER REFERENCES dokumen(id) ON DELETE CASCADE,
  jenis      TEXT,                      -- personel | ruangan | dokumentasi
  path       TEXT NOT NULL,             -- contoh: foto/personel/001.jpg
  ukuran     INTEGER,
  dibuat_pada TEXT NOT NULL
);

CREATE TABLE nomor_surat (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  periode_id INTEGER NOT NULL REFERENCES periode(id),
  kode       TEXT NOT NULL,             -- 400.3.7.6
  urut       INTEGER NOT NULL,
  dipakai    INTEGER NOT NULL DEFAULT 1,
  UNIQUE (periode_id, kode, urut)
);

CREATE TABLE pengaturan (
  kunci TEXT PRIMARY KEY,
  nilai TEXT
);

CREATE TABLE log_aktivitas (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  waktu      TEXT NOT NULL,
  aksi       TEXT NOT NULL,
  entitas    TEXT,
  entitas_id TEXT,
  keterangan TEXT
);
```

### 7.5 Tiga aturan penyimpanan yang mencegah masalah besar

1. **Uang disimpan sebagai bilangan bulat rupiah** (`INTEGER`), bukan desimal.
   - Kenapa: desimal bisa membulatkan aneh (Rp 1.000,999). Rupiah tidak butuh sen.
2. **Tanggal disimpan sebagai teks `YYYY-MM-DD`**.
   - Kenapa: mudah diurutkan, mudah dibaca, tidak tergantung zona waktu.
3. **Gambar tidak disimpan di database**, hanya **lokasi file**-nya.
   - Kenapa: database tetap kecil dan cepat; backup foto bisa dipisah.

### 7.6 Versi database dan migrasi

Setiap kali struktur database berubah, aplikasi harus bisa memperbarui database lama tanpa menghapus data.

Cara sederhana:
```sql
PRAGMA user_version;   -- angka versi skema
```
Saat aplikasi dibuka:
1. Baca `user_version`.
2. Jika lebih kecil dari versi aplikasi → jalankan migrasi berurutan.
3. Jika berhasil → naikkan `user_version`.
4. Jika gagal → **jangan** lanjut; tampilkan pesan dan minta backup dikirim ke pengembang.

**Aturan emas:** sebelum migrasi, **selalu** buat backup otomatis. Migrasi yang gagal tanpa backup adalah bencana.

---

## 8. Delapan Aturan Wajib Sebelum Dipasang di 700 Sekolah

### Aturan 1 — Backup tiga lapis, dan **uji restore**

- **Lapis 1:** otomatis setiap hari (salin `spj.db` + folder foto ke `backup/tanggal/`).
- **Lapis 2:** otomatis sebelum update aplikasi dan sebelum migrasi database.
- **Lapis 3:** manual "Ekspor Semua Data" ke satu file (zip) yang bisa disimpan di flashdisk/Google Drive.
- **Wajib:** sekali sebulan, coba pulihkan dari backup di komputer uji. Backup yang tidak pernah diuji bukan backup.

> **Jebakan:** jangan menaruh file `spj.db` yang **sedang dipakai** di folder yang disinkronkan otomatis (OneDrive/Dropbox). Sinkronisasi bisa menyalin file saat setengah tertulis dan merusaknya. Yang boleh disinkronkan adalah **hasil backup** (file zip), bukan database hidup.

### Aturan 2 — Foto disimpan sebagai file, bukan teks di database

- **Kenapa:** foto sebagai teks (base64) membuat database cepat besar dan lambat.
- **Cara:** simpan file di `foto/`, simpan nama file di tabel `berkas`.
- **Batas:** kompres foto ke lebar maksimal 1024–1600 px; simpan JPEG kualitas 80–85%.

### Aturan 3 — Simpan dengan transaksi dan WAL

- **Kenapa:** kalau listrik mati di tengah penyimpanan, data tidak setengah jadi.
- **Cara:** `PRAGMA journal_mode = WAL;` dan bungkus perubahan yang saling terkait dalam satu transaksi.

### Aturan 4 — Amankan Electron

| Setelan | Nilai | Alasan |
|---|---|---|
| `contextIsolation` | `true` | Tampilan tidak bisa menyentuh Node.js |
| `nodeIntegration` | `false` | Mencegah kode jahat di halaman |
| `sandbox` | `true` (jika memungkinkan) | Batasi akses |
| CSP | ketat | Cegah script asing |
| IPC | daftar perintah tetap + validasi | Cegah penyalahgunaan |
| `webSecurity` | jangan dimatikan | — |

### Aturan 5 — Kunci AI hanya di main process, dengan kuota

- Tampilan tidak pernah menerima kunci.
- Main process yang memanggil provider.
- Beri batas pemakaian per bulan + peringatan biaya.
- Kalau kuota habis: fitur AI berhenti, **form dan cetak tetap jalan**.

### Aturan 6 — Auto-update + tanda tangan kode + rollback

- Gunakan `electron-updater` (atau sejenis) dengan server rilis.
- **Tanda tangan kode** penting agar Windows tidak menampilkan peringatan "aplikasi tidak dikenal" — ini masalah kepercayaan besar untuk aplikasi sekolah.
- Sediakan versi sebelumnya untuk rollback jika update bermasalah.
- Update bertahap: 5 sekolah dulu, lalu 50, baru semua.

### Aturan 7 — Log lokal + menu "Diagnosa"

- Simpan log ke file (bukan hanya console).
- Menu "Diagnosa" menghasilkan satu file zip berisi: versi aplikasi, versi database, log terakhir, dan (opsional) data anonim.
- Ini memangkas waktu dukungan untuk 700 pengguna jarak jauh.

### Aturan 8 — Uji cetak 13 template **di Electron**

- Jangan berasumsi "di Chrome bagus berarti di Electron bagus".
- Cetak di Electron memakai Chromium yang sama, tetapi dialog print, margin, dan ukuran kertas bisa berbeda.
- Uji: A4 portrait/landscape, 13 template, 1 dan banyak halaman, printer fisik dan "Save as PDF".

---

## 9. 700 Sekolah: Distribusi, Dukungan, Lisensi

### 9.1 Distribusi

| Hal | Saran |
|---|---|
| Bentuk | Installer `.exe` (NSIS) |
| Ukuran wajar | 80–150 MB (Electron) |
| Cara kirim | Google Drive / flashdisk / server sekolah |
| Verifikasi | Sertakan checksum (SHA-256) agar file tidak rusak |
| Instalasi | Tanpa hak admin jika memungkinkan (folder pengguna) |
| Panduan | 1 halaman PDF + video 5 menit |

### 9.2 Dukungan 700 pengguna

| Kebutuhan | Saran |
|---|---|
| Pertanyaan berulang | FAQ + video + grup WhatsApp/Telegram |
| Masalah teknis | Menu Diagnosa (zip log) |
| Bantuan jarak jauh | AnyDesk/RustDesk (dengan izin) |
| Pemulihan data | Prosedur restore dari backup (harus diuji) |
| Jadwal rilis | 1 rilis stabil per bulan, hindari update saat masa sibuk laporan |

### 9.3 Lisensi (opsional)

Karena pengguna adalah sekolah negeri, pertimbangkan:
- **Gratis** untuk sekolah negeri (paling sederhana, minim gesekan).
- Atau lisensi sederhana per NPSN, file lisensi ditandatangani, berlaku 1 tahun.
- Hindari DRM rumit; 700 pengguna bukan pasar yang butuh proteksi berlebihan, dan dukungan akan lebih mahal daripada pembajakan.

### 9.4 Telemetri (opsional, hormati privasi)

Yang boleh dikirim (anonim): versi aplikasi, error, jumlah dokumen (angka saja).
Yang **tidak boleh**: nama guru, nominal, isi dokumen, foto.
Beri pilihan "izinkan kirim laporan error" saat instalasi.

---

## 10. Maintainable: Satu Kode, Dua Mode

**Intinya:** jangan membuat dua aplikasi terpisah (web dan Electron). Buat **satu** kode React, lalu ganti "tempat penyimpanan"-nya.

### 10.1 Pola adapter (penyesuai)

Sekarang semua kode memanggil `storageHelper`:

```
Komponen React  →  storageHelper  →  localStorage
```

Di Electron nanti:

```
Komponen React  →  storageHelper  →  jembatan IPC  →  SQLite
```

Kode React **tidak perlu diubah** kalau bentuk pemanggilannya tetap sama.

### 10.2 Tantangan: sekarang `storageHelper` sinkron, SQLite lewat IPC asinkron

Solusi yang paling sedikit mengubah kode:

1. Saat aplikasi dibuka, main process mengirim semua data ke tampilan → disimpan di memori.
2. `storageHelper.get()` membaca dari memori (tetap sinkron).
3. `storageHelper.set()` menulis ke memori **dan** memasukkan perubahan ke antrean simpan.
4. Antrean dikirim ke database secara berkala (mis. 300 ms) dan saat aplikasi ditutup.

**Konsekuensi jujur:** kalau aplikasi mati mendadak dalam 300 ms terakhir, perubahan terakhir bisa hilang. Mitigasi: flush lebih sering untuk data penting + WAL + backup.

Alternatif jangka panjang: ubah semua pemanggilan menjadi `await` (lebih benar, tetapi menyentuh banyak file). Untuk 700 pengguna dan 35 ribu baris kode, pendekatan adapter lebih realistis lebih dulu.

### 10.3 Struktur folder yang disarankan

```
spj-app/
├── electron/
│   ├── main.js          # jendela, lifecycle, updater
│   ├── preload.js       # jembatan IPC
│   ├── db/
│   │   ├── index.js     # buka DB, WAL, migrasi
│   │   ├── schema.sql
│   │   └── migrations/
│   ├── services/
│   │   ├── backup.js
│   │   ├── files.js     # simpan foto
│   │   └── ai.js        # panggilan AI (kunci di sini)
│   └── ipc/
│       └── handlers.js
├── src/                 # React (dipakai web demo & Electron)
│   ├── app/
│   ├── features/
│   ├── shared/storage/  # adapter: web → localStorage, electron → IPC
│   └── ...
└── package.json
```

### 10.4 Kualitas kode minimum

| Hal | Target |
|---|---|
| Test unit | Parser BKU, nomor surat, perhitungan honor (paling rawan salah) |
| Test cetak | 13 template, snapshot/visual |
| Lint + format | ESLint + Prettier, 0 error |
| Batas file | Komponen ≤ 300 baris; halaman ≤ 200 baris |
| Error boundary | Wajib ada di setiap rute |
| Log | Tidak ada `console.log` di rilis |

---

## 11. AI Masih Dipertimbangkan: Cara Memutuskan

### 11.1 Lima pertanyaan yang harus dijawab sebelum memilih provider

| Pertanyaan | Kenapa penting |
|---|---|
| **Kunci disimpan di mana?** | Kalau di tampilan, bisa dicuri. Harus di main process atau server |
| **Siapa yang membayar?** | Per gambar/per token; 700 sekolah bisa jadi biaya besar |
| **Data apa yang dikirim?** | Foto guru/siswa dan dokumen keuangan = data sensitif |
| **Butuh offline?** | Kalau sekolah tanpa internet, AI harus opsional |
| **Kualitasnya cukup?** | Foto dokumentasi palsu bisa menimbulkan masalah hukum/etika |

### 11.2 Pilihan yang ada

| Opsi | Kelebihan | Kekurangan | Cocok untuk |
|---|---|---|---|
| **Puter.js (sekarang)** | Tanpa kunci, gratis untuk pengguna, cepat dicoba | Kuota per akun, data ke pihak ketiga, kebijakan bisa berubah | Demo / uji coba |
| **API provider resmi (lewat main process)** | Kunci aman, kualitas terkontrol, bisa dihitung biayanya | Perlu akun + biaya + pemantauan | Produksi |
| **Model lokal (di komputer)** | Data tidak keluar, offline | Berat (RAM/GPU), kualitas foto terbatas | Sekolah tanpa internet, jika PC kuat |
| **Tanpa AI** | Paling aman dan murah | Tidak ada foto/notulen otomatis | Default produksi awal |

### 11.3 Rekomendasi

1. **Default produksi: AI nonaktif.** Form dan cetak tidak boleh bergantung pada AI.
2. **AI sebagai fitur opsional** yang bisa dinyalakan per sekolah, dengan kuota dan pemberitahuan biaya.
3. **Jangan pakai AI untuk membuat bukti foto kegiatan yang seolah-olah nyata.** Untuk dokumen resmi, foto asli lebih aman secara etika dan hukum. AI lebih tepat untuk: merapikan teks notulen, membuat draft surat, memberi saran format.
4. **Pisahkan "AI dokumen" dan "AI foto"** — keduanya punya risiko dan biaya berbeda.

---

## 12. Roadmap Sederhana (Realistis untuk 1 Pengembang)

| Tahap | Fokus | Perkiraan waktu | Hasil |
|---|---|---|---|
| **0. Perbaikan MVP** | Banner demo, kuota guard, error boundary, seragamkan kunci `spj_` (backup/export berguna untuk keamanan demo, **bukan** syarat migrasi) | 1 minggu | Demo jujur |
| **1. Kerangka Electron** | Electron shell, IPC aman, SQLite + migrasi, adapter storage | 2–3 minggu | Aplikasi desktop bisa dibuka, data pindah ke SQLite |
| **2. Pematangan produksi** | Foto sebagai file, backup otomatis, auto-update, code signing, log, uji cetak | 2–3 minggu | Siap dipasang di sekolah percontohan |
| **3. Uji coba terbatas** | 5–10 sekolah, kumpulkan masalah, perbaiki | 2–4 minggu | Daftar masalah nyata sebelum rollout |
| **4. Rollout 700** | Distribusi bertahap, pelatihan, dukungan | bertahap | 700 sekolah terpasang |

**Total realistis:** 7–11 minggu sebelum siap uji coba, belum termasuk rollout dan dukungan.

> Jangan lompat dari MVP langsung ke 700 sekolah. Uji di 5 sekolah dulu. Masalah yang muncul di 5 sekolah akan muncul 140× lebih besar di 700.

---

## 13. Risiko dan Keputusan yang Perlu Diambil

### 13.1 Risiko utama

| Risiko | Kemungkinan | Dampak | Pencegahan |
|---|---|---|---|
| Data hilang karena laptop rusak | Sedang | Sangat tinggi | Backup otomatis + uji restore |
| Operator salah menghapus data | Sedang | Tinggi | Konfirmasi, undo, backup |
| Update merusak database | Sedang | Tinggi | Migrasi + backup sebelum update + rollback |
| Antivirus memblokir aplikasi | Tinggi | Sedang | Code signing + lapor ke vendor antivirus |
| PC sekolah lambat (RAM 4 GB) | Sedang | Sedang | Uji di PC target; pertimbangkan Tauri jika parah |
| Cetak berbeda dari preview | Sedang | Tinggi | Uji 13 template di Electron + printer nyata |
| Kunci AI disalahgunakan | Sedang | Tinggi | Kunci di main + kuota + monitor |
| Dukungan 700 pengguna membengkak | Tinggi | Sedang | FAQ, video, menu diagnosa, grup bantuan |

### 13.2 Keputusan yang harus dijawab user

| ID | Pertanyaan | Pilihan |
|---|---|---|
| D-1 | Backup otomatis disimpan di mana? | (a) folder lokal, (b) folder cloud (Drive/OneDrive), (c) keduanya |
| D-2 | Apakah butuh akses data dari komputer lain? | (a) tidak (1 komputer), (b) ya lewat ekspor/impor, (c) ya lewat sinkronisasi |
| D-3 | Update aplikasi lewat mana? | (a) GitHub Releases, (b) server sendiri, (c) manual (flashdisk) |
| D-4 | Apakah membeli sertifikat code signing? | (a) ya, (b) tidak (terima peringatan Windows) |
| D-5 | AI default aktif atau nonaktif? | (a) nonaktif (disarankan), (b) aktif dengan kuota |
| D-6 | Lisensi aplikasi? | (a) gratis sekolah negeri, (b) lisensi per NPSN |
| D-7 | Data disimpan berapa lama? | (a) semua tahun, (b) 5 tahun, (c) lainnya |

---

## 14. Tanya-Jawab untuk Pemula

**T: Kalau laptop sekolah rusak, data hilang?**
J: Kalau tidak ada backup, ya. Karena itu backup otomatis adalah fitur wajib nomor satu. Dengan backup, data bisa dipulihkan di laptop pengganti.

**T: Bisa dipakai di dua komputer sekaligus?**
J: Tidak otomatis. Electron + SQLite menyimpan data di satu komputer. Untuk pindah, gunakan ekspor/impor. Sinkronisasi dua komputer adalah proyek tambahan.

**T: Kenapa tidak pakai cloud saja?**
J: Cloud butuh server, biaya bulanan, dan internet stabil. Untuk 700 sekolah dengan 1 operator, aplikasi desktop lebih murah dan tetap bisa dipakai saat internet mati. Cloud tetap berguna untuk backup.

**T: Apakah Electron berat?**
J: Installer sekitar 80–150 MB dan RAM sekitar 150–200 MB. Itu "pajak" Chromium, sama seperti VS Code atau WhatsApp Desktop. Untuk PC sekolah 4 GB masih jalan, tetapi harus diuji.

**T: Apakah SQLite aman?**
J: SQLite adalah file. Keamanannya tergantung komputer: kalau laptop dicuri dan tidak dienkripsi, file bisa dibuka. Untuk data sekolah, pertimbangkan enkripsi disk (BitLocker) atau enkripsi database.

**T: Kalau update aplikasi, data hilang?**
J: Tidak, kalau migrasi database benar dan backup sebelum update dijalankan. Itu sebabnya migrasi + backup adalah satu paket.

**T: Kalau listrik mati saat menyimpan?**
J: Dengan WAL dan transaksi, database tidak setengah jadi. Paling buruk kehilangan beberapa detik terakhir, bukan seluruh file.

**T: Apakah AI wajib?**
J: Tidak. Form dan cetak harus jalan tanpa AI. AI adalah fitur tambahan yang bisa dinyalakan belakangan.

**T: Apakah MVP sekarang bisa dipakai untuk data asli?**
J: Belum. Backup-nya belum bekerja, penyimpanan penuh tidak memberi peringatan, dan tidak ada penangkap error. Pakai untuk demo/simulasi saja.

---

## 15. Lampiran — Bukti dan Rujukan Kode

| Temuan | Lokasi |
|---|---|
| Backup/export hanya toast | `spj-frontend/src/pages/dashboard/PengaturanPage.jsx` (tab `backup`) |
| `storageHelper.set` gagal tanpa diperiksa | `src/utils/storageHelper.js`; 48 pemanggilan, 0 pemeriksaan |
| `get()` menelan error | `src/utils/storageHelper.js` |
| Tidak ada ErrorBoundary | grep `ErrorBoundary` di `src/` = 0 |
| Login palsu | `src/pages/LoginPage.jsx` (`spj_auth`) |
| Kunci AI di bundle | `src/utils/aiConfig.js` (`import.meta.env.VITE_*`) |
| Proxy produksi dilewati | `src/utils/aiConfig.js:429–447` |
| Foto memakai kunci tanpa `spj_` | `src/components/dokumentasi/PersonelFotoTab.jsx:18–19`, `DokumentasiAIGenerate.jsx:26–28` |
| 41 kunci `localStorage` | grep `spj_[a-z0-9_]+` |
| Ukuran data per sekolah ±110 KB | `docs/elektron/RESEARCH_ELECTRON_SQLITE_BERAT.md` §3.2 |
| Riset Electron sebelumnya | `docs/elektron/` (PRD, ROADMAP, RESEARCH) |

Perintah reproduksi:

```powershell
cd spj-frontend
npm run build

# kunci penyimpanan
Get-ChildItem src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "spj_[a-z0-9_]+" -AllMatches |
  ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# pemanggil yang memeriksa kegagalan simpan (hasil: 0)
(Get-ChildItem src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "if\s*\(\s*storageHelper\.set").Count

# error boundary (hasil: kosong)
Get-ChildItem src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "ErrorBoundary"

# kunci foto tanpa awalan
Get-ChildItem src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "personel_photos|ruangan_photos"
```

---

## 16. Penutup

1. **MVP sekarang = etalase yang bagus, gudang yang belum aman.** Untuk demo, cukup. Untuk data resmi, belum.
2. **Electron + SQLite cocok untuk 700 sekolah, 1 operator per sekolah, offline.** Ini bukan arsitektur untuk jutaan pengguna, dan tidak perlu.
3. **Tiga pekerjaan pertama yang memberi dampak terbesar:** backup yang benar + uji restore, penanganan penyimpanan penuh, dan penangkap error.
4. **AI ditunda atau dibuat opsional.** Jangan biarkan AI menjadi syarat agar aplikasi bisa dipakai.
5. **Satu kode, dua mode.** Web demo dan Electron produksi memakai React yang sama; hanya lapisan penyimpanan yang diganti.

*Dokumen ini riset. Tidak ada kode yang diubah. Implementasi wajib lewat architect pack + dry run.*
