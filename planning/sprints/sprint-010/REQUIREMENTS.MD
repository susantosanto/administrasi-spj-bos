# REQUIREMENTS — Sprint 010: Dokumen Kelengkapan PBJ (prefill invoice + 5 dokumen, DOCS-ONLY pack)

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa dan mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: brief note b6fecf9e-8ea6-402d-80d3-2512263cf077 + fitur-dokumen-kelengkapan.md (clarifier 2026-10-08) + template/Dokumen PBJ_2026_Lbs.xlsx (7 sheet: data, Workplan, Pembandingan, Negosiasi, Surat Pesanan, Pemeriksaan, BAST) + template/INVOICE - Oktober.pdf (1 hal, SIPLah Toko Ladang, NO 12381829/INV/PO6ABDAD2855C6C, 3 item, grand total Rp 7.055.000) + spj-frontend/src/data/templateConfig.js + spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx (kategori siplah/PBJ + toggle SIPLAH + badge BKU) + pola prefill Sprint 005-009 (aturanUndangan.js snapshotSebelumTimpa/urungkanTimpa spj_otomatis_snapshot, aturanMamin.js MENU_PESANAN/bagiPesananPerSeksi, previewDocs.js maminDocs mirror 1:1) + PanelPreviewDocument.jsx (ScaledPaper A4 + TemplateEngine mode=print, print:hidden) + CONSTITUTION.md + AGENTS.MD.
> Sifat: pack DOCS-ONLY dulu; coding SETELAH pack disetujui (dry-run-first, TUNGGU setuju). Tanpa ubah src di pack ini. Tanpa commit/push (kuasa user).

## Tujuan (satu goal — Bab 10.3)

Operator yang baru menerima invoice PDF dari toko (SIPLah maupun non-SIPLah) meng-upload PDF itu SEKALI di halaman Dokumen Kelengkapan, melihat datanya TERBACA OTOMATIS menjadi draf PBJ (dengan fallback isi manual bila PDF tak terbaca), melengkapi 5 dokumen formal PBJ yang tampil di Panel Preview dan ikut tercetak seperti dokumen lain — tanpa mengubah hasil cetak dokumen existing dan tanpa menambah library.

## Pengguna

- Operator sekolah (1-2 orang, tidak teknis) — upload invoice sekali + cek hasil baca + lengkapi 5 dokumen + cetak
- KS — penandatangan basah di spasi kosong SignatureFooter tiap dokumen (bukan TTD digital)
- Pemeriksa internal — membaca BAHP/BAST hasil cetak sebagai lampiran LPJ

## Sumber Data (as-is, tidak diubah)

- Invoice acuan (struktur TERKONFIRMASI via baca langsung 2026-10-08): header SIPLah Toko Ladang (PT. Ladang Karya Husada) + INVOICE NO + Tanggal Dokumen DD/MM/YYYY + Dari (Nama/Alamat/Kontak/NPWP Penyedia) + Untuk (Perwakilan/Satdik/Alamat/NPSN/Kontak/NPWP Satdik) + Pembayaran VA BJB + Metode Kurir Toko + tabel No/Barang-jasa/Harga-sebelum-PPN/PPN-per-Item/Kuantitas (Pesan vs Terima)/Total-sebelum-PPN (3 baris: Materai 30x, Gelas Melamin, Sound System) + ringkasan DPP Nilai Lain + PPN 12% + GRAND TOTAL + DPP PPh 22 + catatan PMK 131/2024 + URL dokumen tokaladang
- XLSX acuan (struktur TERKONFIRMASI via openpyxl 2026-10-08): sheet data (DB internal A1:AD140, VLOOKUP — TIDAK ditiru), Workplan/B1:K33 (DOKUMEN PERENCANAAN: identitas + 6 baris Jenis/Keterangan + syarat penyedia a/b/c + TTD Pelaksana), Pembandingan/B1:E23 (DOKUMEN HASIL PEMBANDINGAN: PRODUK I vs II), Negosiasi/B1:H28 (DOKUMEN HASIL NEGOSIASI: identitas + tabel No/Produk/QTY/Penawaran/Negosiasi/Keterangan), Surat Pesanan/A2:J1000 (SURAT PESANAN: nomor + kota-tanggal + Kepada + penandatangan + rincian), Pemeriksaan/B1:L63 (SURAT HASIL PEMERIKSAAN = BAHP), BAST/B1:L75 (BERITA ACARA SERAH TERIMA: checkbox Sesuai/Belum + Baik/Rusak + 2 pihak)
- State existing (reuse, tanpa schema liar): DokumenKelengkapanPage.jsx formData + storage spj_dokumen_kelengkapan_status + badge BKU location.state {fromBKU, kelompok, ts≤10 mnt}; aturanUndangan.js SNAP spj_otomatis_snapshot + snapshotSebelumTimpa/bacaSnapshot/urungkanTimpa; pdfTableExtractor.js extractTables/extractAllText (di atas pdfjs-dist); previewDocs.js pola mirror 1:1; PanelPreviewDocument.jsx ScaledPaper + TemplateEngine mode=print
- Template engine existing: TEMPLATE_CONFIGS + blocks kop-surat/header/table-letter-header/uraian-kegiatan/table-dinamis/table-fields/signature — dipakai ulang apa adanya untuk 5 config PBJ baru

## Keputusan Kunci (final — diputuskan di pack ini, bukan opsi)

1. BERLAKU SEMUA PENGADAAN (clarifier final): PBJ bukan hanya SIPLAH. Toggle SIPLAH existing TIDAK BOLEH lagi menyembunyikan PBJ. PBJ pindah ke section sendiri "Kelengkapan PBJ — semua pengadaan" yang SELALU tampil; toggle SIPLAH hanya mengatur kategori non-PBJ lain (atau dicabut bila tak ada sisa — putuskan saat dry run, tanpa ubah perilaku kategori lain).
2. BACA PDF TANPA LIB BARU (diputuskan): pakai pdfjs-dist 4.10.38 EXISTING (sudah di package.json) + utils/pdfTableExtractor.js existing. 0 dependency baru. Parser murni baru aturanPbj.js menelan {cleanText, tables} → draf PBJ; tak cocok = string kosong (jujur, bukan karangan). Invoice non-SIPLah / scan buram / tabel gagal = fallback input manual penuh + arsip metadata file (nama + tanggal upload; file biner TIDAK disimpan di localStorage agar tak bloat).
3. 5 DOKUMEN = PEMETAAN SHEET FINAL: D1 Perencanaan←Workplan, D2 Surat Pesanan←Surat Pesanan, D3 BAHP←Pemeriksaan (nama formal: Berita Acara Hasil Pemeriksaan; label panel "BAHP — Hasil Pemeriksaan"), D4 BAST←BAST, D5 Negosiasi Perbandingan←Pembandingan+Negosiasi DIGABUNG 1 dokumen 2 seksi (Seksi A Pembandingan PRODUK I vs II, Seksi B Negosiasi; tiap seksi ganti halaman — cermin pola 009, arah terbalik: 2 sheet → 1 doc 2 seksi). Sheet data TIDAK menjadi dokumen (diganti storage+prefill).
4. LETAK KEDUA-DUANYA (diputuskan, bukan opsi): (A) Section Kelengkapan split — PBJ punya editor sendiri di DokumenKelengkapanPage (upload + 5 tab/sub-doc + preview + cetak); (B) Deep-link BKU prefill — tombol "Lengkapi PBJ" di baris/sidebar BKU (PEMBAYARAN) kirim location.state {fromBKU, transaksi{noBukti,tanggal,uraian,nominal}, ts} ke halaman Kelengkapan ?dok=PBJ, auto-prefill + badge + snapshot/Urungkan (pola 005). Satu sumber data (storage spj_pbj_*); dua pintu masuk, nol duplikat logika.
5. PREFILL BERLAPIS + SNAPSHOT WAJIB (pola 005-007): prioritas field = ketikan user > hasil baca invoice > transaksi BKU (tanggal→tgl pesanan/periksa/terima, uraian→spesifikasi/pekerjaan, nominal→alokasi anggaran, NoBukti→referensi). SEBELUM timpa apa pun: snapshotSebelumTimpa SELURUH form PBJ ke spj_otomatis_snapshot (reuse, 1 slot) + badge "N field ditimpa (bisa Urungkan)" + tombol Urungkan (reuse urungkanTimpa). Semua hasil prefill tetap editable.
6. PREVIEW+CETAK SEPERTI DOKUMEN LAIN (clarifier final, bukan export Excel): 5 dokumen tampil di PanelPreviewDocument (docs mirror 1:1 area cetak via pbjDocs() baru) + ikut cetak via .sk-print-area/.sk-doc-print (tiap dokumen + tiap seksi D5 ganti halaman; total 6 halaman cetak). XLSX hanya acuan struktur, TIDAK menjadi output.
7. BARANG DARI INVOICE (diputuskan): tabel rincian D2 + tabel produk D5-Seksi B diambil dari items hasil parse invoice (uraian, qtyPesan/qtyTerima, harga sebelum PPN, total). Qty cetak = qtyTerima (kolom Terima; bila kosong fallback qtyPesan — dicatat + diuji). PRODUK I D5-Seksi A = penyedia invoice; PRODUK II = pembanding manual (toko lain, editable, boleh kosong → seksi tampil "—" jujur, bukan karangan).
8. DICORET permanen (warisan 008/009): TTD digital, tombol KIRIM server, QR di badan dokumen, warna navy/oranye — DILARANG masuk rekomendasi maupun backlog.

## Fungsi

- F-PBJ1 — UPLOAD + BACA OTOMATIS: pilih PDF invoice (1 file) → pdfjs baca teks+tabel → aturanPbj parse → form terisi + badge "Terbaca N item · Rp X" + tombol "Isi manual" selalu tersedia; gagal total → pesan jujur + form manual kosong + metadata arsip tersimpan
- F-PBJ2 — EDITOR 5 DOKUMEN: 5 tab/sub-section (Perencanaan, Pesanan, BAHP, BAST, Negosiasi Perbandingan) masing-masing field sesuai sheet acuan; semua editable; pindah tab tak hilangkan data
- F-PBJ3 — PREFILL BKU DEEP-LINK: buka dari BKU → auto-prefill + badge kelompok/transaksi + snapshot + Urungkan (pola 005); buka langsung (tanpa state) → form kosong/manual + upload
- F-PBJ4 — PREVIEW LEGACY (SummaryCard/section): ringkasan per dokumen (status LENGKAP/KURANG + N item) di halaman Kelengkapan
- F-PBJ5 — AREA CETAK 6 HALAMAN: .sk-print-area 6x .sk-doc-print berurutan (D1, D2, D3, D4, D5-A, D5-B), masing-masing TemplateEngine config PBJ + data final
- F-PBJ6 — PANEL 6 DOCS (mirror 1:1 area cetak via pbjDocs()): label D1 "Perencanaan", D2 "Surat Pesanan", D3 "BAHP — Hasil Pemeriksaan", D4 "BAST", D5-A "Negosiasi — Pembandingan", D5-B "Negosiasi — Hasil"; skip dokumen yang datanya kosong total → pesan jujur (bukan halaman kosong)
- F-PBJ7 — ARSIP INVOICE: metadata (nama file, tanggal upload, nomor invoice, grand total) tersimpan + tampil di header editor; file biner tidak disimpan

## Batasan

- 0 dependency baru; pdfjs-dist 4.10.38 EXISTING (bukan "tanpa lib" — klarifikasi: tanpa lib BARU); BLUE-ONLY #004ac6 + slate (emerald/amber/rose/violet/cyan/navy/oranye DILARANG di dokumen dan editor PBJ baru; badge status layar-only teks+ikon pengecualian sah, tak ikut cetak)
- Kertas A4 wajib, satuan mm, orientasi via templateConfig.js orientation (DILARANG ubah; kelima config portrait ikut pola pesanan_mamin)
- localStorage prefix spj_ via storageHelper (JANGAN ubah; key baru wajib spj_pbj_*; snapshot reuse spj_otomatis_snapshot)
- DILARANG ubah dokumen formal existing: 13 config existing, TemplateEngine.jsx, blocks/* existing, dokumen mamin/honor/transport/upah, BKUPage logika selain tambah tombol deep-link — diff cetak selain 5 config + area cetak PBJ = FAIL
- DILARANG: TTD digital, KIRIM server, QR, lib baru, simpan blob PDF di localStorage, ubah cetak lain (lihat Keputusan 8)
- Offline penuh (tanpa fetch/AI key/network saat upload-baca-preview-cetak; URL tokaladang di invoice hanya teks, bukan link aktif yang di-fetch)
- Aksesibilitas wajib: section/h2 per dokumen ("Perencanaan", dst); tab keyboard-operable; focus-visible jelas; hormati prefers-reduced-motion; target sentuh min 44px; pesan error jujur via aria-live
- Batas file: Component max 300 baris, Utility max 200 baris, Config max 150 baris (Constitution); HANDOFF wajib dry-run-first + TUNGGU persetujuan; JANGAN commit/push (kuasa user)
