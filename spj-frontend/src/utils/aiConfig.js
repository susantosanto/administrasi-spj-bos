/**
 * aiConfig.js — Konfigurasi Modular untuk Fitur AI
 * 
 * ── KENAPA MODULAR? ──────────────────────────────────────────
 * Semua konfigurasi AI ada di SATU FILE ini.
 * Mau ganti provider? Cukup edit 1 file.
 * Mau ganti model? Cukup edit 1 file.
 * Mau nambah provider baru? Tinggal tambah entry di PROVIDERS.
 * 
 * ── CARA PAKAI ───────────────────────────────────────────────
 * import aiConfig from './aiConfig'
 * aiConfig.getActiveProvider()    → provider yang aktif
 * aiConfig.getProvider('cerebras') → config lengkap 1 provider
 * aiConfig.registerProvider({...}) → tambah provider baru runtime
 * 
 * ── DUKUNGAN PROVIDER ────────────────────────────────────────
 * Primary  : Cerebras (gpt-oss-120b) — gratis, cepat
 * Fallback : Groq (llama-3.1-8b-instant) — gratis, OpenAI-compatible
 * Cadangan : Gemini (gemini-2.0-flash) — free tier 60 req/menit
 * 
 * ── NOTE ─────────────────────────────────────────────────────
 * Untuk sekarang API Key masih VITE_* (frontend).
 * Saat migrasi ke Electron + SQLite, ganti cara baca API Key
 * dari env → dari main process / SQLite. Cukup edit 1 file ini!
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. PROVIDER DEFINITIONS — Tambah/ganti provider di sini!
// ═══════════════════════════════════════════════════════════════════════════

const PROVIDERS = {
  puter: {
    name: 'Puter',
    model: 'gpt-4o',
    apiKey: 'puter-free', // truthy agar masuk getActiveProviders()
    endpoint: '', // tidak dipakai — Puter.js pakai SDK sendiri
    baseUrl: '',
    directApiPath: '',
    useApiKeyParam: false,
    priority: 0, // PRIORITAS TERTINGGI — gratis, tanpa API key, tanpa proxy!
    supportsStreaming: false, // non-streaming dulu untuk prototype
    maxTokens: 4096,
    description: 'Puter.js — GRATIS, tanpa API key, tanpa proxy',
  },
  cerebras: {
    name: 'Cerebras',
    model: import.meta.env.VITE_CEREBRAS_MODEL || 'gpt-oss-120b',
    apiKey: import.meta.env.VITE_CEREBRAS_API_KEY || '',
    endpoint: '/api/cerebras/chat/completions',
    baseUrl: 'https://api.cerebras.ai/v1',
    directApiPath: '/chat/completions', // ← untuk direct API call (tanpa proxy)
    useApiKeyParam: false, // ← pakai Authorization: Bearer header
    priority: 1,
    supportsStreaming: true,
    maxTokens: 4096,
    description: 'Primary — gratis, sangat cepat',
  },
  groq: {
    name: 'Groq',
    model: import.meta.env.VITE_AI_MODEL || 'llama-3.1-8b-instant',
    apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
    endpoint: '/api/groq/chat/completions',
    baseUrl: 'https://api.groq.com/openai/v1',
    directApiPath: '/chat/completions',
    useApiKeyParam: false,
    priority: 2,
    supportsStreaming: true,
    maxTokens: 8192,
    description: 'Fallback — gratis, OpenAI-compatible',
  },
  gemini: {
    name: 'Gemini',
    model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    endpoint: '/api/gemini/models/gemini-2.0-flash:streamGenerateContent',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    directApiPath: '/models/gemini-2.0-flash:generateContent', // non-streaming dulu
    useApiKeyParam: true, // ← Gemini: ?key= di query param, bukan Bearer header
    priority: 3,
    supportsStreaming: false, // streaming disabled — beda format SSE
    maxTokens: 8192,
    description: 'Cadangan — kualitas Bahasa Indonesia terbaik',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. AI SETTINGS — Sesuaikan parameter AI di sini
// ═══════════════════════════════════════════════════════════════════════════

const AI_SETTINGS = {
  // ── Output ──
  maxOutputTokens: 800,
  temperature: 0.3,

  // ── Cache ──
  cache: {
    enabled: true,
    maxSize: 100, // max entries in cache
    ttlMs: 5 * 60 * 1000, // 5 menit — data BKU bisa berubah
  },

  // ── Retry ──
  retry: {
    maxRetries: 2,
    baseDelayMs: 1000,
    useExponentialBackoff: true,
  },

  // ── Timeout ──
  timeout: {
    defaultMs: 30000, // 30 detik
    streamingMs: 60000, // 60 detik untuk streaming
  },

  // ── Streaming ──
  streaming: {
    enabled: true,
    bufferSize: 1024, // char buffer untuk batch update UI
    updateIntervalMs: 50, // update UI tiap 50ms
  },

  // ── Intent Classification ──
  intent: {
    enabled: true,
    minConfidence: 0.6,
    useQueryEngineFor: ['aggregate', 'filter', 'search', 'group'],
    useAIFor: ['general', 'explanation', 'template'],
  },

  // ── Data Context ──
  context: {
    maxTokens: 4000, // max token untuk context window
    compactMode: true, // selalu gunakan format compact
    maxDetailTransactions: 100,
  },

  // ── Notulen Generator ──
  notulen: {
    useMultiAgent: true, // true = 2-step extraction + generation
    maxPoin: 5,
    maxBaris: 7,
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PROMPTS — Edit prompts di sini
// ═══════════════════════════════════════════════════════════════════════════

const PROMPTS = {
  /**
   * Prompt untuk klasifikasi intent.
   * AI memilih: query (data) atau chat (umum)
   */
  intentClassifier: `Kamu adalah classifier intent untuk aplikasi LPJ BOS/BOSP Indonesia.

TUGAS: Tentukan jenis pertanyaan user berikut. Jawab HANYA dengan JSON.

Format jawaban:
{
  "type": "query" | "chat" | "general",
  "confidence": 0.0 - 1.0,
  "query": { ... } // hanya jika type = "query"
}

PEDOMAN KLASIFIKASI:
- "query" = pertanyaan yang butuh data SPESIFIK dari localStorage (total pengeluaran, jumlah guru, data pajak, dll)
- "chat" = pertanyaan tentang fitur/template/konsep yang butuh pengetahuan umum (cara buat SPPD, apa itu BOSP, template honor guru)
- "general" = pertanyaan umum di luar SPJ (siapa presiden, apa itu AI, dll)

UNTUK TYPE "query", isi field "query" dengan:
{
  "source": "bku_data" | "data_guru" | "data_tendik" | "data_sekolah",
  "filter": { "bulan": [1], "tipe": ["PEMBAYARAN"] }, // optional
  "aggregate": { "sum": "pengeluaran" }, // optional — sum/count
  "groupBy": "bulan" // optional
}

CONTOH:
User: "Berapa total pengeluaran bulan Januari?"
→ {"type": "query", "confidence": 0.95, "query": {"source": "bku_data", "filter": {"bulan": [1], "tipe": ["PEMBAYARAN"]}, "aggregate": {"sum": "pengeluaran"}}}

User: "Bagaimana cara membuat SPPD?"
→ {"type": "chat", "confidence": 0.9}

User: "Apa itu dana BOSP?"
→ {"type": "general", "confidence": 0.95}`,

  /**
   * System prompt untuk query data — data dikirim sebagai context
   */
  systemQuery: `Kamu adalah asisten AI untuk aplikasi LPJ BOS/BOSP Indonesia.

TUGAS: Jawab pertanyaan user berdasarkan DATA NYATA yang diberikan di bawah.

=== PANDUAN MEMBACA DATA BKU ===
Data BKU terdiri dari beberapa jenis transaksi:
1. PENERIMAAN_BOSP — dana masuk (dari BBU)
2. PEMBAYARAN — belanja/pengeluaran ke pihak ketiga (punya BPU/BNU)
3. SETOR_PAJAK — setoran PPh/Pajak ke kas negara (tanpa BPU/BNU)
4. PUNGUT_PPH — penerimaan dari pungutan PPh (penerimaan, bukan pengeluaran)
5. SALDO_AWAL — saldo awal kas
6. TARIK_TUNAI — penarikan tunai dari bank
7. BUNGA_BANK, PAJAK_BUNGA — bunga bank dan pajaknya

PENTING: 
- "PENGELUARAN" atau "PEMBAYARAN" = SEMUA transaksi yang punya nilai pengeluaran > 0 (termasuk SETOR_PAJAK, TARIK_TUNAI, dll)
- BUKAN hanya tipe PEMBAYARAN saja! SETOR_PAJAK (PPh23) juga termasuk pengeluaran riil
- "PENERIMAAN" = SEMUA transaksi dengan penerimaan > 0

Semua transaksi PENGELUARAN dikelompokkan berdasarkan KODE REKENING.
Kode rekening menentukan kategori belanja.

Gunakan kode rekening untuk menjawab pertanyaan tentang kategori tertentu!

ATURAN:
- Bahasa Indonesia, RINGKAS (maks 3 kalimat)
- Sertakan angka spesifik dalam Rp (rupiah)
- Jika tidak yakin dengan data, tulis apa yang ada di data
- JANGAN membuat data palsu
- JANGAN menyebut "Asisten" atau "AI" — jawab langsung`,

  /**
   * General prompt untuk pertanyaan umum
   */
  general: `Kamu adalah asisten AI khusus untuk operator sekolah di Indonesia.

KEPRIBADIAN:
- Ramah, sabar, dan membantu seperti rekan kerja yang berpengalaman
- Mengerti dunia pendidikan dan administrasi sekolah di Indonesia
- Selalu menggunakan bahasa Indonesia yang baik dan santun
- Tidak menggurui, tapi memberi penjelasan yang mudah dipahami

KEAHLIAN:
1. DANA BOSP — bisa menjelaskan BOS, BOSP, ARKAS, SIPLAH, LPJ, dan semua hal terkait keuangan sekolah
2. ADMINISTRASI SEKOLAH — surat-menyurat, SK, notulen rapat, SPPD, dokumen guru
3. DAPODIK — mengerti tentang data pokok pendidikan dan GTK
4. PAJAK — PPh21, PPh23, PPN untuk keperluan sekolah
5. PELAPORAN — LPJ, SPJ, RKAS, realisasi anggaran, dan pertanggungjawaban

ATURAN:
- Jawab dengan ramah dan informatif
- Bahasa Indonesia, maksimal 5-7 kalimat untuk jawaban singkat
- Boleh lebih panjang jika diminta detail
- Jika ditanya di luar keahlianmu, akui saja dengan jujur
- JANGAN menyebut dirimu "Asisten" atau "AI" — cukup jawab langsung
- JANGAN membuat data palsu tentang keuangan — jika tidak tahu, bilang tidak tahu`,

  /**
   * Prompt untuk generate ringkasan notulen
   */
  notulen: `Kamu adalah operator sekolah yang menulis notulen rapat.

TUGAS: Berdasarkan NAMA KEGIATAN yang diberikan, buat ringkasan poin pembahasan rapat yang REALISTIS dan sesuai untuk dokumen Notula Rapat di sekolah.

ATURAN:
- Bahasa Indonesia FORMAL
- Mulai dengan kalimat pembuka: "Rapat membahas tentang [kegiatan]..."
- Tulis 3-5 poin pembahasan menggunakan format: a. ... b. ... c. ...
- Tutup dengan: "Demikian ringkasan rapat ini dibuat untuk diketahui dan digunakan sebagaimana mestinya."
- TOTAL maksimal 7 baris
- JANGAN menyebut AI atau Asisten — seolah-olah ini ditulis notulen rapat sungguhan
- Jangan gunakan tanda bintang/asterisk (*) untuk markdown
- Gunakan format teks biasa saja`,
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. AI CONFIG CLASS — Dengan method helper
// ═══════════════════════════════════════════════════════════════════════════

class AIConfig {
  constructor() {
    this._providers = { ...PROVIDERS }
    this._settings = JSON.parse(JSON.stringify(AI_SETTINGS))
    this._prompts = { ...PROMPTS }
  }

  // ── Provider Management ──

  /** Dapatkan daftar semua provider */
  getAllProviders() {
    return Object.values(this._providers)
  }

  /** Dapatkan 1 provider by key */
  getProvider(key) {
    return this._providers[key]
  }

  /** Dapatkan provider yang aktif (punya API key), urut berdasarkan priority */
  getActiveProviders() {
    return Object.values(this._providers)
      .filter(p => p.apiKey)
      .sort((a, b) => a.priority - b.priority)
  }

  /** Dapatkan provider aktif pertama (primary) */
  getActiveProvider() {
    return this.getActiveProviders()[0] || null
  }

  /** Tambah atau update provider runtime */
  registerProvider(key, config) {
    this._providers[key] = { ...this._providers[key], ...config }
  }

  /** Hapus provider */
  removeProvider(key) {
    delete this._providers[key]
  }

  /** Ganti API key provider runtime (berguna saat migrasi ke Electron) */
  setApiKey(providerKey, apiKey) {
    if (this._providers[providerKey]) {
      this._providers[providerKey].apiKey = apiKey
    }
  }

  // ── Settings ──

  get settings() {
    return this._settings
  }

  updateSettings(overrides) {
    this._settings = { ...this._settings, ...overrides }
  }

  // ── Prompts ──

  getPrompt(key) {
    return this._prompts[key] || ''
  }

  updatePrompt(key, content) {
    this._prompts[key] = content
  }

  // ── URL Resolution ──

  /**
   * Dapatkan URL endpoint yang tepat untuk provider.
   * - Dev (localhost): pakai proxy endpoint (/api/groq/...) — Vite proxy
   * - Production (Vercel): pakai direct URL (baseUrl + directApiPath) — langsung ke API
   * 
   * @param {object|string} provider — Provider object atau key string
   * @returns {string} URL lengkap
   */
  getProviderUrl(provider) {
    const p = typeof provider === 'string' ? this._providers[provider] : provider
    if (!p) return null

    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1'

    if (isLocalhost) {
      // Dev: proxy endpoint (Vite rewrite)
      return p.endpoint
    }

    // Production: direct API URL
    const path = p.directApiPath || '/chat/completions'
    const baseUrl = p.baseUrl.replace(/\/+$/, '') // hapus trailing slash
    const url = `${baseUrl}${path}`

    if (p.useApiKeyParam) {
      // Gemini: API key di query param
      return `${url}?key=${encodeURIComponent(p.apiKey)}`
    }
    return url
  }

  /**
   * Dapatkan headers untuk request ke provider.
   * - Gemini: Authorization tidak perlu (key di URL)
   * - Lainnya: Bearer token
   */
  getProviderHeaders(provider) {
    const p = typeof provider === 'string' ? this._providers[provider] : provider
    if (!p) return { 'Content-Type': 'application/json' }

    const headers = { 'Content-Type': 'application/json' }
    if (!p.useApiKeyParam && p.apiKey) {
      headers['Authorization'] = `Bearer ${p.apiKey}`
    }
    return headers
  }

  // ── Utility ──

  /** Cek apakah ada provider aktif */
  hasActiveProvider() {
    return this.getActiveProviders().length > 0
  }

  /** Dapatkan daftar nama provider aktif */
  getActiveProviderNames() {
    return this.getActiveProviders().map(p => p.name).join(', ')
  }

  /** Reset ke konfigurasi awal */
  reset() {
    this._providers = { ...PROVIDERS }
    this._settings = JSON.parse(JSON.stringify(AI_SETTINGS))
    this._prompts = { ...PROMPTS }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const aiConfig = new AIConfig()

export default aiConfig
export { PROVIDERS, AI_SETTINGS, PROMPTS, AIConfig }
