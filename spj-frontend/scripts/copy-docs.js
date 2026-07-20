/**
 * copy-docs.js — Copy dokumen referensi PDF ke public/docs (LOCAL MODE only)
 *
 * TIDAK perlu dijalankan jika VITE_DOCS_MODE=drive atau VITE_DOCS_MODE=electron.
 * 
 * Cara pakai:
 *   node scripts/copy-docs.js
 * 
 * Untuk apa?
 *   - Source PDF ada di build-resources/docs/ (tidak di git, tidak ikut build)
 *   - Vite serve static file dari public/
 *   - Script ini copy file ke public/docs/ agar bisa diakses via /docs/filename.pdf
 *   - Hanya diperlukan untuk LOCAL MODE (development)
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const SOURCE_DIR = join(ROOT, '..', 'build-resources', 'docs')
const TARGET_DIR = join(ROOT, 'public', 'docs')

// Mapping file — nama yang dipakai di kode → nama file asli
const FILE_MAP = {
  'permendagri.pdf': 'permendagri.pdf',
  'juknis-bosp.pdf': 'juknis-bosp.pdf',
  'perbup.pdf': 'perbup.pdf',
  'perbup-revisi-2023.pdf': 'perbup-revisi-2023.pdf',
  'permendikbudristek-18.pdf': 'permendikbudristek-18.pdf',
}

function main() {
  // Cek source — graceful handling untuk Vercel/CI / Drive mode
  if (!existsSync(SOURCE_DIR)) {
    console.warn('⚠️ build-resources/docs/ tidak ditemukan.')
    console.warn('   File PDF tidak tersedia. Untuk development lokal:')
    console.warn('   1. Buat folder build-resources/docs/')
    console.warn('   2. Taruh file PDF di folder tersebut')
    console.warn('   3. Jalankan script ini lagi')
    console.warn('   Atau set VITE_DOCS_MODE=drive untuk pakai Google Drive.')
    process.exit(0) // exit SUCCESS agar Vercel build tidak gagal
  }

  // Buat target
  if (!existsSync(TARGET_DIR)) {
    mkdirSync(TARGET_DIR, { recursive: true })
  }

  // Baca file yang tersedia
  const availableFiles = readdirSync(SOURCE_DIR)

  let copied = 0
  let missing = []

  for (const [targetName, sourceName] of Object.entries(FILE_MAP)) {
    if (availableFiles.includes(sourceName)) {
      const sourcePath = join(SOURCE_DIR, sourceName)
      const targetPath = join(TARGET_DIR, targetName)
      copyFileSync(sourcePath, targetPath)
      console.log(`  ✅ ${sourceName} → ${targetName}`)
      copied++
    } else {
      missing.push(sourceName)
      console.log(`  ⚠️  ${sourceName} — tidak ditemukan, skip`)
    }
  }

  console.log(`\n📊 ${copied} file berhasil dicopy.`)
  if (missing.length > 0) {
    console.log(`⚠️  ${missing.length} file tidak ditemukan:`)
    missing.forEach(f => console.log(`     - ${f}`))
  }
}

main()
