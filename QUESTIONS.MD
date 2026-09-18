# QUESTIONS.MD — Pertanyaan Terbuka

## Format
❓ [OPEN] Pertanyaan: <isi>
  Ditanya: <tanggal> | Dari: <siapa> | Status: Menunggu jawaban
✅ [CLOSED] Pertanyaan: <isi> — Jawaban: <isi> — Ditutup: <tanggal>

## Pertanyaan Terbuka

❓ [OPEN] Pertanyaan: Keputusan dependency `xlsx@0.18.5` — mana yang dipilih:
  (a) terima + mitigasi (parse hanya file pilihan user, tanpa auto-fetch), atau
  (b) migrasi ke parser Excel lain (mis. exceljs)?
  Ditanya: 2026-09-13 | Dari: security-dependency-auditor (SECURITY-AUDIT-001 §8.4,
  F1 TINGGI, no fix di npm registry) | Status: Menunggu keputusan user —
  WAJIB dijawab sebelum deploy publik pertama; jawaban jadi ADR di DECISIONS.MD

❓ [OPEN] Pertanyaan: `package.json` di ROOT repo memuat duplikat `xlsx`
  (`{ "dependencies": { "xlsx": "^0.18.5" } }`) — dikonsolidasi (hapus root,
  pakai `spj-frontend/` saja) atau dibiarkan?
  Ditanya: 2026-09-14 | Dari: agent (ditemukan saat menyusun `BLUEPRINT.MD`
  sprint-001) | Status: Menunggu keputusan user — TIDAK memblok sprint 001
  (root `package.json` tidak dipakai script build; jangan disentuh sampai diputuskan)

❓ [OPEN] Pertanyaan: `blocks/NomorSuratPopup.jsx:18` memakai
  `NAMA_SEKOLAH_DEFAULT = 'SDN-PSR'` (dipakai baris 42, 77, 98) sebagai nama sekolah
  default untuk **penomoran surat** — ikut dijadikan data-driven dari `getSchoolData()`,
  atau dibiarkan sebagai kode singkatan?
  Ditanya: 2026-09-17 | Dari: agent (ditemukan saat review pack sprint-001) |
  Status: Menunggu keputusan user — **TIDAK memblok sprint 001**. Sengaja di luar gate
  T-02: `'SDN-PSR'` bukan identitas sekolah nyata dan tidak cocok dengan 11 pola grep.
  File ini **tidak** masuk daftar ubah `BLUEPRINT.MD` sprint 001.

❓ [OPEN] Pertanyaan: Literal **tempat & tanggal** dokumen (`'Cikalongwetan'`,
  `'8 Mei 2026'`, `'SD Negeri Cipada'`, `'Tempat'`, `'Perjalanan Dinas'` — ada di
  `SPDForm.jsx`, `SuratTugas.jsx`, `templateConfig.js`) dikeluarkan dari cakupan
  pembersihan hardcode Sprint 001 dengan alasan "konten dokumen, bukan identitas".
  Apakah batas itu permanen, atau kelak tempat/tanggal juga harus data-driven
  (mis. `kecamatan` dari Data Sekolah untuk tempat, tanggal hari ini untuk tanggal)?
  Ditanya: 2026-09-17 | Dari: agent (batas ditetapkan saat revisi pack sprint-001) |
  Status: Menunggu keputusan user — **TIDAK memblok sprint 001** (batas sudah tertulis
  di `REQUIREMENTS.MD` §Batasan dan diuji di E-2). Perlu dijawab sebelum Sprint 002
  merombak print-area, supaya Builder tidak "sekalian" membersihkan literal ini.

## Pertanyaan yang Sudah Dijawab

✅ [CLOSED] Pertanyaan: `template-data/BKU tahunan.pdf` (untracked, muncul terus di
  `git status`) — dilacak, diabaikan, atau dihapus?
  Jawaban: **diabaikan** — ditambahkan ke `.gitignore`
    (`template-data/BKU\ tahunan.pdf`) sebagai data kerja user, bukan artefak repo.
    Berkas tetap ada di disk; `git status` kini bersih.
  Ditutup: 2026-09-14

✅ [CLOSED] Pertanyaan: /idea-clarifier (ritel 27.3 Tahap 2 langkah 4) dijalankan
  di agent mana — zcode (sesi/chat baru) atau agent lain (mis. opencode)?
  Jawaban: dijalankan pada sesi agent ini (2026-09-14) — terbukti dari Idea Brief
    final + PRD Sprint 001 yang dihasilkan; tidak perlu pindah agent/chat baru.
  Ditutup: 2026-09-14

✅ [CLOSED] Pertanyaan: `README.md` (legacy, 2026-07-10) — diperbaiki atau dihapus?
  Jawaban: TIDAK keduanya — README dipertahankan apa adanya sebagai tampilan GitHub
    saja; agent TIDAK perlu membacanya dan tidak ada kewajiban menjaganya sinkron.
    Marker eksplisit ditambahkan di kepala README + satu baris di AGENTS.MD.
  Ditutup: 2026-09-13
