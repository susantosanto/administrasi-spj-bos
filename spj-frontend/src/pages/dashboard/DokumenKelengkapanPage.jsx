/**
 * Dokumen Kelengkapan Page — Premium Compact Design
 */
import { useState, useEffect } from 'react'
import storageHelper from '../../utils/storageHelper'
import Topbar from '../../components/layout/Topbar'
import { useToast } from '../../components/ui/Toast'

// ═══════════════════════════════════════════════════════════════════════════
// DATA DEFINITIONS — Organized by Category
// ═══════════════════════════════════════════════════════════════════════════

const CATEGORIES = [
  {
    id: 'siplah',
    label: 'SIPLAH',
    description: 'Dokumen pengadaan melalui SIPLAH',
    color: 'emerald',
    items: [
      {
        id: 'PBJ',
        nama: 'Dokumen PBJ',
        deskripsi: 'Perencanaan, Surat Pesanan, BAST, BAHP',
        icon: 'folder_shared',
        formFields: [
          { name: 'nomorPesanan', label: 'Nomor Pesanan', type: 'text', placeholder: '001/PSN/III/2025' },
          { name: 'tanggalPesanan', label: 'Tanggal Pesanan', type: 'date' },
          { name: 'namaBarang', label: 'Nama Barang/Jasa', type: 'text', placeholder: 'ATK Pendidikan' },
          { name: 'jumlah', label: 'Jumlah', type: 'number', placeholder: '0' },
          { name: 'satuan', label: 'Satuan', type: 'text', placeholder: 'Pcs / Set / Box' },
          { name: 'hargaSatuan', label: 'Harga Satuan (Rp)', type: 'number', placeholder: '0' },
        ],
      },
    ],
  },
  {
    id: 'keuangan',
    label: 'Keuangan',
    description: 'Register, BAP, dan informasi keuangan',
    color: 'blue',
    items: [
      {
        id: 'RK',
        nama: 'Register KAS',
        deskripsi: 'Register Kas BOS/BOSP',
        icon: 'menu_book',
        formFields: [
          { name: 'bulan', label: 'Bulan', type: 'text', placeholder: 'Januari 2026' },
          { name: 'nomorRegister', label: 'Nomor Register', type: 'text', placeholder: '001/RK/I/2026' },
        ],
      },
      {
        id: 'BAP',
        nama: 'BAP KAS',
        deskripsi: 'Berita Acara Pemeriksaan',
        icon: 'fact_check',
        formFields: [
          { name: 'tanggalPemeriksaan', label: 'Tanggal', type: 'date' },
          { name: 'namaPemeriksa', label: 'Pemeriksa', type: 'text', placeholder: 'Nama' },
          { name: 'hasilPemeriksaan', label: 'Hasil', type: 'text', placeholder: 'Sesuai / Tidak Sesuai' },
        ],
      },
      {
        id: 'PB',
        nama: 'Papan BOS',
        deskripsi: 'Informasi Anggaran & Realisasi',
        icon: 'dashboard_customize',
        formFields: [
          { name: 'anggaran', label: 'Total Anggaran (Rp)', type: 'number', placeholder: '0' },
          { name: 'realisasi', label: 'Total Realisasi (Rp)', type: 'number', placeholder: '0' },
        ],
      },
    ],
  },
  {
    id: 'umum',
    label: 'Umum',
    description: 'Kritik, saran, dan pengaduan',
    color: 'amber',
    items: [
      {
        id: 'KS',
        nama: 'Kritik & Saran',
        deskripsi: 'Lembar Kritik/Saran Sekolah',
        icon: 'rate_review',
        formFields: [
          { name: 'isi', label: 'Isi Kritik / Saran', type: 'text', placeholder: 'Tulis kritik atau saran...' },
          { name: 'penulis', label: 'Penulis', type: 'text', placeholder: 'Nama' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
        ],
      },
      {
        id: 'PD',
        nama: 'Pengaduan',
        deskripsi: 'Lembar Pengaduan Sekolah',
        icon: 'feedback',
        formFields: [
          { name: 'isi', label: 'Isi Pengaduan', type: 'text', placeholder: 'Tulis pengaduan...' },
          { name: 'pelapor', label: 'Pelapor', type: 'text', placeholder: 'Nama' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
        ],
      },
    ],
  },
  {
    id: 'laporan',
    label: 'Laporan',
    description: 'Cover, sekat, realisasi, instrumen',
    color: 'rose',
    items: [
      {
        id: 'R-CVR',
        nama: 'Cover LPJ',
        deskripsi: 'Cover laporan pertanggungjawaban',
        icon: 'folder',
        formFields: [
          { name: 'namaSekolah', label: 'Nama Sekolah', type: 'text', placeholder: 'SD Negeri ...' },
          { name: 'tahunAnggaran', label: 'Tahun Anggaran', type: 'text', placeholder: '2026' },
          { name: 'danaBosp', label: 'Dana BOSP (Rp)', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'R-SKT',
        nama: 'Sekat Cover',
        deskripsi: 'Sekat pembatas cover',
        icon: 'view_agenda',
        formFields: [
          { name: 'periode', label: 'Periode Laporan', type: 'text', placeholder: 'Januari - Juni 2026' },
        ],
      },
      {
        id: 'R-ALR',
        nama: 'Realisasi Dana',
        deskripsi: 'Tabel realisasi anggaran',
        icon: 'table_chart',
        formFields: [
          { name: 'kodeRekening', label: 'Kode Rekening', type: 'text', placeholder: '5.1.02.02.01.0013' },
          { name: 'anggaran', label: 'Anggaran (Rp)', type: 'number', placeholder: '0' },
          { name: 'realisasi', label: 'Realisasi (Rp)', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'R-ILB',
        nama: 'Instrumen BOS',
        deskripsi: 'Form instrumen pelaporan',
        icon: 'assignment',
        formFields: [],
      },
    ],
  },
  {
    id: 'blanko',
    label: 'Blanko',
    description: 'Template siap pakai',
    color: 'slate',
    items: [
      {
        id: 'DH',
        nama: 'Daftar Hadir',
        deskripsi: 'Template daftar hadir',
        icon: 'group_add',
        formFields: [
          { name: 'kegiatan', label: 'Nama Kegiatan', type: 'text', placeholder: 'Rapat Komite' },
          { name: 'tanggal', label: 'Tanggal', type: 'date' },
          { name: 'tempat', label: 'Tempat', type: 'text', placeholder: 'Ruang Guru' },
          { name: 'waktu', label: 'Waktu', type: 'text', placeholder: '08:00 - 12:00' },
        ],
      },
      {
        id: 'SU',
        nama: 'Surat Undangan',
        deskripsi: 'Template surat undangan',
        icon: 'mail',
        formFields: [
          { name: 'nomor', label: 'Nomor Surat', type: 'text', placeholder: '001/UND/III/2026' },
          { name: 'kepada', label: 'Kepada', type: 'text', placeholder: 'Nama / Jabatan' },
          { name: 'perihal', label: 'Perihal', type: 'text', placeholder: 'Undangan Rapat' },
          { name: 'tanggal', label: 'Hari/Tanggal', type: 'text', placeholder: 'Senin, 20 Januari 2026' },
        ],
      },
    ],
  },
]

// Color mapping
const COLOR_MAP = {
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    icon: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    hover: 'hover:border-emerald-300',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    icon: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:border-blue-300',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    icon: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    hover: 'hover:border-amber-300',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    icon: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-700',
    hover: 'hover:border-rose-300',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
    icon: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    hover: 'hover:border-slate-300',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DokumenKelengkapanPage() {
  const [siplah, setSiplah] = useState(false)
  const [status, setStatus] = useState({})
  const [selectedDokumen, setSelectedDokumen] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formData, setFormData] = useState({})
  const toast = useToast()

  useEffect(() => {
    const stored = storageHelper.get('dokumen_kelengkapan_status', {})
    setStatus(stored)
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────

  const getStatus = (id) => status[id] === 'Selesai'
  const allItems = CATEGORIES.flatMap((c) => c.items)
  const completedCount = allItems.filter((d) => getStatus(d.id)).length
  const progress = allItems.length > 0 ? Math.round((completedCount / allItems.length) * 100) : 0

  const toggleStatus = (id) => {
    const next = status[id] === 'Selesai' ? 'Belum' : 'Selesai'
    const updated = { ...status, [id]: next }
    setStatus(updated)
    storageHelper.set('dokumen_kelengkapan_status', updated)
    toast.success(`Status diubah ke ${next}`)
  }

  const handleOpenDokumen = (dokumen, category) => {
    setSelectedDokumen(dokumen)
    setSelectedCategory(category)
    setFormData({})
  }

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveForm = () => {
    toast.success(`Form "${selectedDokumen.nama}" berhasil disimpan`)
    setSelectedDokumen(null)
    setFormData({})
  }

  // ─── Filtered Categories ─────────────────────────────────────────────────

  const filteredCategories = siplah
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id !== 'siplah')

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Topbar title="Dokumen Kelengkapan" subtitle="Dokumen di luar ARKAS yang harus dilampirkan" />

      <div className="p-lg space-y-lg flex-1 max-w-7xl mx-auto w-full">
        {/* ─── Header Section ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* SIPLAH Toggle */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-outline-variant shadow-sm">
            <span className="material-symbols-outlined text-primary text-xl">storefront</span>
            <span className="text-sm font-medium text-text-high">SIPLAH</span>
            <button
              onClick={() => {
                setSiplah(!siplah)
                toast.success(siplah ? 'Non-SIPLAH diaktifkan' : 'SIPLAH diaktifkan')
              }}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                siplah ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  siplah ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              ></span>
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">task_alt</span>
              <span className="text-sm font-medium text-text-high">Progress</span>
            </div>
            <div className="w-32 h-2 bg-surface-container-low rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary">
              {completedCount}/{allItems.length}
            </span>
          </div>
        </div>

        {/* ─── Categories ───────────────────────────────────────────────── */}
        {filteredCategories.map((category) => {
          const colors = COLOR_MAP[category.color] || COLOR_MAP.slate
          const categoryCompleted = category.items.filter((d) => getStatus(d.id)).length

          return (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-5 rounded-full ${
                    category.color === 'emerald' ? 'bg-emerald-500' :
                    category.color === 'blue' ? 'bg-blue-500' :
                    category.color === 'amber' ? 'bg-amber-500' :
                    category.color === 'rose' ? 'bg-rose-500' :
                    'bg-slate-500'
                  }`} />
                  <h3 className="text-sm font-bold text-text-high uppercase tracking-wide">
                    {category.label}
                  </h3>
                  <span className="text-xs text-text-low">— {category.description}</span>
                </div>
                <span className="text-xs font-medium text-text-low">
                  {categoryCompleted}/{category.items.length}
                </span>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {category.items.map((item) => {
                  const isSelesai = getStatus(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleOpenDokumen(item, category)}
                      className={`group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden ${
                        isSelesai
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : `border-outline-variant ${colors.hover} hover:shadow-md`
                      }`}
                    >
                      {/* Status Indicator */}
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                        isSelesai ? 'bg-emerald-500' : 'bg-amber-400'
                      }`} />

                      {/* Content */}
                      <div className="p-3 text-left">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                          isSelesai ? 'bg-emerald-100' : colors.bg
                        }`}>
                          <span className={`material-symbols-outlined text-lg ${
                            isSelesai ? 'text-emerald-600' : colors.icon
                          }`}>
                            {isSelesai ? 'check_circle' : item.icon}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text-high leading-tight">
                          {item.nama}
                        </p>
                        <p className="text-[10px] text-text-low mt-0.5 line-clamp-2">
                          {item.deskripsi}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* ─── Info Footer ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-outline-variant p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">info</span>
          <div className="flex-1">
            <p className="text-xs text-text-low">
              Klik kartu untuk mengisi form atau melihat detail dokumen.
              Dokumen yang sudah selesai akan ditandai dengan warna hijau.
            </p>
          </div>
          <button
            onClick={() => {
              const updated = {}
              allItems.forEach((d) => { updated[d.id] = { status: 'Selesai' } })
              setStatus(updated)
              storageHelper.set('dokumen_kelengkapan_status', updated)
              toast.success('Semua dokumen ditandai selesai')
            }}
            className="text-xs text-primary hover:underline whitespace-nowrap"
          >
            Tandai Semua Selesai
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DETAIL MODAL                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {selectedDokumen && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedDokumen(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-outline-variant">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    COLOR_MAP[selectedCategory?.color]?.bg || 'bg-gray-100'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      COLOR_MAP[selectedCategory?.color]?.icon || 'text-gray-600'
                    }`}>
                      {selectedDokumen.icon}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-high">{selectedDokumen.nama}</h2>
                    <p className="text-xs text-text-low">{selectedDokumen.deskripsi}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDokumen(null)}
                  className="p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-text-low">close</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDokumen.formFields?.length > 0 ? (
                <div className="space-y-4">
                  {selectedDokumen.formFields.map((field, i) => (
                    <div key={i}>
                      <label className="block text-xs font-medium text-text-high mb-1">
                        {field.label}
                      </label>
                      {field.type === 'date' ? (
                        <input
                          type="date"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      ) : field.type === 'number' ? (
                        <input
                          type="number"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      ) : (
                        <input
                          type="text"
                          className="w-full px-3 py-2 text-sm bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                          placeholder={field.placeholder}
                          value={formData[field.name] || ''}
                          onChange={(e) => handleFormChange(field.name, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-outline mb-3">
                    description
                  </span>
                  <p className="text-sm text-text-low">
                    Dokumen ini tidak memerlukan form input.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-outline-variant bg-surface flex items-center justify-between">
              <button
                onClick={() => {
                  toggleStatus(selectedDokumen.id)
                  toast.success('Status diubah')
                  setSelectedDokumen(null)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  getStatus(selectedDokumen.id)
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-surface-container-high text-text-high hover:bg-surface-container-low'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {getStatus(selectedDokumen.id) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {getStatus(selectedDokumen.id) ? 'Selesai' : 'Tandai Selesai'}
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toast.info(`Cetak ${selectedDokumen.nama}`)
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-surface-container-high text-text-high hover:bg-surface-container-low transition-all"
                >
                  <span className="material-symbols-outlined text-lg">print</span>
                  Cetak
                </button>
                {selectedDokumen.formFields?.length > 0 && (
                  <button
                    onClick={handleSaveForm}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-on-primary hover:brightness-110 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">save</span>
                    Simpan
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
