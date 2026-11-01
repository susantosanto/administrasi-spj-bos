# BUILD-REPORT.MD — Sprint 024: Dokumen Realisasi Dana & Instrumen BOS

## Blanko premium DH + SU (perintah user, setuju konsep)
- Template `daftar_hadir_blanko` (kop + DaftarHadirPaper + signature) + `surat_undangan_blanko` (kop + SuratUndanganPaper + signature); blok + registrasi.
- UI split-view: peserta dari Guru/Tendik (centang) + manual + hapus; penandatangan auto KS+NIP; tersimpan `spj_blanko_dh/su`; preview + cetak. Menu DH/SU → halaman penuh (modal generik dilepas).

## Verifikasi KS vs Guru/Tendik (perintah user)
- Util `verifikasiKs.js`: normalisasi gelar + cocok/mirip(≤3 + tombol Pakai)/tak-ditemukan + cek NIP sama/beda; badge di kartu KS tab Pejabat (blue-only).
- Parser: LABEL_MAP + rekening/bank/atas-nama/status/ijin/telepon/email + hitung PTK (guru/tendik × PNS/NonASN, KS dikecualikan) + siswa (triple L+P=T terbesar). 2 bug diperbaiki (sub-header hentikan loop; `peta[cNama]` vs indeks).
- Upload lama ikut terbaca via resolver allFields (tanpa upload ulang); fallback ketik tetap.
- KS/bendahara + pejabat: sumber tunggal (rev25); Instrumen placeholder "Otomatis".

## Isian dari profil Dapodik (perintah user)

## Header horizontal + auto KS/bendahara (perintah user sebelumnya)
- Header kolom matriks horizontal-wrap (vertical dihapus); landscape menampung 13 kolom.
- Header kolom matriks horizontal-wrap (vertical dihapus); landscape menampung 13 kolom.
- Bendahara Seksi B default nama bendahara; form tampilkan placeholder "Otomatis: …" untuk field bersumber Data Sekolah/KS (pangkat/personil/ijin tetap manual — tak ada sumbernya).

## Isi
1. `utils/realisasiPeta.js` (baru): 12 komponen + 7 SNP + preseden peta (honor-tegas > 0063 > 0061-listrik > kegiatan > null; 08.04.13 eksklusif → Penilaian/Asesmen; 5.2.05.01.01.0001 dikembalikan ke kegiatan).
2. `utils/realisasiAgregat.js` (baru): agregat per tahap + koreksi menang + ringkasTahap (terima/pakai/saldoAwal/saldoAkhir).
3. `templateConfig.js`: +`realisasi_dana` (landscape) + `instrumen_bos` (portrait). Dokumen lain 0 diff.
4. Blok baru `TabelRealisasi` (header vertikal, JUMLAH) + `InstrumenBos` (A–E + footer); registrasi TemplateEngine.
5. `previewDocs.js`: +`realisasiDocs` + `instrumenDocs` (kas/PBJ 0 diff); `SignatureFooter` peranLabel aditif (Sprint 023).
6. `RealisasiPage`: seksi Matriks (tahun+tahap, klik-koreksi + reset, banner selisih, meta sumberDana/periode, preview + cetak). Kartu status lama utuh.
7. `InstrumenPage` (baru) + route `/instrumen`; menu sidebar Realisasi Dana + Instrumen BOS; R-ALR/R-ILB Kelengkapan → navigasi ke halaman penuh (stub diganti).
8. `sekolahData.js` + `DataSekolahPage`: 5 field rekening/SK (deep-merge, jujur-kosong).
9. `templateSuratHelper.js`: sumber tunggal getSchoolData/getPejabat (perbaikan kunci mati); hapus fallback "Bandung".

## Bukti
- Build `✓ built in 10.53s` exit 0.
- `probe-024.mjs`: **23 PASS / 0 FAIL** (matriks = PDF 100%, total 82.560.000, selisih 0; builder cetak; seksi C/D/pajak; profil Dapodik; verifikasi KS; blanko terdaftar).
- `probe-023.mjs` regresi: **121 PASS / 0 FAIL**.
- File tabu 0 diff (area AI, PBJ, kas, LPJ, templateConfig selain 4 template baru).

## Jujur — belum diuji
- Interaksi browser (klik sel, navigasi menu, render panel, cetak) — menunggu user/manual.
- Q-1/Q-2/Q-3 dijawab default (0016→Belum-dipetakan; terima=BOSP tahap; saldo lalu t2=saldo akhir t1).
- Commit/push kuasa user.
