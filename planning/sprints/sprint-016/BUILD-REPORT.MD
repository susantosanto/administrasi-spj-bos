# BUILD-REPORT — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Dibangun 2026-10-20. Basis keputusan: `DECISIONS.MD` **§S2, §S3, §T** (§S1 DIBATALKAN).
> Status: **kode selesai, gate node HIJAU, uji browser BELUM, commit BELUM.**
> Semua angka di bawah = output asli, bukan klaim.

## 1. Ringkasan

| Aspek | Sebelum | Sesudah |
|---|---|---|
| Bulan yang diimpor per unggahan | 1 (default Januari) | **semua bulan di PDF** |
| Pilihan bulan | pemilih bulan yang menentukan impor | ringkasan per bulan + penyaring **tampilan** |
| Simpan | replace-by-month, `...tersimpan` | **ganti seluruh objek, 1 tulis** |
| Dialog konfirmasi | ada | **dihapus** |
| Field per baris tersimpan | 20 (ada `page`/`problems`/`excluded`) | **17 (kontrak Excel)** |
| Kunci `summary` | 5 | **10 (sama dengan Excel)** |
| Angka Excel | bisa berubah setelah reload | **stabil, satu definisi** |
| `TARIK_TUNAI` di pengeluaran | dihitung (double counting) | **tidak dihitung** (ADR §T) |

## 2. Perubahan per file

| File | Aksi | Keterangan |
|---|---|---|
| `src/utils/bkuSummary.js` | **baru, 122 baris** | `hitungRingkasan()` — satu definisi ringkasan untuk Excel & PDF. Dipindah dari `BKUPage.jsx` **agar bisa diuji oracle** (sebelumnya tidak bisa diimpor). |
| `src/utils/bkuPdfDuplikat.js` | **baru, 70 baris** | `kunciDuplikat()`, `tandaiDuplikat()`, `ringkasPerBulan()` — fungsi murni. |
| `src/components/bku/BKUUploadPdf.jsx` | **tulis ulang, 309 → 401 baris** | gating bulan dihapus, preview semua bulan, kartu ringkasan per bulan, penyaring tampilan, toggle "hanya baris perlu diperiksa", penanda duplikat, kolom halaman, dialog konfirmasi dihapus, `simpan()` atomik. |
| `src/pages/dashboard/BKUPage.jsx` | **906 → 852 baris** | `recalcSummary` jadi alias `hitungRingkasan`; prop `bulanAwal` dibuang. `handleFileUpload` **tidak disentuh**. |
| `src/utils/bkuParser.js` | **1 baris kode** | `:495` — `TARIK_TUNAI` dikeluarkan dari `totalPengeluaranRiil` (ADR §T2, izin eksplisit user). |
| `test-bku-pdf-semua-bulan.mjs` | **baru** | oracle sprint ini (6 kelompok uji). |
| `test-bku-recalc-summary.mjs` | **baru** | oracle ringkasan (4 kelompok uji). |

`git diff -U0 -- spj-frontend/src/utils/bkuParser.js` → **2 hunk, keduanya di baris 491–496**
(hunk komentar & hunk kode dipisah satu baris `totalPenerimaanRiil` yang tidak berubah).
Tidak ada perubahan di `parseTransactions`, `parseHeader`, `DATA_COLUMNS`.

## 3. Bukti gate

### 3.1 Build
```
dist/assets/index-Ce2Rviy8.js              1,456.97 kB │ gzip: 403.23 kB
✓ built in 9.46s
BUILD_EXIT=0
```
Warning `chunk > 500 kB` = pre-existing, bukan regresi.

### 3.2 `test-bku-pdf-semua-bulan.mjs` → exit 0
```
baris   : 420 -> tersimpan 420
bulan   : Januari 2026 ... September 2026   (9 bulan)
summary : masuk Rp 165.120.000 | keluar Rp 130.549.500 | saldo Rp 32.723.000 | balance false

1. SEMUA BULAN IKUT TERSIMPAN
  PASS  jumlah baris tersimpan = jumlah baris PDF  420 vs 420
  PASS  jumlah kelompok bulan = jumlah kelompok di PDF  9 vs 9
  PASS  BUKAN hanya 1 bulan (regresi Sprint 015)  9 bulan
2. KONTRAK BARIS — 17 field, tanpa field sementara
  PASS  jumlah kunci = 17
  PASS  tidak ada field sementara tersimpan
  PASS  semua baris punya 17 kunci
3. SUMMARY — 10 kunci, konsisten
  PASS  saldoAkhir = saldo baris terakhir  Rp 32.723.000
  PASS  TARIK_TUNAI TIDAK masuk totalPengeluaran  Rp 130.549.500
4. TOTAL TAHUNAN vs BARIS "JUMLAH" PDF
  PASS  Σ penerimaan = baris Jumlah PDF  Rp 182.305.000 vs Rp 182.305.000
  PASS  Σ pengeluaran = baris Jumlah PDF  Rp 149.582.000 vs Rp 149.582.000
5. PENANDA DUPLIKAT — tandai, jangan buang
  PASS  panjang array tidak berubah
  PASS  duplikat buatan dikenali (2 baris, 1 ditandai)  flags false,true
6. RINGKASAN PER BULAN
  PASS  Σ jumlah / masuk / keluar konsisten dengan total
HASIL: SEMUA PASS
```

### 3.3 `test-bku-recalc-summary.mjs` → exit 0
```
1. EXCEL — 300 baris
  tarik tunai : 2 baris, Rp 16.350.000
  pergeseran  : 2 baris, Rp 16.350.000
  ringkasan   : masuk Rp 82.560.000 | keluar Rp 82.560.000 | saldo Rp 0 | balance true
  PASS  totalPengeluaran = Rp 82.560.000 (TARIK_TUNAI TIDAK dihitung)
  PASS  totalPengeluaran BUKAN 98.910.000 (double counting hilang)
  PASS  Σ TARIK_TUNAI = Σ PERGESERAN_BANK  Rp 16.350.000 vs Rp 16.350.000
2. BENTUK — PASS 10 kunci · byType 10 tipe · monthlySummaries 6 bulan · Σ konsisten
3. PDF — 420 baris
  ringkasan : masuk Rp 165.120.000 | keluar Rp 130.549.500 | saldo Rp 32.723.000 | balance false
  PASS  totalPengeluaran = Rp 130.549.500
4. DATA LAMA (tanpa field tipe) — PASS 10 kunci, tidak crash
HASIL: SEMUA PASS
```

### 3.4 Regresi akurasi OCR (tidak turun)
```
test-bku-tanggal.mjs                       -> HASIL: 13 lulus / 0 gagal
fixture.json                               -> 0 selisih · SEMUA BULAN 0 selisih · TOTAL TAHUNAN cocok · exit 0
fx-sampel-c0-runtime.json                  -> 0 selisih · SEMUA BULAN 0 selisih · TOTAL TAHUNAN cocok · exit 0
fx-user-c0-runtime.json                    -> 0 selisih · SEMUA BULAN 0 selisih · TOTAL TAHUNAN cocok · exit 0
```

### 3.5 Pemeriksaan statis
```
storageHelper.set('bku_data'  di BKUUploadPdf.jsx : 1   (tepat satu)
...tersimpan (spread data lama)                   : 0
bulanAwal                                         : 0 (hanya di komentar)
warna terlarang (emerald|amber|rose|violet|cyan)  : 0
```

## 4. Temuan yang mengubah keputusan (penting)

Keputusan awal Q1 adalah "samakan ke Excel" (`PEMBAYARAN + TARIK_TUNAI`). Saat dry run,
angka itu diukur dan user mempertanyakannya. Verifikasi ke data:

| Tanggal | Uraian | Tipe | Keluar | Masuk | Saldo |
|---|---|---|---|---|---|
| 09-02-2026 | Tarik Tunai | TARIK_TUNAI | 14.650.000 | 0 | 68.510.000 → 53.860.000 |
| 09-02-2026 | Pergeseran Uang di Bank | PERGESERAN_BANK | 0 | 14.650.000 | → **68.510.000** |
| 09-06-2026 | Tarik Tunai | TARIK_TUNAI | 1.700.000 | 0 | 8.041.400 → 6.341.400 |
| 09-06-2026 | Pergeseran Uang di Bank | PERGESERAN_BANK | 0 | 1.700.000 | → **8.041.400** |

`Σ TARIK_TUNAI` = `Σ PERGESERAN_BANK` = Rp 16.350.000, **selisih Rp 0**, identik di Excel & PDF.
→ Tarik tunai = pemindahan bank↔kas. Definisi lama `bkuParser` **double counting**.
User memilih **opsi B**: perbaiki keduanya (ADR §T). **Efek: angka Excel 0 perubahan.**

**Bug lama yang ikut hilang:** kartu BKU menampilkan pengeluaran **berbeda setelah reload**
(98.910.000 saat upload → 82.560.000 setelah reload) untuk data yang sama, karena jalur simpan
memakai `bkuParser` sedangkan jalur muat memakai `recalcSummary`. Sekarang satu definisi.

## 5. Yang BELUM diverifikasi (jujur)

Uji yang butuh browser **belum dijalankan** — tidak ada dev server di sesi ini:

| Task | Isi | Status |
|---|---|---|
| T-05 | penyaring tidak mengubah jumlah simpanan | **BELUM** (kode: total dari `aktif`, penyaring hanya `tampilSaring`) |
| T-07 | tanpa dialog konfirmasi | **BELUM** (statis: 0 hit `konfirmasi`) |
| T-10 | isi `header`/`footer` di localStorage | **BELUM** (kode sesuai ADR §S2/S3) |
| T-14 | halaman BKU langsung terisi tanpa reload | **BELUM** (`onSelesai` → `loadFromStorage` menyetel `filterBulan='Semua'`) |
| T-16 | 3 skenario gagal tidak mengubah data | **BELUM** |
| T-17 | cetak (`print:hidden`) | **BELUM** |

Yang **sudah** terbukti: semua logika yang bisa diuji tanpa browser (parsing, kontrak baris,
bentuk & nilai `summary`, penanda duplikat, ringkasan per bulan, build).

## 6. Rencana commit (2 commit terpisah — menunggu persetujuan)

Working tree memuat **dua** pekerjaan yang belum di-commit:

**Commit 1 — fix akurasi OCR non-Januari (dari sesi sebelumnya)**
```
M spj-frontend/src/utils/bkuPdfParser.js
M spj-frontend/src/utils/bkuPdfTanggal.js
M spj-frontend/src/components/bku/BKUUploadPdf.jsx   ← tercampur, lihat catatan
M spj-frontend/test-bku-pdf-parse.mjs
A spj-frontend/src/utils/bkuPdfRapi.js
```
⚠️ `BKUUploadPdf.jsx` memuat **kedua** perubahan (perbaikan badge OCR + rework Sprint 016)
sehingga tidak bisa dipisah per file. Opsi: (a) satu commit gabungan untuk file itu,
(b) `git add -p` per hunk. Perlu keputusan user.

**Commit 2 — Sprint 016**
```
M spj-frontend/src/components/bku/BKUUploadPdf.jsx
M spj-frontend/src/pages/dashboard/BKUPage.jsx
M spj-frontend/src/utils/bkuParser.js          (1 baris)
A spj-frontend/src/utils/bkuSummary.js
A spj-frontend/src/utils/bkuPdfDuplikat.js
A spj-frontend/test-bku-pdf-semua-bulan.mjs
A spj-frontend/test-bku-recalc-summary.mjs
M STATE.MD · DECISIONS.MD · QUESTIONS.MD · RISKS.MD
A planning/sprints/sprint-016/ · architect-packs/architect-pack-016-*
```
**Tidak** termasuk: `DataGuruPage.jsx` (perubahan lama, tidak terkait), aset `template/*`
dan `public/logo-dinas.png` (untracked, bukan bagian sprint).

## 7. Sisa pekerjaan sebelum sprint bisa ditutup

1. Jalankan dev server → uji T-05, T-07, T-10, T-14, T-16, T-17 → isi §5.
2. `/acceptance-runner` di konteks segar.
3. Commit (dry run → persetujuan user).
4. Update checklist pack + `STATE.MD` status akhir.
