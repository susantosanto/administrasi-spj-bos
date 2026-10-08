# ACCEPTANCE — Sprint 010: Dokumen Kelengkapan PBJ (upload invoice + 5 dokumen)

> **Dokumen 3 dari 4** Architect Pack (Bab 8.4). Given/When/Then + perintah + output harapan. Semua perintah dari root D:/project/spj-app.
> Branch: feat/sprint-010-pbj (dari main). Sifat: pack DOCS-ONLY dulu; kriteria di bawah untuk tahap eksekusi SETELAH pack disetujui (dry-run-first, TUNGGU persetujuan).

## Task Gate (WAJIB sebelum kriteria dinilai)

npm run build exit 0 + grep per task BLUEPRINT sudah hijau. Gate akhir: invoice TERBACA OTOMATIS (3 item + Rp 7.055.000) + 5 dokumen tampil di panel + 6 halaman cetak + cetak existing steril.

## Definisi Selesai

Sprint SELESAI bila checklist C-01-C-08 centang + T-01-T-10 lulus + E-1/E-2 lulus.

## Checklist

- [x] C-01 Upload invoice TERBACA OTOMATIS: INVOICE - Oktober.pdf menjadi 3 item + grand total Rp 7.055.000 + penyedia Himalaya Store terisi (T-02)
- [x] C-02 Fallback manual jujur: PDF non-SIPLah/scan buram menjadi pesan jujur + form manual penuh bisa isi + arsip meta tersimpan (T-03)
- [x] C-03 5 dokumen tampil: panel 6 docs + area cetak 6 halaman + ringkasan per dokumen (T-04, T-05)
- [x] C-04 Prefill BKU deep-link + snapshot/Urungkan: dari BKU menjadi auto-prefill + badge + Urungkan kembalikan (T-06)
- [x] C-05 PBJ selalu tampil: toggle SIPLAH on/off menjadi section PBJ tetap ada (T-07)
- [x] C-06 Cetak steril selain PBJ: dokumen existing identik, tiap dokumen PBJ ganti halaman, panel tak ikut cetak (T-08)
- [x] C-07 Larangan: tanpa TTD digital, tanpa KIRIM, tanpa QR, tanpa navy, 0 lib baru, prefix spj_ utuh, tanpa blob PDF (T-08/T-09)
- [x] C-08 Build sukses + STATE.MD/pack updated (T-01, T-10)

## Test Cases

### T-01 — Build

- Given pack disetujui + branch feat/sprint-010-pbj. When cd spj-frontend lalu npm run build (+ node -v)
- Then exit 0, tampil built in ... Bukti: output terminal asli

### T-02 — Upload invoice SIPLah terbaca otomatis

- Given halaman Kelengkapan lalu section PBJ lalu upload INVOICE - Oktober.pdf
- When file selesai dibaca (pdfjs existing + aturanPbj)
- Then form terisi: nomorInvoice 12381829/INV/PO6ABDAD2855C6C + tanggalInvoice 01/10/2026 + penyedia Himalaya Store + 3 items (Materai 30x, Gelas Melamin 1x, Sound System 1x) + grandTotal 7055000 + badge Ter baca 3 item Rp 7.055.000. Bukti: screenshot editor terisi + badge + grep parseInvoiceSIPLah/extractTables/extractAllText min 2 hit

### T-03 — Fallback manual (PDF asing / gagal baca)

- Given upload PDF non-invoice (mis. PDF kosong teks). When hasil parse kosong/gagal
- Then pesan jujur Tidak terbaca otomatis — silakan isi manual + SEMUA field manual bisa diisi + arsip meta (nama file + tanggal) tersimpan + tidak ada crash. Bukti: screenshot pesan + form manual terisi 1 dokumen + grep spj_pbj_invoice_meta min 1

### T-04 — Lima dokumen tampil + isi sesuai sheet acuan

- Given T-02 hijau (invoice terparse). When buka 5 tabs + panel + print-preview
- Then: D1 Perencanaan tampil identitas + 6 baris + syarat a/b/c; D2 Pesanan tampil tabel 3 rows dari invoice (qty=Terima) + nomor + Kepada Himalaya Store; D3 BAHP tampil nomor + acuan pesanan + pemeriksa; D4 BAST tampil 2 pihak + checkbox Sesuai/Baik; D5 tampil Seksi A (PRODUK I=Himalaya Store terisi, PRODUK II kosong tampil strip jujur) + Seksi B (tabel 3 produk + harga nego editable). Bukti: 6 screenshot (5 tabs + panel 6 docs)

### T-05 — Panel mirror + skip jujur

- Given (a) semua terisi; (b) 1 dokumen dikosongkan total. When cek PanelPreviewDocument + print-preview
- Then (a) panel 6 docs label persis F-PBJ6 + isi identik area cetak; (b) doc kosong di-skip + pesan jujur (bukan halaman kosong). Bukti: screenshot panel (a)+(b) + grep pbjDocs/pbj_perencanaan/pbj_pesanan/pbj_bahp/pbj_bast/pbj_nego min 4 hit

### T-06 — Deep-link BKU prefill + Urungkan

- Given 1 transaksi BKU PEMBAYARAN (NoBukti, tanggal, uraian, nominal). When klik Lengkapi PBJ lalu mendarat ?dok=PBJ
- Then field kosong terprefill (tanggal menjadi tgl pesanan, uraian menjadi spesifikasi, nominal menjadi alokasi) + badge N field ditimpa dari BKU (bisa Urungkan) + klik Urungkan menjadi form kembali pre-prefill (snapshot spj_otomatis_snapshot). Ketikan user SEBELUM prefill tidak tertimpa. Bukti: 2 screenshot (badge + sesudah Urungkan) + grep snapshotSebelumTimpa/urungkanTimpa/fromBKU min 2

### T-07 — PBJ selalu tampil (bukan hanya SIPLAH)

- Given section Kelengkapan PBJ. When toggle SIPLAH off lalu on
- Then section PBJ TETAP tampil di kedua kondisi; kategori non-PBJ ikut filter lama. Bukti: 2 screenshot (off + on) + grep Kelengkapan PBJ/siplah min 2

### T-08 — Regresi cetak steril + larangan (4 perintah bash, lihat HANDOFF)

- Given selesai. When jalankan 4 perintah: diff-stat templateConfig/TemplateEngine/blocks; grep -c sk-doc-print di DokumenKelengkapanPage; grep larangan TTD-digital/KIRIM/QR/navy; grep print-hidden di PanelPreview
- Then config existing tanpa ubah (hanya +5 config PBJ; TemplateEngine/blocks existing diff KOSONG); sk-doc-print PBJ = 6; grep larangan 0 hasil; panel print:hidden ada. Bukti: output 4 perintah asli

### T-09 — Regresi dependency + storage + warna + blob (4 perintah bash, lihat HANDOFF)

- Given selesai. When jalankan 4 perintah: diff package.json; grep spj_ head-5; grep warna larangan; grep blob readAsDataURL/data-pdf
- Then package.json TANPA diff (pdfjs-dist tetap 4.10.38, 0 lib baru); key baru prefix spj_pbj_ via storageHelper; warna BLUE-ONLY (badge layar-only pengecualian); grep blob 0 hasil. Bukti: output 4 perintah asli

### T-10 — STATE + pack updated, tanpa commit

- Given semua hijau. When cek git status --porcelain + STATE.MD + pack sprint-010
- Then hanya file planning/sprints/sprint-010 + src cakupan T-08; STATE.MD + checklist pack terupdate; TANPA commit/push (kuasa user). Bukti: output git status asli

## Uji Manual 2 Mode (DECISIONS.MD 2026-10-01)

- Mode otomatis (agent): jalankan T-01-T-10 via dev server http://localhost:5173/ + screenshot.
- Mode manual (user checklist): agent terbitkan langkah klik + output harapan (upload invoice lalu cek 3 item lalu isi 5 tabs lalu matikan 1 dokumen lalu deep-link BKU lalu Urungkan lalu toggle SIPLAH lalu cetak), user kembalikan bukti, agent hakimi PASS/FAIL. Tawarkan dulu sebelum eksekusi (wajib).

## Oracle Angka (kunci penjurian — dari baca langsung 2026-10-08)

- Invoice: 3 item, grand total Rp 7.055.000, penyedia Himalaya Store, NO 12381829/INV/PO6ABDAD2855C6C, tgl 01/10/2026
- Cetak PBJ: 6 halaman (D1, D2, D3, D4, D5-A, D5-B), tiap ganti halaman
- Panel: 6 docs label persis F-PBJ6 REQUIREMENTS