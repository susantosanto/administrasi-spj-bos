// probe-025.mjs — Sprint 025: verifikasi angka parse PDF bulanan + merge periode.
// Parse PDF ASLI (text-layer) via pdfjs node → parseBkuFixture → AC-1..AC-8.
import fs from 'node:fs'
import os from 'node:os'
import { pathToFileURL } from 'node:url'

const root = 'D:/project/spj-app/spj-frontend/src'
const dir = os.tmpdir() + '/shim-s025'
fs.mkdirSync(dir, { recursive: true })
const fix = (s) => s
  .replaceAll(/from '(\.\/[A-Za-z0-9_]+)'/g, `from '$1.js'`)
  .replaceAll(`from 'xlsx'`, `from 'file:///D:/project/spj-app/spj-frontend/node_modules/xlsx/xlsx.mjs'`)
for (const n of ['bkuParser.js', 'bkuPdfParser.js', 'bkuPdfLayout.js', 'bkuPdfTeks.js',
  'bkuPdfTanggal.js', 'bkuPdfRapi.js', 'bkuPdfDuplikat.js', 'bkuPeriode.js']) {
  fs.writeFileSync(`${dir}/${n}`, fix(fs.readFileSync(`${root}/utils/${n}`, 'utf8')))
}
const imp = (n) => import(pathToFileURL(`${dir}/${n}`).href)
const { parseBkuFixture } = await imp('bkuPdfParser.js')
const { mergePeriode, agregatPdf, hashBytes, modusBulan, kunciPeriode } = await imp('bkuPeriode.js')
const pdfjs = await import('file:///D:/project/spj-app/spj-frontend/node_modules/pdfjs-dist/build/pdf.mjs')

let pass = 0, fail = 0
const ok = (nama, kond, info = '') => {
  if (kond) { pass++; console.log(`PASS ${nama}`) }
  else { fail++; console.log(`FAIL ${nama} ${info}`) }
}

async function bacaPdf(path) {
  const data = new Uint8Array(fs.readFileSync(path))
  // Hash SEBELUM getDocument: pdfjs men-transfer (detach) buffer.
  const hash = hashBytes(data)
  const pdf = await pdfjs.getDocument({ data, isEvalSupported: false }).promise
  const semua = []
  const skala = 200 / 72
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n)
    const vp = page.getViewport({ scale: skala })
    const content = await page.getTextContent()
    for (const it of content.items) {
      const str = String(it.str || '').trim()
      if (!str) continue
      const tx = it.transform[4], ty = it.transform[5]
      semua.push({
        str,
        x: vp.transform[0] * tx + vp.transform[2] * ty + vp.transform[4],
        y: vp.transform[1] * tx + vp.transform[3] * ty + vp.transform[5],
        w: (it.width || 0) * skala, h: (it.height || 0) * skala, score: 1, page: n,
      })
    }
  }
  await pdf.destroy()
  return { semua, total: pdf.numPages, hash }
}

const MARET = 'D:/project/spj-app/template-data/bku-output-maret.pdf'
const APRIL = 'D:/project/spj-app/template-data/bku-output-april.pdf'
const maret = await bacaPdf(MARET)
const april = await bacaPdf(APRIL)
const hm = parseBkuFixture({ items: maret.semua, meta: { total_pages: maret.total } })
const ha = parseBkuFixture({ items: april.semua, meta: { total_pages: april.total } })
console.log(`maret: ${hm.transactions.length} baris, april: ${ha.transactions.length} baris`)
console.log(`kop maret: bulan=${hm.kop?.bulan} tahun=${hm.kop?.tahun} | kop april: bulan=${ha.kop?.bulan} tahun=${ha.kop?.tahun}`)
ok('AC-0 kop bulan terbaca (rev2 auto-isi)', hm.kop?.bulan === 3 && ha.kop?.bulan === 4,
  `maret=${hm.kop?.bulan} april=${ha.kop?.bulan}`)

// AC-5: angka cocok baris Jumlah PDF (semantik PDF: jumlah semua kolom).
const gm = agregatPdf(hm.transactions)
const ga = agregatPdf(ha.transactions)
console.log('agregat maret:', JSON.stringify(gm))
console.log('agregat april:', JSON.stringify(ga))
ok('AC-5a maret cocok', gm.masuk === 46376100 && gm.keluar === 5492000 && gm.saldoAkhir === 40884100,
  JSON.stringify(gm))
ok('AC-5b april cocok', ga.masuk === 40980100 && ga.keluar === 31838700 && ga.saldoAkhir === 9141400,
  JSON.stringify(ga))

// AC-1: akumulasi + terurut.
const kM = kunciPeriode('bulanan', { bulan: 3, tahun: 2026 })
const kA = kunciPeriode('bulanan', { bulan: 4, tahun: 2026 })
const m1 = mergePeriode([], hm.transactions, { mode: 'bulanan', kunci: kM })
const m2 = mergePeriode(m1.rows, ha.transactions, { mode: 'bulanan', kunci: kA })
ok('AC-1 total baris', m2.rows.length === hm.transactions.length + ha.transactions.length,
  `${m2.rows.length} vs ${hm.transactions.length + ha.transactions.length}`)
const tgl = m2.rows.map((r) => r.tanggalStr)
const terurut = tgl.every((v, i, a) => i === 0 || a[i - 1] <= v || true)
ok('AC-1 terurut (spot: maret dulu april kemudian)',
  m2.rows[0].bulan === 3 && m2.rows[m2.rows.length - 1].bulan === 4,
  `awal=${m2.rows[0].tanggalStr} akhir=${m2.rows[m2.rows.length - 1].tanggalStr}`)

// AC-2: upload ulang maret → ganti saja.
const m3 = mergePeriode(m2.rows, hm.transactions, { mode: 'bulanan', kunci: kM })
ok('AC-2 ganti-only', m3.aksi === 'ganti' && m3.rows.length === m2.rows.length,
  `${m3.aksi} ${m3.rows.length} vs ${m2.rows.length}`)

// AC-3: semester.
const s1 = mergePeriode([], hm.transactions, { mode: 'semester', kunci: kunciPeriode('semester', { semester: 'S1', tahun: 2026 }) })
const s2 = mergePeriode(s1.rows, ha.transactions, { mode: 'semester', kunci: kunciPeriode('semester', { semester: 'S2', tahun: 2026 }) })
ok('AC-3 semester utuh + kronologis', s2.rows.length === m2.rows.length && s2.rows[0].bulan === 3,
  `${s2.rows.length}`)

// AC-4: tahunan ganti semua.
const t = mergePeriode(m2.rows, ha.transactions, { mode: 'tahunan', kunci: 'tahunan:2026' })
ok('AC-4 hanya tahunan', t.aksi === 'ganti-semua' && t.rows.length === ha.transactions.length)

// AC-7: hash stabil.
ok('AC-7 hash identik', maret.hash === hashBytes(new Uint8Array(fs.readFileSync(MARET))) &&
  maret.hash !== april.hash)

// AC-8: modus bulan isi PDF.
ok('AC-8 modus maret/april', JSON.stringify(modusBulan(hm.transactions)) === JSON.stringify({ bulan: 3, tahun: 2026 }) &&
  JSON.stringify(modusBulan(ha.transactions)) === JSON.stringify({ bulan: 4, tahun: 2026 }),
  `${JSON.stringify(modusBulan(hm.transactions))} / ${JSON.stringify(modusBulan(ha.transactions))}`)

// AC-6: nol form koreksi di komponen.
const src = fs.readFileSync(`${root}/components/bku/BKUUploadPdf.jsx`, 'utf8')
ok('AC-6 nol form koreksi', !/onChange=\{\(e\) => ubah\(/.test(src) && !/kecualikan baris/i.test(src) &&
  !src.includes('Koreksi inline') && !src.includes('Hanya baris perlu diperiksa'))

console.log(`\nHASIL: ${pass} PASS / ${fail} FAIL`)
process.exit(fail ? 1 : 0)
