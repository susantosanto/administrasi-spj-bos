# REQUIREMENTS — Sprint 020: Generate Foto Dokumentasi AI Sungguhan

> Sumber: PRD.md sprint ini. Setiap requirement punya ID yang dipetakan ke gate di ACCEPTANCE.MD.

## US-01 — Generate foto riil via Puter.js txt2img
Sebagai bendahara, saat menekan "Generate Foto", saya mendapat **foto kegiatan riil**
(bukan gambar canvas placeholder) yang langsung masuk Panel Preview.

- R-1.1 `generateWithPuter` memanggil `puter.ai.txt2img(prompt, options)` sungguhan;
  blok canvas placeholder DIPINDAH menjadi fungsi fallback terpisah (bukan jalur utama).
- R-1.2 Hasil generate dikonversi ke **dataURL base64** sebelum masuk state foto
  (konsisten dengan jalur upload `useFotoDokumen.tambahFotos` yang memakai FileReader dataURL).
- R-1.3 Foto hasil generate mengalir lewat alur yang SAMA dengan Sprint 019 revisi:
  `onFotoBaru`/`onRegenerasiFoto` → `useFotoDokumen` → `fotoDocs` → Panel Preview +
  print twin `.sk-print-area`. Tidak ada jalur baru.

## US-02 — Wajah personel masuk foto (image-to-image)
Sebagai bendahara, foto personel yang saya pilih di Langkah 3 dipakai sebagai
**input image** sehingga wajahnya muncul di foto dokumentasi.

- R-2.1 Sumber input image = foto personel **yang dipilih** (`selectedOrangList` via
  `personel_photos`), BUKAN lagi `guru||kepsek||tendik` sembarangan (`DokumentasiAIGenerate.jsx:102`).
- R-2.2 Jika 1 orang dipilih → 1 input image. Jika >1 → verifikasi dukungan multi input
  (V-5); bila tidak didukung, pakai foto orang pertama + semua nama tetap di prompt.
- R-2.3 Jika TIDAK ada orang dipilih → text-to-image murni (tanpa input image), perilaku
  tetap valid.

## US-03 — Kegagalan jujur + fallback
Sebagai bendahara, kalau generate gagal (offline, error Puter, sign-in dibatalkan),
saya melihat pesan error yang jelas dan aplikasi tidak crash.

- R-3.1 Error ditampilkan di kotak error yang sudah ada (`DokumentasiAIGenerate.jsx:236-241`).
- R-3.2 Fallback canvas placeholder HANYA saat Puter gagal total, dengan label jujur
  "placeholder" (bukan mengaku foto AI).
- R-3.3 0 console error baru pada alur sukses maupun gagal.

## US-04 — UX loading & sign-in jujur
- R-4.1 Teks loading diganti "Tunggu 10-60 detik" (realita txt2img), bukan "5-15 detik".
- R-4.2 Hint di kartu AI: pemakaian pertama dapat memunculkan popup sign-in Puter (akun gratis).

## Batasan Proyek (warisan CONSTITUTION/AGENTS — tetap berlaku)
- Blue-only `#004ac6` + slate; 0 warna terlarang (violet/amber/emerald/rose/cyan/indigo).
- Komponen ≤ 200 baris (DokumentasiAIGenerate kini 305 — boleh bertambah maksimal +40 baris
  logika; jika lebih, ekstrak helper ke `services/imageGenerator.js`).
- 0 dependency baru (`@heyputer/puter.js@2.5.4` sudah ada).
- localStorage prefix `spj_` tidak berubah; state foto tetap in-memory per baris (Sprint 019).
- File tabu tidak disentuh: `bkuParser.js`, `SummaryCard.jsx`, `DokumenSPJPage.jsx`,
  `DokumenKelengkapanPage.jsx`, `templateConfig.js`.
