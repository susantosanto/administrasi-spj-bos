# ACCEPTANCE — Sprint 006: Autogen Semua Tab Mamin

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah +
> output harapan. Semua perintah dari root `D:\project\spj-app`.
> Branch bersama: `feat/sprint-005-autogen` (Pilihan B — 005 ikut kebawa).

## Task Gate (WAJIB sebelum kriteria dinilai)

`npm run build` exit 0 per bagian (A/B/C/D/E) + grep per task BLUEPRINT sudah
hijau. Gate akhir verifikasi perilaku.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01…C-08 centang + T-01…T-08 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Pesanan Mamin Kegiatan terisi dari BKU (perihal + isi baku + Hari/jenis/jumlah) (T-02, T-03)
- [ ] C-02 Daftar Hadir Rapat terisi dari BKU (keterangan acara + rows Guru/Tendik, TTD kosong) (T-04)
- [ ] C-03 Buku Tamu terisi dari BKU (Hari/Tanggal + Tujuan/Uraian + Diterima Kepala Sekolah; identitas kosong jujur) (T-05)
- [ ] C-04 Sisa Notulen = SEMUA 9 identitas terisi + Resume + Foto (bila ada), editable (T-06)
- [ ] C-05 SELALU TIMPA hanya via BKU + snapshot + badge + Urungkan kembalikan, berlaku semua tab Mamin (T-07)
- [ ] C-06 Edit manual kekal kecuali buka-ulang dari BKU (T-07, E-1)
- [ ] C-07 Regresi: 15 pola 0; blue-only tambah 0; diff warisan + print-area kosong; util ≤200 baris (T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build
- Given semua task selesai · When `cd spj-frontend && npm run build` (+ `node -v`)
- Then exit **0**, `✓ built in …` · Bukti: output terminal asli

### T-02 — Pesanan Mamin Kegiatan (F1)
- Given seed BKU 1 Kegiatan (konsumsi snack/Box) · When klik baris → Buka di Mamin Kegiatan
- When
  ```bash
  grep -n "templatePesananMamin" spj-frontend/src/utils/aturanUndangan.js spj-frontend/src/components/templates/DokumenFormPreview.jsx
  ```
- Then form pesanan ada "Bersamaan ini kami sampaikan bahwa sehubungan dengan akan dilaksanakannya kegiatan" + Hari/tanggal + jenis + jumlah; tanpa ketik · Bukti: screenshot + grep ≥ 2 (util + render)

### T-03 — Pesanan fallback jujur (F1)
- Given `aturanUndangan.js` selesai
- When
  ```bash
  node -e "import('./spj-frontend/src/utils/aturanUndangan.js').then(m=>console.log(JSON.stringify(m.templatePesananMamin({acara:'',tanggal:'xx'}))))"
  ```
- Then tak cocok = field "" (jujur kosong, bukan karangan) · Bukti: output node

### T-04 — Daftar Hadir Rapat (F2)
- Given seed BKU 1 Rapat · When klik baris → Buka di Mamin Rapat → tab Daftar Hadir
- Then keterangan acara = nama rapat dari BKU + tabel NO/NAMA/JABATAN terisi dari Guru/Tendik + kolom TTD kosong + bisa tambah/edit/hapus baris · Bukti: screenshot + `grep -n "templateDaftarHadir" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-05 — Buku Tamu (F3)
- Given seed BKU 1 baris mamin · When klik baris → Buka di Mamin Tamu
- Then Hari/Tanggal = tanggal transaksi (panjang) + Tujuan/Uraian = uraian BKU + Diterima = Kepala Sekolah + tabel identitas kosong (jujur, 0 karangan nama tamu) · Bukti: screenshot + `grep -n "templateBukuTamu" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-06 — Sisa Notulen + Resume/Foto (F4)
- Given buka dari BKU · When tab Notulen tampil
- Then SEMUA 9 terisi (hari dari tanggal + tanggal panjang + waktu/tempat + acara + pimpinan + dibuka_oleh + notulen + peserta_jumlah) + pembuka "Rapat membahas dan menyimpulkan sebagai berikut:" + butir draf (reuse 005) + Resume/Foto tampil bila ada field deskriptif; semua tambah/edit/hapus · Bukti: screenshot + `grep -n "lengkapiNotulen" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-07 — Snapshot/undo semua tab (pengaman)
- Given tiap tab terisi manual · When buka dari BKU (timpa) → klik Urungkan
- Then timpa terjadi + `spj_otomatis_snapshot` tertulis (ts, sumber_no_bukti, field_tertimpa mencakup field baru A–D) + badge "dari BKU" tampil di tiap tab + Urungkan kembalikan nilai lama · Bukti: 3 screenshot per tab sampel (sebelum/sesudah/undo) + `grep -rn "spj_otomatis_snapshot" spj-frontend/src` ≥ 2

### T-08 — Regresi (gate warisan)
- Given selesai · When
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|197405082014121002|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src/utils/aturanUndangan.js spj-frontend/src/utils/bkuKategori.js spj-frontend/src/components/templates/DokumenFormPreview.jsx
  git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx
  wc -l spj-frontend/src/utils/aturanUndangan.js
  ```
- Then grep = 0; diff warisan + print-area kosong; util ≤ 200 baris (atau `aturanMamin.js` sudah dipecah) · Bukti: output asli

## Edge Cases

### E-1 — Buka-ulang dari BKU menimpa tapi undo selamatkan (semua tab)
Edit manual di tiap tab → buka-ulang baris BKU lain → field tertimpa → Urungkan kembalikan edit manual (snapshot 1 slot terakhir). Tanpa crash, tanpa kunci form.

### E-2 — Offline penuh
`grep -rn "fetch\|axios\|VITE_.*API_KEY\|openai\|groq\|gemini" spj-frontend/src/utils/aturanUndangan.js` = 0; matikan network → buka dari BKU tiap tab tetap terisi penuh.

> Bukan cakupan: ubah cetak formal, AI/LLM, sinkron dua arah LPJ→BKU, upload foto baru.
> Uji browser: tawarkan 2 mode (otomatis agent / manual user checklist) bila browser mati — preseden DECISIONS 2026-10-01.
