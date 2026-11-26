/**
 * Dashboard Home — Ultra Premium 2026 Design
 * HEADER: Stunning gradient + Glass morphism effects
 * ICON: Gelap/Profesional
 * NO school name — General untuk semua sekolah
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BuildingLibraryIcon as Landmark,
  ReceiptPercentIcon as ReceiptText,
  WalletIcon as Wallet,
  ChartPieIcon as PieChart,
} from '@heroicons/react/24/outline'
import Topbar from '../../components/layout/Topbar'
import { useTheme } from '../../contexts/ThemeContext'
import storageHelper from '../../utils/storageHelper'
import { DOCUMENTS_REF, isDocAvailable } from '../../utils/docHelper'
import DownloadConfirmModal from '../../components/ui/DownloadConfirmModal'
import ArusKasChart from '../../components/dashboard/ArusKasChart'
import ActivityPanel from '../../components/dashboard/ActivityPanel'
import PaketProgressPanel from '../../components/dashboard/PaketProgressPanel'

const fmtSingkat = (n) => {
  const v = Number(n) || 0
  const f = (x, s) => `Rp ${x.toLocaleString('id-ID', { maximumFractionDigits: 1 })} ${s}`
  if (Math.abs(v) >= 1e9) return f(v / 1e9, 'M')
  if (Math.abs(v) >= 1e6) return f(v / 1e6, 'jt')
  if (Math.abs(v) >= 1e3) return f(v / 1e3, 'rb')
  return `Rp ${v.toLocaleString('id-ID')}`
}

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
    title: 'Kas & Dokumen',
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
  const [selectedDoc, setSelectedDoc] = useState(null) // Dokumen yang dipilih untuk modal
  const [showDocModal, setShowDocModal] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  const authUser = storageHelper.get('auth_user', {})
  const displayName = authUser.name || 'Operator'
  const greeting = currentTime.getHours() < 11 ? 'Selamat pagi' : currentTime.getHours() < 15 ? 'Selamat siang' : currentTime.getHours() < 18 ? 'Selamat sore' : 'Selamat malam'

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <Topbar />

      <div className="p-4 sm:p-6 space-y-5 flex-1 max-w-[1600px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO — ringkas: logo + keterangan + waktu                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-300/25 shadow-lg shadow-primary/15">
          <div className={`absolute inset-0 bg-gradient-to-br living-gradient ${isDark ? 'from-[#0f172a] via-[#1e3a8a] to-[#2563eb]' : 'from-[#1e40af] via-[#2563eb] to-[#3b82f6]'}`} style={{ backgroundSize: '200% 200%' }} />
          {/* Batik floral sangat tipis — sama dengan background */}
          <div className="sidebar-batik absolute inset-0 pointer-events-none" aria-hidden="true" />
          {/* Foto Kantor Bupati Bandung Barat — sisi kanan, tepi melebur via gradasi/mask (tanpa blok) */}
          <div className="absolute inset-y-0 right-0 w-[56%] hidden sm:block">
            <div className="hero-photo-mask absolute inset-0">
              <img src="/hero-kantor-bupati.jpg" alt="" className="h-full w-full object-cover object-[62%_center]" draggable="false" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af]/75 via-[#1e40af]/15 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1e3a8a]/25 via-transparent to-[#1e3a8a]/25" />
            </div>
          </div>
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full border border-white/10 bg-white/5 blur-2xl" aria-hidden="true" />
          <div className="relative p-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4 flex-1 min-w-0 sm:max-w-[54%]">
              <div className="w-16 h-12 rounded-xl bg-white/90 flex items-center justify-center border border-white/30 shadow-lg shadow-black/10 px-1.5 shrink-0 sm:hidden">
                <img src="/asik-logo.png" alt="Asik" className="h-6 w-auto object-contain" draggable="false" />
              </div>
              <div className="min-w-0">
                <p className="text-blue-100/85 text-xs uppercase tracking-[0.18em] font-semibold">Ringkasan keuangan sekolah</p>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{greeting}, {displayName}</h1>
                <p className="text-blue-100/75 text-xs sm:text-sm leading-snug mt-1">
                  Pantau dana BOS/BOSP dan kelengkapan pertanggungjawaban dalam satu tempat.
                </p>
              </div>
            </div>
            <div className="sm:text-right shrink-0 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5">
              <div className="text-2xl sm:text-3xl font-light tracking-tight font-mono text-white leading-none">
                {String(currentTime.getHours()).padStart(2, '0')}:{String(currentTime.getMinutes()).padStart(2, '0')}
              </div>
              <div className="text-xs text-blue-100/85 tracking-wide mt-1">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* QUICK STATS — ala referensi: label + value besar + hint konteks      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {(() => {
          const bku = storageHelper.get('bku_data', null)
          const txs = bku?.transactions || []
          const monthly = bku?.summary?.monthlySummaries || []
          const terima = Number(bku?.summary?.totalPenerimaan) || 0
          const pakai = Number(bku?.summary?.totalPengeluaran) || 0
          const saldo = Number(bku?.summary?.saldoAkhir ?? txs[txs.length - 1]?.saldo) || 0
          const rasioRealisasi = terima > 0 ? Math.min(100, Math.round((pakai / terima) * 100)) : 0
          const last = monthly[monthly.length - 1]
          const adaData = txs.length > 0
          const stats = [
            { label: 'Dana BOSP diterima', value: adaData ? fmtSingkat(terima) : '—', hint: last ? `Data s.d. ${last.namaBulan}` : 'Impor BKU untuk melihat data', icon: Landmark, tone: 'text-white bg-gradient-to-br from-blue-500 to-blue-700' },
            { label: 'Realisasi belanja', value: adaData ? fmtSingkat(pakai) : '—', hint: last ? `${fmtSingkat(last.totalPengeluaran)} bulan ${last.namaBulan}` : 'Berdasarkan transaksi BKU', icon: ReceiptText, tone: 'text-white bg-gradient-to-br from-blue-600 to-blue-800' },
            { label: 'Saldo akhir BKU', value: adaData ? fmtSingkat(saldo) : '—', hint: adaData ? 'Saldo dari transaksi terakhir' : 'Belum ada saldo tercatat', icon: Wallet, tone: 'text-white bg-gradient-to-br from-slate-500 to-slate-700' },
            { label: 'Rasio realisasi', value: adaData && terima > 0 ? `${rasioRealisasi}%` : '—', hint: terima > 0 ? `${fmtSingkat(pakai)} dari dana diterima` : 'Belum ada nilai penerimaan', icon: PieChart, tone: 'text-white bg-gradient-to-br from-slate-600 to-slate-800' },
          ]
          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="glass-surface group min-w-0 rounded-2xl p-4 sm:p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-sm ${stat.tone}`}>
                        <Icon aria-hidden="true" className="block h-[18px] w-[18px]" />
                      </span>
                    </div>
                    <p className="text-2xl sm:text-[28px] leading-tight font-bold text-slate-900 dark:text-white tabular-nums tracking-tight truncate">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1.5">{stat.hint}</p>
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ARUS KAS — grafik penerimaan vs pengeluaran per bulan                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <ArusKasChart />

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PROGRES + AKTIVITAS — dua kolom ala referensi                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid gap-5 lg:grid-cols-2">
          <PaketProgressPanel />
          <ActivityPanel />
        </div>
        {/* ═══════════════════════════════════════════════════════════════════ */}


        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN REFERENSI                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="glass-surface rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">download</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Dokumen Referensi</h3>
            <span className="ml-auto text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">26+ template</span>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{doc.sub}</p>
                  </div>
                  <span className={`material-symbols-outlined ${available ? 'text-slate-400 group-hover:text-slate-600' : 'text-slate-300'} transition-all text-base`}>
                    {available ? 'download' : 'block'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FITUR UNGGULAN — pintu masuk fitur utama (selaras main)             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="glass-surface rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">auto_awesome</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Fitur Unggulan</h3>
            <span className="ml-auto text-xs font-medium tracking-wide uppercase text-slate-500 dark:text-slate-400">7 modul</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {FEATURES.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                className="group flex items-center gap-3 px-3 py-3 rounded-xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:shadow-md hover:scale-[1.01] transition-all duration-200 text-left w-full"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-200">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-200 text-lg group-hover:text-white transition-colors">
                    {feature.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{feature.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{feature.subtitle}</p>
                </div>
                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-base">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
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
