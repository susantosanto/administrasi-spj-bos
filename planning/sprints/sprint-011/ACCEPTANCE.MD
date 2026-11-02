# ACCEPTANCE — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah + output harapan. Semua perintah dari root D:/project/spj-app.
> Branch: feat/sprint-011-paket-siplah (dari main). Sifat: pack DOCS-ONLY dulu; kriteria di bawah untuk tahap eksekusi SETELAH pack disetujui (dry-run-first, TUNGGU persetujuan).

## Task Gate (WAJIB sebelum kriteria dinilai)

npm run build exit 0 + grep DoD per task B-01..B-08 BLUEPRINT sudah hijau. Gate akhir:
0 baris tanpa aksi eksplisit + cetak SIPLAH = 1 dokumen (runtime) + round-trip mode lossless + arsip 100% pulih + cetak existing steril.

## Definisi Selesai

Sprint SELESAI bila checklist C-01..C-08 centang + T-01..T-10 lulus + E-1/E-2 lulus.

## Checklist

- [x] C-01 Toggle mode tak hapus isian: round-trip SIPLAH→NON→SIPLAH field utuh 100% (T-02)
- [x] C-02 Tanpa CRUD per baris: 0 tombol Tambah/Ubah/Hapus level baris; 100% baris via 3 pintu (T-03)
- [x] C-03 Panel cari+centang jujur: hanya transaksi yang dicentang yang masuk (batch tepat n); 0 dipilih = 0 baris; tanpa auto-tambah (T-04 baru)
- [x] C-04 Tanpa auto-tambah: 0 baris tercipta tanpa aksi eksplisit; tanpa chips, tanpa dialog konfirmasi, tanpa Tolak-per-kartu (T-05 baru)
- [x] C-05 Edit inline + arsip: edit di expand tanpa modal; tiap baris terhapus bisa Kembali 100% (T-06)
- [x] C-06 SIPLAH steril: tab non-Perencanaan hilang; cetak + preview hanya Perencanaan = 1 dokumen (T-07)
- [x] C-07 Larangan + regresi steril: config/TemplateEngine/blocks existing tanpa ubah; 0 lib baru; print steril (T-09)
- [x] C-08 Build sukses + STATE.MD/pack updated, tanpa commit (T-01, T-10)

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

### T-04 — Panel cari+centang BKU (B-04; revisi task 66 — ditulis ulang 2026-10-10, menggantikan "Keranjang Terima/Tolak")

- Given ≥1 transaksi BKU PEMBAYARAN (kunci A1: NoBukti normalisasi). When buka Dari BKU → ketik kata kunci
  cari → atur filter tanggal → centang n transaksi (per transaksi dan/atau per grup NoBukti) → klik "Terima ke PBJ (n)"
- Then tepat n baris baru masuk tabel; tombol "Terima ke PBJ (0)" disabled saat 0 dipilih (klik = toast info, 0 baris);
  toggle "Hanya yang belum berdokumen" default ON dan saat ON transaksi sudah berdokumen (NoBukti sudah dipakai)
  tidak tampil; grup per NoBukti buka-tutup; badge Sudah/Belum-berdokumen jujur.
  Bukti: 3 screenshot (panel cari+centang + sesudah Terima n + tombol disabled saat 0)
  + grep isSudahBerdokumen min 1 + grep "Terima ke PBJ" min 1 + grep "Hanya yang belum berdokumen" min 1

### T-05 — Guard tanpa auto-tambah (B-05; revisi task 66 — ditulis ulang 2026-10-10, menggantikan "Chips + konfirmasi")

- Given halaman Kelengkapan PBJ. When inspeksi panel BKU + seluruh alur tambah baris (Upload / Terima-dipilih / Manual-submit)
- Then 0 baris tercipta tanpa aksi eksplisit operator; tidak ada suggestion chips; tidak ada dialog konfirmasi;
  tidak ada tombol Tolak per kartu; tidak ada fetch/axios (offline penuh).
  Bukti: grep fetch|axios|XMLHttpRequest = 0 + grep Tambah Baris|tambahBaris|onTambah|btn-tambah = 0
  + grep spj_pbj_keranjang_tolak = 0 hit kode aktif (sisa export yatim paketPbj.js dicatat adendum, bukan UI)

### T-06 — Edit inline expand + arsip halus (B-06, B-07)

- Given 1 baris tabel. When expand → ubah nilai inline → "hapus" baris → buka arsip → Kembalikan
- Then edit tersimpan + toast, tanpa modal edit terpisah dan tanpa tombol Ubah per baris; baris terhapus hilang dari tabel
  (tanpa warna bahaya) dan muncul di arsip; Kembalikan memulihkan baris 100%; Kosongkan Arsip mengosongkan manual.
  Bukti: 3 screenshot (expand edit + arsip + sesudah Kembalikan) + grep spj_pbj_arsip min 1

### T-07 — Gate SIPLAH: 1 dokumen (B-02)

- Given mode SIPLAH aktif + upload invoice SIPLAH PDF. When cek tab-bar + badge + panel + print-preview + cetak
- Then tab non-Perencanaan HILANG dari tab-bar (bukan disabled); badge/panel/preview/cetak hanya Perencanaan;
  tabel terisi via upload seperti biasa.
  Bukti: 3 screenshot (tab-bar SIPLAH + panel 1 doc + print-preview 1 hal) + ukuran RUNTIME (bukan grep statis:
  sk-doc-print me-render list sehingga grep -c = 1 di kedua mode): hitung figure/doc di DOM —
  mode SIPLAH = 1 figure, mode NON-SIPLAH = 7 figure (6 dokumen + invoice). (Koreksi G-3, 2026-10-10.)

### T-08 — Form Manual setara penuh (B-08)

- Given klik Manual. When isi subset A5 (uraian, qty, harga, tanggal, penyedia, no acuan) → submit
- Then baris manual tampil identik pintu lain; bisa expand + edit inline + arsip; kolom lain tampil '-' jujur.
  Bukti: screenshot form Manual + baris hasilnya

### T-09 — Regresi steril + larangan (B-09; 4 perintah bash, lihat HANDOFF)

- Given selesai. When jalankan 4 perintah: diff-stat templateConfig/TemplateEngine/blocks; hitung figure runtime
  NON-SIPLAH vs SIPLAH;
  grep larangan TTD-digital/KIRIM/QR/navy; grep print-hidden command-bar/keranjang/chips/arsip/toggle
- Then config existing tanpa ubah (TemplateEngine/blocks existing diff KOSONG); runtime NON-SIPLAH = 7 figure,
  SIPLAH = 1 figure (koreksi G-3: grep -c sk-doc-print statis tidak valid — selalu 1 karena render list);
  grep larangan 0 hasil; semua elemen paket print:hidden ada. Bukti: output 4 perintah asli

### T-10 — STATE + pack updated, tanpa commit (B-09)

- Given semua hijau. When cek git status --porcelain + STATE.MD + pack sprint-011
- Then hanya file planning/sprints/sprint-011 + src cakupan BLUEPRINT; STATE.MD + checklist pack terupdate;
  TANPA commit/push (kuasa user). Bukti: output git status asli

## Edge Cases

- **E-1 — Panel BKU kosong/tak cocok:** Given BKU kosong atau semua transaksi sudah berdokumen (atau kata kunci
  tak cocok). When buka Dari BKU
  Then pesan jujur ("Belum ada data BKU — upload BKU Excel dulu…" / "Tidak cocok — ubah kata kunci…")
  + tanpa error; panel kosong bukan crash. (Redaksi diselaraskan ke implementasi 2026-10-10; makna sama.)
- **E-2 — Upload asing di mode SIPLAH:** Given mode SIPLAH + upload PDF non-invoice. When parse gagal
  Then fallback manual jujur sprint-010 tetap jalan (pesan + form manual + arsip meta); toggle tidak rusak; mode tetap SIPLAH.

## Uji Manual 2 Mode (DECISIONS.MD 2026-10-01)

- Mode otomatis (agent): jalankan T-01..T-10 via dev server http://localhost:5173/ + screenshot.
- Mode manual (user checklist): agent terbitkan langkah klik + output harapan (toggle SIPLAH→NON→SIPLAH lalu keranjang Terima/Tolak
  lalu chips konfirmasi lalu edit inline lalu arsip-Kembalikan lalu upload SIPLAH lalu cetak 1 dokumen lalu form Manual),
   user kembalikan bukti, agent hakimi PASS/FAIL. Tawarkan dulu sebelum eksekusi (wajib).
   Uji manual T-04 baru: buka Dari BKU → cari kata kunci → centang 2 transaksi → "Terima ke PBJ (2)" → tabel +2;
   klik "Terima ke PBJ (0)" → toast info + 0 baris.
