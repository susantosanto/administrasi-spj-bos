# REQUIREMENTS — Sprint 007: Revisi Parser + Hadir + Menu Pesanan

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: revisi final user 2026-10-05 + read-only `bkuKategori.js`
> `parseMamin`, `aturanMamin.js` `templateDaftarHadir`/`templatePesananMamin`,
> `templateConfig.js` section `pesanan_mamin`/`daftar_hadir`, `DataGuruPage.jsx`
> keys storage Guru/Tendik.
> Sprint 005 = fondasi (undangan + notulen). Sprint 006 = semua tab Mamin.
> Sprint 007 = REVISI tiga titik (parser jamuan, hadir GTK real, menu pesanan) —
> bukan tab baru.

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin → nama acara benar tanpa sisa kata
jamuan/konsumsi, Daftar Hadir terisi Guru+Tendik real (atau jujur kosong bila
belum upload), rincian Pesanan terisi menu baku Nasi Box / Snack Box — semua
tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Parser existing: `parseMamin()` di `spj-frontend/src/utils/bkuKategori.js`
  (dua cabang saat ini: `Beban Makanan dan Minuman…` → rapat; `konsumsi
  makan/snack` → kegiatan; selebihnya fallback jujur)
- Template existing: `templateDaftarHadir()` + `templatePesananMamin()` di
  `spj-frontend/src/utils/aturanMamin.js` (sibling `aturanUndangan.js` 005;
  `parseKonsumsi` jumlah+satuan+jenis; pesananRows 0–1 baris; hadir rows dari
  parameter `orang[]`, TTD kosong)
- Konfig cetak (read-only, acuan): `templateConfig.js` `pesanan_mamin`
  (table-dinamis NO/URAIAN/SATUAN/JUMLAH + Hari-Tanggal/Jenis/Jumlah) dan
  `daftar_hadir` (uraian acara + table-dinamis NO/NAMA/JABATAN/TTD/TTD2)
- Data GTK: `DataGuruPage.jsx` via `storageHelper.get('data_guru')` /
  `storageHelper.get('data_tendik')` (fisik `spj_data_guru`/`spj_data_tendik`
  via prefix `spj_`) — sumber rows Daftar Hadir
- Mesin Sprint 005/006: `prefillDariBKU` SELALU TIMPA + snapshot
  `spj_otomatis_snapshot` + badge "dari BKU" + Urungkan (reuse, bukan ulang)

## Keputusan Kunci (final user 2026-10-05 — bukan opsi)

1. Revisi parser (1): `Beban Makanan dan Minuman Rapat <nama>` + ekor
   `Jamuan Makanan Box` / `Snack Box` (dan varian `Jamuan Snack Box`) → jenis
   **Rapat**, `acara` = nama rapat TANPA prefiks TANPA kata jamuan/snack-box.
   Contoh: `Beban Makanan dan Minuman Rapat Penyusunan Silabus Jamuan Makanan
   Box` → `Rapat` / `Penyusunan Silabus`.
2. Revisi parser (2): `Konsumsi (makan/snack) Kegiatan X` → jenis **Kegiatan**,
   `acara` = X TANPA kata Konsumsi. Tak cocok pola mana pun = **fallback jujur**
   (`jenis ''`, `acara` = uraian satu-baris penuh, `cocok false`) — bukan karangan.
3. Daftar hadir rows dari storage: baca `data_guru` + `data_tendik` via
   storageHelper, urut **Guru lalu Tendik**, bentuk baris SAMA dengan editor
   (`id` = nip/nuptk/nama, `nama`, `jabatan`, `ttd ''`, `ttd2 ''`), kolom TTD
   kosong. Belum upload (dua-duanya kosong) → `rows[]` jujur, 0 karangan nama.
4. Rincian pesanan auto menu (editable, opsional): `Nasi Box` 6 item
   (Nasi Putih, Ayam Goreng Kremes, Urap, Tempe Bacem, Sambel dan Lalapan,
   Kerupuk) dan `Snack Box` 4 item (Risoles Ayam, Kue Bolu Mini, Lemper,
   Pudding Cup); pilih berdasar `jenisPesanan`, fallback ke `parseKonsumsi`
   bila jenis tak dikenal.
5. **PENGAMAN wajib samakan 005/006**: tiap timpa simpan snapshot SEBELUM
   timpa + badge "dari BKU" + tombol **Urungkan**.

## Fungsi (F1…F3)

- **F1** — Parser jamuan/konsumsi direvisi (Rapat strip jamuan + Kegiatan
  strip konsumsi + fallback jujur); `acara`/`jenis` terisi benar dari BKU.
- **F2** — Daftar Hadir terisi rows Guru→Tendik real dari storage (TTD kosong);
  kosong jujur `rows[]` bila belum upload; semua baris bisa tambah/edit/hapus.
- **F3** — Rincian pesanan terisi menu baku per jenis (Nasi 6 / Snack 4);
  tiap baris menu bisa diedit/tambah/hapus user (tidak dikunci); fallback
  `parseKonsumsi` bila jenis tak dikenal.

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah); kunci snapshot
  tetap `spj_otomatis_snapshot` (reuse 005/006, 1 slot terakhir per dokumen)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — revisi hanya isi form layar + util aturan
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- Ketergantungan: branch BERSAMA `feat/sprint-005-autogen` (005+006 uncommitted
  ikut kebawa — JANGAN buat branch baru, JANGAN commit, JANGAN push)
- Util ≤ 200 baris (Constitution); HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 4 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Parser jamuan/konsumsi (Rapat strip jamuan + Kegiatan strip konsumsi + fallback) | F1 |
| B | Hadir GTK real (rows Guru→Tendik storage, TTD kosong, kosong jujur) | F2 |
| C | Menu pesanan (Nasi 6 / Snack 4 per jenis, editable, fallback konsumsi) | F3 |
| D | Pengaman reuse 005/006 (snapshot + badge + Urungkan tiap timpa) | F1–F3 + pengaman |

## Di Luar Cakupan

- Tab baru / template baru; ubah dokumen formal/cetak; AI/LLM apa pun;
  sinkron dua arah LPJ→BKU; deteksi kategori otomatis di luar alur BKU;
  kirim/notifikasi pesanan; upload/import GTK baru (hanya baca yang sudah ada)
