import { Loader2 } from "lucide-react";
import { cn } from "../cn";

const sizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export default function Spinner({
  size = "md",
  className,
  label = "Memuat...",
  ...rest
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...rest}
    >
      <Loader2
        className={cn("animate-spin text-primary", sizes[size])}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
