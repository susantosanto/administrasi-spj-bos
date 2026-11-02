# HANDOFF-PROMPT — Sprint 006: Autogen Semua Tab Mamin (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-006/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: `intent://local/halo-task-5/note/c2acf7c0-3bc9-45a2-b2fc-f469c267a35f`
> (branch bersama, status 005, batas alat).
> Idea Brief: `intent://local/halo-task-5/note/7452d010-f8ad-427b-8ea8-37cf449ce9e7`.

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-005-autogen (Pilihan B user — JANGAN buat branch baru)
git status --porcelain
# harapan: kode 005 sudah ada (aturanUndangan.js + 3 file ubah, uncommitted ikut kebawa)
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…F.2), file disentuh (maks 4
   + 0 baru, reuse 005), risiko (`aturanUndangan.js` 143 + 4 fungsi baru
   >200 baris → pecah jadi `aturanMamin.js` sibling). TUNGGU persetujuan user
   sebelum coding.
2. Eksekusi per bagian A→B→C→D→E→F; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat + 1 Kegiatan (konsumsi snack/Box) +
   1 Tamu/kedinasan; Guru/Tendik ada (untuk rows Daftar Hadir); oracle
   pesanan = menu Nasi Box + "Pesanan untuk tanggal …"; oracle buku tamu =
   Diterima default Kepala Sekolah + identitas kosong jujur.
4. Batas file: `aturanUndangan.js` ≤ 200 baris (Constitution utility); pecah
   jadi `aturanMamin.js` bila lewat — putuskan saat dry run.
5. Selesai → BUILD-REPORT.MD (bukti per bagian) + update STATE.MD.
   JANGAN commit, JANGAN push (kuasa user — Pilihan B).

## JANGAN

- Membuat branch baru; commit; push (branch bersama 005 ikut kebawa);
  mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); menebak data tamu/hadir (tak ada di BKU =
  jujur kosong); menulis ulang `templateUndanganMamin` 005 (reuse);
  refactor di luar cakupan.
