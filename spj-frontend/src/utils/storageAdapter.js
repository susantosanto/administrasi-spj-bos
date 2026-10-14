/**
 * storageAdapter.js — Low-level storage layer dengan quota safety & schema versioning
 *
 * Kenapa ada file ini:
 * - localStorage punya batas ~5MB dan melempar QuotaExceededError saat penuh.
 * - Seluruh data app (sekolah, guru, BKU, chat AI) memakai prefix `spj_`.
 * - Adapter ini membungkus localStorage dengan try-catch + estimasi pemakaian
 *   + notifikasi kuota + migrasi berbasis `spj_schema_version`.
 *
 * Dipakai oleh: `storageHelper.js` (jangan panggil localStorage langsung dari modul lain).
 */

export const SCHEMA_VERSION = '1.0.0'
export const SCHEMA_KEY = 'spj_schema_version'

// Estimasi batas localStorage per browser (konservatif, bytes)
export const ESTIMATED_LIMIT_BYTES = 5 * 1024 * 1024
// Ambang peringatan (80% sesuai blueprint)
export const QUOTA_WARN_RATIO = 0.8

// ─── Event subscription (untuk UI warning, tanpa circular import) ───

const quotaListeners = new Set()
let warnOncePerSession = false

export function onQuotaWarning(listener) {
  quotaListeners.add(listener)
  return () => quotaListeners.delete(listener)
}

function notifyQuota(info) {
  quotaListeners.forEach((fn) => {
    try { fn(info) } catch { /* abaikan listener rusak */ }
  })
}

// ─── Core wrappers ────────────────────────────────────────────────────

function isQuotaError(e) {
  return e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014)
}

export function getItem(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    if (isQuotaError(e)) {
      const usage = getUsage()
      notifyQuota({ type: 'exceeded', ...usage })
      return { ok: false, quotaExceeded: true, error: e }
    }
    return { ok: false, quotaExceeded: false, error: e }
  }
  // Cek ambang 80% setelah tulis berhasil (sekali per sesi agar tidak spam)
  if (!warnOncePerSession) {
    const usage = getUsage()
    if (usage.ratio >= QUOTA_WARN_RATIO) {
      warnOncePerSession = true
      notifyQuota({ type: 'nearing', ...usage })
    }
  }
  return { ok: true, quotaExceeded: false }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch { /* abaikan */ }
}

// ─── Usage estimation ─────────────────────────────────────────────────

export function getUsage() {
  let bytes = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      const v = localStorage.getItem(k) || ''
      bytes += k.length * 2 + v.length * 2 // UTF-16 ≈ 2 bytes/char
    }
  } catch {
    bytes = 0
  }
  const ratio = ESTIMATED_LIMIT_BYTES > 0 ? bytes / ESTIMATED_LIMIT_BYTES : 0
  return { bytes, limit: ESTIMATED_LIMIT_BYTES, ratio, percent: Math.round(ratio * 100) }
}

export function isNearQuota() {
  return getUsage().ratio >= QUOTA_WARN_RATIO
}

/** Dipakai test: reset flag peringatan sesi */
export function _resetWarnFlag() {
  warnOncePerSession = false
}

// ─── Schema versioning & migration ────────────────────────────────────

const migrations = []

/** Daftarkan migrasi: dijalankan berurutan saat versi tersimpan < SCHEMA_VERSION */
export function registerMigration(version, fn) {
  migrations.push({ version, fn })
  migrations.sort((a, b) => (a.version < b.version ? -1 : 1))
}

export function getStoredVersion() {
  try {
    return localStorage.getItem(SCHEMA_KEY) || null
  } catch {
    return null
  }
}

/** Pastikan versi skema terkini; jalankan migrasi tertunda. Aman dipanggil tiap mount. */
export function ensureSchemaVersion() {
  const stored = getStoredVersion()
  if (stored === SCHEMA_VERSION) return { migrated: false, from: stored }
  try {
    for (const m of migrations) {
      if (!stored || m.version > stored) m.fn()
    }
    localStorage.setItem(SCHEMA_KEY, SCHEMA_VERSION)
  } catch {
    return { migrated: false, from: stored, error: true }
  }
  return { migrated: true, from: stored, to: SCHEMA_VERSION }
}

export default {
  SCHEMA_VERSION,
  SCHEMA_KEY,
  ESTIMATED_LIMIT_BYTES,
  QUOTA_WARN_RATIO,
  getItem,
  setItem,
  removeItem,
  getUsage,
  isNearQuota,
  onQuotaWarning,
  registerMigration,
  getStoredVersion,
  ensureSchemaVersion,
}
