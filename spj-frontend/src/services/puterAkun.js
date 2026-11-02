/**
 * puterAkun.js — Multi-akun Puter + rotasi kuota otomatis (Sprint 020 tambahan)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * Latar (laporan user 2026-10-24): generate foto AI kena limit kuota Puter.
 * Model User-Pays Puter: kuota dihitung PER AKUN — jadi solusi antisipasi =
 * simpan beberapa akun Puter, dan saat kuota satu akun habis, OTOMATIS
 * pindah ke akun berikutnya lalu retry generate.
 *
 * Cara kerja teknis (diverifikasi di node_modules/@heyputer/puter.js):
 * - Token tersimpan di memori modul (`puter.authToken`) + localStorage
 *   `puter.auth.token.v2`.
 * - `puter.setAuthToken(token)` (src/index.js:726) mengganti token SAAT
 *   RUNTIME: set authToken, persist ke localStorage, lalu updateSubmodules()
 *   (line 763) propagate ke sub-handler — TANPA reload halaman.
 * - `puter.ai.txt2img` membaca authToken per request (Authorization header
 *   dibangun saat request, line 634/681) → ganti token = ganti akun untuk
 *   panggilan berikutnya.
 * - Kuota habis terdeteksi dari rejection driver call (src/lib/utils.js):
 *   HTTP 402 / `error.code === 'insufficient_funds'` /
 *   `metadata.usage_limited === true` / HTTP 429 (rate limit).
 *   401 (token kadaluarsa) BUKAN kuota — tidak memicu rotasi.
 * ═══════════════════════════════════════════════════════════════════════
 */

const AKUN_KEY = 'spj_puter_akun' // prefix spj_ wajib (aturan proyek)

let _puterModule = null
async function _getPuter() {
  if (!_puterModule) {
    _puterModule = (await import('@heyputer/puter.js')).default
  }
  return _puterModule
}

// ═══════════════════════════════════════════════════════════════════════
// 📦 PENYIMPANAN DAFTAR AKUN — localStorage spj_puter_akun
//    Struktur: [{ id, label, token, ditambahkan, habisAt }]
// ═══════════════════════════════════════════════════════════════════════

export function bacaAkun() {
  try {
    const daftar = JSON.parse(localStorage.getItem(AKUN_KEY) || '[]')
    return Array.isArray(daftar) ? daftar : []
  } catch {
    return []
  }
}

function simpanDaftar(daftar) {
  localStorage.setItem(AKUN_KEY, JSON.stringify(daftar))
}

/** Label ramah dari token JWT (payload.username/email) — fallback null. */
export function labelDariToken(token) {
  try {
    const bagian = String(token).split('.')
    if (bagian.length < 2) return null
    let payload = bagian[1].replace(/-/g, '+').replace(/_/g, '/')
    while (payload.length % 4) payload += '='
    const data = JSON.parse(atob(payload))
    return data.username || data.email || data.uuid || null
  } catch {
    return null
  }
}

/**
 * Simpan token sesi AKTIF sebagai akun (bila belum ada di daftar).
 * Dipanggil: (1) setelah sign-in popup sukses, (2) saat kartu dibuka dan
 * sesi sudah ada — supaya user lama otomatis punya "Akun 1".
 *
 * @returns {Promise<{daftar: Array, baru: boolean}>}
 */
export async function tambahAkunDariSesi() {
  const puter = await _getPuter()
  const token = puter.authToken
  if (!token) return { daftar: bacaAkun(), baru: false }
  const daftar = bacaAkun()
  if (daftar.some((a) => a.token === token)) return { daftar, baru: false }
  const label = labelDariToken(token) || `Akun ${daftar.length + 1}`
  const entri = {
    id: `akun_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    label,
    token,
    ditambahkan: Date.now(),
    habisAt: null,
  }
  daftar.push(entri)
  simpanDaftar(daftar)
  return { daftar, baru: true }
}

/** Hapus akun dari daftar rotasi (sesi browser tidak diubah). */
export function hapusAkun(id) {
  simpanDaftar(bacaAkun().filter((a) => a.id !== id))
}

/** Tandai akun kehabisan kuota (badge + dilewati rotasi berikutnya). */
export function tandaiHabis(id) {
  const daftar = bacaAkun()
  const a = daftar.find((x) => x.id === id)
  if (a) {
    a.habisAt = Date.now()
    simpanDaftar(daftar)
  }
}

/** Bersihkan status habis (kuota bisa reset; user aktifkan ulang via UI). */
export function bersihkanHabis(id) {
  const daftar = bacaAkun()
  const a = daftar.find((x) => x.id === id)
  if (a && a.habisAt) {
    a.habisAt = null
    simpanDaftar(daftar)
  }
}

// ═══════════════════════════════════════════════════════════════════════
// 🔄 AKTIVASI & DETEKSI KUOTA
// ═══════════════════════════════════════════════════════════════════════

/** Token sesi aktif modul puter.js (null bila belum sign-in). */
export async function tokenAktifPuter() {
  try {
    const puter = await _getPuter()
    return puter.authToken || null
  } catch {
    return null
  }
}

/**
 * Ganti akun aktif SAAT RUNTIME via puter.setAuthToken (tanpa reload).
 * @returns {Promise<boolean>} true bila berhasil
 */
export async function aktifkanAkunPuter(token) {
  const puter = await _getPuter()
  if (typeof puter.setAuthToken !== 'function') {
    throw new Error('Versi puter.js tidak mendukung ganti akun (setAuthToken)')
  }
  puter.setAuthToken(token)
  return true
}

/**
 * Hapus sesi aktif (token memori + localStorage) via puter.resetAuthToken.
 * DIPERLUKAN untuk "Tambah akun": authenticateWithPuter() NO-OP bila masih
 * sign-in (UI.js:1254-1259 — resolve langsung tanpa popup). Reset dulu →
 * popup auth baru mau terbuka. Sesi lama aman karena sudah tersimpan di
 * daftar akun (bisa diaktifkan ulang dengan klik).
 */
export async function keluarPuter() {
  const puter = await _getPuter()
  if (typeof puter.resetAuthToken === 'function') {
    puter.resetAuthToken()
  }
}

/**
 * Deteksi error KUOTA (satu-satunya pemicu rotasi akun).
 * Sumber bentuk rejection driver call puter.js (utils.js:574-583):
 * { success:false, error:{code,status,message}, metadata:{usage_limited} }
 * 401 = token bermasalah — BUKAN kuota, jangan rotasi.
 */
export function adalahErrorKuota(err) {
  if (!err) return false
  const kode = err?.error?.code || err?.code || ''
  const status = err?.error?.status || err?.status || 0
  const teks = String(err?.message || err?.error?.message || err?.msg || '')
  if (kode === 'insufficient_funds' || kode === 'usage_limited') return true
  if (status === 402 || status === 429) return true
  if (err?.metadata?.usage_limited === true) return true
  if (/insufficient|usage.?limit|rate.?limit|too many requests|kuota habis/i.test(teks)) return true
  return false
}

// ═══════════════════════════════════════════════════════════════════════
// 🚀 ROTASI OTOMATIS — bungkus panggilan generate
// ═══════════════════════════════════════════════════════════════════════

/**
 * Supresi dialog "Low Balance" bawaan puter.js (laporan user 2026-10-24:
 * dialog mengganggu padahal rotasi akun sudah menangani kuota habis).
 *
 * puter.js menampilkan <usage-limit-dialog> (modules/UsageLimitDialog.js)
 * via showUsageLimitDialog() SEBELUM rejection sampai ke kita — fungsi itu
 * import modul-scope (tidak bisa di-monkey-patch), tapi elemennya custom
 * element biasa di document.body → dibuang via MutationObserver.
 * Idempotent — aman dipanggil berkali-kali (kartu AI + Pengaturan).
 */
let _supresiTerpasang = false
export function pasangSupresiDialogPuter() {
  if (_supresiTerpasang || typeof document === 'undefined') return
  _supresiTerpasang = true
  const buang = () => {
    document.querySelectorAll('usage-limit-dialog').forEach((el) => el.remove())
  }
  buang()
  new MutationObserver(buang).observe(document.body, { childList: true })
}

/**
 * Jalankan `jalankan()` dengan rotasi akun otomatis:
 * 1. Coba akun AKTIF dulu (sesi sekarang).
 * 2. Kena error kuota → tandai habis → aktifkan akun berikutnya → retry.
 * 3. Akun berstatus habis DILEWATI (hemat waktu; kuota bulanan biasanya
 *    reset — user bisa aktifkan ulang dengan klik akun di UI).
 * 4. Error selain kuota (auth, jaringan, moderation) → langsung throw,
 *    TIDAK membuang akun lain.
 * 5. Semua akun habis → throw error kuota terakhir ke UI.
 *
 * Tanpa akun tersimpan → perilaku lama (satu percobaan sesi aktif).
 *
 * @param {() => Promise<string>} jalankan — thunk generate (dataURL)
 * @param {{onRotasi?: (labelGagal: string, labelSukses: string) => void}} [opts]
 *        — dipanggil saat retry dengan akun BERIKUTNYA berhasil (info UI).
 * @returns {Promise<string>} dataURL hasil generate
 */
export async function generateDenganRotasi(jalankan, opts = {}) {
  const tokenSesi = await tokenAktifPuter()
  const daftar = bacaAkun()
  const aktif = daftar.find((a) => a.token === tokenSesi)
  const layak = daftar.filter((a) => !a.habisAt)
  const urutan = aktif && !aktif.habisAt
    ? [aktif, ...layak.filter((a) => a.id !== aktif.id)]
    : layak

  // Tidak ada kandidat rotasi → satu percobaan apa adanya (perilaku lama)
  if (urutan.length === 0) return jalankan()

  let terakhir = null
  let labelGagal = null
  for (const akun of urutan) {
    try {
      if (tokenSesi !== akun.token) {
        await aktifkanAkunPuter(akun.token)
        bersihkanHabis(akun.id)
      }
      const hasil = await jalankan()
      // Sukses SETELAH ada akun yang kehabisan kuota → info rotasi ke UI
      if (labelGagal && typeof opts.onRotasi === 'function') {
        try { opts.onRotasi(labelGagal, akun.label) } catch { /* info saja */ }
      }
      return hasil
    } catch (err) {
      if (!adalahErrorKuota(err)) throw err
      tandaiHabis(akun.id)
      labelGagal = akun.label
      terakhir = err
    }
  }
  throw terakhir
}
