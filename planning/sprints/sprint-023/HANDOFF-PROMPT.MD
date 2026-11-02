# HANDOFF-PROMPT.MD — Sprint 023 (prompt Builder)

Kerjakan Sprint 023 persis sesuai pack ini. Urutan: baca REQUIREMENTS → BLUEPRINT → ACCEPTANCE → KEPUTUSAN-DIKUNCI Sprint 022 (D-22/G-7: jangan ubah templateConfig/blok cetak).

Aturan Builder (AGENTS.MD): dry run dulu → lapor → tunggu; bukti nyata (bukan klaim); tanpa library baru; setiap fitur selesai → update STATE.MD + pack.

Tugas (5 file, lihat BLUEPRINT untuk preskripsi per file):
1. `SidebarPbj.jsx`: tabel invoice dari `spj_pbj_invoices` + expand + refresh pasca-upload.
2. `BKUSidebar.jsx`: guard `{!isSetorPajak && (...)}` untuk card Kategori (`:432-466`).
3. `DokumentasiAIGenerate.jsx`: ruang lokal per NoBukti (`spj_ruang_lokal`) + UI hapus/upload di Langkah 2.
4. `kodeReferensi.js`: REKENING_MAP = 183 entri Excel (A/B/E, baris 3-185).
5. `BKUSidebarLpj.jsx`: dropdown jenisPemeliharaan + cabang previewDocs untuk card pemeliharaan.

Gate: build exit 0 + probe T-1…T-6 PASS + file tabu 0 diff. Konsumsi = mamin (jangan tambah kategori upload baru).
