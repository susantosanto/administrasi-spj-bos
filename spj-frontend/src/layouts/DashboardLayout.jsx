import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Hash,
  BarChart3,
  BookMarked,
  Settings,
  LogOut,
} from "lucide-react";
import AppShell from "../ui/organisms/AppShell";
import storageHelper from "../utils/storageHelper";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "data-sekolah", label: "Data Sekolah", icon: School, path: "/dashboard/data-sekolah" },
  { id: "data-guru", label: "Data Guru & Tendik", icon: Users, path: "/dashboard/data-guru" },
  { id: "bku", label: "Data BKU", icon: FileSpreadsheet, path: "/dashboard/bku" },
  { id: "dokumen-lpj", label: "Dokumen LPJ", icon: FileText, path: "/dashboard/dokumen-lpj" },
  { id: "dokumen-kelengkapan", label: "Dokumen Kelengkapan", icon: FolderOpen, path: "/dashboard/dokumen-kelengkapan" },
  { id: "nomor-surat", label: "Nomor Surat", icon: Hash, path: "/dashboard/nomor-surat" },
  { id: "realisasi", label: "Realisasi", icon: BarChart3, path: "/dashboard/realisasi" },
  { id: "referensi", label: "Kode Referensi", icon: BookMarked, path: "/dashboard/referensi-kode" },
  { id: "pengaturan", label: "Pengaturan", icon: Settings, path: "/dashboard/pengaturan" },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Operator", email: "operator@sekolah.id" });

  useEffect(() => {
    const userData = storageHelper.get("auth_user");
    if (userData && userData.name) {
      setUser({ name: userData.name, email: "operator@sekolah.id" });
    }
  }, []);

  const activeId =
    navItems.find((item) => location.pathname.startsWith(item.path))?.id ||
    "dashboard";

  const handleItemClick = (id, item) => {
    navigate(item.path);
  };

  const handleLogout = () => {
    storageHelper.set("auth", false);
    navigate("/login");
  };

  const userMenuItems = [
    { id: "settings", label: "Pengaturan Akun", icon: Settings, onClick: () => navigate("/dashboard/pengaturan") },
    { type: "separator" },
    { id: "logout", label: "Keluar", icon: LogOut, onClick: handleLogout },
  ];

  const breadcrumbItems = [
    { label: "Beranda", href: "/dashboard" },
    ...(location.pathname !== "/dashboard"
      ? [{ label: navItems.find((i) => i.id === activeId)?.label }]
      : []),
  ];

  return (
    <AppShell
      sidebarItems={navItems}
      activeId={activeId}
      onItemClick={handleItemClick}
      breadcrumbItems={breadcrumbItems}
      user={user}
      userMenuItems={userMenuItems}
    >
      <Outlet />
    </AppShell>
  );
}
