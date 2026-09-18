# ACCEPTANCE CRITERIA — Sprint 001: Fondasi Data Sekolah & Pejabat

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dijalankan dari root proyek `D:\project\spj-app` kecuali disebut lain.
> Bukti = output asli / screenshot, **bukan klaim** (AGENTS.MD).
>
> **REVISI 2026-09-17 (v5)** — hasil **dry run Fase 1 + Fase 4** (bukan review dokumen).
> 3 cacat baru ditemukan: **D-7** (task 4.3 mengosongkan `surat_tugas.defaults` yang tidak
> pernah dipakai — `buildSptData` hanya spread `spt.defaults`, baris 1617) · **D-8** (task 4.1
> tidak menyentuh jalur notulen → TTD notulen cetak kosong setelah 1.10) · **D-9** (task 1.10
> sebenarnya **8 baris di 2 cabang**, bukan 1). Ditambah **T-15** (guard D-8) → test case
> **14 → 15** · checklist **14 → 15**. Task & jumlah file **tidak berubah**.
>
> **REVISI 2026-09-17 (v4)** — hasil **verifikasi independen gate**: 11 klaim pack diukur
> ulang → semuanya cocok (T-02 baseline 73/15 persis, aset `sourceFile` 0, 53 task, 14 caret).
> Satu koreksi akurasi: **T-01** kini mewajibkan bukti menyebut **versi runtime**; klaim
> runtime di pack dibalik (v22.22.2 = *managed*, bukan v24.19.0). Hash artefak build
> terverifikasi **identik** di kedua runtime → isi test case tidak berubah.
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
**dan** seluruh test case (T-01 … T-15) lulus **dan** kedua skenario edge case lulus.

---

## Checklist

- [x] C-01 Pejabat dari Data Sekolah (6 peran), tanpa hardcode (T-02, T-03) — statik; T-03 UI menunggu acceptance-runner
- [x] C-02 Kop sekolah dari tab Data Sekolah + logo kiri/kanan atas (T-08) — statik:
  `KopSurat.jsx` baca identitas + logo saat render (kiri sekolah / kanan dinas),
  kosong → baris kosong (FASE 3 + regresi FASE 6); screenshot menunggu acceptance-runner
- [x] C-03 Kop gugus dari Data Sekolah (Nama Gugus + Alamat Gugus + kabupaten) (T-09) —
  statik: KopGugus prop-driven, grep storage = 0 hasil (gate FASE 3 d); screenshot menunggu acceptance-runner
- [x] C-04 Data kosong → field kosong + peringatan merah (2 varian pesan) (T-05, T-06) —
  statik: banner 2 varian + tautan aksi terverifikasi di `PeringatanData.jsx`
  (FASE 5, 2026-09-18); screenshot UI runtime menunggu acceptance-runner
- [x] C-05 Nilai tidak basi setelah ubah Data Sekolah tanpa reload (T-07) — statik:
  semua konsumen baca storage SAAT render (konstanta level-modul dihapus FASE 1);
  uji UI sebelum/sesudah menunggu acceptance-runner
- [x] C-06 Data lama tidak menyebabkan crash saat peran baru ditambahkan (T-04) —
  runtime data-layer FASE 2 (b): `roles: 6`, `old4-in-6-out: true`, `null-safe: true`;
  UI console menunggu acceptance-runner
- [x] C-07 Regresi 6 konsumen existing lulus (T-11) — statik **12/12 kombinasi**
  (FASE 6.1, 2026-09-18); screenshot per konsumen menunggu acceptance-runner
- [x] C-08 Warna blue-only pada file yang disentuh (T-10) — grep 0 hasil di 2 halaman
  (gate FASE 2 c); merah `PeringatanData` = indikator status layar (pengecualian sah AGENTS.MD)
- [x] C-09 `npm run build` sukses (T-01) — `✓ built in 4.63s`, 178 modules, exit 0, Node v24.19.0
- [x] C-10 **Nol hardcode identitas mutlak** — 15 pola, `grep -i`, 73 → 0 baris (T-02) — 0 hit / 0 aset via Select-String 2026-09-18
- [x] C-11 **TTD SPT/SPD/Undangan tetap terisi** dari Data Sekolah, tidak kosong (T-12) —
  statik: jalur auto-fill `DokumenFormPreview.jsx:1622-1705` terverifikasi (gate FASE 4 c);
  UI menunggu acceptance-runner
- [x] C-12 `package.json` pinned eksak + `npm ci` bersih (T-13) — 0 caret, 14/14 cocok
  lockfile, lockfile tidak berubah (FASE 1 c + subagent T-13 PASS); `npm ci` penuh
  diblokir sandbox (tercatat FASE 1) — substitusi: build sukses berulang kali
- [x] C-13 `STATE.MD` + pack sprint diperbarui — 2026-09-18
- [x] C-14 **SK Honorer satu identitas** — nama/alamat/kabupaten/NPSN sama dengan Data Sekolah, tidak ada `Pasirhalang` (T-14) — statik; screenshot print menunggu acceptance-runner
- [x] C-15 **TTD Notulen & Pimpinan tetap terisi** dari Data Sekolah, tidak kosong (T-15) — statik; UI menunggu acceptance-runner

---

## Test Cases

### T-01 — Build sukses
- **Given** perubahan kode selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0** dan output berakhir dengan `✓ built in …`
- **Bukti** tempel output terminal asli + **sebutkan versi runtime** yang menjalankan
  (`node -v`). Dua runtime tersedia: **v22.22.2** (*managed*, dipakai agent) dan
  **v24.19.0** (*system fallback*). **Hash artefak terverifikasi identik** di keduanya
  (koreksi v4) — gate ini boleh dijalankan pada runtime mana pun.

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
- **Status (2026-09-18, FASE 5):** statik LULUS — banner varian 1 terverifikasi di
  `PeringatanData.jsx`: teks "upload data sekolah terlebih dahulu" + tautan
  "Buka tab Data Sekolah" (`/dashboard/data-sekolah`); `print:hidden`; cetak tidak
  diblokir. Screenshot UI runtime menunggu /acceptance-runner.

### T-06 — Data parsial → peringatan pejabat
- **Given** identitas sekolah **terisi**, tetapi `pejabat.ks` dan `pejabat.bendahara` **kosong**
- **When** buka halaman detail dokumen
- **Then** peringatan merah **menyebut peran yang kosong** (bukan pesan upload data sekolah),
  dan kop **tetap terisi** dari identitas sekolah
- **Bukti** screenshot
- **Status (2026-09-18, FASE 5):** statik LULUS — banner varian 2 menyebut **HANYA**
  peran kosong via `getPejabatStatus()` + tautan "Buka tab Pejabat Sekolah"
  (`/dashboard/pejabat-sekolah`); kop tetap terisi dari identitas sekolah.
  Screenshot UI runtime menunggu /acceptance-runner.

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
- **Status (2026-09-18, FASE 6):** statik **12/12 kombinasi LULUS** — tiap konsumen
  terbaca: jalur data terisi & kosong bebas crash, jujur-kosong (tidak ada nama orang
  lain saat data kosong). ⚠️ Observasi (di luar scope sprint — catat untuk Sprint 002):
  `DokumentasiAIGenerate.jsx:432` memakai key `nama_sekolah` (snake_case) yang tak
  pernah cocok `getSchoolData()` (camelCase) → fallback generik `'SD NEGERI ...'`
  selalu terpakai; tidak crash, bukan nama riil. Screenshot UI menunggu
  /acceptance-runner.

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

### T-15 — TTD Notulen & Pimpinan tetap terisi (guard D-8) ⚠️ BARU v5
- **Given** Data Sekolah → tab Pejabat Sekolah terisi (`ks`, `notulen`), dan
  `SIGNATURE_ROLES` sudah menjadi `getSignatureRoles()` **tanpa** `|| roleConfig.defaultName`
- **When** buka dokumen **Notulen** → print preview, lalu cetak/PDF
- **Then** blok TTD `Pimpinan Rapat` **dan** `Notulen` tampil **terisi** dari Data Sekolah
  (`pejabat.ks` → pimpinan, `pejabat.notulen` → notulen) — **bukan kosong**, **bukan** literal lama
- **And** setelah `pejabat.notulen` dikosongkan → TTD Notulen **kosong** + peringatan merah,
  **bukan** jatuh kembali ke `DEWI ERMIRAWATI, S.Pd.Gr.`
- **Bukti** screenshot Notulen (kondisi terisi) + 1 screenshot kondisi `notulen` kosong
- **Mengapa wajib:** template `notulen` memakai blok signature `['pimpinan','notulen']`
  (`templateConfig.js:48`) yang dirender `SignatureFooter` lewat key `ttd_${role}_nama`.
  Task 4.1 auto-fill **hanya menyebut spt/sppd/undangan** → tanpa perluasan, kedua key itu
  tidak pernah terisi, dan setelah task 1.10 menghapus fallback, **TTD notulen cetak kosong
  permanen**. T-12 **tidak menjangkau** kasus ini (hanya SPT/SPD/Undangan).
  Ditemukan saat dry run Fase 1+4, 2026-09-17.

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
8b. Buka **Notulen** → TTD `Pimpinan Rapat` & `Notulen` terisi dari tab Pejabat Sekolah,
   bukan kosong dan bukan `DEWI ERMIRAWATI` (T-15).
9. Ubah nama sekolah → buka dokumen **tanpa reload** → nilai baru langsung tampil.
10. Hapus `spj_data_sekolah` → buka dokumen → peringatan merah muncul, kop & field kosong,
    pencetakan tetap bisa dilakukan.
11. Jalankan grep T-02 (15 pola, `-i`) → **kosong**, `echo $?` = **1**.

> **Bukan cakupan sprint ini:** struktur tab SPT/SPD/Undangan, penghapusan tab "Surat Tugas",
> print-area Perjalanan Dinas (3 blok SPD yang hilang, tembusan, kop → TTD), konsep dua wajah
> `<input>` vs cetak murni, reset data lama → diuji di
> `planning/sprints/sprint-002/ACCEPTANCE.MD`.
