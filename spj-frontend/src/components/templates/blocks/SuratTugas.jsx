/**
 * SuratTugas — SURAT PERINTAH TUGAS / SURAT TUGAS (pages 4-6 docx)
 * Source: template/Surat Tugas + SPPD_rapat ops_gugus_2026.docx
 *
 * Per penerima (perRecipient). Layout DOCX:
 *   SURAT PERINTAH TUGAS
 *   Nomor : 400.3.7.6/018-SD/2026
 *   Yang bertandatangan di bawah ini : Nama / Jabatan
 *   M E N U G A S K A N
 *   Kepada : Nama / NIP / Pangkat-Gol / Jabatan
 *   Untuk : ...
 *   Hari / tanggal / Tempat
 *   Demikian surat tugas ini dibuat ...
 *   Mengetahui/Mengesahkan
 *   Kepala, [TTD] WAHYUDIN ...  |  Cikalongwetan, ... / Kepala Sekolah, [TTD] BADRUDDIN ...
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SuratTugas({ blockConfig, data = {}, onChange, mode }) {
  const judul = blockConfig.judul || 'SURAT PERINTAH TUGAS'
  const showNomor = blockConfig.nomor !== false

  const F = (label, key, ph, indent = false) => {
    const value = data[key] || ''
    return (
      <tr className="border-b border-dashed border-outline-variant">
        <td className={`w-40 py-1.5 font-medium text-gray-700 ${indent ? 'pl-8' : ''}`}>{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          {mode === 'edit' ? (
            <input
              type="text"
              className="w-full border-b border-dashed border-primary/30 focus:border-primary outline-none px-1 bg-transparent text-xs"
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={ph}
            />
          ) : (
            <span>{value || <PlaceholderText label={label} />}</span>
          )}
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
          {F('Nama', 'namaPenandatangan', 'BADRUDDIN, S.Ag.')}
          {F('Jabatan', 'jabatanPenandatangan', 'Kepala Sekolah')}
        </tbody>
      </table>

      {/* MENUGASKAN */}
      <div className="text-center text-xs font-bold tracking-widest mb-3">M E N U G A S K A N</div>

      <p className="text-xs font-medium text-gray-700 mb-2">Kepada :</p>
      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Nama', 'nama', 'RISNA MARSELA HARTINI')}
          {F('NIP', 'sptNip', '-', true)}
          {F('Pangkat/Gol.', 'sptPangkat', '-', true)}
          {F('Jabatan', 'sptJabatan', 'Operator Sekolah', true)}
        </tbody>
      </table>

      {/* Untuk + detail */}
      <table className="w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Untuk', 'sptUntuk', 'Rapat Kerja Teknis Operator Sekolah Tingkat Gugus...')}
          {F('Hari', 'sptHari', 'Jumat')}
          {F('Tanggal', 'sptTanggal', '8 Mei 2026')}
          {F('Tempat', 'sptTempat', 'SD Negeri Cipada')}
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
          <div className="text-xs font-bold">{data.namaMengetahui || 'WAHYUDIN, S.Pd.SD.'}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipMengetahui || '197912222014121003'}</div>
        </div>
        <div className="text-center w-56">
          <div className="text-xs text-gray-600 mb-1">{data.tanggalSpt || 'Cikalongwetan, ...'}</div>
          <div className="text-xs font-medium mb-1">Kepala Sekolah,</div>
          <div className="h-16" />
          <div className="text-xs font-bold">{data.namaPenandatangan || 'BADRUDDIN, S.Ag.'}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan || '197405082014121002'}</div>
        </div>
      </div>
    </div>
  )
}