# PRD — Dokumen Kelengkapan PBJ (Pengadaan Barang/Jasa)

> Status: DRAFT siap input ux-user-flow · Sumber: task note spec 48–58 + konteks BKU/LPJ/Mamin + Idea Brief FINAL Paket Sumber Baris + Toggle SIPLAH PBJ (jawaban user final 2026-10-08) · Tanpa ubah src, tanpa commit/push · 2026-10-08

## 1. Overview

Aplikasi SPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage prefix `spj_`, tanpa backend) memiliki halaman Dokumen Kelengkapan dengan card PBJ. Sprint 010 (task 48–58, branch `feat/sprint-010-pbj`, merge `1ff8e97` ke main) membangun alur PBJ: upload PDF invoice dibaca otomatis (pdfjs-dist 4.10.38 via `pdfTableExtractor.js` + parser `aturanPbj.js` ≤200 baris) → prefill 5 dokumen (Perencanaan, Pesanan, BAST, BAHP, Negosiasi = 6 key config `pbj_*` di `templateConfig.js`, portrait, blocks reuse) → section Kelengkapan PBJ selalu tampil + 5 tabs + ringkasan + area cetak 6× `.sk-doc-print` → preview mirror 1:1 via `pbjDocs(pbjForm)` di `previewDocs.js` → deep-link BKU "Lengkapi PBJ" per baris PEMBAYARAN via location.state {fromBKU, transaksi, ts≤10 mnt} ke ?dok=PBJ. Revisi lanjutan (task 50–58): progress atas dihapus, card Dokumen PBJ selalu tampil tanpa toggle filter, klik card bertransformasi jadi card Kelengkapan (grid hilang, tombol minimize/close + Kembali ke Daftar), header panel preview sticky, tabel data 15 kolom persis sheet data `Dokumen PBJ_2026_Lbs.xlsx` (judul+urutan sama), 1 invoice = 1 baris agregat + expand/dropdown rincian N item + tombol "Isi form dari invoice ini", upload = APPEND per file (gagal parse = baris tidak bertambah), Kosongkan Tabel (snapshot → Urungkan pulihkan form+invoices), link SIPLah jadi hyperlink, card full-width premium tanpa scroll vertical (header biru #004ac6, text-[11px], wrap break-words, overflow-x di dalam card). KS dokumen mengikuti Data Sekolah (getSignatureRoles) ala LPJ. Arah data final: PDF → tabel; klik baris → form + panel preview. Build exit 0, console 0 error, BLUE-ONLY #004ac6 + slate, print-area steril.

## 2. Goals & Objectives

1. Operator melengkapi dokumen PBJ dari invoice PDF tanpa mengetik ulang (prefill otomatis akurat = isi invoice).
2. Satu pintu sumber baris: 100% baris baru lahir dari 4 pintu (saran chip, keranjang BKU, upload, manual) — tanpa tombol Tambah/Ubah/Hapus per baris (keputusan kerapian premium).
3. Toggle SIPLAH/NON-SIPLAH mengatur kelengkapan: SIPLAH → cetak+preview hanya Perencanaan; NON-SIPLAH → semua 6 dokumen seperti sekarang.
4. Tabel = cermin invoice: header persis sheet data, 1 invoice 1 baris, expand rincian item, klik isi form+preview.
5. Aman salah langkah: reset-dulu saat upload baru, Kosongkan Tabel + Urungkan (snapshot backup form+invoices), arsip halus (bukan hapus merah).
6. Tetap patuh konvensi: build exit 0, console 0 error, BLUE-ONLY, A4 mm, prefix spj_, 13 config existing + engine/blocks untouched.

## 3. Target Audience

- Primary: operator sekolah (1 orang, paham BKU/invoice, butuh tampilan rapi premium, dana BOS reguler).
- Kepala sekolah: hanya tanda tangan di kertas cetak (bukan user aplikasi).
- Non-user: tidak ada login multi-user / approval di aplikasi (out of scope).

## 4. User Stories

1. Sebagai operator, saya upload INVOICE-Oktober.pdf → tabel langsung 1 baris agregat (Oktober, no 12381829/INV/…, 3 item, Himalaya Store, Rp 7.055.000) tanpa klik baris dulu, sehingga saya tahu baca mesin benar.
2. Sebagai operator, saya expand baris → lihat rincian 3 item (Materai 30×, Gelas Cup, SOUND SYSTEM) + klik "Isi form dari invoice ini" → tab Data + panel preview ikut, sehingga kurasi terasa satu alur.
3. Sebagai operator, saya upload PDF kedua → tabel jadi 2 baris (APPEND); upload baru me-reset sisa lama dulu (tidak campur), sehingga data selalu = isi PDF.
4. Sebagai operator, saya klik Kosongkan Tabel → tabel 0 baris + badge KURANG + preview "Belum ada dokumen PBJ"; klik Urungkan → pulih, sehingga salah klik bisa dibatalkan.
5. Sebagai operator belanja SIPLAH, saya aktifkan toggle SIPLAH → tab lain disembunyikan, preview+cetak hanya Perencanaan; balik ke NON-SIPLAH → isian lama muncul lagi (disimpan diam-diam).
6. Sebagai operator belanja non-SIPLAH, saya pilih baris dari BKU (keranjang/chip terima-tolak) atau isi manual (kasus jarang tapi wajib ada) → baris masuk tabel tanpa tombol CRUD murahan.
7. Sebagai operator, saya klik kolom link SIPLah → terbuka tab baru marketplace, sehingga verifikasi penyedia cepat.

## 5. Functional Requirements

FR-1 Upload invoice PDF: parse via extractTables+extractAllText → aturanPbj (parseInvoiceSIPLah + terapkanPrefillPbj + lanjutanUraian untuk ekor uraian multi-baris; nilaiSetelah stop-list NPSN/HALAMAN/TABEL; angka/qty/tanggal/nominal tak tersentuh). Gagal (cocok=false/exception) = tabel tidak bertambah + pesan jujur + meta arsip tersimpan.
FR-2 Tabel data: 15 kolom header persis sheet data (No, Bulan, No. Bukti, Tgl. Pesanan, Jumlah Barang/Jasa, Spesifikasi/ruang lingkup, Waktu serah terima, Alokasi Anggaran, Penyedia, nama penyedia, Direktur penyedia, link SIPLah, NPWP, Alamat, No. Telp) + kolom chevron expand; 1 file = 1 baris agregat (kolom tak dikenal = '-'); sub-tabel N item per baris.
FR-3 Klik baris / "Isi form dari invoice ini": paksaFormDariInvoice (rows pesanan/nego + agregat Data) → tab Data + previewDocs mirror ikut; tanpa snapshot (Urungkan tetap milik upload/kosongkan).
FR-4 Kosongkan Tabel: snapshot (slot spj_otomatis_snapshot) → reset pbjForm=pbjFormKosong + invoices=[] + invoiceMeta/badge/pesan/BKU/barisAktif null; Urungkan pulihkan form+invoices.
FR-5 Upload reset-dulu: snapshot lama → kosongkan saat loading → isi dari pbjFormKosong+prefill baru (tanpa sisa lama).
FR-6 5 dokumen + preview: tabs Perencanaan/Pesanan/BAHP/BAST/Negosiasi(+Data); pbjDocs skip doc kosong-total + pesan jujur; KS injeksi ketikan→Data Sekolah→'' (placeholder jujur bila profil kosong).
FR-7 Card UX: Dokumen PBJ selalu tampil (tanpa filter toggle); klik card → transformasi card Kelengkapan (grid hilang) + minimize/close + Kembali ke Daftar; section mt-4 mb-8; panel preview bar tombol sticky top-0 z-10; full-width (max-w-none, p-5/sm:7/lg:9) tanpa scroll vertical.
FR-8 Link SIPLah: kolom link = anchor target_blank rel noopener noreferrer + stopPropagation; 10/10 baris valid.
FR-9 Deep-link BKU: tombol Lengkapi PBJ per baris PEMBAYARAN → location.state {fromBKU, transaksi, ts} → ?dok=PBJ (ts≤10 mnt).
FR-10 Toggle SIPLAH/NON-SIPLAH (Future Scope, brief FINAL): toggle di card Kelengkapan; SIPLAH = tab non-Perencanaan DISEMBUNYIKAN (isian disimpan diam-diam); tabel+upload tetap jalan di kedua mode (SIPLAH via upload invoice SIPLAH PDF; NON-SIPLAH via BKU/manual); gate Cek/Cetak mengikuti mode.
FR-11 Paket Sumber Baris (Future Scope, brief FINAL): keranjang BKU→PBJ (kartu sumber terima/tolak) + suggestion chips transaksi BKU belum berdokumen (konfirmasi, tanpa auto-tambah) + edit inline expand-row + arsip halus per baris (bisa kembalikan) + command-bar satu pintu (Upload/BKU/Manual).

## 6. Non-Functional Requirements

- Stack terkunci: React 18 + Vite + Tailwind; tanpa lib/backend baru; pdfjs-dist 4.10.38 reuse; xlsx/openpyxl hanya tooling baca sheet (nilai disalin statis ke pbjDataSheet.js, lalu import dihapus saat tabel jadi dinamis).
- Data: localStorage prefix spj_ utuh (spj_pbj_form, spj_pbj_invoices, spj_otomatis_snapshot); storage hanya read saat rollback (git checkout per file).
- Visual: BLUE-ONLY #004ac6 + slate (dilarang emerald/amber/rose/violet/cyan); A4, satuan mm, orientasi via templateConfig orientation; print-area steril (PanelPreview print:hidden).
- Larangan sentuh: 13 config existing, TemplateEngine.jsx, blocks/* existing (max 1 block baru bila buntu), dokumen mamin/honor/transport/upah, package.json, pdfTableExtractor.js; BKU/LPJ/template lain steril kecuali titik "Kirim ke PBJ".
- Performa/akses: tabel keyboard-operable (Enter/Space), toast+badge status baris, tabel min-content dikunci dalam card (pageOverflowX=false di 1280px); build exit 0, console 0 error (warning router pre-existing ditoleransi).

## 7. Design Considerations

- Premium full-width: section w-full max-w-none, padding lega, aksen gradient; header tabel biru #004ac6; densitas text-[11px]; kolom panjang wrap; header sticky; tanpa max-h/overflow-y; overflow-x-auto + contain:inline-size di dalam card (bug "tertutup sidebar" docW 2005→1274 diperbaiki).
- Transformasi card (bukan navigasi halaman): klik card Dokumen PBJ → grid hilang, hanya card Kelengkapan + minimize/close + Kembali ke Daftar; judul Keuangan diberi sekat (mt-10 pt-8 border-t) + gap lega (gap-3, space-y-4; gap ukur 0→73).
- Kurasi bukan CRUD: tanpa tombol Tambah/Ubah/Hapus per baris; hapus = arsip halus; saran chip selalu minta konfirmasi.
- Jujur bila kosong: doc kosong-total di-skip + pesan; profil KS kosong → placeholder, bukan karangan; satdik tercemar marker tabel dibersihkan (SD NEGERI PASIRHALANG).

## 8. Success Metrics

- Upload INVOICE-Oktober.pdf → tabel = isi invoice (3 item + nominal: Materai 337.830, Gelas Cup 99.099, SOUND SYSTEM 5.918.918; DPP 5.826.175, PPN12 699.153, grand 7.055.000; satdik bersih; no+tanggal benar) — terbukti via harness node + browser.
- 1 invoice = 1 baris; upload ke-2 = 2 baris; Kosongkan = 0 baris; Urungkan = pulih penuh (tanpa BNU/seed lama).
- Header 15 kolom = nama+urutan sheet data persis; link SIPLah 10/10 anchor valid; expand + isi-form + preview ikut jalan.
- Toggle (saat dibangun): SIPLAH cetak hanya Perencanaan; NON-SIPLAH semua 6 dokumen; gonta-ganti mode tak hilangkan isian.
- Gates: npm run build exit 0 (~194 modul, ~7s); browser console 0 errors, network gagal 0; regresi engine/blocks/package/blob/larangan 0; acceptance-runner fresh (klik baris, expand, kosongkan, urungkan, upload 2×, screenshot).

## 9. Open Questions

Q1. Toggle default = NON-SIPLAH (lengkap) — asumsi brief; butuh konfirmasi user bila ingin default mengikuti transaksi terakhir. (Keputusan Q card-full-width, Q3/Q4 link+space sudahafi dieksekusi di task 51–52.)
Q2. Manual-entry jarang: form manual minimal (field wajib apa saja) vs reuse tab Data penuh?
Q3. Keranjang BKU: titik "Kirim ke PBJ" di BKUPage vs BKUSidebar ( Laurence diputuskan saat coding pack 010) — kunci final saat pack paket sumber.
Q4. Arsip halus: retensi arsip (selamanya di localStorage vs purge) dan UI daftar arsip?
Q5. Perencanaan efaktur/pajak (Tab Pajak + Coretax task 44) perlu masuk gate Cek/Cetak PBJ?

## Brain-dump (ringkas task note 48–58 + konteks)

- 48: pack Sprint 010 docs-only (planning/sprints/sprint-010/ + architect-packs salinan, cross-check 11/11 PASS, src steril, tunggu setuju).
- 49: dry-run eksekusi (HEAD ec748c4, diff src kosong, build 8.46s; urutan: aturanPbj baru → +5 config → section+tabs → pbjDocs → deep-link BKU).
- 50: 7 revisi (hapus progress, card selalu tampil, transformasi+minimize, margin, sticky preview, tabel 13 kolom→live, KS ala LPJ; build 193 modul 6.53s; browser 0 errors).
- 51: tabel = sheet data (openpyxl: header baris 9 A-O 15 kolom, 10 baris data; kolom AD kategori tidak dipakai; salin statis pbjDataSheet.js; tabel di atas split form+preview; toolbar Upload+Urungkan keluar card; full width; gap judul; Q1 full-width pending).
- 52: link SIPLah klik (10/10 anchor) + sekat judul Keuangan (gap 0→73 + divider; display:contents diganti blok).
- 53: fix parse (lanjutanUraian gabung ekor ke r[2]; nilaiSetelah stop-list; item2 Gelas Cup + item3 SOUND SYSTEM FIX; satdik bersih; regresi kosong/asing/fallback; build 8.21s).
- 54: reset-dulu upload (snapshot→kosong saat loading→isi baru; gagal = tetap kosong + pesan jujur; sim 2× upload OK; build 6.44s).
- 55: tombol Kosongkan Tabel (delete_sweep slate/white; snapshot→reset; live: seed BNU20→kosong 6 KURANG→Urungkan pulih; 0 errors).
- 56: fix tuntas (tabel dinamis = pbjForm.pesanan.rows; import sheet dihapus; handlePilihInvoiceRow+pbjBarisAktif; fresh=0 baris; upload=3 baris langsung; kosongkan=0; urungkan=pulih tanpa BNU).
- 57: 1 invoice 1 baris + header 15 persis sheet + expand items + tombol isi-form (state pbjInvoices persist spj_pbj_invoices; APPEND; gagal=tak bertambah; klik paksa form+preview; kosongkan reset+backup; upload 1 PDF=1 baris Oktober 3 item 7.055.000; file ke-2=2 baris; build 6.59s).
- 58: full-width premium + tanpa scroll vertical (max-w-none, p lega, gradient; header #004ac6; text-[11px] wrap; tanpa overflow-y; overflow-x dalam card; bug sidebar docW 2005→1274; 16 header; 1280/1912 screenshot; 0 errors) + merge 1ff8e97 + push origin/main + build main 6.40s.
- Konteks BKU/LPJ/Mamin: grup se-NoBukti satu kelompok dominan kode rekening + auto filter; parser Mamin ketat (Beban Makanan dan Minuman=Rapat; Konsumsi makan/snack=Kegiatan; Acara=nama kegiatan); bahasa alur BKU sederhana tanpa ubah cetak; panel Preview Document A4 SIMENULIS; TTD tunggal KS rata kanan 4 baris; Tab Pajak + Coretax; audit SPT+SPPD gugus.

## Lokasi file (keputusan)

`docs/PRD_PBJ_KELENGKAPAN.md` — mengikuti konvensi repo yang sudah ada (`docs/PRD_DOKUMEN_LPJ.md`, `docs/PRD_TEMPLATE_SURAT_CERDAS.md`, dll), bukan `.taskmaster/docs/prd.md` (folder .taskmaster tidak ada di repo ini).
