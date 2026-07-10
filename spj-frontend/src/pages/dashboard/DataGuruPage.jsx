/**
 * Data Guru & Tendik Page — Premium Design 2026
 * Tabs: Guru + Tendik with integrated upload toggle
 */
import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { parseGuruTendikExcel } from '../../utils/guruTendikParser'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MOCK_GURU = [
  { id: 1, nama: 'Dra. Siti Nurhaliza, M.Pd', nip: '196805151993012001', nuptk: '0672748641200143', golongan: 'IV/b', jabatan: 'Kepala Sekolah', status: 'PNS' },
  { id: 2, nama: 'Ahmad Hidayat, S.Pd', nip: '197503202005011002', nuptk: '0774859731200532', golongan: 'III/d', jabatan: 'Guru', status: 'PNS' },
  { id: 3, nama: 'Rina Wati, S.Pd', nip: '198006102008012003', nuptk: '0871960841200854', golongan: 'III/c', jabatan: 'Guru', status: 'PNS' },
  { id: 4, nama: 'Budi Santoso, S.Pd', nip: '198201252010011004', nuptk: '0973071951201021', golongan: 'III/b', jabatan: 'Guru', status: 'PNS' },
  { id: 5, nama: 'Dewi Kartika, S.Pd', nip: '198509182012012005', nuptk: '1074182061201233', golongan: 'III/a', jabatan: 'Guru', status: 'PNS' },
  { id: 6, nama: 'Hendra Wijaya, S.Pd', nip: '198703052015011006', nuptk: '1175293171201544', golongan: 'III/a', jabatan: 'Guru', status: 'PNS' },
  { id: 7, nama: 'Maya Sari, S.Pd', nip: '199001122018012007', nuptk: '1276304281201855', golongan: 'II/c', jabatan: 'Guru', status: 'CPNS' },
  { id: 8, nama: 'Rudi Hartono', nip: '198807202015011008', nuptk: 'P-0001', golongan: '', jabatan: 'TU', status: 'Honorer' },
  { id: 9, nama: 'Sri Mulyani', nip: '199205052020012009', nuptk: '', golongan: '', jabatan: 'Pustakawan', status: 'Honorer' },
  { id: 10, nama: 'Agus Supriyadi, S.Pd', nip: '198304152010011010', nuptk: '1377415391201066', golongan: 'III/c', jabatan: 'Guru', status: 'PNS' },
  { id: 11, nama: 'Linda Agustina, S.Pd', nip: '198608222014012011', nuptk: '1478526401201477', golongan: 'III/a', jabatan: 'Guru', status: 'PNS' },
  { id: 12, nama: 'Eko Prasetyo', nip: '199102282022011012', nuptk: '', golongan: '', jabatan: 'Penjaga Sekolah', status: 'Honorer' },
]

const STATUS_BADGE = {
  'PNS': 'bg-blue-100 text-blue-700',
  'PPPK': 'bg-emerald-100 text-emerald-700',
  'CPNS': 'bg-violet-100 text-violet-700',
  'Honorer': 'bg-amber-100 text-amber-700',
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DataGuruPage() {
  const [tab, setTab] = useState('guru')
  const [guru, setGuru] = useState([])
  const [tendik, setTendik] = useState([])
  const [showUploadGuru, setShowUploadGuru] = useState(false)
  const [showUploadTendik, setShowUploadTendik] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const toast = useToast()
  const guruFileRef = useRef(null)
  const tendikFileRef = useRef(null)

  useEffect(() => {
    const storedGuru = storageHelper.get('data_guru', null)
    if (storedGuru && storedGuru.length > 0) {
      setGuru(storedGuru)
    } else {
      setGuru(MOCK_GURU)
      storageHelper.set('data_guru', MOCK_GURU)
    }

    const storedTendik = storageHelper.get('data_tendik', null)
    if (storedTendik && storedTendik.length > 0) {
      setTendik(storedTendik)
    }
  }, [])

  // ─── Upload Handler ──────────────────────────────────────────
  const handleFileUpload = async (e, jenis) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('File harus berformat Excel (.xlsx atau .xls)')
      return
    }

    setIsUploading(true)
    try {
      const result = await parseGuruTendikExcel(file)
      if (result.total === 0) {
        toast.error('Tidak ada data yang ditemukan')
        return
      }

      const detectedJenis = jenis || result.jenis || 'guru'

      if (detectedJenis === 'tendik') {
        setTendik(result.items)
        storageHelper.set('data_tendik', result.items)
        setShowUploadTendik(false)
      } else {
        setGuru(result.items)
        storageHelper.set('data_guru', result.items)
        setShowUploadGuru(false)
      }

      toast.success(`${detectedJenis === 'tendik' ? 'Tendik' : 'Guru'} berhasil diupload! ${result.total} data`)
    } catch (error) {
      toast.error(`Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (jenis === 'tendik' && tendikFileRef.current) tendikFileRef.current.value = ''
      if (jenis !== 'tendik' && guruFileRef.current) guruFileRef.current.value = ''
    }
  }

  // ─── Delete Handler ──────────────────────────────────────────
  const handleDelete = (id, type) => {
    if (type === 'tendik') {
      const updated = tendik.filter(g => g.id !== id)
      setTendik(updated)
      storageHelper.set('data_tendik', updated)
    } else {
      const updated = guru.filter(g => g.id !== id)
      setGuru(updated)
      storageHelper.set('data_guru', updated)
    }
    toast.success('Data berhasil dihapus')
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/80">
      <Topbar title="Data Guru & Tendik" subtitle="Data guru dan tenaga kependidikan" />

      <div className="p-6 space-y-6 flex-1 max-w-[1400px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TABS                                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('guru')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'guru'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">groups</span>
            Guru
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'guru' ? 'bg-white/20' : 'bg-slate-100'}`}>
              {guru.length}
            </span>
          </button>
          <button
            onClick={() => setTab('tendik')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === 'tendik'
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className="material-symbols-outlined text-lg">badge</span>
            Tendik
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tab === 'tendik' ? 'bg-white/20' : 'bg-slate-100'}`}>
              {tendik.length}
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB: GURU                                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {tab === 'guru' && (
          <div className="space-y-5">
            {/* Header with Upload Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Data Guru</h2>
              <button
                onClick={() => setShowUploadGuru(!showUploadGuru)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  showUploadGuru
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{showUploadGuru ? 'close' : 'upload_file'}</span>
                {showUploadGuru ? 'Tutup Form' : 'Upload Excel'}
              </button>
            </div>

            {/* Upload Form — Hidden by default */}
            {showUploadGuru && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Upload Data Guru</h3>
                  <p className="text-sm text-slate-500 mb-4">File Excel Dapodik — data akan langsung terisi otomatis</p>

                  <input type="file" ref={guruFileRef} accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, 'guru')} className="hidden" id="guru-upload" />
                  <label
                    htmlFor="guru-upload"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isUploading
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{isUploading ? 'sync' : 'upload'}</span>
                    {isUploading ? 'Memproses...' : 'Pilih File Excel Guru'}
                  </label>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">NIP</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">NUPTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Golongan</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Jabatan</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
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
                      <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-800">{g.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 font-mono">{g.nip || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 font-mono">{g.nuptk || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{g.golongan || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{g.jabatan || '-'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[g.status] || 'bg-slate-100 text-slate-600'}`}>
                            {g.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => handleDelete(g.id, 'guru')} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
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
            {/* Header with Upload Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Data Tendik</h2>
              <button
                onClick={() => setShowUploadTendik(!showUploadTendik)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                  showUploadTendik
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{showUploadTendik ? 'close' : 'upload_file'}</span>
                {showUploadTendik ? 'Tutup Form' : 'Upload Excel'}
              </button>
            </div>

            {/* Upload Form — Hidden by default */}
            {showUploadTendik && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary/50 transition-colors">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Upload Data Tendik</h3>
                  <p className="text-sm text-slate-500 mb-4">File Excel Dapodik — data akan langsung terisi otomatis</p>

                  <input type="file" ref={tendikFileRef} accept=".xlsx,.xls" onChange={(e) => handleFileUpload(e, 'tendik')} className="hidden" id="tendik-upload" />
                  <label
                    htmlFor="tendik-upload"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      isUploading
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 active:scale-[0.98]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{isUploading ? 'sync' : 'upload'}</span>
                    {isUploading ? 'Memproses...' : 'Pilih File Excel Tendik'}
                  </label>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">NIP</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">NUPTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Jenis PTK</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tendik.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400">
                          <span className="material-symbols-outlined text-4xl mb-2 block">badge</span>
                          Belum ada data tendik
                        </td>
                      </tr>
                    ) : tendik.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-semibold text-slate-800">{t.nama}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 font-mono">{t.nip || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-500 font-mono">{t.nuptk || '-'}</td>
                        <td className="px-5 py-3 text-sm text-slate-600">{t.jenisPtk || t.jabatan || '-'}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[t.status] || 'bg-slate-100 text-slate-600'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button onClick={() => handleDelete(t.id, 'tendik')} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
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
