# Arsitektur Aplikasi SPJ — Penjelasan Sederhana untuk Pemula

> Dokumen ini adalah versi mudah dari `docs/RESEARCH_ARSITEKTUR_4_SIFAT.MD`.
> Tujuan: dipahami tanpa latar belakang teknis.
> Keputusan yang dipakai (dari user, 2026-10-24):
> - **MVP/demo:** React JS, tanpa Electron, data sementara di `localStorage`
> - **Produksi:** Electron + React JS, database **SQLite**
> - **Provider AI generate dokumen:** masih dipertimbangkan
> - **Skala:** ±700 sekolah = ±700 operator BOS

---

## 1. Gambaran besar dalam satu paragraf

Aplikasi ini ibarat **buku kas + mesin cetak dokumen** untuk bendahara sekolah.
Sekarang bentuknya aplikasi web yang dibuka di browser. Data yang diisi tersimpan di
"lemari kecil" milik browser (namanya `localStorage`). Lemari itu praktis, tapi sempit
dan bisa hilang kalau browser dibersihkan. Untuk **demo**, cara ini wajar. Untuk **data
asli sekolah**, kita butuh lemari yang lebih aman: aplikasi desktop (Electron) dengan
database sendiri di laptop (SQLite).

---

## 2. Empat kata yang sering bikin bingung

| Istilah | Arti sederhana | Analogi |
|---|---|---|
| **Scalable** | Muat dipakai banyak orang | Meja yang bisa dilebarkan |
| **Reliable** | Tidak kehilangan data, tidak error sembarangan | Fotokopi arsip, jadi kalau satu hilang masih ada cadangan |
| **Available** | Bisa dibuka kapan saja, di mana saja | Kunci ganda: bisa lewat pintu depan atau belakang |
| **Maintainable** | Mudah dirawat dan dikembangkan | Gudang yang rapi, ada label, bukan tumpukan kardus |

Keempatnya bukan teori. Semuanya terasa langsung oleh operator:
data hilang = **reliable** gagal; aplikasi tidak bisa dibuka = **available** gagal;
fitur baru selalu merusak fitur lama = **maintainable** gagal.

---

## 3. Kondisi aplikasi sekarang (bahasa awam)

### Yang sudah bagus

1. **Cetak ada di komputer pengguna.** Dokumen dibuat di browser, bukan di server.
   Artinya beban terberat tidak ditanggung server siapa pun.
2. **Tampilan dan template sudah rapi.** 13 jenis dokumen sudah jadi.
3. **Bisa dipakai tanpa internet** (selama aplikasinya sudah terbuka), karena data ada di laptop.

### Yang masih bocor

| Masalah | Analogi | Akibat nyata |
|---|---|---|
| Data disimpan di `localStorage` | Menaruh arsip penting di laci meja | Browser dibersihkan / ganti laptop = **data hilang** |
| Tempatnya cuma ±5 MB | Laci kecil | Setelah ±62 foto, laci penuh; simpan berikutnya **gagal tanpa peringatan** |
| Tidak ada tombol "pulihkan" yang teruji | Ada kotak P3K, tapi belum pernah dicek isinya | Saat darurat, belum tentu bisa dipakai |
| Tidak ada penjaga error | Kalau listrik konslet, seluruh rumah mati | Satu bagian error = **layar putih total** |
| Tidak ada tes otomatis | Naik mobil tanpa rem cadangan | Fitur lama bisa rusak tanpa ada yang tahu |
| Password palsu | Pintu dengan gembok mainan | Siapa pun bisa masuk lewat "pintu belakang" |
| Kunci AI menempel di aplikasi | Menaruh kunci rumah di bawah keset | Bisa diambil orang lain dari file aplikasi |

**Kesimpulan:** untuk demo, aman. Untuk data sekolah sungguhan, **belum aman**.

---

## 4. MVP vs Produksi — bedanya apa?

| Aspek | MVP (demo) | Produksi |
|---|---|---|
| Bentuk | Web di browser | Aplikasi desktop (Electron) |
| Data | `localStorage` (sementara) | SQLite (file database di laptop) |
| Cocok untuk | Pameran, uji coba, presentasi | Data asli, dipakai harian |
| Risiko data hilang | Tinggi | Rendah (asal backup) |
| Kunci AI | Terlihat di file web | Disimpan di bagian aman aplikasi desktop |
| Install | Buka link | Install seperti aplikasi biasa |

**Pesan penting:** jangan pakai data sekolah asli di versi MVP. MVP untuk menunjukkan
"aplikasinya bisa apa", bukan untuk menyimpan arsip resmi.

---

## 5. Kenapa Electron + SQLite cocok untuk 700 sekolah

### 5.1 Skalanya kecil

700 sekolah × 1 operator = **700 pengguna**. Ini bukan beban besar.
Setiap sekolah memakai aplikasinya sendiri di laptopnya sendiri. Jadi:

- Tidak perlu server mahal.
- Tidak perlu database online.
- Tidak perlu biaya bulanan.
- Kalau satu sekolah error, sekolah lain tidak ikut terganggu.

Ini seperti **menjual 700 buku resep**, bukan membuka satu restoran yang melayani 700 orang sekaligus.

### 5.2 SQLite itu apa?

Bayangkan **satu file arsip ajaib**:

- Isinya tabel-tabel rapi (data sekolah, data guru, BKU, dokumen, nomor surat).
- Ukurannya kecil (data satu sekolah biasanya di bawah 10 MB).
- Bisa dibuka tanpa internet.
- Backup = **copy satu file**. Selesai.
- Jauh lebih aman daripada `localStorage` yang bisa dibersihkan browser.

### 5.3 Konsekuensi yang harus jujur diterima

| Kelebihan | Konsekuensi |
|---|---|
| Data milik sekolah sendiri | Kalau laptop rusak/hilang, data ikut hilang **kecuali ada backup** |
| Tidak butuh internet | Tidak bisa dibuka dari komputer lain secara langsung |
| Tidak ada biaya server | Update aplikasi harus didistribusikan ke tiap sekolah |

**Karena itu, backup bukan fitur tambahan — backup adalah bagian wajib dari produk.**

---

## 6. Empat sifat, diukur untuk 700 sekolah

### 6.1 Scalable — "muat banyak pengguna"

Untuk 700 sekolah: **sangat cukup**. Yang perlu dijaga bukan jumlah pengguna, tapi:

- jumlah **foto** per sekolah (paling cepat menghabiskan tempat),
- ukuran **BKU** per tahun (ribuan baris — SQLite sanggup),
- jumlah dokumen yang dibuat bersamaan saat cetak.

**Target realistis:** satu sekolah dengan 5 tahun data tetap terbuka di bawah 3 detik.

### 6.2 Reliable — "tidak kehilangan data"

Yang wajib ada:

1. **Backup otomatis** setiap kali aplikasi ditutup (simpan salinan file database).
2. **Simpan 7 salinan terakhir** (kalau file terbaru rusak, masih ada kemarin).
3. **Tombol "Pulihkan"** yang benar-benar diuji, bukan hanya dipajang.
4. **Peringatan jelas** kalau penyimpanan gagal — jangan diam-diam.
5. **Layar error yang ramah** ("terjadi masalah, data Anda aman, coba muat ulang") — bukan layar putih.
6. **Catatan perubahan** (siapa mengubah dokumen apa dan kapan) untuk dokumen resmi.

**Target:** kehilangan data maksimal = 1 hari kerja (kalau backup harian), dan bisa dipulihkan dalam 1 jam.

### 6.3 Available — "bisa dibuka kapan saja"

Electron bagus untuk **offline**: tidak butuh internet.
Tapi "bisa dibuka di mana saja" ada batasnya: aplikasi ada di laptop tertentu.

Solusi bertingkat, pilih sesuai kebutuhan:

| Tingkat | Cara | Kerumitan |
|---|---|---|
| 1 (wajib) | Backup otomatis + salinan ke flashdisk/Google Drive | Mudah |
| 2 (opsional) | Folder database disimpan di OneDrive/Google Drive | Sedang |
| 3 (nanti) | Sinkronisasi antar komputer lewat server kecil | Sulit, baru jika benar-benar perlu |

Untuk 700 sekolah dengan 1 operator masing-masing, **tingkat 1 sudah memadai**.

### 6.4 Maintainable — "mudah dirawat"

Masalah hari ini: beberapa file terlalu besar (ada yang 2.081 baris), tidak ada tes otomatis,
dan tidak ada pemeriksa gaya kode. Akibatnya, setiap perubahan berisiko merusak yang lain.

Yang perlu dilakukan, urut dari paling besar manfaatnya:

1. **Tes otomatis untuk bagian hitung-menghitung** (BKU, honor, nomor surat).
   Ini seperti rem cadangan — murah dibuat, mahal kalau tidak ada.
2. **Pemecah file raksasa** jadi bagian-bagian kecil yang jelas tugasnya.
3. **Pemeriksa kode otomatis** (ESLint/Prettier) supaya rapi tanpa mengandalkan ingatan.
4. **Satu pintu untuk data** — semua baca/tulis lewat satu tempat, supaya nanti mudah pindah dari `localStorage` ke SQLite.
5. **Catatan keputusan** singkat, supaya 6 bulan lagi tidak lupa kenapa dulu memilih begini.

---

## 7. Rencana sederhana menuju produksi

### Tahap 1 — Rapikan MVP (1–2 minggu)

Tujuan: demo tidak memalukan dan tidak menghilangkan data.

- [ ] Tambah "penjaga error" supaya tidak layar putih.
- [ ] Tambah tombol ekspor data (cadangan) yang mudah.
- [ ] Beri peringatan kalau penyimpanan hampir penuh.
- [ ] Pindahkan foto ke tempat yang lebih lega (IndexedDB) agar tidak cepat penuh.
- [ ] Beri tanda versi data, supaya nanti mudah dipindah ke SQLite.

### Tahap 2 — Siapkan fondasi produksi (2–3 minggu)

- [ ] Buat struktur data SQLite: sekolah, pengguna, BKU, dokumen, foto, nomor surat, catatan perubahan.
- [ ] Buat lapisan data tunggal: aplikasi tidak lagi memanggil `localStorage` langsung.
- [ ] Buat alat migrasi: data demo/`localStorage` → SQLite (dengan uji coba dan pembanding).
- [ ] Tambah tes otomatis untuk parser dan perhitungan.

### Tahap 3 — Electron (3–4 minggu)

- [ ] Bungkus aplikasi React yang sudah ada ke Electron.
- [ ] Pindahkan database ke SQLite di laptop.
- [ ] Simpan kunci AI di bagian aman Electron (bukan di tampilan).
- [ ] Backup otomatis + tombol pulihkan yang diuji.
- [ ] Pembaruan aplikasi (update) yang aman.

### Tahap 4 — Uji lapangan (2–4 minggu)

- [ ] Uji di 3–5 sekolah sungguhan.
- [ ] Ukur: waktu buka, waktu cetak, jumlah data, apakah ada data hilang.
- [ ] Perbaiki, lalu gelar ke 700 sekolah bertahap.

---

## 8. Provider AI — posisi yang aman

Karena provider masih dipertimbangkan, aturannya sederhana:

1. **AI tidak boleh jadi jalan satu-satunya.** Semua dokumen harus tetap bisa dibuat manual.
2. **Kunci AI tidak boleh ada di tampilan/web.** Di Electron, simpan di bagian utama aplikasi.
3. **Beri batas pemakaian** per sekolah, supaya biaya tidak meledak.
4. **Beri tahu pengguna** kalau hasil AI hanya alat bantu dan wajib diperiksa.
5. **Siapkan pilihan cadangan** (provider lain) supaya kalau satu mati, fitur tidak ikut mati.

---

## 9. Apa yang TIDAK perlu dilakukan sekarang

- Tidak perlu server cloud.
- Tidak perlu microservices.
- Tidak perlu Kubernetes.
- Tidak perlu login online.
- Tidak perlu sinkronisasi antar sekolah.
- Tidak perlu multi-bahasa.
- Tidak perlu aplikasi mobile.

Semua itu menambah kerumitan tanpa menambah manfaat untuk 700 sekolah.

---

## 10. Ringkasan satu halaman

| Pertanyaan | Jawaban singkat |
|---|---|
| Apakah React + `localStorage` cukup untuk demo? | **Ya**, tapi jangan untuk data asli |
| Apakah Electron + SQLite cocok untuk produksi? | **Ya**, untuk 700 sekolah dengan 1 operator per sekolah |
| Apakah perlu server? | **Tidak** untuk sekarang |
| Risiko terbesar? | **Data hilang** kalau tidak ada backup |
| Fitur paling penting yang belum ada? | **Backup + pulihkan yang teruji** |
| Berapa pengguna yang harus ditangani? | 700 (kecil; fokus ke keamanan data, bukan beban server) |
| Apa langkah pertama? | Rapikan MVP: penjaga error, ekspor data, peringatan penyimpanan |

---

## 11. Kamus istilah

| Istilah | Arti |
|---|---|
| **React** | Pustaka untuk membuat tampilan aplikasi |
| **Electron** | Pembungkus agar aplikasi web menjadi aplikasi desktop |
| **SQLite** | Database kecil berbentuk satu file |
| **localStorage** | Tempat simpan sementara di browser (kecil, mudah hilang) |
| **IndexedDB** | Tempat simpan di browser yang lebih besar (untuk foto) |
| **Backup** | Salinan cadangan |
| **Restore** | Mengembalikan data dari salinan |
| **Migrasi** | Memindahkan data dari tempat lama ke tempat baru |
| **Provider AI** | Perusahaan/layanan yang menyediakan AI |
| **Error** | Kesalahan yang membuat aplikasi berhenti bekerja |

---

*Dokumen ini untuk memahami. Untuk detail teknis, lihat `docs/RESEARCH_ARSITEKTUR_4_SIFAT.MD`.*
