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

## Status

- [x] Setup (cn.js)
- [x] 6 atom pertama (Step 2A)
- [ ] 6 atom terakhir (Step 2B)
- [ ] Molecules (Step 3)
- [ ] Organisms (Step 4)
