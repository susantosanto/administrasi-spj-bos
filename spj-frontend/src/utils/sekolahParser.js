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
  // Sprint 024 (Instrumen BOS seksi A — dari profil Dapodik).
  nomorRekening: ['nomor rekening', 'no rekening', 'no. rekening'],
  bankRekening: ['nama bank'],
  namaRekening: ['rekening atas nama', 'atas nama rekening', 'nama tertera pada rekening', 'tertera pada rekening'],
  status: ['status sekolah'],
  ijin: ['ijin', 'izin', 'izin operasional', 'ijin operasional'],
  telepon: ['nomor telepon', 'telepon', 'telp'],
  email: ['email', 'e-mail', 'surat elektronik'],
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

  // ── SCAN 3 (fallback): label PERSIS "SEKOLAH" ──
  // Sheet Data contoh memakai label pendek: A2 "DATA SEKOLAH", A4 "SEKOLAH"
  // → C4 nama sekolah. Keyword 'nama sekolah' tak mengenali label ini, jadi
  // nama sekolah kosong → bar biru Cover LPJ tercetak KOSONG (temuan user
  // 2026-10-18: "di cover ada nama SD nya di background biru"). Dijalankan
  // SETELAH SCAN 1/2 agar label lengkap tetap menang bila ada.
  // Pencocokan PERSIS (bukan includes) supaya "alamat sekolah" tidak tersapu.
  if (!result.nama_sekolah) {
    scanSekolah:
    for (let r = 0; r < MAX_SCAN_ROWS; r++) {
      for (let c = 0; c < MAX_SCAN_COLS; c++) {
        const cellVal = getCell(ws, r, c)
        if (!cellVal) continue
        const cellStr = String(cellVal).toLowerCase()
          .replace(/[:;,.\-]/g, ' ').replace(/\s+/g, ' ').trim()
        if (cellStr !== 'sekolah') continue

        let value = getValueRight(ws, r, c)
        if (!value) value = getValueBelow(ws, r, c)
        if (value) {
          result.nama_sekolah = value
          foundLabels.nama_sekolah = true
          break scanSekolah
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

// ─── Personil & Siswa (Sprint 024 — Instrumen BOS seksi A/C) ───
// PTK sheet: kolom 'Status Kepegawaian' + 'Jenis PTK' (+ 'Tugas Tambahan'
// untuk mengecualikan Kepala Sekolah dari "guru selain KS").
// Peserta Didik sheet: triple angka [L, P, Total] dengan L+P=Total → Total
// terbesar = jumlah siswa.

function kolomHeader(ws, barisHeader, maksKol = 40) {
  const peta = {}
  for (let c = 0; c < maksKol; c++) {
    const v = getCell(ws, barisHeader, c)
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      peta[String(v).trim().toLowerCase()] = c
    }
  }
  return peta
}

function cariBarisHeader(ws, kataKunci, maksBaris = 15, maksKol = 40) {
  const kws = kataKunci.map((k) => k.toLowerCase())
  for (let r = 0; r < maksBaris; r++) {
    let cocok = 0
    for (let c = 0; c < maksKol; c++) {
      const v = getCell(ws, r, c)
      if (v === null || v === undefined) continue
      const s = String(v).toLowerCase()
      if (kws.some((k) => s.includes(k))) cocok++
    }
    if (cocok >= kataKunci.length) return r
  }
  return -1
}

function hitungPtk(ws) {
  const out = { jmlGuru: 0, jmlGuruPns: 0, jmlGuruNonAsn: 0, jmlTendik: 0, jmlTendikPns: 0, jmlTendikNonAsn: 0 }
  const hr = cariBarisHeader(ws, ['nama', 'status kepegawaian', 'jenis ptk'])
  if (hr < 0) return out
  const peta = kolomHeader(ws, hr)
  const cNama = peta['nama']
  const cStatus = Object.keys(peta).find((k) => k.includes('status kepegawaian'))
  const cJenis = Object.keys(peta).find((k) => k.includes('jenis ptk'))
  const cTugas = Object.keys(peta).find((k) => k.includes('tugas tambahan'))
  if (cNama === undefined || cStatus === undefined || cJenis === undefined) return out
  let mulai = false
  let kosongBeruntun = 0
  for (let r = hr + 1; r < hr + 500; r++) {
    const nama = getCell(ws, r, cNama)
    if (nama === null || nama === undefined || String(nama).trim() === '') {
      // Baris sub-header (mis. "Gelar Depan…") sebelum data: lewati.
      // Berhenti hanya bila kosong SETELAH data dimulai (akhir tabel).
      if (!mulai) continue
      if (++kosongBeruntun >= 3) break
      continue
    }
    kosongBeruntun = 0
    mulai = true
    const status = String(getCell(ws, r, peta[cStatus]) || '')
    const jenis = String(getCell(ws, r, peta[cJenis]) || '')
    const tugas = cTugas !== undefined ? String(getCell(ws, r, peta[cTugas]) || '') : ''
    if (/kepala sekolah/i.test(tugas)) continue // "guru SELAIN Kepala Sekolah"
    const isGuru = /guru/i.test(jenis)
    const isTendik = /tenaga kependidikan|tendik/i.test(jenis)
    if (!isGuru && !isTendik) continue
    const isPns = /^\s*pns\s*$/i.test(status)
    if (isGuru) {
      out.jmlGuru++
      if (isPns) out.jmlGuruPns++
      else out.jmlGuruNonAsn++
    } else {
      out.jmlTendik++
      if (isPns) out.jmlTendikPns++
      else out.jmlTendikNonAsn++
    }
  }
  return out
}

function hitungSiswa(ws) {
  let total = 0
  for (let r = 0; r < 60; r++) {
    const baris = []
    for (let c = 0; c < 20; c++) {
      const v = getCell(ws, r, c)
      baris.push(typeof v === 'number' ? v : null)
    }
    for (let c = 0; c + 2 < baris.length; c++) {
      const [a, b, t] = [baris[c], baris[c + 1], baris[c + 2]]
      if (a != null && b != null && t != null && a + b === t && t > total) total = t
    }
  }
  return total || ''
}

function parsePersonil(workbook) {
  const out = {}
  const namaSheet = workbook.SheetNames || []
  const sheetPtk = namaSheet.find((s) => /ptk|pendidik|tenaga/i.test(s))
  if (sheetPtk) Object.assign(out, hitungPtk(workbook.Sheets[sheetPtk]))
  const sheetSiswa = namaSheet.find((s) => /peserta|siswa|murid|didik/i.test(s))
  if (sheetSiswa) {
    const jml = hitungSiswa(workbook.Sheets[sheetSiswa])
    if (jml !== '') out.jmlSiswa = jml
  }
  for (const k of Object.keys(out)) {
    if (typeof out[k] === 'number') out[k] = String(out[k])
  }
  return out
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
        // Sprint 024: personil + siswa dari sheet PTK/Peserta Didik.
        Object.assign(parsed, parsePersonil(workbook))

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
