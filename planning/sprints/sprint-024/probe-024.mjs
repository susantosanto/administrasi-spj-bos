// probe-024.mjs — Sprint 024: agregat vs rpd-k7-output.pdf Tahap 1.
import fs from 'node:fs'
import os from 'node:os'
import { pathToFileURL } from 'node:url'

global.FileReader = class {
  readAsArrayBuffer(file) {
    const buf = fs.readFileSync(file.__path)
    this.result = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    setTimeout(() => this.onload({ target: this }), 0)
  }
}
const root = 'D:/project/spj-app/spj-frontend/src'
const dir = os.tmpdir() + '/shim-s024'
fs.mkdirSync(dir, { recursive: true })
const fix = (s) => s
  .replaceAll(/from '(\.\/[A-Za-z0-9_]+)'/g, `from '$1.js'`)
  .replaceAll(/from '\.\.\/(?:data|utils)\/([A-Za-z0-9_]+)'/g, `from './$1.js'`)
  .replaceAll(`from 'xlsx'`, `from 'file:///D:/project/spj-app/spj-frontend/node_modules/xlsx/xlsx.mjs'`)
for (const [s, n] of [['utils/bkuParser.js', 'bkuParser.js'], ['utils/realisasiPeta.js', 'realisasiPeta.js'], ['utils/realisasiAgregat.js', 'realisasiAgregat.js'], ['utils/storageHelper.js', 'storageHelper.js'], ['utils/dokKas.js', 'dokKas.js'], ['data/kodeReferensi.js', 'kodeReferensi.js'], ['utils/verifikasiKs.js', 'verifikasiKs.js'], ['utils/previewDocs.js', 'previewDocs.js'], ['utils/bkuHelper.js', 'bkuHelper.js'], ['utils/signatureRoles.js', 'signatureRoles.js'], ['utils/sekolahData.js', 'sekolahData.js'], ['utils/pejabatRoles.js', 'pejabatRoles.js'], ['utils/tempatTtd.js', 'tempatTtd.js'], ['utils/aturanMamin.js', 'aturanMamin.js'], ['utils/aturanPbj.js', 'aturanPbj.js'], ['utils/aturanUndangan.js', 'aturanUndangan.js'], ['utils/dokPajak.js', 'dokPajak.js'], ['utils/pbjBkuStore.js', 'pbjBkuStore.js'], ['utils/lpjBkuStore.js', 'lpjBkuStore.js'], ['utils/sekolahParser.js', 'sekolahParser.js'], ['data/templateConfig.js', 'templateConfig.js'], ['data/skPasal.js', 'skPasal.js']]) {
  fs.writeFileSync(`${dir}/${n}`, fix(fs.readFileSync(`${root}/${s}`, 'utf8')))
}
const { parseBKUExcel } = await import(pathToFileURL(`${dir}/bkuParser.js`).href)
const { agregatRealisasi } = await import(pathToFileURL(`${dir}/realisasiAgregat.js`).href)

let pass = 0, fail = 0
const ok = (nama, kond, info = '') => {
  if (kond) { pass++; console.log(`PASS ${nama}`) }
  else { fail++; console.log(`FAIL ${nama} ${info}`) }
}

// Matriks PDF Tahap 1 (rpd-k7-output.pdf), baris × kolom.
const PDF = [
  [0, 1200000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [600000, 0, 13418000, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 6950000, 0, 0, 0, 0, 0, 0],
  [0, 16916900, 0, 0, 700000, 0, 0, 600000, 0, 0, 0, 0],
  [0, 0, 0, 0, 17911100, 0, 3000000, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 750000, 0, 0, 0, 0, 0, 0, 16200000],
  [0, 0, 0, 4314000, 0, 0, 0, 0, 0, 0, 0, 0],
]

const res = await parseBKUExcel({ __path: 'D:/project/spj-app/template-data/Realisasi Sekolah Buku Kas Umum (BKU) - Manajemen Aplikasi RKAS - 2026.xlsx', name: 'bku.xlsx' })
const a = agregatRealisasi(res.transactions, { tahap: 1 })
let selBed = 0
for (let i = 0; i < 7; i++) {
  for (let k = 0; k < 12; k++) {
    if (a.matrix[i][k] !== PDF[i][k]) {
      selBed++
      if (selBed <= 10) console.log(`  sel[${i}][${k}]: app=${a.matrix[i][k]} pdf=${PDF[i][k]}`)
    }
  }
}
ok('T1-matriks-sama-pdf', selBed === 0, `${selBed} sel beda`)
ok('T1-total', a.total === 82560000, `total=${a.total}`)
ok('T1-selisih-nol', a.selisih === 0, `selisih=${a.selisih} belum=${a.belum.length}`)

// ── T-4/T-5: builder cetak (node, tanpa DOM) ──
const { realisasiDocs, instrumenDocs } = await import(pathToFileURL(`${dir}/previewDocs.js`).href)
const rd = realisasiDocs({ tahun: '2026', tahap: 1, txs: res.transactions, koreksi: {}, sumberDana: 'BOS Reguler Revisi Anggaran Ke 3', periode: '01 Januari 2026 s/d 30 Juni 2026' })
ok('T4-dok-ada', rd.length === 1 && rd[0].key === 'realisasi-t1', rd.map((d) => d.key).join(','))
ok('T4-grand-total', rd[0]?.data?.grandTotal === 82560000, `grand=${rd[0]?.data?.grandTotal}`)
ok('T4-footer', String(rd[0]?.data?.totalTerima).includes('82.560.000') && String(rd[0]?.data?.saldoLalu) === '0', `${rd[0]?.data?.saldoLalu}|${rd[0]?.data?.totalTerima}`)
ok('T4-template', rd[0]?.templateConfig?.blocks?.some((b) => b.type === 'realisasi-tabel') === true)
const agT2 = agregatRealisasi(res.transactions, { tahap: 2 })
const idoc = instrumenDocs({ tahun: '2026', instrumen: { a: { namaSekolah: 'SDN X' }, b: { skNomor: 'SK/1' }, c: { perSiswa: '1000000', jmlSiswa: '100' }, e: { saldoAwal: '0', pembukuan: ['BKU', 'Pajak'] } }, agT1: a, agT2, txs: res.transactions })
ok('T5-dok-ada', idoc.length === 1 && idoc[0]?.templateConfig?.blocks?.some((b) => b.type === 'instrumen-bos') === true)
ok('T5-seksi-c', idoc[0]?.data?.c?.total === '100000000', `total=${idoc[0]?.data?.c?.total}`)
ok('T5-seksi-d', (idoc[0]?.data?.dJumlah?.total || 0) === 82560000, `d=${idoc[0]?.data?.dJumlah?.total}`)
ok('T5-pajak', (idoc[0]?.data?.e?.pajakSisa ?? null) === 0, `sisa=${idoc[0]?.data?.e?.pajakSisa}`)

// ── T-8: blanko premium terdaftar ──
const { TEMPLATE_CONFIGS } = await import(pathToFileURL(`${dir}/templateConfig.js`).href)
ok('T8-dh', TEMPLATE_CONFIGS.daftar_hadir_blanko?.blocks?.some((b) => b.type === 'daftar-hadir') === true)
ok('T8-su', TEMPLATE_CONFIGS.surat_undangan_blanko?.blocks?.some((b) => b.type === 'undangan-blanko') === true)

// ── T-6: profil Dapodik → Seksi A ──
const { parseSekolahExcel } = await import(pathToFileURL(`${dir}/sekolahParser.js`).href)
// ── T-7: verifikasi KS vs Guru/Tendik ──
const tokoKs = {
  spj_data_guru: JSON.stringify([{ nama: 'Yuniarti, S.Pd', nip: '196607071986102005', status: 'PNS' }]),
  spj_data_tendik: JSON.stringify([{ nama: 'AHMAD, S.Pd', nip: '196805251992121003', status: 'PNS' }]),
}
globalThis.localStorage = {
  getItem: (k) => (k in tokoKs ? tokoKs[k] : null),
  setItem: (k, v) => { tokoKs[k] = String(v) },
  removeItem: (k) => { delete tokoKs[k] },
}
const { verifikasiKs, normalNama } = await import(pathToFileURL(`${dir}/verifikasiKs.js`).href)
ok('T7-cocok', (() => { const h = verifikasiKs('Yuniarti', '196607071986102005'); return h.status === 'cocok' && h.nip === 'sama' })(), 'ks vs guru')
ok('T7-gelar', normalNama('Yuniarti, S.Pd') === 'yuniarti', normalNama('Yuniarti, S.Pd'))
ok('T7-mirip', (() => { const h = verifikasiKs('Yuni'); return h.status === 'mirip' && h.kandidat.length > 0 })(), 'mirip')
ok('T7-takditemukan', verifikasiKs('NAMA ASING SEKALI').status === 'tak-ditemukan', 'asing')
ok('T7-nip-beda', verifikasiKs('Ahmad', '000').nip === 'beda', 'nip beda')
const prof = await parseSekolahExcel({ __path: 'D:/project/spj-app/template-data/profil-SD NEGERI PASIRHALANG-2026-07-10 08_15_16.xlsx', name: 'profil.xlsx' })
const HH = prof.header
ok('T6-rekening', HH.nomorRekening === '0011628524101' && String(HH.bankRekening).includes('BPD JABAR') && String(HH.namaRekening).includes('SDNPASIRHALANG'), `${HH.nomorRekening}|${HH.bankRekening}|${HH.namaRekening}`)
ok('T6-kontak', String(HH.telepon).includes('081809517491') && String(HH.email).includes('sdnpasirhalang123'), `${HH.telepon}|${HH.email}`)
ok('T6-status-ijin', String(HH.status).includes('Negeri') && String(HH.ijin).length > 0, `${HH.status}|${HH.ijin}`)
ok('T6-guru', Number(HH.jmlGuru) >= 4 && Number(HH.jmlGuruPns) >= 1, `guru=${HH.jmlGuru} pns=${HH.jmlGuruPns} non=${HH.jmlGuruNonAsn}`)
ok('T6-tendik-siswa', Number(HH.jmlTendik) >= 1 && Number(HH.jmlSiswa) === 190, `tendik=${HH.jmlTendik} siswa=${HH.jmlSiswa}`)

console.log(`\nHASIL: ${pass} PASS / ${fail} FAIL`)
process.exit(fail ? 1 : 0)
