# REQUIREMENTS - Sprint 027: Wajah Personel Masuk ke Generate AI (Rp 0)

Sumber: temuan verifikasi 2026-11-02 (BUKTI key mismatch, browser PROOF cocok:0).

## Tujuan (satu)

Foto wajah yang diupload user benar-benar dikirim sebagai referensi ke AI
(sekarang: tidak pernah — `faceImages` selalu kosong).

## Apa (bukan bagaimana)

- Writer (`PersonelFotoTab`, key role id: kepsek/guru/…) TIDAK diubah (satu data satu sumber).
- Reader (`DokumentasiAIGenerate`) membaca bentuk writer: Langkah 3 menampilkan foto
  peran terupload untuk dipilih; `faceImages` dari entri terpilih; fallback = foto
  peran pertama bila tak ada pilihan; prompt memakai label peran.
- Kriteria konsep rev2 tetap: rapat = wajah terpilih HARUS tampak; penyerahan =
  guru/peran penerima + owner penyerah (owner sudah jalan, tidak disentuh).

## Batasan

- 1 file ubah (`DokumentasiAIGenerate.jsx`); writer, prompt pola, model, cetak: 0 diff.
- Tanpa dependensi baru; BLUE-ONLY; D-17/D-18/D-19/D-22 tetap patuh.
