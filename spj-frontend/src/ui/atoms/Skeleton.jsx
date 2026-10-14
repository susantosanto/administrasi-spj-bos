import { cn } from "../cn";

export default function Skeleton({
  variant = "rect",
  width,
  height,
  className,
  ...rest
}) {
  const base = "animate-pulse bg-surface-muted";

  const variants = {
    text: "h-4 rounded-sm",
    circle: "rounded-full",
    rect: "rounded-md",
  };

  const style = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={cn(base, variants[variant], className)}
      style={style}
      aria-hidden="true"
      {...rest}
    />
  );
}
