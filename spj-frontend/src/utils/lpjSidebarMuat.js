/**
 * lpjSidebarMuat — pemuatan state awal panel LPJ di sidebar BKU
 * (Sprint 018, dipisah dari `BKUSidebarLpj.jsx` supaya file komponen tetap
 * ≤200 baris — konvensi repo).
 *
 * Aturan (Sprint 017):
 * - ada entri tersimpan → pakai entri;
 * - tidak ada → jalankan prefill BKU;
 * - hasilnya di-merge nilai otomatis (AD-4) sebelum dipakai.
 *
 * Dipanggil SATU KALI dari inisialisasi `useState` (bukan `useEffect`) supaya
 * tidak ada "kedipan" prefill sebelum data tersimpan muncul.
 */
import { bacaEntri } from './lpjBkuStore'
import { bangunPrefillLpj } from './prefillLpj'
import { terapkanOtomatisMamin } from './maminOtomatis'

export function muatAwalSidebar({ card, transaction, bkuPrefill, ctxOtomatis }) {
  if (!card) return null
  const entri = bacaEntri(card.id, transaction?.noBukti)
  if (entri) {
    const sub = card.subKategori?.find((s) => s.id === entri.subId)
      || card.subKategori?.find((s) => !s.comingSoon) || null
    return {
      sub,
      formData: terapkanOtomatisMamin(entri.formData || {}, ctxOtomatis),
      sppdData: entri.sppdData || {},
      prefillBadge: null,
      savedAt: entri.savedAt || null,
      viewMode: 'form', formTab: 'daftar', previewTab: 'daftar',
    }
  }
  const hasil = bangunPrefillLpj({ card, bku: bkuPrefill || {}, menu: card.id, subId: '', formData: {} })
  return {
    sub: hasil.subPilih,
    formData: terapkanOtomatisMamin(hasil.tambahan, ctxOtomatis),
    sppdData: hasil.sppdTambahan || {},
    prefillBadge: { bku: bkuPrefill || {}, diisi: hasil.diisi, dilewati: hasil.dilewati, tertimpa: hasil.tertimpa },
    savedAt: null, viewMode: 'form', formTab: 'daftar', previewTab: 'daftar',
  }
}

export default muatAwalSidebar
