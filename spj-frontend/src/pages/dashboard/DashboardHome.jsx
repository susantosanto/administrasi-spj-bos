/**
 * Dashboard Home — Premium 2026 Design
 * HANYA WARNA BIRU PRIMARY — Fitur Focused, Informatif
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
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
    title: 'Upload BKU',
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

const QUICK_ACTIONS = [
  { label: 'Cetak Honor', icon: 'payments', path: '/dashboard/dokumen-lpj', color: 'primary' },
  { label: 'Cetak SPPD', icon: 'flight_takeoff', path: '/dashboard/dokumen-lpj', color: 'primary' },
  { label: 'Upload BKU', icon: 'upload_file', path: '/dashboard/bku', color: 'primary' },
  { label: 'Dokumen Kelengkapan', icon: 'folder_open', path: '/dashboard/dokumen-kelengkapan', color: 'primary' },
]

const DOCUMENTS_REF = [
  { judul: 'PERMENDAGRI', sub: 'Peraturan Menteri Dalam Negeri', file: 'permendagri.pdf', icon: 'policy' },
  { judul: 'Juknis BOSP', sub: 'PERMENDIKDASMEN', file: 'juknis-bosp.pdf', icon: 'menu_book' },
  { judul: 'TKA', sub: 'PERMENDIKDASMEN', file: 'tka.pdf', icon: 'calculate' },
  { judul: 'PERBUP Kab. Bandung Barat', sub: 'Transaksi Tunai & Non Tunai', file: 'perbup.pdf', icon: 'gavel' },
  { judul: 'Standar Satuan Harga (SSH)', sub: 'Tahun Berlaku', file: 'ssh.pdf', icon: 'receipt' },
  { judul: 'Permendikbudristek No. 18', sub: 'Th. 2022', file: 'permendikbudristek-18.pdf', icon: 'newspaper' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function DashboardHome() {
  const [sekolah, setSekolah] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const sek = storageHelper.get('data_sekolah', null)
    setSekolah(sek)

    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Topbar title="Beranda Utama" subtitle="Ringkasan fitur aplikasi LPJ" />

      <div className="p-6 space-y-6 flex-1 max-w-[1400px] mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO WELCOME — PRIMARY BLUE                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-800 rounded-3xl p-8 text-white shadow-2xl shadow-primary/20">
          {/* Subtle Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
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

              <p className="text-white/70 text-sm max-w-xl mb-6 leading-relaxed">
                Aplikasi pencetakan dokumen pertanggungjawaban dana BOS/BOSP.
                Lengkapi semua dokumen Anda dengan mudah dan cepat.
              </p>

              {/* Quick Stats — HANYA BLUE */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-lg">description</span>
                  <span className="text-sm font-semibold">26+ Dokumen LPJ</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-lg">folder_open</span>
                  <span className="text-sm font-semibold">15+ Kelengkapan</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-lg">print</span>
                  <span className="text-sm font-semibold">13 Template Siap Cetak</span>
                </div>
              </div>
            </div>

            {/* Right Side: Time & CTA */}
            <div className="flex flex-col items-end gap-4">
              <div className="text-right">
                <div className="text-4xl font-light tracking-tight font-mono">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              <Link
                to="/dashboard/dokumen-lpj"
                className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg"
              >
                <span className="material-symbols-outlined text-lg">print</span>
                Mulai Cetak Dokumen
              </Link>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* QUICK ACTIONS — PRIMARY BLUE BUTTONS                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="flex items-center gap-3 bg-white px-4 py-3.5 rounded-xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-primary text-xl group-hover:text-white transition-colors">
                  {action.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                {action.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FITUR UNGGULAN — FEATURE CARDS                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
            <h2 className="text-lg font-bold text-slate-900">Fitur Unggulan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl text-primary group-hover:text-white transition-colors">
                    {feature.icon}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                {/* Subtitle */}
                <p className="text-xs text-slate-500 mb-3">{feature.subtitle}</p>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {feature.kategori.map((kat) => (
                    <span
                      key={kat}
                      className="px-2.5 py-1 bg-primary/5 text-primary text-[10px] font-semibold rounded-lg"
                    >
                      {kat}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    {feature.count ? `${feature.count}+ dokumen` : 'Lihat detail'}
                  </span>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all text-lg">
                    arrow_forward
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN REFERENSI — BLUE ACCENT                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">download</span>
              <h3 className="text-base font-bold text-slate-900">Dokumen Referensi</h3>
            </div>
            <span className="text-xs text-slate-500">Unduh dokumen regulasi BOS/BOSP</span>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DOCUMENTS_REF.map((doc) => (
              <a
                key={doc.file}
                href={`/docs/${doc.file}`}
                download
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-lg transition-colors">
                    {doc.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {doc.judul}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{doc.sub}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-lg">
                  download
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TENTANG APLIKASI                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">info</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">Aplikasi LPJ BOS/BOSP</h3>
                <p className="text-white/60 text-sm">Versi 1.0.0 — Tahun Anggaran 2026</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-lg">description</span>
                <span className="text-white/60">Template:</span>
                <span className="font-semibold">13 format</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-white/40 text-lg">verified</span>
                <span className="text-white/60">Status:</span>
                <span className="flex items-center gap-1.5 text-primary-light font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary-light animate-pulse" />
                  Siap Digunakan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FLOATING ACTION BUTTON — PRIMARY BLUE                               */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Link
        to="/dashboard/dokumen-lpj"
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95 group z-50"
      >
        <span className="material-symbols-outlined text-2xl">print</span>
        <span className="absolute right-16 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Mulai Cetak Dokumen LPJ
        </span>
      </Link>
    </div>
  )
}
