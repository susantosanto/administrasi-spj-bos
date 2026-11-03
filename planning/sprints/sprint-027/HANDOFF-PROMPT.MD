# HANDOFF PROMPT - Sprint 027: Wajah Personel Masuk ke Generate AI

Anda adalah BUILDER (Bab 8.5–8.6, 10.4 Phase B–E). Satu tujuan: foto wajah terupload
benar-benar jadi referensi AI (bug key mismatch writer role-id vs reader nama).

## Wajib baca dulu

1. `AGENTS.MD` 2. `STATE.MD` 3. Pack `planning/sprints/sprint-026/` + `sprint-027/`
4. `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD` (D-17/D-18/D-19/D-22)
5. Kode: `DokumentasiAIGenerate.jsx:26,201-234,301-310` (PERSONEL_KEY, reader,
   faceImages) + `PersonelFotoTab.jsx:18-30,170` (writer, JANGAN diubah)

## Bootstrap

```bash
cd spj-frontend && npm run dev
cd spj-frontend && npm run build
```

## Aturan

1. DRY RUN dulu → TUNGGU persetujuan. (Persetujuan pack sudah ada — "ya lanjutkan".)
2. Bukti, bukan klaim. 3. JANGAN: ubah writer/PersonelFotoTab; ubah prompt pola/model;
   sentuh cetak; label cetak AI; dependensi baru; refactor luar cakupan.
