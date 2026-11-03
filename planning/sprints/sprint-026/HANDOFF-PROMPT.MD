# HANDOFF PROMPT - Sprint 026: Fix Demo Generate Foto AI

Anda adalah BUILDER (Bab 8.5–8.6, 10.4 Phase B–E). Satu tujuan: demo generate foto
AI tidak pernah macet diam-diam (Rp 0, tanpa top-up).

## Wajib baca dulu

1. `AGENTS.MD` (aturan builder)
2. `STATE.MD`, `DECISIONS.MD`
3. Pack: `planning/sprints/sprint-026/` (REQUIREMENTS, BLUEPRINT, ACCEPTANCE)
4. `docs/prd-fix-ai-foto-demo.md`
5. **WAJIB: `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD`** — patuhi D-17/D-18/D-19/D-22.
   Deviasi = persetujuan user + `DECISIONS.MD`.
6. Kode: `spj-frontend/src/services/imageGenerator.js:374` (`resizeImage`),
   `spj-frontend/src/components/dokumentasi/DokumentasiAIGenerate.jsx` (catch + state).

## Bootstrap

```bash
cd spj-frontend && npm run dev     # dev server (uji browser)
cd spj-frontend && npm run build   # build — setelah setiap perubahan kode
```

## Aturan

1. DRY RUN dulu → TUNGGU persetujuan sebelum coding.
2. Bukti (output asli, screenshot), bukan klaim.
3. JANGAN: ubah requirements; library baru; sentuh template cetak/blok cetak;
   label "ILUSTRASI AI" di cetak; ubah prompt/model (rev2 terkunci); refactor luar cakupan.
