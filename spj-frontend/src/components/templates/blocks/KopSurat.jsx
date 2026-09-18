/**
 * KopSurat — Header Pemerintah + Sekolah
 * RESEARCH §2.3
 *
 * Sprint 001 FASE 3 (US-17/US-18):
 * - identitas + kabupaten/provinsi dibaca saat render via getSchoolData()
 * - logo sekolah (kiri atas) + logo dinas (kanan atas) dari spj_logo_*
 * - data kosong → baris kosong (jujur-kosong, bukan fallback)
 */
import storageHelper from '../../../utils/storageHelper'
import { getSchoolData } from '../../../utils/sekolahData'

export default function KopSurat({ data = {} }) {
  // Dibaca saat render (bukan konstanta level-modul) supaya nilai tidak basi.
  const sekolah = { ...getSchoolData(), ...data }
  // Logo dibaca saat render — langsung ganti setelah upload tanpa reload.
  const logoSekolah = storageHelper.get('logo_sekolah', null)
  const logoDinas = storageHelper.get('logo_dinas', null)

  // Baris 13 (task 3.3): kabupaten/provinsi dari Data Sekolah, bukan literal.
  const barisPemerintah = sekolah.kabupaten
    ? `PEMERINTAH ${sekolah.kabupaten}`.toUpperCase()
    : ''
  const barisDinas = sekolah.provinsi
    ? `DINAS PENDIDIKAN ${sekolah.provinsi}`.toUpperCase()
    : 'DINAS PENDIDIKAN'

  return (
    <div className="text-center border-b-2 border-black pb-2 mb-4">
      <div className="relative">
        {logoSekolah && (
          <img
            src={logoSekolah}
            alt="Logo Sekolah"
            className="absolute left-0 top-0 w-14 h-14 object-contain"
          />
        )}
        {logoDinas && (
          <img
            src={logoDinas}
            alt="Logo Dinas"
            className="absolute right-0 top-0 w-14 h-14 object-contain"
          />
        )}
        <div className="text-[10px] font-bold uppercase tracking-wider">
          {barisPemerintah}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider">
          {barisDinas}
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
    </div>
  )
}
