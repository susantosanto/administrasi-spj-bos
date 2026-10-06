/**
 * aturanMamin.js — Sprint 006: template ATURAN offline semua tab Mamin
 * (BUKAN AI, tanpa jaringan). Sibling aturanUndangan.js (Sprint 005) —
 * dipecah ke file sendiri karena induk 144 baris + 4 fungsi baru akan
 * melewati batas Constitution (util ≤200 baris).
 * Semua fungsi MURNI + jujur: tak cocok = '' (bukan karangan).
 * Tanpa nama sekolah/pejabat asli (anti-hardcode) — nama diisi pemanggil
 * dari pejabatPada()/getSchoolData() saat prefill.
 */
import { keISO, hariDariISO, tanggalPanjang } from './aturanUndangan.js'

const satuBaris = (s) => String(s || '').replace(/\s+/g, ' ').trim()
const norm = (s) => satuBaris(s).toLowerCase()
// T23 defense-in-depth: sapu prefiks Konsumsi di dalam template juga
// (duplikat kupasPrefiksKonsumsi agar tanpa impor-silang).
const kupasKonsumsi = (s) => {
  let v = satuBaris(s)
  v = v.replace(/^konsumsi\s*(\(\s*(makan\w*|minum\w*|snack\w*)\s*\)|makan\w*|minum\w*|snack\w*)?\s*/i, '')
  v = v.replace(/\(\s*(makan\w*|minum\w*|snack\w*)\s*\)/gi, '').replace(/\s+/g, ' ').trim()
  return v.replace(/^kegiatan\s+/i, '').replace(/\s+/g, ' ').trim()
}

// T24: untuk jenis=kegiatan acara wajib 'Kegiatan <NamaBersih>'.
// Idempoten: sudah berawalan Kegiatan tak digandakan.
const denganKegiatan = (namaBersih) => {
  const b = satuBaris(namaBersih)
  if (!b) return ''
  if (/^kegiatan\s+/i.test(b)) return b.replace(/^kegiatan\s+/i, 'Kegiatan ')
  return `Kegiatan ${b}`
}
const perluKegiatan = (jenis, ...mentah) =>
  String(jenis || '').toLowerCase() === 'kegiatan' ||
  mentah.some((s) => /^kegiatan\s+/i.test(satuBaris(s)))
const frasaKegiatan = (ac) =>
  /^kegiatan\s+/i.test(ac || '') ? satuBaris(ac) : `kegiatan ${satuBaris(ac) || '...'}`

// Konsumsi dari uraian BKU: jumlah + satuan + jenis ('snack 50 box',
// 'nasi box 100 kotak'). Tak cocok = '' (jujur, bukan karangan).
const SATUAN_KONSUMSI = ['box', 'kotak', 'paket', 'porsi', 'bungkus', 'pcs']

function parseKonsumsi(uraian = '') {
  const n = norm(uraian)
  const mAngka = n.match(/(\d[\d.]*)/)
  const jumlah = mAngka ? mAngka[1] : ''
  let satuan = ''
  for (const s of SATUAN_KONSUMSI) {
    if (n.includes(s)) {
      satuan = s === 'pcs' ? 'Pcs' : s[0].toUpperCase() + s.slice(1)
      break
    }
  }
  let jenis = ''
  if (n.includes('snack')) jenis = 'Snack'
  else if (n.includes('nasi')) jenis = 'Nasi Box'
  else if (n.includes('makan')) jenis = 'Makan'
  else if (n.includes('minum')) jenis = 'Minum'
  return { jumlah, satuan, jenis, cocok: Boolean(jenis || jumlah) }
}

// ─── C.1 MENU_PESANAN (Sprint 007 F3 — dari DOCX Surat Pesanan Mamin) ───
// Nasi Box 6 item + Snack Box 4 item. Tak dikenal → [] (pemanggil fallback
// parseKonsumsi). Semua rows hasil TETAP editable di editor (tidak dikunci).
export const MENU_PESANAN = {
  'nasi box': ['Nasi Putih', 'Ayam Goreng Kremes', 'Urap', 'Tempe Bacem', 'Sambel dan Lalapan', 'Kerupuk'],
  'snack box': ['Risoles Ayam', 'Kue Bolu Mini', 'Lemper', 'Pudding Cup'],
}

function normalisasiJenisPesanan(jenis = '') {
  const n = satuBaris(jenis).toLowerCase()
  if (n.includes('nasi')) return 'nasi box'
  if (n.includes('snack')) return 'snack box'
  return ''
}

// Daftar nama menu per jenis ('Nasi Box' → 6, 'Snack Box' → 4).
// Tak dikenal → [] (jujur, bukan karangan).
export function rincianMenu(jenis = '') {
  const k = normalisasiJenisPesanan(jenis)
  return k && MENU_PESANAN[k] ? [...MENU_PESANAN[k]] : []
}

// Rework-8 (2)(5): perihal SELALU 'Surat Pesanan'; default 2 seksi
// (Nasi 6 + Snack 4) dalam satu surat; MENU_PESANAN sumber tunggal.
// Tiap seksi bisa disable di editor; rows tetap editable tambah/ubah/hapus.
export function bangunPesananDuaSeksi({ jumlah = '', satuan = 'Box' } = {}) {
  const rows = []
  let no = 1
  for (const nama of MENU_PESANAN['nasi box']) rows.push({ id: `bku-nasi-${no}`, no: no++, seksi: 'Nasi Box', uraian: nama, satuan, jumlah })
  for (const nama of MENU_PESANAN['snack box']) rows.push({ id: `bku-snack-${no}`, no: no++, seksi: 'Snack Box', uraian: nama, satuan, jumlah })
  return rows
}

export function templatePesananMamin({ acara = '', tanggal = '', uraian = '', jenis = '' } = {}) {
  const bersih = kupasKonsumsi(acara) || kupasKonsumsi(uraian)
  const ac = bersih && perluKegiatan(jenis, acara, uraian) ? denganKegiatan(bersih) : bersih
  const iso = keISO(tanggal)
  const hari = hariDariISO(iso)
  const tglP = iso ? tanggalPanjang(tanggal) : ''
  const kon = parseKonsumsi(uraian)
  const rincianKalimat = tglP ? `Pesanan untuk tanggal ${tglP} dengan rincian:` : 'Pesanan dengan rincian:'
  const satuanMenu = kon.satuan || 'Box'
  return {
    perihalPesanan: 'Surat Pesanan',
    isiPesanan: `Assalamu'alaikum Wr. Wb.\nDengan hormat,\nBersamaan ini kami sampaikan bahwa sehubungan dengan akan dilaksanakannya ${frasaKegiatan(ac)}.\n${rincianKalimat}`,
    hariPesanan: hari && tglP ? `${hari} ${tglP}` : '',
    jenisPesanan: 'Nasi Box + Snack Box',
    jumlahPesanan: kon.jumlah,
    seksiPesanan: { nasi: true, snack: true },
    pesananRows: bangunPesananDuaSeksi({ jumlah: kon.jumlah, satuan: satuanMenu }),
  }
}

// ─── B.1 templateDaftarHadir: keterangan acara + rows Guru/Tendik ───
// TTD/TTD2 selalu kosong (diisi paraf manual). Bentuk baris SAMA dengan
// toggle peserta manual di editor (id = nip/nuptk/nama).
export function templateDaftarHadir({ acara = '', orang = [], jenis = '' } = {}) {
  const bersih = kupasKonsumsi(acara)
  const ac = bersih && perluKegiatan(jenis, acara) ? denganKegiatan(bersih) : bersih
  const daftar = Array.isArray(orang) ? orang : []
  const rows = []
  for (const o of daftar) {
    if (!o) continue
    const nama = satuBaris(o.nama)
    if (!nama) continue
    rows.push({
      id: o.nip || o.nuptk || nama,
      nama,
      jabatan: satuBaris(o.jabatan),
      ttd: '',
      ttd2: '',
    })
  }
  return { acara: ac, judulDaftarHadir: ac, rows }
}

// ─── C.1 templateBukuTamu: Hari/Tanggal + Tujuan/Uraian + Diterima ───
// Identitas tamu SELALU kosong (tak ada data tamu di BKU — jujur, 0 karangan).
export function templateBukuTamu({ tanggal = '', uraian = '', diterima = '', jenis = '' } = {}) {
  const iso = keISO(tanggal)
  const hari = hariDariISO(iso)
  const tglP = iso ? tanggalPanjang(tanggal) : ''
  const bersih = kupasKonsumsi(uraian)
  const ur = bersih && perluKegiatan(jenis, uraian) ? denganKegiatan(bersih) : bersih
  return {
    bukuTamu: {
      noUrut: '',
      tanggal: hari && tglP ? `${hari}, ${tglP}` : (tglP || satuBaris(tanggal)),
      bertemu: '',
      rows: [],
      diterima: satuBaris(diterima) || 'Kepala Sekolah',
      tiba: '',
      kembali: '',
      tujuan: ur,
      uraian: ur,
    },
  }
}

// ─── D.1 lengkapiNotulen: SEMUA 9 identitas notulen (tanpa butir) ───
// Butir + resume tetap dari drafNotulen() 005 (pemanggil menggabung).
// `pembuka` (kalimat baku) TIDAK disentuh di sini — milik draf 005 (T-06).
// waktu/tempat tanpa sumber = '' (jujur); tempat diisi pemanggil
// (default nama sekolah) bila ada.
export function lengkapiNotulen({
  acara = '',
  tanggal = '',
  tempat = '',
  pimpinanNama = '',
  notulenNama = '',
  pesertaNama = '',
  pesertaJumlah = '',
  jenis = '',
} = {}) {
  const iso = keISO(tanggal)
  const bersih = kupasKonsumsi(acara) || satuBaris(acara)
  const ac = bersih && perluKegiatan(jenis, acara) ? denganKegiatan(bersih) : satuBaris(acara)
  return {
    hari: hariDariISO(iso),
    tanggal: iso ? tanggalPanjang(tanggal) : '',
    waktu: '',
    tempat: satuBaris(tempat),
    acara: ac,
    pimpinan: satuBaris(pimpinanNama),
    notulen: satuBaris(notulenNama),
    peserta: satuBaris(pesertaNama),
    pesertaJumlah: satuBaris(pesertaJumlah),
  }
}

export default { templatePesananMamin, templateDaftarHadir, templateBukuTamu, lengkapiNotulen, rincianMenu, bangunPesananDuaSeksi, MENU_PESANAN }
