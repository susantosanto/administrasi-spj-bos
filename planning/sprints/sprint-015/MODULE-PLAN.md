# MODULE PLAN — Sprint 015: Import BKU PDF (OCR)

> Status: DRAFT dari `/module-planner` — input: `PRD.md` (disetujui),
> tech stack D1–D6 (disetujui 2026-10-19), `DATA-MODEL.md` (E1–E4).
> Konvensi repo: util baru di `spj-frontend/src/utils/`, **≤200 baris/file**,
> UI terintegrasi di `BKUPage.jsx`, oracle = script node `test-*.mjs` di root
> `spj-frontend/`, tooling fixture Python (dev-only, TIDAK terkirim).
> Coding BELUM boleh mulai — plan ini input untuk pack sprint-015.

## 1. Peta Modul

| Modul | Cakupan | Lokasi file | Dependensi |
|---|---|---|---|
| **M0 — Fixture & Oracle** (dev-only) | Fixture golden `{str,x,y,w,h}` (regenerasi Python RapidOCR offline; golden angka per sel dari Excel); oracle node `test-bku-pdf-*.mjs` | `scratch-pdf-check/` (dev), `spj-frontend/test-*.mjs` | Tidak ada |
| **M1 — Render PDF** | `renderPages(pdf)`: canvas per halaman + flag text-layer + normalisasi rotasi; progres per halaman; bisa batal | `src/utils/bkuPdfPages.js` | pdfjs-dist (terpasang) |
| **M2 — Adapter OCR** | Interface `ocrPage(canvas) → items[]`; dua adapter engine (tesseract.js & paddleocr-js); pemenang A/B dipertahankan, yang kalah dilepas; fallback "gunakan Excel" | `src/utils/bkuPdfOcr.js` | M1; keputusan D1 |
| **M3 — Parser layout** | items → `TransactionRow[]` (REUSE `detectTransactionType`/`detectKategoriBelanja` via import); `reconcile()` jaring pengaman; flag `problems[]` (E3) | `src/utils/bkuPdfParser.js` | format items dari fixture M0 (TIDAK butuh OCR hidup) |
| **M4 — UI preview + commit** | Komponen upload → pilih bulan → preview tabel + badge bermasalah + koreksi inline + hapus baris → ringkasan live → dialog konfirmasi → tulis atomik replace-by-month (Q4 DATA-MODEL) | `BKUUploadPdf.jsx` (baru) + diff kecil di `BKUPage.jsx` | M3; engine final dari D1 |
| **M5 — Gate & guard** | `bkuParser.js` = 0 diff; build exit 0; storage hanya `spj_`; warna BLUE-ONLY | lintas file | — |

## 2. Grafik Dependensi + Urutan Eksekusi

```
M0 Fixture & Oracle (dev; hal 1–4 → 21 halaman)
     │
     ├──▶ M3 Parser layout  (bekerja murni dari fixture — TANPA OCR hidup)
     │        └──▶ oracle: 0 selisih Januari vs Excel
     │
     └──▶ M1 Render PDF ──▶ M2 Adapter OCR ──▶ A/B GATE (D1)
                                              │ tabel akurasi terukur
                                              ▼
                                        M4 UI preview + commit
                                              │
                                              └──▶ M5 Gate → /acceptance-runner fresh
```

Urutan: M0 → (M1 ∥ M3 paralel) → M2 → A/B → M4 → M5.
A/B GATE juga titik berhenti: bila kedua engine tidak mencapai target
akurasi → sprint pause, laporkan user (preseden sprint-013 di-reset karena
keputusan tidak berangka).

## 3. Task Breakdown

Estimasi sudah memuat ~50% porsi uji + edge case.

### M0 — Fixture & Oracle
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-00 | **Menulis ulang** `gen_fixture_rest.py` (script sprint-013 **sudah dihapus** saat reset) sampai fixture 21/21 halaman | 1,5 j | fixture lengkap; hal 1–4 konsisten dengan Excel |
| T-01 | Oracle `test-bku-pdf-parse.mjs`: golden angka dari Excel untuk Januari (jumlah baris, masuk, keluar, saldo akhir) | 1 j | oracle jalan; target berasal dari Excel asli |

### M1 — Render PDF
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-10 | `bkuPdfPages.js`: load + render canvas + deteksi text-layer + penanganan rotasi + `onProgress(page,total)` + batal (AbortController) | 2 j | 21 canvas ter-render + flag text=0; batal = tidak ada data berubah |

### M2 — Adapter OCR (D1)
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-20 | Satu interface `ocrPage`, dua adapter engine; lazy load `import()`; tanpa hardcode pilihan engine di konsumen | 1,5 j | kedua engine menghasilkan format items sama |
| T-21 | **A/B terukur** di browser (dev-only): akurasi uraian, sel-golden, baris; fixture hal 1–4 → 21 halaman; waktu per halaman dicatat | 2,5 j | tabel akurasi kedua engine tersimpan; pemenang TERUKUR; engine kalah dilepas |
| T-22 | Dependensi terpilih: pin versi di BLUEPRINT.MD + ADR di DECISIONS.MD; bila paddleocr-js menang → model self-host `public/models/` + COOP/COEP di Vite | 1 j | build exit 0; dev server hidup |

### M3 — Parser layout
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-30 | `bkuPdfParser.js`: grouping baris per y, pemetaan kolom per x, format angka Indonesia ("1.234.567"), baris terpotong antar-halaman | 4 j | oracle: 0 selisih Januari vs Excel |
| T-31 | `reconcile()` + detector `problems[]` (uraian_kosong, angka_gagal_parse, kolom_geser, saldo_tak_runtun) | 1 j | unit test node lulus |
| T-32 | REUSE tanpa menyalin: **`redetectTypes()`** yang sudah `export` dari `bkuParser.js` (`:654`) — `detectTransactionType`/`detectKategoriBelanja` sendiri **tidak terekspor** (`:156`,`:217`) jadi import langsung mustahil tanpa merusak file TABU | 0,5 j | `rg redetectTypes bkuPdfParser.js` ≥1 hit; `bkuParser.js` 0 diff |

### M4 — UI preview + commit
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-40 | `BKUUploadPdf.jsx`: input PDF → pilih bulan → preview `PreviewRow[]` + badge bermasalah + koreksi inline (uraian/jumlah/tanggal/noBukti) + hapus (`excluded`); total live | 4 j | US-1..US-5 jalan di `:5173` |
| T-41 | Dialog konfirmasi + commit ATOMIK Q4 (replace-by-month, summary di-hitung ulang, `uploadedAt`); fallback "gunakan Excel" | 1 j | US-6/10 lulus; gagal di tengah tulis = data lama utuh |
| T-42 | Integrasi BKUPage: tombol "Upload PDF" di samping jalur Excel + default bulan terakhir + warna BLUE-ONLY | 1 j | US-1/2 lulus; T-02 15 pola = 0 hit |

### M5 — Gate akhir
| Task | Isi | Est | Selesai bila |
|---|---|---|---|
| T-50 | T-02 15 pola = 0 hit; storage hanya prefix `spj_`; `bkuParser.js` 0 diff; build exit 0; oracle lulus penuh | 1 j | bukti per item tercatat di checklist ACCEPTANCE pack |

Total estimasi: ±22 jam kerja efektif.

## 4. Fase Eksekusi

- **Phase 0 (paralel):** T-00, T-01, T-10
- **Phase 1:** T-30, T-31, T-32 (murni dari fixture — TIDAK butuh OCR hidup)
- **Phase 2:** T-20, T-21 (A/B), T-22 (persetujuan dependensi)
- **Phase 3:** T-40, T-41, T-42 (UI; T-41 + T-42 share file → SATU pekerja, tanpa paralel)
- **Phase 4:** T-50 gate → /acceptance-runner konteks segar

## 5. Struktur File (konvensi repo)

```
spj-frontend/
├── src/utils/
│   ├── bkuPdfPages.js        # M1 render (≤200 baris)
│   ├── bkuPdfOcr.js          # M2 adapter (≤200 baris)
│   └── bkuPdfParser.js       # M3 parser + reconcile (≤200 baris; boleh 2 file)
├── src/components/bku/        # lokasi komponen — SUDAH_DIPUTUSKAN di pack
│   ├── BKUSidebar.jsx         # (existing, tak disentuh)
│   └── BKUUploadPdf.jsx       # M4 UI BARU (≤300 baris)
├── src/pages/dashboard/
│   └── BKUPage.jsx           # hanya ditambah tombol + state minimal (diff kecil)
├── public/
│   └── models/               # (bila paddleocr-js menang) model .onnx self-host
└── test-bku-pdf-*.mjs        # oracle node — WAJIB di sini (butuh `xlsx`)

scratch-pdf-check/            # DEV-ONLY (git-ignored)
├── gen_fixture_rest.py       # BARU — ditulis ulang, dihapus saat reset 013
└── fx/pNN.png                # render halaman PDF contoh
```

## 6. Risiko per Task

| Task | Risiko | Mitigasi |
|---|---|---|
| T-00 | OCR Python lambat (±1–3 menit/halaman) | job background + resumable per halaman |
| T-21 | Kedua engine di bawah target akurasi | berhenti berangka: jangan lanjut; lapor user; opsi = riset parser tambalan |
| T-30 | Kolom bergeser antar-halaman (kepadatan baris beda) | oracle per-halaman menunjukkan baris hal mana; kalibrasi per formula |
| T-40 | Baris bulan terpilih terbelah lintas halaman | parser memakai urutan tanggal untuk segmen per bulan |
| T-42 | Menimpa perilaku render `BKUPage` existing | diff kecil + state jalur Excel dijaga |
| T-32 | Builder menambah `export` ke `bkuParser.js` demi import langsung | **Tidak boleh** — pakai `redetectTypes()` (`:654`, sudah export). G-1 = 0 diff dijaga di tiap gate |
| Semua | `bkuParser.js` terdorong ikut berubah | T-32 + `git diff --stat` tiap task (M5) |

## 7. Self-Review

- [x] Semua modul memetakan ≥1 US (M0→US-9; M1→US-3/8; M2→US-8/9; M3→US-4/7; M4→US-1..6/10; M5→US-9/10)
- [x] Semua task punya estimasi
- [x] Dependensi eksplisit (M2 butuh M1; M3 hanya butuh fixture; M4 butuh M3 + hasil A/B)
- [x] Peluang paralel teridentifikasi (Phase 0/1; aturan share-file dihormati)
- [x] Struktur file ikut konvensi repo (utils/, 1 halaman BKU, test-*.mjs)
- [x] Tidak ada task > 2 jam di jalur kritis tanpa pembagian (terbesar 4 j = T-30/T-40, dipecah sub-langkah saat eksekusi)
- [x] Setiap task punya definisi "selesai"
