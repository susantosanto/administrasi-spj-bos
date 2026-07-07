import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

const defaultData = {
  npsn: '', namaSekolah: '', kecamatan: '', kabupaten: '', alamat: '', email: '',
  pejabat: {
    ks: { nama: '', nip: '' },
    bendahara: { nama: '', nip: '' },
    pengawas: { nama: '', nip: '' },
    sekdik: { nama: '', nip: '' },
  }
}

export default function DataSekolahPage() {
  const [tab, setTab] = useState('form')
  const [data, setData] = useState(defaultData)
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored) setData(stored)
  }, [])

  const handleSave = (e) => {
    e.preventDefault()
    storageHelper.set('data_sekolah', data)
    toast.success('Data sekolah berhasil disimpan')
  }

  const updateField = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const updatePejabat = (jabatan, field, value) => {
    setData(prev => ({
      ...prev,
      pejabat: { ...prev.pejabat, [jabatan]: { ...prev.pejabat[jabatan], [field]: value } }
    }))
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Data Sekolah" subtitle="Profil sekolah dan data pejabat" />

      <div className="p-lg space-y-lg flex-1">
        {/* Tab Switcher */}
        <div className="flex gap-sm">
          <button
            onClick={() => setTab('form')}
            className={`px-lg py-2 rounded-lg font-label-md transition-all ${tab === 'form' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-sm mr-1">edit</span>
            Form Input
          </button>
          <button
            onClick={() => setTab('upload')}
            className={`px-lg py-2 rounded-lg font-label-md transition-all ${tab === 'upload' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-sm mr-1">upload_file</span>
            Upload Excel
          </button>
        </div>

        {tab === 'form' ? (
          <form onSubmit={handleSave} className="space-y-lg">
            {/* Data Sekolah */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">school</span>
                Data Profil Sekolah
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-text-high">NPSN</label>
                  <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={data.npsn} onChange={e => updateField('npsn', e.target.value)} placeholder="Nomor Pokok Sekolah Nasional" />
                </div>
                <div className="space-y-xs md:col-span-2">
                  <label className="font-label-md text-text-high">Nama Sekolah</label>
                  <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={data.namaSekolah} onChange={e => updateField('namaSekolah', e.target.value)} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-text-high">Kecamatan</label>
                  <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={data.kecamatan} onChange={e => updateField('kecamatan', e.target.value)} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-text-high">Kabupaten</label>
                  <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required value={data.kabupaten} onChange={e => updateField('kabupaten', e.target.value)} />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-text-high">Email</label>
                  <input type="email" className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" value={data.email} onChange={e => updateField('email', e.target.value)} placeholder="email@sekolah.sch.id" />
                </div>
                <div className="space-y-xs md:col-span-3">
                  <label className="font-label-md text-text-high">Alamat Sekolah</label>
                  <textarea className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" rows={2} value={data.alamat} onChange={e => updateField('alamat', e.target.value)} placeholder="Jl/KP, RT, RW, Desa" />
                </div>
              </div>
            </div>

            {/* Data Pejabat */}
            <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">badge</span>
                Data Pejabat Sekolah
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {[
                  { key: 'ks', label: 'Kepala Sekolah' },
                  { key: 'bendahara', label: 'Bendahara' },
                  { key: 'pengawas', label: 'Pengawas Bina' },
                  { key: 'sekdik', label: 'Sekretaris Dinas Pendidikan' },
                ].map(p => (
                  <div key={p.key} className="p-md bg-surface-container-low rounded-lg border border-outline-variant">
                    <h4 className="font-label-md text-primary mb-sm">{p.label}</h4>
                    <div className="space-y-sm">
                      <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder={`Nama ${p.label}`} value={data.pejabat[p.key].nama} onChange={e => updatePejabat(p.key, 'nama', e.target.value)} />
                      <input className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm" placeholder="NIP" value={data.pejabat[p.key].nip} onChange={e => updatePejabat(p.key, 'nip', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">save</span>
              Simpan Data Sekolah
            </button>
          </form>
        ) : (
          /* Upload Tab */
          <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant text-center">
            <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl hover:border-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-6xl text-outline mb-4 block">cloud_upload</span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">Upload Data Sekolah</h3>
              <p className="text-text-low text-sm mb-4">Drag & drop file Excel (.xlsx) atau klik untuk memilih file</p>
              <button className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md hover:brightness-110 transition-all">
                Pilih File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
