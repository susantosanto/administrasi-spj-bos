# RISKS.MD — Daftar Risiko

## Format
⚠️ [Kemungkinan: Tinggi/Sedang/Rendah] RISIKO: <deskripsi>
  Dampak: <Tinggi/Sedang/Rendah>
  Mitigasi: <solusi>

## Daftar Risiko

⚠️ [Sedang] RISIKO: backend browser otomasi (Playwright MCP) mati tengah sesi
  verifikasi → item runtime jadi UNTESTED dan butuh ronde ulang.
  FAKTA: 2026-10-01 acceptance Sprint 003 ronde-1 terhenti di 8 gap runtime
  (browser closed, Pencil fallback gagal konek); 0 indikasi bug kode.
  Dampak: Sedang — siklus verifikasi memanjang, bukan cacat produk.
  Mitigasi: ronde-2 sesi segar + browser hidup; dev server :5173 dibiarkan
  jalan; seed data via localStorage terbukti bisa.
  Status: OPEN (materialized 1×, termitigasi parsial).

⚠️ [Sedang] RISIKO: 13 template belum pernah diverifikasi test cetak end-to-end
  (per docs/AGENT.md 2026-07-30: "test cetak 13 template — perlu running app")
  Dampak: Sedang — output cetak bisa meleset dari template asli
  Mitigasi: jalankan test cetak semua template saat app berjalan sebelum
    menambah fitur baru

⚠️ [Tinggi] RISIKO: API key AI terekspos di sisi client.
  FAKTA: `spj-frontend/src/utils/aiConfig.js` membaca `VITE_CEREBRAS_API_KEY`,
  `VITE_GROQ_API_KEY`, `VITE_GEMINI_API_KEY` via `import.meta.env`. Semua variabel
  ber-awalan `VITE_` DITANAM Vite ke dalam bundle JavaScript yang dikirim ke browser —
  siapa pun yang membuka aplikasi dapat mengekstrak key tersebut dari source bundle
  (mis. lewat tab Sources / view-source pada file JS hasil build).
  Dampak: Tinggi — key bisa dipakai orang lain atas nama akun pemilik key
    (biaya/kuota provider), abuse API, potensi tagihan tak terduga.
  Status: Risiko DITERIMA sementara (aplikasi tanpa backend, tidak ada tempat aman
    lain untuk key) dan tercatat di CONSTITUTION.md Security Rules.
  Mitigasi jangka pendek:
    1. Set batas budget/kuota di dashboard tiap provider (Cerebras/Groq/Gemini).
    2. Rotate key secara berkala dan SEGERA jika disebarkan ke publik.
    3. JANGAN menambah secret ber-scope tinggi (billing besar, data sensitif)
       di sisi client.
  Mitigasi jangka panjang: saat backend dibangun, pindahkan panggilan AI ke
    server proxy — key hanya di env var server, tidak pernah dikirim ke browser.

⚠️ [Tinggi] RISIKO: `xlsx@0.18.5` (SheetJS) — prototype pollution (GHSA-4r6h-8v6p-xvw6,
  CWE-1321) + ReDoS (GHSA-5pgg-2g8v-p4x9, CWE-1333), TANPA fix di npm registry
  (audit baseline SECURITY-AUDIT-001 F1, 2026-09-13).
  FAKTA: direct dependency di root DAN spj-frontend; dipakai mem-parse file Excel
  yang di-upload user (BKUPage, AskAIPanel). Workbook yang dirancang khusus dapat
  memicu pollution/loop regex.
  Dampak: Tinggi — potensi eksekusi terganggu/kebobolan properti objek global pada
    file yang dimuat; RENDAH dalam praktik app lokal (file milik user sendiri).
  Status: OPEN — keputusan (terima + mitigasi vs migrasi exceljs) butuh ADR.
  Mitigasi:
    1. Parsing tetap hanya atas file yang dipilih user sendiri (jangan pernah
       auto-fetch Excel dari sumber eksternal).
    2. Keputusan migrasi parser → QUESTIONS.MD + ADR DECISIONS.MD.
    3. WAJIB diselesaikan sebelum deploy publik pertama (gate deploy-production).

⚠️ [Sedang] RISIKO: temuan baseline audit lain yang terjadwal bertahap
  (SECURITY-AUDIT-001, 2026-09-13): .env.example drift 4 var (F3), upload tanpa
  cap ukuran/tipe (F4), login client-side tanpa verifikasi (F5), react-router
  open redirect — fix via npm audit fix (F6), 4+1 vuln dev-toolchain (F7),
  pin versi di BLUEPRINT.MD sprint-001 (F8), gitleaks belum terpasang (F9).
  Dampak: Sedang — akumulasi utangan teknis keamanan; F5 relevan saat deploy publik.
  Mitigasi: kerjakan lewat REWORK list SECURITY-AUDIT-001 §8 pada sprint berikutnya.

⚠️ [Tinggi] RISIKO: Worktree DAN `.git/` bisa kehilangan file/direktori saat operasi git
  yang memindahkan objek dijalankan — **TERJADI 3×**: 2× `git rm`, 1× `git stash`.
  FAKTA insiden #1 (2026-09-13): seluruh folder `docs/` (68 file tracked) hilang
  dari disk saat `git rm docs/PROGRESS.md` dijalankan.
  FAKTA insiden #2 (2026-09-14): seluruh folder `architect-packs/` hilang dari disk
  saat `git rm -q architect-packs/sprint-001/PACK.md architect-packs/sprint-001/BLUEPRINT.MD`
  dijalankan — `architect-packs/.gitkeep` tampil ` D` di `git status`, dan
  `architect-packs/architect-pack-001-perjalanan-dinas.md` (UNTRACKED, baru dibuat,
  665 baris) HILANG TOTAL tanpa jaring pengaman. Harus ditulis ulang dari nol.
  FAKTA insiden #3 (2026-09-17) — **PALING BERAT**: `git stash push -u -m "..."` yang
  **ter-SIGTERM di tengah jalan** membuat **`.git/` RUSAK TOTAL**:
  `.git/refs/` hilang · `.git/packed-refs` hilang · `.git/objects/` **0 objek**
  (25 subdir kosong) · `.git/objects/pack/*.pack` hilang (hanya `.idx` orphan sisa).
  Akibatnya git tidak mengenali repo sama sekali (`fatal: not a git repository`)
  dan **5 commit lokal hilang permanen** (`bb561c6`, `cdc5abe`, `68de37f`, `849a75b`,
  `5c2b400` — semuanya belum pernah di-push). Isi file SELAMAT (ada di disk + backup),
  tapi riwayat git-nya harus dibuat ulang.
  Tidak ada git hook non-sample, `core.sparseCheckout` tidak aktif, reflog semula bersih.
  Tiga insiden dengan pola identik → trigger praktis = operasi git yang menulis/memindahkan
  objek (diduga interaksi dengan proses eksternal yang memantau worktree;
  `.zcode/` untracked ada di repo).
  Dampak: Tinggi — file tracked bisa dipulihkan via git, tapi **file UNTRACKED yang
    hilang tidak bisa dipulihkan sama sekali**, dan **objek git yang hilang tidak bisa
    dipulihkan bila belum di-push**.
  Mitigasi:
    1. **DILARANG** menjalankan: `git stash` · `git gc` · `git repack` · `git prune` ·
       `git rm` / `git rm -r` · `git clean -fd` · `git reset --hard`.
    2. **Backup dulu SELALU**: `cp -r <file/folder> <dir-backup>/` sebelum operasi apa pun
       yang mengubah worktree atau `.git`. Verifikasi dengan `diff -rq` (harus IDENTIK).
    3. Untuk membatalkan perubahan: `git diff > patch.diff` lalu
       `git checkout -- <file>` **per file** (bukan bulk). JANGAN pakai `git stash`.
    4. **Commit + PUSH sesering mungkin** — ini satu-satunya jaring pengaman nyata untuk
       objek git. Commit lokal saja TIDAK cukup (insiden #3 membuktikannya).
    5. JANGAN jalankan dua agent/proses yang menulis worktree yang sama bersamaan.
    6. Cek `git status --short` SEBELUM dan SESUDAH setiap operasi git.
    7. Verifikasi penutup wajib: `git diff HEAD --stat` harus cocok persis dengan
       perubahan yang diniatkan.
    8. **Prosedur pemulihan `.git` rusak** (terbukti berhasil 2026-09-17):
       a. `cp -r .git <backup>/git-rusak` — simpan kondisi rusak untuk diagnostik
       b. `mkdir -p .git/refs/heads .git/refs/tags` → git langsung dikenali lagi
       c. `git fetch <url> main` → tarik objek dari remote
       d. `echo <sha> > .git/refs/heads/main` → tulis ref manual
       e. `rm -f .git/index && git reset` → index lama menunjuk objek hilang
       f. `git fetch --refetch origin` → rebuild indeks pack (bila `.idx` terhapus)
       g. `mkdir -p .git/refs/remotes/origin` + tulis `origin/main` manual
       h. `rm -f .git/logs/HEAD .git/logs/refs/heads/main` → reflog basi bikin fsck error
       i. Verifikasi: `git fsck --connectivity-only` harus **kosong**
       ⚠️ Sebelum `rm` wildcard di `.git/objects/pack/`, cek pasangan `.idx` ↔ `.pack`
       satu per satu — jangan hapus `.idx` yang `.pack`-nya masih ada.
    9. Pemulihan worktree: `mkdir -p <dir>` → `git checkout -- <dir>/.gitkeep`
       (restore dari index, bukan HEAD, agar perubahan ter-stage tidak ikut kembali)
       → regenerasi manual file untracked yang hilang.

⚠️ [Sedang] RISIKO: hasil cetak multi-dokumen Sprint 003 belum terbukti fisik.
  FAKTA (BUILD-REPORT.MD 2026-10-01): print-area 5-doc transport + 5-doc mamin
  lulus gate statik (build exit 0, diff warisan kosong) dan layar ringkasan
  terbukti runtime (R-1/R-2 pencil browser), tetapi T-04/T-05 (urutan + kop→TTD
  per dokumen, anti-terpotong halaman, layar≠cetak) UNTESTED — klik tidak
  tersedia di pencil browser dan backend playwright MCP mati sesi ini.
  Dampak: Sedang — susunan cetak bisa meleset (urutan/orientasi/page-break)
    tanpa terlihat di gate statik.
  Status: OPEN — wajib dibuktikan /acceptance-runner konteks segar sebelum
    Sprint 003 dinyatakan lulus penuh (STATE.MD Langkah Selanjutnya).
  Mitigasi: uji cetak manual per T-04…T-06 + E-2 saat runner; temuan → rework.

⚠️ [Rendah] RISIKO: key `nama_sekolah` snake_case di `DokumentasiAIGenerate.jsx:432`
  tidak pernah cocok dengan `getSchoolData()` camelCase → fallback generik
  `'SD NEGERI ...'` (bukan nama riil) SELALU terpakai di caption dokumentasi.
  FAKTA (regresi statik FASE 6 Sprint 001, T-11, 2026-09-18): tidak crash, data
  user tidak salah tampilkan — hanya caption fallback generik.
  Dampak: Rendah — kosmetik; nama sekolah di caption dokumentasi tidak data-driven.
  Status: **RESOLVED 2026-09-19** (commit `c955019`) — diperbaiki di 2 titik (baris 74
  kop preview A4 + 432 HTML cetak): `nama_sekolah` → `namaSekolah` sesuai output
  `getSchoolData()`. Fallback generik dipertahankan. Sisa `nama_sekolah` di kode =
  shape output parser xlsx (bkuParser/sekolahParser/konsumen) — bukan bug. Tercatat
  di ADR `DECISIONS.MD` + QUESTIONS.MD (CLOSED).
  Mitigasi (selesai): observasi Sprint 002 dieksekusi sebagai fix pra-sprint terpisah.

⚠️ [Rendah] RISIKO: `TOLAK_KEY` yatim (G-2 Sprint 011 OPEN-kode) — export + param `tolakSet` + komentar tanpa UI.
  FAKTA (VERIFICATION-REPORT Sprint 011 adendum task 70/71, 2026-10-10): desain keranjang Terima/Tolak-per-kartu diganti panel cari+centang (revisi task 66, opsi a diterima); pack sudah steril (`spj_pbj_keranjang_tolak` dihapus dari BLUEPRINT/storage-list) tetapi sisa export yatim di `paketPbj.js` + komentar di `DokumenKelengkapanPage.jsx:500` tanpa state/UI. Bukan bug fungsional (guard tanpa auto-tambah PASS 4/4 task 71).
  Dampak: Rendah — kode mati membingungkan pembaca; bila dibiarkan, kunci yatim bisa dipakai keliru di sprint berikut.
  Status: OPEN — dibersihkan di sprint berikut (di luar cakupan adendum docs-only task 70/71).
  Mitigasi: hapus export `TOLAK_KEY` + param `tolakSet` + komentar terkait; grep `keranjang_tolak|tolakSet` = 0 hit pasca-bersih.

⚠️ [Sedang] RISIKO: gate T-02 "0 hit" TIDAK akurat — ada drift hardcode yang lolos laporan sprint.
  FAKTA (sesi "cek project" 2026-10-18, perintah kanonik 15 pola dari `sprint-001/ACCEPTANCE.MD:92` diukur ulang terhadap working tree + HEAD): total **5 hit** → 3 berasal dari WIP tak-ter-commit (`templateConfig.js` defaults `YUNIARTI, S.Pd` + `AHMAD, S.Pd`, `previewDocs.js` fallback kabupaten) dan sudah dibersihkan di sesi itu; **2 hit PRE-EXISTING di HEAD** tersisa: `blocks/KopGugus.jsx:17` `kabupaten: 'PEMERINTAH KABUPATEN BANDUNG BARAT'` (bertentangan ADR F-4 "baris 9 prop-driven dari prop") + `blocks/SignatureFooter.jsx:8` komentar `SDN Pasirhalang`. Keduanya berarti laporan Sprint 001/002 ("T-02 = 0 hit") tidak lagi mencerminkan kode sekarang.
  Dampak: Sedang — gate yang diklaim hijau sebenarnya tidak dapat dipakai sebagai bukti; kalau tidak dibenahi, regresi hardcode berikutnya bisa lolos tanpa terdeteksi.
  Status: OPEN — tidak disentuh di sesi 2026-10-18 karena keduanya blok cetak SHARED (AGENTS.MD: jangan refactor di luar cakupan sprint). Terdaftar di STATE.MD Blockers + Langkah Selanjutnya butir 3.
  Mitigasi: (1) buat task sendiri di pack Sprint 012 untuk `KopGugus` + komentar `SignatureFooter`; (2) setelah itu jalankan ulang perintah kanonik 15 pola dan perbarui angka baseline di STATE/pack agar klaim match dengan kode; (3) beware laporan lama — angka "0 hit" hanya berlaku untuk versi file saat itu.

⚠️ [Tinggi] RISIKO: kualitas runtime engine OCR (tesseract.js) di browser BELUM terukur — fixture resmi dibangun dengan RapidOCR (engine lain), sehingga akurasi 100% di oracle tidak berlaku untuk jalur yang benar-benar dipakai user.
  FAKTA (ADR Q, 2026-10-19): risiko ini **sengaja diterima** saat A/B dilewati.
  FAKTA (Sprint 015 closure, 2026-10-19): risiko **MATERIALISASI** — diukur dengan engine asli (`test-bku-pdf-parse.mjs --pdf --fixture` atas fixture hasil tesseract.js): Januari 3/5 baris, **akurasi uraian 0%**, kolom uang salah (masuk Rp 0), tanggal hilang pemisah, baris hilang diam-diam. Total 10 bug perbaikan (lihat DECISIONS.MD bagian R).
  Dampak: Tinggi — kalau dibiarkan, fitur "import PDF" jadi tidak berguna (data hilang/ngawur) walau build hijau.
  Mitigasi (selesai): 10 perbaikan terukur (rotasi dideteksi, garis tabel dihapus sebelum OCR, kalibrasi kolom 3 paling kanan, penempatan token kotak lebar, recovery tanggal tanpa pemisah, filter yData setelah orphan attach, pecahan kolom teks, `buangHeader` tak buang "SALDO", `MIN_CONFIDENCE` 0, header ditulis saat simpan).
  Status: **RESOLVED** 2026-10-19 — 3 fixture (RapidOCR · tesseract+bersih file USER · tesseract+bersih file SAMPEL) semuanya **0 selisih + akurasi uraian 100%**; harness ukur engine asli tetap dipakai (dev-only, gitignored) agar regresi engine terdeteksi.

⚠️ [Tinggi] RISIKO: extension browser meng-intercept aset OCR (IDM "Advanced Integration" balas **204 + body 0 byte** untuk URL berakhiran `.gz`) → tesseract menulis `./ind.traineddata` kosong → init gagal ("Error opening data file ./ind.traineddata") dan fitur import mati total.
  FAKTA (2026-10-19, Edge profil sekolah): `/tesseract/lang/ind.traineddata.gz` → 204 / 0 byte; `/tesseract/lang/ind.traineddata` → 200 / 3.847.026 byte. `resp.ok` = true untuk 2xx sehingga body kosong lolos tanpa error.
  Dampak: Tinggi — import PDF gagal total di browser yang punya extension tersebut, dan gejalanya (error teknis) tidak Led ke penyebabnya.
  Mitigasi (selesai): aset disajikan **tanpa** ekstensi `.gz` + opsi `gzip:false` (tesseract.js deteksi magic 1F 8B sendiri) + `cacheMethod:'none'` (cache IndexedDB tidak meng-cache body kosong) + pesan error jujur di UI.
  Status: **MITIGATED** — terverifikasi 200 + OCR jalan 21/21 halaman.

⚠️ [Sedang] RISIKO: import PDF menulis `bku_data` tanpa `header` → halaman BKU crash saat reload (`TypeError: Cannot read properties of undefined (reading 'nama_sekolah')`, React error boundary) — data hasil import jadi tidak bisa dilihat.
  FAKTA (2026-10-19, ketemu saat uji browser pasca-merge): jalur Excel menulis `header`, jalur PDF tidak; `uploadedInfo.header.nama_sekolah` diakses tanpa penjaga.
  Dampak: Tinggi (halaman mati) — tapi hanya muncul setelah user menyimpan dari jalur PDF.
  Mitigasi (selesai): `simpan()` menulis header dari kop PDF (nama_sekolah/npsn/tahunAnggaran) + halaman BKU akses header pakai `?.` (aman untuk data lama).
  Status: **RESOLVED** 2026-10-19 — simpan → reload → halaman utuh, 0 console error, badge "SD NEGERI PASIRHALANG · NPSN 20205293 · Tahun 2026 · 5 transaksi".

⚠️ [Rendah] RISIKO: OCR 21 halaman butuh 2–4 menit di browser; tab yang ter-throttle (background) membuat worker web ikut melambat sehingga hasil tampil sangat lama dan user mengira hang.
  FAKTA (2026-10-19): terukur 5–7 detik/halaman saat tab aktif; saat tab ter-throttle progres 12→14 halaman butuh ~6 menit. Tidak ada error; hanya lambat.
  Dampak: Rendah — bukan cacat data, tapi pengalaman buruk kalau user pindah tab.
  Mitigasi: progres per halaman sudah tampil ("Membaca halaman N dari 21") + tombol "Batalkan proses" tersedia.
  Status: OPEN (non-blocking, diterima user).

⚠️ [Tinggi] RISIKO: definisi `totalPengeluaran` di `bkuParser.js:494-495` (= `PEMBAYARAN +
  TARIK_TUNAI`) berpotensi **menghitung uang yang sama dua kali**. `TARIK_TUNAI` adalah
  pemindahan dana bank → kas (bukan belanja); kas yang sama lalu dibelanjakan lewat baris
  `PEMBAYARAN` (BPU/BNU). Kode lama `recalcSummary` (`BKUPage.jsx:136-138`) sudah menulis
  komentar eksplisit: *"Tarik Tunai adalah pemindahan dana, bukan pengeluaran riil"* —
  jadi pengecualian itu disengaja, bukan kelalaian.
  FAKTA TERUKUR (dry run Sprint 016, 2026-10-20): data Excel Jan–Jun 2026 —
  `TARIK_TUNAI` = 2 baris / Rp 16.350.000; `totalPengeluaran` 82.560.000 → 98.910.000;
  `isBalanced` **true → false**. Di level "semua transaksi" BKU tetap seimbang
  (`totalPenerimaanSemua` = `totalPengeluaranSemua` = Rp 99.524.000), jadi
  ketidakseimbangan "riil" itu persis sebesar tarik tunai — indikasi kuat double counting.
  Dampak: Tinggi — indikator "Balance" bisa menampilkan "Tidak Balance" pada data yang
  sebenarnya sehat, dan angka pengeluaran yang dilaporkan ke dokumen bisa terlalu besar.
  Mitigasi: ADR §S1 (2026-10-20) menyamakan ke Excel agar kedua pintu masuk konsisten
  (bkuParser TABU, jadi definisi Excel tidak bisa diubah di Sprint 016). Perbaikan definisi
  yang benar butuh sprint sendiri yang diizinkan menyentuh `bkuParser.js` — kandidat:
  `totalPengeluaran` = `PEMBAYARAN` saja, `TARIK_TUNAI` disimpan di field terpisah.
  Status: **CLOSED 2026-10-20** — user memilih opsi B: `totalPengeluaran` = `PEMBAYARAN`
  saja + 1 baris `bkuParser.js:495` diperbaiki (izin eksplisit, TABU dicabut khusus baris
  itu). Lihat ADR `DECISIONS.MD` §T.
