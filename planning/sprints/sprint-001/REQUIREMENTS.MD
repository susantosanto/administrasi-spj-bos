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
