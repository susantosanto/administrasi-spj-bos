import { useState } from "react";
import { cn } from "../cn";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  sidebarItems = [],
  activeId = null,
  onItemClick,
  sidebarLogo = null,
  sidebarFooter = null,
  breadcrumbItems = [],
  theme = "light",
  onThemeToggle,
  user = null,
  userMenuItems = [],
  topbarActions = null,
  children,
  className,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleItemClick = (id, item) => {
    onItemClick?.(id, item);
    setMobileOpen(false);
  };

  return (
    <div className={cn("flex h-screen bg-bg overflow-hidden", className)}>
      {/* Sidebar — desktop + mobile drawer */}
      <Sidebar
        items={sidebarItems}
        activeId={activeId}
        onItemClick={handleItemClick}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        logo={sidebarLogo}
        footer={sidebarFooter}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMobileMenuToggle={() => setMobileOpen(true)}
          breadcrumbItems={breadcrumbItems}
          theme={theme}
          onThemeToggle={onThemeToggle}
          user={user}
          userMenuItems={userMenuItems}
          actions={topbarActions}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
