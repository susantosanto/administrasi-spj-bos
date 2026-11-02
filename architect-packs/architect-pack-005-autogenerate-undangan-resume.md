# Architect Pack 005 — Autogenerate Undangan + Resume (salinan audit)

> Salinan audit Bab 8.5 — gabungan 4 dokumen pack + Cross-Artifact Check.
> Source of truth = `planning/sprints/sprint-005/` (4 file). Dibuat 2026-10-03, docs-only.

---

# REQUIREMENTS — Sprint 005: Autogenerate Undangan + Resume

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: keputusan final user 2026-10-03 + transkrip baku 3 docx (Undangan Mamin, Surat Tugas + SPPD gugus, Notulen Rapat).

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin / Perjalanan Dinas → form tujuan
langsung terbuka sudah terisi lengkap (nama acara, isi undangan baku, resume +
poin pembahasan draf), semua tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Parser existing: `parseMamin()` di `spj-frontend/src/utils/bkuKategori.js`
  (aturan ketat revisi 2026-10-02: Rapat vs Kegiatan vs fallback jujur)
- Peta rekening: `spj-frontend/src/data/kodeReferensi.js` (mencakup
  `5.1.02.01.01.0052/0055` mamin, `5.1.02.04.01.0003` perjalanan dinas)
- Data Sekolah + pejabat: nama sekolah, kop, KS/bendahara/ketua gugus/notulen
- Template baku (3 docx, diringkas — jadi acuan aturan, bukan dilampirkan):
  - A) Undangan Mamin: kop 5 baris → T0 (tempat+tgl, Nomor, Sifat Biasa,
    Lampiran -, Perihal Undangan Sosialisasi + kegiatan, tujuan) → salam +
    "Bersamaan ini kami sampaikan bahwa pelaksanaan kegiatan X akan
    dilaksanakan pada :" → T1 jadwal (hari+tanggal+tempat+waktu) → penutup
    baku → TTD kanan Ketua Sekolah (nama+nip)
  - B) Rapat ops gugus (3 dokumen sekuen): DokA Undangan gugus
    (`400.3.7.6/018/G-KHD/2026`, "dapat menghadirkan Operator Sekolah untuk
    mengikuti Rapat Kerja Teknis Operator Tingkat Gugus pada:" + jadwal +
    "Mengingat pentingnya acara tersebut", tembusan 2, TTD Ketua Gugus
    Wahyudin); DokB Surat Perintah Tugas (`400.3.7.6/018-SD/2026`,
    "Yang bertandatangan di bawah ini" + pemberi KS Badruddin → MENUGASKAN →
    penerima Nama/NIP/Pangkat/Jabatan → maksud/hari/tanggal/tempat →
    "agar dilaksanakan dengan sebaik-baiknya dan penuh rasa tanggungjawab");
    DokC SPD (11 baris T3: PA/KPA, pelaksana, pangkat, jabatan, maksud,
    angkutan darat, asal/tujuan, lama 1 hari + tgl berangkat/kembali,
    pengikut, pembebanan BOS Reguler `5.1.02.04.01.0003`, keterangan; T4
    pengesahan berangkat/tiba + PERHATIAN standar)
  - C) Notulen Rapat: kop 3 baris → judul NOTULA RAPAT → identitas 9 baris
    (hari, tanggal, waktu, tempat, acara, pimpinan, dibuka_oleh, notulen,
    peserta_jumlah) → pembuka "Rapat membahas dan menyimpulkan sebagai
    berikut:" + daftar butir (14 butir oracle = contoh draf) → TTD 2 kolom
    (Pimpinan Rapat + Notulen, nama+nip)

## Keputusan Kunci (final user 2026-10-03 — bukan opsi)

1. Mesin = **template ATURAN offline** (BUKAN AI, tanpa fetch/network).
2. Pemicu = **OTOMATIS saat buka dari BKU** (klik deep-link langsung terisi).
3. Kebijakan timpa = **SELALU TIMPA field saat buka dari BKU** (ganti isi lama).
4. Cakupan = **Mamin + Perjalanan Dinas + Notulen** (tiga, bukan satu).
5. **PENGAMAN wajib** (disetujui user): tiap timpa simpan snapshot sebelum
   timpa + badge "dari BKU" + tombol **Urungkan** (perluas pola undo Sprint 004).

## Fungsi (F1…F4)

- **F1** — Nama Acara/Kegiatan terisi dari uraian + kegiatan BKU (lanjutkan
  parser Mamin `parseMamin`, tambah parser perjalanan dinas).
- **F2** — Isi undangan tergenerate mengikuti format baku per kategori
  (Mamin: salam + "Bersamaan…" + jadwal T1 + penutup; PerjDinas: SPT
  MENUGASKAN + SPD 11 baris + pengesahan).
- **F3** — Resume + poin pembahasan = draf dari nama acara, jenis
  Rapat/Kegiatan, tanggal, data sekolah (contoh: 14 butir oracle).
- **F4** — Semua hasil **bisa diedit/tambah/hapus** user (tidak dikunci).

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — autogenerate hanya isi form layar
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 4 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Parser + nama acara (Mamin lanjut + PerjDinas baru) | F1 |
| B | Isi undangan per kategori (Mamin baku + SPT/SPD sekuen) | F2 |
| C | Resume + poin pembahasan draf (Notulen 9 identitas + butir) | F3 |
| D | Pengaman snapshot + badge + Urungkan (tiap timpa) | F4 + pengaman |

## Di Luar Cakupan

- Ubah dokumen formal/cetak; AI/LLM apa pun; sinkron dua arah LPJ→BKU;
  deteksi kategori otomatis di luar alur BKU; kirim/notifikasi undangan

---

# BLUEPRINT — Sprint 005: Autogenerate Undangan + Resume

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2). 0 dependency baru. Tech stack terkunci ADR.
> Verifikasi via glob/read 2026-10-03 (tanpa ubah kode): `package.json` asli
> (7 dep + 7 devDep, lihat tabel), `bkuKategori.js` 320 baris mengekspor
> `parseMamin/prefillDariBKU/kategoriDariRekening/kategoriDenganKoreksi/
> gabungKonsumsi/kelompokATK/pejabatPada/grupDenganDominan` (+ default),
> `BKUSidebar.jsx` + `BKUPage.jsx` + `DokumenSPJPage.jsx` ada,
> editor AKTUAL = `DokumenFormPreview.jsx` (berisi `renderMaminPreview()`,
> tab Perjalanan Dinas SPT/SPPD/Undangan, `isMamin`, SummaryCard Resume/Notulen)
> — satu-satunya `*Editor.jsx` mandiri hanya `SkHonorerEditor.jsx` (acuan pola,
> bukan target).

## Arsitektur

```
BKUPage.jsx (klik baris grup dominan)
  │  kategoriDenganKoreksi(tx) → mamin / perjalanan_dinas
  ▼
BKUSidebar.jsx (tombol deep-link, bawa tx + kegiatanNama)
  │  prefillDariBKU() DIPERLUAS (SELALU TIMPA + snapshot dulu)
  ▼
aturanUndangan.js (BARU, ≤200 baris; pecah bila lewat)
  │  parsePerjalanan() · templateUndanganMamin() · templateUndanganPerjDinas()
  │  drafNotulen() · snapshotSebelumTimpa() / urungkanTimpa()
  ▼
DokumenFormPreview.jsx (form tujuan — editor AKTUAL, verified)
  │  Mamin: acara + isi undangan baku + resume/poin editable
  │  PerjDinas: SPT (MENUGASKAN) + SPD (11 baris + pembebanan BOS Reguler) editable
  │  Notulen: identitas 9 + pembuka + butir draf editable
  │  badge "dari BKU" + tombol Urungkan + toast timpa
DokumenSPJPage.jsx (terima prefill, kunci snapshot spj_otomatis_snapshot)

Storage baru (via storageHelper, prefix spj_):
  spj_otomatis_snapshot {ts, sumber_no_bukti, field_tertimpa[], nilai_lama{}}
  (satu slot terakhir per dokumen; tulis SEBELUM timpa, baca saat Urungkan)
```

## File Baru (batas: utility 200 baris)

| File | Isi |
|---|---|
| `spj-frontend/src/utils/aturanUndangan.js` | `parsePerjalanan()` + `templateUndanganMamin()` + `templateUndanganPerjDinas()` + `drafNotulen()` + `snapshotSebelumTimpa()/urungkanTimpa()` (≤200 baris; pecah jadi `aturanNotulen.js` bila lewat) |

## File Diubah (maks 5)

| File | Bagian | Sifat |
|---|---|---|
| `spj-frontend/src/utils/bkuKategori.js` | A | lanjutkan `parseMamin` + panggil `parsePerjalanan`; `prefillDariBKU` jadi SELALU TIMPA via BKU saja |
| `spj-frontend/src/components/bku/BKUSidebar.jsx` | A, B | teruskan tx lengkap (uraian/kegiatan/tanggal/noBukti) ke deep-link |
| `spj-frontend/src/pages/dashboard/BKUPage.jsx` | A | seed/degap 3 baris uji (Rapat + Kegiatan + PerjDinas) tetap jalan |
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | B, C, D | render hasil aturan di form + badge "dari BKU" + tombol Urungkan (editor AKTUAL — bila dry run menemukan pecahan editor lain, pilih 1 file ini) |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | D | snapshot `spj_otomatis_snapshot` sebelum timpa + toast + undo |

> Kandidat editor (bila ragu saat dry run, pilih 1 — preseden Sprint 004):
> (1) `DokumenFormPreview.jsx` — AKTUAL (terverifikasi ada `renderMaminPreview`,
> tab SPT/SPPD/Undangan, Notulen/Resume); (2) `DokumenSPJPage.jsx` — mount +
> penerima prefill. Builder pilih 1 saat dry run, catat di DRYRUN.
> DILARANG sentuh: `blocks/*`, `TemplateEngine.jsx`, `templateConfig.js`,
> `sekolahData.js`, `signatureRoles.js`, file Sprint 003/004 kecuali impor util murni.

## Dependensi (ter-pin eksak — dari `package.json` ASLI 2026-10-03)

react 18.3.1 · react-dom 18.3.1 · react-router-dom 6.30.4 · lucide-react 0.344.0 ·
xlsx 0.18.5 · pdfjs-dist 4.10.38 · @heyputer/puter.js 2.5.4 ·
@types/react 18.3.31 · @types/react-dom 18.3.7 · @vitejs/plugin-react 4.7.0 ·
autoprefixer 10.5.2 · postcss 8.5.16 · tailwindcss 3.4.19 · vite 5.4.21. **+0 baru.**

## Task Breakdown (2–5 menit/task; DoD = build exit 0 + grep, pola Sprint 004)

### BAGIAN A — Parser + acara (F1)

| ID | Task | File | DoD |
|---|---|---|---|
| A.1 | `parsePerjalanan()` (uraian+kegiatan → maksud/tujuan/tanggal; fallback jujur "") | `aturanUndangan.js` | build exit 0 · grep `parsePerjalanan` ≥ 1 |
| A.2 | Lanjutkan `parseMamin` untuk Kegiatan (tetap 2 jenis; tak cocok = fallback uraian penuh) | `bkuKategori.js` | build exit 0 · grep `parseMamin` ≥ 1 |
| A.3 | `prefillDariBKU` → SELALU TIMPA (hanya jalur BKU) + bawa tx lengkap | `bkuKategori.js` + `BKUSidebar.jsx` | build exit 0 · grep `prefillDariBKU` ≥ 2 file |

### BAGIAN B — Undangan per kategori (F2)

| ID | Task | File | DoD |
|---|---|---|---|
| B.1 | `templateUndanganMamin()` (salam + "Bersamaan…" + T1 jadwal + penutup baku) | `aturanUndangan.js` | build exit 0 · grep `templateUndanganMamin` ≥ 1 |
| B.2 | `templateUndanganPerjDinas()` (SPT MENUGASKAN + SPD 11 baris + pembebanan `5.1.02.04.01.0003`) | `aturanUndangan.js` | build exit 0 · grep `templateUndanganPerjDinas` ≥ 1 |
| B.3 | Render hasil ke form Mamin + PerjDinas (editable) | `DokumenFormPreview.jsx` | build exit 0 · grep `dari BKU` ≥ 1 |

### BAGIAN C — Resume/poin (F3)

| ID | Task | File | DoD |
|---|---|---|---|
| C.1 | `drafNotulen()` (identitas 9 + pembuka baku + butir draf dari acara/jenis/tanggal) | `aturanUndangan.js` | build exit 0 · grep `drafNotulen` ≥ 1 |
| C.2 | Render notulen editable (tambah/edit/hapus butir) | `DokumenFormPreview.jsx` | build exit 0 · grep `drafNotulen` ≥ 1 |

### BAGIAN D — Pengaman (F4 + pengaman)

| ID | Task | File | DoD |
|---|---|---|---|
| D.1 | `snapshotSebelumTimpa()/urungkanTimpa()` + tulis `spj_otomatis_snapshot` SEBELUM timpa | `aturanUndangan.js` + `DokumenSPJPage.jsx` | build exit 0 · grep `spj_otomatis_snapshot` ≥ 2 |
| D.2 | Badge "dari BKU" + tombol Urungkan + toast timpa; edit manual kekal kecuali buka-ulang BKU | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | build exit 0 · grep `Urungkan` ≥ 1 |

### GATE AKHIR

| ID | Task | DoD |
|---|---|---|
| E.1 | Regresi: 15 pola anti-hardcode = 0 pada file disentuh; blue-only tambah 0; diff warisan (blocks, templateConfig, Sprint 003/004, print-area) = kosong | semua grep 0 / diff kosong |
| E.2 | `npm run build` exit 0 + update STATE.MD + BUILD-REPORT | exit 0 + dokumen |

## DSA (hot path)

- Parser per baris: O(1) string ops (normalisasi + startsWith/includes) — 1000 baris < 500ms.
- Template render: O(1) per dokumen (11 baris SPD / 9 identitas / N butir, N ≤ 20).
- Snapshot: O(F) salin field (F = field tertimpa, kecil) — murah, 1 slot terakhir.

---

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
`grep -rn "fetch|axios|VITE_.*API_KEY|openai|groq|gemini" spj-frontend/src/utils/aturanUndangan.js` = 0; matikan network → buka dari BKU tetap terisi penuh.

> Bukan cakupan: ubah cetak formal, AI/LLM, sinkron dua arah LPJ→BKU.
> Uji browser: tawarkan 2 mode (otomatis agent / manual user checklist) bila browser mati — preseden DECISIONS 2026-10-01.

---

# HANDOFF-PROMPT — Sprint 005: Autogenerate Undangan + Resume (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-005/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
cd D:\project\spj-app\spj-frontend && npm ci
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…E.2), file disentuh (maks 5
   + 1 baru), pilihan editor (`DokumenFormPreview.jsx` vs `DokumenSPJPage.jsx`
   — hanya 1, default `DokumenFormPreview.jsx`), risiko (`aturanUndangan.js`
   >200 baris → pecah jadi `aturanNotulen.js`). TUNGGU persetujuan user sebelum coding.
2. Eksekusi per bagian A→B→C→D→E; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat (mamin "Beban makanan dan minuman" +
   kegiatan) + 1 Kegiatan (konsumsi snack) + 1 PerjDinas (`5.1.02.04.01.0003`
   rapat gugus); oracle notulen = 14 butir transkrip.
4. Batas file: `aturanUndangan.js` ≤ 200 baris (Constitution utility); pecah bila lewat.
5. Selesai → BUILD-REPORT.MD (komit per bagian + bukti) + update STATE.MD.

## JANGAN

- Mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); menebak kategori (tak dikenal = jujur kosong);
  refactor di luar cakupan.

---

# Cross-Artifact Check (wajib Bab 8.4 langkah 4)

| F (REQUIREMENTS) | Task (BLUEPRINT) | Kriteria (ACCEPTANCE) |
|---|---|---|
| F1 acara dari BKU | A.1 parsePerjalanan · A.2 parseMamin · A.3 prefill SELALU TIMPA | C-01 · T-02 · T-03 |
| F2 undangan baku/kategori | B.1 Mamin · B.2 SPT/SPD · B.3 render form | C-02 · C-03 · T-04 · T-05 |
| F3 resume/poin draf | C.1 drafNotulen · C.2 render editable | C-04 · T-06 |
| F4 edit/tambah/hapus + pengaman | D.1 snapshot/undo · D.2 badge + Urungkan + toast | C-05 · C-06 · T-07 · E-1 |
| Batasan offline/0-dep | E.1 regresi · E-2 build+dok | C-07 · C-08 · T-01 · T-08 · E-2 |

Cacat ditemukan & diperbaiki sebelum lapor:
1. C.2 BLUEPRINT DoD awal hanya "build exit 0" tanpa grep → ditambah
   `grep drafNotulen ≥ 1` (setiap task kini punya DoD grep).
2. Dependensi ditulis dari `package.json` ASLI 2026-10-03 (7 dep + 7 devDep,
   14 paket, eksak) — bukan karangan; +0 baru.
3. File Diubah = 5 (batas maks 5 terpenuhi); 0 file cetak
   (`blocks/*`, `TemplateEngine.jsx`, `templateConfig.js`, print-area) di daftar.
4. Editor AKTUAL terverifikasi via grep (`DokumenFormPreview.jsx` berisi
   `renderMaminPreview` + tab SPT/SPPD/Undangan + Notulen/Resume); kandidat 2
   + instruksi pilih-1-saat-dry-run dicantumkan (preseden Sprint 004).
5. Storage `spj_otomatis_snapshot` via `storageHelper`, prefix `spj_` —
   konsisten AGENTS.MD/CONSTITUTION.
6. SELALU TIMPA dibatasi jalur BKU + snapshot SEBELUM timpa di D.1 —
   pengaman keputusan user 2026-10-03 terikat ke task, bukan sekadar wacana.
