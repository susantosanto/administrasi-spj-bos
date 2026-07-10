import { useState, useEffect, useRef } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import { parseSekolahExcel } from '../../utils/sekolahParser'

const defaultData = {
  npsn: '', namaSekolah: '', kecamatan: '', kabupaten: '', provinsi: '', alamat: '', email: '', tahunAnggaran: '',
  allFields: [],
  pejabat: {
    ks: { nama: '', nip: '' },
    bendahara: { nama: '', nip: '' },
    pengawas: { nama: '', nip: '' },
    sekdik: { nama: '', nip: '' },
  }
}

// ─── Section Display ───────────────────────────────────────────

function DataSection({ title, fields }) {
  if (!fields || fields.length === 0) return null
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="px-lg py-md bg-gray-50/80 border-b border-gray-100">
        <h4 className="font-label-md font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {title}
        </h4>
      </div>
      <div className="divide-y divide-gray-50">
        {fields.map((f, i) => (
          <div key={i} className="flex items-start gap-md px-lg py-3 hover:bg-gray-50/50 transition-colors">
            <span className="text-gray-400 text-xs font-medium w-1/3 flex-shrink-0 pt-0.5">{f.label}</span>
            <span className="text-gray-800 text-sm font-semibold flex-1 break-words">{f.value || '-'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────

export default function DataSekolahPage() {
  const [tab, setTab] = useState('sekolah')
  const [data, setData] = useState(defaultData)
  const [isUploading, setIsUploading] = useState(false)
  const toast = useToast()
  const fileInputRef = useRef(null)

  useEffect(() => {
    const stored = storageHelper.get('data_sekolah', null)
    if (stored) setData(stored)
  }, [])

  const handleSavePejabat = (e) => {
    e.preventDefault()
    storageHelper.set('data_sekolah', { ...data })
    toast.success('Data pejabat berhasil disimpan')
  }

  const updatePejabat = (jabatan, field, value) => {
    setData(prev => ({
      ...prev,
      pejabat: { ...prev.pejabat, [jabatan]: { ...prev.pejabat[jabatan], [field]: value } }
    }))
  }

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
        ...(stored || data), ...newData,
        allFields: result.allFields || stored?.allFields || [],
        pejabat: stored?.pejabat || data.pejabat,
      })

      setData(newData)
      setTab('sekolah')
      toast.success(`✅ Data sekolah berhasil diupload: ${header.nama_sekolah || header.npsn || '-'}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(`❌ Gagal memproses file: ${error.message}`)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ─── Group fields by section ─────────────────────────────────

  const grouped = { identitas: [], pelengkap: [], kontak: [], periodik: [], sanitasi: [] }
  let currentGroup = 'identitas'
  const allFields = data.allFields || []

  allFields.forEach(f => {
    const label = (f.label || '').toLowerCase()
    const sec = (f.section || '').toLowerCase()
    if (sec.includes('pelengkap')) currentGroup = 'pelengkap'
    else if (sec.includes('kontak')) currentGroup = 'kontak'
    else if (sec.includes('periodik')) currentGroup = 'periodik'
    else if (sec.includes('sanitasi')) currentGroup = 'sanitasi'
    if (grouped[currentGroup]) grouped[currentGroup].push(f)
  })

  const hasSchoolData = data.npsn || data.namaSekolah || allFields.length > 0

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Data Sekolah" subtitle="Profil sekolah dan data pejabat" />
      <div className="p-lg space-y-lg flex-1">

        {/* ══ TABS ══ */}
        <div className="flex gap-sm flex-wrap">
          {[
            { key: 'sekolah', icon: 'school', label: 'Data Sekolah' },
            { key: 'pejabat', icon: 'badge', label: 'Pejabat' },
            { key: 'upload', icon: 'upload_file', label: 'Upload Excel' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`relative px-lg py-2.5 rounded-xl font-label-md transition-all duration-200 overflow-hidden group ${
                tab === t.key
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 scale-[1.02]'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high hover:border-primary/30'
              }`}>
              {tab === t.key && (
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              )}
              <span className="material-symbols-outlined text-sm mr-1 relative z-10">{t.icon}</span>
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* TAB: DATA SEKOLAH — Single Premium Card   */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'sekolah' && (
          <>
            {!hasSchoolData ? (
              <div className="bg-white rounded-xl shadow-lg p-xl text-center border border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-fixed/20 flex items-center justify-center mx-auto mb-md">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-gray-800 mb-2">Belum Ada Data Sekolah</h3>
                <p className="text-gray-400 text-sm mb-md">Upload file Excel untuk mengisi data profil sekolah</p>
                <button onClick={() => setTab('upload')}
                  className="inline-flex items-center gap-2 bg-primary text-on-primary px-lg py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20 font-label-md">
                  <span className="material-symbols-outlined text-lg">upload</span>
                  Upload Data Sekolah
                </button>
              </div>
            ) : (
              /* ══ SINGLE PREMIUM CARD ══ */
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-primary to-blue-700 p-lg relative overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                  <div className="relative z-10 flex items-start gap-md">
                    <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0 shadow-inner backdrop-blur-sm">
                      <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-on-primary/50 text-xs font-bold uppercase tracking-[0.2em] mb-1">PROFIL SEKOLAH</p>
                      <h2 className="font-headline-md text-headline-md font-bold text-on-primary leading-tight break-words">
                        {data.namaSekolah || 'SD NEGERI ...'}
                      </h2>
                      <div className="flex flex-wrap gap-x-lg gap-y-1 mt-2">
                        <span className="text-on-primary/75 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">fingerprint</span>
                          NPSN: {data.npsn || '-'}
                        </span>
                        {data.tahunAnggaran && (
                          <span className="text-on-primary/75 text-sm flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_month</span>
                            Tahun: {data.tahunAnggaran}
                          </span>
                        )}
                        <span className="text-on-primary/75 text-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {data.kecamatan || data.kabupaten || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Sections ── */}
                {grouped.identitas.length > 0 && (
                  <DataSection title="Identitas Sekolah" fields={grouped.identitas} />
                )}
                {grouped.pelengkap.length > 0 && (
                  <DataSection title="Data Pelengkap" fields={grouped.pelengkap} />
                )}
                {grouped.kontak.length > 0 && (
                  <DataSection title="Kontak Sekolah" fields={grouped.kontak} />
                )}
                {grouped.periodik.length > 0 && (
                  <DataSection title="Data Periodik" fields={grouped.periodik} />
                )}
                {grouped.sanitasi.length > 0 && (
                  <DataSection title="Sanitasi" fields={grouped.sanitasi} />
                )}

                {/* ── Footer ── */}
                <div className="px-lg py-md bg-gray-50/80 border-t border-gray-100 text-center">
                  <p className="text-gray-400 text-xs">{allFields.length} field data • Profil Sekolah</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: PEJABAT                               */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'pejabat' && (
          <form onSubmit={handleSavePejabat} className="space-y-lg">
            <div className="bg-white rounded-xl shadow-lg p-lg border border-gray-100">
              <h3 className="font-headline-sm text-headline-sm font-bold text-gray-900 mb-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary">badge</span>
                Data Pejabat Sekolah
              </h3>
              <p className="text-gray-400 text-sm mb-md ml-1">Diisi secara manual</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                {[
                  { key: 'ks', label: 'Kepala Sekolah' },
                  { key: 'bendahara', label: 'Bendahara' },
                  { key: 'pengawas', label: 'Pengawas Bina' },
                  { key: 'sekdik', label: 'Sekretaris Dinas Pendidikan' },
                ].map(p => (
                  <div key={p.key} className="p-md bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-label-md text-primary mb-sm">{p.label}</h4>
                    <div className="space-y-sm">
                      <input className="w-full px-md py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder={`Nama ${p.label}`} value={data.pejabat[p.key].nama}
                        onChange={e => updatePejabat(p.key, 'nama', e.target.value)} />
                      <input className="w-full px-md py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-sm"
                        placeholder="NIP" value={data.pejabat[p.key].nip}
                        onChange={e => updatePejabat(p.key, 'nip', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button type="submit" className="flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-xl hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">save</span> Simpan Data Pejabat
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* TAB: UPLOAD                                */}
        {/* ══════════════════════════════════════════ */}
        {tab === 'upload' && (
          <div className="space-y-lg">
            <div className="bg-white rounded-xl shadow-lg p-xl border border-gray-100">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-xl text-center hover:border-primary transition-colors group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-fixed/20 flex items-center justify-center mx-auto mb-md group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-gray-800 mb-2">Upload Data Sekolah</h3>
                <p className="text-gray-400 text-sm mb-4">Upload file Excel (.xlsx) — data profil sekolah akan langsung terisi</p>
                <input type="file" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileUpload} className="hidden" id="sekolah-file-input" />
                <label htmlFor="sekolah-file-input"
                  className={`inline-flex items-center gap-2 px-lg py-2.5 rounded-xl font-label-md transition-all cursor-pointer ${
                    isUploading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-primary text-on-primary hover:brightness-110 shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98]'
                  }`}>
                  <span className="material-symbols-outlined text-lg">upload</span>
                  {isUploading ? 'Memproses...' : 'Pilih File Excel'}
                </label>
              </div>
              {isUploading && (
                <div className="mt-md p-md bg-blue-50 rounded-xl flex items-center gap-sm border border-blue-100">
                  <span className="material-symbols-outlined text-primary animate-spin">sync</span>
                  <p className="text-gray-500 text-sm">Memproses file...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
