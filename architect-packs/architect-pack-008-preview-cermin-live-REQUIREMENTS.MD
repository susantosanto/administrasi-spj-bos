# REQUIREMENTS — Sprint 008: Preview Cermin Live (DOCS-ONLY pack)

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa dan mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: BRIEF RISET Panel Preview ala SIMENULIS (task 16, note c604c57c-635d-4ad3-a24b-6063cbbe3e48, 2026-10-05) + docs/ARCHITECTURE.MD bab 2 wajah + CONSTITUTION.md + AGENTS.MD.
> Sprint 007 = revisi parser + hadir + menu pesanan. Sprint 008 = lapisan preview layar-only di atas editor existing — bukan tab baru, bukan dokumen baru, bukan ubah cetak.

## Tujuan (satu goal — Bab 10.3)

Operator mengisi form dan LANGSUNG melihat cerminnya di panel kanan yang sinkron live (badge + tombol Cek + zoom), lalu melewati gate checklist pra-cetak sebelum menekan Cetak — tanpa pernah melihat dokumen formal penuh di tab, tanpa ubah hasil cetak.

## Pengguna

- Operator sekolah (1-2 orang, tidak teknis) — pengguna utama, isi form + cek cermin + cetak
- KS dan bendahara — penandatangan basah di spasi kosong SignatureFooter (bukan TTD digital)

## Sumber Data (as-is, tidak diubah)

- Editor existing: spj-frontend/src/components/templates/DokumenFormPreview.jsx (form tujuan 005/006/007) + pola SkHonorerEditor.jsx (Data Surat grid + penerima + CRUD konten berulang + readiness badge Siap Cetak / N perlu diisi)
- Cermin existing: SummaryCard.jsx (title + sections + fields + table, kosong tampil em-dash jujur) + PeringatanData.jsx (peringatan + tautan aksi) + accordion card DokumenSPJPage.jsx
- Live existing: onDataChange re-render TemplateEngine/SummaryCard tiap onChange (sudah live secara teknis, tinggal label eksplisit)
- Formal steril (read-only, acuan): TemplateEngine.jsx mode=print di .print-area (display:none layar, block saat print) + blocks/* (KopSurat, HeaderDokumen, TabelDinamis, SignatureFooter) + templateConfig.js orientation (A4, satuan mm)
- Storage: localStorage prefix spj_ via storageHelper; snapshot spj_otomatis_snapshot (reuse 005/006/007, 1 slot terakhir per dokumen)
- Tanggal langkah-1: data.tanggalCetak / data.tanggalBayar di SignatureFooter.jsx (mode edit = input date dashed underline) + Data Surat grid SkHonorerEditor

## Keputusan Kunci (final — dari BRIEF verdict, bukan opsi)

1. Adopsi BISA saja (5 item, tanpa ADR baru): badge live DIPERBARUI OTOMATIS, tombol Cek, checklist pra-cetak, zoom/Reset/fullscreen, angkat tanggal dana masuk jadi field langkah-1 eksplisit di Data Surat.
2. DICORET permanen atas perintah user 2026-10-05 — DILARANG masuk rekomendasi maupun backlog: TTD digital (+Undo/Hapus), QR di badan surat.
3. TIDAK diadopsi (butuh backend/pack, langgar aturan): tombol KIRIM ke server (tanpa backend, DECISIONS.MD 2026-09-13; padanan sah = tombol Cetak window.print), warna navy/oranye SIMENULIS (langgar blue-only).
4. Prinsip cermin: preview tab = CERMIN form (SummaryCard/Editor premium, tanpa kop/TTD penuh). Dokumen formal penuh HANYA di .print-area. Menampilkan formal penuh sebagai tampilan tab DILARANG (ARCHITECTURE 2 wajah).
5. Warna sinyal (badge LENGKAP, DIPERBARUI OTOMATIS) = pengecualian sah indikator status sementara di layar, tidak pernah ikut cetak (AGENTS.MD + CONSTITUTION).

## Fungsi (F1-F3 = 3 zona layar-only)

- F1 — ZONA A (form editor, kiri/tengah): Data Surat grid (nomor, tanggal dana masuk langkah-1, tempat) + penerima + konten berulang CRUD — semua editable inline, tetap 1 editor.
- F2 — ZONA B (cermin live, kanan sticky): SummaryCard sticky sinkron live + badge LENGKAP/N-perlu + label DIPERBARUI OTOMATIS (aria-live polite, dot pulse CSS) + tombol Cek (readiness check, highlight dashed field kosong pertama + scroll + fokus) + zoom 50-150 persen / Reset 100 persen / fullscreen (hanya ubah tampilan layar, bukan cetak).
- F3 — ZONA C (gate pra-cetak, bawah): checklist pernyataan konfirmasi (screen-only checkbox) + tombol Cetak (window.print + snapshot). Cetak terhalang jujur bila checklist belum centang / masih ada field wajib kosong (gate UI + peringatan, bukan blokir paksa browser).

## Batasan

- 0 dependency baru; BLUE-ONLY #004ac6 + slate (navy/oranye DILARANG); badge sinyal layar-only tak ikut cetak
- Kertas A4 wajib, satuan mm, orientasi via templateConfig.js orientation (DILARANG ubah)
- localStorage prefix spj_ via storageHelper (JANGAN ubah); kunci snapshot tetap spj_otomatis_snapshot
- DILARANG ubah dokumen formal cetak (blocks/*, TemplateEngine.jsx, templateConfig.js, print-area, .print-container) — 3 zona hanya baca formData + CSS layar
- DILARANG: TTD digital, KIRIM server, QR, warna navy, lib baru, ubah cetak (lihat Keputusan Kunci 2-3)
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat preview)
- Aksesibilitas wajib: semantic section/h2 per zona; semua kontrol keyboard-operable; focus-visible jelas; badge tidak andalkan warna saja (teks + ikon); hormati prefers-reduced-motion; target sentuh min 44px
- Batas file: Component max 300 baris, Utility max 200 baris, Config max 150 baris (Constitution); HANDOFF wajib dry-run-first + TUNGGU persetujuan
