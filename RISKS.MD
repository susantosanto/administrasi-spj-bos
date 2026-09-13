# RISKS.MD — Daftar Risiko

## Format
⚠️ [Kemungkinan: Tinggi/Sedang/Rendah] RISIKO: <deskripsi>
  Dampak: <Tinggi/Sedang/Rendah>
  Mitigasi: <solusi>

## Daftar Risiko

⚠️ [Sedang] RISIKO: 13 template belum pernah diverifikasi test cetak end-to-end
  (per docs/AGENT.md 2026-07-30: "test cetak 13 template — perlu running app")
  Dampak: Sedang — output cetak bisa meleset dari template asli
  Mitigasi: jalankan test cetak semua template saat app berjalan sebelum
    menambah fitur baru

⚠️ [Tinggi] RISIKO: API key AI terekspos di sisi client.
  FAKTA: `spj-frontend/src/utils/aiConfig.js` membaca `VITE_CEREBRAS_API_KEY`,
  `VITE_GROQ_API_KEY`, `VITE_GEMINI_API_KEY` via `import.meta.env`. Semua variabel
  ber-awalan `VITE_` DITANAM Vite ke dalam bundle JavaScript yang dikirim ke browser —
  siapa pun yang membuka aplikasi dapat mengekstrak key tersebut dari source bundle
  (mis. lewat tab Sources / view-source pada file JS hasil build).
  Dampak: Tinggi — key bisa dipakai orang lain atas nama akun pemilik key
    (biaya/kuota provider), abuse API, potensi tagihan tak terduga.
  Status: Risiko DITERIMA sementara (aplikasi tanpa backend, tidak ada tempat aman
    lain untuk key) dan tercatat di CONSTITUTION.md Security Rules.
  Mitigasi jangka pendek:
    1. Set batas budget/kuota di dashboard tiap provider (Cerebras/Groq/Gemini).
    2. Rotate key secara berkala dan SEGERA jika disebarkan ke publik.
    3. JANGAN menambah secret ber-scope tinggi (billing besar, data sensitif)
       di sisi client.
  Mitigasi jangka panjang: saat backend dibangun, pindahkan panggilan AI ke
    server proxy — key hanya di env var server, tidak pernah dikirim ke browser.

⚠️ [Tinggi] RISIKO: `xlsx@0.18.5` (SheetJS) — prototype pollution (GHSA-4r6h-8v6p-xvw6,
  CWE-1321) + ReDoS (GHSA-5pgg-2g8v-p4x9, CWE-1333), TANPA fix di npm registry
  (audit baseline SECURITY-AUDIT-001 F1, 2026-09-13).
  FAKTA: direct dependency di root DAN spj-frontend; dipakai mem-parse file Excel
  yang di-upload user (BKUPage, AskAIPanel). Workbook yang dirancang khusus dapat
  memicu pollution/loop regex.
  Dampak: Tinggi — potensi eksekusi terganggu/kebobolan properti objek global pada
    file yang dimuat; RENDAH dalam praktik app lokal (file milik user sendiri).
  Status: OPEN — keputusan (terima + mitigasi vs migrasi exceljs) butuh ADR.
  Mitigasi:
    1. Parsing tetap hanya atas file yang dipilih user sendiri (jangan pernah
       auto-fetch Excel dari sumber eksternal).
    2. Keputusan migrasi parser → QUESTIONS.MD + ADR DECISIONS.MD.
    3. WAJIB diselesaikan sebelum deploy publik pertama (gate deploy-production).

⚠️ [Sedang] RISIKO: temuan baseline audit lain yang terjadwal bertahap
  (SECURITY-AUDIT-001, 2026-09-13): .env.example drift 4 var (F3), upload tanpa
  cap ukuran/tipe (F4), login client-side tanpa verifikasi (F5), react-router
  open redirect — fix via npm audit fix (F6), 4+1 vuln dev-toolchain (F7),
  pin versi di BLUEPRINT.MD sprint-001 (F8), gitleaks belum terpasang (F9).
  Dampak: Sedang — akumulasi utangan teknis keamanan; F5 relevan saat deploy publik.
  Mitigasi: kerjakan lewat REWORK list SECURITY-AUDIT-001 §8 pada sprint berikutnya.
