/**
 * pbjInvoice — pipeline "Upload Invoice SIPLah" (PDF → draf → form PBJ + arsip).
 *
 * Sumber asli fitur: halaman Dokumen Kelengkapan (Sprint 010/011, Task 57).
 * Sprint 020: diekstrak ke sini supaya blok "Dokumen PBJ" di sidebar BKU
 * (SidebarPbj.jsx) memakai pipeline yang SAMA PERSIS — satu sumber kode,
 * tanpa duplikasi parse/prefill.
 *
 * Isi:
 * - bacaInvoicePdf(file)            → draf parseInvoiceSIPLah (throw bila gagal baca)
 * - drafKeInvoice(draf, namaFile)   → rekaman arsip 1 baris (spj_pbj_invoices)
 * - paksaFormDariInvoice(prev, draf)→ form PBJ dipaksa ikut invoice (rows + data)
 * - tambahInvoiceKeArsip(draf, namaFile) → append 1 baris ke spj_pbj_invoices
 * - KATEGORI_UPLOAD_PBJ             → kategori BKU yang dapat tombol upload
 *
 * Aturan jujur (warisan Task 57): gagal parse → TIDAK menambah baris arsip,
 * pemanggil menampilkan pesan "isi manual".
 */
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import storageHelper from './storageHelper'
import { parseInvoiceSIPLah, terapkanPrefillPbj } from './aturanPbj'

/** Kategori BKU yang mendapat fitur upload invoice di sidebar (permintaan user
 * Sprint 020: mamin, atk, konsumsi, pemeliharaan, perjalanan dinas — konsumsi
 * dipetakan ke 'mamin' oleh bkuKategori). Honor TIDAK termasuk. */
export const KATEGORI_UPLOAD_PBJ = ['mamin', 'atk', 'pemeliharaan', 'perjalanan_dinas']

const BULAN_ID_PBJ = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** '2026-02-14' → 'Februari'; '' bila tidak dikenal. */
export function bulanDariISOPbj(iso) {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso || ''))
  return m ? (BULAN_ID_PBJ[parseInt(m[2], 10) - 1] || '') : ''
}

/** Baca 1 file PDF invoice SIPLah → draf parseInvoiceSIPLah. Throw bila gagal. */
export async function bacaInvoicePdf(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf')
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const { extractTables, extractAllText } = await import('./pdfTableExtractor')
  const hasil = await extractTables(pdf, { maxPages: pdf.numPages })
  let teks = hasil.tableText || ''
  try { teks += `\n${await extractAllText(pdf)}` } catch { /* tabel saja cukup */ }
  return parseInvoiceSIPLah({ cleanText: teks, tables: hasil.tables })
}

/** Draf parse → rekaman arsip 1 baris (bentuk sama dengan halaman Kelengkapan). */
export function drafKeInvoice(draf, namaFile = '') {
  const items = (draf.items || []).map((it) => ({
    uraian: it.uraian || '',
    qty: it.qtyTerima || it.qtyPesan || 0,
    satuan: '',
    harga: it.hargaSebelumPPN || 0,
    total: it.totalSebelumPPN || 0,
  }))
  const tglISO = draf.tanggalInvoiceISO || ''
  return {
    id: `${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    nomor: draf.nomorInvoice || '',
    tanggalISO: tglISO,
    tanggalTampil: draf.tanggalInvoiceTampil || tglISO,
    bulan: bulanDariISOPbj(tglISO),
    jumlahLabel: `${items.length} item`,
    spesifikasi: items.map((it) => it.uraian).filter(Boolean).join('; ').slice(0, 200),
    alokasi: draf.grandTotal || 0,
    namaPenyedia: draf.penyedia?.nama || '',
    npwp: draf.penyedia?.npwp || '',
    alamat: draf.penyedia?.alamat || '',
    telp: draf.penyedia?.kontak || '',
    grandTotal: draf.grandTotal || 0,
    items,
    namaFile,
  }
}

/** Form + isian mengikuti invoice (paksa, bukan isi-merge) — warisan Kelengkapan. */
export function paksaFormDariInvoice(prev, draf) {
  const { formBaru } = terapkanPrefillPbj(prev, { invoice: draf })
  const items = (draf.items || []).map((it) => ({
    uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan, satuan: '',
    harga: it.hargaSebelumPPN, total: it.totalSebelumPPN,
  }))
  formBaru.pesanan = { ...formBaru.pesanan, rows: items,
    grandTotal: draf.grandTotal ? String(draf.grandTotal) : formBaru.pesanan.grandTotal }
  formBaru.nego = { ...formBaru.nego, rows: (draf.items || []).map((it) => ({
    uraian: it.uraian, qty: it.qtyTerima || it.qtyPesan,
    penawaran: it.hargaSebelumPPN, nego: it.hargaSebelumPPN, ket: '' })) }
  formBaru.data = { ...formBaru.data,
    jumlahBarang: `${(draf.items || []).length} item`,
    spesifikasi: (draf.items || []).map((it) => it.uraian).join('; ').slice(0, 200),
    alokasi: draf.grandTotal ? String(draf.grandTotal) : formBaru.data.alokasi,
    namaPenyedia: draf.penyedia?.nama || formBaru.data.namaPenyedia,
    alamat: draf.penyedia?.alamat || formBaru.data.alamat,
    npwp: draf.penyedia?.npwp || formBaru.data.npwp,
    telp: draf.penyedia?.kontak || formBaru.data.telp }
  return formBaru
}

/** Append 1 rekaman ke arsip global `spj_pbj_invoices`. Return jumlah baris baru. */
export function tambahInvoiceKeArsip(draf, namaFile = '') {
  const lama = storageHelper.get('pbj_invoices', [])
  const list = Array.isArray(lama) ? lama : []
  const baru = [...list, drafKeInvoice(draf, namaFile)]
  storageHelper.set('pbj_invoices', baru)
  return baru.length
}

export default { bacaInvoicePdf, drafKeInvoice, paksaFormDariInvoice, tambahInvoiceKeArsip, bulanDariISOPbj, KATEGORI_UPLOAD_PBJ }
