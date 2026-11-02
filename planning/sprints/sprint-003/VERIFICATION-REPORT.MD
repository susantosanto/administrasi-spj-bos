# VERIFICATION-REPORT — Sprint 003 (fresh context, 2026-10-01)

> Verifier = sesi segar (bukan penulis kode) — Bab 12 fresh-context review.
> Iron Law: tanpa perintah fresh di sesi ini = bukan bukti.
> Browser: Playwright MCP (login user/pw bebas → dashboard OK) hingga backend
> mati di tengah sesi; Pencil fallback gagal konek. Item runtime yang sempat
> terekam = PASS ber-screenshot; sisanya UNTESTED jujur (bukan FAIL).

## Ringkasan perintah (semua fresh sesi ini, root `D:\project\spj-app`)

| # | Kriteria | Perintah | Hasil | Bukti |
|---|----------|----------|-------|-------|
| T-01 | Build sukses | `npm run build` (spj-frontend) + `node -v` | PASS | `EXIT=0`, `✓ built in 7.31s` (run-2; run-1 `19.16s`), Node v24.19.0 |
| T-02 | Rename "Lihat Ringkasan" | grep `Preview Dokumen` DokumenFormPreview + grep `Lihat Ringkasan` src + klik runtime | PASS | grep-1 = **0**; grep-2 = 1 tombol (:1346) + 4 guideConfig; tombol tampil di browser (`list_alt Lihat Ringkasan` e248) |
| T-03 | Layar bebas kop & TTD | grep `renderPerRecipient` + grep `KopSurat\|SignatureFooter` + runtime preview | PASS | `renderPerRecipient` = **0**; Kop/Sig hanya komentar D-8 (:1754); runtime preview = kartu `Ringkasan — Rapat` label+nilai (screenshot) |
| T-04 | Cetak 5-doc transport | klik Cetak Semua → inspeksi `.sk-print-area` | UNTESTED (parsial) | Struktur kode = 5-doc urut (:2058-2080: penerima→undangan→tRows×SPT→tRows×SPPD→resume); teramati 3 doc (penerima, undangan, NOTULA) karena **0 penerima** (SPT/SPPD per-row absen = benar); 5-doc penuh dgn penerima ≥1 BELUM teramati (browser mati stlh seed, sblm pilih penerima) |
| T-05 | Cetak formal meski layar ringkasan | banding layar vs print-area | UNTESTED (parsial) | Layar = kartu tanpa kop/TTD ✓; print-area = struktur formal (kop border + teks TTD `Mengetahui/Menyetujui…Kepala Sekolah,Bendahara BOS`) ✓; isi kop kosong karena tanpa Data Sekolah (= konsisten E-1); side-by-side dgn data terisi BELUM |
| T-06 | Set cetak Mamin lengkap | baca kode print-area Mamin | UNTESTED (statik OK) | Kode = 5-doc `undangan_mamin→pesanan_mamin→notulen→daftar_hadir→buku_tamu(conditional)` (:1572-1605) = persis usulan pemetaan; runtime print preview BELUM |
| T-07 | Penerima semua status | grep `getSemuaPegawai` + seed PNS/PPPK/Honorer → buka picker | UNTESTED (statik OK) | 2 cabang (:95 transport, :99 mamin/pemeliharaan); cabang honor tetap `getGuruHonorer/getTendikHonorer` (:80-84); seed `spj_data_guru` PNS+PPPK+Honorer + tendik SUKSES (`SEEDED:254`) tapi picker BELUM dibuka (browser mati) |
| T-08a | Auto-open tiap masuk menu | klik kartu Perjalanan Dinas | PASS | Popover auto-terbuka: `dialog "Panduan Perjalanan Dinas"` + pill `? Panduan 0/6 [expanded]` (snapshot) |
| T-08h | Klik langkah → jump + tetap buka | klik `Tab SPT` + klik `Klik Lihat Ringkasan` | PASS | Klik SPT → form SPT tampil, dialog TETAP; klik ringkasan → mode preview (`Preview: Perjalanan Dinas — Rapat`, `Kembali ke Form`+`Cetak Semua`), badge 0/6→**1/6**, langkah ✓, dialog TETAP |
| T-08 statik | grep ronde-2 | grep `print:hidden\|contextKey`, `jump:`, `key={selectedCard.id}`, `tabseen`, `onJump` | PASS | `print:hidden`=3 hit (MenuGuide :3,:132 + peringatan-data) + `contextKey`=2; `jump:`=**21**; `key={selectedCard.id}`=1 (:532); `tabseen`=**0**; `onJump` 2 file |
| T-08 b/c/d/e/f/g | trigger/dismiss/pindah-konteks/print | runtime | UNTESTED | Browser mati sebelum uji: (b) trigger selesai-isi, (c) Rapat→Koordinasi selalu-tampil, (d) pindah menu, (e) dismiss permanen, (f) trigger pasca-dismiss, (g) print-hidden saat cetak |
| T-09 | Config-driven revert-test | `git diff --stat` + uji tambah-menu-via-config | UNTESTED | `when` Koordinasi/Bank ada di kode (:42); pill generik `menuId`-driven; revert-test butuh ubah kode = di luar peran read-only verifier |
| T-10 statik | anti-hardcode + blok + warisan | 15-pola grep + `<input` 3 blok + `git diff` warisan | PASS | 15 pola = **0**; `<input\|<textarea` 3 blok = **0**; diff `17a266d~1..HEAD` 6 file warisan = **kosong** |
| T-10 runtime | Honorarium utuh | uji manual kosong & terisi | UNTESTED | Browser mati sebelum buka menu Honorarium |
| E-1 | Form kosong total | storage kosong → Perjalanan Dinas → preview | PASS | Kartu tampil nilai kosong jujur (`—`, `Daftar Penerima (0)`), `PeringatanData` (`Data sekolah belum diisi`) muncul, tanpa crash, console **0 errors** (hanya 2 warning Router future-flag pre-existing), network gagal **0** |
| E-2 | Data parsial | 1 penerima tanpa NIP + pejabat `ks` saja | UNTESTED | Browser mati sebelum uji |
| C-11 | Build (T-01) | — | PASS | EXIT=0 (di atas) |
| C-12 | STATE.MD + pack | grep STATE.MD | PASS | `STATE.MD` sebut Sprint 003 + BUILD-REPORT terfile; pack ACCEPTANCE/BLUEPRINT ronde-2 ada |

## Batas file (CONSTITUTION)

MenuGuide 225/300 · guideConfig 69/150 · SummaryCard 75/300 — semua dalam batas.

## GAPS (correctness only, 8 item — semua runtime, tanpa indikasi bug kode)

1. T-04 penuh: 5-doc dgn penerima ≥1 + kop→TTD tiap doc + A4 tak-terpotong.
2. T-05 penuh: side-by-side layar vs cetak dgn data terisi.
3. T-06 runtime: print preview Mamin = 5-doc pemetaan.
4. T-07 runtime: picker tampil PNS+PPPK+Honorer; Honorarium honorer-only (screenshot 3 lokasi).
5. T-08 runtime b/c/d/e/f/g: trigger selesai-isi (termasuk pasca-dismiss), selalu-tampil pindah konteks, ganti menu, dismiss permanen, badge Koordinasi/Bank tanpa Resume/Undangan, print-hidden aktual.
6. T-09: revert-test tambah-menu-via-config (`git diff --stat components/guide/` kosong saat uji).
7. T-10 runtime: alur Honorarium kosong & terisi.
8. E-2: penerima tanpa NIP + pejabat parsial.

Catatan: tidak ada FAIL — tidak ditemukan perilaku salah pada semua yang
teramati. Gap = keterbatasan sesi (browser mati), bukan temuan bug.

## Verdict: REWORK (0 FAIL, 8 UNTESTED load-bearing)

Ronde re-verifikasi 1: sesi segar + browser hidup, kerjakan gap 1–8 saja
(data seed PNS/PPPK/Honorer sudah terbukti bisa via `localStorage`
`spj_data_guru`/`spj_data_tendik`; login = isi user+pw apa pun).
Bulatkan badge/aturan prioritas REQUIREMENTS poin 9 saat uji T-08.
Lolos 8/8 → APPROVED → `/security-dependency-auditor`.

Batas: ronde 1–3 builder konteks sama; ronde 4–5 builder fresh + model
kuat; setelah 5 ronde gagal → STOP, eskalasi ke manusia (Bab 21 pola 8
bounded execution).
