# REQUIREMENTS — Sprint 014: Laporan Rincian Pajak (menu + preview + cetak landscape)

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & kenapa saja, TANPA bagaimana).
> Sumber: Idea Brief FINAL 2026-10-19 (6 keputusan xcode) + audit openpyxl
> `template/Contoh template Rincian Pajak Sekolah Dasar Negeri.xlsx` (sheet `SD_SMP`).
> Branch kerja: `feat/laporan-rincian-pajak` (base = `wip/register-kas-bap`, 2026-10-19).

## 1. Goal

Satu kalimat: **bendahara menekan satu menu di Dokumen Kelengkapan dan mendapat laporan
Rincian Pajak yang barisnya sudah terisi otomatis dari BKU — siap dicetak landscape
identik dengan file contoh, tanpa mengetik ulang apa pun dari Excel.**

One-liner: **Nilai pajak datang dari BKU; yang tidak ada di BKU diisi tangan user di layar.**

## 2. Users

- Bendahara sekolah (user tunggal aplikasi): input BKU, lalu cetak rincian pajak untuk LPJ.
- Non-goal: multi-user, approval, backend, kirim/bayar pajak ke Coretax.

## 3. Data Sources

| Sumber | Peran di sprint ini |
|---|---|
| `template/Contoh template Rincian Pajak Sekolah Dasar Negeri.xlsx` (sheet `SD_SMP`) | Oracle format cetak (WAJIB identik) |
| `bku_data` di localStorage (`spj_bku_data`) | Sumber baris pajak: transaksi bertipe `SETOR_PAJAK` / `PAJAK_BUNGA` |
| `getSchoolData()` (Data Sekolah) | Nama Sekolah per baris |
| `spj_pajak_manual` (key baru, localStorage) | Isian manual per baris (jenis pajak, NTPN, kode billing, tanggal) |

## 4. Bukti Audit Template (dasar angka acceptance)

Ekstraksi openpyxl 2026-10-19 (bukan perkiraan):

- 1 sheet `SD_SMP`; **landscape**, `paperSize=9` (A4), `scale=45`, margin L/R 0,7 T/B 0,75.
- **16 kolom A..P**: NO · Nama Sekolah · Jenjang · BULAN PAJAK · URAIAN PAJAK · NILAI
  BELANJA · PPh 21 · PPh 22 · PPh 23 · PPN · Total · TANGGAL BAYAR · TANGGAL NTPN ·
  NTPN · NOMOR KODE BILLING · KETERANGAN. Lebar kolom A..P =
  9,00/24,71/13,43/11,71/108,71/10,57/6,43/6,71/10,57/8,00/11,57/8,43/8,43/21,57/18,86/11,71
  (default Excel = 8,43 untuk L, M).
- Header 2 tingkat: baris 3-4 (merge A3:A4 … P3:P4; **G3:J3** = "JUMLAH/JENIS SETORAN
  PAJAK" menaungi 4 sub-kolom G4..J4 = PPh 21 / PPh 22 / PPh 23 / PPN), baris 5 =
  nomor kolom 1..16. Data baris 6-29 (24 baris contoh). Baris Total 30: `A30:F30`
  merge "Total"; `G30/H30/J30/K30 = SUM(...)`; **I30 (PPh 23) KOSONG di sumber**.
- Judul `A1` = "R6NCIAN PAJAK SEKOLAH  TA 2026" (typo). Catatan `L2` =
  "Catatan : tanggal diisi dengan format tanggal". Catatan bawah `A33` =
  "Ket : Pajak yang di bayar oleh sekolah (tidak dari SIPLAH)".
- Font sumber: judul Calibri 11 bold; seluruh header + nomor kolom Arial 8 bold
  (center); border header medium (tepi) + thin (dalam).
- Contoh data: nilai HANYA di kolom PPh 23 (I) = 62.000 / 24.000; `K = =I{baris}`;
  NILAI BELANJA (F) KOSONG di semua baris contoh; tanggal bayar/NTPN tanggal nyata
  (7 Jun 2026, 29 Jun 2026); NTPN 16 karakter; kode billing 15 digit.

## 5. Scope (WHAT)

1. **Menu baru "Rincian Pajak"** di kategori **Keuangan** halaman Dokumen Kelengkapan
   (id `RPAJAK`, `kasDoc: 'rincian-pajak'`), mengikuti pola kartu kas yang sudah ada.
2. **Panel preview** dokumen Rincian Pajak (landscape) — split-view form kiri +
   PanelPreviewDocument kanan + area cetak di bawah, persis pola Register Kas.
3. **Baris terisi otomatis dari BKU**: setiap transaksi `SETOR_PAJAK` atau
   `PAJAK_BUNGA` dengan `pengeluaran > 0` = 1 baris (NO urut, Nama Sekolah dari Data
   Sekolah, Jenjang dari form, BULAN PAJAK dari `tx.bulan`, URAIAN PAJAK dari
   `tx.uraian`, Nilai pajak = `tx.pengeluaran` masuk Total). Urutan: bulan lalu
   tanggal (mengikuti contoh: Februari → Juni). **TANGGAL BAYAR** otomatis dari
   `tx.tanggal` (tanggal transaksi BKU = tanggal setoran), bisa ditimpa manual.
4. **Kolom manual per baris** (tidak ada di BKU): jenis pajak (dropdown PPh 21/PPh 22/
   PPh 23/PPN — tanpa default otomatis), TANGGAL NTPN, NTPN, NOMOR KODE BILLING,
   KETERANGAN. Nilai masuk kolom PPh 21/22/23/PPN sesuai pilihan; Total = nilai BKU.
   Isian disimpan di `spj_pajak_manual` (kunci baris stabil), bertahan saat halaman
   dibuka ulang.
5. **Cetak landscape A4 identik template**: judul (RINCIAN — typo sumber dibetulkan
   sesuai keputusan user), catatan L2, tabel 16 kolom + header 2 tingkat + baris nomor,
   baris Total dengan SUM di kelima kolom pajak + Total (I30 yang kosong di sumber
   DITAMBAH SUM sesuai keputusan user), catatan A33.
6. NILAI BELANJA (F) **selalu kosong** — kosong juga di sumber, tidak ada data di BKU.

## 6. Out of Scope (dilarang)

- Mengubah parser/BKU (`bkuParser.js`), halaman BKU, jalur Excel upload.
- Bayar/kirim pajak ke Coretax; import dari SIPLAH (baris SIPLAH memang bukan milik
  sekolah — tidak masuk BKU sekolah).
- Export `.xlsx` (cetak PDF cukup), tanda tangan digital, halaman lain.
- Mengubah Register Kas/BAP/Cover dan dokumen kas lain yang sudah jalan.

## 7. Constraints

- Stack terkunci: React 18 + Vite + Tailwind; **tanpa dependency baru**.
- Pola wajib: `templateConfig.js` → `TemplateEngine.jsx` → block component (pola
  Register Kas); builder data di `utils/dokPajak.js`; storage prefix `spj_`.
- Visual: BLUE-ONLY `#004ac6` + slate; print-area hanya berisi dokumen.
- A4 landscape via `orientation: 'landscape'` di templateConfig + mekanisme cetak yang
  sudah ada (`paperSize.js`).
- Build `npm run build` exit 0; console 0 error.

## 8. Asumsi Terkunci (mengikat builder)

- **A1 — cakupan baris:** `tipe ∈ {SETOR_PAJAK, PAJAK_BUNGA}` DAN `pengeluaran > 0`.
  `PUNGUT_PPH` = penerimaan (bukan dibayar sekolah) → TIDAK masuk.
- **A2 — nilai pajak:** = `tx.pengeluaran` apa adanya; tidak dihitung ulang.
- **A3 — Total per baris:** = nilai pajak (1 jenis saja per baris, seperti contoh
  di mana setiap baris hanya punya satu kolom pajak terisi).
- **A4 — tanpa default otomatis:** kolom jenis pajak TIDAK dipilih otomatis dari tipe
  (aturannya: nilai yang menentukan manusia tidak boleh ditebak aplikasi). Sebelum
  dipilih, kolom PPh 21/22/23/PPN kosong; Total tetap tampil.
- **A5 — tahun judul:** "TA <tahun>" = ketikan form bila diisi; jika kosong, tahun
  transaksi pajak tertinggi di BKU.
- **A6 — kunci baris manual:** `${tanggalISO}|${uraian}|${pengeluaran}|${noBukti}` —
  isian lama tetap nyambung walau baris BKU bertambah/berkurang.
- **A7 — identik dengan pengecualian 2 keputusan user:** judul "R6NCIAN" → "RINCIAN";
  I30 kosong → ditambahi SUM. Sisanya replika.

## 9. Success Metrics

| Kriteria | Target |
|---|---|
| Transaksi pajak BKU muncul sebagai baris | 100% baris SETOR_PAJAK+PAJAK_BUNGA (0 baris hilang, 0 baris bilangan) |
| Nilai per baris = `pengeluaran` BKU | sama persis (spot-check vs data uji) |
| Total baris = SUM kolom pajak & Total | sesuai hitung otomatis |
| Isian manual bertahan setelah reload | nilai di `spj_pajak_manual` terbaca ulang |
| Cetak landscape A4 | 1 halaman landscape; geometri kolom ≈ template (16 kolom, urutan & proporsi) |
| Build / console | exit 0 / 0 error |
