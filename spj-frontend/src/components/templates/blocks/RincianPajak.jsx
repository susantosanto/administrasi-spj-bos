/**
 * RincianPajak — LAPORAN RINCIAN PAJAK SEKOLAH (blok CETAK MURNI, tanpa input)
 * Source: template/Contoh template Rincian Pajak Sekolah Dasar Negeri.xlsx
 * (sheet "SD_SMP", A4 LANDSCAPE, 16 kolom A..P).
 *
 * Perubahan 2026-10-19 (fix layout):
 * - Header ditulis eksplisit (hardcoded) tanpa array mapping → menghindari
 *   bug rowSpan/colSpan yang menyebabkan header tidak sejajar.
 * - Hapus table-layout: fixed + colgroup → browser pakai auto layout,
 *   lebih robust untuk kolom bervariasi.
 * - Font screen 6pt (bukan 8pt) agar muat di panel preview ~700px;
 *   print tetap 4pt.
 * - Kolom URAIAN PAJAK (E) = nama kegiatan dari BKU (kodeKegiatan →
 *   lookup ke kodeReferensi.js kalau tersedia).
 */
import { formatTanggalContoh } from '../../../utils/dokKas'
import { getNamaKegiatan } from '../../../data/kodeReferensi'

const angka = (n) => (Number(n) || 0).toLocaleString('id-ID')
const tgl = (iso) => (iso ? formatTanggalContoh(iso) : '')

/** Ambil uraian yang tampil: nama kegiatan dari kodeKegiatan kalau ada, else uraian BKU. */
function uraianTampil(r) {
  if (r._kodeKegiatan) {
    const nama = getNamaKegiatan(r._kodeKegiatan)
    if (nama && nama !== r._kodeKegiatan) return nama
  }
  return r.uraian || ''
}

export default function RincianPajak({ blockConfig, data = {} }) {
  const rows = Array.isArray(data.rows) ? data.rows : []
  const totals = data.totals || rows.reduce((acc, r) => ({
    pph21: (acc.pph21 || 0) + (Number(r.pph21) || 0),
    pph22: (acc.pph22 || 0) + (Number(r.pph22) || 0),
    pph23: (acc.pph23 || 0) + (Number(r.pph23) || 0),
    ppn:   (acc.ppn   || 0) + (Number(r.ppn)   || 0),
    total: (acc.total || 0) + (Number(r.total) || 0),
  }), {})
  const tahun = String(data.tahun || '').trim()

  const selPajak = (n) => (Number(n) > 0 ? angka(n) : '')
  const selTotal = (n) => (Number(n) > 0 ? angka(n) : '-')

  return (
    <div className="pajak-dok font-[Arial] text-[6pt] leading-tight text-black">
      {/* Judul (A1) + catatan kanan (L2) */}
      <div className="flex items-start justify-between gap-4 mb-1">
        <div className="font-bold text-[9pt] whitespace-pre">
          {`RINCIAN PAJAK SEKOLAH  ${tahun ? `TA ${tahun}` : ''}`.trim()}
        </div>
        <div className="text-[6pt] whitespace-nowrap">{data.catatanAtas || ''}</div>
      </div>

      <table className="pajak-tabel w-full border-collapse">
        <thead>
          {/* Baris header 1 */}
          <tr>
            <th rowSpan={2} className="th-pajak">NO</th>
            <th rowSpan={2} className="th-pajak">Nama Sekolah</th>
            <th rowSpan={2} className="th-pajak">Jenjang</th>
            <th rowSpan={2} className="th-pajak">BULAN PAJAK</th>
            <th rowSpan={2} className="th-pajak">URAIAN PAJAK</th>
            <th rowSpan={2} className="th-pajak">NILAI BELANJA</th>
            <th colSpan={4} className="th-pajak text-center">JUMLAH/JENIS SETORAN PAJAK</th>
            <th rowSpan={2} className="th-pajak">Total</th>
            <th rowSpan={2} className="th-pajak">TANGGAL BAYAR</th>
            <th rowSpan={2} className="th-pajak">TANGGAL NTPN</th>
            <th rowSpan={2} className="th-pajak">NTPN</th>
            <th rowSpan={2} className="th-pajak">NOMOR KODE BILLING</th>
            <th rowSpan={2} className="th-pajak">KETERANGAN</th>
          </tr>
          {/* Baris header 2: sub-header PPh */}
          <tr>
            <th className="th-pajak text-center">PPh 21</th>
            <th className="th-pajak text-center">PPh 22</th>
            <th className="th-pajak text-center">PPh 23</th>
            <th className="th-pajak text-center">PPN</th>
          </tr>
          {/* Baris nomor kolom 1..16 */}
          <tr>
            {Array.from({ length: 16 }, (_, i) => (
              <th key={i} className="th-pajak-num">{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={16} className="td-pajak text-center text-slate-500">
                Belum ada transaksi pajak di BKU — baris terisi otomatis setelah data BKU diunggah.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="td-pajak text-center">{r.no}</td>
              <td className="td-pajak">{r.namaSekolah || ''}</td>
              <td className="td-pajak">{r.jenjang || ''}</td>
              <td className="td-pajak">{r.bulan || ''}</td>
              <td className="td-pajak">{uraianTampil(r)}</td>
              <td className="td-pajak text-right" />
              <td className="td-pajak text-right whitespace-nowrap">{selPajak(r.pph21)}</td>
              <td className="td-pajak text-right whitespace-nowrap">{selPajak(r.pph22)}</td>
              <td className="td-pajak text-right whitespace-nowrap">{selPajak(r.pph23)}</td>
              <td className="td-pajak text-right whitespace-nowrap">{selPajak(r.ppn)}</td>
              <td className="td-pajak text-right whitespace-nowrap">{angka(r.total)}</td>
              <td className="td-pajak text-center whitespace-nowrap">{tgl(r.tglBayar)}</td>
              <td className="td-pajak text-center whitespace-nowrap">{tgl(r.tglNtpn)}</td>
              <td className="td-pajak">{r.ntpn || ''}</td>
              <td className="td-pajak">{r.kodeBilling || ''}</td>
              <td className="td-pajak">{r.keterangan || ''}</td>
            </tr>
          ))}
          {/* Baris Total */}
          <tr>
            <td colSpan={6} className="td-pajak text-center font-bold">Total</td>
            <td className="td-pajak text-right font-bold whitespace-nowrap">{selTotal(totals.pph21)}</td>
            <td className="td-pajak text-right font-bold whitespace-nowrap">{selTotal(totals.pph22)}</td>
            <td className="td-pajak text-right font-bold whitespace-nowrap">{selTotal(totals.pph23)}</td>
            <td className="td-pajak text-right font-bold whitespace-nowrap">{selTotal(totals.ppn)}</td>
            <td className="td-pajak text-right font-bold whitespace-nowrap">{angka(totals.total)}</td>
            <td className="td-pajak border-black" />
            <td className="td-pajak border-black" />
            <td className="td-pajak border-black" />
            <td className="td-pajak border-black" />
            <td className="td-pajak border-black" />
          </tr>
        </tbody>
      </table>

      {/* Catatan bawah */}
      <div className="mt-1 font-bold">{data.ketBawah || ''}</div>
    </div>
  )
}
