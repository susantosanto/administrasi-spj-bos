import { Link } from "react-router-dom";
import {
  FileText,
  FolderOpen,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import PageContainer from "../../ui/organisms/PageContainer";
import PageHeader from "../../ui/organisms/PageHeader";
import Card from "../../ui/molecules/Card";
import Badge from "../../ui/atoms/Badge";
import Button from "../../ui/atoms/Button";

export default function DashboardHome() {
  const stats = [
    { label: "Dokumen LPJ", value: "26+", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Kelengkapan", value: "15+", icon: FolderOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Template Cetak", value: "18", icon: Printer, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Foto AI", value: "Baru", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Beranda Utama"
        description="Ringkasan fitur dan aktivitas aplikasi LPJ BOS/BOSP."
      />

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-8 md:p-12 mb-8 shadow-lg">
        {/* Motif dekoratif */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "url('/floral-pattern.svg')",
            backgroundSize: "400px 400px",
            filter: "brightness(0) invert(1)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <Badge variant="default" className="bg-white/20 text-white mb-4 border-none">
            Sistem Informasi
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            LPJ BOS/BOSP
          </h1>
          <p className="text-primary-soft text-base md:text-lg mb-8 max-w-xl">
            Aplikasi pencetakan dokumen pertanggungjawaban dana BOS/BOSP.
            Lengkapi semua dokumen Anda dengan mudah, cepat, dan profesional.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard/dokumen-lpj">
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100 border-none">
                Mulai Cetak Dokumen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-text-high">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Menu Cepat */}
      <h2 className="font-display text-xl font-bold text-text-high mb-4">
        Akses Cepat
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/dashboard/dokumen-lpj" className="group">
          <Card className="p-6 h-full hover:border-primary/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-text-high mb-2">
              Dokumen LPJ
            </h3>
            <p className="text-sm text-text-muted">
              Buat dan cetak 26+ dokumen pertanggungjawaban BOS/BOSP.
            </p>
          </Card>
        </Link>
        <Link to="/dashboard/dokumen-kelengkapan" className="group">
          <Card className="p-6 h-full hover:border-primary/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-display font-semibold text-text-high mb-2">
              Dokumen Kelengkapan
            </h3>
            <p className="text-sm text-text-muted">
              Kelola 15+ dokumen wajib pendukung LPJ sekolah Anda.
            </p>
          </Card>
        </Link>
        <Link to="/dashboard/bku" className="group">
          <Card className="p-6 h-full hover:border-primary/50 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="font-display font-semibold text-text-high mb-2">
              Data BKU
            </h3>
            <p className="text-sm text-text-muted">
              Upload dan kelola Buku Kas Umum dari ARKAS secara otomatis.
            </p>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
