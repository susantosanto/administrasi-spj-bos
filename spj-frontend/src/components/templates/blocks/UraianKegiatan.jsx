/**
 * UraianKegiatan — Text area bebas (Buku Tamu)
 * RESEARCH §2.3
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function UraianKegiatan({ blockConfig, data = {}, onChange, mode }) {
  const label = blockConfig.label || 'Uraian Kegiatan'

  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>

      {mode === 'edit' ? (
        <textarea
          className="w-full border border-outline-variant rounded px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
          value={data.uraianKegiatan || ''}
          onChange={(e) => onChange('uraianKegiatan', e.target.value)}
          rows={4}
          placeholder="Tulis uraian kegiatan di sini..."
        />
      ) : (
        <div className="text-xs text-gray-700 whitespace-pre-wrap min-h-[80px] p-2 border-b border-dashed border-gray-300">
          {data.uraianKegiatan || <PlaceholderText label="uraian kegiatan" />}
        </div>
      )}
    </div>
  )
}
