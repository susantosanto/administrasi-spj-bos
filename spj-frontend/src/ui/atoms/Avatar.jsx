import { useState } from "react";
import { cn } from "../cn";

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  src,
  alt = "",
  name = "",
  size = "md",
  className,
  ...rest
}) {
  const [imageError, setImageError] = useState(false);
  const showImage = src && !imageError;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full overflow-hidden",
        "bg-primary-soft text-primary font-semibold",
        "ring-2 ring-surface",
        "select-none shrink-0",
        sizes[size],
        className
      )}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
