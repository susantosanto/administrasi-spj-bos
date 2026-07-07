import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

const MOCK_BKU = [
  { id: 1, tanggal: '02 Jan 2024', uraian: 'Saldo Awal Tahun 2024', kode: '4.2.1.01.01', debet: 85000000, kredit: 0, saldo: 85000000 },
  { id: 2, tanggal: '05 Jan 2024', uraian: 'Pembayaran Honor Guru GTT', kode: '5.1.02.02.01', debet: 0, kredit: 7500000, saldo: 77500000 },
  { id: 3, tanggal: '10 Jan 2024', uraian: 'Pembelian ATK', kode: '5.2.02.01.01', debet: 0, kredit: 1250000, saldo: 76250000 },
  { id: 4, tanggal: '15 Jan 2024', uraian: 'Langganan Internet & Listrik', kode: '5.2.02.05.02', debet: 0, kredit: 2800000, saldo: 73450000 },
  { id: 5, tanggal: '20 Jan 2024', uraian: 'Makan dan Minum Rapat Komite', kode: '5.2.02.03.01', debet: 0, kredit: 1500000, saldo: 71950000 },
  { id: 6, tanggal: '22 Jan 2024', uraian: 'Makan dan Minum Kegiatan Sosialisasi', kode: '5.2.02.03.02', debet: 0, kredit: 2000000, saldo: 69950000 },
]

const MAMIN_DOCS = {
  'Makan dan Minum Rapat': [
    { nama: 'Surat Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Resume Rapat', icon: 'description', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
  'Makan dan Minum Kegiatan': [
    { nama: 'Surat Perintah / Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Resume Kegiatan', icon: 'description', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
  'Makan dan Minum Tamu': [
    { nama: 'Surat Undangan', icon: 'mail', status: 'Belum' },
    { nama: 'Daftar Hadir', icon: 'group', status: 'Belum' },
    { nama: 'Foto Kegiatan', icon: 'photo_camera', status: 'Belum' },
  ],
}

function isMaminUraian(uraian) {
  const lower = uraian.toLowerCase()
  return lower.includes('makan') || lower.includes('minum') || lower.includes('mamin')
}

function getMaminType(uraian) {
  const lower = uraian.toLowerCase()
  if (lower.includes('rapat')) return 'Makan dan Minum Rapat'
  if (lower.includes('kegiatan') || lower.includes('sosialisasi')) return 'Makan dan Minum Kegiatan'
  if (lower.includes('tamu')) return 'Makan dan Minum Tamu'
  return 'Makan dan Minum Rapat'
}

export default function BKUPage() {
  const [items, setItems] = useState([])
  const [filterBulan, setFilterBulan] = useState('Semua')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [selectedMamin, setSelectedMamin] = useState(null)
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('bku_reference', null)
    if (stored && stored.length > 0) {
      setItems(stored)
    } else {
      setItems(MOCK_BKU)
      storageHelper.set('bku_reference', MOCK_BKU)
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setOpenMenuId(null)
    if (openMenuId !== null) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [openMenuId])

  const fmt = (n) => Number(n).toLocaleString('id-ID')
  const totalDebet = items.reduce((s, i) => s + i.debet, 0)
  const totalKredit = items.reduce((s, i) => s + i.kredit, 0)
  const lastSaldo = items.length > 0 ? items[items.length - 1].saldo : 0

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Upload BKU" subtitle="Upload BKU Excel sebagai referensi pembuatan dokumen" />

      <div className="p-lg space-y-lg flex-1">
        {/* Upload Area */}
        <div className="bg-surface-container-lowest p-xl rounded-xl shadow-lg border border-outline-variant">
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl text-center hover:border-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">upload_file</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">Upload File BKU Excel</h3>
            <p className="text-text-low text-sm mb-4">Drag & drop file Excel (.xlsx) BKU dari ARKAS atau klik untuk memilih file</p>
            <button
              onClick={() => toast.success('File BKU berhasil diupload (simulasi)')}
              className="bg-primary text-on-primary px-lg py-2 rounded-lg font-label-md hover:brightness-110 transition-all"
            >
              Pilih File Excel
            </button>
          </div>
          <div className="mt-md p-md bg-primary-fixed/30 rounded-lg flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <p className="text-text-low text-sm">BKU yang diupload akan digunakan sebagai referensi data untuk pembuatan dokumen SPJ dan bukti fisik.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="glass-card p-lg rounded-xl shadow-lg border-l-4 border-primary">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-label-md text-on-surface-variant">Total Penerimaan</span>
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold">Rp {fmt(totalDebet)}</h3>
          </div>
          <div className="glass-card p-lg rounded-xl shadow-lg border-l-4 border-danger">
            <div className="flex justify-between items-start mb-sm">
              <span className="text-label-md text-on-surface-variant">Total Pengeluaran</span>
              <span className="material-symbols-outlined text-danger" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold">Rp {fmt(totalKredit)}</h3>
          </div>
          <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-sm">
                <span className="text-label-md opacity-80">Saldo Akhir</span>
                <span className="material-symbols-outlined opacity-80">wallet</span>
              </div>
              <h3 className="font-headline-md text-headline-md font-bold">Rp {fmt(lastSaldo)}</h3>
            </div>
          </div>
        </div>

        {/* Reference Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div>
              <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">Referensi BKU</h4>
              <p className="text-text-low text-sm">Data dari file Excel yang diupload</p>
            </div>
            <select
              className="bg-surface border border-outline-variant rounded-lg px-md py-2 text-label-md outline-none"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
            >
              <option>Semua</option>
              <option>Januari</option><option>Februari</option><option>Maret</option>
              <option>April</option><option>Mei</option><option>Juni</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container text-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="px-lg py-md font-label-md text-xs">No</th>
                  <th className="px-lg py-md font-label-md text-xs">Tanggal</th>
                  <th className="px-lg py-md font-label-md text-xs">Uraian</th>
                  <th className="px-lg py-md font-label-md text-xs">Kode</th>
                  <th className="px-lg py-md font-label-md text-xs text-right">Debet (Rp)</th>
                  <th className="px-lg py-md font-label-md text-xs text-right">Kredit (Rp)</th>
                  <th className="px-lg py-md font-label-md text-xs text-right">Saldo (Rp)</th>
                  <th className="px-lg py-md font-label-md text-xs text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-body-sm divide-y divide-outline-variant">
                {items.map((item, idx) => {
                  const isMamin = isMaminUraian(item.uraian)
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-lg py-md">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-lg py-md whitespace-nowrap">{item.tanggal}</td>
                      <td className="px-lg py-md font-medium text-text-high">{item.uraian}</td>
                      <td className="px-lg py-md font-mono text-xs">{item.kode}</td>
                      <td className="px-lg py-md text-right text-secondary">{item.debet > 0 ? fmt(item.debet) : '-'}</td>
                      <td className="px-lg py-md text-right text-danger">{item.kredit > 0 ? fmt(item.kredit) : '-'}</td>
                      <td className="px-lg py-md text-right font-bold">{fmt(item.saldo)}</td>
                      <td className="px-lg py-md text-center">
                        {isMamin ? (
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === item.id ? null : item.id); }}
                              className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                            {openMenuId === item.id && (
                              <div className="absolute right-0 top-full mt-1 w-72 bg-surface-container-lowest rounded-xl shadow-2xl border border-outline-variant z-50 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                <div className="p-md bg-surface-container-low border-b border-outline-variant">
                                  <p className="font-label-md text-text-high">Dokumen SPJ Diperlukan</p>
                                  <p className="text-text-low text-xs">{item.uraian}</p>
                                </div>
                                <div className="p-sm">
                                  {MAMIN_DOCS[getMaminType(item.uraian)].map((doc, i) => (
                                    <button
                                      key={i}
                                      onClick={() => { setSelectedMamin({ ...doc, bkuUraian: item.uraian }); setOpenMenuId(null); }}
                                      className="w-full flex items-center gap-md p-md hover:bg-surface-container-high rounded-lg transition-colors text-left"
                                    >
                                      <span className="material-symbols-outlined text-primary text-xl">{doc.icon}</span>
                                      <div className="flex-1">
                                        <p className="font-label-md text-text-high">{doc.nama}</p>
                                      </div>
                                      <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                                    </button>
                                  ))}
                                </div>
                                <div className="p-sm border-t border-outline-variant">
                                  <button
                                    onClick={() => { toast.info('Buka halaman Dokumen SPJ untuk Makan & Minum'); setOpenMenuId(null); }}
                                    className="w-full flex items-center justify-center gap-sm p-md text-primary hover:bg-primary/5 rounded-lg transition-colors font-label-md"
                                  >
                                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                                    Buka Dokumen SPJ
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-low text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot className="bg-surface-container-low font-bold">
                <tr>
                  <td className="px-lg py-lg text-right" colSpan="4">TOTAL</td>
                  <td className="px-lg py-lg text-right text-secondary">{fmt(totalDebet)}</td>
                  <td className="px-lg py-lg text-right text-danger">{fmt(totalKredit)}</td>
                  <td className="px-lg py-lg text-right text-primary text-lg">{fmt(lastSaldo)}</td>
                  <td className="px-lg py-lg"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Mamin Document Preview Modal */}
      {selectedMamin && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg" onClick={() => setSelectedMamin(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="p-lg border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-primary text-3xl">{selectedMamin.icon}</span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">{selectedMamin.nama}</h3>
                  <p className="text-text-low text-xs">Untuk: {selectedMamin.bkuUraian}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMamin(null)} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-lg space-y-md">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-md flex items-start gap-sm">
                <span className="material-symbols-outlined text-amber-600 text-lg">construction</span>
                <div>
                  <p className="font-label-md text-amber-800">Prototype / Blueprint</p>
                  <p className="text-amber-700 text-xs">Format template dokumen ini masih dalam tahap pengembangan.</p>
                </div>
              </div>
              <div className="bg-surface-container-low rounded-xl p-lg text-center border-2 border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-outline text-5xl mb-2 block">{selectedMamin.icon}</span>
                <p className="font-label-md text-text-high">{selectedMamin.nama}</p>
                <p className="text-text-low text-xs mt-1">Template dokumen akan ditampilkan di sini</p>
              </div>
              <button
                onClick={() => { toast.info(`Membuka form ${selectedMamin.nama}...`); setSelectedMamin(null); }}
                className="w-full bg-primary text-on-primary py-2 rounded-lg font-label-md hover:brightness-110 transition-all"
              >
                Isi Form Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
