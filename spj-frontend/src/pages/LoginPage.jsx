import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import storageHelper from "../utils/storageHelper";
import { useToast } from "../components/ui/Toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (username && password) {
        localStorage.setItem("spj_auth", "true");
        storageHelper.set("auth_user", { name: username, role: "admin" });
        storageHelper.set("auth_token", "mock-token-" + Date.now());
        toast.success("Selamat datang, " + username + "!");
        navigate("/dashboard");
      } else {
        toast.error("Username dan password harus diisi");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LEFT: PREMIUM VISUAL                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        
        {/* Multi-Layer Gradient Background */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(100,150,255,0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(60,100,220,0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0,74,198,1) 0%, rgba(0,50,150,1) 100%)
          `
        }} />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Premium Space Orbs - Highly Visible */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          
          {/* PRIMARY GLOW ORB 1 - Large, moving right */}
          <div className="absolute w-[400px] h-[400px] rounded-full" 
               style={{
                 background: 'radial-gradient(circle, rgba(180,220,255,0.6) 0%, rgba(100,180,255,0.3) 40%, transparent 70%)',
                 top: '10%',
                 left: '5%',
                 animation: 'orb-move-1 12s ease-in-out infinite',
               }}
          />
          
          {/* PRIMARY GLOW ORB 2 - Large, moving left */}
          <div className="absolute w-[350px] h-[350px] rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(150,210,255,0.55) 0%, rgba(80,160,255,0.25) 40%, transparent 70%)',
                 bottom: '5%',
                 right: '10%',
                 animation: 'orb-move-2 14s ease-in-out infinite',
               }}
          />
          
          {/* MEDIUM GLOW ORB 3 - Floating */}
          <div className="absolute w-[250px] h-[250px] rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(200,235,255,0.5) 0%, rgba(120,190,255,0.2) 45%, transparent 70%)',
                 top: '40%',
                 left: '40%',
                 animation: 'orb-move-3 10s ease-in-out infinite',
               }}
          />
          
          {/* SMALL ACCENT ORB */}
          <div className="absolute w-[180px] h-[180px] rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(220,240,255,0.6) 0%, transparent 60%)',
                 top: '60%',
                 left: '15%',
                 animation: 'orb-float 8s ease-in-out infinite',
               }}
          />
          
          {/* TINY SPARKLE ORB */}
          <div className="absolute w-[100px] h-[100px] rounded-full"
               style={{
                 background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(200,230,255,0.3) 40%, transparent 70%)',
                 top: '20%',
                 right: '15%',
                 animation: 'orb-pulse 6s ease-in-out infinite',
               }}
          />
          
          {/* Floating Particles - More visible */}
          {[
            { size: 6, top: '12%', left: '18%', delay: 0 },
            { size: 5, top: '22%', left: '55%', delay: -1.5 },
            { size: 7, top: '38%', left: '25%', delay: -3 },
            { size: 4, top: '48%', left: '65%', delay: -0.8 },
            { size: 5, top: '65%', left: '12%', delay: -2.2 },
            { size: 4, top: '75%', left: '45%', delay: -4 },
            { size: 6, top: '30%', left: '75%', delay: -1 },
            { size: 5, top: '55%', left: '40%', delay: -2.8 },
            { size: 4, top: '82%', left: '60%', delay: -0.5 },
            { size: 5, top: '18%', left: '80%', delay: -3.5 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: p.size,
                height: p.size,
                top: p.top,
                left: p.left,
                boxShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(150,200,255,0.5)',
                animation: 'particle-drift 7s ease-in-out infinite',
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col justify-center px-12 xl:px-20">
          
          {/* Logo Mark */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg tracking-tight">LPJ BOS/BOSP</h2>
                <p className="text-white/50 text-xs">Sistem Administrasi Sekolah</p>
              </div>
            </div>
          </div>

          {/* Hero Text */}
          <div className="mb-12">
            <h1 className="text-[44px] xl:text-[52px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              Kelola Keuangan
              <br />
              <span className="text-white/70">Sekolah dengan</span>
              <br />
              <span className="text-white">Mudah & Cepat</span>
            </h1>
            <p className="text-white/50 text-[15px] max-w-[380px] leading-relaxed">
              Sistem informasi terintegrasi untuk pelaporan administrasi BOS/BOSP yang transparan dan akuntabel.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 mb-12">
            {[
              { icon: 'description', text: '13 Template Dokumen Siap Pakai' },
              { icon: 'upload_file', text: 'Upload BKU dari ARKAS Otomatis' },
              { icon: 'print', text: 'Cetak Dokumen Langsung dari Aplikasi' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-white/80 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {item.icon}
                  </span>
                </div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Trust Indicator */}
          <div className="flex items-center gap-2 text-white/40">
            <span className="material-symbols-outlined text-sm">shield</span>
            <span className="text-xs">Aman & Terenkripsi</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RIGHT: LOGIN FORM                                             */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col min-h-screen bg-white">
        
        {/* Mobile Header */}
        <div className="lg:hidden px-8 pt-8 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#004ac6] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">LPJ BOS/BOSP</h2>
              <p className="text-[11px] text-slate-500">Administrasi Sekolah</p>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 md:px-12 lg:px-16 xl:px-20">
          <div className="w-full max-w-[380px]">
            
            {/* Back Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#004ac6] transition-colors mb-8 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Beranda
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[28px] font-bold text-slate-900 mb-2">Masuk ke Akun</h1>
              <p className="text-slate-500 text-[14px]">
                Selamat datang kembali! Silakan masuk untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username */}
              <div>
                <label className="block text-[13px] font-medium text-slate-700 mb-1.5" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                    className="w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10 focus:border-[#004ac6] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[13px] font-medium text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <a href="#" className="text-[12px] text-[#004ac6] hover:underline">
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004ac6]/10 focus:border-[#004ac6] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember */}
              <div className="flex items-center gap-2 py-1">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-[#004ac6] border-slate-300 rounded focus:ring-[#004ac6] cursor-pointer"
                />
                <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer">
                  Ingat saya
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#004ac6] hover:bg-[#003d99] text-white font-semibold rounded-xl shadow-lg shadow-[#004ac6]/20 hover:shadow-xl hover:shadow-[#004ac6]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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
                    <span>Masuk</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[12px] text-slate-400">atau</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Help */}
            <p className="text-center text-[13px] text-slate-500">
              Butuh bantuan?{' '}
              <a href="#" className="text-[#004ac6] font-medium hover:underline">Hubungi admin</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-500">
              PROTOTYPE
            </span>
            <span>© {new Date().getFullYear()} LPJ BOS/BOSP</span>
          </div>
        </div>
      </section>
    </div>
  );
}
