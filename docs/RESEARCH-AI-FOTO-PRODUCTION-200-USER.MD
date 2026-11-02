# RISET — AI Foto Dokumentasi untuk Produksi: FLUX, Alternatif, dan Biaya 200 User/Tahun

> Disusun 2026-10-31. Harga = daftar publik yang dicek langsung hari ini (bfl.ai, fal.ai,
> runpod.io). Kurs asumsi **Rp 18.100/USD** (rentang bank 28–30 Okt 2026: 17.900–18.260).
> Dokumen ini BUKAN keputusan; keputusan tetap di user (AGENTS.MD).

---

## 0. Ringkasan Eksekutif (5 temuan)

1. **Biaya API bukan masalah pada skala 200 user.** Skenario dasar (36 foto/user/tahun,
   7.200 foto diterima) berbiaya **$97–$1.620/tahun** tergantung model — yaitu
   **Rp 1,8–29 juta/tahun**, atau **Rp 8.800–Rp 146.000 per sekolah/tahun**.
   Biaya terbesar justru **development, QA, dan dukungan**, bukan token gambar.
2. **FLUX.2 [pro] bukan pilihan termurah untuk kasus ini** karena menagih **setiap
   megapiksel input** ($0,015/MP). Tiga foto referensi (wajah + ruangan + owner) menambah
   $0,03–0,045 per gambar → biaya hampir dua kali lipat dari yang terlihat di headline.
3. **Kualitas wajah (identity consistency) bukan kekuatan utama FLUX.** Untuk "wajah guru
   yang sama muncul di foto", model yang secara resmi mengklaim konsistensi karakter
   (Nano Banana 2.1: 4 karakter/10 objek, 14 referensi) lebih tepat daripada FLUX.
   Rekomendasi: **routing** — draft murah (FLUX 3 Klein $0,009) → gate kemiripan wajah →
   eskalasi hanya yang gagal (Nano Banana 2.1 $0,0415).
4. **Resolusi 1K sudah cukup.** Foto dicetak di A4 pada ±60×40 mm (≈170 dpi). 2K/4K hanya
   menaikkan biaya 2–13× tanpa tambahan yang terlihat di kertas.
5. **Risiko terbesar bukan teknis, tapi kepatuhan.** Foto sintetis yang dipakai sebagai
   *bukti realisasi* dalam LPJ BOS berpotensi dianggap **bukti palsu** saat audit, dan wajah
   guru = **data pribadi biometrik** (UU PDP 27/2022). Ini harus diputuskan produk sebelum
   coding, bukan setelah rilis. Lihat §2.

---

## 1. Peta Model & Harga Terverifikasi (31 Okt 2026)

### 1.1 FLUX (Black Forest Labs)

| Model | Harga | Catatan |
|---|---|---|
| FLUX 3 Image — 768² | $0,041/gambar | t2i + i2i, tier resolusi dipilih di request |
| FLUX 3 Image — 1K | **$0,048** | ≈1 MP, cukup untuk cetak A4 |
| FLUX 3 Image — 1,5K | $0,070 | ≈2 MP |
| FLUX 3 Image — 2K | $0,100 | ≈4 MP |
| FLUX 3 Image — 4K | $0,607 | ≈16 MP, tidak relevan untuk LPJ |
| FLUX 3 Image Klein — 768² | $0,008 | open weights, 5,6B, bisa 1 GPU konsumen |
| FLUX 3 Image Klein — 1K | **$0,009** | termurah yang masih "frontier-adjacent" |
| FLUX 3 Image Klein — 1,5K / 2K / 4K | $0,011 / $0,014 / $0,036 | |
| FLUX.2 [pro] (fal) | **$0,03 MP pertama + $0,015/MP input & output tambahan** | 1024²=$0,03; 1920×1080=$0,045 **tanpa** referensi |
| FLUX.2 [pro] + 3 referensi | ±**$0,06–0,075** | 2–3 MP input ikut ditagih |
| FLUX.1 schnell (hosted) | $0,003 | Apache 2.0; tanpa referensi wajah yang baik |
| FLUX.1 [dev] (hosted) | ±$0,02/MP | **non-komersial** tanpa lisensi BFL |

Sumber: `bfl.ai/pricing` (tabel FLUX 3 Image & Klein, termasuk lisensi open weights) dan
`fal.ai/models/fal-ai/flux-2-pro` (skema per-MP). Harga BFL vs fal untuk model yang sama
bisa berbeda tipis — selalu cek dua-duanya sebelum menandatangani volume.

**Catatan lisensi:** FLUX 3 Image Klein dipasarkan sebagai open weights, tetapi BFL menjual
lisensi komersial terpisah (Builder 10K gambar/bulan, Platform 100K gambar/bulan, dst.,
harga "contact sales"). **Jangan menganggap "open weights" = bebas komersial** tanpa membaca
`bfl.ai/open-weights`. FLUX.1 [dev] jelas non-komersial tanpa kunci lisensi.

### 1.2 Alternatif (harga fal.ai, dicek 31 Okt 2026)

| Model | Harga | Kekuatan | Kelemahan |
|---|---|---|---|
| **Nano Banana 2.1** (Gemini 3 Pro Image family) | **$0,0396** t2i 1K · **$0,0415** edit 1K · 2K $0,0593 · 4K $0,1335 | konsistensi 4 karakter/10 objek, **14 referensi**, teks bagus, SynthID | harga naik linear per resolusi; kebijakan likeness ketat |
| Nano Banana Pro | $0,15 flat (4K ×2) | kualitas tertinggi Google, 14 referensi | 3,6× lebih mahal dari 2.1, Elo lebih rendah dari 2.1 menurut fal |
| **Seedream 5 Pro** (ByteDance) | dari **$0,0675** | hingga **10 referensi**, 2K, layer editing | harga "from", bisa naik sesuai setelan |
| Qwen Image 3 | **$0,075** flat | 1–3 referensi, 2K, detail tekstur kuat | referensi sedikit, bukan spesialis wajah |
| GPT Image 2.5 | 1024×768: low $0,0041 · med $0,0091 · high $0,0362 · **edit med $0,0174 / high $0,0445** | 16 referensi, instruksi sangat patuh, mask | high mahal; gaya agak "render" |
| Imagen 4 | Fast $0,02 · Std $0,04 · Ultra ~$0,12 (batch −50%) | teks dalam gambar terbaik | referensi wajah terbatas |
| FLUX.1 schnell | $0,003 | termurah | bukan untuk wajah spesifik |

**Kesimpulan harga:** untuk kebutuhan "foto dokumentasi realistis dengan wajah orang yang
sama", **kombinasi termurah yang masih berkualitas** = FLUX 3 Klein (draft) + Nano Banana 2.1
(eskalasi). Model premium (Nano Banana Pro) hanya untuk 1–2 foto "hero" bila perlu.

---

## 2. Peringatan Kepatuhan (WAJIB diputuskan sebelum coding)

Ini bukan catatan hukum formal, tapi risiko yang harus disadari dan diputuskan sadar:

1. **Bukti audit.** Foto dokumentasi dalam LPJ BOS adalah bukti realisasi kegiatan. Foto
   sintetis yang diposisikan sebagai bukti dapat dianggap **pemalsuan dokumen** oleh auditor
   (BPK/Inspektorat) atau pihak lain. Rekomendasi produk:
   - beri label **"ILUSTRASI AI"** yang ikut tercetak di bawah foto (bukan hanya metadata),
   - simpan kolom `is_ai=1` + `model` + `prompt_hash` di SQLite,
   - **jangan** izinkan AI menggantikan slot "foto asli" pada dokumen yang diaudit tanpa
     penanda; sediakan tombol "unggah foto asli" sebagai jalur utama.
2. **Data pribadi biometrik.** Wajah guru = data pribadi spesifik (UU PDP 27/2022). Perlu
   persetujuan tertulis per orang, kebijakan retensi, dan dasar transfer lintas negara
   (provider AS). Simpan foto referensi **lokal** bila memungkinkan; kirim hanya bila perlu.
3. **Kebijakan provider.** Google/OpenAI/BFL membatasi pembuatan gambar orang nyata tanpa
   persetujuan, dan sebagian menolak prompt berwajah tokoh publik. Uji 20 prompt nyata ke
   provider pilihan **sebelum** membangun UI; jangan menemukan blokir ini di hari rilis.
   Kebijakan dapat berubah sewaktu-waktu → adapter harus bisa ganti provider dalam <1 hari.
4. **Watermark provenance.** Nano Banana menyisipkan SynthID; C2PA tersedia di beberapa
   pipeline. Manfaatkan sebagai bukti "ini ilustrasi", bukan disembunyikan.

Jika user memutuskan fitur ini **hanya untuk ilustrasi non-audit** (cover, banner, materi
sosialisasi), seluruh risiko di atas turun drastis dan biaya tetap sama.

---

## 3. Konsep Integrasi di Produksi (Electron + SQLite)

### 3.1 Arsitektur

```
Renderer (React)  ──IPC──►  Main (Electron)
                              ├─ aiFotoService.js      ← adapter provider
                              ├─ queue (1 job/user, 3 global, AbortController = tombol Stop)
                              ├─ faceGate (InsightFace ONNX lokal)  ← cosine ≥ 0,45
                              ├─ costLedger (SQLite log_ai)
                              ├─ quota (SQLite ai_kuota per sekolah/tahun)
                              └─ berkas/ (foto disimpan sebagai file, bukan base64 di DB)
```

Prinsip yang sudah dipakai proyek ini dipertahankan: **satu sumber data**, UI tetap sama,
hanya lapisan penyedia yang ditukar.

### 3.2 Adapter (satu antarmuka, banyak provider)

```js
// aiFotoService.js — bentuk kontrak, bukan implementasi final
async function generate({ prompt, refs, size = '1K', model = 'auto', signal }) {}
// model: 'draft' (FLUX 3 Klein) | 'quality' (Nano Banana 2.1) | 'flux-pro' | 'puter' (demo)
```

- **Kunci API di main process**, disimpan via `safeStorage` (DPAPI Windows). Tidak ada
  `VITE_*` di bundle — ini menutup temuan lama `aiConfig.js` yang membocorkan kunci.
- **Provider gateway**: satu kunci fal.ai bisa merutekan FLUX, Nano Banana, Seedream, Qwen;
  BFL langsung dipakai bila harga FLUX 3 lebih murah dan volume sudah stabil.
- **Idempoten**: hash(`prompt + refs + size + model`) → cache; regenerasi prompt sama = $0.
  Hemat realistis 10–20% karena user sering menekan ulang.

### 3.3 Routing hemat + gate wajah (inti penghematan)

```
1. Generate draft  : FLUX 3 Klein 1K            $0,009
2. Face gate lokal : cosine(generated, ref) ≥ 0,45 ?
   ├─ lulus  → selesai
   └─ gagal  → ulang draft sekali               $0,009
3. Masih gagal     : Nano Banana 2.1 edit 1K    $0,0415
4. Masih gagal     : tampilkan "pakai foto asli / coba lagi" (jangan pura-pura sukses)
```

Biaya per foto diterima (asumsi 40% eskalasi): **2×$0,009 + 0,4×$0,0415 = $0,0346**.
Face gate berjalan **offline** (InsightFace/ArcFace ONNX, gratis) — tidak menambah biaya API.

### 3.4 Kuota & pagar biaya

- Kuota default **60 foto AI/sekolah/tahun** (cukup untuk 20 kegiatan × 3 slot), dapat diubah
  admin. Lewat kuota → tombol nonaktif + pesan jelas, bukan error provider.
- **Cap bulanan global** (mis. $50/bulan) di `log_ai`; jika terlampaui → hanya model draft.
- Log setiap panggilan: `model, mp, usd, durasi, status, face_score` → laporan bulanan.
- Timeout 90 s + retry 2× (backoff 2 s/6 s). Kegagalan provider **tidak** boleh menghasilkan
  placeholder diam-diam (perilaku lama `generateWithPuter`).

### 3.5 Cetak & penyimpanan

- Simpan **file JPEG** di `%APPDATA%/spj-app/berkas/foto/<sekolah>/<tahun>/<uuid>.jpg`;
  SQLite hanya menyimpan path + metadata (sesuai skema sprint-021: tabel `berkas`).
- Ukuran cetak: 1K (1024×768) sudah ≈170 dpi pada 60×40 mm. Turunkan kualitas JPEG ke 85 →
  ±180 KB/foto. 7.200 foto ≈ **1,3 GB/tahun** untuk 200 sekolah (file, bukan localStorage).
- Backup 3 lapis yang sudah direncanakan otomatis mencakup folder `berkas/`.

---

## 4. Simulasi 200 User / Tahun

### 4.1 Asumsi (dinyatakan terbuka)

| Parameter | Nilai dasar | Rentang |
|---|---|---|
| Sekolah aktif | 200 | — |
| Kegiatan LPJ/sekolah/tahun | 12 | 8–20 |
| Foto AI per kegiatan | 3 (penyerahan, rapat, produk) | 2–5 |
| Foto diterima/tahun | **7.200** | 4.000 (rendah) – 12.000 (tinggi) |
| Panggilan API per foto diterima | 1,5 (retry + regenerasi) | 1,2–2,0 |
| Panggilan API/tahun | **10.800** | 6.000 – 18.000 |

### 4.2 Biaya API per tahun (skenario dasar 7.200 foto diterima)

| Strategi | $/tahun | Rp/tahun | Rp/sekolah/tahun |
|---|---|---|---|
| FLUX.1 schnell | 32 | 0,6 jt | 2.900 |
| **Routing: Klein → NB 2.1 (rekomendasi)** | **249** | **4,5 jt** | **22.500** |
| FLUX 3 Klein saja (1K) | 97 | 1,8 jt | 8.800 |
| GPT Image 2.5 medium (edit) | 188 | 3,4 jt | 17.000 |
| Imagen 4 Fast | 216 | 3,9 jt | 19.600 |
| **FLUX 3 Image 1K** | **518** | **9,4 jt** | **46.900** |
| Nano Banana 2.1 (semua foto) | 448 | 8,1 jt | 40.600 |
| FLUX.2 [pro] + 2 MP referensi | 648 | 11,7 jt | 58.600 |
| Seedream 5 Pro | 729 | 13,2 jt | 66.000 |
| Qwen Image 3 | 810 | 14,7 jt | 73.300 |
| Nano Banana Pro | 1.620 | 29,3 jt | 146.500 |

### 4.3 Sensitivitas volume (routing campuran, $0,0346/foto diterima)

| Skenario | Foto diterima | Panggilan | $/tahun | Rp/tahun | Rp/sekolah |
|---|---|---|---|---|---|
| Rendah | 4.000 | 6.000 | 208 | 3,8 jt | 18.800 |
| **Dasar** | **7.200** | **10.800** | **249** | **4,5 jt** | **22.500** |
| Tinggi | 12.000 | 18.000 | 623 | 11,3 jt | 56.400 |

**Baca angka ini:** bahkan skenario tinggi + model premium (FLUX 3 Image) hanya
±Rp 17 juta/tahun untuk 200 sekolah. **Kesimpulan: jangan optimasi harga API sampai
mengorbankan kualitas; optimasi yang benar adalah retry rate dan resolusi.**

### 4.4 Kalau memilih self-host (FLUX 3 Klein, open weights)

- RunPod RTX 4090 **$0,89/jam** (L40S $1,09; A100 80GB $1,79; H100 $2,89).
- 7.200 gambar × ±3 s/gambar ≈ 6 jam GPU ≈ **$5,3/tahun** — tampak gratis, tapi:
  - lisensi komersial Klein tetap perlu diverifikasi ke BFL;
  - butuh ops (deploy, model update, monitoring, cold start) ±2–3 hari/bulan;
  - tidak ada SLA; kegagalan = fitur mati.
- **Verdict: tidak layak di 200 user.** Self-host baru masuk akal >100 ribu gambar/bulan
  atau bila data tidak boleh keluar dari Indonesia.

---

## 5. Biaya Development, Demo, dan Produksi (terpisah)

Asumsi tarif builder **Rp 800.000/hari** (rentang pasar Rp 500 rb–1,5 jt). Vendor/agensi
≈ **2,5×** angka in-house. Biaya gambar uji dihitung terpisah karena itu biaya riil.

| Tahap | Isi | Hari | Dev (Rp) | Gambar uji (Rp) | Total (Rp) |
|---|---|---|---|---|---|
| **F0 — Riset & A/B** | 50 foto nyata × 4 model, ukur face score + penilaian mata | 2 | 1,6 jt | 0,15 jt (200 img) | **1,75 jt** |
| **F1 — Demo/PoC** | 1 provider, tanpa face gate, UI sementara, 1 sekolah contoh | 4 | 3,2 jt | 0,33 jt (500 img) | **3,5 jt** |
| **F2 — Produksi inti** | adapter 2 provider, queue, Stop, face gate, kuota, ledger, C2PA/label, IPC main | 12 | 9,6 jt | 0,94 jt (1.500 img) | **10,5 jt** |
| **F3 — Hardening** | uji cetak A4, offline/retry, perangkat sekolah, QA 3 mesin, dokumentasi | 5 | 4,0 jt | 0,31 jt (500 img) | **4,3 jt** |
| **Total pengembangan** | F0–F3 | **23** | **18,4 jt** | **1,73 jt** | **±20,1 jt** |

| Pos berulang (tahun ke-1) | Rp/tahun |
|---|---|
| API gambar (routing, skenario dasar) | 4,5 jt |
| Pemeliharaan (12 hari: provider berubah, bug, kuota) | 9,6 jt |
| **Total tahun-1 (in-house)** | **±34 jt** (≈ $1.880) |
| Jika vendor/agensi (dev ×2,5) | ±50 jt + ops 14 jt ≈ **64 jt** |

**Pemisahan demo vs produksi (wajib):**

| Aspek | Demo | Produksi |
|---|---|---|
| Kunci API | kunci terpisah, cap **$20/bulan** | kunci produksi, `safeStorage` |
| Data | SQLite demo + 1 sekolah fiktif | `%APPDATA%` user, backup 3 lapis |
| Model | Puter (user-pays, $0) atau Klein saja | routing Klein → NB 2.1 |
| Label | bebas | "ILUSTRASI AI" + C2PA + `is_ai=1` |
| Telemetri | log lokal | `log_ai` + laporan biaya bulanan |

Biaya sekali untuk demo: **±Rp 3,5 jt** (F1) — jangan pernah memakai kunci produksi untuk
demo; kebocoran kunci demo adalah kebocoran tagihan.

---

## 6. Rekomendasi (berurut)

**Opsi A — "Murah tapi wajah paling mirip" (REKOMENDASI)**
Routing FLUX 3 Klein 1K → gate wajah → Nano Banana 2.1 1K untuk yang gagal.
Biaya **Rp 22.500/sekolah/tahun**, kualitas cetak A4 cukup, konsistensi wajah terbaik per
dolar. Butuh 2 provider + face gate lokal.

**Opsi B — "FLUX murni" (kalau wajib satu vendor)**
FLUX 3 Image 1K ($0,048) untuk semua foto, atau FLUX.2 [pro] hanya bila butuh multi-referensi
kompleks — ingat biaya MP input. Biaya **Rp 47–59 ribu/sekolah/tahun**, kualitas fotoreal
sangat baik, konsistensi wajah di bawah Opsi A.

**Opsi C — "Kualitas maksimum, volume kecil"**
Nano Banana Pro hanya untuk 1 foto utama per kegiatan (12/sekolah/tahun), sisanya Klein.
Biaya ±Rp 33 ribu/sekolah/tahun, hasil terbaik untuk foto yang benar-benar dilihat orang.

**Yang TIDAK direkomendasikan:** self-host di 200 user; 4K; FLUX.1 [dev] tanpa lisensi;
menyimpan gambar base64 di SQLite; satu kunci API untuk demo + produksi.

---

## 7. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Foto AI dianggap bukti palsu saat audit | **Tinggi** (reputasi/legal) | label tercetak + `is_ai`, jalur utama tetap foto asli, keputusan produk tertulis |
| Provider melarang wajah orang nyata | Tinggi (fitur mati) | uji 20 prompt nyata sebelum UI; adapter multi-provider; siap LoRA berlisensi |
| Wajah tidak mirip → user kecewa | Sedang | face gate + eskalasi + pesan jujur; fallback unggah foto asli |
| Harga provider berubah | Rendah | adapter + kunci per-provider; review kuartalan |
| Kuota habis di tengah LPJ | Sedang | kuota per sekolah + indikator sisa + mode draft |
| Data biometrik bocor | Tinggi | foto referensi lokal, enkripsi disk, retensi, consent |
| Biaya membengkak karena retry | Rendah | cap bulanan, cache hash, log biaya |

---

## 8. Langkah Berikut (usulan, butuh persetujuan)

1. **Putuskan posisi fitur** (§2): ilustrasi non-audit, atau dokumentasi dengan label wajib.
2. Jalankan **F0** (2 hari, ±Rp 1,75 jt): 50 foto nyata × Klein / FLUX 3 Image / NB 2.1 /
   Seedream 5 → ukur cosine + penilaian mata. Ini menghapus semua tebakan kualitas.
3. Baru susun REQUIREMENTS + BLUEPRINT (pack terpisah dari sprint-021 migrasi Electron).
4. Demo F1 dengan kunci terpisah dan cap $20.

---

## 9. Lampiran keputusan — Hosting model sendiri vs provider API

**Jawaban singkat: pakai provider API. Jangan hosting sendiri di 200 sekolah.**

### 9.1 Angka pada volume nyata (600 gambar/bulan)

| Jalur | Biaya/bulan | Biaya/tahun | Per gambar |
|---|---|---|---|
| **API (routing Klein → NB 2.1)** | **$20,8** | **$249** | **$0,0346** |
| GPU 4090 24/7 (RunPod $0,89/jam) | $649,7 | $7.796 | $1,08 |
| Serverless 4090 (6 s/gambar, $1,34/jam) | $1,3 | $16 | $0,0022 |
| Serverless + tenaga ops (1 hari/bulan) | ±$45 | ±$540 | ±$0,075 |

Angka di atas menjelaskan dua hal yang sering salah dibaca:

- **GPU 24/7 = 31× lebih mahal** dari API pada volume ini, karena bayar idle 730 jam/bulan
  untuk 600 gambar. Titik impasnya ±**18.800 gambar/bulan** (≈6.200 sekolah).
- **Serverless terlihat nyaris gratis**, tapi belum termasuk tenaga: deploy, update model,
  monitoring, retry, patch keamanan, dan on-call. Dengan 1 hari/bulan saja (±Rp 800 rb),
  totalnya ±$45/bulan → titik impas ±**2.580 gambar/bulan** (≈860 sekolah).

**Kesimpulan: di 200 sekolah, provider lebih murah 4–31× dan tanpa risiko operasional.**

### 9.2 Alasan non-biaya (lebih menentukan)

| Aspek | Provider API | Hosting sendiri |
|---|---|---|
| Kualitas model | selalu versi terbaru (FLUX 3) | terkunci di bobot yang diunduh |
| Lisensi | sudah termasuk di harga API | Klein perlu lisensi komersial BFL; [dev] non-komersial |
| Infrastruktur | tidak ada | GPU, storage bobot ±11 GB, autoscaling, monitoring |
| Latency | 3–15 s | cold start 10–40 s (bobot 5,6B) |
| Keandalan | SLA provider | Anda yang jaga 24/7 |
| Offline | butuh internet saat generate | tetap butuh GPU ≥12 GB VRAM — laptop sekolah umumnya tidak sanggup |
| Skala 200→2.000 | biaya ikut volume saja | perlu kapasitas + orang |

**Argumen "offline" tidak menyelamatkan self-host:** FLUX 3 Klein 5,6B butuh ±11 GB bobot
dan VRAM kelas RTX 4090. Laptop operator sekolah (Intel/AMD iGPU) tidak bisa. Alternatif
offline yang realistis: **cache hasil** + antrean tulis saat internet kembali (sudah ada di
rencana adapter sprint-021), bukan model lokal.

### 9.3 Bentuk integrasi yang dipilih

```
Electron main  →  adapter  →  fal.ai (kunci utama, 1 kunci untuk FLUX/NB/Seedream/Qwen)
                          └→  BFL langsung (failover / harga FLUX 3 lebih murah)
```

- **Tidak ada server sendiri.** Kunci disimpan di main process (`safeStorage`), renderer
  tidak pernah melihatnya → tidak butuh proxy.
- Kalau kelak ada versi web, baru perlu proxy tipis (Cloudflare Worker, gratis–$5/bulan)
  untuk menyembunyikan kunci — bukan GPU.
- **"Langganan" provider FLUX sebenarnya bukan langganan**: BFL/fal menagih *pay-per-use*
  (prepaid credit). Yang berbentuk komitmen hanya *committed-use/enterprise* (diskon volume,
  perlu negosiasi) — baru relevan >100 ribu gambar/bulan.

### 9.4 Kapan self-host masuk akal (syarat, bukan opini)

1. volume **>100 ribu gambar/bulan** (≈2.800 sekolah), atau
2. ada **mandat data residency** (foto tidak boleh keluar Indonesia) — sewa GPU di DC
   Indonesia, dan terima konsekuensi ops, atau
3. butuh **LoRA/fine-tune** yang benar-benar spesifik dan sudah terbukti menaikkan
   kemiripan wajah pada uji F0, atau
4. ada **SLA internal** yang menuntut kontrol penuh (mis. integrasi ke sistem pemda).

Sebelum salah satu dari empat syarat itu terpenuhi, self-host adalah biaya tetap yang
menggantikan biaya variabel yang lebih murah.

---

## 10. Sumber (dicek 31 Okt 2026)

- `bfl.ai/pricing` — FLUX 3 Image & FLUX 3 Image Klein per tier resolusi; lisensi open weights.
- `bfl.ai/open-weights` — tier lisensi komersial (Builder/Platform/Professional/Enterprise).
- `fal.ai/models/fal-ai/flux-2-pro` — $0,03 MP pertama + $0,015/MP tambahan (input & output).
- `fal.ai/nano-banana-2.1` — $0,0396/0,0415 (1K), $0,0593/0,0613 (2K), 14 referensi, 4 karakter.
- `fal.ai/models/fal-ai/nano-banana-pro/edit` — $0,15 flat, 4K ×2, SynthID.
- `fal.ai/qwen-image-3` — $0,075 flat, 1–3 referensi, 2K.
- `fal.ai/seedream-5.0` — Pro dari $0,0675, 10 referensi, 2K.
- `fal.ai/gpt-image-2.5` — matriks harga per ukuran/kualitas (diukur 8 Sep 2026).
- `runpod.io/pricing` — 4090 $0,89/jam, L40S $1,09, A100 $1,79, H100 $2,89; endpoint FLUX schnell $0,0024/MP.
- `aiimagegenerationapi.com` — ringkasan harga lintas provider (Juli 2026), catatan lisensi FLUX [dev].
- Kurs: `kursdollar.org` / Danamon, 28–30 Okt 2026 (17.900–18.260).

**Batas riset ini (jujur):** tidak ada benchmark wajah yang dijalankan sendiri; klaim
konsistensi karakter berasal dari dokumentasi provider. Harga dapat berubah tanpa notice.
Angka throughput self-host (±3 s/gambar) adalah estimasi, bukan hasil ukur.
