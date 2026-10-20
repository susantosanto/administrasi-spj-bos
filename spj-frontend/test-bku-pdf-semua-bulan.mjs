/**
 * ORACLE Sprint 016 — impor PDF SEMUA bulan.
 *
 * Mensimulasikan jalur simpan `BKUUploadPdf.simpan()` TANPA browser:
 * parse fixture -> tandaiDuplikat -> buang field sementara -> redetectTypes
 * -> hitungRingkasan. Lalu memeriksa kontrak yang dijanjikan sprint.
 *
 * Jalankan dari spj-frontend:
 *   node test-bku-pdf-semua-bulan.mjs [--fixture <path>]
 *   exit 0 = semua PASS
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { redetectTypes } from './src/utils/bkuParser.js'
import { parseBkuFixture } from './src/utils/bkuPdfParser.js'
import { hitungRingkasan } from './src/utils/bkuSummary.js'
import { tandaiDuplikat, ringkasPerBulan } from './src/utils/bkuPdfDuplikat.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = join(HERE, '..')
const args = process.argv.slice(2)
const iFix = args.indexOf('--fixture')
const FIXTURE = iFix >= 0 && args[iFix + 1]
  ? args[iFix + 1]
  : join(REPO, 'scratch-pdf-check', 'fixture.json')

const FIELD_17 = ['row', 'tanggal', 'tanggalStr', 'tanggalISO', 'bulan', 'tahun',
  'kodeKegiatan', 'kodeRekening', 'noBukti', 'uraian', 'penerimaan', 'pengeluaran',
  'saldo', 'debet', 'kredit', 'tipe', 'kategori']
const SEMENTARA = ['page', 'problems', 'excluded', 'duplikat', 'urutanDuplikat']
const KUNCI_SUMMARY = ['totalTransactions', 'totalPenerimaan', 'totalPengeluaran',
  'saldoAkhir', 'isBalanced', 'months', 'totalPenerimaanSemua', 'totalPengeluaranSemua',
  'byType', 'monthlySummaries']
const fmt = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID')

let gagal = 0
const cek = (nama, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${nama}${detail ? '  ' + detail : ''}`)
  if (!ok) gagal++
}

// ── Simulasi jalur simpan komponen ────────────────────────────────────────
const fixture = JSON.parse(readFileSync(FIXTURE, 'utf8'))
const hasil = parseBkuFixture(fixture)
const mentah = hasil.transactions

const denganTanda = tandaiDuplikat(mentah.map((t) => ({
  ...t, page: t.row, problems: [], excluded: false,
})))
const transaksi = redetectTypes(denganTanda.map(({ page, problems, excluded,
  duplikat, urutanDuplikat, ...r }) => r))
const summary = hitungRingkasan(transaksi)
const perBulan = ringkasPerBulan(transaksi)

console.log('='.repeat(68))
console.log('ORACLE SPRINT 016 — impor PDF semua bulan')
console.log('='.repeat(68))
console.log('fixture :', FIXTURE.replace(REPO + '\\', ''))
console.log('baris   :', mentah.length, '-> tersimpan', transaksi.length)
console.log('bulan   :', perBulan.map((g) => `${g.namaBulan} ${g.tahun}`).join(', '))
console.log('summary : masuk', fmt(summary.totalPenerimaan), '| keluar', fmt(summary.totalPengeluaran),
  '| saldo', fmt(summary.saldoAkhir), '| balance', summary.isBalanced)
console.log()

// ── 1. Semua bulan ikut ───────────────────────────────────────────────────
const bulanPdf = [...new Set(mentah.map((t) => `${t.bulan}-${t.tahun}`))].sort()
const bulanSimpan = [...new Set(transaksi.map((t) => `${t.bulan}-${t.tahun}`))].sort()
console.log('1. SEMUA BULAN IKUT TERSIMPAN')
cek('jumlah baris tersimpan = jumlah baris PDF', transaksi.length === mentah.length,
  `${transaksi.length} vs ${mentah.length}`)
cek('jumlah kelompok bulan = jumlah kelompok di PDF',
  bulanSimpan.length === bulanPdf.length, `${bulanSimpan.length} vs ${bulanPdf.length}`)
cek('BUKAN hanya 1 bulan (regresi Sprint 015)', bulanSimpan.length > 1, `${bulanSimpan.length} bulan`)
cek('summary.months memuat semua bulan numerik',
  [...new Set(mentah.map((t) => t.bulan))].every((m) => summary.months.includes(m)),
  summary.months.join(','))

// ── 2. Kontrak 17 field ───────────────────────────────────────────────────
console.log('\n2. KONTRAK BARIS — 17 field, tanpa field sementara')
const kunciBaris = Object.keys(transaksi[0] || {})
const lebih = kunciBaris.filter((k) => !FIELD_17.includes(k))
const kurang = FIELD_17.filter((k) => !kunciBaris.includes(k))
cek('jumlah kunci = 17', kunciBaris.length === 17, String(kunciBaris.length))
cek('tidak ada field sementara tersimpan',
  !SEMENTARA.some((k) => kunciBaris.includes(k)), SEMENTARA.filter((k) => kunciBaris.includes(k)).join(',') || '')
cek('tidak ada kunci asing', lebih.length === 0, lebih.join(',') || '')
cek('tidak ada kunci hilang', kurang.length === 0, kurang.join(',') || '')
cek('semua baris punya 17 kunci',
  transaksi.every((r) => Object.keys(r).length === 17))
cek('tipe terisi (bukan null)', transaksi.every((r) => !!r.tipe),
  [...new Set(transaksi.map((r) => r.tipe))].join(','))

// ── 3. Summary 10 kunci ───────────────────────────────────────────────────
console.log('\n3. SUMMARY — 10 kunci, konsisten')
cek('10 kunci wajib ada', KUNCI_SUMMARY.every((k) => k in summary),
  KUNCI_SUMMARY.filter((k) => !(k in summary)).join(',') || '')
cek('totalTransactions = panjang transactions',
  summary.totalTransactions === transaksi.length)
cek('saldoAkhir = saldo baris terakhir',
  summary.saldoAkhir === transaksi[transaksi.length - 1].saldo, fmt(summary.saldoAkhir))
cek('Σ monthlySummaries.masuk = totalPenerimaanSemua',
  summary.monthlySummaries.reduce((s, m) => s + m.totalPenerimaan, 0) === summary.totalPenerimaanSemua)
cek('TARIK_TUNAI TIDAK masuk totalPengeluaran',
  summary.totalPengeluaran === (summary.byType.PEMBAYARAN?.totalPengeluaran || 0),
  fmt(summary.totalPengeluaran))

// ── 4. Total tahunan vs baris "Jumlah" milik PDF ──────────────────────────
console.log('\n4. TOTAL TAHUNAN vs BARIS "JUMLAH" PDF')
const jum = (hasil.dilewati || []).find((d) => d.jenis === 'baris_ringkasan_dilewati')
if (jum) {
  const M = transaksi.reduce((s, t) => s + (t.penerimaan || 0), 0)
  const K = transaksi.reduce((s, t) => s + (t.pengeluaran || 0), 0)
  cek('Σ penerimaan = baris Jumlah PDF', Math.abs(M - jum.penerimaan) <= 1,
    `${fmt(M)} vs ${fmt(jum.penerimaan)}`)
  cek('Σ pengeluaran = baris Jumlah PDF', Math.abs(K - jum.pengeluaran) <= 1,
    `${fmt(K)} vs ${fmt(jum.pengeluaran)}`)
} else {
  cek('baris ringkasan PDF ditemukan', false, 'dilewati[] kosong')
}

// ── 5. Penanda duplikat: menandai, TIDAK membuang ─────────────────────────
console.log('\n5. PENANDA DUPLIKAT — tandai, jangan buang')
cek('panjang array tidak berubah', denganTanda.length === mentah.length)
cek('semua baris punya flag duplikat', denganTanda.every((r) => typeof r.duplikat === 'boolean'))
cek('baris pertama tiap kunci = asli (duplikat false)',
  denganTanda.filter((r) => r.urutanDuplikat === 1).length ===
  new Set(denganTanda.map((r) => `${r.tanggalStr}|${r.noBukti}|${r.uraian}|${r.penerimaan}|${r.pengeluaran}`)).size)
// duplikat buatan: gandakan baris pertama
const buatan = tandaiDuplikat([...mentah.slice(0, 1), ...mentah.slice(0, 1)])
cek('duplikat buatan dikenali (2 baris, 1 ditandai)',
  buatan.length === 2 && buatan[0].duplikat === false && buatan[1].duplikat === true,
  `flags ${buatan.map((r) => r.duplikat).join(',')}`)

// ── 6. Ringkasan per bulan ────────────────────────────────────────────────
console.log('\n6. RINGKASAN PER BULAN')
cek('Σ jumlah = total baris', perBulan.reduce((s, g) => s + g.jumlah, 0) === transaksi.length)
cek('Σ masuk = totalPenerimaanSemua',
  perBulan.reduce((s, g) => s + g.masuk, 0) === summary.totalPenerimaanSemua)
cek('Σ keluar = totalPengeluaranSemua',
  perBulan.reduce((s, g) => s + g.keluar, 0) === summary.totalPengeluaranSemua)
cek('urut tahun lalu bulan',
  perBulan.every((g, i) => i === 0 ||
    perBulan[i - 1].tahun < g.tahun ||
    (perBulan[i - 1].tahun === g.tahun && perBulan[i - 1].bulan < g.bulan)))
cek('setiap grup punya namaBulan', perBulan.every((g) => !!g.namaBulan))

console.log('\n' + '='.repeat(68))
console.log(gagal === 0 ? 'HASIL: SEMUA PASS' : `HASIL: ${gagal} GAGAL`)
console.log('='.repeat(68))
process.exit(gagal === 0 ? 0 : 1)
