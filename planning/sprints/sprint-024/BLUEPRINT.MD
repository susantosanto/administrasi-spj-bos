# BLUEPRINT.MD — Sprint 024

## File baru (6)
1. `spj-frontend/src/utils/realisasiPeta.js` — KOMPONEN[12] (label persis PDF) + PETA prefix→komponen + `petaKomponen(kodeRekening)` + `isHonor(uraian/kode)`. ≤200 baris (Constitution: util 200).
2. `spj-frontend/src/utils/realisasiAgregat.js` — `agregat(txs, {tahun, tahap})` → {matrix, jumlahBaris, jumlahKolom, total, selisihBku, belumDipetakan[]}; terapkan koreksi via `denganKoreksi(agregat, koreksi)`.
3. `spj-frontend/src/components/templates/blocks/TabelRealisasi.jsx` — matriks 7×13 + JUMLAH (cetak murni + placeholder jujur).
4. `spj-frontend/src/components/templates/blocks/InstrumenBos.jsx` — seksi A–E + footer (cetak murni).
5. `spj-frontend/src/pages/dashboard/InstrumenPage.jsx` — form A/B/C/E + preview + cetak (pola DokumenKelengkapanPage kas split-view).
6. `planning/sprints/sprint-024/probe-024.mjs` — oracle node (import util via shim pola probe-023).

## File diubah (5, minimal)
1. `data/templateConfig.js` — TAMBAH `realisasi_dana` + `instrumen_bos` (dokumen lain 0 diff).
2. `components/templates/blocks/index.js` + `TemplateEngine.jsx` — registrasi 2 blok.
3. `utils/previewDocs.js` — TAMBAH `realisasiDocs()` + `instrumenDocs()` (kasDocs/PBJ tak tersentuh).
4. `pages/dashboard/RealisasiPage.jsx` — matriks + koreksi + cetak (status cards tetap).
5. `pages/dashboard/DataSekolahPage.jsx` — 5 field baru (deep-merge; cek pola mergePejabat).
6. `App.jsx` + menu sidebar — TAMBAH route `/instrumen` + 1 item menu (temuan dry-run D-1; RealisasiPage sudah ada di `/realisasi`).

## DILARANG
Area AI, dokumen PBJ/kas/LPJ existing, prefix selain `spj_`, lib baru, impor Excel realisasi, QR/TTD digital.

## Urutan implementasi
Peta → agregat (+probe lawan PDF Tahap 1) → store → template+blok → previewDocs → RealisasiPage → DataSekolah → InstrumenPage → build+probe → STATE.
