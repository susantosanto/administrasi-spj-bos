# ARCHITECT PACK 001 — Fondasi Data Sekolah & Pejabat

> **Salinan audit trail (Bab 8.5)** — gabungan 4 dokumen pack Bab 8.4 +
> **Lampiran cross-artifact consistency check**.
> Source of truth operasional: `planning/sprints/sprint-001/` (4 dokumen).
> File ini **hanya** untuk jejak audit — bila berbeda, yang menang adalah folder sprint.
>
> **REGENERASI 2026-09-17 (v3)** — menggantikan v2 (1143 baris, v2 pagi) yang
> **stale**: dibuat sebelum dry run Fase 1 + Fase 4 menghasilkan 4 temuan baru
> (D-1 residual `templateConfig.js:51,295` + `DokumenFormPreview.jsx:1669`,
> D-2 literal dipecah Kelas A vs Kelas B, D-3 NPSN dari Data Sekolah
> `20212345` vs `20228636`, D-6 identitas sekolah KEDUA `Pasirhalang` di
> `SKHonorer.jsx`). Keputusan user 2026-09-17: D-1 & D-2 "setuju",
> D-3 "npsn diambil dari data sekolah", D-6 "bersihkan semua sekarang".
> 4 ADR baru + section audit trail supersesi F-1c/F-1 masuk `DECISIONS.MD`.
> 4 dokumen pack (`REQUIREMENTS` · `BLUEPRINT` · `ACCEPTANCE` · `HANDOFF-PROMPT`)
> direvisi; `STATE.MD` direvisi; salinan audit ini di-regenerasi penuh.
>
> **Lampiran v3 memaksa check #5 jadi per-baris** (73 baris di baseline grep
> T-02, 15 pola, flag `-i` wajib, setiap baris harus tertaut satu task
> bernama di BLUEPRINT) — per-file check v2-lah yang membiarkan D-1/D-3/D-6
> lolos. Riwayat check #5 (v1 → v2 → v3) ada di §5e.

## Ringkasan Pack

| Item | Nilai |
|---|---|
| Sprint | 001 — Fondasi Data Sekolah & Pejabat |
| Status | **DRAFT v3 — menunggu persetujuan user** |
| User story | US-13 … US-18 (+ US-11 sebagian) |
| Fase | **6** (12 · 8 · 6 · 20 · 4 · 3 task) |
| Task | **53** |
| File baru | 2 |
| File diubah | **19** |
| Test case | **14** (T-01 … T-14) + 2 edge case |
| Checklist | 14 (C-01 … C-14) |
| Gate build | 4× (task 1.12, 2.8, 4.20, 6.2) |
| Gate utama T-02 | **15 pola** `grep -rniE` (flag `-i` wajib) — baseline terukur **73 baris di 15 file** |
| Jalur kritis | `1 → 2 → 3 → 4 → 5 → 6` |
| Rantai commit | `1.3–1.10` satu commit · `4.1–4.19` satu commit |
| Ketergantungan | Sprint 002 menunggu sprint ini selesai (kontrak fungsi belum ada) |
# REQUIREMENTS — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4). Isi = **APA & MENGAPA** saja.
> Detail teknis ("bagaimana") → `BLUEPRINT.MD`. Kriteria uji → `ACCEPTANCE.MD`.
> Prompt builder → `HANDOFF-PROMPT.MD`.
>
> Sumber requirement lengkap: `PRD.md` (18 user story) — **PRD ini adalah umbrella
> untuk dua sprint**; sprint ini memakai **US-13 … US-18** (+ US-11 sebagian).
> Sisa user story (US-01 … US-12) dikerjakan di **Sprint 002**
> (`planning/sprints/sprint-002/`) — lihat ADR pemecahan sprint di `DECISIONS.MD`.
>
> **Prasyarat:** tidak ada (ini sprint fondasi).
> **Penerus:** Sprint 002 **bergantung** pada sprint ini — `getSignatureRoles()`,
> `getPejabat()`, `PEJABAT_ROLES`, dan `PeringatanData` belum ada sebelum sprint ini selesai.
>
> **REVISI 2026-09-17** — hasil review pack terhadap kode nyata. Scope **diperluas**
> (keputusan user): pembersihan nilai hardcoded tidak lagi berhenti di `utils/` + kop,
> tetapi menuntaskan **seluruh** literal nama pejabat, NIP, dan identitas sekolah,
> termasuk memasang auto-fill pejabat untuk SPT/SPD/Undangan agar tidak ada regresi
> yang terkirim di antara dua sprint. Rincian temuan → `DECISIONS.MD` (ADR 2026-09-17).

---

## Tujuan Sprint

Menjadikan **Data Sekolah** (tab Data Sekolah · tab Logo Sekolah · tab Pejabat Sekolah)
sebagai **satu-satunya sumber** identitas sekolah dan pejabat untuk seluruh dokumen cetak —
tanpa satu pun nilai hardcoded, dibaca saat render (bukan konstanta modul), dan dengan
**peringatan jujur** ketika data belum diisi.

## Apa yang Dibangun

1. **Modul peran pejabat tunggal** (`PEJABAT_ROLES`, 6 peran) — menggantikan dua definisi
   terduplikasi di `DataSekolahPage.jsx` dan `PejabatSekolahPage.jsx`.
2. **Pejabat dari Data Sekolah → tab Pejabat Sekolah** untuk 6 peran: Kepala Sekolah,
   Bendahara, Pengawas, Sekdik, **Ketua Gugus**, **Notulen** — termasuk NIP.
3. **Resolver identitas sekolah tanpa fallback**: `getSchoolData()` + `getPejabat(role)`,
   dengan `email` / `telepon` / `website` dibaca dari `allFields` berdasarkan label.
4. **Nilai dibaca saat render**, bukan dari konstanta yang dihitung sekali saat modul
   di-import — sehingga tidak ada nilai basi setelah Data Sekolah diubah.
5. **Kop sekolah dari Data Sekolah** + **logo sekolah di pojok kiri atas** dan
   **logo dinas di pojok kanan atas**.
6. **Kop gugus data-driven** — dua field baru: **Nama Gugus** dan **Alamat Gugus**
   (seksi "Data Gugus"), plus logo gugus dan baris kabupaten.
7. **Peringatan merah** saat data belum diisi, dua varian pesan, berlaku untuk
   **semua dokumen** (bukan hanya Perjalanan Dinas).
8. **Dua halaman Data Sekolah aman terhadap data lama**: deep-merge saat load (tidak crash
   ketika peran baru ditambahkan) dan warna kartu **blue-only**.
9. **Auto-fill pejabat untuk SPT / SPD / Undangan** — tanda tangan ketiga dokumen itu
   bersumber dari `getSignatureRoles()`, menggantikan literal yang dihapus. **Tanpa ini,
   pembersihan hardcode mengirim regresi** (TTD kosong) yang baru pulih di Sprint 002.
10. **Nol literal identitas sekolah** — `SD NEGERI LEBAKLEUNGSIR` dihapus dari seluruh
    `src/` (fallback cetak → `getSchoolData()`; placeholder form → label generik).
11. **Nol literal NIP & nama pejabat** di seluruh `src/` — termasuk `Yuniarti, S.Pd`
    (placeholder tersembunyi di SK Honorer) dan 5 NIP.
12. **`package.json` pinned eksak** — 14 dependency tanpa `^`, sesuai aturan Bab 17.2.
13. **NPSN dari Data Sekolah** — `bku.defaults.npsn` di `templateConfig.js` memuat
    `'20212345'`, **bertentangan** dengan `'20228636'` di `sekolahData.js`. Keduanya
    dihapus; BKU membaca NPSN dari Data Sekolah.
14. **SK Honorer satu identitas sekolah** — `SKHonorer.jsx` merender **kop sendiri**
    (bukan blok `KopSurat`) dan menyimpan identitas sekolah **kedua**: `SD NEGERI PASIRHALANG`,
    `Kp. Pasirhalang RT 03/014 Ds. Mandalamukti`, `PEMERINTAH KABUPATEN BANDUNG BARAT`.
    **9 baris** dibersihkan = **8 fallback yang benar-benar tercetak** (cabang
    `mode === 'print'`) + **1 komentar** (baris 5). Baris 98 `DINAS PENDIDIKAN`
    **sengaja tidak disentuh** — nama instansi tetap, sama persis dengan `KopSurat.jsx:16`.
15. **Literal dibedakan dua kelas** — *fallback cetak* (`data.X || 'NAMA'`) dihapus;
    *placeholder* (argumen `ph` helper / `<Field placeholder>`) diganti **label generik**,
    bukan nilai dinamis. Menyamakan keduanya membuat field kosong mencetak
    `[ Kepala SD Negeri X ]` — nama asli muncul sebagai teks kurung siku.

## Mengapa

- **Dokumen bisa tercetak dengan nama orang lain.** Saat Data Sekolah belum diisi, sistem
  diam-diam memakai nama default hardcoded (`BADRUDDIN`, `WAHYUDIN`, `DEWI ERMIRAWATI`,
  `DEDE GUNAWAN`, `Yuniarti`). Dokumen pertanggungjawaban resmi bisa beredar dengan nama
  pejabat yang salah.
- **Menghapus fallback di blok saja tidak cukup.** `DokumenFormPreview.jsx` membangun data
  cetak dengan spread `...config.defaults` (baris 1550, 1591, 1617, 1632, 1674) dan
  `formData.X || skConfig.defaults.X` (1561–1564). `templateConfig.defaults` adalah
  **lapisan fallback otoritatif** — literal di blok hanya lapisan kedua. Membersihkan satu
  lantai saja memindahkan masalah, bukan menyelesaikannya.
- **NIP hardcoded lolos dari gate lama.** 5 NIP muncul **18× di 8 file** (terukur
  2026-09-17: `grep -rnE "<5 NIP>" spj-frontend/src | wc -l` → 18) —
  `SPDForm`, `SuratTugas`, `SuratUndangan`, `SKHonorer`, `DokumenFormPreview`,
  `templateConfig`, `sekolahData`, `signatureRoles`. Gate yang hanya mencari **nama**
  tidak menangkapnya — dokumen tetap bisa tercetak dengan NIP orang lain meski namanya
  kosong.
- **Data sekolah tidak terpakai.** Email sekolah sudah ada di Data Sekolah (terbukti di
  `template-data/profil-SD NEGERI PASIRHALANG-….xlsx` baris 36) tetapi tidak pernah terbaca,
  karena `LABEL_MAP` (`utils/sekolahParser.js`) tidak memuat `email`. Logo yang sudah diupload
  tidak pernah muncul di dokumen, padahal aplikasi sendiri sudah mendokumentasikan niatnya
  di `DataSekolahPage.jsx`.
- **Perubahan data tidak langsung terlihat.** Mengubah Data Sekolah lalu membuka dokumen
  **tanpa reload** masih menampilkan nilai lama — bug nilai basi, karena `KopSurat` membaca
  `SEKOLAH_DEFAULT` dan `signatureRoles.js:8-9` memanggil `getKepalaSekolah()` di **level
  modul** (sekali saat import).
- **Ketua Gugus salah orang.** `utils/signatureRoles.js:32-36` memetakan `ketua-gugus` →
  Kepala Sekolah, padahal dokumen sumber menunjukkan Ketua Gugus orang yang **berbeda**.
- **Kop gugus tidak punya sumber data.** `blocks/KopGugus.jsx` masih literal
  `'GUGUS KI HAJAR DEWANTARA'` (baris 12) + alamat sekretariat (baris 15) + kabupaten
  (baris 9), sementara dokumen sumber menulis *"Gugus K.H. Dewantara"* — ejaannya pun
  sudah menyimpang.
- **Identitas sekolah bocor dari 31 baris di 11 file.** Terukur 2026-09-17 dengan
  `grep -rniE "SD NEGERI LEBAKLEUNGSIR|Pasirhalang|PEMERINTAH KABUPATEN|20212345|20228636"
  spj-frontend/src` → **31 baris / 11 file**: `DokumenFormPreview.jsx` (8),
  `SKHonorer.jsx` (7), `templateConfig.js` (4), `SPDForm.jsx` (4), `sekolahData.js` (2),
  `guruTendikParser.js`, `dataContextBuilder.js`, `TabelLetterHeader.jsx`, `KopSurat.jsx`,
  `KopGugus.jsx`, `InfoKeuangan.jsx` (masing-masing 1). Menghapus nilai itu dari
  `SEKOLAH_DEFAULTS` saja tidak membuat identitas sekolah jadi data-driven.
  **Catatan:** sebagian baris itu *placeholder* (Kelas B), bukan *fallback cetak*
  (Kelas A) — perlakuannya berbeda, lihat butir berikutnya.
- **Ada identitas sekolah kedua di dalam kode.** Selain `SD NEGERI LEBAKLEUNGSIR`
  (Kp. Lebakleungsir / Ds. Mekarjaya / NPSN 20228636) yang dipakai seluruh aplikasi,
  `blocks/SKHonorer.jsx` punya identitasnya sendiri: `SD NEGERI PASIRHALANG` /
  `SEKOLAH DASAR NEGERI PASIRHALANG` / `SD Negeri Pasirhalang` / `SDN Pasirhalang`
  (4 ejaan berbeda), `Kp. Pasirhalang RT 03/014 Ds. Mandalamukti`, dan kepala sekolah
  `Yuniarti, S.Pd` / NIP `196607071986102005` — semuanya sebagai **fallback cetak**
  (baris 94, 96, 100, 117, 142, 144, 150, 227). Artinya dokumen SK Honorer bisa tercetak
  atas nama **sekolah lain** yang bukan sekolah pengguna, bahkan setelah Data Sekolah diisi,
  selama field terkait kosong. Gate lama tidak menangkap ini karena hanya mencari nama
  `BADRUDDIN`/`WAHYUDIN`/dst, bukan `Pasirhalang`.
- **NPSN di kode saling bertentangan.** `templateConfig.js:957` menulis `npsn: '20212345'`
  (template `bku`) sementara `sekolahData.js:11` menulis `20228636`. Dua nomor induk
  sekolah nasional untuk satu sekolah — salah satunya pasti salah, dan tidak ada sumber
  kebenaran di antara keduanya. NPSN wajib diambil dari Data Sekolah, bukan dari dua
  literal yang berbeda.
- **Data lama bikin crash.** Menambah peran baru ke `spj_data_sekolah.pejabat` mematahkan
  halaman yang membaca data bentuk lama (`Cannot read properties of undefined`).
- **Versi dependency bisa bergeser.** `package.json` masih memakai `^` untuk 14 paket
  (mis. `react: ^18.2.0` padahal lockfile `18.3.1`), sehingga `npm install` dapat menaikkan
  versi di luar yang ter-pin di `BLUEPRINT.MD`.

## Pengguna

| Persona | Peran dalam sprint ini |
|---|---|
| **Operator Sekolah** (primer) | Mengisi Data Sekolah, logo, dan pejabat; memastikan dokumen tidak memakai nama salah |
| **Bendahara Sekolah** (primer) | Memastikan identitas sekolah & pembebanan benar sebelum mencetak |
| **Kepala Sekolah** (sekunder) | Memastikan nama & NIP-nya benar; melihat peringatan bila datanya belum diisi |
| **Ketua Gugus** (sekunder) | Sumber tanda tangan surat resmi gugus |

## Data Sumber

| Sumber | Isi yang dipakai |
|---|---|
| Data Sekolah → **tab Data Sekolah** | Identitas sekolah: nama, NPSN, alamat, **email**, telepon, website, kabupaten, provinsi, kecamatan · **Nama Gugus** + **Alamat Gugus** (seksi baru) |
| Data Sekolah → **tab Logo Sekolah** | Logo sekolah, logo dinas, logo gugus (gambar) |
| Data Sekolah → **tab Pejabat Sekolah** | Nama & NIP 6 peran penandatangan |
| `template-data/profil-SD NEGERI PASIRHALANG-2026-07-10 08_15_16.xlsx` | Bukti bahwa baris `Email` sudah tersimpan di `allFields` |
| `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` | Rujukan ejaan nama gugus & identitas penandatangan |
| Penyimpanan lokal browser (prefix `spj_`) | Seluruh data — tanpa backend |

## Output yang Diharapkan

- Halaman **Data Sekolah** dengan 6 kartu peran (deep-merge aman) dan warna blue-only.
- Seksi **Data Gugus** (Nama Gugus + Alamat Gugus) tersimpan di `spj_data_sekolah`.
- Kop sekolah cetak memuat identitas + **logo sekolah (kiri atas)** + **logo dinas (kanan atas)**.
- Kop gugus cetak memuat **Nama Gugus** + **Alamat Gugus** + kabupaten dari Data Sekolah.
- **Nol** nama pejabat, **nol** NIP, **nol** literal identitas sekolah di `src/` —
  diverifikasi satu gate grep (T-02), bukan klaim.
- TTD **SPT / SPD / Undangan terisi dari Data Sekolah** — tidak kosong setelah literal
  dihapus (ini yang mencegah regresi antar-sprint).
- Peringatan merah 2 varian muncul di **semua dokumen** saat data belum diisi; identitas
  sekolah kosong → kop **benar-benar kosong** (tanpa placeholder).
- Nilai langsung ikut berubah setelah Data Sekolah diubah, **tanpa reload**.
- `package.json` memuat 14 versi eksak = lockfile; `npm ci` tetap bersih.

## Cakupan User Story

| US | Judul | Fase |
|---|---|---|
| US-13 | Pejabat dari Data Sekolah → tab Pejabat Sekolah | Fase 1 + 2 |
| US-14 | Field baru "Ketua Gugus" + "Notulen" | Fase 1 + 2 |
| US-15 | Data kosong → field kosong + notifikasi merah | Fase 1 + 5 |
| US-16 | Guard regresi akibat perubahan global `sekolahData.js` | Fase 1 + 4 + 6 |
| US-17 | Kop sekolah dari Data Sekolah (identitas + logo) | Fase 3 |
| US-18 | Data Gugus baru + kop gugus data-driven | Fase 2 + 3 |
| US-11 | Blue-only pada modul yang disentuh (**sebagian**) | Fase 2 |

> **Bukan cakupan sprint ini:** US-01 … US-10 dan US-12 → Sprint 002.
> Sprint ini menyentuh dokumen Perjalanan Dinas **hanya pada sumber datanya**
> (TTD + identitas sekolah). Sprint ini **TIDAK** mengubah: struktur tab, penghapusan tab
> "Surat Tugas", layout print-area (kop → TTD, 3 blok SPD yang hilang, tembusan),
> konsep dua wajah `<input>` vs cetak murni, dan reset data lama. Semuanya Sprint 002.

## Batasan

- **Tanpa backend.** Data tetap di localStorage prefix `spj_` — prefix tidak boleh diubah.
- **Stack terkunci ADR**: React 18 + Vite + Tailwind CSS. **Tidak boleh** memilih ulang stack.
- **Tanpa dependency baru** — hanya yang terdaftar di `BLUEPRINT.MD` (versi ter-pin).
  Sprint ini **mengubah deklarasi versi** di `package.json` jadi eksak, **bukan** menaikkan versi.
- **Warna UI blue-only** `#004ac6` + slate. Pengecualian sah: **indikator status di layar**
  (mis. banner peringatan merah) — tidak pernah ikut cetak.
- **Kertas A4 wajib**, satuan `mm`, orientasi dari konfigurasi template.
- **Dilarang refactor di luar cakupan sprint** (aturan AGENTS.MD). File legacy besar
  (`DokumenFormPreview.jsx` 1847 baris, `templateConfig.js` 993 baris) **tidak dipecah** —
  yang diubah hanya nilai literal di dalamnya, bukan strukturnya.
- Peringatan data kosong **memperingatkan, tidak memblokir** — user tetap boleh mencetak.
- **`utils/sekolahParser.js` TIDAK diubah** (`LABEL_MAP` + `handleFileUpload` di luar cakupan).
  Keuntungannya: data yang **sudah** ter-upload langsung terbaca tanpa perlu upload ulang.
- **Peringatan TIDAK PERNAH ikut cetak** — dipasang hanya pada mode tampilan layar.
- **Literal tempat & tanggal dokumen** (`Cikalongwetan`, `8 Mei 2026`, `SD Negeri Cipada`,
  `Tempat`, `Perjalanan Dinas`) **di luar cakupan** — itu konten dokumen, bukan identitas
  sekolah/pejabat. Batas tegas: yang dibersihkan = **nama orang, NIP, nama/NPSN/alamat/email
  sekolah, nama gugus**.
- **Di luar cakupan**: dokumen "Surat Tugas" (penghapusan tab), Resume/notulen rapat,
  backend/API, migrasi data lama, migrasi TypeScript, pemasangan ESLint/Prettier/Vitest,
  dan perbaikan temuan keamanan F1–F9 (`docs/SECURITY-AUDIT-001.md`).
- Bukti wajib berupa output build/test asli atau screenshot — **bukan klaim**.


# BLUEPRINT — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4). Isi = **BAGAIMANA** saja.
> "Apa & mengapa" → `REQUIREMENTS.MD`. Kriteria uji → `ACCEPTANCE.MD`.
>
> Dependency **ter-pin eksak** (Bab 17.2 — jangan `^`). Memenuhi temuan **F8**
> (`docs/SECURITY-AUDIT-001.md` §5). Tech stack **tidak dipilih ulang** — terkunci ADR.
>
> **REVISI 2026-09-17 (v3)** — hasil **dry run Fase 1 + Fase 4** terhadap kode nyata.
> Dry run menemukan 4 cacat plan (D-1…D-3, D-6) yang membuat **gate T-02 pasti gagal**
> bila BLUEPRINT v2 diikuti apa adanya. Perubahan v3:
> - **D-1** 4 literal tanpa task pembersih → masuk (`templateConfig` 51/295/958,
>   `DokumenFormPreview` 1669)
> - **D-2** preskripsi task placeholder **dikoreksi**: label generik, bukan nilai dinamis;
>   `SuratTugas` dipecah jadi fallback-cetak vs placeholder-edit
> - **D-3** `bku.defaults.npsn: '20212345'` → dari Data Sekolah; pola NPSN masuk T-02
> - **D-6** `SKHonorer.jsx` memuat **identitas sekolah kedua** (`SD NEGERI PASIRHALANG`,
>   `Kp. Pasirhalang`, `Ds. Mandalamukti`) + **kop duplikat** di baris 94/98 — 8 baris,
>   task lama hanya menutup 2
> - T-02 diperketat: **11 → 15 pola**, `grep -i`, baseline **57 → 73 baris / 15 file**
> - Daftar ubah **17 → 19 file** (+`utils/guruTendikParser.js`, +`blocks/TabelLetterHeader.jsx`)
> - Task **48 → 53**; FASE 4 **15 → 20 task**
>
> **REVISI 2026-09-17 (v5)** — hasil **dry run Fase 1 + Fase 4** terhadap kode nyata.
> FASE 1 terverifikasi **dapat dijalankan apa adanya**. FASE 4 punya **3 cacat
> preskripsi** yang ditemukan karena dry run memeriksa **apakah task-nya benar**, bukan
> hanya **apakah barisnya tertaut task** (celah yang lolos di v3/v4):
> - **D-7** task 4.3 mengosongkan `surat_tugas.defaults` yang **tidak pernah tercetak** —
>   tab `surat_tugas` memakai `buildSptData` yang hanya spread `spt.defaults` (baris 1617).
>   Task tetap wajib untuk gate T-02, tetapi preskripsinya kini diberi catatan
> - **D-8** ⚠️ **TINGGI** — task 4.1 auto-fill hanya menyebut spt/sppd/undangan, **tidak
>   notulen**; setelah 1.10 menghapus fallback, TTD notulen & pimpinan **cetak kosong
>   permanen**. Task 4.1 diperluas + **T-15 baru**
> - **D-9** task 1.10 sebenarnya **8 baris di 2 cabang** (`useTwoColumn`), bukan 1 titik
>
> Task **tetap 53** dan file **tetap 19** — v5 memperjelas preskripsi, menambah 1 test
> case (**14 → 15**), bukan memperluas cakupan.
>
> **REVISI 2026-09-17 (v4)** — hasil **verifikasi independen gate** (bukan dry run baru).
> 11 klaim pack diukur ulang terhadap kode nyata → **semuanya cocok** (T-02 baseline
> **73 baris / 15 file** persis, cek aset `sourceFile` = **0**, 53 task nyata, 14 caret,
> semua temuan D-1/D-2/D-3/D-6/F-1a/F-4 terbukti). **Satu koreksi:**
> - **F-2 dibalik** — runtime gate yang benar = **v22.22.2 / npm 10.9.7** (*managed*),
>   bukan v24.19.0 (*system fallback*). Lihat catatan di §Tech Stack.
>   **Determinisme terverifikasi:** hash artefak build **identik** di kedua runtime.
>
> Isi task, jumlah file, dan gate **TIDAK berubah** di v4 — hanya akurasi klaim runtime.
>
> **REVISI 2026-09-17 (v2)** — hasil review terhadap kode nyata. Perubahan: runtime Node
> dikoreksi · `package.json` ikut di-pin · **FASE 4 baru** · peringatan geser ke FASE 5 ·
> gate akhir FASE 6 · KopGugus ditegaskan **prop-driven**.

---

## Arsitektur Sistem

```
localStorage (prefix spj_)          ← satu-satunya sumber data, tanpa backend
  ├─ spj_data_sekolah               ← identitas + allFields + gugus + pejabat(6)
  └─ spj_logo_sekolah / _dinas / _gugus

utils/pejabatRoles.js  ────────────► PEJABAT_ROLES(6) · DEFAULT_PEJABAT · mergePejabat()
        │  (BARU — satu sumber, menggantikan duplikasi di 2 halaman)
        ▼
utils/sekolahData.js   ────────────► getSchoolData()    ← + resolver allFields by label
        │                             getPejabat(role)   ← TANPA fallback hardcoded
        │                             getPejabatStatus() ← bahan notifikasi merah
        ▼
utils/signatureRoles.js ───────────► getSignatureRoles()  ← dibaca SAAT RENDER
        │                             (bukan konstanta modul — memperbaiki bug nilai basi)
        ▼
components/templates/blocks/
        ├─ KopSurat.jsx          ← identitas + LOGO sekolah (kiri atas) + dinas (kanan atas)
        ├─ KopGugus.jsx          ← Nama Gugus + Alamat Gugus + logo gugus (PROP-DRIVEN)
        ├─ SignatureFooter.jsx   ← 6 peran, TANPA fallback || defaultName
        ├─ SPDForm.jsx           ← FASE 4: A hapus 6 fallback TTD · B 4 placeholder → generik
        ├─ SuratTugas.jsx        ← FASE 4: A hapus 4 fallback TTD · B placeholder edit-only
        ├─ SuratUndangan.jsx     ← FASE 4: hapus fallback TTD + komentar
        ├─ SKHonorer.jsx         ← FASE 4 (D-6): 9 baris — IDENTITAS SEKOLAH KEDUA
        │                          ('SD NEGERI PASIRHALANG' + 'Kp. Pasirhalang' + kop duplikat)
        ├─ InfoKeuangan.jsx      ← FASE 4: placeholder baris 11 → generik
        ├─ TabelLetterHeader.jsx ← FASE 4: komentar baris 8 → generik
        └─ PeringatanData.jsx    ← BARU: banner merah, 2 varian, print:hidden

data/templateConfig.js  ← FASE 4: bersihkan `defaults` (lapisan fallback OTORITATIF)
        spt · surat_tugas · undangan_gugus · sk_honorer · notulen(51) · sppd(295)
        bku(957 npsn + 958 namaSekolah) → dari Data Sekolah

utils/dataContextBuilder.js  ← FASE 4: komentar JSDoc 22–23 → generik
utils/guruTendikParser.js    ← FASE 4: komentar baris 97 → generik

components/templates/TemplateEngine.jsx   ← renderer UNIVERSAL (semua 13 template)
        └─ mode === 'edit'  →  <PeringatanData />  ← dipasang DI SINI = "semua dokumen"
components/templates/DokumenFormPreview.jsx
        ├─ tab Perjalanan Dinas (spt/sppd/undangan) di layar → <PeringatanData />
        │  (tab itu merender TemplateEngine mode="print", jadi tidak ter-cover di atas)
        ├─ FASE 4.1 : auto-fill pejabat dari getSignatureRoles() → TTD tidak kosong
        ├─ FASE 4.15: A — 3 fallback cetak (1496, 1641, 1669) → getSchoolData()
        └─ FASE 4.16: B — 10 placeholder form → label generik
```

**Keputusan arsitektur penting #1:** peringatan data kosong dipasang di **`TemplateEngine.jsx`**
(mode `edit`), **bukan** di 14 blok cetak. `TemplateEngine` adalah renderer universal seluruh
template, sehingga satu titik pemasangan sudah mencakup "semua dokumen" — sekaligus menghindari
menyentuh 14 file (aturan AGENTS.MD: jangan refactor di luar cakupan).

**Keputusan arsitektur penting #2 — lapisan fallback.** Ada **dua** lapisan nilai default:

| Lapisan | Lokasi | Mekanisme |
|---|---|---|
| 1 (otoritatif) | `data/templateConfig.js` → `defaults` | di-spread `DokumenFormPreview.jsx:1550,1591,1617,1632,1674` + `formData.X \|\| cfg.defaults.X` (1561–1564) |
| 2 (sisa) | blok cetak | `data.namaX \|\| 'BADRUDDIN, S.Ag.'` |

Menghapus lapisan 2 saja **tidak menghasilkan nol** — lapisan 1 tetap mengisi. Keduanya wajib
dibersihkan **bersamaan**, dan karena itu FASE 4 memasang auto-fill pejabat lebih dulu supaya
TTD tidak jatuh ke kosong.

**Keputusan arsitektur penting #3 — KopGugus tetap prop-driven.** Satu-satunya pemanggil
`KopGugus` adalah `TemplateEngine` via `BLOCK_RENDERERS['kop-gugus']` (baris 42) yang mengoper
`data`. Blok **tidak** membaca localStorage sendiri — pembacaan storage dilakukan lapisan di
atasnya saat render. Ini konsisten dengan pola blok lain dan dengan prinsip "nilai dibaca saat
render" (menghindari nilai basi yang justru jadi alasan sprint ini).

**Keputusan arsitektur penting #4 — dua kelas literal (temuan dry run D-2).** Tidak semua
string identitas berperilaku sama. Memborong keduanya dengan satu cara menghasilkan bug baru:

| | Kelas A — fallback cetak | Kelas B — placeholder |
|---|---|---|
| Bentuk | `{data.X \|\| 'NAMA'}` | argumen `ph` helper / `<Field placeholder>` |
| Tercetak? | **Ya**, saat data kosong | `SPDForm.val` → ya, sebagai `[ ph ]` · `SuratTugas.F` → **tidak** (print pakai `label`) · `<Field>` → tidak (tab editor) |
| Bersihkan dengan | **hapus** `\|\| 'NAMA'` | ganti **label generik** |
| Salah penanganan | — | memakai `getSchoolData().namaSekolah` di kelas B membuat field kosong mencetak `[ Kepala SD Negeri X ]` — nama asli muncul sebagai teks kurung siku, terlihat terisi padahal kosong |

Bukti: `SPDForm.jsx:23-36` (`val` → `<PlaceholderText label={ph || key} />`) vs
`SuratTugas.jsx:23-44` (`F` → `<PlaceholderText label={label} />`). `PlaceholderText`
(`utils/templateHelpers.jsx:62-69`) merender `[ label ]` italic — **ikut tercetak**.

**Keputusan arsitektur penting #5 — satu aplikasi, dua identitas sekolah (temuan dry run D-6).**
`SKHonorer.jsx` tidak memakai blok `KopSurat`; ia merender **kop-nya sendiri** (baris 94–100)
dan menyimpan **identitas sekolah yang berbeda** dari sisa aplikasi:

| | Sisa aplikasi (`sekolahData.js`) | `SKHonorer.jsx` |
|---|---|---|
| Nama | SD NEGERI LEBAKLEUNGSIR | SD NEGERI **PASIRHALANG** |
| Alamat | Kp. Lebakleungsir, Ds. **Mekarjaya** | Kp. Pasirhalang, Ds. **Mandalamukti** |
| NPSN | 20228636 | — (`templateConfig.bku`: **20212345**) |

Semuanya fallback kelas A di dalam cabang `mode === 'print'` (baris 225) → **benar-benar
tercetak**. Konsekuensinya SK Honorer bisa terbit atas nama sekolah yang salah meski Data
Sekolah sudah diisi benar. Karena itu task 4.14 diperluas dari 2 baris jadi **9 baris**, dan
`Pasirhalang` + kedua NPSN masuk pola T-02.

⚠️ **`data/mockData.js` juga memuat `Mandalamukti`** (6 hit) tetapi itu **data demo fiktif**
untuk widget dashboard, dan `seedMockData()` terverifikasi **tidak** menulis `spj_data_sekolah`.
Di luar cakupan — dan karena itu `Mandalamukti` **sengaja tidak** dijadikan pola T-02.

## Prasyarat & Ketergantungan

- **Prasyarat:** **tidak ada.** Sprint ini adalah sprint fondasi.
- **Penerus:** Sprint 002 (`planning/sprints/sprint-002/`) **bergantung** pada sprint ini.
  Kontrak yang harus sudah ada sebelum Sprint 002 dimulai:
  `getSchoolData()` · `getPejabat(role)` · `getPejabatStatus()` · `getSignatureRoles()` ·
  `PEJABAT_ROLES` · `mergePejabat()` · `blocks/PeringatanData.jsx`.
- **⚠️ Tumpang tindih file dengan Sprint 002** (akibat perluasan scope 2026-09-17):
  `SPDForm.jsx`, `SuratTugas.jsx`, `SuratUndangan.jsx`, `templateConfig.js`, dan
  `DokumenFormPreview.jsx` disentuh **kedua** sprint. Pembagian tegas:
  - **Sprint 001** = mengganti **sumber nilai** (literal → Data Sekolah). Tidak mengubah struktur.
  - **Sprint 002** = mengubah **struktur & layout** (hapus `<input>` di mode edit, hapus config
    `surat_tugas`, tambah 3 blok SPD, tembusan, print-area kop → TTD, A4/mm).
  Sprint 002 **wajib** membaca ulang file-file itu sebelum mengedit — isinya sudah berbeda
  dari yang diasumsikan pack 002 versi awal.
- **Urutan tidak boleh ditukar.** Auto-fill (task 4.10) harus selesai **sebelum** literal
  dihapus (task 4.1–4.9) dalam commit yang sama, atau build menghasilkan dokumen bertanda
  tangan kosong.

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Runtime | Node.js **v22.22.2** (npm **10.9.7**) — *managed*, runtime yang dipakai agent/gate · Node.js v24.19.0 (npm 11.17.0) tersedia sebagai *system fallback* |
| UI | React **18.3.1** + React DOM **18.3.1** |
| Routing | react-router-dom **6.30.4** |
| Build | Vite **5.4.21** + @vitejs/plugin-react **4.7.0** |
| Styling | Tailwind CSS **3.4.19** + postcss **8.5.16** + autoprefixer **10.5.2** |
| Ikon | lucide-react **0.344.0** (Material Symbols via font) |
| Excel | xlsx **0.18.5** ⚠️ lihat catatan |
| PDF | pdfjs-dist **4.10.38** |
| AI client | @heyputer/puter.js **2.5.4** |
| Bahasa | JavaScript ES modules + JSX (bukan TypeScript) |

> **Koreksi 2026-09-17 (v4):** pack v3 menulis Node **v24.19.0** / npm **11.17.0** sebagai
> runtime gate dan menyebut v22.22.2 / 10.9.7 "tidak sesuai mesin pengembangan". Klaim itu
> **dibalik** — v22.22.2 adalah runtime ***managed*** (`~/.workbuddy-ai/binaries/node/versions/`)
> yang dipakai tooling agent; v24.19.0 hanya *system fallback* di `C:\Program Files\nodejs\`
> dan menang di PATH shell interaktif user (asal angka lama).
>
> **Determinisme terverifikasi:** build dijalankan pada **kedua** runtime →
> **hash artefak identik** (`index-DnR8JQGI.css`, `index-WAamvT7W.js`, `index-Cyv8yBhl.js`,
> `pdf-BnPRJEQ6.js`, `pdfTableExtractor-Chm73N2S.js`), hanya waktu berbeda (10,42 s vs 6,89 s).
> Jadi perbedaan runtime **tidak memengaruhi keluaran gate** — task 6.2 boleh dijalankan
> pada runtime mana pun selama bukti menyebut versinya.

## File yang Akan Dibuat

| # | File | Isi |
|---|---|---|
| 1 | `spj-frontend/src/utils/pejabatRoles.js` | `PEJABAT_ROLES` (6 peran), `DEFAULT_PEJABAT`, `mergePejabat()` — **satu sumber**, menggantikan duplikasi di 2 halaman |
| 2 | `spj-frontend/src/components/templates/blocks/PeringatanData.jsx` | Komponen banner merah, 2 varian pesan (identitas sekolah / pejabat), `print:hidden` |

## File yang Akan Diubah

| # | File | Fase | Sifat perubahan |
|---|---|---|---|
| 1 | `spj-frontend/src/utils/sekolahData.js` | 1 | resolver `allFields` · hentikan fallback · tambah `getPejabat`/`getPejabatStatus` · hapus konstanta basi + `export default` |
| 2 | `spj-frontend/src/utils/signatureRoles.js` | 1 | konstanta → fungsi `getSignatureRoles()`; perbaiki pemetaan `ketua-gugus` & `notulen` |
| 3 | `spj-frontend/src/components/templates/blocks/KopSurat.jsx` | 1, 3 | migrasi import + render logo + baris kabupaten dari data |
| 4 | `spj-frontend/src/components/templates/blocks/SignatureFooter.jsx` | 1 | migrasi import + hapus fallback `\|\| defaultName` |
| 5 | `spj-frontend/src/pages/dashboard/DataSekolahPage.jsx` | 2 | import `PEJABAT_ROLES` bersama · deep-merge · blue-only · field Data Gugus |
| 6 | `spj-frontend/src/pages/dashboard/PejabatSekolahPage.jsx` | 2 | idem (hapus `defaultPejabat` lokal) |
| 7 | `spj-frontend/src/components/templates/blocks/KopGugus.jsx` | 3 | hapus 3 literal (baris 9, 12, 15) → baca dari prop `data` + logo gugus |
| 8 | `spj-frontend/src/components/templates/blocks/SPDForm.jsx` | 4 | **A:** hapus 6 fallback TTD cetak (156–157, 178–179, 191–192) · **B:** 4 argumen `ph` pada `val()` (57, 76, 96, 166) → **label generik**, bukan nilai dinamis |
| 9 | `spj-frontend/src/components/templates/blocks/SuratTugas.jsx` | 4 | **A:** hapus 4 fallback TTD cetak (103–104, 110–111) · **B:** placeholder edit-only (65) + komentar (15) → generik |
| 10 | `spj-frontend/src/components/templates/blocks/SuratUndangan.jsx` | 4 | hapus fallback TTD (216–217) + komentar (12) |
| 11 | `spj-frontend/src/components/templates/blocks/SKHonorer.jsx` | 4 | ⚠️ **D-6 — identitas sekolah KEDUA.** Bersihkan **9 baris**: 5 (komentar), 94 (`PEMERINTAH KABUPATEN`), 96 (`SD NEGERI PASIRHALANG` + `CIKALONGWETAN`), 100 (alamat `Kp. Pasirhalang … Mandalamukti`), 117, 142 (`Yuniarti`), 144 (NIP), 150, 227 → semua dari `getSchoolData()`/`getKepalaSekolah()`. **Baris 98 `DINAS PENDIDIKAN` TIDAK disentuh** — nama instansi tetap, identik dengan `KopSurat.jsx:16` & `templateSuratHelper.js:486`, tidak terjaring T-02. Task lama hanya menutup 142+144 |
| 12 | `spj-frontend/src/data/templateConfig.js` | 4 | kosongkan `defaults` nama+NIP: `spt` (324–328), `surat_tugas` (352–356), `undangan_gugus` (377–378), `sk_honorer` (914–915) · **D-1:** `notulen.tempat` (51), `sppd.pengguna` (295) · **D-3:** `bku.npsn` (957) + `bku.namaSekolah` (958) → dari Data Sekolah |
| 13 | `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | 4, 5 | auto-fill pejabat `getSignatureRoles()` · **A:** fallback cetak (1496, 1641, **1669** ← D-1) · **B:** 10 placeholder form (493, 498, 511, 512, 577, 604, 718, 719, **1032, 1047**) → generik · pasang `<PeringatanData />` di tab Perjalanan Dinas |
| 14 | `spj-frontend/src/components/templates/TemplateEngine.jsx` | 5 | pasang `<PeringatanData />` saat `mode === 'edit'` |
| 15 | `spj-frontend/src/components/templates/blocks/InfoKeuangan.jsx` | 4 | placeholder `SD NEGERI LEBAKLEUNGSIR` (baris 11) → generik |
| 16 | `spj-frontend/package.json` | 1 | 14 dependency → versi **eksak** (hapus `^`), disamakan lockfile |
| 17 | `spj-frontend/src/utils/dataContextBuilder.js` | 4 | komentar JSDoc **baris 22–23** (`SD Negeri Pasirhalang \| NPSN: 123456` + `Kepsek: Yuniarti \| Bendahara: Susanto`) → generik. **Bukan hardcode fungsional** (file 454 baris, hanya dipakai `aiHelper.js:63`), tetapi terjaring T-02 yang **tidak** memberi pengecualian komentar |
| 18 | `spj-frontend/src/utils/guruTendikParser.js` | 4 | **BARU (D-1)** komentar contoh baris 97 (`// "SD NEGERI PASIRHALANG"`) → generik. File 255 baris, 1 konsumen (`DataGuruPage.jsx:9`). **Hanya komentar — logika parser tidak disentuh** |
| 19 | `spj-frontend/src/components/templates/blocks/TabelLetterHeader.jsx` | 4 | **BARU (D-1)** komentar diagram ASCII baris 8 (`SD Negeri Lebakleungsir`) → generik. File 154 baris. **Hanya komentar** |

> **DILARANG** menyentuh file di luar daftar ini (AGENTS.MD — jangan refactor di luar cakupan).
> Khususnya: **`utils/sekolahParser.js`** (`LABEL_MAP` / `handleFileUpload`) **TIDAK diubah**.
>
> **`data/mockData.js` TIDAK diubah** — 6 hit `Mandalamukti` adalah data demo fiktif untuk
> widget dashboard; `seedMockData()` terverifikasi **tidak** menulis `spj_data_sekolah`,
> jadi tidak bentrok dengan fondasi sprint ini. Karena itu pola T-02 **sengaja tidak**
> memuat `Mandalamukti`.
>
> **11× `sourceFile: '/templates/…SDN lebakleungsir.xlsx'` di `templateConfig.js` TIDAK
> diubah** — itu path aset nyata. T-02 terverifikasi tidak menjaringnya. **Jangan di-rename.**
>
> `blocks/NomorSuratPopup.jsx:18` memakai `NAMA_SEKOLAH_DEFAULT = 'SDN-PSR'` — **bukan**
> identitas sekolah nyata (kode singkatan untuk penomoran surat), tidak terjaring T-02,
> **di luar cakupan**. Dicatat di `QUESTIONS.MD`.

## Dependensi (versi ter-pin eksak)

> Format Bab 17.2: **eksak, tanpa `^`**. Nilai = versi terpasang di `package-lock.json`
> (`lockfileVersion: 3`), diverifikasi 2026-09-17 — **14/14 cocok**. **Dilarang
> menaikkan/menambah** tanpa ADR.

### Dependencies

```
react: 18.3.1
react-dom: 18.3.1
react-router-dom: 6.30.4
lucide-react: 0.344.0
pdfjs-dist: 4.10.38
xlsx: 0.18.5
@heyputer/puter.js: 2.5.4
```

### devDependencies

```
vite: 5.4.21
@vitejs/plugin-react: 4.7.0
tailwindcss: 3.4.19
postcss: 8.5.16
autoprefixer: 10.5.2
@types/react: 18.3.31
@types/react-dom: 18.3.7
```

**Sprint ini menambah 0 dependency baru.** Pasang dengan `npm ci` (hormati lockfile).

⚠️ **Status `package.json` saat ini (terukur 2026-09-17):** keempat belas paket masih
dideklarasikan dengan caret — `react: ^18.2.0`, `vite: ^5.1.4`, `tailwindcss: ^3.4.1`, dst.
Lockfile sudah memuat versi di atas, jadi `npm ci` aman, tetapi `npm install` dapat
menaikkan versi. **Task 1.11** menyamakan deklarasi jadi eksak. Versi **tidak berubah** —
hanya bentuk deklarasinya.

⚠️ **Pengecualian diketahui:** `xlsx@0.18.5` — temuan **F1 TINGGI** (prototype pollution
GHSA-4r6h-8v6p-xvw6 + ReDoS GHSA-5pgg-2g8v-p4x9, **tanpa fix**). Keputusan masih OPEN di
`QUESTIONS.MD`. Mitigasi: parsing **hanya** atas file yang dipilih user. **Wajib selesai
sebelum deploy publik pertama.** Versi tidak boleh diubah di sprint ini.

## Task Breakdown (2–5 menit per task)

### FASE 1 — Fondasi data pejabat (blocker, jalur kritis)

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 1.1 | Buat `PEJABAT_ROLES` 6 peran (`ks`, `bendahara`, `pengawas`, `sekdik`, `ketuaGugus`, `notulen`) | `utils/pejabatRoles.js` (baru) | 4 m |
| 1.2 | Tambah `DEFAULT_PEJABAT` + `mergePejabat(stored)` (deep-merge per peran) | `utils/pejabatRoles.js` | 4 m |
| 1.3 | Tambah helper `findFieldByLabel(allFields, regex)` | `utils/sekolahData.js` | 3 m |
| 1.4 | `getSchoolData()`: resolver `email`/`telepon`/`website` dari `allFields`; kembalikan `telepon`/`kelurahan`/`kodePos`; **hentikan** fallback `SEKOLAH_DEFAULTS` (baris 9–20, 37, 40–46) | `utils/sekolahData.js` | 5 m |
| 1.5 | Tambah `getPejabat(role)` + `getPejabatStatus()`; `getKepalaSekolah()`/`getBendahara()` **tanpa** fallback (hapus baris 22–30, 56, 59–60, 70, 73–74) | `utils/sekolahData.js` | 4 m |
| 1.6 | Hapus export konstanta basi `SEKOLAH_DEFAULT`/`KEPALA_SEKOLAH`/`BENDAHARA` (baris 79–81) **dan `export default SEKOLAH_DEFAULT`** (baris 83 — terverifikasi **0 konsumen** import default) | `utils/sekolahData.js` | 2 m |
| 1.7 | `SIGNATURE_ROLES` → **`getSignatureRoles()`**; hapus panggilan level-modul (baris 8–9); `ketua-gugus` → `pejabat.ketuaGugus` (bukan Kepala Sekolah); `notulen` → `pejabat.notulen` (hapus `DEWI ERMIRAWATI` + NIP baris 29–30); **hapus juga `export default SIGNATURE_ROLES` baris 39** (D-4 — 0 konsumen, konsisten dengan task 1.6) | `utils/signatureRoles.js` | 5 m |
| 1.8 | Migrasi import `SEKOLAH_DEFAULT` → `getSchoolData()` (baris 5, 8) | `blocks/KopSurat.jsx` | 2 m |
| 1.9 | Migrasi `SIGNATURE_ROLES` → `getSignatureRoles()` (baris 12, 80, 122) | `blocks/SignatureFooter.jsx` | 3 m |
| 1.10 | Hapus fallback `\|\| roleConfig.defaultName` (nilai kosong → render kosong) **+ bersihkan blok komentar referensi baris 9** (memuat `BADRUDDIN` / `DEDE GUNAWAN`, sudah basi — T-02 ketat menuntut 0 kemunculan) | `blocks/SignatureFooter.jsx` | 3 m |
| 1.11 | **Pin 14 dependency jadi eksak** (hapus `^`), nilai = lockfile. **Tidak menaikkan versi** | `package.json` | 3 m |
| 1.12 | **GATE FASE 1:** `npm ci` bersih + `npm run build` + uji 6 konsumen × 2 kondisi data | — | 5 m |

### FASE 2 — Halaman Data Sekolah

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 2.1 | Import `PEJABAT_ROLES` dari modul bersama; hapus definisi lokal | `DataSekolahPage.jsx` | 3 m |
| 2.2 | Load: `mergePejabat()` saat membaca `data_sekolah` | `DataSekolahPage.jsx` | 3 m |
| 2.3 | Warna kartu pakai `role.key`, bukan `idx === 0/1/2/else`; gradient → blue/slate | `DataSekolahPage.jsx` | 4 m |
| 2.4 | Tambah input **Data Gugus** (`gugusNama`, `gugusAlamat`) | `DataSekolahPage.jsx` | 5 m |
| 2.5 | Import `PEJABAT_ROLES` bersama; hapus definisi lokal + `defaultPejabat` | `PejabatSekolahPage.jsx` | 3 m |
| 2.6 | Load: `mergePejabat()` saat membaca `pejabat` | `PejabatSekolahPage.jsx` | 3 m |
| 2.7 | Gradient kartu (emerald/violet/amber) → blue/slate | `PejabatSekolahPage.jsx` | 3 m |
| 2.8 | **GATE FASE 2:** build + uji tambah peran ke-6 pada data LAMA | — | 5 m |

### FASE 3 — Kop sekolah & kop gugus

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 3.1 | Logo sekolah di pojok **kiri atas** (dari `spj_logo_sekolah`) | `blocks/KopSurat.jsx` | 4 m |
| 3.2 | Logo dinas di pojok **kanan atas** (dari `spj_logo_dinas`) | `blocks/KopSurat.jsx` | 4 m |
| 3.3 | Baris "PEMERINTAH KABUPATEN …" (literal baris 13) / "DINAS PENDIDIKAN" dari `kabupaten`/`provinsi` | `blocks/KopSurat.jsx` | 3 m |
| 3.4 | `gugusNama` (baris 12) + `gugusAlamat` (baris 15) → **wajib dari prop `data`**, hapus literal. **Blok TIDAK membaca storage sendiri** | `blocks/KopGugus.jsx` | 3 m |
| 3.5 | Logo gugus dari `spj_logo_gugus` | `blocks/KopGugus.jsx` | 3 m |
| 3.6 | Baris 9 `PEMERINTAH KABUPATEN BANDUNG BARAT` → dari `kabupaten`/`provinsi` lewat prop `data` | `blocks/KopGugus.jsx` | 3 m |

### FASE 4 — Nol hardcode identitas + auto-fill pejabat ⚠️ DIREVISI v3 (D-1, D-2, D-3, D-6)

> **Urutan wajib:** 4.1 (auto-fill) dikerjakan **lebih dulu**, lalu 4.2–4.19 (hapus literal),
> **satu commit**. Membalik urutan = dokumen tercetak dengan TTD kosong.
>
> **Dua kelas literal — jangan disamakan (D-2):**
>
> | Kelas | Bentuk | Perilaku | Cara bersihkan |
> |---|---|---|---|
> | **A — fallback cetak** | `{data.X \|\| 'NAMA'}` inline di JSX, atau `\|\| 'NAMA'` di assembly data cetak | **benar-benar tercetak** saat data kosong | **hapus `\|\| 'NAMA'`** → render kosong, `<PeringatanData/>` yang memberi tahu |
> | **B — placeholder** | argumen `ph` pada helper `val(key, ph)` / `F(label, key, ph)` / `<Field placeholder="…">` | `SPDForm.val` → tercetak sebagai `[ ph ]`; `SuratTugas.F` → **tidak** tercetak (print pakai `label`); `<Field>` → tab editor saja | ganti **label generik** (`'Nama Pengguna Anggaran'`). **JANGAN** `getSchoolData().namaSekolah` — nanti field kosong mencetak `[ Kepala SD Negeri X ]`, nama asli muncul di dalam kurung siku |
>
> **Cakupan terukur (T-02, 15 pola, `grep -rniE`): 73 baris / 15 file.** Semua baris di
> bawah **wajib** tertaut task; tidak ada yang boleh tersisa di gate 4.20.

| ID | Task | File disentuh | Kelas | Estimasi |
|---|---|---|---|---|
| 4.1 | **Auto-fill pejabat**: `getSignatureRoles()` mengisi `namaPenandatangan`/`nipPenandatangan`/`namaMengetahui`/`nipMengetahui`/`namaKetuaGugus`/`nipKetuaGugus` untuk spt/sppd/undangan (pengganti `defaults` yang dikosongkan 4.2–4.5) | `DokumenFormPreview.jsx` | — | 5 m |
| 4.2 | Kosongkan `spt.defaults` nama+NIP (baris 324, 325, 327, 328) | `data/templateConfig.js` | A | 3 m |
| 4.3 | Kosongkan `surat_tugas.defaults` nama+NIP (baris 352, 353, 355, 356) | `data/templateConfig.js` | A | 2 m |
| 4.4 | Kosongkan `undangan_gugus.defaults` nama+NIP (baris 377, 378) | `data/templateConfig.js` | A | 2 m |
| 4.5 | Kosongkan `sk_honorer.defaults` nama+NIP (baris 914, 915) — rantai data-driven sudah ada di `SKHonorer.jsx:230` | `data/templateConfig.js` | A | 2 m |
| 4.6 | **BARU (D-1)** `notulen.defaults.tempat` (baris 51) → `''` | `data/templateConfig.js` | A | 2 m |
| 4.7 | **BARU (D-1)** `sppd.defaults.pengguna` (baris 295) → `''` | `data/templateConfig.js` | A | 2 m |
| 4.8 | **BARU (D-3)** `bku.defaults.npsn` (baris 957, `'20212345'` — **bertentangan** dengan `sekolahData` `'20228636'`) + `namaSekolah` (baris 958) → **dari Data Sekolah** lewat `getSchoolData()`, bukan literal | `data/templateConfig.js` | A | 4 m |
| 4.9 | Hapus 6 fallback TTD **cetak** (baris 156–157, 178–179, 191–192) | `blocks/SPDForm.jsx` | A | 4 m |
| 4.10 | **DIKOREKSI (D-2)** 4 argumen `ph` pada `val()` (baris 57, 76, 96, 166) → **label generik**. Baris 57 = `'Nama Pengguna Anggaran'`, 76 = `'Jabatan / instansi'`, 96 & 166 = `'Tempat berangkat'`. **Bukan** `getSchoolData().namaSekolah` | `blocks/SPDForm.jsx` | B | 4 m |
| 4.11 | Hapus 4 fallback TTD **cetak** (baris 103–104, 110–111) | `blocks/SuratTugas.jsx` | A | 3 m |
| 4.12 | **DIPECAH (D-2)** placeholder **edit-only** baris 65 (`F('Nama','namaPenandatangan','BADRUDDIN, S.Ag.')`) + komentar referensi baris 15 → generik. ⚠️ `F()` print mode memakai **`label`**, bukan `ph` — baris 65 **tidak pernah tercetak**, sifatnya beda dari 4.11 | `blocks/SuratTugas.jsx` | B | 2 m |
| 4.13 | Hapus fallback TTD (baris 216–217) **+ komentar referensi baris 12** | `blocks/SuratUndangan.jsx` | A + B | 2 m |
| 4.14 | **DIPERLUAS (D-6)** `SKHonorer.jsx` memuat **identitas sekolah kedua**. Bersihkan **9 baris** (= 9 baris `SKHonorer` di baseline T-02), semua dari `getSchoolData()` / `getKepalaSekolah()`, hapus `\|\|`: **94** (`PEMERINTAH KABUPATEN BANDUNG BARAT` → `kabupaten`/`provinsi`), **96** (`'SD NEGERI PASIRHALANG'` + `'CIKALONGWETAN'`), **100** (`'Kp. Pasirhalang RT 03/014 Ds. Mandalamukti …'` → `sekolah.alamat`), **117** (`'SEKOLAH DASAR NEGERI PASIRHALANG'`), **142** (`'Yuniarti, S.Pd'`), **144** (NIP `196607071986102005`), **150** (`'SD Negeri Pasirhalang'`), **227** (`'SDN Pasirhalang'`) **+ komentar baris 5**. ⚠️ Baris 225 `mode === 'print'` → **semuanya benar-benar tercetak**. ⚠️ **Baris 98 `DINAS PENDIDIKAN` TIDAK disentuh** — nama instansi tetap, identik dengan `KopSurat.jsx:16` & `templateSuratHelper.js:486`, tidak terjaring T-02; membersihkannya hanya di sini bikin kop SK Honorer beda bentuk dari kop lain | `blocks/SKHonorer.jsx` | A | 6 m |
| 4.15 | Hapus fallback **cetak** nama sekolah (baris 1496, 1641) **+ BARU (D-1) baris 1669** (`resumeData.tempat`) | `DokumenFormPreview.jsx` | A | 3 m |
| 4.16 | Ganti **placeholder form** jadi generik: nama+NIP orang (baris 493, 511, 512, 718, 719) **+ BARU** nama sekolah mixed-case (baris 498, 577, 604, 1032, 1047) | `DokumenFormPreview.jsx` | B | 4 m |
| 4.17 | Placeholder baris 11 → generik | `blocks/InfoKeuangan.jsx` | B | 2 m |
| 4.18 | **DIPERLUAS** komentar JSDoc **baris 22–23** (`SD Negeri Pasirhalang \| NPSN: 123456` + `Kepsek: Yuniarti \| Bendahara: Susanto`) → placeholder generik | `utils/dataContextBuilder.js` | komentar | 2 m |
| 4.19 | **BARU (D-1)** komentar contoh: `guruTendikParser.js:97` (`// "SD NEGERI PASIRHALANG"`) + `TabelLetterHeader.jsx:8` (diagram ASCII `SD Negeri Lebakleungsir`) → generik. **Bukan hardcode fungsional**, tetapi T-02 **tidak memberi pengecualian komentar** | `utils/guruTendikParser.js` · `blocks/TabelLetterHeader.jsx` | komentar | 3 m |
| 4.20 | **GATE FASE 4:** `npm run build` + **T-02 → 0 hasil** (15 pola, `grep -rniE`) + **T-12: verifikasi TTD SPT/SPD/Undangan TERISI dari Data Sekolah, bukan kosong** + **verifikasi SK Honorer mencetak nama sekolah yang BENAR** | — | — | 5 m |

> **Baris yang TIDAK disentuh Fase 4 (sengaja, jangan dianggap terlewat):**
> - `KopSurat.jsx:13` + `KopGugus.jsx:9` (`PEMERINTAH KABUPATEN BANDUNG BARAT`) → sudah
>   dikerjakan **task 3.3 dan 3.6** di FASE 3. T-02 memverifikasinya.
> - `SignatureFooter.jsx:9` (komentar) → **task 1.10**. `sekolahData.js` 10/11/23/24/28/29
>   → **task 1.4/1.5**. `signatureRoles.js` 29/30 → **task 1.7**.
> - **Literal tempat/tanggal** (`'Cikalongwetan'` di `SignatureFooter.jsx:17`,
>   `'Cikalongwetan, ...'` di `SuratTugas.jsx:107`, `'Cikalongwetan'`/`'Kec. Cikalongwetan
>   Kab. Bandung Barat'` di `templateConfig.js:294/296/299`) → **DI LUAR CAKUPAN**
>   (batas scope REQUIREMENTS §Batasan, tercatat OPEN di `QUESTIONS.MD`).
> - **`data/mockData.js`** (6 hit `Mandalamukti`) → data demo fiktif untuk widget dashboard.
>   `seedMockData()` **tidak** menulis `spj_data_sekolah` (terverifikasi) → **DI LUAR CAKUPAN**,
>   dan karena itu pola T-02 **tidak** memakai `Mandalamukti`.
> - **`sourceFile: '/templates/…SDN lebakleungsir.xlsx'`** (11× di `templateConfig.js`) →
>   path aset nyata, huruf kecil. T-02 **terverifikasi tidak menjaringnya**
>   (`grep -rniE … \| grep -i sourceFile \| wc -l` → **0**). **JANGAN di-rename.**
> - `blocks/NomorSuratPopup.jsx:18` (`'SDN-PSR'`) → di luar cakupan, `QUESTIONS.MD`.

### FASE 5 — Peringatan data kosong

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 5.1 | Buat banner merah, 2 varian pesan + tautan aksi, `print:hidden` | `blocks/PeringatanData.jsx` (baru) | 5 m |
| 5.2 | Pasang saat `mode === 'edit'` (default `TemplateEngine.jsx:52`) → mencakup **semua** form template | `TemplateEngine.jsx` | 3 m |
| 5.3 | Pasang di area tab Perjalanan Dinas (spt/sppd/undangan) — tab itu merender `mode="print"` di layar | `DokumenFormPreview.jsx` | 4 m |
| 5.4 | Verifikasi: **tidak** muncul di hasil cetak; muncul di ≥1 template non-Perjalanan-Dinas | — | 3 m |

### FASE 6 — Gate akhir Sprint 001

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 6.1 | Regresi 6 konsumen × 2 kondisi data | — | 5 m |
| 6.2 | **GATE AKHIR:** `npm run build` + smoke-test render halaman Data Sekolah + T-02 grep final | — | 5 m |
| 6.3 | Perbarui `STATE.MD` + pack sprint + tutup loop | — | 4 m |

### Jalur kritis

```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6
FASE 3, 4, 5 masing-masing hanya butuh FASE 1, tetapi dikerjakan berurutan (lebih aman)
DI DALAM FASE 4: 4.1 (auto-fill) → 4.2…4.19 (hapus literal) → 4.20 (gate)
```

> **Aturan commit:**
> - langkah **1.3–1.10 wajib satu commit** — menghapus konstanta basi tanpa memigrasi
>   konsumennya akan mematahkan build.
> - langkah **4.1–4.19 wajib satu commit** — auto-fill dan penghapusan literal tidak boleh
>   terpisah, atau ada commit di antaranya yang mencetak dokumen bertanda tangan kosong.
>   **Khusus D-6:** 4.14 (SKHonorer) tidak boleh di-commit sebelum 4.8 (`bku.defaults`),
>   karena keduanya menyentuh identitas sekolah yang sama dari arah berbeda.
> - `package.json` (1.11) boleh commit terpisah, **tanpa** `package-lock.json` berubah.

## Anggaran Panjang File

Batas `CONSTITUTION.md`: komponen **300** · utility **200** · config **150** baris.

| File | Baris (terukur) | Catatan |
|---|---|---|
| `utils/sekolahData.js` | 83 | ✅ masih di bawah batas |
| `utils/signatureRoles.js` | 39 | ✅ |
| `utils/pejabatRoles.js` | — (baru) | wajib ≤ 200 |
| `blocks/PeringatanData.jsx` | — (baru) | wajib ≤ 300 |
| `blocks/KopSurat.jsx` | 29 | ✅ |
| `blocks/KopGugus.jsx` | 18 | ✅ |
| `blocks/SignatureFooter.jsx` | 163 | ✅ |
| `components/templates/TemplateEngine.jsx` | 108 | ✅ |
| `pages/dashboard/PejabatSekolahPage.jsx` | 245 | ✅ (dekat batas — jangan tambah signifikan) |
| `blocks/SPDForm.jsx` | 196 | ✅ (dekat batas — 4.10 mengganti nilai, tidak menambah baris) |
| `blocks/SuratTugas.jsx` | 115 | ✅ |
| `blocks/SuratUndangan.jsx` | 240 | ✅ (dekat batas) |
| `blocks/SKHonorer.jsx` | 240 | ⚠️ dekat batas 300 — task 4.14 menyentuh **9 baris**; wajib mengganti nilai, **bukan** menambah blok. Bila butuh helper, ekstrak ke file baru |
| `blocks/InfoKeuangan.jsx` | 171 | ✅ |
| `blocks/TabelLetterHeader.jsx` | 154 | ✅ — perubahan **hanya 1 baris komentar** |
| `utils/guruTendikParser.js` | **255** | ⚠️ 1,3× batas utility (legacy) — perubahan **hanya 1 baris komentar**, logika parser tidak disentuh |
| `utils/dataContextBuilder.js` | **454** | ⚠️ 2,3× batas utility (legacy) — perubahan **hanya 2 baris komentar** (22–23), tidak menambah panjang |
| `pages/dashboard/DataSekolahPage.jsx` | **827** | ⚠️ 2,7× batas (legacy) — DILARANG menambah panjang secara signifikan |
| `data/templateConfig.js` | **993** | ⚠️ 6,6× batas (legacy) — perubahan **hanya nilai literal**, bukan struktur |
| `components/templates/DokumenFormPreview.jsx` | **1847** | ⚠️ legacy 6× batas — pemecahan penuh **di luar cakupan** |

**Kebijakan:** DILARANG menambah panjang file legacy secara signifikan — kode baru
diekstrak ke file komponen tersendiri. File baru wajib patuh batas. Perubahan FASE 4 di
file legacy bersifat **mengganti nilai**, bukan menambah baris; `templateConfig.js` bahkan
**menyusut** karena `defaults` dikosongkan.


# ACCEPTANCE CRITERIA — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dijalankan dari root proyek `D:\project\spj-app` kecuali disebut lain.
> Bukti = output asli / screenshot, **bukan klaim** (AGENTS.MD).
>
> **REVISI 2026-09-17 (v3)** — hasil dry run Fase 1 + Fase 4. T-02 diperketat lagi:
> **11 → 15 pola** (+2 NPSN, +`Pasirhalang`, +`PEMERINTAH KABUPATEN`), **wajib `grep -i`**,
> baseline **57 → 73 baris / 15 file**, dan cakupan diverifikasi **per baris** bukan per file.
> Ditambah **T-14** (SK Honorer mencetak identitas sekolah yang benar — guard D-6).
> Test case **13 → 14** · checklist **13 → 14**.
>
> **REVISI 2026-09-17 (v2)** — T-02 jadi **0 hasil mutlak** (tanpa pengecualian "komentar
> tidak dihitung"), diperluas ke NIP + `Yuniarti` + nama sekolah. Ditambah **T-12** (guard
> regresi auto-fill TTD) dan **T-13** (pin `package.json`).

---

## Definisi "Selesai"

Sprint ini dianggap **SELESAI** jika **seluruh** checklist di bawah tercentang
**dan** seluruh test case (T-01 … T-14) lulus **dan** kedua skenario edge case lulus.

---

## Checklist

- [ ] C-01 Pejabat dari Data Sekolah (6 peran), tanpa hardcode (T-02, T-03)
- [ ] C-02 Kop sekolah dari tab Data Sekolah + logo kiri/kanan atas (T-08)
- [ ] C-03 Kop gugus dari Data Sekolah (Nama Gugus + Alamat Gugus + kabupaten) (T-09)
- [ ] C-04 Data kosong → field kosong + peringatan merah (2 varian pesan) (T-05, T-06)
- [ ] C-05 Nilai tidak basi setelah ubah Data Sekolah tanpa reload (T-07)
- [ ] C-06 Data lama tidak menyebabkan crash saat peran baru ditambahkan (T-04)
- [ ] C-07 Regresi 6 konsumen existing lulus (T-11)
- [ ] C-08 Warna blue-only pada file yang disentuh (T-10)
- [ ] C-09 `npm run build` sukses (T-01)
- [ ] C-10 **Nol hardcode identitas mutlak** — 15 pola, `grep -i`, 73 → 0 baris (T-02)
- [ ] C-11 **TTD SPT/SPD/Undangan tetap terisi** dari Data Sekolah, tidak kosong (T-12)
- [ ] C-12 `package.json` pinned eksak + `npm ci` bersih (T-13)
- [ ] C-13 `STATE.MD` + pack sprint diperbarui
- [ ] C-14 **SK Honorer satu identitas** — nama/alamat/kabupaten/NPSN sama dengan Data Sekolah, tidak ada `Pasirhalang` (T-14)

---

## Test Cases

### T-01 — Build sukses
- **Given** perubahan kode selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0** dan output berakhir dengan `✓ built in …`
- **Bukti** tempel output terminal asli

### T-02 — Nol hardcode identitas mutlak (gate utama sprint ini) ⚠️ DIPERKETAT v3
- **Given** seluruh task FASE 1, FASE 3 dan FASE 4 selesai
- **When**
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src
  ```
  ⚠️ **Flag `-i` wajib.** Tanpa `-i`, `SD NEGERI PASIRHALANG` (baris 96, 117) dan
  `SD Negeri Lebakleungsir` (mixed-case di placeholder/komentar) **lolos** — ini persis
  cara D-6 bersembunyi dari pack v2.
- **Then** **0 hasil** — tanpa pengecualian. Komentar referensi, placeholder form, dan
  `templateConfig.defaults` **semuanya ikut dihitung**; tidak ada klausul "kemunculan di
  komentar tidak dihitung"
- **Bukti** output grep asli (harus kosong) + `echo $?` = **1** (grep tidak menemukan apa pun)
- **Catatan cakupan — 15 pola:**
  - 5 nama orang: `BADRUDDIN`, `WAHYUDIN`, `DEWI ERMIRAWATI`, `DEDE GUNAWAN`, `Yuniarti`
  - **5 NIP**: `197405082014121002`, `197912222014121003`, `198507172020121003`,
    `196607071986102005`, `197607242022212011`
  - **2 NPSN** (D-3): `20212345` (`templateConfig.bku`), `20228636` (`sekolahData`)
  - 2 nama sekolah: `SD NEGERI LEBAKLEUNGSIR`, `Pasirhalang` (D-6)
  - 1 literal kabupaten (F-4): `PEMERINTAH KABUPATEN`
- **Yang SENGAJA tidak jadi pola** (dan karenanya tidak boleh "diperbaiki" Builder):
  - `Mandalamukti` → hanya ada di `data/mockData.js` (data demo fiktif, di luar cakupan).
    Kemunculan di `SKHonorer.jsx:100` ikut terhapus karena satu baris dengan `Pasirhalang`.
  - `Cikalongwetan` / literal tempat-tanggal → di luar cakupan (REQUIREMENTS §Batasan,
    OPEN di `QUESTIONS.MD`). Kemunculan di `SKHonorer.jsx:96/100` ikut terhapus sebagai
    efek samping 4.14, tetapi `SignatureFooter.jsx:17` dan `SuratTugas.jsx:107` **dibiarkan**.
  - `SDN-PSR` (`NomorSuratPopup.jsx:18`) → di luar cakupan.
- **Verifikasi wajib sebelum gate:** aset tidak ikut terjaring —
  ```bash
  grep -rniE "<15 pola di atas>" spj-frontend/src | grep -i "sourceFile" | wc -l   # → 0
  ```
  Bila hasilnya **≠ 0**, berarti pola terlalu longgar dan 11 path
  `/templates/…SDN lebakleungsir.xlsx` akan menuntut rename aset nyata. **Terukur 0**
  pada 2026-09-17.
- **Baseline terukur 2026-09-17 v3** (sebelum implementasi) — **73 baris di 15 file**.
  Inilah yang harus jadi **0**. Cakupan **per baris**, bukan per file (pelajaran D-1/D-6:
  file-nya ada di daftar ubah, tetapi barisnya tidak tertaut task apa pun):

  | File | Hit | Baris | Task |
  |---|---|---|---|
  | `data/templateConfig.js` | 16 | 51 · 295 · 324 325 327 328 · 352 353 355 356 · 377 378 · 914 915 · 957 958 | 4.6 · 4.7 · 4.2 · 4.3 · 4.4 · 4.5 · **4.8** |
  | `components/templates/DokumenFormPreview.jsx` | 13 | 1496 1641 **1669** · 493 498 511 512 577 604 718 719 **1032 1047** | **4.15** · **4.16** |
  | `blocks/SPDForm.jsx` | 10 | 156 157 178 179 191 192 · 57 76 96 166 | 4.9 (A) · **4.10 (B)** |
  | `blocks/SKHonorer.jsx` | 9 | **5 94 96 100 117** · 142 144 · **150 227** | **4.14 (D-6)** |
  | `utils/sekolahData.js` | 6 | 10 11 23 24 28 29 | 1.4 · 1.5 |
  | `blocks/SuratTugas.jsx` | 6 | 103 104 110 111 · 15 65 | 4.11 (A) · **4.12 (B)** |
  | `blocks/SuratUndangan.jsx` | 3 | 216 217 · 12 | 4.13 |
  | `utils/signatureRoles.js` | 2 | 29 30 | 1.7 |
  | `utils/dataContextBuilder.js` | 2 | **22** 23 | **4.18** |
  | `blocks/KopSurat.jsx` | 1 | 13 | **3.3** (FASE 3) |
  | `blocks/KopGugus.jsx` | 1 | 9 | **3.6** (FASE 3) |
  | `blocks/SignatureFooter.jsx` | 1 | 9 | 1.10 |
  | `blocks/InfoKeuangan.jsx` | 1 | 11 | 4.17 |
  | `utils/guruTendikParser.js` | 1 | **97** | **4.19** |
  | `blocks/TabelLetterHeader.jsx` | 1 | **8** | **4.19** |
  | **Total** | **73** | **15 file** | |

  Baris **tebal** = ditambahkan/diperbaiki di v3 (D-1, D-2, D-3, D-6). Total baris baru
  yang v2 lewatkan: **16** (73 − 57).
- **Riwayat gate ini:** v1 mencari nama saja → F-1 lolos. v2 (11 pola, 57 baris) → D-1,
  D-3, D-6 lolos karena (a) cakupan diverifikasi **per file** bukan per baris, dan
  (b) pola case-sensitive. v3 menutup keduanya.

### T-03 — Email terbaca dari Data Sekolah
- **Given** `spj_data_sekolah.allFields` memuat entri `{ label: "Email", value: "x@y.z" }`
- **When** halaman detail dokumen dibuka dan kop dirender
- **Then** kop menampilkan `x@y.z` — **bukan** string kosong, **bukan** nilai default
- **Bukti** screenshot kop

### T-04 — Peran ke-6 tidak crash pada data lama
- **Given** `spj_data_sekolah` bentuk LAMA (hanya `ks`, `bendahara`, `pengawas`, `sekdik`)
- **When** buka **Data Sekolah → tab Pejabat Sekolah**
- **Then** halaman ter-render, **6 kartu** tampil, console **tanpa** error
  `Cannot read properties of undefined`
- **Bukti** screenshot + console bersih

### T-05 — Data sekolah kosong → kosong + peringatan
- **Given** `spj_data_sekolah` **tidak ada** di localStorage
- **When** buka halaman detail dokumen
- **Then** (a) kop **kosong**, (b) field pejabat **kosong**, (c) muncul **peringatan merah**
  berisi teks *"upload data sekolah terlebih dahulu"* beserta arah ke tab Data Sekolah,
  (d) pencetakan **tidak diblokir**
- **Bukti** screenshot

### T-06 — Data parsial → peringatan pejabat
- **Given** identitas sekolah **terisi**, tetapi `pejabat.ks` dan `pejabat.bendahara` **kosong**
- **When** buka halaman detail dokumen
- **Then** peringatan merah **menyebut peran yang kosong** (bukan pesan upload data sekolah),
  dan kop **tetap terisi** dari identitas sekolah
- **Bukti** screenshot

### T-07 — Nilai tidak basi (bug nilai basi hilang)
- **Given** aplikasi terbuka di halaman Data Sekolah
- **When** ubah `namaSekolah` → simpan → buka dokumen **tanpa reload halaman**
- **Then** kop menampilkan **nama baru**
- **Bukti** screenshot sebelum & sesudah
- **Catatan** sumber bug: `sekolahData.js:79-83` (konstanta level-modul) dan
  `signatureRoles.js:8-9` (pemanggilan `getKepalaSekolah()` saat import)

### T-08 — Kop sekolah memuat logo
- **Given** `spj_logo_sekolah` dan `spj_logo_dinas` terisi
- **When** print preview dokumen dibuka
- **Then** logo sekolah tampil di **pojok kiri atas**, logo dinas di **pojok kanan atas**,
  tata letak tidak rusak
- **Bukti** screenshot

### T-09 — Kop gugus dari Data Sekolah
- **Given** `gugusNama`, `gugusAlamat`, `kabupaten`, `provinsi` terisi di Data Sekolah
- **When** print preview dokumen bergugus dibuka
- **Then** kop menampilkan nilai isian tersebut pada **ketiga baris** — kabupaten (baris 9),
  nama gugus (baris 12), alamat gugus (baris 15); **tidak ada** literal
  `'GUGUS KI HAJAR DEWANTARA'`, `'PEMERINTAH KABUPATEN BANDUNG BARAT'`, maupun alamat
  sekretariat hardcoded
- **And** nilai sampai ke blok **lewat prop `data`** — `KopGugus.jsx` tidak memanggil
  `storageHelper`/`localStorage` sendiri
- **Bukti** screenshot + `grep -n "storageHelper\|localStorage" spj-frontend/src/components/templates/blocks/KopGugus.jsx` = **0 hasil**

### T-10 — Blue-only pada file yang disentuh
- **Given** file yang disentuh sprint ini
- **When**
  ```bash
  grep -rn "emerald\|amber\|violet\|rose\|cyan" \
    spj-frontend/src/pages/dashboard/DataSekolahPage.jsx \
    spj-frontend/src/pages/dashboard/PejabatSekolahPage.jsx
  ```
- **Then** tidak ada kelas warna terlarang untuk elemen **non-status**
  (pengecualian sah: indikator status di layar, mis. banner peringatan merah)
- **Bukti** output grep + penjelasan tiap sisa kemunculan

### T-11 — Regresi 6 konsumen
- **Given** perubahan `sekolahData.js` + `signatureRoles.js` selesai
- **When** render: `blocks/KopSurat.jsx`, `blocks/SignatureFooter.jsx`, `blocks/SKHonorer.jsx`,
  `blocks/InfoKeuangan.jsx`, `dokumentasi/DokumentasiAIGenerate.jsx`, `utils/signatureRoles.js`
  — masing-masing pada kondisi data **terisi** dan **kosong**
- **Then** 12 kombinasi ter-render tanpa error; tidak ada nama orang lain muncul saat data kosong
- **Bukti** screenshot tiap konsumen (2 kondisi)
- **Catatan** daftar 6 konsumen terverifikasi 2026-09-17 via grep import `sekolahData` +
  `signatureRoles` — tidak ada konsumen ke-7

### T-12 — TTD SPT/SPD/Undangan tetap terisi (guard regresi FASE 4) ⚠️ BARU
- **Given** Data Sekolah → tab Pejabat Sekolah terisi (`ks`, `ketuaGugus`), dan
  `templateConfig.defaults` untuk `spt`/`sppd`/`undangan_gugus` **sudah dikosongkan**
- **When** buka dokumen **SPT**, **SPD**, dan **Undangan (Gugus)** → print preview
- **Then** nama + NIP penandatangan **tampil terisi** dari Data Sekolah pada ketiga dokumen —
  **bukan kosong**, **bukan** literal lama
- **And** setelah `pejabat.ketuaGugus` dikosongkan → TTD Undangan **kosong** + peringatan
  merah muncul (bukan jatuh ke `WAHYUDIN`)
- **Bukti** screenshot 3 dokumen (kondisi terisi) + 1 screenshot Undangan kondisi kosong
- **Mengapa wajib:** SPT/SPD/Undangan **tidak punya** rantai data-driven seperti SK Honorer
  (`SKHonorer.jsx:230` sudah `data.namaPihakKesatu || ks.nama`). Mengosongkan `defaults`
  tanpa auto-fill = **mengirim regresi** yang baru pulih di Sprint 002.

### T-13 — `package.json` pinned eksak ⚠️ BARU
- **Given** task 1.11 selesai
- **When**
  ```bash
  grep -nE '"(react|react-dom|react-router-dom|lucide-react|pdfjs-dist|xlsx|@heyputer/puter\.js|vite|@vitejs/plugin-react|tailwindcss|postcss|autoprefixer|@types/react|@types/react-dom)": *"\^' spj-frontend/package.json
  ```
- **Then** **0 hasil** — tidak ada deklarasi berawalan `^`
- **And** `cd spj-frontend && npm ci` exit code **0** dan `package-lock.json` **tidak berubah**
  (`git status --short spj-frontend/package-lock.json` kosong)
- **And** 14 versi di `package.json` **identik** dengan tabel `BLUEPRINT.MD` §Dependensi
- **Bukti** output grep + output `npm ci` + `git status` + `git diff --stat package.json`

### T-14 — SK Honorer satu identitas sekolah (guard D-6) ⚠️ BARU v3
- **Given** Data Sekolah terisi dengan **nama sekolah, alamat, kecamatan, kabupaten, NPSN**
  yang spesifik dan mudah dikenali (mis. `SD NEGERI UJI COBA` / `Kp. Uji Coba` / `99999999`)
- **When** buka dokumen **SK Honorer** → print preview, lalu cetak/PDF
- **Then** **keenam** lokasi ini menampilkan nilai Data Sekolah, bukan literal lama:
  1. kop baris `PEMERINTAH KABUPATEN …` (eks baris 94)
  2. kop baris nama sekolah + `KECAMATAN …` (eks baris 96)
  3. kop baris `Alamat : …` (eks baris 100)
  4. badan surat `ANTARA … <nama sekolah>` (eks baris 117)
  5. klausul `…untuk dan atas nama <nama sekolah>` (eks baris 150)
  6. blok TTD `Kepala <nama sekolah>,` (eks baris 227)
- **And** string `Pasirhalang`, `PASIRHALANG`, `Mandalamukti` **tidak muncul di mana pun**
  pada hasil cetak
- **And** buka dokumen **BKU** → NPSN yang tercetak = NPSN Data Sekolah, **bukan** `20212345`
- **And** setelah Data Sekolah dikosongkan → keenam lokasi **kosong** + peringatan merah,
  **bukan** jatuh kembali ke `SD NEGERI PASIRHALANG`
- **Bukti** screenshot print preview SK Honorer (kondisi terisi + kondisi kosong) +
  screenshot BKU (NPSN) + PDF hasil cetak
- **Mengapa wajib:** T-02 hanya membuktikan **literal hilang dari sumber**. T-14 membuktikan
  **nilai yang benar yang menggantikannya**. `SKHonorer.jsx` merender kop sendiri (bukan blok
  `KopSurat`) dan menyimpan identitas sekolah **kedua** — tanpa test ini, membersihkan
  literal bisa saja menggantinya dengan string kosong di dokumen resmi yang sudah beredar.

---

## Edge Case Scenarios

### E-1 — Data sekolah benar-benar kosong (empty input)
`localStorage` dibersihkan total (semua key `spj_` dihapus), lalu buka halaman detail dokumen.
**Harapan:** tidak ada crash, tidak ada nama orang lain, **tidak ada NIP orang lain**,
**tidak ada nama/alamat/NPSN sekolah lain** (`Pasirhalang`, `Mandalamukti`, `20212345`),
peringatan merah tampil, penomoran/tab tetap berfungsi, dan pencetakan tetap bisa dilakukan.

### E-2 — Data parsial (partial data)
Hanya `namaSekolah` terisi; `allFields` kosong; `pejabat` hanya `ks` terisi.
**Harapan:** kop menampilkan nama sekolah saja (alamat/email kosong tanpa placeholder aneh),
TTD hanya terisi untuk peran yang ada, peringatan merah menyebut **hanya** peran yang kosong,
dan `SD Negeri Cipada` / `Cikalongwetan` / `8 Mei 2026` **tetap** tampil (literal tempat &
tanggal = konten dokumen, **di luar cakupan** pembersihan sprint ini).

---

## Output yang Bisa Didemonstrasikan

1. Buka aplikasi → Data Sekolah → tab Data Sekolah → **upload Excel** profil sekolah
   → email & identitas terbaca (tanpa upload ulang, data lama pun terbaca).
2. Data Sekolah → tab Logo Sekolah → upload logo sekolah & logo dinas.
3. Data Sekolah → tab Pejabat Sekolah → isi 6 peran (termasuk **Ketua Gugus** & **Notulen**).
4. Data Sekolah → tab Data Sekolah → isi **Nama Gugus** + **Alamat Gugus**.
5. Buka dokumen apa pun → kop memuat identitas + logo, TTD memuat nama & NIP yang benar.
6. Buka **SPT / SPD / Undangan** → TTD **otomatis terisi** dari tab Pejabat Sekolah
   tanpa diketik manual (T-12).
7. Buka **SK Honorer** → kop, badan surat, dan blok TTD menampilkan **nama + alamat +
   kabupaten dari Data Sekolah** — tidak ada `Pasirhalang` / `Mandalamukti` (T-14).
8. Buka **BKU** → NPSN tercetak = NPSN Data Sekolah, bukan `20212345` (T-14).
9. Ubah nama sekolah → buka dokumen **tanpa reload** → nilai baru langsung tampil.
10. Hapus `spj_data_sekolah` → buka dokumen → peringatan merah muncul, kop & field kosong,
    pencetakan tetap bisa dilakukan.
11. Jalankan grep T-02 (15 pola, `-i`) → **kosong**, `echo $?` = **1**.

> **Bukan cakupan sprint ini:** struktur tab SPT/SPD/Undangan, penghapusan tab "Surat Tugas",
> print-area Perjalanan Dinas (3 blok SPD yang hilang, tembusan, kop → TTD), konsep dua wajah
> `<input>` vs cetak murni, reset data lama → diuji di
> `planning/sprints/sprint-002/ACCEPTANCE.MD`.


# HANDOFF PROMPT — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).
>
> **REVISI 2026-09-17 (v2)** — scope diperluas (keputusan user, lihat `DECISIONS.MD`):
> 5 fase → **6 fase**, 31 → 48 task, 9 → 17 file diubah, gate build 3× → **4×**.
>
> **REVISI 2026-09-17 (v3)** — hasil **dry run Fase 1 + Fase 4** terhadap kode nyata
> (temuan D-1 … D-6, keputusan user 2026-09-17): 48 → **53 task**, 17 → **19 file diubah**,
> 13 → **14 test case**, pola gate T-02 11 → **15**, baseline T-02 57 → **73 baris / 15 file**.
> Penyebab gate v2 **tidak bisa dicapai**: (a) cakupan diverifikasi **per file**, bukan
> **per baris** — file-nya ada di daftar ubah tetapi barisnya tidak tertaut task mana pun,
> dan (b) pola v2 **case-sensitive**, sehingga satu **identitas sekolah kedua**
> (`SD NEGERI PASIRHALANG`) lolos sepenuhnya. Rincian → `ACCEPTANCE.MD` T-02 "Riwayat gate ini".

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 001: Fondasi Data Sekolah & Pejabat.
Ini sprint FONDASI — tidak ada dokumen baru yang dibangun. Yang dibangun: satu sumber data
identitas sekolah & pejabat, kop berlogo, peringatan saat data belum diisi, dan
Pembersihan TOTAL nilai hardcoded (nama orang, NIP, identitas sekolah) dari src/.

LANGKAH WAJIB SEBELUM APA PUN — baca berurutan:
1. planning/sprints/sprint-001/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-001/BLUEPRINT.MD      — bagaimana (file, task, dependensi ter-pin)
3. planning/sprints/sprint-001/ACCEPTANCE.MD     — kriteria selesai + 14 test case
4. AGENTS.MD                                     — aturan umum proyek
5. STATE.MD                                      — status terkini
6. CONSTITUTION.md                               — aturan wajib + keamanan
7. DECISIONS.MD                                  — keputusan yang SUDAH dibuat (jangan putuskan ulang)
8. planning/sprints/sprint-001/DRYRUN-T1.md      — hasil dry run T1. ⚠️ SEBAGIAN BASI:
   ditulis sebelum revisi v3, jadi nomor task & daftar file di dalamnya bisa beda.
   Bila bertentangan dengan BLUEPRINT.MD → BLUEPRINT.MD yang menang.

LALU:
9.  Lakukan DRY RUN — simulasi tanpa menulis kode
10. Laporkan rencana: file yang akan disentuh, task yang dikerjakan, dependensi, risiko
11. TUNGGU persetujuan sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan
- Mengubah requirements (bila ada pertanyaan → tulis di QUESTIONS.MD, jangan berasumsi)
- Memakai library yang tidak tercantum di BLUEPRINT.MD (versi ter-pin, jangan menaikkan)
- Menaikkan versi dependency saat mengerjakan task 1.11 — yang diubah HANYA bentuk
  deklarasi (^ dihapus), nilainya tetap = lockfile
- Menyentuh file di luar daftar BLUEPRINT.MD ("File yang Akan Diubah", 19 file)
- Mengubah utils/sekolahParser.js (LABEL_MAP / handleFileUpload) — DI LUAR CAKUPAN
- Mengubah data/mockData.js — 6 hit `Mandalamukti` di sana data demo fiktif, dan
  `seedMockData()` terverifikasi TIDAK menulis `spj_data_sekolah`
- Mengubah 11× `sourceFile: '/templates/…SDN lebakleungsir.xlsx'` di templateConfig.js —
  itu path ASET NYATA. Jangan di-rename. (Sudah terverifikasi tidak terjaring gate T-02.)
- Mengubah blocks/NomorSuratPopup.jsx ('SDN-PSR' = kode penomoran, bukan identitas sekolah)
- Menyamakan literal Kelas A dan Kelas B. **Kelas A** = fallback cetak
  (`data.X || 'NAMA'`) → hapus `||`-nya. **Kelas B** = placeholder (argumen `ph` pada
  helper / prop `placeholder`) → ganti **label generik** (`'Nama Pengguna Anggaran'`),
  BUKAN `getSchoolData().namaSekolah`. Mengisi placeholder dengan nilai dinamis bikin
  field kosong mencetak `[ Kepala SD Negeri X ]` — nama asli muncul dalam kurung siku.
  Kolom "Kelas" di tabel FASE 4 BLUEPRINT.MD menandai tiap task.
- Menjalankan grep T-02 TANPA flag `-i`. `SD NEGERI PASIRHALANG` dan
  `SD Negeri Lebakleungsir` (mixed-case) hanya tertangkap dengan `-i` — persis cara
  identitas sekolah kedua bersembunyi dari pack v2.
- Menghapus `DINAS PENDIDIKAN` di SKHonorer.jsx:98 — nama instansi tetap, identik dengan
  KopSurat.jsx:16 dan templateSuratHelper.js:486, tidak terjaring T-02
- Menambah fallback hardcoded "supaya tidak kosong" — kop kosong adalah perilaku yang DIMINTA
- Mengosongkan templateConfig.defaults LEBIH DULU sebelum auto-fill pejabat (task 4.1)
  terpasang — urutan terbalik mencetak dokumen bertanda tangan kosong
- Membersihkan literal tempat/tanggal (Cikalongwetan, 8 Mei 2026, SD Negeri Cipada) —
  itu konten dokumen, DI LUAR CAKUPAN. (Pengecualian: `SKHonorer.jsx:96/100` ikut terhapus
  sebagai efek samping task 4.14 karena satu baris dengan `Pasirhalang` — itu memang diminta.)
- Memecah file legacy (DokumenFormPreview.jsx 1847 baris / templateConfig.js 993 baris)
- Mengubah struktur tab, print-area, atau <input> dokumen Perjalanan Dinas — itu Sprint 002
- Membuat KopGugus.jsx membaca localStorage sendiri — blok itu PROP-DRIVEN
- Memutuskan ulang tech stack (sudah terkunci ADR)
- Mengklaim hasil tanpa bukti — sertakan output build asli atau screenshot

SETUJU:
- Setelah dry run disetujui → kerjakan task sesuai urutan BLUEPRINT.MD (Fase 1 → 6)
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- HORMATI 2 aturan commit wajib: task 1.3–1.10 satu commit, task 4.1–4.19 satu commit
- Jalankan `npm run build` di setiap gate fase (Fase 1, 2, 4, dan gate akhir)
- Laporkan hasil dengan bukti untuk setiap gate
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 001 (fondasi) |
| User story | US-13 … US-18 (+ US-11 sebagian) |
| Jumlah fase | **6** |
| Jumlah task | **53** (12 · 8 · 6 · 20 · 4 · 3), tiap task 2–6 menit |
| File baru | 2 (`utils/pejabatRoles.js`, `blocks/PeringatanData.jsx`) |
| File diubah | **19** |
| Dependency baru | **0** (semua ter-pin, lihat BLUEPRINT.MD) |
| Perubahan `package.json` | pin 14 versi jadi eksak — **bukan** menaikkan versi |
| Gate build | **4×** (Fase 1, 2, 4, dan gate akhir Fase 6) |
| Test case | **14** (T-01 … T-14) + 2 edge case |
| Gate utama T-02 | **15 pola**, `grep -rniE` (**`-i` wajib**) — baseline **73 baris / 15 file** → wajib **0** |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 → 6 |
| Perkiraan urutan commit | 1) fondasi data + pin package.json (Fase 1, **task 1.3–1.10 wajib satu commit**) 2) halaman Data Sekolah 3) kop sekolah & gugus 4) **auto-fill + nol hardcode** (Fase 4, **task 4.1–4.19 wajib satu commit**) 5) peringatan 6) gate akhir + STATE.MD |
| Penerus | Sprint 002 — Rework Modul Perjalanan Dinas (`planning/sprints/sprint-002/`) |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen di **konteks segar** (AGENTS.MD: wajib)
2. `/state-keeper` — tutup loop, perbarui STATE.MD / DECISIONS.MD / RISKS.MD / QUESTIONS.MD
3. Lanjut ke **Sprint 002** (`planning/sprints/sprint-002/HANDOFF-PROMPT.MD`) —
   jangan mulai sebelum Sprint 001 selesai (kontrak fungsi belum ada)

---

## Peringatan untuk Builder

⚠️ **Task 1.3–1.10 wajib satu commit.** Menghapus konstanta basi
(`SEKOLAH_DEFAULT` / `KEPALA_SEKOLAH` / `BENDAHARA` / `export default` / `SIGNATURE_ROLES`)
tanpa memigrasi `blocks/KopSurat.jsx` dan `blocks/SignatureFooter.jsx` dalam commit yang sama
akan **mematahkan build**.

⚠️ **Task 4.1–4.13 wajib satu commit, dan 4.1 dikerjakan PERTAMA.** Ada **dua lapisan**
nilai default: `templateConfig.defaults` (lapisan otoritatif, di-spread
`DokumenFormPreview.jsx:1550,1591,1617,1632,1674`) dan literal `||` di blok cetak (lapisan sisa).
Mengosongkan `defaults` sebelum auto-fill `getSignatureRoles()` terpasang membuat **TTD
SPT/SPD/Undangan kosong** — regresi nyata yang terkirim ke user. T-12 menjaga ini.

⚠️ **`blocks/KopSurat.jsx` & `blocks/SignatureFooter.jsx` adalah blok SHARED** lintas
template. Perubahannya berdampak ke **semua** template — regresi T-11 wajib, bukan opsional.

⚠️ **Kop akan benar-benar kosong** saat Data Sekolah kosong — ini perilaku yang **diminta**
user (keputusan 2026-09-14), bukan bug. Jangan "memperbaiki"-nya dengan menambah fallback.

⚠️ **Jangan mengubah `utils/sekolahParser.js`.** Email dibaca dari `allFields` berdasarkan
label — justru supaya data yang sudah ter-upload langsung terbaca tanpa upload ulang.

⚠️ **Peringatan tidak boleh ikut cetak.** Dipasang hanya pada mode tampilan layar
(`TemplateEngine` mode `edit` + area tab Perjalanan Dinas), bukan di blok cetak.

⚠️ **Gate T-02 bersifat mutlak.** Grep harus menghasilkan **0 baris** — termasuk komentar
referensi (`SignatureFooter.jsx:9`, `SuratTugas.jsx:15`, `SuratUndangan.jsx:12`,
`dataContextBuilder.js:23`) dan placeholder form (`DokumenFormPreview.jsx:493,511,512,718,719`,
`InfoKeuangan.jsx:11`). Pack versi sebelumnya mengecualikan komentar; **revisi 2026-09-17
mencabut pengecualian itu.** Baseline terukur 2026-09-17: **57 baris di 11 file** —
rincian per file ada di `ACCEPTANCE.MD` T-02.

⚠️ **5 file tumpang tindih dengan Sprint 002** (`SPDForm`, `SuratTugas`, `SuratUndangan`,
`templateConfig.js`, `DokumenFormPreview.jsx`). Batas tegas: sprint ini mengganti **sumber
nilai** saja; **struktur & layout** milik Sprint 002. Jangan "sekalian" merapikan layout.


# Lampiran — Cross-Artifact Consistency Check

> Dikerjakan ulang **2026-09-17 (v3)** pasca dry run Fase 1 + Fase 4.
> Semua verdict didukung output perintah nyata (`grep` / `wc`), bukan klaim.
> Perintah dijalankan dari root repo `spj-app`.
>
> **Mengapa lampiran v2 (1143 baris, 2026-09-17 pagi) tidak dipakai:** check #5
> di versi itu dikerjakan **per file** (15 pola → 73 hit / 15 file hanya dicatat
> sebagai angka; baris-per-baris tidak diverifikasi ke task mana pun). Karena
> itu residual `templateConfig.js:51,295`, `DokumenFormPreview.jsx:1669`, dan
> seluruh identitas sekolah KEDUA di `SKHonorer.jsx` **lolos** — temuan D-1,
> D-2, D-3, D-6. Lampiran v3 memaksa check #5 **per baris**: setiap baris di
> baseline grep harus tertaut satu task bernama, bukan cukup file-nya terdaftar
> di daftar ubah.

---

## Check #1 — Cakupan user story

**Pertanyaan:** setiap user story yang diklaim REQUIREMENTS punya task di BLUEPRINT dan
test di ACCEPTANCE?

```
grep -oE "US-1[0-9]" planning/sprints/sprint-001/REQUIREMENTS.MD | sort -u
→ US-10 US-11 US-12 US-13 US-14 US-15 US-16 US-17 US-18
```

| US | Sumber | Task BLUEPRINT | Test ACCEPTANCE | Verdict |
|---|---|---|---|---|
| US-13 Data sekolah & pejabat | PRD | 1.1–1.10, 2.1–2.7 | T-03, T-04, T-07 | ✅ |
| US-14 Kop sekolah (logo + kabupaten) | PRD | 3.1–3.3 | T-08 | ✅ |
| US-15 Kop gugus | PRD | 3.4–3.6 | T-09 | ✅ |
| US-16 Data kosong → peringatan | PRD | 1.8–1.10, 4.1, 5.1–5.4, 6.2 | T-05, T-06, T-12 | ✅ |
| US-17 Regresi konsumen | PRD | 1.8–1.10, 6.1 | T-11 | ✅ |
| US-18 Dependency pinned | PRD | 1.11 | T-13 | ✅ |
| US-11 (sebagian) nol hardcode | perluasan F-1 + D-1/D-2/D-3/D-6 | 4.1–4.20 | T-02, T-12, T-14 | ✅ |
| US-10, US-12 | **referensi batas scope** — dikerjakan Sprint 002 | — | — | ✅ (bukan klaim) |

**Verdict check #1: LULUS** — 7 US punya rantai lengkap; US-10/US-12 muncul hanya
sebagai penanda batas scope, bukan klaim pengerjaan.

---

## Check #2 — Cakupan task

**Pertanyaan:** jumlah task di BLUEPRINT = angka yang diklaim dokumen lain? Setiap fase
punya gate?

```
grep -oE "^\| [0-9]+\.[0-9]+ " planning/sprints/sprint-001/BLUEPRINT.MD \
  | sed -E 's/^\| ([0-9]+)\..*/\1/' | sort -n | uniq -c
→  12 1
    8 2
    6 3
   20 4
    4 5
    3 6
TOTAL: 53
```

| Fase | Task | Gate | ID gate |
|---|---|---|---|
| 1 — Fondasi data pejabat | 12 | ✅ | 1.12 |
| 2 — Halaman Data Sekolah | 8 | ✅ | 2.8 |
| 3 — Kop sekolah & kop gugus | 6 | — (ikut gate 4.20) | — |
| 4 — Nol hardcode + auto-fill | 20 | ✅ | 4.20 |
| 5 — Peringatan data kosong | 4 | — (verifikasi 5.4) | 5.4 |
| 6 — Gate akhir | 3 | ✅ | 6.2 |

12 + 8 + 6 + 20 + 4 + 3 = **53**. Cocok dengan klaim `HANDOFF-PROMPT.MD` (53 task),
`STATE.MD` (53 task), Ringkasan Pack (53).

```
grep -nE "GATE FASE|GATE AKHIR" planning/sprints/sprint-001/BLUEPRINT.MD
→ 271 (1.12) · 284 (2.8) · 351 (4.20) · 372 (6.2)
```

**Verdict check #2: LULUS** — 53/53 task terhitung, 4 gate build teridentifikasi.

---

## Check #3 — Cakupan file (tidak ada file yatim)

**Pertanyaan:** setiap file di daftar "File yang Akan Diubah" benar-benar disentuh oleh
≥1 task? Ada task yang menyebut file di luar daftar?

19 file diubah + 2 file baru (`utils/pejabatRoles.js`, `blocks/PeringatanData.jsx`) = 21.

| # | File | Task yang menyentuh | Verdict |
|---|---|---|---|
| 1 | `utils/sekolahData.js` | 1.3, 1.4, 1.5, 1.6 | ✅ |
| 2 | `utils/signatureRoles.js` | 1.7, 1.8 | ✅ |
| 3 | `blocks/KopSurat.jsx` | 1.9, 3.1, 3.2, 3.3 | ✅ |
| 4 | `blocks/SignatureFooter.jsx` | 1.10 | ✅ |
| 5 | `pages/dashboard/DataSekolahPage.jsx` | 2.1–2.4 | ✅ |
| 6 | `pages/dashboard/PejabatSekolahPage.jsx` | 2.5–2.7 | ✅ |
| 7 | `blocks/KopGugus.jsx` | 3.4, 3.5, 3.6 | ✅ |
| 8 | `blocks/SPDForm.jsx` | 4.9 (A), 4.10 (B) | ✅ |
| 9 | `blocks/SuratTugas.jsx` | 4.11 (A), 4.12 (B) | ✅ |
| 10 | `blocks/SuratUndangan.jsx` | 4.13 | ✅ |
| 11 | `blocks/SKHonorer.jsx` | 4.14 | ✅ |
| 12 | `data/templateConfig.js` | 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 | ✅ |
| 13 | `DokumenFormPreview.jsx` | 4.1, 4.15, 4.16, 5.3 | ✅ |
| 14 | `TemplateEngine.jsx` | 5.2 | ✅ |
| 15 | `blocks/InfoKeuangan.jsx` | 4.17 | ✅ |
| 16 | `package.json` | 1.11 | ✅ |
| 17 | `utils/dataContextBuilder.js` | 4.18 | ✅ |
| 18 | `utils/guruTendikParser.js` | 4.19 | ✅ |
| 19 | `blocks/TabelLetterHeader.jsx` | 4.19 | ✅ |
| baru | `utils/pejabatRoles.js` | 1.1, 1.2 | ✅ |
| baru | `blocks/PeringatanData.jsx` | 5.1 | ✅ |

**0 file yatim.** File yang secara eksplisit **dilarang** disentuh (dan tidak punya task):
`utils/sekolahParser.js`, `data/mockData.js`, `blocks/NomorSuratPopup.jsx`,
`package.json` **root** (di luar `spj-frontend/`), `package-lock.json`.

**Verdict check #3: LULUS** — 21/21 file tertaut task, 0 yatim.

---

## Check #4 — Versi dependency ter-pin

**Pertanyaan:** versi di BLUEPRINT = versi terpasang di lockfile? Ada dependency baru?

BLUEPRINT §Dependensi memuat 7 dependencies + 7 devDependencies = **14 paket**, semuanya
eksak tanpa `^`. Verifikasi terhadap `spj-frontend/package-lock.json`
(`lockfileVersion: 3`) pada 2026-09-17: **14/14 cocok**.

Status `package.json` terukur:

```
grep -cE '": *"\^' spj-frontend/package.json
→ 14
```

Keempat belas paket masih caret (`react: ^18.2.0` vs lock `18.3.1`, `vite: ^5.1.4` vs
`5.4.21`, `tailwindcss: ^3.4.1` vs `3.4.19`, dst). **Task 1.11** menyamakan deklarasi;
versi tidak berubah. **T-13** mengunci: setelah 1.11, `grep -cE '": *"\^'` → 0 dan
`npm ci` tidak mengubah `package-lock.json`.

**Dependency baru: 0.** Pengecualian diketahui `xlsx@0.18.5` (F1 TINGGI, tanpa fix) —
versi **dibekukan** sprint ini, tercatat di `QUESTIONS.MD`, wajib selesai sebelum deploy
publik pertama.

**Verdict check #4: LULUS BERSYARAT** — 14/14 versi cocok, tetapi kecocokan baru berlaku
*setelah* task 1.11 dikerjakan. Syarat itu dikunci oleh T-13, bukan dibiarkan implisit.

---

## Check #5 — Gate T-02 **dapat dicapai per-baris** oleh daftar task sprint ⚠️ diperketat v3

**Pertanyaan (perketat):** T-02 v3 menuntut `grep -rniE "<15 pola>" spj-frontend/src`
→ **0 baris**. Apakah **setiap baris** di baseline terukur tertaut **satu task
bernama** di BLUEPRINT? Cukup file-nya terdaftar di daftar ubah **tidak cukup** —
itulah cara D-1/D-3/D-6 lolos di lampiran v2.

### 5a — Baseline terukur (15 pola, `-i`)

```
grep -rniE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src | wc -l
→ 73
```

### 5b — Per baris, per file, per task

| File | Baris | Task pembersih | Kelas | Verdict |
|---|---|---|---|---|
| `data/templateConfig.js` | 51 | **4.6** | A (default) | ✅ |
| `data/templateConfig.js` | 295 | **4.7** | A (default) | ✅ |
| `data/templateConfig.js` | 324–328 | 4.2 | A (default) | ✅ |
| `data/templateConfig.js` | 352–356 | 4.3 | A (default) | ✅ |
| `data/templateConfig.js` | 377–378 | 4.4 | A (default) | ✅ |
| `data/templateConfig.js` | 914–915 | 4.5 | A (default) | ✅ |
| `data/templateConfig.js` | **957** | **4.8** | A (default, NPSN) | ✅ |
| `data/templateConfig.js` | **958** | **4.8** | A (default) | ✅ |
| `DokumenFormPreview.jsx` | 1496 | **4.15** | A (fallback cetak) | ✅ |
| `DokumenFormPreview.jsx` | 1641 | **4.15** | A (fallback cetak) | ✅ |
| `DokumenFormPreview.jsx` | **1669** | **4.15** | A (fallback cetak) | ✅ |
| `DokumenFormPreview.jsx` | 493 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 498 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 511 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 512 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 577 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 604 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 718 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | 719 | **4.16** | B (placeholder) | ✅ |
| `DokumenFormPreview.jsx` | **1032** | **4.16** | B (placeholder, mixed-case) | ✅ |
| `DokumenFormPreview.jsx` | **1047** | **4.16** | B (placeholder, mixed-case) | ✅ |
| `blocks/SPDForm.jsx` | 57 | **4.10** | B (arg `ph` pada `val()`) | ✅ |
| `blocks/SPDForm.jsx` | 76 | **4.10** | B (arg `ph`) | ✅ |
| `blocks/SPDForm.jsx` | 96 | **4.10** | B (arg `ph`) | ✅ |
| `blocks/SPDForm.jsx` | 156 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SPDForm.jsx` | 157 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SPDForm.jsx` | 166 | **4.10** | B (arg `ph`) | ✅ |
| `blocks/SPDForm.jsx` | 178 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SPDForm.jsx` | 179 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SPDForm.jsx` | 191 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SPDForm.jsx` | 192 | **4.9** | A (fallback cetak) | ✅ |
| `blocks/SKHonorer.jsx` | 5 | **4.14** | komentar | ✅ |
| `blocks/SKHonorer.jsx` | 94 | **4.14** | A (fallback cetak) | ✅ |
| `blocks/SKHonorer.jsx` | 96 | **4.14** | A (fallback cetak, 4 ejaan `Pasirhalang`) | ✅ |
| `blocks/SKHonorer.jsx` | 100 | **4.14** | A (fallback cetak alamat) | ✅ |
| `blocks/SKHonorer.jsx` | 117 | **4.14** | A (fallback cetak) | ✅ |
| `blocks/SKHonorer.jsx` | 142 | **4.14** | B (prop `placeholder`, **tetap tercetak** karena `E` print branch `value \|\| placeholder \|\| '_______'`) | ✅ |
| `blocks/SKHonorer.jsx` | 144 | **4.14** | B (prop `placeholder`, tercetak) | ✅ |
| `blocks/SKHonorer.jsx` | 150 | **4.14** | A (fallback cetak) | ✅ |
| `blocks/SKHonorer.jsx` | 227 | **4.14** | A (fallback cetak, `mode === 'print'`) | ✅ |
| `utils/sekolahData.js` | 10 | 1.4 | konstanta default | ✅ |
| `utils/sekolahData.js` | 11 | 1.4 | konstanta default | ✅ |
| `utils/sekolahData.js` | 23 | 1.5 | konstanta kepala | ✅ |
| `utils/sekolahData.js` | 24 | 1.5 | konstanta kepala | ✅ |
| `utils/sekolahData.js` | 28 | 1.5 | konstanta bendahara | ✅ |
| `utils/sekolahData.js` | 29 | 1.5 | konstanta bendahara | ✅ |
| `blocks/SuratTugas.jsx` | 15 | 4.12 | komentar | ✅ |
| `blocks/SuratTugas.jsx` | 65 | 4.12 | B (placeholder edit-only — print memakai `label`, bukan `ph`) | ✅ |
| `blocks/SuratTugas.jsx` | 103 | 4.11 | A (fallback cetak) | ✅ |
| `blocks/SuratTugas.jsx` | 104 | 4.11 | A (fallback cetak) | ✅ |
| `blocks/SuratTugas.jsx` | 110 | 4.11 | A (fallback cetak) | ✅ |
| `blocks/SuratTugas.jsx` | 111 | 4.11 | A (fallback cetak) | ✅ |
| `blocks/SuratUndangan.jsx` | 12 | 4.13 | komentar | ✅ |
| `blocks/SuratUndangan.jsx` | 216 | 4.13 | A (fallback cetak) | ✅ |
| `blocks/SuratUndangan.jsx` | 217 | 4.13 | A (fallback cetak) | ✅ |
| `utils/signatureRoles.js` | 29 | 1.7 | konstanta notulen | ✅ |
| `utils/signatureRoles.js` | 30 | 1.7 | konstanta notulen | ✅ |
| `utils/dataContextBuilder.js` | 22 | 4.18 | komentar JSDoc | ✅ |
| `utils/dataContextBuilder.js` | 23 | 4.18 | komentar JSDoc | ✅ |
| `blocks/KopSurat.jsx` | 13 | 3.3 | literal kabupaten | ✅ |
| `blocks/KopGugus.jsx` | 9 | 3.6 | literal kabupaten | ✅ |
| `blocks/SignatureFooter.jsx` | 9 | 1.10 | komentar referensi | ✅ |
| `blocks/InfoKeuangan.jsx` | 11 | 4.17 | B (placeholder) | ✅ |
| `utils/guruTendikParser.js` | 97 | 4.19 | komentar contoh | ✅ |
| `blocks/TabelLetterHeader.jsx` | 8 | 4.19 | komentar ASCII | ✅ |
| **Total** | **73** | | | **100% tertaut** |

**73 baris / 15 file, setiap baris punya satu task bernama.**

### 5c — Verifikasi asset tidak terjaring

```
grep -rniE "<15 pola di atas>" spj-frontend/src | grep -ci "sourceFile"
→ 0
```

22× `sourceFile` di `templateConfig.js` (`/templates/Form. Honor_2026_SDN lebakleungsir.xlsx`,
`/templates/BKU_SDN_Lebakleungsir.xlsx`) **tidak** menjaring — pola mixed-case
`SD Negeri Lebakleungsir` dan `SD NEGERI PASIRHALANG` tidak cocok karena di path
aset huruf kapitalnya berbeda (`SDN lebakleungsir` vs `SD NEGERI LEBAKLEUNGSIR`).
Terukur 0.

### 5d — Yang SENGAJA tidak di-treat sebagai pola

| Pola | Alasan | Bukti |
|---|---|---|
| `Mandalamukti` | hanya di `data/mockData.js` (fiktif); `seedMockData()` terverifikasi tidak menulis `spj_data_sekolah` | `grep -l "Mandalamukti" spj-frontend/src` → hanya `mockData.js` |
| `Cikalongwetan` | konten dokumen (tempat) — di luar cakupan | di luar pola 15 |
| `8 Mei 2026`, `SD Negeri Cipada` | konten dokumen (tanggal, nama lain) — di luar cakupan | di luar pola 15 |
| `SDN-PSR` (`NomorSuratPopup.jsx:18`) | kode penomoran, bukan identitas sekolah | di luar pola 15 |
| `DINAS PENDIDIKAN` (`SKHonorer.jsx:98`, `KopSurat.jsx:16`, `templateSuratHelper.js:486`) | nama instansi tetap, bukan identitas sekolah; membersihkannya hanya di SKHonorer bikin bentuk kop beda dari kop lain | tidak masuk 15 pola |

### 5e — Riwayat check ini (3 versi)

| Versi | Kapan | Verifikasi | Temuan yang lolos |
|---|---|---|---|
| v1 | 2026-09-14 | T-02 hanya 4 pola nama | F-1 (NIP, `Yuniarti`, `SD NEGERI LEBAKLEUNGSIR`) — 12 file tersisa |
| v2 | 2026-09-17 (pagi) | 11 pola, 57 baris / 11 file — **per file** | D-1 (`templateConfig:51,295` + `DokumenFormPreview:1669`), D-3 (NPSN 20212345), D-6 (`Pasirhalang`) — 16 baris baru, 4 file baru |
| v3 | 2026-09-17 (malam) | **15 pola, 73 baris / 15 file — per baris** | — |

**Verdict check #5 (v3): LULUS** — 73/73 baris terukur punya task bernama. **Ini** yang
membuat gate T-02 achievable di dalam cakupan sprint. Perketatannya (per-baris, bukan
per-file) adalah perbaikan utama dari lampiran v2.

---

## Check #6 — Konsistensi angka antar dokumen

**Pertanyaan:** apakah 4 dokumen pack + STATE.MD menyebut angka yang sama?

```
grep -oE "\b53\b" planning/sprints/sprint-001/{REQUIREMENTS,BLUEPRINT,ACCEPTANCE,HANDOFF-PROMPT}.MD STATE.MD
grep -oE "\b19 file" planning/sprints/sprint-001/HANDOFF-PROMPT.MD STATE.MD
grep -oE "\b14 test" planning/sprints/sprint-001/{ACCEPTANCE,HANDOFF-PROMPT}.MD STATE.MD
grep -oE "T-14" planning/sprints/sprint-001/ACCEPTANCE.MD
```

| Angka | BLUEPRINT | ACCEPTANCE | HANDOFF | STATE.MD | Verdict |
|---|---|---|---|---|---|
| 6 fase | ✅ (6 header FASE) | ✅ | ✅ | ✅ | ✅ |
| 53 task (12·8·6·20·4·3) | ✅ (terhitung) | ✅ | ✅ | ✅ | ✅ |
| 19 file diubah + 2 baru | ✅ (tabel 19 baris) | ✅ | ✅ | ✅ | ✅ |
| 14 test case (T-01…T-14) | — | ✅ | ✅ | ✅ | ✅ |
| 14 checklist item (C-01…C-14) | — | ✅ | — | — | ✅ |
| 15 pola T-02 | ✅ | ✅ (tabel baseline + catatan) | ✅ | ✅ | ✅ |
| 73 baris / 15 file baseline | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4 gate build (1.12, 2.8, 4.20, 6.2) | ✅ | ✅ | ✅ | ✅ | ✅ |

Koreksi yang dilakukan saat check ini (v3):
- `HANDOFF-PROMPT.MD` header "REVISI 2026-09-17" menulis "48 task / 17 file / 13 test"
  — semua diganti 53/19/14. Section ringkasan handoff + peringatan T-02 diperluas
  (Kelas A/B, `-i` wajib, D-6, mockData/sourceFile do-not-touch, `DINAS PENDIDIKAN`).
- `REQUIREMENTS.MD:69` (v2) "5 NIP 15× di 6 file" → terukur 18× di 8 file
  (tambah `SKHonorer.jsx`). Diperbaiki di v2; tidak berubah di v3.
- `REQUIREMENTS.MD` "Apa yang Dibangun" item 14: "9 baris SK Honorer" dikoreksi
  dari "semuanya fallback cetak" → "8 fallback + 1 komentar; baris 98 `DINAS
  PENDIDIKAN` sengaja tidak disentuh".
- `BLUEPRINT.MD` baris 11 (SKHonorer) & task 4.14: **98 `DINAS PENDIDIKAN`
  dikeluarkan** dari daftar baris yang dibersihkan (nama instansi tetap, identik
  `KopSurat.jsx:16` & `templateSuratHelper.js:486`).

**Verdict check #6: LULUS** — tidak ada angka yang saling bertentangan setelah
koreksi.

---

## Rekap

| # | Check | Verdict |
|---|---|---|
| 1 | Cakupan user story (7 US + 2 penanda batas) | ✅ LULUS |
| 2 | Cakupan task (53/53, 4 gate) | ✅ LULUS |
| 3 | Cakupan file (21/21, 0 yatim) | ✅ LULUS |
| 4 | Versi dependency (14/14, 0 baru) | ⚠️ LULUS BERSYARAT (berlaku setelah task 1.11; dikunci T-13) |
| 5 | **T-02 dapat dicapai per-baris** (73/73 baris, 15 pola, `-i` wajib) | ✅ LULUS |
| 6 | Konsistensi angka antar dokumen | ✅ LULUS |

**Status pack: DRAFT v3 — siap diserahkan untuk persetujuan user.**
Belum boleh coding (AGENTS.MD: "DILARANG mulai coding tanpa architect pack" +
"SELALU dry run dulu → laporkan rencana → TUNGGU persetujuan").

**Langkah setelah disetujui:** Builder dry run **Fase 1 + Fase 4** (dua fase berisiko
tinggi). `planning/sprints/sprint-001/DRYRUN-T1.md` berstatus **SEBAGIAN BASI** —
dibuat sebelum FASE 4 ada **dan sebelum revisi v3** (nomor task & daftar file di
dalamnya belum sesuai 53 task / 19 file versi ini). Dry run Fase 1 + Fase 4
sesi ini **tidak** dituang ke `DRYRUN-T1.md` — terjadi di chat. Builder wajib
dry run ulang sesuai `HANDOFF-PROMPT.MD`.

**Yang masih OPEN di `QUESTIONS.MD` (4 pertanyaan)** — tidak memblokir persetujuan
pack, tetapi harus dijawab sebelum sprint berikutnya:
1. `blocks/NomorSuratPopup.jsx:18` — `NAMA_SEKOLAH_DEFAULT = 'SDN-PSR'` (di luar cakupan).
2. Permanensi batas literal tempat/tanggal (`Cikalongwetan`, `8 Mei 2026`, `SD Negeri Cipada`).
3. `xlsx@0.18.5` — F1 TINGGI tanpa fix.
4. `package.json` root (bukan `spj-frontend/`).
