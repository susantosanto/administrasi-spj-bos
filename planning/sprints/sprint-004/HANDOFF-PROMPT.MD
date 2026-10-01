# HANDOFF-PROMPT — Sprint 004: BKU → LPJ Smart Bridge (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> pack ini (`planning/sprints/sprint-004/` REQUIREMENTS, BLUEPRINT, ACCEPTANCE).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
cd D:\project\spj-app\spj-frontend && npm ci
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…E.2), file disentuh, pilihan
   file pejabat (PejabatSekolahPage vs DataSekolah — hanya 1), risiko
   (bkuKategori.js >200 baris → pecah). TUNGGU persetujuan user sebelum coding.
2. Eksekusi per bagian A→B→C→D→E; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` via upload BKU ARKAS asli bila ada; bila tidak,
   buat 6 baris sintetis (honor, mamin rapat, snack+makan AND-cocok, perjalanan,
   ATK 2 baris se-no_bukti, 1 baris tanpa rekening).
4. Batas file: `bkuKategori.js` ≤ 200 baris (pecah jadi `bkuMerge.js` bila lewat).
5. Selesai → BUILD-REPORT.MD (komit per bagian + bukti) + update STATE.MD.

## JANGAN

- Mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, file Sprint
  003; menimpa field form yang sudah terisi saat prefill; menebak kategori
  (tak dikenal = "Belum dipetakan"); refactor di luar cakupan.
