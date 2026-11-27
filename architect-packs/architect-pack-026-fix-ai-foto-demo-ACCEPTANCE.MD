# ACCEPTANCE - Sprint 026

## Task Gate

- `npm run build` (di `spj-frontend/`) → `✓ built in` exit 0 (T-1, T-2).
- `node planning/sprints/sprint-026/probe-026.mjs` → semua PASS (T-4).

## Kriteria

- [ ] AC-1 Gambar rusak. Given upload file bukan-gambar/rusak di slot owner; When file dipilih;
      Then toast error Indonesia ≤ 5 dtk, file lama utuh, tidak ada hang.
      Perintah: `node planning/sprints/sprint-026/probe-026.mjs`. Harapan: `AC-1 PASS`.
- [ ] AC-2 Pesan gagal. Given generate gagal (stub/error); When error terjadi;
      Then pesan Indonesia spesifik + CTA "Unggah foto" terlihat, tanpa placeholder diam-diam.
      Harapan: `AC-2 PASS`.
- [ ] AC-3 State bersih. Given generate berjalan; When Stop/error; Then slotAktif null,
      tombol Generate aktif. Harapan: `AC-3 PASS`.
- [ ] AC-4 Panduan uji. `PANDUAN-UJI-VISUAL.MD` ada + memuat prasyarat, langkah per slot
      (rapat/penyerahan/box/atk_beli), kriteria terima objektif, daftar screenshot wajib.
      Harapan: `AC-4 PASS` (cek manual isi dokumen).
- [ ] AC-5 Edge: file kosong (0 byte) diupload → ditolak dengan pesan, bukan hang. Harapan: `AC-5 PASS`.

## Demo

- Browser: upload rusak → error ≤2 dtk (screenshot); Stop saat generate → bersih (screenshot).
