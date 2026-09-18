/**
 * KopGugus — Kop Surat Gugus (Pemerintah Bandung Barat / Gugus Ki Hajar Dewantara)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx (page 1)
 *
 * Sprint 001 FASE 3 (US-18, task 3.4/3.5/3.6):
 * - PROP-DRIVEN: nilai wajib dari prop `data` (diisi pemanggil dari Data Sekolah).
 *   Blok TIDAK membaca storageHelper/localStorage sendiri (keputusan F-4).
 * - gugusNama (baris 12) + gugusAlamat (baris 15): tanpa fallback literal.
 * - baris kabupaten (baris 9): dari kabupaten/provinsi lewat prop `data`.
 * - logo gugus dari prop `data.logoGugus` (pemanggil yang membaca spj_logo_gugus).
 */
export default function KopGugus({ data = {} }) {
  // Baris 9 (task 3.6): kabupaten/provinsi lewat prop data, bukan literal.
  const barisPemerintah = data.kabupaten
    ? `PEMERINTAH ${data.kabupaten}`.toUpperCase()
    : ''

  return (
    <div className="text-center border-b-2 border-black pb-2 mb-4">
      <div className="relative">
        {data.logoGugus && (
          <img
            src={data.logoGugus}
            alt="Logo Gugus"
            className="absolute left-0 top-0 w-14 h-14 object-contain"
          />
        )}
        <div className="text-[10px] font-bold uppercase tracking-wider">
          {barisPemerintah}
        </div>
        <div className="text-sm font-bold mt-1">
          {data.gugusNama || ''}
        </div>
        <div className="text-[8px] text-gray-600">
          {data.gugusAlamat || ''}
        </div>
      </div>
    </div>
  )
}