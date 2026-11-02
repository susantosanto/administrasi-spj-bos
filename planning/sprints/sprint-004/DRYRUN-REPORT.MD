# DRYRUN-REPORT — Sprint 004: BKU → LPJ Smart Bridge (Builder, MODE DRY RUN)

> Status: MENUNGGU PERSETUJUAN USER — coding DILARANG sebelum disetujui (AGENTS.MD).
> Baseline: `npm run build` exit 0 — `✓ built in 7.38s`, 182 modules, Node v24.19.0 (system fallback).
> `npm ci` TIDAK dijalankan (risiko hapus @esbuild/win32-x64 pola Sprint 001; build hijau = baseline cukup).
> Git: `M DECISIONS.MD` + untracked pack 004 + artefak agent (`.birdview/`, `pencil.dev/`, `.playwright-mcp/`) — tidak sentuh kode.

## 1. Urutan task (A.1 → E.2) + file + DoD

| ID | Task | File | DoD (machine-checked) |
|---|---|---|---|
| A.1 | `REKENING_KE_MENU` + `kategoriDariRekening()` (normalisasi: trim + hapus spasi + casefold; longest-prefix menang; null = belum dipetakan) | `utils/bkuKategori.js` BARU | build exit 0 |
| A.2 | Badge kategori per baris + badge count "N belum dipetakan" + filter | `BKUPage.jsx` | build exit 0 · grep `kategoriDariRekening` ≥ 1 |
| A.3 | `spj_bku_koreksi` simpan/baca mapping custom (dipakai permanen, prioritas atas peta) | `bkuKategori.js` | build exit 0 |
| B.1 | Sidebar detail: uraian, rekening+kategori, nominal, tanggal, no bukti, kegiatan; Esc/klik-luar tutup; dropdown koreksi utk tak-terpetakan | `BKUSidebar.jsx` | build exit 0 |
| B.2 | Tombol deep-link per kategori → route menu tepat (Honor/Mamin/Perjalanan/Pemeliharaan/Kelengkapan) | `BKUSidebar.jsx` | build exit 0 · grep `dokumen-lpj\|dokumen-kelengkapan` ≥ 2 |
| B.3 | `prefillDariBKU()` (isi field kosong saja + badge "dari BKU" + undo); toast bila field sudah terisi | `bkuKategori.js` + `DokumenSPJPage.jsx` | build exit 0 · grep `prefillDariBKU` ≥ 2 file |
| C.1 | `gabungKonsumsi()` (AND ketat trim/casefold no_bukti + kegiatan; saran nyaris-sama; 3+ baris; tampil 2 rincian + total) | `bkuKategori.js` | build exit 0 |
| C.2 | `spj_pejabat_riwayat` + `pejabatPada()` (lookup max berlaku_dari ≤ tanggal; fallback tertua + warning) + UI tambah periode + kunci saat dokumen dibuat + label/tooltip | `PejabatSekolahPage.jsx` + `DokumenSPJPage.jsx` | build exit 0 · grep `pejabatPada\|spj_pejabat_riwayat` ≥ 2 |
| C.3 | Gate: dokumen lama tidak berubah setelah tambah periode (uji manual 2 periode) | — | bukti screenshot |
| D.1 | `kelompokATK()` (grup by no_bukti; Nomor kosong = kelompok sendiri) + `spj_atk_flag` + panah visual + tandai SIPLAH/Non per kelompok + checkbox gabung beda no BKU | `bkuKategori.js` + `BKUPage.jsx`/`BKUSidebar.jsx` | build exit 0 |
| D.2 | Teruskan kelompok ke Kelengkapan (deep-link + prefill) | `DokumenKelengkapanPage.jsx` | build exit 0 |
| E.1 | Regresi: 15 pola anti-hardcode = 0; blue-only file disentuh = 0; diff warisan kosong | — | semua grep 0 / diff kosong |
| E.2 | `npm run build` exit 0 + STATE.MD + BUILD-REPORT | — | exit 0 + dokumen |

Jalur kritis: A → B → C → D → E. Komit per bagian (4 komit: A, B, C, D+E).

## 2. File disentuh (1 baru + 5 ubah, 0 dependency baru)

- BARU: `spj-frontend/src/utils/bkuKategori.js` (≤200 baris; 6 fungsi: REKENING_KE_MENU, kategoriDariRekening, gabungKonsumsi, kelompokATK, pejabatPada, prefillDariBKU + IO koreksi/flag via storageHelper).
- UBAH: `BKUPage.jsx` (A.2, D.1) · `BKUSidebar.jsx` (B.1, B.2, D.1) · `DokumenSPJPage.jsx` (B.3, C.2) · `PejabatSekolahPage.jsx` (C.2) · `DokumenKelengkapanPage.jsx` (D.2).
- DILARANG (pack): `blocks/*`, `templateConfig.js`, `TemplateEngine.jsx`, `sekolahData.js`, `signatureRoles.js`, file Sprint 003.

## 3. Pilihan file pejabat: `PejabatSekolahPage.jsx` (hanya 1)

- Alasan: pemilik state pejabat (`mergePejabat` + tulis `spj_data_sekolah.pejabat`, baris 33/43/63) adalah file ini. `DataSekolahPage.jsx` = identitas + logo + gugus, bukan editor pejabat.
- Riwayat multi-periode = ekstensi editor pejabat (tambah periode per peran + tanggal berlaku), bukan ekstensi identitas sekolah. `DokumenSPJPage.jsx` hanya konsumen (`pejabatPada` + kunci snapshot saat dokumen dibuat).

## 4. Usulan peta `REKENING_KE_MENU` (keputusan final saat approval)

| Prefix (longest-match) | Menu tujuan | Sumber |
|---|---|---|
| `5.1.02.02.01.0013` + `…0061` (honor GTT/perpus; 0061 = honor perpus) | `dokumen-lpj` → `honor` | kodeReferensi :187-188 + TEMPLATE_MAP |
| `5.1.02.04.01` (perjalanan; `…0003` dalam kota) | `dokumen-lpj` → `perjalanan_dinas` | kodeReferensi :190 |
| `5.1.02.01.01.0052` + `…0055` (mamin rapat/kegiatan) | `dokumen-lpj` → `mamin` | kodeReferensi :191/:197 |
| `5.1.02.01.01.0024` (ATK) | `dokumen-kelengkapan` (grup ATK) | kodeReferensi :192 |
| `5.1.02.01.01.0025` (cetak) | `dokumen-lpj` → `pemeliharaan` (pola cetak/penggandaan) | kodeReferensi :193 |
| `5.1.02.02.01.0063` (pulsa/internet) | `dokumen-lpj` → `pemeliharaan` (pola pulsa) | kodeReferensi :189 |
| `5.1.02.02.12.0001` + `…0037` (pajak) | tak-terpetakan → koreksi manual (bukan belanja LPJ) | kodeReferensi :195-196 |
| else / kosong | `Belum dipetakan` (jujur, dropdown koreksi → `spj_bku_koreksi`) | REQUIREMENTS batasan |

Normalisasi: `String(kode).trim().replace(/[\s.]+/g,'.')` + upperfold sebelum match; prefix tersimpan tanpa titik untuk compare cepat via Map terurut panjang desc.

## 5. Temuan dry run vs kode nyata (divergensi reported, bukan silent)

1. `templateDetector.js` SUDAH ADA (`TEMPLATE_MAP` 5 pola, `detectTemplate`) + `BKUSidebar` pakai `detectTemplate` (:93) + `KATEGORI_LABELS` keyword (HONOR/LISTRIK/ATK/MAMIN/CETAK/INTERNET/PERPUS). Sprint 004 = rekening-based. Rencana: `bkuKategori.js` jadi satu-satunya sumber kategori (extend pola detector → pindah ke peta baru); `KATEGORI_LABELS` dipakai hanya sebagai label/badge (tidak dua sumber kebenaran). `templateDetector.js` TIDAK diubah (warisan, read-only import bila perlu).
2. `BKUSidebar onOpenMamin` kini stub toast (`BKUPage.jsx:649-651`). B.2 mengganti stub dengan deep-link nyata per kategori (Mamin → `dokumen-lpj/mamin`; ATK → `dokumen-kelengkapan`).
3. `DokumenSPJPage.jsx` BELUM punya listener prefill (`location.state`/query = 0 hit). B.3 tambah: baca `location.state.prefill` sekali saat mount menu tujuan → isi field kosong + badge + tombol undo (snapshot pra-prefill di state lokal, bukan storage).
4. `DokumenKelengkapanPage.jsx` punya toggle SIPLAH boolean global (:234, :294-309), bukan flag per kelompok. D.1/D.2 tambah flag per kelompok (`spj_atk_flag {no_bku}`) + teruskan kelompok via `location.state`; toggle global TIDAK diubah perilakunya.
5. Menu IDs nyata (`DokumenSPJPage.jsx:26-65`): `honor` (guru/tendik/perpus/penjaga), `perjalanan_dinas` (rapat/koordinasi/bank/pendamping), `mamin` (rapat/kegiatan). Deep-link B.2 pakai IDs ini (bukan templateIds).
6. Parser JOINS: `bkuParser.js` kolom I = `noBukti` (BBU/BNU/BPU), F = `kodeRekening` (nullable), D = `kodeKegiatan`, K = `uraian`, N/Q = penerimaan/pengeluaran — cocok dengan kontrak REQUIREMENTS §Sumber Data. Baris non-belanja (BBU01 BOSP, BPU pajak, saldo) = kandidat "Belum dipetakan" + filter (bukan bug).

## 6. Risiko + mitigasi

| Risiko | Mitigasi |
|---|---|
| `bkuKategori.js` > 200 baris (6 fungsi + IO) | Pecah saat >180: pure-map ke `bkuKategori.js`, grup/merge ke `bkuMerge.js` (lapor dulu sebelum pecah — divergensi) |
| Dua sumber kategori (detector lama vs peta baru) | Peta baru otoritatif; detector tidak diubah; badge lama reuse label saja |
| Prefill timpa ketikan user | Guard per-field (hanya `''/null/undefined`); toast + undo snapshot; E-2 uji penuh |
| `no_bukti` kosong/duplikat (BPU/BBU internal) | Nomor kosong = kelompok sendiri; grup ATK hanya untuk baris belanja (pengeluaran>0, bukan BPU/saldo) |
| Dokumen lama berubah saat tambah periode pejabat | Kunci snapshot pejabat di `spj_dokumen_lpj` saat dibuat; C.3 uji 2 periode |
| Storage key tabrakan | Baru: `bku_koreksi`, `pejabat_riwayat`, `atk_flag` (via storageHelper → prefix `spj_` otomatis) |

## 7. Data uji (6 baris sintetis bila BKU asli tak ada)

1. honor GTT (`5.1.02.02.01.0013`, BNU10) · 2. mamin rapat (`…0052`, BNU11) · 3-4. snack (`…0055`, BNU12) + makan (`…0052`, BNU12, kegiatan sama) = AND-cocok → 1 dokumen · 5. perjalanan (`5.1.02.04.01.0003`, BNU13) · 6. ATK 2 baris (`…0024`, BNU14 se-nomor) + 1 baris tanpa rekening (E-1).

## 8. Perintah DoD per task (tempel output saat build)

```bash
cd D:\project\spj-app\spj-frontend && npm run build
# grep per task:
Select-String -Path "spj-frontend\src\utils\bkuKategori.js" -Pattern "5\.1\.02\.02\.01|5\.1\.02\.01\.01\.0052|5\.1\.02\.04\.01|5\.1\.02\.01\.01\.0024"
Select-String -Path "spj-frontend\src\pages\dashboard\BKUPage.jsx" -Pattern "kategoriDariRekening|Belum dipetakan"
Select-String -Path "spj-frontend\src\components\bku\BKUSidebar.jsx" -Pattern "dokumen-lpj|dokumen-kelengkapan"
Select-String -Path "spj-frontend\src" -Pattern "prefillDariBKU|pejabatPada|spj_pejabat_riwayat|gabungKonsumsi|kelompokATK|spj_atk_flag" -Recurse
# gate akhir E.1:
grep -rniE "BADRUDDIN|WAHYUDIN|197405082014121002|Pasirhalang|PEMERINTAH KABUPATEN" spj-frontend/src/utils/bkuKategori.js spj-frontend/src/pages/dashboard/BKUPage.jsx spj-frontend/src/components/bku/BKUSidebar.jsx
git diff HEAD --stat -- spj-frontend/src/components/templates/blocks/ spj-frontend/src/data/templateConfig.js spj-frontend/src/components/guide/ spj-frontend/src/data/guideConfig.js spj-frontend/src/components/templates/SummaryCard.jsx
```

## 9. Pertanyaan persetujuan (jawab sebelum coding)

1. Peta §4 OK? (khusus `0061` → honor, `0025/0063` → pemeliharaan, pajak → tak-terpetakan)
2. File pejabat = `PejabatSekolahPage.jsx` OK?
3. Pecah `bkuMerge.js` bila >200 baris: setuju otomatis atau lapor dulu?

⏸️ BERHENTI — tunggu persetujuan eksplisit user.
