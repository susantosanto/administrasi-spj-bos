import { cn } from "../cn";

export default function Card({
  variant = "default",
  padding = "md",
  className,
  children,
  ...rest
}) {
  const variants = {
    default: "bg-surface border border-border shadow-sm",
    muted: "bg-surface-muted border border-border",
    elevated: "bg-surface border border-border shadow-md",
    outline: "bg-transparent border border-border",
  };

  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-lg overflow-hidden",
        variants[variant],
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 pb-4 mb-4 border-b border-border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }) {
  return (
    <h3
      className={cn(
        "font-display text-xl font-semibold text-text-high leading-tight",
        className
      )}
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...rest }) {
  return (
    <p
      className={cn("text-sm text-text-muted mt-1", className)}
      {...rest}
    >
      {children}
    </p>
  );
}

export function CardBody({ className, children, ...rest }) {
  return (
    <div className={cn("text-sm text-text-high", className)} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-4 mt-4 border-t border-border",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
