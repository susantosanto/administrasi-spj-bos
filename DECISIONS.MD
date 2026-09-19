# DECISIONS.MD — Log Keputusan

## Format
[YYYY-MM-DD] Keputusan: <apa>
  Status: proposed | accepted | superseded
  Alasan: <mengapa>
  Dibuat oleh: <siapa>
  Dampak: <apa yang berubah>

## Daftar Keputusan

[2026-09-13] Keputusan: Stack React 18 + Vite + Tailwind CSS (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi (keputusan dibuat sebelum adopsi workflow)
  Dibuat oleh: legacy
  Dampak: semua pengembangan berlanjut di `spj-frontend/` (Vite + Tailwind)

[2026-09-13] Keputusan: Data persist di localStorage browser (prefix `spj_`), tanpa backend (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: tidak ada sinkronisasi antar perangkat; rencana backend masih tahap
    riset (lihat `docs/RISET_SUPABASE_VS_ALTERNATIF.md`)

[2026-09-13] Keputusan: Arsitektur template engine — `templateConfig.js` (13 template)
  → `TemplateEngine.jsx` → block components (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: template baru ditambahkan via `templateConfig.js` + komponen di `blocks/`

[2026-09-13] Keputusan: Design system Material Design 3 Corporate Modern, blue-only
  `#004ac6`, font Hanken Grotesk (headline) + Inter (body), ikon Material Symbols (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: aturan warna wajib tercatat di AGENTS.MD; spesifikasi detail di
    `docs/ARCHITECTURE.MD`

[2026-09-13] Keputusan: Konsep detail dokumen 2 wajah (editor premium di layar, dokumen
  formal saat cetak) — referensi implementasi pertama: Tab SK Honorer (2026-08)
  Status: accepted
  Alasan: memisahkan workspace penyiapan dokumen dari hasil cetak formal
  Dibuat oleh: legacy (terdokumentasi di docs/AGENT.md sebelumnya)
  Dampak: semua template dokumen baru wajib ikuti checklist di `docs/ARCHITECTURE.MD`

[2026-09-13] Keputusan: Adopsi workflow Architect-Builder — folder source-of-truth dibuat
  (AGENTS.MD, STATE.MD, DECISIONS.MD, DOMAIN.MD, RISKS.MD, QUESTIONS.MD, planning/,
  architect-packs/, docs/runbooks/) tanpa memindah/mengubah kode existing
  Status: accepted
  Alasan: workflow berlaku MAJU sejak titik adopsi 9cdcd10 (aturan emas adopsi 27.8);
    folder = source of truth, bukan chat history (Pilar #3)
  Dibuat oleh: user
  Dampak: semua kerja baru ikuti pipeline penuh; tidak ada sprint fitur sebelum
    baseline keamanan selesai (27.8.2)

[2026-09-13] Keputusan: Konsolidasi file agent — docs/AGENT.md (2026-07-30) dihapus,
  kontennya didistribusikan; AGENTS.MD (root) jadi SATU-SATUNYA file agent
  Status: accepted
  Alasan: hindari double router yang bertentangan (docs/AGENT.md mengaku "baca dulu"
    vs AGENTS.MD); AGENTS.MD = konvensi lintas-tool yang auto-dibaca (Bab 7.1)
  Dibuat oleh: user
  Dampak: router tunggal; konten lama pindah ke DOMAIN.MD, DECISIONS.MD, STATE.MD,
    docs/STANDAR-TEKNIS.md (riwayat: docs/AGENT.md masih ada di git history)

[2026-09-13] Keputusan: docs/ mengikuti struktur standar 5 dokumen Bab 6.1 —
  docs/STANDAR-TEKNIS.md (monolit) diekstrak ke ARCHITECTURE / DATA-MODEL / API /
  PERMISSIONS / VALIDATION lalu dihapus
  Status: accepted
  Alasan: ikuti struktur standar metode (Bab 6.1); slot kosong (API, PERMISSIONS)
    dibiarkan placeholder jujur sampai keputusan backend diambil
  Dibuat oleh: user
  Dampak: AGENTS.MD + DECISIONS.MD kini menunjuk docs/ARCHITECTURE.MD; dokumen riset
    lama di docs/ tidak disentuh

[2026-09-13] Keputusan: CONSTITUTION.md dibuat (ritel 4 Jalur A 27.8.2) — aturan proyek
  + standar keamanan untuk kerja MAJU; AGENTS.MD masuk daftar baca wajib
  Status: accepted
  Alasan: semua skill mewarisi standar yang sama; compliance report berbasis scan
    nyata; pelanggaran legacy TIDAK dibenahi retroaktif (aturan emas adopsi 27.8) —
    dibenahi bertahap saat file terkait disentuh sprint
  Dibuat oleh: user
  Dampak: temuan keamanan (API key AI client-exposed) tercatat sebagai risiko
    Tinggi di RISKS.MD dengan mitigasi; gate build menggantikan test suite sampai
    framework test diadopsi

[2026-09-13] Keputusan: Baseline keamanan pertama dijalankan & tercatat
  (docs/SECURITY-AUDIT-001.md, commit aedd65c) — verdict FINDINGS: 2 TINGGI
  (xlsx, API key client) terjadwal via RISKS.MD, 0 KRITIS, tidak memblok
  Status: accepted
  Alasan: ritel 6 Jalur A 27.8.2 — baseline = garis awal pengukuran; aturan
    baseline: "temuan belum wajib diperbaiki semua — jadwalkan bertahap"
  Dibuat oleh: security-dependency-auditor (tool: npm audit nyata + secret scan
    manual — gitleaks belum terpasang)
  Dampak: 9 temuan terjadwal; 2 item TINGGI WAJIB selesai sebelum deploy publik
    pertama (dicek ulang /deploy-production-gate); REWORK list §8 untuk sprint
    berikutnya

[2026-09-13] Keputusan: Sprint-000 ONBOARDING ditutup — status Selesai
  (commit 2ad42e9); onboarding Jalur A 27.8.2 tuntas, posisi ritel 27.3 =
  Tahap 2 langkah 4 (/idea-clarifier)
  Status: accepted
  Alasan: ritel 1–6 selesai & ter-commit (scaffold, backfill, konstitusi,
    AGENTS.MD, baseline audit); Checklist A 27.7.1 hijau
  Dibuat oleh: state-keeper
  Dampak: sprint fitur pertama kini BOLEH dimulai (aturan 27.8.2 "tidak ada
    sprint fitur sebelum langkah 1–6 selesai" terpenuhi)

[2026-09-13] Keputusan: Koreksi posisi sprint — Sprint Aktif = Sprint 001
  (BELUM DIKERJAKAN)
  Status: accepted
  Alasan: STATE.MD masih menulis "Sprint Aktif: Sprint 000" padahal Sprint 000
    sudah ditutup (ADR di atas); folder `planning/sprints/sprint-001/` sudah ada
    sejak scaffold `8544246` tapi masih kosong — belum ada pack, belum ada kode
    disentuh
  Dibuat oleh: user
  Dampak: STATE.MD field Sprint Aktif = "Sprint 001 — BELUM DIKERJAKAN"; pekerjaan
    pertama sprint 001 = buat architect pack + `BLUEPRINT.MD` (pin versi eksak,
    RISKS.MD F8); hash commit Sprint 000 di tabel riwayat dikoreksi — `9cdcd10`
    adalah titik adopsi SEBELUM sprint (bukan commit penutupan), penutupan di
    `2ad42e9` dan commit terakhir main `2bd80cb`

[2026-09-13] Keputusan: `docs/PROGRESS.md` (tracker legacy) DIHAPUS dari repo
  Status: accepted
  Alasan: tidak termasuk struktur workflow standar hasil adopsi 27.8 (Bab 6.1) —
    status sudah punya tempat resmi = STATE.MD + pack sprint aktif, sehingga
    PROGRESS.md jadi sumber status kedua yang duplikatif dan menyesatkan
    (terakhir diupdate 2026-09-08, sebelum adopsi, dan tidak menyebut sprint)
  Dibuat oleh: user
  Dampak: referensi ke `docs/PROGRESS.md` di `AGENTS.MD`, `CONSTITUTION.md`,
    `docs/ARCHITECTURE.MD`, `README.md` dialihkan ke `STATE.MD`; item NEXT STEPS
    yang masih terbuka (sub-kategori "Coming Soon", deploy Vercel) dipindah ke
    STATE.MD; file tetap ada di git history (`git log -- docs/PROGRESS.md`)

[2026-09-13] Keputusan: `README.md` = tampilan GitHub saja — BUKAN source of truth,
  agent TIDAK perlu membacanya
  Status: accepted
  Alasan: README mendahului adopsi workflow dan isinya bisa tertinggal dari kondisi
    repo (menyebut file yang sudah dihapus, path salah); user menegaskan fungsinya
    hanya untuk pembaca GitHub, bukan konteks agent
  Dibuat oleh: user
  Dampak: marker eksplisit ditambahkan di kepala `README.md` + satu baris di
    `AGENTS.MD` (Konteks Proyek); README TIDAK dihapus dan TIDAK perlu dijaga
    sinkron dengan STATE.MD — tidak ada aturan baru untuk merawatnya

[2026-09-13] Keputusan: `.zcode/` + `.workbuddy-ai/` masuk `.gitignore`
  Status: accepted
  Alasan: keduanya direktori kerja agent (bukan bagian repo) dan muncul sebagai
    untracked di `git status` — mengotori pemeriksaan perubahan bersih
  Dibuat oleh: user
  Dampak: `git status` bersih dari noise agent; `.workbuddy-ai/` (memory kerja
    agent) tetap ada di disk tapi tidak ikut ter-commit

[2026-09-14] Keputusan: Sprint 001 diisi **Rework Modul Perjalanan Dinas**
  Status: **superseded** (2026-09-14 — Sprint 001 dipecah; lihat ADR "Sprint 001 dipecah
    menjadi 2 sprint" di bawah. Scope ini kini menjadi **Sprint 002**)
  Alasan: sprint fitur pertama boleh dimulai (gate 27.8.2 terpenuhi); modul Perjalanan
    Dinas punya bug terbukti (2 tab beroutput identik, print-area kurang 3 elemen,
    pejabat hardcoded) dan merupakan jalur kritis pekerjaan operator sekolah
  Dibuat oleh: user
  Dampak: `planning/sprints/sprint-001/PRD.md` (16 user story) + pack
    `architect-packs/sprint-001/` (PACK.md + BLUEPRINT.MD) menjadi acuan sprint

[2026-09-14] Keputusan: Tab "Surat Tugas" **DIHAPUS** — satu dokumen = satu tab
  Status: accepted
  Alasan: dokumen referensi sumber (`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`)
    hanya memuat 3 dokumen (Undangan, SPT, SPD) — TIDAK ADA bagian "Surat Tugas";
    tab `surat_tugas` memakai data builder & config yang sama dengan `spt`
    (beda hanya `judul`) sehingga outputnya identik — terbukti di
    `DokumenFormPreview.jsx:1786-1791` + `templateConfig.js:306-358`
  Dibuat oleh: user
  Dampak: tab, blok preview, dan config `surat_tugas` dihapus; blok
    `blocks/SuratTugas.jsx` tetap dipakai tab `spt`

[2026-09-14] Keputusan: Print-area = dokumen formal **lengkap kop → TTD**;
  tab = **tampilan data saja** (tanpa kop & TTD)
  Status: accepted
  Alasan: menegaskan konsep "2 wajah" (ADR 2026-09-13) yang dilanggar di modul ini —
    `blocks/SuratTugas.jsx` & `blocks/SPDForm.jsx` merender `<input>` saat
    `mode === 'edit'`; user menegaskan hasil cetak harus sama persis dokumen sumber
  Dibuat oleh: user
  Dampak: preview tab tidak merender kop/TTD; blok cetak menjadi cetak murni;
    3 elemen SPD yang hilang ("Telah diperiksa…", "Catatan Lain-Lain",
    "PERHATIAN :") WAJIB ditambahkan

[2026-09-14] Keputusan: Sumber pejabat = **Data Sekolah → tab Pejabat Sekolah**;
  tambah field baru **"Ketua Gugus"** (role ke-5)
  Status: accepted
  Alasan: `templateConfig.js` masih hardcode `BADRUDDIN, S.Ag.` / `WAHYUDIN, S.Pd.SD.`;
    `signatureRoles.js` salah memetakan `ketua-gugus` → Kepala Sekolah padahal menurut
    dokumen sumber Ketua Gugus = WAHYUDIN (orang BERBEDA dari Kepala Sekolah);
    Data Sekolah belum punya role tersebut
  Dibuat oleh: user
  Dampak: role `ketuaGugus` ditambahkan di Data Sekolah/Pejabat Sekolah; WAJIB
    deep-merge `pejabat` saat load agar data lama tidak crash; `PEJABAT_ROLES`
    dijadikan satu sumber (tidak diduplikasi); auto-fill tersedia tapi TIDAK dipaksa
    muncul di ketiga dokumen

[2026-09-14] Keputusan: Data Sekolah kosong → **field kosong + notifikasi merah**,
  berlaku untuk **SEMUA dokumen**
  Status: accepted
  Alasan: fallback diam-diam ke nama hardcoded berisiko mencetak dokumen dengan nama
    salah; user memilih jujur-kosong + peringatan, dengan cakupan seluruh dokumen
    (bukan hanya Perjalanan Dinas)
  Dibuat oleh: user
  Dampak: `utils/sekolahData.js` berhenti fallback ke default; perubahan menyentuh
    konsumen existing (`KopSurat`, `InfoKeuangan`, `SKHonorer`, `SignatureFooter`) →
    **guard regresi WAJIB** (US-16) diuji pada 2 kondisi data (kosong & terisi)

[2026-09-14] Keputusan: Data dokumen Perjalanan Dinas lama → **reset bersih,
  tanpa fungsi migrasi**
  Status: accepted
  Alasan: skema berubah (tab dihapus, struktur SPD/Undangan diselaraskan) sehingga
    state lama akan tercampur dan membingungkan; user memilih reset
  Dibuat oleh: user
  Dampak: tidak ada kode migrasi; `spj_dokumen_lpj` lama dibuang; `spj_data_sekolah`
    TIDAK ikut dihapus

[2026-09-14] Keputusan: Field "Sifat" pada Undangan **dipertahankan** dengan
  nilai default `"-"` (strip)
  Status: accepted
  Alasan: dokumen sumber tidak memuat field ini, tetapi aplikasi sudah memakainya;
    user memilih membiarkannya dengan nilai strip agar tampilan tetap konsisten
  Dibuat oleh: user
  Dampak: field `sifat` tidak dihapus; nilai default `"-"` ikut tercetak

[2026-09-14] Keputusan: Struktur pack sprint — requirement di `planning/sprints/`,
  pack teknis + versi ter-pin di `architect-packs/`
  Status: **superseded** (2026-09-14 — lihat ADR "Struktur pack = 4 dokumen Bab 8.4" di bawah)
  Alasan: `architect-packs/` masih kosong (belum ada konvensi tertulis) dan AGENTS.MD
    menyebut "pack sprint aktif (planning/sprints/sprint-XXX/)" tanpa memisahkan
    requirement dari kontrak teknis
  Dibuat oleh: agent (usulan) — menunggu konfirmasi user
  Dampak: `planning/sprints/sprint-001/PRD.md` = requirement;
    `architect-packs/sprint-001/{PACK.md,BLUEPRINT.MD}` = kontrak teknis + versi
    dependency ter-pin eksak; `BLUEPRINT.MD` memenuhi temuan F8
    (`docs/SECURITY-AUDIT-001.md` §5)

[2026-09-14] Keputusan: **Identitas sekolah juga tanpa fallback** — bukan hanya pejabat
  Status: accepted
  Alasan: user memilih konsisten "tidak ada nilai diam-diam"; saat ini kop surat
    SELALU menampilkan 'SD NEGERI LEBAKLEUNGSIR' + alamat/email dari `SEKOLAH_DEFAULTS`
    (`utils/sekolahData.js:9-20,37`) meski Data Sekolah dikosongkan — menyembunyikan
    keadaan sebenarnya
  Dibuat oleh: user (jawaban dry run T1, 2026-09-14)
  Dampak: `getSchoolData()` berhenti memakai `SEKOLAH_DEFAULTS`; kop surat jadi KOSONG
    bila identitas sekolah belum diisi (perilaku yang diminta, BUKAN regresi);
    uji Data Sekolah kosong wajib mencakup kop, bukan hanya TTD

[2026-09-14] Keputusan: **"Notulen" dijadikan role ke-6** di Data Sekolah → Pejabat Sekolah
  Status: accepted
  Alasan: `utils/signatureRoles.js:29-30` masih hardcode `'DEWI ERMIRAWATI, S.Pd.Gr.'`
    + NIP-nya; user memilih menuntaskan agar target "0 nilai pejabat hardcoded" tercapai
  Dibuat oleh: user (jawaban dry run T1, 2026-09-14)
  Dampak: `PEJABAT_ROLES` = **6 role** (`ks`, `bendahara`, `pengawas`, `sekdik`,
    `ketuaGugus`, `notulen`); `signatureRoles.js` membaca `pejabat.notulen`;
    shape `spj_data_sekolah.pejabat` bertambah satu key → deep-merge wajib

[2026-09-14] Keputusan: Perubahan fallback di `blocks/SignatureFooter.jsx` (blok SHARED)
  **berlaku untuk semua pemakai template**, bukan ditahan untuk 3 dokumen
  Status: accepted
  Alasan: konsisten dengan keputusan "aturan kosong + notif merah berlaku semua dokumen";
    membatasi ke 3 dokumen butuh prop flag baru di blok shared (kompleksitas +
    menyimpang dari keputusan)
  Dibuat oleh: user (jawaban dry run T1, 2026-09-14)
  Dampak: regresi diuji pada **6 konsumen** (`KopSurat`, `SignatureFooter`, `SKHonorer`,
    `InfoKeuangan`, `DokumentasiAIGenerate`, `signatureRoles`) × 2 kondisi data;
    fallback `|| roleConfig.defaultName` dihapus sehingga nilai kosong ter-render kosong

[2026-09-14] Keputusan: **Kop sekolah bersumber dari Data Sekolah → tab Data Sekolah**,
  termasuk **menampilkan logo** di kop cetak
  Status: accepted
  Alasan: user meminta kop diambil dari halaman Data Sekolah; `blocks/KopSurat.jsx`
    saat ini memakai konstanta basi `SEKOLAH_DEFAULT` dan **tidak merender logo sama sekali**,
    padahal aplikasi sudah mendokumentasikan niatnya sendiri di
    `DataSekolahPage.jsx:806-807` ("Logo Sekolah — ditampilkan di pojok kiri atas dokumen
    surat; Logo Dinas — pojok kanan atas")
  Dibuat oleh: user
  Dampak: `KopSurat.jsx` baca `getSchoolData()` (bukan konstanta) + render
    `spj_logo_sekolah` (kiri atas) & `spj_logo_dinas` (kanan atas); data sekolah kosong →
    kop kosong + peringatan *"upload data sekolah terlebih dahulu"* → **US-17 / task T14**

[2026-09-14] Keputusan: **Kop gugus data-driven** — tambah field **Nama Gugus** &
  **Alamat Gugus** di Data Sekolah; Ketua Gugus dari Pejabat Sekolah
  Status: accepted
  Alasan: `blocks/KopGugus.jsx:12,15` masih literal (`'GUGUS KI HAJAR DEWANTARA'` +
    alamat sekretariat) dan tidak punya sumber data sama sekali; dokumen sumber justru
    menulis *"Gugus K.H. Dewantara"* sehingga ejaannya pun sudah menyimpang. User meminta
    surat resmi dari gugus ikut data-driven
  Dibuat oleh: user
  Dampak: 2 field baru `gugusNama` + `gugusAlamat` di `spj_data_sekolah` (asumsi penempatan:
    tab **Data Sekolah**, seksi "Data Gugus" — menunggu koreksi user); `KopGugus.jsx` baca
    dari storage + `spj_logo_gugus`; TTD undangan pakai `pejabat.ketuaGugus` (bukan Kepala
    Sekolah) → **US-18 / task T15**

[2026-09-14] Keputusan: Nilai identitas sekolah non-key (**email**, telepon, website) dibaca
  dari **`allFields` berdasarkan label**, bukan dari key `data.email`
  Status: accepted
  Alasan: user menegaskan email SUDAH ada di Data Sekolah. Verifikasi membuktikan benar —
    Excel profil sekolah memuat baris `Email` di seksi "Kontak Sekolah"
    (`template-data/profil-SD NEGERI PASIRHALANG-…xlsx` baris 36 →
    `sdnpasirhalang123@gmail.com`), nilainya tersimpan di `spj_data_sekolah.allFields`
    dan tampil di UI. Masalahnya: `LABEL_MAP` (`utils/sekolahParser.js:16-24`) **tidak
    memuat `email`**, sehingga `handleFileUpload` tidak pernah mengisi key `data.email`
    dan key itu selalu `''`
  Dibuat oleh: user (koreksi) + verifikasi agent atas Excel sumber
  Dampak: `utils/sekolahData.js` menambah resolver `allFields` by label
    (`/email/i`, `/nomor telepon|telepon/i`, `/website/i`) dengan prioritas
    `stored.<key>` → `allFields`; `telepon`/`kelurahan`/`kodePos` tidak lagi dijatuhkan
    dari return (tutup G9). **`LABEL_MAP` + `handleFileUpload` TIDAK diubah** sprint ini
    (perubahan parser = di luar cakupan) — keuntungannya: data yang SUDAH ter-upload
    langsung terbaca tanpa perlu upload ulang

[2026-09-14] Keputusan: **Struktur pack sprint = 4 dokumen Bab 8.4**, disimpan di
  `planning/sprints/sprint-XXX/`; `architect-packs/` menjadi **salinan audit trail** (Bab 8.5)
  Status: accepted — **menggantikan** ADR "Struktur pack sprint" 2026-09-14 di atas
  Alasan: metode Bab 8.4 menetapkan pack = **tepat 4 dokumen** dengan nama & pembagian
    tugas baku (REQUIREMENTS = apa & mengapa · BLUEPRINT = bagaimana + versi ter-pin ·
    ACCEPTANCE = Given/When/Then + perintah + output · HANDOFF-PROMPT = prompt Builder).
    Struktur lama (`PACK.md` + `BLUEPRINT.MD` di `architect-packs/`) menyimpang dari
    pembagian itu dan menaruh kontrak teknis di luar folder sprint
  Dibuat oleh: user ("Realign penuh (Bab 8.4)") + user ("Tetap di folder sprint")
  Dampak: `planning/sprints/sprint-XXX/` = source of truth pack (4 dokumen);
    `architect-packs/architect-pack-XXX-<slug>.md` = gabungan 4 dokumen + **Lampiran
    cross-artifact consistency check** (Bab 8.4 langkah 4, wajib);
    `PACK.md` + `BLUEPRINT.MD` lama **dihapus**; `DRYRUN-T1.md` dipindah **keluar** pack
    (dry run = tugas Builder Tahap 5 Bab 8.6, bukan bagian pack);
    pemeriksaan cross-artifact jadi **langkah wajib** sebelum handoff

[2026-09-14] Keputusan: **Sprint 001 dipecah menjadi 2 sprint** —
  001 = Fondasi Data Sekolah & Pejabat · 002 = Rework Modul Perjalanan Dinas
  Status: accepted
  Alasan: pemeriksaan cross-artifact #5 ("satu sprint satu tujuan") menemukan pack
    gabungan memuat **dua kandidat tujuan**: (A) rework dokumen Perjalanan Dinas, dan
    (B) sumber pejabat & kop dari Data Sekolah. Fase 1 (fondasi) adalah **blocker**
    Fase 4 (form), sehingga memisahkannya membuat sprint pertama tidak bisa jalan —
    tetapi Fase 1/2/7/8 menyentuh blok **SHARED** (`KopSurat`, `SignatureFooter`,
    `TemplateEngine`) yang dampaknya melampaui modul Perjalanan Dinas. User memilih
    memisahkan agar tiap sprint punya satu tujuan bersih
  Dibuat oleh: user (jawaban pertanyaan cross-artifact #5, 2026-09-14)
  Dampak: **Sprint 001** (`planning/sprints/sprint-001/`) = US-13…US-18 (+US-11 sebagian),
    5 fase / 31 task: fondasi data pejabat · halaman Data Sekolah · kop sekolah & gugus ·
    peringatan data kosong · gate akhir.
    **Sprint 002** (`planning/sprints/sprint-002/`) = US-01…US-10, US-12 (+US-11 sebagian,
    + regresi US-16), 5 fase / 27 task: konsolidasi tab · form · dua wajah · print-area ·
    reset data & gate akhir.
    **Sprint 002 WAJIB menunggu Sprint 001 selesai** — kontrak `getSignatureRoles()`,
    `getPejabat()`, `getPejabatStatus()`, `PEJABAT_ROLES`, `mergePejabat()`, dan
    `blocks/PeringatanData.jsx` belum ada sebelum itu (dijadikan langkah verifikasi
    prasyarat di `HANDOFF-PROMPT.MD` Sprint 002);
    `PRD.md` **tidak dipecah** dan tetap di `planning/sprints/sprint-001/` sebagai
    **sumber requirement tunggal (umbrella)** untuk kedua sprint — menghindari duplikasi
    dokumen; kolom "Sprint" ditambahkan di §9 Traceability PRD

[2026-09-14] Keputusan: **Peringatan data kosong dipasang di `TemplateEngine.jsx`**
  (mode `edit`), bukan di tiap blok cetak
  Status: accepted
  Alasan: `TemplateEngine.jsx` adalah **renderer universal** untuk seluruh 13 template
    (`BLOCK_RENDERERS`, dipakai `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx`), sehingga
    satu titik pemasangan sudah memenuhi keputusan "berlaku untuk SEMUA dokumen" —
    sementara memasang di blok cetak berarti menyentuh ~14 file (melanggar aturan
    AGENTS.MD "jangan refactor di luar cakupan" dan memperbesar blast radius)
  Dibuat oleh: agent (diputuskan saat menyusun `BLUEPRINT.MD` Sprint 001)
  Dampak: `TemplateEngine.jsx` masuk daftar "File yang Akan Diubah" Sprint 001;
    peringatan **hanya dirender saat `mode === 'edit'`** sehingga **tidak pernah ikut cetak**;
    karena tab Perjalanan Dinas merender `mode="print"` di layar, titik pemasangan kedua
    ditambahkan di `DokumenFormPreview.jsx` (area tab spt/sppd/undangan)

[2026-09-17] Keputusan: **Scope Sprint 001 diperluas** — pembersihan nilai hardcoded
  dituntaskan di seluruh `src/`, bukan berhenti di `utils/` + kop
  Status: accepted
  Alasan: review pack terhadap kode nyata menemukan gate T-02 versi lama **mustahil lulus**.
    Fallback `|| 'BADRUDDIN, S.Ag.'` / `|| 'WAHYUDIN, S.Pd.SD.'` masih hidup di
    `SPDForm.jsx:156,178,191`, `SuratTugas.jsx:65,103,110`, `SuratUndangan.jsx:216` —
    ketiganya **tidak** masuk daftar ubah Sprint 001 dan baru disentuh Sprint 002.
    Ditemukan juga `sk_honorer` (`templateConfig.js:914`) yang bocor dari **kedua** sprint,
    dan `SD NEGERI LEBAKLEUNGSIR` literal di **9 titik** lain padahal task 1.4 justru
    menghapus nilai itu dari `SEKOLAH_DEFAULTS`
  Dibuat oleh: user (jawaban pertanyaan review F-1, 2026-09-17)
  Dampak: 5 file tambahan masuk daftar ubah Sprint 001 (`SPDForm`, `SuratTugas`,
    `SuratUndangan`, `SKHonorer`, `templateConfig.js`) + `InfoKeuangan.jsx` (placeholder)
    + `utils/dataContextBuilder.js` (komentar JSDoc baris 23, terjaring T-02 ketat)
    = **9 → 17 file**; **FASE 4 baru** disisipkan; task **31 → 48**; fase **5 → 6**.
    **5 file kini tumpang tindih dengan Sprint 002** — batas tegas: Sprint 001 mengganti
    **sumber nilai**, Sprint 002 mengubah **struktur & layout**. Pack Sprint 002
    (`HANDOFF-PROMPT.MD`) disesuaikan: prasyarat kini mewajibkan grep anti-hardcode = 0,
    dan klaim "perubahan `DokumenFormPreview.jsx` aditif" **dikoreksi** jadi substantif

[2026-09-17] Keputusan: **Auto-fill pejabat untuk SPT/SPD/Undangan ditarik ke Sprint 001**
  Status: accepted
  Alasan: investigasi menemukan **dua lapisan** nilai default — `templateConfig.defaults`
    adalah lapisan **otoritatif** (di-spread `DokumenFormPreview.jsx:1550,1591,1617,1632,1674`
    + `formData.X || cfg.defaults.X` baris 1561–1564), literal `||` di blok hanya lapisan sisa.
    Mengosongkan `defaults` tanpa pengganti membuat TTD ketiga dokumen **kosong**.
    Rantai data-driven ternyata **tidak seragam**: SK Honorer aman (`SKHonorer.jsx:230`
    sudah `data.namaPihakKesatu || ks.nama`), tetapi SPT/SPD/Undangan **tidak punya** jalur
    ke `pejabat` sama sekali — jadi pembersihan hardcode akan **mengirim regresi nyata**
    yang baru pulih di Sprint 002
  Dibuat oleh: user (jawaban pertanyaan review F-1a, 2026-09-17)
  Dampak: task **4.1** memasang `getSignatureRoles()` sebagai sumber TTD spt/sppd/undangan;
    **wajib dikerjakan sebelum** task 4.2–4.13 dan **dalam satu commit** (urutan terbalik =
    dokumen tercetak tanpa tanda tangan); **T-12 baru** jadi guard regresi (TTD harus terisi,
    bukan kosong); `DokumenFormPreview.jsx` tersentuh lebih dalam dari rencana awal

[2026-09-17] Keputusan: **Gate T-02 diperketat jadi 0 hasil mutlak** dan diperluas ke
  NIP + `Yuniarti` + nama sekolah — pengecualian "komentar tidak dihitung" **dicabut**
  Status: accepted
  Alasan: T-02 versi lama hanya mencari **4 nama**, sehingga lolos: **5 NIP** hardcoded
    (15 kemunculan di 6 file) — `197405082014121002` (BADRUDDIN), `197912222014121003`
    (WAHYUDIN), `198507172020121003` (DEDE GUNAWAN, `sekolahData.js:29`),
    `197607242022212011` (DEWI ERMIRAWATI, `signatureRoles.js:30`), `196607071986102005`
    (SK Honorer); **orang kelima** `Yuniarti, S.Pd` di `SKHonorer.jsx:142`; dan identitas
    sekolah `SD NEGERI LEBAKLEUNGSIR`. Klausul pengecualian komentar juga membuat gate
    bergantung penilaian manual, bukan output perintah
  Dibuat oleh: user (jawaban pertanyaan review F-1c, 2026-09-17)
  Dampak: T-02 jadi **satu grep 11 pola** atas `spj-frontend/src` dengan harapan **0 baris**;
    komentar referensi wajib dibersihkan (`SignatureFooter.jsx:9`, `SuratTugas.jsx:15`,
    `SuratUndangan.jsx:12`) dan placeholder form wajib diganti
    (`DokumenFormPreview.jsx:493,511,512,718,719`, `InfoKeuangan.jsx:11`);
    checklist **C-10…C-12 baru**; test case **11 → 13**.
    `NomorSuratPopup.jsx:18` (`'SDN-PSR'`) **sengaja di luar** — kode penomoran, bukan identitas

[2026-09-17] Keputusan: **`package.json` di-pin eksak di Sprint 001** (hapus `^` untuk
  14 dependency) — nilai versi **tidak diubah**
  Status: accepted
  Alasan: aturan Bab 17.2 menuntut versi eksak tanpa `^`. Verifikasi 2026-09-17 membuktikan
    tabel `BLUEPRINT.MD` **cocok 14/14** dengan `package-lock.json` (`lockfileVersion: 3`),
    tetapi `package.json` masih mendeklarasikan caret (`react: ^18.2.0` vs lock `18.3.1`,
    `vite: ^5.1.4` vs `5.4.21`, dst) sehingga `npm install` dapat menaikkan versi di luar
    yang ter-pin. Catatan STATE.MD "0 mismatch / 14 paket vs lockfile" benar untuk tabel
    BLUEPRINT↔lockfile, tetapi mudah terbaca seolah `package.json` sudah pinned
  Dibuat oleh: user (jawaban pertanyaan review F-3, 2026-09-17)
  Dampak: task **1.11** + **T-13** (grep `": *"\^"` = 0 hasil · `npm ci` exit 0 ·
    `package-lock.json` **tidak berubah** · 14 versi identik dengan BLUEPRINT);
    `package.json` masuk daftar ubah (file ke-16); boleh commit terpisah

[2026-09-17] Keputusan: **`KopGugus.jsx` tetap prop-driven** — blok TIDAK membaca
  localStorage sendiri; baris kabupaten ikut data-driven
  Status: accepted
  Alasan: task 3.4 versi lama menulis "baca dari storage", padahal satu-satunya pemanggil
    adalah `TemplateEngine` via `BLOCK_RENDERERS['kop-gugus']` (baris 42) yang mengoper `data`.
    Membaca storage di dalam blok menyimpang dari pola blok lain dan berisiko **nilai basi** —
    justru bug yang jadi alasan sprint ini (`sekolahData.js:79-83`, `signatureRoles.js:8-9`).
    Ditemukan juga baris 9 `PEMERINTAH KABUPATEN BANDUNG BARAT` masih literal dan tidak
    disebut task mana pun
  Dibuat oleh: user (jawaban pertanyaan review F-4 + bonus, 2026-09-17)
  Dampak: task 3.4 ditegaskan "nilai wajib dari prop `data`"; **task 3.6 baru** untuk baris 9;
    **T-09 diperluas** jadi 3 baris (9, 12, 15) + bukti tambahan
    `grep -n "storageHelper\|localStorage" .../KopGugus.jsx` = **0 hasil**

[2026-09-17] Keputusan: **Koreksi dokumentasi pack** — runtime Node sebenarnya
  **v24.19.0 / npm 11.17.0**; `export default SEKOLAH_DEFAULT` ikut dihapus
  Status: accepted
  Alasan: `BLUEPRINT.MD` menulis Node v22.22.2 / npm 10.9.7, tidak sesuai mesin pengembangan —
    semua gate build (T-01) berjalan di runtime yang berbeda dari yang didokumentasikan.
    `sekolahData.js:83` juga masih punya `export default SEKOLAH_DEFAULT` yang tidak disebut
    task 1.6; grep membuktikan **0 file** melakukan import default itu
  Dibuat oleh: agent (temuan review F-2 + F-5, dikoreksi langsung — tidak mengubah requirement)
  Dampak: tabel Tech Stack dikoreksi + catatan koreksi; task 1.6 diperluas menyebut
    `export default` (aman dihapus, terverifikasi tak terpakai)

[2026-09-17] Keputusan: **Residual `templateConfig.js` (baris 51, 295) dan
  `DokumenFormPreview.jsx` (baris 1669) masuk cakupan Fase 4** (temuan dry run D-1)
  Status: accepted
  Alasan: dry run Fase 4 membuktikan gate T-02 versi v2 **tidak bisa dicapai** —
    `templateConfig.js` terukur 16 hit tetapi task v2 hanya menutup 12; baris
    `notulen.defaults.tempat` (51) dan `sppd.defaults.pengguna` (295) lolos karena
    tidak ada task yang menyebutnya. `DokumenFormPreview.jsx` 13 hit ditutup
    hanya 10; baris 1669 (`resumeData.tempat` di blok notulen, spread dari
    `TEMPLATE_CONFIGS.notulen.defaults`) jadi lapisan ketiga fallback selain
    spread di baris 1550–1674 dan `formData.X || skConfig.defaults.X` di 1561–1564.
    Membuangnya memindahkan masalah ke Sprint 002, bukan menyelesaikannya
  Dibuat oleh: user (jawaban dry run D-1, 2026-09-17)
  Dampak: task **4.6** (`notulen:51`), **4.7** (`sppd:295`), **4.15 diperluas**
    (tambah baris 1669). Gate T-02 kini diverifikasi **per baris** (bukan per file)
    — tabel baseline 73 baris / 15 file di `ACCEPTANCE.MD` T-02 setiap barisnya
    harus tertaut satu task, bukan cukup file-nya terdaftar di daftar ubah

[2026-09-17] Keputusan: **Literal dipecah jadi Kelas A (fallback cetak) dan
  Kelas B (placeholder) dengan penanganan berbeda** (temuan dry run D-2)
  Status: accepted
  Alasan: preskripsi v2 task 4.7 (`ph` → `getSchoolData().namaSekolah`) salah
    mekanismenya. `SPDForm.jsx` helper `val()` (baris 23–36) mencetak
    `value || <PlaceholderText label={ph} />` — jika `ph` diisi nilai dinamis
    dan field kosong, dokumen mencetak `[ Kepala SD Negeri X ]` — nama asli
    muncul sebagai teks kurung siku. `SuratTugas.jsx` helper `F()` (baris
    23–44) berbeda: print branch memakai `label`, bukan `ph` — baris 65
    **tidak pernah tercetak**, hanya terlihat di editor. Menyamakan keduanya
    dengan nilai dinamis berarti mengirim regresi baru
  Dibuat oleh: user (jawaban dry run D-2, 2026-09-17)
  Dampak: **Kelas A** = baris yang tercetak (`data.X || 'NAMA'`) → hapus
    `||`, nilainya dari resolver `getSchoolData()` / `getSignatureRoles()`;
    **Kelas B** = baris placeholder (`ph` arg / `placeholder` prop) → ganti
    dengan **label generik** (`'Nama Pengguna Anggaran'`, `'Jabatan / instansi'`,
    `'Tempat berangkat'`, `'Nama Penandatangan'`, dst). Task 4.7 lama **dipecah**
    jadi 4.10 (SPDForm Kelas B) + 4.12 (SuratTugas placeholder + komentar);
    task 4.16 DokumenFormPreview Kelas B juga diperluas ke 10 baris
    (tambah 1032, 1047 — mixed-case `SD Negeri Lebakleungsir`). T-02 wajib
    `grep -rniE` (`-i` memaksa) — tanpa `-i`, `SD NEGERI PASIRHALANG`
    (uppercase) dan `SD Negeri Lebakleungsir` (mixed-case) lolos

[2026-09-17] Keputusan: **NPSN dibaca dari Data Sekolah; dua literal
  bertentangan dihapus** (temuan dry run D-3)
  Status: accepted
  Alasan: `templateConfig.js:957` (template `bku`) menulis `npsn: '20212345'`;
    `sekolahData.js:11` menulis `20228636`. Dua NPSN untuk satu sekolah —
    salah satu pasti salah, dan tidak ada sumber kebenaran di antara keduanya.
    BKU saat ini **cetak NPSN `20212345`** (dari `bku.defaults.npsn`) bukan
    dari Data Sekolah, sehingga setelah `SEKOLAH_DEFAULTS` dihapus akan jatuh
    ke default kosong — kecuali `bku.npsn` dipindahkan ke Data Sekolah juga
  Dibuat oleh: user (jawaban dry run D-3, 2026-09-17)
  Dampak: task **4.8** — kosongkan `bku.defaults.npsn` (baris 957) +
    `bku.defaults.namaSekolah` (baris 958); BKU membaca keduanya dari
    `getSchoolData()`. Pola `20212345` dan `20228636` ikut masuk T-02
    (total 15 pola). `Yuniarti, S.Pd` + NIP `196607071986102005`
    (placeholder Kelas B di `SKHonorer.jsx:142/144`) **tetap dibersihkan**
    dalam task 4.14 — bukan di-defer ke Sprint 002

[2026-09-17] Keputusan: **Identitas sekolah kedua di `SKHonorer.jsx`
  dibersihkan penuh** (temuan dry run D-6)
  Status: accepted
  Alasan: sweep `|| 'literal'` di `blocks/` menemukan `SKHonorer.jsx`
    menyimpan identitas sekolah **berbeda** dari seluruh aplikasi lain:
    `SD NEGERI PASIRHALANG` (4 ejaan berbeda: `SD NEGERI PASIRHALANG` /
    `SEKOLAH DASAR NEGERI PASIRHALANG` / `SD Negeri Pasirhalang` /
    `SDN Pasirhalang`), `Kp. Pasirhalang RT 03/014 Ds. Mandalamukti`,
    `Yuniarti, S.Pd`, NIP `196607071986102005` — semuanya di dalam
    **fallback cetak** (cabang `mode === 'print'`), bukan placeholder.
    Dokumen SK Honorer bisa tercetak atas nama **sekolah lain** yang bukan
    sekolah pengguna. Gate v2 tidak menangkap ini karena polanya
    case-sensitive (hanya `SD NEGERI LEBAKLEUNGSIR`) dan tidak memuat
    `Pasirhalang`
  Dibuat oleh: user (jawaban dry run D-6, 2026-09-17)
  Dampak: task **4.14** **9 baris** (5, 94, 96, 100, 117, 142, 144, 150, 227)
    semuanya dari `getSchoolData()` / `getKepalaSekolah()`. **Baris 98
    `DINAS PENDIDIKAN` sengaja tidak disentuh** — nama instansi tetap,
    identik dengan `KopSurat.jsx:16` dan `templateSuratHelper.js:486`,
    tidak terjaring T-02; membersihkannya hanya di SKHonorer bikin bentuk
    kop SK Honorer berbeda dari kop lain. Pola `Pasirhalang` masuk T-02.
    `Mandalamukti` di `data/mockData.js` (6 hit, data demo fiktif) **di luar
    cakupan** — `seedMockData()` terverifikasi tidak menulis `spj_data_sekolah`.
    Test case **T-14 baru** (guard: SK Honorer print terisi + kosong + BKU NPSN)

[2026-09-17] Keputusan: **Verifikasi independen gate Sprint 001** — 11 klaim pack diukur
  ulang terhadap kode nyata; **runtime gate dikoreksi jadi v22.22.2 (managed)** —
  membalik koreksi F-2 di pack v3
  Status: accepted
  Alasan: audit dipicu permintaan user ("cek AGENTS/STATE/DECISIONS") lalu diperluas ke
    klaim angka pack yang jadi beban keputusan. Hasil: **semua klaim COCOK** — T-02
    baseline terukur **73 baris / 15 file** dengan setiap angka per file persis sama
    tabel `ACCEPTANCE.MD:94-111`; cek aset `grep … | grep -i sourceFile` = **0** (11 path
    `.xlsx` aman, tidak perlu rename); **53 task** nyata (F1=12 · F2=8 · F3=6 · F4=20 ·
    F5=4 · F6=3); 14 caret `package.json`; `export default` di `sekolahData.js:83` dan
    `signatureRoles.js:39` **terbukti 0 konsumen** (dasar task 1.6 & 1.7); F-1a
    (`SPDForm:156/178/191`, `SuratTugas:103/110`, `SuratUndangan:216`), D-3 (`20212345`
    vs `20228636`), D-6 (9 baris + baris 94), F-4 (`KopGugus` 0 baca storage) semuanya
    terbukti. **Satu cacat ditemukan:** koreksi F-2 v3 menulis Node v24.19.0 sebagai
    "runtime mesin pengembangan" dan v22.22.2 "tidak sesuai" — **terbalik**. `node -v`
    di PATH = **v22.22.2** = runtime *managed* (`~/.workbuddy-ai/binaries/node/versions/`)
    yang dipakai tooling agent; v24.19.0 hanya *system fallback* di
    `C:\Program Files\nodejs\` dan menang di shell interaktif user = asal angka lama
  Dibuat oleh: agent (audit diminta user; hasil dilaporkan sebelum menulis)
  Dampak: `BLUEPRINT.MD` + salinan audit → **REVISI v4**: tabel Tech Stack dibalik
    (v22.22.2 *managed* + v24.19.0 *fallback*), catatan koreksi F-2 ditulis ulang.
    **Determinisme terverifikasi:** build dijalankan di **kedua** runtime → **hash artefak
    identik** (`index-DnR8JQGI.css`, `index-WaamvT7W.js`, `index-Cyv8yBhl.js`,
    `pdf-BnPRJEQ6.js`, `pdfTableExtractor-Chm73N2S.js`), hanya waktu beda (10,42 s vs
    6,89 s) → perbedaan runtime **tidak memengaruhi keluaran gate**. `ACCEPTANCE.MD` T-01
    mewajibkan bukti menyebut **versi runtime**. **Isi task, jumlah file (19), gate, dan
    14 test case TIDAK berubah** — v4 murni koreksi akurasi. Menemukan juga
    `sprint-002/BLUEPRINT.MD:54` + `architect-pack-002:186` yang **sudah benar**
    (v22.22.2) sejak awal → konfirmasi pack 002 tidak terpengaruh cacat ini

[2026-09-17] Keputusan: **Dry run Fase 1 + Fase 4** menemukan 3 cacat preskripsi
  (D-7, D-8, D-9) — D-8 adalah **regresi TTD notulen** yang wajib diperbaiki sebelum coding
  Status: accepted
  Alasan: dry run diperluas dari v1 (2026-09-14, hanya inti Fase 1) ke **Fase 1 + Fase 4**
    sesuai perintah STATE.MD. Verifikasi dilakukan **terhadap kode nyata**, dan kali ini
    memeriksa **apakah task-nya benar preskripsi** — bukan hanya **apakah setiap baris
    baseline tertaut task** (celah yang membuat v3/v4 lolos). Tiga temuan:
    **D-7** tab `surat_tugas` memakai `buildSptData` (`DokumenFormPreview.jsx:1790`) yang
    hanya meng-spread `spt.defaults` (baris 1617) → `surat_tugas.defaults` **tidak pernah
    dipakai**; task 4.3 tetap wajib semata untuk gate T-02.
    **D-8** ⚠️ **TINGGI:** `templateConfig.js:48` mendefinisikan signature
    `['pimpinan','notulen']` untuk template `notulen`, dirender `SignatureFooter` lewat key
    `ttd_${role}_nama`. Task 4.1 auto-fill hanya menyebut spt/sppd/undangan → kedua key itu
    **tidak pernah terisi**; setelah task 1.10 menghapus `|| roleConfig.defaultName`, TTD
    notulen & pimpinan **cetak kosong permanen** — mundur dari perilaku sekarang (notulen
    saat ini terisi dari `signatureRoles.js:22-36`). **T-12 tidak menjangkau** kasus ini.
    **D-9** `SignatureFooter.jsx` punya **dua cabang** (`useTwoColumn = roles.length === 2`,
    baris 22) → fallback `defaultName`/`defaultNip` ada di **8 baris** (94, 99, 106, 109,
    137, 140, 148, 151), bukan satu titik; task 1.10 v4 hanya menyebut "hapus fallback"
  Dibuat oleh: agent (dry run; hasil dilaporkan sebelum mengubah file pack)
  Dampak: `BLUEPRINT.MD` + salinan audit → **REVISI v5**: task **4.1 diperluas** ke jalur
    notulen (+1 titik di `DokumenFormPreview.jsx`, 5 m → 6 m) · task **4.3** diberi catatan
    D-7 · task **1.10** dinyatakan **8 baris / 2 cabang** (3 m → 4 m) · **gate 4.20**
    menambah T-15 (5 m → 6 m). `ACCEPTANCE.MD` → **REVISI v5**: **T-15 baru** (guard D-8)
    + **C-15** baru → test case **14 → 15**, checklist **14 → 15**; langkah demo 8b
    ditambahkan. `DRYRUN-T1.md` **ditulis ulang jadi v2** (menggantikan versi 2026-09-14
    yang hanya mencakup inti Fase 1). **Task tetap 53 · file tetap 19 · gate T-02 tetap
    15 pola / 73 baris / 15 file · 0 dependency baru** — v5 memperjelas preskripsi dan
    menambah 1 guard, bukan memperluas cakupan. Estimasi bertambah ~4 menit total.
    Verifikasi tambahan dari dry run: **2 konsumen konstanta basi** terkonfirmasi
    (`KopSurat`, `SignatureFooter`) · kedua **`export default` 0 konsumen** · helper
    `val()` vs `F()` **terbukti beda** (D-2 benar) · **19 file cukup**, tidak ada file ke-20

[2026-09-19] Keputusan: **Fix `nama_sekolah` snake_case di DokumentasiAIGenerate**
  (observasi warisan T-11 Sprint 001) — commit `c955019`
  Status: accepted
  Alasan: `getSchoolData()` mengembalikan camelCase `namaSekolah`, tetapi komponen
  membaca `sekolah?.nama_sekolah` di 2 titik (baris 74 kop preview A4 + 432 HTML
  cetak) → fallback generik `'SD NEGERI ...'` SELALU terpakai meski Data Sekolah
  terisi. Sisa `nama_sekolah` di kode = shape output parser xlsx (bkuParser,
  sekolahParser, konsumennya) — benar, tidak disentuh.
  Dibuat oleh: user (perintah eksplisit) + agent (eksekusi)
  Dampak: 1 file, 2 baris; build exit 0; kop dokumentasi kini tampil dari Data Sekolah.

## M. Sprint 002 — Rework Modul Perjalanan Dinas (2026-09-19)

[2026-09-19] Keputusan: **Gate T-02 di-rescope** — `grep -rn "surat_tugas"`
  dicek = 0 hasil DI LUAR `utils/templateSuratHelper.js` (temuan dry run D-1)
  Status: accepted
  Alasan: `templateSuratHelper.js:21-22,234` memuat `surat_tugas` milik fitur
  BERBEDA ("Template Surat Cerdas" → `TemplateSuratPage.jsx`, rute aktif di
  App.jsx:65), bukan modul Perjalanan Dinas. Membatasi penghapusan ke modul saja
  sesuai ADR 2026-09-14; menyentuh template fitur lain = perubahan scope.
  Ditemukan oleh: agent (dry run Sprint 002)
  Dampak: pack 4 dokumen + 27 task; 6 file disentuh (commit 36b408f–5b11f10);
  pertanyaan masa depan fitur itu → QUESTIONS.MD.
  Dibatalkan: tidak ada — keputusan final; gate T-02 aslinya mustahil lulus apa adanya.

[2026-09-19] Keputusan: **Placeholder nama orang riil diganti label generik** di
  blok cetak (D-2: `RISNA MARSELA HARTINI` di `SPDForm.jsx:65` & `SuratTugas.jsx:76`)
  Status: accepted
  Alasan: di `SPDForm` nilai `ph` TERCETAK dalam kurung siku saat print + data kosong
  → nama riil bocor ke dokumen. Sama kelas dengan cacat yang Sprint 001 bersihkan;
  lolos T-02 karena bukan salah satu dari 15 pola.
  Ditemukan oleh: agent (dry run Sprint 002)
  Dampak: FASE 3 (commit e7c0150) — placeholder generik ("Nama pelaksana perjalanan
  dinas", dst.); grep nama riil = 0.

[2026-09-19] Keputusan: **Gate T-04 diperluas** `<input|<textarea` = 0 di 3 blok cetak
  (D-3)
  Status: accepted
  Alasan: konsep dua wajah (tab = data, print-area = dokumen formal) dibuktikan oleh
  absennya SEMUA elemen input; hanya `<input` akan membiarkan `<textarea>` bocor ke
  dokumen cetak.
  Ditemukan oleh: agent (dry run Sprint 002)
  Dampak: SuratUndangan memiliki 2 `<textarea>` (isi + tembusan) — ikut dihapus;
  cetak kini pakai span + fallback PlaceholderText.

[2026-09-19] Keputusan: **Pergeseran editor per-penerima ke form SPT** (D-4/D-5 dry run)
  Status: accepted
  Alasan: menghapus tab `surat_tugas` menghapus satu-satunya editor `sptNip`/
  `sptPangkat` yang dipakai `buildSptData` (cetak "Menugaskan Kepada"). Form SPT kini
  punya pemilih penerima + field Nama/NIP/Pangkat/Jabatan sesuai struktur docx;
  field tanpa padanan dokumen (sifatSpt, lampiranSpt, perihalSpt, isiSpt, alamatSpt,
  pukulSpt, tanggalAcaraSpt) dihapus — terverifikasi 0 konsumen.
  Ditemukan oleh: agent (dry run Sprint 002)
  Dampak: FASE 2 (commit 6a5408f); efek auto-sync SPPD juga diperbaiki dengan `...prev`
  — sebelumnya setiap perubahan daftar penerima MENGHAPUS field form SPPD lain.

[2026-09-19] Keputusan: **Reset data tanpa migrasi** di DokumenSPJPage
  Status: accepted
  Alasan: ADR 2026-09-14 — skema berubah (tab dihapus, print-area bertambah), data
  lama tidak konsisten; `dokumen_lpj` **tidak pernah ditulis** oleh kode lama
  (3 pembaca saja: DokumenSPJPage:140, dataContextBuilder:232, queryEngine:52) jadi
  reset = clear key, bukan migrasi. `spj_data_sekolah` TIDAK disentuh.
  Ditemukan oleh: agent (dry run Sprint 002, task 5.1)
  Dampak: tombol "Reset Data Dokumen LPJ" dengan confirm; status per dokumen kembali
  "Belum" setelah reset (commit 5b11f10).

## Catatan audit trail

- ADR 2026-09-17 F-1c "5 NIP hardcoded (15 kemunculan di 6 file) — satu grep 11 pola"
  **superseded** oleh D-2/D-3/D-6 di atas: jumlah terukur sebenarnya
  **18× di 8 file** (satu baris terlewat oleh ADR lama karena `SKHonorer.jsx`
  tidak masuk daftar), gate v3 jadi **15 pola** (bukan 11), baseline terukur
  **73 baris di 15 file** (bukan 57). Angka lama dibiarkan untuk audit trail.
- ADR 2026-09-17 F-1/F-1a "48 task / 17 file / 13 test case" **superseded**
  oleh D-1/D-2/D-3/D-6: FASE 4 tumbuh 15 → 20 task, total 48 → **53 task**,
  file diubah 17 → **19**, test case 13 → **14**.
- ADR 2026-09-17 F-2 ("runtime Node sebenarnya **v24.19.0 / npm 11.17.0**")
  **dikoreksi** oleh ADR verifikasi independen di atas: runtime gate yang benar =
  **v22.22.2 / npm 10.9.7** (*managed*). Angka v24.19.0 tidak salah sebagai fakta
  (runtime itu memang ada di mesin), tetapi salah sebagai **runtime gate**. Dibiarkan
  di atas untuk audit trail.
