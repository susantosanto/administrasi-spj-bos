/**
 * Data Sekolah Page — Ultra Premium Design 2026
 * Tabs: Data Sekolah + Pejabat (separate views)
 */
import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { parseSekolahExcel } from '../../utils/sekolahParser'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const defaultData = {
  npsn: '',
  namaSekolah: '',
  kecamatan: '',
  kabupaten: '',
  provinsi: '',
  alamat: '',
  email: '',
  tahunAnggaran: '',
  allFields: [],
  pejabat: {
    ks: { nama: '', nip: '' },
    bendahara: { nama: '', nip: '' },
    pengawas: { nama: '', nip: '' },
    sekdik: { nama: '', nip: '' },
  },
}

const PEJABAT_ROLES = [
  { key: 'ks', label: 'Kepala Sekolah', icon: 'person', color: 'primary' },
  { key: 'bendahara', label: 'Bendahara', icon: 'account_balance', color: 'emerald' },
  { key: 'pengawas', label: 'Pengawas Bina', icon: 'supervisor_account', color: 'violet' },
  { key: 'sekdik', label: 'Sekretaris Dinas', icon: 'badge', color: 'amber' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DataSekolahPage() {
  const [tab, setTab] = useState('sekolah')
  const [data, setData] = useState(defaultData)
  const [isUploading, setIsUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [pejabatChanges, setPejabatChanges] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoDinasPreview, setLogoDinasPreview] = useState(null)
  const [logoGugusPreview, setLogoGugusPreview] = useState(null)
  const toast = useToast()
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const logoDinasInputRef = useRef(null)
  const logoGugusInputRef = useRef(null)

  useEffect(() => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored) setData(stored)
    // Load logos from storage
    const savedLogo = storageHelper.get('logo_sekolah', null)
    if (savedLogo) setLogoPreview(savedLogo)
    const savedLogoDinas = storageHelper.get('logo_dinas', null)
    if (savedLogoDinas) setLogoDinasPreview(savedLogoDinas)
    const savedLogoGugus = storageHelper.get('logo_gugus', null)
    if (savedLogoGugus) setLogoGugusPreview(savedLogoGugus)
  }, [])

  // ─── Logo Handlers ─────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error('Format file tidak didukung. Gunakan PNG, JPG, atau SVG')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setLogoPreview(base64)
      storageHelper.set('logo_sekolah', base64)
      toast.success('Logo sekolah berhasil disimpan')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    storageHelper.remove('logo_sekolah')
    toast.success('Logo sekolah berhasil dihapus')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  // ─── Logo Dinas Handlers ───────────────────────────────────────
  const handleLogoDinasUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error('Format file tidak didukung. Gunakan PNG, JPG, atau SVG')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setLogoDinasPreview(base64)
      storageHelper.set('logo_dinas', base64)
      toast.success('Logo dinas berhasil disimpan')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogoDinas = () => {
    setLogoDinasPreview(null)
    storageHelper.remove('logo_dinas')
    toast.success('Logo dinas berhasil dihapus')
    if (logoDinasInputRef.current) logoDinasInputRef.current.value = ''
  }

  // ─── Logo Gugus Handlers ───────────────────────────────────────
  const handleLogoGugusUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error('Format file tidak didukung. Gunakan PNG, JPG, atau SVG')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setLogoGugusPreview(base64)
      storageHelper.set('logo_gugus', base64)
      toast.success('Logo gugus berhasil disimpan')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogoGugus = () => {
    setLogoGugusPreview(null)
    storageHelper.remove('logo_gugus')
    toast.success('Logo gugus berhasil dihapus')
    if (logoGugusInputRef.current) logoGugusInputRef.current.value = ''
  }

  // ─── Update Pejabat ──────────────────────────────────────────────
  const updatePejabat = (jabatan, field, value) => {
    setData(prev => ({
      ...prev,
      pejabat: { ...prev.pejabat, [jabatan]: { ...prev.pejabat[jabatan], [field]: value } },
    }))
    setPejabatChanges(true)
  }

  // ─── Save Pejabat ────────────────────────────────────────────────
  const handleSavePejabat = () => {
    storageHelper.set('data_sekolah', { ...data })
    setPejabatChanges(false)
    toast.success('Data pejabat berhasil disimpan')
  }

  // ─── File Upload ─────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('File harus berformat Excel (.xlsx atau .xls)')
      return
    }
    setIsUploading(true)
    try {
      const result = await parseSekolahExcel(file)
      const header = result.header

      const newData = {
        ...data,
        npsn: header.npsn || data.npsn,
        namaSekolah: header.nama_sekolah || data.namaSekolah,
        alamat: header.alamat || data.alamat,
        kabupaten: header.kabupaten || data.kabupaten,
        provinsi: header.provinsi || data.provinsi,
        kecamatan: header.kecamatan || data.kecamatan,
        tahunAnggaran: header.tahunAnggaran || data.tahunAnggaran,
        allFields: result.allFields || [],
      }

      const stored = storageHelper.get('data_sekolah', null)
      storageHelper.set('data_sekolah', {
        ...(stored || data),
        ...newData,
        allFields: result.allFields || stored?.allFields || [],
        pejabat: stored?.pejabat || data.pejabat,
      })

      setData(newData)
      setShowUpload(false)
      toast.success(`Data sekolah berhasil diupload: ${header.nama_sekolah || header.npsn || '-'}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Group Fields ────────────────────────────────────────────────
  const grouped = { identitas: [], pelengkap: [], kontak: [], periodik: [], sanitasi: [] }
  let currentGroup = 'identitas'
  const allFields = data.allFields || []

  allFields.forEach(f => {
    const sec = (f.section || '').toLowerCase()
    if (sec.includes('pelengkap')) currentGroup = 'pelengkap'
    else if (sec.includes('kontak')) currentGroup = 'kontak'
    else if (sec.includes('periodik')) currentGroup = 'periodik'
    else if (sec.includes('sanitasi')) currentGroup = 'sanitasi'
    if (grouped[currentGroup]) grouped[currentGroup].push(f)
  })

  const hasSchoolData = data.npsn || data.namaSekolah || allFields.length > 0

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Data Sekolah" subtitle="Profil sekolah dan pejabat" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1 max-w-[1200px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER WITH TABS                                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {/* Tab: Data Sekolah */}
            <button
              onClick={() => setTab('sekolah')}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                tab === 'sekolah'
                  ? 'bg-white text-primary shadow-lg shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab === 'sekolah' && (
                <span className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none" />
              )}
              <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: tab === 'sekolah' ? "'FILL' 1" : "'FILL' 0" }}>
                school
              </span>
              <span className="hidden sm:inline">Data Sekolah</span>
              <span className="sm:hidden">Sekolah</span>
            </button>

            {/* Tab: Pejabat */}
            <button
              onClick={() => setTab('pejabat')}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                tab === 'pejabat'
                  ? 'bg-white text-primary shadow-lg shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab === 'pejabat' && (
                <span className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none" />
              )}
              <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: tab === 'pejabat' ? "'FILL' 1" : "'FILL' 0" }}>
                badge
              </span>
              <span className="hidden sm:inline">Pejabat Sekolah</span>
              <span className="sm:hidden">Pejabat</span>
            </button>

            {/* Tab: Logo Sekolah */}
            <button
              onClick={() => setTab('logo')}
              className={`relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                tab === 'logo'
                  ? 'bg-white text-primary shadow-lg shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
            >
              {tab === 'logo' && (
                <span className="absolute inset-0 rounded-2xl border-2 border-primary/20 pointer-events-none" />
              )}
              <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: tab === 'logo' ? "'FILL' 1" : "'FILL' 0" }}>
                add_a_photo
              </span>
              <span className="hidden sm:inline">Logo Sekolah</span>
              <span className="sm:hidden">Logo</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {tab === 'sekolah' && (
              <button
                onClick={() => setShowUpload(!showUpload)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  showUpload
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{showUpload ? 'close' : 'upload_file'}</span>
                {showUpload ? 'Tutup' : 'Upload Excel'}
              </button>
            )}

            {tab === 'pejabat' && pejabatChanges && (
              <button
                onClick={handleSavePejabat}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                Simpan Perubahan
              </button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* UPLOAD SECTION — Toggle                                         */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {showUpload && tab === 'sekolah' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-primary/40 transition-all duration-300 bg-gradient-to-b from-slate-50/50 to-transparent">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-5 shadow-inner">
                <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Data Sekolah</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Upload file Excel Dapodik — data profil sekolah akan langsung terisi otomatis
              </p>

              <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="sekolah-upload" />
              <label
                htmlFor="sekolah-upload"
                className={`inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  isUploading
                    ? 'bg-slate-300 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{isUploading ? 'sync' : 'upload'}</span>
                {isUploading ? 'Memproses...' : 'Pilih File Excel'}
              </label>

              <p className="text-xs text-slate-400 mt-4">Format: .xlsx atau .xls</p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: DATA SEKOLAH                                               */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'sekolah' && (
          <>
            {!hasSchoolData ? (
              /* ── Empty State ── */
              <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-sm">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <span className="material-symbols-outlined text-5xl text-slate-300">school</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Belum Ada Data Sekolah</h3>
                <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
                  Upload file Excel untuk mengisi data profil sekolah secara otomatis
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold text-sm hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">upload</span>
                  Upload Data Sekolah
                </button>
              </div>
            ) : (
              /* ── School Profile Card ── */
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                {/* Hero Header */}
                <div className="relative bg-gradient-to-r from-primary via-blue-600 to-primary p-8 overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
                  <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

                  <div className="relative flex items-start gap-6">
                    {/* School Icon */}
                    <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                      <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    </div>

                    {/* School Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                          Profil Sekolah
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white leading-tight mb-4">
                        {data.namaSekolah || 'SD NEGERI ...'}
                      </h2>
                      <div className="flex flex-wrap gap-2.5">
                        {data.npsn && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">fingerprint</span>
                            NPSN: {data.npsn}
                          </span>
                        )}
                        {data.tahunAnggaran && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">calendar_month</span>
                            TA {data.tahunAnggaran}
                          </span>
                        )}
                        {data.kecamatan && (
                          <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm text-white border border-white/20">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            {data.kecamatan}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Sections */}
                <div className="divide-y divide-slate-100">
                  {[
                    { key: 'identitas', title: 'Identitas Sekolah', icon: 'badge' },
                    { key: 'pelengkap', title: 'Data Pelengkap', icon: 'list_alt' },
                    { key: 'kontak', title: 'Kontak Sekolah', icon: 'contact_mail' },
                    { key: 'periodik', title: 'Data Periodik', icon: 'date_range' },
                    { key: 'sanitasi', title: 'Sanitasi', icon: 'water_drop' },
                  ].map(section => {
                    const fields = grouped[section.key]
                    if (!fields || fields.length === 0) return null
                    return (
                      <div key={section.key}>
                        {/* Section Header */}
                        <div className="px-8 py-4 bg-slate-50/80">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400 text-xl">{section.icon}</span>
                            <h4 className="text-base font-bold text-slate-700">{section.title}</h4>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-auto">{fields.length} field</span>
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100">
                          {fields.map((f, i) => (
                            <div key={i} className="bg-white px-6 py-4 hover:bg-slate-50/50 transition-colors">
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{f.label}</p>
                              <p className="text-sm font-semibold text-slate-800">
                                {f.value || <span className="text-slate-300 font-normal italic">Belum diisi</span>}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-xs font-medium">
                      Total {allFields.length} field data tersimpan
                    </p>
                    <button
                      onClick={() => setShowUpload(true)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-xl transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">upload</span>
                      Upload Ulang
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: PEJABAT SEKOLAH                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'pejabat' && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-2xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Pejabat Sekolah</h3>
                  <p className="text-sm text-slate-500">Data pejabat untuk tanda tangan dokumen LPJ</p>
                </div>
              </div>
            </div>

            {/* Pejabat Cards */}
            {PEJABAT_ROLES.map((role, idx) => (
              <div key={role.key} className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                {/* Card Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      idx === 0 ? 'bg-primary/10' :
                      idx === 1 ? 'bg-emerald-50' :
                      idx === 2 ? 'bg-violet-50' :
                      'bg-amber-50'
                    }`}>
                      <span className={`material-symbols-outlined text-xl ${
                        idx === 0 ? 'text-primary' :
                        idx === 1 ? 'text-emerald-600' :
                        idx === 2 ? 'text-violet-600' :
                        'text-amber-600'
                      }`}>{role.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{role.label}</h4>
                      <p className="text-xs text-slate-400">Data untuk tanda tangan</p>
                    </div>
                    {data.pejabat[role.key].nama && (
                      <div className="ml-auto">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Terisi
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Fields */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={data.pejabat[role.key].nama}
                        onChange={(e) => updatePejabat(role.key, 'nama', e.target.value)}
                        placeholder={`Nama ${role.label}`}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        NIP
                      </label>
                      <input
                        type="text"
                        value={data.pejabat[role.key].nip}
                        onChange={(e) => updatePejabat(role.key, 'nip', e.target.value)}
                        placeholder="NIP. 000000000000000000"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: LOGO SEKOLAH                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'logo' && (
          <div className="space-y-4">
            {/* Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-2xl text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Logo Sekolah</h3>
                  <p className="text-sm text-slate-500">Upload logo untuk dokumen dan surat-menyurat</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {logoPreview && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Sekolah
                    </span>
                  )}
                  {logoDinasPreview && (
                    <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Dinas
                    </span>
                  )}
                  {logoGugusPreview && (
                    <span className="px-2.5 py-1 bg-violet-50 text-violet-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Gugus
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logo Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* LOGO SEKOLAH                                                 */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-amber-600">school</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Logo Sekolah</h4>
                      <p className="text-[10px] text-slate-400">Identitas sekolah</p>
                    </div>
                    {logoPreview && (
                      <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold">✓</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <input
                    type="file"
                    ref={logoInputRef}
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="block cursor-pointer group">
                    <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50 transition-all duration-300 overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo Sekolah" className="w-full h-full object-contain p-4" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-amber-500 transition-colors">add_a_photo</span>
                          <span className="text-[10px] text-slate-400 mt-2 group-hover:text-amber-500 transition-colors">Upload Logo</span>
                        </>
                      )}
                    </div>
                  </label>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">PNG/JPG, maks 2MB</p>
                    {logoPreview && (
                      <button onClick={handleRemoveLogo} className="text-[10px] text-red-500 hover:text-red-600 font-medium">Hapus</button>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* LOGO DINAS                                                    */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-blue-600">location_city</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Logo Dinas</h4>
                      <p className="text-[10px] text-slate-400">Dinas Pendidikan</p>
                    </div>
                    {logoDinasPreview && (
                      <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold">✓</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <input
                    type="file"
                    ref={logoDinasInputRef}
                    accept="image/*"
                    onChange={handleLogoDinasUpload}
                    className="hidden"
                    id="logo-dinas-upload"
                  />
                  <label htmlFor="logo-dinas-upload" className="block cursor-pointer group">
                    <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 overflow-hidden">
                      {logoDinasPreview ? (
                        <img src={logoDinasPreview} alt="Logo Dinas" className="w-full h-full object-contain p-4" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-blue-500 transition-colors">add_a_photo</span>
                          <span className="text-[10px] text-slate-400 mt-2 group-hover:text-blue-500 transition-colors">Upload Logo</span>
                        </>
                      )}
                    </div>
                  </label>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">PNG/JPG, maks 2MB</p>
                    {logoDinasPreview && (
                      <button onClick={handleRemoveLogoDinas} className="text-[10px] text-red-500 hover:text-red-600 font-medium">Hapus</button>
                    )}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════ */}
              {/* LOGO GUGUS                                                    */}
              {/* ═══════════════════════════════════════════════════════════════ */}
              <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-violet-600">groups</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Logo Gugus</h4>
                      <p className="text-[10px] text-slate-400">Gugus sekolah</p>
                    </div>
                    {logoGugusPreview && (
                      <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-[9px] font-bold">✓</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <input
                    type="file"
                    ref={logoGugusInputRef}
                    accept="image/*"
                    onChange={handleLogoGugusUpload}
                    className="hidden"
                    id="logo-gugus-upload"
                  />
                  <label htmlFor="logo-gugus-upload" className="block cursor-pointer group">
                    <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-violet-400 hover:bg-violet-50/50 transition-all duration-300 overflow-hidden">
                      {logoGugusPreview ? (
                        <img src={logoGugusPreview} alt="Logo Gugus" className="w-full h-full object-contain p-4" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-violet-500 transition-colors">add_a_photo</span>
                          <span className="text-[10px] text-slate-400 mt-2 group-hover:text-violet-500 transition-colors">Upload Logo</span>
                        </>
                      )}
                    </div>
                  </label>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-slate-400">PNG/JPG, maks 2MB</p>
                    {logoGugusPreview && (
                      <button onClick={handleRemoveLogoGugus} className="text-[10px] text-red-500 hover:text-red-600 font-medium">Hapus</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-xl text-blue-500">info</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Informasi Upload Logo</h4>
                  <ul className="text-xs text-slate-500 space-y-1">
                    <li>• <span className="font-semibold">Logo Sekolah</span> — Ditampilkan di pojok kiri atas dokumen surat</li>
                    <li>• <span className="font-semibold">Logo Dinas</span> — Ditampilkan di pojok kanan atas dokumen surat</li>
                    <li>• <span className="font-semibold">Logo Gugus</span> — Digunakan untuk surat edaran gugus</li>
                    <li>• Format: PNG, JPG, JPEG, SVG (maks 2MB)</li>
                    <li>• Rekomendasi: 200x200px dengan background transparan</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
