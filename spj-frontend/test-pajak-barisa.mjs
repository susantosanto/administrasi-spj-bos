/**
 * Oracle sementara — sprint-014 Laporan Rincian Pajak (T-02..T-06 + asumsi).
 * Bundel: npx esbuild test-pajak-barisa.mjs --bundle --platform=node --format=esm --outfile=tmp-pajak-oracle.mjs
 * Jalankan: node tmp-pajak-oracle.mjs  → PASS/FAIL + exit code. DIHAPUS setelah dipakai.
 */
import { barisPajakDariBku, tahunPajak, totalKolomPajak, kunciBarisPajak, JENIS_PAJAK } from './src/utils/dokPajak.js'

let fail = 0
const cek = (nama, aktual, harapan) => {
  const ok = JSON.stringify(aktual) === JSON.stringify(harapan)
  if (!ok) fail++
  console.log(`${ok ? 'PASS' : 'FAIL'} ${nama}${ok ? '' : ` → dapat ${JSON.stringify(aktual)}, harap ${JSON.stringify(harapan)}`}`)
}

// ─── Fixture: cermin contoh (Februari→Juni) + tepi ───
const TX = [
  // Juni (bulan 6) — sengaja di depan untuk uji sort
  { tanggalISO: '2026-06-29', bulan: 6, uraian: 'Pelaksanaan PPDB', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-29' },
  { tanggalISO: '2026-06-07', bulan: 6, uraian: 'Ekstrakurikuler Pramuka', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-07' },
  // Februari (bulan 2)
  { tanggalISO: '2026-02-07', bulan: 2, uraian: 'Pendaftaran KKG/MGMP', pengeluaran: 62000, tipe: 'SETOR_PAJAK', noBukti: 'B-01' },
  { tanggalISO: '2026-02-14', bulan: 2, uraian: 'Silabus / TP', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-02' },
  // Pajak bunga bank (PAJAK_BUNGA) — termasuk
  { tanggalISO: '2026-03-01', bulan: 3, uraian: 'Pajak bunga bank', pengeluaran: 12000, tipe: 'PAJAK_BUNGA', noBukti: 'B-03' },
  // Maret (bulan 3)
  { tanggalISO: '2026-03-10', bulan: 3, uraian: 'Tes kemampuan akademik', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-04' },
  // TEPI — harus DIKECUALIKAN:
  { tanggalISO: '2026-03-11', bulan: 3, uraian: 'Pungut PPh honor', penerimaan: 5000, pengeluaran: 0, tipe: 'PUNGUT_PPH', noBukti: 'B-05' },
  { tanggalISO: '2026-03-12', bulan: 3, uraian: 'Beli ATK', pengeluaran: 100000, tipe: 'PEMBAYARAN', noBukti: 'B-06' },
  { tanggalISO: '2026-03-13', bulan: 3, uraian: 'Setor pajak nilai 0', pengeluaran: 0, tipe: 'SETOR_PAJAK', noBukti: 'B-07' },
  { tanggalISO: '2026-04-01', bulan: 4, uraian: 'Komunitas belajar', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-08' },
  { tanggalISO: '2026-05-01', bulan: 5, uraian: 'Monitoring program', pengeluaran: 24000, tipe: 'SETOR_PAJAK', noBukti: 'B-09' },
]

// T-02/T-03: cakupan — hanya SETOR_PAJAK/PAJAK_BUNGA dengan pengeluaran > 0
const rows = barisPajakDariBku(TX, {}, { namaSekolah: 'SD Negeri Pasirhalang', jenjang: 'Sekolah Dasar' })
cek('T-02 jumlah baris', rows.length, 8)
cek('T-03 semua baris bertipe pajak & pengeluaran>0',
  rows.every((r) => ['SETOR_PAJAK', 'PAJAK_BUNGA'].includes(r._tipe) && r.nilai > 0), true)

// Urutan: bulan asc lalu tanggal asc (Februari→Juni; dalam Juni 07 sebelum 29)
cek('sort bulan→tanggal', rows.map((r) => `${r.bulan}/${r._tanggalISO.slice(8)}`),
  ['Februari/07', 'Februari/14', 'Maret/01', 'Maret/10', 'April/01', 'Mei/01', 'Juni/07', 'Juni/29'])
cek('nomor urut', rows.map((r) => r.no), [1, 2, 3, 4, 5, 6, 7, 8])
cek('nama sekolah per baris', rows.every((r) => r.namaSekolah === 'SD Negeri Pasirhalang'), true)
cek('jenjang dari opts', rows.every((r) => r.jenjang === 'Sekolah Dasar'), true)
cek('bulan nama Indonesia', [...new Set(rows.map((r) => r.bulan))], ['Februari', 'Maret', 'April', 'Mei', 'Juni'])

// T-04: nilai = pengeluaran APA ADA
cek('T-04 nilai baris', rows.map((r) => r.nilai), [62000, 24000, 12000, 24000, 24000, 24000, 24000, 24000])

// A4: tanpa default — kolom pajak kosong, Total tetap tampil
cek('A4 tanpa default jenis', rows.every((r) => r.jenis === '' && r.pph21 === 0 && r.pph23 === 0 && r.ppn === 0), true)
cek('A4 total selalu tampil', rows.map((r) => r.total), [62000, 24000, 12000, 24000, 24000, 24000, 24000, 24000])
cek('TANGGAL BAYAR otomatis dari BKU', rows[0].tglBayar, '2026-02-07')
cek('kolom manual kosong', rows.every((r) => r.tglNtpn === '' && r.ntpn === '' && r.kodeBilling === '' && r.keterangan === ''), true)

// T-06: isian manual (kunci stabil) menang per field + pindah kolom pajak
const JENIS_PER_URAIAN = {
  'Pendaftaran KKG/MGMP': 'PPh 23',
  'Silabus / TP': 'PPN',
  'Pajak bunga bank': 'PPN',
  'Tes kemampuan akademik': 'PPN',
  'Komunitas belajar': 'PPN',
  'Monitoring program': 'PPN',
  'Ekstrakurikuler Pramuka': 'PPN',
  'Pelaksanaan PPDB': 'PPh 23',
}
const manual = {}
for (const r of rows) {
  const tx = TX.find((t) => t.uraian === r.uraian)
  manual[kunciBarisPajak(tx)] = {
    jenis: JENIS_PER_URAIAN[r.uraian],
    tglBayar: '', tglNtpn: '2026-06-08', ntpn: 'A9C931Q1AFSJOVDR',
    kodeBilling: '042153756556731', keterangan: 'Feb',
  }
}
manual[kunciBarisPajak(TX.find((t) => t.uraian === 'Pendaftaran KKG/MGMP'))].tglBayar = '2026-02-09'
const rowsM = barisPajakDariBku(TX, manual, { namaSekolah: 'SD', jenjang: 'SD' })
cek('T-06 manual: jenis PPh 23 → kolom PPh 23', [rowsM[0].jenis, rowsM[0].pph23, rowsM[0].ppn], ['PPh 23', 62000, 0])
cek('T-06 manual: jenis PPN → kolom PPN', [rowsM[1].jenis, rowsM[1].pph21, rowsM[1].ppn], ['PPN', 0, 24000])
cek('T-06 manual menang: tglBayar', rowsM[0].tglBayar, '2026-02-09')
cek('T-06 manual: tglBayar tanpa isian tetap BKU', rowsM[1].tglBayar, '2026-02-14')
cek('T-06 manual: NTPN/kode/keterangan', [rowsM[0].ntpn, rowsM[0].kodeBilling, rowsM[0].tglNtpn, rowsM[0].keterangan],
  ['A9C931Q1AFSJOVDR', '042153756556731', '2026-06-08', 'Feb'])

// T-05: total kolom = SUM per kolom + Total
const t = totalKolomPajak(rowsM)
cek('T-05 total PPh 23', t.pph23, 86000)
cek('T-05 total PPN', t.ppn, 132000)
cek('T-05 total PPh 21/22', [t.pph21, t.pph22], [0, 0])
cek('T-05 grand total', t.total, 62000 + 24000 + 12000 + 24000 + 24000 + 24000 + 24000 + 24000)

// Tahun judul: form menang; else tahun transaksi tertinggi
cek('tahun: form menang', tahunPajak(rows, '2027'), '2027')
cek('tahun: dari transaksi', tahunPajak(rows, ''), '2026')
cek('tahun: tanpa data', tahunPajak([], ''), '')

// Kunci manual stabil: sama walau urutan array beda
const k1 = kunciBarisPajak(TX[0])
const k2 = kunciBarisPajak({ ...TX[0] })
cek('kunci baris stabil', k1 === k2 && k1 === '2026-06-29|Pelaksanaan PPDB|24000|B-29', true)

// BKU kosong → 0 baris, tidak crash
cek('BKU kosong aman', barisPajakDariBku([], {}, {}).length, 0)
cek('transaksi undefined aman', barisPajakDariBku(undefined, undefined, undefined).length, 0)
cek('JENIS_PAJAK 4 opsi', JENIS_PAJAK, ['PPh 21', 'PPh 22', 'PPh 23', 'PPN'])

console.log(fail === 0 ? '\nSEMUA PASS' : `\n${fail} FAIL`)
process.exit(fail ? 1 : 0)
