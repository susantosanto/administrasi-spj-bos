/**
 * PersonelFotoTab.jsx — Upload Foto Personel untuk Generate Dokumentasi AI
 * 
 * Upload foto: Kepala Sekolah, Guru, Tendik, Pengawas
 * Foto ini digunakan oleh fitur Generate Foto Dokumentasi di BKU Sidebar.
 * 
 * Storage: localStorage (key: personel_photos)
 */
import { useState, useRef, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'personel_photos'

const PERSONEL_ROLES = [
  { id: 'kepsek', label: 'Kepala Sekolah', icon: 'school', color: 'bg-amber-50 text-amber-600' },
  { id: 'guru', label: 'Guru', icon: 'groups', color: 'bg-blue-50 text-blue-600' },
  { id: 'tendik', label: 'Tenaga Kependidikan', icon: 'badge', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'pengawas', label: 'Pengawas Sekolah', icon: 'supervisor_account', color: 'bg-violet-50 text-violet-600' },
]

function loadPhotos() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos))
}

export default function PersonelFotoTab() {
  const [photos, setPhotos] = useState(() => loadPhotos())
  const [uploadingRole, setUploadingRole] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    savePhotos(photos)
  }, [photos])

  const handleFile = useCallback((file, role) => {
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (e) => {
      // Resize ke max 512px
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 512
        let { width, height } = img
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
        const base64 = canvas.toDataURL('image/jpeg', 0.85)
        setPhotos((prev) => ({
          ...prev,
          [role]: { dataUrl: base64, name: file.name, uploadedAt: Date.now() },
        }))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = (role) => {
    setUploadingRole(role)
    fileInputRef.current?.click()
  }

  const handleRemove = (role) => {
    setPhotos((prev) => {
      const next = { ...prev }
      delete next[role]
      return next
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && uploadingRole) {
      handleFile(file, uploadingRole)
    }
    e.target.value = ''
    setUploadingRole(null)
  }

  const photoCount = Object.keys(photos).length

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Foto Personel</h3>
            <p className="text-sm text-slate-500">Upload foto untuk Generate Dokumentasi AI</p>
          </div>
          {photoCount > 0 && (
            <div className="ml-auto px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
              {photoCount} foto
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-blue-500 text-xl flex-shrink-0 mt-0.5">info</span>
        <div className="text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Untuk apa foto ini?</p>
          <p>Foto personel digunakan oleh fitur <strong>Generate Foto Dokumentasi AI</strong> di halaman BKU. 
            Saat generate dokumentasi, foto wajah personel akan digabungkan dengan aktivitas kegiatan.</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Personel Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PERSONEL_ROLES.map((role) => {
          const photo = photos[role.id]
          return (
            <div key={role.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className={`px-4 py-3 flex items-center gap-3 ${role.color}`}>
                <span className="material-symbols-outlined text-xl">{role.icon}</span>
                <span className="text-sm font-bold">{role.label}</span>
                {photo && (
                  <span className="ml-auto px-2 py-0.5 bg-white/80 rounded text-[9px] font-bold">✓</span>
                )}
              </div>

              {/* Photo Area */}
              <div className="p-4">
                {photo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <img
                        src={photo.dataUrl}
                        alt={role.label}
                        className="w-28 h-28 rounded-2xl object-cover shadow-lg ring-2 ring-slate-100"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 truncate">{photo.name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpload(role.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        Ganti
                      </button>
                      <button
                        onClick={() => handleRemove(role.id)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-500 text-xs font-semibold hover:bg-red-100 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpload(role.id)}
                    className="w-full flex flex-col items-center justify-center py-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-3xl text-slate-300 group-hover:text-primary transition-colors">add_a_photo</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors">Upload Foto</p>
                    <p className="text-[10px] text-slate-400 mt-1">JPG, PNG, maks 5MB</p>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
