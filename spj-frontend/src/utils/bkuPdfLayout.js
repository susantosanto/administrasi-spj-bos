/**
 * bkuPdfLayout.js — Sprint 015 · M3a: deteksi kolom & pengelompokan baris.
 *
 * Pisahan dari bkuPdfParser.js (MODULE-PLAN M3: "boleh 2 file"). Modul ini
 * tidak tahu bentuk TransactionRow — murni "token ini kolom apa".
 *
 * GENERALISASI: format BKU tiap sekolah sama, isinya berbeda. Tidak ada
 * koordinat maupun format angka/tanggal yang di-hardcode:
 *   TANGGAL       -> bentuk d-m-y / d/m/y, tahun 2 atau 4 digit
 *   KODE KEGIATAN -> titik <=2   KODE REKENING -> titik >=3
 *   3 kolom angka -> 3 puncak tepi-kanan (angka rata-kanan)
 *   BUKTI/URAIAN  -> dipecah di bkuPdfTeks.js
 *
 * Pembacaan token tanggal (termasuk bentuk tanpa pemisah hasil OCR) ada di
 * bkuPdfTanggal.js — dipakai di sini dan di bkuPdfParser.js.
 */
import { isTanggal, jankaiTanggal } from './bkuPdfTanggal.js'

export { isTanggal, jankaiTanggal, RE_TANGGAL_BENTUK } from './bkuPdfTanggal.js'

export const BUCKET = 20
export const TOL_Y = 18
export const JEND_ORPHAN = 46
export const TOL_EDGE = 60
const RE_NOMINAL = /^(?:rp\s*)?\d{1,3}(?:[.,]\d{3}){1,2}$/
const RE_INT_PANJANG = /^(?:rp\s*)?\d{4,}$/
/** Layak jadi nilai rupiah (bukan kode, tahun, atau uraian)? */
export function isNominal(s) { return RE_NOMINAL.test(s) || RE_INT_PANJANG.test(s) }

/**
 * 3 puncak tepi-kanan token angka = PENERIMAAN / PENGELUARAN / SALDO.
 *
 * Hanya token berangka besar yang dipakai. Baris nomor kolom ("1 2 3 4 5 6 7
 * 8") kadang jatuh satu baris dengan data pertama; kalau ikut dihitung, 8 angka
 * kecil itu mengalahkan kolom rupiah dan semua nilai jadi 0. Ambang: >=4 digit,
 * dan >=5 digit bila tanpa pemisah ribuan (supaya "2026" tidak ikut).
 */
export function kalibrasiNominal(items) {
  const hitung = new Map()
  for (const it of items) {
    const s = it.str.trim()
    if (!isNominal(s)) continue
    const digit = s.replace(/[^\d]/g, '')
    const adaPemisah = /[.,]/.test(s.slice(1))
    if (digit.length < 4 || (digit.length < 5 && !adaPemisah)) continue
    const b = Math.floor((it.x + it.w) / BUCKET)
    hitung.set(b, (hitung.get(b) || 0) + 1)
  }
  // Puncak diambil dari KANAN ke kiri: kolom uang adalah 3 kolom TERAKHIR
  // tabel BKU, dan tiga-tiganya bersebelahan. Kode rekening (mis. "5.1.02.
  // 02.01.0013" yang titik-titiknya hilang saat OCR -> "5102020100") juga
  // menyerupai nominal, tapi jauh di kiri kolom uang — jadi harus kalah.
  // Ambang jumlah 3 membuang angka sisa yang cuma kebetulan di kanan.
  // Beda 4 bucket = 80 px: dua puncak satu kolom tidak dihitung dua kali.
  const peaks = [...hitung.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[0] - a[0])
  const pilih = []
  for (const [b] of peaks) {
    if (pilih.every((q) => Math.abs(q - b) > 4)) pilih.push(b)
    if (pilih.length === 3) break
  }
  // Kembalikan kiri->kanan supaya pemanggil membacanya sebagai
  // PENERIMAAN / PENGELUARAN / SALDO.
  return pilih.sort((a, b) => a - b).map((b) => b * BUCKET)
}

/** Kelompokkan token jadi cluster baris (toleransi y). */
function clusterBaris(items) {
  const urut = items.slice().sort((a, b) => a.y - b.y || a.x - b.x)
  const clusters = []
  let cur = null
  for (const it of urut) {
    if (!cur || it.y - cur.yMax > TOL_Y) { cur = { yMin: it.y, yMax: it.y, items: [it] }; clusters.push(cur) }
    else { cur.yMax = it.y; cur.items.push(it) }
  }
  return clusters
}

/** Jangkai baris = cluster yang memuat token berbentuk tanggal. */
export function barisPerHalaman(items) {
  const perHal = new Map()
  for (const it of items) {
    if (!perHal.has(it.page)) perHal.set(it.page, [])
    perHal.get(it.page).push(it)
  }
  const hasil = []
  for (const [page, arr] of [...perHal.entries()].sort((a, b) => a[0] - b[0])) {
    const clusters = clusterBaris(arr)
    const target = clusters
      .filter((c) => c.items.some((x) => jankaiTanggal(x.str.trim())))
      .map((c) => ({ page, y: (c.yMin + c.yMax) / 2, items: c.items.slice() }))
    if (!target.length) continue
    // Cluster tanpa jangkai (kode rekening pecah baris) -> jangkai terdekat.
    for (const c of clusters) {
      if (c.items.some((x) => jankaiTanggal(x.str.trim()))) continue
      const cy = (c.yMin + c.yMax) / 2
      let best = null, bd = Infinity
      for (const r of target) { const d = Math.abs(cy - r.y); if (d < bd) { bd = d; best = r } }
      if (best && bd <= JEND_ORPHAN) best.items.push(...c.items)
    }
    // Yang jauh di atas jangkai data pertama = kop/header, bukan data.
    // WAJIB SETELAH orphan attach: baris header "1 2 3 4 5 6 7 8" berjarak
    // cuma 40 px dari jangkai pertama (masih < JEND_ORPHAN) sehingga ikut
    // menempel ke baris data pertama kalau difilter sebelum attach.
    const yData = Math.min(...target.map((r) => r.y))
    for (const r of target) r.items = r.items.filter((x) => x.y >= yData - TOL_Y)
    hasil.push(...target)
  }
  return hasil
}

/**
 * True bila token bisa dibaca sebagai angka.
 *
 * OCR sering salah baca angka nol sebagai huruf ("0" -> "ol", "0" -> "l"),
 * jadi huruf yang sering tertukar dengan nol dinormalisasi dulu sebelum diuji.
 * Hanya berlaku di kolom angka — di kolom teks kemunculannya tidak berarti.
 */
const BECUK_NOL = /[oOlI|iS]/g
function sebagaiAngka(s) {
  const t = String(s).trim()
  if (/^[\d.,]+$/.test(t)) return t
  const z = t.replace(BECUK_NOL, '0')
  return /^[\d.,]+$/.test(z) ? z : ''
}

/**
 * Ambil nilai tiap kolom angka pada satu baris (0 bila kosong).
 * Kolom angka sudah diketahui lewat POSISI (puncak tepi-kanan), jadi isinya
 * tidak perlu divalidasi ulang. Token yang tetap tak terbaca sebagai angka
 * dicatat di `anomali` supaya problems[] menandai baris itu untuk dikoreksi.
 *
 * CARA MEMASANG TOKEN KE KOLOM: token milik kolom X kalau tepi X berada DI
 * DALAM kotak token. Penting untuk token kotak LEBAR — OCR menggabung isi 2
 * sel jadi satu kotak ("82560000" selebar 320 px), sehingga tepi-kanannya
 * jatuh di kolom sebelah dan nilainya masuk ke kolom yang salah. Kalau
 * beberapa tepi ada di dalam satu kotak, yang paling kiri dipakai — itu
 * kolom asalnya. Token tanpa tepi di dalam kotak (sel sangat sempit) memakai
 * tepi terdekat seperti sebelumnya.
 */
export function kolomAngka(baris, edges, potong) {
  const anomali = []
  const nilai = edges.map(() => 0)
  for (const it of baris.items) {
    const kiri = it.x, kanan = it.x + it.w
    let k = -1
    for (let i = 0; i < edges.length; i++) {
      if (kiri <= edges[i] && edges[i] <= kanan) { k = i; break }
    }
    if (k < 0) {
      let bd = Infinity
      for (let i = 0; i < edges.length; i++) {
        const d = Math.abs(kanan - edges[i])
        if (d < bd) { bd = d; k = i }
      }
      if (bd > TOL_EDGE) continue
    }
    const z = sebagaiAngka(it.str)
    if (!z) { anomali.push({ str: it.str.trim(), x: it.x, alasan: 'angka_terbaca_huruf' }); continue }
    if (!nilai[k]) nilai[k] = potong(z)
  }
  nilai.anomali = anomali
  return nilai
}
