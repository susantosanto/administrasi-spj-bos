/**
 * DokumentasiAIGenerate.jsx — Generate Foto Dokumentasi AI di BKU Sidebar
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key)
 * 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image) — lihat imageGenerator.js
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Flow:
 * 1. Auto-detect aktivitas dari transaksi BKU
 * 2. Load foto personel dari Data Sekolah
 * 3. Generate foto dokumentasi
 * 4. Hasil ditambahkan ke uploadedPhotos
 */
import { useState, useCallback } from 'react'
import { generateDocumentationImage, ACTIVITY_PROMPTS } from '../../services/imageGenerator'

const STORAGE_KEY = 'personel_photos'

// Map kategori BKU → aktivitas generate
const KATEGORI_TO_ACTIVITY = {
  MAMIN: 'mamin',
  ATK: 'atk',
  CETAK: 'pemeliharaan',
  HONOR: 'rapat',
  LISTRIK: 'pemeliharaan',
  INTERNET: 'pemeliharaan',
  PERPUS: 'rapat',
}

function loadPersonelPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

export default function DokumentasiAIGenerate({ transaction, uploadedPhotos }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [prompt, setPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)

  // Auto-detect aktivitas dari transaksi
  const kategoriKey = transaction?.kategori?.key
  const activityKey = KATEGORI_TO_ACTIVITY[kategoriKey] || 'rapat'
  const activityConfig = ACTIVITY_PROMPTS[activityKey]

  // Load foto personel
  const personelPhotos = loadPersonelPhotos()
  const hasPersonel = Object.keys(personelPhotos).length > 0

  // Build prompt dari uraian transaksi
  const defaultPrompt = `Dokumentasi foto kegiatan: ${transaction?.uraian || 'Kegiatan sekolah'}. ${activityConfig?.defaultPrompt || ''}`

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    setResult(null)

    try {
      // Ambil foto personel pertama yang tersedia sebagai face image
      const faceImage = personelPhotos.kepsek?.dataUrl || 
                       personelPhotos.guru?.dataUrl || 
                       personelPhotos.tendik?.dataUrl || null

      const image = await generateDocumentationImage({
        prompt: prompt || defaultPrompt,
        activity: activityKey,
        faceImage,
      })

      setResult(image)
    } catch (err) {
      console.error('Generate error:', err)
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, defaultPrompt, activityKey, personelPhotos])

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement('a')
    link.href = result
    link.download = `dokumentasi-${transaction?.uraian?.slice(0, 30) || 'kegiatan'}-${Date.now()}.jpg`
    link.click()
  }

  const handleAddToPhotos = () => {
    // Dispatch event agar BKUSidebar menerima foto baru
    window.dispatchEvent(new CustomEvent('addGeneratedPhoto', {
      detail: {
        id: `ai-${Date.now()}`,
        name: `AI-${activityConfig?.name || 'Dokumentasi'}.jpg`,
        dataUrl: result,
        caption: transaction?.uraian || 'Foto dokumentasi AI',
        isAI: true,
      },
    }))
    setResult(null)
    setPrompt('')
  }

  return (
    <div className="bg-gradient-to-br from-white to-violet-50/50 rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-violet-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Generate Foto Dokumentasi AI</p>
            <p className="text-[10px] text-slate-500">Puter.js — Gratis, tanpa API key</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Auto-detected Activity */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aktivitas:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xs">{activityConfig?.icon || 'auto_awesome'}</span>
            {activityConfig?.name || 'Dokumentasi'}
          </span>
        </div>

        {/* Personel Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${hasPersonel ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-[11px] text-slate-600">
            {hasPersonel 
              ? `${Object.keys(personelPhotos).length} foto personel tersedia`
              : 'Upload foto personel di Data Sekolah untuk hasil optimal'
            }
          </span>
        </div>

        {/* Custom Prompt Toggle */}
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-[10px] text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">{showPrompt ? 'expand_less' : 'expand_more'}</span>
          {showPrompt ? 'Sembunyikan' : 'Edit Prompt'}
        </button>

        {showPrompt && (
          <textarea
            value={prompt || defaultPrompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] focus:ring-2 focus:ring-violet-500 outline-none resize-none"
            placeholder="Deskripsi gambar yang ingin dihasilkan..."
          />
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-blue-600 
                     text-white py-3 rounded-xl text-sm font-semibold
                     shadow-lg shadow-violet-500/25 hover:brightness-110
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                     active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              Generate Foto
            </>
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden ring-1 ring-slate-200">
              <img src={result} alt="Hasil generate" className="w-full h-auto" />
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full shadow">
                ✅ Generated
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddToPhotos}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Tambah ke Foto
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all"
              >
                <span className="material-symbols-outlined text-sm">download</span>
              </button>
              <button
                onClick={handleGenerate}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-600 text-xs font-semibold hover:bg-violet-100 transition-all"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
