# PRD Induk — Penyempurnaan Alur LPJ, BKU, Personel, dan Dokumen

**Status:** DRAF UNTUK REVIEW USER — belum menjadi izin implementasi  
**Sumber ide:** `docs/idea-clarifier revisi fungsi dan fitur.md`  
**Konteks sistem:** aplikasi LPJ BOS/BOSP; frontend React/Vite; data lokal ber-prefix `spj_`; bukan sistem manajemen BKU.

---

## 1. Tujuan

Menyatukan seluruh ide pada file sumber menjadi kebutuhan produk yang tidak ambigu, berangkat dari alur nyata operator:

> Upload BKU → tinjau tabel BKU dan kategori → klik grup/kegiatan → Detail Transaksi → siapkan paket dokumen dari anggota grup → lihat daftar dokumen di bawah → kecualikan dokumen bila perlu → cetak pilihan.

Tujuan PRD ini adalah menetapkan perilaku produk, batasan data, urutan kerja, dan acceptance criteria sebelum implementasi per fase. PRD ini **tidak mengizinkan coding otomatis** dan tidak mengganti sprint pack tanpa persetujuan.

## 2. Pengguna dan kebutuhan utama

- **Operator/bendahara sekolah:** impor BKU, koreksi klasifikasi yang belum tersedia, menyiapkan dokumen yang tepat untuk transaksi/grup, mengecualikan dokumen atau anggota tertentu sebelum cetak.
- **Kepala sekolah/personel:** menjadi sumber identitas, tanda tangan, daftar penerima dan peserta.

## 3. Prinsip produk & batas arsitektur

1. **Alur BKU adalah pintu masuk kerja.** Menu Dokumen LPJ bukan pengganti alur `BKU → klik grup → Detail Transaksi`.
2. **Satu grup No Bukti = satu paket dokumen gabungan**. Paket menampilkan/list transaksi anggota grup. Jangan menghasilkan paket terpisah per baris bila operator membuka grup.
3. **Editor layar dan dokumen formal cetak adalah dua wajah** (`docs/ARCHITECTURE.MD`): layar untuk menyiapkan/mengedit; cetak formal mengikuti template, kop, tanda tangan, ukuran kertas.
4. **Daftar dokumen yang akan dicetak berada di bawah Detail Transaksi.** Setiap item menampilkan nama/status dan preview kertas dokumen itu sendiri; kontrol pengecualian berada pada item tersebut. Preview dan print harus memakai snapshot pilihan yang identik. Jangan mengganti daftar bawah dengan hanya tab preview di atas.
5. Pengecualian hanya untuk proses cetak saat itu; tidak menghapus/mengubah transaksi BKU maupun data sumber dokumen.
6. Kategori koreksi hanya pada scope yang jelas. Koreksi pada satu No Bukti tidak boleh menyebar ke transaksi lain yang kebetulan punya kode rekening sama.
7. Stack dan storage tetap React/Vite + `localStorage` melalui helper, prefix `spj_`, tanpa backend/dependency baru kecuali disetujui dan pack diperbarui.
8. Desain dokumen blue-only `#004ac6` + slate; dokumen A4; tidak mengarang data/fakta resmi.

## 4. Alur utama yang dikunci

### 4.1 Tabel BKU dan kategori
- Hasil impor ditampilkan dalam tabel/grup.
- **Dropdown kategori berada di kolom Tipe untuk semua transaksi**, termasuk yang telah diklasifikasikan otomatis (keputusan user).
- Dropdown tidak ditampilkan di Detail Transaksi.
- Dropdown kategori tersedia untuk semua transaksi; operator dapat memisahkan satu baris hasil auto-kategori ke kategori lain.
- Memilih kategori langsung menyimpan tanpa modal: cakupan No Bukti + kode rekening lengkap + tanggal sama; nama kegiatan/uraian boleh berbeda.
- Memilih nilai yang sama tidak menyimpan apa pun. Tabel/detail/group dihitung ulang tanpa reload penuh. Data sumber transaksi tidak diubah; koreksi kategori disimpan sebagai metadata lokal.
- Setelah kategori ditetapkan, pengelompokan/detail dihitung ulang sesuai tuple No Bukti + rekening ternormalisasi + kategori efektif (sprint-030 US-01).
- Kode rekening yang ditampilkan harus sama persis dengan sumber, termasuk dua digit akhir.

### 4.2 Klik grup → Detail Transaksi → paket
- Mengklik grup membuka Detail Transaksi yang tidak blank/hang.
- Jika yang diklik grup, detail kerja memakai **seluruh anggota grup** sebagai daftar sumber.
- Dokumen yang relevan dibangun sebagai satu paket grup. Bila anggota yang tidak sesuai perlu dikeluarkan, status disertakan/dikecualikan ditunjukkan jelas.
- Mengeluarkan anggota hanya mengubah salinan kerja/cetakan; `bku_data.transactions` tetap byte-equivalent.

### 4.3 Dokumen di bawah Detail Transaksi dan cetak
- Bagian bawah Detail Transaksi memuat daftar dokumen paket.
- Tiap dokumen memiliki nama/status, preview formal kertas inline di daftar bawah, dan kontrol sertakan/kecualikan.
- Pengecualian tidak persisten ke pemakaian berikutnya kecuali user secara eksplisit menyetujui persistensi di tahap desain.
- “Cetak” hanya mengikutkan dokumen yang aktif/terpilih; set data preview sama dengan snapshot yang dicetak.
- Pengguna dapat mengaktifkan kembali item sebelum proses cetak.

### 4.4 Lomba & Workshop
- Tersedia alur Undangan, Proposal, Surat Tugas, Daftar Hadir, dokumentasi foto, dan desain spanduk.
- **Proposal berada dalam Detail Transaksi yang sama tetapi pada tab/preview tersendiri.** Proposal tidak digabung ke dokumen kegiatan lain.
- Undangan, Surat Tugas, dan Daftar Hadir berada bersama sebagai item dokumen paket di bawah Detail Transaksi. Masing-masing menampilkan nama/status dan preview kertas inline, serta dapat dikecualikan secara individual.
- Proposal tetap mempunyai tab/preview tersendiri dalam Detail Transaksi yang sama; proposal tidak menjadi salah satu preview inline tiga dokumen lainnya.
- Daftar peserta Daftar Hadir diambil dari data peserta yang ditetapkan di Proposal (relasi field dan aturan sinkron belum ditentukan; OPEN-02).
- Template DOCX workshop hanya sumber struktur proposal; nama, peserta, biaya, dasar hukum, narasumber atau fakta contoh tidak diisi sebagai data kegiatan aktif.
- Foto dokumentasi: unggah foto asli dari beberapa sudut/ruangan, tinjau dan kecualikan. Foto asli tidak dilabeli sebagai AI.
- Spanduk: hasil aplikasi hanya desain/pratinjau grafis. Tidak membuat foto sintetis yang seolah membuktikan spanduk terpasang/kegiatan berlangsung.
- Foto generatif tanpa label `ILUSTRASI AI` dilarang oleh keputusan D-17 Sprint 022. Fitur AI proposal/foto tidak melakukan panggilan provider yang membawa data sekolah/BKU/personel tanpa consent, minimisasi data, dan jalur key/provider yang disetujui.

## 5. Fase dan ruang lingkup requirement

### Fase 1 — BKU, grouping, koreksi kategori, dan detail
**Mencakup sumber:** poin 12, 14, 15, 16, 20; Sprint 030 US-01/03/04.

- Group key memakai No Bukti + rekening ternormalisasi + kategori efektif; transaksi tanpa No Bukti/ID duplikat tidak menyatu keliru.
- Dropdown kategori di kolom Tipe untuk semua transaksi. Default “Baris ini saja” mengubah hanya row identity terpilih; cakupan kelompok cocok memerlukan pilihan eksplisit di konfirmasi.
- Mamin/konsumsi tidak terklasifikasi sebagai ATK pada fixture yang disetujui.
- Kode rekening tampil lengkap.
- Buka/tutup transaksi/grup acak harus menampilkan Detail Transaksi yang benar, tidak blank/hang, tanpa uncaught error.
- Klik grup menampilkan seluruh anggota dan nilai/ringkasannya.

### Fase 2 — Paket dokumen dan pengecualian cetak
**Mencakup sumber:** poin 3 dan 12; Sprint 030 US-02/08.

- Satu grup → satu paket; paket berisi daftar sumber/anggota grup.
- Daftar bawah menunjukkan status sertakan/kecualikan; preview dan print parity.
- Exclude/re-include bekerja pada item tertentu dan tidak memutasi `bku_data`.
- Snapshot pilihan cetak di-reset sesuai aturan proses cetak baru/`afterprint` yang ditentukan acceptance.
- PBJ tampil hanya untuk Pembelian Barang, Mamin/Konsumsi, ATK; disembunyikan pada Honor, Perjalanan Dinas, Lomba/Workshop.

### Fase 3 — Lomba/Workshop, Proposal, dokumentasi, spanduk
**Mencakup sumber:** poin 1–2; Sprint 030 US-09/10/11.

- Alur dokumen Undangan, Proposal (tab sendiri), Surat Tugas, Daftar Hadir.
- Proposal: struktur Pengesahan, BAB I Pendahuluan, BAB II Pelaksanaan, BAB III Penutup mengikuti DOCX sumber; setiap fakta kosong ditandai perlu dilengkapi.
- Data peserta di Proposal menjadi sumber Daftar Hadir sesuai keputusan relasi yang akan dikonfirmasi.
- Upload banyak foto asli dari sudut/ruangan berbeda; review/hapus sebelum print; sumber foto terlihat jelas.
- Form/desain spanduk memuat Nama Kegiatan, Nama Gugus, Tanggal, Tempat; hasil hanya artwork/pratinjau grafis.
- AI proposal tetap nonaktif/tidak terhubung sampai gate privasi/key/provider disetujui; tidak mengarang fakta.

### Fase 4 — Data Guru/Tendik, honor, SK, notula
**Mencakup sumber:** poin 4–8 dan 25; Sprint 030 US-05/06/07.

- Tambah/edit/hapus Guru dan Tendik manual pada daftar yang sama dengan hasil impor.
- Impor Excel Guru/Tendik ulang **replace seluruh daftar** (keputusan user); bukan merge otomatis. Apakah replace perlu konfirmasi eksplisit dicatat sebagai OPEN-03.
- Identitas minimum divalidasi; NUPTK opsional.
- NUPTK bersumber dari `data_guru`/`data_tendik`, tampil pada daftar penerima honor bila tersedia; kosong tidak menghalangi proses.
- Kolom TTD honor diperlebar, tetap dalam batas kertas yang disepakati.
- Notula menampilkan jumlah peserta, bukan daftar nama.
- Editor pasal SK yang dinilai tidak premium dipindahkan/dikeluarkan dari alur; SK formal siap cetak tetap ada hanya pada kegiatan honor relevan. Tidak membuat halaman SK semester baru/SK kolektif tanpa keputusan.
- Ide “satu SK honor per semester” dan usulan memindahkan/menghapus editor pasal perlu konsep dan persetujuan tersendiri sebelum implementasi; jangan mengubah aturan SK atau membuat SK semester/kolektif berdasarkan tafsir builder.

### Fase 5 — PBJ, SPPD, tanggal, pajak, kop/logo
**Mencakup sumber:** poin 10–11, 13, 17–18; Sprint 030 US-08/12.

- PBJ eligibility sesuai Fase 2; pemetaan “Pembelian Barang” perlu cocok dengan kategori/kode referensi aktual (OPEN-04, jangan mengarang mapping).
- Kop undangan SPPD mengambil nama gugus tersimpan, bukan literal.
- Format tanggal Perencanaan disepakati secara eksplisit dan diuji pada batas bulan/tahun.
- Uraian pajak didahului tepat satu label/keterangan relevan (mis. nama kegiatan/kategori) tanpa duplikasi.
- Logo yang diunggah tampil pada tipe dokumen yang memakai kop sekolah/gugus terkait; fallback kosong graceful; penempatan/ukuran konsisten dan tidak overflow cetak.

### Fase 6 — Upload, login, Dashboard/chart, regresi
**Mencakup sumber:** poin 19, 22–23; Sprint 030 US-13.

- Tab dari input username fokus langsung ke password.
- Klik area upload membuka picker; aksi upload duplikat di luar area dihapus bila sama; gaya form konsisten Data Sekolah.
- Dashboard chart Semester 1 dan Semester 2 berdampingan.
- Nilai bulanan chart = jumlah transaksi pengeluaran BKU bulan tersebut; selisih target Rp 0 terhadap oracle yang disetujui.
- Regresi penuh, UI detail transaksi, preview/cetak A4, seleksi pengecualian, pagination/afterprint.

## 6. Non-goals dan batasan
- Tidak membuat backend, sinkronisasi lintas perangkat, atau sistem manajemen BKU.
- Tidak mengubah provider/model/kuota AI yang dikunci tanpa ADR + persetujuan.
- Tidak menghasilkan foto sintetis tanpa label atau foto yang menyaru sebagai bukti kegiatan.
- Tidak menambah dependency tanpa persetujuan dan pembaruan blueprint.
- Poin 7 dan poin 24 tidak ada pada file sumber; PRD ini tidak menebak isinya.

## 7. Acceptance criteria lintas-fase (ringkasan)

1. **Kategori:** dropdown di kolom Tipe semua transaksi. Default “Baris ini saja” mengubah hanya row identity terpilih. “Baris yang cocok” mengubah hanya No Bukti + rekening lengkap + tanggal sama; nama kegiatan boleh berbeda. Batal tidak mengubah state/storage; Terapkan menghitung ulang grouping.
2. **Group:** tuple berbeda pada No Bukti/rekening/kategori → grup berbeda; klik grup menampilkan tepat semua anggota sumber.
3. **Paket:** setiap grup membuka satu paket; daftar dokumen tepat satu kali per jenis; tidak ada Undangan/Daftar Hadir duplikat.
4. **Exclude:** exclude satu anggota/dokumen tidak mengubah `bku_data`; preview dan print menggunakan pilihan identik; re-include berhasil.
5. **Proposal LPW:** tab/preview Proposal terpisah dalam Detail Transaksi yang sama; field dari DOCX adalah struktur saja; data kosong tidak diisi fakta karangan.
6. **Dokumen bawah:** checklist pengecualian berada di bawah Detail Transaksi; setiap item menampilkan nama/status dan preview kertas inline. Undangan, Surat Tugas, Daftar Hadir tetap bersama di daftar bawah; Proposal tampil di tab/preview tersendiri pada Detail Transaksi yang sama. Selection print sesuai checklist.
7. **Foto/spanduk:** beberapa foto asli dapat ditinjau/dikecualikan; spanduk hanya artwork; tidak ada foto sintetis sebagai bukti.
8. **GTK/Honor:** CRUD bertahan setelah reload; impor ulang replace seluruh daftar sesuai keputusan; NUPTK kosong tetap aman; dokumen/notula/TTD sesuai requirement.
9. **PBJ/SPPD/pajak/kop/tanggal:** eligibility, nilai dinamis, label satu kali, format tanggal dan logo diuji pada fixture nyata/sintetis sesuai matriks.
10. **Dashboard/upload/login:** chart cocok terhadap pengeluaran bulanan; file picker satu langkah; Tab username→password.
11. **Quality:** test Vitest lulus tanpa regresi; build exit 0; smoke test browser dan print; tidak menyatakan PASS untuk yang belum diuji.

## 8. Pertanyaan terbuka (tidak diasumsikan diam-diam)
- **Kategori manual — diputuskan:** dropdown pada kolom Tipe semua transaksi. Setelah ganti kategori, konfirmasi menampilkan cakupan **Baris ini saja** (default) atau **Baris yang cocok** = No Bukti + rekening lengkap + tanggal sama; nama kegiatan tidak menjadi syarat.
- **OPEN-02 Peserta proposal:** nama field/daftar peserta yang menjadi sumber Daftar Hadir; apakah daftar dapat diedit terpisah atau selalu tersinkron dengan Proposal?
- **OPEN-03 Replace GTK:** sebelum impor ulang replace seluruh daftar, apakah wajib modal konfirmasi yang menyatakan data manual yang tak ada dalam file akan terganti?
- **OPEN-04 Pembelian barang:** kategori/kode rekening/lookup resmi yang mewakili Pembelian Barang agar PBJ tidak muncul berdasarkan tebakan.
- **OPEN-05 Format tanggal Perencanaan:** format resmi yang diinginkan (contoh tanggal lengkap) dan locale/lokasi penandatangan.
- **OPEN-06 Logo/kop:** daftar jenis dokumen wajib menggunakan logo sekolah vs logo gugus vs logo dinas; ukuran/posisi final per jenis kop.
- **OPEN-07 Paket No Bukti:** satu grup = satu paket dengan daftar seluruh anggota (keputusan user). Field ringkasan anggota dan apakah pengecualian dilakukan per anggota selain per dokumen perlu dikunci.
- **OPEN-08 Proposal AI:** tetap blocked sampai consent/privacy/allowlist/key route disetujui; apakah UI draft non-AI tetap perlu dirilis lebih dulu?

## 9. Traceability sumber
| Poin ide | Requirement/fase |
|---|---|
| 1 Lomba/Workshop | Fase 3 |
| 2 Foto banyak orang/sudut | Fase 3; input berupa foto asli |
| 3 Pengecualian cetak | Fase 2 |
| 4 Notula jumlah peserta | Fase 4 |
| 5 Tambah Guru/Tendik setelah impor | Fase 4; bukan integrasi Dapodik—daftar lokal yang sama |
| 6 NUPTK opsional | Fase 4 |
| 8 SK honor / pasal | Fase 4 |
| 10 SPPD/gugus dinamis | Fase 5 |
| 11 PBJ eligibility | Fase 2 + 5 |
| 12 Group No Bukti satu paket | Fase 1 + 2 |
| 13 Tanggal perencanaan | Fase 5 |
| 14 Dropdown kategori di kolom Tipe semua transaksi | Fase 1 (keputusan user; cakupan default satu baris + opsi grup cocok) |
| 15 Mamin/konsumsi bukan ATK | Fase 1 |
| 16 Kode rekening lengkap | Fase 1 |
| 17–18 Logo dan konsistensi kop | Fase 5 |
| 19 Login Tab | Fase 6 |
| 20 Sidebar blank/hang | Fase 1 + regresi |
| 21 Label uraian pajak | Fase 5 |
| 22 Chart S1/S2 berbasis pengeluaran | Fase 6 |
| 23 Upload satu langkah, konsisten | Fase 6 |
| 25 Kolom TTD honor | Fase 4 |

**Poin 7, 9, 24:** tidak tercantum pada file sumber; tidak diciptakan oleh PRD ini.
