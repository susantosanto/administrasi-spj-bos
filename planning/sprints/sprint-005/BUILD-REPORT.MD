# BUILD-REPORT — Sprint 005: Autogenerate Undangan + Resume

Branch: `feat/sprint-005-autogen` dari `main` @ `65a71f9`. Builder selesai 2026-10-03 (statik).
Pack: `planning/sprints/sprint-005/` (REQUIREMENTS · BLUEPRINT · ACCEPTANCE · HANDOFF-PROMPT).
Dry run disetujui user 2026-10-03; DRAF note lama (autogenUndangan.js/autogenResume.js) dinyatakan USANG — ikut pack final.

## File (1 baru + 3 ubah src; BKUSidebar verified-existing tanpa diff)

| Task | File | Perubahan | Bukti |
|---|---|---|---|
| A.1 | `src/utils/aturanUndangan.js` BARU 142/200 baris | parsePerjalanan + keISO/hariDariISO/tanggalPanjang | node import 11 exports ✅ · 7 kasus parser ✅ |
| A.2 | `src/utils/bkuKategori.js` | parseMamin SENGAJA tak diubah (verified 6/6 T3 Sprint 004) + import parsePerjalanan | grep parseMamin = 4 ✅ |
| A.3 | `src/utils/bkuKategori.js` | prefillDariBKU → SELALU TIMPA + tertimpa[] + sptUntuk via parsePerjalanan | grep prefillDariBKU = 4 (3 file) ✅ |
| A.3 | `BKUSidebar.jsx` | verified-existing: tx lengkap sudah dibawa (uraian/nominal/tanggal/noBukti/kegiatan/kegiatanNama/maminJenis/kodeRekening/grup) — tanpa diff | — |
| B.1 | `aturanUndangan.js` | templateUndanganMamin (salam + Bersamaan… + T1 + penutup) | grep = 3 ✅ · node: isi+penutup ok ✅ |
| B.2 | `aturanUndangan.js` | templateUndanganPerjDinas (SPT + SPD + 5.1.02.04.01.0003 + BOS Reguler) | grep = 3 ✅ · node: akun+skpd ok ✅ |
| B.3 | `DokumenSPJPage.jsx` + chip `DokumenFormPreview.jsx` (+11) | terap template ke tambahan/sppdData + chip "dari BKU" di form | grep 'dari BKU' = 3 (preview) / 17 (src) ✅ |
| C.1 | `aturanUndangan.js` | drafNotulen (pembuka baku + 5 butir draf + pesertaJumlah) | node: pembuka ok ✅ |
| C.2 | `DokumenSPJPage.jsx` + komentar trace `DokumenFormPreview.jsx` | Object.assign draf ke tambahan; textarea resume/poin existing = editable | grep drafNotulen = 7 (3 file) ✅ |
| D.1 | `aturanUndangan.js` + `DokumenSPJPage.jsx` | snapshotSebelumTimpa/bacaSnapshot/urungkanTimpa (key `spj_otomatis_snapshot`); snapshot SELURUH form+sppd SEBELUM timpa; efek jalan ulang tiap ts BKU baru; undo baca storage | grep spj_otomatis_snapshot = 3 ✅ |
| D.2 | `DokumenSPJPage.jsx` | badge "N ditimpa (bisa Urungkan)" + Urungkan + toast timpa | grep Urungkan = 6 ✅ |
| E.1 | gate | 5 pola T-08 = 0 · added-lines 15 pola + fetch/AI = 0 · diff warisan (blocks/templateConfig/TemplateEngine) kosong · hex baru 0 | ✅ |
| E.2 | gate | E-2 `fetch\|axios\|API_KEY\|openai\|groq\|gemini` di aturanUndangan.js = 0 (satu false-positive komentar "fetch" diperbaiki jadi "jaringan") · build exit 0 `4.92s` · node v24.19.0 | ✅ |

## Build (T-01)

`cd spj-frontend && npm run build` → `✓ built in 4.92s`, exit 0 (jalan ×3 selama sprint).

## Keputusan builder

1. parseMamin byte-identical (lindungi T3 6/6). 2. Import storageHelper pakai ekstensi `.js`
   eksplisit agar T-02 jalan di node murni (Vite tetap resolve). 3. Template tanpa nama
   sekolah/pejabat asli (generik: "Kepala Sekolah se-gugus", "Tingkat gugus").
   4. Snapshot = seluruh formData + sppdData (undo pulihkan total, bukan hanya field timpa).

## UNTESTED → /acceptance-runner konteks segar

T-03…T-07 screenshot runtime (klik BKU → form terisi; sebelum/sesudah/undo),
E-1 buka-ulang, C-08 STATE/pack. Statik sudah hijau semua.
