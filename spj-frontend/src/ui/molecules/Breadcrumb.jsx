import { ChevronRight } from "lucide-react";
import { cn } from "../cn";

export default function Breadcrumb({ items = [], className, ...rest }) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
      {...rest}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Component = item.href && !isLast ? "a" : "span";

          return (
            <li key={index} className="flex items-center gap-1.5">
              <Component
                href={item.href}
                onClick={item.onClick}
                aria-current={isLast ? "page" : undefined}
                className={cn(
                  "transition-colors truncate max-w-[200px]",
                  isLast
                    ? "text-text-high font-medium"
                    : item.href
                    ? "text-text-muted hover:text-primary cursor-pointer"
                    : "text-text-muted"
                )}
              >
                {item.label}
              </Component>

              {!isLast && (
                <ChevronRight
                  className="w-4 h-4 text-text-low shrink-0"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
