# 📦 HANDOFF — Lanjutan Proyek LPJ BOS/BOSP untuk AI Baru

> **Dokumen ini adalah satu-satunya bekal yang kamu butuhkan untuk melanjutkan proyek.**
> Dibuat: 15 Okt 2026 · Oleh: AI eksekutor sebelumnya · Untuk: DeepSeek (atau AI lain)
> Pengguna (manusia) berperan sebagai **Arsitek UI/UX** — kamu berperan sebagai **Eksekutor**.

---

## 1. Proyek Ini Apa?

**Aplikasi LPJ BOS/BOSP** — web frontend-only (tanpa backend) untuk membantu operator
sekolah Indonesia menyusun dan **mencetak dokumen pertanggungjawaban dana BOS/BOSP ke PDF A4**.

Alur inti: upload profil sekolah (Dapodik) → upload guru/tendik → upload BKU (ARKAS Excel)
→ isi form via template engine → cetak A4.

- Repo: `administrasi-spj-bos/` (remote: `github.com/susantosanto/administrasi-spj-bos`)
- Kode aplikasi: `spj-frontend/` (React 18.2 + Vite 5 + Tailwind 3.4 + React Router v6)
- Cara jalan: `cd spj-frontend && npm install && npm run dev` (Node 18+)

---

## 2. Posisi Terkini (Fakta, Terverifikasi 15 Okt 2026)

| Item | Nilai |
|---|---|
| Branch aktif | `redesign/v2-foundation` |
| Commit terakhir | `b433a95` "feat(pages): migrate LoginPage to v2 UI" |
| Working tree | Bersih, kecuali 6 file `*.v1-backup` (untracked, sengaja disimpan) + `docs/ARSITEKTUR.md` (untracked) |
| Test | **125/125 hijau** (`npm run test`: 29 file) |
| Build | **Sukses** ±20 dtk (`npm run build`; warning chunk >500 KB = pre-existing) |
| Rollback aman | Tag `v1.0-pre-redesign` (sudah di-push) |

Riwayat commit di branch ini (terbaru → terlama):

```
b433a95 feat(pages): migrate LoginPage to v2 UI        ← Step 5+5.5
c04c869 feat(ui): add 5 organisms                      ← Step 4
f394157 feat(ui): add 4 complex molecules              ← Step 3B
0b243da feat(ui): add 4 molecules                      ← Step 3A
b81d87c feat(ui): add 6 remaining atoms                ← Step 2B
045154e feat(ui): add 6 atoms + vitest jsdom           ← Step 2A+2A.5
b2607ca feat(design): replace foundation tokens (Tenang) ← Step 1
7c03029 docs: design foundation v2                    ← Step 0
fc6de9c chore: freeze pre-redesign state              ← Step 0
```

---

## 3. Yang Sudah Selesai (Step 0–5.5)

- **Step 0:** Bekukan state (tag + branch baru) + 3 dokumen fondasi (`DESIGN_AUDIT.md`, `DESIGN_PRINCIPLES.md`, `DESIGN_TOKENS.md` di `spj-frontend/`)
- **Step 1:** Fondasi token v2 "Tenang" — `tailwind.config.js` + `src/index.css` diganti total (CSS variables, dark mode solid, font self-host via `@fontsource`); `DESIGN.md` + `index.html` + `src/main.jsx` diganti/diupdate
- **Step 2A–2B:** Library `src/ui/atoms/` — **12 atom** (Button, Input, Textarea, Select, Checkbox, Radio, Badge, Avatar, Spinner, Skeleton, IconButton, Divider) + `cn.js` + `index.js`
- **Step 2A.5:** Test env — `vitest.config.js` (terpisah dari `vite.config.js`, environment jsdom) + `src/ui/__tests__/setup.js`
- **Step 3A–3B:** `src/ui/molecules/` — **8 molecule** (Card+5 sub, FormField, Alert, Breadcrumb, Toast+provider, Tabs, Modal, Dropdown+item/separator)
- **Step 4:** `src/ui/organisms/` — **5 organism** (Sidebar, Topbar, PageContainer, PageHeader, AppShell)
- **Step 5–5.5:** Migrasi halaman pertama — `src/pages/LoginPage.jsx` rewrite v2 (backup: `LoginPage.legacy.jsx`) + 5 test

Setiap komponen `src/ui/` punya unit test (Testing Library + jsdom). Total: 25 komponen, 125 test.

---

## 4. Arsitektur Singkat

**Strategi: strangler fig.** UI lama (`src/components/`, `src/pages/` kecuali LoginPage)
hidup berdampingan dengan UI baru (`src/ui/`) sampai migrasi halaman selesai.

- **Jangan sentuh (logic layer):** `src/utils/` (parser BKU/Dapodik, storage, AI),
  `src/data/templateConfig.js` (**18 template SSOT**), `api/[...path].js` (proxy AI)
- **Design system "Tenang":** satu token `primary #004AC6`, semantic via CSS variables,
  spacing 8px, radius 8/12/16/24/full, ikon **lucide-react saja**, prinsip Calm/Trustworthy/Print-first/Accessible/Token-driven
- **State:** `localStorage` prefix `spj_*` via `storageAdapter.js` (quota guard, versioning). Auth dummy (`spj_auth`)
- **Routing (`src/App.jsx`):** publik `/`, `/login` (✅ sudah v2), `/pratinjau`; proteksi `/dashboard/*` (13 halaman, belum migrasi)
- **Alur data:** `.xlsx` → parser → `localStorage` → TemplateEngine (JSON → 9 blok) → preview A4 → cetak → PDF
- Dokumen terkunci (jangan ubah tanpa perintah Arsitek): `DESIGN_AUDIT.md`, `DESIGN_PRINCIPLES.md`, `DESIGN_TOKENS.md`, `DESIGN.md`, `tailwind.config.js`, `src/index.css`

---

## 5. Tugas Berikutnya: Step 6 — Migrasi LandingPage

Halaman `/` (`src/pages/LandingPage.jsx`, ±1300 baris, banyak section: hero, features,
stats, testimonials, CTA, footer). Arsitek bilang Step 6 akan dipecah 2–3 prompt karena
kompleksitasnya. **Tunggu prompt Arsitek — jangan kerjakan tanpa instruksi.**

Pola migrasi yang sudah terbukti (dari LoginPage): backup `*.legacy.jsx` → rewrite pakai
komponen `src/ui/` → test dengan mock (`useNavigate`, toast, storageHelper) → verifikasi → commit.

---

## 6. Aturan Kerja yang Berlaku (Wajib Dipatuhi)

1. **Eksekutor, bukan perancang.** Kerjakan hanya yang diinstruksikan Arsitek. Jangan refactor/fix inisiatif sendiri.
2. **Disiplin scope.** Setiap step menyebut file yang boleh disentuh — file lain haram, walaupun terlihat rusak.
3. **STOP + lapor saat gagal.** Build/test gagal → berhenti, salin error lengkap, laporkan. Jangan coba fix sendiri.
4. **Ambigu → tanya.** Jangan asumsi.
5. **Jangan lanjut step berikutnya** tanpa prompt Arsitek.
6. **Jangan hapus** file `*.v1-backup` dan `*.legacy.jsx`.
7. **Lapor format baku** setiap selesai step (Status, per-tugas, Verifikasi, Commit hash, Kendala, Siap untuk step berikutnya?).

---

## 7. Perintah Verifikasi

```bash
cd spj-frontend
npm run test    # harus 125/125 hijau (29 file)
npm run build   # harus "✓ built in XXs"
git status --short --branch
git log --oneline -5
```

---

## 8. Gotcha — Pelajaran dari Step Lalu (Jangan Ulangi)

1. `getByLabelText(/password/i)` ambigu (label form "Password" vs aria-label toggle "Tampilkan password") → pakai exact match + helper query.
2. Prop `required` di `FormField` hanya asterisk visual — test `toBeRequired()` butuh atribut `required` asli di `<Input>`.
3. Tailwind default tidak punya `duration-250` → pakai `duration-200`.
4. Test DOM butuh `vitest.config.js` (environment jsdom) + `setup.js` — jangan taruh config test di `vite.config.js`.
5. Import tak terpakai (mis. `useId`) lolos build tapi kotor — Arsitek minta dibersihkan saat ketahuan.
6. Toast yang dipakai halaman = Toast **lama** (`src/components/ui/Toast`, sudah mount di `App.jsx` + integrasi quota), bukan `ToastProvider` baru di `src/ui/`.
7. Angka estimasi test di prompt Arsitek kadang meleset (46→54, dst.) — laporkan angka aktual dari output.
8. Commit hanya file yang disebut di prompt; backup `*.v1-backup` tetap untracked.

---

## 9. Keputusan Tertunda (Milik Arsitek, Bukan Kamu)

- Arsitektur AI production: direct-URL vs wajib same-origin `/api/*`
- Code-splitting chunk utama 741 KB (warning pre-existing)
- Roadmap Electron + SQLite (`docs/elektron/`) vs backend Laravel
- Deploy Vercel (verifikasi env server key)

---

## 10. Peta Dokumen (Kalau Perlu Detail)

| Dokumen | Isi |
|---|---|
| `docs/ARSITEKTUR.md` | Arsitektur sistem (ringkas, terkini) |
| `docs/LAPORAN_PROYEK.md` | Laporan status proyek per 14 Okt 2026 |
| `docs/ANALISIS_PROYEK.md` (+ root `ANALISIS_PROYEK.md`) | Analisis statis codebase |
| `docs/LAPORAN_EKSEKUSI_FASE1-5.md` | Detail fondasi pra-redesign + pertanyaan arsitek |
| `docs/PROGRESS.md` | Tracking 76+ tahap + revisi |
| `docs/AGENT.md` | Quick-start + design system + clean code standards |
| `spj-frontend/DESIGN_*.md` | Audit, prinsip, token (terkunci) |

---

*Upload file ini + seluruh folder proyek ke DeepSeek, lalu minta ia membaca file ini dulu sebelum bertindak. Berlaku juga untuk AI lain.*
