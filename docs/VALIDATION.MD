# VALIDATION.MD — Cara Validasi Sistem

(Backfill dari kondisi aktual saat adopsi workflow 2026-09-13 — ritel 3 Jalur A 27.8.2.
Diekstrak dari docs/STANDAR-TEKNIS.md.)

## 1. Validasi Build (wajib setiap perubahan kode)
```bash
cd spj-frontend && npm run build
```
Build harus sukses sebelum lapor selesai. Bukti = output build asli, bukan klaim.

## 2. Validasi Output Cetak (dokumen A4)
- Preview HARUS menampilkan ukuran yang sama dengan print (A4, satuan `mm`)
- Chrome layar (shadow, badge, tombol, highlight) tidak boleh ikut cetak —
  cek CSS `print-area` / `screen-only` + `page-break` (lihat ARCHITECTURE.MD)
- Penomoran konten berulang: level 0 = angka (1., 2., 3.), level 1 = huruf (a., b., c.) —
  JANGAN satu class CSS untuk semua level (pelajaran bug `template/sk-honorer.html`)
- ⚠️ Test cetak 13 template BELUM pernah dilakukan end-to-end (lihat RISKS.MD) —
  lakukan sebelum menambah fitur baru

## 3. Smoke-test Template Dokumen Baru
Checklist wajib 10 langkah (editor wajah layar, block formal print-area, default konten,
enrich, readiness check, build, smoke-test render) → lihat ARCHITECTURE.MD
section "Checklist Template Dokumen Baru".

## 4. Validasi Kode — Standar Kode (Clean Code)

### Naming Convention
| Tipe | Format | Contoh |
|------|--------|--------|
| Component | PascalCase | `TemplateEngine.jsx`, `KopSurat.jsx` |
| Function | camelCase | `handleOpenCard()`, `getStatus()` |
| Variable | camelCase | `selectedSubKategori`, `formData` |
| Constant | UPPER_SNAKE | `COLOR_MAP`, `TEMPLATE_CONFIGS` |
| CSS Class | kebab-case | `bg-primary`, `text-on-surface` |
| File | PascalCase (components), camelCase (utils) | `TemplateEngine.jsx`, `templateHelpers.js` |

### File Structure Pattern
Urutan dalam file: imports (external → internal → utils) → constants/config →
component (state → effects → helpers → handlers → render). Section divider (`═══`)
untuk bagian besar.

### Comments & Documentation
- Comment menjelaskan **MENGAPA**, bukan **APA**
- JSDoc untuk functions kompleks (`@param`, `@returns`)

### Readability Rules
| Rule | Contoh ❌ | Contoh ✅ |
|------|-----------|-----------|
| Hindari magic numbers | `if (x > 5)` | `if (x > MAX_RETRY)` |
| Hindari nested dalam | `if (a) { if (b) { ... } }` | Guard clause |
| Function < 50 baris | Function 200 baris | Split menjadi beberapa function |
| Variable names deskriptif | `const d = ...` | `const completedItems = ...` |

### Component Guidelines
Single responsibility, props jelas dan bermakna (bukan `{config, d, cb, m}`).

### File Size Guidelines
| Tipe | Maks | Jika lebih |
|------|------|-----------|
| Component | 300 baris | Split ke child components |
| Utility | 200 baris | Split ke multiple files |
| Config | 150 baris | Group ke separate files |

### Testing Checklist (sebelum commit)
- [ ] Code bisa dibaca tanpa comment (variable names jelas)
- [ ] Function tidak lebih dari 50 baris
- [ ] Tidak ada magic numbers (gunakan constants)
- [ ] Comments menjelaskan MENGAPA, bukan APA
- [ ] Build berhasil: `cd spj-frontend && npm run build`
- [ ] Tidak ada console.log yang tertinggal
