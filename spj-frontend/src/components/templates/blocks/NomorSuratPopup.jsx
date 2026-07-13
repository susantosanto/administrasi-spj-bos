/**
 * NomorSuratPopup — Popup untuk Generate Nomor Surat
 * Muncul saat hover/click pada field nomor surat
 */
import { useState, useEffect, useRef } from 'react'
import { 
  KODE_SURAT, 
  saveNomorSurat, 
  buildNomorSurat,
  generateNomorSuratStandar,
  getNextNumberStandar,
  getFormatSegments,
  KODE_PENDEK_TO_KLASIFIKASI
} from '../../../utils/nomorSuratHelper'
import { useToast } from '../../ui/Toast'

// Default nama sekolah (sama dengan menu Nomor Surat)
const NAMA_SEKOLAH_DEFAULT = 'SDN-PSR'

export default function NomorSuratPopup({ onSelect, onClose, currentNomor, bulan, tahun }) {
  const [selectedKode, setSelectedKode] = useState('STS')
  const [preview, setPreview] = useState('')
  const [nextNum, setNextNum] = useState(1)
  const [customNomor, setCustomNomor] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const toast = useToast()
  const popupRef = useRef(null)

  // Dokumen bulan/tahun (dari HeaderDokumen) atau default bulan/tahun sekarang
  const b = bulan || (new Date().getMonth() + 1)
  const t = tahun || new Date().getFullYear()

  // Update preview when kode changes
  useEffect(() => {
    if (!useCustom) {
      try {
        const segs = getFormatSegments()
        const klasifikasi = KODE_PENDEK_TO_KLASIFIKASI[selectedKode] || '421.3'
        const nomor = buildNomorSurat({
          kodeKlasifikasi: klasifikasi,
          kodePendek: selectedKode,
          namaSekolah: NAMA_SEKOLAH_DEFAULT,
          bulan: b,
          tahun: t,
          formatSegments: segs
        })
        setPreview(nomor)
        setNextNum(getNextNumberStandar(klasifikasi, b, t))
      } catch (err) {
        setPreview('Error: ' + err.message)
      }
    }
  }, [selectedKode, useCustom, b, t])

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleGenerate = () => {
    if (useCustom) {
      if (!customNomor.trim()) {
        toast.error('Masukkan nomor surat')
        return
      }
      onSelect(customNomor.trim())
    } else {
      try {
        const { nomor, record } = generateNomorSuratStandar({
          kodePendek: selectedKode,
          namaSekolah: NAMA_SEKOLAH_DEFAULT,
          bulan: b,
          tahun: t
        })
        saveNomorSurat(record)
        onSelect(nomor)
        toast.success(`Nomor surat ${nomor} berhasil digenerate`)
      } catch (err) {
        toast.error(err.message)
      }
    }
    onClose()
  }

  const handlePreview = () => {
    if (!useCustom) {
      const segs = getFormatSegments()
      const klasifikasi = KODE_PENDEK_TO_KLASIFIKASI[selectedKode] || '421.3'
      setPreview(buildNomorSurat({
        kodeKlasifikasi: klasifikasi,
        kodePendek: selectedKode,
        namaSekolah: NAMA_SEKOLAH_DEFAULT,
        bulan: b,
        tahun: t,
        formatSegments: segs
      }))
    }
  }

  return (
    <div 
      ref={popupRef}
      className="fixed z-[300] bg-white rounded-2xl shadow-2xl border border-slate-200 w-[380px] animate-in slide-in-from-top-2 fade-in duration-200"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-blue-600">pin</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Generate Nomor Surat</h3>
              <p className="text-[10px] text-slate-500">Pilih kategori atau masukkan manual</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/80 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Toggle Manual/Otomatis */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setUseCustom(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              !useCustom 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">auto_awesome</span>
            Otomatis
          </button>
          <button
            onClick={() => setUseCustom(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              useCustom 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">edit</span>
            Manual
          </button>
        </div>

        {useCustom ? (
          /* Manual Input */
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Nomor Surat
              </label>
              <input
                type="text"
                value={customNomor}
                onChange={(e) => setCustomNomor(e.target.value)}
                placeholder="422.1/SK-001/SDN-PSR/VII/2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Masukkan nomor surat sesuai format yang diinginkan
            </p>
          </div>
        ) : (
          /* Otomatis */
          <div className="space-y-3">
            {/* Kode Surat Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Kategori Surat
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(KODE_SURAT).map((kode) => (
                  <button
                    key={kode.kode}
                    onClick={() => setSelectedKode(kode.kode)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selectedKode === kode.kode
                        ? 'bg-blue-50 border-2 border-blue-400 shadow-sm'
                        : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                      selectedKode === kode.kode
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {kode.kode}
                    </span>
                    <div>
                      <p className={`text-xs font-medium ${
                        selectedKode === kode.kode ? 'text-blue-700' : 'text-slate-700'
                      }`}>
                        {kode.nama}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        Next: {getNextNumberStandar(KODE_PENDEK_TO_KLASIFIKASI[kode.kode] || '421.3', b, t)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Preview Nomor
                </span>
                <span className="text-[10px] text-blue-500 font-medium">
                  Urutan ke-{nextNum}
                </span>
              </div>
              <p className="text-lg font-bold text-slate-800 font-mono tracking-wide">
                {preview}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            {useCustom ? 'Gunakan' : 'Generate & Gunakan'}
          </button>
        </div>
      </div>
    </div>
  )
}
