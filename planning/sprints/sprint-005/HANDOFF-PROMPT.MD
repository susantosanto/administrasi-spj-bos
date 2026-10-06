# HANDOFF-PROMPT — Sprint 005: Autogenerate Undangan + Resume (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-005/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
cd D:\project\spj-app\spj-frontend && npm ci
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…E.2), file disentuh (maks 5
   + 1 baru), pilihan editor (`DokumenFormPreview.jsx` vs `DokumenSPJPage.jsx`
   — hanya 1, default `DokumenFormPreview.jsx`), risiko (`aturanUndangan.js`
   >200 baris → pecah jadi `aturanNotulen.js`). TUNGGU persetujuan user sebelum coding.
2. Eksekusi per bagian A→B→C→D→E; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat (mamin "Beban makanan dan minuman" +
   kegiatan) + 1 Kegiatan (konsumsi snack) + 1 PerjDinas (`5.1.02.04.01.0003`
   rapat gugus); oracle notulen = 14 butir transkrip.
4. Batas file: `aturanUndangan.js` ≤ 200 baris (Constitution utility); pecah bila lewat.
5. Selesai → BUILD-REPORT.MD (komit per bagian + bukti) + update STATE.MD.

## JANGAN

- Mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); menebak kategori (tak dikenal = jujur kosong);
  refactor di luar cakupan.
