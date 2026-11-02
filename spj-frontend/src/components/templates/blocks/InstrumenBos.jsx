/**
 * InstrumenBos — INSTRUMEN BOS REGULER (blok CETAK MURNI)
 * Source: template/Form isian_BOS  2026 SDN PASIRHALANG.doc
 * (PENYALURAN DAN PENGGUNAAN DANA BOS REGULER SD/SMP TA. 2026).
 *
 * Seksi: A Data Umum · B Tim BOS · C Anggaran · D Realisasi 2 tahap ·
 * E Penatausahaan + footer tempat/tanggal + NIP.
 * data = { tahun, a:{...}, b:{...}, c:{...}, dRows:[{label,t1,t2,total}],
 *   dJumlah:{t1,t2,total}, e:{saldoAwal, s/dTanggal, bulan:[{bulan,masuk,keluar,saldo}],
 *   pajakPotong, pajakSetor, pajakSisa, pembukuan[]},
 *   tempatTtd, nip } — dirakit instrumenDocs (previewDocs).
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const rp = (v) => (Number(v) || 0) === 0 ? '0' : Number(v).toLocaleString('id-ID')
const H2 = ({ children }) => (
  <h3 className="text-[10pt] font-bold mt-4 mb-1 uppercase">{children}</h3>
)

export default function InstrumenBos({ blockConfig, data = {} }) {
  const d = data || {}
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)
  const a = d.a || {}
  const b = d.b || {}
  const c = d.c || {}
  const dRows = Array.isArray(d.dRows) ? d.dRows : []
  const dj = d.dJumlah || {}
  const e = d.e || {}
  const bulan = Array.isArray(e.bulan) ? e.bulan : []
  const pembukuan = Array.isArray(e.pembukuan) ? e.pembukuan : []

  const baris = (label, value, kunci) => (
    <div key={kunci} className="flex gap-2 text-[9pt]">
      <span className="w-64 shrink-0">{label}</span>
      <span>:</span>
      <span className="flex-1">{isi(value, label)}</span>
    </div>
  )

  return (
    <div className="kas-dok text-[9pt] leading-snug text-black">
      <div className="text-center font-bold text-[11pt]">PENYALURAN DAN PENGGUNAAN DANA BOS REGULER</div>
      <div className="text-center font-bold text-[10pt] mb-2">SD/SMP TA. {isi(d.tahun, 'Tahun')}</div>

      <H2>A. Data Umum Sekolah</H2>
      <div className="space-y-0.5">
        {baris('Nama Sekolah', a.namaSekolah, 'a1')}
        {baris('Kecamatan', a.kecamatan, 'a2')}
        {baris('Status (Negeri/Swasta)', a.status, 'a3')}
        {baris('NPSN', a.npsn, 'a4')}
        {baris('Ijin Menyelenggarakan Pendidikan', a.ijin, 'a5')}
        {baris('Nomor Rekening', a.noRekening, 'a6')}
        {baris('Bank', a.bank, 'a7')}
        {baris('Nama tertera pada Rekening', a.namaRekening, 'a8')}
        {baris('Kepala Sekolah — Nama Lengkap', a.ksNama, 'a9')}
        {baris('Pangkat, Golongan/Ruang', a.ksPangkat, 'a10')}
        {baris('Nomor/Tgl. SK. Jabatan', a.ksSk, 'a11')}
        {baris('TMT Jabatan', a.ksTmt, 'a12')}
        {baris('Jumlah Guru selain Kepala Sekolah', a.jmlGuru, 'a13')}
        {baris('Jumlah Guru PNS', a.jmlGuruPns, 'a14')}
        {baris('Jumlah Guru Non ASN (penerima BOS)', a.jmlGuruNonAsn, 'a15')}
        {baris('Jumlah Tenaga Kependidikan', a.jmlTendik, 'a16')}
        {baris('Tenaga Kependidikan PNS', a.jmlTendikPns, 'a16b')}
        {baris('Tenaga Kependidikan Non ASN', a.jmlTendikNonAsn, 'a16c')}
        {baris('Jumlah Siswa saat ini', a.jmlSiswa, 'a17')}
        {baris('Telepon', a.telepon, 'a18')}
        {baris('Email', a.email, 'a19')}
      </div>

      <H2>B. Pengelolaan Dana BOS — Tim BOS Sekolah</H2>
      <div className="space-y-0.5">
        {baris('SK. Nomor', b.skNomor, 'b1')}
        {baris('Penanggungjawab', b.penanggungjawab, 'b2')}
        {baris('Bendahara', b.bendahara, 'b3')}
        {baris('Anggota', b.anggota, 'b4')}
      </div>

      <H2>C. Anggaran</H2>
      <div className="space-y-0.5">
        {baris('Nilai BOS Daerah per Siswa (Rp)', c.perSiswa, 'c1')}
        {baris('Jumlah Siswa (Penerima Dana BOS)', c.jmlSiswa, 'c2')}
        {baris('Total Dana BOS yang dikelola TA (Rp)', c.total, 'c3')}
      </div>

      <H2>D. Alokasi, Anggaran dan Realisasi</H2>
      <table className="w-full border-collapse border border-gray-400 table-fixed text-[8pt]">
        <thead>
          <tr>
            <th className="border border-gray-400 px-1 py-1" style={{ width: '40%' }}>Komponen Penggunaan Dana BOS</th>
            <th className="border border-gray-400 px-1 py-1">Tahap 1</th>
            <th className="border border-gray-400 px-1 py-1">Tahap 2</th>
            <th className="border border-gray-400 px-1 py-1">Total Realisasi</th>
          </tr>
        </thead>
        <tbody>
          {dRows.map((r, i) => (
            <tr key={i}>
              <td className="border border-gray-400 px-1 py-1">{r.label}</td>
              <td className="border border-gray-400 px-1 py-1 text-right">{rp(r.t1)}</td>
              <td className="border border-gray-400 px-1 py-1 text-right">{rp(r.t2)}</td>
              <td className="border border-gray-400 px-1 py-1 text-right font-bold">{rp(r.total)}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td className="border border-gray-400 px-1 py-1">Jumlah Total</td>
            <td className="border border-gray-400 px-1 py-1 text-right">{rp(dj.t1)}</td>
            <td className="border border-gray-400 px-1 py-1 text-right">{rp(dj.t2)}</td>
            <td className="border border-gray-400 px-1 py-1 text-right">{rp(dj.total)}</td>
          </tr>
        </tbody>
      </table>

      <H2>E. Penatausahaan</H2>
      <div className="space-y-0.5">
        {baris('Saldo Awal (per tgl. 1 Januari)', e.saldoAwal, 'e1')}
        {baris('Penggunaan Dana BOS s/d', e.sdTanggal, 'e2')}
      </div>
      <table className="w-full border-collapse border border-gray-400 table-fixed text-[8pt] mt-1">
        <thead>
          <tr>
            <th className="border border-gray-400 px-1 py-1">Bulan</th>
            <th className="border border-gray-400 px-1 py-1">Penerimaan</th>
            <th className="border border-gray-400 px-1 py-1">Pengeluaran</th>
            <th className="border border-gray-400 px-1 py-1">Saldo</th>
          </tr>
        </thead>
        <tbody>
          {bulan.map((bl, i) => (
            <tr key={i}>
              <td className="border border-gray-400 px-1 py-1">{bl.bulan}</td>
              <td className="border border-gray-400 px-1 py-1 text-right">{rp(bl.masuk)}</td>
              <td className="border border-gray-400 px-1 py-1 text-right">{rp(bl.keluar)}</td>
              <td className="border border-gray-400 px-1 py-1 text-right">{rp(bl.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-0.5 mt-1">
        {baris('Pajak yang dipotong', e.pajakPotong, 'e3')}
        {baris('Pajak yang sudah disetorkan', e.pajakSetor, 'e4')}
        {baris('Sisa Pajak yang belum disetorkan', e.pajakSisa, 'e5')}
        {baris('Pembukuan/dokumen yang dibuat', (pembukuan || []).join(', '), 'e6')}
      </div>

      <div className="w-1/2 ml-auto mt-6 text-[10pt] break-inside-avoid">
        <div>{isi(d.tempatTtd, 'Tempat, bulan tahun')}</div>
        <div style={{ height: '52px' }} />
        <div className="font-bold underline">{isi(d.namaPelapor, 'Nama')}</div>
        <div>{d.nip ? `NIP. ${d.nip}` : ''}</div>
      </div>
    </div>
  )
}
