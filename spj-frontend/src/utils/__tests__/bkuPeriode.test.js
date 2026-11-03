/**
 * bkuPeriode.test.js — Sprint 025 T-1..T-3 DoD.
 * Util murni: tanpa storage, tanpa DOM.
 */
import { describe, it, expect } from 'vitest'
import {
  semesterDariBulan, bulanDariNama, deteksiPeriodeDariPdf, kunciPeriode, labelPeriode, tandaiPeriode,
  urutKronologis, mergePeriode, hashBytes, modusBulan, agregatMurni, agregatPdf,
} from '../bkuPeriode.js'

const brs = (tanggalStr, extra = {}) => ({
  tanggalStr, tanggalISO: '', bulan: Number(tanggalStr.slice(3, 5)),
  tahun: Number(tanggalStr.slice(6, 10)), noBukti: 'BPU01', uraian: 'Uji',
  penerimaan: 0, pengeluaran: 100000, saldo: 0, tipe: 'PEMBAYARAN', ...extra,
})

describe('semester & kunci periode', () => {
  it('semesterDariBulan ikut Tahap BOS (opsi B)', () => {
    expect(semesterDariBulan(1)).toBe('S1')
    expect(semesterDariBulan(6)).toBe('S1')
    expect(semesterDariBulan(7)).toBe('S2')
    expect(semesterDariBulan(12)).toBe('S2')
    expect(semesterDariBulan(0)).toBe('')
  })
  it('kunciPeriode kanonis', () => {
    expect(kunciPeriode('bulanan', { bulan: 3, tahun: 2026 })).toBe('bulan:2026-03')
    expect(kunciPeriode('semester', { semester: 'S1', tahun: 2026 })).toBe('semester:2026-S1')
    expect(kunciPeriode('tahunan', { tahun: 2026 })).toBe('tahunan:2026')
    expect(kunciPeriode('bulanan', { bulan: 13, tahun: 2026 })).toBe('')
  })
  it('labelPeriode manusiawi', () => {
    expect(labelPeriode('bulanan', { bulan: 3, tahun: 2026 })).toBe('Maret 2026')
    expect(labelPeriode('semester', { semester: 'S2', tahun: 2026 })).toBe('Semester 2 2026')
    expect(labelPeriode('tahunan', { tahun: 2026 })).toBe('Tahun 2026')
  })
  it('bulanDariNama Indonesia + singkatan', () => {
    expect(bulanDariNama('Maret')).toBe(3)
    expect(bulanDariNama('AGUSTUS')).toBe(8)
    expect(bulanDariNama('Des')).toBe(12)
    expect(bulanDariNama('Foo')).toBe('')
  })
  it('deteksiPeriodeDariPdf: kop dulu, fallback modus', () => {
    const rows = [brs('03-03-2026'), brs('05-03-2026')]
    expect(deteksiPeriodeDariPdf(rows, { bulan: 3, tahun: '2026' })).toEqual({ bulan: 3, tahun: 2026, semester: 'S1' })
    expect(deteksiPeriodeDariPdf(rows, {})).toEqual({ bulan: 3, tahun: 2026, semester: 'S1' })
    expect(deteksiPeriodeDariPdf(rows, { bulan: 4, tahun: '2026' })).toEqual({ bulan: 4, tahun: 2026, semester: 'S1' })
    expect(deteksiPeriodeDariPdf([], {})).toBe(null)
  })
})

describe('urutKronologis', () => {
  it('terurut walau input acak; seri stabil', () => {
    const a = brs('10-04-2026', { uraian: 'A' })
    const b = brs('03-03-2026', { uraian: 'B' })
    const c = brs('10-04-2026', { uraian: 'C' })
    const out = urutKronologis([a, b, c])
    expect(out.map((r) => r.uraian)).toEqual(['B', 'A', 'C'])
  })
})

describe('mergePeriode', () => {
  const maret = [brs('03-03-2026', { uraian: 'M1' }), brs('05-03-2026', { uraian: 'M2' })]
  const april = [brs('07-04-2026', { uraian: 'A1' })]
  it('tambah: april masuk, maret utuh, terurut', () => {
    const m1 = mergePeriode([], maret, { mode: 'bulanan', kunci: 'bulan:2026-03' })
    expect(m1.aksi).toBe('tambah')
    const m2 = mergePeriode(m1.rows, april, { mode: 'bulanan', kunci: 'bulan:2026-04' })
    expect(m2.aksi).toBe('tambah')
    expect(m2.rows).toHaveLength(3)
    expect(m2.rows.map((r) => r.uraian)).toEqual(['M1', 'M2', 'A1'])
    expect(m2.rows.every((r) => r.periode)).toBe(true)
  })
  it('ganti: upload ulang maret hanya ganti maret, nol duplikat', () => {
    const m1 = mergePeriode([], maret, { mode: 'bulanan', kunci: 'bulan:2026-03' })
    const m2 = mergePeriode(m1.rows, april, { mode: 'bulanan', kunci: 'bulan:2026-04' })
    const maretV2 = [brs('04-03-2026', { uraian: 'M1-rev' })]
    const m3 = mergePeriode(m2.rows, maretV2, { mode: 'bulanan', kunci: 'bulan:2026-03' })
    expect(m3.aksi).toBe('ganti')
    expect(m3.barisDiganti).toBe(2)
    expect(m3.rows.map((r) => r.uraian)).toEqual(['M1-rev', 'A1'])
  })
  it('tahunan: ganti semua', () => {
    const m1 = mergePeriode([], maret, { mode: 'bulanan', kunci: 'bulan:2026-03' })
    const t = mergePeriode(m1.rows, april, { mode: 'tahunan', kunci: 'tahunan:2026' })
    expect(t.aksi).toBe('ganti-semua')
    expect(t.rows.map((r) => r.uraian)).toEqual(['A1'])
  })
})

describe('hashBytes & modusBulan', () => {
  it('hash stabil & beda untuk isi beda', () => {
    const a = new Uint8Array([1, 2, 3])
    expect(hashBytes(a)).toBe(hashBytes(new Uint8Array([1, 2, 3])))
    expect(hashBytes(a)).not.toBe(hashBytes(new Uint8Array([1, 2, 4])))
  })
  it('modusBulan = bulan mayoritas', () => {
    const rows = [brs('03-03-2026'), brs('05-03-2026'), brs('07-04-2026')]
    expect(modusBulan(rows)).toEqual({ bulan: 3, tahun: 2026 })
    expect(modusBulan([])).toBe(null)
  })
})

describe('agregatPdf (semantik baris Jumlah PDF)', () => {
  it('maret: saldo awal + terima/setor PPh + bayar = Jumlah PDF', () => {
    const rows = [
      brs('01-03-2026', { uraian: 'Saldo Bank Bulan Februari', penerimaan: 37109100, pengeluaran: 0, saldo: 37109100, tipe: 'SALDO_AWAL', bulan: 3 }),
      brs('01-03-2026', { uraian: 'Saldo Tunai Bulan Februari', penerimaan: 9075000, pengeluaran: 0, saldo: 46184100, tipe: 'SALDO_AWAL', bulan: 3 }),
      brs('03-03-2026', { uraian: 'Terima PPh 23', penerimaan: 24000, pengeluaran: 0, saldo: 45608100, tipe: 'PUNGUT_PPH', bulan: 3 }),
      brs('03-03-2026', { uraian: 'Setor PPh 23', penerimaan: 0, pengeluaran: 24000, saldo: 45584100, tipe: 'SETOR_PAJAK', bulan: 3 }),
      brs('03-03-2026', { uraian: 'Makan Box', penerimaan: 0, pengeluaran: 400000, saldo: 45184100, tipe: 'PEMBAYARAN', bulan: 3 }),
      brs('31-03-2026', { uraian: 'Bunga Bank', penerimaan: 0, pengeluaran: 0, saldo: 45184100, tipe: 'BUNGA_BANK', bulan: 3 }),
    ]
    const g = agregatPdf(rows)
    expect(g.masuk).toBe(37109100 + 9075000 + 24000)
    expect(g.keluar).toBe(24000 + 400000)
  })
})

describe('agregatMurni', () => {
  it('kecualikan SALDO_AWAL & BUNGA nol; cocok definisi ADR-T', () => {
    const rows = [
      brs('01-03-2026', { uraian: 'Saldo Bank Bulan Februari', penerimaan: 37109100, pengeluaran: 0, saldo: 37109100, tipe: 'SALDO_AWAL' }),
      brs('03-03-2026', { uraian: 'Makan Box', penerimaan: 0, pengeluaran: 400000, saldo: 36709100, tipe: 'PEMBAYARAN' }),
      brs('31-03-2026', { uraian: 'Bunga Bank', penerimaan: 0, pengeluaran: 0, saldo: 36709100, tipe: 'BUNGA_BANK' }),
      brs('20-01-2026', { uraian: 'Terima Dana BOSP Tahap 1', penerimaan: 82560000, pengeluaran: 0, saldo: 82560000, tipe: 'PENERIMAAN_BOSP', bulan: 1, tahun: 2026 }),
    ]
    const g = agregatMurni(rows)
    expect(g.masuk).toBe(82560000)
    expect(g.keluar).toBe(400000)
    expect(g.jumlah).toBe(2)
    expect(g.saldoAkhir).toBe(36709100)
  })
})
