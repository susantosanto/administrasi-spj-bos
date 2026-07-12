/**
 * Sekolah Data — Data Default Sekolah
 * Untuk Kop Surat dan field otomatis
 * Reads from localStorage (Data Sekolah page)
 */
import storageHelper from './storageHelper'

// Default fallback values
const SEKOLAH_DEFAULTS = {
  namaSekolah: 'SD NEGERI LEBAKLEUNGSIR',
  npsn: '20228636',
  alamat: 'Kp. Lebakleungsir RT 02 RW 10 Desa Mekarjaya Kec. Cikalongwetan Kab. Bandung Barat Kode Pos 40556',
  email: 'sdn.lebakleungsir@gmail.com',
  telepon: '-',
  kabupaten: 'Kabupaten Bandung Barat',
  provinsi: 'Jawa Barat',
  kecamatan: 'Cikalongwetan',
  kelurahan: 'Mekarjaya',
  kodePos: '40556',
}

const KEPALA_SEKOLAH_DEFAULT = {
  nama: 'BADRUDDIN, S.Ag.',
  nip: '197405082014121002',
}

const BENDAHARA_DEFAULT = {
  nama: 'DEDE GUNAWAN, S.Pd.',
  nip: '198507172020121003',
}

/**
 * Get school data from localStorage or use defaults
 */
export function getSchoolData() {
  const stored = storageHelper.get('data_sekolah', null)
  if (!stored) return SEKOLAH_DEFAULTS
  
  return {
    namaSekolah: stored.namaSekolah || SEKOLAH_DEFAULTS.namaSekolah,
    npsn: stored.npsn || SEKOLAH_DEFAULTS.npsn,
    alamat: stored.alamat || SEKOLAH_DEFAULTS.alamat,
    email: stored.email || SEKOLAH_DEFAULTS.email,
    kabupaten: stored.kabupaten || SEKOLAH_DEFAULTS.kabupaten,
    provinsi: stored.provinsi || SEKOLAH_DEFAULTS.provinsi,
    kecamatan: stored.kecamatan || SEKOLAH_DEFAULTS.kecamatan,
  }
}

/**
 * Get Kepala Sekolah data from localStorage or use defaults
 */
export function getKepalaSekolah() {
  const stored = storageHelper.get('data_sekolah', null)
  const pejabat = stored?.pejabat?.ks
  if (!pejabat?.nama) return KEPALA_SEKOLAH_DEFAULT
  
  return {
    nama: pejabat.nama || KEPALA_SEKOLAH_DEFAULT.nama,
    nip: pejabat.nip || KEPALA_SEKOLAH_DEFAULT.nip,
  }
}

/**
 * Get Bendahara data from localStorage or use defaults
 */
export function getBendahara() {
  const stored = storageHelper.get('data_sekolah', null)
  const pejabat = stored?.pejabat?.bendahara
  if (!pejabat?.nama) return BENDAHARA_DEFAULT
  
  return {
    nama: pejabat.nama || BENDAHARA_DEFAULT.nama,
    nip: pejabat.nip || BENDAHARA_DEFAULT.nip,
  }
}

// Legacy exports for backward compatibility
export const SEKOLAH_DEFAULT = getSchoolData()
export const KEPALA_SEKOLAH = getKepalaSekolah()
export const BENDAHARA = getBendahara()

export default SEKOLAH_DEFAULT
