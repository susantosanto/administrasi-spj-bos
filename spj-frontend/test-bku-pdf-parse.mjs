/**
 * ORACLE Sprint 015 — Import BKU PDF.
 *
 * Sumber kebenaran (golden): file Excel hasil export ARKAS.
 * Yang dibandingkan: hasil parse PDF (modul src/utils/bkuPdfParser.js).
 *
 * Jalankan dari folder spj-frontend:
 *   node test-bku-pdf-parse.mjs              -> target Jan dari Excel
 *   node test-bku-pdf-parse.mjs --pdf        -> bandingkan PDF vs Excel
 *   node test-bku-pdf-parse.mjs --reconcile  -> saldo awal + masuk - keluar = saldo akhir
 *   node test-bku-pdf-parse.mjs --pdf --all-months
 *
 * Peta kolom WAJIB sama dengan bkuParser.js DATA_COLUMNS (:39-48).
 * Dilarang menebak indeks - tebakan menghasilkan angka 0/0/0 yang palsu.
 */
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
// xlsx 0.18.5 = CJS; di ESM API readFile/SSF hanya ada pada `default`.
import XLSX from 'xlsx'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const FIXTURE = join(REPO, 'scratch-pdf-check', 'fixture.json')
const XLSX_FILE = join(
  REPO, 'template-data',
  'Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx'
)

// ── Peta kolom (HARUS identik bkuParser.js) ────────────────────────────────
const C = {
  TANGGAL: 0, KODE_KEGIATAN: 3, KODE_REKENING: 5, NO_BUKTI: 8,
  URAIAN: 10, PENERIMAAN: 13, PENGELUARAN: 16, SALDO: 19,
}
const HEADER_LABEL_ROW = 14
const DATA_START_ROW = 15

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

const args = process.argv.slice(2)
const wantPdf = args.includes('--pdf')
const wantReconcile = args.includes('--reconcile')
const wantAllMonths = args.includes('--all-months')
// Fixture opsional — untuk mengukur engine OCR yang BENAR-BENAR dipakai
// aplikasi (tesseract.js), bukan hanya fixture RapidOCR yang dipakai
// untuk membangun parser. Default tetap fixture RapidOCR.
const iFix = args.indexOf('--fixture')
const FIXTURE_PATH = iFix >= 0 && args[iFix + 1] ? args[iFix + 1] : FIXTURE

const fmt = (n) => 'Rp ' + Math.round(n).toLocaleString('id-ID')

// ── Pembaca Excel (implementasi mandiri = oracle yang benar-benar independen) ─
function parseTanggal(val) {
  if (val == null || val === '') return null
  if (val instanceof Date) {
    return { day: val.getDate(), month: val.getMonth() + 1, year: val.getFullYear() }
  }
  if (typeof val === 'string') {
    const p = val.trim().split('-')
    if (p.length === 3) {
      const d = +p[0], m = +p[1], y = +p[2]
      if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y > 1900) return { day: d, month: m, year: y }
    }
    return null
  }
  if (typeof val === 'number') {
    const di = XLSX.SSF.parse_date_code(val)
    if (di) return { day: di.d, month: di.m, year: di.y }
  }
  return null
}

function parseNumber(val) {
  if (val == null || val === '') return 0
  if (typeof val === 'number') return val
  const cleaned = String(val).replace(/[Rp\s]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? 0 : n
}

function bacaExcel() {
  if (!existsSync(XLSX_FILE)) throw new Error('Excel baseline tidak ditemukan: ' + XLSX_FILE)
  const wb = XLSX.readFile(XLSX_FILE, { cellDates: false })
  const name = ['Page1', 'BKU', 'Sheet1', 'Data'].find((s) => wb.SheetNames.includes(s))
    ?? wb.SheetNames[0]
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: null })

  const tx = []
  for (let i = DATA_START_ROW; i < rows.length; i++) {
    const r = rows[i]
    if (!r) continue
    const raw = r[C.TANGGAL]
    if (raw == null || raw === '') continue
    // lewati judul seksi BKU-ALL
    if (typeof raw === 'string' && raw.includes('BKU-ALL')) continue
    // lewati baris separator angka (1,2,3,...) pada header tabel
    if (String(raw).trim() === '1') {
      const c2 = r[C.KODE_KEGIATAN]
      if (c2 == null || String(c2).trim() === '' || String(c2).trim() === '2') continue
    }
    const tgl = parseTanggal(raw)
    if (!tgl) continue
    tx.push({
      baris: i + 1,
      tanggal: tgl,
      bulan: tgl.month,
      tahun: tgl.year,
      kodeKegiatan: r[C.KODE_KEGIATAN] != null ? String(r[C.KODE_KEGIATAN]).trim() : '',
      kodeRekening: r[C.KODE_REKENING] != null ? String(r[C.KODE_REKENING]).trim() : '',
      noBukti: r[C.NO_BUKTI] != null ? String(r[C.NO_BUKTI]).trim() : '',
      uraian: r[C.URAIAN] != null ? String(r[C.URAIAN]).trim() : '',
      penerimaan: parseNumber(r[C.PENERIMAAN]),
      pengeluaran: parseNumber(r[C.PENGELUARAN]),
      saldo: parseNumber(r[C.SALDO]),
    })
  }
  return { sheet: name, transaksi: tx }
}

function ringkas(tx, bulan, tahun) {
  const f = tx.filter((t) => (bulan == null || t.bulan === bulan) && (tahun == null || t.tahun === tahun))
  const masuk = f.reduce((a, t) => a + t.penerimaan, 0)
  const keluar = f.reduce((a, t) => a + t.pengeluaran, 0)
  const saldoAkhir = f.length ? f[f.length - 1].saldo : 0
  return { jumlah: f.length, masuk, keluar, saldoAkhir, baris: f }
}

function reconcile(baris) {
  if (!baris.length) return { ok: false, mismatches: [{ alasan: 'tidak ada baris' }] }
  const awal = baris[0].saldo - baris[0].penerimaan + baris[0].pengeluaran
  const masuk = baris.reduce((a, t) => a + t.penerimaan, 0)
  const keluar = baris.reduce((a, t) => a + t.pengeluaran, 0)
  const akhir = baris[baris.length - 1].saldo
  const mismatches = []
  if (Math.abs(awal + masuk - keluar - akhir) > 0.5) {
    mismatches.push({
      alasan: 'saldo tidak runtun',
      cek: `${fmt(awal)} + ${fmt(masuk)} - ${fmt(keluar)}`,
      hasil: fmt(awal + masuk - keluar),
      expected: fmt(akhir),
    })
  }
  for (let i = 1; i < baris.length; i++) {
    const prev = baris[i - 1], cur = baris[i]
    const harus = prev.saldo + cur.penerimaan - cur.pengeluaran
    if (Math.abs(harus - cur.saldo) > 0.5) {
      mismatches.push({
        baris: i + 1, alasan: 'saldo tidak runtun antar-baris',
        harus: fmt(harus), dapat: fmt(cur.saldo),
      })
    }
  }
  return { ok: mismatches.length === 0, mismatches, saldoAwal: awal, masuk, keluar, saldoAkhir: akhir }
}

// ── Hasil parse PDF (dimuat hanya bila --pdf) ──────────────────────────────
async function bacaPdf() {
  const mod = await import('./src/utils/bkuPdfParser.js')
  if (!existsSync(FIXTURE_PATH)) throw new Error('fixture tidak ditemukan: ' + FIXTURE_PATH)
  const fixture = JSON.parse(readFileSync(FIXTURE_PATH, 'utf8'))
  const out = mod.parseBkuFixture(fixture)
  return { ...out, fixtureMeta: fixture.meta }
}

// ── Main ───────────────────────────────────────────────────────────────────
const excel = bacaExcel()
const jan = ringkas(excel.transaksi, 1, 2026)

console.log('='.repeat(64))
console.log('ORACLE SPRINT 015 — target dari Excel')
console.log('='.repeat(64))
console.log('file  :', XLSX_FILE.replace(REPO + '\\', ''))
console.log('sheet :', excel.sheet, '| baris transaksi 2026 =',
  excel.transaksi.filter((t) => t.tahun === 2026).length)
console.log()
console.log('--- TARGET JANUARI 2026 (golden) ---')
console.log('jumlah  :', jan.jumlah)
console.log('masuk   :', jan.masuk.toLocaleString('id-ID'))
console.log('keluar  :', jan.keluar.toLocaleString('id-ID'))
console.log('saldo   :', jan.saldoAkhir.toLocaleString('id-ID'))
console.log()

if (wantReconcile) {
  const rc = reconcile(jan.baris)
  console.log('--- RECONCILE JANUARI (Excel) ---')
  console.log('saldo awal :', fmt(rc.saldoAwal))
  console.log('masuk      :', fmt(rc.masuk))
  console.log('keluar     :', fmt(rc.keluar))
  console.log('saldo akhir:', fmt(rc.saldoAkhir))
  console.log('ok         :', rc.ok)
  if (!rc.ok) {
    console.log('mismatches :')
    for (const m of rc.mismatches) console.log('  -', JSON.stringify(m))
  }
  console.log()
}

if (!wantPdf) {
  process.exit(0)
}

let pdf
try {
  pdf = await bacaPdf()
} catch (e) {
  console.error('GAGAL parse PDF:', e.message)
  process.exit(1)
}

const bulanList = wantAllMonths ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] : [1]
const bulanBeda = []
let annualOk = true

console.log('--- BANDINGAN PDF vs EXCEL ---')
for (const bl of bulanList) {
  const p = ringkas(pdf.transactions, bl, 2026)
  const e = ringkas(excel.transaksi, bl, 2026)
  if (!e.jumlah) {
    // Baseline Excel hanya Jan–Jun 2026. Bulan lain TIDAK punya pembanding —
    // mencetak "selisih vs 0" akan menyesatkan (terlihat seperti error).
    console.log(`${MONTH_NAMES[bl - 1].padEnd(10)} N/A - tidak ada pembanding Excel` +
      (p.jumlah ? ` (PDF: n=${p.jumlah})` : ''))
    continue
  }
  const dJ = p.jumlah - e.jumlah
  const dM = p.masuk - e.masuk
  const dK = p.keluar - e.keluar
  const dS = p.saldoAkhir - e.saldoAkhir
  const tanda = (n) => (n === 0 ? 'OK ' : '!= ')
  console.log(`${MONTH_NAMES[bl - 1].padEnd(10)} ` +
    `jumlah ${tanda(dJ)}${dJ} | masuk ${tanda(dM)}${fmt(dM)} | ` +
    `keluar ${tanda(dK)}${fmt(dK)} | saldo ${tanda(dS)}${fmt(dS)}`)
  if (dJ || dM || dK || dS) bulanBeda.push(MONTH_NAMES[bl - 1])
  if (bl === 1) {
    console.log(`             excel: n=${e.jumlah} masuk=${fmt(e.masuk)} keluar=${fmt(e.keluar)} saldo=${fmt(e.saldoAkhir)}`)
    console.log(`             pdf  : n=${p.jumlah} masuk=${fmt(p.masuk)} keluar=${fmt(p.keluar)} saldo=${fmt(p.saldoAkhir)}`)
  }
}

// ── Total tahunan vs baris "Jumlah" milik PDF sendiri ─────────────────────
// Baris total sengaja dilewati parser (bukan transaksi) dan dikembalikan di
// `dilewati`. Nilainya = self-check dokumen, bukan angka hafalan: kalau
// parser menghilangkan/menggandakan baris, total tidak akan cocok.
const jum = (pdf.dilewati || []).find((d) => d.jenis === 'baris_ringkasan_dilewati')
if (jum) {
  const M = pdf.transactions.reduce((a, t) => a + t.penerimaan, 0)
  const K = pdf.transactions.reduce((a, t) => a + t.pengeluaran, 0)
  const okM = Math.abs(M - jum.penerimaan) <= 1
  const okK = Math.abs(K - jum.pengeluaran) <= 1
  annualOk = okM && okK
  console.log()
  console.log('--- TOTAL TAHUNAN vs BARIS "JUMLAH" PDF ---')
  console.log(`masuk : ${fmt(M)} vs ${fmt(jum.penerimaan)}  ${okM ? 'OK' : 'BEDA'}`)
  console.log(`keluar: ${fmt(K)} vs ${fmt(jum.pengeluaran)}  ${okK ? 'OK' : 'BEDA'}`)
}

console.log()
const janP = ringkas(pdf.transactions, 1, 2026)
const selisih = {
  jumlah: janP.jumlah - jan.jumlah,
  masuk: janP.masuk - jan.masuk,
  keluar: janP.keluar - jan.keluar,
  saldo: janP.saldoAkhir - jan.saldoAkhir,
}
console.log('--- SELISIH JANUARI (PDF - Excel) ---')
for (const [k, v] of Object.entries(selisih)) console.log(`  ${k.padEnd(6)}: ${v}`)

// Akurasi uraian: normalisasi lalu bandingkan per baris urut
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const hitungUraian = () => {
  const e = jan.baris
  const p = janP.baris
  const n = Math.min(e.length, p.length)
  if (!n) return { pct: 0, total: 0, cocok: 0, rincian: [] }
  let cocok = 0
  const rincian = []
  for (let i = 0; i < n; i++) {
    const a = norm(e[i].uraian), b = norm(p[i].uraian)
    const okc = a === b
    if (okc) cocok++
    rincian.push({ i, excel: e[i].uraian, pdf: p[i].uraian, ok: okc })
  }
  return { pct: Math.round((cocok / n) * 1000) / 10, total: n, cocok, rincian }
}
const ak = hitungUraian()
console.log()
console.log('--- AKURASI URAIAN JANUARI ---')
console.log(`akurasi uraian: ${ak.pct}%  (${ak.cocok}/${ak.total})  target >= 90%  ${ak.pct >= 90 ? 'OK' : 'DI BAWAH TARGET'}`)
for (const r of ak.rincian.filter((x) => !x.ok)) {
  console.log(`   #${r.i + 1} excel="${r.excel}"  pdf="${r.pdf}"`)
}

console.log()
console.log('problems dari parser:', (pdf.problems || []).length)
for (const p of (pdf.problems || []).slice(0, 12)) console.log('   -', JSON.stringify(p))

const semuaNol = Object.values(selisih).every((v) => v === 0)
console.log()
console.log(semuaNol ? 'HASIL: 0 selisih' : 'HASIL: ada selisih')
if (wantAllMonths) {
  console.log(bulanBeda.length
    ? `SEMUA BULAN: BEDA di ${bulanBeda.join(', ')}`
    : 'SEMUA BULAN: 0 selisih (Jan–Jun)')
  console.log(annualOk ? 'TOTAL TAHUNAN: cocok' : 'TOTAL TAHUNAN: BEDA')
}
process.exit(semuaNol && bulanBeda.length === 0 && annualOk ? 0 : 2)