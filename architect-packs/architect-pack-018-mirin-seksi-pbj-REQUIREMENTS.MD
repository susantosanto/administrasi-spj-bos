# REQUIREMENTS — Sprint 018: Dropdown NoBukti Mirip + Form Mamin 6 Seksi + Dokumen PBJ di Sidebar BKU

> Status: **DRAFT — menunggu persetujuan user.** Coding DILARANG sebelum pack ini disetujui
> (AGENTS.MD). Dokumen ini menjawab **apa & mengapa**, bukan **bagaimana** (itu BLUEPRINT).
> Input: `planning/sprints/sprint-018/PRD.md` (turunan Idea Brief 2026-10-21, 12 keputusan user).
> Runtime: React 18 + Vite + Tailwind, **tanpa backend**, localStorage prefix `spj_`.

---

## 1. Tujuan Sprint

Satu kalimat: **dari satu baris belanja BKU, operator bisa memindahkan diri ke baris yang sama
kegiatan di bulan lain, mengisi form Mamin yang ringkas tanpa isian dobel, dan punya dokumen
PBJ untuk NoBukti yang sama — semuanya tanpa pindah halaman.**

Ukuran keberhasilan (bukan opini): klik baris Mamin → dropdown menampilkan kandidat baris
Februari → pilih → panel berpindah ke baris Februari → form tampil 6 seksi (Cek: field
"Tanggal dana masuk" tidak lagi ditagih) → isi Undangan & Pesanan → blok PBJ terisi otomatis
dari BKU → preview **satu daftar** (Undangan, Pesanan, Notulen, Daftar Hadir, … lalu dokumen PBJ)
→ cetak → isian LPJ & PBJ tersimpan per NoBukti → reload → utuh.

## 2. Masalah yang Diselesaikan

1. **Kegiatan rutin tiap bulan diulang dari nol.** Baris yang sama (kode rekening + kode
   kegiatan identik) muncul di Jan, Feb, Mar; operator harus buka baris satu per satu dan
   mengisi ulang nama kegiatan, menu pesanan, daftar hadir, nomor surat.
2. **Form Mamin memakai data yang sama di banyak tempat** (tanggal, tempat, kegiatan, isi surat)
   → operator mengisi berulang dan dokumen bisa tidak sinkron antar surat.
3. **Satu field yang tak berguna menggantung** — "Tanggal dana masuk" hanya dipakai sebagai
   syarat gate, tidak pernah tercetak (F-1) → user dipaksa mengisi data yang tak muncul di surat.
4. **PBJ terpisah dari konteks baris.** Dokumen PBJ hanya ada di halaman Dokumen Kelengkapan
   → operator melompat halaman, dan isian PBJ melekat ke form global (bukan ke baris belanja).

## 3. Ruang Lingkup

### 3.1 Termasuk
| # | Item |
|---|---|
| S-1 | Dropdown **NoBukti mirip** di sidebar detail transaksi: kandidat = baris dengan `kodeRekening` + `kodeKegiatan` identik, bulan berbeda (semua kategori) |
| S-2 | Memilih kandidat → **panel detail berpindah** ke baris itu (rekap, form, preview, penyimpanan ikut) |
| S-3 | Peringatan **"simpan dulu"** bila isian belum tersimpan |
| S-4 | Form Mamin di sidebar jadi **6 seksi** (Data Dasar · Daftar Hadir · Undangan · Pesanan · Buku Tamu · Notulen AI) |
| S-5 | **Prinsip satu sumber**: field yang datanya sudah ada (seksi sebelumnya / Data Sekolah / BKU) **tidak** punya input |
| S-6 | Teks bawaan (isi surat + field lain — daftar lengkap di §3.2) dipindah ke **preview**, hardcode/otomatis dari sumber resmi |
| S-7 | **Kolom NIP** pada Daftar Hadir (form + cetak); input TTD dihapus, kolom TANDA TANGAN tetap tercetak |
| S-8 | Input **"Tanggal dana masuk" dihapus** dari sidebar untuk 4 kategori LPJ; gate sidebar berhenti menagihnya |
| S-9 | Tombol **"Generate AI Notulen"** (Seksi 6) — data notulen dari form di atasnya |
| S-10 | Blok **Dokumen PBJ** di sidebar: di bawah form LPJ, di atas Panel Preview; 6 tab; isian otomatis dari BKU |
| S-11 | PBJ **tersimpan per NoBukti** (kunci baru), terpisah dari PBJ global |
| S-12 | Panel preview **satu daftar**: LPJ dulu → PBJ menyusul; nama dokumen unik |

### 3.2 Field yang dipindah ke preview (tanpa input) — daftar final
| Dokumen | Field tanpa input | Sumber nilainya |
|---|---|---|
| Surat Undangan | `hariUndangan`, `tanggalAcara`, `tempatAcara`, `waktuAcara` | Seksi 1 (tanggal/waktu/tempat) |
| Surat Undangan | `perihalUndangan` | nama kegiatan (template Undangan) |
| Surat Undangan | `alamatUndangan`, `instansiUndangan` | Data Sekolah |
| Surat Undangan | `sifatUndangan` = "Biasa", `lampiranUndangan` = "-" | hardcode |
| Surat Undangan | `kepadaUndangan` = "Bapak/Ibu Guru" | hardcode |
| Surat Undangan | `isiUndangan` | template Undangan (teks baku + nama kegiatan) |
| Surat Pesanan | `sifatPesanan` = "Biasa" | hardcode |
| Surat Pesanan | `perihalPesanan` = "Surat Pesanan" | hardcode |
| Surat Pesanan | `isiPesanan` | template Pesanan (nama kegiatan + tanggal kegiatan) |
| Surat Pesanan | `hariPesanan` | **Tanggal Surat Pesanan** (default; bisa dikoreksi user) |
| Buku Tamu | `tanggal` | Seksi 1 (tanggal) |
| Buku Tamu | `bertemu` | Data Sekolah (Kepala Sekolah) |
| Buku Tamu | `diterima` | "Kepala Sekolah" |
| Buku Tamu | `tujuan`, `uraian` | nama kegiatan |
| Semua | `tanggalDanaMasuk` | tanggal baris BKU (nilai, tanpa input) |

### 3.3 Tidak termasuk (dilarang dikerjakan)
- Halaman **Dokumen LPJ (menu kiri)**: tidak memakai 6 seksi, tidak memakai dropdown, tidak memakai
  blok PBJ, **tetap** punya input "Tanggal dana masuk".
- Halaman **Dokumen Kelengkapan** & form PBJ global `spj_pbj_form` — **tidak diubah**, **tidak**
  disinkronkan dua arah.
- Isi/urutan/nomor dokumen cetak selain **kolom NIP pada Daftar Hadir**.
- Menghapus kolom TANDA TANGAN di Daftar Hadir atau Buku Tamu.
- Mengubah `SummaryCard.jsx` (fungsi `readinessCheck` dipakai halaman LPJ) dan `bkuParser.js` (TABU).
- OCR, impor PDF/Excel, `bkuPdf*`, `bkuParser`, `xlsx` — jalur impor BKU utuh.
- Migrasi data lama; sinkronisasi PBJ global ↔ PBJ per baris.
- Dependency baru (`package.json` & `package-lock.json` **0 diff**).
- Backend, akun, sinkronisasi antar perangkat.

## 4. Keputusan User yang Dikunci (dari Idea Brief 2026-10-21)

| # | Keputusan | Bukti penerapan |
|---|---|---|
| K-1 | Kandidat = kode rekening + kode kegiatan identik | oracle filter 3/3 non-kandidat tertolak |
| K-2 | Berlaku untuk semua kategori | dropdown ada di 4 kategori berform |
| K-3 | Memilih kandidat = berpindah konteks detail transaksi | header/form/preview/target simpan ikut baris baru |
| K-4 | Isian belum disimpan → peringatan "simpan dulu" | dialog muncul; Batal → data utuh |
| K-5 | 6 seksi berlaku di sidebar BKU saja | hash render halaman LPJ identik |
| K-6 | Satu data = satu sumber | checklist: tiap key form unik per seksi |
| K-7 | Teks bawaan → preview | 17 field (§3.2) tanpa input |
| K-8 | Nomor surat tetap 3 | Nomor Surat / Nomor Undangan / Nomor Pesanan |
| K-9 | NIP masuk Daftar Hadir; TTD input hilang, kolom cetak tetap | config + rows `nip` + kolom TANDA TANGAN |
| K-10 | "Tanggal dana masuk" tak ada di sidebar (4 kategori) | 0 input + 0 pelanggaran gate sidebar |
| K-11 | PBJ di sidebar, semua kategori, per NoBukti | kunci `spj_pbj_bku` |
| K-12 | Preview satu daftar; nama unik (LPJ menang bila sama) | urutan docs + 100% nama unik |

## 5. Asumsi yang Dikunci untuk Pack (WAJIB dikonfirmasi saat dry run)

Sembilan asumsi PRD §10 dipakai agar pack bisa disusun. **Bila user menolak salah satu, pack
direvisi sebelum coding** (HANDOFF STOP-4).

| # | Asumsi | Alasan memilih | Dampak bila ditolak |
|---|---|---|---|
| **A-1** | Kandidat = `kodeRekening` **dan** `kodeKegiatan` identik, bulan berbeda, bukan baris aktif; kode kosong → bukan kandidat | menempel jawaban user | task T-02 berubah |
| **A-2** | Berpindah memakai `onNavigate` yang sudah ada | sidebar sudah punya navigasi baris | +1 task (callback baru) |
| **A-3** | "Simpan dulu" = dialog konfirmasi di dalam sidebar | konsisten UI | `window.confirm` |
| **A-4** | Nilai otomatis diterapkan di **lapisan formData** (form + preview + cetak satu sumber) & ikut tersimpan | 2 builder cetak/preview (F-3) | computed saat render → ubah 2 builder |
| **A-5** | PBJ per baris: kunci `spj_pbj_bku`, entri `<kategori>\|<noBukti>` | terpisah dari PBJ global | menumpang global → risiko tertimpa |
| **A-6** | Semua perubahan form Mamin hanya untuk `layout='stack'` | K-5 | seluruh kategori ikut berubah |
| **A-7** | Kolom NIP **ikut tercetak** | K-9 | NIP hanya di app |
| **A-8** | "Hari/Tanggal" Seksi 4 tetap ada; default = hari+tanggal dari Tanggal Surat Pesanan | "hanya 3 yang dibuang" + "tgl dari tgl surat pesanan" | checklist seksi 4 berubah |
| **A-9** | Satu field `tanggalSurat` untuk Undangan **dan** Pesanan | prinsip satu sumber (K-6) | dua field → +1 field + 1 keputusan UI |

## 6. Fakta Kode yang Mengikat Rancangan (terverifikasi 2026-10-21)

| Fakta | Lokasi | Konsekuensi requirement |
|---|---|---|
| Sidebar sudah menerima `allTransactions` + `onNavigate` | `BKUSidebar.jsx:60`, `:260-263` | S-2 tanpa callback baru (A-2) |
| `onNavigate` = `setSidebarTransaction(tx)` | `BKUPage.jsx:841` | pindah = ganti state transaksi |
| Layout `stack` = 1 kolom form→preview | `DetailDokumenLpjBody.jsx:43-50` | blok PBJ masuk di antara (S-10) |
| Mamin branch besar di `DokumenFormPreview.jsx` | `:1023-1637` (file 2069 baris) | 6 seksi = komponen baru + 1 cabang (S-4) |
| "Tanggal dana masuk" 2× di form | `:541`, `:1081` | S-8 → sembunyikan di varian sidebar |
| `readinessCheck` menagih `tanggalDanaMasuk` | `SummaryCard.jsx:20-26` | S-8 → fungsi gate **baru**; `SummaryCard.jsx` 0 diff |
| Area cetak Mamin = `MaminPreview.jsx:198-253` | 5 dokumen | nilai otomatis harus masuk formData (A-4) |
| Preview Mamin = `maminDocs()` `previewDocs.js:90-138` | builder terpisah | merge di lapisan formData (A-4) |
| `tanggalDanaMasuk` **tidak ada** di template/blocks | grep 9 hit di `src/`, **0** di template/blocks | field itu **hanya gate** (F-1) |
| `daftar_hadir` kolom NO/NAMA/JABATAN/TTD/TTD2 | `templateConfig.js:265-271` | S-7 → tambah kolom NIP |
| `templateDaftarHadir` rows tanpa `nip` | `aturanMamin.js:116-134` | S-7 → isi `nip` |
| `bacaGTKUntukHadir` memberi `nip`/`nuptk` | `aturanPesanan.js:76-90` | NIP auto dari Data Guru/Tendik |
| PBJ global 6 tab + `pbjFormKosong()` + `pbjDocs()` | `DokumenKelengkapanPage.jsx:288-343` | S-10 → **salin pola** |
| `bkuKePaketRow` mapping BKU→paket | `paketPbj.js:55-76` | prefill PBJ sidebar pakai pola ini |
| `NomorSuratPopup` mandiri (tanpa API) | `blocks/NomorSuratPopup.jsx` | seksi baru pakai langsung (F-4) |

## 7. Kebutuhan Non-Fungsional

| Kategori | Requirement | Cara diperiksa |
|---|---|---|
| Performa | Filter kandidat < 50 ms (421 transaksi) | stopwatch di oracle |
| Performa | Merge otomatis < 5 ms per render | tanpa I/O, fungsi murni |
| Jaringan | 0 request baru | tab Network kosong |
| Storage | Semua lewat `storageHelper`, prefix `spj_` | `rg "localStorage\."` file baru = 0 |
| Visual | Blue-only `#004ac6` + slate | regex `\b(bg\|text\|border\|ring)-(emerald\|amber\|rose\|violet\|cyan)` = 0 |
| Cetak | A4, `mm`, orientasi `templateConfig` tidak berubah | diff `templateConfig.js` = **hanya** kolom NIP |
| Cetak | Yang tampil di preview = yang tercetak | oracle bandingkan data preview vs data area cetak |
| Ukuran modul | File baru ≤200 baris; `DokumenFormPreview.jsx` naik ≤ 60 baris | `wc -l` |
| Tabu | `bkuParser.js`, `SummaryCard.jsx` 0 diff | `git diff --stat` |
| Privasi | Data tidak keluar perangkat kecuali Generate AI Notulen (pola lama) | audit `fetch`/AI |

## 8. Risiko Requirement

| # | Risiko | Mitigasi (dibuktikan di ACCEPTANCE) |
|---|---|---|
| R-1 | Nilai otomatis masuk preview tapi tidak ke cetak | 1 fungsi merge di formData + oracle bandingkan preview vs cetak (AF-03) |
| R-2 | 6 seksi bocor ke halaman LPJ | varian `sidebar6` + hash render halaman LPJ identik (AF-08) |
| R-3 | Gate sidebar menagih field yang tak ada inputnya | gate sidebar fungsi baru; `SummaryCard.jsx` 0 diff (G-7) |
| R-4 | Dropdown kosong (kode kegiatan kosong di BKU) | pesan jujur + jumlah kandidat; A-1 terdokumentasi (AF-01) |
| R-5 | Kolom NIP membuat tabel exceed A4 | lebar kolom disesuaikan; kolom TANDA TANGAN tetap ada (AF-04) |
| R-6 | PBJ per baris ≠ PBJ global → dikira hilang | label jujur + blok PBJ kosong menampilkan form default (AF-06) |
| R-7 | Merge otomatis menimpa isian user | merge hanya mengisi field kosong (AF-03) |
| R-8 | `DokumenFormPreview.jsx` disentuh → regresi lintas fitur | diff hanya 1 cabang + 2 kondisi; hash LPJ wajib identik |

## 9. Definition of Done (sprint)

1. Dropdown kandidat: 4 kategori → kandidat benar, memilih → panel berpindah, isian dirty → peringatan.
2. Form Mamin sidebar 6 seksi; 17 field §3.2 tanpa input; 0 key form dobel; Cek tidak menagih tanggal dana masuk.
3. Daftar Hadir: NIP terisi + tercetak; kolom TANDA TANGAN tetap tercetak; 4 kategori tanpa input tanggal dana masuk.
4. Blok PBJ: 6 tab, prefill otomatis, simpan per NoBukti, preview satu daftar tanpa nama dobel.
5. Halaman Dokumen LPJ: hash identik (4 kategori), `readinessCheck` 0 diff.
6. `npm run build` exit 0; semua oracle sprint ini PASS; 0 error console di browser.
7. `STATE.MD` + `DECISIONS.MD` (ADR baru) + `RISKS.MD` + `QUESTIONS.MD` + checklist ACCEPTANCE diperbarui.

---

**MULAI:** pack ini disetujui (termasuk A-1…A-9 dan jawaban D-1/D-2).
**SELESAI:** butir §9 terbukti dengan output asli, bukan klaim.
