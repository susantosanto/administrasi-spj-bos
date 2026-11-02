# BLUEPRINT.MD — Sprint 023

## Tech Stack (pinned, dari package.json — tanpa perubahan)
React 18.3.1 · react-dom 18.3.1 · react-router-dom 6.30.4 · vite 5.4.21 · tailwindcss 3.4.19 · pdfjs-dist 4.10.38 · @heyputer/puter.js 2.5.4 · xlsx 0.18.5 · tesseract.js 7.0.0. Tanpa dependency baru.

## File yang diubah (5)
1. `spj-frontend/src/components/bku/SidebarPbj.jsx` — blok tabel invoice: baca `storageHelper.get('pbj_invoices', [])`; render 1 invoice = 1 baris (nomor, tanggal, penyedia, N item, total) + expand items (uraian/qty/harga/total); refresh state tiap upload (`tambahInvoiceKeArsip` → baca ulang). Hanya saat `bolehUpload`. Util parse/prefill tidak diubah (`pbjInvoice.js` 0 diff).
2. `spj-frontend/src/components/bku/BKUSidebar.jsx` — bungkus card Kategori Belanja (`:432-466`) dengan `{!isSetorPajak && (...)}`. `isSetorPajak` sudah ada (`:119-126`). 0 logika baru.
3. `spj-frontend/src/components/dokumentasi/DokumentasiAIGenerate.jsx` — state ruang lokal per NoBukti (`spj_ruang_lokal`: `{[noBukti]: {[slot]: dataUrl}}`); prioritas `ruangFoto`: lokal[slot] → global[slot] → global pertama. UI Langkah 2: thumbnail + tombol Hapus (hapus slot lokal) + Upload/Ganti (input file, resize 512 via `resizeImage`, pola owner). Hapus tidak menyentuh `ruangan_photos`.
4. `spj-frontend/src/data/kodeReferensi.js` — ganti isi `REKENING_MAP` (16 → 183 entri). Lookup + refresh function tidak diubah. Header komentar sumber + tanggal update.
5. `spj-frontend/src/components/bku/BKUSidebarLpj.jsx` — hanya saat `card.id==='pemeliharaan'`: dropdown jenis (nilai di `formData.jenisPemeliharaan`, default `'upah'`); bila `'non-upah'` → `previewDocs=[]` + nota info (kwitansi/BA via Dokumen Kelengkapan). Persist otomatis via `simpanEntri` (formData ikut tersimpan).

## File yang DILARANG diubah
`templateConfig.js` · `blocks/*` · `imageGenerator.js` · `puterAkun.js` · `pbjInvoice.js` · `pbjTabs.js` · `KEGIATAN_BOS` · `package.json`.

## Risiko + mitigasi
- Tabel sempit di sidebar → `overflow-x-auto` + kolom ringkas (pola Rincian Pesanan).
- Ruang lokal bengkak storage → resize 512 + maks 5 slot (4 slot suasana + fallback), format JPEG dataURL (pola owner).
- Kode BKU lama hilang dari Excel → `getNamaRekening` fallback kode mentah (sudah ada).
