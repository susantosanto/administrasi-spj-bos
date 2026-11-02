# VERIFICATION-REPORT — Sprint 011: Paket Sumber Baris + Toggle SIPLAH PBJ (+ revisi 65-68)

> Acceptance-runner FRESH (bukan sesi pembangun kode), read-only src (verifikasi, bukan fix), tanpa commit/push.
> Branch: `feat/sprint-011-paket-sumber` · Tanggal: 2026-10-10 · Runner: implementor task 69.
> Server: dev :5173 existing (PID 11260, worktree branch ini) · Browser: playwright-mcp (Edge agent) · Console: **0 errors**.

## Verdict: REWORK (8 PASS / 2 GAP-desain / 1 UNTESTED-live)

Alasan satu kalimat: semua yang diklaim builder TERBUKTI jalan (toggle, command-bar, keranjang jujur, edit inline, arsip 100%, gate 1-dokumen, manual, build, regresi steril),
tetapi **revisi task 66 mengganti desain T-04/T-05 tanpa delta acceptance** — tidak ada tombol Tolak per kartu dan tidak ada suggestion chips + dialog konfirmasi,
sehingga T-04/T-05 **sebagaimana tertulis di ACCEPTANCE.MD tidak dapat dieksekusi** (bukan bug: perilaku pengganti terverifikasi jujur).

## Hasil per kriteria

| ID | Kriteria | Verdict | Bukti |
|----|----------|---------|-------|
| T-01 | Build | **PASS** | `npm run build` exit 0 — `✓ built in 5.30s`, 195 modul, node v24.19.0. Warning chunk >500kB + xlsx dynamic-import = pre-existing (sama di main/sprint-010). |
| T-02 | Toggle + simpan diam-diam | **PASS** (runtime) | Default NON-SIPLAH (aria-pressed). Klik SIPLAH → 1 tab + 1 figure + label "hanya tab Perencanaan + cetak 1 dokumen". Klik NON → 6 tab + 7 figure, 2 baris utuh. Reload → mode `spj_pbj_mode="non"`, 6 tab, 2 baris (persist). Toast 1 baris per ganti (kode `handleToggleMode`). Grep `spj_pbj_mode`: 2 hit (state + persist; storageHelper auto-prefix `spj_`, terbukti di localStorage). |
| T-03 | Command-bar, 0 CRUD/baris | **PASS** | Toolbar "Sumber baris PBJ — satu pintu": Upload PDF + Dari BKU + Manual (+ Kosongkan Tabel + Urungkan). Grep `Tambah Baris|tambahBaris|onTambah|btn-tambah` = 0; `Dari BKU|Manual` = 53 hit. Screenshot command-bar ✓. |
| T-04 | Keranjang Terima/Tolak | **GAP (desain diganti revisi-66)** | Panel "Ambil dari BKU — cari + centang · 3 cocok · 2 No. Bukti": search + filter tanggal + toggle "Hanya yang belum berdokumen (aktif)" + badge Sudah/Belum-berdokumen + "Terima ke PBJ (n)" batch. Jujur: hanya yang dicentang masuk (`handleTerimaDipilih`; helper `Terima ke PBJ (0)` disabled saat 0). **Tetapi**: tidak ada tombol Tolak per kartu; `spj_pbj_keranjang_tolak` hanya di komentar (1 hit); tidak ada `tolakSet` state. Langkah T-04 tertulis (Tolak 1 kartu → hilang) tak dapat dijalankan. |
| T-05 | Chips + konfirmasi | **GAP (fitur diganti revisi-66)** | Tidak ada suggestion chips dan tidak ada dialog konfirmasi di kode (grep `chip|Chip` hanya "Kritik & Saran" + komentar "ganti chips+keranjang menumpuk" task 66). Sisi positif: 0 auto-tambah (fetch = 0; tambah hanya via Upload/Terima-dipilih/Manual-submit), jadi "0 baris tanpa konfirmasi eksplisit" terpenuhi secara vakum — tetapi alur yang dinilai tidak ada. |
| T-06 | Edit inline + arsip | **PASS** (runtime penuh) | Expand baris → input inline Uraian/Qty/Harga + No.acuan/Penyedia/Tanggal (autosave + toast, tanpa modal, tanpa tombol Ubah). Live: Arsipkan baris 1 → tabel 1 + "Arsip (1 baris)"; Kembalikan → tabel 2 + arsip 0 (**round-trip 100%**). Kosongkan Arsip → arsip [] (juga live). Tombol Arsipkan = `bg-white border-slate-200` (tanpa warna bahaya). Grep `spj_pbj_arsip` = 1 hit kode + persist via storageHelper. |
| T-07 | Gate SIPLAH 1 dokumen | **PASS** (runtime) | Mode SIPLAH: tablist = ["Perencanaan"] (1), figure = 1, badge/panel ikut. Mode NON: 6 tab + 7 figure. Catatan ukur: `grep -c sk-doc-print` statis = 1 (satu node JSX me-render list `pbjDocsList`) — kriteria "NON-SIPLAH = 6" tidak bermakna statis; ukuran runtime yang sah = 7 figure vs 1 figure ✓. Screenshot tab-bar SIPLAH ✓. |
| T-08 | Form Manual A5 | **PASS** (runtime penuh) | Form "Manual — subset esensial": Uraian* + Qty + Harga + Tanggal + Penyedia + Nomor acuan + panduan 3 langkah + contoh. Live submit uji ("Kertas HVS A4 80gr (uji acceptance)", 10 × 55000, NOTA-UJI-001) → baris 3 tampil "3 · Oktober · NOTA-UJI-001 · 5 Oktober 2026 · 1 item manual · … · 550.000 · Toko Barokah (uji)" + auto-expand. Residue dibersihkan (Arsipkan baris 3 → Kosongkan Arsip; kembali 2 baris + arsip []). |
| T-09 | Regresi steril + larangan | **PASS** | `git diff --stat -- templateConfig/TemplateEngine/blocks/` = KOSONG. `package.json` diff = KOSONG. Larangan `tanda.tangan.digital|KIRIM.ke.server|QRCode|navy` = 0 hit (LARANGAN-BERSIH). `print:hidden` pada 8 blok baru (nav, toggle, command-bar, keranjang, manual, arsip, aside). `fetch|axios|XMLHttpRequest` = 0. Aksen `accent-[#004ac6]` (BLUE-ONLY). Storage via storageHelper (prefix `spj_` otomatis; key `pbj_mode/pbj_arsip/pbj_form/pbj_invoices/pbj_invoice_meta` → `spj_*` di localStorage, terbukti). BKUPage: +13/-1 (titik "Kirim ke PBJ" saja). |
| T-10 | STATE + pack, tanpa commit | **PASS dengan catatan** | STATE.MD memuat blok Sprint-011 builder. `git status` oleh runner: M STATE.MD, ACCEPTANCE.MD, BLUEPRINT.MD, BKUPage, DokumenKelengkapanPage, previewDocs + untracked `paketPbj.js` & artefak junk lokal (template/log/screenshot — pre-existing, bukan oleh runner). Runner: 0 src diubah, 0 commit/push. Catatan: checklist C-01..C-08 sudah [x] padahal T-04/T-05 GAP — premature, lihat GAPS. |
| E-1 | Keranjang kosong | **PASS-equivalent** | Empty states jujur ada: "Belum ada data BKU — upload BKU Excel dulu…" dan "Tidak cocok — ubah kata kunci…". Beda redaksi dari teks ACCEPTANCE ("Tidak ada transaksi BKU yang belum berdokumen") — makna sama, tanpa crash. |
| E-2 | Upload asing mode SIPLAH | **UNTESTED (live)** | Jalur fallback ada di kode (`Tidak terbaca otomatis - silakan isi manual`, `Gagal membaca PDF - silakan isi manual`, baris TIDAK bertambah saat parse gagal). Upload PDF asing live tidak dijalankan (butuh file fixture + memengaruhi data). |
| C-01 | Round-trip lossless | **PASS** | T-02 (toggle 3× dua arah + reload persist). |
| C-02 | 0 CRUD/baris | **PASS** | T-03. |
| C-03 | Keranjang jujur | **PASS-b Perilaku, GAP-spesifikasi** | Tanpa auto-tambah terbukti (button disabled saat 0; hanya dicentang yang masuk). "Tolak" tidak ada → spesifikasi usang. |
| C-04 | 0 baris tanpa konfirmasi | **GAP** | Mengikuti T-05. |
| C-05 | Edit inline + arsip 100% | **PASS** | T-06 (Kembalikan live 100%). |
| C-06 | SIPLAH steril 1 dokumen | **PASS** | T-07. |
| C-07 | Larangan + regresi | **PASS** | T-09. |
| C-08 | Build + STATE/pack, tanpa commit | **PASS-bersyarat** | Build ✓, tanpa commit ✓; checklist pack perlu koreksi (C-03/C-04 [x] premature). |

## GAPS (untuk architect — bukan untuk di-fix diam-diam)

1. **G-1 — T-04/T-05 vs revisi task 66 (keputusan, bukan bug).** Revisi 65-68 (task 66 "cari+centang — ganti chips+keranjang menumpuk", task 67 fokus Manual, task 68 nama kegiatan) mengganti desain pack tanpa delta ACCEPTANCE. Pilihan: (a) terima desain baru → revisi ACCEPTANCE T-04/T-05 + C-03/C-04 + uncheck-ubah-checklist; (b) kembalikan Tolak-per-kartu + chips (kerja ulang). Rekomendasi runner: (a) — pengganti terverifikasi jujur, lebih sederhana, dan konsisten dengan "kurasi bukan CRUD".
2. **G-2 — `spj_pbj_keranjang_tolak` yatim.** Key disebut di BLUEPRINT + komentar kode, tanpa state/UI. Bila pilih (a): hapus dari BLUEPRINT/storage-list; bila (b): implementasikan.
3. **G-3 — Kriteria ukur T-07/T-09 statis tidak valid.** `grep -c sk-doc-print` = 1 di kedua mode (render list). Ganti dengan ukuran runtime (figure count) atau hapus.
4. **G-4 — Observasi minor: satu flip mode tak terjelaskan.** Di tengah sesi (antara klik baris dan cek arsip) mode sempat terbaca `siplah` padahal terakhir diset `non`; hanya dua tombol toggle yang memanggil `setModeSiplah` (tidak ada auto-set di kode). Kemungkinan klik nyasar saat layout shift. Toggle dua arah terverifikasi 3× + persist reload; tidak diklasifikasikan sebagai bug. Saran: jika terulang, selidiki dengan video tracing.
5. **G-5 — E-2 dan cetak fisik tetap UNTESTED** (butuh fixture PDF asing + printer). E-1 redaksi beda (terima atau selaraskan teks).

## Bukti (screenshot browser, viewport)

- `page-2026-10-10T02-32-30-041Z.png` — mode SIPLAH: toggle pressed + label 1-dokumen + command-bar + tabel 2 baris + arsip + 1 tab Perencanaan.
- `page-2026-10-10T02-33-33-229Z.png` — keranjang "Ambil dari BKU — cari + centang · 3 cocok · 2 No. Bukti" + kandidat Berlum-berdokumen + "Terima ke PBJ (0)".
- `page-2026-10-10T02-35-43-886Z.png` — form Manual 6 field + panduan + baris 1 ter-expand (edit inline).
- Console sepanjang sesi: 0 errors (2 warnings pre-existing: React Router future flags + DevTools hint).

## Perintah yang dijalankan (ringkas)

```bash
cd spj-frontend && npm run build            # exit 0, 5.30s, 195 modul
git diff --stat -- templateConfig TemplateEngine blocks/   # KOSONG
git diff --stat -- spj-frontend/package.json               # KOSONG
# + 9 grep DoD (mode 2, BKU/Manual 53, isSudahBerdokumen 6, keranjang_tolak 1-komentar,
#   konfirmasi/chip 3-tanpa-UI, arsip 1, sk-doc-print 1, larangan 0, print:hidden 8 blok)
# + browser live: login → PBJ → toggle 2 arah → keranjang → manual → expand → arsip round-trip
#   → manual submit → cleanup → reload persist → (semua console 0 errors)
```

## Rekomendasi

**REWORK pack dulu (G-1):** architect putuskan (a)/(b), selaraskan ACCEPTANCE + BLUEPRINT + checklist, baru sprint dapat APPROVED.
Perilaku kode yang ada **layak APPROVED bersyarat** begitu pack diselaraskan — tidak ditemukan bug fungsional.

---

## ADENDUM 2026-10-10 — Penyelarasan pack ke desain cari+centang (task 70) — **APPROVED**

> Docs-only: 0 src diubah, 0 commit/push. Pelaksana: implementor task 70 (read-only src untuk konfirmasi perilaku).

**Keputusan:** opsi **(a) G-1 DITERIMA** — desain panel cari+centang revisi task 66 resmi menggantikan
keranjang Terima/Tolak-per-kartu + suggestion chips + dialog konfirmasi. Tanpa auto-tambah terkonfirmasi di kode:
tambah baris hanya via Upload PDF (parse existing) / `handleTerimaDipilih` (batch yang dicentang) / Manual-submit;
`Terima ke PBJ (0)` disabled + toast info; `fetch|axios|XMLHttpRequest` = 0 (laporan verifikasi 2026-10-10).

**Delta pack (4 dokumen):**

| Dokumen | Perubahan |
|---|---|
| REQUIREMENTS.MD | §1 goal + §4 item 2-3 + §8 metrik ditulis ulang ke panel cari+centang + guard tanpa auto-tambah |
| BLUEPRINT.MD | Diagram arsitektur + state (tolakSet → bkuCari/Dari/Sampai/HanyaBaru/GrupBuka/Dipilih) + storage (spj_pbj_keranjang_tolak DIHAPUS, yatim) + B-04/B-05 ditulis ulang, [x] premature → [ ] |
| ACCEPTANCE.MD | T-04/T-05 ditulis ulang (panel cari+centang + guard); C-03/C-04 ditulis ulang, [x] premature → [ ]; gate + T-07/T-09 dikoreksi ke ukur runtime (G-3 CLOSED); E-1 redaksi diselaraskan; uji manual T-04' ditambah |
| HANDOFF-PROMPT.MD | Mapping B-04/B-05 → T-04'/T-05'; perintah `grep -c sk-doc-print` ditiadakan (G-3); adendum opsi (a) |

**Status GAP:**

- G-1 CLOSED (diputuskan: terima desain baru). G-2 CLOSED-pack / OPEN-kode (sisa `TOLAK_KEY` export + komentar
  yatim di paketPbj.js + DokumenKelengkapanPage.jsx — pembersihan kode di luar cakupan docs-only, dicatat untuk sprint berikut).
  G-3 CLOSED (kriteria diganti ukur runtime). G-4 tetap observasi (bukan bug). G-5 tetap (E-2 + cetak fisik UNTESTED).
- C-01/C-02/C-05/C-06/C-07/C-08 + T-01/T-02/T-03/T-06/T-07/T-08/T-09/T-10/E-1: verdict PASS laporan di atas TETAP BERLAKU
  (kriteria tak berubah).
- C-03/C-04 + T-04'/T-05' (kriteria baru): **wajib diverifikasi ulang acceptance-runner FRESH** sebelum sprint
  dinyatakan SELESAI penuh (Definisi Selesai: C-01..C-08 centang + T-01..T-10 + E-1/E-2 lulus).

**Verdict adendum: APPROVED** (penyelarasan pack sah; perilaku pengganti sudah terverifikasi jujur di laporan di atas).

---

## ADENDUM KEDUA 2026-10-10 — Verifikasi ulang T-04'/T-05' baru (task 71, acceptance fresh mini) — 4/4 PASS

Fresh context, read-only src, tanpa ubah src/commit/push. Pelaksana: implementor task 71.
Branch: feat/sprint-011-paket-sumber. Server: dev :5173 existing (PID 11260). Browser: playwright-mcp. Console: 0 errors (2 warnings pre-existing).
Fixture: seed sementara 3 transaksi BKU (UJI-001 x2 + UJI-002) via localStorage, dibersihkan pasca-uji (kembali 0 baris, tanpa seed).

### Hasil per item baru

T-04' Panel cari+centang BKU = PASS (statis + live).
- Grep: isSudahBerdokumen = 6 (>=1); Terima ke PBJ = 4 (>=1); Hanya yang belum berdokumen = 1 (>=1).
- Live: panel 3 cocok / 2 No. Bukti; ketik tinta = 1 cocok / 1 No. Bukti + rincian per-transaksi + grup buka-tutup.
- Centang grup UJI-001 = 2/2 dipilih + Terima ke PBJ (2) enabled; klik = tabel 2 baris tepat (ATK 500rb + tinta 250rb, expand inline jalan).
- Panel susut ke 1 cocok (UJI-001 terfilter sbg sudah-berdokumen). Toggle OFF = 3 cocok, badge Sudah/Belum-berdokumen jujur; default ON berlabel (aktif).
- Tombol (0) = atribut disabled sehingga klik mustahil = 0 baris (lebih kuat dari varian toast; kriteria sendiri menyebut disabled).

T-05' Guard tanpa auto-tambah = PASS (statis + live).
- Grep: fetch|axios|XMLHttpRequest = 0; Tambah Baris|tambahBaris|onTambah|btn-tambah = 0.
- Tolak = hanya komentar baris 500 DokumenKelengkapanPage.jsx (0 tombol UI); chip/dialog/konfirmasi = hanya komentar (0 UI).
- Sisa TOLAK_KEY export + param tolakSet di paketPbj.js = yatim tanpa UI (G-2 OPEN-kode tetap, bukan temuan baru).
- Live: panel dibuka berisi kandidat, tabel tetap 0 baris sampai klik Terima eksplisit.

C-03 Panel cari+centang jujur = PASS (mengikuti T-04': batch tepat n=2; 0 dipilih = 0 baris; tanpa auto-tambah).
C-04 Tanpa auto-tambah = PASS (mengikuti T-05': tanpa chips, dialog konfirmasi, Tolak-per-kartu).

### Gate build (ulang fresh)

node -v = v24.19.0; npm run build exit 0, built in 16.62s (warning chunk >500kB pre-existing). 0 src diubah, 0 commit/push.

### Screenshot sesi ini (viewport, folder .playwright-mcp/)

- page-2026-10-10T02-56-26-775Z.png = panel 3 cocok + badge Belum-berdokumen + Terima(0) disabled + tabel 0 baris.
- page-2026-10-10T02-58-45-877Z.png = sesudah Terima(2): panel 1 cocok (hanya UJI-002) + tabel 2 baris.

### Status GAP sesudah adendum kedua

- G-1 CLOSED (tetap). G-2 OPEN-kode (tetap). G-3 CLOSED (tetap). G-4 observasi (tetap; sesi ini mode terbaca SIPLAH pasca-reload padahal awal NON-SIPLAH — pola G-4, di luar cakupan). G-5 tetap (E-2 + cetak fisik UNTESTED).
- Verdict laporan utama + adendum task 70 TETAP BERLAKU untuk kriteria tak berubah.

Verdict adendum kedua: 4/4 PASS. Rekomendasi ke coordinator: sprint-011 dapat dinyatakan SELESAI penuh setelah checklist C-03/C-04 dicentang di ACCEPTANCE.MD (kuasa architect/pack-keeper, bukan runner ini).
