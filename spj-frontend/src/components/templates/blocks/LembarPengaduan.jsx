/**
 * LembarPengaduan — LEMBAR PENCATATAN PENGADUAN MASYARAKAT (blok CETAK MURNI)
 * Source: template/Contoh Template App_Register-BA Kas.xlsx
 *         (sheet "Lbr. Pengaduan Masyarakat", print area A1:D56, A4 portrait)
 *
 * Layout = TABEL 4 kolom persis sumber (A:nomor ~3% · B:label ~30% ·
 * C+D:isian ~67%), table-fixed + nowrap-clip seperti overflow Excel.
 * Titik-titik = TEKS sumber (~113 kolom C, ~179 baris penuh) — MERAH
 * (perintah user). TANPA teks placeholder "[...]": dokumen tangan murni.
 * Tinggi baris isi 21pt, font 11pt (judulhdana/sekolah/periode ikut sumber:
 * polos/polos/bold 11pt + periode 12pt polos bergaris bawah).
 * Footer kanan 10pt: tempat-tanggal · MELAPORKAN: · Kepala Sekolah, ·
 * nama bold+garis bawah · NIP.
 */
const DOTS_C = `.${'.'.repeat(112)}`
const DOTS_B = `.${'.'.repeat(178)}`

/** Sel titik-titik merah (nowrap + clip). value lama (bila ada) hitam di depan. */
function Merah({ value, dots }) {
  return (
    <span className="block whitespace-nowrap overflow-hidden max-w-full">
      {value ? <span className="text-black">{value}</span> : null}
      <span className="text-red-600 italic">{dots}</span>
    </span>
  )
}

export default function LembarPengaduan({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const str = (value) => (value !== '' && value != null ? String(value) : '')

  const tdA = (anak, kunci) => (
    <td key={kunci} className="w-[3%] align-middle text-[11pt] text-black">{anak}</td>
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
    <tr key={kunci} className="h-[28px]">{sel}</tr>
  )

  // ": titik" satu baris (kolom C) · baris lanjutan (2 spasi + titik).
  // Sprint 023-rev20 (perintah user): titik MERAH + MIRING (italic).
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
  const penuhDots = () => <Merah dots={DOTS_B} />

  return (
    <div className="lembar-dok text-[11pt] leading-snug text-black">
      <div className="text-center">LEMBAR PENCATATAN PENGADUAN MASYARAKAT</div>
      <div className="text-center">{str(v('judulDana'))}</div>
      <div className="text-center font-bold">{str(v('namaSekolahKet'))}</div>
      <div className="text-center text-[12pt] border-b border-black pb-1 mb-3">
        {str(v('periode'))}
      </div>

      {/* Isi + stempel NIHIL + garis diagonal (grup B8:D42 sumber:
          PNG rot -50.4° + connector accent2 #ED7D31 pojok-atas-kanan →
          bawah-kiri). Selalu tampil seperti file sumber. */}
      <div className="relative">
      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '3%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '39%' }} />
          <col style={{ width: '28%' }} />
        </colgroup>
        <tbody>
          {baris([tdA('1', 'a'), tdJudul('Identitas Pengadu', 'b')], 'r1')}
          {baris([tdA('', 'a'), tdB('a.\u00A0 Nama', 'b'), tdIsi(fieldDots('namaPengadu'), 'c')], 'r1a')}
          {baris([tdA('', 'a'), tdB('b.\u00A0 Alamat', 'b'), tdIsi(fieldDots('alamatPengadu'), 'c')], 'r1b')}
          {baris([tdA('', 'a'), tdB('', 'b'), tdIsi(lanjutDots(), 'c')], 'r1c')}

          {baris([tdA('2', 'a'), tdB('Tanggal Terima Pengaduan', 'b'), tdIsi(fieldDots('tglTerima'), 'c')], 'r2')}

          {baris([tdA('3', 'a'), tdJudul('Lokasi Kejadian', 'b')], 'r3')}
          {baris([tdA('', 'a'), tdB('a.\u00A0 RT/RW/Dusun', 'b'), tdIsi(fieldDots('lokasiRtRw'), 'c')], 'r3a')}
          {baris([tdA('', 'a'), tdB('b.\u00A0 Kelurahan', 'b'), tdIsi(fieldDots('lokasiKelurahan'), 'c')], 'r3b')}
          {baris([tdA('', 'a'), tdB('c.\u00A0 Kabupaten/Kota', 'b'), tdIsi(fieldDots('lokasiKabupaten'), 'c')], 'r3c')}
          {baris([tdA('', 'a'), tdB('d.\u00A0 Provinsi', 'b'), tdIsi(fieldDots('lokasiProvinsi'), 'c')], 'r3d')}

          {baris([tdA('4', 'a'), tdJudul('Uraian Pengaduan:', 'b')], 'r4')}
          {[0, 1, 2, 3].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('uraianKegiatan')) : ''} dots={DOTS_B} />, `b${i}`)], `r4-${i}`))}

          {baris([tdA('5', 'a'), tdB('Tanggal Penyelidikan Dilakukan', 'b'), tdIsi(fieldDots('tglSelidik'), 'c')], 'r5')}
          {baris([tdA('6', 'a'), tdB('Penyelidik', 'b'), tdIsi(fieldDots('penyelidik'), 'c')], 'r6')}

          {baris([tdA('7', 'a'), tdJudul('Temuan:', 'b')], 'r7')}
          {[0, 1, 2, 3].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('temuan')) : ''} dots={DOTS_B} />, `b${i}`)], `r7-${i}`))}

          {baris([tdA('8', 'a'), tdJudul('Keputusan/Rekomendasi:', 'b')], 'r8')}
          {[0, 1, 2].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('keputusan')) : ''} dots={DOTS_B} />, `b${i}`)], `r8-${i}`))}

          {baris([tdA('9', 'a'), tdJudul('Pelaksanaan Keputusan', 'b')], 'r9')}
          {[0, 1, 2].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('pelaksanaan')) : ''} dots={DOTS_B} />, `b${i}`)], `r9-${i}`))}

          {baris([tdA('10', 'a'), tdJudul('Tanggal pemberitahuan kepada Pengadu tentang keputusan/dan pelaksanaan keputusan :', 'b')], 'r10')}
          {baris([tdA('', 'a'), tdJudul(<Merah value={str(v('tglPemberitahuan'))} dots={DOTS_B} />, 'b')], 'r10b')}

          {baris([tdA('11', 'a'), tdJudul('Dokumen yang diterima:', 'b')], 'r11')}
          {[0, 1, 2].map((i) => baris([tdA('', `a${i}`), tdJudul(<Merah value={i === 0 ? str(v('dokumenDiterima')) : ''} dots={DOTS_B} />, `b${i}`)], `r11-${i}`))}
        </tbody>
      </table>
      {/* Sprint 023-rev27 (perintah user): posisi grup B8:D42 sumber —
          overlay inset kiri 3.4% (kolom A), BUKAN full-width seperti Kritik
          (garisnya A10:D32 full-width). Garis tetap sejajar + setengah NIHIL. */}
      <div className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{ left: '3.4%', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} aria-hidden="true">
        {/* Urutan cat persis grup sumber (pic dulu, connector di atas):
            putih PNG transparan via multiply, garis di atas gambar. */}
        {/* Sprint 023-rev25 (perintah user): NIHIL TEPAT di tengah garis —
            pusat overlay (garis pojok-ke-pojok selalu lewat titik ini). */}
        <img src="/stempel-nihil.png" alt="" className="absolute w-[72%] mix-blend-multiply" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%) rotate(-50.4deg)' }} />
        <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <line x1="-13.7" y1="127.1" x2="113.7" y2="-27.1" stroke="#ED7D31" strokeWidth="0.25" />
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
