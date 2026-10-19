/**
 * bkuPdfPages.js — Sprint 015 · M1 Render PDF (≤200 baris)
 *
 * Tanggung jawab:
 *   1. buka PDF (pdfjs-dist, worker lokal)
 *   2. render tiap halaman ke <canvas> untuk dikirim ke OCR
 *   3. rotasi 90 derajat  ← WAJIB (lihat catatan di bawah)
 *   4. deteksi text-layer per halaman (fast-path, tanpa OCR)
 *   5. onProgress(page, total) + AbortSignal supaya bisa dibatalkan
 *
 * ── CATATAN ROTASI (penting, hasil empiris 2026-10-19) ──────────────────────
 * PDF BKU contoh berorientasi SISI: teks pada halaman tercetak 90 derajat.
 * Tanpa rotasi, glyph_condong membuat OCR mengacaukan digit rupiah
 * (terbukti: "2.560.000", ".160.000" — digit hilang/tertukar).
 * Dengan rotasi 90 derajatClockwise, seluruh angka rupiah terbaca utuh dan
 * rantai saldo menjadi konsisten. JANGAN dihapus tanpa mengulang T-03..T-05.
 */

export const DPI_AWAL = 200
export const ROTASI_AWAL = 90
const AMBANG_TEXT = 40 // jumlah karakter minimum untuk dianggap punya text-layer

/** Lempar error pembatalan yang bisa dikenali pemanggil. */
export class DibatalkanError extends Error {
  constructor() {
    super('dibatalkan')
    this.name = 'DibatalkanError'
  }
}

const PESAN_KOSONG = 'File PDF kosong (0 byte) — file belum terunduh sempurna atau rusak. ' +
  'Unduh ulang dari sumber, lalu unggah lagi. Data tidak diubah.'

/**
 * Periksa file PDF SEBELUM pdf.js — gagal cepat, pesan bisa ditindaklanjuti.
 *
 * pdf.js melempar exception teknis berbahasa Inggris ("The PDF file is empty,
 * i.e. its size is zero bytes.") untuk file 0 byte. Secara teknis benar,
 * tapi bagi bendahara itu tidak informatif: yang perlu diketahui adalah
 * file-nya rusak/belum terunduh sempurna dan harus diunduh ulang.
 *
 * @param {File|null} file
 * @returns {string} pesan error; string kosong berarti file layak diproses
 */
export function periksaFilePdf(file) {
  if (!file) return 'File tidak terbaca. Pilih ulang file PDF BKU.'
  if (file.size === 0) return PESAN_KOSONG
  if (file.size < 32) {
    return `File PDF terlalu kecil (${file.size} byte) — file kemungkinan rusak. ` +
      'Unduh ulang dari sumber, lalu unggah lagi. Data tidak diubah.'
  }
  return ''
}

/**
 * Header PDF asli adalah "%PDF-" (5 byte pertama). Berkas .pdf hasil
 * unduhan gagal (HTML, atau PDF terpotong) ditolak di sini — bukan gagal
 * diam-diam di tengah OCR.
 */
export function headerPdfValid(bytes) {
  if (!bytes || bytes.length < 5) return false
  return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 &&
    bytes[3] === 0x46 && bytes[4] === 0x2d
}

/**
 * Terjemahkan pesan teknis pdf.js → kalimat yang bisa ditindaklanjuti.
 * Pesan yang tidak dikenal diteruskan apa adanya (bukan ditelan).
 */
export function pesanGagalPdf(pesan) {
  const p = String(pesan || '')
  if (/zero bytes|is empty/i.test(p)) return PESAN_KOSONG
  if (/Invalid PDF structure|corrupt|damaged/i.test(p)) {
    return 'File PDF rusak atau tidak lengkap sehingga tidak bisa dibaca. ' +
      'Unduh ulang dari sumber, lalu unggah lagi. Data tidak diubah.'
  }
  if (/password/i.test(p)) {
    return 'File PDF terkunci (berpassword). Buat versi tanpa password, ' +
      'lalu unggah lagi. Data tidak diubah.'
  }
  return 'Gagal memproses PDF: ' + p
}

/** Cek sinyal abort tanpa melempar. */
export function sudahDibatalkan(sinyal) {
  return Boolean(sinyal && sinyal.aborted)
}

function ensure(sinyal) {
  if (sudahDibatalkan(sinyal)) throw new DibatalkanError()
}

/** Muat pdfjs-dist secara lazy supaya modul ini bisa di-import di Node (DoD). */
async function muatPdfjs(workerUrl) {
  const lib = await import('pdfjs-dist/build/pdf')
  if (workerUrl) lib.GlobalWorkerOptions.workerSrc = workerUrl
  return lib
}

/**
 * Buka dokumen PDF.
 * @param {ArrayBuffer|Uint8Array} data
 * @returns {Promise<{pdf:object, total:number}>}
 */
export async function bukaPdf(data, { workerUrl, sinyal } = {}) {
  ensure(sinyal)
  const pdfjs = await muatPdfjs(workerUrl)
   // Salin buffer: pdfjs men-transfer ownership, buffer tidak boleh dipakai ulang.
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0))
  const pdf = await pdfjs.getDocument({ data: bytes }).promise
  ensure(sinyal)
  return { pdf, total: pdf.numPages }
}

/**
 * Ukur content text-layer satu halaman.
 * @returns {Promise<{hasText:boolean, charCount:number}>}
 */
export async function ukurTextLayer(page, { ambang = AMBANG_TEXT } = {}) {
  try {
    const content = await page.getTextContent()
    let charCount = 0
    for (const item of content.items) charCount += (item.str || '').trim().length
    return { hasText: charCount >= ambang, charCount }
  } catch {
    return { hasText: false, charCount: 0 }
  }
}

/**
 * Render satu halaman ke canvas.
 * @returns {Promise<{canvas:HTMLCanvasElement,width:number,height:number,scale:number,hasText:boolean,charCount:number}>}
 */
export async function renderHalaman(pdf, nomor, {
  canvas, dpi = DPI_AWAL, rotasi = ROTASI_AWAL, ambangText = AMBANG_TEXT, sinyal,
} = {}) {
  ensure(sinyal)
  const page = await pdf.getPage(nomor)
  const viewport = page.getViewport({ scale: dpi / 72, rotation: rotasi })
  const target = canvas || document.createElement('canvas')
  target.width = Math.floor(viewport.width)
  target.height = Math.floor(viewport.height)
  const ctx = target.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, target.width, target.height)
  await page.render({ canvasContext: ctx, viewport }).promise
  const teks = await ukurTextLayer(page, { ambang: ambangText })
  ensure(sinyal)
  return {
    canvas: target, width: target.width, height: target.height,
    scale: viewport.scale, hasText: teks.hasText, charCount: teks.charCount,
  }
}

/**
 * Render semua halaman berurutan, dengan progres + pembatalan.
 *
 * @param {ArrayBuffer} data
 * @param {object} opts
 * @param {(done:number,total:number,page:object)=>void} [opts.onProgress]
 * @param {AbortSignal} [opts.sinyal]
 * @param {(canvas:HTMLCanvasElement, hal:object)=>void} [opts.onCanvas]
 *       -called tiap halaman selesai — dipakai OCR on-the-fly supaya tidak
 *        menyimpan 21 canvas sekaligus di memori.
 * @returns {Promise<{total:number, halaman:Array, semua:{jumlah:number,adaTeks:number}}>}
 */
export async function prosesSemuaHalaman(data, {
  workerUrl, dpi = DPI_AWAL, rotasi = ROTASI_AWAL, ambangText = AMBANG_TEXT,
  onProgress, onCanvas, sinyal,
} = {}) {
  const { pdf, total } = await bukaPdf(data, { workerUrl, sinyal })
  const halaman = []
  let jumlahTeks = 0

  for (let n = 1; n <= total; n++) {
    ensure(sinyal)
    const hasil = await renderHalaman(pdf, n, { dpi, rotasi, ambangText, sinyal })
    if (hasil.hasText) jumlahTeks++
    const meta = {
      page: n, width: hasil.width, height: hasil.height,
      hasText: hasil.hasText, charCount: hasil.charCount, items: [],
    }
    if (onCanvas) await onCanvas(hasil.canvas, meta)
    halaman.push(meta)
    if (onProgress) onProgress(n, total, meta)
  }

  ensure(sinyal)
  return { total, halaman, semua: { jumlah: total, adaTeks: jumlahTeks } }
}

/** Jumlah halaman tanpa merender — untuk validasi cepat sebelum kerja berat. */
export async function cekPdf(data, { workerUrl, sinyal } = {}) {
  const { pdf, total } = await bukaPdf(data, { workerUrl, sinyal })
  return { total, pdf }
}
