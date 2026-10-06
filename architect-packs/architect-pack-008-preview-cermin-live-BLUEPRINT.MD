# BLUEPRINT — Sprint 008: Preview Cermin Live (layar-only, 0 ubah cetak)

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2). 0 dependency baru. Tech stack terkunci ADR.
> Verifikasi via read-only 2026-10-05/06 (tanpa ubah src): DokumenFormPreview.jsx (form tujuan 005/006/007) + SummaryCard.jsx (ringkasan jujur em-dash) + PeringatanData.jsx (peringatan + tautan aksi) + SkHonorerEditor.jsx (Data Surat grid + readiness badge) + TemplateEngine.jsx mode=print di .print-area + templateConfig.js orientation + storageHelper prefix spj_ (BRIEF RISET task 16).

## Arsitektur (3 zona layar-only di atas editor existing)

```text
DokumenSPJPage.jsx (accordion card + snapshot spj_otomatis_snapshot — reuse, tanpa ubah alur)
  |
  +-- ZONA A — FORM (kiri/tengah, editor premium, 1 file)
  |     DokumenFormPreview.jsx DIREVISI-KECIL:
  |     Data Surat grid (nomor, tanggalDanaMasuk langkah-1 eksplisit, tempat)
  |     + penerima + konten berulang CRUD (reuse pola SkHonorerEditor)
  |     + onDataChange(formData) -> naik ke parent (sudah ada, tanpa debounce khusus)
  |
  +-- ZONA B — CERMIN LIVE (kanan sticky, murni baca formData)
  |     SummaryCard.jsx DIREVISI-KECIL (sticky top, tanpa kop/TTD penuh):
  |     badge LENGKAP / N-PERLU-DIISI (sinyal layar-only) + label DIPERBARUI OTOMATIS
  |     (aria-live polite + dot pulse CSS, hormati prefers-reduced-motion)
  |     + tombol "Cek" -> readinessCheck(formData) -> highlight dashed field kosong
  |       pertama + scrollIntoView + focus
  |     + kontrol zoom (scale 0.5-1.5 pada kontainer Zona B saja) / Reset 100% /
  |       fullscreen (requestFullscreen pada panel Zona B)
  |     .print-container (mm, A4) TIDAK TERSENTUH
  |
  +-- ZONA C — GATE PRA-CETAK (bawah form, screen-only)
        PeringatanData.jsx DIREVISI-KECIL + checkbox pernyataan konfirmasi
        + tombol Cetak (window.print + tulis snapshot) :
        gate UI = Cetak disabled/jujur bila checklist belum centang ATAU
        readinessCheck masih ada pelanggaran (tampil peringatan, bukan blokir browser)
```

State dan aliran data:

- Satu sumber: formData di parent (DokumenSPJPage / DokumenFormPreview), turun sebagai props ke Zona B dan Zona C. Setiap onChange -> re-render Zona B + update badge + label live. Tanpa state ganda, tanpa debounce khusus (data kecil, localStorage).
- readinessCheck(formData): fungsi murni di util existing atau inline Zona B — kembalikan daftar pelanggaran (field kosong wajib + penerima belum lengkap). Dipakai tombol Cek DAN gate Zona C (satu logika, dua pemakai).
- Zoom: useState zoom (0.5-1.5, default 1) -> style transform scale pada div Zona B saja. Reset = set 1. Fullscreen = panelRef.requestFullscreen() + fallback jujur bila ditolak browser.
- Tanggal dana masuk langkah-1: angkat tanggalCetak/tanggalBayar SignatureFooter jadi field eksplisit baris pertama Data Surat Zona A (label+Tanggal dana masuk + input date), tulis ke formData yang sama.

## File Baru (batas: 0 — revisi existing saja)

| File | Isi |
|---|---|
| (tidak ada) | Semua masuk revisi 3 file di bawah; bila readinessCheck melebihi 200 baris util maka ikut pola 006/007 (pecah sibling util) — putuskan saat dry run |

## File Diubah (maks 3 — tanpa sentuh cetak)

| File | Bagian | Sifat |
|---|---|---|
| spj-frontend/src/components/templates/DokumenFormPreview.jsx | ZONA A + rakitan 3 zona | Data Surat grid tambah tanggal dana masuk langkah-1; susun layout form + Zona B + Zona C; teruskan formData + onDataChange; tetap 1 editor, Component max 300 baris |
| spj-frontend/src/components/templates/SummaryCard.jsx | ZONA B | Sticky + badge LENGKAP/N-perlu + label DIPERBARUI OTOMATIS (aria-live) + tombol Cek + zoom/Reset/fullscreen (CSS transform layar saja); tanpa kop/TTD penuh (aturan Sprint 003 US-19/20); Component max 300 baris |
| spj-frontend/src/components/templates/PeringatanData.jsx | ZONA C | Checklist pernyataan screen-only + gate (Cetak disabled + peringatan jujur) + tombol Cetak window.print + snapshot; Component max 300 baris |

> DILARANG sentuh: blocks/* (KopSurat, HeaderDokumen, TabelDinamis, SignatureFooter), TemplateEngine.jsx, templateConfig.js, sekolahData.js, signatureRoles.js, print-area, .print-container, file Sprint 003/004 kecuali impor util murni. Util parser 005/006/007 (bkuKategori, aturanUndangan, aturanMamin) tidak ditulis ulang (reuse). Larangan eksplisit warisan BRIEF: tanpa TTD digital, tanpa tombol KIRIM server, tanpa QR, tanpa warna navy, 0 lib baru.

## Dependensi (ter-pin eksak — dari package.json ASLI 2026-10-03, samakan 005/006/007)

react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.4, lucide-react 0.344.0, xlsx 0.18.5, pdfjs-dist 4.10.38, @heyputer/puter.js 2.5.4; dev: @types/react 18.3.31, @types/react-dom 18.3.7, @vitejs/plugin-react 4.7.0, autoprefixer 10.5.2, postcss 8.5.16, tailwindcss 3.4.19, vite 5.4.21. 0 TAMBAHAN — zoom/fullscreen = CSS transform + requestFullscreen bawaan browser; live = onChange React existing; tanpa lib preview/PDF/QR/TTD.

## Desain visual dan aksesibilitas (ringkas, ikut ARCHITECTURE Premium + BRIEF bab 3)

- Token tetap: BLUE-ONLY #004ac6 + slate (primary blue-600 gradient + slate); cardSelectedClass border-primary ring-4 primary/10 untuk item aktif; badge sinyal teks+ikon (bukan warna saja).
- Layout: desktop split-view (form kiri + cermin sticky kanan); mobile tumpuk (cermin di bawah form, sticky dimatikan). Sticky hanya CSS position, tidak ubah DOM cetak.
- Aksesibilitas: section + h2 per zona; kontrol zoom/Cek/Cetak tombol asli keyboard-operable; focus-visible jelas; aria-live polite pada status live; prefers-reduced-motion matikan pulse/transisi; target sentuh min 44px.
