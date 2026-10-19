/**
 * Smoke test engine OCR (BUKAN A/B).
 * Satu engine saja: tesseract.js 7.0.0. Tidak ada perbandingan engine —
 * A/B dilewati atas keputusan user (lihat DECISIONS.MD bagian Q).
 *
 * Fungsi: mengunci risiko bahwa engine browser jauh lebih buruk dari RapidOCR
 * yang dipakai membangkitkan fixture. Kalau angka di sini jauh lebih buruk,
 * A/B perlu dibuka kembali.
 *
 * Cara jalan: halaman 1 sudah di-render ke PNG (rotasi 90, 200 DPI) oleh
 * gen_fixture_rest.py, lalu di-OCR dari file PNG.
 *
 *   node test-bku-ocr-smoke.mjs
 */
import { createWorker } from 'tesseract.js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
// Aset lokal (public/tesseract) — TIDAK boleh unduh dari CDN: aturan proyek
// "tidak ada file yang dikirim ke layanan mana pun" +资产 unduh CDN juga
// menulis traineddata ke folder kerja (sampah).
const ASET = join(HERE, 'public', 'tesseract')

const GAMBAR = process.argv[2] || '../scratch-pdf-check/fx-p1.png'
const FIXTURE = '../scratch-pdf-check/fixture.json'
const HALAMAN = 1

const RE_NOMINAL = /^[0-9]{1,3}(?:\.[0-9]{3}){1,2}$/

let img
try {
  img = readFileSync(GAMBAR)
} catch {
  console.error('Gambar tidak ditemukan: ' + GAMBAR)
  console.error('Buat dulu: python scratch-pdf-check/gen_fixture_rest.py --limit 1 --fx-png')
  process.exit(2)
}

console.log('=== SMOKE TEST OCR — tesseract.js 7.0.0 (bukan A/B) ===')
console.log('gambar  :', GAMBAR)

const t0 = Date.now()
// Worker: default Node dari paket tesseract.js (worker browser tak jalan di
// Node). Core + data bahasa: LOKAL (public/tesseract) — tanpa unduh CDN
// (aturan proyek: tidak ada file yang dikirim ke layanan mana pun).
const worker = await createWorker('ind', 1, {
  corePath: join(ASET, 'tesseract-core-simd-lstm.wasm.js'),
  langPath: join(ASET, 'lang'),
  gzip: false,
  cacheMethod: 'none',
})
console.log('worker  : siap dalam', ((Date.now() - t0) / 1000).toFixed(1) + 's')

const t1 = Date.now()
const { data } = await worker.recognize(img)
const detik = (Date.now() - t1) / 1000
await worker.terminate()
console.log('OCR     :', detik.toFixed(1) + 's | confidence',
  (data.confidence ?? 0).toFixed(1))

const teks = (data.text || '').replace(/\s+/g, ' ').trim()
console.log('karakter:', teks.length)
console.log('')
console.log('--- 600 karakter pertama ---')
console.log(teks.slice(0, 600))
console.log('')

// --- bandingkan token angka dengan RapidOCR pada halaman yang sama ---
const fx = JSON.parse(readFileSync(FIXTURE, 'utf8'))
const rapid = new Set(
  fx.items.filter((i) => i.page === HALAMAN && RE_NOMINAL.test(i.str.trim()))
    .map((i) => i.str.trim())
)
const tess = new Set(teks.match(/[0-9]{1,3}(?:\.[0-9]{3}){1,2}/g) || [])
let cocok = 0
for (const n of tess) if (rapid.has(n)) cocok++

console.log('--- token angka rupiah (halaman ' + HALAMAN + ') ---')
console.log('RapidOCR (fixture):', rapid.size)
console.log('tesseract.js      :', tess.size)
console.log('cocok             :', cocok,
  tess.size ? '(' + Math.round((cocok / tess.size) * 100) + '%)' : '')
console.log('')

// Pagar risiko: tesseract harus menemukan minimal 80% token angka RapidOCR.
const recall = rapid.size ? Math.round((cocok / rapid.size) * 100) : 0
console.log('recall angka (tesseratch vs RapidOCR):', recall + '%',
  recall >= 80 ? '  AMAN (>=80%)' : '  BAHAYA (<80%) -> buka lagi A/B')
process.exit(recall >= 80 ? 0 : 1)