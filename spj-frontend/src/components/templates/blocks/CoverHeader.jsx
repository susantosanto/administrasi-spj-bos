/**
 * CoverHeader — Sampul + Sekat bendel LPJ (blok CETAK MURNI)
 * Source: template/Contoh template COVER.pdf (A4 LANDSCAPE 841,92 x 595,32 pt)
 *
 * Geometri hasil ekstraksi content stream PDF (bukan perkiraan, y dari bawah):
 *   "RENCANA KEGIATAN DAN ANGGARAN SEKOLAH (RKAS)" Bold 20,04pt  baseline y=527
 *   "BANTUAN OPERASIONAL SATUAN PENDIDIKAN (BOSP)"  Bold 23,04pt     y=497,6
 *   "PERENCANAAN BERBASIS DATA (PBD)"                Bold 18pt #00b050 y=471,9
 *   "TAHUN ANGGARAN 2026"                             Bold 20,04pt     y=446,3
 *   logo dinas (gambar 311x291 px) → rect 114,72x110,22pt di (373,65, 280,78)
 *   BAR nama sekolah: fill #002060, rect (97,824, 189,17) 666,55x35,64 pt,
 *                     teks putih Bold 30,96pt
 *   "KECAMATAN CIKALONGWETAN" reguler (bukan bold) 18pt, y=168,3
 *   Footer (bold, tengah): "PEMERINTAH KABUPATEN BANDUNG BARAT" 12pt y=101,8,
 *                          "DINAS PENDIDIKAN" 12pt y=85,9, "2026" 14pt y=63,4
 *
 * Keputusan user 2026-10-18:
 *   - FONT DOKUMEN = FONT APLIKASI (tidak lagi Arial paksa).
 *   - Baris PBD **HIJAU #00b050** persis contoh (pengecualian BLUE-ONLY,
 *     dicatat di DECISIONS.MD).
 *   - Varian SEKAT: landscape seperti cover, TAPI hanya logo dinas + judul sekat
 *     + BAR nama bulan + keterangan sekat. Bar SEKAT memakai BENTUK & WARNA
 *     yang SAMA PERSIS dengan bar cover (#002060, lebar 235,6mm, teks putih
 *     bold 31pt) — permintaan user 2026-10-18 (dulu #004ac6 + padding sendiri).
 *     Tidak ada blok nama sekolah/kabupaten di sekat.
 */
import storageHelper from '../../../utils/storageHelper'

const JUDUL_1 = 'RENCANA KEGIATAN DAN ANGGARAN SEKOLAH (RKAS)'
const JUDUL_2 = 'BANTUAN OPERASIONAL SATUAN PENDIDIKAN (BOSP)'
const JUDUL_3 = 'PERENCANAAN BERBASIS DATA (PBD)'
const BAR_SEKOLAH = '#002060'

/**
 * Bentuk bar #002060 PERSIS SAMA untuk cover & sekat (temuan user 2026-10-18:
 * "warna biru di dokumen sekat tidak sama dengan warna biru di dokumen cover,
 * serta bentuk warna biru nya di dokumen sekat juga tidak sama" → dulu sekat
 * memakai #004ac6 lebih terang dengan padding/min-width sendiri).
 * Geometri dari content stream COVER.pdf: rect 97,824,189,17 666,55x35,64 pt
 * = lebar 235,6mm, tinggi 12,6mm, teks putih bold ~31pt.
 */
const BAR_GAYA = {
  backgroundColor: BAR_SEKOLAH,
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: '31pt',
  lineHeight: '35.64pt',
  width: '235.6mm',
  maxWidth: '100%',
  letterSpacing: '0.5pt',
}

export default function CoverHeader({ blockConfig, data = {} }) {
  const varian = blockConfig.varian || 'cover'
  const logoDinas = storageHelper.get('logo_dinas', null) || '/logo-dinas.png'
  const v = (key) => data[key] ?? ''

  // ─── Varian SEKAT (landscape): logo dinas + judul + bar biru bulan + keterangan ───
  if (varian === 'sekat') {
    // Builder sudah menyiapkan "BULAN JANUARI" — jangan tambah prefix lagi
    // (bug lama: cetak "BULAN BULAN JANUARI").
    const bulan = v('bulanSekat') || v('bulan') || ''
    return (
      <div className="cover-sekat flex flex-col items-center justify-center text-center text-black min-h-[170mm]">
        {logoDinas && (
          <img src={logoDinas} alt="Logo Dinas" className="w-[40mm] h-[39mm] object-contain" />
        )}
        <div className="text-[18pt] font-bold tracking-widest mt-10">
          {blockConfig.judulSekat || v('judulSekat') || 'SEKAT DOKUMEN'}
        </div>
        {/* Bar biru nama bulan — BENTUK & WARNA sama persis dengan bar cover
            (BAR_GAYA). Kelas bar-navy dipakai CSS print untuk mengalahkan
            aturan print-hitam (.sk-print-area * background transparent). */}
        <div className="bar-navy" style={{ ...BAR_GAYA, marginTop: '12mm' }}>
          {bulan ? String(bulan).toUpperCase() : 'BULAN'}
        </div>
        <div className="text-[13pt] mt-10">{v('keteranganSekat')}</div>
      </div>
    )
  }

  // ─── Varian COVER: meniru Contoh template COVER.pdf, font aplikasi ───
  return (
    <div className="cover-dok flex flex-col items-center text-center text-black">
      <div className="text-[20pt] font-bold leading-tight mt-[16mm]">
        {v('judulBaris1') || JUDUL_1}
      </div>
      <div className="text-[23pt] font-bold leading-tight">
        {v('judulBaris2') || JUDUL_2}
      </div>
      {/* Hijau #00b050 — pengecualian BLUE-ONLY, disetujui user 2026-10-18.
          kelas bar-pbd: lihat @media print index.css (warna dokumen, bukan dekorasi). */}
      <div className="bar-pbd text-[18pt] font-bold leading-tight" style={{ color: '#00b050' }}>
        {v('judulBaris3') || JUDUL_3}
      </div>
      <div className="text-[20pt] font-bold leading-tight">
        {v('judulTahun') || `TAHUN ANGGARAN ${v('tahunCover') || ''}`.trim()}
      </div>

      {logoDinas && (
        <img
          src={logoDinas}
          alt="Logo Dinas"
          className="w-[40mm] h-[39mm] object-contain mt-[10mm]"
        />
      )}

      {/* Bar nama sekolah: #002060, lebar 235,6mm (666,55pt), tinggi 12,6mm (35,64pt).
          kelas bar-navy: lihat @media print index.css — aturan print-hitam
          (.sk-print-area * background transparent) WAJIB dimenangkan untuk
          elemen ini, kalau tidak bar hilang saat cetak (temuan user 2026-10-18). */}
      <div className="bar-navy" style={{ ...BAR_GAYA, marginTop: '8mm' }}>
        {v('namaSekolah')}
      </div>
      {/* Kecamatan: reguler (bukan bold), 18pt */}
      <div className="text-[18pt] mt-[2mm]">
        {v('kecamatan') ? `KECAMATAN ${String(v('kecamatan')).toUpperCase()}` : ''}
      </div>

      <div className="mt-[14mm] text-[12pt] font-bold leading-relaxed">
        <div>{v('barisPemda')}</div>
        <div>{v('barisDinas') || 'DINAS PENDIDIKAN'}</div>
        <div className="text-[14pt] mt-[1mm]">{v('tahunCover')}</div>
      </div>
    </div>
  )
}
