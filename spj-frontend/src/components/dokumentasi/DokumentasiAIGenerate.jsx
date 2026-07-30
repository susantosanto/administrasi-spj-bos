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

function PreviewA4({ imageUrl, transaction, pakaian, suasana, orangList, onDownload, onPrint, onRegenerate, onBack }) {
  const previewRef = useRef(null)
  const sekolah = getSchoolData()

  const handleDownloadJpg = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `dokumentasi-${transaction?.uraian?.slice(0, 30) || 'kegiatan'}-${Date.now()}.jpg`
    link.click()
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Dokumentasi LPJ</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #000; }
        .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 14pt; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 11pt; }
        .content { margin: 20px 0; }
        .photo { text-align: center; margin: 20px 0; }
        .photo img { max-width: 80%; max-height: 400px; border: 1px solid #ccc; }
        .caption { text-align: center; font-style: italic; margin-top: 10px; }
        .info { margin: 15px 0; }
        .info table { width: 100%; border-collapse: collapse; }
        .info td { padding: 4px 8px; vertical-align: top; }
        .info td:first-child { font-weight: bold; width: 150px; }
        .signature { margin-top: 40px; text-align: right; }
        .signature p { margin: 2px 0; }
      </style></head><body>
      <div class="header">
        <h2>${sekolah?.nama_sekolah || 'SD NEGERI ...'}</h2>
        <p>${sekolah?.alamat || 'Alamat Sekolah'}</p>
        <p>Telp: ${sekolah?.telepon || '-'} | Email: ${sekolah?.email || '-'}</p>
      </div>
      <div class="content">
        <h3 style="text-align:center; text-decoration:underline;">DOKUMENTASI KEGIATAN</h3>
        <div class="photo"><img src="${imageUrl}" /></div>
        <div class="caption">Foto: ${transaction?.uraian || 'Kegiatan Sekolah'}</div>
        <div class="info">
          <table>
            <tr><td>Kegiatan</td><td>: ${transaction?.uraian || '-'}</td></tr>
            <tr><td>Tanggal</td><td>: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
            <tr><td>Pakaian</td><td>: ${pakaian || '-'}</td></tr>
            <tr><td>Suasana</td><td>: ${suasana || '-'}</td></tr>
            <tr><td>Peserta</td><td>: ${orangList?.join(', ') || '-'}</td></tr>
          </table>
        </div>
        <div class="signature">
          <p>${sekolah?.kota || 'Kota'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Kepala Sekolah,</p>
          <br /><br />
          <p><strong>${sekolah?.kepala_sekolah || '................'}</strong></p>
          <p>NIP. ${sekolah?.nip_kepala || '................'}</p>
        </div>
      </div>
      </body></html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-4">
      {/* A4 Preview */}
      <div ref={previewRef} className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Kop Surat */}
        <div className="border-b-4 border-double border-slate-800 px-6 py-4 text-center">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{sekolah?.nama_sekolah || 'SD NEGERI ...'}</h2>
          <p className="text-[10px] text-slate-600">{sekolah?.alamat || 'Alamat Sekolah'}</p>
          <p className="text-[10px] text-slate-600">Telp: {sekolah?.telepon || '-'} | Email: {sekolah?.email || '-'}</p>
        </div>

        {/* Foto */}
        <div className="px-6 py-4">
          <h3 className="text-xs font-bold text-center underline mb-3">DOKUMENTASI KEGIATAN</h3>
          <div className="flex justify-center">
            <img src={imageUrl} alt="Dokumentasi" className="max-w-full max-h-64 object-contain rounded-lg border border-slate-200 shadow" />
          </div>
          <p className="text-[10px] text-center text-slate-500 italic mt-2">Foto: {transaction?.uraian || 'Kegiatan Sekolah'}</p>
        </div>

        {/* Info Table */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200">
          <table className="w-full text-[10px]">
            <tbody>
              <tr><td className="font-bold w-24 py-0.5">Kegiatan</td><td className="py-0.5">: {transaction?.uraian || '-'}</td></tr>
              <tr><td className="font-bold py-0.5">Tanggal</td><td className="py-0.5">: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
              <tr><td className="font-bold py-0.5">Pakaian</td><td className="py-0.5">: {pakaian || '-'}</td></tr>
              <tr><td className="font-bold py-0.5">Suasana</td><td className="py-0.5">: {suasana || '-'}</td></tr>
              <tr><td className="font-bold py-0.5">Peserta</td><td className="py-0.5">: {orangList?.join(', ') || '-'}</td></tr>
            </tbody>
          </table>
        </div>

        {/* Tanda Tangan */}
        <div className="px-6 py-4 text-right">
          <p className="text-[10px] text-slate-600">{sekolah?.kota || 'Kota'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="text-[10px] text-slate-600">Kepala Sekolah,</p>
          <div className="h-12" />
          <p className="text-[10px] font-bold text-slate-900">{sekolah?.kepala_sekolah || '................'}</p>
          <p className="text-[10px] text-slate-600">NIP. {sekolah?.nip_kepala || '................'}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all">
          <span className="material-symbols-outlined text-sm">arrow_back</span> Kembali
        </button>
        <button onClick={handleDownloadJpg} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20">
          <span className="material-symbols-outlined text-sm">download</span> Download JPG
        </button>
        <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20">
          <span className="material-symbols-outlined text-sm">print</span> Cetak / PDF
        </button>
      </div>
      <button onClick={onRegenerate} className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-600 text-xs font-semibold hover:bg-violet-100 transition-all">
        <span className="material-symbols-outlined text-sm">refresh</span> Generate Ulang (Pilih Pakaian/Suasana Lain)
      </button>
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
  const [imageUrl, setImageUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Load foto personel & guru list
  const personelPhotos = (() => { try { return JSON.parse(localStorage.getItem(PERSONEL_KEY) || '{}') } catch { return {} } })()
  const guruList = storageHelper.get('data_guru', []) || []

  // Build orang list dari guru yang punya foto
  const orangWithPhotos = guruList.filter(g => personelPhotos[g.nama]?.dataUrl)
  const orangHasPhotos = Object.keys(personelPhotos).length > 0

  // Auto-detect
  const kategoriKey = transaction?.kategori?.key
  const activityKey = KATEGORI_TO_ACTIVITY[kategoriKey] || 'rapat'
  const activityConfig = ACTIVITY_PROMPTS[activityKey]

  const toggleOrang = (nama) => {
    setSelectedOrang(prev => ({ ...prev, [nama]: !prev[nama] }))
  }

  const selectedOrangList = Object.keys(selectedOrang).filter(k => selectedOrang[k])

  // Build prompt
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
      setImageUrl(image)
      setStep('preview')
    } catch (err) {
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleBack = () => {
    setStep('config')
    setImageUrl(null)
    setError(null)
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
              Generate Foto
            </button>
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
        {/* STEP PREVIEW                                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        {step === 'preview' && imageUrl && (
          <PreviewA4
            imageUrl={imageUrl}
            transaction={transaction}
            pakaian={PAKAIAN_OPTIONS.find(p => p.id === pakaian)?.label}
            suasana={SUASANA_OPTIONS.find(s => s.id === suasana)?.label}
            orangList={selectedOrangList}
            onBack={handleBack}
            onRegenerate={handleBack}
          />
        )}
      </div>
    </div>
  )
}
