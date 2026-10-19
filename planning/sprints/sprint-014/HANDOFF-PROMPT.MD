# HANDOFF-PROMPT — Sprint 014: Laporan Rincian Pajak

> **Dokumen 4 dari 4** Architect Pack. Prompt siap tempel untuk builder (ZCode/sesi baru).

---

## PROMPT

Kamu builder untuk repo `spj-app` (React 18 + Vite, tanpa backend, data di localStorage
prefix `spj_`). Branch kerja: **`feat/laporan-rincian-pajak`** (base sudah memuat
`wip/register-kas-bap` — infra kas/print sudah ada).

**Baca berurutan (wajib):**
1. `AGENTS.MD` → `CONSTITUTION.md` → `STATE.MD` (Status Saat Ini)
2. `planning/sprints/sprint-014/REQUIREMENTS.MD`
3. `planning/sprints/sprint-014/BLUEPRINT.MD`
4. `planning/sprints/sprint-014/ACCEPTANCE.MD`

**Tugas:** menu "Rincian Pajak" di kategori Keuangan halaman Dokumen Kelengkapan →
panel preview laporan rincian pajak **landscape identik** `template/Contoh template
Rincian Pajak Sekolah Dasar Negeri.xlsx` (sheet `SD_SMP`), baris terisi otomatis dari
transaksi BKU bertipe SETOR_PAJAK/PAJAK_BUNGA, kolom yang tidak ada di BKU diisi manual
di layar dan disimpan di `spj_pajak_manual`.

**Fakta yang sudah diverifikasi (jangan diuji ulang dari nol):**
- Template: 16 kolom A..P, header 2 tingkat (G3:J3 menaungi PPh 21/22/23/PPN), baris
  nomor 1..16, data baris 6-29, Total baris 30 (SUM G/H/J/K; I30 KOSONG di sumber →
  keputusan user: DITAMBAH), A4 landscape, font header Arial 8 bold.
- Keputusan user 2026-10-19: judul typo "R6NCIAN" → **"RINCIAN"**; kolom manual
  (jenis pajak, NTPN, kode billing, tanggal NTPN, keterangan) **tanpa default
  otomatis**; TANGGAL BAYAR dari `tx.tanggal` (bisa ditimpa); cakupan pajak yang
  dibayar sekolah (bukan SIPLAH); menu di kategori Keuangan.
- Model transaksi BKU: `{tanggalISO, bulan (1-12), uraian, pengeluaran, tipe, noBukti}`.

**Aturan builder:** dry run dulu → lapor → tunggu approve; ikut pola Register Kas
(`templateConfig` entry → `TemplateEngine` → block); tanpa library baru; tanpa sentuh
`bkuParser.js`/`BKUPage.jsx`; build `npm run build` wajib exit 0; bukti nyata (output
oracle + PDF + screenshot), bukan klaim. Selesai → update `STATE.MD` + pack ini.

**MULAI:** dari REQUIREMENTS §5 (menu).
**SELESAI:** T-01..T-18 ACCEPTANCE PASS dengan bukti + build hijau + STATE.MD terupdate.
