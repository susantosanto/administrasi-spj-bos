/**
 * storageHelper — High-level key-value store (prefix `spj_`, JSON otomatis)
 * Sekarang di atas `storageAdapter.js` (quota-safe). API tidak berubah.
 */
import {
  getItem as rawGet,
  setItem as rawSet,
  removeItem as rawRemove,
  getUsage,
  isNearQuota,
  ensureSchemaVersion,
  onQuotaWarning,
} from './storageAdapter'

const PREFIX = 'spj_'

export const storageHelper = {
  get(key, defaultValue = null) {
    try {
      const raw = rawGet(PREFIX + key)
      return raw ? JSON.parse(raw) : defaultValue
    } catch {
      return defaultValue
    }
  },

  set(key, value) {
    try {
      const res = rawSet(PREFIX + key, JSON.stringify(value))
      if (!res.ok) {
        console.error('Storage set error:', res.error)
        return false
      }
      return true
    } catch (e) {
      console.error('Storage set error:', e)
      return false
    }
  },

  remove(key) {
    rawRemove(PREFIX + key)
  },

  clear() {
    try {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(PREFIX)) keys.push(k)
      }
      keys.forEach((k) => rawRemove(k))
    } catch { /* abaikan */ }
  },

  getAll() {
    const data = {}
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k || !k.startsWith(PREFIX)) continue
        try {
          data[k.replace(PREFIX, '')] = JSON.parse(rawGet(k))
        } catch {
          data[k.replace(PREFIX, '')] = rawGet(k)
        }
      }
    } catch { /* abaikan */ }
    return data
  },

  // ── Quota helpers (diteruskan dari adapter) ──
  getUsage,
  isNearQuota,
  ensureSchemaVersion,
  onQuotaWarning,
}

export default storageHelper
