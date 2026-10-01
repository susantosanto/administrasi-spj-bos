# REQUIREMENTS — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4). Isi = **APA & MENGAPA** saja.
> Detail teknis ("bagaimana") → `BLUEPRINT.MD`. Kriteria uji → `ACCEPTANCE.MD`.
> Prompt builder → `HANDOFF-PROMPT.MD`.
>
> Sumber requirement lengkap: `planning/sprints/sprint-003/PRD.md` (US-19…US-30) —
> disusun dari feedback uji manual `fix-template-document.md` (root repo) + 2 ronde
> keputusan user 2026-09-30.
>
> ⚠️ **Prasyarat wajib:** Sprint 001 + Sprint 002 **APPROVED 2026-09-30**
> (`VERIFICATION-REPORT.MD` masing-masing). Kontrak data-driven & print-area
> sudah tersedia. Risiko UI runtime UNTESTED diterima eksplisit user — feedback
> `fix-template-document.md` adalah bukti pemakaian nyata operator.

---

## Tujuan Sprint

Menjadikan lapisan **preview dokumen LPJ = kartu ringkasan data murni** (tanpa kop
surat & tanda tangan), melengkapi **set cetak** Perjalanan Dinas (5 dokumen) dan
Makan & Minum (semua dokumen sumber), membuka **daftar penerima ke semua pegawai**,
dan menambah komponen **Panduan langkah** (checklist ber-progres) di 4 menu —
sehingga operator selalu tahu "sudah isi form, lalu apa selanjutnya?" tanpa layar
utama pernah tertutup.

## Apa yang Dibangun

**Fitur A — Rework lapisan preview & cetak**

1. **Kartu ringkasan data** menggantikan render dokumen formal di layar preview:
   Perjalanan Dinas (tab SPT, SPD, Resume, Undangan) dan Makan & Minum.
   0 kop surat, 0 blok tanda tangan di jalur preview.
2. **Rename tombol "Preview Dokumen" di SEMUA menu** yang memilikinya — nama final
   final: **"Lihat Ringkasan"** (PUTUSAN user 2026-09-30; ikon `visibility` →
   `list_alt`). Label `"Preview Dokumen Foto"` BKU dikecualikan — di luar cakupan.
3. **"Cetak Semua" Perjalanan Dinas = 5 dokumen** formal lengkap kop→TTD:
   Daftar Penerima + Surat Undangan + SPT + SPD + Resume/Notulen (urutan dokumen
   referensi `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`).
4. **"Cetak Semua" Makan & Minum = set lengkap** dokumen sumber folder `template/`:
   Surat Undangan Mamin + Surat Pesanan Mamin + Notulen + Daftar Hadir + Buku Tamu
   (dipetakan 1-per-1 saat dry run; gap dilaporkan, tidak diimprovisasi).
5. **Daftar penerima & daftar hadir = SEMUA pegawai semua status** (PNS/PPPK/Honorer;
   guru + tendik + perpus + penjaga) untuk Perjalanan Dinas & Mamin.
6. **Menu Honorarium tidak berubah perilaku** (tetap honorer-only — memang sifatnya);
   hanya dapat label tombol baru + pemasangan Panduan.

**Fitur B — Panduan langkah (MenuGuide)**

7. **Pill `? Panduan` + badge progres** (mis. `3/5`) di baris judul 4 menu:
   Honorarium, Perjalanan Dinas, Makan & Minum, Pemeliharaan.
8. **Popover checklist ber-progres** (~360px, non-blocking, BUKAN modal): 4–6 langkah
   khas menu, tiap langkah punya predikat state (✓ selesai / aktif "SEKARANG" / ○
   belum) dihitung dari data form & pilihan user yang NYATA.
9. **Auto-open hanya kunjungan pertama** per menu; tombol "Selesai — jangan tampilkan
   lagi" mematikan auto-open permanen; pill menyusut jadi ikon `?` pasif yang tetap
   bisa dibuka manual. Disimpan localStorage prefix `spj_`.
10. **Config-driven & reusable**: komponen generik + config langkah per menu — menambah
    panduan menu baru nanti = edit config saja (kebutuhan eksplisit user).

## Mengapa

- **Preview menyesatkan.** Operator menekan tombol "Preview" dan melihat dokumen
  formal kop+TTD, padahal baru tahap pengecekan data — dia tidak bisa membedakan
  "data sudah benar?" dari "hasil cetak final". (Feedback uji manual, 2026-09-30.)
- **Set cetak tidak lengkap.** Mamin baru punya Notulen + Daftar Hadir; padahal
  dokumen sumber di folder `template/` memuat lebih banyak. LPJ yang dicetak tidak
  memenuhi kelengkapan bukti fisik (lihat `spjRequirements.js` MAMIN).
- **Daftar penerima terlalu sempit.** Hanya guru/tendik honorer yang muncul padahal
  kebutuhan riil mencakup pegawai PNS/PPPK (warisan menu honor yang menyebar ke
  transport & mamin — `getRecipientsFor()` di `DokumenFormPreview.jsx`).
- **Alur kompleks tanpa petunjuk.** Alur pengisian multi-tab terasa rumit bagi
  operator; user meminta petunjuk "sangat minimalis, premium, sangat berguna, tapi
  tidak membuat risih" — bukan modal dan bukan tour.

## Pengguna

| Persona | Peran dalam sprint ini |
|---|---|
| **Bendahara Sekolah** (primer) | Memeriksa data via ringkasan, mencetak set dokumen lengkap, dibimbing langkah |
| **Operator Sekolah** (primer) | Memilih penerima dari seluruh pegawai |
| **Kepala Sekolah / Ketua Gugus** (sekunder) | Penandatangan — dokumen cetak tetap formal kop→TTD |

## Data Sumber

| Sumber | Isi yang dipakai |
|---|---|
| `template/*.docx` (Mamin: Undangan, Pesanan, Notulen, Daftar Hadir, Buku Tamu) | Format baku set cetak Mamin |
| `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` | Urutan & format 5 dokumen Perjalanan Dinas (warisan Sprint 002) |
| Data Guru & Data Tendik (semua status) + perpus + penjaga | Daftar penerima/daftar hadir |
| Data Sekolah + pejabat (data-driven Sprint 001) | Kop & TTD dokumen cetak |
| localStorage prefix `spj_` | Seluruh data — tanpa backend |

## Cakupan User Story

| US | Judul | Fase (BLUEPRINT) |
|---|---|---|
| US-19 | Kartu ringkasan Perjalanan Dinas (4 tab) | Fase 2 |
| US-20 | Kartu ringkasan Mamin (+ Pemeliharaan pola sama) | Fase 2 |
| US-21 | Rename tombol preview semua menu | Fase 1 |
| US-22 | Cetak Semua Perjalanan Dinas = 5 dokumen | Fase 3 |
| US-23 | Cetak Semua Mamin = set lengkap folder template/ | Fase 3 |
| US-24 | Penerima semua status (transport & mamin) | Fase 1 |
| US-25 | Regresi Honorarium (alur tidak berubah) | Fase 5 |
| US-26 | Pill Panduan + popover di 4 menu | Fase 4 |
| US-27 | Langkah aktif sadar-state | Fase 4 |
| US-28 | Auto-open 1× & "jangan tampilkan lagi" | Fase 4 |
| US-29 | MenuGuide config-driven reusable | Fase 4 |
| US-30 | Panduan tidak bocor ke cetak | Fase 4 |

## Batasan

- **Tanpa backend.** localStorage prefix `spj_` — prefix tidak boleh diubah.
- **Stack terkunci ADR**: React 18 + Vite + Tailwind CSS — tidak boleh dipilih ulang.
- **Tanpa dependency baru** — hanya yang terdaftar di `BLUEPRINT.MD` (versi ter-pin).
- **Warna UI blue-only** `#004ac6` + slate (pengecualian: indikator status di layar,
  tidak pernah ikut cetak). Panduan selalu `print:hidden`.
- **Kertas A4 wajib**, satuan `mm`, orientasi dari `templateConfig.js`.
- **Dilarang refactor di luar cakupan** — file legacy besar tidak dipecah; kode baru
  diekstrak ke file komponen tersendiri (pola Sprint 002).
- **Dilarang menyentuh alur/logika Menu Honorarium** di luar label tombol + Panduan.
- **Kalimat legal & struktur dokumen cetak tidak diubah** — Sprint 003 hanya
  mengubah LOKASI render (layar vs cetak), bukan isi dokumen formal.
- Bukti wajib berupa output build/grep asli atau screenshot — **bukan klaim**.
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
        │                        { [menuId]: { title, steps: [{id,label,done(ctx),active(ctx)}] } }
        ▼
components/guide/MenuGuide.jsx (BARU) ── pill `? Panduan` + popover checklist
        │                                 non-modal · print:hidden · storage spj_guide_*
        ▼
pages/dashboard/DokumenSPJPage.jsx ── pasang <MenuGuide menuId=.../> di 4 menu
                                      + label tombol baru (rename)

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
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | 1, 2, 3 | sumber penerima (transport/mamin) · jalur preview → SummaryCard · handlePrint cetak 5-doc & mamin-full · rename tombol |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | 4 | pasang `<MenuGuide>` ×4 · label tombol di level halaman (bila ada) |
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
# ACCEPTANCE CRITERIA — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dari root proyek `D:\project\spj-app`. Bukti = output asli /
> screenshot, **bukan klaim** (AGENTS.MD).

---

## Task Gate (WAJIB sebelum kriteria sprint dinilai)

Sebelum kriteria mana pun dihakimi, Builder harus sudah menempel bukti DoD per task
(`BLUEPRINT.MD` §Task Breakdown): `npm run build` exit 0 per fase + grep per fase.
Task hot path (1.1/1.2/4.1) wajib membawa baris DSA yang konsisten dengan BLUEPRINT
(cek kehadiran). Gate akhir memverifikasi perilaku — tidak menggantikan gate per task.

## Definisi "Selesai"

Sprint ini **SELESAI** jika seluruh checklist tercentang **dan** seluruh test case
(T-01…T-10) lulus **dan** kedua edge case lulus.

---

## Checklist

- [ ] C-01 Tombol ter-rename jadi "Lihat Ringkasan" di semua menu; 0 sisa "Preview Dokumen" di `DokumenFormPreview.jsx` — BKUSidebar dikecualikan (T-02)
- [ ] C-02 Preview 4 tab Perjalanan Dinas = kartu ringkasan; 0 kop, 0 TTD (T-03)
- [ ] C-03 Preview Mamin/Pemeliharaan = kartu ringkasan (T-03)
- [ ] C-04 Cetak Semua Perjalanan Dinas = 5 dokumen kop→TTD (T-04, T-05)
- [ ] C-05 Cetak Semua Mamin = set lengkap hasil pemetaan dry run (T-06)
- [ ] C-06 Penerima transport & mamin = semua status; honor tetap honorer-only (T-07)
- [ ] C-07 Panduan hidup di 4 menu; sadar-state; auto-open/dismiss benar (T-08, T-09)
- [ ] C-08 Panduan `print:hidden` — tidak bocor ke cetak (T-08)
- [ ] C-09 MenuGuide config-driven (bukti tambah panduan via config saja) (T-09)
- [ ] C-10 Regresi: Honorarium alur utuh; 15 pola anti-hardcode = 0; 3 blok 0 `<input>` (T-10)
- [ ] C-11 Build sukses (T-01)
- [ ] C-12 `STATE.MD` + pack sprint diperbarui (task 5.4) — status & bukti tercatat

---

## Test Cases

### T-01 — Build sukses
- **Given** semua task selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0**, output berakhir `✓ built in …`; sebut versi runtime (`node -v`)
- **Bukti** output terminal asli

### T-02 — Tombol ter-rename (nama final: **"Lihat Ringkasan"**)
- **Given** Fase 1 selesai
- **When**
  ```bash
  grep -n "Preview Dokumen" spj-frontend/src/components/templates/DokumenFormPreview.jsx
  grep -rn "Lihat Ringkasan" spj-frontend/src
  ```
- **Then** grep-1 = **0 hasil**; grep-2 ≥ 1 hasil di lokasi tombol lama.
  Label `"Preview Dokumen Foto"` di `components/bku/BKUSidebar.jsx` **DIKECUALIKAN**
  (modul BKU di luar cakupan sprint — PUTUSAN user 2026-09-30)
- **Bukti** output grep

### T-03 — Jalur layar bebas kop & TTD
- **Given** preview dibuka untuk tab spt/sppd/resume/undangan dan Mamin
- **When** inspeksi jalur layar di `DokumenFormPreview.jsx`:
  `grep -n "renderPerRecipient" spj-frontend/src/components/templates/DokumenFormPreview.jsx`
  dan grep `KopSurat\|SignatureFooter` pada seksi `viewMode === 'preview'`
- **Then** `renderPerRecipient` **0 hasil**; 0 pemakaian `KopSurat`/`SignatureFooter` di
  jalur preview layar; UI menampilkan kartu label+nilai (screenshot)
- **Bukti** grep + screenshot preview 4 tab + Mamin

### T-04 — Cetak 5 dokumen Perjalanan Dinas
- **Given** penerima ≥1 terpilih, Data Sekolah & pejabat terisi
- **When** klik tombol cetak → print preview
- **Then** urutan dokumen: tabel Daftar Penerima → Surat Undangan → SPT → SPD →
  Resume/Notulen; tiap dokumen kop→TTD lengkap; A4; tidak terpotong antar halaman
- **Bukti** screenshot print preview berurutan + pembandingan dengan docx referensi

### T-05 — Cetak tetap formal meski layar ringkasan
- **Given** layar menampilkan kartu ringkasan (tanpa kop/TTD)
- **When** cetak dijalankan dari kondisi itu
- **Then** hasil CETAK tetap berisi kop surat & tanda tangan (formal) — layar ≠ cetak
- **Bukti** screenshot layar vs hasil cetak disandingkan

### T-06 — Set cetak Mamin lengkap
- **Given** dry run 1.3 menghasilkan tabel pemetaan docx ↔ config
- **When** klik cetak Mamin → print preview
- **Then** dokumen yang tercetak = **persis daftar hasil pemetaan** (usulan 5:
  undangan, pesanan, notulen, daftar hadir, buku tamu); tiap dokumen punya padanan
  config yang sudah ada — tanpa improvisasi
- **Bukti** tabel pemetaan + screenshot print preview

### T-07 — Penerima semua status
- **Given** Data Guru berisi pegawai PNS, PPPK, dan Honorer (≥1 masing-masing)
- **When** buka tab Daftar Penerima Perjalanan Dinas & Daftar Hadir Mamin
- **Then** ketiga status muncul di daftar pilihan; dan pada Menu Honorarium daftar
  tetap hanya honorer (screenshot 3 lokasi)
- **Bukti** screenshot + `grep -n "getSemuaPegawai" spj-frontend/src/components/templates/DokumenFormPreview.jsx` ≥ 2 cabang (transport, mamin/pemeliharaan)

### T-08 — Panduan hidup & tidak bocor cetak
- **Given** 4 menu terpasang MenuGuide
- **When** (a) buka tiap menu pertama kali → popover auto-terbuka berisi langkah;
  (b) ubah state (pilih penerima) → langkah terkait tercentang, aktif pindah;
  (c) klik "Selesai — jangan tampilkan lagi" → reload → tidak auto-open, ikon `?` tetap ada;
  (d) jalankan print preview dokumen apa pun dengan popover TERBUKA
- **Then** (a–c) perilaku sesuai + badge progres akurat; (d) popover & pill TIDAK
  ikut tercetak
- **Bukti** screenshot tiap perilaku + `grep -n "print:hidden" spj-frontend/src/components/guide/MenuGuide.jsx spj-frontend/src/data/guideConfig.js` ≥ 1 di komponen

### T-09 — Config-driven terbukti
- **Given** `guideConfig.js` berisi panduan 4 menu
- **When** tambah 1 entri panduan menu LAIN via config saja (uji sementara, di-revert setelah terbukti)
- **Then** pill+popover muncul di menu itu tanpa perubahan satu baris pun di
  `MenuGuide.jsx` (`git diff --stat components/guide/` kosong saat uji)
- **Bukti** screenshot + `git diff --stat`

### T-10 — Regresi & gate warisan
- **Given** seluruh fase selesai
- **When** jalankan kanonik:
  ```bash
  grep -rniE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|197405082014121002|197912222014121003|198507172020121003|196607071986102005|197607242022212011|SD NEGERI LEBAKLEUNGSIR|20212345|20228636|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src
  grep -nE "<input|<textarea" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx
  git diff 264c431..HEAD --stat -- spj-frontend/src/components/templates/blocks/KopSurat.jsx spj-frontend/src/components/templates/blocks/KopGugus.jsx spj-frontend/src/components/templates/blocks/SignatureFooter.jsx spj-frontend/src/components/templates/blocks/SKHonorer.jsx spj-frontend/src/utils/sekolahData.js spj-frontend/src/utils/signatureRoles.js
  ```
- **Then** grep-1 = **0 hit**; grep-2 = **0 hasil**; git diff Sprint 003 **menambah 0**
  perubahan pada file warisan (bandingkan terhadap HEAD sebelum sprint)
- **And** alur Honorarium (form → tab SK Honorer → cetak) berperilaku sama seperti
  sebelum sprint (uji manual 2 kondisi data: kosong & terisi)
- **Bukti** output grep + git diff + screenshot Honorarium

---

## Edge Case Scenarios

### E-1 — Form kosong total (empty input)
localStorage bersih (`spj_` dihapus semua), buka Perjalanan Dinas.
**Harapan:** kartu ringkasan tampil dengan nilai kosong (tanpa crash); `PeringatanData`
muncul; Panduan langkah pertama aktif (`0/N`); pencetakan tetap bisa dijalankan dan
menghasilkan dokumen kop/TTD **kosong** (bukan nama orang lain).

### E-2 — Data parsial (partial data)
Hanya 1 penerima tanpa NIP terpilih; pejabat hanya `ks` terisi.
**Harapan:** penerima tanpa NIP tetap terpilih & tampil (key fallback utuh); TTD hanya
terisi peran yang ada; Panduan menandai langkah nomor surat aktif, bukan langkah penerima.

---

## Output yang Bisa Didemonstrasikan

1. Buka Perjalanan Dinas → klik tombol baru (eks "Preview Dokumen") → kartu ringkasan
   TANPA kop/TTD di 4 tab + Mamin.
2. Klik cetak → 5 dokumen formal berurutan kop→TTD (Perjalanan Dinas); set lengkap
   Mamin sesuai pemetaan.
3. Daftar penerima memuat PNS/PPPK/Honorer; Honorarium tetap honorer-only.
4. Pill `? Panduan` di 4 menu → popover checklist yang centangnya mengikuti state;
   auto-open sekali; dismiss permanen; tidak ikut tercetak.
5. Semua gate grep & build lulus dengan output asli.

> **Bukan cakupan sprint ini:** perubahan alur Honorarium, modul BKU, backend,
> panduan di halaman lain, refactor file legacy.
# HANDOFF PROMPT — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ.

PRASYARAT — periksa DULU sebelum apa pun:
Sprint 001 + 002 sudah APPROVED 2026-09-30. Verifikasi cepat:
  ls planning/sprints/sprint-001/VERIFICATION-REPORT.MD planning/sprints/sprint-002/VERIFICATION-REPORT.MD
  grep -n "getSignatureRoles" spj-frontend/src/utils/signatureRoles.js
  grep -rnE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|SD NEGERI LEBAKLEUNGSIR" spj-frontend/src
  ls spj-frontend/src/components/templates/blocks/PeringatanData.jsx
Grep nama wajib 0 baris; kedua VERIFICATION-REPORT wajib ada. Bila tidak → BERHENTI, laporkan.

BOOTSTRAP (deterministik — jangan improvisasi):
  cd spj-frontend && npm ci && npm run build
Harapan: exit 0, output berakhir "✓ built in …". Bila gagal → berhenti, laporkan.
Dev server (opsional, untuk inspeksi): cd spj-frontend && npm run dev → http://localhost:5173
⚠️ npm ci di beberapa sandbox menghapus @esbuild/win32-x64 — bila build gagal setelah
npm ci, pulihkan: npm install @esbuild/win32-x64 --no-save (pola Sprint 001).

LANGKAH WAJIB — baca berurutan:
1. planning/sprints/sprint-003/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-003/BLUEPRINT.MD      — bagaimana (file, task, DoD, DSA)
3. planning/sprints/sprint-003/ACCEPTANCE.MD     — kriteria selesai + test case
4. planning/sprints/sprint-002/BLUEPRINT.MD      — kontrak print-area (jangan diubah)
5. AGENTS.MD · STATE.MD · CONSTITUTION.md · DECISIONS.MD
6. fix-template-document.md (root repo)          — feedback user yang memicu sprint ini

LALU:
7.  DRY RUN — termasuk DRY RUN MAMIN (task 1.3): ekstrak struktur SEMUA docx Mamin
    di folder template/ → buat tabel pemetaan docx ↔ config ↔ data. Gap dilaporkan,
    JANGAN diimprovisasi.
8.  Laporkan rencana: file disentuh, task, hasil pemetaan Mamin, risiko.
    Nama tombol final SUDAH PUTUS (2026-09-30): "Lihat Ringkasan" — pakai, JANGAN
    ditanyakan lagi. "Preview Dokumen Foto" (BKUSidebar) dikecualikan dari grep T-02.
9.  TUNGGU persetujuan user sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan dry run
- Mengubah requirements (pertanyaan → QUESTIONS.MD, jangan asumsi)
- Menyentuh file di luar daftar BLUEPRINT.MD
- Mengubah isi/blok cetak warisan: blocks/SuratTugas.jsx · SPDForm.jsx ·
  SuratUndangan.jsx · KopSurat.jsx · KopGugus.jsx · SignatureFooter.jsx ·
  SKHonorer.jsx · utils/sekolahData.js · signatureRoles.js · pejabatRoles.js ·
  TemplateEngine.jsx (wilayah Sprint 001/002 — APPROVED)
- Mengubah alur/logika Menu Honorarium (hanya label tombol + pasang Panduan)
- Memakai library di luar BLUEPRINT.MD (0 dependency baru; versi ter-pin)
- Mengubah prefix localStorage `spj_` atau skema key yang ada
- Memparafrase dokumen cetak — struktur & kalimat warisan Sprint 002 utuh
- Memecah file legacy (DokumenFormPreview.jsx / templateConfig.js)
- Mengklaim hasil tanpa bukti (output build/grep asli atau screenshot)

SETUJU:
- Setelah dry run disetujui → kerjakan task urut Fase 1 → 5
- Setiap task: jalankan DoD (build/grep), tempel output sebagai bukti
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- Jalankan `npm run build` di gate tiap fase + gate akhir
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 003 |
| Prasyarat | Sprint 001 + 002 APPROVED 2026-09-30 |
| User story | US-19 … US-30 |
| Jumlah task | **23 task** (Fase 1–5), tiap task 2–5 menit |
| File baru | **3** (`MenuGuide.jsx`, `guideConfig.js`, `SummaryCard.jsx`) |
| File diubah | 3–4 (`honorHelper.js`, `DokumenFormPreview.jsx`, `DokumenSPJPage.jsx`, `templateConfig.js` bila gap) |
| Dependency baru | **0** |
| Gate build | per fase + gate akhir |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 |
| Perkiraan urutan commit | 1) penerima+rename 2) kartu ringkasan 3) set cetak 4) panduan 5) regresi+gate |
| Keputusan user (PUTUS 2026-09-30) | nama tombol = **"Lihat Ringkasan"** · Pemeliharaan = **pola saja** · sisa dry run: pemetaan Mamin (task 1.3) |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen **konteks segar** (AGENTS.MD)
2. `/security-dependency-auditor` — npm audit sebelum rilis (CONSTITUTION.md)
3. `/state-keeper` — tutup loop
4. Kembali ke `/sprint-planner` untuk sprint berikutnya

## Peringatan untuk Builder

⚠️ **Ini sprint perubahan PERILAKU, bukan sekadar tampilan:** lapisan yang semula
merender dokumen formal di layar diganti kartu ringkasan. Jangan menghapus fungsi
builder data (`buildSptData`/`buildSppdData`/`resumeData`/undangan) — mereka tetap
dipakai jalur CETAK. Yang berubah adalah SIAPA yang merender di LAYAR.

⚠️ **Batas tegas 3 sprint berjajar:** 001 = sumber nilai · 002 = struktur & layout ·
003 = lapisan preview & panduan. Menyentuh blok cetak warisan = regresi yang menjebol
gate warisan (15 pola + `<input>` + git-diff konsumen).

⚠️ **Panduan wajib non-modal & print:hidden.** Popover yang menutupi form, atau
muncul di hasil cetak, = gagal US-26/US-30. Auto-open hanya kunjungan pertama per
menu — muncul terus setelah dismiss = gagal US-28.

⚠️ **DRY RUN MAMIN (task 1.3) menentukan Fase 3.** Tanpa pemetaan docx↔config yang
disetujui user, set cetak Mamin tidak boleh dikodekan — gap diimprovisasi = pelanggaran.
