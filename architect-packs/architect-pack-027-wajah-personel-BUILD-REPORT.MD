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

- Build `✓ built in 10.98s`.
- probe-027: **4/4 PASS** — AC-1 entri peran tampil · AC-2 `input_images` memuat
  WAJAH1+RUANG1 (sebelum fix: wajah tidak pernah terkirim) · AC-3 fallback peran
  pertama · AC-6 0 pageerror aplikasi (artefak SDK `{"log":[]}` atas stub 401
  dikecualikan dengan dokumentasi).
- AC-4 (personel kosong) = perilaku lama tak berubah (info upload + generate tanpa
  wajah), terverifikasi inspeksi kode — tidak ada cabang yang diubah untuk kasus ini.

## Jujur belum

- Uji visual wajah MIRIP (butuh akun Puter + T-03/T-04 manual) — pengiriman referensi
  kini terbukti, kualitas kemiripan tergantung model.
- acceptance fresh context + commit/push (kuasa user; sprint-026 juga belum di-push).
