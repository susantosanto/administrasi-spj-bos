# BLUEPRINT — Sprint 016: Import BKU PDF — SEMUA Bulan Sekaligus

> Status: **DISUSUN 2026-10-20.** Dokumen ini berisi detail implementasi.
> Prasyarat: `REQUIREMENTS.MD` + ADR `DECISIONS.MD` §S1–S3 sudah dibaca.
> **Dry run wajib dilaporkan & disetujui user sebelum coding (AGENTS.MD).**
> Batas keras: `bkuParser.js` 0 diff · parser/OCR PDF tidak diubah · `handleFileUpload`
> tidak diubah · modul cetak tidak disentuh.

## 0. Ringkasan Perubahan

| # | File | Aksi | Baris awal |
|---|---|---|---|
| M1 | `src/utils/bkuPdfDuplikat.js` | **BARU** — fungsi murni: penanda duplikat + ringkasan per bulan | — |
| M2 | `src/components/bku/BKUUploadPdf.jsx` | **REWORK** — hapus gating bulan, preview semua bulan, hapus dialog, simpan sekali | 309 |
| M3 | `src/pages/dashboard/BKUPage.jsx` | **UBAH TERBATAS** — `recalcSummary` (ADR §S1) + buang prop `bulanAwal` | 906 |
| M4 | `test-bku-pdf-semua-bulan.mjs` | **BARU** — oracle sprint ini | — |
| M5 | `test-bku-recalc-summary.mjs` | **BARU** — oracle regresi Excel (`recalcSummary` sebelum/sesudah) | — |

Total: 2 file baru (util + 2 oracle), 1 rework komponen, 1 perubahan terbatas di page.
**Tidak ada dependency baru.** **Tidak ada perubahan** pada parser, OCR, modul cetak.

---

## 1. M1 — `src/utils/bkuPdfDuplikat.js` (baru, target ≤ 90 baris)

Fungsi murni, tanpa React, tanpa storage. Dua export:

### 1.1 `tandaiDuplikat(rows) → rows'`

Menandai baris yang **identik** dengan baris lain. Duplikat **tidak dibuang**
(keputusan Idea Brief #3: tandai, user periksa).

```js
// kunci = tanggal + noBukti + uraian (dinormalisasi) + kedua nominal
export function kunciDuplikat(r) {
  const teks = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim()
  return [r.tanggalStr || '', teks(r.noBukti), teks(r.uraian),
    Number(r.penerimaan) || 0, Number(r.pengeluaran) || 0].join('|')
}
```

- Baris pertama = **asli** (`duplikat: false`, `urutanDuplikat: 1`).
- Baris kedua dan seterusnya = `duplikat: true`, `urutanDuplikat: n`.
- **Tidak** menyentuh baris lain; mengembalikan array baru (immutable).

### 1.2 `ringkasPerBulan(rows) → [{ kunci, bulan, tahun, namaBulan, jumlah, masuk, keluar, saldoAkhir }]`

- Kelompokkan per `(tahun, bulan)` — **bukan** per bulan saja (US-7: tahun anggaran
  lintas tahun, mis. 31-12-2025 harus terpisah).
- `kunci` = `"<bulan>-<tahun>"` (dipakai sebagai `value` dropdown penyaring).
- `saldoAkhir` = `saldo` baris terakhir dalam kelompok itu (baris sudah urut tanggal).
- Urut: `tahun` menaik, lalu `bulan` menaik.
- `namaBulan` dari konstanta `BULAN` (Januari…Desember) — **jangan** `toLocaleString`
  (locale mesin bisa berbeda).

---

## 2. M2 — Rework `BKUUploadPdf.jsx`

### 2.1 State: apa yang dihapus, apa yang ditambah

| State | Sebelum | Sesudah | Alasan |
|---|---|---|---|
| `bulan` (number) | `useState(bulanAwal \|\| 1)` | **dihapus** | tidak ada gating bulan |
| `konfirmasi` (bool) | ada | **dihapus** | keputusan #4: tanpa dialog |
| `saring` (string) | — | **baru**, default `'Semua'` | penyaring **tampilan** saja |
| `hanyaBertanda` (bool) | — | **baru**, default `false` | US-3: fokus ke baris meragukan |
| `ringkasBulan` (array) | — | **baru** | hasil `ringkasPerBulan()` |
| `tahunDok` (number) | ada (`tahun`) | tetap, dipakai `header.tahunAnggaran` | ADR §S3 |
| `progres`, `masalah`, `saldoTakRuntun`, `perluKoreksi`, `ringkas`, `baris`, `fileName`, `tahap` | ada | **tetap** | tidak berubah |

### 2.2 `pilihFile()` — buang gating bulan

Hapus seluruh blok `:92-107` (filter `t.bulan === bulan` + error "Bulan X tidak ada").
Ganti dengan:

```js
const hasil = parseBkuFixture({ items: semua, meta: { total_pages: total } })
const tahunDok = Number(hasil.kop.tahun) || hasil.meta?.tahunDokumen || TAHUN_AWAL

if (!hasil.transactions.length) {
  setTahap('pilih')
  toast.error('Tidak ada transaksi yang terbaca dari PDF ini. Data tidak diubah.')
  return
}

const denganTanda = tandaiDuplikat(hasil.transactions.map((t) => ({
  ...t, page: t.row, problems: [], excluded: false,
})))
setBaris(denganTanda)
setRingkasBulan(ringkasPerBulan(denganTanda))
setMasalah(hasil.problems || [])
setSaldoTakRuntun(hasil.reconcile?.mismatches?.length || 0)
setPerluKoreksi(new Set((hasil.problems || [])
  .filter((p) => p.jenis === 'tanggal_perlu_dikoreksi' || p.jenis === 'nominal_diperbaiki')
  .map((p) => p.tanggal)))
setRingkas(hasil.kop)
setTahun(tahunDok)
setTahap('preview')
```

> `page` dipertahankan **hanya** untuk tampilan preview (kolom halaman); field ini
> dibuang sebelum simpan (§2.5).

### 2.3 Turunan (derived, jangan jadi state)

```js
const aktif   = baris.filter((r) => !r.excluded)              // yang akan DISIMPAN
const bertanda = (r) => perluKoreksi.has(r.tanggalStr) || r.duplikat
const tampil  = hanyaBertanda ? baris.filter(bertanda) : baris // yang DITAMPILKAN
const tampilSaring = saring === 'Semua'
  ? tampil
  : tampil.filter((r) => `${r.bulan}-${r.tahun}` === saring)
```

**Aturan kunci (menutup BUG-1 & BUG-2):**
- `saring` **hanya** memengaruhi `tampilSaring`. Total simpanan dihitung dari `aktif`.
- Tidak ada lagi jalur di mana `saring` bisa mengubah apa yang disimpan.

### 2.4 Preview — elemen yang ditambah/diubah

1. **Kartu ringkasan per bulan** (baru) — tabel kecil di atas tabel baris:
   kolom `Bulan` · `Baris` · `Masuk` · `Keluar` · `Saldo Akhir`, satu baris per
   `ringkasBulan`. Warna: `bg-slate-50` header, teks `text-slate-700`, angka `font-semibold`.
2. **Dropdown penyaring** — label "Tampilkan" + opsi `Semua` + setiap `ringkasBulan`
   (`Januari 2026`, `Desember 2025`, …). `value` = `kunci`.
3. **Toggle "Hanya baris perlu diperiksa"** — checkbox, menggerakkan `hanyaBertanda`.
   Saat aktif dan hasil kosong → teks `Tidak ada baris yang perlu diperiksa`.
4. **Badge per baris** (sudah ada `perluKoreksi`) + **badge duplikat** baru:
   teks `duplikat` (bukan hanya warna) dengan `title="Baris ini identik dengan baris lain —
   periksa apakah memang transaksi terpisah"`.
5. **Kolom "Halaman"** — tampilkan `r.page` sebagai teks kecil `text-slate-400`
   (membantu user menemukan baris di PDF).
6. **Baris total** di bawah tabel: `<b>{aktif.length}</b> baris akan disimpan` ·
   masuk · keluar · saldo — **selalu** dari `aktif`, tidak terpengaruh `saring`.
7. **Tombol simpan** langsung memanggil `simpan()` — **dialog `:288-306` dihapus total**.

### 2.5 `simpan()` — tulis sekali, ganti seluruhnya

```js
const simpan = () => {
  try {
    // 1. Buang field sementara — baris tersimpan WAJIB 17 field seperti jalur Excel.
    const transaksi = redetectTypes(aktif.map(({ page, problems, excluded,
      duplikat, urutanDuplikat, ...r }) => r))

    // 2. header: HANYA yang benar-benar terbaca dari kop (ADR §S3).
    const header = {
      tahunAnggaran: String(ringkas?.tahun || tahunDok || ''),
      npsn: ringkas?.npsn || '',
      nama_sekolah: ringkas?.namaSekolah || '',
      alamat: '', kabupaten: '', provinsi: '',
    }
    // 3. footer: TIDAK dipertahankan (ADR §S2) — bentuk sama, isi kosong.
    const footer = {
      kepalaSekolah: { nama: '', nip: '' }, bendahara: { nama: '', nip: '' },
      tanggalPenutupan: '', tempat: '',
    }

    // 4. SATU tulis atomik, ganti SELURUH objek (keputusan #5) — tanpa ...tersimpan.
    storageHelper.set('bku_data', {
      transactions: transaksi,
      header, footer,
      summary: recalcSummary(transaksi),
      uploadedAt: new Date().toISOString(),
      sumberImpor: { jenis: 'pdf', namaFile: fileName, halaman: progres.total },
    })

    toast.success(`${transaksi.length} baris dari ${ringkasBulan.length} bulan disimpan ` +
      `(${daftarBulan}). Masuk ${rp(totalMasuk)} · Keluar ${rp(totalKeluar)} · ` +
      `Saldo ${rp(saldoAkhir)}${balanceText}${masalah.length ? ` · ${masalah.length} catatan OCR` : ''}`)
    reset()
    onSelesai?.()   // parent: loadFromStorage(true) → items, availableMonths, filter 'Semua'
  } catch (e) {
    toast.error('Gagal menyimpan: ' + e.message)   // data lama TIDAK tersentuh
  }
}
```

**Catatan penting:** `recalcSummary` dipanggil dari **parent** (prop, sudah ada).
Jangan menghitung summary sendiri di komponen — satu definisi saja (ADR §S1).

### 2.6 Yang **tidak** berubah

- Alur OCR: `periksaFilePdf` → `headerPdfValid` → `bukaPdf` → `deteksiOrientasiHalaman`
  → loop `renderHalaman` + `ocrPage` → `lepasWorker`.
- `AbortController` + tombol "Batalkan proses".
- Koreksi inline (`ubah`) & pengecualian baris (`buang`).
- `print:hidden` pada seluruh komponen.
- Warna BLUE-ONLY + slate.

### 2.7 Prop

- `bulanAwal` **dihapus** dari signature & dari parent (`BKUPage.jsx:450`).
- `recalcSummary` dan `onSelesai` tetap.

---

## 3. M3 — `BKUPage.jsx`: `recalcSummary` (ADR §S1)

**Cakupan: HANYA fungsi `recalcSummary` (`:90-145`) + baris prop `bulanAwal` (`:450`).**
`handleFileUpload`, `loadFromStorage`, JSX lain: **tidak disentuh**.

### 3.1 Perubahan definisi

| Field | Sebelum | Sesudah |
|---|---|---|
| `totalPengeluaran` (data bertipe) | `PEMBAYARAN` saja | **`PEMBAYARAN + TARIK_TUNAI`** |
| `totalPengeluaran` (data lama tanpa `tipe`) | `totalKredit − setorPajak − saldoAwal − internalLain` | **+ `tarikTunai`** (deteksi `uraian` cocok `/tarik\s*tunai/i`, `pengeluaran > 0`) |
| `saldoAkhir` | **tidak ada** | `transactions.at(-1)?.saldo \|\| 0` |
| `totalPenerimaanSemua` | tidak ada | Σ `penerimaan` semua baris |
| `totalPengeluaranSemua` | tidak ada | Σ `pengeluaran` semua baris |
| `byType` | tidak ada | `{ [tipe]: { count, totalPenerimaan, totalPengeluaran } }` |
| `monthlySummaries` | tidak ada | `months.map(...)` → `{ bulan, namaBulan, count, totalPenerimaan, totalPengeluaran, saldoAwal, saldoAkhir }` |

Bentuk akhir **wajib sama** dengan `bkuParser.js:524-541` (kunci & tipe nilai).

### 3.2 Risiko yang harus dilaporkan di dry run

1. **Angka pengeluaran & "Balance" jalur Excel akan BERUBAH** untuk data bertipe
   (bertambah sebesar total `TARIK_TUNAI`). Ini **disengaja** (ADR §S1) — wajib
   dilaporkan angka **sebelum vs sesudah** di BUILD-REPORT, bukan disembunyikan.
2. Data lama tanpa `tipe`: deteksi `tarik tunai` lewat `uraian` bisa salah tangkap
   (mis. "biaya tarik tunai ATM"). Mitigasi: hanya `pengeluaran > 0` **dan** `noBukti`
   tidak diawali `BPU`; bila ragu → **jangan** hitung (lebih baik kurang dari pada
   menambah pengeluaran palsu), dan catat di laporan.
3. `loadFromStorage` juga memakai `recalcSummary` → angka yang tampil setelah reload
   **selalu** sama dengan yang tersimpan. Ini justru memperbaiki bug "angka berubah
   setelah reload" (ADR §S1).

---

## 4. M4/M5 — Oracle

### 4.1 `test-bku-pdf-semua-bulan.mjs` (baru)

Mensimulasikan jalur simpan **tanpa browser**:

1. Muat fixture (`--fixture`, default `scratch-pdf-check/fixture.json`).
2. `parseBkuFixture()` → `transactions`.
3. Tiru `simpan()`: `redetectTypes(transactions)` → objek `bku_data`.
4. **Asersi:**
   - `transactions.length` = jumlah baris fixture (tidak ada bulan terbuang).
   - Himpunan `(bulan, tahun)` = himpunan bulan/tahun di PDF (bukan hanya 1 bulan).
   - `summary.months` memuat semua bulan PDF.
   - `summary` punya **10 kunci** yang sama dengan jalur Excel (§4.3 PRD).
   - `summary.totalPengeluaran` = `PEMBAYARAN + TARIK_TUNAI` (hitung ulang manual).
   - Baris tersimpan **tidak** memuat `page`/`problems`/`excluded`/`duplikat`/
     `urutanDuplikat`; jumlah kunci per baris = **17**.
   - `tandaiDuplikat()` menandai tanpa membuang (jumlah baris tetap).
5. Pola `PASS/FAIL` + `process.exit(fail ? 1 : 0)`; skrip **dihapus** setelah sprint
   ditutup, kecuali disetujui user untuk disimpan.

### 4.2 `test-bku-recalc-summary.mjs` (baru)

Regresi jalur Excel: baca Excel oracle (`xlsx`), bangun `transactions`, hitung
`recalcSummary` versi lama & baru (fungsi lama disalin ke dalam skrip sebagai pembanding),
lalu cetak tabel **sebelum vs sesudah** untuk Jan–Jun:

- `totalTransactions` · `totalPenerimaan` · `totalPengeluaran` · `isBalanced` · `saldoAkhir`
- Ekspektasi: **hanya** `totalPengeluaran`/`isBalanced` berubah (bertambah `TARIK_TUNAI`);
  `totalTransactions`, `totalPenerimaan`, `saldoAkhir` **identik**.
- Exit 0 hanya bila `saldoAkhir` cocok dengan `saldo` baris terakhir Excel.

---

## 5. Urutan Pengerjaan (untuk builder)

1. **M1** `bkuPdfDuplikat.js` → tulis dulu, tanpa menyentuh UI.
2. **M3** `recalcSummary` → jalankan **M5** sebelum lanjut (regresi Excel terukur lebih awal).
3. **M2** rework komponen → state → turunan → preview → `simpan()`.
4. **M4** oracle semua-bulan → jalankan.
5. Jalankan **semua** gate: `test-bku-pdf-parse.mjs --pdf --all-months` (3 fixture),
   `test-bku-tanggal.mjs`, M4, M5, `npm run build`.
6. `grep` bukti `bkuParser.js` 0 diff.
7. Lapor dengan output asli → update `STATE.MD` + pack.

## 6. Definition of Done (teknis)

- [ ] `npm run build` exit 0.
- [ ] M4 & M5 exit 0; `test-bku-pdf-parse.mjs` exit 0 di 3 fixture; `test-bku-tanggal.mjs` 13/13.
- [ ] `git diff --stat` hanya menyentuh: `BKUUploadPdf.jsx`, `BKUPage.jsx` (2 titik),
      + 1 file baru util. **`bkuParser.js` 0 diff.**
- [ ] Jumlah panggilan `storageHelper.set('bku_data', …)` di `simpan()` = **1**.
- [ ] Tidak ada `konfirmasi` / `setKonfirmasi` / `bulanAwal` tersisa di komponen.
- [ ] Tidak ada warna di luar BLUE-ONLY.
- [ ] Setiap baris tersimpan = 17 field.
