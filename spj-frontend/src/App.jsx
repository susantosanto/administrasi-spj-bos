import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
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
import PengaturanPage from './pages/dashboard/PengaturanPage'

function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('spj_auth') === 'true'
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
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
            <Route path="pengaturan" element={<PengaturanPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  )
}
