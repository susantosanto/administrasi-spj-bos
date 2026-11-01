# REQUIREMENTS.MD — Sprint 023: 5 Perbaikan Detail Transaksi + Referensi 2026

Sumber: Idea Brief v2 FINAL + PRD (2026-10-31). Status: disetujui user ("lanjut dry run dan eksekusi").

## Tujuan
Satu sprint, lima perbaikan di sekitar sidebar Detail Transaksi BKU + menu Kode Referensi. Siap cetak formal.

## Requirements (dari PRD US-1…US-6)
1. **R-1 (US-1/US-2):** Tabel invoice SIPLah di `SidebarPbj` (bawah tombol upload, atas form Perencanaan) untuk kategori mamin/atk/pemeliharaan/perjalanan_dinas + mode SIPLAH saja. Upload sukses → Perencanaan/Pesanan terisi otomatis + arsip `spj_pbj_invoices` append.
2. **R-2 (US-3):** Card "Kategori Belanja" (`BKUSidebar.jsx:432-466`) disembunyikan hanya saat `isSetorPajak=true`. Informasi Referensi tetap.
3. **R-3 (US-4):** Upload + hapus foto ruang per transaksi (lokal, tidak ubah `ruangan_photos` global) + ganti suasana ikut ganti foto. Lokasi: Langkah 2 `DokumentasiAIGenerate.jsx:465-492`.
4. **R-4 (US-5):** `REKENING_MAP` di `data/kodeReferensi.js` diganti total dari Excel `template-data/Referensi Rekening Belanja Operasi (5.1) - 2026.xlsx` (sheet "Belanja Operasi (5.1)", A=kode, B=label, E=kelompok, baris 3-185 = 183 entri). KEGIATAN_BOS tidak diubah.
5. **R-5 (US-6):** Dropdown "Jenis Pemeliharaan: Upah / Non-Upah" di sidebar pemeliharaan (default Upah). Non-Upah → dokumen upah disembunyikan dari panel + cetak; tampil panduan kwitansi/BA via Dokumen Kelengkapan.

## Batasan mengikat
- KEPUTUSAN-DIKUNCI Sprint 022 berlaku (D-22: tidak ubah `templateConfig.js`/blok cetak; D-17 label AI; D-18 tanpa placeholder). R-5 hanya menyembunyikan di level panel, bukan mengubah template.
- Blue-only `#004ac6` + slate; A4/mm; prefix `spj_`; tanpa library baru; tanpa backend.
