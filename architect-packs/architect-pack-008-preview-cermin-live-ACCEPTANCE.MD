# ACCEPTANCE — Sprint 008: Preview Cermin Live (3 zona layar-only)

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah + output harapan. Semua perintah dari root D:\project\spj-app.
> Branch: feat/sprint-008-preview (dari main). Sifat: pack DOCS-ONLY dulu; kriteria di bawah untuk tahap eksekusi SETELAH pack disetujui (dry-run-first, TUNGGU persetujuan).

## Task Gate (WAJIB sebelum kriteria dinilai)

npm run build exit 0 per bagian (A/B/C) + grep per task BLUEPRINT sudah hijau. Gate akhir verifikasi perilaku 3 zona + cetak steril.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01-C-08 centang + T-01-T-08 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Zona A tampil: Data Surat grid + tanggal dana masuk langkah-1 + penerima + CRUD konten, semua editable (T-02)
- [ ] C-02 Zona B cermin live: SummaryCard sticky + badge + label DIPERBARUI OTOMATIS update tiap ketikan (T-03)
- [ ] C-03 Tombol Cek: readiness check sorot field kosong pertama + scroll + fokus (T-04)
- [ ] C-04 Zoom/Reset/fullscreen: hanya ubah tampilan layar Zona B, cetak A4 tak berubah (T-05)
- [ ] C-05 Zona C gate: checklist belum centang / masih ada pelanggaran = Cetak terhalang jujur + peringatan (T-06)
- [ ] C-06 Cetak steril: formal tetap A4 mm via orientation; diff cetak kosong; tanpa kop/TTD penuh di tab (T-07)
- [ ] C-07 Larangan: tanpa TTD digital, tanpa KIRIM, tanpa QR, tanpa navy, 0 lib baru, prefix spj_ utuh (T-07/T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build

- Given semua task selesai. When `cd spj-frontend && npm run build` (+ `node -v`)
- Then exit 0, tampil built in ... Bukti: output terminal asli

### T-02 — Zona A editor (F1)

- Given seed dokumen 1 Mamin/notulen terbuka di DokumenSPJPage
- When isi nomor + tanggal dana masuk + tambah 1 baris konten berulang
- Then nilai tersimpan di formData + localStorage prefix spj_ + tampil di Zona A tanpa reload. Bukti: screenshot Zona A + `grep -n "tanggalDanaMasuk\|Data Surat" spj-frontend/src/components/templates/DokumenFormPreview.jsx` min 1

### T-03 — Zona B cermin live + badge (F2)

- Given Zona A dan B tampil berdampingan. When ketik 1 huruf di field Zona A
- Then Zona B re-render sinkron (tanpa tombol refresh) + label DIPERBARUI OTOMATIS tampil + badge LENGKAP/N-perlu update + aria-live polite ada. Bukti: screenshot sebelum/sesudah ketik + `grep -n "DIPERBARUI OTOMATIS\|aria-live\|SummaryCard" spj-frontend/src/components/templates/SummaryCard.jsx` min 2

### T-04 — Tombol Cek sorot pelanggaran (F2)

- Given 1 field wajib dikosongkan. When klik Cek di Zona B
- Then field kosong pertama ter-highlight dashed + halaman scroll ke sana + fokus keyboard pindah ke sana + badge per penerima update. Bukti: screenshot highlight + `grep -n "readinessCheck\|Cek" spj-frontend/src/components/templates/SummaryCard.jsx spj-frontend/src/components/templates/DokumenFormPreview.jsx` min 1

### T-05 — Zoom/Reset/fullscreen layar-only (F2)

- Given Zona B tampil 100 persen. When klik zoom-in 2x lalu Reset lalu fullscreen lalu keluar
- Then tampilan Zona B membesar/mengecil/penuh/kembali; .print-container dan hasil print A4 tidak berubah (cek via print-preview browser tetap A4). Bukti: 3 screenshot (100/150/fullscreen) + `grep -n "zoom\|requestFullscreen\|Reset" spj-frontend/src/components/templates/SummaryCard.jsx` min 2

### T-06 — Zona C gate pra-cetak (F3)

- Given checklist belum centang ATAU masih ada pelanggaran. When klik Cetak
- Then tombol Cetak disabled atau klik tampilkan peringatan jujur (bukan cetak diam-diam); setelah checklist dicentang DAN pelanggaran nol, Cetak jalan (window.print) + snapshot spj_otomatis_snapshot tertulis. Bukti: 2 screenshot (terhalang + lolos) + `grep -n "spj_otomatis_snapshot\|window.print" spj-frontend/src/components/templates/PeringatanData.jsx` min 1

### T-07 — Regresi cetak steril + larangan (gate warisan)

- Given selesai. When
- ```bash
  git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx
  grep -rniE "TTD digital|KIRIM|QRCode|qrcode|navy|#001f3f" spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/components/templates/SummaryCard.jsx spj-frontend/src/components/templates/PeringatanData.jsx
  grep -n "print-area\|print-container" spj-frontend/src/components/templates/SummaryCard.jsx spj-frontend/src/components/templates/PeringatanData.jsx
  ```
- Then diff cetak KOSONG (3 path tanpa ubah); grep larangan 0 hasil; grep print-area di 2 file Zona B/C 0 hasil (formal hanya di TemplateEngine print-area). Bukti: output 3 perintah asli

### T-08 — Regresi dependency + storage + warna

- Given selesai. When
- ```bash
  git diff HEAD -- spj-frontend/package.json
  grep -rn "spj_" spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/components/templates/SummaryCard.jsx | head -5
  grep -rniE "emerald|amber|rose|violet|cyan" spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/components/templates/SummaryCard.jsx spj-frontend/src/components/templates/PeringatanData.jsx
  ```
- Then package.json TANPA diff (0 lib baru, versi tetap pin BLUEPRINT); prefix spj_ via storageHelper utuh; warna BLUE-ONLY #004ac6 + slate, (badge sinyal = pengecualian layar-only, teks+ikon). Bukti: output 3 perintah asli

## Uji Manual 2 Mode (DECISIONS.MD 2026-10-01)

- Mode otomatis (agent): jalankan T-01-T-08 di atas via dev server http://localhost:5173/ + screenshot.
- Mode manual (user checklist): agent terbitkan langkah klik + output harapan per zona, user kembalikan bukti, agent hakimi PASS/FAIL. Tawarkan dulu sebelum eksekusi (wajib).
