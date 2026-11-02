# 📝 Changelog — Redesign Landing Page (2026-10-11)

Ringkasan teknis per file. Untuk konteks lengkap baca [REDESIGN_LANDING_PAGE.md](./REDESIGN_LANDING_PAGE.md).

## `spj-frontend/src/pages/LandingPage.jsx` (~880 baris)

### Data & copy
- Hero: badge, headline, subheadline, CTA & supporting text → diganti persis sesuai spesifikasi
- `TRUST_ITEMS` → 4 item faktual (Mudah Digunakan, Data Terorganisasi, Template Dokumen, Akses & Navigasi Praktis)
- `FEATURES[1]` → `Template Dokumen Lengkap` (hapus angka 13 repetitif)
- `STATS[2]` → "3 langkah: Dari BKU ke LPJ siap cetak" (hapus klaim 85% tak terverifikasi)
- `DOC_STATS` (baru) → 13/8/3/2 untuk mockup hero
- Judul fitur → "Semua kebutuhan administrasi dalam satu tempat"
- Judul template → "Semua template LPJ siap cetak"
- CTA penutup → headline/deskripsi sesuai prompt; tombol ganda dipangkas jadi satu

### Mockup hero
- Panel "Ringkasan Dana" → "Ringkasan Dokumen" + badge "Data ilustrasi"
- Kartu statistik: 4 kolom (13 / 8 / 3 / 2) dengan warna semantik
- Grafik → "Grafik realisasi dana"; komposisi "ATK" → "Belanja"
- Daftar dokumen berstatus "Selesai/Proses"; floating card → "Dokumen selesai 8 dari 13"

### Dekorasi
- Aksen lingkaran outline (border ring) hero → **dihapus**
- Tepi batik kiri/kanan hero: `lp-batik-rev` di kiri (arah silang), lebar 40
- Band batik lebar tinggi 288px di kaki hero (baru)
- Blok batik tepi section template: kanan pakai `lp-batik-rev`

### Footer
- Email fiktif, jam operasional, link legal palsu, fake status → **dihapus**
- Kolom baru "Fitur" (anchor valid) dan "Mulai" (/login, /pratinjau) + disclosure localStorage
- Atribusi lisensi: "Motif ornamen oleh GarryKillian / Freepik" → freepik.com (WAJIB)
- Copyright tahun dinamis

### Layout fluid
- 10 container: `max-w-[1280px]` → `w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px]`, padding `xl:px-10`
- Hero grid: `xl:grid-cols-[43%_57%]`, gap `2xl:gap-16`
- Grid fitur: `2xl:grid-cols-6`
- Headline: `text-[30px] sm:text-[40px] lg:text-[52px]` (aman mobile); CTA hero responsif

## `spj-frontend/src/index.css`

### `.lp-batik` family (SVG kawung abstrak → aset floral asli user)
- `background-image: /floral-pattern.jpg`, greyscale, tile 360px
- Opacity dinaikkan: 9%→18% (`.lp-batik`), 10%→16% (corner), 14%→20% (light, blend soft-light + invert)
- Motion `lp-batik-drift` (translate 1 tile = loop seamless): 90s / 100s (corner) / 120s (light) / reverse 110s (`.lp-batik-rev`)
- `will-change: background-position`
- `prefers-reduced-motion` → animasi batik berhenti

### `.lpbg-*` (untuk layer wash/blob/dots — sudah dari tahap sebelumnya)
- `lpbg-wash`, `lpbg-blob` (+`lpbg-blob-a/b/c` float), `lpbg-dots`, `lpbg-radial`

## File lain
- `tailwind.config.js` — token brand baru sudah ada dari sebelumnya; tidak diubah di sesi ini
- Dashboard/login/API/DB — **tidak disentuh**

## Status
- ✅ Build: success (19.5s)
- ✅ Tanpa overflow horizontal; fluid fill terverifikasi (3px sisa di 1085px)
- ✅ Motif floral drift aktif; reduced-motion dihormati
- ⏳ Uncommitted — semua perubahan menunggu commit
