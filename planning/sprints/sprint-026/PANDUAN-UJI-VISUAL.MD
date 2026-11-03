# PANDUAN UJI VISUAL — Generate Foto Dokumentasi AI (T-03/T-04 Sprint 020)

- Waktu: ±15 menit · Biaya: Rp 0 (akun Puter GRATIS, bukan top-up)
- Tujuan: menutup risiko Tinggi RISKS.MD ("hasil visual UNTESTED") dengan bukti screenshot
- Prasyarat: dev server jalan (`cd spj-frontend && npm run dev`)

## A. Siapkan data (5 menit)

1. Login aplikasi → Data Sekolah → Foto Personel: upload 2 foto wajah guru (format JPG/PNG, wajah jelas).
2. Data Sekolah → Foto Referensi → Ruangan: upload 1 foto ruang rapat asli.
3. Halaman BKU: pastikan ada 1 baris **mamin** (kode rekening ...0052) dan 1 baris **atk** — bisa dari upload BKU Excel/PDF yang sudah ada.
4. Klik baris mamin → tab Dokumen LPJ → kartu "Generate Foto Dokumentasi AI" tampil.

## B. T-03 Uji slot MAMIN (3 slot)

| Slot | Langkah | Kriteria terima |
|---|---|---|
| Rapat | Pilih 2 guru → Generate | Kedua wajah tampak & mirip referensi; latar = foto ruangan terupload; tidak ada orang imajiner |
| Penyerahan | Upload foto owner warung (Langkah 4) → Generate | Owner (wajah sesuai foto terakhir) MENYERAHKAN ke guru penerima; guru tampak jelas |
| Box | Generate (tanpa pilih orang) | Hanya meja + nasi box di ruang rapat asli; tanpa orang |

Screenshot wajib: tiap slot setelah foto masuk Panel Preview.

## C. T-04 Uji slot ATK (3 slot)

| Slot | Langkah | Kriteria terima |
|---|---|---|
| Rapat | Sama seperti mamin | Sama |
| Penyerahan | Upload foto owner toko ATK → Generate | Owner toko menyerahkan ke guru |
| ATK beli | Isi rincian item (Langkah 5) → Generate | Barang ATK di atas meja ruang rapat asli |

## D. Uji kegagalan (Sprint 026)

1. Upload file BUKAN gambar (mis. `.txt`) di Langkah 4 → HARUS: toast error ≤5 dtk, file lama utuh.
2. Klik Generate Semua → tekan Stop → HARUS: loading hilang, tombol kembali, 0 foto susulan masuk.
3. (Opsional, butuh kuota habis) Pesan kuota tampil Indonesia + CTA unggah foto terlihat.

## E. Kriteria lolos & pelaporan

- Lolos: semua slot B/C memenuhi kriteria + D.1/D.2 berperilaku benar.
- Gagal sebagian: catat slot mana + screenshot + deskripsi (mis. "wajah tidak mirip") → laporkan ke builder sebagai temuan revisi.
- Selesai: kirim screenshot + verdict per slot → risiko Tinggi RISKS.MD diperbarui berbasis bukti.
