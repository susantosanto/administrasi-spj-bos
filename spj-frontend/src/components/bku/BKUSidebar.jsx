import { useEffect, useRef } from 'react'

/**
 * BKU Premium Sidebar
 * Sliding detail panel untuk transaksi BKU
 * Animasi smooth, navigasi prev/next, informasi transaksi lengkap
 */
// ─── Constants ─────────────────────────────────────────────────

const TYPE_BADGES = {
  PENERIMAAN_BOSP: { bg: 'bg-green-100 text-green-800', label: 'Dana BOSP' },
  PUNGUT_PPH: { bg: 'bg-yellow-100 text-yellow-800', label: 'Pungut PPh' },
  PERGESERAN_BANK: { bg: 'bg-blue-100 text-blue-800', label: 'Pergeseran' },
  SETOR_PAJAK: { bg: 'bg-red-100 text-red-800', label: 'Setor Pajak' },
  TARIK_TUNAI: { bg: 'bg-orange-100 text-orange-800', label: 'Tarik Tunai' },
  BUNGA_BANK: { bg: 'bg-teal-100 text-teal-800', label: 'Bunga Bank' },
  PAJAK_BUNGA: { bg: 'bg-rose-100 text-rose-800', label: 'Pajak Bunga' },
  PEMBAYARAN: { bg: 'bg-gray-100 text-gray-700', label: 'Pembayaran' },
  SALDO_AWAL: { bg: 'bg-purple-100 text-purple-800', label: 'Saldo Awal' },
  LAINNYA: { bg: 'bg-gray-100 text-gray-500', label: '-' },
}

const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

const KATEGORI_LABELS = {
  HONOR: { label: 'Honor/Gaji', icon: 'badge', color: 'text-purple-600' },
  LISTRIK: { label: 'Listrik', icon: 'bolt', color: 'text-orange-600' },
  ATK: { label: 'ATK', icon: 'draw', color: 'text-blue-600' },
  MAMIN: { label: 'Makan/Minuman', icon: 'restaurant', color: 'text-green-600' },
  CETAK: { label: 'Cetak/Penggandaan', icon: 'print', color: 'text-teal-600' },
  INTERNET: { label: 'Pulsa/Internet', icon: 'wifi', color: 'text-cyan-600' },
  PERPUS: { label: 'Perpustakaan', icon: 'menu_book', color: 'text-indigo-600' },
}

// ─── Helper: extract Saldo Awal ────────────────────────────────

function getSaldoAwal(items) {
  const saldoAwal = items.find(t => t.tipe === 'SALDO_AWAL' || (t.uraian && (t.uraian.toLowerCase().includes('saldo bank') || t.uraian.toLowerCase().includes('saldo tunai'))))
  return saldoAwal ? saldoAwal.saldo : 0
}

// ─── Component ─────────────────────────────────────────────────

export default function BKUSidebar({ transaction, allTransactions, onClose, onNavigate, showToast, onOpenMamin }) {
  const sidebarRef = useRef(null)

  useEffect(() => {
    sidebarRef.current?.focus()
  }, [transaction])

  if (!transaction) return null

  const badge = TYPE_BADGES[transaction.tipe] || TYPE_BADGES.LAINNYA
  const kategoriInfo = transaction.kategori ? KATEGORI_LABELS[transaction.kategori.key] : null
  const currentIdx = allTransactions.findIndex(t => t.row === transaction.row)
  const hasPrev = currentIdx > 0
  const hasNext = currentIdx < allTransactions.length - 1
  const saldoAwal = getSaldoAwal(allTransactions)

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

  return (
    <>
      {/* Backdrop — click outside to close */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] animate-fade-in"
        onClick={onClose}
      />

      {/* ══ SUPER PREMIUM SIDEBAR ══ */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 h-full w-full max-w-xl bg-white/70 backdrop-blur-2xl shadow-2xl z-[110] overflow-y-auto animate-slide-in-left border-l border-white/20 outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* ── Premium Glass Header ── */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-white/20">
          <div className="flex items-center justify-between p-lg">
            <div className="flex items-center gap-md">
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-container-high rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-text-high">Detail Transaksi</h3>
                <p className="text-text-low text-xs">Row {transaction.row} dari {allTransactions.length} transaksi</p>
              </div>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`p-2 rounded-xl transition-all ${
                  hasPrev
                    ? 'hover:bg-surface-container-high hover:scale-105 active:scale-95 text-text-high'
                    : 'text-outline cursor-not-allowed opacity-40'
                }`}
                title="Previous (←)"
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
              <span className="text-xs text-text-low font-mono min-w-[3rem] text-center">
                {currentIdx + 1}/{allTransactions.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`p-2 rounded-xl transition-all ${
                  hasNext
                    ? 'hover:bg-surface-container-high hover:scale-105 active:scale-95 text-text-high'
                    : 'text-outline cursor-not-allowed opacity-40'
                }`}
                title="Next (→)"
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>
          </div>
          {/* Quick summary bar */}
          <div className="px-lg pb-md flex items-center gap-md text-xs text-text-low">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg}`}>
              <span className="material-symbols-outlined text-xs">lens</span>
              {badge.label}
            </span>
            <span>{transaction.tanggalStr}</span>
            {transaction.noBukti && <span className="font-mono">#{transaction.noBukti}</span>}
          </div>
        </div>

        {/* ── Premium Content ── */}
        <div className="p-lg space-y-lg">

          {/* ── Uraian Card — Glass Premium ── */}
          <div className="bg-gradient-to-br from-primary-fixed/60 to-white backdrop-blur-sm rounded-2xl p-lg border border-primary-fixed/60 shadow-lg">
            <div className="flex items-start gap-md">
              <div className="w-12 h-12 rounded-xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-primary/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Uraian Kegiatan</p>
                <p className="font-headline-xs text-headline-xs font-bold text-gray-900 leading-relaxed">
                  {transaction.uraian || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* ── Financial Details ── */}
          <div>
            <h4 className="font-label-md text-label-md font-bold text-gray-800 mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
              Detail Keuangan
            </h4>
            <div className="grid grid-cols-2 gap-md">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-lg border border-white shadow-sm">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Debet (Penerimaan)</p>
                <p className={`font-headline-xs text-headline-xs font-bold ${transaction.debet > 0 ? 'text-green-700' : 'text-gray-300'}`}>
                  {transaction.debet > 0 ? `Rp ${fmt(transaction.debet)}` : '-'}
                </p>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-lg border border-white shadow-sm">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Kredit (Pengeluaran)</p>
                <p className={`font-headline-xs text-headline-xs font-bold ${transaction.kredit > 0 ? 'text-red-700' : 'text-gray-300'}`}>
                  {transaction.kredit > 0 ? `Rp ${fmt(transaction.kredit)}` : '-'}
                </p>
              </div>
              <div className="col-span-2 bg-gradient-to-br from-primary-fixed/40 to-white backdrop-blur-sm rounded-2xl p-lg border border-primary-fixed shadow-sm">
                <p className="text-primary/60 text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Saldo Setelah Transaksi</p>
                <p className="font-headline-sm text-headline-sm font-bold text-primary">
                  Rp {fmt(transaction.saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* ── Reference Info — Glass Premium ── */}
          <div>
            <h4 className="font-label-md text-label-md font-bold text-gray-800 mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
              Informasi Referensi
            </h4>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-lg border border-white shadow-sm space-y-md">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">No. Bukti</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{transaction.noBukti || '-'}</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Kode Kegiatan</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{transaction.kodeKegiatan || '-'}</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Kode Rekening</span>
                <span className="font-mono text-sm font-semibold text-gray-800">{transaction.kodeRekening || '-'}</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Tanggal</span>
                <span className="font-medium text-gray-800">{transaction.tanggalStr}</span>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Tipe Transaksi</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${badge.bg}`}>
                  {badge.label}
                </span>
              </div>
            </div>
          </div>

          {/* ── Category ── */}
          {kategoriInfo && (
            <div>
              <h4 className="font-label-md text-label-md font-bold text-gray-800 mb-md flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>category</span>
                Kategori Belanja
              </h4>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-lg border border-white shadow-sm">
                <div className="flex items-center gap-md">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-${transaction.kategori.color.replace('text-', '')}/10 to-${transaction.kategori.color.replace('text-', '')}/5 shadow-sm`}>
                    <span className={`material-symbols-outlined ${kategoriInfo.color}`}>{kategoriInfo.icon}</span>
                  </div>
                  <div>
                    <p className="font-label-md font-semibold text-gray-800">{kategoriInfo.label}</p>
                    <p className="text-gray-400 text-xs">Kode: {transaction.kodeRekening}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Actions Premium ── */}
          <div className="border-t border-gray-100 pt-lg">
            <h4 className="font-label-md text-label-md font-bold text-gray-800 mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>quick_actions</span>
              Aksi
            </h4>
            <div className="grid grid-cols-2 gap-md">
              <button
                onClick={() => { showToast?.('Info: Detail transaksi disalin ke clipboard (simulasi)'); }}
                className="flex items-center justify-center gap-2 p-lg bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>content_copy</span>
                <span className="font-label-md font-semibold text-gray-700">Salin Detail</span>
              </button>
              {transaction.tipe === 'PEMBAYARAN' && (
                <button
                  onClick={() => {
                    if (onOpenMamin) {
                      onOpenMamin(transaction)
                    } else {
                      showToast?.('Navigasi ke dokumen terkait (simulasi)')
                    }
                  }}
                  className="flex items-center justify-center gap-2 p-lg bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>open_in_new</span>
                  <span className="font-label-md font-semibold text-gray-700">Buka Dokumen</span>
                </button>
              )}
            </div>
          </div>

          <div className="h-16" />
        </div>
      </div>
    </>
  )
}
