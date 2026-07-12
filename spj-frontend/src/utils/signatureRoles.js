/**
 * Signature Roles — Konfigurasi Tanda Tangan
 * Reads from localStorage (Data Sekolah page)
 */
import { getKepalaSekolah, getBendahara } from './sekolahData'

// Get dynamic data
const kepalaSekolah = getKepalaSekolah()
const bendahara = getBendahara()

export const SIGNATURE_ROLES = {
  'kepala-sekolah': {
    label: 'Kepala Sekolah,',
    defaultName: kepalaSekolah.nama,
    defaultNip: `NIP. ${kepalaSekolah.nip}`,
  },
  'bendahara': {
    label: 'Bendahara BOS,',
    defaultName: bendahara.nama,
    defaultNip: `NIP. ${bendahara.nip}`,
  },
  'pimpinan': {
    label: 'Pimpinan Rapat/Kepala Sekolah,',
    defaultName: kepalaSekolah.nama,
    defaultNip: `NIP. ${kepalaSekolah.nip}`,
  },
  'notulen': {
    label: 'Notulen,',
    defaultName: 'DEWI ERMIRAWATI, S.Pd.Gr.',
    defaultNip: 'NIP. 197607242022212011',
  },
  'ketua-gugus': {
    label: 'Ketua Gugus,',
    defaultName: kepalaSekolah.nama,
    defaultNip: `NIP. ${kepalaSekolah.nip}`,
  },
}

export default SIGNATURE_ROLES
