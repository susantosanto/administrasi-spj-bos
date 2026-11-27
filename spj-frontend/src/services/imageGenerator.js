/**
 * ⛔ SEBELUM MENGUBAH FILE INI — WAJIB BACA:
 *    planning/sprints/sprint-022/KEPUTUSAN-DIKUNCI.MD
 *    (provider, model default, biaya, kuota, larangan). Deviasi butuh persetujuan user
 *    + entri baru di DECISIONS.MD. Ditegakkan lewat AGENTS.MD butir 7.
 */

/**
 * imageGenerator.js — Generate Foto Dokumentasi dengan AI (Sprint 020)
 *
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 AKTIF: Puter.js txt2img — foto RIIL (Sprint 020, menggantikan canvas
 *    placeholder Sprint warisan). Tanpa API key; model User-Pays (akun
 *    Puter gratis ditanggung masing-masing user).
 *    Docs: https://docs.puter.com/AI/txt2img/
 *    - Return: Promise<HTMLImageElement> → baca `.src` (URL hosted
 *      SEMENTARA atau dataURI) → wajib dikonversi ke dataURL base64.
 *    - Image-to-image: `input_images` (array dataURL/URL) — didukung
 *      provider default (gpt-image-2) hingga multi gambar.
 *    - Error umum: insufficient_funds (402) · moderation_flagged ·
 *      upstream_failed — dilempar ke pemanggil (fallback di UI).
 * 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image) — blok komentar di bawah.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Cara mengganti model:
 * 1. Ubah PROVIDER_DEFAULT dari 'puter' ke 'flux'
 * 2. Set FAL_API_KEY di environment
 * 3. Uncomment block Flux Pro di bawah
 */

// ═══════════════════════════════════════════════════════════════════════
// 🔧 KONFIGURASI — Ganti model di sini
// ═══════════════════════════════════════════════════════════════════════

// 🟢 PUTER.JS (Default — tanpa API key, User-Pays)
const PROVIDER_DEFAULT = 'puter'

// 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image)
// const PROVIDER_DEFAULT = 'flux'
// const FAL_API_KEY = import.meta.env.VITE_FAL_API_KEY || ''

// ═══════════════════════════════════════════════════════════════════════
// 📝 PROMPT TEMPLATES — Aktivitas → Deskripsi Gambar
// ═══════════════════════════════════════════════════════════════════════

export const ACTIVITY_PROMPTS = {
  rapat: {
    name: 'Rapat Guru',
    icon: 'groups',
    defaultPrompt: 'Sebuah foto dokumentasi rapat guru di ruang rapat sekolah Indonesia. Para guru duduk mengelilingi meja, papan tulis di latar belakang, suasana formal santai, pencahayaan alami dari jendela, gaya foto candid, kualitas tinggi, photorealistic.',
  },
  mamin: {
    name: 'Serah Terima Makanan',
    icon: 'restaurant',
    defaultPrompt: 'Sebuah foto dokumentasi serah terima nasi box atau snack box untuk kegiatan sekolah. Guru menerima kotak makanan di lorong sekolah, siang hari, pencahayaan alami, gaya dokumenter, kualitas tinggi, photorealistic.',
  },
  atk: {
    name: 'Serah Terima ATK',
    icon: 'inventory_2',
    defaultPrompt: 'Sebuah foto dokumentasi serah terima alat tulis kantor untuk kegiatan sekolah. Guru menerima paket ATK di ruang kelas, kotak perlengkapan di atas meja, siang hari, pencahayaan alami, kualitas tinggi, photorealistic.',
  },
  pemeliharaan: {
    name: 'Pemeliharaan',
    icon: 'build',
    defaultPrompt: 'Sebuah foto dokumentasi pemeliharaan atau perbaikan fasilitas sekolah. Guru mengawasi pekerjaan perbaikan di area sekolah, latar belakang gedung sekolah, siang hari, pencahayaan alami, gaya dokumenter, kualitas tinggi, photorealistic.',
  },
}

// ═══════════════════════════════════════════════════════════════════════
// 🟢 PUTER.JS — txt2img foto riil (Sprint 020)
// ═══════════════════════════════════════════════════════════════════════

let _puterModule = null

async function _getPuter() {
  if (!_puterModule) {
    _puterModule = await import('@heyputer/puter.js')
  }
  return _puterModule.default
}

/**
 * Konversi hasil txt2img (URL hosted sementara ATAU dataURI) → dataURL
 * base64 yang stabil untuk disimpan di state foto (konsisten jalur upload).
 *
 * @param {string} src — image.src dari HTMLImageElement hasil txt2img
 * @returns {Promise<string>} — dataURL base64
 */
async function _toDataUrl(src) {
  if (typeof src === 'string' && src.startsWith('data:')) return src
  const response = await fetch(src)
  if (!response.ok) {
    throw new Error(`Gagal mengunduh hasil gambar (HTTP ${response.status})`)
  }
  const blob = await response.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Gagal membaca hasil gambar'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Generate foto dokumentasi RIIL via Puter.js txt2img (Sprint 020).
 *
 * @param {string} prompt — Deskripsi gambar
 * @param {string[]} inputImages — Array dataURL input image (image-to-image):
 *        foto wajah personel terpilih + foto ruangan referensi
 *        (via `input_images`; kosong = text-to-image murni)
 * @returns {Promise<string>} — dataURL base64
 */
async function generateWithPuter(prompt, inputImages = []) {
  const puter = await _getPuter()

  // Provider default (tanpa param model) = OpenAI gpt-image-2 — mendukung
  // multi input image. Rasio 4:3 landscape sesuai format dokumen A4.
  // quality 'high' — default docs = 'low' (wajah tidak mirip referensi).
  const options = { ratio: { w: 4, h: 3 }, quality: 'high' }
  if (inputImages.length > 0) {
    options.input_images = inputImages
  }

  const image = await puter.ai.txt2img(prompt, options)
  const src = image?.src ?? image
  if (!src || typeof src !== 'string') {
    throw new Error('Puter AI tidak mengembalikan gambar')
  }
  return await _toDataUrl(src)
}

/**
 * Preload modul puter.js — panggil saat kartu AI di-mount (fire-and-forget).
 *
 * Popup sign-in Puter hanya boleh dibuka browser dalam jendela aktivasi klik
 * user (transient activation). Kalau modul harus di-import + di-init SAAT
 * klik pertama, rantai async bisa makan waktu sampai aktivasi kedaluwarsa →
 * popup diblokir diam-diam. Preload memperpendek rantai itu.
 */
export function preloadPuter() {
  return _getPuter().catch(() => {})
}

/**
 * Cek status sign-in Puter (token ada di memori modul).
 *
 * @returns {Promise<boolean>} — true bila user sudah sign-in
 */
export async function cekSigninPuter() {
  try {
    const puter = await _getPuter()
    return !!puter.authToken
  } catch {
    return false
  }
}

/**
 * Buka popup sign-in Puter LANGSUNG dari klik user (gesture murni → browser
 * menjamin popup tidak diblokir). Sekali sign-in, token tersimpan dan
 * generate berikutnya tidak memunculkan popup lagi.
 */
export async function masukPuter() {
  const puter = await _getPuter()
  await puter.ui.authenticateWithPuter()
  return true
}

// ═══════════════════════════════════════════════════════════════════════
// 🖼️ CANVAS PLACEHOLDER — fallback SAAT PUTER GAGAL saja (Sprint 020)
//    Bukan jalur utama. Hasilnya WAJIB diberi label "placeholder" di UI.
// ═══════════════════════════════════════════════════════════════════════

function _canvasPlaceholder(prompt) {
  return new Promise((resolve) => {
    // Create canvas dengan prompt sebagai overlay text
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 768
    const ctx = canvas.getContext('2d')

    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#1e3a5f')
    gradient.addColorStop(0.5, '#2d5a87')
    gradient.addColorStop(1, '#1e3a5f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.arc(200, 150, 120, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(800, 600, 180, 0, Math.PI * 2)
    ctx.fill()

    // School icon placeholder
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fillRect(canvas.width / 2 - 100, 80, 200, 120)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(canvas.width / 2 - 100, 80, 200, 120)

    // Icon: 🏫
    ctx.font = '64px serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillText('🏫', canvas.width / 2, 160)

    // Title
    ctx.font = 'bold 28px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('Dokumentasi Kegiatan Sekolah', canvas.width / 2, 260)

    // Prompt text (wrapped)
    ctx.font = '16px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    const words = prompt.split(' ')
    let line = ''
    let y = 300
    const maxWidth = canvas.width - 120

    for (const word of words) {
      const testLine = line + word + ' '
      if (ctx.measureText(testLine).width > maxWidth) {
        ctx.fillText(line.trim(), canvas.width / 2, y)
        line = word + ' '
        y += 24
      } else {
        line = testLine
      }
    }
    ctx.fillText(line.trim(), canvas.width / 2, y)

    // Footer
    ctx.font = '12px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillText('SPJ BOS — Sistem Pengelolaan Dokumen Bantuan Operasional Sekolah', canvas.width / 2, canvas.height - 40)

    // Watermark — jujur: ini placeholder, bukan foto AI
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.fillText('PLACEHOLDER — AI TIDAK TERSEDIA', canvas.width / 2, canvas.height - 60)

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.9)
    resolve(base64)
  })
}

/** Fallback publik — dipanggil UI saat Puter gagal (R-3.2 Sprint 020). */
export function generatePlaceholderImage(prompt) {
  return _canvasPlaceholder(prompt)
}

// ═══════════════════════════════════════════════════════════════════════
// 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image)
// ═══════════════════════════════════════════════════════════════════════
// Uncomment block ini dan ubah PROVIDER_DEFAULT = 'flux' untuk upgrade.
//
// Cara pakai:
// 1. Daftar di https://fal.ai
// 2. Dapatkan API key
// 3. Set VITE_FAL_API_KEY di .env
// 4. Ubah PROVIDER_DEFAULT = 'flux'
// ═══════════════════════════════════════════════════════════════════════

/*
async function generateWithFlux(prompt, faceImage = null) {
  const FAL_KEY = import.meta.env.VITE_FAL_API_KEY || ''

  if (!FAL_KEY) {
    throw new Error('FAL_API_KEY belum diatur. Set VITE_FAL_API_KEY di .env')
  }

  const response = await fetch('https://fal.run/black-forest-labs/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'landscape_4_3',
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Fal.ai API error')
  }

  const result = await response.json()
  return result.images[0].url
}
*/

// ═══════════════════════════════════════════════════════════════════════
// 🚀 MAIN FUNCTION — Generate Documentation Image
// ═══════════════════════════════════════════════════════════════════════

/**
 * Susun input images untuk image-to-image — MURNI (Sprint 027-verifikasi).
 * Urutan: wajah dulu, ruangan TERAKHIR (latar). Duplikat dibuang.
 */
export function susunInputImages({ faceImages = [], ruangImage = null, faceImage = null } = {}) {
  const semua = [...(faceImages || [])]
  if (faceImage && !semua.includes(faceImage)) semua.push(faceImage)
  if (ruangImage && !semua.includes(ruangImage)) semua.push(ruangImage)
  return semua
}

/**
 * Suntik instruksi referensi eksplisit ke prompt — MURNI (Sprint 027-verifikasi).
 * Model edit perlu diperintah memakai gambar input; tanpa gambar → prompt utuh.
 */
export function suntikInstruksiReferensi(prompt, { adaWajah = false, adaRuang = false } = {}) {
  if (!adaWajah && !adaRuang) return prompt
  return `${prompt} WAJIB memakai gambar referensi terlampir: ${adaWajah ? 'wajah setiap orang HARUS persis sesuai foto personel pada gambar input (jangan mengubah wajah), ' : ''}${adaRuang ? 'latar/ruangan HARUS sesuai foto ruangan pada gambar input, ' : ''}gabungkan semua referensi dalam satu foto dokumentasi yang natural.`
}

/**
 * Generate foto dokumentasi kegiatan sekolah (Sprint 020: foto riil).
 *
 * @param {object} params
 * @param {string} params.prompt — Deskripsi gambar (custom atau default)
 * @param {string} params.activity — Jenis kegiatan (rapat/mamin/atk/pemeliharaan)
 * @param {string[]} [params.faceImages] — Array dataURL foto wajah personel
 *        terpilih (image-to-image). Kosong = text-to-image murni.
 * @param {string} [params.ruangImage] — dataURL foto ruangan referensi
 *        (Data Sekolah → Foto Referensi → Ruangan) — ikut jadi input image
 *        agar suasana/latar mengikuti ruangan asli sekolah.
 * @param {string} [params.faceImage] — LEGACY (halaman yatim
 *        DokumentasiAIPage.jsx): foto wajah tunggal, digabung ke faceImages.
 * @param {string} [params.provider] — 'puter' (default) atau 'flux' (future)
 * @returns {Promise<string>} — dataURL base64. GAGAL = throw (fallback
 *          placeholder diputuskan di UI, bukan di sini).
 */
export async function generateDocumentationImage({
  prompt,
  activity,
  faceImages = [],
  ruangImage = null,
  faceImage = null,
  provider = PROVIDER_DEFAULT,
}) {
  // Build final prompt
  const activityConfig = ACTIVITY_PROMPTS[activity]
  const finalPrompt = prompt || activityConfig?.defaultPrompt || ACTIVITY_PROMPTS.rapat.defaultPrompt

  // Compat legacy: faceImage tunggal (halaman yatim) digabung ke array
  const allFaceImages = [...(faceImages || [])]
  if (faceImage && !allFaceImages.includes(faceImage)) allFaceImages.push(faceImage)

  // Input images = wajah personel dulu, foto ruangan terakhir (latar)
  // Instruksi referensi eksplisit (fungsi murni, teruji node)
  const inputImages = susunInputImages({ faceImages: allFaceImages, ruangImage })
  const promptReferensi = suntikInstruksiReferensi(finalPrompt, {
    adaWajah: allFaceImages.length > 0, adaRuang: !!ruangImage,
  })

  // Route ke provider
  switch (provider) {
    case 'puter':
      return generateWithPuter(promptReferensi, inputImages)

    // 🔴 FUTURE: Uncomment untuk Flux Pro
    // case 'flux':
    //   return generateWithFlux(finalPrompt, inputImages)

    default:
      return generateWithPuter(promptReferensi, inputImages)
  }
}

/**
 * Resize image ke max dimension (untuk hemat token/bandwidth).
 *
 * Sprint 026 (FR-1): tambah img.onerror + timeout 5 dtk — file rusak/format
 * aneh me-reject Error Indonesia, bukan menggantung selamanya.
 *
 * @param {string} base64 — Base64 image
 * @param {number} maxSize — Max width/height
 * @returns {Promise<string>} — Resized base64
 */
const BATAS_RESIZE_MS = 5000
export function resizeImage(base64, maxSize = 512) {
  return new Promise((resolve, reject) => {
    let selesai = false
    const gagal = (pesan) => {
      if (selesai) return
      selesai = true
      reject(new Error(pesan))
    }
    const timer = setTimeout(() => gagal(
      'Gambar tidak dapat dibaca (rusak atau format tidak didukung) — coba file JPG/PNG lain.'
    ), BATAS_RESIZE_MS)
    const img = new Image()
    img.onerror = () => {
      clearTimeout(timer)
      gagal('Gambar tidak dapat dibaca (rusak atau format tidak didukung) — coba file JPG/PNG lain.')
    }
    img.onload = () => {
      if (selesai) return
      selesai = true
      clearTimeout(timer)
      try {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } catch (err) {
        gagal('Gagal memproses gambar — coba file JPG/PNG lain.')
      }
    }
    img.src = base64
  })
}
