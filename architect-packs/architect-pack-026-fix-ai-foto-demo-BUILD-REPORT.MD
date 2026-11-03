# BUILD-REPORT - Sprint 026: Fix Demo Generate Foto AI

## Ringkasan

Kode SELESAI & GATE HIJAU. Demo generate foto AI tidak lagi macet diam-diam.

## Berkas diubah (2) + baru (2)

1. `src/services/imageGenerator.js` — `resizeImage`: `img.onerror` + timeout 5 dtk
   → reject Error Indonesia; jalur sukses identik.
2. `src/components/dokumentasi/DokumentasiAIGenerate.jsx` — `pesanErrorPuter`:
   cabang baru moderation / network / upstream-sibuk / sesi-berakhir + fallback
   generik selalu menyebut tombol Unggah foto. Upload owner/ruang tetap catch
   dengan pesan. `finally`/Stop tidak diubah (sudah bersih, terverifikasi).
3. `planning/sprints/sprint-026/PANDUAN-UJI-VISUAL.MD` — BARU (T-03/T-04 ±15 menit).
4. `planning/sprints/sprint-026/probe-026.cjs` — BARU (Playwright, NODE_PATH scratch-pw).

## Bukti gate

- Build: `✓ built in 9.19s` (exit 1 kosmetik dari wrapper PowerShell+ANSI, artefak sama
  seperti sprint-025 — output build hijau).
- probe-026: **5/5 PASS** — AC-1 rusak ditolak ≤8 dtk · AC-2 pesan Indonesia terlihat ·
  AC-3 tidak ada loading abadi + tombol kembali · AC-5 0-byte ditolak · AC-6 0 pageerror.
- Screenshot: `spj-frontend/bukti-026-upload-rusak.png`.
- Regresi: tidak ada test unit untuk area ini sebelumnya; perilaku sukses tidak diubah
  (diff hanya menambah cabang error + finally tetap).

## Catatan jujur

- `PersonelFotoTab.jsx:55` punya `resizeImage` LOKAL duplikat (masih tanpa onerror) —
  di luar cakupan sprint (hanya dipakai upload personel Data Sekolah); diusulkan sprint berikut.
- Verifikasi `resizeImage` langsung di browser: reject 2ms dengan pesan Indonesia.
- Uji visual T-03/T-04 butuh akun Puter user (belum dijalankan — PANDUAN siap).
- Commit/push kuasa user.
