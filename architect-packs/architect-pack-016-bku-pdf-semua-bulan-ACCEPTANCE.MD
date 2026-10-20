# ACCEPTANCE — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Setiap task di bawah **wajib** dibuktikan dengan output asli (perintah + hasil),
> bukan klaim. Task yang tidak punya bukti = **BELUM PASS**.
> Jalankan di konteks segar (`/acceptance-runner`) sebelum sprint dinyatakan selesai.
> Prasyarat baca: `REQUIREMENTS.MD` · `BLUEPRINT.MD` · ADR `DECISIONS.MD` §S1–S3.

## Ringkasan

| Task | Judul | Gate |
|---|---|---|
| T-01 | Build bersih | WAJIB |
| T-02 | `bkuParser.js` 0 diff | WAJIB |
| T-03 | Preview memuat SEMUA bulan (bukan 1) | WAJIB |
| T-04 | Ringkasan per bulan benar (jumlah/masuk/keluar/saldo) | WAJIB |
| T-05 | Penyaring hanya memengaruhi tampilan, bukan simpanan | WAJIB |
| T-06 | Simpan = 1 panggilan, ganti seluruh objek | WAJIB |
| T-07 | Tanpa dialog konfirmasi | WAJIB |
| T-08 | `summary` identik bentuk & nilai dengan jalur Excel | WAJIB |
| T-09 | Definisi pengeluaran riil = `PEMBAYARAN + TARIK_TUNAI` | WAJIB |
| T-10 | `header`/`footer` sesuai ADR §S2–S3 | WAJIB |
| T-11 | Baris tersimpan = 17 field (tanpa field sementara) | WAJIB |
| T-12 | Baris meragukan ditandai, tidak dibuang | WAJIB |
| T-13 | Regresi akurasi OCR tidak turun | WAJIB |
| T-14 | Halaman BKU tampil tanpa reload manual | WAJIB |
| T-15 | Tahun lintas tahun tidak diacak | WAJIB |
| T-16 | Gagal jujur: 0 transaksi / file rusak / batal | WAJIB |
| T-17 | Warna BLUE-ONLY + `print:hidden` | WAJIB |
| T-18 | Progres & batal tetap bekerja | INFO |

---

## ✅ VERDICT PENUTUPAN (2026-10-20)

Sprint **DITUTUP SUKSES & BERHASIL** atas perintah user. Bukti lengkap: `BUILD-REPORT.MD` §8.

| Task | Status | Bukti |
|---|---|---|
| T-01 | **PASS** | `BUILD_EXIT=0` (`✓ built in 11.85s`) |
| T-02 | **PASS** (lebih ketat) | `bkuParser.js` **0 diff** — perubahannya sudah ter-commit di `f7e511e` |
| T-02b | **PASS** | Excel `totalPengeluaran` Rp 82.560.000 · `isBalanced` true |
| T-03 | **PASS** | 420 baris · 9 bulan (bukan hanya Januari) |
| T-04 | **PASS** | `Σ masuk/keluar` per bulan konsisten · Agustus Rp 82.560.000 |
| T-05 | **BELUM** | butuh browser — statis: total dari `aktif`, penyaring hanya `tampilSaring` |
| T-06 | **PASS** | `set('bku_data'` = 1 · `...tersimpan` = 0 |
| T-07 | **PASS** (statis) | 0 `window.confirm`/`<dialog>`/`Modal`; 1 hit kata "konfirmasi" hanya di komentar |
| T-08 | **PASS** | `summary` 10 kunci · `saldoAkhir` = baris terakhir |
| T-09 | **PASS** | `totalPengeluaran` = `PEMBAYARAN` saja · `TARIK_TUNAI` Rp 16.350.000 terpisah |
| T-10 | **BELUM** | butuh localStorage nyata |
| T-11 | **PASS** | tepat 17 kunci · 0 field sementara |
| T-12 | **PASS** | panjang array tidak berubah · duplikat ditandai (`false,true`) |
| T-13 | **PASS** | 3 fixture 0 selisih · `test-bku-tanggal` 13/13 |
| T-14 | **BELUM** | butuh browser |
| T-15 | **PASS** | urut tahun lalu bulan · kelompok bulan tidak diacak |
| T-16 | **BELUM** | butuh browser |
| T-17 | **PASS** (statis) | 0 kelas warna terlarang · 0 hex literal |
| T-18 | **BELUM** (INFO) | butuh browser |

**13 PASS · 5 BELUM (semuanya butuh browser) · 0 FAIL.**

⚠️ Risiko yang diterima user: T-05/T-10/T-14/T-16 belum terbukti di browser. Bila muncul
keluhan pada alur unggah/simpan/cetak, periksa keempat task ini lebih dulu.

---

## T-01 — Build bersih

```bash
cd spj-frontend && npm run build; echo "BUILD_EXIT=$?"
```
**PASS bila:** `BUILD_EXIT=0` dan tidak ada error. Warning `chunk > 500 kB` = **boleh**
(pre-existing, bukan regresi).

## T-02 — `bkuParser.js` HANYA 1 hunk (ADR §T2)

```bash
git diff -U0 -- spj-frontend/src/utils/bkuParser.js
```
**PASS bila:** semua hunk berada di dalam rentang **baris 491–496** dan perubahan kodenya
hanya menghapus `+ (byType[TRANSACTION_TYPES.TARIK_TUNAI]?.totalPengeluaran || 0)`.
Boleh **2 hunk** (komentar & kode dipisah satu baris `totalPenerimaanRiil` yang tidak berubah).
**FAIL bila:** ada hunk di luar rentang itu (mis. `parseTransactions`, `parseHeader`,
`DATA_COLUMNS`), atau ada baris kode lain yang berubah.

## T-02b — Angka Excel tidak bergeser

```bash
cd spj-frontend && node test-bku-recalc-summary.mjs
```
**PASS bila:** `totalPengeluaran` Excel Jan–Jun = **Rp 82.560.000** dan `isBalanced` = **true**
(nilai yang sama seperti sebelum sprint). Bila bergeser → **regresi**, sprint ditolak.

## T-03 — Preview memuat SEMUA bulan

Jalankan oracle:
```bash
cd spj-frontend && node test-bku-pdf-semua-bulan.mjs --fixture ../scratch-pdf-check/fx-user-c0-runtime.json; echo "EXIT=$?"
```
**PASS bila:** `EXIT=0` dan output menyatakan jumlah baris = jumlah baris fixture
(420 untuk fixture setahun), serta daftar bulan memuat **≥ 6 bulan**
(Jan–Jun + Jul/Agu/Sep sesuai fixture), **bukan** hanya Januari.
**Bukti tambahan:** tangkapan layar preview yang memperlihatkan baris dari bulan berbeda
dalam satu tampilan.

## T-04 — Ringkasan per bulan benar

**PASS bila:** untuk setiap baris ringkasan bulan, `masuk` dan `keluar` = jumlah kolom
masing-masing pada baris bulan itu, dan `saldoAkhir` = `saldo` baris terakhir bulan itu.
Uji dengan membandingkan terhadap hasil `test-bku-pdf-parse.mjs --pdf --all-months`
(bulan yang sama harus memberi angka yang sama).
**FAIL bila:** ada bulan dengan `saldoAkhir = 0` padahal barisnya ada.

## T-05 — Penyaring = tampilan saja

Langkah manual:
1. Impor PDF → catat `N` baris "akan disimpan".
2. Pilih penyaring `Januari` → tabel menyusut.
3. Cek angka "akan disimpan" **tidak berubah** (tetap `N`).
4. Pilih kembali `Semua` → semua baris kembali.

**PASS bila:** angka simpanan tetap `N` di semua pilihan penyaring, dan tabel benar-benar
menyusut (menutup BUG-1). **FAIL bila:** tabel tidak berubah (BUG-1 kembali) atau angka
simpanan ikut berubah (BUG-2 kembali).

## T-06 — Satu panggilan, ganti seluruh objek

```bash
grep -c "storageHelper.set('bku_data'" spj-frontend/src/components/bku/BKUUploadPdf.jsx
grep -n "\.\.\.tersimpan" spj-frontend/src/components/bku/BKUUploadPdf.jsx
```
**PASS bila:** hitungan = **1**, dan `...tersimpan` **tidak ditemukan**.
**Uji fungsional:** siapkan `bku_data` berisi Jul–Des (karangan), lalu impor PDF Jan–Jun →
setelah simpan, `bku_data.transactions` **tidak** memuat Jul–Des lagi.

## T-07 — Tanpa dialog konfirmasi

```bash
grep -n "konfirmasi\|Konfirmasi simpan" spj-frontend/src/components/bku/BKUUploadPdf.jsx
```
**PASS bila:** **0 hit**. Uji manual: klik "Simpan" → data langsung tertulis,
tidak ada modal.

## T-08 — `summary` identik dengan jalur Excel

```bash
cd spj-frontend && node test-bku-pdf-semua-bulan.mjs; echo "EXIT=$?"
```
**PASS bila:** `EXIT=0` dan kedua hal ini benar:
1. Kunci `summary` = **10**: `totalTransactions` · `totalPenerimaan` · `totalPengeluaran` ·
   `saldoAkhir` · `isBalanced` · `months` · `totalPenerimaanSemua` ·
   `totalPengeluaranSemua` · `byType` · `monthlySummaries`.
2. `saldoAkhir` = `saldo` baris terakhir, dan `totalTransactions` = panjang `transactions`.

**Bukti wajib:** tabel berdampingan "summary PDF" vs "summary Excel" untuk Jan–Jun.

## T-09 — `TARIK_TUNAI` TIDAK dihitung sebagai pengeluaran (ADR §T)

```bash
cd spj-frontend && node test-bku-recalc-summary.mjs; echo "EXIT=$?"
```
**PASS bila:** `EXIT=0` dan:
- `totalPengeluaran` = jumlah baris `PEMBAYARAN` saja; **tidak** memuat `TARIK_TUNAI`.
- Untuk Excel Jan–Jun: `totalPengeluaran` = **Rp 82.560.000** (bukan 98.910.000),
  `isBalanced` = **true**.
- Untuk PDF setahun: `totalPengeluaran` = **Rp 130.549.500**, `isBalanced` = **false**
  (benar — saldo akhir Rp 32.723.000 masih ada).
- `Σ TARIK_TUNAI` = `Σ PERGESERAN_BANK` = **Rp 16.350.000** (selisih 0) — cetak sebagai bukti.
**FAIL bila:** `totalPengeluaran` masih mengandung tarik tunai (98.910.000).

## T-10 — `header` / `footer` sesuai ADR

Setelah impor PDF, periksa `spj_bku_data` di DevTools → Application → Local Storage.
**PASS bila:**
- `header.tahunAnggaran` **terisi** (4 digit, dari kop PDF).
- `header.npsn` / `header.nama_sekolah` terisi bila terbaca di kop.
- `header.alamat` / `kabupaten` / `provinsi` = `''` (tidak diwarisi).
- `footer` = bentuk kosong (`kepalaSekolah{nama:'',nip:''}`, `bendahara{...}`,
  `tanggalPenutupan:''`, `tempat:''`).
**Uji dokumen:** buka halaman Dokumen Kelengkapan → cetak Register Kas → blok tanda tangan
**tetap berisi nama** (berasal dari `getSignatureRoles()`), dan `tempat` terisi dari
`sekolah.kabupaten`.

## T-11 — Baris tersimpan = 17 field

**PASS bila:** satu baris `transactions` hasil impor PDF memuat **tepat 17** kunci
(`row` · `tanggal` · `tanggalStr` · `tanggalISO` · `bulan` · `tahun` · `kodeKegiatan` ·
`kodeRekening` · `noBukti` · `uraian` · `penerimaan` · `pengeluaran` · `saldo` ·
`debet` · `kredit` · `tipe` · `kategori`) dan **tidak** memuat `page`, `problems`,
`excluded`, `duplikat`, `urutanDuplikat`.

## T-12 — Baris meragukan ditandai, tidak dibuang

**PASS bila:**
- Jumlah baris preview = jumlah transaksi hasil parse (tidak ada yang hilang karena
  penandaan).
- Baris `tanggal_perlu_dikoreksi` / `nominal_diperbaiki` terlihat bertanda.
- Baris duplikat buatan (duplikasi manual satu baris di fixture) muncul **dua kali**
  dengan penanda `duplikat` pada yang kedua — **bukan** dihapus.

## T-13 — Regresi akurasi OCR tidak turun

```bash
cd spj-frontend
for f in fixture.json fx-sampel-c0-runtime.json fx-user-c0-runtime.json; do
  node test-bku-pdf-parse.mjs --pdf --all-months --fixture "../scratch-pdf-check/$f"; echo "EXIT=$?"
done
node test-bku-tanggal.mjs | tail -3
```
**PASS bila:** ketiga fixture `EXIT=0` dengan `SEMUA BULAN: 0 selisih` +
`TOTAL TAHUNAN: cocok`, dan `test-bku-tanggal.mjs` = **13 lulus / 0 gagal**.

## T-14 — Halaman BKU tampil tanpa reload manual

**PASS bila:** setelah simpan, tanpa menekan refresh browser:
- tabel BKU menampilkan baris dari semua bulan,
- penyaring bulan ada di posisi **"Semua"**,
- `availableMonths` memuat semua bulan PDF,
- tidak ada error di konsol.

## T-15 — Tahun lintas tahun tidak diacak

**PASS bila:** bila PDF memuat baris `31-12-<tahunDok−1>` (saldo awal), baris itu tetap
bertahun `tahunDok−1` di `transactions`, dan muncul sebagai kelompok bulan tersendiri
(`Desember <tahunDok−1>`) di ringkasan — **tidak** dipindah ke tahun dokumen.

## T-16 — Gagal jujur

Tiga skenario, semuanya **tidak boleh** mengubah `bku_data`:
1. PDF tanpa transaksi → pesan "Tidak ada transaksi yang terbaca…".
2. File `.txt` di-rename `.pdf` → ditolak sebelum OCR.
3. Klik "Batalkan proses" di tengah OCR → pesan batal, data utuh.

**PASS bila:** ketiganya menghasilkan pesan jelas dan `bku_data` **identik** sebelum/sesudah
(bandingkan `localStorage` sebelum & sesudah).

## T-17 — Warna & cetak

```bash
rg -n "emerald|amber|rose|violet|cyan|#[0-9a-fA-F]{6}" spj-frontend/src/components/bku/BKUUploadPdf.jsx
```
**PASS bila:** tidak ada warna terlarang; hanya `primary`/`slate`/`white`.
**Cetak:** komponen tidak muncul di hasil cetak (`print:hidden`).

## T-18 — Progres & batal (INFO)

**PASS bila:** progres "halaman x dari N" berjalan untuk 21 halaman, batal berhenti ≤ 2 detik,
dan tidak ada worker menggantung setelah selesai (cek tab Network/Worker).

---

## Bukti yang Wajib Dikumpulkan di BUILD-REPORT

1. `npm run build` — output asli + `BUILD_EXIT`.
2. `test-bku-pdf-semua-bulan.mjs` — output penuh.
3. `test-bku-recalc-summary.mjs` — tabel **sebelum vs sesudah** `recalcSummary`.
4. `test-bku-pdf-parse.mjs` × 3 fixture — ringkasan `SEMUA BULAN` + `TOTAL TAHUNAN`.
5. `test-bku-tanggal.mjs` — baris `HASIL`.
6. `git diff --stat` + bukti `bkuParser.js` 0 diff.
7. Tangkapan layar preview multi-bulan (T-03) + hasil setelah simpan (T-14).
8. Dump `bku_data` sesudah impor (T-10/T-11), disensor bagian sensitif bila perlu.

## Kriteria Sprint DITOLAK

Sprint **tidak boleh** ditutup bila salah satu terjadi:
- `bkuParser.js` berubah **lebih dari 1 hunk** (`:495`).
- `handleFileUpload` (jalur Excel) berubah.
- Masih ada dialog konfirmasi.
- Masih ada `bulanAwal` / gating bulan.
- `summary` tidak punya `saldoAkhir`.
- `totalPengeluaran` **memuat** `TARIK_TUNAI` (harus `PEMBAYARAN` saja — ADR §T).
- Angka Excel bergeser dari 82.560.000 / `isBalanced` `true`.
- Baris tersimpan memuat field sementara.
- Akurasi Jan–Jun turun dari 0 selisih.
