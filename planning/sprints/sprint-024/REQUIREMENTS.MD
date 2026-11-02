# REQUIREMENTS.MD — Sprint 024: Dokumen Realisasi Dana & Instrumen BOS

Sumber: Idea Brief + PRD 2026-11-01 (user: "lanjutkan"). Contoh: `template/Form isian_BOS  2026 SDN PASIRHALANG.doc` (instrumen) + `template-data/rpd-k7-output.pdf` (realisasi Tahap 1).

## Tujuan
Matriks realisasi otomatis BKU + koreksi per sel + cetak Realisasi per tahap + cetak Instrumen 5 seksi. Selalu 2 tahap.

## Requirements (US-1…US-11)
1. **R-1:** `utils/realisasiPeta.js` — peta prefix rekening → 11 komponen + HONOR + null; pola honor (honor/gtt/narasumber/panitia/upah? — upah 0016 = komponen jasa? TETAPKAN: kode 5.1.02.02.01.0016 → HONOR? Validasi lawan PDF: total honor PDF = Rp 16.200.000 hanya di baris Pembiayaan. Keputusan: HONOR = pola honorarium/guru/narasumber/panitia; 0016 "Upah Tukang" → komponen jasa? — TANYA saat dry-run, default ikut HONOR bila ragu? TIDAK: default null → "Belum dipetakan", user koreksi. Jujur > tebak.)
2. **R-2:** `utils/realisasiAgregat.js` — agregat(txs, {tahun, tahap}): matriks SNP(7) × KOMP(12), JUMLAH, selisih vs total pengeluaran BKU tahap; tahap 1 = bulan 1–6, tahap 2 = 7–12; SNP dari KEGIATAN_BOS.snp (fallback uraian → "Belum dipetakan").
3. **R-3:** Store `spj_realisasi_{tahun}_{tahap}`, `spj_realisasi_koreksi` (override per sel, menang atas agregat + upload ulang), `spj_instrumen_{tahun}`.
4. **R-4:** Template cetak `realisasi_dana` (header + matriks 7×13 + footer saldo/TTD) + blok tabel; template `instrumen_bos` (5 seksi A–E + footer) + blok.
5. **R-5:** UI RealisasiPage diperluas (pilih tahun+tahap, matriks + klik-koreksi, banner selisih, cetak) + halaman/tab Instrumen (form A/B/C/E + preview + cetak; D live dari mesin).
6. **R-6:** Extend `spj_data_sekolah`: nomorRekening, bankRekening, namaRekening, skKepala{nomor,tanggal}, tmtJabatan (deep-merge, jujur-kosong).
7. **R-7:** Pajak seksi E: potong/setor/sisa dari PUNGUT_PPH/SETOR_PAJAK per tahun; bulanan Jan–Des dari BKU; checklist pembukuan.

## Batasan mengikat
- Tanpa ubah dokumen PBJ/kas/LPJ existing (0 diff di luar file baru + 3 titik sentuh: templateConfig tambah, blocks/index + TemplateEngine tambah, DataSekolah +5 field).
- KEPUTUSAN-DIKUNCI-022: area AI 0 diff. Blue-only, A4/mm, `spj_`, tanpa lib baru.
