# BUILD-REPORT — Sprint 003 Fase 1–4 (Builder, 2026-10-01)

> Dry run disetujui user 2026-10-01. Eksekusi Fase 1→4 urut, gate per fase lulus.
> Runtime diverifikasi via pencil browser (playwright MCP backend mati).

## Komit
| Fase | Komit | Isi |
|---|---|---|
| 1 | `17a266d` | `getSemuaPegawai()` + cabang transport/mamin + rename "Lihat Ringkasan" |
| 2 | `a3bd7e6` | `SummaryCard.jsx` baru + jalur layar transport/mamin/pemeliharaan → kartu |
| 3 | `41369ce` | print-area 5-doc transport + 5-doc mamin + 1-doc pemeliharaan |
| 4 | `45129a9` | `MenuGuide.jsx` + `guideConfig.js` + pasang di header 4 menu |

## Gate per fase (bukti output asli)
- Build exit 0 ×5: 7.08s / 7.52s / 9.32s / 7.30s / 6.66s (Node v24.19.0 system fallback)
- T-02: `Preview Dokumen` di DokumenFormPreview = 0; `Lihat Ringkasan` = 1 hit (:1342);
  BKU `Preview Dokumen Foto` dikecualikan (2 hit, benar)
- T-03: `renderPerRecipient` = 0; `KopSurat|SignatureFooter` hanya komentar D-8
- T-07 statik: `getSemuaPegawai` dipakai 2 cabang (transport 94, mamin/pemeliharaan 98);
  cabang honor tetap honorer-only
- T-08 statik: `print:hidden` di MenuGuide; `<MenuGuide` 1 mount kondisional (isSpecial = 4 menu)
- T-10: 15 pola anti-hardcode = 0; `<input|<textarea` 3 blok = 0;
  0 warna terlarang di 3 file baru; diff warisan (11 file Sprint 001/002) = kosong
- Batas file: MenuGuide 153/300 · guideConfig 53/150 · SummaryCard 75/300 · honorHelper 200/200

## Bukti runtime (pencil browser, dev :5173, storage kosong)
- R-1 screenshot `dokumen-lpj`: pill `? Panduan 1/5` tampil di header Honorarium;
  tombol `Lihat Ringkasan` tampil (label baru, ikon list_alt)
- R-2 DOM `[role=dialog]` "Panduan Honorarium": auto-open kunjungan pertama TERBUKTI;
  langkah 1 ✓ (sub Guru terpiih), langkah 2 SEKARANG (0 penerima),
  langkah 3–5 ○; tombol "Selesai — jangan tampilkan lagi" ada
- R-3 E-1: storage kosong → form render tanpa crash (screenshot)

## Temuan saat eksekusi (jujur)
- D-1 dry run meleset: preview Mamin ternyata `renderMaminPreview()` terpisah
  (early return :1624), bukan jalur generik. Diperbaiki di Fase 2/3:
  layar → SummaryCard, builder lama dipakai print-area 5-doc. Tanpa ini
  US-20 tidak tercapai. Tidak ada perubahan pack (preskripsi pack tetap terpenuhi).
- D-2 BLUEPRINT off-by-one: config mamin aktual `:16/56/112/179/241`,
  bukan `:17/57/113/180/242`. Non-blocker.
- D-3 BLUEPRINT tulis templateConfig 993 baris; aktual 966. Non-blocker.
- D-4 DoD 4.4 minta `<MenuGuide` = 4 pemakaian; implementasi 1 mount kondisional
  (`isSpecial` = tepat 4 menu). Perilaku setara, diverifikasi R-1/R-2.
- UNTESTED runtime: T-04/T-05 (hasil cetak 5-doc), T-06 (daftar PNS/PPPK),
  T-07 honor-only, T-09 (config-driven via revert-test), E-2, dismiss permanen,
  print-hidden saat cetak → menunggu /acceptance-runner (klik tidak tersedia
  di pencil browser; playwright MCP mati).

## ADDENDUM — Revisi Panduan (keputusan user, sesi 2026-10-01)

4 keputusan user: (1) konten langkah = tab nyata tiap menu; (2) auto-open
SETIAP masuk menu; (3) trigger "selesai isi tab" selalu muncul — lewati dismiss;
(4) popover tutup saat ganti tab (tidak kebawa). Pack direvisi: REQUIREMENTS
poin 8–9 + tabel US · BLUEPRINT §ADDENDUM task R1…R7 + DSA + storage keys ·
ACCEPTANCE T-08 REVISI + catatan checklist + T-09 `when` · HANDOFF 2 baris.

### Kode revisi (4 file — BELUM di-commit)
| File | Perubahan |
|---|---|
| `data/guideConfig.js` | tulis ulang: 4 menu · langkah per tab (honor 5, transport 6/5, mamin 6, pemeliharaan 4) · `when(ctx)` utk langkah sub-spesifik · tanpa properti `active` · 68/150 baris |
| `components/guide/MenuGuide.jsx` | state machine: mount→auto-open · 1× per tab (`spj_guide_tabseen_`) · ganti tab→tutup+batalkan timer · transisi done→open 600ms (lewati dismiss) · StrictMode-safe · label dismiss baru · 232/300 baris |
| `pages/dashboard/DokumenSPJPage.jsx` | `formTab`/`previewTab` diangkat · `visitedTabs` Set (reset bersama formData) · `activeTab` namespace `f:`/`p:` · `guideCtx` kaya · `key={selectedCard.id}` pada MenuGuide |
| `templates/DokumenFormPreview.jsx` | terima 4 props tab · `useState('daftar')` utk 2 tab = 0 |

### Gate revisi (bukti output asli sesi 2026-10-01)
- **T-01 build: exit 0** — `✓ built in 4.73s` (Node v24.19.0); chunk warning pre-existing
- 15 pola anti-hardcode = **0** · 3 blok `<input|<textarea` = **0**
- `Preview Dokumen` di DokumenFormPreview = **0** · `Lihat Ringkasan` = **1**
- `print:hidden` = 2 · `key={selectedCard.id}` = 1 · `spj_guide_tabseen_` = 2
- `useState('daftar')` di DokumenFormPreview = **0** (state terangkat penuh)
- blue-only: **0 baris baru** — 14 hit amber/emerald di DokumenSPJPage = warisan
  (indikator status Lengkap/Draft; `git diff` = 0 baris tambahan)
- `git diff` blok warisan (blocks/ + sekolahData + signatureRoles) = **kosong**
- Batas file: MenuGuide 232/300 · guideConfig 68/150
- Smoke runtime pencil browser: `/dashboard/dokumen-lpj` render normal, 4 kartu
  menu tampil, tanpa crash (dev :5174)

### UNTESTED revisi → /acceptance-runner (pakai T-08 REVISI 2026-10-01)
- auto-open setiap masuk menu · popover **selalu tampil saat pindah konteks**
  (jenis/tab/mode) · **klik langkah → jump + popover tetap** · trigger
  selesai-isi-tab (termasuk sesudah dismiss) · badge sub Koordinasi/Bank tanpa
  langkah Resume/Undangan · T-09 revert-test
- Alasan: pencil browser tanpa aksi klik (detail view = klik kartu);
  playwright MCP mati. Sisa lama T-04/T-05/T-06/T-07/E-2/print-hidden tetap.

### RONDE-2 (2026-10-01, temuan uji manual user)
Keluhan: (1) pindah jenis (sub-kategori) popover tidak muncul; (2) list langkah
ingin bisa diklik → fokus ke langkah. Keputusan user: (1) popover **selalu tampil
setiap pindah konteks** (SUPERSEDE "1× per tab" + "tutup saat ganti tab");
(2) klik langkah → pindah tab/mode + **scroll** (tanpa fokus field), popover tetap.

- Kode: `guideConfig` +`jump {mode,tab}` ×21 langkah · `MenuGuide` efek
  `contextKey` (menu×jenis×tab), hapus tabseen, langkah jadi `<button>` + chevron ·
  `DokumenSPJPage` +`handleGuideJump` +`onJump`
- Gate: **build exit 0** `✓ built in 5.83s` · `tabseen`=0 · `jump:`=21 ·
  `onJump` di 2 file · `contextKey`=2 · 15 pola=0 · MenuGuide 225/300 ·
  guideConfig 69/150
- Pack: REQUIREMENTS poin 9/10 · BLUEPRINT task R8/R9 + storage table ·
  ACCEPTANCE T-08 (c)/(h) + grep `jump:`=21 · HANDOFF baris ronde-2
