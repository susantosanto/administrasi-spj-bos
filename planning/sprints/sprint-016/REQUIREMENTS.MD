# REQUIREMENTS — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Status: Pack **DISUSUN 2026-10-20** dari bahan yang sudah disetujui user:
> PRD `planning/sprints/sprint-016/PRD.md` (9 US) + ADR `DECISIONS.MD` §S1–S3
> (jawaban Q1–Q3, 2026-10-20). Format Bab 8.4 Dokumen 1: **apa & mengapa saja**,
> tanpa detail implementasi (detail ada di `BLUEPRINT.MD`).
> **Coding DILARANG dimulai sebelum dry run dilaporkan & disetujui user (AGENTS.MD).**

## Tujuan Sprint

Satu goal: **satu unggahan PDF BKU menghasilkan SELURUH tahun di halaman BKU**,
dengan hasil yang **identik** dengan jalur impor Excel — bukan satu bulan per unggahan.

## Apa yang Dibangun

- Jalur impor PDF berhenti meminta user memilih bulan lebih dulu; PDF langsung diproses
  dan **semua bulan** yang ada di dalamnya masuk preview.
- Preview menampilkan seluruh baris dengan **ringkasan per bulan** dan **penyaring
  tampilan** (bukan penyaring simpanan).
- Baris yang meragukan (tanggal hasil tebakan, nominal hasil koreksi rantai saldo,
  duplikat) **ditandai** dan bisa diperiksa/disaring — tidak dibuang otomatis.
- Tombol simpan menulis **seluruh** `spj_bku_data` dalam **satu** operasi atomik,
  **tanpa dialog konfirmasi**, mengganti isi lama sepenuhnya.
- Setelah simpan, halaman BKU langsung menampilkan hasilnya persis seperti setelah
  impor Excel (semua transaksi, penyaring "Semua", ringkasan terisi).
- Definisi **pengeluaran riil** dipertahankan: `PEMBAYARAN` saja. `TARIK_TUNAI` **tidak**
  dihitung — ia pemindahan bank↔kas yang berpasangan dengan `PERGESERAN_BANK` senilai sama
  (ADR §T, menggantikan §S1). `summary` kedua pintu masuk disamakan **bentuknya**.

## Mengapa

1. **Model Sprint 015 (replace-by-month) tidak cocok dengan cara kerja user.** Default
   bulan = 1 membuat hasilnya terbaca sebagai "hanya bulan pertama yang masuk", padahal
   parser sudah membaca seluruh tahun. User harus mengulang unggah 12 kali untuk satu PDF.
2. **Jalur Excel sudah benar dan dipercaya.** Excel: satu unggahan → semua bulan → satu
   tulis → tampil. PDF harus berperilaku sama (keputusan Idea Brief #1).
3. **Dua definisi angka membuat "Balance" tidak bisa dipercaya.** Sebelum sprint ini,
   angka pengeluaran riil di layar bisa **berubah setelah reload** untuk data Excel yang
   sama, karena jalur simpan memakai `bkuParser` sedangkan jalur muat memakai
   `recalcSummary` dengan definisi berbeda (ADR §S1).
4. **Data yang tidak dipakai dokumen tidak perlu dibawa.** `footer` dan
   `header.alamat/kabupaten/provinsi` tidak berkorelasi dengan nilai belanja dan tidak
   menjadi sumber data dokumen (diverifikasi `grep`) → tidak dipertahankan (ADR §S2–S3).

## Pengguna

- **Primary — Bendahara SPJ SD.** Punya satu PDF BKU setahun dari ARKAS; ingin seluruh
  tahun masuk sekali jalan, seperti saat ia mengunggah Excel.
- **Secondary — Operator/penyuluh** yang menyalin PDF BKU sekolah lain; tidak tahu isi
  PDF ada bulan apa saja, sehingga tidak boleh diminta memilih bulan lebih dulu.

**Bukan pengguna:** tidak ada admin, tidak ada multi-user, tidak ada backend.

## Data Sumber

- **Masukan:** PDF hasil scan BKU tahunan (`template/contoh format BKU-PDF tahunan.pdf`
  — 21 halaman A4, tanpa text layer, ±421 transaksi/tahun).
- **Oracle/pembanding:** `template-data/Realisasi Sekolah Buku Kas Umum (BKU) -
  Manajemen Aplikasi RKAS - 2026.xlsx` (Jan–Jun 2026, 300 baris).
- **Penyimpanan:** `spj_bku_data` (localStorage, prefix `spj_`) — bentuk baris **sama
  persis** dengan jalur Excel (kontrak 17 field).
- **Prasyarat terpenuhi:** fix akurasi OCR non-Januari 2026-10-20 — Jan–Jun **0 selisih**
  di 3 fixture, total tahunan cocok dengan baris "Jumlah" PDF.

## Output yang Diharapkan

1. Unggah 1 PDF → preview memuat **semua** baris dari **semua** bulan dalam PDF.
2. Setelah simpan: `spj_bku_data.transactions` = seluruh baris PDF; bulan yang tidak ada
   di PDF **tidak lagi ada** (ganti seluruhnya).
3. `spj_bku_data.summary` berbentuk & bernilai **sama** dengan hasil jalur Excel:
   `totalTransactions` · `totalPenerimaan` · `totalPengeluaran` · `saldoAkhir` ·
   `isBalanced` · `months` · `totalPenerimaanSemua` · `totalPengeluaranSemua` ·
   `byType` · `monthlySummaries`.
4. Halaman BKU menampilkan hasil tanpa reload manual: `items` = semua transaksi,
   `availableMonths` = bulan hasil parse, `filterBulan` = **"Semua"**.
5. Jumlah klik setelah file dipilih sampai data tampil: **2** (pilih file → simpan).
6. Toast sukses memuat: jumlah baris · daftar bulan · masuk · keluar · saldo akhir ·
   status balance · jumlah catatan OCR — pola sama dengan toast Excel.
7. Tidak ada dialog konfirmasi saat menyimpan (keputusan #4).

## Batas Cakupan (WAJIB dipatuhi)

**Boleh diubah:**
- `spj-frontend/src/components/bku/BKUUploadPdf.jsx` — rework alur (inti sprint).
- `spj-frontend/src/pages/dashboard/BKUPage.jsx` — **hanya** fungsi `recalcSummary`
  (tambah field, ADR §T3) dan **hanya** baris pemakaian prop `bulanAwal` bila prop itu dihapus.
- `spj-frontend/src/utils/bkuParser.js` — **HANYA 1 baris** (`:495`, hapus `+ TARIK_TUNAI`,
  ADR §T2, izin eksplisit user 2026-10-20). Baris lain wajib 0 diff.
- `spj-frontend/src/utils/bkuPdfDuplikat.js` — **baru**, penanda duplikat (fungsi murni).
- `spj-frontend/test-bku-*.mjs` — oracle baru untuk sprint ini.

**DILARANG disentuh:**
- `spj-frontend/src/utils/bkuParser.js` — **selain baris 495** (TABU dicabut khusus 1 baris).
- `spj-frontend/src/utils/bkuPdfParser.js` · `bkuPdfRapi.js` · `bkuPdfTanggal.js` ·
  `bkuPdfLayout.js` · `bkuPdfTeks.js` · `bkuPdfOcr.js` · `bkuPdfPages.js` — parser &
  OCR sudah terverifikasi akurat; sprint ini **bukan** sprint akurasi.
- `BKUPage.jsx` fungsi `handleFileUpload` (jalur Excel) — tidak boleh diubah.
- Modul cetak/dokumen: `previewDocs.js` · `dokKas.js` · `templateConfig.js` ·
  komponen `template/**` · `signatureRoles.js` · `sekolahData.js`.
- `storageHelper.js` — API `get`/`set`/`remove` tidak berubah.

## Non-Goals (tidak dibangun di sprint ini)

1. Fast-path text-layer PDF (T-14 Sprint 015) — sprint terpisah.
2. Ekstraksi tanda tangan/footer dari PDF — diputuskan **tidak** dilakukan (ADR §S2).
3. Ekstraksi `alamat`/`kabupaten`/`provinsi` dari kop PDF — **tidak** (ADR §S3).
4. Backend, sinkronisasi, login, multi-user.
5. Pemetaan ulang kode rekening, fitur PBJ/Pajak baru.
6. Perbaikan cetak/landscape/Register Kas (sprint lain).
7. Perubahan perilaku impor Excel selain definisi `recalcSummary` di ADR §S1.

## Kriteria Selesai Sprint

Sprint dinyatakan selesai **hanya bila** seluruh ini terbukti dengan bukti asli
(output tes, bukan klaim):

- [ ] `npm run build` exit 0.
- [ ] Oracle `test-bku-pdf-semua-bulan.mjs` exit 0: setelah simpan, `transactions`
      memuat semua bulan PDF dan `summary` identik dengan `recalcSummary` jalur Excel.
- [ ] Oracle akurasi lama `test-bku-pdf-parse.mjs --pdf --all-months` tetap exit 0
      di 3 fixture (Jan–Jun 0 selisih, total tahunan cocok).
- [ ] `test-bku-tanggal.mjs` tetap 13/13 PASS.
- [ ] Regresi jalur Excel: angka Jan–Jun **tidak berubah sama sekali** —
      `totalPengeluaran` tetap Rp 82.560.000, `isBalanced` tetap `true`
      (ADR §T: definisi tidak diubah, hanya `bkuParser` dibersihkan dari double counting).
- [ ] `git diff -U0 -- spj-frontend/src/utils/bkuParser.js` menunjukkan **tepat 1 hunk**
      di sekitar baris 491–495.
- [ ] 0 dialog konfirmasi; tepat **1** panggilan `storageHelper.set('bku_data', …)` per impor.
- [ ] Tidak ada warna di luar BLUE-ONLY `#004ac6` + slate.
- [ ] `STATE.MD` + pack sprint-016 diperbarui setelah selesai.
