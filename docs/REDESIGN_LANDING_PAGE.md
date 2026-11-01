# 🎨 Redesign Landing Page — LPJ BOS/BOSP

> **Tanggal:** 11 Oktober 2026
> **Branch:** `feat/light-dark-living`
> **Scope:** Landing page publik (`spj-frontend/src/pages/LandingPage.jsx` + `spj-frontend/src/index.css`)
> Dashboard, login, backend, dan modul administrasi **tidak disentuh**.

---

## 1. Ringkasan Pekerjaan

Redesign landing page menjadi premium Education Finance SaaS: modern, bersih, elegan,
hierarki kuat, responsif penuh, serta identitas Indonesia melalui motif batik floral asli
yang bergerak halus (living background).

**Build:** ✅ sukses (`vite build`, 14–20s, tanpa error)
**Overflow horizontal:** ✅ tidak ada (scrollWidth = innerWidth)
**Berkas berubah:** 2 file — `LandingPage.jsx`, `index.css`. Tidak ada dependency baru.

---

## 2. Struktur Halaman (sesuai spesifikasi prompt redesign)

| Section | ID | Konten |
|---|---|---|
| A. Header | — | Sticky, logo + 5 nav + CTA `Masuk` & `Mulai Sekarang`, mobile menu |
| B. Hero | `#beranda` | Badge, headline 2 baris, subheadline, 2 CTA, supporting text, mockup dashboard |
| Banner trust | (dalam hero) | 4 indikator keunggulan |
| C. Statistik | — | 4 angka kunci dengan animated counter |
| D. Fitur | `#fitur` | Judul sesuai prompt + 6 kartu fitur (grid 3 → 6 kolom di 2xl) |
| E. Panduan | `#panduan` | 3 langkah (sticky kiri) |
| F. Template | `#template` | 6 kategori template + link ke aplikasi |
| G. Tentang | `#tentang` | 3 nilai + kutipan |
| H. CTA | — | Panel navy wallpaper batik, 1 tombol primer |
| I. Footer | `#kontak` | Navigasi valid + atribusi Freepik + hak cipta dinamis |

---

## 3. Copy Teks Final (persis sesuai spesifikasi)

- **Badge hero:** `Sistem Administrasi Keuangan Sekolah`
- **Headline:** `Administrasi tertata. Pelaporan lebih mudah.` (frasa kedua beraksen biru)
- **Subheadline:** `Kelola dokumen BOS/BOSP, susun laporan, dan cetak LPJ dalam satu sistem yang dirancang untuk membantu administrasi sekolah menjadi lebih efisien dan terorganisasi.`
- **CTA utama:** `Mulai Sekarang` → `/login`
- **CTA sekunder:** `Lihat Fitur` → `#fitur`
- **Supporting text:** `Lebih praktis untuk mendukung administrasi sekolah.`
- **Judul fitur:** `Semua kebutuhan administrasi dalam satu tempat`
- **CTA penutup:** `Siap mengelola administrasi sekolah dengan lebih praktis?`

---

## 4. Mockup Produk (data ilustratif, penanda eksplisit)

| Statistik | Nilai | Warna |
|---|---|---|
| Total dokumen | 13 | ink |
| Dokumen selesai | 8 | hijau `success-bright` |
| Dalam proses | 3 | biru `brand` |
| Perlu tindakan | 2 | kuning `warning` |

Komponen mockup: mini app bar, sidebar navy mini, kartu statistik, grafik SVG realisasi
dana (bar + donut komposisi), daftar dokumen terbaru dengan pill status, floating card
"Dokumen selesai 8 dari 13 template". Label `Data ilustrasi` tampil di pojok.

---

## 5. Motif Batik Florak — Aset Asli Pengguna

- **Sumber:** folder `Background/ornamental-floral-seamless-pattern(1)` milik user
  (GarryKillian / Freepik, `1443.jpg` 5000×5000).
- **Yang dipakai web:** `spj-frontend/public/floral-pattern.jpg` — versi ringkas 800×800,
  147 KB, seamless. File asli 2,8 MB **tidak** dipakai (terlalu berat).
- **Watermark:** dicek via sampling piksel 4 sudut + visual preview → **bersih, tidak ada**.
- **Treatment:** grayscale + kontras turun agar selaras palet biru premium.

### Class CSS

| Class | Posisi | Ukuran tile | Opacity | Motion |
|---|---|---|---|---|
| `.lp-batik` | Kaki hero (band lebar), tepi section template, figure testimoni | 360px | 18% | drift 90s |
| `.lp-batik-corner` | Sudut kanan hero (fade mask radial) | 420px | 16% | drift 100s |
| `.lp-batik-light` | Panel CTA navy (blend soft-light + invert) | 360px | 20% | drift 120s |
| `.lp-batik-rev` | Varian arah berlawanan (tepi kiri hero & kanan template) | 360px | 18% | drift reverse 110s |

### Motion (living background)

- Keyframe `lp-batik-drift`: translate background-position tepat **1 tile (360px)** →
  loop seamless, tidak pernah terlihat "lompat".
- Tempo berbeda per layer (90/100/110/120 detik) agar tidak sinkron mekanis;
  tepi kiri & kanan bergerak **silang arah** (organik, bukan cermin).
- `will-change: background-position` — komposit murah, tanpa reflow.
- `prefers-reduced-motion: reduce` → seluruh animasi batik berhenti. ✅

---

## 6. Layout Fluid — Tidak Ada Ruang Hampa di Laptop

Masalah awal: container `max-w-[1280px]` menyisakan lajur kosong 60–80px per sisi di
laptop 1366–1440px.

### Solusi: container fluid 3 tingkat (semua 10 section)

| Breakpoint | Max width | Padding sisi |
|---|---|---|
| `< 1280px` | 1280px | 20/32px |
| `≥ 1280px` (xl) | **1440px** | 40px |
| `≥ 1536px` (2xl) | **1580px** | 40px |

- Hero: grid `45/55` → `43/57` di xl; gap antar kolom melebar ke 4rem di 2xl —
  whitespace pindah dari pinggir layar ke antar kolom (lebih sehat hierarkinya).
- Grid fitur: **6 kartu sebaris penuh** di 2xl.
- Terverifikasi: viewport 1085px → sisi kosong hanya **3px**; grid konten = lebar container penuh.
- Batik tepi kiri/kanan (w-40/w-36, fade mask) tetap ada sebagai finishing di layar
  yang lebih lebar dari container.

---

## 7. Perbaikan UX (hasil audit UI/UX)

1. **CTA penutup dipangkas** — tombol "Masuk ke Aplikasi" yang redup di navy dihapus;
   panel CTA kini **satu tombol primer** putih.
2. **Repetisi "13+ template" dikurangi** dari 5× → 3× (di mockup, statistik, dan
   section template). Trust bar & judul fitur diganti tanpa angka.
3. **Hero mobile aman** — headline 30px (leading 1.15) di mobile, 40px di `sm`,
   52px di `lg`; tombol CTA responsif (min-height 48→50px).
4. **Konten mengarang dihapus** (kejujuran halaman):
   - ❌ Email fiktif `info@lpjbos.id` + "respon 1×24 jam" + jam kerja
   - ❌ Link legal palsu (Syarat & Ketentuan/Privasi/Cookie → `#kontak`)
   - ❌ Status "Semua sistem berjalan normal" (fake status page)
   - ❌ Klaim "Sesuai Regulasi", "Aman & Terpercaya", "85% lebih cepat"
   - ✅ Kolom footer "Mulai" → `/login` & `/pratinjau` (route nyata)
   - ✅ Disclosure jujur: data tersimpan localStorage, tidak dikirim ke server

### Trust indicators final (semua faktual)

| Ikon | Judul | Deskripsi |
|---|---|---|
| bolt | Mudah Digunakan | Alur sederhana untuk semua operator |
| folder_managed | Data Terorganisasi | Semua dokumen rapi dalam satu sistem |
| description | Template Dokumen | Honor, SPPD, mamin, pemeliharaan, dan lainnya |
| touch_app | Akses dan Navigasi Praktis | Navigasi ringkas dari upload sampai cetak |

---

## 8. Background dekoratif tambahan (scoped `.lpbg-*`)

| Class | Fungsi |
|---|---|
| `.lpbg-wash` | 3 gradient radial (brand kanan-atas, navy kiri, hijau tipis bawah) |
| `.lpbg-blob` (a/b/c) | Blob `blur(64px)` float 14–20s, delay offset |
| `.lpbg-dots` | Dot-grid halus dengan mask fade |
| `.lpbg-radial` | Highlight radial biru untuk section putih |

Aksen lingkaran outline (border ring biru/hijau) **sudah dihapus** sesuai permintaan.

---

## 9. Aksesibilitas & Performa

- ✅ `prefers-reduced-motion` dihormati oleh SEMUA animasi (reveal, blob, batik, counter)
- ✅ Semua dekor `pointer-events-none` + `aria-hidden="true"`
- ✅ Kontras teks aman di atas semua layer dekorasi (opacity dekor rendah)
- ✅ Focus-visible ring konsisten; navigasi keyboard berfungsi
- ✅ Semantic HTML (`header/main/section/footer/nav/dl/figure`)
- ✅ Aset tunggal 147 KB JPEG; tanpa JPEG 2,8 MB; tanpa dependency baru
- ✅ Anchor nav valid semua; CTA hanya ke `/login`, `/pratinjau`, dan anchor section

---

## 10. Lisensi Aset (WAJIB dipertahankan)

Motif floral berasal dari Freepik dengan **lisensi free** yang mengharuskan atribusi.
Footer sudah memuat tautan: **"Motif ornamen oleh GarryKillian / Freepik"** → freepik.com.
Jangan menghapus atribusi ini selama memakai lisensi free. Jika berlangganan premium
Freepik, atribusi boleh dilepas (simpan bukti lisensi premium).

---

## 11. Yang Belum Dipahani (Backlog)

| Item | Prioritas | Catatan |
|---|---|---|
| Commit semua perubahan landing | Tinggi | 15+ file masih uncommitted di branch ini |
| Headline di layar ~1085px wrap 3 baris | Sedang | turunkan `lg` ke 48px jika target user memakai layar itu |
| `html * { transition: 0.25s }` global | Sedang | mahal saat render; scope ulang ke warna saja |
| Struktur LandingPage.jsx masih 1 file (~880 baris) | Rendah | bisa split per-komponen |
| Chunk JS > 500 kB (xlsx + pdfjs) | Rendah | bukan bagian landing; lazy import di dashboard |
| Test suite masih 0 | Rendah | bkuParser & templateDetector paling rawan |

---

## 12. Verifikasi Terakhir

- `npm run build` → ✅ (19.5s)
- Preview dev server (vite :5173) → motif batik drift aktif, container fluid, tanpa overflow
- Screenshot: hero, template, CTA — semua sesuai desain
