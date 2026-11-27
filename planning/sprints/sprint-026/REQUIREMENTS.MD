# REQUIREMENTS - Sprint 026: Fix Demo Generate Foto AI (Pra-Top-Up, Rp 0)

Sumber: `docs/prd-fix-ai-foto-demo.md` (Bab 8.4: apa & mengapa saja).

## Tujuan (satu)

Demo generate foto AI tidak pernah macet diam-diam: setiap kegagalan berbicara
(pesan Indonesia + jalan keluar), state selalu bersih, dan ada paket uji visual
siap jalan dengan akun Puter gratis.

## Apa (bukan bagaimana)

- Upload gambar rusak/aneh → ditolak ≤ 5 dtk dengan pesan jelas (sekarang: menggantung selamanya).
- Semua cabang gagal generate → pesan Indonesia spesifik + CTA "Unggah foto" terlihat; 0 placeholder diam-diam (D-18).
- Stop/error → slotAktif bersih, tombol kembali aktif.
- Dokumen `PANDUAN-UJI-VISUAL.MD` (T-03/T-04) siap dipakai user.

## Batasan

- Tanpa top-up, tanpa dependensi baru; prompt/model/rasio tidak berubah (rev2 terkunci).
- 0 diff `templateConfig.js` + blok cetak (D-22); label cetak "ILUSTRASI AI" DILARANG di sprint ini.
- BLUE-ONLY + slate.
