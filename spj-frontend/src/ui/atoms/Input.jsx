import { forwardRef } from "react";
import { cn } from "../cn";

const Input = forwardRef(function Input(
  { error = false, className, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full h-10 px-3 rounded-md text-sm",
        "bg-surface text-text-high placeholder:text-text-low",
        "border transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-muted",
        error
          ? "border-danger focus:border-danger focus:ring-danger/20"
          : "border-border hover:border-border-strong",
        className
      )}
      aria-invalid={error || undefined}
      {...rest}
    />
  );
});

export default Input;
