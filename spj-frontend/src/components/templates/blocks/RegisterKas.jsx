/**
 * RegisterKas — REGISTER PENUTUPAN KAS (blok CETAK MURNI, tanpa input)
 * Source: template/Template Register Kas Contoh.xlsx (sheet "Register_Kas",
 * print area A1:I48, A4 portrait, gridlines Excel OFF)
 *
 * ⚠️ TEMUAN USER 2026-10-19: "untuk dokumen register kas saya tidak ingin
 *    menggunakan garis tabel" — TAMPILAN LAMA ber-GRID ABU-ABU PENUH karena
 *    aturan global `.template-engine th, .template-engine td { border: 1px
 *    solid #d1d5db }` (index.css) menyentuh SETIAP sel. File sumber TIDAK
 *    punya grid: gridlines Excel OFF, cuma garis TITIK (border dotted) pada
 *    kolom LEMBAR/KEPING (E:F) dan JUMLAH (H) baris pecahan. Solusi: kelas
 *    `kas-tabel` di dua tabel di bawah + reset border di index.css; garis
 *    titik tetap inline (menang atas reset).
 *
 * Ekstraksi sumber (openpyxl) yang DITIRU:
 * - Kolom B..H (lebar 3,14/22,14/17,0/2,57/5,86/16,86/24,43 dari 91,92):
 *   7 baris label/value (B7..B13): label kolom B (B12:D12/B13:D13 merged),
 *   ":" kolom E (SEMUA 7 baris), nilai merge F:H (baris teks 7-9) /
 *   F:G (baris uang 10-13).
 * - "Sado Kas B terdiri dari :" (C15) — ejaan sumber, dibiarkan.
 * - DAFTAR PECAHAN = 11 baris TANPA GRID, hanya garis titik:
 *     1. Lembaran uang kertas (7 pecahan 100.000..1.000) + "Sub Jumlah (1)"
 *     2. Keping uang logam (4 pecahan 1.000..100)   + "Sub Jumlah (2)"
 *     3. Saldo Bank, Surat Berharga, dll.           + "Sub Jumlah (3)"
 *   tiap baris pecahan: garis bawah putus-putus di kolom LEMBAR/KEPING
 *   (E:F sumber) dan kolom JUMLAH (H sumber); baris ke-2+ juga garis ATAS
 *   di E:F. Baris Sub Jumlah/Jumlah/Perbedaan POLOS (tanpa garis).
 *   Jumlah ( 1 + 2 + 3 ) · Perbedaan (A - B) · Penjelasan Perbedaan (italic)
 *   Tanggal : <tanggal penutupan> · TTD 2 kolom.
 * - Money: "Rp 82.560.000,-" (kolom nominal) dan "Rp 0" (kolom subtotal).
 *
 * ⚠️ Regresi nilai (temuan user 2026-10-18 ronde-3): Sub Jumlah (1) dan (2)
 *    dulu SELALU cetak "Rp 0" — builder mengirim string SUDAH terformat
 *    ("Rp 300.000") lalu komponen memformatnya LAGI lewat rp() →
 *    Number("Rp 300.000") = NaN → 0. Sub-jumlah kini memakai string apa ada
 *    (subKertasValue/subLogamValue), rp() hanya untuk nilai numerik mentah.
 *
 * Font: keputusan user 2026-10-18 = IKUT FONT APLIKASI; ukuran dipertahankan
 * lewat satuan pt agar proporsi sama dengan sumber.
 */
import { PlaceholderText } from '../../../utils/templateHelpers'

// Lebar kolom B..H sumber (COL_WIDTH B..H = 3,14/22,14/17,0/2,57/5,86/16,86/
// 24,43 dari total 91,92) → persen untuk <colgroup> + table-fixed.
// Kolom E+F (2,57+5,86) DIPISAH (bukan digabung) supaya ":" kolom E dan nilai
// F:H/F:G bisa di-merge persis sumber; kolom count pecahan pakai colSpan 2.
const COLS = ['3.5%', '24%', '18.5%', '3%', '6.5%', '18.5%', '26%']

const NOMINAL_KERTAS = [100000, 50000, 20000, 10000, 5000, 2000, 1000]
const NOMINAL_LOGAM = [1000, 500, 200, 100]

/** "Rp 82.560.000,-" (format kolom nominal sumber) / "Rp 0" (format subtotal). */
const rpMinus = (v) => `Rp ${(Number(v) || 0).toLocaleString('id-ID')},-`
const rp = (v) => `Rp ${(Number(v) || 0).toLocaleString('id-ID')}`

/** Garis putus-putus sumber (border dotted 1px, hitam) — inline MENANG atas
 *  reset `border: 0` milik .kas-tabel (lihat index.css). */
const GARIS = { borderBottom: '1px dotted #000' }
const GARIS_ATAS_BAWAH = { borderTop: '1px dotted #000', borderBottom: '1px dotted #000' }

export default function RegisterKas({ blockConfig, data = {} }) {
  const v = (key) => data[key] ?? ''
  const isi = (value, label) => (value !== '' && value != null
    ? <span>{value}</span>
    : <PlaceholderText label={label} />)

  const rows = Array.isArray(data.rows) ? data.rows : []
  const cari = (jenis, nominal) => rows.find((r) => r.jenis === jenis && Number(r.nominal) === Number(nominal))
  const jumlah = (jenis) => rows
    .filter((r) => r.jenis === jenis)
    .reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)

  const subKertas = data.subKertas ?? jumlah('Kertas')
  const subLogam = data.subLogam ?? jumlah('Logam')

  // Sumber: kolom E (lembar/keping) garis bawah putus-putus; kolom H (jumlah)
  // garis bawah putus-putus. Baris ke-2+ di sebuah seksi juga garis ATAS di E.
  const barisPecahan = (no, label, nominal, jenis, satuan, garisPertama) => {
    const r = cari(jenis, nominal) || {}
    return (
      <tr key={`${jenis}-${nominal}`}>
        <td className="align-middle">{no}</td>
        <td className="align-middle">{label}</td>
        <td className="align-middle whitespace-nowrap">{rpMinus(nominal)}</td>
        {/* E:F — kolom lembar/keping (colSpan 2 persis merge E16:F16 sumber) */}
        <td colSpan={2} className="align-middle text-center kas-isi" style={garisPertama ? GARIS : GARIS_ATAS_BAWAH}>
          {Number(r.lembar) || 0}
        </td>
        <td className="align-middle text-center">{satuan}</td>
        <td className="align-middle text-right kas-isi" style={GARIS}>
          {rp(Number(nominal) * (Number(r.lembar) || 0))}
        </td>
      </tr>
    )
  }

  const barisSub = (label, value) => (
    <tr key={label}>
      <td colSpan={4} />
      <td colSpan={2} className="align-middle text-right font-bold">{label}</td>
      <td className="align-middle text-right font-bold whitespace-nowrap">{value}</td>
    </tr>
  )

  // Label/value 7 baris atas: label B..D (colSpan 3 — B terlalu sempit, sumber
  // mengandalkan overflow Excel), ":" kolom E (SEMUA baris), nilai F:H (teks,
  // colSpan 3) atau F:G (uang, colSpan 2 + H kosong) persis merge sumber.
  const barisLabel = (label, value, { bold = false, labelKanan = false, nilaiTeks = false } = {}) => (
    <tr key={label}>
      <td colSpan={3} className={`align-middle ${labelKanan ? 'text-right' : ''} ${bold ? 'font-bold' : ''} whitespace-nowrap`}>{label}</td>
      <td className="align-middle text-center">:</td>
      {nilaiTeks
        ? <td colSpan={3} className="align-middle whitespace-nowrap">{isi(value, label)}</td>
        : (
          <>
            <td colSpan={2} className={`align-middle whitespace-nowrap ${bold ? 'font-bold text-center' : ''}`}>
              {bold ? value : isi(value, label)}
            </td>
            <td />
          </>
        )}
    </tr>
  )

  return (
    <div className="kas-dok text-[9pt] leading-snug text-black">
      {/* Judul (B3:H3 · B4:H4 · B5:H5) */}
      <div className="text-center font-bold text-[11pt]">REGISTER PENUTUPAN KAS</div>
      <div className="text-center font-bold text-[11pt]">{isi(v('jenisDana'), 'Jenis dana')}</div>
      <div className="text-center font-bold text-[9pt] mb-3">{isi(v('periode'), 'Periode')}</div>

      <table className="kas-tabel w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {COLS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <tbody>
          {barisLabel('Tanggal Penutupan Kas', v('tglTutup'), { nilaiTeks: true })}
          {barisLabel('Nama Penutup Kas (Pemegang kas)', v('namaPenutup'), { nilaiTeks: true })}
          {barisLabel('Tanggal penutupan Kas yang lalu', v('tglLalu'), { nilaiTeks: true })}
          {barisLabel('Jumlah Total Penerimaan (D)', v('totalPenerimaan'))}
          {barisLabel('Jumlah Total Pengeluaran (K)', v('totalPengeluaran'))}
          {barisLabel('Saldo Buku (A = D - K)', v('saldoBuku'), { bold: true, labelKanan: true })}
          {barisLabel('Saldo Kas ( B )', v('saldoKas'), { bold: true, labelKanan: true })}
        </tbody>
      </table>

      <div className="mt-2 mb-1">Sado Kas B terdiri dari :</div>

      <table className="kas-tabel w-full border-collapse" style={{ tableLayout: 'fixed' }}>
        <colgroup>
          {COLS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <tbody>
          {/* 1. Lembaran uang kertas (D16:D22) */}
          {NOMINAL_KERTAS.map((n, i) => barisPecahan(i === 0 ? '1.' : '', 'Lembaran uang kertas', n, 'Kertas', 'Lembar', i === 0))}
          {/* Sub Jumlah (1): string terformat dari builder (lihat catatan regresi). */}
          {barisSub('Sub Jumlah (1)', data.subKertasValue ?? rp(subKertas))}
          <tr><td colSpan={7} className="h-2" /></tr>

          {/* 2. Keping uang logam (D25:D28) */}
          {NOMINAL_LOGAM.map((n, i) => barisPecahan(i === 0 ? '2.' : '', 'Keping uang logam', n, 'Logam', 'Keping', i === 0))}
          {barisSub('Sub Jumlah (2)', data.subLogamValue ?? rp(subLogam))}
          <tr><td colSpan={7} className="h-2" /></tr>

          {/* 3. Saldo Bank, Surat Berharga, dll. (B31/C31/F31/H31) */}
          <tr>
            <td className="align-middle">3.</td>
            <td className="align-middle">Saldo Bank, Surat Berharga, dll.</td>
            <td colSpan={2} />
            <td colSpan={2} className="align-middle text-right font-bold">Sub Jumlah (3)</td>
            <td className="align-middle text-right font-bold whitespace-nowrap">{isi(v('saldoBank'), 'Sub Jumlah (3)')}</td>
          </tr>
          <tr><td colSpan={7} className="h-2" /></tr>

          {/* Jumlah ( 1 + 2 + 3 ) (F33/H33) */}
          {barisSub('Jumlah ( 1 + 2 + 3 )', isi(v('jumlahTotal'), 'Jumlah ( 1 + 2 + 3 )'))}
          <tr><td colSpan={7} className="h-2" /></tr>

          {/* Perbedaan (A - B) — sumber: label C35, nilai H35 (kolom terakhir). */}
          <tr>
            <td />
            <td className="align-middle font-bold">Perbedaan (A - B)</td>
            <td colSpan={4} />
            <td className="align-middle font-bold whitespace-nowrap">{isi(v('perbedaan'), 'Perbedaan (A - B)')}</td>
          </tr>
        </tbody>
      </table>

      {/* Penjelasan Perbedaan (italic, C37/D37) */}
      <div className="mt-2">
        <div>Penjelasan Perbedaan</div>
        <div className="italic">{isi(v('penjelasanPerbedaan'), 'Penjelasan perbedaan')}</div>
      </div>

      {/* Tanggal : (H39) */}
      <div className="mt-3 flex justify-end gap-1">
        <span className="font-bold">Tanggal :</span>
        <span>{isi(v('tanggalTtd'), 'Tanggal')}</span>
      </div>

      {/* TTD 2 kolom (C40:C48 · H40:H48) */}
      <div className="grid grid-cols-2 gap-6 mt-1 break-inside-avoid">
        <div>
          <div>Yang diperiksa,</div>
          <div>Bendahara/Pemegang Kas,</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(v('namaDiperiksa'), 'Nama bendahara')}</div>
          <div>{v('nipDiperiksa') ? `NIP. ${v('nipDiperiksa')}` : ''}</div>
        </div>
        <div>
          <div>Yang memeriksa</div>
          <div>Kepala Sekolah,</div>
          <div style={{ height: '46px' }} />
          <div className="font-bold">{isi(v('namaMemeriksa'), 'Nama kepala sekolah')}</div>
          <div>{v('nipMemeriksa') ? `NIP. ${v('nipMemeriksa')}` : ''}</div>
        </div>
      </div>
    </div>
  )
}
