import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { parseGuruTendikExcel } from '../../utils/guruTendikParser'

// ─── Mock Data ─────────────────────────────────────────────────

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

// ─── Helpers ───────────────────────────────────────────────────

const STATUS_BADGE = {
  'PNS': 'bg-green-100 text-green-700 ring-1 ring-green-200',
  'PPPK': 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  'PPPK Paruh Waktu': 'bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200',
  'Guru Honor Sekolah': 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200',
  'CPNS': 'bg-purple-100 text-purple-700 ring-1 ring-purple-200',
  'Honorer': 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  'PPP': 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200',
  'Tenaga Honor Sekolah': 'bg-orange-100 text-orange-700 ring-1 ring-orange-200',
}

function getStatusBadge(status) {
  return STATUS_BADGE[status] || 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'
}

// ─── Component ─────────────────────────────────────────────────

export default function DataGuruPage() {
  const [tab, setTab] = useState('guru')
  const [guru, setGuru] = useState([])
  const [tendik, setTendik] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [form, setForm] = useState({ nama: '', nip: '', nuptk: '', golongan: '', jabatan: '', status: 'PNS' })
  const toast = useToast()
  const guruFileRef = useRef(null)
  const tendikFileRef = useRef(null)

  // ─── Load from Storage ───────────────────────────────────────

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

  // ─── Manual Add ──────────────────────────────────────────────

  const handleAdd = (e) => {
    e.preventDefault()
    const newItem = { id: Date.now(), ...form }
    const updated = [...guru, newItem]
    setGuru(updated)
    storageHelper.set('data_guru', updated)
    setForm({ nama: '', nip: '', nuptk: '', golongan: '', jabatan: '', status: 'PNS' })
    setShowForm(false)
    toast.success('Data guru berhasil ditambahkan')
  }

  const handleDelete = (id, type) => {
    if (type === 'tendik') {
      const updated = tendik.filter(g => g.id !== id)
      setTendik(updated)
      storageHelper.set('data_tendik', updated)
      toast.success('Data tendik berhasil dihapus')
    } else {
      const updated = guru.filter(g => g.id !== id)
      setGuru(updated)
      storageHelper.set('data_guru', updated)
      toast.success('Data guru berhasil dihapus')
    }
  }

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

      // Auto-detect jenis if mixed or detect from file
      const detectedJenis = jenis || result.jenis || 'guru'

      // Save to state and storage
      if (detectedJenis === 'tendik') {
        setTendik(result.items)
        storageHelper.set('data_tendik', result.items)
        // Auto-switch ke tab tendik
        setTab('tendik')
      } else {
        setGuru(result.items)
        storageHelper.set('data_guru', result.items)
        setTab('guru')
      }

      toast.success(
        `✅ ${detectedJenis === 'tendik' ? 'Tendik' : 'Guru'} berhasil diupload!\n` +
        `${result.total} data dari ${result.header.namaSekolah || 'file'}`
      )
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`❌ Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (jenis === 'tendik' && tendikFileRef.current) tendikFileRef.current.value = ''
      if (jenis !== 'tendik' && guruFileRef.current) guruFileRef.current.value = ''
    }
  }

  // ─── Clear Data ──────────────────────────────────────────────

  const handleClearData = (type) => {
    if (type === 'tendik') {
      storageHelper.remove('data_tendik')
      setTendik([])
      toast.info('Data tendik berhasil dihapus')
    } else {
      storageHelper.remove('data_guru')
      setGuru(MOCK_GURU)
      storageHelper.set('data_guru', MOCK_GURU)
      toast.info('Data guru direset ke data awal')
    }
  }

  // ─── Render Table ────────────────────────────────────────────

  const renderTable = (items, type) => (
    <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider">
              <th className="px-lg py-md font-label-md text-xs">Nama</th>
              <th className="px-lg py-md font-label-md text-xs">NIP</th>
              <th className="px-lg py-md font-label-md text-xs">NUPTK</th>
              <th className="px-lg py-md font-label-md text-xs">Golongan</th>
              <th className="px-lg py-md font-label-md text-xs">Jabatan</th>
              <th className="px-lg py-md font-label-md text-xs">Status</th>
              <th className="px-lg py-md font-label-md text-xs text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-body-sm divide-y divide-outline-variant">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 block">
                    {type === 'tendik' ? 'badge' : 'groups'}
                  </span>
                  Belum ada data {type === 'tendik' ? 'tendik' : 'guru'}
                  <p className="text-xs mt-1">
                    Upload file Excel Dapodik di tab Upload Excel
                  </p>
                </td>
              </tr>
            ) : items.map(g => (
              <tr key={g.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="px-lg py-md font-medium text-text-high">
                  <div className="flex items-center gap-2">
                    {g.jk && (
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        g.jk === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {g.jk}
                      </span>
                    )}
                    <span>{g.nama}</span>
                  </div>
                </td>
                <td className="px-lg py-md text-on-surface-variant font-mono text-xs">{g.nip || '-'}</td>
                <td className="px-lg py-md text-on-surface-variant font-mono text-xs">{g.nuptk || '-'}</td>
                <td className="px-lg py-md text-on-surface-variant">{g.golongan || '-'}</td>
                <td className="px-lg py-md text-on-surface-variant">{g.jabatan || g.jenisPtk || '-'}</td>
                <td className="px-lg py-md">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full font-label-xs text-label-xs ${getStatusBadge(g.status)}`}>
                    {g.status}
                  </span>
                </td>
                <td className="px-lg py-md text-center">
                  <button
                    onClick={() => handleDelete(g.id, type)}
                    className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ─── Main Render ─────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Data Guru & Tendik" subtitle="Data guru dan tenaga kependidikan" />

      <div className="p-lg space-y-lg flex-1">
        {/* ══ SUPER PREMIUM TAB NAVIGATION ══ */}
        <div className="flex gap-sm flex-wrap">
          {[
            { key: 'guru', icon: 'groups', label: 'Guru', count: guru.length },
            { key: 'tendik', icon: 'badge', label: 'Tendik', count: tendik.length },
            { key: 'upload', icon: 'upload_file', label: 'Upload Excel' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-lg py-2.5 rounded-xl font-label-md transition-all duration-200 overflow-hidden group ${
                tab === t.key
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high hover:border-primary/30'
              }`}
            >
              {tab === t.key && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <span className="material-symbols-outlined text-sm mr-1 relative z-10">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
              {t.count !== undefined && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold relative z-10 ${
                  tab === t.key ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* TAB: GURU                                    */}
        {/* ════════════════════════════════════════════ */}
        {tab === 'guru' && (
          <div className="space-y-lg">
            <div className="flex flex-wrap justify-between items-center gap-md">
              <p className="text-text-low font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">groups</span>
                {guru.length} data guru tercatat
              </p>
              <div className="flex items-center gap-sm">
                <button
                  onClick={() => setShowForm(!showForm)}
                  className={`flex items-center gap-sm px-lg py-2 rounded-lg transition-all active:scale-95 font-label-md ${
                    showForm
                      ? 'bg-gray-100 text-gray-600 border border-gray-200'
                      : 'bg-primary text-on-primary hover:brightness-110 shadow-md'
                  }`}
                >
                  <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                  {showForm ? 'Batal' : 'Tambah Guru'}
                </button>
                <button
                  onClick={() => handleClearData('guru')}
                  className="flex items-center gap-sm px-lg py-2 rounded-lg border border-danger/20 text-danger hover:bg-danger/5 transition-all font-label-md"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Reset
                </button>
              </div>
            </div>

            {/* Form Tambah Guru */}
            {showForm && (
              <form onSubmit={handleAdd} className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">Nama Guru</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">NIP</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">NUPTK</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.nuptk} onChange={e => setForm({...form, nuptk: e.target.value})} />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">Golongan</label>
                    <select className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.golongan} onChange={e => setForm({...form, golongan: e.target.value})}>
                      <option value="">Pilih Golongan</option>
                      <option>III/a</option><option>III/b</option><option>III/c</option><option>III/d</option>
                      <option>IV/a</option><option>IV/b</option><option>IV/c</option><option>IV/d</option><option>IV/e</option>
                    </select>
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">Jabatan</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.jabatan} onChange={e => setForm({...form, jabatan: e.target.value})} placeholder="Guru / TU / Perpustakaan" />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">Status</label>
                    <select className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      <option>PNS</option><option>CPNS</option><option>PPP</option><option>Honorer</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
                  <span className="material-symbols-outlined">save</span> Simpan
                </button>
              </form>
            )}

            {renderTable(guru, 'guru')}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB: TENAGA KEPENDIDIKAN (TENDIK)             */}
        {/* ════════════════════════════════════════════ */}
        {tab === 'tendik' && (
          <div className="space-y-lg">
            <div className="flex justify-between items-center">
              <p className="text-text-low font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">badge</span>
                {tendik.length} data tenaga kependidikan
              </p>
              {tendik.length > 0 && (
                <button
                  onClick={() => handleClearData('tendik')}
                  className="flex items-center gap-sm px-lg py-2 rounded-lg border border-danger/20 text-danger hover:bg-danger/5 transition-all font-label-md"
                >
                  <span className="material-symbols-outlined text-sm">delete_forever</span>
                  Hapus Semua
                </button>
              )}
            </div>
            {renderTable(tendik, 'tendik')}
          </div>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* TAB: UPLOAD EXCEL                             */}
        {/* ════════════════════════════════════════════ */}
        {tab === 'upload' && (
          <div className="space-y-lg">
            {/* Upload Progress */}
            {isUploading && (
              <div className="bg-primary-fixed/30 p-md rounded-xl flex items-center gap-sm border border-primary/20">
                <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                <p className="text-text-low text-sm">Memproses file Excel...</p>
              </div>
            )}

            {/* ══ TWO UPLOAD CARDS ══ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* ── Upload Data Guru ── */}
              <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant hover:border-primary/30 transition-all group">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-md group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-1">Upload Data Guru</h3>
                  <p className="text-text-low text-xs mb-4">File Excel Dapodik — daftar guru</p>
                </div>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-md text-center hover:border-primary/40 transition-colors">
                  <input
                    type="file"
                    ref={guruFileRef}
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'guru')}
                    className="hidden"
                    id="guru-file-input"
                  />
                  <label
                    htmlFor="guru-file-input"
                    className={`inline-flex items-center gap-2 px-lg py-2.5 rounded-xl font-label-md transition-all cursor-pointer ${
                      isUploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">upload</span>
                    {isUploading ? 'Uploading...' : 'Pilih File Excel Guru'}
                  </label>
                </div>
                <div className="mt-3 flex items-start gap-2 text-[10px] text-gray-400">
                  <span className="material-symbols-outlined text-xs flex-shrink-0">info</span>
                  <p>Format: Dapodik (51 kolom). Akan membaca: Nama, NIP, NUPTK, Golongan, Jabatan, Status</p>
                </div>
              </div>

              {/* ── Upload Data Tendik ── */}
              <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant hover:border-primary/30 transition-all group">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center mx-auto mb-md group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined text-3xl text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-1">Upload Data Tendik</h3>
                  <p className="text-text-low text-xs mb-4">File Excel Dapodik — tenaga kependidikan</p>
                </div>
                <div className="border-2 border-dashed border-outline-variant rounded-xl p-md text-center hover:border-primary/40 transition-colors">
                  <input
                    type="file"
                    ref={tendikFileRef}
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileUpload(e, 'tendik')}
                    className="hidden"
                    id="tendik-file-input"
                  />
                  <label
                    htmlFor="tendik-file-input"
                    className={`inline-flex items-center gap-2 px-lg py-2.5 rounded-xl font-label-md transition-all cursor-pointer ${
                      isUploading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:brightness-110 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30 active:scale-[0.98]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">upload</span>
                    {isUploading ? 'Uploading...' : 'Pilih File Excel Tendik'}
                  </label>
                </div>
                <div className="mt-3 flex items-start gap-2 text-[10px] text-gray-400">
                  <span className="material-symbols-outlined text-xs flex-shrink-0">info</span>
                  <p>Format: Dapodik (51 kolom). Akan membaca: Nama, NIP, NUPTK, Jenis PTK, Status</p>
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="bg-primary-fixed/20 p-lg rounded-xl border border-primary/10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-lg">description</span>
                <div>
                  <h4 className="font-label-md font-semibold text-text-high mb-1">Tentang Upload Excel</h4>
                  <ul className="text-sm text-text-low space-y-1">
                    <li>• File Excel dari Dapodik (format 51 kolom standar)</li>
                    <li>• Data Guru akan tampil di tab <strong>Guru</strong></li>
                    <li>• Data Tendik akan tampil di tab <strong>Tendik</strong></li>
                    <li>• Data dari upload akan otomatis menyimpan ke penyimpanan lokal</li>
                    <li>• Bisa tambah data guru manual di tab Guru</li>
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
