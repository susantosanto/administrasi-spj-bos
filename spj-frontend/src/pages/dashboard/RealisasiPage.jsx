import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

const REALISASI_ITEMS = [
  { id: 'R-CVR', nama: 'Cover Realisasi', deskripsi: 'Cover laporan realisasi dana BOSP', icon: 'folder', gradient: 'from-orange-500 to-red-600', isForm: true },
  { id: 'R-SKT', nama: 'Sekat Realisasi', deskripsi: 'Tabel sekat anggaran vs realisasi', icon: 'table_chart', gradient: 'from-orange-500 to-red-600', isForm: true },
  { id: 'R-ALR', nama: 'Alur Realisasi', deskripsi: 'Alur penggunaan dana BOSP', icon: 'account_tree', gradient: 'from-orange-500 to-red-600', isForm: true },
]

export default function RealisasiPage() {
  const [status, setStatus] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('realisasi_status', {})
    setStatus(stored)
  }, [])

  const toggleStatus = (id) => {
    const next = status[id] === 'Selesai' ? 'Belum' : 'Selesai'
    const updated = { ...status, [id]: next }
    setStatus(updated)
    storageHelper.set('realisasi_status', updated)
    toast.success(`Status "${REALISASI_ITEMS.find(d => d.id === id)?.nama}" diubah`)
  }

  const completedCount = REALISASI_ITEMS.filter(d => status[d.id] === 'Selesai').length
  const progress = Math.round((completedCount / REALISASI_ITEMS.length) * 100)

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Realisasi BOSP" subtitle="Dokumen realisasi dana BOS/BOSP" />

      <div className="p-lg space-y-lg flex-1">
        {/* Progress */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex justify-between items-center mb-sm">
            <span className="font-label-md text-text-high">Progress Realisasi</span>
            <span className="font-label-md text-primary">{completedCount}/{REALISASI_ITEMS.length} ({progress}%)</span>
          </div>
          <div className="w-full h-3 bg-surface-container-low rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style={{ width: progress + '%' }} />
          </div>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {REALISASI_ITEMS.map(d => {
            const isSelesai = status[d.id] === 'Selesai'
            return (
              <div key={d.id} className="bg-surface-container-lowest rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer" onClick={() => setSelectedItem(d)}>
                <div className={`h-24 bg-gradient-to-r ${d.gradient} flex items-center justify-between p-md`}>
                  <span className="material-symbols-outlined text-white text-4xl">{d.icon}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isSelesai ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {isSelesai ? 'Selesai' : 'Belum'}
                  </span>
                </div>
                <div className="p-md">
                  <h4 className="font-label-md text-text-high font-semibold">{d.nama}</h4>
                  <p className="text-text-low text-xs mt-1">{d.deskripsi}</p>
                  <div className="flex gap-sm mt-md">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(d.id); }}
                      className={`flex-1 flex items-center justify-center gap-sm py-2 rounded-lg font-label-md transition-all active:scale-95 ${
                        isSelesai ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-primary text-on-primary hover:brightness-110'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">{isSelesai ? 'check_circle' : 'edit'}</span>
                      {isSelesai ? 'Selesai' : 'Isi Form'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.info(`Cetak ${d.nama}`); }}
                      className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary">print</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <div>
              <h4 className="font-label-md text-text-high mb-1">Tentang Realisasi BOSP</h4>
              <p className="text-text-low text-sm">Dokumen realisasi terdiri dari Cover, Sekat, dan Alur penggunaan dana BOSP. Isi form untuk setiap bagian, lalu cetak dokumen yang sudah lengkap.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg" onClick={() => setSelectedItem(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className={`h-24 bg-gradient-to-r ${selectedItem.gradient} flex items-center justify-between p-lg`}>
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-white text-4xl">{selectedItem.icon}</span>
                <h2 className="font-headline-md text-headline-md font-bold text-white">{selectedItem.nama}</h2>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg">
              <p className="text-text-low mb-md">{selectedItem.deskripsi}</p>
              <div className="bg-surface-container-low rounded-lg p-md text-center">
                <span className="material-symbols-outlined text-outline text-4xl mb-2 block">construction</span>
                <p className="text-text-low text-sm">Form input akan segera tersedia</p>
              </div>
              <div className="flex gap-sm mt-md">
                <button onClick={() => { toggleStatus(selectedItem.id); setSelectedItem(null); }} className="flex-1 bg-primary text-on-primary py-2 rounded-lg font-label-md hover:brightness-110 transition-all">
                  Tandai Selesai
                </button>
                <button onClick={() => { toast.info(`Cetak ${selectedItem.nama}`); setSelectedItem(null); }} className="flex items-center gap-sm px-lg py-2 border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-high transition-all">
                  <span className="material-symbols-outlined">print</span> Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
