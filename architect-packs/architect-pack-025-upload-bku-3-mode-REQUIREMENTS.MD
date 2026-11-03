# REQUIREMENTS - Sprint 025: Upload BKU PDF 3 Mode

Sumber: `docs/prd-bku-upload-mode.md` + `docs/user-flow-bku-upload-mode.md` (Bab 8.4: apa & mengapa saja, tanpa bagaimana).

## Tujuan Sprint

Satu tujuan (Bab 10.3): tombol Upload PDF di halaman BKU punya 3 mode — Bulanan, Semester, Tahunan —
dengan Bulanan/Semester akumulatif dan Tahunan menggantikan semua. Fitur koreksi manual upload PDF dihapus.

## Apa yang Dibangun

- Dropdown mode pada tombol Upload PDF: BKU Per Bulan / BKU Per Semester / BKU Tahunan.
- Mode Bulanan: pilih bulan+tahun → upload 1 PDF → data bulan itu ditambah; upload ulang bulan sama → ganti bulan itu saja.
- Mode Semester: pilih semester+tahun → upload 1 PDF → data semester itu ditambah/diganti (definisi terkunci opsi B: Semester 1 = Tahap 1 BOS Jan–Jun, Semester 2 = Tahap 2 BOS Jul–Des).
- Mode Tahunan: upload 1 PDF → ganti SELURUH dataset (perilaku hari ini, plus dialog konfirmasi karena destruktif).
- Dataset gabungan selalu terurut kronologis tanggal.
- Baris SALDO_AWAL / JUMLAH / BUNGA_NOL ditandai tipenya dan dikecualikan dari agregat gabungan.
- Hapus form koreksi manual (preview-edit, koreksi inline, kecualikan baris) dari alur upload PDF.

## Mengapa

Perilaku hari ini (`BKUUploadPdf.jsx` tulis atomik ganti seluruh `spj_bku_data`) menghapus bulan sebelumnya
setiap upload baru. Bendahara butuh cicil upload per bulan sesuai terbitnya PDF ARKAS, dan sesekali
mengganti semuanya dengan PDF tahunan.

## Pengguna

- Bendahara/operator SDN Pasirhalang (upload, non-teknis).
- Kepala sekolah (memeriksa BKU gabungan).

## Data Sumber

- `template-data/bku-output-maret.pdf` (acuan Jumlah: 46.376.100 / 5.492.000 / 40.884.100).
- `template-data/bku-output-april.pdf` (acuan Jumlah: 40.980.100 / 31.838.700 / 9.141.400).
- `template-data/bku-output.pdf` (PDF tahunan 21 halaman, acuan akhir 182.305.000 / 149.582.000 / 32.723.000).

## Output yang Diharapkan

- Upload Maret lalu April → kedua bulan tampil lengkap dan terurut; upload ulang Maret → hanya Maret berganti;
  upload tahunan → hanya isi PDF tahunan; tidak ada form koreksi pada alur PDF.

## Batasan

- localStorage prefix `spj_`, kunci `spj_bku_data` tidak berubah; tanpa backend; tanpa library baru.
- Jalur upload Excel tidak disentuh. Desain visual dropdown final = tim UI (builder sediakan perilaku + struktur minimal).
- BLUE-ONLY `#004ac6` + slate; cetak A4/mm tidak terdampak.
