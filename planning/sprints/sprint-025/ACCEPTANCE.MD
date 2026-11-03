# ACCEPTANCE - Sprint 025: Upload BKU PDF 3 Mode

## Task Gate (wajib hijau SEBELUM kriteria sprint dinilai)

- `npx vitest run src/utils/__tests__/bkuPeriode.test.js` → semua PASS (T-1–T-3).
- `npx vitest run src/utils/__tests__/bkuParser.test.js` → semua PASS, nol regresi (T-4).
- `npm run build` (di `spj-frontend/`) → `✓ built in` exit 0 (T-5–T-6).
- Baris DSA pada T-1 ada dan konsisten dengan BLUEPRINT (presence check).

## Kriteria (Given/When/Then + perintah + output harapan)

- [ ] AC-1 Akumulasi bulanan. Given dataset kosong; When upload Maret lalu April via mode Bulanan (probe pakai data parse kedua PDF contoh); Then total baris = baris Maret + baris April, terurut tanggal.
      Perintah: `node planning/sprints/sprint-025/probe-025.mjs`. Harapan: `AC-1 PASS (maret=N april=M total=N+M terurut)`.
- [ ] AC-2 Ganti periode. Given hasil AC-1; When upload ulang Maret (isi sama); Then baris Maret identik (tidak duplikat), April utuh.
      Harapan: `AC-2 PASS (maret diganti, april utuh, nol duplikat)`.
- [ ] AC-3 Semester. Given dataset kosong; When merge 1 PDF bertanda Semester 1 lalu 1 bertanda Semester 2; Then keduanya ada, gabungan kronologis.
      Harapan: `AC-3 PASS`.
- [ ] AC-4 Tahunan ganti semua. Given hasil AC-1; When upload tahunan; Then hanya isi PDF tahunan.
      Harapan: `AC-4 PASS (hanya tahunan)`.
- [ ] AC-5 Angka cocok. Total agregat-murni Maret = 46.376.100 / 5.492.000 / 40.884.100; April = 40.980.100 / 31.838.700 / 9.141.400.
      Harapan: `AC-5 PASS (maret cocok, april cocok)`.
- [ ] AC-6 Tanpa koreksi. Alur upload PDF tidak menampilkan form input koreksi (cek kode: tidak ada input edit pada `BKUUploadPdf.jsx`).
      Harapan: `AC-6 PASS (nol form koreksi)`.
- [ ] AC-7 Edge: file identik diupload 2x → dilewati via hash, bukan duplikat. Harapan: `AC-7 PASS`.
- [ ] AC-8 Edge: kop PDF beda bulan dengan pilihan → peringatan + batal/lanjut. Harapan: `AC-8 PASS`.

## Output yang Bisa Didemonstrasikan

- Browser halaman BKU: Maret → April → Maret-ulang → Tahunan, masing-masing dengan screenshot + toast yang benar.
- Build `✓ built in` exit 0.
