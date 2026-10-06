# REQUIREMENTS — Sprint 006: Autogen Semua Tab Mamin

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: keputusan user 2026-10-03 + Idea Brief Autogen Semua Tab Mamin
> + ringkasan read-only 5 docx (Undangan Mamin, Pesanan Mamin, Daftar Hadir,
> Buku Tamu, Notulen) + `templateConfig.js` section
> notulen/undangan_mamin/pesanan_mamin/buku_tamu/daftar_hadir.
> Sprint 005 = fondasi (undangan_mamin rapat + notulen sebagian:
> identitas 9 + pembuka baku + butir draf). Sprint 006 = sisa semua tab Mamin.

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin → tab tujuan (Rapat, Kegiatan,
Tamu, Notulen) langsung terbuka sudah terisi baku mengikuti docx masing-masing
(Undangan, Pesanan, Daftar Hadir, Buku Tamu, Notulen + Resume, Foto bila ada
field deskriptif), semua tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Mesin Sprint 005: `spj-frontend/src/utils/aturanUndangan.js` (11 exports,
  143 baris — DIPERLUAS, bukan ditulis ulang) + `prefillDariBKU` SELALU TIMPA
  + snapshot `spj_otomatis_snapshot` + badge "dari BKU" + Urungkan
- Peta template (read-only, jadi acuan aturan — diringkas dari docx asli):
  - A) Surat Pesanan Mamin (Kegiatan): kop 5 baris → T0 (tempat+tgl, Nomor,
    Sifat Biasa, Lampiran -, Perihal Surat Pesanan, Kepada Toko/RM + Di tempat)
    → salam + "Bersamaan ini kami sampaikan bahwa sehubungan dengan akan
    dilaksanakannya kegiatan X" → rincian menu/paket (Nasi Box + isi) →
    "Pesanan untuk tanggal … dengan rincian:" (Hari + jenis + jumlah Box) →
    penutup "Demikian surat pesanan ini kami sampaikan, Atas perhatiannya
    dan kerjasamanya" → TTD kanan Kepala Sekolah (nama+nip)
  - B) Daftar Hadir (Rapat): judul DAFTAR HADIR + keterangan acara
    ("Rapat …") → tabel NO/NAMA/JABATAN/TANDA TANGAN (2 kolom paraf,
    dari data Guru/Tendik) → pengesahan "Mengetahui, Kepala Sekolah"
  - C) Buku Tamu Kedinasan (Tamu): judul BUKU TAMU + No.Urut/Hari-Tanggal/
    Ingin bertemu → IDENTITAS TAMU (tabel No/NAMA/JABATAN/ALAMAT/TTD) →
    Diterima oleh (default Kepala Sekolah) + Tiba/Kembali Pukul → TUJUAN →
    URAIAN KEGIATAN/TEMUAN/SARAN/PESAN → TTD Kepala Sekolah
  - D) Notulen sisa (melengkapi 005): 005 sudah identitas 9 (hari, tanggal,
    waktu, tempat, acara, pimpinan, dibuka_oleh, notulen, peserta_jumlah) +
    pembuka baku + butir draf. Sisa 006 = pastikan SEMUA 9 field terisi dari
    BKU + pejabat (hari dari tanggal, tanggal panjang, tempat default sekolah,
    acara dari uraian, pimpinan/pembuka/notulen dari pejabatPada, peserta
    dari jumlah/daftar), plus Resume = ringkas butir bila ada field deskriptif,
    Foto = tampil bila ada (tanpa fetch, tanpa upload baru)
  - E) Undangan Mamin (Rapat) = SUDAH Sprint 005 — tidak diulang, hanya dipakai
    ulang sebagai pola (salam + "Bersamaan…" + T1 jadwal + penutup baku)

## Keputusan Kunci (final user 2026-10-03 — bukan opsi)

1. Mesin = **perluas `aturanUndangan.js` Sprint 005** (template ATURAN offline,
   BUKAN AI, tanpa fetch/network). Fungsi baru:
   `templatePesananMamin()` + `templateDaftarHadir()` + `templateBukuTamu()`
   + sisa-notulen (`lengkapiNotulen()`).
2. Pemicu = **OTOMATIS saat buka dari BKU** (klik deep-link langsung terisi —
   samakan 005, berlaku untuk SEMUA tab Mamin).
3. Kebijakan timpa = **SELALU TIMPA field saat buka dari BKU** (ganti isi lama —
   samakan 005, tiap timpa wajib pengaman).
4. Cakupan = **semua tab kategori dan jenis di menu Mamin**
   (Rapat, Kegiatan, Tamu, Notulen — Undangan, Pesanan, Daftar Hadir,
   Buku Tamu, Notulen + Resume, Foto bila ada field deskriptif).
5. **PENGAMAN wajib samakan Sprint 005** (disetujui user): tiap timpa simpan
   snapshot SEBELUM timpa (`spj_otomatis_snapshot`: ts, sumber_no_bukti,
   field_tertimpa, nilai_lama) + badge "dari BKU" + tombol **Urungkan**
   (perluas pola undo Sprint 004/005).

## Fungsi (F1…F5)

- **F1** — Pesanan Mamin (tab Kegiatan) terisi dari BKU: perihal + isi
  "Bersamaan … sehubungan dengan akan dilaksanakannya kegiatan X" +
  Hari/tanggal + jenis + jumlah (dari uraian/konsumsi BKU, tak cocok = jujur "").
- **F2** — Daftar Hadir (tab Rapat) terisi dari BKU: keterangan acara
  (nama rapat) + tabel NO/NAMA/JABATAN dari data Guru/Tendik (TTD kosong).
- **F3** — Buku Tamu (tab Tamu) terisi dari BKU: Hari/Tanggal dari tanggal
  transaksi + Tujuan/Uraian dari uraian kegiatan + Diterima default
  Kepala Sekolah; identitas tamu kosong editable (tak ada data tamu di BKU —
  jujur kosong, bukan karangan).
- **F4** — Sisa Notulen (tab Notulen): SEMUA 9 identitas terisi
  (hari/tanggal/waktu/tempat/acara/pimpinan/pembuka/notulen/peserta) +
  Resume ringkas butir + Foto tampil bila ada field deskriptif; semua editable.
- **F5** — Semua hasil **bisa diedit/tambah/hapus** user (tidak dikunci);
  edit manual kekal kecuali buka-ulang dari BKU (maka SELALU TIMPA + snapshot).

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah); kunci snapshot
  tetap `spj_otomatis_snapshot` (reuse 005, 1 slot terakhir per dokumen)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — autogenerate hanya isi form layar
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- Ketergantungan: Sprint 005 di branch BERSAMA `feat/sprint-005-autogen`
  (Pilihan B user: 005 ikut kebawa — JANGAN buat branch baru, JANGAN commit,
  JANGAN push); Sprint 006 dikerjakan di branch yang sama, setelah kode 005 ada
- HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 5 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Pesanan Mamin Kegiatan (template + render form) | F1 |
| B | Daftar Hadir Rapat (template + render tabel Guru/Tendik) | F2 |
| C | Buku Tamu (template + render form) | F3 |
| D | Sisa Notulen + Resume/Foto (lengkapi 9 identitas + render editable) | F4 |
| E | Pengaman reuse 005 (snapshot + badge + Urungkan tiap timpa) | F5 + pengaman |

## Di Luar Cakupan

- Ubah dokumen formal/cetak; AI/LLM apa pun; sinkron dua arah LPJ→BKU;
  deteksi kategori otomatis di luar alur BKU; kirim/notifikasi pesanan;
  upload/foto baru (hanya tampil bila field deskriptif sudah ada);
  Undangan Mamin Rapat (sudah 005 — reuse, bukan ulang)
