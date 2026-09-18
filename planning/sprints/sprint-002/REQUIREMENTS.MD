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
