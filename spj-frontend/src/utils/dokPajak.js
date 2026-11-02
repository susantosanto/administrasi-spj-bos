/**
 * dokPajak — LAPORAN RINCIAN PAJAK (builder murni, tanpa React).
 * Source: template/Contoh template Rincian Pajak Sekolah Dasar Negeri.xlsx
 * (sheet "SD_SMP", A4 landscape, 16 kolom A..P).
 *
 * Aturan terkunci (sprint-014 REQUIREMENTS A1-A7):
 * - Baris = transaksi BKU bertipe SETOR_PAJAK / PAJAK_BUNGA dengan pengeluaran > 0
 *   (pajak yang DIBAYAR sekolah; PUNGUT_PPH = penerimaan → tidak masuk).
 * - Nilai pajak = tx.pengeluaran APA ADA (tidak dihitung ulang).
 * - Kolom jenis pajak (PPh 21/22/23/PPN) TIDAK dipilih otomatis — manusia yang
 *   menentukan (A4). Sebelum dipilih, kolom pajak kosong; Total tetap tampil.
 * - TANGGAL BAYAR otomatis dari tx.tanggal (tanggal setoran di BKU), manual menang.
 * - NTPN / Tanggal NTPN / Kode Billing / Keterangan = manual semata.
 * - Kunci baris manual: tanggalISO|uraian|pengeluaran|noBukti (stabil walau BKU berubah).
 */
import { BULAN_ID } from './dokKas'

export const PAJAK_TIPE = ['SETOR_PAJAK', 'PAJAK_BUNGA']
export const JENIS_PAJAK = ['PPh 21', 'PPh 22', 'PPh 23', 'PPN']

/** Deteksi jenis pajak dari uraian BKU (teks bebas).
 *  Contoh: "Setor PPh 21 atas honor" → "PPh 21"
 *           "Setor PPN atas pembelian" → "PPN"
 *  Return kosong bila tidak terdeteksi. */
export function deteksiJenisPajak(uraian = '') {
  const u = String(uraian).toLowerCase()
  if (u.includes('pph 21') || u.includes('pph21')) return 'PPh 21'
  if (u.includes('pph 22') || u.includes('pph22')) return 'PPh 22'
  if (u.includes('pph 23') || u.includes('pph23')) return 'PPh 23'
  if (u.includes('ppn')) return 'PPN'
  return ''
}

/** Kunci stabil baris (dipakai UI editor + storage spj_pajak_manual). */
export function kunciBarisPajak(tx) {
  return `${tx?.tanggalISO || ''}|${tx?.uraian || ''}|${Number(tx?.pengeluaran) || 0}|${tx?.noBukti || ''}`
}

/**
 * Transaksi BKU → baris laporan (sudah urut bulan → tanggal).
 * @param {Array} transactions transaksi BKU mentah
 * @param {Object} manual peta kunciBarisPajak → { jenis, tglBayar, tglNtpn, ntpn, kodeBilling, keterangan }
 * @param {Object} opts { namaSekolah, jenjang }
 */
export function barisPajakDariBku(transactions = [], manual = {}, opts = {}) {
  const namaSekolah = opts.namaSekolah || ''
  const rows = [...(transactions || [])]
    .filter((t) => PAJAK_TIPE.includes(t?.tipe) && Number(t?.pengeluaran) > 0)
    .sort((a, b) => (Number(a.bulan) || 0) - (Number(b.bulan) || 0)
      || String(a.tanggalISO || '').localeCompare(String(b.tanggalISO || '')))
    .map((tx, i) => {
      const key = kunciBarisPajak(tx)
      const m = manual[key] || {}
      const nilai = Number(tx.pengeluaran) || 0
      // Prioritas: manual (dari Laporan Rincian Pajak) > jenisPajak (dari BKU) > deteksi uraian > kosong
      const jenisManual = JENIS_PAJAK.includes(m.jenis) ? m.jenis : ''
      const jenisBku = JENIS_PAJAK.includes(tx.jenisPajak) ? tx.jenisPajak : ''
      const jenisUraian = deteksiJenisPajak(tx.uraian)
      const jenis = jenisManual || jenisBku || jenisUraian || ''
      const kolom = (j) => (jenis === j ? nilai : 0)
      return {
        key,
        no: i + 1,
        namaSekolah,
        jenjang: opts.jenjang || '',
        bulan: BULAN_ID[(Number(tx.bulan) || 1) - 1] || '',
        uraian: tx.uraian || '',
        nilai,
        jenis,
        pph21: kolom('PPh 21'),
        pph22: kolom('PPh 22'),
        pph23: kolom('PPh 23'),
        ppn: kolom('PPN'),
        total: nilai,
        // TANGGAL BAYAR: otomatis dari BKU, ketikan user menang (A4 + keputusan 2026-10-19).
        tglBayar: String(m.tglBayar ?? '').trim() !== '' ? String(m.tglBayar) : (tx.tanggalISO || ''),
        tglNtpn: m.tglNtpn || '',
        ntpn: m.ntpn || '',
        kodeBilling: m.kodeBilling || '',
        keterangan: m.keterangan || '',
        // Untuk editor layar (read-only dari BKU):
        _tipe: tx.tipe || '',
        _noBukti: tx.noBukti || '',
        _tanggalISO: tx.tanggalISO || '',
        _kodeKegiatan: tx.kodeKegiatan || '',
      }
    })
  return rows
}

/** Tahun judul "TA <tahun>": ketikan form menang; else tahun transaksi tertinggi. */
export function tahunPajak(rows = [], tahunForm = '') {
  const tf = String(tahunForm ?? '').trim()
  if (tf) return tf
  const years = (rows || [])
    .map((r) => parseInt(String(r._tanggalISO || '').slice(0, 4), 10))
    .filter((y) => Number.isFinite(y))
  return years.length > 0 ? String(Math.max(...years)) : ''
}

/** Total per kolom pajak + Total (dipakai baris Total cetak). */
export function totalKolomPajak(rows = []) {
  const sum = (k) => (rows || []).reduce((s, r) => s + (Number(r[k]) || 0), 0)
  return {
    pph21: sum('pph21'), pph22: sum('pph22'), pph23: sum('pph23'), ppn: sum('ppn'),
    total: sum('total'),
  }
}

export default { PAJAK_TIPE, JENIS_PAJAK, kunciBarisPajak, barisPajakDariBku, tahunPajak, totalKolomPajak }
