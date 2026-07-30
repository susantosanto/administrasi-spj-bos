# 🚀 Implementasi Fitur Generate Foto Dokumentasi
*Dibuat: 26 Juli 2026 | Status: IMPLEMENTATION GUIDE*

---

## 📋 Daftar Isi

1. [Arsitektur Sistem](#1-arsitektur-sistem)
2. [Setup Provider AI](#2-setup-provider-ai)
3. [Backend API](#3-backend-api)
4. [Frontend Components](#4-frontend-components)
5. [Integrasi ke App](#5-integrasi-ke-app)
6. [Testing & Deployment](#6-testing--deployment)

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (React SPA)                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  DokumentasiAIPage.jsx                              │   │
│  │  ├── FaceUploader.jsx        ← Upload selfie        │   │
│  │  ├── ActivitySelector.jsx    ← Pilih rapat/MAMIN    │   │
│  │  ├── PromptEditor.jsx        ← Edit prompt          │   │
│  │  ├── GenerateButton.jsx      ← Klik Generate        │   │
│  │  └── ResultPreview.jsx       ← Lihat + Download     │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  services/imageGenerator.js                         │   │
│  │  ├── generateWithGemini()                           │   │
│  │  ├── generateWithFalAI()                            │   │
│  │  └── buildPrompt()                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │ POST /api/generate-image
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Vercel Serverless / RunPod)                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  api/generate-image.js                              │   │
│  │  ├── Validasi input                                 │   │
│  │  ├── Build prompt                                   │   │
│  │  ├── Panggil AI Provider                            │   │
│  │  └── Return image URL/base64                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
└───────────────────────────┼─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  AI PROVIDER (Pilih salah satu)                             │
│                                                             │
│  🥇 Google Gemini (Nano Banana) — GRATIS!                  │
│  🥈 Google Imagen 3 — $0.04/1000 images                    │
│  🥉 Fal.ai Flux Pro — $0.03/image                          │
│  4. RunPod Self-host — $0.22/hr (unlimited)                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Setup Provider AI

### 2.1 Pilihan Provider

| Provider | Harga | API Ready | Rekomendasi |
|:---|---:|:---:|:---|
| **Google Gemini (Nano Banana)** | **$0 (Free)** | ✅ | 🥇 MVP |
| **Google Imagen 3** | $0.04/1000 | ✅ | 🥈 Production |
| **Fal.ai Flux Pro** | $0.03/image | ✅ | 🥉 Alternatif |
| **RunPod Self-host** | $0.22/hr | ✅ | Unlimited |

### 2.2 Setup Google Gemini (Rekomendasi Utama)

**Langkah 1: Daftar Google AI Studio**

```
1. Buka https://aistudio.google.com
2. Login dengan Google Account
3. Klik "Get API Key"
4. Buat API key baru
5. Copy API key (simpan di environment variable)
```

**Langkah 2: Install Dependencies**

```bash
# Tidak perlu install apapun untuk Gemini API
# Cukup pakai fetch() native
```

**Langkah 3: Test API**

```javascript
// test-gemini-image.js
const API_KEY = 'YOUR_GOOGLE_AI_STUDIO_KEY'

async function testGeminiImage() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: "Generate a photorealistic image of a teacher meeting in an Indonesian school classroom" 
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    }
  )
  
  const result = await response.json()
  console.log(result)
}

testGeminiImage()
```

---

## 3. Backend API

### 3.1 Struktur File

```
spj-frontend/
├── api/
│   └── generate-image.js        ← Serverless function
├── src/
│   ├── services/
│   │   └── imageGenerator.js    ← Client-side service
│   ├── components/
│   │   └── dokumentasi/
│   │       ├── FaceUploader.jsx
│   │       ├── ActivitySelector.jsx
│   │       ├── PromptEditor.jsx
│   │       ├── GenerateButton.jsx
│   │       └── ResultPreview.jsx
│   └── pages/
│       └── DokumentasiAIPage.jsx
```

### 3.2 Serverless Function

```javascript
// api/generate-image.js (Vercel Serverless)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, activity, faceImage, provider } = req.body
    
    // Validasi input
    if (!prompt && !activity) {
      return res.status(400).json({ error: 'Prompt or activity required' })
    }
    
    // Build final prompt
    const finalPrompt = buildPrompt(prompt, activity)
    
    // Panggil provider AI
    let result
    
    switch (provider) {
      case 'gemini':
        result = await generateWithGemini(finalPrompt, faceImage)
        break
      case 'imagen':
        result = await generateWithImagen(finalPrompt)
        break
      case 'fal':
        result = await generateWithFalAI(finalPrompt)
        break
      default:
        result = await generateWithGemini(finalPrompt, faceImage)
    }
    
    return res.status(200).json({
      success: true,
      image: result.image,
      provider: provider || 'gemini',
      prompt: finalPrompt,
    })
    
  } catch (error) {
    console.error('Generate error:', error)
    return res.status(500).json({ 
      error: 'Generate gagal', 
      detail: error.message 
    })
  }
}

// Helper: Build prompt berdasarkan aktivitas
function buildPrompt(customPrompt, activity) {
  const activityPrompts = {
    rapat: `Generate a photorealistic documentation photo: A teacher leading a meeting in an Indonesian school meeting room. Other teachers sitting around a table, whiteboard in background, formal but relaxed atmosphere, natural lighting from windows, candid style photo, high quality.`,
    
    mamin: `Generate a photorealistic documentation photo: A teacher receiving catering boxes (nasi box/snack box) for school event. School hallway background, daytime, natural lighting, documentary style, high quality.`,
    
    atk: `Generate a photorealistic documentation photo: A teacher receiving office supplies (ATK) package. School classroom background, boxes of supplies on table, daytime, natural lighting, high quality.`,
    
    pemeliharaan: `Generate a photorealistic documentation photo: A teacher supervising maintenance work in school. School building background, daytime, natural lighting, documentary style, high quality.`
  }
  
  return customPrompt || activityPrompts[activity] || activityPrompts.rapat
}

// Generator: Google Gemini (Nano Banana)
async function generateWithGemini(prompt, faceImage) {
  const API_KEY = process.env.GOOGLE_AI_KEY
  
  const parts = [{ text: prompt }]
  
  // Jika ada face image, tambahkan sebagai input
  if (faceImage) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: faceImage.replace(/^data:image\/\w+;base64,/, '')
      }
    })
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"]
        }
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Gemini API error')
  }
  
  const result = await response.json()
  
  // Extract image dari response
  const imagePart = result?.candidates?.[0]?.content?.parts?.find(
    part => part.inlineData
  )
  
  if (!imagePart) {
    throw new Error('No image generated')
  }
  
  return {
    image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
  }
}

// Generator: Google Imagen 3 (via Vertex AI)
async function generateWithImagen(prompt) {
  // Implementasi untuk Vertex AI
  // Memerlukan Google Cloud credentials
  throw new Error('Imagen 3 not implemented yet')
}

// Generator: Fal.ai Flux Pro
async function generateWithFalAI(prompt) {
  const FAL_KEY = process.env.FAL_API_KEY
  
  const response = await fetch('https://fal.run/black-forest-labs/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Fal.ai API error')
  }
  
  const result = await response.json()
  
  return {
    image: result.images[0].url
  }
}
```

### 3.3 Environment Variables

```bash
# .env.local (untuk development)
GOOGLE_AI_KEY=your_google_ai_studio_key_here
FAL_API_KEY=your_fal_api_key_here

# .env.production (untuk Vercel)
GOOGLE_AI_KEY=your_google_ai_studio_key_here
FAL_API_KEY=your_fal_api_key_here
```

---

## 4. Frontend Components

### 4.1 Client-Side Service

```javascript
// src/services/imageGenerator.js

const API_BASE = import.meta.env.DEV ? '' : 'https://your-app.vercel.app'

export async function generateDocumentationImage({ 
  prompt, 
  activity, 
  faceImage,
  provider = 'gemini' 
}) {
  try {
    const response = await fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        activity,
        faceImage,
        provider,
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || error.error || 'Generate failed')
    }
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Generate failed')
    }
    
    return result.image
    
  } catch (error) {
    console.error('Image generation error:', error)
    throw error
  }
}

// Activity prompts untuk preview
export const ACTIVITY_PROMPTS = {
  rapat: {
    name: 'Rapat Guru',
    icon: 'groups',
    prompt: 'rapat guru di ruang rapat sekolah Indonesia, suasana formal santai',
  },
  mamin: {
    name: 'Serah Terima Makanan',
    icon: 'restaurant',
    prompt: 'serah terima nasi box/snack box untuk kegiatan sekolah',
  },
  atk: {
    name: 'Serah Terima ATK',
    icon: 'inventory_2',
    prompt: 'serah terima alat tulis kantor untuk kegiatan sekolah',
  },
  pemeliharaan: {
    name: 'Pemeliharaan',
    icon: 'build',
    prompt: 'pemeliharaan/perbaikan fasilitas sekolah',
  },
}
```

### 4.2 FaceUploader Component

```jsx
// src/components/dokumentasi/FaceUploader.jsx

import { useState, useRef } from 'react'

export default function FaceUploader({ onImageUpload }) {
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('File harus berupa gambar!')
      return
    }

    // Resize ke max 512px untuk hemat token
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 512
        let width = img.width
        let height = img.height

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const base64 = canvas.toDataURL('image/jpeg', 0.8)
        setPreview(base64)
        onImageUpload(base64)
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Foto Wajah (Selfie)
      </label>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          text-center transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
          ${preview ? 'border-green-500 bg-green-50' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files[0])}
          className="hidden"
        />
        
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Preview" 
              className="mx-auto h-32 w-32 rounded-full object-cover shadow-lg"
            />
            <p className="text-sm text-green-600">
              ✅ Foto berhasil diupload
            </p>
            <p className="text-xs text-gray-500">
              Klik untuk ganti foto
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              add_a_photo
            </span>
            <p className="text-gray-600">
              Drag & drop foto selfie atau klik untuk upload
            </p>
            <p className="text-xs text-gray-500">
              Format: JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 4.3 ActivitySelector Component

```jsx
// src/components/dokumentasi/ActivitySelector.jsx

import { ACTIVITY_PROMPTS } from '../../services/imageGenerator'

export default function ActivitySelector({ selected, onSelect }) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Jenis Kegiatan
      </label>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(ACTIVITY_PROMPTS).map(([key, activity]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              flex items-center gap-3 rounded-xl border-2 p-4
              text-left transition-all duration-200
              ${selected === key 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <span className={`
              material-symbols-outlined text-2xl
              ${selected === key ? 'text-primary' : 'text-gray-400'}
            `}>
              {activity.icon}
            </span>
            <div>
              <p className={`font-medium ${selected === key ? 'text-primary' : 'text-gray-700'}`}>
                {activity.name}
              </p>
              <p className="text-xs text-gray-500 line-clamp-1">
                {activity.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### 4.4 PromptEditor Component

```jsx
// src/components/dokumentasi/PromptEditor.jsx

import { useState } from 'react'

export default function PromptEditor({ value, onChange, activity }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const defaultPrompts = {
    rapat: 'Generate a photorealistic documentation photo: A teacher leading a meeting in an Indonesian school meeting room. Other teachers sitting around a table, whiteboard in background, formal but relaxed atmosphere, natural lighting from windows, candid style photo, high quality.',
    mamin: 'Generate a photorealistic documentation photo: A teacher receiving catering boxes (nasi box/snack box) for school event. School hallway background, daytime, natural lighting, documentary style, high quality.',
    atk: 'Generate a photorealistic documentation photo: A teacher receiving office supplies (ATK) package. School classroom background, boxes of supplies on table, daytime, natural lighting, high quality.',
    pemeliharaan: 'Generate a photorealistic documentation photo: A teacher supervising maintenance work in school. School building background, daytime, natural lighting, documentary style, high quality.',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Prompt (Deskripsi Gambar)
        </label>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:underline"
        >
          {isExpanded ? 'Sembunyikan' : 'Edit Prompt'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="space-y-2">
          <textarea
            value={value || defaultPrompts[activity] || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 p-3 text-sm
                       focus:border-primary focus:ring-2 focus:ring-primary/20
                       resize-none"
            placeholder="Deskripsikan gambar yang ingin dihasilkan..."
          />
          <p className="text-xs text-gray-500">
            💡 Tips: Tambahkan detail seperti "wearing batik", "natural lighting", "photorealistic"
          </p>
        </div>
      )}
      
      {!isExpanded && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
          {value || defaultPrompts[activity]}
        </p>
      )}
    </div>
  )
}
```

### 4.5 ResultPreview Component

```jsx
// src/components/dokumentasi/ResultPreview.jsx

import { useState } from 'react'

export default function ResultPreview({ imageUrl, onDownload, onRegenerate, isGenerating }) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // Jika base64
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `dokumentasi-${Date.now()}.jpg`
        link.click()
      } 
      // Jika URL
      else {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dokumentasi-${Date.now()}.jpg`
        link.click()
        URL.revokeObjectURL(url)
      }
      
      onDownload?.()
    } catch (error) {
      console.error('Download error:', error)
      alert('Gagal download gambar')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        <p className="text-gray-600">Sedang generate gambar...</p>
        <p className="text-xs text-gray-500">Biasanya memakan waktu 5-15 detik</p>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 text-gray-400">
        <span className="material-symbols-outlined text-6xl">image</span>
        <p>Belum ada gambar</p>
        <p className="text-xs">Upload foto wajah dan pilih aktivitas untuk generate</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <img 
          src={imageUrl} 
          alt="Hasil generate" 
          className="w-full h-auto"
        />
        <div className="absolute top-2 right-2">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            ✅ Generated
          </span>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-white 
                     py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors
                     disabled:opacity-50"
        >
          <span className="material-symbols-outlined">download</span>
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
        
        <button
          onClick={onRegenerate}
          className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 
                     px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined">refresh</span>
          Ulang
        </button>
      </div>
    </div>
  )
}
```

### 4.6 Main Page Component

```jsx
// src/pages/DokumentasiAIPage.jsx

import { useState } from 'react'
import FaceUploader from '../components/dokumentasi/FaceUploader'
import ActivitySelector from '../components/dokumentasi/ActivitySelector'
import PromptEditor from '../components/dokumentasi/PromptEditor'
import ResultPreview from '../components/dokumentasi/ResultPreview'
import { generateDocumentationImage } from '../services/imageGenerator'

export default function DokumentasiAIPage() {
  const [faceImage, setFaceImage] = useState(null)
  const [activity, setActivity] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async () => {
    if (!activity) {
      alert('Pilih jenis kegiatan terlebih dahulu!')
      return
    }

    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      const image = await generateDocumentationImage({
        prompt: prompt || undefined,
        activity,
        faceImage,
        provider: 'gemini', // atau 'fal' untuk Flux Pro
      })
      
      setResult(image)
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setPrompt('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            Generate Foto Dokumentasi
          </h1>
          <p className="text-gray-600 mt-1">
            Buat foto dokumentasi kegiatan sekolah dengan AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <FaceUploader onImageUpload={setFaceImage} />
              
              <ActivitySelector 
                selected={activity} 
                onSelect={setActivity} 
              />
              
              {activity && (
                <PromptEditor 
                  value={prompt}
                  onChange={setPrompt}
                  activity={activity}
                />
              )}
              
              <button
                onClick={handleGenerate}
                disabled={!activity || isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white 
                           py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-primary/25"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">auto_awesome</span>
                    Generate Foto
                  </>
                )}
              </button>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm">
                  ❌ {error}
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Result */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <ResultPreview 
              imageUrl={result}
              isGenerating={isGenerating}
              onDownload={() => console.log('Downloaded')}
              onRegenerate={handleGenerate}
            />
          </div>
          
        </div>
      </div>
    </div>
  )
}
```

---

## 5. Integrasi ke App

### 5.1 Tambah Route

```jsx
// src/App.jsx atau src/routes.jsx

import DokumentasiAIPage from './pages/DokumentasiAIPage'

// Tambah route
<Route path="/dokumentasi-ai" element={<DokumentasiAIPage />} />
```

### 5.2 Tambah Menu Navigasi

```jsx
// src/components/Sidebar.jsx atau Navbar

{
  name: 'Generate Foto',
  path: '/dokumentasi-ai',
  icon: 'auto_awesome',
}
```

---

## 6. Testing & Deployment

### 6.1 Testing Locally

```bash
# 1. Setup environment variables
cp .env.example .env.local
# Isi GOOGLE_AI_KEY dengan API key dari AI Studio

# 2. Run development server
npm run dev

# 3. Buka http://localhost:5173/dokumentasi-ai

# 4. Test generate:
# - Upload foto selfie
# - Pilih aktivitas (rapat)
# - Klik Generate
# - Lihat hasil
```

### 6.2 Deploy ke Vercel

```bash
# 1. Push ke GitHub
git add .
git commit -m "feat: add dokumentasi AI page"
git push

# 2. Deploy ke Vercel
# Vercel akan otomatis detect dan deploy

# 3. Setup Environment Variables di Vercel Dashboard
# Settings → Environment Variables
# Tambahkan:
# - GOOGLE_AI_KEY = your_key_here
# - FAL_API_KEY = your_key_here

# 4. Test di production
# https://your-app.vercel.app/dokumentasi-ai
```

### 6.3 Monitoring Usage

```javascript
// Tambahkan logging untuk monitoring
async function generateDocumentationImage(params) {
  const startTime = Date.now()
  
  try {
    const result = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    const duration = Date.now() - startTime
    
    // Log ke console (bisa diganti ke analytics)
    console.log({
      event: 'image_generated',
      provider: params.provider,
      activity: params.activity,
      duration,
      success: result.ok,
    })
    
    return result.json()
    
  } catch (error) {
    console.error({
      event: 'image_generation_failed',
      provider: params.provider,
      error: error.message,
    })
    throw error
  }
}
```

---

## 📋 Checklist Implementasi

### Phase 1: Setup (Hari 1)
- [ ] Daftar Google AI Studio, dapat API key
- [ ] Setup environment variables
- [ ] Buat `api/generate-image.js`
- [ ] Test API dengan curl/postman

### Phase 2: Frontend (Hari 2-3)
- [ ] Buat `FaceUploader.jsx`
- [ ] Buat `ActivitySelector.jsx`
- [ ] Buat `PromptEditor.jsx`
- [ ] Buat `ResultPreview.jsx`
- [ ] Buat `DokumentasiAIPage.jsx`

### Phase 3: Integration (Hari 4)
- [ ] Tambah route ke App.jsx
- [ ] Tambah menu navigasi
- [ ] Integrasi service ke page
- [ ] Test end-to-end

### Phase 4: Polish (Hari 5)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Deploy ke Vercel

---

## 💰 Estimasi Biaya

### MVP (Google Gemini Free)

| Komponen | Biaya |
|:---|---:|
| Google AI Studio | $0 (free tier) |
| Vercel Hobby | $0 (free) |
| **Total** | **$0** 🎉 |

### Production (Google Imagen 3)

| Komponen | Biaya/bulan | Biaya/tahun |
|:---|---:|---:|
| Imagen 3 (20,000 images) | ~$0.07 | ~$0.80 |
| Vercel Hobby | $0 | $0 |
| **Total** | **~$0.07** | **~$0.80** |

---

## 🎯 Kesimpulan

> **Implementasi fitur generate foto SANGAT MUDAH dan MURAH:**
> 
> 1. **Setup:** 1 jam (daftar AI Studio + API key)
> 2. **Backend:** 2 jam (serverless function)
> 3. **Frontend:** 1-2 hari (5 komponen)
> 4. **Total:** 3-4 hari kerja
> 
> **Biaya: $0 untuk MVP (Google Gemini Free)!** 🎉

---

*Kurs: Rp 16.000/USD (per 26 Juli 2026)*
