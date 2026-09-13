# Project Constitution

> Aturan proyek yang diwarisi SEMUA skill (Architect-Builder). Dibuat 2026-09-13
> saat adopsi workflow (ritel 4 Jalur A 27.8.2). Alasan setiap keputusan → DECISIONS.MD.
> Standar teknis detail (design tokens, print, clean code lengkap) → docs/VALIDATION.MD + docs/ARCHITECTURE.MD.

## Identity
- **Project Name**: spj-app (Aplikasi LPJ BOS/BOSP)
- **Type**: Web app — SPA React untuk cetak dokumen pertanggungjawaban BOS/BOSP (BUKAN BKU management)
- **Stage**: MVP — frontend-only, data localStorage, tanpa backend (riset backend masih berjalan)

## Coding Standards
- Language: JavaScript ES modules + JSX (BUKAN TypeScript — `@types/*` hanya untuk editor)
- Style: mengikuti Standar Kode di `docs/VALIDATION.MD` (naming PascalCase/camelCase/UPPER_SNAKE, comment menjelaskan MENGAPA, guard clause)
- Formatter: belum terpasang — saat dipasang (mis. Prettier) WAJIB dijalankan sebelum commit
- Linter: belum terpasang — saat dipasang (mis. ESLint) WAJIB lulus sebelum commit
- Max function length: **50 baris** (split jika lebih)
- Max file length: Component **300** · Utility **200** · Config **150** baris
- Dilarang meninggalkan `console.log` di commit (sisanya dibersihkan bertahap, bukan retroaktif)

## Architecture
- Pattern: Template Engine — `templateConfig.js` → `TemplateEngine.jsx` → block components (`components/templates/blocks/`)
- Module structure: feature-based (`pages/dashboard/` per halaman, `src/data/` untuk default konten, `src/utils/` helper)
- Data: localStorage prefix `spj_` (JANGAN diubah) — tidak ada backend/API
- Design system: blue-only `#004ac6` + slate (Material Design 3 Corporate Modern) —
  pengecualian satu-satunya: warna sinyal status di layar, tidak pernah ikut cetak
- Dokumen: 2 wajah (tab = editor premium; cetak = format formal di print-area) — spesifikasi `docs/ARCHITECTURE.MD`
- Kertas: A4 wajib, satuan `mm`, orientasi via `templateConfig.js`

## Security Rules (MANDATORY)
- [x] `.env*` tidak masuk git (sudah terverifikasi di `.gitignore` — pertahankan)
- [ ] Tidak ada hardcoded secret di source — API key hanya via env vars
- [ ] **Risiko aktif dicatat**: API key AI (`VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`,
      `VITE_GEMINI_API_KEY` di `src/utils/aiConfig.js`) ditanam Vite ke bundle client —
      siapa pun bisa mengekstraknya dari build. DILARANG menambah secret ber-scope tinggi
      di sisi client; saat backend dibangun, key AI wajib pindah ke server proxy. Detail → RISKS.MD
- [ ] Input user & file upload divalidasi (tipe + ukuran) sebelum diproses (mis. Excel parser)
- [ ] Dilarang `dangerouslySetInnerHTML` tanpa sanitasi (kondisi saat ini: 0 penggunaan — pertahankan)
- [ ] HTTPS wajib saat deploy (hosting Vercel/Netlify/Cloudflare Pages = otomatis)
- [ ] Saat backend dibangun (Bab 22 P1): auth di semua endpoint data user, rate limiting,
      parameterized queries, input validation (Zod/Yup)
- [ ] `npm audit` (via /security-dependency-auditor) sebelum rilis fitur besar —
      catatan: `xlsx@0.18.5` punya riwayat advisory, cek saat baseline

## Testing Rules (MANDATORY)
- Framework: belum ada — gate wajib saat ini: `cd spj-frontend && npm run build` sukses + smoke-test render
- Test cetak 13 template wajib dilakukan sebelum rilis fitur baru besar (lihat RISKS.MD)
- Saat framework diadopsi → **Vitest**, mulai dari parser (BKU/xlsx → lanjutkan `test-bku-parser.js`)
- Coverage target: disepakati saat framework diadopsi — JANGAN klaim coverage tanpa menjalankannya
- Bukti wajib: output build/test asli atau screenshot, bukan klaim

## Git Rules
- Commit style: **Conventional Commits** — `feat:|fix:|docs:|refactor:|chore:|test:` + deskripsi singkat
- Branch: `main` langsung (solo dev); PR tidak diwajibkan
- Dilarang commit: `.env*`, `node_modules/`, `dist/`, file >1MB tanpa alasan
- Setiap selesai fitur → update `docs/PROGRESS.md` (aturan warisan AGENTS.MD)

## Deployment
- Platform: BELUM DIPUTUSKAN — riset berjalan (`docs/PANDUAN_ARSITEKTUR_DEPLOY_LARAVEL_SPJ.md`,
  `docs/RESEARCH_HOSTING_FLUX_AI.md`, `docs/RISET_SUPABASE_VS_ALTERNATIF.md`)
- Environment variables saat ini: `VITE_CEREBRAS_API_KEY`, `VITE_GROQ_API_KEY`, `VITE_GEMINI_API_KEY`
  (client-exposed — lihat Security Rules)
- Database migrations: n/a (belum ada database)

## Decision Log
| Date | Decision | Rationale | Revisit When |
|------|----------|-----------|--------------|
| 2026-09-13 | JS+JSX (bukan TS) | legacy as adopted; migrasi TS = refactor luar scope | saat rombak besar terencana (sprint khusus) |
| 2026-09-13 | localStorage, tanpa backend | legacy as adopted | keputusan backend diambil → docs/API.MD + DATA-MODEL.MD diisi |
| 2026-09-13 | Blue-only + A4 + 2 wajah | standar visual/cetak proyek | perubahan standar lewat ADR baru di DECISIONS.MD |
| 2026-09-13 | Gate build (bukan test suite) | belum ada test framework | saat Vitest diadopsi |
| 2026-09-13 | API key AI di client (risiko diterima) | tanpa backend, tidak ada tempat lain yang aman | backend jadi → pindah ke server proxy |

## Compliance Report (scan 2026-09-13)
| Rule | Status | Bukti |
|------|--------|-------|
| .env tidak masuk git | ✅ | `.gitignore` baris 11–15 |
| Tidak ada hardcoded secret | ✅ dengan catatan | `aiConfig.js` pakai `import.meta.env.VITE_*` (key client-exposed → RISKS.MD) |
| Tidak ada dangerouslySetInnerHTML | ✅ | 0 hasil grep di `spj-frontend/src` |
| Blue-only | ⚠️ pelanggaran legacy | `AutoFillHonorButton.jsx:91` (emerald ikon), `DokumentasiAIGenerate.jsx:31` (tema amber); `AskAIPanel.jsx` amber/emerald = indikator status (pengecualian sah) |
| Tanpa console.log | ⚠️ legacy | 21 kemunculan di `spj-frontend/src` — dibersihkan bertahap saat sentuh file |
| localStorage prefix `spj_` | ✅ | `storageHelper.js:1` |
| Conventional Commits | ⚠️ mayoritas | 9/10 commit terakhir berformat; `9cdcd10` "fix ai response" tanpa titik dua |

Aturan pelanggaran legacy: TIDAK dibenahi retroaktif (aturan emas adopsi 27.8) —
dibenahi saat file terkait disentuh sprint aktif.
