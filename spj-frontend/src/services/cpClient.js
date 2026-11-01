/**
 * Klien ASIK Control Plane (server pusat lisensi).
 * Hanya mengirim identitas/metadata — TIDAK data BKU/LPJ/keuangan (PRD NFR-04).
 *
 * Base URL bisa dioverride via VITE_CP_API (.env) atau localStorage spj_cp_api.
 */
import storageHelper from '../utils/storageHelper'

const APP_VERSION = '1.0.0'
function getDeviceFingerprint() {
  let fp = storageHelper.get('device_id')
  if (!fp) {
    fp = (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) || `fp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    storageHelper.set('device_id', fp)
  }
  return fp
}

export const CP_API =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_CP_API) ||
  storageHelper.get('cp_api') ||
  'http://localhost:4000'

export const HEADER = { LICENSE: 'x-license-code', FP: 'x-device-fingerprint', APP: 'x-app-version' }

/** Credensial device tersimpan lokal. */
export function getStoredLicense() {
  return {
    licenseCode: storageHelper.get('license_code'),
    deviceFingerprint: getDeviceFingerprint(),
    licenseToken: storageHelper.get('license_token'),
  }
}

function deviceHeaders(code) {
  const h = { [HEADER.LICENSE]: code, [HEADER.FP]: getDeviceFingerprint(), [HEADER.APP]: APP_VERSION }
  return h
}

export class CpError extends Error {
  constructor(status, data) {
    const msg = normalizeError(status, data)
    super(msg)
    this.status = status
    this.data = data
  }
}

function normalizeError(status, data) {
  const raw = data && data.message
  if (status === 429) return 'Terlalu banyak percobaan. Coba lagi dalam satu menit.'
  if (Array.isArray(raw)) return raw.join(', ')
  switch (raw) {
    case 'NPSN_ALREADY_EXISTS':
      return data.npsn
        ? `NPSN ${data.npsn} sudah terdaftar. Gunakan "Masuk"; jika di komputer lain, hubungi admin pusat.`
        : 'NPSN sudah terdaftar. Gunakan "Masuk"; jika di komputer lain, hubungi admin pusat.'
    case 'LICENSE_NOT_FOUND':
      return 'Kode lisensi tidak ditemukan. Periksa ulang kodenya.'
    case 'DEVICE_LIMIT_REACHED':
    case 'DEVICE_LIMIT_EXCEEDED':
      return 'Batas perangkat lisensi sudah penuh — perangkat ini terpakai di komputer lain. Hubungi admin pusat.'
    case 'SUSPENDED':
      return 'Lisensi ditangguhkan. Hubungi admin pusat.'
    case 'EXPIRED':
      return 'Masa lisensi sudah berakhir. Untuk perpanjangan, hubungi admin pusat.'
    default:
      return (typeof raw === 'string' && raw) || 'Terjadi kesalahan saat berkomunikasi dengan ASIK Control Plane.'
  }
}

/**
 * Wrapper fetch dengan timeout; error HTTP diubah menjadi CpError yang memuat pesan UI.
 */
export async function request(path, options = {}, timeoutMs = 15000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${CP_API}${path}`, { ...options, signal: ctrl.signal })
    if (res.status === 204) return null
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new CpError(res.status, data)
    return data
  } catch (e) {
    if (e.name === 'AbortError') throw new CpError(0, { message: 'Koneksi ke ASIK Control Plane lambat/gagal.' })
    throw e
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Tambahkan status ke body fetch timeout ke CP gagal -> panggilan ulang sekali dibiarkan ke caller.
 */
export const cpApi = {
  // ── Registrasi publik ──
  register(payload) {
    return request('/public/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  },

  // ── Perangkat ──
  activate(licenseCode) {
    return request(
      '/device/activate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...deviceHeaders(licenseCode) },
        body: JSON.stringify({ fingerprint: getDeviceFingerprint(), appVersion: APP_VERSION }),
      },
      20000,
    )
  },

  /** Kembalikan { status, readOnly, validUntil } untuk mode baca/edit UI. */
  heartbeat() {
    const { licenseCode } = getStoredLicense()
    if (!licenseCode) throw new CpError(0, { message: 'Belum ada lisensi yang dihubungkan.' })
    return request('/device/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...deviceHeaders(licenseCode) },
      body: JSON.stringify({ status: 'ok', appVersion: APP_VERSION }),
    })
  },

  // ── Sinkronisasi ──
  syncPush({ snapshot, checksum }) {
    const { licenseCode } = getStoredLicense()
    if (!licenseCode) throw new CpError(0, { message: 'Belum ada lisensi yang dihubungkan.' })
    return request('/device/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...deviceHeaders(licenseCode) },
      body: JSON.stringify({ snapshot, checksum, appVersion: APP_VERSION }),
    })
  },

  syncPull() {
    const { licenseCode } = getStoredLicense()
    if (!licenseCode) throw new CpError(0, { message: 'Belum ada lisensi yang dihubungkan.' })
    return request('/device/sync/pull', { headers: { ...deviceHeaders(licenseCode) } })
  },

  syncStatus() {
    const { licenseCode } = getStoredLicense()
    if (!licenseCode) throw new CpError(0, { message: 'Belum ada lisensi yang dihubungkan.' })
    return request('/device/sync/status', { headers: { ...deviceHeaders(licenseCode) } })
  },
}

export default cpApi
