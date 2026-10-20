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
 * Pola noBukti BKU yang sah: 2-4 huruf kapital diikuti 1-3 digit
 * (BNU01, BBU02, BPU11, BNU100). Tidak ada spasi, huruf kecil, atau
 * tanda baca lain. Pola ini dipakai untuk MENOLAK noBukti yang sebenarnya
 * adalah kebocoran teks uraian (mis. "BNU12 Set)", "dalam pembelajaran",
 * atau kalimat pajak utuh) yang masuk ke kolom bukti saat sel bukti kosong.
 */
const POLA_NOBUKTI = /^[A-Z]{2,4}\d{1,3}$/

/** Tolak noBukti yang tercemar teks uraian; kembalikan '' bila tidak sah. */
export function rapikanNoBukti(s) {
  const v = String(s || '').trim()
  if (!v) return ''
  if (POLA_NOBUKTI.test(v)) return v
  // Sel bukti kosong tapi ada teks uraian yang bocor ke kiri. Ambil HANYA
  // kode yang sah di depan, buang sisa teksnya.
  //
  // PENTUNG: jangan jadi '' kalau ada kode sah. noBukti emptied = aturan
  // deteksi tipe di bkuParser.js ikut berubah (BNU/BPU -> PEMBAYARAN
  // jadi TARIK_TUNAI) sehingga total pengeluaran ikut turun. Bukti:
  // "BNU12 Set)" harus tetap "BNU12".
  const m = v.match(/^[A-Z]{2,4}\d{1,3}(?![\dA-Za-z])/)
  return m ? m[0] : ''
}

/**
 * Pemulihan spasi & koreksi artefak OCR pada uraian. OCR (DPI 200) sering
 * melebur dua kata bila spasinya sempit, dan salah baca beberapa huruf.
 * Semua koreksi di sini MURNI teks — tidak menyentuh kolom angka/saldo.
 */
const KOREKSI_URAIAN = [
  // Frasa baku BKU yang sering melebur tanpa spasi (camelCase / huruf-digital).
  [/SaldoBankBulanDesember/g, 'Saldo Bank Bulan Desember'],
  [/SaldoTunaiBulanDesember/g, 'Saldo Tunai Bulan Desember'],
  [/BungaBank/g, 'Bunga Bank'],
  [/PajakBunga/g, 'Pajak Bunga'],
  [/TerimaPPh/g, 'Terima PPh'],
  [/SetorPPh/g, 'Setor PPh'],
  // Kebingungan huruf (l kecil <-> I kapital) pada kependekan.
  [/\bPAl\b/g, 'PAI'],
  // Pemotongan kata oleh OCR.
  [/\bTradisio\b/g, 'Tradisional'],
]

export function rapikanUraian(s) {
  if (!s) return ''
  let v = String(s)
  // Sisip spasi: huruf kecil diikuti huruf kapital ("BulanDesember" -> "Bulan Desember").
  v = v.replace(/([a-z])([A-Z])/g, '$1 $2')
  // Sisip spasi: huruf diikuti tahun 4 digit ("Desember2025" -> "Desember 2025").
  v = v.replace(/([A-Za-z])(\d{4})/g, '$1 $2')
  // Koreksi frasa/kependekan yang sudah dikenali.
  for (const [re, rep] of KOREKSI_URAIAN) v = v.replace(re, rep)
  return v.replace(/\s+/g, ' ').trim()
}

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
    noBukti: rapikanNoBukti(bukti.join(' ')),
    uraian: rapikanUraian(uraian.join(' ')),
  }
}

export default { pisahTeks }
