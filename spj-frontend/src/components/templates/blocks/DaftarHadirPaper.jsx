/**
 * DaftarHadirPaper — DAFTAR HADIR blanko (blok CETAK MURNI).
 * Sprint 024: menu Daftar Hadir (blanko) Dokumen Kelengkapan.
 * Kolom TTD dikosongkan untuk paraf basah. TTD via blok signature terpisah.
 * data = { kegiatan, tanggal, waktu, tempat, rows: [{nama, nip, jabatan}] }.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function DaftarHadirPaper({ blockConfig, data = {} }) {
  const d = data || {}
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)
  const rows = Array.isArray(d.rows) ? d.rows : []

  return (
    <div className="mb-4">
      <div className="text-center font-bold text-[13pt] mb-1">DAFTAR HADIR</div>
      <table className="surat-polos w-full text-[11pt] mb-3">
        <tbody>
          <tr><td className="w-32">Kegiatan</td><td className="w-4">:</td><td>{isi(d.kegiatan, 'Nama kegiatan')}</td></tr>
          <tr><td>Tanggal</td><td>:</td><td>{isi(d.tanggal, 'Tanggal')}</td></tr>
          <tr><td>Waktu</td><td>:</td><td>{isi(d.waktu, 'Waktu')}</td></tr>
          <tr><td>Tempat</td><td>:</td><td>{isi(d.tempat, 'Tempat')}</td></tr>
        </tbody>
      </table>
      <table className="w-full border-collapse border border-gray-400 table-fixed text-[10pt]">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '34%' }} />
          <col style={{ width: '24%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '16%' }} />
        </colgroup>
        <thead>
          <tr className="bg-gray-100">
            {['No', 'Nama', 'NIP', 'Jabatan', 'TTD'].map((h) => (
              <th key={h} className="border border-gray-400 px-2 py-1 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? [1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="border border-gray-400 px-2 py-1.5 text-center">{i}</td>
                <td className="border border-gray-400 px-2 py-1.5" colSpan={3} />
                <td className="border border-gray-400 px-2 py-1.5 text-center">{i}</td>
              </tr>
            ))
            : rows.map((r, i) => (
              <tr key={r.id || i}>
                <td className="border border-gray-400 px-2 py-1.5 text-center">{i + 1}</td>
                <td className="border border-gray-400 px-2 py-1.5">{r.nama || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 font-mono text-[9pt]">{r.nip || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5">{r.jabatan || ''}</td>
                <td className="border border-gray-400 px-2 py-1.5 text-center">{i + 1}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}
