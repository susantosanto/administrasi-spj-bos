/**
 * Template Detector Utility
 * Auto-detect template LPJ dari kode rekening BKU
 * Single source of truth — import di BKUPage & BKUSidebar
 */

// Mapping kode rekening → template yang dibutuhkan
export const TEMPLATE_MAP = [
  { pattern: /^5\.1\.02\.02\.01\.0013/, label: 'Honor Guru', templateId: 'honor_guru', icon: 'payments', color: 'text-purple-600' },
  { pattern: /^5\.1\.02\.02\.01\.0016/, label: 'Upah Kerja', templateId: 'upah', icon: 'handyman', color: 'text-orange-600' },
  { pattern: /^5\.1\.02\.04\.01\.0003/, label: 'Transport + SPPD', templateId: 'transpor_rapat', icon: 'directions_car', color: 'text-blue-600' },
  { pattern: /^5\.1\.02\.01\.01\.0052/, label: 'Makan & Minum', templateId: 'notulen', icon: 'restaurant', color: 'text-green-600' },
  { pattern: /^5\.1\.02\.02\.01\.0061/, label: 'Perpustakaan', templateId: 'honor_perpus', icon: 'menu_book', color: 'text-indigo-600' },
]

/**
 * Deteksi template dari kode rekening
 * @param {string} kodeRekening - Kode rekening transaksi BKU
 * @returns {object|null} Template info atau null jika tidak ada template
 */
export function detectTemplate(kodeRekening) {
  if (!kodeRekening) return null
  for (const tmpl of TEMPLATE_MAP) {
    if (tmpl.pattern.test(kodeRekening)) return tmpl
  }
  return null
}

export default { TEMPLATE_MAP, detectTemplate }
