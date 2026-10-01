# ACCEPTANCE — Sprint 004: BKU → LPJ Smart Bridge

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah +
> output harapan. Semua perintah dari root `D:\project\spj-app`.

## Task Gate (WAJIB sebelum kriteria dinilai)

`npm run build` exit 0 per bagian (A/B/C/D) + grep per task BLUEPRINT sudah
hijau. Gate akhir verifikasi perilaku.

## Definisi "Selesai"

Sprint SELESAI bila checklist C-01…C-08 centang + T-01…T-08 lulus + E-1/E-2 lulus.

## Checklist

- [ ] C-01 Kategori otomatis benar per peta §4 PRD; tak dikenal = "Belum dipetakan" (T-02)
- [ ] C-02 Sidebar detail ≤1 detik + tombol menu tepat (T-03)
- [ ] C-03 Deep-link + prefill ≥4 field kosong, tak timpa ketikan, ada undo (T-04)
- [ ] C-04 Snack+makan AND-cocok = 1 dokumen; nyaris-sama = saran (T-05)
- [ ] C-05 Pejabat per tanggal; dokumen lama kekal (T-06)
- [ ] C-06 ATK se-Nomor BKU = 1 kelompok + flag + opsional gabung (T-07)
- [ ] C-07 Regresi: 15 pola 0; blue-only 0; diff warisan kosong (T-08)
- [ ] C-08 Build sukses + STATE.MD/pack updated (T-01)

## Test Cases

### T-01 — Build
- Given semua task selesai · When `cd spj-frontend && npm run build` (+ `node -v`)
- Then exit **0**, `✓ built in …` · Bukti: output terminal asli

### T-02 — Kategori (US-31, US-37)
- Given `bkuKategori.js` selesai
- When
  ```bash
  grep -n "5.1.02.02.01\|5.1.02.01.01.0052\|5.1.02.04.01\|5.1.02.01.01.0024" spj-frontend/src/utils/bkuKategori.js
  grep -n "Belum dipetakan" spj-frontend/src/pages/dashboard/BKUPage.jsx spj-frontend/src/utils/bkuKategori.js
  ```
- Then 4 prefix ada; label jujur ≥ 1 · Bukti: output grep + screenshot list BKU (badge kategori + count belum-dipetakan)

### T-03 — Sidebar (US-32)
- Given BKU ter-upload · When klik 1 baris belanja
- Then sidebar ≤1 detik berisi uraian + rekening/kategori + nominal + tanggal + no bukti + kegiatan; Esc menutup
- Bukti: screenshot sidebar + `grep -n "dokumen-lpj\|dokumen-kelengkapan" spj-frontend/src/components/bku/BKUSidebar.jsx` ≥ 2 (tombol ada)

### T-04 — Prefill (US-33)
- Given sidebar terbuka · When klik tombol menu (mis. Mamin)
- Then mendarat di menu tepat; nominal + tanggal + no bukti + kegiatan terisi (≥4 field); field yang sudah terisi TIDAK tertimpa (+ toast); badge "dari BKU" + undo tampil
- Bukti: screenshot sebelum/sesudah + `grep -rn "prefillDariBKU" spj-frontend/src` ≥ 2 file

### T-05 — Merge konsumsi (US-34)
- Given 2 baris snack+makan (no bukti + kegiatan sama) · When buka Mamin via deep-link
- Then 1 dokumen berisi 2 rincian + total; pasangan beda 1 huruf → saran "gabung manual" (bukan auto)
- Bukti: screenshot dokumen gabungan + `grep -n "gabungKonsumsi" spj-frontend/src/utils/bkuKategori.js` ≥ 1

### T-06 — Pejabat per tanggal (US-35)
- Given 2 periode (KS lama s.d. 30-06, KS baru dari 01-07) · When buat dokumen bertanggal Mei + Agustus
- Then dokumen Mei = KS lama, Agustus = KS baru; tambah periode tidak mengubah dokumen lama
- Bukti: 2 screenshot + `grep -rn "pejabatPada\|spj_pejabat_riwayat" spj-frontend/src` ≥ 2 hit

### T-07 — Kelompok ATK (US-36)
- Given ≥2 baris ATK satu no_bukti · When buka BKU
- Then 1 kelompok + panah visual; tandai SIPLAH/Non tersimpan (`spj_atk_flag`); checkbox gabung beda no_bukti tersedia; teruskan ke Kelengkapan
- Bukti: screenshot kelompok + `grep -n "kelompokATK\|spj_atk_flag" spj-frontend/src/utils/bkuKategori.js spj-frontend/src/pages/dashboard/BKUPage.jsx` ≥ 2

### T-08 — Regresi (gate warisan)
- Given selesai · When
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|197405082014121002|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src/utils/bkuKategori.js spj-frontend/src/pages/dashboard/BKUPage.jsx spj-frontend/src/components/bku/BKUSidebar.jsx
  git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/guide/ spj-frontend/src/data/guideConfig.js spj-frontend/src/components/templates/SummaryCard.jsx
  ```
- Then grep = 0; diff warisan kosong · Bukti: output asli

## Edge Cases

### E-1 — BKU tanpa kode rekening
Semua baris kode kosong → seluruh list "Belum dipetakan", count akurat, tanpa crash; koreksi manual tersimpan permanen.

### E-2 — Prefill ke form yang sudah penuh
Semua field tujuan terisi → 0 field tertimpa, toast info 1×, badge "dari BKU" tetap muncul (bukti prefill jalan tapi hormat data user).

> Bukan cakupan: ubah cetak formal, auto-fill pegawai, sinkron dua arah, deteksi SIPLAH otomatis.
