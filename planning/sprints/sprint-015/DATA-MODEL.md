# DATA MODEL — Sprint 015: Import BKU PDF (OCR)

> Status: DRAFT dari `/entity-modeler` — input: `PRD.md` §5 (disetujui) +
> tech stack D1–D6 (disetujui user 2026-10-19). Database = localStorage
> (`storageHelper`, prefix `spj_`) — TIDAK ada SQL/ORM; "schema" di bawah =
> kontrak objek JS. Bentuk baris transaksi di-patok dari source nyata
> (`bkuParser.js:348-368` + wrapper ditulis di `BKUPage.jsx:216-221`).

## 1. Entitas & Schema

### E1 — `spj_bku_data` (wrapper, SUDAH ADA — target tulis)

```js
// storage: localStorage key 'bku_data' (via storageHelper, prefix spj_)
{
  transactions: TransactionRow[],  // E2 — array 1-D, semua bulan
  header: HeaderInfo,              // dari jalur Excel; PDF path TIDAK mengubah
  summary: Summary,                // diperhitungkan ulang saat load oleh BKUPage
                                   // (recalculateSummary) — toleran basi
  footer: FooterInfo,              // sama: milik jalur Excel (tanda tangan sheet)
  uploadedAt: string(ISO),         // diperbarui tiap upload (Excel maupun PDF)
}
```

Field meta `header`/`footer`: **tidak disentuh** oleh jalur PDF (PRD §5 —
"field meta lain tidak disentuh"). `summary` boleh ditulis oleh PDF path
karena BKUPage selalu menghitung ulang saat load (terverifikasi di source),
tapi aturan aman: PDF path menulis `summary` hasil recalculate agar state
konsisten walau di-read langsung oleh konsumen lain (queryEngine, dokKas).

### E2 — `TransactionRow` (bentuk BARIS — WAJIB identik jalur Excel)

```js
// patokan: bkuParser.js:346-366 — SATU-SATUNYA sumber kebenaran bentuk ini
// (17 field; ditulis ulang 2026-10-19 — pack lama sempat menyebut 16)
{
  row: number,                 // no. baris di file sumber (Excel: sheet; PDF: halaman)
  tanggal: { day, month, year },
  tanggalStr: "dd-mm-yyyy",
  tanggalISO: "yyyy-mm-dd",    // basis sort & kunci urutan
  bulan: number (1-12),
  tahun: number,
  kodeKegiatan: string,
  kodeRekening: string,
  noBukti: string,
  uraian: string,
  penerimaan: number,          // 0 bila kosong
  pengeluaran: number,         // 0 bila kosong
  saldo: number,
  debet: = penerimaan,         // alias — WAJIB diisi sama
  kredit: = pengeluaran,       // alias — WAJIB diisi sama
  tipe: string|null,           // HASIL detectTransactionType() (REUSE, bukan salin)
  kategori: string|null,       // HASIL detectKategoriBelanja() (REUSE)
}
```

Aturan identitas: baris PDF yang telah melalui preview+koreksi harus
field-per-field sama dengan hasil jalur Excel untuk baris yang sama
(US-7). **DILARANG menambah field baru** (mis. `source: 'pdf'`) — shape
harus identik 100%; all consumers (`dokKas`, `bkuHelper`, `queryEngine`,
`dataContextBuilder`) tak boleh melihat perbedaan.

### E3 — `PreviewRow` (ephemeral — state UI, TIDAK pernah persist)

```js
{
  ...TransactionRow,           // nilai hasil OCR, siap hasil koreksi
  page: number,                // halaman asal di PDF (untuk penelacakan sumber)
  problems: string[],          // daftar masalah per baris:
                               //   'uraian_kosong' | 'angka_gagal_parse' |
                               //   'kolom_geser' | 'saldo_tak_runtun'
  excluded: boolean,           // baris dihapus user — tidak ikut disimpan
}
```

Hidup di React state selama sesi preview. Close tab/batal → hilang
(atomic oleh desain: `spj_bku_data` hanya disentuh pada satu titik
`storageHelper.set('bku_data', ...)` setelah dialog konfirmasi).

### E4 — Draft OCR (opsional, Phase 2) — TIDAK di-MVP

Key cadangan: `spj_bku_pdf_draft` (snapshot `PreviewRow[]`). PRD §5:
"boleh tidak ada di MVP". Skip; ditulis ulang bila user minta undo lintas
sesi.

## 2. Peta Relasi

```
┌───────────────────────────────┐
│  spj_bku_data (E1, wrapper)   │
├───────────────────────────────┤
│ header  ──── (jalur Excel)    │
│ footer  ──── (jalur Excel)    │
│ summary ──── (recalc)         │
│ uploadedAt                    │
│ transactions[1..N] ───────────┼──▶ E2 TransactionRow (elemen array)
└───────────────────────────────┘         ▲
                                          │ sumber baris (in-memory saja)
┌───────────────────────────────┐         │
│ PreviewRow (E3, ephemeral)    │─────────┘
├───────────────────────────────┤
│ ...TransactionRow             │
│ page, problems[], excluded    │
└───────────────────────────────┘

Relasi: E1 1:N E2 (containment array) — TANPA foreign key (localStorage).
E3 = proyeksi kerja dari hasil OCR → disaring bulan → menimpa elemen E2
untuk bulan terpilih SAJA (replace-by-month, atomic).
```

## 3. Strategi "Index" (localStorage, tanpa index nyata)

Data volume kecil (±421 baris/tahun) — filter array O(n) cukup p95 < 10ms.
Bukan bikin index; ini pola akses yang harus didukung renderer:

| Pola akses | Konsumen | Kebutuhan |
|---|---|---|
| filter `bulan == n` | BKUPage filter, bkuHelper | row sort stabil tanggalISO (urutan sisipan) |
| filter `tipe == X` | BKUPage recalcSummary, dokKas | `tipe` WAJIB terisi non-null untuk baris dana |
| `kodeRekening.startsWith(prefix)` | bkuHelper.findBkuNominal | string trim (parser sudah trim) |
| `uraian.includes(nama)` (case-insens) | bkuHelper, intentClassifier | uraian bersih dari code/kolom lain (oracle ≥90%) |
| sort `tanggalISO` | tampilan tabel + cetak | kunci urutan sekunder: page lalu posisi-y |

Kunci dedup/deteksi duplikat: tidak perlu (keputusan user = timpa dengan
konfirmasi, bukan merge).

## 4. Pola Query Teratas (dengan JS, bukan SQL)

```js
// Q1 — filter bulan untuk preview & replace-by-month
const rows = bku.transactions.filter(t => t.bulan === bulanTerpilih && t.tahun === tahun);
// O(n) 421 baris — < 1ms

// Q2 — ringkasan per bulan (dipakai UI bawah preview)
const masuk  = rows.filter(t => t.penerimaan  > 0).reduce((s,t) => s+t.penerimaan,  0);
const keluar = rows.filter(t => t.pengeluaran > 0).reduce((s,t) => s+t.pengeluaran, 0);
const saldoAkhir = saldoAwal + masuk - keluar;   // jaring pengaman reconcile()

// Q3 — cari nominal untuk auto-fill dokumen (bkuHelper.findBkuNominal — EXISTING,
//      JANGAN diubah): filter pengeluaran>0 + bulan + uraian.includes + prefix rk

// Q4 — replace-by-month ATOMIK (titik tulis satu-satunya di fitur ini)
const next = stored.transactions.filter(t => t.bulan !== bulanTerpilih || t.tahun !== tahun);
storageHelper.set('bku_data', {
  ...stored,
  transactions: [...next, ...previewRows],
  summary: recalcSummary([...next, ...previewRows]),
  uploadedAt: new Date().toISOString(),
});

// Q5 — baca ringan oleh consumer lain (queryEngine/dokKas): langsung
//      storageHelper.get('bku_data') → bentuk SAMA, tanpa cabang baru.
```

Aturan melanggar Check-list skill (No SELECT *) → N/A di localStorage,
tapi padanannya: **jangan spread membiasakan field asing** — tulis E2
persis 17 field di atas.

## 5. Rencana Migrasi & Rollback

- **Tidak ada migrasi skema** — bentuk output baris 100% sama dengan
  jalur Excel. Data `spj_bku_data` lama (dari Excel) tetap valid; fitur
  hanya menambah jalur masuk.
- **Rollback** = re-upload Excel (jalur lama tetap utuh, D4 frozen) —
  reversibility gratis by design.
- Kasus tepi: `spj_bku_data` belum ada sama sekali (belum pernah upload
  Excel) → PDF path harus bisa jadi jalur PERTAMA: baca `null` → tulis
  baru (header/footer `null`: verifikasi konsumen tahan null — terbukti
  helper konsumen hanya baca `.transactions`).

## 6. Self-Review (checklist)

- [x] Semua entitas dari PRD punya schema (E1/E2/E3; E4 = Phase 2 eksplisit)
- [x] Setiap relasi jelas (containment array; tanpa FK — localStorage)
- [x] Pola akses teratas terdokumentasi (5 pola, termasuk consumer yang
      sudah ada: bkuHelper/dokKas/queryEngine)
- [x] "No SELECT *" padanan: tulis 17 field E2 persis, tanpa field asing
- [x] ID eksplisit: tidak ada id sintetis — kunci alami = tanggalISO +
      urutan; `row` = asal-file (nilai info, bukan kunci)
- [x] Timestamp: `uploadedAt` di wrapper (exist); per-baris tidak ada
      created/updated — mengikuti patokan Excel (identitas > audit; shape
      dilarang ditambah)
- [x] Soft delete: tidak (replace-by-month atomik + rollback = re-upload
      Excel)
- [x] Rencana migrasi punya rollback (re-upload Excel; null-safe first-run)
