/**
 * Guru & Tendik Excel Parser Utility
 * Parses Dapodik export files for Guru and Tenaga Kependidikan (Tendik)
 *
 * FORMAT: 51-column Dapodik standard export
 * ┌────────────┬──────┬────────────────────────────────┐
 * │ Field      │ Idx │ Keterangan                     │
 * ├────────────┼──────┼────────────────────────────────┤
 * │ No         │ 0    │ Nomor urut                    │
 * │ Nama       │ 1    │ Nama lengkap                  │
 * │ NUPTK      │ 2    │ NUPTK                         │
 * │ JK         │ 3    │ L/P                           │
 * │ Tpt Lahir  │ 4    │ Tempat lahir                  │
 * │ Tgl Lahir  │ 5    │ Tanggal lahir (YYYY-MM-DD)    │
 * │ NIP        │ 6    │ NIP (kosong utk honorer)      │
 * │ Status Peg.│ 7    │ PNS/PPPK/Honorer              │
 * │ Jenis PTK  │ 8    │ Guru Mapel, Kepala Sekolah... │
 * │ ...        │ ...  │ (51 kolom total)              │
 * │ Pangkat Gol│ 26   │ Golongan (IV/a, III/b, dll)   │
 * │ NIK        │ 43   │ NIK                           │
 * └────────────┴──────┴────────────────────────────────┘
 */

import * as XLSX from 'xlsx'

// ─── Constants ─────────────────────────────────────────────────

const HEADER_ROW = 4       // Row 5 (0-indexed) — header "No | Nama | NUPTK | ..."
const DATA_START_ROW = 5   // Row 6+ — data rows
const MAX_DATA_ROW = 1000

const COLUMNS = {
  NO:               0,
  NAMA:             1,
  NUPTK:            2,
  JK:               3,
  TEMPAT_LAHIR:     4,
  TANGGAL_LAHIR:    5,
  NIP:              6,
  STATUS_KEPEGAWAIAN: 7,
  JENIS_PTK:        8,
  AGAMA:            9,
  ALAMAT:           10,
  RT:               11,
  RW:               12,
  DUSUN:            13,
  DESA:             14,
  KECAMATAN:        15,
  KODE_POS:         16,
  TELEPON:          17,
  HP:               18,
  EMAIL:            19,
  TUGAS_TAMBAHAN:   20,
  SK_CPNS:          21,
  TGL_CPNS:         22,
  SK_PENGANGKATAN:  23,
  TMT_PENGANGKATAN: 24,
  LEMBAGA_PENGANGKATAN: 25,
  PANGKAT_GOLONGAN: 26,
  SUMBER_GAJI:      27,
  NIK:              43,
}

// Teacher type keywords for Jenis PTK detection
const JENIS_GURU = [
  'Guru', 'Kepala Sekolah', 'Wakil Kepala Sekolah',
  'Guru Mapel', 'Guru Kelas', 'Guru BK',
  'Guru Pendamping', 'Guru Pembimbing',
]

// ─── Utility Functions ─────────────────────────────────────────

function getCell(worksheet, row, col) {
  const addr = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = worksheet[addr]
  return cell ? cell.v : null
}

function getLastRow(worksheet) {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
  return range.e.r
}

function parseString(val) {
  if (val === null || val === undefined) return ''
  return String(val).trim()
}

// ─── Main Parsing Functions ────────────────────────────────────

/**
 * Parse header info (sekolah & metadata) dari file Dapodik
 */
function parseHeader(worksheet) {
  const header = {
    jenis: parseString(getCell(worksheet, 0, 0)),     // "Daftar Guru" / "Daftar Tenaga Kependidikan"
    namaSekolah: parseString(getCell(worksheet, 1, 0)), // "SD NEGERI PASIRHALANG"
    lokasi: parseString(getCell(worksheet, 2, 0)),     // Kecamatan, Kabupaten, Provinsi
    tanggalUnduh: parseString(getCell(worksheet, 3, 0)), // "Tanggal Unduh: ..."
    pengunduh: parseString(getCell(worksheet, 3, 3)),   // "Pengunduh: ..."
  }
  return header
}

/**
 * Validate format file Dapodik Guru/Tendik
 */
export function validateDapodikFormat(workbook) {
  const errors = []
  const warnings = []

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    errors.push('Tidak ada sheet yang ditemukan di file Excel')
    return { valid: false, errors, warnings, sheetName: null, jenis: null }
  }

  const sheetName = workbook.SheetNames[0]
  const ws = workbook.Sheets[sheetName]

  // Cek header row: harus ada "No" dan "Nama" dan "NUPTK"
  const col0 = parseString(getCell(ws, HEADER_ROW, 0))
  const col1 = parseString(getCell(ws, HEADER_ROW, 1))
  const col2 = parseString(getCell(ws, HEADER_ROW, 2))

  if (col0 !== 'No' || col1 !== 'Nama' || !col2.includes('NUPTK')) {
    errors.push('Format header tidak sesuai Dapodik: harus kolom No, Nama, NUPTK di baris 5')
    return { valid: false, errors, warnings, sheetName: null, jenis: null }
  }

  // Deteksi jenis: Guru atau Tendik dari title
  const title = parseString(getCell(ws, 0, 0)).toLowerCase()
  const jenis = title.includes('tendik') || title.includes('tenaga kependidikan') ? 'tendik' : 'guru'

  return { valid: true, errors, warnings, sheetName, jenis }
}

/**
 * Parse data guru/tendik dari worksheet
 */
function parseData(worksheet) {
  const items = []
  const invalidRows = []
  const lastRow = Math.min(getLastRow(worksheet), MAX_DATA_ROW)

  for (let row = DATA_START_ROW; row <= lastRow; row++) {
    const no = getCell(worksheet, row, COLUMNS.NO)
    const nama = getCell(worksheet, row, COLUMNS.NAMA)

    // Skip baris kosong
    if (no === null && (nama === null || nama === undefined)) continue
    if (no === undefined && nama === undefined) continue

    // Skip jika bukan data (no harus number)
    if (no !== null && no !== undefined && typeof no !== 'number') continue
    if (nama === null || nama === undefined || String(nama).trim() === '') continue

    const nip = parseString(getCell(worksheet, row, COLUMNS.NIP))
    const nuptk = parseString(getCell(worksheet, row, COLUMNS.NUPTK))

    const item = {
      id: row,
      nama: parseString(nama),
      nip: nip,
      nuptk: nuptk,
      jk: parseString(getCell(worksheet, row, COLUMNS.JK)),
      tempatLahir: parseString(getCell(worksheet, row, COLUMNS.TEMPAT_LAHIR)),
      tanggalLahir: parseString(getCell(worksheet, row, COLUMNS.TANGGAL_LAHIR)),
      status: parseString(getCell(worksheet, row, COLUMNS.STATUS_KEPEGAWAIAN)),
      jenisPtk: parseString(getCell(worksheet, row, COLUMNS.JENIS_PTK)),
      // jabatan = jenisPtk (field compat dengan existing mock data)
      jabatan: parseString(getCell(worksheet, row, COLUMNS.JENIS_PTK)),
      golongan: parseString(getCell(worksheet, row, COLUMNS.PANGKAT_GOLONGAN)),
      agama: parseString(getCell(worksheet, row, COLUMNS.AGAMA)),
      alamat: parseString(getCell(worksheet, row, COLUMNS.ALAMAT)),
      rt: parseString(getCell(worksheet, row, COLUMNS.RT)),
      rw: parseString(getCell(worksheet, row, COLUMNS.RW)),
      desa: parseString(getCell(worksheet, row, COLUMNS.DESA)),
      kecamatan: parseString(getCell(worksheet, row, COLUMNS.KECAMATAN)),
      hp: parseString(getCell(worksheet, row, COLUMNS.HP)),
      email: parseString(getCell(worksheet, row, COLUMNS.EMAIL)),
      tugasTambahan: parseString(getCell(worksheet, row, COLUMNS.TUGAS_TAMBAHAN)),
      nik: parseString(getCell(worksheet, row, COLUMNS.NIK)),

    }

    items.push(item)
  }

  return items
}

// ─── Public API ────────────────────────────────────────────────

/**
 * Main Guru/Tendik Excel Parser
 * @param {File} file - File object from file input
 * @returns {Promise<Object>} Parsed data
 */
export function parseGuruTendikExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // Validate format
        const validation = validateDapodikFormat(workbook)
        if (!validation.valid) {
          reject(new Error(`Format tidak valid: ${validation.errors.join(', ')}`))
          return
        }

        const sheetName = validation.sheetName
        if (!sheetName) {
          reject(new Error('Tidak dapat menentukan sheet'))
          return
        }
        const worksheet = workbook.Sheets[sheetName]

        // Parse
        const header = parseHeader(worksheet)
        const items = parseData(worksheet)

        if (items.length === 0) {
          reject(new Error('Tidak ditemukan data. Pastikan file berisi data guru/tendik dengan format Dapodik.'))
          return
        }

        const result = {
          success: true,
          jenis: validation.jenis,
          sheetName,
          header,
          items,
          total: items.length,
          parsedAt: new Date().toISOString(),
        }

        resolve(result)
      } catch (error) {
        reject(new Error(`Gagal parsing file: ${error.message}`))
      }
    }

    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsArrayBuffer(file)
  })
}

export default {
  parseGuruTendikExcel,
  validateDapodikFormat,
}
