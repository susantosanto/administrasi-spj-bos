# BLUEPRINT — Sprint 009: Pecah Surat Pesanan 2 Dokumen + Sticky Panel (layar + cetak pesanan saja)

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2, salin dari pack 008 ASLI 2026-10-03). 0 dependency baru. Tech stack terkunci ADR.
> Verifikasi via read-only 2026-10-06 (tanpa ubah src): templateConfig.js pesanan_mamin (portrait, table-letter-header tanpa rightAlignBottom, table-dinamis NO/URAIAN/SATUAN/JUMLAH, table-fields hari/jenis/jumlah) + aturanMamin.js MENU_PESANAN/bangunPesananDuaSeksi/templatePesananMamin + DokumenFormPreview.jsx (editor seksi 1263-1368, SummaryCard pesanan 1829-1840, print-area 1843-1870, TemplateEngine pesanan_mamin 1857-1865) + previewDocs.js maminDocs() 1 doc pesanan + PanelPreviewDocument.jsx ScaledPaper/root lg:sticky + DokumenSPJPage.jsx grid 620/700 items-start + aside print:hidden.

## Arsitektur

```text
formData (TETAP: 1x nomorPesanan/perihalPesanan/isiPesanan + pesananRows[].seksi + seksiPesanan{nasi,snack})
  |  form input TIDAK berubah (editor 1263-1368 reuse apa adanya)
  |
  +-- FASE A — PECAH (data sama, render 2x terfilter; perihal/rows/no per Keputusan 2-4)
  |     |
  |     +-- (A1) DokumenFormPreview renderPreview SummaryCard: 1 kartu -> 2 kartu
  |     |     "Surat Pesanan — Nasi Box" (rows filter seksi, count N) +
  |     |     "Surat Pesanan — Snack Box" (count M); skip seksi mati; kedua mati -> pesan jujur
  |     |
  |     +-- (A2) DokumenFormPreview renderPreview .sk-print-area: 1x .sk-doc-print -> 2x .sk-doc-print
  |     |     [Nasi]: TemplateEngine(pesanan_mamin, {...defaults, ...formData,
  |     |        perihalPesanan: "{perihal} — Nasi Box", jenisPesanan: 'Nasi Box',
  |     |        kegiatan: isiPesanan||acara, rows: filter Nasi renumber 1..N})
  |     |     [Snack]: TemplateEngine(pesanan_mamin, {...defaults, ...formData,
  |     |        perihalPesanan: "{perihal} — Snack Box", jenisPesanan: 'Snack Box',
  |     |        kegiatan: isiPesanan||acara, rows: filter Snack renumber 1..M})
  |     |     nomorPesanan SAMA di kedua (Keputusan 2); fallback warisan ikut Nasi
  |     |
  |     +-- (A3) previewDocs.js maminDocs(): 1 doc -> 2 docs (mirror 1:1 area cetak)
  |           {key:'pesanan-nasi', label:'Surat Pesanan — Nasi Box', templateConfig: pesanan_mamin, data: <sama dgn A2 Nasi>}
  |           {key:'pesanan-snack', label:'Surat Pesanan — Snack Box', templateConfig: pesanan_mamin, data: <sama dgn A2 Snack>}
  |           PanelPreviewDocument reuse TANPA ubah logika render (ScaledPaper + TemplateEngine mode=print)
  |
  +-- FASE B — STICKY (SETELAH A hijau; CSS-only, tanpa ubah builder/cetak)
        DokumenSPJPage.jsx aside + PanelPreviewDocument root:
        desktop lg+ sticky top-[offset header] + max-h-[calc(100vh-offset)] + overflow-y-auto
        (scrollbar-gutter stable, pola anti-loop existing); <lg static menumpuk;
        print:hidden + @media print display:none dipertahankan
```

State dan aliran data:

- Satu sumber tetap: formData (+ sppdData tak terkait pesanan). Setiap onChange rows/toggle -> re-render A1+A3 live (props turun, tanpa state ganda, tanpa debounce khusus).
- Helper murni BERSAMA (satu logika, tiga pemakai A1/A2/A3 — putuskan lokasi saat dry run: inline maminDocs vs sibling util ≤200 baris, ikut pola 006/007 bila >200): `bagiPesananPerSeksi(formData) -> {nasi: {rows, count}, snack: {rows, count}}` — filter strict + fallback warisan->Nasi + renumber 1..N + perihal suffix + jenis override. Dipakai SummaryCard preview, print-area builder, DAN maminDocs (mirror wajib identik).
- Sticky (B): murni CSS position:sticky pada wrapper panel (root existing lg:sticky dipertahankan/diverifikasi); offset top samakan offset scroll existing (-80/header); max-h viewport + overflow internal agar panel panjang tak mendorong halaman; tanpa JS ukur baru (reuse ResizeObserver ScaledPaper anti-loop); prefers-reduced-motion dihormati.

## File Baru (batas: 0 — revisi existing saja)

| File | Isi |
|---|---|
| (tidak ada) | Helper bagi-per-seksi masuk previewDocs.js atau sibling util existing bila ≤200 baris; putuskan saat dry run |

## File Diubah (maks 3 — tanpa sentuh cetak selain pecahan pesanan)

| File | Bagian | Sifat |
|---|---|---|
| spj-frontend/src/utils/previewDocs.js | FASE A (A3) | maminDocs(): 1 doc pesanan -> 2 docs pesanan-nasi/snack via helper bersama; skip seksi mati; fallback warisan->Nasi; Utility max 200 baris |
| spj-frontend/src/components/templates/DokumenFormPreview.jsx | FASE A (A1+A2) | SummaryCard 1->2 kartu + print-area 1x .sk-doc-print -> 2x (data terfilter, perihal suffix, no ulang, nomor sama); editor form (1263-1368) TETAP; Component max 300 baris |
| spj-frontend/src/components/templates/PanelPreviewDocument.jsx (+ sentuh CSS aside di DokumenSPJPage.jsx bila perlu — hitung 1 file ke-3) | FASE B | Sticky offset/max-h/overflow + verifikasi print:hidden; tanpa ubah ScaledPaper/TemplateEngine/render docs; Component max 300 baris |

> DILARANG sentuh: templateConfig.js (pesanan_mamin dipakai 2x apa adanya; rightAlignBottom tetap false), TemplateEngine.jsx, blocks/* (KopSurat/HeaderDokumen/TabelDinamis/SignatureFooter/TabelLetterHeader), dokumen mamin lain + honor/transport/upah, sekolahData/signatureRoles/storageHelper, index.css selain verifikasi print existing, package.json. Editor form pesanan (tambah/ubah/hapus/toggle) TETAP. Larangan warisan: tanpa TTD digital, tanpa KIRIM server, tanpa QR, tanpa navy, 0 lib baru.

## Dependensi + storage/kertas (ter-pin eksak + prefix spj_ + A4 mm via orientation)

- Storage: prefix spj_ via storageHelper (JANGAN ubah); kertas A4 mm, orientasi via templateConfig.js orientation (DILARANG ubah).

## Dependensi (ter-pin eksak — dari package.json ASLI 2026-10-03, samakan 005/006/007/008)

react 18.3.1, react-dom 18.3.1,  react-router-dom 6.30.4, lucide-react 0.344.0, xlsx 0.18.5, pdfjs-dist 4.10.38, @heyputer/puter.js 2.5.4; dev: @types/react 18.3.31, @types/react-dom 18.3.7, @vitejs/plugin-react 4.7.0, autoprefixer 10.5.2, postcss 8.5.16, tailwindcss 3.4.19, vite 5.4.21. 0 TAMBAHAN — pecah = filter+render ulang TemplateEngine existing; sticky = CSS position + overflow bawaan browser; tanpa lib preview/PDF/QR/TTD.

## Desain visual dan aksesibilitas (ringkas, ikut ARCHITECTURE Premium + pack 008)

- Token tetap: BLUE-ONLY #004ac6 + slate; figcaption per surat "Surat Pesanan — Nasi Box/Snack Box" (h2/section per surat di preview legacy; panel figcaption existing reuse label doc).
- Layout: urutan Nasi lalu Snack (tetap) di ketiga titik; tiap .sk-doc-print ganti halaman; desktop split-view grid 620/700 existing; panel sticky kanan + scroll internal; mobile tumpuk sticky mati.
- Aksesibilitas: section + h2 per surat pecahan; sticky tak jebak fokus (panel scroll internal keyboard-reachable); focus-visible jelas; aria-live polite status tetap; prefers-reduced-motion matikan pulse/transisi; target sentuh min 44px.
