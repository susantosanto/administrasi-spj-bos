# PANDUAN — Berlangganan FLUX + Integrasi ke spj-app (biaya Rupiah, 31 Okt 2026)

> Harga & prosedur dicek langsung hari ini: `docs.bfl.ai/quick_start/get_started`,  
> `docs.bfl.ai/account_management/credits_billing`, `docs.bfl.ai/quick_start/generating_images`,  
> `docs.bfl.ai/api-reference/utility/generate-an-image-with-flux-3`, `bfl.ai/pricing`,  
> `api.bfl.ai/openapi.json`.  
> Kurs dipakai: **Rp 18.100/USD** (bank 28–30 Okt 2026: 17.900–18.260).  
> Catatan: ini panduan operasional, bukan keputusan. Keputusan tetap user (AGENTS.MD).

---

## 0. Yang perlu diluruskan lebih dulu

**FLUX tidak dijual sebagai langganan bulanan.** BFL memakai **prepaid credits**:

- 1 credit = **$0.01** (Rp 181).
- Isi ulang manual kapan saja, atau nyalakan **auto top-up** (isi otomatis saat saldo  
  turun di bawah ambang) — inilah yang paling mirip "langganan".
- Kredit disimpan di **organization**, dipakai bersama semua **project**; tiap project  
  punya API key & pencatatan pemakaian sendiri.
- Tidak ada biaya bulanan tetap, tidak ada minimum pemakaian. Kosong = request gagal  
  dengan **HTTP 402**.

Konsekuensi desain: **demo dan produksi cukup dipisah lewat project + API key**, bukan  
dua akun. Kreditnya tetap satu kolam — jadi pagar biaya harus di aplikasi, bukan di akun.

---

## 1. TAHAP A — Bikin akun & isi kredit (±15 menit)

| #  | Langkah                                                                                           | Biaya  |
| -- | ------------------------------------------------------------------------------------------------- | ------ |
| A1 | Buka FLUX 3 Klein 1K → daftar (email/Google) → **konfirmasi email**                               | $0     |
| A2 | Sistem otomatis membuat **Default Organization** + **Default Project**                            | $0     |
| A3 | Sidebar organization → **API → Credits** → **Add Credits**                                        | —      |
| A4 | Pilih nominal → bayar via **Stripe** (kartu kredit Visa/Mastercard)                               | $10–20 |
| A5 | Kredit langsung tersedia setelah pembayaran                                                       | —      |
| A6 | Buat project kedua: **`spj-demo`** (project pertama untuk produksi)                               | $0     |
| A7 | Di tiap project: **API → Keys → Add Key** → beri nama → **copy sekali** (tidak bisa dilihat lagi) | $0     |
| A8 | Nyalakan **Auto top-up**: ambang minimum \*\*$5\*\*, target minimal ambang + $10                  | —      |

**Nominal yang disarankan hari ini:**

| Keperluan                      | Nominal | Rupiah         | Cukup untuk                                 |
| ------------------------------ | ------- | -------------- | ------------------------------------------- |
| Uji awal / demo                | $10     | **Rp 181.000** | 208 foto FLUX 3 Image 1K · 1.111 foto Klein |
| Demo + A/B 50 foto × 4 model   | $20     | **Rp 362.000** | ±400 foto campuran                          |
| Produksi 200 sekolah (1 bulan) | $50     | **Rp 905.000** | 1.041 foto 1K (≈1,2 bulan pemakaian penuh)  |

**Pembayaran dari Indonesia (jujur):** Stripe menerima kartu kredit utama. Kartu debit  
Indonesia harus **diaktifkan untuk transaksi internasional/online**; kalau gagal, pakai  
kartu kredit korporat atau kartu virtual (Jenius/Jago/Wise). Siapkan buffer **3–4%** untuk  
biaya konversi bank, dan **11% PPN** bila vendor terdaftar PMSE (muncul di invoice Stripe;  
kalau tidak muncul, simpan invoice sebagai bukti).

---

## 1b. Langkah daftar & bayar — klik per klik

### A. Daftar akun (gratis, ±5 menit)

1. Buka **`https://dashboard.bfl.ai`**.
2. Pilih **Continue with Google** (paling cepat) atau isi email + password.
3. Buka inbox → klik tautan **konfirmasi email**. Tanpa konfirmasi, login ditolak.
4. Login → sistem otomatis membuat:
   - **Default Organization** (tempat kredit & tagihan),
   - **Default Project** (tempat API key & pemakaian).
5. Di sidebar organisation, buka **API → Keys → Add Key** → beri nama (mis. `spj-prod`) →
   **copy kunci saat itu juga** (hanya tampil sekali).

Tidak ada verifikasi perusahaan, NPWP, atau kartu saat mendaftar. Akun langsung aktif.

### B. Bayar / isi kredit (Stripe, ±3 menit)

1. Sidebar organisation → **API → Credits**.
2. Klik **Add Credits**.
3. Pilih nominal (mis. **$10**), lalu **Checkout** → dialihkan ke **Stripe**.
4. Isi:
   - nomor kartu **Visa/Mastercard** (kredit **atau** debit),
   - masa berlaku + CVV,
   - nama pemegang kartu,
   - **billing address** (isi sesuai alamat kartu; beda alamat = sering ditolak),
   - negara **Indonesia**, kode pos.
5. Selesaikan **3-D Secure** (kode OTP dari bank muncul di halaman bank).
6. Kembali ke dashboard → **Credits** menampilkan saldo baru. Kredit aktif **seketika**.
7. Bukti: **API → Credits → Purchase History → View Invoice** (PDF). Simpan untuk pembukuan.

**Nominal & rupiah (kurs Rp 18.100):**

| Nominal | Rupiah | Realistis untuk |
|---|---|---|
| $10 | Rp 181.000 | uji 200 foto FLUX 3 Image 1K |
| $20 | Rp 362.000 | demo + A/B 50 foto × 4 model |
| $30 | Rp 543.000 | uji FLUX.2 [pro] 3 referensi (±22 gambar) |
| $50 | Rp 905.000 | 1 bulan produksi penuh (600–900 gambar) |

Tambahan biaya bank: **3–4%** kurs kartu. Tidak ada biaya langganan bulanan.

### C. Auto top-up (opsional, aktifkan setelah produksi stabil)

1. **API → Credits** → kartu **Auto top-up** → simpan kartu dulu.
2. Aktifkan **Automatic top-up**.
3. Isi **When balance falls below ($)** — minimum **$5**.
4. Isi **Recharge balance to ($)** — minimal **$10 di atas** ambang (mis. ambang $5 → target $20).
5. **Enable auto top-up**. Jika saldo sudah di bawah ambang, pengisian jalan langsung.
6. Gagal bayar → auto top-up **mati sendiri** + peringatan di halaman Credits.

Saran: **jangan** aktifkan auto top-up di project demo. Aktifkan hanya di project produksi.

### D. Kalau kartu ditolak (urutan yang biasanya menyelesaikan)

| Gejala | Penyebab | Tindakan |
|---|---|---|
| `card_declined` | transaksi internasional/online dimatikan | aktifkan di mobile banking (menu Kartu → Transaksi Online/Luar Negeri) |
| Gagal di 3DS | OTP tidak masuk | pastikan nomor HP bank aktif; ulangi, jangan ganti-ganti kartu cepat |
| Ditolak berulang | limit harian kartu < nominal | turunkan ke $10 atau naikkan limit |
| Tetap gagal | kartu debit tidak mendukung USD | pakai kartu kredit, atau kartu virtual (Jenius/Jago/Wise) |
| Saldo terpotong tapi kredit 0 | pembayaran masih pending | tunggu ±10 menit, lalu cek **Purchase History**; jangan bayar dua kali |

### E. Pajak & bukti

- Stripe menagih dalam **USD**. Jika BFL memungut PPN Indonesia (PMSE), nilainya muncul
  terpisah di invoice; kalau tidak muncul, **tidak** berarti otomatis bebas — simpan invoice
  sebagai dasar pencatatan.
- Invoice bisa diunduh ulang kapan saja dari **Purchase History**.
- Dokumentasi tidak menyebut masa kedaluwarsa kredit; tetap pantau karena kebijakan bisa berubah.

---

## 2. TAHAP B — Uji 1 gambar (5 menit, Rp 869)

Endpoint yang benar (terverifikasi dari `openapi.json`, bukan tebakan):

```
POST https://api.bfl.ai/v1/flux-3-image
Header: x-key: <API_KEY>
Body: {
  "prompt": "foto dokumentasi rapat guru di ruang rapat sekolah dasar, natural, siang",
  "images": ["data:image/jpeg;base64,..."],   // opsional, 1–10 referensi
  "resolution": "1k",                          // 768sq | 1k | 1.5k | 2k | 4k | match_input
  "aspect_ratio": "4:3",
  "grounding": false,
  "safety_tolerance": 2
}
```

Alur **asinkron** (wajib, bukan opsional):

1. POST → balasan `{ id, polling_url, cost, input_mp, output_mp }`.
2. GET `polling_url` dengan header `x-key` setiap 0,5–1 detik sampai `status == "Ready"`.
3. Ambil `result.sample` (URL bertanda tangan, **berlaku 10 menit**), unduh, simpan.
4. `status == "Error"/"Failed"` → tampilkan pesan; jangan simpan apa pun.

Batas yang harus diingat: **24 task aktif** per akun (lebih → HTTP 429);  
`flux-kontext-max` hanya 6. Saldo habis → **402**. Ini yang harus dipetakan ke pesan UI.

Model & harga per gambar (hari ini):

| Model              | Endpoint                 | 1K                  | Rupiah     |
| ------------------ | ------------------------ | ------------------- | ---------- |
| FLUX 3 Image       | `/v1/flux-3-image`       | $0,048              | **Rp 869** |
| FLUX 3 Image Klein | `/v1/flux-3-image-klein` | $0,009              | **Rp 163** |
| FLUX 2 [pro]       | `/v1/flux-2-pro`         | $0,03/MP + input MP | Rp 543+    |

---

## 3. TAHAP C — Integrasi ke kode yang SUDAH ADA (1–2 hari)

Titik masuknya sudah disiapkan di repo: `src/services/imageGenerator.js`.

| Bagian                                     | Kondisi sekarang                                                         | Yang diubah                                  |
| ------------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------- |
| `PROVIDER_DEFAULT = 'puter'` (baris 29)    | aktif, Puter user-pays                                                   | tambah `'bfl'`                               |
| `generateWithFlux()` (baris 265–293)       | **komentar mati**, endpoint `fal.run/black-forest-labs/flux-pro` (usang) | ganti jadi `generateWithBfl()`               |
| `generateDocumentationImage()` (baris 317) | `switch(provider)` hanya `puter`                                         | tambah `case 'bfl'`                          |
| Kunci API                                  | tidak ada                                                                | `.env.local` (sudah masuk `.gitignore` root) |

Langkah praktis:

1. **`spj-frontend/.env.local`** (jangan `.env`, jangan commit):
   ```
   VITE_BFL_API_KEY=isi_kunci_disini
   ```
2. Tulis `generateWithBfl(prompt, inputImages, { resolution='1k' })`:
   - POST + polling seperti Tahap B, `AbortController` agar tombol **Stop** tetap bekerja,
   - unduh `result.sample` → `FileReader` → dataURL (kontrak lama: fungsi mengembalikan dataURL),
   - catat `cost` (satuan credit) + `input_mp`/`output_mp` untuk ledger.
3. Tambah `case 'bfl'` di `generateDocumentationImage`, **jangan hapus** `case 'puter'`  
   (tetap jadi fallback demo gratis).
4. Petakan error: `402` → "kredit habis, hubungi admin"; `429` → "antrean penuh, coba lagi";  
   `422` → "permintaan ditolak moderator"; timeout 90 s → tawarkan ulang.

### ⚠️ Jebakan CORS yang menentukan pilihan provider

`docs.bfl.ai` menyatakan URL hasil (`delivery.*.bfl.ai`) **tidak mengaktifkan CORS**.  
Artinya di **versi web sekarang** (`fetch` dari browser) hasil **tidak bisa diunduh** jadi  
dataURL. Tiga jalan:

| Konteks                        | Solusi                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Demo web hari ini              | pakai **fal.ai** (respons JSON berisi URL yang bisa dipakai `<img>`/fetch) atau proxy tipis Cloudflare Worker |
| Produksi Electron (sprint-021) | `net.fetch` di **main process** — tanpa CORS. Ini jalur yang benar                                            |
| Uji cepat                      | `curl` di Tahap B (bukan browser)                                                                             |

Karena produksi tetap Electron, **jangan bangun server hanya untuk CORS**.

---

## 4. TAHAP D — Uji 50 foto nyata sebelum menulis UI (2 hari)

Bandingkan minimal 4 jalur dengan 50 foto kegiatan asli + 10 wajah guru:

| Jalur                 | Biaya 50 foto | Yang dinilai                      |
| --------------------- | ------------- | --------------------------------- |
| FLUX 3 Klein 1K       | Rp 8.150      | apakah cukup untuk cetak 60×40 mm |
| FLUX 3 Image 1K       | Rp 43.450     | kualitas fotoreal                 |
| Nano Banana 2.1 (fal) | Rp 37.550     | kemiripan wajah                   |
| Seedream 5 Pro (fal)  | Rp 61.100     | alternatif                        |

Ukur: cosine kemiripan wajah (InsightFace ONNX, offline, gratis), ketajaman saat dicetak A4,  
dan penilaian mata. Hasilnya menentukan apakah cukup Klein (Rp 163/foto) atau perlu  
FLUX 3 Image (Rp 869/foto) — selisih **5,3×** untuk 200 sekolah.

---

## 5. TAHAP E — Produksi Electron (12 hari)

Setelah migrasi sprint-021, pindahkan panggilan ke main process:

```
renderer ──IPC──► main/aiFotoService.js
                    ├─ key dari safeStorage (DPAPI), BUKAN VITE_*
                    ├─ queue: maks 3 paralel (batas BFL 24 task)
                    ├─ cache hash(prompt+refs+model) → hemat 10–20%
                    ├─ simpan JPEG ke %APPDATA%/spj-app/berkas/foto/...
                    ├─ log_ai: model, cost(credit), mp, durasi, face_score
                    └─ kuota 60 foto/sekolah/tahun + cap bulanan
```

Tambahan yang wajib ada di produksi:

- **Baca saldo** `GET https://api.bfl.ai/v1/credits` → tampilkan sisa kredit di Pengaturan.
- **Auto top-up** hanya untuk akun produksi; demo pakai kredit terbatas tanpa auto top-up.
- **Label "ILUSTRASI AI"** + `is_ai=1` (lihat riset §2 — risiko bukti audit).

---

## 6. TAHAP F — Rilis & operasi

| Pos                        | Frekuensi          | Rupiah                           |
| -------------------------- | ------------------ | -------------------------------- |
| Auto top-up produksi       | bulanan (600 foto) | **Rp 782.000** (FLUX 3 Image 1K) |
| Alternatif hemat (Klein)   | bulanan            | Rp 147.000                       |
| Pemantauan saldo & invoice | bulanan            | 0,5 hari                         |
| Review harga provider      | kuartalan          | 0,5 hari                         |

---

## 7. Total biaya (Rupiah, hari ini)

### 7.1 Sekali di awal (development + percobaan + demo)

| Tahap                                                  | Hari   | Dev               | Kredit uji       | Total             |
| ------------------------------------------------------ | ------ | ----------------- | ---------------- | ----------------- |
| F0 Riset & A/B 50 foto                                 | 2      | Rp 1.600.000      | Rp 150.000       | **Rp 1.750.000**  |
| F1 Demo/PoC (1 provider)                               | 4      | Rp 3.200.000      | Rp 330.000       | **Rp 3.530.000**  |
| F2 Produksi inti (adapter, queue, Stop, ledger, kuota) | 12     | Rp 9.600.000      | Rp 940.000       | **Rp 10.540.000** |
| F3 Hardening (cetak A4, offline, QA 3 mesin)           | 5      | Rp 4.000.000      | Rp 310.000       | **Rp 4.310.000**  |
| **Subtotal**                                           | **23** | **Rp 18.400.000** | **Rp 1.730.000** | **Rp 20.130.000** |

Tarif builder diasumsikan **Rp 800.000/hari** (pasar Rp 500 rb–1,5 jt). Vendor/agensi ≈ 2,5×  
(±Rp 50 juta).

### 7.2 Berulang per tahun (200 sekolah, 7.200 foto diterima, 10.800 panggilan)

| Strategi                                         | API/tahun    | +PPN 11%      | Pemeliharaan | Total tahun-1     |
| ------------------------------------------------ | ------------ | ------------- | ------------ | ----------------- |
| **FLUX 3 Image 1K**                              | Rp 9.383.000 | Rp 10.415.000 | Rp 9.600.000 | **Rp 20.015.000** |
| FLUX 3 Klein 1K                                  | Rp 1.759.000 | Rp 1.953.000  | Rp 9.600.000 | Rp 11.553.000     |
| Routing Klein → Nano Banana 2.1 (butuh akun fal) | Rp 4.509.000 | Rp 5.005.000  | Rp 9.600.000 | Rp 14.605.000     |

**Total tahun pertama (FLUX 3 Image, in-house): Rp 20,1 jt (dev) + Rp 20,0 jt (API+ops) ≈ Rp 40 juta.**  
Per sekolah: **Rp 200.000/tahun** — dan Rp 90.000 di antaranya adalah pemeliharaan, bukan AI.

---

## 7b. FLUX 3 Image 1K vs FLUX 3 Image Klein 1K — beda hasil

Harga sama-sama per tier 1K, tapi **beda 5,3×** ($0,048 vs $0,009 = Rp 869 vs Rp 163).  
Yang benar-benar berbeda di hasil:


| Aspek | FLUX 3 Image 1K | FLUX 3 Image Klein 1K |
|---|---|---|
| Posisi | model tertutup, frontier | open weights, **5,6B parameter** |
| Kepatuhan prompt kompleks | lebih tinggi (model jauh lebih besar) | baik, **tapi wajib prompt upsampler** — docs: prompt apa adanya = "noticeably weaker" |
| Banyak subjek/wajah dalam 1 foto | lebih stabil | mulai melayang saat >3–4 orang |
| Referensi | API menerima 1–10 gambar | multi-referensi didukung (dokumentasi Klein tidak menyebut angka) |
| Teks dalam gambar (spanduk, papan) | kuat, ada kontrol layout bounding box | bisa, tapi salah huruf lebih sering pada teks panjang |
| Detail 100% (tangan, tekstur wajah) | lebih rapi | kadang "lunak" |
| Kecepatan | standar | lebih cepat (distilled: 16 step, CFG 1; base: 50 step, CFG 3.5) |
| Lisensi bobot | komersial via BFL | **FLUX Kommunity License** — self-host komersial tetap perlu lisensi |
| Klaim resmi | — | open-weights #1; +91 Elo vs FLUX.2 klein 9B; mengalahkan Ideogram 4.5 & FLUX.2 [pro] (klaim vendor, bukan uji independen) |

**Untuk kasus spj-app (cetak 60×40 mm di A4):** perbedaan ketajaman hampir tidak terlihat —
1K ≈ 170 dpi. Yang terlihat adalah **wajah**: di sinilah Klein lebih sering gagal, bukan di
detail kain atau tekstur.

**Hitungan yang menentukan:** biaya per foto **diterima**, bukan per panggilan.

| Skenario | Panggilan/foto | Biaya/foto diterima |
|---|---|---|
| Image, 1,5 panggilan | 1,5 | $0,072 (Rp 1.303) |
| Klein, 1,5 panggilan | 1,5 | $0,0135 (Rp 244) |
| Klein, 2,5 panggilan (wajah sering gagal) | 2,5 | $0,0225 (Rp 407) |

Bahkan dengan retry 2,5×, Klein masih **3,2× lebih murah**. Jadi: **Klein sebagai default,
FLUX 3 Image (atau Nano Banana 2.1) hanya untuk eskalasi** — bukan sebaliknya.

---

## 7c. Kalau memilih FLUX.2 [pro] — biaya & tahapan

### Harga resmi BFL (bukan tebakan)

- Output: **MP pertama $0,03**, setiap MP berikutnya **$0,015**.
- Referensi: **$0,015 per MP**, dan **setiap gambar referensi dihitung 1 MP** (gambar >4 MP
  diperkecil ke 4 MP; total input maks 9 MP).
- Artinya referensi **tidak gratis** — inilah yang membuat FLUX.2 [pro] mahal untuk kasus
  spj-app yang mengirim 2–3 referensi (wajah + ruangan + owner).

| Konfigurasi | $/panggilan | Rp/panggilan | Rp/foto diterima (1,5×) | Rp/tahun (10.800 panggilan) |
|---|---|---|---|---|
| 1 MP, tanpa referensi | 0,030 | 543 | 814 | 5.864.000 |
| 1 MP + 2 referensi | 0,060 | 1.086 | 1.629 | 11.729.000 |
| **1 MP + 3 referensi** | **0,075** | **1.358** | **2.036** | **14.661.000** |
| 2 MP + 3 referensi | 0,090 | 1.629 | 2.444 | 17.593.000 |
| 4 MP + 3 referensi | 0,120 | 2.172 | 3.258 | 23.458.000 |

**Perbandingan penting:** FLUX 3 Image **tidak menagih referensi** ($0,048 flat 1K), jadi
untuk pipeline 3 referensi FLUX.2 [pro] **1,56× lebih mahal** dari model yang lebih baru,
dan **8,3× lebih mahal** dari Klein.

### Tahapan (7 langkah)

1. **Akun & kredit** — sama seperti §1; untuk uji FLUX.2 [pro] siapkan **$30** (Rp 543.000)
   karena tiap percobaan 3 referensi = Rp 1.358.
2. **Uji 1 request** ke `POST https://api.bfl.ai/v1/flux-2-pro` (pinned) atau
   `/v1/flux-2-pro-preview` (selalu terbaru):
   ```json
   {
     "prompt": "...",
     "input_image": "data:image/jpeg;base64,...",
     "input_image_2": "...", "input_image_3": "...",
     "width": 1152, "height": 864,
     "output_format": "jpeg",
     "safety_tolerance": 2
   }
   ```
   Nama field **bernomor** (`input_image` … `input_image_8`), bukan array `images`.
   `disable_pup` default `false` → prompt upsampling otomatis aktif.
3. **Polling** — sama: `polling_url` sampai `status:"Ready"`, ambil `result.sample`
   (10 menit), lalu unduh.
4. **Integrasi kode** — di `imageGenerator.js` tambahkan `case 'flux2pro'` dan fungsi
   `generateWithFlux2Pro()`; jangan ubah `case 'puter'`.
5. **Ubah gaya prompt** — FLUX.2 **tidak paham negative prompt** ("jangan mengubah wajah"
   bisa justru menambah yang dilarang). Ganti kalimat negatif di
   `generateDocumentationImage()` menjadi positif: *"wajah setiap orang persis seperti
   gambar 1, ekspresi natural"*.
6. **Catat biaya** — respons memuat `cost`, `input_mp`, `output_mp`; simpan ke `log_ai`.
7. **A/B sebelum commit** — 50 foto: FLUX.2 [pro] 3 ref vs FLUX 3 Image 1K vs Klein.
   Jika kemiripan wajah tidak menang jelas, jangan bayar 1,56×.

**Batas teknis:** edit maks 4 MP; total input 9 MP; 8 referensi; 24 task aktif.
Biaya development **tidak berubah** (±Rp 20,1 juta) — yang berubah hanya biaya API
dan 1 hari tambahan untuk penyesuaian prompt.

---

## 8. Rencana 1 bulan (development + demo) — HANYA biaya langganan

Tanpa biaya tenaga kerja, tanpa server, tanpa langganan bulanan. Yang dibayar hanya
**prepaid credit BFL**.

### 8.1 Asumsi volume 1 bulan

| Skenario | Gambar jadi | Panggilan (retry 1,5×) | Kapan dipakai |
|---|---|---|---|
| Hemat | 150 | 225 | 1 provider, uji fungsi saja |
| **Normal** | **400** | **600** | dev adapter + A/B + demo ke user |
| Intensif | 800 | 1.200 | banyak iterasi prompt/QA cetak |

### 8.2 Tiga strategi (pilih satu)

| Strategi | Model | $/panggilan | Normal 400 gambar | Top-up minimum | Rupiah (+3,5% kurs) |
|---|---|---|---|---|---|
| **A. Hemat maksimal** | FLUX 3 Klein 1K | 0,009 | $5,40 | **$10** | **Rp 187.000** |
| B. Seimbang | Klein + 15% eskalasi FLUX 3 Image | 0,0149 | $8,91 | **$10** | **Rp 187.000** |
| **C. Premium (demo meyakinkan)** | FLUX 3 Image 1K + 20% Nano Banana 2.1 | 0,0467 | $28,02 | **$30** | **Rp 562.000** |
| D. Premium+ | FLUX.2 [pro] 3 referensi | 0,075 | $45,00 | **$50** | **Rp 937.000** |

Skenario intensif (800 gambar): A $10,80 → **$13**; C $56,04 → **$60 (Rp 1.124.000)**;
D $90 → **$92 (Rp 1.723.000)**.

**Kesimpulan biaya:** dengan strategi A atau B, **satu top-up $10 (Rp 187.000) menutup
seluruh bulan development + demo**, dan masih bersisa untuk produksi. Itu angka totalnya —
tidak ada biaya lain.

### 8.3 Taktik menekan harga (yang benar-benar berpengaruh)

1. **Jangan 2 MP.** 1152×864 = 1 MP. 1344×1008 = 1,35 MP → dibulatkan 2 MP → +50% biaya.
2. **Klein dulu, eskalasi belakangan.** 85% foto lolos di Klein; hanya yang gagal wajah
   naik ke FLUX 3 Image.
3. **Referensi maksimal 2 saat dev.** Di FLUX.2 [pro] tiap referensi +$0,015 (Rp 272).
4. **Cache prompt hash** — tombol generate ditekan dua kali = $0.
5. **Puter gratis untuk uji UI** (layout, tombol, alur) — jangan bakar kredit untuk
   memastikan tombol muncul.
6. **Uji prompt di Playground** (biaya sama, tapi tidak perlu deploy kode).
7. **Jangan aktifkan auto top-up di project demo** — satu-satunya cara kredit habis tanpa
   disadari.
8. **Satu project demo, satu project produksi** — pemakaian terpisah, kredit tetap satu kolam.

### 8.4 Jadwal 1 bulan + volume kredit

| Minggu | Fokus | Gambar | Strategi A | Strategi C |
|---|---|---|---|---|
| 1 | Akun, adapter, 20 prompt pertama | 60 | $0,81 | $4,20 |
| 2 | Face gate + perbaikan prompt | 120 | $1,62 | $8,41 |
| 3 | A/B 50 foto × model + cetak A4 | 150 | $2,03 | $10,51 |
| 4 | Demo ke user + revisi | 70 | $0,95 | $4,90 |
| **Total** | | **400** | **$5,40** | **$28,02** |

### 8.5 Bayar lewat Bank Mandiri

**Prasyarat:** kartu debit/kredit Mandiri berlogo **Visa** atau **Mastercard**.
Kartu **GPN-only tidak bisa** dipakai di Stripe — minta ganti kartu di cabang.

1. **Cek kartu** — lihat logo di fisik kartu. Kalau hanya GPN, hentikan di sini.
2. **Aktifkan transaksi online & luar negeri:**
   - **Livin' by Mandiri** → menu **Kartu** (nama menu bisa "Kartu Debit"/"Debit Card",
     berbeda antar versi) → pilih kartu → **Pengaturan/Atur Kartu** → aktifkan
     **Transaksi Online** dan **Transaksi Luar Negeri**; atur limit harian ≥ Rp 1.000.000.
   - Tidak menemukan menunya? **Mandiri Call 14000** atau datang ke cabang — minta
     "aktifkan transaksi e-commerce/internasional kartu debit".
3. **Siapkan saldo** di rekening sumber: nominal + **buffer 4%** (kurs + biaya bank).
   Contoh: top-up $10 → siapkan **Rp 190.000**.
4. **Checkout di BFL:** `dashboard.bfl.ai` → **API → Credits → Add Credits** → pilih $10 →
   di halaman Stripe isi nomor kartu, masa berlaku, CVV, nama, **alamat sesuai kartu**,
   negara **Indonesia**.
5. **Selesaikan OTP 3-D Secure** yang masuk ke HP terdaftar (SMS atau notifikasi Livin).
6. **Verifikasi:** saldo kredit bertambah; mutasi di Livin muncul sebagai transaksi
   **STRIPE/BFL** dalam USD yang dikonversi ke rupiah.
7. **Simpan invoice:** **Purchase History → View Invoice** (PDF) untuk pembukuan.

**Kalau debit Mandiri ditolak:**

| Penyebab | Solusi |
|---|---|
| Kartu GPN-only | ganti kartu berlogo Visa/Mastercard di cabang |
| Transaksi online belum aktif | aktifkan via Livin/14000 |
| Limit harian < nominal | naikkan limit atau turunkan top-up ke $10 |
| 3DS gagal | pastikan nomor HP di bank masih aktif |
| Tetap gagal | pakai **kartu kredit Mandiri** (biaya forex ±2,5–3%) atau virtual card |

**Biaya tersembunyi:** konversi kurs bank **2,5–4%**; PPN 11% **hanya jika** muncul di invoice.
Tidak ada biaya langganan, tidak ada biaya per akun, tidak ada biaya pembuatan API key.

---

### 8.6 Simulasi top-up $10 (1.000 credit)

**Kapasitas $10 menurut strategi** (retry 1,5×; gagal generasi tidak ditagih BFL):

| Strategi | $/panggilan | Panggilan | Foto jadi | Credit/foto |
|---|---|---|---|---|
| **A. Klein 1K** | 0,009 | **1.111** | **±740** | 1,3 |
| B. Klein + 15% eskalasi | 0,0149 | 673 | ±449 | 2,2 |
| C. FLUX 3 Image + 20% NB 2.1 | 0,0467 | 214 | ±143 | 7,0 |
| FLUX 3 Image saja | 0,048 | 208 | ±139 | 7,2 |
| FLUX.2 [pro] 3 referensi | 0,075 | 133 | ±89 | 11,2 |

**Rencana 4 minggu dengan $10 — strategi A (Klein):**

| Minggu | Fokus | Gambar | Panggilan | Biaya | Saldo akhir |
|---|---|---|---|---|---|
| 1 | Akun, adapter, 20 prompt | 60 | 90 | $0,81 | **$9,19** |
| 2 | Face gate + perbaikan prompt | 120 | 180 | $1,62 | **$7,57** |
| 3 | A/B 50 foto + cetak A4 | 150 | 225 | $2,03 | **$5,54** |
| 4 | Demo ke user + revisi | 70 | 105 | $0,95 | **$4,60** |
| **Total** | | **400** | **600** | **$5,40** | sisa 46% |

→ $10 **cukup untuk seluruh bulan**, bahkan masih bisa menambah ±370 foto lagi.

**Rencana yang sama — strategi C (FLUX 3 Image):**

| Minggu | Gambar | Biaya | Saldo | Status |
|---|---|---|---|---|
| 1 | 60 | $4,20 | $5,80 | OK |
| 2 | 120 | $8,41 | **−$2,61** | **habis di tengah minggu 2** |
| 3 | 150 | $10,51 | −$13,12 | tidak jalan |
| 4 | 70 | $4,90 | −$18,02 | tidak jalan |

→ Dengan $10, strategi C hanya sanggup **±83 foto** (124 panggilan), yaitu 55% dari target
minggu 2. Untuk menuntaskan rencana C, top-up harus **$30**.

**Jalan tengah yang paling efisien ($10):**

| Komposisi | Foto | Biaya |
|---|---|---|
| Premium (FLUX 3 Image / NB 2.1) untuk 50 foto A/B | 50 | $3,50 |
| Klein untuk sisanya | 350 | $4,73 |
| **Total** | **400** | **$8,23** (sisa $1,77) |

Atau tanpa batas 400: 50 premium + **481 Klein** = **531 foto** dalam $10.

---

## 9. Checklist jebakan (semua sudah terverifikasi hari ini)

- [ ] Kunci API **hanya ditampilkan sekali** — simpan sebelum menutup dialog.
- [ ] Jangan pakai `VITE_*` untuk build yang dibagikan ke sekolah (kunci ikut ke bundle).
- [ ] Kredit **tidak** per project — satu kolam; pagar biaya harus di aplikasi.
- [ ] URL hasil **kedaluwarsa 10 menit** dan **tanpa CORS** → unduh & simpan segera.
- [ ] Batas **24 task aktif** → queue maks 3–4 paralel, jangan 200.
- [ ] `402` = kredit habis, `429` = antrean, `422` = moderasi. Jangan tampilkan pesan Inggris mentah.
- [ ] Demo dan produksi: **project + key berbeda**, auto top-up hanya di produksi.
- [ ] Invoice Stripe disimpan (bukti PPN/kredit pajak).
- [ ] Harga provider bisa berubah → adapter harus bisa pindah provider <1 hari.

---

## 10. Sumber (31 Okt 2026)

- `docs.bfl.ai/quick_start/get_started` — alur akun, kredit (1 credit = $0.01), API key per project.
- `docs.bfl.ai/account_management/credits_billing` — Stripe, auto top-up (ambang min $5, target +$10), invoice.
- `docs.bfl.ai/quick_start/generating_images` — endpoint asinkron, `polling_url`, URL 10 menit, batas 24 task, 402.
- `docs.bfl.ai/api-reference/utility/generate-an-image-with-flux-3` — body `prompt/images/resolution/aspect_ratio/grounding`, respons `cost/input_mp/output_mp`.
- `api.bfl.ai/openapi.json` — daftar path: `/v1/flux-3-image`, `/v1/flux-3-image-klein`, `/v1/credits`.
- `bfl.ai/pricing` — $0,048 (1K), $0,009 (Klein 1K), $0,041 (768²), $0,07 (1,5K), $0,10 (2K), $0,607 (4K).
- `fal.ai` — Nano Banana 2.1 $0,0415/edit 1K; FLUX.2 [pro] $0,03/MP + $0,015/MP tambahan.
- Kurs: `kursdollar.org` & Danamon, 28–30 Okt 2026.
