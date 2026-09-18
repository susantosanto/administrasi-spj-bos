# BLUEPRINT — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4). Isi = **BAGAIMANA** saja.
> "Apa & mengapa" → `REQUIREMENTS.MD`. Kriteria uji → `ACCEPTANCE.MD`.
>
> Dependency **ter-pin eksak** (Bab 17.2 — jangan `^`). Memenuhi temuan **F8**
> (`docs/SECURITY-AUDIT-001.md` §5). Tech stack **tidak dipilih ulang** — terkunci ADR.

---

## Prasyarat & Ketergantungan

> ⚠️ **Sprint ini TIDAK BOLEH dimulai sebelum Sprint 001 selesai.**

| Kontrak dari Sprint 001 | Dipakai untuk |
|---|---|
| `getSchoolData()` (tanpa fallback) | kop SPT/SPD/Undangan |
| `getPejabat(role)` / `getPejabatStatus()` | blok TTD + bahan peringatan |
| `getSignatureRoles()` (dibaca saat render) | blok TTD |
| `PEJABAT_ROLES` (6 peran) | form & preview |
| `blocks/PeringatanData.jsx` | banner peringatan di tab |
| `blocks/KopSurat.jsx` + `blocks/KopGugus.jsx` (data-driven + logo) | print-area kop → TTD |

- **File yang juga disentuh Sprint 001:** `DokumenFormPreview.jsx` (titik pemasangan
  peringatan). Sprint 002 memecah tab/form/print-area file itu — **setelah** Sprint 001.
- **Penerus:** tidak ada. Sprint 002 menutup rangkaian "Rework Modul Perjalanan Dinas".

## Arsitektur Sistem

```
data/templateConfig.js ────────────► definisi template (judul · orientation · blocks)
        │                             ← hapus config `surat_tugas`
        ▼
components/templates/DokumenFormPreview.jsx   ← file utama sprint ini (1847 baris, legacy)
        ├── TAB "daftar"     → tabel dokumen
        ├── TAB spt/sppd/undangan
        │     ├── mode FORM  → editor data  (tanpa kop & TTD)
        │     └── mode PRINT → dokumen formal (kop → TTD) di print-area
        └── <PeringatanData />  ← dari Sprint 001 (mode layar saja)
                    │
                    ▼
        blocks/SuratTugas.jsx · SPDForm.jsx · SuratUndangan.jsx
        → blok cetak MURNI (tidak merender <input>)
        blocks/KopSurat.jsx · KopGugus.jsx · SignatureFooter.jsx
        → dari Sprint 001 (data-driven, tanpa hardcode)

pages/dashboard/DokumenSPJPage.jsx ─► reset bersih data lama (spj_dokumen_lpj)
```

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Runtime | Node.js **v22.22.2** (npm **10.9.7**) |
| UI | React **18.3.1** + React DOM **18.3.1** |
| Routing | react-router-dom **6.30.4** |
| Build | Vite **5.4.21** + @vitejs/plugin-react **4.7.0** |
| Styling | Tailwind CSS **3.4.19** + postcss **8.5.16** + autoprefixer **10.5.2** |
| Ikon | lucide-react **0.344.0** (Material Symbols via font) |
| Excel | xlsx **0.18.5** ⚠️ lihat catatan |
| PDF | pdfjs-dist **4.10.38** |
| AI client | @heyputer/puter.js **2.5.4** |
| Bahasa | JavaScript ES modules + JSX (bukan TypeScript) |

## File yang Akan Dibuat

**Tidak ada file baru.** Sprint ini murni menyelaraskan file yang sudah ada.

> Bila sebuah task menuntut komponen baru, komponen itu **wajib** diekstrak ke file
> tersendiri di `components/templates/blocks/` — dilarang menambah panjang file legacy
> secara signifikan.

## File yang Akan Diubah

| File | Fase | Sifat perubahan |
|---|---|---|
| `spj-frontend/src/components/templates/DokumenFormPreview.jsx` | 1, 2, 3 | hapus tab `surat_tugas` · susun form · pisahkan dua wajah |
| `spj-frontend/src/data/templateConfig.js` | 1, 2 | hapus config `surat_tugas` · sesuaikan field |
| `spj-frontend/src/components/templates/blocks/SuratTugas.jsx` | 3, 4 | hapus `<input>` · print-area kop → TTD |
| `spj-frontend/src/components/templates/blocks/SPDForm.jsx` | 3, 4 | hapus `<input>` · tambah 3 blok resmi |
| `spj-frontend/src/components/templates/blocks/SuratUndangan.jsx` | 3, 4 | hapus `<input>` · 2 paragraf + Tembusan + TTD Ketua Gugus |
| `spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx` | 5 | reset bersih data lama |

> **DILARANG** menyentuh file di luar daftar ini (AGENTS.MD — jangan refactor di luar cakupan).
> Khususnya **DILARANG** menyentuh `utils/sekolahData.js`, `utils/signatureRoles.js`,
> `utils/pejabatRoles.js`, `blocks/KopSurat.jsx`, `blocks/KopGugus.jsx`,
> `blocks/SignatureFooter.jsx` — itu wilayah Sprint 001 dan sudah selesai.

## Dependensi (versi ter-pin eksak)

> Format Bab 17.2: **eksak, tanpa `^`**. Nilai = versi terpasang di `package-lock.json`
> (`lockfileVersion: 3`). **Dilarang menaikkan/menambah** tanpa ADR.

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

⚠️ **Pengecualian diketahui:** `xlsx@0.18.5` — temuan **F1 TINGGI** (prototype pollution
GHSA-4r6h-8v6p-xvw6 + ReDoS GHSA-5pgg-2g8v-p4x9, **tanpa fix**). Keputusan masih OPEN di
`QUESTIONS.MD`. Mitigasi: parsing **hanya** atas file yang dipilih user. **Wajib selesai
sebelum deploy publik pertama.** Versi tidak boleh diubah di sprint ini.

## Task Breakdown (2–5 menit per task)

### FASE 1 — Konsolidasi tab

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 1.1 | Hapus `surat_tugas` dari `TRANSPORT_FORM_TABS` | `DokumenFormPreview.jsx` | 2 m |
| 1.2 | Hapus blok preview `previewTab === 'surat_tugas'` | `DokumenFormPreview.jsx` | 2 m |
| 1.3 | Hapus config `surat_tugas` | `data/templateConfig.js` | 2 m |
| 1.4 | Verifikasi: `grep -rn "surat_tugas" spj-frontend/src` → 0 hasil | — | 2 m |

### FASE 2 — Form SPT / SPD / Undangan

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 2.1 | Form SPT: susun field sesuai urutan dokumen (nomor → penandatangan → penerima → Untuk → hari/tgl/tempat) | `DokumenFormPreview.jsx` | 5 m |
| 2.2 | Form SPD: field butir 1–10 | `DokumenFormPreview.jsx` | 5 m |
| 2.3 | Form SPD: field blok verifikasi (SPD Nomor, Berangkat dari, Ke, Pada tanggal, 4× "Tiba di") | `DokumenFormPreview.jsx` | 5 m |
| 2.4 | Form SPD: Pengikut multi-baris (tambah/hapus) | `DokumenFormPreview.jsx` | 5 m |
| 2.5 | Form Undangan: paragraf penutup 1 & 2 + Tembusan multi-baris | `DokumenFormPreview.jsx` | 5 m |
| 2.6 | Form Undangan: `sifat` default `"-"` | `DokumenFormPreview.jsx` | 2 m |

### FASE 3 — Pemisahan dua wajah

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 3.1 | Hapus render `<input>` di mode edit | `blocks/SuratTugas.jsx` | 4 m |
| 3.2 | Hapus render `<input>` di mode edit | `blocks/SPDForm.jsx` | 4 m |
| 3.3 | Hapus render `<input>` di mode edit | `blocks/SuratUndangan.jsx` | 4 m |
| 3.4 | Pastikan preview tab tidak merender kop & TTD | `DokumenFormPreview.jsx` | 3 m |

### FASE 4 — Print-area

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 4.1 | Print SPT: kop → TTD 2 kolom, urutan sesuai dokumen | `blocks/SuratTugas.jsx` | 5 m |
| 4.2 | Print SPD: tambah blok **"Telah diperiksa dengan keterangan…"** (kalimat persis dokumen sumber) | `blocks/SPDForm.jsx` | 4 m |
| 4.3 | Print SPD: tambah blok **"Catatan Lain-Lain"** | `blocks/SPDForm.jsx` | 3 m |
| 4.4 | Print SPD: tambah blok **"PERHATIAN :"** (tanggungjawab Keuangan Daerah) | `blocks/SPDForm.jsx` | 3 m |
| 4.5 | Print SPD: cegah tabel terpotong antar halaman | `blocks/SPDForm.jsx` | 4 m |
| 4.6 | Print Undangan: 2 paragraf penutup terpisah | `blocks/SuratUndangan.jsx` | 3 m |
| 4.7 | Print Undangan: Tembusan sebagai list decimal bernomor | `blocks/SuratUndangan.jsx` | 3 m |
| 4.8 | Print Undangan: TTD Ketua Gugus dari `pejabat.ketuaGugus` | `blocks/SuratUndangan.jsx` | 3 m |
| 4.9 | Verifikasi A4 + satuan `mm` + `orientation` untuk ketiga dokumen | print CSS / `templateConfig.js` | 4 m |

### FASE 5 — Reset data & gate akhir

| ID | Task | File disentuh | Estimasi |
|---|---|---|---|
| 5.1 | Reset bersih data Perjalanan Dinas lama (tanpa migrasi; **jangan** sentuh `spj_data_sekolah`) | `DokumenSPJPage.jsx` | 4 m |
| 5.2 | Regresi 6 konsumen × 2 kondisi data (warisan guard Sprint 001) | — | 5 m |
| 5.3 | **GATE AKHIR:** build + smoke-test + test cetak 3 dokumen | — | 5 m |
| 5.4 | Perbarui `STATE.MD` + pack sprint + tutup loop | — | 4 m |

### Jalur kritis

```
FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5
```

## Anggaran Panjang File

Batas `CONSTITUTION.md`: komponen **300** · utility **200** · config **150** baris.

| File | Baris (terukur 2026-09-14) | Catatan |
|---|---|---|
| `DokumenFormPreview.jsx` | **1847** | ⚠️ legacy 6× batas — pemecahan penuh **di luar cakupan** |
| `data/templateConfig.js` | **993** | ⚠️ legacy 6,6× batas — idem |
| `blocks/SuratTugas.jsx` | — | wajib ≤ 300 |
| `blocks/SPDForm.jsx` | — | wajib ≤ 300 |
| `blocks/SuratUndangan.jsx` | — | wajib ≤ 300 |

**Kebijakan:** DILARANG menambah panjang kedua file legacy secara signifikan — kode baru
diekstrak ke file komponen tersendiri. File baru wajib patuh batas.
