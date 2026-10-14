# Design System v2 — "Tenang"

> Aplikasi LPJ BOS/BOSP
> Versi: 2.0
> Tanggal: 14 Okt 2026
> Status: **Locked**

## Prinsip

**Calm. Trustworthy. Print-first. Accessible. Token-driven.**

## Nama

"Tenang" — design system untuk aplikasi administrasi sekolah.

## Palet

### Brand
- `primary` #004AC6 / #60A5FA
- `primary-hover` #003EA8 / #3B82F6
- `primary-soft` #DBE1FF / #1E3A5F
- `on-primary` #FFFFFF / #0B1020

### Surface
- `bg` #F8F9FB / #0B1020
- `surface` #FFFFFF / #151B2E
- `surface-muted` #F3F4F6 / #1E2640
- `surface-high` #E7E8EA / #2A3350

### Border
- `border` #E2E8F0 / #2A3350
- `border-strong` #CBD5E1 / #3A4A6B

### Text
- `text-high` #111827 / #F8FAFC
- `text-muted` #64748B / #CBD5E1
- `text-low` #94A3B8 / #94A3B8

### Semantic
- `success` #059669 / #34D399
- `warning` #D97706 / #FBBF24
- `danger` #DC2626 / #F87171
- `info` #0284C7 / #38BDF8

## Tipografi

- Body: **Inter**
- Display: **Hanken Grotesk**
- Mono: **JetBrains Mono**

Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 px

## Radius

8 / 12 / 16 / 24 / 9999 px

## Shadow

`sm`, `md`, `lg`, `primary`

## Spacing

Base 8px: 4 / 8 / 12 / 16 / 24 / 32 / 48 px

## Motion

- fast: 150ms ease-out
- base: 250ms ease-out
- slow: 400ms ease-in-out

## Ikon

**lucide-react** saja. Material Symbols dihapus.

## Dark Mode

Solid, tenang. Bukan gradient animasi.
Via CSS variables — tanpa `!important`.

## Yang Dilarang

- Gradient body animasi
- `!important` di dark mode
- Hardcode warna di komponen
- Campur 2 icon set
- Animasi infinite di area kerja
- Radius di luar scale
- Spacing di luar 8px grid
- Kontras teks < 4.5:1

## Referensi Lengkap

- `DESIGN_AUDIT.md` — temuan audit
- `DESIGN_PRINCIPLES.md` — 5 prinsip
- `DESIGN_TOKENS.md` — token lengkap
