/**
 * KopSurat — Header Pemerintah + Sekolah
 * RESEARCH §2.3
 */
import { SEKOLAH_DEFAULT } from '../../../utils/sekolahData'

export default function KopSurat({ data = {} }) {
  const sekolah = { ...SEKOLAH_DEFAULT, ...data }

  return (
    <div className="text-center border-b-2 border-black pb-2 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-wider">
        PEMERINTAH KABUPATEN BANDUNG BARAT
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider">
        DINAS PENDIDIKAN
      </div>
      <div className="text-sm font-bold mt-1">
        {sekolah.namaSekolah}
      </div>
      <div className="text-[8px] text-gray-600">
        {sekolah.alamat}
      </div>
      <div className="text-[8px] text-gray-600">
        Email: {sekolah.email}
      </div>
    </div>
  )
}
