/**
 * bkuPeriode.js — Sprint 025: akumulasi BKU PDF per periode (bulan/semester/tahunan).
 *
 * Fungsi MURNI: tanpa React, tanpa storage, tanpa efek samping.
 * Baris yang digabung selalu membawa { periodeMode, periode } agar ganti
 * per-periode dan audit memungkinkan. Kunci `spj_bku_data` TIDAK berubah.
 */

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// Tipe baris yang dikecualikan dari agregat penerimaan/pengeluaran gabungan
// (saldo awal bulan, bunga/pajak bunga nol) — definisi sama dengan ADR §T.
export const TIPE_NON_AGREGAT = ['SALDO_AWAL', 'BUNGA_BANK', 'PAJAK_BUNGA']

const angka = (n) => Number(n) || 0

/** Semester ikut Tahap BOS (keputusan user Sprint 025 Q-1 opsi B). */
export function semesterDariBulan(bulan) {
  const b = Number(bulan)
  if (!(b >= 1 && b <= 12)) return ''
  return b <= 6 ? 'S1' : 'S2'
}

/** Nama bulan Indonesia → nomor (untuk kop "BULAN : MARET"). */export function bulanDariNama(nama) {
  const s = String(nama || '').toLowerCase().trim()
  const peta = {
    januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
    juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agu: 8, ags: 8,
    sep: 9, sept: 9, okt: 10, nov: 11, des: 12,
  }
  return peta[s] || ''
}

export function namaBulan(bulan) {
  const b = Number(bulan)
  return b >= 1 && b <= 12 ? NAMA_BULAN[b - 1] : ''
}

const pad2 = (n) => String(n).padStart(2, '0')

/**
 * Kunci periode kanonis: 'bulan:2026-03' | 'semester:2026-S1' | 'tahunan:2026'.
 */
export function kunciPeriode(mode, sel) {
  const tahun = String(sel?.tahun || '')
  if (!tahun) return ''
  if (mode === 'bulanan') {
    const b = Number(sel?.bulan)
    if (!(b >= 1 && b <= 12)) return ''
    return `bulan:${tahun}-${pad2(b)}`
  }
  if (mode === 'semester') {
    const s = sel?.semester === 'S2' ? 'S2' : 'S1'
    return `semester:${tahun}-${s}`
  }
  if (mode === 'tahunan') return `tahunan:${tahun}`
  return ''
}

export function labelPeriode(mode, sel) {
  const tahun = sel?.tahun || ''
  if (mode === 'bulanan') return `${namaBulan(sel?.bulan)} ${tahun}`.trim()
  if (mode === 'semester') return `Semester ${sel?.semester === 'S2' ? '2' : '1'} ${tahun}`.trim()
  if (mode === 'tahunan') return `Tahun ${tahun}`.trim()
  return ''
}

/** Cap periode pada tiap baris (objek baru, input utuh). */
export function tandaiPeriode(rows, mode, kunci) {
  return (rows || []).map((r) => ({ ...r, periodeMode: mode, periode: kunci }))
}

/** Kunci urut tanggal: ISO dulu, lalu DD-MM-YYYY, lalu string apa adanya. */
function kunciTanggal(r) {
  const iso = r.tanggalISO || ''
  if (/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso.slice(0, 10)
  const s = String(r.tanggalStr || '').trim()
  const m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(s)
  if (m) {
    let y = Number(m[3]); if (y < 100) y += 2000
    return `${y}-${pad2(m[2])}-${pad2(m[1])}`
  }
  return s
}

/** Urut kronologis stabil (seri tanggal sama = urutan baca PDF). */
export function urutKronologis(rows) {
  return (rows || [])
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const ka = kunciTanggal(a.r); const kb = kunciTanggal(b.r)
      if (ka < kb) return -1
      if (ka > kb) return 1
      return a.i - b.i
    })
    .map((x) => x.r)
}

/**
 * Gabung dataset per periode.
 * - tahunan → SELURUH data diganti isi baru (destuktif, dikonfirmasi di UI).
 * - bulanan/semester → periode kunci diganti, periode lain utuh, hasil terurut.
 * @returns {{ rows: Array, aksi: 'tambah'|'ganti'|'ganti-semua'|'lewati', barisDiganti: number }}
 */
export function mergePeriode(lama, baru, { mode, kunci }) {
  const lamaArr = lama || []
  const baruTagged = tandaiPeriode(baru || [], mode, kunci)
  if (mode === 'tahunan') {
    return { rows: urutKronologis(baruTagged), aksi: 'ganti-semua', barisDiganti: lamaArr.length }
  }
  const sisa = lamaArr.filter((r) => r.periode !== kunci)
  const diganti = lamaArr.length - sisa.length
  return {
    rows: urutKronologis([...sisa, ...baruTagged]),
    aksi: diganti > 0 ? 'ganti' : 'tambah',
    barisDiganti: diganti,
  }
}

/** Hash FNV-1a hex dari bytes file — deteksi upload ulang file identik. */
export function hashBytes(u8) {
  let h = 0x811c9dc5
  for (let i = 0; i < (u8?.length || 0); i++) {
    h ^= u8[i]
    h = Math.imul(h, 0x01000193)
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8)
}

/** Bulan mayoritas baris — untuk cek kop PDF vs periode pilihan (AC-8). */
export function modusBulan(rows) {
  const hit = new Map()
  for (const r of rows || []) {
    const b = Number(r.bulan); const t = Number(r.tahun)
    if (!(b >= 1 && b <= 12) || !t) continue
    const k = `${t}-${pad2(b)}`
    hit.set(k, (hit.get(k) || 0) + 1)
  }
  let best = ''; let n = 0
  for (const [k, c] of hit) if (c > n) { best = k; n = c }
  if (!best) return null
  const [tahun, bln] = best.split('-')
  return { bulan: Number(bln), tahun: Number(tahun) }
}

/**
 * Agregat SEMANTIK PDF: jumlah kolom penerimaan/pengeluaran apa adanya,
 * persis seperti baris "Jumlah" PDF bulanan (termasuk saldo awal bulan
 * dan setor/terima PPh). Dipakai untuk validasi angka vs PDF (FR-9).
 * Catatan: baris BUNGA_BANK/PAJAK_BUNGA bernilai 0 tidak mengubah jumlah.
 */
export function agregatPdf(rows) {
  let masuk = 0; let keluar = 0
  for (const r of rows || []) {
    masuk += angka(r.penerimaan)
    keluar += angka(r.pengeluaran)
  }
  const jumlah = (rows || []).length
  const urut = urutKronologis(rows || [])
  const saldoAkhir = urut.length ? angka(urut[urut.length - 1].saldo) : 0
  return { masuk, keluar, jumlah, saldoAkhir }
}
export function agregatMurni(rows) {
  let masuk = 0; let keluar = 0; let jumlah = 0
  for (const r of rows || []) {
    if (TIPE_NON_AGREGAT.includes(r.tipe)) continue
    jumlah++
    if (r.tipe === 'PENERIMAAN_BOSP') masuk += angka(r.penerimaan)
    if (r.tipe === 'PEMBAYARAN') keluar += angka(r.pengeluaran)
  }
  const urut = urutKronologis(rows || [])
  const saldoAkhir = urut.length ? angka(urut[urut.length - 1].saldo) : 0
  return { masuk, keluar, jumlah, saldoAkhir }
}

/**
 * Periode dibaca MURNI dari PDF (Rev3: tanpa pemilih manual).
 * Sumber: kop ("BULAN : X", tahun) → fallback bulan mayoritas baris.
 * Semester diturunkan dari bulan (Tahap BOS). Tak terdeteksi → null.
 */
export function deteksiPeriodeDariPdf(baris, kop) {
  const modus = modusBulan(baris)
  const tahun = Number(kop?.tahun) || modus?.tahun || null
  const bulan = Number(kop?.bulan) || modus?.bulan || null
  if (!bulan || !tahun) return null
  return { bulan, tahun, semester: semesterDariBulan(bulan) }
}
