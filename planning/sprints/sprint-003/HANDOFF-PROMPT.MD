# HANDOFF PROMPT — Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ

> **Dokumen 4 dari 4** Architect Pack (Bab 8.4). Prompt ini yang diserahkan ke **Builder**.
> Salin isi bagian "Prompt untuk Builder" ke sesi Builder (`/ai-coding-coach`, MODE DRY RUN).

---

## Prompt untuk Builder

```
Anda adalah BUILDER dalam metode Architect-Builder (Bab 8.6).
Proyek: spj-app — aplikasi LPJ BOS/BOSP (React 18 + Vite + Tailwind, localStorage, tanpa backend).

Tugas Anda untuk Sprint 003: Rework Lapisan Preview & Panduan Langkah Menu LPJ.

PRASYARAT — periksa DULU sebelum apa pun:
Sprint 001 + 002 sudah APPROVED 2026-09-30. Verifikasi cepat:
  ls planning/sprints/sprint-001/VERIFICATION-REPORT.MD planning/sprints/sprint-002/VERIFICATION-REPORT.MD
  grep -n "getSignatureRoles" spj-frontend/src/utils/signatureRoles.js
  grep -rnE "BADRUDDIN|WAHYUDIN|DEWI ERMIRAWATI|DEDE GUNAWAN|Yuniarti|SD NEGERI LEBAKLEUNGSIR" spj-frontend/src
  ls spj-frontend/src/components/templates/blocks/PeringatanData.jsx
Grep nama wajib 0 baris; kedua VERIFICATION-REPORT wajib ada. Bila tidak → BERHENTI, laporkan.

BOOTSTRAP (deterministik — jangan improvisasi):
  cd spj-frontend && npm ci && npm run build
Harapan: exit 0, output berakhir "✓ built in …". Bila gagal → berhenti, laporkan.
Dev server (opsional, untuk inspeksi): cd spj-frontend && npm run dev → http://localhost:5173
⚠️ npm ci di beberapa sandbox menghapus @esbuild/win32-x64 — bila build gagal setelah
npm ci, pulihkan: npm install @esbuild/win32-x64 --no-save (pola Sprint 001).

LANGKAH WAJIB — baca berurutan:
1. planning/sprints/sprint-003/REQUIREMENTS.MD   — apa & mengapa
2. planning/sprints/sprint-003/BLUEPRINT.MD      — bagaimana (file, task, DoD, DSA)
3. planning/sprints/sprint-003/ACCEPTANCE.MD     — kriteria selesai + test case
4. planning/sprints/sprint-002/BLUEPRINT.MD      — kontrak print-area (jangan diubah)
5. AGENTS.MD · STATE.MD · CONSTITUTION.md · DECISIONS.MD
6. fix-template-document.md (root repo)          — feedback user yang memicu sprint ini

LALU:
7.  DRY RUN — termasuk DRY RUN MAMIN (task 1.3): ekstrak struktur SEMUA docx Mamin
    di folder template/ → buat tabel pemetaan docx ↔ config ↔ data. Gap dilaporkan,
    JANGAN diimprovisasi.
8.  Laporkan rencana: file disentuh, task, hasil pemetaan Mamin, risiko.
    Nama tombol final SUDAH PUTUS (2026-09-30): "Lihat Ringkasan" — pakai, JANGAN
    ditanyakan lagi. "Preview Dokumen Foto" (BKUSidebar) dikecualikan dari grep T-02.
9.  TUNGGU persetujuan user sebelum menulis kode

JANGAN:
- Mulai coding tanpa persetujuan dry run
- Mengubah requirements (pertanyaan → QUESTIONS.MD, jangan asumsi)
- Menyentuh file di luar daftar BLUEPRINT.MD
- Mengubah isi/blok cetak warisan: blocks/SuratTugas.jsx · SPDForm.jsx ·
  SuratUndangan.jsx · KopSurat.jsx · KopGugus.jsx · SignatureFooter.jsx ·
  SKHonorer.jsx · utils/sekolahData.js · signatureRoles.js · pejabatRoles.js ·
  TemplateEngine.jsx (wilayah Sprint 001/002 — APPROVED)
- Mengubah alur/logika Menu Honorarium (hanya label tombol + pasang Panduan)
- Memakai library di luar BLUEPRINT.MD (0 dependency baru; versi ter-pin)
- Mengubah prefix localStorage `spj_` atau skema key yang ada
- Memparafrase dokumen cetak — struktur & kalimat warisan Sprint 002 utuh
- Memecah file legacy (DokumenFormPreview.jsx / templateConfig.js)
- Mengklaim hasil tanpa bukti (output build/grep asli atau screenshot)

SETUJU:
- Setelah dry run disetujui → kerjakan task urut Fase 1 → 5
- Setiap task: jalankan DoD (build/grep), tempel output sebagai bukti
- Commit kecil & atomic, Conventional Commits, pesan bahasa Indonesia
- Jalankan `npm run build` di gate tiap fase + gate akhir
- Perbarui STATE.MD + pack sprint setelah selesai
- Tutup loop lewat /state-keeper
```

---

## Ringkasan Handoff

| Item | Nilai |
|---|---|
| Sprint | 003 |
| Prasyarat | Sprint 001 + 002 APPROVED 2026-09-30 |
| User story | US-19 … US-30 |
| Jumlah task | **23 task** (Fase 1–5), tiap task 2–5 menit |
| File baru | **3** (`MenuGuide.jsx`, `guideConfig.js`, `SummaryCard.jsx`) |
| File diubah | 3–4 (`honorHelper.js`, `DokumenFormPreview.jsx`, `DokumenSPJPage.jsx`, `templateConfig.js` bila gap) |
| Dependency baru | **0** |
| Gate build | per fase + gate akhir |
| Jalur kritis | FASE 1 → 2 → 3 → 4 → 5 |
| Perkiraan urutan commit | 1) penerima+rename 2) kartu ringkasan 3) set cetak 4) panduan 5) regresi+gate |
| Keputusan user (PUTUS 2026-09-30) | nama tombol = **"Lihat Ringkasan"** · Pemeliharaan = **pola saja** · sisa dry run: pemetaan Mamin (task 1.3) |

## Setelah Sprint Selesai

1. `/acceptance-runner` — verifikasi independen **konteks segar** (AGENTS.MD)
2. `/security-dependency-auditor` — npm audit sebelum rilis (CONSTITUTION.md)
3. `/state-keeper` — tutup loop
4. Kembali ke `/sprint-planner` untuk sprint berikutnya

## Peringatan untuk Builder

⚠️ **Ini sprint perubahan PERILAKU, bukan sekadar tampilan:** lapisan yang semula
merender dokumen formal di layar diganti kartu ringkasan. Jangan menghapus fungsi
builder data (`buildSptData`/`buildSppdData`/`resumeData`/undangan) — mereka tetap
dipakai jalur CETAK. Yang berubah adalah SIAPA yang merender di LAYAR.

⚠️ **Batas tegas 3 sprint berjajar:** 001 = sumber nilai · 002 = struktur & layout ·
003 = lapisan preview & panduan. Menyentuh blok cetak warisan = regresi yang menjebol
gate warisan (15 pola + `<input>` + git-diff konsumen).

⚠️ **Panduan wajib non-modal & print:hidden.** Popover yang menutupi form, atau
muncul di hasil cetak, = gagal US-26/US-30. Auto-open hanya kunjungan pertama per
menu — muncul terus setelah dismiss = gagal US-28.

⚠️ **DRY RUN MAMIN (task 1.3) menentukan Fase 3.** Tanpa pemetaan docx↔config yang
disetujui user, set cetak Mamin tidak boleh dikodekan — gap diimprovisasi = pelanggaran.
