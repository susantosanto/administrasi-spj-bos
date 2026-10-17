/**
 * Landing Page — Premium Education Finance SaaS (Redesign 2026-10-11)
 * Clean, elegan, hierarki kuat. Fokus: keterbacaan, CTA jelas, motif batik halus.
 * Light-only. Satu file, tanpa dependency baru.
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Reveal on scroll — satu observer, hormati prefers-reduced-motion
// ─────────────────────────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lp-reveal ${visible ? "lp-reveal-visible" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated counter — berhenti setelah terlihat sekali
// ─────────────────────────────────────────────────────────────────────────────
function AnimatedCounter({ end, duration = 1600, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setCount(end);
          return;
        }
        let startTime;
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
        const animate = (now) => {
          if (!startTime) startTime = now;
          const progress = Math.min((now - startTime) / duration, 1);
          setCount(Math.floor(easeOutQuart(progress) * end));
          if (progress < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Fitur", href: "#fitur" },
  { label: "Template", href: "#template" },
  { label: "Panduan", href: "#panduan" },
  { label: "Kontak", href: "#kontak" },
];

const TRUST_ITEMS = [
  { icon: "bolt", title: "Mudah Digunakan", desc: "Alur sederhana untuk semua operator." },
  { icon: "folder_managed", title: "Data Terorganisasi", desc: "Semua dokumen rapi dalam satu sistem." },
  { icon: "description", title: "Template Dokumen", desc: "Honor, SPPD, mamin, pemeliharaan, dan lainnya." },
  { icon: "touch_app", title: "Akses dan Navigasi Praktis", desc: "Navigasi ringkas dari upload sampai cetak." },
];

const FEATURES = [
  {
    icon: "upload_file",
    title: "Upload BKU dari ARKAS",
    desc: "File Excel BKU langsung terparse otomatis menjadi transaksi yang siap dipakai.",
  },
  {
    icon: "description",
    title: "Template Dokumen Lengkap",
    desc: "Honorarium, SPPD, mamin, pemeliharaan, ATK, pajak, hingga cover dan register.",
  },
  {
    icon: "print",
    title: "Cetak Satu Klik",
    desc: "Dokumen LPJ format A4 profesional, siap tanda tangan dan arsip.",
  },
  {
    icon: "school",
    title: "Data Sekolah & Pejabat",
    desc: "Profil sekolah, kepala sekolah, dan bendahara terisi otomatis di semua dokumen.",
  },
  {
    icon: "groups",
    title: "Data Guru & Tendik",
    desc: "Import dari Dapodik sekali, dipakai berulang untuk seluruh dokumen honor.",
  },
  {
    icon: "auto_awesome",
    title: "Foto Dokumentasi AI",
    desc: "Upload personel dan ruangan sekali, generate foto kegiatan saat dibutuhkan.",
  },
];

const DOC_STATS = [
  { label: "Total dokumen", value: 18, tone: "text-ink" },
  { label: "Dokumen selesai", value: 8, tone: "text-success-bright" },
  { label: "Dalam proses", value: 3, tone: "text-brand" },
  { label: "Perlu tindakan", value: 2, tone: "text-warning" },
];

const STEPS = [
  {
    no: "01",
    icon: "upload_file",
    title: "Upload & verifikasi",
    desc: "Masukkan BKU dari ARKAS dan data Dapodik. Sistem memeriksa kelengkapan otomatis.",
  },
  {
    no: "02",
    icon: "edit_document",
    title: "Lengkapi otomatis",
    desc: "Nama, jabatan, nominal, dan nomor surat terisi sendiri di setiap template.",
  },
  {
    no: "03",
    icon: "print",
    title: "Cetak & arsipkan",
    desc: "Unduh dokumen A4 yang rapi, pantau progres kelengkapan LPJ per transaksi.",
  },
];

const TEMPLATES = [
  { icon: "payments", title: "Honorarium", desc: "Kuitansi, daftar hadir, SPT", count: "4 dokumen" },
  { icon: "flight_takeoff", title: "Perjalanan Dinas", desc: "SPPD, kuitansi, laporan", count: "3 dokumen" },
  { icon: "restaurant", title: "Makan Minum", desc: "Rapat, kegiatan, lembur", count: "2 dokumen" },
  { icon: "handyman", title: "Pemeliharaan", desc: "Berita acara, kuitansi", count: "2 dokumen" },
  { icon: "folder_open", title: "Kelengkapan", desc: "Cover LPJ, register kas, BAP", count: "5 dokumen" },
  { icon: "receipt_long", title: "Belanja & Pajak", desc: "ATK, faktur, bukti potong", count: "3 dokumen" },
];

const STATS = [
  { number: 18, suffix: "+", label: "Template dokumen siap pakai" },
  { number: 6, suffix: "", label: "Modul administrasi terpadu" },
  { number: 3, suffix: " langkah", label: "Dari BKU ke LPJ siap cetak" },
  { number: 100, suffix: "%", label: "Data tersimpan di perangkat" },
];

const WHY_US = [
  {
    icon: "psychology",
    title: "Dibuat operator, untuk operator",
    desc: "Alurnya mengikuti cara kerja bendahara sekolah yang sebenarnya, bukan teori.",
  },
  {
    icon: "auto_fix_high",
    title: "Otomatis, minim salah ketik",
    desc: "Satu sumber data untuk semua dokumen — ubah sekali, berlaku di mana-mana.",
  },
  {
    icon: "shield",
    title: "Aman dan transparan",
    desc: "Data milik sekolah tersimpan lokal. Setiap angka bisa dilacak ke BKU-nya.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans antialiased overflow-x-hidden">
      {/* ═══════════════ A. HEADER ═══════════════ */}
      <header className="sticky top-0 z-50 w-full glass-sticky">
        <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10 h-[68px] md:h-[72px] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label="LPJ BOS/BOSP — Beranda">
            <span className="w-9 h-9 rounded-[10px] bg-primary flex items-center justify-center shadow-md shadow-primary/25">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-bold text-high tracking-tight">LPJ BOS/BOSP</span>
              <span className="block text-[11px] font-medium text-muted mt-0.5">Administrasi Keuangan Sekolah</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi utama">
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

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="h-9 px-4 items-center justify-center rounded-md text-sm font-semibold text-high bg-surface hover:bg-surface-high border border-border-strong shadow-sm transition-colors"
            >
              Masuk
            </Link>
            <Link
              to="/login"
              className="h-9 px-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold bg-primary text-on-primary hover:bg-primary-hover transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Mulai Sekarang
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-high hover:bg-surface-muted transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          >
            <span className="material-symbols-outlined text-2xl">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-5 pt-2 pb-5">
            <nav className="flex flex-col" aria-label="Navigasi seluler">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-[15px] font-medium text-high border-b border-border/70 last:border-0 hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-3 mt-4">
              <Link
                to="/login"
                className="flex-1 text-center px-4 py-3 rounded-md text-sm font-semibold text-high bg-surface hover:bg-surface-high border border-border-strong shadow-sm"
              >
                Masuk
              </Link>
              <Link
                to="/login"
                className="flex-1 text-center px-4 py-3 rounded-md text-sm font-semibold bg-primary text-on-primary hover:bg-primary-hover shadow-sm"
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ═══════════════ B. HERO ═══════════════ */}
        <section id="beranda" className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 pt-12 pb-20 lg:pt-20 lg:pb-28 scroll-mt-20">
          {/* Ambient Glow Effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" aria-hidden="true" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Column (Left) */}
              <Reveal className="lg:col-span-6">
                <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/15 text-[13px] font-semibold text-brand mb-5">
                  <span className="material-symbols-outlined text-base">account_balance</span>
                  Sistem Administrasi Keuangan Sekolah
                </p>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-5">
                  Administrasi tertata.{" "}
                  <span className="text-brand">Pelaporan lebih mudah.</span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed mb-8">
                  Kelola dokumen BOS/BOSP, susun laporan, dan cetak LPJ dalam satu sistem yang
                  dirancang untuk membantu administrasi sekolah menjadi lebih efisien dan terorganisasi.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 rounded-[12px] text-[14px] sm:text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-colors min-h-[48px] sm:min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Mulai Sekarang
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </Link>
                  <a
                    href="#fitur"
                    className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 rounded-[12px] text-[14px] sm:text-[15px] font-semibold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 transition-colors min-h-[48px] sm:min-h-[50px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                  >
                    Lihat Fitur
                  </a>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-8">Lebih praktis untuk mendukung administrasi sekolah.</p>
              </Reveal>

              {/* Visual: preview dashboard (data ilustratif) */}
              {/* Mockup Column (Right) */}
              <Reveal delay={150} className="relative lg:col-span-6">
                <div
                  className="relative bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-6 ring-1 ring-white/10 overflow-hidden"
                  role="img"
                  aria-label="Ilustrasi preview dashboard LPJ BOS/BOSP: statistik dana, grafik realisasi, dan daftar dokumen"
                >
                  {/* Mini app header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-white">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E4EAF3]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E4EAF3]" />
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-soft" />
                    </span>
                    <span className="flex-1 h-8 rounded-lg bg-canvas border border-line flex items-center px-3 text-xs text-muted">
                      Cari dokumen…
                    </span>
                    <span className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center text-xs font-bold">
                      OP
                    </span>
                  </div>

                  <div className="flex">
                    {/* Mini sidebar */}
                    <div className="w-14 shrink-0 bg-navy flex flex-col items-center py-4 gap-1.5" aria-hidden="true">
                      <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-2">
                        <span className="material-symbols-outlined text-white text-lg">school</span>
                      </span>
                      {["dashboard", "upload_file", "description", "groups", "print"].map((icon, i) => (
                        <span
                          key={icon}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            i === 0 ? "bg-white text-navy" : "text-slate-300"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">{icon}</span>
                        </span>
                      ))}
                    </div>

                    {/* Main panel */}
                    <div className="flex-1 p-4 md:p-5 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-ink">Ringkasan Dokumen</p>
                        <span className="text-[11px] font-semibold text-muted bg-canvas border border-line rounded-full px-2.5 py-1">
                          Data ilustrasi
                        </span>
                      </div>

                      {/* Kartu statistik dokumen */}
                      <div className="grid grid-cols-4 gap-2 md:gap-2.5 mb-3">
                        {DOC_STATS.map((s) => (
                          <div key={s.label} className="rounded-xl border border-line bg-canvas/60 px-2 py-2.5 text-center">
                            <p className="text-[10px] font-medium text-muted truncate">{s.label}</p>
                            <p className={`text-lg font-bold tabular-nums ${s.tone}`}>{s.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Grafik + komposisi */}
                      <div className="grid grid-cols-5 gap-2.5 md:gap-3 mb-3">
                        <div className="col-span-3 rounded-xl border border-line p-3">
                          <p className="text-[11px] font-semibold text-ink mb-2">Grafik realisasi dana</p>
                          <svg viewBox="0 0 200 84" className="w-full h-auto" aria-hidden="true">
                            <line x1="0" y1="76" x2="200" y2="76" stroke="#E4EAF3" strokeWidth="1.5" />
                            {[
                              { x: 14, h: 30 },
                              { x: 48, h: 44 },
                              { x: 82, h: 38 },
                              { x: 116, h: 56 },
                              { x: 150, h: 66 },
                            ].map((b, i) => (
                              <rect
                                key={b.x}
                                x={b.x}
                                y={76 - b.h}
                                width="20"
                                height={b.h}
                                rx="5"
                                fill={i === 4 ? "#155EEF" : "#BFD6FF"}
                              />
                            ))}
                          </svg>
                        </div>
                        <div className="col-span-2 rounded-xl border border-line p-3">
                          <p className="text-[11px] font-semibold text-ink mb-2">Komposisi</p>
                          <div className="flex items-center gap-2.5">
                            <svg viewBox="0 0 64 64" className="w-14 h-14 shrink-0" aria-hidden="true">
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#EAF2FF" strokeWidth="11" />
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#155EEF" strokeWidth="11"
                                strokeDasharray="75 151" strokeLinecap="round" transform="rotate(-90 32 32)" />
                              <circle cx="32" cy="32" r="24" fill="none" stroke="#12B76A" strokeWidth="11"
                                strokeDasharray="38 151" strokeLinecap="round" strokeDashoffset="-75" transform="rotate(-90 32 32)" />
                            </svg>
                            <ul className="space-y-1.5 text-[11px] font-medium text-muted">
                              <li className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-brand" /> Honor 50%
                              </li>
                              <li className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-success-bright" /> Belanja 25%
                              </li>
                              <li className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#BFD6FF]" /> Lainnya
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Dokumen terbaru */}
                      <ul className="space-y-2">
                        {[
                          { label: "Kuitansi honorarium — Januari", status: "Selesai" },
                          { label: "SPPD perjalanan dinas", status: "Selesai" },
                          { label: "Daftar hadir mamin rapat", status: "Proses" },
                        ].map((row) => (
                          <li
                            key={row.label}
                            className="flex items-center justify-between gap-2 rounded-xl border border-line px-3 py-2"
                          >
                            <span className="text-xs font-medium text-ink truncate">{row.label}</span>
                            <span
                              className={`shrink-0 text-[11px] font-bold rounded-full px-2.5 py-0.5 ${
                                row.status === "Lengkap"
                                  ? "bg-[#E7F8EF] text-success-bright"
                                  : "bg-[#FEF4E2] text-[#B54708]"
                              }`}
                            >
                              {row.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-2 sm:-left-5 top-8 bg-white rounded-xl border border-line shadow-lg px-3.5 py-2.5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-brand-soft flex items-center justify-center">
                    <span className="material-symbols-outlined text-brand text-lg">task_alt</span>
                  </span>
                  <span>
                    <span className="block text-xs font-bold text-ink">Dokumen selesai</span>
                    <span className="block text-[11px] text-muted">8 dari 18 template</span>
                  </span>
                </div>
              </Reveal>
            </div>

            {/* Banner fitur — bawah hero sesuai desain */}
            <div className="mt-12 md:mt-14 pt-8 border-t border-line grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
              {TRUST_ITEMS.map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-blue-600">{item.icon}</span>
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{item.title}</span>
                    <span className="block text-[13px] text-slate-600 dark:text-slate-300 mt-0.5">{item.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ C. STATISTIK ═══════════════ */}
        <section className="bg-white border-y border-line relative overflow-hidden" aria-label="Statistik aplikasi">
          <div className="absolute inset-0 lpbg-radial pointer-events-none" aria-hidden="true" />
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10 py-8 md:py-10">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-7">
              {STATS.map((stat, i) => (
                <Reveal
                  key={stat.label}
                  delay={i * 80}
                  className={`text-center lg:text-left lg:pl-8 ${i > 0 ? "lg:border-l lg:border-line" : ""} ${i === 0 ? "lg:pl-0" : ""}`}
                >
                  <dd className="font-display text-[30px] md:text-4xl font-bold text-navy tabular-nums mb-1">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </dd>
                  <dt className="text-[13px] md:text-sm text-muted leading-snug max-w-[190px] mx-auto lg:mx-0">
                    {stat.label}
                  </dt>
                </Reveal>
              ))}
            </dl>
          </div>
        </section>

        {/* ═══════════════ D. FITUR ═══════════════ */}
        <section id="fitur" className="py-16 md:py-24 scroll-mt-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[340px] h-[340px] lpbg-blob lpbg-blob-b bg-brand/10 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-10 left-0 w-[260px] h-[260px] lpbg-blob lpbg-blob-a bg-[#BFD6FF]/35 pointer-events-none" aria-hidden="true" />
          {/* Kolom dot di tepi kanan & kiri — layar lebar */}
          <div className="absolute inset-y-0 right-0 w-32 lpbg-dots opacity-40 pointer-events-none hidden xl:block [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-32 lpbg-dots opacity-40 pointer-events-none hidden xl:block [mask-image:linear-gradient(to_right,black,transparent)]" aria-hidden="true" />
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <p className="inline-block px-3.5 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-[0.12em] mb-4">
                Fitur Unggulan
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mb-3">
                Semua kebutuhan administrasi dalam satu tempat
              </h2>
              <p className="text-muted text-base leading-relaxed">
                Akses fitur yang membantu pekerjaan administrasi dan penyusunan laporan sekolah
                menjadi lebih terstruktur.
              </p>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 md:gap-5">
              {FEATURES.map((feature, i) => (
                <Reveal key={feature.title} delay={(i % 3) * 90}>
                  <article className="h-full bg-white rounded-2xl border border-line p-6 md:p-7 shadow-[0_1px_3px_rgba(16,42,86,0.05)] hover:shadow-[0_16px_40px_-16px_rgba(21,94,239,0.22)] hover:border-brand/30 hover:-translate-y-1 transition-all duration-300">
                    <span className="w-11 h-11 rounded-xl bg-brand-soft flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-brand text-2xl">{feature.icon}</span>
                    </span>
                    <h3 className="text-[17px] font-bold text-ink mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{feature.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ E. PANDUAN / ALUR ═══════════════ */}
        <section id="panduan" className="py-16 md:py-24 bg-white border-y border-line scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 lpbg-dots opacity-[0.25] [mask-image:radial-gradient(ellipse_70%_60%_at_20%_30%,black,transparent)] pointer-events-none" aria-hidden="true" />
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
              <Reveal className="lg:sticky lg:top-28">
                <p className="inline-block px-3.5 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-[0.12em] mb-4">
                  Panduan
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mb-3">
                  Dari BKU berantakan ke LPJ rapi
                </h2>
                <p className="text-muted text-base leading-relaxed mb-6">
                  Tiga langkah sederhana yang bisa diikuti bendahara mana pun, bahkan yang baru pertama
                  kali menyusun LPJ.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold text-white bg-navy hover:bg-brand transition-colors"
                >
                  Coba langkah pertama
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </Link>
              </Reveal>

              <ol className="space-y-4">
                {STEPS.map((step, i) => (
                  <Reveal key={step.no} delay={i * 90}>
                    <li className="flex gap-5 bg-canvas rounded-2xl border border-line p-6">
                      <span className="font-display text-sm font-bold text-brand bg-brand-soft rounded-lg px-2.5 py-1.5 h-fit shrink-0">
                        {step.no}
                      </span>
                      <div>
                        <h3 className="text-[17px] font-bold text-ink mb-1.5 flex items-center gap-2">
                          <span className="material-symbols-outlined text-brand text-xl">{step.icon}</span>
                          {step.title}
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ═══════════════ F. TEMPLATE ═══════════════ */}
        <section id="template" className="py-16 md:py-24 scroll-mt-20 relative overflow-hidden">
          <div className="absolute top-1/3 -left-20 w-[300px] h-[300px] lpbg-blob lpbg-blob-b bg-brand/10 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-[260px] h-[260px] lpbg-blob lpbg-blob-c bg-success-bright/8 pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-y-0 left-0 w-36 lp-batik pointer-events-none hidden xl:block [mask-image:linear-gradient(to_right,black,transparent)]" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-36 lp-batik-rev pointer-events-none hidden xl:block [mask-image:linear-gradient(to_left,black,transparent)]" aria-hidden="true" />
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10">
            <Reveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div className="max-w-xl">
                <p className="inline-block px-3.5 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-[0.12em] mb-4">
                  Template Dokumen
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mb-3">
                  Semua template LPJ siap cetak
                </h2>
                <p className="text-muted text-base leading-relaxed">
                  Setiap template mengikuti format administrasi BOS/BOSP dan terisi otomatis dari data Anda.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover transition-colors shrink-0"
              >
                Lihat semua di aplikasi
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </Reveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {TEMPLATES.map((tpl, i) => (
                <Reveal key={tpl.title} delay={(i % 3) * 90}>
                  <article className="h-full bg-white rounded-2xl border border-line p-6 hover:shadow-[0_16px_40px_-16px_rgba(16,42,86,0.18)] hover:border-brand/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <span className="w-11 h-11 rounded-xl bg-canvas border border-line flex items-center justify-center">
                        <span className="material-symbols-outlined text-navy text-2xl">{tpl.icon}</span>
                      </span>
                      <span className="text-[11px] font-bold text-brand bg-brand-soft rounded-full px-2.5 py-1">
                        {tpl.count}
                      </span>
                    </div>
                    <h3 className="text-[16px] font-bold text-ink mb-1">{tpl.title}</h3>
                    <p className="text-sm text-muted">{tpl.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ G. TENTANG ═══════════════ */}
        <section id="tentang" className="py-16 md:py-24 bg-white border-y border-line scroll-mt-20 relative overflow-hidden">
          <div className="absolute inset-0 lpbg-radial pointer-events-none" aria-hidden="true" />
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10">
            <Reveal className="text-center max-w-2xl mx-auto mb-12">
              <p className="inline-block px-3.5 py-1.5 rounded-full bg-brand-soft text-brand text-xs font-bold uppercase tracking-[0.12em] mb-4">
                Tentang Kami
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mb-3">
                Kenapa sekolah memilih kami?
              </h2>
              <p className="text-muted text-base leading-relaxed">
                Dikembangkan oleh operator sekolah, untuk operator sekolah di seluruh Indonesia.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-4 md:gap-5 mb-10">
              {WHY_US.map((item, i) => (
                <Reveal key={item.title} delay={i * 90}>
                  <article className="h-full bg-canvas rounded-2xl border border-line p-7">
                    <span className="w-11 h-11 rounded-xl bg-white border border-line flex items-center justify-center mb-5 shadow-sm">
                      <span className="material-symbols-outlined text-brand text-2xl">{item.icon}</span>
                    </span>
                    <h3 className="text-[17px] font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <figure className="bg-canvas rounded-2xl border border-line px-6 py-10 md:p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 lp-batik opacity-60 pointer-events-none" aria-hidden="true" />
                <blockquote className="relative font-display text-xl md:text-2xl font-medium text-navy leading-relaxed max-w-3xl mx-auto mb-6">
                  “Setiap sekolah berhak mendapatkan alat terbaik untuk mengelola keuangan secara{" "}
                  <span className="text-brand font-bold">transparan dan profesional</span>.”
                </blockquote>
                <figcaption className="relative flex items-center justify-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-navy flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg">verified</span>
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-bold text-ink">Tim Pengembang</span>
                    <span className="block text-xs text-muted">LPJ BOS/BOSP Indonesia</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </section>

        {/* ═══════════════ H. CTA ═══════════════ */}
        <section className="py-16 md:py-24">
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-12 md:p-16 text-center">
                <div className="absolute inset-0 lp-batik-light pointer-events-none" aria-hidden="true" />
                <div className="absolute inset-0 lpbg-wash opacity-40 pointer-events-none" aria-hidden="true" />
                <div className="absolute -top-20 -left-16 w-64 h-64 lpbg-blob bg-brand/25 pointer-events-none" aria-hidden="true" />
                <div className="absolute -bottom-24 -right-20 w-72 h-72 lpbg-blob lpbg-blob-b bg-[#60A5FA]/20 pointer-events-none" aria-hidden="true" />
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-brand/30 blur-3xl pointer-events-none" aria-hidden="true" />
                <div className="relative">
                  <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight text-white mb-4">
                    Siap mengelola administrasi sekolah dengan lebih praktis?
                  </h2>
                  <p className="text-slate-100 text-base max-w-lg mx-auto mb-8 leading-relaxed">
                    Mulai gunakan LPJ BOS/BOSP untuk mengakses fitur administrasi yang tersedia
                    dalam aplikasi.
                  </p>
                  <div className="flex justify-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[12px] text-[15px] font-bold text-navy bg-white hover:bg-brand-soft shadow-xl transition-all min-h-[52px]"
                    >
                      Mulai Sekarang
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ═══════════════ I. FOOTER ═══════════════ */}
      <footer id="kontak" className="bg-white border-t border-line scroll-mt-20">
        <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10 py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-brand to-navy flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    school
                  </span>
                </span>
                <span className="text-[15px] font-bold text-ink">LPJ BOS/BOSP</span>
              </div>
              <p className="text-sm text-muted leading-relaxed max-w-xs mb-5">
                Aplikasi administrasi keuangan sekolah untuk mengelola dokumen BOS/BOSP,
                menyusun laporan, dan mencetak LPJ.
              </p>
            </div>

            <nav aria-label="Navigasi footer">
              <p className="text-xs font-bold text-ink uppercase tracking-[0.12em] mb-4">Navigasi</p>
              <ul className="space-y-2.5">
                {NAV_LINKS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="text-sm text-muted hover:text-brand transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <p className="text-xs font-bold text-ink uppercase tracking-[0.12em] mb-4">Fitur</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Dokumen LPJ", href: "#template" },
                  { label: "Template Dokumen", href: "#template" },
                  { label: "Panduan Penggunaan", href: "#panduan" },
                  { label: "Tentang Aplikasi", href: "#tentang" },
                ].map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-sm text-muted hover:text-brand transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-ink uppercase tracking-[0.12em] mb-4">Mulai</p>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/login" className="text-sm text-muted hover:text-brand transition-colors">
                    Masuk ke Aplikasi
                  </Link>
                </li>
                <li>
                  <Link to="/pratinjau" className="text-sm text-muted hover:text-brand transition-colors">
                    Pratinjau Tampilan
                  </Link>
                </li>
              </ul>
              <p className="mt-5 text-xs text-muted leading-relaxed">
                Data aplikasi tersimpan di perangkat Anda (localStorage) — tidak dikirim ke server.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="w-full max-w-[1280px] xl:max-w-[1440px] 2xl:max-w-[1580px] mx-auto px-5 md:px-8 xl:px-10 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted">© {new Date().getFullYear()} LPJ BOS/BOSP. Seluruh hak cipta.</p>
            <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                Dibuat dengan
                <span className="material-symbols-outlined text-red-400 text-sm">favorite</span>
                untuk sekolah Indonesia
              </span>
              <a
                href="https://www.freepik.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-300 hover:text-brand transition-colors"
              >
                Motif ornamen oleh GarryKillian / Freepik
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
        className={`fixed bottom-6 right-6 w-11 h-11 bg-brand text-white rounded-full shadow-lg shadow-brand/30 flex items-center justify-center transition-all duration-300 z-50 hover:bg-brand-hover ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-lg">arrow_upward</span>
      </button>
    </div>
  );
}
