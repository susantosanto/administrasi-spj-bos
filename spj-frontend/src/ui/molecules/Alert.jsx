import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "../cn";

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

export default function Alert({
  variant = "info",
  title,
  children,
  onClose,
  className,
  ...rest
}) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-3 rounded-md border",
        config.container,
        className
      )}
      {...rest}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm">{title}</p>
        )}
        {children && (
          <div className={cn("text-sm", title && "mt-0.5 opacity-90")}>
            {children}
          </div>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className={cn(
            "shrink-0 p-1 rounded-md transition-colors",
            "hover:bg-black/5 dark:hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
          )}
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
