/**
 * aturanUndangan.js — Sprint 005: mesin template ATURAN offline (BUKAN AI,
 * tanpa jaringan). Prefill otomatis saat buka dari BKU: nama acara,
 * isi undangan baku per kategori, draf notulen, + snapshot sebelum timpa.
 * Batas Constitution: file util ≤200 baris. Tanpa nama sekolah/pejabat
 * asli (anti-hardcode) — nama diisi dari pejabatPada() saat prefill.
 */
import storageHelper from './storageHelper.js'

// Sprint 006: 4 template semua tab Mamin tinggal di aturanMamin.js (sibling,
// karena induk + 4 fungsi > batas 200 baris). Re-export agar jalur impor
// lama (bkuKategori, DokumenSPJPage) tetap satu pintu.
export { templatePesananMamin, templateDaftarHadir, templateBukuTamu, lengkapiNotulen } from './aturanMamin.js'

const norm = (s) => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ')
const satuBaris = (s) => String(s || '').replace(/\s+/g, ' ').trim()
const barisPertama = (s) => satuBaris(String(s || '').split(/\r?\n/)[0])

// 'DD-MM-YYYY' (BKU) atau ISO → 'YYYY-MM-DD' ('' bila tak dikenal — jujur).
export function keISO(isoAtauBku) {
  const s = satuBaris(isoAtauBku)
  const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : ''
}

const HARI_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function pecahISO(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '')
  return m ? { y: +m[1], mo: +m[2], d: +m[3] } : null
}

// Hari Indonesia dari ISO; '' bila tanggal tak dikenal (tanpa tebakan).
export function hariDariISO(iso) {
  const p = pecahISO(iso)
  if (!p) return ''
  return HARI_ID[new Date(p.y, p.mo - 1, p.d).getDay()]
}

// '2026-05-08' → '8 Mei 2026'; input mentah dikembalikan bila tak dikenal.
export function tanggalPanjang(tgl) {
  const iso = keISO(tgl)
  const p = pecahISO(iso)
  if (!p) return satuBaris(tgl)
  return `${p.d} ${BULAN_ID[p.mo - 1]} ${p.y}`
}

// ─── A.1 parsePerjalanan: uraian+kegiatan → maksud/tujuan; tak cocok = '' ───
const PERJ_KUNCI = ['gugus', 'rapat kerja teknis', 'rakor', 'koordinasi', 'perjalanan dinas', 'perjadin', 'bimtek', 'sosialisasi', 'workshop', 'pelatihan', 'rapat']

export function parsePerjalanan(uraian = '', kegiatanNama = '') {
  const n = norm(`${uraian} ${kegiatanNama}`)
  const keg = satuBaris(kegiatanNama) || barisPertama(uraian)
  const cocok = PERJ_KUNCI.some((k) => n.includes(k))
  if (!cocok) return { maksud: '', tujuan: '', cocok: false }
  const maksud = keg ? `Mengikuti ${keg}` : barisPertama(uraian)
  const tujuan = n.includes('gugus') ? 'Tingkat gugus' : ''
  return { maksud, tujuan, cocok: true }
}

// ─── B.1 templateUndanganMamin: salam + 'Bersamaan…' + T1 + penutup baku ───
// T24: jenis=kegiatan → acara wajib 'Kegiatan <NamaBersih>' (idempoten).
export function templateUndanganMamin({ acara = '', hari = '', tanggal = '', tempat = '', waktu = '', jenis = '' } = {}) {
  const mentah = satuBaris(acara)
  const bersih = mentah.replace(/^kegiatan\s+/i, '').replace(/\s+/g, ' ').trim()
  const perlu = String(jenis || '').toLowerCase() === 'kegiatan' || /^kegiatan\s+/i.test(mentah)
  const ac = bersih && perlu ? `Kegiatan ${bersih.replace(/^kegiatan\s+/i, '')}`.replace(/\s+/g, ' ').trim() : mentah
  const frasa = /^kegiatan\s+/i.test(ac) ? ac : `kegiatan ${ac || '...'}`
  return {
    perihalUndangan: ac ? `Undangan ${ac}` : '',
    isiUndangan: `Assalamu'alaikum Wr. Wb.\nDengan hormat,\nBersamaan ini kami sampaikan bahwa pelaksanaan ${frasa} akan dilaksanakan pada :`,
    hariUndangan: satuBaris(hari),
    tanggalAcara: satuBaris(tanggal),
    tempatAcara: satuBaris(tempat),
    waktuAcara: satuBaris(waktu),
    pukulUndangan: satuBaris(waktu),
    penutupUndangan1: 'Mengingat pentingnya acara tersebut, kami harap kehadiran tepat pada waktu yang telah ditentukan.',
    penutupUndangan2: 'Demikian kami sampaikan. Atas perhatiannya dan kehadirannya, kami ucapkan terima kasih.',
  }
}

// ─── B.2 templateUndanganPerjDinas: SPT + SPD 11 baris + BOS Reguler ───
export function templateUndanganPerjDinas({ maksud = '', hari = '', tanggal = '', tempat = '' } = {}) {
  const mk = satuBaris(maksud)
  return {
    // SPT (blok cetak sudah memuat statis 'MENUGASKAN')
    sptUntuk: mk,
    sptHari: satuBaris(hari),
    sptTanggal: satuBaris(tanggal),
    sptTempat: satuBaris(tempat),
    // SPD 11 baris (T3): PA/KPA + pelaksana diisi dari pejabat/rows saat prefill
    sppdMaksud: mk,
    sppdTujuan: mk,
    sppdAlat: 'Kendaraan darat',
    sppdLama: '1 (satu) hari',
    sppdTanggalBerangkat: keISO(tanggal),
    sppdTanggalKembali: keISO(tanggal),
    sppdTempatTujuan: satuBaris(tempat),
    sppdSkpd: 'BOS Reguler',
    sppdAkun: '5.1.02.04.01.0003',
    sppdKeterangan: mk ? `Perjalanan dinas dalam rangka ${mk}.` : '',
    // Undangan gugus (DokA sekuen)
    kepadaUndangan: 'Kepala Sekolah se-gugus',
    perihalUndangan: mk ? `Undangan ${mk}` : '',
    isiUndangan: `Dengan hormat,\nBersamaan ini kami sampaikan bahwa${mk ? ` ${mk}` : ' kegiatan tersebut'} akan dilaksanakan pada :`,
    penutupUndangan1: 'Mengingat pentingnya acara tersebut, kami harap kehadiran tepat pada waktu yang telah ditentukan.',
    penutupUndangan2: 'Demikian undangan ini kami sampaikan. Atas perhatiannya dan kehadirannya, kami ucapkan terima kasih.',
  }
}

// ─── C.1 drafNotulen: identitas 9 + pembuka baku + butir draf (editable) ───
export function drafNotulen({ acara = '', jenis = '', tanggal = '' } = {}) {
  const ac = satuBaris(acara) || '...'
  const tgl = tanggalPanjang(tanggal)
  const butir = [
    `Membahas pelaksanaan ${ac}${jenis ? ` (${jenis})` : ''}${tgl ? ` pada ${tgl}` : ''}.`,
    'Menyepakati susunan panitia dan pembagian tugas kegiatan.',
    'Menyepakati jadwal, tempat, dan kebutuhan kegiatan.',
    'Menyepakati sumber pembiayaan dari dana BOS Reguler.',
    'Hal-hal lain yang dianggap perlu disesuaikan dengan kondisi sekolah.',
  ]
  return {
    pembuka: 'Rapat membahas dan menyimpulkan sebagai berikut:',
    resume: butir.map((b, i) => `${i + 1}. ${b}`).join('\n'),
    pesertaJumlah: '',
  }
}

// ─── D.1 snapshot sebelum timpa (1 slot terakhir) + urungkan ───
// Key storage penuh: spj_otomatis_snapshot (prefix spj_ via storageHelper).
const SNAP_KEY = 'otomatis_snapshot'

export function snapshotSebelumTimpa(nilaiLama = {}, fieldList = [], sumberNoBukti = '') {
  const nilai = {}
  for (const f of fieldList) nilai[f] = nilaiLama?.[f] ?? ''
  const snap = { ts: Date.now(), sumber_no_bukti: String(sumberNoBukti || ''), field_tertimpa: [...fieldList], nilai_lama: nilai }
  storageHelper.set(SNAP_KEY, snap)
  return snap
}

export function bacaSnapshot() {
  return storageHelper.get(SNAP_KEY, null)
}

export function urungkanTimpa() {
  const snap = bacaSnapshot()
  if (!snap) return { nilai: null, snap: null }
  return { nilai: snap.nilai_lama || {}, snap }
}

export default { keISO, hariDariISO, tanggalPanjang, parsePerjalanan, templateUndanganMamin, templateUndanganPerjDinas, drafNotulen, snapshotSebelumTimpa, bacaSnapshot, urungkanTimpa }
