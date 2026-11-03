// probe-027.cjs — Sprint 027 T-2: wajah peran masuk input_images (intercept).
const { chromium } = require('playwright')
let pass = 0, fail = 0
const ok = (nama, kond, info = '') => {
  if (kond) { pass++; console.log(`PASS ${nama}`) }
  else { fail++; console.log(`FAIL ${nama} ${info}`) }
}
;(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  // Artefak stub: SDK Puter melempar objek internal {"log":[],"name":""} saat
  // respons 401 palsu — bukan bug aplikasi (aplikasi menangkap via catch).
  page.on('pageerror', (e) => {
    const s = e && e.stack ? e.stack : JSON.stringify(e)
    if (s.includes('"log":[]')) return
    errors.push(s.slice(0, 120))
  })
  await page.addInitScript(() => {
    localStorage.setItem('spj_auth', 'true')
    // Bentuk ASLI writer PersonelFotoTab (key = role id)
    localStorage.setItem('personel_photos', JSON.stringify({
      guru: { dataUrl: 'data:image/png;base64,WAJAH1', name: 'guru.jpg', uploadedAt: 1 },
    }))
    localStorage.setItem('ruangan_photos', JSON.stringify({
      ruang_rapat: { dataUrl: 'data:image/png;base64,RUANG1', name: 'r.jpg', uploadedAt: 2 },
    }))
    localStorage.setItem('spj_dok_ai_owner', JSON.stringify({
      mamin: { dataUrl: 'data:image/png;base64,OWNER1', name: 'o.jpg', uploadedAt: 3 },
    }))
    // Token Puter palsu agar lolos gate sign-in (isi request yang diassert, bukan hasilnya)
    localStorage.setItem('puter.auth.token.v2', 'test-fake-token-027')
    const tx = [{ row: 2, bulan: 3, tanggal: '2026-03-05', tanggalStr: '05-03-2026', noBukti: 'BPU11', uraian: 'Makan Box', penerimaan: 0, pengeluaran: 400000, saldo: 45184100, kodeKegiatan: '04.06.14.', kodeRekening: '5.1.02.01.01.0052', kategori: { key: 'MAMIN' }, tipe: 'PEMBAYARAN' }]
    localStorage.setItem('spj_bku_data', JSON.stringify({ transactions: tx, header: {}, summary: {}, uploadedAt: Date.now() }))
  })
  let captured = null
  page.on('request', (req) => {
    const u = req.url()
    if (u.includes('puter.com') && req.method() === 'POST') {
      try { captured = req.postDataJSON() } catch { captured = { _raw: (req.postData() || '').slice(0, 200) } }
    }
  })
  await page.route('**/*', (route) => {
    const u = route.request().url()
    if (u.includes('localhost:517')) return route.continue()
    // API Puter: biarkan gagal alami (401) — yang diassert adalah ISI request terkirim
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: { code: 'unauthorized' } }) })
  })
  await page.goto('http://localhost:5173/dashboard/bku', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  await page.locator('tr', { hasText: 'BPU11' }).first().click()
  await page.waitForTimeout(1500)
  // AC-1: entri peran tampil di Langkah 3
  const cekboxGuru = await page.locator('label').filter({ hasText: 'Guru' }).count()
  ok('AC-1 entri peran berfoto tampil', cekboxGuru > 0, `count=${cekboxGuru}`)
  // Pilih peran Guru lalu Generate slot rapat (tombol Generate pertama di set foto)
  await page.locator('label').filter({ hasText: 'Guru' }).first().click()
  await page.waitForTimeout(400)
  // Slot RAPAT = tombol Generate ke-2 (butuhOrang + butuhRuang) — penyerahan (ke-1) outdoor tanpa ruang.
  const genButtons = page.getByRole('button', { name: 'Generate', exact: true })
  await genButtons.nth(1).click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(8000)
  const body = JSON.stringify(captured || {})
  const adaWajah = body.includes('WAJAH1')
  const adaRuang = body.includes('RUANG1')
  ok('AC-2 input_images memuat wajah+ruang', adaWajah && adaRuang, `wajah=${adaWajah} ruang=${adaRuang}`)
  // AC-3: lepas pilihan → fallback foto peran pertama tetap dikirim.
  captured = null
  await page.locator('label').filter({ hasText: 'Guru' }).first().click()
  await page.waitForTimeout(400)
  await page.getByRole('button', { name: 'Generate', exact: true }).nth(1).click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(8000)
  const body2 = JSON.stringify(captured || {})
  ok('AC-3 fallback wajah peran pertama', body2.includes('WAJAH1'), body2.slice(0, 120))
  // AC-7 matriks slot: penyerahan = wajah+owner TANPA ruang; box = ruang TANPA wajah.
  captured = null
  await page.getByRole('button', { name: 'Generate', exact: true }).first().click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(8000)
  const bodyP = JSON.stringify(captured || {})
  ok('AC-7a penyerahan: owner ya, ruang tidak', bodyP.includes('OWNER1') && !bodyP.includes('RUANG1'),
    bodyP.slice(0, 150))
  const boxButtons = page.getByRole('button', { name: 'Generate', exact: true })
  const nGen = await boxButtons.count()
  captured = null
  await boxButtons.nth(nGen - 1).click({ timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(8000)
  const bodyB = JSON.stringify(captured || {})
  ok('AC-7b box: ruang ya, wajah tidak', bodyB.includes('RUANG1') && !bodyB.includes('WAJAH1'),
    bodyB.slice(0, 150))
  ok('AC-6 nol pageerror', errors.length === 0, JSON.stringify(errors.slice(0, 2)))
  console.log(`\nHASIL: ${pass} PASS / ${fail} FAIL`)
  await browser.close()
  process.exit(fail ? 1 : 0)
})().catch((e) => { console.error('FATAL', e.message); process.exit(2) })
