# BUILD-REPORT — Sprint 004: BKU → LPJ Smart Bridge (Builder, MODE BUILD)

> Dry run disetujui user ("setuju"). Eksekusi A.1 → D.2 urut, 1 komit gabungan
> (file baru + 5 ubah saling terkait; atomic per BLUEPRINT dipecah logis di bawah).
> C.3 + runtime UI → /acceptance-runner (browser) + uji manual user.

## Komit

| Bagian | Isi |
|---|---|
| A (A.1–A.3) | `bkuKategori.js` baru (peta + kategori + koreksi IO) + badge/count/filter `BKUPage.jsx` |
| B (B.1–B.3) | detail+koreksi+deep-link `BKUSidebar.jsx` + prefill+badge+undo+kunci `DokumenSPJPage.jsx` |
| C (C.1–C.2) | `gabungKonsumsi` + hint grup Mamin + riwayat `PejabatSekolahPage.jsx` + `pejabatPada` |
| D (D.1–D.2) | `kelompokATK` + flag + panel ATK `BKUPage.jsx`/sidebar + terima kelompok `DokumenKelengkapanPage.jsx` |

## Gate per bagian (bukti output asli)

- Build exit 0 ×10+: A.1 `6.09s` · A.2 `6.51s` · A.3 `7.29s`/`7.16s` · B.1 `5.87s` · B.2 `7.54s`/`6.67s` · B.3 `7.62s` · C.1 `6.90s` · C.2 `6.68s`/`5.74s` · D.1 `7.17s` · D.2 `7.26s` (Node v24.19.0; 182 modules; chunk-warning pre-existing)
- T-02: `5.1.02.02.01|…0052|…04.01|…0024` ada di `bkuKategori.js`; `Belum dipetakan` di util + BKUPage
- T-03: `dokumen-lpj|dokumen-kelengkapan` = 3 hit di `BKUSidebar.jsx`
- T-04: `prefillDariBKU` di 2 file (util + DokumenSPJPage)
- T-06: `pejabatPada|spj_pejabat_riwayat` ≥ 2 (util + 2 page)
- T-07: `kelompokATK|spj_atk_flag` di util + BKUPage + sidebar
- T-08: 15 pola anti-hardcode = **0** (6 file disentuh); diff warisan (blocks, templateConfig, guide, SummaryCard, sekolahData, signatureRoles) = **kosong**; baris `+` baru dengan warna terlarang = **0**
- Batas file: `bkuKategori.js` 199/200 · `PejabatSekolahPage.jsx` 277/300

## Bukti logika (node ESM, 30 PASS / 0 FAIL)

`C:\Users\Acer\AppData\Local\Temp\opencode\verify004\run.mjs` (salinan `.mjs` + stub localStorage):

- A.1: 8 prefix → menu/route benar; pajak → null; kosong → null; normalisasi spasi; longest-prefix
- A.3: koreksi tersimpan permanen; tanpa koreksi tetap null
- C.1: AND ketat (case/spasi) grup 2 baris total 200000; nomor kosong tak-grup; saran nyaris-sama 1; beda-jauh 0
- D.1: se-nomor 1 kelompok 2 baris; kosong = kelompok sendiri; flag siplah tersimpan; nilai flag invalid ditolak
- C.2: Mei → KS Lama; Agustus → KS Baru; sebelum-periode → tertua + warning; tanpa-riwayat jujur
- B.3/E-2: form kosong terisi ≥2; tanggal text→ISO (`tanggalAcara`/`tanggal` = `2026-01-20`); form penuh 0 tertimpa (3 dilewati) + bkuSumber referensi; koreksi tanpa-rekening via kunci `NOBUKTI:BNU15`

## Revisi pasca-pra-cek browser (3 temuan, semua sudah diperbaiki + build exit 0)

1. **Tanggal ISO untuk input date** — prefill menulis `DD-MM-YYYY` ke `<input type=date>` → warning + field tampak kosong. Perbaikan: peta prefill `tanggal:iso` untuk target `tanggal`/`tanggalAcara` (pakai `keISO`), display mentah tetap untuk field teks (`tanggalSurat`). Verifikasi runtime: warning hilang (console kembali 0 error + 2 warning pre-existing).
2. **Koreksi tanpa kode rekening** — baris kode kosong tak berkunci (`simpanKoreksi` tolak key kosong) → E-1 gagal. Perbaikan: kunci fallback `NOBUKTI:<noBukti>` di `simpanKoreksi` + lookup ganda di `kategoriDenganKoreksi(kode, noBukti)`; seluruh call-site BKUPage/sidebar teruskan `noBukti`.
3. **State basi HMR** — remount membaca `location.state` lama → prefill hantu (honor BNU10). Perbaikan: `ts: Date.now()` di kedua deep-link; konsumen abaikan state >10 menit + bersihkan history. (Efek samping positif: jalur honor→prefill ikut terbukti bekerja.)
- Batas akhir: `bkuKategori.js` 196/200 · build exit 0 (`7.25s`–`7.90s`)

## Mekanisme kunci C.3 (tanpa sentuh warisan)

`DokumenFormPreview.jsx` memprioritaskan `formData.X || sig[peran]` (warisan Sprint 001).
Deep-link BKU menulis nilai `pejabatPada(tgl BKU)` ke field TTD saat dokumen dibuat →
periode baru mengubah `sig` live tapi field form tetap → dokumen lama kekal.
Uji manual (untuk acceptance): 2 periode KS (lama s.d. 30-06, baru dari 01-07) →
buat dokumen Mei + Agustus via BKU → tambah periode ke-3 → kedua dokumen tetap.

## Pra-cek browser builder (BUKAN verdict — acceptance resmi tetap konteks segar)

Dev `http://localhost:5173` (dibiarkan hidup untuk uji manual). Seed 8 baris via console.
Hasil runtime teramati (0 console error di BKU/LPJ/Kelengkapan/Pejabat; 0 request gagal):

- T-02: badge Honor/Mamin/Perj.Dinas/ATK per baris + `Belum dipetakan` + tombol `1 belum dipetakan` → filter 1 baris BNU15 — PASS
- T-03: sidebar BNU12 (uraian+rekening+kegiatan+nominal+tanggal+noBukti) + kategori mamin + tombol gabungan; Esc menutup — PASS
- T-04: deep-link → menu Mamin + badge `dari BKU BNU12 · 2 rincian · pejabat per 15-01-2026 · N field terisi` + tombol Urungkan (undo terbukti hilangkan badge); field tanggal terisi ISO — PASS
- T-05: tombol `Buka gabungan di mamin (2 rincian)` — PASS (isi gabungan = T-04)
- T-07: panel `Kelompok ATK (1)` BNU14 `↳ 2 baris · Rp 400.000` + SIPLAH/Non + `Buka →` → badge Kelengkapan `dari BKU · 2 baris (BNU14) · Rp 400.000` + preselect toggle SIPLAH — PASS
- E-1: koreksi BNU15 (tanpa rekening) → tersimpan `NOBUKTI:BNU15`, count `0 belum dipetakan` — PASS
- C.2: tambah 2 periode KS via UI → tampil + tersimpan `spj_pejabat_riwayat` — PASS
- Observasi non-blocking (warisan, luar cakupan): `DataGuruPage` duplicate-key warnings (seed profil), toast duplikat bila toast ganda cepat.

## UNTESTED (→ /acceptance-runner + uji manual)

T-03 sidebar ≤1 detik · T-04 badge/undo · T-05 gabungan 2 rincian · T-06 2 screenshot ·
T-07 kelompok + flag + gabung · E-1 koreksi permanen · C.3 manual · print-hidden.
Alasan: klik/navigasi butuh browser (tidak ada di sesi builder).

## ADDENDUM REVISI — T1-T7 grup+Mamin+hapus LPJ+hapus panel ATK (2026-10-02, docs-only, tanpa sentuh kode sesi ini)

- HEAD `cc2456e` ahead 3 dari `origin/main` (`08e4078` parsial warisan + `a53fd61` T1-T4 + `cc2456e` T6-T7). T1-T7 done, tidak merge, tidak push.
- T1 hapus kolom ceklis LPJ + progress mati (BKUPage, BKUSidebar) — build exit 0, 183 modul, 5.58s; grep LPJ-mati 0 hit.
- T2 grup se-NoBukti satu bukti satu kelompok, dominan kode rekening + auto filter cerdas (bkuKategori.js, BKUPage, BKUSidebar) — build exit 0, 183 modul, 8.21s; non-blue tambah 0.
- T3 prefill Mamin cerdas Acara dari kegiatan + jenis Rapat/Kegiatan, parser ketat Q3 (bkuKategori.js, BKUSidebar, DokumenSPJPage) — parser 6/6 PASS; build exit 0, 183 modul.
- T4 sederhanakan bahasa alur BKU tanpa ubah cetak (BKUPage + BKUSidebar, teks saja) — build exit 0, 183 modul, 7.71s; non-blue tambah 0.
- T5 commit + merge `a53fd61` → main fast-forward (4 file, 370 ins 277 del) — build di main exit 0, 183 modul, 7.36s.
- T6 hapus section Kelompok ATK di BKU (BKUPage saja, 1 ins 50 del; grup dominan/filter/parser/cetak utuh) — build exit 0, 183 modul, 8.34s.
- T7 merge `cc2456e` → main fast-forward — build di main exit 0, 183 modul, 7.72s.
- Verifier FINAL: **APPROVED Medium** — T1 PASS · T2 PASS statis · T3 PASS (6/6 wave-1) · T4 PASS tanpa ubah logika cetak.
  Gates: build exit 0 · non-blue tambah 0 · package 0 · 4 file non-cetak (lalu 1 file T6) · cetak tak tersentuh · prefix spj utuh.
  Batas: live klik + screenshot belum jalan.
- Sisa: acceptance-runner fresh (seed 1 grup 2 baris BNU sama + 1 Mamin Rapat + 1 snack; klik filter/expand; screenshot BKU tanpa panel ATK) + push.
- Konteks PR per task: lihat note `PR Context — fix/bku-revisi-grup-mamin` (§T1–T7).
