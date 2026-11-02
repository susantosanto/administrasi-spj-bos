/**
 * TabelRealisasi — REKAPITULASI REALISASI PENGGUNAAN DANA BOSP (blok CETAK MURNI)
 * Source: template-data/rpd-k7-output.pdf (Tahap 1 2026).
 *
 * Struktur: judul + tahap/tahun + periode · blok identitas (sekolah +
 * NPSN) · sumber dana · matriks 7 SNP × 12 (header vertikal, kolom
 * JUMLAH) + baris JUMLAH · footer saldo (lalu/terima/akhir/pakai) · TTD
 * 2 kolom (Menyetujui KS · Bendahara + NIP).
 * data = { judulTahap, periode, sekolah:{...}, npsn, sumberDana,
 *   kepala:[12 label], rows:[{label, vals[12], jumlah}], jumlahKolom[12],
 *   grandTotal, saldoLalu, totalTerima, saldoAkhir, totalPakai,
 *   ksNama, ksNip, bendNama, bendNip } — dirakit realisasiDocs (previewDocs).
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const rp = (v) => (Number(v) || 0) === 0 ? '0' : Number(v).toLocaleString('id-ID')

export default function TabelRealisasi({ blockConfig, data = {} }) {
  const d = data || {}
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)
  const kepala = Array.isArray(d.kepala) ? d.kepala : []
  const rows = Array.isArray(d.rows) ? d.rows : []
  const jumlahKolom = Array.isArray(d.jumlahKolom) ? d.jumlahKolom : []

  return (
    <div className="kas-dok text-[8pt] leading-snug text-black">
      <div className="text-center font-bold text-[11pt]">REKAPITULASI REALISASI PENGGUNAAN DANA BOSP</div>
      <div className="text-center font-bold text-[10pt]">{isi(d.judulTahap, 'Tahap + tahun')}</div>
      <div className="text-center font-bold text-[9pt] mb-2">PERIODE TANGGAL : {isi(d.periode, 'Periode')}</div>

      <table className="surat-polos w-full text-[9pt] mb-2">
        <tbody>
          <tr>
            <td className="w-32">Nama Sekolah</td><td className="w-4">:</td>
            <td className="font-bold">{isi(d.sekolahNama, 'Nama sekolah')}</td>
            <td className="w-24">NPSN : {isi(d.npsn, 'NPSN')}</td>
          </tr>
          <tr>
            <td>Kecamatan</td><td>:</td>
            <td colSpan={2}>{isi(d.kecamatan, 'Kecamatan')}</td>
          </tr>
          <tr>
            <td>Kabupaten/Kota</td><td>:</td>
            <td colSpan={2}>{isi(d.kabupaten, 'Kabupaten/Kota')}</td>
          </tr>
          <tr>
            <td>Provinsi</td><td>:</td>
            <td colSpan={2}>{isi(d.provinsi, 'Provinsi')}</td>
          </tr>
        </tbody>
      </table>
      <div className="text-[9pt] mb-2">Sumber Dana : {isi(d.sumberDana, 'Sumber dana')}</div>

      <table className="w-full border-collapse border border-gray-400 table-fixed text-[7pt]">
        <thead>
          <tr>
            <th className="border border-gray-400 px-1 py-1 w-6 align-middle">No.</th>
            <th className="border border-gray-400 px-1 py-1 align-middle break-words leading-tight" style={{ width: '12%' }}>Standar Nasional Pendidikan</th>
            {kepala.map((k, i) => (
              <th key={i} className="border border-gray-400 px-1 py-1 align-middle text-center font-semibold break-words leading-tight">
                {k}
              </th>
            ))}
            <th className="border border-gray-400 px-1 py-1 font-bold align-middle" style={{ width: '9%' }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="border border-gray-400 px-1 py-1 text-center">{i + 1}</td>
              <td className="border border-gray-400 px-1 py-1 break-words leading-tight">{r.label}</td>
              {(r.vals || []).map((v, k) => (
                <td key={k} className="border border-gray-400 px-1 py-1 text-right whitespace-nowrap overflow-hidden tabular-nums text-[6.5pt]">{rp(v)}</td>
              ))}
              <td className="border border-gray-400 px-1 py-1 text-right font-bold whitespace-nowrap overflow-hidden tabular-nums text-[6.5pt]">{rp(r.jumlah)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-gray-400 px-1 py-1 text-center" colSpan={2}>JUMLAH</td>
            {jumlahKolom.map((v, k) => (
              <td key={k} className="border border-gray-400 px-1 py-1 text-right whitespace-nowrap overflow-hidden tabular-nums text-[6.5pt]">{rp(v)}</td>
            ))}
            <td className="border border-gray-400 px-1 py-1 text-right whitespace-nowrap overflow-hidden tabular-nums">{rp(d.grandTotal)}</td>
          </tr>
        </tbody>
      </table>

      <table className="surat-polos w-full text-[9pt] mt-2">
        <tbody>
          <tr><td className="w-64">Saldo periode sebelumnya</td><td className="w-4">:</td><td>Rp. {isi(d.saldoLalu, '0')}</td></tr>
          <tr><td>Total penerimaan dana BOSP periode ini</td><td>:</td><td>Rp. {isi(d.totalTerima, '0')}</td></tr>
          <tr><td>Akhir saldo BOSP periode ini</td><td>:</td><td>Rp. {isi(d.saldoAkhir, '0')}</td></tr>
          <tr><td className="font-bold">Total penggunaan dana BOSP periode ini</td><td>:</td><td className="font-bold">Rp. {isi(d.totalPakai, '0')}</td></tr>
        </tbody>
      </table>

      <div className="grid grid-cols-2 gap-6 mt-4 break-inside-avoid text-[9pt]">
        <div className="text-center">
          <div>Menyetujui,</div>
          <div>Kepala Sekolah</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(d.ksNama, 'Nama kepala sekolah')}</div>
          <div>{d.ksNip ? `NIP. ${d.ksNip}` : ''}</div>
        </div>
        <div className="text-center">
          <div>Bendahara /</div>
          <div>Penanggungjawab Kegiatan</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(d.bendNama, 'Nama bendahara')}</div>
          <div>{d.bendNip ? `NIP. ${d.bendNip}` : ''}</div>
        </div>
      </div>
    </div>
  )
}
