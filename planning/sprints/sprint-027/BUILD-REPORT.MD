# BUILD-REPORT - Sprint 027: Wajah Personel Masuk ke Generate AI

## Ringkasan

Kode SELESAI & GATE HIJAU. Kegagalan logika key mismatch diperbaiki di sisi reader.

## Akar (terbukti browser PROOF cocok:0)

Writer `PersonelFotoTab` simpan `personel_photos` keyed by role id
(kepsek/guru/tendik/pengawas); reader lama cari by nama guru (`data_guru`) →
`orangWithPhotos` selalu kosong → `faceImages=[]` → wajah tidak pernah ke AI,
sementara prompt mengklaim kecocokan wajah.

## Berkas diubah (1) + baru (1)

1. `src/components/dokumentasi/DokumentasiAIGenerate.jsx` (±15 baris):
   `PERAN_LABEL` baru; `orangWithPhotos` dari entri peran ber-dataUrl;
   `faceImages` via peta nama→dataUrl; fallback = peran pertama; hapus
   `guruList` + impor `storageHelper` yang tak terpakai; avatar pakai `g.dataUrl`.
   Writer, prompt pola, model, cetak: 0 diff.
2. `planning/sprints/sprint-027/probe-027.cjs` — BARU (seed bentuk writer asli +
   token Puter palsu; assert ISI request `puter.com` terkirim, bukan hasilnya).

## Bukti gate

- Build `✓ built in 11.39s`.
- Unit deterministik `verifikasiFotoReferensi.test.js`: **19/19 PASS** — susun
  (urutan+dedupe+legacy+kosong), suntik (klaim prompt SELALU sesuai isi input,
  tanpa klaim palsu), daftar/peta/fallback peran, rantai penuh per slot.
- probe-027: **6/6 PASS** — AC-1 entri peran tampil · AC-2 `input_images` memuat
  WAJAH1+RUANG1 · AC-3 fallback peran pertama · AC-7a penyerahan owner tanpa ruang ·
  AC-7b box ruang tanpa wajah · AC-6 0 pageerror aplikasi.
- Refactor behavior-identical: `generateDocumentationImage` memakai
  `susunInputImages` + `suntikInstruksiReferensi` (output sama persis, kini teruji).
- AC-4 (personel kosong) = perilaku lama tak berubah (info upload + generate tanpa
  wajah), terverifikasi inspeksi kode — tidak ada cabang yang diubah untuk kasus ini.

## Jujur belum

- Uji visual wajah MIRIP (butuh akun Puter + T-03/T-04 manual) — pengiriman referensi
  kini terbukti, kualitas kemiripan tergantung model.
- acceptance fresh context + commit/push (kuasa user; sprint-026 juga belum di-push).
