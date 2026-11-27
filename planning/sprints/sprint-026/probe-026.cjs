// probe-026.mjs — Sprint 026 T-4: upload rusak, Stop bersih, pesan gagal (Playwright).
// Dijalankan: node planning/sprints/sprint-026/probe-026.mjs (dev server :5173 hidup)
const { chromium } = require('playwright')
const fs = require('node:fs')
const RUSAK = 'D:/project/scratch-pw/fixture-026-rusak.bin'
fs.writeFileSync(RUSAK, Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff, 0xfe, 0x00, 0x99]))
let pass = 0, fail = 0
const ok = (nama, kond, info = '') => {
  if (kond) { pass++; console.log(`PASS ${nama}`) }
  else { fail++; console.log(`FAIL ${nama} ${info}`) }
}
;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))
  await page.addInitScript(() => {
    localStorage.setItem('spj_auth', 'true')
    const tx = [{ row: 2, bulan: 3, tanggal: '2026-03-05', tanggalStr: '05-03-2026', noBukti: 'BPU11', uraian: 'Makan Box', penerimaan: 0, pengeluaran: 400000, saldo: 45184100, kodeKegiatan: '04.06.14.', kodeRekening: '5.1.02.01.01.0052', kategori: { key: 'MAMIN', label: 'Makan/Minum', color: 'green' }, tipe: 'PEMBAYARAN' }]
    localStorage.setItem('spj_bku_data', JSON.stringify({ transactions: tx, header: { nama_sekolah: 'SD NEGERI TEST', npsn: '12345678', tahunAnggaran: '2026' }, summary: {}, uploadedAt: Date.now() }))
  })
  await page.route('**/*', (route) => {
    const u = route.request().url()
    if (u.includes('localhost:5173')) return route.continue()
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })
  await page.goto('http://localhost:5173/dashboard/bku', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.locator('tr', { hasText: 'BPU11' }).first().click()
  await page.waitForTimeout(1500)
  await page.getByText('Generate Foto Dokumentasi AI').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(500)

  // AC-1: upload file rusak via input OWNER kartu AI (input file ke-3 di halaman:
  // 0 = Upload Foto Bukti sidebar, 1 = ruang, 2 = owner).
  const inputKartu = page.locator('input[type=file]').nth(2)
  const t0 = Date.now()
  await inputKartu.setInputFiles(RUSAK)
  let pesanRusak = false
  try {
    await page.getByText(/tidak dapat dibaca|Gagal memuat/i).first().waitFor({ timeout: 8000 })
    pesanRusak = true
  } catch { /* tidak muncul */ }
  const dt = Date.now() - t0
  ok('AC-1 upload rusak ditolak ≤8 dtk', pesanRusak && dt < 8000, `dt=${dt}ms`)
  await page.screenshot({ path: 'D:/project/spj-app/spj-frontend/bukti-026-upload-rusak.png', timeout: 8000 }).catch(() => {})

  // AC-3: Stop saat generate (stub gagal cepat) → state bersih.
  // Tanpa akun Puter, klik Generate membuka alur sign-in/popup yang diblokir
  // route-stub → error path. Verifikasi: tidak ada loading abadi.
  await page.getByRole('button', { name: /Generate Semua Foto/ }).click().catch(() => {})
  await page.waitForTimeout(4000)
  const stopAda = await page.getByRole('button', { name: /Stop Generate/ }).isVisible().catch(() => false)
  if (stopAda) {
    await page.getByRole('button', { name: /Stop Generate/ }).click()
    await page.waitForTimeout(1000)
  }
  const loadingAbadi = await page.getByText(/Generating foto|Foto \d+\/\d+/).isVisible().catch(() => false)
  const tombolKembali = await page.getByRole('button', { name: /Generate Semua Foto/ }).isVisible().catch(() => false)
  ok('AC-3 tidak ada loading abadi', !loadingAbadi && tombolKembali, `loading=${loadingAbadi} tombol=${tombolKembali}`)

  // AC-2: pesan error terlihat (Indonesia) saat generate gagal tanpa akun.
  const adaError = await page.getByText(/Puter|kuota|koneksi|Gagal/i).first().isVisible().catch(() => false)
  ok('AC-2 pesan gagal terlihat', adaError)

  // AC-5: file 0 byte → ditolak, bukan hang.
  fs.writeFileSync(RUSAK, Buffer.alloc(0))
  await inputKartu.setInputFiles(RUSAK)
  let pesanNol = false
  try {
    await page.getByText(/tidak dapat dibaca|Gagal memuat|0 byte|kosong/i).first().waitFor({ timeout: 8000 })
    pesanNol = true
  } catch { /* tidak muncul */ }
  ok('AC-5 file 0 byte ditolak', pesanNol)

  ok('AC-6 nol pageerror', errors.length === 0, errors.slice(0, 3).join(' | '))
  console.log(`\nHASIL: ${pass} PASS / ${fail} FAIL`)
  await browser.close()
  process.exit(fail ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(2) })
