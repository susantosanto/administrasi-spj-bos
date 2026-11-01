/**
 * KonfirmHapusModal — modal konfirmasi hapus baris invoice ala aplikasi
 * (pengganti dialog bawaan browser). Dipakai tabel sidebar + halaman.
 *
 * Props: target {judul, pesan} | null, onBatal, onYa.
 * Tutup via tombol Batal, klik backdrop, atau Escape.
 */
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function KonfirmHapusModal({ target, onBatal, onYa }) {
  useEffect(() => {
    const tutup = (e) => {
      if (e.key === 'Escape' && onBatal) onBatal()
    }
    window.addEventListener('keydown', tutup)
    return () => window.removeEventListener('keydown', tutup)
  }, [onBatal])

  if (!target) return null

  // Sprint 023-rev7: portal ke document.body — panel sidebar/baris tabel punya
  // animasi transform sehingga `fixed` di dalamnya mengacu ke panel (modal
  // jatuh ke bawah), bukan ke layar. Portal = selalu tengah viewport.
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={target.judul || 'Konfirmasi hapus'}>
      <div className="absolute inset-0 bg-slate-900/50" onClick={onBatal} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 text-slate-500 shrink-0">
            <span className="material-symbols-outlined text-xl">delete</span>
          </span>
          <h3 className="text-sm font-bold text-slate-900 leading-snug">{target.judul || 'Hapus baris invoice?'}</h3>
        </div>
        {target.pesan && (
          <p className="text-xs text-slate-600 leading-relaxed">{target.pesan}</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onBatal}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 active:scale-[0.98] transition-all min-h-[44px]"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onYa}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:brightness-110 active:scale-[0.98] transition-all min-h-[44px]"
          >
            Ya, hapus
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
