/**
 * ThemeToggle — Premium animated Light/Dark switch
 * Tidak statis: icon rotate + scale + glow, track slide
 */
import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle({ variant = 'default', className = '' }) {
  const { theme, toggle, isDark, mounted } = useTheme()

  // Hindari flash saat SSR/hydrate
  if (!mounted) {
    return (
      <div className={`w-14 h-8 rounded-full bg-slate-200 animate-pulse ${className}`} aria-hidden="true" />
    )
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggle}
        aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
        aria-pressed={isDark}
        title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden group
          ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
          ${className}`}
      >
        <span
          className={`material-symbols-outlined text-[20px] transition-all duration-500 ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'} absolute`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          dark_mode
        </span>
        <span
          className={`material-symbols-outlined text-[20px] transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'} absolute`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          light_mode
        </span>
      </button>
    )
  }

  // default: pill switch
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      aria-pressed={isDark}
      title={isDark ? 'Mode Terang (klik untuk Light)' : 'Mode Gelap (klik untuk Dark)'}
      className={`relative inline-flex items-center w-[68px] h-[36px] rounded-full p-1 transition-all duration-500 cursor-pointer select-none
        ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200 shadow-sm'}
        hover:shadow-md group ${className}`}
    >
      {/* Track icons */}
      <span className={`absolute left-2 material-symbols-outlined text-[14px] transition-all duration-300 ${isDark ? 'text-slate-600 opacity-40' : 'text-amber-500 opacity-100'}`} style={{ fontVariationSettings: "'FILL' 1" }}>light_mode</span>
      <span className={`absolute right-2 material-symbols-outlined text-[14px] transition-all duration-300 ${isDark ? 'text-yellow-400 opacity-100' : 'text-slate-300 opacity-40'}`} style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>

      {/* Sliding thumb */}
      <span
        className={`relative z-10 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark ? 'translate-x-[32px] bg-gradient-to-br from-slate-700 to-slate-900 text-yellow-300' : 'translate-x-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white'}`}
      >
        <span className={`material-symbols-outlined text-[16px] transition-transform duration-500 ${isDark ? 'rotate-180' : 'rotate-0'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </span>

      {/* Glow */}
      <span className={`absolute inset-0 rounded-full transition-opacity duration-500 pointer-events-none ${isDark ? 'bg-yellow-500/10 opacity-100' : 'bg-amber-400/10 opacity-0'}`} />
    </button>
  )
}
