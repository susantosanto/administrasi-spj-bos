/**
 * InfoKeuangan — Program, Kegiatan, Kode Rekening
 * RESEARCH §2.3
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const KEUANGAN_FIELDS = [
  { key: 'program', label: 'Program', placeholder: '07 Pengembangan Standar Pembiayaan' },
  { key: 'kegiatan', label: 'Kegiatan', placeholder: 'Pembayaran Honor/Gaji' },
  { key: 'kodeRekening', label: 'Kode Rekening', placeholder: '5.1.02.02.01.0013' },
]

export default function InfoKeuangan({ blockConfig, data = {}, onChange, mode }) {
  // Filter fields berdasarkan config (jika ada filter spesifik)
  const fields = blockConfig.fields
    ? KEUANGAN_FIELDS.filter((f) => blockConfig.fields.includes(f.key))
    : KEUANGAN_FIELDS

  return (
    <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-[10px] font-semibold text-gray-600 mb-2 uppercase tracking-wide">
        Informasi Keuangan
      </div>
      <table className="w-full text-xs">
        <tbody>
          {fields.map((field) => (
            <tr key={field.key} className="border-b border-dashed border-gray-200 last:border-0">
              <td className="w-32 py-1 font-medium text-gray-700">{field.label}</td>
              <td className="w-3 py-1 text-center">:</td>
              <td className="py-1">
                {mode === 'edit' ? (
                  <input
                    type="text"
                    className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
                    value={data[field.key] || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
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
    </div>
  )
}
