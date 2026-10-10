# ACCEPTANCE — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah + output harapan. Semua perintah dari root D:/project/spj-app.
> Branch: feat/sprint-011-paket-siplah (dari main). Sifat: pack DOCS-ONLY dulu; kriteria di bawah untuk tahap eksekusi SETELAH pack disetujui (dry-run-first, TUNGGU persetujuan).

## Task Gate (WAJIB sebelum kriteria dinilai)

npm run build exit 0 + grep DoD per task B-01..B-08 BLUEPRINT sudah hijau. Gate akhir:
0 baris tanpa konfirmasi + cetak SIPLAH = 1 dokumen + round-trip mode lossless + arsip 100% pulih + cetak existing steril.

## Definisi Selesai

Sprint SELESAI bila checklist C-01..C-08 centang + T-01..T-10 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Toggle mode tak hapus isian: round-trip SIPLAH→NON→SIPLAH field utuh 100% (T-02)
- [ ] C-02 Tanpa CRUD per baris: 0 tombol Tambah/Ubah/Hapus level baris; 100% baris via 3 pintu (T-03)
- [ ] C-03 Keranjang jujur: Terima tambah 1 baris; Tolak buang kartu tanpa tambah; tanpa auto-tambah (T-04)
- [ ] C-04 Chips konfirmasi: 0 baris tercipta tanpa konfirmasi eksplisit (T-05)
- [ ] C-05 Edit inline + arsip: edit di expand tanpa modal; tiap baris terhapus bisa Kembali 100% (T-06)
- [ ] C-06 SIPLAH steril: tab non-Perencanaan hilang; cetak + preview hanya Perencanaan = 1 dokumen (T-07)
- [ ] C-07 Larangan + regresi steril: config/TemplateEngine/blocks existing tanpa ubah; 0 lib baru; print steril (T-09)
- [ ] C-08 Build sukses + STATE.MD/pack updated, tanpa commit (T-01, T-10)

## Test Cases

### T-01 — Build

- Given pack disetujui + branch feat/sprint-011-paket-siplah. When cd spj-frontend lalu npm run build (+ node -v)
- Then exit 0, tampil built in ... Bukti: output terminal asli

### T-02 — Toggle mode + simpan diam-diam (B-01)

- Given halaman Kelengkapan PBJ terisi (≥1 dokumen NON-SIPLAH terisi). When aktifkan toggle SIPLAH → kembali NON-SIPLAH
- Then isian 5 dokumen muncul persis seperti ditinggalkan (100% field utuh); toast 1 baris tiap ganti; tanpa dialog; default awal NON-SIPLAH (A4).
  Bukti: 2 screenshot (isi sebelum + sesudah round-trip identik) + grep spj_pbj_mode min 1

### T-03 — Command-bar satu pintu, tanpa CRUD per baris (B-03)

- Given tabel PBJ. When inspeksi semua baris + tambah 1 baris via tiap pintu (Upload/Dari BKU/Manual)
- Then 0 tombol Tambah/Ubah/Hapus di level baris; tiap baris baru lahir dari salah satu 3 tombol command-bar.
  Bukti: screenshot command-bar + grep Dari BKU/Manual min 2 hit

### T-04 — Keranjang Terima/Tolak (B-04)

- Given ≥1 transaksi BKU PEMBAYARAN belum berdokumen (kunci A1: NoBukti normalisasi). When buka Dari BKU → Terima 1 kartu → Tolak 1 kartu
- Then kartu Terima menjadi 1 baris tabel; kartu Tolak hilang tanpa menambah baris; tanpa auto-tambah dalam kondisi apapun;
  transaksi sudah berdokumen (NoBukti sudah dipakai) tidak muncul sebagai kandidat.
  Bukti: 3 screenshot (keranjang + sesudah Terima + sesudah Tolak) + grep isSudahBerdokumen/spj_pbj_keranjang_tolak min 2 hit

### T-05 — Suggestion chips + konfirmasi (B-05)

- Given chips tampil di atas tabel. When klik 1 chip → dialog konfirmasi muncul → setujui; klik chip lain → batalkan
- Then hanya chip yang disetujui menambah baris (tepat 1); yang dibatalkan menambah 0; 0 baris tanpa konfirmasi eksplisit.
  Bukti: 2 screenshot (dialog konfirmasi + tabel sesudah) + grep konfirmasi/chip min 1

### T-06 — Edit inline expand + arsip halus (B-06, B-07)

- Given 1 baris tabel. When expand → ubah nilai inline → "hapus" baris → buka arsip → Kembalikan
- Then edit tersimpan + toast, tanpa modal edit terpisah dan tanpa tombol Ubah per baris; baris terhapus hilang dari tabel
  (tanpa warna bahaya) dan muncul di arsip; Kembalikan memulihkan baris 100%; Kosongkan Arsip mengosongkan manual.
  Bukti: 3 screenshot (expand edit + arsip + sesudah Kembalikan) + grep spj_pbj_arsip min 1

### T-07 — Gate SIPLAH: 1 dokumen (B-02)

- Given mode SIPLAH aktif + upload invoice SIPLAH PDF. When cek tab-bar + badge + panel + print-preview + cetak
- Then tab non-Perencanaan HILANG dari tab-bar (bukan disabled); badge/panel/preview/cetak hanya Perencanaan;
  sk-doc-print PBJ = 1; tabel terisi via upload seperti biasa.
  Bukti: 3 screenshot (tab-bar SIPLAH + panel 1 doc + print-preview 1 hal) + perintah: grep -c sk-doc-print → 1 (mode SIPLAH)

### T-08 — Form Manual setara penuh (B-08)

- Given klik Manual. When isi subset A5 (uraian, qty, harga, tanggal, penyedia, no acuan) → submit
- Then baris manual tampil identik pintu lain; bisa expand + edit inline + arsip; kolom lain tampil '-' jujur.
  Bukti: screenshot form Manual + baris hasilnya

### T-09 — Regresi steril + larangan (B-09; 4 perintah bash, lihat HANDOFF)

- Given selesai. When jalankan 4 perintah: diff-stat templateConfig/TemplateEngine/blocks; grep -c sk-doc-print NON-SIPLAH;
  grep larangan TTD-digital/KIRIM/QR/navy; grep print-hidden command-bar/keranjang/chips/arsip/toggle
- Then config existing tanpa ubah (TemplateEngine/blocks existing diff KOSONG); NON-SIPLAH sk-doc-print = 6;
  grep larangan 0 hasil; semua elemen paket print:hidden ada. Bukti: output 4 perintah asli

### T-10 — STATE + pack updated, tanpa commit (B-09)

- Given semua hijau. When cek git status --porcelain + STATE.MD + pack sprint-011
- Then hanya file planning/sprints/sprint-011 + src cakupan BLUEPRINT; STATE.MD + checklist pack terupdate;
  TANPA commit/push (kuasa user). Bukti: output git status asli

## Edge Cases

- **E-1 — Keranjang kosong:** Given semua transaksi BKU sudah berdokumen (atau BKU kosong). When buka Dari BKU
  Then pesan jujur "Tidak ada transaksi BKU yang belum berdokumen" + tanpa error; keranjang kosong bukan crash.
- **E-2 — Upload asing di mode SIPLAH:** Given mode SIPLAH + upload PDF non-invoice. When parse gagal
  Then fallback manual jujur sprint-010 tetap jalan (pesan + form manual + arsip meta); toggle tidak rusak; mode tetap SIPLAH.

## Uji Manual 2 Mode (DECISIONS.MD 2026-10-01)

- Mode otomatis (agent): jalankan T-01..T-10 via dev server http://localhost:5173/ + screenshot.
- Mode manual (user checklist): agent terbitkan langkah klik + output harapan (toggle SIPLAH→NON→SIPLAH lalu keranjang Terima/Tolak
  lalu chips konfirmasi lalu edit inline lalu arsip-Kembalikan lalu upload SIPLAH lalu cetak 1 dokumen lalu form Manual),
  user kembalikan bukti, agent hakimi PASS/FAIL. Tawarkan dulu sebelum eksekusi (wajib).
