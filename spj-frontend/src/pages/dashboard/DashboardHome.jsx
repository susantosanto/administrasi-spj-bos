/**
 * Dashboard Home — Ultra Premium 2026 Design
 * HEADER: Stunning gradient + Glass morphism effects
 * ICON: Gelap/Profesional
 * NO school name — General untuk semua sekolah
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
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
        {/* HERO — ULTRA PREMIUM HEADER                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-primary/20">
          {/* Background Layer — Deep Blue Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#003087] via-[#004ac6] to-[#0066ff]" />

          {/* Animated Light Effect */}
          <div className="absolute inset-0">
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-blue-600/40 to-indigo-500/30 rounded-full blur-3xl" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />

          {/* Glass Pattern Top-Right */}
          <div className="absolute top-8 right-8 w-32 h-32 border border-white/10 rounded-3xl rotate-12 backdrop-blur-sm" />
          <div className="absolute top-12 right-12 w-24 h-24 border border-white/10 rounded-2xl rotate-6 backdrop-blur-sm" />

          {/* Content */}
          <div className="relative p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              {/* Left Content */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg shadow-black/10">
                      <span className="material-symbols-outlined text-3xl text-white">school</span>
                    </div>
                    {/* Pulse dot */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-blue-200 text-xs uppercase tracking-[0.2em] font-semibold mb-1">Sistem Informasi</p>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                      LPJ BOS/BOSP
                    </h1>
                  </div>
                </div>

                <p className="text-blue-100/80 text-base max-w-xl mb-8 leading-relaxed">
                  Aplikasi pencetakan dokumen pertanggungjawaban dana BOS/BOSP.
                  Lengkapi semua dokumen Anda dengan mudah, cepat, dan profesional.
                </p>

                {/* Stats Row — Glass Cards */}
                <div className="flex flex-wrap items-center gap-3">
                  {[
                    { icon: 'description', label: '26+ Dokumen LPJ' },
                    { icon: 'folder_open', label: '15+ Kelengkapan' },
                    { icon: 'print', label: '13 Template Cetak' },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all"
                    >
                      <span className="material-symbols-outlined text-white text-lg">{stat.icon}</span>
                      <span className="text-sm font-semibold text-white">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Content — Clock + CTA */}
              <div className="flex flex-col items-center lg:items-end gap-6">
                {/* Clock — Premium Glass */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                  <div className="text-5xl font-light tracking-tight font-mono text-white mb-1">
                    {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-blue-200 text-center tracking-wide">
                    {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* CTA Button — Ultra Premium */}
                <Link
                  to="/dashboard/dokumen-lpj"
                  className="group relative overflow-hidden"
                >
                  {/* Button Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-100 rounded-2xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />

                  {/* Button */}
                  <div className="relative flex items-center gap-3 bg-gradient-to-r from-white via-white to-blue-50 text-primary px-8 py-4 rounded-2xl font-bold text-base shadow-2xl shadow-black/20 group-hover:scale-[1.02] group-active:scale-[0.98] transition-all duration-300">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                      <span className="material-symbols-outlined text-xl text-primary group-hover:text-white transition-colors">print</span>
                    </div>
                    <span>Mulai Cetak Dokumen</span>
                    <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN REFERENSI                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-700">download</span>
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all">
                  <span className="material-symbols-outlined text-slate-600 group-hover:text-white text-lg transition-colors">
                    {doc.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                    {doc.judul}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{doc.sub}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 transition-colors text-lg">
                  download
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FITUR UNGGULAN                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-slate-800">auto_awesome</span>
            <h2 className="text-lg font-bold text-slate-900">Fitur Unggulan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <Link
                key={feature.id}
                to={feature.path}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-2xl text-slate-700 group-hover:text-white transition-colors">
                    {feature.icon}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs text-slate-500 mb-3">{feature.subtitle}</p>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {feature.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {feature.kategori.map((kat) => (
                    <span
                      key={kat}
                      className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      {kat}
                    </span>
                  ))}
                </div>

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
        {/* TENTANG APLIKASI                                                    */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-white">info</span>
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
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Siap Digunakan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FAB                                                                */}
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
