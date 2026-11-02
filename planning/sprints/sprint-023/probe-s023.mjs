// probe-s023.mjs — verifikasi Sprint 023 (node, tanpa browser).
// Gate: REKENING_MAP 183 + lookup + guard statis 5 file + warna terlarang.
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../spj-frontend/src')
const { REKENING_MAP, getNamaRekening, KEGIATAN_BOS } = await import(pathToFileURL(`${root}/data/kodeReferensi.js`).href)

let pass = 0, fail = 0
const ok = (nama, kond, info = '') => {
  if (kond) { pass++; console.log(`PASS ${nama}`) }
  else { fail++; console.log(`FAIL ${nama} ${info}`) }
}

// ── R-4: referensi ──
ok('R4-jumlah-183', REKENING_MAP.length === 183, `dapat ${REKENING_MAP.length}`)
ok('R4-upah-0016', getNamaRekening('5.1.02.02.01.0016') === 'Belanja Jasa Tenaga Penanganan Prasarana dan Sarana Umum / Upah Tukang')
ok('R4-fallback-mentah', getNamaRekening('9.9.9.X') === '9.9.9.X')
ok('R4-unik', new Set(REKENING_MAP.map((r) => r.kode)).size === 183)
ok('R4-semua-5.1', REKENING_MAP.every((r) => /^5\.1\./.test(r.kode)))
ok('R4-kegiatan-utuh', Array.isArray(KEGIATAN_BOS) && KEGIATAN_BOS.length > 100, `dapat ${KEGIATAN_BOS.length}`)

// ── Guard statis ──
const baca = (p) => readFileSync(`${root}/${p}`, 'utf8')
const sidebarPbj = baca('components/bku/SidebarPbj.jsx')
const kelengkapan = baca('pages/dashboard/DokumenKelengkapanPage.jsx')
const sidebar = baca('components/bku/BKUSidebar.jsx')
const sidebarLpj = baca('components/bku/BKUSidebarLpj.jsx')
const dokAi = baca('components/dokumentasi/DokumentasiAIGenerate.jsx')

ok('R1-tabel-komponen', sidebarPbj.includes('function TabelInvoice'))
ok('R1-tabel-judul', sidebarPbj.includes('Data Invoice SIPLah'))
ok('R1-refresh-arsip', sidebarPbj.includes('muatUlangArsip()') && sidebarPbj.includes("storageHelper.get('pbj_invoices'"))
ok('R2-guard-pajak', sidebar.includes('{!isSetorPajak && ('))
ok('R2-info-tetap', sidebar.includes('Informasi Referensi'))
ok('R3-ruang-lokal', dokAi.includes('spj_ruang_lokal') && dokAi.includes('handleHapusRuang') && dokAi.includes('handleUploadRuang'))
ok('R3-global-utuh', dokAi.includes("localStorage.getItem(RUANGAN_KEY) || '{}'"))
ok('R5-dropdown', sidebarLpj.includes('jenisPemeliharaan') && sidebarLpj.includes('non-upah'))
ok('R5-default-upah', sidebarLpj.includes("(formData?.jenisPemeliharaan || 'upah')"))

// ── Sprint 023-rev4: hapus baris invoice ──
ok('rev4-sidebar-hapus', sidebarPbj.includes('KonfirmHapusModal') && sidebarPbj.includes('targetHapus') && !sidebarPbj.includes('window.confirm'))
ok('rev4-halaman-hapus', kelengkapan.includes('KonfirmHapusModal') && kelengkapan.includes('eksekusiHapusInvoice') && !kelengkapan.includes('window.confirm'))
ok('rev6-modal-escape', baca('components/bku/KonfirmHapusModal.jsx').includes('Escape'))
ok('rev7-modal-portal', baca('components/bku/KonfirmHapusModal.jsx').includes('createPortal') && baca('components/bku/KonfirmHapusModal.jsx').includes('document.body'))
const larang = /emerald|amber|rose|violet|cyan/i
ok('warna-SidebarPbj-bersih', !larang.test(sidebarPbj))
ok('warna-BKUSidebarLpj-bersih', !larang.test(sidebarLpj))

// ── Sprint 023-rev3: Dokumen Perencanaan = Workplan sheet sumber ──
try {
  const { writeFileSync: tulisShim, readFileSync: bacaShim, mkdirSync: buatDir } = await import('node:fs')
  const { tmpdir: dirTmp } = await import('node:os')
  const dirShim = `${dirTmp()}/shim-s023b`
  buatDir(dirShim, { recursive: true })
  const salin = [
    ...['aturanPbj.js', 'pbjPrefill.js', 'pbjBkuStore.js', 'lpjBkuStore.js', 'aturanUndangan.js', 'aturanMamin.js', 'storageHelper.js', 'previewDocs.js', 'bkuHelper.js', 'signatureRoles.js', 'sekolahData.js', 'dokKas.js', 'dokPajak.js', 'pejabatRoles.js', 'tempatTtd.js', 'bkuParser.js', 'templateSuratHelper.js', 'realisasiAgregat.js', 'realisasiPeta.js'].map((f) => [`utils/${f}`, f]),
    ['data/templateConfig.js', 'templateConfig.js'],
    ['data/skPasal.js', 'skPasal.js'],
    ['data/kodeReferensi.js', 'kodeReferensi.js'],
  ]
  for (const [sumber, nama] of salin) {
    try {
      tulisShim(`${dirShim}/${nama}`, bacaShim(`${root}/${sumber}`, 'utf8')
        .replaceAll(/from '(\.\/[A-Za-z0-9_]+)'/g, `from '$1.js'`)
        .replaceAll(/from '\.\.\/(?:data|utils)\/([A-Za-z0-9_]+)'/g, `from './$1.js'`)
        .replaceAll(`from 'xlsx'`, `from 'file:///D:/project/spj-app/spj-frontend/node_modules/xlsx/xlsx.mjs'`))
    } catch { /* file tak ada → lewati */ }
  }
  const { pbjDocs } = await import(pathToFileURL(`${dirShim}/previewDocs.js`).href)
  const formWorkplan = { data: { noBukti: 'BNU 16', bulan: 'Februari', tanggalPesanan: '2026-02-10',
    jumlahBarang: '5 Paket', spesifikasi: 'Langganan Internet', waktuSerah: 'Estimasi 14 Hari pada Bulan Februari 2026',
    alokasi: '4751000', jenisPenyedia: 'Perorangan', namaPenyedia: "Toko D'Corner", direktur: 'Asti Nurul Alviani',
    npwp: '3217035806000005', alamat: 'Kp. Cipare', telp: '085759787530' } }
  const docsSiplah = pbjDocs(formWorkplan, 'siplah')
  ok('rev3-siplah-1-dok', docsSiplah.length === 1 && docsSiplah[0].key === 'pbj-perencanaan', docsSiplah.map((d) => d.key).join(','))
  const dw = docsSiplah[0]?.data || {}
  ok('rev3-meta', dw.noBukti === 'BNU 16' && dw.bulanTahun === 'Februari 2026' && dw.hari === '10', `${dw.noBukti}|${dw.bulanTahun}|${dw.hari}`)
  ok('rev3-kategori', (dw.kategori || '').includes('SIPLah'), dw.kategori)
  ok('rev3-alokasi-rp', (dw.alokasiRp || '').includes('4.751.000'), dw.alokasiRp)
  ok('rev3-penyedia', dw.direktur === 'Asti Nurul Alviani' && (dw.npwp || '').includes('321703'), `${dw.direktur}|${dw.npwp}`)
  ok('rev3-tanggal-cetak', String(dw.tanggalCetak || '').includes('Februari 2026'), dw.tanggalCetak)
  ok('rev3-template-workplan', docsSiplah[0]?.templateConfig?.blocks?.some((b) => b.type === 'workplan-pbj') === true)
  ok('rev3-peran-pelaksana', docsSiplah[0]?.templateConfig?.blocks?.some((b) => b.type === 'signature' && b.peranLabel === 'Pelaksana,') === true)
  // Dokumen kosong total → di-skip (jujur)
  ok('rev3-kosong-skip', pbjDocs({ data: {} }, 'siplah').length === 0)
  // NON-SIPLAH tetap 6 tab sumber (pesanan dari invoice)
  const docsNon = pbjDocs({ ...formWorkplan, pesanan: { kepadaPesanan: 'Toko X', rows: [{ uraian: 'A', qty: 1 }] } }, 'non')
  ok('rev3-nonsiplah', docsNon.some((d) => d.key === 'pbj-pesanan'), docsNon.map((d) => d.key).join(','))
  // ── Sprint 023-rev13: komparasi Register Kas Jan–Jun vs rumus sumber ──
  // (blok uji di bawah) + rev15: format tanggal BKU bervariasi ──
  const { parseTanggal } = await import(pathToFileURL(`${dirShim}/bkuParser.js`).href)
  const tglUji = [
    ['05-03-2026', 5, 3, 2026], ['05/03/2026', 5, 3, 2026], ['05.03.2026', 5, 3, 2026],
    ['2026-03-05', 5, 3, 2026], ['5 Maret 2026', 5, 3, 2026], ['5 Mar 26', 5, 3, 2026],
    ['asal', null],
  ]
  let tglOk = true
  for (const [masuk, d, m, y] of tglUji) {
    const h = parseTanggal(masuk)
    const cocok = d === null ? h === null : (h && h.day === d && h.month === m && h.year === y)
    if (!cocok) { tglOk = false; break }
  }
  ok('rev15-format-tanggal', tglOk)
  // Sumber (Data B9:P15 + rumus F10/F11/F12/H23/H29/H31/H33/H35):
  // Jan: D 82.56M K 0 A 82.56M tunai 0 bank 82.56M
  // Feb: D 82.56M K 36.375.900 A 46.184.100 tunai 9.075.000 bank 37.109.100
  // Mar: D 46.184.100 K 5.300.000 A 40.884.100 tunai 3.775.000 bank 37.109.100
  // Apr: D 40.884.100 K 31.742.700 A 9.141.400 tunai 1.100.000 bank 8.041.400
  // Mei: D 9.141.400 K 1.100.000 A 8.041.400 tunai 0 bank 8.041.400
  // Jun: D 8.041.400 K 8.041.400 A 0 tunai 0 bank 0
  // ── Sprint 023-rev14: form dan dokumen seangka (model tunai) ──
  const srcHal = baca('pages/dashboard/DokumenKelengkapanPage.jsx')
  ok('rev14-form-cash-model', srcHal.includes('saldoTunaiBerjalan(txs, mN)') && srcHal.includes('tunaiBkuForm.tarik'))
  ok('rev14-reset-pecahan', srcHal.includes('delete next.pecahan') && srcHal.includes('delete next.RK.pecahan'))
  ok('rev14-teks-bank', srcHal.includes('Sub Jumlah 3 (bank) = saldo buku'))
  const { kasDocs } = await import(pathToFileURL(`${dirShim}/previewDocs.js`).href)
  const T = (bulan, iso, tipe, pen, peng, saldo, noBukti) =>
    ({ bulan, tanggalISO: iso, tipe, penerimaan: pen, pengeluaran: peng, saldo, noBukti, uraian: tipe });
  const TX = {
    Januari: [T(1, '2026-01-31', 'PENERIMAAN_BOSP', 82560000, 0, 82560000, 'BBU-01')],
    Februari: [
      T(2, '2026-02-05', 'TARIK_TUNAI', 0, 20000000, 62560000, 'BKM-02'),
      T(2, '2026-02-10', 'PEMBAYARAN', 0, 10925000, 51635000, 'BPU-03'),
      T(2, '2026-02-28', 'PEMBAYARAN', 0, 5450900, 46184100, 'BNU-04'),
    ],
    Maret: [
      T(3, '2026-03-12', 'PEMBAYARAN', 0, 5300000, 40884100, 'BPU-06'),
    ],
    April: [
      T(4, '2026-04-12', 'PEMBAYARAN', 0, 2675000, 38209100, 'BPU-09'),
      T(4, '2026-04-30', 'PEMBAYARAN', 0, 29067700, 9141400, 'BNU-10'),
    ],
    Mei: [T(5, '2026-05-15', 'PEMBAYARAN', 0, 1100000, 8041400, 'BPU-11')],
    Juni: [
      T(6, '2026-06-05', 'TARIK_TUNAI', 0, 1700000, 6341400, 'BKM-12'),
      T(6, '2026-06-12', 'PEMBAYARAN', 0, 1700000, 4641400, 'BPU-13'),
      T(6, '2026-06-30', 'PEMBAYARAN', 0, 4641400, 0, 'BNU-14'),
    ],
  };
  const EXP = {
    Januari: { D: '82.560.000', K: 'Rp 0,-', A: '82.560.000', sub1: 'Rp 0', bank: '82.560.000', B: '82.560.000' },
    Februari: { D: '82.560.000', K: '36.375.900', A: '46.184.100', sub1: '9.075.000', bank: '37.109.100', B: '46.184.100' },
    Maret: { D: '46.184.100', K: '5.300.000', A: '40.884.100', sub1: '3.775.000', bank: '37.109.100', B: '40.884.100' },
    April: { D: '40.884.100', K: '31.742.700', A: '9.141.400', sub1: '1.100.000', bank: '8.041.400', B: '9.141.400' },
    Mei: { D: '9.141.400', K: '1.100.000', A: '8.041.400', sub1: 'Rp 0', bank: '8.041.400', B: '8.041.400' },
    Juni: { D: '8.041.400', K: '8.041.400', A: 'Rp 0,-', sub1: 'Rp 0', bank: 'Rp 0', B: 'Rp 0' },
  };
  const semuaTx = Object.values(TX).flat();
  for (const bln of Object.keys(TX)) {
    const rk = (kasDocs({ RK: { bulan: bln } }, { transactions: semuaTx, header: { tahunAnggaran: 2026 } }).find((d) => d.key === 'register-kas') || {}).data || {};
    const e = EXP[bln];
    ok(`rev13-${bln}-D`, String(rk.totalPenerimaan || '').includes(e.D), rk.totalPenerimaan);
    ok(`rev13-${bln}-K`, String(rk.totalPengeluaran || '').includes(e.K), rk.totalPengeluaran);
    ok(`rev13-${bln}-A`, String(rk.saldoBuku || '').includes(e.A), rk.saldoBuku);
    ok(`rev13-${bln}-sub1`, String(rk.subKertasValue || '').includes(e.sub1), rk.subKertasValue);
    ok(`rev13-${bln}-B`, String(rk.jumlahTotal || '').includes(e.B), rk.jumlahTotal);
    ok(`rev13-${bln}-selisih`, String(rk.perbedaan || '').includes('Rp 0'), rk.perbedaan);
  }
  // BAP Februari ikut rumus sumber (a = tunai, Jumlah = buku, selisih 0)
  const bapFeb = (kasDocs({ RK: { bulan: 'Februari' }, BAP: { bulan: 'Februari' } }, { transactions: semuaTx, header: { tahunAnggaran: 2026 } }).find((d) => d.key === 'bap-kas') || {}).data || {};
  const nomBap = (u) => (bapFeb.rows || []).find((r) => String(r.uraian || '').startsWith(u))?.nominal;
  ok('rev13-bap-a', nomBap('a)') === 9075000, `a=${nomBap('a)')}`);
  ok('rev13-bap-b', nomBap('b)') === 37109100, `b=${nomBap('b)')}`);
  ok('rev13-bap-jumlah', nomBap('Jumlah') === 46184100, `jml=${nomBap('Jumlah')}`);
  const { redetectTypes } = await import(pathToFileURL(`${dirShim}/bkuParser.js`).href)
  const txUji = redetectTypes([
    { uraian: 'Tarik Tunai BOS Februari', pengeluaran: 10000000, penerimaan: 0, kodeKegiatan: '06.05.06', kodeRekening: '5.1.02.02.01.0003', noBukti: 'BKM-05' },
    { uraian: 'Penarikan Dana Operasional', pengeluaran: 5000000, penerimaan: 0, kodeKegiatan: '06.05.06', kodeRekening: '5.1.02.02.01.0003', noBukti: '' },
    { uraian: 'Belanja ATK', pengeluaran: 2000000, penerimaan: 0, kodeKegiatan: '03.05.02', kodeRekening: '5.1.02.01.01.0024', noBukti: 'BPU-09' },
    { uraian: 'Tarik Tunai Dana BOS', pengeluaran: 4000000, penerimaan: 0, kodeKegiatan: '', kodeRekening: '', noBukti: 'BPU-11' },
    { uraian: 'Buku Literasi - Melestarikan Satwa Langka (Ber-SK) E-Katalog', pengeluaran: 181200, penerimaan: 0, kodeKegiatan: '', kodeRekening: '5.2.05.01.01.0001', noBukti: 'BNU24' },
  ])
  ok('rev9-tarik-berkode', txUji[0].tipe === 'TARIK_TUNAI', txUji[0].tipe)
  ok('rev9-penarikan-berkode', txUji[1].tipe === 'TARIK_TUNAI', txUji[1].tipe)
  ok('rev9-bpu-tetap-bayar', txUji[2].tipe === 'PEMBAYARAN', txUji[2].tipe)
  ok('rev9-tarik-bpu', txUji[3].tipe === 'TARIK_TUNAI', txUji[3].tipe)
  // Sprint 023-rev16: "Melestarikan" BUKAN tarik tunai (uji regresi FP nyata)
  ok('rev16-melestarikan', txUji[4].tipe !== 'TARIK_TUNAI', txUji[4].tipe)
  // Sprint 023-rev12: tarik via kolom penerimaan + denom "Rp.-" saat kosong
  const txMasuk = redetectTypes([
    { uraian: 'Tarik Tunai dari Bank', pengeluaran: 0, penerimaan: 5000000, kodeKegiatan: '', kodeRekening: '', noBukti: 'BKM-07' },
    { uraian: 'Dana BOSP Tahap 1', pengeluaran: 0, penerimaan: 82560000, kodeKegiatan: '', kodeRekening: '', noBukti: 'BBU-01' },
  ])
  ok('rev12-tarik-penerimaan', txMasuk[0].tipe === 'TARIK_TUNAI', txMasuk[0].tipe)
  ok('rev12-bbu-tetap-bosp', txMasuk[1].tipe === 'PENERIMAAN_BOSP', txMasuk[1].tipe)
  ok('rev12-denom-kosong', baca('components/templates/blocks/RegisterKas.jsx').includes(`'Rp.-'`))
  // Tunai berkode ikut hitungan Register Kas
  const txsKas = [
    { bulan: 2, tanggalISO: '2026-02-05', uraian: 'Tarik Tunai BOS Februari', tipe: 'TARIK_TUNAI', penerimaan: 0, pengeluaran: 10034500, saldo: 80034500, noBukti: 'BKM-05', kodeRekening: '5.1.02.02.01.0003' },
    { bulan: 2, tanggalISO: '2026-02-12', uraian: 'Belanja ATK', tipe: 'PEMBAYARAN', penerimaan: 0, pengeluaran: 3000000, saldo: 77034500, noBukti: 'BPU-02' },
  ]
  const dRKas = (kasDocs({ RK: { bulan: 'Februari' } }, { transactions: txsKas, header: { tahunAnggaran: 2026 } }).find((d) => d.key === 'register-kas') || {}).data || {}
  const logam = (dRKas.rows || []).filter((r) => r.jenis === 'Logam').reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)
  ok('rev9-logam-masuk', logam === 500, `logam=${logam}`)
  ok('rev9-sub2', String(dRKas.subLogamValue || '').includes('500'), dRKas.subLogamValue)
  const txsFeb = [
    { bulan: 2, tanggalISO: '2026-02-05', tipe: 'TARIK_TUNAI', penerimaan: 0, pengeluaran: 10000000, saldo: 80000000, noBukti: 'BKM-01' },
    { bulan: 2, tanggalISO: '2026-02-10', tipe: 'PEMBAYARAN', penerimaan: 0, pengeluaran: 3000000, saldo: 77000000, noBukti: 'BPU-01' },
    { bulan: 2, tanggalISO: '2026-02-28', tipe: 'PEMBAYARAN', penerimaan: 0, pengeluaran: 27000000, saldo: 50000000, noBukti: 'BNU-02' },
  ]
  const bkuFeb = { transactions: txsFeb, header: { tahunAnggaran: 2026 } }
  const ambil = (docs, key) => docs.find((d) => d.key === key)?.data || {}
  const dRK = ambil(kasDocs({ RK: { bulan: 'Februari' } }, bkuFeb), 'register-kas')
  const fisik = (dRK.rows || []).filter((r) => r.jenis === 'Kertas' || r.jenis === 'Logam')
    .reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)
  ok('rev8-tunai-cash-model', fisik === 7000000, `fisik=${fisik}`)
  ok('rev8-bank-otomatis', String(dRK.jumlahTotal || '').includes('50.000.000'), dRK.jumlahTotal)
  ok('rev8-selisih-nol', String(dRK.perbedaan || '').includes('Rp 0'), dRK.perbedaan)
  ok('rev8-saldo-buku', String(dRK.saldoBuku || '').includes('50.000.000'), dRK.saldoBuku)
  const dRK2 = ambil(kasDocs({ RK: { bulan: 'Februari', saldoTunai: '1000000' } }, bkuFeb), 'register-kas')
  const fisik2 = (dRK2.rows || []).filter((r) => r.jenis === 'Kertas' || r.jenis === 'Logam')
    .reduce((s, r) => s + (Number(r.nominal) || 0) * (Number(r.lembar) || 0), 0)
  ok('rev8-override-tunai', fisik2 === 1000000, `fisik=${fisik2}`)
  const dRK3 = ambil(kasDocs({ RK: { bulan: 'Februari', tglTutup: '2026-02-28' } }, bkuFeb), 'register-kas')
  ok('rev8-tgl-indonesia', dRK3.tglTutup === '28 Februari 2026', dRK3.tglTutup)
  const dBAP = ambil(kasDocs({ BAP: { bulan: 'Februari' } }, bkuFeb), 'bap-kas')
  const nominalBap = (u) => (dBAP.rows || []).find((r) => String(r.uraian || '').startsWith(u))?.nominal
  ok('rev8-bap-a', nominalBap('a)') === 7000000, `a=${nominalBap('a)')}`)
  ok('rev8-bap-jumlah', nominalBap('Jumlah') === 50000000, `jml=${nominalBap('Jumlah')}`)
  ok('rev8-bap-selisih', nominalBap('Perbedaan') === 0, `sel=${nominalBap('Perbedaan')}`)
  const dPP = ambil(kasDocs({ PP: { bulan: 'Januari', tempatTtd: 'Bandung Barat', namaMelaporkan: 'X', nipMelaporkan: '1' } }, { transactions: [], header: { tahunAnggaran: 2026 } }), 'pengaduan')
  ok('rev8-pp-ttd', dPP.tempatTtd === 'Bandung Barat' && dPP.namaMelaporkan === 'X' && dPP.nipMelaporkan === '1', `${dPP.tempatTtd}|${dPP.namaMelaporkan}`)
  // ── Sprint 023-rev10: titik TEKS merah + footer identik ──
  const srcPengaduan = baca('components/templates/blocks/LembarPengaduan.jsx')
  const srcKritik = baca('components/templates/blocks/LembarKritikSaran.jsx')
  // ── Sprint 023-rev21: stempel NIHIL + garis diagonal sumber ──
  ok('rev21-stempel', srcPengaduan.includes('/stempel-nihil.png') && srcKritik.includes('/stempel-nihil.png'))
  ok('rev21-sudut', srcPengaduan.includes('rotate(-50.4deg)') && srcKritik.includes('rotate(-43.3deg)'))
  ok('rev21-garis', srcPengaduan.includes('#ED7D31') && srcKritik.includes('#ED7D31') && srcPengaduan.includes('<svg') && srcKritik.includes('<svg'))
  // ── Sprint 023-rev22: garis di ATAS gambar + putih transparan ──
  const idxImgP = srcPengaduan.indexOf('/stempel-nihil.png')
  const idxSvgP = srcPengaduan.indexOf('<svg', idxImgP)
  ok('rev22-urutan-cat', idxImgP > 0 && idxSvgP > idxImgP)
  ok('rev22-multiply', srcPengaduan.includes('mix-blend-multiply') && srcKritik.includes('mix-blend-multiply'))
  // ── Sprint 023-rev26: garis sejajar + setengah NIHIL ──
  ok('rev26-sejajar', srcPengaduan.includes('x1="-13.7" y1="127.1"') && srcKritik.includes('x1="-22.7" y1="118.7"'))
  // ── Sprint 024-rev25: pejabat terhubung di semua dokumen ──
  const toko = {}
  globalThis.localStorage = {
    getItem: (k) => (k in toko ? toko[k] : null),
    setItem: (k, v) => { toko[k] = String(v) },
    removeItem: (k) => { delete toko[k] },
  }
  toko['spj_data_sekolah'] = JSON.stringify({
    namaSekolah: 'SD NEGERI PASIRHALANG', npsn: '20205293',
    nomorRekening: '123', bankRekening: 'BPD', namaRekening: 'SDN',
    pejabat: { ks: { nama: 'Yuniarti', nip: 'N1' }, bendahara: { nama: 'Ahmad', nip: 'N2' } },
  })
  const { getDataPejabat, getDataSekolah } = await import(pathToFileURL(`${dirShim}/templateSuratHelper.js`).href)
  const pj = getDataPejabat()
  ok('rev25-surat-ks', pj.namaKepsek === 'Yuniarti' && pj.nipKepsek === 'N1', `${pj.namaKepsek}|${pj.nipKepsek}`)
  ok('rev25-surat-bend', pj.namaBendahara === 'Ahmad' && pj.nipBendahara === 'N2', `${pj.namaBendahara}|${pj.nipBendahara}`)
  const sk = getDataSekolah()
  ok('rev25-surat-sekolah', sk.namaSekolah === 'SD NEGERI PASIRHALANG' && sk.npsn === '20205293', `${sk.namaSekolah}|${sk.npsn}`)
  const { getSignatureRoles } = await import(pathToFileURL(`${dirShim}/signatureRoles.js`).href)
  const sig = getSignatureRoles()
  ok('rev25-sig-semua', sig['kepala-sekolah']?.nama === 'Yuniarti' && sig['bendahara']?.nama === 'Ahmad', `${sig['kepala-sekolah']?.nama}|${sig['bendahara']?.nama}`)
  // ── Sprint 023-rev27: overlay Pengaduan inset kiri (grup B8:D42) ──
  ok('rev27-inset', srcPengaduan.includes("left: '3.4%'") && !srcKritik.includes("left: '3.4%'"))
  // ── Sprint 023-rev24: kolom pas 4 (field pakai tdB span 1) ──
  const baris6kol = (s) => s.split('\n').some((ln) => ln.includes('tdJudul(') && ln.includes('tdIsi('))
  ok('rev24-kolom-pas', !baris6kol(srcPengaduan) && !baris6kol(srcKritik))
  ok('rev24-tdB', srcPengaduan.includes('tdB(') && srcKritik.includes('tdB('))
  ok('rev10-titik-teks-merah', srcPengaduan.includes("'.'.repeat(112)") && srcPengaduan.includes("'.'.repeat(178)") && srcKritik.includes("'.'.repeat(178)") && srcPengaduan.includes('text-red-600') && srcKritik.includes('text-red-600'))
  ok('rev10-tanpa-border-tanpa-placeholder', !srcPengaduan.includes('border-dotted') && !srcKritik.includes('border-dotted') && !srcPengaduan.includes('PlaceholderText') && !srcKritik.includes('PlaceholderText'))
  ok('rev10-tinggi-baris', srcPengaduan.includes('h-[28px]') && srcKritik.includes('h-[36px]'))
  const txsJan = [
    { bulan: 1, tanggalISO: '2026-01-05', tipe: 'PENERIMAAN_BOSP', penerimaan: 82560000, pengeluaran: 0, saldo: 82560000, noBukti: 'BBU-01' },
    { bulan: 1, tanggalISO: '2026-01-31', tipe: 'PEMBAYARAN', penerimaan: 0, pengeluaran: 1000000, saldo: 81560000, noBukti: 'BNU-01' },
  ]
  const dPPJan = (kasDocs({ RK: { bulan: 'Januari' }, PP: {} }, { transactions: txsJan, header: { tahunAnggaran: 2026 } }).find((d) => d.key === 'pengaduan') || {}).data || {}
  ok('rev10-footer-identik', dPPJan.tempatTtd === 'Bandung Barat, Cikalongwetan, 31 Januari', dPPJan.tempatTtd)
  ok('rev10-periode', String(dPPJan.periode || '').includes('JANUARI') && String(dPPJan.periode || '').includes('2026'), dPPJan.periode)
} catch (e) {
  ok('rev3-pbjDocs', false, String(e).slice(0, 300))
}
try {
  // Shim: salin rantai util ke tmpdir + betulkan import tanpa ekstensi
  // (Vite me-resolve, node tidak) → uji logika ASLI, bukan stub.
  const { writeFileSync, readFileSync: bacaUtil, mkdirSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const shimDir = `${tmpdir()}/shim-s023`
  mkdirSync(shimDir, { recursive: true })
  for (const f of ['aturanPbj.js', 'pbjPrefill.js', 'pbjBkuStore.js', 'lpjBkuStore.js', 'aturanUndangan.js', 'aturanMamin.js', 'storageHelper.js']) {
    writeFileSync(`${shimDir}/${f}`, bacaUtil(`${root}/utils/${f}`, 'utf8')
      .replaceAll(/from '(\.\/[A-Za-z0-9_]+)'/g, `from '$1.js'`))
  }
  const { terapkanPrefillPbj } = await import(pathToFileURL(`${shimDir}/aturanPbj.js`).href)
  const { prefillPbjDariBku } = await import(pathToFileURL(`${shimDir}/pbjPrefill.js`).href)
  const draf = { cocok: true, nomorInvoice: 'INV/001', tanggalInvoiceISO: '2026-10-20',
    grandTotal: 618800, penyedia: { nama: 'Toko Maju', alamat: 'Jl. Raya', npwp: '', kontak: '' },
    items: [{ uraian: 'Kertas HVS', qtyTerima: 5, qtyPesan: 5, hargaSebelumPPN: 100000, totalSebelumPPN: 500000 },
      { uraian: 'Spidol', qtyTerima: 2, qtyPesan: 2, hargaSebelumPPN: 59400, totalSebelumPPN: 118800 }] }
  const { formBaru } = terapkanPrefillPbj({}, { invoice: draf })
  ok('rev-inv-spesifikasi', (formBaru.perencanaan.spesifikasi || '').includes('Kertas HVS') && formBaru.perencanaan.spesifikasi.includes('Spidol'), formBaru.perencanaan.spesifikasi)
  ok('rev-inv-alokasi', String(formBaru.perencanaan.alokasi).includes('618800'), String(formBaru.perencanaan.alokasi))
  ok('rev-inv-tanggal', formBaru.perencanaan.tanggalSurat === '2026-10-20', formBaru.perencanaan.tanggalSurat)
  // Ketikan user tak tertimpa invoice
  const { formBaru: f2 } = terapkanPrefillPbj({ perencanaan: { spesifikasi: 'Ketikan saya' } }, { invoice: draf })
  ok('rev-tak-timpa', f2.perencanaan.spesifikasi === 'Ketikan saya', f2.perencanaan.spesifikasi)
  // Prefill BKU sidebar samakan deep-link Kelengkapan
  const f3 = prefillPbjDariBku({}, { tanggal: '22-10-2026', uraian: 'Konsumsi Rapat Guru', pengeluaran: 500000, noBukti: 'BNU-01' })
  ok('rev-bku-spesifikasi', (f3.perencanaan.spesifikasi || '').includes('Konsumsi Rapat Guru'), f3.perencanaan.spesifikasi)
  ok('rev-bku-alokasi', String(f3.perencanaan.alokasi).includes('500'), String(f3.perencanaan.alokasi))
  // Sprint 023-rev2: backfill entri lama (spesifikasi kosong) ala BKUSidebarLpj
  {
    const lama = { perencanaan: { tanggalSurat: '2026-10-22', kegiatan: 'Rapat X', alokasi: '200.000', spesifikasi: '', nomorSurat: '' } }
    const p = lama.perencanaan
    const adaCelah = [p.spesifikasi, p.kegiatan, p.alokasi, p.tanggalSurat].some((v) => String(v ?? '').trim() === '')
    ok('rev2-celah-terdeteksi', adaCelah === true)
    const f4 = prefillPbjDariBku(lama, { tanggal: '22-10-2026', uraian: 'Konsumsi Rapat Guru', pengeluaran: 200000, noBukti: 'BNU-01' })
    ok('rev2-backfill-spesifikasi', (f4.perencanaan.spesifikasi || '').includes('Konsumsi Rapat Guru'), f4.perencanaan.spesifikasi)
    ok('rev2-kegiatan-tak-timpa', f4.perencanaan.kegiatan === 'Rapat X', f4.perencanaan.kegiatan)
  }
} catch (e) {
  ok('rev-util-import', false, String(e).slice(0, 200))
}

console.log(`\nHASIL: ${pass} PASS / ${fail} FAIL`)
process.exit(fail ? 1 : 0)
