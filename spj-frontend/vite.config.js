import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Pisahkan pustaka berat ke chunk tersendiri agar main bundle ramping
        // dan halaman yang tak memakai PDF/Excel tak memuatnya di awal.
        manualChunks: {
          'pdfjs': ['pdfjs-dist/build/pdf'],
          'xlsx-vendor': ['xlsx'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    // ── Proxy untuk AI API (atasi CORS) ──
    proxy: {
      // Google Gemini API
      '/api/gemini': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gemini/, '/v1beta'),
      },
      // Groq API (OpenAI-compatible: /openai/v1/...)
      '/api/groq': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/groq/, '/openai/v1'),
      },
      // Cerebras API (OpenAI-compatible)
      '/api/cerebras': {
        target: 'https://api.cerebras.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cerebras/, '/v1'),
      },
    },
  },
})
