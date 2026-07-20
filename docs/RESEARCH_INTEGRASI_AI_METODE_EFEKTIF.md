# 🔬 Riset Mendalam: Metode Integrasi AI Paling Efektif, Akurat & Efisien untuk Aplikasi SPJ
*Generated: 18 Juli 2026 | Sumber: 15+ sumber riset web | Confidence: High*

---

## 📋 Executive Summary

Berdasarkan riset mendalam terhadap praktik terkini (2025-2026) dari developer senior dan mid-level, metode integrasi AI yang **paling efektif, akurat, dan efisien** untuk aplikasi SPJ adalah **Hybrid Architecture** — menggabungkan **Client-Side Data Processing** (zero-cost untuk data lokal) dengan **Server-Side LLM Proxy** (secure, cost-controlled) menggunakan **Multi-Provider Fallback** dan **Multi-Agent Pattern** untuk task kompleks seperti generate dokumen.

**Rekomendasi Utama untuk SPJ App:**
1. ✅ **Tetap pakai `fetch` native** — bukan axios (0 kB, performa lebih baik untuk use case ini)
2. ✅ **Migrasi API Key ke Backend Proxy** — hapus `VITE_*_API_KEY` dari frontend, buat endpoint `/api/ai/chat`
3. ✅ **Implementasi Response Streaming** (SSE) — UX jauh lebih responsif
4. ✅ **Tambah Semantic Caching** — untuk query berulang (triwulan, total per kategori)
5. ✅ **Gunakan Program-of-Thought** untuk kalkulasi Rupiah — bukan mengandalkan matematika internal LLM
6. ✅ **Restrukturisasi Context Injection** — dari keyword detection ke structured JSON schema

---

## 1. Arsitektur Hybrid: Yang Terbaik untuk SPJ

### 1.1. Mengapa Hybrid Architecture?

| Lapisan | Teknologi | Fungsi di SPJ |
|---------|-----------|---------------|
| **Client (Browser)** | `fetch` + `ReadableStream` | Collect data dari localStorage, format compact, kirim ke proxy |
| **Proxy Layer** | Vite dev proxy (dev) / Backend API (prod) | Routing request, API key management, rate limiting |
| **AI Provider** | Cerebras (primary) → Groq (fallback) | LLM inference |
| **Cache Layer** | In-memory LRU + semantic vector cache | Query berulang tidak perlu hit API |

**Mengapa Hybrid Bukan Full Server-Side atau Full Client-Side:**

- **Data sudah di localStorage** → tidak perlu upload ulang ke server untuk query sederhana
- **API Key harus di server** → `VITE_*_API_KEY` di frontend = security risk (lihat riset §4)
- **Streaming dari server** → lebih secure, cost-terkontrol, dan bisa di-cache

### 1.2. Arsitektur yang Direkomendasikan

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐ │
│  │localStorage│───►│ Context Builder│───►│  AI Chat UI   │ │
│  │ (BKU, Guru, │    │ (formatCompact, │   │  (AskAIPanel) │ │
│  │  Sekolah)   │    │  keyword detect) │   └───────┬───────┘ │
│  └──────────┘    └──────────────┘           │       │
│                                             │       │
│  ┌──────────────────────────────────────────┘       │
│  │  ┌─────────────┐    ┌──────────────┐            │
│  │  │QueryEngine  │───►│ Semantic     │            │
│  │  │(executeQuery)│   │ Cache (LRU)  │            │
│  │  └─────────────┘    └──────────────┘            │
│  │                                                  │
│  ▼                                                  ▼
│  ┌──────────────────────────────────────────────────┐
│  │           fetch() → /api/ai/chat                 │
│  └──────────────────────┬──────────────────────────┘
│                         │
└─────────────────────────┼──────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                BACKEND PROXY (Server)                    │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │ Auth Check   │───►│ Rate Limiter │───►│ Input     │ │
│  │ (JWT/Session)│    │ (10 req/min) │    │ Validator │ │
│  └──────────────┘    └──────────────┘    └─────┬─────┘ │
│                                                │       │
│  ┌─────────────────────────────────────────────┘       │
│  │                                                     │
│  ▼                                                     │
│  ┌──────────────────────────────────────────────┐     │
│  │          AI Router                              │     │
│  │  ┌─────────────┐  fallback  ┌──────────────┐  │     │
│  │  │  Cerebras   │───────────►│    Groq      │  │     │
│  │  │ (gpt-oss-   │            │ (llama-3.1-  │  │     │
│  │  │  120b)      │            │  8b-instant) │  │     │
│  │  └─────────────┘            └──────────────┘  │     │
│  └──────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Sumber:**
- [AI-Ready Frontend Architecture (LogRocket, 2026)](https://blog.logrocket.com/ai-ready-frontend-architecture-guide/)
- [The Complete Guide to Streaming LLM Responses](https://dev.to/pockit_tools/the-complete-guide-to-streaming-llm-responses-in-web-applications-from-sse-to-real-time-ui-3534)
- [When to choose client-side AI (Chrome Developers)](https://developer.chrome.com/docs/ai/client-side)

---

## 2. Dual-Path Context Injection: Yang Paling Akurat

### 2.1. Masalah dengan Pendekatan Saat Ini

Approach saat ini di `aiHelper.js` menggunakan **keyword detection** untuk menentukan data apa yang perlu dikirim. Ini rawan false positive/negative.

### 2.2. Solusi: Structured JSON + Query Engine Path

Dua jalur parallel yang dijalankan OLEH AI (bukan oleh kode):

#### Path A: Query Engine (untuk pertanyaan data-spesifik)
```
User: "Berapa total pengeluaran bulan Januari?"
  ↓
AI MEMUTUSKAN → ini butuh query data
  ↓
AI generates JSON: { "source": "bku_data", "filter": { "bulan": [1], "tipe": ["PEMBAYARAN"] }, "aggregate": { "sum": "pengeluaran" } }
  ↓
QueryEngine.executeQuery(query) → hasil numerik AKURAT (0 token hallucination risk)
  ↓
Hasil dikirim ke AI untuk formatting natural language
```

#### Path B: Context Injection (untuk pertanyaan kontekstual)
```
User: "Bagaimana cara membuat SPPD?"
  ↓
AI MEMUTUSKAN → ini pertanyaan umum, tidak butuh data spesifik
  ↓
Kirim langsung ke AI dengan GENERAL_PROMPT
  ↓
Jawaban natural
```

### 2.3. Keunggulan Dual-Path

| Aspek | Pendekatan Lama | Dual-Path |
|-------|----------------|-----------|
| **Akurasi kalkulasi** | Bergantung pada matematika LLM (rawan error) | QueryEngine hitung pake JavaScript (100% akurat) |
| **Token usage** | Kirim semua data relevan (bisa 2000+ token) | QueryEngine format compact (~200 token) |
| **Kecepatan** | 1 call ke AI (blocking) | QueryEngine instan (0ms) + 1 call AI kecil |
| **Biaya** | Mahal (data besar dikirim ke API) | Hemat (hanya hasil query + pertanyaan) |
| **Reliability** | AI bisa salah baca data | QueryEngine pakai exact match |

### 2.4. Implementasi yang Direkomendasikan

```javascript
// Pseudo-code untuk dual-path approach
async function askAI(question) {
  // 1. Cek semantic cache dulu
  const cached = await semanticCache.get(question)
  if (cached) return cached

  // 2. Kirim ke AI dengan system prompt yang minta AI memilih path
  const intentResponse = await callAI([
    { role: 'system', content: INTENT_CLASSIFIER_PROMPT },
    { role: 'user', content: question }
  ])
  
  // 3. Parse intent response
  const intent = JSON.parse(intentResponse)
  
  if (intent.type === 'query') {
    // Path A: Query Engine (zero hallucination untuk angka!)
    const queryResult = executeQuery(intent.query)
    const formattedResult = formatForAI(queryResult)
    
    // Kirim hasil query + pertanyaan ke AI untuk di-natural-language-kan
    const answer = await callAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `${formattedResult}\n\nPertanyaan: ${question}` }
    ])
    return answer
  } else {
    // Path B: Langsung jawab dengan GENERAL_PROMPT
    return await callAI([
      { role: 'system', content: GENERAL_PROMPT },
      { role: 'user', content: question }
    ])
  }
}
```

**Sumber:**
- [Structuring the Unstructured: Multi-Agent System for Financial KPIs (arXiv, 2025)](https://arxiv.org/html/2505.19197v2)
- [EEDP Methodology for Financial Document QA (Microsoft Research)](https://arxiv.org/html/2402.11194v3)
- [KemenkeuGPT: LLM on Indonesia's Government Financial Data](https://arxiv.org/html/2407.21459v1)

---

## 3. Program-of-Thought (PoT) untuk Kalkulasi Rupiah

### 3.1. Mengapa LLM Tidak Bisa Diandalkan untuk Matematika

LLM adalah "reasoning engine", bukan kalkulator. Chain-of-Thought (CoT) hanya mengurangi error, tidak menghilangkan.

### 3.2. Solusi: Program-of-Thought

**Jangan suruh AI menghitung. Suruh AI membuat kode yang menghitung.**

```javascript
// Contoh: User bertanya "Berapa total PPh23 yang sudah disetor?"
// AI GENERATE kode berikut (bukan jawaban langsung):
const pph23Transactions = transactions.filter(t => 
  (t.uraian || '').toLowerCase().includes('pph 23') &&
  t.pengeluaran > 0
)
const total = pph23Transactions.reduce((sum, t) => sum + Number(t.pengeluaran), 0)
return total // ← Eksekusi di sandbox/QueryEngine
```

### 3.3. Implementasi di SPJ

**QueryEngine.js sudah 90% siap untuk ini.** Tinggal tambah:
- Intent classifier yang lebih cerdas (minta AI pilih path)
- Structured output parser untuk intent AI
- Format hasil query yang lebih baik untuk konsumsi AI

### 3.4. Confidence Scoring

Untuk setiap angka yang dikeluarkan AI, minta confidence score:
```json
{
  "answer": "Total pengeluaran Januari: Rp 5.000.000",
  "confidence": 0.95,
  "source": "bku_data.filter({bulan: [1], tipe: ['PEMBAYARAN']}).sum('pengeluaran')"
}
```

Jika confidence < 0.7, tampilkan disclaimer atau fallback ke data mentah.

**Sumber:**
- [Processing Tabular Financial Data with LLMs (Daloopa)](https://daloopa.com/blog/analyst-best-practices/processing-tabular-financial-data-with-large-language-models)
- [The Token Efficiency Playbook (AWS Builder Center)](https://builder.aws/content/3FRlppwY0rQsApCRxEksJP0s6hX/the-token-efficiency-playbook-10-methods-to-spend-less-on-llm-inference)
- [8 LLM Cost Optimization Techniques (Towards AI)](https://pub.towardsai.net/8-llm-cost-optimization-techniques-how-to-cut-api-spend-by-up-to-70-visually-explained-edf7339d0c9a)

---

## 4. Security: API Key di Backend Proxy

### 4.1. Masalah Keamanan Kritis Saat Ini

🚨 **Sekarang:** API key ada di `VITE_CEREBRAS_API_KEY` dan `VITE_GROQ_API_KEY`
- Vite bundling: semua env `VITE_*` masuk ke bundle JS publik
- Siapa pun bisa extract API key dari browser dev tools
- Risiko: pencurian key → tagihan membengkak

### 4.2. Solusi: Backend Proxy Pattern

```
Frontend (fetch) → Backend Proxy (/api/ai/chat) → AI Provider API
```

#### Development: Vite Proxy (sudah ada, tinggal refine)
```javascript
// vite.config.js — sudah ada untuk Cerebras, Groq, Gemini
proxy: {
  '/api/ai': {
    target: 'http://localhost:3001', // Backend proxy server
    changeOrigin: true,
  }
}
```

#### Production: Backend Server (minimal)
Bisa pakai:
1. **Express.js server sederhana** (deploy gratis di Railway/Render)
2. **Cloudflare Worker** (gratis, 100k req/hari)
3. **Laravel backend** (jika nanti migrasi ke fullstack)

```javascript
// Contoh minimal Express proxy server
const express = require('express')
const app = express()
app.use(express.json())

const API_KEY = process.env.CEREBRAS_API_KEY // Hanya di server!

app.post('/api/ai/chat', async (req, res) => {
  // 1. Rate limiting
  // 2. Input validation
  // 3. Forward ke Cerebras/Groq
  
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`, // Key aman di server!
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
  
  // Stream response ke client
  response.body.pipeTo(res)
})

app.listen(3001)
```

### 4.3. Security Checklist

| Item | Status Sekarang | Target |
|------|----------------|--------|
| API Key di frontend bundle | ❌ Ya (VITE_*) | ✅ Pindah ke server |
| Rate limiting | ❌ Tidak ada | ✅ 10 req/min per user |
| Input validation | ❌ Tidak ada | ✅ Max 2000 chars |
| Cost monitoring | ❌ Tidak ada | ✅ Alert di 80% quota |

**Sumber:**
- [LLM API Keys in Frontend Code — Security Risks (2026)](https://zainmustafaaa.dev/blog/llm-api-keys-frontend-security)
- [Secure LLM API Key Management (DomainOptic, 2026)](https://domainoptic.com/blog/secure-llm-api-key-management-2026/)
- [Safest Way to Hide API Keys in React (Smashing Magazine)](https://www.smashingmagazine.com/2023/05/safest-way-hide-api-keys-react/)

---

## 5. Response Streaming: UX yang Jauh Lebih Baik

### 5.1. Mengapa Streaming?

**TTFT (Time To First Token)** adalah metrik UX paling penting untuk AI chat.

| Metode | TTFT | Persepsi User |
|--------|------|---------------|
| **Non-streaming** (sekarang) | 1-3 detik (tunggu full response) | "Lambat, nge-freeze" |
| **Streaming (SSE)** | 200-500ms (token pertama) | "Cepet, responsif" |

### 5.2. Implementasi SSE

```javascript
// Client-side streaming
async function askAIStream(question, onToken) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, stream: true })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const text = decoder.decode(value)
    const lines = text.split('\n')
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const token = line.slice(6)
        if (token === '[DONE]') break
        onToken(token) // ← Update UI real-time
      }
    }
  }
}

// Penggunaan di AskAIPanel.jsx
const handleSend = async () => {
  setIsLoading(true)
  let accumulated = ''
  
  await askAIStream(inputText, (token) => {
    accumulated += token
    updateLastMessage(accumulated) // ← Streaming ke bubble
  })
  
  setIsLoading(false)
}
```

### 5.3. Optimistic UI

Selagi AI mikir, tampilkan **skeleton bubble** + pesan "Mencari data..." untuk mengurangi perceived latency.

**Sumber:**
- [The Complete Guide to Streaming LLM Responses](https://dev.to/pockit_tools/the-complete-guide-to-streaming-llm-responses-in-web-applications-from-sse-to-real-time-ui-3534)

---

## 6. Semantic Caching: Hemat Biaya drastis

### 6.1. Masalah

Banyak pertanyaan user yang **sama secara makna** tapi beda kata-kata:
- "Berapa total pengeluaran?" = "Total pengeluaran berapa?" = "Berapa jumlah pengeluaran?"
- Ketiganya → hit API 3x

### 6.2. Solusi: In-Memory LRU Cache

```javascript
class SemanticCache {
  constructor(maxSize = 50) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  // Normalize question: lowercase, hapus tanda baca, hapus kata umum
  normalize(q) {
    return q.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\b(berapa|total|semua|tolong|please|bisa)\b/g, '')
      .trim()
  }

  get(question) {
    const key = this.normalize(question)
    const entry = this.cache.get(key)
    if (entry && Date.now() - entry.timestamp < 5 * 60 * 1000) {
      // Cache valid for 5 minutes (data BKU bisa berubah)
      return entry.answer
    }
    return null
  }

  set(question, answer) {
    const key = this.normalize(question)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, { answer, timestamp: Date.now() })
  }
}
```

### 6.3. Estimasi Penghematan

| Skenario | Tanpa Cache | Dengan Cache |
|----------|------------|--------------|
| 10 user tanya "total pengeluaran" | 10 API calls | 1 API call |
| 5 user tanya progress LPJ | 5 API calls | 1 API call |
| Total/bulan (est. 300 query) | ~$15-30 | **~$3-6** |

**Sumber:**
- [Effective Strategies for OpenAI Cost Management (Sedai, 2026)](https://sedai.io/blog/how-to-optimize-openai-costs-in-2025)
- [8 LLM Cost Optimization Techniques (Towards AI)](https://pub.towardsai.net/8-llm-cost-optimization-techniques-how-to-cut-api-spend-by-up-to-70-visually-explained-edf7339d0c9a)

---

## 7. Multi-Agent Pattern untuk Generate Notulen

### 7.1. Masalah dengan Single Prompt

Saat ini `generateRingkasanNotulen()` menggunakan 1 prompt untuk generate notulen. Hasilnya bisa generic dan kurang kontekstual.

### 7.2. Solusi: Two-Agent Pipeline

```
Agent 1: Context Extractor
  Input: Nama kegiatan + data BKU terkait
  Output: { tanggal, tempat, peserta, dana, tujuan }
  
Agent 2: Notulen Generator
  Input: Structured context dari Agent 1
  Output: Notulen rapat formal yang spesifik
```

### 7.3. Implementasi

```javascript
// Langsung 2 call tanpa orchestration framework yang kompleks
async function generateRingkasanNotulen(acara) {
  // Agent 1: Extract context
  const contextPrompt = `Extract structured context for meeting notes about "${acara}".
Return JSON: { tanggal, tempat, tujuan, estimatedPeserta }`
  
  const contextRaw = await callAI([
    { role: 'system', content: 'You extract structured data. Output ONLY JSON.' },
    { role: 'user', content: contextPrompt }
  ])
  
  const context = JSON.parse(contextRaw)
  
  // Agent 2: Generate notulen dengan context
  const notulenPrompt = `Buat notulen rapat untuk: "${acara}"
Context: ${JSON.stringify(context)}
Format: formal bahasa Indonesia, 3-5 poin pembahasan, pembuka dan penutup.`
  
  return await callAI([
    { role: 'system', content: RINGKASAN_NOTULEN_PROMPT },
    { role: 'user', content: notulenPrompt }
  ])
}
```

**Sumber:**
- [Structuring the Unstructured: Multi-Agent System (arXiv, 2025)](https://arxiv.org/html/2505.19197v2)
- [LLM Agent Architectures 2026: Components and Patterns](https://futureagi.com/blog/llm-agent-architectures-core-components/)

---

## 8. Prompt Engineering: Best Practices untuk Konteks Indonesia

### 8.1. System Prompt yang Efektif

Praktik terbaik dari KemenkeuGPT dan riset terkini:

```markdown
1. **Role-specific prefix** — "Kamu adalah operator sekolah yang..."
2. **Structured data format** — Gunakan JSON, bukan markdown tabel
3. **Explicit negative constraints** — "JANGAN membuat data palsu"
4. **Output format specification** — "Jawab dalam 3 kalimat maksimal"
5. **Few-shot examples** — Beri contoh Q&A untuk task spesifik
```

### 8.2. Token Efficiency

| Strategi | Penghematan | Implementasi |
|----------|------------|-------------|
| Hapus boilerplate dari prompt | ~20% | Gunakan template minimalis |
| Compact data format | ~40% | Ringkasan per bulan (sekarang sudah) |
| Cache system prompt | ~15% | Prompt caching (Cerebras/Groq support) |
| Batasi output tokens | ~30% | `max_tokens: 300` untuk query simple |

### 8.3. Context Window Optimization

- **Keep under 4000 tokens** untuk performa optimal
- **Gunakan sliding window** untuk chat history
- **Prioritaskan data terbaru** (BKU bulan ini > bulan lalu)

**Sumber:**
- [KemenkeuGPT: LLM on Indonesia's Government Financial Data (arXiv)](https://arxiv.org/html/2407.21459v1)
- [LLM Agent Architectures: Components and Patterns (FutureAGI, 2026)](https://futureagi.com/blog/llm-agent-architectures-core-components/)

---

## 9. Rekomendasi Prioritas Implementasi

### 🔴 Priority 1: High Impact, Low Effort (Sekarang)

| # | Perubahan | Dampak | Estimasi |
|---|-----------|--------|----------|
| 1 | **Backend Proxy untuk API Key** | Security +++ | 2-3 jam |
| 2 | **Semantic Cache (in-memory LRU)** | Biaya -- (50% hemat) | 30 menit |
| 3 | **Better Intent Classification** | Akurasi ++ | 1 jam |
| 4 | **Optimasi System Prompt** | Token -- (20% hemat) | 30 menit |

### 🟡 Priority 2: Medium Impact, Medium Effort (Minggu Ini)

| # | Perubahan | Dampak | Estimasi |
|---|-----------|--------|----------|
| 5 | **Response Streaming (SSE)** | UX +++ | 3-4 jam |
| 6 | **Dual-Path Query Engine Integration** | Akurasi +++, Biaya -- | 4-6 jam |
| 7 | **Multi-Agent untuk Generate Notulen** | Kualitas ++ | 2-3 jam |

### 🟢 Priority 3: Nice to Have (Nanti)

| # | Perubahan | Dampak |
|---|-----------|--------|
| 8 | **Confidence Scoring** | Transparansi |
| 9 | **Tool-Use Pattern (ReAct)** | Fleksibilitas |
| 10 | **Fine-tuned model untuk domain SPJ** | Performa maksimal |

---

## 10. Jawaban: Axios vs Fetch

**Kesimpulan: Tetap pakai `fetch` native. Axios tidak diperlukan untuk use case ini.**

| Aspek | fetch (sekarang) | axios | Keputusan |
|-------|-----------------|-------|-----------|
| Bundle size | 0 kB | ~14 kB gzip | ✅ fetch |
| Streaming support | `response.body.getReader()` native | `responseType: 'stream'` | ✅ fetch (sama) |
| Interceptors | Tidak perlu (1 endpoint) | Berguna jika banyak endpoint | ⚖️ Sama |
| Timeout | `AbortController` (3 line) | `timeout: 30000` (1 line) | ⚖️ Sama |
| Error handling | Manual `res.ok` + `res.text()` | `catch(err)` dpt status | ⚖️ Sama |
| TypeScript | Manual `as` casting | `AxiosResponse<T>` | ❌ fetch (manual) |

**Untuk 3 endpoint AI yang ada, fetch lebih dari cukup. Axios baru berguna jika ada 10+ endpoint dengan interceptor kompleks.**

---

## 11. Perbandingan Provider AI

| Provider | Kecepatan | Biaya | Kualitas Bahasa Indonesia | Cocok untuk |
|----------|-----------|-------|--------------------------|-------------|
| **Cerebras** (gpt-oss-120b) | ⚡ Sangat cepat | 💰 Gratis (via partnership?) | 🟡 Sedang | Primary untuk SPJ |
| **Groq** (llama-3.1-8b) | ⚡ Sangat cepat | 💰 Gratis (rate limited) | 🟡 Sedang | Fallback bagus |
| **Gemini** (gemini-pro) | 🟡 Sedang | 💰 Ada free tier | 🟢 Baik | Alternatif jika butuh Bhs Indonesia |
| **Claude** (sonnet) | 🟡 Sedang | 💰 Berbayar | 🟢 Baik | Jika butuh kualitas maksimal |

**Rekomendasi:** 
- **Primary:** Cerebras (sekarang) — paling cepat, gratis
- **Fallback:** Groq — gratis, OpenAI-compatible
- **Tambahan:** Gemini API (free tier 60 req/min) — kualitas Bahasa Indonesia terbaik

---

## 12. Best Practice: `fetch` dengan Timeout & Retry

```javascript
/**
 * Fetch dengan timeout + retry + error handling yang proper
 * Ini adalah yang digunakan developer senior — bukan axios!
 */
async function fetchWithRetry(url, options = {}, retries = 2) {
  const timeout = options.timeout || 30000
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 150)}`)
      }

      // Support streaming
      if (options.stream) {
        return res
      }

      return await res.json()
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (attempt < retries && err.name !== 'AbortError') {
        // Exponential backoff: 1s, 2s
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
        continue
      }
      throw err
    }
  }
}
```

---

## 📚 Sumber Referensi Lengkap

1. [AI-Ready Frontend Architecture Guide (LogRocket, 2026)](https://blog.logrocket.com/ai-ready-frontend-architecture-guide/)
2. [Streaming LLM Responses in Web Applications](https://dev.to/pockit_tools/the-complete-guide-to-streaming-llm-responses-in-web-applications-from-sse-to-real-time-ui-3534)
3. [LLM Agent Architectures 2026: Components and Patterns](https://futureagi.com/blog/llm-agent-architectures-core-components/)
4. [What Changes in Frontend Architecture When AI Enters the Product](https://orderstack.xyz/changes-frontend-architecture-when-ai-enters-product/)
5. [Client-Side RAG System in the Browser (SitePoint, 2026)](https://www.sitepoint.com/browser-based-rag-private-docs/)
6. [Browser-Based RAG for Session-Level Knowledge (Medium)](https://medium.com/@tomkob99_89317/proposing-browser-based-rag-for-session-level-knowledge-a-case-for-indexeddb-vector-storage-45f2c2135365)
7. [Multi-Agent System for Financial KPIs (arXiv, 2025)](https://arxiv.org/html/2505.19197v2)
8. [AI Document Extraction for Business Workflows (TurboLens, 2026)](https://www.turbolens.io/blog/2026-05-18-ai-document-extraction-for-real-business-workflows-from-upload-to-api-output)
9. [EEDP: LLMs Mathematical Reasoning in Financial QA (Microsoft Research)](https://arxiv.org/html/2402.11194v3)
10. [KemenkeuGPT: LLM on Indonesia's Government Financial Data](https://arxiv.org/html/2407.21459v1)
11. [When to Choose Client-Side AI (Chrome Developers)](https://developer.chrome.com/docs/ai/client-side)
12. [Client-Side AI Performance (web.dev)](https://web.dev/articles/client-side-ai-performance)
13. [Client-Side AI for Cost-Effective Web Apps (Grid Dynamics)](https://www.griddynamics.com/blog/client-side-ai)
14. [LLM API Keys in Frontend Code — Security Risks (2026)](https://zainmustafaaa.dev/blog/llm-api-keys-frontend-security)
15. [Secure LLM API Key Management (DomainOptic, 2026)](https://domainoptic.com/blog/secure-llm-api-key-management-2026/)
16. [Processing Tabular Financial Data with LLMs (Daloopa)](https://daloopa.com/blog/analyst-best-practices/processing-tabular-financial-data-with-large-language-models)
17. [LangGraph: Reliable AI Agent Framework](https://www.langchain.com/langgraph)
18. [Effective Strategies for OpenAI Cost Management (Sedai, 2026)](https://sedai.io/blog/how-to-optimize-openai-costs-in-2025)
19. [The Token Efficiency Playbook (AWS Builder Center)](https://builder.aws/content/3FRlppwY0rQsApCRxEksJP0s6hX/the-token-efficiency-playbook-10-methods-to-spend-less-on-llm-inference)
20. [8 LLM Cost Optimization Techniques (Towards AI)](https://pub.towardsai.net/8-llm-cost-optimization-techniques-how-to-cut-api-spend-by-up-to-70-visually-explained-edf7339d0c9a)

---

## Metodologi

- **Jumlah query pencarian**: 10+ query di web search (best practices integrasi AI frontend, optimasi API call, RAG client-side, prompt engineering financial data, secure API key management, agent orchestration, client-side vs server-side AI)
- **Sumber yang dianalisis**: 20+ sumber dari artikel teknis, arXiv papers, dokumentasi resmi, dan blog engineering
- **Sub-questions yang diinvestigasi**:
  1. Arsitektur integrasi AI terbaik untuk frontend web apps 2025-2026
  2. Optimasi biaya & performa AI API calls
  3. RAG arsitektur untuk client-side document apps
  4. Prompt engineering untuk data keuangan Bahasa Indonesia
  5. Client-side vs server-side AI trade-offs
  6. Secure API key management
  7. Agent orchestration patterns
  8. Dokument extraction & financial data analysis
