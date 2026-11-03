import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import storageHelper from '../utils/storageHelper'
import { useToast } from '../components/ui/Toast'
import ThemeToggle from '../components/ui/ThemeToggle'
import { useTheme } from '../contexts/ThemeContext'
import cpApi, { CpError } from '../services/cpClient'
import { licenseService } from '../services/licenseService'
import { saveLocalAccount } from '../utils/localAccount'
import LicenseCardModal from '../components/LicenseCardModal'

const INIT = {
  schoolName: '',
  npsn: '',
  operatorName: '',
  email: '',
  phone: '',
  address: '',
  username: '',
  password: '',
  confirmPassword: '',
}

export default function RegisterPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(() => storageHelper.get('registration_pending') || INIT)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Jika lisensi sudah ada, beri tahu tapi jangan paksa redirect (biar bisa tes daftar di incognito / setelah clear).
  // Redirect otomatis hanya jika sudah login.
  useEffect(() => {
    if (storageHelper.get('license_code') && storageHelper.get('auth_user')) {
      toast.info('Lisensi sudah terhubung — masuk ke dashboard.')
      navigate('/dashboard', { replace: true })
    } else if (storageHelper.get('license_code')) {
      toast.info('Perangkat ini sudah punya lisensi. Untuk daftar sekolah lain, pakai incognito atau hapus lisensi di Pengaturan.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function validate() {
    const errs = []
    if (form.schoolName.trim().length < 2) errs.push('Nama sekolah minimal 2 karakter')
    if (!/^\d{8}$/.test(form.npsn.trim())) errs.push('NPSN harus 8 digit angka')
    if (form.operatorName.trim().length < 2) errs.push('Nama operator minimal 2 karakter')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.push('Format email tidak valid')
    if (!/^[A-Za-z0-9._-]{3,32}$/.test(form.username.trim()))
      errs.push('Username 3–32 karakter, hanya huruf, angka, titik, garis bawah, atau strip')
    if (form.password.length < 8) errs.push('Password minimal 8 karakter')
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      errs.push('Password harus memuat huruf dan angka')
    if (form.password !== form.confirmPassword) errs.push('Konfirmasi password tidak sama')
    return errs
  }

  async function activateDevice(licenseCode) {
    await cpApi.activate(licenseCode)
    storageHelper.set('license_code', licenseCode)
    // Tarik status baru (TRIAL/readOnly) ke service agar banner & penguncian langsung akurat
    licenseService.reset()
    licenseService.refresh().catch(() => {})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (errs.length) {
      toast.error(errs[0])
      return
    }
    // Simpan draf: kalau jaringan gagal/timeout, user cukup kirim ulang tanpa isi ulang.
    // Password & konfirmasi tidak pernah disimpan di draf.
    storageHelper.set('registration_pending', { ...form, password: '', confirmPassword: '' })
    setLoading(true)
    try {
      const payload = {
        schoolName: form.schoolName.trim(),
        npsn: form.npsn.trim(),
        operatorName: form.operatorName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
      }
      const reg = await cpApi.register(payload)

      // Aktivasi device otomatis dengan kode dari register (user tak perlu input).
      try {
        await activateDevice(reg.licenseCode)
      } catch (actErr) {
        toast.warning(`Sekolah terdaftar (lisensi ${reg.licenseCode}), tapi aktivasi perangkat gagal: ${actErr.message}`)
        navigate('/login', { replace: true })
        return
      }

      storageHelper.set('license_pending', {
        licenseCode: reg.licenseCode,
        schoolId: reg.schoolId,
        status: reg.status,
        endDate: reg.endDate,
        trialDays: reg.trialDays,
      })
      storageHelper.remove('registration_pending')
      const account = await saveLocalAccount({
        username: form.username,
        password: form.password,
        name: form.operatorName,
        email: form.email,
      })
      setResult({
        ...reg,
        schoolName: form.schoolName.trim(),
        npsn: form.npsn.trim(),
        username: account.username,
        password: form.password,
      })
      toast.success('Registrasi berhasil! Kartu lisensi siap dicetak atau diunduh.')
    } catch (err) {
      if (err instanceof CpError) {
        if (err.status === 429) toast.error(err.message)
        else toast.error(err.message)
      } else {
        toast.error('Registrasi gagal: ' + (err.message || ' kesalahan tidak diketahui' ) + '. Draf form sudah disimpan — silakan coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden flex"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F3F5F9' }}
    >
      {/* ── Batik drift — satu layar utuh, sama persis dengan login ── */}
      <div
        className="absolute inset-x-0 -inset-y-[360px] pointer-events-none animate-batik-drift"
        style={{
          backgroundImage: "url('/floral-pattern.jpg')",
          backgroundSize: '360px 360px',
          backgroundRepeat: 'repeat',
          opacity: isDark ? 0.07 : 0.3,
          mixBlendMode: isDark ? 'normal' : 'multiply',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(36,87,167,0.08) 0%, transparent 72%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 72%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Brand lockup */}
        <div className="flex flex-col items-center text-center mb-5 animate-fade-up">
          <img src="/asik-logo.png" alt="Asik" className="h-10 w-auto mb-2.5" draggable="false" />
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: isDark ? '#F1F5F9' : '#1D2939' }}
          >
            Aplikasi Dokumentasi LPJ
          </h2>
          <p className="text-xs mt-1" style={{ color: isDark ? '#94A3B8' : '#66758A' }}>
            Pertanggungjawaban Dana BOS/BOSP
          </p>
        </div>

        <div
          className="w-full max-w-[480px] rounded-2xl border p-6 animate-fade-up"
          style={{
            animationDelay: '0.15s',
            backgroundColor: isDark ? 'rgba(15,23,42,0.50)' : 'rgba(255,255,255,0.50)',
            borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(24px) saturate(1.6)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
            boxShadow: isDark
              ? '0 24px 50px -22px rgba(0,0,0,0.45)'
              : '0 24px 50px -22px rgba(35,89,166,0.30)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#2457A7] transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Masuk
            </Link>
            <ThemeToggle variant="icon" />
          </div>

          <>
              <div className="mb-4">
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">Daftar Sekolah</h1>
                <p className="text-slate-500 text-[13px]">
                  Daftarkan sekolah, buat username &amp; password Anda, lalu perangkat ini langsung diaktivasi.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Field label="Nama Sekolah" id="schoolName" value={form.schoolName} onChange={set('schoolName')} placeholder="Contoh: SDN 01 Contoh" isDark={isDark} />
                <Field
                  label="NPSN"
                  id="npsn"
                  value={form.npsn}
                  onChange={(e) => setForm((f) => ({ ...f, npsn: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                  placeholder="8 digit angka"
                  isDark={isDark}
                  inputMode="numeric"
                />
                <Field label="Nama Operator (Anda)" id="operatorName" value={form.operatorName} onChange={set('operatorName')} placeholder="Nama lengkap" isDark={isDark} />
                <Field label="Email" id="email" type="email" value={form.email} onChange={set('email')} placeholder="operator@sekolah.sch.id" isDark={isDark} />
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="Username"
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.replace(/\s/g, '') }))}
                    placeholder="mis. operator.sdn01"
                    isDark={isDark}
                    autoComplete="username"
                  />
                  <Field
                    label="Password"
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Min. 8 karakter"
                    isDark={isDark}
                    autoComplete="new-password"
                  />
                </div>
                <Field
                  label="Konfirmasi Password"
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Ulangi password"
                  isDark={isDark}
                  autoComplete="new-password"
                />
                <p className="text-[11px] text-slate-500 -mt-1">
                  Username dan password ini dipakai untuk masuk ke aplikasi dan akan tercetak pada kartu lisensi.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="No. HP" id="phone" value={form.phone} onChange={set('phone')} placeholder="Opsional" isDark={isDark} optional />
                  <Field label="Alamat" id="address" value={form.address} onChange={set('address')} placeholder="Opsional" isDark={isDark} optional />
                </div>

                <div className="text-[11px] text-slate-400 flex items-start gap-1.5">
                  <span className="material-symbols-outlined text-[14px] mt-0.5">shield</span>
                  Hanya identitas sekolah yang dikirim ke pusat. Data BKU/LPJ dan dokumen keuangan tetap lokal &amp; tidak dikirim.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#2457A7] hover:bg-[#1D4688] text-white font-semibold rounded-xl shadow-lg shadow-[#2457A7]/20 hover:shadow-xl hover:shadow-[#2457A7]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar & Aktifkan</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              <div className="my-4 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[12px] text-slate-400">atau</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <p className="text-center text-[13px] text-slate-500">
                Sudah punya lisensi?{' '}
                <Link to="/login" className="font-medium hover:underline" style={{ color: isDark ? '#60A5FA' : '#2457A7' }}>
                  Masuk / Hubungkan lewat Pengaturan
                </Link>
              </p>
          </>
        </div>

        <div className="flex items-center gap-3 mt-5 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-500">PROTOTYPE</span>
          <span>© {new Date().getFullYear()} Aplikasi Dokumentasi LPJ</span>
        </div>
      </div>

      <LicenseCardModal
        open={!!result}
        data={result}
        onClose={() => navigate('/dashboard', { replace: true })}
        onDashboard={() => navigate('/dashboard', { replace: true })}
      />
    </div>
  )
}

function Field({ label, id, value, onChange, placeholder, isDark, type = 'text', optional, ...rest }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-slate-700 mb-1.5" htmlFor={id}>
        {label}
        {optional && <span className="text-slate-400 font-normal"> (opsional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 px-4 glass-input border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2457A7]/10 focus:border-[#2457A7] transition-all"
        {...rest}
      />
    </div>
  )
}
