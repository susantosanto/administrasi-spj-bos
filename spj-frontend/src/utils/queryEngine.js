/**
 * queryEngine.js — Eksekutor Query JSON untuk Fitur "Ask to AI"
 *
 * Cara kerja:
 * 1. AI menganalisis pertanyaan user, lalu merespon JSON query
 * 2. QueryEngine mengeksekusi query tersebut terhadap data localStorage
 * 3. Hasil query dikirim ke AI untuk dijawab
 *
 * Format Query JSON yang didukung:
 *
 * --- Source Query: ambil data mentah ---
 * { "source": "bku_data" }
 * { "source": "data_guru", "search": "nama" }
 *
 * --- Filter Query: ambil data dengan filter ---
 * {
 *   "source": "bku_data",
 *   "filter": { "bulan": [2], "tipe": ["PEMBAYARAN"] }
 * }
 *
 * --- Aggregate Query: hitung total ---
 * {
 *   "source": "bku_data",
 *   "filter": { "bulan": [2], "tipe": ["PEMBAYARAN"] },
 *   "aggregate": { "sum": "pengeluaran" }
 * }
 *
 * --- Group Query: kelompokkan data ---
 * {
 *   "source": "bku_data",
 *   "groupBy": "bulan",
 *   "aggregate": { "sum": "pengeluaran" }
 * }
 */

import storageHelper from './storageHelper'

// ─── Nama bulan ───────────────────────────────────────────────
const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]
const bulanNameToNum = (name) => BULAN_NAMES.indexOf(name) + 1

// ─── Data sources ─────────────────────────────────────────────
const DATA_SOURCES = {
  bku_data:               () => storageHelper.get('bku_data', null),
  bku_lpj_checklist:      () => storageHelper.get('bku_lpj_checklist', {}),
  data_guru:              () => storageHelper.get('data_guru', []),
  data_tendik:            () => storageHelper.get('data_tendik', []),
  data_sekolah:           () => storageHelper.get('data_sekolah', null),
  dokumen_lpj:            () => storageHelper.get('dokumen_lpj', {}),
  dokumen_kelengkapan_status: () => storageHelper.get('dokumen_kelengkapan_status', {}),
  spj_nomor_surat:        () => storageHelper.get('spj_nomor_surat', []),
  notes:                  () => storageHelper.get('notes', []),
  realisasi_status:       () => storageHelper.get('realisasi_status', {}),
}

// ─── Ambil data mentah dari source ────────────────────────────
function fetchSource(sourceName) {
  const fn = DATA_SOURCES[sourceName]
  if (!fn) throw new Error(`Source '${sourceName}' tidak dikenal`)
  return fn()
}

// ─── Terapkan filter ──────────────────────────────────────────
function applyFilter(items, filter) {
  if (!filter || !items) return items

  // items bisa array atau objek
  if (!Array.isArray(items)) return items

  return items.filter((item) => {
    for (const [key, values] of Object.entries(filter)) {
      if (!Array.isArray(values)) continue
      const itemVal = item[key]

      // Handle bulan: bisa number (1-12) atau string nama bulan
      let normalizedVal = itemVal
      if (key === 'bulan' || key === 'bulanName') {
        if (typeof itemVal === 'string' && BULAN_NAMES.includes(itemVal)) {
          normalizedVal = bulanNameToNum(itemVal)
        }
      }

      // Normalize filter values: string bulan → number
      const normalizedValues = values.map((v) => {
        if ((key === 'bulan' || key === 'bulanName') && typeof v === 'string' && BULAN_NAMES.includes(v)) {
          return bulanNameToNum(v)
        }
        return v
      })

      // Cocokkan — pakai loose equality untuk number (antisipasi string "2" vs number 2)
      const isMatch = normalizedValues.some((v) => {
        if (v === normalizedVal) return true
        // Loose match untuk number vs string number
        if (typeof v === 'number' && typeof normalizedVal === 'string' && !isNaN(Number(normalizedVal))) {
          return v === Number(normalizedVal)
        }
        if (typeof normalizedVal === 'number' && typeof v === 'string' && !isNaN(Number(v))) {
          return normalizedVal === Number(v)
        }
        // Partial match untuk string
        if (typeof v === 'string' && typeof normalizedVal === 'string') {
          return normalizedVal.toLowerCase().includes(v.toLowerCase())
        }
        return false
      })

      if (!isMatch) return false
    }
    return true
  })
}

// ─── Terapkan search ──────────────────────────────────────────
function applySearch(items, searchTerm) {
  if (!searchTerm || !items || !Array.isArray(items)) return items
  const q = searchTerm.toLowerCase()
  return items.filter((item) => {
    return Object.values(item).some((val) => {
      if (typeof val === 'string') return val.toLowerCase().includes(q)
      if (typeof val === 'number') return String(val).includes(q)
      return false
    })
  })
}

// ─── Terapkan aggregate ───────────────────────────────────────
function applyAggregate(items, aggregate) {
  if (!aggregate || !items || !Array.isArray(items)) return null

  const result = {}

  if (aggregate.sum) {
    result.sum = items.reduce((s, item) => s + (Number(item[aggregate.sum]) || 0), 0)
    result.field = aggregate.sum
    result.count = items.length
  }

  if (aggregate.count) {
    result.count = items.length
  }

  return result
}

// ─── Terapkan groupBy + aggregate ─────────────────────────────
function applyGroupBy(items, groupBy, aggregate) {
  if (!groupBy || !items || !Array.isArray(items)) return items

  const groups = {}
  items.forEach((item) => {
    let key = item[groupBy]

    // Handle bulan: number → nama bulan
    if (groupBy === 'bulan' && typeof key === 'number') {
      key = BULAN_NAMES[key - 1] || `Bulan ${key}`
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })

  if (!aggregate) return groups

  // Aggregate per group
  const result = {}
  for (const [key, groupItems] of Object.entries(groups)) {
    result[key] = applyAggregate(groupItems, aggregate)
  }
  return result
}

// ─── Format hasil query untuk dikirim ke AI ───────────────────
export function formatQueryResult(query, rawResult, allTransactions) {
  if (rawResult === null || rawResult === undefined) return 'Data tidak ditemukan.'
  
  const lines = []

  // ── Jika hasil filter kosong, tampilkan bulan apa saja yang ADA ──
  const isEmpty = (Array.isArray(rawResult) && rawResult.length === 0) ||
    (typeof rawResult === 'object' && rawResult !== null &&
     'field' in rawResult && 'count' in rawResult && rawResult.count === 0)

  if (isEmpty) {
    if (allTransactions && allTransactions.length > 0) {
      // Cari bulan yang tersedia di semua transaksi
      const bulanSet = new Set()
      allTransactions.forEach((t) => {
        if (t.bulan >= 1 && t.bulan <= 12) bulanSet.add(t.bulan)
      })
      const bulanTersedia = [...bulanSet].sort((a, b) => a - b).map((b) => BULAN_NAMES[b - 1])
      
      if (bulanTersedia.length > 0) {
        lines.push(`Tidak ditemukan data untuk filter yang diminta.`)
        lines.push(`Bulan yang tersedia di BKU: ${bulanTersedia.join(', ')}.`)
        
        // Ringkasan per bulan yang tersedia
        lines.push(`Ringkasan pengeluaran per bulan:`)
        bulanTersedia.forEach((bulanName) => {
          const bulanNum = BULAN_NAMES.indexOf(bulanName) + 1
          const bulanTx = allTransactions.filter(
            (t) => t.bulan === bulanNum && t.tipe === 'PEMBAYARAN'
          )
          const total = bulanTx.reduce((s, t) => s + (t.pengeluaran || 0), 0)
          if (total > 0) {
            lines.push(`  • ${bulanName}: Rp ${total.toLocaleString('id-ID')} (${bulanTx.length} transaksi)`)
          }
        })
        return lines.join('\n')
      }
    }
    return 'Data kosong (tidak ada hasil).'
  }

  // ── Buat deskripsi konteks filter untuk AI ──
  // Note: pastikan vals selalu array, AI kadang kirim single value
  const filterDesc = query.filter
    ? Object.entries(query.filter)
        .map(([key, vals]) => {
          // Normalisasi ke array jika single value
          const arr = Array.isArray(vals) ? vals : [vals]
          if (key === 'bulan') {
            return arr.map(v => {
              const n = Number(v)
              return (n >= 1 && n <= 12) ? BULAN_NAMES[n - 1] : v
            }).join(', ')
          }
          if (key === 'tipe') return arr.join(', ')
          return `${key}: ${arr.join(', ')}`
        })
        .join(', ')
    : 'semua data'

  if (query.aggregate && !query.groupBy) {
    // Hasil aggregate sederhana
    lines.push(`Hasil perhitungan: ${filterDesc}`)
    if (rawResult.sum !== undefined) {
      lines.push(`Total: Rp ${rawResult.sum.toLocaleString('id-ID')}`)
      lines.push(`Jumlah item: ${rawResult.count}`)
    }
  } else if (query.groupBy) {
    // Hasil group
    lines.push(`Hasil grup per "${query.groupBy}" dari "${query.source}":`)
    if (query.aggregate) {
      for (const [key, agg] of Object.entries(rawResult)) {
        if (agg && agg.sum !== undefined) {
          lines.push(`  • ${key}: Rp ${agg.sum.toLocaleString('id-ID')} (${agg.count} item)`)
        }
      }
    } else {
      for (const [key, groupItems] of Object.entries(rawResult)) {
        lines.push(`  • ${key}: ${groupItems.length} item`)
      }
    }
  } else if (Array.isArray(rawResult)) {
    // Array data — batasi 20 item untuk hemat token
    if (rawResult.length > 20) {
      lines.push(`Ditemukan ${rawResult.length} item dari "${query.source}":`)
      rawResult.slice(0, 15).forEach((item, i) => {
        lines.push(`  ${i + 1}. ${formatItem(item)}`)
      })
      lines.push(`  ... dan ${rawResult.length - 15} item lainnya`)
    } else {
      lines.push(`Data dari "${query.source}" (${rawResult.length} item):`)
      rawResult.forEach((item, i) => {
        lines.push(`  ${i + 1}. ${formatItem(item)}`)
      })
    }
  } else if (typeof rawResult === 'object') {
    // Object tunggal (data_sekolah, dll)
    lines.push(`Data dari "${query.source}":`)
    for (const [key, val] of Object.entries(rawResult)) {
      if (typeof val === 'object' && val !== null) {
        lines.push(`  ${key}: ${JSON.stringify(val).substring(0, 100)}`)
      } else {
        lines.push(`  ${key}: ${val || '-'}`)
      }
    }
  } else {
    lines.push(`Hasil: ${rawResult}`)
  }

  return lines.join('\n')
}

// ─── Format 1 item untuk ditampilkan ──────────────────────────
function formatItem(item) {
  if (!item || typeof item !== 'object') return String(item)
  const parts = []

  // Prioritas field yang ditampilkan
  const fields = ['uraian', 'nama', 'tanggal', 'pengeluaran', 'penerimaan', 'tipe', 'bulan', 'nip', 'status']
  for (const f of fields) {
    if (item[f] !== undefined && item[f] !== null && item[f] !== '') {
      let val = item[f]
      if (f === 'bulan' && typeof val === 'number') val = BULAN_NAMES[val - 1] || val
      if ((f === 'pengeluaran' || f === 'penerimaan') && typeof val === 'number') {
        val = `Rp ${val.toLocaleString('id-ID')}`
      }
      parts.push(`${f}: ${val}`)
    }
  }

  // Jika tidak ada field yang cocok, tampilkan beberapa field pertama
  if (parts.length === 0) {
    return JSON.stringify(item).substring(0, 120)
  }

  return parts.join(' | ')
}

// ─── MAIN: executeQuery ───────────────────────────────────────
/**
 * Eksekusi query JSON terhadap data localStorage.
 *
 * @param {object} query — Query JSON dari AI
 * @returns {object} { raw: hasil mentah, formatted: string untuk AI, source: nama source }
 */
export function executeQuery(query) {
  if (!query || !query.source) {
    return { raw: null, formatted: 'Query tidak lengkap (source diperlukan).', source: null }
  }

  const source = query.source
  let data = fetchSource(source)

  // Jika data null/undefined, return kosong
  if (data === null || data === undefined) {
    return { raw: null, formatted: `Data '${source}' belum tersedia.`, source }
  }

  // Transactions wrapper (bku_data punya wrapper { transactions: [...] })
  let items = data
  if (source === 'bku_data' && data.transactions) {
    items = data.transactions
  }

  // ── DEBUG LOG ──
  if (source === 'bku_data') {
    console.log('🔍 QueryEngine: source=bku_data', 
      'total transaksi:', items.length,
      'filter:', JSON.stringify(query.filter),
      'aggregate:', JSON.stringify(query.aggregate))
    
    // Cek filter bulan 2 sebelum apply
    if (query.filter?.bulan) {
      const bulan2 = items.filter(t => t.bulan == 2).length
      const bulan2tipe = items.filter(t => t.bulan == 2 && t.tipe === 'PEMBAYARAN').length
      console.log('  Before filter — bulan 2:', bulan2, '| bulan 2 + PEMBAYARAN:', bulan2tipe)
    }
  }

  // Apply filter
  if (query.filter) {
    items = applyFilter(items, query.filter)
  }

  // ── DEBUG LOG (after filter) ──
  if (source === 'bku_data') {
    console.log('  After filter — hasil:', items.length, 'item')
  }

  // Apply search
  if (query.search) {
    items = applySearch(items, query.search)
  }

  // Apply groupBy + aggregate
  let result
  if (query.groupBy) {
    result = applyGroupBy(items, query.groupBy, query.aggregate)
  } else if (query.aggregate) {
    result = applyAggregate(items, query.aggregate)
  } else {
    result = items
  }

  // ── DEBUG LOG (result) ──
  if (source === 'bku_data' && query.aggregate) {
    console.log('  Aggregate result:', JSON.stringify(result))
  }

  // Simpan semua transaksi untuk referensi (dipakai formatQueryResult jika hasil filter kosong)
  const allTxs = (source === 'bku_data' && data.transactions) ? data.transactions : null

  const formatted = formatQueryResult(query, result, allTxs)
  
  // ── DEBUG LOG (formatted) ──
  if (source === 'bku_data') {
    console.log('  Formatted output:', formatted.substring(0, 200))
  }

  return { raw: result, formatted, source }
}

// ─── Ekspor ───────────────────────────────────────────────────
export default {
  executeQuery,
  formatQueryResult,
  fetchSource,
  applyFilter,
  applyAggregate,
  applyGroupBy,
  BULAN_NAMES,
}
