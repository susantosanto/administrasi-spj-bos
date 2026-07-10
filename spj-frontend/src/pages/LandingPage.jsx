/**
 * Landing Page — Original White & Blue Design
 */
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCounter({ end, duration = 2500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useState(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [isVisible]);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easedProgress = easeOutQuart(progress);
      setCount(Math.floor(easedProgress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);
  
  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPING ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function TypingText({ texts, speed = 80, deleteSpeed = 40, pauseTime = 2000 }) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    const currentText = texts[textIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        
        if (charIndex === currentText.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        
        if (charIndex === 0) {
          setIsDeleting(false);
          setTextIndex(prev => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deleteSpeed : speed);
    
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, deleteSpeed, pauseTime]);
  
  return (
    <span className="text-primary font-semibold">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
        }
      },
      { threshold: 0.1 }
    );
    const el = document.getElementById(`feature-${index}`);
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [index]);

  return (
    <div
      id={`feature-${index}`}
      className={`group relative bg-white p-8 rounded-3xl border border-slate-200 
                  shadow-lg hover:shadow-2xl hover:-translate-y-2 
                  transition-all duration-500 ease-out overflow-hidden
                  ${feature.isLarge ? 'md:col-span-2' : ''}
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className={`absolute top-0 right-0 w-40 h-40 ${feature.glowColor} rounded-bl-full opacity-50 group-hover:scale-150 transition-transform duration-700`} />
      
      <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 
                      group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
        <span className={`material-symbols-outlined text-3xl ${feature.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {feature.icon}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
        {feature.title}
      </h3>
      <p className="text-slate-500 leading-relaxed mb-6">
        {feature.desc}
      </p>

      <div className="flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
        <span>Pelajari Selengkapnya</span>
        <span className="material-symbols-outlined text-lg">arrow_forward</span>
      </div>

      {feature.isLarge && feature.extra && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          {feature.extra}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
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

const TYPING_TEXTS = [
  'Upload BKU',
  'Cetak LPJ',
  'Kelola Data',
  'Generate Laporan',
];

const STATS = [
  { number: 13, suffix: '+', label: 'Template Dokumen', icon: 'description', color: 'text-blue-600' },
  { number: 85, suffix: '%', label: 'Lebih Efisien', icon: 'speed', color: 'text-emerald-600' },
  { number: 100, suffix: '%', label: 'Uptime Server', icon: 'cloud_done', color: 'text-violet-600' },
  { number: 24, suffix: '/7', label: 'Akses Kapan Saja', icon: 'schedule', color: 'text-amber-600' },
];

const WHY_US = [
  { 
    icon: 'psychology', 
    title: 'Dirancang untuk Operator',
    desc: 'Dibuat oleh operator sekolah yang memahami kebutuhan nyata dalam pengelolaan dana BOS/BOSP.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    icon: 'auto_fix_high', 
    title: 'Otomatis & Cerdas',
    desc: 'Sistem otomatis mengenali pola transaksi dan mengelompokkannya secara akurat.',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600'
  },
  { 
    icon: 'shield', 
    title: 'Keamanan Terjamin',
    desc: 'Semua data disimpan lokal di perangkat Anda. Tidak ada data yang dikirim ke server.',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600'
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP APP BAR                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50 
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <span className="text-lg font-bold text-primary">LPJ BOS/BOSP</span>
          </Link>
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
              className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Mulai Sekarang
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[700px] flex items-center overflow-hidden px-6">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(0, 74, 198, 0.05), transparent), radial-gradient(circle at bottom left, rgba(0, 108, 74, 0.05), transparent)",
            }}
          />
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-center md:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                <span className="material-symbols-outlined text-primary text-lg">verified</span>
                <span className="text-primary text-sm font-semibold">Resmi & Terpercaya</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Sampurasun!
                <br />
                <span className="text-primary">Selamat Datang di Aplikasi LPJ BOS/BOSP</span>
              </h1>
              <div className="text-lg text-slate-600 h-8">
                <span className="text-slate-500">Mulai dari </span>
                <TypingText texts={TYPING_TEXTS} />
              </div>
              <p className="text-lg text-slate-600 max-w-xl">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan.
                Kelola dana BOS/BOSP dengan standar profesionalisme tinggi dalam satu platform terpadu.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                <Link
                  to="/login"
                  className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Mulai Sekarang
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <a
                  href="#fitur"
                  className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold border-2 border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Lihat Fitur
                </a>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
              <div className="bg-white p-4 rounded-[2rem] shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-700 border border-slate-200">
                <div className="rounded-[1.5rem] w-full aspect-video bg-gradient-to-br from-primary/20 to-blue-100 flex items-center justify-center">
                  <div className="text-center p-8">
                    <span className="material-symbols-outlined text-primary text-7xl mb-4 block">account_balance_wallet</span>
                    <p className="text-primary font-bold text-xl">Dashboard LPJ BOS/BOSP</p>
                    <p className="text-slate-500 text-sm mt-2">Administrasi Keuangan Sekolah</p>
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
        {/* STATS SECTION                                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-white border-y border-slate-100">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className={`w-14 h-14 ${stat.iconBg || 'bg-primary/10'} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <p className="text-slate-500 text-sm uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto">
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

            {/* Mobile Horizontal Scroll */}
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
              <div className="flex gap-4 w-max">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="w-[300px] snap-center">
                    <FeatureCard feature={feature} index={i} />
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={i} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WHY US SECTION                                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="tentang" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
                Tentang Kami
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Kenapa Memilih Kami?
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Dikembangkan oleh operator sekolah, untuk operator sekolah.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {WHY_US.map((item, i) => (
                <div key={i} className="group bg-slate-50 rounded-3xl p-8 border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-16 h-16 ${item.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-3xl ${item.iconColor}`}>{item.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Mission Statement */}
            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-[2rem] p-12 text-center border border-primary/10">
              <span className="material-symbols-outlined text-5xl text-primary mb-6 block">format_quote</span>
              <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed max-w-4xl mx-auto mb-8">
                Kami percaya setiap sekolah berhak mendapatkan <span className="text-primary font-bold">alat terbaik</span> untuk mengelola keuangan dengan <span className="text-primary font-bold">transparan dan profesional</span>.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">verified</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 font-bold">Tim Pengembang</p>
                  <p className="text-slate-500 text-sm">LPJ BOS/BOSP Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-12 md:p-16 rounded-[2.5rem] text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }} />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                  Siap Mendigitalisasi<br />Keuangan Sekolah?
                </h2>
                <p className="text-white/80 max-w-xl mx-auto text-lg mb-10">
                  Mulai sekarang dan rasakan kemudahan dalam mengelola laporan pertanggungjawaban BOS/BOSP.
                </p>
                <Link
                  to="/login"
                  className="bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-slate-100 hover:shadow-2xl transition-all active:scale-95 inline-flex items-center gap-2"
                >
                  Mulai Sekarang
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
