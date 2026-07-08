import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

const DOKUMEN_SIPLAH = [
  { id: 'PBJ', nama: 'Dokumen PBJ', deskripsi: 'Dokumen Perencanaan Pengadaan Barang/Jasa', icon: 'folder_shared', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'DOKUMEN PBJ (SIPLAH)',
    subItems: ['Dokumen Perencanaan', 'Surat Pesanan', 'BAST', 'BAHP', 'Negosiasi Perbandingan'],
    formFields: [
      { name: 'nomorPesanan', label: 'Nomor Pesanan', type: 'text', placeholder: '001/PSN/III/2025' },
      { name: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
      { name: 'namaBarang', label: 'Nama Barang/Jasa', type: 'text', placeholder: 'Contoh: ATK Pendidikan' },
      { name: 'jumlah', label: 'Jumlah', type: 'number', placeholder: '0' },
      { name: 'satuan', label: 'Satuan', type: 'text', placeholder: 'Pcs / Set / Box' },
      { name: 'hargaSatuan', label: 'Harga Satuan (Rp)', type: 'number', placeholder: '0' },
    ]
  },
]

const DOKUMEN_NON_SIPLAH = [
  { id: 'PBJ', nama: 'Dokumen PBJ', deskripsi: 'Dokumen Perencanaan, Surat Pesanan, BAST, BAHP', icon: 'folder_shared', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'DOKUMEN PBJ (NON-SIPLAH)',
    subItems: ['Dokumen Perencanaan', 'Surat Pesanan', 'BAST', 'BAHP', 'Negosiasi Perbandingan'],
    formFields: [
      { name: 'nomorPesanan', label: 'Nomor Pesanan', type: 'text', placeholder: '001/PSN/III/2025' },
      { name: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
      { name: 'namaBarang', label: 'Nama Barang/Jasa', type: 'text', placeholder: 'Contoh: ATK Pendidikan' },
      { name: 'jumlah', label: 'Jumlah', type: 'number', placeholder: '0' },
    ]
  },
  { id: 'RK', nama: 'Register KAS', deskripsi: 'Register Kas BOS/BOSP', icon: 'menu_book', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'REGISTER KAS',
    subItems: ['Nomor Register', 'Tanggal', 'Uraian', 'Debet', 'Kredit', 'Saldo'],
    formFields: [
      { name: 'bulan', label: 'Bulan', type: 'text', placeholder: 'Januari 2025' },
      { name: 'nomorRegister', label: 'Nomor Register', type: 'text', placeholder: '001/RK/I/2025' },
    ]
  },
  { id: 'BAP', nama: 'BAP KAS', deskripsi: 'Berita Acara Pemeriksaan KAS', icon: 'fact_check', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'BERITA ACARA PEMERIKSAAN KAS',
    subItems: ['Tanggal Pemeriksaan', 'Hasil Pemeriksaan', 'Kesimpulan', 'Tanda Tangan'],
    formFields: [
      { name: 'tanggalPemeriksaan', label: 'Tanggal Pemeriksaan', type: 'date' },
      { name: 'namaPemeriksa', label: 'Nama Pemeriksa', type: 'text', placeholder: 'Nama Pemeriksa' },
      { name: 'hasilPemeriksaan', label: 'Hasil Pemeriksaan', type: 'text', placeholder: 'Sesuai / Tidak Sesuai' },
    ]
  },
  { id: 'KS', nama: 'Kritik & Saran', deskripsi: 'Lembar Kritik/Saran Sekolah', icon: 'rate_review', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'LEMBAR KRITIK & SARAN',
    subItems: ['Isi Kritik/Saran', 'Penulis', 'Tanggal'],
    formFields: [
      { name: 'isi', label: 'Isi Kritik / Saran', type: 'text', placeholder: 'Tulis kritik atau saran...' },
      { name: 'penulis', label: 'Penulis', type: 'text', placeholder: 'Nama Penulis' },
      { name: 'tanggal', label: 'Tanggal', type: 'date' },
    ]
  },
  { id: 'PD', nama: 'Pengaduan', deskripsi: 'Lembar Pengaduan Sekolah', icon: 'feedback', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'LEMBAR PENGADUAN',
    subItems: ['Isi Pengaduan', 'Pelapor', 'Tanggal', 'Status Penyelesaian'],
    formFields: [
      { name: 'isi', label: 'Isi Pengaduan', type: 'text', placeholder: 'Tulis pengaduan...' },
      { name: 'pelapor', label: 'Pelapor', type: 'text', placeholder: 'Nama Pelapor' },
      { name: 'tanggal', label: 'Tanggal', type: 'date' },
    ]
  },
  { id: 'PB', nama: 'Papan BOS', deskripsi: 'Papan Informasi BOS', icon: 'dashboard_customize', gradient: 'from-emerald-500 to-teal-600',
    templateTitle: 'PAPAN INFORMASI BOS',
    subItems: ['Data Anggaran', 'Data Realisasi', 'Foto Papan BOS'],
    formFields: [
      { name: 'anggaran', label: 'Total Anggaran (Rp)', type: 'number', placeholder: '0' },
      { name: 'realisasi', label: 'Total Realisasi (Rp)', type: 'number', placeholder: '0' },
      { name: 'keterangan', label: 'Keterangan', type: 'text', placeholder: 'Keterangan tambahan' },
    ]
  },
]

export default function DokumenWajibPage() {
  const [siplah, setSiplah] = useState(false)
  const [status, setStatus] = useState({})
  const [selectedDokumen, setSelectedDokumen] = useState(null)
  const [formData, setFormData] = useState({})
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('dokumen_kelengkapan_status', {})
    setStatus(stored)
  }, [])

  const dokumenList = siplah ? DOKUMEN_SIPLAH : DOKUMEN_NON_SIPLAH
  const completedCount = dokumenList.filter(d => status[d.id] === 'Selesai').length
  const progress = dokumenList.length > 0 ? Math.round((completedCount / dokumenList.length) * 100) : 0

  const toggleStatus = (id) => {
    const next = status[id] === 'Selesai' ? 'Belum' : 'Selesai'
    const updated = { ...status, [id]: next }
    setStatus(updated)
    storageHelper.set('dokumen_kelengkapan_status', updated)
    toast.success(`Status diubah ke ${next === 'Selesai' ? 'Selesai' : 'Belum'}`)
  }

  const handleOpenDokumen = (d) => {
    setSelectedDokumen(d)
    setFormData({})
  }

  const handleFormChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveForm = () => {
    toast.success(`Form "${selectedDokumen.nama}" berhasil disimpan (simulasi)`)
    setSelectedDokumen(null)
    setFormData({})
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Dokumen Kelengkapan" subtitle="Dokumen di luar ARKAS yang harus dilampirkan" />

      <div className="p-lg space-y-lg flex-1">
        {/* SIPLAH Toggle */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-primary text-3xl">toggle_on</span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">Mode SIPLAH</h3>
                <p className="text-text-low text-sm">{siplah ? 'Menggunakan sistem SIPLAH untuk pengadaan' : 'Tidak menggunakan SIPLAH - dokumen tambahan diperlukan'}</p>
              </div>
            </div>
            <button
              onClick={() => { setSiplah(!siplah); toast.success(siplah ? 'Mode Non-SIPLAH diaktifkan' : 'Mode SIPLAH diaktifkan'); }}
              className={`w-14 h-7 rounded-full transition-colors relative ${siplah ? 'bg-primary' : 'bg-outline-variant'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${siplah ? 'translate-x-7' : 'translate-x-0.5'}`}></span>
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-text-high">Progress Kelengkapan</span>
            <span className="font-label-md text-primary">{completedCount}/{dokumenList.length} ({progress}%)</span>
          </div>
          <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all" style={{ width: progress + '%' }} />
          </div>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {dokumenList.map(d => {
            const isSelesai = status[d.id] === 'Selesai'
            return (
              <div key={d.id} className="bg-surface-container-lowest rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => handleOpenDokumen(d)}>
                <div className={`h-24 bg-gradient-to-r ${d.gradient} flex items-center justify-between p-md`}>
                  <span className="material-symbols-outlined text-white text-4xl">{d.icon}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSelesai ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isSelesai ? 'Selesai' : 'Belum'}
                  </span>
                </div>
                <div className="p-md">
                  <h4 className="font-label-md text-text-high font-semibold">{d.nama}</h4>
                  <p className="text-text-low text-xs mt-1">{d.deskripsi}</p>
                  <div className="mt-md">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(d.id); }}
                      className={`w-full flex items-center justify-center gap-sm py-2 rounded-lg font-label-md transition-all active:scale-95 ${
                        isSelesai ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-primary text-on-primary hover:brightness-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{isSelesai ? 'check_circle' : 'edit'}</span>
                      {isSelesai ? 'Selesai' : 'Isi Form'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDokumen && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg" onClick={() => setSelectedDokumen(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className={`h-20 bg-gradient-to-r ${selectedDokumen.gradient} flex items-center justify-between p-lg shrink-0`}>
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-white text-4xl">{selectedDokumen.icon}</span>
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold text-white">{selectedDokumen.nama}</h2>
                  <p className="text-white/80 text-sm">Dokumen Kelengkapan {siplah ? 'SIPLAH' : 'Non-SIPLAH'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDokumen(null)} className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
                {/* Left: Template Preview */}
                <div className="p-lg space-y-md">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">visibility</span>
                    Format Dokumen
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-md flex items-start gap-sm">
                    <span className="material-symbols-outlined text-amber-600 text-lg">construction</span>
                    <div>
                      <p className="font-label-md text-amber-800">Prototype / Blueprint</p>
                      <p className="text-amber-700 text-xs">Format template dokumen ini masih dalam tahap pengembangan.</p>
                    </div>
                  </div>
                  <div className="bg-white border-2 border-dashed border-outline-variant rounded-xl p-xl text-center min-h-[300px] flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-6xl mb-4">{selectedDokumen.icon}</span>
                    <p className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">{selectedDokumen.templateTitle}</p>
                    <p className="text-text-low text-sm">Format dokumen akan ditampilkan di sini</p>
                    <div className="mt-4 p-md bg-surface-container-low rounded-lg w-full max-w-xs">
                      <p className="text-text-low text-xs italic">Dokumen ini memerlukan:</p>
                      <ul className="mt-2 space-y-1">
                        {selectedDokumen.subItems?.map((item, i) => (
                          <li key={i} className="text-text-high text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-sm">check</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right: Form Input */}
                <div className="p-lg space-y-md bg-surface-container-low/30">
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    Input Form
                  </h3>
                  <p className="text-text-low text-sm">Isi data yang diperlukan untuk dokumen ini.</p>

                  <div className="space-y-md">
                    {selectedDokumen.formFields?.map((field, i) => (
                      <div key={i} className="space-y-xs">
                        <label className="font-label-md text-text-high">{field.label}</label>
                        <input
                          type={field.type}
                          className="w-full px-md py-2 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder={field.placeholder || ''}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-sm pt-md border-t border-outline-variant">
                    <button onClick={handleSaveForm} className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
                      <span className="material-symbols-outlined">save</span> Simpan Draft
                    </button>
                    <button onClick={() => { toggleStatus(selectedDokumen.id); toast.success('Status diubah'); setSelectedDokumen(null); }} className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-2 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md">
                      <span className="material-symbols-outlined">check_circle</span> Tandai Selesai
                    </button>
                    <button onClick={() => { toast.info(`Cetak ${selectedDokumen.nama}`); }} className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-2 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md">
                      <span className="material-symbols-outlined">print</span> Cetak
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
