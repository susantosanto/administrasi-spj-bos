/**
 * Landing Page — ULTRA PREMIUM DESIGN
 * Dark hero with animated effects like morphllm.com
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED BACKGROUND COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedBackground() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.2, canvas.height * 0.3, 0,
        canvas.width * 0.2, canvas.height * 0.3, canvas.width * 0.5
      );
      gradient1.addColorStop(0, 'rgba(0, 74, 198, 0.12)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.8, canvas.height * 0.6, 0,
        canvas.width * 0.8, canvas.height * 0.6, canvas.width * 0.4
      );
      gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 74, 198, ${p.opacity})`;
        ctx.fill();
        
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 74, 198, ${0.06 * (1 - dist / 120)})`;
            ctx.stroke();
          }
        }
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
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
    <span className="text-primary font-bold">
      {displayText}
      <span className="animate-pulse text-white">|</span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOWING TEXT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function GlowingText({ children, className = '' }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute -inset-4 blur-2xl opacity-70 bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
        {children}
      </span>
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATED CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCard({ children, index, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 100);
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
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };
  
  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/30 p-8 transition-all duration-500 ${className}
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}
        hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:scale-[1.02]`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 74, 198, 0.12), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTER ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCounter({ end, duration = 2500, suffix = '' }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
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
// SCROLL REVEAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ScrollReveal({ children, className = '', delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {children}
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
    desc: 'Upload file Excel BKU dari ARKAS dan data akan langsung terparse otomatis dengan cerdas.',
    gradient: 'from-blue-500 to-cyan-400',
    iconBg: 'bg-blue-500/15',
  },
  {
    icon: 'print',
    title: 'Cetak Otomatis',
    desc: 'Generate dokumen LPJ hanya dengan satu klik. Format A4 profesional.',
    gradient: 'from-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-500/15',
  },
  {
    icon: 'description',
    title: '13 Template',
    desc: 'Tersedia 13 template dokumen siap pakai: Honor, SPPD, Notulen, dan lainnya.',
    gradient: 'from-violet-500 to-purple-400',
    iconBg: 'bg-violet-500/15',
  },
  {
    icon: 'school',
    title: 'Data Sekolah',
    desc: 'Upload profil sekolah dari file Dapodik. Otomatis mengisi data identitas.',
    gradient: 'from-amber-500 to-orange-400',
    iconBg: 'bg-amber-500/15',
  },
  {
    icon: 'groups',
    title: 'Data Guru & Tendik',
    desc: 'Import data guru dan tenaga kependidikan dari Dapodik secara lengkap.',
    gradient: 'from-rose-500 to-pink-400',
    iconBg: 'bg-rose-500/15',
  },
  {
    icon: 'edit_note',
    title: 'Catatan Penting',
    desc: 'Simpan catatan terkait BOS dengan kategori, warna, dan fitur pin.',
    gradient: 'from-cyan-500 to-blue-400',
    iconBg: 'bg-cyan-500/15',
  },
];

const TYPING_TEXTS = [
  'Upload BKU',
  'Cetak LPJ',
  'Kelola Data',
  'Generate Laporan',
];

const STATS = [
  { number: 13, suffix: '+', label: 'Template Dokumen', icon: 'description', color: 'from-blue-400 to-cyan-400' },
  { number: 85, suffix: '%', label: 'Lebih Efisien', icon: 'speed', color: 'from-emerald-400 to-teal-400' },
  { number: 100, suffix: '%', label: 'Uptime Server', icon: 'cloud_done', color: 'from-violet-400 to-purple-400' },
  { number: 24, suffix: '/7', label: 'Akses Kapan Saja', icon: 'schedule', color: 'from-amber-400 to-orange-400' },
];

const WHY_US = [
  { 
    icon: 'psychology', 
    title: 'Dirancang untuk Operator',
    desc: 'Dibuat oleh operator sekolah yang memahami kebutuhan nyata dalam pengelolaan dana BOS/BOSP.',
    gradient: 'from-blue-500 to-cyan-400'
  },
  { 
    icon: 'auto_fix_high', 
    title: 'Otomatis & Cerdas',
    desc: 'Sistem otomatis mengenali pola transaksi dan mengelompokkannya secara akurat.',
    gradient: 'from-emerald-500 to-teal-400'
  },
  { 
    icon: 'shield', 
    title: 'Keamanan Terjamin',
    desc: 'Semua data disimpan lokal di perangkat Anda. Tidak ada data yang dikirim ke server.',
    gradient: 'from-violet-500 to-purple-400'
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
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TOP APP BAR                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrollY > 50 
          ? 'bg-slate-950/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/20' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center rounded-xl shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">LPJ BOS/BOSP</span>
          </Link>
          <nav className="hidden md:flex items-center gap-10">
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer text-sm uppercase tracking-wider" href="#fitur">
              Fitur
            </a>
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer text-sm uppercase tracking-wider" href="#tentang">
              Tentang
            </a>
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer text-sm uppercase tracking-wider" href="#kontak">
              Kontak
            </a>
            <Link
              to="/login"
              className="bg-gradient-to-r from-primary to-blue-600 text-white px-7 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 text-sm"
            >
              Mulai Sekarang
            </Link>
          </nav>
        </div>
      </header>

      <main>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          <AnimatedBackground />
          
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px]" />

          <div className="container mx-auto px-6 py-40 relative z-10">
            <div className="text-center max-w-5xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-10 hover:bg-white/10 transition-colors cursor-default">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50" />
                <span className="text-slate-300 text-sm font-medium">Platform Resmi & Terpercaya</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white leading-[0.9] mb-8 tracking-tight">
                Sampurasun!
                <br />
                <span className="relative inline-block mt-4">
                  <GlowingText>Selamat Datang</GlowingText>
                </span>
                <br />
                <span className="text-4xl md:text-5xl lg:text-6xl text-slate-400 font-medium mt-4 block">
                  di Aplikasi{' '}
                  <span className="text-white font-bold">LPJ BOS/BOSP</span>
                </span>
              </h1>

              {/* Typing Animation */}
              <div className="text-xl md:text-2xl text-slate-400 mb-10 h-12 flex items-center justify-center gap-2">
                <span className="text-white/60">Mulai dari</span>
                <TypingText texts={TYPING_TEXTS} />
              </div>

              {/* Description */}
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-14 leading-relaxed">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan. 
                Kelola dana BOS/BOSP dengan standar profesionalisme tinggi.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
                <Link
                  to="/login"
                  className="group relative bg-gradient-to-r from-primary to-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    Mulai Sekarang
                    <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform duration-300">arrow_forward</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
                <a
                  href="#fitur"
                  className="bg-white/5 backdrop-blur-xl text-white px-10 py-5 rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Lihat Fitur
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {STATS.map((stat, i) => (
                  <div key={i} className="relative group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                    <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300">
                      <span className={`material-symbols-outlined text-3xl bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-4 block`}>{stat.icon}</span>
                      <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                        <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                      </div>
                      <p className="text-slate-500 text-sm uppercase tracking-wider font-medium">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-slate-600 text-xs uppercase tracking-widest">Scroll</span>
            <span className="material-symbols-outlined text-slate-600 text-2xl">expand_more</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[200px]" />
          
          <div className="container mx-auto relative z-10">
            <ScrollReveal>
              <div className="text-center mb-20">
                <span className="inline-block px-5 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-widest border border-primary/20">
                  Fitur Unggulan
                </span>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                  Fitur Unggulan <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Sistem</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Dirancang untuk memudahkan pekerjaan operator sekolah dalam menyusun laporan pertanggungjawaban.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <AnimatedCard key={i} index={i} className="group cursor-pointer">
                  <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    <span className={`material-symbols-outlined text-3xl bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <span>Pelajari Selengkapnya</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* WHY US SECTION                                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="tentang" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[200px] animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="container mx-auto relative z-10">
            <ScrollReveal>
              <div className="text-center mb-20">
                <span className="inline-block px-5 py-2 bg-primary/10 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-widest border border-primary/20">
                  Tentang Kami
                </span>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
                  Kenapa Memilih <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Kami?</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Dikembangkan oleh operator sekolah, untuk operator sekolah.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {WHY_US.map((item, i) => (
                <ScrollReveal key={i} delay={i * 150}>
                  <div className="group relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />
                    <div className="relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-3xl p-10 hover:border-white/10 transition-all duration-500 h-full">
                      <div className={`w-18 h-18 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                        <span className="material-symbols-outlined text-3xl text-white">{item.icon}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Mission Statement */}
            <ScrollReveal delay={300}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-600/15 to-primary/20 rounded-[2.5rem] blur-3xl" />
                <div className="relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl border border-white/[0.06] rounded-[2.5rem] p-12 md:p-16 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-3xl text-white">format_quote</span>
                  </div>
                  <p className="text-2xl md:text-3xl lg:text-4xl text-white font-medium leading-relaxed max-w-4xl mx-auto mb-10">
                    Kami percaya setiap sekolah berhak mendapatkan <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent font-bold">alat terbaik</span> untuk mengelola keuangan dengan <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent font-bold">transparan dan profesional</span>.
                  </p>
                  <div className="flex items-center justify-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                      <span className="material-symbols-outlined text-2xl text-white">verified</span>
                    </div>
                    <div className="text-left">
                      <p className="text-white font-bold text-lg">Tim Pengembang</p>
                      <p className="text-slate-400">LPJ BOS/BOSP Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/15 rounded-full blur-[250px]" />
          </div>
          
          <div className="container mx-auto relative z-10">
            <ScrollReveal>
              <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                  Siap Mendigitalisasi<br />
                  <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Keuangan Sekolah?</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-14">
                  Mulai sekarang dan rasakan kemudahan dalam mengelola laporan pertanggungjawaban BOS/BOSP.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-4 bg-gradient-to-r from-primary to-blue-600 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95 group"
                >
                  Mulai Sekarang
                  <span className="material-symbols-outlined text-2xl group-hover:translate-x-2 transition-transform duration-300">arrow_forward</span>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="py-16 px-6 border-t border-white/5" id="kontak">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-white text-xl">school</span>
              </div>
              <span className="text-xl font-bold text-white">LPJ BOS/BOSP</span>
            </div>
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} LPJ BOS/BOSP Indonesia. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a className="text-slate-500 hover:text-white transition-colors text-sm" href="#">Syarat & Ketentuan</a>
              <a className="text-slate-500 hover:text-white transition-colors text-sm" href="#">Kebijakan Privasi</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-primary to-blue-600 text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-500 z-50 hover:scale-110 hover:shadow-primary/50 hover:-translate-y-1 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-2xl">arrow_upward</span>
      </button>
    </div>
  );
}
