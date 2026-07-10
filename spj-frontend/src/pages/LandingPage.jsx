/**
 * Landing Page — Premium Design 2026
 * With Stagger Reveal + Horizontal Scroll Features
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function FeatureCard({ feature, index, isLarge }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`group relative bg-white p-8 rounded-3xl border border-slate-200 
                  shadow-lg hover:shadow-2xl hover:-translate-y-2 
                  transition-all duration-500 ease-out overflow-hidden
                  ${isLarge ? 'md:col-span-2' : ''}
                  ${isVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-16'
                  }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Background Glow */}
      <div className={`absolute top-0 right-0 w-40 h-40 ${feature.glowColor} rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-700`} />
      
      {/* Icon */}
      <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 
                      group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
        <span className={`material-symbols-outlined text-3xl ${feature.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {feature.icon}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
        {feature.title}
      </h3>
      <p className="text-slate-500 leading-relaxed mb-6">
        {feature.desc}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <span>Pelajari Selengkapnya</span>
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </div>

      {/* Extra content for large cards */}
      {isLarge && feature.extra && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          {feature.extra}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES DATA
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: 'upload_file',
    title: 'Upload BKU',
    desc: 'Upload file Excel BKU dari ARKAS dan data akan langsung terparse otomatis. Deteksi transaksi cerdas untuk semua jenis pembayaran.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    glowColor: 'bg-blue-500',
    isLarge: true,
    extra: (
      <div className="flex flex-wrap gap-3">
        {['BOSP', 'Honor', 'Mamin', 'Pajak'].map(tag => (
          <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: 'print',
    title: 'Cetak Otomatis',
    desc: 'Generate dokumen LPJ hanya dengan satu klik. Format A4 profesional sesuai regulasi terbaru.',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    glowColor: 'bg-emerald-500',
    isLarge: false,
  },
  {
    icon: 'description',
    title: '13 Template',
    desc: 'Tersedia 13 template dokumen siap pakai: Honor, SPPD, Notulen, dan lainnya.',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    glowColor: 'bg-violet-500',
    isLarge: false,
  },
  {
    icon: 'school',
    title: 'Data Sekolah',
    desc: 'Upload profil sekolah dari file Dapodik. Otomatis mengisi data identitas dan pejabat.',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    glowColor: 'bg-amber-500',
    isLarge: false,
  },
  {
    icon: 'groups',
    title: 'Data Guru & Tendik',
    desc: 'Import data guru dan tenaga kependidikan dari Dapodik. Tabel lengkap dengan filter status.',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    glowColor: 'bg-rose-500',
    isLarge: false,
  },
  {
    icon: 'edit_note',
    title: 'Catatan Penting',
    desc: 'Simpan catatan terkait BOS dengan kategori, warna, dan fitur pin. Akses cepat kapan saja.',
    iconBg: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
    glowColor: 'bg-cyan-500',
    isLarge: true,
    extra: (
      <div className="flex items-center gap-4">
        <div className="flex -space-x-2">
          {['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400'].map((color, i) => (
            <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-sm">
                {['folder', 'event', 'payments', 'push_pin'][i]}
              </span>
            </div>
          ))}
        </div>
        <span className="text-slate-500 text-sm">5 kategori tersedia</span>
      </div>
    ),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP APP BAR                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <span className="text-lg font-bold text-slate-900">LPJ BOS/BOSP</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer" href="#fitur">
            Fitur
          </a>
          <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer" href="#tentang">
            Tentang
          </a>
          <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer" href="#kontak">
            Kontak
          </a>
          <Link
            to="/login"
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Mulai Sekarang
          </Link>
        </nav>
        <button className="md:hidden p-2 text-slate-600">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main className="pt-24">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[700px] flex items-center overflow-hidden px-6">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />

          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
                <span className="material-symbols-outlined text-emerald-400 text-lg">verified</span>
                <span className="text-white/80 text-sm font-medium">Resmi & Terpercaya</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                Sampurasun!
                <br />
                <span className="text-primary">Selamat Datang di Aplikasi LPJ BOS/BOSP</span>
              </h1>
              <p className="text-lg text-slate-400 max-w-xl">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan. 
                Kelola dana BOS/BOSP dengan standar profesionalisme tinggi dalam satu platform terpadu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Mulai Sekarang
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a
                  href="#fitur"
                  className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Lihat Fitur
                </a>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/30 rounded-full blur-[100px]" />
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]" />
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-700 border border-white/20">
                <div className="rounded-[1.5rem] w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="material-symbols-outlined text-primary text-7xl mb-4 block">account_balance_wallet</span>
                    <p className="text-white font-bold text-xl">Dashboard LPJ BOS/BOSP</p>
                    <p className="text-slate-400 text-sm mt-2">Administrasi Keuangan Sekolah</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-200">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-emerald-600">trending_up</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Efisiensi</p>
                    <p className="text-slate-900 font-bold">+85% Lebih Cepat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION — Stagger Reveal + Premium Cards                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
                Fitur Unggulan
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Fitur Unggulan Sistem
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Dirancang untuk memudahkan pekerjaan operator sekolah dalam menyusun laporan pertanggungjawaban yang akurat.
              </p>
            </div>

            {/* Horizontal Scroll Container (Mobile) */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
              <div className="flex gap-4 w-max">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="w-[300px] snap-center">
                    <FeatureCard feature={feature} index={i} isLarge={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Layout (Desktop) */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={i} feature={feature} index={i} isLarge={feature.isLarge} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ABOUT SECTION                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="tentang" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-[2.5rem] shadow-2xl w-full h-[400px] bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary text-8xl mb-4 block">school</span>
                    <p className="text-xl font-bold text-primary">Tim Operator Sekolah</p>
                    <p className="text-slate-500 mt-2">Profesional & Terpercaya</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full uppercase tracking-wider">
                  Tentang Kami
                </span>
                <h2 className="text-4xl font-bold text-slate-900">Tentang Platform Kami</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Dikembangkan atas inisiasi untuk digitalisasi birokrasi sekolah, LPJ BOS/BOSP hadir untuk menjawab tantangan administrasi keuangan yang seringkali membebani tenaga pendidik.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">support_agent</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Dukungan 24/7</h4>
                      <p className="text-slate-500 text-sm">Tim ahli siap membantu Anda kapan saja.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">update</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Update Berkala</h4>
                      <p className="text-slate-500 text-sm">Mengikuti regulasi terbaru.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6">
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-12 rounded-[3rem] text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Siap Mendigitalisasi Keuangan Sekolah?
                </h2>
                <p className="text-white/80 max-w-xl mx-auto text-lg mb-8">
                  Gabung bersama ribuan sekolah lainnya yang telah meningkatkan efisiensi pelaporan mereka.
                </p>
                <Link
                  to="/login"
                  className="bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-100 hover:shadow-2xl transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  Daftar Sekarang Gratis
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-white py-12 px-6" id="kontak">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white">school</span>
            </div>
            <span className="text-lg font-bold">LPJ BOS/BOSP</span>
          </div>
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} LPJ BOS/BOSP Indonesia. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#">Syarat & Ketentuan</a>
            <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}
