# Architect Pack 006 — Autogen Semua Tab Mamin (salinan audit)

> Salinan audit Bab 8.5 — gabungan 4 dokumen pack + Cross-Artifact Check.
> Source of truth = \planning/sprints/sprint-006/\ (4 file). Dibuat 2026-10-03, docs-only, 0 baris src diubah.

---

# REQUIREMENTS — Sprint 006: Autogen Semua Tab Mamin

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: keputusan user 2026-10-03 + Idea Brief Autogen Semua Tab Mamin
> + ringkasan read-only 5 docx (Undangan Mamin, Pesanan Mamin, Daftar Hadir,
> Buku Tamu, Notulen) + `templateConfig.js` section
> notulen/undangan_mamin/pesanan_mamin/buku_tamu/daftar_hadir.
> Sprint 005 = fondasi (undangan_mamin rapat + notulen sebagian:
> identitas 9 + pembuka baku + butir draf). Sprint 006 = sisa semua tab Mamin.

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin → tab tujuan (Rapat, Kegiatan,
Tamu, Notulen) langsung terbuka sudah terisi baku mengikuti docx masing-masing
(Undangan, Pesanan, Daftar Hadir, Buku Tamu, Notulen + Resume, Foto bila ada
field deskriptif), semua tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Mesin Sprint 005: `spj-frontend/src/utils/aturanUndangan.js` (11 exports,
  143 baris — DIPERLUAS, bukan ditulis ulang) + `prefillDariBKU` SELALU TIMPA
  + snapshot `spj_otomatis_snapshot` + badge "dari BKU" + Urungkan
- Peta template (read-only, jadi acuan aturan — diringkas dari docx asli):
  - A) Surat Pesanan Mamin (Kegiatan): kop 5 baris → T0 (tempat+tgl, Nomor,
    Sifat Biasa, Lampiran -, Perihal Surat Pesanan, Kepada Toko/RM + Di tempat)
    → salam + "Bersamaan ini kami sampaikan bahwa sehubungan dengan akan
    dilaksanakannya kegiatan X" → rincian menu/paket (Nasi Box + isi) →
    "Pesanan untuk tanggal … dengan rincian:" (Hari + jenis + jumlah Box) →
    penutup "Demikian surat pesanan ini kami sampaikan, Atas perhatiannya
    dan kerjasamanya" → TTD kanan Kepala Sekolah (nama+nip)
  - B) Daftar Hadir (Rapat): judul DAFTAR HADIR + keterangan acara
    ("Rapat …") → tabel NO/NAMA/JABATAN/TANDA TANGAN (2 kolom paraf,
    dari data Guru/Tendik) → pengesahan "Mengetahui, Kepala Sekolah"
  - C) Buku Tamu Kedinasan (Tamu): judul BUKU TAMU + No.Urut/Hari-Tanggal/
    Ingin bertemu → IDENTITAS TAMU (tabel No/NAMA/JABATAN/ALAMAT/TTD) →
    Diterima oleh (default Kepala Sekolah) + Tiba/Kembali Pukul → TUJUAN →
    URAIAN KEGIATAN/TEMUAN/SARAN/PESAN → TTD Kepala Sekolah
  - D) Notulen sisa (melengkapi 005): 005 sudah identitas 9 (hari, tanggal,
    waktu, tempat, acara, pimpinan, dibuka_oleh, notulen, peserta_jumlah) +
    pembuka baku + butir draf. Sisa 006 = pastikan SEMUA 9 field terisi dari
    BKU + pejabat (hari dari tanggal, tanggal panjang, tempat default sekolah,
    acara dari uraian, pimpinan/pembuka/notulen dari pejabatPada, peserta
    dari jumlah/daftar), plus Resume = ringkas butir bila ada field deskriptif,
    Foto = tampil bila ada (tanpa fetch, tanpa upload baru)
  - E) Undangan Mamin (Rapat) = SUDAH Sprint 005 — tidak diulang, hanya dipakai
    ulang sebagai pola (salam + "Bersamaan…" + T1 jadwal + penutup baku)

## Keputusan Kunci (final user 2026-10-03 — bukan opsi)

1. Mesin = **perluas `aturanUndangan.js` Sprint 005** (template ATURAN offline,
   BUKAN AI, tanpa fetch/network). Fungsi baru:
   `templatePesananMamin()` + `templateDaftarHadir()` + `templateBukuTamu()`
   + sisa-notulen (`lengkapiNotulen()`).
2. Pemicu = **OTOMATIS saat buka dari BKU** (klik deep-link langsung terisi —
   samakan 005, berlaku untuk SEMUA tab Mamin).
3. Kebijakan timpa = **SELALU TIMPA field saat buka dari BKU** (ganti isi lama —
   samakan 005, tiap timpa wajib pengaman).
4. Cakupan = **semua tab kategori dan jenis di menu Mamin**
   (Rapat, Kegiatan, Tamu, Notulen — Undangan, Pesanan, Daftar Hadir,
   Buku Tamu, Notulen + Resume, Foto bila ada field deskriptif).
5. **PENGAMAN wajib samakan Sprint 005** (disetujui user): tiap timpa simpan
   snapshot SEBELUM timpa (`spj_otomatis_snapshot`: ts, sumber_no_bukti,
   field_tertimpa, nilai_lama) + badge "dari BKU" + tombol **Urungkan**
   (perluas pola undo Sprint 004/005).

## Fungsi (F1…F5)

- **F1** — Pesanan Mamin (tab Kegiatan) terisi dari BKU: perihal + isi
  "Bersamaan … sehubungan dengan akan dilaksanakannya kegiatan X" +
  Hari/tanggal + jenis + jumlah (dari uraian/konsumsi BKU, tak cocok = jujur "").
- **F2** — Daftar Hadir (tab Rapat) terisi dari BKU: keterangan acara
  (nama rapat) + tabel NO/NAMA/JABATAN dari data Guru/Tendik (TTD kosong).
- **F3** — Buku Tamu (tab Tamu) terisi dari BKU: Hari/Tanggal dari tanggal
  transaksi + Tujuan/Uraian dari uraian kegiatan + Diterima default
  Kepala Sekolah; identitas tamu kosong editable (tak ada data tamu di BKU —
  jujur kosong, bukan karangan).
- **F4** — Sisa Notulen (tab Notulen): SEMUA 9 identitas terisi
  (hari/tanggal/waktu/tempat/acara/pimpinan/pembuka/notulen/peserta) +
  Resume ringkas butir + Foto tampil bila ada field deskriptif; semua editable.
- **F5** — Semua hasil **bisa diedit/tambah/hapus** user (tidak dikunci);
  edit manual kekal kecuali buka-ulang dari BKU (maka SELALU TIMPA + snapshot).

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah); kunci snapshot
  tetap `spj_otomatis_snapshot` (reuse 005, 1 slot terakhir per dokumen)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — autogenerate hanya isi form layar
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- Ketergantungan: Sprint 005 di branch BERSAMA `feat/sprint-005-autogen`
  (Pilihan B user: 005 ikut kebawa — JANGAN buat branch baru, JANGAN commit,
  JANGAN push); Sprint 006 dikerjakan di branch yang sama, setelah kode 005 ada
- HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 5 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Pesanan Mamin Kegiatan (template + render form) | F1 |
| B | Daftar Hadir Rapat (template + render tabel Guru/Tendik) | F2 |
| C | Buku Tamu (template + render form) | F3 |
| D | Sisa Notulen + Resume/Foto (lengkapi 9 identitas + render editable) | F4 |
| E | Pengaman reuse 005 (snapshot + badge + Urungkan tiap timpa) | F5 + pengaman |

## Di Luar Cakupan

- Ubah dokumen formal/cetak; AI/LLM apa pun; sinkron dua arah LPJ→BKU;
  deteksi kategori otomatis di luar alur BKU; kirim/notifikasi pesanan;
  upload/foto baru (hanya tampil bila field deskriptif sudah ada);
  Undangan Mamin Rapat (sudah 005 — reuse, bukan ulang)

---

# BLUEPRINT — Sprint 006: Autogen Semua Tab Mamin

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2). 0 dependency baru. Tech stack terkunci ADR.
> Verifikasi via read-only 2026-10-03 (tanpa ubah src): `aturanUndangan.js`
> 143 baris / 11 exports (`keISO, hariDariISO, tanggalPanjang, parsePerjalanan,
> templateUndanganMamin, templateUndanganPerjDinas, drafNotulen,
> snapshotSebelumTimpa, bacaSnapshot, urungkanTimpa` + default);
> `templateConfig.js` section `notulen` (9 fields + poin-pembahasan +
> signature pimpinan/notulen), `undangan_mamin` (T0 + jadwal T1 +
> uraian-kegiatan), `pesanan_mamin` (T0 + uraian + table-dinamis NO/URAIAN/
> SATUAN/JUMLAH + Hari-Tanggal/Jenis/Jumlah), `buku_tamu` (No.Urut/
> Hari-Tanggal/Bertemu + IDENTITAS TAMU table-dinamis + Diterima/Tiba/Kembali
> + Tujuan + uraian-kegiatan), `daftar_hadir` (uraian acara + table-dinamis
> NO/NAMA/JABATAN/TTD/TTD2); docx Pesanan/Daftar-Hadir/Buku-Tamu diringkas
> via python-docx read-only; branch bersama `feat/sprint-005-autogen`.

## Arsitektur

```
BKUPage.jsx (klik baris grup dominan — reuse 005, tanpa ubah alur)
  │  kategoriDenganKoreksi(tx) → mamin (rapat/kegiatan/tamu/notulen)
  ▼
BKUSidebar.jsx (tombol deep-link, bawa tx + kegiatanNama — reuse 005)
  │  prefillDariBKU() DIPERLUAS (SELALU TIMPA + snapshot dulu — reuse 005)
  ▼
aturanUndangan.js (DIPERLUAS, ≤200 baris; pecah bila lewat)
  │  BARU: templatePesananMamin() · templateDaftarHadir()
  │        templateBukuTamu() · lengkapiNotulen()
  │  REUSE 005 (tanpa duplikasi): keISO/hariDariISO/tanggalPanjang,
  │        parseMamin/parsePerjalanan, snapshotSebelumTimpa/bacaSnapshot/
  │        urungkanTimpa, templateUndanganMamin, drafNotulen
  ▼
DokumenFormPreview.jsx (form tujuan — editor AKTUAL 005, 1 file)
  │  Kegiatan: perihal + isi pesanan baku + rincian editable
  │  Rapat: keterangan acara + tabel hadir (Guru/Tendik) editable
  │  Tamu: Hari/Tanggal + Tujuan + Uraian editable (identitas kosong jujur)
  │  Notulen: 9 identitas lengkap + Resume + Foto (bila ada) editable
  │  badge "dari BKU" + tombol Urungkan + toast timpa (reuse 005)
DokumenSPJPage.jsx (terima prefill, kunci snapshot spj_otomatis_snapshot — reuse 005)

Storage (reuse 005, via storageHelper, prefix spj_ — TANPA kunci baru):
  spj_otomatis_snapshot {ts, sumber_no_bukti, field_tertimpa[], nilai_lama{}}
  (satu slot terakhir per dokumen; tulis SEBELUM timpa, baca saat Urungkan)
```

## File Baru (batas: 0 — reuse 005)

| File | Isi |
|---|---|
| (tidak ada) | Semua fungsi baru masuk `aturanUndangan.js`; bila >200 baris → pecah jadi `aturanMamin.js` (sibling util, pola 005 `aturanNotulen.js`) |

## File Diubah (maks 4 — reuse pola 005, tanpa sentuh cetak)

| File | Bagian | Sifat |
|---|---|---|
| `spj-frontend/src/utils/aturanUndangan.js` | A, B, C, D | tambah `templatePesananMamin()` + `templateDaftarHadir()` + `templateBukuTamu()` + `lengkapiNotulen()`; reuse helper tanggal + snapshot 005; TETAP ≤200 baris atau pecah `aturanMamin.js` |
| `spj-frontend/src/utils/bkuKategori.js` | A, D | `prefillDariBKU` routing per sub-kategori mamin (rapat→undangan+hadir, kegiatan→pesanan, tamu→buku_tamu, notulen→lengkapi); SELALU TIMPA via BKU saja (reuse 005) |
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | A, B, C, D, E | render 4 hasil baru di form editable + badge "dari BKU" + Urungkan (reuse pola 005; tetap 1 editor) |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | E | snapshot `spj_otomatis_snapshot` SEBELUM timpa + toast + undo (reuse 005, tambah field_tertimpa baru ke daftar) |

> DILARANG sentuh: `blocks/*`, `TemplateEngine.jsx`, `templateConfig.js`,
> `sekolahData.js`, `signatureRoles.js`, print-area, file Sprint 003/004
> kecuali impor util murni. `undangan_mamin` tidak ditulis ulang (reuse 005).

## Dependensi (ter-pin eksak — dari `package.json` ASLI 2026-10-03, samakan 005)

react 18.3.1 · react-dom 18.3.1 · react-router-dom 6.30.4 · lucide-react 0.344.0 ·
xlsx 0.18.5 · pdfjs-dist 4.10.38 · @heyputer/puter.js 2.5.4 ·
@types/react 18.3.31 · @types/react-dom 18.3.7 · @vitejs/plugin-react 4.7.0 ·
autoprefixer 10.5.2 · postcss 8.5.16 · tailwindcss 3.4.19 · vite 5.4.21. **+0 baru.**

## Task Breakdown (2–5 menit/task; DoD = build exit 0 + grep, pola Sprint 005)

### BAGIAN A — Pesanan Mamin Kegiatan (F1)

| ID | Task | File | DoD |
|---|---|---|---|
| A.1 | `templatePesananMamin()` (perihal + "Bersamaan … sehubungan dengan akan dilaksanakannya kegiatan X" + Hari/tanggal + jenis + jumlah Box; tak cocok = jujur "") | `aturanUndangan.js` | build exit 0 · grep `templatePesananMamin` ≥ 1 |
| A.2 | Routing `prefillDariBKU` sub-kategori kegiatan → pesanan (bawa uraian/kegiatan/tanggal/noBukti) | `bkuKategori.js` | build exit 0 · grep `pesanan` ≥ 1 di `bkuKategori.js` |
| A.3 | Render pesanan editable (perihal + isi + rincian tambah/edit/hapus) | `DokumenFormPreview.jsx` | build exit 0 · grep `templatePesananMamin` ≥ 1 |

### BAGIAN B — Daftar Hadir Rapat (F2)

| ID | Task | File | DoD |
|---|---|---|---|
| B.1 | `templateDaftarHadir()` (keterangan acara dari uraian + rows NAMA/JABATAN dari Guru/Tendik; TTD kosong) | `aturanUndangan.js` | build exit 0 · grep `templateDaftarHadir` ≥ 1 |
| B.2 | Render tabel hadir editable (acara + rows tambah/edit/hapus) | `DokumenFormPreview.jsx` | build exit 0 · grep `templateDaftarHadir` ≥ 1 |

### BAGIAN C — Buku Tamu (F3)

| ID | Task | File | DoD |
|---|---|---|---|
| C.1 | `templateBukuTamu()` (Hari/Tanggal dari tanggal BKU + Tujuan/Uraian dari uraian + Diterima default Kepala Sekolah; identitas tamu kosong jujur) | `aturanUndangan.js` | build exit 0 · grep `templateBukuTamu` ≥ 1 |
| C.2 | Render buku tamu editable (semua field tambah/edit/hapus) | `DokumenFormPreview.jsx` | build exit 0 · grep `templateBukuTamu` ≥ 1 |

### BAGIAN D — Sisa Notulen + Resume/Foto (F4)

| ID | Task | File | DoD |
|---|---|---|---|
| D.1 | `lengkapiNotulen()` (isi SEMUA 9 identitas: hari dari tanggal, tanggal panjang, waktu/tempat default jujur, acara dari uraian, pimpinan/pembuka/notulen dari pejabatPada, peserta jumlah; reuse `drafNotulen` 005 untuk butir) | `aturanUndangan.js` | build exit 0 · grep `lengkapiNotulen` ≥ 1 |
| D.2 | Render notulen lengkap editable (9 identitas + Resume + Foto bila ada field deskriptif) | `DokumenFormPreview.jsx` | build exit 0 · grep `lengkapiNotulen` ≥ 1 |

### BAGIAN E — Pengaman reuse 005 (F5 + pengaman)

| ID | Task | File | DoD |
|---|---|---|---|
| E.1 | Snapshot SEBELUM timpa mencakup field baru (tambah daftar field A–D ke `field_tertimpa`; reuse `snapshotSebelumTimpa/urungkanTimpa` + kunci `spj_otomatis_snapshot`) | `aturanUndangan.js` + `DokumenSPJPage.jsx` | build exit 0 · grep `spj_otomatis_snapshot` ≥ 2 |
| E.2 | Badge "dari BKU" + tombol Urungkan + toast timpa berlaku semua tab Mamin; edit manual kekal kecuali buka-ulang BKU | `DokumenFormPreview.jsx` + `DokumenSPJPage.jsx` | build exit 0 · grep `Urungkan` ≥ 1 |

### GATE AKHIR

| ID | Task | DoD |
|---|---|---|
| F.1 | Regresi: 15 pola anti-hardcode = 0 pada file disentuh; blue-only tambah 0; diff warisan (blocks, templateConfig, TemplateEngine, Sprint 003/004/005-cetak, print-area) = kosong; `aturanUndangan.js` ≤200 baris atau sudah dipecah | semua grep 0 / diff kosong / wc -l ≤ 200 |
| F.2 | `npm run build` exit 0 + update STATE.MD + BUILD-REPORT | exit 0 + dokumen |

## DSA (hot path)

- Parser per baris: O(1) string ops (normalisasi + startsWith/includes) — 1000 baris < 500ms (reuse 005).
- Template render: O(1) per dokumen (rincian N ≤ 20, hadir M = jumlah GTK, tamu 5 rows, notulen 9 + N butir).
- Snapshot: O(F) salin field (F = field tertimpa A–D, kecil) — murah, 1 slot terakhir.

---

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

---

# HANDOFF-PROMPT — Sprint 006: Autogen Semua Tab Mamin (untuk Builder)

> Baca dulu (urutan wajib): `AGENTS.MD` → `STATE.MD` → `DECISIONS.MD` →
> `DOMAIN.MD` → `CONSTITUTION.md` → pack ini (`planning/sprints/sprint-006/`
> REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: `intent://local/halo-task-5/note/c2acf7c0-3bc9-45a2-b2fc-f469c267a35f`
> (branch bersama, status 005, batas alat).
> Idea Brief: `intent://local/halo-task-5/note/7452d010-f8ad-427b-8ea8-37cf449ce9e7`.

## Bootstrap (jalankan dulu — jangan menebak setup)

```bash
git branch --show-current
# harapan: feat/sprint-005-autogen (Pilihan B user — JANGAN buat branch baru)
git status --porcelain
# harapan: kode 005 sudah ada (aturanUndangan.js + 3 file ubah, uncommitted ikut kebawa)
cd D:\project\spj-app\spj-frontend && npm run build
# harapan: exit 0. Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas → /dashboard/bku
```

## Perintah Kerja

1. **DRY RUN DULU** — laporkan: urutan task (A.1…F.2), file disentuh (maks 4
   + 0 baru, reuse 005), risiko (`aturanUndangan.js` 143 + 4 fungsi baru
   >200 baris → pecah jadi `aturanMamin.js` sibling). TUNGGU persetujuan user
   sebelum coding.
2. Eksekusi per bagian A→B→C→D→E→F; tiap task diakhiri `npm run build` exit 0 +
   grep DoD; tempel output asli sebagai bukti (shift-left).
3. Data uji: seed `spj_bku_data` 1 Rapat + 1 Kegiatan (konsumsi snack/Box) +
   1 Tamu/kedinasan; Guru/Tendik ada (untuk rows Daftar Hadir); oracle
   pesanan = menu Nasi Box + "Pesanan untuk tanggal …"; oracle buku tamu =
   Diterima default Kepala Sekolah + identitas kosong jujur.
4. Batas file: `aturanUndangan.js` ≤ 200 baris (Constitution utility); pecah
   jadi `aturanMamin.js` bila lewat — putuskan saat dry run.
5. Selesai → BUILD-REPORT.MD (bukti per bagian) + update STATE.MD.
   JANGAN commit, JANGAN push (kuasa user — Pilihan B).

## JANGAN

- Membuat branch baru; commit; push (branch bersama 005 ikut kebawa);
  mengubah requirements tanpa persetujuan; menambah dependency apa pun;
  menyentuh `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, area cetak/
  print-area; menimpa field di luar alur BKU (SELALU TIMPA hanya saat buka
  dari BKU + wajib snapshot); menebak data tamu/hadir (tak ada di BKU =
  jujur kosong); menulis ulang `templateUndanganMamin` 005 (reuse);
  refactor di luar cakupan.

---

# Cross-Artifact Check (wajib Bab 8.4 langkah 4)

| F (REQUIREMENTS) | Task (BLUEPRINT) | Kriteria (ACCEPTANCE) | Bootstrap (HANDOFF) |
|---|---|---|---|
| F1 pesanan Kegiatan | A.1 templatePesananMamin · A.2 routing kegiatan · A.3 render | C-01 · T-02 · T-03 | seed Kegiatan + oracle Nasi Box; grep templatePesananMamin |
| F2 daftar hadir Rapat | B.1 templateDaftarHadir · B.2 render tabel GTK | C-02 · T-04 | seed Rapat + Guru/Tendik ada; grep templateDaftarHadir |
| F3 buku tamu | C.1 templateBukuTamu · C.2 render | C-03 · T-05 | seed mamin; identitas kosong jujur; grep templateBukuTamu |
| F4 sisa notulen 9 + Resume/Foto | D.1 lengkapiNotulen (reuse drafNotulen) · D.2 render | C-04 · T-06 | grep lengkapiNotulen; 9 identitas + pembuka baku |
| F5 edit + pengaman reuse 005 | E.1 snapshot field baru · E.2 badge + Urungkan + toast | C-05 · C-06 · T-07 · E-1 | JANGAN branch/commit/push baru; snapshot SEBELUM timpa |
| Batasan offline/0-dep/cetak | F.1 regresi · F.2 build+dok | C-07 · C-08 · T-01 · T-08 · E-2 | build exit 0 per bagian; util <=200 atau pecah aturanMamin.js |

Cacat ditemukan & diperbaiki sebelum lapor:
1. Undangan Mamin Rapat TIDAK masuk task 006 (sudah 005) — hanya reuse; cegah duplikasi templateUndanganMamin.
2. Identitas tamu/hadir tak ada di BKU → aturan jujur kosong ditulis eksplisit di F3/B.1/C.1 (bukan karangan nama).
3. Kunci snapshot TIDAK baru — reuse spj_otomatis_snapshot 005 (prefix spj_ via storageHelper); E.1 hanya tambah field_tertimpa baru.
4. Risiko util >200 baris diikat ke task: A.1…D.1 tambah 4 fungsi ke file 143 baris → F.1/T-08 verifikasi wc -l + pecah aturanMamin.js bila lewat (pola 005 aturanNotulen.js).
5. File Diubah = 4 (batas maks 5 terpenuhi); 0 file cetak (blocks/*, TemplateEngine.jsx, templateConfig.js, print-area) di daftar.
6. Branch bersama feat/sprint-005-autogen + larangan buat-branch/commit/push konsisten di REQUIREMENTS (Ketergantungan), ACCEPTANCE (header), HANDOFF (Bootstrap + JANGAN).
7. Foto hanya tampil bila field deskriptif sudah ada (Di Luar Cakupan: tanpa upload baru, tanpa fetch) — konsisten F4/D.2/T-06.