import { forwardRef } from "react";
import { cn } from "../cn";

const Radio = forwardRef(function Radio(
  { label, className, id, ...rest },
  ref
) {
  const inputId = id || `radio-${Math.random().toString(36).slice(2, 9)}`;

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
      <input
        ref={ref}
        id={inputId}
        type="radio"
        className={cn(
          "appearance-none w-5 h-5 rounded-full border-2 transition-colors",
          "border-border-strong checked:border-primary",
          "checked:bg-primary checked:shadow-[inset_0_0_0_3px_var(--color-surface)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          "hover:border-primary disabled:cursor-not-allowed"
        )}
        {...rest}
      />
      {label && <span>{label}</span>}
    </label>
  );
});

export default Radio;
