/**
 * realisasiAgregat.js — Sprint 024: BKU → matriks Realisasi Dana per tahap.
 *
 * Tahap 1 = bulan 1–6, tahap 2 = 7–12 (kalender). Sumber angka = PENGELUARAN
 * baris PEMBAYARAN (belanja riil); SETOR_PAJAK/PUNGUT dicatat terpisah
 * (tidak masuk matriks, ikut selisih bila tak seimbang).
 * Koreksi manual: denganKoreksi(agregat, koreksi) — koreksi menang, kunci
 * `${baris}-${kolom}`. Upload ulang tak menyentuh sel terkoreksi (pemanggil
 * hanya agregat ulang dari BKU lalu terapkan koreksi tersimpan).
 */
import { lookupKegiatan } from '../data/kodeReferensi'
import { KOMPONEN, SNP_ROWS, petaKomponen, petaKomponenKegiatan, petaSnp, petaKegiatanEksklusif } from './realisasiPeta'

export { KOMPONEN, SNP_ROWS }
import { ringkasanKasPerBulan } from './dokKas'

export const N_BARIS = 7
export const N_KOLOM = 12

const num = (v) => Number(v ?? 0) || 0
const bulanTahap = (tahap) => (tahap === 2 ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6])

/**
 * @param {Array} transactions tx BKU (tipe, bulan, pengeluaran, kodeKegiatan, kodeRekening, uraian)
 * @param {object} opt { tahap: 1|2 }
 * @returns { matrix[7][12], jumlahBaris[7], jumlahKolom[12], total, totalBku, selisih, belum: [] }
 */
export function agregatRealisasi(transactions = [], { tahap = 1 } = {}) {
  const bln = new Set(bulanTahap(tahap))
  const list = (transactions || []).filter((t) => bln.has(Number(t?.bulan)))
  const matrix = Array.from({ length: N_BARIS }, () => Array(N_KOLOM).fill(0))
  const belum = []
  let totalBku = 0

  for (const t of list) {
    const nominal = num(t.pengeluaran)
    if (!nominal) continue
    // Hanya belanja riil masuk matriks; setor/pungut pajak tidak.
    if (t?.tipe === 'SETOR_PAJAK' || t?.tipe === 'PUNGUT_PPH') continue
    if (t?.tipe !== 'PEMBAYARAN') continue
    totalBku += nominal

    const keg = lookupKegiatan(t.kodeKegiatan)
    const eks = petaKegiatanEksklusif(t.kodeKegiatan)
    if (eks) {
      matrix[eks[0]][eks[1]] += nominal
      continue
    }
    const baris = keg ? petaSnp(keg.snp) : null
    let kolom = petaKomponen(t.kodeRekening, t.uraian)
    if (kolom == null && keg) kolom = petaKomponenKegiatan(keg.komponen)
    if (baris == null || kolom == null) {
      belum.push({ bulan: t.bulan, noBukti: t.noBukti, uraian: t.uraian, nominal, kodeKegiatan: t.kodeKegiatan, kodeRekening: t.kodeRekening })
      continue
    }
    matrix[baris][kolom] += nominal
  }

  const jumlahBaris = matrix.map((r) => r.reduce((s, v) => s + v, 0))
  const jumlahKolom = matrix[0].map((_, k) => matrix.reduce((s, r) => s + r[k], 0))
  const total = jumlahBaris.reduce((s, v) => s + v, 0)
  const belumTotal = belum.reduce((s, b) => s + b.nominal, 0)
  return { matrix, jumlahBaris, jumlahKolom, total, totalBku, selisih: totalBku - total - belumTotal, belum, tahap }
}

/** Terapkan koreksi manual { "baris-kolom": angka } — koreksi menang. */
export function denganKoreksi(agregat, koreksi = {}) {
  const matrix = agregat.matrix.map((r, i) => r.map((v, k) => {
    const key = `${i}-${k}`
    return koreksi[key] != null && koreksi[key] !== '' ? Number(koreksi[key]) || 0 : v
  }))
  const terkoreksi = Object.keys(koreksi || {}).filter((k) => koreksi[k] !== '' && koreksi[k] != null)
  const jumlahBaris = matrix.map((r) => r.reduce((s, v) => s + v, 0))
  const jumlahKolom = matrix[0].map((_, k) => matrix.reduce((s, r) => s + r[k], 0))
  const total = jumlahBaris.reduce((s, v) => s + v, 0)
  return { ...agregat, matrix, jumlahBaris, jumlahKolom, total, terkoreksi }
}

/** Kunci storage per tahun+tahap. */
export const kunciRealisasi = (tahun, tahap) => `realisasi_${tahun}_${tahap === 2 ? 'tahap2' : 'tahap1'}`

/**
 * Ringkasan tahap dari BKU: terima (BOSP masuk), pakai (bayar keluar),
 * saldoAwal (buku sebelum bulan pertama), saldoAkhir, adaData.
 */
export function ringkasTahap(transactions = [], { tahap = 1 } = {}) {
  const bln = tahap === 2 ? [7, 8, 9, 10, 11, 12] : [1, 2, 3, 4, 5, 6]
  let terima = 0, pakai = 0, saldoAwal = 0, saldoAkhir = 0, ada = false, pertama = true
  for (const m of bln) {
    const r = ringkasanKasPerBulan(transactions, m)
    if (!r.adaData) continue
    ada = true
    const txm = (transactions || []).filter((t) => Number(t?.bulan) === m)
    terima += txm.filter((t) => t?.tipe === 'PENERIMAAN_BOSP').reduce((s, t) => s + num(t.penerimaan), 0)
    pakai += txm.filter((t) => t?.tipe === 'PEMBAYARAN').reduce((s, t) => s + num(t.pengeluaran), 0)
    if (pertama) {
      const bos0 = txm.filter((t) => t?.tipe === 'PENERIMAAN_BOSP').reduce((s, t) => s + num(t.penerimaan), 0)
      saldoAwal = r.D - bos0
      pertama = false
    }
    saldoAkhir = r.saldoAkhir
  }
  return { terima, pakai, saldoAwal, saldoAkhir, ada }
}

export default { N_BARIS, N_KOLOM, KOMPONEN, SNP_ROWS, agregatRealisasi, denganKoreksi, kunciRealisasi, ringkasTahap }
