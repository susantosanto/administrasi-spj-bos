/**
 * Dashboard Home — Ultra Premium 2026 Design
 * HEADER: Stunning gradient + Glass morphism effects
 * ICON: Gelap/Profesional
 * NO school name — General untuk semua sekolah
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../../components/layout/Topbar'
import { useTheme } from '../../contexts/ThemeContext'
import storageHelper from '../../utils/storageHelper'
import { DOCUMENTS_REF, isDocAvailable } from '../../utils/docHelper'
import DownloadConfirmModal from '../../components/ui/DownloadConfirmModal'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    id: 'dokumentasi-ai',
    title: 'Generate Foto Dokumentasi',
    subtitle: 'AI-powered foto kegiatan',
    description: 'Upload foto personel & ruangan sekali, generate foto dokumentasi AI berulang kali dari BKU.',
    icon: 'auto_awesome',
    path: '/dashboard/bku',
    count: null,
    kategori: ['AI', 'Foto', 'Dokumentasi'],
  },
  {
    id: 'dokumen-lpj',
    title: 'Dokumen LPJ',
    subtitle: '26+ jenis dokumen pertanggungjawaban',
    description: 'Cetak honorarium, perjalanan dinas, makan minum, dan dokumen lainnya dengan mudah.',
    icon: 'description',
    path: '/dashboard/dokumen-lpj',
    count: 26,
    kategori: ['Honor', 'Perjalanan', 'Mamin', 'Pemeliharaan'],
  },
  {
    id: 'dokumen-kelengkapan',
    title: 'Dokumen Kelengkapan',
    subtitle: 'Dokumen wajib pendukung LPJ',
    description: 'SIPLAH, Non-SIPLAH, Register KAS, BAP KAS, Cover LPJ, dan lainnya.',
    icon: 'folder_open',
    path: '/dashboard/dokumen-kelengkapan',
    count: 15,
    kategori: ['SIPLAH', 'Non-SIPLAH', 'Realisasi'],
  },
  {
    id: 'bku',
    title: 'Data BKU',
    subtitle: 'Import data dari ARKAS',
    description: 'Upload file BKU Excel untuk referensi pembuatan dokumen. Otomatis terdeteksi transaksi.',
    icon: 'upload_file',
    path: '/dashboard/bku',
    count: null,
    kategori: ['Excel', 'Auto-Detect'],
  },
  {
    id: 'data-sekolah',
    title: 'Data Sekolah',
    subtitle: 'Profil & pejabat sekolah',
    description: 'Kelola data identitas sekolah, kepala sekolah, dan bendahara.',
    icon: 'school',
    path: '/dashboard/data-sekolah',
    count: null,
    kategori: ['Identitas', 'Pejabat'],
  },
  {
    id: 'data-guru',
    title: 'Data Guru & Tendik',
    subtitle: 'Import dari Dapodik',
    description: 'Upload data guru dan tenaga kependidikan dari file Dapodik Excel.',
    icon: 'groups',
    path: '/dashboard/data-guru',
    count: null,
    kategori: ['Guru', 'Tendik', 'Dapodik'],
  },
  {
    id: 'realisasi',
    title: 'Realisasi Anggaran',
    subtitle: 'Tracking penggunaan dana',
    description: 'Monitor realisasi penggunaan dana BOS/BOSP per kategori.',
    icon: 'analytics',
    path: '/dashboard/realisasi',
    count: null,
    kategori: ['Anggaran', 'Realisasi'],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardHome() {
  const { isDark } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lpjProgress, setLpjProgress] = useState({ checked: 0, total: 0 })
  const [selectedDoc, setSelectedDoc] = useState(null) // Dokumen yang dipilih untuk modal
  const [showDocModal, setShowDocModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ─── LPJ Progress dari BKU Checklist ──────────────────────────
  useEffect(() => {
    const checklist = storageHelper.get('bku_lpj_checklist', {})
    const bkuData = storageHelper.get('bku_data', null)
    if (bkuData && bkuData.transactions) {
      const total = bkuData.transactions.length
      const checked = Object.values(checklist).filter(Boolean).length
      setLpjProgress({ checked, total })
    }
  }, [])

  // Refresh LPJ progress when window gets focus (user returns from another tab)
  useEffect(() => {
    const handleFocus = () => {
      const checklist = storageHelper.get('bku_lpj_checklist', {})
      const bkuData = storageHelper.get('bku_data', null)
      if (bkuData && bkuData.transactions) {
        const total = bkuData.transactions.length
        const checked = Object.values(checklist).filter(Boolean).length
        setLpjProgress({ checked, total })
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Topbar title="Beranda Utama" subtitle="Ringkasan fitur aplikasi LPJ" />

      <div className="p-6 space-y-5 flex-1 max-w-[1400px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO — ULTRA PREMIUM HEADER                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-primary/20">
          {/* Background Layer — Deep Blue Gradient — living */}
          <div className={`absolute inset-0 bg-gradient-to-br living-gradient ${isDark ? 'from-[#0f172a] via-[#1e3a8a] to-[#2563eb]' : 'from-[#1e40af] via-[#2563eb] to-[#3b82f6]'}`} style={{ backgroundSize: '200% 200%' }} />

          {/* Content */}
          <div className="relative p-5 sm:p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10">
                      <img src="/asik-logo.png" alt="Asik" className="h-7 sm:h-9 w-auto object-contain" draggable="false" />
                    </div>
                    {/* Pulse dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-blue-100/80 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-semibold mb-0.5 sm:mb-1">Sistem Informasi</p>
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white/95 tracking-tight">
                      LPJ BOS/BOSP
                    </h1>
                  </div>
                </div>

                <p className="text-blue-100/70 text-sm sm:text-base max-w-xl mb-6 sm:mb-8 leading-relaxed">
                  Aplikasi pencetakan dokumen pertanggungjawaban dana BOS/BOSP.
                  Lengkapi semua dokumen Anda dengan mudah, cepat, dan profesional.
                </p>

                {/* Stats Row — Glass Cards — breathing, tidak statis */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {[
                    { icon: 'description', label: '26+ Dokumen LPJ' },
                    { icon: 'folder_open', label: '15+ Kelengkapan' },
                    { icon: 'print', label: '13 Template Cetak' },
                    { icon: 'auto_awesome', label: 'Foto AI' },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all living-breathing"
                      style={{ animationDelay: `${i * 0.4}s`, animationDuration: '3.6s' }}
                    >
                      <span className="material-symbols-outlined text-white text-base sm:text-lg">{stat.icon}</span>
                      <span className="text-xs sm:text-sm font-semibold text-white">{stat.label}</span>
                      <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full live-dot ml-1" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content — Clock + CTA */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end gap-4 lg:gap-6">
                {/* Clock — Premium Glass */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-4 sm:px-6 py-3 sm:py-4 border border-white/20 shadow-lg">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight font-mono text-white mb-1">
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] sm:text-xs text-blue-200 text-center tracking-wide">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* CTA Button — Ultra Premium — shimmer + breathing */}
                <Link
                  to="/dashboard/dokumen-lpj"
                  className="group"
                >
                  {/* Button Glow Effect */}
                  {/* Button */}
                  <div className={`relative flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold text-sm sm:text-base group-hover:scale-[1.02] group-active:scale-[0.98] transition-all duration-300 ${isDark ? 'bg-slate-800/90 text-white border border-slate-700' : 'bg-gradient-to-r from-white via-white to-blue-50 text-primary'}`}>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all ${isDark ? 'bg-white/10' : 'bg-primary/10 group-hover:bg-primary'}`}>
                      <span className={`material-symbols-outlined text-lg sm:text-xl transition-colors ${isDark ? 'text-white' : 'text-primary group-hover:text-white'}`}>print</span>
                    </div>
                    <span className="hidden sm:inline">Mulai Cetak Dokumen</span>
                    <span className="sm:hidden">Cetak</span>
                    <span className="material-symbols-outlined text-lg sm:text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* QUICK STATS — ringkasan progres operator                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Progress LPJ', value: `${lpjProgress.checked}/${lpjProgress.total}`, icon: 'checklist', color: 'text-primary' },
            { label: 'Fitur', value: FEATURES.length, icon: 'auto_awesome', color: 'text-slate-700' },
            { label: 'Dok. Referensi', value: DOCUMENTS_REF.length, icon: 'download', color: 'text-slate-700' },
            { label: 'Transaksi BKU', value: (storageHelper.get('bku_data', null)?.transactions?.length || 0), icon: 'receipt_long', color: 'text-slate-700' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm flex items-center gap-3 shadow-sm">
              <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[10px] text-slate-500 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROGRESS KELENGKAPAN LPJ — Dari Checklist BKU                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {lpjProgress.total > 0 && (
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">checklist</span>
                <h3 className="text-base font-bold text-slate-900">Progress Kelengkapan LPJ</h3>
              </div>
              <Link
                to="/dashboard/bku"
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                Kelola di Data BKU
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Dokumen LPJ sudah lengkap</span>
                </div>
                <span className="text-lg font-bold text-primary">
                  {lpjProgress.checked}/{lpjProgress.total}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${lpjProgress.total > 0 ? Math.round((lpjProgress.checked / lpjProgress.total) * 100) : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-slate-400">
                  Centang checklist di halaman Data BKU untuk setiap transaksi yang sudah lengkap dokumen LPJ-nya
                </p>
                <span className="text-xs font-bold text-primary">
                  {lpjProgress.total > 0 ? Math.round((lpjProgress.checked / lpjProgress.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
        {/* ═══════════════════════════════════════════════════════════════════ */}


        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN REFERENSI                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-700">download</span>
            <h3 className="text-base font-bold text-slate-900">Dokumen Referensi</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {DOCUMENTS_REF.map((doc) => {
              const available = isDocAvailable(doc)
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    if (!available) return
                    setSelectedDoc(doc)
                    setShowDocModal(true)
                  }}
                  className={`relative flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-br ${doc.gradient} border ${available ? 'border-white/60 hover:shadow-md hover:scale-[1.01] cursor-pointer' : 'border-slate-200/60 opacity-60 cursor-not-allowed'} transition-all duration-200 group text-left w-full`}
                >
                  <div className={`relative w-9 h-9 rounded-lg ${doc.iconBg} flex items-center justify-center ${available ? 'group-hover:scale-105' : ''} transition-all duration-200 shrink-0`}>
                    <span className={`material-symbols-outlined ${doc.iconColor} text-lg transition-colors`}>
                      {doc.icon}
                    </span>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.judul}</p>
                    <p className="text-[10px] text-slate-500 truncate">{doc.sub}</p>
                  </div>
                  <span className={`material-symbols-outlined ${available ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-300'} transition-all text-base`}>
                    {available ? 'download' : 'block'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* ─── MODAL KONFIRMASI DOWNLOAD ─── */}
      <DownloadConfirmModal
        doc={selectedDoc}
        isOpen={showDocModal}
        onClose={() => {
          setShowDocModal(false)
          setSelectedDoc(null)
        }}
      />

    </div>
  )
}
