/**
 * SuratUndanganPaper — SURAT UNDANGAN blanko (blok CETAK MURNI).
 * Sprint 024: menu Surat Undangan (blanko) Dokumen Kelengkapan.
 * Surat dinas formal: Kepada Yth · perihal · isi · tempat/waktu · TTD
 * via blok signature terpisah (KS dari Data Sekolah).
 * data = { nomor, tanggal, kepada, perihal, isi, tempat, waktu }.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function SuratUndanganPaper({ blockConfig, data = {} }) {
  const d = data || {}
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)

  return (
    <div className="mb-4 text-[11pt] leading-relaxed text-black">
      <table className="surat-polos w-full mb-3">
        <tbody>
          <tr>
            <td className="w-24">Nomor</td><td className="w-4">:</td>
            <td>{isi(d.nomor, 'Nomor surat')}</td>
            <td className="text-right">{isi(d.tanggal, 'Tanggal')}</td>
          </tr>
        </tbody>
      </table>
      <div className="mb-1">Kepada Yth,</div>
      <div className="font-bold mb-1">{isi(d.kepada, 'Nama / Jabatan yang diundang')}</div>
      <div className="mb-3">di tempat</div>
      <div className="mb-3">Perihal: <span className="font-bold italic">{isi(d.perihal, 'Perihal undangan')}</span></div>
      <div className="mb-3 text-justify whitespace-pre-wrap">{isi(d.isi, 'Isi undangan')}</div>
      <table className="surat-polos w-full mb-1">
        <tbody>
          <tr><td className="w-24">Tempat</td><td className="w-4">:</td><td>{isi(d.tempat, 'Tempat acara')}</td></tr>
          <tr><td>Waktu</td><td>:</td><td>{isi(d.waktu, 'Waktu acara')}</td></tr>
        </tbody>
      </table>
    </div>
  )
}
