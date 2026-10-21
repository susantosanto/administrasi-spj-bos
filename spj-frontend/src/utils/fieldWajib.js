/**
 * fieldWajib — daftar field wajib sebuah template dokumen, diturunkan dari
 * `templateConfig.blocks` (Sprint 017, keputusan A-1).
 *
 * Aturan (JANGAN diubah tanpa persetujuan user — gate preview bergantung padanya):
 *   1. `header` dengan `nomor !== false`  → 'nomor'
 *   2. `table-fields`                     → semua `fields[].key`
 *   3. `table-letter-header`              → `leftFields[].key` + `rightFields[].key`
 *   4. `table-dinamis`                    → wajib ≥1 baris (`rows`)
 *   5. key yang punya nilai non-kosong di `cfg.defaults` DIKELUARKAN (terisi otomatis)
 *   6. key meta (`bkuSumber`, `kunciPejabat`) tidak pernah dihitung
 *
 * Kosong = '', null, undefined, [], {}. Angka 0 = TERISI.
 */

const META_KEYS = new Set(['bkuSumber', 'kunciPejabat'])

function keyDari(block) {
  const out = []
  if (!block || typeof block !== 'object') return out

  if (block.type === 'header' && block.nomor !== false) {
    out.push({ key: 'nomor', label: 'Nomor Surat' })
  }
  if (block.type === 'table-fields' && Array.isArray(block.fields)) {
    for (const f of block.fields) {
      if (f?.key) out.push({ key: f.key, label: f.label || f.key })
    }
  }
  if (block.type === 'table-letter-header') {
    for (const f of [...(block.leftFields || []), ...(block.rightFields || [])]) {
      if (f?.key) out.push({ key: f.key, label: f.label || f.key })
    }
  }
  if (block.type === 'table-dinamis') {
    out.push({ key: 'rows', label: 'Daftar isi/penerima (minimal 1 baris)' })
  }
  return out
}

/** Daftar field wajib [{key,label}] untuk satu config template. */
export function fieldWajibDariConfig(cfg) {
  if (!cfg || !Array.isArray(cfg.blocks)) return []
  const defaults = cfg.defaults && typeof cfg.defaults === 'object' ? cfg.defaults : {}
  const adaDefault = (k) => {
    const v = defaults[k]
    return !(v === undefined || v === null || (typeof v === 'string' && v.trim() === ''))
  }

  const hasil = []
  const terlihat = new Set()
  for (const block of cfg.blocks) {
    for (const f of keyDari(block)) {
      if (META_KEYS.has(f.key)) continue
      if (adaDefault(f.key)) continue
      if (terlihat.has(f.key)) continue
      terlihat.add(f.key)
      hasil.push(f)
    }
  }
  return hasil
}

function kosong(v) {
  if (v === null || v === undefined) return true
  if (typeof v === 'string') return v.trim() === ''
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v).length === 0
  return false
}

/**
 * Cek kelengkapan form terhadap field wajib.
 * @returns {{ lengkap: boolean, kurang: {key:string,label:string}[], total: number, terisi: number }}
 */
export function cekKelengkapan(cfg, formData = {}) {
  const wajib = fieldWajibDariConfig(cfg)
  const kurang = wajib.filter((f) => kosong(formData?.[f.key]))
  return {
    lengkap: wajib.length > 0 && kurang.length === 0,
    kurang,
    total: wajib.length,
    terisi: wajib.length - kurang.length,
  }
}

/**
 * Fallback untuk kategori TANPA `templateId` (mis. mamin — semua sub null):
 * bentuk peringatan yang sama disusun dari pelanggaran `readinessCheck` lama.
 * Dipakai sidebar saja; halaman LPJ tidak terpengaruh (AD-4).
 */
export function peringatanDariPelanggaran(pelanggaran = []) {
  return {
    lengkap: pelanggaran.length === 0,
    kurang: pelanggaran.map((p) => ({ key: p.fieldId || p.label, label: p.label })),
    total: pelanggaran.length,
    terisi: 0,
  }
}

export default { fieldWajibDariConfig, cekKelengkapan, peringatanDariPelanggaran }
