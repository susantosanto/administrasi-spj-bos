/**
 * bkuPdfTeks.js — Sprint 015 · M3c: pecah baris jadi kolom teks.
 *
 * Pisahan dari bkuPdfLayout.js (geometri: baris, kolom uang) dan
 * bkuPdfParser.js (bentuk TransactionRow). Modul ini murni: "token teks
 * ini kolom mana".
 *
 * Empat kolom teks tabel BKU: KODE KEGIATAN, KODE REKENING, NO BUKTI,
 * URAIAN. Tidak ada koordinat kolom yang di-hardcode — semua diturunkan
 * dari posisi token hasil OCR.
 */
import { isTanggal } from './bkuPdfTanggal.js'
import { isNominal, TOL_EDGE } from './bkuPdfLayout.js'

// Celah x (px) yang memisahkan dua kolom teks. Dari data nyata: celah
// antar-kolom (BKU -> URAIAN) ~99 px, celah antar-kata di dalam uraian
// 56-75 px.
const CELAH_KOLOM = 80
const RE_KODE = /^\d+(?:\.\d+)+\.?$/
const RE_KODE_POLOS = /^\d{1,3}$/
const titikKode = (s) => (s.replace(/\.$/, '').match(/\./g) || []).length

/**
 * Pecah token teks satu baris jadi kode kegiatan / kode rekening /
 * no bukti / uraian.
 *
 * @param {{items:Array}} baris
 * @param {number[]} edges tepi kolom uang hasil kalibrasi
 * @returns {{kodeKegiatan:string, kodeRekening:string, noBukti:string, uraian:string}}
 */
export function pisahTeks(baris, edges = []) {
  const keg = [], rek = [], polos = [], sisa = []
  for (const it of baris.items) {
    const s = it.str.trim()
    if (isTanggal(s)) continue
    // Token di kolom uang dikeluarkan: nilai "0." / "0" (sel kosong yang
    // masih terbaca) akan masuk ke kolom uraian dan mengotori uraian.
    if (edges.some((e) => Math.abs((it.x + it.w) - e) <= TOL_EDGE)) continue
    if (RE_KODE.test(s) && titikKode(s) >= 3) rek.push(s)
    else if (RE_KODE.test(s)) keg.push(s)
    else sisa.push(it)
  }
  // Pecah token teks jadi grup berdasarkan celah x. Kolom URAIAN adalah
  // grup TERBANYAK token (kolom uraian paling lebar); token di grup
  // sebelumnya = NO BUKTI.
  //
  // Kenapa bukan "celah terbesar"? Celah antar-kata di dalam uraian bisa
  // lebih besar dari celah antar-kolom ("Desember"->"2025" = 107 px, tapi
  // celah BKU->URAIAN cuma 99 px). Memakai celah terbesar memotong kata
  // pertama uraian ke kolom bukti. Grup terbesar jauh lebih stabil.
  const grup = []
  let g = []
  for (const it of sisa) {
    if (g.length && it.x - g[g.length - 1].x > CELAH_KOLOM) { grup.push(g); g = [] }
    g.push(it)
  }
  if (g.length) grup.push(g)
  const lebar = (arr) => arr.reduce((a, it) => a + it.w, 0)
  const utama = grup.reduce(
    (a, b) => (b.length > a.length || (b.length === a.length && lebar(b) > lebar(a)) ? b : a),
    [],
  )
  const mulai = utama.length ? utama[0].x : Infinity
  // Uraian = dari grup utama ke kanan (kalau ada celah besar di dalam
  // uraian, mis. "Desember 2025", kata setelahnya tetap bagian uraian).
  // Angka di dalam uraian ("Tahap 1", "2026") TIDAK dibuang sebagai nominal
  // — hanya kolom uang (diposisi) yang dikeluarkan di atas.
  const bukti = [], uraian = []
  for (const it of sisa) {
    if (it.x < mulai) {
      const s = it.str.trim()
      if (RE_KODE_POLOS.test(s)) polos.push(s)
      else bukti.push(s)
    } else uraian.push(it.str.trim())
  }
  let kodeRekening = rek.join('').replace(/\.$/, '')
  if (!kodeRekening && polos.length === 1) kodeRekening = polos[0]
  return {
    kodeKegiatan: keg.join('').replace(/\.$/, ''),
    kodeRekening,
    noBukti: bukti.join(' ').trim(),
    uraian: uraian.join(' ').replace(/\s+/g, ' ').trim(),
  }
}

export default { pisahTeks }
