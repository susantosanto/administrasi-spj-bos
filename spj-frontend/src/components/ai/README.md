# ⚡ Fitur "Ask to AI" — Panduan Integrasi

## 📁 File yang Dibuat

```
spj-frontend/
├── .env.example                          ← Template API key
├── vite.config.js                        ← ✅ UPDATED (proxy AI API)
├── src/
│   ├── contexts/
│   │   └── AIContext.jsx                 ← State management chat
│   ├── utils/
│   │   └── aiHelper.js                   ← Core AI Agent (Gemini + Groq)
│   └── components/
│       └── ai/
│           ├── AskAIButton.jsx           ← FAB tombol
│           ├── AskAIPanel.jsx            ← Panel chat
│           └── README.md                 ← Dokumen ini
```

## 🚀 Cara Setup

### 1. Dapatkan API Key Gemini (GRATIS)

```
1. Buka https://aistudio.google.com/apikey
2. Klik "Create API Key"
3. Pilih project atau buat baru
4. Copy API key-nya
```

### 2. Konfigurasi .env

```bash
# Copy template
cp spj-frontend/.env.example spj-frontend/.env

# Edit .env — isi API key
VITE_GEMINI_API_KEY=AIzaSy...
```

### 3. Integrasi di App.jsx

```jsx
// Di App.jsx, bungkus dengan AIProvider + tambah AskAIButton

import { AIProvider } from './contexts/AIContext'
import AskAIButton from './components/ai/AskAIButton'

function App() {
  return (
    <ToastProvider>
      <AIProvider>                          // ← TAMBAH INI
        <Router>
          <Routes>...</Routes>
        </Router>
        <AskAIButton />                     // ← TAMBAH INI
      </AIProvider>                         // ← TAMBAH INI
    </ToastProvider>
  )
}
```

### 4. Jalankan Aplikasi

```bash
cd spj-frontend
npm run dev
```

## 🎯 Cara Pakai

Setelah berhasil diintegrasi:

1. **Klik tombol ⚡** di pojok kanan bawah
2. **Panel chat** akan terbuka dari kanan
3. **Klik quick chips** atau **ketik pertanyaan**
4. AI akan menjawab berdasarkan data di localStorage

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| "API Key belum diatur" | Copy .env.example ke .env, isi API key |
| CORS error | Vite proxy sudah di-setup. Pastikan `npm run dev` |
| API error 403 | API key salah atau limit tercapai |
| Jawaban tidak akurat | Data di localStorage mungkin kosong |
| Panel tidak muncul | Pastikan AIProvider sudah dibungkus di App.jsx |

## 🔐 Keamanan API Key

- **Development**: API key disimpan di `.env` file (Vite embed saat build)
- **Production**: 
  - Opsi 1: Backend proxy (buat endpoint `/api/ai` yang panggil Gemini)
  - Opsi 2: Gunakan Firebase Functions / Vercel Edge Functions
  - Opsi 3: Client-side langsung (Gemini API key aman karena CORS + domain restriction)

> **Rekomendasi**: Untuk 600 sekolah, pakai Gemini Free dulu (gratis). 
> Jika perlu unlimited, upgrade ke Groq ($0.05/1M token ≈ Rp 42.000/tahun).
