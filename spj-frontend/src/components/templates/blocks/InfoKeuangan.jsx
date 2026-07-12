/**
 * InfoKeuangan — Informasi Sekolah + Program, Kegiatan, Kode Rekening
 * Dengan integrasi popup nomor surat
 */
import { useState } from 'react'
import { getSchoolData } from '../../../utils/sekolahData'
import NomorSuratPopup from './NomorSuratPopup'

// Field definitions
const FIELDS = {
  namaSekolah: { label: 'Nama Sekolah', placeholder: 'SD NEGERI LEBAKLEUNGSIR', source: 'sekolah' },
  kecamatan: { label: 'Kecamatan', placeholder: 'Cikalongwetan', source: 'sekolah' },
  kabupaten: { label: 'Kabupaten', placeholder: 'Bandung Barat', source: 'sekolah' },
  program: { label: 'Program', placeholder: '07 Pengembangan Standar Pembiayaan' },
  kegiatan: { label: 'Kegiatan', placeholder: 'Pembayaran Honor/Gaji' },
  kodeRekening: { label: 'Kode Rekening', placeholder: '5.1.02.02.01.0013' },
  kodePenggunaan: { label: 'Kode Penggunaan', placeholder: '12' },
}

// Default field order
const DEFAULT_LEFT = ['nomor', 'namaSekolah', 'kecamatan', 'kabupaten']
const DEFAULT_RIGHT = ['program', 'kegiatan', 'kodeRekening', 'kodePenggunaan']

// Nomor Field Component with Popup
function NomorField({ value, onChange, mode }) {
  const [showPopup, setShowPopup] = useState(false)

  const handleSelect = (nomor) => {
    onChange('nomor', nomor)
  }

  if (mode === 'edit') {
    return (
      <>
        <td className="py-1.5 font-medium text-gray-700 text-[11px] whitespace-nowrap" style={{ width: '100px' }}>
          Nomor
        </td>
        <td className="py-1.5 text-center text-gray-500 text-[11px]" style={{ width: '15px' }}>:</td>
        <td className="py-1.5 text-[11px]" style={{ width: '200px' }}>
          <div className="flex items-center gap-1">
            <input
              type="text"
              className="flex-1 border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-[11px]"
              value={value || ''}
              onChange={(e) => onChange('nomor', e.target.value)}
              placeholder="____________________________"
            />
            <button
              type="button"
              onClick={() => setShowPopup(true)}
              className="p-1 rounded-lg hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-colors"
              title="Generate nomor surat"
            >
              <span className="material-symbols-outlined text-sm">pin</span>
            </button>
          </div>
        </td>

        {showPopup && (
          <NomorSuratPopup
            onSelect={handleSelect}
            onClose={() => setShowPopup(false)}
            currentNomor={value}
          />
        )}
      </>
    )
  }

  // Print mode
  return (
    <>
      <td className="py-1.5 font-medium text-gray-700 text-[11px] whitespace-nowrap" style={{ width: '100px' }}>
        Nomor
      </td>
      <td className="py-1.5 text-center text-gray-500 text-[11px]" style={{ width: '15px' }}>:</td>
      <td className="py-1.5 text-[11px]" style={{ width: '200px' }}>
        {value || '___'}
      </td>
    </>
  )
}

// Regular Field Component
function FieldCell({ fieldKey, data, onChange, mode }) {
  const field = FIELDS[fieldKey]
  if (!field) return <td className="py-1.5" />

  const schoolData = getSchoolData()
  let value = data[fieldKey] || ''
  if (!value && field.source === 'sekolah') {
    value = schoolData[fieldKey] || ''
  }

  return (
    <>
      <td className="py-1.5 font-medium text-gray-700 text-[11px] whitespace-nowrap" style={{ width: '100px' }}>
        {field.label}
      </td>
      <td className="py-1.5 text-center text-gray-500 text-[11px]" style={{ width: '15px' }}>:</td>
      <td className="py-1.5 text-[11px]" style={{ width: '200px' }}>
        {mode === 'edit' && field.source !== 'sekolah' ? (
          <input
            type="text"
            className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-[11px]"
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder={field.placeholder}
          />
        ) : (
          <span className={field.source === 'sekolah' ? 'text-gray-600' : ''}>
            {value || '___'}
          </span>
        )}
      </td>
    </>
  )
}

export default function InfoKeuangan({ blockConfig, data = {}, onChange, mode }) {
  const leftFields = blockConfig?.leftFields || DEFAULT_LEFT
  const rightFields = blockConfig?.rightFields || DEFAULT_RIGHT
  const rows = Math.max(leftFields.length, rightFields.length)

  return (
    <div className="mb-4">
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              {/* Left side */}
              <td className="align-top pr-4" style={{ width: '50%' }}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      {leftFields[i] === 'nomor' ? (
                        <NomorField 
                          value={data.nomor || ''} 
                          onChange={onChange} 
                          mode={mode} 
                        />
                      ) : leftFields[i] ? (
                        <FieldCell fieldKey={leftFields[i]} data={data} onChange={onChange} mode={mode} />
                      ) : (
                        <td className="py-1.5" />
                      )}
                    </tr>
                  </tbody>
                </table>
              </td>
              {/* Right side */}
              <td className="align-top pl-4" style={{ width: '50%' }}>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      {rightFields[i] ? (
                        <FieldCell fieldKey={rightFields[i]} data={data} onChange={onChange} mode={mode} />
                      ) : (
                        <td className="py-1.5" />
                      )}
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
