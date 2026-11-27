/**
 * SpandukPreview — DESAIN GRAFIS spanduk (Sprint 030, US-11/AC-25).
 *
 * Form persis 4 field: Nama Kegiatan, Nama Gugus, Tanggal, Tempat.
 * Output = desain/pratinjau grafis saja — BUKAN foto sintetis kegiatan
 * atau bukti spanduk terpasang (larangan D-17 Sprint 022 tetap berlaku;
 * bukti pemasangan hanya dari foto asli yang diunggah operator).
 * Warna blue-only (#004ac6 + slate) sesuai CONSTITUTION.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const FIELDS = [
  { key: 'namaKegiatan', label: 'Nama Kegiatan', placeholder: 'Nama kegiatan' },
  { key: 'namaGugus', label: 'Nama Gugus', placeholder: 'Nama gugus' },
  { key: 'tanggal', label: 'Tanggal', placeholder: 'Tanggal kegiatan' },
  { key: 'tempat', label: 'Tempat', placeholder: 'Tempat kegiatan' },
]

export default function SpandukPreview({ blockConfig, data = {}, onChange, mode }) {
  if (mode === 'edit') {
    return (
      <table className="surat-polos w-full text-xs mb-4">
        <tbody>
          {FIELDS.map((f) => (
            <tr key={f.key} className="border-b border-dashed border-outline-variant">
              <td className="w-44 py-1.5 font-medium text-gray-700">{f.label}</td>
              <td className="w-4 py-1.5 text-center">:</td>
              <td className="py-1.5">
                <input
                  type="text"
                  className="w-full border border-outline-variant rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary outline-none"
                  value={data[f.key] || ''}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const isi = (key, label) => {
    const v = data[key]
    return v !== '' && v != null ? v : <PlaceholderText label={label.toLowerCase()} />
  }

  return (
    <div className="mb-4">
      {/* Pratinjau desain spanduk (blue-only) */}
      <div
        className="w-full rounded-xl overflow-hidden border border-slate-300"
        style={{ background: 'linear-gradient(135deg, #004ac6 0%, #003a9e 60%, #00297a 100%)' }}
      >
        <div className="px-8 py-10 text-center text-white">
          <div className="text-[11pt] tracking-[0.3em] uppercase opacity-90 mb-4">
            {isi('namaGugus', 'Nama Gugus')}
          </div>
          <div className="text-[24pt] font-extrabold leading-tight uppercase mb-6 drop-shadow-lg">
            {isi('namaKegiatan', 'Nama Kegiatan')}
          </div>
          <div className="inline-flex items-center gap-4 bg-white/15 rounded-full px-6 py-2 text-[11pt] font-medium">
            <span>{isi('tanggal', 'Tanggal')}</span>
            <span className="opacity-60">•</span>
            <span>{isi('tempat', 'Tempat')}</span>
          </div>
        </div>
        <div className="bg-white/10 px-8 py-2 text-center text-[9pt] tracking-[0.25em] uppercase opacity-70">
          Menyelenggarakan
        </div>
      </div>
      {/* Identitas output: desain grafis — bukan bukti kegiatan/foto (AC-25) */}
      <div className="mt-3 text-center">
        <p className="text-[10pt] font-semibold text-gray-700">
          Pratinjau desain grafis spanduk — bukan bukti pemasangan atau foto kegiatan.
        </p>
        <p className="text-[9pt] text-gray-500 mt-1">
          Bukti pemasangan hanya sah dari foto asli kegiatan yang diunggah operator.
        </p>
      </div>
    </div>
  )
}
