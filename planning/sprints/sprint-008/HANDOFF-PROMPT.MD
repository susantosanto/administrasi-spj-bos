# HANDOFF-PROMPT — Sprint 008: Preview Cermin Live (untuk Builder)

> Baca dulu (urutan wajib): AGENTS.MD -> STATE.MD -> DECISIONS.MD -> DOMAIN.MD -> CONSTITUTION.md -> pack ini (planning/sprints/sprint-008/ REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: intent://local/halo-task-5/note/b83069e0-acf8-4d8e-8ec8-287bc11753fa (branch feat/sprint-008-preview, status pack, batas alat).
> BRIEF RISET wajib: note c604c57c-635d-4ad3-a24b-6063cbbe3e48 (verdict BISA/TIDAK + alur 3 zona).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-008-preview (dari main; pack DOCS-ONLY sudah di branch ini, src belum diubah)
git status --porcelain
# harapan: hanya file planning/sprints/sprint-008/* (4 dokumen); src bersih
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0 (baseline pra-eksekusi). Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas -> /dashboard/dokumen-spj
```

## Perintah Kerja

1. DRY RUN DULU — laporkan: urutan task (A Zona A, B Zona B live+Cek+zoom, C Zona C gate+Cetak), file disentuh (maks 3 ubah + 0 baru, revisi existing), risiko (DokumenFormPreview.jsx mendekati 300 baris -> strategi pecah/split yang dipilih; fullscreen ditolak browser -> fallback jujur). TUNGGU persetujuan user sebelum coding.
2. Eksekusi per bagian A->B->C; tiap bagian diakhiri npm run build exit 0 + grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed 1 dokumen Mamin/notulen + 1 field wajib dikosongkan (untuk Cek + gate); oracle badge = LENGKAP vs N-PERLU-DIISI; oracle zoom = 50/100/150 persen + fullscreen; oracle gate = terhalang jujur lalu lolos setelah checklist + pelanggaran nol.
4. Batas file: Component max 300 baris, Utility max 200 baris, Config max 150 baris (Constitution); readinessCheck murni dan dipakai bersama tombol Cek + gate Zona C (satu logika, dua pemakai).
5. Tawarkan 2 mode uji dulu (otomatis agent vs manual user checklist, DECISIONS.MD 2026-10-01) sebelum acceptance.
6. Selesai -> update STATE.MD + pack sprint-008 (checklist + status). Storage tetap prefix spj_ via storageHelper; warna BLUE-ONLY #004ac6 + slate. JANGAN commit, JANGAN push (kuasa user).

## JANGAN

- Mulai coding tanpa dry run disetujui; mengubah requirements tanpa persetujuan; menambah dependency apa pun (0 lib baru — zoom/fullscreen = CSS + requestFullscreen bawaan);
- Menyentuh blocks/*, TemplateEngine.jsx, templateConfig.js, area cetak/print-area/.print-container; menampilkan dokumen formal penuh sebagai tampilan tab (langgar 2 wajah);
- Menambah TTD digital, tombol KIRIM server, QR, warna navy/oranye (DICORET/TIDAK permanen); memakai warna larangan emerald/amber/rose/violet/cyan (badge sinyal = pengecualian layar-only teks+ikon);
- Menimpa field di luar alur BKU; mengarang isi cermin (kosong = em-dash jujur); refactor di luar 3 file cakupan.
