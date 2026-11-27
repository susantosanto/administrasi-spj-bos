/**
 * DownloadConfirmModal.jsx — Modal konfirmasi unduh dokumen referensi
 * 
 * Muncul saat user klik card Dokumen Referensi di Dashboard.
 * Menampilkan detail dokumen dan konfirmasi "Ya / Tidak" untuk download.
 */

import { useEffect, useRef } from 'react'
import { downloadDoc } from '../../utils/docHelper'

export default function DownloadConfirmModal({ doc, isOpen, onClose }) {
  const modalRef = useRef(null)
  const confirmBtnRef = useRef(null)

  // ── Focus trap + keyboard ──
  useEffect(() => {
    if (!isOpen) return

    // Focus ke tombol konfirmasi saat modal terbuka
    setTimeout(() => confirmBtnRef.current?.focus(), 100)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
      // Trap focus di dalam modal
      if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ── Prevent scroll saat modal terbuka ──
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen || !doc) return null

  const handleConfirm = () => {
    downloadDoc(doc.file, doc.judul)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-download-title"
        className="relative w-full max-w-sm animate-scale-in"
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Top Accent */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-primary" />

          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`w-16 h-16 rounded-2xl ${doc.iconBg || 'bg-primary/10'} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-3xl ${doc.iconColor || 'text-primary'}`}>
                  {doc.icon || 'download'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h2
              id="confirm-download-title"
              className="text-lg font-bold text-slate-900 dark:text-white text-center mb-1"
            >
              {doc.judul}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-2">{doc.sub || 'Dokumen referensi'}</p>

            {/* File info */}
            <div className="bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <span className="material-symbols-outlined text-slate-400 text-base">picture_as_pdf</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{doc.file || 'Belum tersedia'}</p>
                <p className="text-[11px] text-slate-400">Dokumen PDF</p>
              </div>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg tracking-wide">
                PDF
              </span>
            </div>

            {/* Confirmation text */}
            <p className="text-sm text-slate-600 dark:text-slate-300 text-center mb-6">
              Unduh dokumen <span className="font-semibold text-slate-800 dark:text-slate-100">{doc.judul}</span>?
              <br />
              File akan terbuka di tab browser / PDF reader Anda.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-transparent text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 dark:bg-white/5 hover:border-slate-300 active:bg-slate-100 transition-all"
              >
                Batal
              </button>
              <button
                ref={confirmBtnRef}
                onClick={handleConfirm}
                disabled={!doc.file}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
                  ${doc.file
                    ? 'bg-primary text-white active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-white/10 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <span className="material-symbols-outlined text-base">download</span>
                {doc.file ? 'Ya, Unduh' : 'Tidak Tersedia'}
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
