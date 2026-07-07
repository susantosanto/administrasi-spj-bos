import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

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
    <div className="min-h-screen bg-background text-on-background font-body-lg overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-lg py-md bg-surface/90 backdrop-blur-md border-b border-outline-variant">
        <div className="flex items-center gap-sm">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg shadow-lg">
            <span
              className="material-symbols-outlined text-on-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              school
            </span>
          </div>
          <span className="font-headline-md text-headline-md font-extrabold text-primary">
            SPJ BOS/BOSP
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-lg">
          <a
            className="text-on-surface-variant font-label-md hover:text-primary transition-colors cursor-pointer"
            href="#fitur"
          >
            Fitur
          </a>
          <a
            className="text-on-surface-variant font-label-md hover:text-primary transition-colors cursor-pointer"
            href="#tentang"
          >
            Tentang
          </a>
          <a
            className="text-on-surface-variant font-label-md hover:text-primary transition-colors cursor-pointer"
            href="#kontak"
          >
            Kontak
          </a>
          <Link
            to="/login"
            className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Mulai Sekarang
          </Link>
        </nav>
        <button className="md:hidden p-sm text-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[700px] flex items-center overflow-hidden px-margin-page">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, rgba(0, 74, 198, 0.05), transparent), radial-gradient(circle at bottom left, rgba(0, 108, 74, 0.05), transparent)",
            }}
          ></div>
          <div className="container mx-auto grid md:grid-cols-2 gap-xl items-center relative z-10">
            <div className="text-center md:text-left space-y-md">
              <div className="inline-flex items-center gap-xs px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-full mb-md">
                <span className="material-symbols-outlined text-[18px]">
                  verified
                </span>
                <span className="font-label-xs">Resmi &amp; Terpercaya</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg md:text-6xl text-text-high leading-tight">
                Sampurasun!
                <br />
                <span className="text-primary">
                  Selamat Datang di Aplikasi SPJ BOS/BOSP
                </span>
              </h1>
              <p className="text-body-lg text-text-low max-w-xl">
                Solusi administrasi keuangan sekolah yang cerdas, efisien, dan
                transparan. Kelola dana BOS/BOSP dengan standar profesionalisme
                tinggi dalam satu platform terpadu.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center md:justify-start pt-md">
                <Link
                  to="/login"
                  className="bg-primary text-on-primary px-xl py-md rounded-xl font-label-md text-lg shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-sm"
                >
                  Mulai Sekarang{" "}
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
              <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
              <div className="glass-card p-sm rounded-[2rem] shadow-2xl relative z-10 rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="rounded-[1.5rem] w-full aspect-video bg-gradient-to-br from-primary/20 to-primary-container/30 flex items-center justify-center">
                  <div className="text-center p-xl">
                    <span className="material-symbols-outlined text-primary text-7xl mb-4 block">
                      account_balance_wallet
                    </span>
                    <p className="font-headline-sm text-primary font-semibold">
                      Dashboard SPJ BOS/BOSP
                    </p>
                    <p className="text-text-low text-sm mt-1">
                      Administrasi Keuangan Sekolah
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-md rounded-xl shadow-xl flex items-center gap-sm border border-outline-variant">
                  <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-secondary-container">
                      trending_up
                    </span>
                  </div>
                  <div>
                    <p className="font-label-xs text-text-low uppercase">
                      Efisiensi
                    </p>
                    <p className="font-label-md text-text-high">
                      +85% Lebih Cepat
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="fitur"
          className="py-xl px-margin-page bg-surface-container-low/50"
        >
          <div className="container mx-auto">
            <div className="text-center mb-xl">
              <h2 className="font-headline-md text-headline-md text-text-high mb-sm">
                Fitur Unggulan Sistem
              </h2>
              <p className="text-text-low font-body-lg max-w-2xl mx-auto">
                Dirancang untuk memudahkan pekerjaan operator sekolah dalam
                menyusun laporan pertanggungjawaban yang akurat.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
              {/* Feature 1: BKU */}
              <div className="md:col-span-2 group relative bg-surface-container-lowest p-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-outline-variant overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-2xl flex items-center justify-center mb-md group-hover:rotate-12 transition-transform">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    account_balance_wallet
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-high mb-sm">
                  Manajemen BKU
                </h3>
                <p className="text-text-low font-body-sm mb-lg">
                  Pencatatan Buku Kas Umum yang sinkron secara otomatis dengan
                  saldo bank dan kas tunai. Validasi saldo real-time untuk
                  mencegah selisih.
                </p>
                <div className="flex items-center gap-xs text-primary font-label-md cursor-pointer">
                  Pelajari Selengkapnya{" "}
                  <span className="material-symbols-outlined text-sm">
                    arrow_outward
                  </span>
                </div>
              </div>
              {/* Feature 2: Cetak Otomatis */}
              <div className="group bg-surface-container-lowest p-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-outline-variant">
                <div className="w-14 h-14 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mb-md group-hover:-translate-y-1 transition-transform">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    print
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-high mb-sm">
                  Cetak Otomatis
                </h3>
                <p className="text-text-low font-body-sm">
                  Generate Dokumen SPJ (K7, BKU, Pajak) hanya dengan satu klik.
                  Format sesuai regulasi terbaru.
                </p>
              </div>
              {/* Feature 3: Realisasi */}
              <div className="group bg-surface-container-lowest p-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-outline-variant">
                <div className="w-14 h-14 bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl flex items-center justify-center mb-md group-hover:-translate-y-1 transition-transform">
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    trending_up
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-high mb-sm">
                  Laporan Realisasi
                </h3>
                <p className="text-text-low font-body-sm">
                  Monitoring anggaran vs realisasi secara visual melalui grafik
                  interaktif yang mudah dipahami.
                </p>
              </div>
              {/* Feature 4: Arsip Digital */}
              <div className="md:col-span-2 group bg-surface-container-lowest p-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-outline-variant">
                <div className="w-14 h-14 bg-surface-container-high text-on-surface rounded-2xl flex items-center justify-center mb-md group-hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>inventory_2</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-high mb-sm">Arsip Digital &amp; Keamanan Data</h3>
                <p className="text-text-low font-body-sm mb-md">
                  Simpan semua bukti dukung dan nota dalam format digital secara aman. Backup harian otomatis untuk memastikan data sekolah Anda tidak akan pernah hilang.
                </p>
                <div className="flex gap-md">
                  <div className="flex items-center gap-xs text-text-low text-xs">
                    <span className="material-symbols-outlined text-secondary text-lg">encrypted</span>
                    AES-256 Encrypted
                  </div>
                  <div className="flex items-center gap-xs text-text-low text-xs">
                    <span className="material-symbols-outlined text-secondary text-lg">cloud_done</span>
                    Daily Backup
                  </div>
                </div>
              </div>
              {/* Feature 5: Info Terkini */}
              <div className="md:col-span-2 group bg-surface-container-lowest p-lg rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-outline-variant">
                <div className="w-14 h-14 bg-primary-fixed text-on-primary-fixed rounded-2xl flex items-center justify-center mb-md group-hover:-translate-y-1 transition-transform">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>newsmode</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-text-high mb-sm">Info Terkini &amp; Regulasi</h3>
                <p className="text-text-low font-body-sm mb-md">
                  Pantau berita terbaru, peraturan pendidikan, dan layanan terkini yang selalu diperbarui untuk mendukung tugas operator sekolah.
                </p>
                <div className="space-y-sm">
                  <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-primary text-lg">campaign</span>
                    <div>
                      <p className="font-label-xs text-text-high">Perbaruan Regulasi BOS 2025</p>
                      <p className="text-text-low text-[10px]">15 Juni 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
                    <span className="material-symbols-outlined text-secondary text-lg">tips_and_updates</span>
                    <div>
                      <p className="font-label-xs text-text-high">Tips Cetak SPJ yang Benar</p>
                      <p className="text-text-low text-[10px]">10 Juni 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="tentang" className="py-xl px-margin-page bg-surface">
          <div className="container mx-auto">
            <div className="grid md:grid-cols-2 gap-xl items-center">
              <div className="order-2 md:order-1">
                <div className="rounded-[2.5rem] shadow-2xl w-full h-[400px] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-primary text-8xl mb-4 block">
                      school
                    </span>
                    <p className="font-headline-md text-primary font-semibold">
                      Tim Operator Sekolah
                    </p>
                    <p className="text-text-low text-sm mt-1">
                      Profesional &amp; Terpercaya
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 space-y-md">
                <h2 className="font-headline-md text-headline-md text-text-high">
                  Tentang Platform Kami
                </h2>
                <p className="text-text-low font-body-lg">
                  Dikembangkan atas inisiasi untuk digitalisasi birokrasi
                  sekolah, SPJ BOS/BOSP hadir untuk menjawab tantangan
                  administrasi keuangan yang seringkali membebani tenaga
                  pendidik. Kami percaya bahwa dengan sistem yang tepat, sekolah
                  bisa lebih fokus pada kualitas pendidikan siswa.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md">
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      support_agent
                    </span>
                    <div>
                      <h4 className="font-label-md text-text-high">
                        Dukungan Teknis 24/7
                      </h4>
                      <p className="text-body-sm text-text-low">
                        Tim ahli kami siap membantu Anda kapan saja melalui chat
                        atau telepon.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-sm">
                    <span className="material-symbols-outlined text-primary">
                      update
                    </span>
                    <div>
                      <h4 className="font-label-md text-text-high">
                        Update Regulasi Berkala
                      </h4>
                      <p className="text-body-sm text-text-low">
                        Sistem selalu mengikuti Permendikbud dan regulasi
                        keuangan terbaru.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="pt-lg border-t border-outline-variant"
                  id="kontak"
                >
                  <h4 className="font-label-md text-text-high mb-sm">
                    Hubungi Kami
                  </h4>
                  <div className="flex flex-wrap gap-md">
                    <a
                      className="flex items-center gap-xs text-text-low hover:text-primary transition-colors"
                      href="#"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        mail
                      </span>{" "}
                      help@spjbosp.go.id
                    </a>
                    <a
                      className="flex items-center gap-xs text-text-low hover:text-primary transition-colors"
                      href="#"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        call
                      </span>{" "}
                      (021) 1234-5678
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl px-margin-page">
          <div className="container mx-auto">
            <div className="bg-primary-container text-on-primary-container p-xl rounded-[3rem] text-center space-y-md relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-headline-lg text-headline-lg text-white">
                  Siap Mendigitalisasi Keuangan Sekolah?
                </h2>
                <p className="text-white/80 max-w-xl mx-auto font-body-lg">
                  Gabung bersama ribuan sekolah lainnya yang telah meningkatkan
                  efisiensi pelaporan mereka.
                </p>
                <div className="pt-md">
                  <Link
                    to="/login"
                    className="bg-white text-primary px-xl py-md rounded-2xl font-label-md text-lg shadow-xl hover:bg-surface-variant transition-all active:scale-95 inline-block"
                  >
                    Daftar Sekarang Secara Gratis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-on-background text-white py-lg px-margin-page">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px]">
                school
              </span>
            </div>
            <span className="font-headline-sm text-headline-sm font-bold">
              SPJ BOS/BOSP
            </span>
          </div>
          <p className="text-white/60 font-body-sm">
            &copy; {new Date().getFullYear()} SPJ BOS/BOSP Indonesia. Seluruh
            hak cipta dilindungi undang-undang.
          </p>
          <div className="flex gap-lg">
            <a
              className="text-white/60 hover:text-white transition-colors"
              href="#"
            >
              Syarat &amp; Ketentuan
            </a>
            <a
              className="text-white/60 hover:text-white transition-colors"
              href="#"
            >
              Kebijakan Privasi
            </a>
          </div>
        </div>
      </footer>

      {/* Back to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-lg right-lg w-12 h-12 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 z-50 ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </button>
    </div>
  );
}
