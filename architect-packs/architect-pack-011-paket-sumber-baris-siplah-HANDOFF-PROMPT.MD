# HANDOFF-PROMPT — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt untuk builder (/ai-coding-coach MODE DRY RUN).

## Prompt (salin ke builder)

Kerjakan Sprint 011 "Paket Sumber Baris + Toggle SIPLAH PBJ". SEBELUM coding, baca WAJIB urut:
AGENTS.MD → STATE.MD → DECISIONS.MD → CONSTITUTION.md → pack planning/sprints/sprint-011/
(REQUIREMENTS.MD → BLUEPRINT.MD → ACCEPTANCE.MD → file ini).

### Bootstrap (jalankan dulu, paste output sebagai bukti setup)

```bash
cd spj-frontend && node -v && npm run build
```

Harapan: exit 0. Bila gagal, STOP dan lapor (jangan lanjut coding).

### DRY RUN dulu (WAJIB, TUNGGU persetujuan)

Laporkan: rencana per task B-01..B-09 (file + fungsi + storage key), dependensi (0 baru — daftar pin di BLUEPRINT),
risiko (mis. aturanPbj.js >200 baris → split paketPbj.js; BKUPage vs BKUSidebar untuk titik kirim),
dan keputusan A1..A6 yang TIDAK boleh diubah. TUNGGU persetujuan eksplisit sebelum coding.

### Eksekusi (setelah disetujui)

- Implementasi minimal per BLUEPRINT (maks 1 util baru + maks 4 file ubah; daftar kunci di A6).
- Setiap task: jalankan DoD mesinnya (build + grep) dan paste output sebagai bukti.
- JANGAN: ubah requirements/asumsi A1..A6; pakai library di luar BLUEPRINT; tambah tombol CRUD per baris;
  auto-tambah dari chips/keranjang; hapus permanen; sentuh config existing/TemplateEngine/blocks/package.json;
  sentuh BKU/LPJ/template selain titik "Kirim ke PBJ"; commit/push (kuasa user).
- Warna BLUE-ONLY #004ac6 + slate; A4 mm; print steril (command-bar/keranjang/chips/arsip/toggle print:hidden);
  prefix spj_; toast + badge tiap aksi kurasi; keyboard-operable; pageOverflowX=false @1280px.

### Verifikasi akhir (4 perintah regresi T-09 + T-10, paste output asli)

```bash
git diff --stat -- spj-frontend/src/data/templateConfig.js spj-frontend/src/components/TemplateEngine.jsx spj-frontend/src/components/blocks/
grep -c "sk-doc-print" spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx
grep -rn "tanda.tangan.digital\|KIRIM.ke.server\|QRCode\|navy" spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx spj-frontend/src/utils/aturanPbj.js spj-frontend/src/utils/paketPbj.js spj-frontend/src/utils/previewDocs.js || echo "LARANGAN-BERSIH"
grep -rn "print:hidden\|print-hidden" spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx | head -10
```

```bash
git diff --stat -- spj-frontend/package.json
grep -rho "spj_[a-z_]*" spj-frontend/src/utils/aturanPbj.js spj-frontend/src/utils/paketPbj.js spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx 2>/dev/null | sort -u | head -10
git status --porcelain
```

### Selesai

Update STATE.MD + checklist pack sprint-011 (C-01..C-08, T-01..T-10, E-1/E-2) + lapor hasil dengan bukti
(test output asli, screenshot). Tawarkan uji manual 2 mode (DECISIONS.MD 2026-10-01) sebelum klaim selesai.

## Cross-Artifact Consistency Check (hasil — HIJAU 2026-10-10)

- [x] Setiap item REQUIREMENTS §4 (10 scope) → BLUEPRINT: 1-3→B-03/B-04/B-05; 4→B-06; 5→B-07; 6-7→B-01; 8→B-03(+upload existing); 9→B-02; 10→B-08. §5 larangan → HANDOFF JANGAN + T-09.
- [x] Setiap task B-01..B-09 → ACCEPTANCE: B-01→T-02; B-02→T-07; B-03→T-03; B-04→T-04; B-05→T-05; B-06/B-07→T-06; B-08→T-08; B-09→T-09/T-10; T-01 = build umum.
- [x] Setiap task punya DoD mesin (build + grep) — tanpa "done" opini manusia.
- [x] ACCEPTANCE tidak menuntut fitur di luar BLUEPRINT (E-1/E-2 reuse pola sprint-010; T-09/T-10 verifikasi saja).
- [x] HANDOFF berisi bootstrap command block (node -v + npm run build) + 4 perintah regresi.
- [x] Dependensi BLUEPRINT == package.json ASLI 2026-10-10 (0 drift, 0 lib baru).
- [x] Satu sprint = satu goal (kurasi + mode SIPLAH satu paket PRD; tidak dipecah karena 10 FR satu alur "kurasi bukan CRUD").

**Verdict: HIJAU — siap handoff setelah persetujuan.**
