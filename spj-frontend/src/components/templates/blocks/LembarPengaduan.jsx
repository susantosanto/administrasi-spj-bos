/**
 * LembarPengaduan — LEMBAR PENCATATAN PENGADUAN MASYARAKAT (blok CETAK MURNI)
 * Source: template/Contoh Template App_Register-BA Kas.xlsx
 *         (sheet "Lbr. Pengaduan Masyarakat", print area A1:D56, A4 portrait)
 *
 * Ekstraksi sumber (openpyxl):
 * - Kop judul 4 baris (semua centered):
 *     "LEMBAR PENCATATAN PENGADUAN MASYARAKAT" (bold 11pt)
 *     "DANA <JENIS DANA> TAHUN ANGGARAN <TAHUN>" (11pt)
 *     "<NAMA SEKOLAH> KECAMATAN <KECAMATAN>" (bold 11pt)
 *     "PERIODE : BULAN <BULAN> TAHUN <TAHUN>" (bold 12pt + garis bawah tipis)
 * - 11 nomor bagian, nomor di kolom A, label kolom B, isi di garis titik-titik:
 *     1 Identitas Pengadu → a. Nama · b. Alamat (2 baris)
 *     2 Tanggal Terima Pengaduan
 *     3 Lokasi Kejadian → a. RT/RW/Dusun · b. Kelurahan · c. Kabupaten/Kota · d. Provinsi
 *     4 Uraian Pengaduan (4 baris titik)
 *     5 Tanggal Penyelidikan Dilakukan
 *     6 Penyelidik
 *     7 Temuan (4 baris titik)
 *     8 Keputusan/Rekomendasi (3 baris titik)
 *     9 Pelaksanaan Keputusan (3 baris titik)
 *    10 Tanggal pemberitahuan kepada Pengadu tentang keputusan/dan pelaksanaan keputusan
 *    11 Dokumen yang diterima (3 baris titik)
 * - Footer kanan (10pt): "<tempat>, <tanggal>" · "MELAPORKAN:" · "Kepala Sekolah,"
 *   · [ruang TTD] · nama (bold + garis bawah) · "NIP. <nip>".
 * - Font: keputusan user 2026-10-18 = IKUT FONT APLIKASI; ukuran & struktur
 *   mengikuti sumber lewat satuan pt.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

export default function LembarPengaduan({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)

  /** Baris isian dengan garis titik-titik (replika sel ber-dotted border).
   *  colon=false untuk blok isian panjang (uraian/temuan/…) — sumbernya
   *  memang tanpa tanda titik dua, hanya garis titik-titik. */
  const titik = (key, label, jumlahBaris = 1, colon = true) => {
    const value = v(key)
    return (
      <div className="flex-1">
        {jumlahBaris > 1 && <span>: </span>}
        {Array.from({ length: jumlahBaris }, (_, i) => (
          <div key={i} className="flex items-end gap-1 min-h-[15px]">
            <span className="whitespace-pre-wrap break-words">
              {i === 0 ? (colon ? `${value}` : `${value}`) : ''}
            </span>
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
      {/* A2 & A5 sumber TIDAK bold (A5 punya garis bawah tipis) */}
      <div className="text-center">LEMBAR PENCATATAN PENGADUAN MASYARAKAT</div>
      <div className="text-center">{isi(v('judulDana'), 'Dana dan tahun anggaran')}</div>
      <div className="text-center font-bold">{isi(v('namaSekolahKet'), 'Nama sekolah dan kecamatan')}</div>
      <div className="text-center text-[12pt] border-b border-black pb-1 mb-4">
        {isi(v('periode'), 'Periode')}
      </div>

      <div className="space-y-1">
        {nomor('1', 'Identitas Pengadu', (
          <>
            <div className="flex"><div className="w-14 shrink-0 pl-4">a. Nama</div><div className="flex-1">{titik('namaPengadu', 'Nama pengadu')}</div></div>
            <div className="flex"><div className="w-14 shrink-0 pl-4">b. Alamat</div><div className="flex-1">{titik('alamatPengadu', 'Alamat pengadu', 2)}</div></div>
          </>
        ))}

        {nomor('2', 'Tanggal Terima Pengaduan', (
          <div className="flex"><div className="flex-1 pl-4">{titik('tglTerima', 'Tanggal terima')}</div></div>
        ))}

        {nomor('3', 'Lokasi Kejadian', (
          <>
            <div className="flex"><div className="w-24 shrink-0 pl-4">a. RT/RW/Dusun</div><div className="flex-1">{titik('lokasiRtRw', 'RT/RW/Dusun')}</div></div>
            <div className="flex"><div className="w-24 shrink-0 pl-4">b. Kelurahan</div><div className="flex-1">{titik('lokasiKelurahan', 'Kelurahan')}</div></div>
            <div className="flex"><div className="w-24 shrink-0 pl-4">c. Kabupaten/Kota</div><div className="flex-1">{titik('lokasiKabupaten', 'Kabupaten/Kota')}</div></div>
            <div className="flex"><div className="w-24 shrink-0 pl-4">d. Provinsi</div><div className="flex-1">{titik('lokasiProvinsi', 'Provinsi')}</div></div>
          </>
        ))}

        {nomor('4', 'Uraian Pengaduan:', <div className="pl-4">{titik('uraianKegiatan', 'Uraian pengaduan', 4, false)}</div>)}

        {nomor('5', 'Tanggal Penyelidikan Dilakukan', (
          <div className="flex"><div className="flex-1 pl-4">{titik('tglSelidik', 'Tanggal menyelidikan')}</div></div>
        ))}

        {nomor('6', 'Penyelidik', (
          <div className="flex"><div className="flex-1 pl-4">{titik('penyelidik', 'Nama penyelidik')}</div></div>
        ))}

        {nomor('7', 'Temuan:', <div className="pl-4">{titik('temuan', 'Temuan', 4, false)}</div>)}

        {nomor('8', 'Keputusan/Rekomendasi:', <div className="pl-4">{titik('keputusan', 'Keputusan/Rekomendasi', 3, false)}</div>)}

        {nomor('9', 'Pelaksanaan Keputusan', <div className="pl-4">{titik('pelaksanaan', 'Pelaksanaan keputusan', 3, false)}</div>)}

        {nomor('10', 'Tanggal pemberitahuan kepada Pengadu tentang keputusan/dan pelaksanaan keputusan :', (
          <div className="flex"><div className="flex-1 pl-4">{titik('tglPemberitahuan', 'Tanggal pemberitahuan')}</div></div>
        ))}

        {nomor('11', 'Dokumen yang diterima:', <div className="pl-4">{titik('dokumenDiterima', 'Dokumen yang diterima', 3, false)}</div>)}
      </div>

      {/* Footer kanan 10pt (D44:D52) */}
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
