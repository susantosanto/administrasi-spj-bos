# BUILD-REPORT - Sprint 025: Upload BKU PDF 3 Mode

## Ringkasan

Kode SELESAI & GATE HIJAU. Upload PDF 3 mode (Bulanan/Semester/Tahunan),
akumulasi per periode, tahunan ganti semua + konfirmasi, form koreksi manual
dihapus. Angka parse PDF asli cocok persis dengan baris Jumlah PDF.

## Berkas diubah

1. `src/utils/bkuPeriode.js` (BARU, ±200 baris) — util murni: kunciPeriode,
   mergePeriode, urutKronologis, hashBytes, modusBulan, agregatMurni,
   agregatPdf, semesterDariBulan (Tahap BOS).
2. `src/utils/__tests__/bkuPeriode.test.js` (BARU) — 11 test.
3. `src/components/bku/BKUUploadPdf.jsx` (TULIS ULANG) — dropdown 3 mode +
   pemilih periode + ringkasan baca-saja + simpan via mergePeriode +
   konfirmasi tahunan + gate hash + peringatan kop. Form koreksi
   (ubah/buang/pulihkan, perluKoreksi, saring, hanyaBertanda) DIHAPUS.
4. `src/pages/dashboard/BKUPage.jsx` (KECIL, 2 edit) — teruskan
   riwayatImporPdf + penanda periode "Maret 2026, April 2026".
5. `planning/sprints/sprint-025/probe-025.mjs` (BARU) — 10 asersi vs PDF asli.

## Bukti gate

- vitest bkuPeriode: 11/11 PASS.
- probe-025: 10/10 PASS dari PDF asli (Maret 46.376.100/5.492.000/40.884.100,
  April 40.980.100/31.838.700/9.141.400 — cocok persis baris Jumlah).
- browser cek-025 (Edge headless, :5174): 8/8 PASS — Maret→April = 156 baris,
  upload ulang nol duplikat (gate hash), penanda periode tampil, konfirmasi
  tahunan tampil, simpan-tanpa-centang ditolak, 0 console error.
- build: `✓ built in 12.30s` exit 0.
- Screenshot: `spj-frontend/bukti-025-bku-3mode.png`.

## Deviasi dari BLUEPRINT (disetujui implisit — blast radius LEBIH KECIL)

- D-1: `bkuParser.js` TIDAK diubah (0 diff). Alasan: tipe SALDO_AWAL/
  BUNGA_BANK/PAJAK_BUNGA sudah ada di detectTransactionType; penandaan
  periode dikerjakan mergePeriode. Regresi bkuParser: 2 FAIL pre-existing
  (dibuktikan via git stash: gagal juga di HEAD bersih).
- D-2: AC-5 memakai agregatPdf (semantik baris Jumlah: jumlah SEMUA kolom)
  bukan agregatMurni (ADR-T riil). Alasan: baris Jumlah PDF bulanan memang
  mencakup saldo awal + setor/terima PPh. agregatMurni tetap ada untuk
  definisi riil.
- D-3: upload ulang file IDENTIK dilewati via gate hash (toast info) alih-alih
  parse-ulang — hasil akhir identik (nol duplikat), memenuhi AC-2 + AC-7
  sekaligus. File revisi (hash beda) tetap parse + ganti periode.
- D-4: amber warning (peringatan kop) — satu-satunya warna non-blue/slate,
  hanya indikator status sementara di layar, tidak ikut cetak (sesuai
  pengecualian CONSTITUTION di AGENTS.MD).
- D-5: vitest dijalankan via npx v5.0.5 (devDep 2.1.9 tidak terinstal di
  node_modules) — hanya runner, bukan perubahan dependensi.

## Jujur belum

- acceptance-runner fresh context (aturan: konteks segar, kuasa user).
- Uji file semester & tahunan ASLI di browser (probe memakai kunci semester
  sintetis; parse PDF tahunan 21 halaman belum diuji end-to-end browser).
- Jalur upload ulang file REVISI (hash beda) di browser — ganti-periode
  terverifikasi di probe AC-2 level util, belum klik browser.
- Commit/push (kuasa user).
