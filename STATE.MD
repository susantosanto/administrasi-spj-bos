# STATE.MD — Status Proyek

## Informasi Proyek
- Nama: spj-app (Aplikasi LPJ BOS/BOSP)
- Mulai (titik adopsi workflow): 2026-09-13

## Status Saat Ini
- Sprint Aktif: **Sprint 001 — Fondasi Data Sekolah & Pejabat** — 🟡 **SEDANG DIKERJAKAN**
  (**FASE 1–4 SELESAI** 2026-09-17…18; FASE 4 lulus gate Builder 2026-09-18; FASE 5–6
  belum; **belum di-commit**)
  Pack: DIBUAT + di-realign Bab 8.4 + dipecah jadi 2 sprint + **direvisi 2026-09-17
  v2/v3/v4 (verifikasi)** + **v5 (dry run Fase 1+4)**.
  ⏸️ **BERHENTI sebelum FASE 4** sesuai AGENTS.MD (dry run → lapor → tunggu persetujuan).
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
- Sprint Berikutnya: **Sprint 002 — Rework Modul Perjalanan Dinas** (pack DIBUAT,
  **menunggu Sprint 001 selesai**). Pack: `planning/sprints/sprint-002/` (4 dokumen) ·
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
- Status: Sprint 000 (ONBOARDING) sudah **DITUTUP**. Baseline keamanan `aedd65c`
  (FINDINGS: 2 TINGGI terjadwal RISKS.MD, 0 KRITIS). Checklist A 27.7.1 hijau —
  posisi aman untuk pindah agent. **4 pertanyaan OPEN** di QUESTIONS.MD (keputusan parser
  xlsx, duplikat xlsx di root `package.json`, `NomorSuratPopup` `'SDN-PSR'`, batas literal
  tempat/tanggal dokumen — dua terakhir ditambahkan 2026-09-17, **tidak memblok** sprint).
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
  **belum di-commit**; verifikasi UI runtime penuh menunggu /acceptance-runner konteks segar).
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
- **FASE 2 + FASE 3 SPRINT 001 SELESAI & LULUS GATE 2026-09-18** (task 2.1–2.8 + 3.1–3.6;
  user setujui lanjut 2026-09-18; **belum di-commit**).
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
- **FASE 1 SPRINT 001 SELESAI & LULUS GATE 2026-09-17** (task 1.1–1.12; **belum di-commit**).
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
- Ledger sebelumnya: `9759c20` (2026-09-14) — pack Sprint 001 awal: PRD (18 user story,
  13 temuan G1–G13), `DECISIONS.MD` +14 ADR, `QUESTIONS.MD` tutup 1/buka 1. **Belum di-push.**
- Ledger sebelumnya: `21b7713` (2026-09-13) — koreksi sprint aktif → Sprint 001, hapus
  `docs/PROGRESS.md`, `.gitignore` agent dirs (`.zcode/`, `.workbuddy-ai/`),
  `README.md` GitHub-only. Juga **belum di-push**.
- Terakhir Diperbarui: 2026-09-18 (FASE 4 selesai & lulus gate Builder; STATE.MD diperbarui Builder)

## Riwayat Sprint
| Sprint | Nama | Status | Tanggal |
|--------|------|--------|---------|
| 000 | ONBOARDING — titik adopsi workflow (ditutup `2ad42e9`, commit terakhir `2bd80cb`) | ✅ Selesai | 2026-09-13 |
| 001 | Fondasi Data Sekolah & Pejabat — US-13…US-18 (**FASE 1–4/6 selesai, FASE 4 lulus gate Builder 2026-09-18**, belum di-commit; FASE 5–6 belum) | 🟡 Berjalan | 2026-09-17 |
| 002 | Rework Modul Perjalanan Dinas — US-01…US-12 (pack dibuat 2026-09-14, handoff disesuaikan 2026-09-17 — **menunggu Sprint 001**) | ⬜ Belum dimulai | — |

## Langkah Selanjutnya
- **Sprint 001 FASE 1–4 SELESAI — menunggu keputusan user: commit + izin FASE 5.**
  ⏸️ **Berhenti di sini.** Dua hal menunggu user:
  1. **Commit FASE 1–4** — 1 file baru (`pejabatRoles.js`) + file kode diubah
     (lihat blok FASE 1–4 di atas) + dokumentasi masih **belum di-commit**
     (aturan AGENTS.MD: dry run dulu → lapor → tunggu persetujuan;
     commit = kewenangan user).
  2. **Izin lanjut FASE 5** (4 task; urutan wajib sesuai BLUEPRINT.MD §Task Breakdown).
  Verifikasi UI runtime penuh (T-03…T-15 skenario klik) → /acceptance-runner
  WAJIB di konteks segar (aturan AGENTS.MD) — jalankan setelah keputusan user.
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
- (tidak ada)

## Catatan Penting
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
