/**
 * ThemeTransitionLayer — Global Day/Night Animation Layer (Global Theme Engine)
 *
 * Layer fixed tampil HANYA saat transisi tema (klik ThemeToggle / Pengaturan) berjalan.
 * Dirender lewat portal ke <body> supaya tidak ikut kena crossfade warna konten (#root).
 * Tidak menerima klik, tidak mengubah layout — murni visual.
 *
 * Tampilan: crossfade 4 lapisan langit polos + veil batik halus (identitas ASIK).
 * Tanpa matahari/bulan/lengkung agar kesan profesional dipertahankan.
 */
import { createPortal } from 'react-dom'
import { useTheme, STAGE_MS } from '../../contexts/ThemeContext'

export default function ThemeTransitionLayer() {
  const { stageFx } = useTheme()
  const active = !!stageFx?.active
  const stage = active ? stageFx.stage : 0
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
      <div className="theme-fx-batik" />
    </div>,
    document.body
  )
}
