/**
 * Dokumen LPJ Page — Super Premium Professional Design
 */
import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import TemplateEngine from '../../components/templates/TemplateEngine'
import AutoFillHonorButton from '../../components/templates/blocks/AutoFillHonorButton'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'

// ═══════════════════════════════════════════════════════════════════════════
// CARD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const CARDS = [
  {
    id: 'honor',
    nama: 'Honorarium',
    deskripsi: 'Honor/Gaji Guru, Tendik, Perpustakaan, Penjaga, Pelaksana',
    kategori: 'BKU Utama',
    color: 'blue',
    icon: 'payments',
    hasTemplate: true,
    subKategori: [
      { id: 'guru', label: 'Guru', templateId: 'honor_guru' },
      { id: 'tendik', label: 'Tendik', templateId: 'honor_tendik' },
      { id: 'perpus', label: 'Perpustakaan', templateId: 'honor_perpus' },
      { id: 'penjaga', label: 'Penjaga', templateId: 'honor_penjaga' },
      { id: 'pelaksana', label: 'Pelaksana', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'perjalanan_dinas',
    nama: 'Perjalanan Dinas',
    deskripsi: 'Transport Rapat, Koordinasi, Bank, Pendamping, SPPD, Workshop',
    kategori: 'BKU Utama',
    color: 'emerald',
    icon: 'flight_takeoff',
    hasTemplate: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: 'transpor_rapat' },
      { id: 'koordinasi', label: 'Koordinasi', templateId: 'transpor_koordinasi' },
      { id: 'bank', label: 'Bank', templateId: 'transpor_bank' },
      { id: 'pendamping', label: 'Pendamping', templateId: 'transpor_pendamping' },
      { id: 'sppd', label: 'SPPD', templateId: 'sppd' },
      { id: 'workshop', label: 'Workshop', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'mamin',
    nama: 'Makan & Minum',
    deskripsi: 'Notulen, Buku Tamu, Mamin Kegiatan, Tamu, Rapat',
    kategori: 'BKU Utama',
    color: 'amber',
    icon: 'restaurant',
    hasTemplate: true,
    subKategori: [
      { id: 'notulen', label: 'Notulen', templateId: 'notulen' },
      { id: 'buku_tamu', label: 'Buku Tamu', templateId: 'buku_tamu' },
      { id: 'mamin_kegiatan', label: 'Mamin Kegiatan', templateId: null, comingSoon: true },
      { id: 'mamin_tamu', label: 'Mamin Tamu', templateId: null, comingSoon: true },
      { id: 'mamin_rapat', label: 'Mamin Rapat', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'pemeliharaan',
    nama: 'Pemeliharaan',
    deskripsi: 'Upah Kerja, Mebeler, Bangunan',
    kategori: 'BKU Utama',
    color: 'rose',
    icon: 'handyman',
    hasTemplate: true,
    subKategori: [
      { id: 'alat', label: 'Alat (Upah)', templateId: 'upah' },
      { id: 'mebeler', label: 'Mebeler', templateId: null, comingSoon: true },
      { id: 'bangunan', label: 'Bangunan', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'penggandaan',
    nama: 'Penggandaan',
    deskripsi: 'Master, Jumlah Lembar, Bukti Pembayaran',
    kategori: 'Dokumen Pendukung',
    color: 'violet',
    icon: 'content_copy',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Master Penggandaan', 'Jumlah Lembar', 'Bukti Pembayaran'],
  },
  {
    id: 'cetak_foto',
    nama: 'Cetak Foto',
    deskripsi: 'Daftar Foto, Bukti Cetak',
    kategori: 'Dokumen Pendukung',
    color: 'violet',
    icon: 'photo_camera',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Daftar Foto', 'Bukti Cetak'],
  },
  {
    id: 'cetak_banner',
    nama: 'Cetak Banner',
    deskripsi: 'Desain Banner, Bukti Pemasangan',
    kategori: 'Dokumen Pendukung',
    color: 'violet',
    icon: 'panorama',
    hasTemplate: false,
    infoOnly: true,
    infoItems: ['Desain Banner', 'Bukti Pemasangan'],
  },
  {
    id: 'tagihan',
    nama: 'Tagihan',
    deskripsi: 'Listrik, Air, Internet (Pulsa)',
    kategori: 'Dokumen Pendukung',
    color: 'violet',
    icon: 'bolt',
    hasTemplate: false,
    infoOnly: true,
    subKategori: [
      { id: 'listrik', label: 'Listrik', info: 'Invoice + Bukti Pembayaran' },
      { id: 'air', label: 'Air', info: 'Invoice + Bukti Pembayaran' },
      { id: 'pulsa', label: 'Pulsa Internet', templateId: 'pulsa' },
    ],
  },
]

// Color Config
const COLORS = {
  blue: {
    light: 'bg-blue-50',
    medium: 'bg-blue-100',
    dark: 'bg-blue-600',
    text: 'text-blue-600',
    textDark: 'text-blue-700',
    border: 'border-blue-200',
    ring: 'ring-blue-500/20',
    iconBg: 'bg-blue-100',
    progress: 'from-blue-500 to-blue-600',
  },
  emerald: {
    light: 'bg-emerald-50',
    medium: 'bg-emerald-100',
    dark: 'bg-emerald-600',
    text: 'text-emerald-600',
    textDark: 'text-emerald-700',
    border: 'border-emerald-200',
    ring: 'ring-emerald-500/20',
    iconBg: 'bg-emerald-100',
    progress: 'from-emerald-500 to-emerald-600',
  },
  amber: {
    light: 'bg-amber-50',
    medium: 'bg-amber-100',
    dark: 'bg-amber-600',
    text: 'text-amber-600',
    textDark: 'text-amber-700',
    border: 'border-amber-200',
    ring: 'ring-amber-500/20',
    iconBg: 'bg-amber-100',
    progress: 'from-amber-500 to-amber-600',
  },
  rose: {
    light: 'bg-rose-50',
    medium: 'bg-rose-100',
    dark: 'bg-rose-600',
    text: 'text-rose-600',
    textDark: 'text-rose-700',
    border: 'border-rose-200',
    ring: 'ring-rose-500/20',
    iconBg: 'bg-rose-100',
    progress: 'from-rose-500 to-rose-600',
  },
  violet: {
    light: 'bg-violet-50',
    medium: 'bg-violet-100',
    dark: 'bg-violet-600',
    text: 'text-violet-600',
    textDark: 'text-violet-700',
    border: 'border-violet-200',
    ring: 'ring-violet-500/20',
    iconBg: 'bg-violet-100',
    progress: 'from-violet-500 to-violet-600',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenSPJPage() {
  const [items, setItems] = useState({})
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedSubKategori, setSelectedSubKategori] = useState(null)
  const [formData, setFormData] = useState({})
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('dokumen_lpj', {})
    setItems(stored)
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatus = (cardId, subId) => {
    const key = subId ? `${cardId}_${subId}` : cardId
    return items[key]?.status || 'Belum'
  }

  const toggleStatus = (cardId, subId) => {
    const key = subId ? `${cardId}_${subId}` : cardId
    const current = getStatus(cardId, subId)
    const next = current === 'Belum' ? 'Draft' : current === 'Draft' ? 'Lengkap' : 'Belum'
    const updated = { ...items, [key]: { ...(items[key] || {}), status: next } }
    setItems(updated)
    storageHelper.set('dokumen_lpj', updated)
    toast.success(`Status: ${next}`)
  }

  const getCardProgress = (card) => {
    if (!card.subKategori) {
      const status = getStatus(card.id)
      return status === 'Lengkap' ? 100 : status === 'Draft' ? 50 : 0
    }
    const total = card.subKategori.length
    const completed = card.subKategori.filter((sub) => getStatus(card.id, sub.id) === 'Lengkap').length
    return Math.round((completed / total) * 100)
  }

  // ─── Stats ───────────────────────────────────────────────────────────────

  const totalSubKategori = CARDS.reduce((acc, card) => acc + (card.subKategori?.length || 1), 0)
  const completedCount = CARDS.reduce((acc, card) => {
    if (!card.subKategori) return acc + (getStatus(card.id) === 'Lengkap' ? 1 : 0)
    return acc + card.subKategori.filter((sub) => getStatus(card.id, sub.id) === 'Lengkap').length
  }, 0)
  const draftCount = CARDS.reduce((acc, card) => {
    if (!card.subKategori) return acc + (getStatus(card.id) === 'Draft' ? 1 : 0)
    return acc + card.subKategori.filter((sub) => getStatus(card.id, sub.id) === 'Draft').length
  }, 0)
  const progress = totalSubKategori > 0 ? Math.round((completedCount / totalSubKategori) * 100) : 0

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleOpenCard = (card) => {
    setSelectedCard(card)
    setSelectedSubKategori(card.subKategori?.[0] || null)
    setFormData({})
  }

  const handleSubKategoriChange = (sub) => {
    setSelectedSubKategori(sub)
    setFormData({})
  }

  const getTemplateConfig = () => {
    if (!selectedSubKategori?.templateId) return null
    return TEMPLATE_CONFIGS[selectedSubKategori.templateId]
  }

  // ─── Print Handler ───────────────────────────────────────────────────────
  const handlePrint = () => {
    const config = getTemplateConfig()
    if (!config) {
      toast.info(`Cetak ${selectedCard.nama}`)
      return
    }
    
    // Set print orientation
    const printContainer = document.querySelector('.print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add(config.orientation || 'portrait')
    }
    
    window.print()
  }

  // ─── Auto-Fill Handler ───────────────────────────────────────────────────
  const handleAutoFill = (autoFillData) => {
    // Compute auto values for each row
    const config = getTemplateConfig()
    const columns = config?.blocks?.find(b => b.type === 'table-dinamis')?.columns || []
    
    const computedData = autoFillData.map(row => {
      const newRow = { ...row }
      // Compute auto columns
      columns.forEach(col => {
        if (col.auto && col.auto.type) {
          const fields = col.auto.fields || []
          const values = fields.map(f => {
            const v = parseFloat(String(newRow[f] || '0').replace(/[^\d.-]/g, ''))
            return isNaN(v) ? 0 : v
          })
          
          switch (col.auto.type) {
            case 'sum':
              newRow[col.key] = values.reduce((a, b) => a + b, 0)
              break
            case 'mul':
              newRow[col.key] = values.reduce((a, b) => a * b, 1)
              break
            case 'sub':
              newRow[col.key] = values.length >= 2 ? values[0] - values[1] : 0
              break
          }
        }
      })
      return newRow
    })
    
    // Merge with existing rows
    const existingRows = formData.rows || []
    const newRows = [...existingRows, ...computedData]
    setFormData({ ...formData, rows: newRows })
  }

  // ─── Grouped Cards ───────────────────────────────────────────────────────

  const bkuUtama = CARDS.filter((c) => c.kategori === 'BKU Utama')
  const dokumenPendukung = CARDS.filter((c) => c.kategori === 'Dokumen Pendukung')

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Topbar title="Dokumen LPJ" subtitle="Susun dan cetak dokumen pertanggungjawaban" />

      <div className="p-lg space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO STATS BANNER                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary to-blue-700 rounded-2xl p-6 text-white shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Title & Progress */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-2xl">description</span>
                <h2 className="text-xl font-bold">Dokumen LPJ BOS/BOSP</h2>
              </div>
              <p className="text-white/80 text-sm mb-4">
                Lengkapi semua dokumen pertanggungjawaban untuk periode anggaran 2026
              </p>

              {/* Progress Bar */}
              <div className="flex items-center gap-4">
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/80">Progress Keseluruhan</span>
                    <span className="font-bold">{progress}%</span>
                  </div>
                  <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{completedCount}</div>
                  <div className="text-xs text-white/70">dari {totalSubKategori} dokumen</div>
                </div>
              </div>
            </div>

            {/* Right: Quick Stats */}
            <div className="flex gap-3">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="text-2xl font-bold">{completedCount}</div>
                <div className="text-[10px] text-white/80 uppercase tracking-wide">Selesai</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="text-2xl font-bold">{draftCount}</div>
                <div className="text-[10px] text-white/80 uppercase tracking-wide">Draft</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[90px]">
                <div className="text-2xl font-bold">{totalSubKategori - completedCount - draftCount}</div>
                <div className="text-[10px] text-white/80 uppercase tracking-wide">Belum</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BKU UTAMA SECTION                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-primary rounded-full" />
            <h3 className="text-sm font-bold text-text-high uppercase tracking-wide">BKU Utama</h3>
            <span className="text-xs text-text-low">— Dokumen utama pertanggungjawaban</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bkuUtama.map((card) => {
              const colors = COLORS[card.color] || COLORS.blue
              const cardProgress = getCardProgress(card)
              const activeSubs = card.subKategori?.filter((s) => !s.comingSoon) || []
              const completedSubs = activeSubs.filter((s) => getStatus(card.id, s.id) === 'Lengkap').length

              return (
                <button
                  key={card.id}
                  onClick={() => handleOpenCard(card)}
                  className={`group relative bg-white rounded-2xl border ${colors.border} p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-${card.color}-500/10 hover:border-${card.color}-300 hover:-translate-y-0.5`}
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${colors.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <span className={`material-symbols-outlined text-2xl ${colors.text}`}>{card.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-text-high">{card.nama}</h4>
                        <p className="text-xs text-text-low mt-0.5">{card.deskripsi}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      cardProgress === 100 ? 'bg-emerald-100 text-emerald-700' :
                      cardProgress > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {cardProgress === 100 ? '✓ Selesai' : cardProgress > 0 ? `${cardProgress}%` : 'Belum'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${colors.progress} rounded-full transition-all duration-500`}
                        style={{ width: `${cardProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-Kategori Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {card.subKategori?.map((sub) => {
                      const subStatus = getStatus(card.id, sub.id)
                      const isComplete = subStatus === 'Lengkap'
                      const isDraft = subStatus === 'Draft'

                      return (
                        <span
                          key={sub.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
                            sub.comingSoon
                              ? 'bg-slate-100 text-slate-400'
                              : isComplete
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isDraft
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : `${colors.light} ${colors.textDark} border ${colors.border}`
                          }`}
                        >
                          {isComplete && <span className="text-emerald-500">✓</span>}
                          {isDraft && <span className="text-amber-500">◐</span>}
                          {sub.label}
                          {sub.comingSoon && <span className="text-slate-400"> Soon</span>}
                        </span>
                      )
                    })}
                  </div>

                  {/* Arrow */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-slate-300">arrow_forward</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN PENDUKUNG SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-violet-500 rounded-full" />
            <h3 className="text-sm font-bold text-text-high uppercase tracking-wide">Dokumen Pendukung</h3>
            <span className="text-xs text-text-low">— Informasi tambahan dan blanko</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dokumenPendukung.map((card) => {
              const colors = COLORS.violet
              const cardProgress = getCardProgress(card)

              return (
                <button
                  key={card.id}
                  onClick={() => handleOpenCard(card)}
                  className={`group relative bg-white rounded-xl border border-violet-200 p-4 text-left transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-300 hover:-translate-y-0.5`}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl text-violet-600">{card.icon}</span>
                  </div>

                  {/* Content */}
                  <h4 className="text-sm font-bold text-text-high mb-1">{card.nama}</h4>
                  <p className="text-[10px] text-text-low line-clamp-2">{card.deskripsi}</p>

                  {/* Status */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${
                        cardProgress === 100 ? 'text-emerald-600' : 'text-slate-400'
                      }`}>
                        {cardProgress === 100 ? '✓ Selesai' : 'Informasi'}
                      </span>
                      <span className="material-symbols-outlined text-slate-300 text-sm group-hover:text-violet-500 transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* QUICK ACTIONS                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap gap-3 pt-2">
          <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl hover:brightness-110 shadow-md shadow-primary/20 transition-all active:scale-95 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">print</span>
            Cetak Semua Lengkap
          </button>
          <button className="flex items-center gap-2 bg-white border border-outline-variant text-text-high px-5 py-2.5 rounded-xl hover:bg-surface-container-low transition-all active:scale-95 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Export ke PDF
          </button>
          <button className="flex items-center gap-2 bg-white border border-outline-variant text-text-high px-5 py-2.5 rounded-xl hover:bg-surface-container-low transition-all active:scale-95 text-sm font-medium">
            <span className="material-symbols-outlined text-lg">checklist</span>
            Tandai Semua Selesai
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${COLORS[selectedCard.color]?.iconBg || 'bg-slate-100'} flex items-center justify-center`}>
                    <span className={`material-symbols-outlined text-2xl ${COLORS[selectedCard.color]?.text || 'text-slate-600'}`}>
                      {selectedCard.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-high">{selectedCard.nama}</h2>
                    <p className="text-xs text-text-low">{selectedCard.deskripsi}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-text-low">close</span>
                </button>
              </div>
            </div>

            {/* Sub-Kategori Tabs */}
            {selectedCard.subKategori && (
              <div className="px-6 py-3 border-b border-outline-variant bg-slate-50">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {selectedCard.subKategori.map((sub) => {
                    const subStatus = getStatus(selectedCard.id, sub.id)
                    const isActive = selectedSubKategori?.id === sub.id
                    const colors = COLORS[selectedCard.color] || COLORS.blue

                    return (
                      <button
                        key={sub.id}
                        onClick={() => !sub.comingSoon && handleSubKategoriChange(sub)}
                        disabled={sub.comingSoon}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                          isActive
                            ? `${colors.dark} text-white shadow-sm`
                            : sub.comingSoon
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-white text-text-high border border-outline-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {subStatus === 'Lengkap' && <span className="text-emerald-500 text-[10px]">✓</span>}
                        {subStatus === 'Draft' && <span className="text-amber-500 text-[10px]">◐</span>}
                        {sub.label}
                        {sub.comingSoon && <span className="text-slate-400 text-[10px]">(Soon)</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedCard.infoOnly && !selectedCard.subKategori ? (
                // ─── Info Only View ──────────────────────────────────────
                <div className="p-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Informasi Saja</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Dokumen ini bersifat informasi. Tidak ada form yang perlu diisi.
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">{selectedCard.icon}</span>
                    <p className="text-base font-bold text-text-high mb-2">{selectedCard.nama}</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {selectedCard.infoItems?.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-text-high border border-outline-variant">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : selectedCard.infoOnly && selectedCard.subKategori ? (
                // ─── Info Only with Sub-Kategori (Tagihan) ────────────────
                <div className="p-6">
                  {selectedSubKategori?.templateId ? (
                    <TemplateEngine
                      templateConfig={getTemplateConfig()}
                      data={formData}
                      onDataChange={setFormData}
                      mode="edit"
                    />
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-8 text-center">
                      <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">{selectedCard.icon}</span>
                      <p className="text-base font-bold text-text-high mb-2">{selectedSubKategori?.label}</p>
                      <p className="text-sm text-text-low mb-4">{selectedSubKategori?.info}</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-sm mx-auto">
                        <p className="text-xs text-amber-700">
                          Template belum tersedia. Upload file template terlebih dahulu.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedSubKategori?.templateId ? (
                // ─── Template View ───────────────────────────────────────
                <div className="p-6">
                  {/* Auto-Fill Button for Honor Templates */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500">info</span>
                      <span className="text-xs text-slate-500">Klik tombol di bawah untuk mengisi data dari profil guru/tendik</span>
                    </div>
                    <AutoFillHonorButton 
                      templateId={selectedSubKategori?.templateId}
                      onAutoFill={handleAutoFill}
                    />
                  </div>
                  <TemplateEngine
                    templateConfig={getTemplateConfig()}
                    data={formData}
                    onDataChange={setFormData}
                    mode="edit"
                  />
                </div>
              ) : (
                // ─── Coming Soon View ────────────────────────────────────
                <div className="p-6">
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">construction</span>
                    <p className="text-base font-bold text-text-high mb-2">
                      {selectedSubKategori?.label || selectedCard.nama}
                    </p>
                    <p className="text-sm text-text-low mb-4">
                      Template belum tersedia untuk sub-kategori ini.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-w-sm mx-auto">
                      <p className="text-xs text-amber-700">
                        Upload file template (DOCX/Excel) ke folder <code>/template</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-slate-50 flex items-center justify-end">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggleStatus(selectedCard.id, selectedSubKategori?.id)
                    toast.success('Status diubah')
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-white border border-outline-variant text-text-high hover:bg-surface-container-low transition-all"
                >
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                  Selesai
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:brightness-110 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Cetak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
