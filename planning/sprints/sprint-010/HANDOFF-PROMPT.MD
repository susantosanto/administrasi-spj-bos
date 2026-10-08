# HANDOFF-PROMPT — Sprint 010: Dokumen Kelengkapan PBJ (untuk Builder)

> Baca dulu (urutan wajib): AGENTS.MD -> STATE.MD -> DECISIONS.MD -> DOMAIN.MD -> CONSTITUTION.md -> pack ini (planning/sprints/sprint-010/ REQUIREMENTS, BLUEPRINT, ACCEPTANCE).
> PR Context wajib: intent://local/halo-task-5/note/0deeb63d-4888-4ff9-a7fc-78fb1f3d5666 (branch feat/sprint-010-pbj dari main, pack docs-only, 0 lib baru, blue-only, A4-mm, spj_, cetak existing steril, commit kuasa user).
> Brief wajib: note b6fecf9e-8ea6-402d-80d3-2512263cf077 + fitur-dokumen-kelengkapan.md + template/Dokumen PBJ_2026_Lbs.xlsx + template/INVOICE - Oktober.pdf.

## Bootstrap (jalankan dulu — jangan menebak setup)

git branch --show-current
# harapan: feat/sprint-010-pbj (dari main; pack DOCS-ONLY sudah di branch ini, src belum diubah)
git status --porcelain
# harapan: hanya file planning/sprints/sprint-010 (4 dokumen); src bersih
cd D:/project/spj-app/spj-frontend then npm run build
# harapan: exit 0 (baseline pra-eksekusi). Lalu:
npm run dev
# buka http://localhost:5173/ — login user+pw bebas -> /dashboard/dokumen-kelengkapan -> section Kelengkapan PBJ

## Perintah Kerja

1. DRY RUN DULU — laporkan: urutan (aturanPbj parse+prefill lalu 5 config lalu editor Kelengkapan lalu pbjDocs panel lalu deep-link BKU) — TANPA paralel lintas file bersinggungan; file disentuh (maks 4+2 baru BLUEPRINT); lokasi helper (aturanPbj.js vs split sibling bila >200); risiko (DokumenKelengkapanPage besar -> tambah minimal; templateConfig 34k -> tambah minimal atau pecah pbjTemplates; qty Terima vs Pesan; PRODUK II kosong jujur; sticky reuse 009). TUNGGU persetujuan user sebelum coding.
2. Eksekusi sampai T-02-T-09 hijau (tiap sub diakhiri npm run build exit 0 + grep DoD; tempel output asli sebagai bukti shift-left). Oracle: invoice 3 item + Rp 7.055.000 + Himalaya Store; cetak 6 halaman; panel 6 docs label F-PBJ6.
3. Data uji: template/INVOICE - Oktober.pdf (oracle T-02) + 1 transaksi BKU PEMBAYARAN (oracle T-06) + PDF asing untuk fallback (oracle T-03). Prioritas prefill: user lalu invoice lalu BKU; snapshot spj_otomatis_snapshot + Urungkan pola 005.
4. Batas file: Component max 300 baris delta, Utility max 200 baris, Config max 150 baris per penambahan (Constitution); templateConfig existing + TemplateEngine + blocks existing DILARANG disentuh (selain max 1 block baru bila diputuskan dry run).
5. Tawarkan 2 mode uji dulu (otomatis agent vs manual user checklist, DECISIONS.MD 2026-10-01) sebelum acceptance.
6. Selesai -> update STATE.MD + pack sprint-010 (checklist + status). Storage tetap prefix spj_ via storageHelper; warna BLUE-ONLY #004ac6 + slate. JANGAN commit, JANGAN push (kuasa user).

## Perintah Bukti T-08 (cetak steril + larangan)

git diff HEAD --stat -- spj-frontend/src/data/templateConfig.js spj-frontend/src/components/templates/TemplateEngine.jsx spj-frontend/src/components/templates/blocks/
git diff HEAD -- spj-frontend/src/pages/dashboard/DokumenKelengkapanPage.jsx | grep -c sk-doc-print   # harapan: 6
grep -rniE TTD-digital/KIRIM/QRCode/navy pada 3 file cakupan  # harapan: 0 hasil
grep -n print-hidden dan media-print di PanelPreviewDocument.jsx  # harapan: ada

## Perintah Bukti T-09 (dependency + storage + warna + blob)

git diff HEAD -- spj-frontend/package.json  # harapan: kosong (pdfjs-dist tetap 4.10.38)
grep -rn spj_ pada aturanPbj + KelengkapanPage | head -5  # harapan: spj_pbj_* via storageHelper
grep -rniE warna-larangan pada 2 file cakupan  # harapan: 0 hasil di dokumen PBJ
grep -rniE readAsDataURL/data-pdf pada 2 file cakupan  # harapan: 0 hasil (tanpa blob)

## JANGAN

- Mulai coding tanpa dry run disetujui; mengubah requirements tanpa persetujuan (khususnya Keputusan pack 1-7: semua-pengadaan, pdfjs-existing, 5-dokumen-mapping, letak-kedua, prefill-snapshot, preview-cetak, barang-dari-invoice); menambah dependency apa pun (pdfjs-dist 4.10.38 dipakai ulang, bukan ditambah);
- Menyentuh 13 config existing, TemplateEngine.jsx, blocks existing (selain max 1 baru bila diputuskan), dokumen selain PBJ, logika BKU selain tombol deep-link; menyimpan blob PDF di localStorage; menampilkan URL tokaladang sebagai fetch (hanya teks);
- Menambah TTD digital, tombol KIRIM server, QR, warna navy/oranye (DICORET permanen); memakai warna larangan emerald/amber/rose/violet/cyan di dokumen/editor PBJ (badge layar-only teks+ikon pengecualian);
- Menimpa ketikan user saat prefill; mengarang rows/produk kosong (kosong = skip/pesan jujur strip); refactor di luar 4+2 file cakupan.