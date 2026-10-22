# ACCEPTANCE — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **✅ DITUTUP 2026-10-22 19:5x** ("tutup sprint dan simpan state terakhir").
> Kode T-01…T-16 dibangun 2026-10-22 13:41–15:29; verifikasi T-17…T-20 16:2x–16:4x
> (dev server `:5199`, Edge headless); revisi UI 17:0x · 17:3x · 18:0x · 18:2x · 18:4x.
> **Penutupan: oracle dijalankan ULANG pada kode akhir → 190 PASS / 0 FAIL (11 skrip),
> browser 195 PASS / 0 FAIL (9 skrip), build `✓ 8.91s`.** 14 asersi oracle basi
> ditemukan & diperbarui (§11.2). Setiap butir butuh **bukti**: output asli,
> screenshot, atau angka. Klaim tanpa bukti = **FAIL**.
> Angka lengkap ada di `BUILD-REPORT.MD`.

---

## 0. TASK GATE (wajib lulus sebelum butir lain dinilai)

| # | Gate | Perintah / cara | Hasil 2026-10-22 |
|---|---|---|---|
| G-0 | Build | `npm run build` | ✅ `✓ built in 14.11s` (pra-C-05) · `✓ built in 12.35s` (final), exit 0 |
| G-1 | `bkuParser.js` tabu | `git diff --stat` | ✅ **kosong** |
| G-2 | Dependency | `git diff --stat -- package.json package-lock.json` | ✅ **kosong** |
| G-3 | Storage terpusat | `grep -rn "localStorage\." <file baru>` | ✅ **0 hit** |
| G-4 | Blue-only | `grep -rE "\b(bg\|text\|border\|ring)-(emerald\|amber\|rose\|violet\|cyan)"` | ✅ **0 hit**; satu-satunya hex = `#004ac6` (diizinkan) |
| G-5 | Batas modul | `wc -l` file baru | ⚠️ **2 file lewat 2–5 baris** — `previewDocs.js` 486/480, `aturanMamin.js` 202/200 (sisanya ≤ batas) |
| G-6 | Halaman LPJ utuh | hash 4 kategori + diff `DokumenSPJPage.jsx` | ✅ 4/4 hash sama dengan EX-1 · diff **kosong** |
| G-7 | Gate lama utuh | diff `SummaryCard.jsx` | ✅ **kosong** |
| G-8 | `templateConfig` sempit | diff `templateConfig.js` | ✅ hanya blok `daftar_hadir` (+5/−2) |
| G-9 | Halaman Kelengkapan utuh | diff `DokumenKelengkapanPage.jsx` | ✅ **kosong** |

> ⚠️ Pola grep bisa berbohong (RISKS.MD): setiap hit G-3/G-4 **wajib dibuka isinya**.
> G-3 = 0 hit, jadi tidak ada yang perlu dibuka. G-4 = 0 hit; hex yang ditemukan hanya `#004ac6`.

---

## 1. Gate Per Fase (mengikuti BLUEPRINT §4)

### T-01 — Baseline render
- [x] `test-mamin-baseline.mjs` mencetak **4 hash**: honor `72e3a69d…` · perjalanan_dinas `45d43328…` · mamin `5a479f2c…` · pemeliharaan `0cebac48…`.
- [x] `test-mamin-baseline.json` tersimpan → dipakai T-08/T-11/T-19.

### T-02 — `bkuMirip.js`
- [x] Baris tanpa `kodeKegiatan` → kandidat `[]` (oracle T-02.1).
- [x] 2 baris cocok (rekening + kegiatan sama, bulan beda) → kandidat (oracle T-02.2: 4 kandidat dari fixture 9 baris).
- [x] `kodeRekening` berbeda → ditolak (T-02.2c).
- [x] `kodeKegiatan` berbeda → ditolak (T-02.2d).
- [x] Bulan sama → ditolak (A-1) (T-02.2a).
- [x] Baris aktif → ditolak (T-02.2b).
- [x] Label memuat bulan + NoBukti + uraian + nominal (T-02.5 + browser T-17.8).

### T-03 — `maminOtomatis.js`
- [x] Form kosong → field otomatis terisi. **Catatan: 21 field (16 top-level + 5 `bukuTamu`), bukan 17** — lihat BUILD-REPORT §6 deviasi D-3.
- [x] Field yang sudah diisi user **tidak** ditimpa (T-03.2).
- [x] `bukuTamu` digabung per-field (T-03.3).
- [x] Tanpa Data Sekolah → field sekolah `''` (T-03.4).
- [x] `tanggalDanaMasuk` = `bku.tanggal` (T-03.5).
- [x] Fungsi murni (T-03.6).

### T-04 — `readinessSidebar.js`
- [x] `readinessSidebar({})` → 2 pelanggaran (Nomor Surat + Daftar isi), **tanpa** "Tanggal dana masuk" (T-04.1–T-04.4).
- [x] `SummaryCard.jsx` 0 diff (G-7).

### T-05 — Gate FASE 0 ⛔
- [x] Build exit 0 · T-01 4 hash · T-02/T-03/T-04 PASS · diff hanya file baru.
- [x] STOP-1 tidak terpicu.

### T-06 — 6 seksi (shell + seksi 1–3)
- [x] Build exit 0 · file ≤200 baris (`MaminForm6Seksi` 58 · `Seksi1` 114 · `Seksi2` 186 · `Seksi3` 56).
- [x] Label seksi 1–6 tampil berurutan (browser T-17.2).
- [x] Seksi 1: Tanggal read-only · No Surat + Generate · Waktu · Tempat default · Nama Kegiatan.
- [x] Seksi 2: kolom NO/NAMA/**NIP**/JABATAN; **tanpa input TTD** (T-10.2d).
- [x] Seksi 3: **hanya** Tanggal Surat + Nomor (browser T-17.5).
- [x] 0 field §REQUIREMENTS 3.2 tampil sebagai input (oracle T-08.x).
- [x] 0 `localStorage.` langsung (G-3).

### T-07 — Seksi 4–6
- [x] Build exit 0 · 3 file ≤200 baris (`Seksi4` 182 · `Seksi5` 84 · `Seksi6` 82).
- [x] Seksi 4: tidak ada input Sifat / Perihal / Isi Surat Pesanan (oracle).
- [x] Seksi 5: tidak ada input Tanggal / Ingin Bertemu / Tujuan / Uraian / Diterima Oleh (oracle).
- [x] Seksi 6: tombol "Generate AI Notulen" ada (browser: tombol ter-render).
- [x] 0 key form dobel antar seksi (oracle).

### T-08 — Sambung ke `DokumenFormPreview`
- [x] Build exit 0 · diff **+21/−3** (batas +60).
- [x] Diff = 1 kondisi varian + 2 kondisi sembunyikan tanggal dana masuk.
- [x] **Hash halaman LPJ 4/4 identik** (T-01).
- [x] 0 error render (browser 0 console error).

### T-09 — Merge otomatis + gate sidebar
- [x] `formData` sidebar terisi otomatis (oracle 41 PASS; browser: 3 field "dari BKU" + Tempat/Waktu/Nama Kegiatan terisi).
- [x] Gate sidebar **tidak** memuat "Tanggal dana masuk" (browser T-17.4; banner: "1 field wajib belum terisi: Nomor Surat").
- [x] `DokumenSPJPage.jsx` 0 diff · hash LPJ 4/4 identik.

### T-10 — Kolom NIP
- [x] `templateConfig.js` diff **hanya** blok `daftar_hadir` (+5/−2).
- [x] Rows Daftar Hadir membawa `nip`; 1 peserta tanpa NIP → kolom kosong (browser T-17.25).
- [x] Kolom "TANDA TANGAN" **tetap ada** (browser T-17.23).

### T-11 — Gate FASE 1 ⛔
- [x] Build exit 0 · oracle T-06…T-10 PASS · hash LPJ 4/4 identik · G-1/G-2/G-7 hijau.
- [x] STOP-2 tidak terpicu (hash mamin berubah **hanya** karena delta NIP yang disetujui — EX-1).

### T-12 — `pbjBkuStore.js`
- [x] 21 PASS: round-trip · 2 NoBukti tidak saling timpa · NoBukti kosong ditolak & storage tidak bertambah · data rusak → `null` · `hapusEntri` 1 entri · `spj_pbj_form` tidak berubah.

### T-13 — Dropdown kandidat
- [x] 0 kandidat → pesan jujur; ≥1 → item memuat bulan+NoBukti+uraian+nominal (oracle 9 PASS + browser T-17.7/17.8).
- [x] Isian dirty → dialog "simpan dulu?" muncul (browser T-17.11).
- [x] Pilih kandidat → navigasi baris dipanggil (browser T-17.9 panel berpindah; `onNavigate` di `BKUSidebarLpj:133`).
- [x] File 123 baris ≤180.

### T-14 — Blok PBJ
- [x] 2 file ≤200 baris (`SidebarPbj` 92 · `SidebarPbjForm` 51) · prefill benar (oracle 20 PASS + browser T-17.19) · entri tersimpan menang (oracle).
- [x] Blok PBJ **di bawah form LPJ, di atas Panel Preview** (browser AF-03/AF-04).
- [x] Blok PBJ **tidak** muncul di layout `side` (browser T-19.4).
- [x] `DokumenKelengkapanPage.jsx` 0 diff.

### T-15 — Preview satu daftar
- [x] Urutan docs: LPJ (6 dokumen) → PBJ (3 dokumen) (browser T-17.20/17.21).
- [x] **0 nama dokumen dobel** (sufiks " PBJ"; browser T-17.22).
- [x] `previewDocs.js` diff hanya `buildPreviewDocs` (+ opsi `formPbj`) — lihat deviasi D-1 BUILD-REPORT.

### T-16 — Gate FASE 2 ⛔
- [x] Build exit 0 · oracle T-12…T-15 PASS · G-6/G-7/G-9 hijau.

### T-17 — Uji browser alur lengkap
- [x] Dev server **`:5199`** (bukan 5173) → Data BKU → klik baris Mamin → dropdown kandidat → pilih → panel berpindah (T-17.6…T-17.9).
- [x] Isi 6 seksi → gate (banner) → blok PBJ terisi otomatis → Simpan LPJ → Simpan PBJ → reload → utuh (T-17.19, T-17.26…T-17.29).
- [ ] **Cetak: preview = cetakan (AF-03)** — **TIDAK diuji** (tidak ada perbandingan PDF cetak vs preview di sprint ini; lihat §6).
- [x] 0 console error · screenshot AF-01…AF-06 (`.workbuddy-ai/bukti-ui-20261022/`).

### T-18 — Uji 4 kategori + non-LPJ
- [x] 4 kategori berform: full width · dropdown ada · 0 input "Tanggal dana masuk" · blok PBJ ada · hanya Mamin yang 6 seksi (T-18.LPJ × 4).
- [x] 9 tipe non-LPJ: 8 tipe ≤576px + tab Detail + tanpa dropdown/PBJ (browser); `PUNGUT_PPH` **tidak bisa dibuka** karena desain Sprint 017 (`onClick` undefined) — dicatat, bukan gagal.
- [x] 0 console error.

### T-19 — Regresi halaman Dokumen LPJ
- [x] Hash T-01 **4/4 identik**.
- [x] Tombol **Cek** halaman LPJ **tetap** menagih "Tanggal dana masuk" (browser T-19.6).
- [x] Input "Tanggal dana masuk" **masih ada** · menu kiri utuh (browser T-19.1/T-19.2).

### T-20 — Gate akhir + dokumentasi
- [x] `npm run build` exit 0 · semua oracle PASS · G-0…G-9 hijau (kecuali catatan G-5).
- [x] `STATE.MD` + `DECISIONS.MD` + `RISKS.MD` + `QUESTIONS.MD` + checklist pack + `BUILD-REPORT.MD` diperbarui.

---

## 2. Acceptance Fitur (dipetakan ke PRD US-01…US-06)

### AF-01 — Dropdown NoBukti mirip (US-01)
- [x] Baris Mamin dengan baris lain (rekening + kegiatan sama, bulan beda) → kandidat dengan label bulan · NoBukti · uraian · nominal (T-17.7/17.8).
- [x] Baris tanpa `kodeKegiatan` → pesan jujur, bukan daftar asal (oracle T-02.1 + T-13.3b).
- [x] Memilih kandidat → panel berpindah: header, form, preview, target simpan ikut baris baru (T-17.9, T-17.16).
- [x] Isian belum disimpan → dialog "simpan dulu?"; **Batal** → isian lama utuh; **Simpan & pindah** → tersimpan di baris lama lalu pindah (T-17.11…T-17.15).

### AF-02 — Form Mamin 6 seksi (US-02)
- [x] 6 seksi tampil: 1 Data Dasar · 2 Daftar Hadir · 3 Surat Undangan · 4 Surat Pesanan · 5 Buku Tamu · 6 Notulen (T-17.2).
- [ ] Seksi 1: Nama Kegiatan panjang **wrap** — **belum diuji khusus** (tidak ada asersi tinggi/scroll textarea).
- [x] Seksi 2: NIP terisi otomatis dari Data Guru/Tendik (T-17.24).
- [x] Seksi 3: hanya Tanggal Surat + Nomor; field §3.2 tanpa input (T-17.5).
- [x] Seksi 4: Sifat / Perihal / Isi Surat Pesanan tanpa input (oracle T-07).
- [x] Seksi 5: Tanggal / Ingin Bertemu / Tujuan / Uraian / Diterima Oleh tanpa input (oracle T-07).
- [ ] Seksi 6: tombol "Generate AI Notulen" **ada**, tetapi **isi notulen belum diuji** (butuh API/internet; E-12 tidak dijalankan).
- [x] 17 field §3.2 tampil utuh di preview dan tidak ada input untuknya (oracle + preview AF-04).

### AF-03 — Preview = cetakan (R-1)
- [ ] Data preview **identik** dengan area cetak untuk 5 dokumen Mamin — **belum diuji** (tidak ada render PDF cetak di sprint ini).
- [x] Field yang diisi user **tidak** ditimpa nilai otomatis (oracle T-03.2; browser T-17.16 setelah reload).

### AF-04 — Daftar Hadir + NIP (US-03)
- [x] Kolom NIP tercetak; kolom TANDA TANGAN tetap ada dan kosong (T-17.23).
- [x] Peserta tanpa NIP → kolom kosong (T-17.25).
- [ ] Cetak A4: tabel tidak meluber — **belum diuji** (butuh PDF/cetak fisik).

### AF-05 — Tanggal dana masuk (US-04)
- [x] Input "Tanggal dana masuk" **tidak ada** di sidebar 4 kategori (T-18.LPJ × 4).
- [x] Gate sidebar **tidak** menagih "Tanggal dana masuk" (T-17.4).
- [x] Halaman Dokumen LPJ **tetap** punya input tersebut (T-19.2).

### AF-06 — Dokumen PBJ di sidebar (US-05)
- [x] Blok PBJ tampil di bawah form LPJ, di atas Panel Preview (AF-03/AF-04).
- [x] 6 tab: Perencanaan · Surat Pesanan · BAHP · BAST · Negosiasi · Data (T-17.18).
- [x] Isian otomatis: Tanggal · Kegiatan/Pekerjaan · Alokasi · No. Bukti (T-17.19).
- [x] Simpan → reload → isi PBJ utuh di NoBukti sama; NoBukti lain kosong (T-17.27/17.29/17.30).
- [x] Form PBJ global (Dokumen Kelengkapan) tidak berubah (G-9 diff kosong).
- [x] Panel preview: LPJ dulu → PBJ menyusul; 0 nama dobel (T-17.20…T-17.22).

### AF-07 — Halaman LPJ tidak berubah (US-06)
- [x] Hash render form+docs **4/4 identik**.
- [x] Halaman LPJ: tanpa dropdown, tanpa blok PBJ 018, tanpa 6 seksi, **dengan** input tanggal dana masuk (T-19.2…T-19.5).
- [x] `readinessCheck` 0 diff → Cek halaman LPJ tetap menagih "Tanggal dana masuk" (T-19.6).

---

## 3. Edge Cases

| # | Kondisi | Harapan | Bukti |
|---|---|---|---|
| E-1 | Baris tanpa `noBukti` | Simpan `disabled` + alasan | ✅ oracle T-12 (NoBukti kosong ditolak) · tombol `disabled` terlihat di kode (`bisaSimpan`) |
| E-2 | JSON rusak di `spj_lpj_bku`/`spj_pbj_bku` | panel tetap terbuka, `bacaEntri` = `null` | ✅ oracle T-12.4 |
| E-3 | Baris tanpa `kodeRekening`/`kodeKegiatan` | dropdown pesan jujur, 0 kandidat | ✅ oracle T-02.1/T-02.7 |
| E-4 | Data BKU kosong | halaman normal, sidebar tak dirender | ⚠️ **tidak diuji browser** (kode: sidebar hanya dirender bila baris dipilih) |
| E-5 | Kandidat NoBukti sama, bulan beda | tetap kandidat | ✅ oracle T-02 |
| E-6 | Dua kandidat NoBukti sama | keduanya tampil, label beda bulan | ✅ oracle T-02 |
| E-7 | Data Sekolah kosong | tempat "Ruang Rapat ", alamat kosong | ✅ oracle T-03.4 |
| E-8 | Data Guru/Tendik kosong | daftar kosong + pesan "belum ada data" | ⚠️ **tidak diuji browser** (hanya jalur kosong di util) |
| E-9 | Peserta tanpa NIP | kolom kosong | ✅ browser T-17.25 |
| E-10 | PBJ baris A → pindah baris B | blok B kosong, A utuh | ✅ browser T-17.30 |
| E-11 | Nama dokumen bentrok | sufiks " PBJ", LPJ menang | ✅ oracle T-15 + browser T-17.22 |
| E-12 | Generate AI Notulen gagal | toast jujur, form tak rusak | ⚠️ **tidak diuji** (butuh kegagalan API) |

---

## 4. Checklist Penutupan Sprint

- [x] **C-01** G-0…G-9 hijau (G-5 dicatat 2 file lewat 2–5 baris), output dikutip di `BUILD-REPORT.MD`.
- [x] **C-02** AF-01…AF-07 diverifikasi (oracle + browser + screenshot); 4 butir bertanda `[ ]` di atas = **belum**, ditulis apa adanya.
- [x] **C-03** Oracle T-01…T-15 PASS — 189 PASS / 0 FAIL (10 skrip) + baseline 4/4.
- [x] **C-04** `STATE.MD` + `DECISIONS.MD` + `RISKS.MD` + `QUESTIONS.MD` (D-1/D-2 ditutup) + checklist ini + `BUILD-REPORT.MD`.
- [x] **C-05** 12 skrip uji sementara + baseline JSON dihapus setelah hasil dikutip; salinan di `.workbuddy-ai/backup-sprint018-tests/`.
- [x] **C-06** Daftar BELUM/UNTESTED ditulis jujur (§6).

---

## 5. Bukti yang Wajib Dilampirkan

1. `✓ built in 14.11s` (2026-10-22 16:36) · `✓ built in 12.35s` (final pasca-C-05) · **`✓ built in 9.76s` & `12.76s`** (pasca-revisi UI 17:0x).
2. Oracle: 189 PASS / 0 FAIL (rincian di BUILD-REPORT §4).
3. Hash baseline: honor `72e3a69d…` · perjalanan `45d43328…` · pemeliharaan `0cebac48…` (identik) · mamin `5a479f2c…` (delta NIP, EX-1).
4. Screenshot: `AF-01-dropdown-kandidat.png` · `AF-02-enam-seksi.png` · `AF-03-pbj-terisi-otomatis.png` ·
   `AF-04-preview-satu-daftar.png` · `AF-05-daftar-hadir-nip.png` · `AF-06-dialog-simpan-dulu.png` ·
   **`revisi-daftar-hadir.png` · `revisi-rincian-pesanan.png` · `revisi-pbj-siplah.png` ·
   `paritas-A-halaman-lpj.png` · `paritas-B-sidebar.png`** (folder `.workbuddy-ai/bukti-ui-20261022/`).
5. `wc -l` file baru: lihat BUILD-REPORT §3 (+ §9 untuk berkas revisi).
6. G-3 = 0 hit · G-4 = 0 hit · diff file tabu = kosong.
7. Browser pasca-revisi: revisi **33** · paritas **8** · garis **7** · T-17 **31** · T-18 **51** · T-19 **7** = **137 PASS / 0 FAIL**.

---

## 6. Hasil Gate & Yang BELUM Diuji

**Dijalankan dan lulus:**
- Build final `✓ built in 14.11s`; 10 oracle (189 PASS / 0 FAIL); baseline 4/4.
- Browser (Edge headless, dev `:5199`): T-17 **31 PASS** · T-18 **51 PASS** · T-19 **7 PASS** — total **89 PASS / 0 FAIL**, 0 console error.
- Gate file tabu (G-1/G-2/G-7/G-9) diff kosong; G-8 hanya blok `daftar_hadir`.
- **Revisi UI 17:0x & 17:3x** — build `✓ built in 9.76s` · `12.76s` · `11.39s` · **`12.58s`** · **`11.74s`**; revisi **33** · paritas **8** · garis **7** · T-17 **31** · T-18 **51** · T-19 **7** = **137 PASS / 0 FAIL**, 0 console error (§7).

**BELUM diuji (jujur, bukan "lulus"):**
1. **Preview = cetakan** (AF-03, T-17 butir 3) — tidak ada perbandingan PDF cetak vs preview.
2. **Cetak A4 tidak meluber** (AF-04 butir 3) — butuh cetak/PDF.
3. **Isi Notulen AI** (AF-02 butir 6) & **E-12 kegagalan generate** — butuh API/internet.
4. **Wrap Nama Kegiatan** (AF-02 butir 2) — tidak ada asersi khusus.
5. **E-4 (data BKU kosong)** & **E-8 (Data GTK kosong)** — belum diuji di browser.
6. **`PUNGUT_PPH`** — baris tidak bisa dibuka (desain Sprint 017), jadi 8/9 tipe non-LPJ diuji browser.
7. **Uji dengan data BKU nyata xcode** — fixture sintetis (15 baris) dipakai; angka nyata belum.
8. **Tampilan visual "premium"** — dibuktikan lewat struktur DOM + screenshot, bukan penilaian selera.
9. **Mode PBJ tersimpan antar sesi** — diuji hanya sampai `localStorage` terisi, bukan setelah reload penuh.

---

## 7. Revisi UI 2026-10-22 (6 permintaan user)

| # | Permintaan | Yang dikerjakan | Bukti |
|---|---|---|---|
| 1 | Judul tombol "NoBukti Mirip" terdengar tidak profesional | Tombol jadi **"Baris Serupa"** + chip jumlah kandidat; popover berbunyi "Kegiatan serupa · periode berbeda" | R1.1–R1.2 PASS · `AF-01-dropdown-kandidat.png` |
| 2 | Hapus 2 banner `…dari BKU …` | Chip di `DetailDokumenLpjHeader` dihapus (Undo tetap, hanya bila ada field tertimpa); chip `bkuSumber` di `DokumenFormPreview` dihapus | R2.1–R2.2 PASS |
| 3 | "Seksi 1 — Data Dasar" dst. → kata modern premium | 6 judul: **Identitas Kegiatan · Kehadiran Peserta · Undangan Kedinasan · Pesanan Konsumsi · Buku Tamu · Notulen Rapat**; nomor seksi jadi chip `01`…`06`; teks bantuan "(Seksi 1)" → "(bagian 01)" | R3.1–R3.2 PASS · `AF-02-enam-seksi.png` |
| 4 | Struktur tabel Daftar Hadir: No, Nama, NIP, Jabatan | Tabel `<table table-fixed>` + `<colgroup>` (34 / auto / 148 / 128 / … / 34); header `No|Nama|NIP|Jabatan`; tidak ada lagi tumpang tindih | R4.1–R4.8 PASS · `revisi-daftar-hadir.png` |
| 5 | Form Rincian Pesanan = halaman LPJ | Blok rincian disamakan: toggle 2 seksi, penomoran global 1…10, 3 kolom Uraian/Satuan/Jumlah, "Isi menu baku" hanya saat kosong, baris warisan tetap editable; urutan field: Tanggal → Nomor → Kepada Yth → Alamat → Rincian → Hari/Jenis/Jumlah. **Bug ditemukan & diperbaiki saat verifikasi:** input `flex-1` yang juga memakai `w-full` menyusut jadi 18px sehingga teks Uraian/Nama tamu hilang — ditambahkan asersi R5.8/R5.9 (lebar ≥300px + `scrollWidth ≤ clientWidth`) | **paritas 8/8 PASS** · R5.8/R5.9 PASS · `paritas-A-halaman-lpj.png` / `paritas-B-sidebar.png` / `FINAL-2-rincian-pesanan.png` |
| 6 | Dokumen PBJ belum punya konsep SIPLAH / NON-SIPLAH | Toggle **NON-SIPLAH / SIPLAH** di `SidebarPbj`; SIPLAH → hanya tab Perencanaan (1 dokumen) + preview hanya `PERENCANAAN PBJ`; mode disimpan di `spj_pbj_mode`; helper `tabsUntukMode()` | R6.1–R6.7 PASS · `revisi-pbj-siplah.png` |

**Satu perbedaan yang disengaja (D-7):** label toggle di halaman LPJ berbunyi
`Seksi Nasi Box (6)`, di sidebar `Nasi Box (6)` — kata "Seksi" dibuang mengikuti poin 3.
Struktur, perilaku, penomoran, dan isi menu **identik** (paritas P2–P8 PASS).

**Revisi lanjutan 17:3x (3 permintaan user):**

| # | Permintaan | Yang dikerjakan | Bukti |
|---|---|---|---|
| 7 | Judul tombol → "Kode Rekening / Kode Kegiatan Serupa" | label diganti utuh, chip kandidat tetap | R1.1 / R1.3 PASS |
| 8 | Rincian pesanan "masih acak-acakan" | `<table table-fixed>` + kepala kolom No·Uraian·Satuan·Jumlah, grup seksi baris `colSpan`, input tanpa kotak (hover/fokus saja) | R5.1b PASS · `FINAL-2-rincian-pesanan.png` |
| 9 | Hilangkan garis tipis di dokumen non-tabel | grid global `td/th` dihapus; blok surat `.surat-polos` (garis sel + putus-putus + garis bawah field hilang, muncul saat hover/fokus) | `cek-019-garis.cjs` **7/7** · `ZOOM-kertas-undangan.png` |

**Invarian baru yang dijaga uji:** tidak ada sel bergaris yang tabelnya tidak menyatakan
border sendiri — diaudit pada 15 kertas dari 2 kategori (Mamin & Honor): **0 pelanggaran**.
DAFTAR HADIR & SURAT PESANAN tetap bertabel (garis tidak ikut hilang).

**Gate ulang setelah revisi:** G-0 `✓ built in 9.76s` · `12.76s` · `11.39s` · `12.58s` ·
`11.74s` (exit 0) · G-5 semua berkas baru revisi ≤179 baris · 0 console error di keenam skrip.

---

**MULAI:** TASK GATE G-0 dijalankan.
**SELESAI:** C-01…C-06 tercentang dengan bukti, bukan klaim — **plus revisi UI 9 butir (§7) lulus 137 PASS / 0 FAIL.**

---

## §8 — Revisi panel preview & duplikat input (2026-10-22 18:0x)

Sumber: 4 permintaan user ("tinggi card panel preview se tinggi kertas A4/F4 · dokumen di
tengah · duplikat Nama Kegiatan di Kehadiran Peserta · duplikat Tanggal di Dokumen PBJ").

| # | Permintaan | Bukti terukur | Status |
|---|---|---|---|
| 1 | Tinggi kartu panel preview = tinggi kertas terpilih (A4/F4) | area dokumen **1153px** (A4 297mm+30) · **1277px** (F4 330mm+30); sebelumnya dipatok `100vh-104px` = **896px** sehingga satu lembar A4 terpotong | PASS |
| 2 | Dokumen di tengah kiri-kanan | jarak kiri/kanan **291/293px** (A4), tetap ≤2px setelah ganti F4 & pada panel sempit; sebelumnya **8/575px** | PASS |
| 3 | Hapus duplikat "Nama Kegiatan" di card Kehadiran Peserta | label "Keterangan / Judul Acara" **0** · "Nama Kegiatan" di Identitas Kegiatan tetap ada | PASS |
| 4 | Hapus duplikat "Tanggal" & "Kegiatan/Pekerjaan" di card Dokumen PBJ | label PBJ Perencanaan = `Nomor Surat · Spesifikasi · Alokasi · Syarat (a)(b)(c) · Pelaksana` — tanpa Tanggal/Kegiatan; "Nama Kegiatan" diubah → dokumen PBJ ikut memuat teks baru | PASS |

**Akar masalah yang ditemukan (bukan ditebak):**
- kertas menempel kiri = `transform-origin: top left` + `scale()` tanpa pergeseran horizontal;
- kartu terpotong = `max-h-[calc(100vh-104px)]` pada kartu (bukan tinggi kertas);
- dua duplikat input = field yang punya sumber tunggal tetap dirender sebagai input.

**Efek samping yang ditemukan sendiri dari screenshot (bukan dilaporkan user) dan sudah diperbaiki:**
toolbar panel `sticky top-0` menempel ke viewport & bertabrakan dengan header aplikasi setelah
kartu tidak lagi menjadi wadah scroll → `relative`; kolom preview layout `side` diberi
`max-h-[calc(100vh-104px)] + overflow-y-auto` agar `sticky` tidak memaku kartu yang lebih tinggi
dari layar (kalau tidak, bagian bawah dokumen tak pernah bisa dilihat).

**Gate ulang:** G-0 `✓ built in 10.49s` · `11.71s` (exit 0) · G-5 semua berkas yang disentuh
≤179 baris · 0 console error di ketujuh skrip uji.

**Jujur — belum diuji:** hasil CETAK/PDF setelah perubahan panel (verifikasi hanya di layar),
tampilan pada viewport <700px, penilaian visual subjektif.

---

## §9 — Tempat di atas TTD = "Cikalongwetan" (2026-10-22 18:2x)

Sumber: permintaan user "nama tempat sebelum tanggal di atas ttd nya tolong jadikan default
Cikalongwetan saja di semua dokumen".

**Bug yang ditemukan (diukur, bukan ditebak):** `SignatureFooter` membaca `data.tempat` —
field yang artinya **tempat ACARA**. Pada 4 kategori BKU (Mamin · Honor · Transport ·
Pemeliharaan) dokumen **Undangan · Pesanan · Daftar Penerima** mencetak
`Ruang Rapat SD NEGERI LEBAKLEUNGSIR, 22 Oktober 2026` di atas tanda tangan. Penyebab
nilai: `terapkanOtomatisMamin()` mengisi `formData.tempat = "Ruang Rapat <sekolah>"` dan
dipanggil untuk SEMUA kategori di sidebar BKU.

| # | Invarian | Bukti | Status |
|---|---|---|---|
| 1 | Semua baris `<tempat>, <tanggal>` di atas TTD berbunyi **Cikalongwetan** | 17 dokumen × 4 kategori: semuanya `Cikalongwetan, 22 Oktober 2026` | PASS |
| 2 | Tidak ada lagi "Ruang Rapat …" di tempat TTD | 0 temuan | PASS |
| 3 | Tidak ada lagi "Bandung Barat" di tempat TTD (default lama SK Honorer) | 0 temuan | PASS |
| 4 | Tempat TTD punya kunci SENDIRI (`tempatTtd`), tidak meminjam `tempat` | `utils/tempatTtd.js` + `SignatureFooter` | PASS |

**Perubahan:** util baru `utils/tempatTtd.js` (`TEMPAT_TTD`, `tempatTtdDari()`) ·
`SignatureFooter` membaca `tempatTtd` (input edit ikut pindah kunci) ·
`previewDocs.js` Lembar Pengaduan & Kritik-Saran memakai `TEMPAT_TTD` (dulu
`bku.footer.tempat || sekolah.kabupaten`) · `templateConfig.js` default SK Honorer
`tempatTtd: 'Bandung Barat'` → `'Cikalongwetan'`.

**Gate ulang:** `✓ built in 9.96s` (exit 0) · `cek-021-revisi.cjs` **6/6** · total
**160 PASS / 0 FAIL** · 0 console error.

**Jujur — belum diuji:** dokumen SK Honorer (butuh baris penerima dulu), Lembar
Pengaduan/Kritik-Saran (tidak terjangkau dari BKU seed), hasil CETAK/PDF.

---

## §10 — Struktur blok penerima Surat Undangan / Surat Pesanan (2026-10-22 18:4x)

Sumber: permintaan user "coba cek struktur format dokumen surat undangan, kenapa ada
nama jl raya setelah Kepada Yth, Bapak/Ibu Guru !!! sedangkan biasanya itu default di
tempat saja".

**Bug yang ditemukan (diukur):** probe 12 baris pertama kertas `BNU-01/doc0`:

```
Perihal : Undangan Rapat Guru   Kepada Yth,   Bapak/Ibu Guru
Jl. Raya Cikalongwetan No. 1        ← alamat sekolah bocor (2x)
Jl. Raya Cikalongwetan No. 1
Di   Di                              ← label 'Di' + nilai default 'Di'
Tempat
```

Empat penyebab bertumpuk: (1) `maminOtomatis.js` mengisi `alamatUndangan` DAN
`instansiUndangan` dengan alamat sekolah — keduanya label kosong, jadi tercetak
mentah di bawah penerima; (2) label `'Di'` + nilai default `'Di'` → "Di Di";
(3) `diPesanan` default `'Di tempat'` + label `'Di'` → "Di Di tempat"; (4)
`TabelLetterHeader` merender `<PlaceholderText label="">` → literal "[ isi]".

| # | Invarian | Bukti | Status |
|---|---|---|---|
| 1 | Alamat sekolah muncul TEPAT 1x per kertas (hanya di kop) | 8 kertas undangan+pesanan × 2 baris: semua = 1 | PASS |
| 2 | Tidak ada placeholder "[ di]" / "[ isi]" dari label kosong | 0 temuan | PASS |
| 3 | Tidak ada duplikasi "Di Di" / "Di Di tempat" | 0 sel "Di" / "Di tempat" | PASS |
| 4 | Blok penerima: "Kepada Yth," → penerima → "di" → "tempat" (2 baris terakhir dari NILAI field) | urutan terverifikasi `Kepada Yth,` < `Bapak/Ibu Guru` < `di` < `tempat` | PASS |
| 5 | Undangan tetap mencetak penerima auto-isi "Bapak/Ibu Guru" | PASS U7 | PASS |

**Perubahan:** `maminOtomatis.js` — cabut `isi(fd,'alamatUndangan',…)` &
`isi(fd,'instansiUndangan',…)` + variabel `alamatSekolah` (tak terpakai) ·
`templateConfig.js` — `diUndangan`/`tempatUndangan`/`diPesanan` + field baru
`tempatPesanan`: **label dikosongkan**, default nilai `'di'`/`'tempat'` (nilai inilah
yang tercetak, bukan label) · `TabelLetterHeader.jsx` — helper `kosongTanpaLabel()`
menyembunyikan baris/sel kanan tanpa label DAN tanpa nilai.

**Catatan lingkup:** template `pbj_pesanan` (kartu Kelengkapan, dari sheet xlsx PBJ)
sengaja TIDAK diberi baris "di/tempat" — struktur asli sheet-nya hanya "Kepada Yth,"
+ alamat toko; assertion U6 hanya berlaku untuk template Mamin.

**Gate ulang:** `✓ built in 8.91s` (exit 0) · `cek-022-revisi.cjs` **35/35** ·
total **195 PASS / 0 FAIL** · 0 console error.

**Jujur — belum diuji:** hasil CETAK/PDF, tampilan viewport <700px, penilaian
visual subjektif, commit & push (menunggu izin user).

---

## §11 — PENUTUPAN SPRINT 018 (2026-10-22 19:5x)

Keputusan user: **"tutup sprint dan simpan state terakhir"** (2026-10-22 19:4x).

### 11.1 Bukti final (dijalankan ulang saat penutupan, bukan dikutip dari sesi lalu)

| Gate | Hasil | Catatan |
|---|---|---|
| Build | `✓ built in 8.91s` (exit 0) | pasca-perubahan Undangan 18:4x |
| Oracle Sprint 018 | **190 PASS / 0 FAIL** (11 skrip) | bundel esbuild → node; dijalankan dari `.workbuddy-ai/backup-sprint018-tests/` |
| Browser (Edge headless `:5199`) | **195 PASS / 0 FAIL** (9 skrip) | revisi022 35 · tempat 6 · revisi020 17 · revisi 33 · paritas 8 · garis 7 · T-17 31 · T-18 51 · T-19 7 |
| Console error | 0 | keenam skrip browser |

### 11.2 ⚠️ 14 asersi oracle DIPERBARUI saat penutupan (dicatat jujur)

Menjalankan ulang oracle menemukan **14 FAIL — semunya asersi basi**, yaitu mengunci
label/perilaku LAMA yang sengaja diubah revisi user. Bukan kode yang rusak. Skrip di
`.workbuddy-ai/backup-sprint018-tests/` diperbarui ke perilaku yang benar:

| Skrip | Asersi | Sebelum (basi) | Sesudah (benar) |
|---|---|---|---|
| `test-dropdown-mirip.mjs` | T-13.1a, T-13.4a | tombol "NoBukti mirip" | "Kode Rekening / Kode Kegiatan Serupa" (label pasca-revisi 17:0x & 17:3x) |
| `test-mamin-otomatis.mjs` | T-03.1j, T-03.1k | `alamatUndangan`/`instansiUndangan` = alamat sekolah | **TIDAK** diisi otomatis (dibalik — temuan user 18:4x, alamat bocor ke blok penerima) |
| `test-mamin-otomatis.mjs` | T-03.7a, T-03.8a | jumlah field otomatis 19 / 21 | 17 / 19 (2 field alamat dicabut dari daftar) |
| `test-mamin-seksi.mjs` | T-06.1a, T-06.1b ×6 | judul "Seksi N — …" | judul fungsional pasca-revisi 17:0x (Identitas Kegiatan · Kehadiran Peserta · Undangan Kedinasan · Pesanan Konsumsi · Buku Tamu · Notulen Rapat) |
| `test-mamin-seksi.mjs` | T-08.4b, T-08.5b | "Seksi 1 — Data Dasar" | "Identitas Kegiatan" |

T-06.1a juga dibuat lebih kuat: pencarian judul lewat tag `<h3>` (`>judul</h3>`),
karena `indexOf` polos menemukan kata "Buku Tamu" di teks penjelas seksi 1
("…dipakai bersama oleh Undangan, Pesanan, dan Buku Tamu…") sebelum judul seksi.

### 11.3 Checklist penutupan (C-01…C-08)

- [x] **C-01** G-0…G-9 hijau (G-5 dicatat 2 file lewat 2–5 baris).
- [x] **C-02** AF-01…AF-07 diverifikasi; butir `[ ]` di §6 = **belum**, ditulis apa adanya.
- [x] **C-03** Oracle 190 PASS / 0 FAIL (11 skrip) + baseline hash 4/4 — dijalankan ulang saat penutupan.
- [x] **C-04** `STATE.MD` + `DECISIONS.MD` + `RISKS.MD` + `QUESTIONS.MD` + checklist + `BUILD-REPORT.MD` + §11 ini.
- [x] **C-05** Skrip uji sementara tidak ada di repo; salinan kanonik + asersi terbaru di `.workbuddy-ai/backup-sprint018-tests/` (11 .mjs + baseline JSON).
- [x] **C-06** Daftar BELUM/UNTESTED ditulis jujur (§6 + §11.4).
- [x] **C-07** Oracle dijalankan ULANG pada kode akhir (bukan angka sesi lalu) — hasilnya 14 asersi basi ditemukan & diperbarui (§11.2).
- [x] **C-08** Pack `architect-packs/` TIDAK disinkronkan ulang — sesuai pola sprint 017 (salinan = snapshot handoff, bukan arsip akhir).

### 11.4 BELUM diuji (jujur — dibawa ke luar sprint)

1. **Preview = cetakan** — tidak ada perbandingan PDF cetak vs preview (AF-03, T-17.3).
2. **Cetak A4 tidak meluber** — butuh cetak/PDF nyata (AF-04.3), termasuk setelah grid garis dihapus (17:3x) dan panel setinggi kertas (18:0x).
3. **Isi Notulen AI** & **E-12 kegagalan generate** — butuh API/internet.
4. **SK Honorer** (butuh baris penerima) & **Lembar Pengaduan/Kritik-Saran** (tak terjangkau dari seed BKU).
5. **Wrap Nama Kegiatan**, **E-4 (BKU kosong)**, **E-8 (GTK kosong)**, **`PUNGUT_PPH`** (baris tak bisa dibuka — desain 017).
6. **Data BKU nyata xcode** — fixture sintetis 15 baris dipakai.
7. **Tampilan viewport <700px** & penilaian visual "premium" (subjektif).
8. **Mode PBJ tersimpan antar sesi** — baru diuji sampai `localStorage` terisi.
9. **Commit & push** — belum; menunggu izin user (§11.5).

### 11.5 Keadaan repo saat penutupan

- Branch `main` @ `c149a28` (**ahead 1, belum di-push**); working tree **22 file berubah + 21 untracked** (kode baru sprint, pack sprint-018, 2 scratch encoding `diag-encoding.mjs`/`fix-encoding.mjs` — alat perbaikan mojibake sekali-pakai, tidak direferensi kode mana pun).
- **Belum di-commit** — menunggu kuasa user (aturan repo: dry run → lapor → tunggu user).
