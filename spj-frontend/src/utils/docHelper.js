/**
 * docHelper.js — Utility untuk Dokumen Referensi
 * 
 * ── TRIPLE-PATH ARCHITECTURE ─────────────────────────────────────
 * 
 * Mode | VITE_DOCS_MODE | Sumber File          | Platform
 * :----| :------------- | :------------------- | :--------
 * LOCAL | 'local'       | /docs/filename.pdf   | Development (Vite)
 * DRIVE | 'drive'       | Google Drive URL     | Production (Vercel)
 * ELEC  | 'electron'    | IPC → shell.openPath | Desktop (Electron)
 * 
 * Cara pakai:
 *   import { downloadDoc, getDocUrl } from '../../utils/docHelper'
 *   downloadDoc('permendagri.pdf', 'PERMENDAGRI')
 */

// ═══════════════════════════════════════════════════════════════════════════
// KONFIGURASI MODE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Mode akses dokumen, diatur via environment variable:
 *   VITE_DOCS_MODE = 'local' | 'drive' | 'electron'
 * 
 * Default: 'local' — untuk development
 * Vercel:  set VITE_DOCS_MODE=drive + VITE_DOCS_{ID}=... di Vercel Dashboard
 * Electron: otomatis terdeteksi via window.electronAPI
 */
const DOCS_MODE = import.meta.env.VITE_DOCS_MODE || 'local'

/**
 * Mapping file → Google Drive File ID
 * Diisi via environment variable VITE_DOCS_{NAMA_FILE_UPPER}
 * 
 * Contoh:
 *   VITE_DOCS_PERMENDAGRI=1Wb2NfKTQr_dLoFJH0GfM0cx
 *   VITE_DOCS_JUKNIS_BOSP=abc123def456...
 */
const DRIVE_FILE_IDS = {
  'permendagri.pdf': import.meta.env.VITE_DOCS_PERMENDAGRI,
  'juknis-bosp.pdf': import.meta.env.VITE_DOCS_JUKNIS_BOSP,
  'perbup.pdf': import.meta.env.VITE_DOCS_PERBUP,
  'perbup-revisi-2023.pdf': import.meta.env.VITE_DOCS_PERBUP_REVISI,
  'permendikbudristek-18.pdf': import.meta.env.VITE_DOCS_PERMENDIKBUDRISTEK_18,
}

// ═══════════════════════════════════════════════════════════════════════════
// KONFIGURASI DOKUMEN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Daftar dokumen referensi yang tersedia.
 * 
 * Tri-state untuk file:
 *   - file: 'nama.pdf'  → tersedia (local/drive/electron)
 *   - file: null         → belum tersedia (card akan disabled)
 */
export const DOCUMENTS_REF = [
  {
    id: 'permendagri',
    judul: 'Permendagri No 3 Th 2023',
    sub: 'Pedoman Pengelolaan BOSP',
    file: 'permendagri.pdf',
    icon: 'policy',
    gradient: 'from-blue-500/10 to-indigo-500/10',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-600',
  },
  {
    id: 'juknis-bosp',
    judul: 'Juknis BOSP No 8 Th 2026',
    sub: 'Permendikdasmen tentang Petunjuk Teknis BOSP',
    file: 'juknis-bosp.pdf',
    icon: 'menu_book',
    gradient: 'from-violet-500/10 to-purple-500/10',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-600',
  },
  {
    id: 'perbup',
    judul: 'Perbup No 34 Th 2022',
    sub: 'Transaksi Non Tunai Kab. Bandung Barat',
    file: 'perbup.pdf',
    icon: 'gavel',
    gradient: 'from-amber-500/10 to-orange-500/10',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-600',
  },
  {
    id: 'perbup-revisi',
    judul: 'Perbup No 7 Th 2023',
    sub: 'Perubahan Perbup Transaksi Non Tunai',
    file: 'perbup-revisi-2023.pdf',
    icon: 'edit_note',
    gradient: 'from-orange-500/10 to-red-500/10',
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-600',
  },
  {
    id: 'permendikbudristek-18',
    judul: 'Permendikbudristek No 18 Th 2022',
    sub: 'Pedoman Pelaksanaan BOSP',
    file: 'permendikbudristek-18.pdf',
    icon: 'newspaper',
    gradient: 'from-rose-500/10 to-pink-500/10',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-600',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// FUNGSI UTILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dapatkan URL/filepath untuk file dokumen berdasarkan mode aktif.
 *
 * @param {string} filename - Nama file PDF (contoh: 'permendagri.pdf')
 * @returns {string|null} URL/path atau null jika tidak tersedia
 */
export function getDocUrl(filename) {
  if (!filename) return null

  // ── DRIVE MODE: Google Drive direct download ──
  if (DOCS_MODE === 'drive') {
    const fileId = DRIVE_FILE_IDS[filename]
    if (fileId) {
      // Format: uc?export=download&confirm=t → langsung download, skip virus scan
      return `https://drive.google.com/uc?export=download&confirm=t&id=${fileId}`
    }
    console.warn(`[docHelper] Drive File ID tidak ditemukan untuk: ${filename}`)
    console.warn('  Set environment variable: VITE_DOCS_' + filename.replace(/[.-]/g, '_').toUpperCase())
    return null
  }

  // ── ELECTRON MODE: IPC → main process baca file ──
  if (window.electronAPI) {
    // Main process handle via IPC, tidak perlu URL
    // Langsung panggil window.electronAPI.openDoc(filename) dari downloadDoc()
    return null
  }

  // ── LOCAL MODE (default): Vite static serve ──
  return `/docs/${filename}`
}

/**
 * Download / buka dokumen referensi.
 * 
 * @param {string} filename - Nama file PDF
 * @param {string} docLabel - Label untuk logging (optional)
 */
export function downloadDoc(filename, docLabel = 'Dokumen') {
  if (!filename) {
    console.warn(`[docHelper] ${docLabel} — file belum tersedia.`)
    return
  }

  // ── ELECTRON: buka via shell.openPath ──
  if (window.electronAPI) {
    window.electronAPI.openDoc(filename)
    console.log(`[docHelper] Membuka ${docLabel} via Electron`)
    return
  }

  // ── DRIVE / LOCAL: buka di tab browser ──
  const url = getDocUrl(filename)
  if (!url) {
    console.warn(`[docHelper] ${docLabel} — URL tidak tersedia.`)
    return
  }

  window.open(url, '_blank')
  console.log(`[docHelper] Membuka ${docLabel}: ${url}`)
}

/**
 * Cek apakah file tersedia berdasarkan mode aktif.
 * 
 * Untuk mode 'drive': cek apakah File ID terisi
 * Untuk mode 'local': cek apakah nama file ada
 * Untuk mode 'electron': selalu true (nanti di-check di main process)
 */
export function isDocAvailable(doc) {
  if (!doc || !doc.file) return false

  if (DOCS_MODE === 'drive') {
    return Boolean(DRIVE_FILE_IDS[doc.file])
  }

  if (DOCS_MODE === 'electron' || window.electronAPI) {
    return true // Electron bisa cek file langsung
  }

  // LOCAL mode
  return true
}


