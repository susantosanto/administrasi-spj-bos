# BLUEPRINT - Sprint 026 (ringkas: bug fix known cause)

Satu paragraf cara: `resizeImage` (`imageGenerator.js:374`) diberi `img.onerror` +
timeout 5 dtk yang me-reject Error Indonesia, dan semua pemanggilnya (upload owner,
ruang lokal, wajah) menangkap reject → toast error tanpa menimpa file lama; audit
semua cabang catch di `DokumentasiAIGenerate.jsx` + `imageGenerator.js` dinormalisasi
lewat satu pemeta pesan (kode → Indonesia) dengan CTA "Unggah foto" selalu terlihat
saat gagal; `setSlotAktif(null)` dipindah ke `finally` semua jalur generate/stop;
ditambah dokumen baru `planning/sprints/sprint-026/PANDUAN-UJI-VISUAL.MD`.

## File

1. `spj-frontend/src/services/imageGenerator.js` — UBAH `resizeImage` (+onerror/timeout)
2. `spj-frontend/src/components/dokumentasi/DokumentasiAIGenerate.jsx` — UBAH catch + finally + CTA
3. `planning/sprints/sprint-026/PANDUAN-UJI-VISUAL.MD` — BARU
4. `planning/sprints/sprint-026/probe-026.mjs` — BARU (Playwright: upload rusak, Stop, error)

## Dependensi (pinned, tanpa yang baru)

- react 18.3.1, vite 5.4.21, vitest 2.1.9, pdfjs-dist 4.10.38 — baru: NIHIL.

## Tasks (DoD = perintah hijau, output ditempel)

- T-1 `resizeImage` onerror+timeout. DoD: `npm run build` exit 0. (Non-hot-path: tanpa DSA.)
- T-2 Audit + normalisasi catch + CTA gagal + finally bersih. DoD: `npm run build` exit 0.
- T-3 Tulis PANDUAN-UJI-VISUAL.MD. DoD: dokumen ada + checklist T-03/T-04 lengkap.
- T-4 probe-026.mjs + jalankan (upload rusak ≤2 dtk error, Stop bersih, 0 hang). DoD: PASS semua.
