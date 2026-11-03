# HANDOFF PROMPT - Sprint 025: Upload BKU PDF 3 Mode

Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.5–8.6, 10.4 Phase B–E).

## Tugas Sprint 025 (satu tujuan)

Tombol Upload PDF halaman BKU punya 3 mode (Bulanan/Semester/Tahunan); Bulanan & Semester akumulatif,
Tahunan menggantikan semua; hapus form koreksi manual upload PDF.

## Wajib baca dulu (urutan)

1. `AGENTS.MD` (aturan builder + larangan)
2. `STATE.MD`, `DECISIONS.MD`
3. Pack sprint ini: `planning/sprints/sprint-025/` (REQUIREMENTS.MD, BLUEPRINT.MD, ACCEPTANCE.MD)
4. `docs/prd-bku-upload-mode.md`, `docs/user-flow-bku-upload-mode.md`
5. Kode terkait: `spj-frontend/src/components/bku/BKUUploadPdf.jsx`, `spj-frontend/src/utils/bkuParser.js`, `spj-frontend/src/pages/dashboard/BKUPage.jsx`

## Bootstrap (jalankan dulu)

```bash
cd spj-frontend && npm run dev     # dev server
cd spj-frontend && npm run build   # build — setelah setiap perubahan kode
npx vitest run src/utils/__tests__/bkuPeriode.test.js   # DoD T-1–T-3
```

## Aturan kerja

1. DRY RUN dulu: laporkan rencana, file yang disentuh, dependensi, risiko → TUNGGU persetujuan sebelum coding.
2. Beri bukti (output perintah asli, screenshot), bukan klaim.
3. JANGAN: ubah requirements tanpa persetujuan; pakai library di luar BLUEPRINT (nihil); refactor di luar cakupan sprint.
4. Semester = Tahap BOS (S1 = Jan–Jun, S2 = Jul–Des) — sudah dikunci, jangan diputuskan ulang.
5. Satu-satunya dialog konfirmasi baru = mode Tahunan. Tidak ada form koreksi pada alur PDF.
