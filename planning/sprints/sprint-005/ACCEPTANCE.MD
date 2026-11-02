# ACCEPTANCE — Sprint 005: Autogenerate Undangan + Resume

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah +
> output harapan. Semua perintah dari root `D:\project\spj-app`.

## Task Gate (WAJIB sebelum kriteria dinilai)

`npm run build` exit 0 per bagian (A/B/C/D) + grep per task BLUEPRINT sudah
hijau. Gate akhir verifikasi perilaku.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01…C-08 centang + T-01…T-08 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Nama acara terisi dari BKU (Rapat vs Kegiatan benar) (T-02, T-03)
- [ ] C-02 Isi undangan Mamin baku (salam + "Bersamaan…" + jadwal T1 + penutup) (T-04)
- [ ] C-03 Undangan PerjDinas = SPT MENUGASKAN + SPD 11 baris + pembebanan BOS Reguler (T-05)
- [ ] C-04 Resume/notulen = identitas 9 + pembuka + butir draf, editable (T-06)
- [ ] C-05 SELALU TIMPA hanya via BKU + snapshot + badge + Urungkan kembalikan (T-07)
- [ ] C-06 Edit manual kekal kecuali buka-ulang dari BKU (T-07, E-1)
- [ ] C-07 Regresi: 15 pola 0; blue-only tambah 0; diff warisan + print-area kosong (T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build
- Given semua task selesai · When `cd spj-frontend && npm run build` (+ `node -v`)
- Then exit **0**, `✓ built in …` · Bukti: output terminal asli

### T-02 — Parser perjalanan (F1)
- Given `aturanUndangan.js` selesai
- When
  ```bash
  node -e "import('./spj-frontend/src/utils/aturanUndangan.js').then(m=>console.log(Object.keys(m)))"
  grep -n "parsePerjalanan" spj-frontend/src/utils/aturanUndangan.js spj-frontend/src/utils/bkuKategori.js
  ```
- Then 6+ kasus (gugus/rapat/koordinasi + fallback jujur) lulus; grep ≥ 1 · Bukti: output node + grep

### T-03 — Acara Rapat vs Kegiatan (F1)
- Given seed BKU 1 Rapat + 1 Kegiatan · When klik tiap baris → Buka di Mamin
- Then acara terisi benar per jenis parser; tanpa ketik · Bukti: 2 screenshot form terisi + `grep -n "parseMamin" spj-frontend/src/utils/bkuKategori.js` ≥ 1

### T-04 — Undangan Mamin (F2)
- Given buka dari BKU Mamin · When form undangan tampil
- Then ada "Bersamaan ini kami sampaikan bahwa pelaksanaan kegiatan" + jadwal T1 (hari+tanggal+tempat+waktu) + penutup "Atas perhatiannya dan kehadirannya" · Bukti: screenshot + `grep -n "templateUndanganMamin" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-05 — Undangan PerjDinas (F2)
- Given buka dari BKU perjalanan dinas · When form SPT/SPD tampil
- Then SPT ada "MENUGASKAN" + SPD ada "pembebanan BOS Reguler" + `5.1.02.04.01.0003` · Bukti: screenshot + `grep -n "templateUndanganPerjDinas" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-06 — Notulen (F3)
- Given buka dari BKU · When tab Notulen/Resume tampil
- Then identitas 9 terisi + pembuka "Rapat membahas dan menyimpulkan sebagai berikut:" + butir draf bisa tambah/edit/hapus · Bukti: screenshot + `grep -n "drafNotulen" spj-frontend/src/utils/aturanUndangan.js` ≥ 1

### T-07 — Snapshot/undo (pengaman)
- Given form terisi manual · When buka dari BKU (timpa) → klik Urungkan
- Then timpa terjadi + `spj_otomatis_snapshot` tertulis (ts, sumber_no_bukti, field_tertimpa) + badge "dari BKU" tampil + Urungkan kembalikan nilai lama · Bukti: 3 screenshot (sebelum/sesudah/undo) + `grep -rn "spj_otomatis_snapshot" spj-frontend/src` ≥ 2

### T-08 — Regresi (gate warisan)
- Given selesai · When
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|197405082014121002|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src/utils/aturanUndangan.js spj-frontend/src/utils/bkuKategori.js spj-frontend/src/components/templates/DokumenFormPreview.jsx
  git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx
  ```
- Then grep = 0; diff warisan + print-area kosong · Bukti: output asli

## Edge Cases

### E-1 — Buka-ulang dari BKU menimpa tapi undo selamatkan
Edit manual → buka-ulang baris BKU lain → field tertimpa → Urungkan kembalikan edit manual (snapshot 1 slot terakhir). Tanpa crash, tanpa kunci form.

### E-2 — Offline penuh
`grep -rn "fetch\|axios\|VITE_.*API_KEY\|openai\|groq\|gemini" spj-frontend/src/utils/aturanUndangan.js` = 0; matikan network → buka dari BKU tetap terisi penuh.

> Bukan cakupan: ubah cetak formal, AI/LLM, sinkron dua arah LPJ→BKU.
> Uji browser: tawarkan 2 mode (otomatis agent / manual user checklist) bila browser mati — preseden DECISIONS 2026-10-01.
