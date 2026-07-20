/**
 * semanticCache.js — Semantic Cache untuk Hemat Biaya API AI
 * 
 * ── KENAPA DIPERLUKAN? ───────────────────────────────────────
 * Banyak pertanyaan user yang SAMA secara makna tapi beda kata:
 *   "Berapa total pengeluaran?" = "Total pengeluaran berapa?"
 * Tanpa cache → 2 API call (boros)
 * Dengan cache → 1 API call + 1 cache hit (gratis)
 * 
 * ── CARA KERJA ───────────────────────────────────────────────
 * 1. Normalize pertanyaan (lowercase, hapus tanda baca, kata umum)
 * 2. Cari di cache berdasarkan key yang sudah di-normalize
 * 3. Jika ada dan belum expired → return cached answer (0 token!)
 * 4. Jika tidak ada → panggil API → simpan hasilnya
 * 
 * ── FITUR ────────────────────────────────────────────────────
 * ✅ LRU eviction (buang entry paling lama jika cache penuh)
 * ✅ TTL per entry (default 5 menit — data BKU bisa berubah)
 * ✅ Smart normalize (hapus kata umum, urutkan kata)
 * ✅ Bisa di-enable/disable runtime
 * ✅ Bisa di-reset total
 * 
 * ── MODULAR ──────────────────────────────────────────────────
 * Class ini bisa diganti total saat migrasi ke Electron + SQLite.
 * Cukup ganti storage backend dari Map → SQLite table.
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. KATA UMUM — Akan dihapus saat normalize (hemat variasi query)
// ═══════════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  'berapa', 'total', 'semua', 'tolong', 'please', 'bisa', 'saja', 
  'ya', 'yang', 'di', 'ke', 'dan', 'atau', 'saya', 'aku',
  'the', 'a', 'an', 'is', 'are', 'was', 'were',
])

// ═══════════════════════════════════════════════════════════════════════════
// 2. CACHE ENTRY
// ═══════════════════════════════════════════════════════════════════════════

class CacheEntry {
  constructor(key, answer, source = 'ai', metadata = {}) {
    this.key = key
    this.answer = answer
    this.source = source // 'ai' | 'query-engine' | 'fallback'
    this.metadata = metadata
    this.createdAt = Date.now()
    this.lastAccessed = Date.now()
    this.accessCount = 1
  }

  isExpired(ttlMs) {
    return Date.now() - this.createdAt > ttlMs
  }

  recordAccess() {
    this.lastAccessed = Date.now()
    this.accessCount++
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. SEMANTIC CACHE CLASS
// ═══════════════════════════════════════════════════════════════════════════

class SemanticCache {
  /**
   * @param {object} options
   * @param {number} options.maxSize — max entries (default: 100)
   * @param {number} options.ttlMs — time-to-live in ms (default: 5 menit)
   * @param {boolean} options.enabled — aktif/nonaktif (default: true)
   */
  constructor(options = {}) {
    this._cache = new Map()
    this._maxSize = options.maxSize || 100
    this._ttlMs = options.ttlMs || 5 * 60 * 1000
    this._enabled = options.enabled !== undefined ? options.enabled : true
    this._hits = 0
    this._misses = 0
  }

  // ── Normalization ──

  /**
   * Normalize pertanyaan: lowercase, hapus tanda baca, hapus kata umum, urutkan kata
   * Ini bikin "Berapa total pengeluaran?" = "total pengeluaran berapa" = "Total pengeluaran?"
   */
  _normalize(question) {
    if (!question) return ''
    
    return question
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '') // hapus tanda baca
      .split(/\s+/)
      .filter(word => word.length > 1 && !STOP_WORDS.has(word)) // hapus kata umum
      .sort() // urutkan abjad — bikin variasi kata jadi sama
      .join(' ')
      .trim()
  }

  // ── Core Operations ──

  /**
   * Cari di cache. Return null jika tidak ada atau expired.
   * @param {string} question — Pertanyaan asli (akan di-normalize)
   * @returns {string|null} — Answer atau null
   */
  get(question) {
    if (!this._enabled || !question) return null

    const key = this._normalize(question)
    if (!key) return null

    const entry = this._cache.get(key)
    
    if (!entry) {
      this._misses++
      return null
    }

    // Cek TTL
    if (entry.isExpired(this._ttlMs)) {
      this._cache.delete(key)
      this._misses++
      return null
    }

    // Cache hit!
    entry.recordAccess()
    this._hits++
    return entry.answer
  }

  /**
   * Simpan hasil ke cache.
   * @param {string} question — Pertanyaan asli
   * @param {string} answer — Jawaban
   * @param {string} source — 'ai' | 'query-engine' | 'fallback'
   * @param {object} metadata — Info tambahan
   */
  set(question, answer, source = 'ai', metadata = {}) {
    if (!this._enabled || !question || !answer) return

    const key = this._normalize(question)
    if (!key) return

    // LRU: jika penuh, hapus entry yang paling lama tidak diakses
    if (this._cache.size >= this._maxSize) {
      let oldestKey = null
      let oldestAccess = Infinity
      
      for (const [k, entry] of this._cache.entries()) {
        if (entry.lastAccessed < oldestAccess) {
          oldestAccess = entry.lastAccessed
          oldestKey = k
        }
      }
      
      if (oldestKey) {
        this._cache.delete(oldestKey)
      }
    }

    this._cache.set(key, new CacheEntry(key, answer, source, metadata))
  }

  /**
   * Hapus cache untuk pertanyaan tertentu.
   * Berguna jika data BKU berubah dan cache perlu di-invalidate.
   */
  invalidate(question) {
    if (!question) return
    const key = this._normalize(question)
    this._cache.delete(key)
  }

  /**
   * Hapus SEMUA cache.
   * Panggil setelah data BKU diupdate.
   */
  clear() {
    this._cache.clear()
    this._hits = 0
    this._misses = 0
  }

  /**
   * Hapus cache yang expired (manual cleanup).
   */
  clearExpired() {
    const now = Date.now()
    for (const [key, entry] of this._cache.entries()) {
      if (entry.isExpired(this._ttlMs)) {
        this._cache.delete(key)
      }
    }
  }

  // ── Stats ──

  /** Dapatkan statistik cache */
  getStats() {
    const total = this._hits + this._misses
    return {
      size: this._cache.size,
      maxSize: this._maxSize,
      hits: this._hits,
      misses: this._misses,
      total,
      hitRate: total > 0 ? ((this._hits / total) * 100).toFixed(1) + '%' : '0%',
      enabled: this._enabled,
      ttlMs: this._ttlMs,
    }
  }

  // ── Settings ──

  /** Enable/disable cache */
  setEnabled(enabled) {
    this._enabled = enabled
    if (!enabled) this.clear()
  }

  /** Ganti TTL */
  setTtl(ttlMs) {
    this._ttlMs = ttlMs
    this.clearExpired()
  }

  /** Ganti max size */
  setMaxSize(maxSize) {
    this._maxSize = maxSize
    // Jika cache lebih besar dari max baru, evict yang paling lama
    while (this._cache.size > this._maxSize) {
      let oldestKey = null
      let oldestAccess = Infinity
      for (const [k, entry] of this._cache.entries()) {
        if (entry.lastAccessed < oldestAccess) {
          oldestAccess = entry.lastAccessed
          oldestKey = k
        }
      }
      if (oldestKey) this._cache.delete(oldestKey)
    }
  }

  // ── Utility ──

  /** Serialisasi cache untuk debugging/analytics */
  toJSON() {
    return {
      stats: this.getStats(),
      entries: Array.from(this._cache.entries()).map(([key, entry]) => ({
        key,
        answer: entry.answer.substring(0, 100) + '...',
        source: entry.source,
        createdAt: new Date(entry.createdAt).toISOString(),
        accessCount: entry.accessCount,
      })),
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════

const semanticCache = new SemanticCache()

export default semanticCache
export { SemanticCache, CacheEntry }
