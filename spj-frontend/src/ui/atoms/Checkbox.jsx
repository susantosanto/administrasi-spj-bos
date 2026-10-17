import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "../cn";

const Checkbox = forwardRef(function Checkbox(
  { label, error = false, className, id, ...rest },
  ref
) {
  const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        "text-sm text-text-high",
        rest.disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <span className="relative inline-flex items-center justify-center">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "peer appearance-none w-5 h-5 rounded-sm border transition-colors",
            "checked:bg-primary checked:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            "disabled:cursor-not-allowed",
            error
              ? "border-danger"
              : "border-border-strong hover:border-primary"
          )}
          {...rest}
        />
        <Check
          className="absolute w-3.5 h-3.5 text-on-primary opacity-0 peer-checked:opacity-100 pointer-events-none"
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
});

export default Checkbox;
