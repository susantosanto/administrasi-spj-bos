# Architect Pack 007 � Revisi Parser + Hadir + Menu Pesanan (salinan audit)

> Salinan audit Bab 8.5 � gabungan 4 dokumen pack + Cross-Artifact Check.
> Source of truth = \planning/sprints/sprint-007/\ (4 file). Dibuat 2026-10-05, docs-only, 0 baris src diubah.

---
# REQUIREMENTS — Sprint 007: Revisi Parser + Hadir + Menu Pesanan

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: revisi final user 2026-10-05 + read-only `bkuKategori.js`
> `parseMamin`, `aturanMamin.js` `templateDaftarHadir`/`templatePesananMamin`,
> `templateConfig.js` section `pesanan_mamin`/`daftar_hadir`, `DataGuruPage.jsx`
> keys storage Guru/Tendik.
> Sprint 005 = fondasi (undangan + notulen). Sprint 006 = semua tab Mamin.
> Sprint 007 = REVISI tiga titik (parser jamuan, hadir GTK real, menu pesanan) —
> bukan tab baru.

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin → nama acara benar tanpa sisa kata
jamuan/konsumsi, Daftar Hadir terisi Guru+Tendik real (atau jujur kosong bila
belum upload), rincian Pesanan terisi menu baku Nasi Box / Snack Box — semua
tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Parser existing: `parseMamin()` di `spj-frontend/src/utils/bkuKategori.js`
  (dua cabang saat ini: `Beban Makanan dan Minuman…` → rapat; `konsumsi
  makan/snack` → kegiatan; selebihnya fallback jujur)
- Template existing: `templateDaftarHadir()` + `templatePesananMamin()` di
  `spj-frontend/src/utils/aturanMamin.js` (sibling `aturanUndangan.js` 005;
  `parseKonsumsi` jumlah+satuan+jenis; pesananRows 0–1 baris; hadir rows dari
  parameter `orang[]`, TTD kosong)
- Konfig cetak (read-only, acuan): `templateConfig.js` `pesanan_mamin`
  (table-dinamis NO/URAIAN/SATUAN/JUMLAH + Hari-Tanggal/Jenis/Jumlah) dan
  `daftar_hadir` (uraian acara + table-dinamis NO/NAMA/JABATAN/TTD/TTD2)
- Data GTK: `DataGuruPage.jsx` via `storageHelper.get('data_guru')` /
  `storageHelper.get('data_tendik')` (fisik `spj_data_guru`/`spj_data_tendik`
  via prefix `spj_`) — sumber rows Daftar Hadir
- Mesin Sprint 005/006: `prefillDariBKU` SELALU TIMPA + snapshot
  `spj_otomatis_snapshot` + badge "dari BKU" + Urungkan (reuse, bukan ulang)

## Keputusan Kunci (final user 2026-10-05 — bukan opsi)

1. Revisi parser (1): `Beban Makanan dan Minuman Rapat <nama>` + ekor
   `Jamuan Makanan Box` / `Snack Box` (dan varian `Jamuan Snack Box`) → jenis
   **Rapat**, `acara` = nama rapat TANPA prefiks TANPA kata jamuan/snack-box.
   Contoh: `Beban Makanan dan Minuman Rapat Penyusunan Silabus Jamuan Makanan
   Box` → `Rapat` / `Penyusunan Silabus`.
2. Revisi parser (2): `Konsumsi (makan/snack) Kegiatan X` → jenis **Kegiatan**,
   `acara` = X TANPA kata Konsumsi. Tak cocok pola mana pun = **fallback jujur**
   (`jenis ''`, `acara` = uraian satu-baris penuh, `cocok false`) — bukan karangan.
3. Daftar hadir rows dari storage: baca `data_guru` + `data_tendik` via
   storageHelper, urut **Guru lalu Tendik**, bentuk baris SAMA dengan editor
   (`id` = nip/nuptk/nama, `nama`, `jabatan`, `ttd ''`, `ttd2 ''`), kolom TTD
   kosong. Belum upload (dua-duanya kosong) → `rows[]` jujur, 0 karangan nama.
4. Rincian pesanan auto menu (editable, opsional): `Nasi Box` 6 item
   (Nasi Putih, Ayam Goreng Kremes, Urap, Tempe Bacem, Sambel dan Lalapan,
   Kerupuk) dan `Snack Box` 4 item (Risoles Ayam, Kue Bolu Mini, Lemper,
   Pudding Cup); pilih berdasar `jenisPesanan`, fallback ke `parseKonsumsi`
   bila jenis tak dikenal.
5. **PENGAMAN wajib samakan 005/006**: tiap timpa simpan snapshot SEBELUM
   timpa + badge "dari BKU" + tombol **Urungkan**.

## Fungsi (F1…F3)

- **F1** — Parser jamuan/konsumsi direvisi (Rapat strip jamuan + Kegiatan
  strip konsumsi + fallback jujur); `acara`/`jenis` terisi benar dari BKU.
- **F2** — Daftar Hadir terisi rows Guru→Tendik real dari storage (TTD kosong);
  kosong jujur `rows[]` bila belum upload; semua baris bisa tambah/edit/hapus.
- **F3** — Rincian pesanan terisi menu baku per jenis (Nasi 6 / Snack 4);
  tiap baris menu bisa diedit/tambah/hapus user (tidak dikunci); fallback
  `parseKonsumsi` bila jenis tak dikenal.

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah); kunci snapshot
  tetap `spj_otomatis_snapshot` (reuse 005/006, 1 slot terakhir per dokumen)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — revisi hanya isi form layar + util aturan
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- Ketergantungan: branch BERSAMA `feat/sprint-005-autogen` (005+006 uncommitted
  ikut kebawa — JANGAN buat branch baru, JANGAN commit, JANGAN push)
- Util ≤ 200 baris (Constitution); HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 4 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Parser jamuan/konsumsi (Rapat strip jamuan + Kegiatan strip konsumsi + fallback) | F1 |
| B | Hadir GTK real (rows Guru→Tendik storage, TTD kosong, kosong jujur) | F2 |
| C | Menu pesanan (Nasi 6 / Snack 4 per jenis, editable, fallback konsumsi) | F3 |
| D | Pengaman reuse 005/006 (snapshot + badge + Urungkan tiap timpa) | F1–F3 + pengaman |

## Di Luar Cakupan

- Tab baru / template baru; ubah dokumen formal/cetak; AI/LLM apa pun;
  sinkron dua arah LPJ→BKU; deteksi kategori otomatis di luar alur BKU;
  kirim/notifikasi pesanan; upload/import GTK baru (hanya baca yang sudah ada)

---

# BLUEPRINT — Sprint 007: Revisi Parser + Hadir + Menu Pesanan

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2). 0 dependency baru. Tech stack terkunci ADR.
> Verifikasi via read-only 2026-10-05 (tanpa ubah src): `bkuKategori.js`
> `parseMamin` 2 cabang (`beban makanan dan minuman` → rapat via
> `ambilBarisKedua/keg/kupasPrefiksSatuBaris`; `konsumsi makan/snack` →
> kegiatan; else fallback) + `prefillDariBKU` SELALU TIMPA + routing
> `subId kegiatan`; `aturanMamin.js` 132 baris (`parseKonsumsi`
> jumlah+satuan+jenis, `templatePesananMamin` pesananRows 0–1,
> `templateDaftarHadir({acara, orang})` rows id nip/nuptk/nama + ttd kosong,
> `templateBukuTamu`, `lengkapiNotulen`); `templateConfig.js` `pesanan_mamin`
> (table-dinamis NO/URAIAN/SATUAN/JUMLAH + hari/jenis/jumlah) + `daftar_hadir`
> (table-dinamis NO/NAMA/JABATAN/TTD/TTD2); `DataGuruPage.jsx`
> `storageHelper.get('data_guru'/'data_tendik')` (fisik `spj_data_guru`/
> `spj_data_tendik`); branch bersama `feat/sprint-005-autogen`.

## Arsitektur

```
BKUPage.jsx (klik baris grup dominan — reuse 005/006, tanpa ubah alur)
  │  kategoriDenganKoreksi(tx) → mamin (rapat/kegiatan)
  ▼
BKUSidebar.jsx (tombol deep-link, bawa tx + kegiatanNama — reuse 005/006)
  │  prefillDariBKU() REVISI-KECIL (SELALU TIMPA + snapshot dulu — reuse;
  │  tambah baca GTK storage untuk hadir + teruskan jenisPesanan untuk menu)
  ▼
bkuKategori.js :: parseMamin() DIREVISI (≤ fungsi existing, tanpa file baru)
  │  (1) ekor jamuan: strip /^beban makanan dan minuman/i + /^rapat/i +
  │      ekor /jamuan (makanan box|snack box)|snack box/i → jenis rapat
  │  (2) konsumsi: /konsumsi\s+(makan|snack)\b/ + strip "kegiatan" →
  │      jenis kegiatan, acara tanpa kata Konsumsi
  │  else fallback jujur {jenis:'', acara:uraian-1-baris, cocok:false}
  ▼
aturanMamin.js (DIPERLUAS, ≤200 baris; pecah bila lewat)
  │  REVISI B: templateDaftarHadir({acara, orang}) — pemanggil isi orang =
  │        [...guru, ...tendik] dari storage (Guru lalu Tendik); TTD kosong;
  │        kosong → rows[] jujur
  │  BARU C: MENU_PESANAN konstan + rincianMenu(jenisPesanan) →
  │        Nasi Box 6 / Snack Box 4 rows editable; templatePesananMamin()
  │        pakai menu bila jenis dikenal, else fallback parseKonsumsi
  │  REUSE (tanpa duplikasi): keISO/hariDariISO/tanggalPanjang,
  │        parseKonsumsi, templateBukuTamu, lengkapiNotulen,
  │        snapshotSebelumTimpa/bacaSnapshot/urungkanTimpa (005)
  ▼
DokumenFormPreview.jsx (form tujuan — editor AKTUAL 005/006, 1 file)
  │  acara tampil tanpa sisa jamuan/konsumsi (editable)
  │  Hadir: keterangan acara + tabel GTK real editable (tambah/edit/hapus)
  │  Pesanan: rincian menu editable (tambah/edit/hapus per baris)
  │  badge "dari BKU" + tombol Urungkan + toast timpa (reuse 005/006)
DokumenSPJPage.jsx (terima prefill, kunci snapshot spj_otomatis_snapshot — reuse)

Storage (reuse 005/006, via storageHelper, prefix spj_ — TANPA kunci baru):
  baca: data_guru + data_tendik (fisik spj_data_guru/spj_data_tendik)
  tulis: spj_otomatis_snapshot {ts, sumber_no_bukti, field_tertimpa[], nilai_lama{}}
  (satu slot terakhir per dokumen; tulis SEBELUM timpa, baca saat Urungkan)
```

## File Baru (batas: 0 — revisi util existing)

| File | Isi |
|---|---|
| (tidak ada) | Semua revisi masuk `bkuKategori.js` (parser) + `aturanMamin.js` (hadir+menu); bila `aturanMamin.js` >200 baris → pecah jadi `aturanPesanan.js` (sibling util, pola 006 `aturanMamin.js`) |

## File Diubah (maks 4 — tanpa sentuh cetak)

| File | Bagian | Sifat |
|---|---|---|
| `spj-frontend/src/utils/bkuKategori.js` | A | revisi `parseMamin`: strip ekor jamuan (Rapat) + strip konsumsi/kegiatan (Kegiatan) + fallback jujur; `prefillDariBKU` baca GTK storage + teruskan jenisPesanan (tetap SELALU TIMPA via BKU saja) |
| `spj-frontend/src/utils/aturanMamin.js` | B, C | `templateDaftarHadir` terima `orang=[...guru,...tendik]` (TTD kosong, kosong→rows[]); tambah `MENU_PESANAN` + `rincianMenu()`; `templatePesananMamin` pakai menu per jenis else fallback `parseKonsumsi`; TETAP ≤200 baris atau pecah `aturanPesanan.js` |
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | A, B, C, D | render acara bersih + tabel hadir GTK + rincian menu — semua editable + badge "dari BKU" + Urungkan (tetap 1 editor) |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | D | snapshot `spj_otomatis_snapshot` SEBELUM timpa + toast + undo (reuse 005/006, tambah field revisi ke `field_tertimpa`) |

> DILARANG sentuh: `blocks/*`, `TemplateEngine.jsx`, `templateConfig.js`,
> `sekolahData.js`, `signatureRoles.js`, print-area, file Sprint 003/004
> kecuali impor util murni. `templateBukuTamu`/`lengkapiNotulen` tidak ditulis
> ulang (reuse 006).

## Dependensi (ter-pin eksak — dari `package.json` ASLI 2026-10-03, samakan 005/006)

react 18.3.1 · react-dom 18.3.1 · react-router-dom 6.30.4 · lucide-react 0.344.0 ·
xlsx 0.18.5 · pdfjs-dist 4.10.38 · @heyputer/puter.js 2.5.4 ·
@types/react 18.3.31 · @types/react-dom 18.3.7 · @vitejs/plugin-react 4.7.0 ·
autoprefixer 10.5.2 · postcss 8.5.16 · tailwindcss 3.4.19 · vite 5.4.21. **+0 baru.**

## Task Breakdown (2–5 menit/task; DoD = build exit 0 + grep, pola Sprint 005/006)

### BAGIAN A — Parser jamuan/konsumsi (F1)

| ID | Task | File | DoD |
|---|---|---|---|
| A.1 | Strip ekor jamuan: `Beban Makanan dan Minuman Rapat X Jamuan Makanan Box`/`Snack Box`/`Jamuan Snack Box` → `{jenis:'rapat', acara:X, cocok:true}` (case-insensitive, rapikan spasi) | `bkuKategori.js` | build exit 0 · grep `Jamuan` ≥ 1 di `bkuKategori.js` |
| A.2 | Strip konsumsi: `Konsumsi (makan/snack) Kegiatan X` → `{jenis:'kegiatan', acara:X}` tanpa kata Konsumsi/Kegiatan-prefiks; else fallback jujur `{jenis:'', cocok:false}` | `bkuKategori.js` | build exit 0 · grep `parseMamin` ≥ 1 |
| A.3 | Oracle 6+: Rapat+Jamuan Makanan Box, Rapat+Snack Box, Konsumsi Makan Kegiatan X, Konsumsi Snack Kegiatan Y, tak-cocok fallback, satu-baris lama | `bkuKategori.js` | build exit 0 · node 6/6 lulus |

### BAGIAN B — Hadir GTK real (F2)

| ID | Task | File | DoD |
|---|---|---|---|
| B.1 | Baca storage `data_guru`+`data_tendik` via storageHelper, gabung Guru→Tendik, map ke rows `{id:nip/nuptk/nama, nama, jabatan, ttd:'', ttd2:''}`; dua-duanya kosong → `rows[]` (0 karangan) | `bkuKategori.js` + `aturanMamin.js` | build exit 0 · grep `data_tendik` ≥ 1 |
| B.2 | Render tabel hadir editable (acara bersih + rows tambah/edit/hapus, TTD kosong) | `DokumenFormPreview.jsx` | build exit 0 · grep `templateDaftarHadir` ≥ 1 |

### BAGIAN C — Menu pesanan (F3)

| ID | Task | File | DoD |
|---|---|---|---|
| C.1 | `MENU_PESANAN` + `rincianMenu(jenis)`: Nasi Box 6 item (Nasi Putih, Ayam Goreng Kremes, Urap, Tempe Bacem, Sambel dan Lalapan, Kerupuk) + Snack Box 4 item (Risoles Ayam, Kue Bolu Mini, Lemper, Pudding Cup); tak dikenal → fallback `parseKonsumsi` | `aturanMamin.js` | build exit 0 · grep `MENU_PESANAN\|rincianMenu` ≥ 1 |
| C.2 | `templatePesananMamin` pakai menu per `jenisPesanan` (rows editable 6/4); Hari/tanggal + jenis + jumlah tetap dari BKU | `aturanMamin.js` | build exit 0 · grep `templatePesananMamin` ≥ 1 |
| C.3 | Render rincian menu editable (tiap baris tambah/edit/hapus) | `DokumenFormPreview.jsx` | build exit 0 · grep `rincianMenu\|MENU_PESANAN` ≥ 1 |

### BAGIAN D — Pengaman reuse 005/006 (F1–F3 + pengaman)

| ID | Task | File | DoD |
|---|---|---|---|
| D.1 | Snapshot SEBELUM timpa mencakup field revisi (acara bersih + rows hadir + rows menu ke `field_tertimpa`; reuse `snapshotSebelumTimpa/urungkanTimpa` + kunci `spj_otomatis_snapshot`) | `aturanMamin.js` + `DokumenSPJPage.jsx` | build exit 0 · grep `spj_otomatis_snapshot` ≥ 2 |
| D.2 | Badge "dari BKU" + tombol Urungkan + toast timpa berlaku revisi; edit manual kekal kecuali buka-ulang BKU | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | build exit 0 · grep `Urungkan` ≥ 1 |

### GATE AKHIR

| ID | Task | DoD |
|---|---|---|
| E.1 | Regresi: 15 pola anti-hardcode = 0 pada file disentuh; blue-only tambah 0; diff warisan (blocks, templateConfig, TemplateEngine, Sprint 003/004/005/006-cetak, print-area) = kosong; util ≤200 baris atau sudah dipecah | semua grep 0 / diff kosong / wc -l ≤ 200 |
| E.2 | `npm run build` exit 0 + update STATE.MD + BUILD-REPORT | exit 0 + dokumen |

## DSA (hot path)

- Parser revisi per baris: O(1) string ops (normalisasi + regex ekor jamuan/konsumsi, 2–3 pola) — 1000 baris < 500ms.
- Hadir: O(G+T) map GTK (G guru + T tendik, kecil) — 1 pass, tanpa fetch.
- Menu: O(1) lookup 6/4 rows per dokumen — konstan, tanpa network.
- Snapshot: O(F) salin field (F = field tertimpa revisi, kecil) — murah, 1 slot terakhir.

---

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

---

# HANDOFF-PROMPT — Sprint 007: Revisi Parser + Hadir + Menu Pesanan (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-007/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: `intent://local/halo-task-5/note/c2acf7c0-3bc9-45a2-b2fc-f469c267a35f`
> (branch bersama, status 005+006, batas alat).

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-005-autogen (Pilihan B user — JANGAN buat branch baru)
git status --porcelain
# harapan: kode 005+006 sudah ada (bkuKategori.js + aturanUndangan.js + aturanMamin.js + 2 page, uncommitted ikut kebawa)
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…E.2), file disentuh (maks 4
   + 0 baru, revisi util existing), risiko (`aturanMamin.js` 132 + menu/rows
   >200 baris → pecah jadi `aturanPesanan.js` sibling). TUNGGU persetujuan user
   sebelum coding.
2. Eksekusi per bagian A→B→C→D→E; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat jamuan (`Beban Makanan dan Minuman
   Rapat Penyusunan Silabus Jamuan Makanan Box`) + 1 Kegiatan konsumsi
   (`Konsumsi Snack Kegiatan Perpisahan Kelas 6`) + 1 tak-cocok (ATK);
   storage `data_guru` 2 + `data_tendik` 1 (lalu kosongkan untuk T-05);
   oracle menu = Nasi Box 6 item + Snack Box 4 item (lihat BLUEPRINT C.1).
4. Batas file: tiap util ≤ 200 baris (Constitution); pecah jadi
   `aturanPesanan.js` bila lewat — putuskan saat dry run.
5. Selesai → BUILD-REPORT.MD (bukti per bagian) + update STATE.MD.
   JANGAN commit, JANGAN push (kuasa user — Pilihan B).

## JANGAN

- Membuat branch baru; commit; push (branch bersama 005+006 ikut kebawa);
  mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); mengarang nama hadir/menu (tak ada di
  storage/BKU = jujur kosong/fallback konsumsi); menulis ulang
  `templateBukuTamu`/`lengkapiNotulen` 006 (reuse); refactor di luar cakupan.

---

# Cross-Artifact Check (wajib Bab 8.4 langkah 4)

| F (REQUIREMENTS) | Task (BLUEPRINT) | Kriteria (ACCEPTANCE) | Bootstrap (HANDOFF) |
|---|---|---|---|
| F1 parser jamuan/konsumsi+fallback | A.1 ekor jamuan � A.2 konsumsi � A.3 oracle 6+ | C-01 � C-02 � T-02 � T-03 | seed Rapat jamuan + Kegiatan konsumsi + ATK tak-cocok; grep Jamuan/parseMamin |
| F2 hadir GTK real + kosong jujur | B.1 storage guru/tendik ? rows � B.2 render tabel | C-03 � C-04 � T-04 � T-05 | storage 2+1 lalu kosongkan; grep data_tendik/templateDaftarHadir |
| F3 menu Nasi 6/Snack 4 + fallback | C.1 MENU_PESANAN+rincianMenu � C.2 templatePesananMamin � C.3 render | C-05 � T-06 | oracle menu 6/4; grep MENU_PESANAN/rincianMenu; node fallback |
| Pengaman reuse 005/006 | D.1 snapshot field revisi � D.2 badge+Urungkan+toast | C-06 � T-07 � E-1 | JANGAN branch/commit/push baru; snapshot SEBELUM timpa |
| Batasan offline/0-dep/cetak | E.1 regresi � E.2 build+dok | C-07 � C-08 � T-01 � T-08 � E-2 | build exit 0 per bagian; util <=200 atau pecah aturanPesanan.js |

Cacat ditemukan & diperbaiki sebelum lapor:
1. Parser lama tak strip ekor jamuan � acara membawa sisa 'Jamuan Makanan Box/Snack Box'; diikat ke A.1+T-02 dengan oracle contoh user (Penyusunan Silabus).
2. Parser konsumsi lama menyimpan kata 'Konsumsi' di acara � A.2 strip konsumsi/kegiatan-prefiks; T-03 verifikasi 'Perpisahan Kelas 6' bersih + fallback ATK jujur.
3. templateDaftarHadir 006 terima 'orang[]' tanpa sumber � B.1 tetapkan sumber = storageHelper data_guru+data_tendik (fisik spj_data_guru/spj_data_tendik), urut Guru lalu Tendik, bentuk baris = editor (id nip/nuptk/nama); kosong ? rows[] 0 karangan (T-05).
4. pesananRows 006 hanya 0-1 baris generik � C.1 tetapkan menu baku Nasi 6 + Snack 4 per jenisPesanan, editable per baris, fallback parseKonsumsi bila jenis tak dikenal (T-06); tanpa ubah templateConfig/cetak.
5. Kunci storage TIDAK baru � baca data_guru/data_tendik + tulis spj_otomatis_snapshot reuse 005/006 (prefix spj_ via storageHelper); D.1 hanya tambah field revisi ke field_tertimpa.
6. Risiko util >200 baris diikat ke task: aturanMamin.js 132 + menu/rows ? E.1/T-08 verifikasi wc -l + pecah aturanPesanan.js bila lewat (pola 006 aturanMamin.js); bkuKategori.js revisi dalam fungsi existing.
7. Branch bersama feat/sprint-005-autogen + larangan buat-branch/commit/push konsisten di REQUIREMENTS (Ketergantungan), ACCEPTANCE (header), HANDOFF (Bootstrap + JANGAN); STATE.MD tidak disentuh fase pack (kuasa builder pasca-build).
