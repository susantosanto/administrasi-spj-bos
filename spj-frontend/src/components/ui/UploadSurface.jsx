/**
 * UploadSurface — permukaan upload progresif (konsep "Invisible until it matters").
 *
 * Satu komponen, tiga perilaku, tanpa toggle:
 *  - Kosong  → dropzone penuh (hero undangan upload pertama).
 *  - Terisi  → menyusut jadi "Source Strip" tipis di atas konten:
 *              klik kapan saja untuk mengganti data terbaru (tidak menghilang).
 *  - Proses  → strip menampilkan progress inline, tanpa layout shift & tanpa modal.
 *
 * Dark-first: seluruh permukaan memakai token CSS (--color-surface, --color-border,
 * --color-text-*). Tidak ada slate/abu-abu hardcoded di sini.
 */
import { useState } from 'react'
import UploadDropzone from './UploadDropzone'
import { cn } from '../../lib/utils'

function formatWaktu(iso) {
  if (!iso) return null
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
      + ' · ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return null
  }
}

export default function UploadSurface({
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
  filled = false,
  filledLabel = 'Data tersimpan',
  fileName,
  uploadedAt,
  count,
  onFiles,
  // Form kustom (mis. dua kartu PDF + Excel di BKU): menggantikan UploadDropzone
  // bawaan di state hero maupun expand. Strip progresif tetap sama.
  form = null,
  children,
}) {
  // Saat kosong, dropzone tampil penuh. Saat terisi, strip tampil dan dropzone
  // bisa dibuka kembali lewat klik strip (expand-in-place, lalu auto-collapse).
  const [buka, setBuka] = useState(false)
  const [namaSumber, setNamaSumber] = useState(fileName || null)
  const [waktuSumber, setWaktuSumber] = useState(uploadedAt || null)

  //Sinkron dari props bila induk mengubahnya (mis. upload baru dari tempat lain).
  if (fileName && fileName !== namaSumber) setNamaSumber(fileName)
  if (uploadedAt && uploadedAt !== waktuSumber) setWaktuSumber(uploadedAt)

  const handleFiles = (files) => {
    const file = Array.from(files || [])[0]
    if (file) {
      setNamaSumber(file.name)
      setWaktuSumber(new Date().toISOString())
    }
    setBuka(false)
    onFiles?.(files)
  }

  const stripTeks = loading
    ? loadingText
    : namaSumber
      ? `Sumber terakhir: ${namaSumber}`
      : filledLabel

  return (
    <div className="upload-surface overflow-hidden rounded-2xl">
      {(!filled || buka) && (
        <div
          className={cn(
            'transition-all duration-300 ease-out animate-smooth-reveal',
            buka && filled ? 'border-b px-4 pt-4 pb-2' : 'p-0',
          )}
          style={buka && filled ? { borderColor: 'var(--color-border)' } : undefined}
        >
          {form || children || (
          <UploadDropzone
            id={id}
            icon={icon}
            title={title}
            description={description}
            formatHint={formatHint}
            accept={accept}
            multiple={multiple}
            loading={loading}
            loadingText={loadingText}
            actionText={actionText}
            compact={filled}
            onFiles={handleFiles}
          />
          )}
        </div>
      )}

      {filled && (
        <button
          type="button"
          onClick={() => setBuka((v) => !v)}
          aria-expanded={buka}
          className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          style={{ backgroundColor: 'var(--color-surface-muted)' }}
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
          >
            <span className="material-symbols-outlined text-[18px]">
              {loading ? 'sync' : buka ? 'expand_less' : 'upload_file'}
            </span>
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold" style={{ color: 'var(--color-text-high)' }}>
              {stripTeks}
            </span>
            <span className="mt-0.5 block text-[11px]" style={{ color: 'var(--color-text-low)' }}>
              {loading
                ? 'Mohon tunggu...'
                : `${formatWaktu(waktuSumber) || 'Data tersimpan'}${count != null ? ` · ${count} entri` : ''} · klik untuk ganti data terbaru`}
            </span>
          </span>

          <span
            className="hidden shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold sm:flex"
            style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <span className="material-symbols-outlined text-[15px]">{buka ? 'close' : 'refresh'}</span>
            {buka ? 'Tutup' : 'Ganti Data'}
          </span>
        </button>
      )}
    </div>
  )
}
