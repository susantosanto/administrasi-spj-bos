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
