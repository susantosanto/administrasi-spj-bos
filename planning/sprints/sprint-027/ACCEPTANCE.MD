# ACCEPTANCE - Sprint 027

## Task Gate

- `npm run build` (di `spj-frontend/`) → `✓ built in` exit 0 (T-1).
- Skrip bukti key-mismatch lama (`bukti-026-face-mismatch.cjs`) kini menunjukkan
  checkbox peran (BUKAN 0) — atau probe-027 mencakupnya.

## Kriteria

- [ ] AC-1 Pilihan wajah. Given `personel_photos` bentuk writer (key role) + `data_guru`
      nama asli; When kartu AI dibuka; Then Langkah 3 menampilkan entri peran berfoto
      (bukan kosong). Perintah: lihat probe-027. Harapan: `AC-1 PASS`.
- [ ] AC-2 Wajah dieksekusi. Given pilih 1 peran + Generate (intercept `/drivers/call`);
      When request txt2img keluar; Then `input_images` memuat foto wajah + foto ruang
      (≥2). Harapan: `AC-2 PASS`.
- [ ] AC-3 Fallback. Given tak ada pilihan + ada foto peran; When Generate slot rapat;
      Then foto peran pertama ikut sebagai referensi. Harapan: `AC-3 PASS`.
- [ ] AC-4 Edge: `personel_photos` kosong → Langkah 3 info upload (seperti dulu),
      generate tetap jalan tanpa wajah (text-to-image + ruang bila ada). Harapan: `AC-4 PASS`.
