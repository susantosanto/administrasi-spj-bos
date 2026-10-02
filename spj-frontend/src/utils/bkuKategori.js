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

import storageHelper from './storageHelper'

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

// ─── Prefill Mamin cerdas (T3, revisi ketat 2026-10-02) ────────────────────
// Wajib persis uraian user, tanpa tebakan tambahan. Normalisasi:
// case-insensitive + spasi ganda dilipat. Aturan:
//  - diawali "beban makanan dan minuman" → jenis "rapat",
//    acara dari baris kegiatan di bawahnya (contoh: Penyusunan Silabus).
//  - mengandung "konsumsi makan" (dalam kurung) / "dan konsumsi snack" /
//    "konsumsi snack" → jenis "kegiatan", acara tetap dari nama kegiatan.
//  - tak cocok → fallback uraian penuh, jenis "" (jujur dikosongkan).
export function normalisasiUraian(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
}

function ambilBarisKedua(uraian) {
  const baris = String(uraian || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (baris.length >= 2) return baris.slice(1).join(' ').replace(/\s+/g, ' ').trim()
  return ''
}

function kupasPrefiksSatuBaris(uraian) {
  return String(uraian || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^beban makanan dan minuman/i, '')
    .trim()
    .replace(/^rapat\s*[-–—:.]?\s*/i, '')
    .trim()
}

export function parseMamin(uraian, kegiatanNama = '') {
  const norm = normalisasiUraian(uraian)
  const keg = String(kegiatanNama || '').replace(/\s+/g, ' ').trim()
  if (norm.startsWith('beban makanan dan minuman')) {
    const dariBaris = ambilBarisKedua(uraian)
    const acara = dariBaris || keg || kupasPrefiksSatuBaris(uraian)
    return { jenis: 'rapat', acara, cocok: true }
  }
  if (norm.includes('konsumsi makan') || norm.includes('konsumsi snack')) {
    const dariBaris = ambilBarisKedua(uraian)
    const acara = keg || dariBaris || String(uraian || '').replace(/\s+/g, ' ').trim()
    return { jenis: 'kegiatan', acara, cocok: true }
  }
  return { jenis: '', acara: String(uraian || '').replace(/\s+/g, ' ').trim(), cocok: false }
}

// Prefill BKU → form (B.3): hanya field KOSONG + bkuSumber referensi.
const PREFILL_PETA = {
  perjalanan_dinas: [['sptUntuk', 'uraian'], ['tanggalSurat', 'tanggal']],
  mamin: [['tanggalAcara', 'tanggal:iso'], ['tanggal', 'tanggal:iso']],
  honor: [['keterangan', 'uraian']],
  pemeliharaan: [['uraian', 'uraian'], ['tanggal', 'tanggal:iso']],
}

// Gabung snack+makan (C.1): AND ketat no_bukti + kegiatan (normalisasi).
// Return { grup (≥2 baris sama persis), saran (beda tipis → manual) }.
const normKunci = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
const nominalTx = (t) => t.pengeluaran || t.kredit || 0
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

// Kelompok ATK (Sprint 004 D.1) — grup by no_bukti; nomor kosong =
// kelompok sendiri (key row unik). Flag per kelompok: spj_atk_flag.
export function kelompokATK(rows = []) {
  const m = new Map()
  for (const r of rows) {
    const nb = normKunci(r.noBukti)
    const k = nb || `row:${r.row ?? Math.random()}`
    if (!m.has(k)) m.set(k, [])
    m.get(k).push(r)
  }
  const out = []
  for (const [k, list] of m) out.push({ key: k, noBukti: list[0].noBukti || '', rows: list, total: list.reduce((s, r) => s + nominalTx(r), 0) })
  return out
}
const ATK_KEY = 'atk_flag'
export const loadAtkFlag = () => storageHelper.get(ATK_KEY, {})
export function simpanAtkFlag(noBukti, v) {
  const nb = normKunci(noBukti)
  if (!nb || (v !== 'siplah' && v !== 'non')) return false
  const s = loadAtkFlag()
  s[nb] = v
  return storageHelper.set(ATK_KEY, s)
}

const isKosong = (v) => v == null || (typeof v === 'string' && v.trim() === '')

export function gabungKonsumsi(rows = []) {
  const perKunci = new Map()
  for (const r of rows) {
    const k = `${normKunci(r.noBukti)}||${normKunci(r.kodeKegiatan || r.kegiatan)}`
    if (!perKunci.has(k)) perKunci.set(k, [])
    perKunci.get(k).push(r)
  }
  const grup = []
  for (const [k, list] of perKunci) {
    if (list.length < 2 || normKunci(list[0].noBukti) === '') continue
    grup.push({ key: k, noBukti: list[0].noBukti, kegiatan: list[0].kodeKegiatan || list[0].kegiatan || '', rows: list, total: list.reduce((s, r) => s + nominalTx(r), 0) })
  }
  // Saran: no_bukti sama, kegiatan nyaris-sama (satu memuat lainnya / beda 1 kata).
  const perBukti = new Map()
  for (const r of rows) {
    const nb = normKunci(r.noBukti)
    if (!nb) continue
    if (!perBukti.has(nb)) perBukti.set(nb, [])
    perBukti.get(nb).push(r)
  }
  const saran = []
  for (const [nb, list] of perBukti) {
    if (list.length < 2) continue
    const keg = [...new Set(list.map((r) => normKunci(r.kodeKegiatan || r.kegiatan)))]
    if (keg.length < 2 || keg.includes('')) continue
    const nyaris = keg.some((a, i) => keg.some((b, j) => i !== j && (a.includes(b) || b.includes(a))))
    if (nyaris) saran.push({ noBukti: list[0].noBukti, kegiatans: keg, rows: list })
  }
  return { grup, saran }
}

// --- Grup se-NoBukti satu bukti satu kelompok (T2, revisi dominan 2026-10-02) ---
// Aturan dominan dari kode rekening via kategoriDenganKoreksi:
// suara terbanyak menang; seri -> Mamin > ATK > Honor > Perjalanan Dinas >
// Pemeliharaan > Belum dipetakan. Nomor kosong tetap baris sendiri.
export const DOMINAN_PRIORITAS = ['mamin', 'atk', 'honor', 'perjalanan_dinas', 'pemeliharaan', 'belum'];

export function kelompokSeNoBukti(rows) {
  rows = rows || [];
  const m = new Map();
  for (const r of rows) {
    const nb = normKunci(r.noBukti);
    const k = nb || ('row:' + (r.row != null ? r.row : Math.random()));
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  const out = [];
  for (const entry of m) {
    const k = entry[0]; const list = entry[1];
    let total = 0;
    for (const r of list) total += nominalTx(r);
    out.push({ key: k, noBukti: list[0].noBukti || '', rows: list, total: total });
  }
  return out;
}

// Dominan satu grup: bila ada anggota belanja (tipe PEMBAYARAN) hanya suara
// belanja yang dihitung, agar penerimaan/internal tak menggeser hasil.
export function dominanKategoriGrup(rows) {
  rows = rows || [];
  const adaBelanja = rows.some(function (r) { return r.tipe === 'PEMBAYARAN'; });
  const pemilih = adaBelanja ? rows.filter(function (r) { return r.tipe === 'PEMBAYARAN'; }) : rows;
  const suara = {};
  const contoh = {};
  const kodeSet = new Set();
  for (const r of pemilih) {
    const kat = kategoriDenganKoreksi(r.kodeRekening, r.noBukti);
    const kunci = (kat && kat.kategori) || 'belum';
    suara[kunci] = (suara[kunci] || 0) + 1;
    if (!contoh[kunci] && kat) contoh[kunci] = kat;
    if (r.kodeRekening) kodeSet.add(String(r.kodeRekening).trim());
  }
  let menang = 'belum';
  let skorMenang = -1;
  for (const k of Object.keys(suara)) {
    const skor = suara[k];
    if (skor > skorMenang || (skor === skorMenang && DOMINAN_PRIORITAS.indexOf(k) < DOMINAN_PRIORITAS.indexOf(menang))) {
      menang = k;
      skorMenang = skor;
    }
  }
  return { dominan: contoh[menang] || null, dominanKategori: menang, suara: suara, kodeList: Array.from(kodeSet) };
}

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

export function prefillDariBKU(bku, menu, formData = {}) {
  const tambahan = {}
  const diisi = []
  const dilewati = []
  // Mamin cerdas: acara + jenis dari parser terpusat (bukan uraian mentah).
  if (menu === 'mamin') {
    const mentah = String(bku?.kegiatanNama || bku?.kegiatan || '').replace(/\s+/g, ' ').trim()
    const namaKeg = /^[\d.\s-]+$/.test(mentah) ? '' : mentah
    const hasil = parseMamin(bku?.uraian || '', namaKeg)
    if (hasil.acara && isKosong(formData.acara)) {
      tambahan.acara = hasil.acara
      diisi.push('acara')
    } else if (hasil.acara) {
      dilewati.push('acara')
    }
    if (hasil.jenis) tambahan.maminJenis = hasil.jenis
  }
  const peta = PREFILL_PETA[menu] || [['uraian', 'uraian']]
  for (const [field, sumber] of peta) {
    const iso = sumber.endsWith(':iso')
    const kunci = iso ? sumber.slice(0, -4) : sumber
    let nilai = bku?.[kunci]
    if (nilai == null || String(nilai).trim() === '') continue
    if (iso) nilai = keISO(nilai)
    if (isKosong(formData[field])) {
      tambahan[field] = nilai
      diisi.push(field)
    } else {
      dilewati.push(field)
    }
  }
  // Referensi BKU selalu dibawa (tidak menimpa apa pun — key namespaced).
  if (formData.bkuSumber == null && bku) {
    tambahan.bkuSumber = { uraian: bku.uraian || '', nominal: bku.nominal || 0, tanggal: bku.tanggal || '', noBukti: bku.noBukti || '', kegiatan: bku.kegiatan || '' }
  }
  return { tambahan, diisi, dilewati }
}

export default { REKENING_KE_MENU, normalisasiRekening, kategoriDariRekening, loadKoreksi, simpanKoreksi, kategoriDenganKoreksi, prefillDariBKU, parseMamin, normalisasiUraian, gabungKonsumsi, loadRiwayat, tambahPeriode, pejabatPada, kelompokATK, loadAtkFlag, simpanAtkFlag, kelompokSeNoBukti, dominanKategoriGrup, grupDenganDominan, saringGrupBermasalah, DOMINAN_PRIORITAS }
