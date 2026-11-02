/** aturanPesanan.js — Sprint 007: pesanan/konsumsi Mamin (sibling
 * bkuKategori.js, pola 006). Pindahan byte-identical: parser Mamin +
 * bacaGTKUntukHadir + gabung/kelompok ATK/konsumsi/NoBukti + dominan. */
import storageHelper from './storageHelper.js'
import { kategoriDenganKoreksi } from './bkuKategori.js'

// ─── Parser Mamin: "beban makanan dan minuman"→rapat; "konsumsi…"→kegiatan;
// else fallback jujur {jenis:'', cocok:false}. Tak cocok = '' (0 karangan).
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
    .replace(/^(beban|belanja)\s+makanan dan minuman/i, '')
    .trim()
    .replace(/^rapat\s*[-–—:.]?\s*/i, '')
    .trim()
}

// Rework-8 (3): ekor jamuan apa pun ("Jamuan ... Box") dibuang, case-insensitive.
function kupasEkorJamuan(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*(jamuan(\s+\w+)*\s+box|snack\s+box|makanan\s+box)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// T23: sapu TOTAL "Konsumsi (makan/makanan/minum/minuman/snack)" +
// "Kegiatan" (dengan/tanpa kurung). Idempoten: nilai bersih tak berubah.
export function kupasPrefiksKonsumsi(s) {
  let v = String(s || '').replace(/\s+/g, ' ').trim()
  v = v.replace(/^konsumsi\s*(\(\s*(makan\w*|minum\w*|snack\w*)\s*\)|makan\w*|minum\w*|snack\w*)?\s*/i, '')
  v = v.replace(/\(\s*(makan\w*|minum\w*|snack\w*)\s*\)/gi, '').replace(/\s+/g, ' ').trim()
  return v.replace(/^kegiatan\s+/i, '').replace(/\s+/g, ' ').trim()
}

// T24: prefiks Rapat/Kegiatan idempoten (sudah berawalan tak digandakan).
const denganPrefiks = (namaBersih, kata) => {
  const b = String(namaBersih || '').replace(/\s+/g, ' ').trim()
  const re = new RegExp(`^${kata}\\s+`, 'i')
  if (!b) return kata
  return re.test(b) ? b.replace(re, `${kata} `) : `${kata} ${b}`
}
const denganRapat = (b) => denganPrefiks(b, 'Rapat')
export const denganKegiatan = (b) => denganPrefiks(b, 'Kegiatan')

export function parseMamin(uraian, kegiatanNama = '') {
  const norm = normalisasiUraian(uraian)
  const keg = String(kegiatanNama || '').replace(/\s+/g, ' ').trim()
  if (norm.includes('makanan dan minuman')) {
    const dariBaris = ambilBarisKedua(uraian)
    const bersih = kupasEkorJamuan(dariBaris || keg || kupasPrefiksSatuBaris(uraian))
    return { jenis: 'rapat', acara: denganRapat(bersih), cocok: true }
  }
  if (norm.includes('konsumsi') || (!norm && normalisasiUraian(kegiatanNama).includes('konsumsi'))) {
    const dariBaris = ambilBarisKedua(uraian)
    const mentah = keg || dariBaris || String(uraian || '').replace(/\s+/g, ' ').trim()
    const bersih = kupasPrefiksKonsumsi(mentah)
    return { jenis: 'kegiatan', acara: bersih ? denganKegiatan(bersih) : 'Kegiatan', cocok: true }
  }
  return { jenis: '', acara: String(uraian || '').replace(/\s+/g, ' ').trim(), cocok: false }
}

// B.1 Hadir GTK: Guru→Tendik dari storage, dedupe via Set, kosong→[] jujur.
export function bacaGTKUntukHadir() {
  let guru = []
  let tendik = []
  try { guru = storageHelper.get('data_guru', []) || [] } catch { guru = [] }
  try { tendik = storageHelper.get('data_tendik', []) || [] } catch { tendik = [] }
  const gabung = [...(Array.isArray(guru) ? guru : []), ...(Array.isArray(tendik) ? tendik : [])]
  const seen = new Set()
  return gabung.filter((p) => {
    if (!p) return false
    const k = p.nip || p.nuptk || p.nama || ''
    if (!k || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// Gabung snack+makan (C.1): AND ketat no_bukti + kegiatan.
const normKunci = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
const nominalTx = (t) => t.pengeluaran || t.kredit || 0

// Kelompok ATK (D.1) — grup by no_bukti; nomor kosong = kelompok sendiri.
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

// Grup se-NoBukti (T2): suara terbanyak menang; seri → prioritas di bawah.
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

// Dominan: bila ada belanja (PEMBAYARAN) hanya suara belanja dihitung.
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

export default { normalisasiUraian, parseMamin, kupasPrefiksKonsumsi, denganKegiatan, bacaGTKUntukHadir, gabungKonsumsi, kelompokATK, loadAtkFlag, simpanAtkFlag, kelompokSeNoBukti, dominanKategoriGrup, DOMINAN_PRIORITAS }
