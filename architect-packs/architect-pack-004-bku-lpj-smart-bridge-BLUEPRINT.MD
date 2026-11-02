# BLUEPRINT — Sprint 004: BKU → LPJ Smart Bridge

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2). 0 dependency baru. Tech stack terkunci ADR.

## Arsitektur

```
BKUPage.jsx (list transaksi)
  │  kategoriDariRekening(tx.kodeRekening)  → badge kategori per baris
  │  klik baris
  ▼
BKUSidebar.jsx (detail + tombol deep-link) ── prefillDariBKU() ──▶ DokumenSPJPage
  │                                                              (menu tujuan,
  │                                                               field kosong
  │                                                               diisi + badge)
  ├─ gabungKonsumsi(rows) ──▶ grup Mamin (AND ketat no_bukti + kegiatan)
  ├─ pejabatPada(tgl, peran) ◀── spj_pejabat_riwayat (DokumenSPJPage kunci
  │                              pejabat saat dokumen dibuat)
  └─ kelompokATK(rows) ◀── spj_atk_flag ──▶ menu Kelengkapan SIPLAH/Non-SIPLAH

Storage baru (via storageHelper, prefix spj_):
  spj_bku_koreksi {kode_normal: kategori} · spj_pejabat_riwayat [{id,peran,nama,nip,berlaku_dari}]
  spj_atk_flag {no_bku: 'siplah'|'non'}
```

## File Baru (batas: utility 200 baris)

| File | Isi |
|---|---|
| `spj-frontend/src/utils/bkuKategori.js` | `REKENING_KE_MENU` + `kategoriDariRekening()` + `gabungKonsumsi()` + `kelompokATK()` + `pejabatPada()` + `prefillDariBKU()` (≤200 baris; pecah bila lewat) |

## File Diubah

| File | Bagian | Sifat |
|---|---|---|
| `spj-frontend/src/pages/dashboard/BKUPage.jsx` | A, B | badge kategori + klik → sidebar + filter "belum dipetakan" |
| `spj-frontend/src/components/bku/BKUSidebar.jsx` | B | detail + tombol deep-link per kategori + koreksi manual |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | B, C | terima prefill (isi field kosong + badge + undo) |
| `spj-frontend/src/pages/dashboard/DataSekolahPage.jsx` atau `PejabatSekolahPage.jsx` | C | riwayat pejabat multi-periode (pilih file yang sudah ada — cek saat dry run, hanya 1 file) |
| `spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx` | D | terima grup ATK (SIPLAH/Non-SIPLAH) |

> DILARANG sentuh: `blocks/*`, `TemplateEngine.jsx`, `templateConfig.js`,
> `sekolahData.js`, `signatureRoles.js`, file Sprint 003 (`MenuGuide.jsx`,
> `guideConfig.js`, `SummaryCard.jsx`) kecuali impor util murni.

## Dependensi (ter-pin eksak — sama BLUEPRINT Sprint 003)

react 18.3.1 · react-dom 18.3.1 · react-router-dom 6.30.4 · lucide-react 0.344.0 ·
vite 5.4.21 · @vitejs/plugin-react 4.7.0 · tailwindcss 3.4.19 · xlsx 0.18.5 ·
pdfjs-dist 4.10.38 · @heyputer/puter.js 2.5.4. **+0 baru.**

## Task Breakdown (2–5 menit/task; DoD = build exit 0 + grep, pola Sprint 002/003)

### BAGIAN A — Kategori (US-31, US-37)

| ID | Task | File | DoD |
|---|---|---|---|
| A.1 | `REKENING_KE_MENU` + `kategoriDariRekening()` (normalisasi strip spasi/titik/casefold, longest-prefix menang, null = belum dipetakan) | `bkuKategori.js` | build exit 0 |
| A.2 | Badge kategori per baris BKU + badge count "N belum dipetakan" + filter | `BKUPage.jsx` | build exit 0 · grep `kategoriDariRekening` ≥ 1 |
| A.3 | `spj_bku_koreksi` (simpan/baca mapping custom, dipakai permanen) | `bkuKategori.js` | build exit 0 |

### BAGIAN B — Sidebar + deep-link + prefill (US-32, US-33)

| ID | Task | File | DoD |
|---|---|---|---|
| B.1 | Sidebar detail: uraian, rekening+kategori, nominal, tanggal, no bukti, kegiatan; Esc/klik-luar tutup; dropdown koreksi utk tak-terpetakan | `BKUSidebar.jsx` | build exit 0 |
| B.2 | Tombol deep-link per kategori → route menu tepat (Honor/Mamin/Perjalanan/Pemeliharaan/Kelengkapan) | `BKUSidebar.jsx` | build exit 0 · grep `dokumen-lpj\|dokumen-kelengkapan` ≥ 2 |
| B.3 | `prefillDariBKU()` (isi field kosong saja + badge "dari BKU" + undo); toast bila field sudah terisi | `bkuKategori.js` + `DokumenSPJPage.jsx` | build exit 0 · grep `prefillDariBKU` ≥ 2 file |

### BAGIAN C — Merge + pejabat (US-34, US-35)

| ID | Task | File | DoD |
|---|---|---|---|
| C.1 | `gabungKonsumsi()` (AND ketat trim/casefold; saran nyaris-sama; 3+ baris; tampil 2 rincian + total) | `bkuKategori.js` | build exit 0 |
| C.2 | `spj_pejabat_riwayat` + `pejabatPada()` (lookup periode max berlaku_dari ≤ tanggal; fallback tertua + warning) + UI tambah periode + kunci saat dokumen dibuat + label/tooltip periode | `PejabatSekolahPage.jsx` (atau DataSekolah, 1 file) + `DokumenSPJPage.jsx` | build exit 0 · grep `pejabatPada\|spj_pejabat_riwayat` ≥ 2 |
| C.3 | Gate: dokumen lama tidak berubah setelah tambah periode (uji manual 2 periode) | — | bukti screenshot |

### BAGIAN D — ATK SIPLAH (US-36)

| ID | Task | File | DoD |
|---|---|---|---|
| D.1 | `kelompokATK()` (grup by no_bukti; Nomor kosong = kelompok sendiri) + `spj_atk_flag` + panah visual + tandai SIPLAH/Non per kelompok + checkbox gabung beda nomor BKU | `bkuKategori.js` + `BKUPage.jsx`/`BKUSidebar.jsx` | build exit 0 |
| D.2 | Teruskan kelompok ke Kelengkapan (deep-link + prefill) | `DokumenKelengkapanPage.jsx` | build exit 0 |

### GATE AKHIR

| ID | Task | DoD |
|---|---|---|
| E.1 | Regresi: 15 pola anti-hardcode = 0; blue-only file disentuh = 0; diff warisan (blocks, templateConfig, Sprint 003) = kosong | semua grep 0 / diff kosong |
| E.2 | `npm run build` exit 0 + update STATE.MD + BUILD-REPORT | exit 0 + dokumen |

## DSA (hot path)

- Kategorisasi list: O(1)/baris via Map prefix terurut (1000 baris < 500ms).
- `gabungKonsumsi`/`kelompokATK`: grup by key string O(n) via Map — 1 pass.
- `pejabatPada`: linear atas periode (<10) per dokumen — murah.
