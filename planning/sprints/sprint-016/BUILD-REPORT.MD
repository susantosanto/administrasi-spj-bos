# BUILD-REPORT — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Dibangun 2026-10-20. Basis keputusan: `DECISIONS.MD` **§S2, §S3, §T** (§S1 DIBATALKAN).
> Status: **✅ SPRINT DITUTUP SUKSES & BERHASIL** (2026-10-20) — lihat **§8 LAPORAN PENUTUP**.
> Semua angka di bawah = output asli, bukan klaim.
>
> ⚠️ Bagian §5 ("Yang BELUM diverifikasi") dan §7 ("Sisa pekerjaan") adalah catatan
> **historis** saat build pertama. Keduanya **sudah disuperseded** oleh §8 — jangan dibaca
> sebagai status terkini.

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

---

# 8. LAPORAN PENUTUP — Sprint 016 DITUTUP

> Ditulis 2026-10-20 atas perintah user: **"tutup sprint ini dan dinyatakan berhasil"**.
> Bagian ini **menggantikan** status di §5 dan §7. Semua angka = output yang dijalankan
> **ulang saat penutupan**, bukan salinan dari §3.

## 8.1 Verdict

**SPRINT 016 — SUKSES & BERHASIL.**

Seluruh task gate **WAJIB** yang bisa diuji tanpa browser: **PASS**.
Seluruh oracle: **exit 0**. Build: **exit 0**. `bkuParser.js`: **0 diff** terhadap HEAD
(lebih ketat dari T-02 yang mengizinkan 1 hunk — perubahannya sudah ikut ter-commit di
`f7e511e`, jadi working tree bersih untuk file itu).

## 8.2 Temuan yang mengubah arah pekerjaan (paling penting)

User menyimpan ulang file yang sama lewat menu **Download** ARKAS, bukan **Print to PDF**.
Perbedaan kedua file diukur, dan hasilnya menentukan:

| Ciri | `contoh format BKU-PDF tahunan.pdf` / `BKU tahunan.pdf` | `template-data/bku-output.pdf` |
|---|---|---|
| Cara dibuat | print-to-PDF / scan | **unduh langsung ARKAS** |
| Item teks halaman 1 | **0** | **277–306** |
| Jalur yang dipakai | OCR `tesseract.js` | **`getTextContent()` native** |
| Uraian (`uraian`) | rusak / terpotong | **utuh 100%** |
| `noBukti` bocor ke uraian | ya (BNU07, BNU08, …) | **tidak ada** |

**Konsekuensi keputusan:** semua cacat "kode bukti bercampur di uraian" yang dilaporkan
user **bukan bug aplikasi**, melainkan artefak OCR dari file hasil print-to-PDF. Karena itu
perbaikan yang benar bukan menambal parser, melainkan **membaca text-layer asli bila ada**.

User memutuskan: *"jika file `template-data/bku-output.pdf` lebih akurat, maka gunakan file
tersebut untuk di upload dan abaikan file `template-data/BKU tahunan.pdf`"*. Keputusan itu
dilaksanakan sebagai **pemilihan jalur otomatis**, bukan penolakan file:

- Halaman 1 punya text-layer (`ukurTextLayer().hasText`) → **jalur native**
- Tidak ada text-layer → **jatuh ke OCR** seperti sebelumnya (file lama tetap bisa dipakai)

## 8.3 Perubahan sesi penutup (setelah commit `f7e511e`)

| File | Baris | Perubahan | Alasan |
|---|---|---|---|
| `src/utils/bkuPdfRapi.js` | 283 | `gabungBarisLanjutan()` hanya menggabung baris **tanpa nominal sendiri** | memperbaiki regresi `totalPengeluaran` **−72.000** (130.477.500 → **130.549.500**) |
| `src/utils/bkuPdfPages.js` | 259 | **+63** — `bacaTeksHalaman()` & `bacaTeksNative()` | membaca text-layer asli, koordinat diskalakan `dpi/72` agar heuristik kolom lama tetap berlaku |
| `src/components/bku/BKUUploadPdf.jsx` | 415 | **+43/−?** — pemilih jalur native vs OCR | satu komponen, dua sumber teks, parser yang sama |
| `src/utils/bkuPdfDuplikat.js` | 84 | `ringkasPerBulan()` memakai definisi riil ADR §T | memperbaiki **saldo awal Agustus** (lihat §8.4) |
| `test-bku-pdf-native.mjs` | 78 | **baru** — oracle jalur native | mengunci 12 fakta jalur native agar tidak diam-diam rusak |

### Rincian regresi 72.000 (penting untuk masa depan)

`gabungBarisLanjutan()` semula menggabung **semua** baris lanjutan ke baris induk. Baris
lanjutan yang **punya nominal sendiri** adalah transaksi terpisah; setelah digabung,
`redetectTypes()` mengklasifikasi ulang induk hasil gabungan dan nominal `PEMBAYARAN` hilang.
Perbaikan: baris dengan `penerimaan`/`pengeluaran` **tidak pernah** digabung.

## 8.4 Dua keluhan user dan penyelesaiannya

**Keluhan 1 — "saldo awal bulan Agustus harusnya 82.560.000".**

Penyebab bukan salah baca. Di PDF **tidak ada baris "Saldo Awal" sama sekali** (sudah
disisir seluruh halaman untuk kata `awal`/`semester`/`saldo`). Yang terjadi: Agustus memuat
BOSP Tahap 2 **82.560.000** *ditambah* PPh 23 **54.000 + 107.000** sehingga tabel menampilkan
**82.721.000**. Angka itu benar sebagai penjumlahan mentah, tapi salah sebagai "dana masuk".

Penyelesaian: `ringkasPerBulan()` memakai **definisi riil ADR §T** — Masuk = `PENERIMAAN_BOSP`
saja, Keluar = `PEMBAYARAN` saja. Hasil: **Agustus Masuk = Rp 82.560.000**. Ini sekaligus
menutup inkonsistensi lama (kartu ringkasan memakai definisi riil, tabel memakai jumlah mentah).
Bukti kuat: dengan definisi ini `BOSP − PEMBAYARAN = Δsaldo` untuk **9 dari 9 bulan**.

**Keluhan 2 — "no bukti masih bercampur di uraian, contoh BNU07 dan BNU08".**

Terbukti artefak OCR. Jalur native menghasilkan **0 uraian tercemar** dan **0 `PEMBAYARAN`
tanpa `noBukti`**, dengan `BNU07` → `Pendaftaran Lomba-lomba Akademik` dan `BNU08` →
`Pendaftaran Lomba-lomba FTBI`. Percobaan menambal ini di `bkuPdfTeks.js` **dibatalkan**
karena mengubah `tipe` beberapa baris dan menggeser total beku (132.541.000). Sudah
diverifikasi tidak ada residu (`mBukti`/`awalan`/`sisaU` = 0 hit).

## 8.5 Gate akhir — dijalankan ulang saat penutupan

```
$ node test-bku-pdf-native.mjs                        -> HASIL: SEMUA PASS   (exit 0)
$ node test-bku-recalc-summary.mjs                    -> HASIL: SEMUA PASS   (exit 0)
$ node test-bku-pdf-semua-bulan.mjs                   -> HASIL: SEMUA PASS   (exit 0)
$ node test-bku-tanggal.mjs                           -> 13 lulus / 0 gagal
$ node test-bku-pdf-parse.mjs --pdf --all-months      -> 0 selisih · SEMUA BULAN 0 selisih · TOTAL TAHUNAN cocok (exit 0)
$ npm run build                                       -> ✓ built in 11.85s   BUILD_EXIT=0
```

Pemeriksaan statis (pola diperbaiki — lihat catatan di bawah):

```
storageHelper.set('bku_data'  di BKUUploadPdf.jsx : 1
...tersimpan (spread data lama)                   : 0
kelas warna terlarang (bg|text|border|ring-)      : 0
hex literal (#rrggbb)                             : 0
window.confirm / <dialog> / role="dialog" / Modal : 0
```

⚠️ **Jebakan pola grep yang sempat menipu di sesi ini** — catat agar tidak diulang:
`grep -c "rose"` memberi **8 hit palsu** karena kata **`proses`** mengandung substring
`rose`. `grep -c "konfirmasi"` memberi **1 hit palsu** karena hanya muncul di komentar
dokumentasi. Pola harus memakai batas kata / awalan kelas Tailwind.

## 8.6 Native vs OCR — angka yang harus dipahami

| Ukuran | OCR (file print-to-PDF) | Native (file unduh ARKAS) | Status |
|---|---|---|---|
| Jumlah baris | 420 | **420** | sama |
| Σ penerimaan mentah | 182.305.000 | **182.305.000** | sama |
| Σ pengeluaran mentah | 149.582.000 | **149.582.000** | sama |
| Saldo akhir | 32.723.000 | **32.723.000** | sama |
| `totalPenerimaan` (BOSP) | 165.120.000 | **165.120.000** | sama |
| `totalPengeluaran` (PEMBAYARAN) | 130.549.500 | **132.397.000** | **beda** |
| Uraian tercemar | ada | **0** | native menang |
| `PEMBAYARAN` tanpa `noBukti` | ada | **0** | native menang |

**Kenapa `totalPengeluaran` berbeda Rp 1.847.500?** Bukan angka hilang — ini **klasifikasi
lebih benar**. OCR memecah 8 baris menjadi potongan `LAINNYA`/`PUNGGUT_PPH` sehingga
nominalnya tidak masuk `PEMBAYARAN`; native membaca utuh. Total mentah identik, jadi tidak
ada uang yang hilang atau bertambah.

**Aturan yang tetap berlaku:** `test-bku-pdf-parse.mjs` (oracle OCR) **masih menuntut
130.549.500** dan tetap PASS — jalur OCR tidak diubah sama sekali. Dua jalur punya angka
ringkasan berbeda karena kualitas baca berbeda, dan itu didokumentasikan, bukan disembunyikan.

## 8.7 Yang TIDAK diverifikasi (jujur, tidak berubah dari §5)

Uji berikut butuh browser dan **tidak dijalankan** — tidak ada dev server di sesi ini:

| Task | Isi | Status |
|---|---|---|
| T-05 | penyaring tidak mengubah jumlah simpanan | **BELUM** (statis: total dari `aktif`, penyaring hanya `tampilSaring`) |
| T-07 | tanpa dialog konfirmasi | **BELUM** (statis: 0 dialog, 1 hit komentar) |
| T-10 | isi `header`/`footer` di localStorage | **BELUM** |
| T-14 | halaman BKU terisi tanpa reload | **BELUM** |
| T-16 | 3 skenario gagal tidak mengubah data | **BELUM** |
| T-17 | cetak (`print:hidden`) | **BELUM** |

User tetap menutup sprint ini. **Risiko yang diterima:** keenam task di atas bisa jadi
menyembunyikan cacat UI yang tidak terdeteksi uji node. Bila nanti muncul keluhan pada
alur unggah/simpan/cetak, keenam task ini adalah tempat pertama yang harus diperiksa —
bukan dicari dari nol.

## 8.8 Status commit

| Bagian | Status |
|---|---|
| Sprint 016 (semua bulan, `bkuParser.js`, pack dokumen) | **sudah ter-commit** → `f7e511e` (2026-10-20 09:23:09 +0700) |
| Jalur native + perbaikan 72.000 + definisi Agustus + oracle baru | **BELUM di-commit** — menunggu persetujuan user |

Berkas yang belum di-commit (8 diubah, 1 baru):

```
M spj-frontend/src/utils/bkuPdfRapi.js            (+97)
M spj-frontend/src/utils/bkuPdfPages.js           (+63)
M spj-frontend/src/utils/bkuPdfTeks.js            (+60)  ← rapikanNoBukti/rapikanUraian, sesi sebelumnya
M spj-frontend/src/utils/bkuPdfDuplikat.js        (+18)
M spj-frontend/src/components/bku/BKUUploadPdf.jsx(+43)
M spj-frontend/src/utils/bkuPdfParser.js          (+7)
M spj-frontend/test-bku-pdf-semua-bulan.mjs       (+15)
A spj-frontend/test-bku-pdf-native.mjs            (78 baris, baru)
M STATE.MD · planning/sprints/sprint-016/BUILD-REPORT.MD
```

**Tidak** termasuk: `DataGuruPage.jsx` (perubahan lama, tidak terkait sprint), aset
`template/*`, `template-data/*`, `public/logo-dinas.png` (untracked, bukan bagian sprint),
serta `test-kas-*.mjs` / `test-pajak-barisa.mjs` (oracle sprint lain).

## 8.9 Kebersihan

- 3 skrip diagnostik sementara dihapus: `tmp-cluster-count.mjs`, `tmp-ukur-baris.mjs`,
  `tmp-ukur-baris2.mjs` (tidak ter-track, milik sendiri).
- `spj-frontend/dist-verify/` sudah tidak ada.
- Tidak ada perubahan pada `bkuParser.js` di working tree (**0 diff**).
- Tidak ada residu patch yang dibatalkan di `bkuPdfTeks.js`.

## 8.10 Pelajaran yang dibawa ke sprint berikutnya

1. **Periksa asal file sebelum menyalahkan parser.** Satu pertanyaan ("ini print-to-PDF
   atau unduh?") menghemat perbaikan parser yang justru merusak total beku.
2. **"Total mentah sama" ≠ "klasifikasi sama".** Selalu bandingkan per baris per tipe,
   bukan hanya total tahunan.
3. **Definisi ringkasan harus satu.** Dua jalur berbeda (simpan vs muat) menghasilkan angka
   berbeda untuk data yang sama — bug ini bersembunyi lama karena hanya muncul setelah reload.
4. **Pola grep bisa berbohong.** `rose` di dalam `proses`; `konfirmasi` di dalam komentar.
   Bukti statis harus dibaca isinya, bukan hanya hitungannya.

