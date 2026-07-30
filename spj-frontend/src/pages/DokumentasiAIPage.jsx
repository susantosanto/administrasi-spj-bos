/**
 * DokumentasiAIPage.jsx — Generate Foto Dokumentasi dengan AI
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key)
 * 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image) — lihat imageGenerator.js
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * User Flow:
 * 1. Upload foto wajah (selfie) — opsional
 * 2. Pilih jenis kegiatan (rapat/mamin/atk/pemeliharaan)
 * 3. Edit prompt (opsional)
 * 4. Klik Generate
 * 5. Lihat hasil + Download
 */
import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/ui/Toast'
import { generateDocumentationImage, resizeImage, ACTIVITY_PROMPTS } from '../services/imageGenerator'

export default function DokumentasiAIPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)

  // ── State ──
  const [faceImage, setFaceImage] = useState(null)
  const [activity, setActivity] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  // ── Handlers ──
  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar!')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const resized = await resizeImage(e.target.result, 512)
      setFaceImage(resized)
      toast.success('Foto wajah berhasil diupload!')
    }
    reader.readAsDataURL(file)
  }, [toast])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleGenerate = async () => {
    if (!activity) {
      toast.error('Pilih jenis kegiatan terlebih dahulu!')
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
      })

      setResult(image)
      toast.success('Foto berhasil digenerate!')
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.message || 'Gagal generate gambar')
      toast.error('Gagal generate: ' + (err.message || 'Coba lagi'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!result) return

    try {
      if (result.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = result
        link.download = `dokumentasi-${activity}-${Date.now()}.jpg`
        link.click()
      } else {
        const response = await fetch(result)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `dokumentasi-${activity}-${Date.now()}.jpg`
        link.click()
        URL.revokeObjectURL(url)
      }
      toast.success('Foto berhasil didownload!')
    } catch {
      toast.error('Gagal download gambar')
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
  }

  // ── Render ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">arrow_back</span>
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  Generate Foto Dokumentasi
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Buat foto dokumentasi kegiatan sekolah dengan AI
                </p>
              </div>
            </div>

            {/* Provider Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700">Puter.js (Gratis)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ═══ LEFT: Input ═══ */}
          <div className="space-y-5">
            
            {/* 1. Upload Foto Wajah */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Foto Wajah (Selfie) — <span className="text-slate-400 font-normal">Opsional</span>
              </label>
              
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative cursor-pointer rounded-xl border-2 border-dashed p-6
                  text-center transition-all duration-200
                  ${isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : faceImage
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-300 hover:border-primary hover:bg-slate-50'}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                  className="hidden"
                />
                
                {faceImage ? (
                  <div className="space-y-3">
                    <img 
                      src={faceImage} 
                      alt="Preview" 
                      className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg ring-2 ring-white"
                    />
                    <p className="text-sm text-emerald-600 font-medium">
                      ✅ Foto berhasil diupload
                    </p>
                    <p className="text-xs text-slate-400">Klik untuk ganti foto</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-4xl text-slate-300">
                      add_a_photo
                    </span>
                    <p className="text-sm text-slate-500">
                      Drag & drop foto atau <span className="text-primary font-medium">klik upload</span>
                    </p>
                    <p className="text-[11px] text-slate-400">JPG, PNG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Pilih Kegiatan */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Jenis Kegiatan <span className="text-red-400">*</span>
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ACTIVITY_PROMPTS).map(([key, act]) => (
                  <button
                    key={key}
                    onClick={() => setActivity(key)}
                    className={`
                      flex items-center gap-3 rounded-xl border-2 p-3 sm:p-4
                      text-left transition-all duration-200
                      ${activity === key 
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                    `}
                  >
                    <span className={`
                      material-symbols-outlined text-xl sm:text-2xl
                      ${activity === key ? 'text-primary' : 'text-slate-400'}
                    `}>
                      {act.icon}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs sm:text-sm font-semibold truncate ${activity === key ? 'text-primary' : 'text-slate-700'}`}>
                        {act.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                        {act.defaultPrompt.slice(0, 50)}...
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Edit Prompt */}
            {activity && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-bold text-slate-700">
                    Prompt (Deskripsi Gambar)
                  </label>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {prompt.length || ACTIVITY_PROMPTS[activity]?.defaultPrompt.length || 0} chars
                  </span>
                </div>
                
                <textarea
                  value={prompt || ACTIVITY_PROMPTS[activity]?.defaultPrompt || ''}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm
                             focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none
                             transition-all"
                  placeholder="Deskripsikan gambar yang ingin dihasilkan..."
                />
                <p className="text-[10px] text-slate-400 mt-2">
                  💡 Tips: Tambahkan detail seperti "wearing batik", "natural lighting", "photorealistic"
                </p>
              </div>
            )}

            {/* 4. Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!activity || isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 
                         text-white py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base
                         shadow-lg shadow-primary/25 hover:shadow-xl hover:brightness-110
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                         active:scale-[0.98]"
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

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>
          
          {/* ═══ RIGHT: Result ═══ */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Hasil Generate</h3>
            
            {/* Loading */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
                  <span className="material-symbols-outlined text-primary absolute inset-0 m-auto text-2xl">auto_awesome</span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">Sedang generate gambar...</p>
                  <p className="text-xs text-slate-400 mt-1">Biasanya memakan waktu 5-15 detik</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isGenerating && !result && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 text-slate-300">
                <span className="material-symbols-outlined text-7xl">image</span>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-400">Belum ada gambar</p>
                  <p className="text-xs text-slate-400 mt-1">Pilih aktivitas lalu klik Generate</p>
                </div>
              </div>
            )}

            {/* Result */}
            {!isGenerating && result && (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-200">
                  <img 
                    src={result} 
                    alt="Hasil generate" 
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      ✅ Generated
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-blue-600 
                               text-white py-3 rounded-xl font-semibold text-sm shadow-md
                               hover:brightness-110 transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Download
                  </button>
                  
                  <button
                    onClick={handleGenerate}
                    className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 
                               px-5 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">refresh</span>
                    Ulang
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors py-2"
                >
                  Reset & mulai dari awal
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}
