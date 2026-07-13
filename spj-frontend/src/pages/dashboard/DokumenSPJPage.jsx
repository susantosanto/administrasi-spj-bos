/**
 * Dokumen LPJ Page — Super Premium Accordion Concept 2026
 * 
 * Fitur:
 * - Klik card → smooth scroll ke detail dengan animasi premium
 * - Satu card aktif pada satu waktu
 * - Transport: Daftar Penerima + SPPD auto-fill (inline)
 * - Animasi: fade-in, slide-up, scale, glow effects
 */
import { useState, useEffect, useRef } from 'react'
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
    deskripsi: 'Transport Rapat, Koordinasi, Bank, Pendamping + SPPD Otomatis',
    kategori: 'BKU Utama',
    icon: 'flight_takeoff',
    hasTemplate: true,
    isTransport: true,
    subKategori: [
      { id: 'rapat', label: 'Rapat', templateId: 'transpor_rapat' },
      { id: 'koordinasi', label: 'Koordinasi', templateId: 'transpor_koordinasi' },
      { id: 'bank', label: 'Bank', templateId: 'transpor_bank' },
      { id: 'pendamping', label: 'Pendamping', templateId: 'transpor_pendamping' },
      { id: 'workshop', label: 'Workshop', templateId: null, comingSoon: true },
    ],
  },
  {
    id: 'mamin',
    nama: 'Makan & Minum',
    deskripsi: 'Notulen, Buku Tamu, Mamin Kegiatan, Tamu, Rapat',
    kategori: 'BKU Utama',
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

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenSPJPage() {
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedSubKategori, setSelectedSubKategori] = useState(null)
  const [formData, setFormData] = useState({})
  const [isAnimating, setIsAnimating] = useState(false)
  const [sppdData, setSppdData] = useState({})
  const detailRef = useRef(null)
  const toast = useToast()

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatus = (cardId, subId) => {
    const stored = storageHelper.get('dokumen_lpj', {})
    const key = subId ? `${cardId}_${subId}` : cardId
    return stored[key]?.status || 'Belum'
  }

  // ─── Premium Scroll Handler ──────────────────────────────────────────────
  const scrollToDetail = () => {
    setTimeout(() => {
      if (detailRef.current) {
        const yOffset = -80 // Offset untuk sticky header
        const y = detailRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
        window.scrollTo({
          top: y,
          behavior: 'smooth'
        })
      }
    }, 100)
  }

  // ─── Card Click Handler dengan Animasi Premium ──────────────────────────
  const handleCardClick = (card) => {
    if (selectedCard?.id === card.id) {
      // Klik card yang sama → tutup dengan animasi
      setIsAnimating(true)
      setTimeout(() => {
        setSelectedCard(null)
        setSelectedSubKategori(null)
        setFormData({})
        setIsAnimating(false)
      }, 200)
    } else {
      // Klik card baru → buka dengan animasi
      setIsAnimating(true)
      setSelectedCard(card)
      
      // Auto-select first non-coming-soon sub-kategori
      const firstValidSub = card.subKategori?.find(s => !s.comingSoon)
      setSelectedSubKategori(firstValidSub || null)
      setFormData({})
      
      // Trigger animation then scroll
      setTimeout(() => {
        setIsAnimating(false)
        scrollToDetail()
      }, 50)
    }
  }

  const handleCloseDetail = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setSelectedCard(null)
      setSelectedSubKategori(null)
      setFormData({})
      setIsAnimating(false)
      // Scroll back to top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }

  const handleSubKategoriChange = (sub) => {
    setIsAnimating(true)
    setSelectedSubKategori(sub)
    setFormData({})
    setTimeout(() => setIsAnimating(false), 300)
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
    
    const printContainer = document.querySelector('.print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add(config.orientation || 'portrait')
    }
    
    window.print()
  }

  // ─── Auto-Fill Handler ───────────────────────────────────────────────────
  const handleAutoFill = (autoFillData) => {
    const config = getTemplateConfig()
    const columns = config?.blocks?.find(b => b.type === 'table-dinamis')?.columns || []
    
    const computedData = autoFillData.map(row => {
      const newRow = { ...row }
      columns.forEach(col => {
        if (col.auto && col.auto.type) {
          const fields = col.auto.fields || []
          const values = fields.map(f => {
            const v = parseFloat(String(newRow[f] || '0').replace(/[^\d.-]/g, ''))
            return isNaN(v) ? 0 : v
          })
          
          switch (col.auto.type) {
            case 'sum': newRow[col.key] = values.reduce((a, b) => a + b, 0); break
            case 'mul': newRow[col.key] = values.reduce((a, b) => a * b, 1); break
            case 'sub': newRow[col.key] = values.length >= 2 ? values[0] - values[1] : 0; break
          }
        }
      })
      return newRow
    })
    
    const existingRows = formData.rows || []
    setFormData({ ...formData, rows: [...existingRows, ...computedData] })
  }

  // ─── SPPD Auto-Generate from Transport ──────────────────────────────────
  // Initialize SPPD data when transport data changes
  useEffect(() => {
    const transportRows = formData.rows || []
    if (transportRows.length === 0 || !selectedCard?.isTransport) {
      setSppdData({})
      return
    }
    
    const config = getTemplateConfig()
    const kegiatan = config?.defaults?.kegiatan || 'Perjalanan Dinas'
    const tempat = config?.defaults?.tempat || 'Cikalongwetan'
    const tanggal = transportRows[0]?.tanggal || new Date().toISOString().split('T')[0]
    const lama = transportRows[0]?.lama || '1 hari'
    
    // Only update if SPPD data is empty or transport data changed
    setSppdData(prev => ({
      // Keep existing nomorSurat if any
      nomorSurat: prev.nomorSurat || '',
      // Auto-fill from transport
      tujuan: kegiatan,
      tanggal: tanggal,
      tempat: tempat,
      lama: lama,
      // List penerima tugas
      rows: transportRows.map((row, idx) => ({
        no: idx + 1,
        nama: row.nama || '',
        nip: row.nip || '',
        jabatan: row.jabatan || '',
        ttd: '',
      })),
    }))
  }, [formData.rows, selectedCard?.isTransport])

  // ─── Grouped Cards ───────────────────────────────────────────────────────
  const bkuUtama = CARDS.filter((c) => c.kategori === 'BKU Utama')
  const dokumenPendukung = CARDS.filter((c) => c.kategori === 'Dokumen Pendukung')

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: ACCORDION CARD
  // ═══════════════════════════════════════════════════════════════════════════

  const renderCard = (card, isCompact = false) => {
    const isSelected = selectedCard?.id === card.id

    if (isCompact) {
      return (
        <button
          key={card.id}
          onClick={() => handleCardClick(card)}
          className={`group relative bg-white rounded-xl border-2 p-4 text-left transition-all duration-500 ease-out ${
            isSelected
              ? 'border-primary ring-4 ring-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
              : 'border-slate-200 hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
          }`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-300 ${
            isSelected ? 'bg-primary text-white scale-110' : 'bg-slate-100 text-slate-600 group-hover:scale-105'
          }`}>
            <span className="material-symbols-outlined text-xl">{card.icon}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">{card.nama}</h4>
          <p className="text-[10px] text-slate-500 line-clamp-2">{card.deskripsi}</p>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-400">Informasi</span>
            <span className={`material-symbols-outlined text-sm transition-all duration-300 ${
              isSelected ? 'text-primary rotate-90' : 'text-slate-300 group-hover:translate-x-1'
            }`}>
              chevron_right
            </span>
          </div>
        </button>
      )
    }

    // Full card untuk BKU Utama
    return (
      <button
        key={card.id}
        onClick={() => handleCardClick(card)}
        className={`group relative bg-white rounded-2xl border-2 p-5 text-left transition-all duration-500 ease-out overflow-hidden ${
          isSelected
            ? 'border-primary ring-4 ring-primary/10 shadow-xl shadow-primary/15 scale-[1.02]'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-lg hover:scale-[1.01]'
        }`}
      >
        {/* Premium Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent transition-opacity duration-500 ${
          isSelected ? 'opacity-100' : 'opacity-0'
        }`} />
        
        {/* Top Row */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
              isSelected 
                ? 'bg-gradient-to-br from-primary to-blue-600 text-white scale-110 shadow-lg shadow-primary/30' 
                : 'bg-slate-100 text-slate-600 group-hover:scale-105'
            }`}>
              <span className="material-symbols-outlined text-2xl">{card.icon}</span>
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800">{card.nama}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{card.deskripsi}</p>
            </div>
          </div>
        </div>

        {/* Sub-Kategori Pills */}
        <div className="relative flex flex-wrap gap-1.5">
          {card.subKategori?.map((sub) => {
            const subStatus = getStatus(card.id, sub.id)
            const isComplete = subStatus === 'Lengkap'
            const isDraft = subStatus === 'Draft'

            return (
              <span
                key={sub.id}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-300 ${
                  sub.comingSoon
                    ? 'bg-slate-100 text-slate-400'
                    : isComplete
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : isDraft
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200'
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

        {/* Arrow Indicator */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-500 ${
          isSelected ? 'text-primary opacity-100' : 'text-slate-300 opacity-0 group-hover:opacity-100'
        }`}>
          <span className={`material-symbols-outlined transition-transform duration-500 ${
            isSelected ? 'rotate-90' : 'group-hover:translate-x-1'
          }`}>
            chevron_right
          </span>
        </div>
      </button>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: DETAIL PANEL (PREMIUM ACCORDION)
  // ═══════════════════════════════════════════════════════════════════════════

  const renderDetailPanel = () => {
    if (!selectedCard) return null

    const isTransport = selectedCard?.isTransport
    const isTransportSub = isTransport && selectedSubKategori?.templateId !== null && selectedSubKategori?.templateId !== 'sppd'
    const hasSppdData = isTransportSub && sppdData && sppdData.rows && sppdData.rows.length > 0

    return (
      <div 
        ref={detailRef}
        className={`transition-all duration-700 ease-out ${
          isAnimating 
            ? 'opacity-0 translate-y-8 scale-[0.98]' 
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <div className="relative bg-gradient-to-br from-white via-primary/5 to-blue-50/30 rounded-3xl border border-primary/20 shadow-xl shadow-primary/10 overflow-hidden">
          {/* Premium Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full" />
          
          <div className="relative p-6 space-y-5">
            {/* Header Panel */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-3xl text-white">{selectedCard.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Detail Dokumen
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mt-2">{selectedCard.nama}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedCard.deskripsi}</p>
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <span className="material-symbols-outlined text-slate-400 hover:text-slate-600">close</span>
              </button>
            </div>

            {/* Sub-Kategori Tabs */}
            {selectedCard.subKategori && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {selectedCard.subKategori.map((sub, index) => {
                  const subStatus = getStatus(selectedCard.id, sub.id)
                  const isActive = selectedSubKategori?.id === sub.id

                  return (
                    <button
                      key={sub.id}
                      onClick={() => !sub.comingSoon && handleSubKategoriChange(sub)}
                      disabled={sub.comingSoon}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/30 scale-105'
                          : sub.comingSoon
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-105'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {subStatus === 'Lengkap' && <span className="text-emerald-400 text-[10px]">✓</span>}
                      {subStatus === 'Draft' && <span className="text-amber-400 text-[10px]">◐</span>}
                      {sub.label}
                      {sub.comingSoon && <span className="text-slate-400 text-[10px]">(Soon)</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {selectedCard.infoOnly && !selectedCard.subKategori ? (
                // Info Only View
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">{selectedCard.icon}</span>
                  </div>
                  <p className="text-lg font-bold text-slate-800 mb-2">{selectedCard.nama}</p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {selectedCard.infoItems?.map((item, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 border border-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : selectedCard.infoOnly && selectedCard.subKategori ? (
                // Info Only with Sub-Kategori (Tagihan)
                selectedSubKategori?.templateId ? (
                  <div className="p-6">
                    <TemplateEngine
                      templateConfig={getTemplateConfig()}
                      data={formData}
                      onDataChange={setFormData}
                      mode="edit"
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">{selectedCard.icon}</span>
                    <p className="text-base font-bold text-slate-800 mb-2">{selectedSubKategori?.label}</p>
                    <p className="text-sm text-slate-500 mb-4">{selectedSubKategori?.info}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
                      <p className="text-xs text-amber-700">Template belum tersedia.</p>
                    </div>
                  </div>
                )
              ) : selectedSubKategori?.templateId ? (
                // Template View
                <div className="p-6 space-y-6">
                  {/* Auto-Fill Button */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <span className="material-symbols-outlined text-amber-600">auto_awesome</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Auto-Fill Data</p>
                        <p className="text-xs text-slate-500">Isi dari profil guru/tendik otomatis</p>
                      </div>
                    </div>
                    <AutoFillHonorButton 
                      templateId={selectedSubKategori?.templateId}
                      onAutoFill={handleAutoFill}
                    />
                  </div>

                  {/* Transport: Show Transport Template */}
                  {isTransportSub && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                        <h4 className="font-bold">Daftar Penerima Transport</h4>
                      </div>
                      <TemplateEngine
                        templateConfig={getTemplateConfig()}
                        data={formData}
                        onDataChange={setFormData}
                        mode="edit"
                      />
                    </div>
                  )}

                  {/* SPPD Template (Auto-fill dari transport) */}
                  {isTransportSub && hasSppdData && (
                    <div className="relative">
                      {/* Divider */}
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
                          <span className="material-symbols-outlined text-lg">description</span>
                          <span className="text-sm font-bold">Surat Perintah Tugas (SPPD)</span>
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                      </div>

                      {/* Info Banner */}
                      <div className="bg-gradient-to-r from-blue-50 to-primary/5 rounded-xl p-4 border border-blue-200 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-blue-600">auto_awesome</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-blue-800">Surat Perintah Tugas (SPPD)</p>
                            <p className="text-xs text-blue-600 mt-1">
                              Daftar nama penerima tugas terisi otomatis dari daftar penerima transport di atas. 
                              Nomor surat di-generate terpisah melalui popup di header dokumen.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* SPPD Content - TemplateEngine handles its own nomor surat via HeaderDokumen popup */}
                      <div className="bg-gradient-to-br from-blue-50/50 to-white rounded-2xl border border-blue-200 p-6">
                        <TemplateEngine
                          templateConfig={TEMPLATE_CONFIGS.sppd}
                          data={sppdData}
                          onDataChange={setSppdData}
                          mode="edit"
                        />
                      </div>
                    </div>
                  )}

                  {/* Non-transport: Show single template */}
                  {!isTransportSub && (
                    <TemplateEngine
                      templateConfig={getTemplateConfig()}
                      data={formData}
                      onDataChange={setFormData}
                      mode="edit"
                    />
                  )}
                </div>
              ) : (
                // Coming Soon View
                <div className="p-8 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">construction</span>
                  </div>
                  <p className="text-base font-bold text-slate-800 mb-2">
                    {selectedSubKategori?.label || selectedCard.nama}
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    Template belum tersedia untuk sub-kategori ini.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto">
                    <p className="text-xs text-amber-700">
                      Upload file template ke folder <code className="bg-amber-100 px-1 rounded">/template</code>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleCloseDetail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Kembali ke Daftar
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-blue-600 text-white hover:brightness-110 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Cetak Dokumen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER: MAIN
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Topbar title="Dokumen LPJ" subtitle="Susun dan cetak dokumen pertanggungjawaban" />

      <div className="p-lg space-y-6 flex-1 max-w-7xl mx-auto w-full">
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* BKU UTAMA SECTION                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-primary to-blue-600 rounded-full" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">BKU Utama</h3>
            <span className="text-xs text-slate-500">— Dokumen utama pertanggungjawaban</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bkuUtama.map((card) => renderCard(card))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* DOKUMEN PENDUKUNG SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Dokumen Pendukung</h3>
            <span className="text-xs text-slate-500">— Informasi tambahan dan blanko</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dokumenPendukung.map((card) => renderCard(card, true))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ACCORDION DETAIL PANEL                                             */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {renderDetailPanel()}      </div>

    </div>
  )
}
