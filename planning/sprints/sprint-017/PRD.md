# PRD — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG dimulai sebelum pack
> (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT) disusun & disetujui (AGENTS.MD).
> Input: **Idea Brief `/idea-clarifier` 2026-10-21** (8 keputusan user — §1).
> Runtime: React 18 + Vite, **tanpa backend**, data ke localStorage (prefix `spj_`).
> ⚠️ **3 temuan kode** (§2.1–2.3) mengubah sebagian asumsi brief. Baca §10 sebelum menyetujui.

---

## 1. Latar Belakang & Keputusan yang Sudah Dikunci

Hari ini, mengisi dokumen LPJ dari sebuah baris BKU memaksa user keluar dari konteks:
klik baris → sidebar 576px (`BKUSidebar.jsx:278` `w-full max-w-xl`) → tombol aksi →
**pindah halaman** ke `/dashboard/dokumen-lpj` → cari menu kategori → isi form. Nominal,
NoBukti, tanggal, dan rincian baris tertinggal di halaman sebelumnya.

**Keputusan user (Idea Brief 2026-10-21 — JANGAN diputus ulang):**

| # | Keputusan | Konsekuensi rancangan |
|---|---|---|
| 1 | Sidebar jadi **full width** + tombol close/kembali | `max-w-xl` dilepas untuk baris berkategori LPJ |
| 2 | Panel LPJ = **tab pertama & default** | Tab Detail & Dokumentasi dipertahankan di kanannya |
| 3 | Isi panel **sama persis** dengan menu Dokumen LPJ per kategori | Bukan tiruan visual — komponen yang sama |
| 4 | **Bisa diisi & disimpan** | Kemampuan baru: LPJ hari ini tidak menyimpan (§2.2) |
| 5 | Cakupan data = **baris diklik + rincian se-NoBukti** | Bukan seluruh kategori/periode |
| 6 | Baris **non-LPJ tetap sidebar sempit** | Tidak ada perubahan perilaku di 4 tipe transaksi lain |
| 7 | Layout: **form di atas, preview di bawah**; preview muncul **hanya bila semua field wajib terisi** | Butuh definisi "field wajib" (§10 D-1) |
| 8 | Tombol ‹ › **tetap ada & ikut mengganti** panel | Pindah baris = ganti kategori/template panel |

---

## 2. Kondisi Kode Hari Ini (bukti per baris)

| Fakta | Lokasi | Akibat |
|---|---|---|
| Sidebar `fixed top-0 right-0 w-full max-w-xl` | `BKUSidebar.jsx:278` | maks 576px |
| Tab sidebar = array inline `detail`, `dokumentasi` | `BKUSidebar.jsx:353-356` | tab ke-3 harus disisipkan paling kiri |
| Pemetaan kategori BKU → SPJ | `BKUSidebar.jsx:40-46` (`KATEGORI_KE_SPJ`) | honor · perjalanan_dinas · mamin · atk · pemeliharaan |
| Panel detail LPJ hidup **di dalam** halaman | `DokumenSPJPage.jsx:711` (`renderDetailPanel`) | file 1107 baris; **belum** komponen terpisah |
| Form per kategori | `DokumenFormPreview.jsx:412` (`renderForm`) | dipakai lewat `cardId` + `selectedSub` |
| Preview dokumen | `previewDocs.js:445` (`buildPreviewDocs`) | satu pintu data cetak |
| Status LPJ dibaca dari `dokumen_lpj` | `DokumenSPJPage.jsx:383` | hanya status, bukan isi form |
| `BKUSidebar` dipakai di halaman BKU | `BKUPage.jsx:837` | props: `transaction`, `allTransactions`, `onClose`, … |

### 2.1 ⚠️ Panel LPJ **bukan** komponen — harus diekstrak
`renderDetailPanel()` (`DokumenSPJPage.jsx:711-~1000`) memuat header, badge prefill,
tab sub-kategori, `DokumenFormPreview`, tombol Cek/Cetak, dan `MenuGuide`. Menyalinnya
ke sidebar = dua sumber kebenaran yang akan bercabang. **Keputusan rancangan: ekstraksi
murni (pindahkan, jangan tulis ulang) menjadi komponen bersama**, dan `DokumenSPJPage`
memakai komponen itu juga. Perilaku menu LPJ wajib identik sebelum/sesudah.

### 2.2 ⚠️ Menu LPJ **tidak menyimpan** apa pun
`storageHelper.set` **tidak ada** di `DokumenSPJPage.jsx` (grep 0 hit); tidak ada tombol
Simpan/Tandai. `dokumen_lpj` hanya **dibaca** (`:383`, `dataContextBuilder.js:232`,
`queryEngine.js:52`) — tidak pernah ditulis. Artinya isian LPJ hari ini **in-memory**:
hilang saat ganti menu atau tutup panel.
→ Keputusan #4 ("bisa disimpan") adalah **fitur baru**, bukan peniruan. Perlu ADR baru.

### 2.3 ⚠️ ATK/Penggandaan tidak punya form
`CARDS` (`DokumenSPJPage.jsx:92-101`): `penggandaan` = `hasTemplate: false, infoOnly: true`.
Hanya honor · perjalanan_dinas · mamin · pemeliharaan yang punya form & preview.
→ `KATEGORI_KE_SPJ.atk → 'PENGGANDAAN'` **tidak bisa** menghasilkan panel "identik".
Butuh keputusan (§10 D-2).

---

## 3. User Stories

### US-01 — Membuka dokumen LPJ dari baris BKU
**As** bendahara sekolah, **I want** klik satu baris kegiatan belanja dan langsung melihat dokumen LPJ kategorinya dalam layar penuh, **so that** saya tidak kehilangan konteks baris yang sedang saya kerjakan.

Acceptance Criteria:
- [ ] Klik baris dengan kategori honor / perjalanan_dinas / mamin / pemeliharaan → panel melebar **100% viewport**, bukan 576px.
- [ ] Tab pertama dalam keadaan aktif = **Dokumen LPJ**; isinya panel kategori baris itu (mis. Mamin → "Detail Dokumen Makan & Minum").
- [ ] Tab **Detail** dan **Dokumentasi** tetap ada dan tetap berfungsi seperti sebelumnya.
- [ ] Tombol close di header menutup panel dan mengembalikan tampilan tabel BKU tanpa kehilangan filter/scroll.

### US-02 — Panel benar-benar identik dengan menu LPJ
**As** bendahara sekolah, **I want** isi panel sama dengan yang saya lihat di menu Dokumen LPJ, **so that** tidak ada dua versi dokumen yang berbeda.

Acceptance Criteria:
- [ ] Untuk 4 kategori berform: jumlah field, label, urutan, dan tombol aksi **sama** dengan `DokumenSPJPage` (dibuktikan checklist per kategori, bukan klaim).
- [ ] Satu komponen dipakai kedua tempat (tidak ada salinan JSX panel).
- [ ] Perubahan di menu LPJ otomatis terlihat di sidebar (dan sebaliknya) — dibuktikan dengan mengubah satu file komponen bersama.
- [ ] Tidak ada `className`/layout baru yang mengubah tampilan cetak (`sk-print-area`, A4/`mm`).

### US-03 — Isian tersimpan per NoBukti
**As** bendahara sekolah, **I want** isian saya tersimpan pada baris BKU-nya, **so that** saya bisa menutup panel lalu melanjutkan nanti.

Acceptance Criteria:
- [ ] Tombol **Simpan** menulis satu entri ke storage; tidak menimpa baris lain.
- [ ] Tutup panel → klik baris yang sama → isian kembali utuh (field, sub-kategori, dokumen).
- [ ] Baris berbeda dengan NoBukti berbeda → isian terpisah.
- [ ] Muat ulang halaman (F5) → isian tetap ada.
- [ ] Baris tanpa NoBukti → penyimpanan ditolak dengan pesan jujur (tidak menyimpan ke kunci kosong).

### US-04 — Rincian se-NoBukti ikut dalam satu dokumen
**As** bendahara sekolah, **I want** satu bukti dengan beberapa rincian menjadi satu dokumen, **so that** dokumen tidak terpecah padahal pembayarannya satu.

Acceptance Criteria:
- [ ] Baris yang tergabung dalam grup se-NoBukti menampilkan **satu** panel yang sama (bukan dokumen berbeda per baris).
- [ ] Rincian grup (uraian + nominal) tampil di form/preview sesuai data grup, bukan hanya baris yang diklik.
- [ ] Bila grup se-NoBukti memuat kategori berbeda (mis. mamin + ATK) → panel memakai kategori **dominan** (logika `grupDenganDominan` yang sudah ada) dan menampilkan peringatan.

### US-05 — Preview hanya setelah form lengkap
**As** bendahara sekolah, **I want** preview dokumen muncul saat isian sudah lengkap, **so that** saya tidak melihat dokumen setengah jadi dan tahu apa yang kurang.

Acceptance Criteria:
- [ ] Sebelum semua field wajib terisi: panel preview **tidak dirender**; ada indikator jumlah field wajib yang belum terisi.
- [ ] Setelah semua field wajib terisi: preview muncul otomatis (tanpa reload).
- [ ] Menghapus satu field wajib → preview hilang lagi.
- [ ] Daftar field wajib berasal dari **satu sumber konfigurasi** per kategori (bukan hardcode di sidebar).

### US-06 — Baris non-LPJ tidak berubah
**As** bendahara sekolah, **I want** baris Penerimaan BOSP / Setor Pajak / Tarik Tunai / Pergeseran Bank tetap seperti sekarang, **so that** alur yang sudah familiar tidak rusak.

Acceptance Criteria:
- [ ] 4 tipe tersebut → sidebar tetap `max-w-xl` (≤576px), tab default tetap **Detail**.
- [ ] Tidak ada tab "Dokumen LPJ" pada baris non-LPJ.
- [ ] Tidak ada error console saat membuka baris non-LPJ.

### US-07 — Navigasi ‹ › mengganti panel
**As** bendahara sekolah, **I want** panah sebelumnya/berikutnya tetap bekerja, **so that** saya bisa memeriksa beberapa baris berurutan.

Acceptance Criteria:
- [ ] ‹ › tetap tampil di header panel full width.
- [ ] Pindah ke baris berkategori lain → panel berganti kategori/template, tanpa menutup sidebar.
- [ ] Pindah dari baris berkategori ke baris non-LPJ → sidebar menyempit kembali & tab berpindah ke Detail.
- [ ] Isian baris sebelumnya **tidak hilang** bila sudah disimpan.

### US-08 — Menjaga menu LPJ dari regresi
**As** pengelola produk, **I want** menu Dokumen LPJ berperilaku sama setelah ekstraksi, **so that** perbaikan satu tempat tidak merusak yang lain.

Acceptance Criteria:
- [ ] Sebelum/sesudah ekstraksi: 4 kategori menghasilkan markup panel yang sama (dibandingkan per kategori).
- [ ] Prefill dari BKU (badge "dari BKU", Urungkan) tetap bekerja di menu LPJ.
- [ ] `MenuGuide` tetap muncul di 4 menu LPJ (`key={selectedCard.id}` tidak hilang).
- [ ] `npm run build` exit 0.

---

## 4. Data Access Surface

Aplikasi **tanpa backend** — tidak ada endpoint HTTP. "API" = kontrak akses storage.

| Operasi | Kunci storage | Fungsi | Deskripsi |
|---|---|---|---|
| Baca isian | `spj_lpj_bku` *(usulan nama)* | `getLpjBku(noBukti, kategori)` | Ambil satu entri |
| Tulis isian | `spj_lpj_bku` | `setLpjBku(noBukti, kategori, payload)` | Tulis satu entri, tidak menyentuh entri lain |
| Hapus isian | `spj_lpj_bku` | `removeLpjBku(noBukti, kategori)` | Opsional (belum diminta) |
| Baca status LPJ | `spj_dokumen_lpj` | `storageHelper.get('dokumen_lpj', {})` | **Read-only**, perilaku lama dipertahankan |
| Baca BKU | `spj_bku_data` | `storageHelper.get('bku_data')` | Sumber baris & rincian |

Bentuk payload (usulan, dikunci di BLUEPRINT):

```json
{
  "mamin|BNU-07": {
    "kategori": "mamin",
    "subId": "kegiatan",
    "templateId": "undangan_mamin",
    "formData": { "acara": "...", "tanggal": "2026-10-21", "nominal": 1500000 },
    "savedAt": "2026-10-21T08:40:00.000Z"
  }
}
```

Aturan:
- Kunci entri = `<kategori>|<noBukti>` (huruf asli NoBukti, di-trim; case-insensitive saat cari).
- Prefix `spj_` **wajib** lewat `storageHelper` — jangan `localStorage` langsung.
- Semua operasi MVP; tidak ada Phase 2.

---

## 5. Data Requirements

| Entity | Key Fields | Hubungan |
|---|---|---|
| `LpjBkuEntry` | `kategori`, `noBukti`, `subId`, `templateId`, `formData`, `savedAt` | milik satu grup se-NoBukti di `bku_data` |
| `BkuTransaction` (ada) | `row`, `tanggal`, `noBukti`, `uraian`, `kodeRekening`, `kodeKegiatan`, `pengeluaran`, `tipe` | sumber baris; **read-only** dari sprint ini |
| `KategoriLpj` (ada) | `id`, `nama`, `subKategori[]`, `hasTemplate` | `honor` · `perjalanan_dinas` · `mamin` · `pemeliharaan` berform |
| `FieldWajib` (baru) | `kategori`, `subId`, `fields[]` | definisi gate preview; butuh persetujuan §10 D-1 |

Tidak ada migrasi data lama: kunci `spj_lpj_bku` mulai kosong.

---

## 6. Non-Functional Requirements

**Performance**
- Buka panel (klik baris → panel ter-render) ≤ **300 ms** pada data 421 transaksi (ukuran PDF setahun).
- Tidak ada re-render seluruh tabel BKU saat mengetik di form (input terisolasi di komponen panel).

**Security / privasi**
- Tidak ada data keluar perangkat: 0 request jaringan baru (dibuktikan tab Network).
- Semua akses storage lewat `storageHelper` (prefix `spj_`); tidak ada `localStorage` langsung di file baru.
- Tidak menyimpan data ke kunci kosong/`undefined` (§US-03).

**Konsistensi visual**
- Blue-only `#004ac6` + slate. 0 hit `emerald|amber|rose|violet|cyan` di file baru/diubah (pola regex, bukan `grep -c`).
- Kertas cetak tetap A4, satuan `mm`, orientasi dari `templateConfig`.

**Maintainability**
- Panel LPJ = **satu** komponen bersama; 0 salinan JSX.
- Modul baru ≤ 200 baris (konvensi repo); file > 200 baris wajib dipecah.
- `bkuParser.js` **0 diff** (status TABU).

**Kompatibilitas**
- Data lama tanpa `spj_lpj_bku` → tidak crash, panel kosong.
- Browser target: Chromium (Edge) — perilaku cetak yang ada tidak berubah.

---

## 7. Success Metrics

| Kriteria brief | Metrik | Target |
|---|---|---|
| Sidebar melebar penuh | Lebar panel untuk baris LPJ | 100% viewport |
| Panel identik dengan LPJ | Checklist field per kategori | 4/4 kategori cocok 100% |
| Bisa disimpan per NoBukti | Round-trip simpan → tutup → buka → F5 | 4/4 kategori utuh |
| Preview bergantung kelengkapan | Uji gate (lengkap/kurang 1 field) | 2/2 kondisi benar |
| Baris non-LPJ tidak berubah | Lebar panel 4 tipe non-LPJ | ≤576px, tab Detail |
| Tidak merusak menu LPJ | Build + checklist panel LPJ | exit 0, 4/4 kategori sama |

---

## 8. Out of Scope

> Item berikut **dikecualikan eksplisit**. JANGAN diimplementasikan. Bila sebuah user
> story menyiratkan fitur di sini, story itu yang dikoreksi — bukan scope yang dilebarkan.

- Mengubah perilaku/tampilan menu Dokumen LPJ (selain ekstraksi internal yang hasilnya identik).
- Menambahkan tombol Simpan ke menu Dokumen LPJ (diputuskan terpisah).
- Baris non-LPJ: Penerimaan BOSP, Setor Pajak, Tarik Tunai, Pergeseran Bank, Bunga Bank, Pungut PPh.
- Kategori ATK/Penggandaan (lihat §10 D-2).
- Cetak langsung dari dalam sidebar; pengaturan kertas; perubahan `templateConfig` blok cetak.
- `bkuParser.js`, `previewDocs.js` (kecuali bila ekstraksi menuntut pemindahan murni), dan seluruh jalur impor BKU.
- Migrasi data LPJ lama.

---

## 9. Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Ekstraksi `renderDetailPanel` dari file 1107 baris | Regresi menu LPJ | Pindahkan (bukan tulis ulang) → bandingkan markup 4 kategori → build + checklist US-08 |
| Definisi "field wajib" belum ada di kode | Gate preview tidak bisa diuji | §10 D-1 wajib dijawab sebelum BLUEPRINT; daftar disimpan di satu konfigurasi |
| Dua pintu data (sidebar simpan, LPJ tidak) | User bingung isian "hilang" di LPJ | ADR + label jujur; penyelarasan LPJ jadi sprint terpisah |
| Grup se-NoBukti lintas kategori | Dokumen salah kategori | Pakai `grupDenganDominan` + peringatan eksplisit |
| Sidebar full width menutupi tabel | User kehilangan penanda baris | Header panel menampilkan NoBukti + uraian + nominal + "Baris n/N" |

---

## 10. Keputusan yang Masih Terbuka (BLOCKING)

**D-1 — Daftar field wajib per kategori.**
PRD menetapkan *aturan*, bukan daftar: field wajib = field yang **muncul di dokumen cetak**
dan **bukan** berasal dari BKU / Data Sekolah / Pejabat. Daftar konkret per kategori
(4 kategori × sub-kategori) disusun di BLUEPRINT lalu **disetujui user**. Tanpa persetujuan,
gate preview tidak diimplementasikan.
→ Opsi: (a) setujui aturan ini dan daftar disusun di BLUEPRINT; (b) user menulis daftar sendiri.

**D-2 — ATK/Penggandaan tidak punya form.**
Opsi: (a) baris ATK tetap sidebar sempit (dianggap non-LPJ); (b) full width + panel info
("Master Penggandaan · Jumlah Lembar · Bukti Pembayaran") tanpa form/preview;
(c) ditunda ke sprint lain.

**D-3 — Nama kunci storage & bentuk payload.**
Usulan: `spj_lpj_bku` dengan kunci `<kategori>|<noBukti>`. Alternatif: menumpang `dokumen_lpj`
yang sudah ada (risiko bercampur dengan status). Perlu keputusan sebelum coding.

**D-4 — Menu LPJ tetap tanpa simpan?**
Bila sidebar menyimpan dan menu LPJ tidak, ada dua perilaku berbeda untuk dokumen yang sama.
Opsi: (a) biarkan (sprint terpisah menyelaraskan); (b) sekalian tambahkan simpan ke LPJ di sprint ini (menambah scope).

---

## 11. Self-Review

- [x] Setiap user story punya acceptance criteria yang bisa diuji (8 story).
- [x] "API surface" diganti **Data Access Surface** — aplikasi tanpa backend; mengarang endpoint = palsu.
- [x] Data requirements mencakup semua entitas yang disebut story (`LpjBkuEntry`, `FieldWajib`).
- [x] NFR spesifik & terukur (300 ms, 0 request, ≤576px, ≤200 baris).
- [x] Out-of-scope eksplisit (9 butir) dan tidak dilanggar story mana pun.
- [x] Success metrics memetakan 6 kriteria brief.
- [x] 3 temuan kode didokumentasikan dengan lokasi baris, bukan asumsi.
- [ ] **D-1 … D-4 belum dijawab** → PRD ini belum boleh masuk BLUEPRINT.

---

**MULAI:** PRD ini disetujui + D-1…D-4 dijawab.
**SELESAI:** Architect pack Sprint 017 (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT)
ada di `planning/sprints/sprint-017/`, dry run disetujui, dan terbukti di browser:
klik baris Mamin → full width → panel identik → isi → Simpan → tutup → buka lagi → isian utuh.
