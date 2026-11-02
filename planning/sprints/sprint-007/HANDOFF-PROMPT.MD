# HANDOFF-PROMPT — Sprint 007: Revisi Parser + Hadir + Menu Pesanan (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-007/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: `intent://local/halo-task-5/note/c2acf7c0-3bc9-45a2-b2fc-f469c267a35f`
> (branch bersama, status 005+006, batas alat).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-005-autogen (Pilihan B user — JANGAN buat branch baru)
git status --porcelain
# harapan: kode 005+006 sudah ada (bkuKategori.js + aturanUndangan.js + aturanMamin.js + 2 page, uncommitted ikut kebawa)
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…E.2), file disentuh (maks 4
   + 0 baru, revisi util existing), risiko (`aturanMamin.js` 132 + menu/rows
   >200 baris → pecah jadi `aturanPesanan.js` sibling). TUNGGU persetujuan user
   sebelum coding.
2. Eksekusi per bagian A→B→C→D→E; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat jamuan (`Beban Makanan dan Minuman
   Rapat Penyusunan Silabus Jamuan Makanan Box`) + 1 Kegiatan konsumsi
   (`Konsumsi Snack Kegiatan Perpisahan Kelas 6`) + 1 tak-cocok (ATK);
   storage `data_guru` 2 + `data_tendik` 1 (lalu kosongkan untuk T-05);
   oracle menu = Nasi Box 6 item + Snack Box 4 item (lihat BLUEPRINT C.1).
4. Batas file: tiap util ≤ 200 baris (Constitution); pecah jadi
   `aturanPesanan.js` bila lewat — putuskan saat dry run.
5. Selesai → BUILD-REPORT.MD (bukti per bagian) + update STATE.MD.
   JANGAN commit, JANGAN push (kuasa user — Pilihan B).

## JANGAN

- Membuat branch baru; commit; push (branch bersama 005+006 ikut kebawa);
  mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); mengarang nama hadir/menu (tak ada di
  storage/BKU = jujur kosong/fallback konsumsi); menulis ulang
  `templateBukuTamu`/`lengkapiNotulen` 006 (reuse); refactor di luar cakupan.
