# SPJ UI — Component Library v2

> Library komponen UI untuk aplikasi LPJ BOS/BOSP
> Design System: "Tenang"
> Versi: 2.0

## Struktur

```
src/ui/
├── cn.js                  ← className merger
├── README.md              ← dokumen ini
├── atoms/                 ← blok terkecil
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Textarea.jsx
│   ├── Select.jsx
│   ├── Checkbox.jsx
│   ├── Radio.jsx
│   ├── Badge.jsx
│   ├── Avatar.jsx
│   ├── Spinner.jsx
│   ├── Skeleton.jsx
│   ├── IconButton.jsx
│   ├── Divider.jsx
│   └── index.js           ← re-export
├── molecules/             ← (Step 3)
├── organisms/             ← (Step 4)
└── __tests__/             ← unit test
```

## Prinsip

1. **Token-driven** — pakai token dari `tailwind.config.js`, tidak hardcode
2. **Accessible** — ARIA, keyboard, focus state
3. **Composable** — pakai `cn()` untuk merge className
4. **No `!important`** — dark mode otomatis via CSS variables
5. **Tested** — setiap komponen punya unit test

## Cara Pakai

```jsx
import { Button, Input } from "@/ui/atoms";
// atau
import Button from "@/ui/atoms/Button";

<Button variant="primary" size="md">Simpan</Button>
```

## Konvensi

- **Nama file:** PascalCase untuk komponen, camelCase untuk util
- **Props:** `variant`, `size`, `disabled`, `className`, `...rest`
- **Forward ref** untuk akses DOM
- **Spread props** ke elemen dasar
- **Default export** untuk komponen

## Token Reference

Lihat `DESIGN_TOKENS.md` di root project.

## ⚠️ Utang Teknis Sementara

Berikut item yang **sengaja** dipertahankan sementara untuk kompatibilitas
dengan halaman lama yang belum dimigrasi. **Semua akan dihapus di Step 24 (Cleanup).**

| Item | Lokasi | Alasan | Hapus di |
|---|---|---|---|
| Material Symbols `<link>` | `index.html` | Halaman lama pakai ikon ini | Step 24 |
| CSS `.material-symbols-outlined` | `src/index.css` (paling bawah) | Sama | Step 24 |
| Alias token back-compat | `tailwind.config.js` (blok "BACK-COMPAT SEMENTARA") | Halaman lama pakai token lama (`bg-brand`, `bg-navy`, `text-ink`, dll) | Step 24 |

### Aturan Selama Masa Transisi

1. **JANGAN pakai** Material Symbols di kode **baru** — pakai `lucide-react`
2. **JANGAN pakai** token back-compat di kode **baru** — pakai token v2
3. **JANGAN hapus** back-compat ini sebelum Step 24
4. Kalau nemu halaman lama yang rusak, **catat** — akan diperbaiki saat
   migrasi halaman itu

### Checklist Migrasi Halaman

- [x] LoginPage (Step 5)
- [ ] LandingPage (Step 6)
- [ ] DashboardLayout + DashboardHome (Step 7)
- [ ] ... (Step 8–20)
- [ ] Hapus back-compat (Step 24)

## Glassmorphism

Design system v2 menyertakan glassmorphism **subtle & terkontrol** —
hanya untuk elemen spesifik, dengan fallback lengkap.

### Kapan Pakai Glass

| Elemen | Utility | Alasan |
|---|---|---|
| Navbar Landing | `.glass-sticky` | Sticky + transparan |
| Sidebar Dashboard | `.glass` (dark mode) | Terasa modern |
| Topbar Dashboard | `.glass-sticky` | Sticky + transparan |
| Modal | `.glass-strong` | Fokus ke dialog |
| Dropdown menu | `.glass` | Terasa mengambang |
| Toast | `.glass` | Notifikasi ringan |
| Card Hero (DashboardHome) | `.glass` | Aksen visual |
| Floating AI Button | `.glass-strong` | Menonjol |
| Panel Login (kanan) | `.glass` | Modern |
| Card Landing | `.glass` | Marketing vibe |

### Kapan **JANGAN** Pakai Glass

- ❌ Card data (BKU, tabel, list) — pakai `bg-surface` solid
- ❌ Form input — pakai `bg-surface` solid
- ❌ Print area — selalu solid putih
- ❌ Text di atas glass tanpa kontras cukup — cek WCAG AA

### Utility Tersedia

| Class | Blur | Background | Penggunaan |
|---|---|---|---|
| `.glass` | 8px | 72% opacity | Default, dropdown, panel |
| `.glass-strong` | 12px | 85% opacity | Modal, floating button |
| `.glass-heavy` | 24px | 85% opacity | (Cadangan, jarang) |
| `.glass-sticky` | 16px | 85% opacity + border-bottom | Navbar, topbar |

### Fallback Otomatis

- **Browser lama tanpa `backdrop-filter`** → solid `bg-surface`
- **User `prefers-reduced-transparency`** → solid `bg-surface`
- **Print mode** → solid putih

### Aturan

1. **JANGAN** pakai glass untuk semua card — hanya elemen yang disebut di atas
2. **SELALU** cek kontras teks di atas glass (WCAG AA minimum 4.5:1)
3. **JANGAN** pakai glass di atas glass (nested) — bikin blur bertumpuk
4. **SELALU** test di light + dark mode
5. **SELALU** test print (Ctrl+P) — glass harus jadi solid putih

## Modern Premium (Step 6.2)

Design system v2 mengikuti aliran **"Modern Premium"** — kombinasi
minimal & glass.

### Prinsip

1. **Background body subtle gradient** — bukan putih polos
2. **Glass blur 12px** — saturate 160%
3. **Radius medium** — 6/10/14/20/24px
4. **Spacing base 4px** — fleksibel
5. **Shadow double layer** — halus
6. **Typography tegas** — line-height heading rapat

### Token Radius

| Token | Nilai | Penggunaan |
|---|---|---|
| `rounded-sm` | 6px | Badge, tag kecil |
| `rounded-md` / `rounded` | 10px | Button, input |
| `rounded-lg` | 14px | Card |
| `rounded-xl` | 20px | Modal, panel |
| `rounded-2xl` | 24px | Hero card |
| `rounded-full` | 9999px | Avatar, pill |

### Token Shadow

Double layer:
- `shadow-sm`: 2 layer tipis
- `shadow-md`: 2 layer medium
- `shadow-lg`: 2 layer besar

### Background Body

**Light mode:**
```css
radial-gradient(ellipse 1200px 800px at 15% 10%, rgba(0, 74, 198, 0.04), transparent 60%),
radial-gradient(ellipse 1000px 700px at 85% 90%, rgba(0, 74, 198, 0.03), transparent 60%)
```

**Dark mode:**
```css
radial-gradient(ellipse 1200px 800px at 15% 10%, rgba(96, 165, 250, 0.06), transparent 60%),
radial-gradient(ellipse 1000px 700px at 85% 90%, rgba(96, 165, 250, 0.04), transparent 60%)
```

Tujuan: supaya glass **terasa** — bukan di atas putih polos.

## Status

- [x] Setup (cn.js)
- [x] 6 atom pertama (Step 2A)
- [ ] 6 atom terakhir (Step 2B)
- [ ] Molecules (Step 3)
- [ ] Organisms (Step 4)
