/**
 * Oracle test — Register Kas & BAP: nilai lembar/keping/jumlah uang kertas & logam.
 * Pola proyek: shim localStorage → esbuild bundle → PASS/FAIL + exit code.
 *
 * Konteks: user 2026-10-18 ronde-3 melaporkan nilai lembar/keping tidak benar
 * di Register Kas (Sub Jumlah (1)/(2) SELALU "Rp 0" karena string terformat
 * diformat ulang → NaN). Test ini mengunci perbaikannya + perhitungan BAP.
 */
import assert from 'node:assert'

// ─── Shim localStorage (WAJIB sebelum import modul yang menyentuh storage) ───
const seed = {
  'spj_data_sekolah': {
    namaSekolah: 'SD NEGERI LEBAKLEUNGSIR',
    kabupaten: 'KABUPATEN BANDUNG BARAT',
    kecamatan: 'CIKALONGWETAN',
    npsn: '20228636',
    pejabat: {
      'kepala-sekolah': { nama: 'YUNIARTI, S.Pd', nip: '196607071986102005' },
      'bendahara': { nama: 'AHMAD, S.Pd.', nip: '196805251992121003' },
    },
  },
  'spj_kertas': 'A4',
  'spj_kas_form': {
    RK: { bulan: 'Januari' },
    BAP: { bulan: 'Januari' },
  },
}
const store = new Map(Object.entries({
  ...Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)])),
}))
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}

// ─── BKU: Januari 82.560.000 masuk (BOSP), Feb pengeluaran 12.560.000 ───
const bku = {
  header: { tahunAnggaran: 2026 },
  footer: { tempat: 'Bandung Barat' },
  transactions: [
    { tanggalISO: '2026-01-05', bulan: 1, penerimaan: 82560000, pengeluaran: 0, saldo: 82560000, tipe: 'PENERIMAAN_BOSP' },
    { tanggalISO: '2026-02-10', bulan: 2, penerimaan: 0, pengeluaran: 12560000, saldo: 70000000 },
  ],
  summary: { months: [1, 2] },
}

const { kasDocs } = await import('./src/utils/previewDocs.js')
const { saldoKasTunaiBulan } = await import('./src/utils/dokKas.js')

let fail = 0
const cek = (nama, fn) => {
  try { fn(); console.log(`PASS | ${nama}`) }
  catch (e) { fail++; console.log(`FAIL | ${nama}\n       ${e.message}`) }
}

// ─── 1. Kasus dasar (contoh sumber): tanpa lembar/keping → semua uang di bank ───
const dasar = kasDocs({ RK: { bulan: 'Januari' }, BAP: { bulan: 'Januari' } }, bku)
const reg = dasar.find((d) => d.key === 'register-kas')

cek('register: 11 baris pecahan (7 kertas + 4 logam)', () => {
  assert.strictEqual(reg.data.rows.length, 11)
  assert.strictEqual(reg.data.rows.filter((r) => r.jenis === 'Kertas').length, 7)
  assert.strictEqual(reg.data.rows.filter((r) => r.jenis === 'Logam').length, 4)
})

cek('register: tanpa input fisik → sub1/sub2 = Rp 0, sub3 = saldo penuh', () => {
  assert.strictEqual(reg.data.subKertasValue, 'Rp 0')
  assert.strictEqual(reg.data.subLogamValue, 'Rp 0')
  assert.strictEqual(reg.data.saldoBank, 'Rp 82.560.000')
  assert.strictEqual(reg.data.jumlahTotal, 'Rp 82.560.000')
})

cek('register: D/K/A dari BKU Januari', () => {
  assert.strictEqual(reg.data.totalPenerimaan, 'Rp 82.560.000,-')
  assert.strictEqual(reg.data.totalPengeluaran, 'Rp 0,-')
  assert.strictEqual(reg.data.saldoBuku, 'Rp 82.560.000,-')
  assert.strictEqual(reg.data.saldoKas, 'Rp 82.560.000,-')
})

cek('register: perbedaan (A - B) = Rp 0 → penjelasan garis titik', () => {
  assert.strictEqual(reg.data.perbedaan, 'Rp 0')
  assert.match(reg.data.penjelasanPerbedaan, /\.{5,}/)
})

// ─── 2. User isi lembar/keping → sub-jumlah HARUS ANGKA NYATA (bug lama: Rp 0) ───
const fisik = kasDocs({
  RK: {
    bulan: 'Januari',
    pecahan: [
      { id: 'k-100000', jenis: 'Kertas', nominal: 100000, lembar: 3 },   // 300.000
      { id: 'k-50000', jenis: 'Kertas', nominal: 50000, lembar: 2 },     // 100.000
      { id: 'l-1000', jenis: 'Logam', nominal: 1000, lembar: 5 },        // 5.000
      { id: 'l-100', jenis: 'Logam', nominal: 100, lembar: 10 },         // 1.000
    ],
  },
  BAP: { bulan: 'Januari' },
}, bku)
const regF = fisik.find((d) => d.key === 'register-kas')
const baris = (id) => regF.data.rows.find((r) => r.id === id)

cek('register: lembar & keping tersimpan apa adanya di rows', () => {
  assert.strictEqual(baris('k-100000').lembar, 3)
  assert.strictEqual(baris('k-50000').lembar, 2)
  assert.strictEqual(baris('l-1000').lembar, 5)
  assert.strictEqual(baris('l-100').lembar, 10)
}

)

cek('register: Sub Jumlah (1) uang kertas = Rp 400.000 (BUKAN "Rp 0")', () => {
  assert.strictEqual(regF.data.subKertasValue, 'Rp 400.000')
})

cek('register: Sub Jumlah (2) uang logam = Rp 6.000 (BUKAN "Rp 0")', () => {
  assert.strictEqual(regF.data.subLogamValue, 'Rp 6.000')
})

cek('register: saldo bank = sisa (82.560.000 − 406.000) = Rp 82.154.000', () => {
  assert.strictEqual(regF.data.saldoBank, 'Rp 82.154.000')
  assert.strictEqual(regF.data.jumlahTotal, 'Rp 82.560.000')
})

cek('register: Jumlah (1+2+3) tetap = Saldo Kas → perbedaan Rp 0', () => {
  assert.strictEqual(regF.data.perbedaan, 'Rp 0')
})

// ─── 3. Isian lama tidak lengkap/kelebihan → tetap 11 baris urut ───
const lama = kasDocs({
  RK: { bulan: 'Januari', pecahan: [{ id: 'k-2000', jenis: 'Kertas', nominal: 2000, lembar: 4 }] },
  BAP: {},
}, bku)
const regL = lama.find((d) => d.key === 'register-kas')
cek('register: isian lama 1 baris → 11 baris lengkap, urutan sumber', () => {
  assert.strictEqual(regL.data.rows.length, 11)
  assert.deepStrictEqual(regL.data.rows.map((r) => r.nominal),
    [100000, 50000, 20000, 10000, 5000, 2000, 1000, 1000, 500, 200, 100])
  assert.strictEqual(regL.data.subKertasValue, 'Rp 8.000')
  assert.strictEqual(regL.data.subLogamValue, 'Rp 0')
})

// ─── 4. User isi Saldo Bank sendiri → perbedaan boleh ≠ 0 + penjelasan jujur ───
// lembar Rp 100.000 ×1 = fis 100.000; bank ketikan 80.000.000 → B = 80.100.000.
const selisih = kasDocs({
  RK: { bulan: 'Januari', pecahan: [{ id: 'k-100000', jenis: 'Kertas', nominal: 100000, lembar: 1 }], saldoBank: 80000000 },
  BAP: {},
}, bku)
const regS = selisih.find((d) => d.key === 'register-kas')
cek('register: saldo bank ketikan → B = 80.100.000, perbedaan = 2.460.000', () => {
  assert.strictEqual(regS.data.saldoBank, 'Rp 80.000.000')
  assert.strictEqual(regS.data.saldoKas, 'Rp 80.100.000,-')
  assert.strictEqual(regS.data.perbedaan, 'Rp 2.460.000')
  assert.match(regS.data.penjelasanPerbedaan, /tidak ada pecahan uang Rp 2\.460\.000/)
})

// ─── 5. BAP: a) mengikuti fisik Register, b) sisa bank, c) 0 ───
const bap = fisik.find((d) => d.key === 'bap-kas')
const cari = (u) => bap.data.rows.find((r) => String(r.uraian || '').toLowerCase().startsWith(u))
cek('BAP: a) uang kertas+logam = Rp 406.000 (sama dengan register)', () => {
  assert.strictEqual(cari('a)').nominal, 406000)
})
cek('BAP: b) saldo bank = Rp 82.154.000', () => {
  assert.strictEqual(cari('b)').nominal, 82154000)
})
cek('BAP: c) surat berharga = 0; Jumlah = total fisik; perbedaan = 0', () => {
  assert.strictEqual(cari('c)').nominal, 0)
  const jml = bap.data.rows.find((r) => String(r.uraian).toLowerCase() === 'jumlah')
  const saldo = bap.data.rows.find((r) => String(r.uraian).toLowerCase().startsWith('saldo uang'))
  const sel = bap.data.rows.find((r) => String(r.uraian).toLowerCase().startsWith('perbedaan'))
  assert.strictEqual(jml.nominal, 82154000 + 406000)
  assert.strictEqual(saldo.nominal, 82560000)
  assert.strictEqual(sel.nominal, 0)
})
cek('BAP: ketikan user menimpa default BKU', () => {
  const bap2 = kasDocs({
    RK: {}, BAP: { bulan: 'Januari', uangFisik: 111, saldoBankBap: 222, suratBerharga: 333 },
  }, bku).find((d) => d.key === 'bap-kas')
  assert.strictEqual(bap2.data.rows[0].nominal, 111)   // a) uang kertas+logam
  assert.strictEqual(bap2.data.rows[1].nominal, 222)   // b) saldo bank
  assert.strictEqual(bap2.data.rows[2].nominal, 333)   // c) surat berharga
})

// ─── 6. OTOMATIS: lembar/keping dari SALDO KAS TUNAI (permintaan user) ───
// Greedy kertas→logam: 406.000 = 4×100rb + 1×5rb + 1×1rb (semua kertas).
const tunai = kasDocs({
  RK: { bulan: 'Januari', saldoTunai: 406000 },
  BAP: { bulan: 'Januari' },
}, bku)
const regT = tunai.find((d) => d.key === 'register-kas')
const barisT = (id) => regT.data.rows.find((r) => r.id === id)
const jumlahAuto = (jenis) => regT.data.rows.filter((r) => r.jenis === jenis)
  .reduce((s, r) => s + r.nominal * (Number(r.lembar) || 0), 0)

cek('auto: saldo tunai 406.000 → 4×100rb, 1×5rb, 1×1rb (greedy kertas dulu)', () => {
  assert.strictEqual(Number(barisT('k-100000').lembar), 4)
  assert.strictEqual(Number(barisT('k-50000').lembar) || 0, 0)
  assert.strictEqual(Number(barisT('k-5000').lembar), 1)
  assert.strictEqual(Number(barisT('k-1000').lembar), 1)
  assert.strictEqual(jumlahAuto('Kertas'), 406000)
  assert.strictEqual(jumlahAuto('Logam'), 0)
})

cek('auto: Sub Jumlah (1)=406.000, (2)=0, bank=sisa, perbedaan 0', () => {
  assert.strictEqual(regT.data.subKertasValue, 'Rp 406.000')
  assert.strictEqual(regT.data.subLogamValue, 'Rp 0')
  assert.strictEqual(regT.data.saldoBank, 'Rp 82.154.000')
  assert.strictEqual(regT.data.jumlahTotal, 'Rp 82.560.000')
  assert.strictEqual(regT.data.perbedaan, 'Rp 0')
})

cek('auto: sisa di bawah 1.000 pakai LOGAM (1.500 = 1×1rb kertas + 1×500 logam)', () => {
  const tL = kasDocs({ RK: { bulan: 'Januari', saldoTunai: 1500 }, BAP: {} }, bku)
    .find((d) => d.key === 'register-kas')
  assert.strictEqual(Number(tL.data.rows.find((r) => r.id === 'k-1000').lembar), 1)
  assert.strictEqual(Number(tL.data.rows.find((r) => r.id === 'l-500').lembar), 1)
  assert.strictEqual(tL.data.subKertasValue, 'Rp 1.000')
  assert.strictEqual(tL.data.subLogamValue, 'Rp 500')
})

cek('auto: ketikan satu baris menang, baris lain tetap otomatis', () => {
  const campur = kasDocs({
    RK: {
      bulan: 'Januari', saldoTunai: 406000,
      pecahan: [{ id: 'k-100000', jenis: 'Kertas', nominal: 100000, lembar: 1 }], // timpa 1 baris
    },
    BAP: {},
  }, bku).find((d) => d.key === 'register-kas')
  assert.strictEqual(Number(campur.data.rows.find((r) => r.id === 'k-100000').lembar), 1) // ketikan
  assert.strictEqual(Number(campur.data.rows.find((r) => r.id === 'k-5000').lembar), 1)   // otomatis
  // fisik = 100.000 (ketikan) + 5.000 + 1.000 (otomatis) = 106.000
  assert.strictEqual(campur.data.subKertasValue, 'Rp 106.000')
  assert.strictEqual(campur.data.subLogamValue, 'Rp 0')
})

cek('auto: saldo tunai 10.000 → 1 lembar Rp 10.000, sisanya 0', () => {
  const t2 = kasDocs({ RK: { bulan: 'Januari', saldoTunai: 10000 }, BAP: {} }, bku)
    .find((d) => d.key === 'register-kas')
  assert.strictEqual(Number(t2.data.rows.find((r) => r.id === 'k-10000').lembar), 1)
  assert.strictEqual(Number(t2.data.rows.find((r) => r.id === 'k-5000').lembar) || 0, 0)
  assert.strictEqual(t2.data.subKertasValue, 'Rp 10.000')
  assert.strictEqual(t2.data.subLogamValue, 'Rp 0')
})

cek('auto: saldo tunai 0 → semua lembar kosong (cetak 0/Rp 0 seperti sumber)', () => {
  const t3 = kasDocs({ RK: { bulan: 'Januari', saldoTunai: 0 }, BAP: {} }, bku)
    .find((d) => d.key === 'register-kas')
  assert.ok(t3.data.rows.every((r) => Number(r.lembar) || 0 === 0))
  assert.strictEqual(t3.data.subKertasValue, 'Rp 0')
  assert.strictEqual(t3.data.saldoBank, 'Rp 82.560.000')
})

cek('auto: BAP a/b ikut uang fisik hasil otomatis tunai', () => {
  const bapT = tunai.find((d) => d.key === 'bap-kas')
  const a = bapT.data.rows.find((r) => String(r.uraian).toLowerCase().startsWith('a)'))
  const b = bapT.data.rows.find((r) => String(r.uraian).toLowerCase().startsWith('b)'))
  assert.strictEqual(a.nominal, 406000)
  assert.strictEqual(b.nominal, 82154000)
})

// ─── 6b. OTOMATIS DARI BKU: lembar/keping ikut saldo kas tunai per bulan ───
// Permintaan user 2026-10-19: "update automatis nilai lembar uang kertas serta
// kepingan uang logam sesuai nilai uang tunai di masing-masing dokumen tiap bulan".
// Mirror kolom E sheet "BKU--": saldo kas = MAX(0, tarik tunai − belanja BPU).
const bkuTunai = {
  header: { tahunAnggaran: 2026 },
  transactions: [
    { tanggalISO: '2026-01-05', bulan: 1, noBukti: 'BBU01', penerimaan: 82560000, pengeluaran: 0, saldo: 82560000, tipe: 'PENERIMAAN_BOSP' },
    { tanggalISO: '2026-01-20', bulan: 1, noBukti: 'BNU01', uraian: 'ATK', penerimaan: 0, pengeluaran: 560000, saldo: 82000000, tipe: 'PEMBAYARAN' },
    // Februari: tarik tunai 14.650.000; belanja BPU (tunai) 400.000 → kas = 14.250.000
    { tanggalISO: '2026-02-09', bulan: 2, noBukti: 'BNU02', uraian: 'Konsumsi', penerimaan: 0, pengeluaran: 3000000, saldo: 79000000, tipe: 'PEMBAYARAN' },
    { tanggalISO: '2026-02-09', bulan: 2, uraian: 'Tarik Tunai', penerimaan: 0, pengeluaran: 14650000, saldo: 64350000, tipe: 'TARIK_TUNAI' },
    { tanggalISO: '2026-02-10', bulan: 2, noBukti: 'BPU01', uraian: 'Konsumsi rapat (tunai)', penerimaan: 0, pengeluaran: 400000, saldo: 63950000, tipe: 'PEMBAYARAN' },
    { tanggalISO: '2026-02-11', bulan: 2, noBukti: 'BNU03', uraian: 'Honor', penerimaan: 0, pengeluaran: 1000000, saldo: 62950000, tipe: 'PEMBAYARAN' },
  ],
  summary: { months: [1, 2] },
}
const regFeb = kasDocs({ RK: { bulan: 'Februari' }, BAP: { bulan: 'Februari' } }, bkuTunai)
  .find((d) => d.key === 'register-kas')

cek('bku-auto: Februari tanpa ketik → lembar/keping ikut saldo tunai BKU', () => {
  // kas tunai Feb = 14.650.000 − 400.000 (BPU) = 14.250.000 → 142×100rb + 1×50rb
  assert.strictEqual(Number(regFeb.data.rows.find((r) => r.id === 'k-100000').lembar), 142)
  assert.strictEqual(Number(regFeb.data.rows.find((r) => r.id === 'k-50000').lembar), 1)
  assert.strictEqual(regFeb.data.subKertasValue, 'Rp 14.250.000')
  assert.strictEqual(regFeb.data.subLogamValue, 'Rp 0')
})

cek('bku-auto: Sub Jumlah (3) = saldo − fisik; Jumlah = saldo; perbedaan Rp 0', () => {
  assert.strictEqual(regFeb.data.saldoBank, 'Rp 48.700.000') // 62.950.000 − 14.250.000
  assert.strictEqual(regFeb.data.jumlahTotal, 'Rp 62.950.000')
  assert.strictEqual(regFeb.data.perbedaan, 'Rp 0')
})

cek('bku-auto: Januari (tarik tunai 0) → semua lembar 0, uang penuh di bank', () => {
  const regJan = kasDocs({ RK: { bulan: 'Januari' }, BAP: {} }, bkuTunai)
    .find((d) => d.key === 'register-kas')
  assert.strictEqual(regJan.data.subKertasValue, 'Rp 0')
  assert.strictEqual(regJan.data.saldoBank, 'Rp 82.000.000') // saldo akhir Januari
})

cek('bku-auto: ketikan saldoTunai tetap MENANG atas BKU', () => {
  const ketik = kasDocs({ RK: { bulan: 'Februari', saldoTunai: 1000000 }, BAP: {} }, bkuTunai)
    .find((d) => d.key === 'register-kas')
  assert.strictEqual(ketik.data.subKertasValue, 'Rp 1.000.000') // 10×100rb, bukan 14.250.000
})

cek('bku-auto: BAP Februari ikut fisik BKU (a = 14.250.000)', () => {
  const bapFeb = kasDocs({ RK: { bulan: 'Februari' }, BAP: { bulan: 'Februari' } }, bkuTunai)
    .find((d) => d.key === 'bap-kas')
  const a = bapFeb.data.rows.find((r) => String(r.uraian).toLowerCase().startsWith('a)'))
  assert.strictEqual(a.nominal, 14250000)
})

cek('bku-auto: saldoKasTunaiBulan = MAX(0, tarik tunai − BPU); kosong = 0', () => {
  assert.strictEqual(saldoKasTunaiBulan(bkuTunai.transactions, 2), 14250000)
  assert.strictEqual(saldoKasTunaiBulan(bkuTunai.transactions, 1), 0)
  assert.strictEqual(saldoKasTunaiBulan(bkuTunai.transactions, 7), 0)
  assert.strictEqual(saldoKasTunaiBulan([], 1), 0)
})

// ─── 7. Cover: nama SD dari Data Sekolah masuk data blok ───
const cover = dasar.find((d) => d.key === 'cover-lpj')
cek('cover: namaSekolah dari data sekolah (bar biru)', () => {
  assert.strictEqual(cover.data.namaSekolah, 'SD NEGERI LEBAKLEUNGSIR')
  assert.strictEqual(cover.data.kecamatan, 'CIKALONGWETAN')
  assert.match(cover.data.barisPemda, /PEMERINTAH KABUPATEN BANDUNG BARAT/)
})
const sekat = dasar.find((d) => d.key === 'sekat-lpj')
cek('sekat: bulanSekat "BULAN JANUARI" (tanpa prefix ganda)', () => {
  assert.strictEqual(sekat.data.bulanSekat, 'BULAN JANUARI')
})

// ─── 7. Data sekolah hanya via allFields (label "SEKOLAH") tetap kebaca ───
store.set('spj_data_sekolah', JSON.stringify({
  allFields: [
    { label: 'NPSN', value: '20228636' },
    { label: 'SEKOLAH', value: 'SD NEGERI LEBAKLEUNGSIR' },
    { label: 'KECAMATAN', value: 'CIKALONGWETAN' },
    { label: 'ALAMAT SEKOLAH', value: 'Jl. Raya Cikalongwetan' },
    { label: 'KABUPATEN/KOTA', value: 'BANDUNG BARAT' },
  ],
}))
const cov2 = kasDocs({ RK: {}, BAP: {} }, bku).find((d) => d.key === 'cover-lpj')
cek('cover: nama SD dari allFields label "SEKOLAH" (bukan "ALAMAT SEKOLAH")', () => {
  assert.strictEqual(cov2.data.namaSekolah, 'SD NEGERI LEBAKLEUNGSIR')
  assert.strictEqual(cov2.data.kecamatan, 'CIKALONGWETAN')
  assert.match(cov2.data.barisPemda, /BANDUNG BARAT/)
})

console.log(fail === 0 ? '\n=== SEMUA PASS ===' : `\n=== ${fail} FAIL ===`)
process.exit(fail ? 1 : 0)
