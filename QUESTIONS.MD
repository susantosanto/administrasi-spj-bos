# QUESTIONS.MD — Pertanyaan Terbuka

## Format
❓ [OPEN] Pertanyaan: <isi>
  Ditanya: <tanggal> | Dari: <siapa> | Status: Menunggu jawaban
✅ [CLOSED] Pertanyaan: <isi> — Jawaban: <isi> — Ditutup: <tanggal>

## Pertanyaan Terbuka

🔹 [CLOSED] Pertanyaan: 8 gap runtime Sprint 003 (T-04 penuh, T-05 penuh, T-06, T-07 picker, T-08 b/c/d/e/f/g, T-09, T-10 Honorarium, E-2) — wajib ronde-2 acceptance, atau sebagian diterima sebagai risiko (seperti Sprint 001/002 2026-09-30)?
  Jawaban: DITERIMA sebagai risiko — ronde-2 DIBATALKAN, question ditutup.
  Ditutup: 2026-10-01 (perintah user langsung)

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
  Status: Menunggu keputusan user — Sprint 002 FASE 3/4 menjalankan batas ini
  (placeholder tempat/tanggal dibiarkan sebagai teks bantu); perlu dijawab sebelum
  sprint berikutnya menyentuh blok yang sama.

❓ [OPEN] Pertanyaan: `utils/templateSuratHelper.js` (fitur "Template Surat Cerdas",
  konsumen `TemplateSuratPage.jsx` rute `/dashboard/template-surat`) memuat template
  `surat_tugas` SENDIRI — ditemukan dry run Sprint 002 (D-1, 2026-09-19). Fitur ini
  BUKAN modul Perjalanan Dinas; gate T-02 Sprint 002 di-rescope mengecualikannya.
  Apakah fitur ini kelak dirapikan/dihapus/dibiarkan?
  Ditanya: 2026-09-19 | Dari: agent (dry run Sprint 002, disetujui user utk rescope) |
  Status: Menunggu keputusan user — TIDAK memblok Sprint 002.

## Pertanyaan yang Sudah Dijawab

✅ [CLOSED] Pertanyaan: `nama_sekolah` (snake_case) di `DokumentasiAIGenerate.jsx`
  (eks baris 432) tak pernah cocok `getSchoolData()` (camelCase) — bagaimana diperbaiki?
  Jawaban: **diganti jadi `namaSekolah`** — dan ternyata ada 2 titik, bukan satu:
    baris 74 (kop preview A4) + baris 432 (HTML cetak). `getSchoolData()` mengembalikan
    `namaSekolah`/`alamat`/`telepon`/`email` (camelCase), jadi `nama_sekolah` selalu
    jatuh ke fallback `'SD NEGERI ...'`. Fallback generik dipertahankan (konsisten
    dengan pola `BKUPage.jsx:345`). Sisa `nama_sekolah` di kode (bkuParser,
    sekolahParser, BKUPage, DataSekolahPage) = shape output parser xlsx — BUKAN bug,
    dibiarkan apa adanya. Bukti: `✓ built in 7.50s` exit 0. Commit `c955019`.
  Ditutup: 2026-09-19 (keputusan ADR — DECISIONS.MD)

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

✅ [CLOSED] Pertanyaan: Sprint 011 G-1 — terima desain panel cari+centang revisi task 66 (opsi a), atau kembalikan Tolak-per-kartu + chips + dialog konfirmasi (opsi b)?
  Jawaban: **(a) terima desain baru** — pengganti terverifikasi jujur runtime (batch tepat n, tombol-0 disabled, toggle default ON, 0 auto-tambah); pack 4 dokumen diselaraskan docs-only + verifikasi ulang fresh mini T-04'/T-05'/C-03/C-04 4/4 PASS.
  Ditutup: 2026-10-10 (adendum task 70 + task 71 — VERIFICATION-REPORT Sprint 011; ADR di DECISIONS.MD)

✅ [CLOSED] Pertanyaan: Sprint 011 E-1 — redaksi empty-state beda dari teks ACCEPTANCE ("Belum ada data BKU…" vs "Tidak ada transaksi BKU yang belum berdokumen") — terima redaksi implementasi atau selaraskan teks?
  Jawaban: **diselaraskan** — teks ACCEPTANCE E-1 ditulis ulang mengikuti implementasi (makna sama, tanpa crash).
  Ditutup: 2026-10-10 (adendum task 70 — VERIFICATION-REPORT Sprint 011)

❓ [OPEN] Pertanyaan: Bar nama sekolah di Cover LPJ memakai `#0A2463` (navy, meniru contoh Bandung Barat), sementara aturan BLUE-ONLY (AGENTS.MD/CONSTITUTION) menetapkan `#004ac6` sebagai satu-satunya warna branded — dan ADR 2026-10-18 justru memerintahkan bar biru `#004ac6` khusus varian **Sekat**. Ikuti mana untuk Cover?
  Konteks: `blocks/CoverHeader.jsx:56` (varian cover) vs bar `#004ac6` di varian sekat (baris 32). Tidak diubah di sesi 2026-10-18 — keputusan warna = domain user/architect, bukan asumsi agent.
  Dampak bila dijawab: (a) samakan ke `#004ac6` → Cover/Sekat konsisten blue-only; (b) pertahankan navy `#0A2463` → butuh pengecualian warna tertulis di ADR + pack Sprint 012 agar tidak dianggap pelanggaran T-10.

❓ [OPEN] Pertanyaan: WIP Cover/Sekat + 6 template kas sudah ada di working tree tanpa architect pack — diproses bagaimana?
  Opsi: (a) buat pack Sprint 012 lengkap (REQUIREMENTS/BLUEPRINT/ACCEPTANCE/HANDOFF) lalu dry run lalu eksekusi; (b) simpan WIP di branch terpisah (`feat/cover-sekat-dokumen-kas`) dan lanjutkan sprint lain dulu; (c) buang WIP.
  Konteks: AGENTS.MD melarang mulai coding tanpa pack; STATE.MD 2026-10-18 mencatat ini sebagai blocker proses.

❓ [CLOSED] Pertanyaan: Sprint 013 (upload PDF BKU) butuh dependency baru `tesseract.js@6.0.1` + aset OCR lokal `public/ocr/{eng,ind}.traineddata.gz` (±6 MB masuk repo) — disetujui?
  Jawaban: **DISETUJUI** (opsi a, dengan penyesuaian versi & aset): dependency dipasang sebagai `tesseract.js@7.0.0` (pin eksak, versi 6.0.1 sudah usang) dan aset OCR **hanya bahasa Indonesia** (`ind.traineddata`, 3,85 MB — `eng` tidak dipakai karena dokumen BKU berbahasa Indonesia) diletakkan di `public/tesseract/`. Aset disajikan **tanpa** ekstensi `.gz` (lihat DECISIONS.MD bagian R keputusan 2) karena extension browser meng-intercept URL `.gz` dan membalas 204 + body kosong. Seluruh proses tetap offline — tidak ada aset yang diambil dari CDN.
  Ditutup: 2026-10-19 (sprint 015 ditutup, dependency + aset sudah terpasang & terverifikasi 200/3.847.026 byte)

❓ [CLOSED] Pertanyaan: nomor sprint untuk upload PDF BKU = **013** (012 sudah dipesan WIP Cover/Sekat) — benar, atau tunggu 012 selesai dulu?
  Jawaban: **Nomor akhirnya 015** — sprint 013 (versi lama) dibatalkan total & di-reset 2026-09-19 (kebijakan user: PRD baru ditulis dari nol), 014 dipakai laporan rincian pajak, dan upload PDF BKU dilanjutkan sebagai **Sprint 015** dengan pack `planning/sprints/sprint-015/` + salinan audit `architect-packs/architect-pack-015-bku-pdf-import.md`. Sprint 012 (WIP Cover/Sekat + dokumen kas) tidak lagi memblokir — Sprint 015 berdiri sendiri.
  Ditutup: 2026-10-19 (sprint 015 ditutup)
