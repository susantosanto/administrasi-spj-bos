/**
 * bkuPdfOcr.js — Sprint 015 · M2 Adapter OCR (≤200 baris)
 *
 * Satu-satunya jalan dari canvas -> item OCR. Konsumen (UI) tidak boleh tahu
 * engine apa yang dipakai di belakang; cukup panggil ocrPage().
 *
 * ENGINE: tesseract.js 7.0.0 (pin eksak). A/B dihitung tidak dilakukan atas
 * keputusan user — lihat DECISIONS.MD bagian Q.
 *
 * ── OFFLINE ────────────────────────────────────────────────────────────────
 * Default tesseract.js mengunduh worker + wasm + traineddata dari CDN. Itu
 * melanggar aturan proyek ("tidak ada file yang dikirim ke layanan mana pun"),
 * jadi SEMUA aset dilayani dari origin sendiri (public/tesseract/).
 * Jalur aset di-set lewat KONFIG_ASET, bukan URL pihak ketiga.
 */
import { createWorker } from 'tesseract.js'
import { renderHalaman } from './bkuPdfPages.js'
import { bersihkanGaris } from './bkuPdfBersih.js'

export const KONFIG_ASET = {
  workerPath: '/tesseract/worker.min.js',
  // Ditunjuk ke file TEPAT, bukan direktori: kalau hanya direktori, tesseract
  // memilih varian core sendiri sesuai dukungan CPU (relaxedsimd/simd/plain)
  // dan akan meminta file yang tidak kita vendor. Dengan pin ke satu file,
  // hanya 1 varian (~6,5 MB) yang perlu ikut repo.
  corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
  langPath: '/tesseract/lang',
  // Data bahasa diambil sebagai "ind.traineddata" (TANPA ekstensi .gz).
  //
  // Alasan: ekstensi .gz di-intercept extension browser. IDM "Advanced
  // Integration" (terbukti di Edge profil sekolah) membalas 204 + body
  // KOSONG untuk /tesseract/lang/ind.traineddata.gz. tesseract menulis
  // body kosong itu ke ./ind.traineddata di WASM FS, lalu gagal dengan
  // "Error opening data file ./ind.traineddata" — pesan teknis yang tidak
  // bisa ditindaklanjuti user.
  //
  // Isi file tetap gzip: tesseract.js mendeteksi magic number 1F 8B sendiri
  // lalu decompress (worker-script/index.js:161-166), jadi nama file tidak
  // perlu ekstensi .gz.
  gzip: false,
  // Cache IndexedDB dimatikan. Respons 204 lolos diam-diam (resp.ok = true
  // untuk 2xx) dan tesseract meng-cache body kosong; cache itu lalu dipakai
  // selamanya sehingga perbaikan aset tidak pernah terasa.
  cacheMethod: 'none',
}

/**
 * Batas minimum confidence sebuah token agar dipakai parser.
 *
 * 0 = semua token dipakai. Confidence dari Tesseract tidak selalu
 * mencerminkan kualitas bacaan: pada file BKU yang halamannya diputar 90
 * derajat, 3 nilai SALDO terbaca BENAR ("82.560.000") tetapi confidence-nya
 * 0.0 / 0.0 / 13.0 — ambang 30 membuangnya dan saldo baris jadi 0.
 * Bukti: oracle "saldo OK" (0 selisih) dgn ambang 0, "saldo !=
 * Rp -82.560.000" dgn ambang 30. Noise tidak merajal: garis tabel sudah
 * dihapus dari gambar sebelum OCR (bkuPdfBersih.js).
 */
export const MIN_CONFIDENCE = 0

let workerPromise = null

/**
 * Buat (atau pakai ulang) worker OCR.
 * Memakai lazy singleton supaya model tidak diunduh ulang tiap halaman.
 */
export function ambilWorker({ bahasa = 'ind', logger, config } = {}) {
  if (!workerPromise) {
    // logger hanya boleh function; tesseract memanggilnya tanpa cek tipe.
    const opsi = {
      workerPath: KONFIG_ASET.workerPath,
      corePath: KONFIG_ASET.corePath,
      langPath: KONFIG_ASET.langPath,
      gzip: KONFIG_ASET.gzip,
      cacheMethod: KONFIG_ASET.cacheMethod,
      ...(config || {}),
    }
    if (typeof logger === 'function') opsi.logger = logger
    workerPromise = createWorker(bahasa, 1, opsi).catch((e) => {
      workerPromise = null // biar percobaan berikutnya bisa mengulang
      throw e
    })
  }
  return workerPromise
}

/** Tutup worker (dipanggil saat pengguna selesai / komponen dilepas). */
export async function lepasWorker() {
  if (!workerPromise) return
  const w = await workerPromise.catch(() => null)
  workerPromise = null
  if (w) await w.terminate()
}

/** Ubah struktur blocks tesseract -> item seragam untuk bkuPdfLayout. */
export function itemsDariBlocks(blocks, page, minConf = MIN_CONFIDENCE) {
  const items = []
  // Turun sampai leaves: blocks -> paragraphs -> lines -> words.
  // Mengambil leaf (kata), bukan blok halaman: kalau blok ikut terambil,
  // seluruh halaman jadi 1 item dan parser tidak menemukan kolom sama sekali.
  const jelajah = (daftar) => {
    for (const n of daftar || []) {
      if (n.paragraphs) jelajah(n.paragraphs)
      else if (n.lines) jelajah(n.lines)
      else if (n.words && n.words.length) jelajah(n.words)
      else if (n.bbox && n.text != null) {
        const t = String(n.text).trim()
        if (!t) continue
        const c = n.confidence == null ? 100 : n.confidence
        if (c < minConf) continue
        const x0 = n.bbox.x0, y0 = n.bbox.y0
        items.push({
          str: t,
          x: x0, y: y0,
          w: n.bbox.x1 - x0, h: n.bbox.y1 - y0,
          score: Math.round(c) / 100,
          page,
        })
      }
    }
  }
  jelajah(blocks)
  // Urut stabil (page, y, x) supaya diff fixture tidak berantakan.
  items.sort((a, b) => a.y - b.y || a.x - b.x)
  return items
}

/**
 * OCR satu halaman dari <canvas>.
 *
 * Gambar dibersihkan dari garis tabel dulu (bkuPdfBersih.js) — tanpa itu
 * tesseract membaca garis sbg "|" dan menggabungkan isi 2 sel.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{page?:number, worker?:object, config?:object, logger?:Function, minConf?:number, bersih?:boolean}} opts
 * @returns {Promise<Array>} item {str,x,y,w,h,score,page}
 */
export async function ocrPage(canvas, {
  page = 1, worker, config, logger, minConf, bersih = true,
} = {}) {
  if (bersih) bersihkanGaris(canvas)
  const w = worker || (await ambilWorker({ logger, config }))
  const { data } = await w.recognize(canvas, {}, { blocks: true, text: false })
  return itemsDariBlocks(data.blocks, page, minConf ?? MIN_CONFIDENCE)
}

/**
 * Deteksi orientasi isi halaman — WAJIB, bukan rotasi hardcode.
 *
 * BKU dari RKAS bisa tercetak TEGAK (halaman landscape) atau MENYAMPING
 * (isi tabel diputar 90° di halaman portrait). Bukti terukur 2026-10-19:
 *   "BKU tahunan.pdf"  : 842x595 (landscape) -> rotasi 0, conf-rata 62.6
 *   "contoh format..." : 595x842 (portrait)  -> rotasi 90, conf-rata 64.8
 * Rotasi salah membuat SEMUA karakter terbaca miring (conf ~29) dan hasil
 * parse 0 transaksi. Cara: OCR halaman 1 pada rotasi 0 & 90, ambil yang
 * confidence rata-ratineya lebih tinggi (beda > 30 poin pada kedua file).
 * Item halaman 1 dipakai ulang supaya tidak di-OCR dua kali.
 *
 * @returns {Promise<{rotasi:number, skor:number, items:Array}>}
 */
export async function deteksiOrientasiHalaman(pdf, { dpi = 200, sinyal } = {}) {
  let terbaik = null
  for (const rotasi of [0, 90]) {
    const { canvas } = await renderHalaman(pdf, 1, { dpi, rotasi, sinyal })
    // minConf 0: menilai SEMUA token — token sampah itulah yang membedakan
    // halaman miring.
    const items = await ocrPage(canvas, { page: 1, minConf: 0 })
    const skor = items.length
      ? items.reduce((a, it) => a + (it.score || 0), 0) / items.length
      : 0
    if (!terbaik || skor > terbaik.skor) terbaik = { rotasi, skor, items }
  }
  return terbaik || { rotasi: 0, skor: 0, items: [] }
}

/**
 * OCR banyak halaman berurutan dengan progres + pembatalan.
 *
 * @param {(nomor:number)=>HTMLCanvasElement} dapatCanvas
 * @param {object} opts { total, onProgress, sinyal, config, logger }
 * @returns {Promise<{items:Array, jumlah:number}>}
 */
export async function ocrHalaman(dapatCanvas, {
  total, onProgress, sinyal, config, logger,
} = {}) {
  const worker = await ambilWorker({ logger, config })
  const items = []
  for (let n = 1; n <= total; n++) {
    if (sinyal && sinyal.aborted) break
    const canvas = dapatCanvas(n)
    if (!canvas) continue
    const hasil = await ocrPage(canvas, { page: n, worker })
    items.push(...hasil)
    if (onProgress) onProgress(n, total, hasil.length)
  }
  return { items, jumlah: items.length }
}

export default { ambilWorker, lepasWorker, ocrPage, ocrHalaman, itemsDariBlocks, KONFIG_ASET }