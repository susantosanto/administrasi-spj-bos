import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { AIProvider } from './contexts/AIContext'
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
  return (
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
  )
}
