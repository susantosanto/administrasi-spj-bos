/**
 * Pejabat Sekolah Page — Ultra Premium Design 2026
 * Separate page for managing school officials
 */
import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PEJABAT_ROLES = [
  {
    key: 'ks',
    label: 'Kepala Sekolah',
    sublabel: 'Pimpinan Sekolah',
    icon: 'person',
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    key: 'bendahara',
    label: 'Bendahara',
    sublabel: 'Pengelola Keuangan',
    icon: 'account_balance',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    key: 'pengawas',
    label: 'Pengawas Bina',
    sublabel: 'Pembina Sekolah',
    icon: 'supervisor_account',
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    key: 'sekdik',
    label: 'Sekretaris Dinas Pendidikan',
    sublabel: 'Perwakilan Dinas',
    icon: 'badge',
    gradient: 'from-amber-500 to-amber-600',
  },
]

const defaultPejabat = {
  ks: { nama: '', nip: '' },
  bendahara: { nama: '', nip: '' },
  pengawas: { nama: '', nip: '' },
  sekdik: { nama: '', nip: '' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function PejabatSekolahPage() {
  const [pejabat, setPejabat] = useState(defaultPejabat)
  const [sekolah, setSekolah] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored) {
      setSekolah(stored)
      if (stored.pejabat) setPejabat(stored.pejabat)
    }
  }, [])

  // ─── Update Field ────────────────────────────────────────────────
  const updateField = (jabatan, field, value) => {
    setPejabat(prev => ({
      ...prev,
      [jabatan]: { ...prev[jabatan], [field]: value },
    }))
    setHasChanges(true)
  }

  // ─── Save ────────────────────────────────────────────────────────
  const handleSave = () => {
    const stored = storageHelper.get('data_sekolah', {})
    storageHelper.set('data_sekolah', { ...stored, pejabat })
    setHasChanges(false)
    toast.success('Data pejabat berhasil disimpan')
  }

  // ─── Reset ───────────────────────────────────────────────────────
  const handleReset = () => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored?.pejabat) {
      setPejabat(stored.pejabat)
      setHasChanges(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Pejabat Sekolah" subtitle="Data pejabat yang bertandatangan" />

      <div className="p-6 space-y-6 flex-1 max-w-[1200px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HEADER                                                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pejabat Sekolah</h1>
            <p className="text-sm text-slate-500">
              {sekolah?.namaSekolah || 'Lengkapi data pejabat untuk dokumen'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                Reset
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                hasChanges
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span className="material-symbols-outlined text-lg">save</span>
              Simpan
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PEJABAT CARDS                                                   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PEJABAT_ROLES.map((role) => (
            <div
              key={role.key}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className={`relative bg-gradient-to-r ${role.gradient} p-5 overflow-hidden`}>
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />

                <div className="relative flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <span className="material-symbols-outlined text-2xl text-white">{role.icon}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{role.label}</h3>
                    <p className="text-white/70 text-xs">{role.sublabel}</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {/* Nama */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                      person
                    </span>
                    <input
                      type="text"
                      value={pejabat[role.key].nama}
                      onChange={(e) => updateField(role.key, 'nama', e.target.value)}
                      placeholder={`Nama ${role.label}`}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    NIP
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                      badge
                    </span>
                    <input
                      type="text"
                      value={pejabat[role.key].nip}
                      onChange={(e) => updateField(role.key, 'nip', e.target.value)}
                      placeholder="NIP. 000000000000000000"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Preview */}
                {pejabat[role.key].nama && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-400 mb-2">Preview:</p>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-sm font-bold text-slate-800">{pejabat[role.key].nama}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        NIP. {pejabat[role.key].nip || '......................................'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* INFO CARD                                                        */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl text-white">info</span>
            </div>
            <div>
              <h3 className="text-base font-bold mb-2">Tentang Pejabat Sekolah</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Data pejabat akan digunakan pada tanda tangan dokumen LPJ.
                Pastikan nama dan NIP sesuai dengan yang tertera pada SK dan data Dapodik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
