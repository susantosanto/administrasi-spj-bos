/**
 * Dokumen LPJ Page — Halaman utama cetak dokumen LPJ
 * 
 * Fitur:
 * - Card dengan pill sub-kategori
 * - TemplateEngine untuk 13 template
 * - Info-only cards (Penggandaan, Cetak Foto, Cetak Banner, Tagihan)
 */
import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'
import TemplateEngine from '../../components/templates/TemplateEngine'
import { TEMPLATE_CONFIGS } from '../../data/templateConfig'

// ═══════════════════════════════════════════════════════════════════════════
// CARD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

const CARDS = [
  // ─── HONOR ─────────────────────────────────────────────────────────────
  {
    id: 'honor',
    nama: 'Honorarium',
    deskripsi: 'Honor/Gaji Guru, Tendik, Perpustakaan, Penjaga',
    kategori: 'BKU Utama',
    gradient: 'from-blue-500 to-indigo-600',
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

  // ─── PERJALANAN DINAS ──────────────────────────────────────────────────
  {
    id: 'perjalanan_dinas',
    nama: 'Perjalanan Dinas',
    deskripsi: 'Transport Rapat, Koordinasi, Bank, Pendamping, SPPD',
    kategori: 'BKU Utama',
    gradient: 'from-emerald-500 to-teal-600',
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

  // ─── MAKAN & MINUM ────────────────────────────────────────────────────
  {
    id: 'mamin',
    nama: 'Makan & Minum',
    deskripsi: 'Notulen, Buku Tamu, dll',
    kategori: 'BKU Utama',
    gradient: 'from-orange-500 to-amber-600',
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

  // ─── PEMELIHARAAN ─────────────────────────────────────────────────────
  {
    id: 'pemeliharaan',
    nama: 'Pemeliharaan',
    deskripsi: 'Alat, Mebeler, Bangunan',
    kategori: 'BKU Utama',
    gradient: 'from-rose-500 to-pink-600',
    icon: 'handyman',
    hasTemplate: true,
    subKategori: [
      { id: 'alat', label: 'Alat (Upah)', templateId: 'upah' },
      { id: 'mebeler', label: 'Mebeler', templateId: null, comingSoon: true },
      { id: 'bangunan', label: 'Bangunan', templateId: null, comingSoon: true },
    ],
  },

  // ─── INFO ONLY CARDS ──────────────────────────────────────────────────
  {
    id: 'penggandaan',
    nama: 'Penggandaan',
    deskripsi: 'Hanya informasi yang diperlukan untuk penggandaan',
    kategori: 'Dokumen Pendukung',
    gradient: 'from-purple-500 to-violet-600',
    icon: 'content_copy',
    hasTemplate: false,
    infoOnly: true,
    infoItems: [
      'Master Penggandaan',
      'Jumlah Lembar',
      'Bukti Pembayaran',
    ],
  },
  {
    id: 'cetak_foto',
    nama: 'Cetak Foto',
    deskripsi: 'Bukti dokumentasi foto kegiatan',
    kategori: 'Dokumen Pendukung',
    gradient: 'from-purple-500 to-violet-600',
    icon: 'photo_camera',
    hasTemplate: false,
    infoOnly: true,
    infoItems: [
      'Daftar Foto',
      'Bukti Cetak',
    ],
  },
  {
    id: 'cetak_banner',
    nama: 'Cetak Banner',
    deskripsi: 'Bukti foto banner/spanduk',
    kategori: 'Dokumen Pendukung',
    gradient: 'from-purple-500 to-violet-600',
    icon: 'panorama',
    hasTemplate: false,
    infoOnly: true,
    infoItems: [
      'Desain Banner',
      'Bukti Pemasangan',
    ],
  },
  {
    id: 'tagihan',
    nama: 'Tagihan',
    deskripsi: 'Listrik, Air, Internet (Pulsa)',
    kategori: 'Dokumen Pendukung',
    gradient: 'from-purple-500 to-violet-600',
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

const KATEGORI_FILTER = [
  { id: 'semua', label: 'Semua' },
  { id: 'BKU Utama', label: 'BKU Utama' },
  { id: 'Dokumen Pendukung', label: 'Dokumen Pendukung' },
]

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenSPJPage() {
  const [items, setItems] = useState({})
  const [filter, setFilter] = useState('semua')
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Lengkap': return 'bg-green-100 text-green-700'
      case 'Draft': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-red-100 text-red-700'
    }
  }

  const toggleStatus = (cardId, subId) => {
    const key = subId ? `${cardId}_${subId}` : cardId
    const current = getStatus(cardId, subId)
    const next = current === 'Belum' ? 'Draft' : current === 'Draft' ? 'Lengkap' : 'Belum'
    const updated = { ...items, [key]: { ...(items[key] || {}), status: next } }
    setItems(updated)
    storageHelper.set('dokumen_lpj', updated)
    toast.success(`Status diubah ke ${next}`)
  }

  // ─── Filtered & Grouped ──────────────────────────────────────────────────

  const filteredCards = filter === 'semua'
    ? CARDS
    : CARDS.filter((d) => d.kategori === filter)

  const grouped = {}
  filteredCards.forEach((d) => {
    if (!grouped[d.kategori]) grouped[d.kategori] = []
    grouped[d.kategori].push(d)
  })

  // ─── Stats ───────────────────────────────────────────────────────────────

  const totalLengkap = CARDS.filter((d) => getStatus(d.id) === 'Lengkap').length
  const totalDraft = CARDS.filter((d) => getStatus(d.id) === 'Draft').length
  const totalBelum = CARDS.filter((d) => !items[d.id]?.status || items[d.id]?.status === 'Belum').length

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

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Dokumen LPJ" subtitle="Susun dan cetak dokumen pertanggungjawaban" />

      <div className="p-lg space-y-lg flex-1">
        {/* ─── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-primary">description</span>
              <span className="font-label-md text-text-high">Total Card</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-primary">{CARDS.length}</h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-green-600">check_circle</span>
              <span className="font-label-md text-text-high">Lengkap</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-green-600">{totalLengkap}</h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-yellow-600">edit_note</span>
              <span className="font-label-md text-text-high">Draft</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-yellow-600">{totalDraft}</h3>
          </div>
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center gap-sm mb-sm">
              <span className="material-symbols-outlined text-red-600">radio_button_unchecked</span>
              <span className="font-label-md text-text-high">Belum</span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-red-600">{totalBelum}</h3>
          </div>
        </div>

        {/* ─── Filter Tabs ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-sm">
          {KATEGORI_FILTER.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-lg py-2 rounded-lg font-label-md transition-all active:scale-95 ${
                filter === f.id
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ─── Document Cards Grid ──────────────────────────────────────── */}
        {Object.entries(grouped).map(([kategori, docs]) => (
          <div key={kategori} className="space-y-md">
            <h3 className="font-headline-sm text-headline-sm font-bold text-text-high flex items-center gap-sm">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              {kategori}
              <span className="text-text-low text-sm font-normal">({docs.length} card)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md">
              {docs.map((card) => (
                <div
                  key={card.id}
                  className="bg-surface-container-lowest rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handleOpenCard(card)}
                >
                  {/* Card Header */}
                  <div className={`h-20 bg-gradient-to-r ${card.gradient} flex items-center justify-between p-md`}>
                    <span className="material-symbols-outlined text-white text-3xl">{card.icon}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(card.id) }}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle(getStatus(card.id))} bg-white/90 backdrop-blur-sm hover:scale-105 transition-transform`}
                    >
                      {getStatus(card.id)}
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-md">
                    <h4 className="font-label-md text-text-high font-semibold">{card.nama}</h4>
                    <p className="text-text-low text-xs mt-1 line-clamp-2">{card.deskripsi}</p>

                    {/* Sub-Kategori Pills */}
                    {card.subKategori && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {card.subKategori.slice(0, 4).map((sub) => (
                          <span
                            key={sub.id}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              sub.comingSoon
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {sub.label}
                            {sub.comingSoon && ' 🆕'}
                          </span>
                        ))}
                        {card.subKategori.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500">
                            +{card.subKategori.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Info Only Items */}
                    {card.infoOnly && card.infoItems && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {card.infoItems.map((item, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-100 text-purple-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-sm mt-3 pt-3 border-t border-outline-variant">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenCard(card) }}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                        Buka
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toast.info(`Cetak ${card.nama}`) }}
                        className="p-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary text-sm">print</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ─── Batch Actions ────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest p-lg rounded-xl shadow-lg border border-outline-variant">
          <h3 className="font-headline-sm text-headline-sm font-bold text-text-high mb-md">Aksi Massal</h3>
          <div className="flex flex-wrap gap-md">
            <button className="flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">print</span>
              Cetak Semua Dokumen Lengkap
            </button>
            <button className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-3 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md">
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Export Semua ke PDF
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-lg"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`h-16 bg-gradient-to-r ${selectedCard.gradient} flex items-center justify-between px-lg shrink-0`}>
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-white text-2xl">{selectedCard.icon}</span>
                <div>
                  <h2 className="font-headline-sm text-headline-sm font-bold text-white">{selectedCard.nama}</h2>
                  <p className="text-white/80 text-xs">{selectedCard.kategori}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCard(null)} className="text-white/80 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Sub-Kategori Tabs */}
            {selectedCard.subKategori && (
              <div className="flex gap-1 p-2 bg-surface-container-low border-b border-outline-variant overflow-x-auto">
                {selectedCard.subKategori.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => !sub.comingSoon && handleSubKategoriChange(sub)}
                    disabled={sub.comingSoon}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedSubKategori?.id === sub.id
                        ? 'bg-primary text-on-primary shadow-sm'
                        : sub.comingSoon
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-on-surface-variant hover:bg-surface-container-high border border-outline-variant'
                    }`}
                  >
                    {sub.label}
                    {sub.comingSoon && ' (Soon)'}
                  </button>
                ))}
              </div>
            )}

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {selectedCard.infoOnly && !selectedCard.subKategori ? (
                // ─── Info Only View ──────────────────────────────────────
                <div className="p-lg">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-md flex items-start gap-sm mb-6">
                    <span className="material-symbols-outlined text-amber-600 text-lg">info</span>
                    <div>
                      <p className="font-label-md text-amber-800">Informasi Saja</p>
                      <p className="text-amber-700 text-xs">
                        Dokumen ini bersifat informasi. Tidak ada form yang perlu diisi.
                      </p>
                    </div>
                  </div>
                  <div className="bg-white border border-outline-variant rounded-xl p-xl text-center">
                    <span className="material-symbols-outlined text-outline text-6xl mb-4">{selectedCard.icon}</span>
                    <p className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">{selectedCard.nama}</p>
                    <p className="text-text-low text-sm mb-4">{selectedCard.deskripsi}</p>
                    <div className="p-md bg-surface-container-low rounded-lg max-w-xs mx-auto">
                      <p className="text-text-low text-xs italic mb-2">Yang perlu dilampirkan:</p>
                      <ul className="space-y-1">
                        {selectedCard.infoItems?.map((item, i) => (
                          <li key={i} className="text-text-high text-xs flex items-center gap-1">
                            <span className="material-symbols-outlined text-primary text-sm">check</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : selectedCard.infoOnly && selectedCard.subKategori ? (
                // ─── Info Only with Sub-Kategori (Tagihan) ────────────────
                <div className="p-lg">
                  {selectedSubKategori?.templateId ? (
                    // Has template (Pulsa)
                    <TemplateEngine
                      templateConfig={getTemplateConfig()}
                      data={formData}
                      onDataChange={setFormData}
                      mode="edit"
                    />
                  ) : (
                    // No template (Listrik, Air)
                    <div className="bg-white border border-outline-variant rounded-xl p-xl text-center">
                      <span className="material-symbols-outlined text-outline text-6xl mb-4">{selectedCard.icon}</span>
                      <p className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">
                        {selectedSubKategori.label}
                      </p>
                      <p className="text-text-low text-sm mb-4">{selectedSubKategori.info}</p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-md">
                        <p className="text-amber-700 text-xs">
                          Template untuk {selectedSubKategori.label} belum tersedia.
                          Silakan upload file template terlebih dahulu.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedSubKategori?.templateId ? (
                // ─── Template View ───────────────────────────────────────
                <div className="p-lg">
                  <TemplateEngine
                    templateConfig={getTemplateConfig()}
                    data={formData}
                    onDataChange={setFormData}
                    mode="edit"
                  />
                </div>
              ) : (
                // ─── Coming Soon View ────────────────────────────────────
                <div className="p-lg">
                  <div className="bg-white border border-outline-variant rounded-xl p-xl text-center">
                    <span className="material-symbols-outlined text-outline text-6xl mb-4">construction</span>
                    <p className="font-headline-sm text-headline-sm font-bold text-text-high mb-2">
                      {selectedSubKategori?.label || selectedCard.nama}
                    </p>
                    <p className="text-text-low text-sm mb-4">
                      Template untuk sub-kategori ini belum tersedia.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-md max-w-xs mx-auto">
                      <p className="text-amber-700 text-xs">
                        Silakan upload file template (DOCX/Excel) ke folder <code>/template</code> terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-md bg-surface-container-low border-t border-outline-variant flex justify-between items-center shrink-0">
              <div className="text-xs text-text-low">
                {selectedSubKategori?.templateId && (
                  <span>Sumber: {getTemplateConfig()?.sourceFile}</span>
                )}
              </div>
              <div className="flex gap-sm">
                <button
                  onClick={() => { toggleStatus(selectedCard.id, selectedSubKategori?.id); toast.success('Status diubah') }}
                  className="flex items-center gap-sm bg-surface border border-outline-variant text-on-surface px-lg py-2 rounded-lg hover:bg-surface-container-high transition-all active:scale-95 font-label-md"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  Tandai Selesai
                </button>
                <button
                  onClick={() => { toast.info(`Cetak ${selectedCard.nama}`) }}
                  className="flex items-center gap-sm bg-primary text-on-primary px-lg py-2 rounded-lg hover:brightness-110 shadow-md transition-all active:scale-95 font-label-md"
                >
                  <span className="material-symbols-outlined">print</span>
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
