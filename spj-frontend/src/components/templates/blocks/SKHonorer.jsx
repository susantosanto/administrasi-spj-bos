/**
 * SKHonorer — Surat Perjanjian Kerja Guru Honorer
 * Layout mengikuti template/sk-honorer.html
 *
 * - KOP: logo + teks (PEMERINTAH KABUPATEN BANDUNG BARAT / NAMA SEKOLAH / DINAS PENDIDIKAN / alamat)
 * - Garis kop dobel (tebal + tipis)
 * - Judul + Nomor + ANTARA / instansi / DENGAN / GURU HONORER
 * - PIHAK numbered 1. dan 2. dengan layout label : value
 * - Pasal heading center bold (uppercase)
 * - Item bernomor "1." dengan hanging indent; sub-item huruf "a."
 * - Tanda tangan di kanan info (mode print)
 */
import { getSchoolData, getKepalaSekolah } from '../../../utils/sekolahData'
import { DEFAULT_PASAL, renderPasalText } from '../../../data/skPasal'

// ─── Editable inline field ─────────────────────────────────────────────
function F({ value, onChange, placeholder, missing }) {
  if (onChange) {
    return (
      <input
        type="text"
        className="border-b border-dashed border-primary/30 outline-none bg-transparent"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    )
  }
  return (
    <span className={missing ? 'sk-missing-field' : undefined}>
      {value || placeholder || '_______'}
    </span>
  )
}

// ─── Main Component ────────────────────────────────────────────────────
export default function SKHonorer({ data = {}, onChange, mode, highlightEmpty }) {
  const sekolah = getSchoolData()
  const ks = getKepalaSekolah()
  // Komponen field editable — dipanggil sebagai <E field="..." placeholder="..." />
  const E = ({ field, placeholder }) => {
    const val = data[field]
    const isMissing =
      Array.isArray(highlightEmpty) &&
      highlightEmpty.includes(field) &&
      !String(val || '').trim()
    return (
      <F
        value={val}
        onChange={mode === 'edit' ? (v) => onChange(field, v) : null}
        placeholder={placeholder}
        missing={isMissing}
      />
    )
  }

  // Item bernomor dengan hanging indent (sama dengan ol.angka pada HTML)
  const Item = ({ num, children, depth = 0 }) => (
    <div
      style={{
        position: 'relative',
        paddingLeft: `${2 + depth * 1.8}em`,
        textIndent: '-1.7em',
        textAlign: 'justify',
        marginBottom: '4px',
      }}
    >
      {num}. {children}
    </div>
  )

  const PasalHead = ({ no, nama }) => (
    <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '8px' }}>
      <div>{no}</div>
      <div style={{ textTransform: 'uppercase' }}>{nama}</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Times New Roman', Times, serif", fontSize: '12px', lineHeight: '1.5' }}>

      {/* KOP SURAT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: '0 0 64px', textAlign: 'center' }}>
          {/* Placeholder logo — ganti dengan logo sekolah */}
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: 60, height: 60 }}>
            <path d="M50 4 L90 17 V50 C90 75 72 91 50 97 C28 91 10 75 10 50 V17 Z"
              fill="#fdfdfd" stroke="#333" strokeWidth="2.5" />
            <text x="50" y="55" textAnchor="middle" fontSize="14"
              fontFamily="Arial" fill="#555">LOGO</text>
          </svg>
        </div>
        <div style={{ flex: 1, textAlign: 'center', lineHeight: '1.25' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '.5px' }}>PEMERINTAH KABUPATEN BANDUNG BARAT</div>
          <div style={{ fontSize: '15px', fontWeight: 'bold', letterSpacing: '.5px', textTransform: 'uppercase' }}>
            {sekolah.namaSekolah || 'SD NEGERI PASIRHALANG'} KECAMATAN {sekolah.kecamatan || 'CIKALONGWETAN'}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DINAS PENDIDIKAN</div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>
            Alamat : {sekolah.alamat || 'Kp. Pasirhalang RT 03/014 Ds. Mandalamukti Kec. Cikalongwetan Kab. Bandung Barat Kode Pos : 40556'}
          </div>
        </div>
      </div>
      <div style={{ borderTop: '3.5px solid #000', borderBottom: '1.2px solid #000', height: 3, marginTop: '6px' }} />

      {/* JUDUL */}
      <div style={{ textAlign: 'center', marginTop: '18px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', textDecoration: 'underline', letterSpacing: '2px' }}>
          SURAT PERJANJIAN KERJA
        </div>
        <div style={{ marginTop: '4px' }}>
          Nomor : <E field="nomorSurat" placeholder="814.1/ SD01 - VII /2023" />
        </div>
        <div style={{ marginTop: '12px', lineHeight: '1.4' }}>
          ANTARA<br />
          <span style={{ fontWeight: 'bold' }}>
            {sekolah.namaSekolah || 'SEKOLAH DASAR NEGERI PASIRHALANG'}
          </span>
          <br />
          DENGAN<br />
          <span style={{ fontWeight: 'bold' }}>GURU HONORER</span>
        </div>
      </div>

      {/* ISI */}
      <div style={{ marginTop: '16px', textAlign: 'justify' }}>
        {/* PEMBUKAAN */}
        <p style={{ marginBottom: '8px' }}>
          Pada hari ini <b><E field="hariPelantikan" placeholder="________" /></b>
          {' '}tanggal <b><E field="tanggalPelantikan" placeholder="________" /></b>
          {' '}bulan <b><E field="bulanPelantikan" placeholder="________" /></b>
          {' '}tahun <b><E field="tahunPelantikan" placeholder="________" /></b>
          , bertempat di <E field="tempatPelantikan" placeholder="__________________" />
          {' '}Kabupaten Bandung Barat, yang bertanda tangan di bawah ini :
        </p>

        {/* PIHAK KESATU */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <div style={{ flex: '0 0 20px' }}>1.</div>
          <table style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ width: '160px' }}>Nama</td><td style={{ padding: '0 4px' }}>:</td><td><E field="namaPihakKesatu" placeholder={ks.nama || 'Yuniarti, S.Pd'} /></td></tr>
              <tr><td>Tempat, tanggal lahir</td><td style={{ padding: '0 4px' }}>:</td><td><E field="ttlPihakKesatu" placeholder="Bandung, 07 Juli 1966" /></td></tr>
              <tr><td>NIP</td><td style={{ padding: '0 4px' }}>:</td><td><E field="nipPihakKesatu" placeholder={ks.nip || '196607071986102005'} /></td></tr>
              <tr><td>Jabatan</td><td style={{ padding: '0 4px' }}>:</td><td><E field="jabatanPihakKesatu" placeholder="Kepala Sekolah" /></td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ margin: '4px 0 14px 30px', textAlign: 'justify' }}>
          Berbuat dan bertindak secara hukum untuk dan atas nama {sekolah.namaSekolah || 'SD Negeri Pasirhalang'},
          untuk selanjutnya disebut <b>PIHAK KESATU</b>.
        </div>

        {/* PIHAK KEDUA */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <div style={{ flex: '0 0 20px' }}>2.</div>
          <table style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
            <tbody>
              <tr><td style={{ width: '160px' }}>Nama</td><td style={{ padding: '0 4px' }}>:</td><td><E field="namaPihakKedua" placeholder="________" /></td></tr>
              <tr><td>Tempat, tanggal lahir</td><td style={{ padding: '0 4px' }}>:</td><td><E field="ttlPihakKedua" placeholder="________" /></td></tr>
              <tr><td>Pendidikan Terakhir</td><td style={{ padding: '0 4px' }}>:</td><td><E field="pendidikanPihakKedua" placeholder="________" /></td></tr>
              <tr><td>Alamat</td><td style={{ padding: '0 4px' }}>:</td><td><E field="alamatPihakKedua" placeholder="________" /></td></tr>
            </tbody>
          </table>
        </div>
        <div style={{ margin: '4px 0 14px 30px', textAlign: 'justify' }}>
          Berbuat dan bertindak secara hukum untuk dan atas nama pribadi untuk selanjutnya disebut <b>PIHAK KEDUA</b>.
        </div>

      {/* PRA-PASAL */}
      <p style={{ marginBottom: '8px' }}>
        Para pihak masing-masing telah mempelajari, memahami dan sepakat untuk mengikat diri dalam
        Surat Perjanjian Kerja dengan ketentuan sebagai berikut :
      </p>

      {/* PASAL — dinamis dari data.pasal (default: DEFAULT_PASAL) */}
      {(data.pasal || DEFAULT_PASAL).map((pasal, pi) => (
        <div key={pasal.id || pi} style={{ marginTop: '14px' }}>
          <PasalHead no={`Pasal ${pi + 1}`} nama={pasal.judul || 'Pasal'} />
          {pasal.pembuka ? (
            <div style={{ textAlign: 'justify', marginBottom: '4px' }}>
              {renderPasalText(pasal.pembuka, data)}
            </div>
          ) : null}
          {(() => {
            const nodes = []
            let top = 0
            let sub = 0
            ;(pasal.items || []).forEach((it) => {
              if (it.level === 0) {
                top += 1
                sub = 0
                nodes.push(
                  <Item key={it.id || `p${pi}i${top}`} num={top}>
                    {renderPasalText(it.text, data)}
                  </Item>
                )
              } else {
                sub += 1
                nodes.push(
                  <Item key={it.id || `p${pi}s${sub}`} num={String.fromCharCode(96 + sub)} depth={1}>
                    {renderPasalText(it.text, data)}
                  </Item>
                )
              }
            })
            return nodes
          })()}
        </div>
      ))}

        {/* TANDA TANGAN */}
        <table style={{ marginTop: '24px', width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', lineHeight: '1.7' }}>
                <table style={{ fontSize: '12px', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr><td style={{ width: '120px' }}>Dibuat di</td><td style={{ padding: '0 4px' }}>:</td><td><E field="tempatTtd" placeholder="Bandung Barat" /></td></tr>
                    <tr><td>Pada tanggal</td><td style={{ padding: '0 4px' }}>:</td><td><E field="tanggalTtd" placeholder="15 Juli 2025" /></td></tr>
                    <tr><td>Ditandatangani oleh</td><td style={{ padding: '0 4px' }}>:</td><td></td></tr>
                  </tbody>
                </table>
              </td>
              {mode === 'print' && (
                <td style={{ verticalAlign: 'top', textAlign: 'center', width: '45%' }}>
                  <div>Kepala {sekolah.namaSekolah || 'SDN Pasirhalang'},</div>
                  <div style={{ height: '75px' }} />
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                    {data.namaPihakKesatu || ks.nama}
                  </div>
                  <div style={{ fontSize: '10px' }}>NIP. {data.nipPihakKesatu || ks.nip}</div>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}