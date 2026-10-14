import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "../cn";

export default function Dropdown({ trigger, children, align = "left", className }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const triggerElement = isValidElement(trigger)
    ? cloneElement(trigger, {
        onClick: (e) => {
          e?.stopPropagation();
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
        "aria-haspopup": "menu",
        "aria-expanded": open,
      })
    : trigger;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      {triggerElement}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full mt-1 z-[1000] min-w-[180px]",
            "bg-surface border border-border rounded-md shadow-lg",
            "py-1 animate-fade-in",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, disabled, className, ...rest }) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm text-left",
        "text-text-high transition-colors",
        "hover:bg-surface-muted focus:bg-surface-muted focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
        className
      )}
      {...rest}
    >
      {Icon && <Icon className="w-4 h-4 text-text-muted" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function DropdownSeparator({ className, ...rest }) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
      {...rest}
    />
  );
}
