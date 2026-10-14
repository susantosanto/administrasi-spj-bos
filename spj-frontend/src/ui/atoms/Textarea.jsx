import { forwardRef } from "react";
import { cn } from "../cn";

const Textarea = forwardRef(function Textarea(
  { error = false, rows = 4, className, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        "w-full px-3 py-2 rounded-md text-sm resize-y",
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

export default Textarea;
