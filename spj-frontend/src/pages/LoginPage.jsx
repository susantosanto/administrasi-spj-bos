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
    <div className="min-h-screen bg-white">
      <main className="flex min-h-screen w-full">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT SIDE: PREMIUM BLUE VISUAL                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          
          {/* Premium Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-600 to-primary/90" />
          
          {/* Elegant Mesh Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          
          {/* Floating Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            {/* Large Circle */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-xl" />
            <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-white/[0.04] rounded-full blur-2xl" />
            
            {/* Floating Cards */}
            <div className="absolute top-[15%] left-[10%] w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '0s' }}>
              <span className="material-symbols-outlined text-white/80 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            </div>
            
            <div className="absolute top-[25%] right-[15%] w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '-1s' }}>
              <span className="material-symbols-outlined text-white/80 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
            </div>
            
            <div className="absolute bottom-[30%] left-[15%] w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '-2s' }}>
              <span className="material-symbols-outlined text-white/80 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>print</span>
            </div>
            
            <div className="absolute bottom-[20%] right-[10%] w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center animate-float" style={{ animationDelay: '-0.5s' }}>
              <span className="material-symbols-outlined text-white/80 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
            </div>
            
            <div className="absolute top-[50%] left-[45%] w-12 h-12 bg-white/[0.07] backdrop-blur-sm rounded-xl border border-white/10 flex items-center justify-center animate-float" style={{ animationDelay: '-1.5s' }}>
              <span className="material-symbols-outlined text-white/60 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center px-12 xl:px-20">
            
            {/* Main Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-pulse-slow" />
              <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl border border-white/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance_wallet
                </span>
              </div>
            </div>
            
            {/* Title */}
            <h1 className="text-3xl xl:text-4xl font-bold text-white text-center mb-4 leading-tight">
              Manajemen Keuangan
              <br />
              <span className="text-white/90">Sekolah Jadi Lebih Mudah</span>
            </h1>
            
            {/* Description */}
            <p className="text-white/70 text-center max-w-md mb-10 leading-relaxed">
              Sistem Informasi LPJ BOS/BOSP terintegrasi untuk membantu operator sekolah dalam pelaporan administrasi yang cepat, akurat, dan transparan.
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
              {[
                { icon: 'description', label: 'LPJ', desc: 'Laporan' },
                { icon: 'receipt_long', label: 'BKU', desc: 'Kas Umum' },
                { icon: 'trending_up', label: 'Realisasi', desc: 'Anggaran' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 text-center hover:bg-white/15 transition-all duration-300 group cursor-default">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                  </div>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-white/60 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            
            {/* Trust Badge */}
            <div className="mt-10 flex items-center gap-2 text-white/50">
              <span className="material-symbols-outlined text-lg">verified_user</span>
              <span className="text-sm">Sistem Terenkripsi & Aman</span>
            </div>
          </div>
          
          {/* Decorative Bottom Line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT SIDE: LOGIN FORM                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="w-full lg:w-[45%] flex flex-col justify-center px-8 md:px-12 lg:px-16 xl:px-20 bg-white">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">LPJ BOS/BOSP</h2>
              <p className="text-xs text-slate-500">Administrasi Keuangan Sekolah</p>
            </div>
          </div>

          <div className="w-full max-w-md mx-auto">
            {/* Back Link */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-8 text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali ke Beranda
            </Link>

            {/* Header */}
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Selamat Datang</h2>
              <p className="text-slate-500">
                Silakan masuk ke akun Anda untuk melanjutkan akses ke dasbor administrasi.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Username */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700" htmlFor="username">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    id="username"
                    type="text"
                    placeholder="Masukkan username Anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                    Password
                  </label>
                  <a className="text-sm font-medium text-primary hover:text-primary/80 transition-colors" href="#">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">lock</span>
                  </div>
                  <input
                    className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-slate-900 placeholder:text-slate-400"
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
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  className="w-5 h-5 text-primary border-slate-300 rounded-lg focus:ring-primary cursor-pointer"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label
                  className="ml-3 text-sm text-slate-600 select-none cursor-pointer"
                  htmlFor="remember"
                >
                  Ingat Saya
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full flex justify-center items-center gap-3 bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98] text-base"
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
                    <span className="material-symbols-outlined text-xl">login</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400">atau</span>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-slate-500">
                Butuh bantuan? Hubungi{" "}
                <a className="font-semibold text-primary hover:text-primary/80 transition-colors" href="#">
                  Pusat Layanan
                </a>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto pt-8 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500">
                VERSI DEMO
              </span>
              <span className="text-xs text-slate-400">
                © {new Date().getFullYear()} LPJ BOS/BOSP
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
