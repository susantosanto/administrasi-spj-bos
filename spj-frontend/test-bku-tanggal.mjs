/**
 * Uji token tanggal dari OCR — kasus nyata hasil tesseract.js pada PDF
 * contoh BKU (bukti: dump token halaman 1).
 *
 *   node test-bku-tanggal.mjs
 */
import { bacaTanggal, tanggalPemisah, tanggalPolos } from './src/utils/bkuPdfTanggal.js'

// Token yang BENAR-BENAR dihasilkan tesseract.js (halaman 1, DPI 200).
const DARI_OCR = [
  // token,            tanggal diharapkan,      pasti
  ['01-01-2026',      { d: 1, m: 1, y: 2026 },  true],
  ['20-01-2026)',     { d: 20, m: 1, y: 2026 }, true],
  ['31-01-2026)',     { d: 31, m: 1, y: 2026 }, true],
  ['08-02-2026',      { d: 8, m: 2, y: 2026 },  true],
  ['01012026)',       { d: 1, m: 1, y: 2026 },  false],
  ['31012026)',       { d: 31, m: 1, y: 2026 }, false],
  ['3012026)',        { d: 30, m: 1, y: 2026 }, false],
  // TIDAK boleh dianggap tanggal:
  ['07.12.01.',       null,                     null],
  ['5.1.02.02.01.00', null,                     null],
  ['20205293',        null,                     null],  // NPSN
  ['82560000',        null,                     null],  // nominal
  ['2026',            null,                     null],  // tahun
  ['BBU01',           null,                     null],
]

let lulus = 0, gagal = 0
for (const [token, harap, pasti] of DARI_OCR) {
  const h = bacaTanggal(token)
  const dapat = h ? { d: h.day, m: h.month, y: h.year } : null
  const sama = JSON.stringify(dapat) === JSON.stringify(harap)
  const samaPasti = harap === null ? true : h.pasti === pasti
  if (sama && samaPasti) {
    lulus++
    console.log(`  OK   "${token}" -> ${dapat ? `${dapat.d}-${dapat.m}-${dapat.y}` : '(bukan tanggal)'} pasti=${h ? h.pasti : '-'}`)
  } else {
    gagal++
    console.log(`  GAGAL "${token}" -> dapat ${JSON.stringify(dapat)} pasti=${h ? h.pasti : '-'} | harap ${JSON.stringify(harap)} pasti=${pasti}`)
  }
}

console.log('')
console.log('bentuk berpemisah :', tanggalPemisah('20-01-2026)') ? 'ok' : 'GAGAL')
console.log('bentuk polos       :', tanggalPolos('01012026)') ? 'ok' : 'GAGAL')
console.log('')
console.log(`HASIL: ${lulus} lulus / ${gagal} gagal`)
process.exit(gagal ? 1 : 0)
