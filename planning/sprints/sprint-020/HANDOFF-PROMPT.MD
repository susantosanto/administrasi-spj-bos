# HANDOFF-PROMPT — Sprint 020: Generate Foto Dokumentasi AI Sungguhan

> Prompt untuk Builder (konteks segar). Baca dulu: AGENTS.MD → STATE.MD → DECISIONS.MD →
> pack sprint ini (PRD → REQUIREMENTS → BLUEPRINT → ACCEPTANCE).

## Aturan Eksekusi
1. **DRY RUN DULU** — baca pack + kode terkait (`imageGenerator.js`,
   `DokumentasiAIGenerate.jsx`, `useFotoDokumen.js`), laporkan rencana eksekusi +
   konfirmasi V-1…V-5 (verifikasi docs/uji kecil), **TUNGGU persetujuan user** sebelum
   menulis kode.
2. Keputusan user terkunci di PRD §1 (R-1…R-4) — JANGAN diputuskan ulang.
3. Gate anti-regresi di BLUEPRINT §5 wajib hijau sebelum lapor selesai.
4. Bukti nyata saja: output build asli, screenshot browser, hasil uji jaringan.
   Klaim tanpa bukti = gagal.
5. Selesai → update `STATE.MD` + checklist `ACCEPTANCE.MD` + `BUILD-REPORT.MD`
   (berisi V-1…V-5), lalu lapor. Commit/push = kuasa user.

## Konteks Minimal
- Fitur ini mengganti **canvas placeholder** di `generateWithPuter` dengan panggilan riil
  `puter.ai.txt2img` — komentar lama "Puter.js mungkin tidak support image generation"
  sudah usang (riset 2026-10-23, lihat PRD §2).
- Pollinations.ai DITOLAK (uji langsung: 402 Payment Required; anonymous 1 img/45s).
- Alur state foto Sprint 019 revisi (`useFotoDokumen` → `fotoDocs` → Panel Preview +
  print twin) TIDAK boleh disentuh — foto hasil generate masuk lewat jalur yang sama.
- Wajah personel = image-to-image (R-3): foto personel TERPILIH jadi input image;
  multi-orang mengikuti verifikasi V-5.
- Fallback canvas placeholder dipertahankan untuk kegagalan, dengan label jujur.
