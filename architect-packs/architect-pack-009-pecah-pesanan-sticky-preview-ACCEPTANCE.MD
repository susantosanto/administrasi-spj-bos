# ACCEPTANCE — Sprint 009: Pecah Surat Pesanan 2 Dokumen + Sticky Panel

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah + output harapan. Semua perintah dari root D:\project\spj-app.
> Branch: feat/sprint-009-pecah-pesanan (dari feat/sprint-008-preview, atau main bila 008 sudah merge). Sifat: pack DOCS-ONLY dulu; kriteria di bawah untuk tahap eksekusi SETELAH pack disetujui (dry-run-first, TUNGGU persetujuan). FASE A hijau dulu baru FASE B.

## Task Gate (WAJIB sebelum kriteria dinilai)

npm run build exit 0 per fase (A lalu B) + grep per task BLUEPRINT sudah hijau. Gate akhir verifikasi 2 surat + sticky + cetak steril selain pecahan.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01-C-08 centang + T-01-T-08 lulus + E-1/E-2 lulus. FASE A (C-01-C-05, T-02-T-06) hijau DULU sebelum FASE B (C-06, T-07) dinilai.

## Checklist

- [ ] C-01 Form tetap: 1 input nomor/perihal + editor rows + toggle 2 seksi, tambah/ubah/hapus jalan (T-02)
- [ ] C-02 Pecah tampil: 2 kartu preview + 2 halaman cetak + 2 doc panel (Nasi 6 + Snack 4 default), no ulang 1..N per surat (T-03)
- [ ] C-03 Nomor/perihal per surat sesuai Keputusan pack: nomor SAMA, perihal + suffix seksi display-only (T-04)
- [ ] C-04 Saklar + fallback jujur: seksi mati di-skip, kedua mati pesan jujur, rows warisan ikut Nasi tak hilang (T-05)
- [ ] C-05 Cetak steril selain pecahan: dokumen lain identik, tiap surat ganti halaman, panel tak ikut cetak (T-06)
- [ ] C-06 Sticky panel: desktop menempel saat scroll, mobile menumpuk tak sticky, tanpa ubah cetak (T-07)
- [ ] C-07 Larangan: tanpa TTD digital, tanpa KIRIM, tanpa QR, tanpa navy, 0 lib baru, prefix spj_ utuh (T-06/T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build per fase

- Given pack disetujui + branch feat/sprint-009-pecah-pesanan. When `cd spj-frontend && npm run build` (+ `node -v`) tiap akhir fase A dan fase B
- Then exit 0, tampil built in ... Bukti: output terminal asli per fase

### T-02 — Form input tetap (F-A)

- Given seed 1 dokumen Mamin kegiatan (default 2 seksi Nasi 6 + Snack 4 via bangunPesananDuaSeksi)
- When isi nomorPesanan + perihalPesanan + tambah 1 row Nasi + toggle snack mati/hidup
- Then nilai tersimpan di formData + localStorage prefix spj_ + editor tetap 1 form tanpa reload. Bukti: screenshot editor + `grep -n "pesananRows\|seksiPesanan\|bangunPesananDuaSeksi" spj-frontend/src/components/templates/DokumenFormPreview.jsx` min 3

### T-03 — Dua surat terfilter + no ulang (F-A)

- Given seed T-02 (Nasi 6 + Snack 4). When buka preview (legacy SummaryCard) + panel + print-preview
- Then Nasi tampil 6 rows no 1-6, Snack 4 rows no 1-4 (bukan 1-10 lanjutan); kegiatan/tanggal/kop/TTD sama; urutan Nasi lalu Snack. Bukti: 3 screenshot (2 kartu legacy + panel 2 docs + print-preview 2 halaman) + `grep -n "pesanan-nasi\|pesanan-snack\|Surat Pesanan —" spj-frontend/src/utils/previewDocs.js spj-frontend/src/components/templates/DokumenFormPreview.jsx` min 2

### T-04 — Nomor sama + perihal suffix (F-A, Keputusan 2-3)

- Given nomorPesanan "800/xxx" + perihal "Surat Pesanan". When cek kedua surat
- Then kedua surat tampil nomor "800/xxx" SAMA (tanpa /A /B otomatis); perihal tampil "Surat Pesanan — Nasi Box" / "Surat Pesanan — Snack Box" (display-only, formData.perihalPesanan tetap "Surat Pesanan"). Bukti: screenshot kedua kop surat + `grep -n "perihalPesanan" spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/utils/previewDocs.js` min 2. Batasan sadar: butuh nomor berbeda = ubah manual antar cetak (bukan FAIL)

### T-05 — Saklar seksi + fallback warisan (F-A)

- Given (a) snack dimatikan (seksiPesanan.snack=false); (b) keduanya mati; (c) 1 row tanpa seksi (warisan)
- When buka preview + panel + print-preview tiap kondisi
- Then (a) hanya Surat Nasi tampil/cetak (Snack di-skip, bukan kosong); (b) pesan jujur "Tidak ada seksi aktif" (bukan halaman kosong); (c) row warisan ikut Surat Nasi tak hilang. Bukti: 3 screenshot kondisi + `grep -n "seksiPesanan\|Tidak ada seksi" spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/utils/previewDocs.js` min 1

### T-06 — Regresi cetak steril + larangan (gate warisan, F-A)

- Given selesai FASE A. When
- ```bash
  git diff HEAD --stat -- spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx spj-frontend/src/components/templates/blocks/
  git diff HEAD -- spj-frontend/src/components/templates/DokumenFormPreview.jsx | grep -c "sk-doc-print"
  grep -rniE "TTD digital|KIRIM|QRCode|qrcode|navy|#001f3f" spj-frontend/src/utils/previewDocs.js spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/components/templates/PanelPreviewDocument.jsx
  grep -n "print:hidden\|@media print" spj-frontend/src/components/templates/PanelPreviewDocument.jsx
  ```
- Then diff cetak KOSONG (templateConfig/TemplateEngine/blocks tanpa ubah); sk-doc-print pesanan = 2 (Nasi+Snack); grep larangan 0 hasil; panel print:hidden ada. Bukti: output 4 perintah asli

### T-07 — Sticky panel desktop + mobile + cetak (F-B, SETELAH A hijau)

- Given FASE A hijau + form Mamin panjang (scroll). When (a) scroll form di desktop lg+; (b) viewport <lg; (c) print-preview
- Then (a) panel tetap terlihat (sticky top offset, scroll internal sendiri, form scroll bebas); (b) panel menumpuk di bawah form, TIDAK sticky; (c) panel tak ikut cetak, hasil cetak = 2 surat A. Bukti: 3 screenshot (desktop scroll atas/bawah panel tetap + mobile tumpuk + print-preview tanpa panel) + `grep -n "sticky\|max-h-\[calc\|overflow-y-auto\|print:hidden" spj-frontend/src/components/templates/PanelPreviewDocument.jsx spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` min 2

### T-08 — Regresi dependency + storage + warna

- Given selesai. When
- ```bash
  git diff HEAD -- spj-frontend/package.json
  grep -rn "spj_" spj-frontend/src/utils/previewDocs.js spj-frontend/src/components/templates/DokumenFormPreview.jsx | head -5
  grep -rniE "emerald|amber|rose|violet|cyan" spj-frontend/src/utils/previewDocs.js spj-frontend/src/components/templates/DokumenFormPreview.jsx spj-frontend/src/components/templates/PanelPreviewDocument.jsx
  ```
- Then package.json TANPA diff (0 lib baru, versi tetap pin BLUEPRINT); prefix spj_ via storageHelper utuh; warna BLUE-ONLY #004ac6 + slate (badge sinyal = pengecualian layar-only teks+ikon). Bukti: output 3 perintah asli

## Uji Manual 2 Mode (DECISIONS.MD 2026-10-01)

- Mode otomatis (agent): jalankan T-01-T-08 di atas via dev server http://localhost:5173/ + screenshot.
- Mode manual (user checklist): agent terbitkan langkah klik + output harapan per fase (A: isi form sekali -> cek 2 surat -> matikan 1 seksi -> cetak; B: scroll panjang -> cek panel nempel -> kecilkan viewport -> cek menumpuk -> print-preview), user kembalikan bukti, agent hakimi PASS/FAIL. Tawarkan dulu sebelum eksekusi (wajib).
