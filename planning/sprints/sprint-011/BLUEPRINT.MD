# BLUEPRINT — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2, salin dari package.json ASLI 2026-10-10 — SAMA dengan sprint-010, 0 lib baru).
> Verifikasi read-only 2026-10-10: DokumenKelengkapanPage.jsx + aturanPbj.js + previewDocs.js + storageHelper.js + templateConfig.js + pbjDataSheet.js ada; pola sprint-010 (aturanPbj murni, prefill berlapis + snapshot, pbjDocs mirror, PanelPreviewDocument reuse) dipakai ulang.

## Arsitektur

```text
COMMAND-BAR (satu pintu, di atas tabel PBJ)
 [Upload PDF] [Dari BKU] [Manual]   (state: pintuTerakhir; Upload = file picker existing)
   |                    |                     |
   | parse existing     | PANEL CARI+CENTANG    | FORM MANUAL (subset A5)
   | (aturanPbj)        | (revisi task 66:      | uraian/qty/harga/tgl/
   |                    |  cari NoBukti/uraian  | penyedia/noAcuan
   v                    |  + filter tanggal +   |
 TABEL PBJ <------------+  toggle hanya-belum-  |
 (15 kolom + expand,     |  berdokumen (ON) +    |
  struktur tetap)        |  grup/NoBukti buka-   |
   |  ^                  |  tutup + centang +    |
   |  |                  |  "Terima ke PBJ (n)"  |
   |  |                  v  batch, disabled      v
   |  | TANPA AUTO-TAMBAH (guard: tanpa chips, tanpa dialog konfirmasi,
   |  |  tanpa Tolak-per-kartu — resmi diganti panel cari+centang; tambah
   |  |  hanya via Upload / Terima-dipilih / Manual-submit)
   |  +-- ARSIP HALUS ("hapus" → pindah ke spj_pbj_arsip; panel tertutup default + Kembalikan/baris + Kosongkan Arsip)
   |
TOGGLE SIPLAH/NON-SIPLAH (card Kelengkapan; persist spj_pbj_mode; default NON-SIPLAH per A4)
   |-- SIPLAH: tab-bar hanya Perencanaan (5 tab lain HILANG, bukan disabled);
   |           gate badge + .sk-doc-print + panel hanya Perencanaan; sumber baris = upload invoice SIPLAH PDF
   |-- NON-SIPLAH: keenam dokumen seperti sprint-010; sumber baris = keranjang/chips BKU dan/atau Manual (+upload tetap)
   +-- GANTI MODE: simpan diam-diam isian mode non-aktif (spj_pbj_form utuh, tanpa dialog) + toast 1 baris;
                   kembali = round-trip lossless (asumsi A1/A7 REQUIREMENTS)
```

State dan aliran data:

- Satu sumber: pbjForm (+ invoiceMeta) tetap di DokumenKelengkapanPage; state baru: modeSiplah ('siplah'|'non', persist spj_pbj_mode),
  arsip[] (persist spj_pbj_arsip), bkuCari/bkuDari/bkuSampai/bkuHanyaBaru/bkuGrupBuka/bkuDipilih (panel cari+centang, sesi;
  pilihan dikunci per-baris-BKU agar se-NoBukti tak bertabrakan; kunci A1 tetap untuk status sudah/belum-berdokumen).
  Key spj_pbj_keranjang_tolak DIHAPUS dari pack (yatim — hanya sisa export + komentar; UI Tolak-per-kartu tidak ada;
  kandidatKeranjang(tolakSet) tak dipanggil UI; pembersihan kode di luar cakupan docs-only ini).
- Helper murni BERSAMA (satu logika dipakai editor + panel): isSudahBerdokumen(transaksi, barisPBJ) — kunci A1;
  terapkanMode(pbjForm, mode) → {formTampil, gateDocs}; arsipkanBaris/kembalikanBaris murni.
  Lokasi: aturanPbj.js (bila total ≤200 baris) ATAU util baru paketPbj.js (bila lewat — putuskan dry run).
- Upload existing + snapshot/Urungkan existing dipakai ulang apa adanya untuk aksi destruktif baru (Kosongkan Tabel, ganti mode tanpa dialog).
- previewDocs.js: pbjDocs(pbjForm) existing + parameter mode → kembalikan 1 doc (SIPLAH) atau 6 docs (NON-SIPLAH); skip kosong jujur tetap.
- PanelPreviewDocument + TemplateEngine reuse TANPA ubah logika; command-bar/keranjang/chips/arsip/toggle = print:hidden.

## File Baru (maks 1)

| File | Isi |
|---|---|
| spj-frontend/src/utils/paketPbj.js (OPSIONAL — hanya bila aturanPbj.js lewat 200 baris; putuskan dry run) | isSudahBerdokumen + arsipkanBaris/kembalikanBaris + terapkanMode (murni, ≤200 baris) |

## File Diubah (maks 4)

| File | Bagian | Sifat |
|---|---|---|
| spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx | Command-bar 3 tombol + keranjang + chips + expand edit inline + arsip panel + toggle mode + gate badge/cetak ikut mode | Tambah saja; section PBJ tetap selalu tampil; toggle tak menghapus isian; Component delta minimal |
| spj-frontend/src/utils/aturanPbj.js | Helper kurasi + mode (atau delegasi ke paketPbj.js bila >200 baris) | Murni; JANGAN duplikat SNAP (reuse aturanUndangan) |
| spj-frontend/src/utils/previewDocs.js | pbjDocs(pbjForm, mode) — gate 1 vs 6 docs | Mirror 1:1 area cetak; skip kosong jujur |
| spj-frontend/src/pages/dashboard/BKUPage.jsx (atau BKUSidebar.jsx — putuskan dry run) | Reuse titik "Kirim ke PBJ" sebagai pemasok kandidat keranjang | Tambah saja; logika BKU lain TETAP |

> DILARANG sentuh: config existing di templateConfig.js + TemplateEngine.jsx + blocks/* existing (selain max 1 block baru bila buntu)
> + dokumen mamin/honor/transport/upah + sekolahData/signatureRoles/storageHelper/index.css/package.json.

## Dependensi (ter-pin eksak — dari package.json ASLI 2026-10-10, identik sprint-010, 0 baru)

react 18.3.1, react-dom 18.3.1, react-router-dom 6.30.4, lucide-react 0.344.0, xlsx 0.18.5,
pdfjs-dist 4.10.38, @heyputer/puter.js 2.5.4;
dev: @types/react 18.3.31, @types/react-dom 18.3.7, @vitejs/plugin-react 4.7.0,
autoprefixer 10.5.2, postcss 8.5.16, tailwindcss 3.4.19, vite 5.4.21.

## Storage/kertas/warna/aksesibilitas

- Storage baru (prefix spj_ via storageHelper): spj_pbj_mode + spj_pbj_arsip.
  (spj_pbj_keranjang_tolak DIHAPUS — yatim, lihat state di atas.)
  Reuse: spj_pbj_form + spj_pbj_invoice_meta + spj_dokumen_kelengkapan_status + spj_otomatis_snapshot. PDF tidak disimpan.
- Kertas A4 mm via templateConfig orientation (tak berubah); ScaledPaper reuse; urutan cetak NON-SIPLAH D1→D5-B tetap; SIPLAH hanya D1.
- Token BLUE-ONLY #004ac6 + slate (keranjang/arsip/chips ikut; tanpa warna bahaya/merah).
- Akses: command-bar + kartu keranjang + chips keyboard-operable (Enter/Space, fokus jelas); toast + badge tiap aksi kurasi;
  section+h2; toggle switch labelled + aria-live; focus-visible; prefers-reduced-motion; target 44px; pageOverflowX=false @1280px.

## Tasks (2–5 menit/task; DoD mesin: build + grep per task)

- [x] B-01 — Toggle mode + simpan diam-diam. Sentuh: DokumenKelengkapanPage.jsx (+ spj_pbj_mode).
  DoD: `cd spj-frontend && npm run build` exit 0 + grep spj_pbj_mode min 1 hit.
- [x] B-02 — Gate tab + badge + cetak + panel ikut mode. Sentuh: DokumenKelengkapanPage.jsx, previewDocs.js.
  DoD: build exit 0 + grep pbjDocs(pbjForm, mode)/gateDocs min 1 hit + sk-doc-print SIPLAH = 1 (cek T-07).
- [x] B-03 — Command-bar 3 pintu. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + grep Dari BKU/Manual min 2 hit + 0 tombol Tambah/Ubah/Hapus level baris (cek T-02).
- [ ] B-04 — Panel cari+centang BKU (kunci A1, tanpa auto-tambah; revisi task 66). Sentuh: DokumenKelengkapanPage.jsx, aturanPbj.js (/paketPbj.js).
  DoD: build exit 0 + grep isSudahBerdokumen min 1 hit + grep "Terima ke PBJ" min 1 hit + grep "Hanya yang belum berdokumen" min 1 hit.
  ([x] premature pra-revisi dicabut — kriteria ditulis ulang 2026-10-10, wajib verifikasi ulang via T-04 baru.)
- [ ] B-05 — Guard tanpa auto-tambah (tanpa chips, tanpa dialog konfirmasi; revisi task 66). Sentuh: verifikasi saja (tanpa src baru).
  DoD: build exit 0 + grep fetch/axios/XMLHttpRequest = 0 + grep Tambah Baris/tambahBaris/onTambah/btn-tambah = 0;
  0 baris tanpa aksi eksplisit (cek T-05 baru).
  ([x] premature pra-revisi dicabut — kriteria ditulis ulang 2026-10-10, wajib verifikasi ulang via T-05 baru.)
- [x] B-06 — Edit inline expand-row. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + tanpa modal edit terpisah (cek T-05).
- [x] B-07 — Arsip halus + Kembalikan + Kosongkan Arsip. Sentuh: DokumenKelengkapanPage.jsx, aturanPbj.js (/paketPbj.js).
  DoD: build exit 0 + grep spj_pbj_arsip min 1 hit + tanpa hapus permanen (cek T-06).
- [x] B-08 — Form Manual subset A5 setara penuh. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + baris manual bisa expand/edit/arsip (cek T-08).
- [x] B-09 — Regresi steril + larangan + STATE/pack updated, tanpa commit. Sentuh: docs planning saja + verifikasi.
  DoD: 4 perintah T-09/T-10 hijau (lihat ACCEPTANCE); STATE.MD + checklist pack terupdate; TANPA commit/push.
