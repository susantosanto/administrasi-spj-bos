import { cn } from "../cn";
import Breadcrumb from "../molecules/Breadcrumb";

export default function PageHeader({
  title,
  description,
  breadcrumbItems = [],
  actions = null,
  className,
  ...rest
}) {
  return (
    <div className={cn("mb-6", className)} {...rest}>
      {breadcrumbItems.length > 0 && (
        <div className="mb-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {title && (
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-text-high leading-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="mt-1.5 text-sm text-text-muted">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
