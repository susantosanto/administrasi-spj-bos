/**
 * storageAdapter.test.js — Unit test quota safety & schema versioning (Fase 2)
 */
import { describe, it, expect, beforeEach } from 'vitest'
import {
  getItem,
  setItem,
  removeItem,
  getUsage,
  isNearQuota,
  onQuotaWarning,
  ensureSchemaVersion,
  getStoredVersion,
  SCHEMA_VERSION,
  SCHEMA_KEY,
  _resetWarnFlag,
} from '../storageAdapter'

// ─── In-memory localStorage stub ──────────────────────────────────────

function makeStorage() {
  const store = new Map()
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    key: (i) => [...store.keys()][i] ?? null,
    get length() { return store.size },
  }
}

beforeEach(() => {
  globalThis.localStorage = makeStorage()
  _resetWarnFlag()
})

describe('setItem / getItem / removeItem', () => {
  it('round-trip string', () => {
    expect(setItem('k1', 'v1')).toMatchObject({ ok: true })
    expect(getItem('k1')).toBe('v1')
    removeItem('k1')
    expect(getItem('k1')).toBeNull()
  })

  it('menangkap QuotaExceededError dan notify listener', () => {
    const failing = makeStorage()
    failing.setItem = () => {
      const e = new Error('full')
      e.name = 'QuotaExceededError'
      throw e
    }
    globalThis.localStorage = failing
    const events = []
    const unsub = onQuotaWarning((info) => events.push(info))
    const res = setItem('k', 'v')
    expect(res.ok).toBe(false)
    expect(res.quotaExceeded).toBe(true)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('exceeded')
    unsub()
  })
})

describe('getUsage / isNearQuota', () => {
  it('estimasi byte > 0 setelah tulis', () => {
    setItem('a', 'x'.repeat(100))
    const u = getUsage()
    expect(u.bytes).toBeGreaterThan(0)
    expect(u.limit).toBe(5 * 1024 * 1024)
    expect(isNearQuota()).toBe(false)
  })
})

describe('ensureSchemaVersion', () => {
  it('menulis versi saat pertama kali', () => {
    const res = ensureSchemaVersion()
    expect(res.migrated).toBe(true)
    expect(getStoredVersion()).toBe(SCHEMA_VERSION)
    expect(globalThis.localStorage.getItem(SCHEMA_KEY)).toBe(SCHEMA_VERSION)
  })

  it('idempotent saat versi sudah terkini', () => {
    ensureSchemaVersion()
    expect(ensureSchemaVersion().migrated).toBe(false)
  })
})
