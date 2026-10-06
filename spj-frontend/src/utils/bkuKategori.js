/**
 * bkuKategori.js — BKU → LPJ Smart Bridge (Sprint 004). Satu-satunya sumber
 * kategori rekening (otoritatif). templateDetector.js warisan — read-only.
 */

// Peta prefix → menu (longest-prefix menang). Pajak TIDAK dipetakan.
export const REKENING_KE_MENU = [
  { prefix: '5.1.02.02.01.0013', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0061', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.04.01', kategori: 'perjalanan_dinas', menu: 'perjalanan_dinas', route: 'dokumen-lpj' },
  { prefix: '5.1.02.01.01.0052', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  { prefix: '5.1.02.01.01.0055', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  { prefix: '5.1.02.01.01.0024', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0025', kategori: 'pemeliharaan', menu: 'pemeliharaan', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0063', kategori: 'pemeliharaan', menu: 'pemeliharaan', route: 'dokumen-lpj' },
]

// Normalisasi: trim + hapus spasi + casefold (titik dipertahankan).
export function normalisasiRekening(kode) {
  if (kode == null) return ''
  return String(kode).trim().replace(/\s+/g, '').toUpperCase()
}

// Kategori dari kode rekening. koreksi = map custom {KODE_NORMAL: entri} (prioritas atas peta).
// Return entri {prefix,kategori,menu,route} atau null (= "Belum dipetakan").
export function kategoriDariRekening(kode, koreksi = null) {
  const norm = normalisasiRekening(kode)
  if (!norm) return null
  if (koreksi && koreksi[norm]) return koreksi[norm]
  let best = null
  for (const entri of REKENING_KE_MENU) {
    if (norm.startsWith(entri.prefix) && (!best || entri.prefix.length > best.prefix.length)) best = entri
  }
  return best
}

import storageHelper from './storageHelper.js'
import { parsePerjalanan } from './aturanUndangan.js'
import { normalisasiUraian, parseMamin, kupasPrefiksKonsumsi, denganKegiatan, bacaGTKUntukHadir, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, kelompokSeNoBukti, dominanKategoriGrup, DOMINAN_PRIORITAS } from './aturanPesanan.js'
export { normalisasiUraian, parseMamin, kupasPrefiksKonsumsi, denganKegiatan, bacaGTKUntukHadir, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, kelompokSeNoBukti, dominanKategoriGrup, DOMINAN_PRIORITAS } from './aturanPesanan.js'

// Koreksi manual kategori (Sprint 004 A.3) — key = kode normalisasi.
const KOREKSI_KEY = 'bku_koreksi'

export function loadKoreksi() {
  return storageHelper.get(KOREKSI_KEY, {})
}

export function simpanKoreksi(kode, entri, noBukti = '') {
  const key = normalisasiRekening(kode) || (normalisasiRekening(noBukti) ? `NOBUKTI:${normalisasiRekening(noBukti)}` : '')
  if (!key || !entri) return false
  const semua = loadKoreksi()
  semua[key] = entri
  return storageHelper.set(KOREKSI_KEY, semua)
}

// Kategori dengan koreksi permanen (koreksi menang atas peta).
export function kategoriDenganKoreksi(kode, noBukti = '') {
  const koreksi = loadKoreksi()
  const k1 = normalisasiRekening(kode)
  if (k1 && koreksi[k1]) return koreksi[k1]
  const k2 = normalisasiRekening(noBukti)
  if (k2 && koreksi[`NOBUKTI:${k2}`]) return koreksi[`NOBUKTI:${k2}`]
  return kategoriDariRekening(kode)
}

// ─── Parser Mamin + Hadir GTK + konsumsi/pesanan → aturanPesanan.js ───
// (Sprint 007 rework: pindahan byte-identical, diimpor ulang di atas.)

// Prefill BKU → form (B.3): hanya field KOSONG + bkuSumber referensi.
const PREFILL_PETA = {
  perjalanan_dinas: [['sptUntuk', 'uraian'], ['tanggalSurat', 'tanggal']],
  mamin: [['tanggalAcara', 'tanggal:iso'], ['tanggal', 'tanggal:iso']],
  honor: [['keterangan', 'uraian']],
  pemeliharaan: [['uraian', 'uraian'], ['tanggal', 'tanggal:iso']],
}

// (normKunci/nominalTx ikut pindah ke aturanPesanan.js.)
// Riwayat pejabat (C.2) → spj_pejabat_riwayat. Entri {id,peran,nama,nip,berlaku_dari}.
const RIWAYAT_KEY = 'pejabat_riwayat'

export function loadRiwayat() {
  try {
    const v = storageHelper.get(RIWAYAT_KEY, [])
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

export function tambahPeriode(entri) {
  if (!entri?.peran || !entri?.berlaku_dari) return false
  const semua = loadRiwayat()
  semua.push({ ...entri, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` })
  return storageHelper.set(RIWAYAT_KEY, semua)
}

// 'DD-MM-YYYY' (BKU) atau ISO → ISO untuk perbandingan leksikografis.
function keISO(tgl) {
  const s = String(tgl || '').trim()
  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return s.slice(0, 10)
}

// Pejabat pada tanggal: max berlaku_dari ≤ tgl; tanpa riwayat → '' + warning.
export function pejabatPada(tanggal, peran) {
  const tgl = keISO(tanggal)
  const daftar = loadRiwayat().filter((r) => r.peran === peran && r.berlaku_dari).sort((a, b) => (a.berlaku_dari < b.berlaku_dari ? -1 : 1))
  if (daftar.length === 0) return { nama: '', nip: '', warning: 'tanpa-riwayat' }
  let pilih = null
  for (const r of daftar) {
    if (r.berlaku_dari.slice(0, 10) <= tgl) pilih = r
  }
  if (!pilih) return { nama: daftar[0].nama || '', nip: daftar[0].nip || '', warning: 'sebelum-periode' }
  return { nama: pilih.nama || '', nip: pilih.nip || '', warning: '' }
}

// (kelompokATK + flag ATK pindah ke aturanPesanan.js.)

const isKosong = (v) => v == null || (typeof v === 'string' && v.trim() === '')

// (gabungKonsumsi pindah ke aturanPesanan.js.)

// (DOMINAN_PRIORITAS + kelompokSeNoBukti + dominanKategoriGrup pindah ke
// aturanPesanan.js; grupDenganDominan/saring di bawah pakai impor ulang.)

export function grupDenganDominan(rows) {
  rows = rows || [];
  return kelompokSeNoBukti(rows).map(function (g) {
    const d = dominanKategoriGrup(g.rows);
    const hasBelanja = g.rows.some(function (r) { return r.tipe === 'PEMBAYARAN'; });
    return { key: g.key, noBukti: g.noBukti, rows: g.rows, total: g.total, dominan: d.dominan, dominanKategori: d.dominanKategori, suara: d.suara, kodeList: d.kodeList, hasBelanja: hasBelanja };
  });
}

export function saringGrupBermasalah(groups) {
  groups = groups || [];
  return groups.filter(function (g) { return g.hasBelanja && g.dominanKategori === 'belum'; });
}

// ─── Prefill BKU → form (Sprint 005 A.3): SELALU TIMPA khusus jalur BKU ───
// Nilai BKU selalu ditulis ke `tambahan`; field yang sebelumnya berisi
// dicatat di `tertimpa` agar snapshot/Urungkan bisa mengembalikan.
export function prefillDariBKU(bku, menu, formData = {}, subId = '') {
  const tambahan = {}
  const diisi = []
  const dilewati = []
  const tertimpa = []
  const timpa = (field, nilai) => {
    if (nilai == null || String(nilai).trim() === '') {
      dilewati.push(field)
      return
    }
    tambahan[field] = nilai
    if (isKosong(formData[field])) diisi.push(field)
    else tertimpa.push(field)
  }
  // Mamin cerdas: acara + jenis dari parser terpusat (bukan uraian mentah).
  // parseMamin TIDAK diubah Sprint 005 (A.2 = verified-existing 6/6 T3).
  if (menu === 'mamin') {
    const mentah = String(bku?.kegiatanNama || bku?.kegiatan || '').replace(/\s+/g, ' ').trim()
    const namaKeg = /^[\d.\s-]+$/.test(mentah) ? '' : mentah
    const hasil = parseMamin(bku?.uraian || '', namaKeg)
    if (hasil.acara) timpa('acara', hasil.acara)
    if (hasil.jenis) tambahan.maminJenis = hasil.jenis
    // Sprint 006 A.2 — routing sub-kategori mamin: subId eksplisit dari
    // deep-link tab Kegiatan menang atas parser, agar jalur pesanan selalu
    // membawa uraian/kegiatan/tanggal/noBukti mentah ke templatePesananMamin.
    if (subId === 'kegiatan') tambahan.maminJenis = 'kegiatan'
  }
  // Perjalanan dinas: maksud (sptUntuk) dari parsePerjalanan terpusat.
  if (menu === 'perjalanan_dinas') {
    const pj = parsePerjalanan(bku?.uraian || '', bku?.kegiatanNama || bku?.kegiatan || '')
    if (pj.maksud) timpa('sptUntuk', pj.maksud)
  }
  const peta = PREFILL_PETA[menu] || [['uraian', 'uraian']]
  for (const [field, sumber] of peta) {
    const iso = sumber.endsWith(':iso')
    const kunci = iso ? sumber.slice(0, -4) : sumber
    let nilai = bku?.[kunci]
    if (nilai == null || String(nilai).trim() === '') {
      dilewati.push(field)
      continue
    }
    if (iso) nilai = keISO(nilai)
    timpa(field, nilai)
  }
  // Referensi BKU selalu dibawa (tidak menimpa apa pun — key namespaced).
  if (formData.bkuSumber == null && bku) {
    tambahan.bkuSumber = { uraian: bku.uraian || '', nominal: bku.nominal || 0, tanggal: bku.tanggal || '', noBukti: bku.noBukti || '', kegiatan: bku.kegiatan || '' }
  }
  return { tambahan, diisi, dilewati, tertimpa }
}

export default { REKENING_KE_MENU, normalisasiRekening, kategoriDariRekening, loadKoreksi, simpanKoreksi, kategoriDenganKoreksi, prefillDariBKU, parseMamin, kupasPrefiksKonsumsi, denganKegiatan, bacaGTKUntukHadir, parsePerjalanan, normalisasiUraian, gabungKonsumsi, loadRiwayat, tambahPeriode, pejabatPada, kelompokATK, loadAtkFlag, simpanAtkFlag, kelompokSeNoBukti, dominanKategoriGrup, grupDenganDominan, saringGrupBermasalah, DOMINAN_PRIORITAS }
