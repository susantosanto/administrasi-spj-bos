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
