# DECISIONS.MD — Log Keputusan

## Format
[YYYY-MM-DD] Keputusan: <apa>
  Status: proposed | accepted | superseded
  Alasan: <mengapa>
  Dibuat oleh: <siapa>
  Dampak: <apa yang berubah>

## Daftar Keputusan

[2026-09-13] Keputusan: Stack React 18 + Vite + Tailwind CSS (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi (keputusan dibuat sebelum adopsi workflow)
  Dibuat oleh: legacy
  Dampak: semua pengembangan berlanjut di `spj-frontend/` (Vite + Tailwind)

[2026-09-13] Keputusan: Data persist di localStorage browser (prefix `spj_`), tanpa backend (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: tidak ada sinkronisasi antar perangkat; rencana backend masih tahap
    riset (lihat `docs/RISET_SUPABASE_VS_ALTERNATIF.md`)

[2026-09-13] Keputusan: Arsitektur template engine — `templateConfig.js` (13 template)
  → `TemplateEngine.jsx` → block components (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: template baru ditambahkan via `templateConfig.js` + komponen di `blocks/`

[2026-09-13] Keputusan: Design system Material Design 3 Corporate Modern, blue-only
  `#004ac6`, font Hanken Grotesk (headline) + Inter (body), ikon Material Symbols (as adopted)
  Status: accepted
  Alasan: legacy, belum terdokumentasi
  Dibuat oleh: legacy
  Dampak: aturan warna wajib tercatat di AGENTS.MD; spesifikasi detail di
    `docs/ARCHITECTURE.MD`

[2026-09-13] Keputusan: Konsep detail dokumen 2 wajah (editor premium di layar, dokumen
  formal saat cetak) — referensi implementasi pertama: Tab SK Honorer (2026-08)
  Status: accepted
  Alasan: memisahkan workspace penyiapan dokumen dari hasil cetak formal
  Dibuat oleh: legacy (terdokumentasi di docs/AGENT.md sebelumnya)
  Dampak: semua template dokumen baru wajib ikuti checklist di `docs/ARCHITECTURE.MD`

[2026-09-13] Keputusan: Adopsi workflow Architect-Builder — folder source-of-truth dibuat
  (AGENTS.MD, STATE.MD, DECISIONS.MD, DOMAIN.MD, RISKS.MD, QUESTIONS.MD, planning/,
  architect-packs/, docs/runbooks/) tanpa memindah/mengubah kode existing
  Status: accepted
  Alasan: workflow berlaku MAJU sejak titik adopsi 9cdcd10 (aturan emas adopsi 27.8);
    folder = source of truth, bukan chat history (Pilar #3)
  Dibuat oleh: user
  Dampak: semua kerja baru ikuti pipeline penuh; tidak ada sprint fitur sebelum
    baseline keamanan selesai (27.8.2)

[2026-09-13] Keputusan: Konsolidasi file agent — docs/AGENT.md (2026-07-30) dihapus,
  kontennya didistribusikan; AGENTS.MD (root) jadi SATU-SATUNYA file agent
  Status: accepted
  Alasan: hindari double router yang bertentangan (docs/AGENT.md mengaku "baca dulu"
    vs AGENTS.MD); AGENTS.MD = konvensi lintas-tool yang auto-dibaca (Bab 7.1)
  Dibuat oleh: user
  Dampak: router tunggal; konten lama pindah ke DOMAIN.MD, DECISIONS.MD, STATE.MD,
    docs/STANDAR-TEKNIS.md (riwayat: docs/AGENT.md masih ada di git history)

[2026-09-13] Keputusan: docs/ mengikuti struktur standar 5 dokumen Bab 6.1 —
  docs/STANDAR-TEKNIS.md (monolit) diekstrak ke ARCHITECTURE / DATA-MODEL / API /
  PERMISSIONS / VALIDATION lalu dihapus
  Status: accepted
  Alasan: ikuti struktur standar metode (Bab 6.1); slot kosong (API, PERMISSIONS)
    dibiarkan placeholder jujur sampai keputusan backend diambil
  Dibuat oleh: user
  Dampak: AGENTS.MD + DECISIONS.MD kini menunjuk docs/ARCHITECTURE.MD; dokumen riset
    lama di docs/ tidak disentuh

[2026-09-13] Keputusan: CONSTITUTION.md dibuat (ritel 4 Jalur A 27.8.2) — aturan proyek
  + standar keamanan untuk kerja MAJU; AGENTS.MD masuk daftar baca wajib
  Status: accepted
  Alasan: semua skill mewarisi standar yang sama; compliance report berbasis scan
    nyata; pelanggaran legacy TIDAK dibenahi retroaktif (aturan emas adopsi 27.8) —
    dibenahi bertahap saat file terkait disentuh sprint
  Dibuat oleh: user
  Dampak: temuan keamanan (API key AI client-exposed) tercatat sebagai risiko
    Tinggi di RISKS.MD dengan mitigasi; gate build menggantikan test suite sampai
    framework test diadopsi
