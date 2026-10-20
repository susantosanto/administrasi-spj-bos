/**
 * bkuPdfTanggal.js — baca token tanggal dari hasil OCR PDF hasil scan.
 *
 * MASALAH YANG DISOLUSIKAN
 * Tesseract sering menghilangkan tanda hubung tanggal dan menempelkan noise:
 *   "01-01-2026" -> "01012026)"   (pemisah hilang, ")" dari garis tabel)
 *   "31-01-2026" -> "3012026)"    (satu digit hilang)
 * Kalau hanya bentuk berpemisah yang dikenali, SELURUH BARIS hilang dari
 * preview — data hilang tanpa jejak dan user tidak pernah tahu.
 *
 * ATURAN
 *  1. Bentuk berpemisah ("01-01-2026") = PASTI. Dipakai duluan.
 *  2. Bentuk tanpa pemisah hanya dipakai kalau hasil parses-nya tidak
 *     ambigu. ambigu -> tanggal TIDAK ditebak; baris tetap masuk preview
 *     dengan tanggal kosong + catatan "perlu dikoreksi".
 *  3. Setiap tanggal hasil tebakan ditandai `pasti: false` supaya UI
 *     menandai baris itu untuk diperiksa user — angka tebakan tidak pernah
 *     diam-diam dianggap benar.
 *
 * Tidak ada tanggal/bulan/tahun yang di-hardcode: semua diturunkan dari
 * token OCR + batas rentang yang umum (hari 1-31, bulan 1-12, tahun 2000-2099).
 */
/*
 * Bentuk berpemisah. Noise di belakang (")" dari garis tabel) boleh,
 * TAPI pemisah tanggal sendiri ("." / "/" / "-") TIDAK boleh — kalau
 * boleh, kode kegiatan "07.12.01." akan terbaca sebagai tanggal
 * 07-12-2001 dan hilang dari kolom kode.
 */
const RE_PEMISAH = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})[^./-]*$/

/** Bentuk tanggal dengan pemisah — dipakai untuk menandai baris data. */
export const RE_TANGGAL_BENTUK = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}[^./-]*$/

/** Susun tanggal dari 3 bagian; null kalau di luar rentang yang masuk akal. */
function susun(hari, bulan, tahun) {
  const h = Number(hari), b = Number(bulan)
  let t = Number(tahun)
  if (!Number.isFinite(h) || !Number.isFinite(b) || !Number.isFinite(t)) return null
  if (t < 100) t += 2000
  if (h < 1 || h > 31 || b < 1 || b > 12 || t < 2000 || t > 2099) return null
  return { day: h, month: b, year: t }
}

/** Tanggal dari token berpemisah ("01-01-2026" / "1/1/26"). */
export function tanggalPemisah(s) {
  const m = String(s).trim().match(RE_PEMISAH)
  if (!m) return null
  return susun(m[1], m[2], m[3])
}

/**
 * Tanggal dari token TANPA pemisah ("01012026)").
 *
 * Aturan pengambilan digit: digit harus MENYUSUN di awal token, sisanya
 * bebas non-digit (noise ")" dari garis tabel). Ini penting — kode
 * kegiatan "07.12.01." dan nominal "82.560.000" punya pemisah di TENGAH,
 * jadi tidak boleh ikut jadi tanggal (kalau dibiarkan, kode kegiatan
 * hilang karena dianggap kolom tanggal).
 *
 * Panjang 8 = DDMMYYYY, 6 = DDMMYY. Panjang 7 = satu digit hilang:
 * "3012026" bisa berarti 3-01-2026 atau 30-01-2026. Tanggal BKU ditulis
 * 2 digit hari + 2 digit bulan, jadi bacaan 2-digit-hari lebih mungkin —
 * dipakai hanya kalau bacaan itu menghasilkan tanggal yang sah.
 *
 * Token angka 8 digit yang BUKAN tanggal (mis. NPSN "20205293" atau
 * nominal "82560000") gugur karena hari/bulan/tahunnya di luar rentang.
 */
export function tanggalPolos(s) {
  const m = String(s).trim().match(/^(\d+)\D*$/)
  if (!m) return null
  const d = m[1]
  if (d.length === 8) return susun(d.slice(0, 2), d.slice(2, 4), d.slice(4, 8))
  if (d.length === 6) return susun(d.slice(0, 2), d.slice(2, 4), d.slice(4, 6))
  if (d.length === 7) {
    const duaHari = susun(d.slice(0, 2), d.slice(2, 3), d.slice(3, 7))
    if (duaHari) return duaHari
    return susun(d.slice(0, 1), d.slice(1, 3), d.slice(3, 7))
  }
  return null
}

/**
 * Tanggal dari bentuk "hari+bulan menyatu, tahun terpisah": "0802-2026"
 * (= 08-02-2026). Tesseract menghilangkan satu tanda hubung; bentuk ini
 * tidak cocok RE_PEMISAH (grup pertama 4 digit) maupun tanggalPolos
 * (ada "-" di tengah) sehingga barisnya hilang sebagai yatim.
 * Terbukti 8 kemunculan di file user (Feb/Apr/Jun/Agu).
 */
export function tanggalGabung(s) {
  const m = String(s).trim().match(/^(\d{2})(\d{2})[-/.](\d{4})$/)
  if (!m) return null
  return susun(m[1], m[2], m[3])
}

/**
 * Baca satu token sebagai tanggal.
 * @param {string} s
 * @returns {{day:number,month:number,year:number,pasti:boolean}|null}
 */
export function bacaTanggal(s) {
  const t = String(s).trim()
  const denganPemisah = tanggalPemisah(t)
  if (denganPemisah) return { ...denganPemisah, pasti: true }
  // Bentuk rusak ("0802-2026") -> ditandai pasti:false supaya user
  // memeriksa barisnya; bentuknya tidak persis seperti yang tercetak.
  const gabung = tanggalGabung(t)
  if (gabung) return { ...gabung, pasti: false }
  const polos = tanggalPolos(t)
  if (polos) return { ...polos, pasti: false }
  return null
}

/** Token ini bisa dibaca sebagai tanggal? (dipakai untuk menjankai baris) */
export function jankaiTanggal(s) {
  return bacaTanggal(s) !== null
}

/** Token ini tanggal yang sah — dipakai untuk melewati kolom tanggal. */
export function isTanggal(s) {
  return bacaTanggal(s) !== null
}
