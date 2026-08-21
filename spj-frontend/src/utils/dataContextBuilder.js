/**
 * dataContextBuilder.js — Konteks Data Aplikasi untuk AI
 * 
 * Mengumpulkan SEMUA data dari localStorage (BKU, Guru, Tendik, Sekolah, LPJ)
 * dan memformatnya menjadi string konteks terstruktur yang bisa dipahami AI.
 * 
 * Dipanggil SEBELUM setiap request AI agar AI selalu punya konteks data.
 * 
 * ── FORMAT OUTPUT ─────────────────────────────────────────────
 * 
 * 📊 DATA APLIKASI:
 * 
 * --- BKU ---
 * • 45 transaksi | Penerimaan: Rp 500.000.000 | Pengeluaran: Rp 350.000.000
 * • Per Bulan: Jan (Rp 50jt), Feb (Rp 75jt) ...
 * • Per Kategori: Honor Guru Rp 120jt, Transport Rp 45jt ...
 * 
 * --- GURU ---
 * • 15 orang (Honorer: 8)
 * 
 * --- SEKOLAH ---
 * • SD Negeri Pasirhalang | NPSN: 123456
 * • Kepsek: Yuniarti | Bendahara: Susanto
 * 
 * ── EFISIENSI ─────────────────────────────────────────────────
 * - Hanya data YANG ADA (tidak null/undefined) yang disertakan
 * - Format kompak (bukan JSON) — hemat token AI
 * - Maks ~2500 chars untuk semua konteks
 * - Ringkasan per kategori, bukan transaksi detail
 */

import storageHelper from './storageHelper'

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const BULAN_SINGKAT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

// ─── Mapping kode rekening → kategori belanja ─────────────────
const KATEGORI_MAP = [
  { pattern: /^5\.1\.02\.02\.01\.0013$/, label: 'Honor Guru' },
  { pattern: /^5\.1\.02\.02\.01\.0061$/, label: 'Perpustakaan' },
  { pattern: /^5\.1\.02\.02\.01\.0063$/, label: 'Pulsa/Internet' },
  { pattern: /^5\.1\.02\.02/, label: 'Honor Lainnya' },
  { pattern: /^5\.1\.02\.04\.01\.0003$/, label: 'Transport Rapat' },
  { pattern: /^5\.1\.02\.04/, label: 'Transport Lainnya' },
  { pattern: /^5\.1\.02\.01\.01\.0052$/, label: 'Mamin' },
  { pattern: /^5\.1\.02\.01\.01\.0024$/, label: 'ATK' },
  { pattern: /^5\.1\.02\.01\.01\.0025$/, label: 'Cetak' },
  { pattern: /^5\.2\.05\.01\.01\.0001$/, label: 'Listrik' },
  { pattern: /^5\.1\.02\.01\.01\.0005$/, label: 'Pengadaan' },
  { pattern: /^5\.1\.02\.01\.01\.0006$/, label: 'Pemeliharaan' },
  { pattern: /^5\.1\.02\.01\.01/, label: 'Barang/Modal' },
  { pattern: /^5\.1\.02\.04/, label: 'Perjalanan' },
  { pattern: /^5\.1\.02\.05/, label: 'Langganan Daya/Jasa' },
]

function detectKategori(rekening) {
  if (!rekening) return null
  const str = String(rekening).trim()
  for (const m of KATEGORI_MAP) {
    if (m.pattern.test(str)) return m.label
  }
  return 'Lainnya'
}

// ═══════════════════════════════════════════════════════════════
// 1. BKU CONTEXT — Ringkasan transaksi keuangan
// ═══════════════════════════════════════════════════════════════

function buildBkuContext() {
  const data = storageHelper.get('bku_data', null)
  if (!data?.transactions?.length) return null

  const txs = data.transactions
  const lines = []

  // ── Total Semua Transaksi ──
  const totalPenerimaan = txs.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
  const totalPengeluaran = txs.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
  
  // Pisahkan jenis pengeluaran untuk detail
  const pembayaran = txs.filter(t => t.tipe === 'PEMBAYARAN' && Number(t.pengeluaran) > 0)
  const setorPajak = txs.filter(t => t.tipe === 'SETOR_PAJAK' && Number(t.pengeluaran) > 0)
  const tarikTunai = txs.filter(t => t.tipe === 'TARIK_TUNAI' && Number(t.pengeluaran) > 0)
  const pungutPph = txs.filter(t => t.tipe === 'PUNGUT_PPH' && Number(t.penerimaan) > 0)
  const bungaBank = txs.filter(t => t.tipe === 'BUNGA_BANK' && Number(t.penerimaan) > 0)
  
  const totalPembayaran = pembayaran.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
  const totalPajak = setorPajak.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
  const totalTarik = tarikTunai.reduce((s, t) => s + (Number(t.pengeluaran) || 0), 0)
  const totalPungut = pungutPph.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)
  const totalBunga = bungaBank.reduce((s, t) => s + (Number(t.penerimaan) || 0), 0)

  lines.push(`📊 BKU — ${txs.length} transaksi`)
  lines.push(`   Total Penerimaan: Rp ${totalPenerimaan.toLocaleString('id-ID')}`)
  lines.push(`   Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString('id-ID')}`)
  
  // Detail pengeluaran
  lines.push('')
  lines.push('   Detail Pengeluaran:')
  lines.push(`   • Belanja Langsung (PEMBAYARAN): Rp ${totalPembayaran.toLocaleString('id-ID')} (${pembayaran.length} tx)`)
  if (totalPajak > 0) {
    lines.push(`   • Setor Pajak (SETOR_PAJAK/PPh23): Rp ${totalPajak.toLocaleString('id-ID')} (${setorPajak.length} tx)`)
  }
  if (totalTarik > 0) {
    lines.push(`   • Tarik Tunai: Rp ${totalTarik.toLocaleString('id-ID')} (${tarikTunai.length} tx)`)
  }
  
  // Detail penerimaan
  if (totalPungut > 0 || totalBunga > 0) {
    lines.push('')
    lines.push('   Detail Penerimaan Lain:')
    if (totalPungut > 0) {
      lines.push(`   • Pungut PPh: Rp ${totalPungut.toLocaleString('id-ID')} (${pungutPph.length} tx)`)
    }
    if (totalBunga > 0) {
      lines.push(`   • Bunga Bank: Rp ${totalBunga.toLocaleString('id-ID')} (${bungaBank.length} tx)`)
    }
  }

  // ── Per Bulan ──
  const byBulan = {}
  txs.forEach(t => {
    const b = Number(t.bulan)
    if (b >= 1 && b <= 12) {
      if (!byBulan[b]) byBulan[b] = { pengeluaran: 0, penerimaan: 0, pajak: 0, count: 0 }
      byBulan[b].pengeluaran += Number(t.pengeluaran) || 0
      byBulan[b].penerimaan += Number(t.penerimaan) || 0
      if (t.tipe === 'SETOR_PAJAK') byBulan[b].pajak += Number(t.pengeluaran) || 0
      byBulan[b].count++
    }
  })

  const bulanAktif = Object.keys(byBulan).map(Number).sort((a, b) => a - b)
  if (bulanAktif.length > 0) {
    lines.push('')
    lines.push('   Per Bulan:')
    bulanAktif.forEach(b => {
      const d = byBulan[b]
      const pajakStr = d.pajak > 0 ? ` | Pajak Rp ${d.pajak.toLocaleString('id-ID')}` : ''
      lines.push(`   • ${BULAN_SINGKAT[b-1]}: Penerimaan Rp ${d.penerimaan.toLocaleString('id-ID')} | Pengeluaran Rp ${d.pengeluaran.toLocaleString('id-ID')}${pajakStr} (${d.count} tx)`)
    })
  }

  // ── Per Kategori (semua pengeluaran, bukan hanya PEMBAYARAN) ──
  const byKategori = {}
  txs.filter(t => Number(t.pengeluaran) > 0).forEach(t => {
    const kat = detectKategori(t.kodeRekening)
    if (!byKategori[kat]) byKategori[kat] = { total: 0, count: 0 }
    byKategori[kat].total += Number(t.pengeluaran)
    byKategori[kat].count++
  })

  const sortedKategori = Object.entries(byKategori).sort((a, b) => b[1].total - a[1].total)
  if (sortedKategori.length > 0) {
    lines.push('')
    lines.push('   Kategori Belanja (semua pengeluaran):')
    sortedKategori.forEach(([kat, info]) => {
      const pct = totalPengeluaran > 0 ? ((info.total / totalPengeluaran) * 100).toFixed(0) : 0
      lines.push(`   • ${kat}: Rp ${info.total.toLocaleString('id-ID')} (${info.count} tx, ${pct}%)`)
    })
  }

  // ── Tahun Anggaran ──
  if (data.tahun) {
    lines.push('')
    lines.push(`   Tahun Anggaran: ${data.tahun}`)
  }

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════
// 2. GURU & TENDIK CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildGuruContext() {
  const guru = storageHelper.get('data_guru', [])
  const tendik = storageHelper.get('data_tendik', [])
  if (!guru?.length && !tendik?.length) return null

  const lines = []
  
  if (guru?.length) {
    const honorer = guru.filter(g => 
      (g.statusKepegawaian || g.status || '').toLowerCase().includes('honor')
    ).length
    lines.push(`📋 Guru: ${guru.length} orang (Honorer: ${honorer})`)
  }
  
  if (tendik?.length) {
    lines.push(`📋 Tendik: ${tendik.length} orang`)
  }

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════
// 3. SEKOLAH CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildSekolahContext() {
  const data = storageHelper.get('data_sekolah', null)
  if (!data) return null

  const lines = []
  lines.push(`🏫 ${data.nama || 'Sekolah'} | NPSN: ${data.npsn || '-'}`)
  
  if (data.alamat) lines.push(`   Alamat: ${data.alamat}`)
  if (data.kecamatan) lines.push(`   Kecamatan: ${data.kecamatan} | Kabupaten: ${data.kabupaten || '-'} | Provinsi: ${data.provinsi || '-'}`)
  
  const ks = data.pejabat?.ks?.nama || data.pejabat?.ks || ''
  const bendahara = data.pejabat?.bendahara?.nama || data.pejabat?.bendahara || ''
  if (ks) lines.push(`   Kepsek: ${ks}`)
  if (bendahara) lines.push(`   Bendahara: ${bendahara}`)

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════
// 4. LPJ CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildLpjContext() {
  const checklist = storageHelper.get('bku_lpj_checklist', {})
  const dokumenLpj = storageHelper.get('dokumen_lpj', {})
  if (!Object.keys(checklist).length && !Object.keys(dokumenLpj).length) return null

  const lines = []
  
  const checklistItems = Object.keys(checklist).length
  if (checklistItems > 0) {
    const completed = Object.values(checklist).filter(Boolean).length
    lines.push(`📋 LPJ Checklist: ${completed}/${checklistItems} selesai`)
  }

  const dokumenCount = Object.keys(dokumenLpj).length
  if (dokumenCount > 0) {
    lines.push(`📄 Dokumen LPJ: ${dokumenCount} dokumen`)
  }

  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════
// 5. REALISASI CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildRealisasiContext() {
  const data = storageHelper.get('realisasi_status', {})
  if (!Object.keys(data).length) return null

  const lines = []
  const items = Object.entries(data)
  const selesai = items.filter(([, v]) => v === true || v === 'selesai').length
  lines.push(`📊 Realisasi: ${selesai}/${items.length} item selesai`)
  
  return lines.join('\n')
}

// ═══════════════════════════════════════════════════════════════
// 6. DOKUMEN KELENGKAPAN CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildDokumenKelengkapanContext() {
  const data = storageHelper.get('dokumen_kelengkapan_status', {})
  if (!Object.keys(data).length) return null

  const items = Object.entries(data)
  const selesai = items.filter(([, v]) => v === true || v === 'lengkap').length
  return `📁 Dokumen Kelengkapan: ${selesai}/${items.length} dokumen`
}

// ═══════════════════════════════════════════════════════════════
// 7. NOMOR SURAT CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildNomorSuratContext() {
  const data = storageHelper.get('spj_nomor_surat', [])
  if (!data?.length) return null
  return `📜 Nomor Surat: ${data.length} surat telah dibuat`
}

// ═══════════════════════════════════════════════════════════════
// 8. NOTES CONTEXT
// ═══════════════════════════════════════════════════════════════

function buildNotesContext() {
  const data = storageHelper.get('notes', [])
  if (!data?.length) return null
  return `📝 Catatan: ${data.length} catatan tersimpan`
}

// ═══════════════════════════════════════════════════════════════
// 9. MAIN — Build Full Data Context
// ═══════════════════════════════════════════════════════════════

/**
 * Bangun konteks data lengkap dari semua sumber.
 * Hanya menyertakan data yang ADA (tidak kosong).
 * 
 * @param {object} options
 * @param {boolean} options.compact — Mode ultra-compact (default: true)
 * @param {number} options.maxChars — Maksimal karakter (default: 3500)
 * @returns {string|null} — Konteks data terformat, atau null jika tidak ada data
 */
export function buildFullContext(options = {}) {
  const { compact = true, maxChars = 3500 } = options

  const sections = []

  // Urutkan dari yang paling sering ditanyakan
  const bku = buildBkuContext()
  if (bku) sections.push(bku)

  const guru = buildGuruContext()
  if (guru) sections.push(guru)

  const sekolah = buildSekolahContext()
  if (sekolah) sections.push(sekolah)

  const lpj = buildLpjContext()
  if (lpj) sections.push(lpj)

  const realisasi = buildRealisasiContext()
  if (realisasi) sections.push(realisasi)

  const dokumen = buildDokumenKelengkapanContext()
  if (dokumen) sections.push(dokumen)

  const nomorSurat = buildNomorSuratContext()
  if (nomorSurat) sections.push(nomorSurat)

  const notes = buildNotesContext()
  if (notes) sections.push(notes)

  if (sections.length === 0) return null

  // Gabung dengan separator
  let context = `📊 DATA APLIKASI:\n\n${sections.join('\n\n')}`

  // Potong jika terlalu panjang
  if (context.length > maxChars) {
    context = context.substring(0, maxChars) + '\n... (data dipotong, terlalu panjang)'
  }

  return context
}

/**
 * Bangun konteks untuk pertanyaan spesifik tentang BKU.
 * Lebih detail dari buildFullContext() untuk BKU.
 * 
 * @param {object} query — Filter query (optional)
 * @returns {string|null}
 */
export function buildBkuDetailContext(query = {}) {
  const data = storageHelper.get('bku_data', null)
  if (!data?.transactions?.length) return null

  let txs = data.transactions
  
  // Terapkan filter jika ada
  if (query.bulan) {
    const bulanArr = Array.isArray(query.bulan) ? query.bulan : [query.bulan]
    txs = txs.filter(t => bulanArr.includes(Number(t.bulan)))
  }
  if (query.tipe) {
    const tipeArr = Array.isArray(query.tipe) ? query.tipe : [query.tipe]
    txs = txs.filter(t => tipeArr.includes(t.tipe))
  }

  if (!txs.length) return null

  const lines = []
  lines.push(`📊 Detail Transaksi (${txs.length} transaksi):`)

  // Tampilkan maks 15 transaksi terakhir
  const display = txs.slice(0, 15)
  display.forEach((t, i) => {
    const bulan = Number(t.bulan) >= 1 && Number(t.bulan) <= 12 ? BULAN_NAMES[Number(t.bulan) - 1] : t.bulan
    const nominal = t.pengeluaran > 0 
      ? `Rp ${Number(t.pengeluaran).toLocaleString('id-ID')}`
      : t.penerimaan > 0 
        ? `Rp ${Number(t.penerimaan).toLocaleString('id-ID')}`
        : '-'
    const uraian = (t.uraian || '').substring(0, 60)
    const kategori = detectKategori(t.kodeRekening) || ''
    lines.push(`   ${i+1}. [${bulan}] ${uraian} — ${nominal}${kategori ? ` (${kategori})` : ''}`)
  })

  if (txs.length > 15) {
    lines.push(`   ... dan ${txs.length - 15} transaksi lainnya`)
  }

  return lines.join('\n')
}

/**
 * Cek apakah ada data di aplikasi.
 * 
 * @returns {boolean}
 */
export function hasAnyData() {
  const bku = storageHelper.get('bku_data', null)
  const guru = storageHelper.get('data_guru', [])
  const tendik = storageHelper.get('data_tendik', [])
  const sekolah = storageHelper.get('data_sekolah', null)
  return !!(bku?.transactions?.length || guru?.length || tendik?.length || sekolah)
}

/**
 * Dapatkan ringkasan singkat (1 baris) — untuk quick context.
 * 
 * @returns {string|null}
 */
export function getQuickSummary() {
  const bku = storageHelper.get('bku_data', null)
  const guru = storageHelper.get('data_guru', [])
  const tendik = storageHelper.get('data_tendik', [])
  
  const parts = []
  if (bku?.transactions?.length) {
    parts.push(`${bku.transactions.length} transaksi BKU`)
  }
  if (guru?.length) {
    parts.push(`${guru.length} guru`)
  }
  if (tendik?.length) {
    parts.push(`${tendik.length} tendik`)
  }
  
  return parts.length > 0 ? `Data tersedia: ${parts.join(', ')}.` : null
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

export default {
  buildFullContext,
  buildBkuDetailContext,
  buildBkuContext,
  buildGuruContext,
  buildSekolahContext,
  hasAnyData,
  getQuickSummary,
}
