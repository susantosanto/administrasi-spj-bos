/**
 * Landing Page — Ultra Premium Design
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
// DOMINANT TYPING ANIMATION
// ═══════════════════════════════════════════════════════════════════════════════

function DominantTypingText() {
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
      const pauseTimeout = setTimeout(() => setIsPaused(false), 2000);
      return () => clearTimeout(pauseTimeout);
    }
    
    const currentText = texts[textIndex].text;
    const speed = isDeleting ? 30 : 60;
    
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
    <div className="relative">
      {/* Glowing background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-xl" />
      
      <div className="relative bg-white/80 backdrop-blur-xl border border-primary/10 rounded-3xl px-8 py-6 md:px-12 md:py-8 shadow-xl shadow-primary/5">
        <div className="flex items-center gap-4">
          {/* Animated icon */}
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 animate-pulse">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {texts[textIndex].icon}
            </span>
          </div>
          
          {/* Typing text */}
          <div className="flex-1">
            <p className="text-sm text-slate-500 font-medium mb-1">Mulai dari</p>
            <div className="text-2xl md:text-4xl font-bold text-slate-900 h-10 md:h-12 flex items-center">
              <span>{displayText}</span>
              <span className="w-0.5 h-6 md:h-8 bg-primary ml-1 animate-pulse" />
            </div>
          </div>
          
          {/* Dots indicator */}
          <div className="hidden md:flex flex-col gap-2">
            {texts.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === textIndex ? 'bg-primary w-6' : 'bg-slate-300'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM TICKER — Smooth Continuous Scroll
// ═══════════════════════════════════════════════════════════════════════════════

function PremiumTicker() {
  const items = [
    { icon: 'upload_file', text: 'Upload BKU', color: 'text-blue-600' },
    { icon: 'print', text: 'Cetak LPJ', color: 'text-emerald-600' },
    { icon: 'school', text: 'Data Sekolah', color: 'text-amber-600' },
    { icon: 'groups', text: 'Data Guru', color: 'text-rose-600' },
    { icon: 'description', text: '13 Template', color: 'text-violet-600' },
    { icon: 'edit_note', text: 'Catatan', color: 'text-cyan-600' },
    { icon: 'analytics', text: 'Realisasi', color: 'text-indigo-600' },
    { icon: 'folder', text: 'Arsip Digital', color: 'text-pink-600' },
  ];

  return (
    <div className="relative overflow-hidden bg-white border-y border-slate-100">
      <div className="py-5 flex animate-ticker whitespace-nowrap">
        {[...Array(3)].map((_, setIndex) => (
          <div key={setIndex} className="flex items-center">
            {items.map((item, i) => (
              <div key={`${setIndex}-${i}`} className="flex items-center mx-6 group cursor-default">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300 border border-slate-100">
                  <span className={`material-symbols-outlined text-xl ${item.color}`}>{item.icon}</span>
                </div>
                <span className="text-slate-700 font-semibold text-sm group-hover:text-primary transition-colors duration-300">{item.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Gradient fades */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ULTRA PREMIUM FEATURE CARD
// ═══════════════════════════════════════════════════════════════════════════════

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
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

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`relative group cursor-pointer transition-all duration-700 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
                  ${feature.isLarge ? 'md:col-span-2' : ''}`}
    >
      {isHovered && (
        <div 
          className="absolute inset-0 rounded-3xl pointer-events-none z-0"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 74, 198, 0.08), transparent 40%)`,
          }}
        />
      )}
      
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
        {/* HERO SECTION — Dominant Typing Animation                           */}
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
              
              {/* Right: DOMINANT TYPING ANIMATION */}
              <div className="relative">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/8 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-500/8 rounded-full blur-[100px]"></div>
                <DominantTypingText />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* PREMIUM TICKER                                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <PremiumTicker />

        {/* STATS */}
        <section className="py-14 px-6 bg-white border-b border-slate-100">
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
        <section id="fitur" className="py-20 px-6 bg-slate-50/50">
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
        <section id="tentang" className="py-20 px-6 bg-white">
          <div className="container mx-auto">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4 uppercase tracking-widest">Tentang Kami</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">Kenapa Memilih Kami?</h2>
              <p className="text-base text-slate-500 max-w-xl mx-auto">Dikembangkan oleh operator sekolah, untuk operator sekolah.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {WHY_US.map((item, i) => (
                <div key={i} className="group bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-2xl ${item.iconColor}`}>{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-blue-50/50 rounded-2xl p-10 text-center border border-primary/10">
              <span className="material-symbols-outlined text-4xl text-primary/70 mb-4 block">format_quote</span>
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
        <section className="py-16 px-6 bg-slate-50">
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

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-10 px-6" id="kontak">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-lg">school</span>
            </div>
            <span className="text-lg font-bold">LPJ BOS/BOSP</span>
          </div>
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} LPJ BOS/BOSP Indonesia.</p>
          <div className="flex gap-6">
            <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#">Syarat & Ketentuan</a>
            <a className="text-slate-400 hover:text-white transition-colors text-sm" href="#">Kebijakan Privasi</a>
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
