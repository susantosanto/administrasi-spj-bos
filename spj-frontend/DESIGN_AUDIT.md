# DESIGN_AUDIT.md

> Audit UI/UX — Aplikasi LPJ BOS/BOSP
> Tanggal: 14 Okt 2026
> Auditor: Arsitek UI/UX
> Sumber: DESIGN.md, tailwind.config.js, index.css, package.json, struktur folder
> Status: **P0 — Blocking. Redesign total diperlukan sebelum fitur baru.**

---

## 1. Ringkasan Eksekutif

Aplikasi ini memiliki logika bisnis yang matang (parser, 18 template, storage
adapter, AI proxy) tetapi presentasi visual yang kacau. Akar masalahnya:
**tidak ada satu design system**. Yang ada adalah 3 design system yang bertabrakan:

1. `DESIGN.md` — hasil scraping website Coretax DJP (brandmd tool), bukan keputusan desain
2. `tailwind.config.js` — 2 set brand color (brand + primary), token bertumpuk
3. `index.css` — 40+ !important, gradient animasi body, 30+ keyframes

**Rekomendasi:** reset UI/UX total dengan pendekatan strangler fig —
pertahankan logic layer, ganti presentation layer bertahap.

---

## 2. Temuan P0 — Blocking

### P0-1. Tiga Design System Bertabrakan

| Aspek | DESIGN.md | tailwind.config.js | index.css |
|---|---|---|---|
| Font utama | Plus Jakarta Sans | Inter + Hanken Grotesk | Inter + Hanken Grotesk |
| Font sekunder | Montserrat | (tidak ada) | (tidak ada) |
| Primary color | #212C5F | #155EEF (brand) + #004ac6 (primary) | #004ac6 |
| Page bg | #F8FAFC solid | #f8f9fb | #f8f9fb + gradient animasi |
| Card radius | 20px | 12px (rounded-xl) | 12px |
| Radius scale | 8/10/12/14/16/20/50%/100px | 4/8/12/16/24/full | 8/12/16/24 |

**Dampak:** Developer bingung pilih token. Warna biru landing beda tipis dengan
biru dashboard. Kesan: tidak sengaja.

**Tindakan:** Hapus DESIGN.md lama. Tulis design system baru. Satukan brand +
primary → satu token primary.

### P0-2. Dark Mode = "Party Mode", bukan Dark Mode

Bukti di `index.css`: `.dark body` pakai gradient 8 warna yang beranimasi 18 detik.

**Dampak:**
- Kontras teks berubah-ubah → sulit dibaca
- Melelahkan mata untuk sesi panjang
- Tidak profesional untuk konteks kerja administrasi
- Boros CPU/battery

**Tindakan:** Ganti dengan solid #0B1020. Hapus semua gradient body animasi.

### P0-3. !important War di Dark Mode

40+ baris !important di blok .dark untuk override bg-white, text-slate-900,
border-slate-100.

**Dampak:**
- Specificity war — susah di-maintain
- Menandakan komponen hardcode bg-white alih-alih pakai semantic token

**Tindakan:** Pakai CSS variables + semantic tokens. Komponen tulis bg-surface,
otomatis berubah di dark mode tanpa !important.

### P0-4. Light Mode Juga Gradient Animasi

`body` di light mode pakai gradient 7 warna yang beranimasi 28 detik.

**Tindakan:** Ganti dengan solid #F8F9FB.

---

## 3. Temuan P1 — High Priority

### P1-1. Dual Color Token (brand vs primary)
`brand: #155EEF` dan `primary: #004ac6` hidup berdampingan.
**Tindakan:** Satukan jadi satu primary.

### P1-2. Dual Icon Set
Material Symbols + lucide-react (500+ pemakaian).
**Tindakan:** lucide-react saja.

### P1-3. Animasi Berlebihan
30+ keyframes custom: fly-in-fly, metaball-morph, orb-move, marquee, dll.
**Tindakan:** Hapus animasi infinite di area kerja.

### P1-4. Hardcoded Colors di Komponen
Banyak komponen pakai bg-white, text-slate-900 langsung.
**Tindakan:** Refactor pakai token semantik.

---

## 4. Yang Dipertahankan (Logic Layer)

- src/utils/bkuParser.js — Parser ARKAS
- src/utils/sekolahParser.js — Parser Dapodik
- src/utils/guruTendikParser.js — Parser 51 kolom Dapodik
- src/utils/storageAdapter.js — Quota guard, versioning
- src/utils/nomorSurat.js — Auto-increment + roman bulan
- src/data/templateConfig.js — **18 template SSOT, jangan disentuh**
- src/data/ (semua) — Data statis referensi
- api/[...path].js — AI proxy
- src/utils/__tests__/ — 18 test jaring pengaman
- Logika AI (chat, classifier, cache)

---

## 5. Yang Di-refactor (UI Layer)

- tailwind.config.js — ganti total, token bersih
- src/index.css — ganti total, tanpa !important war
- src/components/ (visual) — refactor pakai token baru
- src/pages/ (layout) — rebuild bertahap
- TemplateEngine.jsx — logika render dipertahankan, wrapper visual diganti
- Block components (9 tipe) — logika render dipertahankan, styling diganti
- Dark mode strategy — solid, bukan gradient
- Icon strategy — lucide-react saja
- Animasi — reset ke minimum fungsional
- DESIGN.md — ganti dengan design system v2

---

## 6. Rekomendasi Eksekusi

Pendekatan: Strangler Fig Pattern
- Bangun UI baru di src/ui/ (paralel dengan src/components/ lama)
- Migrasi halaman satu per satu
- Pensiunkan UI lama setelah semua halaman pindah

Urutan:
1. Fase 0 — Bekukan state (step ini)
2. Fase 1 — Ganti token fondasi
3. Fase 2 — Bangun komponen inti di src/ui/
4. Fase 3 — Rebuild layout
5. Fase 4 — Migrasi 16 halaman bertahap
6. Fase 5 — Polish (print, a11y, performa)

---

*Audit selesai.*
