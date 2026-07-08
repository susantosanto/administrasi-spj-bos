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
    <div className="bg-background font-body-lg text-on-background overflow-hidden">
      <main className="flex min-h-screen w-full">
        {/* Left Side: Visual/Illustration */}
        <section className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden">
          {/* Animated Decorative Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay blur-3xl animate-float"></div>
            <div
              className="absolute bottom-20 right-20 w-96 h-96 bg-primary-container rounded-full mix-blend-overlay blur-3xl animate-float"
              style={{ animationDelay: "-2s" }}
            ></div>
          </div>
          <div className="relative z-10 w-full max-w-xl px-xl text-center">
            <div className="mb-lg inline-flex items-center justify-center p-md bg-white/10 backdrop-blur-md rounded-xl border border-white/20 animate-float">
              <span
                className="material-symbols-outlined text-white text-[64px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance_wallet
              </span>
            </div>
            <h1 className="font-headline-lg text-white mb-md">
              Manajemen Keuangan Sekolah Jadi Lebih Mudah
            </h1>
            <p className="text-white/80 font-body-lg mb-xl">
              Sistem Informasi LPJ BOS/BOSP terintegrasi untuk membantu operator
              sekolah dalam pelaporan administrasi yang cepat, akurat, dan
              transparan.
            </p>
            {/* Illustration */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-white/30 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative rounded-xl shadow-2xl w-full border border-white/10 bg-white/10 backdrop-blur-sm h-48 flex items-center justify-center">
                <div className="flex items-center gap-lg">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-white/80 text-5xl">
                      description
                    </span>
                    <p className="text-white/60 text-xs mt-1">LPJ</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-white/80 text-5xl">
                      receipt_long
                    </span>
                    <p className="text-white/60 text-xs mt-1">BKU</p>
                  </div>
                  <div className="text-center">
                    <span className="material-symbols-outlined text-white/80 text-5xl">
                      trending_up
                    </span>
                    <p className="text-white/60 text-xs mt-1">Realisasi</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Bottom Left Info */}
          <div className="absolute bottom-md left-md flex items-center gap-sm text-white/60">
            <span className="material-symbols-outlined text-[18px]">
              verified_user
            </span>
            <span className="font-label-md">Sistem Terenkripsi &amp; Aman</span>
          </div>
        </section>

        {/* Right Side: Login Form */}
        <section className="w-full lg:w-1/2 flex flex-col justify-between p-lg md:p-xl bg-surface">
          {/* Top Logo/Identity (Mobile) */}
          <div className="lg:hidden flex items-center gap-md mb-xl">
            <Link
              to="/"
              className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-white text-[24px]">
                school
              </span>
            </Link>
            <div>
              <h2 className="font-headline-sm text-primary">LPJ BOS/BOSP</h2>
              <p className="text-[12px] text-text-low">
                Administrasi Keuangan Sekolah
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Back to Home */}
              <Link
                to="/"
                className="inline-flex items-center gap-xs text-text-low hover:text-primary transition-colors mb-lg font-label-md"
              >
                <span className="material-symbols-outlined text-lg">
                  arrow_back
                </span>
                Kembali ke Beranda
              </Link>

              <div className="mb-xl">
                <h2 className="font-headline-lg text-text-high mb-xs">
                  Selamat Datang
                </h2>
                <p className="text-text-low font-body-lg">
                  Silakan masuk ke akun Anda untuk melanjutkan akses ke dasbor
                  administrasi.
                </p>
              </div>

              <form className="space-y-lg" onSubmit={handleLogin}>
                {/* Username Field */}
                <div className="space-y-xs">
                  <label
                    className="font-label-md text-text-high"
                    htmlFor="username"
                  >
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">
                        person
                      </span>
                    </div>
                    <input
                      className="block w-full pl-14 pr-md py-md bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                      id="username"
                      type="text"
                      placeholder="Masukkan username Anda"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-xs">
                  <div className="flex justify-between items-center">
                    <label
                      className="font-label-md text-text-high"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="text-[12px] font-semibold text-primary hover:underline"
                      href="#"
                    >
                      Lupa Password?
                    </a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[20px]">
                        lock
                      </span>
                    </div>
                    <input
                      className="block w-full pl-14 pr-14 py-md bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-text-high transition-colors"
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
                <div className="flex items-center">
                  <input
                    className="w-4 h-4 text-primary border-outline-variant rounded focus:ring-primary"
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label
                    className="ml-sm font-label-md text-text-low select-none cursor-pointer"
                    htmlFor="remember"
                  >
                    Ingat Saya
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  className="w-full flex justify-center items-center gap-md bg-primary hover:bg-primary/90 text-white font-semibold py-md px-lg rounded-lg shadow-lg shadow-primary/20 transition-all duration-200 active:scale-[0.98]"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <span className="material-symbols-outlined text-[20px]">
                        login
                      </span>
                    </>
                  )}
                </button>
              </form>

              {/* Extra Info */}
              <div className="mt-xl pt-lg border-t border-outline-variant/30 text-center">
                <p className="text-body-sm text-text-low">
                  Butuh bantuan? Hubungi{" "}
                  <a className="text-primary font-semibold" href="#">
                    Pusat Layanan
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Footer Info */}
          <footer className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-md border-t border-outline-variant/20 pt-lg">
            <div className="flex items-center gap-sm">
              <span className="bg-surface-container-low px-sm py-xs rounded text-[11px] font-bold text-text-low">
                VERSI DEMO (PROTOTYPE VERSION)
              </span>
              <span className="text-[12px] text-text-low">
                &copy; {new Date().getFullYear()} LPJ BOS/BOSP
              </span>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
