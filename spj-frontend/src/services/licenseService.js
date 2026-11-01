/**
 * licenseService — status lisensi satu pintu untuk seluruh aplikasi.
 *
 * Sumber kebenaran: heartbeat ke Control Plane.
 * Dipakai siapa saja (banner, halaman, tombol aksi) untuk tahu apakah
 * aplikasi boleh menulis (THESIS: READ_ONLY/SUSPENDED/EXPIRED = hanya baca).
 *
 * Pemakaian:
 *   import { licenseService, useLicenseStatus } from '../services/licenseService'
 *   licenseService.refresh()            → saat boot
 *   licenseService.canWrite()           → boolean; kalau false, aksi tulis diblok
 *   useLicenseStatus()                  → hook React: { status, readOnly, validUntil, ... }
 *
 * TIDAK menyentuh data keuangan — hanya metadata lisensi.
 */
import { useEffect, useState } from 'react'
import cpClient from './cpClient'
import storageHelper from '../utils/storageHelper'

const STATUS_KEY = 'license_status'
let listeners = new Set()
let refreshing = null

const DEFAULT = { status: null, readOnly: true, validUntil: null, schoolName: null, checkedAt: null }

function emit(status) {
  for (const fn of listeners) fn(status)
}

export const licenseService = {
  /** Status terakhir (dari cache lokal — sinkron, aman saat render). */
  get() {
    const cached = storageHelper.get(STATUS_KEY)
    if (!cached) return DEFAULT
    return typeof cached === 'object' ? { ...DEFAULT, ...cached } : DEFAULT
  },

  /** Kirim heartbeat ke CP dan simpan hasilnya. Mengembalikan status baru. */
  async refresh() {
    if (!storageHelper.get('license_code')) return DEFAULT
    if (refreshing) return refreshing // hindari dobel heartbeat bersamaan
    refreshing = (async () => {
      try {
        const hb = await cpClient.heartbeat()
        const next = {
          status: hb.status || null,
          readOnly: !!hb.readOnly,
          validUntil: hb.validUntil || null,
          schoolName: hb.schoolName || null,
          maxDevices: hb.maxDevices || null,
          devicesUsed: hb.devicesUsed || null,
          checkedAt: new Date().toISOString(),
        }
        storageHelper.set(STATUS_KEY, next)
        emit(next)
        return next
      } catch (err) {
        // CP tak terjangkau: jangan kunci paksa — pakai status terakhir, tapi tandai usang
        const prev = licenseService.get()
        const stale = { ...prev, checkedAt: prev.checkedAt, unreachable: true }
        if (prev.checkedAt) {
          storageHelper.set(STATUS_KEY, stale)
          emit(stale)
        }
        return stale
      } finally {
        refreshing = null
      }
    })()
    return refreshing
  },

  /** Dipanggil saat register/activate sukses — reset cache lama. */
  reset() {
    storageHelper.set(STATUS_KEY, DEFAULT)
    emit(DEFAULT)
  },

  /** Boleh menulis? SALAH sejak boot belum tahu (belum heartbeat) = konservatif tapi tetap aman jika status ada. */
  canWrite() {
    const s = licenseService.get()
    if (s.status === null) return true // belum dihubungkan → perilaku lama (prototype/mock)
    return !s.readOnly
  },

  /** Pesan kenapa tulis diblok — untuk toast/inline. */
  blockReason() {
    const s = licenseService.get()
    if (s.status === null) return null
    return READ_ONLY_LABEL[s.status] || null
  },

  subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

const READ_ONLY_LABEL = {
  READ_ONLY: 'Mode baca aktif — masa aktif lisensi berakhir; edit dikunci saat masih di masa tenggang.',
  SUSPENDED: 'Lisensi ditangguhkan oleh pusat — hanya membaca.',
  EXPIRED: 'Lisensi sudah berakhir — hanya membaca.',
  GRACE: 'Masa tenggang — segera hubungi admin pusat untuk aktivasi ulang.',
}

/** Hook React — memicu re-render saat status berubah. */
export function useLicenseStatus() {
  const [s, setS] = useState(() => licenseService.get())
  useEffect(() => licenseService.subscribe(setS), [])
  return s
}

/**
 * Pintu tulis seragam: panggil dulu di handler aksi tulis.
 * Bila diblok, toast di Call ke pemblok dan fungsi TIDAK dijalankan.
 *   onClick={() => guardWrite(() => simpanData())}
 */
export function guardWrite(fn, { toast } = {}) {
  if (licenseService.canWrite()) return fn()
  if (toast) toast.error(licenseService.blockReason() || 'Mode baca — aksi tulis dinonaktifkan.')
}

/**
 * Versi entry-guard untuk halaman yang pakai useToast():
 *   const toast = useToast()
 *   ...
 *   if (!requireWrite(toast)) return   // awal handler; false = diblok (toast sudah tampil)
 */
export function requireWrite(toast) {
  if (licenseService.canWrite()) return true
  const msg = licenseService.blockReason() || 'Mode baca — aksi tulis dinonaktifkan.'
  if (toast?.error) toast.error(msg)
  return false
}
