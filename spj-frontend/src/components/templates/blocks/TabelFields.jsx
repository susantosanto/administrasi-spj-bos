/**
 * TabelFields — Form key-value (SPPD, Notulen, Buku Tamu)
 * RESEARCH §2.3
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

function EditableField({ field, value, onChange }) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          className="w-full border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={field.placeholder}
        />
      )
    case 'date':
      return (
        <input
          type="date"
          className="border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'time':
      return (
        <input
          type="time"
          className="border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    case 'select':
      return (
        <select
          className="border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Pilih...</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    case 'number':
      return (
        <input
          type="number"
          className="border border-outline-variant rounded px-2 py-1 text-xs w-24 text-right focus:ring-1 focus:ring-primary outline-none"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      )
    default:
      return (
        <input
          type="text"
          className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
        />
      )
  }
}

export default function TabelFields({ blockConfig, data = {}, onChange, mode }) {
  const fields = blockConfig.fields || []

  return (
    <table className="w-full text-xs mb-4">
      <tbody>
        {fields.map((field) => (
          <tr key={field.key} className="border-b border-dashed border-outline-variant">
            <td className="w-40 py-1.5 font-medium text-gray-700">{field.label}</td>
            <td className="w-4 py-1.5 text-center">:</td>
            <td className="py-1.5">
              {mode === 'edit' ? (
                <EditableField
                  field={field}
                  value={data[field.key]}
                  onChange={(v) => onChange(field.key, v)}
                />
              ) : (
                <span>
                  {data[field.key] || <PlaceholderText label={field.label} />}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
