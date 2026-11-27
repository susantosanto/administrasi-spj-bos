/**
 * ErrorBoundary — jaring pengaman render (mis. detail transaksi).
 * Bila render anak crash, tampilkan kartu aman, bukan panel blank putih.
 * Tidak mengubah perilaku normal apa pun.
 */
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary menangkap render crash:', error, info?.componentStack)
    }
  }

  render() {
    const { error } = this.state
    const { fallbackJudul, fallbackPesan, onTutup, children } = this.props
    if (!error) return children
    return (
      <div className="p-5">
        <div className="rounded-2xl border border-slate-200 dark:border-transparent bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {fallbackJudul || 'Panel tidak dapat ditampilkan'}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {fallbackPesan || 'Terjadi galat saat merender panel ini. Data Anda aman — tidak ada yang terhapus.'}
          </p>
          <div className="mt-4 flex gap-2">
            {onTutup && (
              <button
                type="button"
                onClick={onTutup}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Tutup panel
              </button>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl border border-slate-200 dark:border-transparent px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Muat ulang
            </button>
          </div>
        </div>
      </div>
    )
  }
}
