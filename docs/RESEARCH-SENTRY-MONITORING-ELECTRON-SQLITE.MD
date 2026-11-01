# 🔬 RESEARCH — Integrasi Sentry untuk Aplikasi SPJ (Electron + SQLite, Paket Gratis)

*Tanggal riset: 31 Oktober 2026*
*Status: RESEARCH — belum ada sprint, belum ada kode diubah*
*Target: produksi 700 sekolah (1 operator/PC), Windows 64-bit, Electron + React + SQLite*
*Sumber harga & fitur: dicek langsung 31 Okt 2026 (daftar tautan di §14)*

---

## 1. Ringkasan Eksekutif (jawaban langsung)

**Yang Anda dapat dari Sentry gratis, untuk aplikasi ini, ada 3 kelompok:**

| Kelompok | Nilai nyata | Tanpa Sentry (sekarang) |
|---|---|---|
| **1. Kecepatan tahu & memperbaiki** | Error produksi masuk dalam hitungan detik–menit, dengan stack trace tersimbolkan, jejak langkah terakhir user, dan crash native (GPU/renderer) | Menunggu laporan WhatsApp/guru → "layar putih" tanpa detail. Riset 24 Okt mencatat **0 ErrorBoundary**, **8 `console.error`** yang tidak pernah terkirim ke mana pun |
| **2. Kualitas rilis 700 instalasi** | `crash-free sessions` per versi + adopsi per versi → gate auto-update. Tahu versi baru merusak 2% sekolah **sebelum** dipasang ke 700 | Auto-update tanpa rem. Bug baru ketahuan setelah 20–50 sekolah kena |
| **3. Biaya dukungan** | Kode laporan (`event_id`) + User Feedback + replay error → tidak perlu TeamViewer/Anydesk, tidak perlu suruh guru mengirim screenshot | Dukungan = tanya-jawab manual, sering tidak bisa direproduksi |

**Angka paket gratis (Developer plan, 1 user):** 5.000 error/bulan · 5 GB logs · 5 GB metrics · 5 juta span · 50 replay · retensi 30 hari · project tak terbatas.
**Sesi (release health) TIDAK ditagih** — ini penting: Anda bisa mengukur crash-free 700 sekolah tanpa memakan kuota.

**Verdict untuk kasus ini:** **Layak, dengan 3 syarat keras:**
1. **Nol PII.** Nama guru/siswa, NIP, nominal BKU, isi prompt AI, dan parameter query SQL **tidak boleh** terkirim. SDK v8 secara default mengumpulkan data itu — wajib dimatikan manual (§8).
2. **Guardrail kuota.** Satu bug loop di 700 PC bisa menghabiskan 5.000 error dalam hitungan menit. `sampleRate`, dedupe `beforeSend`, dan rate limit per client key bukan opsional.
3. **Sentry bukan pengganti log lokal.** Sekolah sering offline. `log_aktivitas` + menu Diagnosa tetap sumber kebenaran; Sentry adalah lapisan agregasi lintas-sekolah saat ada internet.

**Yang TIDAK didapat dari gratis:** Seer (AI debugger), profiling, multi-user, retensi >30 hari, SSO, jaminan SLA, dan data residency pilihan. Untuk 1 developer (Anda), itu tidak masalah hari ini.

**Catatan versi SDK (blocker teknis):** `@sentry/electron` **v8.3.0** mensyaratkan **Electron ≥ 35**. Rencana migrasi Anda menyebut Electron 34 di dokumen riset lama. Kalau Electron 34 dipertahankan → pakai `@sentry/electron` **v7** (atau v6 yang mendukung Electron ≥ 23). Jangan campur: SDK v8 di Electron 34 tidak didukung.

---

## 2. Konteks aplikasi (fakta terukur, bukan asumsi)

Diambil dari `STATE.MD` (audit 24 Okt 2026) dan struktur repo:

| Fakta | Angka | Implikasi untuk Sentry |
|---|---|---|
| Kode | 153 berkas / 35.451 baris | Butuh source map per rilis, kalau tidak stack trace = `a.min.js:1:48213` |
| Akses `localStorage` langsung | 45 panggilan di 17 berkas | Kandidat error `QuotaExceededError` — sekarang **0 dari 48** pemanggil `storageHelper.set` memeriksa kegagalan |
| `ErrorBoundary` | **0** | Satu error render = seluruh app putih. ErrorBoundary wajib **sebelum** Sentry berguna |
| `console.error` | 8 titik | Saat ini hilang di PC user; bisa diubah jadi breadcrumb/log terstruktur |
| Bundle utama | 1.518 kB (420 kB gzip) | Startup di HDD + antivirus = 5–10 detik → butuh span startup |
| Template cetak | 13 template, A4/F4, `mm` | Cetak = operasi paling kritikal; butuh span + tag `template_id`, `paper`, jumlah halaman |
| Skala | 700 sekolah, 1 operator/PC | 700 instalasi = 700 sumber error yang tidak bisa Anda datangi satu-satu |
| Mode data | MVP `localStorage` → produksi SQLite | Fase migrasi = sumber bug terbesar (mapping 41 kunci → tabel). Sentry harus aktif **sejak** migrasi |
| Distribusi | GitHub Releases + auto-update | `release` + `dist` per build wajib, kalau tidak crash-free per versi mustahil |

**Kesimpulan konteks:** aplikasi ini bukan SaaS dengan server. Tidak ada `GET /health`, tidak ada log server, tidak ada APM. **Semua observability harus datang dari dalam aplikasi.** Itu justru membuat Sentry bernilai tinggi — dan membuat disiplin PII menjadi mutlak.

---

## 3. Apa sebenarnya yang diukur Sentry di aplikasi Electron

Empat lapisan, semuanya jalan di paket gratis:

| Lapisan | Isi | Biaya kuota |
|---|---|---|
| **Errors (Issues)** | Exception JS (main/renderer/preload/utility), unhandled rejection, `captureMessage`, error yang Anda tangkap manual | 1 error = 1 event (5.000/bln) |
| **Crashes (native)** | Minidump dari Crashpad: renderer OOM, GPU crash, main process crash. Dikirim saat app restart | 1 crash = 1 event + attachment singkat |
| **Tracing (spans)** | Durasi operasi: startup, buka DB, query, parse Excel/PDF, render dokumen, cetak, IPC, auto-update | 1 span = 1 span (5 juta/bln) |
| **Release Health** | Sesi aplikasi: healthy / errored / crashed / abnormal / unhandled, per `release` | **Gratis (tidak ditagih)** |
| **Replay** | Rekaman DOM 60 detik sebelum error (teks & gambar di-mask default) | 50 replay/bln |
| **Logs & Metrics** | `Sentry.logger.*`, `Sentry.metrics.count/gauge/distribution` | 5 GB masing-masing |
| **User Feedback** | Widget "laporkan masalah" di dalam app | Tidak menagih error |

**Yang penting dipahami:** Sentry **tidak** membuat aplikasi lebih cepat. Sentry memberi **bukti** di mana harus mempercepat, dan **sinyal** kapan rilis harus dihentikan. Optimasi tetap dikerjakan di kode.

---

## 4. Batas paket gratis — apa yang realistis dan apa yang tidak

| Kategori | Developer (gratis) | Konsekuensi praktis untuk 700 sekolah |
|---|---|---|
| User | **1** | Hanya Anda. Tidak bisa mengundang operator/helpdesk |
| Error | **5.000/bulan** | Cukup jika di-guardrail. Satu bug loop bisa menghabiskannya < 10 menit |
| Logs | 5 GB | Sangat longgar (lihat §7: hitungan ±40 MB/bulan) |
| App Metrics | 5 GB | Longgar |
| Spans | **5 juta/bulan** | Cukup **hanya jika** span resource (`resource.*`) difilter dan sampling renderer ≤0,5 |
| Replay | **50/bulan** | Habis oleh satu rilis rusak. Rekomendasi: mati dulu |
| Retensi | **30 hari** | Tren setahun tidak mungkin. Isu penting harus diarsipkan manual ke `docs/` |
| Project | Tak terbatas | Bisa pisah `spj-desktop` / `spj-web-demo` (kuota tetap dibagi per organisasi) |
| Seer / AI debug | ❌ | Tidak ada root-cause otomatis |
| Profiling | ❌ (PAYG saja) | Tidak bisa lihat hot function; pakai span manual |
| Multi-user, SSO, SAML | ❌ | Tidak relevan untuk 1 developer |
| SLA | ❌ | Kalau Sentry down, monitoring berhenti. Log lokal tetap wajib |
| Region data | Dipilih saat signup (US/EU), tak bisa diubah | Pilih **EU** kalau ingin jarak hukum lebih dekat (bukan jaminan UU PDP — lihat §8) |

**Angka pembanding kalau nanti naik:** Team **$26/bln** (≈ Rp 470.000; Rp 5,65 jt/tahun @ kurs 18.100) → 50.000 error, 90 hari retensi, user tak terbatas. Masuk akal hanya setelah ada orang kedua yang menangani produksi.

---

## 5. Arsitektur integrasi yang disarankan

```
┌─────────────────────────── Electron ────────────────────────────┐
│                                                                  │
│  RENDERER (React 18)              PRELOAD              MAIN      │
│  ┌────────────────────┐   ┌──────────────────┐  ┌─────────────┐  │
│  │ @sentry/electron/  │   │ @sentry/electron/│  │ @sentry/    │  │
│  │ renderer           │──▶│ renderer (ops.)  │─▶│ electron/   │  │
│  │ - browserTracing   │   │ contextIsolation │  │ main        │  │
│  │ - replay (OFF)     │   │ = error preload  │  │ - DSN       │  │
│  │ - TANPA dsn         │   └──────────────────┘  │ - transport │  │
│  └─────────┬──────────┘                          │ - offline Q │  │
│            │ events di-forward ke main            │ - scrub PII │  │
│            ▼                                      └──────┬──────┘  │
│  ┌────────────────────┐   ┌──────────────────┐           │        │
│  │ SQLite (adapter)   │   │ Cetak / Template │           │        │
│  │ span manual        │   │ span manual      │           ▼        │
│  └────────────────────┘   └──────────────────┘   ┌──────────────┐ │
│                                                   │ Sentry SaaS  │ │
│  log_aktivitas (SQLite) + event_id  ◀── korelasi  │ (US/EU)      │ │
└───────────────────────────────────────────────────┴──────────────┘
```

**Aturan arsitektur (mengikuti dokumentasi resmi):**

1. **DSN, `release`, `environment` hanya di main process.** Renderer tidak butuh DSN — semua event renderer diteruskan lewat IPC ke main. (Docs: "All renderer events are sent through the main process so passing `dsn`, `release` or `environment` to renderer `init` will have no effect.")
2. **`Sentry.init()` sedini mungkin** di main, **sebelum** `app.whenReady()` dan sebelum window dibuat — supaya error startup ikut tertangkap.
3. **`app.setPath('userData', ...)` harus dipanggil SEBELUM `Sentry.init()`** — SDK memakai folder itu untuk cache scope & antrean offline.
4. **Preload init hanya jika `contextIsolation: true`** — error di preload tidak tertangkap otomatis.
5. **Inisialisasi di setiap `utilityProcess`** kalau nanti dipakai untuk backup/parsing berat.
6. **`release` otomatis** dari `app.getName()@app.getVersion()`. Pastikan versi `package.json` naik setiap rilis — kalau tidak, crash-free per versi tidak berarti apa-apa.
7. **Renderer: jangan `import` Sentry kalau `!app.isPackaged`** — dev error tidak perlu memakan kuota. Pakai `enabled: false` untuk dev, atau project demo terpisah.

### 5.1 Kerangka `main.js`

```js
// main.js — urutan penting: setPath → init → whenReady
import { app } from 'electron'
import * as Sentry from '@sentry/electron/main'

app.setPath('userData', app.getPath('userData')) // panggil sebelum init bila diubah

Sentry.init({
  dsn: process.env.SENTRY_DSN_DESKTOP,          // dari CI secret, bukan VITE_*
  environment: app.isPackaged ? 'production' : 'development',
  enabled: app.isPackaged,
  release: `spj-app@${app.getVersion()}`,

  // ── sampling ──────────────────────────────────────────────
  tracesSampleRate: 0.2,                        // main process: span sedikit
  sampleRate: 1.0,                              // error: kirim semua (volume kecil)

  // ── data minimization (WAJIB, lihat §8) ───────────────────
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    graphQL: { document: false, variables: false },
    genAI: { inputs: false, outputs: false },
    databaseQueryData: false,                   // default true di v8!
    stackFrameVariables: false,
  },
  maxBreadcrumbs: 30,                           // default 100 → payload & PII
  maxValueLength: 2000,
  normalizeDepth: 3,
  sendClientReports: true,

  // ── buang noise sebelum memakan kuota ─────────────────────
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    /^Loading chunk \d+ failed/i,              // akan ditangani retry, bukan bug
    'Object has been destroyed',                // race saat window ditutup
  ],

  // ── offline: sekolah sering putus internet ────────────────
  transportOptions: {
    maxQueueSize: 100,                          // default 30
    maxAgeDays: 14,                             // default 30
    flushAtStartup: true,                       // default false
    shouldStore: (_env, err) => !isDiskFull(err),
  },

  integrations: [Sentry.startupTracingIntegration()],
  beforeSend: scrubPII,                         // lihat §8.3
})
```

### 5.2 Kerangka renderer

```js
// src/main.jsx — React 18
import * as Sentry from '@sentry/electron/renderer'
import { init as reactInit } from '@sentry/react'

if (import.meta.env.PROD) {
  Sentry.init(
    {
      // TANPA dsn, TANPA release, TANPA environment (diabaikan)
      tracesSampleRate: 0.5,
      integrations: [
        Sentry.browserTracingIntegration(),
        // replay: JANGAN diaktifkan di v1 — 50/bulan (lihat §7.4)
      ],
      ignoreSpans: [
        { op: /^resource\./ },                  // WAJIB: ini penyedot span terbesar
        { op: 'measure' },
      ],
      beforeSend: scrubPII,
    },
    reactInit
  )

}

// Root.jsx — boundary WAJIB ada sebelum Sentry berguna
import { ErrorBoundary } from '@sentry/react'

export default function Root() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <AppCrashScreen error={error} onRetry={resetError} />
      )}
      onError={(error) => {
        const id = Sentry.captureException(error)          // dapat event_id
        sessionStorage.setItem('last_event_id', id)        // untuk kode laporan
      }}
    >
      <App />
    </ErrorBoundary>
  )
}
```

> **Penting:** `ErrorBoundary` (via `Sentry.ErrorBoundary` atau komponen sendiri) harus ada **sebelum** Sentry dipasang. Saat ini 0. Tanpa boundary, satu error di `DokumenKelengkapanPage` (2.081 baris) memutihkan seluruh aplikasi — Sentry hanya bisa melaporkan setelah app mati.

---

## 6. 12 optimasi konkret yang didapat (dengan "sebelum → sesudah")

### O-1. MTTR: dari "menunggu laporan" ke "issue muncul sendiri"

| | Sebelum | Sesudah |
|---|---|---|
| Deteksi | Guru menelepon/WA → Anda minta screenshot → sering tidak bisa direproduksi | Issue masuk dengan versi, OS, RAM, langkah terakhir, dan stack trace |
| Waktu | Jam–hari | Menit (kalau PC online) |

**Bukti yang dipakai:** `console.error` saat ini 8 titik, semuanya hilang. `captureException` mengubahnya jadi data.

---

### O-2. Stack trace yang bisa dibaca (source map per rilis)

Tanpa upload source map, error produksi terlihat seperti `index-DQjoOxWK.js:1:48213`. Dengan `@sentry/bundler-plugins` + `build.sourcemap: 'hidden'`, Sentry memetakan kembali ke `DokumenKelengkapanPage.jsx:412`.

```js
// vite.config.js
import { sentryVitePlugin } from '@sentry/bundler-plugins/vite'

export default defineConfig({
  build: { sourcemap: 'hidden' },   // wajib
  plugins: [
    react(),
    sentryVitePlugin({              // HARUS paling akhir
      org: 'spj-app',
      project: 'spj-desktop',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
    }),
  ],
})
```

**Optimasi tambahan:** source map dihapus setelah upload → source code tidak ikut terkirim ke 700 PC. Ini sekaligus menutup kebocoran yang tidak Anda sadari.

---

### O-3. Crash native & OOM: masalah nomor satu PC sekolah

Riset Electron Anda menyebut: RAM idle 150–200 MB, PC 4 GB, GPU crash di PC lama, antivirus saat cold start. **Itu persis kategori crash yang tidak bisa ditangkap `window.onerror`.**

Sentry menangkap minidump dari Crashpad dan mengunggahnya saat app dibuka lagi. Yang Anda dapat:
- Bedakan **crash GPU** vs **OOM renderer** vs **crash main process** (tag `event.process` = `browser` / `renderer` / `utility`).
- Lihat apakah crash berkorelasi dengan versi Electron, RAM, atau driver.
- Ambil keputusan berbasis angka: "matikan `hardware acceleration` untuk 12% PC" — bukan menebak.

**Syarat:** aktifkan **Electron Symbol Server** di *Project Settings → Debug Files* supaya alamat memori jadi nama fungsi. Tanpa itu, crash report = deretan alamat.

---

### O-4. ANR / "aplikasi nge-hang" — keluhan yang paling sulit dibuktikan

Electron SDK punya deteksi **Application Not Responding** (main & renderer) dan `eventLoopBlockIntegration`. Untuk aplikasi yang merender 13 template + memanggil `window.print()` pada PC lambat, ini emas:

- Dapat stack trace **saat** event loop diblokir (bukan sesudah).
- Bisa dibedakan: hang karena render 2.000 baris dokumen, karena `xlsx` parse, atau karena print spooler Windows.

**Optimasi yang dihasilkan:** Anda bisa menetapkan target berangka — mis. "tidak ada blokir event loop > 1.000 ms saat cetak" — dan mengukurnya di 700 sekolah.

---

### O-5. Release Health: rem untuk auto-update

Ini optimasi dengan rasio manfaat/biaya terbaik, dan **gratis** (sesi tidak ditagih):

| Metrik | Pertanyaan yang dijawab | Aksi |
|---|---|---|
| `crash-free sessions` | Versi 1.4.0 lebih buruk dari 1.3.2? | Tahan rollout kalau turun > 1 poin |
| Adopsi per versi | Berapa sekolah masih di versi lama? | Tentukan kebijakan update paksa |
| `errored` vs `crashed` | App mati atau hanya error? | Prioritas perbaikan |
| `abnormal` | Mati listrik / kill Task Manager / freeze | Tahu kualitas PC sekolah, bukan bug Anda |

**Aturan rollout yang disarankan:** auto-update 5% → tunggu 48 jam → crash-free ≥ 99,5% → 25% → 100%. Tanpa data ini, "5%" hanya tebakan.

---

### O-6. Deteksi regresi otomatis

Sentry menandai issue sebagai **regression** ketika muncul lagi di rilis setelah ditutup ("resolved in next release"). Untuk 13 template cetak yang saling berbagi blok, regresi antar-sprint adalah risiko nyata (mis. perubahan `.surat-polos` merusak dokumen lain). Anda tidak perlu menemukannya lewat uji manual 17 dokumen.

---

### O-7. Performa startup (cold start di HDD + antivirus)

`startupTracingIntegration()` memberi span: `app.ready` → `db.open` → `migrate` → `window.create` → `renderer.firstPaint`.

Yang bisa Anda optimasi setelah punya data:
- Pindahkan `xlsx` (7,2 MB, import statis di 3 parser) ke dynamic import → hemat ±800 kB bundle awal. **Sudah teridentifikasi di riset Electron; Sentry memberi angka "berapa detik yang benar-benar hilang".**
- Tunda preload modul AI (Puter/Flux) sampai tab dibuka.
- Ukur dampak antivirus: bandingkan `p50` vs `p95` startup per sekolah.

---

### O-8. SQLite: query lambat, N+1, dan migrasi yang salah

Tidak ada integrasi SQLite resmi, tetapi span manual 6 baris sudah cukup:

```js
// db/span.js
import * as Sentry from '@sentry/electron/main'

export function withDbSpan(op, table, fn) {
  return Sentry.startSpan(
    { name: `db.${op}`, op: 'db', attributes: { 'db.system': 'sqlite', 'db.table': table } },
    fn
  )
}

// contoh: adapter
const rows = withDbSpan('select', 'bku', () =>
  stmt.all(periodeId)   // parameter TIDAK dikirim ke Sentry (databaseQueryData:false)
)
```

Yang bisa ditemukan:
- **N+1**: 300 baris BKU × 1 query per baris = 300 span → langsung terlihat di trace.
- **Query tanpa index**: `SUM` per bulan yang seharusnya <1 ms jadi 40 ms.
- **Flush antrean tulis** (strategi adapter "cache memori + antrean tulis"): ukur `write_queue.depth` dan durasi flush saat app ditutup. Risiko kehilangan data ada di sini.

**Metric yang layak dikirim (bukan span):** `db.size.bytes`, `db.write_queue.depth`, `db.flush.duration`, `backup.duration`, `backup.size.bytes`.

---

### O-9. Cetak & render dokumen: operasi paling kritikal

Setiap cetak = 1 span dengan tag:

```js
Sentry.startSpan(
  {
    name: 'print.document',
    op: 'ui.print',
    attributes: {
      'template.id': 'surat_undangan_mamin',   // 13 template
      'paper.size': 'A4',                       // A4 / F4
      'orientation': 'portrait',
      'doc.pages': 3,
      'doc.rows': 12,
    },
  },
  () => window.print()
)
```

Yang bisa dioptimasi setelah 2 minggu data:
- Template mana yang paling lambat dirender (kandidat: tabel besar, `table-fixed` + `colgroup`).
- Apakah F4 lebih lambat dari A4 (skala/`translateX`).
- Apakah `window.print()` memblokir > 5 detik di PC tertentu (print spooler).
- Berapa persen cetak berakhir error — **sekarang tidak terukur sama sekali**.

---

### O-10. Integritas data: error yang harus didahulukan di atas semua bug UI

Untuk aplikasi LPJ, kehilangan data = bencana, bukan annoyance. Sentry bisa menjadi alarm untuk:

| Kejadian | Cara deteksi | Kenapa penting |
|---|---|---|
| `QuotaExceededError` / `ENOSPC` saat simpan | `captureException` di `storageHelper.set` (48 titik, 0 diperiksa) | Data guru hilang tanpa pesan |
| Migrasi `user_version` gagal | span `db.migrate` + `captureException` + tag `from_version` | DB setengah jadi = app tidak bisa dibuka |
| Backup gagal / 0 byte | metric `backup.size.bytes` + span | Backup yang tidak pernah diuji = tidak ada backup |
| Restore gagal | `captureException` + tag `backup.schema` | Skenario terburuk: user menimpa DB sehat dengan backup rusak |
| Foto tidak tersimpan (file, bukan base64) | span `photo.write` + tag `reason` | Bukti audit hilang |

**Ini adalah alasan terkuat memakai Sentry di aplikasi ini** — bukan sekadar "biar tahu error".

---

### O-11. Dukungan: satu kode, bukan satu sesi remote

Pola yang disarankan (murah, tidak perlu server):

1. Setiap error yang dilihat user menampilkan **kode laporan** = `event_id` (8 karakter pertama).
2. `log_aktivitas` (sudah ada di skema) menyimpan `event_id` + waktu + aksi.
3. Menu **Diagnosa** mengekspor bundel: versi app, `user_version` DB, 200 baris log terakhir, `event_id`.
4. User mengirim kode lewat WA → Anda buka issue-nya di Sentry.

```js
const id = Sentry.captureException(err)
toast.error(`Terjadi kesalahan. Kode laporan: ${String(id).slice(0, 8)}`)
db.logAktivitas('error', { eventId: id, aksi: 'cetak_bku' })   // tanpa PII
```

**Optimasi:** waktu dukungan turun dari 20–40 menit (tanya-jawab) ke < 5 menit (lihat trace + breadcrumb).

---

### O-12. Alur kerja AI/agent: Sentry MCP (tersedia di paket gratis)

Developer plan mencantumkan **MCP access**. Artinya agent (termasuk saya di sesi ini) bisa membaca daftar issue, stack trace, dan span langsung dari Sentry tanpa Anda copy-paste. Untuk proyek 1 orang, ini menghilangkan langkah "salin error → tempel ke chat".

Tambahan untuk dev: **Spotlight** (`@spotlightjs/spotlight`) menampilkan event Sentry secara lokal saat `npm run dev` — tanpa memakai kuota. Cocok karena Anda sering uji di `:5173`.

---

## 7. Anggaran kuota: hitungan untuk 700 sekolah

### 7.1 Asumsi

| Variabel | Nilai | Dasar |
|---|---|---|
| Instalasi | 700 | target proyek |
| Buka app / hari kerja | 60% = 420 | operator sekolah tidak buka setiap hari |
| Hari kerja / bulan | 20 | — |
| Sesi / bulan | 420 × 20 = **8.400** | 1 sesi = 1 kali buka app |
| Error / sesi (target) | 0,3% = **25 event** | target kualitas; bug loop bisa jauh lebih tinggi |
| Span main / sesi | 30 | startup + DB + IPC |
| Span renderer / sesi | 150 (setelah `resource.*` dibuang) | interaksi + render |
| Log / sesi | 5 baris × 1 KB | hanya warn/error |

### 7.2 Hasil

| Kategori | Pemakaian/bulan | Kuota gratis | Terpakai |
|---|---|---|---|
| Error | 25 (normal) | 5.000 | **0,5%** |
| Spans | 8.400 × 180 = **1,51 juta** | 5.000.000 | **30%** |
| Logs | ≈ 42 MB | 5 GB | **0,8%** |
| Metrics | ≈ 17 MB | 5 GB | **0,3%** |
| Replay | 0 (dimatikan) | 50 | **0%** |
| Sesi (release health) | 8.400 | tak ditagih | — |

**Headroom error:** 5.000 / 700 instalasi ≈ **7 error per sekolah per bulan** sebelum habis. Normalnya jauh di bawah itu. **Tapi** skenario buruk nyata: satu `useEffect` loop di halaman yang dibuka 200 sekolah → 200 error/detik → kuota habis < 1 menit.

### 7.3 Guardrail wajib (bukan opsional)

```js
// 1) Rate limit per client key di Sentry UI (Settings → Client Keys → Rate Limits)
//    contoh: 100 event/menit per key → loop tidak menghabiskan kuota sebulan

// 2) Dedupe di SDK: maksimum N error identik per sesi
const seen = new Map()
function beforeSend(event) {
  const key = event.fingerprint?.join('|') ?? event.exception?.values?.[0]?.value
  const n = (seen.get(key) ?? 0) + 1
  seen.set(key, n)
  if (n > 5) return null          // 5 pertama cukup untuk diagnosis
  return event
}

// 3) Sampling kalau volume naik (butuh redeploy — docs)
//    sampleRate: 0.5

// 4) Jangan pernah kirim attachment / screenshot
//    (default off; jangan diaktifkan — screenshot berisi nama guru & nominal)
```

**Catatan:** `tracesSampleRate` renderer 0,5 adalah kompromi. Kalau setelah 1 bulan span > 60% kuota, turunkan ke 0,25 — atau turunkan jumlah span per sesi dengan `ignoreSpans`.

### 7.4 Replay: mengapa dimatikan dulu

50 replay/bulan terlihat banyak, tetapi:
- Replay dipicu per **sesi error**; satu rilis rusak = 100+ sesi error → kuota habis di hari pertama, dan replay untuk bug **berikutnya** hilang.
- Replay merekam DOM. Aplikasi ini menampilkan **nama guru, NIP, nominal BKU** di layar. Default SDK me-mask teks, tetapi tetap ada risiko (judul window, `aria-label`, atribut).
- Replay Electron butuh CSP `worker-src 'self' blob:` dan menambah beban CPU di PC 4 GB.

**Rekomendasi:** mati di v1. Nyalakan hanya untuk build **beta internal** (project terpisah) atau 30 menit saat investigasi bug tertentu.

---

## 8. Privasi & kepatuhan (UU PDP) — bagian yang paling sering diabaikan

### 8.1 Apa yang TIDAK boleh terkirim

| Data | Ada di app ini | Risiko |
|---|---|---|
| Nama guru/siswa/tendik | Ya (`guru`, `tendik`, daftar hadir) | Data pribadi |
| NIP/NUPTK | Ya | Data pribadi + identifier |
| Nominal BKU, pajak, gaji | Ya | Data keuangan; bukan data pribadi, tapi sensitif organisasi |
| Isi prompt AI & hasil generate | Ya | Bisa memuat nama & konteks sekolah |
| Parameter query SQL | Ya (kalau `databaseQueryData` dibiarkan `true`) | Nilai uang/nama ikut |
| Path file user | Ya (`C:\Users\<nama>\...`) | Membocorkan nama operator |
| Foto dokumentasi | Ya | Wajah orang |

### 8.2 Fakta SDK yang harus Anda tahu

> **SDK v8 secara default mengumpulkan**: identitas user (`user.*`, IP), cookie, header HTTP, body HTTP, query param, **data query database (parameter + hasil)**, variabel lokal di stack frame, dan konten input/output AI generatif.
> Satu-satunya yang otomatis di-scrub adalah nilai dengan nama kunci sensitif (`auth`, `token`, `password`, dst).
> **Artinya: default SDK v8 TIDAK aman untuk aplikasi ini.**

Itulah sebabnya `dataCollection` di §5.1 mematikan hampir semuanya. `databaseQueryData: false` adalah baris paling penting — tanpa itu, `SUM(pengeluaran)` beserta nilai rupiah bisa terkirim.

### 8.3 `beforeSend` — pengaman terakhir (allow-list, bukan deny-list)

```js
// sentry/scrub.js
const ALLOWED_TAGS = new Set([
  'sekolah_hash', 'app_version', 'db_schema', 'template_id',
  'paper.size', 'orientation', 'mode', 'os.version',
])

export function scrubPII(event) {
  // 1) User: hanya ID anonim (hash instalasi), bukan nama/email
  if (event.user) event.user = { id: event.user.id }   // setUser({ id: hash })

  // 2) Tag: buang yang tidak masuk allow-list
  if (event.tags) {
    for (const k of Object.keys(event.tags)) {
      if (!ALLOWED_TAGS.has(k)) delete event.tags[k]
    }
  }

  // 3) Extra/contexts: buang total, kecuali yang kita isi sendiri
  delete event.extra
  if (event.contexts) {
    for (const k of Object.keys(event.contexts)) {
      if (!['app', 'os', 'device', 'runtime', 'electron', 'trace'].includes(k)) {
        delete event.contexts[k]
      }
    }
  }

  // 4) Server name & path: jangan bocorkan nama user Windows
  delete event.server_name
  const scrub = (s) => typeof s === 'string'
    ? s.replace(/[A-Za-z]:\\Users\\[^\\]+/g, 'C:\\Users\\<redacted>')
    : s
  if (event.message) event.message = scrub(event.message)
  for (const ex of event.exception?.values ?? []) {
    ex.value = scrub(ex.value)
  }
  for (const b of event.breadcrumbs ?? []) {
    if (b.data?.url) b.data.url = b.data.url.replace(/\?.*$/, '')  // buang query
    if (b.data?.arguments) delete b.data.arguments                   // console args
    b.message = scrub(b.message)
  }

  // 5) Fingerprint stabil tapi tidak memuat nilai data
  //    (jangan pakai event.message mentah sebagai fingerprint)

  return event
}
```

**Tambahan:**
- `Sentry.setUser({ id: sha256(installationId).slice(0,16) })` — **bukan** nama sekolah. Kalau perlu korelasi, simpan mapping `hash → sekolah` **di komputer Anda**, bukan di Sentry.
- `sendDefaultPii` sudah usang di v8; jangan dipakai sebagai pengganti `dataCollection`.
- Untuk legal: Sentry menyediakan DPA; transfer data ke luar Indonesia memerlukan dasar sah + safeguards. Pilih region **EU** saat signup (tidak bisa diubah setelahnya). **Dengan nol PII, seluruh diskusi ini menjadi jauh lebih ringan** — itu alasan tambahan untuk allow-list.

### 8.4 Retensi & hak subjek data

- Retensi gratis = **30 hari**. Kalau ada permintaan penghapusan data pribadi, jendela 30 hari memudahkan.
- Tetap siapkan: "Data yang dikirim ke Sentry tidak memuat data pribadi; lihat `docs/PRIVACY-SENTRY.MD`" sebagai lampiran kebijakan privasi aplikasi.

---

## 9. Offline-first: batas jujur

Sentry Electron punya antrean offline bawaan (disimpan di `userData`), default: **30 envelope, 30 hari, flush saat startup = false**.

Untuk sekolah dengan internet intermiten:

| Setelan | Nilai disarankan | Alasan |
|---|---|---|
| `maxQueueSize` | 100 | 30 terlalu kecil kalau 3 hari offline |
| `maxAgeDays` | 14 | Lebih dari itu biasanya sudah tidak relevan |
| `flushAtStartup` | `true` | Kirim saat app dibuka, bukan saat ditutup (sering dipaksa mati) |
| `shouldStore` | tolak kalau disk < 500 MB | Jangan habiskan disk sekolah untuk antrean |

**Batas yang harus Anda terima:**
1. **Tidak ada internet = tidak ada data di Sentry.** Kalau sekolah benar-benar offline berbulan-bulan, Anda hanya punya log lokal.
2. **Antrean di disk tidak terenkripsi.** Kalau `beforeSend` sudah membersihkan PII, risikonya kecil. Tapi ini alasan lain untuk tidak mengirim nominal/nama.
3. **Event yang di-drop karena kuota hilang permanen.** Tidak ada retry setelah kuota habis.
4. **Minidump baru dikirim saat app dibuka lagi.** Kalau app crash dan tidak pernah dibuka, crash tidak pernah terkirim.
5. **Ukuran upload.** Jangan aktifkan attachment/replay pada koneksi sekolah (bisa 1–5 MB per kejadian).

---

## 10. Apa yang TIDAK Anda dapat (dan kapan harus naik)

| Kebutuhan | Gratis | Solusi kalau perlu |
|---|---|---|
| 2+ orang melihat issue | ❌ (1 user) | Team $26/bln |
| Tren 6–12 bulan | ❌ (30 hari) | Team (90 hari) / arsip manual |
| Root cause otomatis (AI) | ❌ | Seer $40/kontributor/bln — **tidak** sepadan untuk 1 orang |
| Profiling CPU | ❌ | PAYG; untuk app ini span manual lebih murah |
| Data residency Indonesia | ❌ | Self-host Sentry (butuh server 8 GB+, biaya > manfaat untuk 700 desktop) |
| Uptime monitor | 1 (tidak berguna: tidak ada server) | — |

**Self-host / GlitchTip?** GlitchTip (open source, kompatibel SDK Sentry) bisa gratis, tapi butuh server + backup + update + keamanan. Untuk proyek 1 orang dengan 700 desktop, **SaaS gratis lebih murah** — biaya waktu self-host > $26/bln.

---

## 11. Rencana penerapan 4 fase (estimasi realistis)

| Fase | Isi | Estimasi | Gerbang terima (bukti) |
|---|---|---|---|
| **F0 — Fondasi** | `ErrorBoundary` global + layar crash + `event_id` di toast + `log_aktivitas.event_id` | 1 hari | Matikan 1 komponen sengaja → layar crash muncul, kode laporan tampil, log tercatat |
| **F1 — Sentry dasar** | `@sentry/electron` v8, init main+renderer, source map upload, `dataCollection` off, `beforeSend`, project `spj-desktop` | 1–2 hari | Error uji muncul di Sentry dengan file `.jsx` + baris benar; payload **tanpa** user/extra/path |
| **F2 — Instrumen inti** | Span: startup, `db.*`, `print.document`, `import.bku`, `import.invoice`, `backup.*`; metric `db.size`, `write_queue.depth`; ANR | 2–3 hari | 1 trace cetak lengkap terlihat (startup → db → render → print); trace tanpa parameter SQL |
| **F3 — Rilis & operasi** | `release` per build, Release Health, aturan rollout 5%→25%→100%, rate limit, runbook "issue baru" | 1 hari | Dua build berbeda terlihat terpisah di Releases; crash-free per versi terisi |

**Total ±5–7 hari kerja.** Jangan lakukan sekaligus: F0 tanpa Sentry pun sudah menaikkan kualitas secara nyata.

**Prasyarat yang harus diputuskan lebih dulu:** versi Electron final (35+ atau 34). Ini menentukan SDK v8 vs v7.

---

## 12. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| PII bocor ke Sentry | Pelanggaran UU PDP, kepercayaan hilang | `dataCollection` off + allow-list `beforeSend` + uji payload di staging (§8) |
| Kuota habis karena bug loop | Monitoring buta sisa bulan | Rate limit key + dedupe 5/sesi + alert email kuota 80% |
| Source map tidak ter-upload | Stack trace tak terbaca | Build produksi wajib lewat CI dengan `SENTRY_AUTH_TOKEN`; uji 1 error per rilis |
| Renderer event tidak sampai main | Issue hilang diam-diam | Uji dengan `debug: true` di staging; cek `event.process` |
| Electron 34 + SDK v8 | SDK tidak jalan | Pin versi sesuai matrix (§1) |
| Antrean offline menumpuk di disk | Disk sekolah penuh | `maxQueueSize` 100 + `maxAgeDays` 14 + `shouldStore` cek disk |
| Tim bergantung pada Sentry, log lokal ditinggalkan | Kehilangan bukti saat offline | `log_aktivitas` + Diagnosa tetap wajib (sudah di rencana) |
| Replay merekam data layar | Kebocoran | Matikan replay di produksi |

---

## 13. Keputusan yang perlu Anda jawab (dengan rekomendasi default)

| # | Pertanyaan | Rekomendasi default |
|---|---|---|
| Q-01 | Electron final: 35+ atau 34? | **35+** (dukungan Windows 10/11 tetap; membuka SDK v8 & ANR terbaru) |
| Q-02 | Region Sentry: US atau EU? | **EU** (lebih dekat secara hukum; tidak bisa diubah) |
| Q-03 | Replay: mati atau error-only? | **Mati** di v1; nyalakan di project beta |
| Q-04 | Sampling error | **1.0** + rate limit + dedupe (volume error kecil) |
| Q-05 | Sampling trace renderer | **0.5** + `ignoreSpans resource.*` |
| Q-06 | Identitas instalasi | Hash acak (`sha256(installId)`) — **bukan** nama sekolah/NPSN |
| Q-07 | Retensi data | 30 hari (gratis); arsip isu penting ke `docs/` |
| Q-08 | Project terpisah untuk demo web? | **Ya** (`spj-web-demo`) supaya error demo tidak mengotori data produksi — kuota tetap dibagi |

---

## 14. Sumber (dicek 31 Oktober 2026)

| Topik | URL |
|---|---|
| Sentry for Electron (setup, main/renderer, dataCollection) | https://docs.sentry.io/platforms/javascript/guides/electron/ |
| Opsi SDK (sampling, beforeSend, transportOptions, dataCollection) | https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/ |
| Offline support (maxQueueSize, maxAgeDays, flushAtStartup) | https://docs.sentry.io/platforms/javascript/guides/electron/features/offline-support/ |
| Native crash reporting (minidump, symbol server) | https://docs.sentry.io/platforms/javascript/guides/electron/features/native-crash-reporting/ |
| Source maps via Vite (`build.sourcemap: hidden`) | https://docs.sentry.io/platforms/javascript/guides/electron/sourcemaps/uploading/vite/ |
| Session Replay (masking, sampling, CSP) | https://docs.sentry.io/platforms/javascript/guides/electron/session-replay/ |
| Harga & kuota (Developer: 5k error, 5 GB logs/metrics, 5M span, 50 replay, 1 user, 30 hari) | https://sentry.io/pricing/ · https://docs.sentry.io/pricing/ |
| Release Health — sesi tidak ditagih | https://docs.sentry.io/product/releases/health/ |
| Batas ukuran envelope (1 MiB per event) | https://develop.sentry.dev/sdk/foundations/envelopes/ |
| Sampling error & trace | https://docs.sentry.io/platforms/javascript/guides/electron/configuration/sampling/ |
| Versi SDK terbaru (8.3.0) & riwayat dukungan Electron | https://registry.npmjs.org/@sentry/electron/latest · https://github.com/getsentry/sentry-electron/blob/master/CHANGELOG.md |

---

## 15. Satu paragraf untuk diingat

Untuk aplikasi LPJ yang berjalan di 700 PC sekolah tanpa server, Sentry gratis bukan "alat debugging" — ia **satu-satunya cara Anda melihat produksi**. Nilainya bukan pada error yang tertangkap, tapi pada tiga keputusan yang jadi mungkin: **kapan menghentikan auto-update**, **di mana mempercepat cetak/startup**, dan **apakah data guru masih aman saat disk penuh**. Semua itu hanya sah kalau PII tidak pernah ikut terkirim.
