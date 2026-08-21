/**
 * intentClassifier.js — Klasifikasi Intent untuk Dual-Path AI
 * 
 * ── KONSEP DUAL-PATH ─────────────────────────────────────────
 * 
 *   User Question
 *        │
 *        ▼
 *   ┌──────────────────┐
 *   │ IntentClassifier │ ← AI MEMUTUSKAN path (bukan kode!)
 *   └────────┬─────────┘
 *            │
 *      ┌─────┴─────┐
 *      │           │
 *      ▼           ▼
 *  Path A:     Path B:
 *  QueryEngine AI Chat
 *  (0 token,  (fleksibel,
 *   100%       untuk umum)
 *   akurat)
 * 
 * ── MENGAPA AI YANG MEMUTUSKAN? ──────────────────────────────
 * Pendekatan lama: keyword detection di kode → rawan false positive
 *   "Cara urus pajak PPh23" → terdeteksi keyword "pajak" → kirim data BKU
 *   
 * Pendekatan baru: AI klasifikasi intent → lebih akurat
 *   "Cara urus pajak PPh23" → classified sebagai "chat" → tidak kirim data
 * 
 * ── FALLBACK ─────────────────────────────────────────────────
 * Jika AI classifier gagal (error/timeout), fallback ke keyword detection
 * seperti pendekatan lama — jadi TIDAK PERNAH error total.
 * 
 * ── MODULAR ──────────────────────────────────────────────────
 * Mau ganti metode klasifikasi? Cukup ganti _classifyWithAI()
 *   - Sekarang: panggil AI dengan intent prompt
 *   - Nanti: bisa pakai model kecil (Transformers.js) di browser
 *   - Atau: bisa pakai rules-based sederhana
 *   - Atau: bisa hybrid (AI + rules)
 */

import aiConfig from './aiConfig'
import { executeQuery } from './queryEngine'
import semanticCache from './semanticCache'
import storageHelper from './storageHelper'

// ═══════════════════════════════════════════════════════════════════════════
// 1. FALLBACK: Rule-Based Classification (0 token, instant)
//    Dipakai jika AI classifier gagal atau tidak ada provider aktif
// ═══════════════════════════════════════════════════════════════════════════

const QUERY_KEYWORDS = {
  bku_data: [
    'pengeluaran', 'penerimaan', 'pajak', 'pph', 'transaksi', 'bku',
    'belanja', 'pembayaran', 'pemasukan', 'saldo', 'anggaran',
    'realisasi', 'keuangan', 'dana', 'bos', 'bosp', 'honor',
    'transport', 'mamin', 'atk', 'cetak', 'listrik',
  ],
  data_guru: [
    'guru', 'honorer', 'ptk', 'pegawai',
  ],
  data_tendik: [
    'tendik',
  ],
  data_sekolah: [
    'sekolah', 'kepsek', 'kepala sekolah', 'bendahara', 'npsn',
    'alamat', 'profil',
  ],
}

const MONTH_NAMES = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember',
]

/**
 * Pola pertanyaan umum/kapabilitas — DETECTED FIRST, sebelum keyword BKU.
 * Jika cocok → classified sebagai 'chat', bukan 'query'.
 * 
 * PENTING: Pola ini HARUS lebih spesifik agar tidak menangkap pertanyaan data BKU.
 * Contoh: "apa itu BKU" → chat, tapi "apa total BKU" → query
 */
const GENERAL_QUESTION_PATTERNS = [
  /^apakah\s+(kamu|anda|kak|bang)\s+(bisa|dapat|mau)/i,  // "apakah kamu bisa..." (WAJIB ada "bisa/dapat/mau")
  /^(bisakah|dapatkah|bisa\s+tidak)\s+(kamu|anda)/i,     // "bisakah kamu..."
  /^bagaimana\s+(cara|proses|langkah)/i,                 // "bagaimana cara..."
  /^apa\s+(itu|yang\s+dimaksud)\s+(bku|bos|bsp|arkas|siplah|lpj|spj)/i, // "apa itu BKU/BOSP/ARKAS/SIPLAH/LPJ/SPJ"
  /^(halo|hai|helo|hey|pagi|siang|sore|malam)/i,         // sapaan
  /^(terima\s+kasih|makasih|thanks|thx)/i,               // ucapan terima kasih
  /^bagaimana\s+kondisi/i,                                // "bagaimana kondisi keuangan"
  /^(ceritakan|jelaskan|explain)\s+(tentang|soal)/i,     // "ceritakan tentang BKU"
]

/**
 * Deteksi apakah pertanyaan adalah general/capability question.
 * Jika ya → return 'chat'. Jika tidak → return null (lanjut ke rules).
 * 
 * PENTING: Fungsi ini harus SANGAT selektif agar pertanyaan data BKU
 * tidak salah diklasifikasikan sebagai 'chat'.
 */
function _detectGeneralQuestion(q) {
  for (const pattern of GENERAL_QUESTION_PATTERNS) {
    if (pattern.test(q)) return true
  }
  
  // Deteksi pertanyaan sangat pendek (1-3 kata) yang mengandung keyword BKU tapi bukan query
  // Contoh: "baca bku", "bku", "lihat bku", "data bku"
  const shortQWords = q.toLowerCase().trim().split(/\s+/).length
  if (shortQWords <= 3) {
    const vaguePatterns = [
      /^(baca|lihat|tampilkan|buka|isi)\s+(bku|data)/i,
      /^(bku|data)\s*(saya|ku)?$/i,
    ]
    for (const pattern of vaguePatterns) {
      if (pattern.test(q.trim())) return true
    }
  }
  
  return false
}

/**
 * Fallback klasifikasi berbasis keyword (0 token)
 */
function _classifyWithRules(question) {
  const q = question.toLowerCase().trim()
  
  // ═══ PRIORITAS #1: Cek general/capability question ═══
  // Jika user bertanya "apakah kamu bisa baca data bku?", 
  // ini HARUS 'chat', bukan 'query'!
  if (_detectGeneralQuestion(q)) {
    return {
      type: 'chat',
      confidence: 0.8,
      query: null,
      fallbackReason: 'general_question_detected',
    }
  }
  
  // ═══ PRIORITAS #1.5: Deteksi pertanyaan BKU spesifik ═══
  // Pola: "apa/saya/berapa + keyword BKU + action word"
  // Contoh: "apa total pengeluaran", "berapa honor guru", "saya mau lihat bku"
  const bkuQueryPatterns = [
    /total\s+(pengeluaran|penerimaan|belanja|bayar|saldo)/i,
    /(berapa|jumlah)\s+(pengeluaran|penerimaan|belanja|bayar|pajak|pph|honor|mamin|atk|listrik|transport|guru|tendik)/i,
    /(pengeluaran|penerimaan|belanja|bayar)\s+(bulan|perbulan|per\s+bulan)/i,
    /(pengeluaran|penerimaan|belanja|bayar)\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)/i,
    /(honor|mamin|atk|listrik|transport|cetak|perpus|internet|pulsa)\s+(berapa|total|jumlah)/i,
    /(apa|sebutkan|tampilkan|lihat)\s+(data\s+)?(bku|transaksi|keuangan|realisasi)/i,
    /(realisasi|anggaran|sisa\s+dana|sisa\s+anggaran)/i,
  ]
  
  for (const pattern of bkuQueryPatterns) {
    if (pattern.test(q)) {
      return {
        type: 'chat',  // Kirim ke AI Chat dengan data context (lebih fleksibel)
        confidence: 0.85,
        query: null,
        fallbackReason: 'bku_specific_question_detected',
      }
    }
  }
  
  // Deteksi sumber data
  let source = null
  let maxMatches = 0
  
  for (const [src, keywords] of Object.entries(QUERY_KEYWORDS)) {
    const matches = keywords.filter(k => q.includes(k)).length
    if (matches > maxMatches) {
      maxMatches = matches
      source = src
    }
  }

  if (!source) {
    return {
      type: 'general',
      confidence: 0.5,
      query: null,
      fallbackReason: 'no_keyword_match',
    }
  }

  // Deteksi bulan
  let bulan = null
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (q.includes(MONTH_NAMES[i])) {
      bulan = i + 1
      break
    }
  }

  // Build query
  const query = { source }
  
  if (source === 'bku_data') {
    query.filter = {}
    if (bulan) query.filter.bulan = [bulan]
    
    // Deteksi tipe agregasi — LEBIH AGRESIF untuk menangkap pertanyaan BKU
    if (q.includes('pengeluaran') || q.includes('belanja') || q.includes('pembayaran') || q.includes('bayar')) {
      // JANGAN filter tipe PEMBAYARAN saja! Hitung semua pengeluaran > 0
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('penerimaan') || q.includes('pemasukan')) {
      query.aggregate = { sum: 'penerimaan' }
    } else if (q.includes('pajak') || q.includes('pph')) {
      query.search = 'setor pph'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('honor') || q.includes('guru')) {
      query.search = 'honor'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('mamin') || q.includes('makan')) {
      query.search = 'makan'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('atk') || q.includes('alat tulis')) {
      query.search = 'atk'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('listrik')) {
      query.search = 'listrik'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('transport') || q.includes('perjalanan')) {
      query.search = 'transport'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('cetak') || q.includes('penggandaan')) {
      query.search = 'cetak'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('internet') || q.includes('pulsa')) {
      query.search = 'internet'
      query.aggregate = { sum: 'pengeluaran' }
    } else if (q.includes('total') || q.includes('jumlah') || q.includes('berapa') || q.includes('saldo')) {
      query.aggregate = { sum: 'pengeluaran' }
    } else {
      // Keyword BKU ada tapi tanpa intent query spesifik → treat sebagai chat
      return {
        type: 'chat',
        confidence: 0.6,
        query: null,
        fallbackReason: 'vague_query_without_specific_intent',
      }
    }
  }

  return {
    type: 'query',
    confidence: 0.7,
    query,
    fallbackReason: 'rules_match',
  }
}

/**
 * Klasifikasi dengan AI (lebih akurat)
 * Support semua provider termasuk Puter.js!
 */
async function _classifyWithAI(question) {
  const provider = aiConfig.getActiveProvider()
  if (!provider) return null

  const intentPrompt = aiConfig.getPrompt('intentClassifier')

  try {
    // ═══ PUTER.JS PATH ═══
    // Puter.js pakai SDK sendiri, bukan HTTP fetch biasa.
    // Gunakan puter.ai.chat() langsung untuk klasifikasi intent.
    if (provider.name === 'Puter') {
      const puterModule = await import('@heyputer/puter.js')
      const puter = puterModule.default
      
      const prompt = `${intentPrompt}\n\nUser: ${question}`
      const response = await puter.ai.chat(prompt, {
        model: 'gpt-4o',
        maxTokens: 200,
        temperature: 0.1,
      })
      
      const text = response?.message?.content ||
                   response?.choices?.[0]?.message?.content ||
                   (typeof response === 'string' ? response : '')
      if (!text) return null
      
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return null
      
      const intent = JSON.parse(jsonMatch[0])
      if (!intent.type || !['query', 'chat', 'general'].includes(intent.type)) return null
      
      return {
        type: intent.type,
        confidence: intent.confidence || 0.5,
        query: intent.type === 'query' ? intent.query : null,
        fallbackReason: null,
      }
    }

    // ═══ FETCH-BASED PROVIDERS (Groq, Cerebras, Gemini) ═══
    const url = aiConfig.getProviderUrl(provider)
    if (!url) return null
    
    const headers = aiConfig.getProviderHeaders(provider)

    let body
    if (provider.useApiKeyParam) {
      // Gemini format
      body = JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${intentPrompt}\n\nUser: ${question}` }] },
        ],
        generationConfig: { maxOutputTokens: 300, temperature: 0.1 },
      })
    } else {
      // OpenAI format (Groq/Cerebras)
      body = JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: intentPrompt },
          { role: 'user', content: question },
        ],
        max_tokens: 300,
        temperature: 0.1,
      })
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })

    if (!res.ok) return null

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content ||
                 data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                 data?.contents?.[0]?.parts?.[0]?.text || ''
    
    if (!text) return null
    
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null
    
    const intent = JSON.parse(jsonMatch[0])
    if (!intent.type || !['query', 'chat', 'general'].includes(intent.type)) return null

    return {
      type: intent.type,
      confidence: intent.confidence || 0.5,
      query: intent.type === 'query' ? intent.query : null,
      fallbackReason: null,
    }
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. MAIN CLASSIFIER — Dual-Path Entry Point
// ═══════════════════════════════════════════════════════════════════════════

/**
 * ═══ PRE-CLASSIFY ═══
 * Deteksi cepat untuk pola yang HARUS 'chat', SEBELUM AI classification.
 * Ini mencegah AI (termasuk Puter.js GPT-4o) salah klasifikasi untuk:
 *   - "baca BKU saya" → AI kira query, padahal chat
 *   - "apakah kamu bisa..." → AI bisa classify sebagai query karena ada keyword
 * 
 * PENTING: Fungsi ini harus SANGAT selektif agar pertanyaan data BKU
 * tidak salah diklasifikasikan sebagai 'chat'.
 * 
 * Jika match → return langsung (tanpa AI, tanpa rules).
 * Jika tidak match → return null (lanjut ke AI + rules).
 */
function _preClassify(question) {
  const q = question.toLowerCase().trim()
  
  // ── Pola kapabilitas — HARUS ada "bisa/dapat/mau" ──
  // "apakah kamu bisa baca BKU" → chat
  // "apa total pengeluaran" → JANGAN chat!
  const capabilityPatterns = [
    /^apakah\s+(kamu|anda|kak|bang)\s+(bisa|dapat|mau)/i,
    /^(bisakah|dapatkah|bisa\s+tidak)\s+(kamu|anda)/i,
    /^bagaimana\s+(cara|proses|langkah)/i,
    /^apa\s+(itu|yang\s+dimaksud)\s+(bku|bos|bsp|arkas|siplah|lpj|spj)/i,
    /^(halo|hai|helo|hey|pagi|siang|sore|malam)/i,
    /^(terima\s+kasih|makasih|thanks|thx)/i,
  ]
  for (const p of capabilityPatterns) {
    if (p.test(q)) {
      return { type: 'chat', confidence: 0.9, query: null, source: 'pre_classify_capability' }
    }
  }
  
  // ── Pola vague pendek (≤3 kata) dengan keyword BKU ──
  // "baca bku", "baca bku saya", "lihat bku", "data bku", "bku"
  const wordCount = q.split(/\s+/).length
  if (wordCount <= 3) {
    const vaguePatterns = [
      /^(baca|lihat|tampilkan|buka|isi)\s+(bku|data)/i,   // "baca bku", "lihat data"
      /^(bku|data)\s*(saya|ku)?$/i,                       // "bku", "bku saya"
    ]
    for (const p of vaguePatterns) {
      if (p.test(q)) {
        return { type: 'chat', confidence: 0.85, query: null, source: 'pre_classify_vague' }
      }
    }
  }
  
  return null
}

/**
 * Klasifikasi intent pertanyaan user.
 * 
 * Priority:
 * 0. Pre-classify → vague/capability question detected → DIRECT chat (tanpa AI!)
 * 1. Semantic cache → jika ada dan match, return langsung
 * 2. AI classifier → lebih akurat
 * 3. Rule-based fallback → 0 token, instant
 * 
 * @param {string} question — Pertanyaan user
 * @returns {Promise<object>} { type, confidence, query, answer (cached) }
 */
export async function classifyIntent(question) {
  if (!question?.trim()) {
    return { type: 'general', confidence: 0, query: null, answer: null }
  }

  // ═══ PRIORITAS #0: Pre-classify ═══
  // Sebelum cache, sebelum AI, sebelum rules.
  // Tangkap pertanyaan vague/kapabilitas yang PASTI bukan query.
  const preResult = _preClassify(question)
  if (preResult) {
    return { ...preResult, answer: null }
  }

  // 1. Cek semantic cache DULU (0 token, instant)
  const cached = semanticCache.get(question)
  if (cached) {
    return {
      type: 'cached',
      confidence: 1.0,
      query: null,
      answer: cached,
      source: 'cache',
    }
  }

  // 2. Coba AI classifier
  try {
    const aiResult = await _classifyWithAI(question)
    if (aiResult && aiResult.confidence >= aiConfig.settings.intent.minConfidence) {
      return {
        ...aiResult,
        answer: null,
        source: 'ai_classifier',
      }
    }
  } catch (err) {
    console.warn('🤖 Intent classifier AI gagal, fallback ke rules:', err.message)
  }

  // 3. Fallback: rule-based (0 token, instant)
  const rulesResult = _classifyWithRules(question)
  return {
    ...rulesResult,
    answer: null,
    source: 'rules_fallback',
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. QUERY EXECUTOR — Eksekusi query + format hasil
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Eksekusi query dan format hasil untuk dikirim ke AI.
 * Ini adalah Program-of-Thoth: AI buat query → kode execute → hasil akurat.
 * 
 * @param {object} query — Query JSON dari intent classifier
 * @returns {object} { raw, formatted, source }
 */
export function executeQueryFromIntent(query) {
  if (!query || !query.source) {
    return {
      raw: null,
      formatted: 'Query tidak lengkap.',
      source: null,
    }
  }

  try {
    const result = executeQuery(query)
    
    // Tambah metadata untuk confidence
    return {
      ...result,
      isQueryEngineResult: true,
      confidence: 1.0, // QueryEngine = 100% akurat
    }
  } catch (err) {
    console.error('QueryEngine error:', err)
    return {
      raw: null,
      formatted: `Gagal memproses query: ${err.message}`,
      source: query.source,
      isQueryEngineResult: false,
      confidence: 0,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. DATA GATHERER — Kumpulkan data relevan untuk context AI
//    (Ini adalah collectRelevantData yang sudah dioptimasi)
// ═══════════════════════════════════════════════════════════════════════════

const PREFIX = 'spj_'

function storageGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const KATEGORI_REKENING = [
  { pattern: /^5\.1\.02\.02\.01\.0013$/, label: 'Honor Guru' },
  { pattern: /^5\.1\.02\.02\.01\.0061$/, label: 'Perpustakaan' },
  { pattern: /^5\.1\.02\.02\.01\.0063$/, label: 'Pulsa/Internet' },
  { pattern: /^5\.1\.02\.02/, label: 'Honor Lainnya' },
  { pattern: /^5\.1\.02\.04\.01\.0003$/, label: 'Transport Rapat' },
  { pattern: /^5\.1\.02\.04/, label: 'Transport Lainnya' },
  { pattern: /^5\.1\.02\.01\.01\.0052$/, label: 'Makan & Minum' },
  { pattern: /^5\.1\.02\.01\.01\.0024$/, label: 'ATK' },
  { pattern: /^5\.1\.02\.01\.01\.0025$/, label: 'Bahan Cetak' },
  { pattern: /^5\.2\.05\.01\.01\.0001$/, label: 'Listrik' },
]

function detectKategori(kodeRekening) {
  if (!kodeRekening) return null
  for (const m of KATEGORI_REKENING) {
    if (m.pattern.test(kodeRekening)) return m.label
  }
  return null
}

/**
 * Kumpulkan data relevan — versi yang sudah di-refactor.
 * Mirip dengan collectRelevantData() di aiHelper.js lama,
 * tapi dipisah ke file sendiri untuk modularitas.
 */
export function gatherRelevantData(source, query = {}) {
  switch (source) {
    case 'bku_data':
      return gatherBkuData(query)
    case 'data_guru':
      return gatherGuruData()
    case 'data_tendik':
      return gatherTendikData()
    case 'data_sekolah':
      return gatherSekolahData()
    default:
      return null
  }
}

function gatherBkuData(query = {}) {
  const data = storageGet('bku_data')
  if (!data?.transactions?.length) return null

  const txs = data.transactions
  const { bulan, tipe } = query.filter || {}
  
  let filtered = txs
  if (bulan?.length) filtered = filtered.filter(t => bulan.includes(t.bulan))
  if (tipe?.length) filtered = filtered.filter(t => tipe.includes(t.tipe))

  const lines = []
  
  // Ringkasan per kategori
  const byKategori = {}
  filtered.forEach(tx => {
    if (tx.tipe !== 'PEMBAYARAN' || !tx.pengeluaran) return
    const kat = detectKategori(tx.kodeRekening) || 'Lainnya'
    if (!byKategori[kat]) byKategori[kat] = { total: 0, count: 0 }
    byKategori[kat].total += Number(tx.pengeluaran)
    byKategori[kat].count++
  })

  lines.push(`Data BKU: ${filtered.length} transaksi`)
  
  if (Object.keys(byKategori).length > 0) {
    lines.push('Pengeluaran per kategori:')
    for (const [kat, info] of Object.entries(byKategori).sort()) {
      lines.push(`  - ${kat}: Rp ${info.total.toLocaleString('id-ID')} (${info.count} tx)`)
    }
  }

  return lines.join('\n')
}

function gatherGuruData() {
  const data = storageGet('data_guru')
  if (!data?.length) return null
  const honorer = data.filter(g => g.status?.toLowerCase().includes('honorer')).length
  return `Data Guru: ${data.length} orang (Honorer: ${honorer})`
}

function gatherTendikData() {
  const data = storageGet('data_tendik')
  if (!data?.length) return null
  return `Data Tendik: ${data.length} orang`
}

function gatherSekolahData() {
  const data = storageGet('data_sekolah')
  if (!data) return null
  const ks = data.pejabat?.ks?.nama || data.pejabat?.ks || '-'
  const bendahara = data.pejabat?.bendahara?.nama || data.pejabat?.bendahara || '-'
  return `Sekolah: ${data.nama || '-'} | NPSN: ${data.npsn || '-'} | Kepsek: ${ks} | Bendahara: ${bendahara}`
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default {
  classifyIntent,
  executeQueryFromIntent,
  gatherRelevantData,
}
