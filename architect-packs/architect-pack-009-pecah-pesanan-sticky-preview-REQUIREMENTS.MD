# REQUIREMENTS — Sprint 009: Pecah Surat Pesanan 2 Dokumen + Sticky Panel Preview (DOCS-ONLY pack)

> **Dokumen 1 dari 4** Architect Pack (Bab 8.4 — apa dan mengapa saja, tanpa "bagaimana").
> Konfirmasi dari: handoff task 32 (note 16d8220e-daeb-4dff-8742-3543fb9f296f, recon 04:04Z 2026-10-06) + pack Sprint 008 (planning/sprints/sprint-008/) + templateConfig.js `pesanan_mamin` + utils/aturanMamin.js `bangunPesananDuaSeksi/MENU_PESANAN` + PanelPreviewDocument.jsx + previewDocs.js `maminDocs()` + DokumenFormPreview.jsx print-area + CONSTITUTION.md + AGENTS.MD.
> Sifat: pack DOCS-ONLY dulu; coding SETELAH pack disetujui (dry-run-first, TUNGGU setuju). Tanpa ubah src di pack ini.

## Tujuan (satu goal — Bab 10.3)

Operator mengisi form pesanan SEKALI (input tetap) lalu melihat, memeriksa, dan MENCETAK Surat Pesanan sebagai DUA dokumen formal terpisah — Surat 1 Nasi Box + Surat 2 Snack Box — yang tampil berurutan di preview dan tercetak sebagai 2 halaman/surat, sementara Panel Preview Document tetap terlihat (sticky) saat form panjang di-scroll — tanpa mengubah hasil cetak dokumen lain dan tanpa menambah library.

## Pengguna

- Operator sekolah (1-2 orang, tidak teknis) — isi form pesanan sekali + cek 2 surat + cetak
- KS — penandatangan basah di spasi kosong SignatureFooter kedua surat (bukan TTD digital)

## Sumber Data (as-is, tidak diubah)

- State existing (reuse, tanpa schema baru): `formData.pesananRows[].seksi` ('Nasi Box'/'Snack Box'/kustom), toggle `formData.seksiPesanan` ({nasi, snack}), builder `bangunPesananDuaSeksi({jumlah, satuan})` + `MENU_PESANAN` (Nasi 6 + Snack 4) di utils/aturanMamin.js, template `templatePesananMamin()` (perihal SELALU 'Surat Pesanan')
- Template tunggal reuse 2x: `TEMPLATE_CONFIGS.pesanan_mamin` (portrait, blocks kop-surat/header/table-letter-header/uraian-kegiatan/table-dinamis/table-fields/signature) — TIDAK diduplikasi config, TIDAK diubah
- Render existing (3 titik yang dipecah): DokumenFormPreview.jsx renderPreview `.sk-print-area` (1x TemplateEngine pesanan_mamin all-rows, DokumenFormPreview.jsx:1857) + SummaryCard "Surat Pesanan" 1 kartu + previewDocs.js `maminDocs()` 1 doc `{key:'pesanan'}` untuk panel
- Panel existing: PanelPreviewDocument.jsx (ScaledPaper A4 210/297mm per orientation, zoom 50-150%/Reset/fullscreen, root print:hidden + @media print display:none) + DokumenSPJPage.jsx split-view grid lg 620px/xl 700px, aside print:hidden, items-start
- Storage: localStorage prefix spj_ via storageHelper (JANGAN ubah); snapshot spj_otomatis_snapshot reuse
- Header surat: TabelLetterHeader.jsx table-fixed colgroup 18/4/33/15/30 + flag rightAlignBottom (hanya undangan_mamin true; pesanan_mamin default false — TETAP false di kedua surat pecahan)

## Keputusan Kunci (final — diputuskan di pack ini, bukan opsi)

1. FASE BERURUTAN WAJIB: FASE A (pecah preview+cetak jadi 2 dokumen) dikerjakan + hijau DULU, baru FASE B (sticky preview). Dilarang paralel/terbalik (B menempel di atas hasil A).
2. NOMOR PER SURAT (diputuskan): SATU input `nomorPesanan` dipakai SAMA di kedua surat (satu paket pesanan, satu nomor dasar). TIDAK ada auto-suffix /A /B (tanpa karangan nomor). Bila sekolah butuh nomor berbeda per surat, operator ubah nomor manual di antara cetak — dicatat sebagai batasan sadar di ACCEPTANCE T-04.
3. PERIHAL PER SURAT (diputuskan): input `perihalPesanan` tetap SATU; tiap surat tampilkan display-only `"{perihal} — Nasi Box"` / `"{perihal} — Snack Box"` (tidak tulis balik ke formData). Label doc panel: "Surat Pesanan — Nasi Box" / "Surat Pesanan — Snack Box". Kegiatan/isi (`isiPesanan||acara`), tanggalSurat, hariPesanan, kop, TTD: SAMA di kedua surat.
4. ROWS PER SURAT (diputuskan): filter strict — Surat Nasi HANYA rows seksi==='Nasi Box', Surat Snack HANYA 'Snack Box'; `no` diulang per surat (1..N). Fallback jujur: rows tanpa seksi/kustom (warisan) ikut di Surat Nasi agar tak hilang (dicatat + diuji T-03). `jenisPesanan` per surat override 'Nasi Box'/'Snack Box' (display); jumlah per surat = jumlah rows seksi itu (fallback ke jumlahPesanan global bila kosong).
5. SAKLAR SEKSI = SAKLAR DOKUMEN: `seksiPesanan.nasi/snack=false` → surat seksi itu DI-SKIP (tidak render kosong) di ketiga titik (SummaryCard preview, print-area, panel). Kedua mati → pesan jujur "Tidak ada seksi aktif" (bukan halaman kosong).
6. FORM INPUT TETAP: editor tambah/ubah/hapus rows + toggle seksi TIDAK berubah (1 form, 2 output). Tidak ada field nomor/perihal kedua, tidak ada tab baru, tidak ada dokumen baru selain pecahan pesanan.
7. STICKY = CSS SAJA (Fase B): panel menempel saat scroll form panjang di desktop (sticky top + offset header, max-h viewport + scroll internal); mobile (<lg) menumpuk + sticky MATI; cetak steril (panel tak ikut cetak, hasil cetak tak berubah 1px pun selain pecahan A).
8. DICORET permanen (warisan 008): TTD digital, tombol KIRIM server, QR di badan surat, warna navy/oranye — DILARANG masuk rekomendasi maupun backlog.

## Fungsi

- F-A1 — PREVIEW LEGACY PECAH (viewMode preview): kartu SummaryCard "Surat Pesanan" 1 → 2 kartu ("Surat Pesanan — Nasi Box" N item + "Surat Pesanan — Snack Box" M item); seksi mati/kosong → kartu di-skip/pesan jujur.
- F-A2 — AREA CETAK PECAH (sk-print-area): 1x `.sk-doc-print` pesanan → 2x `.sk-doc-print` berurutan (Nasi dulu, Snack kedua), masing-masing TemplateEngine pesanan_mamin + data terfilter + perihal suffix + no ulang; tiap surat ganti halaman (anti-terpotong, pola existing).
- F-A3 — PANEL PECAH (previewDocs maminDocs): 1 doc `pesanan` → 2 docs (`pesanan-nasi`, `pesanan-snack`), data mirror 1:1 area cetak (panel = render ulang yang SAMA via TemplateEngine mode=print); skip seksi mati; fallback warisan ikut Nasi.
- F-B1 — STICKY PANEL (desktop): Panel Preview Document sticky (top offset header) + max-h viewport + scroll internal sendiri; form kiri scroll bebas; tidak ubah DOM cetak, tidak ubah builder data.
- F-B2 — MOBILE + CETAK STERIL: <lg panel ikut alur (tidak sticky, di bawah form); saat print panel display:none (existing dipertahankan + diverifikasi).

## Batasan

- 0 dependency baru; BLUE-ONLY #004ac6 + slate (navy/oranye/emerald/amber/rose/violet/cyan DILARANG; badge sinyal layar-only teks+ikon pengecualian sah, tak ikut cetak)
- Kertas A4 wajib, satuan mm, orientasi via templateConfig.js orientation (DILARANG ubah; kedua surat portrait ikut config existing)
- localStorage prefix spj_ via storageHelper (JANGAN ubah)
- DILARANG ubah dokumen formal selain pecahan pesanan: blocks/*, TemplateEngine.jsx, templateConfig.js, dokumen mamin lain (undangan/notulen/hadir/bukutamu), dokumen honor/transport/upah — diff cetak selain 2x sk-doc-print pesanan = FAIL
- DILARANG: TTD digital, KIRIM server, QR, lib baru, ubah cetak lain (lihat Keputusan Kunci 8)
- Offline penuh (tanpa fetch/AI key/network saat preview+cetak)
- Aksesibilitas wajib: section/h2 per surat pecahan ("Surat Pesanan — Nasi Box/Snack Box"); kontrol tetap keyboard-operable; focus-visible jelas; hormati prefers-reduced-motion; target sentuh min 44px
- Batas file: Component max 300 baris, Utility max 200 baris, Config max 150 baris (Constitution); HANDOFF wajib dry-run-first + TUNGGU persetujuan; JANGAN commit/push (kuasa user)
