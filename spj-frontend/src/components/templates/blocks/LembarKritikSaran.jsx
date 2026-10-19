/**
 * LembarKritikSaran — LEMBAR PENCATATAN PERTANYAAN/KRITIK/SARAN (blok CETAK MURNI)
 * Source: template/Contoh Template App_Register-BA Kas.xlsx
 *         (sheet "Lbr. Kritik-Saran", print area A2:D48, A4 portrait)
 *
 * Ekstraksi sumber (openpyxl):
 * - Kop judul 4 baris (centered):
 *     "LEMBAR PENCATATAN PERTANYAAN/KRITIK/SARAN" (bold 11pt)
 *     "DANA <JENIS DANA> TAHUN ANGGARAN <TAHUN>" (bold 14pt)
 *     "<NAMA SEKOLAH> KECAMATAN <KECAMATAN>" (bold 11pt)
 *     "PERIODE : BULAN <BULAN> TAHUN <TAHUN>" (bold 12pt + garis bawah tipis)
 * - 5 nomor bagian:
 *     1 Identitas Penanya/Pemberi Saran → a. Nama · b. Alamat (2 baris)
 *     2 Tanggal Penerimaan Pertanyaan/Saran
 *     3 Uraian Pertanyaan/Saran (9 baris titik)
 *     4 Penerima Pertanyaan/Saran
 *     5 Tindak Lanjut Saran (7 baris titik)
 * - Footer kanan (10pt): "<tempat>, <tanggal>" · "MELAPORKAN:" · "Kepala Sekolah,"
 *   · [ruang TTD] · nama (bold + garis bawah) · "NIP. <nip>".
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function LembarKritikSaran({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)

  const titik = (key, jumlahBaris = 1, colon = true) => {
    const value = v(key)
    return (
      <div className="flex-1">
        {jumlahBaris > 1 && colon && <span>: </span>}
        {Array.from({ length: jumlahBaris }, (_, i) => (
          <div key={i} className="flex items-end gap-1 min-h-[15px]">
            <span className="whitespace-pre-wrap break-words">{i === 0 ? value : ''}</span>
            <span className="flex-1 border-b border-dotted border-black mb-[3px]" />
          </div>
        ))}
      </div>
    )
  }

  const nomor = (no, label, children) => (
    <div key={no} className="flex gap-2">
      <div className="w-4 shrink-0">{no}</div>
      <div className="flex-1">
        <div className="mb-[3px]">{label}</div>
        {children}
      </div>
    </div>
  )

  return (
    <div className="lembar-dok text-[11pt] leading-snug text-black">
      {/* A3 & A4 sumber TIDAK bold (A4 14pt, A6 PERIODE bold + garis bawah) */}
      <div className="text-center">LEMBAR PENCATATAN PERTANYAAN/KRITIK/SARAN</div>
      <div className="text-center text-[14pt]">{isi(v('judulDana'), 'Dana dan tahun anggaran')}</div>
      <div className="text-center font-bold">{isi(v('namaSekolahKet'), 'Nama sekolah dan kecamatan')}</div>
      <div className="text-center font-bold text-[12pt] border-b border-black pb-1 mb-4">
        {isi(v('periode'), 'Periode')}
      </div>

      <div className="space-y-1">
        {nomor('1', 'Identitas Penanya/Pemberi Saran', (
          <>
            <div className="flex"><div className="w-14 shrink-0 pl-4">a. Nama</div><div className="flex-1">{titik('namaPemberi')}</div></div>
            <div className="flex"><div className="w-14 shrink-0 pl-4">b. Alamat</div><div className="flex-1">{titik('alamatPemberi', 2)}</div></div>
          </>
        ))}

        {nomor('2', 'Tanggal Penerimaan Pertanyaan/Saran', (
          <div className="flex"><div className="flex-1 pl-4">{titik('tglTerima')}</div></div>
        ))}

        {nomor('3', 'Uraian Pertanyaan/Saran:', <div className="pl-4">{titik('uraianKegiatan', 9, false)}</div>)}

        {nomor('4', 'Penerima Pertanyaan/Saran', (
          <div className="flex"><div className="flex-1 pl-4">{titik('penerima')}</div></div>
        ))}

        {nomor('5', 'Tindak Lanjut Saran:', <div className="pl-4">{titik('tindakLanjut', 7, false)}</div>)}
      </div>

      {/* Footer kanan 10pt (D34:D42) */}
      <div className="w-1/2 ml-auto mt-6 text-[10pt] break-inside-avoid">
        <div>{isi(v('tempatTtd'), 'Tempat, tanggal')}</div>
        <div>MELAPORKAN:</div>
        <div>Kepala Sekolah,</div>
        <div style={{ height: '52px' }} />
        <div className="font-bold underline">{isi(v('namaMelaporkan'), 'Nama kepala sekolah')}</div>
        <div>{v('nipMelaporkan') ? `NIP. ${v('nipMelaporkan')}` : ''}</div>
      </div>
    </div>
  )
}