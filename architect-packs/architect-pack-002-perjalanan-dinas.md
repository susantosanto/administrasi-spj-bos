# ARCHITECT PACK — Sprint 002: Rework Modul Perjalanan Dinas

> **Salinan audit trail** (Bab 8.5). Sumber asli: `planning/sprints/sprint-002/`.
> Dibuat: 2026-09-14 · Disusun mengikuti metode Bab 8.4 (4 dokumen).
> Isi 4 dokumen: REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT.


---

# REQUIREMENTS — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4). Isi = **APA & MENGAPA** saja.
> Detail teknis ("bagaimana") → `BLUEPRINT.MD`. Kriteria uji → `ACCEPTANCE.MD`.
> Prompt builder → `HANDOFF-PROMPT.MD`.
>
> Sumber requirement lengkap: `PRD.md` (**di `planning/sprints/sprint-001/`** — PRD adalah
> umbrella untuk dua sprint; lihat ADR pemecahan sprint di `DECISIONS.MD`).
> Sprint ini memakai **US-01 … US-10** dan **US-12** (+ US-11 sebagian, + regresi US-16).
> Dokumen sumber format: `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`.
>
> ⚠️ **Prasyarat wajib:** **Sprint 001 harus sudah selesai.** Sprint ini memakai
> `getSignatureRoles()`, `getPejabat()`, `getPejabatStatus()`, `PEJABAT_ROLES`,
> `mergePejabat()`, dan `blocks/PeringatanData.jsx` — semuanya **belum ada** sebelum
> Sprint 001 selesai. Jangan mulai sprint ini lebih dulu.

---

## Tujuan Sprint

Menyelaraskan modul **Perjalanan Dinas** dengan dokumen sumber, sehingga setiap tab
menampilkan dan meng-CRUD **struktur data yang benar** dan hasil cetaknya **sama persis**
dokumen resmi — dengan pemisahan tegas antara **tab = tampilan data** dan
**print-area = dokumen formal**.

## Apa yang Dibangun

1. **Satu dokumen = satu tab.** Tab "Surat Tugas" dihapus (dokumen sumber tidak memilikinya).
2. **Form SPT, SPD, dan Undangan** yang field-nya memetakan ke elemen dokumen sumber.
3. **Print-area A4 lengkap** untuk ketiga dokumen — dari kop surat sampai tanda tangan.
4. **Tab = tampilan data** (tanpa kop & TTD); **print-area = dokumen formal**.
   Dua wajah yang benar-benar terpisah.
5. **Tiga blok resmi SPD yang hilang** ditambahkan: *"Telah diperiksa dengan keterangan…"*,
   *"Catatan Lain-Lain"*, dan *"PERHATIAN :"* — kalimat persis dokumen sumber.
6. **Tanda tangan Undangan = Ketua Gugus** (dari `pejabat.ketuaGugus`), bukan Kepala Sekolah.
7. **Kertas A4, satuan `mm`, orientasi** dari konfigurasi template untuk ketiga dokumen.
8. **Reset bersih** data Perjalanan Dinas lama (tanpa fungsi migrasi).

## Mengapa

- **Dua tab menghasilkan dokumen identik.** Operator melihat pilihan "Surat Perintah Tugas"
  dan "Surat Tugas" yang isinya sama, dan bingung mana yang benar. Dokumen sumber hanya
  memuat 3 dokumen: Undangan, SPT, SPD. Tab `surat_tugas` memakai data builder & config yang
  sama dengan `spt` — beda hanya `judul` (terbukti di `DokumenFormPreview.jsx:1786-1791`
  + `templateConfig.js:306-358`).
- **Dokumen cetak tidak lengkap.** SPD kehilangan 3 blok resmi yang wajib ada di dokumen
  pertanggungjawaban — dokumen yang dicetak saat ini **tidak sah** sebagai bukti.
- **Dokumen bisa tercetak dengan nama orang lain.** Tab Perjalanan Dinas merender blok cetak
  dalam `mode="print"`, tetapi blok itu juga merender `<input>` saat `mode === 'edit'`
  (`blocks/SuratTugas.jsx`, `blocks/SPDForm.jsx`) — melanggar konsep "2 wajah".
- **Ketua Gugus salah orang.** Undangan gugus ditandatangani Kepala Sekolah, padahal menurut
  dokumen sumber Ketua Gugus orang yang berbeda.
- **State lama akan tercampur.** Skema berubah (tab dihapus, struktur SPD/Undangan
  diselaraskan) sehingga data lama membingungkan bila dibiarkan.

## Pengguna

| Persona | Peran dalam sprint ini |
|---|---|
| **Operator Sekolah** (primer) | Menyusun & mencetak SPT, SPD, Undangan |
| **Bendahara Sekolah** (primer) | Menyiapkan dokumen pertanggungjawaban, memastikan pembebanan anggaran benar |
| **Kepala Sekolah** (sekunder) | Menandatangani SPT/SPD; memastikan nama & NIP-nya benar |
| **Ketua Gugus** (sekunder) | Menandatangani Surat Undangan gugus |

## Data Sumber

| Sumber | Isi yang dipakai |
|---|---|
| `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx` | Format baku 3 dokumen: SURAT UNDANGAN, SURAT PERINTAH TUGAS, SURAT PERJALANAN DINAS (SPD) — termasuk kalimat resmi yang harus disalin **persis** |
| Data Sekolah → identitas, logo, pejabat (**sudah data-driven dari Sprint 001**) | Kop surat, kop gugus, blok tanda tangan |
| Penyimpanan lokal browser (prefix `spj_`) | Seluruh data — tanpa backend |

## Output yang Diharapkan

- Halaman detail Perjalanan Dinas dengan tab: daftar, SPT, SPD, Undangan
  (**tanpa** tab Surat Tugas).
- Form CRUD untuk tiap dokumen yang field-nya sepadan dengan elemen dokumen sumber.
- Hasil cetak A4 untuk SPT, SPD, dan Undangan — lengkap kop sampai TTD, sama persis
  dokumen sumber.
- Blok cetak **murni** — nol `<input>` di ketiga file blok cetak.
- Data lama Perjalanan Dinas di-reset bersih (tanpa migrasi).

## Cakupan User Story

| US | Judul | Fase |
|---|---|---|
| US-01 | Konsolidasi tab: hapus tab "Surat Tugas" | Fase 1 |
| US-02 | Form SPT sesuai struktur dokumen referensi | Fase 2 |
| US-03 | Form SPD sesuai struktur dokumen referensi | Fase 2 |
| US-04 | Form Undangan sesuai struktur dokumen referensi | Fase 2 |
| US-05 | Dua wajah benar-benar terpisah untuk 3 dokumen | Fase 3 |
| US-06 | Print-area SPT lengkap kop → TTD | Fase 4 |
| US-07 | Print-area SPD lengkap kop → TTD (+ 3 blok hilang) | Fase 4 |
| US-08 | Print-area Undangan lengkap kop → TTD | Fase 4 |
| US-09 | Field "Sifat" pada Undangan dipertahankan dengan default `"-"` | Fase 2 |
| US-10 | Kertas A4, satuan mm, orientasi dari config | Fase 4 |
| US-12 | Reset bersih data lama (tanpa migrasi) | Fase 5 |
| US-11 | Blue-only pada modul yang disentuh (**sebagian**) | Fase 1–4 |
| US-16 | Guard regresi `sekolahData.js` (**warisan** — dijalankan ulang sebagai gate) | Fase 5 |

> **Bukan cakupan sprint ini:** US-13 … US-18 (fondasi data, pejabat, kop, peringatan) →
> sudah selesai di Sprint 001.

## Batasan

- **Prasyarat:** Sprint 001 selesai. Dilarang mulai sebelum kontrak fungsinya ada.
- **Tanpa backend.** Data tetap di localStorage prefix `spj_` — prefix tidak boleh diubah.
- **Stack terkunci ADR**: React 18 + Vite + Tailwind CSS. **Tidak boleh** memilih ulang stack.
- **Tanpa dependency baru** — hanya yang terdaftar di `BLUEPRINT.MD` (versi ter-pin).
- **Warna UI blue-only** `#004ac6` + slate (pengecualian: indikator status di layar,
  tidak pernah ikut cetak).
- **Kertas A4 wajib**, satuan `mm`, orientasi dari konfigurasi template.
- **Dilarang refactor di luar cakupan sprint** (aturan AGENTS.MD). File legacy besar
  (`DokumenFormPreview.jsx` 1847 baris, `templateConfig.js` 993 baris) **tidak dipecah**.
- **Kalimat legal harus persis** dokumen sumber, bukan parafrase (blok SPD).
- **Di luar cakupan**: dokumen "Surat Tugas", Resume/notulen rapat, backend/API, migrasi data
  lama, migrasi TypeScript, pemasangan ESLint/Prettier/Vitest, dan perbaikan temuan keamanan
  F1–F9 (`docs/SECURITY-AUDIT-001.md`).
- Bukti wajib berupa output build/test asli atau screenshot — **bukan klaim**.


---

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


---

# ACCEPTANCE CRITERIA — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Setiap kriteria dalam bentuk
> **Given/When/Then** + **perintah yang dijalankan** + **output yang diharapkan**.
> Kriteria yang tidak bisa dipetakan ke perintah + output harus ditulis ulang.
>
> Semua perintah dijalankan dari root proyek `D:\project\spj-app` kecuali disebut lain.
> Bukti = output asli / screenshot, **bukan klaim** (AGENTS.MD).

---

## Definisi "Selesai"

Sprint ini dianggap **SELESAI** jika **seluruh** checklist di bawah tercentang
**dan** seluruh test case (T-01 … T-11) lulus **dan** kedua skenario edge case lulus
**dan** Sprint 001 sudah selesai (prasyarat).

---

## Checklist

- [ ] C-01 Tab "Surat Tugas" hilang; tidak ada referensi tersisa (T-02)
- [ ] C-02 Form SPT, SPD, Undangan memetakan elemen dokumen sumber (T-03)
- [ ] C-03 Print-area SPT/SPD/Undangan lengkap kop → TTD (T-06, T-07)
- [ ] C-04 Tab = data saja; blok cetak tidak merender `<input>` (T-04)
- [ ] C-05 Print-area SPD memuat 3 blok resmi yang hilang, kalimat persis (T-05)
- [ ] C-06 TTD Undangan memakai Ketua Gugus (T-07)
- [ ] C-07 A4 + satuan `mm` + `orientation` benar untuk ketiga dokumen (T-08)
- [ ] C-08 Data lama Perjalanan Dinas di-reset bersih, tanpa migrasi (T-09)
- [ ] C-09 Warna blue-only pada file yang disentuh (T-10)
- [ ] C-10 Regresi 6 konsumen existing lulus (T-11)
- [ ] C-11 `npm run build` sukses (T-01)
- [ ] C-12 `STATE.MD` + pack sprint diperbarui

---

## Test Cases

### T-01 — Build sukses
- **Given** perubahan kode selesai
- **When** `cd spj-frontend && npm run build`
- **Then** exit code **0** dan output berakhir dengan `✓ built in …`
- **Bukti** tempel output terminal asli

### T-02 — Tab "Surat Tugas" benar-benar hilang
- **Given** konsolidasi tab selesai
- **When** `grep -rn "surat_tugas" spj-frontend/src`
- **Then** **0 hasil** (perintah mengembalikan kosong)
- **Bukti** output grep

### T-03 — Form memetakan elemen dokumen sumber
- **Given** tab form SPT, SPD, dan Undangan terbuka
- **When** setiap field form dibandingkan satu per satu dengan elemen dokumen sumber
  (`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`)
- **Then** setiap elemen dokumen punya field padanan; tidak ada field tanpa padanan
  (kecuali `sifat` — lihat REQUIREMENTS)
- **Bukti** tabel pemetaan field ↔ elemen + screenshot tiap form

### T-04 — Blok cetak tidak merender input
- **Given** pemisahan dua wajah selesai
- **When** `grep -n "<input" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx`
- **Then** **0 hasil** pada ketiga file
- **Bukti** output grep

### T-05 — Print-area SPD memuat 3 elemen yang hilang
- **Given** SPD terisi
- **When** print preview dibuka
- **Then** muncul ketiga blok: **"Telah diperiksa dengan keterangan bahwa perjalanan tersebut
  atas perintah pejabat yang berwenang…"**, **"Catatan Lain-Lain"**, dan **"PERHATIAN :"** —
  kalimat **persis** dokumen sumber
- **Bukti** screenshot print-preview disandingkan dengan halaman docx

### T-06 — Print-area SPT lengkap kop → TTD
- **Given** identitas sekolah & pejabat terisi
- **When** print preview SPT dibuka
- **Then** urutan elemen sesuai dokumen sumber: kop (identitas + logo) → judul/nomor →
  isi → TTD 2 kolom; **tidak** ada elemen yang hilang maupun berlebih
- **Bukti** screenshot print-preview disandingkan dengan halaman docx

### T-07 — Print-area Undangan: paragraf, Tembusan, TTD Ketua Gugus
- **Given** `pejabat.ketuaGugus` terisi, `pejabat.ks` terisi nama BERBEDA
- **When** print preview Undangan dibuka
- **Then** (a) dua paragraf penutup tampil terpisah, (b) **Tembusan** tampil sebagai list
  decimal bernomor, (c) blok TTD menampilkan **Ketua Gugus**, bukan Kepala Sekolah
- **Bukti** screenshot

### T-08 — A4, satuan mm, orientasi dari config
- **Given** ketiga dokumen siap cetak
- **When** print preview dibuka untuk SPT, SPD, dan Undangan
- **Then** ukuran kertas **A4**, satuan `mm`, kelas orientasi sesuai
  `templateConfig.js → orientation`; tidak ada elemen terpotong di batas halaman
- **Bukti** screenshot print-preview + nilai `orientation` tiap config

### T-09 — Reset bersih data lama
- **Given** `spj_dokumen_lpj` memuat data bentuk LAMA
- **When** reset dijalankan
- **Then** data Perjalanan Dinas lama hilang **tanpa** fungsi migrasi, dan
  **`spj_data_sekolah` TIDAK ikut terhapus**
- **Bukti** output `localStorage` sebelum & sesudah

### T-10 — Blue-only pada file yang disentuh
- **Given** file yang disentuh sprint ini
- **When** `grep -rn "emerald\|amber\|violet\|rose\|cyan" spj-frontend/src/components/templates/blocks/SuratTugas.jsx spj-frontend/src/components/templates/blocks/SPDForm.jsx spj-frontend/src/components/templates/blocks/SuratUndangan.jsx spj-frontend/src/pages/dashboard/DokumenSPJPage.jsx`
- **Then** tidak ada kelas warna terlarang untuk elemen **non-status**
  (pengecualian sah: indikator status di layar, mis. banner peringatan merah)
- **Bukti** output grep + penjelasan tiap sisa kemunculan

### T-11 — Regresi 6 konsumen (warisan guard Sprint 001)
- **Given** Sprint 002 selesai
- **When** render: `blocks/KopSurat.jsx`, `blocks/SignatureFooter.jsx`, `blocks/SKHonorer.jsx`,
  `blocks/InfoKeuangan.jsx`, `dokumentasi/DokumentasiAIGenerate.jsx`, `utils/signatureRoles.js`
  — masing-masing pada kondisi data **terisi** dan **kosong**
- **Then** 12 kombinasi ter-render tanpa error; tidak ada nama orang lain muncul saat data kosong
- **Bukti** screenshot tiap konsumen (2 kondisi)

---

## Edge Case Scenarios

### E-1 — Data sekolah benar-benar kosong (empty input)
`localStorage` dibersihkan total (semua key `spj_` dihapus), lalu buka halaman detail
Perjalanan Dinas.
**Harapan:** tidak ada crash, tab tetap berfungsi, peringatan merah tampil, dokumen
tercetak dengan kop & TTD **kosong** (bukan nama orang lain).

### E-2 — Data parsial (partial data)
Hanya `namaSekolah` terisi; `allFields` kosong; `pejabat` hanya `ks` terisi.
**Harapan:** kop menampilkan nama sekolah saja (alamat/email kosong tanpa placeholder aneh),
TTD hanya terisi untuk peran yang ada, peringatan merah menyebut **hanya** peran yang kosong.

---

## Output yang Bisa Didemonstrasikan

1. Buka dokumen Perjalanan Dinas → tab **SPT / SPD / Undangan** → isi form
   → **print preview** → dokumen A4 lengkap dari kop sampai TTD.
2. Bandingkan tiap print preview berdampingan dengan halaman docx sumber
   (`template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`) — elemen & kalimat cocok.
3. Tunjukkan SPD memuat ketiga blok resmi yang sebelumnya hilang.
4. Tunjukkan Undangan ditandatangani **Ketua Gugus**, bukan Kepala Sekolah.
5. Tunjukkan tidak ada tab "Surat Tugas" dan tidak ada `<input>` di blok cetak.
6. Jalankan reset → data Perjalanan Dinas lama bersih, Data Sekolah tetap utuh.

> **Bukan cakupan sprint ini:** fondasi data, kop berlogo, peringatan merah, halaman
> Data Sekolah → diuji di `planning/sprints/sprint-001/ACCEPTANCE.MD`.


---

# HANDOFF PROMPT — Sprint 002: Rework Modul Perjalanan Dinas

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 002: Rework Modul Perjalanan Dinas (Tab · Form · Print).

PRASYARAT — periksa DULU sebelum apa pun:
Sprint 001 (Fondasi Data Sekolah & Pejabat) HARUS sudah selesai. Verifikasi cepat:
  grep -n "getSignatureRoles" spj-frontend/src/utils/signatureRoles.js
  ls spj-frontend/src/utils/pejabatRoles.js spj-frontend/src/components/templates/blocks/PeringatanData.jsx
Bila salah satu tidak ada → BERHENTI, laporkan: Sprint 001 belum selesai, sprint ini belum boleh jalan.

LANGKAH WAJIB — baca berurutan:
1. planning/sprints/sprint-002/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-002/BLUEPRINT.MD      — bagaimana (file, task, dependensi ter-pin)
3. planning/sprints/sprint-002/ACCEPTANCE.MD     — kriteria selesai + test case
4. planning/sprints/sprint-001/BLUEPRINT.MD      — kontrak dari Sprint 001 (jangan diubah)
5. template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx — DOKUMEN SUMBER FORMAT (wajib dibaca)
6. AGENTS.MD · STATE.MD · CONSTITUTION.md · DECISIONS.MD

LALU:
7.  Lakukan DRY RUN — simulasi tanpa menulis kode
8.  Laporkan rencana: file yang akan disentuh, task yang dikerjakan, dependensi, risiko
9.  TUNGGU persetujuan sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan
- Mengubah requirements (bila ada pertanyaan → tulis di QUESTIONS.MD, jangan berasumsi)
- Menyentuh file di luar daftar BLUEPRINT.MD ("File yang Akan Diubah")
- Menyentuh utils/sekolahData.js · utils/signatureRoles.js · utils/pejabatRoles.js ·
  blocks/KopSurat.jsx · blocks/KopGugus.jsx · blocks/SignatureFooter.jsx
  (wilayah Sprint 001 — SUDAH SELESAI)
- Memakai library yang tidak tercantum di BLUEPRINT.MD (versi ter-pin, jangan menaikkan)
- Memparafrase kalimat legal SPD — kalimatnya harus PERSIS dokumen sumber
- Memecah file legacy (DokumenFormPreview.jsx 1847 baris / templateConfig.js 993 baris)
- Memutuskan ulang tech stack (sudah terkunci ADR)
- Mengklaim hasil tanpa bukti — sertakan output build asli atau screenshot

SETUJU:
- Setelah dry run disetujui → kerjakan task sesuai urutan BLUEPRINT.MD (Fase 1 → 5)
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- Jalankan `npm run build` di setiap gate fase
- Laporkan hasil dengan bukti untuk setiap gate
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 002 |
| Prasyarat | **Sprint 001 selesai** |
| User story | US-01 … US-10, US-12 (+ US-11 sebagian, + regresi US-16) |
| Jumlah task | **27 task** (Fase 1–5), tiap task 2–5 menit |
| File baru | **0** |
| File diubah | 6 |
| Dependency baru | **0** (semua ter-pin, lihat BLUEPRINT.MD) |
| Gate build | 1× + gate akhir |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 |
| Perkiraan urutan commit | 1) konsolidasi tab 2) form 3) dua wajah 4) print-area 5) reset data 6) gate akhir + STATE.MD |
| Penerus | tidak ada — menutup rangkaian "Rework Modul Perjalanan Dinas" |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen di **konteks segar** (AGENTS.MD: wajib)
2. `/security-dependency-auditor` — `npm audit` sebelum rilis fitur besar (CONSTITUTION.md)
3. `/state-keeper` — tutup loop, perbarui STATE.MD / DECISIONS.MD / RISKS.MD / QUESTIONS.MD
4. Kembali ke `/sprint-planner` untuk merencanakan sprint berikutnya

---

## Peringatan untuk Builder

⚠️ **Baca dokumen sumber dulu.** `template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx`
adalah **satu-satunya** acuan urutan elemen & kalimat. Jangan mengarang struktur dari
ingatan atau dari kode lama — kode lama justru yang sedang diperbaiki.

⚠️ **Task 4.2–4.4 menyentuh dokumen legal.** Kalimatnya harus **persis** dokumen sumber,
bukan parafrase. Salah satu kata bisa membuat dokumen tidak sah sebagai bukti.

⚠️ **`blocks/KopSurat.jsx` & `blocks/SignatureFooter.jsx` sudah data-driven dari Sprint 001.**
Jangan menambah fallback atau hardcode di sana — kalau print-area tampak kosong, penyebabnya
adalah Data Sekolah yang memang belum diisi (perilaku yang diminta), bukan bug.

⚠️ **Tab Perjalanan Dinas saat ini merender blok cetak dengan `mode="print"`.**
Itulah sebabnya `<input>` bocor ke tab. Setelah Fase 3, tab harus menampilkan **data saja**
dan print-area yang menjadi dokumen formal.

⚠️ **Perubahan `DokumenFormPreview.jsx` aditif sejak Sprint 001.** Sprint 001 hanya
menambahkan titik pemasangan `<PeringatanData />` di file itu — jangan hapus saat merombak
struktur tab.


---

## Lampiran — Cross-Artifact Consistency Check (Bab 8.4 langkah 4)

Dijalankan: 2026-09-14 · Hasil: **5 LULUS** (semua pemeriksaan lolos)

| # | Pemeriksaan | Hasil | Bukti |
|---|---|---|---|
| 1 | Setiap item REQUIREMENTS muncul di BLUEPRINT (file list / task) | ✅ LULUS | 8 item "Apa yang Dibangun" → Fase 1–5 (pemetaan di bawah) |
| 2 | Setiap task BLUEPRINT punya ≥1 kriteria ACCEPTANCE | ✅ LULUS | 5 fase, 27 task → 11 test case (T-01…T-11) + 2 edge case |
| 3 | Kriteria ACCEPTANCE tidak menuntut fitur di luar BLUEPRINT | ✅ LULUS | T-03 → Fase 2; T-05 → Fase 4 (4.2–4.4); T-09 → Fase 5 (5.1) |
| 4 | Dependensi BLUEPRINT == versi terpasang (tanpa drift) | ✅ LULUS | `node .workbuddy-ai/tmp-check-deps.js` → **0 mismatch / 14 paket**, lockfileVersion=3 |
| 5 | Satu sprint == satu tujuan | ✅ LULUS | lihat catatan di bawah |

### Pemetaan item REQUIREMENTS → BLUEPRINT (pemeriksaan #1)

| Item "Apa yang Dibangun" | Fase / task BLUEPRINT |
|---|---|
| 1. Satu dokumen = satu tab (hapus "Surat Tugas") | Fase 1 (1.1–1.4) |
| 2. Form SPT / SPD / Undangan sesuai dokumen sumber | Fase 2 (2.1–2.6) |
| 3. Print-area A4 lengkap kop → TTD | Fase 4 (4.1, 4.6, 4.7) |
| 4. Tab = data saja; print = formal | Fase 3 (3.1–3.4) |
| 5. Tiga blok resmi SPD yang hilang | Fase 4 (4.2–4.4) |
| 6. TTD Undangan = Ketua Gugus | Fase 4 (4.8) |
| 7. A4 + satuan `mm` + `orientation` | Fase 4 (4.9) |
| 8. Reset bersih data lama (tanpa migrasi) | Fase 5 (5.1) |

### Pemetaan fase → test case (pemeriksaan #2)

| Fase | Test case penjamin |
|---|---|
| Fase 1 — Konsolidasi tab | T-02 |
| Fase 2 — Form SPT / SPD / Undangan | T-03 |
| Fase 3 — Pemisahan dua wajah | T-04 |
| Fase 4 — Print-area | T-05, T-06, T-07, T-08 |
| Fase 5 — Reset data & gate akhir | T-01, T-09, T-11 |

### Catatan pemeriksaan #5 — satu sprint satu tujuan

Sprint ini **satu tujuan**: *"modul Perjalanan Dinas menghasilkan SPT, SPD, dan Undangan
yang struktur datanya benar dan hasil cetaknya sama persis dokumen sumber."*

Kelima fase adalah tahapan menuju satu hasil itu — tidak ada tujuan kedua:

- Fase 1 menghapus tab yang tidak ada di dokumen sumber.
- Fase 2–4 memperbaiki tiga wajah dokumen yang sama (data → tampilan → cetak).
- Fase 5 hanya membersihkan state lama yang tidak kompatibel + gate.

**Catatan penting:** sprint ini **mewarisi** konsekuensi Sprint 001 — blok `KopSurat`,
`KopGugus`, dan `SignatureFooter` **sudah** data-driven, sehingga sprint ini **tidak
menyentuhnya**. Semua perubahan lintas-template sudah diselesaikan di Sprint 001.

**Kesimpulan:** LULUS.

### Catatan pemecahan sprint (2026-09-14)

Pack ini adalah **bagian kedua** hasil pemecahan satu pack gabungan (Sprint 001 lama:
45 task / 9 fase) atas keputusan user pada pemeriksaan #5 versi sebelumnya. Pembagiannya:

| Sprint | Isi | Fase asal |
|---|---|---|
| **001** (`architect-pack-001-fondasi-data-sekolah-pejabat.md`) | Fondasi data + pejabat + kop + peringatan | Fase 1, 2, 7, 8 |
| **002** (pack ini) | Rework dokumen Perjalanan Dinas | Fase 3, 4, 5, 6, 9 |

⚠️ **Prasyarat keras:** sprint ini **tidak boleh dimulai** sebelum Sprint 001 selesai.
Kontrak yang dipakai (`getSignatureRoles()`, `getPejabat()`, `getPejabatStatus()`,
`PEJABAT_ROLES`, `mergePejabat()`, `blocks/PeringatanData.jsx`) belum ada sebelum itu.
Lihat ADR pemecahan sprint di `DECISIONS.MD`.
