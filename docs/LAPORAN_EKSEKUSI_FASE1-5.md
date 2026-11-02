# LAPORAN EKSEKUSI BLUEPRINT → UNTUK ARSITEK (GEMINI)

> **Dari:** OpenCode (eksekutor) · **Kepada:** Gemini (arsitek)
> **Tanggal:** 13 Okt 2026 · **Branch:** `feat/light-dark-living` · **Repo:** `administrasi-spj-bos/`
> **Perintah verifikasi:** `cd spj-frontend && npm run test` (18/18 ✅) · `npm run build` (✅ 29s)

Tujuan dokumen ini: memberi Gemini konteks penuh hasil eksekusi Fase 1–5 agar bisa merespons dengan arahan berikutnya. Semua klaim di bawah terverifikasi dari kode (bukan asumsi).

---

## 1. STATUS CHECKLIST BLUEPRINT

| Fase / Tugas | Status | Bukti |
|---|---|---|
| 1.1 Pemulihan tema (`main.jsx`) | ✅ DONE | `spj-frontend/src/main.jsx` — paksa light dihapus, bungkus `ThemeProvider` |
| 1.1 Context terpusat | ✅ DONE | `src/contexts/ThemeContext.jsx` + `src/components/ui/ThemeToggle.jsx` di-restore dari HEAD (sebelumnya deleted di worktree) |
| 1.1 `tailwind.config.js` SSOT + dark | ✅ DONE | `darkMode:"class"` dikembalikan; token brand/landing dipertahankan |
| 1.1 Dark CSS | ✅ DONE | Blok `.dark` (±180 baris, gradasi animasi) disisip kembali ke `src/index.css`, marker light-only dihapus |
| 1.2 README 13→18 template | ✅ DONE | `README.md` + `spj-frontend/README.md` (rewrite total, 18 ID terverifikasi `grep`) |
| 1.2 DESIGN.md selaras | ⚠️ SEBAGIAN | Hanya dicatat sebagai panduan + SSOT di README. **Konflik font belum diputus:** `tailwind.config.js` = Inter/Hanken Grotesk vs `DESIGN.md` = Plus Jakarta Sans/Montserrat. Butuh keputusan arsitek. |
| 1.3 `PratinjauPage.jsx` + `/pratinjau` | ✅ VERIFIED | Rute ada (`App.jsx`), file statis self-contained (React+lucide only), tak sentuh layout. Lolos build. |
| 2.1 `storageAdapter.js` baru | ✅ DONE | `src/utils/storageAdapter.js` — try-catch `QuotaExceededError`, estimasi ±5MB, warn 80%, event `onQuotaWarning`, `spj_schema_version="1.0.0"` + `registerMigration` |
| 2.2 Refactor `storageHelper.js` | ✅ DONE | Seluruh `localStorage` langsung dialihkan ke adapter; API (`get/set/remove/clear/getAll`) tidak berubah + teruskan helper kuota |
| 2.3 Notifikasi kuota | ✅ DONE | `Toast.jsx` subscribe `onQuotaWarning` → warning toast (exceeded 8s / nearing 6s, bahasa Indonesia) |
| 2.3 versi skema aktif | ✅ DONE | `DashboardLayout.jsx` panggil `ensureSchemaVersion()` tiap mount |
| 3.1 Vitest + `npm run test` | ✅ DONE | `vitest@2.1.9` (lihat deviasi D1), skrip `test: vitest run` |
| 3.2 Unit test BKU | ✅ DONE | `src/utils/__tests__/bkuParser.test.js` (10 test): DD-MM-YYYY, 5 tipe transaksi, riil-vs-semua, mamin `5.1.02.01.01.0052`, rekap bulanan |
| 3.2 Test adapter | ✅ DONE (bonus) | `__tests__/storageAdapter.test.js` (5 test, localStorage di-stub) |
| 4.1 TemplateEngine konsisten + error boundary | ✅ DONE | `BlockErrorBoundary` per-blok, guard data null, fallback blok tak dikenal; `__tests__/templateConfig.test.js` (3 test: tepat 18 ID, 9 tipe blok) |
| 4.2 Toggle tema Topbar/Sidebar | ✅ DONE | `Topbar.jsx` (icon) + `Sidebar.jsx` (pill, pola HEAD) |
| 5.1 Proxy AI aman | ✅ DONE | `api/[...path].js`: utamakan `GROQ/CEREBRAS/GEMINI_API_KEY` server, fallback header, 401 bila kosong, **fix bug Gemini** (dulu Bearer → kini `?key=`), tanpa log key; `.env.example` + catatan `aiConfig.js` |

---

## 2. DEVIASI & KEPUTUSAN EKSKUTOR (minta ratifikasi)

- **D1 — Vitest 2, bukan terbaru.** `vitest@5` gagal startup (`ERR_PACKAGE_PATH_NOT_EXPORTED: ./module-runner`, butuh Vite 6+; proyek Vite 5). Dipin `vitest@^2.1.9` via `--legacy-peer-deps`. Alternatif (naik Vite 6+) di luar scope — arsitek putuskan.
- **D2 — `TRANSACTION_TYPES` + `KATEGORI_BELANJA` kini named-export** (`bkuParser.js`, +2 baris). Sebelumnya hanya via default-export; test butuh import langsung. Tidak mengubah logika.
- **D3 — File landing (`LandingPage.jsx` ±1340 baris, `Sidebar.jsx`, `PengaturanPage.jsx`, dsb.) TIDAK disentuh** selain sisipan toggle tema; diff besar di file itu milik pekerjaan branch sebelumnya, bukan eksekutor.
- **D4 — `isBalanced` diuji sebagai `false` pada fixture** (BOSP 82,56jt vs belanja riil 1,5jt — wajar tidak balance). Path `true` belum ada fixture; bisa ditambah bila arsitek minta.
- **D5 — Proxy: frontend prod (`aiConfig.getProviderUrl`) tetap panggil URL langsung provider** bila di luar localhost; proxy server-key baru terpakai bila frontend memanggil `/api/*`. Migrasi penuh ke same-origin proxy butuh keputusan arsitek (D6).

---

## 3. STATE GIT SAAT INI (belum di-commit)

- Modified 22 file (lihat `git status`); untracked: `ANALISIS_PROYEK.md`, `docs/CHANGELOG_REDESIGN.md`, `docs/REDESIGN_LANDING_PAGE.md`, `PratinjauPage.jsx`, `storageAdapter.js`, `__tests__/` (3 file).
- `ThemeContext.jsx`/`ThemeToggle.jsx` sudah match HEAD (tak muncul di status).
- Eksekutor **tidak commit** (mode eksekusi langsung tanpa commit). Menunggu arahan: commit sekarang / squash / tetap worktree.

---

## 4. HASIL VERIFIKASI

```
npm run test → 3 files, 18 tests, ALL PASSED (bkuParser 10, storageAdapter 5, templateConfig 3)
npm run build → ✓ built in 29.17s (warning pre-existing: chunk >500kB pdfjs)
```

---

## 5. PERTANYAAN UNTUK ARSITEK (mohon respon)

1. **Font final:** Aceasta `tailwind.config.js` (Inter/Hanken) atau migrasi ke `DESIGN.md` (Plus Jakarta Sans/Montserrat)? Jika migrasi — scope satu PR font saja?
2. **Vitest:** tetap v2 + Vite 5, atau naikkan Vite 6+ (risiko: plugin React, Tailwind 3, `copy-docs.js`)?
3. **D6 — Arsitektur AI prod:** (a) frontend tetap direct-URL + VITE_* key (key terekspos, status quo), atau (b) wajibkan same-origin `/api/*` + server key (perlu ubah `getProviderUrl` + fallback dev)? Rekomendasi eksekutor: (b).
4. **Commit:** bolehkan eksekutor `git add+commit` pekerjaan Fase 1–5 sekarang? Pesan commit apa?
5. **Prioritas berikutnya** (pilih/urutan): Electron+SQLite roadmap · code-splitting pdfjs · fixture `isBalanced=true` · migrasi `seedMockData`/`mockData` ke adapter · hapus BLUEPRINT duplikat/README lama?
6. **`spj-frontend/README.md` vs `DESIGN.md`:** hapus sisa referensi Material Symbols (masih dipakai 500+ tempat di kode) atau pertahankan dual-icon?

---

## 6. KONTEKS PENTING UNTUK RESPON BERIKUTNYA

- Pola kerja aktif: arsitek → paste instruksi di chat; eksekutor → ubah kode + verifikasi run/test + lapor. Jangan minta eksekutor "rencana dulu" kecuali dinyatakan.
- File SSOT: template = `src/data/templateConfig.js` (18); token desain = `tailwind.config.js`; versi storage = `spj_schema_version`.
- Batasan safety: auth dummy (`spj_auth`), tanpa backend, localStorage ±5MB — Electron+SQLite tetap roadmap (`docs/elektron/`).
- Lokasi laporan ini: `docs/LAPORAN_EKSEKUSI_FASE1-5.md`. Lampiran: `ANALISIS_PROYEK.md` (root).

---

## 7. TINDAK LANJUT 13 Okt 2026 (pukul ±15.20) — Instruksi arsitek via chat

### 7.1 Mockup Landing 13→18 ✅
- `LandingPage.jsx`: `DOC_STATS value 13→18`, `STATS number 13→18`, `"8 dari 13 template"→"8 dari 18 template"`
- Bonus konsistensi: `DashboardHome.jsx` (2× `"13 Template Cetak"`), `LoginPage.jsx` (`"13 Template Dokumen Siap Pakai"`)
- Tidak tersentuh (benar angka lain): `text-[13px]`, indeks kolom parser, kode referensi `03.03.13` dsb.

### 7.2 Kontras teks pendukung ✅ (`LandingPage.jsx` saja; `PratinjauPage` statis di luar scope)
- `text-muted/90` → `text-slate-600 dark:text-slate-300`
- `text-white/60` (ikon mockup sidebar navy) → `text-slate-300`
- `text-slate-500` (desc template) → `text-slate-600 dark:text-slate-300`
- `text-white/70` (CTA biru) → `text-slate-100`
- `text-muted/70` (footer sosmed) → `text-slate-600 dark:text-slate-300`
- `text-muted` polos (#475467, ±4.8:1) dipertahankan — sudah memenuhi kontras.

### 7.3 Finalisasi Tugas 2–5 ✅
- **Proxy `/api/*`**: `node --check api/[...path].js` OK; path dev (`vite.config.js` rewrite) ≡ path server (rewrite + `?key=` Gemini) terverifikasi selaras; `vercel.json` mengandalkan routing konvensi `api/[...path].js` (fungsi 30s).
- **Bundel**: `vite.config.js` tambah `manualChunks { pdfjs, xlsx-vendor }`. Hasil build: `xlsx-vendor 429KB` terpisah, main `1173KB→742KB`, `pdfjs 365KB` tetap terpisah (dynamic import `AskAIPanel.jsx:123`). Warning >500KB tersisa hanya main chunk (React+app) — perlu route-lazy bila arsitek minta.
- **Migrasi storage**: NOL sisa `localStorage.*('spj_*')` langsung di `src/` (terverifikasi `grep`). Dimigrasi: `App.jsx` (guard dukung nilai lama `"true"` & baru `true`), `LoginPage.jsx`, `Sidebar/Topbar.jsx` (logout), `mockData.js` (seed), `kodeReferensi.js` + `ReferensiKodePage.jsx`, `NomorSuratPage.jsx` (save+load, konstanta mati dihapus), `ThemeContext.jsx` (via adapter mentah agar string `light/dark` lama tetap kompatibel).
- **Verifikasi**: `npm run test` 18/18 ✅ · `npm run build` ✅ 53s.

---

## 8. ROMBAK HERO LANDING (spek arsitek, ±16.00)
- Kontainer hero → `bg-slate-50 dark:bg-slate-950` + ambient glow `blue-500/10 blur-[120px]`; grid `lg:grid-cols-12` (`container mx-auto px-4 sm:px-6 lg:px-8`); kolom teks & mockup `lg:col-span-6`. Dekor lama (batik/blob/dots dust) dihapus dari hero.
- Judul → `text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white`; sub → `text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed`.
- Card preview → glassmorphism `bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md border-slate-800 rounded-2xl shadow-2xl p-6 ring-white/10` (isi mockup dipertahankan).
- Konsistensi 18: `grep` nilai `13` di Landing/DashboardHome/Login bersih (exit 1).
- Verifikasi: `npm run build` ✅ · `npm run test` 18/18 ✅.
