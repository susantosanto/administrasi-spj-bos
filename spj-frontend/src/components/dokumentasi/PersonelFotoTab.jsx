/**
 * PersonelFotoTab.jsx — Upload Foto untuk Generate Dokumentasi AI
 * 
 * ═══════════════════════════════════════════════════════════════════
 * USER FLOW V2 — FASE 1: SETUP DATA SEKOLAH
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Upload 3 kategori foto:
 * 1. Personel (Kepsek, Guru, Tendik, Pengawas)
 * 2. Ruangan (Ruang Rapat, Kelas, Kantor, Aula)
 * 3. Barang (ATK, Nasi Box, Snack Box)
 * 
 * Upload 1x, digunakan berulang kali.
 * Storage: localStorage
 */
import { useState, useRef, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'personel_photos'
const RUANGAN_KEY = 'ruangan_photos'
const BARANG_KEY = 'barang_photos'

// ═══════════════════════════════════════════════════════════════════
// DATA DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const PERSONEL_ROLES = [
  { id: 'kepsek', label: 'Kepala Sekolah', desc: 'Foto resmi berjas', icon: 'school', color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-200' },
  { id: 'guru', label: 'Guru', desc: 'Foto formal/selfie', icon: 'groups', color: 'bg-blue-50 text-blue-600', ring: 'ring-blue-200' },
  { id: 'tendik', label: 'Tenaga Kependidikan', desc: 'Foto formal/selfie', icon: 'badge', color: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200' },
  { id: 'pengawas', label: 'Pengawas Sekolah', desc: 'Opsional', icon: 'supervisor_account', color: 'bg-violet-50 text-violet-600', ring: 'ring-violet-200' },
]

const RUANGAN_TYPES = [
  { id: 'ruang_rapat', label: 'Ruang Rapat', desc: 'Foto asli ruangan rapat', icon: 'meeting_room', color: 'bg-cyan-50 text-cyan-600', ring: 'ring-cyan-200' },
  { id: 'ruang_kelas', label: 'Ruang Kelas', desc: 'Foto asli kelas', icon: 'class', color: 'bg-teal-50 text-teal-600', ring: 'ring-teal-200' },
  { id: 'ruang_kantor', label: 'Ruang Kantor', desc: 'Foto asli kantor', icon: 'corporate_fare', color: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200' },
  { id: 'aula', label: 'Aula', desc: 'Foto asli aula', icon: 'stadium', color: 'bg-rose-50 text-rose-600', ring: 'ring-rose-200' },
]

const BARANG_TYPES = [
  { id: 'atk', label: 'ATK', desc: 'Alat Tulis Kantor', icon: 'draw', color: 'bg-orange-50 text-orange-600', ring: 'ring-orange-200' },
  { id: 'nasi_box', label: 'Nasi Box', desc: 'Foto nasi box', icon: 'lunch_dining', color: 'bg-amber-50 text-amber-600', ring: 'ring-amber-200' },
  { id: 'snack_box', label: 'Snack Box', desc: 'Foto snack box', icon: 'bakery_dining', color: 'bg-pink-50 text-pink-600', ring: 'ring-pink-200' },
]

// ═══════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════

function loadJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') } catch { return {} }
}
function saveJson(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

function resizeImage(file, maxSize = 512) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize }
        else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize }
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

// ═══════════════════════════════════════════════════════════════════
// PHOTO CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

function PhotoCard({ item, photo, onUpload, onRemove }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`px-4 py-3 flex items-center gap-3 ${item.color}`}>
        <span className="material-symbols-outlined text-xl">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold block">{item.label}</span>
          <span className="text-[10px] opacity-70">{item.desc}</span>
        </div>
        {photo && <span className="px-2 py-0.5 bg-white/80 rounded text-[9px] font-bold">✓</span>}
      </div>
      <div className="p-4">
        {photo ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <img src={photo.dataUrl} alt={item.label} className="w-24 h-24 rounded-2xl object-cover shadow-lg ring-2 ring-slate-100" />
            </div>
            <p className="text-[10px] text-slate-400 text-center truncate">{photo.name}</p>
            <div className="flex gap-2">
              <button onClick={() => onUpload(item.id)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all">
                <span className="material-symbols-outlined text-sm">edit</span> Ganti
              </button>
              <button onClick={() => onRemove(item.id)} className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => onUpload(item.id)} className="w-full flex flex-col items-center justify-center py-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">add_a_photo</span>
            </div>
            <p className="text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors">Upload Foto</p>
            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG</p>
          </button>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// SECTION TABS
// ═══════════════════════════════════════════════════════════════════

const SECTIONS = [
  { id: 'personel', label: 'Personel', icon: 'badge' },
  { id: 'ruangan', label: 'Ruangan', icon: 'meeting_room' },
  { id: 'barang', label: 'Barang', icon: 'inventory_2' },
]

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function PersonelFotoTab() {
  const [activeSection, setActiveSection] = useState('personel')
  const [personelPhotos, setPersonelPhotos] = useState(() => loadJson(STORAGE_KEY))
  const [ruanganPhotos, setRuanganPhotos] = useState(() => loadJson(RUANGAN_KEY))
  const [barangPhotos, setBarangPhotos] = useState(() => loadJson(BARANG_KEY))
  const [uploadingId, setUploadingId] = useState(null)
  const [uploadSection, setUploadSection] = useState(null)
  const fileInputRef = useRef(null)

  // Persist
  useEffect(() => { saveJson(STORAGE_KEY, personelPhotos) }, [personelPhotos])
  useEffect(() => { saveJson(RUANGAN_KEY, ruanganPhotos) }, [ruanganPhotos])
  useEffect(() => { saveJson(BARANG_KEY, barangPhotos) }, [barangPhotos])

  const handleUpload = (section, id) => {
    setUploadingId(id)
    setUploadSection(section)
    fileInputRef.current?.click()
  }

  const handleRemove = (section, id) => {
    const setters = { personel: setPersonelPhotos, ruangan: setRuanganPhotos, barang: setBarangPhotos }
    const setter = setters[section]
    if (setter) {
      setter(prev => { const next = { ...prev }; delete next[id]; return next })
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !uploadingId || !uploadSection) { e.target.value = ''; return }
    const dataUrl = await resizeImage(file)
    const setters = { personel: setPersonelPhotos, ruangan: setRuanganPhotos, barang: setBarangPhotos }
    const setter = setters[uploadSection]
    if (setter) {
      setter(prev => ({ ...prev, [uploadingId]: { dataUrl, name: file.name, uploadedAt: Date.now() } }))
    }
    e.target.value = ''
    setUploadingId(null)
    setUploadSection(null)
  }

  const totalPhotos = Object.keys(personelPhotos).length + Object.keys(ruanganPhotos).length + Object.keys(barangPhotos).length

  const getPhotos = (section) => {
    return { personel: personelPhotos, ruangan: ruanganPhotos, barang: barangPhotos }[section] || {}
  }

  const getItems = (section) => {
    return { personel: PERSONEL_ROLES, ruangan: RUANGAN_TYPES, barang: BARANG_TYPES }[section] || []
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>photo_library</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Foto Referensi</h3>
            <p className="text-sm text-slate-500">Upload 1x, gunakan berkali-kali untuk Generate Dokumentasi AI</p>
          </div>
          {totalPhotos > 0 && (
            <div className="ml-auto px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">{totalPhotos} foto</div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
        <div className="text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Untuk apa foto ini?</p>
          <p>Foto-foto ini digunakan oleh fitur <strong>Generate Foto Dokumentasi AI</strong> di BKU Sidebar. 
            Foto wajah personel akan digabungkan dengan suasana ruangan dan barang untuk menghasilkan foto dokumentasi.</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-200 p-1.5">
        {SECTIONS.map((sec) => {
          const count = Object.keys(getPhotos(sec.id)).length
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeSection === sec.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{sec.icon}</span>
              {sec.label}
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                  activeSection === sec.id ? 'bg-white/20' : 'bg-slate-100'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {getItems(activeSection).map((item) => (
          <PhotoCard
            key={item.id}
            item={item}
            photo={getPhotos(activeSection)[item.id]}
            onUpload={(id) => handleUpload(activeSection, id)}
            onRemove={(id) => handleRemove(activeSection, id)}
          />
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-emerald-600 text-xl">check_circle</span>
          <div className="space-y-1">
            <p className="text-sm font-bold text-emerald-800">Ringkasan Upload</p>
            <div className="flex gap-4 text-xs text-emerald-700">
              <span>👤 Personel: {Object.keys(personelPhotos).length}/{PERSONEL_ROLES.length}</span>
              <span>🏫 Ruangan: {Object.keys(ruanganPhotos).length}/{RUANGAN_TYPES.length}</span>
              <span>📦 Barang: {Object.keys(barangPhotos).length}/{BARANG_TYPES.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
