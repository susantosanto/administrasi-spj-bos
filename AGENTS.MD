# AGENTS.MD — Router Utama

> Satu-satunya file agent di proyek ini (menggantikan `docs/AGENT.md`, 2026-09-13).
> Aturan proyek wajib → `CONSTITUTION.md`. Arsitektur & standar desain → `docs/ARCHITECTURE.MD`.
> Status detail → `docs/PROGRESS.md`.

## Konteks Proyek
- Aplikasi LPJ BOS/BOSP — frontend React untuk CETAK dokumen pertanggungjawaban BOS/BOSP (BUKAN BKU management)
- Stack (as adopted): React 18 + Vite + Tailwind CSS, data via localStorage (prefix `spj_`), tanpa backend
- Arsitektur inti: `templateConfig.js` (13 template) → `TemplateEngine.jsx` → block components

## Model Operasi
- Metode Architect-Builder (folder = source of truth, bukan chat history)
- Architect: ChatGPT/Claude — Builder: ZCode

## File yang Harus Dibaca (urutan wajib)
1. AGENTS.MD (file ini)
2. STATE.MD (status terkini)
3. DECISIONS.MD (keputusan yang sudah dibuat)
4. DOMAIN.MD (konteks bisnis)
5. CONSTITUTION.md (aturan proyek + keamanan — wajib patuh)
6. Pack sprint aktif (planning/sprints/sprint-XXX/)

## Aturan Builder
- DILARANG mulai coding tanpa architect pack
- SELALU dry run dulu → laporkan rencana → TUNGGU persetujuan
- SELALU berikan bukti (test output asli, screenshot), bukan klaim
- DILARANG mengubah requirements tanpa persetujuan
- DILARANG pakai library yang tidak ada di BLUEPRINT.MD (versi pinned)
- JANGAN memutuskan ulang: cek DECISIONS.MD dulu; pertanyaan baru → QUESTIONS.MD, bukan asumsi diam-diam
- /acceptance-runner WAJIB di konteks segar / fresh context
- Kode lama: JANGAN refactor di luar cakupan sprint yang disetujui

## Aturan Proyek (warisan docs/AGENT.md)
- Warna UI: BLUE-ONLY `#004ac6` + slate — dilarang emerald/amber/rose/violet/cyan
  (satu pengecualian: indikator status sementara di layar, tidak pernah ikut cetak)
- Kertas cetak: A4 wajib, satuan `mm`, orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` — JANGAN diubah
- Detail dokumen = 2 wajah: tab = editor premium (`Sk*Editor.jsx`), cetak = dokumen formal
  di print-area — spesifikasi lengkap di `docs/ARCHITECTURE.MD`
- Setiap fitur selesai → update `docs/PROGRESS.md` (checklist + revisi + status)
- Komunikasi: caveman mode (default full) untuk implementasi, research, planning

## Quick Commands
```bash
cd spj-frontend && npm run dev     # development
cd spj-frontend && npm run build   # build — jalankan setelah setiap perubahan kode
```

## Workflow
1. Baca architect pack sprint aktif
2. Dry run → lapor hasil
3. Disetujui → coding + test
4. Selesai → lapor hasil dengan bukti + update `docs/PROGRESS.md`
5. Update folder via /state-keeper
