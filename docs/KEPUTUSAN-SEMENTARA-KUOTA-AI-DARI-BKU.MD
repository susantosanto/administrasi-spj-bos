# KEPUTUSAN SEMENTARA (DIKUNCI SEBAGAI RUJUKAN) — Kuota AI Generate Foto Dokumentasi Berbasis Data BKU

> **Status: DIKUNCI sebagai titik rujukan sejak 2026-11-13** (isi tetap bersifat sementara —
> menunggu finalisasi, tapi **file ini adalah satu-satunya rujukan** untuk semua riset fitur,
> keputusan, atau pertanyaan baru seputar model dan fitur generate dokumentasi AI).
>
> **Aturan penguncian:**
> 1. Setiap riset/keputusan/PRD/pack baru terkait fitur generate foto dokumentasi AI
>    **WAJIB merujuk file ini** — jangan membuat angka/aturan kuota baru di file lain.
> 2. Jika ada keputusan lain (atau data BKU nyata) yang mengubah isi keputusan di sini,
>    **file ini yang diubah mengikuti keputusan itu** (tulis entri `K-Sxx (revisi)` atau
>    blok revisi ber tanggal), bukan diabaikan dan bukan diganti file baru.
> 3. File ini TIDAK mengubah dan TIDAK menyalahi
>    `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD` (D-01…D-22 tetap beku, terutama
>    D-16 kuota 60 foto/sekolah/tahun + cap bulanan $50). Dokumen ini berada **di atasnya**
>    secara operasional: bagaimana kuota dipetakan dari data BKU dan bagaimana kuota
>    ditampilkan agar operator tidak merasa dibatasi berlebihan.
> 4. Menjadi final setelah: (a) disetujui user, (b) angka kebutuhan diverifikasi dari
>    data BKU nyata.

---

## 1. Masalah yang dijawab

Pertanyaan user: bagaimana cara terbaik mengetahui kuota AI untuk generate foto dokumentasi
dari data BKU yang diupload? Apakah kuota dipetakan per-kegiatan dari file BKU, atau
diberikan angka tetap per operator?

## 2. Keputusan

### K-S1 — Kuota pembatas = counter sederhana, BUKAN penguncian per-kegiatan

Kuota yang menahan tombol Generate tetap **angka tetap per sekolah: 60 foto AI/tahun**
(sesuai D-16, beku). Peta kebutuhan dari BKU **tidak boleh** dipakai sebagai pengunci kuota.

Alasan:
1. Data BKU berubah-ubah (upload ulang Rev2/Rev3, merge, hapus baris, upload terlambat).
   Kuota yang dikunci ke peta BKU akan bergeser setiap kali BKU berubah → membingungkan operator.
2. Retry terjadi di level foto, bukan di level kegiatan — sulit dipetakan balik adil ke kegiatan.
3. Prediksi kebutuhan bisa salah; salah prediksi = operator kehabisan kuota padahal saldo nyata masih ada.

### K-S2 — Data BKU dipakai untuk PETA KEBUTUHAN (perencanaan + tampilan), bukan pengunci

Alur: Upload BKU → parser kategori (sudah ada: `bkuParser.js` + `bkuKategori.js`) →
kegiatan ber-slot foto (`SET_FOTO_PER_AKTIVITAS`, sudah ada: mamin=3, atk=3, rapat=1, dst.) →
ditampilkan sebagai **"Peta Kebutuhan Foto"**: berapa kegiatan butuh dokumentasi, berapa slot,
berapa sudah terpenuhi, dibanding sisa kuota.

Angka patokan (sudah konsisten antar dokumen):

| Sumber | Angka |
|---|---|
| Estimasi 50 sekolah/6 bulan (dokumen user, kini dihapus — angkanya diserap ke sini) | 30 foto/sekolah/6 bulan |
| D-16 (beku) | 60 foto/sekolah/tahun |

Kebutuhan nyata (±30–40 foto/6 bulan) **jauh di bawah** kuota → mayoritas operator
tidak akan pernah kena batas.

### K-S3 — Aturan pemotongan kuota (jujur ke biaya nyata)

| Kejadian | Potong kuota? | Dasar |
|---|---|---|
| Panggilan API sukses | **Ya** | Ditagih provider |
| Panggilan gagal (API error) | Tidak | Tidak ditagih provider (D-18: gagal = pesan + unggah foto asli) |
| Regenerasi identik (hash sama) | Tidak | D-13: cache hash = $0 |
| Stop di tengah proses | Ikut hasil: sukses yang tiba = potong; dibatalkan sebelum hasil = tidak | D-10 + perilaku jujur Sprint 020 |

Penghitungan **selalu dari `log_ai`** (D-14), bukan hitungan manual UI — sehingga
panggilan yang tidak ditagih otomatis tidak memotong kuota.

### K-S4 — UX kuota: "invisible until it matters"

Tujuan: operator tidak merasa sangat dibatasi, padahal limit nyata ada.

1. **Kuota tidak ditampilkan terus-menerus.** Tampilkan status, bukan angka, hanya di kartu AI:
   - 🟢 Hijau (sisa aman): "AI siap membantu" — angka kuota tak perlu muncul.
   - 🟡 Kuning (sisa <20%): "Kapasitas AI mulai terbatas — masih cukup untuk foto kegiatan ini."
   - 🔴 Merah (habis): baru pesan lengkap + jalur lanjut (K-S5).
2. **Framing kapasitas, bukan batasan:** "AI tersedia hingga 60 foto ilustrasi/tahun —
   dirancang mencakup kebutuhan dokumentasi LPJ 1 semester."
3. **Unggah foto asli = fitur utama gratis tanpa batas; AI = penolong bonus**
   (selaras D-17: jalur utama tetap unggah foto asli).
4. **Counter = capaian, bukan sisa:** "AI sudah membantu 15 foto untuk 8 kegiatan di BKU kamu" —
   bukan "sisa 45/60".
5. **Kuota habis tidak menyalahkan:** "AI sudah membantu 60 foto dokumentasi kamu tahun ini —
   kapasitasnya penuh. Lanjutkan dengan unggah foto asli; semua fitur cetak LPJ tidak terpengaruh."

### K-S5 — Kuota HANYA menyentuh tombol Generate AI

Kuota **tidak boleh** mengunci fitur lain apa pun: cetak, template, upload foto asli,
dokumen LPJ (D-22: templateConfig & blok cetak 0 diff). Operator yang merasa
"aplikasinya macet karena kuota" = kegagalan desain.

### K-S6 — Tempat peta kebutuhan ditampilkan (terbuka, menunggu pilihan user)

- Opsi a (rekomendasi): ringkasan di Dashboard — "kegiatan yang butuh foto: X dari Y selesai".
- Opsi b: hanya di kartu AI Generate (sisa kuota + estimasi kebutuhan dari BKU aktif).

---

## 3. Yang belum final (syarat jadi keputusan final)

1. Persetujuan eksplisit user atas K-S1…K-S6 (khususnya K-S6 pilihan tempat UI).
2. Verifikasi angka kebutuhan dari data BKU nyata (berapa kegiatan ber-slot foto
   rata-rata per sekolah) — angka 30–40 foto/6 bulan saat ini masih estimasi.
3. Keputusan retry: K-S3 memilih "gagal tidak memotong" — perlu konfirmasi bahwa
   provider memang tidak menagih panggilan gagal pada implementasi final (BFL/fal).

## 4. Rujukan

- `planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD` — D-13, D-14, D-16, D-17, D-18, D-22 (beku)
- `docs/RESEARCH-AI-FOTO-PRODUCTION-200-USER.MD` — angka harga yang dikunci
- `docs/RESEARCH-FITUR-AI-FOTO-DOKUMENTASI-2026-11.MD` — dihapus 2026-11-13; ringkasannya
  tersimpan di `STATE.MD` entri (22)
