/**
 * verifikasiKs.js — Sprint 024: cocokkan KS Data Sekolah vs data Guru/Tendik
 * terupload (spj_data_guru/spj_data_tendik) untuk memastikan identitas KS.
 *
 * Normalisasi: kecilkan huruf, buang gelar (", S.Pd" dkk), titik/koma,
 * spasi ganda. Hasil: cocok (persis) | mirip (kandidat ≤3) | tak-ditemukan.
 * NIP dibandingkan digit-per-digit: sama | beda | kosong.
 */
import storageHelper from './storageHelper'

const GELAR = /\b(s\.pd|s\.ag|s\.kom|s\.sos|s\.e|s\.si|s\.hum|s\.psi|m\.pd|m\.si|dra?|hj|h\.|s\.ip|a\.md|gr)\b\.?/gi

export function normalNama(nama = '') {
  return String(nama || '')
    .toLowerCase()
    .replace(/,.*$/, '')
    .replace(GELAR, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const digit = (s) => String(s || '').replace(/\D/g, '')

function ambilGtk() {
  const guru = storageHelper.get('data_guru', []) || []
  const tendik = storageHelper.get('data_tendik', []) || []
  return [
    ...guru.map((g) => ({ ...g, sumber: 'Guru' })),
    ...tendik.map((g) => ({ ...g, sumber: 'Tendik' })),
  ]
}

/**
 * @param {string} namaKs nama di Data Sekolah → Pejabat
 * @param {string} nipKs NIP di Data Sekolah → Pejabat
 * @returns {{status:'cocok'|'mirip'|'tak-ditemukan'|'kosong', record, kandidat[], nip:'sama'|'beda'|'kosong'}}
 */
export function verifikasiKs(namaKs = '', nipKs = '') {
  const inti = normalNama(namaKs)
  if (!inti) return { status: 'kosong', record: null, kandidat: [], nip: 'kosong' }
  const semua = ambilGtk()
  const pas = semua.find((g) => normalNama(g.nama) === inti)
  const cekNip = (rec) => {
    if (!digit(nipKs) || !digit(rec?.nip)) return 'kosong'
    return digit(nipKs) === digit(rec.nip) ? 'sama' : 'beda'
  }
  if (pas) return { status: 'cocok', record: pas, kandidat: [], nip: cekNip(pas) }
  const token = inti.split(' ').filter((t) => t.length > 2)
  const kandidat = semua
    .map((g) => ({ g, kunci: normalNama(g.nama) }))
    .filter(({ kunci }) => kunci && token.length > 0 && token.every((t) => kunci.includes(t)))
    .slice(0, 3)
    .map(({ g }) => g)
  if (kandidat.length > 0) return { status: 'mirip', record: null, kandidat, nip: cekNip(kandidat[0]) }
  return { status: 'tak-ditemukan', record: null, kandidat: [], nip: 'kosong' }
}

export default { normalNama, verifikasiKs }
