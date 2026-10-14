/**
 * bkuParser.test.js — Unit test parser BKU ARKAS (Fase 3 blueprint)
 *
 * Mencakup:
 * 1. Parsing tanggal format DD-MM-YYYY
 * 2. Perhitungan saldo & status isBalanced
 * 3. Identifikasi transaksi Mamin (5.1.02.01.01.0052)
 * 4. Tarik tunai & pajak tidak menggandakan total belanja riil
 *
 * FileReader di-stub karena parseBKUExcel butuh browser API.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import * as XLSX from 'xlsx'
import {
  parseBKUExcel,
  validateBKUFormat,
  filterByMonth,
  filterByYear,
  getMaminTransactions,
  getTransactionsByType,
  getTypeLabel,
  redetectTypes,
  TRANSACTION_TYPES,
} from '../bkuParser'

// ─── FileReader stub (browser API) ────────────────────────────────────

let pendingBytes = null

class StubFileReader {
  readAsArrayBuffer() {
    const bytes = pendingBytes
    // async seperti browser
    setTimeout(() => this.onload({ target: { result: bytes } }), 0)
  }
}

beforeAll(() => {
  globalThis.FileReader = StubFileReader
})

// ─── Workbook fixture (struktur ARKAS Page1) ──────────────────────────
// Kolom: A=0 TANGGAL, D=3 KEGIATAN, F=5 REKENING, I=8 NOBUKTI,
//        K=10 URAIAN, N=13 PENERIMAAN, Q=16 PENGELUARAN, T=19 SALDO

function blankRow() {
  return new Array(20).fill('')
}

function txRow({ tanggal, kegiatan = '', rekening = '', noBukti = '', uraian = '', penerimaan = 0, pengeluaran = 0, saldo = 0 }) {
  const r = blankRow()
  r[0] = tanggal
  r[3] = kegiatan
  r[5] = rekening
  r[8] = noBukti
  r[10] = uraian
  r[13] = penerimaan
  r[16] = pengeluaran
  r[19] = saldo
  return r
}

function buildWorkbook() {
  const rows = []
  rows[0] = ['BUKU KAS UMUM']
  rows[1] = ['TAHUN ANGGARAN']
  rows[2] = ['TAHUN : 2026']
  rows[3] = blankRow()
  rows[4] = ['NPSN', '', '', '', ': 20205293']
  rows[5] = blankRow()
  rows[6] = ['NAMA SEKOLAH', '', '', '', ': SD NEGERI PASIRHALANG']
  rows[7] = blankRow()
  rows[8] = ['ALAMAT', '', '', '', ': Jl. Raya Cipatat']
  rows[9] = blankRow()
  rows[10] = ['KABUPATEN', '', '', '', ': Kab. Bandung Barat']
  rows[11] = blankRow()
  rows[12] = ['PROVINSI', '', '', '', ': Jawa Barat']
  rows[13] = blankRow()
  // Header label row (0-indexed 14): TANGGAL di kolom A
  const head = blankRow()
  head[0] = 'TANGGAL'
  rows[14] = head
  // Number separator row (0-indexed 15)
  const nums = blankRow()
  nums[0] = 1
  nums[3] = 2
  rows[15] = nums
  // Data
  rows[16] = txRow({ tanggal: '20-01-2026', kegiatan: '07.12.01.', rekening: '5.1.02.02.01.0013', noBukti: 'BBU01', uraian: 'Terima Dana BOSP Tahap 1', penerimaan: 82560000, saldo: 82560000 })
  rows[17] = txRow({ tanggal: '05-02-2026', kegiatan: '07.12.01.', rekening: '5.1.02.01.01.0052', noBukti: 'BPU01', uraian: 'Bayar Mamin Rapat', pengeluaran: 1000000, saldo: 81560000 })
  rows[18] = txRow({ tanggal: '06-02-2026', noBukti: '', uraian: 'Tarik Tunai Bank', pengeluaran: 500000, saldo: 81060000 })
  rows[19] = txRow({ tanggal: '07-02-2026', noBukti: '', uraian: 'Setor PPh 23', pengeluaran: 100000, saldo: 80960000 })
  rows[20] = txRow({ tanggal: '07-02-2026', noBukti: '', uraian: 'Terima PPh 23', penerimaan: 100000, saldo: 80970000 })

  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Page1')
  return wb
}

async function parseFixture() {
  const wb = buildWorkbook()
  pendingBytes = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return parseBKUExcel({})
}

describe('validateBKUFormat', () => {
  it('menerima workbook struktur ARKAS valid', () => {
    const res = validateBKUFormat(buildWorkbook())
    expect(res.valid).toBe(true)
    expect(res.sheetName).toBe('Page1')
    expect(res.npsn).toBe('20205293')
  })

  it('menolak workbook tanpa header TANGGAL', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['acak']]), 'Data')
    const res = validateBKUFormat(wb)
    expect(res.valid).toBe(false)
    expect(res.errors.length).toBeGreaterThan(0)
  })
})

describe('parseBKUExcel (tanggal DD-MM-YYYY & tipe)', () => {
  it('parse 5 transaksi dengan tanggal terstruktur', async () => {
    const res = await parseFixture()
    expect(res.success).toBe(true)
    expect(res.transactions).toHaveLength(5)
    const [first] = res.transactions
    expect(first.tanggalStr).toBe('20-01-2026')
    expect(first.tanggalISO).toBe('2026-01-20')
    expect(first.bulan).toBe(1)
    expect(first.tahun).toBe(2026)
    expect(res.header.tahunAnggaran).toBe('2026')
  })

  it('mendeteksi tipe tiap transaksi', async () => {
    const res = await parseFixture()
    const byUraian = Object.fromEntries(res.transactions.map((t) => [t.uraian, t.tipe]))
    expect(byUraian['Terima Dana BOSP Tahap 1']).toBe(TRANSACTION_TYPES.PENERIMAAN_BOSP)
    expect(byUraian['Bayar Mamin Rapat']).toBe(TRANSACTION_TYPES.PEMBAYARAN)
    expect(byUraian['Tarik Tunai Bank']).toBe(TRANSACTION_TYPES.TARIK_TUNAI)
    expect(byUraian['Setor PPh 23']).toBe(TRANSACTION_TYPES.SETOR_PAJAK)
    expect(byUraian['Terima PPh 23']).toBe(TRANSACTION_TYPES.PUNGUT_PPH)
  })

  it('menghitung total riil tanpa ganda (pajak & pungutan dikecualikan)', async () => {
    const res = await parseFixture()
    // RIIL: penerimaan = BOSP saja; pengeluaran = PEMBAYARAN + TARIK_TUNAI
    expect(res.summary.totalPenerimaan).toBe(82560000)
    expect(res.summary.totalPengeluaran).toBe(1500000)
    // SEMUA (verifikasi): termasuk setor pajak & pungutan
    expect(res.summary.totalPenerimaanSemua).toBe(82660000)
    expect(res.summary.totalPengeluaranSemua).toBe(1600000)
    // Tidak balance karena belanja riil < penerimaan (wajar)
    expect(res.summary.isBalanced).toBe(false)
  })

  it('rekap bulanan memuat Januari & Februari', async () => {
    const res = await parseFixture()
    expect(res.summary.months).toEqual([1, 2])
    expect(res.summary.monthlySummaries).toHaveLength(2)
    expect(res.summary.monthlySummaries[1].namaBulan).toBe('Februari')
  })
})

describe('helper filter & label', () => {
  it('getMaminTransactions hanya kode 5.1.02.01.01.0052', async () => {
    const res = await parseFixture()
    const mamin = getMaminTransactions(res.transactions)
    expect(mamin).toHaveLength(1)
    expect(mamin[0].uraian).toBe('Bayar Mamin Rapat')
    expect(mamin[0].kategori.key).toBe('MAMIN')
  })

  it('filterByMonth / filterByYear / getTransactionsByType', async () => {
    const res = await parseFixture()
    expect(filterByMonth(res.transactions, 2)).toHaveLength(4)
    expect(filterByMonth(res.transactions, 'Semua')).toHaveLength(5)
    expect(filterByYear(res.transactions, 2026)).toHaveLength(5)
    expect(getTransactionsByType(res.transactions, 'PEMBAYARAN')).toHaveLength(1)
  })

  it('redetectTypes mengklasifikasi ulang objek mentah', () => {
    const out = redetectTypes([
      { uraian: 'Tarik Tunai', noBukti: '', penerimaan: 0, pengeluaran: 5000, kodeKegiatan: '', kodeRekening: '' },
      { uraian: 'Setor PPh', noBukti: '', penerimaan: 0, pengeluaran: 1000, kodeKegiatan: '', kodeRekening: '' },
    ])
    expect(out[0].tipe).toBe('TARIK_TUNAI')
    expect(out[1].tipe).toBe('SETOR_PAJAK')
  })

  it('getTypeLabel berbahasa Indonesia', () => {
    expect(getTypeLabel('TARIK_TUNAI')).toBe('Tarik Tunai')
    expect(getTypeLabel('PENERIMAAN_BOSP')).toBe('Penerimaan Dana BOSP')
  })
})
