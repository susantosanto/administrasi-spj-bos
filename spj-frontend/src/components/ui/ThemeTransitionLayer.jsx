/**
 * ThemeTransitionLayer — Global Day/Night Animation Layer (Global Theme Engine)
 *
 * Layer fixed di atas seluruh halaman; tampil HANYA saat transisi tema
 * (klik ThemeToggle / tombol di Pengaturan) berjalan. Tidak menerima klik,
 * tidak mengubah layout — murni visual. Class `dark` di-swap di tengah
 * transisi oleh ThemeContext (sumber tunggal), komponen ini hanya membaca.
 *
 * Tahap overlay (CSS `theme-stage-*` di index.css):
 *   → Dark : Day → Golden Hour → Sunset → Twilight → Night
 *   → Light: Night → Moonset → Dawn → Sunrise → Day
 * Elemen: langit bertahap + matahari/bulan berpindah + veil batik
 * (identitas ASIK dipertahankan, transparansi sangat rendah).
 *
 * prefers-reduced-motion: ThemeContext melewatkan overlay — komponen ini
 * tidak pernah tampil (aman juga dinonaktifkan ganda di CSS).
 */
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeTransitionLayer() {
  const { stageFx } = useTheme()
  const active = !!stageFx?.active
  const stage = active ? stageFx.stage : 0
  // Arah transisi — dibekukan di ThemeContext sejak tahap 1 (tidak ikut berubah
  // saat class `dark` di-swap di tahap akhir).
  const toDark = stageFx?.toDark !== false

  return (
    <div
      className={`theme-fx-layer ${active ? 'theme-fx-layer--active' : ''}`}
      data-stage={stage}
      data-fx-target={toDark ? 'dark' : 'light'}
      aria-hidden="true"
    >
      <div className="theme-fx-sky" />
      <div className="theme-fx-stars" />
      <div className="theme-fx-orb" />
      <div className="theme-fx-batik" />
    </div>
  )
}
