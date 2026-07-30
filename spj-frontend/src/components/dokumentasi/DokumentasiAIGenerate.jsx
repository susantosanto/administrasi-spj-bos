/**
 * DokumentasiAIGenerate.jsx — Generate Foto Dokumentasi AI (USER FLOW V2)
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * USER FLOW V2 — FASE 2: GENERATE FOTO
 * ═══════════════════════════════════════════════════════════════════════
 * 
 * Langkah 1: Pilih Pakaian (Formal, Batik, Casual, Seragam)
 * Langkah 2: Pilih Suasana (Ruang Rapat, Outdoor, Aula, Kantor)
 * Langkah 3: Pilih Orang yang Hadir (centang dari daftar guru)
 * Langkah 4: Klik Generate → Preview A4 → Download/Cetak
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key)
 * 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image)
 * ═══════════════════════════════════════════════════════════════════════
 */
import { useState, useCallback, useRef, useEffect } from 'react'
import { generateDocumentationImage, ACTIVITY_PROMPTS } from '../../services/imageGenerator'
import { getSchoolData } from '../../utils/sekolahData'
import storageHelper from '../../utils/storageHelper'

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const PERSONEL_KEY = 'personel_photos'

const PAKAIAN_OPTIONS = [
  { id: 'formal', label: 'Formal', icon: 'checkroom', desc: 'Jas/blazer', color: 'bg-slate-100 border-slate-300 text-slate-700', activeColor: 'bg-slate-700 border-slate-700 text-white' },
  { id: 'batik', label: 'Batik', icon: 'palette', desc: 'Kemeja batik', color: 'bg-amber-50 border-amber-300 text-amber-700', activeColor: 'bg-amber-600 border-amber-600 text-white' },
  { id: 'casual', label: 'Casual', icon: 'checkroom', desc: 'Kaos/kemeja', color: 'bg-blue-50 border-blue-300 text-blue-700', activeColor: 'bg-blue-600 border-blue-600 text-white' },
  { id: 'seragam', label: 'Seragam', icon: 'badge', desc: 'Seragam dinas', color: 'bg-emerald-50 border-emerald-300 text-emerald-700', activeColor: 'bg-emerald-600 border-emerald-600 text-white' },
]

const SUASANA_OPTIONS = [
  { id: 'ruang_rapat', label: 'Ruang Rapat', icon: 'meeting_room', desc: 'Meja & kursi rapat', color: 'bg-cyan-50 border-cyan-300 text-cyan-700', activeColor: 'bg-cyan-600 border-cyan-600 text-white' },
  { id: 'outdoor', label: 'Outdoor', icon: 'park', desc: 'Taman/halaman', color: 'bg-green-50 border-green-300 text-green-700', activeColor: 'bg-green-600 border-green-600 text-white' },
  { id: 'aula', label: 'Aula', icon: 'stadium', desc: 'Aula besar', color: 'bg-violet-50 border-violet-300 text-violet-700', activeColor: 'bg-violet-600 border-violet-600 text-white' },
  { id: 'kantor', label: 'Kantor', icon: 'corporate_fare', desc: 'Ruang kerja', color: 'bg-indigo-50 border-indigo-300 text-indigo-700', activeColor: 'bg-indigo-600 border-indigo-600 text-white' },
]

const KATEGORI_TO_ACTIVITY = {
  MAMIN: 'mamin', ATK: 'atk', CETAK: 'pemeliharaan', HONOR: 'rapat',
  LISTRIK: 'pemeliharaan', INTERNET: 'pemeliharaan', PERPUS: 'rapat',
}

// ═══════════════════════════════════════════════════════════════════
// PREVIEW A4 COMPONENT
// ═══════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════
// A4 PAGE COMPONENT — 2 foto per halaman
// ═══════════════════════════════════════════════════════════════════

function A4Page({ pageNumber, totalPages, images, imageStartIndex, onEdit, onRemove }) {
  const sekolah = getSchoolData()
  const emptySlots = 2 - images.length

  return (
    <div className="space-y-2">
      {/* Page indicator */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Halaman {pageNumber} / {totalPages}</span>
        </div>
      )}

      {/* A4 Portrait Preview */}
      <div className="mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden" style={{ aspectRatio: '210 / 297', maxHeight: '70vh' }}>
        <div className="h-full flex flex-col p-[6%]">
          {/* Kop Surat */}
          <div className="border-b-2 border-double border-slate-800 pb-2 mb-3 text-center flex-shrink-0">
            <h2 className="text-[10px] font-bold text-slate-900 uppercase tracking-wide">{sekolah?.nama_sekolah || 'SD NEGERI ...'}</h2>
            <p className="text-[7px] text-slate-600 leading-tight">{sekolah?.alamat || 'Alamat Sekolah'}</p>
            <p className="text-[7px] text-slate-600 leading-tight">Telp: {sekolah?.telepon || '-'} | Email: {sekolah?.email || '-'}</p>
          </div>

          {/* Photo Grid — 2 slots at top, space at bottom */}
          <div className="flex flex-col gap-2" style={{ height: '75%' }}>
            {images.map((img, i) => {
              const globalIndex = imageStartIndex + i
              return (
                <div key={globalIndex} className="border border-slate-200 rounded flex items-center justify-center overflow-hidden bg-slate-50 relative group" style={{ height: '48%' }}>
                  <img src={img.dataUrl} alt={`Dokumentasi ${globalIndex + 1}`} className="max-w-full max-h-full object-contain p-1" />
                  {/* Overlay actions on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => onEdit(globalIndex)} className="px-2 py-1 bg-white/90 rounded text-[9px] font-bold text-slate-700 hover:bg-white shadow" title="Edit">
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button onClick={() => onRemove(globalIndex)} className="px-2 py-1 bg-red-500/90 rounded text-[9px] font-bold text-white hover:bg-red-600 shadow" title="Hapus">
                      <span className="material-symbols-outlined text-xs">delete</span>
                    </button>
                  </div>
                  {/* Number badge */}
                  <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-black/60 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                    {globalIndex + 1}
                  </span>
                </div>
              )
            })}
            {/* Empty slots */}
            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="border border-dashed border-slate-200 rounded flex items-center justify-center bg-slate-50/50" style={{ height: '48%' }}>
                <span className="text-[7px] text-slate-300 font-medium">Foto ke-{images.length + i + 1}</span>
              </div>
            ))}
          </div>
          {/* Space kosong di bawah — sisa ruang A4 */}
          <div className="flex-1" />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DokumentasiAIGenerate({ transaction }) {
  const [step, setStep] = useState('config') // config | generating | preview
  const [pakaian, setPakaian] = useState('formal')
  const [suasana, setSuasana] = useState('ruang_rapat')
  const [selectedOrang, setSelectedOrang] = useState({})
  const [images, setImages] = useState([]) // array of { dataUrl, prompt, pakaian, suasana, orangList, timestamp }
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [editingIndex, setEditingIndex] = useState(-1) // -1 = new, >=0 = edit existing

  // Load foto personel & guru list
  const personelPhotos = (() => { try { return JSON.parse(localStorage.getItem(PERSONEL_KEY) || '{}') } catch { return {} } })()
  const guruList = storageHelper.get('data_guru', []) || []

  const orangWithPhotos = guruList.filter(g => personelPhotos[g.nama]?.dataUrl)
  const orangHasPhotos = Object.keys(personelPhotos).length > 0

  const kategoriKey = transaction?.kategori?.key
  const activityKey = KATEGORI_TO_ACTIVITY[kategoriKey] || 'rapat'
  const activityConfig = ACTIVITY_PROMPTS[activityKey]

  const toggleOrang = (nama) => {
    setSelectedOrang(prev => ({ ...prev, [nama]: !prev[nama] }))
  }

  const selectedOrangList = Object.keys(selectedOrang).filter(k => selectedOrang[k])

  const buildPrompt = useCallback(() => {
    const pakaianLabel = PAKAIAN_OPTIONS.find(p => p.id === pakaian)?.label || 'Formal'
    const suasanaLabel = SUASANA_OPTIONS.find(s => s.id === suasana)?.label || 'Ruang Rapat'
    const uraian = transaction?.uraian || 'Kegiatan sekolah'
    return `${activityConfig?.defaultPrompt || ''} Pakaian: ${pakaianLabel}. Suasana: ${suasanaLabel}. Kegiatan: ${uraian}. Peserta: ${selectedOrangList.join(', ') || 'Guru-guru sekolah'}.`
  }, [pakaian, suasana, selectedOrangList, activityConfig, transaction])

  // Generate
  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const faceImage = personelPhotos.guru?.dataUrl || personelPhotos.kepsek?.dataUrl || personelPhotos.tendik?.dataUrl || null
      const image = await generateDocumentationImage({
        prompt: buildPrompt(),
        activity: activityKey,
        faceImage,
      })
      const newImage = {
        dataUrl: image,
        prompt: buildPrompt(),
        pakaian: PAKAIAN_OPTIONS.find(p => p.id === pakaian)?.label,
        suasana: SUASANA_OPTIONS.find(s => s.id === suasana)?.label,
        orangList: [...selectedOrangList],
        timestamp: Date.now(),
      }
      if (editingIndex >= 0) {
        // Update existing
        setImages(prev => prev.map((img, i) => i === editingIndex ? newImage : img))
        setEditingIndex(-1)
      } else {
        // Add new
        setImages(prev => [...prev, newImage])
      }
      setStep('preview')
    } catch (err) {
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    setStep('config')
    setError(null)
  }

  const handleAddPhoto = () => {
    // Reset config for new photo
    setPakaian('formal')
    setSuasana('ruang_rapat')
    setSelectedOrang({})
    setEditingIndex(-1)
    setStep('config')
  }

  const handleEditPhoto = (index) => {
    const img = images[index]
    if (!img) return
    // Restore config from saved image
    const pakOpt = PAKAIAN_OPTIONS.find(p => p.label === img.pakaian)
    const suaOpt = SUASANA_OPTIONS.find(s => s.label === img.suasana)
    if (pakOpt) setPakaian(pakOpt.id)
    if (suaOpt) setSuasana(suaOpt.id)
    const orang = {}
    img.orangList?.forEach(n => { orang[n] = true })
    setSelectedOrang(orang)
    setEditingIndex(index)
    setStep('config')
  }

  const handleRemovePhoto = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  // Paginate: 2 images per A4 page
  const pages = []
  for (let i = 0; i < images.length; i += 2) {
    pages.push(images.slice(i, i + 2))
  }
  // Always show at least 1 page in preview
  const showPreview = step === 'preview' && images.length > 0

  return (
    <div className="bg-gradient-to-br from-white to-violet-50/50 rounded-2xl border border-violet-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-blue-50 border-b border-violet-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">Generate Foto Dokumentasi AI</p>
            <p className="text-[10px] text-slate-500">Puter.js — Gratis, tanpa API key</p>
          </div>
          {images.length > 0 && (
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">{images.length} foto</span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Activity Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aktivitas:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
            <span className="material-symbols-outlined text-xs">{activityConfig?.icon || 'auto_awesome'}</span>
            {activityConfig?.name || 'Dokumentasi'}
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP CONFIG                                            */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 'config' && (
          <>
            {/* Langkah 1: Pilih Pakaian */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Pilih Pakaian
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {PAKAIAN_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPakaian(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      pakaian === opt.id ? opt.activeColor + ' shadow-md' : opt.color + ' hover:shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                    <span className="text-[10px] font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Langkah 2: Pilih Suasana */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Pilih Suasana
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {SUASANA_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSuasana(opt.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      suasana === opt.id ? opt.activeColor + ' shadow-md' : opt.color + ' hover:shadow-sm'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{opt.icon}</span>
                    <span className="text-[10px] font-bold">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Langkah 3: Pilih Orang yang Hadir */}
            <div>
              <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                Pilih Orang yang Hadir
                <span className="text-[9px] font-normal text-slate-400 ml-1">(opsional)</span>
              </h4>
              {!orangHasPhotos ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  Upload foto personel di Data Sekolah → Tab Foto Personel terlebih dahulu
                </div>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {/* Quick select */}
                  <div className="flex gap-1.5 mb-2">
                    <button onClick={() => {
                      const all = {}
                      orangWithPhotos.forEach(g => { all[g.nama] = true })
                      setSelectedOrang(all)
                    }} className="text-[9px] px-2 py-1 rounded-lg bg-violet-100 text-violet-600 font-semibold hover:bg-violet-200">Pilih Semua</button>
                    <button onClick={() => setSelectedOrang({})} className="text-[9px] px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold hover:bg-slate-200">Hapus Semua</button>
                  </div>
                  {orangWithPhotos.map((g) => (
                    <label key={g.nama} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                      selectedOrang[g.nama] ? 'bg-violet-100 border border-violet-300' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                    }`}>
                      <img src={personelPhotos[g.nama]?.dataUrl} alt={g.nama} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                      <span className="text-xs font-semibold text-slate-700 flex-1">{g.nama}</span>
                      <span className="text-[9px] text-slate-400">{g.jabatan || 'Guru'}</span>
                      <input type="checkbox" checked={!!selectedOrang[g.nama]} onChange={() => toggleOrang(g.nama)} className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-[11px] flex items-start gap-2">
                <span className="material-symbols-outlined text-sm shrink-0">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Langkah 4: Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-blue-600 
                         text-white py-3.5 rounded-xl text-sm font-semibold
                         shadow-lg shadow-violet-500/25 hover:brightness-110
                         transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              {editingIndex >= 0 ? 'Regenerate Foto' : 'Generate Foto'}
            </button>
            {editingIndex >= 0 && (
              <button onClick={() => { setEditingIndex(-1); setStep('preview') }} className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all">
                <span className="material-symbols-outlined text-sm">arrow_back</span> Batal
              </button>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP GENERATING                                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 'generating' && (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent mb-4" />
            <p className="text-sm font-semibold text-slate-700">Generating foto dokumentasi...</p>
            <p className="text-[11px] text-slate-400 mt-1">Tunggu 5-15 detik</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STEP PREVIEW — A4 PAGES                                */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 'preview' && images.length > 0 && (
          <>
            {/* A4 Pages */}
            {pages.map((pageImages, pageIndex) => (
              <A4Page
                key={pageIndex}
                pageNumber={pageIndex + 1}
                totalPages={pages.length}
                images={pageImages}
                imageStartIndex={pageIndex * 2}
                onEdit={handleEditPhoto}
                onRemove={handleRemovePhoto}
              />
            ))}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button onClick={handleAddPhoto} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-violet-500 text-white text-xs font-semibold hover:bg-violet-600 transition-all shadow-md shadow-violet-500/20">
                <span className="material-symbols-outlined text-sm">add_a_photo</span> Tambah Foto
              </button>
              <button onClick={() => {
                // Download all
                images.forEach((img, i) => {
                  const link = document.createElement('a')
                  link.href = img.dataUrl
                  link.download = `dokumentasi-${i + 1}-${transaction?.uraian?.slice(0, 20) || 'kegiatan'}.jpg`
                  link.click()
                })
              }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
                <span className="material-symbols-outlined text-sm">download</span> Download Semua
              </button>
              <button onClick={() => {
                // Print all pages
                const printWindow = window.open('', '_blank')
                if (!printWindow) return
                const sekolah = getSchoolData()
                let pagesHtml = ''
                pages.forEach((pageImages) => {
                  const slots = pageImages.map(img => `<div class="photo-slot"><img src="${img.dataUrl}" /></div>`).join('')
                  const emptySlots = 2 - pageImages.length
                  for (let i = 0; i < emptySlots; i++) {
                    slots
                  }
                  pagesHtml += `<div class="a4-page"><div class="header"><h2>${sekolah?.nama_sekolah || 'SD NEGERI ...'}</h2><p>${sekolah?.alamat || ''}</p><p>Telp: ${sekolah?.telepon || '-'} | Email: ${sekolah?.email || '-'}</p></div><div class="photo-grid">${pageImages.map(img => `<div class="photo-slot"><img src="${img.dataUrl}" /></div>`).join('')}${Array(emptySlots).fill('<div class="photo-slot empty"></div>').join('')}</div></div>`
                })
                printWindow.document.write(`<!DOCTYPE html><html><head><title>Dokumentasi LPJ</title><style>@page{size:A4 portrait;margin:15mm}*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;font-size:12pt;color:#000}.a4-page{width:210mm;height:297mm;padding:15mm;page-break-after:always}.header{text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:10px}.header h2{font-size:13pt;text-transform:uppercase}.header p{font-size:10pt;margin:1px 0}.photo-grid{display:flex;flex-direction:column;gap:8mm;margin-top:8mm}.photo-slot{flex:1;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;min-height:100mm}.photo-slot img{max-width:100%;max-height:100%;object-fit:contain}.photo-slot.empty{border:1px dashed #ccc}</style></head><body>${pagesHtml}</body></html>`)
                printWindow.document.close()
                printWindow.print()
              }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20">
                <span className="material-symbols-outlined text-sm">print</span> Cetak / PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
