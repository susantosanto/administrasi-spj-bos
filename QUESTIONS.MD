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

❓ [CLOSED] Pertanyaan: Sprint 016 (impor PDF semua bulan) — definisi **pengeluaran riil** mana yang dipakai? Jalur Excel menghitung `TARIK_TUNAI` (`bkuParser.js:494-495`: `PEMBAYARAN + TARIK_TUNAI`), sedangkan `recalcSummary` di `BKUPage.jsx:136-138` hanya `PEMBAYARAN`. Akibatnya indikator "Balance" bisa berbeda untuk data yang sama tergantung pintu masuk (Excel vs PDF).
  Jawaban: **"(a) samakan ke Excel"** — pengeluaran riil = `PEMBAYARAN + TARIK_TUNAI`. `recalcSummary` WAJIB diperbaiki agar ikut menghitung `TARIK_TUNAI`, sehingga kedua pintu masuk menghasilkan `summary` identik. Konsekuensi yang diterima user: `BKUPage.jsx` (jalur Excel) ikut tersentuh — dibatasi HANYA pada fungsi `recalcSummary`, `handleFileUpload` tidak diubah.
  Bukti pendukung: sebelum perbaikan, angka "Balance" di layar bisa **berubah setelah reload** untuk data Excel yang sama (`handleFileUpload` menyimpan `result.summary` dari `bkuParser`, tetapi `loadFromStorage` menghitung ulang dengan `recalcSummary`).
  Ditutup: 2026-10-20 (perintah user langsung) — ADR di `DECISIONS.MD`

❓ [CLOSED] Pertanyaan: Sprint 016 — `footer` (nama kepala sekolah & bendahara, NIP, tempat, tanggal penutupan) **tidak bisa** dibaca dari PDF (tidak ada parser footer PDF). Karena keputusan #5 = "ganti seluruhnya" `spj_bku_data`, footer lama: **dipertahankan** atau **dikosongkan**?
  Jawaban: **TIDAK dipertahankan** — "selama tidak berkorelasi dengan nilai belanja di BKU tidak perlu dipertahankan, karena saya memerlukan nilai-nilai yang digunakan untuk data pembuatan dokumen saja". Impor PDF menulis `footer` kosong.
  Bukti bahwa ini aman (diverifikasi `grep`, bukan asumsi):
  (1) `bku_data.footer` hanya dipakai di **satu** tempat — `previewDocs.js:379`
      (`bku?.footer?.tempat || sekolah.kabupaten || ''`) — dan punya **fallback** ke
      `getSchoolData().kabupaten`, jadi `tempat` tetap terisi.
  (2) Nama & NIP kepala sekolah/bendahara untuk cetak **tidak** berasal dari `footer`,
      melainkan dari `getSignatureRoles()` (`signatureRoles.js:40`) → `getPejabat()`.
      Jadi blok tanda tangan dokumen TIDAK kosong.
  (3) `kasKonteks()` mengembalikan `footer`, tetapi `kasDocs()` **tidak** mendestruktur
      field itu → benar-benar data mati.
  Ditutup: 2026-10-20 (perintah user langsung) — ADR di `DECISIONS.MD`

❓ [CLOSED] Pertanyaan: Sprint 016 — `header.alamat` / `kabupaten` / `provinsi` juga tidak terbaca dari kop PDF (kop hanya memberi `nama_sekolah`, `npsn`, `tahunAnggaran`). Pertahankan nilai lama atau kosongkan?
  Jawaban: **TIDAK dipertahankan** (alasan sama dengan footer) — hanya field yang benar-benar terbaca dari kop PDF yang diisi. **PENGECUALIAN PENTING:** `header.tahunAnggaran` WAJIB tetap terisi (dari `kop.tahun`), karena `previewDocs.js:242` memakainya untuk judul dokumen (`bku?.header?.tahunAnggaran`); kalau kosong, dokumen cetak jatuh ke `new Date().getFullYear()` — tahun salah tanpa peringatan.
  Bukti: `header.alamat/kabupaten/provinsi` hanya dipakai untuk tampilan kosmetik di
  `BKUPage.jsx:512-513`; identitas sekolah untuk dokumen diambil dari `getSchoolData()`
  (`sekolahData.js:53`), bukan dari `bku_data.header`.
  Ditutup: 2026-10-20 (perintah user langsung) — ADR di `DECISIONS.MD`

❓ [CLOSED] Pertanyaan: Q1 Sprint 016 DIREVISI — apakah benar `TARIK_TUNAI` dihitung sebagai pengeluaran riil (jawaban awal "samakan ke Excel")? Setelah diukur, `Σ TARIK_TUNAI` = `Σ PERGESERAN_BANK` = Rp 16.350.000 (selisih Rp 0) di Excel **dan** PDF → tarik tunai murni pemindahan bank↔kas, bukan belanja.
  Jawaban: **TIDAK dihitung** — `totalPengeluaran` = `PEMBAYARAN` saja. User memilih **opsi B**: perbaiki `recalcSummary` (tambah field saja) **dan** ubah 1 baris `bkuParser.js:495` (hapus `+ TARIK_TUNAI`). Status TABU `bkuParser.js` dicabut **khusus** untuk baris itu.
  Alasan: menghitung sisi keluar tarik tunai membuat uang yang sama terhitung dua kali (kasnya nanti dibelanjakan lewat `PEMBAYARAN`), sehingga indikator "Balance" menampilkan "Tidak Balance" pada data yang sehat.
  Ditutup: 2026-10-20 (perintah user langsung: "setuju B") — ADR `DECISIONS.MD` §T (menggantikan §S1)

## Sprint 017 — Panel Dokumen LPJ di Sidebar BKU (D-1…D-4, BLOCKING)

❓ [OPEN] D-1 — Definisi **field wajib** untuk gate preview. PRD mengusulkan aturan
  deterministik: field wajib = `header.nomor` (bila `nomor !== false`) + semua
  `table-fields[].key` + `table-letter-header` kiri/kanan + minimal 1 baris `table-dinamis`,
  **kecuali** key yang punya nilai non-kosong di `templateConfig.defaults`.
  Ditanya: 2026-10-21 | Dari: agent (PRD Sprint 017 §10) | Status: Menunggu keputusan —
  opsi (a) setujui aturan, daftar konkret disusun di BLUEPRINT; (b) user menulis daftar sendiri.
  Memblok: T-06 + gate preview.

❓ [OPEN] D-2 — Baris **ATK/Penggandaan** tidak punya form (`hasTemplate:false, infoOnly:true`,
  `DokumenSPJPage.jsx:92-101`). Opsi: (a) dianggap non-LPJ → sidebar sempit (dipakai pack);
  (b) full width + panel info tanpa form/preview; (c) ditunda.
  Ditanya: 2026-10-21 | Status: Menunggu keputusan — pack memakai (a) sebagai A-2.

❓ [OPEN] D-3 — Nama kunci storage & bentuk payload untuk simpan per NoBukti.
  Usulan pack: `spj_lpj_bku` dengan kunci `<kategori>|<noBukti>`. Alternatif: menumpang
  `spj_dokumen_lpj` (risiko bercampur dengan data status). Ditanya: 2026-10-21 |
  Status: Menunggu keputusan — pack memakai usulan sebagai A-3.

❓ [OPEN] D-4 — Menu Dokumen LPJ **tidak menyimpan** (`storageHelper.set` 0 hit). Bila sidebar
  menyimpan dan menu LPJ tidak, ada dua perilaku untuk dokumen yang sama. Opsi: (a) biarkan,
  sprint lain menyelaraskan (dipakai pack); (b) sekalian tambahkan simpan ke LPJ di sprint 017
  (scope bertambah ±2 task + 1 risiko besar). Ditanya: 2026-10-21 | Status: Menunggu keputusan.

❓ [OPEN] D-5 (Sprint 017, muncul saat eksekusi) — **gate preview untuk Mamin**. Sub-kategori
  Mamin semuanya `templateId: null` (form disusun dari beberapa template sekaligus), sehingga
  aturan A-1 tidak punya satu config acuan. Opsi: (a) gate Mamin = `readinessCheck` yang sudah
  ada (nomor · tanggal dana masuk · minimal 1 baris); (b) gabungan field wajib semua template
  Mamin (undangan+pesanan+buku tamu+daftar hadir+notulen → ±30 field, praktis tak pernah
  lengkap); (c) gate Mamin ditangguhkan (preview selalu tampil untuk Mamin).
  Ditanya: 2026-10-21 | Status: Menunggu keputusan — memblok T-07 untuk kategori Mamin.

### Sprint 017 — pembaruan status setelah eksekusi (2026-10-21)

↻ D-1 — **DIPAKAI sebagai aturan A-1**, diperiksa lewat oracle: 30 asersi
  `test-lpj-fieldwajib.mjs` PASS (`defaults` dikecualikan, `0` = terisi, `rows: []` belum lengkap,
  meta key `bkuSumber`/`kunciPejabat` dikecualikan). Belum ada keberatan user.

↻ D-2 — **DIPAKAI opsi (a)**: ATK/Penggandaan = non-LPJ → sidebar sempit. Terverifikasi oracle
  `test-lpj-sidebar.mjs` (baris ATK: `max-w-xl`, tanpa tab Dokumen LPJ).

↻ D-3 — **DIPAKAI usulan**: kunci `spj_lpj_bku`, entri `<cardId>|<noBukti>`. Terverifikasi
  `test-lpj-store.mjs` 18 asersi (NoBukti kosong ditolak, storage tidak bertambah, data rusak → null).

↻ D-4 — **DIPAKAI opsi (a)**: menu LPJ dibiarkan tanpa simpan. Halaman LPJ kini memakai komponen
  panel yang sama (`layout="side"`, tanpa `gate`) → tanpa banner peringatan, perilaku lama utuh.

↻ D-5 — **BELUM DIPUTUSKAN, tetapi tidak lagi memblok.** Implementasi memakai fallback sementara:
  Mamin (tanpa `templateId`) → `peringatanDariPelanggaran()` (hasil `readinessCheck` yang lama).
  Kategori ber-`templateId` memakai `cekKelengkapan()` (aturan A-1). Ini keputusan teknis sementara,
  **bukan** persetujuan user. Keputusan user 2026-10-21 ("Selalu tampil + peringatan") membuat
  perbedaan gate hanya terlihat pada isi banner, bukan pada muncul/hilangnya preview.
  **Saat penutupan Sprint 017 (2026-10-21): tetap terbuka, dibawa ke sprint berikutnya.**

↻ D-6 — **KEPUTUSAN SEMENTARA: DIPERTAHANKAN** (perintah user "Tetap ada dulu", 2026-10-21;
  ditegaskan saat penutupan sprint). Halaman Dokumen LPJ tetap hidup bersama sidebar sebagai
  jaring pengaman. Pertanyaan final (hapus / dua pintu masuk / arsip) **ditinjau ulang setelah
  uji browser manual `ACCEPTANCE.MD` §7 lulus** — belum ada bukti manual sampai sprint ditutup.
  Catatan: menghapus menu = menyentuh routing + sidebar aplikasi, bukan hanya satu komponen.

---

## Sprint 018 — Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ (D-1…D-2, ✅ TERJAWAB 2026-10-22)

❓ **D-1** — **Satu field `tanggalSurat` atau dua?** Surat Undangan (Seksi 3) dan Surat Pesanan
  (Seksi 4) sama-sama memakai field "Tanggal Surat". Usulan pack **A-9**: **satu** field
  (`tanggalSurat`) untuk keduanya — sesuai prinsip sprint ini "satu data satu sumber" (K-6),
  dan label Seksi 4 jadi "Tanggal Surat (sama dengan Surat Undangan)". Alternatif: dua field
  terpisah (`tanggalSurat` + `tanggalSuratPesanan`) supaya Undangan & Pesanan boleh beda tanggal.
  Ditanya: 2026-10-21 | Status: ✅ **DIJAWAB 2026-10-22 — satu field `tanggalSurat` (A-9)**
  Bukti: `MaminSeksi3Undangan.jsx:26` + `MaminSeksi4Pesanan.jsx:72` sama-sama menulis
  `formData.tanggalSurat`; tidak ada field kedua. | Dampak: 1 field dipakai Undangan & Pesanan.

❓ **D-2** — **Label dokumen PBJ di panel preview.** Usulan pack: semua label PBJ diberi
  sufiks **" PBJ"** ("Surat Pesanan PBJ", "Data Rekap PBJ", "BAHP PBJ", …) → nama dokumen
  selalu unik, jadi aturan "LPJ menang" (K-12) tidak pernah dipakai dan **tidak ada dokumen
  PBJ yang tersembunyi**. Alternatif: label apa adanya + aturan "LPJ menang" → sebagian
  dokumen PBJ (mis. "Surat Pesanan") **tidak terlihat** di panel.
  Ditanya: 2026-10-21 | Status: ✅ **DIJAWAB 2026-10-22 — sufiks " PBJ" dipakai (K-12)**
  Bukti: `utils/previewDocs.js:442-454` (sufiks + filter bentrok, LPJ menang); browser
  `T-17.22` melihat "PERENCANAAN PBJ" & "SURAT PESANAN PBJ" di panel preview, 0 nama dobel.
  | Dampak: seluruh dokumen PBJ terlihat di daftar preview.

### Catatan asumsi (menunggu konfirmasi dry run, BUKAN keputusan)

A-1…A-9 (REQUIREMENTS §5 / PRD §10) masih **asumsi pack** — WAJIB disebut di dry run builder
dan dikonfirmasi user sebelum coding (STOP-4). Ringkasan: A-1 kriteria kandidat dropdown ·
A-2 perpindahan via `onNavigate` yang sudah ada · A-3 dialog "simpan dulu" · A-4 nilai otomatis
di lapisan `formData` & ikut tersimpan · A-5 kunci PBJ baru `spj_pbj_bku` · A-6 perubahan form
Mamin hanya untuk sidebar · A-7 kolom NIP ikut tercetak · A-8 "Hari/Tanggal" Seksi 4 tetap ada
(default dari Tanggal Surat) · A-9 satu field `tanggalSurat`.

### Temuan kode yang mengubah asumsi brief (2026-10-21)

1. **"Tanggal dana masuk" tidak tercetak di template mana pun** (grep `src/` = 9 hit, **0** di
   `templateConfig.js`/`blocks/`). Field itu **hanya gate** → begitu inputnya dihapus dari
   sidebar, gate sidebar **wajib** ikut berhenti menagihnya (fungsi baru; `SummaryCard.jsx` 0 diff).
2. **Sidebar sudah punya** `allTransactions` + `onNavigate` (`BKUSidebar.jsx:60`, tombol ‹ ›)
   → "berpindah ke baris lain" tidak butuh state/callback baru.
3. **Preview Mamin & area cetak Mamin = dua builder terpisah** (`maminDocs()` vs
   `MaminPreview.jsx:198-253`) → nilai otomatis wajib diterapkan di lapisan `formData`,
   kalau tidak layar ≠ cetakan.
4. **`readinessCheck` dipakai halaman LPJ** → gate sidebar harus fungsi baru (`readinessSidebar`).

---

## Revisi UI 2026-10-22 17:0x — 1 pertanyaan terbuka

### Q-7 — Label toggle "Rincian Pesanan": buang kata "Seksi" atau samakan persis dengan halaman LPJ?

**Latar:** dua permintaan user bertabrakan di satu label.
- Poin 3: buang kata "Seksi" dari UI (dinilai tidak premium).
- Poin 5: "samakan dengan yg di halaman LPJ untuk input form rincian pesanan".

Halaman LPJ menulis **`Seksi Nasi Box (6)`**; sidebar sekarang menulis **`Nasi Box (6)`**.

**Yang sudah sama (dibuktikan `cek-018-paritas.cjs`, 8/8 PASS):** jumlah baris menu baku (10) ·
placeholder kolom (`Uraian`/`Satuan`/`Jumlah`) · penomoran global 1…10 · judul grup
(`NASI BOX (6)` / `SNACK BOX (4)`) · jumlah toggle (2) · "Isi menu baku" hanya saat kosong ·
uraian menu baku identik · tombol "Tambah Item".

**Pilihan:**
- **A (sekarang, default)** — biarkan `Nasi Box (6)`. Konsisten dengan poin 3.
- **B** — ubah 1 baris di `MaminPesananRincian.jsx` jadi `Seksi Nasi Box (…)` → persis LPJ,
  tapi kata "Seksi" muncul lagi di sidebar.
- **C** — biarkan sidebar bersih, dan rapikan juga label di `DokumenFormPreview.jsx:1330`
  supaya kedua halaman sama-sama tanpa "Seksi".

**Status: ✅ TERJAWAB 2026-10-22 17:3x — pilihan C (dieksekusi, tanpa perlu tanya lagi).**
Alasannya bukan preferensi, tapi konsekuensi teknis: form rincian pesanan sekarang **satu
komponen** (`MaminPesananRincian`) yang dipakai sidebar DAN halaman LPJ, jadi labelnya
mustahil berbeda. Yang dipilih = versi bersih (tanpa kata "Seksi"), sesuai permintaan
poin 3. Diverifikasi `cek-018-paritas.cjs` (8/8 PASS) + `R5.1b`.
