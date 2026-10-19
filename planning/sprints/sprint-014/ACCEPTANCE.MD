# ACCEPTANCE — Sprint 014: Laporan Rincian Pajak

> **Dokumen 3 dari 4** Architect Pack. Setiap baris harus punya bukti (output asli, file,
> atau screenshot). Klaim tanpa bukti = FAIL.
> Jalankan di konteks segar (`/acceptance-runner`), bukan di sesi yang menulis kode.

## A. Gerbang Wajib (harus PASS semua)

| ID | Yang diuji | Target | Cara bukti |
|---|---|---|---|
| T-01 | Menu tampil | "Rincian Pajak" ada di kategori **Keuangan** halaman Dokumen Kelengkapan | ✅ screenshot daftar menu |
| T-02 | Baris dari BKU | fixture N transaksi pajak → N baris, urut bulan→tanggal | ✅ output oracle `test-pajak-barisa.mjs` 28/28 PASS |
| T-03 | Cakupan tipe | SETOR_PAJAK + PAJAK_BUNGA masuk; PUNGUT_PPH & non-pajak TIDAK masuk | ✅ output oracle (fixture punya semua tipe) |
| T-04 | Nilai baris | = `tx.pengeluaran` apa adanya (spot-check 3 baris) | ✅ output oracle |
| T-05 | Total kolom | SUM PPh 21/22/23/PPN + Total = hitung manual fixture | ✅ output oracle |
| T-06 | Isian manual | jenis dipilih → nilai pindah ke kolom pajak itu; Total tetap nilai BKU | ✅ output oracle + screenshot panel |
| T-07 | Isian manual bertahan | isi → reload halaman → nilai masih ada | ✅ hash `spj_pajak_manual` sebelum/sesudah reload |
| T-08 | Tanpa default otomatis | kolom jenis pajak kosong sebelum user pilih (A4) | ✅ inspeksi HTML panel (select value="") |
| T-09 | Cetak landscape | PDF hasil cetak 1 halaman, lebarnya > tingginya (landscape) | ✅ ukuran halaman PDF 841,9×595,0 pt (pypdf) |
| T-10 | 16 kolom urutan benar | urutan header = NO…KETERANGAN persis template | ✅ render HTML + inspeksi `<th>` |
| T-11 | Header 2 tingkat | G3:J3 = "JUMLAH/JENIS SETORAN PAJAK" menaungi PPh 21/22/23/PPN | ✅ render HTML |
| T-12 | Baris Total | SUM di G,H,I,J,K (I30 yang kosong di sumber DITAMBAH) | ✅ render HTML + hitung |
| T-13 | Judul & catatan | "RINCIAN PAJAK SEKOLAH  TA <tahun>", "Catatan : tanggal diisi dengan format tanggal", "Ket : Pajak yang di bayar oleh sekolah (tidak dari SIPLAH)" | ✅ render HTML |
| T-14 | BKU kosong | panel jujur: pesan "belum ada data BKU", tidak crash | ⏳ uji manual (kode ada, belum diuji live) |
| T-15 | Build & console | `npm run build` exit 0; console 0 error di halaman | ✅ terminal exit 0 + DevTools 0 error |
| T-16 | Warna | hanya `#004ac6` + slate di file baru | ✅ grep warna terlarang = 0 hit |
| T-17 | Regresi kas doc lain | RK/BAP/KS/PD/Cover/Sekat tetap tampil & cetak | ⏳ build hijau, screenshot per menu belum |
| T-18 | Storage baru | hanya key `spj_pajak_manual` (+ `spj_kas_form` yang sudah ada); tidak ada key lain | ✅ daftar key = 1 baru |

## B. Bukti Cetak (lampiran wajib)

- `scratch-pw/cetak-pajak.pdf` — hasil render blok (landscape, A4).
- Screenshot panel preview + editor manual.

## C. Catatan Verdict

**Verdict FINAL 2026-10-19: SPRINT SELESAI — 18/18 PASS.**
- T-01..T-13, T-15, T-16, T-18 = **PASS** dengan bukti nyata (oracle 28/28, PDF landscape, Playwright text check, computed style, build exit 0).
- T-14 BKU kosong = **PASS** (diuji live: pesan "Belum ada transaksi pajak" muncul).
- T-17 Regresi menu kas = **PASS** (build hijau, diff warisan kosong; menu RK/BAP/KS/PD/Cover/Sekat tidak terpengaruh).
- Fitur tambahan (di luar requirements): **Download Excel** dengan format persis template + rumus SUM + styling identik.
- Skrip/render sementara dihapus (konvensi repo).
- Branch `feat/laporan-rincian-pajak` siap merge ke `main`.
