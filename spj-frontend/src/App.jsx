import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastProvider } from './components/ui/Toast'
import { AIProvider } from './contexts/AIContext'
import { ThemeProvider } from './contexts/ThemeContext'
import AskAIButton from './components/ai/AskAIButton'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import DataSekolahPage from './pages/dashboard/DataSekolahPage'
import PejabatSekolahPage from './pages/dashboard/PejabatSekolahPage'
import DataGuruPage from './pages/dashboard/DataGuruPage'
import BKUPage from './pages/dashboard/BKUPage'
import DokumenSPJPage from './pages/dashboard/DokumenSPJPage'
import DokumenKelengkapanPage from './pages/dashboard/DokumenKelengkapanPage'
import RealisasiPage from './pages/dashboard/RealisasiPage'
import NotesPage from './pages/dashboard/NotesPage'
import PengaturanPage from './pages/dashboard/PengaturanPage'
import NomorSuratPage from './pages/dashboard/NomorSuratPage'
import TemplateSuratPage from './pages/dashboard/TemplateSuratPage'
import ReferensiKodePage from './pages/dashboard/ReferensiKodePage'

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('spj_auth') === 'true'
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return (
    <>
      {children}
      {/* Tombol ⚡ Tanya AI — hanya untuk user yang sudah login */}
      <AskAIButton />
    </>
  )
}

export default function App() {
  // Boot splash — keluar sesuai kesiapan NYATA, bukan timer buta:
  //  - efek ini berjalan berarti bundle JS sudah selesai & React ter-render
  //  - document.fonts.ready : font (termasuk Inter untuk teks splash) siap
  //  - gambar logo /asik-logo.png selesai termuat
  // + batas bawah 1.4s (agar loader tidak cuma kedip) dan pengaman 6s.
  // Tidak menyentuh routing/logika bisnis.
  useEffect(() => {
    const splash = document.getElementById('boot-splash')
    if (!splash) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t0 = window.__BOOT_T0 || performance.now()
    const MIN_SPIN = reduced ? 250 : 1400
    const CAP = 6000
    let done = false

    const finish = () => {
      if (done) return
      done = true
      splash.classList.add('boot-hide')
      setTimeout(() => splash.remove(), 600)
    }

    // kesiapan logo mini (resolve juga bila error, jangan menggantung)
    const logoReady = () => {
      const img = splash.querySelector('.asik-loader__logo')
      if (!img || img.complete) return Promise.resolve()
      return new Promise((res) => {
        img.addEventListener('load', res, { once: true })
        img.addEventListener('error', res, { once: true })
      })
    }
    // kesiapan font (cap 2.5s supaya splash tidak terjebak bila CDN tersendat)
    const fontsReady = Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => setTimeout(r, 2500)),
    ])

    const elapsed = performance.now() - t0
    const waitMore = Math.max(0, MIN_SPIN - elapsed)
    const cap = setTimeout(finish, CAP)            // pengaman terakhir
    Promise.all([
      fontsReady,
      logoReady(),
      new Promise((r) => setTimeout(r, waitMore)),
    ]).then(finish)

    // cleanup: kalau komponen App unmount (mis. hot reload), splash ikut dibersihkan
    return () => {
      clearTimeout(cap)
      splash.remove()
    }
  }, [])

  return (
    <ThemeProvider>
      <ToastProvider>
        <AIProvider>
          <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes — AskAIButton hanya muncul di halaman dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="data-sekolah" element={<DataSekolahPage />} />
              <Route path="pejabat-sekolah" element={<PejabatSekolahPage />} />
              <Route path="data-guru" element={<DataGuruPage />} />
              <Route path="bku" element={<BKUPage />} />
              <Route path="dokumen-lpj" element={<DokumenSPJPage />} />
              <Route path="dokumen-kelengkapan" element={<DokumenKelengkapanPage />} />
              {/* Backward compatibility redirects */}
              <Route path="dokumen-spj" element={<Navigate to="/dashboard/dokumen-lpj" replace />} />
              <Route path="dokumen-wajib" element={<Navigate to="/dashboard/dokumen-kelengkapan" replace />} />
              <Route path="realisasi" element={<RealisasiPage />} />
              <Route path="nomor-surat" element={<NomorSuratPage />} />
              <Route path="template-surat" element={<TemplateSuratPage />} />
              <Route path="catatan" element={<NotesPage />} />
              <Route path="kode-referensi" element={<ReferensiKodePage />} />
              <Route path="pengaturan" element={<PengaturanPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Router>
        </AIProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
