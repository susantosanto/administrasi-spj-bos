import { cn } from "../cn";

export default function Divider({
  orientation = "horizontal",
  label,
  className,
  ...rest
}) {
  const isHorizontal = orientation === "horizontal";

  if (label) {
    return (
      <div
        role="separator"
        className={cn(
          "flex items-center gap-3 text-xs text-text-low",
          isHorizontal ? "w-full" : "flex-col h-full",
          className
        )}
        {...rest}
      >
        <span
          className={cn(
            "bg-border",
            isHorizontal ? "flex-1 h-px" : "flex-1 w-px"
          )}
          aria-hidden="true"
        />
        <span className="whitespace-nowrap">{label}</span>
        <span
          className={cn(
            "bg-border",
            isHorizontal ? "flex-1 h-px" : "flex-1 w-px"
          )}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "bg-border",
        isHorizontal ? "w-full h-px" : "h-full w-px",
        className
      )}
      {...rest}
    />
  );
}
