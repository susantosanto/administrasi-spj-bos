import { cn } from "../cn";

const variants = {
  default: "bg-surface-muted text-text-muted",
  primary: "bg-primary-soft text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
  outline: "bg-transparent border border-border text-text-muted",
};

const sizes = {
  sm: "h-5 px-2 text-xs",
  md: "h-6 px-2.5 text-xs",
  lg: "h-7 px-3 text-sm",
};

export default function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...rest
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1",
        "rounded-full font-medium whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
