/**
 * UploadDropzone — area upload kanonis aplikasi (visual Data Sekolah).
 * Seluruh area bisa diklik untuk membuka file picker (tanpa tombol ganda).
 * Varian `compact` untuk panel sempit (sidebar/blok). Area cetak tidak memakai ini.
 */
import { Button } from './button'
import { cn } from '../../lib/utils'

export default function UploadDropzone({
  id,
  icon = 'cloud_upload',
  title,
  description,
  formatHint,
  accept,
  multiple = false,
  loading = false,
  loadingText = 'Memproses...',
  actionText = 'Pilih File',
  disabled = false,
  compact = false,
  onFiles,
  className,
}) {
  const sibuk = loading || disabled
  const bukaPicker = () => {
    if (sibuk) return
    document.getElementById(id)?.click()
  }
  return (
    <div
      onClick={bukaPicker}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); bukaPicker() } }}
      role="button"
      tabIndex={sibuk ? -1 : 0}
      aria-label={title || 'Upload file'}
      className={cn(
        'rounded-2xl border-2 border-dashed text-center transition-all duration-300 cursor-pointer h-full flex flex-col items-center justify-center hover:border-primary/40',
        sibuk && 'opacity-70 pointer-events-none',
        compact ? 'p-5' : 'p-10',
        className,
      )}
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'color-mix(in srgb, var(--color-primary-light) 45%, transparent)' }}
    >
      <div
        className={cn(
          'rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto shadow-inner',
          compact ? 'w-14 h-14 rounded-2xl mb-3' : 'w-20 h-20 mb-5',
        )}
      >
        <span className={cn('material-symbols-outlined text-primary', compact ? 'text-3xl' : 'text-4xl')}>{icon}</span>
      </div>
      {title && (
        <h3 className={cn('font-bold text-on-surface mb-2', compact ? 'text-sm' : 'text-lg')}>{title}</h3>
      )}
      {description && (
        <p className={cn('text-on-surface-variant mx-auto', compact ? 'text-xs mb-4 max-w-xs' : 'text-sm mb-6 max-w-sm')}>{description}</p>
      )}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={sibuk}
        onChange={(e) => { onFiles?.(e.target.files); e.target.value = '' }}
        className="hidden"
        id={id}
      />
      <span className="pointer-events-none">
        <Button type="button" size={compact ? 'sm' : 'default'} disabled={sibuk} className="pointer-events-none" tabIndex={-1}>
          <span className="material-symbols-outlined text-lg">{loading ? 'sync' : 'upload'}</span>
          {loading ? loadingText : actionText}
        </Button>
      </span>
      {formatHint && <p className="text-on-surface-variant mt-4 text-xs opacity-70">{formatHint}</p>}
    </div>
  )
}
