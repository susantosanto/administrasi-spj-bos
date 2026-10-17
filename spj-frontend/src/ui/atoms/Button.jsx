import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../cn";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:scale-[0.98] shadow-sm",
  secondary: "bg-surface text-text-high border border-border hover:bg-surface-muted hover:border-border-strong active:scale-[0.98]",
  ghost: "bg-transparent text-text-muted hover:bg-surface-muted hover:text-text-high active:scale-[0.98]",
  danger: "bg-danger text-white hover:opacity-90 active:scale-[0.98] shadow-sm",
};

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className,
    children,
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-semibold",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export default Button;
