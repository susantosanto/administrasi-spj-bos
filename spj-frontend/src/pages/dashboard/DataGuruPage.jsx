import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

const MOCK_GURU = [
  { id: 1, nama: 'Dra. Siti Nurhaliza, M.Pd', nip: '196805151993012001', nuptk: '0672748641200143', golongan: 'IV/b', jabatan: 'Kepala Sekolah', mataPelajaran: 'Bahasa Indonesia', status: 'PNS' },
  { id: 2, nama: 'Ahmad Hidayat, S.Pd', nip: '197503202005011002', nuptk: '0774859731200532', golongan: 'III/d', jabatan: 'Guru', mataPelajaran: 'Matematika', status: 'PNS' },
  { id: 3, nama: 'Rina Wati, S.Pd', nip: '198006102008012003', nuptk: '0871960841200854', golongan: 'III/c', jabatan: 'Guru', mataPelajaran: 'Bahasa Inggris', status: 'PNS' },
  { id: 4, nama: 'Budi Santoso, S.Pd', nip: '198201252010011004', nuptk: '0973071951201021', golongan: 'III/b', jabatan: 'Guru', mataPelajaran: 'IPA', status: 'PNS' },
  { id: 5, nama: 'Dewi Kartika, S.Pd', nip: '198509182012012005', nuptk: '1074182061201233', golongan: 'III/a', jabatan: 'Guru', mataPelajaran: 'IPS', status: 'PNS' },
  { id: 6, nama: 'Hendra Wijaya, S.Pd', nip: '198703052015011006', nuptk: '1175293171201544', golongan: 'III/a', jabatan: 'Guru', mataPelajaran: 'Pendidikan Jasmani', status: 'PNS' },
  { id: 7, nama: 'Maya Sari, S.Pd', nip: '199001122018012007', nuptk: '1276304281201855', golongan: 'II/c', jabatan: 'Guru', mataPelajaran: 'Seni Budaya', status: 'CPNS' },
  { id: 8, nama: 'Rudi Hartono', nip: '198807202015011008', nuptk: '', golongan: '', jabatan: 'TU', mataPelajaran: '-', status: 'Honorer' },
  { id: 9, nama: 'Sri Mulyani', nip: '199205052020012009', nuptk: '', golongan: '', jabatan: 'Perpustakaan', mataPelajaran: '-', status: 'Honorer' },
  { id: 10, nama: 'Agus Supriyadi, S.Pd', nip: '198304152010011010', nuptk: '1377415391201066', golongan: 'III/c', jabatan: 'Guru', mataPelajaran: 'PKn', status: 'PNS' },
  { id: 11, nama: 'Linda Agustina, S.Pd', nip: '198608222014012011', nuptk: '1478526401201477', golongan: 'III/a', jabatan: 'Guru', mataPelajaran: 'Informatika', status: 'PNS' },
  { id: 12, nama: 'Eko Prasetyo', nip: '199102282022011012', nuptk: '', golongan: '', jabatan: 'Penjaga Sekolah', mataPelajaran: '-', status: 'Honorer' },
]

export default function DataGuruPage() {
  const [tab, setTab] = useState('table')
  const [guru, setGuru] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nama: '', nip: '', nuptk: '', golongan: '', jabatan: '', mataPelajaran: '', status: 'PNS' })
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('data_guru', null)
    if (stored && stored.length > 0) {
      setGuru(stored)
    } else {
      setGuru(MOCK_GURU)
      storageHelper.set('data_guru', MOCK_GURU)
    }
  }, [])

  const handleAdd = (e) => {
    e.preventDefault()
    const newItem = { id: Date.now(), ...form }
    const updated = [...guru, newItem]
    setGuru(updated)
    storageHelper.set('data_guru', updated)
    setForm({ nama: '', nip: '', nuptk: '', golongan: '', jabatan: '', mataPelajaran: '', status: 'PNS' })
    setShowForm(false)
    toast.success('Data guru berhasil ditambahkan')
  }

  const handleDelete = (id) => {
    const updated = guru.filter(g => g.id !== id)
    setGuru(updated)
    storageHelper.set('data_guru', updated)
    toast.success('Data guru berhasil dihapus')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Data Guru" subtitle="Data guru dan tenaga kependidikan" />

      <div className="p-lg space-y-lg flex-1">
        <div className="flex gap-sm">
          <button onClick={() => setTab('table')} className={`px-lg py-2 rounded-lg font-label-md transition-all ${tab === 'table' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined text-sm mr-1">table_chart</span> Tabel Data
          </button>
          <button onClick={() => setTab('upload')} className={`px-lg py-2 rounded-lg font-label-md transition-all ${tab === 'upload' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined text-sm mr-1">upload_file</span> Upload Excel
          </button>
        </div>

        {tab === 'table' ? (
          <>
            <div className="flex justify-between items-center">
              <p className="text-text-low font-body-sm">{guru.length} data guru tercatat</p>
              <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
                <span className="material-symbols-outlined">{showForm ? 'close' : 'add'}</span>
                {showForm ? 'Batal' : 'Tambah Guru'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAdd} className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">Nama Guru</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
                  </div>
                  <div className="space-y-xs">
                    <label className="font-label-md text-text-high">NIP</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={form.nip} onChange={e => setForm({...form, nip: e.target.value})} />
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
                    <label className="font-label-md text-text-high">Mata Pelajaran</label>
                    <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={form.mataPelajaran} onChange={e => setForm({...form, mataPelajaran: e.target.value})} />
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

            <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant uppercase tracking-wider">
                      <th className="px-lg py-md font-label-md text-xs">Nama</th>
                      <th className="px-lg py-md font-label-md text-xs">NIP</th>
                      <th className="px-lg py-md font-label-md text-xs">Golongan</th>
                      <th className="px-lg py-md font-label-md text-xs">Jabatan</th>
                      <th className="px-lg py-md font-label-md text-xs">Status</th>
                      <th className="px-lg py-md font-label-md text-xs text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm divide-y divide-outline-variant">
                    {guru.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant">
                        <span className="material-symbols-outlined text-4xl mb-2 block">groups</span>
                        Belum ada data guru
                      </td></tr>
                    ) : guru.map(g => (
                      <tr key={g.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-lg py-md font-medium text-text-high">{g.nama}</td>
                        <td className="px-lg py-md text-on-surface-variant font-mono text-xs">{g.nip}</td>
                        <td className="px-lg py-md text-on-surface-variant">{g.golongan}</td>
                        <td className="px-lg py-md text-on-surface-variant">{g.jabatan}</td>
                        <td className="px-lg py-md">
                          <span className={`px-3 py-1 rounded-full font-label-xs text-label-xs ${
                            g.status === 'PNS' ? 'bg-green-100 text-green-700' :
                            g.status === 'Honorer' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>{g.status}</span>
                        </td>
                        <td className="px-lg py-md text-center">
                          <button onClick={() => handleDelete(g.id)} className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant text-center">
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl hover:border-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-6xl text-outline mb-4 block">cloud_upload</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">Upload Data Guru & Tendik</h3>
              <p className="text-text-low text-sm mb-4">Drag & drop file Excel (.xlsx) atau klik untuk memilih file</p>
              <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md hover:brightness-110 transition-all">Pilih File</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
