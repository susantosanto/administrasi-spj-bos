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
