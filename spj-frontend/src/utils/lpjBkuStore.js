/**
 * lpjBkuStore — simpan dokumen LPJ per BARIS BKU (kunci: kategori + NoBukti).
 *
 * Sprint 017 (A-3, K-4/K-5). Kunci storage: `spj_lpj_bku` (prefix dari storageHelper).
 * Terpisah dari `spj_dokumen_lpj` (peta status per kartu) — JANGAN dicampur.
 *
 * Aturan:
 * - NoBukti kosong / '-' → TIDAK menyimpan (E-1). Kembalikan { ok:false, alasan }.
 * - Data rusak → bacaEntri mengembalikan null, tidak melempar.
 * - Satu entri = satu baris BKU; menulis entri tidak menyentuh entri lain.
 */
import storageHelper from './storageHelper'

const KEY = 'lpj_bku'

/** Kunci entri: "<kategori>|<noBukti>" (NoBukti di-trim). */
export function kunciEntri(kategori, noBukti) {
  return `${String(kategori || '').trim()}|${String(noBukti || '').trim()}`
}

/** NoBukti dianggap sah bila ada isinya dan bukan placeholder '-'. */
export function noBuktiSah(noBukti) {
  const v = String(noBukti || '').trim()
  return v !== '' && v !== '-' && v !== '—'
}

function bacaPeta() {
  const peta = storageHelper.get(KEY, {})
  return peta && typeof peta === 'object' && !Array.isArray(peta) ? peta : {}
}

/** Ambil satu entri; null bila tidak ada / rusak. */
export function bacaEntri(kategori, noBukti) {
  if (!noBuktiSah(noBukti)) return null
  try {
    const entri = bacaPeta()[kunciEntri(kategori, noBukti)]
    if (!entri || typeof entri !== 'object') return null
    return {
      kategori: entri.kategori || kategori,
      noBukti: entri.noBukti || String(noBukti).trim(),
      subId: entri.subId ?? '',
      templateId: entri.templateId ?? null,
      formData: entri.formData && typeof entri.formData === 'object' ? entri.formData : {},
      sppdData: entri.sppdData && typeof entri.sppdData === 'object' ? entri.sppdData : {},
      savedAt: entri.savedAt || null,
    }
  } catch {
    return null
  }
}

/**
 * Simpan satu entri.
 * @returns {{ok: boolean, alasan?: string, savedAt?: string}}
 */
export function simpanEntri(kategori, noBukti, { subId = '', templateId = null, formData = {}, sppdData = {} } = {}) {
  if (!noBuktiSah(noBukti)) return { ok: false, alasan: 'no-bukti' }
  const savedAt = new Date().toISOString()
  const peta = bacaPeta()
  peta[kunciEntri(kategori, noBukti)] = {
    kategori,
    noBukti: String(noBukti).trim(),
    subId,
    templateId,
    formData,
    sppdData,
    savedAt,
  }
  const ok = storageHelper.set(KEY, peta)
  return ok ? { ok: true, savedAt } : { ok: false, alasan: 'storage' }
}

/** Hapus satu entri saja. */
export function hapusEntri(kategori, noBukti) {
  if (!noBuktiSah(noBukti)) return false
  const peta = bacaPeta()
  const k = kunciEntri(kategori, noBukti)
  if (!(k in peta)) return false
  delete peta[k]
  return storageHelper.set(KEY, peta)
}

/** Seluruh entri (untuk uji/inspeksi). */
export function bacaSemua() {
  return bacaPeta()
}

export default { kunciEntri, noBuktiSah, bacaEntri, simpanEntri, hapusEntri, bacaSemua }
