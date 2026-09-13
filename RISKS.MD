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
