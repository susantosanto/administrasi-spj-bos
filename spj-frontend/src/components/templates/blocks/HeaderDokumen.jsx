/**
 * HeaderDokumen — Judul + Nomor Surat + Bulan/Tahun
 * RESEARCH §2.3
 *
 * Format Excel:
 *   DAFTAR PENERIMA HONORARIUM/GAJI GURU TIDAK TETAP
 *   BULAN JANUARI 2026
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function HeaderDokumen({ blockConfig, data = {}, onChange, mode }) {
  const showNomor = blockConfig.nomor !== false
  const showBulan = blockConfig.showBulan !== false

  // Format bulan/tahun dari data
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const bulan = data.bulan || ''
  const tahun = data.tahun || ''

  return (
    <div className="mb-4">
      {/* Judul */}
      <div className="text-center mb-1">
        <h2 className="text-sm font-bold uppercase tracking-wide">
          {blockConfig.judul || <PlaceholderText label="Judul Dokumen" />}
        </h2>
      </div>

      {/* Bulan/Tahun (khusus Honor, Transport, Upah, Pulsa) */}
      {showBulan && (
        <div className="text-center text-xs mb-2">
          {mode === 'edit' ? (
            <>
              <span className="text-gray-500">BULAN </span>
              <select
                className="border-b border-dashed border-primary/30 outline-none text-xs bg-transparent"
                value={bulan}
                onChange={(e) => onChange('bulan', e.target.value)}
              >
                <option value="">Pilih Bulan</option>
                {bulanList.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <span className="text-gray-500"> </span>
              <input
                type="text"
                className="border-b border-dashed border-primary/30 outline-none text-xs w-16 text-center bg-transparent"
                value={tahun}
                onChange={(e) => onChange('tahun', e.target.value)}
                placeholder="2026"
              />
            </>
          ) : (
            <span className="text-gray-700 font-medium">
              {bulan || tahun ? `BULAN ${bulan.toUpperCase()} ${tahun}` : ''}
            </span>
          )}
        </div>
      )}

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
