import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../cn";

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  full: "max-w-5xl",
};

export default function Modal({
  open,
  onClose,
  size = "md",
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  children,
  className,
  ...rest
}) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Save & restore focus
  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      setTimeout(() => {
        if (dialogRef.current) {
          const focusable = dialogRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          focusable?.focus();
        }
      }, 0);
    } else {
      previousActiveElement.current?.focus?.();
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Escape + focus trap
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1050] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        className={cn(
          "relative w-full glass-strong rounded-xl shadow-lg",
          "animate-slide-in-up",
          sizes[size],
          className
        )}
        {...rest}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border">
            {title && (
              <h2
                id="modal-title"
                className="font-display text-xl font-semibold text-text-high"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className={cn(
                  "p-1.5 -m-1.5 rounded-md transition-colors shrink-0",
                  "text-text-muted hover:text-text-high hover:bg-surface-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                )}
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export function ModalFooter({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 mt-6 -mx-6 -mb-6 px-6 py-4 border-t border-border bg-surface-muted",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
