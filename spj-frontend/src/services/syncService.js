/**
 * Sinkronisasi data (Push/Pull) ke ASIK Control Plane.
 *
 * WHITELIST — hanya key metadata berikut yang dikirim/diterima:
 *   data_sekolah, data_guru, data_tendik, auth_user (hanya { name, role }),
 *   notes, spj_nomor_surat
 * JANGAN KIRIM: bku_data/realisasi (keuangan), dokumen_lpj (isi dokumen),
 * logo_*, kredensial apa pun.
 */
import storageHelper from '../utils/storageHelper'
import cpApi, { getStoredLicense, CpError } from './cpClient'

const SYNC_KEYS = ['data_sekolah', 'data_guru', 'data_tendik', 'auth_user', 'notes', 'spj_nomor_surat']

async function sha256Hex(json) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(json))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Kumpulkan snapshot dari whitelist (jangan ikut sertakan key lain). */
export function collectSnapshot() {
  const snap = {}
  for (const key of SYNC_KEYS) {
    let value = storageHelper.get(key)
    if (value === null || value === undefined || value === '') continue
    if (key === 'auth_user') value = { name: value.name, role: value.role }
    snap[key] = value
  }
  return snap
}

/** Push: kirim snapshot whitelist + checksum SHA-256. Kembalikan respons CP. */
export async function push() {
  if (!navigator.onLine) throw new CpError(0, { message: 'Tidak ada koneksi internet.' })
  const snapshot = collectSnapshot()
  if (Object.keys(snapshot).length === 0) {
    throw new CpError(0, { message: 'Tidak ada data yang bisa dikirim (snapshot kosong).' })
  }
  const checksum = await sha256Hex(JSON.stringify(snapshot))
  const res = await cpApi.syncPush({ snapshot, checksum })
  storageHelper.set('sync_last_push', { at: new Date().toISOString(), keys: Object.keys(snapshot) })
  return res
}

/** Pull: tarik pembaruan; HARUS dikonfirmasi user sebelum apply. */
export async function pull() {
  if (!navigator.onLine) throw new CpError(0, { message: 'Tidak ada koneksi internet.' })
  const res = await cpApi.syncPull()
  const updates = (res && res.updates) || {}
  storageHelper.set('sync_last_pull', { at: new Date().toISOString(), count: Object.keys(updates).length })
  // Filter hanya key yang ada di whitelist (pengaman tambahan dari sisi klien).
  const filtered = {}
  for (const [key, value] of Object.entries(updates)) {
    if (SYNC_KEYS.includes(key)) filtered[key] = key === 'auth_user' ? { name: value.name, role: value.role } : value
  }
  return { updates: filtered, serverInfo: res }
}

export function applyUpdates(updates) {
  if (!updates || typeof updates !== 'object') return
  Object.entries(updates).forEach(([key, value]) => {
    if (SYNC_KEYS.includes(key)) storageHelper.set(key, value)
  })
  storageHelper.set('sync_last_apply', { at: new Date().toISOString() })
}

export async function getSyncStatus() {
  const { licenseCode } = getStoredLicense()
  if (!licenseCode) return { connected: false }
  try {
    return await cpApi.syncStatus()
  } catch {
    return { connected: false }
  }
}

export { SYNC_KEYS }
