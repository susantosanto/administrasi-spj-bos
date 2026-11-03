# PRD: Upload BKU PDF 3 Mode (Bulanan / Semester / Tahunan)

- Status: DRAFT (menunggu konfirmasi user)
- Tanggal: 2026-11-02
- Sumber: Idea Brief Upload BKU PDF Bulanan Akumulatif + keputusan user 2026-11-02
- File contoh: `template-data/bku-output-maret.pdf`, `template-data/bku-output-april.pdf`, `template-data/bku-output.pdf`

## 1. Overview

Halaman BKU hari ini punya satu perilaku upload PDF: setiap simpan **mengganti SELURUH `spj_bku_data`**
(`BKUUploadPdf.jsx` baris 186–209, satu tulis atomik). Akibatnya upload bulan kedua menghapus bulan pertama.

PRD ini menambah **pilihan mode saat klik tombol Upload PDF** (dropdown): **Bulanan**, **Semester**, **Tahunan**.
Mode Bulanan/Semester bersifat **akumulatif** (data bertambah per periode, terganti hanya periode yang diupload ulang).
Mode Tahunan bersifat **menggantikan semua** (seluruh data diganti isi PDF tahunan, termasuk menghapus akumulasi bulanan/semester sebelumnya).

Keputusan kunci user (2026-11-02, mengikat):
1. Upload ulang periode yang sama → **ganti periode itu saja**, periode lain utuh.
2. **Fitur koreksi manual (form input) pada upload PDF DIHAPUS** — upload langsung masuk tanpa form koreksi/preview-edit.
3. Pemilih mode = **dropdown pada tombol Upload PDF**, berisi 3 mode: Bulanan, Semester, Tahunan.

## 2. Goals & Objectives (SMART)

1. Upload Maret lalu April (mode Bulanan) → kedua bulan tampil; jumlah baris = baris Maret + baris April, nol baris hilang.
2. Urutan gabungan selalu kronologis tanggal walau urutan upload acak (April dulu baru Maret tetap tampil Maret→April).
3. Upload ulang Maret v2 → hanya data Maret berganti; April utuh; tidak ada duplikat.
4. Upload Tahunan setelah akumulasi 3 bulan → hanya isi PDF tahunan yang tampil.
5. Saldo berjalan gabungan cocok dengan kolom Saldo PDF per baris; total akhir cocok dengan baris Jumlah PDF (contoh Maret: 46.376.100 / 5.492.000 / 40.884.100).

## 3. Target Audience

- Bendahara/operator SDN Pasirhalang (1–2 orang, non-teknis): upload BKU tiap bulan dari ARKAS.
- Kepala sekolah: memeriksa BKU gabungan/rekap.

## 4. User Stories

1. **US-1 (Bulanan):** Sebagai bendahara, saya pilih mode Bulanan → pilih "Maret 2026" → upload `bku-output-maret.pdf` → data Maret masuk; lalu upload April → data April **bertambah**, Maret tetap ada, tampilan terurut Maret→April.
2. **US-2 (Ganti periode):** Sebagai bendahara, saya upload ulang PDF Maret revisi (mode Bulanan, Maret 2026) → data Maret **diganti** versi baru, April tidak berubah, tanpa duplikat.
3. **US-3 (Semester):** Sebagai bendahara, saya pilih mode Semester → pilih Semester + Tahun → upload 1 PDF semester → data semester itu masuk/diganti, semester lain utuh.
4. **US-4 (Tahunan):** Sebagai bendahara, setelah akumulasi beberapa bulan, saya pilih mode Tahunan → upload `bku-output.pdf` → **seluruh data lama hilang**, hanya isi PDF tahunan yang tampil.
5. **US-5 (Tanpa koreksi):** Sebagai bendahara, saya upload PDF → tidak ada form koreksi/preview-edit; data langsung tersimpan dan tampil.

## 5. Functional Requirements

### FR-1 Pemilih mode (dropdown pada tombol Upload PDF)
- Klik tombol Upload PDF → dropdown 3 pilihan: **BKU Per Bulan**, **BKU Per Semester**, **BKU Tahunan**.
- Mode Bulanan → wajib pilih Bulan + Tahun. Mode Semester → wajib pilih Semester (Ganjil/Genap, lihat asumsi A-4) + Tahun. Mode Tahunan → cukup Tahun (atau tanpa pemilih, ikut kop PDF).
- Desain visual dropdown = ranah tim UI; builder menyediakan perilaku + struktur minimal.

### FR-2 Mode Bulanan (akumulasi per bulan)
- Upload PDF bulan M → baris bulan M ditambahkan; jika bulan M sudah ada → **diganti seluruhnya** (idempotency per bulan+tahun).
- Bulan lain tidak tersentuh.

### FR-3 Mode Semester (akumulasi per semester)
- Sama seperti FR-2 dengan granularitas semester: upload semester S → semester S ditambah/diganti, semester lain utuh.
- Campuran bulan+semester dalam satu dataset: baris tetap digabung kronologis; penanda periode disimpan per baris (lihat FR-6).

### FR-4 Mode Tahunan (ganti semua)
- Upload PDF tahunan → **ganti SELURUH dataset** (perilaku hari ini dipertahankan untuk mode ini), termasuk menghapus akumulasi bulanan/semester.

### FR-5 Pengurutan
- Setiap selesai upload (semua mode): dataset gabungan **diurut kronologis tanggal** (lalu urutan baris dalam tanggal yang sama = urutan baca PDF).

### FR-6 Penyimpanan
- Tetap localStorage prefix `spj_` (kunci `spj_bku_data`, tidak diubah).
- Setiap baris menyimpan asal periode: `{ periodeMode: 'bulan'|'semester'|'tahunan', periode: '2026-03' / '2026-S1' / '2026' }` agar ganti-per-periode dan audit memungkinkan.
- Metadata per periode: nama file, waktu upload, jumlah baris, checksum/hash isi (untuk deteksi upload ulang file identik → boleh lewati dengan info, bukan duplikat).

### FR-7 Baris khusus saldo & jumlah (anti dobel-hitung)
- Baris bertipe SALDO_AWAL (Saldo Bank/Tunai Bulan Lalu), BUNGA/PAJAK_BUNGA nol, dan baris JUMLAH bulanan **ditandai tipenya**, dikecualikan dari agregat penerimaan/pengeluaran gabungan, ditampilkan hanya sebagai info.
- Total gabungan = agregat baris transaksi murni, harus cocok dengan baris Jumlah PDF per periode.

### FR-8 Hapus koreksi manual upload PDF
- Hapus alur preview + form koreksi inline + kecualikan baris pada `BKUUploadPdf.jsx` (UI preview baca-saja Ringkasan per bulan boleh tetap sebagai konfirmasi sebelum Simpan — tanpa input edit).
- Keputusan: upload = langsung simpan; tidak ada keadaan "draft terkoreksi".

### FR-9 Validasi angka (bukti, bukan klaim)
- Setelah parse tiap file contoh (Maret, April): cocokkan per baris vs kolom Saldo PDF + total vs baris Jumlah.
- Acuan benar: Maret Jumlah 46.376.100 / 5.492.000 / 40.884.100; April Jumlah 40.980.100 / 31.838.700 / 9.141.400; posisi kas penutup April Rp 9.141.400 (Bank 8.041.400 + Tunai 1.100.000).

## 6. Non-Functional Requirements

- Performance: parse + gabung + urut ≤ 5 detik untuk PDF 21 halaman di laptop standar; tanpa worker baru bila tidak perlu.
- Storage: tetap localStorage; 12 bulan data BKU harus muat (pantau kuota, gagal simpan → pesan jelas, data lama tidak rusak).
- Compatibility: format PDF ARKAS varian layout harus lolos (header kolom "1..8" vertikal pada PDF April, baris PPh 23 multi-baris, pasangan Tarik Tunai/Pergeseran).
- Safety: tulis storage atomik per aksi; gagal di tengah → dataset sebelumnya utuh.
- Constitution: BLUE-ONLY #004ac6 + slate; prefix `spj_`; kertas A4/mm untuk cetak; tanpa library baru tanpa persetujuan (tetap pdf.js yang ada).

## 7. Design Considerations

- Dropdown mode menempel pada tombol Upload PDF yang ada; radio/pemilih Bulan/Semester/Tahun muncul kontekstual sesuai mode.
- Tampilan daftar data: ada penanda asal periode per kelompok (mis. seksi per bulan) — desain final oleh tim UI.
- Tidak ada form input koreksi pada alur upload PDF (keputusan user).

## 8. Success Metrics / Acceptance

- [ ] US-1: Maret + April tampil lengkap, terurut, total baris = jumlah kedua file
- [ ] US-2: upload ulang Maret → Maret berganti, April utuh, nol duplikat
- [ ] US-3: upload semester → semester lain utuh, gabungan kronologis
- [ ] US-4: upload tahunan → hanya isi PDF tahunan
- [ ] US-5: tidak ada form koreksi pada alur upload PDF
- [ ] Saldo per baris cocok PDF; total cocok baris Jumlah (Maret & April)
- [ ] Build `npm run build` exit 0

## 9. Open Questions

- Q-1: Definisi semester untuk cakupan upload — Ganjil (Jul–Des) / Genap (Jan–Apr…/Jan–Jun)? Atau ikut Tahap BOS (Tahap 1/2)? (Asumsi sementara A-4)
- Q-2: Jika satu PDF bulanan ternyata memuat 2 bulan (mis. cetak ulang), tolak atau bagi otomatis?
- Q-3: Perlukah ekspor/riwayat "periode X dari file Y tanggal Z"? (disarankan ya, murah via FR-6)

## 10. Assumptions

- A-1: Satu PDF bulanan = satu bulan (header "BULAN : X"); PDF tahunan = setahun penuh.
- A-2: Nomor bukti (BPU/BNU) unik dalam sebulan, pembantu deteksi duplikat.
- A-3: localStorage cukup untuk 12 bulan BKU.
- A-4 (sementara): Semester = Ganjil (Juli–Desember) / Genap (Januari–Juni) tahun berjalan; kunci Q-1 sebelum coding.

## 11. Out of Scope

- Mengubah format PDF ARKAS; jalur upload Excel (tidak disentuh); sinkronisasi antar-perangkat/backend;
  desain ulang tampilan halaman BKU (ranah tim UI); library baru tanpa persetujuan.
