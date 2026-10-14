import { forwardRef } from "react";
import { cn } from "../cn";

const variants = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover active:scale-95",
  secondary:
    "bg-surface text-text-high border border-border hover:bg-surface-muted hover:border-border-strong active:scale-95",
  ghost:
    "bg-transparent text-text-muted hover:bg-surface-muted hover:text-text-high active:scale-95",
  danger:
    "bg-transparent text-danger hover:bg-danger/10 active:scale-95",
};

const sizes = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

const IconButton = forwardRef(function IconButton(
  {
    variant = "ghost",
    size = "md",
    icon: Icon,
    label,
    className,
    ...rest
  },
  ref
) {
  if (!label) {
    console.warn(
      "IconButton: 'label' prop is required for accessibility. " +
        "It will be used as aria-label."
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        "transition-all duration-150 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {Icon && <Icon className={iconSizes[size]} aria-hidden="true" />}
    </button>
  );
});

export default IconButton;
