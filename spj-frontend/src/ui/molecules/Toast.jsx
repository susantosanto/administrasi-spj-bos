import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { cn } from "../cn";

const ToastContext = createContext(null);

const variants = {
  info: {
    container: "bg-info/10 border-info/20 text-info",
    icon: Info,
  },
  success: {
    container: "bg-success/10 border-success/20 text-success",
    icon: CheckCircle2,
  },
  warning: {
    container: "bg-warning/10 border-warning/20 text-warning",
    icon: AlertTriangle,
  },
  danger: {
    container: "bg-danger/10 border-danger/20 text-danger",
    icon: AlertCircle,
  },
};

// ─── Single Toast Item ─────────────────────────────────────────
function ToastItem({ id, variant = "info", title, message, duration, onClose }) {
  const config = variants[variant];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-auto flex items-start gap-3 p-3 rounded-md border shadow-lg",
        "bg-surface",
        "animate-slide-in-right",
        config.container
      )}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm">{title}</p>}
        {message && (
          <div className={cn("text-sm", title && "mt-0.5 opacity-90")}>
            {message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        aria-label="Tutup"
        className={cn(
          "shrink-0 p-1 rounded-md transition-colors",
          "hover:bg-black/5 dark:hover:bg-white/10"
        )}
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Container (Portal) ────────────────────────────────────────
function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[1060] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
      aria-label="Notifikasi"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

// ─── Provider ──────────────────────────────────────────────────
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ variant = "info", title, message, duration = 4000 }) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
      return id;
    },
    []
  );

  const value = {
    toast,
    success: (opts) => toast({ ...opts, variant: "success" }),
    error: (opts) => toast({ ...opts, variant: "danger" }),
    warning: (opts) => toast({ ...opts, variant: "warning" }),
    info: (opts) => toast({ ...opts, variant: "info" }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within <ToastProvider>");
  }
  return ctx;
}
