/**
 * NomorSuratPopup — Popup Generator Nomor Surat (Minimalist Premium)
 * Format: [Klasifikasi]/[Kode Surat]-[Nomor]/[Nama SD]/[Bulan]/[Tahun]
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
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div
        ref={popupRef}
        className="w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* Header — minimalis */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Nomor Surat</h3>
            <p className="text-[11px] text-slate-400">Generate nomor otomatis</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400 text-lg">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Toggle Otomatis / Manual */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setUseCustom(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !useCustom ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              Otomatis
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                useCustom ? 'bg-white text-primary shadow-sm' : 'text-slate-500'
              }`}
            >
              Manual
            </button>
          </div>

          {useCustom ? (
            <div className="space-y-2">
              <input
                type="text"
                value={customNomor}
                onChange={(e) => setCustomNomor(e.target.value)}
                placeholder="422.1/SK-001/SDN-PSR/VII/2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400">Masukkan nomor sesuai format yang diinginkan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Kategori Surat — pill compact */}
              <div className="flex flex-wrap gap-1.5">
                {Object.values(KODE_SURAT).map((kode) => (
                  <button
                    key={kode.kode}
                    onClick={() => setSelectedKode(kode.kode)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                      selectedKode === kode.kode
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {kode.kode}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="bg-slate-50 rounded-xl py-4 px-3 text-center border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Preview · Urutan ke-{nextNum}
                </p>
                <p className="text-lg font-bold text-slate-800 font-mono tracking-wide break-all">
                  {preview}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 py-2.5 bg-gradient-to-r from-primary to-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98]"
          >
            {useCustom ? 'Gunakan' : 'Generate & Gunakan'}
          </button>
        </div>
      </div>
    </div>
  )
}
