# BLUEPRINT - Sprint 027 (ringkas: bug fix known cause)

Satu paragraf cara: di `DokumentasiAIGenerate.jsx`, `orangWithPhotos` dibangun dari
entri `personelPhotos` apa adanya (daftar `{id, label, dataUrl}` — label peran dari
peta lokal `kepsek/guru/tendik/pengawas`, fallback id bila tak dikenal) bukan dari
`data_guru`; `selectedOrang` keyed by id peran; `faceImages` = dataUrl entri terpilih;
fallback = entri pertama bila `butuhOrang` dan pilihan kosong; `guruStr` prompt memakai
label peran; `orangHasPhotos` = ada entri ber-dataUrl.

## File

1. `spj-frontend/src/components/dokumentasi/DokumentasiAIGenerate.jsx` — UBAH ±15 baris
2. `planning/sprints/sprint-027/probe-027.cjs` — BARU (Playwright: checkbox peran tampil,
   input_images ke Puter berisi wajah+ruang via intercept `/drivers/call`)

## Dependensi (pinned, baru: NIHIL)

- react 18.3.1, vite 5.4.21, vitest 2.1.9.

## Tasks (DoD = perintah hijau)

- T-1 Patch reader peran + prompt label. DoD: `npm run build` exit 0. (Non-hot-path.)
- T-2 probe-027.cjs: seed bentuk writer asli → checkbox peran muncul → intercept
  txt2img → `input_images.length ≥ 2` (wajah + ruang). DoD: PASS semua.
