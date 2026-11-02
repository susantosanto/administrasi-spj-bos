# REQUIREMENTS — Sprint 005: Autogenerate Undangan + Resume

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: keputusan final user 2026-10-03 + transkrip baku 3 docx (Undangan Mamin, Surat Tugas + SPPD gugus, Notulen Rapat).

## Tujuan (satu goal — Bab 10.3)

Operator klik baris BKU lalu Buka di Mamin / Perjalanan Dinas → form tujuan
langsung terbuka sudah terisi lengkap (nama acara, isi undangan baku, resume +
poin pembahasan draf), semua tetap bisa diedit user.

## Pengguna

- Operator sekolah (1–2 orang, tidak teknis) — pengguna utama, tidak mengetik ulang
- KS dan bendahara — penandatangan dokumen (nama + NIP dari Data Sekolah/pejabat)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Parser existing: `parseMamin()` di `spj-frontend/src/utils/bkuKategori.js`
  (aturan ketat revisi 2026-10-02: Rapat vs Kegiatan vs fallback jujur)
- Peta rekening: `spj-frontend/src/data/kodeReferensi.js` (mencakup
  `5.1.02.01.01.0052/0055` mamin, `5.1.02.04.01.0003` perjalanan dinas)
- Data Sekolah + pejabat: nama sekolah, kop, KS/bendahara/ketua gugus/notulen
- Template baku (3 docx, diringkas — jadi acuan aturan, bukan dilampirkan):
  - A) Undangan Mamin: kop 5 baris → T0 (tempat+tgl, Nomor, Sifat Biasa,
    Lampiran -, Perihal Undangan Sosialisasi + kegiatan, tujuan) → salam +
    "Bersamaan ini kami sampaikan bahwa pelaksanaan kegiatan X akan
    dilaksanakan pada :" → T1 jadwal (hari+tanggal+tempat+waktu) → penutup
    baku → TTD kanan Ketua Sekolah (nama+nip)
  - B) Rapat ops gugus (3 dokumen sekuen): DokA Undangan gugus
    (`400.3.7.6/018/G-KHD/2026`, "dapat menghadirkan Operator Sekolah untuk
    mengikuti Rapat Kerja Teknis Operator Tingkat Gugus pada:" + jadwal +
    "Mengingat pentingnya acara tersebut", tembusan 2, TTD Ketua Gugus
    Wahyudin); DokB Surat Perintah Tugas (`400.3.7.6/018-SD/2026`,
    "Yang bertandatangan di bawah ini" + pemberi KS Badruddin → MENUGASKAN →
    penerima Nama/NIP/Pangkat/Jabatan → maksud/hari/tanggal/tempat →
    "agar dilaksanakan dengan sebaik-baiknya dan penuh rasa tanggungjawab");
    DokC SPD (11 baris T3: PA/KPA, pelaksana, pangkat, jabatan, maksud,
    angkutan darat, asal/tujuan, lama 1 hari + tgl berangkat/kembali,
    pengikut, pembebanan BOS Reguler `5.1.02.04.01.0003`, keterangan; T4
    pengesahan berangkat/tiba + PERHATIAN standar)
  - C) Notulen Rapat: kop 3 baris → judul NOTULA RAPAT → identitas 9 baris
    (hari, tanggal, waktu, tempat, acara, pimpinan, dibuka_oleh, notulen,
    peserta_jumlah) → pembuka "Rapat membahas dan menyimpulkan sebagai
    berikut:" + daftar butir (14 butir oracle = contoh draf) → TTD 2 kolom
    (Pimpinan Rapat + Notulen, nama+nip)

## Keputusan Kunci (final user 2026-10-03 — bukan opsi)

1. Mesin = **template ATURAN offline** (BUKAN AI, tanpa fetch/network).
2. Pemicu = **OTOMATIS saat buka dari BKU** (klik deep-link langsung terisi).
3. Kebijakan timpa = **SELALU TIMPA field saat buka dari BKU** (ganti isi lama).
4. Cakupan = **Mamin + Perjalanan Dinas + Notulen** (tiga, bukan satu).
5. **PENGAMAN wajib** (disetujui user): tiap timpa simpan snapshot sebelum
   timpa + badge "dari BKU" + tombol **Urungkan** (perluas pola undo Sprint 004).

## Fungsi (F1…F4)

- **F1** — Nama Acara/Kegiatan terisi dari uraian + kegiatan BKU (lanjutkan
  parser Mamin `parseMamin`, tambah parser perjalanan dinas).
- **F2** — Isi undangan tergenerate mengikuti format baku per kategori
  (Mamin: salam + "Bersamaan…" + jadwal T1 + penutup; PerjDinas: SPT
  MENUGASKAN + SPD 11 baris + pengesahan).
- **F3** — Resume + poin pembahasan = draf dari nama acara, jenis
  Rapat/Kegiatan, tanggal, data sekolah (contoh: 14 butir oracle).
- **F4** — Semua hasil **bisa diedit/tambah/hapus** user (tidak dikunci).

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6` + slate; kertas A4 satuan mm,
  orientasi via `templateConfig.js` → `orientation`
- localStorage prefix `spj_` via `storageHelper` (JANGAN ubah)
- DILARANG ubah dokumen formal cetak (`blocks/*`, `TemplateEngine.jsx`,
  `templateConfig.js`, print-area) — autogenerate hanya isi form layar
- Offline penuh (tanpa fetch, tanpa AI key, tanpa network saat prefill)
- HANDOFF wajib dry-run-first (aturan AGENTS.MD)

## Bagian Sprint (satu sprint, 4 bagian demo-able)

| Bagian | Isi | F |
|---|---|---|
| A | Parser + nama acara (Mamin lanjut + PerjDinas baru) | F1 |
| B | Isi undangan per kategori (Mamin baku + SPT/SPD sekuen) | F2 |
| C | Resume + poin pembahasan draf (Notulen 9 identitas + butir) | F3 |
| D | Pengaman snapshot + badge + Urungkan (tiap timpa) | F4 + pengaman |

## Di Luar Cakupan

- Ubah dokumen formal/cetak; AI/LLM apa pun; sinkron dua arah LPJ→BKU;
  deteksi kategori otomatis di luar alur BKU; kirim/notifikasi undangan
