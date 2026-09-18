# DRY RUN — Sprint 001 FASE 1 + FASE 4 (v2, verifikasi penuh)

> **Rencana perubahan, BUKAN perubahan.** Belum ada satu baris kode yang diubah.
> Sesuai AGENTS.MD: *dry run → lapor rencana → TUNGGU persetujuan*.
>
> **Versi:** v2 · Tanggal: **2026-09-17** · Runtime: Node **v22.22.2** / npm **10.9.7**
> **Menggantikan** `DRYRUN-T1.md` versi 2026-09-14 (v1) yang hanya mencakup inti Fase 1
> dan belum tahu revisi pack v2/v3/v4.
>
> **Cakupan:** FASE 1 (12 task) + **FASE 4 (20 task)** — sesuai STATE.MD: *"Builder wajib
> dry run ulang Fase 1 + Fase 4 sebelum coding"*.
> User story: US-13, US-14, US-15, US-17, US-18, US-11 (sebagian)

---

## 0. Kesimpulan eksekutif

| # | Pertanyaan | Jawaban |
|---|---|---|
| 1 | Apakah rencana FASE 1 bisa dijalankan apa adanya? | ✅ **YA** — semua titik sentuh terverifikasi ada di baris yang ditulis pack |
| 2 | Apakah rencana FASE 4 bisa dijalankan apa adanya? | ❌ **TIDAK** — **2 task cacat** (D-7, D-8) + **1 risiko regresi** (R-1) |
| 3 | Apakah gate T-02 (73 baris) tercapai setelah FASE 1+4? | ⚠️ **Hanya bila D-7/D-8 diperbaiki** |
| 4 | Apakah `defaults` boleh dikosongkan tanpa auto-fill? | ❌ **TIDAK** — dokumen tercetak TTD kosong (dikonfirmasi kode) |
| 5 | Apakah ada file di luar daftar 19 yang perlu disentuh? | ❌ **TIDAK** — 19 file cukup, blast radius terkonfirmasi |

**Ringkas:** FASE 1 aman dikerjakan apa adanya. FASE 4 punya **2 task yang salah
preskripsi** dan **1 regresi yang belum dijaga** — ketiganya saya temukan di dry run ini,
semuanya **bisa diperbaiki tanpa mengubah requirement**, dan semuanya **wajib diperbaiki
sebelum coding** agar gate T-02 tidak gagal di akhir.

---

## 1. FASE 1 — hasil investigasi (12 task)

### 1.1 Peta konsumen `sekolahData.js` — blast radius sebenarnya

Diukur ulang 2026-09-17 dengan `grep -rn "from '.*sekolahData'" src/`:

| # | Konsumen | Yang diimpor | Fungsi / konstanta? | Status |
|---|---|---|---|---|
| 1 | `blocks/KopSurat.jsx:5` | **`SEKOLAH_DEFAULT`** | ❌ konstanta module-level | ⚠️ **BASI** |
| 2 | `blocks/SignatureFooter.jsx:12` | `SIGNATURE_ROLES` (via `signatureRoles.js`) | ❌ konstanta module-level | ⚠️ **BASI** |
| 3 | `blocks/SKHonorer.jsx:13` | `getSchoolData`, `getKepalaSekolah` | ✅ fungsi | aman |
| 4 | `blocks/InfoKeuangan.jsx:6` | `getSchoolData` | ✅ fungsi | aman |
| 5 | `dokumentasi/DokumentasiAIGenerate.jsx:20` | `getSchoolData` | ✅ fungsi | aman |
| 6 | `utils/signatureRoles.js:5` | `getKepalaSekolah`, `getBendahara` | ❌ dipanggil **saat module load** (baris 8–9) | ⚠️ **BASI** |

✅ **Terverifikasi:** **2 konsumen** pakai konstanta basi (KopSurat + SignatureFooter),
persis seperti task 1.8 + 1.9 di BLUEPRINT. Tidak ada konsumen ke-7 yang terlewat.

### 1.2 Klaim "zero consumer" untuk 2 `export default` — ✅ TERBUKTI

Dasar task **1.6** dan **1.7**. Diperiksa ulang hari ini:

```bash
grep -rn "from '.*sekolahData'" src/ | grep -v "import {"     # → 0 baris
grep -rn "from '.*signatureRoles'" src/ | grep -v "import {"  # → 0 baris
```

| Export | Lokasi | Importer default | Aman dihapus? |
|---|---|---|---|
| `export default SEKOLAH_DEFAULT` | `sekolahData.js:83` | **0** | ✅ ya |
| `export default SIGNATURE_ROLES` | `signatureRoles.js:39` | **0** | ✅ ya |

Semua konsumen memakai **named import**. Menghapus keduanya **tidak** mematahkan build.

### 1.3 Titik sentuh per task — verifikasi baris

| Task | File | Baris di pack | Terukur 2026-09-17 | Cocok? |
|---|---|---|---|---|
| 1.4 | `sekolahData.js` | 9–20, 37, 40–46 | `SEKOLAH_DEFAULTS` = 9–20 · `if (!stored) return SEKOLAH_DEFAULTS` = 37 · spread fallback = 40–46 | ✅ |
| 1.5 | `sekolahData.js` | 22–30, 56, 59–60, 70, 73–74 | `KEPALA_SEKOLAH_DEFAULT` 22–25 · `BENDAHARA_DEFAULT` 27–30 · `if (!pejabat?.nama) return` 56 & 70 · `|| DEFAULT.nama/nip` 59–60, 73–74 | ✅ |
| 1.6 | `sekolahData.js` | 79–81, **83** | `SEKOLAH_DEFAULT`/`KEPALA_SEKOLAH`/`BENDAHARA` 79–81 · `export default` **83** | ✅ |
| 1.7 | `signatureRoles.js` | 8–9, 29–30, **39** | panggilan level-modul 8–9 · `DEWI ERMIRAWATI` 29 + NIP 30 · `export default` **39** | ✅ |
| 1.8 | `KopSurat.jsx` | 5, 8 | import 5 · `{ ...SEKOLAH_DEFAULT, ...data }` 8 | ✅ |
| 1.9 | `SignatureFooter.jsx` | 12, 80, 122 | import 12 · `SIGNATURE_ROLES[role]` **80 & 122** (dua cabang: 2-kolom & 1-kolom) | ✅ |
| 1.10 | `SignatureFooter.jsx` | 9 + fallback `defaultName` | komentar 9 · `\|\| roleConfig.defaultName` di **94, 106, 137, 148** (4 titik × 2 cabang × 2 mode) | ⚠️ **lihat D-9** |

### 1.4 Baseline FASE 1 di gate T-02 — terverifikasi

| File | Baris | Isi |
|---|---|---|
| `sekolahData.js` | 10, 11, 23, 24, 28, 29 | 6 baris — `SD NEGERI LEBAKLEUNGSIR`, NPSN, `BADRUDDIN`+NIP, `DEDE GUNAWAN`+NIP |
| `signatureRoles.js` | 29, 30 | `DEWI ERMIRAWATI, S.Pd.Gr.` + NIP |
| `KopSurat.jsx` | 13 | `PEMERINTAH KABUPATEN BANDUNG BARAT` → **task 3.3 (FASE 3)** |
| `SignatureFooter.jsx` | 9 | komentar `BADRUDDIN` / `DEDE GUNAWAN` → **task 1.10** |

**Total FASE 1 menutup 10 dari 73 baris baseline.**

---

## 2. FASE 4 — hasil investigasi (20 task)

### 2.1 Arsitektur lapisan default — TERKONFIRMASI (dasar auto-fill 4.1)

Investigasi mengonfirmasi **3 lapisan** nilai default, persis seperti ADR F-1a:

| Lapisan | Lokasi | Cara kerja |
|---|---|---|
| **1 · Otoritatif** | `templateConfig.defaults` | Di-spread saat build data: `{ ...TEMPLATE_CONFIGS.spt.defaults, ...formData, ... }` |
| **2 · Residual** | literal `\|\| 'NAMA'` di blok cetak | Hanya terpakai bila lapisan 1 sudah kosong |
| **3 · Assembly** | `formData.X \|\| cfg.defaults.X` | `DokumenFormPreview` 1561–1564 (SK Honorer) |

Titik spread terverifikasi:

| Baris | Builder | Spread |
|---|---|---|
| 1550 | `buildSkData` | `...skConfig.defaults` |
| 1591 | `buildPreviewData` | `...config.defaults` |
| **1617** | `buildSptData` | `...TEMPLATE_CONFIGS.spt.defaults` |
| **1632** | `buildSppdData` | `...TEMPLATE_CONFIGS.sppd.defaults` |
| **1674** | `undanganData` | `...TEMPLATE_CONFIGS.undangan_gugus.defaults` |
| 1669 | `resumeData` | `...TEMPLATE_CONFIGS.notulen.defaults` |

✅ **Kesimpulan: mengosongkan `defaults` TANPA auto-fill akan mencetak TTD kosong.**
Urutan task 4.1 → 4.2…4.19 **wajib** dipatuhi. AGENTS.MD "satu commit" **wajib**.

### 2.2 Kelas A vs Kelas B — preskripsi D-2 TERBUKTI BENAR

Diperiksa langsung di kode:

| Helper | File | Cabang `mode === 'edit'` | Cabang cetak |
|---|---|---|---|
| `val(key, ph)` | `SPDForm.jsx:23–36` | `placeholder={ph}` (baris 31) | `{value \|\| <PlaceholderText label={ph \|\| key} />}` (baris 34) |
| `F(label, key, ph)` | `SuratTugas.jsx:23–44` | `placeholder={ph}` (baris 36) | `{value \|\| <PlaceholderText label={label} />}` (**baris 39 — pakai `label`**) |

⚠️ **Ini membuktikan D-2 benar dan penting:**
- `SPDForm.val` → `ph` **BENAR-BENAR TERCETAK** sebagai `[ ph ]` bila field kosong
- `SuratTugas.F` → `ph` **TIDAK PERNAH TERCETAK**; yang tercetak `label`

Maka preskripsi v2 task 4.7 (`ph` → `getSchoolData().namaSekolah`) **akan menghasilkan
`[ Kepala SD Negeri X ]`** di dokumen cetak. Koreksi v3 (label generik) **wajib dipatuhi**.
Task 4.12 (SuratTugas baris 65) memang **edit-only** — sifatnya beda dari 4.11.

### 2.3 Verifikasi titik sentuh Fase 4

| Task | File:baris | Terukur 2026-09-17 | Cocok? |
|---|---|---|---|
| 4.2 | `templateConfig` 324, 325, 327, 328 | `namaPenandatangan`+`nip` (324/325) · `namaMengetahui`+`nip` (327/328) | ✅ |
| 4.3 | `templateConfig` 352, 353, 355, 356 | idem untuk `surat_tugas` | ✅ |
| 4.4 | `templateConfig` 377, 378 | `namaKetuaGugus` + `nipKetuaGugus` | ✅ |
| 4.5 | `templateConfig` 914, 915 | `sk_honorer.defaults` | ✅ |
| 4.6 | `templateConfig` 51 | `notulen.defaults.tempat = 'SD NEGERI LEBAKLEUNGSIR'` | ✅ |
| 4.7 | `templateConfig` 295 | `sppd.defaults.pengguna = 'Kepala SD NEGERI LEBAKLEUNGSIR'` | ✅ |
| 4.8 | `templateConfig` 957, 958 | `npsn: '20212345'` + `namaSekolah: 'SD NEGERI LEBAKLEUNGSIR'` | ✅ |
| 4.9 | `SPDForm` 156/157, 178/179, 191/192 | 6 fallback TTD cetak | ✅ |
| 4.10 | `SPDForm` 57, 76, 96, 166 | 4 argumen `ph` pada `val()` | ✅ |
| 4.11 | `SuratTugas` 103/104, 110/111 | 4 fallback TTD cetak | ✅ |
| 4.12 | `SuratTugas` 65, 15 | `F('Nama','namaPenandatangan','BADRUDDIN, S.Ag.')` + komentar | ✅ |
| 4.13 | `SuratUndangan` 216/217, 12 | fallback + komentar | ✅ |
| 4.15 | `DokumenFormPreview` 1496, 1641, 1669 | 3 fallback cetak | ✅ |
| 4.17 | `InfoKeuangan` 11 | `placeholder: 'SD NEGERI LEBAKLEUNGSIR'` | ✅ |

### 2.4 Cakupan T-02 per fase — siapa menutup apa

| Fase | Baris ditutup | File |
|---|---|---|
| FASE 1 | **10** | sekolahData (6) · signatureRoles (2) · KopSurat 13 · SignatureFooter 9 |
| FASE 3 | **2** | KopSurat 13 · KopGugus 9 |
| FASE 4 | **61** | sisanya |
| **Total** | **73** | ✅ utuh, tidak ada yang menggantung |

> ⚠️ Baris `KopSurat:13` dihitung sekali (task 3.3), bukan dua.

---

## 3. ⚠️ TEMUAN DRY RUN — 3 cacat baru (D-7, D-8, D-9)

Ketiganya **tidak ditemukan** di pack v3/v4 karena v3 memverifikasi **apakah baris
tertaut task**, bukan **apakah task-nya benar preskripsi**.

### D-7 — Task 4.3 mengosongkan `surat_tugas.defaults` yang **tidak pernah dipakai** · **KEPARAHAN: sedang**

**Fakta:** tab `surat_tugas` memakai builder **`buildSptData`**, bukan builder sendiri:

```js
// DokumenFormPreview.jsx:1789-1791
{showTabs && previewTab === 'surat_tugas' && renderPerRecipient(
  TEMPLATE_CONFIGS.surat_tugas, buildSptData, 'Surat Tugas', 'task_alt'
)}
```

dan `buildSptData` (baris **1617**) hanya meng-spread **`spt.defaults`**:

```js
const buildSptData = (row) => ({
  ...TEMPLATE_CONFIGS.spt.defaults,   // ← hanya spt, TIDAK surat_tugas
  ...formData,
  ...
})
```

**Bukti grep:** `surat_tugas.defaults` **tidak muncul di mana pun** sebagai sumber spread —
satu-satunya kemunculan `TEMPLATE_CONFIGS.surat_tugas` adalah baris 1790 itu (sebagai
argumen config blok, bukan sebagai sumber data).

**Konsekuensi:**
- Task 4.3 (mengosongkan 352–356) **tidak berpengaruh apa pun** ke output — sia-sia tapi tidak berbahaya.
- **Sebaliknya berbahaya:** baris **352, 353, 355, 356** tetap muncul di gate T-02 dan
  memang harus jadi 0. Jadi task 4.3 **tetap wajib dikerjakan** untuk lolos gate.
- ⚠️ **Yang benar-benar tercetak** di tab Surat Tugas adalah nilai dari `spt.defaults`
  → sudah ditutup **task 4.2**. Jadi tidak ada regresi, hanya **preskripsi yang menyesatkan**.

**Rekomendasi:** perjelas task 4.3 — *"kosongkan untuk memenuhi gate T-02; catat bahwa
nilai yang tercetak di tab `surat_tugas` berasal dari `spt.defaults` (task 4.2) karena
`buildSptData` hanya meng-spread `spt.defaults` (baris 1617)"*. **Tidak perlu task baru.**

---

### D-8 — Task 4.1 auto-fill **tidak menyentuh jalur notulen** → TTD notulen kosong · **KEPARAHAN: TINGGI**

**Fakta:** task 4.1 hanya menyebut **spt / sppd / undangan**:

> "4.1 · `getSignatureRoles()` mengisi `namaPenandatangan`/`nipPenandatangan`/
> `namaMengetahui`/`nipMengetahui`/`namaKetuaGugus`/`nipKetuaGugus` untuk
> **spt/sppd/undangan**"

Tetapi template **`notulen`** juga punya blok signature (config baris 48):

```js
{ type: 'signature', roles: ['pimpinan', 'notulen'], showDibayarLunas: false }
```

dan TTD-nya dirender `SignatureFooter` lewat key **`ttd_${role}_nama`** — yaitu
`ttd_pimpinan_nama` dan `ttd_notulen_nama` — yang **tidak diisi oleh task 4.1**.

**Konsekuensi:**
- Setelah task 4.1 mengubah `SIGNATURE_ROLES` → `getSignatureRoles()` **dan** task 1.10
  menghapus `|| roleConfig.defaultName`, maka `SignatureFooter` mencetak **kosong** bila
  `data['ttd_pimpinan_nama']` kosong.
- Untuk notulen, key itu **tidak pernah diisi** → **TTD notulen & pimpinan kosong permanen**.
- ⚠️ Ini **regresi nyata** yang akan lolos dari T-12 (T-12 hanya memverifikasi
  **SPT/SPD/Undangan**).

**Catatan tambahan:** role `pimpinan` juga dipetakan di `signatureRoles.js` (baris 22–26)
dan saat ini bernilai Kepala Sekolah — jadi sebelum sprint ini, notulen **terisi otomatis**.
Menghapus fallback **membuatnya kosong**. Ini **kemunduran dari perilaku sekarang**.

**Rekomendasi (pilih satu, butuh keputusan user):**

| Opsi | Isi | Dampak |
|---|---|---|
| **8a** | Perluas task 4.1 agar juga mengisi `ttd_pimpinan_nama`/`nip` + `ttd_notulen_nama`/`nip` untuk template `notulen` | Konsisten, TTD notulen terisi dari Data Sekolah (role `pimpinan` → `ks`, `notulen` → `notulen`). **+1 titik di `DokumenFormPreview.jsx`** |
| **8b** | Tambah **T-15 baru**: guard "TTD notulen terisi, bukan kosong" (memperluas T-12) | Wajib apa pun opsinya |
| **8c** | Defer ke Sprint 002 (catat di `QUESTIONS.MD`) | ❌ **Tidak disarankan** — akan mencetak notulen tanpa TTD sampai Sprint 002 |

**Rekomendasi saya: 8a + 8b.** Alasannya: task 1.10 memang **harus** menghapus fallback
(di-ACC user), jadi tanpa 8a kita sengaja mengirim regresi. Biayanya kecil — satu titik
tambahan di file yang sudah masuk daftar ubah.

---

### D-9 — Task 1.10 menyebut fallback `defaultName` **tanpa jumlah titik** — ada **4 titik**, bukan 1 · **KEPARAHAN: rendah (akurasi)**

**Fakta:** task 1.10 menulis *"Hapus fallback `|| roleConfig.defaultName`"* (tunggal).
Terukur di `SignatureFooter.jsx`: **4 titik** —

| Baris | Konteks |
|---|---|
| 94 | cabang 2-kolom · `mode === 'edit'` · nama |
| 106 | cabang 2-kolom · **cetak** · nama |
| 137 | cabang 1-kolom · `mode === 'edit'` · nama |
| 148 | cabang 1-kolom · **cetak** · nama |

Plus pasangan NIP (`defaultNip`) di baris 99, 109, 140, 151.

**Bukti: `SignatureFooter.jsx` punya DUA cabang** — `useTwoColumn = roles.length === 2`
baris 22. Template dengan 2 role (Honor, Transport, BKU, **notulen**) lewat cabang
2-kolom; 1 role lewat cabang 1-kolom. **Keduanya wajib dibersihkan.**

**Rekomendasi:** perluas task 1.10 menyebut **8 baris** (4 `defaultName` + 4 `defaultNip`)
di **kedua cabang**, agar Builder tidak hanya membersihkan cabang pertama yang ditemukan.

---

### R-1 — Risiko regresi: T-14 belum menjangkau notulen · **KEPARAHAN: sedang**

`ACCEPTANCE.MD` T-12 memverifikasi TTD SPT/SPD/Undangan terisi. T-14 memverifikasi SK
Honorer + BKU NPSN. **Tidak ada test case yang menjangkau notulen** — padahal D-8
menunjukkan notulen adalah satu-satunya template yang TTD-nya **tidak punya jalur
auto-fill** setelah sprint ini.

**Rekomendasi:** tambah **T-15** — *"TTD notulen & pimpinan terisi dari Data Sekolah
(atau kosong + peringatan bila data kosong), bukan kosong tanpa penjelasan"*.
Verifikasi di dua kondisi data, sama seperti T-12.

---

## 4. Rencana perubahan (file per file)

### A. **BARU** — `src/utils/pejabatRoles.js`

Satu sumber definisi peran (menutup duplikasi di 2 halaman).

```js
export const PEJABAT_ROLES = [
  { key: 'ks',         label: 'Kepala Sekolah',   icon: 'person',             color: 'primary' },
  { key: 'bendahara',  label: 'Bendahara',        icon: 'account_balance',    color: 'primary' },
  { key: 'pengawas',   label: 'Pengawas Bina',    icon: 'supervisor_account', color: 'primary' },
  { key: 'sekdik',     label: 'Sekretaris Dinas', icon: 'badge',              color: 'primary' },
  { key: 'ketuaGugus', label: 'Ketua Gugus',      icon: 'groups',             color: 'primary' },
  { key: 'notulen',    label: 'Notulen',          icon: 'edit_note',          color: 'primary' },
]

export const DEFAULT_PEJABAT = Object.fromEntries(
  PEJABAT_ROLES.map((r) => [r.key, { nama: '', nip: '' }])
)

/** Deep-merge — mencegah crash saat data lama belum punya role baru */
export function mergePejabat(stored) {
  const out = { ...DEFAULT_PEJABAT }
  for (const r of PEJABAT_ROLES) {
    out[r.key] = { ...DEFAULT_PEJABAT[r.key], ...(stored?.[r.key] || {}) }
  }
  return out
}
```

### B. `src/utils/sekolahData.js` (84 → ±125 baris; batas utility 200 ✅)

1. Tambah helper `findFieldByLabel(allFields, regex)` — resolver `allFields` by label.
2. `getSchoolData()` — **berhenti** fallback ke `SEKOLAH_DEFAULTS`; **kembalikan**
   `telepon`, `kelurahan`, `kodePos` (tutup G9); baca `email`/`telepon`/`website` dari
   `allFields` bila key kosong (prioritas `stored.<key>` → `allFields`).
3. Tambah `getPejabat(role)` generik + `getPejabatStatus()` (daftar role kosong →
   bahan peringatan merah US-15).
4. `getKepalaSekolah()` / `getBendahara()` — **hapus** fallback; kembalikan `{ nama: '', nip: '' }`.
5. **Hapus** `SEKOLAH_DEFAULTS` (9–20), `KEPALA_SEKOLAH_DEFAULT` (22–25),
   `BENDAHARA_DEFAULT` (27–30).
6. **Hapus** legacy export (79–81) **dan `export default` (83)**.

> ⚠️ **Breaking.** Langkah 2–6 + migrasi konsumen (D, E) **WAJIB satu commit**.

### C. `src/utils/signatureRoles.js` (40 → ±60 baris; batas utility 200 ✅)

- `SIGNATURE_ROLES` (konstanta, baris 11–37) → **`getSignatureRoles()`** (fungsi).
- **Hapus** panggilan level-modul baris 8–9 (akar bug nilai basi, G6).
- `'ketua-gugus'` → `pejabat.ketuaGugus` (**bukan** `kepalaSekolah`) — tutup G7.
- `'notulen'` → `pejabat.notulen` (**hapus** `DEWI ERMIRAWATI` baris 29–30).
- `'kepala-sekolah'` / `'bendahara'` / `'pimpinan'` → dari `getPejabat()` (tanpa fallback).
- **Hapus** `export default SIGNATURE_ROLES` (baris 39).

### D. `src/components/templates/blocks/KopSurat.jsx`

```diff
-import { SEKOLAH_DEFAULT } from '../../../utils/sekolahData'
+import { getSchoolData } from '../../../utils/sekolahData'
 export default function KopSurat({ data = {} }) {
-  const sekolah = { ...SEKOLAH_DEFAULT, ...data }
+  const sekolah = { ...getSchoolData(), ...data }
```

Plus (FASE 3, task 3.1–3.3): render `spj_logo_sekolah` (kiri atas) +
`spj_logo_dinas` (kanan atas); baris 13 → `kabupaten`/`provinsi`.

### E. `src/components/templates/blocks/SignatureFooter.jsx`

```diff
-import { SIGNATURE_ROLES } from '../../../utils/signatureRoles'
+import { getSignatureRoles } from '../../../utils/signatureRoles'
 ...
-  const roleConfig = SIGNATURE_ROLES[role]
+  const roleConfig = getSignatureRoles()[role]
```

Plus **task 1.10 — 8 baris, 2 cabang** (lihat D-9):

| Baris | Aksi |
|---|---|
| 94, 106 | hapus `\|\| roleConfig.defaultName` (2-kolom: edit + cetak) |
| 137, 148 | hapus `\|\| roleConfig.defaultName` (1-kolom: edit + cetak) |
| 99, 109, 140, 151 | hapus `\|\| roleConfig.defaultNip` |
| 9 | bersihkan komentar referensi (`BADRUDDIN` / `DEDE GUNAWAN`) |

> Bila kosong → render **kosong** (pemicu peringatan merah US-15), bukan nama hardcoded.

### F. `src/data/templateConfig.js` — **FASE 4** (12 baris, 4 sub-area)

| Task | Baris | Aksi |
|---|---|---|
| 4.2 | 324, 325, 327, 328 | `spt.defaults` nama+NIP → `''` |
| 4.3 | 352, 353, 355, 356 | `surat_tugas.defaults` → `''` (**lihat D-7**) |
| 4.4 | 377, 378 | `undangan_gugus.defaults` → `''` |
| 4.5 | 914, 915 | `sk_honorer.defaults` → `''` |
| 4.6 | 51 | `notulen.defaults.tempat` → `''` |
| 4.7 | 295 | `sppd.defaults.pengguna` → `''` |
| 4.8 | 957, 958 | `bku.defaults.npsn` + `namaSekolah` → dari `getSchoolData()` |

> **`|` tidak disentuh:** 11× `sourceFile: '/templates/…SDN lebakleungsir.xlsx'` (path aset nyata).

### G. `src/components/templates/DokumenFormPreview.jsx` — **FASE 4 + 5**

| Task | Baris | Aksi |
|---|---|---|
| **4.1** | 1561–1564 + builder | Auto-fill `getSignatureRoles()` untuk spt/sppd/undangan **+ notulen (D-8)** |
| 4.15 | 1496, 1641, **1669** | Hapus fallback cetak (`resumeData.tempat`) |
| 4.16 | 493, 498, 511, 512, 577, 604, 718, 719, 1032, 1047 | Placeholder → generik (Kelas B) |
| 5.3 | area tab spt/sppd/undangan | Pasang `<PeringatanData />` |

### H. `src/components/templates/TemplateEngine.jsx` — **FASE 5**

Task 5.2: pasang `<PeringatanData />` saat `mode === 'edit'` (default baris 52) →
mencakup **seluruh** template.

### I. `src/components/templates/blocks/` — FASE 3 & 4

| File | Task | Aksi |
|---|---|---|
| `KopGugus.jsx` | 3.4, 3.5, 3.6 | Baris 9, 12, 15 → dari **prop `data`** + logo gugus. ⚠️ **TIDAK baca storage sendiri** |
| `SPDForm.jsx` | 4.9, 4.10 | 6 fallback cetak dihapus · 4 argumen `ph` → **label generik** |
| `SuratTugas.jsx` | 4.11, 4.12 | 4 fallback cetak · placeholder edit-only 65 + komentar 15 → generik |
| `SuratUndangan.jsx` | 4.13 | fallback 216/217 + komentar 12 |
| `SKHonorer.jsx` | 4.14 | **9 baris** (5, 94, 96, 100, 117, 142, 144, 150, 227). ⚠️ **baris 98 `DINAS PENDIDIKAN` TIDAK disentuh** |
| `InfoKeuangan.jsx` | 4.17 | placeholder baris 11 → generik |
| `PeringatanData.jsx` | 5.1 | **BARU** — banner merah, 2 varian, `print:hidden` |

### J. `src/pages/dashboard/` & `src/utils/` — FASE 2 + 4

| File | Task | Aksi |
|---|---|---|
| `DataSekolahPage.jsx` | 2.1–2.4 | Import `PEJABAT_ROLES` bersama · `mergePejabat()` · warna blue-only · input Data Gugus |
| `PejabatSekolahPage.jsx` | 2.5–2.7 | idem (hapus `defaultPejabat` lokal) · gradient → blue/slate |
| `dataContextBuilder.js` | 4.18 | komentar JSDoc baris 22–23 → generik |
| `guruTendikParser.js` | 4.19 | komentar baris 97 → generik |
| `TabelLetterHeader.jsx` | 4.19 | komentar diagram baris 8 → generik |
| `package.json` | 1.11 | 14 dependency → **eksak** (hapus `^`) |

---

## 5. Urutan eksekusi yang diusulkan

```
── FASE 1 (blocker, jalur kritis) ──
1. utils/pejabatRoles.js             (baru — tanpa dependensi)
2. utils/sekolahData.js              (ubah)
3. utils/signatureRoles.js           (ubah)
4. blocks/KopSurat.jsx               (migrasi)  ─┐
5. blocks/SignatureFooter.jsx        (migrasi)   ├─ WAJIB SATU COMMIT
6. package.json                      (pin 1.11) ─┘
   ── GATE FASE 1 (task 1.12): npm ci + npm run build + uji 6 konsumen × 2 kondisi ──

── FASE 2 ──
7. pages/DataSekolahPage.jsx · pages/PejabatSekolahPage.jsx
   ── GATE FASE 2 (2.8): build + uji tambah role ke-6 pada data LAMA ──

── FASE 3 ──
8. blocks/KopSurat.jsx (logo + kabupaten) · blocks/KopGugus.jsx

── FASE 4 (WAJIB satu commit) ──
9.  DokumenFormPreview.jsx — **4.1 auto-fill DULU** (spt/sppd/undangan + notulen)
10. templateConfig.js — 4.2…4.8
11. blocks/ SPDForm · SuratTugas · SuratUndangan · SKHonorer · InfoKeuangan
12. utils/dataContextBuilder.js · guruTendikParser.js · blocks/TabelLetterHeader.jsx
    ── GATE FASE 4 (4.20): build + T-02 → 0 + T-12 + T-15 + verifikasi SK Honorer ──

── FASE 5 ──
13. blocks/PeringatanData.jsx (baru) · TemplateEngine.jsx · DokumenFormPreview.jsx

── FASE 6 ──
14. Regresi 6 konsumen × 2 kondisi · GATE AKHIR · update STATE.MD + pack
```

**Aturan commit (dari BLUEPRINT, ditegaskan):**
- Langkah **2–6 wajib satu commit** — menghapus konstanta basi tanpa memigrasi konsumen
  akan mematahkan build.
- Langkah **9–12 wajib satu commit** — auto-fill dan penghapusan literal tidak boleh
  terpisah, atau ada commit di antaranya yang mencetak dokumen tanpa tanda tangan.
- 4.14 (SKHonorer) **tidak boleh** di-commit sebelum 4.8 (`bku.defaults`) — keduanya
  menyentuh identitas sekolah yang sama dari arah berbeda.
- `package.json` (1.11) boleh commit terpisah, **tanpa** `package-lock.json` berubah.

---

## 6. Rencana verifikasi (bukti, bukan klaim)

| # | Uji | Kondisi | Bukti |
|---|---|---|---|
| V1 | `npm run build` (+ sebut versi runtime) | — | output asli | **LULUS 2026-09-18 (FASE 6.2):** exit 0, 179 modules, 7.38s |
| V2 | Kop surat setelah ubah Data Sekolah **tanpa reload** | data terisi | screenshot sebelum/sesudah (bukti G6 hilang) |
| V3 | Semua TTD **kosong** + peringatan merah | Data Sekolah **kosong** | screenshot 6 konsumen | **Statik lulus (6.1):** semua konsumen jujur-kosong; screenshot menunggu acceptance-runner |
| V4 | Semua TTD benar | Data Sekolah **terisi** | screenshot 6 konsumen | **Statik lulus (6.1):** jalur auto-fill terbaca di semua konsumen; screenshot menunggu acceptance-runner |
| V5 | Halaman Pejabat **tidak crash** | `spj_data_sekolah` **lama** (tanpa `ketuaGugus`/`notulen`) | screenshot + console bersih | **Runtime data-layer lulus (FASE 2 b)**; UI console menunggu acceptance-runner |
| V6 | Role ke-6 bisa diisi & tersimpan | — | screenshot + isi `spj_data_sekolah.pejabat.notulen` | **Runtime data-layer lulus (FASE 2 b)**; UI menunggu acceptance-runner |
| V7 | `grep -rniE "<15 pola>" src/ \| wc -l` | — | **0** | **LULUS 2026-09-18 (FASE 6.2):** T-02 final verbatim — exit 1, 0 hit |
| V8 | Email terbaca dari `allFields` (T-03) | `allFields` punya `Email` | screenshot kop |
| V9 | **TTD notulen + pimpinan terisi** (T-15, D-8) | data terisi | screenshot notulen |
| V10 | SK Honorer mencetak **nama sekolah yang benar** (T-14) | data terisi | screenshot SK Honorer |
| V11 | BKU mencetak NPSN dari Data Sekolah (T-14) | data terisi | screenshot BKU |
| V12 | Peringatan **tidak** ikut cetak (5.4) | — | print preview | **Status 2026-09-18 (statik):** `print:hidden` + banner terpasang di luar `.print-container`; verifikasi UI runtime menunggu /acceptance-runner |

---

## 7. Risiko eksekusi

| Risiko | Mitigasi |
|---|---|
| Menghapus konstanta basi mematahkan build | Langkah 2–6 satu commit; V1 sebagai gate |
| Mengosongkan `defaults` sebelum auto-fill → TTD kosong | **4.1 wajib lebih dulu**; langkah 9–12 satu commit |
| **TTD notulen kosong permanen (D-8)** | **Perluas 4.1 + tambah T-15** |
| Helper `val()` mencetak `[ Kepala SD Negeri X ]` (D-2) | Kelas B → **label generik**, bukan nilai dinamis |
| Deep-merge salah bentuk → `pejabat` lama tertimpa | `mergePejabat()` diuji dengan data lama (V5) |
| Kop kosong saat data kosong | **Perilaku yang diminta** (keputusan user), bukan regresi — V3 |
| Blok shared tersentuh → regresi template lain | V3/V4 pada **6 konsumen**, bukan hanya 3 dokumen |
| Builder hanya membersihkan 1 cabang `SignatureFooter` (D-9) | Task 1.10 menyebut **8 baris / 2 cabang** |
| Task 4.3 dikira memperbaiki output (D-7) | Perjelas preskripsi — nilai cetak dari `spt.defaults` (4.2) |
| `NomorSuratPopup.jsx:18` `'SDN-PSR'` dianggap hardcode | **Di luar cakupan** — kode penomoran, di `QUESTIONS.MD` |
| 11× `sourceFile` `.xlsx` di-rename | **JANGAN** — path aset nyata, terverifikasi tidak terjaring T-02 |

---

## 8. Keputusan yang dibutuhkan dari user

| # | Pertanyaan | Opsi | Rekomendasi |
|---|---|---|---|
| **1** | **D-8** — TTD notulen: perluas task 4.1 ke template notulen? | (a) perluas 4.1 + T-15 baru · (b) T-15 saja · (c) defer ke Sprint 002 | **(a)** — tanpa itu notulen tercetak tanpa TTD; biaya kecil (1 titik di file yang sudah masuk daftar ubah) |
| **2** | **D-7** — perjelas preskripsi task 4.3? | (a) tambah catatan penjelas · (b) biarkan | **(a)** — murni dokumentasi, tidak menambah task |
| **3** | **D-9** — perjelas task 1.10 jadi 8 baris / 2 cabang? | (a) ya · (b) biarkan | **(a)** — mencegah Builder hanya membersihkan cabang pertama |
| **4** | Rencana kerja ini disetujui untuk FASE 1? | — | Setelah disetujui: kerjakan langkah 1–6, lapor dengan bukti V1, **berhenti** sebelum FASE 2 |

---

**Status: ✅ DISETUJUI & FASE 1 SELESAI (2026-09-17).**

§8 dijawab user 2026-09-17: **1 = ya · 2 = ya · 3 = Ya** (ketiganya menerima rekomendasi).
FASE 1 langkah 1–6 **sudah dikerjakan & lulus gate** — bukti di blok "FASE 1 SPRINT 001
SELESAI & LULUS GATE" pada `STATE.MD`:
`✓ 178 modules transformed` · `✓ built in 7.38s` · T-02 **73 → 64** · T-13 **0 caret,
14/14 cocok lockfile** · uji data layer **22 PASS / 0 FAIL**.

⏸️ **Berhenti sebelum FASE 2** — sesuai AGENTS.MD (*dry run → lapor → tunggu persetujuan*).
FASE 2 (task 2.1–2.8) belum dimulai dan **FASE 1 belum di-commit** (menunggu keputusan user).
