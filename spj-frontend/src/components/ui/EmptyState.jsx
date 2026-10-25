/**
 * EmptyState — ilustrasi kosong dengan judul, deskripsi, dan CTA opsional.
 * Dipakai saat list/tabel kosong agar user tahu langkah berikutnya.
 */
export default function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction }) {
  return (
    <div className="p-xl text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-3xl text-slate-400" aria-hidden="true">{icon}</span>
      </div>
      <p className="text-sm font-semibold text-text-high mb-1">{title}</p>
      {description && <p className="text-sm text-text-low mb-4 max-w-sm">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">upload</span>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
