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
  },
  cerebras: {
    base: 'https://api.cerebras.ai/v1',
    rewrite: (path) => path.replace(/^cerebras\//, ''),
  },
  gemini: {
    base: 'https://generativelanguage.googleapis.com/v1beta',
    rewrite: (path) => path.replace(/^gemini\//, ''),
  },
}

export default async function handler(req, res) {
  // Hanya terima POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
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
  const targetUrl = `${target.base}/${restPath}`

  // Baca API key dari Authorization header (dikirim dari frontend)
  const authHeader = req.headers['authorization'] || ''
  const apiKey = authHeader.replace('Bearer ', '')

  try {
    // Forward request ke API provider
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
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
