# DRAFT VERIFICATION-REPORT — Revisi BKU grup+Mamin+hapus LPJ+hapus panel ATK

> STATUS: **INCOMPLETE — menunggu bukti user (screenshot + jawaban M1-M6)**. FASE 1: checklist manual saja. Tanpa vonis. Tanpa ubah kode src.
> Scope: T1-T4 + T6 di main HEAD a40b328 (docs) / cc2456e (kode). Spec: Goal satu NoBukti satu grup berkategori, tanpa kolom LPJ mati, klik Mamin acara benar.
>
> Gate statis fresh sesi ini (agen, 2026-10-03): build exit 0, 183 modul, 13.55s. Grep: BKUPage nol hit LPJ; BKUPage nol section Kelompok ATK (sisa referensi kelompokATK hanya di BKUSidebar.jsx + bkuKategori.js = warisan luar scope); grupDenganDominan/saringGrupBermasalah/parseMamin/maminJenis terpasang di BKUPage + BKUSidebar + bkuKategori.

## Cara nyalakan dev server

1. `cd spj-frontend` lalu `npm run dev` (script = copy-docs + vite).
2. Buka `http://localhost:5173`, login bila diminta, masuk menu BKU di rute `/dashboard/bku`.

## Cara seed data (sekali saja, di origin dev server)

1. Di halaman BKU, bila ada data lama: klik Hapus Data (atau console: `localStorage.removeItem('spj_bku_data')`) lalu refresh.
2. Buka DevTools Console di tab `http://localhost:5173` dan tempel snippet ini, Enter, lalu refresh halaman BKU:

```js
const T = (row, uraian, noBukti, kodeRekening, pengeluaran) => ({ row, uraian, noBukti, kodeRekening, kodeKegiatan: '5.2.1', kegiatan: '', pengeluaran, kredit: pengeluaran, penerimaan: 0, debet: 0, saldo: 0, tanggalStr: '15-01-2026', tanggal: '15-01-2026', bulan: 1, tipe: 'PEMBAYARAN' });
const tx = [
  T(1, 'Beban Makanan dan Minuman\nRapat Penyusunan Silabus Semester Ganjil', 'BNU-101', '5.1.02.01.01.0052', 150000),
  T(2, 'Konsumsi snack kegiatan Pembinaan Ekstrakurikuler', 'BNU-101', '5.1.02.01.01.0055', 100000),
  T(3, 'Belanja tidak dikenal uji filter', 'BNU-102', '9.9.99.99', 50000),
];
localStorage.setItem('spj_bku_data', JSON.stringify({ transactions: tx, header: { nama_sekolah: 'SDN SEED', npsn: '-', tahunAnggaran: '2026' }, summary: null, footer: null, uploadedAt: new Date().toISOString() }));
```

3. Harapan pasca-seed: tabel menampilkan 1 baris grup `BNU-101` (2 rincian) + 1 baris tunggal `BNU-102`. Total footer: 2 grup, 3 rincian.

## Checklist manual (user eksekusi, kembalikan bukti per item)

Bukti wajib per item: screenshot + satu baris jawaban (LULUS/GAGAL + yang terlihat). Sertakan console errors bila ada.

### M1 — Tabel tanpa kolom LPJ dan tanpa panel ATK
- Klik: `/dashboard/bku` > lihat header tabel Referensi BKU.
- Harapan: kolom tepat `No | Tanggal | Uraian | No. Bukti | Kode | Tipe | Debet | Kredit | Saldo` — TIDAK ada kolom ceklis/LPJ, TIDAK ada progress LPJ, TIDAK ada section berjudul `Kelompok ATK` di halaman BKU.
- Bukti: screenshot penuh tabel + jawab ada/tidak untuk tiap unsur terlarang.

### M2 — Grup se-NoBukti expand/collapse + badge dominan
- Klik: baris grup `BNU-101` (berlabel `2 rincian se-Bukti`) > klik lagi untuk tutup.
- Harapan: klik pertama membuka 2 baris anggota (berprefix rincian); badge grup bertuliskan `Mamin`; teks `Kode: 5.1.02.01.01.0052, 5.1.02.01.01.0055`; klik kedua menutup kembali. Footer `2 grup · 3 rincian`.
- Bukti: 2 screenshot (tertutup + terbuka) + jawab badge apa yang tampil.

### M3 — Filter Saring belum dipetakan per grup
- Klik: tombol `Saring belum dipetakan (1)` di atas tabel > klik lagi untuk lepas filter.
- Harapan: saat aktif hanya grup `BNU-102` (badge `Belum dipetakan`) yang tampil; `BNU-101` hilang; hitungan tombol `(1)` = jumlah GRUP bermasalah bukan baris; lepas filter mengembalikan semua.
- Bukti: 2 screenshot (filter aktif + nonaktif) + jawab jumlah yang tampil tiap keadaan.

### M4 — Deep-link Mamin Rapat: Acara dari kegiatan
- Klik: buka grup `BNU-101` > klik baris anggota uraian `Beban Makanan dan Minuman...` > di sidebar klik tombol `Buka di mamin`.
- Harapan: mendarat di `/dashboard/dokumen-lpj` kartu Makan & Minum, sub-jenis terpilih `Rapat`; field Nama Acara terisi mengandung `Penyusunan Silabus` (bukan uraian mentah `Beban Makanan...`); badge `dari BKU` tampil + tombol Urungkan/Batal tersedia.
- Bukti: screenshot sidebar (pratinjau Mamin) + screenshot form Mamin (sub Rapat + acara) + tulis isi field Acara.

### M5 — Mamin Konsumsi snack: jenis Kegiatan
- Klik: kembali ke BKU > buka grup `BNU-101` > klik baris anggota uraian `Konsumsi snack...` > di sidebar klik `Buka di mamin`.
- Harapan: mendarat di kartu Makan & Minum, sub-jenis terpilih `Kegiatan` (BUKAN Rapat); field Acara terisi (dari nama kegiatan/uraian); badge `dari BKU` tampil.
- Bukti: screenshot form Mamin (sub Kegiatan + acara) + tulis sub terpilih dan isi Acara.

### M6 — Sidebar anggota grup + deep-link dominan
- Klik: di BKU klik salah satu anggota `BNU-101` hingga sidebar Detail Transaksi terbuka.
- Harapan: sidebar menampilkan section anggota grup se-NoBukti (2 rincian BNU-101); tombol deep-link berlabel `Buka di {menu} (2 rincian se-Bukti)` memakai kategori DOMINAN grup (mamin); tombol Esc/menutup sidebar bekerja; klik anggota lain (prev/next bila ada) tetap konsisten.
- Bukti: screenshot sidebar penuh (anggota grup + tombol deep-link) + tulis label tombol persis.

## Vonis: DITUNDA — menunggu bukti user (INCOMPLETE)

Belum ada PASS/FAIL. Setelah bukti M1-M6 diterima, hakimi per item dan terbitkan VERIFICATION-REPORT final.
