/**
 * Nomor Surat Helper
 * Fitur: Generate Nomor Surat Keluar Otomatis
 */

import storageHelper from './storageHelper';
const { get, set } = storageHelper;

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  NOMOR_SURAT: 'spj_nomor_surat',
  COUNTER: 'spj_counter_surat',
  FORMAT: 'spj_format_surat'
};

// Kode Surat
export const KODE_SURAT = {
  STS: { kode: 'STS', nama: 'Surat Tugas', warna: 'blue' },
  SK: { kode: 'SK', nama: 'Surat Keterangan', warna: 'green' },
  SU: { kode: 'SU', nama: 'Surat Undangan', warna: 'purple' },
  SP: { kode: 'SP', nama: 'Surat Pernyataan', warna: 'orange' },
  SKU: { kode: 'SKU', nama: 'Surat Kuasa', warna: 'red' },
  STL: { kode: 'STL', nama: 'Surat Telaah', warna: 'teal' },
  SL: { kode: 'SL', nama: 'Surat Lingkungan', warna: 'cyan' },
  SN: { kode: 'SN', nama: 'Surat Nyata', warna: 'indigo' }
};

// Bulan Romawi
const ROMAN_MONTHS = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV',
  5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
  9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

// Nama Bulan Indonesia
const INDONESIAN_MONTHS = {
  1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
  5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
  9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
};

// Default Format
const DEFAULT_FORMAT = {
  separator: '/',
  nomorDigits: 3,
  bulanFormat: 'romawi', // romawi | angka | nama
  tahunFormat: 4 // 2 atau 4
};

// ============================================
// STANDARD FORMAT (sesuai menu Nomor Surat)
// Format: [Klasifikasi]/[Kode Surat]-[Nomor]/[Nama SD]/[Bulan]/[Tahun]
// Contoh: 422.1/SK-001/SDN-PSR/VII/2026
// ============================================

// Storage key untuk custom format (SAMA dengan yg dipakai NomorSuratPage)
const STORAGE_KEY_FORMATS = 'spj_surat_custom_formats';

// Default format segments (sama dengan menu Nomor Surat)
export const DEFAULT_FORMAT_SEGMENTS = [
  { id: 'klasifikasi', label: 'Kode Klasifikasi', enabled: true, order: 1, separator: '/' },
  { id: 'kode_pendek', label: 'Kode Surat', enabled: true, order: 2, separator: '-' },
  { id: 'nomor', label: 'Nomor Urut', value: '3', startNumber: '001', enabled: true, order: 3, separator: '/' },
  { id: 'nama_sd', label: 'Nama Sekolah', enabled: true, order: 4, separator: '/' },
  { id: 'bulan', label: 'Bulan', value: 'romawi', enabled: true, order: 5, separator: '/' },
  { id: 'tahun', label: 'Tahun', value: '4', enabled: true, order: 6 }
];

// Mapping kode pendek → kode klasifikasi (sama dengan NomorSuratPage)
export const KODE_PENDEK_TO_KLASIFIKASI = {
  'STS': '421.3', 'SK': '422', 'SU': '423', 'SP': '424',
  'SKU': '425', 'SE': '426', 'SPD': '427'
};

// Ambil format segments (custom jika user sudah simpan di menu)
export function getFormatSegments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FORMATS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.segments && Array.isArray(parsed.segments) && parsed.segments.length) {
        return parsed.segments;
      }
    }
  } catch (_) { /* ignore */ }
  return DEFAULT_FORMAT_SEGMENTS;
}

// Build nomor dari segments (logika identik dengan menu Nomor Surat)
export function buildNomorSurat({ kodeKlasifikasi, kodePendek, namaSekolah, bulan, tahun, formatSegments }) {
  const segs = (formatSegments && formatSegments.length) ? formatSegments : DEFAULT_FORMAT_SEGMENTS;
  const sorted = [...segs]
    .filter(s => s.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  let result = '';
  sorted.forEach((seg, i) => {
    let value = '';
    switch (seg.id) {
      case 'klasifikasi': value = kodeKlasifikasi; break;
      case 'kode_pendek': value = kodePendek; break;
      case 'nomor': {
        const digits = parseInt(seg.value) || 3;
        const startNum = parseInt(seg.startNumber) || 1;
        const existing = getAllNomorSurat();
        const sameType = existing.filter(r => r.kode === kodeKlasifikasi && r.bulan === bulan && r.tahun === tahun);
        let lastNum = startNum - 1;
        sameType.forEach(r => { if (r.nomorUrut > lastNum) lastNum = r.nomorUrut; });
        value = String(lastNum + 1).padStart(digits, '0');
        break;
      }
      case 'nama_sd': value = namaSekolah; break;
      case 'bulan':
        if (seg.value === 'angka') value = String(bulan).padStart(2, '0');
        else if (seg.value === 'nama') value = getIndonesianMonth(bulan);
        else value = getRomanMonth(bulan);
        break;
      case 'tahun':
        value = seg.value === '2' ? String(tahun).slice(-2) : String(tahun);
        break;
      default: value = seg.value || '';
    }
    if (i > 0) result += (sorted[i - 1].separator || '/');
    result += value;
  });
  return result;
}

// Next number untuk klasifikasi + bulan + tahun tertentu
export function getNextNumberStandar(klasifikasi, bulan = getCurrentMonth(), tahun = getCurrentYear()) {
  const segs = getFormatSegments();
  const nomorSeg = segs.find(s => s.id === 'nomor');
  const startNum = parseInt(nomorSeg?.startNumber) || 1;
  const existing = getAllNomorSurat();
  const sameType = existing.filter(r => r.kode === klasifikasi && r.bulan === bulan && r.tahun === tahun);
  let lastNum = startNum - 1;
  sameType.forEach(r => { if (r.nomorUrut > lastNum) lastNum = r.nomorUrut; });
  return lastNum + 1;
}

// Generate nomor surat standar (format menu) — mengembalikan nomor + record (BELUM save)
export function generateNomorSuratStandar({ kodePendek, namaSekolah = 'SDN-PSR', bulan, tahun, kodeKlasifikasi }) {
  const b = bulan || getCurrentMonth();
  const t = tahun || getCurrentYear();
  const klasifikasi = kodeKlasifikasi || KODE_PENDEK_TO_KLASIFIKASI[kodePendek] || '421.3';
  const segs = getFormatSegments();
  const nomor = buildNomorSurat({
    kodeKlasifikasi: klasifikasi,
    kodePendek,
    namaSekolah,
    bulan: b,
    tahun: t,
    formatSegments: segs
  });
  const nextNum = getNextNumberStandar(klasifikasi, b, t);
  const record = {
    id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nomor,
    kode: klasifikasi,
    kodePendek,
    jenis: KODE_SURAT[kodePendek] ? KODE_SURAT[kodePendek].nama : kodePendek,
    namaSekolah,
    nomorUrut: nextNum,
    bulan: b,
    bulanRomawi: getRomanMonth(b),
    tahun: t,
    createdAt: new Date().toISOString(),
    status: 'used'
  };
  return { nomor, record, kodeKlasifikasi: klasifikasi, nomorUrut: nextNum };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current month (1-12)
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

/**
 * Get current year
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Get Roman numeral for month
 */
export function getRomanMonth(month) {
  return ROMAN_MONTHS[month] || 'I';
}

/**
 * Get Indonesian month name
 */
export function getIndonesianMonth(month) {
  return INDONESIAN_MONTHS[month] || 'Januari';
}

/**
 * Format month based on format setting
 */
export function formatMonth(month, format = 'romawi') {
  switch (format) {
    case 'romawi':
      return getRomanMonth(month);
    case 'angka':
      return String(month).padStart(2, '0');
    case 'nama':
      return getIndonesianMonth(month);
    default:
      return getRomanMonth(month);
  }
}

/**
 * Format number with leading zeros
 */
export function formatNumber(num, digits = 3) {
  return String(num).padStart(digits, '0');
}

/**
 * Format year based on format setting
 */
export function formatYear(year, format = 4) {
  if (format === 2) {
    return String(year).slice(-2);
  }
  return String(year);
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Get all nomor surat records
 */
export function getAllNomorSurat() {
  return get(STORAGE_KEYS.NOMOR_SURAT) || [];
}

/**
 * Save all nomor surat records
 */
export function saveAllNomorSurat(records) {
  set(STORAGE_KEYS.NOMOR_SURAT, records);
}

/**
 * Get counter data
 */
export function getCounter() {
  return get(STORAGE_KEYS.COUNTER) || {};
}

/**
 * Save counter data
 */
export function saveCounter(counter) {
  set(STORAGE_KEYS.COUNTER, counter);
}

/**
 * Get format settings
 */
export function getFormatSettings() {
  return get(STORAGE_KEYS.FORMAT) || DEFAULT_FORMAT;
}

/**
 * Save format settings
 */
export function saveFormatSettings(settings) {
  set(STORAGE_KEYS.FORMAT, settings);
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Generate nomor surat baru
 * @param {string} kode - Kode surat (STS, SK, SU, etc.)
 * @param {object} customFormat - Custom format settings (optional)
 * @returns {object} - { nomor, record }
 */
export function generateNomorSurat(kode, customFormat = null) {
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();
  const format = customFormat || getFormatSettings();
  
  // Validate kode
  if (!KODE_SURAT[kode]) {
    throw new Error(`Kode surat tidak valid: ${kode}`);
  }
  
  // Get counter key
  const counterKey = `${kode}/${tahun}-${bulan}`;
  
  // Get current counter
  const counter = getCounter();
  const lastNumber = counter[counterKey] || 0;
  
  // Increment
  const newNumber = lastNumber + 1;
  
  // Check max limit
  const maxNumber = Math.pow(10, format.nomorDigits) - 1;
  if (newNumber > maxNumber) {
    throw new Error(`Nomor surat sudah mencapai batas maksimum (${maxNumber})`);
  }
  
  // Format nomor
  const formattedNumber = formatNumber(newNumber, format.nomorDigits);
  const formattedMonth = formatMonth(bulan, format.bulanFormat);
  const formattedYear = formatYear(tahun, format.tahunFormat);
  
  const nomor = `${kode}/${formattedNumber}/${formattedMonth}/${formattedYear}`;
  
  // Create record
  const record = {
    id: `ns_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    nomor,
    kode,
    jenis: KODE_SURAT[kode].nama,
    nomorUrut: newNumber,
    bulan,
    bulanRomawi: getRomanMonth(bulan),
    tahun,
    createdAt: now.toISOString(),
    usedAt: now.toISOString(),
    status: 'used'
  };
  
  return { nomor, record };
}

/**
 * Save nomor surat (add to list and increment counter)
 * @param {object} record - Nomor surat record
 */
export function saveNomorSurat(record) {
  const { kode, bulan, tahun, nomorUrut } = record;
  
  // Check for duplicate
  const existing = getAllNomorSurat();
  const duplicate = existing.find(n => n.nomor === record.nomor);
  
  if (duplicate) {
    throw new Error(`Nomor surat ${record.nomor} sudah digunakan`);
  }
  
  // Add to list
  existing.unshift(record); // Add to beginning (newest first)
  saveAllNomorSurat(existing);
  
  // Update counter
  const counter = getCounter();
  const counterKey = `${kode}/${tahun}-${bulan}`;
  counter[counterKey] = nomorUrut;
  saveCounter(counter);
}

/**
 * Preview nomor surat tanpa save
 * @param {string} kode - Kode surat
 * @returns {string} - Nomor surat
 */
export function previewNomorSurat(kode) {
  const { nomor } = generateNomorSurat(kode);
  return nomor;
}

/**
 * Get next number for a kode/bulan/tahun
 * @param {string} kode - Kode surat
 * @param {number} bulan - Bulan (1-12)
 * @param {number} tahun - Tahun
 * @returns {number} - Nomor berikutnya
 */
export function getNextNumber(kode, bulan = getCurrentMonth(), tahun = getCurrentYear()) {
  const counter = getCounter();
  const counterKey = `${kode}/${tahun}-${bulan}`;
  return (counter[counterKey] || 0) + 1;
}

/**
 * Get statistics
 * @returns {object} - Statistik nomor surat
 */
export function getStatistics() {
  const records = getAllNomorSurat();
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const today = now.toISOString().split('T')[0];
  
  const bulanIni = records.filter(r => 
    r.bulan === currentMonth && r.tahun === currentYear
  ).length;
  
  const tahunIni = records.filter(r => 
    r.tahun === currentYear
  ).length;
  
  const hariIni = records.filter(r => 
    r.createdAt.startsWith(today)
  ).length;
  
  const terakhir = records.length > 0 ? records[0].nomor : '-';
  
  return { bulanIni, tahunIni, hariIni, terakhir };
}

/**
 * Search nomor surat
 * @param {string} query - Search query
 * @param {object} filters - { bulan, tahun, kode }
 * @returns {array} - Filtered records
 */
export function searchNomorSurat(query = '', filters = {}) {
  let records = getAllNomorSurat();
  
  // Filter by search query
  if (query) {
    const lowerQuery = query.toLowerCase();
    records = records.filter(r => 
      r.nomor.toLowerCase().includes(lowerQuery) ||
      r.jenis.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Filter by bulan
  if (filters.bulan) {
    records = records.filter(r => r.bulan === filters.bulan);
  }
  
  // Filter by tahun
  if (filters.tahun) {
    records = records.filter(r => r.tahun === filters.tahun);
  }
  
  // Filter by kode
  if (filters.kode) {
    records = records.filter(r => r.kode === filters.kode);
  }
  
  return records;
}

/**
 * Delete nomor surat
 * @param {string} id - Record ID
 */
export function deleteNomorSurat(id) {
  const records = getAllNomorSurat();
  const filtered = records.filter(r => r.id !== id);
  saveAllNomorSurat(filtered);
  // Note: Counter tidak di-decrement untuk mencegah reuse number
}

/**
 * Check if nomor already exists
 * @param {string} nomor - Nomor surat
 * @returns {boolean}
 */
export function isNomorExists(nomor) {
  const records = getAllNomorSurat();
  return records.some(r => r.nomor === nomor);
}

/**
 * Get record by ID
 * @param {string} id - Record ID
 * @returns {object|null}
 */
export function getNomorSuratById(id) {
  const records = getAllNomorSurat();
  return records.find(r => r.id === id) || null;
}

/**
 * Format date for display
 * @param {string} isoDate - ISO date string
 * @returns {string} - Formatted date
 */
export function formatDate(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Format datetime for display
 * @param {string} isoDate - ISO date string
 * @returns {string} - Formatted datetime
 */
export function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get all available years from records
 * @returns {array} - Array of years
 */
export function getAvailableYears() {
  const records = getAllNomorSurat();
  const years = [...new Set(records.map(r => r.tahun))];
  return years.sort((a, b) => b - a); // Newest first
}

/**
 * Get all available months from records for a specific year
 * @param {number} year
 * @returns {array} - Array of months
 */
export function getAvailableMonths(year) {
  const records = getAllNomorSurat();
  const months = [...new Set(records.filter(r => r.tahun === year).map(r => r.bulan))];
  return months.sort((a, b) => b - a); // Newest first
}

export default {
  KODE_SURAT,
  DEFAULT_FORMAT_SEGMENTS,
  KODE_PENDEK_TO_KLASIFIKASI,
  getFormatSegments,
  buildNomorSurat,
  getNextNumberStandar,
  generateNomorSuratStandar,
  generateNomorSurat,
  saveNomorSurat,
  previewNomorSurat,
  getNextNumber,
  getStatistics,
  searchNomorSurat,
  deleteNomorSurat,
  isNomorExists,
  getNomorSuratById,
  getAllNomorSurat,
  getFormatSettings,
  saveFormatSettings,
  formatDate,
  formatDateTime,
  getRomanMonth,
  getIndonesianMonth,
  getAvailableYears,
  getAvailableMonths
};
