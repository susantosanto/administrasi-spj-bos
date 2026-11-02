# DRY RUN REPORT — Sprint 002: Rework Modul Perjalanan Dinas

> Builder: ZCode (ai-coding-coach MODE DRY RUN) · Tanggal: 2026-09-19
> Status: **DISETUJUI USER 2026-09-19** — "saya setujui semua nya" (D-1, D-2, D-3 + lampu hijau coding).
> MODE BUILD aktif. Laporan ini = acuan eksekusi; BLUEPRINT.MD tetap kontrak, laporan ini menambahkan koreksi dry run yang disetujui.

## 1. Verifikasi Prasyarat (HANDOFF langkah 0) — LULUS

| Check | Hasil |
|---|---|
| `getSignatureRoles()` ada | ✅ `utils/signatureRoles.js:36` |
| `utils/pejabatRoles.js` + `blocks/PeringatanData.jsx` ada | ✅ keduanya |
| Grep anti-hardcode (BADRUDDIN/WAHYUDIN/DEWI ERMIRAWATI/DEDE GUNAWAN/Yuniarti/SD NEGERI LEBAKLEUNGSIR) | ✅ 0 baris |
| `npm run build` baseline | ✅ `✓ built in 16.81s`, exit 0 |

## 2. Temuan Dry Run (diukur terhadap kode pasca-Sprint 001)

| # | Temuan | Keputusan user |
|---|---|---|
| D-1 ⚠️ | Gate T-02 (`grep -rn "surat_tugas" src` = 0) mustahil lulus: `utils/templateSuratHelper.js:21-22,234` memuat `surat_tugas` milik fitur LAIN ("Template Surat Cerdas", konsumen `TemplateSuratPage.jsx` rute `template-surat`, App.jsx:65 — fitur aktif, bukan modul Perjalanan Dinas) | **Setuju** — rescope gate: kecualikan `templateSuratHelper.js`; pertanyaan masa depan fitur itu → QUESTIONS.MD |
| D-2 | Placeholder nama orang riil `RISNA MARSELA HARTINI` di `SPDForm.jsx:65` **tercetak** `[ RISNA MARSELA HARTINI ]` saat print + nama kosong (val() print memakai `ph`); `SuratTugas.jsx:76` sama (F() print pakai label — tidak tercetak, tapi konsisten diganti) | **Setuju** — ganti label generik |
| D-3 | Gate T-04 hanya grep `<input`; blok cetak juga merender `<textarea>` (SuratUndangan:120, 225) | **Setuju** — T-04 diperluas `<input\|<textarea` = 0 |
| D-4 | `surat_tugas` di DokumenFormPreview ada di **6 baris** (189, 198-199, 522, 1826-1827), bukan hanya TRANSPORT_FORM_TABS | Preskripsi diperluas: baris 198-199 ikut dibersihkan |
| D-5 | Hapus tab `surat_tugas` menghapus satu-satunya editor `sptNip`/`sptPangkat` (dipakai buildSptData 1633-1634 untuk cetak MENUGASKAN) | FASE 2.1 wajib menambah pemilih penerima + field itu ke form SPT |
| D-6 | `spj_dokumen_lpj` tidak pernah ditulis kode mana pun (3 pembaca saja: DokumenSPJPage:140, dataContextBuilder:232, queryEngine:52) | Task 5.1 = menambah fungsi reset (clear `dokumen_lpj` via storageHelper, tanpa sentuh `spj_data_sekolah`) |

## 3. Angka Terukur (2026-09-19, pasca-Sprint 001)

- `DokumenFormPreview.jsx` **1884** baris (pack asumsi 1847) · `templateConfig.js` 993 · `SuratTugas.jsx` 115 · `SPDForm.jsx` 196 · `SuratUndangan.jsx` 240 · `DokumenSPJPage.jsx` 695
- `surat_tugas`: **11 hit / 3 file** (DokumenFormPreview 6, templateConfig 2, templateSuratHelper 3)
- `<input>` di 3 blok: **10** (SPDForm 1 · SuratTugas 1 · SuratUndangan 8) + 2 `<textarea>` (SuratUndangan)
- Branch `mode === 'edit'` di 3 blok = **dead code** — semua render transport memakai `mode="print"` (DokumenFormPreview 1674, 1815, 1820, 1838, 1847, 1862-1873)
- 3 substansial Sprint 001 yang wajib dipertahankan (posisi kini): `<PeringatanData />` DokumenFormPreview:1757 + TemplateEngine:82 · auto-fill `sig = getSignatureRoles()` 1623-1711 · feed KopGugus prop-driven 1695-1713
- Kalimat legal docx sudah diekstrak verbatim (Telah diperiksa… / Catatan Lain-Lain / PERHATIAN : …) — siap dipakai 4.2-4.4

## 4. Rencana Per Fase (koreksi dry run terintegrasi)

- **FASE 1** (1.1-1.4): hapus baris 189 + bersihkan 198-199 + hapus blok form 521-555 + blok preview 1826-1828 + hapus config `surat_tugas` (templateConfig 332-358). `type: 'surat-tugas'` (hyphen) + BLOCK_RENDERERS TETAP (blok dipakai tab spt). Gate: grep rescoped = 0 + build.
- **FASE 2** (2.1-2.6): SPT form di-restrukturisasi urutan docx (nomor → penandatangan → MENUGASKAN per-penerima: Nama/NIP/Pangkat/Jabatan → Untuk → Hari/Tanggal/Tempat → Mengetahui); field tanpa padanan docx (sifatSpt, lampiranSpt, perihalSpt, isiSpt, alamatSpt, pukulSpt, tanggalAcaraSpt) dihapus dari form SPT setelah diverifikasi 0 konsumen cetak. SPPD: tambah section 8 Pengikut multi-baris (pengikutRows {nama,tanggalLahir,keterangan}). Undangan: penutup 1&2 + tembusanItems multi-baris + sifat default `'-'`.
- **FASE 3** (3.1-3.4): hapus semua cabang `<input>`/`<textarea>` mode edit di 3 blok (cetak murni); placeholder D-2 digenerik; T-04 grep `<input\|<textarea` = 0.
- **FASE 4** (4.1-4.9): SPD print — pengikut cells tampil data (kini kosong permanen di print = bug), 3 blok resmi kalimat PERSIS docx, `break-inside-avoid` anti-terpotong; Undangan print — penutup data-driven fallback kalimat resmi, tembusan `<ol list-decimal>`, baris Sifat (default '-'); SPT — verifikasi struktur TTD 2 kolom sudah sesuai docx; 4.9 orientasi portrait ×3 terverifikasi (templateConfig 312/340→hapus/368, sppd portrait).
- **FASE 5** (5.1-5.4): reset `dokumen_lpj` (tombol + confirm, tanpa sentuh `spj_data_sekolah`) · regresi 6 konsumen statik · gate akhir (build + T-02 rescoped + T-04 diperluas + T-10 + smoke) · update ACCEPTANCE/DECISIONS/QUESTIONS/STATE.

## 5. Urutan Commit (Conventional Commits, bahasa Indonesia)

1. `fix:` nama_sekolah DokumentasiAIGenerate (perubahan pra-sprint, terpisah)
2. `feat:` FASE 1 · 3. `feat:` FASE 2 · 4. `feat:` FASE 3 · 5. `feat:` FASE 4 · 6. `feat:` FASE 5 + `docs:` dokumen
Push = kewenangan user (aturan STATE.MD).

## 6. RE-VERIFIKASI POST-EKSEKUSI (2026-09-19, ai-coding-coach MODE DRY RUN)

> Diukur ulang independen terhadap kode aktual @ HEAD `c5872d8` (bukan klaim ACCEPTANCE).
> Semua gate statik + build dijalankan ulang dari nol.

| Gate | Perintah | Hasil ukur ulang | Verdict |
|---|---|---|---|
| T-01 build | `npm run build` | `✓ built in 6.79s`, `BUILD_EXIT: 0` | ✅ LULUS |
| T-02 rescoped | `grep surat_tugas` luar templateSuratHelper | 0 hasil (3 sisa hanya di `templateSuratHelper.js:21,22,234` = fitur lain, D-1) | ✅ LULUS |
| T-04 (D-3) | `grep <input\|<textarea` 3 blok | 0 hasil | ✅ LULUS |
| D-2 | `grep RISNA MARSELA` | 0 hasil | ✅ LULUS |
| T-05 | 4 string legal SPD | masing-masing 1 hit, di jalur render JSX (SPDForm:180-187) + `break-inside-avoid-page` (4.5) | ✅ LULUS |
| T-07/C-06 | TTD Undangan | `SuratUndangan.jsx:126-127` = `data.namaKetuaGugus/nipKetuaGugus`, feed `sig['ketua-gugus']` (DokumenFormPreview:1737-1738) — Ketua Gugus, BUKAN Kepala Sekolah | ✅ LULUS |
| T-08 | orientasi | `spt`(312) · parent `spd-form`(284) · `undangan_gugus`(340) semua `portrait`; CSS `@page size:A4` + 210/297mm (index.css:391-437) | ✅ LULUS |
| T-09 | reset | `handleResetDokumenLpj` → `storageHelper.remove('dokumen_lpj')` + confirm; `spj_data_sekolah` tidak disentuh; tombol slate/primary (DokumenSPJPage:150,689) | ✅ LULUS (statik; localStorage runtime menunggu runner) |
| T-11 | 15 pola + konsumen | 15 pola anti-hardcode = 0 hit; 6 konsumen Sprint 001 TIDAK ada di `git diff 264c431..HEAD` (7 file tersentuh, semuanya wilayah 002 + DokumentasiAIGenerate=fix c955019) | ✅ LULUS |
| D-4/D-5 | form SPT | field per-penerima `sptNip/sptPangkat/sptJabatan` + `updateRow` (536-538); auto-sync SPPD pakai `...prev` (281-284); field mati (sifatSpt/isiSpt/alamatSpt/pukulSpt/tanggalAcaraSpt/perihalSpt/lampiranSpt) = 0 konsumen | ✅ LULUS |
| Budget | `wc -l` | SuratTugas 105 · SPDForm 195 · SuratUndangan 147 (≤300 ✅); DokumenFormPreview 1914 · templateConfig 966 (legacy, di luar cakupan pemecahan) | ✅ LULUS |

### Temuan re-verifikasi

| # | Temuan | Severity | Rekomendasi |
|---|---|---|---|
| R-1 | **ACCEPTANCE C-09 tidak akurat**: klaim "DokumenSPJPage sisa `amber`×10 = pil status" tetapi TIDAK menyebut **4 `emerald`** (baris 362, 368, 425, 464 = ✓ complete marker + pulse dot). Gate FASE 5 asli hanya grep `amber` di file itu, `emerald` tidak pernah dicek. | RENDAH (dokumen) | `emerald` **pre-existing** (bukan ditambah Sprint 002 — `git diff` konfirmasi 0 emerald/amber baru) & murni indikator status layar → **pengecualian sah AGENTS.MD**. KODE aman; hanya **teks bukti C-09 perlu dikoreksi** agar menyebut emerald juga (jujur-lengkap). |

**Verdict re-verifikasi: 11/11 gate statik + build LULUS. 0 cacat kode. 1 cacat dokumentasi (R-1, rendah).**
UI runtime (T-03 pemetaan field↔docx, T-05/T-06/T-07/T-08 screenshot, T-09 localStorage, T-11 render 12 kombinasi, E-1/E-2) **tetap belum terbukti** — wajib `/acceptance-runner` konteks segar.

