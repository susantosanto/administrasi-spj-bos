# BLUEPRINT — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4). Isi = **BAGAIMANA** saja.
> "Apa & mengapa" → `REQUIREMENTS.MD`. Kriteria uji → `ACCEPTANCE.MD`.
>
> Dependency **ter-pin eksak** (Bab 17.2 — jangan `^`). Tech stack **tidak dipilih
> ulang** — terkunci ADR. **Sprint ini menambah 0 dependency.**

---

## Prasyarat & Ketergantungan

> ⚠️ Sprint 001 + 002 **APPROVED 2026-09-30** — kontrak di bawah sudah tersedia.

| Kontrak dari Sprint 001/002 | Dipakai untuk |
|---|---|
| `getSchoolData()` / `getPejabat()` / `getSignatureRoles()` (tanpa fallback) | dokumen cetak kop→TTD (tidak diubah) |
| `blocks/PeringatanData.jsx` | banner di preview kartu (edit-mode sudah otomatis) |
| Blok cetak murni `SuratTugas/SPDForm/SuratUndangan/Notulen` (0 `<input>`) | jalur Cetak Semua saja |
| `getRecipientsFor()` + `getGuruHonorer()` dst. (`honorHelper.js`) | titik perluasan sumber penerima |
| Config Mamin yang sudah ada: `notulen`, `undangan_mamin`, `pesanan_mamin`, `buku_tamu`, `daftar_hadir` (`templateConfig.js:17/57/113/180/242`) | set cetak Mamin |
| Tombol reset `dokumen_lpj` (`DokumenSPJPage.jsx:150,689`) | tidak diubah |

- **File yang disentuh sprint lalu:** `DokumenFormPreview.jsx`, `templateConfig.js`,
  `DokumenSPJPage.jsx` — sprint ini menyentuh LAGI tapi hanya lapisan
  preview/pasang; **batas tetap: 001 = sumber nilai · 002 = struktur & layout ·
  003 = lapisan preview & panduan**.

## Arsitektur Sistem

```
data/guideConfig.js (BARU) ──── langkah per menu + predikat state
        │                        { [menuId]: { title, steps: [{id,label,when(ctx)?,done(ctx)}] } }
        │                        (REVISI 2026-10-01: langkah = tab nyata; langkah
        │                         aktif = yang pertama belum-selesai, bukan predikat manual)
        ▼
components/guide/MenuGuide.jsx (BARU) ── pill `? Panduan` + popover checklist
        │                                 non-modal · print:hidden · storage spj_guide_*
        │                                 (REVISI: state machine auto-open/trigger/switch)
        ▼
pages/dashboard/DokumenSPJPage.jsx ── pasang <MenuGuide key={menuId} menuId=.../> di 4 menu
        │                             + ctx kaya (activeTab, visited, field per tab)
        │                             + state formTab/previewTab DIANGKAT dari DokumenFormPreview
        │                             + label tombol baru (rename)

components/templates/DokumenFormPreview.jsx
        ├── viewMode 'form'    → form isian (TIDAK diubah)
        ├── viewMode 'preview' → KARTU RINGKASAN (BARU — menggantikan render
        │                        mode="print" di layar; 0 kop, 0 TTD)
        │     └── komponen kartu diekstrak: components/templates/SummaryCard.jsx (BARU)
        └── handlePrint()      → print-container berisi dokumen formal kop→TTD
                                 (blok Sprint 002 dipakai apa adanya — TIDAK diubah)

utils/honorHelper.js → tambah getSemuaPegawai() (guru+tendik+perpus+penjaga,
                       SEMUA status; honorer-only tetap untuk menu honor)
```

## Tech Stack (tidak berubah — terkunci ADR)

| Lapisan | Teknologi |
|---|---|
| Runtime | Node.js **v22.22.2** (managed) / v24.19.0 (fallback — hash artefak identik) |
| UI | React **18.3.1** + React DOM **18.3.1** |
| Routing | react-router-dom **6.30.4** |
| Build | Vite **5.4.21** + @vitejs/plugin-react **4.7.0** |
| Styling | Tailwind CSS **3.4.19** + postcss **8.5.16** + autoprefixer **10.5.2** |
| Ikon | lucide-react **0.344.0** (Material Symbols via font) |
| Excel | xlsx **0.18.5** ⚠️ F1 TINGGI — OPEN, versi tidak boleh diubah sprint ini |
| PDF | pdfjs-dist **4.10.38** |
| AI client | @heyputer/puter.js **2.5.4** |
| Bahasa | JavaScript ES modules + JSX (bukan TypeScript) |

## File yang Akan Dibuat

| File | Isi | Batas baris |
|---|---|---|
| `spj-frontend/src/components/guide/MenuGuide.jsx` | pill + popover generik | ≤ 300 |
| `spj-frontend/src/data/guideConfig.js` | langkah + predikat 4 menu | ≤ 150 |
| `spj-frontend/src/components/templates/SummaryCard.jsx` | kartu ringkasan label+nilai generik | ≤ 300 |
| `spj-frontend/src/components/templates/blocks/index.js` | re-export SummaryCard (sudah ada file-nya) | — |

## File yang Akan Diubah

| File | Fase | Sifat perubahan |
|---|---|---|
| `spj-frontend/src/utils/honorHelper.js` | 1 | +`getSemuaPegawai()` (semua status); helper honorer tidak diubah |
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | 1, 2, 3, R | sumber penerima (transport/mamin) · jalur preview → SummaryCard · handlePrint cetak 5-doc & mamin-full · rename tombol · **R: terima `formTab`/`previewTab` sebagai props (bukan useState lokal)** |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | 4, R | pasang `<MenuGuide>` ×4 · label tombol di level halaman (bila ada) · **R: state `formTab`/`previewTab` diangkat, `visitedTabs` (session Set), `activeTab` terhitung, ctx kaya MenuGuide, `key={selectedCard.id}` pada mount** |
| `spj-frontend/src/data/templateConfig.js` | 3 | (hanya bila dry run menemukan gap) lengkapi config mamin yang kurang |

> **DILARANG** menyentuh file di luar daftar ini (AGENTS.MD). Khususnya **DILARANG**
> mengubah isi/blok: `blocks/SuratTugas.jsx`, `blocks/SPDForm.jsx`,
> `blocks/SuratUndangan.jsx`, `blocks/KopSurat.jsx`, `blocks/KopGugus.jsx`,
> `blocks/SignatureFooter.jsx`, `blocks/SKHonorer.jsx`, `utils/sekolahData.js`,
> `utils/signatureRoles.js`, `utils/pejabatRoles.js`, `TemplateEngine.jsx` —
> wilayah Sprint 001/002 yang sudah APPROVED.

## Dependensi (versi ter-pin eksak)

### Dependencies
```
react: 18.3.1
react-dom: 18.3.1
react-router-dom: 6.30.4
lucide-react: 0.344.0
pdfjs-dist: 4.10.38
xlsx: 0.18.5
@heyputer/puter.js: 2.5.4
```

### devDependencies
```
vite: 5.4.21
@vitejs/plugin-react: 4.7.0
tailwindcss: 3.4.19
postcss: 8.5.16
autoprefixer: 10.5.2
@types/react: 18.3.31
@types/react-dom: 18.3.7
```

**Sprint ini menambah 0 dependency baru.** Pasang dengan `npm ci` (hormati lockfile).

## Task Breakdown (2–5 menit per task)

> **DoD per task (shift-left):** tiap task yang menyentuh kode diakhiri
> `cd spj-frontend && npm run build` → wajib exit 0 (output ditempel sebagai bukti).
> Gate grep per fase tercantum di kolom DoD. Proyek belum punya ESLint/Vitest —
> build + grep adalah sensor per task (pola Sprint 002).

### FASE 1 — Sumber penerima & rename tombol (US-21, US-24)

| ID | Task | File | DoD (machine-checked) |
|---|---|---|---|
| 1.1 | Tambah `getSemuaPegawai()`: gabung guru+tendik+perpus+penjaga TANPA filter status (dedupe by `itemKey`) | `honorHelper.js` | build exit 0 |
| 1.2 | `getRecipientsFor()`: cabang `perjalanan_dinas` & `mamin/pemeliharaan` → `getSemuaPegawai()`; cabang `honor` TETAP honorer-only | `DokumenFormPreview.jsx` | build exit 0 · grep `getSemuaPegawai` ≥ 2 pemakaian |
| 1.3 | **DRY RUN MAMIN (preskripsi):** ekstrak struktur semua docx Mamin di `template/` → tabel pemetaan docx ↔ config ↔ data | — | daftar pemetaan tertulis di laporan dry run; gap → catat, jangan improvisasi |
| 1.4 | Rename tombol → **"Lihat Ringkasan"** (PUTUSAN user 2026-09-30) + ganti ikon `visibility` → ikon daftar (mis. `list_alt`) | `DokumenFormPreview.jsx` | build exit 0 · grep `"Preview Dokumen"` = 0 di `DokumenFormPreview.jsx` (BKUSidebar dikecualikan) |

### FASE 2 — Kartu ringkasan (US-19, US-20)

| ID | Task | File | DoD |
|---|---|---|---|
| 2.1 | Buat `SummaryCard.jsx`: render section `{title, fields:[{label,value}]}` + tabel baris; null → sel kosong jujur; props `sections` | `SummaryCard.jsx` | build exit 0 |
| 2.2 | Builder data SPT/SPD/Resume/Undangan → bentuk sections (data sudah ada: `buildSptData`/`buildSppdData`/`resumeData`/undangan) | `DokumenFormPreview.jsx` | build exit 0 |
| 2.3 | Tab preview `spt/sppd/resume/undangan` render `<SummaryCard>` — hapus `renderPerRecipient`+`mode="print"` dari jalur LAYAR (fungsi builder dipertahankan untuk cetak) | `DokumenFormPreview.jsx` | build exit 0 · grep `renderPerRecipient` = 0 |
| 2.4 | Preview Mamin/Pemeliharaan → SummaryCard (identitas acara, nomor, daftar hadir sebagai tabel) | `DokumenFormPreview.jsx` | build exit 0 |
| 2.5 | Pastikan `<PeringatanData/>` tetap tampil di preview & kop/TTD TIDAK ada di jalur layar | `DokumenFormPreview.jsx` | grep `KopSurat\|SignatureFooter` di jalur preview = 0 pemakaian layar |
| 2.6 | GATE FASE 2: build + grep gabungan fase 1–2 | — | semua exit 0/0 hit |

### FASE 3 — Set cetak lengkap (US-22, US-23)

| ID | Task | File | DoD |
|---|---|---|---|
| 3.1 | `handlePrint` transport: susun print-container 5 dokumen berurutan (tabel penerima → undangan → SPT → SPD → resume) dari builder yang sama | `DokumenFormPreview.jsx` | build exit 0 |
| 3.2 | Orientasi per dokumen dipertahankan saat multi-doc (portrait/landscape dari config); anti-terpotong halaman | `DokumenFormPreview.jsx` | build exit 0 · CSS `@page`/mm tak berubah |
| 3.3 | Cetak Mamin: hubungkan 5 config yang SUDAH ADA (`undangan_mamin`, `pesanan_mamin`, `notulen`, `daftar_hadir`, `buku_tamu`) ke tombol cetak per hasil dry run 1.3 | `DokumenFormPreview.jsx` (+`templateConfig.js` bila gap) | build exit 0 |
| 3.4 | Verifikasi jalur cetak tetap kop→TTD & blok Sprint 002 tak tersentuh | — | `git diff --stat` blok = kosong |

### FASE 4 — Panduan / MenuGuide (US-26…US-30)

| ID | Task | File | DoD |
|---|---|---|---|
| 4.1 | Buat `guideConfig.js`: langkah 4 menu + predikat `done(ctx)`/`active(ctx)` dari state nyata (penerima terpilih, nomor terisi, ringkasan dilihat, dicetak) | `guideConfig.js` | build exit 0 |
| 4.2 | Buat `MenuGuide.jsx`: pill `? Panduan` + badge `n/N`; popover non-modal (klik-luar & Escape menutup); `print:hidden`; `aria-expanded` | `MenuGuide.jsx` | build exit 0 |
| 4.3 | Auto-open kunjungan pertama (`spj_guide_visited_<menu>`); dismiss permanen (`spj_guide_dismissed_<menu>`); pill menyusut jadi ikon `?` pasif (tetap bisa dibuka) | `MenuGuide.jsx` | build exit 0 |
| 4.4 | Pasang `<MenuGuide menuId="honor|perjalanan_dinas|mamin|pemeliharaan">` di 4 menu | `DokumenSPJPage.jsx` | build exit 0 · grep `<MenuGuide` = 4 pemakaian |
| 4.5 | GATE FASE 4: build + grep `print:hidden` pada 2 file baru | — | exit 0 · 2/2 file |

### FASE 5 — Regresi & gate akhir (US-25)

| ID | Task | File | DoD |
|---|---|---|---|
| 5.1 | Regresi Honorarium: alur form→SK→cetak tidak berubah (statik: diff logika honor = 0; jalur honor tidak menyentuh SummaryCard) | — | `git diff` menyentuh cabang honor hanya label tombol |
| 5.2 | Gate anti-hardcode 15 pola (warisan Sprint 001) + gate `<input|<textarea>` 3 blok (warisan Sprint 002) + blue-only file disentuh | — | semua grep = 0 |
| 5.3 | **GATE AKHIR:** `npm run build` + uji manual 4 menu (ringkasan, cetak, panduan) + catat bukti | — | build exit 0 + bukti |
| 5.4 | Perbarui `STATE.MD` + pack sprint + tutup loop | — | dokumen ter-update |

### Jalur kritis

```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5
```

## ADDENDUM — Revisi Panduan (keputusan user 2026-10-01)

> Revisi konten & perilaku MenuGuide setelah Fase 1–4 selesai. Sumber: 4 keputusan
> user sesi 2026-10-01 (konten per tab · auto-open setiap masuk menu · trigger
> "selesai isi tab" selalu muncul · cakupan per tab form). TIDAK mengubah Fitur A.

### Storage keys

| Key | Fungsi |
|---|---|
| `spj_guide_dismissed_<menu>` | permanen per menu — mematikan auto-open masuk menu + pindah konteks (TETAP) |
| ~~`spj_guide_tabseen_<menu>_<tab>`~~ | **DIHAPUS (ronde-2 SUPERSEDED)** — aturan "1× per tab" diganti "selalu tampil setiap pindah konteks" |
| ~~`spj_guide_visited_<menu>`~~ | **dihapus** — digantikan aturan masuk-menu-setiap-kali |

### Task Revisi (R1…R7) — DoD: `npm run build` exit 0 tiap task

| ID | Task | File | DoD (machine-checked) |
|---|---|---|---|
| R1 | Angkat `formTab`/`previewTab` jadi props (useState → DokumenSPJPage); reset tab tetap di DokumenFormPreview via efek card/sub | `DokumenSPJPage.jsx` + `DokumenFormPreview.jsx` | build exit 0 · grep `useState('daftar')` untuk dua tab = 0 di DokumenFormPreview |
| R2 | `visitedTabs` (Set session, kunci `"<menu>:<activeTab>"` + `<menu>:preview`) + komputasi `activeTab` (form: formTab utk transport / `form` utk lainnya; preview: previewTab / `ringkasan` utk mamin-pemeliharaan) | `DokumenSPJPage.jsx` | build exit 0 |
| R3 | Tulis ulang `guideConfig.js`: langkah per tab nyata + `when(ctx)` utk langkah sub-spesifik; **tanpa properti `active`** (aktif = langkah pertama belum-selesai) | `guideConfig.js` | build exit 0 · ≤150 baris |
| R4 | MenuGuide state machine: (a) mount (key=menuId) → auto-open bila belum dismiss; (b) `activeTab` berubah → tutup + auto-open 1× per tab (tabseen); (c) timer 600ms dibatalkan saat ganti tab; (d) trigger transisi done → `setOpen(true)` meski dismissed; (e) tombol dismiss → "Selesai — jangan buka otomatis lagi" | `MenuGuide.jsx` | build exit 0 · `print:hidden` tetap · ≤300 baris |
| R5 | ctx kaya MenuGuide: `activeTab`, `visited` (Set utk menu aktif), `rowsCount`, `nomor`, `nomorSpt`, `nomorSppd`, `sppdTanggal`, `resume`, `nomorUndangan`, `isiUndangan`, `acara`, `tanggal`, `btFilled`, `subId` | `DokumenSPJPage.jsx` | build exit 0 |
| R6 | GATE: build + grep warisan (15 pola = 0, 3 blok 0 `<input>`, blue-only 0, `<MenuGuide` tetap terpasang, `key={selectedCard.id}` ada) | — | semua exit 0 / 0 hit |
| R7 | Update pack (REQUIREMENTS/BLUEPRINT/ACCEPTANCE/HANDOFF) + STATE + BUILD-REPORT | — | dokumen ter-update |

### Task Revisi RONDE-2 (keputusan user lanjutan 2026-10-01)

| ID | Task | File | DoD (machine-checked) |
|---|---|---|---|
| R8 | Efek MenuGuide pakai `contextKey` = menu × subId × activeTab → popover **selalu tampil saat pindah konteks** (bila belum dismiss; terbuka → tetap); hapus logika tabseen + tutup-otomatis | `MenuGuide.jsx` | build exit 0 · grep `tabseen` = 0 |
| R9 | Langkah jadi `<button>` + ikon chevron; `jump {mode,tab?}` di 21 langkah config; `onJump` → `handleGuideJump` (setViewMode/setTab + `scrollToDetail`) popover tidak ditutup | `guideConfig.js` · `MenuGuide.jsx` · `DokumenSPJPage.jsx` | build exit 0 · grep `jump:` = 21 · grep `onJump` ≥ 2 file |

### DSA (addendum)

- **R2/R5:** Set lookup `visited` — filter per render O(k) dengan k kecil (<10 kunci
  per menu); badge & predikat dievaluasi ulang tiap render form → wajib murah,
  tanpa storage read per langkah (storage hanya dibaca saat efek mount/ganti tab).
- **R4d:** deteksi transisi via string gabungan done-flags (O(N), N≤6) — edge-triggered,
  bukan polling; timer 600ms dibersihkan saat ganti tab/unmount (hindari buka-buka
  ganda).


## DSA (27.4c ATURAN 3) — task hot path

- **Task 1.1/1.2:** DSA: Array + Set dedupe — gabung & dedupe N pegawai O(n) —
  daftar penerima dirender ulang tiap buka tab, harus linear tanpa duplikat.
- **Task 4.1:** DSA: Array langkah + predikat boolean per langkah — evaluasi N≤6
  langkah O(1)-per-render — popover dihitung ulang tiap render form, harus murah.
- Task lain: bukan hot path (render sekali per aksi user).

## Anggaran Panjang File

Batas `CONSTITUTION.md`: komponen **300** · utility **200** · config **150** baris.

| File | Baris kini | Catatan |
|---|---|---|
| `DokumenFormPreview.jsx` | **1914** | ⚠️ legacy 6,4× batas — pemecahan penuh di luar cakupan; DILARANG tumbuh signifikan — kode baru diekstrak ke `SummaryCard.jsx` |
| `templateConfig.js` | **993** | ⚠️ legacy — hanya boleh disentuh bila dry run 1.3 menemukan gap |
| `MenuGuide.jsx` (baru) | 0 | wajib ≤ 300 |
| `guideConfig.js` (baru) | 0 | wajib ≤ 150 |
| `SummaryCard.jsx` (baru) | 0 | wajib ≤ 300 |

## Keputusan Terbuka (dibawa ke review pack — BUKAN blocker penulisan pack)

1. ~~Nama final tombol~~ — **PUTUSAN 2026-09-30: "Lihat Ringkasan"** (ikon
   `list_alt`). BKU ("Preview Dokumen Foto") dikecualikan dari grep rename.
2. **Pemetaan docx Mamin** — final di dry run 1.3; gap → QUESTIONS.MD.
3. ~~Pemeliharaan ikut penuh atau pola saja~~ — **PUTUSAN 2026-09-30: ikut pola
   saja** (SummaryCard + panduan via config, sama seperti menu lain; tanpa
   perlakuan khusus / implementasi khusus Pemeliharaan).
