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
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LEFT SIDE: PREMIUM BLUE VISUAL                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-[#004ac6] via-[#0056d4] to-[#0062e8]">
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        
        {/* Soft Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] bg-white/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-white/[0.05] rounded-full blur-[120px]" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center px-12 xl:px-20">
          
          {/* Logo */}
          <div className="mb-10 w-20 h-20 bg-white/[0.12] backdrop-blur-sm rounded-[24px] border border-white/[0.15] flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[40px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-[40px] xl:text-[48px] font-bold text-white text-center mb-5 leading-[1.15] tracking-tight">
            Manajemen Keuangan
            <br />
            <span className="text-white/80">Sekolah</span>
          </h1>
          
          {/* Description */}
          <p className="text-white/60 text-center max-w-[420px] mb-12 text-[15px] leading-relaxed">
            Sistem informasi terintegrasi untuk membantu operator sekolah dalam pelaporan administrasi BOS/BOSP.
          </p>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['LPJ', 'BKU', 'Cetak Dokumen', 'Valid & Aman'].map((label, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.08] backdrop-blur-sm rounded-xl border border-white/[0.1] hover:bg-white/[0.12] transition-all duration-300 cursor-default">
                <span className="material-symbols-outlined text-white/80 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {['description', 'receipt_long', 'print', 'verified'][i]}
                </span>
                <span className="text-white/90 text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-10">
            {[
              { value: '13+', label: 'Template' },
              { value: '100%', label: 'Digital' },
              { value: '24/7', label: 'Akses' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-white/50 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* RIGHT SIDE: LOGIN FORM                                           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col min-h-screen bg-white">
        
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-4 p-8 pb-0">
          <div className="w-14 h-14 bg-[#004ac6] rounded-[18px] flex items-center justify-center shadow-lg shadow-[#004ac6]/20">
            <span className="material-symbols-outlined text-white text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">LPJ BOS/BOSP</h2>
            <p className="text-[13px] text-slate-500">Administrasi Keuangan Sekolah</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-[400px]">
            
            {/* Back Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#004ac6] transition-colors mb-10 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Kembali ke Beranda
            </Link>

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-[32px] font-bold text-slate-900 mb-3 tracking-tight">Selamat Datang</h2>
              <p className="text-slate-500 text-[15px] leading-relaxed">
                Masuk ke akun Anda untuk melanjutkan ke dasbor administrasi sekolah.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              
              {/* Username */}
              <div className="space-y-2">
                <label className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider" htmlFor="username">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004ac6]/10 focus:border-[#004ac6] focus:bg-white outline-none transition-all text-slate-900 text-[15px] placeholder:text-slate-400"
                    id="username"
                    type="text"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-semibold text-slate-700 uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <a className="text-[13px] font-medium text-[#004ac6] hover:underline" href="#">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#004ac6]/10 focus:border-[#004ac6] focus:bg-white outline-none transition-all text-slate-900 text-[15px] placeholder:text-slate-400"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPassword(!showPassword);
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center py-1">
                <input
                  className="w-[18px] h-[18px] text-[#004ac6] border-slate-300 rounded-lg focus:ring-[#004ac6] cursor-pointer"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="ml-3 text-[14px] text-slate-600 select-none cursor-pointer" htmlFor="remember">
                  Ingat Saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full flex justify-center items-center gap-3 bg-[#004ac6] hover:bg-[#003fa8] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-[#004ac6]/20 hover:shadow-xl hover:shadow-[#004ac6]/30 transition-all duration-300 active:scale-[0.98] text-[15px]"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Help Text */}
            <div className="mt-8 text-center">
              <p className="text-[14px] text-slate-500">
                Butuh bantuan?{" "}
                <a className="font-semibold text-[#004ac6] hover:underline" href="#">
                  Hubungi Admin
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          <div className="flex items-center justify-between">
            <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-slate-500 tracking-wider">
              PROTOTYPE
            </span>
            <span className="text-[12px] text-slate-400">
              © {new Date().getFullYear()} LPJ BOS/BOSP
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
