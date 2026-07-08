import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'

const DOKUMEN_TYPES = [
  { id: 'HON', nama: 'Honorarium', kategori: 'Honor & Narasumber' },
  { id: 'HON-P', nama: 'Honor Pelaksana', kategori: 'Honor & Narasumber' },
  { id: 'NSB', nama: 'Narasumber', kategori: 'Honor & Narasumber' },
  { id: 'PD', nama: 'Perjalanan Dinas', kategori: 'Perjalanan Dinas' },
  { id: 'MR', nama: 'Mamin Rapat', kategori: 'Makan & Minum' },
  { id: 'MK', nama: 'Mamin Kegiatan', kategori: 'Makan & Minum' },
  { id: 'MT', nama: 'Mamin Tamu', kategori: 'Makan & Minum' },
  { id: 'PG', nama: 'Penggandaan', kategori: 'Dokumen Pendukung' },
  { id: 'CF', nama: 'Cetak Foto', kategori: 'Dokumen Pendukung' },
  { id: 'CB', nama: 'Cetak Banner', kategori: 'Dokumen Pendukung' },
  { id: 'SW', nama: 'Sewa', kategori: 'Sewa & Pemeliharaan' },
  { id: 'PL', nama: 'Pemeliharaan', kategori: 'Sewa & Pemeliharaan' },
  { id: 'TG', nama: 'Tagihan', kategori: 'Sewa & Pemeliharaan' },
  { id: 'WS-I', nama: 'Workshop Internal', kategori: 'Workshop' },
  { id: 'WS-E', nama: 'Workshop Eksternal', kategori: 'Workshop' },
  { id: 'PR', nama: 'PR Pengadaan', kategori: 'Pengadaan & Koran' },
  { id: 'RK', nama: 'Rekening Koran', kategori: 'Pengadaan & Koran' },
  { id: 'D-PBJ', nama: 'Dokumen PBJ', kategori: 'Dokumen Kelengkapan' },
  { id: 'D-RK', nama: 'Register KAS', kategori: 'Dokumen Kelengkapan' },
  { id: 'D-BK', nama: 'BAP KAS', kategori: 'Dokumen Kelengkapan' },
  { id: 'D-KS', nama: 'Kritik & Saran', kategori: 'Dokumen Kelengkapan' },
  { id: 'D-PD', nama: 'Pengaduan', kategori: 'Dokumen Kelengkapan' },
  { id: 'D-PB', nama: 'Papan BOS', kategori: 'Dokumen Kelengkapan' },
  { id: 'R-CVR', nama: 'Cover Realisasi', kategori: 'Realisasi BOSP' },
  { id: 'R-SKT', nama: 'Sekat Realisasi', kategori: 'Realisasi BOSP' },
  { id: 'R-ALR', nama: 'Alur Realisasi', kategori: 'Realisasi BOSP' },
]

export default function DashboardHome() {
  const [dokumenStatus, setDokumenStatus] = useState({})
  const [sekolah, setSekolah] = useState(null)

  useEffect(() => {
    const status = storageHelper.get('dokumen_spj', {})
    setDokumenStatus(status)
    const sek = storageHelper.get('data_sekolah', null)
    setSekolah(sek)
  }, [])

  const totalLengkap = DOKUMEN_TYPES.filter(d => dokumenStatus[d.id]?.status === 'Lengkap').length
  const totalDraft = DOKUMEN_TYPES.filter(d => dokumenStatus[d.id]?.status === 'Draft').length
  const totalBelum = DOKUMEN_TYPES.filter(d => !dokumenStatus[d.id]?.status || dokumenStatus[d.id]?.status === 'Belum').length
  const totalDokumen = DOKUMEN_TYPES.length

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Beranda Utama" subtitle="Ringkasan dokumen LPJ" />

      <div className="p-lg space-y-lg flex-1">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-primary to-primary-container p-lg rounded-2xl shadow-lg text-on-primary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold mb-xs">
                Sampurasun, {sekolah?.namaSekolah ? `${sekolah.namaSekolah}` : 'Operator Sekolah'}!
              </h2>
              <p className="text-white/80 font-body-sm">
                Kelola dan cetak dokumen LPJ BOS/BOSP dengan mudah. Pilih dokumen yang ingin Anda kerjakan.
              </p>
            </div>
            <Link to="/dashboard/dokumen-lpj" className="hidden md:flex items-center gap-sm bg-white/20 hover:bg-white/30 px-lg py-2 rounded-lg font-label-md transition-all active:scale-95">
              <span className="material-symbols-outlined">description</span>
              Buka Dokumen LPJ
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
          <div className="bento-card p-lg rounded-xl bg-primary text-on-primary shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-label-md opacity-80 mb-xs">Total Dokumen</p>
              <h3 className="font-headline-md text-headline-md font-bold">{totalDokumen} Jenis</h3>
              <p className="text-xs opacity-70 mt-sm">26 template dokumen LPJ</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">description</span>
          </div>
          <div className="bento-card p-lg rounded-xl bg-secondary text-on-primary shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-label-md opacity-80 mb-xs">Dokumen Lengkap</p>
              <h3 className="font-headline-md text-headline-md font-bold">{totalLengkap} / {totalDokumen}</h3>
              <div className="mt-sm w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: `${(totalLengkap / totalDokumen) * 100}%` }}></div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">check_circle</span>
          </div>
          <div className="bento-card p-lg rounded-xl bg-warning text-on-background shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-label-md opacity-60 mb-xs">Draft</p>
              <h3 className="font-headline-md text-headline-md font-bold">{totalDraft} Dokumen</h3>
              <p className="text-xs opacity-60 mt-sm">Perlu diselesaikan</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">edit_note</span>
          </div>
          <div className="bento-card p-lg rounded-xl bg-danger text-on-primary shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="font-label-md opacity-80 mb-xs">Belum Dikerjakan</p>
              <h3 className="font-headline-md text-headline-md font-bold">{totalBelum} Dokumen</h3>
              <p className="text-xs opacity-70 mt-sm">Mulai kerjakan sekarang</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">pending</span>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-md">Akses Cepat</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {[
              { label: 'Dokumen LPJ', icon: 'description', path: '/dashboard/dokumen-lpj', color: 'text-primary' },
              { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah', color: 'text-secondary' },
              { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku', color: 'text-tertiary' },
              { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan', color: 'text-danger' },
            ].map(q => (
              <Link
                key={q.path}
                to={q.path}
                className="flex items-center gap-md p-md bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors group"
              >
                <span className={`material-symbols-outlined text-3xl ${q.color} group-hover:scale-110 transition-transform`}>{q.icon}</span>
                <span className="font-label-md text-text-high">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Download Dokumen Referensi */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex items-center gap-sm mb-md">
            <span className="material-symbols-outlined text-primary">download</span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">Dokumen Referensi</h3>
          </div>
          <p className="text-text-low text-sm mb-md">Unduh dokumen regulasi dan pedoman teknis BOS/BOSP</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {[
              { judul: 'PERMENDAGRI', sub: 'Peraturan Menteri Dalam Negeri', file: 'permendagri.pdf', icon: 'policy' },
              { judul: 'Juknis BOSP', sub: 'PERMENDIKDASMEN', file: 'juknis-bosp.pdf', icon: 'menu_book' },
              { judul: 'TKA', sub: 'PERMENDIKDASMEN', file: 'tka.pdf', icon: 'calculate' },
              { judul: 'PERBUP Kab. Bandung Barat', sub: 'Transaksi Tunai & Non Tunai', file: 'perbup.pdf', icon: 'gavel' },
              { judul: 'Standar Satuan Harga (SSH)', sub: 'Tahun Berlaku', file: 'ssh.pdf', icon: 'receipt' },
              { judul: 'Permendikbudristek No. 18', sub: 'Th. 2022', file: 'permendikbudristek-18.pdf', icon: 'newspaper' },
            ].map((doc) => (
              <a
                key={doc.file}
                href={`/docs/${doc.file}`}
                download
                className="flex items-center gap-md p-md bg-surface-container-low rounded-xl hover:bg-primary/5 border border-outline-variant hover:border-primary/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="material-symbols-outlined text-primary">{doc.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-text-high font-medium truncate">{doc.judul}</p>
                  <p className="font-label-xs text-text-low truncate">{doc.sub}</p>
                </div>
                <span className="material-symbols-outlined text-text-low group-hover:text-primary transition-colors">download</span>
              </a>
            ))}
          </div>
        </div>

        {/* Recent Document Status */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">Status Dokumen Terbaru</h3>
            <Link to="/dashboard/dokumen-lpj" className="flex items-center gap-sm text-primary font-label-md hover:underline">
              Lihat Semua <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {DOKUMEN_TYPES.slice(0, 6).map(d => {
              const status = dokumenStatus[d.id]?.status || 'Belum'
              return (
                <div key={d.id} className="flex items-center gap-md p-md bg-surface-container-low rounded-lg">
                  <span className={`w-3 h-3 rounded-full ${
                    status === 'Lengkap' ? 'bg-green-500' :
                    status === 'Draft' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-label-md text-text-high truncate">{d.nama}</p>
                    <p className="text-text-low text-xs">{d.kategori}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    status === 'Lengkap' ? 'bg-green-100 text-green-700' :
                    status === 'Draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>{status}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Floating FAB */}
      <Link
        to="/dashboard/dokumen-lpj"
        className="fixed bottom-lg right-lg w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group z-50"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
        <span className="absolute right-16 px-4 py-2 bg-on-background text-white rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Buka Dokumen LPJ</span>
      </Link>
    </div>
  )
}
