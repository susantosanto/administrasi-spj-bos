# KEPUTUSAN DIKUNCI — Sprint 022: Optimize Generate Dokumen AI

> **Status: LOCKED (beku) sejak 2026-10-31.** File ini mengikat implementasi fitur
> generate dokumen/foto AI. Semua angka harga dicek langsung dari sumber resmi pada
> 31 Okt 2026 (BFL docs, fal.ai, RunPod) — lihat `docs/PANDUAN-FLUX-LANGGANAN-INTEGRASI.MD`
> dan `docs/RESEARCH-AI-FOTO-PRODUCTION-200-USER.MD` untuk bukti lengkap.
>
> **WAJIB DIBACA sebelum menyentuh:** `src/services/imageGenerator.js`,
> `src/components/dokumentasi/DokumentasiAIGenerate.jsx`,
> `src/components/bku/SidebarPbj.jsx`, `src/services/puterAkun.js`.
> Mengubah keputusan di sini = melanggar AGENTS.MD (butuh persetujuan user + entri baru
> di `DECISIONS.MD`).

---

## 0. Cara memakai file ini

1. Baca file ini **sebelum** dry run, bukan sesudah.
2. Setiap deviasi harus: (a) ditulis alasannya, (b) disetujui user, (c) dicatat di
   `DECISIONS.MD` dan di file ini sebagai `D-xx (revisi)`.
3. Angka biaya di sini adalah **acuan anggaran**. Kalau harga provider berubah, perbarui
   angka + tanggal, jangan diam-diam memakai angka lama.
4. Jika ragu antara dua pilihan: pilih yang **lebih murah dan lebih jujur ke user**
   (label AI, fallback unggah foto asli), bukan yang menghasilkan gambar lebih bagus.

---

## 1. Keputusan arsitektur & provider

| ID | Keputusan | Alasan ringkas |
|---|---|---|
| **D-01** | Produksi memakai **provider API**, **bukan** self-host GPU | Di 200 sekolah, API Rp 4,5–9,4 jt/tahun vs GPU 24/7 Rp 140 jt/tahun (31×). Titik impas self-host ±860 sekolah (serverless) / ±6.200 (pod 24/7) |
| **D-02** | Provider utama **Black Forest Labs** (`api.bfl.ai`), kredit prabayar **1 credit = $0,01** | Tanpa langganan bulanan, tanpa server, kunci per project |
| **D-03** | Provider kedua **fal.ai** — hanya untuk model yang tidak ada di BFL (Nano Banana 2.1) | Satu kunci bisa merutekan beberapa model; wajib punya jalur cadangan |
| **D-04** | **Model default: FLUX 3 Image Klein 1K** ($0,009 = Rp 163) | 5,3× lebih murah dari FLUX 3 Image; cukup untuk cetak 60×40 mm |
| **D-05** | **Eskalasi: FLUX 3 Image 1K** ($0,048 = Rp 869) — **bukan** FLUX.2 [pro] | FLUX 3 Image menagih referensi **gratis**; FLUX.2 [pro] menagih $0,015/MP per referensi → 1,56× lebih mahal untuk pipeline 3 referensi |
| **D-06** | FLUX.2 [pro] hanya boleh dipakai jika **A/B 50 foto membuktikan** kemiripan wajah menang jelas | Tanpa bukti, biaya naik tanpa nilai tambah |
| **D-07** | **Resolusi 1K**, output **1152×864** (0,995 MP) | 2K/4K tidak terlihat di kertas A4 dan menaikkan biaya 2–13×; 1344×1008 dibulatkan ke 2 MP (+50%) |
| **D-08** | **Face gate lokal** (InsightFace/ArcFace ONNX), ambang **cosine ≥ 0,45**; retry maks **2** | Gate offline gratis; mencegah eskalasi mahal untuk foto yang sudah bagus |
| **D-09** | Referensi: maks **3** saat produksi (wajah, ruangan, owner), maks **2** saat dev | Tiap referensi menambah biaya di FLUX.2 [pro] dan menambah risiko wajah kabur |
| **D-10** | **Queue maks 3 paralel** + `AbortController` (tombol Stop) | Batas BFL 24 task aktif; Stop harus benar-benar membatalkan, bukan menyembunyikan |
| **D-11** | **Kunci API hanya di main process** (Electron `safeStorage`/DPAPI). `VITE_*` dilarang untuk build yang dibagikan | Kunci di bundle = kunci publik; menutup temuan lama `aiConfig.js` |
| **D-12** | **Demo dan produksi terpisah**: project + API key berbeda, kredit satu kolam | Auto top-up hanya di produksi; demo tidak boleh bisa menghabiskan saldo |
| **D-13** | **Cache hash**(`prompt + refs + model + size`) → regenerasi identik = $0 | Hemat realistis 10–20% |
| **D-14** | **Log biaya per panggilan**: `cost`, `input_mp`, `output_mp`, `model`, `face_score`, durasi → tabel `log_ai` | Respons BFL sudah memuat `cost` (credit); tanpa log, anggaran tidak bisa diaudit |
| **D-15** | Foto disimpan sebagai **file** di `%APPDATA%/spj-app/berkas/foto/...`; SQLite/localStorage hanya path + metadata | Base64 di DB = DB bengkak, backup lambat |
| **D-16** | Kuota **60 foto AI/sekolah/tahun** + cap bulanan **$50** | Pagar biaya harus di aplikasi karena kredit satu kolam |
| **D-17** | Setiap foto AI wajib **`is_ai=1`** + label tercetak **"ILUSTRASI AI"**; jalur utama tetap **unggah foto asli** | Foto sintetis sebagai bukti LPJ berisiko dianggap bukti palsu saat audit; wajah = data biometrik (UU PDP) |
| **D-18** | Kegagalan API **tidak boleh** menghasilkan placeholder diam-diam; tampilkan pesan + tombol "unggah foto asli" | Perilaku lama `generateWithPuter` (canvas placeholder) menyesatkan user |
| **D-19** | Prompt FLUX.2/FLUX 3 **tanpa kalimat negatif** ("jangan mengubah wajah" → tulis positif) | FLUX.2 tidak mendukung negative prompt; kalimat larangan bisa menambah objek terlarang |
| **D-20** | **CORS**: web demo pakai fal/proxy tipis; produksi Electron pakai `net.fetch` di main. **Dilarang** membangun server hanya untuk CORS | `delivery.*.bfl.ai` tanpa CORS; URL hasil kedaluwarsa 10 menit |
| **D-21** | Pembayaran: BFL via **Stripe**, kartu **Mandiri Visa/Mastercard** (GPN-only tidak bisa); top-up minimum praktis **$10** | Tanpa langganan; auto top-up ambang minimum $5, target ≥ ambang+$10 |
| **D-22** | **Dilarang** mengubah `templateConfig.js`, blok cetak, dan layout A4 untuk keperluan fitur AI ini | Fitur AI hanya menambah foto; cetak & aturan bisnis tidak boleh berubah |

---

## 2. Angka anggaran yang dikunci

### 2.1 Biaya per gambar (31 Okt 2026, kurs Rp 18.100)

| Model | $/panggilan | Rp/panggilan | Catatan |
|---|---|---|---|
| FLUX 3 Klein 1K | 0,009 | 163 | default |
| FLUX 3 Image 1K | 0,048 | 869 | referensi gratis |
| FLUX.2 [pro] 1 MP + 3 ref | 0,075 | 1.358 | referensi $0,015/MP |
| Nano Banana 2.1 1K edit (fal) | 0,0415 | 751 | eskalasi wajah alternatif |

### 2.2 Anggaran development + demo (1 bulan, tanpa tenaga kerja)

| Pos | Nominal | Rupiah (+3,5% kurs) | Status |
|---|---|---|---|
| Top-up demo (strategi hemat A/B) | **$10** | **Rp 187.000** | **DIKUNCI sebagai anggaran default** |
| Top-up premium (strategi C) | $30 | Rp 562.000 | hanya jika demo menuntut |
| Top-up FLUX.2 [pro] | $50 | Rp 937.000 | **tidak disarankan** |

**Kapasitas $10:** Klein ±740 foto (1.111 panggilan) · campuran Klein+15% eskalasi ±449 foto ·
FLUX 3 Image ±143 foto. Rencana 4 minggu 400 foto selesai dengan **$5,40** (sisa 46%).

### 2.3 Produksi (200 sekolah/tahun, 7.200 foto diterima, 10.800 panggilan)

| Strategi | API/tahun | +PPN 11% |
|---|---|---|
| Klein saja | Rp 1,76 jt | Rp 1,95 jt |
| **Routing Klein → FLUX 3 Image** | **Rp 4,51–9,38 jt** | Rp 5,0–10,4 jt |

---

## 3. Gate implementasi (harus lulus sebelum coding dianggap selesai)

- [ ] G-1 `imageGenerator.js`: `case 'bfl'` ada; `case 'puter'` **tetap** ada (fallback demo).
- [ ] G-2 Tidak ada `VITE_*KEY` baru di kode yang dibagikan; kunci dibaca dari main process.
- [ ] G-3 `cost`/`input_mp`/`output_mp` tercatat untuk setiap panggilan sukses.
- [ ] G-4 Face gate berjalan offline dan hasilnya masuk log.
- [ ] G-5 Kuota + cap bulanan menolak dengan pesan Indonesia, bukan error provider mentah.
- [ ] G-6 Label "ILUSTRASI AI" tercetak + `is_ai=1` tersimpan.
- [ ] G-7 Tidak ada perubahan pada `templateConfig.js` / blok cetak (D-22).
- [ ] G-8 `npm run build` exit 0; oracle yang ada tetap PASS.
- [ ] G-9 Uji A/B 50 foto dijalankan **sebelum** memilih model final (D-06).

---

## 4. Yang secara eksplisit DILARANG

1. Self-host GPU / menjalankan FLUX di server sendiri (D-01).
2. Menjadikan FLUX.2 [pro] sebagai model default (D-06).
3. Resolusi 2K/4K untuk foto LPJ (D-07).
4. Menyimpan kunci API di `VITE_*` atau di repo (D-11).
5. Memakai kunci produksi untuk demo (D-12).
6. Placeholder canvas sebagai pengganti kegagalan API (D-18).
7. Menyembunyikan bahwa foto dihasilkan AI (D-17).
8. Mengubah template cetak demi fitur AI (D-22).
9. Menyalakan auto top-up di project demo (D-12).
10. Memakai kartu GPN-only untuk pembayaran BFL (D-21).

---

## 5. Rujukan

- `docs/RESEARCH-AI-FOTO-PRODUCTION-200-USER.MD` — riset harga, self-host vs API, biaya 200 user.
- `docs/PANDUAN-FLUX-LANGGANAN-INTEGRASI.MD` — langkah daftar/bayar, integrasi kode, simulasi $10, Mandiri.
- `docs/PANDUAN-FLUX-2-PRO.md` — parameter, prompting, biaya FLUX.2 [pro].
- `DECISIONS.MD` — ADR 2026-10-31 (entri Sprint 022).
- Sumber harga: `bfl.ai/pricing`, `docs.bfl.ai/quick_start/pricing`, `fal.ai/*`, `runpod.io/pricing`.
