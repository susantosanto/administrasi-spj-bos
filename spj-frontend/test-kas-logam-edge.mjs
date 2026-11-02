/**
 * Edge-case test — perhitungan LEMBAR (uang kertas) & KEPING (uang logam)
 * Register Kas. Fokus batas kertas/logam + perilaku tepi.
 * Pola proyek: shim localStorage → esbuild bundle → PASS/FAIL + exit code.
 */
import assert from 'node:assert'

const seed = {
  'spj_data_sekolah': {
    namaSekolah: 'SD NEGERI LEBAKLEUNGSIR',
    kabupaten: 'KABUPATEN BANDUNG BARAT',
    kecamatan: 'CIKALONGWETAN',
    pejabat: {
      'kepala-sekolah': { nama: 'YUNIARTI, S.Pd', nip: '196607071986102005' },
      bendahara: { nama: 'AHMAD, S.Pd.', nip: '196805251992121003' },
    },
  },
  'spj_kertas': 'A4',
}
const store = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]))
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

const bku = {
  header: { tahunAnggaran: 2026 },
  transactions: [
    { tanggalISO: '2026-01-05', bulan: 1, penerimaan: 82560000, pengeluaran: 0, saldo: 82560000, tipe: 'PENERIMAAN_BOSP' },
  ],
  summary: { months: [1] },
}

const { pecahanDariSaldo, lembarPecahan, subtotalPecahanJenis, PECAHAN_DAFTAR } = await import('./src/utils/dokKas.js')
const { kasDocs } = await import('./src/utils/previewDocs.js')

let fail = 0
const cek = (nama, fn) => {
  try { fn(); console.log(`PASS | ${nama}`) }
  catch (e) { fail++; console.log(`FAIL | ${nama}\n       ${e.message}`) }
}

// ─── 1. Struktur 11 baris & satuan ───
cek('11 baris: 7 kertas (Lembar) + 4 logam (Keping), urut sumber', () => {
  assert.strictEqual(PECAHAN_DAFTAR.length, 11)
  assert.deepStrictEqual(PECAHAN_DAFTAR.filter((d) => d.jenis === 'Kertas').length, 7)
  assert.deepStrictEqual(PECAHAN_DAFTAR.filter((d) => d.jenis === 'Logam').length, 4)
  assert.ok(PECAHAN_DAFTAR.filter((d) => d.jenis === 'Kertas').every((d) => d.satuan === 'Lembar'))
  assert.ok(PECAHAN_DAFTAR.filter((d) => d.jenis === 'Logam').every((d) => d.satuan === 'Keping'))
})

// ─── 2. Batas Rp 1.000 = KERTAS (bukan keping logam) ───
cek('Rp 1.000 dihitung LEMBAR KERTAS (kertas didahulukan)', () => {
  assert.deepStrictEqual(pecahanDariSaldo(1000), { 'k-1000': 1 })
})
cek('Rp 100 (tak bisa dibagi 1.000) → Keping logam 100', () => {
  assert.deepStrictEqual(pecahanDariSaldo(100), { 'l-100': 1 })
})

// ─── 3. Logam campur ───
cek('Rp 1.500 = 1 lembar Rp 1.000 (kertas) + 1 keping Rp 500 (logam)', () => {
  assert.deepStrictEqual(pecahanDariSaldo(1500), { 'k-1000': 1, 'l-500': 1 })
})
cek('Rp 3.700 = 1 lembar 2rb + 1 lembar 1rb (kertas) + 1 keping 500 + 1 keping 200 (logam)', () => {
  assert.deepStrictEqual(pecahanDariSaldo(3700), { 'k-2000': 1, 'k-1000': 1, 'l-500': 1, 'l-200': 1 })
})

// ─── 4. Sisa di bawah Rp 100 tidak tergambar (fisik < saldo) ───
cek('Rp 250 = 1 keping Rp 200; sisa Rp 50 tak ada pecahannya', () => {
  assert.deepStrictEqual(pecahanDariSaldo(250), { 'l-200': 1 })
})
cek('Rp 82.560.073 → fisik 82.560.000, sisa Rp 73 tak tergambar', () => {
  const p = lembarPecahan([], 82560073)
  assert.strictEqual(subtotalPecahanJenis(p, 'Kertas') + subtotalPecahanJenis(p, 'Logam'), 82560000)
})

// ─── 5. Saldo 0 & saldo besar ───
cek('saldo 0 → semua lembar kosong', () => {
  assert.deepStrictEqual(pecahanDariSaldo(0), {})
})
cek('Rp 82.560.000 = 825×100rb + 1×50rb + 1×10rb (semua kertas)', () => {
  assert.deepStrictEqual(pecahanDariSaldo(82560000), { 'k-100000': 825, 'k-50000': 1, 'k-10000': 1 })
})

// ─── 6. Ketikan user menang per baris; "0" eksplisit ≠ kosong ───
cek('ketikan 2 pada baris 100rb MENANG atas otomatis', () => {
  const p = lembarPecahan([{ id: 'k-100000', lembar: 2 }], 406000)
  const baris = p.find((r) => r.id === 'k-100000')
  assert.strictEqual(baris.lembar, 2)
})
cek('ketikan "0" eksplisit = nol lembar (bukan balik ke otomatis)', () => {
  const p = lembarPecahan([{ id: 'k-100000', lembar: 0 }], 406000)
  assert.strictEqual(p.find((r) => r.id === 'k-100000').lembar, 0)
})
cek('baris tanpa ketikan tetap otomatis saat baris lain diketik', () => {
  const p = lembarPecahan([{ id: 'k-100000', lembar: 2 }], 406000)
  assert.strictEqual(p.find((r) => r.id === 'k-5000').lembar, 1)   // tetap auto
  assert.strictEqual(p.find((r) => r.id === 'k-1000').lembar, 1)   // tetap auto
})

// ─── 7. Lewat kasDocs (jalur aplikasi): uang logam & batas ───
const reg = (saldoTunai) => kasDocs({ RK: { bulan: 'Januari', saldoTunai } }, bku).find((d) => d.key === 'register-kas').data

cek('kasDocs: saldoTunai 250 (logam) → Sub Jumlah (2) = Rp 200, perbedaan Rp 0', () => {
  const d = reg(250)
  assert.strictEqual(d.subLogamValue, 'Rp 200')
  assert.strictEqual(d.subKertasValue, 'Rp 0')
  assert.strictEqual(d.saldoBank, 'Rp 82.559.800')   // 82.560.000 − 200
  assert.strictEqual(d.jumlahTotal, 'Rp 82.560.000') // 0 + 200 + 82.559.800
  assert.strictEqual(d.perbedaan, 'Rp 0')
})
cek('kasDocs: saldoTunai 100 (keping Rp 100) → Sub Jumlah (2) = Rp 100', () => {
  const d = reg(100)
  assert.strictEqual(d.subLogamValue, 'Rp 100')
  assert.strictEqual(d.perbedaan, 'Rp 0')
})
cek('kasDocs: saldoTunai PENUH 82.560.000 → Sub Jumlah (3) = Rp 0, semua uang fisik', () => {
  const d = reg(82560000)
  assert.strictEqual(d.subKertasValue, 'Rp 82.560.000')
  assert.strictEqual(d.subLogamValue, 'Rp 0')
  assert.strictEqual(d.saldoBank, 'Rp 0')
  assert.strictEqual(d.jumlahTotal, 'Rp 82.560.000')
  assert.strictEqual(d.perbedaan, 'Rp 0')
})
cek('kasDocs: saldoTunai > saldo buku → Sub Jumlah (3) tetap Rp 0 (tak negatif), perbedaan tampil', () => {
  const d = reg(83000000)
  assert.strictEqual(d.saldoBank, 'Rp 0')
  assert.strictEqual(d.jumlahTotal, 'Rp 83.000.000')
  assert.strictEqual(d.perbedaan, 'Rp -440.000') // A − B = 82.560.000 − 83.000.000
})
cek('kasDocs: tanpa saldoTunai → semua lembar 0, saldo penuh di bank (Sub 3 = 82.560.000)', () => {
  const d = reg('')
  assert.strictEqual(d.subKertasValue, 'Rp 0')
  assert.strictEqual(d.subLogamValue, 'Rp 0')
  assert.strictEqual(d.saldoBank, 'Rp 82.560.000')
  assert.strictEqual(d.perbedaan, 'Rp 0')
})

// ─── 8. BAP ikut nilai fisik (kertas+logam) yang sama ───
cek('BAP: a) uang fisik = Sub Jumlah (1)+(2), b) bank = sisa, perbedaan Rp 0', () => {
  const bap = kasDocs({ RK: { bulan: 'Januari', saldoTunai: 3700 }, BAP: { bulan: 'Januari' } }, bku)
    .find((d) => d.key === 'bap-kas').data
  const byId = Object.fromEntries(bap.rows.map((r) => [r.id, r.nominal]))
  assert.strictEqual(byId['bap-a'], 3700)              // 3×1rb + 500 + 200
  assert.strictEqual(byId['bap-b'], 82556300)          // 82.560.000 − 3.700
  assert.strictEqual(byId['bap-c'], 0)
  assert.strictEqual(byId['bap-jml'], 82560000)
  assert.strictEqual(byId['bap-selisih'], 0)
})

console.log(fail === 0 ? '\n=== SEMUA PASS ===' : `\n=== ${fail} FAIL ===`)
process.exit(fail ? 1 : 0)
