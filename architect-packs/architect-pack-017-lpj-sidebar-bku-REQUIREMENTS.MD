# REQUIREMENTS — Sprint 017: Panel Dokumen LPJ di Sidebar BKU (Full Width)

> ⚠️ **SALINAN AUDIT — snapshot saat pack disusun (2026-10-21), BUKAN dokumen hidup.**
> Revisi pasca-persetujuan hanya ada di `planning/sprints/sprint-017/<SAMA>.MD`.
> Yang berubah: preview **selalu tampil** (rancangan "sembunyikan preview" dibatalkan user
> 2026-10-21) · tab otomatis memuat entri tersimpan (EX-7) · oracle baru `test-lpj-guard` /
> `test-lpj-sidebar`. Lihat `planning/sprints/sprint-017/BUILD-REPORT.MD`.
> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG sebelum pack ini disetujui
> (AGENTS.MD). Dokumen ini menjawab **apa & mengapa**, bukan **bagaimana** (itu BLUEPRINT).
> Input: `planning/sprints/sprint-017/PRD.md` (turunan Idea Brief 2026-10-21, 8 keputusan user).
> Runtime: React 18 + Vite + Tailwind, **tanpa backend**, localStorage prefix `spj_`.

---

## 1. Tujuan Sprint

Satu kalimat: **dari baris BKU, user bisa mengisi & menyimpan dokumen LPJ kategori baris itu
tanpa meninggalkan halaman BKU.**

Ukuran keberhasilan (bukan opini): klik baris Mamin → panel selebar layar → tab "Dokumen LPJ"
aktif → isi form → Simpan → tutup → klik baris yang sama → isian utuh setelah reload.

## 2. Masalah yang Diselesaikan

Alur hari ini memaksa keluar konteks:

1. Klik baris BKU → sidebar 576px (`BKUSidebar.jsx:278` `w-full max-w-xl`).
2. Cari tombol aksi → **pindah halaman** ke `/dashboard/dokumen-lpj`.
3. Cari menu kategori → isi form → (tidak ada simpan; isian hilang saat ganti menu).

Konteks yang tertinggal: NoBukti, uraian, nominal, tanggal, rincian grup. User harus
mengingatnya atau membuka dua tab.

## 3. Ruang Lingkup

### 3.1 Termasuk
| # | Item |
|---|---|
| S-1 | Sidebar **full width** (100% viewport) untuk baris berkategori LPJ, dengan tombol close |
| S-2 | Tab baru **Dokumen LPJ** sebagai tab pertama & default; tab Detail & Dokumentasi tetap |
| S-3 | Isi tab = panel LPJ kategori baris itu, **komponen yang sama** dengan menu Dokumen LPJ |
| S-4 | Form bisa diisi; tombol **Simpan** menulis ke storage per **NoBukti** |
| S-5 | Muat ulang otomatis saat baris dibuka kembali (termasuk setelah F5) |
| S-6 | Preview dokumen tampil **hanya bila semua field wajib terisi** |
| S-7 | Cakupan data = baris diklik + rincian se-NoBukti |
| S-8 | Tombol ‹ › tetap ada dan ikut mengganti panel |
| S-9 | Baris non-LPJ **tidak berubah** (sidebar sempit, tab default Detail) |

### 3.2 Kategori yang mendapat panel
| Kategori BKU | `cardId` LPJ | Punya form? | Dapat panel? |
|---|---|---|---|
| `honor` | `honor` | ya (`hasTemplate: true`) | ya |
| `perjalanan_dinas` | `perjalanan_dinas` | ya | ya |
| `mamin` | `mamin` | ya | ya |
| `pemeliharaan` | `pemeliharaan` | ya | ya |
| `atk` | `penggandaan` | **tidak** (`infoOnly: true`) | **tidak** (lihat A-2) |

### 3.3 Tidak termasuk (dilarang dikerjakan)
- Menambah tombol Simpan ke menu Dokumen LPJ; mengubah tampilan/perilaku menu LPJ selain
  ekstraksi yang hasilnya identik.
- Baris non-LPJ: `PENERIMAAN_BOSP`, `SETOR_PAJAK`, `TARIK_TUNAI`, `PERGESERAN_BANK`,
  `BUNGA_BANK`, `PAJAK_BUNGA`, `PUNGUT_PPH`, `SALDO_AWAL`.
- Kategori ATK/Penggandaan (A-2).
- Cetak langsung dari sidebar; perubahan `templateConfig` blok cetak; perubahan A4/`mm`.
- `bkuParser.js` (**TABU**, 0 diff) dan seluruh jalur impor BKU/Excel/PDF.
- Migrasi data LPJ lama; sinkronisasi dua arah dengan `spj_dokumen_lpj`.

## 4. Keputusan User yang Dikunci (dari Idea Brief 2026-10-21)

| # | Keputusan | Bukti penerapan |
|---|---|---|
| K-1 | Sidebar full width + tombol close | lebar panel 100% viewport |
| K-2 | Panel LPJ = tab pertama & default | tab urutan ke-1 aktif saat buka |
| K-3 | Identik dengan menu LPJ per kategori | satu komponen, checklist 4 kategori |
| K-4 | Bisa diisi & disimpan | round-trip simpan → buka → F5 |
| K-5 | Cakupan = baris + rincian se-NoBukti | uji grup se-NoBukti |
| K-6 | Baris non-LPJ tetap sempit | 4 tipe diuji ≤576px |
| K-7 | Form di atas, preview di bawah; preview hanya bila lengkap | uji 2 kondisi |
| K-8 | ‹ › tetap & ikut ganti panel | uji pindah lintas kategori |

## 5. Asumsi yang Dikunci untuk Pack (WAJIB dikonfirmasi saat dry run)

Empat keputusan PRD §10 belum dijawab user. Pack memakai opsi berikut agar bisa disusun;
**bila user menolak salah satu, pack direvisi sebelum coding.**

| # | Asumsi | Alasan memilih | Dampak bila ditolak |
|---|---|---|---|
| **A-1** | Field wajib diturunkan **dari `templateConfig`** (bukan daftar hardcode): `header.nomor` bila `nomor !== false`; semua `table-fields[].key`; `table-letter-header` kiri+kanan; `table-dinamis` wajib ≥1 baris; **kecuali** key yang punya nilai non-kosong di `defaults` | deterministik, satu sumber, tidak menebak | daftar manual per kategori → task T-06 diganti |
| **A-2** | Baris **ATK/Penggandaan diperlakukan non-LPJ** (sidebar sempit), karena `penggandaan` = `infoOnly` tanpa form | konsisten dengan K-6; tidak menampilkan panel palsu | opsi (b): panel info tanpa form → +1 task |
| **A-3** | Kunci storage baru **`spj_lpj_bku`**, entri `<kategori>\|<noBukti>` | terpisah dari `spj_dokumen_lpj` (status), tidak bercampur | menumpang `dokumen_lpj` → risiko data status rusak |
| **A-4** | Menu LPJ **tetap tanpa simpan** (penyelarasan = sprint lain) | menjaga scope; out-of-scope §3.3 | bila ingin sekalian → +2 task & +1 risiko besar |

## 6. Fakta Kode yang Mengikat Rancangan (terverifikasi)

| Fakta | Lokasi | Konsekuensi requirement |
|---|---|---|
| Panel LPJ hidup di dalam halaman | `DokumenSPJPage.jsx:711` `renderDetailPanel` | wajib **ekstraksi**, bukan salin (K-3) |
| Panel memakai grid form-kiri/preview-kanan | `DokumenSPJPage.jsx:828` | butuh mode layout `stack` untuk sidebar (K-7) |
| Form & preview sudah komponen terpisah | `DokumenFormPreview.jsx:235`, `PanelPreviewDocument.jsx:104` | jangan ditulis ulang |
| Prefill dari BKU ~120 baris di dalam halaman | `DokumenSPJPage.jsx:178-291` | wajib diekstrak agar sidebar tidak menduplikasi |
| Menu LPJ tidak menyimpan | `storageHelper.set` **0 hit** di `DokumenSPJPage.jsx` | K-4 = fitur baru, perlu ADR |
| Gate field wajib yang ada hanya 3 item generik | `SummaryCard.jsx:20-26` `readinessCheck` | tidak cukup untuk per-kategori (A-1) |
| Pemetaan kategori BKU→LPJ | `BKUSidebar.jsx:40-46` | sumber tunggal, jangan diubah |
| `penggandaan` tanpa form | `DokumenSPJPage.jsx:92-101` | A-2 |

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement | Cara diperiksa |
|---|---|---|
| Performa | Buka panel ≤300 ms pada 421 transaksi | stopwatch console, 3 kali |
| Isolasi render | Mengetik di form tidak me-render ulang tabel BKU | React DevTools highlight / hitung render |
| Jaringan | 0 request baru | tab Network kosong |
| Storage | Semua lewat `storageHelper`, prefix `spj_` | grep `localStorage\.` di file baru = 0 |
| Visual | Blue-only `#004ac6` + slate | regex `\b(bg|text|border|ring)-(emerald|amber|rose|violet|cyan)` = 0 |
| Cetak | A4, `mm`, orientasi `templateConfig` tidak berubah | diff `templateConfig.js` = 0 |
| Ukuran modul | File baru ≤200 baris; `BKUSidebar.jsx` tetap ≤1000 | `wc -l` |
| Tabu | `bkuParser.js` 0 diff | `git diff --stat` |

## 8. Risiko Requirement

| # | Risiko | Mitigasi (dibuktikan di ACCEPTANCE) |
|---|---|---|
| R-1 | Ekstraksi panel meregresi menu LPJ | snapshot render sebelum/sesudah, 4 kategori, wajib identik |
| R-2 | Ekstraksi prefill mengubah isi otomatis | oracle `prefillLpj` membandingkan output lama vs baru per kategori |
| R-3 | A-1 membuat gate terlalu ketat (preview tak pernah muncul) | uji "lengkap" per kategori wajib PASS; bila tidak, aturan direvisi |
| R-4 | Dua sumber data (sidebar simpan, LPJ tidak) | ADR + catatan di pack; tidak diklaim sebagai bug |
| R-5 | Sidebar full width menutupi konteks baris | header panel menampilkan NoBukti + uraian + nominal + "Baris n/N" |

## 9. Definition of Done (sprint)

1. 4 kategori berform: klik baris → full width → panel identik → isi → Simpan → tutup → buka → F5 → utuh.
2. 8 tipe non-LPJ (termasuk ATK): sidebar tetap ≤576px, tab Detail, 0 error console.
3. Menu LPJ: build exit 0, snapshot panel 4 kategori identik sebelum/sesudah.
4. `npm run build` exit 0; semua oracle sprint ini PASS.
5. `STATE.MD` + `DECISIONS.MD` (ADR baru) + checklist ACCEPTANCE diperbarui.

---

**MULAI:** pack ini disetujui (termasuk A-1…A-4).
**SELESAI:** butir §9 terbukti dengan output asli, bukan klaim.
