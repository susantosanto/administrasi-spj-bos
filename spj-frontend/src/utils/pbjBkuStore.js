/**
 * pbjBkuStore — simpan dokumen PBJ per BARIS BKU (Sprint 018, AD-5).
 *
 * Kunci storage: `spj_pbj_bku` (prefix dari storageHelper). Terpisah dari
 * `spj_pbj_form` (form PBJ GLOBAL milik halaman Dokumen Kelengkapan) — JANGAN
 * dicampur: yang global tidak dibaca/tulis di sprint ini.
 *
 * Aturan (pola `lpjBkuStore.js`, Sprint 017):
 * - NoBukti kosong / '-' → TIDAK menyimpan (E-1) → { ok:false, alasan:'no-bukti' }.
 * - Data rusak → bacaEntri mengembalikan null, tidak melempar.
 * - Satu entri = satu baris BKU; menulis entri tidak menyentuh entri lain.
 */
import storageHelper from './storageHelper'
import { noBuktiSah } from './lpjBkuStore'

const KEY = 'pbj_bku'

/** Tab dokumen PBJ (pola `PBJ_TABS` di DokumenKelengkapanPage.jsx). */
export const TAB_PBJ = ['perencanaan', 'pesanan', 'bahp', 'bast', 'nego', 'data']

/** Kunci entri: "<kategori>|<noBukti>" (NoBukti di-trim). */
export function kunciEntri(kategori, noBukti) {
  return `${String(kategori || '').trim()}|${String(noBukti || '').trim()}`
}

function bacaPeta() {
  const peta = storageHelper.get(KEY, {})
  return peta && typeof peta === 'object' && !Array.isArray(peta) ? peta : {}
}

/** Form PBJ kosong (6 tab) — bentuk dasar entri. */
export function formPbjKosong() {
  const out = {}
  for (const k of TAB_PBJ) out[k] = {}
  return out
}

/** Gabungkan form tersimpan dengan bentuk kosong (tab baru ikut ada). */
function gabungForm(form) {
  const out = formPbjKosong()
  if (!form || typeof form !== 'object') return out
  for (const k of TAB_PBJ) out[k] = { ...(form[k] || {}) }
  return out
}

/** Ambil satu entri PBJ; null bila tidak ada / rusak. */
export function bacaEntri(kategori, noBukti) {
  if (!noBuktiSah(noBukti)) return null
  try {
    const entri = bacaPeta()[kunciEntri(kategori, noBukti)]
    if (!entri || typeof entri !== 'object') return null
    return {
      kategori: entri.kategori || kategori,
      noBukti: entri.noBukti || String(noBukti).trim(),
      form: gabungForm(entri.form),
      savedAt: entri.savedAt || null,
    }
  } catch {
    return null
  }
}

/**
 * Simpan satu entri PBJ.
 * @returns {{ok: boolean, alasan?: string, savedAt?: string}}
 */
export function simpanEntri(kategori, noBukti, { form = {} } = {}) {
  if (!noBuktiSah(noBukti)) return { ok: false, alasan: 'no-bukti' }
  const savedAt = new Date().toISOString()
  const peta = bacaPeta()
  peta[kunciEntri(kategori, noBukti)] = {
    kategori,
    noBukti: String(noBukti).trim(),
    form: gabungForm(form),
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

export default { kunciEntri, bacaEntri, simpanEntri, hapusEntri, bacaSemua, formPbjKosong, TAB_PBJ }
