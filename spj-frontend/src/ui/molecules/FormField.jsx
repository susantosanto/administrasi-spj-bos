import { cn } from "../cn";

export default function FormField({
  label,
  htmlFor,
  required = false,
  error = null,
  hint = null,
  children,
  className,
  ...rest
}) {
  const hasError = Boolean(error);

  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...rest}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn(
            "text-sm font-medium text-text-high",
            required && "after:content-['*'] after:ml-1 after:text-danger"
          )}
        >
          {label}
        </label>
      )}

      {children}

      {hasError && (
        <p
          role="alert"
          className="text-xs text-danger flex items-start gap-1 mt-0.5"
        >
          {error}
        </p>
      )}

      {!hasError && hint && (
        <p className="text-xs text-text-low">{hint}</p>
      )}
    </div>
  );
}
