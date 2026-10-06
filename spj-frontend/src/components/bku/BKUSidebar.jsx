import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * BKU Premium Sidebar
 * Sliding detail panel untuk transaksi BKU
 * Animasi smooth, navigasi prev/next, informasi transaksi lengkap
 * Tab: Detail + Dokumentasi (auto-detect template)
 *
 * Design 2026 — minimalis, kontras tinggi, mudah dibaca.
 * Efek glassmorphism dipertahankan pada panel & header.
 */
import { detectTemplate } from '../../utils/templateDetector'
import { REKENING_KE_MENU, kategoriDenganKoreksi, simpanKoreksi, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, parseMamin, grupDenganDominan } from '../../utils/bkuKategori'
import { isBpuBnu, SPJ_REQUIREMENTS, SPJ_PBJ_DOCS, SPJ_WAJIB_LUAR_ARKAS, detectSpjCategory } from '../../data/spjRequirements'
import { getNamaKegiatan, getNamaRekening } from '../../data/kodeReferensi'
import DokumentasiAIGenerate from '../dokumentasi/DokumentasiAIGenerate'

// ─── Constants ─────────────────────────────────────────────────

const TYPE_BADGES = {
  PENERIMAAN_BOSP: { bg: 'bg-emerald-100 text-emerald-700', label: 'Dana BOSP' },
  PUNGUT_PPH: { bg: 'bg-amber-100 text-amber-700', label: 'Pungut PPh' },
  PERGESERAN_BANK: { bg: 'bg-blue-100 text-blue-700', label: 'Pergeseran' },
  SETOR_PAJAK: { bg: 'bg-rose-100 text-rose-700', label: 'Setor Pajak' },
  TARIK_TUNAI: { bg: 'bg-orange-100 text-orange-700', label: 'Tarik Tunai' },
  BUNGA_BANK: { bg: 'bg-teal-100 text-teal-700', label: 'Bunga Bank' },
  PAJAK_BUNGA: { bg: 'bg-pink-100 text-pink-700', label: 'Pajak Bunga' },
  PEMBAYARAN: { bg: 'bg-slate-200 text-slate-700', label: 'Pembayaran' },
  SALDO_AWAL: { bg: 'bg-purple-100 text-purple-700', label: 'Saldo Awal' },
  LAINNYA: { bg: 'bg-slate-100 text-slate-500', label: '-' },
}

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

// Peta kategori BKU → kategori dokumen SPJ (dinamis, bukan statis).
// Kunci kiri = kategori dari bkuKategori (katEfektif.kategori).
// Kunci kanan = key di SPJ_REQUIREMENTS.
const KATEGORI_KE_SPJ = {
  honor: 'HONOR',
  perjalanan_dinas: 'PERJALANAN_DINAS',
  mamin: 'MAMIN',
  atk: 'PENGGANDAAN',
  pemeliharaan: 'PEMELIHARAAN',
}

// ─── Helper: extract Saldo Awal ────────────────────────────────

function getSaldoAwal(items) {
  const saldoAwal = items.find(t => t.tipe === 'SALDO_AWAL' || (t.uraian && (t.uraian.toLowerCase().includes('saldo bank') || t.uraian.toLowerCase().includes('saldo tunai'))))
  return saldoAwal ? saldoAwal.saldo : 0
}

// ─── Component ─────────────────────────────────────────────────

export default function BKUSidebar({ transaction, allTransactions, onClose, onNavigate, showToast, onOpenMamin }) {
  const navigate = useNavigate()
  const sidebarRef = useRef(null)
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('detail')
  const [spjOpen, setSpjOpen] = useState(false)
  const [spjChecked, setSpjChecked] = useState({})
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [showPhotoPreview, setShowPhotoPreview] = useState(false)
  const spjCardRef = useRef(null)

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

  const badge = TYPE_BADGES[transaction.tipe] || TYPE_BADGES.LAINNYA
  const currentIdx = allTransactions.findIndex(t => t.row === transaction.row)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allTransactions.length - 1
  const saldoAwal = getSaldoAwal(allTransactions)

  // Sprint 004 B.1 — kategori rekening otoritatif + koreksi manual
  const katRekening = kategoriDenganKoreksi(transaction.kodeRekening, transaction.noBukti)
  const [koreksiTick, setKoreksiTick] = useState(0)
  void koreksiTick
  const handleKoreksi = (idx) => {
    if (idx === '' || idx == null) return
    const entri = REKENING_KE_MENU[Number(idx)]
    if (!entri) return
    simpanKoreksi(transaction.kodeRekening, entri, transaction.noBukti)
    setKoreksiTick((t) => t + 1)
    if (showToast) showToast('Koreksi kategori tersimpan permanen')
  }

  // Sprint 004 D.1 — info kelompok ATK transaksi ini
  const atkGroup = katRekening?.kategori === 'atk'
    ? kelompokATK(allTransactions || []).find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    : null
  const atkFlagKey = String(transaction.noBukti || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const atkFlag = atkFlagKey ? (loadAtkFlag()[atkFlagKey] || null) : null

  // Sprint 004 C.1 — grup konsumsi untuk transaksi ini (bila ada)
  const grupSaya = katRekening?.kategori === 'mamin'
    ? gabungKonsumsi(allTransactions || []).grup.find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    : null

  // T2 — grup se-NoBukti + dominan (satu bukti satu kelompok, label/header/deep-link pakai dominan)
  const grupSeBukti = (() => {
    try {
      const semua = grupDenganDominan(allTransactions || [])
      return semua.find((g) => g.rows.some((r) => r.row === transaction.row)) || null
    } catch { return null }
  })()
  const katEfektif = (grupSeBukti && grupSeBukti.dominan) || katRekening

  // Sprint 004 B.2 — deep-link ke menu dokumen tepat (prefill dikonsumsi B.3)
  // T3: pratinjau + prefill Mamin cerdas via parseMamin terpusat.
  const namaKegiatanSaya = (() => {
    if (!transaction.kodeKegiatan) return transaction.kegiatan || ''
    const nama = getNamaKegiatan(transaction.kodeKegiatan)
    const normal = String(transaction.kodeKegiatan).replace(/\.$/, '')
    if (!nama || nama === normal || nama === '-') return transaction.kegiatan || ''
    return nama
  })()
  const maminParsed = katEfektif?.kategori === 'mamin'
    ? parseMamin(transaction.uraian || '', namaKegiatanSaya)
    : null
  const handleDeepLink = () => {
    if (!katEfektif) return
    const nominal = transaction.pengeluaran || transaction.kredit || 0
    const tujuan = katEfektif.route === 'dokumen-kelengkapan'
      ? '/dashboard/dokumen-kelengkapan'
      : '/dashboard/dokumen-lpj'
    navigate(tujuan, {
      state: { fromBKU: true, ts: Date.now(), kategori: katEfektif.kategori, menu: katEfektif.menu, bku: { uraian: transaction.uraian, nominal, tanggal: transaction.tanggalStr, noBukti: transaction.noBukti, kegiatan: transaction.kodeKegiatan, kegiatanNama: namaKegiatanSaya, maminJenis: maminParsed?.jenis || '', kodeRekening: transaction.kodeRekening, grupCount: grupSeBukti ? grupSeBukti.rows.length : (grupSaya ? grupSaya.rows.length : 1), grupTotal: grupSeBukti ? grupSeBukti.total : (grupSaya ? grupSaya.total : nominal) } },
    })
    if (onClose) onClose()
  }

  // Auto-detect template (warisan — read-only)
  const detectedTemplate = detectTemplate(transaction.kodeRekening)

  // ── SPJ checklist DINAMIS ikut kategori transaksi ──
  // Peta: kategori BKU (katEfektif) → SPJ_REQUIREMENTS; fallback ke deteksi
  // kata-kunci/kode via detectSpjCategory agar selalu ada isi (bukan statis).
  const spjCatKey = (katEfektif?.kategori && KATEGORI_KE_SPJ[katEfektif.kategori])
    || detectSpjCategory(transaction)
    || 'UMUM'
  const spjCategory = SPJ_REQUIREMENTS[spjCatKey] || SPJ_REQUIREMENTS.UMUM
  const spj = {
    catKey: spjCatKey,
    category: spjCategory,
    groups: [
      {
        title: `Bukti Fisik — ${spjCategory.label}`,
        icon: spjCategory.icon,
        keterangan: spjCategory.keterangan,
        items: spjCategory.items,
      },
      {
        title: SPJ_PBJ_DOCS.label,
        icon: SPJ_PBJ_DOCS.icon,
        keterangan: SPJ_PBJ_DOCS.keterangan,
        items: SPJ_PBJ_DOCS.items,
      },
      {
        title: 'Dokumen Wajib (Luar Arkas)',
        icon: 'folder_special',
        keterangan: 'Hanya jika TIDAK melalui SIPLAH. Jika SIPLAH, cukup Dokumen PBJ di atas.',
        items: SPJ_WAJIB_LUAR_ARKAS,
      },
    ],
  }
  // Tampil untuk belanja (PEMBAYARAN) atau BPU/BNU atau berkategori.
  // Penerimaan murni tanpa kategori tetap dapat UMUM agar informatif.
  const spjApplicable = Boolean(
    transaction.tipe === 'PEMBAYARAN' || isBpuBnu(transaction) || katEfektif || spjCategory
  )
  const spjTotalItems = spj ? spj.groups.reduce((s, g) => s + g.items.length, 0) : 0
  const spjCheckedCount = Object.values(spjChecked).filter(Boolean).length
  const spjProgress = spjTotalItems ? Math.round((spjCheckedCount / spjTotalItems) * 100) : 0
  // Nominal ringkasan + aksi Lihat Dokumen (scroll ke card SPJ)
  const nominalRingkasan = transaction.pengeluaran || transaction.kredit
    || transaction.penerimaan || transaction.debet || 0
  const handleLihatDokumen = () => {
    setSpjOpen(true)
    requestAnimationFrame(() => {
      spjCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* ══ PREMIUM GLASS SIDEBAR (efek glass dipertahankan) ══ */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white/70 backdrop-blur-2xl shadow-2xl z-[110] overflow-y-auto animate-slide-in-left border-l border-white/40 outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ── Sticky Glass Header ── */}
        <div className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-slate-200/70">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
                title="Tutup"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">Detail Transaksi</h3>
                <p className="text-xs text-slate-500">
                  {transaction.tanggalStr} · Baris {transaction.row} / {allTransactions.length}
                </p>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`p-2 rounded-xl transition-all ${
                  hasPrev
                    ? 'text-slate-700 hover:bg-slate-100 active:scale-95'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Sebelumnya (←)"
              >
                <span className="material-symbols-outlined text-2xl">chevron_left</span>
              </button>
              <span className="text-xs text-slate-400 font-mono min-w-[2.5rem] text-center">
                {currentIdx + 1}/{allTransactions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`p-2 rounded-xl transition-all ${
                  hasNext
                    ? 'text-slate-700 hover:bg-slate-100 active:scale-95'
                    : 'text-slate-300 cursor-not-allowed'
                }`}
                title="Berikutnya (→)"
              >
                <span className="material-symbols-outlined text-2xl">chevron_right</span>
              </button>
            </div>
          </div>
          {/* Quick summary bar */}
          <div className="px-5 pb-3 flex items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg}`}>
              {badge.label}
            </span>
            {transaction.noBukti && (
              <span className="font-mono text-slate-500">#{transaction.noBukti}</span>
            )}
            {transaction.kodeKegiatan && (() => {
              const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
              const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
              if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
              return (
                <span className="text-[11px] text-slate-500 truncate max-w-[160px] inline-flex items-center gap-1" title={namaKeg}>
                  <span className="material-symbols-outlined text-[14px] text-slate-400">meeting_room</span>
                  {namaKeg.substring(0, 30)}
                </span>
              )
            })()}
          </div>
          {/* ── Tabs ── */}
          <div className="px-5 flex gap-1">
            {[
              { id: 'detail', label: 'Detail', icon: 'info' },
              { id: 'dokumentasi', label: 'Dokumentasi', icon: 'description' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 px-3 py-2.5 rounded-t-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === t.id
                    ? 'bg-white text-slate-900 border border-b-white border-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                <span className="material-symbols-outlined text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5 space-y-4 bg-white/40">

        {activeTab === 'detail' ? (
          <>
          {/* ── Ringkasan atas: nominal + kategori + no bukti + aksi ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
              </span>
              Ringkasan Transaksi
            </h4>
            <dl className="divide-y divide-slate-100">
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">Nominal</dt>
                <dd className="text-sm font-semibold text-slate-900">Rp {fmt(nominalRingkasan)}</dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">Kategori</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  {katEfektif ? katEfektif.kategori : badge.label}
                </dd>
              </div>
              <div className="flex items-center justify-between py-2">
                <dt className="text-sm text-slate-500">No. Bukti</dt>
                <dd className="text-sm font-semibold text-slate-900 font-mono">{transaction.noBukti || '-'}</dd>
              </div>
            </dl>
            <div className="grid grid-cols-2 gap-2.5 mt-3">
              {katEfektif ? (
                <button
                  onClick={handleDeepLink}
                  title={`Buka di ${katEfektif.menu}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  Buka di LPJ
                </button>
              ) : (
                <button
                  disabled
                  title="Kategori belum dipetakan"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                  Buka di LPJ
                </button>
              )}
              <button
                onClick={handleLihatDokumen}
                title="Lihat kelengkapan dokumen SPJ"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary border border-primary/30 text-sm font-semibold hover:bg-primary-fixed/30 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined text-lg">description</span>
                Lihat Dokumen
              </button>
            </div>
          </div>
          {/* ── Hero Card: Uraian + Angka Kunci ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary shadow-md shadow-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">Uraian Kegiatan</p>
                <p className="text-lg font-bold text-slate-900 leading-snug">
                  {transaction.uraian || '-'}
                </p>
                {/* Keterangan kegiatan dari kode kegiatan */}
                {transaction.kodeKegiatan && (() => {
                  const normalized = transaction.kodeKegiatan.replace(/\.$/, '')
                  const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                  if (!namaKeg || namaKeg === normalized || namaKeg === '-') return null
                  return (
                    <div className="mt-2.5 flex items-start gap-2 bg-primary/10 rounded-xl p-3 border border-primary/25">
                      <span className="material-symbols-outlined text-[18px] text-primary flex-shrink-0 mt-0.5">meeting_room</span>
                      <div className="min-w-0">
                        <p className="text-[11px] text-primary font-bold uppercase tracking-[0.1em]">Kegiatan</p>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed mt-0.5">{namaKeg}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">{normalized}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* Angka kunci — blue-only: primary + slate */}
            <div className="grid grid-cols-3 gap-2.5 mt-4">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Debet</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {transaction.debet > 0 ? `Rp ${fmt(transaction.debet)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Kredit</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  {transaction.kredit > 0 ? `Rp ${fmt(transaction.kredit)}` : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-100 border border-slate-200 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Saldo</p>
                <p className="text-base font-bold text-slate-900 leading-tight">
                  Rp {fmt(transaction.saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Informasi Referensi ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              </span>
              Informasi Referensi
            </h4>
            <dl className="divide-y divide-slate-100">
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">No. Bukti</dt>
                <dd className="text-sm font-semibold text-slate-900 font-mono text-right">{transaction.noBukti || '-'}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Kode Kegiatan</dt>
                <dd className="text-right min-w-0">
                  <span className="text-sm font-semibold text-slate-900 font-mono block">{transaction.kodeKegiatan || '-'}</span>
                  {transaction.kodeKegiatan && (() => {
                    const namaKeg = getNamaKegiatan(transaction.kodeKegiatan)
                    return namaKeg ? <span className="text-xs text-slate-600 block mt-1 leading-relaxed">{namaKeg}</span> : null
                  })()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Kode Rekening</dt>
                <dd className="text-right min-w-0">
                  <span className="text-sm font-semibold text-slate-900 font-mono block">{transaction.kodeRekening || '-'}</span>
                  {transaction.kodeRekening && (() => {
                    const namaRek = getNamaRekening(transaction.kodeRekening)
                    return namaRek !== transaction.kodeRekening ? (
                      <span className="text-xs text-slate-600 block mt-1 leading-relaxed">{namaRek}</span>
                    ) : null
                  })()}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Tanggal</dt>
                <dd className="text-sm font-semibold text-slate-900">{transaction.tanggalStr}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 py-2.5">
                <dt className="text-sm font-medium text-slate-600 flex-shrink-0">Tipe Transaksi</dt>
                <dd>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badge.bg}`}>
                    {badge.label}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          {/* ── Kategori Belanja (Sprint 004: sumber rekening) ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
              </span>
              Kategori Belanja
            </h4>
            {katRekening ? (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-primary/10">
                  <span className="material-symbols-outlined text-primary text-xl">folder_open</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{katRekening.menu}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Kode: {transaction.kodeRekening}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-500">Belum dipetakan</p>
                <label className="text-[11px] text-slate-500">Koreksi manual (tersimpan permanen):</label>
                <select
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                  defaultValue=""
                  onChange={(e) => handleKoreksi(e.target.value)}
                >
                  <option value="" disabled>Pilih kategori…</option>
                  {REKENING_KE_MENU.map((m, i) => (
                    <option key={m.prefix} value={String(i)}>{m.kategori} → {m.menu}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {/* ── Rincian Mamin (deep-link pindah ke kartu Ringkasan di atas) ── */}
          {maminParsed && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Rincian Mamin</p>
              <p className="text-sm text-slate-800">Acara: <span className="font-semibold text-slate-900">{maminParsed.acara || '-'}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Jenis: {maminParsed.jenis === 'rapat' ? 'Rapat' : maminParsed.jenis === 'kegiatan' ? 'Kegiatan' : '—'}</p>
            </div>
          )}
          {/* ── T2: Anggota grup se-NoBukti (satu bukti satu kelompok) ── */}
          {grupSeBukti && grupSeBukti.rows.length > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-600 text-[18px]">folder_open</span>
                </span>
                Rincian se-Bukti {grupSeBukti.noBukti || '-'} ({grupSeBukti.rows.length})
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                Kategori: <span className="font-semibold text-primary">{grupSeBukti.dominan ? grupSeBukti.dominan.kategori : 'Belum dipetakan'}</span>
                <span className="font-mono"> &#183; Kode: {(grupSeBukti.kodeList || []).join(', ') || '-'}</span>
              </p>
              <ul className="divide-y divide-slate-100">
                {grupSeBukti.rows.map((r) => {
                  const kat = kategoriDenganKoreksi(r.kodeRekening, r.noBukti)
                  const aktif = r.row === transaction.row
                  return (
                    <li key={r.row}>
                      <button
                        onClick={() => { if (onNavigate && !aktif) onNavigate(r) }}
                        className={`w-full text-left py-2 flex items-center gap-2 ${aktif ? '' : 'hover:bg-slate-50'} rounded-lg px-1`}
                        title={r.uraian || ''}
                      >
                        <span className={`w-1.5 self-stretch rounded-full ${aktif ? 'bg-primary' : 'bg-slate-200'}`} />
                        <span className="flex-1 min-w-0">
                          <span className={`block text-xs truncate ${aktif ? 'font-bold text-slate-900' : 'text-slate-700'}`}>{r.uraian || '-'}</span>
                          <span className="block font-mono text-[10px] text-slate-400 truncate">{r.kodeRekening || '-'} &#183; Rp {fmt(r.pengeluaran || r.kredit || 0)}</span>
                        </span>
                        {kat ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-primary/10 text-primary flex-shrink-0">{kat.kategori}</span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 flex-shrink-0">Belum</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {/* ── Kelompok ATK (Sprint 004 D.1) ── */}
          {atkGroup && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Kelompok ATK</h4>
              <p className="text-sm text-slate-800">↳ {atkGroup.rows.length} baris se-Nomor <span className="font-mono font-semibold">{atkGroup.noBukti || '-'}</span> · Rp {fmt(atkGroup.total)}</p>
              <div className="flex items-center gap-1.5 mt-2.5">
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'siplah'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'siplah' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>SIPLAH</button>
                <button onClick={() => { simpanAtkFlag(transaction.noBukti, 'non'); setKoreksiTick((t) => t + 1) }} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${atkFlag === 'non' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>Non-SIPLAH</button>
              </div>
            </div>
          )}
          {/* ── Dokumen SPJ DINAMIS ikut kategori transaksi ── */}
          {spjApplicable && spj && (
            <div ref={spjCardRef} id="bku-spj-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <button
                onClick={() => setSpjOpen((o) => !o)}
                className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-all text-left"
                aria-expanded={spjOpen}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">description</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">Lihat Dokumen SPJ</p>
                  <p className="text-[11px] text-slate-500 truncate">Kelengkapan untuk {spj.category.label}</p>
                </div>
                <span className={`text-xs font-bold mr-1 ${spjProgress === 100 ? 'text-primary' : 'text-slate-400'}`}>
                  {spjProgress}%
                </span>
                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${spjOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${spjOpen ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-5 pt-0 space-y-4 border-t border-slate-100">
                  {spj.groups.map((group, gi) => (
                    <div key={gi}>
                      <div className="flex items-center gap-2 mt-4 mb-2">
                        <span className="material-symbols-outlined text-primary text-base">{group.icon}</span>
                        <p className="text-sm font-bold text-slate-800">{group.title}</p>
                      </div>
                      {group.keterangan && (
                        <p className="text-[11px] text-slate-500 mb-2 -mt-1 leading-relaxed">{group.keterangan}</p>
                      )}
                      <ul className="space-y-1">
                        {group.items.map((item, ii) => {
                          const key = `${gi}-${ii}`
                          const checked = !!spjChecked[key]
                          return (
                            <li key={ii}>
                              <button
                                onClick={() => setSpjChecked((c) => ({ ...c, [key]: !c[key] }))}
                                className="w-full flex items-start gap-2.5 text-left py-1 rounded-lg hover:bg-slate-50 transition-colors"
                              >
                                <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${checked ? 'text-primary' : 'text-slate-300'}`}>
                                  {checked ? 'check_circle' : 'radio_button_unchecked'}
                                </span>
                                <span className={`text-sm leading-relaxed ${checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                  {item}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                  <p className="text-[11px] text-slate-400 pt-1">
                    Centang dokumen yang sudah tersedia. Dokumen wajib luar Arkas berlaku jika tidak melalui SIPLAH.
                  </p>
                </div>
              </div>
            </div>
          )}
          </>
        ) : (
          <>
          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: DOKUMENTASI                                        */}
          {/* ════════════════════════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Template Terdeteksi */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </span>
                Template Dokumen Terdeteksi
              </h4>
              {detectedTemplate ? (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <span className={`material-symbols-outlined ${detectedTemplate.color} text-xl`}>{detectedTemplate.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">{detectedTemplate.label}</p>
                    <p className="text-[11px] text-slate-400">Template: {detectedTemplate.templateId}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-400 text-xl">help_outline</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Tidak ada template spesifik</p>
                    <p className="text-[11px] text-slate-400">Transaksi ini tidak perlu dokumen tambahan</p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Dokumen Pendukung (Foto) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-slate-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
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
                className="rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center cursor-pointer hover:bg-slate-100 hover:border-blue-300 transition-colors p-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-3xl text-slate-400">cloud_upload</span>
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-0.5">Upload Foto Bukti</p>
                <p className="text-[11px] text-slate-400 mb-3">JPG, PNG — bisa pilih banyak</p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Pilih File
                </div>
              </div>

              {uploadedPhotos.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedPhotos.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
                      <img src={p.dataUrl} alt={p.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      <input
                        type="text"
                        value={p.caption}
                        onChange={(e) => updatePhotoCaption(p.id, e.target.value)}
                        placeholder="Keterangan foto"
                        className="flex-1 px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                      <button
                        onClick={() => removePhoto(p.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg flex-shrink-0"
                        title="Hapus"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowPhotoPreview(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-600/20 hover:brightness-110 transition-all active:scale-95"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
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
              onClick={() => showToast?.('Buka halaman Dokumen untuk mencetak')}
              className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 shadow-sm rounded-2xl hover:bg-slate-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-110 transition-all">
                <span className="material-symbols-outlined text-blue-600 group-hover:text-white text-lg transition-colors">print</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-slate-900">Cetak Dokumen</p>
                <p className="text-[11px] text-slate-400">Buka halaman Cetak Dokumen</p>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover:text-slate-500 transition-colors text-lg">arrow_forward</span>
            </button>
          </div>

          {/* ══ PREVIEW DOKUMEN FOTO (modal) ══ */}
          {showPhotoPreview && (
            <div
              className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowPhotoPreview(false)}
            >
              <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 flex items-center justify-between p-4">
                  <div className="flex items-center gap-2 text-blue-600">
                    <span className="material-symbols-outlined">visibility</span>
                    <span className="text-sm font-bold">Preview Dokumen Foto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={printPhotoDoc}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 hover:brightness-110 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">print</span>
                      Cetak
                    </button>
                    <button
                      onClick={() => setShowPhotoPreview(false)}
                      className="p-2 rounded-xl hover:bg-slate-100 transition-all"
                    >
                      <span className="material-symbols-outlined text-slate-500">close</span>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="print-container portrait bg-white">
                    <h1 className="text-center font-bold text-lg uppercase tracking-wide mb-1">Dokumentasi Foto Kegiatan</h1>
                    <p className="text-center text-xs text-slate-600 mb-4">
                      {transaction.uraian || '-'}{transaction.tanggalStr ? ` — ${transaction.tanggalStr}` : ''}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {uploadedPhotos.map((p) => (
                        <div key={p.id} className="border border-slate-300 rounded-lg p-1">
                          <img src={p.dataUrl} alt={p.name} className="w-full h-44 object-cover rounded" />
                          <p className="text-[11px] text-slate-700 mt-1 px-1 pb-1">{p.caption || 'Tanpa keterangan'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 flex justify-between text-xs font-semibold text-slate-700">
                      <div className="text-center">
                        <div className="border-t border-slate-500 pt-1 w-40">Kepala Sekolah</div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-slate-500 pt-1 w-40">Bendahara</div>
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
