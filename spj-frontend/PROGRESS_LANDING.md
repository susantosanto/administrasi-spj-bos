# Progress — Landing Page & Login (Handoff)

Terakhir diperbarui: **Senin, 26 Okt 2026** (review + perapian dokumen)
Sesi kerja yang didokumentasikan: **Minggu, 25 Okt 2026**

| Item | Nilai |
|---|---|
| Branch kerja | `feat/light-dark-living` — HEAD `1549a4a` *"feat: revisi fitur dark mode dan aset pendukung"* (ahead 2 dari `origin/feat/light-dark-living`) |
| Baseline | `main` @ `d3b71d3` |
| Status commit | ❌ **BELUM di-commit** — semua hasil sesi masih di working tree (lihat §2) |
| Build terakhir | ✅ `npm run build` lulus **12,65s** (26 Okt 2026, setelah audit layout per-section) |
| Dev server | `npm run dev` → http://localhost:5173/ |

> Catatan: dokumen versi lama menulis "Branch: main (HEAD d3b71d3)". Itu keliru — `main` hanya baseline; semua pekerjaan ada di branch `feat/light-dark-living`.

---

## 1. Ringkasan

Redesign Landing Page (profesional-minimalis + identitas Sundanese halus), penyelarasan Login Page (glassmorphism satu layar), rebranding ke logo/nama **Asik — Aplikasi Sistem Keuangan**, plus sistem loading branded (boot splash + `BrandedLoader`). Semua perubahan **UI/UX frontend**; logika bisnis, DB, API, dan routing tidak diubah.

**Sudah disetujui user:** fondasi desain landing ("mantap, pas banget") dan floating dock bawah.
**Menunggu review user:** splash loader ASIK, Login Page (glass → satu layar → card kecil → pure glassmorphism).
**Dibatalkan:** redesign brief besar (dikembalikan ke desain pra-brief).

---

## 2. Status commit & scope (PENTING)

### Belum di-commit di `spj-frontend`

| File | +/− | Isi perubahan |
|---|---|---|
| `src/pages/LandingPage.jsx` | 1137 baris berubah | rewrite + restore 7 kartu fitur & section Tentang + rebrand + fix dark/dock |
| `src/pages/LoginPage.jsx` | 433 | selaras palet, rebrand, glassmorphism satu layar, card diperkecil |
| `src/index.css` | 148 | perf fix, shimmer, batik-drift, `.glass-input`, CSS loader |
| `index.html` | 130 | script tema anti-FOUC, boot splash ASIK, preload logo, `<title>` baru |
| `src/App.jsx` | 54 | durasi splash berbasis kesiapan nyata (routing tidak disentuh) |
| `src/components/layout/Topbar.jsx` | 30 | `BrandedLoader` saat logout |
| `src/components/layout/Sidebar.jsx` | 30 | `BrandedLoader` saat logout |
| `package-lock.json` | −9 | penyesuaian binary rollup (lihat §3) |

**Untracked:** `PROGRESS_LANDING.md`, `public/asik-logo.png`, `src/components/ui/BrandedLoader.jsx`.

### Di luar `spj-frontend` (melanggar aturan §4 no.3, belum tercatat di dokumen lama)

Aset di root repo **dipindahkan** ke folder (terdeteksi sebagai delete + untracked):

```
Dark Mode.jpeg          → Dark Mode/Dark Mode.jpeg
Light Mode.jpeg         → Light Mode/Light Mode.jpeg
(baru)                  → Logo/ASIK.png
```

Asal-usul pemindahan ini belum dipastikan (kemungkinan sesi lain/kerja manual). **Jangan** commit perubahan root ini bersama pekerjaan landing tanpa konfirmasi user.

---

## 3. Environment / setup

Git tidak tersedia di `PATH` default shell (`git: command not found`). Jalankan dulu:

```bash
export PATH=/opt/Freebuff/resources/git/bin:$PATH
export GIT_EXEC_PATH=/opt/Freebuff/resources/git/libexec/git-core
```

`npm install` ulang pernah diperlukan di `spj-frontend`: `node_modules` sebelumnya berisi binary Windows (`@rollup/rollup-win32-*`) sehingga butuh `@rollup/rollup-linux-x64-gnu` — ini yang menjelaskan diff `package-lock.json` (−9 baris).

Tidak ada lint/test di `package.json` (hanya `dev`, `build`, `preview`). Verifikasi = build + cek browser manual.

---

## 4. Aturan kerja (constraint user)

1. Hanya revisi UI/UX frontend (tampilan, styling, komponen visual, aset).
2. Jangan sentuh logika bisnis, workflow, DB, API, routing utama, backend.
3. Batasi perubahan hanya di `spj-frontend` (khususnya `components`/`styles`).
4. Selalu jelaskan file yang akan diubah dulu.
5. **Pelajaran:** user tidak nyaman dengan redesign brief besar — minta perubahan visual **kecil bertahap** (satu elemen per perubahan + verifikasi).

---

## 5. Changelog

### 5.1 Sesi 1 — Landing Page (25 Okt 2026, siang–sore)

| # | Perubahan | File | Status |
|---|---|---|---|
| 1 | Perf & bug CSS: hapus duplikat `body::after` dark (double background), matikan animasi infinite body/pseudo-layer, hapus `backdrop-filter: blur()` global dark, hapus `html * { transition }` universal | `src/index.css` | ✅ tetap |
| 2 | Redesign Landing Page: Professional Minimalism + Modern SaaS + Subtle Sundanese, desktop-first. Palet light `primary #2457A7` / hover `#1D4688` / bg `#F3F5F9` / surface `#FFF` / heading `#1D2939` / body `#52627A` / muted `#66758A` / border `#E1E7EF` / softBlue `#EAF1FB` / success `#16835D`; dark via `useTheme()` | `src/pages/LandingPage.jsx` | ⚠️ di-revert (§5.3) |
| 3 | Motion: `fade-up` hero berurutan (delay 0–0.4s), `Reveal` (IntersectionObserver) untuk mockup + feature cards (stagger 120ms), `float-soft` ±8px/6s, `view-switch` 0.45s, auto-cycle menu mockup 3.5s, semua hormat `prefers-reduced-motion` | `LandingPage.jsx`, `index.css` | ✅ tetap |

**Struktur final landing (setelah revert + restore):** header fixed (logo + nav Beranda/Fitur/Tentang + ThemeToggle + CTA `/login`) → hero 2 kolom (badge, heading, deskripsi, CTA, `DashboardMockup` sidebar+stats+tabel data dummy) → section Fitur (`id=fitur`, 7 kartu) → section "Kenapa Memilih Kami?" (`id=tentang`, 3 kartu) → CTA + footer → floating dock 3 nilai.

### 5.2 Sesi 2 — Motion, dock, splash (25 Okt 2026, ±21:00–23:59)

| # | Perubahan | File | Status |
|---|---|---|---|
| 4 | Batik light mode lebih terlihat: opacity `0.06 → 0.3` + `mix-blend-mode: multiply` (dark tetap `0.07` normal) | `index.css`, `LandingPage.jsx` | ✅ disetujui |
| 5 | `.text-shimmer` glint via `background-clip: text` (6.5s, delay bergencar) pada "Sampurasun!", "Aplikasi Sistem Keuangan", "Satu Aplikasi"; varian light/dark; reduced-motion safe | `index.css`, `LandingPage.jsx` | ✅ tetap |
| 6 | Floating dock bawah: 3 nilai (Aman & Terpercaya, Mudah Digunakan, Sesuai Regulasi) dipindah dari hero ke `fixed` bottom-center, glassy + blur, icon-only di layar kecil; footer `pb-28` | `LandingPage.jsx` | ✅ **disetujui user** |
| 7 | Boot splash (di luar scope landing, atas izin user): script tema sejak paint pertama (**FOUC teratasi**), splash logo SVG + progress bar indeterminate, theme-aware. `App.jsx` menahan splash 0.95s (150ms reduced) → fade 0.5s → remove | `index.html`, `App.jsx` | ✅ tetap |
| 8 | Loader ASIK Animated (CSS dari user, **wajib inline** karena tampil sebelum bundle React); adaptasi dark mode + selector reduced-motion dibetulkan | `index.html` | 🕓 menunggu review visual |
| 9 | Logo Asik asli di splash disc: PNG latar putih → transparan (un-premultiply) + trim → `public/asik-logo.png` (280×105, ±40KB) | `public/asik-logo.png` | ✅ |
| 10 | Durasi splash = kesiapan nyata, bukan timer: font ready (cap 2.5s) + logo termuat + minimum 1.4s; pengaman cap 6s; keluar saat React ter-render. Preload logo + `__BOOT_T0` | `App.jsx`, `index.html` | ✅ |

### 5.3 Revert & restore

**REVERT** (permintaan user): seluruh redesign brief besar dibatalkan, kembali persis ke desain pra-brief — palet lama, header `py-3`, hero "Selamat Datang…", batik full-bleed `0.3` light, mockup cycle 3.5s, kartu `rounded-xl`, TANPA section Tentang.
Yang **tetap** dari pekerjaan antara: splash ASIK + logo + durasi readiness, dock bawah, shimmer, dock shadow.

> Dokumen lama menyebut "semua perubahan item 9 dibatalkan" — referensi itu menggantung (daftar hanya 1–8). Yang benar: revert berlaku untuk **redesign brief secara keseluruhan**, bukan satu item.

**USER APPROVE FONDASI DESAIN** ("mantap, pas banget") — tetapi user komplain "banyak fitur awal hilang".
Audit `git show HEAD:LandingPage.jsx` (`1549a4a`) menunjukkan versi tercommit punya **7 kartu fitur asli** + section "Kenapa Memilih Kami?" yang lenyap saat rewrite. Restore:

- 4 kartu generik → **7 kartu asli** (copy persis dari versi commit): Upload BKU (ARKAS), Generate Foto Dokumentasi AI, Cetak Otomatis, 13 Template, Data Sekolah (Dapodik), Data Guru & Tendik, Catatan Penting.
- Section **"Kenapa Memilih Kami?"** (`id=tentang`) kembali: 3 kartu (Dirancang untuk Operator / Otomatis & Cerdas / Keamanan Terjamin) — token biru saja (bukan warna kaleidoskop lama); sekaligus memperbaiki nav "Tentang" yang mati.
- Desain hero/mockup/dock **nol perubahan**. Build ✅ 20s.

### 5.4 Rebrand & perbaikan landing

| # | Perubahan | File | Status |
|---|---|---|---|
| 11 | **Rebrand:** toga → logo Asik; "LPJ BOS/BOSP" → "Aplikasi Sistem Keuangan". Terdampak: header lockup (`asik-logo.png` h-8), footer (h-7 + copyright), topbar mockup (h-4 + text-xs), H1 baris-2 hero, splash title + subtitle ("Pertanggungjawaban Dana BOS/BOSP"), `<title>` | `LandingPage.jsx`, `index.html` | ✅ disetujui |
| 12 | Badge hero "Sistem Informasi LPJ BOS/BOSP" & copy section **sengaja tidak** diubah — merujuk program BOS, bukan brand (dikonfirmasi user) | — | ✅ |
| 13 | Fix dark mode mockup: label "Beranda, Data Sekolah…" pudar karena sidebar/header tabel ber-bg terang (`#FAFBFD`) tapi label pakai muted dark (`#94A3B8`). Kirim `isDark` ke `DashboardMockup` + `labelSolid = isDark ? #33415C : P.muted` untuk item sidebar non-aktif & label kolom tabel | `LandingPage.jsx` | ✅ |
| 14 | Fix dock lenceng ke kanan: `animate-fade-up` (fill both) menimpa seluruh `transform` sehingga `-translate-x-1/2` hilang → wrapper `fixed inset-x-0 flex justify-center pointer-events-none`, div animasi `pointer-events-auto` | `LandingPage.jsx` | ✅ |
| 15 | Fix batas layar pertama: teks section berikutnya bocor ke layar 1 → hero `min-h-[calc(100vh-64px)] flex items-center`; dock jadi batas bawah layar pertama | `LandingPage.jsx` | ✅ |
| 16 | Dock dikecilkan: pill `p-1/p-1.5`, item `px-2/3 py-1.5`, icon 16px, label `text-xs`, divider `h-5`, `bottom-3/5` | `LandingPage.jsx` | ✅ |
| 17 | Batik motion: keyframes `batik-drift` `translateY(0→360px)` = tepat 1 tile (loop tanpa lompatan), 40s linear infinite, `will-change: transform`; layer `inset-x-0 -inset-y-[360px]` agar tak ada celah; termasuk daftar reduced-motion (statis) | `index.css`, `LandingPage.jsx` | ✅ |

### 5.5 Sesi 3 — Login Page (25 Okt 2026, ±23:30–23:59)

| # | Perubahan | File | Status |
|---|---|---|---|
| 18 | Selaraskan login ("selaraskan broo"): biru lama `#004ac6/#003d99` → `#2457A7/#1D4688` (12 titik: chip, focus ring, link, checkbox, tombol + shadow); rebrand chip kaca wallet/toga → chip putih + `asik-logo.png` h-7, nama + sub, copyright footer; "Aman & Terenkripsi" → "Aman & Terpercaya"; link mati "Lupa password?"/"Hubungi admin" → `toast.info` (tersedia di `Toast.jsx` L19). Metaball & layout tidak disentuh | `LoginPage.jsx` | ✅ build 28s |
| 19 | Login glass (eksperimen): logo presisi (chip auto-width, img h-8 — wordmark 75px tadinya overflow chip 52px); panel kanan bg putih → batik + `animate-batik-drift` sama dgn landing (0.22 light multiply / 0.06 dark); form → kartu glassmorphism (bg putih 72% / dark slate 62%, `blur(18px) saturate(1.4)`, border putih 70 / putih 10, `rounded-2xl p-7/8`); top actions tetap di atas kartu | `LoginPage.jsx` | 🕓 ditimpa desain berikutnya |
| 20 | Login satu layar ("gabungkan, tanpa bilah kanan-kiri"): `LoginPage.jsx` ditulis ulang penuh — panel gradient/metaball dihapus; batik drift full-page (0.3 light multiply / 0.07 dark = sama dgn landing) + 2 mesh blob hero + brand lockup terpusat + glass card 440px tepat di tengah + footer PROTOTYPE/©. Konten & logika form tidak berubah | `LoginPage.jsx` | 🕓 ditimpa desain berikutnya |
| 21 | Card diperkecil ("size card nya kurangi, tanpa scroll"): brand h-12→h-10, mb-7→mb-5; card 440→400px, p-7/8→p-6, container py-12→py-8; top actions mb-6→mb-4; header `text-[26px]`→`[22px]`, sub 14→13px; input h-12→h-11 (`pl-12`→`pl-11`, `pr-12`→`pr-11`); submit h-12→h-11; divider my-6→my-4; footer mt-7→mt-5 (hemat ±100px tinggi) | `LoginPage.jsx` | 🕓 ditimpa desain berikutnya |
| 22 | **Pure glassmorphism:** `.glass-input` baru di `index.css` — input cabut `bg-slate-50` (jebakan: global `.dark .bg-slate-50` opaque `0.88 !important` bikin solid) → light `rgba(255,255,255,0.55)` / dark `rgba(255,255,255,0.08)`; border tetap via `border-slate-200` + dark override `#24365f`. Card: bg `0.72/0.62` → `0.50/0.50` (dark base slate-900), border `0.70→0.75` light / `0.10→0.14` dark, `blur 18→24px` + `saturate 1.6` | `index.css`, `LoginPage.jsx` | 🕓 **menunggu review** |

Catatan: entri 19 → 20 → 21 → 22 saling menimpa. Yang **berlaku sekarang** adalah hasil entri 21 + 22 (satu layar + pure glass): batik full-page, brand lockup terpusat, card ±400px, input `.glass-input`, `blur(24px) saturate(1.6)`.
Hilang bersama panel kiri: headline "Kelola Keuangan Sekolah…", 3 poin fitur, shield row — bisa dikembalikan sebagai chip mini bila user rindu.

### 5.6 Sesi 4 — Sistem loading branded (25 Okt 2026, 23:59)

| # | Perubahan | File | Status |
|---|---|---|---|
| 23 | Komponen baru `BrandedLoader` — markup ASIK loader identik splash, reuse class `.asik-*` global dari `<style>` `index.html` (zero duplikasi CSS); gradient ring id sendiri (`asik-ring-gradient--app`) + stroke inline; 2 varian: `fullscreen` (`.app-loader-screen`, bg `#F3F5F9/#0F172A`, z-9999) & `overlay` (`.app-loader-overlay` frosted blur); prop `title`/`subtitle`; CSS fade in/out di `index.css` + reduced-motion list | `src/components/ui/BrandedLoader.jsx`, `index.css` | 🕓 belum ada feedback |
| 24 | Pasang di logout `Topbar` & `Sidebar`: stage `show` (850ms) → `exit` (fade 320ms) → bersihkan storage (persis lama) → `navigate('/')`. Navigasi antar-halaman **tidak** dipabiru-waktu (SPA eager, instan) | `Topbar.jsx`, `Sidebar.jsx` | 🕓 belum ada feedback |
| 25 | Siap dipakai nanti untuk proses berat: `<BrandedLoader variant="overlay" title="…" subtitle="…" />` | — | 📋 tersedia |

### 5.7 Sesi 5 — Fix kontras link Login (26 Okt 2026)

| # | Perubahan | File | Status |
|---|---|---|---|
| 26 | "Lupa password?" & "Hubungi admin" hardcode `#2457A7` → **2,55** di atas glass gelap. Diganti warna kondisional `isDark ? "#60A5FA" : "#2457A7"` lewat inline style (konvensi yang sudah dipakai brand lockup login), class `text-[#2457A7]` dilepas. Hasil terukur: dark **7,02**, light **6,71**. Desain kaca kartu tidak disentuh | `LoginPage.jsx` | ✅ build 12,50s |

Catatan kecil yang **tidak** diubah: hover link "Beranda" di kartu (L99) masih `hover:text-[#2457A7]` — hanya berlaku saat hover, dan base-nya `text-slate-400` tetap terbaca.

### 5.8 Sesi 6 — Audit layout per-section (26 Okt 2026)

Hasil audit scroll landing: section sudah bersambung tanpa celah (gap 0), tapi ada 3 cacat presisi.

| # | Masalah yang ditemukan | Perbaikan | Status |
|---|---|---|---|
| 27 | **Dock menutupi konten section lain.** Dock `fixed` selalu menempel di bawah viewport, jadi saat scroll ia menimpa kartu/teks: pada scrollY 400 menutup 4 judul kartu fitur, scrollY 700 menutup 6 deskripsi kartu, scrollY 900 menutup heading "Kenapa Memilih Kami?", scrollY 1200 menutup 3 deskripsi kartu | Dock kini tampil **hanya di layar pertama**: disembunyikan saat `scrollY ≥ 48` (fade 300ms + `pointer-events: none`), dan disembunyikan juga bila tidak ada ruang kosong di bawah konten hero (`gridBottom ≤ innerHeight − 64`), diukur ulang saat resize & `document.fonts.ready` | ✅ |
| 28 | **Kartu fitur menggantung tidak rata.** Wrapper `Reveal` stretch tapi kartu di dalamnya tidak, jadi dalam satu baris bottom-nya beda: 486 / 509 / 486 / 464 px | `h-full` pada wrapper `Reveal` + kartu fitur | ✅ kini 509/509/509/509 (baris 1) & 713/713/713 (baris 2) |
| 29 | **Anchor nav ketat ke header.** `#fitur`/`#tentang` mendarat tepat di top 0, heading hanya 3px di bawah header pada breakpoint dengan padding kecil | `scroll-mt-20` pada kedua section | ✅ section berhenti di 80px, heading di 160/144px, header bottom 61px |

**Verifikasi sesudah perbaikan (1440×900):** sapuan 14 posisi scroll → dock `opacity 0` setelah 48px dan **tidak ada satu pun** elemen teks/kartu tertutup; section tetap bersambung (gap 0, batas 900 / 1693 / 2130 / 2384); hero tetap tepat 1 viewport; tanpa overflow-x. Di 1280×720 & 1024×768 dock tampil dan clearance ke konten hero 41px / 32px; di 1024×700 & 768×900 dock otomatis tidak tampil karena konten hero sudah memenuhi layar.
Konsekuensi yang perlu diketahui: di viewport pendek/sempit (mis. 768×900) dock **tidak muncul sama sekali** — trade-off agar tidak ada konten tertutup.

---

## 6. Status per area

| Area | Status |
|---|---|
| Landing — struktur & copy fitur 7 kartu | ✅ disetujui user |
| Landing — hero, mockup, dark mode | ✅ disetujui user |
| Landing — dock bawah + shadow | ✅ disetujui user |
| Landing — batik drift & shimmer | ✅ jalan, belum ada feedback eksplisit |
| Rebrand Asik / "Aplikasi Sistem Keuangan" | ✅ disetujui user |
| Boot splash + durasi readiness | ✅ terverifikasi runtime light & dark (26 Okt) — review estetika user masih terbuka |
| Login — satu layar pure glass | ✅ terverifikasi runtime 1440×900 & 1600×900, tanpa scroll (26 Okt) — review estetika user masih terbuka |
| BrandedLoader (komponen + logout) | ✅ terverifikasi logout light & dark (26 Okt) |
| Kontras dark mode — link Login | ✅ diperbaiki 26 Okt (§5.7 no.26): dark 7,02 / light 6,71 |
| Kontras dark mode — CTA landing & aksen mockup | ❌ terbuka — lihat §7 |
| Presisi layout per-section (overlap/bocor/tertutup) | ✅ diperbaiki 26 Okt (§5.8): dock, tinggi kartu, offset anchor |

---

## 7. Known issues

| Isu | Detail |
|---|---|
| Bundle JS besar | Chunk utama `index-5aVNi5nb.js` **1.121,86 kB** (gzip 317,67) + `index-C9vWwqv4.js` 366,82 kB (xlsx) + `pdf` 365,12 kB → total JS ≈ **1,85 MB**. Pemecahan butuh pembatasan eager import di `App.jsx` = menyentuh routing, **perlu izin user** |
| Warning build | `xlsx` diimpor dinamis oleh `AskAIPanel.jsx` sekaligus statis oleh `bkuParser`/`guruTendikParser`/`sekolahParser` → dynamic import tidak memecah chunk (warning, bukan error) |
| FOUC tema | ✅ teratasi via script inline `index.html` |
| **Kontras CTA dark mode** | Tombol "Mulai Sekarang" (header, hero, CTA akhir) di dark = teks putih di atas `#60A5FA` → **kontras 2,54** (light 7,01). Gagal WCAG AA 4,5 maupun 3:1 untuk teks besar |
| **Kontras aksen mockup dark** | Mockup tetap ber-permukaan terang (`#FAFBFD`) tapi aksen memakai palet gelap: item sidebar aktif "Dokumen LPJ" `#60A5FA` → **2,46**; status "Selesai" `#34D399` → **1,86**; status "Proses" `#CBD5E1` → **1,43**. Fix §5.4 no.13 baru menutup label sidebar & header tabel, belum item aktif/status |
| **Kontras link Login dark** | ✅ **diperbaiki 26 Okt** (§5.7): "Lupa password?" & "Hubungi admin" kini `#60A5FA` di dark → **7,02** (light `#2457A7` → 6,71). Sebelumnya 2,55 |
| Konsistensi brand | Dashboard masih memakai brand lama (sidebar "LPJ BOS/BOSP" + ikon school). Rebrand sesi ini hanya menjangkau landing & login |
| Dock di viewport pendek/sempit | Dock disembunyikan total (bukan diperkecil) bila konten hero sudah memenuhi layar — mis. 1024×700 dan 768×900. Perlu keputusan bila dock ingin tetap tampil di ukuran itu |

---

## 8. Verifikasi runtime (26 Okt 2026)

Dijalankan dengan dev server `npm run dev` (port 5173) + inspeksi DOM/computed style pada 1440×900 dan 1600×900. Screenshot browser tidak tersedia (window tidak tergambar), jadi verifikasi lewat geometri & nilai CSS terhitung, bukan tangkapan layar.

| Cek | Hasil |
|---|---|
| Console & network | ✅ tanpa error; hanya warning React Router v7 future-flag; semua request 200/304 |
| Landing 1440×900 & 1600×900 | ✅ hero tepat 1 viewport (bottom 900), `#fitur` mulai tepat di 900, tanpa overflow-x |
| Dock | ✅ pill 460×42 di y=838–880, terpusat (717 dari 720 karena scrollbar 6px), konten footer clearance 56px (tidak tertutup) |
| Batik drift & shimmer | ✅ animasi `batik-drift / 40s`, 3 elemen `.text-shimmer` aktif |
| Boot splash | ✅ light (`#F3F5F9`, disc putih 0.94, title `#203B60`) & dark (`#0F172A`, disc slate, title `#F1F5F9`), gradient ring + animasi orbit/dash terdefinisi, `z-index 9999`, `__BOOT_T0` numeric; elemen terhapus setelah load |
| Login 1440×900 & 1600×900 | ✅ tanpa scroll (`docHeight` = 900), card 400×518 terpusat (x center 720/800), submit terlihat |
| Token glass Login | ✅ card bg 0.50/0.50, border 0.75/0.14, `blur(24px) saturate(1.6)`, radius 24; input 0.55 light / 0.08 dark; submit `#2457A7` |
| Login input dark | ✅ teks putih, placeholder `#94A3B8`, caret putih (tidak ada teks tak terbaca) |
| Kontras link Login (fix 26 Okt) | ✅ `Lupa password?` & `Hubungi admin` = `#60A5FA` di dark (**7,02**), `#2457A7` di light (**6,71**); toast masih muncul saat diklik; layout 1440×900 tetap tanpa scroll |
| Layout per-section (fix 26 Okt) | ✅ 14 posisi scroll di 1440×900: dock tak menutup apa pun setelah 48px; kartu fitur rata per baris; anchor berhenti 80px dengan heading clear 99/83px dari header; gap antar-section 0 |
| Logout `BrandedLoader` | ✅ terukur: 120ms muncul (opacity 0→1), 620ms opacity 1, 920ms class `is-exiting`, 1520ms hilang + `spj_auth` null + URL `/`; warna light & dark benar |
| Login mock (prototype) | ✅ username/password apa pun yang terisi → `/dashboard`; link mati memunculkan `toast.info` |

**Temuan terbuka dari verifikasi:** 3 isu kontras dark mode di §7 (CTA landing, aksen mockup, link login). Light mode lolos semua.

---

## 9. Next (calon lanjutan)

1. Review estetika oleh user — verifikasi teknis sudah lolos 26 Okt (§8); sisa: rasa visual splash & login.
2. **Perbaiki 2 isu kontras dark mode yang tersisa** (§7): warna teks CTA landing dan aksen item aktif/status mockup.
3. Sisa usulan loading (pilihan user): skeleton tabel/dasbor, overlay untuk aksi berat (parse Excel / generate LPJ), transisi route.
4. Keputusan: commit pekerjaan landing/login/loader (branch `feat/light-dark-living` sudah ahead 2 — perlu strategi commit & nama branch yang sesuai isi).

---

## 10. Perlu keputusan user (temuan terbuka)

| Temuan | Usulan |
|---|---|
| Kartu fitur menulis **"13 Template"**, padahal `TEMPLATE_CONFIGS` sekarang berisi **18 template** (README malah "26+ jenis dokumen") | Samakan angka, atau pakai copy tanpa angka |
| `index.html` punya atribut dobel/tidak valid: `fetchpriority="high" fetchprio="high"` | Hapus `fetchprio` (sisa salah ketik, tidak berbahaya) |
| `DESIGN.md` (design system CORETAX) belum dirujuk dokumen mana pun | Jadikan acuan token warna agar perubahan berikutnya konsisten |

---

## 11. Pelajaran sesi ini

- Perubahan visual besar dalam sekali jalan ditolak; **satu elemen per perubahan + verifikasi** lebih aman.
- Restore dari `git show HEAD:<file>` menyelamatkan konten yang hilang saat rewrite (7 kartu + section Tentang).
- `animate-*` dengan `fill: both` menimpa `transform` Tailwind (kasus `-translate-x-1/2` pada dock) — bungkus dengan wrapper.
- Global override `.dark .bg-slate-50 { … !important }` membuat elemen terlihat solid meski class transparan dipasang — pakai class khusus (`.glass-input`).
