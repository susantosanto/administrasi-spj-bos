/**
 * Dashboard Home — Super Premium 2026 Design
 * Elegant, Formal, Professional, Mindblowing
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'

const DOKUMEN_TYPES = [
  { id: 'HON', nama: 'Honorarium', kategori: 'BKU Utama', icon: 'payments' },
  { id: 'HON-P', nama: 'Honor Pelaksana', kategori: 'BKU Utama', icon: 'how_to_reg' },
  { id: 'NSB', nama: 'Narasumber', kategori: 'BKU Utama', icon: 'record_voice_over' },
  { id: 'PD', nama: 'Perjalanan Dinas', kategori: 'BKU Utama', icon: 'flight_takeoff' },
  { id: 'MR', nama: 'Mamin Rapat', kategori: 'BKU Utama', icon: 'restaurant' },
  { id: 'MK', nama: 'Mamin Kegiatan', kategori: 'BKU Utama', icon: 'lunch_dining' },
  { id: 'MT', nama: 'Mamin Tamu', kategori: 'BKU Utama', icon: 'local_cafe' },
  { id: 'PG', nama: 'Penggandaan', kategori: 'Dokumen Pendukung', icon: 'content_copy' },
  { id: 'CF', nama: 'Cetak Foto', kategori: 'Dokumen Pendukung', icon: 'photo_camera' },
  { id: 'CB', nama: 'Cetak Banner', kategori: 'Dokumen Pendukung', icon: 'panorama' },
  { id: 'SW', nama: 'Sewa', kategori: 'Dokumen Pendukung', icon: 'car_rental' },
  { id: 'PL', nama: 'Pemeliharaan', kategori: 'Dokumen Pendukung', icon: 'handyman' },
  { id: 'TG', nama: 'Tagihan', kategori: 'Dokumen Pendukung', icon: 'bolt' },
  { id: 'WS-I', nama: 'Workshop Internal', kategori: 'Dokumen Pendukung', icon: 'groups_3' },
  { id: 'WS-E', nama: 'Workshop Eksternal', kategori: 'Dokumen Pendukung', icon: 'school' },
  { id: 'PR', nama: 'PR Pengadaan', kategori: 'Dokumen Pendukung', icon: 'shopping_cart' },
  { id: 'RK', nama: 'Rekening Koran', kategori: 'Dokumen Pendukung', icon: 'account_balance' },
  { id: 'D-PBJ', nama: 'Dokumen PBJ', kategori: 'Kelengkapan', icon: 'folder_shared' },
  { id: 'D-RK', nama: 'Register KAS', kategori: 'Kelengkapan', icon: 'menu_book' },
  { id: 'D-BK', nama: 'BAP KAS', kategori: 'Kelengkapan', icon: 'fact_check' },
  { id: 'D-KS', nama: 'Kritik & Saran', kategori: 'Kelengkapan', icon: 'rate_review' },
  { id: 'D-PD', nama: 'Pengaduan', kategori: 'Kelengkapan', icon: 'feedback' },
  { id: 'D-PB', nama: 'Papan BOS', kategori: 'Kelengkapan', icon: 'dashboard_customize' },
  { id: 'R-CVR', nama: 'Cover Realisasi', kategori: 'Realisasi', icon: 'folder' },
  { id: 'R-SKT', nama: 'Sekat Realisasi', kategori: 'Realisasi', icon: 'view_agenda' },
  { id: 'R-ALR', nama: 'Alur Realisasi', kategori: 'Realisasi', icon: 'table_chart' },
]

export default function DashboardHome() {
  const [dokumenStatus, setDokumenStatus] = useState({})
  const [sekolah, setSekolah] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const status = storageHelper.get('dokumen_lpj', {})
    setDokumenStatus(status)
    const sek = storageHelper.get('data_sekolah', null)
    setSekolah(sek)

    // Live clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ─── Computed Stats ─────────────────────────────────────────────────────
  const totalLengkap = DOKUMEN_TYPES.filter(d => dokumenStatus[d.id]?.status === 'Lengkap').length
  const totalDraft = DOKUMEN_TYPES.filter(d => dokumenStatus[d.id]?.status === 'Draft').length
  const totalBelum = DOKUMEN_TYPES.filter(d => !dokumenStatus[d.id]?.status || dokumenStatus[d.id]?.status === 'Belum').length
  const totalDokumen = DOKUMEN_TYPES.length
  const progress = totalDokumen > 0 ? Math.round((totalLengkap / totalDokumen) * 100) : 0

  // ─── Recent Documents ───────────────────────────────────────────────────
  const recentDocs = DOKUMEN_TYPES.slice(0, 8).map(d => ({
    ...d,
    status: dokumenStatus[d.id]?.status || 'Belum'
  }))

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Topbar title="Beranda Utama" subtitle="Ringkasan dokumen LPJ" />

      <div className="p-6 space-y-6 flex-1 max-w-[1600px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO WELCOME SECTION                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-2xl">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  <span className="material-symbols-outlined text-2xl">school</span>
                </div>
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-widest font-medium">Selamat Datang</p>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {sekolah?.namaSekolah || 'Operator Sekolah'}
                  </h1>
                </div>
              </div>

              <p className="text-white/60 text-sm max-w-xl mb-6 leading-relaxed">
                Kelola dan cetak dokumen pertanggungjawaban dana BOS/BOSP dengan mudah.
                Semua dokumen terorganisir dalam satu platform modern.
              </p>

              {/* Quick Stats Inline */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm text-white/80">
                    <span className="font-bold text-white">{totalLengkap}</span> dokumen selesai
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm text-white/80">
                    <span className="font-bold text-white">{totalDraft}</span> dalam draft
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-sm text-white/80">
                    <span className="font-bold text-white">{totalBelum}</span> belum dikerjakan
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side: Progress Ring + Time */}
            <div className="flex items-center gap-6">
              {/* Progress Ring */}
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{progress}%</span>
                  <span className="text-[10px] text-white/60 uppercase tracking-wider">Selesai</span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right">
                <div className="text-3xl font-light tracking-tight font-mono">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="relative mt-6 pt-6 border-t border-white/10">
            <Link
              to="/dashboard/dokumen-lpj"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg shadow-black/20"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Buka Dokumen LPJ
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATISTICS CARDS                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Dokumen */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-slate-900 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-xl text-slate-600 group-hover:text-white transition-colors">description</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalDokumen}</div>
            <p className="text-xs text-slate-500">Jenis dokumen LPJ</p>
          </div>

          {/* Lengkap */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-emerald-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-xl text-emerald-600 group-hover:text-white transition-colors">check_circle</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Selesai</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalLengkap}</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700" style={{ width: `${(totalLengkap / totalDokumen) * 100}%` }} />
            </div>
          </div>

          {/* Draft */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-xl text-amber-600 group-hover:text-white transition-colors">edit_note</span>
              </div>
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Draft</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalDraft}</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700" style={{ width: `${(totalDraft / totalDokumen) * 100}%` }} />
            </div>
          </div>

          {/* Belum */}
          <div className="group bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 group-hover:scale-110 transition-all duration-300">
                <span className="material-symbols-outlined text-xl text-rose-500 group-hover:text-white transition-colors">pending</span>
              </div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Belum</span>
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">{totalBelum}</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700" style={{ width: `${(totalBelum / totalDokumen) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* MAIN CONTENT GRID                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* ─── Document Status (Left - 2 cols) ──────────────────────────── */}
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Status Dokumen</h3>
                <p className="text-xs text-slate-500 mt-0.5">Ringkasan semua dokumen LPJ</p>
              </div>
              <Link
                to="/dashboard/dokumen-lpj"
                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Lihat Semua
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {/* Document List */}
            <div className="divide-y divide-slate-100">
              {recentDocs.map((doc, idx) => (
                <Link
                  key={doc.id}
                  to="/dashboard/dokumen-lpj"
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                >
                  {/* Index */}
                  <span className="text-xs font-mono text-slate-400 w-6">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    doc.status === 'Lengkap' ? 'bg-emerald-50' :
                    doc.status === 'Draft' ? 'bg-amber-50' : 'bg-slate-100'
                  }`}>
                    <span className={`material-symbols-outlined text-lg ${
                      doc.status === 'Lengkap' ? 'text-emerald-600' :
                      doc.status === 'Draft' ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {doc.status === 'Lengkap' ? 'check_circle' : doc.icon}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{doc.nama}</p>
                    <p className="text-xs text-slate-500">{doc.kategori}</p>
                  </div>

                  {/* Status Badge */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${
                    doc.status === 'Lengkap' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {doc.status}
                  </span>

                  {/* Arrow */}
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 transition-colors text-lg">
                    chevron_right
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ─── Right Sidebar (1 col) ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Download Documents */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">download</span>
                  <h3 className="text-sm font-bold text-slate-900">Dokumen Referensi</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { judul: 'PERMENDAGRI', file: 'permendagri.pdf', icon: 'policy' },
                  { judul: 'Juknis BOSP', file: 'juknis-bosp.pdf', icon: 'menu_book' },
                  { judul: 'TKA', file: 'tka.pdf', icon: 'calculate' },
                  { judul: 'PERBUP Kab. Bandung Barat', file: 'perbup.pdf', icon: 'gavel' },
                  { judul: 'SSH', file: 'ssh.pdf', icon: 'receipt' },
                  { judul: 'Permendikbudristek No. 18', file: 'permendikbudristek-18.pdf', icon: 'newspaper' },
                ].map((doc) => (
                  <a
                    key={doc.file}
                    href={`/docs/${doc.file}`}
                    download
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-slate-500 group-hover:text-primary text-lg transition-colors">{doc.icon}</span>
                    </div>
                    <span className="flex-1 text-xs font-medium text-slate-700 truncate">{doc.judul}</span>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm transition-colors">download</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-lg">navigation</span>
                  <h3 className="text-sm font-bold text-slate-900">Navigasi Cepat</h3>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Dokumen LPJ', icon: 'description', path: '/dashboard/dokumen-lpj', color: 'primary' },
                  { label: 'Data Sekolah', icon: 'school', path: '/dashboard/data-sekolah', color: 'emerald' },
                  { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku', color: 'amber' },
                  { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan', color: 'rose' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      item.color === 'primary' ? 'bg-primary/10 group-hover:bg-primary group-hover:text-white' :
                      item.color === 'emerald' ? 'bg-emerald-100 group-hover:bg-emerald-500 group-hover:text-white' :
                      item.color === 'amber' ? 'bg-amber-100 group-hover:bg-amber-500 group-hover:text-white' :
                      'bg-rose-100 group-hover:bg-rose-500 group-hover:text-white'
                    }`}>
                      <span className={`material-symbols-outlined text-lg ${
                        item.color === 'primary' ? 'text-primary group-hover:text-white' :
                        item.color === 'emerald' ? 'text-emerald-600 group-hover:text-white' :
                        item.color === 'amber' ? 'text-amber-600 group-hover:text-white' :
                        'text-rose-600 group-hover:text-white'
                      }`}>
                        {item.icon}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-white/60 text-lg">info</span>
                <h3 className="text-sm font-bold">Tentang Aplikasi</h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Versi</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Tahun Anggaran</span>
                  <span className="font-medium">2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Template</span>
                  <span className="font-medium">13 format</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Status</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium text-emerald-400">Online</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FLOATING ACTION BUTTON                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Link
        to="/dashboard/dokumen-lpj"
        className="fixed bottom-6 right-6 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95 group z-50"
      >
        <span className="material-symbols-outlined text-2xl">print</span>
        <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Buka Dokumen LPJ
        </span>
      </Link>
    </div>
  )
}
