/**
 * Sekolah Excel Parser Utility
 * 
 * Flexible parser untuk ekstrak data profil sekolah dari file Excel.
 * Bekerja dengan cara SCAN semua cell untuk menemukan label-value pairs.
 * 
 * Mendukung 2 format:
 * 1. Format Dapodik: [col0:index] [col1:LABEL] [col2:":"] [col3:VALUE]
 * 2. Format BKU ARKAS: [col0:LABEL] [col4:": VALUE"]
 */

import * as XLSX from 'xlsx'

// ─── Constants ─────────────────────────────────────────────────

const LABEL_MAP = {
  npsn: ['npsn'],
  nama_sekolah: ['nama sekolah'],
  alamat: ['alamat'],
  kabupaten: ['kabupaten/kota', 'kabupaten', 'kota'],
  provinsi: ['provinsi'],
  tahunAnggaran: ['tahun anggaran', 'tahun'],
  kecamatan: ['kecamatan'],
}

const MAX_SCAN_ROWS = 60
const MAX_SCAN_COLS = 30

// ─── Utility Functions ─────────────────────────────────────────

function getCellVal(ws, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = ws[addr]
  return cell !== undefined && cell !== null ? cell.v : undefined
}

function getCell(ws, row, col) {
  const v = getCellVal(ws, row, col)
  return v !== undefined ? v : null
}

function cleanValue(val) {
  if (val === null || val === undefined) return ''
  return String(val).trim().replace(/^:\s*/, '').trim()
}

function isSeparator(val) {
  return /^[:;,\-\\/|]+$/.test(val)
}

function matchesLabel(cellValue, keywords) {
  if (!cellValue) return false
  const str = String(cellValue).toLowerCase().trim()
    .replace(/[:;,.\-]/g, ' ').replace(/\s+/g, ' ').trim()
  return keywords.some(kw => str.includes(kw))
}

function getValueRight(ws, row, col, maxOffset = 8) {
  for (let offset = 1; offset <= maxOffset; offset++) {
    const val = getCell(ws, row, col + offset)
    if (val !== null && val !== undefined) {
      const cleaned = cleanValue(val)
      if (cleaned && !isSeparator(cleaned)) return cleaned
    }
  }
  return ''
}

function getValueBelow(ws, row, col, maxOffset = 3) {
  for (let offset = 1; offset <= maxOffset; offset++) {
    const val = getCell(ws, row + offset, col)
    if (val !== null && val !== undefined) {
      const cleaned = cleanValue(val)
      if (cleaned && !isSeparator(cleaned)) return cleaned
    }
  }
  return ''
}

function extractValueFromLabel(labelStr) {
  if (!labelStr) return ''
  const str = String(labelStr).trim()
  const colonIdx = str.indexOf(':')
  if (colonIdx >= 0) {
    const afterColon = str.substring(colonIdx + 1).trim()
    if (afterColon) return afterColon
  }
  return ''
}

function extractYear(str) {
  if (!str) return ''
  const match = String(str).match(/\b(20\d{2})\b/)
  return match ? match[1] : ''
}

function extractKecamatanFromAlamat(alamat) {
  if (!alamat) return ''
  const match = String(alamat).match(/\bKec\.?\s*\.?\s*([A-Za-z\s.]+?)(?:,|$)/i)
  return match ? match[1].trim() : ''
}

// ─── Generic Label-Value Scanner ──────────────────────────────

/**
 * Scan ALL label-value pairs from worksheet generically.
 * Works with format: [col0:index] [col1:LABEL] [col2:":"] [col3:VALUE]
 * Also handles: [col0:LABEL] with value to the right or below.
 */
function scanAllFields(ws) {
  const fields = [] // { label, value, row, section? }
  let currentSection = ''

  for (let r = 0; r < MAX_SCAN_ROWS; r++) {
    // Detect section headers (rows with data only at col 0 or col 1, no index number)
    const c0 = getCellVal(ws, r, 0)
    const c1 = getCellVal(ws, r, 1)

    // Section header detection: has text but no value at col 3
    const c3 = getCellVal(ws, r, 3)
    const hasValue = c3 !== undefined && String(c3).trim() !== '' && String(c3).trim() !== ':'

    if (!hasValue) {
      // Could be a section header
      const sectionText = c1 ? String(c1).trim() : (c0 ? String(c0).trim() : '')
      if (sectionText && sectionText.length > 3 && !sectionText.match(/^\d+$/) && !sectionText.match(/^[:;,\-]+$/)) {
        // Check if it looks like a section title (not an index number)
        if (!c0 || String(c0).trim().match(/^\d+\.\s/)) {
          currentSection = sectionText
        }
      }
      continue
    }

    // Found a label-value pair
    const labelCell = c1 !== undefined && String(c1).trim() ? c1 : (c0 !== undefined ? c0 : null)
    if (!labelCell) continue

    const label = String(labelCell).trim()
    // Skip rows where col0 is a number (index) and col1 is empty
    if (c0 !== undefined && String(c0).trim().match(/^\d+$/) && (!c1 || String(c1).trim() === '')) continue
    // Skip pure number labels or separator-only labels
    if (label.match(/^\d+$/) || isSeparator(label)) continue
    // Skip labels that are too short (like "0", "1")
    if (label.length < 3 && !matchesLabel(label, ['rt', 'rw'])) continue

    // Get value
    let value = ''
    
    // Try col 3 first (Dapodik format)
    if (c3 !== undefined && String(c3).trim() !== '' && String(c3).trim() !== ':') {
      value = cleanValue(c3)
    }
    
    // Try col 4 next (BKU format)
    if (!value) {
      const c4 = getCellVal(ws, r, 4)
      if (c4 !== undefined) {
        value = cleanValue(c4)
        if (isSeparator(value)) value = ''
      }
    }
    
    // Try getValueRight from col 1
    if (!value) {
      value = getValueRight(ws, r, 1)
    }

    if (value && !isSeparator(value)) {
      fields.push({
        label,
        value,
        section: currentSection,
      })
    }
  }

  return fields
}

// ─── Main Scanning Logic ───────────────────────────────────────

function parseByScanning(ws) {
  const result = {}
  const foundLabels = {}

  // ── SCAN 1: Cari label di kolom A ──
  for (let r = 0; r < MAX_SCAN_ROWS; r++) {
    const labelCell = getCell(ws, r, 0)
    if (!labelCell) continue
    const labelStr = String(labelCell).trim()

    for (const [field, keywords] of Object.entries(LABEL_MAP)) {
      if (foundLabels[field]) continue
      if (!matchesLabel(labelStr, keywords)) continue

      let value = extractValueFromLabel(labelStr)
      if (!value) value = getValueRight(ws, r, 0)
      if (!value) value = getValueBelow(ws, r, 0)

      if (value) {
        if (field === 'tahunAnggaran') {
          const year = extractYear(value)
          if (!year) continue
          value = year
        }
        result[field] = value
        foundLabels[field] = true
      }
    }
  }

  // ── SCAN 2: Scan SEMUA kolom ──
  for (const [field, keywords] of Object.entries(LABEL_MAP)) {
    if (foundLabels[field]) continue

    outer:
    for (let r = 0; r < MAX_SCAN_ROWS; r++) {
      for (let c = 0; c < MAX_SCAN_COLS; c++) {
        const cellVal = getCell(ws, r, c)
        if (!cellVal) continue
        const cellStr = String(cellVal).trim()
        if (!matchesLabel(cellStr, keywords)) continue

        let value = extractValueFromLabel(cellStr)
        if (!value) value = getValueRight(ws, r, c)
        if (!value) value = getValueBelow(ws, r, c)

        if (value) {
          if (field === 'tahunAnggaran') {
            const year = extractYear(value)
            if (!year) continue
            value = year
          }
          result[field] = value
          foundLabels[field] = true
          break outer
        }
      }
    }
  }

  // ── POST-PROCESS ──
  if (!foundLabels.tahunAnggaran) {
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const val = getCell(ws, r, c)
        if (val) {
          const year = extractYear(val)
          if (year) { result.tahunAnggaran = year; foundLabels.tahunAnggaran = true; break }
        }
      }
      if (foundLabels.tahunAnggaran) break
    }
  }

  if (!foundLabels.kecamatan && result.alamat) {
    const kec = extractKecamatanFromAlamat(result.alamat)
    if (kec) result.kecamatan = kec
  }

  if (result.tahunAnggaran && result.tahunAnggaran.length > 4) {
    const year = extractYear(result.tahunAnggaran)
    if (year) result.tahunAnggaran = year
  }

  // ── Capture ALL fields generically ──
  result.allFields = scanAllFields(ws)

  return result
}

// ─── Public API ────────────────────────────────────────────────

export function parseSekolahExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('Tidak ada sheet yang ditemukan di file Excel'))
          return
        }

        const sheetName = workbook.SheetNames[0]
        const ws = workbook.Sheets[sheetName]
        const parsed = parseByScanning(ws)

        const hasSchoolData = parsed.npsn || parsed.nama_sekolah
        const hasLocationData = parsed.kabupaten || parsed.provinsi || parsed.alamat

        if (!hasSchoolData && !hasLocationData) {
          let foundAnyData = false
          for (let i = 1; i < workbook.SheetNames.length; i++) {
            const altWs = workbook.Sheets[workbook.SheetNames[i]]
            const altParsed = parseByScanning(altWs)
            if (altParsed.npsn || altParsed.nama_sekolah || altParsed.alamat) {
              Object.assign(parsed, altParsed)
              foundAnyData = true
              break
            }
          }
          if (!foundAnyData) {
            reject(new Error(
              'Tidak ditemukan data sekolah di file. ' +
              'Pastikan file Excel mengandung informasi seperti NPSN, Nama Sekolah, Alamat, dll.'
            ))
            return
          }
        }

        resolve({
          success: true,
          sheetName,
          header: parsed,
          allFields: parsed.allFields || [],
          parsedAt: new Date().toISOString(),
        })
      } catch (error) {
        reject(new Error(`Gagal membaca file: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}

export default {
  parseSekolahExcel,
}
