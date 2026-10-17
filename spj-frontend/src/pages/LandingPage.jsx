import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Printer,
  ShieldCheck,
  Upload,
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

        {/* ═════════════════════════════════════════════════════════════════ */}
        {/* SECTION 1: STATISTIK                                           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="py-16 bg-surface/30 border-y border-border/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-border/50">
              {[
                { value: "18+", label: "Template dokumen siap pakai" },
                { value: "6", label: "Modul administrasi terpadu" },
                { value: "3", label: "Langkah dari BKU ke LPJ siap cetak" },
                { value: "100%", label: "Data tersimpan di perangkat" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center px-4">
                  <span className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted leading-snug">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* SECTION 2: FITUR UTAMA (BENTO GRID)                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="primary" className="mb-4">FITUR UNGGULAN</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-high mb-4">
                Semua kebutuhan administrasi dalam satu tempat
              </h2>
              <p className="text-base text-muted">
                Akses fitur yang membantu pekerjaan administrasi dan penyusunan laporan sekolah menjadi lebih terstruktur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Upload,
                  title: "Upload BKU dari ARKAS",
                  desc: "File Excel BKU langsung terparse otomatis menjadi transaksi yang siap dipakai.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  icon: FileText,
                  title: "Template Dokumen Lengkap",
                  desc: "Honorarium, SPPD, mamin, pemeliharaan, ATK, pajak, hingga cover dan register.",
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10"
                },
                {
                  icon: Printer,
                  title: "Cetak A4 Siap Kirim",
                  desc: "Dokumen LPJ format A4 profesional, siap tanda tangan dan arsip.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10"
                },
                {
                  icon: ShieldCheck,
                  title: "Data Sekolah & Pejabat",
                  desc: "Profil sekolah, kepala sekolah, dan bendahara terisi otomatis di semua dokumen.",
                  color: "text-amber-500",
                  bg: "bg-amber-500/10"
                },
                {
                  icon: CheckCircle2,
                  title: "Data Guru & Tendik",
                  desc: "Import dari Dapodik sekali, dipakai berulang untuk seluruh dokumen honor.",
                  color: "text-rose-500",
                  bg: "bg-rose-500/10"
                },
                {
                  icon: GraduationCap,
                  title: "Foto Dokumentasi AI",
                  desc: "Upload personel dan ruangan sekolah, generate foto kegiatan saat dibutuhkan.",
                  color: "text-primary",
                  bg: "bg-primary/10"
                }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="group p-6 rounded-xl bg-surface border border-border hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-5", feature.bg, feature.color)}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-high mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 3: CTA (CALL TO ACTION)                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 md:px-16 text-center shadow-xl">
              {/* Motif dekoratif di dalam CTA */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "url('/floral-pattern.svg')",
                  backgroundSize: "400px 400px",
                  filter: "brightness(0) invert(1)"
                }}
              />
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                  Siap mengelola administrasi sekolah dengan lebih praktis?
                </h2>
                <p className="text-primary-soft text-base mb-8">
                  Mulai gunakan LPJ BOS/BOSP untuk mengakses fitur administrasi yang tersedia dalam aplikasi.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link 
                    to="/login" 
                    className="inline-flex h-12 px-8 items-center justify-center rounded-md text-base font-semibold bg-white text-primary hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* SECTION 4: FOOTER                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <footer className="bg-surface border-t border-border pt-16 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
              
              {/* Brand */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-on-primary" />
                  </div>
                  <span className="font-display font-bold text-high text-sm">
                    LPJ BOS/BOSP
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  Aplikasi administrasi keuangan sekolah untuk mengelola dokumen BOS/BOSP, menyusun laporan, dan mencetak LPJ.
                </p>
              </div>

              {/* Navigasi */}
              <div>
                <h4 className="font-display font-semibold text-high mb-4 text-sm">Navigasi</h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li><a href="#beranda" className="hover:text-primary transition-colors">Beranda</a></li>
                  <li><a href="#fitur" className="hover:text-primary transition-colors">Fitur</a></li>
                  <li><a href="#template" className="hover:text-primary transition-colors">Template</a></li>
                  <li><a href="#panduan" className="hover:text-primary transition-colors">Panduan</a></li>
                </ul>
              </div>

              {/* Produk */}
              <div>
                <h4 className="font-display font-semibold text-high mb-4 text-sm">Produk</h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li><a href="#" className="hover:text-primary transition-colors">Dokumen LPJ</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Template Dokumen</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Panduan Penggunaan</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Tentang Aplikasi</a></li>
                </ul>
              </div>

              {/* Akses */}
              <div>
                <h4 className="font-display font-semibold text-high mb-4 text-sm">Akses</h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li><Link to="/login" className="hover:text-primary transition-colors">Masuk ke Aplikasi</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Pratinjau Tampilan</a></li>
                </ul>
              </div>

            </div>

            <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-text-low">
                © {new Date().getFullYear()} LPJ BOS/BOSP. Seluruh hak cipta.
              </p>
              <p className="text-xs text-text-low flex items-center gap-1">
                Dibuat dengan <span className="text-danger">♥</span> untuk sekolah Indonesia
              </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
