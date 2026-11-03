# BLUEPRINT - Sprint 025: Upload BKU PDF 3 Mode

## Arsitektur Sistem

```
PDF bulanan/semester/tahunan
  → parse (existing bkuParser/bkuPdf*) + tandai tipe baris + periode
  → mergePeriode (tambah/ganti per periode | ganti semua utk tahunan)
  → urut kronologis → tulis atomik spj_bku_data → tampil + toast
```

## Tech Stack (tidak diputuskan ulang; versi pinned dari package-lock)

- react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.4, pdfjs-dist 4.10.38, xlsx 0.18.5
- vite 5.1.4 (tooling 5.4.21 terinstal — JANGAN upgrade, pakai yang ada), vitest 2.1.9, tailwindcss 3.4.19
- Dependensi baru: NIHIL.

## File yang Diubah / Dibuat

1. `spj-frontend/src/utils/bkuPeriode.js` (BARU) — util murni: `kunciPeriode`, `mergePeriode`, `urutKronologis`, `hashFile`, `agregatMurni`.
2. `spj-frontend/src/utils/__tests__/bkuPeriode.test.js` (BARU) — unit test util di atas.
3. `spj-frontend/src/utils/bkuParser.js` (UBAH kecil) — tambah tipe baris + metadata periode per baris hasil parse; tidak ubah logika baca layout.
4. `spj-frontend/src/components/bku/BKUUploadPdf.jsx` (UBAH) — dropdown 3 mode + pemilih periode + tulis via `mergePeriode`; HAPUS form koreksi inline/exclude; konfirmasi hanya untuk mode Tahunan.
5. `spj-frontend/src/pages/dashboard/BKUPage.jsx` (UBAH kecil) — teruskan mode; penanda periode pada tampilan gabungan.
6. `planning/sprints/sprint-025/probe-025.mjs` (BARU) — skrip verifikasi angka vs PDF (lihat ACCEPTANCE).

## Tasks (2–5 menit per task; DoD = perintah hijau, output ditempel sebagai bukti)

- T-1 Buat `bkuPeriode.js` (`kunciPeriode`, `urutKronologis`). DoD: `npx vitest run src/utils/__tests__/bkuPeriode.test.js`.
  DSA: array + `Array.sort` komparator tanggal — operasi terpanas sort O(n log n) — n = ratusan baris, cukup.
- T-2 Tambah `mergePeriode` + `hashFile` + test tambah/ganti/idempotent. DoD: perintah sama hijau.
- T-3 Tambah `agregatMurni` (kecualikan SALDO_AWAL/JUMLAH/BUNGA_NOL) + test vs angka Jumlah Maret & April. DoD: perintah sama hijau.
- T-4 Patch `bkuParser.js`: tipe baris + metadata periode (tanpa ubah layout reader). DoD: `npx vitest run src/utils/__tests__/bkuParser.test.js` hijau (regresi nol).
- T-5 Patch `BKUUploadPdf.jsx`: dropdown 3 mode + pemilih periode + hapus form koreksi + konfirmasi tahunan. DoD: `npm run build` exit 0.
- T-6 Patch `BKUPage.jsx`: penanda periode + teruskan mode. DoD: `npm run build` exit 0.
- T-7 Tulis `probe-025.mjs` + jalankan bukti angka Maret/April. DoD: probe PASS semua (lihat ACCEPTANCE).
- T-8 Uji browser manual halaman BKU (upload Maret→April→Maret-ulang→Tahunan) + screenshot. DoD: 4 langkah sesuai harapan + build hijau.

## Dependensi antar-task

T-1 → T-2 → T-3 → T-4 → T-5 → T-6 → T-7 → T-8 (sekuensial; satu builder).
