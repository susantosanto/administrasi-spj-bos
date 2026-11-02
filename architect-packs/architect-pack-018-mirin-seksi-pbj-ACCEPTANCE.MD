# ACCEPTANCE — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **DRAFT — menunggu persetujuan user.**
> Dijalankan **setelah** BLUEPRINT dieksekusi. `/acceptance-runner` wajib di **konteks segar**
> (AGENTS.MD). Setiap butir butuh **bukti**: output asli, screenshot, atau angka.
> Klaim tanpa bukti = **FAIL**.

---

## 0. TASK GATE (wajib lulus sebelum butir lain dinilai)

| # | Gate | Perintah / cara | Lulus bila |
|---|---|---|---|
| G-0 | Build | `cd spj-frontend && npm run build` | `exit 0`, `✓ built in …` |
| G-1 | `bkuParser.js` tabu | `git diff --stat -- spj-frontend/src/utils/bkuParser.js` | **kosong** |
| G-2 | Dependency | `git diff --stat -- spj-frontend/package.json spj-frontend/package-lock.json` | **kosong** |
| G-3 | Storage terpusat | `rg -n "localStorage\." <file baru §BLUEPRINT 2>` | **0 hit** |
| G-4 | Blue-only | `rg -n "\b(bg\|text\|border\|ring)-(emerald\|amber\|rose\|violet\|cyan)" <file baru>` | **0 hit** |
| G-5 | Batas modul | `wc -l` semua file baru | ≤ batas BLUEPRINT §2 |
| G-6 | Halaman LPJ utuh | `node test-mamin-baseline.mjs` (hash 4 kategori) + `git diff --stat -- .../DokumenSPJPage.jsx` | hash **4/4 identik** T-01 · diff **kosong** |
| G-7 | Gate lama utuh | `git diff --stat -- .../SummaryCard.jsx` | **kosong** |
| G-8 | `templateConfig` sempit | `git diff -- .../templateConfig.js` | **hanya** blok `daftar_hadir` (kolom NIP) |
| G-9 | Halaman Kelengkapan utuh | `git diff --stat -- .../DokumenKelengkapanPage.jsx` | **kosong** |

> ⚠️ Pola grep bisa berbohong (RISKS.MD): setiap hit G-3/G-4 **wajib dibuka isinya**.

---

## 1. Gate Per Fase (mengikuti BLUEPRINT §4)

### T-01 — Baseline render
- [ ] `node test-mamin-baseline.mjs` mencetak **4 hash** (honor · perjalanan_dinas · mamin · pemeliharaan).
- [ ] `test-mamin-baseline.json` tersimpan → dipakai T-08/T-11/T-19.

### T-02 — `bkuMirip.js`
- [ ] Baris tanpa `kodeKegiatan` → kandidat `[]`.
- [ ] 2 baris cocok (rekening + kegiatan sama, bulan beda) → **2 kandidat**.
- [ ] `kodeRekening` berbeda → ditolak.
- [ ] `kodeKegiatan` berbeda → ditolak.
- [ ] Bulan sama → ditolak (A-1).
- [ ] Baris aktif → ditolak.
- [ ] Label memuat bulan + NoBukti + uraian + nominal.

### T-03 — `maminOtomatis.js`
- [ ] Form kosong → **17 field** terisi sesuai sumber (template/sekolah/pejabat/BKU).
- [ ] Field yang sudah diisi user **tidak** ditimpa.
- [ ] `bukuTamu` digabung per-field (field lain utuh).
- [ ] Tanpa Data Sekolah → field sekolah `''` (jujur).
- [ ] `tanggalDanaMasuk` = `bku.tanggal`.
- [ ] Fungsi murni (argumen sama → hasil sama; tanpa I/O).

### T-04 — `readinessSidebar.js`
- [ ] `readinessSidebar({})` → 2 pelanggaran (Nomor Surat + Daftar isi), **tanpa** "Tanggal dana masuk".
- [ ] `SummaryCard.jsx` 0 diff.

### T-05 — Gate FASE 0 ⛔
- [ ] Build exit 0 · T-01 4 hash · T-02/T-03/T-04 PASS · diff hanya file baru.
- [ ] **Bila gagal: STOP.**

### T-06 — 6 seksi (shell + seksi 1–3)
- [ ] Build exit 0 · 4 file ≤200 baris.
- [ ] Label seksi 1–6 tampil berurutan.
- [ ] Seksi 1: Tanggal (read-only, dari BKU) · No Surat + Generate · Waktu · Tempat (default "Ruang Rapat <nama sekolah>") · Nama Kegiatan (wrap).
- [ ] Seksi 2: kolom NO/NAMA/**NIP**/JABATAN; **tanpa input TTD**.
- [ ] Seksi 3: **hanya** Tanggal Surat + Nomor (+Generate).
- [ ] 0 field §REQUIREMENTS 3.2 tampil sebagai input.
- [ ] 0 `localStorage.` langsung.

### T-07 — Seksi 4–6
- [ ] Build exit 0 · 3 file ≤200 baris.
- [ ] Seksi 4: tidak ada input Sifat / Perihal / Isi Surat Pesanan.
- [ ] Seksi 5: tidak ada input Tanggal / Ingin Bertemu / Tujuan / Uraian / Diterima Oleh.
- [ ] Seksi 6: tombol "Generate AI Notulen" ada; hasil → `formData.resume`.
- [ ] 0 key form dobel antar seksi (oracle memeriksa daftar key yang di-set).

### T-08 — Sambung ke `DokumenFormPreview`
- [ ] Build exit 0 · `DokumenFormPreview.jsx` **+≤60 baris**.
- [ ] Diff hanya 1 kondisi varian + 2 kondisi sembunyikan tanggal dana masuk.
- [ ] **Hash halaman LPJ 4/4 identik** (T-01).
- [ ] 0 error render.

### T-09 — Merge otomatis + gate sidebar
- [ ] `formData` sidebar berisi 17 field otomatis.
- [ ] Gate sidebar **tidak** memuat "Tanggal dana masuk".
- [ ] `DokumenSPJPage.jsx` 0 diff · hash LPJ 4/4 identik.

### T-10 — Kolom NIP
- [ ] `templateConfig.js` diff **hanya** blok `daftar_hadir` + kolom NIP.
- [ ] Rows Daftar Hadir membawa `nip` (1 peserta tanpa NIP → kolom kosong).
- [ ] Kolom "TANDA TANGAN" **tetap ada** di config.

### T-11 — Gate FASE 1 ⛔
- [ ] Build exit 0 · oracle T-06…T-10 PASS · hash LPJ 4/4 identik · G-1/G-2/G-7 hijau.
- [ ] **Bila hash berubah: STOP.**

### T-12 — `pbjBkuStore.js`
- [ ] Round-trip simpan→baca · 2 NoBukti tidak saling timpa · NoBukti kosong ditolak & storage tidak bertambah · data rusak → `null` · `hapusEntri` hanya 1 entri · `spj_pbj_form` tidak berubah.

### T-13 — Dropdown kandidat
- [ ] 0 kandidat → pesan jujur; ≥1 → item memuat bulan+NoBukti+uraian+nominal.
- [ ] Isian dirty → dialog "simpan dulu?" muncul.
- [ ] Pilih kandidat → `onNavigate(kandidat)` dipanggil.
- [ ] File ≤180 baris.

### T-14 — Blok PBJ
- [ ] 2 file ≤200 baris · prefill 10 field BKU benar · entri tersimpan menang atas prefill.
- [ ] Blok PBJ **di bawah form LPJ, di atas Panel Preview** (layout stack).
- [ ] Blok PBJ **tidak** muncul di layout `side` (halaman LPJ).
- [ ] `DokumenKelengkapanPage.jsx` 0 diff.

### T-15 — Preview satu daftar
- [ ] Urutan docs: LPJ (≥1) → PBJ (≥1).
- [ ] **0 nama dokumen dobel** (LPJ menang bila bentrok).
- [ ] `previewDocs.js` diff hanya `buildPreviewDocs`/`maminDocs`.

### T-16 — Gate FASE 2 ⛔
- [ ] Build exit 0 · oracle T-12…T-15 PASS · G-6/G-7/G-9 hijau.

### T-17 — Uji browser alur lengkap
- [ ] Dev server `:5173` → Data BKU → klik baris Mamin → dropdown kandidat → pilih → panel berpindah.
- [ ] Isi 6 seksi → tombol **Cek** → blok PBJ terisi otomatis → Simpan LPJ → Simpan PBJ → reload → utuh.
- [ ] Cetak: preview = cetakan (AF-03).
- [ ] 0 console error · screenshot AF-01…AF-06.

### T-18 — Uji 4 kategori + non-LPJ
- [ ] 4 kategori berform: dropdown tersedia (Mamin 6 seksi), 0 input "Tanggal dana masuk".
- [ ] 9 tipe non-LPJ: sidebar ≤576px, tab Detail, **tanpa** dropdown/blok PBJ.
- [ ] 0 console error.

### T-19 — Regresi halaman Dokumen LPJ
- [ ] Hash T-01 **4/4 identik**.
- [ ] Tombol **Cek** halaman LPJ **tetap** menagih "Tanggal dana masuk" (perilaku lama).
- [ ] Input "Tanggal dana masuk" **masih ada** di halaman LPJ · `MenuGuide` 4 menu tetap.

### T-20 — Gate akhir + dokumentasi
- [ ] `npm run build` exit 0 · semua oracle PASS · G-0…G-9 hijau.
- [ ] `STATE.MD` + `DECISIONS.MD` + `RISKS.MD` + `QUESTIONS.MD` + checklist pack + BUILD-REPORT diperbarui
      (angka di dokumen = angka hasil uji, bukan klaim).

---

## 2. Acceptance Fitur (dipetakan ke PRD US-01…US-06)

### AF-01 — Dropdown NoBukti mirip (US-01)
- [ ] Baris Mamin dengan baris lain yang rekening + kegiatan sama di bulan berbeda → dropdown menampilkan kandidat (label: bulan · NoBukti · uraian · nominal).
- [ ] Baris tanpa `kodeKegiatan` → dropdown menampilkan pesan jujur, **bukan** daftar asal.
- [ ] Memilih kandidat → **panel berpindah**: header rekap, form, preview, dan target penyimpanan ikut baris baru.
- [ ] Isian belum disimpan → **peringatan "simpan dulu?"**; **Batal** → isian lama utuh; **Simpan & pindah** → tersimpan di baris lama lalu pindah.

### AF-02 — Form Mamin 6 seksi (US-02)
- [ ] Sidebar Mamin menampilkan 6 seksi: **1 Data Dasar · 2 Daftar Hadir · 3 Surat Undangan · 4 Surat Pesanan · 5 Buku Tamu · 6 Notulen (AI)**.
- [ ] Seksi 1: Nama Kegiatan panjang **wrap** (tidak terpotong).
- [ ] Seksi 2: NIP terisi otomatis dari Data Guru/Tendik; bisa dikoreksi.
- [ ] Seksi 3: form hanya Tanggal Surat + Nomor; 9 field §3.2 **tanpa input**.
- [ ] Seksi 4: Sifat / Perihal / Isi Surat Pesanan **tanpa input**; tanggal di dokumen Pesanan berasal dari Tanggal Surat Pesanan.
- [ ] Seksi 5: Tanggal / Ingin Bertemu / Tujuan / Uraian / Diterima Oleh **tanpa input**.
- [ ] Seksi 6: tombol "Generate AI Notulen"; notulen memakai tanggal/waktu/tempat/kegiatan/peserta dari Seksi 1–2.
- [ ] **17 field §3.2 tampil utuh di preview** dan **tidak ada input** untuknya.

### AF-03 — Preview = cetakan (R-1)
- [ ] Data yang dirender Panel Preview Document **identik** dengan data area cetak untuk 5 dokumen Mamin (Undangan · Pesanan ×2 · Notulen · Daftar Hadir · Buku Tamu).
- [ ] Field yang diisi user **tidak** ditimpa oleh nilai otomatis.

### AF-04 — Daftar Hadir + NIP (US-03)
- [ ] Kolom NIP tercetak di Daftar Hadir; kolom TANDA TANGAN tetap tercetak (kosong).
- [ ] Peserta tanpa NIP → kolom NIP kosong (tidak dikarang).
- [ ] Cetak A4: tabel tidak meluber (lebar kolom disetel).

### AF-05 — Tanggal dana masuk (US-04)
- [ ] Input "Tanggal dana masuk" **tidak ada** di sidebar untuk Makin & Minum, Honorarium, Perjalanan Dinas, Pemeliharaan (4 kategori).
- [ ] Tombol **Cek** di sidebar **tidak** menagih "Tanggal dana masuk".
- [ ] Halaman Dokumen LPJ (menu kiri) **tetap** punya input tersebut.

### AF-06 — Dokumen PBJ di sidebar (US-05)
- [ ] Blok PBJ tampil di bawah form LPJ, di atas Panel Preview.
- [ ] 6 tab (Perencanaan · Pesanan · BAHP · BAST · Negosiasi · Data).
- [ ] Isian otomatis: Tanggal · Kegiatan/Pekerjaan · Alokasi Anggaran · No. Bukti.
- [ ] Simpan → reload → isi PBJ utuh di NoBukti yang sama; NoBukti lain kosong.
- [ ] Form PBJ global (Dokumen Kelengkapan) tidak berubah.
- [ ] Panel preview: LPJ dulu → PBJ menyusul; **0 nama dobel**.

### AF-07 — Halaman LPJ tidak berubah (US-06)
- [ ] Hash render form+docs **4/4 identik** (T-01).
- [ ] Halaman LPJ: tanpa dropdown, tanpa blok PBJ, tanpa 6 seksi, **dengan** input tanggal dana masuk.
- [ ] `readinessCheck` 0 diff → tombol Cek halaman LPJ tetap menagih "Tanggal dana masuk".

---

## 3. Edge Cases

| # | Kondisi | Harapan |
|---|---|---|
| E-1 | Baris tanpa `noBukti` | Tombol Simpan LPJ & PBJ `disabled` + alasan jelas; tidak menulis kunci kosong |
| E-2 | `spj_lpj_bku` / `spj_pbj_bku` berisi JSON rusak | Panel tetap terbuka, 0 crash, `bacaEntri` = `null` |
| E-3 | Baris tanpa `kodeRekening`/`kodeKegiatan` | Dropdown: pesan jujur, 0 kandidat (bukan error) |
| E-4 | Data BKU kosong / 0 transaksi | Halaman BKU normal, sidebar tidak dirender |
| E-5 | Kandidat = baris yang **sama** (NoBukti identik, bulan beda) | Tetap jadi kandidat (NoBukti berbeda = dokumen berbeda) |
| E-6 | Dua kandidat dengan NoBukti sama | Keduanya ditampilkan; label membedakan lewat bulan |
| E-7 | Data Sekolah kosong (nama sekolah/alamat kosong) | Default tempat = "Ruang Rapat " (tanpa nama), field alamat kosong (jujur) |
| E-8 | Data Guru/Tendik kosong | Daftar Hadir kosong + tombol Pilih Peserta menampilkan pesan "belum ada data" |
| E-9 | Peserta tanpa NIP (honorer) | Kolom NIP kosong |
| E-10 | PBJ terisi di baris A, pindah ke baris B | Blok PBJ baris B kosong (form default), isi baris A utuh |
| E-11 | Nama dokumen bentrok (mis. "Surat Pesanan") | Label PBJ memakai sufiks " PBJ" → tidak bentrok; bila tetap bentrok → LPJ menang |
| E-12 | Generate AI Notulen gagal (tidak ada internet/API) | Toast error jujur, form tidak rusak, `resume` tidak berubah |

---

## 4. Checklist Penutupan Sprint

- [ ] **C-01** Semua G-0…G-9 hijau, output dikutip apa adanya di BUILD-REPORT.
- [ ] **C-02** AF-01…AF-07 diverifikasi (oracle + browser + screenshot).
- [ ] **C-03** Oracle T-01…T-15 PASS; hasil angka dikutip.
- [ ] **C-04** `STATE.MD` entri sprint 018 + `DECISIONS.MD` ADR baru + `RISKS.MD` + `QUESTIONS.MD` (D-1/D-2 ditutup) + checklist pack ini dicentang.
- [ ] **C-05** Skrip uji sementara dihapus setelah hasil dikutip; artefak tidak masuk commit.
- [ ] **C-06** Daftar "BELUM/UNTESTED" ditulis jujur.

---

## 5. Bukti yang Wajib Dilampirkan

1. Output `npm run build` (baris `✓ built in …`).
2. Output oracle T-01…T-15 (nama skrip + jumlah PASS).
3. Hash baseline halaman LPJ sebelum/sesudah (4/4 identik).
4. Screenshot: (a) dropdown kandidat terbuka, (b) form 6 seksi, (c) blok PBJ terisi otomatis, (d) preview satu daftar LPJ+PBJ, (e) Daftar Hadir dengan kolom NIP, (f) dialog "simpan dulu?".
5. `wc -l` semua file baru.
6. Output `rg` G-3/G-4 (isi hit dibuka bila ada) + `git diff --stat` file tabu (kosong).

---

## 6. Hasil Gate & Yang BELUM Diuji

*(diisi saat eksekusi — wajib diisi apa adanya, termasuk butir yang TIDAK dijalankan)*

---

**MULAI:** TASK GATE G-0 dijalankan.
**SELESAI:** C-01…C-06 tercentang dengan bukti, bukan klaim.
