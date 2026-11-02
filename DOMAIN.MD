# DOMAIN.MD — Domain Bisnis

(Backfill dari `docs/AGENT.md` pada adopsi workflow 2026-09-13 — ritel 3c Jalur A 27.8.2.
Konten = kondisi aktual saat adopsi, bukan kondisi ideal.)

## Tentang Institusi
- SD NEGERI LEBAKLEUNGSIR — NPSN 20228636
- Alamat: Kp. Lebakleungsir RT 02 RW 10, Desa Mekarjaya, Kec. Cikalongwetan, Kab. Bandung Barat, 40556
- Email: sdn.lebakleungsir@gmail.com
- Kepala Sekolah: BADRUDDIN, S.Ag. (NIP. 197405082014121002)
- Bendahara: DEDE GUNAWAN, S.Pd. (NIP. 198507172020121003)

## Tujuan Aplikasi
- Aplikasi LPJ BOS/BOSP — frontend React untuk **cetak dokumen pertanggungjawaban BOS/BOSP**
- BUKAN aplikasi BKU management (BKU = upload only)
- Fokus utama: cetak dokumen LPJ (Surat Pertanggungjawaban) beserta dokumen pendukungnya

## Terminologi Penting
- "LPJ" = Surat Pertanggungjawaban — dipakai di SEMUA user-facing text (JANGAN "SPJ";
  variable/localStorage tetap `spj_`)
- "BKU" = Buku Kas Umum — upload only, bukan management
- "Card" = kategori dokumen; satu card bisa punya multiple sub-kategori (pill/dropdown)
- "Info-only cards" = kartu tanpa form/modal (Penggandaan, Cetak Foto, Cetak Banner, Tagihan)
- "Wajah layar / wajah cetak" = 2 penampilan tiap dokumen (lihat Aturan Bisnis #3)

## Pengguna Sistem
| Role | Keterlibatan | Sumber |
|------|--------------|--------|
| Bendahara | Penyusun + cetak dokumen | pengguna utama aplikasi |
| Kepala Sekolah | Tanda tangan dokumen | `utils/signatureRoles.js` |

## Fitur Utama Saat Ini (as adopted)
13 template di `templateConfig.js`:
`honor_guru`, `honor_tendik`, `honor_perpus`, `honor_penjaga`,
`transpor_rapat`, `transpor_koordinasi`, `transpor_bank`, `transpor_pendamping`,
`sppd`, `notulen`, `buku_tamu`, `upah`, `pulsa`

## Aturan Bisnis
1. UI user-facing memakai "LPJ", bukan "SPJ" (rename global; backward-compat redirect ada di `App.jsx`)
2. Halaman "Dokumen Wajib" = "Dokumen Kelengkapan"
3. Detail dokumen = 2 wajah: tab = editor/review premium (BUKAN dokumen formal);
   tombol Cetak = dokumen formal lengkap persis template asli
4. Card dokumen pakai konsep accordion/toggle — TIDAK ADA modal
5. SPPD/Surat Tugas: 1 surat berisi daftar penerima tugas, auto-fill dari daftar penerima
   transport, nomor surat TERPISAH dari nomor dokumen transport
   (mis. transport `400.3.7.6/001-SD/VII/2026` vs SPPD `400.3.7.7/001-SD/VII/2026`)
6. Semua dokumen A4 — landscape untuk tabel lebar (honor/transport/upah/pulsa),
   portrait untuk surat formal (SPPD/notulen/buku tamu/BKU)
7. Warna UI blue-only `#004ac6` (satu-satunya warna branded)
8. Router: `/dashboard/dokumen-lpj`, `/dashboard/dokumen-kelengkapan`

## Pain Points
- (diisi /idea-clarifier)
