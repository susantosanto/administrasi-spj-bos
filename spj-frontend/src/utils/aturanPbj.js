/** aturanPbj.js — Sprint 010: parse invoice SIPLah + prefill PBJ offline
 * (BUKAN AI, 0 lib baru). {cleanText,tables} pdfTableExtractor → draf PBJ;
 * tak cocok = string kosong (jujur). Batas Constitution: util ≤200 baris. */
import { keISO } from './aturanUndangan.js'

const satuBaris = (s) => String(s || '').replace(/\s+/g, ' ').trim()
// Rupiah Indonesia "12,500" / "5.826.175" → integer (tanpa tebakan desimal).
const keRp = (s) => {
  const d = String(s || '').replace(/[^\d]/g, '')
  return d ? parseInt(d, 10) : 0
}
// 'DD/MM/YYYY' invoice → ISO (reuse keISO via normalisasi slash → dash).
export function tanggalInvoiceKeISO(tgl) {
  const s = satuBaris(tgl).replace(/\//g, '-')
  return keISO(s)
}
// Ambil nilai "Label: <nilai>" generik dari teks gabungan (berhenti di label
// berikut atau akhir). Jujur: '' bila tak ada.
function nilaiSetelah(teks, label, berhenti = []) {
  const stop = ['Alamat', 'Kontak', 'NPWP', 'NPSN', 'Untuk', 'Pembayaran', 'Dari', 'Nama', 'Metode', 'Catatan', 'Virtual', 'HALAMAN', 'TABEL', ...berhenti].join('|')
  const m = new RegExp(`${label}\\s*:\\s*(.+?)(?=\\s*(?:${stop})\\b|$)`, 'i').exec(teks || '')
  return satuBaris(m?.[1]).replace(/\s*\|\s*$/, '').replace(/\s*---[\s\S]*$/, '').replace(/📋[\s\S]*$/, '')
}

// ─── parseInvoiceSIPLah: teks invoice → draf PBJ (cocok=false bila bukan) ───
// (A) baris tabel "1 | Uraian | Rp. 11,261 | Rp. 1,239 | 30 | 30 | Rp. 337,830"
//     (uraian lanjut beda-baris dijahit dari ekor); (B) fallback teks mentah
//     ber-marker "30 X Rp. 12,500 = Rp. 375,000" (hanya bila (A) kosong).
// Ekor setelah kolom total = lanjutan uraian beda-baris ("Minum Golden") +
// marker "N X Rp. = Rp." + footer/marker-tabel → ambil lanjutannya saja.
const lanjutanUraian = (s) => satuBaris(String(s || '').replace(/\s*\|\s*/g, ' ').split(/DPP Nilai Lain|PPN \(12%\)|GRAND TOTAL|PPh Pasal 22|--- HALAMAN|📋 HEADER/i)[0].replace(/\d+\s*X\s*Rp\.\s*[\d.,]+|=\s*Rp\.\s*[\d.,]+|Rp\.\s*[\d.,]+/gi, ' '))
export function parseInvoiceSIPLah({ cleanText = '', tables = [] } = {}) {
  const mentah = String(cleanText || '').replace(/\t/g, ' | ').replace(/[^\S\n]+/g, ' ')
  const teks = satuBaris(mentah)
  const kosong = { cocok: false, nomorInvoice: '', tanggalInvoiceISO: '', penyedia: {}, satdik: {}, items: [], dpp: 0, ppn12: 0, grandTotal: 0 }
  if (!teks) return kosong
  const noM = /NO:\s*([A-Z0-9]+(?:\/[A-Z0-9]+)+)/i.exec(teks)
  const tglM = /Tanggal Dokumen\s*:\s*(\d{2}\/\d{2}\/\d{4})/i.exec(teks)
  const items = []
  // (A) jahit baris lanjutan, lalu cocokkan per buffer.
  const reBarisA = /^\s*(\d+)\s*\|\s*([^|]*?)\s*\|\s*Rp\.\s*([\d.,]+)\s*\|\s*Rp\.\s*([\d.,]+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*Rp\.\s*([\d.,]+)/
  const buffers = []
  for (const baris of mentah.split('\n')) {
    const b = baris.trim()
    if (!b) continue
    if (/^\s*\d+\s*\|/.test(b)) buffers.push(b)
    else if (buffers.length > 0) buffers[buffers.length - 1] += ` ${b}`
  }
  for (const buf of buffers) {
    const normal = buf.replace(/\s*\|\s*/g, ' | ').trim()
    const r = reBarisA.exec(normal)
    if (!r) continue
    const uraian = satuBaris(`${r[2]} ${lanjutanUraian(normal.slice(r.index + r[0].length))}`)
    if (!uraian || /GRAND TOTAL|^DPP\b|PPN \(12%\)/i.test(uraian)) continue
    items.push({
      uraian,
      qtyPesan: parseInt(r[5], 10) || 0,
      qtyTerima: parseInt(r[6], 10) || parseInt(r[5], 10) || 0,
      hargaSebelumPPN: keRp(r[3]),
      ppnPerItem: keRp(r[4]),
      totalSebelumPPN: keRp(r[7]),
    })
    if (items.length >= 100) break
  }
  // (B) fallback teks mentah ber-marker (hanya bila (A) kosong).
  const reQty = /(\d+)\s*X\s*Rp\.\s*([\d.,]+)(?:\s*\|)?\s*=\s*Rp\.\s*([\d.,]+)/g
  const reEkor = /^(?:\s*\|)+\s*Rp\.\s*([\d.,]+)(?:\s*\|)+\s*Rp\.\s*([\d.,]+)(?:\s*\|)+\s*(\d+)(?:\s*\|)+\s*(\d+)(?:\s*\|)+\s*Rp\.\s*([\d.,]+)/
  let m
  if (items.length === 0) {
    while ((m = reQty.exec(teks)) !== null) {
    const ekor = reEkor.exec(teks.slice(m.index + m[0].length, m.index + m[0].length + 160))
    if (!ekor) continue
    const prefix = teks.slice(Math.max(0, m.index - 400), m.index)
    const semuaNo = [...prefix.matchAll(/\|\s*(\d+)\s*\|/g)]
    const noM2 = semuaNo.length > 0 ? semuaNo[semuaNo.length - 1] : null
    if (!noM2) continue
    const uraian = satuBaris(prefix.slice(noM2.index + noM2[0].length).replace(/\s*\|\s*/g, ' '))
    if (!uraian || /GRAND TOTAL|^DPP\b/i.test(uraian)) continue
    items.push({
      uraian,
      qtyPesan: parseInt(ekor[3], 10) || 0,
      qtyTerima: parseInt(ekor[4], 10) || parseInt(ekor[3], 10) || 0,
      hargaSebelumPPN: keRp(ekor[1]),
      ppnPerItem: keRp(ekor[2]),
      totalSebelumPPN: keRp(ekor[5]),
    })
    if (items.length >= 100) break
    }
  }
  if (!noM && items.length === 0) return kosong
  const gtM = /GRAND TOTAL(?:\s*\|)*\s*Rp\.\s*([\d.,]+)/i.exec(teks)
  const dppM = /DPP Nilai Lain \(Barang\/Jasa\)\s*\|*\s*Rp\.\s*([\d.,]+)[\s\S]{0,200}?PPN \(12%\)\s*\|*\s*Rp\.\s*([\d.,]+)/i.exec(teks)
    || /DPP Nilai Lain \(Barang\/Jasa\)[\s\S]*?Rp\.\s*([\d.,]+)(?:\s*\|)+\s*Rp\.\s*([\d.,]+)/i.exec(teks)
  return {
    cocok: true,
    nomorInvoice: satuBaris(noM?.[1]),
    tanggalInvoiceISO: tanggalInvoiceKeISO(tglM?.[1]),
    tanggalInvoiceTampil: satuBaris(tglM?.[1]),
    penyedia: {
      nama: nilaiSetelah(teks, 'Nama Penyedia'),
      alamat: nilaiSetelah(teks, 'Alamat Penyedia'),
      kontak: nilaiSetelah(teks, 'Kontak Penyedia'),
      npwp: nilaiSetelah(teks, 'NPWP Penyedia'),
    },
    satdik: { nama: nilaiSetelah(teks, 'Nama Satdik'), npsn: nilaiSetelah(teks, 'NPSN Satdik') },
    items,
    dpp: keRp(dppM?.[1]),
    ppn12: keRp(dppM?.[2]),
    grandTotal: keRp(gtM?.[1]),
    tabelTerdeteksi: Array.isArray(tables) ? tables.length : 0,
  }
}

const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const bulanDariISO = (iso) => { const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso || '')); return m ? BULAN_ID[parseInt(m[2], 10) - 1] || '' : '' }

// ─── Bentuk form PBJ kosong (5 sub-dokumen + data rekap sheet "data") ───
export function pbjFormKosong() {
  return {
    perencanaan: { nomorSurat: '', tanggalSurat: '', kegiatan: '', spesifikasi: '', alokasi: '', syaratA: '', syaratB: '', syaratC: '', namaPelaksana: '' },
    pesanan: { nomorPesanan: '', tanggalPesanan: '', kepadaPesanan: '', alamatToko: '', rows: [], grandTotal: '' },
    bahp: { nomorBahp: '', tanggalPeriksa: '', acuanPesanan: '', namaPemeriksa: '', hasilPeriksa: '' },
    bast: { nomorBast: '', tanggalTerima: '', pihakPertama: '', pihakKedua: '', kesesuaian: '', kondisi: '' },
    nego: { nomorNego: '', tanggalNego: '', produkI: '', produkII: '', rows: [] },
    data: { bulan: '', noBukti: '', tanggalPesanan: '', jumlahBarang: '', spesifikasi: '', waktuSerah: '', alokasi: '', jenisPenyedia: '', namaPenyedia: '', direktur: '', npwp: '', alamat: '', telp: '' },
  }
}

// ─── terapkanPrefillPbj: user > invoice > BKU; ketikan tak pernah ditimpa ───
export function terapkanPrefillPbj(formLama = {}, { invoice = null, bku = null } = {}) {
  const form = { ...pbjFormKosong(), ...formLama }
  for (const k of Object.keys(form)) form[k] = { ...pbjFormKosong()[k], ...(formLama?.[k] || {}) }
  const inv = invoice?.cocok ? invoice : null
  const tertimpa = []
  const isi = (doc, field, nilai) => {
    const v = satuBaris(nilai)
    if (!v || satuBaris(form[doc]?.[field])) return
    form[doc][field] = v
    tertimpa.push(`${doc}.${field}`)
  };
  if (inv) {
    const tgl = inv.tanggalInvoiceISO
    isi('pesanan', 'kepadaPesanan', inv.penyedia.nama)
    isi('pesanan', 'alamatToko', inv.penyedia.alamat)
    isi('bast', 'pihakPertama', inv.penyedia.nama)
    isi('nego', 'produkI', inv.penyedia.nama)
    isi('bahp', 'acuanPesanan', inv.nomorInvoice)
    for (const d of ['tanggalPesanan', 'tanggalPeriksa', 'tanggalTerima', 'tanggalNego', 'tanggalSurat']) {
      const doc = d === 'tanggalPesanan' ? 'pesanan' : d === 'tanggalPeriksa' ? 'bahp' : d === 'tanggalTerima' ? 'bast' : d === 'tanggalNego' ? 'nego' : 'perencanaan'
      isi(doc, d, tgl)
    }
    if (inv.items.length > 0 && (form.pesanan.rows || []).length === 0) {
      form.pesanan.rows = inv.items.map((it) => ({ uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan, satuan: '', harga: it.hargaSebelumPPN, total: it.totalSebelumPPN }))
      tertimpa.push('pesanan.rows')
    }
    if (inv.grandTotal && !satuBaris(form.pesanan.grandTotal)) {
      form.pesanan.grandTotal = String(inv.grandTotal)
      tertimpa.push('pesanan.grandTotal')
    }
    if (inv.items.length > 0 && (form.nego.rows || []).length === 0) {
      form.nego.rows = inv.items.map((it) => ({ uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan, penawaran: it.hargaSebelumPPN, nego: it.hargaSebelumPPN, ket: '' }))
      tertimpa.push('nego.rows')
    }
  }
  if (bku) {
    const isoTgl = keISO(bku.tanggal || '')
    isi('perencanaan', 'kegiatan', bku.uraian)
    isi('perencanaan', 'spesifikasi', bku.uraian)
    isi('perencanaan', 'alokasi', bku.nominal)
    isi('bahp', 'acuanPesanan', bku.noBukti)
    for (const [doc, f] of [['pesanan', 'tanggalPesanan'], ['bahp', 'tanggalPeriksa'], ['bast', 'tanggalTerima'], ['nego', 'tanggalNego'], ['perencanaan', 'tanggalSurat']]) isi(doc, f, isoTgl)
  }
  // Rekap sheet "data": user > invoice > BKU; ketikan tak pernah ditimpa.
  if (inv) {
    isi('data', 'tanggalPesanan', inv.tanggalInvoiceISO)
    isi('data', 'bulan', bulanDariISO(inv.tanggalInvoiceISO))
    isi('data', 'jumlahBarang', `${inv.items.length} item`)
    isi('data', 'spesifikasi', inv.items.map((it) => it.uraian).join('; ').slice(0, 200))
    isi('data', 'alokasi', inv.grandTotal)
    isi('data', 'namaPenyedia', inv.penyedia.nama)
    isi('data', 'alamat', inv.penyedia.alamat)
    isi('data', 'npwp', inv.penyedia.npwp)
    isi('data', 'telp', inv.penyedia.kontak)
  }
  if (bku) {
    const isoTgl = keISO(bku.tanggal || '')
    isi('data', 'noBukti', bku.noBukti)
    isi('data', 'tanggalPesanan', isoTgl)
    isi('data', 'bulan', bulanDariISO(isoTgl))
    isi('data', 'spesifikasi', bku.uraian)
    isi('data', 'alokasi', bku.nominal)
  }
  return { formBaru: form, tertimpa }
}

export default { parseInvoiceSIPLah, pbjFormKosong, terapkanPrefillPbj, tanggalInvoiceKeISO }
