import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "../cn";

const widths = {
  expanded: "w-60",   // 240px
  collapsed: "w-16",  // 64px
};

export default function Sidebar({
  items = [],
  activeId = null,
  onItemClick,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onMobileClose,
  logo = null,
  footer = null,
  className,
}) {
  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeId === item.id;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onItemClick?.(item.id, item)}
        title={collapsed ? item.label : undefined}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md",
          "text-sm font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          isActive
            ? "bg-primary text-on-primary shadow-sm"
            : "text-text-muted hover:bg-surface-muted hover:text-text-high",
          collapsed && "justify-center px-0"
        )}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />}
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto text-xs bg-primary-soft text-primary px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  const renderContent = (isMobile = false) => {
    const isCollapsed = isMobile ? false : collapsed;

    return (
      <>
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 px-4 border-b border-border shrink-0",
            isCollapsed && "justify-center px-2"
          )}
        >
          {logo ? (
            logo
          ) : (
            <span className="font-display text-lg font-bold text-text-high">
              {isCollapsed ? "S" : "SPJ"}
            </span>
          )}

          {!isMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                "text-text-muted hover:text-text-high hover:bg-surface-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                isCollapsed ? "ml-0 mt-2 absolute top-16" : "ml-auto"
              )}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              ) : (
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          )}

          {isMobile && onMobileClose && (
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Tutup menu"
              className={cn(
                "ml-auto p-1.5 rounded-md transition-colors",
                "text-text-muted hover:text-text-high hover:bg-surface-muted"
              )}
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto p-3 space-y-1"
          aria-label="Navigasi utama"
        >
          {items.map(renderNavItem)}
        </nav>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "border-t border-border p-3 shrink-0",
              isCollapsed && "px-1"
            )}
          >
            {footer}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen",
          "sidebar-elevated dark:glass dark:border-0 dark:shadow-none",
          "transition-all duration-200 ease-out shrink-0",
          widths[collapsed ? "collapsed" : "expanded"],
          className
        )}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1040] lg:hidden animate-fade-in"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside
            className={cn(
              "fixed top-0 left-0 h-screen w-60 z-[1045]",
              "sidebar-elevated dark:glass dark:border-0",
              "flex flex-col lg:hidden animate-slide-in-right"
            )}
          >
            {renderContent(true)}
          </aside>
        </>
      )}
    </>
  );
}
