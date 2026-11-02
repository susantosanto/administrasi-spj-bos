# BLUEPRINT — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> ⚠️ **SALINAN AUDIT — snapshot saat pack disusun (2026-10-21), BUKAN dokumen hidup.**
> Revisi pasca-persetujuan hanya ada di `planning/sprints/sprint-017/<SAMA>.MD`.
> Yang berubah: preview **selalu tampil** (rancangan "sembunyikan preview" dibatalkan user
> 2026-10-21) · tab otomatis memuat entri tersimpan (EX-7) · oracle baru `test-lpj-guard` /
> `test-lpj-sidebar`. Lihat `planning/sprints/sprint-017/BUILD-REPORT.MD`.
> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG sebelum pack disetujui.
> Menjawab **bagaimana**; **apa & mengapa** ada di REQUIREMENTS.MD.
> Asumsi A-1…A-4 (REQUIREMENTS §5) berlaku untuk seluruh dokumen ini.
> Dependency baru: **TIDAK ADA** (0 perubahan `package.json` / `package-lock.json`).

---

## 1. Keputusan Arsitektur

### AD-1 — Ekstraksi, bukan salinan
`renderDetailPanel()` (`DokumenSPJPage.jsx:711-1045`, ±335 baris) dipindahkan menjadi
komponen bersama. `DokumenSPJPage` **memakai komponen yang sama**. Tidak ada JSX panel
yang disalin ke sidebar — kalau disalin, dua versi akan bercabang (R-1).

### AD-2 — Satu panel, dua layout
| Pemakai | `layout` | Susunan |
|---|---|---|
| `DokumenSPJPage` | `'side'` (default) | grid form kiri · preview kanan (`:828`) — **tidak berubah** |
| `BKUSidebarLpj` | `'stack'` | form di atas · preview di bawah (K-7) |

Layout hanya mengubah kelas grid; isi, urutan field, dan komponen tetap sama.

### AD-3 — Prefill diekstrak jadi fungsi murni
`DokumenSPJPage.jsx:178-291` (±120 baris: `prefillDariBKU` + template aturan + kunci pejabat)
dipindah ke `utils/prefillLpj.js`. Halaman dan sidebar memakai fungsi yang sama → isi otomatis
identik (R-2). Snapshot/Urungkan **tetap** di pemanggil (perilaku lama halaman tidak berubah).

### AD-4 — Gate field wajib = fungsi baru, menu LPJ tidak diubah
`readinessCheck` (`SummaryCard.jsx:20-26`) hanya 3 item generik dan dipakai tombol Cek +
gate cetak halaman LPJ. **Jangan diubah** — mengubahnya = mengubah perilaku menu LPJ.
Gate preview sidebar memakai `utils/fieldWajib.js` (baru) yang diturunkan dari
`templateConfig.blocks` (A-1). Konsekuensi jujur: gate hanya ada di sidebar (sesuai K-7).

### AD-5 — Simpan hanya saat tombol Simpan
Mengetik tidak menulis storage. Tutup panel tanpa Simpan = isian hilang (sama seperti LPJ).
Saat baris dibuka: **ada entri tersimpan → pakai entri**; tidak ada → jalankan prefill BKU.

### AD-6 — Guard kategori
`KATEGORI_KE_SPJ` (`BKUSidebar.jsx:40-46`) → `cardId`. Panel hanya dirender bila
`card.hasTemplate === true`. `atk → penggandaan` gagal guard (`hasTemplate: false`) → A-2.

---

## 2. Inventaris File

### Baru
| File | Isi | Batas baris |
|---|---|---|
| `spj-frontend/src/data/kategoriLpj.js` | `CARDS` (pindahan dari halaman) + `KATEGORI_KE_CARD` + `cardDariKategori` + `cardBerpanel` | ≤150 |
| `spj-frontend/src/utils/prefillLpj.js` | `bangunPrefillLpj({ card, bku, menu, subId, formData })` → `{ tambahan, diisi, dilewati, tertimpa, subPilih, sppdTambahan }` | ≤200 |
| `spj-frontend/src/utils/lpjBkuStore.js` | `kunciEntri` · `noBuktiSah` · `bacaEntri` · `simpanEntri` · `hapusEntri` · `bacaSemua` | ≤90 |
| `spj-frontend/src/utils/fieldWajib.js` | `fieldWajibDariConfig(cfg)` · `cekKelengkapan(cfg, formData)` | ≤90 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpj.jsx` | shell panel + layout `side`/`stack` + footer | ≤200 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjHeader.jsx` | ikon · badge · judul · MenuGuide · close · badge prefill + Urungkan · sub-tab | ≤130 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjBody.jsx` | Zona A form + Zona B preview + gate | ≤200 |
| `spj-frontend/src/components/dokumen/DetailDokumenLpjInfo.jsx` | cabang infoOnly / template / coming soon (halaman LPJ) | ≤200 |
| `spj-frontend/src/components/bku/BKUSidebarLpj.jsx` | wrapper tab sidebar: state, load/prefill, simpan, gate, tombol Simpan | ≤200 |

> **DEV-1 (penyesuaian saat eksekusi):** `kategoriLpj.js` + `DetailDokumenLpjInfo.jsx`
> tidak ada di daftar awal. Alasan: `CARDS` dipakai dua pemakai (tidak boleh diimpor dari
> halaman — impor melingkar), dan `DetailDokumenLpjBody` menembus 200 baris bila cabang
> infoOnly ikut. Keduanya **pemindahan murni**, bukan fitur baru.

### Diubah
| File | Perubahan | Batas |
|---|---|---|
| `components/bku/BKUSidebar.jsx` | (a) `const isLpj = …`; (b) kelas lebar kondisional; (c) tab ke-3; (d) render wrapper | ≤1000 |
| `pages/dashboard/DokumenSPJPage.jsx` | pakai `DetailDokumenLpj` + `bangunPrefillLpj`; `renderDetailPanel` menyusut ±350 baris | turun, bukan naik |

### Dilarang disentuh
`utils/bkuParser.js` (TABU) · `data/templateConfig.js` · `utils/previewDocs.js` ·
`components/templates/DokumenFormPreview.jsx` · `components/templates/PanelPreviewDocument.jsx` ·
`components/templates/SummaryCard.jsx` · `package.json` · `package-lock.json`.

---

## 3. Kontrak Data

### 3.1 Storage
```json
// key: spj_lpj_bku
{
  "mamin|BNU-07": {
    "kategori": "mamin",
    "noBukti": "BNU-07",
    "subId": "kegiatan",
    "templateId": "undangan_mamin",
    "formData": { "acara": "...", "tanggalAcara": "..." },
    "sppdData": {},
    "savedAt": "2026-10-21T08:40:00.000Z"
  }
}
```
- `kunciEntri(kategori, noBukti)` → `"<kategori>|<noBukti.trim()>"`.
- `noBukti` kosong/`'-'` → **tidak menyimpan**, kembalikan `{ ok: false, alasan: 'no-bukti' }`.
- `bacaEntri` tidak pernah melempar; data rusak → `null`.

### 3.2 `cekKelengkapan`
```js
// return: { lengkap: boolean, kurang: [{ key, label }], total: number, terisi: number }
```
Aturan (A-1), urut blok `templateConfig`:
1. `block.type === 'header' && block.nomor !== false` → `{ key: 'nomor', label: 'Nomor Surat' }`
2. `block.type === 'table-fields'` → setiap `fields[].key`
3. `block.type === 'table-letter-header'` → `leftFields[].key` + `rightFields[].key`
4. `block.type === 'table-dinamis'` → satu entri `{ key: 'rows', label: 'Daftar isi/penerima (minimal 1 baris)' }`, terisi bila `formData.rows.length > 0`
5. Buang key yang punya nilai **non-kosong** di `cfg.defaults`
6. Buang key yang **bukan milik form**: `bkuSumber`, `kunciPejabat` (objek meta)
7. `''`, `null`, `undefined`, `[]`, `{}` = kosong. Angka `0` = **terisi**.

### 3.3 Props `DetailDokumenLpj`
```js
{
  card, selectedSub, onSubChange,
  formData, setFormData, sppdData, setSppdData,
  viewMode, setViewMode, formTab, setFormTab, previewTab, setPreviewTab,
  onClose, onCetak, onCek,
  layout = 'side',        // 'side' | 'stack'
  prefillBadge = null, onUndoPrefill = null,
  gate = null,            // { lengkap, kurang } — hanya dipakai layout 'stack'
  guideCtx = null,        // MenuGuide
}
```
Tanpa `gate` → perilaku lama (preview selalu tampil) → halaman LPJ aman.

---

## 4. Fase & Task

> Estimasi jujur (menit). Gate setiap task WAJIB dijalankan, bukan diasumsikan.

### FASE 0 — Fondasi tanpa ubah perilaku (0 kode fitur)

**T-01 — Baseline snapshot panel LPJ** · 25 mnt
- Tulis `spj-frontend/test-lpj-baseline.mjs`: `renderToStaticMarkup` untuk 4 kategori
  (`honor`, `perjalanan_dinas`, `mamin`, `pemeliharaan`) dengan `formData` tetap → hash HTML
  per kategori → simpan `test-lpj-baseline.json`.
- Bundel: `npx esbuild test-lpj-baseline.mjs --bundle --platform=node --format=cjs --jsx=automatic`.
- **DoD:** 4 hash tercetak, file JSON ada. Ini pembanding mutlak untuk R-1.

**T-02 — Ekstrak `utils/prefillLpj.js`** · 40 mnt
- Pindahkan logika `DokumenSPJPage.jsx:178-291` (setelah `card` ditemukan) ke
  `bangunPrefillLpj()`; halaman memanggilnya. Snapshot & `setState` tetap di halaman.
- **DoD:** (a) `npm run build` exit 0; (b) oracle T-02b: untuk 4 kategori, output
  `{ tambahan, diisi, dilewati, tertimpa }` **identik** dengan versi lama (dibandingkan
  lewat salinan fungsi lama yang ditanam di skrip uji, lalu skrip dihapus); (c) diff
  `DokumenSPJPage.jsx` hanya blok prefill (tidak menyentuh `handleCetakGate`, `handleCekPanel`).

**T-03 — Ekstrak `DetailDokumenLpj` + Header** · 60 mnt
- Pindahkan JSX `renderDetailPanel` (`:711-1045`) ke dua file baru; `layout='side'` =
  grid `lg:grid-cols-[minmax(0,1fr)_minmax(0,620px)]` (persis `:828`).
- **DoD:** (a) build exit 0; (b) hash T-01 **identik 4/4**; (c) `DokumenSPJPage.jsx`
  turun ≥250 baris; (d) `MenuGuide` tetap `key={card.id}`; (e) tidak ada kelas baru di
  jalur `sk-print-area`.

**T-04 — Gate FASE 0** · 10 mnt
- **DoD:** build exit 0 · T-01 4/4 identik · T-02b PASS · `git diff --stat` hanya 3 file
  (`prefillLpj.js`, `DetailDokumenLpj*`, `DokumenSPJPage.jsx`).
- **STOP-1:** bila hash beda → perbaiki ekstraksi, JANGAN lanjut FASE 1.

### FASE 1 — Data & gate (belum menyentuh UI sidebar)

**T-05 — `utils/lpjBkuStore.js`** · 30 mnt
- **DoD oracle `test-lpj-store.mjs`:** round-trip simpan→baca · dua NoBukti tidak saling
  timpa · `noBukti` kosong ditolak `{ok:false}` · data rusak (`'{{'`) → `bacaEntri` = `null`
  (tidak melempar) · `hapusEntri` hanya menghapus satu entri.

**T-06 — `utils/fieldWajib.js`** · 40 mnt
- **DoD oracle `test-lpj-fieldwajib.mjs`** untuk 4 template wakil
  (`honor_guru`, `undangan_mamin`, `transpor_rapat`, `upah`):
  - `formData = {}` → `lengkap === false`, `kurang.length > 0`;
  - isi SEMUA key hasil `fieldWajibDariConfig` → `lengkap === true`;
  - hapus satu key → `lengkap === false` dan key itu muncul di `kurang`;
  - key `defaults` (`sifatUndangan`, `bulan`, `tahun`) **tidak** pernah masuk `kurang`;
  - `rows: []` → kurang berisi `rows`; `rows: [{}]` → terisi;
  - angka `0` dianggap terisi.
- **STOP-2:** bila untuk salah satu template `lengkap` tak pernah `true` dengan isian
  wajar → aturan A-1 direvisi bersama user, jangan dilanjutkan.

### FASE 2 — Sidebar

**T-07 — `components/bku/BKUSidebarLpj.jsx`** · 70 mnt
- Alur: `cardId = KATEGORI_KE_SPJ[katEfektif.kategori]` → `card = CARDS.find(...)` →
  guard `hasTemplate` → state `formData`/`sppdData`/`selectedSub` →
  `bacaEntri()` ? pakai : `bangunPrefillLpj()` → render `DetailDokumenLpj layout="stack"`.
- Tombol **Simpan** di header panel (bukan di dalam form): `simpanEntri(...)`, toast hasil,
  `disabled` bila `noBukti` kosong dengan tooltip alasan.
- **DoD:** build exit 0 · oracle render: wrapper dengan entri tersimpan menampilkan nilai
  entri, bukan prefill · 0 `localStorage.` langsung · file ≤200 baris.

**T-08 — `BKUSidebar.jsx`: lebar + tab + guard** · 40 mnt
- `const isLpj = !!cardLpj` → kelas panel: `isLpj ? 'w-full max-w-none' : 'w-full max-w-xl'`.
- Tab array: `isLpj ? [lpj, detail, dokumentasi] : [detail, dokumentasi]`; `activeTab`
  default `'lpj'` saat `isLpj`, `'detail'` bila tidak (reset di `useEffect` yang sudah ada,
  `:79-86`).
- **DoD:** baris non-LPJ → `max-w-xl` & tab Detail · baris LPJ → `max-w-none` & tab LPJ aktif ·
  tombol close (`:287`) tetap menutup dari tab mana pun · build exit 0.

**T-09 — Sinkron ‹ ›** · 25 mnt
- `useEffect([transaction])` di wrapper: reset state + muat entri/prefill baris baru.
  Naik/turun lintas kategori → `card` dihitung ulang; pindah ke non-LPJ → `BKUSidebar`
  menyempit & `activeTab='detail'`.
- **DoD:** uji manual 3 lompatan (mamin → honor → BOSP) tanpa error console, isian
  tersimpan tidak hilang.

### FASE 3 — Verifikasi & dokumentasi

**T-10 — Uji browser 4 kategori** · 45 mnt
- Untuk honor, perjalanan dinas, mamin, pemeliharaan: klik baris → isi semua field wajib →
  Simpan → tutup → buka → F5 → cek nilai.
- **DoD:** 4/4 utuh, screenshot per kategori, 0 console error.

**T-11 — Uji non-LPJ** · 20 mnt
- 8 tipe (REQUIREMENTS §3.3). **DoD:** lebar ≤576px, tab Detail, tanpa tab LPJ, 0 error.

**T-12 — Uji gate preview** · 20 mnt
- Kondisi A: 1 field wajib dikosongkan → preview tidak ada + indikator "n field kurang".
  Kondisi B: dilengkapi → preview muncul tanpa reload. Kondisi C: kosongkan lagi → hilang.
- **DoD:** 3/3, screenshot A & B.

**T-13 — Regresi menu LPJ** · 30 mnt
- **DoD:** hash panel 4/4 identik T-01 · tombol **Cek** masih menyorot field · badge prefill
  "dari BKU" + Urungkan bekerja · MenuGuide muncul di 4 menu · build exit 0.

**T-14 — Gate akhir** · 15 mnt
- `npm run build` exit 0 · semua oracle PASS · `git diff --stat` `bkuParser.js` = 0 ·
  regex blue-only di file baru/diubah = 0 · `wc -l` semua file baru ≤ batas §2 ·
  `rg -n "localStorage\." src/utils/lpjBkuStore.js src/components/bku/BKUSidebarLpj.jsx` = 0.

**T-15 — Dokumentasi** · 20 mnt
- `STATE.MD` entri sprint 017 · `DECISIONS.MD` ADR baru (simpan per NoBukti, ekstraksi panel,
  gate sidebar-only) · checklist ACCEPTANCE · BUILD-REPORT.
- **DoD:** 4 file diperbarui, angka di dokumen = angka hasil uji (bukan klaim).

Σ estimasi: **±8 jam** (T-01…T-15).

---

## 5. Urutan Eksekusi & Titik Berhenti

```
T-01 → T-02 → T-03 → T-04 ⛔STOP-1
                         ↓ (hash identik)
T-05 → T-06 ⛔STOP-2 → T-07 → T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 → T-15
```

**STOP-1** (setelah T-04): hash panel berbeda → ekstraksi salah, ulangi T-03.
**STOP-2** (setelah T-06): aturan A-1 tidak menghasilkan `lengkap=true` untuk isian wajar →
tanya user, jangan mengarang daftar field.
**STOP-3** (kapan pun): muncul kebutuhan mengubah `bkuParser.js`, `templateConfig.js`,
`previewDocs.js`, atau `package.json` → **berhenti dan lapor**; itu di luar scope.

## 6. Perintah Gate (Windows, tanpa bash)

```powershell
cd D:\project\spj-app\spj-frontend
npm run build                                   # exit 0 wajib
node test-lpj-store.mjs                         # PASS
node test-lpj-fieldwajib.mjs                    # PASS
node test-lpj-baseline.mjs                      # hash 4/4
rg -n "localStorage\." src/utils/lpjBkuStore.js src/components/bku/BKUSidebarLpj.jsx   # 0 hit
rg -n "\b(bg|text|border|ring)-(emerald|amber|rose|violet|cyan)" src/components/dokumen src/components/bku/BKUSidebarLpj.jsx  # 0 hit
git -C D:\project\spj-app diff --stat -- spj-frontend/src/utils/bkuParser.js           # kosong
```

Skrip uji `.mjs` bundel: `npx esbuild <file> --bundle --platform=node --format=cjs --jsx=automatic`
(ESM gagal "Dynamic require of stream"; tanpa `--jsx=automatic` gagal "React is not defined").
Skrip uji **dihapus** setelah sprint ditutup; hasilnya dikutip di BUILD-REPORT.

## 7. Rollback

Tidak ada migrasi data. Rollback = `git checkout -- <file>` per file (BUKAN `git reset --hard`,
BUKAN `git stash` — RISKS.MD). Data `spj_lpj_bku` boleh dibiarkan (tidak dibaca kode lama).

## 8. Catatan Eksekusi (diperbarui saat jalan)

| # | Catatan | Bukti |
|---|---|---|
| EX-1 | `import.meta.env` gagal di bundel `--format=cjs` ("Cannot read properties of undefined") → tambahkan `--define:import.meta.env='{}'` saat membundel skrip uji | `test-lpj-baseline.cjs` gagal sebelum define, lulus sesudahnya |
| EX-2 | Baseline T-01 merender `DokumenFormPreview` + `buildPreviewDocs` (bukan seluruh shell panel) karena panel lama hidup di dalam komponen halaman. Hash shell lama **tidak** terambil sebelum ekstraksi → pembanding pengganti: (a) hash form+docs 4/4 identik, (b) `test-lpj-panel.mjs` 21 asersi untuk semua cabang, (c) uji browser T-13 | hash 4/4 sama sebelum/sesudah |
| EX-3 | `undangan_mamin` menghasilkan **9 field wajib**; `honor_guru`, `transpor_rapat`, `upah` hanya `rows` (tabel dinamis) — gate mamin jauh lebih ketat. Perlu keputusan user (lihat QUESTIONS) | output `test-lpj-fieldwajib.mjs` |
| EX-4 | **Mamin tidak punya `templateId`** (semua sub = null) → A-1 tidak punya satu config untuk mamin. Belum diputuskan: gate mamin pakai apa | belum diimplementasikan |
