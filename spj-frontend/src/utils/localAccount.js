/**
 * Akun lokal aplikasi SPJ.
 *
 * Registrasi membuat akun lokal (username + password) yang dipakai halaman Masuk.
 * Password TIDAK pernah dikirim ke Control Plane; hanya hash-nya yang disimpan lokal.
 */
import storageHelper from './storageHelper'

const KEY = 'local_account'

async function sha256(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
    return 'sha256:' + [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  // Fallback non-secure context (mis. http://IP-LAN): hash sederhana, bukan kriptografi kuat.
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return 'fnv:' + h.toString(16).padStart(8, '0')
}

export function getLocalAccount() {
  return storageHelper.get(KEY)
}

/** Simpan akun lokal hasil registrasi. Password hanya disimpan sebagai hash. */
export async function saveLocalAccount({ username, password, name, email }) {
  const account = {
    username: username.trim(),
    passwordHash: await sha256(password),
    name: name?.trim() || username.trim(),
    email: email?.trim() || null,
    createdAt: new Date().toISOString(),
  }
  storageHelper.set(KEY, account)
  storageHelper.set('auth_user', { name: account.name, role: 'admin' })
  return account
}

/** Verifikasi login terhadap akun lokal. Tanpa akun lokal → mode lama (bebas). */
export async function verifyLocalAccount(username, password) {
  const account = getLocalAccount()
  if (!account) return { ok: true, legacy: true, account: null }
  const usernameOk = String(username).trim().toLowerCase() === String(account.username).toLowerCase()
  const passwordOk = (await sha256(password)) === account.passwordHash
  return { ok: usernameOk && passwordOk, legacy: false, account }
}

export function hasLocalAccount() {
  return !!getLocalAccount()
}
