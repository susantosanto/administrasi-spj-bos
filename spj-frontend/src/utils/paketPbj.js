/** paketPbj.js — Sprint 011: helper kurasi baris PBJ + mode SIPLAH (murni, offline).
 * Dipisah dari aturanPbj.js (sudah ~196/200 baris) agar batas Constitution util ≤200 terjaga.
 * Kunci A1: NoBukti normalisasi (trim + lowercase); fallback komposit tanggal|uraian|nominal
 * hanya bila NoBukti kosong. Tanpa auto-tambah, tanpa hapus permanen di sini. */
export const MODE_KEY = 'pbj_mode'
export const ARSIP_KEY = 'pbj_arsip'
export const TOLAK_KEY = 'pbj_keranjang_tolak'

export const normalisasiNoBukti = (s) => String(s || '').trim().toLowerCase()

const nominalTx = (t = {}) => Number(t.nominal ?? t.pengeluaran ?? t.kredit ?? t.penerimaan ?? t.debet ?? 0) || 0
const tglTx = (t = {}) => String(t.tanggalISO || t.tanggalStr || t.tanggal || '').trim()
const uraianTx = (t = {}) => String(t.uraian || '').trim().toLowerCase()

// Kunci identitas transaksi BKU (A1): NoBukti normalisasi, atau fallback komposit.
export function kunciTransaksi(t = {}) {
  const nb = normalisasiNoBukti(t.noBukti)
  if (nb) return `nb:${nb}`
  return `komp:${tglTx(t)}|${uraianTx(t)}|${nominalTx(t)}`
}

// Kunci identitas baris PBJ: nomor acuan (noBukti) normalisasi, atau fallback komposit.
export function kunciBarisPbj(r = {}) {
  const nb = normalisasiNoBukti(r.noBukti ?? r.nomor ?? r.noAcuan)
  if (nb) return `nb:${nb}`
  const tgl = String(r.tanggalISO || r.tglPesanan || r.tanggal || '').trim()
  const uraian = String(r.spesifikasi || r.uraian || '').trim().toLowerCase()
  const nom = Number(r.alokasi ?? r.grandTotal ?? r.total ?? 0) || 0
  return `komp:${tgl}|${uraian}|${nom}`
}

// true bila transaksi BKU sudah dipakai sebagai baris PBJ (kunci A1).
export function isSudahBerdokumen(transaksi = {}, barisPBJ = []) {
  const k = kunciTransaksi(transaksi)
  return (barisPBJ || []).some((r) => kunciBarisPbj(r) === k)
}

// Kandidat keranjang: transaksi PEMBAYARAN yang belum berdokumen + belum ditolak.
export function kandidatKeranjang(transaksiSemua = [], barisPBJ = [], tolakSet = []) {
  const tolak = new Set((tolakSet || []).map(normalisasiNoBukti))
  return (transaksiSemua || [])
    .filter((t) => t?.tipe === 'PEMBAYARAN')
    .filter((t) => !isSudahBerdokumen(t, barisPBJ))
    .filter((t) => !tolak.has(normalisasiNoBukti(t.noBukti)) || !normalisasiNoBukti(t.noBukti))
}

// Task 66 lanjutan: nama bulan dari ISO agar baris tahu "pembelian bulan apa".
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
export function bulanDariISO(iso = '') {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso || '').trim())
  return m ? (BULAN_ID[parseInt(m[2], 10) - 1] || '') : ''
}

// BKU → baris paket PBJ (bentuk invoice-record agar setara pintu lain: expand/edit/arsip).
export function bkuKePaketRow(t = {}, idx = 0) {
  const nominal = nominalTx(t)
  const tglISO = String(t.tanggalISO || '').trim()
  return {
    id: `bku_${Date.now()}_${idx}_${Math.floor(Math.random() * 1e6)}`,
    nomor: String(t.noBukti || '').trim(),
    tanggalISO: tglISO,
    tanggalTampil: String(t.tanggalStr || t.tanggal || '').trim(),
    bulan: bulanDariISO(tglISO),
    jumlahLabel: '1 transaksi BKU',
    spesifikasi: String(t.uraian || '').trim(),
    alokasi: nominal,
    namaPenyedia: '',
    npwp: '',
    alamat: '',
    telp: '',
    grandTotal: nominal,
    sumber: 'BKU',
    items: [{ uraian: String(t.uraian || 'Belanja BKU').trim(), qty: 1, satuan: '', harga: nominal, total: nominal }],
    namaFile: '',
  }
}

// Manual (subset esensial A5) → baris paket setara penuh.
export function manualKePaketRow({ uraian = '', qty = 1, harga = 0, tanggalISO = '', penyedia = '', noAcuan = '' } = {}) {
  const q = Number(qty) || 0
  const h = Number(harga) || 0
  return {
    id: `manual_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    nomor: String(noAcuan || '').trim(),
    tanggalISO: String(tanggalISO || '').trim(),
    tanggalTampil: String(tanggalISO || '').trim(),
    bulan: bulanDariISO(String(tanggalISO || '').trim()),
    jumlahLabel: '1 item manual',
    spesifikasi: String(uraian || '').trim(),
    alokasi: q * h,
    namaPenyedia: String(penyedia || '').trim(),
    npwp: '',
    alamat: '',
    telp: '',
    grandTotal: q * h,
    sumber: 'Manual',
    items: [{ uraian: String(uraian || '').trim(), qty: q, satuan: '', harga: h, total: q * h }],
    namaFile: '',
  }
}

// Arsip halus (murni): hapus = pindah ke arsip; kembali = pulihkan.
export function arsipkanBaris(list = [], arsip = [], idx = -1) {
  if (idx < 0 || idx >= list.length) return { list, arsip, pindah: null }
  const pindah = list[idx]
  return { list: list.filter((_, i) => i !== idx), arsip: [...arsip, pindah], pindah }
}
export function kembalikanBaris(list = [], arsip = [], idx = -1) {
  if (idx < 0 || idx >= arsip.length) return { list, arsip, kembali: null }
  const kembali = arsip[idx]
  return { list: [...list, kembali], arsip: arsip.filter((_, i) => i !== idx), kembali }
}

// Mode: SIPLAH = hanya Perencanaan; NON = keenam dokumen. Toggle tak menghapus isian.
export function terapkanMode(pbjForm = {}, mode = 'non') {
  const SEMUA = ['perencanaan', 'pesanan', 'bahp', 'bast', 'nego', 'data']
  const aktif = mode === 'siplah' ? ['perencanaan'] : SEMUA
  const formTampil = {}
  for (const k of SEMUA) formTampil[k] = pbjForm?.[k] || {}
  return { formTampil, gateDocs: aktif }
}

// Task 66: panel ambil BKU Cari+centang — helper tanggal/nominal/grup (murni).
export const nominalBku = (t = {}) => nominalTx(t)
export function isoBku(t = {}) {
  const iso = String(t.tanggalISO || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(String(t.tanggalStr || t.tanggal || '').trim())
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}
// Daftar ringkas per NoBukti: 1 grup = semua transaksi se-NoBukti (normalisasi).
// Tanpa NoBukti = tiap transaksi grup sendiri (pakai row agar stabil).
export function grupBkuPerNoBukti(list = []) {
  const grup = new Map()
  for (const t of (list || [])) {
    const nb = String(t?.noBukti || '').trim()
    const key = nb ? `nb:${nb.toLowerCase()}` : `row:${t?.row ?? `${t?.uraian || ''}|${nominalTx(t)}`}`
    if (!grup.has(key)) grup.set(key, { key, noBukti: nb || '(tanpa No. Bukti)', items: [], total: 0 })
    const g = grup.get(key)
    g.items.push(t)
    g.total += nominalTx(t)
  }
  return [...grup.values()]
}

export default { normalisasiNoBukti, kunciTransaksi, kunciBarisPbj, isSudahBerdokumen, kandidatKeranjang, bkuKePaketRow, manualKePaketRow, arsipkanBaris, kembalikanBaris, terapkanMode, nominalBku, isoBku, grupBkuPerNoBukti, bulanDariISO }
