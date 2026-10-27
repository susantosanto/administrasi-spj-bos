/**
 * Landing Page — LPJ BOS/BOSP
 * Professional Minimalism + Modern SaaS + Subtle Sundanese Cultural Identity
 * Desktop-first. No mobile-specific layout.
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, Fragment } from "react";
import ThemeToggle from "../components/ui/ThemeToggle";
import { useTheme } from "../contexts/ThemeContext";

function ThemeToggleLanding({ variant }) {
  try {
    return <ThemeToggle variant={variant} />;
  } catch {
    return null;
  }
}

function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function getPalette(isDark) {
  if (isDark) {
    return {
      primary: "#60A5FA",
      primaryHover: "#3B82F6",
      bg: "#0F172A",
      surface: "#1E293B",
      heading: "#F1F5F9",
      body: "#CBD5E1",
      muted: "#94A3B8",
      border: "#334155",
      softBlue: "#1E3A5F",
      success: "#34D399",
    };
  }
  return {
    primary: "#2457A7",
    primaryHover: "#1D4688",
    bg: "#F3F5F9",
    surface: "#FFFFFF",
    heading: "#1D2939",
    body: "#52627A",
    muted: "#66758A",
    border: "#E1E7EF",
    softBlue: "#EAF1FB",
    success: "#16835D",
  };
}

const FEATURES = [
  {
    icon: "upload_file",
    title: "Upload BKU",
    desc: "Upload file Excel BKU dari ARKAS dan data akan langsung terparse otomatis.",
  },
  {
    icon: "auto_awesome",
    title: "Generate Foto Dokumentasi",
    desc: "Upload foto personel & ruangan sekali, generate foto dokumentasi AI berulang kali. Pilih pakaian, suasana, dan peserta.",
  },
  {
    icon: "print",
    title: "Cetak Otomatis",
    desc: "Generate dokumen LPJ hanya dengan satu klik. Format A4 profesional.",
  },
  {
    icon: "description",
    title: "13 Template",
    desc: "Tersedia 13 template dokumen siap pakai untuk berbagai keperluan.",
  },
  {
    icon: "school",
    title: "Data Sekolah",
    desc: "Upload profil sekolah dari file Dapodik secara otomatis.",
  },
  {
    icon: "groups",
    title: "Data Guru & Tendik",
    desc: "Import data guru dan tenaga kependidikan dari Dapodik.",
  },
  {
    icon: "edit_note",
    title: "Catatan Penting",
    desc: "Simpan catatan terkait BOS dengan kategori dan fitur pin.",
  },
];

const VALUES = [
  { icon: "verified_user", label: "Aman & Terpercaya" },
  { icon: "touch_app", label: "Mudah Digunakan" },
  { icon: "gavel", label: "Sesuai Regulasi" },
];

function DashboardMockup({ palette: P, isDark }) {
  // Warna label "pekat" di dark mode — sidebar & header tabel mockup ber-bg terang tetap (#FAFBFD),
  // jadi muted versi gelap (#94A3B8) terlihat pudar di atasnya
  const labelSolid = isDark ? "#33415C" : P.muted;
  // Auto-cycling demo content (visual only, dummy data)
  const MENU = [
    {
      label: "Beranda",
      stats: [["Total Dana", "Rp 125.000.000", P.primary], ["Realisasi", "Rp 87.500.000", P.success], ["Sisa Dana", "Rp 37.500.000", P.warning]],
      rows: [["Honor Guru", "12 Jul 2026", "Selesai", P.success], ["Transport", "10 Jul 2026", "Proses", P.warning], ["Mamin", "08 Jul 2026", "Selesai", P.success]],
    },
    {
      label: "Data Sekolah",
      stats: [["Profil", "Terisi", P.success], ["Logo", "Terisi", P.success], ["Pejabat", "3 Jabatan", P.primary]],
      rows: [["Profil Sekolah", "12 Jul 2026", "Terisi", P.success], ["Logo Sekolah", "10 Jul 2026", "Terisi", P.success], ["Data Pejabat", "08 Jul 2026", "Perlu Cek", P.warning]],
    },
    {
      label: "Data Guru",
      stats: [["Guru", "24 Orang", P.primary], ["Tendik", "6 Orang", P.primary], ["Aktif", "Seluruhnya", P.success]],
      rows: [["Budi Santoso", "S-1 Pendidikan", "Aktif", P.success], ["Siti Aminah", "S-1 Ekonomi", "Aktif", P.success], ["Agus Wijaya", "S-1 Teknik", "Aktif", P.success]],
    },
    {
      label: "Dokumen LPJ",
      stats: [["Total Dokumen", "12 Dokumen", P.primary], ["Selesai", "8 Dokumen", P.success], ["Draft", "4 Dokumen", P.warning]],
      rows: [["LPJ Honor Guru", "12 Jul 2026", "Selesai", P.success], ["LPJ Transport", "10 Jul 2026", "Proses", P.warning], ["LPJ Mamin", "08 Jul 2026", "Selesai", P.success]],
    },
    {
      label: "BKU",
      stats: [["Saldo", "Rp 37.500.000", P.primary], ["Transaksi", "46 Entri", P.primary], ["Belum Cek", "2 Entri", P.warning]],
      rows: [["Kwitansi #0012", "12 Jul 2026", "Cek OK", P.success], ["Nota #0087", "10 Jul 2026", "Cek OK", P.success], ["SPJ #0034", "08 Jul 2026", "Ditindak", P.warning]],
    },
    {
      label: "Pengaturan",
      stats: [["Tampilan", "Light / Dark", P.primary], ["Notifikasi", "Aktif", P.success], ["Penyimpanan", "Lokal", P.success]],
      rows: [["Preferensi Tema", "Terapkan", "Aktif", P.success], ["Backup Data", "Ekspor", "Aktif", P.success], ["Info Aplikasi", "v1.0", "Normal", P.success]],
    },
  ];

  const [active, setActive] = useState(0);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion) return;
    const t = setInterval(() => setActive((a) => (a + 1) % MENU.length), 3500);
    return () => clearInterval(t);
  }, [reducedMotion]);

  const view = MENU[active];

  return (
    <div
      className="relative rounded-2xl border overflow-hidden"
      style={{
        borderColor: P.border,
        backgroundColor: P.surface,
        boxShadow: "0 20px 50px -20px rgba(36,87,167,0.18)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: P.border, backgroundColor: P.softBlue }}
      >
        <div className="flex items-center gap-2">
          <img src="/asik-logo.png" alt="Asik" className="h-4 w-auto" draggable="false" />
          <span className="text-xs font-semibold" style={{ color: P.heading }}>Aplikasi Sistem Keuangan</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: P.muted }}>Operator Sekolah</span>
          <div className="w-7 h-7 rounded-full" style={{ backgroundColor: P.softBlue }} />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className="w-40 shrink-0 border-r p-3 space-y-1 hidden md:block"
          style={{ borderColor: P.border, backgroundColor: "#FAFBFD" }}
        >
          {MENU.map((item, i) => (
            <div
              key={item.label}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300"
              style={{
                backgroundColor: i === active ? P.softBlue : "transparent",
                color: i === active ? P.primary : labelSolid,
                transform: i === active ? "translateX(2px)" : "translateX(0)",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content — switches with active menu */}
        <div key={active} className="flex-1 p-4 space-y-4 animate-view-switch">
          <div>
            <p className="text-xs font-medium" style={{ color: P.muted }}>Selamat datang,</p>
            <p className="text-sm font-semibold" style={{ color: P.heading }}>Operator Sekolah</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {view.stats.map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-xl border p-3"
                style={{ borderColor: P.border, backgroundColor: P.surface }}
              >
                <p className="text-[10px] font-medium" style={{ color: P.muted }}>{label}</p>
                <p className="text-xs font-bold mt-1" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
            <div
              className="grid grid-cols-3 text-[10px] font-semibold px-3 py-2 border-b"
              style={{ borderColor: P.border, backgroundColor: "#FAFBFD", color: labelSolid }}
            >
              <span>{view.label}</span>
              <span>Detail</span>
              <span>Status</span>
            </div>
            {view.rows.map(([doc, detail, status, color]) => (
              <div
                key={doc}
                className="grid grid-cols-3 text-[11px] px-3 py-2 border-b last:border-b-0"
                style={{ borderColor: P.border, color: P.body }}
              >
                <span className="font-medium" style={{ color: P.heading }}>{doc}</span>
                <span>{detail}</span>
                <span className="font-medium" style={{ color }}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { isDark } = useTheme();
  const P = getPalette(isDark);
  const heroRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  // Dock = penanda bawah layar pertama. Dua syarat tampil:
  //  1. masih di layar pertama — begitu digeser, dock disembunyikan supaya tidak
  //     menutupi kartu/teks section berikutnya (fixed overlay selalu menempel
  //     di bawah viewport, jadi section mana pun yang lewat bisa tertutup);
  //  2. ada ruang kosong di bawah konten hero — di viewport pendek dock disembunyikan
  //     daripada menimpa mockup.
  const [atFirstScreen, setAtFirstScreen] = useState(true);
  const [dockFits, setDockFits] = useState(true);
  const dockVisible = atFirstScreen && dockFits;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      setAtFirstScreen(window.scrollY < 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ukur ulang saat resize & setelah font siap (tinggi teks hero ikut berubah)
  useEffect(() => {
    const measure = () => {
      const grid = heroRef.current?.querySelector(".grid");
      if (!grid) return;
      const gridBottom = grid.getBoundingClientRect().bottom + window.scrollY;
      setDockFits(gridBottom <= window.innerHeight - 64);
    };
    measure();
    window.addEventListener("resize", measure);
    document.fonts?.ready?.then(measure).catch(() => {});
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ backgroundColor: P.bg, color: P.body }}
    >
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header
        className="fixed top-0 w-full z-50 transition-all duration-200"
        style={{
backgroundColor: scrolled
            ? isDark
              ? "rgba(30,41,59,0.92)"
              : "rgba(255,255,255,0.92)"
            : P.surface,
          borderBottom: `1px solid ${P.border}`,
          backdropFilter: scrolled ? "blur(8px)" : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/asik-logo.png" alt="Asik" className="h-8 w-auto" draggable="false" />
            <span className="text-base font-bold" style={{ color: P.heading }}>
              Aplikasi Sistem Keuangan
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {[
              { label: "Beranda", href: "#" },
              { label: "Fitur", href: "#fitur" },
              { label: "Tentang", href: "#tentang" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: P.body }}
              >
                {item.label}
              </a>
            ))}
            <ThemeToggleLanding />
            <Link
              to="/login"
              className="text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: P.primary, color: "#ffffff" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = P.primaryHover)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = P.primary)}
            >
              Mulai Sekarang
            </Link>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleLanding variant="icon" />
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden flex items-center min-h-[calc(100vh-64px)]"
          style={{ backgroundColor: P.bg }}
        >
          {/* Batik motif — subtle accent + drift lembut dari atas ke bawah
              (elemen melebar 360px ke atas & bawah; geser tepat 1 tile → loop mulus) */}
          <div
            className="absolute inset-x-0 -inset-y-[360px] pointer-events-none animate-batik-drift"
            style={{
              backgroundImage: "url('/floral-pattern.jpg')",
              backgroundSize: "360px 360px",
              backgroundRepeat: "repeat",
              opacity: isDark ? 0.07 : 0.3,
              mixBlendMode: isDark ? "normal" : "multiply",
            }}
          />
          {/* Mesh gradient — blue (top-left) & purple (bottom-right), very subtle */}
          <div
            className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(36,87,167,0.12) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)" }}
          />

          <div className="max-w-[1280px] mx-auto px-6 py-16 lg:py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left column */}
              <div>
                <span
                  className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 animate-fade-up"
                  style={{ backgroundColor: P.softBlue, color: P.primary, animationDelay: "0s" }}
                >
                  Sistem Informasi LPJ BOS/BOSP
                </span>

                <h1
                  className="text-[44px] lg:text-[52px] font-bold leading-tight mb-5 animate-fade-up"
                  style={{ color: P.heading, letterSpacing: "-0.02em", animationDelay: "0.1s" }}
                >
                  <span className="text-shimmer" style={{ color: P.primary, animationDelay: "1.6s" }}>Sampurasun!</span>
                  <br />
                  Selamat Datang di{" "}
                  <span className="text-shimmer" style={{ color: P.primary, animationDelay: "2.4s" }}>
                    Aplikasi Sistem Keuangan
                  </span>
                </h1>

                <p
                  className="text-base lg:text-lg leading-relaxed mb-7 max-w-xl animate-fade-up"
                  style={{ color: P.body, animationDelay: "0.2s" }}
                >
                  Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan.
                  Kelola dokumen dan laporan BOS/BOSP secara lebih tertib dan profesional.
                </p>

                <div className="flex flex-wrap gap-3 mb-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <Link
                    to="/login"
                    className="text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
                    style={{ backgroundColor: P.primary, color: "#ffffff" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = P.primaryHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = P.primary)}
                  >
                    Mulai Sekarang
                  </Link>
                  <a
                    href="#fitur"
                    className="text-sm font-semibold px-6 py-3 rounded-lg border transition-colors"
                    style={{ borderColor: P.border, color: P.primary, backgroundColor: P.surface }}
                  >
                    Lihat Fitur
                  </a>
                </div>
              </div>

              {/* Right column — dashboard mockup */}
              <Reveal delay={200}>
                <div className="animate-float-soft">
                  <DashboardMockup palette={P} isDark={isDark} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section id="fitur" className="py-16 lg:py-20 scroll-mt-20" style={{ backgroundColor: P.surface }}>
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <h2
                className="text-[28px] lg:text-[32px] font-bold mb-3"
                style={{ color: P.heading, letterSpacing: "-0.01em" }}
              >
                Semua yang Anda Butuhkan dalam{" "}
                <span className="text-shimmer" style={{ color: P.primary, animationDelay: "3s" }}>
                  Satu Aplikasi
                </span>
              </h2>
              <p className="text-base leading-relaxed" style={{ color: P.body }}>
                Dirancang untuk membantu sekolah mengelola dokumen dan laporan pertanggungjawaban
                dana BOS/BOSP secara lebih tertib, efisien, dan mudah ditelusuri.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 120} className="h-full">
                  <div
                    className="group h-full rounded-xl border p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                    style={{ borderColor: P.border, backgroundColor: P.bg }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: P.softBlue }}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ color: P.primary, fontVariationSettings: "'FILL' 1" }}
                      >
                        {f.icon}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: P.heading }}>
                      {f.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: P.body }}>
                      {f.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── KENAPA MEMILIH KAMI ( Tentang ) ──────────────────────────── */}
        <section id="tentang" className="py-14 lg:py-16 scroll-mt-20" style={{ backgroundColor: P.bg }}>
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-10">
              <h2
                className="text-[28px] lg:text-[32px] font-bold mb-3"
                style={{ color: P.heading, letterSpacing: "-0.01em" }}
              >
                Kenapa Memilih Kami?
              </h2>
              <p className="text-base leading-relaxed" style={{ color: P.body }}>
                Aplikasi ini dibangun dari kebutuhan nyata sekolah, bukan sekadar tampilan.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  icon: "psychology",
                  title: "Dirancang untuk Operator",
                  desc: "Dibuat oleh operator sekolah yang memahami kebutuhan nyata.",
                },
                {
                  icon: "auto_fix_high",
                  title: "Otomatis & Cerdas",
                  desc: "Sistem otomatis mengenali pola transaksi secara akurat.",
                },
                {
                  icon: "shield",
                  title: "Keamanan Terjamin",
                  desc: "Semua data disimpan lokal di perangkat Anda.",
                },
              ].map((item, i) => (
                <Reveal key={item.title} delay={i * 120}>
                  <div
                    className="rounded-xl border p-6 h-full"
                    style={{ borderColor: P.border, backgroundColor: P.surface }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: P.softBlue }}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ color: P.primary, fontVariationSettings: "'FILL' 1" }}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold mb-2" style={{ color: P.heading }}>
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: P.body }}>
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <section className="py-14" style={{ backgroundColor: P.bg }}>
          <div className="max-w-[1280px] mx-auto px-6">
            <div
              className="rounded-2xl border p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6"
              style={{ borderColor: P.border, backgroundColor: P.surface }}
            >
              <div>
                <h2 className="text-xl lg:text-2xl font-bold mb-2" style={{ color: P.heading }}>
                  Siap Mendigitalisasi Keuangan Sekolah?
                </h2>
                <p className="text-sm" style={{ color: P.body }}>
                  Mulai sekarang dan rasakan kemudahan dalam mengelola laporan pertanggungjawaban BOS/BOSP.
                </p>
              </div>
              <Link
                to="/login"
                className="shrink-0 text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: P.primary, color: "#ffffff" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = P.primaryHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = P.primary)}
              >
                Mulai Sekarang
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── FLOATING DOCK — nilai utama (tengah bawah, ikut batas layar pertama) ── */}
      <div
        className={`fixed inset-x-0 bottom-3 sm:bottom-5 z-40 flex justify-center pointer-events-none transition-opacity duration-300 ${dockVisible ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className={`${dockVisible ? "pointer-events-auto" : "pointer-events-none"} animate-fade-up`}
          style={{ animationDelay: "0.6s" }}
        >
          <div
            className="flex items-center p-1 sm:p-1.5 rounded-2xl sm:rounded-full border"
            style={{
              borderColor: P.border,
              backgroundColor: isDark ? "rgba(30,41,59,0.85)" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              boxShadow: "0 10px 30px -12px rgba(36,87,167,0.28)",
            }}
          >
            {VALUES.map((v, i) => (
              <Fragment key={v.label}>
                {i > 0 && (
                  <span
                    className="hidden sm:block w-px h-5"
                    style={{ backgroundColor: P.border }}
                  />
                )}
                <div
                  className="flex items-center gap-1.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = P.softBlue)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  title={v.label}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: P.primary, fontSize: "16px", fontVariationSettings: "'FILL' 1" }}
                  >
                    {v.icon}
                  </span>
                  <span className="hidden sm:inline text-xs font-medium whitespace-nowrap" style={{ color: P.body }}>
                    {v.label}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-10 pb-28"
        style={{ borderColor: P.border, backgroundColor: P.surface }}
        id="kontak"
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img src="/asik-logo.png" alt="Asik" className="h-7 w-auto" draggable="false" />
              <span className="text-sm font-bold" style={{ color: P.heading }}>
                Aplikasi Sistem Keuangan
              </span>
            </div>
            <p className="text-xs" style={{ color: P.muted }}>
              © {new Date().getFullYear()} Aplikasi Sistem Keuangan. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
