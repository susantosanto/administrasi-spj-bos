/**
 * BapKas — BERITA ACARA PEMERIKSAAN KAS (blok CETAK MURNI, tanpa input)
 * Source: template/Contoh Template App_Register-BA Kas.xlsx (sheet "BA_Pemeriksaan Kas")
 *
 * Ekstraksi sumber (print area B1:E40, A4 portrait):
 * - Judul "BERITA ACARA PEMERIKSAAN KAS" (bold, center, merge B2:H2)
 *   · "BOS REGULER" (bold center) · "PERIODE : BULAN <BULAN> <TAHUN>" (bold center 9pt)
 * - Narasi pembuka justify+wrap (B6:B7) berisi SK Kepala Sekolah.
 * - "Nama : <KS>" / "Jabatan : Kepala Sekolah" (label kolom C, nilai kolom D bold)
 * - "melakukan pemeriksaan kas kepada:" (B12)
 * - "Nama : <bendahara>" / "Jabatan : Bendahara" (C14:D15)
 * - Paragraf SK Bupati Bandung Barat (B17, justify+wrap)
 * - "Berdasarkan pemeriksaan kas serta bukti-bukti dalam pengurusan itu, kami
 *   menemui kenyataan sebagai berikut:" (B20, wrap)
 * - "Jumlah uang yang dihitung dihadapan Bendahara/Pemegang Kas adalah :" (B22)
 *   a) Uang kertas bank, uang logam  b) Saldo Bank  c) Surat berharga, dll.
 *   → "Jumlah" (bold) · "Saldo uang menurut Kas Umum" ·
 *   "Perbedaan antara saldo Kas dan saldo Buku"
 * - "Tanggal : <tanggal>" rata kiri (E31, bold)
 * - TTD 2 kolom: kiri "Bendahara/Pemegang Kas," · kanan "Kepala Sekolah,"
 *   (CATATAN: di sheet ini TTD memakai "Kepala Sekolah," tanpa didahului
 *   "Yang memeriksa" — berbeda dari Register Kas)
 * - Money: "Rp 0" (tanpa ,-) + "Rp 100" untuk nominal.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

const rp = (v) => `Rp ${(Number(v) || 0).toLocaleString('id-ID')}`

export default function BapKas({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)

  const rows = Array.isArray(data.rows) ? data.rows : []
  const cariUraian = (awalan) => rows.find((r) => String(r.uraian || '').trim().toLowerCase().startsWith(awalan))
  const a = cariUraian('a)')
  const b = cariUraian('b)')
  const c = cariUraian('c)')
  const total = rows.find((r) => String(r.uraian || '').trim().toLowerCase() === 'jumlah')
  const saldo = rows.find((r) => String(r.uraian || '').trim().toLowerCase().startsWith('saldo uang'))
  const selisih = rows.find((r) => String(r.uraian || '').trim().toLowerCase().startsWith('perbedaan'))

  return (
    <div className="kas-dok text-[9pt] leading-snug text-black">
      <div className="text-center font-bold text-[11pt]">BERITA ACARA PEMERIKSAAN KAS</div>
      <div className="text-center font-bold text-[11pt]">{isi(v('jenisDana'), 'Jenis dana')}</div>
      <div className="text-center font-bold text-[9pt] mb-3">{isi(v('periode'), 'Periode')}</div>

      {/* Narasi pembuka (B6:B7, justify + wrap) — nomor SK di baris terpisah (B7) */}
      <p className="text-justify text-justify-interword mb-1">{isi(v('uraianKegiatan'), 'Narasi pembuka')}</p>
      <div>{isi(v('skKsLine'), 'Nomor SK kepala sekolah')}</div>

      {/* Nama/Jabatan pemeriksa (C9:D10) */}
      <div className="w-1/2">
        <div className="flex"><span className="w-16 shrink-0">Nama</span><span>: </span><span className="font-bold">{isi(v('namaPemeriksa'), 'Nama pemeriksa')}</span></div>
        <div className="flex"><span className="w-16 shrink-0">Jabatan</span><span>: </span><span>{isi(v('jabatanPemeriksa'), 'Jabatan pemeriksa')}</span></div>
      </div>

      <p className="mt-2 mb-1">melakukan pemeriksaan kas kepada:</p>

      {/* Nama/Jabatan diperiksa (C14:D15) */}
      <div className="w-1/2">
        <div className="flex"><span className="w-16 shrink-0">Nama</span><span>: </span><span className="font-bold">{isi(v('namaDiperiksa'), 'Nama yang diperiksa')}</span></div>
        <div className="flex"><span className="w-16 shrink-0">Jabatan</span><span>: </span><span>{isi(v('jabatanDiperiksa'), 'Jabatan yang diperiksa')}</span></div>
      </div>

      {/* Paragraf SK Bupati (B17, justify + wrap) */}
      <p className="text-justify text-justify-interword mt-2 mb-2">{isi(v('skBendahara'), 'Nomor SK/sk penunjukan Bendahara')}</p>

      <p className="text-justify text-justify-interword mb-1">
        Berdasarkan pemeriksaan kas serta bukti-bukti dalam pengurusan itu, kami menemui kenyataan sebagai berikut:
      </p>

      <p className="mt-2 mb-1">Jumlah uang yang dihitung dihadapan Bendahara/Pemegang Kas adalah :</p>
      <div className="pl-8 space-y-0.5">
        <div className="flex items-baseline gap-2">
          <span className="w-4 text-center shrink-0">a)</span>
          <span className="flex-1">Uang kertas bank, uang logam</span>
          <span className="whitespace-nowrap">{rp(a?.nominal)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-4 text-center shrink-0">b)</span>
          <span className="flex-1">Saldo Bank</span>
          <span className="whitespace-nowrap">{rp(b?.nominal)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-4 text-center shrink-0">c)</span>
          <span className="flex-1">Surat berharga, dll.</span>
          <span className="whitespace-nowrap">{rp(c?.nominal)}</span>
        </div>
        <div className="flex items-baseline gap-2 font-bold">
          <span className="w-4 shrink-0" />
          <span className="flex-1">Jumlah</span>
          <span className="whitespace-nowrap">{rp(total?.nominal)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-4 shrink-0" />
          <span className="flex-1">Saldo uang menurut Kas Umum</span>
          <span className="whitespace-nowrap">{rp(saldo?.nominal)}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="w-4 shrink-0" />
          <span className="flex-1">Perbedaan antara saldo Kas dan saldo Buku</span>
          <span className="whitespace-nowrap">{rp(selisih?.nominal)}</span>
        </div>
      </div>

      {/* Tanggal : (E31, bold, satu sel "Tanggal : <tanggal>", rata kiri) */}
      <div className="mt-3 font-bold">
        <span>Tanggal : </span>
        <span>{isi(v('tanggalTtd'), 'Tanggal')}</span>
      </div>

      {/* TTD 2 kolom (C32:C38 · E32:E38) */}
      <div className="grid grid-cols-2 gap-8 mt-1 break-inside-avoid">
        <div>
          <div>Bendahara/Pemegang Kas,</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(v('namaDiperiksa'), 'Nama bendahara')}</div>
          <div>{v('nipDiperiksa') ? `NIP. ${v('nipDiperiksa')}` : ''}</div>
        </div>
        <div>
          <div>Kepala Sekolah,</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(v('namaMemeriksa'), 'Nama kepala sekolah')}</div>
          <div>{v('nipMemeriksa') ? `NIP. ${v('nipMemeriksa')}` : ''}</div>
        </div>
      </div>
    </div>
  )
}
