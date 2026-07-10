/**
 * Landing Page — ULTRA PREMIUM DESIGN
 * Dark hero with animated effects like morphllm.com
 */
import { Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";

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
    
    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw gradient mesh
      const gradient1 = ctx.createRadialGradient(
        canvas.width * 0.3, canvas.height * 0.3, 0,
        canvas.width * 0.3, canvas.height * 0.3, canvas.width * 0.5
      );
      gradient1.addColorStop(0, 'rgba(0, 74, 198, 0.15)');
      gradient1.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const gradient2 = ctx.createRadialGradient(
        canvas.width * 0.7, canvas.height * 0.7, 0,
        canvas.width * 0.7, canvas.height * 0.7, canvas.width * 0.4
      );
      gradient2.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 74, 198, ${p.opacity})`;
        ctx.fill();
        
        // Draw connections
        particles.forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 74, 198, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
        
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
      style={{ opacity: 0.8 }}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPING ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function TypingText({ texts, speed = 100, deleteSpeed = 50, pauseTime = 2000 }) {
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
    <span className="text-primary">
      {displayText}
      <span className="animate-pulse">|</span>
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
      <span className="absolute inset-0 blur-xl opacity-50 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
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
          setTimeout(() => setIsVisible(true), index * 150);
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
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 p-8 transition-all duration-700 ${className}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}
        hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Mouse glow effect */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 74, 198, 0.15), transparent 40%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COUNTER ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
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
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
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
// FEATURES DATA
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: 'upload_file',
    title: 'Upload BKU',
    desc: 'Upload file Excel BKU dari ARKAS dan data akan langsung terparse otomatis.',
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/20',
  },
  {
    icon: 'print',
    title: 'Cetak Otomatis',
    desc: 'Generate dokumen LPJ hanya dengan satu klik. Format profesional.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-500/20',
  },
  {
    icon: 'description',
    title: '13 Template',
    desc: 'Tersedia 13 template dokumen siap pakai.',
    gradient: 'from-violet-500 to-purple-500',
    iconBg: 'bg-violet-500/20',
  },
  {
    icon: 'school',
    title: 'Data Sekolah',
    desc: 'Upload profil sekolah dari file Dapodik otomatis.',
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-500/20',
  },
  {
    icon: 'groups',
    title: 'Data Guru & Tendik',
    desc: 'Import data guru dan tenaga kependidikan.',
    gradient: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-500/20',
  },
  {
    icon: 'edit_note',
    title: 'Catatan Penting',
    desc: 'Simpan catatan terkait BOS dengan kategori.',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500/20',
  },
];

const TYPING_TEXTS = [
  'Upload BKU',
  'Cetak LPJ',
  'Kelola Data',
  'Generate Laporan',
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
          ? 'bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
            <span className="text-lg font-bold text-white">LPJ BOS/BOSP</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer" href="#fitur">
              Fitur
            </a>
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer" href="#tentang">
              Tentang
            </a>
            <a className="text-slate-400 font-medium hover:text-white transition-colors cursor-pointer" href="#kontak">
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

      <main>
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* HERO SECTION — Ultra Premium Dark with Animations                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900">
          {/* Animated Background */}
          <AnimatedBackground />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="container mx-auto px-6 py-32 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 mb-8 animate-fade-in">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-400 text-sm font-medium">Platform Resmi & Terpercaya</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-6">
                Sampurasun!
                <br />
                <span className="relative">
                  <GlowingText className="text-primary">Selamat Datang</GlowingText>
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl text-slate-400">
                  di Aplikasi{' '}
                  <span className="text-white font-bold">LPJ BOS/BOSP</span>
                </span>
              </h1>

              {/* Typing Animation */}
              <div className="text-xl md:text-2xl text-slate-400 mb-8 h-10">
                <span className="text-white">Mulai dari</span>{' '}
                <TypingText texts={TYPING_TEXTS} />
              </div>

              {/* Description */}
              <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan transparan. 
                Kelola dana BOS/BOSP dengan standar profesionalisme tinggi.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="group relative bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-1 active:scale-95"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Mulai Sekarang
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                <a
                  href="#fitur"
                  className="bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">play_circle</span>
                  Lihat Fitur
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 mt-20 pt-12 border-t border-slate-800">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={13} suffix="+" />
                  </div>
                  <div className="text-slate-500 text-sm uppercase tracking-wider">Template Siap Pakai</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={85} suffix="%" />
                  </div>
                  <div className="text-slate-500 text-sm uppercase tracking-wider">Lebih Efisien</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                    <AnimatedCounter end={24} suffix="/7" />
                  </div>
                  <div className="text-slate-500 text-sm uppercase tracking-wider">Akses Kapan Saja</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <span className="material-symbols-outlined text-slate-500 text-3xl">expand_more</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FEATURES SECTION — Dark Cards with Glow Effects                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-32 px-6 bg-slate-900 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          
          <div className="container mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-20">
              <span className="inline-block px-4 py-2 bg-primary/20 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-wider border border-primary/30">
                Fitur Unggulan
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Fitur Unggulan <span className="text-primary">Sistem</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Dirancang untuk memudahkan pekerjaan operator sekolah dalam menyusun laporan pertanggungjawaban.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((feature, i) => (
                <AnimatedCard key={i} index={i} className="group cursor-pointer">
                  {/* Icon */}
                  <div className={`w-14 h-14 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <span className={`material-symbols-outlined text-3xl bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {feature.desc}
                  </p>

                  {/* CTA */}
                  <div className="mt-6 flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Pelajari Selengkapnya</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ABOUT SECTION                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section id="tentang" className="py-32 px-6 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          
          <div className="container mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="inline-block px-4 py-2 bg-primary/20 text-primary text-sm font-bold rounded-full mb-6 uppercase tracking-wider border border-primary/30">
                  Tentang Kami
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Platform <span className="text-primary">Terpercaya</span>
                </h2>
                <p className="text-lg text-slate-400 leading-relaxed mb-8">
                  Dikembangkan atas inisiasi untuk digitalisasi birokrasi sekolah, LPJ BOS/BOSP hadir untuk menjawab tantangan administrasi keuangan.
                </p>
                <div className="space-y-6">
                  {[
                    { icon: 'support_agent', title: 'Dukungan 24/7', desc: 'Tim ahli siap membantu Anda kapan saja.' },
                    { icon: 'update', title: 'Update Berkala', desc: 'Mengikuti regulasi terbaru.' },
                    { icon: 'security', title: 'Data Aman', desc: 'Keamanan data terjamin.' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary">{item.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-1">{item.title}</h4>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl" />
                <div className="relative bg-slate-800 rounded-[3rem] p-12 border border-slate-700/50">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 rounded-2xl p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-primary mb-3 block">verified</span>
                      <p className="text-white font-bold">Resmi</p>
                      <p className="text-slate-500 text-sm">Terdaftar</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-emerald-500 mb-3 block">speed</span>
                      <p className="text-white font-bold">Cepat</p>
                      <p className="text-slate-500 text-sm">Efisien</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-violet-500 mb-3 block">auto_awesome</span>
                      <p className="text-white font-bold">Modern</p>
                      <p className="text-slate-500 text-sm">Interface</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-6 text-center">
                      <span className="material-symbols-outlined text-4xl text-amber-500 mb-3 block">shield</span>
                      <p className="text-white font-bold">Aman</p>
                      <p className="text-slate-500 text-sm">Terkripsi</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CTA SECTION                                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="py-32 px-6 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[200px]" />
          </div>
          
          <div className="container mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Siap Mendigitalisasi<br />
                <span className="text-primary">Keuangan Sekolah?</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12">
                Gabung bersama ribuan sekolah lainnya yang telah meningkatkan efisiensi pelaporan mereka.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 transition-all active:scale-95"
              >
                Daftar Sekarang Gratis
                <span className="material-symbols-outlined text-2xl">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FOOTER                                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-800" id="kontak">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary">school</span>
            </div>
            <span className="text-lg font-bold text-white">LPJ BOS/BOSP</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} LPJ BOS/BOSP Indonesia. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a className="hover:text-white transition-colors text-sm" href="#">Syarat & Ketentuan</a>
            <a className="hover:text-white transition-colors text-sm" href="#">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center transition-all duration-300 z-50 hover:scale-110 hover:shadow-primary/50 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined text-2xl">arrow_upward</span>
      </button>

      {/* Global styles for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
