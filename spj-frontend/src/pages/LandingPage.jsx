import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import Button from "../ui/atoms/Button";
import Badge from "../ui/atoms/Badge";
import { cn } from "../ui/cn";

const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Template", href: "#template" },
  { label: "Panduan", href: "#panduan" },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BACKGROUND MOTIF FLORAL (Sangat Halus)                        */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0"
        style={{
          backgroundImage: "url('/floral-pattern.svg')",
          backgroundSize: "600px 600px",
          backgroundRepeat: "repeat",
          filter: "grayscale(1)", // Paksa netral
        }}
        aria-hidden="true"
      />

      {/* Konten Utama */}
      <div className="relative z-10 flex flex-col">
        {/* ════════════════════════════════════════════════════════════════ */}
        {/* NAVBAR (Dari Step 6.5.1)                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <header className="sticky top-0 z-50 w-full glass-sticky">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-on-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-high leading-none text-sm">
                  LPJ BOS/BOSP
                </span>
                <span className="text-[10px] text-muted leading-tight">
                  Administrasi Keuangan Sekolah
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-high hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-md text-sm font-semibold text-high bg-surface hover:bg-surface-high border border-border-strong shadow-sm transition-colors"
              >
                Masuk
              </Link>
              <Button variant="primary" className="h-9 px-4">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                   */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <main className="flex-1 flex items-center pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

              {/* Kiri: Teks */}
              <div className="lg:col-span-6 flex flex-col items-start text-left">
                <Badge variant="primary" className="mb-6 px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Sistem Administrasi Keuangan Sekolah
                </Badge>

                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-high leading-[1.1] tracking-tight mb-6">
                  Administrasi tertata. <br className="hidden sm:block" />
                  <span className="text-primary">Pelaporan lebih mudah.</span>
                </h1>

                <p className="text-base sm:text-lg text-muted leading-relaxed mb-8 max-w-xl">
                  Kelola dokumen BOS/BOSP, susun laporan, dan cetak LPJ dalam satu sistem yang dirancang untuk membantu administrasi sekolah menjadi lebih efisien dan terorganisasi.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Lihat Fitur
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-2 text-sm text-muted">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span>Lebih praktis untuk mendukung administrasi sekolah.</span>
                </div>
              </div>

              {/* Kanan: Visual Mockup (Card Glass) */}
              <div className="lg:col-span-6 relative">
                {/* Dekorasi Glow di belakang card */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-info/20 blur-3xl -z-10 rounded-full opacity-50"
                />

                <div className="glass rounded-2xl border border-glass-border shadow-xl overflow-hidden">
                  {/* Header Mockup */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-surface/50 border-b border-glass-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-danger/80" />
                      <div className="w-3 h-3 rounded-full bg-warning/80" />
                      <div className="w-3 h-3 rounded-full bg-success/80" />
                    </div>
                    <div className="ml-4 h-6 bg-surface-muted rounded-md flex-1 max-w-xs opacity-50" />
                  </div>
                  {/* Body Mockup */}
                  <div className="p-6 bg-surface/80 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="h-3 w-24 bg-text-high/20 rounded mb-1.5" />
                          <div className="h-2 w-16 bg-text-muted/20 rounded" />
                        </div>
                      </div>
                      <Badge variant="success">Aktif</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-surface-muted border border-border">
                        <div className="h-2 w-12 bg-text-muted/30 rounded mb-2" />
                        <div className="h-6 w-16 bg-text-high/40 rounded" />
                      </div>
                      <div className="p-4 rounded-xl bg-surface-muted border border-border">
                        <div className="h-2 w-12 bg-text-muted/30 rounded mb-2" />
                        <div className="h-6 w-16 bg-text-high/40 rounded" />
                      </div>
                    </div>

                    {/* Bar Chart Mockup */}
                    <div className="flex items-end gap-3 h-32 pt-4 border-t border-border">
                      {[40, 60, 45, 80, 55, 90, 70].map((height, i) => (
                        <div key={i} className="flex-1 bg-primary/20 rounded-t-sm">
                          <div
                            className="w-full bg-primary rounded-t-sm h-full opacity-80"
                            style={{ height: `${height}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

        {/* PLACEHOLDER untuk Step 7B (Fitur, dll) */}
        <div className="py-20 text-center text-muted border-t border-border/50 bg-surface/50">
          [Section Fitur, Statistik, CTA, dan Footer akan dibangun di Step 7B]
        </div>

      </div>
    </div>
  );
}
