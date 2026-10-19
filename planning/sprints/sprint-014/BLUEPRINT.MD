# BLUEPRINT — Sprint 014: Laporan Rincian Pajak

> **Dokumen 2 dari 4** Architect Pack. Berisi HOW: file, fungsi, algoritma.
> Semua angka berasal dari audit openpyxl template 2026-10-19, bukan perkiraan.

## 1. Keputusan Teknis yang Sudah Dikunci

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Block cetak sendiri `blocks/RincianPajak.jsx` (bukan `table-dinamis`) | 16 kolom + header 2 tingkat + baris nomor + baris Total = struktur khas template; block khusus mengikuti pola `RegisterKas.jsx` |
| D2 | Builder murni `utils/dokPajak.js` | Bisa diuji di Node tanpa browser (oracle `.mjs`) |
| D3 | Data pajak = `kasDocs(kasForm, bku)` diperluas argumen ke-3 `pajakManual` | Satu jalur panel seperti kas doc lain; builder lama tidak berubah perilaku |
| D4 | Isian manual di `spj_pajak_manual` (key baru), kunci `${tanggalISO}\|${uraian}\|${pengeluaran}\|${noBukti}` | Stabil walau BKU bertambah/berkurang baris |
| D5 | `<colgroup>` persen dari lebar kolom sumber | A 3,1% · B 8,5% · C 4,6% · D 4,0% · E 37,4% · F 3,6% · G 2,2% · H 2,3% · I 3,6% · J 2,8% · K 4,0% · L 2,9% · M 2,9% · N 7,4% · O 6,5% · P 4,0% (total ≈ 100%) + `table-fixed` |
| D6 | Landscape via `orientation: 'landscape'` (seperti `sekat_lpj`) | Mekanisme `paperSize.js` sudah terbukti (sekat 841,92×594,96) |
| D7 | **Tanpa dependency baru**, tanpa ubah `bkuParser.js`/`BKUPage.jsx` | Scope terkunci REQUIREMENTS §6 |

## 2. File yang Disentuh (final — di luar ini dilarang)

| File | Aksi | Isi |
|---|---|---|
| `spj-frontend/src/utils/dokPajak.js` | **baru** | fungsi murni: `barisPajakDariBku(transactions, manual)`, `kunciBarisPajak(tx)`, `JENIS_PAJAK`, `PAJAK_TIPE`, `totalKolomPajak(rows)` |
| `spj-frontend/src/data/templateConfig.js` | edit | entry `rincian_pajak` (orientation landscape, block `rincian-pajak`, defaults: judul/ket/nilai kosong) |
| `spj-frontend/src/components/templates/blocks/RincianPajak.jsx` | **baru** | blok cetak murni (tanpa input) |
| `spj-frontend/src/components/templates/blocks/index.js` | edit | export `RincianPajak` |
| `spj-frontend/src/components/templates/TemplateEngine.jsx` | edit minimal | `BLOCK_RENDERERS['rincian-pajak'] = RincianPajak` |
| `spj-frontend/src/utils/previewDocs.js` | edit | `kasDocs(kasForm, bku, pajakManual)` → push doc `rincian-pajak` |
| `spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx` | edit | menu `RPAJAK` di kategori Keuangan + editor manual per baris + storage `spj_pajak_manual` |

**Dilarang disentuh:** `bkuParser.js`, `BKUPage.jsx`, `DokumenFormPreview`, Register Kas/BAP/Cover/blocks lain, `previewDocs` builder selain tambahan doc `rincian-pajak`.

## 3. Kontrak Data

### 3.1 Baris pajak (output `barisPajakDariBku`)

```
{
  key,            // kunci manual: tanggalISO|uraian|pengeluaran|noBukti
  no,             // urut 1..n (setelah sort bulan→tanggal)
  namaSekolah,    // dari getSchoolData().namaSekolah
  jenjang,        // dari form (manual, tanpa default)
  bulan,          // nama bulan Indonesia (BULAN_ID[bulan-1])
  uraian,         // tx.uraian apa adanya
  nilai,          // Number(tx.pengeluaran)
  jenis,          // manual: '' | 'PPh 21' | 'PPh 22' | 'PPh 23' | 'PPN'
  pph21/pph22/pph23/ppn,  // nilai bila jenis == kolom itu, selain itu 0
  total,          // = nilai (selalu tampil)
  tglBayar,       // tx.tanggalISO → format tampil; manual menang
  tglNtpn,        // manual
  ntpn,           // manual
  kodeBilling,    // manual
  keterangan,     // manual
}
```

### 3.2 Form menu `RPAJAK`

`formFields` = `tahun` (text, placeholder 2026) + `jenjang` (text, placeholder
"Sekolah Dasar"). Keduanya dokumen-level (bukan per baris). Kosong → PlaceholderText
di cetak (pola `RegisterKas.isi`).

### 3.3 Editor manual (layar, di kiri bawah form)

Tabel per baris (overflow-x): NO · Bulan · Uraian · Nilai (dari BKU, read-only) ·
Jenis pajak (`<select>`, tanpa default) · Tanggal Bayar (date) · Tanggal NTPN (date) ·
NTPN (text) · Kode Billing (text) · Keterangan (text). Setiap onChange →
`spj_pajak_manual[key]` + re-render panel (state di komponen).

### 3.4 Format cetak

- Angka: `Number.toLocaleString('id-ID')` (contoh: 24.000) — tanpa "Rp" (sumber
  pakai format angka murni).
- Tanggal: `formatTanggalContoh` dari `dokKas.js` ("7 Juni 2026").
- Font tabel: Arial 8 (sumber), judul Calibri 11 bold.
- Border: tepi medium (2px), dalam thin (1px) — mengikuti openpyxl
  (medium=L/R tepi header, thin=sisanya).

## 4. Algoritma Builder (ringkas)

1. `filter`: `['SETOR_PAJAK','PAJAK_BUNGA'].includes(tx.tipe) && Number(tx.pengeluaran) > 0`.
2. `sort`: `bulan` asc, lalu `tanggalISO` asc (contoh: Februari → Juni).
3. `map`: gabung `manual[key]` di atas data BKU (manual menang per field).
4. `tahun`: `form.tahun` ‖ `max(bulan tahun transaksi)`.
5. Total baris: `totalKolomPajak(rows)` → { pph21, pph22, pph23, ppn, total }.

## 5. Rencana Verifikasi

- Oracle Node: `spj-frontend/test-pajak-barisa.mjs` — fixture transaksi → jumlah baris,
  nilai per baris, total kolom, kunci manual, urutan. Pola PASS/FAIL + `process.exit`.
- Build: `npm run build` exit 0.
- Cetak: render `RincianPajak` ke HTML statis → PDF via Playwright (`/d/project/scratch-pw`,
  Edge sistem) → cek ukuran halaman landscape + warna/teks operator PDF.
- Skrip uji & render sementara DIHAPUS setelah dipakai (konvensi repo).
