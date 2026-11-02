# RESEARCH — Arsitektur Aplikasi SPJ untuk 4 Sifat: Scalable · Reliable · Available · Maintainable

> Tanggal: 2026-10-24 · Status: **riset, bukan spesifikasi** · Penulis: Builder (agent)
> Basis bukti: kode `spj-frontend/` HEAD 2026-10-24 (153 berkas, 35.451 baris), `docs/`, `STATE.MD`, `DECISIONS.MD`.
> Dokumen ini TIDAK mengubah requirement apa pun. Semua rekomendasi yang menyentuh kode wajib lewat architect pack + dry run (AGENTS.MD).

> **UPDATE KEPUTUSAN USER (2026-10-24) — mengalahkan sebagian rekomendasi di bawah:**
> MVP/demo = **React + `localStorage`** (tanpa Electron) · produksi = **Electron + React + SQLite** ·
> provider AI generate dokumen **masih dipertimbangkan** · skala = **±700 sekolah / 700 operator**.
> Konsekuensi: opsi backend SaaS di §7 **TIDAK dipakai sekarang**; target 10 juta user turun jadi
> latihan teori. Acuan yang berlaku: `docs/ARSITEKTUR_UNTUK_PEMULA.md`. Yang tetap relevan dari
> dokumen ini: bukti §1, daftar mode kegagalan §4, backup/RPO §9, dan maintainability §6/§10.

---

## 0. Ringkasan Eksekutif

### 0.1 Skor kondisi hari ini

| Sifat | Skor | Alasan utama (bukti §1) |
|---|---|---|
| **Scalable** | **2 / 10** | Data terkunci di 1 browser (`localStorage`, ±5 MB). Tidak ada tenancy, auth, atau API. Kapasitas riil = 1 pengguna per profil browser. |
| **Reliable** | **3 / 10** | Tidak ada backup otomatis, tidak ada `ErrorBoundary`, kegagalan kuota ditelan diam-diam (`storageHelper.set` mengembalikan `false`, **0 pemanggil memeriksa**), multi-tab saling menimpa. |
| **Available** | **7 / 10** | Frontend statis memang sulit mati, tetapi "aplikasi tersedia" ≠ "data tersedia": data hanya hidup di perangkat itu. AI bergantung 4 pihak ketiga. |
| **Maintainable** | **4 / 10** | 31 berkas melewati batas 300 baris (terbesar 2.081), 0 test, 0 linter/formatter, 43 panggilan `localStorage` langsung di 13 berkas, 3 implementasi akses storage. |

### 0.2 Tiga temuan yang mengubah arah

1. **Bottleneck bukan React-nya, tapi lapisan data.** Frontend statis + cetak di sisi klien (`window.print()`) sudah "scalable by accident": CDN menanggung beban baca, CPU cetak ada di perangkat pengguna, server tidak perlu merender PDF. Yang tidak bisa diskalakan adalah `localStorage` sebagai database. **Perbaiki data layer, bukan UI layer.**
2. **Target "10 juta pengguna" bukan target domain, tapi target teknik.** Indonesia punya ±400 ribu satuan pendidikan; dengan 1–3 operator per sekolah, plafon domain realistis ≈ **1,2 juta pengguna terdaftar**. Angka 10 juta hanya masuk akal jika produk berubah jadi SaaS multi-negara/multi-instansi. Rancangan di dokumen ini dibuat agar 1,2 juta tercapai tanpa rombak ulang, dan 10 juta tercapai dengan penskalaan horizontal + sharding (bukan microservices).
3. **Electron + SQLite (ADR lama di `docs/REVIEW_ARSITEKTUR.md`) dan "available anywhere" saling bertentangan.** Electron bagus untuk offline 1 PC, tetapi tidak memberi sinkronisasi, kolaborasi, atau akses lintas perangkat. Jawaban yang memenuhi keempat sifat bukan "Electron vs SaaS", melainkan **local-first + server-authoritative sync**.

### 0.3 Rekomendasi inti (bertahap, bukan big bang)

| Fase | Sasaran | Perubahan inti | Biaya |
|---|---|---|---|
| **A. Hardening (sekarang)** | 10 → 1.000 sekolah tanpa backend | ErrorBoundary · backup/restore terverifikasi · kuota guard · foto pindah ke IndexedDB · versioned schema · test parser | Rp 0 |
| **B. Backend MVP** | 1.000 → 10.000 sekolah | Postgres multi-tenant + Auth + Storage + API sinkronisasi; frontend tetap mencetak | ~US$25–70/bln |
| **C. Skala menengah** | 10.000 → 100.000 sekolah | Read replica, cache, queue untuk OCR/AI, observability, SLO | ~US$300–1.200/bln |
| **D. Skala besar** | 100.000+ sekolah / 10 juta user | Partition/shard per tenant-region, async jobs, multi-region, rate limit per tenant | US$5.000+/bln |

**Jangan** membangun microservices, Kubernetes, atau event sourcing sekarang. Modular monolith + Postgres cukup sampai ±1 juta pengguna.

---

## 1. Metode & Bukti Terukur

Semua angka di bawah diambil langsung dari repositori pada 2026-10-24 (perintah reproduksi di §17).

### 1.1 Ukuran kode

| Metrik | Nilai | Interpretasi |
|---|---|---|
| Berkas `.js/.jsx` di `src/` | **153** | — |
| Total baris | **35.451** | Aplikasi ukuran menengah, masih bisa dipegang 1–2 orang |
| Berkas > 300 baris (batas CONSTITUTION) | **31** | Pelanggaran struktural tersebar, bukan satu-dua kesalahan |
| Berkas terbesar | `DokumenKelengkapanPage.jsx` **2.081** | 7× batas; satu halaman memuat form + parser + preview + state |
| Berikutnya | `DokumenFormPreview.jsx` 1.896 · `templateConfig.js` 1.240 · `aiHelper.js` 1.068 · `DataSekolahPage.jsx` 831 | Config & helper jadi "god object" |
| Halaman | 16 berkas (13 rute dashboard + landing + login + orphan `DokumentasiAIPage`) | — |

### 1.2 Bundle produksi (hasil `npm run build`, 2026-10-24)

| Aset | Ukuran | Gzip |
|---|---|---|
| `assets/index-*.js` (utama) | **1.518,51 kB** | **420,15 kB** |
| `assets/pdf.worker.min-*.mjs` | 1.375,84 kB | — |
| `assets/pdf-*.js` | 365,12 kB | 107,61 kB |
| `assets/index-*.css` | 114,81 kB | 17,79 kB |
| Total modul | 298 | — |

Vite memberi peringatan resmi: *"Some chunks are larger than 500 kB"*. Untuk pengguna di jaringan sekolah, 420 kB gzip + worker 1,4 MB = waktu muat awal yang terasa, terutama saat pertama kali membuka halaman BKU/PDF.

### 1.3 Lapisan data

| Metrik | Nilai | Bukti |
|---|---|---|
| Kunci `localStorage` berprefix `spj_` | **41 kunci** | grep `spj_[a-z0-9_]+` |
| Panggilan `localStorage.*` langsung (melewati helper) | **43 panggilan di 13 berkas** | `App.jsx`, `DokumentasiAIGenerate.jsx`, `PersonelFotoTab.jsx`, `aiHelper.js`, `intentClassifier.js`, `nomorSuratHelper.js`, `LoginPage.jsx`, `puterAkun.js`, dll. |
| Pemanggilan `storageHelper.set()` | **48 titik** | — |
| Pemanggil yang memeriksa nilai balik `false` (kuota penuh) | **0** | grep `if (storageHelper.set` = 0 |
| Implementasi akses storage terduplikasi | **3** | `storageHelper.js`, `storageGet()` di `aiHelper.js:511`, `storageGet()` di `intentClassifier.js:470` |
| `try/catch` di `src/` | 56 | Banyak, tetapi mayoritas menelan error jadi nilai default |

**Konsekuensi konkret:** `storageHelper.get()` mengembalikan `defaultValue` saat JSON rusak. Artinya data yang korup **tampak seperti data kosong** — aplikasi tidak pernah memberi tahu pengguna bahwa datanya hilang. `set()` mengembalikan `false` saat kuota penuh, tetapi tidak ada satu pun layar yang menampilkan kegagalan simpan.

### 1.4 Reliabilitas & kualitas

| Item | Kondisi | Dampak |
|---|---|---|
| `ErrorBoundary` | **0** | Satu error render = layar putih total, tanpa jalan pulih |
| Service worker / offline cache | **0** | Tidak ada mode offline eksplisit; data lokal, tapi aset butuh jaringan |
| Deteksi `navigator.onLine` | **0** | Tidak ada indikator/antrean offline |
| Test otomatis (`*.test.*`, `*.spec.*`) | **0** | Gate rilis = `npm run build` + probe Playwright ad-hoc di luar repo |
| Linter / formatter | **belum terpasang** (diakui CONSTITUTION) | Standar kode bergantung disiplin manual |
| `console.log/debug` | **21** | Log debug ikut produksi |
| Auth | **palsu** — `localStorage.setItem("spj_auth","true")` | Siapa pun bisa set flag via DevTools; tidak ada otorisasi per sekolah |
| API key AI | `VITE_CEREBRAS/GROQ/GEMINI_API_KEY` masuk bundle | Dapat diekstrak siapa pun dari `dist/` |
| Proxy AI produksi | **dilewati** — `aiConfig.getProviderUrl()` memakai URL langsung di production (`aiConfig.js:429–447`), sehingga `api/[...path].js` jadi dead code | Key dikirim dari browser ke provider; tidak ada rate limit/kontrol biaya terpusat |

### 1.5 Kapasitas penyimpanan riil

- Kuota `localStorage` umumnya **5 MB per origin** (beberapa browser 10 MB).
- Foto personel di-resize ke maksimum 512 px, JPEG q=0.85 (`PersonelFotoTab.jsx:55–68`) → ±40–80 kB base64 per foto.
- Foto AI 1024 px dapat mencapai **200–500 kB** per gambar base64.
- Perhitungan: 5 MB ÷ 80 kB ≈ **62 foto**; dengan foto AI ≈ **10–25 gambar**. Satu even dokumentasi (rapat + penyerahan + box + owner) sudah menghabiskan sebagian besar kuota.

**Kesimpulan §1:** aplikasi ini secara fungsional kaya, tetapi *non-volatile state*-nya berada di tempat yang paling rapuh (browser profile) dan paling sempit (5 MB). Semua sifat lain turun karena satu keputusan data ini.

---

## 2. Definisi Skala: "10 → 10 Juta" untuk Domain Ini

### 2.1 Realita domain

| Tingkat | Jumlah entitas | Pengguna terdaftar (×1–3 operator) |
|---|---|---|
| 1 sekolah (hari ini) | 1 | 1–3 |
| 1 kecamatan | ±40 sekolah | ±120 |
| 1 kabupaten (mis. Bandung Barat) | ±1.200 sekolah | ±3.600 |
| 1 provinsi | ±20.000 sekolah | ±60.000 |
| Seluruh Indonesia | ±400.000 sekolah | **±1,2 juta** |
| 10 juta pengguna | ≈3,3 juta sekolah | **melampaui jumlah sekolah di Asia Tenggara** |

Angka 10 juta hanya realistis bila produk menjadi platform lintas negara atau dipakai bukan hanya operator sekolah (mis. pengawas, inspektorat, konsultan). Karena itu dokumen ini memakai dua lensa:

- **Lensa A (domain):** 1,2 juta pengguna = plafon nyata. Rancangan harus sampai sini tanpa rombak.
- **Lensa B (teknik):** 10 juta = uji ketahanan arsitektur. Yang berubah hanya jumlah shard, bukan bentuk sistem.

### 2.2 Model beban (estimasi, bukan pengukuran)

Asumsi konservatif: 30% pengguna terdaftar aktif harian; 1 sesi = 20 baca + 5 tulis; dokumen dicetak di perangkat ( server tidak merender PDF).

| Skala | DAU | Operasi/hari | Rata-rata RPS | Puncak (×4) | Data JSON/hari | Foto/hari |
|---|---|---|---|---|---|---|
| 10 user | 3 | 75 | ~0 | ~0 | <1 MB | <5 MB |
| 1.000 sekolah (3.000 user) | 900 | 22.500 | 0,26 | ~1 | ~5 MB | ~200 MB |
| 100.000 sekolah (300.000 user) | 90.000 | 2,25 juta | 26 | ~100 | ~500 MB | ~20 GB |
| 400.000 sekolah (1,2 juta user) | 360.000 | 9 juta | 104 | ~420 | ~2 GB | ~80 GB |
| 10 juta user | 3 juta | 75 juta | 868 | ~3.500 | ~17 GB | ~670 GB |

Catatan: angka foto memakai 1 foto tersimpan per 1,5 pengguna/hari (200 kB rata-rata). Ini estimasi kasar untuk menentukan orde biaya, bukan SLA.

**Implikasi:** 420 RPS puncak (skala Indonesia) masih **sangat nyaman** untuk satu Postgres yang diindeks benar + cache. Bahkan 3.500 RPS puncak (10 juta user) bisa dilayani 4–8 instance aplikasi + Postgres terpartisi. Ini menegaskan: **bukan microservices yang dibutuhkan, melainkan database relasional yang benar + object storage + CDN.**

### 2.3 Sumbu penskalaan yang harus dipisah

| Sumbu | Hari ini | Batasnya | Solusi |
|---|---|---|---|
| **U** — jumlah pengguna | 1 per browser | Tak terbatas secara teori (statis), tapi tanpa auth tak bisa dibedakan | Auth + sesi + rate limit |
| **S** — jumlah sekolah (tenant) | 1 | Tidak ada konsep tenant | `sekolah_id` di semua tabel + RLS |
| **D** — baris data per sekolah | ±1.000 BKU/tahun | 5 MB localStorage | Postgres + pagination/virtual list |
| **F** — berkas/foto | puluhan | 5 MB localStorage | Object storage + signed URL |
| **R** — request | 0 (tidak ada API) | — | API stateless + cache |
| **P** — cetak | 1 perangkat | CPU perangkat | Tetap di klien; opsional server-side untuk arsip |

---

## 3. Scalable

### 3.1 Yang sudah benar (pertahankan)

1. **Frontend statis** — bisa dilayani CDN global tanpa server aplikasi. Ini sudah "scale-out by default".
2. **Cetak di sisi klien** — 13 template dirender di browser. Paling mahal (CPU + memori) dibebankan ke perangkat pengguna, bukan server. Pada skala 10 juta, ini penghematan besar: tidak ada antrean render PDF.
3. **Template engine berbasis config** — menambah template = tambah entri `templateConfig.js` + blok, bukan tambah service.
4. **Parser di klien** — Excel/PDF diproses di perangkat; server tidak perlu menyimpan file mentah besar (kecuali untuk arsip).
5. **Lapisan AI terabstraksi** — `aiConfig` memisahkan provider; fallback berantai; mudah dipindah ke server proxy.

### 3.2 Yang menghambat

| Hambatan | Bukti | Dampak pada skala |
|---|---|---|
| `localStorage` sebagai DB | 41 kunci, 5 MB | Plafon keras; tidak bisa multi-perangkat, multi-user, atau >62 foto |
| Tidak ada tenant | Tidak ada `sekolah_id` di skema | Tidak bisa melayani >1 sekolah dalam satu instalasi |
| Auth palsu | `spj_auth` flag | Tidak ada isolasi data; tidak bisa audit |
| Tidak ada API | 0 endpoint data | Tidak ada sinkronisasi, tidak ada backup server |
| Bundle monolitik | 1 chunk 1,5 MB | Waktu muat memburuk seiring fitur; tidak ada code splitting per rute |
| Parsing berat di main thread | `xlsx`, `pdfjs`, `tesseract.js` | Perangkat kelas bawah (laptop sekolah) bisa freeze saat impor BKU besar |
| AI rate limit per akun | Puter.js free 30 req/10 s, 3 concurrent | Pada skala banyak pengguna, kuota per akun tetap; perlu pool/queue/kontrol |
| `getAll()` membaca seluruh storage | `storageHelper.getAll()` | O(n) per panggilan; `dataContextBuilder` membaca semua data tiap request AI |

### 3.3 Tangga penskalaan

| Skala | Perubahan wajib | Perubahan opsional | Perkiraan biaya |
|---|---|---|---|
| **10** | Tidak ada | — | Rp 0 (Vercel free) |
| **1.000 sekolah** | Postgres + Auth + Storage + API; migrasi data | CDN, Sentry | US$0–25/bln |
| **10.000 sekolah** | Connection pooling, index, pagination, cache | Read replica | US$50–150/bln |
| **100.000 sekolah** | Partition tabel besar, queue job (OCR/AI), rate limit per tenant, observability | Multi-region read | US$300–1.200/bln |
| **1,2 juta user** | Sharding per region/tenant-group, CQRS read model untuk dashboard, async export | Multi-region active-passive | US$2.000–6.000/bln |
| **10 juta user** | Shard 8–16, object storage lifecycle, dedicated cache cluster, autoscaling, biaya AI dikendalikan per tenant | Multi-region active-active untuk baca | US$15.000+/bln |

Catatan: biaya AI (image generation ±US$0,0059/gambar menurut riset Puter di STATE.MD) bisa **melebihi** biaya infrastruktur jika dipakai masif. Harus ada kuota per sekolah.

### 3.4 Target performa (usulan SLO performa)

| Metrik | Target | Cara ukur |
|---|---|---|
| LCP halaman dashboard (4G) | < 2,5 s | Web Vitals / Lighthouse CI |
| Bundle awal (gzip) | < 250 kB, route chunk < 120 kB | `rollup-plugin-visualizer` + budget CI |
| API baca p95 | < 300 ms | APM |
| API tulis p95 | < 500 ms | APM |
| Muat 1.000 baris BKU | < 1 s (virtualized) | Benchmark |
| Cetak 1 dokumen | < 500 ms sampai dialog print | Benchmark |

---

## 4. Reliable

### 4.1 Inventaris mode kegagalan (FMEA ringkas)

| # | Mode kegagalan | Penyebab di kode | Dampak | Deteksi saat ini | Mitigasi |
|---|---|---|---|---|---|
| R1 | **Kuota penuh** | Foto base64 di `localStorage`; `set()` gagal → `false` | Data terakhir tidak tersimpan, pengguna tidak tahu | Tidak ada | IndexedDB untuk blob + guard kuota + toast keras |
| R2 | **JSON korup** | `get()` menelan parse error → default | Data tampak kosong, bisa tertimpa saat save berikutnya | Tidak ada | Checksum + backup + recovery UI |
| R3 | **Profil browser dibersihkan / ganti perangkat** | Data hanya di perangkat | **Kehilangan total** | Tidak ada | Backup otomatis + cloud sync |
| R4 | **Multi-tab saling menimpa** | Tidak ada `storage` event / lock | Perubahan tab A hilang oleh tab B | Tidak ada | BroadcastChannel + optimistic concurrency |
| R5 | **Satu error render = layar putih** | 0 `ErrorBoundary` | Aplikasi tak bisa dipakai sampai reload | Tidak ada | Boundary per rute + fallback + lapor |
| R6 | **Regresi rilis** | 0 test otomatis | Fitur lain rusak tanpa terdeteksi | Build saja | Vitest + Playwright smoke 13 template |
| R7 | **AI provider down / kuota habis** | 4 provider berantai, rotasi akun | Fitur AI mati | Ada fallback lokal (baik) | Circuit breaker + status jujur + AI opsional |
| R8 | **Impor PDF/Excel gagal** | Parser kompleks, OCR cadangan | Pengguna buntu | Pesan sebagian | Fallback manual (sudah ada) + validasi tipe/ukuran |
| R9 | **Key AI disalahgunakan** | Key di bundle | Biaya membengkak / key diblokir | Tidak ada | Proxy server + rate limit + rotasi key |
| R10 | **Cetak tidak sama dengan pratinjau** | Dua builder (layar vs print) | Dokumen resmi salah | Manual | Snapshot test render print |

### 4.2 RPO/RTO hari ini vs target

| Aspek | Hari ini | Target Fase B |
|---|---|---|
| **RPO** (kehilangan data maksimum) | Tidak terbatas (bisa seluruh riwayat) | ≤ 5 menit (PITR Postgres) |
| **RTO** (waktu pulih) | Berhari-hari (ketik ulang manual) | ≤ 1 jam |
| Backup | Manual via menu Backup & Restore (belum terverifikasi restore) | Harian otomatis + WAL + uji restore triwulan |
| Audit | Tidak ada | `audit_log` append-only |

### 4.3 Pola reliabilitas yang harus diadopsi

**Fase A (tanpa backend):**
1. `ErrorBoundary` per rute + layar pemulihan ("muat ulang", "ekspor data sebelum reset").
2. **Backup otomatis**: snapshot JSON terkompresi ke IndexedDB setiap N perubahan + tombol ekspor; verifikasi restore (bukan hanya tombol).
3. **Kuota guard**: sebelum menulis, hitung ukuran; jika >80% kuota, tampilkan peringatan dan tawarkan pembersihan/ekspor.
4. **Versioned schema**: setiap payload punya `schemaVersion` + fungsi migrasi. Ini prasyarat migrasi ke server.
5. **Multi-tab**: `BroadcastChannel` untuk memberi tahu tab lain; tulis dengan pola baca–ubah–tulis cepat + `updatedAt`.
6. **Test**: Vitest untuk `bkuParser`, `nomorSuratHelper`, `honorHelper`, `previewDocs` (paling rawan regresi); Playwright smoke cetak.

**Fase B (server):**
7. **Idempotency key** untuk setiap mutasi (klien mengirim UUID; server menolak duplikat).
8. **Optimistic concurrency**: `version`/`updated_at`; konflik → tampilkan pilihan, jangan timpa diam-diam.
9. **Outbox** di klien: mutasi disimpan lokal dulu, dikirim ulang saat online (local-first).
10. **Circuit breaker** untuk AI dan integrasi eksternal.
11. **Graceful degradation**: AI mati → form & cetak tetap 100% jalan; sinkronisasi mati → mode lokal dengan banner jelas.

---

## 5. Available

### 5.1 Apa arti "tersedia" untuk aplikasi ini

Ada dua lapisan yang harus dipisah:

| Lapisan | Hari ini | Catatan |
|---|---|---|
| **Ketersediaan aplikasi** (aset statis) | Sangat tinggi (CDN Vercel) | Selama internet ada, UI terbuka |
| **Ketersediaan data** | **Rendah** — terikat 1 perangkat | Ganti laptop = data tidak ada |

Jadi klaim "bisa diakses kapan saja, di mana saja" **belum terpenuhi** bukan karena hosting, melainkan karena data tidak berpindah.

### 5.2 Angka SLA dan biayanya

| Target | Downtime/bulan | Implikasi arsitektur | Biaya relatif |
|---|---|---|---|
| 99,0% | 7 j 12 m | 1 region, 1 DB | 1× |
| 99,9% | 43 m 12 s | 2 app instance, DB terkelola, health check | 2–3× |
| 99,95% | 21 m 36 s | Read replica, failover otomatis, monitoring 24/7 | 5× |
| 99,99% | 4 m 19 s | Multi-region, DB HA, deploy tanpa downtime, chaos drill | 15×+ |

**Rekomendasi:** target **99,9%** untuk Fase B–C. 99,99% baru masuk akal jika ada kontrak dengan dinas/instansi.

### 5.3 Mode degradasi (wajib dirancang, bukan kebetulan)

| Komponen mati | Perilaku yang diinginkan |
|---|---|
| API / jaringan | Mode lokal (data terakhir dari cache), banner "offline — perubahan akan disinkronkan" |
| AI provider | Sembunyikan/disable fitur AI dengan pesan jelas; form & cetak tetap |
| Object storage | Foto placeholder + antrean unggah ulang |
| Database primary | Baca dari replica (jika ada) atau tampilkan mode baca-saja |
| Deploy baru | Blue-green / rolling; rilis tidak boleh memutus sesi cetak |

### 5.4 Vendor dependency

| Pihak ketiga | Risiko | Mitigasi |
|---|---|---|
| Puter.js | Kuota/limit/kebijakan berubah; data dikirim ke pihak ketiga | AI opsional; provider abstraction (sudah ada) |
| Groq / Cerebras / Gemini | Rate limit, key bocor, deprecation model | Server proxy + multi-provider + fallback lokal |
| Vercel | Vendor lock-in ringan, limit serverless | Build statis portabel; API bisa pindah |
| `xlsx@0.18.5` | Riwayat advisory keamanan | Ganti ke `exceljs`/`sheetjs` versi aman saat sprint keamanan |

---

## 6. Maintainable

### 6.1 Diagnosis

| Gejala | Bukti | Akar |
|---|---|---|
| Berkas raksasa | 31 >300 baris; 2.081; 1.896; 1.240; 1.068 | Tidak ada batas modul yang ditegakkan; fitur ditumpuk di halaman |
| Tidak ada jaring pengaman | 0 test, 0 lint, 0 typecheck | Gate rilis hanya `build` |
| Akses data tersebar | 43 panggilan `localStorage` di 13 berkas; 3 implementasi helper | Tidak ada lapisan repository |
| "God object" | `aiConfig.js` (config + settings + prompt + URL), `aiHelper.js` 1.068 baris | Tanggung jawab bercampur |
| Pengetahuan di chat/STATE | `STATE.MD` 158 KB | Dokumentasi keputusan tidak selalu jadi ADR ringkas |
| Log debug | 21 `console.log` | Tidak ada linter yang melarang |
| JS tanpa tipe | `checkJs` tidak aktif | Kontrak data antar modul tidak terverifikasi |

### 6.2 Target struktur (Fase B)

```
spj-frontend/src/
├── app/                 # bootstrap, router, providers, error boundary
├── features/
│   ├── bku/             # UI + hook + parser + model BKU
│   ├── dokumen-lpj/     # template engine + editor + print
│   ├── pbj/
│   ├── nomor-surat/
│   ├── data-sekolah/
│   └── ai/              # UI AI; pemanggilan provider lewat api client
├── entities/            # tipe & skema domain bersama (Zod)
│   ├── sekolah.js
│   ├── bku.js
│   └── dokumen.js
├── shared/
│   ├── api/             # client HTTP, error mapping, retry, auth
│   ├── storage/         # repository (IndexedDB / server), satu pintu
│   ├── lib/             # format uang, tanggal, nomor
│   └── ui/              # komponen desain
└── styles/
```

Aturan penegakan:
- **Satu pintu data**: UI tidak boleh menyentuh `localStorage`/`fetch` langsung; hanya lewat `shared/storage` atau `shared/api`.
- **Batas ukuran**: komponen ≤ 200 baris, halaman ≤ 150 baris (halaman hanya merangkai fitur), util ≤ 150.
- **Kontrak**: semua payload lintas modul divalidasi Zod (bisa dipakai di JS tanpa TS).
- **Tidak ada `console.log`**: diganti logger yang bisa dimatikan.

### 6.3 Gate kualitas yang diusulkan

| Gate | Alat | Ambang | Kapan |
|---|---|---|---|
| Format | Prettier | 0 diff | pre-commit + CI |
| Lint | ESLint (`no-console`, `no-unused-vars`, import order) | 0 error | CI |
| Tipe | `tsc --checkJs` + JSDoc | 0 error (bertahap) | CI |
| Unit test | Vitest | parser/helper coverage ≥ 70% | CI |
| E2E cetak | Playwright | 13 template render + snapshot | nightly / sebelum rilis |
| Bundle budget | `vite build` + size check | awal < 250 kB gzip | CI |
| Aksesibilitas dasar | axe | 0 critical di halaman utama | mingguan |

### 6.4 Observability (Fase B)

| Sinyal | Alat | Yang dipantau |
|---|---|---|
| Error frontend | Sentry | error rate, release, breadcrumb |
| Web Vitals | Sentry/GA | LCP, INP, CLS per rute |
| API | OpenTelemetry/log terstruktur | p50/p95/p99, error rate, request id |
| Database | `pg_stat_statements` | query lambat, index miss |
| Sinkronisasi | metrik kustom | backlog outbox, konflik, retry |
| Biaya AI | metrik per tenant | jumlah generate, biaya, kuota |

---

## 7. Arsitektur Target

### 7.1 Tiga opsi (dengan trade-off jujur)

#### Opsi 1 — Tetap statis + BaaS (Supabase/Neon + Storage)

```
Browser (React SPA, cetak lokal)
   │  HTTPS (JWT)
   ▼
Supabase / Postgres terkelola  ── RLS per sekolah_id
   ├── Auth
   ├── Storage (foto) + signed URL
   └── Realtime (opsional)
```

- **Kelebihan:** tercepat dibangun (hari, bukan bulan), Auth + RLS + Storage siap, biaya awal rendah, PITR tersedia di paket Pro.
- **Kekurangan:** ketergantungan vendor, RLS bisa jadi rumit, biaya naik saat data besar, kontrol terbatas.
- **Cocok untuk:** Fase B (validasi 1.000–10.000 sekolah).

#### Opsi 2 — Modular monolith + Postgres (rekomendasi jangka panjang)

```
CDN (aset statis)
   │
   ▼
App server stateless (Node/Hono atau Next) ×N  ── cache (Redis, opsional)
   │
   ├── Postgres (primary + replica)
   ├── Object storage (S3/R2) untuk foto & arsip
   └── Queue (pg-boss/BullMQ) untuk OCR, AI, ekspor
```

- **Kelebihan:** kendali penuh, biaya paling efisien di skala besar, mudah di-shard, tidak vendor-lock.
- **Kekurangan:** butuh kerja ops (backup, migrasi, monitoring), waktu bangun lebih lama.
- **Cocok untuk:** Fase C–D.

#### Opsi 3 — Electron + SQLite (ADR lama)

- **Kelebihan:** offline penuh, data 1 file, tidak ada biaya server, key aman di main process.
- **Kekurangan:** **tidak available anywhere**, tidak ada kolaborasi/sinkronisasi, distribusi update ribet, tidak scalable ke banyak sekolah tanpa mekanisme sync.
- **Verdict:** tetap relevan sebagai **mode offline** atau untuk sekolah dengan koneksi buruk, **bukan** sebagai arsitektur utama jika targetnya 4 sifat di dokumen ini.

### 7.2 Rekomendasi: **local-first + server-authoritative** (Opsi 1 → Opsi 2)

```
┌────────────────────────── Perangkat pengguna ──────────────────────────┐
│ React SPA                                                              │
│  ├── UI + print (A4)                                                   │
│  ├── Cache lokal: IndexedDB (data + foto)                              │
│  └── Outbox: antrean mutasi (idempotency key)                          │
└───────────────┬────────────────────────────────────────────────────────┘
                │ sync (HTTPS, JWT)
                ▼
┌────────────────────────── Server ──────────────────────────────────────┐
│ API stateless  ── auth ── rate limit ── validasi (Zod)                 │
│  ├── Postgres: tenant, dokumen, BKU, nomor surat, audit                │
│  ├── Object storage: foto/arsip (signed URL)                           │
│  └── Queue: OCR/AI/ekspor (async)                                     │
└────────────────────────────────────────────────────────────────────────┘
```

**Kenapa ini yang dipilih:**
1. **Reliable:** data tahan ganti perangkat; RPO mengecil; konflik ditangani eksplisit.
2. **Available:** offline tetap bisa kerja; saat online, sinkron.
3. **Scalable:** server stateless; media di object storage; cetak di klien.
4. **Maintainable:** satu lapisan data, satu kontrak, satu sumber kebenaran.

**Biaya kompleksitas:** sinkronisasi konflik. Mitigasi: karena 1 sekolah = 1–3 pengguna dan domainnya dokumen per periode, konflik hampir selalu dapat diselesaikan dengan **version check per dokumen** (bukan CRDT). Ini keputusan penting agar tidak over-engineering.

### 7.3 Kapan server-render PDF?

Tetap **di klien** untuk kebutuhan sehari-hari. Server hanya perlu merender PDF jika:
- arsip resmi yang tidak bisa diubah (hash + timestamp),
- pengiriman ke dinas,
- verifikasi pihak ketiga.

Itu bisa ditambahkan sebagai job async di Fase C tanpa mengubah alur cetak.

---

## 8. Desain Data & Sinkronisasi

### 8.1 Skema usulan (Postgres)

```sql
-- Tenant
create table sekolah (
  id            uuid primary key default gen_random_uuid(),
  npsn          text unique not null,
  nama          text not null,
  kabupaten     text,
  provinsi      text,
  created_at    timestamptz not null default now()
);

create table pengguna (
  id            uuid primary key default gen_random_uuid(),
  sekolah_id    uuid not null references sekolah(id),
  email         text unique not null,
  nama          text,
  role          text not null check (role in ('bendahara','kepsek','operator','pengawas')),
  created_at    timestamptz not null default now()
);

-- Periode anggaran (kunci alami untuk dokumen & BKU)
create table periode (
  id            uuid primary key default gen_random_uuid(),
  sekolah_id    uuid not null references sekolah(id),
  tahun         int  not null,
  unique (sekolah_id, tahun)
);

-- Baris BKU (relasional: butuh agregasi & laporan)
create table bku_baris (
  id            bigserial primary key,
  periode_id    uuid not null references periode(id),
  tanggal       date not null,
  no_bukti      text,
  uraian        text not null,
  kode_rekening text,
  kode_kegiatan text,
  debit         numeric(18,2) not null default 0,
  kredit        numeric(18,2) not null default 0,
  kategori      text,
  sumber        text,           -- arkas | manual | siplah
  created_at    timestamptz not null default now()
);
create index on bku_baris (periode_id, tanggal);
create index on bku_baris (periode_id, kode_rekening);

-- Dokumen (formData fleksibel per template)
create table dokumen (
  id            uuid primary key default gen_random_uuid(),
  sekolah_id    uuid not null references sekolah(id),
  periode_id    uuid not null references periode(id),
  jenis         text not null,           -- honor_guru, sppd, ...
  nomor         text,
  status        text not null default 'draft',
  data          jsonb not null default '{}'::jsonb,
  version       int  not null default 1,
  updated_at    timestamptz not null default now(),
  unique (sekolah_id, periode_id, jenis, nomor)
);

-- Berkas (foto, PDF, lampiran)
create table berkas (
  id            uuid primary key default gen_random_uuid(),
  sekolah_id    uuid not null references sekolah(id),
  dokumen_id    uuid references dokumen(id) on delete cascade,
  storage_key   text not null,
  mime          text not null,
  ukuran        bigint not null,
  sha256        text not null,
  created_at    timestamptz not null default now()
);

-- Nomor surat: sequence aman per sekolah/periode
create table nomor_surat (
  id            bigserial primary key,
  sekolah_id    uuid not null references sekolah(id),
  periode_id    uuid not null references periode(id),
  kode          text not null,           -- 400.3.7.6
  urut          int  not null,
  unique (sekolah_id, periode_id, kode, urut)
);

-- Audit append-only
create table audit_log (
  id            bigserial primary key,
  sekolah_id    uuid not null,
  pengguna_id   uuid,
  aksi          text not null,
  entitas       text not null,
  entitas_id    text,
  sebelum       jsonb,
  sesudah       jsonb,
  created_at    timestamptz not null default now()
);
```

Prinsip:
- **Uang selalu `numeric`**, tidak pernah `float`.
- **`data jsonb`** untuk formData per template (fleksibel, tidak perlu migrasi kolom tiap template baru), tetapi **field yang dilaporkan/diagregasi** (nominal, tanggal, kategori, kode rekening) dipromosikan ke kolom.
- **RLS** (`sekolah_id = auth.sekolah_id()`) untuk isolasi tenant.
- **Audit log** untuk dokumen resmi (siapa mengubah apa, kapan).
- **Soft delete** (`deleted_at`) untuk dokumen yang sudah dicetak.

### 8.2 Protokol sinkronisasi (sederhana, bukan CRDT)

```
Klien                          Server
  │ mutasi lokal (optimistic)
  │ tulis ke IndexedDB + outbox {id, entity, op, payload, idempotencyKey, baseVersion}
  ├──────────── POST /sync/batch ────────────►
  │                                            validasi + cek version
  │                                            commit / konflik
  │◄────────── {accepted, conflicts} ──────────
  │ terima → hapus outbox
  │ konflik → tampilkan pilihan (pertahankan lokal / ambil server / gabung manual)
```

Aturan:
- Setiap mutasi punya **`idempotencyKey`** (UUID) → retry aman.
- Setiap entitas punya **`version`**; server menolak jika `baseVersion` ≠ `version` saat ini.
- **Tidak ada** resolusi otomatis untuk konflik isi dokumen (manusia yang memutuskan).
- **Upload foto** langsung ke object storage dengan signed URL, bukan lewat API (hemat bandwidth server).

### 8.3 Migrasi dari `localStorage` (runbook)

1. **Ekspor** semua kunci `spj_` → satu JSON + `schemaVersion` (fitur ekspor sudah ada di Pengaturan, perlu diverifikasi).
2. **Normalisasi** di skrip migrasi: petakan 41 kunci ke entitas baru (`bku_data` → `bku_baris`, `dokumen_lpj` → `dokumen`, foto base64 → object storage).
3. **Dry-run**: impor ke staging, bandingkan jumlah baris, total nominal per kategori, hash dokumen sebelum/sesudah.
4. **Cutover**: undangan pengguna, login, impor, verifikasi di aplikasi.
5. **Dual-read 1 sprint**: aplikasi membaca server, tetapi tetap bisa ekspor lokal.
6. **Rollback**: file ekspor asli disimpan; jika gagal, pengguna kembali ke versi lokal.

**Risiko utama migrasi:** foto base64 besar (butuh streaming, jangan load semua ke memori), dan data yang sudah korup sebelumnya (deteksi via validasi skema, laporkan, jangan diam-diam dibuang).

---

## 9. SLO, Backup, dan Disaster Recovery

### 9.1 SLO usulan (Fase B)

| SLI | Definisi | SLO |
|---|---|---|
| Ketersediaan API | request sukses / total (non-4xx) | ≥ 99,9% / 30 hari |
| Latensi baca | p95 `GET` | < 300 ms |
| Latensi tulis | p95 `POST/PATCH` | < 500 ms |
| Keberhasilan sinkronisasi | batch sukses / total | ≥ 99,5% |
| Kehilangan data | kejadian data hilang tanpa backup | 0 / kuartal |
| Error frontend | sesi tanpa error / total | ≥ 99% |

Error budget 99,9% = 43 menit/bulan. Jika habis, **fitur baru berhenti**, fokus reliabilitas.

### 9.2 Backup & DR

| Item | Kebijakan |
|---|---|
| Postgres | PITR (WAL) + snapshot harian, retensi 30 hari |
| Object storage | Versioning + lifecycle; salinan lintas region untuk arsip resmi |
| Uji restore | 1× per kuartal, catat waktu pulih (target < 1 jam) |
| Backup sisi klien | Ekspor JSON otomatis ke IndexedDB + unduh manual |
| Runbook | Ditulis di `docs/runbooks/` (folder sudah ada) |

### 9.3 Rencana kegagalan (contoh)

| Skenario | Respons | Target pulih |
|---|---|---|
| DB primary mati | Failover ke replica/standby | < 5 menit |
| Region mati | DNS ke region cadangan (read-only lebih dulu) | < 30 menit |
| Deploy rusak | Rollback rilis sebelumnya (immutable deploy) | < 10 menit |
| Object storage bermasalah | Foto placeholder, antre unggah | < 1 jam |
| Key AI bocor | Rotasi key di server, blokir pola abuse | < 15 menit |

---

## 10. Maintainability Blueprint

### 10.1 Urutan perbaikan (ROI tertinggi dulu)

| # | Tindakan | Dampak | Usaha |
|---|---|---|---|
| 1 | `ErrorBoundary` + logger | Mencegah layar putih, mempercepat diagnosis | 0,5 hari |
| 2 | Vitest untuk parser & helper | Menahan regresi saat refactor | 2–3 hari |
| 3 | ESLint + Prettier + CI | Standar tidak lagi bergantung disiplin | 1 hari |
| 4 | Repository layer (satu pintu data) | Menghapus 43 akses langsung; siap migrasi | 3–5 hari |
| 5 | Pecah `DokumenKelengkapanPage` (2.081) & `DokumenFormPreview` (1.896) | Navigasi kode & review | 3–4 hari |
| 6 | Versioned schema + migrasi | Prasyarat backend, mencegah data korup | 2 hari |
| 7 | Code splitting per rute | Bundle awal turun drastis | 1–2 hari |
| 8 | Sentry + Web Vitals | Melihat masalah nyata di lapangan | 0,5 hari |
| 9 | Virtual list untuk BKU | Ribuan baris tetap responsif | 1–2 hari |
| 10 | Hapus `console.log` + `api/[...path].js` dead code | Kebersihan & keamanan | 0,5 hari |

### 10.2 Definisi "selesai" yang bisa diverifikasi

Setiap PR/sprint harus lulus:
- `npm run lint` → 0 error
- `npm run test` → semua lulus, coverage parser ≥ 70%
- `npm run build` → sukses, bundle awal < 250 kB gzip
- smoke Playwright → 13 template ter-render, 0 console error
- tidak ada penambahan akses `localStorage` langsung di luar `shared/storage`

### 10.3 Dokumentasi

- **ADR ringkas** di `DECISIONS.MD` untuk setiap keputusan arsitektur (bukan narasi panjang).
- **`docs/DATA-MODEL.MD`** diperbarui saat skema berubah.
- **`docs/API.MD`** diisi saat endpoint pertama ada; sertakan kontrak + contoh.
- **Runbook** operasional di `docs/runbooks/`.
- **STATE.MD** tetap ringkas: status, bukan arsip semua percakapan.

---

## 11. Biaya (orde besaran, USD)

Asumsi: managed Postgres + object storage + CDN + 1–2 app instance; harga publik 2026, bisa berubah.

| Skala | DB | Storage | Compute | AI (opsional) | Total/bln |
|---|---|---|---|---|---|
| 10 user | free tier | free tier | free/static | ~0 | **0** |
| 1.000 sekolah | $0–25 | $5 | $0–20 | $20–100 | **$25–150** |
| 10.000 sekolah | $50–100 | $20–40 | $50–150 | $200–1.000 | **$300–1.300** |
| 100.000 sekolah | $300–800 | $200–400 | $400–1.500 | $1.000–5.000 | **$2.000–7.700** |
| 1,2 juta user | $1.500–3.000 | $1.000–2.000 | $3.000–8.000 | $5.000–25.000 | **$10.000–38.000** |
| 10 juta user | $8.000+ | $5.000+ | $15.000+ | $25.000+ | **$50.000+** |

Catatan penting: **AI image generation adalah biaya variabel paling berbahaya**, bukan server. Wajib ada kuota per sekolah dan pemantauan biaya per tenant.

---

## 12. Roadmap Eksekusi (usulan sprint, mengikuti aturan repo)

| Sprint | Fokus | Deliverable | Gate |
|---|---|---|---|
| **R-1** | Hardening tanpa backend | ErrorBoundary, backup otomatis + uji restore, kuota guard, `schemaVersion`, IndexedDB untuk foto | build + unit test parser + uji restore nyata |
| **R-2** | Struktur & kualitas | ESLint/Prettier/Vitest/CI, repository layer, pecah 2 berkas terbesar | lint 0 + test hijau + bundle budget |
| **R-3** | Backend MVP | Auth, tenant, skema Postgres, endpoint sync, storage foto | uji 2 sekolah terisolasi + migrasi 1 sekolah nyata |
| **R-4** | Migrasi & sinkronisasi | impor data, outbox, konflik, dual-read | uji rollback + perbandingan hash |
| **R-5** | Reliabilitas | SLO, monitoring, backup PITR, uji beban k6 | laporan beban + restore drill |
| **R-6+** | Skala | cache, queue, partition, sharding | sesuai kebutuhan nyata, bukan spekulasi |

Urutan ini sengaja menaruh hardening sebelum backend: membangun backend di atas data yang bisa hilang diam-diam hanya memindahkan masalah.

---

## 13. Risk Register

| # | Risiko | Prob. | Dampak | Mitigasi | Pemilik |
|---|---|---|---|---|---|
| X1 | Data hilang karena browser dibersihkan | Tinggi | Kritis | Backup otomatis + cloud sync | Fase A/B |
| X2 | Kuota localStorage penuh saat foto | Tinggi | Tinggi | IndexedDB + object storage | Fase A/B |
| X3 | Key AI diekstrak dari bundle | Tinggi | Tinggi | Server proxy + rotasi | Fase B |
| X4 | Migrasi data merusak/menghilangkan baris | Sedang | Kritis | Dry-run + hash + rollback | Fase B |
| X5 | Konflik sinkronisasi menimpa dokumen | Sedang | Tinggi | version check + keputusan manusia | Fase B |
| X6 | Regresi cetak (dokumen resmi salah) | Sedang | Kritis | snapshot test 13 template | Fase A |
| X7 | Biaya AI membengkak | Sedang | Tinggi | kuota per tenant + alert | Fase B |
| X8 | Vendor BaaS naik harga/lock-in | Rendah | Sedang | abstraksi repository + Postgres standar | Fase B |
| X9 | Tim bertambah, kode tak terbaca | Sedang | Sedang | batas ukuran + lint + review | Fase A |
| X10 | Regulasi data sekolah (privasi) | Sedang | Tinggi | enkripsi, akses berbasis peran, audit | Fase B |

---

## 14. Keputusan yang Perlu Diambil (antrean ADR)

| ID | Pertanyaan | Opsi | Rekomendasi |
|---|---|---|---|
| Q-A1 | Bentuk produk jangka panjang | (a) desktop offline, (b) SaaS web, (c) local-first hybrid | **(c)**, dengan (a) sebagai mode |
| Q-A2 | Backend | (a) Supabase, (b) VPS + Postgres + Node, (c) Firebase | **(a) untuk MVP**, (b) saat >10k sekolah |
| Q-A3 | Auth | (a) Supabase Auth, (b) Auth.js, (c) kustom | (a) atau (b); jangan kustom |
| Q-A4 | Foto | (a) base64 di DB, (b) object storage | **(b)** — tanpa diskusi |
| Q-A5 | Cetak | (a) klien, (b) server PDF | **(a)** sekarang, (b) hanya untuk arsip |
| Q-A6 | Sinkronisasi | (a) last-write-wins, (b) version check, (c) CRDT | **(b)** — cukup untuk 1–3 user/sekolah |
| Q-A7 | Target ketersediaan | 99,9% atau 99,99% | **99,9%** sampai ada kontrak |
| Q-A8 | TypeScript | (a) tetap JS + JSDoc, (b) migrasi bertahap | **(a) lalu (b)** per fitur baru |

---

## 15. Anti-Pattern yang Harus Dihindari

1. **Microservices sekarang.** 35 ribu baris kode dan 1–3 developer tidak butuh itu; biaya operasionalnya membunuh kecepatan.
2. **Menaruh foto di database sebagai base64.** Sudah terbukti menghabiskan kuota; di Postgres pun memperbesar backup dan memperlambat query.
3. **Menambah fitur di halaman 2.000 baris.** Setiap penambahan memperbesar risiko regresi yang tidak terdeteksi (0 test).
4. **Migrasi ke backend tanpa backup & dry-run.** Risiko kehilangan data resmi sekolah.
5. **Mengandalkan AI untuk jalur kritis.** AI harus opsional; form dan cetak tidak boleh bergantung padanya.
6. **Menunda test sampai "nanti".** Semakin lama, semakin mahal; mulai dari parser (ROI tertinggi).
7. **Multi-region sebelum ada pengguna.** Menghabiskan energi pada masalah yang belum ada.

---

## 16. Kesimpulan

1. **Fondasi UI/cetak sudah tepat** dan justru menguntungkan pada skala besar: statis, cetak di klien, template berbasis config.
2. **Satu keputusan yang salah menahan tiga sifat lain:** `localStorage` sebagai database. Selama ini tidak diganti, `Scalable`, `Reliable`, dan `Available` tidak bisa naik signifikan.
3. **Jalur termurah dan paling aman:** hardening (Fase A) → backend multi-tenant (Fase B) → skala bertahap (C/D). Bukan big-bang rewrite.
4. **10 juta pengguna bukan target domain**, tetapi arsitektur yang diusulkan mampu mencapainya dengan sharding dan object storage, tanpa microservices.
5. **Maintainability adalah prasyarat, bukan kemewahan.** Tanpa test/lint/repository layer, migrasi backend akan menjadi proyek berisiko tinggi.

**Langkah berikutnya yang disarankan (butuh persetujuan user):** susun architect pack untuk **Sprint R-1 (Hardening)** — kecil, tanpa backend, tetapi menutup tiga risiko terbesar: kehilangan data, layar putih, dan kuota penuh.

---

## 17. Lampiran — Perintah Reproduksi Bukti

```powershell
# 1. Ukuran kode
$f = Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx
$f.Count
($f | Get-Content | Measure-Object -Line).Lines
$f | ForEach-Object { [pscustomobject]@{
  L=(Get-Content $_.FullName | Measure-Object -Line).Lines; P=$_.FullName
} } | Sort-Object L -Descending | Select-Object -First 30

# 2. Bundle
cd spj-frontend; npm run build

# 3. Kunci localStorage
Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "spj_[a-z0-9_]+" -AllMatches |
  ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# 4. Akses localStorage langsung
(Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "localStorage\.(getItem|setItem)").Count

# 5. Pemanggil yang memeriksa kegagalan simpan
(Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "if\s*\(\s*storageHelper\.set").Count

# 6. Test & log
(Get-ChildItem spj-frontend/src -Recurse -Include *.test.*,*.spec.*).Count
(Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "console\.(log|debug)").Count

# 7. ErrorBoundary / service worker
Get-ChildItem spj-frontend/src -Recurse -Include *.js,*.jsx |
  Select-String -Pattern "ErrorBoundary|serviceWorker"
```

---

*Dokumen ini adalah riset. Tidak ada kode yang diubah. Keputusan implementasi wajib melalui `DECISIONS.MD` dan architect pack sprint.*
