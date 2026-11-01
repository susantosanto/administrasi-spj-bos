/**
 * Vercel Serverless Function — AI API Proxy
 * 
 * Menggantikan Vite proxy yang hanya jalan di development.
 * Di Vercel (production), request /api/* di-handle oleh function ini.
 * 
 * Mapping path → target API:
 *   /api/groq/chat/completions  → https://api.groq.com/openai/v1/chat/completions
 *   /api/cerebras/chat/completions → https://api.cerebras.ai/v1/chat/completions
 *   /api/gemini/...              → https://generativelanguage.googleapis.com/v1beta/...
 */

const TARGETS = {
  groq: {
    base: 'https://api.groq.com/openai/v1',
    rewrite: (path) => path.replace(/^groq\//, ''),
    // Kunci server (Vercel env, TANPA prefix VITE_ agar tidak terbawa ke bundle klien)
    serverKey: process.env.GROQ_API_KEY || '',
    authStyle: 'bearer',
  },
  cerebras: {
    base: 'https://api.cerebras.ai/v1',
    rewrite: (path) => path.replace(/^cerebras\//, ''),
    serverKey: process.env.CEREBRAS_API_KEY || '',
    authStyle: 'bearer',
  },
  gemini: {
    base: 'https://generativelanguage.googleapis.com/v1beta',
    rewrite: (path) => path.replace(/^gemini\//, ''),
    serverKey: process.env.GEMINI_API_KEY || '',
    authStyle: 'query',
  },
}

export default async function handler(req, res) {
  // Log untuk debugging
  console.log(`[AI Proxy] ${req.method} ${req.url} — path:`, req.query.path)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.status(200).end()
    return
  }

  // Hanya terima POST
  if (req.method !== 'POST') {
    console.warn(`[AI Proxy] Ditolak: method=${req.method}, url=${req.url}`)
    return res.status(405).json({ error: `Method ${req.method} not allowed. Use POST.` })
  }

  // Parse path: /api/groq/chat/completions → ['groq', 'chat', 'completions']
  const pathParts = (req.query.path || []).join('/')
  if (!pathParts) {
    return res.status(400).json({ error: 'Path tidak valid' })
  }

  // Ambil provider dari bagian pertama path
  const providerKey = pathParts.split('/')[0]
  const target = TARGETS[providerKey]

  if (!target) {
    return res.status(400).json({ error: `Provider tidak dikenal: ${providerKey}` })
  }

  // Bangun URL target
  const restPath = target.rewrite(pathParts)
  let targetUrl = `${target.base}/${restPath}`

  // Kunci API: utamakan server env (tidak terekspos ke bundle klien),
  // fallback ke Authorization header dari frontend (mode dev/VITE_*).
  // Catatan: header Authorization TIDAK pernah di-log.
  const authHeader = req.headers['authorization'] || ''
  const clientKey = authHeader.replace(/^Bearer\s+/i, '')
  const apiKey = target.serverKey || clientKey

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key tidak tersedia. Set env server atau isi API key di Pengaturan.',
    })
  }

  // Gemini memakai ?key= di query param, bukan Bearer header
  if (target.authStyle === 'query') {
    const sep = targetUrl.includes('?') ? '&' : '?'
    targetUrl = `${targetUrl}${sep}key=${encodeURIComponent(apiKey)}`
  }

  try {
    // Forward request ke API provider
    const upstreamHeaders = { 'Content-Type': 'application/json' }
    if (target.authStyle === 'bearer') {
      upstreamHeaders['Authorization'] = `Bearer ${apiKey}`
    }
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: upstreamHeaders,
      body: JSON.stringify(req.body),
    })

    // Handle non-2xx upstream error
    if (!response.ok) {
      const errText = await response.text()
      if (!res.writableEnded) {
        return res.status(response.status).json({
          error: `Upstream ${response.status}`,
          detail: errText.slice(0, 500),
        })
      }
    }

    // Handle streaming
    if (req.body?.stream) {
      // Set header SSE
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Pipe streaming response
      const reader = response.body.getReader()
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            res.end()
            return
          }
          res.write(value)
        }
      }
      pump().catch((err) => {
        console.error('Streaming error:', err)
        if (!res.writableEnded) res.end()
      })
    } else {
      // Non-streaming: forward JSON response
      const data = await response.json()
      res.status(response.status).json(data)
    }
  } catch (err) {
    console.error('Proxy error:', err)
    if (!res.writableEnded) {
      res.status(502).json({ error: `Proxy error: ${err.message}` })
    }
  }
}
