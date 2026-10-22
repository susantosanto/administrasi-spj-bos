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

⚠️ [Sedang] RISIKO: dua jalur baca PDF menghasilkan `totalPengeluaran` BERBEDA untuk dokumen
  yang sama — jalur OCR (print-to-PDF) **130.549.500**, jalur teks-asli (unduh ARKAS)
  **132.397.000**. Selisih Rp 1.847.500.
  FAKTA TERUKUR (2026-10-20, `template-data/bku-output.pdf` vs `template-data/BKU tahunan.pdf`):
  jumlah baris 420 = 420; Σ penerimaan 182.305.000 = 182.305.000; Σ pengeluaran
  149.582.000 = 149.582.000; saldo 32.723.000 = 32.723.000. Jadi **tidak ada uang hilang** —
  bedanya murni klasifikasi `tipe`: OCR memecah 8 baris menjadi potongan
  `LAINNYA`/`PUNGGUT_PPH` sehingga nominalnya tidak masuk `PEMBAYARAN`, teks-asli membaca utuh.
  Dampak: Sedang — user bisa bingung melihat angka pengeluaran berbeda tergantung file yang
  diunggah, dan menyimpulkan aplikasi tidak konsisten.
  Mitigasi: kedua jalur didokumentasikan terpisah (ADR §U4); oracle OCR tetap menuntut
  130.549.500 dan oracle native mengunci 132.397.000, sehingga perubahan tak sengaja pada
  salah satunya langsung gagal. Angka mentah (yang dipakai dokumen resmi) identik di keduanya.
  Status: OPEN (diterima, by design) — yang perlu dijaga adalah **total mentah** tidak bergeser.

⚠️ [Sedang] RISIKO: Sprint 016 ditutup dengan **5 task acceptance BELUM diuji di browser**
  (T-05 penyaring, T-10 header/footer localStorage, T-14 tampil tanpa reload, T-16 gagal jujur,
  T-18 progres/batal). Semua gate node HIJAU, tapi gate node tidak menyentuh UI.
  FAKTA (2026-10-20): tidak ada dev server di sesi penutupan; user tetap memerintahkan
  "tutup sprint ini dan dinyatakan berhasil". Pembuktian hanya statis (pola grep + pembacaan
  kode), bukan perilaku nyata.
  Dampak: Sedang — cacat UI (mis. penyaring ikut mengubah jumlah simpanan, atau halaman BKU
  kosong sampai reload) bisa lolos tanpa terdeteksi.
  Mitigasi: (1) status tiap task ditulis apa adanya di `ACCEPTANCE.MD` §VERDICT dan
  `BUILD-REPORT.MD` §8.7 — tidak ada klaim PASS palsu; (2) bila muncul keluhan pada alur
  unggah/simpan/cetak, periksa kelima task itu **lebih dulu** sebelum menelusuri dari nol;
  (3) jalankan `/acceptance-runner` di sesi yang punya dev server.
  Status: OPEN (diterima user saat penutupan).

⚠️ [Rendah] RISIKO: pola grep pembuktian statis bisa memberi hasil menyesatkan (false positive
  maupun false negative) bila tidak memakai batas kata.
  FAKTA (2026-10-20, sesi penutupan Sprint 016): `grep -c "rose"` pada `BKUUploadPdf.jsx`
  memberi **8 hit** — semuanya dari kata **`proses`** (mengandung substring `rose`), bukan
  warna terlarang. `grep -c "konfirmasi"` memberi **1 hit** — hanya komentar dokumentasi,
  bukan dialog. Keduanya sempat terbaca sebagai pelanggaran kriteria sprint.
  Dampak: Rendah (kalau tidak diperiksa isinya) s/d Tinggi (kalau hit palsu membuat sprint
  ditolak, atau hit nyata terlewat karena pola terlalu longgar).
  Mitigasi: pakai awalan kelas Tailwind + batas kata
  (`\b(bg|text|border|ring)-(emerald|amber|rose|...)-`) dan hex literal `#[0-9a-fA-F]{6}\b`;
  **selalu buka isi hit**, jangan berhenti di angka.
  Status: OPEN (catatan proses, bukan cacat kode).


⚠️ [Sedang] RISIKO: Sprint 017 ditutup dengan seluruh item runtime BELUM diuji di browser (tab otomatis terbuka, interaksi Simpan/cetak, banner tanpa reload, `sorotPelanggaran`, persistensi `spj_lpj_bku` setelah reload, grup se-NoBukti lintas kategori).
  FAKTA (2026-10-21, penutupan atas perintah user "tutup sprint ini"): semua gate node HIJAU (build ✓ 12.62s · 7 oracle exit 0 · G-0…G-6), tapi gate node memakai `renderToStaticMarkup` yang **tidak menjalankan `useEffect`** → perilaku pasca-efek (termasuk tab awal langsung `lpj`) tidak terbukti. Skrip uji sudah dihapus (C-05) dengan cadangan di `.workbuddy-ai/backup-sprint017-tests/`.
  Dampak: Sedang — cacat UI (mis. isian tidak tersimpan setelah reload, tab salah terbuka, preview LPJ kosong) bisa lolos tanpa terdeteksi sampai user sekolah memakainya.
  Mitigasi: (1) daftar BELUM ditulis apa adanya di `ACCEPTANCE.MD` §7/§8 dan `STATE.MD` Langkah Selanjutnya — tidak ada klaim PASS palsu; (2) bila ada keluhan pada alur klik baris → Simpan → reload, periksa butir §7 itu **lebih dulu**; (3) `/acceptance-runner` di sesi dengan dev server + data BKU nyata; (4) oracle bisa dibangkitkan ulang dari cadangan bila perlu regresi.
  Status: OPEN (diterima user saat penutupan — pola sama seperti Sprint 016).

⚠️ [Sedang] RISIKO: dokumen LPJ punya DUA pintu masuk dengan perilaku simpan BERBEDA — halaman Dokumen LPJ (menu kiri) tidak menyimpan apa pun (`storageHelper.set` 0×), sidebar BKU menyimpan per NoBukti (kunci baru `spj_lpj_bku`). Keduanya berbagi satu komponen panel (`DetailDokumenLpj.jsx`, `layout` side/stack).
  FAKTA (temuan eksekusi Sprint 017, tercatat D-4 di `QUESTIONS.MD`): user memilih opsi (a) — biarkan, jangan tambah simpan ke halaman LPJ di Sprint 017 (scope + risiko). Panel versi sidebar memuat entri tersimpan lewat `muatAwal` di inisialisasi `useState`; versi halaman tanpa `gate` → tanpa banner.
  Dampak: Sedang — user bisa mengisi di satu pintu, mengira tersimpan, lalu ke pintu lain dan mendapati isian kosong/tanpa banner. Perilaku persis = keputusan user, tapi membingungkan bila tidak dilabeli.
  Mitigasi: (1) keputusan final D-6 (hapus menu / dua pintu / arsip) ditinjau setelah uji browser manual lulus — tercatat di `QUESTIONS.MD` + `STATE.MD`; (2) kalau dibiarkan dua pintu, pertimbangkan label/penanda di UI pada sprint berikut.
  Status: OPEN (by design, keputusan user D-4).

⚠️ [Sedang] RISIKO: Sprint 018 lulus browser test dengan **fixture sintetis**, bukan data BKU nyata xcode.
  FAKTA (2026-10-22): 89 asersi browser PASS (T-17 31 · T-18 51 · T-19 7) memakai 15 transaksi seed di `localStorage` (kode rekening/kegiatan buatan, 3 guru + 1 tendik). Data asli ARKAS punya variasi yang tidak tercakup: NoBukti sama lintas bulan, uraian multi-baris, kode rekening belum dipetakan, nominal besar, bulan tanpa data.
  Dampak: Sedang — bug bisa muncul hanya pada bentuk data tertentu (mis. kandidat dropdown kosong padahal ada baris mirip, prefill nominal salah).
  Mitigasi: (1) uji ulang alur T-17 dengan data BKU asli sebelum dipakai sekolah; (2) fixture bisa direproduksi dari `D:/project/scratch-pw/cek-018-seed.cjs` (di luar repo); (3) bila kandidat tak muncul, periksa `kodeKegiatan` baris (kriteria A-1) lebih dulu.
  Status: OPEN.

⚠️ [Rendah] RISIKO: dua file melewati batas modul yang disepakati — `utils/previewDocs.js` 486 baris (batas 480) dan `utils/aturanMamin.js` 202 (batas 200).
  FAKTA (2026-10-22, gate G-5): kelebihan 5 dan 2 baris; tidak dirapikan karena perbaikan menyentuh kode yang sudah lulus oracle + hash baseline.
  Dampak: Rendah — batas modul adalah konvensi keterbacaan, bukan perilaku.
  Mitigasi: rapikan pada sprint berikutnya yang memang menyentuh dua file itu (jangan refactor di luar cakupan).
  Status: OPEN (diterima sebagai deviasi D-5 di `BUILD-REPORT.MD`).

⚠️ [Sedang] RISIKO: klaim "preview = cetakan" (R-1) BELUM dibuktikan untuk Sprint 018 — tidak ada perbandingan PDF cetak vs Panel Preview.
  FAKTA (2026-10-22): AF-03 & AF-04 butir cetak bertanda `[ ]` di `ACCEPTANCE.MD`; yang terbukti baru urutan dokumen (LPJ→PBJ), sufiks " PBJ", dan isi preview (NIP, kolom TTD, nominal).
  Dampak: Sedang — area cetak Mamin dan `maminDocs()` adalah dua builder terpisah (temuan 2026-10-21). Kalau merge otomatis hanya masuk satu jalur, layar dan kertas bisa berbeda tanpa terdeteksi.
  Mitigasi: (1) cetak satu set Mamin (Undangan · Pesanan ×2 · Notulen · Daftar Hadir · Buku Tamu) ke PDF lalu bandingkan teksnya dengan panel preview; (2) pola uji cetak tanpa server sudah ada di memori proyek (`renderToStaticMarkup` + CSS `dist/` → `file://` → `page.pdf`).
  Status: OPEN.

⚠️ [Sedang] RISIKO: label toggle "Rincian Pesanan" BEDA antara sidebar BKU dan halaman Dokumen LPJ — `Nasi Box (6)` vs `Seksi Nasi Box (6)`.
  FAKTA (2026-10-22 17:0x): permintaan user poin 3 = buang kata "Seksi" dari UI; poin 5 = samakan form rincian pesanan dengan halaman LPJ. Dua permintaan ini bertabrakan tepat di satu label. Keputusan yang diambil: buang kata "Seksi" (deviasi D-7). Struktur, penomoran global, kolom, dan isi menu IDENTIK — dibuktikan uji paritas P2–P8 (8/8 PASS).
  Dampak: Sedang — user bisa melihatnya sebagai "belum sama" saat membandingkan dua halaman berdampingan, lalu meminta perbaikan lagi.
  Mitigasi: satu baris di `MaminPesananRincian.jsx` (`SEKSI[].label`). Kalau user memilih "persis sama", ubah ke `Seksi Nasi Box (…)`; kalau memilih konsisten premium, rapikan juga label di `DokumenFormPreview.jsx:1330`. Keputusan dititipkan di `STATE.MD` Langkah Selanjutnya butir 4.
  Status: OPEN (menunggu keputusan user).

⚠️ [Rendah] RISIKO: dua komponen dipecah (`MaminDaftarHadirTabel`, `MaminPesananRincian`) → perubahan tabel/rincian kini menyentuh 2 berkas.
  FAKTA (2026-10-22): `MaminSeksi2DaftarHadir` 212 dan `MaminSeksi4Pesanan` 213 melewati batas 200 (G-5) setelah revisi UI. Dipecah menjadi 131+119 dan 100+134.
  Dampak: Rendah — risiko "lupa mengubah pasangannya" saat menyetel tampilan tabel/rincian.
  Mitigasi: komponen baru bersifat presentational (state tetap di induk), jadi logika tidak terduplikasi. Uji `cek-018-revisi.cjs` (R4/R5) + `cek-018-paritas.cjs` menjaga keduanya.
  Status: MITIGATED.

✅ [Sedang → SELESAI] RISIKO: kolom input lentur (`flex-1`) menyusut ~18px sehingga teks tidak terlihat — kolom tampak kosong walau datanya ada.
  FAKTA (2026-10-22 17:2x): `MaminPesananRincian` (Uraian) & `MaminSeksi5BukuTamu` (Nama) memakai `${INPUT_SM} flex-1` padahal `INPUT_SM` mengandung `w-full`. Ukur DOM: `width:18px`, `clientWidth:16`, `scrollWidth:119` → teks "Ayam Goreng Kremes" terpotong total. Sumber LPJ (`DokumenFormPreview.jsx:1389`) hanya memakai `flex-1` tanpa `w-full`.
  Dampak: Sedang bila lolos — user melihat 10 baris pesanan kosong dan menganggap data hilang, padahal tersimpan.
  Mitigasi: kelas dasar dipisah dari utilitas lebar (`DASAR` + `flex-1 min-w-0` / `w-16` / `w-14`); asersi penjaga R5.8/R5.9 (lebar ≥300px DAN `scrollWidth <= clientWidth + 2`) ditambahkan ke `cek-018-revisi.cjs`.
  Status: RESOLVED (diverifikasi: lebar kolom Uraian >800px, teks tampil; 128 PASS / 0 FAIL).

⚠️ [Rendah] RISIKO: grid global `.template-engine td/th { border: 1px solid #d1d5db }` dihapus — baru diverifikasi di LAYAR, hasil CETAK/PDF belum dibandingkan.
  FAKTA (2026-10-22 17:3x): akar "garis tipis" = aturan grid global itu, bukan kelas di tiap komponen. Dihapus dari `index.css`; tabel sah tetap bergaris karena punya kelas sendiri (`border-gray-300`, `.spd-tabel`, `.kas-tabel`, `.pajak-tabel`). Audit 15 kertas hasil render × 2 kategori → 0 sel bergaris tanpa kelas tabel (uji `cek-019-garis.cjs` G1–G7, 7/7 PASS).
  Dampak: Rendah — bila ada komponen yang ternyata MENGANDALKAN grid global untuk cetak (mis. tabel yang lupa diberi kelas), ia akan tercetak tanpa garis. Di layar sudah 0 temuan.
  Mitigasi: cetak satu set dokumen bertabel (DAFTAR HADIR · SURAT PESANAN · Register Kas · SPD) ke PDF, pastikan garis tabel masih ada dan dokumen surat (UNDANGAN/NOTULEN/BUKU TAMU) bersih tanpa garis. Belum dikerjakan.
  Status: OPEN.

⚠️ [Sedang] RISIKO: kartu panel preview kini setinggi KERTAS (297/330mm) sehingga lebih tinggi dari viewport biasa.
  FAKTA (2026-10-22 18:0x): permintaan user "tinggi card panel preview = tinggi kertas". Kartu A4 terukur 1305px (area dokumen 1153px) pada viewport 1000px. Sudah ditangani: toolbar `sticky` dilepas (menempel viewport → menabrak header app), kolom preview layout `side` diberi `max-h-[calc(100vh-104px)] + overflow-y-auto` supaya `sticky` tidak memaku kartu yang lebih tinggi dari layar.
  Dampak: Sedang — pada layout `stack` (sidebar BKU) dengan 3 dokumen, area dokumen menampung 1 lembar dan sisanya digulir di dalam; halaman jadi lebih panjang. Pada layar pendek (<800px) area kertas bisa mendominasi layar.
  Mitigasi: uji di viewport 768×800 dan 1366×768; bila terlalu tinggi, ubah `tinggiArea` menjadi `min(calc(kertas+30px), calc(100vh-140px))` — satu baris di `PanelPreviewDocument.jsx`.
  Status: OPEN (sebagian ditangani, belum diuji di layar kecil).

⚠️ [Rendah] RISIKO: `sinkronPbjDariSumber` MENIMPA nilai turunan PBJ (tanggalSurat, kegiatan) — entri PBJ lama yang sudah disimpan bisa berubah saat dibuka lagi.
  FAKTA (2026-10-22 18:0x): field turunan sengaja ditimpa (bukan hanya diisi bila kosong) supaya PBJ mengikuti Nama Kegiatan. Entri tersimpan yang `kegiatan`-nya diketik manual akan diganti `formData.acara` saat baris dibuka.
  Dampak: Rendah — perilaku ini yang diminta user ("Kegiatan/Pekerjaan bisa diambil dari nama kegiatan sebelumnya"), tetapi user yang pernah mengetik berbeda akan melihat nilainya berubah tanpa pemberitahuan.
  Mitigasi: bila user ingin nilai manual dipertahankan, ubah `sinkronPbjDariSumber` menjadi hanya-mengisi-kosong (seperti `prefillPbjDariBku`) — satu baris, dan tambahkan tombol "kembalikan ke Nama Kegiatan".
  Status: OPEN (menunggu keputusan user bila keberatan).

⚠️ [Rendah] RISIKO: tempat TTD pindah kunci `tempat` → `tempatTtd` — isian lama bisa "hilang".
  FAKTA (2026-10-22 18:2x): `SignatureFooter` dulu membaca `data.tempat`. Entri yang tersimpan dan sempat diubah tempat TTD-nya lewat input mode edit akan menampilkan "Cikalongwetan" lagi setelah perubahan ini (nilai lamanya masih ada di `tempat`, hanya tidak dibaca lagi).
  Dampak: Rendah — perilaku baru sesuai permintaan user (default Cikalongwetan), tetapi user yang pernah mengubah manual akan melihat perubahannya.
  Mitigasi: bila perlu, migrasi sekali jalan: `formData.tempatTtd = formData.tempatTtd || formData.tempat` saat memuat entri lama. Belum dikerjakan karena justru akan mengembalikan bug "Ruang Rapat …" untuk data lama.
  Status: OPEN (diterima sadar).

⚠️ [Rendah] RISIKO: baris "di"/"tempat" kini dicetak dari NILAI default, bukan label — user yang sengaja mengosongkannya akan melihat "[ di]" lagi.
  FAKTA (2026-10-22 18:4x): field `diUndangan`/`tempatUndangan`/`diPesanan`/`tempatPesanan` diberi label `''` + default nilai `'di'`/`'tempat'` agar blok penerima surat tidak lagi mencetak "Di Di" / "Di Di tempat". Bila user mengosongkan nilai di mode edit, `TabelLetterHeader` merender `<PlaceholderText label="">` → "[ di]" muncul lagi (persis gejala lama, sebab berbeda).
  Dampak: Rendah — hanya pada entri yang sengaja dikosongkan; cetakan baku tetap "di"/"tempat".
  Mitigasi: bila placeholder kosong terlihat lagi, tambahkan penjaga di `TabelLetterHeader` — nilai `''` pada field ini jatuh kembali ke `'di'`/`'tempat'` saat render (satu baris, belum dikerjakan karena belum diminta).
  Status: OPEN (diterima sadar).
