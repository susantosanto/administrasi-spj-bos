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
| 1.10 | Hapus fallback `\|\| roleConfig.defaultName` **di 8 baris / 2 cabang** (`useTwoColumn` baris 22): `defaultName` 94, 106, 137, 148 · `defaultNip` 99, 109, 140, 151 → nilai kosong render kosong **+ bersihkan blok komentar referensi baris 9** (memuat `BADRUDDIN` / `DEDE GUNAWAN`, sudah basi — T-02 ketat menuntut 0 kemunculan). ⚠️ **D-9:** cabang 2-kolom (baris 84–116) dan 1-kolom (baris 119–…) **dua-duanya** wajib dibersihkan — jangan berhenti di cabang pertama | `blocks/SignatureFooter.jsx` | 4 m |
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
| 4.1 | **Auto-fill pejabat**: `getSignatureRoles()` mengisi `namaPenandatangan`/`nipPenandatangan`/`namaMengetahui`/`nipMengetahui`/`namaKetuaGugus`/`nipKetuaGugus` untuk spt/sppd/undangan (pengganti `defaults` yang dikosongkan 4.2–4.5) · ⚠️ **D-8 — WAJIB juga jalur notulen:** isi `ttd_pimpinan_nama`/`ttd_pimpinan_nip` + `ttd_notulen_nama`/`ttd_notulen_nip` untuk `resumeData` (blok signature `['pimpinan','notulen']`, `templateConfig.js:48`). Tanpa ini, task 1.10 membuat TTD notulen **kosong permanen** — `SignatureFooter` membaca key `ttd_${role}_nama`, dan T-12 tidak menjangkau notulen | `DokumenFormPreview.jsx` | — | 6 m |
| 4.2 | Kosongkan `spt.defaults` nama+NIP (baris 324, 325, 327, 328) | `data/templateConfig.js` | A | 3 m |
| 4.3 | Kosongkan `surat_tugas.defaults` nama+NIP (baris 352, 353, 355, 356) · ⚠️ **D-7:** nilai ini **tidak pernah tercetak** — tab `surat_tugas` memakai `buildSptData` (`DokumenFormPreview.jsx:1790`) yang hanya meng-spread **`spt.defaults`** (baris 1617), jadi output ditentukan task **4.2**. Task 4.3 **tetap wajib** semata untuk meloloskan gate T-02 (baris ini masuk baseline 73) | `data/templateConfig.js` | A | 2 m |
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
| 4.20 | **GATE FASE 4:** `npm run build` + **T-02 → 0 hasil** (15 pola, `grep -rniE`) + **T-12: verifikasi TTD SPT/SPD/Undangan TERISI dari Data Sekolah, bukan kosong** + **T-15: TTD Notulen & Pimpinan TERISI (guard D-8)** + **verifikasi SK Honorer mencetak nama sekolah yang BENAR** | — | — | 6 m |

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
