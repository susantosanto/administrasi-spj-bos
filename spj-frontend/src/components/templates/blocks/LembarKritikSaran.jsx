/**
 * LembarKritikSaran — LEMBAR PENCATATAN PERTANYAAN/KRITIK/SARAN (blok CETAK MURNI)
 * Source: template/Contoh Template App_Register-BA Kas.xlsx
 *         (sheet "Lbr. Kritik-Saran", print area A2:D48, A4 portrait)
 *
 * Layout = TABEL 4 kolom persis sumber (A:nomor ~4% · B:label ~35% ·
 * C+D:isian ~61%), table-fixed + nowrap-clip seperti overflow Excel.
 * Titik-titik = TEKS sumber (~113 kolom C, ~179 baris penuh) — MERAH.
 * TANPA teks placeholder "[...]": dokumen tangan murni.
 * Tinggi baris isi 27pt; judul 11pt polos · dana 14pt polos ·
 * sekolah 11pt bold · periode 12pt BOLD bergaris bawah.
 * Footer kanan 10pt: tempat-tanggal · MELAPORKAN: · Kepala Sekolah, ·
 * nama bold+garis bawah · NIP.
 */
const DOTS_C = `.${'.'.repeat(112)}`
const DOTS_B = `.${'.'.repeat(178)}`

/** Sel titik-titik merah miring (nowrap + clip). value lama (bila ada) hitam di depan. */
function Merah({ value, dots }) {
  return (
    <span className="block whitespace-nowrap overflow-hidden max-w-full">
      {value ? <span className="text-black">{value}</span> : null}
      <span className="text-red-600 italic">{dots}</span>
    </span>
  )
}

export default function LembarKritikSaran({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const str = (value) => (value !== '' && value != null ? String(value) : '')

  const tdA = (anak, kunci) => (
    <td key={kunci} className="w-[4%] align-middle text-[11pt] text-black">{anak}</td>
  )
  const tdJudul = (anak, kunci, span = 3) => (
    <td key={kunci} colSpan={span} className="align-middle text-[11pt] text-black">{anak}</td>
  )
  // Sprint 023-rev24: sel label kolom B SAJA (span 1) untuk baris field —
  // default span 3 + tdIsi span 2 = 6 kolom > 4 sehingga sel isian terjepit
  // nol dan titik tak tampil (temuan screenshot).
  const tdB = (anak, kunci) => (
    <td key={kunci} className="align-middle text-[11pt] text-black">{anak}</td>
  )
  const tdIsi = (anak, kunci, span = 2) => (
    <td key={kunci} colSpan={span} className="align-middle text-[11pt] text-black overflow-hidden">{anak}</td>
  )
  const baris = (sel, kunci) => (
    <tr key={kunci} className="h-[36px]">{sel}</tr>
  )

  const fieldDots = (key) => (
    <span className="block whitespace-nowrap overflow-hidden max-w-full">
      <span className="text-black">: </span>
      {str(v(key)) ? <span className="text-black">{str(v(key))}</span> : null}
      <span className="text-red-600 italic">{DOTS_C}</span>
    </span>
  )
  const lanjutDots = () => (
    <span className="block whitespace-nowrap overflow-hidden max-w-full">
      <span className="text-black">{'\u00A0\u00A0'}</span>
      <span className="text-red-600 italic">{DOTS_C}</span>
    </span>
  )

  return (
    <div className="lembar-dok text-[11pt] leading-snug text-black">
      <div className="text-center">LEMBAR PENCATATAN PERTANYAAN/KRITIK/SARAN</div>
      <div className="text-center text-[14pt]">{str(v('judulDana'))}</div>
      <div className="text-center font-bold">{str(v('namaSekolahKet'))}</div>
      <div className="text-center font-bold text-[12pt] border-b border-black pb-1 mb-3">
        {str(v('periode'))}
      </div>

      {/* Isi + stempel NIHIL + garis diagonal (sumber: PNG rot -43.3° +
          connector accent2 #ED7D31). Selalu tampil seperti file sumber. */}
      <div className="relative">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '4%' }} />
          <col style={{ width: '35%' }} />
          <col style={{ width: '33%' }} />
          <col style={{ width: '28%' }} />
        </colgroup>
        <tbody>
          {baris([tdA('1', 'a'), tdJudul('Identitas Penanya/Pemberi Saran', 'b')], 'r1')}
          {baris([tdA('', 'a'), tdB('a.\u00A0 Nama', 'b'), tdIsi(fieldDots('namaPemberi'), 'c')], 'r1a')}
          {baris([tdA('', 'a'), tdB('b.\u00A0 Alamat', 'b'), tdIsi(fieldDots('alamatPemberi'), 'c')], 'r1b')}
          {baris([tdA('', 'a'), tdB('', 'b'), tdIsi(lanjutDots(), 'c')], 'r1c')}

          {baris([tdA('2', 'a'), tdB('Tanggal Penerimaan Pertanyaan/Saran', 'b'), tdIsi(fieldDots('tglTerima'), 'c')], 'r2')}

          {baris([tdA('3', 'a'), tdJudul('Uraian Pertanyaan/Saran:', 'b')], 'r3')}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('uraianKegiatan')) : ''} dots={DOTS_B} />, `b${i}`)], `r3-${i}`))}

          {baris([tdA('4', 'a'), tdB('Penerima Pertanyaan/Saran', 'b'), tdIsi(fieldDots('penerima'), 'c')], 'r4')}

          {baris([tdA('5', 'a'), tdJudul('Tindak Lanjut Saran:', 'b')], 'r5')}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('tindakLanjut')) : ''} dots={DOTS_B} />, `b${i}`)], `r5-${i}`))}
        </tbody>
      </table>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
        {/* Urutan cat persis grup sumber (pic dulu, connector di atas):
            putih PNG transparan via multiply, garis di atas gambar. */}
        {/* Sprint 023-rev25 (perintah user): NIHIL TEPAT di tengah garis. */}
        <img src="/stempel-nihil.png" alt="" className="absolute w-[72%] mix-blend-multiply" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-43.3deg)' }} />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="-22.7" y1="118.7" x2="122.7" y2="-18.7" stroke="#ED7D31" strokeWidth="0.25" />
        </svg>
      </div>
      </div>

      {/* Footer kanan 10pt */}
      <div className="w-1/2 ml-auto mt-6 text-[10pt] break-inside-avoid">
        <div>{str(v('tempatTtd'))}</div>
        <div>MELAPORKAN:</div>
        <div>Kepala Sekolah,</div>
        <div style={{ height: '52px' }} />
        <div className="font-bold underline">{str(v('namaMelaporkan'))}</div>
        <div>{str(v('nipMelaporkan')) ? `NIP. ${str(v('nipMelaporkan'))}` : ''}</div>
      </div>
    </div>
  )
}
