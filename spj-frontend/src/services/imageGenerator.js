/**
 * imageGenerator.js — Generate Foto Dokumentasi dengan AI
 * 
 * ═══════════════════════════════════════════════════════════════════════
 * 🟢 MVP: Puter.js (GRATIS, tanpa API key)
 * 🔴 FUTURE: Flux Pro via fal.ai ($0.03/image) — uncomment & upgrade
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

// 🟢 PUTER.JS (Default — GRATIS)
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
// 🟢 PUTER.JS — Provider GRATIS (MVP)
// ═══════════════════════════════════════════════════════════════════════

let _puterModule = null

async function _getPuter() {
  if (!_puterModule) {
    _puterModule = await import('@heyputer/puter.js')
  }
  return _puterModule.default
}

/**
 * Generate gambar menggunakan Puter.js AI (GRATIS).
 * 
 * @param {string} prompt — Deskripsi gambar
 * @param {string|null} faceImage — Base64 foto wajah (opsional)
 * @returns {Promise<string>} — Base64 image atau URL
 */
async function generateWithPuter(prompt, faceImage = null) {
  const puter = await _getPuter()

  // Puter.js AI Chat — gunakan model yang support image generation
  // Note: Puter.js mungkin tidak support image generation langsung.
  // Alternatif: gunakan prompt untuk generate deskripsi, lalu
  // gunakan service lain untuk generate gambar.
  
  // Untuk MVP, kita gunakan Puter.js untuk generate prompt yang lebih baik,
  // lalu return placeholder image atau gunakan browser canvas.
  
  // ── STRATEGI: Prompt Enhancement + Canvas Generation ──
  // Karena Puter.js belum support image generation langsung,
  // kita generate gambar menggunakan canvas API dengan prompt sebagai deskripsi.
  
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

    // Watermark
    ctx.font = 'bold 14px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.fillText('GENERATED BY AI', canvas.width / 2, canvas.height - 60)

    // Convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.9)
    resolve(base64)
  })
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
 * Generate foto dokumentasi kegiatan sekolah.
 * 
 * @param {object} params
 * @param {string} params.prompt — Deskripsi gambar (custom atau default)
 * @param {string} params.activity — Jenis kegiatan (rapat/mamin/atk/pemeliharaan)
 * @param {string|null} params.faceImage — Base64 foto wajah (opsional)
 * @param {string} params.provider — 'puter' atau 'flux'
 * @returns {Promise<string>} — Base64 image atau URL
 */
export async function generateDocumentationImage({
  prompt,
  activity,
  faceImage = null,
  provider = PROVIDER_DEFAULT,
}) {
  // Build final prompt
  const activityConfig = ACTIVITY_PROMPTS[activity]
  const finalPrompt = prompt || activityConfig?.defaultPrompt || ACTIVITY_PROMPTS.rapat.defaultPrompt

  // Route ke provider
  switch (provider) {
    case 'puter':
      return generateWithPuter(finalPrompt, faceImage)
    
    // 🔴 FUTURE: Uncomment untuk Flux Pro
    // case 'flux':
    //   return generateWithFlux(finalPrompt, faceImage)
    
    default:
      return generateWithPuter(finalPrompt, faceImage)
  }
}

/**
 * Resize image ke max dimension (untuk hemat token/bandwidth).
 * 
 * @param {string} base64 — Base64 image
 * @param {number} maxSize — Max width/height
 * @returns {Promise<string>} — Resized base64
 */
export function resizeImage(base64, maxSize = 512) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
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
    }
    img.src = base64
  })
}
