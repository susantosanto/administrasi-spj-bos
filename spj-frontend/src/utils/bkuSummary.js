/**
 * bkuSummary.js — Sprint 016: SATU definisi ringkasan BKU untuk KEDUA pintu masuk
 * (impor Excel dan impor PDF), supaya angkanya tidak bisa berbeda.
 *
 * Dipindahkan dari `BKUPage.jsx` (fungsi `recalcSummary`) agar bisa diuji oracle
 * tanpa browser — sebelumnya fungsi ini tidak bisa diimpor sama sekali.
 *
 * Definisi yang berlaku (ADR `DECISIONS.MD` §T, menggantikan §S1):
 *  - PENERIMAAN RIIL  = hanya `PENERIMAAN_BOSP`
 *  - PENGELUARAN RIIL = hanya `PEMBAYARAN` (BNU + BPU)
 *    `TARIK_TUNAI` TIDAK dihitung: ia pemindahan bank->kas yang berpasangan dengan
 *    `PERGESERAN_BANK` masuk senilai sama (terverifikasi 2026-10-20) — menghitungnya
 *    membuat uang yang sama terhitung dua kali.
 *  - `isBalanced` = perbandingan keduanya.
 *
 * Bentuk keluaran WAJIB sama dengan `summary` dari `bkuParser.js` (jalur Excel):
 * 10 kunci. Tambahan field di sini hanya melengkapi, tidak mengubah definisi.
 */

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const nilai = (t) => t.penerimaan || 0
const keluar = (t) => t.pengeluaran || t.kredit || 0
const jumlah = (arr, f) => arr.reduce((s, t) => s + f(t), 0)

/**
 * Field pelengkap agar bentuk summary identik dengan jalur Excel.
 * @param {Array} transactions
 */
export function ringkasTambahan(transactions) {
  const months = [...new Set(transactions.map((t) => t.bulan))].sort((a, b) => a - b)

  const byType = {}
  for (const t of transactions) {
    const k = t.tipe || 'LAINNYA'
    if (!byType[k]) byType[k] = { count: 0, totalPenerimaan: 0, totalPengeluaran: 0 }
    byType[k].count++
    byType[k].totalPenerimaan += nilai(t)
    byType[k].totalPengeluaran += keluar(t)
  }

  const monthlySummaries = months.map((bulan) => {
    const bt = transactions.filter((t) => t.bulan === bulan)
    return {
      bulan,
      namaBulan: NAMA_BULAN[bulan - 1],
      count: bt.length,
      totalPenerimaan: jumlah(bt, nilai),
      totalPengeluaran: jumlah(bt, keluar),
      saldoAwal: bt.length ? (bt[0].saldo - nilai(bt[0]) + keluar(bt[0])) : 0,
      saldoAkhir: bt.length ? bt[bt.length - 1].saldo : 0,
    }
  })

  return {
    saldoAkhir: transactions.length ? transactions[transactions.length - 1].saldo : 0,
    totalPenerimaanSemua: jumlah(transactions, nilai),
    totalPengeluaranSemua: jumlah(transactions, keluar),
    months,
    byType,
    monthlySummaries,
  }
}

/**
 * Ringkasan BKU. Menangani DUA bentuk data:
 *  - LAMA (tanpa field `tipe`) — deteksi BOSP/pajak/saldo awal dari teks `uraian`.
 *  - BARU (dengan `tipe`) — filter langsung oleh tipe.
 */
export function hitungRingkasan(transactions) {
  const tx = Array.isArray(transactions) ? transactions : []
  const hasTipe = tx.some((t) => t.tipe)

  if (!hasTipe) {
    // ── OLD DATA (sebelum parser fix) — tidak punya field tipe ──
    // Deteksi penerimaan BOSP dari text: "Dana BOSP" atau noBukti "BBU01"
    const bosp = jumlah(tx.filter((t) => {
      const u = (t.uraian || '').toLowerCase()
      const nb = (t.noBukti || '').toUpperCase()
      return t.penerimaan > 0 && (nb === 'BBU01' || u.includes('dana bosp') || u.includes('bosp tahap'))
    }), nilai)

    // Pengeluaran riil = total pengeluaran - setor pajak - internal
    const totalKredit = jumlah(tx, keluar)
    const setorPajak = jumlah(tx.filter((t) => {
      const nb = (t.noBukti || '').toUpperCase()
      const u = (t.uraian || '').toLowerCase()
      return nb.startsWith('BPU') || u.includes('setor pph') || u.includes('setor pajak') || u.includes('pajak bunga')
    }), keluar)
    const saldoAwal = jumlah(tx.filter((t) => {
      const u = (t.uraian || '').toLowerCase()
      return u.includes('saldo bank') || u.includes('saldo tunai')
    }), keluar)
    const internalLain = jumlah(tx.filter(
      (t) => (t.uraian || '').toLowerCase().includes('bunga bank')), keluar)

    const totalPengeluaranRiil = totalKredit - setorPajak - saldoAwal - internalLain

    return {
      totalPenerimaan: bosp,
      totalPengeluaran: totalPengeluaranRiil,
      totalTransactions: tx.length,
      isBalanced: bosp === totalPengeluaranRiil,
      ...ringkasTambahan(tx),
    }
  }

  // ── NEW DATA (dengan field tipe) — filter langsung oleh tipe ──
  const bosp = jumlah(tx.filter((t) => t.tipe === 'PENERIMAAN_BOSP'), nilai)
  const pembayaran = jumlah(tx.filter((t) => t.tipe === 'PEMBAYARAN'), keluar)

  return {
    totalPenerimaan: bosp,
    totalPengeluaran: pembayaran,
    totalTransactions: tx.length,
    isBalanced: bosp === pembayaran,
    ...ringkasTambahan(tx),
  }
}

export default hitungRingkasan
