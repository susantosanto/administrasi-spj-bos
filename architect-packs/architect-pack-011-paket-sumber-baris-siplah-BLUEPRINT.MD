# BLUEPRINT — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ

> **Dokumen 2 dari 4** Architect Pack (Bab 8.4 — bagaimana saja).
> Dependency ter-pin eksak (Bab 17.2, salin dari package.json ASLI 2026-10-10 — SAMA dengan sprint-010, 0 lib baru).
> Verifikasi read-only 2026-10-10: DokumenKelengkapanPage.jsx + aturanPbj.js + previewDocs.js + storageHelper.js + templateConfig.js + pbjDataSheet.js ada; pola sprint-010 (aturanPbj murni, prefill berlapis + snapshot, pbjDocs mirror, PanelPreviewDocument reuse) dipakai ulang.

## Arsitektur

```text
COMMAND-BAR (satu pintu, di atas tabel PBJ)
 [Upload PDF] [Dari BKU] [Manual]   (state: pintuTerakhir; Upload = file picker existing)
   |                    |                     |
   | parse existing     | KERANJANG             | FORM MANUAL (subset A5)
   | (aturanPbj)        | kartu per transaksi   | uraian/qty/harga/tgl/
   v                    | belum berdokumen    | penyedia/noAcuan
 TABEL PBJ <------------+ (Terima→tambah /     |
 (15 kolom + expand,     |  Tolak→buang kartu,  |
  struktur tetap)        |  tanpa auto-tambah)  |
   |  ^                  v                     v
   |  | SUGGESTION CHIPS (klik → dialog konfirmasi → tambah; sudah-berdokumen tak muncul)
   |  | EDIT INLINE EXPAND-ROW (nilai baris diedit di dalam expand; autosave + toast)
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
  arsip[] (persist spj_pbj_arsip), tolakSet (NoBukti ditolak sesi+persist spj_pbj_keranjang_tolak).
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

- Storage baru (prefix spj_ via storageHelper): spj_pbj_mode + spj_pbj_arsip + spj_pbj_keranjang_tolak.
  Reuse: spj_pbj_form + spj_pbj_invoice_meta + spj_dokumen_kelengkapan_status + spj_otomatis_snapshot. PDF tidak disimpan.
- Kertas A4 mm via templateConfig orientation (tak berubah); ScaledPaper reuse; urutan cetak NON-SIPLAH D1→D5-B tetap; SIPLAH hanya D1.
- Token BLUE-ONLY #004ac6 + slate (keranjang/arsip/chips ikut; tanpa warna bahaya/merah).
- Akses: command-bar + kartu keranjang + chips keyboard-operable (Enter/Space, fokus jelas); toast + badge tiap aksi kurasi;
  section+h2; toggle switch labelled + aria-live; focus-visible; prefers-reduced-motion; target 44px; pageOverflowX=false @1280px.

## Tasks (2–5 menit/task; DoD mesin: build + grep per task)

- [ ] B-01 — Toggle mode + simpan diam-diam. Sentuh: DokumenKelengkapanPage.jsx (+ spj_pbj_mode).
  DoD: `cd spj-frontend && npm run build` exit 0 + grep spj_pbj_mode min 1 hit.
- [ ] B-02 — Gate tab + badge + cetak + panel ikut mode. Sentuh: DokumenKelengkapanPage.jsx, previewDocs.js.
  DoD: build exit 0 + grep pbjDocs(pbjForm, mode)/gateDocs min 1 hit + sk-doc-print SIPLAH = 1 (cek T-07).
- [ ] B-03 — Command-bar 3 pintu. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + grep Dari BKU/Manual min 2 hit + 0 tombol Tambah/Ubah/Hapus level baris (cek T-02).
- [ ] B-04 — Keranjang Terima/Tolak (kunci A1, tanpa auto-tambah). Sentuh: DokumenKelengkapanPage.jsx, aturanPbj.js (/paketPbj.js).
  DoD: build exit 0 + grep isSudahBerdokumen min 1 hit + grep spj_pbj_keranjang_tolak min 1 hit.
- [ ] B-05 — Chips + dialog konfirmasi. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + grep konfirmasi/chip min 1 hit; 0 baris tanpa konfirmasi (cek T-04).
- [ ] B-06 — Edit inline expand-row. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + tanpa modal edit terpisah (cek T-05).
- [ ] B-07 — Arsip halus + Kembalikan + Kosongkan Arsip. Sentuh: DokumenKelengkapanPage.jsx, aturanPbj.js (/paketPbj.js).
  DoD: build exit 0 + grep spj_pbj_arsip min 1 hit + tanpa hapus permanen (cek T-06).
- [ ] B-08 — Form Manual subset A5 setara penuh. Sentuh: DokumenKelengkapanPage.jsx.
  DoD: build exit 0 + baris manual bisa expand/edit/arsip (cek T-08).
- [ ] B-09 — Regresi steril + larangan + STATE/pack updated, tanpa commit. Sentuh: docs planning saja + verifikasi.
  DoD: 4 perintah T-09/T-10 hijau (lihat ACCEPTANCE); STATE.MD + checklist pack terupdate; TANPA commit/push.
