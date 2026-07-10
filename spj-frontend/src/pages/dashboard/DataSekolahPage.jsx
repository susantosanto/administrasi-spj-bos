/**
 * Data Sekolah Page — Ultra Premium Design 2026
 * Unified card + Integrated upload Excel
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
  { key: 'ks', label: 'Kepala Sekolah', icon: 'person' },
  { key: 'bendahara', label: 'Bendahara', icon: 'account_balance' },
  { key: 'pengawas', label: 'Pengawas Bina', icon: 'supervisor_account' },
  { key: 'sekdik', label: 'Sekretaris Dinas Pendidikan', icon: 'badge' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DataSekolahPage() {
  const [data, setData] = useState(defaultData)
  const [isUploading, setIsUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const toast = useToast()
  const fileInputRef = useRef(null)

  useEffect(() => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored) setData(stored)
  }, [])

  // ─── Save Pejabat ────────────────────────────────────────────────
  const handleSavePejabat = () => {
    storageHelper.set('data_sekolah', { ...data })
    toast.success('Data pejabat berhasil disimpan')
  }

  // ─── Update Pejabat ──────────────────────────────────────────────
  const updatePejabat = (jabatan, field, value) => {
    setData(prev => ({
      ...prev,
      pejabat: { ...prev.pejabat, [jabatan]: { ...prev.pejabat[jabatan], [field]: value } },
    }))
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
      <Topbar title="Data Sekolah" subtitle="Profil sekolah dan data pejabat" />

      <div className="p-6 space-y-6 flex-1 max-w-[1200px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER — Upload Button                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Profil Sekolah</h1>
            <p className="text-sm text-slate-500">Data identitas dan pejabat sekolah</p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium"
          >
            <span className="material-symbols-outlined text-lg">upload_file</span>
            Upload Excel
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* UPLOAD SECTION — Collapsible                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {showUpload && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Upload Data Sekolah</h3>
              <p className="text-sm text-slate-500 mb-4">Upload file Excel (.xlsx) — data akan langsung terisi otomatis</p>

              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="sekolah-upload"
              />
              <label
                htmlFor="sekolah-upload"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isUploading
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isUploading ? 'sync' : 'upload'}
                </span>
                {isUploading ? 'Memproses...' : 'Pilih File Excel'}
              </label>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* MAIN CARD — School Profile                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {!hasSchoolData ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-4xl text-slate-300">school</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Belum Ada Data Sekolah</h3>
            <p className="text-sm text-slate-500 mb-6">Upload file Excel untuk mengisi data profil sekolah</p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-lg">upload</span>
              Upload Data Sekolah
            </button>
          </div>
        ) : (
          /* ══ PROFILE CARD ══ */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">

            {/* ── Hero Header ── */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 overflow-hidden">
              {/* Decorative */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />

              <div className="relative flex items-start gap-5">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
                  <span className="material-symbols-outlined text-3xl text-white">school</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Profil Sekolah</p>
                  <h2 className="text-xl font-bold text-white leading-tight mb-3">
                    {data.namaSekolah || 'SD NEGERI ...'}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/80">
                      <span className="material-symbols-outlined text-sm">fingerprint</span>
                      NPSN: {data.npsn || '-'}
                    </span>
                    {data.tahunAnggaran && (
                      <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/80">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        TA {data.tahunAnggaran}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg text-xs text-white/80">
                      <span className="material-symbols-outlined text-sm">location_on</span>
                      {data.kecamatan || data.kabupaten || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Data Sections ── */}
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
                <div key={section.key} className="border-b border-slate-100 last:border-b-0">
                  <div className="px-6 py-3 bg-slate-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-lg">{section.icon}</span>
                    <h4 className="text-sm font-bold text-slate-700">{section.title}</h4>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {fields.map((f, i) => (
                      <div key={i} className="flex items-start gap-4 px-6 py-3 hover:bg-slate-50/50 transition-colors">
                        <span className="text-slate-400 text-xs font-medium w-1/3 flex-shrink-0 pt-0.5">{f.label}</span>
                        <span className="text-slate-800 text-sm font-semibold flex-1 break-words">{f.value || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* ── Footer ── */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-slate-400 text-xs">{allFields.length} field data</p>
              <button
                onClick={() => setShowUpload(true)}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">upload</span>
                Update Data
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PEJABAT SECTION                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">badge</span>
              <h3 className="text-base font-bold text-slate-900">Pejabat Sekolah</h3>
            </div>
            <button
              onClick={handleSavePejabat}
              className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Simpan
            </button>
          </div>

          {/* Pejabat Grid */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {PEJABAT_ROLES.map(p => (
              <div key={p.key} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">{p.icon}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">{p.label}</h4>
                </div>
                <div className="space-y-2">
                  <input
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder={`Nama ${p.label}`}
                    value={data.pejabat[p.key].nama}
                    onChange={e => updatePejabat(p.key, 'nama', e.target.value)}
                  />
                  <input
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="NIP"
                    value={data.pejabat[p.key].nip}
                    onChange={e => updatePejabat(p.key, 'nip', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
