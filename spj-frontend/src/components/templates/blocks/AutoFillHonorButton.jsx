/**
 * AutoFillHonorButton — Button untuk auto-fill data guru/tendik ke dokumen honor
 */
import { useState, useEffect } from 'react'
import { getHonorDataByTemplate, getHonorStats, debugStorageInfo } from '../../../utils/honorHelper'
import { useToast } from '../../ui/Toast'

export default function AutoFillHonorButton({ templateId, onAutoFill }) {
  const [stats, setStats] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const toast = useToast()

  useEffect(() => {
    // Load stats on mount
    const honorStats = getHonorStats()
    setStats(honorStats)
  }, [])

  // Get count based on template
  const getCount = () => {
    if (!stats) return 0
    switch (templateId) {
      case 'honor_guru': return stats.guruHonorer
      case 'honor_tendik': return stats.tendikHonorer
      case 'honor_perpus': return stats.perpustakaan
      case 'honor_penjaga': return stats.penjaga
      default: return 0
    }
  }

  const getLabel = () => {
    switch (templateId) {
      case 'honor_guru': return 'Guru Honorer'
      case 'honor_tendik': return 'Tendik Honorer'
      case 'honor_perpus': return 'Staff Perpustakaan'
      case 'honor_penjaga': return 'Penjaga'
      default: return 'Data'
    }
  }

  const count = getCount()

  const handleAutoFill = () => {
    // Debug: log storage info
    debugStorageInfo()
    
    const data = getHonorDataByTemplate(templateId)
    if (data.length === 0) {
      toast.error(`Tidak ditemukan data ${getLabel()}. Pastikan sudah upload data guru/tendik di halaman Data Guru.`)
      return
    }
    onAutoFill(data)
    setShowConfirm(false)
    toast.success(`${data.length} data ${getLabel()} berhasil diisi otomatis`)
  }

  // Don't show if no data available
  // if (count === 0) return null

  return (
    <>
      <button
        onClick={() => {
          if (count === 0) {
            toast.error(`Belum ada data ${getLabel()}. Upload data guru/tendik terlebih dahulu.`)
            return
          }
          setShowConfirm(true)
        }}
        className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all active:scale-[0.98] ${
          count > 0 
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25' 
            : 'bg-slate-200 text-slate-500 cursor-not-allowed'
        }`}
      >
        <span className="material-symbols-outlined text-sm">auto_awesome</span>
        Auto Fill {getLabel()}
        <span className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
          {count} orang
        </span>
      </button>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-emerald-600">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Auto Fill Data</h3>
                <p className="text-sm text-slate-500">Isi data dari profil guru/tendik</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-700 mb-2">
                Akan mengisi <span className="font-bold text-emerald-600">{count} data {getLabel()}</span> ke dalam tabel:
              </p>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Nama PTK</li>
                <li>• NUPTK</li>
                <li>• Jabatan</li>
                <li>• Golongan/Ruang</li>
              </ul>
              <p className="text-xs text-amber-600 mt-3">
                ⚠️ Data yang sudah ada akan ditambahkan di bawahnya.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleAutoFill}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm">check</span>
                Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
