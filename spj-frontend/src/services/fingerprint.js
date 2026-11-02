import storageHelper from '../utils/storageHelper'

/**
 * Fingerprint perangkat yang stabil: dibuat sekali dan digunakan ulang.
 * JANGAN regenerate tiap kali push/heartbeat — server mengaitkan perangkat dengan ini.
 */
export function getDeviceFingerprint() {
  let fp = storageHelper.get('device_id')
  if (!fp) {
    fp = (crypto.randomUUID && crypto.randomUUID()) || `fp-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    storageHelper.set('device_id', fp)
  }
  return fp
}

export const APP_VERSION = '1.0.0'
