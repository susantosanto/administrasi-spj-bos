import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Shield,
  FileText,
  Upload,
  Printer,
  GraduationCap,
} from "lucide-react";
import storageHelper from "../utils/storageHelper";
import { useToast } from "../components/ui/Toast";
import Button from "../ui/atoms/Button";
import Input from "../ui/atoms/Input";
import Checkbox from "../ui/atoms/Checkbox";
import IconButton from "../ui/atoms/IconButton";
import FormField from "../ui/molecules/FormField";
import Divider from "../ui/atoms/Divider";
import { cn } from "../ui/cn";

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

    if (!username || !password) {
      toast.error("Username dan password harus diisi");
      return;
    }

    setLoading(true);

    // Simulasi network delay (auth dummy)
    setTimeout(() => {
      try {
        storageHelper.set("auth", true);
        storageHelper.set("auth_user", { name: username, role: "admin" });
        storageHelper.set("auth_token", "mock-token-" + Date.now());
        if (remember) {
          storageHelper.set("auth_remember", true);
        }
        toast.success("Selamat datang, " + username + "!");
        navigate("/dashboard");
      } catch (err) {
        toast.error("Gagal masuk: " + err.message);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* LEFT: VISUAL PANEL — selalu biru tua (light + dark)            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section
        className={cn(
          "hidden lg:flex lg:w-1/2 relative overflow-hidden",
          "bg-[#004AC6] text-white"
        )}
        aria-hidden="true"
      >
        {/* Background subtle pattern — static, no animation */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Soft accent glow — static gradient, no animation */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 800px 600px at 20% 20%, rgba(255,255,255,0.10) 0%, transparent 60%), radial-gradient(ellipse 600px 500px at 85% 80%, rgba(255,255,255,0.06) 0%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                SPJ BOS/BOSP
              </h2>
              <p className="text-xs text-white/60">
                Administrasi Keuangan Sekolah
              </p>
            </div>
          </div>

          {/* Hero */}
          <div className="mb-12 max-w-md">
            <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight mb-5">
              Kelola LPJ Sekolah dengan Tenang
            </h1>
            <p className="text-white/70 text-base leading-relaxed">
              Sistem administrasi terintegrasi untuk pelaporan BOS/BOSP yang
              transparan, akuntabel, dan sesuai juknis.
            </p>
          </div>

          {/* Features */}
          <ul className="space-y-4 mb-12">
            {[
              {
                icon: FileText,
                text: "18 template dokumen siap pakai",
              },
              {
                icon: Upload,
                text: "Upload BKU dari ARKAS otomatis",
              },
              {
                icon: Printer,
                text: "Cetak A4 langsung ke PDF",
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 text-white/90"
                >
                  <div className="w-9 h-9 rounded-md bg-white/12 border border-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </li>
              );
            })}
          </ul>

          {/* Trust */}
          <div className="flex items-center gap-2 text-white/50">
            <Shield className="w-4 h-4" />
            <span className="text-xs">
              Data disimpan lokal di perangkat Anda
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* RIGHT: FORM PANEL — glass                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="flex-1 flex flex-col min-h-screen glass">
        {/* Mobile Header */}
        <div className="lg:hidden px-6 pt-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <GraduationCap
                className="w-5 h-5 text-on-primary"
                strokeWidth={2}
              />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-text-high">
                SPJ BOS/BOSP
              </h2>
              <p className="text-xs text-text-muted">Administrasi Sekolah</p>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:px-10 lg:px-16">
          <div className="w-full max-w-md">
            {/* Back to Landing */}
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Beranda
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-high mb-2">
                Masuk ke Akun
              </h1>
              <p className="text-sm text-text-muted">
                Selamat datang kembali. Silakan masuk untuk melanjutkan.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <FormField
                label="Username"
                htmlFor="username"
                required
              >
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  required
                />
              </FormField>

              <FormField
                label="Password"
                htmlFor="password"
                required
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="pr-12"
                    required
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                    <IconButton
                      icon={showPassword ? EyeOff : Eye}
                      label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((v) => !v)}
                      tabIndex={-1}
                    />
                  </div>
                </div>
              </FormField>

              <div className="flex items-center justify-between">
                <Checkbox
                  id="remember"
                  label="Ingat saya"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <a
                  href="#"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Lupa password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <Divider label="atau" />
            </div>

            {/* Help */}
            <p className="text-center text-sm text-text-muted">
              Butuh bantuan?{" "}
              <a
                href="#"
                className="text-primary font-medium hover:underline"
              >
                Hubungi admin
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 lg:px-10">
          <div className="flex items-center justify-between text-xs text-text-low">
            <span className="px-2.5 py-1 bg-surface-muted rounded-sm font-medium text-text-muted">
              PROTOTIPE
            </span>
            <span>© {new Date().getFullYear()} SPJ BOS/BOSP</span>
          </div>
        </div>
      </section>
    </div>
  );
}
