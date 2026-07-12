/**
 * Honor Auto-Fill Helper
 * Filter dan map data guru/tendik untuk auto-fill dokumen honor
 */
import storageHelper from './storageHelper'

/**
 * Get all guru with status Honorer
 */
export function getGuruHonorer() {
  const guru = storageHelper.get('data_guru', []) || []
  
  return guru.filter(g => {
    const status = (g.status || '').toLowerCase().trim()
    // Match various honor status formats
    return status.includes('honorer') || 
           status.includes('honor') || 
           status === 'ht' || 
           status === 'guru tidak tetap' ||
           status === 'gtt'
  })
}

/**
 * Get all tendik with status Honorer
 * Includes tendik with roleHonor: tendik, perpus, penjaga
 */
export function getTendikHonorer() {
  const tendik = storageHelper.get('data_tendik', []) || []
  
  return tendik.filter(t => {
    const status = (t.status || '').toLowerCase().trim()
    const isHonorer = status.includes('honorer') || 
           status.includes('honor') || 
           status === 'ht' || 
           status === 'tenaga tidak tetap' ||
           status === 'ttt'
    
    // Only include tendik with roleHonor = 'tendik' (not perpus or penjaga)
    const roleHonor = (t.roleHonor || 'tendik').toLowerCase()
    const isTendikRole = roleHonor === 'tendik' || roleHonor === ''
    
    return isHonorer && isTendikRole
  })
}

/**
 * Get staff from perpustakaan (based on roleHonor)
 */
export function getPerpustakaanStaff() {
  const tendik = storageHelper.get('data_tendik', []) || []
  
  return tendik.filter(t => {
    const roleHonor = (t.roleHonor || '').toLowerCase()
    return roleHonor === 'perpus' || roleHonor === 'perpustakaan'
  })
}

/**
 * Get penjaga (based on roleHonor)
 */
export function getPenjagaStaff() {
  const tendik = storageHelper.get('data_tendik', []) || []
  
  return tendik.filter(t => {
    const roleHonor = (t.roleHonor || '').toLowerCase()
    return roleHonor === 'penjaga'
  })
}

/**
 * Map guru/tendik data to honor table row format
 * @param {Object} item - Guru/tendik data
 * @param {number} no - Nomor urut
 * @param {number} defaultJumlah - Default jumlah honor
 * @returns {Object} Row data for honor table
 */
export function mapToHonorRow(item, no, defaultJumlah = 0) {
  // Parse golongan to get format like "III/a", "IV/b" etc
  let golRuang = item.golongan || ''
  
  // If golongan is empty, determine from status
  if (!golRuang) {
    if (item.status === 'Honorer' || (item.status && item.status.toLowerCase().includes('honorer'))) {
      golRuang = 'GTT' // Guru Tidak Tetap
    } else {
      golRuang = '-'
    }
  }

  return {
    id: Date.now() + no,
    no: no,
    nama: item.nama || '',
    nuptk: item.nuptk || '',
    nip: item.nip || '',
    jabatan: item.jabatan || item.jenisPtk || '',
    jumlah: defaultJumlah,
    golRuang: golRuang,
    volume: 1,
    satuan: 'Bulan',
    pph: 0,
    diterima: defaultJumlah, // Will be auto-calculated
  }
}

/**
 * Get honor data by template type
 * @param {string} templateId - Template ID (honor_guru, honor_tendik, etc.)
 * @returns {Array} Array of row data
 */
export function getHonorDataByTemplate(templateId) {
  let items = []
  
  switch (templateId) {
    case 'honor_guru':
      items = getGuruHonorer()
      break
    case 'honor_tendik':
      items = getTendikHonorer()
      break
    case 'honor_perpus':
      items = getPerpustakaanStaff()
      break
    case 'honor_penjaga':
      items = getPenjagaStaff()
      break
    default:
      return []
  }
  
  return items.map((item, index) => mapToHonorRow(item, index + 1))
}

/**
 * Get statistics for honor auto-fill
 */
export function getHonorStats() {
  return {
    guruHonorer: getGuruHonorer().length,
    tendikHonorer: getTendikHonorer().length,
    perpustakaan: getPerpustakaanStaff().length,
    penjaga: getPenjagaStaff().length,
  }
}

/**
 * Debug: Get all stored data info
 */
export function debugStorageInfo() {
  const guru = storageHelper.get('data_guru', []) || []
  const tendik = storageHelper.get('data_tendik', []) || []
  
  console.log('=== Honor Debug Info ===')
  console.log('Total Guru:', guru.length)
  console.log('Total Tendik:', tendik.length)
  
  if (guru.length > 0) {
    console.log('Sample Guru:', guru[0])
    console.log('Guru Statuses:', [...new Set(guru.map(g => g.status))])
  }
  
  if (tendik.length > 0) {
    console.log('Sample Tendik:', tendik[0])
    console.log('Tendik Statuses:', [...new Set(tendik.map(t => t.status))])
  }
  
  console.log('Guru Honorer:', getGuruHonorer().length)
  console.log('Tendik Honorer:', getTendikHonorer().length)
  
  return {
    guruCount: guru.length,
    tendikCount: tendik.length,
    guruHonorer: getGuruHonorer().length,
    tendikHonorer: getTendikHonorer().length,
    guruStatuses: guru.map(g => g.status),
    tendikStatuses: tendik.map(t => t.status),
  }
}

export default {
  getGuruHonorer,
  getTendikHonorer,
  getPerpustakaanStaff,
  getPenjagaStaff,
  mapToHonorRow,
  getHonorDataByTemplate,
  getHonorStats,
}
