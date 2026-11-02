/**
 * ORACLE Sprint 016 — ringkasan BKU (`src/utils/bkuSummary.js`).
 *
 * Menguji fungsi ASLI (bukan salinan): definisi pengeluaran riil, bentuk 10 kunci,
 * dan konsistensi internal. Juga mencetak bukti bahwa TARIK_TUNAI berpasangan
 * dengan PERGESERAN_BANK (ADR §T).
 *
 * Jalankan dari spj-frontend:
 *   node test-bku-recalc-summary.mjs        -> exit 0 = semua PASS
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { redetectTypes } from './src/utils/bkuParser.js'
import { hitungRingkasan } from './src/utils/bkuSummary.js'
import { parseBkuFixture } from './src/utils/bkuPdfParser.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const XLSX_FILE = join(REPO, 'template-data',
  'Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx')
const FIXTURE = join(REPO, 'scratch-pdf-check', 'fixture.json')

const C = { TANGGAL: 0, KODE_KEGIATAN: 3, KODE_REKENING: 5, NO_BUKTI: 8, URAIAN: 10,
  PENERIMAAN: 13, PENGELUARAN: 16, SALDO: 19 }
const DATA_START_ROW = 15
const KUNCI_WAJIB = ['totalTransactions', 'totalPenerimaan', 'totalPengeluaran', 'saldoAkhir',
  'isBalanced', 'months', 'totalPenerimaanSemua', 'totalPengeluaranSemua', 'byType',
  'monthlySummaries']
const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')
const num = (v) => {
  if (v == null || v === '') return 0
  if (typeof v === 'number') return v
  const n = parseFloat(String(v).replace(/[Rp\s]/g, '').replace(/\./g, '').replace(',', '.'))
  return Number.isNaN(n) ? 0 : n
}
function tgl(v) {
  if (v instanceof Date) return { d: v.getDate(), m: v.getMonth() + 1, y: v.getFullYear() }
  if (typeof v === 'string') {
    const p = v.trim().split('-')
    if (p.length === 3 && +p[0] >= 1 && +p[0] <= 31 && +p[1] >= 1 && +p[1] <= 12) {
      return { d: +p[0], m: +p[1], y: +p[2] }
    }
  }
  if (typeof v === 'number') { const q = XLSX.SSF.parse_date_code(v); if (q) return { d: q.d, m: q.m, y: q.y } }
  return null
}

function bacaExcel() {
  const wb = XLSX.readFile(XLSX_FILE, { cellDates: false })
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Page1'], { header: 1, raw: true, defval: null })
  const out = []
  for (let i = DATA_START_ROW; i < rows.length; i++) {
    const r = rows[i]; if (!r) continue
    const raw = r[C.TANGGAL]; if (raw == null || raw === '') continue
    if (typeof raw === 'string' && raw.includes('BKU-ALL')) continue
    if (String(raw).trim() === '1' && (r[C.KODE_KEGIATAN] == null
      || String(r[C.KODE_KEGIATAN]).trim() === '' || String(r[C.KODE_KEGIATAN]).trim() === '2')) continue
    const t = tgl(raw); if (!t) continue
    out.push({
      row: i + 1, tanggal: { day: t.d, month: t.m, year: t.y },
      tanggalStr: `${String(t.d).padStart(2, '0')}-${String(t.m).padStart(2, '0')}-${t.y}`,
      tanggalISO: `${t.y}-${String(t.m).padStart(2, '0')}-${String(t.d).padStart(2, '0')}`,
      bulan: t.m, tahun: t.y,
      kodeKegiatan: String(r[C.KODE_KEGIATAN] ?? '').trim(),
      kodeRekening: String(r[C.KODE_REKENING] ?? '').trim(),
      noBukti: String(r[C.NO_BUKTI] ?? '').trim(),
      uraian: String(r[C.URAIAN] ?? '').trim(),
      penerimaan: num(r[C.PENERIMAAN]), pengeluaran: num(r[C.PENGELUARAN]), saldo: num(r[C.SALDO]),
      debet: num(r[C.PENERIMAAN]), kredit: num(r[C.PENGELUARAN]),
      tipe: null, kategori: null,
    })
  }
  return redetectTypes(out)
}

let gagal = 0
const cek = (nama, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${nama}${detail ? '  ' + detail : ''}`)
  if (!ok) gagal++
}

// ── 1. EXCEL ──────────────────────────────────────────────────────────────
const ex = bacaExcel()
const sEx = hitungRingkasan(ex)
const tarik = ex.filter((t) => t.tipe === 'TARIK_TUNAI')
const geser = ex.filter((t) => t.tipe === 'PERGESERAN_BANK')
const sumTarik = tarik.reduce((s, t) => s + t.pengeluaran, 0)
const sumGeser = geser.reduce((s, t) => s + t.penerimaan, 0)

console.log('='.repeat(66))
console.log('1. EXCEL — ' + ex.length + ' baris')
console.log('='.repeat(66))
console.log(`  tarik tunai : ${tarik.length} baris, ${fmt(sumTarik)}`)
console.log(`  pergeseran  : ${geser.length} baris, ${fmt(sumGeser)}`)
console.log(`  ringkasan   : masuk ${fmt(sEx.totalPenerimaan)} | keluar ${fmt(sEx.totalPengeluaran)}` +
  ` | saldo ${fmt(sEx.saldoAkhir)} | balance ${sEx.isBalanced}`)
cek('jumlah baris = 300', sEx.totalTransactions === 300, `dapat ${sEx.totalTransactions}`)
cek('totalPenerimaan = Rp 82.560.000', sEx.totalPenerimaan === 82560000, fmt(sEx.totalPenerimaan))
cek('totalPengeluaran = Rp 82.560.000 (TARIK_TUNAI TIDAK dihitung)',
  sEx.totalPengeluaran === 82560000, fmt(sEx.totalPengeluaran))
cek('totalPengeluaran BUKAN 98.910.000 (double counting hilang)',
  sEx.totalPengeluaran !== 98910000, fmt(sEx.totalPengeluaran))
cek('isBalanced = true', sEx.isBalanced === true)
cek('saldoAkhir = Rp 0 (baris terakhir 30-06 saldo 0)', sEx.saldoAkhir === 0, fmt(sEx.saldoAkhir))
cek('Σ TARIK_TUNAI = Σ PERGESERAN_BANK (pemindahan dana, bukan belanja)',
  sumTarik === sumGeser, `${fmt(sumTarik)} vs ${fmt(sumGeser)}`)

// ── 2. BENTUK ─────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(66))
console.log('2. BENTUK SUMMARY — wajib 10 kunci (sama dengan bkuParser)')
console.log('='.repeat(66))
const kurang = KUNCI_WAJIB.filter((k) => !(k in sEx))
cek('10 kunci wajib ada', kurang.length === 0, kurang.length ? 'hilang: ' + kurang.join(', ') : '')
cek('byType berisi objek', typeof sEx.byType === 'object' && sEx.byType !== null,
  Object.keys(sEx.byType || {}).length + ' tipe')
cek('monthlySummaries = 6 bulan (Jan–Jun)',
  Array.isArray(sEx.monthlySummaries) && sEx.monthlySummaries.length === 6,
  String((sEx.monthlySummaries || []).length))
cek('monthlySummaries punya namaBulan', (sEx.monthlySummaries || []).every((m) => !!m.namaBulan))
cek('Σ monthlySummaries.masuk = totalPenerimaanSemua',
  (sEx.monthlySummaries || []).reduce((s, m) => s + m.totalPenerimaan, 0) === sEx.totalPenerimaanSemua)
cek('Σ monthlySummaries.keluar = totalPengeluaranSemua',
  (sEx.monthlySummaries || []).reduce((s, m) => s + m.totalPengeluaran, 0) === sEx.totalPengeluaranSemua)
cek('totalPenerimaanSemua = totalPengeluaranSemua (BKU seimbang di level semua)',
  sEx.totalPenerimaanSemua === sEx.totalPengeluaranSemua,
  `${fmt(sEx.totalPenerimaanSemua)} vs ${fmt(sEx.totalPengeluaranSemua)}`)
cek('Σ byType.count = totalTransactions',
  Object.values(sEx.byType || {}).reduce((s, v) => s + v.count, 0) === sEx.totalTransactions)

// ── 3. PDF ────────────────────────────────────────────────────────────────
const pdf = parseBkuFixture(JSON.parse(readFileSync(FIXTURE, 'utf8')))
const sPdf = hitungRingkasan(pdf.transactions)
console.log('\n' + '='.repeat(66))
console.log('3. PDF — ' + pdf.transactions.length + ' baris')
console.log('='.repeat(66))
console.log(`  ringkasan : masuk ${fmt(sPdf.totalPenerimaan)} | keluar ${fmt(sPdf.totalPengeluaran)}` +
  ` | saldo ${fmt(sPdf.saldoAkhir)} | balance ${sPdf.isBalanced}`)
cek('totalPenerimaan = Rp 165.120.000', sPdf.totalPenerimaan === 165120000, fmt(sPdf.totalPenerimaan))
cek('totalPengeluaran = Rp 130.549.500', sPdf.totalPengeluaran === 130549500, fmt(sPdf.totalPengeluaran))
cek('saldoAkhir = Rp 32.723.000', sPdf.saldoAkhir === 32723000, fmt(sPdf.saldoAkhir))
cek('isBalanced = false (tahun penuh masih ada saldo)', sPdf.isBalanced === false)
cek('10 kunci wajib ada', KUNCI_WAJIB.every((k) => k in sPdf))
cek('months memuat 1..9', [1, 2, 3, 4, 5, 6, 7, 8, 9].every((m) => sPdf.months.includes(m)),
  sPdf.months.join(','))

// ── 4. DATA LAMA (tanpa tipe) ─────────────────────────────────────────────
const lama = ex.map(({ tipe, kategori, ...r }) => r)
const sLama = hitungRingkasan(lama)
console.log('\n' + '='.repeat(66))
console.log('4. DATA LAMA (tanpa field tipe)')
console.log('='.repeat(66))
console.log(`  ringkasan : masuk ${fmt(sLama.totalPenerimaan)} | keluar ${fmt(sLama.totalPengeluaran)}`)
cek('10 kunci wajib ada juga di cabang data lama', KUNCI_WAJIB.every((k) => k in sLama))
cek('cabang data lama tidak crash', sLama.totalTransactions === 300)

console.log('\n' + '='.repeat(66))
console.log(gagal === 0 ? 'HASIL: SEMUA PASS' : `HASIL: ${gagal} GAGAL`)
console.log('='.repeat(66))
process.exit(gagal === 0 ? 0 : 1)
