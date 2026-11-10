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

/**
 * Token yang utuh adalah kode bukti (pra-normalisasi O→0).
 * Dipakai pisahTeks untuk menemukan kolom bukti secara EKSPLISIT
 * (Sprint 028) — bukan lewat posisi grup.
 */
const POLA_BUKTI_TOKEN = /^[A-Z]{2,4}[0-9O]{1,3}$/

/** Tolak noBukti yang tercemar teks uraian; kembalikan '' bila tidak sah. */
export function rapikanNoBukti(s) {
  // Sprint 028: normalisasi salah-baca OCR SEBELUM validasi — huruf kecil dan
  // "O" pada bagian digit ("BPUO5"→"BPU05", "bpu02"→"BPU02"). Tanpa ini bukti
  // dikosongkan dan tipe transaksi ikut goyah.
  const v = String(s || '').trim().toUpperCase()
  if (!v) return ''
  // Sprint 028: normalisasi O→0 DULU sebelum validasi — token salah-baca OCR
  // ("BPUO5") lolos POLA_NOBUKTI sebagai 4 huruf + digit bila dicek mentah.
  // Sprint 028: token utuh salah-baca OCR ("BPUO5" lolos POLA_NOBUKTI sebagai
  // 4 huruf + digit). Coba semua belahan prefix 2-4 huruf + ekor O/digit yang
  // memuat digit nyata; O di ekor = nol ("BPU"+"O5"→"BPU05").
  for (let k = 2; k <= 4; k++) {
    const pre = v.slice(0, k), tail = v.slice(k)
    if (!/^[A-Z]+$/.test(pre) || !/^[0-9O]{1,3}$/.test(tail)) continue
    if (!/[0-9]/.test(tail)) continue
    const norm = pre + tail.replace(/O/g, '0')
    if (POLA_NOBUKTI.test(norm)) return norm
  }
  if (POLA_NOBUKTI.test(v)) return v
  // Sel bukti kosong tapi ada teks uraian yang bocor ke kiri. Ambil HANYA
  // kode yang sah di depan, buang sisa teksnya.
  //
  // PENTUNG: jangan jadi '' kalau ada kode sah. noBukti emptied = aturan
  // deteksi tipe di bkuParser.js ikut berubah (BNU/BPU -> PEMBAYARAN
  // jadi TARIK_TUNAI) sehingga total pengeluaran ikut turun. Bukti:
  // "BNU12 Set)" harus tetap "BNU12".
  // Huruf kapital rakus ([A-Z]{2,4}) bisa memakan "O" digit ("BPUO5"→"BPUO"+"5").
  // Dibuat malas + O→0 HANYA pada bagian digit, supaya "BPUO5"→"BPU05".
  const m = v.match(/^([A-Z]{2,4}?)([0-9O]{1,3})(?![\dA-Za-z])/)
  return m ? m[1] + m[2].replace(/O/g, '0') : ''
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
  //
  // Sprint 028: grup-terbanyak SAJA tidak cukup — spasi OCR tak rata bisa
  // memecah kata depan uraian ("Beban Makanan" | "dan Minuman ...") dan grup
  // pemenang justru grup tengah, sehingga kata depan jatuh ke kiri `mulai`
  // lalu dibuang rapikanNoBukti. Karena itu No. Bukti dideteksi EKSPLISIT
  // via pola, dan uraian = SEMUA token teks sisanya (tak ada kata terbuang).
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
  // Token murni tanda-baca = sisa garis tabel hasil OCR (mis. "." menempel
  // di dalam kata "Minuman"). Tak pernah bagian uraian yang sah.
  const TITIK_SAMPAH = /^[^\p{L}\p{N}]+$/u
  // Sprint 028: cari token No. Bukti eksplisit (pola kode di token utuh).
  // Bila ketemu, uraian = semua token teks lain (minus kode + minus sampah)
  // — kata depan uraian tidak bisa lagi terbuang walau celahnya > 80 px.
  let idxBukti = sisa.findIndex((it) => POLA_BUKTI_TOKEN.test(it.str.trim().toUpperCase()))
  for (let i = 0; i < sisa.length; i++) {
    const it = sisa[i]
    const s = it.str.trim()
    if (TITIK_SAMPAH.test(s)) continue
    if (idxBukti >= 0) {
      if (i === idxBukti) { bukti.push(s); continue }
      if (i < idxBukti) {
        // Sebelum bukti: kode rekening pecah ("52") → polos; kata lain
        // (celah lebar, mis. sisa uraian) → uraian, bukan dibuang.
        if (RE_KODE_POLOS.test(s)) { polos.push(s); continue }
        uraian.push(s); continue
      }
      // Sesudah bukti: kode rekening pecah tetap ke polos (mis. "52"
      // menempel di kanan uraian pada scan miring); sonst uraian.
      if (RE_KODE_POLOS.test(s)) { polos.push(s); continue }
      uraian.push(s); continue
    }
    if (it.x >= mulai) { uraian.push(s); continue }
    // Tanpa bukti terdeteksi dan di kiri `mulai`: kode polos → polos,
    // kata mirip kode → bukti (diekstrak rapikanNoBukti), kata biasa → uraian.
    if (RE_KODE_POLOS.test(s)) { polos.push(s); continue }
    if (/^[A-Z]{2,4}/.test(s.toUpperCase())) bukti.push(s)
    else uraian.push(s)
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
