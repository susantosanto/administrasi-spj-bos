# DESIGN_PRINCIPLES.md

> Prinsip desain — Aplikasi LPJ BOS/BOSP
> Tanggal: 14 Okt 2026
> Versi: 2.0
> Status: **Locked** — semua keputusan UI/UX harus merujuk ke sini.

---

## Nama Sistem: "Tenang"

Design system untuk aplikasi administrasi sekolah.
**Calm. Trustworthy. Print-first. Accessible. Token-driven.**

---

## Prinsip 1 — Calm & Trustworthy

Aplikasi administrasi bukan startup pitch deck. Operator sekolah membuka aplikasi
ini untuk bekerja, bukan untuk terhibur.

**Implikasi:**
- Background solid, bukan gradient animasi
- Warna netral dominan, warna brand sebagai aksen
- Tidak ada animasi infinite di area kerja
- Kontras teks stabil
- Tipografi tenang: Inter untuk body, Hanken Grotesk untuk heading

**Yang dihindari:**
- Gradient body yang bergerak
- Metaball, orb, marquee di area kerja
- Warna-warni berlebihan
- Animasi yang tidak punya fungsi

---

## Prinsip 2 — Density with Breathing Room

Operator sekolah kerja dengan banyak data: tabel BKU, daftar guru 51 kolom,
18 template dokumen. Tapi data padat bukan berarti tampilan sesak.

**Implikasi:**
- Grid 8px — semua spacing kelipatan 8
- Tabel boleh rapat, tapi ada padding
- Card punya padding minimal 16px, ideal 24px
- Section dipisahkan dengan jarak 24–32px
- Hierarki visual jelas: heading → body → caption

**Aturan spacing:**
- 4px micro (jarak ikon-teks, badge)
- 8px tight (dalam komponen, gap antar ikon)
- 12px compact (form field internal)
- 16px base (gap antar elemen)
- 24px roomy (padding card, gap section)
- 32px section (pemisah antar section)
- 48px page (top/bottom page padding)

---

## Prinsip 3 — Print-first

Output utama aplikasi ini adalah PDF A4. Layar melayani cetak, bukan sebaliknya.

**Implikasi:**
- Preview cetak tampil persis seperti hasil print
- Ukuran font minimum 10px untuk tabel cetak
- Warna cetak hemat tinta
- Page-break strategy: header tabel repeat, baris tidak terpotong
- A4 = 210mm × 297mm, padding 20mm × 25mm

**Aturan:**
- .print-container = sumber kebenaran untuk cetak
- .preview-container = tampilan layar (mirip kertas)
- Dark mode tidak berlaku untuk area cetak (selalu putih)

---

## Prinsip 4 — Accessible by Default

WCAG 2.1 Level AA minimum. Bukan tambahan, tapi fondasi.

**Implikasi:**
- Kontras teks minimum 4.5:1 (body) / 3:1 (large text)
- Tap target minimum 44×44px (mobile)
- Focus state jelas (:focus-visible)
- Semua form field punya label eksplisit
- Ikon dekoratif aria-hidden="true"
- Ikon fungsional punya aria-label
- Keyboard navigable
- Hormati prefers-reduced-motion

**Checklist sebelum merge:**
- Kontras dicek
- Tab order logis
- Screen reader friendly
- Reduced motion dihormati

---

## Prinsip 5 — Token-driven

Satu sumber kebenaran. Komponen tidak hardcode warna, spacing, atau radius.

**Implikasi:**
- Semua warna dari token (bg-primary, bukan bg-[#004ac6])
- Semua spacing dari scale (p-4, bukan p-[15px])
- Semua radius dari scale (rounded-lg, bukan rounded-[14px])
- Dark mode otomatis via CSS variables — tanpa !important
- Tidak ada !important kecuali terpaksa

**Aturan:**
- Salah: className="bg-white text-slate-900" (hardcoded)
- Benar: className="bg-surface text-high" (token)

---

## Hierarki Energi Visual

Meskipun satu bahasa visual, tingkat energi menurun dari marketing → aplikasi:

| Halaman | Energi | Animasi | Warna |
|---|---|---|---|
| Landing | Tinggi | Reveal on scroll, hover magnetik | Brand penuh, gradient subtle |
| Login | Sedang | Fade in, focus ring | Brand penuh, background solid |
| Dashboard | Rendah | Hover, transition state | Brand sebagai aksen |

Prinsipnya: Pengguna merasakan satu aplikasi, bukan tiga aplikasi berbeda.

---

## Yang Tidak Boleh Dilakukan

- Gradient body animasi
- !important di dark mode
- Hardcode warna di komponen
- Campur Material Symbols + Lucide
- Animasi infinite di area kerja
- Token warna duplikat (brand + primary)
- Radius di luar scale (8/12/16/24/full)
- Spacing di luar 8px grid
- Kontras teks < 4.5:1

---

## Yang Harus Dilakukan

- Token semantik (bg-surface, text-high)
- Dark mode via CSS variables
- Spacing 8px grid
- Radius dari scale
- Lucide-react saja
- Animasi fungsional
- Kontras WCAG AA
- Print-first untuk output
- Hormati prefers-reduced-motion

---

*Prinsip selesai.*
