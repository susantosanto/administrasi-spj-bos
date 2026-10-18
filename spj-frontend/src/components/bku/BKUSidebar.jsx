import { useState, useEffect, useRef } from 'react'

/**
 * BKU Premium Sidebar
 * Sliding detail panel untuk transaksi BKU
 * Animasi smooth, navigasi prev/next, informasi transaksi lengkap
 * Tab: Detail + Dokumentasi (auto-detect template)
 *
 * Design 2026 — minimalis, kontras tinggi, mudah dibaca.
 * Efek glassmorphism dipertahankan pada panel & header.
 */
import { cn } from '../../ui/cn'
import { detectTemplate } from '../../utils/templateDetector'
import { buildSpjChecklist, isBpuBnu } from '../../data/spjRequirements'
import { getNamaKegiatan, getNamaRekening } from '../../data/kodeReferensi'
import DokumentasiAIGenerate from '../dokumentasi/DokumentasiAIGenerate'
import {
  BadgeCent,
  Zap,
  PenTool,
  Utensils,
  Printer,
  Wifi,
  BookOpen,
  FileText,
  MapPin,
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react'
import Badge from '../../ui/atoms/Badge'

// ─── Constants ─────────────────────────────────────────────────

const TYPE_BADGE_VARIANT = {
  PENERIMAAN_BOSP: { variant: 'success', label: 'Dana BOSP' },
  PUNGUT_PPH: { variant: 'warning', label: 'Pungut PPh' },
  PERGESERAN_BANK: { variant: 'info', label: 'Pergeseran' },
  SETOR_PAJAK: { variant: 'danger', label: 'Setor Pajak' },
  TARIK_TUNAI: { variant: 'warning', label: 'Tarik Tunai' },
  BUNGA_BANK: { variant: 'success', label: 'Bunga Bank' },
  PAJAK_BUNGA: { variant: 'danger', label: 'Pajak Bunga' },
  PEMBAYARAN: { variant: 'default', label: 'Pembayaran' },
  SALDO_AWAL: { variant: 'primary', label: 'Saldo Awal' },
  LAINNYA: { variant: 'default', label: '-' },
}

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

const KATEGORI_LABELS = {
  HONOR: { label: 'Honor/Gaji', Icon: BadgeCent, color: 'text-purple-600' },
  LISTRIK: { label: 'Listrik', Icon: Zap, color: 'text-orange-600' },
  ATK: { label: 'ATK', Icon: PenTool, color: 'text-blue-600' },
  MAMIN: { label: 'Makan/Minuman', Icon: Utensils, color: 'text-green-600' },
  CETAK: { label: 'Cetak/Penggandaan', Icon: Printer, color: 'text-teal-600' },
  INTERNET: { label: 'Pulsa/Internet', Icon: Wifi, color: 'text-cyan-600' },
  PERPUS: { label: 'Perpustakaan', Icon: BookOpen, color: 'text-indigo-600' },
}

// ─── Helper: extract Saldo Awal ────────────────────────────────

function getSaldoAwal(items) {
  const saldoAwal = items.find(t => t.tipe === 'SALDO_AWAL' || (t.uraian && (t.uraian.toLowerCase().includes('saldo bank') || t.uraian.toLowerCase().includes('saldo tunai'))))
  return saldoAwal ? saldoAwal.saldo : 0
}

// ─── Component ─────────────────────────────────────────────────

export default function BKUSidebar({ transaction, allTransactions, onClose, onNavigate, showToast, onOpenMamin, isLpjChecked, onToggleLpj }) {
  const sidebarRef = useRef(null)
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('detail')
  const [spjOpen, setSpjOpen] = useState(false)
  const [spjChecked, setSpjChecked] = useState({})
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)

  // Listen for AI-generated photos
  useEffect(() => {
    const handler = (e) => {
      const photo = e.detail
      if (photo) {
        setUploadedPhotos((prev) => [...prev, photo])
      }
    }
    window.addEventListener('addGeneratedPhoto', handler)
    return () => window.removeEventListener('addGeneratedPhoto', handler)
  }, [])

  useEffect(() => {
    sidebarRef.current?.focus()
    setActiveTab('detail')
    setSpjOpen(false)
    setSpjChecked({})
    setUploadedPhotos([])
    setShowPhotoPreview(false)
  }, [transaction])

  if (!transaction) return null

  const badge = TYPE_BADGE_VARIANT[transaction.tipe] || TYPE_BADGE_VARIANT.LAINNYA
  const kategoriInfo = transaction.kategori ? KATEGORI_LABELS[transaction.kategori.key] : null
  const currentIdx = allTransactions.findIndex(t => t.row === transaction.row)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allTransactions.length - 1
  const saldoAwal = getSaldoAwal(allTransactions)

  // Auto-detect template
  const detectedTemplate = detectTemplate(transaction.kodeRekening)
  const rowKey = transaction.row
  const isChecked = isLpjChecked ? isLpjChecked[rowKey] : false

  // ── SPJ checklist (khusus BPU / BNU) ──
  const spjApplicable = isBpuBnu(transaction)
  const spj = spjApplicable ? buildSpjChecklist(transaction) : null
  const spjTotalItems = spj ? spj.groups.reduce((s, g) => s + g.items.length, 0) : 0
  const spjCheckedCount = Object.values(spjChecked).filter(Boolean).length
  const spjProgress = spjTotalItems ? Math.round((spjCheckedCount / spjTotalItems) * 100) : 0

  const handlePrev = () => {
    if (hasPrev && onNavigate) onNavigate(allTransactions[currentIdx - 1])
  }
  const handleNext = () => {
    if (hasNext && onNavigate) onNavigate(allTransactions[currentIdx + 1])
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev()
    if (e.key === 'ArrowRight') handleNext()
    if (e.key === 'Escape') onClose()
  }

  // ── Foto bukti (Upload Dokumen Pendukung) ──
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedPhotos((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random()}`, name: file.name, dataUrl: reader.result, caption: '' },
        ])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const updatePhotoCaption = (id, val) => {
    setUploadedPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, caption: val } : p)))
  }

  const removePhoto = (id) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const printPhotoDoc = () => {
    const printContainer = document.querySelector('.print-container')
    if (printContainer) {
      printContainer.classList.remove('portrait', 'landscape')
      printContainer.classList.add('portrait')
    }
    window.print()
  }

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 bg-text-low/40 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* ══ PREMIUM GLASS SIDEBAR (efek glass dipertahankan) ══ */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full max-w-xl glass-strong shadow-2xl z-[110] overflow-y-auto animate-slide-in-left border-l border-border-strong outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ── Sticky Glass Header ── */}
        <div className="sticky top-0 z-20 glass-sticky">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-lg text-text-muted hover:bg-surface-muted hover:text-text-high transition-all active:scale-95"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-base font-bold text-text-high leading-tight">Detail Transaksi</h3>
                <p className="text-xs text-text-muted">
                  {transaction.tanggalStr} · Baris {transaction.row} / {allTransactions.length}
                </p>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`p-2 rounded-lg transition-all ${
                  hasPrev
                    ? 'text-text-high hover:bg-surface-muted active:scale-95'
                    : 'text-text-low cursor-not-allowed'
                }`}
                title="Sebelumnya (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-xs text-text-muted font-mono min-w-[2.5rem] text-center">
                {currentIdx + 1}/{allTransactions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`p-2 rounded-lg transition-all ${
                  hasNext
                    ? 'text-text-high hover:bg-surface-muted active:scale-95'
                    : 'text-text-low cursor-not-allowed'
                }`}
                title="Berikutnya (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Quick summary bar */}
          <div className="px-5 pb-3 flex items-center gap-2 text-xs">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {transaction.noBukti && (
              <span className="font-mono text-text-muted">#{transaction.noBukti}</span>
            )}
            {transaction.kodeKegiatan && (() => {
              const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
              const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
              if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
              return (
                <span className="text-[11px] text-text-muted truncate max-w-[160px] inline-flex items-center gap-1" title={namaKeg}>
                  <MapPin className="w-3.5 h-3.5 text-text-low" />
                  {namaKeg.substring(0, 30)}
                </span>
              )
            })()}
          </div>
          {/* ── Tabs ── */}
          <div className="px-5 flex gap-1">
            {[
              { id: 'detail', label: 'Detail', icon: 'info' },
              { id: 'dokumentasi', label: 'Dokumentasi LPJ', icon: 'description' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 px-3 py-2.5 rounded-t-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === t.id
                    ? 'bg-surface text-text-high border border-b-surface border-border shadow-sm'
                    : 'text-text-muted hover:text-text-high hover:bg-surface-muted/60'
                }`}
              >
                {t.id === 'detail' ? (
                  <FileText className="w-4 h-4" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-4">

        {activeTab === 'detail' ? (
          <>
          {/* ── Hero Card: Uraian + Angka Kunci ── */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary shadow-sm flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-on-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">Uraian Kegiatan</p>
                <p className="text-lg font-bold text-text-high leading-snug">
                  {transaction.uraian || '-'}
                </p>
                {/* Keterangan kegiatan dari kode kegiatan */}
                {transaction.kodeKegiatan && (() => {
                  const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
                  const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                  if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
                  return (
                    <div className="mt-2.5 flex items-start gap-2 bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                      <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-primary font-semibold uppercase tracking-[0.1em]">Kegiatan</p>
                        <p className="text-xs font-semibold text-text-high leading-relaxed">{namaKeg}</p>
                        <p className="text-[10px] text-text-low mt-0.5 font-mono">{normalized}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Angka kunci */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-xl bg-success/10 border border-success/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-success mb-1">Debet</p>
                <p className="text-base font-bold text-success leading-tight">
                  {transaction.debet > 0 ? `Rp ${fmt(transaction.debet)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-danger/10 border border-danger/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-danger mb-1">Kredit</p>
                <p className="text-base font-bold text-danger leading-tight">
                  {transaction.kredit > 0 ? `Rp ${fmt(transaction.kredit)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-muted border border-border p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Saldo</p>
                <p className="text-base font-bold text-text-high leading-tight">
                  Rp {fmt(transaction.saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Informasi Referensi ── */}
          <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-text-muted" />
              Informasi Referensi
            </h4>
            <dl className="divide-y divide-border">
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-text-muted">No. Bukti</dt>
                <dd className="text-sm font-semibold text-text-high font-mono">{transaction.noBukti || '-'}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-text-muted">Kode Kegiatan</dt>
                <dd className="text-right">
                  <span className="text-sm font-semibold text-text-high font-mono block">{transaction.kodeKegiatan || '-'}</span>
                  {transaction.kodeKegiatan && (() => {
                    const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                    return namaKeg ? <span className="text-[11px] text-text-muted block mt-0.5">{namaKeg}</span> : null
                  })()}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-text-muted">Kode Rekening</dt>
                <dd className="text-right">
                  <span className="text-sm font-semibold text-text-high font-mono block">{transaction.kodeRekening || '-'}</span>
                  {transaction.kodeRekening && (() => {
                    const namaRek = getNamaRekening(transaction.kodeRekening)
                    return namaRek !== transaction.kodeRekening ? (
                      <span className="text-[11px] text-text-muted block mt-0.5">{namaRek}</span>
                    ) : null
                  })()}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-text-muted">Tanggal</dt>
                <dd className="text-sm font-medium text-text-high">{transaction.tanggalStr}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-text-muted">Tipe Transaksi</dt>
                <dd>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </dd>
              </div>
            </dl>
          </div>

          {/* ── Kategori Belanja ── */}
          {kategoriInfo && (
            <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-text-muted text-[18px]">category</span>
                </span>
                Kategori Belanja
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-surface-muted">
                  {kategoriInfo.Icon ? (
                    <kategoriInfo.Icon className={cn("w-4 h-4", kategoriInfo.color)} />
                  ) : null}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-high">{kategoriInfo.label}</p>
                  <p className="text-[11px] text-text-muted font-mono">Kode: {transaction.kodeRekening}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Dokumen SPJ (khusus BPU / BNU) ── */}
          {spjApplicable && spj && (
            <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
              <button
                onClick={() => setSpjOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-surface-muted/60 transition-all text-left"
                aria-expanded={spjOpen}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-high">Lihat Dokumen SPJ</p>
                  <p className="text-[11px] text-text-muted truncate">Kelengkapan untuk {spj.category.label}</p>
                </div>
                <span className={`text-xs font-bold mr-1 ${spjProgress === 100 ? 'text-success' : 'text-text-muted'}`}>
                  {spjProgress}%
                </span>
                <span className={`text-text-muted transition-transform duration-300 ${spjOpen ? 'rotate-180' : ''}`}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </span>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${spjOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-0 space-y-4 border-t border-border">
                  {spj.groups.map((group, gi) => (
                    <div key={gi}>
                      <div className="flex items-center gap-2 mt-4 mb-2">
                        <span className="text-primary text-base">{group.icon}</span>
                        <p className="text-sm font-bold text-text-high">{group.title}</p>
                      </div>
                      {group.keterangan && (
                        <p className="text-[11px] text-text-muted mb-2 -mt-1 leading-relaxed">{group.keterangan}</p>
                      )}
                      <ul className="space-y-1">
                        {group.items.map((item, ii) => {
                          const key = `${gi}-${ii}`
                          const checked = !!spjChecked[key]
                          return (
                            <li key={ii}>
                              <button
                                onClick={() => setSpjChecked((c) => ({ ...c, [key]: !c[key] }))}
                                className="w-full flex items-start gap-2.5 text-left py-1 rounded-lg hover:bg-surface-muted transition-colors"
                              >
                                <span className={`text-[18px] mt-0.5 flex-shrink-0 ${checked ? 'text-success' : 'text-text-low'}`}>
                                  {checked ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <span className={`text-sm leading-relaxed ${checked ? 'line-through text-text-muted' : 'text-text-high'}`}>
                                  {item}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                  <p className="text-[11px] text-text-muted pt-1">
                    Centang dokumen yang sudah tersedia. Dokumen wajib luar Arkas berlaku jika tidak melalui SIPLAH.
                  </p>
                </div>
              </div>
            </div>
          )}
          </>
        ) : (
          <>
          {/* ══════════════════════════════════════════════════════════════════ */}
          {/* TAB: DOKUMENTASI LPJ                                        */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Status Kelengkapan */}
            <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-lg bg-primary shadow-md shadow-primary/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-on-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">Status Kelengkapan</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xl ${isChecked ? 'text-success' : 'text-text-low'}`}>
                      {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-sm font-bold ${isChecked ? 'text-success' : 'text-text-muted'}`}>
                      {isChecked ? 'Dokumen LPJ Lengkap' : 'Dokumen LPJ Belum Lengkap'}
                    </span>
                  </div>
                  <button
                    onClick={() => onToggleLpj?.(rowKey)}
                    className={`mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isChecked
                        ? 'bg-warning/10 text-warning hover:bg-warning/20'
                        : 'bg-success/10 text-success hover:bg-success/20'
                    }`}
                  >
                    <span className="text-sm">{isChecked ? 'undo' : 'check'}</span>
                    {isChecked ? 'Tandai Belum Lengkap' : 'Tandai Sudah Lengkap'}
                  </button>
                </div>
              </div>
            </div>

            {/* Template Terdeteksi */}
            <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-text-muted text-[18px]">auto_awesome</span>
                </span>
                Template Dokumen Terdeteksi
              </h4>
              {detectedTemplate ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <span className={`text-indigo-600 text-xl`}>{detectedTemplate.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-high">{detectedTemplate.label}</p>
                    <p className="text-[11px] text-text-muted">Template: {detectedTemplate.templateId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-surface-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-text-muted text-xl">help_outline</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-high">Tidak ada template spesifik</p>
                    <p className="text-[11px] text-text-muted">Transaksi ini tidak memerlukan template LPJ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Dokumen Pendukung (Foto) */}
            <div className="bg-surface rounded-xl border border-border shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-text-muted mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-surface-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-text-muted text-[18px]">upload_file</span>
                </span>
                Upload Dokumen Pendukung (Foto)
              </h4>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-dashed border-border bg-surface-muted text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-colors p-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface shadow-sm flex items-center justify-center mx-auto mb-2">
                  <span className="text-3xl text-text-muted">cloud_upload</span>
                </div>
                <p className="text-sm font-semibold text-text-high mb-0.5">Upload Foto Bukti</p>
                <p className="text-[11px] text-text-muted mb-3">JPG, PNG — bisa pilih banyak</p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary-hover transition-all shadow-sm shadow-primary/25">
                  <span className="text-sm">add</span>
                  Pilih File
                </div>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedPhotos.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-surface-muted border border-border rounded-xl p-2">
                      <img src={p.dataUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      <input
                        type="text"
                        value={p.caption}
                        onChange={(e) => updatePhotoCaption(p.id, e.target.value)}
                        placeholder="Keterangan foto"
                        className="flex-1 px-2.5 py-1.5 text-sm bg-surface border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-text-high"
                      />
                      <button
                        onClick={() => removePhoto(p.id)}
                        className="p-1.5 text-danger hover:bg-danger/10 rounded-lg flex-shrink-0"
                        title="Hapus"
                      >
                        <span className="text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPhotoPreview(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-primary-hover text-on-primary rounded-xl text-sm font-semibold shadow-sm shadow-primary/25 hover:brightness-110 transition-all active:scale-95"
                  >
                    <span className="text-lg">visibility</span>
                    Preview Dokumen Foto
                  </button>
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GENERATE FOTO DOKUMENTASI AI                                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <DokumentasiAIGenerate transaction={transaction} uploadedPhotos={uploadedPhotos} />

            {/* Quick Actions */}
            <button
              onClick={() => showToast?.('Buka halaman Dokumen LPJ untuk cetak template ini')}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-surface border border-border shadow-sm rounded-2xl hover:bg-surface-muted transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                <span className="text-primary group-hover:text-on-primary text-lg transition-colors">print</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-text-high">Cetak Dokumen LPJ</p>
                <p className="text-[11px] text-text-muted">Buka halaman Cetak Dokumen</p>
              </div>
              <span className="text-text-muted group-hover:text-text-high transition-colors text-lg">arrow_forward</span>
            </button>
          </div>

          {/* ══ PREVIEW DOKUMEN FOTO (modal) ══ */}
          {showPhotoPreview && (
            <div
              className="fixed inset-0 z-[200] bg-text-low/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowPhotoPreview(false)}
            >
              <div
                className="bg-surface rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-surface border-b border-border flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-lg">visibility</span>
                    <span className="text-sm font-bold">Preview Dokumen Foto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={printPhotoDoc}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary to-primary-hover text-on-primary shadow-sm shadow-primary/25 hover:brightness-110 transition-all"
                    >
                      <span className="text-lg">print</span>
                      Cetak
                    </button>
                    <button
                      onClick={() => setShowPhotoPreview(false)}
                      className="p-2 rounded-xl hover:bg-surface-muted transition-all"
                    >
                      <X className="w-4 h-4 text-text-muted" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="print-container portrait bg-surface">
                    <h1 className="text-center font-bold text-lg uppercase tracking-wide mb-1">Dokumentasi Foto Kegiatan</h1>
                    <p className="text-center text-xs text-text-muted mb-4">
                      {transaction.uraian || '-'}{transaction.tanggalStr ? ` — ${transaction.tanggalStr}` : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedPhotos.map((p) => (
                        <div key={p.id} className="border border-border rounded-lg p-1">
                          <img src={p.dataUrl} alt={p.name} className="w-full h-44 object-cover rounded" />
                          <p className="text-[11px] text-text-muted mt-1 px-1 pb-1">{p.caption || 'Tanpa keterangan'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 flex justify-between text-xs font-semibold text-text-muted">
                      <div className="text-center">
                        <div className="border-t border-text-low pt-1 w-40">Kepala Sekolah</div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-text-low pt-1 w-40">Bendahara</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </>
        )}

          <div className="h-12" />
        </div>
      </div>
    </>
  )
}
