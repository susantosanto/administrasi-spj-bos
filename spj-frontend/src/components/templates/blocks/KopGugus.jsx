/**
 * KopGugus — Kop Surat Gugus (Pemerintah Bandung Barat / Gugus Ki Hajar Dewantara)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx (page 1)
 */
export default function KopGugus({ data = {} }) {
  return (
    <div className="text-center border-b-2 border-black pb-2 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-wider">
        PEMERINTAH KABUPATEN BANDUNG BARAT
      </div>
      <div className="text-sm font-bold mt-1">
        {data.gugusNama || 'GUGUS KI HAJAR DEWANTARA'}
      </div>
      <div className="text-[8px] text-gray-600">
        {data.gugusAlamat || 'Sekretariat : Kp. Lembang Dano Desa Cipada Kecamatan Cikalongwetan Kode Pos 40556 Kabupaten Bandung Barat'}
      </div>
    </div>
  )
}