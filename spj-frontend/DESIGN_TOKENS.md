# DESIGN_TOKENS.md

> Token desain — Aplikasi LPJ BOS/BOSP
> Tanggal: 14 Okt 2026
> Versi: 2.0
> Status: **Locked** — implementasi di tailwind.config.js + index.css

---

## 1. Color Tokens

### 1.1 Brand

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| primary | #004AC6 | #60A5FA | CTA, link, active state |
| primary-hover | #003EA8 | #3B82F6 | Hover |
| primary-soft | #DBE1FF | #1E3A5F | Background lembut |
| on-primary | #FFFFFF | #0B1020 | Teks di atas primary |

### 1.2 Surface

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| bg | #F8F9FB | #0B1020 | Page background |
| surface | #FFFFFF | #151B2E | Card |
| surface-muted | #F3F4F6 | #1E2640 | Input, card sekunder |
| surface-high | #E7E8EA | #2A3350 | Hover card, elevated |

### 1.3 Border

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| border | #E2E8F0 | #2A3350 | Border default |
| border-strong | #CBD5E1 | #3A4A6B | Border tegas |

### 1.4 Text

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| text-high | #111827 | #F8FAFC | Heading, teks utama |
| text-muted | #64748B | #CBD5E1 | Body sekunder |
| text-low | #94A3B8 | #94A3B8 | Caption, placeholder |

### 1.5 Semantic

| Token | Light | Dark | Penggunaan |
|---|---|---|---|
| success | #059669 | #34D399 | Sukses, valid |
| warning | #D97706 | #FBBF24 | Peringatan |
| danger | #DC2626 | #F87171 | Error, hapus |
| info | #0284C7 | #38BDF8 | Info |

---

## 2. Typography

### 2.1 Font Family

| Token | Value | Penggunaan |
|---|---|---|
| font-body | Inter, system-ui, sans-serif | Body, UI, form |
| font-display | Hanken Grotesk, sans-serif | Heading h1–h3 |
| font-mono | JetBrains Mono, monospace | Angka, kode surat |

### 2.2 Type Scale

| Token | Size | Line Height | Weight | Penggunaan |
|---|---|---|---|---|
| text-xs | 12px | 1.4 | 500 | Label kecil, badge |
| text-sm | 14px | 1.5 | 400 | Body sekunder, caption |
| text-base | 16px | 1.6 | 400 | Body utama |
| text-lg | 18px | 1.5 | 500 | Sub-heading |
| text-xl | 20px | 1.4 | 600 | Heading kecil |
| text-2xl | 24px | 1.3 | 600 | Heading sedang |
| text-3xl | 30px | 1.2 | 700 | Heading besar |
| text-4xl | 36px | 1.1 | 700 | Hero heading |

---

## 3. Spacing

Base unit: 8px.

| Token | Value | Penggunaan |
|---|---|---|
| space-1 | 4px | Micro |
| space-2 | 8px | Tight |
| space-3 | 12px | Compact |
| space-4 | 16px | Base |
| space-6 | 24px | Roomy |
| space-8 | 32px | Section |
| space-12 | 48px | Page |

---

## 4. Radius

| Token | Value | Penggunaan |
|---|---|---|
| rounded-sm | 8px | Badge, tag kecil |
| rounded-md | 12px | Button, input, card kecil |
| rounded-xl | 24px | Modal, hero card |
| rounded-full | 9999px | Avatar, pill |

---

## 5. Shadow

| Token | Value | Penggunaan |
|---|---|---|
| shadow-sm | 0 1px 2px rgba(0,0,0,0.04) | Card datar, input |
| shadow-md | 0 4px 12px rgba(0,0,0,0.06) | Card hover, dropdown |
| shadow-lg | 0 10px 24px -6px rgba(0,0,0,0.08) | Modal, popover |
| shadow-primary | 0 8px 24px rgba(0,74,198,0.18) | CTA emphasis |

---

## 6. Motion

| Token | Duration | Easing | Penggunaan |
|---|---|---|---|
| motion-fast | 150ms | ease-out | Hover, focus, active |
| motion-base | 250ms | ease-out | Panel, dropdown, toast |
| motion-slow | 400ms | ease-in-out | Modal, page transition |

**Aturan:**
- Animasi hanya untuk: hover, focus, state change, enter/exit, loading
- Tidak ada animasi infinite di area kerja
- Landing page boleh reveal on scroll
- Hormati prefers-reduced-motion

---

## 7. Z-Index

| Token | Value | Penggunaan |
|---|---|---|
| z-dropdown | 1000 | Dropdown, popover |
| z-sticky | 1020 | Sticky header |
| z-modal-backdrop | 1040 | Modal backdrop |
| z-modal | 1050 | Modal |
| z-toast | 1060 | Toast |
| z-tooltip | 1070 | Tooltip |

---

## 8. Breakpoint

| Token | Value | Penggunaan |
|---|---|---|
| sm | 640px | Mobile besar |
| md | 768px | Tablet |
| lg | 1024px | Desktop kecil |
| xl | 1280px | Desktop |
| 2xl | 1536px | Desktop besar |

Target utama: Desktop 1280px+.
Fallback: Tablet 768px+.
Mobile: Fungsional, tidak prioritas.

---

## 9. Mapping Token Lama → Baru

| Lama | Baru |
|---|---|
| bg-brand | bg-primary |
| bg-navy | bg-text-high |
| bg-canvas | bg-bg |
| bg-background | bg-bg |
| bg-surface-container-lowest | bg-surface |
| bg-surface-container-low | bg-surface-muted |
| bg-surface-container | bg-surface-muted |
| bg-surface-container-high | bg-surface-high |
| bg-surface-variant | bg-surface-high |
| text-ink | text-high |
| text-on-surface | text-high |
| text-on-surface-variant | text-muted |
| text-text-high | text-high |
| text-text-low | text-low |
| border-line | border |
| border-outline-variant | border |
| border-outline | border-strong |
| bg-success-bright | bg-success |
| bg-error | bg-danger |
| bg-secondary | bg-info |
| shadow-primary-sm/md/lg | shadow-primary |

---

## 10. Checklist Implementasi

- tailwind.config.js — ganti total dengan token v2
- index.css — ganti total, tanpa !important war
- Hapus DESIGN.md lama, ganti dengan design system v2
- Pastikan font (Inter + Hanken Grotesk) di-load
- Verifikasi npm run build sukses
- Verifikasi npm run test 18/18 hijau
- Verifikasi dark mode toggle bekerja tanpa !important

---

*Token selesai.*
