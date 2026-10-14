import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../cn";

const Select = forwardRef(function Select(
  { error = false, className, children, ...rest },
  ref
) {
  return (
    <div className="relative w-full">
      <select
        ref={ref}
        className={cn(
          "w-full h-10 pl-3 pr-9 rounded-md text-sm appearance-none",
          "bg-surface text-text-high",
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
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-low pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

export default Select;
