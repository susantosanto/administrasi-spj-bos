# 🔬 RESEARCH: Apakah Aplikasi Menjadi Berat Jika Dikonversi ke Electron + SQLite?

*Tanggal: 3 Agustus 2026 | Status: RESEARCH*
*Kontek: Migrasi produksi SPA (React + Vite + localStorage) → Electron + SQLite*

---

## 1. Ringkasan Eksekutif (Jawaban Langsung)

**TIDAK — aplikasi TIDAK akan menjadi "sangat berat" jika dikonversi ke Electron + SQLite,**
**dengan satu catatan penting: yang "berat" adalah platform Electron-nya, bukan aplikasi Anda.**

| Pertanyaan | Jawaban Singkat |
|---|---|
| Apakah **SQLite** bikin berat? | ❌ **Tidak. Justru SEBALIKNYA** — SQLite lebih ringan & cepat daripada `localStorage` untuk data aplikasi ini (data per sekolah < 1 MB) |
| Apakah **Electron** bikin berat? | ⚠️ **Ya, secara platform** — installer ~80–120 MB & idle RAM ~150–200 MB (ini "pajak" Chromium, bukan karena kode Anda) |
| Apakah berat itu **masalah** untuk kasus Anda? | 🟡 **Tergantung target PC.** Di PC sekolah low-end (4 GB RAM), Electron masih bisa jalan tapi harus dimitigasi |
| Adakah alternatif lebih ringan? | ✅ **Tauri v2** — 5–15 MB & 30–50 MB RAM, reuse 100% kode React Anda, tapi butuh backend Rust |

**Kesimpulan utama:**
1. **SQLite = solusi, bukan masalah.** Ia menghilangkan batas 5–10 MB localStorage dan
   mempercepat query (2–15 ms untuk 100rb baris). Data SPJ per sekolah sangat kecil
   (BKU ~58 KB, guru ~10 KB, tendik ~8 KB).
2. **Beban nyata Electron = 1 "duplikat browser".** Idle ~150–200 MB RAM dan ~100 MB
   installer. Ini normal untuk semua aplikasi Electron (VS Code, Discord, Slack), dan
   **tidak berbanding lurus dengan kompleksitas aplikasi Anda** — aplikasi hello-world
   Electron pun memakan RAM yang sama.
3. **Jebakan yang BENAR-BENAR bikin berat** (bukan Electron-nya): foto base64 di
   localStorage/DB, parsing PDF besar, GPU crash di PC lama, antivirus saat cold start.

---

## 2. Definisi "Berat" — Apa yang Harus Diukur?

Sebelum menjawab, kita perlu pisahkan 3 dimensi "berat":

| Dimensi | Web (Vercel) | Electron + SQLite | Seberapa Penting |
|---|---|---|---|
| **Ukuran installer/disk** | 0 MB (browser) | **80–120 MB** (installed ~250 MB) | Sedang — distribusi via flashdisk |
| **RAM idle** | 50–100 MB (1 tab) | **150–200 MB** (Electron 34) | **Tinggi** — PC sekolah sering 4 GB |
| **RAM saat bekerja** | +data di memori | +data di memori (sama) | Rendah — data tiny |
| **Startup** | ~1 detik (tab) | 1–2 detik (5–10 dtk di PC lambat) | Sedang |
| **CPU** | 0–2% idle | 0–2% idle (sama) | Rendah |

**Temuan kunci:** RAM idle Electron **tidak tergantung aplikasi Anda** — aplikasi
hello-world pun memakan ~150 MB. Jadi pertanyaan yang benar bukan "apakah aplikasi saya
berat", tapi **"apakah PC target sanggup menjalankan 1 instance Chromium tambahan"**.

---

## 3. Profil Aplikasi Saat Ini (Data Nyata dari Repo)

### 3.1 Ukuran Bundle Frontend (sudah build)

| Asset | Ukuran | Catatan |
|---|---|---|
| `index-DQjoOxWK.js` | **1.1 MB** | Bundle utama (React + xlsx + lucide + app) |
| `index-Bf1deASn.js` | 367 KB | Chunk kedua |
| `pdf-BnPRJEQ6.js` | 365 KB | pdfjs-dist (lazy chunk ✓) |
| `pdfTableExtractor-*.js` | 3 KB | Dinamis (lazy ✓) |
| `index-*.css` | 112 KB | Tailwind |
| **Total JS** | **~1.8 MB** (raw, ~600 KB gzip) | **Kecil — tidak masalah** |

> Dependensi berat di node_modules: `pdfjs-dist` 37 MB & `xlsx` 7.2 MB.
> Hanya `pdfjs-dist` yang sudah di-lazy-load (dynamic import → chunk `pdf-*.js` 365 KB terpisah).
> `xlsx` masih **import statis** di `bkuParser.js`, `guruTendikParser.js`, `sekolahParser.js`
> (kecuali di AskAIPanel yang dynamic import) → itulah penyebab `index-DQjoOxWK.js` sebesar
> **1.1 MB**. **Optimasi:** ubah import xlsx di parser menjadi dynamic import juga (hemat ~800 KB dari bundle awal).

### 3.2 Volume Data Nyata per Sekolah (dari file template & parser)

| Data | Ukuran File | Estimasi Baris |
|---|---|---|
| BKU / Realisasi (Excel ARKAS) | 58 KB | ~100–300 transaksi |
| Daftar Guru (Dapodik) | 10 KB | ~30–80 guru |
| Daftar Tendik | 9 KB | ~10–30 tendik |
| Profil Sekolah | 31 KB | 1 baris |
| **Total data tekstual** | **~110 KB** | **Kurang dari 1 MB** |
| Foto dokumentasi (base64) | ⚠️ **Bisa MB–GB** | Masalah localStorage SAAT INI |

**Kesimpulan:** Volume data aplikasi ini **sangat kecil** — jauh di bawah kemampuan SQLite.
Bahkan 1 sekolah dengan 10 tahun data BKU pun hanya beberapa MB. **Data bukan sumber berat.**

### 3.3 Beban Komputasi Nyata

| Operasi | Berat? | Keterangan |
|---|---|---|
| Render UI (React) | 🟢 Ringan | Bundle kecil, 14 halaman, tabel < 500 baris |
| Parsing Excel (xlsx) | 🟡 Sedang | File 58 KB → parse < 100 ms |
| Parsing PDF (pdfjs) | 🟡 Sedang | Hanya saat analisis file di Ask AI |
| Query BKU (filter/SUM) | 🟢 Ringan | Saat ini JS array (O(n)) — sudah cukup cepat untuk ratusan baris |
| AI call (streaming) | 🟡 Sedang | Hanya saat chat aktif; dibebankan ke network + provider |
| Generate foto AI | 🟡 Sedang | Hanya saat dipakai |

---

## 4. Apakah SQLite Bikin Berat? — TIDAK, Justru Meringankan

### 4.1 Performa SQLite untuk Data Sebesar Ini (dari benchmark resmi)

| Operasi | Waktu | Catatan |
|---|---|---|
| Primary key lookup | **1–10 mikrodetik** | Ratusan ribu query/detik |
| Indexed filter (bulan, tipe) | **50–500 mikrodetik** | Pakai index `idx_bku_bulan` dll |
| SUM/COUNT 100.000 baris | **2–15 ms** | Full scan pun masih instant |
| Memory footprint SQLite | **~1–4 MB** | Sangat kecil |

> Aplikasi Anda hanya punya ~100–300 baris BKU per tahun. Query `SELECT SUM(pengeluaran)`
> dari 300 baris akan selesai **jauh di bawah 1 ms** — tidak terasa sama sekali.

### 4.2 Perbandingan: localStorage vs SQLite (untuk kasus Anda)

| Aspek | localStorage (sekarang) | SQLite (target) |
|---|---|---|
| Batas kapasitas | **5–10 MB per browser** ⚠️ | **Terabyte** (1 file `.db`) ✅ |
| Foto base64 | **Cepat penuh → crash quota** ❌ | Bisa, tapi disarankan simpan sebagai file |
| Query agregat | Manual `filter()` + `reduce()` di JS | SQL `SUM/COUNT/GROUP BY` (lebih cepat) |
| Kehilangan data | Clear browser = hilang ❌ | Backup = copy 1 file ✅ |
| Multi-device | Per browser | 1 file bisa dipindah/copy ✅ |

**Kesimpulan:** Konversi ke SQLite **mengurangi** beban & risiko — bukan menambah.
Masalah "berat" yang Anda alami saat ini (foto base64 memenuhi localStorage) justru
**hilang** dengan migrasi ini, asalkan foto disimpan sebagai file, bukan base64 di DB.

---

## 5. Apakah Electron Bikin Berat? — Ya, Secara Platform (angka nyata)

### 5.1 Ukuran & Resource (Electron 34.x, benchmark 2025–2026)

| Metrik | Angka | Catatan |
|---|---|---|
| **Installer minimal** | 80–85 MB | Hello-world app pun sebesar ini |
| **Installer aplikasi nyata** | 120–250 MB | Termasuk better-sqlite3 + app.asar |
| **Installed di disk** | 150–250 MB | 80% dari ini = Chromium + Node runtime |
| **RAM idle (1 window)** | **100–180 MB** | ~168 MB rata-rata (Electron 34) |
| **RAM idle (multi window)** | 300–500 MB | Discord/Slack |
| **Startup cold** | 1–2 detik | Bisa 5–10 dtk di PC lama (antivirus) |
| **CPU idle** | < 0.5–2% | Sama seperti tab browser |

### 5.2 Apa isi "berat" itu? (tidak ada hubungannya dengan kode Anda)

```
Aplikasi SPJ Anda (kode):          ~5–10 MB  (app.asar — JS + assets)
Chromium + Node runtime (wajib):   ~100+ MB  (electron.exe + .dll + locales)
better-sqlite3 (native):           ~2–5 MB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total installer:                   ~80–120 MB
```

**Inti masalah:** setiap aplikasi Electron membawa **1 browser Chromium penuh**.
VS Code (editor paling populer) juga begini. Ini **trade-off yang disengaja**:
Anda bayar ~150 MB RAM + ~100 MB disk **sekali**, untuk dapat: React reuse 90%,
API key aman, offline penuh, installer exe, SQLite.

---

## 6. Perbandingan: Web vs Electron vs Tauri

| Metrik | Web (Vercel) | **Electron** | Tauri v2 |
|---|---|---|---|
| Installer | 0 MB | **80–120 MB** | **5–15 MB** |
| Idle RAM | 50–100 MB (tab) | **150–200 MB** | **30–50 MB** |
| Startup | ~1 dtk | 1–2 dtk | 0.2–0.5 dtk |
| Reuse React+Vite | 100% | 90% | **100%** |
| API key aman | ❌ bocor | ✅ main process | ✅ Rust backend |
| SQLite | ❌ tidak bisa | ✅ better-sqlite3 | ✅ via plugin (rusqlite) |
| Backend baru | ❌ | Node (sudah ada) | **Rust (baru dipelajari)** |
| GPU crash di PC lama | 🟡 (browser) | 🔴 (proses sendiri) | 🟢 (pakai WebView2 OS) |
| Distribusi exe | ❌ | ✅ | ✅ |

### Analisis

- **Electron** = paling cepat untuk migrasi (roadmap 12–16 hari sudah ada di
  `PRD_ELEKTRON_SQLITE.md`, backend Node tanpa belajar bahasa baru, `electron-builder`
  handle installer). **Biayanya: +100 MB disk & +100 MB RAM.**
- **Tauri v2** = paling ringan (5–15 MB, 30–50 MB RAM), reuse React 100%, tapi
  butuh menulis backend Rust (learning curve) — untuk 600 sekolah dengan PC low-end,
  ini pilihan paling aman secara resource.
- **PWA** = paling ringan tapi **tidak disarankan**: data masih di browser (bisa
  terhapus saat clear cache), tidak ada installer, tidak ada integrasi OS.

---

## 7. Konteks Target: PC Sekolah Low-End (4 GB RAM)

### Risiko nyata di lapangan (dari riset lapangan Electron di institusi)

| Risiko | Dampak | Mitigasi |
|---|---|---|
| **RAM 4 GB + Windows 11** | Electron 150–200 MB idle + OS + browser → mulai swap | Tutup browser saat pakai app; Tauri jika parah |
| **Antivirus scan cold start** | Startup 5–10 detik, file-lock crash | `electron-builder` ASAR + exe signing; user exlusi folder |
| **GPU process crash (driver lama)** | **Window putih/abu-abu** 🔴 | `app.disableHardwareAcceleration()` fallback |
| **PC tanpa internet** | AI tidak jalan (data lokal tetap OK) | Offline-first sudah dirancang; AI opsional |
| **Distribusi installer 100 MB** | Susah lewat flashdisk/flashdisk kecil | Kompresi NSIS, atau Tauri (5 MB) |

### Apakah 150–200 MB idle RAM = "sangat berat"?

**Tidak untuk PC normal (8 GB+). Ya-kritis untuk PC 4 GB yang sedang menjalankan
Windows 11 + browser + aplikasi lain.** Operator sekolah biasanya:
- Buka aplikasi SPJ **sendiri** (satu-satunya aplikasi kerja) → 4 GB cukup.
- Sering juga buka browser untuk ARKAS/Dapodik → 4 GB mulai tertekan.

**Jawaban jujur:** di mayoritas PC sekolah (4 GB, Windows 10/11), Electron SPJ akan
berjalan **lancar untuk pekerjaan data entry**, dengan catatan: nonaktifkan
hardware acceleration jika terjadi white screen, dan jangan paralelkan banyak aplikasi berat.

---

## 8. Jebakan yang BENAR-BENAR Bikin Berat (bukan Electron-nya)

Ini yang lebih penting diperbaiki daripada khawatir soal Electron:

### 🔴 1. Foto base64 di localStorage/DB — bom kapasitas & RAM
- `PersonelFotoTab` & `DokumentasiAIGenerate` menyimpan foto **base64** di localStorage.
- 1 foto 3 MB → ~4 MB string base64. 100 foto = **400 MB** → localStorage crash,
  dan jika dipindah ke SQLite sebagai BLOB → RAM & file DB membengkak.
- **Fix (wajib):** simpan foto sebagai **file** (folder `userData/fotos/`), DB hanya
  simpan path. Ini menghilangkan 90% risiko "berat".

### 🟡 2. Parsing PDF besar di Ask AI
- `pdfjs-dist` memuat seluruh PDF ke memori saat ekstraksi tabel. PDF 50 MB → spike RAM.
- **Fix:** batasi ukuran file upload (mis. ≤ 20 MB), tampilkan loading state.

### 🟡 3. Query berat di main process (jarang terjadi untuk data Anda)
- `better-sqlite3` sinkron — query > 16 ms memblokir main process.
- Data Anda < 1 MB → **tidak akan pernah > 16 ms**. Tapi jika nanti 10 tahun data +
  foto metadata, gunakan `worker_threads` untuk query berat.

### 🟢 4. AI streaming — hanya saat dipakai
- Streaming token via IPC → memori kecil, tidak menumpuk. Aman.

---

## 9. Kesimpulan & Rekomendasi

### Verdict

> **Konversi ke Electron + SQLite TIDAK membuat aplikasi "sangat berat" secara
> tidak wajar.** SQLite justru meringankan & mengamankan data (hilangkan batas 5–10 MB).
> Beban yang muncul (±100 MB disk, ±150 MB RAM idle) adalah **pajak standar platform
> Electron** — sama untuk semua aplikasi Electron, dan **tidak sebanding dengan
> kompleksitas aplikasi Anda yang kecil**.
>
> **Rekomendasi: LANJUTKAN ke Electron + SQLite** sesuai roadmap
> `PRD_ELEKTRON_SQLITE.md` (12–16 hari, 90% kode tetap), **asalkan** mitigasi di bawah.

### Checklist Wajib saat Implementasi

| # | Aksi | Mengapa |
|---|---|---|
| 1 | Simpan **foto sebagai file**, bukan base64 di DB | Menghilangkan bom RAM/kapasitas |
| 2 | `app.disableHardwareAcceleration()` jika GPU crash (white screen) | Stabilitas di PC lama |
| 3 | Batasi ukuran upload file (≤ 20 MB) | Cegah spike RAM pdfjs/xlsx |
| 4 | `worker_threads` untuk query berat (cadangan) | Jaga main process tetap responsif |
| 5 | ASAR + kompresi NSIS + code signing | Kurangi ukuran & startup antivirus |
| 6 | Backup otomatis file `.db` + dual-write di fase awal | Keamanan data saat migrasi |
| 7 | Lazy loading (sudah ada untuk pdfjs) → **terapkan juga ke xlsx** (dynamic import di bkuParser, guruTendikParser, sekolahParser) | Hemat ~800 KB dari bundle awal, startup lebih cepat |

### Kapan Harus Pilih Tauri?

Pilih **Tauri v2** (bukan Electron) jika:
- ✅ Target **600 sekolah** dengan **mayoritas PC 4 GB RAM** (Electron ~150–200 MB idle bisa menekan),
- ✅ Anda/satu orang tim siap belajar **Rust dasar** (command backend sederhana),
- ✅ Butuh installer super ringan (5–15 MB) yang mudah didistribusikan via flashdisk.

Pilih **Electron** jika:
- ✅ Ingin migrasi tercepat (roadmap sudah ada, Node sudah dikuasai),
- ✅ PC target umumnya **8 GB RAM ke atas**,
- ✅ Prioritas = keamanan API key + offline + SQLite (bukan ukuran file).

### Keputusan Akhir (rekomendasi pribadi)

**Mulai dengan Electron** (sesuai roadmap yang sudah disusun — cepat, aman, reuse tinggi),
terapkan 7 mitigasi di atas. **Evaluasi Tauri di fase lanjut** jika uji lapangan di 50
sekolah pertama menunjukkan masalah RAM/startup — karena arsitektur React+Vite Anda
100% portabel, migrasi Electron → Tauri hanya butuh ganti lapisan storage/backend.

---

## 10. Referensi & Sumber

| # | Topik | Sumber |
|---|---|---|
| 1 | Benchmark RAM/ukuran Electron vs Tauri (2025–2026, Electron 34.x) | Riset web: dev.to, electronjs.org, benchmark Tauri |
| 2 | Performa better-sqlite3 & SQLite (µs–ms untuk 100k baris) | Dokumentasi SQLite, better-sqlite3 README |
| 3 | Electron di PC low-end (antivirus, GPU crash, 4 GB RAM) | Artikel operasional Electron di institusi |
| 4 | Roadmap migrasi lokal | `docs/elektron/PRD_ELEKTRON_SQLITE.md`, `ROADMAP_ELEKTRON_SQLITE.md` |
| 5 | Riset alternatif | `docs/RISET_SUPABASE_VS_ALTERNATIF.md`, `docs/PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md` |

---

*Dokumen ini melengkapi review arsitektur di `docs/REVIEW_ARSITEKTUR.md` (bagian Roadmap Fase 3–4).*
