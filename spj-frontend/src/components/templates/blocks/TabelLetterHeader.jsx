/**
 * TabelLetterHeader — Layout 5 kolom standar surat dinas Indonesia
 *
 * Struktur DOCX:
 * | Kolom 0-2 (kiri)        | Kolom 3-4 (kanan)           |
 * | Nomor    : 007/...      | Kepada Yth,                 |
 * | Sifat    : Biasa        | Bapak/Ibu Guru              |
 * | Lampiran : -            | <Nama Sekolah>              |
 * | Perihal  : Undangan... | Di                          |
 * |                          | Tempat                      |
 *
 * Props:
 * - blockConfig.leftFields  — array of { key, label, type }
 * - blockConfig.rightFields — array of { key, label, type }  (opsional)
 * - blockConfig.dateField   — string key untuk tanggal di pojok kanan atas (opsional)
 * - blockConfig.rightAlignBottom — bila true, blok kanan DIMULAI sejajar baris
 *   kiri TERAKHIR (Perihal) lalu berlanjut ke bawah (DOCX Surat Undangan/
 *   Surat Pesanan Mamin: "Kepada Yth," sejajar "Perihal", alamat/di/tempat
 *   di baris-baris berikutnya dengan kolom kiri kosong). Default false
 *   (pasangan baris-per-baris dari atas).
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

export default function TabelLetterHeader({ blockConfig, data = {}, onChange, mode }) {
  const leftFields = blockConfig.leftFields || []
  const rightFields = blockConfig.rightFields || []
  const dateField = blockConfig.dateField // e.g. 'tanggalSurat'
  // DOCX undangan/pesanan: blok kanan mulai sejajar baris kiri terakhir
  // (Perihal) lalu turun ke bawah; baris kiri di atasnya kosong di kanan.
  const rightStartRow = blockConfig.rightAlignBottom
    ? Math.max(0, leftFields.length - 1)
    : 0
  const maxRows = blockConfig.rightAlignBottom
    ? rightStartRow + rightFields.length
    : Math.max(leftFields.length, rightFields.length)

  const formatDate = (val) => {
    if (!val) return ''
    try {
      const d = new Date(val)
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    } catch {
      return val
    }
  }

  return (
    <table className="w-full text-xs mb-4 border-collapse table-fixed">
      <colgroup>
        <col style={{ width: '18%' }} />
        <col style={{ width: '4%' }} />
        <col style={{ width: '33%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '30%' }} />
      </colgroup>
      <tbody>
        {/* Baris tanggal (pojok kanan atas) */}
        {dateField && (
          <tr>
            <td colSpan={3} className="py-1" />
            <td colSpan={2} className="py-1 text-right">
              {mode === 'edit' ? (
                <input
                  type="text"
                  className="border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs text-right"
                  value={data[dateField] || ''}
                  onChange={(e) => onChange(dateField, e.target.value)}
                  placeholder="Cikalongwetan, ..."
                />
              ) : (
                <span>{data[dateField] || <PlaceholderText label="Tanggal" />}</span>
              )}
            </td>
          </tr>
        )}

        {/* Baris field (kiri + kanan) */}
        {Array.from({ length: maxRows }).map((_, i) => {
          const left = leftFields[i]
          const rightIdx = i - rightStartRow
          const right = rightIdx >= 0 ? rightFields[rightIdx] : undefined

          return (
            <tr key={i} className="border-b border-dashed border-outline-variant align-top">
              {/* Left side: Label : Value */}
              <td className="py-1.5 font-medium text-gray-700 break-words">
                {left?.label || ''}
              </td>
              <td className="py-1.5 text-center">{left ? ':' : ''}</td>
              <td className="py-1.5 pr-4 break-words whitespace-normal overflow-hidden">
                {left ? (
                  mode === 'edit' ? (
                    <EditableField
                      field={left}
                      value={data[left.key]}
                      onChange={(v) => onChange(left.key, v)}
                    />
                  ) : (
                    <span>{data[left.key] || <PlaceholderText label={left.label} />}</span>
                  )
                ) : null}
              </td>

              {/* Right side: Label + Value (kolom 3-4) */}
              <td className="py-1.5 pl-4 font-medium text-gray-700 break-words whitespace-normal">
                {right?.label || ''}
              </td>
              <td className="py-1.5 break-words whitespace-normal overflow-hidden">
                {right ? (
                  mode === 'edit' ? (
                    <EditableField
                      field={right}
                      value={data[right.key]}
                      onChange={(v) => onChange(right.key, v)}
                    />
                  ) : (
                    <span>{data[right.key] || <PlaceholderText label={right.label} />}</span>
                  )
                ) : null}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
