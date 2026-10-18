import { cn } from "../cn";
import Button from "../atoms/Button";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in", className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-surface-muted flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-text-low" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-text-high mb-2">
        {title}
      </h3>
      <p className="text-sm text-text-muted max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
