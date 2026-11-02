# ACCEPTANCE — Sprint 007: Revisi Parser + Hadir + Menu Pesanan

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah +
> output harapan. Semua perintah dari root `D:\project\spj-app`.
> Branch bersama: `feat/sprint-005-autogen` (005+006 uncommitted ikut kebawa).

## Task Gate (WAJIB sebelum kriteria dinilai)

`npm run build` exit 0 per bagian (A/B/C/D) + grep per task BLUEPRINT sudah
hijau. Gate akhir verifikasi perilaku.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01…C-08 centang + T-01…T-08 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Parser jamuan: Rapat + ekor Jamuan Makanan/Snack Box → acara bersih tanpa sisa jamuan (T-02)
- [ ] C-02 Parser konsumsi: Konsumsi makan/snack Kegiatan X → acara X tanpa kata Konsumsi; tak cocok = fallback jujur (T-03)
- [ ] C-03 Daftar Hadir rows Guru→Tendik real dari storage, TTD kosong, editable (T-04)
- [ ] C-04 Hadir kosong jujur rows[] bila GTK belum upload, 0 karangan (T-05)
- [ ] C-05 Rincian menu Nasi Box 6 / Snack Box 4 per jenis, editable, fallback konsumsi (T-06)
- [ ] C-06 SELALU TIMPA hanya via BKU + snapshot + badge + Urungkan kembalikan, berlaku revisi (T-07)
- [ ] C-07 Regresi: 15 pola 0; blue-only tambah 0; diff warisan + print-area kosong; util ≤200 baris (T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build
- Given semua task selesai · When `cd spj-frontend && npm run build` (+ `node -v`)
- Then exit **0**, `✓ built in …` · Bukti: output terminal asli

### T-02 — Parser jamuan Rapat (F1)
- Given `bkuKategori.js` revisi selesai
- When
  ```bash
  node -e "import('./spj-frontend/src/utils/bkuKategori.js').then(m=>console.log(JSON.stringify(m.parseMamin('Beban Makanan dan Minuman Rapat Penyusunan Silabus Jamuan Makanan Box'))))"
  grep -n "Jamuan" spj-frontend/src/utils/bkuKategori.js
  ```
- Then `{jenis:'rapat', acara:'Penyusunan Silabus', cocok:true}` (tanpa kata Jamuan/Box) + grep ≥ 1 · Bukti: output node + grep

### T-03 — Parser konsumsi Kegiatan + fallback (F1)
- Given `bkuKategori.js` revisi selesai
- When
  ```bash
  node -e "import('./spj-frontend/src/utils/bkuKategori.js').then(m=>{console.log(JSON.stringify(m.parseMamin('Konsumsi Snack Kegiatan Perpisahan Kelas 6')));console.log(JSON.stringify(m.parseMamin('Belanja ATK semester')))})"
  ```
- Then Kegiatan → `{jenis:'kegiatan', acara:'Perpisahan Kelas 6'}` (tanpa kata Konsumsi); ATK → `{jenis:'', cocok:false}` (jujur) · Bukti: output node

### T-04 — Daftar Hadir GTK real (F2)
- Given seed BKU 1 Rapat + storage `data_guru` 2 + `data_tendik` 1 · When klik baris → Buka di Mamin Rapat → tab Daftar Hadir
- Then keterangan acara = nama rapat bersih + tabel NO/NAMA/JABATAN 3 rows urut Guru→Tendik + kolom TTD/TTD2 kosong + bisa tambah/edit/hapus baris · Bukti: screenshot + `grep -n "templateDaftarHadir" spj-frontend/src/utils/aturanMamin.js` ≥ 1

### T-05 — Hadir kosong jujur (F2)
- Given storage guru+tendik dikosongkan · When buka dari BKU Rapat → tab Daftar Hadir
- When
  ```bash
  node -e "import('./spj-frontend/src/utils/aturanMamin.js').then(m=>console.log(JSON.stringify(m.templateDaftarHadir({acara:'Rapat X',orang:[]}))))"
  ```
- Then `rows[]` kosong, 0 nama karangan, tanpa crash · Bukti: output node + screenshot tabel kosong

### T-06 — Menu pesanan per jenis (F3)
- Given seed BKU 1 Kegiatan · When klik baris → Buka di Mamin Kegiatan → form pesanan
- When
  ```bash
  grep -n "MENU_PESANAN\|rincianMenu" spj-frontend/src/utils/aturanMamin.js spj-frontend/src/components/templates/DokumenFormPreview.jsx
  node -e "import('./spj-frontend/src/utils/aturanMamin.js').then(m=>console.log(JSON.stringify(m.templatePesananMamin({acara:'Perpisahan',tanggal:'2026-06-10',uraian:'snack 50 box'}))))"
  ```
- Then jenis Snack → 4 rows (Risoles Ayam, Kue Bolu Mini, Lemper, Pudding Cup); jenis Nasi Box → 6 rows (Nasi Putih, Ayam Goreng Kremes, Urap, Tempe Bacem, Sambel dan Lalapan, Kerupuk); tiap baris editable; jenis tak dikenal → fallback `parseKonsumsi` · Bukti: screenshot + grep ≥ 2 (util + render) + output node

### T-07 — Snapshot/undo revisi (pengaman)
- Given tiap form revisi terisi manual · When buka dari BKU (timpa) → klik Urungkan
- Then timpa terjadi + `spj_otomatis_snapshot` tertulis (ts, sumber_no_bukti, field_tertimpa mencakup acara/rows hadir/rows menu) + badge "dari BKU" tampil + Urungkan kembalikan nilai lama · Bukti: 3 screenshot (sebelum/sesudah/undo) + `grep -rn "spj_otomatis_snapshot" spj-frontend/src` ≥ 2

### T-08 — Regresi (gate warisan)
- Given selesai · When
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|197405082014121002|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src/utils/bkuKategori.js spj-frontend/src/utils/aturanMamin.js spj-frontend/src/components/templates/DokumenFormPreview.jsx
  git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx
  wc -l spj-frontend/src/utils/aturanMamin.js spj-frontend/src/utils/bkuKategori.js
  ```
- Then grep = 0; diff warisan + print-area kosong; tiap util ≤ 200 baris (atau `aturanPesanan.js` sudah dipecah) · Bukti: output asli

## Edge Cases

### E-1 — Buka-ulang dari BKU menimpa tapi undo selamatkan (revisi)
Edit manual acara/rows hadir/rows menu → buka-ulang baris BKU lain → field tertimpa → Urungkan kembalikan edit manual (snapshot 1 slot terakhir). Tanpa crash, tanpa kunci form.

### E-2 — Offline penuh
`grep -rn "fetch\|axios\|VITE_.*API_KEY\|openai\|groq\|gemini" spj-frontend/src/utils/aturanMamin.js spj-frontend/src/utils/bkuKategori.js` = 0; matikan network → buka dari BKU revisi tetap terisi penuh (parser + GTK storage + menu konstan, tanpa jaringan).

> Bukan cakupan: tab baru, ubah cetak formal, AI/LLM, sinkron dua arah LPJ→BKU, upload GTK baru.
> Uji browser: tawarkan 2 mode (otomatis agent / manual user checklist) bila browser mati — preseden DECISIONS 2026-10-01.
