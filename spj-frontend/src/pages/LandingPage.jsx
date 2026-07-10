/**
 * Landing Page — Ultra Premium White & Blue Design
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCounter({ end, duration = 2500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isVisible) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);
  
  useEffect(() => {
    if (!isVisible) return;
    let startTime;
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(easeOutQuart(progress) * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);
  
  return <span ref={ref} className="tabular-nums">{count}{suffix}</span>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM TYPING CARD — Clean White Design, Matches App Theme
// ═══════════════════════════════════════════════════════════════════════════════

function PremiumTypingCard() {
  const texts = [
    { text: 'Upload BKU dari ARKAS', icon: 'upload_file' },
    { text: 'Cetak LPJ Satu Klik', icon: 'print' },
    { text: 'Kelola Data Sekolah', icon: 'school' },
    { text: 'Generate 13 Template', icon: 'description' },
    { text: 'Import Data Guru', icon: 'groups' },
  ];
  
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  useEffect(() => {
    if (isPaused) {
      const pauseTimeout = setTimeout(() => setIsPaused(false), 2500);
      return () => clearTimeout(pauseTimeout);
    }
    
    const currentText = texts[textIndex].text;
    const speed = isDeleting ? 25 : 50;
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentText.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
        if (charIndex === currentText.length) {
          setIsPaused(true);
          setTimeout(() => setIsDeleting(true), 100);
        }
      } else {
        setDisplayText(currentText.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
        if (charIndex === 0) {
          setIsDeleting(false);
          setTextIndex(prev => (prev + 1) % texts.length);
        }
      }
    }, speed);
    
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, isPaused]);
  
  return (
    <div className="relative perspective-1000">
      {/* Background stack of documents - visible shadows */}
      <div className="absolute -bottom-5 -right-5 w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl rotate-3 shadow-xl" />
      <div className="absolute -bottom-2.5 -right-2.5 w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl rotate-2 shadow-lg" />
      
      {/* Main document card */}
      <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
        
        {/* Document header - soft premium gradient 2026 */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white/90 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  description
                </span>
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.2em]">Laporan Pertanggungjawaban</p>
                <p className="text-white font-bold text-sm">LPJ BOS/BOSP</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-xl">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/70 text-xs font-medium">Aktif</span>
            </div>
          </div>
        </div>
        
        {/* Document body */}
        <div className="p-6 md:p-8 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100/80 to-transparent rounded-bl-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/[0.03] to-transparent rounded-tr-[80px] pointer-events-none" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, slate-800 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          
          {/* Decorative accent */}
          <div className="relative flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-gradient-to-b from-slate-800 to-slate-300 rounded-full" />
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.15em]">Fitur Utama</p>
          </div>
          
          {/* Typing text */}
          <div className="min-h-[3rem] md:min-h-[4rem] mb-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 flex items-center">
              <span>{displayText}</span>
              <span className="w-[3px] h-6 md:h-8 bg-slate-800 ml-1 animate-pulse" />
            </h3>
          </div>
          
          {/* Document metadata */}
          <div className="flex items-center gap-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-xs">calendar_today</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">TA 2024/2025</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500 text-xs">schedule</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Update Real-time</span>
            </div>
          </div>
          
          {/* Content lines */}
          <div className="mt-6 space-y-2">
            <div className="h-1.5 w-full bg-slate-100 rounded-full" />
            <div className="h-1.5 w-4/5 bg-slate-100/80 rounded-full" />
            <div className="h-1.5 w-5/6 bg-slate-100/60 rounded-full" />
          </div>
        </div>
        
        {/* Document footer */}
        <div className="px-6 md:px-8 py-4 bg-slate-50/50 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {texts.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === textIndex ? 'w-7 bg-slate-800' : 'w-1.5 bg-slate-200'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Dokumen {textIndex + 1} dari {texts.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM FEATURE PILLS — Minimalist Animated Dots
// ═══════════════════════════════════════════════════════════════════════════════

function PremiumFeaturePills() {
  const features = [
    { icon: 'upload_file', label: 'Upload BKU' },
    { icon: 'print', label: 'Cetak LPJ' },
    { icon: 'school', label: 'Data Sekolah' },
    { icon: 'groups', label: 'Data Guru' },
    { icon: 'description', label: '13 Template' },
  ];
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {features.map((feature, i) => (
        <div 
          key={i}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-full border border-slate-200/80 shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 cursor-default group"
        >
          <span className="material-symbols-outlined text-primary/70 text-lg group-hover:text-primary transition-colors">
            {feature.icon}
          </span>
          <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 120);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
                  ${feature.isLarge ? 'md:col-span-2' : ''}`}
    >
      <div className="relative h-full bg-white rounded-3xl border border-slate-200/80 p-7 
                      shadow-[0_1px_3px_rgba(0,0,0,0.04)] 
                      hover:shadow-[0_20px_60px_-15px_rgba(0,74,198,0.12)] 
                      hover:border-primary/20
                      transition-all duration-500 overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-3xl`} />
        
        <div className={`relative w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center mb-5 
                        group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <span className={`material-symbols-outlined text-xl ${feature.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {feature.icon}
          </span>
        </div>

        <div className="relative">
          <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors duration-300">
            {feature.title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
        </div>

        <div className="absolute bottom-7 right-7 w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center 
                        opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300">
          <span className="material-symbols-outlined text-primary text-lg">arrow_forward</span>
        </div>

        {feature.isLarge && feature.extra && (
          <div className="relative mt-5 pt-4 border-t border-slate-100">{feature.extra}</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: 'upload_file', title: 'Upload BKU', desc: 'Upload file Excel BKU dari ARKAS dan data akan langsung terparse otomatis.',
    iconBg: 'bg-blue-50', iconColor: 'text-blue-600', gradient: 'from-blue-500 to-cyan-400', isLarge: true,
    extra: (
      <div className="flex flex-wrap gap-2">
        {['BOSP', 'Honor', 'Mamin', 'Pajak'].map(tag => (
          <span key={tag} className="px-3 py-1 bg-slate-100/80 text-slate-600 text-xs font-medium rounded-lg">{tag}</span>
        ))}
      </div>
    ),
  },
  {
    icon: 'print', title: 'Cetak Otomatis', desc: 'Generate dokumen LPJ hanya dengan satu klik. Format A4 profesional.',
    iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', gradient: 'from-emerald-500 to-teal-400', isLarge: false,
  },
  {
    icon: 'description', title: '13 Template', desc: 'Tersedia 13 template dokumen siap pakai untuk berbagai keperluan.',
    iconBg: 'bg-violet-50', iconColor: 'text-violet-600', gradient: 'from-violet-500 to-purple-400', isLarge: false,
  },
  {
    icon: 'school', title: 'Data Sekolah', desc: 'Upload profil sekolah dari file Dapodik secara otomatis.',
    iconBg: 'bg-amber-50', iconColor: 'text-amber-600', gradient: 'from-amber-500 to-orange-400', isLarge: false,
  },
  {
    icon: 'groups', title: 'Data Guru & Tendik', desc: 'Import data guru dan tenaga kependidikan dari Dapodik.',
    iconBg: 'bg-rose-50', iconColor: 'text-rose-600', gradient: 'from-rose-500 to-pink-400', isLarge: false,
  },
  {
    icon: 'edit_note', title: 'Catatan Penting', desc: 'Simpan catatan terkait BOS dengan kategori dan fitur pin.',
    iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', gradient: 'from-cyan-500 to-blue-400', isLarge: true,
    extra: (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {['bg-blue-400', 'bg-emerald-400', 'bg-amber-400', 'bg-violet-400'].map((color, i) => (
            <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white flex items-center justify-center`}>
              <span className="material-symbols-outlined text-white text-xs">{['folder', 'event', 'payments', 'push_pin'][i]}</span>
            </div>
          ))}
        </div>
        <span className="text-slate-500 text-xs">5 kategori tersedia</span>
      </div>
    ),
  },
];

const STATS = [
  { number: 13, suffix: '+', label: 'Template Dokumen', icon: 'description', color: 'text-blue-600', iconBg: 'bg-blue-50' },
  { number: 85, suffix: '%', label: 'Lebih Efisien', icon: 'speed', color: 'text-emerald-600', iconBg: 'bg-emerald-50' },
  { number: 100, suffix: '%', label: 'Uptime Server', icon: 'cloud_done', color: 'text-violet-600', iconBg: 'bg-violet-50' },
  { number: 24, suffix: '/7', label: 'Akses Kapan Saja', icon: 'schedule', color: 'text-amber-600', iconBg: 'bg-amber-50' },
];

const WHY_US = [
  { icon: 'psychology', title: 'Dirancang untuk Operator', desc: 'Dibuat oleh operator sekolah yang memahami kebutuhan nyata.', iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: 'auto_fix_high', title: 'Otomatis & Cerdas', desc: 'Sistem otomatis mengenali pola transaksi secara akurat.', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: 'shield', title: 'Keamanan Terjamin', desc: 'Semua data disimpan lokal di perangkat Anda.', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
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
      
      {/* TOP APP BAR */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <span className="text-lg font-bold text-primary">LPJ BOS/BOSP</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer text-sm" href="#fitur">Fitur</a>
            <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer text-sm" href="#tentang">Tentang</a>
            <a className="text-slate-600 font-medium hover:text-primary transition-colors cursor-pointer text-sm" href="#kontak">Kontak</a>
            <Link to="/login" className="bg-primary text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 text-sm">
              Mulai Sekarang
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-20">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-[750px] flex items-center overflow-hidden px-6">
          <div className="absolute inset-0" style={{ background: "radial-gradient(circle at top right, rgba(0, 74, 198, 0.04), transparent), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.03), transparent)" }} />
          
          <div className="container mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
                  <span className="material-symbols-outlined text-primary text-lg">verified</span>
                  <span className="text-primary text-sm font-semibold">Resmi & Terpercaya</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                  Sampurasun!
                  <br />
                  <span className="text-primary">Selamat Datang di Aplikasi LPJ BOS/BOSP</span>
                </h1>
                
                <p className="text-lg text-slate-600 max-w-xl mb-8">
                  Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan.
                  Kelola dana BOS/BOSP dengan standar profesionalisme tinggi.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link to="/login" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2">
                    Mulai Sekarang
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                  <a href="#fitur" className="bg-white text-primary px-8 py-4 rounded-2xl font-semibold border-2 border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined">play_circle</span>
                    Lihat Fitur
                  </a>
                </div>
              </div>
              
              {/* Right: PREMIUM TYPING CARD */}
              <div className="relative">
                <PremiumTypingCard />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PREMIUM FEATURE PILLS                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-10 px-6 bg-white border-y border-slate-100">
          <div className="container mx-auto">
            <PremiumFeaturePills />
          </div>
        </section>

        {/* STATS */}
        <section className="py-14 px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-xl ${stat.color}`}>{stat.icon}</span>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  </div>
                  <p className="text-slate-500 text-xs uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="fitur" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                Fitur Unggulan
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Fitur Unggulan Sistem</h2>
              <p className="text-base text-slate-500 max-w-xl mx-auto">Dirancang untuk memudahkan pekerjaan operator sekolah.</p>
            </div>
            <div className="md:hidden overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
              <div className="flex gap-4 w-max">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="w-[300px] snap-center"><FeatureCard feature={feature} index={i} /></div>
                ))}
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature, i) => (
                <FeatureCard key={i} feature={feature} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* WHY US */}
        <section id="tentang" className="py-20 px-6 bg-slate-50">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">Tentang Kami</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Kenapa Memilih Kami?</h2>
              <p className="text-base text-slate-500 max-w-xl mx-auto">Dikembangkan oleh operator sekolah, untuk operator sekolah.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {WHY_US.map((item, i) => (
                <div key={i} className="group bg-white rounded-2xl p-7 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-2xl ${item.iconColor}`}>{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm">
              <span className="material-symbols-outlined text-4xl text-primary/40 mb-4 block">format_quote</span>
              <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed max-w-3xl mx-auto mb-6">
                Kami percaya setiap sekolah berhak mendapatkan <span className="text-primary font-bold">alat terbaik</span> untuk mengelola keuangan dengan <span className="text-primary font-bold">transparan dan profesional</span>.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-lg">verified</span>
                </div>
                <div className="text-left">
                  <p className="text-slate-900 font-bold text-sm">Tim Pengembang</p>
                  <p className="text-slate-500 text-xs">LPJ BOS/BOSP Indonesia</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-white">
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-primary to-blue-600 p-10 md:p-14 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5">Siap Mendigitalisasi Keuangan Sekolah?</h2>
                <p className="text-white/75 max-w-lg mx-auto mb-8">Mulai sekarang dan rasakan kemudahan dalam mengelola laporan pertanggungjawaban BOS/BOSP.</p>
                <Link to="/login" className="bg-white text-primary px-8 py-3.5 rounded-xl font-bold shadow-lg hover:bg-slate-50 hover:shadow-xl transition-all active:scale-95 inline-flex items-center gap-2">
                  Mulai Sekarang <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER — Premium Elegant */}
      <footer className="bg-white border-t border-slate-100" id="kontak">
        {/* Main footer content */}
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                </div>
                <span className="text-xl font-bold text-slate-900">LPJ BOS/BOSP</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan untuk seluruh sekolah di Indonesia.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">Semua sistem berjalan normal</span>
              </div>
            </div>
            
            {/* Links */}
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Navigasi</p>
              <ul className="space-y-3">
                {['Fitur', 'Tentang', 'Kontak', 'Masuk'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Legal */}
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Legal</p>
              <ul className="space-y-3">
                {['Syarat & Ketentuan', 'Kebijakan Privasi', 'Kebijakan Cookie'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className="text-sm text-slate-500 hover:text-primary transition-colors duration-200">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-slate-100">
          <div className="container mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-slate-400">
                © {new Date().getFullYear()} LPJ BOS/BOSP Indonesia. All rights reserved.
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">Dibuat dengan</span>
                <span className="material-symbols-outlined text-red-400 text-sm">favorite</span>
                <span className="text-xs text-slate-400">untuk sekolah Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-11 h-11 bg-primary text-white rounded-full shadow-lg shadow-primary/25 flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-lg">arrow_upward</span>
      </button>
    </div>
  );
}
