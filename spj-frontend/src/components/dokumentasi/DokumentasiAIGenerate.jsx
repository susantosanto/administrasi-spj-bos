/**
 * DokumentasiAIGenerate.jsx — Generate Foto Dokumentasi AI (Sprint 019 revisi)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * REVISI USER 2026-10-23:
 * 1. Foto hasil generate TIDAK lagi punya panel A4 sendiri — masuk ke
 *    Panel Preview utama (Zona B) lewat state bersama `useFotoDokumen`.
 *    Komponen ini hanya: konfigurasi → generate → foto masuk daftar bersama.
 * 2. Tombol disamakan dengan desain tombol aplikasi (blue-only #004ac6 +
 *    slate, rounded-xl, font-bold) — sebelumnya violet/amber/emerald
 *    (pelanggaran aturan warna). Pembeda premium: gradient primary→blue +
 *    ikon auto_awesome + chip "AI" (keluarga tombol Cetak panel).
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key) · 🔴 FUTURE: Flux Pro via fal.ai
 */
import { useState, useCallback } from 'react'
import { generateDocumentationImage, ACTIVITY_PROMPTS } from '../../services/imageGenerator'
import storageHelper from '../../utils/storageHelper'

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS — opsi chip: satu gaya (slate netral / primary terpilih)
// ═══════════════════════════════════════════════════════════════════

const PERSONEL_KEY = 'personel_photos'

const PAKAIAN_OPTIONS = [
  { id: 'formal', label: 'Formal', icon: 'checkroom' },
  { id: 'batik', label: 'Batik', icon: 'palette' },
  { id: 'casual', label: 'Casual', icon: 'checkroom' },
  { id: 'seragam', label: 'Seragam', icon: 'badge' },
]

const SUASANA_OPTIONS = [
  { id: 'ruang_rapat', label: 'Ruang Rapat', icon: 'meeting_room' },
  { id: 'outdoor', label: 'Outdoor', icon: 'park' },
  { id: 'aula', label: 'Aula', icon: 'stadium' },
  { id: 'kantor', label: 'Kantor', icon: 'corporate_fare' },
]

const KATEGORI_TO_ACTIVITY = {
  MAMIN: 'mamin', ATK: 'atk', CETAK: 'pemeliharaan', HONOR: 'rapat',
  LISTRIK: 'pemeliharaan', INTERNET: 'pemeliharaan', PERPUS: 'rapat',
}

/** Chip pilihan (pakaian/suasana) — gaya tombol aplikasi, blue-only. */
function ChipOpsi({ opt, aktif, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
        aktif
          ? 'bg-primary border-primary text-white shadow-md shadow-primary/25'
          : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400 hover:text-primary'
      }`}
    >
      <span className="material-symbols-outlined text-xl">{opt.icon}</span>
      <span className="text-[10px] font-bold">{opt.label}</span>
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function DokumentasiAIGenerate({
  transaction,
  fotoAi = [],
  onFotoBaru,
  onRegenerasiFoto,
  onHapusFoto,
}) {
  const [pakaian, setPakaian] = useState('formal')
  const [suasana, setSuasana] = useState('ruang_rapat')
  const [selectedOrang, setSelectedOrang] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null) // null = foto baru, id = regenerate
  const [suksesId, setSuksesId] = useState(null) // id foto terakhir yang berhasil

  const personelPhotos = (() => { try { return JSON.parse(localStorage.getItem(PERSONEL_KEY) || '{}') } catch { return {} } })()
  const guruList = storageHelper.get('data_guru', []) || []
  const orangWithPhotos = guruList.filter((g) => personelPhotos[g.nama]?.dataUrl)
  const orangHasPhotos = Object.keys(personelPhotos).length > 0

  const activityKey = KATEGORI_TO_ACTIVITY[transaction?.kategori?.key] || 'rapat'
  const activityConfig = ACTIVITY_PROMPTS[activityKey]
  const selectedOrangList = Object.keys(selectedOrang).filter((k) => selectedOrang[k])

  const buildPrompt = useCallback(() => {
    const pakaianLabel = PAKAIAN_OPTIONS.find((p) => p.id === pakaian)?.label || 'Formal'
    const suasanaLabel = SUASANA_OPTIONS.find((s) => s.id === suasana)?.label || 'Ruang Rapat'
    const uraian = transaction?.uraian || 'Kegiatan sekolah'
    return `${activityConfig?.defaultPrompt || ''} Pakaian: ${pakaianLabel}. Suasana: ${suasanaLabel}. Kegiatan: ${uraian}. Peserta: ${selectedOrangList.join(', ') || 'Guru-guru sekolah'}.`
  }, [pakaian, suasana, selectedOrangList, activityConfig, transaction])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      const faceImage = personelPhotos.guru?.dataUrl || personelPhotos.kepsek?.dataUrl || personelPhotos.tendik?.dataUrl || null
      const image = await generateDocumentationImage({ prompt: buildPrompt(), activity: activityKey, faceImage })
      const foto = {
        dataUrl: image,
        prompt: buildPrompt(),
        pakaian: PAKAIAN_OPTIONS.find((p) => p.id === pakaian)?.label,
        suasana: SUASANA_OPTIONS.find((s) => s.id === suasana)?.label,
        orangList: [...selectedOrangList],
        timestamp: Date.now(),
      }
      let id
      if (editingId) {
        onRegenerasiFoto(editingId, foto)
        id = editingId
      } else {
        id = onFotoBaru(foto)
      }
      setSuksesId(id)
      setEditingId(null)
    } catch (err) {
      setError(err.message || 'Gagal generate gambar')
    } finally {
      setIsGenerating(false)
    }
  }

  /** Regenerate: pulihkan konfigurasi dari meta foto lama, lalu generate menimpa. */
  const mulaiRegenerasi = (foto) => {
    const pakOpt = PAKAIAN_OPTIONS.find((p) => p.label === foto.pakaian)
    const suaOpt = SUASANA_OPTIONS.find((s) => s.label === foto.suasana)
    if (pakOpt) setPakaian(pakOpt.id)
    if (suaOpt) setSuasana(suaOpt.id)
    const orang = {}
    foto.orangList?.forEach((n) => { orang[n] = true })
    setSelectedOrang(orang)
    setEditingId(foto.id)
    setSuksesId(null)
    setError(null)
  }

  return (
    <div className="bg-white rounded-2xl border border-primary/25 shadow-sm overflow-hidden">
      {/* Header — premium: aksen gradient primary + chip AI */}
      <div className="px-5 py-4 bg-gradient-to-r from-primary/5 to-blue-50/60 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-md shadow-primary/30">
            <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
              Generate Foto Dokumentasi AI
              <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold tracking-wider">AI</span>
            </p>
            <p className="text-[10px] text-slate-500">Fitur premium — foto langsung masuk Panel Preview</p>
          </div>
          {fotoAi.length > 0 && (
            <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold">{fotoAi.length} foto</span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Aktivitas */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Aktivitas:</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            <span className="material-symbols-outlined text-xs">{activityConfig?.icon || 'auto_awesome'}</span>
            {activityConfig?.name || 'Dokumentasi'}
          </span>
        </div>

        {/* Langkah 1: Pakaian */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">1</span>
            Pilih Pakaian
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {PAKAIAN_OPTIONS.map((opt) => (
              <ChipOpsi key={opt.id} opt={opt} aktif={pakaian === opt.id} onClick={() => setPakaian(opt.id)} />
            ))}
          </div>
        </div>

        {/* Langkah 2: Suasana */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">2</span>
            Pilih Suasana
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {SUASANA_OPTIONS.map((opt) => (
              <ChipOpsi key={opt.id} opt={opt} aktif={suasana === opt.id} onClick={() => setSuasana(opt.id)} />
            ))}
          </div>
        </div>

        {/* Langkah 3: Orang yang hadir */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">3</span>
            Pilih Orang yang Hadir
            <span className="text-[9px] font-normal text-slate-400 ml-1">(opsional)</span>
          </h4>
          {!orangHasPhotos ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-slate-400">info</span>
              Upload foto personel di Data Sekolah → Tab Foto Personel terlebih dahulu
            </div>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              <div className="flex gap-1.5 mb-2">
                <button type="button" onClick={() => {
                  const all = {}
                  orangWithPhotos.forEach((g) => { all[g.nama] = true })
                  setSelectedOrang(all)
                }} className="text-[9px] px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">Pilih Semua</button>
                <button type="button" onClick={() => setSelectedOrang({})} className="text-[9px] px-2 py-1 rounded-lg bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">Hapus Semua</button>
              </div>
              {orangWithPhotos.map((g) => (
                <label key={g.nama} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                  selectedOrang[g.nama] ? 'bg-primary/10 border border-primary/40' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                }`}>
                  <img src={personelPhotos[g.nama]?.dataUrl} alt={g.nama} className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200" />
                  <span className="text-xs font-semibold text-slate-700 flex-1">{g.nama}</span>
                  <span className="text-[9px] text-slate-400">{g.jabatan || 'Guru'}</span>
                  <input type="checkbox" checked={!!selectedOrang[g.nama]} onChange={() => setSelectedOrang((prev) => ({ ...prev, [g.nama]: !prev[g.nama] }))} className="w-4 h-4 rounded border-slate-300 accent-[#004ac6]" />
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-slate-50 border border-slate-300 text-slate-700 p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0 text-slate-500">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Sukses — foto sudah masuk Panel Preview */}
        {suksesId && !isGenerating && (
          <div className="bg-primary/5 border border-primary/20 text-primary p-3 rounded-xl text-[11px] flex items-start gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
            <span>Foto masuk ke <span className="font-bold">Panel Preview Document</span> — lihat di panel sebelah kanan.</span>
          </div>
        )}

        {/* Tombol Generate — keluarga tombol aplikasi + pembeda premium */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl text-sm font-bold text-white
                     bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30
                     ring-1 ring-primary/20 hover:brightness-110 transition-all
                     disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg">auto_awesome</span>
          {editingId ? 'Regenerate Foto' : 'Generate Foto'}
          <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[9px] font-bold tracking-wider">AI</span>
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setError(null) }} className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined text-base">close</span> Batal Regenerate
          </button>
        )}

        {/* Generating */}
        {isGenerating && (
          <div className="flex flex-col items-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mb-3" />
            <p className="text-sm font-semibold text-slate-700">Generating foto dokumentasi...</p>
            <p className="text-[11px] text-slate-400 mt-1">Tunggu 5-15 detik</p>
          </div>
        )}

        {/* Daftar foto AI (regenerate per foto) — hapus lewat daftar gabungan di atas */}
        {fotoAi.length > 0 && !isGenerating && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Foto AI di Panel Preview</p>
            {fotoAi.map((f) => (
              <div key={f.id} className={`flex items-center gap-2 rounded-xl p-2 border transition-all ${
                editingId === f.id ? 'bg-primary/10 border-primary/40' : 'bg-slate-50 border-slate-200'
              }`}>
                <img src={f.dataUrl} alt={f.caption || 'Foto AI'} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                <span className="text-[11px] text-slate-600 flex-1 min-w-0 truncate">
                  {f.pakaian || 'Formal'} · {f.suasana || 'Ruang Rapat'}{f.orangList?.length ? ` · ${f.orangList.length} orang` : ''}
                </span>
                <button type="button" onClick={() => mulaiRegenerasi(f)} title="Regenerate dengan konfigurasi foto ini" className="p-1.5 rounded-lg text-primary hover:bg-primary/10 flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                </button>
                <button type="button" onClick={() => { if (onHapusFoto) onHapusFoto(f.id); if (editingId === f.id) setEditingId(null) }} title="Hapus" className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
