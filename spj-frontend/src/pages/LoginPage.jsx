import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import storageHelper from "../utils/storageHelper";
import { useToast } from "../components/ui/Toast";
import { logActivity } from "../utils/activityLog";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";
import { verifyLocalAccount } from "../utils/localAccount";

export default function LoginPage() {
  const { isDark } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await verifyLocalAccount(username, password);
      if (!res.ok) {
        toast.error("Username atau password salah");
        return;
      }
      const displayName = res.account?.name || username;
      localStorage.setItem("spj_auth", "true");
      storageHelper.set("auth_user", { name: displayName, role: "admin" });
      storageHelper.set("auth_token", "mock-token-" + Date.now());
      logActivity({ type: 'auth', title: `Masuk ${displayName}`, detail: 'login dashboard' });
      toast.success("Selamat datang, " + displayName + "!");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Gagal memeriksa akun: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex"
      style={{ backgroundColor: isDark ? "#0F172A" : "#F3F5F9" }}
    >
      {/* ── Batik drift — satu layar utuh, sama persis dengan landing ── */}
      <div
        className="absolute inset-x-0 -inset-y-[360px] pointer-events-none animate-batik-drift"
        style={{
          backgroundImage: "url('/floral-pattern.jpg')",
          backgroundSize: "360px 360px",
          backgroundRepeat: "repeat",
          opacity: isDark ? 0.07 : 0.3,
          mixBlendMode: isDark ? "normal" : "multiply",
        }}
        aria-hidden="true"
      />

      {/* ── Mesh gradient — aksen lembut, konsisten dengan hero landing ── */}
      <div
        className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(36,87,167,0.08) 0%, transparent 72%)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 72%)" }}
        aria-hidden="true"
      />

      {/* ── Konten tengah ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Brand lockup */}
        <div className="flex flex-col items-center text-center mb-5 animate-fade-up">
          <img src="/asik-logo.png" alt="Asik" className="h-10 w-auto mb-2.5" draggable="false" />
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: isDark ? "#F1F5F9" : "#1D2939" }}
          >
            Aplikasi Dokumentasi LPJ
          </h2>
          <p className="text-xs mt-1" style={{ color: isDark ? "#94A3B8" : "#66758A" }}>
            Pertanggungjawaban Dana BOS/BOSP
          </p>
        </div>

        {/* Glass card */}
        <div
          className="w-full max-w-[400px] rounded-2xl border p-6 animate-fade-up"
          style={{
            animationDelay: "0.15s",
            backgroundColor: isDark ? "rgba(15,23,42,0.50)" : "rgba(255,255,255,0.50)",
            borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.75)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            boxShadow: isDark
              ? "0 24px 50px -22px rgba(0,0,0,0.45)"
              : "0 24px 50px -22px rgba(35,89,166,0.30)",
          }}
        >
          {/* Top actions */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#2457A7] transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Beranda
            </Link>
            <ThemeToggle variant="icon" />
          </div>

          {/* Header */}
          <div className="mb-4">
            <h1 className="text-[22px] font-bold text-slate-900 mb-1">Masuk ke Akun</h1>
            <p className="text-slate-500 text-[13px]">
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
                  autoComplete="username"
                  className="w-full h-11 pl-11 pr-4 glass-input border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2457A7]/10 focus:border-[#2457A7] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); toast.info("Fitur lupa password dalam pengembangan"); }}
                  className="text-[12px] hover:underline"
                  style={{ color: isDark ? "#60A5FA" : "#2457A7" }}
                >
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
                  autoComplete="current-password"
                  className="w-full h-11 pl-11 pr-11 glass-input border border-slate-200 rounded-xl text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2457A7]/10 focus:border-[#2457A7] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2 py-0.5">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-[#2457A7] border-slate-300 rounded focus:ring-[#2457A7] cursor-pointer"
              />
              <label htmlFor="remember" className="text-[13px] text-slate-600 cursor-pointer">
                Ingat saya
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#2457A7] hover:bg-[#1D4688] text-white font-semibold rounded-xl shadow-lg shadow-[#2457A7]/20 hover:shadow-xl hover:shadow-[#2457A7]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
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
          <div className="my-4 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[12px] text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Help */}
          <p className="text-center text-[13px] text-slate-500">
            Belum punya lisensi?{' '}
            <Link
              to="/daftar"
              className="font-medium hover:underline"
              style={{ color: isDark ? "#60A5FA" : "#2457A7" }}
            >
              Daftar sekolah
            </Link>{' '}
            · Butuh bantuan?{' '}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); toast.info("Hubungi admin di instansi sekolah masing-masing"); }}
              className="font-medium hover:underline"
              style={{ color: isDark ? "#60A5FA" : "#2457A7" }}
            >
              Hubungi admin
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 mt-5 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 bg-slate-100 rounded-md font-medium text-slate-500">
            PROTOTYPE
          </span>
          <span>© {new Date().getFullYear()} Aplikasi Dokumentasi LPJ</span>
        </div>
      </div>
    </div>
  );
}
