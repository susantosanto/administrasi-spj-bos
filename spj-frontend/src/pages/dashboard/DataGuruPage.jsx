/**
 * Data Guru & Tendik Page — Premium Design 2026
 * Tabs: Guru + Tendik with integrated upload toggle
 */
import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { useLoading } from '../../contexts/LoadingContext'
import UploadSurface from '../../components/ui/UploadSurface'
import { requireWrite } from '../../services/licenseService'
import { parseGuruTendikExcel } from '../../utils/guruTendikParser'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_BADGE = {
  'PNS': 'bg-blue-100 text-blue-700',
  'PPPK': 'bg-emerald-100 text-emerald-700',
  'CPNS': 'bg-violet-100 text-violet-700',
  'Honorer': 'bg-amber-100 text-amber-700',
}

// Role Honor options untuk Tendik
const ROLE_HONOR_OPTIONS = [
  { value: 'tendik', label: 'Tendik Umum', color: 'bg-slate-100 text-slate-700', icon: 'badge' },
  { value: 'perpus', label: 'Perpustakaan', color: 'bg-blue-100 text-blue-700', icon: 'menu_book' },
  { value: 'penjaga', label: 'Penjaga', color: 'bg-emerald-100 text-emerald-700', icon: 'security' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DataGuruPage() {
  const { withLoading } = useLoading()
  const [tab, setTab] = useState('guru')
  const [guru, setGuru] = useState([])
  const [tendik, setTendik] = useState([])
  const [personelForm, setPersonelForm] = useState(null)
  const [editingPersonelId, setEditingPersonelId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [sumber, setSumber] = useState({ guru: null, tendik: null })
  const toast = useToast()

  useEffect(() => {
    const storedGuru = storageHelper.get('data_guru', null)
    if (storedGuru && storedGuru.length > 0) {
      setGuru(storedGuru)
    }

    const storedTendik = storageHelper.get('data_tendik', null)
    if (storedTendik && storedTendik.length > 0) {
      setTendik(storedTendik)
    }
  }, [])

  // ─── Upload Handler ──────────────────────────────────────────
  const handleFileUpload = async (e, jenis) => {
    if (!requireWrite(toast)) return
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('File harus berformat Excel (.xlsx atau .xls)')
      return
    }

    setIsUploading(true)
    try {
      const result = await withLoading(() => parseGuruTendikExcel(file), 'Memproses data guru & tendik', 'Membaca file Excel')
      if (result.total === 0) {
        toast.error('Tidak ada data yang ditemukan')
        return
      }

      const detectedJenis = jenis || result.jenis || 'guru'

      const key = detectedJenis === 'tendik' ? 'data_tendik' : 'data_guru'
      if (!storageHelper.set(key, result.items)) {
        toast.error('Data gagal disimpan. Daftar lama tetap dipertahankan; periksa ruang penyimpanan browser.')
        return
      }
      if (detectedJenis === 'tendik') {
        setTendik(result.items)
      } else {
        setGuru(result.items)
      }
      setSumber((prev) => ({
        ...prev,
        [detectedJenis]: { file: file.name, at: new Date().toISOString() },
      }))

      toast.success(`${detectedJenis === 'tendik' ? 'Tendik' : 'Guru'} berhasil diupload! ${result.total} data`)
    } catch (error) {
      toast.error(`Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      // UploadDropzone mereset input-nya sendiri; tidak ada ref tersisa.
    }
  }

  // ─── Manual CRUD: sumber yang sama dengan data hasil impor ──
  const kosongkanFormPersonel = () => ({ nama: '', nip: '', nuptk: '', jenisPtk: '', jabatan: '', status: '', golongan: '', alamat: '', roleHonor: 'tendik' })

  const bukaFormPersonel = (type, record = null) => {
    setTab(type)
    setEditingPersonelId(record?.id ?? null)
    setPersonelForm({ ...kosongkanFormPersonel(), ...(record || {}) })
  }

  const simpanPersonelManual = (event, type) => {
    event.preventDefault()
    if (!requireWrite(toast)) return
    const nama = String(personelForm?.nama || '').trim()
    if (!nama) {
      toast.error('Nama wajib diisi')
      return
    }
    const daftar = type === 'tendik' ? tendik : guru
    const nextRecord = {
      ...kosongkanFormPersonel(),
      ...personelForm,
      id: editingPersonelId ?? `manual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nama,
      jenisPtk: String(personelForm.jenisPtk || personelForm.jabatan || '').trim(),
      jabatan: String(personelForm.jabatan || personelForm.jenisPtk || '').trim(),
      sumberData: 'manual',
    }
    const updated = editingPersonelId
      ? daftar.map((item) => item.id === editingPersonelId ? { ...item, ...nextRecord } : item)
      : [...daftar, nextRecord]
    const saved = storageHelper.set(type === 'tendik' ? 'data_tendik' : 'data_guru', updated)
    if (!saved) {
      toast.error('Data gagal disimpan. Periksa ruang penyimpanan browser.')
      return
    }
    if (type === 'tendik') setTendik(updated)
    else setGuru(updated)
    setPersonelForm(null)
    setEditingPersonelId(null)
    toast.success(`Data ${type === 'tendik' ? 'tendik' : 'guru'} berhasil disimpan`)
  }

  const handleDelete = (id, type) => {
    if (!requireWrite(toast)) return
    const label = type === 'tendik' ? 'tendik' : 'guru'
    if (!window.confirm(`Hapus data ${label} ini?`)) return
    const daftar = type === 'tendik' ? tendik : guru
    const updated = daftar.filter((item) => item.id !== id)
    const saved = storageHelper.set(type === 'tendik' ? 'data_tendik' : 'data_guru', updated)
    if (!saved) {
      toast.error('Data gagal dihapus. Periksa ruang penyimpanan browser.')
      return
    }
    if (type === 'tendik') setTendik(updated)
    else setGuru(updated)
    toast.success('Data berhasil dihapus')
  }

  const renderFormPersonel = (type) => personelForm && (
    <form onSubmit={(event) => simpanPersonelManual(event, type)} className="rounded-2xl border border-primary/20 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{editingPersonelId ? 'Edit data' : 'Tambah data'} {type === 'tendik' ? 'Tendik' : 'Guru'}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Data ini langsung menjadi sumber dokumen aplikasi.</p>
        </div>
        <button type="button" onClick={() => { setPersonelForm(null); setEditingPersonelId(null) }} className="rounded-lg p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10" aria-label="Tutup form">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ['nama', 'Nama', true], ['nip', 'NIP', false], ['nuptk', 'NUPTK', false],
          [type === 'tendik' ? 'jenisPtk' : 'jabatan', type === 'tendik' ? 'Jenis PTK' : 'Jabatan', false],
          ['status', 'Status Kepegawaian', false], ['golongan', 'Pangkat / Golongan', false], ['alamat', 'Alamat', false],
        ].map(([field, label, required]) => (
          <label key={field} className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {label}{required ? ' *' : ''}
            <input required={required} value={personelForm[field] || ''} onChange={(event) => setPersonelForm((prev) => ({ ...prev, [field]: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm font-normal text-slate-800 dark:text-slate-100 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" />
          </label>
        ))}
        {type === 'tendik' && (
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Role Honor
            <select value={personelForm.roleHonor || 'tendik'} onChange={(event) => setPersonelForm((prev) => ({ ...prev, roleHonor: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 dark:border-transparent bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm font-normal text-slate-800 dark:text-slate-100">
              {ROLE_HONOR_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setPersonelForm(null); setEditingPersonelId(null) }} className="rounded-xl border border-slate-200 dark:border-transparent px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Batal</button>
        <button type="submit" className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white">Simpan Data</button>
      </div>
    </form>
  )

  // ─── Role Honor Handler ──────────────────────────────────────
  const handleRoleHonorChange = (id, newRole) => {
    const updated = tendik.map(t => t.id === id ? { ...t, roleHonor: newRole } : t)
    if (!storageHelper.set('data_tendik', updated)) {
      toast.error('Role honor gagal disimpan. Periksa ruang penyimpanan browser.')
      return
    }
    setTendik(updated)

    const roleLabel = ROLE_HONOR_OPTIONS.find(r => r.value === newRole)?.label || newRole
    toast.success(`Role honor diubah ke "${roleLabel}"`)
  }

  // Get role badge style
  const getRoleBadge = (role) => {
    const option = ROLE_HONOR_OPTIONS.find(r => r.value === role)
    if (!option) return ROLE_HONOR_OPTIONS[0] // default: tendik
    return option
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Data Guru & Tendik" subtitle="Data guru dan tenaga kependidikan" />

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 max-w-[1400px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TABS                                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('guru')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'guru'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            Guru
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'guru' ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
              {guru.length}
            </span>
          </button>
          <button
            onClick={() => setTab('tendik')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'tendik'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            Tendik
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'tendik' ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/10'}`}>
              {tendik.length}
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: GURU                                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'guru' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Guru</h2>
              <button onClick={() => bukaFormPersonel('guru')} className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                <span className="material-symbols-outlined text-lg">person_add</span>Tambah Guru
              </button>
            </div>

            {renderFormPersonel('guru')}

            {/* UploadSurface — strip tipis saat data ada, klik untuk ganti */}
            <UploadSurface
                id="guru-upload"
                icon="school"
                title="Upload Data Guru"
                description="File Excel Dapodik — data guru akan langsung terisi otomatis"
                formatHint="Format: .xlsx atau .xls"
                accept=".xlsx,.xls"
                loading={isUploading}
                loadingText="Memproses..."
                actionText="Pilih File Excel Guru"
                filled={guru.length > 0}
                filledLabel="Data guru tersimpan"
                fileName={sumber.guru?.file}
                uploadedAt={sumber.guru?.at}
                count={guru.length}
                onFiles={(files) => handleFileUpload({ target: { files } }, 'guru')}
              />

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-transparent">
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NIP</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NUPTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Golongan</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jabatan</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {guru.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block">groups</span>
                          Belum ada data guru
                        </td>
                      </tr>
                    ) : guru.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-white/5/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{g.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{g.nip || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{g.nuptk || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{g.golongan || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{g.jabatan || '-'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[g.status] || 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button onClick={() => bukaFormPersonel('guru', g)} className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10" aria-label={`Edit ${g.nama}`}>
                              <span className="material-symbols-outlined text-sm">edit</span>
                            </button>
                            <button onClick={() => handleDelete(g.id, 'guru')} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" aria-label={`Hapus ${g.nama}`}>
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: TENDIK                                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'tendik' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Data Tendik</h2>
              <button onClick={() => bukaFormPersonel('tendik')} className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                <span className="material-symbols-outlined text-lg">person_add</span>Tambah Tendik
              </button>
            </div>

            {renderFormPersonel('tendik')}

            {/* UploadSurface — strip tipis saat data ada, klik untuk ganti */}
            <UploadSurface
                id="tendik-upload"
                icon="groups"
                title="Upload Data Tendik"
                description="File Excel Dapodik — data pegawai akan langsung terisi otomatis"
                formatHint="Format: .xlsx atau .xls"
                accept=".xlsx,.xls"
                loading={isUploading}
                loadingText="Memproses..."
                actionText="Pilih File Excel Tendik"
                filled={tendik.length > 0}
                filledLabel="Data tendik tersimpan"
                fileName={sumber.tendik?.file}
                uploadedAt={sumber.tendik?.at}
                count={tendik.length}
                onFiles={(files) => handleFileUpload({ target: { files } }, 'tendik')}
              />

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-transparent overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-transparent">
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nama</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NIP</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">NUPTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jenis PTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role Honor</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tendik.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-slate-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block">badge</span>
                          Belum ada data tendik
                        </td>
                      </tr>
                    ) : tendik.map(t => {
                      const currentRole = getRoleBadge(t.roleHonor)
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-white/5/50 transition-colors">
                          <td className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{t.nama}</td>
                          <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{t.nip || '-'}</td>
                          <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400 font-mono">{t.nuptk || '-'}</td>
                          <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-300">{t.jenisPtk || t.jabatan || '-'}</td>
                          <td className="px-5 py-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[t.status] || 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <select
                              value={t.roleHonor || 'tendik'}
                              onChange={(e) => handleRoleHonorChange(t.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${currentRole.color}`}
                            >
                              {ROLE_HONOR_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button onClick={() => bukaFormPersonel('tendik', t)} className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 dark:bg-white/10" aria-label={`Edit ${t.nama}`}>
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleDelete(t.id, 'tendik')} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors" aria-label={`Hapus ${t.nama}`}>
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
