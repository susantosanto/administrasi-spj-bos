/**
 * bkuKategori.js — BKU → LPJ Smart Bridge (Sprint 004). Satu-satunya sumber
 * kategori rekening (otoritatif). templateDetector.js warisan — read-only.
 */

// Peta prefix → menu (longest-prefix menang). Pajak TIDAK dipetakan.
// Kunci 2026-11-26 (keputusan user, riset RKAS 5.1 183 rekening + data 420 tx):
// - Internet (.0063) & Listrik (.0061) KELUAR dari dokumen → 'operasional'
//   (info-only, cukup struk/nota/kwitansi).
// - Kertas & Cover (.0025) pindah pemeliharaan → atk.
// - Honorarium (.0003–.0011) + Jasa tenaga (.0015–.0038) + Lembur (.0071) → honor.
// - ATK & bahan (.0026–.0036) → atk. Pemeliharaan = seluruh rumpun 5.1.02.03.
// - Sewa (.02.04/.02.05/.02.03.0002) + utilitas/tagihan + asuransi → operasional.
// - Kursus (.02.12.0001) + Juri (.0037) → lomba_workshop (otomatis).
// - Buku 5.2.05.01.0001 → buku (hanya dokumen perencanaan PBJ).
export const REKENING_KE_MENU = [
  // ── Mamin ──
  { prefix: '5.1.02.01.01.0052', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  { prefix: '5.1.02.01.01.0053', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  { prefix: '5.1.02.01.01.0055', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  // Sprint 020 revisi (laporan user 2026-10-24): konsumsi KEGIATAN (SSH
  // 5.1.02.02.01.0001 "Konsumsi dan Rapat Kerja") belum termapping → baris
  // "Konsumsi (makan) Kegiatan …" tak bisa buka tab Dokumen LPJ (kartu AI
  // 3 slot + owner warung tak terjangkau). Konsumsi kegiatan = domain mamin
  // (aturanMamin jenis=kegiatan, gabungKonsumsi).
  { prefix: '5.1.02.02.01.0001', kategori: 'mamin', menu: 'mamin', route: 'dokumen-lpj' },
  // ── ATK & bahan ──
  { prefix: '5.1.02.01.01.0024', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0025', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0026', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0027', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0029', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0030', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0031', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0032', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0034', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0035', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  { prefix: '5.1.02.01.01.0036', kategori: 'atk', menu: 'kelengkapan', route: 'dokumen-kelengkapan' },
  // ── Honor & jasa personil ──
  { prefix: '5.1.02.02.01.0013', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0003', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0004', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0006', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0007', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0008', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0009', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0011', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0015', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0016', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0025', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0026', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0027', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0029', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0030', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0031', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0035', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0038', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0071', kategori: 'honor', menu: 'honor', route: 'dokumen-lpj' },
  // ── Perjalanan dinas ──
  { prefix: '5.1.02.04.01', kategori: 'perjalanan_dinas', menu: 'perjalanan_dinas', route: 'dokumen-lpj' },
  // ── Pemeliharaan: seluruh rumpun 5.1.02.03 ──
  { prefix: '5.1.02.03', kategori: 'pemeliharaan', menu: 'pemeliharaan', route: 'dokumen-lpj' },
  // ── Operasional (info-only, TANPA kartu LPJ: cukup struk/nota/kwitansi
  // atau arsip tagihan; tidak membuka tab Dokumen LPJ) ──
  { prefix: '5.1.02.02.04', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.05', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.03.0002', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.02.0008', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0041', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0042', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0059', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0060', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0061', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0062', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0063', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0064', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0065', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0066', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0067', kategori: 'operasional', menu: 'operasional', route: 'dokumen-lpj' },
  // ── Lomba & workshop (otomatis; proposal DIKUNCI — keputusan 2026-11-26) ──
  { prefix: '5.1.02.02.12.0001', kategori: 'lomba_workshop', menu: 'lomba_workshop', route: 'dokumen-lpj' },
  { prefix: '5.1.02.02.01.0037', kategori: 'lomba_workshop', menu: 'lomba_workshop', route: 'dokumen-lpj' },
  // ── Buku & bahan ajar (hanya dokumen perencanaan PBJ) ──
  { prefix: '5.2.05.01.01.0001', kategori: 'buku', menu: 'buku', route: 'dokumen-lpj' },
]

// Sprint 030 (US-03/US-09): daftar pilihan dropdown koreksi kategori.
// Kunci 2026-11-26: mapping otomatis resmi (riset RKAS 5.1) sudah masuk peta
// di atas — termasuk lomba_workshop (.0012.0001 kursus, .0037 juri).
// Entri MANUAL di bawah dipertahankan untuk kompatibilitas koreksi lama.
export const PILIHAN_KATEGORI_KOREKSI = [
  ...REKENING_KE_MENU,
  { prefix: '', manual: true, label: 'Lomba & Workshop', kategori: 'lomba_workshop', menu: 'lomba_workshop', route: 'dokumen-lpj' },
]

// Label manusiawi untuk dropdown kategori (tanpa duplikat "x → x").
export const LABEL_KATEGORI = {
  honor: 'Honorarium',
  perjalanan_dinas: 'Perjalanan Dinas',
  mamin: 'Makan & Minum',
  atk: 'ATK',
  pemeliharaan: 'Pemeliharaan',
  lomba_workshop: 'Lomba & Workshop',
  operasional: 'Operasional',
  buku: 'Buku & Bahan Ajar',
}

/**
 * Warna premium per kategori (khusus layar; tidak pernah ikut cetak).
 * Pilihan user 2026-11-25: tiap kategori terpetakan punya aksen cerah sendiri.
 */
export const WARNA_KATEGORI = {
  honor: { dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800 border-amber-200/70' },
  perjalanan_dinas: { dot: 'bg-sky-500', pill: 'bg-sky-50 text-sky-800 border-sky-200/70' },
  mamin: { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800 border-emerald-200/70' },
  atk: { dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-800 border-violet-200/70' },
  pemeliharaan: { dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-800 border-rose-200/70' },
  lomba_workshop: { dot: 'bg-blue-600', pill: 'bg-blue-50 text-blue-800 border-blue-200/70' },
  operasional: { dot: 'bg-slate-400', pill: 'bg-slate-200 text-slate-700 border-slate-300/70' },
  buku: { dot: 'bg-teal-500', pill: 'bg-teal-50 text-teal-800 border-teal-200/70' },
}

/** Daftar unik per kategori untuk dropdown (satu entri per prefix = duplikat). */
export const PILIHAN_KATEGORI_UNIK = (() => {
  const lihat = new Set()
  return PILIHAN_KATEGORI_KOREKSI.filter((entry) => {
    if (lihat.has(entry.kategori)) return false
    lihat.add(entry.kategori)
    return true
  })
})()

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

/**
 * Koreksi manual kategori (Sprint 004 A.3; scope diperjelas Sprint 030).
 * - "baris" (default): hanya row identity terpilih, untuk memisahkan hasil
 *   auto-kategori tanpa mengubah transaksi lain.
 * - "grup": NoBukti + kode rekening lengkap + tanggal sama, dipilih eksplisit
 *   lewat konfirmasi premium; nama kegiatan tidak menjadi syarat.
 * Koreksi legacy per-NoBukti / per-kode tetap dibaca untuk backcompat.
 */
/** Kunci koreksi murni (bisa diuji tanpa storage). */
export function kunciKoreksi(kode, entri, noBukti = '', tanggal = '', scope = 'baris') {
  const nb = String(noBukti || '').trim().toUpperCase()
  const rekening = normalisasiRekening(kode)
  const tgl = String(tanggal || '').trim()
  // Semua pilihan dari dropdown tabel dibatasi pada tiga faktor ini,
  // termasuk koreksi ke kategori yang punya prefix otomatis. Default hanya
  // row identity (agar auto-kategori bisa dikoreksi tanpa dampak massal).
  // Scope group memakai tiga faktor sesuai pilihan eksplisit operator.
  if (scope === 'grup') {
    return nb && rekening && tgl ? `BARISGRUP:${nb}|${rekening}|${tgl}` : ''
  }
  return Number.isInteger(entri?.row) ? `BARIS:${entri.row}` : ''
}

export function simpanKoreksi(kode, entri, noBukti = '', tanggal = '', scope = 'baris') {
  const key = kunciKoreksi(kode, entri, noBukti, tanggal, scope)
  if (!key || !entri) return false
  const semua = loadKoreksi()
  semua[key] = entri
  return storageHelper.set(KOREKSI_KEY, semua)
}

/** Bentuk baris/konteks menjadi kunci koreksi manual 3 faktor. */
function kunciBarisGrup(kode, noBukti, tanggal) {
  const nb = String(noBukti || '').trim().toUpperCase()
  const rekening = normalisasiRekening(kode)
  const tgl = String(tanggal || '').trim()
  return nb && rekening && tgl ? `BARISGRUP:${nb}|${rekening}|${tgl}` : ''
}

/** Apakah baris masuk cakupan koreksi grup: NoBukti + rekening + tanggal. */
export function cocokKoreksiGrup(row = {}, target = {}) {
  const nb = (value) => String(value || '').trim().toUpperCase()
  const rek = (value) => normalisasiRekening(value)
  const tgl = (value) => String(value?.tanggalISO || value?.tanggalStr || '').trim()
  return Boolean(
    nb(row.noBukti) && rek(row.kodeRekening) && tgl(row)
    && nb(row.noBukti) === nb(target.noBukti)
    && rek(row.kodeRekening) === rek(target.kodeRekening)
    && tgl(row) === tgl(target)
  )
}

/** Kategori dengan koreksi permanen (koreksi menang atas peta).
 *  Koreksi manual: NoBukti + kode rekening lengkap + tanggal.
 *  Koreksi legacy per-NoBukti / per-kode tetap dibaca untuk backcompat.
 *  koreksiOverride opsional agar fungsi murni dapat diuji tanpa storage.
 */
export function kategoriDenganKoreksi(kode, noBukti = '', tanggal = '', row = null, koreksiOverride = null) {
  const koreksi = koreksiOverride && typeof koreksiOverride === 'object' ? koreksiOverride : loadKoreksi()
  const rowKey = Number.isInteger(Number(row)) ? `BARIS:${Number(row)}` : ''
  if (rowKey && koreksi[rowKey]) return koreksi[rowKey]
  const barisKey = kunciBarisGrup(kode, noBukti, tanggal)
  if (barisKey && koreksi[barisKey]) return koreksi[barisKey]
  const k2 = normalisasiRekening(noBukti)
  if (k2 && koreksi[`NOBUKTI:${k2}`]) return koreksi[`NOBUKTI:${k2}`]
  const k1 = normalisasiRekening(kode)
  if (k1 && koreksi[k1]) return koreksi[k1]
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
