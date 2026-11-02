# SECURITY-AUDIT-001 — Baseline Keamanan & Dependency

- **Tanggal**: 2026-09-13
- **Jenis**: BASELINE PERTAMA (ritel 6 Jalur A adopsi 27.8.2 — pengukuran garis awal,
  bukan gate deploy sprint)
- **Scope**: seluruh repo `spj-app` (root + `spj-frontend/`), commit `41f4481`
- **Tool run**: `npm audit` (nyata) · secret scan MANUAL (gitleaks/trufflehog tidak terpasang)
- **BLUEPRINT.MD**: belum ada (belum ada sprint pack) → Blueprint Drift Check = N/A baseline;
  catatan versi → di bawah

---

## 1. Dependency Vulnerability Scan (`npm audit --audit-level=high`)

### spj-frontend — exit code 1 — "9 vulnerabilities (4 moderate, 5 high)"

| Paket | Severity | Advisory | Fix | Klasifikasi audit |
|---|---|---|---|---|
| `xlsx *` | **high** | GHSA-4r6h-8v6p-xvw6 (Prototype Pollution, CWE-1321) + GHSA-5pgg-2g8v-p4x9 (ReDoS, CWE-1333) | **No fix available** | **TINGGI** — direct dep, runtime, mem-parse file Excel upload user (BKU + AI panel). OWASP A06 |
| `browserslist <=4.28.6` | high | GHSA-c83g-rgw3-j3cx + GHSA-73wf-gq98-2v4g (OOM/crash) | `npm audit fix` | RENDAH — dev-only (build toolchain) |
| `nanoid <=3.3.17` | high | GHSA-28wg-ghj8-5hjv + GHSA-2v37-7h3g-55p8 (infinite loop) | `npm audit fix` | RENDAH — dev/transitive |
| `postcss <=8.5.22` | high | GHSA-fxqj-rqcc-2cmp + GHSA-r28c-9q8g-f849 (arbitrary .map disclosure) | `npm audit fix` | RENDAH — build-time, proses CSS sendiri |
| `react-router 6.0.0–7.17.0` | moderate | GHSA-wrjc-x8rr-h8h6 (open redirect backslash) + GHSA-337j-9hxr-rhxg (SSR deserializeErrors) | `npm audit fix` | SEDANG — runtime SPA; SSR N/A untuk Vite SPA |
| `esbuild <=0.24.2` / `vite <=6.4.2` | moderate | GHSA-67mh-4wv8-2f99 (dev-server request) | hanya via vite major (breaking) | RENDAH — dev-server only, tidak ikut build |
| `baseline-browser-mapping` | moderate | GHSA-w5vr-8v7q-w6rv (DoS) | `npm audit fix` | RENDAH — dev-only |

### root — exit code 1 — "1 high severity vulnerability"
- `xlsx *` — advisory sama seperti di atas (duplikat di root package.json). **TINGGI**, no fix.

### Ringkasan aksi tanpa-breaking-change
`npm audit fix` menutup: browserslist, nanoid, postcss, react-router, baseline-browser-mapping
(= 5 dari 9). `xlsx` tidak punya fix di SheetJS npm registry. esbuild/vite butuh major upgrade.

---

## 2. Secret Scan — **MANUAL** (gitleaks & trufflehog NOT_INSTALLED)

Pola dicari (tracked files): `sk-[A-Za-z0-9]{20}`, `BEGIN PRIVATE KEY`, JWT `eyJ...`,
`password|secret = '...'` → **0 temuan**.

Riwayat git:
- `spj-frontend/.env` — **tidak pernah ter-commit** (`git log --all` kosong) ✅
- `.gitignore:11:.env` mencakup `spj-frontend/.env` (verifikasi `git check-ignore`) ✅

**Rekomendasi**: pasang gitleaks (pre-commit + CI) agar scan tidak manual lagi.

---

## 3. Environment Hygiene

| Cek | Status | Bukti |
|---|---|---|
| `.env` ada & di-gitignore | ✅ | `spj-frontend/.env` ada; `git check-ignore` OK |
| `.env` tidak pernah masuk history | ✅ | `git log --all -- spj-frontend/.env` → kosong |
| `.env.example` ada | ✅ | `spj-frontend/.env.example` (2.9KB) |
| `.env.example` mendokumentasikan SEMUA var | **❌ DRIFT** | `.env` punya 4 var yang TIDAK ada di `.env.example`: `VITE_AI_MODEL`, `VITE_CEREBRAS_API_KEY`, `VITE_CEREBRAS_MODEL`, `VITE_GROQ_API_KEY`. Sebaliknya `.env.example` punya `VITE_GEMINI_API_KEY` yang tidak dipakai di `.env` (tapi dibaca kode) |

**TINGGI (arsitektural, sudah tercatat RISKS.MD #2)**: semua `VITE_*_API_KEY` ditanam Vite ke
bundle client → terekspose ke siapa pun yang membuka aplikasi. Diterima sementara (tanpa backend);
mitigasi budget-cap + rotate + larangan secret ber-scope tinggi di client.

---

## 4. Code-level Checklist P1 (Bab 22.2)

| Item | Status | Bukti / Catatan |
|---|---|---|
| Input validation endpoint | N/A | Tidak ada backend/endpoint |
| Validasi upload file (tipe+ukuran) | **❌** | `AskAIPanel.jsx` membaca PDF/Excel/TXT/gambar tanpa cap ukuran/tipe yang ditemukan — file besar → memori browser (impact rendah, app lokal) → **SEDANG** |
| Rate limiting | N/A | Tidak ada backend; panggilan AI langsung dari client (pakai kuota key sendiri) |
| Auth endpoint | N/A | — |
| Login aplikasi | **⚠️** | `LoginPage.jsx:19-24`: `if (username && password)` → `localStorage.spj_auth=true` — kredensial APAPUN diterima, client-side only → **SEDANG** (data juga lokal; jadi masalah nyata hanya saat app di-deploy publik) |
| Error leak stack trace / secret | ✅ | Error ditampilkan sebagai pesan user (`err.message` pada upload); tidak ditemukan kebocoran stack/secret |

---

## 5. Blueprint Drift

- BLUEPRINT.MD belum ada (belum ada sprint) → check N/A untuk baseline.
- Semua dependency di `spj-frontend/package.json` memakai range `^` — lockfile ADA
  (`package-lock.json`) sehingga versi terpasang terkunci. Catat sebagai RENDAH:
  saat sprint pertama dibuat, BLUEPRINT.MD wajib mem-pin versi eksak.

---

## 6. Tabel Temuan (klasifikasi Bab 13 + tag CWE/OWASP)

| # | Temuan | Severity | Tag | Evidence | Status |
|---|---|---|---|---|---|
| F1 | `xlsx` prototype pollution + ReDoS, no fix, mem-parse Excel upload user | **TINGGI** | CWE-1321, CWE-1333, OWASP A06 | npm audit "xlsx * Severity: high ... No fix available" | OPEN → RISKS.MD |
| F2 | API key AI (3 provider) terekspos di bundle client | **TINGGI** | OWASP A02 | `aiConfig.js` `import.meta.env.VITE_*_API_KEY` | OPEN (diterima sementara) → RISKS.MD |
| F3 | `.env.example` drift: 4 var tidak terdokumentasi (termasuk 2 API key) | SEDANG | Hygiene | diff nama var `.env` vs `.env.example` | OPEN |
| F4 | Upload tanpa cap ukuran/tipe | SEDANG | CWE-400 (light) | `AskAIPanel.jsx:158-201` tanpa `MAX_SIZE` | OPEN |
| F5 | Login client-side menerima kredensial apapun | SEDANG | OWASP A07/A01 (light) | `LoginPage.jsx:19-24` | OPEN (relevan saat deploy publik) |
| F6 | react-router open redirect (backslash) | SEDANG | CWE-601 | GHSA-wrjc-x8rr-h8h6 | OPEN — fix via `npm audit fix` |
| F7 | 4 vuln dev-toolchain (browserslist/nanoid/postcss/baseline-browser-mapping) + esbuild dev-server | RENDAH | — | npm audit | OPEN — fix via `npm audit fix` (kecuali esbuild/vite major) |
| F8 | Range `^` di package.json (lockfile ada) | RENDAH | Drift | `spj-frontend/package.json` | OPEN — pin di BLUEPRINT.MD sprint-001 |
| F9 | Secret scan manual (gitleaks tidak terpasang) | RENDAH | Tooling | `gitleaks version` NOT_INSTALLED | OPEN — rekomendasi pasang |

---

## 7. Gate Decision (verdict — full clarity)

**VERDICT: FINDINGS — BASELINE RECORDED, NOT DEPLOY-BLOCKING.**

Tidak ada temuan KRITIS (tidak ada secret live yang ter-commit; `.env` tidak pernah
masuk history). Ada 2 temuan TINGGI yang OPEN (F1 `xlsx`, F2 API key client) —
keduanya bersifat arsitektural/dependency pada aplikasi lokal tanpa backend,
dan sesuai aturan baseline adopsi (27.8.2 ritel 6): *"temuan belum wajib diperbaiki
semua — jadwalkan bertahap lewat RISKS.MD"*. Keduanya kini terjadwal di RISKS.MD.

Aplikasi TIDAK sedang di-deploy; saat deploy publik pertama kali, F1 dan F2 WAJIB
diselesaikan dulu (F2 = pindah key ke server proxy; F1 = migrasi parser Excel atau
isolasi parsing), dan `/deploy-production-gate` akan mengeceknya.

## 8. Rekomendasi REWORK (untuk sprint berikutnya — skill ini TIDAK mengedit)

1. `npm audit fix` (non-breaking) → tutup F6 + F7 sebagian. Bukti: jalankan ulang audit.
2. Lengkapi `.env.example` (4 var hilang) → tutup F3.
3. Cap ukuran+tipe upload di AskAIPanel (mis. 5MB, whitelist ext) → tutup F4.
4. Keputusan `xlsx`: (a) terima + mitigasi parse user-initiated only, atau (b) migrasi
   exceljs — butuh ADR di DECISIONS.MD → diskusikan di QUESTIONS.MD.
5. Pasang gitleaks + GitHub Actions CI (Bab 22.3 template ci.yml) → tutup F9 + mencegah regresi.
