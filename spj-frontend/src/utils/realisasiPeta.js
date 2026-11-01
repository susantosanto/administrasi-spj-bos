/**
 * realisasiPeta.js — Sprint 024: peta BKU → matriks Realisasi Dana.
 *
 * Baris (7 SNP) ← kodeKegiatan via KEGIATAN_BOS.snp (lookupKegiatan).
 * Kolom (11 komponen + HONOR):
 *   PRIMER = KEGIATAN_BOS.komponen (12 nilai, peta 1:1 ke kolom PDF);
 *   OVERRIDE rekening pasti (lihat REKENING_OVERRIDE);
 *   HONOR = pola honorarium (kolom 12, baris ikut SNP kegiatan).
 * Tak dikenal → null (jujur: "Belum dipetakan", bukan karangan).
 * Q-1 Sprint 024: 5.1.02.02.01.0016 (Upah Tukang) → null (default jujur).
 */

// Label kolom persis rpd-k7-output.pdf (11 + Honor).
export const KOMPONEN = [
  'Penerimaan Peserta Didik baru',
  'Pengembangan Perpustakaan',
  'Pelaksanaan Kegiatan Pembelajaran dan Ekstrakurikuler',
  'Pelaksanaan Kegiatan Asesmen/Evaluasi Pembelajaran',
  'Pelaksanaan Administrasi Kegiatan Sekolah',
  'Pengembangan Profesi Pendidik dan Tenaga Kependidikan',
  'Pembiayaan Langganan Daya dan Jasa',
  'Pemeliharaan Sarana dan Prasarana Sekolah',
  'Penyediaan Alat Multi Media Pembelajaran',
  'Penyelenggaraan Kegiatan Peningkatan Kompetensi Keahlian',
  'Penyelenggaraan Kegiatan dalam mendukung keterserapan lulusan',
  'Pembayaran Honor',
]

// Label baris persis PDF (7 SNP).
export const SNP_ROWS = [
  'Pengembangan Standar Isi',
  'Standar Proses',
  'Standar Tenaga Kependidikan',
  'Standar Sarana dan Prasarana',
  'Standar Pengelolaan',
  'Pengembangan standar pembiayaan',
  'Standar Penilaian Pendidikan',
]

// KEGIATAN_BOS.snp → baris PDF.
export const SNP_KE_BARIS = {
  Isi: 0, Proses: 1, PTK: 2, Sarpras: 3, Pengelolaan: 4, Pembiayaan: 5, Penilaian: 6,
}

// KEGIATAN_BOS.komponen (normalisasi) → kolom PDF (0-10).
const KOMPONEN_KE_KOLOM = [
  [/peserta didik baru/i, 0],
  [/perpustakaan/i, 1],
  [/pembelajaran dan ekstrakurikuler/i, 2],
  [/asesmen/i, 3],
  [/administrasi kegiatan/i, 4],
  [/profesi/i, 5],
  [/langganan daya/i, 6],
  [/pemeliharaan sarana/i, 7],
  [/multimedia/i, 8],
  [/peningkatan kompetensi/i, 9],
  [/keterserapan/i, 10],
]

// Override rekening yang PASTI (di luar dugaan kegiatan).
// HANYA 0063 (internet = langganan, tak ambigu). 5.2.05.01.01.0001 DIBUANG:
// sekolah memakainya untuk BUKU (05.02.03 → Perpustakaan; 16,9jt nyasar
// ke [3][6] vs [3][1] pada PDF Tahap 1).
const REKENING_OVERRIDE = [
  [/^5\.1\.02\.02\.01\.0063$/, 6], // internet
]

// Pola honorarium → kolom 11 (indeks 11). 0016 (Upah Tukang) SENGAJA tak ada (Q-1).
const HONOR_REKENING = [
  /^5\.1\.02\.02\.01\.0013$/, // GTT
  /^5\.1\.02\.02\.01\.0064$/, // narsum
  /^5\.1\.02\.02\.01\.0002$/, // panitia
  /^5\.1\.02\.02\.01\.0003$/, // narasumber/pembahas
  /^5\.1\.02\.02\.01\.0004$/, // tim pelaksana
]
const HONOR_URAIAN = /(honorarium|\bhonor\b|gaji|narasumber)/i

// Kode 0061 ambigu (token listrik vs honorarium perpus) — bedakan via uraian.
const LISTRIK_URAIAN = /(listrik|token|tagihan|internet|langganan|daya)/i

// Kode kegiatan EKSLUSIF → [baris, kolom] (terverifikasi PDF Tahap 1:
// seluruh 08.04.13 = Rp 4.314.000 tepat di Penilaian/Asesmen).
const KEGIATAN_EKSLUSIF = {
  '08.04.13': [6, 3],
}

const bersih = (s) => String(s || '').replace(/\s+/g, '')

/** Kode rekening + uraian → indeks kolom 0-11, atau null.
 * Preseden (terverifikasi PDF): honor-tegas > 0063 > 0061-listrik >
 * komponen kegiatan > null. 0061 ambigu DITANGANI di sini. */
export function petaKomponen(kodeRekening = '', uraian = '') {
  const rek = bersih(kodeRekening)
  const ura = String(uraian || '')
  if (HONOR_REKENING.some((re) => re.test(rek))) return 11
  if (HONOR_URAIAN.test(ura)) return 11
  for (const [re, kolom] of REKENING_OVERRIDE) {
    if (re.test(rek)) return kolom
  }
  if (/^5\.1\.02\.02\.01\.0061$/.test(rek)) {
    if (LISTRIK_URAIAN.test(ura)) return 6
    if (HONOR_URAIAN.test(ura)) return 11
  }
  return null // ikut komponen kegiatan (di agregat) atau Belum dipetakan
}

/** Kode kegiatan (normalisasi titik akhir) → [baris, kolom] eksklusif, atau null. */
export function petaKegiatanEksklusif(kodeKegiatan = '') {
  const k = String(kodeKegiatan || '').replace(/\.$/, '')
  return Object.hasOwn(KEGIATAN_EKSLUSIF, k) ? KEGIATAN_EKSLUSIF[k] : null
}

/** Uraian komponen KEGIATAN_BOS → indeks kolom 0-10, atau null. */
export function petaKomponenKegiatan(komponen = '') {
  const c = String(komponen || '')
  for (const [re, kolom] of KOMPONEN_KE_KOLOM) {
    if (re.test(c)) return kolom
  }
  if (/honor/i.test(c)) return 11
  return null
}

/** Kode kegiatan → indeks baris SNP 0-6, atau null. */
export function petaSnp(snp = '') {
  const s = String(snp || '').trim()
  return Object.hasOwn(SNP_KE_BARIS, s) ? SNP_KE_BARIS[s] : null
}

export default { KOMPONEN, SNP_ROWS, SNP_KE_BARIS, petaKomponen, petaKomponenKegiatan, petaSnp, petaKegiatanEksklusif }
