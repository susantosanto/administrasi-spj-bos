# REQUIREMENTS — Sprint 004: BKU → LPJ Smart Bridge

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa & mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: Idea Brief + PRD (US-31…US-37) + Tech Stack Advisor D1…D4.

## Tujuan (satu goal — Bab 10.3)

Operator klik baris belanja BKU → tiba di menu LPJ yang tepat dengan form
terisi, tanpa menghafal kode rekening dan tanpa ketik ulang.

## Pengguna

- Operator sekolah (1–2 orang, paham ARKAS/BKU, tidak teknis)
- KS/Bendahara (pejabat multi-periode, TTD per tanggal dokumen)

## Sumber Data (as-is, tidak diubah)

- Transaksi BKU: `spj_bku_data.transactions[]` — field `uraian, noBukti,
  kodeRekening, kodeKegiatan, tanggal, penerimaan, pengeluaran` (bkuParser.js)
- Peta rekening: `spj-frontend/src/data/kodeReferensi.js` (mencakup
  `5.1.02.02.01.*`, `5.1.02.01.01.0052/0055/0024/0025`, `5.1.02.04.01.0003`)
- Regulasi: Juknis BOSP 2026 (`template-data/juknis/`), Perbup non-tunai KBB

## Keputusan Kunci (dari klarifikasi user — final, bukan opsi)

1. Kategori dari **kode rekening** (bukan keyword uraian).
2. Tombol = **navigasi + prefill** (bukan navigasi saja, bukan buat draf).
3. Gabung snack+makan = **AND ketat** (no bukti DAN nama kegiatan sama).
4. Pejabat = **riwayat per tanggal** (dokumen kunci pejabat saat dibuat).
5. Flag SIPLAH = **user tandai per Nomor BKU**; app auto-deteksi nomor sama +
   opsi gabung beda nomor BKU ke satu nomor dokumen SIPLAH.
6. **Nomor BKU ≡ `no_bukti`** (kolom I BKU ARKAS, identitas unik per baris belanja).

## Batasan

- 0 dependency baru; BLUE-ONLY `#004ac6`; kertas A4-mm; prefix `spj_`
- DILARANG ubah isi/cetak formal APPROVED Sprint 001–003
- Prefill hanya isi field kosong (tidak menimpa ketikan); ada badge + undo
- Baris tak dikenal = "Belum dipetakan" (jujur, tidak ditebak)

## Bagian Sprint (satu sprint, 4 bagian demo-able)

| Bagian | Isi | US |
|---|---|---|
| A | Kategori otomatis + laporan tak-terpetakan | US-31, US-37 |
| B | Sidebar detail + deep-link + prefill | US-32, US-33 |
| C | Merge snack+makan + riwayat pejabat | US-34, US-35 |
| D | Kelompok ATK SIPLAH/Non-SIPLAH | US-36 |

## Di Luar Cakupan

- Ubah dokumen formal/cetak; auto-fill pegawai dari BKU; sinkron dua arah
  LPJ→BKU; deteksi SIPLAH otomatis; ekspor profil pejabat (Phase 2)
