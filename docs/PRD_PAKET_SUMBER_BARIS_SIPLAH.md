# PRD — Paket Sumber Baris + Toggle SIPLAH PBJ

> Status: DRAFT siap input pack arsitek (REQUIREMENTS + BLUEPRINT + ACCEPTANCE + HANDOFF) · Sumber: Idea Brief FINAL dari task 58 (jawaban user final 2026-10-08) · DOCS-ONLY: tanpa ubah src, tanpa commit/push · 2026-10-08
>
> Brain-dump ringkas (dari brief final): satu fitur "Paket" = keranjang BKU→PBJ + suggestion chips (terima/tolak, tanpa auto-tambah) + edit inline expand-row + arsip halus + command-bar satu pintu (Upload/BKU/Manual) + toggle mode SIPLAH/NON-SIPLAH + gate Cek/Cetak mengikuti mode. One-liner: kurasi bukan CRUD. Users: operator saja. Prioritas #1: kerapian. Manual: jarang dipakai tapi wajib ada. Hapus = arsip halus (bisa dikembalikan). Scope dana: BOS reguler; BKU/LPJ/template lain steril. Tabel + upload tetap jalan di kedua mode — SIPLAH isi via upload invoice SIPLAH PDF, NON-SIPLAH via pilih BKU dan/atau manual. Toggle final: (1) mode SIPLAH tab lain DISEMBUNYIKAN; (2) isian mode non-aktif disimpan diam-diam, muncul lagi saat balik mode.

## 1. Overview

Halaman Dokumen Kelengkapan PBJ hari ini (Sprint 010, task 48–58) hanya punya satu pintu sumber baris: upload PDF invoice → tabel agregat 1 invoice = 1 baris + expand rincian + "Isi form dari invoice ini". PRD ini mendefinisikan paket lanjutan yang menutup tiga celah: (a) belanja NON-SIPLAH yang sumber datanya ada di BKU, bukan di invoice PDF; (b) baris manual untuk kasus langka yang tidak tercakup upload maupun BKU; (c) belanja SIPLAH yang secara regulasi hanya butuh dokumen Perencanaan — 5 dokumen lain tidak boleh ikut tercetak.

Solusinya satu paket terpadu, bukan tiga fitur lepas: command-bar satu pintu dengan tiga tombol sumber (Upload / Dari BKU / Manual), keranjang kurasi untuk calon baris dari BKU (terima/tolak per kartu, tanpa auto-tambah), suggestion chips transaksi BKU yang belum berdokumen (selalu minta konfirmasi), edit inline di dalam expand-row (tanpa tombol Ubah per baris), arsip halus sebagai pengganti hapus (setiap baris yang "dihapus" masuk arsip dan bisa dikembalikan), dan toggle mode SIPLAH/NON-SIPLAH yang menyembunyikan tab non-Perencanaan di mode SIPLAH sambil menyimpan isian mode non-aktif secara diam-diam. Gate Cek/Cetak mengikuti mode aktif: SIPLAH → cetak + preview hanya Perencanaan; NON-SIPLAH → keenam dokumen seperti sekarang.

## 2. Goals & Objectives

1. 100% baris baru lahir tanpa tombol CRUD per baris — setiap baris tabel berasal dari salah satu dari tiga pintu (Upload invoice, keranjang BKU, form Manual), sehingga kerapian premium terjaga (prioritas #1 dari user).
2. Operator NON-SIPLAH melengkapi PBJ dari data BKU tanpa mengetik ulang — keranjang menampilkan kandidat transaksi, operator terima/tolak per kartu, chips memberi saran tanpa pernah menambah otomatis.
3. Operator SIPLAH tidak bisa salah cetak — mode SIPLAH menyembunyikan 5 tab non-Perencanaan dan gate Cek/Cetak hanya memproses Perencanaan; isian NON-SIPLAH tersimpan diam-diam dan utuh saat mode dikembalikan.
4. Tidak ada data hilang karena salah langkah — ganti mode tidak menghapus isian; "hapus" baris = arsip yang bisa dikembalikan; upload baru dan Kosongkan Tabel tetap memakai pola snapshot + Urungkan yang sudah ada.
5. Tetap patuh konvensi repo: build exit 0, console 0 error, BLUE-ONLY `#004ac6` + slate, print-area steril, prefix `spj_`, BKU/LPJ/template lain steril kecuali titik "Kirim ke PBJ".

## 3. Target Audience

- Primary: operator sekolah (1 orang, paham BKU dan invoice, butuh tampilan rapi premium, dana BOS reguler). Satu-satunya user aplikasi — tidak ada peran kedua.
- Kepala sekolah: hanya tanda tangan di kertas cetak (bukan user aplikasi).
- Non-user / non-goal: tidak ada login multi-user, tidak ada alur approval di aplikasi, tidak ada sinkron dua arah kembali ke BKU.

## 4. User Stories

1. Sebagai operator, saya klik tombol "Dari BKU" di command-bar → keranjang menampilkan kartu kandidat transaksi BKU yang belum berdokumen, sehingga saya tahu persis baris mana yang bisa dibawa ke PBJ.
2. Sebagai operator, saya klik Terima pada satu kartu keranjang → baris masuk tabel PBJ; saya klik Tolak → kartu hilang dari keranjang tanpa menambah baris, sehingga tidak ada baris nyasar tanpa persetujuan saya.
3. Sebagai operator, saya melihat suggestion chips transaksi BKU di atas tabel → klik satu chip → muncul konfirmasi sebelum baris ditambahkan, sehingga saran mesin tidak pernah diam-diam mengubah tabel.
4. Sebagai operator, saya expand satu baris tabel → mengedit nilainya langsung di dalam expand-row tanpa tombol Ubah, sehingga tabel tetap bersih dari tombol CRUD per baris.
5. Sebagai operator, saya "menghapus" satu baris → baris pindah ke arsip halus (bukan hilang); saya buka arsip → klik Kembalikan → baris pulih, sehingga salah hapus selalu bisa dibatalkan.
6. Sebagai operator belanja SIPLAH, saya aktifkan toggle SIPLAH → 5 tab non-Perencanaan disembunyikan, preview + cetak hanya Perencanaan; saya upload invoice SIPLAH PDF → tabel terisi seperti biasa, sehingga alur SIPLAH tetap satu pintu upload.
7. Sebagai operator, saya pindah toggle SIPLAH → NON-SIPLAH → isian 5 dokumen lama saya muncul kembali utuh (tersimpan diam-diam), sehingga ganti mode tidak pernah menghapus kerja saya.
8. Sebagai operator kasus langka (tanpa invoice, tanpa BKU), saya klik tombol Manual di command-bar → isi form manual → baris masuk tabel lewat pintu yang sama sahnya dengan dua pintu lain, sehingga tidak ada jalan buntu.

Acceptance per story: story 1–3 lolos bila 0 baris tercipta tanpa aksi konfirmasi eksplisit; story 4 lolos bila tidak ada tombol Tambah/Ubah/Hapus di level baris; story 5 lolos bila setiap baris terhapus bisa dikembalikan; story 6 lolos bila cetak SIPLAH = 1 dokumen; story 7 lolos bila round-trip mode tanpa kehilangan field; story 8 lolos bila baris manual tampil identik dengan baris pintu lain.

## 5. Functional Requirements

- FR-P1 Command-bar satu pintu: tiga tombol sumber (Upload PDF / Dari BKU / Manual) dalam satu bar; 100% baris baru wajib lahir dari ketiganya — dilarang tombol Tambah/Ubah/Hapus per baris di tabel.
- FR-P2 Keranjang BKU→PBJ: panel kandidat berisi kartu per transaksi BKU yang belum berdokumen; tiap kartu punya aksi Terima (tambah baris) dan Tolak (buang kartu, tanpa tambah baris); tanpa auto-tambah dalam kondisi apa pun.
- FR-P3 Suggestion chips: chips transaksi BKU belum berdokumen di atas/di dekat tabel; klik chip → dialog konfirmasi → baris ditambah hanya setelah operator menyetujui.
- FR-P4 Edit inline expand-row: seluruh pengeditan nilai baris terjadi di dalam baris expand; tidak ada modal edit terpisah dan tidak ada tombol Ubah per baris.
- FR-P5 Arsip halus: aksi "hapus" baris memindahkan baris ke arsip (soft-delete, bukan hapus permanen, tanpa gaya visual merah/merusak kerapian); panel arsip menyediakan Kembalikan per baris.
- FR-P6 Toggle mode SIPLAH/NON-SIPLAH di card Kelengkapan: mode SIPLAH menyembunyikan tab Perencanaan-selain (Pesanan, BAST, BAHP, Negosiasi, Data pendukung non-Perencanaan); mode NON-SIPLAH menampilkan keenam dokumen seperti sekarang.
- FR-P7 Simpan diam-diam lintas mode: saat mode berganti, seluruh isian mode non-aktif dipersistensi (prefix `spj_`) tanpa pesan mengganggu; kembali ke mode semula memunculkan isian persis seperti ditinggalkan (round-trip lossless).
- FR-P8 Tabel jalan dua mode: di mode SIPLAH sumber baris = upload invoice SIPLAH PDF; di mode NON-SIPLAH sumber baris = keranjang/chips BKU dan/atau Manual (upload tetap tersedia); struktur tabel 15 kolom + expand tetap sama di kedua mode.
- FR-P9 Gate Cek/Cetak mengikuti mode: validasi kelengkapan (badge KURANG/LENGKAP) dan area cetak `.sk-doc-print` hanya memproses dokumen mode aktif — SIPLAH = Perencanaan saja; NON-SIPLAH = keenam dokumen.
- FR-P10 Form Manual: pintu ketiga command-bar untuk kasus langka; field mencakup kolom tabel yang relevan; baris hasilnya setara penuh dengan baris dari Upload/BKU (bisa di-expand, diedit inline, diarsipkan).

Out of scope (dilarang implement): tombol CRUD per baris; auto-tambah dari chips/keranjang; hapus permanen; sinkron balik PBJ→BKU; perubahan BKU/LPJ/template selain titik "Kirim ke PBJ"; dokumen/lampiran di luar 6 key `pbj_*` existing.

## 6. Non-Functional Requirements

- Stack terkunci: React 18 + Vite + Tailwind; tanpa library/backend baru; parser invoice existing (`pdfTableExtractor.js`, `aturanPbj.js`) dipakai ulang, tidak ditulis ulang.
- Data: localStorage prefix `spj_` utuh (key baru wajib berprefix `spj_`, mis. state toggle + arsip + keranjang); pola snapshot + Urungkan existing dipakai ulang untuk aksi destruktif baru; storage hanya read saat rollback.
- Visual: BLUE-ONLY `#004ac6` + slate (dilarang emerald/amber/rose/violet/cyan, termasuk untuk arsip dan keranjang); A4, satuan mm, orientasi via `templateConfig.js`; print-area steril (command-bar, keranjang, chips, arsip, toggle = `print:hidden`).
- Larangan sentuh: 13 config existing, `TemplateEngine.jsx`, `blocks/*` existing (maks 1 block baru bila buntu), dokumen mamin/honor/transport/upah, `package.json`, BKU/LPJ/template lain steril kecuali titik "Kirim ke PBJ".
- Performa/akses: tabel + keranjang + chips keyboard-operable (Enter/Space); toast + badge status tiap aksi kurasi; layout full-width premium existing (task 58) tidak regresi — pageOverflowX=false di 1280px; build exit 0, console 0 error (warning router pre-existing ditoleransi).

## 7. Design Considerations

- Kurasi bukan CRUD: tabel adalah etalase rapi, bukan spreadsheet editable — semua aksi lahir/ubah/hapus terjadi di command-bar, keranjang, chips, expand-row, dan arsip; tidak satu pun tombol aksi di level baris.
- Command-bar satu pintu: tiga tombol sumber sejajar dalam satu bar di atas tabel; state aktif tombol mencerminkan pintu terakhir dipakai; Upload membuka file picker seperti sekarang, Dari BKU membuka panel keranjang, Manual membuka form manual.
- Keranjang sebagai ruang tunggu: kartu kandidat bergaya ringan (bukan tabel kedua), tiap kartu ringkas (identitas transaksi + nominal + Terima/Tolak); Tolak bersifat final untuk kartu itu (tidak masuk arsip — arsip hanya untuk baris tabel).
- Suggestion chips konfirmasi: chips sekali pandang (nama + nominal), klik → dialog konfirmasi ringkas → tambah; chips untuk transaksi yang sudah berdokumen tidak dimunculkan.
- Edit inline expand-row: expand yang sudah ada (rincian item + "Isi form dari invoice ini") diperluas menjadi area edit nilai baris; simpan otomatis dengan toast, tanpa tombol Simpan/Batal berpasangan bila memungkinkan.
- Arsip halus: baris terarsip hilang dari tabel dengan animasi/transisi lembut; panel arsip terpisah (tertutup default, tidak mengganggu kerapian); tiap entri arsip punya Kembalikan; tanpa warna "bahaya" (tetap blue/slate).
- Toggle mode: switch jelas berlabel SIPLAH / NON-SIPLAH di card Kelengkapan; ganti mode tanpa dialog (disimpan diam-diam) tetapi dengan toast satu baris sebagai umpan balik; tab yang disembunyikan benar-benar hilang dari tab-bar (bukan disabled).

## 8. Success Metrics

| Kriteria brief / DoD | Metrik | Target |
|---|---|---|
| 100% baris baru tanpa tombol CRUD per baris | Proporsi baris yang lahir via 3 pintu vs total baris; jumlah tombol aksi di level baris | 100% via pintu; 0 tombol per baris |
| Saran tidak ngawur (wajib konfirmasi) | Baris tercipta tanpa konfirmasi eksplisit | 0 |
| SIPLAH cetak hanya Perencanaan | Jumlah dokumen tercetak dalam mode SIPLAH | Tepat 1 (Perencanaan) |
| Arsip bisa kembalikan | Baris terhapus yang berhasil dipulihkan dari arsip | 100% |
| Ganti mode tanpa data hilang | Field isian utuh setelah round-trip SIPLAH→NON-SIPLAH→SIPLAH | 100% field utuh |
| Kerapian premium terjaga | BLUE-ONLY, print steril, tanpa scroll vertical tabel, pageOverflowX=false @1280px | Semua lolos |
| Build & console bersih | `npm run build` exit code; console errors | exit 0; 0 error |

## 9. Open Questions

- Q1 — Definisi "belum berdokumen": apa kunci yang menentukan satu transaksi BKU sudah/belum masuk PBJ (NoBukti vs kecocokan nominal+tanggal)? Perlu dikunci sebelum keranjang/chips dibangun.
- Q2 — Kapasitas keranjang: apakah keranjang menampung seluruh transaksi BKU sekaligus, atau dibatasi (mis. per bulan / per halaman)? Dampak ke desain panel dan performa.
- Q3 — Retensi arsip: berapa lama baris terarsip disimpan, dan kapan (jika pernah) arsip dibersihkan — manual via "Kosongkan Arsip" atau otomatis per periode?
- Q4 — Default mode toggle: saat operator pertama kali membuka PBJ (belum ada pilihan tersimpan), mode apa yang aktif — NON-SIPLAH (status quo) atau mengikuti jenis belanja terakhir?
- Q5 — Cakupan form Manual: full 15 kolom tabel atau subset esensial (dengan sisa '-' seperti kolom tak dikenal dari invoice)? Menentukan kompleksitas form.
- Q6 — Kunci file scope: daftar file yang boleh disentuh paket ini (untuk acceptance) — usulan awal: halaman PBJ + util state PBJ + titik "Kirim ke PBJ" di BKU; perlu konfirmasi coordinator agar scope tidak merayap.
