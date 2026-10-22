/**
 * pbjPrefill — isian otomatis Dokumen PBJ dari satu baris BKU (Sprint 018, K-11).
 *
 * Yang terisi otomatis (BLUEPRINT §3.4): Tanggal · Kegiatan/Pekerjaan ·
 * Alokasi Anggaran (nominal) · No. Bukti.
 *
 * Aturan:
 * - **formData-first**: isian yang sudah ada (user / entri tersimpan) TIDAK ditimpa.
 * - Tanggal BKU bisa format 'dd-mm-yyyy' (tanggalStr) → dikonversi ke ISO
 *   (input PBJ bertipe tanggal).
 * - Tanpa sumber → `''` (jujur).
 * - Fungsi MURNI: tidak menyentuh storage.
 */
import { keISO } from './aturanUndangan'
import { formPbjKosong } from './pbjBkuStore'

const BULAN_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

/** '2026-02-14' → 'Februari'; '' bila tidak dikenal. */
export function bulanDariISO(iso) {
  const m = /^(\d{4})-(\d{2})-\d{2}$/.exec(String(iso || ''))
  return m ? (BULAN_ID[parseInt(m[2], 10) - 1] || '') : ''
}

const kosong = (v) => v == null || String(v).trim() === ''

/** Format rupiah tanpa pemisah ribuan (dipakai input teks alokasi). */
const angka = (n) => (Number(n) || 0).toLocaleString('id-ID')

/**
 * @param {object} formLama  form PBJ yang sudah ada (entri tersimpan / isian user)
 * @param {object} bku       baris BKU { tanggal, uraian, kegiatanNama, noBukti, pengeluaran, nominal }
 * @returns {object} form PBJ baru (6 tab)
 */
export function prefillPbjDariBku(formLama = {}, bku = {}) {
  const form = formPbjKosong()
  for (const k of Object.keys(form)) form[k] = { ...(formLama?.[k] || {}) }

  const iso = keISO(bku?.tanggal || bku?.tanggalISO || '')
  // BLUEPRINT §3.4: uraian BKU didahulukan (lengkap: "Konsumsi Rapat Guru 100 Box"),
  // fallback ke kegiatanNama (nama kegiatan dari kode referensi).
  const kegiatan = String(bku?.uraian || bku?.kegiatanNama || '').trim()
  const nominal = Number(bku?.pengeluaran || bku?.nominal || 0)
  const noBukti = String(bku?.noBukti || '').trim()

  const isi = (doc, key, nilai) => {
    if (kosong(nilai)) return
    if (!kosong(form[doc]?.[key])) return
    form[doc][key] = nilai
  }

  isi('perencanaan', 'tanggalSurat', iso)
  isi('perencanaan', 'kegiatan', kegiatan)
  isi('perencanaan', 'alokasi', nominal ? angka(nominal) : '')

  isi('pesanan', 'tanggalPesanan', iso)
  isi('pesanan', 'grandTotal', nominal ? angka(nominal) : '')

  isi('data', 'bulan', bulanDariISO(iso))
  isi('data', 'noBukti', noBukti)
  isi('data', 'tanggalPesanan', iso)
  isi('data', 'alokasi', nominal ? angka(nominal) : '')
  isi('data', 'spesifikasi', kegiatan)

  return form
}

/**
 * Sinkronkan field PBJ yang punya SUMBER TUNGGAL (revisi 2026-10-22).
 *
 * - `perencanaan.tanggalSurat` ← tanggal baris BKU
 * - `perencanaan.kegiatan`     ← "Nama Kegiatan" (seksi Identitas Kegiatan)
 *
 * Beda dengan `prefillPbjDariBku`: fungsi ini MENIMPA (bukan hanya mengisi
 * kosong), karena nilainya turunan — kalau Nama Kegiatan diubah, PBJ harus ikut.
 * Sumber kosong → nilai lama dipertahankan (jangan menghapus data user).
 * Fungsi MURNI: mengembalikan objek baru, tidak menyentuh storage.
 */
export function sinkronPbjDariSumber(form = {}, { tanggal = '', acara = '' } = {}) {
  const iso = keISO(tanggal)
  const nama = String(acara || '').trim()
  const lama = form?.perencanaan || {}
  const tanggalSurat = iso || lama.tanggalSurat || ''
  const kegiatan = nama || lama.kegiatan || ''
  if (tanggalSurat === (lama.tanggalSurat || '') && kegiatan === (lama.kegiatan || '')) return form
  return { ...form, perencanaan: { ...lama, tanggalSurat, kegiatan } }
}

/** Field yang terisi otomatis pada form PBJ (untuk audit/test). */export function fieldTerisiOtomatis(form = {}) {
  const out = []
  for (const doc of Object.keys(form)) {
    for (const key of Object.keys(form[doc] || {})) {
      if (!kosong(form[doc][key])) out.push(`${doc}.${key}`)
    }
  }
  return out
}

export default { prefillPbjDariBku, sinkronPbjDariSumber, fieldTerisiOtomatis, bulanDariISO }
