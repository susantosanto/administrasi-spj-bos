/**
 * pdfTableExtractor.js — Ekstraksi Tabel dari PDF
 *
 * Menggunakan pdfjs-dist untuk membaca text items beserta posisinya,
 * lalu mendeteksi struktur tabel berdasarkan alignment vertikal & horizontal.
 *
 * Cara pakai:
 *   import { extractTables } from './pdfTableExtractor'
 *   const { tables, cleanText } = await extractTables(pdfDoc)
 */

// ─── Thresholds ──────────────────────────────────────────────────
const Y_THRESHOLD = 4        // tolerance baris yang sama (dalam pt)
const X_THRESHOLD = 6        // tolerance kolom yang sama (dalam pt)
const MIN_TABLE_ROWS = 3     // minimal baris untuk dianggap tabel
const MIN_TABLE_COLS = 2     // minimal kolom untuk dianggap tabel
const MAX_ROW_GAP = 20       // gap maksimal antar baris dalam tabel (pt)
const HEADER_ROW_RATIO = 0.3 // header bold detection ratio

/**
 * Kelompokkan text items per baris berdasarkan y-position
 */
function groupByRow(items, pageHeight) {
  const rows = []

  for (const item of items) {
    const y = Math.round(item.y / Y_THRESHOLD) * Y_THRESHOLD
    let found = false
    for (const row of rows) {
      if (Math.abs(row.y - y) <= Y_THRESHOLD) {
        row.items.push(item)
        found = true
        break
      }
    }
    if (!found) {
      rows.push({ y, items: [item] })
    }
  }

  // Sort dari atas ke bawah (PDF: y besar = bawah, jadi reverse)
  return rows.sort((a, b) => b.y - a.y)
}

/**
 * Kelompokkan items dalam row per kolom berdasarkan x-position
 */
function groupByColumn(items) {
  const cols = []

  for (const item of items) {
    const x = Math.round(item.x / X_THRESHOLD) * X_THRESHOLD
    let found = false
    for (const col of cols) {
      if (Math.abs(col.x - x) <= X_THRESHOLD) {
        col.texts.push(item.str)
        found = true
        break
      }
    }
    if (!found) {
      cols.push({ x, texts: [item.str] })
    }
  }

  return cols.sort((a, b) => a.x - b.x)
}

/**
 * Cek apakah suatu baris punya properti bold/header
 */
function isBoldRow(items, fontSize) {
  if (!items.length) return false
  // Jika font size lebih besar dari rata-rata, mungkin header
  const avgSize = items.reduce((s, i) => s + (i.fontSize || 0), 0) / items.length
  return avgSize > fontSize * 1.1
}

/**
 * Deteksi apakah sekelompok baris membentuk tabel
 */
function isTableStructure(rows) {
  if (rows.length < MIN_TABLE_ROWS) return false

  // Hitung jumlah kolom per baris
  const colCounts = rows.map(r => groupByColumn(r.items).length)
  const consistentCols = colCounts.filter(c => c >= MIN_TABLE_COLS)
  const ratio = consistentCols.length / rows.length

  // Jika >70% baris punya jumlah kolom konsisten, ini tabel
  return ratio > 0.6
}

/**
 * Deduksi header row (baris pertama tabel yang sering bold/kapital)
 */
function detectHeaderRow(rows, fontSize) {
  if (rows.length < 2) return -1

  const firstRow = rows[0]
  const firstRowItems = firstRow.items || []

  // Cek: baris pertama semua text pendek dan kapital?
  const allShort = firstRowItems.every(i => (i.str || '').trim().length < 30)
  const allUpper = firstRowItems.every(i => {
    const s = (i.str || '').trim()
    return s.length > 0 && s === s.toUpperCase()
  })
  const isBold = isBoldRow(firstRowItems, fontSize)

  return (allShort || allUpper || isBold) ? 0 : -1
}

/**
 * Format satu tabel sebagai CSV string
 */
function formatAsCSV(rows, headerRowIndex) {
  let result = ''

  rows.forEach((row, idx) => {
    const cols = groupByColumn(row.items)
    const values = cols.map(c => c.texts.join(' ').trim())
    const line = values.join('\t')
    if (idx === headerRowIndex) {
      result += `📋 HEADER: ${line}\n`
    } else {
      result += `   ${line}\n`
    }
  })

  return result
}

/**
 * Format tabel sebagai Markdown table
 */
function formatAsMarkdown(rows, headerRowIndex) {
  const colsList = rows.map(r => groupByColumn(r.items))
  const maxCols = Math.max(...colsList.map(c => c.length))

  // Ambil header
  const headerCols = headerRowIndex >= 0 ? colsList[headerRowIndex] : []
  const headers = headerCols.map(c => c.texts.join(' ').trim())
  while (headers.length < maxCols) headers.push('')

  // Header
  let result = '| ' + headers.join(' | ') + ' |\n'
  result += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

  // Data rows
  rows.forEach((row, idx) => {
    if (idx === headerRowIndex) return
    const cols = colsList[idx]
    const values = cols.map(c => c.texts.join(' ').trim())
    while (values.length < maxCols) values.push('')
    result += '| ' + values.join(' | ') + ' |\n'
  })

  return result
}

/**
 * Main: Extract tables from a PDF document
 *
 * @param {object} pdfDoc — PDF document from pdfjs.getDocument()
 * @param {object} options
 * @param {number} options.maxPages — Max pages to process (default: all)
 * @returns {Promise<{tables: Array, cleanText: string, tableCount: number}>}
 */
export async function extractTables(pdfDoc, options = {}) {
  const { maxPages = pdfDoc.numPages } = options
  const allTables = []
  let fullText = ''

  for (let pageNum = 1; pageNum <= Math.min(maxPages, pdfDoc.numPages); pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const content = await page.getTextContent()
    const viewport = page.getViewport({ scale: 1 })
    const pageHeight = viewport.height
    const fontSize = content.items.reduce((s, i) => s + (i.fontSize || 10), 0) / (content.items.length || 1)

    // Text items with position
    const items = content.items
      .filter(item => item.str && item.str.trim())
      .map(item => ({
        str: item.str,
        x: item.transform?.[4] || 0,
        y: item.transform?.[5] || 0,
        width: item.width || 0,
        height: item.height || 0,
        fontSize: item.fontSize || 10,
        fontName: item.fontName || '',
      }))

    if (items.length === 0) {
      fullText += `--- HALAMAN ${pageNum} ---\n(Kosong)\n\n`
      continue
    }

    // Group by rows
    const rows = groupByRow(items, pageHeight)
    if (rows.length === 0) {
      fullText += `--- HALAMAN ${pageNum} ---\n${items.map(i => i.str).join(' ')}\n\n`
      continue
    }

    // Try to detect tables
    let tableFound = false

    // Sliding window: cari grup baris yang punya struktur tabel
    for (let start = 0; start < rows.length - MIN_TABLE_ROWS + 1; start++) {
      for (let end = start + MIN_TABLE_ROWS; end <= rows.length; end++) {
        const candidate = rows.slice(start, end)
        if (isTableStructure(candidate)) {
          const headerIdx = detectHeaderRow(candidate, fontSize)
          const csvText = formatAsCSV(candidate, headerIdx)
          const mdTable = formatAsMarkdown(candidate, headerIdx)

          allTables.push({
            page: pageNum,
            rows: candidate.length,
            cols: groupByColumn(candidate[0]?.items || []).length,
            headerRow: headerIdx >= 0,
            csv: csvText,
            markdown: mdTable,
            // Calculate column bounds for later use
            colBounds: groupByColumn(candidate[0]?.items || []).map(c => c.x),
          })

          fullText += `--- HALAMAN ${pageNum} — TABEL ${allTables.length} ---\n`
          fullText += csvText + '\n'
          tableFound = true

          // Skip processed rows
          start = end
          break
        }
      }
    }

    // Non-table text (text antar tabel)
    if (!tableFound) {
      const rawText = items.map(i => i.str).join(' ').replace(/\s+/g, ' ')
      if (rawText.trim()) {
        fullText += `--- HALAMAN ${pageNum} ---\n${rawText.trim()}\n\n`
      }
    }
  }

  return {
    tables: allTables,
    tableText: fullText,
    tableCount: allTables.length,
  }
}

/**
 * Extract all text from PDF (fallback jika tabel gagal)
 */
export async function extractAllText(pdfDoc) {
  let fullText = ''

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items
      .map(item => item.str)
      .filter(s => s.trim())
      .join(' ')
    if (text.trim()) {
      fullText += `--- HALAMAN ${i} ---\n${text.trim()}\n\n`
    }
  }

  return fullText
}

export default { extractTables, extractAllText }
