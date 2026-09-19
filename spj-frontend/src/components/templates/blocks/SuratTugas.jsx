/**
 * SuratTugas — SURAT PERINTAH TUGAS (pages 4-6 docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Sprint 002 FASE 3: blok CETAK MURNI — per penerima (perRecipient).
 * Pengeditan data dilakukan di tab form (DokumenFormPreview), bukan di blok.
 * Layout DOCX:
 *   SURAT PERINTAH TUGAS / Nomor
 *   Yang bertandatangan di bawah ini : Nama / Jabatan
 *   M E N U G A S K A N
 *   Kepada : Nama / NIP / Pangkat-Gol / Jabatan
 *   Untuk / Hari / tanggal / Tempat
 *   Demikian surat tugas ini dibuat ...
 *   Mengetahui/Mengesahkan + Cikalongwetan, ... Kepala Sekolah, [TTD]
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SuratTugas({ blockConfig, data = {} }) {
  const judul = blockConfig.judul || 'SURAT PERINTAH TUGAS'
  const showNomor = blockConfig.nomor !== false

  const F = (label, key, indent = false) => {
    const value = data[key] || ''
    return (
      <tr className="border-b border-dashed border-outline-variant">
        <td className={`w-40 py-1.5 font-medium text-gray-700 ${indent ? 'pl-8' : ''}`}>{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          <span>{value || <PlaceholderText label={label.toLowerCase()} />}</span>
        </td>
      </tr>
    )
  }

  return (
    <div className="mb-4">
      {/* Judul + Nomor */}
      <div className="text-center mb-1">
        <h2 className="text-sm font-bold uppercase tracking-wide">{judul}</h2>
      </div>
      {showNomor && (
        <div className="text-center text-xs mb-3">
          <span className="text-gray-600">Nomor : </span>
          <span className="font-medium">
            {data.nomorSpt || <PlaceholderText label="nomor surat" />}
          </span>
        </div>
      )}

      {/* Yang bertandatangan */}
      <p className="text-xs font-medium text-gray-700 mb-2">Yang bertandatangan di bawah ini :</p>
      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Nama', 'namaPenandatangan')}
          {F('Jabatan', 'jabatanPenandatangan')}
        </tbody>
      </table>

      {/* MENUGASKAN */}
      <div className="text-center text-xs font-bold tracking-widest mb-3">M E N U G A S K A N</div>

      <p className="text-xs font-medium text-gray-700 mb-2">Kepada :</p>
      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Nama', 'nama')}
          {F('NIP', 'sptNip', true)}
          {F('Pangkat/Gol.', 'sptPangkat', true)}
          {F('Jabatan', 'sptJabatan', true)}
        </tbody>
      </table>

      {/* Untuk + detail */}
      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Untuk', 'sptUntuk')}
          {F('Hari', 'sptHari')}
          {F('Tanggal', 'sptTanggal')}
          {F('Tempat', 'sptTempat')}
        </tbody>
      </table>

      <p className="text-xs text-gray-700 mb-6">
        Demikian surat tugas ini dibuat agar dilaksanakan dengan sebaik-baiknya dan penuh rasa tanggungjawab.
      </p>

      {/* Mengetahui/Mengesahkan */}
      <div className="text-xs font-medium text-gray-700 mb-4">Mengetahui/Mengesahkan</div>
      <div className="flex justify-between">
        <div className="text-center w-56">
          <div className="text-xs font-medium mb-1">Kepala,</div>
          <div className="h-16" />
          <div className="text-xs font-bold">{data.namaMengetahui}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipMengetahui}</div>
        </div>
        <div className="text-center w-56">
          <div className="text-xs text-gray-600 mb-1">{data.tanggalSpt || ''}</div>
          <div className="text-xs font-medium mb-1">Kepala Sekolah,</div>
          <div className="h-16" />
          <div className="text-xs font-bold">{data.namaPenandatangan}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan}</div>
        </div>
      </div>
    </div>
  )
}
