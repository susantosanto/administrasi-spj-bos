/**
 * aiHelper.js — AI Agent untuk Fitur "Ask to AI" v2 (REFACTORED)
 * 
 * ── PERUBAHAN UTAMA ──────────────────────────────────────────
 * 
 * ✅ DUAL-PATH ARCHITECTURE
 *    Path A (Query) → QueryEngine execute → 100% akurat, 0 token
 *    Path B (Chat) → AI langsung jawab → fleksibel untuk umum
 * 
 * ✅ PROGRAM-OF-THOUGHT
 *    AI generate JSON query → JavaScript execute → format → AI natural language
 *    Bukan: AI hitung manual (rawan error matematika)
 * 
 * ✅ SEMANTIC CACHE
 *    Query berulang → return dari cache (0 token, instant)
 * 
 * ✅ MODULAR PROVIDER
 *    Config di aiConfig.js — ganti provider tinggal edit 1 file
 * 
 * ✅ STREAMING SUPPORT
 *    Response muncul token by token — UX jauh lebih responsif
 * 
 * ── ARSITEKTUR ───────────────────────────────────────────────
 * 
 * askAI() / askAIStream()
 *   │
 *   ├── 1. Semantic Cache check ── hit → return langsung
 *   │
 *   ├── 2. Intent Classifier ── AI decide path
 *   │     │
 *   │     ├── Path A: QueryEngine ── 100% akurat, 0 token hallucination
 *   │     │     └── Format hasil → AI natural language → return
 *   │     │
 *   │     └── Path B: AI Chat ── Langsung jawab dengan prompt
 *   │           └── GENERAL_PROMPT → return
 *   │
 *   ├── 3. Fallback lokal (jika AI gagal)
 *   │
 *   └── 4. Semantic Cache save
 * 
 * ── CARA PAKAI ───────────────────────────────────────────────
 * import { askAI, askAIStream, generateRingkasanNotulen } from '../utils/aiHelper'
 * 
 * // Non-streaming (seperti sebelumnya)
 * const { answer } = await askAI("Berapa total pengeluaran?")
 * 
 * // Streaming (baru!)
 * await askAIStream("Berapa total pengeluaran?", (token) => {
 *   updateUI(token)  // ← token by token!
 * })
 * 
 * // Generate notulen (multi-agent)
 * const notulen = await generateRingkasanNotulen("Rapat Mamin")
 */

// ═══════════════════════════════════════════════════════════════════════════
// 0. IMPORTS
// ═══════════════════════════════════════════════════════════════════════════

import aiConfig from './aiConfig'
import semanticCache from './semanticCache'
import { classifyIntent, executeQueryFromIntent } from './intentClassifier'

// ═══════════════════════════════════════════════════════════════════════════
// 1. EXPORT DARI INTENT CLASSIFIER — Backward compatibility
// ═══════════════════════════════════════════════════════════════════════════

// CONTEXT_MAP dan DEFAULT_CONTEXT — untuk backward compatibility
export { CONTEXT_MAP, DEFAULT_CONTEXT } from '../data/contextMap'
import { CONTEXT_MAP as _CONTEXT_MAP, DEFAULT_CONTEXT as _DEFAULT_CONTEXT } from '../data/contextMap'

/**
 * Detect context berdasarkan pathname — backward compatible
 */
export function detectContext(pathname) {
  const cleanPath = pathname.replace('/dashboard/', '').replace('/dashboard', '') || 'dashboard'
  for (const [key, ctx] of Object.entries(_CONTEXT_MAP)) {
    if (cleanPath === key || cleanPath.startsWith(key)) return { key, ...ctx }
  }
  return { key: 'default', ..._DEFAULT_CONTEXT }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. API CALLER — Modular multi-provider dengan timeout + retry
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Panggil provider AI dengan timeout + retry + exponential backoff.
 * 
 * @param {object} provider — Provider config dari aiConfig
 * @param {array} messages — Array of { role, content }
 * @param {object} options — { stream, maxTokens, temperature }
 * @returns {Promise<string|Response>}
 */async function callProvider(provider, messages, options = {}) {
  // ═══════════════════════════════════════════════════════════
  // 🏆 PUTER.JS PATH — Prioritas tertinggi!
  //    Gratis, tanpa API key, tanpa proxy, tanpa CORS.
  //    Sempurna untuk prototype Vercel.
  // ═══════════════════════════════════════════════════════════
  if (provider.name === 'Puter') {
    return callPuterProvider(messages, options)
  }

  const {
    stream = false,
    maxTokens = aiConfig.settings.maxOutputTokens,
    temperature = aiConfig.settings.temperature,
    timeout = aiConfig.settings.timeout.defaultMs,
    signal: externalSignal, // ← external abort signal (from cancel button)
  } = options

  // Gabungkan timeout controller + external signal
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  // Forward external abort (e.g., cancel button) ke controller
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort()
      clearTimeout(timeoutId)
    }, { once: true })
  }

  // Tentukan URL: proxy (dev) atau direct API (production/Vercel)
  const url = aiConfig.getProviderUrl(provider)
  const headers = aiConfig.getProviderHeaders(provider)

  const payload = {
    model: provider.model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream,
  }

  // Gemini API punya format request berbeda (contents bukan messages)
  const body = provider.useApiKeyParam
    ? JSON.stringify({
        contents: messages.map(m => ({
          // Gemini hanya support 'user' dan 'model' — system di-convert ke user
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature,
        },
      })
    : JSON.stringify(payload)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`)
    }

    // Kalau streaming, return response untuk dibaca oleh caller
    if (stream) return res

    return await res.json()
  } catch (err) {
    clearTimeout(timeoutId)
    throw err
  }
}

// ═══════════════════════════════════════════════════════════
// PUTER.JS — Provider khusus yang pake SDK, bukan HTTP fetch
// ═══════════════════════════════════════════════════════════

let _puterModule = null

async function _getPuter() {
  if (!_puterModule) {
    _puterModule = await import('@heyputer/puter.js')
  }
  return _puterModule.default
}

/**
 * Panggil AI via Puter.js SDK.
 * Keuntungan: gratis, tanpa API key, tanpa proxy, tanpa CORS.
 * 
 * @param {array} messages — Array of { role, content }
 * @param {object} options — { maxTokens, temperature }
 * @returns {Promise<object>} — OpenAI-compatible response { choices: [{ message: { content } }] }
 */
async function callPuterProvider(messages, options = {}) {
  const {
    maxTokens = aiConfig.settings.maxOutputTokens,
    temperature = aiConfig.settings.temperature,
  } = options

  try {
    const puter = await _getPuter()

    // Gabung semua messages jadi satu prompt
    // System prompt + user question digabung
    const prompt = messages
      .map(m => m.content)
      .filter(Boolean)
      .join('\n\n')

    // ── PANGGIL PUTER AI ──
    // Response format: { message: { content: "jawaban..." }, ... }
    // BUKAN string langsung!
    const response = await puter.ai.chat(prompt, {
      model: 'gpt-4o-mini',
      maxTokens,
      temperature,
    })

    // ── EKSTRAK CONTENT ──
    // Puter.js SDK return ChatResponse: { message: { content } }
    // Tapi kadang juga return plain string (tergantung versi SDK).
    const content =
      response?.message?.content ||               // { message: { content: "..." } }
      (typeof response === 'string' ? response : '')  // string langsung

    if (!content) {
      console.warn('Puter.js response tidak dikenali:', response)
      throw new Error('Puter.js: Response kosong atau format tidak dikenal')
    }

    // Bungkus ke format OpenAI-compatible supaya callAI() bisa extract
    return {
      choices: [{
        message: { content },
      }],
    }
  } catch (err) {
    throw new Error(`Puter.js: ${err.message || 'Gagal memanggil AI'}`)
  }
}

/**
 * Panggil AI dengan retry + fallback antar provider.
 * 
 * @param {array} messages — Array of { role, content }
 * @param {object} options — { stream, maxTokens, temperature }
 * @returns {Promise<string>} — Response text
 */
async function callAI(messages, options = {}) {
  const providers = aiConfig.getActiveProviders()
  if (providers.length === 0) {
    throw new Error('Tidak ada provider AI yang aktif. Atur API Key di Pengaturan.')
  }

  let lastError = null

  for (const provider of providers) {
    for (let attempt = 0; attempt <= aiConfig.settings.retry.maxRetries; attempt++) {
      try {
        const data = await callProvider(provider, messages, options)
        
        if (options.stream) {
          return data // Return response untuk streaming
        }

        // Support OpenAI format (Groq/Cerebras) dan Gemini format
        const content = data?.choices?.[0]?.message?.content ||
                       data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                       data?.contents?.[0]?.parts?.[0]?.text || ''
        if (content) return content
        
        throw new Error('Response kosong dari provider')
      } catch (err) {
        lastError = err
        console.warn(`⚠️ ${provider.name} attempt ${attempt + 1} gagal:`, err.message)
        
        // Exponential backoff
        if (attempt < aiConfig.settings.retry.maxRetries) {
          const delay = aiConfig.settings.retry.baseDelayMs * Math.pow(2, attempt)
          await new Promise(r => setTimeout(r, delay))
        }
      }
    }
  }

  throw lastError || new Error('Semua provider AI gagal.')
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. STREAMING READER — Baca response streaming token by token
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Baca streaming response dan callback tiap token.
 * Support format SSE (Server-Sent Events) dari OpenAI-compatible API.
 * 
 * @param {Response} response — Fetch Response object
 * @param {function} onToken — Callback(token: string) → update UI
 * @param {function} onDone — Callback() → streaming selesai
 */
async function readStream(response, onToken, onDone) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let wasAborted = false

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Simpan partial line untuk next chunk

      for (const line of lines) {
        const trimmed = line.trim()
        
        // SSE format: "data: {...}"
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)
          
          // Selesai
          if (data === '[DONE]') {
            onDone?.()
            return
          }

          try {
            const parsed = JSON.parse(data)
            const content = parsed?.choices?.[0]?.delta?.content || 
                           parsed?.choices?.[0]?.text || ''
            if (content) {
              onToken(content)
            }
          } catch {
            // Bisa jadi token partial yang belum complete JSON-nya
            if (data.trim()) {
              onToken(data)
            }
          }
        }
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      wasAborted = true
    } else {
      throw err
    }
  } finally {
    reader.releaseLock()
    // Jangan panggil onDone jika di-abort — biarkan caller handle
    if (!wasAborted) {
      onDone?.()
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. FORMAT RESPONSE — Bersihkan response AI
// ═══════════════════════════════════════════════════════════════════════════

function formatAnswer(text) {
  if (!text) return 'Maaf, tidak bisa menjawab.'
  return text.trim().replace(/^(Asisten|AI|:)+\s*/i, '')
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. FALLBACK LOKAL — Jawab dari data tanpa AI (0 token)
// ═══════════════════════════════════════════════════════════════════════════

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const PREFIX = 'spj_'

function storageGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

/**
 * Jawab pertanyaan langsung dari data — tanpa AI (0 token, 100% akurat).
 * Hanya untuk pertanyaan sederhana seperti "total pengeluaran bulan x".
 */
function fallbackLocalAnswer(question) {
  const q = question.toLowerCase()
  const data = storageGet('bku_data')
  const txs = data?.transactions
  if (!txs?.length) return null

  // Deteksi bulan
  let bulanNum = null
  for (let i = 0; i < BULAN_NAMES.length; i++) {
    if (q.includes(BULAN_NAMES[i].toLowerCase())) { bulanNum = i + 1; break }
  }

  // Filter by bulan
  const filtered = txs.filter(tx => {
    if (bulanNum && tx.bulan !== bulanNum) return false
    return true
  })

  if (filtered.length === 0) {
    if (bulanNum) return `Data transaksi untuk bulan ${BULAN_NAMES[bulanNum - 1]} tidak ditemukan.`
    return null
  }

  // Jawab berdasarkan keyword
  if (q.includes('pengeluaran') || q.includes('belanja') || q.includes('pembayaran')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    const txOut = filtered.filter(t => Number(t.pengeluaran) > 0)
    const total = txOut.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
    return `Total pengeluaran ${bulanLabel}: Rp ${total.toLocaleString('id-ID')} (${txOut.length} transaksi).`
  }

  if (q.includes('penerimaan') || q.includes('pemasukan')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    const total = filtered.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
    return `Total penerimaan ${bulanLabel}: Rp ${total.toLocaleString('id-ID')}.`
  }

  if (q.includes('pajak') || q.includes('pph')) {
    const pajakTx = filtered.filter(t => {
      const u = (t.uraian || '').toLowerCase()
      return (u.includes('setor pph') || u.includes('setor pajak') || 
              u.includes('pph 23') || u.includes('pajak')) &&
             t.pengeluaran > 0
    })
    if (pajakTx.length > 0) {
      const total = pajakTx.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
      const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
      return `Total pajak ${bulanLabel}: Rp ${total.toLocaleString('id-ID')} (${pajakTx.length} transaksi).`
    }
    return bulanNum 
      ? `Tidak ada pembayaran pajak di bulan ${BULAN_NAMES[bulanNum - 1]}.`
      : 'Tidak ada pembayaran pajak.'
  }

  if (q.includes('total') || q.includes('semua')) {
    const bulanLabel = bulanNum ? BULAN_NAMES[bulanNum - 1] : 'semua bulan'
    const totalPenerimaan = filtered.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
    const totalPengeluaran = filtered.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
    return `Ringkasan ${bulanLabel}: Penerimaan Rp ${totalPenerimaan.toLocaleString('id-ID')}, Pengeluaran Rp ${totalPengeluaran.toLocaleString('id-ID')}, ${filtered.length} transaksi.`
  }

  return null // tidak bisa jawab lokal, perlu AI
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. MAIN — askAI() (Non-Streaming)
// ═══════════════════════════════════════════════════════════════════════════
//
// DUAL-PATH FLOW:
//   1. Cek semantic cache → hit? return langsung (0 token!)
//   2. Intent classifier → AI decide: query engine or chat?
//   3a. Path A (Query): executeQuery → format → AI natural language
//   3b. Path B (Chat): AI langsung jawab dengan GENERAL_PROMPT
//   4. Fallback lokal (jika AI gagal)
//   5. Simpan ke semantic cache
// ═══════════════════════════════════════════════════════════════════════════

export async function askAI(question) {
  if (!question?.trim()) {
    return { answer: 'Silakan ketik pertanyaan Anda.' }
  }

  question = question.trim()
  console.log('🤖 askAI:', question)

  // ── 1. CEK SEMANTIC CACHE DULU ──
  const cached = semanticCache.get(question)
  if (cached) {
    console.log('⚡ Cache hit!');
    return { answer: cached, source: 'cache' }
  }

  // ── 2. INTENT CLASSIFIER ──
  const intent = await classifyIntent(question)
  console.log('🎯 Intent:', intent.type, `(confidence: ${intent.confidence})`)

  // ── 3A. PATH A: QUERY ENGINE ──
  if (intent.type === 'query' && intent.query) {
    console.log('📊 Path A: QueryEngine')
    
    // Eksekusi query (100% akurat, 0 token hallucination)
    const queryResult = executeQueryFromIntent(intent.query)
    
    if (queryResult.formatted && queryResult.formatted !== 'Query tidak lengkap.') {
      // Kirim hasil query ke AI untuk natural language formatting
      const msgs = [
        { role: 'system', content: aiConfig.getPrompt('systemQuery') },
        {
          role: 'user',
          content: `${queryResult.formatted}\n\nPertanyaan: ${question}\n\nJawab berdasarkan data di atas. Ringkas (maks 3 kalimat).`,
        },
      ]

      try {
        const answer = await callAI(msgs, { maxTokens: 300 })
        if (answer) {
          const formatted = formatAnswer(answer)
          semanticCache.set(question, formatted, 'query-engine')
          return { answer: formatted, source: 'query-engine' }
        }
      } catch (err) {
        console.warn('AI formatting gagal, fallback ke raw query result:', err.message)
        // Fallback: langsung return hasil query (tanpa AI — lebih akurat!)
        return { answer: queryResult.formatted, source: 'query-engine-raw' }
      }
    }
  }

  // ── 3B. PATH B: AI CHAT ──
  // Untuk query yang tidak bisa di-handle QueryEngine
  // atau untuk pertanyaan umum
  if (intent.type === 'chat' || intent.type === 'general') {
    console.log('💬 Path B: AI Chat')

    // Kirim ke AI
    try {
      const msgs = [
        { role: 'system', content: aiConfig.getPrompt('general') },
        { role: 'user', content: question },
      ]
      const answer = await callAI(msgs)
      if (answer) {
        const formatted = formatAnswer(answer)
        semanticCache.set(question, formatted, 'ai')
        return { answer: formatted, source: 'ai' }
      }
    } catch (err) {
      console.error('AI gagal:', err.message)
      // Fallback: coba lokal
      const localAnswer = fallbackLocalAnswer(question)
      if (localAnswer) {
        semanticCache.set(question, localAnswer, 'fallback')
        return { answer: localAnswer, source: 'fallback' }
      }
      return { answer: `❌ Gagal: ${err.message || 'Coba lagi.'}`, source: 'error' }
    }
  }

  // ── FALLBACK AKHIR ──
  const localAnswer = fallbackLocalAnswer(question)
  if (localAnswer) {
    semanticCache.set(question, localAnswer, 'fallback')
    return { answer: localAnswer, source: 'fallback' }
  }

  return { answer: 'Maaf, belum bisa menjawab pertanyaan ini.', source: 'unknown' }
}

// ═══════════════════════════════════════════════════════════════════════════
// 7. MAIN — askAIStream() (Streaming Version)
// ═══════════════════════════════════════════════════════════════════════════
//
// Sama seperti askAI(), tapi response di-stream token by token.
// 
// @param {string} question — Pertanyaan user
// @param {function} onToken — Callback(token: string) → update UI real-time
// @param {function} onDone — Callback(fullAnswer: string) → streaming selesai
// @returns {Promise<void>}
// ═══════════════════════════════════════════════════════════════════════════

export async function askAIStream(question, onToken, onDone, options = {}) {
  const { signal } = options
  
  if (!question?.trim()) {
    onToken?.('Silakan ketik pertanyaan Anda.')
    onDone?.('Silakan ketik pertanyaan Anda.')
    return
  }

  question = question.trim()
  let fullAnswer = ''

  // ── 1. CEK CACHE ──
  if (!signal?.aborted) {
    const cached = semanticCache.get(question)
    if (cached) {
      const chars = cached.split('')
      for (let i = 0; i < chars.length; i++) {
        if (signal?.aborted) return
        onToken?.(chars[i])
        await new Promise(r => setTimeout(r, 10))
      }
      onDone?.(cached)
      return
    }
  }

  // ── 2. INTENT + EKSEKUSI ──
  if (signal?.aborted) return
  
  // OPTIMASI: Untuk query sederhana (keyword match), langsung pakai QueryEngine
  // tanpa AI intent classification — lebih cepat!
  const q = question.toLowerCase()
  const isSimpleQuery = ['pengeluaran', 'penerimaan', 'pajak', 'total '].some(k => q.includes(k))
  
  if (isSimpleQuery) {
    // Path A langsung: fallback lokal (0 AI call, 0 token, instant!)
    const localAnswer = fallbackLocalAnswer(question)
    if (localAnswer) {
      const chars = localAnswer.split('')
      for (let i = 0; i < chars.length; i++) {
        if (signal?.aborted) return
        onToken?.(chars[i])
      }
      semanticCache.set(question, localAnswer, 'fallback')
      onDone?.(localAnswer)
      return
    }
  }

  // ── 3. INTENT CLASSIFIER ──
  if (signal?.aborted) return
  const intent = await classifyIntent(question)

  if (intent.type === 'query' && intent.query) {
    // Path A: QueryEngine
    if (signal?.aborted) return
    const queryResult = executeQueryFromIntent(intent.query)
    
    if (queryResult.formatted && queryResult.formatted !== 'Query tidak lengkap.') {
      const chars = queryResult.formatted.split('')
      for (let i = 0; i < chars.length; i++) {
        if (signal?.aborted) return
        onToken?.(chars[i])
      }
      fullAnswer = queryResult.formatted
    }
  } else {
    // Path B: AI Chat dengan streaming
    if (signal?.aborted) return
    try {
      const provider = aiConfig.getActiveProvider()
      if (!provider?.supportsStreaming || signal) {
        // Fallback ke non-streaming dengan AbortSignal
        const controller = new AbortController()
        signal?.addEventListener('abort', () => controller.abort())
        
        const msgs = [
          { role: 'system', content: aiConfig.getPrompt('general') },
          { role: 'user', content: question },
        ]
        const data = await callProvider(provider, msgs, { signal: controller.signal })
        const answer = data?.choices?.[0]?.message?.content ||
                       data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
        
        const chars = answer.split('')
        for (let i = 0; i < chars.length; i++) {
          if (signal?.aborted) return
          onToken?.(chars[i])
        }
        fullAnswer = answer
        semanticCache.set(question, answer, 'ai')
        onDone?.(answer)
        return
      }

      // Streaming beneran dengan AbortSignal
      const msgs = [
        { role: 'system', content: aiConfig.getPrompt('general') },
        { role: 'user', content: question },
      ]

      const response = await callProvider(provider, msgs, {
        stream: true,
        maxTokens: aiConfig.settings.maxOutputTokens,
        timeout: aiConfig.settings.timeout.streamingMs,
        signal,
      })

      if (signal?.aborted) return

      await readStream(
        response,
        (token) => {
          fullAnswer += token
          onToken?.(token)
        },
        () => {
          const formatted = formatAnswer(fullAnswer)
          semanticCache.set(question, formatted, 'ai-stream')
          onDone?.(formatted)
        }
      )
      return
    } catch (err) {
      if (err.name === 'AbortError') {
        onDone?.(fullAnswer || '⏹️ Dibatalkan.')
        return
      }
      console.error('Streaming gagal:', err.message)
      if (signal?.aborted) return
      const { answer } = await askAI(question)
      const chars = answer.split('')
      for (let i = 0; i < chars.length; i++) {
        if (signal?.aborted) return
        onToken?.(chars[i])
      }
      fullAnswer = answer
    }
  }

  // ── SIMPAN KE CACHE ──
  if (fullAnswer && !signal?.aborted) {
    semanticCache.set(question, fullAnswer, 'stream')
  }
  
  if (!signal?.aborted) {
    onDone?.(formatAnswer(fullAnswer))
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 8. GENERATE RINGKASAN NOTULEN — Multi-Agent
// ═══════════════════════════════════════════════════════════════════════════
//
// MULTI-AGENT PATTERN:
//   Agent 1: Context Extractor → extract structured info dari nama kegiatan
//   Agent 2: Notulen Generator → generate notulen dengan context
//
// Lebih akurat daripada 1 prompt karena Agent 1 kasih structured context.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate ringkasan notulen rapat — Multi-Agent.
 * 
 * @param {string} acara — Nama kegiatan/acara
 * @param {object} options — { useMultiAgent, maxPoin }
 * @returns {Promise<string|null>}
 */
export async function generateRingkasanNotulen(acara, options = {}) {
  if (!acara?.trim()) return null

  const useMultiAgent = options.useMultiAgent ?? aiConfig.settings.notulen.useMultiAgent
  const maxPoin = options.maxPoin ?? aiConfig.settings.notulen.maxPoin

  try {
    if (useMultiAgent) {
      // ── AGENT 1: Context Extractor ──
      const contextPrompt = `Extract structured context for a meeting about "${acara}". 
Return ONLY a JSON object with fields: tanggal, tempat, tujuan, estimatedPeserta.
Example: {"tanggal": "Senin, 15 Januari 2026", "tempat": "Ruang Guru SD Negeri", "tujuan": "Membahas...", "estimatedPeserta": 10}`

      const contextRaw = await callAI([
        { role: 'system', content: 'You extract structured data from text. Output ONLY valid JSON, no other text.' },
        { role: 'user', content: contextPrompt },
      ], { maxTokens: 200, temperature: 0.1 })

      let context = {}
      try {
        const jsonMatch = contextRaw.match(/\{[\s\S]*\}/)
        if (jsonMatch) context = JSON.parse(jsonMatch[0])
      } catch { /* ignore parse errors */ }

      // ── AGENT 2: Notulen Generator ──
      const notulenPrompt = acara + (Object.keys(context).length > 0 
        ? `\n\nContext kegiatan:\n${JSON.stringify(context, null, 2)}`
        : '')

      const msgs = [
        { role: 'system', content: aiConfig.getPrompt('notulen') },
        { role: 'user', content: `Nama kegiatan: "${notulenPrompt}"\n\nBuat ringkasan notulen rapat. Maksimal ${maxPoin} poin.` },
      ]

      const raw = await callAI(msgs, { maxTokens: 500 })
      if (!raw) return null
      return formatAnswer(raw)
    }

    // ── SINGLE AGENT (old method) ──
    const msgs = [
      { role: 'system', content: aiConfig.getPrompt('notulen') },
      { role: 'user', content: `Nama kegiatan: "${acara}"\n\nBuat ringkasan notulen rapat.` },
    ]
    const raw = await callAI(msgs, { maxTokens: 500 })
    if (!raw) return null
    return formatAnswer(raw)
  } catch (err) {
    console.warn('Gagal generate notulen:', err.message)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 9. CACHE MANAGEMENT — Untuk admin panel / settings
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hapus semantic cache — panggil setelah data BKU diupdate.
 */
export function clearCache() {
  semanticCache.clear()
}

/**
 * Dapatkan statistik cache.
 */
export function getCacheStats() {
  return semanticCache.getStats()
}

/**
 * Dapatkan daftar provider aktif.
 */
export function getActiveProviders() {
  return aiConfig.getActiveProviders()
}

// ═══════════════════════════════════════════════════════════════════════════
// 10. EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  askAI,
  askAIStream,
  detectContext,
  generateRingkasanNotulen,
  clearCache,
  getCacheStats,
  getActiveProviders,
}
