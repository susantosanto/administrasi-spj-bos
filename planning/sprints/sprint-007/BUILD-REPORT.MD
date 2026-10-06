# BUILD-REPORT — Sprint 007: Revisi Parser + Hadir + Menu Pesanan

Branch: `feat/sprint-005-autogen` (Pilihan B — 005+006 ikut kebawa, JANGAN commit/push).
Builder selesai 2026-10-05 (statik). Pack: `planning/sprints/sprint-007/`
(REQUIREMENTS + BLUEPRINT + ACCEPTANCE + HANDOFF-PROMPT).
Dry run disetujui user/koordinator 2026-10-05; eksekusi A.1→E.2. 0 file baru
(`aturanMamin.js` 160/200 — pecah `aturanPesanan.js` TIDAK perlu) + 3 ubah src
(`bkuKategori.js`, `aturanMamin.js` untracked-006 + revisi-007, `DokumenSPJPage.jsx`,
`DokumenFormPreview.jsx`). B.2/D.1/D.2 reuse-006 verified-existing tanpa ubah logika.
Aturan: 0 dependency baru, BLUE-ONLY tambah 0, A4-mm/orientation tak tersentuh,
prefix spj_, cetak formal tak tersentuh, SELALU TIMPA hanya via BKU + snapshot.

## File (0 baru + 3 ubah src + 1 untracked-006 direvisi)

| Task | File | Perubahan | Bukti |
|---|---|---|---|
| A.1 | `src/utils/bkuKategori.js` | `kupasEkorJamuan` (ekor `Jamuan Makanan Box`/`Jamuan Snack Box`/`Snack Box`, case-insensitive) dipakai cabang rapat → acara bersih | grep Jamuan = 4 OK |
| A.2 | `src/utils/bkuKategori.js` | `kupasPrefiksKonsumsi` (strip `Konsumsi makan/snack` + `Kegiatan`-prefiks bila acara dari uraian; `kegiatanNama` BKU dipakai apa adanya); fallback jujur tetap | grep parseMamin = 4 OK |
| A.3 | `src/utils/bkuKategori.js` | oracle 6/6 + multi-baris lama (lihat §Node) | node 18/18 OK |
| B.1 | `src/utils/bkuKategori.js` + `DokumenSPJPage.jsx` | BARU `bacaGTKUntukHadir()` (baca `data_guru`+`data_tendik` via storageHelper, Guru→Tendik, dedupe, kosong→[]); SPJ pakai untuk `hadir006` ganti `getSemuaPegawai` (import honorHelper dibuang dari SPJ) | grep data_tendik = 1 OK |
| B.2 | reuse-006 verified-existing | toggle + TabelDinamis hadir editable + `templateDaftarHadir` rows TTD kosong (tanpa ubah kode) | grep templateDaftarHadir = 3 OK |
| C.1 | `src/utils/aturanMamin.js` | BARU `MENU_PESANAN` (Nasi Box 6 + Snack Box 4, dari DOCX) + `normalisasiJenisPesanan` (alias nasi/snack) + `rincianMenu(jenis)` (tak dikenal→[]) | node menu OK |
| C.2 | `src/utils/aturanMamin.js` | `templatePesananMamin` terima `jenis` opsional; menu dipilih dari gabungan `jenis`+hasil parseKonsumsi+uraian; tak dikenal→fallback 1 baris `parseKonsumsi`; kosong→[] | grep templatePesananMamin = 3 OK |
| C.3 | `DokumenFormPreview.jsx` | tombol "Isi menu baku" (gated: pesananRows kosong + `rincianMenu(...)` dikenal; satuan/jumlah dari baku/formData; rows hasil editable/tambah/hapus seperti biasa) | grep MENU_PESANAN/rincianMenu util+render = 9 OK |
| D.1 | reuse-005/006 verified-existing | snapshot SEBELUM timpa — `Object.keys(tambahan)` otomatis mencakup acara bersih + rows hadir + pesananRows/menu (diterapkan SEBELUM snapshot, baris 245-265 → snapshot 269) | grep spj_otomatis_snapshot = 3 OK |
| D.2 | reuse-005/006 verified-existing | badge "dari BKU" + Urungkan + toast timpa berlaku revisi (generik, tanpa ubah kode) | grep Urungkan = 7 OK |
| E.1 | gate | 15 pola anti-hardcode = 0 · diff warisan (blocks/templateConfig/TemplateEngine) kosong · `aturanMamin.js` 160/200 (pecah TIDAK perlu) | OK + 1 catatan |
| E.2 | gate | build exit 0 ×2 (baseline `5.03s`, final `4.99s`) · added-lines warna-larang + fetch/AI = 0 · STATE.MD + pack updated · tanpa commit/push | OK |

## Build (T-01)

`cd spj-frontend && npm run build` → exit 0, `✓ built in 4.99s` (final;
baseline pra-coding `5.03s`). Node `v24.19.0`.

## Node — oracle 18/18 (T-02/T-03/T-04/T-05/T-06)

Harness `C:\Users\Acer\AppData\Local\Temp\opencode\oracle007.mjs` (impor ULANG
3 file src byte-identical; hanya 2 baris impor extensionless ditulis ulang
`./x` → `./x.js` karena node-plain tak resolve Vite-style — logika diuji 100% asli):

- A.1 jamuan ×3: `…Rapat Penyusunan Silabus Jamuan Makanan Box` →
  `{rapat, Penyusunan Silabus}`; `…Rapat Koordinasi Snack Box` → `{rapat, Koordinasi}`;
  `…Rapat X Jamuan Snack Box` → `{rapat, X}` — semua `cocok:true`, 0 sisa jamuan.
- A.2 konsumsi ×2: `Konsumsi Snack Kegiatan Perpisahan Kelas 6` →
  `{kegiatan, Perpisahan Kelas 6}`; `Konsumsi Makan Kegiatan Halal Bihalal` →
  `{kegiatan, Halal Bihalal}`. Fallback `Belanja ATK semester` →
  `{jenis:'', cocok:false}` (jujur). Multi-baris lama
  `Beban…\nPenyusunan Silabus` → `{rapat, Penyusunan Silabus}` (T3 warisan utuh).
- T-05 `templateDaftarHadir({acara:'Rapat X',orang:[]})` → `rows[]`, 0 karangan.
- T-04 mapping 2 orang → 2 rows `{id:nip, nama, jabatan, ttd:'', ttd2:''}`.
- `bacaGTKUntukHadir()` tanpa storage (node) → `[]` jujur, tanpa crash.
- T-06 `rincianMenu('Nasi Box')` = 6 (Nasi Putih…Kerupuk);
  `rincianMenu('Snack Box')` = 4 (Risoles Ayam, Kue Bolu Mini, Lemper, Pudding Cup);
  tak dikenal → []. `templatePesananMamin snack-50-box` → 4 rows jumlah `50`;
  nasi-100-kotak + jenis Nasi Box → 6 rows; `makan 30 porsi` → fallback 1 baris
  `{Makan Porsi, Porsi, 30}`; kosong → [].
- Hasil: `ORACLE: 18/18` (exit 0).

## REWORK Ronde 1 (2026-10-05 — verdict NOT APPROVED High, 2 gap ditutup)

1. **FAIL C-07/T-08 (382 baris >200) → DITUTUP.** `bkuKategori.js` dipecah:
   `aturanPesanan.js` BARU (192/200, pola 006: parser Mamin byte-identical +
   `bacaGTKUntukHadir` + gabung/kelompok ATK/konsumsi/NoBukti + dominan +
   `DOMINAN_PRIORITAS`) + `bkuKategori.js` 382→**194/200** (inti kategori/
   koreksi/riwayat/pejabat/prefill + impor ulang + re-export 1 pintu, API
   publik identik — BKUSidebar/BKUPage/DokumenSPJPage/PejabatSekolahPage tanpa
   ubah impor). Sirkular bkuKategori↔aturanPesanan aman (preseden 006
   aturanUndangan↔aturanMamin; hanya dipanggil saat runtime). Komentar
   dipadatkan di file baru; 0 baris logika berubah.
2. **DEVIATION import node (`ERR_MODULE_NOT_FOUND` storageHelper) → DITUTUP.**
   Impor extensionless warisan di `bkuKategori.js` → berekstensi `.js`
   (`./storageHelper.js`, `./aturanUndangan.js`, `./aturanPesanan.js`);
   tanpa ubah logika. Perintah node prescribed ACCEPTANCE kini jalan
   langsung TANPA harness: T-02 `{rapat, Penyusunan Silabus}` exit 0 ·
   T-03 `{kegiatan, Perpisahan Kelas 6}` + fallback ATK `{jenis:'', cocok:false}`
   exit 0 · T-05 `rows[]` exit 0 · T-06 4 rows snack exit 0.
   (41 impor extensionless lain di `*.jsx`/komponen = warisan Vite-only,
   di luar cakupan — node hanya menguji `src/utils/`.)

Gate rework: build exit 0 (`✓ built in 5.03s`, 186 modul = +1 aturanPesanan) ·
oracle 22/22 langsung atas src (18 kasus 007 + 4 warisan gabung/dominan/ATK
via re-export) · `wc -l` bkuKategori 194 + aturanPesanan 192 + aturanMamin 160
+ aturanUndangan 148 (semua ≤200) · hardcode 15 pola = 0 · offline
fetch/AI = 0 · diff cetak (blocks/templateConfig/TemplateEngine) kosong ·
MENU_PESANAN/rincianMenu util+render = 9 · spj_otomatis_snapshot = 3 ·
Urungkan = 11 · data_tendik = 18 · templateDaftarHadir = 3.
Cetak formal tak tersentuh. Tanpa commit (branch `feat/sprint-005-autogen`).

## Deviasi / catatan tercatat (sadar, bukan diam-diam — pra-rework, kini DITUTUP §REWORK)

1. Perintah ACCEPTANCE T-02/T-03/T-05/T-06 `node -e import('./spj-frontend/…')`
   GAGAL langsung di node-plain (`ERR_MODULE_NOT_FOUND` — impor extensionless
   warisan `./storageHelper`, `./aturanUndangan`; preseden sama dicatat Sprint 006
   §Deviasi-3). Diatasi via harness salin-temp + tulis-ulang 2 baris impor saja
   (logika byte-identical) → 18/18. Build Vite (lintasan produksi) exit 0.
2. T-08 `wc -l` gate: `aturanMamin.js` 160/200 ✅ (pecah `aturanPesanan.js` TIDAK
   perlu); `bkuKategori.js` 382 = WARISAN pra-007 sudah 337 saat dry-run
   (tumbuh +45 oleh A.1/A.2/B.1 sesuai tabel file BLUEPRINT) — refactor warisan
   di luar cakupan (AGENTS.MD larang refactor luar sprint). Anti-hardcode 0,
   diff warisan + print-area kosong, blue-only tambah 0, offline 0 fetch — gate
   substansi T-08 LOLOS; angka baris warisan dicatat jujur di sini.
3. "Teruskan jenisPesanan" (BLUEPRINT tabel file): direalisasikan sebagai param
   `jenis` opsional di `templatePesananMamin` + tombol editor baca
   `formData.jenisPesanan`; prefill awal derivasi dari uraian via
   `parseKonsumsi` (satu sumber, tanpa duplikasi parser di `prefillDariBKU`).
   `prefillDariBKU` sendiri tak diubah selain menerima acara bersih dari
   `parseMamin` revisi (SELALU TIMPA + snapshot tak tersentuh).
4. UNTESTED runtime (butuh browser + seed storage): T-04/T-05 klik-baris→tab
   Hadir + screenshot, T-06 screenshot pesanan 6/4, T-07 3 screenshot
   sebelum/sesudah/undo, E-1 buka-ulang → /acceptance-runner konteks segar.
