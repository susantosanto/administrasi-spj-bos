/**
 * Pratinjau Desain — 4 view + footer banner sesuai spek (statis, ilustratif).
 * Route publik /pratinjau. Tidak menyentuh halaman/fitur aplikasi yang berjalan.
 * Ikon: lucide-react. Token: blue-600, slate-50, white, slate-900/500.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, Sparkles, Play, ArrowRight, ArrowUpRight,
  Eye, EyeOff, Bell, ChevronDown, Search, Download,
  LayoutDashboard, FileText, BarChart3, Settings,
  PlusCircle, Printer, ShieldCheck, BadgeCheck, Headphones,
  Zap, Target, Clock, CheckCircle2, Menu, X, Landmark,
} from "lucide-react";

// ─── Data ilustratif ─────────────────────────────────────────────────────────
const NAV_LINKS = ["Beranda", "Fitur", "Template", "Panduan", "Kontak"];

const HERO_FEATURES = [
  { icon: Zap, title: "Mudah Digunakan", desc: "Alur sederhana untuk semua operator." },
  { icon: ShieldCheck, title: "Aman & Terpercaya", desc: "Data tersimpan aman di perangkat." },
  { icon: BadgeCheck, title: "Sesuai Regulasi", desc: "Format mengikuti aturan BOS/BOSP." },
  { icon: Headphones, title: "Dukungan Penuh", desc: "Bantuan kapan pun dibutuhkan." },
];

const STATS = [
  { icon: FileText, tint: "bg-blue-50 text-blue-600", number: "128", label: "Total Dokumen" },
  { icon: CheckCircle2, tint: "bg-emerald-50 text-emerald-600", number: "96", label: "Selesai" },
  { icon: Clock, tint: "bg-amber-50 text-amber-600", number: "24", label: "Dalam Proses" },
  { icon: Target, tint: "bg-rose-50 text-rose-600", number: "8", label: "Perlu Tindakan" },
];

const RECENT_DOCS = [
  { title: "LPJ BOS Triwulan 1", date: "12 Jan 2026" },
  { title: "Rencana Kegiatan Sekolah", date: "8 Jan 2026" },
  { title: "Buku Kas Umum Januari", date: "5 Jan 2026" },
];

const QUICK_ACCESS = [
  { icon: PlusCircle, label: "Buat Dokumen" },
  { icon: BarChart3, label: "Lihat Laporan" },
  { icon: Printer, label: "Cetak LPJ" },
  { icon: Settings, label: "Pengaturan" },
];

const TEMPLATES = [
  { title: "LPJ BOS Triwulan", desc: "Laporan pertanggungjawaban dana BOS per triwulan." },
  { title: "Buku Kas Umum", desc: "Pencatatan arus kas masuk dan keluar." },
  { title: "Rencana Kegiatan", desc: "Perencanaan kegiatan dan anggaran sekolah." },
  { title: "Laporan Realisasi", desc: "Realisasi penggunaan dana per periode." },
  { title: "Berita Acara", desc: "Berita acara serah terima dan pemeriksaan." },
  { title: "Kuitansi Dana", desc: "Bukti penerimaan dan pengeluaran dana." },
  { title: "Daftar Hadir", desc: "Absensi kegiatan dan rapat sekolah." },
  { title: "Surat Tugas", desc: "Penugasan resmi untuk kegiatan dinas." },
];

const FOOTER_FEATURES = [
  { icon: Zap, title: "Proses Lebih Cepat", desc: "Susun dokumen dalam hitungan menit." },
  { icon: Target, title: "Akurasi Data Terjamin", desc: "Minim salah hitung dan salah ketik." },
  { icon: Clock, title: "Akses Kapan Saja", desc: "Kelola dokumen tanpa batas waktu." },
  { icon: Headphones, title: "Dukungan Berkelanjutan", desc: "Tim siap membantu setiap saat." },
];

// ─── 1. Landing ──────────────────────────────────────────────────────────────
function PreviewNavbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#pratinjau-landing" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </span>
          <span className="text-base font-bold text-blue-600">LPJ BOS/BOSP</span>
        </a>
        <nav className="hidden md:flex items-center gap-7" aria-label="Navigasi pratinjau">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#pratinjau-landing" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              {l}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="#pratinjau-login" className="px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors">
            Masuk
          </a>
          <a href="#pratinjau-login" className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors">
            Mulai Sekarang
          </a>
        </div>
        <button className="md:hidden p-2 text-slate-500 hover:text-blue-600" onClick={() => setOpen((v) => !v)} aria-label="Menu navigasi">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#pratinjau-landing" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-slate-500 hover:text-blue-600">
              {l}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <a href="#pratinjau-login" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200">
              Masuk
            </a>
            <a href="#pratinjau-login" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600">
              Mulai Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function LandingView() {
  return (
    <section id="pratinjau-landing" className="bg-slate-50 scroll-mt-20">
      <PreviewNavbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-600 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Sistem Administrasi Keuangan Sekolah
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-4">
            Selamat Datang di Aplikasi <span className="text-blue-600">LPJ BOS/BOSP</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg mb-8">
            Solusi cerdas, efisien, dan transparan untuk mengelola administrasi keuangan sekolah Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="#pratinjau-login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors min-h-[50px]">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#pratinjau-fitur" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-blue-600 border border-blue-200 bg-white hover:bg-blue-50 transition-colors min-h-[50px]">
              <Play className="w-4 h-4" />
              Lihat Fitur
            </a>
          </div>
        </div>

        {/* Mockup laptop + dokumen melayang */}
        <div className="relative" aria-hidden="true">
          <div className="bg-slate-900 rounded-t-2xl p-2 pb-0 shadow-xl">
            <div className="bg-white rounded-t-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              </div>
              <div className="flex">
                <div className="w-14 bg-blue-600 py-4 flex flex-col items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-white/20" />
                  <span className="w-6 h-6 rounded-md bg-white" />
                  <span className="w-6 h-6 rounded-md bg-white/20" />
                  <span className="w-6 h-6 rounded-md bg-white/20" />
                </div>
                <div className="flex-1 p-4">
                  <div className="h-3 w-2/5 rounded bg-slate-200 mb-3" />
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="h-12 rounded-lg bg-blue-50 border border-blue-100" />
                    <div className="h-12 rounded-lg bg-emerald-50 border border-emerald-100" />
                    <div className="h-12 rounded-lg bg-amber-50 border border-amber-100" />
                  </div>
                  <div className="h-16 rounded-lg bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
          <div className="mx-auto h-3 w-4/5 bg-slate-300 rounded-b-2xl" />
          <div className="absolute -right-2 sm:-right-5 -bottom-6 w-44 sm:w-52 bg-white rounded-xl border border-slate-100 shadow-md p-4 rotate-3">
            <FileText className="w-7 h-7 text-blue-600 mb-2" />
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide">Laporan</p>
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wide mb-2">Pertanggungjawaban</p>
            <div className="space-y-1.5">
              <div className="h-1.5 rounded bg-slate-100" />
              <div className="h-1.5 w-4/5 rounded bg-slate-100" />
              <div className="h-1.5 w-3/5 rounded bg-blue-100" />
            </div>
          </div>
        </div>
      </div>

      <div id="pratinjau-fitur" className="border-t border-slate-100 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HERO_FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3">
              <span className="w-10 h-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-blue-600" />
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-900">{f.title}</span>
                <span className="block text-[13px] text-slate-500 mt-0.5">{f.desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 2. Login ────────────────────────────────────────────────────────────────
function LoginView() {
  const [show, setShow] = useState(false);
  return (
    <section id="pratinjau-login" className="bg-white scroll-mt-20">
      <div className="grid lg:grid-cols-2 min-h-[640px]">
        {/* Panel kiri */}
        <div className="relative hidden lg:flex flex-col justify-end overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-12">
          <Landmark className="absolute top-16 left-12 w-40 h-40 text-white/15" strokeWidth={1} aria-hidden="true" />
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex flex-col w-10 rounded-md overflow-hidden shadow-md" aria-label="Bendera Indonesia">
              <span className="h-3 bg-red-500" />
              <span className="h-3 bg-white" />
            </span>
            <p className="text-white font-semibold">Sekolah Indonesia</p>
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug max-w-md">
            Kelola keuangan sekolah dengan transparan dan akuntabel.
          </h2>
          <svg viewBox="0 0 1440 140" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,70 C240,130 480,10 720,60 C960,110 1200,30 1440,80 L1440,140 L0,140 Z" fill="rgba(255,255,255,0.18)" />
            <path d="M0,95 C260,140 520,40 780,85 C1040,130 1240,60 1440,100 L1440,140 L0,140 Z" fill="rgba(255,255,255,0.22)" />
          </svg>
        </div>

        {/* Form kanan */}
        <div className="flex items-center justify-center px-4 sm:px-8 py-14">
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-6">
              <span className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <GraduationCap className="w-6 h-6 text-white" />
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 text-center">Selamat Datang Kembali</h2>
            <p className="text-sm text-slate-500 text-center mt-1.5 mb-8">
              Masuk untuk melanjutkan ke sistem LPJ BOS/BOSP
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label htmlFor="pv-email" className="block text-sm font-medium text-slate-900 mb-1.5">
                  Email atau Username
                </label>
                <input
                  id="pv-email" type="text" placeholder="nama@sekolah.id"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                />
              </div>
              <div>
                <label htmlFor="pv-pass" className="block text-sm font-medium text-slate-900 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="pv-pass" type={show ? "text" : "password"} placeholder="••••••••"
                    className="w-full h-12 px-4 pr-12 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button" onClick={() => setShow((v) => !v)}
                    aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/30" />
                  Ingat saya
                </label>
                <a href="#pratinjau-login" className="font-medium text-blue-600 hover:text-blue-700">
                  Lupa password?
                </a>
              </div>
              <button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[15px] font-semibold shadow-md transition-colors">
                Masuk
              </button>
            </form>
            <p className="text-[13px] text-slate-500 text-center mt-6">
              Belum punya akun? Hubungi administrator sekolah Anda.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 3. Dashboard ────────────────────────────────────────────────────────────
function DashboardView() {
  const sideLinks = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileText, label: "Dokumen", active: false },
    { icon: BarChart3, label: "Laporan", active: false },
    { icon: GraduationCap, label: "Sekolah", active: false },
    { icon: Settings, label: "Pengaturan", active: false },
  ];
  return (
    <section id="pratinjau-dashboard" className="bg-slate-50 py-14 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Pratinjau 03 — Dashboard</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">Tampilan Dashboard</h2>

        <div className="rounded-xl overflow-hidden border border-slate-100 shadow-md flex flex-col md:flex-row min-h-[560px]">
          {/* Sidebar */}
          <aside className="w-full md:w-56 shrink-0 bg-blue-600 p-4 flex md:flex-col gap-1 overflow-x-auto">
            <div className="hidden md:flex items-center gap-2 px-2 py-3 mb-3">
              <span className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </span>
              <span className="text-sm font-bold text-white">LPJ BOS/BOSP</span>
            </div>
            {sideLinks.map((l) => (
              <a
                key={l.label} href="#pratinjau-dashboard"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  l.active ? "bg-white/20 text-white" : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                <l.icon className="w-4 h-4" />
                {l.label}
              </a>
            ))}
          </aside>

          {/* Konten */}
          <div className="flex-1 bg-slate-50 min-w-0">
            <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-900 truncate">SMP Negeri 1 Harapan Jaya</p>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button aria-label="Notifikasi" className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="flex items-center gap-2 p-1.5 pr-2 rounded-lg hover:bg-slate-100 transition-colors">
                  <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    AS
                  </span>
                  <span className="hidden sm:block text-left">
                    <span className="block text-[13px] font-semibold text-slate-900 leading-tight">Admin Sekolah</span>
                    <span className="block text-[11px] text-slate-500 leading-tight">admin@sekolah.id</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <h3 className="text-xl font-bold text-slate-900">Halo, Admin Sekolah</h3>
              <p className="text-sm text-slate-500 mt-0.5 mb-5">Berikut ringkasan administrasi keuangan hari ini.</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                {STATS.map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow">
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.tint}`}>
                      <s.icon className="w-5 h-5" />
                    </span>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.number}</p>
                    <p className="text-[13px] text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <p className="text-sm font-bold text-slate-900 mb-1">Realisasi Dana</p>
                  <p className="text-[13px] text-slate-500 mb-3">
                    <span className="font-bold text-slate-900">Rp 245.000.000</span> / Rp 350.000.000
                  </p>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-1.5">
                    <div className="h-full w-[70%] rounded-full bg-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-blue-600">70% terserap</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-900">Dokumen Terbaru</p>
                    <a href="#pratinjau-dashboard" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                      Lihat Semua
                    </a>
                  </div>
                  <ul className="space-y-2.5">
                    {RECENT_DOCS.map((d) => (
                      <li key={d.title} className="flex items-center gap-3">
                        <span className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-[13px] font-semibold text-slate-900 truncate">{d.title}</span>
                          <span className="block text-[11px] text-slate-500">{d.date}</span>
                        </span>
                        <span className="shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-0.5">
                          Selesai
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                <p className="text-sm font-bold text-slate-900 mb-3">Akses Cepat</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {QUICK_ACCESS.map((q) => (
                    <a
                      key={q.label} href="#pratinjau-dashboard"
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-100 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <q.icon className="w-6 h-6" />
                      <span className="text-xs font-semibold">{q.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── 4. Template ─────────────────────────────────────────────────────────────
function TemplateView() {
  return (
    <section id="pratinjau-template" className="bg-white py-14 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">Pratinjau 04 — Template</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Template Dokumen</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">Pilih template resmi yang siap diunduh dan digunakan.</p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <label className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search" placeholder="Cari template…"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition"
            />
          </label>
          <label className="relative sm:w-52">
            <select
              className="w-full h-11 appearance-none pl-4 pr-10 rounded-xl border border-slate-200 text-sm text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition cursor-pointer"
              defaultValue="Semua Kategori"
            >
              {["Semua Kategori", "LPJ", "Kas", "Perencanaan", "Berita Acara"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </label>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <article key={t.title} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col">
              <FileText className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-[15px] font-bold text-slate-900 mb-1">{t.title}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-4 flex-1">{t.desc}</p>
              <a
                href="#pratinjau-template"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── 5. Footer banner ────────────────────────────────────────────────────────
function FooterBanner() {
  return (
    <section className="bg-slate-50 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
          Kenapa Memilih LPJ BOS/BOSP?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {FOOTER_FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <f.icon className="w-6 h-6 text-blue-600 mb-3" />
              <p className="text-[15px] font-bold text-slate-900 mb-1">{f.title}</p>
              <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
        <blockquote className="max-w-2xl mx-auto text-center border-l-4 border-blue-600 pl-6 py-1">
          <p className="text-lg sm:text-xl font-medium text-slate-900 italic leading-relaxed">
            “Transparansi pengelolaan dana, untuk pendidikan yang lebih baik.”
          </p>
        </blockquote>
      </div>
    </section>
  );
}

// ─── Halaman ─────────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "pratinjau-landing", label: "Landing" },
  { id: "pratinjau-login", label: "Login" },
  { id: "pratinjau-dashboard", label: "Dashboard" },
  { id: "pratinjau-template", label: "Template" },
];

export default function PratinjauPage() {
  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <div className="bg-gradient-to-r from-[#102A56] via-[#004ac6] to-[#155EEF] text-white shadow-md shadow-blue-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-100 hover:text-white transition-colors">
            <ArrowUpRight className="w-3.5 h-3.5 rotate-[225deg]" />
            Kembali ke aplikasi
          </Link>
          <span className="hidden sm:inline text-xs text-white/30">|</span>
          <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Lompat ke view">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-xs font-medium text-blue-100 hover:text-white transition-colors">
                {s.label}
              </a>
            ))}
          </nav>
          <span className="ml-auto text-[11px] text-blue-100/70">Pratinjau statis — tombol tidak menjalankan aksi</span>
        </div>
      </div>

      <LandingView />
      <LoginView />
      <DashboardView />
      <TemplateView />
      <FooterBanner />

      <footer className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-slate-400">
          Halaman pratinjau desain — bukan bagian dari aplikasi. © {new Date().getFullYear()} LPJ BOS/BOSP Indonesia.
        </div>
      </footer>
    </div>
  );
}
