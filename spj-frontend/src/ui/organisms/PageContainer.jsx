import { cn } from "../cn";

const sizes = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  full: "max-w-full",
};

export default function PageContainer({
  size = "lg",
  padding = "md",
  className,
  children,
  ...rest
}) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-4 lg:p-6",
    lg: "p-6 lg:p-8",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto",
        sizes[size],
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
