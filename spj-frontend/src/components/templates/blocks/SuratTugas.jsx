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
 *
 * Revisi audit gugus task 41 (G7, P1): label signature ditegaskan —
 * kiri 'Ketua Gugus,' (pengesah gugus) + kanan 'Kepala Sekolah,' (pemberi
 * tugas). Judul memakai kelas spt-judul (underline khusus print, index.css).
 */
import { PlaceholderText } from '../../../utils/templateHelpers'
import { getSchoolData } from '../../../utils/sekolahData'

export default function SuratTugas({ blockConfig, data = {} }) {
  const sekolah = getSchoolData().namaSekolah || ''
  const judul = blockConfig.judul || 'SURAT PERINTAH TUGAS'
  const showNomor = blockConfig.nomor !== false

  const F = (label, key, indent = false, miring = false) => {
    const value = data[key] || ''
    const isi = <span>{value || <PlaceholderText label={label.toLowerCase()} />}</span>
    return (
      <tr>
        <td className={`w-40 py-1.5 font-medium text-gray-700 ${indent ? 'pl-8' : ''}`}>{label}</td>
        <td className="w-3 py-1.5 text-center">:</td>
        <td className="py-1.5">
          {miring ? <em>{isi}</em> : isi}
        </td>
      </tr>
    )
  }

  return (
    <div className="mb-4">
      {/* Judul + Nomor */}
      <div className="text-center mb-1">
        <h2 className="spt-judul text-sm font-bold uppercase tracking-wide">{judul}</h2>
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
      <table className="surat-polos w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Nama', 'namaPenandatangan')}
          {F('Jabatan', 'jabatanPenandatangan')}
        </tbody>
      </table>

      {/* MENUGASKAN */}
      <div className="text-center text-xs font-bold tracking-widest mb-3">M E N U G A S K A N</div>

      <p className="text-xs font-medium text-gray-700 mb-2">Kepada :</p>
      <table className="surat-polos w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Nama', 'nama')}
          {F('NIP', 'sptNip', true)}
          {F('Pangkat/Gol.', 'sptPangkat', true)}
          {F('Jabatan', 'sptJabatan', true)}
        </tbody>
      </table>

      {/* Untuk + detail */}
      <table className="surat-polos w-full text-xs mb-3 border-collapse">
        <tbody>
          {F('Untuk', 'sptUntuk', false, true)}
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
          <div className="text-xs font-medium mb-1">Ketua Gugus,</div>
          <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
          <div className="text-xs font-bold">{data.namaMengetahui}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipMengetahui}</div>
        </div>
        <div className="text-center w-56">
          <div className="text-xs text-gray-600 mb-1">{data.tanggalSpt || ''}</div>
          {/* TTD 4 baris: Kepala Sekolah / nama SD / [SPASI 64px] / nama orang / NIP */}
          <div className="text-xs font-medium">Kepala Sekolah,</div>
          <div className="text-xs font-medium mb-1">{sekolah ? `${sekolah},` : ''}</div>
          <div className="h-16" style={{ height: '64px', minHeight: '64px' }} />
          <div className="text-xs font-bold">{data.namaPenandatangan}</div>
          <div className="text-[10px] text-gray-500">NIP. {data.nipPenandatangan}</div>
        </div>
      </div>
    </div>
  )
}
