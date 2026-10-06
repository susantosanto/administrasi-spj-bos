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
