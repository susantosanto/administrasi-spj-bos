# RENCANA KERJA — Menyusun PRD Migrasi ke Electron + SQLite

> **Status:** rencana (belum PRD, belum coding)
> **Tanggal:** 2026-10-24
> **Sprint:** 021 (rencana)
> **Pemilik keputusan:** user
> **Dokumen ini menjawab:** "apa saja yang harus disiapkan dan ditulis agar PRD migrasi Electron + SQLite lengkap, akurat, dan bisa langsung dieksekusi?"

---

## 0. Cara Memakai Dokumen Ini

Dokumen ini **bukan PRD**. Ini adalah **cetak biru untuk menulis PRD**.

Urutannya:

```
[RENCANA INI]  →  [PRD.MD]  →  [REQUIREMENTS.MD]  →  [BLUEPRINT.MD]
               →  [ACCEPTANCE.MD]  →  [HANDOFF-PROMPT.MD]  →  coding
```

Aturan proyek tetap berlaku: **tidak ada coding sebelum PRD + pack disetujui user.**

Yang perlu dilakukan user setelah membaca dokumen ini:
1. Jawab **12 pertanyaan** di Bagian 11 (boleh pakai rekomendasi default).
2. Setujui rencana ini.
3. Baru PRD ditulis (estimasi 1–2 hari kerja).

---

## 1. Ringkasan Satu Halaman

**Apa yang dibangun:** aplikasi desktop Windows untuk satu sekolah, berisi React yang **sudah ada** + database SQLite, dibungkus Electron.

**Apa yang tidak dibangun di rilis pertama:**
- server/cloud, akun online, multi-tenant;
- sinkronisasi antar komputer;
- aplikasi Android/iOS;
- dasbor dinas yang memantau 700 sekolah dari pusat.

**Prinsip migrasi (penting):**
> **Tampilan dan aturan bisnis tidak diubah. Yang diganti hanya dua hal: (1) tempat menyimpan data, (2) cara aplikasi dibuka.**

**Keputusan user yang mengubah rencana sebelumnya (2026-10-24):**
> **Tidak ada impor/ekspor data dari MVP.** Data produksi diisi ulang lewat fitur yang sudah ada (upload data sekolah, upload BKU Excel/PDF, input dokumen). Data MVP dianggap **sekali pakai**.

**Konsekuensi keputusan itu (bagus):**
- Tidak perlu membangun alat migrasi localStorage → SQLite.
- Tidak perlu memperbaiki tombol export MVP sebagai prasyarat.
- Skema database bisa dirancang bersih, tanpa kompromi mengikuti bentuk data lama.
- Waktu pengerjaan lebih pendek ±1 minggu.

**Konsekuensi yang harus disadari (jujur):**
- Semua isian manual di MVP **hilang** saat pindah: isi dokumen LPJ/PBJ, catatan, checklist kelengkapan, template surat kustom, foto yang hanya ada di browser.
- **Nomor surat yang sudah terpakai** tidak ikut. Perlu fitur "mulai penomoran dari nomor X" agar tidak terjadi duplikasi nomor surat resmi.
- Operator harus melakukan upload ulang di komputer produksi.

---

## 2. Keputusan yang Sudah Terkunci

| ID | Keputusan | Status | Dampak ke PRD |
|---|---|---|---|
| **K-01** | MVP = React tanpa Electron, data di `localStorage`, hanya untuk demo | Terkunci (user) | PRD tidak boleh memperlakukan MVP sebagai produksi |
| **K-02** | Produksi = Electron + React + SQLite | Terkunci (user) | Menentukan arsitektur & dependensi |
| **K-03** | Target 700 sekolah, 1 operator per sekolah, 1 instalasi per sekolah | Terkunci (user) | Menentukan model distribusi, backup, dukungan |
| **K-04** | **Tidak ada migrasi data dari MVP**; data masuk lewat upload/input yang ada | Terkunci (user, 2026-10-24) | PRD **tidak** memuat FR impor localStorage; PRD memuat FR "mulai dari kosong" + "setel nomor awal" |
| **K-05** | Provider AI masih dipertimbangkan | Terkunci (user) | AI ditulis sebagai modul opsional, bukan jalur kritis |
| **K-06** | Kode React dipertahankan (bukan tulis ulang) | Usulan, perlu konfirmasi | Menentukan strategi adapter & risiko regresi |
| **K-07** | Rilis 1 offline penuh (tanpa backend) | Usulan, perlu konfirmasi | Menentukan non-goals & mode gagal |
| **K-08** | Platform rilis 1 = Windows 64-bit | Usulan, perlu konfirmasi | Menentukan installer, code signing, path |

---

## 3. Ruang Lingkup Migrasi

### 3.1 In scope — wajib jalan di Electron

Berdasarkan inventaris nyata `src/` (153 berkas, 35.451 baris):

| No | Modul | Bukti/berkas | Catatan untuk PRD |
|---|---|---|---|
| 1 | Landing & Login | `pages/LandingPage.jsx`, `pages/LoginPage.jsx` | Login saat ini palsu (`spj_auth`); harus diputuskan |
| 2 | Dashboard | `pages/dashboard/DashboardHome.jsx` | Ringkasan & pintasan |
| 3 | Data Sekolah | `DataSekolahPage.jsx` (890) | Profil, logo, NPSN, alamat, kepsek |
| 4 | Pejabat Sekolah | `PejabatSekolahPage.jsx` (277) | Nama/NIP pejabat untuk TTD |
| 5 | Data Guru & Tendik | `DataGuruPage.jsx` (396) | Termasuk foto personel |
| 6 | Kas & Dokumen (BKU) | `BKUPage.jsx` (842), `BKUUploadPdf.jsx` | Upload Excel, upload PDF/OCR, daftar transaksi, sidebar detail |
| 7 | Dokumen LPJ | `DokumenSPJPage.jsx` (603) + `DetailDokumenLpj*` | Form per NoBukti, preview, cetak |
| 8 | Dokumen Kelengkapan | `DokumenKelengkapanPage.jsx` (2.122) | PBJ, invoice SIPLah, kas, pajak, checklist |
| 9 | Realisasi | `RealisasiPage.jsx` (132) | Ringkasan realisasi |
| 10 | Nomor Surat | `NomorSuratPage.jsx` (752) | Counter nomor, format surat |
| 11 | Template Surat | `TemplateSuratPage.jsx` (413) | Template kustom |
| 12 | Catatan | `NotesPage.jsx` (564) | Catatan bebas |
| 13 | Referensi Kode | `ReferensiKodePage.jsx` (306) | Data referensi kode rekening/kegiatan |
| 14 | Pengaturan | `PengaturanPage.jsx` (154) | Kertas, backup, akun AI |
| 15 | Cetak | `components/templates/*` | **35 kunci template** di `templateConfig.js` (bukan 13 — PRD wajib verifikasi daftar final) |
| 16 | AI (opsional) | `services/imageGenerator.js`, `services/puterAkun.js`, `components/dokumentasi/*` | Default nonaktif; kunci di main process |

### 3.2 Out of scope — rilis 1

| Hal | Alasan |
|---|---|
| Sinkronisasi dua komputer | Butuh protokol konflik; proyek terpisah |
| Aplikasi mobile / akses dari HP | Butuh server |
| Dasbor pusat 700 sekolah | Butuh backend & kebijakan data |
| Multi-tenant dalam satu instalasi | 1 instalasi = 1 sekolah (K-03) |
| Impor data MVP | Keputusan K-04 |
| Refactor besar file >300 baris | Bukan tujuan migrasi; risiko regresi |
| Perbaikan seluruh utang teknis | Dipisah ke sprint lain |

### 3.3 Fitur yang berubah perilakunya di Electron

| Fitur | Sekarang | Di Electron | Alasan |
|---|---|---|---|
| Login | `localStorage spj_auth` (palsu) | Perlu keputusan: tanpa login / PIN lokal | Tidak ada server; keamanan nyata berbeda |
| Simpan data | `localStorage` sinkron | SQLite via IPC (asinkron) | Perlu adapter + antrean tulis |
| Kunci AI | Di bundle (`VITE_*`) / Puter | Di main process / tetap Puter | Keamanan |
| Backup | Toast palsu | File nyata (zip/salinan DB) | Wajib untuk 700 sekolah |
| Buka file | `<input type=file>` browser | Dialog native + path file | Perilaku Electron |
| Cetak | `window.print()` browser | `webContents.print()` | Perlu uji 35 template |
| Update | Tidak ada | Auto-update | 700 instalasi |

---

## 4. Inventaris Baseline (angka yang harus masuk PRD)

Angka di bawah **diukur ulang 2026-10-24** dari folder `spj-frontend`:

| Metrik | Nilai | Implikasi |
|---|---|---|
| Berkas `.js/.jsx` di `src/` | **153** | Ukuran proyek |
| Baris kode | **35.451** | Perkiraan usaha migrasi |
| Berkas >300 baris | 31 (sebelumnya terukur; PRD wajib hitung ulang) | Risiko maintainability, bukan blocker |
| Halaman | 15 (`pages/` + `pages/dashboard/`) | Daftar uji regresi |
| Rute dashboard | 12 + 2 redirect + landing + login | Daftar uji navigasi |
| Kunci `localStorage` berprefix `spj_` | 41 | Dasar pemetaan tabel |
| Panggilan `localStorage.*` langsung | **45 di 17 berkas** | Titik yang harus diadaptasi |
| Pemanggil `storageHelper.set` yang memeriksa kegagalan | **0 dari 48** | Perlu perubahan kontrak error |
| `ErrorBoundary` | **0** | Wajib ditambah (SYS) |
| Unit test framework | **0** | Risiko regresi tinggi |
| Skrip oracle parser (`.mjs` di root) | **11** | Modal awal pengujian |
| `console.log/debug` | 21 (audit sebelumnya) | Harus dibersihkan untuk rilis |
| Kunci template cetak | **35** di `templateConfig.js` | Cakupan cetak sebenarnya |
| Ukuran bundle web | 1.518 kB (420 kB gzip) | Acuan startup Electron |
| Dependency produksi | 8 | Sedikit, bagus |

**Catatan penting untuk penulis PRD:** angka "13 template" di `AGENTS.MD` **tidak cocok** dengan isi `templateConfig.js` (35 kunci). PRD harus memuat daftar final dan menyatakan mana yang benar-benar dipakai, mana yang yatim, dan mana yang hanya kartu info.

### 4.1 Daftar rute (untuk matriks uji)

| Rute | Halaman |
|---|---|
| `/` | Landing |
| `/login` | Login |
| `/dashboard` | DashboardHome |
| `/dashboard/data-sekolah` | DataSekolahPage |
| `/dashboard/pejabat-sekolah` | PejabatSekolahPage |
| `/dashboard/data-guru` | DataGuruPage |
| `/dashboard/bku` | BKUPage |
| `/dashboard/dokumen-lpj` | DokumenSPJPage |
| `/dashboard/dokumen-kelengkapan` | DokumenKelengkapanPage |
| `/dashboard/realisasi` | RealisasiPage |
| `/dashboard/nomor-surat` | NomorSuratPage |
| `/dashboard/template-surat` | TemplateSuratPage |
| `/dashboard/catatan` | NotesPage |
| `/dashboard/kode-referensi` | ReferensiKodePage |
| `/dashboard/pengaturan` | PengaturanPage |
| `/dashboard/dokumen-spj` | redirect → dokumen-lpj |
| `/dashboard/dokumen-wajib` | redirect → dokumen-kelengkapan |

---

## 5. Kerangka PRD yang Akan Ditulis

> Ini bagian terpenting. Setiap bab di bawah memuat **pertanyaan yang wajib dijawab** agar PRD tidak setengah jadi.

### Bab 1 — Ringkasan Eksekutif
Harus menjawab:
- Apa produk ini dalam 3 kalimat?
- Siapa penggunanya dan berapa?
- Apa yang berubah dari versi sekarang?
- Apa ukuran keberhasilan rilis 1?

**Format:** maksimal 1 halaman. Tanpa jargon.

### Bab 2 — Latar Belakang & Masalah
Harus menjawab:
- Mengapa pindah dari web/localStorage ke desktop?
- Masalah konkret apa yang terjadi kalau tetap di localStorage? (kuota, data hilang, kunci AI, backup palsu)
- Mengapa Electron + SQLite, bukan cloud?
- Apa yang **tidak** diselesaikan oleh keputusan ini?

**Wajib memuat:** tabel "masalah → dampak → solusi di rilis 1 → yang masih tersisa".

### Bab 3 — Pengguna & Peran
Harus menjawab:
- Siapa saja yang memakai? (operator BOS, kepala sekolah, bendahara, pengawas?)
- Siapa yang menginstal? Siapa yang membackup?
- Apakah ada lebih dari satu pengguna di komputer yang sama?
- Apa yang terjadi saat operator berganti tugas?

**Output:** persona ringkas + tabel hak akses (jika ada login).

### Bab 4 — Lingkup & Non-Lingkup
Harus memuat:
- Daftar fitur in-scope (Bagian 3.1) dengan prioritas Must/Should/Could.
- Daftar out-of-scope (Bagian 3.2) dengan alasan.
- Daftar fitur yang **dipertahankan apa adanya** (untuk mencegah refactor tak perlu).

### Bab 5 — Alur Kerja Pengguna
Harus memuat minimal 6 alur:
1. **Instalasi pertama** → buka aplikasi → isi profil sekolah → upload logo.
2. **Upload BKU Excel** → verifikasi ringkasan → lihat daftar.
3. **Upload BKU PDF** → OCR/parse → koreksi → simpan.
4. **Isi dokumen LPJ** dari baris BKU → simpan → cetak.
5. **Dokumen PBJ + invoice SIPLah** → simpan → cetak.
6. **Backup rutin** → restore di komputer lain (skenario laptop rusak).

Setiap alur: langkah, layar, data yang dibuat, titik gagal, pesan error yang benar.

### Bab 6 — Kebutuhan Fungsional (FR)
**Format wajib per FR:**

| Field | Isi |
|---|---|
| ID | `FR-DAT-03` |
| Judul | Simpan profil sekolah |
| Deskripsi | ... |
| Aktor | Operator |
| Prasyarat | ... |
| Langkah utama | ... |
| Hasil | ... |
| Kasus gagal | ... |
| Prioritas | Must / Should / Could |
| Kriteria terima | Given/When/Then |

**Daftar FR awal (wajib dipecah/diperluas di PRD):**

#### Fondasi (FND)
- FND-01 Jendela aplikasi, ukuran minimum, posisi tersimpan
- FND-02 Satu instance saja (buka kedua kali → fokus jendela lama)
- FND-03 Menu aplikasi (File, Edit, Tampilan, Bantuan)
- FND-04 Lokasi folder data & database
- FND-05 Mode pengembangan vs produksi (devtools, log)
- FND-06 Layar muat + kegagalan start yang bisa dilaporkan

#### Data (DAT)
- DAT-01 Inisialisasi database (WAL, foreign keys, integrity check)
- DAT-02 Versi skema + migrasi berurutan + backup pra-migrasi
- DAT-03 Profil sekolah (CRUD + logo)
- DAT-04 Pejabat sekolah (CRUD + riwayat)
- DAT-05 Guru (CRUD + foto)
- DAT-06 Tendik (CRUD + foto)
- DAT-07 Foto personel & ruangan (simpan file, kompres, hapus)
- DAT-08 Upload BKU Excel (xlsx)
- DAT-09 Upload BKU PDF (pdfjs + OCR bila perlu)
- DAT-10 Daftar/filter/pencarian BKU
- DAT-11 Ringkasan BKU (total, saldo, balance, per bulan)
- DAT-12 Dokumen LPJ per NoBukti
- DAT-13 Dokumen PBJ per NoBukti (SIPLAH / NON-SIPLAH)
- DAT-14 Upload invoice SIPLah (PDF) + arsip
- DAT-15 Nomor surat + counter + setel nomor awal
- DAT-16 Template surat kustom
- DAT-17 Checklist kelengkapan dokumen
- DAT-18 Realisasi
- DAT-19 Kas & pajak manual
- DAT-20 Catatan
- DAT-21 Referensi kode (seed + pembaruan)
- DAT-22 Pengaturan aplikasi (kertas, preferensi)
- DAT-23 Penghapusan data + konfirmasi + undo (jika memungkinkan)
- DAT-24 Ekspor tabel ke Excel (jika fitur ini ada sekarang — PRD wajib cek)

#### Cetak (PRN)
- PRN-01 Render 35 template
- PRN-02 Ukuran A4/F4 + orientasi
- PRN-03 Preview sama dengan hasil cetak (parity)
- PRN-04 Dialog cetak Electron + pilih printer
- PRN-05 Kop surat + logo (sekolah/dinas/gugus)
- PRN-06 Halaman banyak + nomor halaman
- PRN-07 Cetak ke PDF

#### AI opsional (AI)
- AI-01 Abstraksi provider (Puter / API resmi / nonaktif)
- AI-02 Penyimpanan kunci di main process
- AI-03 Generate foto dokumentasi (jika diaktifkan)
- AI-04 Rotasi akun / batas kuota
- AI-05 Riwayat & cache hasil
- AI-06 Perilaku saat offline / kuota habis (fitur AI berhenti, form tetap jalan)

#### Sistem (SYS)
- SYS-01 Backup otomatis harian
- SYS-02 Backup sebelum update & sebelum migrasi
- SYS-03 Restore dari backup
- SYS-04 Ekspor arsip manual (zip) — untuk backup, bukan migrasi
- SYS-05 Auto-update
- SYS-06 Code signing
- SYS-07 Log file lokal
- SYS-08 Menu Diagnosa (zip log + info versi)
- SYS-09 ErrorBoundary + pemulihan setelah crash
- SYS-10 First-run / onboarding
- SYS-11 Uninstall: data diapakan?

#### Keamanan (SEC)
- SEC-01 Kunci akses lokal (PIN/password) atau tanpa kunci
- SEC-02 Enkripsi database (SQLCipher) — opsional
- SEC-03 Validasi IPC (whitelist perintah + skema input)
- SEC-04 CSP + `webPreferences` aman
- SEC-05 Tidak ada secret di renderer
- SEC-06 Audit log perubahan data penting

**Target jumlah FR final:** 50–60. Kalau lebih dari 70, PRD terlalu gemuk — pecah sprint.

### Bab 7 — Kebutuhan Data
Harus memuat:
- Diagram relasi (sederhana, bukan ERD penuh).
- Daftar tabel + kolom + tipe + constraint + index.
- Aturan: nominal `INTEGER`, tanggal `YYYY-MM-DD`, JSON hanya untuk isi form, foto = path file.
- Kunci unik: contoh `bku(periode_id, no_bukti, tanggal)`? — PRD wajib memutuskan (rawan duplikat karena satu NoBukti bisa dipakai beberapa baris).
- Strategi ID stabil untuk relasi dokumen → baris BKU.
- Kebijakan hapus: soft delete vs hard delete.
- Retensi data per tahun anggaran.
- Ukuran & pertumbuhan (teks vs foto).

**Tabel pemetaan wajib (draf awal — PRD memverifikasi satu per satu):**

| Kunci sekarang | Isi | Tujuan |
|---|---|---|
| `spj_data_sekolah` | Profil sekolah | `sekolah` (1 baris) |
| `spj_logo_sekolah`, `spj_logo_dinas`, `spj_logo_gugus`, `spj_logo_*` | Logo | `berkas` / kolom path di `sekolah` |
| `spj_bku_data` | Transaksi BKU + meta | `periode`, `bku`, `berkas` (file sumber) |
| `spj_kertas` | Pilihan A4/F4 | `pengaturan` |
| `spj_otomatis_snapshot` | Snapshot isian otomatis | `dokumen.data_json` (evaluasi: perlu disimpan?) |
| `spj_lpj_bku` | Dokumen LPJ per NoBukti | `dokumen` |
| `spj_dokumen_lpj` | Dokumen LPJ (format lain) | `dokumen` |
| `spj_draft_surat`, `spj_format_surat`, `spj_template_surat_settings`, `spj_surat_custom_formats` | Template & draft surat | `template_surat`, `pengaturan` |
| `spj_nomor_surat`, `spj_counter_surat` | Nomor terpakai + counter | `nomor_surat` (+ setelan nomor awal) |
| `spj_pbj_bku`, `spj_pbj_form` | Dokumen PBJ per NoBukti | `dokumen_pbj` |
| `spj_pbj_arsip`, `spj_pbj_invoices`, `spj_pbj_invoice_meta` | Arsip invoice SIPLah | `invoice`, `berkas` |
| `spj_pbj_mode`, `spj_pbj_keranjang_tolak` | Mode & keranjang | `pengaturan` |
| `spj_bukti_fisik`, `spj_dokumen_wajib` | Checklist | `checklist_dokumen` |
| `spj_realisasi` | Realisasi | `realisasi` |
| `spj_kas_form`, `spj_pajak_manual` | Kas & pajak | `kas_form`, `pajak_manual` |
| `spj_pejabat_riwayat` | Riwayat pejabat | `pejabat_riwayat` |
| `spj_dok_ai_items`, `spj_dok_ai_owner` | Hasil AI + foto owner | `dok_ai`, `berkas` |
| `personel_photos`, `ruangan_photos` | Foto (tanpa prefix `spj_`) | `berkas` (path) |
| `spj_puter_akun` | Token akun AI | **bukan DB** → `safeStorage` di main |
| `spj_auth`, `spj_auth_token`, `spj_auth_user` | Login palsu | **dibuang** → diganti SEC-01 |
| `spj_kode_referensi_update` | Versi data referensi | `meta_referensi` |
| `spj_guide_dismissed_*` | Preferensi panduan | `pengaturan` |
| `spj_seeded`, `spj_pendataan`, `spj_uploads`, `spj_workshop` | Data demo/legacy | **tidak dipindah** (verifikasi dulu apakah masih dipakai) |

### Bab 8 — Kebutuhan Non-Fungsional (NFR)
Target usulan (PRD wajib menyetujui angka final):

| Area | Target |
|---|---|
| Waktu buka aplikasi | ≤ 5 detik (dingin), ≤ 2 detik (hangat) |
| Simpan data | ≤ 100 ms untuk satu aksi |
| Buka 1.000 baris BKU | ≤ 300 ms |
| Preview cetak | ≤ 2 detik |
| RAM idle | ≤ 250 MB |
| Ukuran installer | ≤ 150 MB |
| Data 1 tahun (tanpa foto) | ≤ 5 MB |
| Data 1 tahun (dengan foto) | ≤ 200 MB |
| Crash-free session | ≥ 99,5% |
| Backup harian sukses | ≥ 99% |
| Kehilangan data saat listrik mati | 0 baris setengah jadi (transaksi + WAL) |
| Kompatibilitas | Windows 10 21H2+ dan Windows 11, 64-bit, RAM ≥ 4 GB |
| Cetak | 35 template, A4/F4, paritas preview = hasil |
| Aksesibilitas | Kontras AA, navigasi keyboard untuk form utama |

### Bab 9 — Arsitektur & Komponen
Harus memuat:
- Diagram: Renderer → Preload → Main → SQLite/foto/backup.
- Pembagian tanggung jawab per proses.
- Alur satu aksi (contoh: simpan dokumen) dari klik sampai commit.
- Strategi adapter `storageHelper`.
- Penanganan aset statis (logo, template, pdf worker, wasm Tesseract).
- Perbedaan mode web demo vs Electron (build flag).

### Bab 10 — Kontrak IPC
Harus memuat daftar perintah final, contoh:

```
app:info                 → versi, versi DB, path data
sekolah:get / save
guru:list / save / delete
tendik:list / save / delete
foto:list / save / delete / openFolder
bku:importExcel / importPdf / list / replace / clear
bku:summary
dokumen:list / get / save / delete
pbj:get / save
invoice:parse / import / list
nomorSurat:list / peek / consume / setStart
kelengkapan:get / save
kas:get / save
pajak:get / save
catatan:list / save / delete
referensi:get / update
pengaturan:get / set
backup:run / list / restore
update:check / install
log:read / diagnostic
ai:generate / status
print:preview / print
```

Setiap perintah: input, output, error code, otorisasi.

**Larangan:** satu perintah `executeSQL(sql)` — terlalu berbahaya.

### Bab 11 — Backup, Restore, Update, Migrasi
Harus menjawab:
- Kapan backup jalan? (saat buka, saat tutup, tiap X jam, sebelum update)
- Disimpan di mana? (folder lokal, folder cloud, keduanya)
- Berapa banyak salinan disimpan? (7 harian + 4 mingguan?)
- Bagaimana verifikasi backup valid? (integrity_check + ukuran + uji buka)
- Bagaimana prosedur restore yang aman? (backup dulu sebelum restore)
- Bagaimana update dikirim dan di-rollback?
- Bagaimana migrasi skema kalau update gagal di tengah?

**Aturan wajib:** backup sebelum migrasi; migrasi dalam transaksi; jika gagal → jalankan versi lama, jangan naikkan versi.

### Bab 12 — Keamanan & Privasi
Harus menjawab:
- Data sensitif apa yang disimpan? (nama guru, NIP, nominal, foto)
- Siapa yang boleh membuka file database?
- Apakah perlu enkripsi? (SQLCipher vs BitLocker)
- Bagaimana kunci AI disimpan? (`safeStorage`, bukan plaintext)
- Data apa yang boleh keluar ke internet? (AI, update, telemetri)
- Apakah ada telemetri? Default mati atau nyala?

### Bab 13 — Penanganan Error & Logging
Harus memuat:
- Klasifikasi error: input pengguna, file rusak, database, disk penuh, jaringan.
- Pesan bahasa manusia (contoh: "Penyimpanan penuh. Hapus foto lama atau pindahkan data.").
- Kapan error dilaporkan ke menu Diagnosa?
- Format log (tanggal, level, modul, pesan; tanpa data pribadi).
- Rotasi log (mis. 5 file × 2 MB).

### Bab 14 — Kriteria Penerimaan & Skenario Uji
Harus memuat matriks:

| Modul | Skenario | Otomatis? | Bukti |
|---|---|---|---|
| Instalasi | Install bersih di Win 10 & 11 | Manual | Screenshot + log |
| Data sekolah | Simpan, tutup, buka lagi | Otomatis | Query DB |
| BKU Excel | Upload file asli anonim | Otomatis (oracle) | Ringkasan sama |
| BKU PDF | Upload PDF asli | Otomatis/manual | Jumlah baris & total |
| Dokumen LPJ | Isi → simpan → cetak | Manual | PDF hasil |
| PBJ + invoice | Upload → arsip → cetak | Manual | PDF |
| Nomor surat | Pakai nomor → counter naik | Otomatis | DB |
| Backup | Jalankan → file ada → restore | Otomatis | Hash/isi |
| Update | Versi lama → update → data utuh | Manual | Log + DB |
| Cetak | 35 template | Manual | PDF |
| Listrik mati | Matikan saat simpan | Manual | DB tidak korup |

**Exit criteria migrasi:** semua Must lulus + tidak ada kehilangan data + cetak 35 template sesuai + backup/restore terbukti.

### Bab 15 — Rencana Rilis & Rollout 700
Harus menjawab:
- Berapa tahap rollout? (internal → 5 sekolah → 50 → 700)
- Siapa yang menginstal di sekolah?
- Bagaimana distribusi file? (Drive, flashdisk, server sekolah)
- Apa materi pelatihan? (1 halaman + video 5 menit)
- Bagaimana dukungan? (grup, menu diagnosa, remote)
- Kapan rilis dianggap stabil?

### Bab 16 — Risiko, Asumsi, Ketergantungan
Wajib memuat risiko teknis migrasi (lihat Bagian 9 dokumen ini) + asumsi (Windows, 1 operator, printer) + ketergantungan (Puter, GitHub Releases, sertifikat).

### Bab 17 — Pertanyaan Terbuka
Semua Q-01…Q-12 yang belum dijawab, dengan pemilik dan tenggat.

### Bab 18 — Lampiran
- Peta 41 kunci → tabel.
- Daftar 35 template.
- Daftar 17 rute.
- Daftar 45 panggilan `localStorage`.
- Daftar dependency + versi pinned.
- Glosarium.

---

## 6. Rencana Data (Bagian Paling Rawan)

### 6.1 Prinsip
1. **Tabel untuk yang dihitung; JSON untuk yang dicetak.**
2. **Uang = bilangan bulat rupiah.**
3. **Tanggal = teks `YYYY-MM-DD`.**
4. **Foto = file; database hanya menyimpan path.**
5. **Satu sekolah = satu database.** Tidak ada `school_id` di setiap tabel (kecuali nanti multi-sekolah).

### 6.2 Yang harus diputuskan PRD (jangan diasumsikan)
- Apakah satu Baris BKU boleh punya beberapa dokumen? (kemungkinan ya: LPJ + PBJ + dokumentasi)
- Apa identitas stabil baris BKU? (`row` dari parser bisa berubah saat upload ulang; `no_bukti + tanggal + nominal` bisa duplikat)
- Apakah upload ulang BKU mengganti semua (replace) atau menambah (append)? Perilaku sekarang harus didokumentasikan.
- Apakah dokumen yang sudah dibuat ikut terhapus saat BKU di-upload ulang?
- Apakah perlu riwayat perubahan (audit) untuk dokumen resmi?
- Apakah nomor surat boleh dipakai ulang setelah dokumen dihapus?

### 6.3 Draf tabel minimum (untuk PRD dikembangkan)

`schema.sql` (garis besar, bukan final):

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1 sekolah per instalasi
sekolah(id=1, npsn, nama, alamat, kabupaten, provinsi, kepsek, bendahara, logo_path, ...)
pejabat(id, jenis, nama, nip, pangkat, aktif)
guru(id, nip, nama, jabatan, golongan, aktif)
tendik(id, nip, nama, jabatan, aktif)
periode(id, tahun UNIQUE, aktif)
bku(id, periode_id, tanggal, no_bukti, uraian, kode_rekening, kode_kegiatan,
    debit, kredit, kategori, sumber, file_sumber_id, dibuat_pada)
dokumen(id, periode_id, bku_id NULL, jenis, nomor, status, data_json,
        dibuat_pada, diubah_pada)
dokumen_pbj(id, periode_id, bku_id, mode, data_json, dibuat_pada, diubah_pada)
invoice(id, periode_id, nomor, penyedia, grand_total, file_path, dibuat_pada)
berkas(id, entitas, entitas_id, jenis, path, ukuran, dibuat_pada)
nomor_surat(id, periode_id, kode, urut, dipakai, dokumen_id NULL)
checklist_dokumen(id, periode_id, bku_id NULL, kategori, item, selesai)
kas_form(id, periode_id, data_json)
pajak_manual(id, periode_id, data_json)
catatan(id, judul, isi, dibuat_pada, diubah_pada)
template_surat(id, nama, data_json)
referensi_kode(id, kode, uraian, jenis, versi)
pengaturan(kunci PRIMARY KEY, nilai)
log_aktivitas(id, waktu, aksi, entitas, entitas_id, keterangan)
meta(versi_skema, dibuat_pada, versi_aplikasi)
```

**Index minimum:** `bku(periode_id, tanggal)`, `bku(no_bukti)`, `bku(kode_rekening)`, `dokumen(periode_id, jenis, nomor)`, `berkas(entitas, entitas_id)`, `nomor_surat(periode_id, kode, urut)`.

### 6.4 Seed & data referensi
- `templateConfig.js`, `kategoriLpj.js`, `bkuKategori.js`, `spjRequirements.js` **tetap di kode** (bukan tabel) kecuali PRD memutuskan perlu bisa diedit pengguna.
- Data referensi kode: seed dari file saat first-run, update lewat versi referensi.
- Tidak ada data contoh di produksi (kecuali tombol "isi data contoh" yang eksplisit).

---

## 7. Rencana Adapter (agar 35 ribu baris tidak dirombak)

### 7.1 Masalah
`storageHelper` **sinkron**. SQLite lewat IPC **asinkron**.

### 7.2 Opsi

| Opsi | Cara | Kelebihan | Kekurangan |
|---|---|---|---|
| **A. Refactor penuh async** | Semua pemanggil jadi `await` | Paling benar | Menyentuh ratusan titik, risiko regresi besar |
| **B. Cache di memori + antrean tulis** | `get` dari memori, `set` ke memori + antrean | Perubahan kode minimal | Jendela kehilangan data ±300 ms |
| **C. Tetap localStorage di Electron** | Tidak pakai SQLite | Nol perubahan | Gagal total untuk tujuan migrasi |

**Rekomendasi:** **Opsi B** untuk rilis 1, dengan catatan:
- flush paksa saat aplikasi ditutup;
- flush segera untuk data "kritis" (dokumen, nomor surat);
- tampilkan status "menyimpan..." / "tersimpan" agar operator tenang;
- audit titik yang butuh data terbaru langsung dari DB.

PRD wajib menyetujui opsi ini.

### 7.3 Kontrak yang dipertahankan
```js
storageHelper.get(key, defaultValue)   // sinkron, dari cache
storageHelper.set(key, value)          // true/false; false = gagal
storageHelper.remove(key)
storageHelper.clear()
storageHelper.getAll()
```
**Perubahan penting:** `set` harus **benar-benar** mengembalikan `false` saat gagal dan pemanggil harus mulai memeriksanya (minimal 8 titik kritis).

---

## 8. Risiko Khusus Migrasi (wajib masuk Bab 16 PRD)

| # | Risiko | Dampak | Pencegahan |
|---|---|---|---|
| R-01 | Router `BrowserRouter` di `file://` gagal | Aplikasi putih | Ganti ke `HashRouter` di Electron, atau serve via custom protocol |
| R-02 | `pdfjs` worker tidak ditemukan di build Electron | Upload PDF mati | Uji jalur worker di build produksi; bundle sebagai aset |
| R-03 | `window.print()` tidak konsisten | Cetak salah | Pakai `webContents.print()`, uji 35 template |
| R-04 | `localStorage` masih dipakai di Electron | Dua sumber data | Blokir/alias ke adapter; jangan biarkan ada fallback diam-diam |
| R-05 | Puter.js butuh jaringan + popup | AI gagal di offline | AI opsional, error jelas, form tetap jalan |
| R-06 | Tesseract wasm diserve dari CDN | OCR mati offline | Bundle lokal |
| R-07 | Tidak ada unit test | Regresi senyap saat migrasi | Tambah oracle uji parser + uji modul kritis lebih dulu |
| R-08 | File 2.122 baris sulit diuji | Bug sulit dilacak | Jangan refactor saat migrasi; uji black-box |
| R-09 | Antivirus menandai installer | Sekolah tidak bisa instal | Code signing + uji di Windows Defender |
| R-10 | Path `%APPDATA%` vs folder exe | Data hilang saat update | Tetapkan lokasi data sejak awal, jangan pindah-pindah |
| R-11 | Nomor surat mulai dari nol | Duplikasi nomor resmi | Fitur "setel nomor awal" (DAT-15) |
| R-12 | Operator mengira data MVP ikut pindah | Kebingungan | Banner di MVP + pesan first-run di Electron |

---

## 9. Rencana Kerja Penulisan PRD

| Langkah | Aktivitas | Output | Estimasi |
|---|---|---|---|
| L-1 | Konfirmasi 12 pertanyaan (Bagian 11) | Jawaban tertulis | 0,5 hari |
| L-2 | Verifikasi inventaris: 41 kunci → pemakaian nyata; 35 template → mana yang hidup | Tabel lampiran | 0,5 hari |
| L-3 | Tulis Bab 1–5 (ringkasan, masalah, pengguna, lingkup, alur) | Draf PRD bagian 1 | 0,5 hari |
| L-4 | Tulis Bab 6 (FR lengkap 50–60 item) | Draf FR | 1 hari |
| L-5 | Tulis Bab 7–10 (data, NFR, arsitektur, IPC) | Draf teknis | 1 hari |
| L-6 | Tulis Bab 11–18 (backup, keamanan, error, uji, rilis, risiko, lampiran) | Draf lengkap | 0,5 hari |
| L-7 | Review konsistensi: setiap FR punya kriteria terima; setiap NFR terukur; tidak ada FR impor MVP | Checklist | 0,5 hari |
| L-8 | Persetujuan user | PRD disetujui | — |

**Total:** ±4 hari kerja (bisa dipercepat jika jawaban pertanyaan lengkap).

**Gate PRD (harus semua hijau):**
- [ ] Tidak ada FR impor/ekspor data MVP.
- [ ] Setiap FR punya ID, prioritas, dan kriteria terima.
- [ ] Setiap tabel punya kolom, tipe, constraint, index.
- [ ] Setiap perintah IPC punya input/output/error.
- [ ] Semua NFR punya angka.
- [ ] Semua keputusan user tercatat.
- [ ] Semua pertanyaan terbuka punya pemilik/tenggat.
- [ ] Tidak ada asumsi diam-diam.

---

## 10. Setelah PRD Disetujui

| Tahap | Dokumen | Isi |
|---|---|---|
| 1 | `REQUIREMENTS.MD` | FR/NFR dijabarkan jadi requirement bernomor + prioritas |
| 2 | `BLUEPRINT.MD` | Dependensi pinned (`electron`, `better-sqlite3`, `electron-builder`, `electron-updater`), struktur folder, urutan implementasi, gate |
| 3 | `ACCEPTANCE.MD` | Given/When/Then per FR, matriks uji, bukti yang diminta |
| 4 | `HANDOFF-PROMPT.MD` | Aturan dry-run-first, larangan, daftar file yang boleh/tidak boleh diubah |
| 5 | Coding | Hanya setelah pack disetujui |

**Catatan dependensi:** versi harus **pinned** dan dicek kompatibilitas dengan Electron yang dipilih (Node ABI untuk `better-sqlite3`). Blueprint wajib menyebut cara rebuild native module.

---

## 11. Pertanyaan yang Harus Dijawab Sebelum PRD

> Semua ada rekomendasi default. Cukup jawab "pakai default" atau ubah yang perlu.

| ID | Pertanyaan | Opsi | Rekomendasi |
|---|---|---|---|
| Q-01 | Sistem operasi target? | (a) Windows 10/11 64-bit, (b) + Mac, (c) + Linux | **a** |
| Q-02 | Apakah aplikasi desktop perlu login/PIN? | (a) tanpa login, (b) PIN lokal, (c) akun lokal | **a** untuk rilis 1 (1 PC = 1 operator); PIN menyusul |
| Q-03 | Lokasi database? | (a) `%APPDATA%`, (b) folder aplikasi, (c) bisa dipilih user | **a** (aman saat update) |
| Q-04 | Tujuan backup? | (a) folder lokal, (b) folder cloud, (c) keduanya | **c** |
| Q-05 | Enkripsi database? | (a) tidak dulu, (b) SQLCipher | **a** + sarankan BitLocker |
| Q-06 | Kanal update? | (a) GitHub Releases, (b) server sendiri, (c) manual | **a** |
| Q-07 | Sertifikat code signing? | (a) ya, (b) tidak | **a** jika ada anggaran; kalau tidak, terima peringatan |
| Q-08 | AI default? | (a) nonaktif, (b) aktif | **a** |
| Q-09 | Jumlah pengguna per PC? | (a) 1 operator, (b) operator + kepsek | **a** |
| Q-10 | Retensi data? | (a) semua tahun, (b) 5 tahun, (c) lain | **a** |
| Q-11 | Cetak: perlu pilihan F4? | (a) ya (sudah ada), (b) A4 saja | **a** |
| Q-12 | Apakah data MVP memang boleh ditinggalkan sepenuhnya (termasuk nomor surat dan catatan)? | (a) ya, mulai baru; (b) tidak, perlu catat manual | **a**, dengan fitur setel nomor awal |

---

## 12. Definisi Selesai untuk Tahap "Rencana PRD"

Dokumen ini dianggap selesai jika:
- [x] Keputusan user tercatat (termasuk koreksi: tanpa impor/ekspor MVP).
- [x] Ruang lingkup dan non-lingkup jelas.
- [x] Inventaris baseline terukur (bukan klaim).
- [x] Kerangka PRD 18 bab lengkap dengan pertanyaan wajib.
- [x] Daftar FR awal 50+ item.
- [x] Pemetaan data 41 kunci → tabel.
- [x] NFR berangka.
- [x] Risiko migrasi terdaftar.
- [x] Pertanyaan keputusan + rekomendasi.
- [ ] **Persetujuan user** ← langkah berikutnya.

---

## 13. Lampiran — Bukti Audit (2026-10-24)

```
src/ .js/.jsx        : 153 berkas, 35.451 baris
localStorage.*       : 45 panggilan di 17 berkas
storageHelper.set    : 48 pemanggilan, 0 memeriksa false
ErrorBoundary        : 0
Framework unit test  : 0 (11 skrip oracle .mjs di root)
templateConfig.js    : 35 kunci template, 1.262 baris
Kunci tanpa prefix   : personel_photos, ruangan_photos
                         (PersonelFotoTab.jsx:18-19,
                          DokumentasiAIGenerate.jsx:26-28)
Backup palsu         : PengaturanPage.jsx (toast saja)
Login palsu          : LoginPage.jsx → spj_auth
```

Perintah reproduksi:

```powershell
cd spj-frontend

# jumlah berkas & baris
$f = Get-ChildItem src -Recurse -Include *.js,*.jsx
$f.Count
($f | Get-Content | Measure-Object -Line).Lines

# localStorage langsung
$c = Get-ChildItem src -Recurse -Include *.js,*.jsx |
     Select-String -Pattern "localStorage\." -AllMatches
(($c | ForEach-Object { $_.Matches.Count }) | Measure-Object -Sum).Sum
($c | Select-Object -ExpandProperty Path -Unique).Count

# error boundary
(Get-ChildItem src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "ErrorBoundary").Count

# kunci template
Select-String -Path src\data\templateConfig.js -Pattern "^\s{2}[a-zA-Z0-9_]+:\s*\{"
```

---

## 14. Satu Paragraf Penutup

Migrasi ini **bukan** membangun aplikasi baru. Ini memindahkan aplikasi yang sudah bekerja ke lemari arsip yang benar (SQLite) dan membungkusnya jadi aplikasi desktop (Electron), tanpa mengubah tampilan dan aturan bisnis. Karena data MVP tidak perlu dibawa, pekerjaan menjadi lebih bersih: mulai dari database kosong, isi lewat upload yang sudah ada, dan tambahkan satu fitur kecil yang menyelamatkan hari — **setel nomor surat awal**. Yang menentukan berhasil-tidaknya bukan kode Electron-nya, melainkan **backup yang benar-benar bekerja dan terbukti bisa dipulihkan**.
