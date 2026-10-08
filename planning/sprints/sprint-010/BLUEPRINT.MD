# BLUEPRINT — Sprint 010: Dokumen Kelengkapan PBJ (upload invoice + 5 dokumen, 6 halaman cetak)

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2, salin dari package.json ASLI 2026-10-08). 0 dependency baru — pdfjs-dist 4.10.38 EXISTING.
> Verifikasi via read-only 2026-10-08 (tanpa ubah src): DokumenKelengkapanPage.jsx 24.713 chars (CATEGORIES siplah/PBJ + toggle SIPLAH + badge BKU location.state ts≤10mnt + storage spj_dokumen_kelengkapan_status) + templateConfig.js 34.276 chars (13 config, pola pesanan_mamin portrait table-letter-header/table-dinamis/table-fields/signature) + PanelPreviewDocument.jsx ScaledPaper A4 + TemplateEngine mode=print + previewDocs.js maminDocs/bagiPesananPerSeksi mirror + aturanUndangan.js SNAP spj_otomatis_snapshot + aturanMamin.js MENU_PESANAN + pdfTableExtractor.js extractTables/extractAllText + BKUPage.jsx deep-link pola location.state + xlsx 7 sheet + invoice 1 hal (struktur di REQUIREMENTS).

## Arsitektur

```text
INVOICE PDF (1 file, sesi)                    TRANSAKSI BKU (deep-link, opsional)
  | pdfjs-dist 4.10.38 EXISTING                 | location.state {fromBKU, transaksi, ts}
  | pdfTableExtractor extractTables/            |
  |   extractAllText (reuse, tanpa ubah)         |
  v                                             v
aturanPbj.js BARU (murni, ≤200 baris; bila lewat → split aturanPbjInvoice.js sibling)
  parseInvoiceSIPLah({cleanText, tables}) → drafPbj {
    nomorInvoice, tanggalInvoice(DD/MM/YYYY→ISO), penyedia{nama,alamat,kontak,npwp},
    satdik, items[{uraian, qtyPesan, qtyTerima, hargaSebelumPPN, ppnPerItem, totalSebelumPPN}],
    dpp, ppn12, grandTotal } — tak cocok = '' (jujur)
  |
  +-- PREFILL BERLAPIS (DokumenKelengkapanPage, pola 005 DokumenSPJPage.jsx:160-316):
  |     user ketikan > invoice > BKU (tanggal/uraian/nominal/NoBukti)
  |     SEBELUM timpa: snapshotSebelumTimpa(seluruh form PBJ) → spj_otomatis_snapshot
  |     badge "N field ditimpa (bisa Urungkan)" + tombol Urungkan → urungkanTimpa()
  |
  +-- EDITOR PBJ (DokumenKelengkapanPage, section "Kelengkapan PBJ" SELALU tampil):
  |     F-PBJ1 upload box + F-PBJ7 arsip meta + F-PBJ2 5 tabs + F-PBJ4 ringkasan
  |     state: pbjForm {perencanaan{}, pesanan{}, bahp{}, bast{}, nego{}} + invoiceMeta
  |     storage: spj_pbj_form + spj_pbj_invoice_meta (prefix spj_ via storageHelper)
  |
  +-- CETAK (.sk-print-area, 6x .sk-doc-print, tiap ganti halaman):
  |     [D1] TemplateEngine(pbj_perencanaan, {...defaults, ...pbjForm.perencanaan})
  |     [D2] TemplateEngine(pbj_pesanan, {...defaults, ...pbjForm.pesanan, rows: itemsInvoice})
  |     [D3] TemplateEngine(pbj_bahp, {...defaults, ...pbjForm.bahp})
  |     [D4] TemplateEngine(pbj_bast, {...defaults, ...pbjForm.bast})
  |     [D5-A] TemplateEngine(pbj_nego_banding, {...defaults, ...nego, produkI/II})
  |     [D5-B] TemplateEngine(pbj_nego_hasil, {...defaults, ...nego, tabelItems})
  |
  +-- PANEL (previewDocs.js pbjDocs(pbjForm) BARU, mirror 1:1 area cetak):
        6 docs (key/label di REQUIREMENTS F-PBJ6); PanelPreviewDocument reuse TANPA ubah logika
        skip doc kosong-total → pesan jujur; PanelPreviewDocument + DokumenKelengkapanPage
        split-view ikut pola sticky 009 (reuse, bukan ubah ulang)
```

State dan aliran data:

- Satu sumber: pbjForm (+ invoiceMeta) di DokumenKelengkapanPage; setiap onChange/upload/prefill → re-render ringkasan + panel live (props turun, tanpa state ganda, tanpa debounce khusus).
- Helper murni BERSAMA (satu logika, dipakai editor + cetak + panel): parseInvoiceSIPLah + terapkanPrefillPbj(formLama, {invoice, bku}) → {formBaru, tertimpa[]} (pola snapshot 005). Lokasi: aturanPbj.js (≤200 baris) atau split sibling bila lewat — putuskan saat dry run.
- D5 gabung 2 sheet → 1 doc 2 seksi: data Seksi A (pembandingan) + Seksi B (negosiasi) dari pbjForm.nego yang sama; render 2x TemplateEngine config berbeda (pbj_nego_banding vs pbj_nego_hasil), bukan 1 config ganda.
- Checkbox BAST Sesuai/Belum + Baik/Rusak: field select/radio layar (editable) → cetak sebagai teks bertanda (mis. "[X] Sesuai") via table-fields existing; TANPA block baru bila bisa (putuskan saat dry run; bila perlu max 1 block kecil).

## File Baru (maks 2)

| File | Isi |
|---|---|
| spj-frontend/src/utils/aturanPbj.js (≤200 baris) | parseInvoiceSIPLah + terapkanPrefillPbj + format helpers (keISO reuse dari aturanUndangan, tanggalPanjang reuse); JANGAN duplikat SNAP (reuse aturanUndangan) |
| (opsional, bila >200) spj-frontend/src/utils/aturanPbjInvoice.js | Split parse vs prefill; putuskan saat dry run |

## File Diubah (maks 4 — tanpa sentuh cetak existing)

| File | Bagian | Sifat |
|---|---|---|
| spj-frontend/src/data/templateConfig.js | 5 config PBJ baru (pbj_perencanaan, pbj_pesanan, pbj_bahp, pbj_bast, pbj_nego_banding, pbj_nego_hasil = 6 key / 5 dokumen) | Tambah saja; 13 config existing DILARANG disentuh; portrait; blocks reuse existing; Config ≤150 baris per penambahan (bila bengkak → pecah pbjTemplates.js diimpor — putuskan dry run) |
| spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx | Section PBJ split + upload + 5 tabs + ringkasan + area cetak + panel | Selalu tampil; toggle SIPLAH tak sembunyikan PBJ; Component ≤300 baris delta minimal (file sudah besar — strategi tambah minimal, JANGAN pecah file di luar cakupan) |
| spj-frontend/src/utils/previewDocs.js | pbjDocs(pbjForm) baru + ekspor | Mirror 1:1 area cetak; skip kosong jujur; Utility ≤200 baris delta |
| spj-frontend/src/pages/dashboard/BKUPage.jsx (atau BKUSidebar.jsx — putuskan dry run) | Tombol "Lengkapi PBJ" per baris PEMBAYARAN | Kirim location.state {fromBKU, transaksi, ts}; tambah saja, logika BKU lain TETAP |

> DILARANG sentuh: 13 config existing + TemplateEngine.jsx + blocks/* existing (selain max 1 block baru bila diputuskan) + dokumen mamin/honor/transport/upah + sekolahData/signatureRoles/storageHelper/index.css/package.json + pdfTableExtractor.js (reuse apa adanya). Larangan warisan: tanpa TTD digital, tanpa KIRIM server, tanpa QR, tanpa navy, 0 lib baru, tanpa blob PDF di localStorage.

## Dependensi (ter-pin eksak — dari package.json ASLI 2026-10-08)

react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.4, lucide-react 0.344.0, xlsx 0.18.5, pdfjs-dist 4.10.38, @heyputer/puter.js 2.5.4; dev: @types/react 18.3.31, @types/react-dom 18.3.7, @vitejs/plugin-react 4.7.0, autoprefixer 10.5.2, postcss 8.5.16, tailwindcss 3.4.19, vite 5.4.21. KLARIFIKASI: "baca PDF tanpa lib" = TANPA LIB BARU — pdfjs-dist 4.10.38 sudah ada dan dipakai (bukan penambahan). Upload-baca = pdfjs existing + pdfTableExtractor existing + aturanPbj murni; tanpa worker baru, tanpa CDN, offline penuh.

## Storage/kertas/warna/aksesibilitas (ringkas, ikut ARCHITECTURE Premium + pack 009)

- Storage: spj_pbj_form + spj_pbj_invoice_meta (baru, prefix spj_ via storageHelper) + spj_dokumen_kelengkapan_status (reuse) + spj_otomatis_snapshot (reuse 1 slot). File biner PDF TIDAK disimpan.
- Kertas A4 mm, orientasi via templateConfig orientation (kelima config portrait). Panel ScaledPaper reuse (210/297mm, zoom, print:hidden, @media print).
- Token: BLUE-ONLY #004ac6 + slate; figcaption per dokumen sesuai F-PBJ6; urutan cetak D1→D2→D3→D4→D5-A→D5-B tetap.
- Aksesibilitas: section+h2 per dokumen; upload input labelled + aria-live hasil baca; tabs keyboard-operable (arrow/home/end bila tablist); focus-visible; prefers-reduced-motion; target 44px.
