# HANDOFF-PROMPT — Sprint 009: Pecah Surat Pesanan + Sticky Panel (untuk Builder)

> Baca dulu (urutan wajib): AGENTS.MD -> STATE.MD -> DECISIONS.MD -> DOMAIN.MD -> CONSTITUTION.md -> pack ini (planning/sprints/sprint-009/ REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: intent://local/halo-task-5/note/53141d32-3134-442c-9950-b581e2a7e6eb (branch feat/sprint-009-pecah-pesanan, fase A dulu baru B, pack docs-only, 0 lib, blue-only, A4-mm, spj_, cetak konsisten, commit kuasa user).
> Handoff task 32 wajib: note 16d8220e-daeb-4dff-8742-3543fb9f296f (recon seksi + sticky TIDAK dikerjakan di 32 + alasan overlap file).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-009-pecah-pesanan (dari feat/sprint-008-preview, atau main bila 008 sudah merge; pack DOCS-ONLY sudah di branch ini, src belum diubah)
git status --porcelain
# harapan: hanya file planning/sprints/sprint-009/* (4 dokumen); src bersih
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0 (baseline pra-eksekusi). Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas -> /dashboard/dokumen-spj -> 1 dokumen Mamin kegiatan
```

## Perintah Kerja

1. DRY RUN DULU — laporkan: urutan FASE A (helper bagi-per-seksi + A1 kartu + A2 print-area + A3 panel docs) lalu FASE B (sticky CSS) — TIDAK paralel; file disentuh (maks 3: previewDocs.js, DokumenFormPreview.jsx, PanelPreviewDocument.jsx + CSS aside bila perlu); lokasi helper bersama (inline vs sibling util ≤200 baris); risiko (DokumenFormPreview 2371 baris >> limit 300 -> strategi tambah minimal tanpa pecah file di luar cakupan; legacy rows tanpa seksi; nomor sama di 2 surat; sticky vs fullscreen/zoom existing). TUNGGU persetujuan user sebelum coding.
2. Eksekusi FASE A dulu (doc keys pesanan-nasi 'Surat Pesanan — Nasi Box' + pesanan-snack 'Surat Pesanan — Snack Box', Nasi Box 6 + Snack Box 4 default) sampai T-02-T-06 hijau (tiap sub diakhiri npm run build exit 0 + grep DoD; tempel output asli sebagai bukti shift-left); BARU lanjut FASE B (T-07). Jangan campur file agen paralel (DokumenSPJPage.jsx, SummaryCard.jsx bila dirty — koordinasi dulu).
3. Data uji: seed 1 Mamin kegiatan default Nasi 6 + Snack 4; oracle nomor SAMA (1x nomorPesanan dipakai di kedua surat, tanpa /A /B otomatis) + perihal suffix display-only (formData.perihalPesanan tetap, tampil "{perihal} — Nasi Box/Snack Box"); oracle skip seksi mati + pesan jujur kedua-mati + warisan ikut Nasi; oracle cetak 2x .sk-doc-print Nasi-dulu; oracle sticky desktop-nempel/mobile-numpuk/print-tanpa-panel.
4. Batas file: Component max 300 baris, Utility max 200 baris, Config max 150 baris (Constitution); helper bagi-per-seksi murni dipakai bersama A1/A2/A3 (satu logika, tiga pemakai); templateConfig.js + TemplateEngine.jsx + blocks/* DILARANG disentuh.
5. Tawarkan 2 mode uji dulu (otomatis agent vs manual user checklist, DECISIONS.MD 2026-10-01) sebelum acceptance.
6. Selesai -> update STATE.MD + pack sprint-009 (checklist + status). Storage tetap prefix spj_ via storageHelper; warna BLUE-ONLY #004ac6 + slate. JANGAN commit, JANGAN push (kuasa user).

## JANGAN

- Mulai coding tanpa dry run disetujui; mengubah requirements tanpa persetujuan (khususnya Keputusan pack 2-4 nomor/perihal/filter); mengerjakan B sebelum A hijau; menambah dependency apa pun (0 lib baru — pecah = filter+render ulang existing, sticky = CSS bawaan);
- Menyentuh templateConfig.js, TemplateEngine.jsx, blocks/*, dokumen selain pesanan, area cetak selain 2x sk-doc-print pesanan; menambah field form nomor/perihal kedua atau tab baru; menampilkan nomor /A /B otomatis (tanpa karangan);
- Menambah TTD digital, tombol KIRIM server, QR, warna navy/oranye (DICORET permanen); memakai warna larangan emerald/amber/rose/violet/cyan (badge sinyal = pengecualian layar-only teks+ikon);
- Menimpa field di luar alur BKU; mengarang rows kosong (kosong = skip/pesan jujur); refactor di luar 3 file cakupan.
