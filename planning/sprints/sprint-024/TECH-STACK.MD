# TECH-STACK (Sprint 024) — validasi, bukan pilihan baru

Stack TERKUNCI (AGENTS.MD + BLUEPRINT Sprint 023): React 18.3.1 · react-dom 18.3.1 ·
react-router-dom 6.30.4 · vite 5.4.21 · tailwindcss 3.4.19 · pdfjs-dist 4.10.38 ·
@heyputer/puter.js 2.5.4 · xlsx 0.18.5 · tesseract.js 7.0.0. Tanpa dependency baru.

## Keputusan per kebutuhan PRD
| Kebutuhan | Putusan | Alasan |
|---|---|---|
| Matriks 7×12 render + koreksi | React state + tabel HTML biasa | 84 sel, tidak perlu virtualisasi/grid lib |
| Agregat BKU | util murni baru `utils/realisasi*.js` (pola dokKas/pbjInvoice) | testable via node probe, 0 deps |
| Cetak A4 | templateConfig + blok baru (pola WorkplanPbj Sprint 023) | satu sumber cetak, mm, print twin موجود |
| Persist koreksi/instrumen | localStorage `spj_` via storageHelper | konsisten 41 kunci existing; tanpa backend (out of scope) |
| PDF contoh `.doc` biner | TIDAK di-parse di app (riset offline saja) | hindari parser OLE di browser |
| Peta rekening→komponen | konstanta JS di `utils/realisasiPeta.js` | reviewable, probe-able |

## Batasan diwariskan
- KEPUTUSAN-DIKUNCI-022: area AI (imageGenerator, DokumentasiAIGenerate, SidebarPbj upload, puterAkun) 0 diff.
- Blue-only, A4/mm, prefix `spj_`, Conventional Commits, build gate.
- RISKS.MD: hitungan Register Kas OPEN — estimator tunai dipakai ulang untuk matriks? TIDAK: matriks realisasi memakai PENGELUARAN per rekening (bukan tunai), jadi tak terdampak isu tunai/bank.
