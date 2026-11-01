# BUILD-REPORT.MD — Sprint 023: 5 Perbaikan Detail Transaksi + Referensi 2026

## Status: KODE SELESAI & GATE HIJAU (uji browser interaksi menunggu user)

## Isi (5 file, sesuai BLUEPRINT)
1. `components/bku/SidebarPbj.jsx` (+184): komponen `TabelInvoice` (1 invoice = 1 baris + expand item, baca `spj_pbj_invoices`) + refresh tiap upload. Parse/prefill (`pbjInvoice.js`) 0 diff.
2. `components/bku/BKUSidebar.jsx` (+7/-2): card Kategori Belanja dibungkus `{!isSetorPajak && (...)}`. Informasi Referensi tetap.
3. `components/dokumentasi/DokumentasiAIGenerate.jsx`: `spj_ruang_lokal` per rowKey + prioritas lokal→global + UI Hapus/Upload/Ganti di Langkah 2. Global `ruangan_photos` 0 tulis baru.
4. `data/kodeReferensi.js` (+206/-18): REKENING_MAP 16 → 183 entri Excel 5.1 2026. Lookup/refresh/KEGIATAN_BOS 0 diff.
5. `components/bku/BKUSidebarLpj.jsx` (+68): dropdown `jenisPemeliharaan` (default upah, persist via formData) + `previewDocs=[]` + nota panduan saat non-upah.

## Kepatuhan KEPUTUSAN-DIKUNCI-022
- D-22/G-7: `templateConfig.js` + `blocks/` + `imageGenerator.js` + `puterAkun.js` 0 diff (terverifikasi git diff).
- D-17/D-18: label AI + pesan jujur tidak diubah. Tanpa dependency baru.

## Bukti
- Build: `✓ built in 13.12s` exit 0 (warning xlsx chunk + size = pre-existing).
- `planning/sprints/sprint-023/probe-s023.mjs`: **121 PASS / 0 FAIL**.

## Komparasi Jan–Jun vs rumus sumber (23-rev13, perintah user)
- Rumus diekstrak (F10/F11/F12/H23/H29/H31/H33/H35 + Data B9:P15): D = saldoAwal + BOSP · K = D − akhir · A = akhir · Sub1/SUB2 = Σ denom×lembar · Sub3 = bank (kolom G) · B = 1+2+3 · selisih = A−B.
- Hasil: 6 bulan × (D/K/A/Sub1/B/selisih) + BAP Feb (a/b/Jumlah) = 39 asersi LULUS lawan angka sumber (Feb: D 82.560.000 · K 36.375.900 · A 46.184.100 · tunai 9.075.000 · bank 37.109.100 · B seimbang).

## Riset aturan resmi + audit pajak (23-rev18, perintah user)
- Sumber luar (Perwal BPK, operatorsd, dapodik): B = opname fisik + bank (WAJIB = A, beda dijelaskan); D = saldo lalu + BOSP + bunga + titipan BELUM setor; Sub3 = saldo bank; pecahan = hitung tangan.
- Audit BKU asli: PUNGUT vs SETOR selalu impas per bulan (Feb 230k/230k, Mar 192k/192k, Apr 96k/96k, Mei 24k/24k, Jun 72k/72k) → titipan tak tersisa → D/K aplikasi = E/F sumber 6/6 TANPA perubahan kode. Bunga bank = 0 semua bulan.
- Pemetaan aplikasi↔aturan: D/K/A auto dari BKU · (1)(2) auto estimator + ketik per baris · Sub3 auto bank + ketik · B = jumlah · selisih + penjelasan. BAP a/b/c/Jumlah/Saldo/selisih konsisten dengan Register.

- Rev27 (perintah user): overlay Pengaduan inset kiri 3.4% (grup B8:D42 sumber, bukan full-width) — garis + NIHIL sejajar Kritik.
- Rev26: garis SEJAJAR + setengah NIHIL (sudut garis = sudut teks, bukan pojok-ke-pojok).

## Kolom tabel pas 4 (23-rev24, temuan screenshot titik hilang)
- Akar: baris field memakai tdJudul default span 3 + tdIsi span 2 = 6 kolom > 4 → sel isian terjepit nol, titik tak tampil. Helper tdB (span 1) untuk semua baris field.

## Stempel NIHIL + garis diagonal (23-rev21, bukti XML drawing)
- Bedah `xl/drawings/drawing2+3.xml`: grup berisi PNG NIHIL (rot 309.6°/316.7° ≡ −50.4°/−43.3°) + connector garis `accent2` (flipH: pojok-atas-kanan → bawah-kiri). accent2 tema = #ED7D31.
- Replikasi: PNG diekstrak dari file (`public/stempel-nihil.png`, hash identik) + SVG diagonal + sudut putar persis + print-color-adjust exact. Selalu tampil seperti sumber.
- Rev22: urutan cat = garis DI ATAS gambar (sesuai urutan grup XML) + `mix-blend-multiply` (replikasi `clrChange` putih→transparan) supaya garis & titik tak tertutup kotak putih.
- Rev23: pusat NIHIL ≠ pusat garis (XML: −3.6% x, −6.25% y pengaduan; kotak B16:D21 vs garis A10:D32 kritik) → posisi persen disamakan. (Menggantikan styling rev20; titik merah-italic tetap.)

## Vonis akhir bank/kas (23-rev19, bukti openpyxl dua file)
- Titik-titik kini merah + italic di 2 blok. Fakta file: hitam non-italic tanpa border diagonal (terverifikasi openpyxl) — styling merah-miring = permintaan user, dicatat eksplisit.
- BKU contoh: TAK ADA pecahan bank/kas (hanya Saldo Bank/Tunai Des 2025 = 0 + footer kosong Rp. 0). Saldo rantai = buku semata.
- Data G/H 6 bulan TERBUKTI ketikan via openpyxl data_only=False (bukan rumus).
- Rumus Data: C, F, J, E(Apr+), K–P. E Jan–Mar ketik (= D aplikasi 6/6).
- Konsekuensi: tak ada rumus yang menurunkan bank/kas sejati dari BKU ini selain estimator TARIK−BPU (cocok 6/6 di file ini); bila fisik berbeda, ketik manual (input tersedia, BAP ikut).

## Riset G/H sumber: KETIKAN bukan rumus (23-rev17)
- Dump formula Data B9:P20: rumus HANYA di C (=D bulan lalu), F (=E−J), J (=SUM G:I), E (Apr+ =J lalu), K–P (carry). G (Bank) + H (Kas) 6 bulan = NILAI KETIK: Jan 82.56M/0 · Feb 37.109.100/9.075.000 · Mar 37.109.100/3.775.000 · Apr 8.041.400/1.100.000 · Mei 8.041.400/0 · Jun 0/0.
- Artinya sumber TIDAK menghitung bank/kas dari BKU — keduanya input rekonsiliasi (J wajib = saldo buku BKU). Aplikasi: tunai auto berjalan (terbukti = H 6/6) + bank = buku − tunai; KEDUANYA bisa diketik (input saldoTunai/saldoBank) persis seperti sumber. Tak ada perubahan kode; bila tangkapan tunai tak lengkap, ketik angka fisik → bank menyesuaikan.

## Model tunai BERJALAN 6/6 lawan BKU asli (23-rev16, vonis Maret-Mei)
- BKU contoh di-parse parser+util ASLI: bulanan salah untuk Mar–Mei (0 vs 3.775.000/1.100.000); berjalan = kolom H sumber 6/6 (0/9.075.000/3.775.000/1.100.000/0/0).
- False positive nyata: "MelesTARIKan" (BNU24 Rp 181.200) → matcher kata-utuh; BNU/BPU berfrasa tarik tetap tunai.
- Berlaku di builder + form (seangka); ketikan tetap menang.

## Revisi format tanggal + form seangka (23-rev14/15)
- parseTanggal terima DD-MM / DD-MM-YYYY / ISO / "D Month YYYY" + tahun 2 digit (baris format beda tak lagi gugur diam-diam; diekspor untuk oracle).
- Editor Lembar&Keping form disamakan ke model tunai + teks transparan (Tarik X − BPU Y = tunai) + ganti bulan menghapus pecahan beku (dulunya model saldo-akhir sehingga form ≠ dokumen).

## Revisi denom + tarik-penerimaan (23-rev12, temuan screenshot user)
- Kolom denominasi: "Rp.-" saat jumlah 0 (teramati di kedua file sumber), nominal penuh bila ada lembar/keping.
- TARIK_TUNAI via kolom PENERIMAAN ikut hitungan tunai (aturan #8b); BBU/dana-BOSP tetap penerimaan (aturan #4 duluan).

## Revisi struktur tabel lembar (23-rev11, perintah user "acak-acakan")
- Akar: layout flex membuat titik meluap tak terkendali. Tulis ulang 2 blok sebagai TABEL 4 kolom persis sumber (A 3-4% nomor · B 30-35% label · C+D isian), table-fixed + nowrap-clip = overflow Excel. Tinggi baris 28/36px (21/27pt).
- Dump openpyxl sel-per-sel: titik-titik = TEKS ~113/179 karakter (bukan border) → blok render string merah nowrap-clip; judul Bookman 11 NON-bold (sudah benar), periode kritik bold 12 (sudah), baris isi 21/27pt; footer = "Bandung Barat, Cikalongwetan, 31 Januari" (tanpa tahun, sesuai formula D44/D34).
- TARIK_TUNAI: BNU/BPU beruraian tarik ikut tunai (aturan #5 dikecualikan); logam terbukti (tunai 7.034.500 → l-500).

## Revisi lembar tangan + tarik berkode (23-rev9, perintah user)
- Kritik/Saran + Pengaduan = dokumen tangan murni: formFields dikosongkan (panel kiri tertulis "Dokumen ini tidak memerlukan form input"), teks "[...]" DIHAPUS dari cetakan (kosong bersih untuk tulis tangan), garis titik-titik MERAH. Nilai otomatis (dana, sekolah, periode dari bulan RK, TTD) tetap hitam.
- TARIK TUNAI berkode rekening/kegiatan kini terdeteksi (uraian tarik/penarikan) — guard kode lama membuat tunai nol pada BKU bank. BNU/BPU tetap pembayaran. Logam terbukti masuk: tunai 7.034.500 → l-500 = 1, Sub (2) Rp 500.

## Revisi kas identik sumber (23-rev8, perintah user)
- Hitungan: tunai default = TARIK TUNAI − belanja BPU (BKU-- kolom E, koreksi model lama); Sub (3) default = buku − tunai (kolom F) sehingga B seimbang; fisik BAP ikut bulan BAP (bug lintas-bulan diperbaiki); D = saldoAwal + BOSP, K = D − akhir, A = akhir (terverifikasi = rumus BKU--).
- Hitungan: tunai default = TARIK TUNAI − belanja BPU (BKU-- kolom E, koreksi model lama); Sub (3) default = buku − tunai (kolom F) sehingga B seimbang; fisik BAP ikut bulan BAP (bug lintas-bulan diperbaiki); D = saldoAwal + BOSP, K = D − akhir, A = akhir (terverifikasi = rumus BKU--).
- Format: blok Register/BAP/Lembar sudah mirror sumber (grid titik, TTD 2 kolom, dotted lines, denominasi 7+4) — diverifikasi sel-per-sel, 0 diff struktur.
- Input yang ditambah (builder sudah dukung, belum ada input): RK tglTutup/tglLalu/namaPenutup/totalPenerimaan/totalPengeluaran/saldoKas/tanggalTtd; BAP penanda + tanggalTtd; PP/KS tempatTtd + nama/nip pelapor. Input date → teks Indonesia otomatis.
- Dipertahankan (aturan proyek): tanggal format Indonesia, tempat TTD default Cikalongwetan (bisa diketik "Bandung Barat" bila perlu), font aplikasi.

## Revisi Workplan identik sumber (23-rev3, perintah user)
- Sumber dibaca sel-per-sel: sheet "Workplan" (`template/Dokumen PBJ_2026_Lbs.xlsx`): meta No./bulan+tahun/hari + satuan + alamat + kategori + tabel 6 baris (Jumlah, Spesifikasi, Waktu serah, Lokasi, Alokasi, Persyaratan bersarang a/b/c) + TTD Pelaksana.
- Baru: blok `workplan-pbj` (WorkplanPbj.jsx) + registrasi TemplateEngine; `pbj_perencanaan` = kop + header + workplan + signature peranLabel "Pelaksana," (prop aditif, 0 dampak lain); `pbjDocs` rakit dari tab Data + Data Sekolah + TEMPAT_TTD; gate dokumen = inti Workplan kosong semua → skip.
- Form tab Perencanaan (sidebar + halaman) = 13 input Workplan via `simpanKe:'data'`; gate Cek/ringkasan halaman ikut simpanKe. Field lama tetap tersimpan (kompatibel).
- Deviasi D-22 dicatat di DECISIONS.MD (D-23, disetujui user via perintah eksplisit).
- Tempat TTD ikut aturan proyek (Cikalongwetan, bukan "Bandung Barat" di contoh) — struktur identik, isi ikut data sekolah.

## Revisi pasca-laporan user (23-rev)
- Keluhan: Dokumen Perencanaan kosong setelah upload invoice. Akar: invoice hanya mengisi `perencanaan.tanggalSurat`; `spesifikasi`/`alokasi` tak pernah dari invoice; prefill BKU sidebar tak mengisi `perencanaan.spesifikasi` (beda dengan deep-link Kelengkapan).
- Fix di util BERSAMA (dua halaman ikut membaik identik): `aturanPbj.js` invoice→`perencanaan.spesifikasi` (join uraian item) + `alokasi` (grandTotal); `pbjPrefill.js` BKU→`perencanaan.spesifikasi` (uraian). `isi()` tak menimpa ketikan. Tetap manual (jujur, tak bisa dikarang): nomorSurat + syaratA/B/C.

## Jujur — belum diuji
- Interaksi browser end-to-end — Playwright MCP sempat hidup (baca localStorage user-kosong di profil agent), lalu backend browser mati total (fenomena yang sama dicatat AGENTS.MD); menunggu uji manual user atau sesi browser stabil.
- Kasus Maret-Mei kosong TERBUKA: butuh bukti dari BKU user (lihat laporan ke user).
- Deviasi sadar: ruang lokal disimpan sebagai dataURL di localStorage (konsisten pola owner `spj_dok_ai_owner`); D-15 (foto sebagai file) adalah target produksi Electron, bukan gate sprint web ini.
- Diff repo lain yang belum di-commit (imageGenerator.js, DokumenKelengkapanPage.jsx, dll.) BUKAN dari sprint ini — jangan ikutkan saat commit Sprint 023.
