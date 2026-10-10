# REQUIREMENTS — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & kenapa saja, TANPA bagaimana).
> Sumber: PRD docs/PRD_PAKET_SUMBER_BARIS_SIPLAH.md (task 60, 9 section) + Idea Brief FINAL task 58.
> Sifat: pack DOCS-ONLY; TANPA ubah src/commit/push sampai pack disetujui.
> Sprint: 011 (berikutnya belum terpakai per 2026-10-10; 001–010 sudah ada).
> Satu sprint = satu goal (Bab 10.3): **kurasi baris PBJ tiga pintu + mode SIPLAH yang tak bisa salah cetak**.

## 1. Goal

Satu fitur terpadu "Paket": setiap baris tabel PBJ lahir dari command-bar satu pintu
(Upload PDF / Dari BKU / Manual), dikurasi lewat panel cari+centang BKU
(cari NoBukti/uraian + filter tanggal + centang batch, tanpa auto-tambah),
diedit inline di expand-row, "dihapus" ke arsip
halus yang bisa dikembalikan — dan toggle mode SIPLAH/NON-SIPLAH mengatur tab,
gate Cek/Cetak, dan preview mengikuti mode aktif tanpa pernah menghapus isian.

One-liner PRD: **kurasi bukan CRUD**.

## 2. Users

- Operator sekolah (satu-satunya user aplikasi; paham BKU dan invoice; dana BOS reguler).
- Kepala sekolah: hanya tanda tangan di kertas cetak (bukan user aplikasi).
- Non-goal: tanpa multi-user/login, tanpa approval di aplikasi, tanpa sinkron balik PBJ→BKU.

## 3. Data Sources

| Sumber | Peran di sprint ini |
|---|---|
| Transaksi BKU PEMBAYARAN (via deep-link state + storage existing) | Kandidat keranjang + chips; hanya yang "belum berdokumen" (definisi terkunci A1) |
| Invoice SIPLAH PDF (upload existing sprint-010) | Sumber baris mode SIPLAH; tetap tersedia di NON-SIPLAH |
| Form Manual (baru, kasus langka) | Pintu ketiga; baris hasilnya setara penuh |
| Isian 6 dokumen PBJ existing (spj_pbj_form) | Disimpan diam-diam lintas mode; round-trip lossless |

## 4. Scope (Fungsional — WHAT, ringkas dari FR-P1..P10 PRD)

1. Command-bar satu pintu: 3 tombol sumber (Upload PDF / Dari BKU / Manual); 100% baris baru lahir dari ketiganya.
2. Panel cari+centang BKU→PBJ: cari NoBukti/uraian + filter tanggal + toggle
   "Hanya yang belum berdokumen" (default ON) + grup ringkas per NoBukti (buka-tutup)
   + centang per transaksi/grup; tombol "Terima ke PBJ (n)" batch menambah tepat n baris,
   disabled saat 0 dipilih; tanpa auto-tambah apapun, tanpa tombol Tolak per kartu
   (revisi task 66 — menggantikan desain keranjang Terima/Tolak per kartu).
3. Tanpa auto-tambah (guard): tidak ada suggestion chips dan tidak ada dialog konfirmasi
   (revisi task 66 — resmi diganti panel cari+centang); baris hanya lahir dari aksi
   eksplisit Upload / Terima-dipilih / Manual-submit; transaksi sudah berdokumen
   tidak dimunculkan saat toggle "Hanya yang belum berdokumen" ON (definisi terkunci A1).
4. Edit inline expand-row: seluruh edit nilai baris di dalam expand; tanpa modal edit, tanpa tombol Ubah per baris.
5. Arsip halus: "hapus" = pindah ke arsip (soft); panel arsip tertutup default + Kembalikan per baris; tanpa warna bahaya.
6. Toggle SIPLAH/NON-SIPLAH di card Kelengkapan: SIPLAH sembunyikan 5 tab non-Perencanaan (tab hilang, bukan disabled); NON-SIPLAH tampilkan keenam dokumen seperti sekarang.
7. Simpan diam-diam lintas mode: isian mode non-aktif dipersistensi tanpa pesan mengganggu; kembali memunculkan isian persis (round-trip lossless).
8. Tabel jalan dua mode: SIPLAH via upload invoice SIPLAH PDF; NON-SIPLAH via keranjang/chips BKU dan/atau Manual (upload tetap tersedia); struktur 15 kolom + expand tetap sama.
9. Gate Cek/Cetak mengikuti mode: badge KURANG/LENGKAP + area cetak hanya proses dokumen mode aktif (SIPLAH = Perencanaan saja; NON-SIPLAH = keenam dokumen).
10. Form Manual: field subset esensial (asumsi terkunci A5); baris hasilnya setara penuh (expand, edit inline, arsip).

## 5. Out of Scope (dilarang)

Tombol CRUD per baris; auto-tambah dari chips/keranjang; hapus permanen; sinkron balik
PBJ→BKU; perubahan BKU/LPJ/template selain titik "Kirim ke PBJ"; dokumen/lampiran di luar
6 key pbj_* existing; library/backend baru; TTD digital, KIRIM server, QR, warna navy.

## 6. Constraints (NFR ringkas — batasan, bukan cara)

- Stack terkunci: React 18 + Vite + Tailwind; parser invoice existing dipakai ulang.
- Storage: key baru wajib prefix spj_ (state toggle + arsip + keranjang/tolak); pola snapshot + Urungkan existing untuk aksi destruktif baru; file PDF tidak disimpan.
- Visual: BLUE-ONLY #004ac6 + slate (termasuk keranjang/arsip); A4 mm; print-area steril (command-bar, keranjang, chips, arsip, toggle = print:hidden).
- Larangan sentuh: config existing, TemplateEngine.jsx, blocks/* existing (maks 1 block baru bila buntu), dokumen mamin/honor/transport/upah, package.json, BKU/LPJ/template lain steril kecuali titik "Kirim ke PBJ".
- Akses: keranjang + chips keyboard-operable (Enter/Space); toast + badge tiap aksi kurasi; layout full-width premium tidak regresi (pageOverflowX=false @1280px); build exit 0, console 0 error.

## 7. Asumsi Terkunci (jawaban Q1–Q6 PRD §9 — mengikat builder, bukan untuk diputuskan ulang)

- **A1 (Q1 — definisi "belum berdokumen"):** satu transaksi BKU dianggap sudah berdokumen bila **NoBukti-nya (normalisasi trim + lowercase) sudah dipakai sebagai nomor acuan salah satu baris PBJ**. Bila NoBukti kosong, fallback komposit tanggal|uraian|nominal. Alasan: NoBukti adalah identitas unik paling stabil; kecocokan nominal+tanggal rawan false-positive (belanja kembar nominal sama).
- **A2 (Q2 — kapasitas keranjang):** keranjang menampung **seluruh transaksi PEMBAYARAN belum berdokumen sekaligus, tanpa pagination/filter bulan**; panel di-scroll bila panjang. Alasan: volume BOS SD kecil (<200 baris); pagination menambah kompleksitas tanpa kebutuhan terbukti.
- **A3 (Q3 — retensi arsip):** baris terarsip disimpan **permanen di spj_pbj_arsip sampai operator klik "Kosongkan Arsip" manual**; tanpa auto-hapus per periode. Alasan: prinsip "tidak ada data hilang karena salah langkah" (§2 goal 4 PRD).
- **A4 (Q4 — default mode):** bila belum ada pilihan tersimpan, mode aktif = **NON-SIPLAH** (status quo sprint-010). Alasan: backward-compatible; operator existing tidak kaget.
- **A5 (Q5 — cakupan form Manual):** form Manual berisi **subset esensial: uraian, qty, harga satuan, tanggal, penyedia, nomor acuan**; kolom tabel lain tampil '-' seperti kolom tak dikenal dari invoice. Alasan: Manual jarang dipakai tapi wajib ada; full 15 kolom boros dan rawan salah isi.
- **A6 (Q6 — kunci file scope):** file yang boleh disentuh (final untuk acceptance): **DokumenKelengkapanPage.jsx + aturanPbj.js + (opsional 1 util baru paketPbj.js bila aturanPbj.js lewat 200 baris — putuskan dry run) + previewDocs.js (tambah gate mode) + titik "Kirim ke PBJ" di BKU**. DILARANG: templateConfig config existing, TemplateEngine.jsx, blocks/* existing (selain max 1 block baru bila buntu), package.json, dokumen non-PBJ, halaman BKU selain titik kirim.

## 8. Success Metrics (dari PRD §8)

| Kriteria | Target |
|---|---|
| Baris baru via 3 pintu; tombol aksi level baris | 100% via pintu; 0 tombol per baris |
| Baris tercipta tanpa aksi eksplisit (auto-tambah) | 0 |
| Dokumen tercetak mode SIPLAH | Tepat 1 (Perencanaan) |
| Baris terhapus pulih dari arsip | 100% |
| Field utuh round-trip SIPLAH→NON→SIPLAH | 100% |
| BLUE-ONLY, print steril, pageOverflowX=false @1280px | Semua lolos |
| npm run build exit 0; console errors | exit 0; 0 error |
