/**
 * activityLog — Ringkasan aktivitas operator untuk dashboard.
 * Key: `activity_log` (prefix `spj_` otomatis → `spj_activity_log`).
 * Cap 50 entri, quota-safe, tidak pernah throw (gagal tulis = diam).
 */
import storageHelper from './storageHelper'

const KEY = 'activity_log'
const MAX = 50

const TYPE_ICON = {
  bku_upload: 'upload_file',
  nomor: 'pin',
  dokumen: 'description',
  cetak: 'print',
  auth: 'login',
  data: 'database',
}

function now() {
  return new Date().toISOString()
}

export function logActivity({ type = 'dokumen', title = '', detail = '', icon = '' } = {}) {
  if (!title) return null
  try {
    const prev = storageHelper.get(KEY, [])
    const entry = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ts: now(),
      type,
      title,
      detail,
      icon: icon || TYPE_ICON[type] || 'info',
    }
    const next = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, MAX)
    storageHelper.set(KEY, next)
    return entry
  } catch {
    return null
  }
}

export function getActivity(limit = 7) {
  try {
    const list = storageHelper.get(KEY, [])
    if (!Array.isArray(list)) return []
    return list.slice(0, Math.max(0, limit))
  } catch {
    return []
  }
}

export function clearActivity() {
  try {
    storageHelper.set(KEY, [])
  } catch { /* abaikan */ }
}

export default { logActivity, getActivity, clearActivity }
