# Deep Research: Kategori Grouping BKU + Redesign Sidebar Detail Transaksi
*2026-11-26 · Metode: artefak resmi lokal (workbook RKAS 2026 ref 183 rekening, BKU nyata 420 transaksi) + audit kode + pola desain premium · Confidence: Tinggi (data), Sedang (regulasi — butuh verifikasi Juknis terbaru, situs pemerintah tak terjangkau dari env ini)*

> Metodologi jujur: `websearch` (HTTP 402) dan `webfetch`/situs Kemendikbud (transport error) **tidak dapat diakses dari environment ini**, jadi klaim regulasi di bawah adalah **pengetahuan model yang wajib diverifikasi** terhadap Juknis BOS/BOSP 2026 + SSH Kab. Bandung Barat sebelum jadi keputusan. Yang **terverifikasi keras** (dibaca langsung dari repo): workbook `template-data/Referensi Rekening Belanja Operasi (5.1) - Manajemen Aplikasi RKAS - 2026.xlsx` (183 rekening), dataset BKU dev 420 transaksi (`spj_bku_data`), dan seluruh rantai kode grouping.

---

## BAGIAN 1 — Fitur Kategori Grouping Kegiatan BKU

### 1.1 Cara kerja saat ini (baseline terverifikasi)

```
Kode Rekening (BKU)
  → kategoriDariRekening(): longest-prefix match atas REKENING_KE_MENU (11 prefix)
  → kategori (6): honor | perjalanan_dinas | mamin | atk | pemeliharaan | lomba_workshop(manual-only)
  → kelompokSeNoBukti(): grup komposit NoBukti + periode + rekening + kategori (Sprint 029/030)
  → dominanKategoriGrup(): suara terbanyak PEMBAYARAN; seri → DOMINAN_PRIORITAS
       ['mamin','atk','honor','perjalanan_dinas','pemeliharaan','belum']
  → grupDenganDominan(): { dominan, dominanKategori, suara, kodeList, hasBelanja }
  → KATEGORI_KE_CARD: kategori → kartu dokumen LPJ (atk → 'penggandaan', infoOnly)
  → cardBerpanel(): kartu harus hasTemplate, kalau tidak — sidebar kosong (bug yang baru diperbaiki via guard)
Koreksi manual: kunci BARIS / BARISGRUP(NoBukti|rekening|tanggal) — arsitektur koreksi sudah benar.
```

### 1.2 Temuan utama: cakupan peta hanya 11/183 rekening (6%)

Perbandingan longest-prefix map vs workbook resmi RKAS 2026 (183 rekening Belanja Operasi 5.1):

| Keluarga resmi | Isi | Status peta saat ini |
|---|---|---|
| 5.1.02.01.01 (bahan pakai habis, 43 kode) | ATK (.0024 ✓), mamin rapat (.0052 ✓), mamin yanpend (.0055 ✓), **kertas (.0025 → pemeliharaan ⚠️)** | Hanya 4 prefix; **.0026 cetak, .0027 pos, .0029 komputer, .0030 perabot, .0031 listrik, .0032 perlengkapan dinas, .0034 olahraga, .0035 suvenir, .0036 atk lain, .0037 obat, .0043 natura** tak terpetakan |
| 5.1.02.02.01 (jasa, ~40 kode) | Honor guru (.0013 ✓), listrik (.0061 ✓), internet (.0063 → pemeliharaan?), konsumsi kegiatan (.0001 → mamin ✓) | **Honorarium .0003–.0011 (narasumber, tim pelaksana, juri, diklat…) tak terpetakan; jasa tenaga .0015–.0038 (laboratorium, kebersihan, keamanan, operator…) tak terpetakan; tagihan .0059/.0060/.0062/.0064–.0067 tak terpetakan** |
| 5.1.02.02.04/05 (sewa, ~40 kode) | Sewa kendaraan, alat kantor, gedung pertemuan | **Seluruhnya tak terpetakan** |
| 5.1.02.02.12.0001 (kursus/pelatihan) | — | **Tak terpetakan** (padahal 26 transaksi nyata) |
| 5.1.02.03.xx (pemeliharaan, 57 kode) | Hanya .0025 & .0063 yg terpetakan (itupun rumpun 01, bukan 03!) | **Hampir seluruh rumpun pemeliharaan asli tak terpetakan** |
| 5.1.02.04.01 (perjalanan dinas, 4 kode) | Prefix ada di peta | Terpetakan ✓ |
| 5.2.xx (di luar 5.1) | 5.2.05.01.0001 "Buku Umum" (73 transaksi = **terbanyak!**) | Tak terpetakan + tak ada di referensi 5.1 → butuh keputusan: kategori Buku/Bahan Ajar sendiri atau ikut ATK/kelengkapan |

### 1.3 Distribusi nyata (420 transaksi dev, evidence-based priority)

| Kode | n | Uraian khas | Status |
|---|---|---|---|
| 5.2.05.01.01.0001 | 73 | Buku Umum (Toleransi, Kesehatan Mental…) | ❌ UNMAPPED — prioritas #1 |
| 5.1.02.01.01.0052 | 71 | Mamin rapat | ✅ mamin |
| 5.1.02.01.01.0024 | 55 | ATK | ✅ atk |
| 5.1.02.01.01.0055 | 46 | Mamin yanpend | ✅ mamin |
| 5.1.02.02.12.0001 | 26 | Kursus/Pelatihan (+pungut/setor PPh 23) | ❌ UNMAPPED — prioritas #2 |
| (tanpa kode) | 25 | Saldo awal / Terima BOSP | — benar tak dipetakan (bukan belanja) |
| 5.1.02.02.01.0013 | 21 | Honor guru | ✅ honor |
| 5.1.02.02.01.0037 | 21 | Jasa juri lomba | ❌ UNMAPPED — prioritas #3 |
| 5.1.02.01.01.0025 | 20 | Kertas/cover | ⚠️ map ke pemeliharaan — **bau**: kertas = ATK |
| 5.1.02.01.01.0030 | 15 | Perabot/sapu | ❌ UNMAPPED |
| .0063/.0061 | 9+9 | Internet, listrik | ✅ pemeliharaan/honor |
| 5.1.02.03.02.0405 | 8 | Install ulang laptop | ❌ UNMAPPED |
| .0029/.0027/.0034/.0036/.0026/.0008 | 4+3+3+2+1+1 | Flashdisk, materai, bola, pigura, modul | ❌ UNMAPPED (semua keluarga ATK) |

**Bau peta (mapping smell) yang harus diputuskan user:**
1. `.0025 Kertas dan Cover → pemeliharaan` — inkonsisten (kertas = ATK). Usulan: pindah ke `atk`.
2. `.0061 Tagihan Listrik → honor` — listrik = beban operasional/tagihan, bukan honor. Usulan: kategori baru `operasional` (atau ikut pemeliharaan? bukan — tagihan ≠ pelihara). Rekomendasi: rumpun **Operasional Sekolah** (tagihan + sewa + jasa non-personalia).
3. `.0063 Internet → pemeliharaan` — sama, lebih cocok `operasional`.

### 1.4 Usulan peta premium (2 level, berbasis bukti)

Prinsip: **Kelompok Belanja resmi (ikut struktur RKAS) → Kategori Dokumen (ikut kebutuhan LPJ)**. Satu prefix, satu rumah — tak ada tebakan silang.

| Prefix resmi (longest-match) | Kelompok | Kategori dokumen | Rute | Alasan |
|---|---|---|---|---|
| 5.1.02.01.01.0052, .0053*, .0055 | Mamin | mamin | dokumen-lpj | *tambah .0053 Jamuan Tamu (ada di referensi, kini hilang)* |
| 5.1.02.02.01.0001 | Konsumsi kegiatan | mamin | dokumen-lpj | sudah benar (rev 2026-10-24) |
| 5.1.02.01.01.0024 (+ .0026–.0036, .0037 obat?*) | ATK & Bahan | atk | dokumen-kelengkapan | *keputusan: obat/natura ikut atau pisah? default ikut* |
| 5.1.02.02.01.0013 + .0003–.0011 honorarium + .0015–.0038 jasa tenaga** | Honor & Jasa Personil | honor | dokumen-lpj | **prioritas tertinggi setelah buku** |
| 5.1.02.04.01 | Perjalanan dinas | perjalanan_dinas | dokumen-lpj | sudah benar |
| 5.1.02.03.xx (seluruh 57) | Pemeliharaan | pemeliharaan | dokumen-lpj | ganti 2 prefix silang (.0025/.0063 keluar) |
| 5.1.02.02.01.0059–.0067, .0041–.0042 (tagihan, utilitas) + 5.1.02.02.04/05 (sewa) | Operasional **(kategori baru)** | operasional → kartu info + arsip invoice | dokumen-kelengkapan | rumah baru utk tagihan/sewa; dokumen = bukti bayar/invoice (bukan SPJ panjang) |
| 5.1.02.02.12.0001 + 5.1.02.02.01.0037 (juri) | Lomba/Diklat **(aktifkan otomatis)** | lomba_workshop | dokumen-lpj | tutup blocker sprint-030 dgn bukti 47 transaksi nyata |
| 5.2.05.01.01.0001 + 5.1.02.01.01.0005 (bahan praktek) | Buku & Bahan Ajar **(kategori baru)** | buku → kartu info + arsip | dokumen-kelengkapan | 73 transaksi terbanyak tak boleh "belum dipetakan" |
| Pajak (PUNGUT/SETOR/NTPN), SALDO_AWAL, PENERIMAAN, 5.1.02.02.02 asuransi | — | **sengaja tak dipetakan** | — | sudah benar; guard klik-mati sudah dipasang |

`*` = butuh persetujuan user (mengubah makna). `**` = jasa tenaga kebersihan/keamanan/operator wajar masuk honor (dokumennya sama: daftar honor + tanda terima).

### 1.5 Usulan logika grouping (naik kelas, tetap hemat)

1. **Skor keyakinan + status campuran**: `dominanKategoriGrup` kembalikan `confidence` (% suara) + flag `campuran` ( MR: 3 ATK · 1 honor). UI: badge "Campuran — cek" bila confidence < 100%. Satu baris kode, hilangkan tebakan diam-diam.
2. **Prioritas seri berbasis frekuensi nyata**, bukan urutan hardcode: bila seri, menangkan kategori yg lebih sering muncul di sekolah ini (hitung dari histori koreksi). Fallback ke DOMINAN_PRIORITAS bila histori kosong.
3. **Antrean pemetaan terpandu** (pengganti sekadar badge "Belum dipetakan"): dasbor kecil "X grup belum dipetakan → petakan sekarang" berisi daftar grup + tebakan sistem (top-1 + confidence) + tombol Terima/Ubah per grup; setiap keputusan = koreksi grup (infrastruktur sudah ada). Ini mengubah blind spot 172/183 jadi pekerjaan 15 menit.
4. **Kunci grup sudah tepat** (NoBukti+periode+rekening+kategori, Sprint 029/030) — pertahankan; tambah `kodeList` sudah ada untuk tooltip.
5. **Tidak disarankan**: ML/auto-classify uraian (overkill, tak teraudit); ubah struktur NoBukti (kontrak dokumen per-NoBukti).

### 1.6 Yang wajib diverifikasi ke sumber resmi (daftar cek)

1. Juknis BOS/BOSP 2026: batas honor (20%/40%?), komponen larangan, perlakuan buku/modal 5.2.x — cocokkan dengan kategori baru.
2. SSH + SBM Kab. Bandung Barat 2026: nama SSH persis (.0001 "Konsumsi dan Rapat Kerja" dll) agar prefix tak meleset.
3. Perbup BOS Kab. Bandung Barat: ada kategori belanja khusus daerah?
4. ARKAS versi berjalan: apakah referensi 5.1 di template-data = versi ARKAS produksi saat ini (cek tanggal unduh workbook).

---

## BAGIAN 2 — Redesign Sidebar Detail Transaksi (anti AI-slop)

### 2.1 Inventaris konten wajib (hasil audit BKUSidebar.jsx + rantai panel)

Header: judul + tanggal/baris + prev/next + tutup · 1 tab aktif (Detail ATAU Dokumen LPJ — tidak pernah dua) · Hero: badge tipe + badge kategori + nominal raksasa + uraian + Debet/Kredit/Saldo · Referensi (NoBukti, kode kegiatan+nama, kode rekening+nama, tanggal, tipe) · Kategori Belanja (+status Belum dipetakan) · Rincian Mamin (bila ada) · Anggota grup se-NoBukti (list + badge per baris + navigasi) · Kelompok ATK + switch SIPLAH/Non · Blok pajak (Coretax / jenis pajak) · Tab LPJ: toolbar NoBukti · sub-kategori · form panjang (Honor/Mamin/Perjalanan/Pemeliharaan/Lomba) · PBJ (upload invoice + arsip) · Dokumentasi foto + Generate AI · Panel Preview A4 + Cetak · Info/warning (prefill badge, gate field wajib, simpan state).

### 2.2 Penanda AI-slop yang teridentifikasi di desain kini

1. **Hero nominal raksasa ganda intent**: angka 26px + 3 angka Debet/Kredit/Saldo + ringkasan tabel = 5 angka berebut perhatian; tak ada jawaban "jadi saya harus apa?".
2. **Badge soup**: badge tipe + badge kategori + badge per-baris + dot + pill — 4 bahasa visual untuk 1 fakta.
3. **Card-per-fact**: 6+ kartu putih bertumpuk (Hero, Referensi, Kategori, Mamin, Grup, ATK) dengan struktur identik → monoton, melelahkan, tak ada hierarki.
4. **Tab tunggal yang menyamar**: `tabs.length > 1` tak pernah true (satu tab) — chrome mati.
5. **Form–preview terpisah jauh**: form di atas, preview A4 jauh di bawah; operator scroll buta; tombol cetak jauh dari yang dicetak.
6. **Aksi tersebar**: Simpan (di form), Pratinjau/Cetak (di preview), Urungkan (badge), Ganti/Tutup (strip), prev/next (header) — tak ada satu pun "tombol utama".
7. **Bahasa generik**: "Detail Transaksi", "Informasi Referensi", "Belum dipetakan" tanpa jalan keluar di tempat.

### 2.3 Saran premium: pola "Dossier Satu Alur" (terbaik — direkomendasikan)

Ganti tumpukan kartu + tab dengan **satu kolom narasi berurutan** (ala Stripe Dashboard / Linear issue / Ramp detail): tiap seksi punya SATU tugas, ada nomor urut + status. Struktur:

```
01 IDENTITAS — NoBukti (mono, copy) · tanggal · baris x/y · prev/next sebaris, kompak
02 NILAI — nominal raksasa SATU-SATUNYA + chip Debet/Kredit/Saldo sebaris kecil (bukan 3 kartu)
03 STATUS DOKUMEN — progress ringkas: Kategori ✓ · Form 7/12 · Foto 2/3 · Siap cetak?
   (satu baris status menggantikan badge soup; klik item lompat ke seksi)
04 ISIAN — form kartu aktif SAJA (accordion per sub-kategori, bukan semua form sekaligus);
   field wajib tak terisi ditandai di judul seksi, bukan popup
05 LAMPIRAN — PBJ invoice + foto + file dalam SATU daftar lampiran (ikon, nama, status, hapus);
   Generate AI jadi satu tombol di baris daftar ("＋ Buat dengan AI"), bukan blok raksasa
06 CETAK — sticky bottom action bar: [Simpan] [Pratinjau] [Cetak ▾ per-dokumen]
   Pratinjau = sheet geser dari kanan (bukan scroll jauh); cetak per dokumen dgn chip status
```

Detail kunci:
- **Sticky action bar bawah** (selalu terlihat): jawaban atas "saya harus apa" — Simpan (sekunder) + Cetak (primer). Prev/next pindah ke baris Identitas (kecil, icon-only).
- **Anggota grup se-NoBukti**: jadikan strip horizontal scroll (chip per baris: uraian pendek + nominal + dot kategori), bukan list vertikal penuh — hemat 60% ruang; klik = ganti konteks (reset scroll atas + highlight).
- **Mamin/ATK info**: lebur jadi baris status di seksi 03 + detail di 04 (jangan kartu tersendiri).
- **Pajak**: bukan tab/cabang — bila Setor/Pungut, seksi 04 diganti kartu tunggal "Bayar via Coretax + catat NTPN" (mini sidebar pungut kemarin sudah ke arah ini — naikkan jadi pola yang sama).
- **Bahasa**: judul seksi kata kerja ("Lengkapi isian", "Lampirkan bukti", "Cetak dokumen") — bukan kata benda ("Informasi Referensi").
- **Angka**: satu nominal hero; angka lain tabular kecil; format Rp konsisten (singkat `Rp 62 rb` untuk list, penuh untuk hero/cetak).
- **Dark**: elevasi via surface bertingkat + 1px highlight atas (sudah ada pola `.dok-card`), aksen biru hanya untuk progres/CTA.

### 2.4 Alternatif yang ditolak (dan alasannya)

- *Wizard multi-langkah*: cocok untuk pembuat baru, tapi operator mengulang 344 baris — wizard = klik ekstra × ratusan. Dossier satu-alur + lompat-seksi lebih cepat.
- *Dua kolom form|preview berdampingan*: panel 480px terlalu sempit untuk A4; sheet overlay lebih baik.
- *Dashboard mini (grafik/chart)*: transaksi tunggal tak butuh visualisasi — chart = slop.

### 2.5 Rencana migrasi aman (tanpa rombak sekaligus)

1. Tahap 1 (rendah risiko): sticky action bar + hapus tab tunggal + gabung badge → status bar. Logika/state nol berubah.
2. Tahap 2: accordion sub-kategori + lampiran terpadu (pindah komponen现 ada, bukan tulis ulang).
3. Tahap 3: sheet pratinjau + hapus kartu info generik. Print snapshot sudah ada — manfaatkan.
4. Kunci: setiap tahap di belakang arsitektur pack (BLUEPRINT + ACCEPTANCE) seperti biasa; area cetak A4 = tabu.

---

## Key Takeaways

1. Peta kini 6% (11/183) — blind spot terbesar aplikasi; bukti nyata: 73 buku + 47 lomba/diklat + 30+ ATK-family tak terpetakan.
2. Tiga keputusan user membuka 80% nilai: (a) setujui tabel §1.4 (termasuk 2 kategori baru), (b) pindahkan Kertas→ATK & Tagihan→Operasional, (c) aktifkan lomba_workshop otomatis.
3. Antrean pemetaan terpandu mengubah masalah jadi alur 15 menit (infrastruktur koreksi sudah ada).
4. Sidebar: pola Dossier Satu Alur + sticky action bar — satu perubahan struktur, semua konten现 ter-cover, nol logika bisnis berubah di Tahap 1.
5. Blokir validasi: Juknis 2026 + SSH/SBM KBB sebelum kunci prefix baru.

## Sumber

1. `template-data/Referensi Rekening Belanja Operasi (5.1) - Manajemen Aplikasi RKAS - 2026.xlsx` — 183 rekening resmi, diparse langsung (4 rumpun: 01=43, 02=79, 03=57, 04=4).
2. Dataset dev `spj_bku_data` — 420 transaksi, 23 kode distinct (distribusi §1.3 via inspector browser).
3. `src/utils/bkuKategori.js` — REKENING_KE_MENU (11 prefix), koreksi BARIS/BARISGRUP.
4. `src/utils/aturanPesanan.js` — kelompokSeNoBukti, dominanKategoriGrup, DOMINAN_PRIORITAS.
5. `src/data/kategoriLpj.js` — CARDS + KATEGORI_KE_CARD + cardBerpanel.
6. `src/components/bku/BKUSidebar.jsx` (+Lpj/Dokumentasi) & `src/components/dokumen/DetailDokumenLpj*.jsx` — inventaris konten sidebar.
7. Regulasi (pengetahuan model — WAJIB verifikasi): Permendagri 77/2020 (struktur 5.1/5.2), Juknis BOS/BOSP 2025–2026, SSH/SBM + Perbup Kab. Bandung Barat.
8. Pola desain: Linear issue view, Stripe Dashboard detail panel, Ramp approval flow (pengetahuan pola umum).

## Metodologi

Sub-pertanyaan: (1) struktur rekening resmi & rumpunnya; (2) cakupan peta kini vs resmi; (3) distribusi kode di data nyata; (4) logika grouping & titik lemah; (5) inventaris konten sidebar; (6) penanda slop & pola premium. Kueri web + fetch situs resmi GAGAL dari env ini (HTTP 402/transport error) — diganti artefak resmi lokal + audit kode baris-per-baris. Klaim regulasi ditandai verifikasi-wajib; klaim data/kode terverifikasi penuh.
