/**
 * ThemeTransitionLayer — Global Day/Night Animation Layer (Global Theme Engine)
 *
 * Layer fixed tampil HANYA saat transisi tema (klik ThemeToggle / Pengaturan) berjalan.
 * Dirender lewat portal ke <body> supaya tidak ikut kena crossfade warna konten (#root).
 * Tidak menerima klik, tidak mengubah layout — murni visual.
 *
 * Konsep: satu lingkaran besar di belakang layar. Matahari & bulan berjalan di
 * lingkaran itu dari tepi kiri ke tepi kanan, dan saling menggantikan:
 *   → Dark : matahari turun ke kanan, bulan terbit dari kiri saat matahari masih di sisi kanan
 *   → Light: bulan turun ke kanan, matahari terbit dari kiri saat bulan masih di sisi kanan
 * Gerak & posisi dikendalikan CSS (keyframes); komponen ini hanya menyediakan elemen
 * dan arah (data-fx-target) + durasi tahap (--fx-stage-ms dari ThemeContext.STAGE_MS).
 */
import { createPortal } from 'react-dom'
import { useTheme, STAGE_MS } from '../../contexts/ThemeContext'

export default function ThemeTransitionLayer() {
  const { stageFx } = useTheme()
  const active = !!stageFx?.active
  const stage = active ? stageFx.stage : 0
  // Arah transisi — dibekukan di ThemeContext sejak tahap 1 (tidak ikut berubah
  // saat class `dark` di-swap di tahap akhir).
  const toDark = stageFx?.toDark !== false

  return createPortal(
    <div
      className={`theme-fx-layer ${active ? 'theme-fx-layer--active' : ''}`}
      data-stage={stage}
      data-fx-target={toDark ? 'dark' : 'light'}
      style={{ '--fx-stage-ms': `${STAGE_MS}ms` }}
      aria-hidden="true"
    >
      <div className="theme-fx-sky theme-fx-sky--1" />
      <div className="theme-fx-sky theme-fx-sky--2" />
      <div className="theme-fx-sky theme-fx-sky--3" />
      <div className="theme-fx-sky theme-fx-sky--4" />
      <div className="theme-fx-stars" />
      <div className="theme-fx-ring" />
      <div className="theme-fx-pivot">
        <div className="theme-fx-hand theme-fx-hand--sun">
          <div className="theme-fx-orb theme-fx-orb--sun" />
        </div>
        <div className="theme-fx-hand theme-fx-hand--moon">
          <div className="theme-fx-orb theme-fx-orb--moon" />
        </div>
      </div>
      <div className="theme-fx-batik" />
    </div>,
    document.body
  )
}
