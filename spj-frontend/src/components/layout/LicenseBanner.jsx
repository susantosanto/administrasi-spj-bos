/**
 * LicenseBanner — bar status lisensi di atas konten dashboard.
 * Muncul saat: belum pernah cek & ada lisensi, READ_ONLY, GRACE, SUSPENDED, EXPIRED,
 * atau CP tak terjangkau terlalu lama (> 15.000.000 ms ≈ 4 jam).
 * Hilang karena status sehat (TRIAL/ACTIVE) → hanya tak tampil, tidak mengganggu.
 * Sengaja TIDAK sticky — cukup bar di atas, tidak mengganggu kerja.
 */
import { useLicenseStatus, licenseService } from '../../services/licenseService'
import { storageHelper } from '../../utils/storageHelper'

const NEW_ENOUGH_MS = 4 * 60 * 60 * 1000 // usia cek terakhir dianggapFresh
const WARN_BG = { backgroundColor: 'rgba(217,119,6,0.12)', color: '#92400E' }
const DANG_BG = { backgroundColor: 'rgba(220,38,38,0.10)', color: '#991B1B' }

function toCopy(s) {
  if (s.status === null) return null
  const valid = s.validUntil ? new Date(s.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  switch (s.status) {
    case 'TRIAL':
      return valid ? { mode: 'warn', text: `Masa percobaan sampai ${valid} — aktifkan lisensi agar tetap bisa menulis.` } : { mode: 'warn', text: 'Masa percobaan — aktifkan lisensi agar tetap bisa menulis.' }
    case 'GRACE':
      return { mode: 'warn', text: 'Masa tenggang aktif — segera hubungi admin pusat untuk pemulihan.' }
    case 'READ_ONLY':
      return { mode: 'dang', text: 'Mode baca — edit LPJ & aksi tulis dikunci. Perbarui lisensi di pusat.' }
    case 'SUSPENDED':
      return { mode: 'dang', text: 'Lisensi ditangguhkan — hanya membaca. Hubungi admin pusat.' }
    case 'EXPIRED':
      return { mode: 'dang', text: 'Lisensi sudah berakhir — hanya membaca. Hubungi admin pusat untuk perpanjangan.' }
    default:
      return null
  }
}

export default function LicenseBanner() {
  const s = useLicenseStatus()
  const hasCode = !!storageHelper.get('license_code')

  // Belum ada lisensi / sudah sehat → tidak tampil
  if (!hasCode || (s.status && s.status !== 'READ_ONLY' && s.status !== 'GRACE' && s.status !== 'SUSPENDED' && s.status !== 'EXPIRED' && s.status !== 'TRIAL')) return null
  const copy = toCopy(s)
  if (!copy) return null

  // TRIAL = glass card denyut, lain = bar biasa
  if (s.status === 'TRIAL') {
    const daysLeft = s.validUntil ? Math.max(0, Math.ceil((new Date(s.validUntil) - new Date()) / (1000*60*60*24))) : null
    return (
      <div className="shrink-0 px-6 pt-3 pb-1" role="status">
        <div className="trial-glass trial-glass--pulse flex items-center gap-3 px-4 py-3 rounded-2xl text-sm">
          <span className="trial-pulse shrink-0 w-3 h-3 rounded-full bg-amber-500 relative" aria-hidden="true"><span className="trial-pulse-ring absolute inset-0 rounded-full bg-amber-500" /></span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-none" style={{color:'#92400E'}}>Masa Percobaan {daysLeft!==null ? `• ${daysLeft} hari lagi` : ''}</p>
            <p className="text-xs mt-1 leading-snug" style={{color:'rgba(146,64,14,0.85)'}}>{copy.text}</p>
          </div>
          <button type="button" className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-500 text-white hover:bg-amber-600 transition-colors" onClick={() => licenseService.refresh()}>Periksa</button>
        </div>
        <style>{`
          .trial-glass{ background: rgba(255,255,255,0.62); backdrop-filter: blur(14px) saturate(1.5); -webkit-backdrop-filter: blur(14px) saturate(1.5); }
          .dark .trial-glass{ background: rgba(30,20,5,0.5); }
          .trial-glass--pulse{ animation: trial-card 1.6s ease-in-out infinite; }
          @keyframes trial-card{ 0%{ transform: scale(1);} 50%{ transform: scale(1.015);} 100%{ transform: scale(1);} }
          .trial-pulse{ animation: trial-beat 1.6s ease-in-out infinite; }
          .trial-pulse-ring{ animation: trial-ring 1.6s ease-out infinite; }
          @keyframes trial-beat{ 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.18);} }
          @keyframes trial-ring{ 0%{ transform: scale(1); opacity: 0.55;} 100%{ transform: scale(2.2); opacity: 0;} }
          @media (prefers-reduced-motion: reduce){ .trial-glass--pulse, .trial-pulse, .trial-pulse-ring{ animation: none; } }
        `}</style>
      </div>
    )
  }
  const style = copy.mode === 'dang' ? DANG_BG : WARN_BG
  return (
    <div className="shrink-0 px-6 py-2 text-sm flex items-center gap-2 border-b" style={{ ...style, borderColor: 'rgba(0,0,0,0.06)' }} role="status">
      <span aria-hidden="true">{copy.mode === 'dang' ? '⚠️' : 'ℹ️'}</span>
      <span>{copy.text}</span>
      <button
        type="button"
        className="ml-auto text-xs font-semibold underline underline-offset-2 opacity-80 hover:opacity-100"
        onClick={() => licenseService.refresh()}
      >
        Periksa ulang
      </button>
    </div>
  )
}
