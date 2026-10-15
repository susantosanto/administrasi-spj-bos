import { Menu, Sun, Moon } from "lucide-react";
import { cn } from "../cn";
import Breadcrumb from "../molecules/Breadcrumb";
import Dropdown, { DropdownItem, DropdownSeparator } from "../molecules/Dropdown";
import Avatar from "../atoms/Avatar";
import IconButton from "../atoms/IconButton";

export default function Topbar({
  onMobileMenuToggle,
  breadcrumbItems = [],
  theme = "light",
  onThemeToggle,
  user = null,
  userMenuItems = [],
  actions = null,
  className,
}) {
  return (
    <header
      className={cn(
        "h-16 flex items-center gap-4 px-4 lg:px-6",
        "glass-sticky sticky top-0 z-10 shrink-0",
        className
      )}
    >
      {/* Mobile menu toggle */}
      {onMobileMenuToggle && (
        <IconButton
          icon={Menu}
          label="Buka menu"
          variant="ghost"
          size="md"
          onClick={onMobileMenuToggle}
          className="lg:hidden"
        />
      )}

      {/* Breadcrumb */}
      <div className="flex-1 min-w-0">
        {breadcrumbItems.length > 0 && (
          <Breadcrumb items={breadcrumbItems} />
        )}
      </div>

      {/* Actions slot */}
      {actions && <div className="flex items-center gap-2">{actions}</div>}

      {/* Theme toggle */}
      {onThemeToggle && (
        <IconButton
          icon={theme === "dark" ? Sun : Moon}
          label={theme === "dark" ? "Mode terang" : "Mode gelap"}
          variant="ghost"
          size="md"
          onClick={onThemeToggle}
        />
      )}

      {/* User menu */}
      {user && (
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 rounded-md p-1 pr-2 transition-colors",
                "hover:bg-surface-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              )}
            >
              <Avatar
                src={user.avatar}
                name={user.name}
                size="sm"
              />
              <span className="hidden md:block text-sm font-medium text-text-high max-w-[120px] truncate">
                {user.name}
              </span>
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-border">
            <p className="text-sm font-semibold text-text-high truncate">
              {user.name}
            </p>
            {user.email && (
              <p className="text-xs text-text-muted truncate">{user.email}</p>
            )}
          </div>

          {userMenuItems.map((item, index) =>
            item.type === "separator" ? (
              <DropdownSeparator key={`sep-${index}`} />
            ) : (
              <DropdownItem
                key={item.id || index}
                icon={item.icon}
                onClick={item.onClick}
                disabled={item.disabled}
              >
                {item.label}
              </DropdownItem>
            )
          )}
        </Dropdown>
      )}
    </header>
  );
}
