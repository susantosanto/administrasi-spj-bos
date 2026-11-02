# 🎨 Prompt Desain UI/UX — Aplikasi LPJ BOS/BOSP (Figma)

> Dokumen ini berisi prompt & panduan untuk desain ulang/penyelarasan UI/UX aplikasi LPJ BOS/BOSP di Figma.  
> Fokus: **penyamarataan (unifikasi) komponen**, **glassmorphism**, dan **modern UI** yang elegan, premium, namun ramah.

---

## 1. Konteks Proyek

- **Nama:** Aplikasi LPJ BOS/BOSP (Aplikasi Sistem Keuangan)
- **Target:** Operator sekolah (admin keuangan) — pengguna non-desainer, butuh antarmuka jelas, cepat, tidak membingungkan.
- **Platform:** Web (React + Vite + Tailwind CSS). Desktop-first, responsive.
- **Branding:** Logo “ASIK” (Aplikasi Sistem Keuangan). Warna primer biru (#2563EB). Font: Hanken Grotesk (headline) + Inter (body).

---

## 2. Progress Desain (Ringkas)

### Landing Page
- Hero full-screen dengan batik animasi (opacity lembut, mix-blend multiply di light).
- Badge “Sistem Informasi LPJ BOS/BOSP” (solid primary).
- CTA card glassmorphism (blur + glossy).
- Feature cards 7 item + section “Kenapa Memilih Kami?” (3 card).
- Floating dock (3 nilai) muncul hanya di layar pertama.
- Footer compact.

### Login Page
- Satu layar, glass card (blur 24px, saturate 1.6).
- Batik full-page background (drift).
- Brand lockup terpusat.
- Kontras link diperbaiki (dark 7.02 / light 6.71).

### Dashboard
- Hero gradient biru (soft, tanpa metaballs berlebihan).
- Quick Stats bar (4 item).
- Card glassmorphism (bg 70% + blur 12px + border putih 40%).
- Batik background sangat halus (opacity 0.10 light / 0.06 dark).
- Sidebar glass morphism + grup collapsible (chevron).
- Dokumen Referensi card (compact).
- Dark mode: gradient lebih gelap, teks lebih lembut.

### Komponen
- Button CTA: solid primary, hover darker, tanpa glow berlebihan.
- Card: `rounded-2xl`, padding `p-5/p-6`, shadow `shadow-sm`.
- Icon: Material Symbols Outlined, slate-600 (aktif primary).
- Tooltip hover pada card Dokumen Referensi.

---

## 3. Penyamarataan (Unifikasi) yang Harus Dijaga

### 3.1 Palet Warna (Premium Blue)
| Token | Light | Dark | Penggunaan |
|-------|-------|------|------------|
| `primary` | #2563EB | #60A5FA | CTA, link, active state |
| `primary-hover` | #1D4ED8 | #3B82F6 | Hover button |
| `background` | #F8FAFC | #0F172A | Halaman |
| `surface` | #FFFFFF | #1E293B | Card |
| `text-high` | #0F172A | #F1F5F9 | Heading |
| `text-low` | #64748B | #94A3B8 | Muted |
| `success` | #10B981 | #34D399 | Status sukses |
| `warning` | #F59E0B | #FBBF24 | Status peringatan |
| `danger` | #EF4444 | #F87171 | Error |

**Aturan:** Hanya gunakan token di atas. Jangan tambah warna baru (emerald, amber, rose, dll.) kecuali via token semantik.

### 3.2 Tipografi
- **Headline:** Hanken Grotesk, weight 600–700, size 24–32px.
- **Body:** Inter, weight 400–500, size 14–16px.
- **Label/Caption:** Inter, weight 500, size 10–12px, uppercase tracking-wide.
- **Angka:** font-mono, weight 700.

### 3.3 Radius & Spacing (8px grid)
- Card: `rounded-2xl` (16px), padding `p-5`/`p-6`.
- Button: `rounded-xl` (12px), padding `px-4 py-2.5`.
- Gap antar card: `gap-4` (16px).
- Section spacing: `space-y-5` (20px).

### 3.4 Shadow
- Card: `shadow-sm` (0 1px 2px rgba(0,0,0,0.05)).
- Hover: `shadow-md` (0 4px 12px rgba(0,0,0,0.08)).
- Jangan pakai shadow berlebihan (shadow-xl/2xl) di dashboard kerja.

### 3.5 Ikon
- Library: Material Symbols Outlined.
- Warna: slate-600 (normal), primary (aktif).
- Size: 18–20px (inline), 24px (feature).

---

## 4. Style: Glassmorphism + Modern UI

### 4.1 Glass Card (Standar)
```
bg-white/70 dark:bg-slate-900/70
backdrop-blur-md
border border-white/40 dark:border-white/10
rounded-2xl
shadow-sm
```

### 4.2 Glass Card Premium (Hero/CTA)
```
bg-white/50 dark:bg-slate-900/50
backdrop-blur-xl
border border-white/60 dark:border-white/15
rounded-2xl
shadow-md
```

### 4.3 Aturan Glassmorphism
- **Opacity:** 60–75% (light), 50–70% (dark). Jangan di bawah 50%.
- **Blur:** 8–12px (`backdrop-blur-md` / `xl`). Jangan `backdrop-blur-3xl`.
- **Border:** 1px putih/abu tipis (opacity 30–50%).
- **Background di belakang glass:** Harus ada batik/pattern halus (opacity 0.08–0.12) agar efek glass terlihat. Jangan di atas warna solid polos.
- **Hindari:** Glass berlapis-lapis, blur berlebihan, opacity terlalu rendah (terlihat “kabur”).

### 4.4 Modern UI (Non-Glass)
- Surface solid: `bg-white dark:bg-slate-800`, border `border-slate-200 dark:border-slate-700`.
- Gunakan glass hanya untuk card utama (hero, quick stats, fitur). Elemen kecil (button, input, badge) gunakan solid.

---

## 5. Komponen (Spesifikasi)

### 5.1 Button
- **Primary:** `bg-primary text-white rounded-xl px-4 py-2.5 font-semibold shadow-sm hover:bg-primary-hover`.
- **Secondary:** `bg-slate-100 text-slate-700 rounded-xl px-4 py-2.5 hover:bg-slate-200`.
- **Icon Button:** `w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100`.

### 5.2 Card
- Container: glass standard (lihat 4.1).
- Header: icon (20px) + title (14px bold) + subtitle (11px muted).
- Content: padding 16–24px.
- Hover: `hover:shadow-md hover:border-slate-300 transition-all duration-200`.

### 5.3 Input
- `h-11 px-4 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm`.
- Focus: `focus:ring-2 focus:ring-primary/20 focus:border-primary`.

### 5.4 Sidebar
- Glass: `bg-white/60 backdrop-blur-2xl border-r border-white/50 shadow-[8px_0_32px_rgba(0,0,0,0.12)]`.
- Group header: collapsible, chevron rotate -90° when collapsed.
- Item: `rounded-xl px-3 py-2.5`, active `bg-primary/10 text-primary` + left bar 3px.
- Logo: container `w-16 h-10 bg-white rounded-xl shadow-sm border border-slate-200/60`, img `h-7 object-contain`.

### 5.5 Topbar
- Sticky, `bg-white/80 backdrop-blur-md border-b border-slate-200/60`.
- Search: `bg-slate-100 rounded-xl`, icon left.
- Theme toggle: icon button (sun/moon).
- User dropdown: avatar gradient + name + email.

---

## 6. Animasi (Minimalis)

- **Hover:** `transition-all duration-200`, scale max 1.02.
- **Fade-in:** `opacity 0→1, translateY 6px→0`, 700ms, stagger 120ms.
- **Hindari:** Shimmer berulang, metaballs, floating particles di dashboard kerja.
- **Reduced motion:** Hormati `prefers-reduced-motion`.

---

## 7. Aksesibilitas (WCAG)

- Kontras teks minimal 4.5:1 (body), 3:1 (large text).
- Semua icon button punya `aria-label`.
- Focus visible: `focus:ring-2 focus:ring-primary/30`.
- Jangan andalkan warna saja untuk status (tambah ikon/teks).

---

## 8. Dark Mode

- Background: `#0F172A` (slate-900).
- Card: `bg-slate-900/70 backdrop-blur-md border-white/10`.
- Teks: slate-100 (heading), slate-300 (body).
- Primary: `#60A5FA` (blue-400).
- Batik opacity: 0.06 (sangat halus).

---

## 9. Prompt Singkat untuk Figma AI / Designer

> “Desain dashboard aplikasi LPJ BOS/BOSP dengan style **elegant premium friendly**. Gunakan **glassmorphism lembut** (bg 70% + blur 12px + border putih 40%) di atas background batik halus (opacity 0.10). Palet **Premium Blue** (#2563EB primary). Font Hanken Grotesk (headline) + Inter (body). Radius 16px (card), 12px (button). Spacing 8px grid. Ikon Material Symbols outline. Dark mode: slate-900 bg + blue-400 accent. Hindari animasi mencolok. Fokus pada keterbacaan, hierarki jelas, dan kenyamanan operator sekolah.”

---

## 10. Referensi File

- `spj-frontend/src/pages/dashboard/DashboardHome.jsx` — Dashboard utama.
- `spj-frontend/src/components/layout/Sidebar.jsx` — Sidebar glass + collapsible groups.
- `spj-frontend/src/components/layout/Topbar.jsx` — Topbar sticky.
- `spj-frontend/src/index.css` — Design tokens + animasi.
- `spj-frontend/tailwind.config.js` — Token warna/radius/spacing.
- `docs/PROGRESS.md` — Progress fitur.
- `docs/PROGRESS_LANDING.md` — Progress landing/login.

---

*Terakhir diperbarui: 30 Okt 2026 — Branch `feat/light-dark-living`*
EOF
echo "written"