# STATE.MD — Status Proyek

## Informasi Proyek
- Nama: spj-app (Aplikasi LPJ BOS/BOSP)
- Mulai (titik adopsi workflow): 2026-09-13

## Status Saat Ini
- Sprint 007 — Revisi Parser + Hadir + Menu Pesanan — 🟡 **BUILDER SELESAI (STATIK) 2026-10-05 di branch `feat/sprint-005-autogen` (Pilihan B, 005+006 ikut kebawa), belum di-commit, belum acceptance.**
  Dry run disetujui user/koordinator 2026-10-05; eksekusi A.1→E.2. 0 baru (`aturanMamin.js`
  160/200: MENU_PESANAN Nasi-6/Snack-4 + rincianMenu + templatePesananMamin per-jenis + fallback konsumsi) + 3 ubah
  (bkuKategori.js kupasEkorJamuan + kupasPrefiksKonsumsi + bacaGTKUntukHadir Guru→Tendik;
  DokumenSPJPage.jsx hadir via bacaGTKUntukHadir; DokumenFormPreview.jsx tombol Isi menu baku).
  B.2/D.1/D.2 reuse-006 verified-existing tanpa ubah logika; cetak formal tak tersentuh
  (diff blocks/templateConfig/TemplateEngine kosong).
  Gate: build exit 0 ×2 (baseline `5.03s`, final `4.99s`) · node oracle 18/18
  (parser jamuan 3 + konsumsi 2 + fallback + multi-baris lama; hadir kosong/isi; menu 6/4/fallback) ✅ ·
  T-08 15 pola = 0 · fetch/AI = 0 · blue-only tambah 0 · spj_otomatis_snapshot = 3 · Urungkan = 7 ·
  grep Jamuan/parseMamin/data_tendik/templateDaftarHadir/templatePesananMamin/MENU_PESANAN semua ≥ DoD.
  Catatan jujur: `bkuKategori.js` 382 baris = warisan 337 pra-007 (refactor luar cakupan, dilarang AGENTS.MD);
  node `-e` langsung terhalang impor extensionless warisan → harness temp (logika byte-identical).
  UNTESTED runtime (T-04/T-05 klik-baris + screenshot, T-06 screenshot 6/4, T-07 3 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  **REWORK ronde-1 2026-10-05 (verdict NOT APPROVED High, tanpa commit):**
  `aturanPesanan.js` BARU 192/200 (parser 007 + bacaGTK + gabung/kelompok/dominan,
  byte-identical, pola 006) + `bkuKategori.js` 382→194/200 (re-export 1 pintu,
  API identik) + impor `.js` (node prescribed T-02/T-03/T-05/T-06 exit 0 TANPA
  harness). Gate: build exit 0 `5.03s` (186 modul) · oracle 22/22 · util ≤200
  semua · hardcode 0 · offline 0 · diff cetak kosong. → acceptance ulang.
  Laporan: `planning/sprints/sprint-007/BUILD-REPORT.MD`.
- Sprint 006 — Autogen Semua Tab Mamin — 🟡 **BUILDER SELESAI (STATIK) 2026-10-03 di branch `feat/sprint-005-autogen` (Pilihan B, 005 ikut kebawa), belum di-commit, belum acceptance.**
  Dry run + pecah `aturanMamin.js` disetujui user/koordinator; eksekusi A.1→F.2. 1 baru `aturanMamin.js`
  (132/200: templatePesananMamin + templateDaftarHadir + templateBukuTamu + lengkapiNotulen) + 4 ubah
  (aturanUndangan.js re-export 4 fn, 148/200; bkuKategori.js subId routing kegiatan→pesanan;
  DokumenSPJPage.jsx prefill per-sub + GTK rows + tempat default sekolah + snapshot otomatis;
  DokumenFormPreview.jsx toggle hadir via template + input perihalPesanan + 3 baku-hint BKU-gated).
  Cetak formal tak tersentuh (diff blocks/templateConfig/TemplateEngine kosong); E.1/E.2 reuse 005 tanpa ubah kode.
  Gate: build exit 0 ×2 (final `7.89s`) · node 4 template (T-03 jujur "" + F1–F4 oracle) ✅ ·
  T-08 15 pola = 0 · fetch/AI = 0 (komentar "fetch" dibuang) · blue-only tambah 0 ·
  spj_otomatis_snapshot = 3 · Urungkan ≥ 6.
  UNTESTED runtime (T-02/T-04/T-05/T-06/T-07 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  Deviasi tercatat: pembuka = kalimat baku 005 (T-06 menang atas nama pejabat); waktu = '' (tanpa sumber BKU);
  node-test bkuKategori terhalang import extensionless warisan (build vite lolos).
  Laporan: `planning/sprints/sprint-006/BUILD-REPORT.MD`.
- Sprint 005 — Autogenerate Undangan + Resume — 🟡 **BUILDER SELESAI (STATIK) 2026-10-03 di branch `feat/sprint-005-autogen`, belum di-commit, belum acceptance.**
  Dry run disetujui user; eksekusi A.1→E.2. 1 baru `aturanUndangan.js` (142/200) + 3 ubah
  (bkuKategori SELALU TIMPA + parsePerjalanan, DokumenSPJPage template+snapshot+badge+Urungkan,
  DokumenFormPreview chip "dari BKU"); BKUSidebar verified-existing tanpa diff; parseMamin
  byte-identical (lindungi T3 6/6).
  Gate: build exit 0 ×3 (final `4.92s`) · node import 11 exports + 7 kasus parser ✅ ·
  5 pola T-08 = 0 · added-lines 15 pola + fetch/AI = 0 · diff warisan kosong ·
  E-2 = 0 · spj_otomatis_snapshot = 3 · Urungkan = 6.
  UNTESTED runtime (T-03…T-07 screenshot, E-1 buka-ulang) → /acceptance-runner konteks segar.
  Laporan: `planning/sprints/sprint-005/BUILD-REPORT.MD`.
- **REVISI BKU grup+Mamin+hapus LPJ+hapus panel ATK — ✅ T1-T7 DONE di main lokal 2026-10-02, belum push, belum acceptance fresh.**
  HEAD `cc2456e` ahead 3 dari `origin/main` (`08e4078` parsial warisan + `a53fd61` revisi T1-T4 + `cc2456e` hapus panel ATK T6-T7).
  T1 hapus kolom LPJ · T2 grup dominan kode rekening + auto filter cerdas · T3 parser Mamin ketat Q3 ·
  T4 bahasa tanpa ubah cetak · T5 merge a53fd61 · T6 hapus panel ATK (BKUPage 1 ins 50 del) · T7 merge cc2456e.
  Verifier FINAL **APPROVED Medium** — batas: live klik + screenshot belum jalan → ke acceptance-runner fresh.
  Sisa: acceptance-runner fresh (seed grup 2 baris BNU sama, 1 Mamin Rapat, 1 snack, klik filter/expand, screenshot BKU tanpa panel ATK) + push.
  Laporan: `planning/sprints/sprint-004/BUILD-REPORT.MD` (§ADDENDUM REVISI 2026-10-02).
- Sprint 004 — BKU → LPJ Smart Bridge — 🟡 **BUILDER SELESAI (STATIK) 2026-10-01, belum di-commit, belum acceptance.**
  Dry run disetujui ("setuju"); eksekusi A.1→D.2 (13 task). 1 baru `bkuKategori.js` (199/200) + 5 ubah
  (BKUPage badge/filter/panel ATK, BKUSidebar detail/koreksi/deep-link/grup, DokumenSPJPage prefill/badge/undo/kunci,
  PejabatSekolahPage riwayat, DokumenKelengkapanPage terima kelompok). 0 dependency.
  Gate: build exit 0 ×10+ · 15 pola 0 · diff warisan kosong · blue-only 0 baru ·
  logika node 28/28 (kategori/koreksi/merge/flag/pejabat/prefill).
  UNTESTED runtime (T-03…T-07, E-1, C.3 manual) → /acceptance-runner konteks segar.
  Laporan: `planning/sprints/sprint-004/BUILD-REPORT.MD` + `DRYRUN-REPORT.MD`.
- Sprint Aktif: **Sprint 003 — ✅ DITUTUP 2026-10-01 (risiko diterima user;
  ronde-2 dibatalkan).** /acceptance-runner RONDE-1: 12 PASS / 0 FAIL /
  8 UNTESTED (gap = browser mati, 0 bug). Question ronde-2 vs risiko → CLOSED
  (QUESTIONS.MD): user pilih terima risiko (preseden 001/002).
  Laporan final: `planning/sprints/sprint-003/VERIFICATION-REPORT.MD`.
  Rincian ronde-1 —
  PASS runtime: T-08(a) auto-open + T-08(h) jump-tetap-buka + badge 0/6→1/6,
  T-02 rename, T-03 kartu ringkasan, E-1 kosong-jujur (0 console error).
  PASS statik: T-01 build EXIT=0, T-07 2 cabang + honor-only, T-08 ronde-2
  (jump=21, tabseen=0), T-10 (15 pola 0, warisan kosong), C-11/C-12.
  Gap = browser Playwright mati tengah sesi (8 item runtime: T-04 penuh, T-05
  penuh, T-06, T-07 picker, T-08 b/c/d/e/f/g, T-09 revert-test, T-10 Honorarium,
  E-2). TIDAK ADA temuan bug. Laporan:
  `planning/sprints/sprint-003/VERIFICATION-REPORT.MD` (belum di-commit).
  Builder: dry run disetujui user; komit `17a266d`→`45129a9` + revisi R1…R9
  `414b53d`; build exit 0 ×7; runtime pencil/Playwright — pill+popover+rename+
  jump terbukti, 8 gap diterima sebagai risiko.**
  **REVISI PANDUAN (keputusan user 2026-10-01 sesi 2) — kode selesai, gate statik lulus,
  BELUM di-commit:** (1) konten langkah = tab nyata tiap menu (`when(ctx)` utk sub
  Koordinasi/Bank) · (2) auto-open SETIAP masuk menu · (3) trigger "selesai isi tab"
  selalu muncul (lewati dismiss) · (4) popover tutup saat ganti tab/menu
  (`key={menuId}`, `spj_guide_tabseen_*`). File: guideConfig + MenuGuide ditulis ulang,
  formTab/previewTab diangkat ke DokumenSPJPage, 4 pack + BUILD-REPORT direvisi
  (T-08 REVISI 2026-10-01). Gate: build exit 0 · 15 pola 0 · blue-only 0 baru ·
  MenuGuide 232/300 · guideConfig 68/150. UNTESTED: interaksi popover (pencil browser
  tanpa klik) → acceptance-runner.
  **RONDE-2 (temuan uji manual user 2026-10-01):** (1) pindah jenis/sub popover tidak
  muncul → aturan baru **selalu tampil setiap pindah konteks** (jenis/tab/mode;
  SUPERSEDE "1× per tab" + "tutup saat ganti tab", `spj_guide_tabseen_` DIHAPUS);
  (2) list langkah **bisa diklik** → jump ke tab/mode + scroll, popover tetap
  (task R8/R9). Kode+pack selesai, gate: build exit 0 `5.83s` · jump=21 · 15 pola=0 ·
  MenuGuide 225/300 · guideConfig 69/150. **Belum di-commit.**
  Pack 4 dokumen (Bab 8.4): `planning/sprints/sprint-003/` REQUIREMENTS · BLUEPRINT ·
  ACCEPTANCE · HANDOFF-PROMPT. PRD: `planning/sprints/sprint-003/PRD.md` (US-19…US-30).
  Salinan audit: `architect-packs/architect-pack-003-rework-preview-dan-panduan.md`
  (593 baris). Isi: Fitur A — preview → kartu ringkasan (tanpa kop/TTD), rename
  tombol, cetak Perjalanan Dinas 5 dokumen + Mamin set lengkap, penerima semua
  status; Fitur B — MenuGuide pill+popover sadar-state di 4 menu, config-driven.
  **23 task / 5 fase / 3 file baru / 3-4 file diubah / 0 dependency baru / 12 test
  case (T-01…T-10 + C-11/C-12)**. Cross-artifact check: LULUS (1 cacat ketemu &
  diperbaiki — task 5.4 tanpa kriteria → C-12 ditambah).
  Keputusan tertunda ke dry run: nama final tombol (usulan "Lihat Ringkasan"),
  pemetaan docx Mamin, Pemeliharaan pola penuh/parsial.
- Sprint 001 + 002 resmi DITUTUP & APPROVED 2026-09-30
  (lihat blok penutupan di bawah).
- **PENUTUPAN RESMI SPRINT 001 + 002 — 2026-09-30 (/acceptance-runner konteks segar).**
  Kedua ACCEPTANCE dijalankan ulang: **T-01 build exit 0** (`✓ built in 8.09s`,
  Node v24.19.0) · **T-02 Sprint 001** 15 pola `-i` = 0 hit + aset 0 · **T-02 Sprint
  002** rescoped = 0 · **T-04** 3 blok 0 `<input>/<textarea>` · **T-10** 0 warna baru
  (`git diff 264c431..HEAD` terverifikasi) · **T-13** 0 caret, MATCH 14/14, lockfile
  bersih · jalur auto-fill T-12/T-15, banner 2 varian, logo kop, SKHonorer
  prop-driven, 3 blok resmi SPD, reset `dokumen_lpj` — semua **PASS statik segar**.
  Bukti lengkap: `planning/sprints/sprint-001/VERIFICATION-REPORT.MD` +
  `planning/sprints/sprint-002/VERIFICATION-REPORT.MD`.
  ⚠️ **Kriteria UI runtime = UNTESTED, risiko DITERIMA EKSPLISIT oleh user
  2026-09-30** (tool browser tidak tersedia di sesi runner; user memilih menutup
  sprint & lanjut Sprint 003). Mitigasi: uji manual user (`fix-template-document.md`)
  tidak menemukan cacat di lingkup 001/002 — temuan ulasan ada di lapisan preview
  (lingkup Sprint 003). Status kedua sprint: **✅ SELESAI (APPROVED, risiko
  diterima)**. **Push ke origin MASIH tertunda** (±14 commit lokal).
- **2026-09-30: PRD Sprint 003 DIBUAT (draft — belum pack, belum disetujui).**
  `planning/sprints/sprint-003/PRD.md` (US-19…US-30): (A) rework lapisan preview →
  kartu ringkasan data tanpa kop/TTD, rename tombol "Preview Dokumen", Cetak Semua
  Perjalanan Dinas = 5 dokumen, set cetak Mamin = semua docx di `template/`,
  penerima = semua pegawai semua status (Honorarium tetap honorer-only);
  (B) Panduan langkah = pill+popover sadar-state di 4 menu, config-driven.
  Sumber: feedback `fix-template-document.md` + 2 ronde keputusan user sesi ini.
  Urutan tetap: /acceptance-runner konteks segar dulu (Sprint 001+002), baru
  planning pack Sprint 003. Kode TIDAK disentuh.
- Sprint 001 — Fondasi Data Sekolah & Pejabat — 🟡 **TUTUP (STATIK)**
  (**FASE 1–6 SELESAI (STATIK)** — FASE 1–4 di-commit `8398fe1` 2026-09-18; FASE 5–6
  selesai + lulus gate Builder 2026-09-18, di-commit `73174c0` (`feat:`) + `2e23441`
  (`docs:`); **belum di-push**;
  verifikasi UI runtime menunggu /acceptance-runner ulang utuh)
  Pack: DIBUAT + di-realign Bab 8.4 + dipecah jadi 2 sprint + **direvisi 2026-09-17
  v2/v3/v4 (verifikasi)** + **v5 (dry run Fase 1+4)**.
  ⏸️ **SPRINT 001 TUTUP (statik)** — sesuai AGENTS.MD semua keputusan commit/push = kewenangan user.
  Requirement: `planning/sprints/sprint-001/PRD.md` (18 user story, **umbrella untuk
  dua sprint**) — hasil `/idea-clarifier` + `/prd-generator`, dikonfirmasi user 2026-09-14.
  Pack teknis (4 dokumen, Bab 8.4): `planning/sprints/sprint-001/`
  `REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` · `HANDOFF-PROMPT.MD`.
  Salinan audit trail (Bab 8.5): `architect-packs/architect-pack-001-fondasi-data-sekolah-pejabat.md`
  (**1459 baris**, diregenerasi 2026-09-17 v3 — Lampiran check #5 **per-baris**:
  73 baris baseline T-02 terukur, setiap baris punya satu task bernama di BLUEPRINT;
  riwayat check #5 v1/v2/v3 tercatat di §5e).
  Isi: US-13…US-18 (+US-11 sebagian) · **6 fase / 53 task** · **2 file baru +
  19 file diubah** · **14 test case** (T-01…T-14) · 4 gate build · jalur kritis
  `1 → 2 → 3 → 4 → 5 → 6`. Gate T-02 v3: **15 pola** `grep -rniE`
  (`-i` wajib), baseline terukur **73 baris di 15 file**.
  `BLUEPRINT.MD` memuat versi dependency ter-pin eksak — memenuhi temuan F8
  `docs/SECURITY-AUDIT-001.md` §5. ⚠️ **Koreksi 2026-09-17:** catatan lama "0 mismatch /
  14 paket vs lockfile" **hanya berlaku untuk tabel BLUEPRINT ↔ `package-lock.json`**;
  `package.json` sendiri masih memakai `^` untuk 14 paket → dijadikan **task 1.11 + T-13**.
  **Status: DRAFT v3 — menunggu persetujuan user; coding DILARANG dimulai sebelum
  pack disetujui (aturan AGENTS.MD).**
- Sprint Terbaru: **Sprint 002 — Rework Modul Perjalanan Dinas** — 🟡 **FASE 1–5 SELESAI (STATIK) 2026-09-19**
  (di-commit `36b408f`→`5b11f10`, **belum di-push**; verifikasi UI runtime menunggu
  /acceptance-runner konteks segar). Pack: `planning/sprints/sprint-002/` (4 dokumen +
  `DRYRUN-REPORT.MD`) ·
  salinan audit `architect-packs/architect-pack-002-perjalanan-dinas.md` (656 baris,
  Lampiran **5 LULUS**). Isi: US-01…US-10, US-12 (+US-11 sebagian, + regresi US-16) ·
  5 fase / 27 task. ⚠️ **Prasyarat keras** — memakai `getSignatureRoles()`,
  `getPejabat()`, `getPejabatStatus()`, `PEJABAT_ROLES`, `mergePejabat()`,
  `blocks/PeringatanData.jsx` yang baru ada setelah Sprint 001 selesai.
  **Disesuaikan 2026-09-17** (`HANDOFF-PROMPT.MD` saja, 3 titik) akibat perluasan scope
  Sprint 001: (a) verifikasi prasyarat ditambah **grep anti-hardcode wajib 0 hasil**;
  (b) peringatan "tujuh blok sudah data-driven" (bukan hanya `KopSurat`/`SignatureFooter`);
  (c) klaim lama "perubahan `DokumenFormPreview.jsx` **aditif**" **dikoreksi** jadi
  **substantif** — Sprint 001 memasang auto-fill pejabat + mengganti 5 literal nama sekolah
  + membersihkan 5 placeholder nama/NIP di file itu. ⚠️ **5 file tumpang tindih** dengan
  Sprint 001 (`SPDForm`, `SuratTugas`, `SuratUndangan`, `templateConfig.js`,
  `DokumenFormPreview.jsx`) — batas tegas: **001 = sumber nilai · 002 = struktur & layout**.
  **FASE 1–5 SELESAI & LULUS GATE BUILDER (STATIK) 2026-09-19** — 6 file disentuh, 0 file
  baru. **FASE 1** (`36b408f`) hapus tab & config `surat_tugas` (satu dokumen = satu tab).
  **FASE 2** (`6a5408f`) form SPT/SPD/Undangan selaras docx sumber: SPT per-penerima
  (Nama/NIP/Pangkat/Jabatan), pengikut SPD multi-baris, 2 paragraf penutup + tembusan
  undangan, `sifat` default `-`; efek auto-sync SPPD diperbaiki dengan `...prev`.
  **FASE 3** (`e7c0150`) 3 blok cetak murni — 0 `<input>`/`<textarea>`, placeholder nama
  riil → label generik (D-2), pengikut SPD tampil data. **FASE 4** (`6746d66`) print-area
  SPD lengkap: 3 blok resmi kalimat persis docx ("Telah diperiksa…", "Catatan Lain-Lain",
  "PERHATIAN :") + anti-terpotong halaman. **FASE 5** (`5b11f10`) tombol "Reset Data
  Dokumen LPJ" (`storageHelper.remove('dokumen_lpj')` + confirm, tanpa migrasi; Data
  Sekolah utuh) + gate akhir. **3 koreksi dry run disetujui user 2026-09-19:** D-1 rescope
  T-02 (kecualikan `templateSuratHelper.js` — fitur "Template Surat Cerdas" lain) · D-2
  placeholder generik · D-3 perluas T-04 ke `<textarea`. Bukti gate: build exit 0 ·
  grep `surat_tugas` (rescoped) = 0 · grep `<input|<textarea` 3 blok = 0 · 4 string legal
  SPD persis · 15 pola anti-hardcode Sprint 001 tetap 0 hit · 6 konsumen tidak tersentuh.
  Detail di `DRYRUN-REPORT.MD` + ADR bagian M di `DECISIONS.MD`. ⚠️ **UI runtime
  (T-03…T-11) belum terbukti — wajib /acceptance-runner konteks segar.**
  Juga selesai pra-sprint: fix `nama_sekolah` snake_case → camelCase di
  `DokumentasiAIGenerate.jsx` (commit `c955019`, 2 titik: kop preview + HTML cetak).
- Status: Sprint 000 (ONBOARDING) sudah **DITUTUP**. Baseline keamanan `aedd65c`
  (FINDINGS: 2 TINGGI terjadwal RISKS.MD, 0 KRITIS). Checklist A 27.7.1 hijau —
  posisi aman untuk pindah agent. **5 pertanyaan OPEN** di QUESTIONS.MD (keputusan parser
  xlsx, duplikat xlsx di root `package.json`, `NomorSuratPopup` `'SDN-PSR'`, batas literal
  tempat/tanggal dokumen, `templateSuratHelper.js` fitur "Template Surat Cerdas" — dua
  terakhir tidak memblok sprint; pertanyaan `nama_sekolah` CLOSED 2026-09-19).
  Posisi ritel 27.3: Tahap 2 langkah 4 (/idea-clarifier) **selesai**.
- **VERIFIKASI INDEPENDEN 2026-09-17 (v4)** — 11 klaim pack v3 diukur ulang terhadap
  kode nyata (dipicu permintaan user "cek AGENTS/STATE/DECISIONS"). **Semua COCOK:**
  gate T-02 baseline terukur **73 baris / 15 file** (setiap angka per file persis sama
  tabel `ACCEPTANCE.MD:94-111`); cek aset `grep … | grep -i sourceFile` = **0** (11 path
  `.xlsx` aman); **53 task** (F1=12 · F2=8 · F3=6 · F4=20 · F5=4 · F6=3); 14 caret
  `package.json` (`lockfileVersion: 3`); `export default` `sekolahData.js:83` +
  `signatureRoles.js:39` **terbukti 0 konsumen**; temuan F-1a, D-3, D-6, F-4 semuanya
  terbukti di kode. Gate T-01 `npm run build` **lulus** (`177 modules`, `10,42 s`).
  **1 cacat ditemukan & diperbaiki:** koreksi F-2 v3 menulis Node **v24.19.0** sebagai
  "runtime mesin pengembangan" — **terbalik**. Runtime gate yang benar = **v22.22.2 /
  npm 10.9.7** (*managed*, yang dipakai agent); v24.19.0 hanya *system fallback*.
  **Determinisme terverifikasi:** build di kedua runtime → **hash artefak identik**
  (hanya waktu beda: 10,42 s vs 6,89 s) → tidak memengaruhi gate.
  Dampak v4: `BLUEPRINT.MD` (Tech Stack + catatan koreksi dibalik + header revisi),
  `ACCEPTANCE.MD` (T-01 wajib sebut versi runtime + header revisi), salinan audit
  `architect-pack-001` (2 titik sama), 1 ADR baru + 1 catatan supersesi di `DECISIONS.MD`.
  **Isi task (53), jumlah file (19), gate, dan 14 test case TIDAK berubah** —
  v4 murni koreksi akurasi klaim. `sprint-002/BLUEPRINT.MD:54` sudah benar sejak awal.
- **DRY RUN FASE 1 + FASE 4 SELESAI 2026-09-17 (v5)** — `DRYRUN-T1.md` **ditulis ulang
  jadi v2** (versi 2026-09-14 hanya mencakup inti Fase 1). Hasil: **FASE 1 ✅ dapat
  dijalankan apa adanya** (2 konsumen konstanta basi terkonfirmasi = `KopSurat` +
  `SignatureFooter`; kedua `export default` terbukti 0 konsumen; semua baris task 1.4–1.11
  cocok dengan kode). **FASE 4 menemukan 3 cacat preskripsi** — lolos dari v3/v4 karena
  keduanya memeriksa "apakah baris tertaut task", bukan "apakah task-nya benar":
  **D-7** tab `surat_tugas` memakai `buildSptData` (`DokumenFormPreview:1790`) yang hanya
  spread `spt.defaults` (1617) → `surat_tugas.defaults` **tidak pernah tercetak**; task 4.3
  tetap wajib hanya untuk gate T-02. **D-8 ⚠️ TINGGI** — `templateConfig:48` punya signature
  `['pimpinan','notulen']`; task 4.1 tidak menyentuh jalur notulen → setelah task 1.10
  menghapus fallback, **TTD notulen & pimpinan cetak KOSONG permanen** (mundur dari
  perilaku sekarang); **T-12 tidak menjangkau**. **D-9** `SignatureFooter` punya **2 cabang**
  (`useTwoColumn`, baris 22) → fallback ada di **8 baris** (94, 99, 106, 109, 137, 140,
  148, 151), bukan 1. Dampak: task **4.1 diperluas** (+notulen) · **4.3** diberi catatan ·
  **1.10** = 8 baris/2 cabang · **T-15 + C-15 baru** (test case **14 → 15**, checklist
  **14 → 15**) · gate 4.20 menambah T-15. **Task tetap 53 · file tetap 19 · T-02 tetap
  15 pola/73 baris · 0 dependency baru** — v5 memperjelas preskripsi + 1 guard, bukan
  memperluas cakupan. Terverifikasi juga: helper `val()` (`SPDForm:23-36`) vs `F()`
  (`SuratTugas:23-44`) **memang beda** → **D-2 benar**, Kelas B wajib label generik.
  ⏸️ **Menunggu keputusan user** atas 3 pertanyaan di `DRYRUN-T1.md` §8.
- **FASE 4 SPRINT 001 SELESAI & LULUS GATE BUILDER 2026-09-18** (task 4.1–4.20;
  **di-commit `8398fe1`** 2026-09-18, belum di-push; verifikasi UI runtime penuh
  menunggu /acceptance-runner konteks segar).
  Isi: **4.1** auto-fill `getSignatureRoles()` di `DokumenFormPreview.jsx` (SPT/SPPD:
  `namaPenandatangan`/`nipPenandatangan` dari `kepala-sekolah`, `namaMengetahui`/`nipMengetahui`
  dari `ketua-gugus`; notulen: `ttd_pimpinan_*`/`ttd_notulen_*` per D-8; undangan:
  `namaKetuaGugus`/`nipKetuaGugus`) · **4.2–4.8** `templateConfig.js` defaults dikosongkan
  (spt, surat_tugas ×2, undangan, sk_honorer, notulen.tempat, sppd.pengguna, bku npsn+namaSekolah)
  · **4.9–4.13** fallback cetak dihapus di SPDForm/SuratTugas/SuratUndangan + placeholder label
  generik · **4.14** SKHonorer 9 titik identitas kedua → prop-driven `sekolah`
  (baris kop kabupaten dikomposisi runtime; baris 98 `DINAS PENDIDIKAN` sengaja tetap)
  · **4.15–4.17** fallback cetak + placeholder di DokumenFormPreview/InfoKeuangan generik
  · **4.18–4.19** komentar JSDoc generik (dataContextBuilder, guruTendikParser,
  TabelLetterHeader — termasuk koreksi "PEMERINTAH KABUPATEN" di komentar SKHonorer:5).
  **Bukti gate (4.20):**
  (a) **T-01** `npm run build` **LULUS** — `✓ built in 4.63s`, 178 modules,
  `BUILD_EXIT_0` (exit code 0 diverifikasi; runtime Node **v24.19.0 / npm 11.17.0**
  *system fallback* — hash artefak terverifikasi identik di kedua runtime, koreksi v4);
  warning chunk >500 kB sudah ada sebelumnya, bukan regresi.
  (b) **T-02: 0 hit / 0 aset terjaring** — 15 pola via
  `Get-ChildItem -Recurse | Select-String` (Set-String -Recurse tidak ada di PS 5.1),
  hasil: `T-02: 0 HIT - BERSIH`, `TOTAL: 0`, aset `sourceFile` 0.
  (c) **T-12/T-15 (statik)** — jalur auto-fill terverifikasi di
  `DokumenFormPreview.jsx:1622-1705`: `sig['kepala-sekolah']`, `sig['ketua-gugus']`,
  `sig['pimpinan']`, `sig['notulen']` semua terhubung dengan prioritas
  formData → Data Sekolah → `''`; verifikasi runtime `getSignatureRoles()` via
  node langsung terhalang import extensionless (Vite-only) → uji UI runtime
  didelegasikan ke /acceptance-runner.
  (d) **T-14 (statik)** — SKHonorer baris 94/96/100/117/142/144/150/227 prop-driven
  dari `getSchoolData()`; T-02 menjamin 0 literal `Pasirhalang`/`Mandalamukti`.
- **FASE 6 SPRINT 001 SELESAI — SPRINT TUTUP (STATIK) 2026-09-18** (task 6.1–6.3;
  tanpa file kode — dokumentasi termasuk dalam commit `2e23441`).
  **6.1 Regresi 6 konsumen × 2 kondisi (T-11) — 12/12 kombinasi statik LULUS:**
  KopSurat (identitas+logo baca saat render, kosong → baris kosong, tanpa crash) ·
  SignatureFooter (2 cabang, `data.ttd_*_nama || roleConfig.nama` → '' jujur-kosong) ·
  SKHonorer (prop-driven `data.namaPihakKesatu || ks.nama`, null-safe) ·
  InfoKeuangan (`data.X || schoolData.X || ''`) · DokumentasiAIGenerate (fallback
  generik `'SD NEGERI ...'`, bukan nama riil — ⚠️ **observasi Sprint 002**: key
  `nama_sekolah` snake_case di baris 432 tak pernah cocok `getSchoolData()`
  camelCase → fallback generik selalu terpakai; tidak crash, di luar scope) ·
  signatureRoles (5 peran → `{label, nama:'', nip:''}` saat kosong).
  **6.2 GATE AKHIR LULUS:** (a) `npm run build` — `GATE62_BUILD_EXIT_0`,
  **179 modules**, `✓ built in 7.38s`; (b) **T-02 final verbatim** (pola diekstrak
  programatik dari ACCEPTANCE.MD, tidak diketik ulang) — `GREP EXIT: 1` = **0 HIT**;
  (c) smoke statik `DataSekolahPage.jsx` — load `mergePejabat(stored.pejabat)`
  null-safe, tulis deep-merge per peran, import `PEJABAT_ROLES`/`DEFAULT_PEJABAT`
  bersama; `PejabatSekolahPage.jsx` 226 baris ≤ batas.
  **6.3** `STATE.MD` + `ACCEPTANCE.MD` (checklist C-01…C-15 hijau + status T-11) +
  `DRYRUN-T1.md` (status V1/V3–V7) diperbarui — sprint ditutup **statik**;
  UI runtime (T-03…T-15, V2–V12, E-1/E-2) menunggu /acceptance-runner ulang utuh.
- **FASE 5 SPRINT 001 SELESAI & LULUS GATE BUILDER 2026-09-18** (task 5.1–5.4;
  di-commit `73174c0` — `feat:` terpisah; dokumentasi di `2e23441`).
  Isi: **5.1** `blocks/PeringatanData.jsx` BARU (67 baris ≤ batas 300; banner merah
  `border-red-300 bg-red-50` + `role="alert"`; **2 varian**: identitas sekolah kosong →
  teks "upload data sekolah terlebih dahulu" + tautan "Buka tab Data Sekolah"
  (`/dashboard/data-sekolah`) untuk T-05; identitas terisi → menyebut **HANYA** peran
  kosong dari `getPejabatStatus()` + tautan "Buka tab Pejabat Sekolah"
  (`/dashboard/pejabat-sekolah`) untuk T-06/E-2; `print:hidden`; baca storage SAAT
  RENDER → tidak basi, mendukung T-07) · **5.2** `TemplateEngine.jsx:82`
  `{mode === 'edit' && <PeringatanData />}` → mencakup **semua** form template ·
  **5.3** `DokumenFormPreview.jsx:1757` `{isTransport && <PeringatanData />}` di area
  tab Perjalanan Dinas — spt/sppd/undangan merender `mode="print"` di layar sehingga
  tidak tertutup pemasangan 5.2 (+ re-export `blocks/index.js`) · **5.4** gate di bawah.
  **Bukti gate (5.4):**
  (a) **T-01** `npm run build` **LULUS** — `BUILD_EXIT_0`, **179 modules** (+1 =
  modul `PeringatanData`);
  (b) **statik banner** — `print:hidden` ada; teks T-05 persis; 2 tautan aksi ada;
  0 warna terlarang (T-10: merah = indikator status layar, pengecualian sah per
  AGENTS.MD/CONSTITUTION — tidak pernah ikut cetak); 0 hit pola hardcode identitas;
  (c) banner terpasang di 2 titik (TemplateEngine edit-mode; DokumenFormPreview
  transport), di luar `.print-container` → tidak ikut tercetak;
  (d) **UI runtime** (screenshot T-05/T-06, V12 banner tidak ikut cetak) →
  /acceptance-runner konteks segar (sesi 2026-09-18 terputus di tengah eksekusi).
- **FASE 2 + FASE 3 SPRINT 001 SELESAI & LULUS GATE 2026-09-18** (task 2.1–2.8 + 3.1–3.6;
  user setujui lanjut 2026-09-18; **di-commit `8398fe1`** 2026-09-18).
  File: **2 halaman + 3 blok/preview diubah** —
  `pages/dashboard/DataSekolahPage.jsx` (import `PEJABAT_ROLES`/`mergePejabat` bersama,
  hapus definisi lokal 4 peran; load/upload/update `mergePejabat()`; kartu pejabat
  `idx===` + emerald/violet/amber → blue-only `bg-primary/10` + `text-primary`;
  badge "Terisi" → primary; header kartu logo amber/violet/blue → slate/primary netral;
  seksi **Data Gugus** baru: input `gugusNama` + `gugusAlamat` via `handleSaveGugus`
  ke `spj_data_sekolah`; akses `data.pejabat?.[role.key]` null-safe) ·
  `pages/dashboard/PejabatSekolahPage.jsx` (import bersama; `PEJABAT_ROLES` lokal +
  `gradient` + `defaultPejabat` dihapus → `PEJABAT_SUBLABELS` tampilan saja;
  load/update/reset `mergePejabat()`; header kartu `role.gradient` → `from-primary
  to-blue-600`; akses `?.[]` null-safe) ·
  `blocks/KopSurat.jsx` (logo sekolah kiri atas `spj_logo_sekolah` + logo dinas
  kanan atas `spj_logo_dinas` baca saat render; baris 13 → `PEMERINTAH {kabupaten}`
  dari Data Sekolah, kosong bila data kosong; baris dinas + provinsi bila ada) ·
  `blocks/KopGugus.jsx` (**prop-driven** per ADR F-4: `gugusNama`/`gugusAlamat` tanpa
  fallback literal; baris 9 → `PEMERINTAH {kabupaten}` dari prop; logo dari prop
  `data.logoGugus`; 0 pemanggilan storage di blok) ·
  `components/templates/DokumenFormPreview.jsx` (`undanganData` diisi
  `gugusNama`/`gugusAlamat`/`kabupaten`/`provinsi` dari `getSchoolData()` +
  `logoGugus` dari `spj_logo_gugus` — pemanggil yang baca storage, bukan blok).
  **Bukti gate (task 2.8 + FASE 3):**
  (a) `npm run build` **LULUS 2×** — `✓ 178 modules transformed` (`5.62s`, lalu `8.68s`),
  runtime **v24.19.0 / npm 11.17.0** (system fallback; determinisme vs v22.22.2
  sudah terverifikasi identik di v4);
  (b) **uji peran ke-6 data LAMA**: `roles: 6`, `old4-in-6-out: true`
  (4 lama utuh + ketuaGugus/notulen kosong), `null-safe: true`;
  (c) **T-10**: grep `emerald|violet|amber|rose-|cyan|gradient|idx ===` di kedua
  halaman = **0 hasil** (sisa `blue-*` sah, `primary/slate` sah);
  (d) **T-09 storage check**: grep pemanggilan storage di `KopGugus.jsx` = **0 hasil**
  (satu-satunya hit kata `storageHelper` ada di komentar keputusan F-4, bukan kode).
  ⚠️ **Catatan desain:** `KopSurat` sengaja tetap baca storage sendiri (pola blok lain
  + baca saat render anti nilai basi G6); yang prop-driven hanya `KopGugus` (ADR F-4).
  CSS hash berubah (`index-DdzAS_Re.css`) — wajar (warna kartu berubah).
- **FASE 1 SPRINT 001 SELESAI & LULUS GATE 2026-09-17** (task 1.1–1.12; **di-commit `8398fe1`** 2026-09-18).
  File: **1 baru + 5 diubah** — `utils/pejabatRoles.js` (baru, 47 baris) ·
  `utils/sekolahData.js` (84 → 116 baris, tanpa fallback, +resolver `allFields`,
  +`getPejabat`/`getPejabatStatus`/`isSchoolDataEmpty`/`findFieldByLabel`) ·
  `utils/signatureRoles.js` (40 → 47, konstanta → `getSignatureRoles()`) ·
  `blocks/KopSurat.jsx` · `blocks/SignatureFooter.jsx` (**8 fallback dihapus, 2 cabang**) ·
  `package.json` (14 dependency eksak).
  **Bukti gate (task 1.12):**
  (a) `npm run build` **LULUS** — `✓ 178 modules transformed` (naik dari 177 = modul baru),
  `✓ built in 7.38s`, runtime **v22.22.2**;
  (b) **T-02: 73 → 64 baris** — FASE 1 menutup **9** (sekolahData 6 + signatureRoles 2 +
  SignatureFooter 1), akuntansi cocok persis; `KopSurat:14` sengaja tetap (task 3.3/FASE 3);
  (c) **T-13**: 0 caret · **14/14 versi cocok `package-lock.json`** · lockfile tidak berubah;
  (d) **Uji data layer 22 PASS / 0 FAIL** — data kosong → semua kosong (tidak jatuh ke
  `BADRUDDIN`), `mergePejabat()` aman untuk data lama, `ketua-gugus` baca
  `pejabat.ketuaGugus` (**bug G7 tertutup**), `notulen` baca `pejabat.notulen`
  (**bukan `DEWI ERMIRAWATI`**), email/telepon/website terbaca dari `allFields`.
  ⚠️ **Catatan lingkungan:** `npm ci` diblokir sandbox (efek samping menghapus
  `@esbuild/win32-x64` — dipulihkan via `npm install @esbuild/win32-x64 --no-save`);
  build verifikasi memakai `--outDir dist-verify` karena `rm -rf dist` diblokir.
  Sisa artefak (`dist-verify/`, `dist/`, `verify-*.mjs`, cache vite) sudah masuk
  `.gitignore`, perlu dibersihkan manual oleh user.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v5)** — **FASE 1 Sprint 001 dikerjakan**:
  1 file baru + 5 file diubah (lihat blok FASE 1 di atas) + 6 file dokumentasi
  (`.gitignore`, `DECISIONS.MD`, `STATE.MD`, salinan audit 001, `BLUEPRINT.MD`,
  `ACCEPTANCE.MD`, `DRYRUN-T1.md`).
- **VERIFIKASI ULANG FASE 1 (2026-09-17, pasca-penutupan)** — seluruh angka gate diukur
  ulang dari worktree nyata sebelum laporan: `npm run build` **LULUS** (`✓ built in 7.61s`,
  artefak `index-DnR8JQGI.css` + `index-BOHDDs2P.js` — **hash CSS identik** dengan build
  v4 → build deterministik); **T-02 = 64 baris** memakai perintah kanonik 15 pola
  (`ACCEPTANCE.MD:77`), akuntansi cocok (73 − 9); cek aset `grep … | grep -i sourceFile`
  = **0**; **T-13 = 0 caret · 14/14 cocok lockfile**; `SignatureFooter.jsx` terbukti
  **8 fallback terhapus di 2 cabang** (`|| roleConfig.nama`/`.nip` di 8 titik, 0 sisa
  `defaultName`/`defaultNip`). ⚠️ **Catatan proses:** verifikasi pertama memakai grep
  ad-hoc 13 pola (salah) → hasil 25 baris; **perintah kanonik wajib disalin dari
  `ACCEPTANCE.MD`**, bukan diketik ulang.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v4)** — **verifikasi independen**
  terhadap 11 klaim pack v3 (semua COCOK) + koreksi klaim runtime (F-2 dibalik:
  runtime gate = **v22.22.2 managed**, bukan v24.19.0 system fallback; hash artefak
  build **identik** di kedua runtime). 5 file dokumentasi diubah, kode tidak disentuh.
- Ledger perubahan **BELUM DI-COMMIT (2026-09-17 v3)** — **revisi pack Sprint 001
  hasil DRY RUN Fase 1 + Fase 4 terhadap kode nyata**: 4 temuan baru (D-1 residual
  `templateConfig:51,295` + `DokumenFormPreview:1669` · D-2 literal dipecah Kelas A
  fallback-cetak vs Kelas B placeholder · D-3 NPSN dari Data Sekolah, `20212345` vs
  `20228636` · D-6 identitas sekolah KEDUA `Pasirhalang` di `SKHonorer.jsx`).
  Keempat dijawab user 2026-09-17: D-1 & D-2 "setuju", D-3 "npsn diambil dari data
  sekolah", D-6 "bersihkan semua sekarang (Rekomendasi)". Dampak: FASE 4 15 → **20
  task** · total 48 → **53 task** · file diubah 17 → **19** · test case 13 → **14**
  · pola gate T-02 11 → **15** (dengan flag `-i` wajib) · baseline T-02 terukur
  **73 baris di 15 file** · baris 98 `SKHonorer.jsx` (`DINAS PENDIDIKAN`) **sengaja
  tidak dibersihkan** (nama instansi tetap, identik `KopSurat.jsx:16` &
  `templateSuratHelper.js:486`). 4 ADR baru + section audit trail supersesi F-1c/F-1
  masuk `DECISIONS.MD`. 4 dokumen pack (REQUIREMENTS, BLUEPRINT, ACCEPTANCE,
  HANDOFF-PROMPT) + `DECISIONS.MD` + `STATE.MD` direvisi. Salinan audit
  `architect-pack-001…md` **diregenerasi v3** (**1459 baris** — v2 1143 baris
  diganti) dengan Lampiran check #5 **diperketat jadi per-baris**: 73 baris
  baseline T-02 terukur, setiap baris punya satu task bernama di BLUEPRINT.
  Riwayat check #5 (v1 → v2 → v3) tercatat di Lampiran §5e.
  `DRYRUN-T1.md` makin basi (predates v2 & v3 — hanya inti Fase 1; dry run
  Fase 4 belum pernah dilakukan sebelum sesi ini). Kode `spj-frontend/`
  **tidak disentuh**.
- Ledger perubahan sebelumnya **BELUM DI-COMMIT (2026-09-17 v2)** —
  revisi pack Sprint 001 hasil review: 5 temuan (F-1…F-5), 6 fase / 48 task,
  17 file diubah, 13 test case, baseline gate T-02 terukur 57 baris di 11 file.
  6 ADR masuk `DECISIONS.MD`. `REQUIREMENTS.MD:69` dikoreksi
  ("5 NIP 15× di 6 file" → 18× di 8 file).
- Ledger commit: `68de37f` (2026-09-14) — **pemecahan Sprint 001 → 001 + 002**:
  pack Sprint 001 ditulis ulang ke scope fondasi (4 dokumen), `planning/sprints/sprint-002/`
  baru (4 dokumen), salinan audit 001 di-rename + diregenerasi (677 baris) &
  002 baru (656 baris), `PRD.md` (kolom Sprint + DoD per sprint), `DECISIONS.MD`
  (+3 ADR, 2 superseded), `QUESTIONS.MD`, `.gitignore` (BKU tahunan.pdf).
  **Belum di-push** ke `origin/main`.
- Ledger sebelumnya: `cdc5abe` (2026-09-14) — **realign pack ke Bab 8.4**: pack = 4 dokumen,
  salinan audit Bab 8.5, `DRYRUN-T1.md` keluar pack, `PACK.md` + `BLUEPRINT.MD` lama
  dihapus, `STATE.MD` + `RISKS.MD` (insiden worktree #2). **Belum di-push.**
- Ledger: **Sprint 002 (2026-09-19)** — `c955019` (`fix:` nama_sekolah pra-sprint) ·
  `36b408f` (F1) · `6a5408f` (F2) · `e7c0150` (F3) · `6746d66` (F4) · `5b11f10` (F5) ·
  `c5872d8` (`docs:` task 5.4 STATE/DECISIONS/QUESTIONS/ACCEPTANCE) · `b2b0728`
  (`docs:` re-verifikasi §6 + koreksi C-09/R-1). 6 file kode disentuh (DokumenFormPreview,
  templateConfig, SuratTugas, SPDForm, SuratUndangan, DokumenSPJPage) + DokumentasiAIGenerate
  (fix). **RE-VERIFIKASI statik independen 2026-09-19: 11/11 gate + build LULUS, 0 cacat
  kode, 1 cacat dokumen (R-1, sudah dibereskan)** → `DRYRUN-REPORT.MD` §6. **UI runtime
  (T-03, T-05…T-09, T-11, E-1/E-2) BELUM diverifikasi** — acceptance-runner via subagent
  konteks-segar DITOLAK user sesi ini; wajib dijalankan di chat baru. **Belum di-push**
  (14 commit lokal ahead origin/main).
- Ledger: `73174c0` + `2e23441` (2026-09-18) — **Sprint 001 FASE 5+6**: `73174c0`
  (`feat:`) = 1 file baru (`blocks/PeringatanData.jsx`, 67 baris) + 3 file diubah
  (`blocks/index.js` re-export, `TemplateEngine.jsx` pasang edit-mode 5.2,
  `DokumenFormPreview.jsx` pasang tab Perjalanan Dinas 5.3); `2e23441` (`docs:`) =
  `STATE.MD`/`ACCEPTANCE.MD`/`DRYRUN-T1.md` diperbarui.
  FASE 6 = tanpa file kode: regresi statik 12/12 + gate akhir (build 179 modules
  exit 0, T-02 final 0 hit verbatim, smoke statik DataSekolahPage) + tutup loop.
  **Belum di-push.**
- Ledger: `8398fe1` (2026-09-18) — **Sprint 001 FASE 1–4**: 1 file baru
  (`pejabatRoles.js`) + 19 file kode diubah (FASE 1–4) + 14 file pack/dokumen
  (pack sprint-001 6 berkas, pack sprint-002 4 berkas, salinan audit 2 berkas,
  AGENTS/STATE/DECISIONS/QUESTIONS/RISKS/CONSTITUTION/README/ARCHITECTURE,
  `docs/PROGRESS.md` dihapus, `.gitignore`, `package.json` pin eksak).
  Gate FASE 4: T-01 build 178 modules exit 0 · T-02 15 pola → 0 hit / 0 aset.
  **Belum di-push.**
- Ledger sebelumnya: `9759c20` (2026-09-14) — pack Sprint 001 awal: PRD (18 user story,
  13 temuan G1–G13), `DECISIONS.MD` +14 ADR, `QUESTIONS.MD` tutup 1/buka 1. **Belum di-push.**
- Ledger sebelumnya: `21b7713` (2026-09-13) — koreksi sprint aktif → Sprint 001, hapus
  `docs/PROGRESS.md`, `.gitignore` agent dirs (`.zcode/`, `.workbuddy-ai/`),
  `README.md` GitHub-only. Juga **belum di-push**.
- Ledger: **/acceptance-runner RONDE-1 Sprint 003 (2026-10-01, sesi segar)** —
  12 PASS / 0 FAIL / 8 UNTESTED → REWORK (gap = browser mati, bukan bug).
  Detail: `planning/sprints/sprint-003/VERIFICATION-REPORT.MD` (untracked).
  HEAD sesi ini `983735b`; ledger ronde-2 `414b53d` (kode R8/R9) + `983735b`
  (pack+status). **Belum di-push** (branch ahead ±24+).
- Ledger: **Sprint 003 FASE 1–4 (2026-10-01)** — `17a266d` (F1 penerima+rename) ·
  `a3bd7e6` (F2 SummaryCard+jalur layar) · `41369ce` (F3 print-area 5-doc) ·
  `45129a9` (F4 MenuGuide) · `27c036b` (`docs:` BUILD-REPORT + STATE + ACCEPTANCE C-11/C-12) ·
  `e8af618` (`docs:` pack 003 masuk repo). 3 file baru + 3 file diubah, 0 dependency.
  Gate: build exit 0 ×6 · 15 pola 0 · 3 blok 0 input · blue-only 0 · diff warisan kosong.
  Runtime pencil browser: pill+popover+rename terbukti (R-1/R-2), cetak/T-09/E-2 UNTESTED.
  Detail: `planning/sprints/sprint-003/BUILD-REPORT.MD`. **Belum di-push** (branch kini ahead ±24).
- Ledger: **REVISI BKU T1-T7 (2026-10-02)** — `a53fd61` (T1-T4: 4 file, 370 ins 277 del) · `cc2456e` (T6 panel ATK: BKUPage 1 ins 50 del).
  Merge fast-forward tanpa konflik (T5, T7). Gate: build exit 0 tiap task (183 modul, 5.58s–15.85s) ·
  LPJ-mati 0 hit · non-blue tambah 0 · package 0 · cetak tak tersentuh · prefix spj utuh.
  Verifier FINAL APPROVED Medium (batas live klik+screenshot). **Belum push** (ahead 3), **belum acceptance fresh**.
  Detail: `planning/sprints/sprint-004/BUILD-REPORT.MD` §ADDENDUM REVISI 2026-10-02.
- Terakhir Diperbarui: 2026-10-02 (T8 docs — revisi BKU T1-T7 masuk STATE + BUILD-REPORT; commit docs terpisah, tanpa merge/push)
- Terakhir Diperbarui sebelumnya: 2026-10-01 (/state-keeper — Sprint 003 Fase 1–4 tutup builder;
  ledger komit `17a266d`…`e8af618`; risiko cetak-fisik UNTESTED; ARCHITECTURE.MD stale
  bertambah: SummaryCard/MenuGuide/guideConfig/print-area)
- Terakhir Diperbarui sebelumnya: 2026-09-30 (pack Sprint 003 jadi + cross-artifact check lulus;
  Sprint 001+002 APPROVED via /acceptance-runner — VERIFICATION-REPORT.MD ×2; risiko
  UI runtime UNTESTED diterima eksplisit user)
- Terakhir Diperbarui sebelumnya: 2026-09-19 (/state-keeper — Sprint 002 tutup statik + re-verifikasi 11/11 LULUS + R-1 dibereskan; ledger commit `c955019`…`b2b0728`; RISKS `nama_sekolah` RESOLVED; blocker UI runtime dicatat)

## Riwayat Sprint
| Sprint | Nama | Status | Tanggal |
|--------|------|--------|---------|
| 000 | ONBOARDING — titik adopsi workflow (ditutup `2ad42e9`, commit terakhir `2bd80cb`) | ✅ Selesai | 2026-09-13 |
| 001 | Fondasi Data Sekolah & Pejabat — US-13…US-18 (**APPROVED 2026-09-30** acceptance-runner konteks segar; commit `8398fe1` + `73174c0` + `2e23441`; UI runtime UNTESTED — risiko diterima user) | ✅ Selesai | 2026-09-17 |
| 002 | Rework Modul Perjalanan Dinas — US-01…US-12 (**APPROVED 2026-09-30** acceptance-runner konteks segar; commit `36b408f`→`5b11f10` + `c955019`; UI runtime UNTESTED — risiko diterima user) | ✅ Selesai | 2026-09-19 |
| 003 | Rework Lapisan Preview & Panduan Langkah — US-19…US-30 (FASE 1–4 + revisi R1…R9 `17a266d`→`414b53d`; acceptance ronde-1 12 PASS/0 FAIL/8 UNTESTED → **✅ DITUTUP 2026-10-01, risiko diterima user**, ronde-2 dibatalkan) | ✅ Selesai | 2026-10-01 |
| 005 | Autogenerate Undangan + Resume — builder statik selesai (1 baru + 3 ubah, gate hijau, runtime UNTESTED → acceptance-runner) | 🟡 Builder selesai | 2026-10-03 |

## Langkah Selanjutnya
- **Sprint 003 SELESAI (risiko diterima). Berikutnya:**
  1. **Push ke origin** — branch ahead ±24+ commit (pelajaran insiden #3).
  (aturan AGENTS.MD) — wajib membuktikan runtime T-04/T-05 (cetak 5-doc fisik),
  T-06/T-07 (PNS/PPPK muncul, honor-only), T-09 (config-driven revert-test),
  E-2, dismiss permanen, print-hidden. Statik sudah lulus (BUILD-REPORT.MD).
  1. **Push ke origin** — branch ahead ±24 commit (pelajaran insiden #3).
- **Sprint 002 FASE 1–5 SELESAI (STATIK) 2026-09-19 — seluruh fase di-commit
  `36b408f`→`5b11f10` (+ fix pra-sprint `c955019`); docs task 5.4 (STATE/DECISIONS/
  QUESTIONS/ACCEPTANCE) di-commit terpisah. Menunggu: push + acceptance-runner.**
  ⏸️ **Berhenti di sini.** Yang menunggu user:
  1. **Push ke origin** — 12 commit lokal masih **belum di-push** (Sprint 001 + 002 +
     fix; pelajaran insiden #3: push = jaring pengaman sesungguhnya).
  2. **/acceptance-runner ulang utuh di konteks segar** (aturan AGENTS.MD) — wajib
     membuktikan UI runtime Sprint 002 (T-03…T-11: form SPT/SPD/Undangan, print-area
     kop→TTD, 3 blok SPD, reset localStorage) **dan** Sprint 001 (T-03…T-15, V2–V12,
     E-1/E-2) sebelum kedua sprint dinyatakan lulus penuh.
  3. Setelah itu → sprint berikutnya (lihat PRD umbrella; sisa US di luar 001/002) atau
     REWORK keamanan bertahap (docs/SECURITY-AUDIT-001.md §8).
- **Sprint 001 FASE 1–6 SELESAI (STATIK) — seluruh fase di-commit: FASE 1–4 `8398fe1`,
  FASE 5 `73174c0` (`feat:`), FASE 5–6 docs `2e23441`; menunggu: push +
  acceptance-runner ulang utuh.**
  ⏸️ **Berhenti di sini.** Yang menunggu user:
  1. **Push ke origin** — commit `8398fe1` + `2dde982` + `73174c0` + `2e23441` +
     riwayat (9759c20, 21b7713) masih **belum di-push** (pelajaran insiden #3:
     push = jaring pengaman sesungguhnya).
  2. **/acceptance-runner ulang utuh di konteks segar** (aturan AGENTS.MD) — sesi
     2026-09-18 terputus di tengah (baru T-01/T-13); wajib membuktikan UI runtime
     T-03…T-15 + V2–V12 + E-1/E-2 sebelum sprint dinyatakan lulus penuh.
  3. Setelah itu → **Sprint 002** (Rework Modul Perjalanan Dinas) — prasyarat
     `blocks/PeringatanData.jsx` & kontrak data Sprint 001 sudah tersedia.
     **(SUPERSEDED — Sprint 002 kini sudah dikerjakan & tutup statik 2026-09-19;
     lihat blok di atas.)**
  Blok "Sprint 001 FASE 1–3 SELESAI — menunggu keputusan user: commit + izin FASE 4"
  di bawah **superseded** oleh blok ini (FASE 4 sudah dikerjakan 2026-09-18 atas
  persetujuan user; riwayat dibiarkan untuk audit trail).
- **Bersihkan artefak verifikasi manual** (sandbox menolak hapus; sudah di `.gitignore`):
  `spj-frontend/dist/`, `spj-frontend/dist-verify*/`, `spj-frontend/verify-*.mjs`,
  `spj-frontend/vite.config.js.timestamp-*.mjs`.
- Setelah Sprint 001 selesai → **Sprint 002** (`planning/sprints/sprint-002/HANDOFF-PROMPT.MD`);
  verifikasi prasyarat dulu (langkah pertama prompt Builder).
- ✅ /idea-clarifier (ritel 27.3 Tahap 2 langkah 4) SELESAI 2026-09-14 — brief final
  16 user story; `/prd-generator` juga selesai → PRD ditulis ke
  `planning/sprints/sprint-001/PRD.md`
- Verifikasi test cetak 13 template (lihat RISKS.MD)
- REWORK keamanan bertahap → lihat docs/SECURITY-AUDIT-001.md §8 (sprint berikutnya)
- Warisan NEXT STEPS `docs/PROGRESS.md` yang masih terbuka (dipindah 2026-09-13
  saat file itu dihapus): implementasi sub-kategori "Coming Soon",
  deploy ke Vercel
- Sisa dokumen legacy: `docs/PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md` usang
  (menyarankan Laravel, padahal stack aktual = React + Vite tanpa backend).
  Riset Jul–Agu lain = arsip riset, bukan spec — jangan dijadikan acuan implementasi.
  (`README.md` sudah beres 2026-09-13 — GitHub-only, lihat DECISIONS.MD.)

## Blockers
- **TIDAK ADA blocker sprint.** Pencatatan risiko (non-blocking, diterima user
  2026-09-30): kriteria UI runtime Sprint 001+002 tetap UNTESTED — uji manual
  operator sekolah adalah jaring pengamat; temuan masuk Sprint 003.
- **Push ke origin tertunda** — ±14 commit lokal (Sprint 001 + 002 + fix) belum
  di-push (pelajaran insiden #3: push = jaring pengaman sesungguhnya).

## Catatan Penting
- **Sprint 002 ditutup STATIK 2026-09-19** (dicatat Builder, task 5.4): FASE 1–5
  selesai, semua lulus gate Builder (build exit 0 · grep `surat_tugas` rescoped = 0 ·
  grep `<input|<textarea` 3 blok = 0 · 4 string legal SPD persis docx · 15 pola
  anti-hardcode Sprint 001 tetap 0 hit · 6 konsumen tidak tersentuh · blue-only).
  Commit: `c955019` (fix pra-sprint `nama_sekolah`) · `36b408f` (F1) · `6a5408f` (F2) ·
  `e7c0150` (F3) · `6746d66` (F4) · `5b11f10` (F5) + commit docs ini. **3 koreksi dry
  run disetujui user** (D-1 rescope T-02, D-2 placeholder generik, D-3 perluas T-04) —
  ADR bagian M di `DECISIONS.MD`, detail di `DRYRUN-REPORT.MD`. **UI runtime (T-03…T-11)
  belum terbukti — wajib /acceptance-runner ulang utuh di konteks segar.** Batas tegas
  dipertahankan: **001 = sumber nilai · 002 = struktur & layout** (5 file tumpang tindih).
  ⚠️ **docs/ARCHITECTURE.MD STALE** (refresh saat planning sprint berikutnya): belum
  mencatat (a) `blocks/PeringatanData.jsx` baru [Sprint 001], (b) tab "Surat Tugas"
  dihapus → satu dokumen = satu tab, (c) 3 blok cetak kini murni (0 `<input>`/`<textarea>`),
  (d) tombol Reset Data Dokumen LPJ di DokumenSPJPage, (e) [Sprint 003]
  `SummaryCard.jsx` + `guide/MenuGuide.jsx` + `data/guideConfig.js` baru,
  (f) jalur layar transport/mamin = kartu ringkasan + print-area 5-doc,
  (g) `renderMaminPreview()` terpisah di `DokumenFormPreview.jsx`,
  (h) `getSemuaPegawai()` di `honorHelper.js`.
- **Sprint 001 ditutup STATIK 2026-09-18** (dicatat /state-keeper): FASE 1–6 selesai,
  semua lulus gate Builder (build exit 0, T-02 15 pola 0 hit verbatim, regresi
  6 konsumen × 2 kondisi = 12/12). Commit: `8398fe1` (FASE 1–4) · `73174c0`
  (`feat:` FASE 5) · `2e23441` + `58ecc25` (`docs:`). **UI runtime (T-03…T-15,
  V2–V12, E-1/E-2) belum terbukti — wajib /acceptance-runner ulang utuh di konteks
  segar sebelum sprint dinyatakan lulus penuh** (sesi runner 2026-09-18 terputus
  di T-01/T-13). `docs/ARCHITECTURE.MD` STALE: `blocks/PeringatanData.jsx` baru
  belum terdokumentasi (refresh saat planning sprint berikutnya).
- File agent lama `docs/AGENT.md` (2026-07-30) dipindah 2026-09-13: router → `AGENTS.MD`
  (root), domain → `DOMAIN.MD`, keputusan → `DECISIONS.MD`. Kini HANYA ADA SATU
  file agent: `AGENTS.MD`.
- Spesifikasi teknis monolit `docs/STANDAR-TEKNIS.md` (2026-09-13) diekstrak 2026-09-13
  ke 5 dokumen standar Bab 6.1: `docs/ARCHITECTURE.MD`, `docs/DATA-MODEL.MD`,
  `docs/API.MD`, `docs/PERMISSIONS.MD`, `docs/VALIDATION.MD` — file monolit dihapus.
- **`docs/PROGRESS.md` DIHAPUS 2026-09-13** — tracker legacy di luar struktur workflow
  standar; tidak pernah di-update sejak adopsi (terakhir 2026-09-08). Status kini
  HANYA di `STATE.MD` (+ pack sprint aktif). Referensi ke file itu di `AGENTS.MD`,
  `CONSTITUTION.md`, `docs/ARCHITECTURE.MD`, `README.md` sudah dialihkan ke `STATE.MD`.
  Isi lama tetap ada di git history (`git log -- docs/PROGRESS.md`).
- Status legacy per docs/AGENT.md (2026-07-30): ~95% fitur selesai — klaim tidak
  diverifikasi ulang. Tidak ada lagi tracker status terpisah.
- Titik adopsi: commit `9cdcd10` (2026-08-21, "fix ai response") — commit terakhir
  SEBELUM adopsi. Hasil adopsi ter-commit di `8544246` (scaffold + konstitusi) dan
  `6ed57d6` (pekerjaan fitur legacy yang tertunda), keduanya sudah di-push ke main.
- Kode existing TIDAK dipindah/diubah saat adopsi (aturan emas adopsi 27.8)
- Workflow berlaku MAJU: semua kerja baru ikuti pipeline penuh; TIDAK ADA sprint fitur
  sebelum baseline keamanan selesai (27.8.2)
- INSIDEN 2026-09-13: seluruh folder `docs/` (68 file tracked) hilang dari worktree
  saat `git rm docs/PROGRESS.md` dijalankan — penyebab belum diketahui (tidak ada
  hook non-sample, `core.sparseCheckout` tidak aktif, `git reflog` bersih). Dipulihkan
  penuh via `git checkout -- docs/`; verifikasi `git diff HEAD` hanya berisi perubahan
  yang diniatkan. Terjadwal di RISKS.MD.
- **INSIDEN #2, 2026-09-14: TERULANG, trigger sekarang TERKONFIRMASI = `git rm`.**
  Menjalankan `git rm -q architect-packs/sprint-001/PACK.md architect-packs/sprint-001/BLUEPRINT.MD`
  membuat SELURUH direktori `architect-packs/` hilang dari worktree — termasuk
  `architect-packs/architect-pack-001-perjalanan-dinas.md` yang **untracked**
  (file itu HILANG TOTAL, tanpa jaring pengaman git) dan `architect-packs/.gitkeep`
  yang terlihat ` D` di `git status`. Pola identik dengan insiden #1.
  **Dua insiden, satu trigger sama → `git rm` DIANGGAP PENYEBAB.** Aturan baru:
  hapus file lewat `git rm` hanya bila direktori sudah bersih & tidak ada file
  untracked di dalamnya; jika tidak, pindahkan/hapus manual lalu `git add -A`.
  Pemulihan: `mkdir -p <dir>` → `git checkout -- <dir>/.gitkeep` → regenerasi
  file untracked yang hilang. Terjadwal di RISKS.MD.
- ⚠️ **INSIDEN #3 (2026-09-17) — `.git/` RUSAK TOTAL, PALING BERAT.** `git stash push -u`
  yang **ter-SIGTERM di tengah jalan** menghapus `.git/refs/`, `.git/packed-refs`, dan
  **seluruh isi `.git/objects/`** (0 objek tersisa; `.pack` hilang, hanya `.idx` orphan sisa)
  → git tidak mengenali repo (`fatal: not a git repository`).
  **Kehilangan permanen: 5 commit lokal** (`bb561c6`, `cdc5abe`, `68de37f`, `849a75b`,
  `5c2b400`) — semuanya belum pernah di-push, objeknya tidak ada di mana pun.
  **Isi file SELAMAT 100%** (disk + backup 100 file) — hanya riwayat git yang hilang.
  **Pemulihan BERHASIL**: `mkdir .git/refs/heads` → `git fetch` → tulis ref manual →
  `rm .git/index && git reset` → `git fetch --refetch` → tulis `origin/main` →
  bersihkan reflog basi. Hasil: `git fsck --connectivity-only` **BERSIH**,
  `[origin/main]` tracking normal. HEAD kini di **`2bd80cb`** (2026-09-13), sehingga
  seluruh kerja 2026-09-14…17 tampil sebagai perubahan **belum di-commit**.
  Detail prosedur + aturan baru di `RISKS.MD` (insiden #3).
  🔴 **ATURAN BARU: DILARANG `git stash` · `git gc` · `git repack` · `git prune` ·
  `git rm` · `git clean -fd` · `git reset --hard`.** Untuk membatalkan perubahan:
  backup `cp -r` dulu + `git checkout -- <file>` per file. **Commit + PUSH sesering
  mungkin** — commit lokal saja bukan jaring pengaman.
- 2026-09-13: `.zcode/` + `.workbuddy-ai/` masuk `.gitignore` (direktori kerja agent,
  bukan bagian repo). `README.md` ditetapkan **GitHub-only** — agent tidak membacanya
  (lihat DECISIONS.MD + marker di kepala README + AGENTS.MD).
- **Struktur pack sprint (2026-09-14):** pack = **4 dokumen Bab 8.4** di
  `planning/sprints/sprint-XXX/` (`REQUIREMENTS.MD` · `BLUEPRINT.MD` · `ACCEPTANCE.MD` ·
  `HANDOFF-PROMPT.MD`). `architect-packs/architect-pack-XXX-<slug>.md` = **salinan audit
  trail** Bab 8.5 (gabungan 4 dokumen + **Lampiran cross-artifact consistency check**).
  Struktur lama (`PACK.md` + `BLUEPRINT.MD` di `architect-packs/sprint-001/`) **dihapus**;
  lihat ADR "Struktur pack sprint = 4 dokumen Bab 8.4".
- **`PRD.md` = umbrella dua sprint.** PRD (18 user story) tetap di
  `planning/sprints/sprint-001/` dan **tidak dipecah** — ia sumber requirement untuk
  Sprint 001 **dan** Sprint 002. Pembagiannya: US-13…US-18 → Sprint 001 ·
  US-01…US-12 → Sprint 002 (kolom "Sprint" di PRD §9 Traceability).
- **Pemecahan sprint (2026-09-14):** Sprint 001 dipecah jadi 001 (fondasi) + 002 (rework
  dokumen) setelah cross-artifact check #5 menemukan dua kandidat tujuan. Sprint 002
  **wajib menunggu** Sprint 001 selesai (kontrak fungsi belum ada). Lihat ADR.
- **Aturan baru akibat insiden worktree #2:** **HINDARI `git rm`.** Hapus file dengan
  `rm <path>` lalu `git add -A`. `git rm` dua kali membuat seluruh direktori induk hilang
  dari worktree (2026-09-13 `docs/`, 2026-09-14 `architect-packs/`), dan file **untracked**
  di dalamnya hilang permanen. Detail + prosedur pemulihan di `RISKS.MD`.
