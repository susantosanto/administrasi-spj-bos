/**
 * HeaderDokumen — Judul + Nomor Surat
 * RESEARCH §2.3
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function HeaderDokumen({ blockConfig, data = {}, onChange, mode }) {
  const showNomor = blockConfig.nomor !== false

  return (
    <div className="mb-4">
      {/* Judul */}
      <div className="text-center mb-2">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {blockConfig.judul || <PlaceholderText label="Judul Dokumen" />}
        </h2>
      </div>

      {/* Nomor Surat */}
      {showNomor && (
        <div className="text-center text-xs">
          <span className="text-gray-600">Nomor: </span>
          {mode === 'edit' ? (
            <input
              type="text"
              className="border-b border-dashed border-blue-300 outline-none text-center w-64 bg-transparent"
              value={data.nomorSurat || ''}
              onChange={(e) => onChange('nomorSurat', e.target.value)}
              placeholder="___/___/___/___/2026"
            />
          ) : (
            <span className="font-medium">
              {data.nomorSurat || <PlaceholderText label="nomor surat" />}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
