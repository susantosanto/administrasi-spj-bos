# ACCEPTANCE CRITERIA — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dijalankan dari root proyek `D:\project\spj-app` kecuali disebut lain.
> Bukti = output asli / screenshot, **bukan klaim** (AGENTS.MD).

---

## Definisi "Selesai"

Sprint ini dianggap **SELESAI** jika **seluruh** checklist di bawah tercentang
**dan** seluruh test case (T-01 … T-11) lulus **dan** kedua skenario edge case lulus
**dan** Sprint 001 sudah selesai (prasyarat).

---

## Checklist

> Status 2026-09-19 (Builder, statik): seluruh item dicek statik + gate grep + build;
> screenshot UI runtime menunggu /acceptance-runner konteks segar (aturan AGENTS.MD).
> Koreksi dry run yang disetujui user 2026-09-19: **T-02 di-rescope** (kecualikan
> `utils/templateSuratHelper.js` — fitur "Template Surat Cerdas" lain, lihat
> `DRYRUN-REPORT.MD` D-1 + QUESTIONS.MD) · **T-04 diperluas** `<input|<textarea`
> (D-3) · placeholder nama riil diganti generik (D-2).

- [x] C-01 Tab "Surat Tugas" hilang; tidak ada referensi tersisa (T-02) — statik:
  grep rescoped = 0; 3 sisa di `templateSuratHelper.js` = fitur lain (D-1)
- [x] C-02 Form SPT, SPD, Undangan memetakan elemen dokumen sumber (T-03) — statik:
  SPT kini per-penerima (Nama/NIP/Pangkat/Jabatan); SPPD butir 1–10 + Pengikut
  multi-baris; Undangan + 2 paragraf penutup + tembusan multi-baris; tabel pemetaan
  formal menunggu acceptance-runner
- [x] C-03 Print-area SPT/SPD/Undangan lengkap kop → TTD (T-06, T-07) — statik:
  kop via blok config (kop-surat/kop-gugus), TTD auto-fill Sprint 001 dipertahankan;
  screenshot menunggu acceptance-runner
- [x] C-04 Tab = data saja; blok cetak tidak merender `<input>` (T-04) — statik:
  grep `<input|<textarea` 3 blok = 0 (diperluas D-3)
- [x] C-05 Print-area SPD memuat 3 blok resmi yang hilang, kalimat persis (T-05) —
  statik: 4 string persis docx terverifikasi via grep; screenshot menunggu runner
- [x] C-06 TTD Undangan memakai Ketua Gugus (T-07) — statik: `namaKetuaGugus` dari
  `sig['ketua-gugus']` (DokumenFormPreview, dipertahankan dari Sprint 001)
- [x] C-07 A4 + satuan `mm` + `orientation` benar untuk ketiga dokumen (T-08) —
  statik: 3× portrait di templateConfig; CSS cetak 210/297mm + `@page` ada
- [x] C-08 Data lama Perjalanan Dinas di-reset bersih, tanpa migrasi (T-09) — statik:
  tombol "Reset Data Dokumen LPJ" + `storageHelper.remove('dokumen_lpj')` + confirm;
  `spj_data_sekolah` tidak disentuh; uji localStorage runtime menunggu runner
- [x] C-09 Warna blue-only pada file yang disentuh (T-10) — statik: 3 blok = 0 warna
  terlarang; DokumenSPJPage sisa `amber`×10 + `emerald`×4 (baris 362/368/425/464 =
  pil status sub-kategori + marker ✓ lengkap + pulse dot) — SEMUA pre-existing
  (`git diff 264c431..HEAD` = 0 warna baru ditambahkan Sprint 002) & murni indikator
  status layar, tidak ikut cetak → pengecualian sah AGENTS.MD (dikoreksi re-verifikasi
  R-1, `DRYRUN-REPORT.MD` §6)
- [x] C-10 Regresi 6 konsumen existing lulus (T-11) — statik: 6 konsumen TIDAK tersentuh
  (git diff 264c431..HEAD); gate 15-pola Sprint 001 tetap 0 hit
- [x] C-11 `npm run build` sukses (T-01) — `✓ built in 4.41s`, exit 0 (gate akhir)
- [x] C-12 `STATE.MD` + pack sprint diperbarui — 2026-09-19

---

## Test Cases

### T-01 — Build sukses
- **Given** perubahan kode selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0** dan output berakhir dengan `✓ built in …`
- **Bukti** tempel output terminal asli

### T-02 — Tab "Surat Tugas" benar-benar hilang
- **Given** konsolidasi tab selesai
- **When** `grep -rn "surat_tugas" spj-frontend/src`
- **Then** **0 hasil** (perintah mengembalikan kosong)
- **Bukti** output grep

### T-03 — Form memetakan elemen dokumen sumber
- **Given** tab form SPT, SPD, dan Undangan terbuka
- **When** setiap field form dibandingkan satu per satu dengan elemen dokumen sumber
  (`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`)
- **Then** setiap elemen dokumen punya field padanan; tidak ada field tanpa padanan
  (kecuali `sifat` — lihat REQUIREMENTS)
- **Bukti** tabel pemetaan field ↔ elemen + screenshot tiap form

### T-04 — Blok cetak tidak merender input
- **Given** pemisahan dua wajah selesai
- **When** `grep -n "<input" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx`
- **Then** **0 hasil** pada ketiga file
- **Bukti** output grep

### T-05 — Print-area SPD memuat 3 elemen yang hilang
- **Given** SPD terisi
- **When** print preview dibuka
- **Then** muncul ketiga blok: **"Telah diperiksa dengan keterangan bahwa perjalanan tersebut
  atas perintah pejabat yang berwenang…"**, **"Catatan Lain-Lain"**, dan **"PERHATIAN :"** —
  kalimat **persis** dokumen sumber
- **Bukti** screenshot print-preview disandingkan dengan halaman docx

### T-06 — Print-area SPT lengkap kop → TTD
- **Given** identitas sekolah & pejabat terisi
- **When** print preview SPT dibuka
- **Then** urutan elemen sesuai dokumen sumber: kop (identitas + logo) → judul/nomor →
  isi → TTD 2 kolom; **tidak** ada elemen yang hilang maupun berlebih
- **Bukti** screenshot print-preview disandingkan dengan halaman docx

### T-07 — Print-area Undangan: paragraf, Tembusan, TTD Ketua Gugus
- **Given** `pejabat.ketuaGugus` terisi, `pejabat.ks` terisi nama BERBEDA
- **When** print preview Undangan dibuka
- **Then** (a) dua paragraf penutup tampil terpisah, (b) **Tembusan** tampil sebagai list
  decimal bernomor, (c) blok TTD menampilkan **Ketua Gugus**, bukan Kepala Sekolah
- **Bukti** screenshot

### T-08 — A4, satuan mm, orientasi dari config
- **Given** ketiga dokumen siap cetak
- **When** print preview dibuka untuk SPT, SPD, dan Undangan
- **Then** ukuran kertas **A4**, satuan `mm`, kelas orientasi sesuai
  `templateConfig.js → orientation`; tidak ada elemen terpotong di batas halaman
- **Bukti** screenshot print-preview + nilai `orientation` tiap config

### T-09 — Reset bersih data lama
- **Given** `spj_dokumen_lpj` memuat data bentuk LAMA
- **When** reset dijalankan
- **Then** data Perjalanan Dinas lama hilang **tanpa** fungsi migrasi, dan
  **`spj_data_sekolah` TIDAK ikut terhapus**
- **Bukti** output `localStorage` sebelum & sesudah

### T-10 — Blue-only pada file yang disentuh
- **Given** file yang disentuh sprint ini
- **When** `grep -rn "emerald\|amber\|violet\|rose\|cyan" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx`
- **Then** tidak ada kelas warna terlarang untuk elemen **non-status**
  (pengecualian sah: indikator status di layar, mis. banner peringatan merah)
- **Bukti** output grep + penjelasan tiap sisa kemunculan

### T-11 — Regresi 6 konsumen (warisan guard Sprint 001)
- **Given** Sprint 002 selesai
- **When** render: `blocks/KopSurat.jsx`, `blocks/SignatureFooter.jsx`, `blocks/SKHonorer.jsx`,
  `blocks/InfoKeuangan.jsx`, `dokumentasi/DokumentasiAIGenerate.jsx`, `utils/signatureRoles.js`
  — masing-masing pada kondisi data **terisi** dan **kosong**
- **Then** 12 kombinasi ter-render tanpa error; tidak ada nama orang lain muncul saat data kosong
- **Bukti** screenshot tiap konsumen (2 kondisi)

---

## Edge Case Scenarios

### E-1 — Data sekolah benar-benar kosong (empty input)
`localStorage` dibersihkan total (semua key `spj_` dihapus), lalu buka halaman detail
Perjalanan Dinas.
**Harapan:** tidak ada crash, tab tetap berfungsi, peringatan merah tampil, dokumen
tercetak dengan kop & TTD **kosong** (bukan nama orang lain).

### E-2 — Data parsial (partial data)
Hanya `namaSekolah` terisi; `allFields` kosong; `pejabat` hanya `ks` terisi.
**Harapan:** kop menampilkan nama sekolah saja (alamat/email kosong tanpa placeholder aneh),
TTD hanya terisi untuk peran yang ada, peringatan merah menyebut **hanya** peran yang kosong.

---

## Output yang Bisa Didemonstrasikan

1. Buka dokumen Perjalanan Dinas → tab **SPT / SPD / Undangan** → isi form
   → **print preview** → dokumen A4 lengkap dari kop sampai TTD.
2. Bandingkan tiap print preview berdampingan dengan halaman docx sumber
   (`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`) — elemen & kalimat cocok.
3. Tunjukkan SPD memuat ketiga blok resmi yang sebelumnya hilang.
4. Tunjukkan Undangan ditandatangani **Ketua Gugus**, bukan Kepala Sekolah.
5. Tunjukkan tidak ada tab "Surat Tugas" dan tidak ada `<input>` di blok cetak.
6. Jalankan reset → data Perjalanan Dinas lama bersih, Data Sekolah tetap utuh.

> **Bukan cakupan sprint ini:** fondasi data, kop berlogo, peringatan merah, halaman
> Data Sekolah → diuji di `planning/sprints/sprint-001/ACCEPTANCE.MD`.
