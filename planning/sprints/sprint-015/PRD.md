# PRD — Sprint 015: Import BKU PDF (OCR) — Pintu Masuk Alternatif Identik dengan Excel

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG dimulai sebelum
> pack (REQUIREMENTS/BLUEPRINT/ACCEPTANCE/HANDOFF) disusun dan disetujui (AGENTS.MD).
> Input: Idea Brief /idea-clarifier 2026-10-19 (disetujui user: "saya setuju").
> Sprint sebelumnya: 014 Laporan Rincian Pajak (merge `d46edbc`).
> Runtime: React 18 + Vite, tanpa backend, data ke localStorage (prefix `spj_`).

## 1. Latar Belakang

BKU terpecah dua format sumber: Excel (import jalur `bkuParser.js` — terbukti
akurat, **STERIL, tidak diubah**) dan PDF hasil scan tanpa text layer
(terverifikasi: `template/contoh format BKU-PDF tahunan.pdf` — 21 halaman A4,
595×842 pt, `text_len = 0` di semua halaman, ±421 transaksi/tahun, ±26
transaksi/bulan). Hari ini PDF berarti input ulang manual.

Fitur baru = **pintu masuk alternatif**: pilih bulan (persis alur Excel) →
render PDF (`pdfjs-dist@4.10.38`, sudah terpasang) → OCR (engine pemenang
A/B terukur) → parse baris → tabel preview + koreksi → konfirmasi → tulis
`spj_bku_data`.

## 2. Users

- **Primary — Bendahara SPJ SD** (1 user, desktop Edge/Chrome, sudah terbiasa
  alur import Excel → pilih bulan).
- **Secondary — Penyuluh/operator** yang menyalin PDF BKU dari aplikasi RKAS.

## 3. User Stories & Acceptance Criteria

US-1 — sebagai Bendahara, saya ingin tombol "Upload PDF" di halaman BKU
di samping jalur Excel, agar punya pintu masuk kedua:
- [ ] Tombol tampil di BKUPage, tidak menggeser kontrol yang ada
- [ ] Pilih file `.pdf` via dialog file (pola sama dengan jalur Excel)
- [ ] File non-PDF ditolak dengan pesan jujur

US-2 — sebagai Bendahara, saya ingin memilih PERIODE BULAN dulu (persis
jalur Excel), agar hasilnya cocok dengan cara saya bekerja:
- [ ] Selector bulan tampil setelah file dipilih
- [ ] Default = bulan yang terakhir dipakai di jalur Excel
- [ ] Baris bulan lain diabaikan (tidak masuk preview, tidak masuk simpan)

US-3 — sebagai Bendahara, saya ingin melihat progres per halaman selama
render+OCR berjalan, agar tahu proses hidup (bukan hang):
- [ ] Progres "halaman x dari N" + progress bar tampil dan ber-update
- [ ] Boleh batal di tengah proses → tidak ada data yang berubah (atomic)
- [ ] Error di satu halaman tidak menggagalkan seluruh proses — halaman
      gagal diberi catatan, proses lanjut

US-4 — sebagai Bendahara, saya ingin tabel preview hasil sebelum disimpan,
agar data sampah tidak masuk `spj_bku_data`:
- [ ] Kolom = bentuk baris `spj_bku_data.transactions` (tanggal, noBukti,
      uraian, kodeKegiatan, kodeRekening, penerimaan, pengeluaran, saldo)
- [ ] Baris bermasalah diberi badge (uraian kosong / angka gagal parse /
      tidak cocok dengan pola kolom) — ditandai jelas
- [ ] Jaring pengaman saldo tampil: saldo awal + masuk − keluar = saldo
      akhir (dihitung dari seluruh PDF, baris bulan terpilih untuk preview)

US-5 — sebagai Bendahara, saya ingin mengoreksi baris secara inline
(karena OCR tidak 100% akurat):
- [ ] Kolom uraian / jumlah / tanggal / noBukti bisa diedit (teks & angka)
- [ ] Baris sampah bisa dihapus dengan satu klik
- [ ] Setiap perubahan langsung memperbarui total masuk/keluar di bawah preview
- [ ] Setelah koreksi: jumlah baris = jumlah transaksi bulan itu di Excel

US-6 — sebagai Bendahara, saya ingin dialog konfirmasi sebelum menimpa
data (`spj_bku_data` yang sudah ada hasil Excel):
- [ ] Klik Simpan → dialog konfirmasi tampil SEBELUM menulis
- [ ] Data tidak ditimpa sampai konfirmasi (atomic — semua atau tidak sama
      sekali)
- [ ] Pesan konfirmasi jujur menyebut jumlah baris yang akan masuk

US-7 — sebagai Bendahara, hasil saya otomatis dapat tipe/kategori yang
SAMA dengan jalur Excel, agar alur dokumen kas downstream tidak berubah:
- [ ] `tipe` diisi oleh `detectTransactionType()` yang di-REUSE (bukan
      dikopipasta)
- [ ] `kategori` diisi oleh `detectKategoriBelanja()` yang di-REUSE
- [ ] Baris identik di kedua jalur: import PDF vs Excel — teks sama,
      angka sama, tipe/kategori sama

US-8 — sebagai Bendahara, PDF yang punya text layer akan jauh lebih
cepat (tanpa OCR):
- [ ] Jalur text-layer terdeteksi otomatis (text_len > ambang, per halaman)
- [ ] Hanya halaman scanned yang menunggu OCR (kedua jalur bisa campur)
- [ ] PDF contoh seluruhnya masuk jalur OCR (text layer = 0, terverifikasi)

US-9 — sebagai builder, hasil harus DAPAT BUKTI, bukan klaim:
- [ ] Script oracle: import Januari dari PDF = import Januari dari Excel
      (jumlah baris, masuk, keluar, saldo akhir — 0 selisih)
- [ ] Hasil A/B engine terdokumentasi (tesseract.js vs paddleocr-js):
      angka akurasi terukur di fixture hal 1–4 sebelum dipilih

US-10 — sebagai user, data saya tetap aman saat fitur ini dipakai:
- [ ] Jalur Excel byte-steril: git diff `bkuParser.js` = 0
- [ ] Semua storage memakai prefix `spj_`; tidak ada key tanpa prefix
- [ ] Tidak ada file yang dikirim ke layanan mana pun — seluruh proses di
      perangkat user

## 4. Kontrak API (tanpa backend — kontrak modul internal)

| # | Fungsi (modul baru)                     | Input → Output                                                                                              | Status      |
|---|-----------------------------------------|-------------------------------------------------------------------------------------------------------------|-------------|
| 1 | `bkuPdfPages.js` — `renderPages(pdf)`   | file PDF → canvas per halaman + info text_layer ada/tidak (pdfjs-dist)                                       | MVP         |
| 2 | `bkuPdfOcr.js` — `ocrPage(canvas)`      | canvas halaman → items `{str, x, y, w, h}` (format sama dengan fixture `make_fixture.py`, agar oracle bisa jalan) | MVP    |
| 3 | `bkuPdfParser.js` — `rowsToTransactions(items)` | items (seluruh PDF) → daftar transaksi: tanggal, noBukti, uraian, kodeKegiatan, kodeRekening, penerimaan, pengeluaran, saldo, halaman | MVP |
| 4 | `bkuPdfParser.js` — `reconcile(trans)`  | transaksi seluruh PDF → `{ok, saldoAkhir, mismatches[]}` (saldo awal + masuk − keluar = saldo akhir)          | MVP         |
| 5 | `BKUUploadPdf.jsx` (UI)                 | state preview (pilih bulan + koreksi + hapus) → tulis `spj_bku_data` BULAN terpilih, HANYA setelah dialog konfirmasi | MVP   |
| 6 | fast-path text-layer di modul 2         | halaman ber-text-layer langsung parse tanpa OCR (bonus, bukan jaminan)                                       | MVP (bonus) |
| 7 | fallback jujur                          | gagal OCR/parse → pesan "gunakan jalur Excel", data lama tidak tersentuh                                      | MVP         |

Aturan: `bkuParser.js` WAJIB 0 diff — `detectTransactionType` dan
`detectKategoriBelanja` di-REUSE (import), tanpa disalin. Fungsi baru ≤200
baris/file (aturan proyek). Tidak ada endpoint HTTP; seluruh proses di-browser.

## 5. Data Requirements

| Entity | Key Fields | Catatan |
|--------|------------|---------|
| `spj_bku_data.transactions` (SUDAH ADA — target tulis) | row, tanggal {day,month,year}, tanggalStr `dd-mm-yyyy`, tanggalISO, bulan, tahun, kodeKegiatan, kodeRekening, noBukti, uraian, penerimaan, pengeluaran, saldo, debet (=penerimaan), kredit (=pengeluaran), tipe, kategori | bentuk SAMA PERSIS hasil jalur Excel (bukti di `bkuParser.js` ~line 348–368) |
| `spj_bku_data` (wrapper) | `{ transactions: [...] }` + field meta lain yang sudah ada | upload PDF menimpa HANYA transaksi bulan terpilih, field meta lain tidak disentuh |
| Baris bermasalah (ephemeral, state UI) | `{ flags, reason }` | TIDAK persist — hidup hanya di preview |
| Draft OCR (opsional, Phase 2) | snapshot hasil OCR sebelum commit | untuk undo/crash-tolerance — boleh tidak ada di MVP |

Penulisan ATOMIK: satu kali `storageHelper.set('bku_data', ...)` per commit;
bila gagal → `try/catch` + pesan jujur; data lama tidak berubah.

## 6. Non-Functional Requirements

Performance (prioritas user: **akurasi di atas kecepatan** — angka di bawah
adalah soft target yang WAJIB diukur dan dilaporkan, bukan gate keras):
- Progres per halaman selalu tampak (tidak ada state "hang tanpa feedback")
- Waktu total 21 halaman diukur & dilaporkan; target nyaman ≤ 10 menit di
  PC desktop biasa (WASM OCR); lebih dari itu bukan FAIL selama akurasi terpenuhi
- Render pdfjs ≤ 150 ms/halaman di desktop biasa (terukur, bukan gate)

Akurasi (prioritas utama):
- Uraian ≥ 90% (string match) di halaman contoh — diukur via script oracle
- Import Januari dari PDF = 0 selisih vs Excel (jumlah baris, masuk,
  keluar, saldo akhir)
- Baris bermasalah setelah koreksi: 0
- A/B engine gate: kedua kandidat (tesseract.js vs paddleocr-js) diuji pada
  fixture hal 1–4 (golden angka per sel); angka terukur ditulis di ADR;
  yang dipilih = yang menang terukur; dependency baru pin versi di
  BLUEPRINT.MD sprint ini

Security / Privasi:
- Semua proses di perangkat; tidak ada upload ke layanan pihak ketiga
- Model OCR (bila perlu) self-host di `public/`

Kompatibilitas:
- Desktop Chrome/Edge modern (WASM; bila engine butuh threaded WASM, Vite
  di-set COOP/COEP)

Proyek (aturan constitution):
- Util ≤ 200 baris/file; BLUE-ONLY `#004ac6` + slate (progress bar, badge)
- `spj_` prefix storage; `npm run build` exit 0 wajib tiap perubahan kode

## 7. Success Metrics

| Brief Criterion           | Metrik                                          | Target             |
|---------------------------|-------------------------------------------------|--------------------|
| Import Januari identik    | selisih vs oracle Excel                         | 0 selisih          |
| Akurasi uraian            | string-match rate di halaman contoh             | ≥ 90%              |
| A/B engine terdokumentasi | tabel akurasi terukur di ADR                    | 2 baris, menang dipilih |
| Preview + koreksi         | baris bermasalah bisa dikoreksi sampai bersih   | 0 bermasalah       |
| Konfirmasi sebelum simpan | dialog tampil sebelum `storageHelper.set`       | 100% dari jalur simpan |
| Excel steril              | git diff `bkuParser.js`                         | 0 byte             |

## 8. Out of Scope (salin dari brief)

> Item di bawah ini secara EKSPLISIT dikecualikan. JANGAN implement. Bila ada user
> story yang mengimplikasikan item out-of-scope, hapus atau beri catatan.

- Jalur import Excel diubah sedikit pun (`bkuParser.js` steril)
- Fitur BKU lain (kategori/beranda/dokumen LPJ), backend, multi-sekolah
- Menulis ulang jalur Excel agar "menyamakan" hasil PDF
- PDF yang bukan format BKU RKAS

## 9. Asumsi & Batas

- Format PDF RKAS stabil antar file; contoh file ini representatif
- User punya baseline Excel untuk perbandingan bulan contoh
- Ini fitur PRODUKSI (bukan prototipe) — standar keberhasilan = identik
- PDF ber-text-layer bisa diimport tanpa OCR — bonus, bukan jaminan
- PDF contoh di-rotate (270°); renderer pdfjs menormalisasi —
  penanganan rotasi masuk scope modul render
- Bila akurasi target tidak tercapai oleh kedua engine → sprint ditahan
  untuk keputusan user (preseden: sprint 013 di-reset karena tidak
  berangka)

## 10. Self-Review (checklist)

- [x] Setiap user story punya AC testable (10 US, semua AC bisa diuji)
- [x] Kontrak modul menutup seluruh US (US-1..US-10 → modul 1..7)
- [x] Data requirements mencakup entitas yang disebut di US (target tulis +
      ephemeral + opsional draft)
- [x] NFR spesifik & terukur (≥90%, 0 selisih, ≤200 baris, exit 0, waktu
      diukur & dilaporkan)
- [x] Out of scope hadir & dihormati (Excel steril; tanpa backend)
- [x] Success metrics memetakan tiap kriteria brief
