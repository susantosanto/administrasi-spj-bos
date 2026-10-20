/**
 * ORACLE — jalur TEKS ASLI (native text-layer) dari PDF hasil UNDUH ARKAS.
 *
 * Memakai fungsi ASLI `bacaTeksHalaman` (bkuPdfPages.js) + `parseBkuFixture`
 * (bkuPdfParser.js), bukan salinan. Sumber: template-data/bku-output.pdf —
 * PDF ber-text-layer (bukan scan), jadi tidak lewat OCR.
 *
 * Yang dikunci:
 *  - jumlah baris & total mentah SAMA dengan jalur OCR (tidak ada baris hilang)
 *  - tidak ada kode bukti yang bocor ke uraian
 *  - semua PEMBAYARAN punya noBukti
 *  - uraian terbaca UTUH (contoh BNU07/BNU08)
 *
 * Jalankan dari spj-frontend:
 *   node test-bku-pdf-native.mjs        -> exit 0 = semua PASS
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { parseBkuFixture } from './src/utils/bkuPdfParser.js'
import { bacaTeksHalaman } from './src/utils/bkuPdfPages.js'
import { hitungRingkasan } from './src/utils/bkuSummary.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const PDF = join(HERE, '..', 'template-data', 'bku-output.pdf')
const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

const data = new Uint8Array(readFileSync(PDF))
const doc = await getDocument({ data, useSystemFonts: true }).promise
const items = []
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p)
  items.push(...(await bacaTeksHalaman(page, p, { dpi: 200 })))
}
await doc.destroy()

const { transactions: tx, kop } = parseBkuFixture({ items })
const s = hitungRingkasan(tx)
const keluarMentah = tx.reduce((a, t) => a + t.pengeluaran, 0)
const masukMentah = tx.reduce((a, t) => a + t.penerimaan, 0)

let gagal = 0
const cek = (nama, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${nama}${detail ? '  ' + detail : ''}`)
  if (!ok) gagal++
}

console.log('='.repeat(66))
console.log('NATIVE TEXT-LAYER — ' + tx.length + ' baris | kop: ' + kop.namaSekolah + ' / ' + kop.npsn)
console.log('='.repeat(66))
console.log(`  masuk ${fmt(masukMentah)} | keluar ${fmt(keluarMentah)} | saldo ${fmt(s.saldoAkhir)}`)
cek('jumlah baris = 420', tx.length === 420, String(tx.length))
cek('Σ penerimaan = Rp 182.305.000', masukMentah === 182305000, fmt(masukMentah))
cek('Σ pengeluaran = Rp 149.582.000', keluarMentah === 149582000, fmt(keluarMentah))
cek('saldoAkhir = Rp 32.723.000', s.saldoAkhir === 32723000, fmt(s.saldoAkhir))
cek('kop: nama sekolah terbaca', kop.namaSekolah === 'SD NEGERI PASIRHALANG', kop.namaSekolah)
cek('kop: NPSN terbaca', kop.npsn === '20205293', kop.npsn)
cek('kop: tahun terbaca', kop.tahun === '2026', kop.tahun)

const pol = tx.filter((t) => /(^|\s)[A-Z]{2,4}\d{1,3}(\s|$)/.test(t.uraian))
const kosong = tx.filter((t) => t.tipe === 'PEMBAYARAN' && !t.noBukti)
cek('tidak ada kode bukti bocor ke uraian', pol.length === 0, pol.length ? pol.length + ' baris' : '')
cek('semua PEMBAYARAN punya noBukti', kosong.length === 0, kosong.length ? kosong.length + ' baris' : '')

const b7 = tx.find((t) => t.noBukti === 'BNU07')
const b8 = tx.find((t) => t.noBukti === 'BNU08')
cek('BNU07 uraian utuh', b7 && /Pendaftaran Lomba-lomba Akademik/.test(b7.uraian), b7 ? b7.uraian : '(tidak ada)')
cek('BNU08 uraian utuh', b8 && /Pendaftaran Lomba-lomba FTBI/.test(b8.uraian), b8 ? b8.uraian : '(tidak ada)')

const aug = tx.filter((t) => t.bulan === 8)
const augMasuk = aug.reduce((a, t) => a + t.penerimaan, 0)
cek('Agustus masuk = Rp 82.721.000 (BOSP 82.560.000 + PPh 161.000)', augMasuk === 82721000, fmt(augMasuk))

console.log('\n' + '='.repeat(66))
console.log(gagal === 0 ? 'HASIL: SEMUA PASS' : `HASIL: ${gagal} GAGAL`)
console.log('='.repeat(66))
process.exit(gagal === 0 ? 0 : 1)
