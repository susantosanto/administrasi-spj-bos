import { useEffect } from 'react'
import { deteksiJenisPajak } from '../../utils/dokPajak'

/**
 * BKUSidebarPajakMini — panel kecil minimalis untuk baris PUNGUT pajak.
 * Isi: badge + uraian + nominal + tombol ke halaman pembayaran pajak (Coretax).
 * Tanpa tab dokumen (pungut tidak punya dokumen LPJ).
 */
const CORETAX_URL = 'https://coretaxdjp.pajak.go.id/'
const fmt = (n) => (n ?? 0).toLocaleString('id-ID')

export default function BKUSidebarPajakMini({ transaction, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!transaction) return null

  const nominal = transaction.pengeluaran || transaction.kredit
    || transaction.penerimaan || transaction.debet || 0
  const jenis = deteksiJenisPajak(transaction.uraian) || 'Pajak dipungut'

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/30 z-[100] animate-fade-in"
        onClick={onClose}
      />
      <div
        className="fixed z-[110] right-3 sm:right-5 top-1/2 -translate-y-1/2 w-[340px] max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-mini-in outline-none"
        role="dialog"
        aria-label="Pembayaran pajak dipungut"
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold text-slate-900 dark:text-white leading-tight">Pajak Dipungut</h3>
            <p className="text-[11px] text-slate-400 truncate">{transaction.tanggalStr || ''}{transaction.noBukti ? ` · ${transaction.noBukti}` : ''}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Tutup"
            aria-label="Tutup panel pajak"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Isi */}
        <div className="px-4 pb-4 space-y-3">
          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-snug">
            {transaction.uraian || '-'}
          </p>
          <div className="flex items-center justify-between rounded-2xl px-3.5 py-3" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">{jenis}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">Rp {fmt(nominal)}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">PUNGUT</span>
          </div>
          <a
            href={CORETAX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            Bayar via Coretax
          </a>
          <p className="text-[11px] text-slate-400 text-center">Dibayar di Coretax DJP (tab baru) · setor lalu catat NTPN di BKU</p>
        </div>
      </div>
    </>
  )
}
