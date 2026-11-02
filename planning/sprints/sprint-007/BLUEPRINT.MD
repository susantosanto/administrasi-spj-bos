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
