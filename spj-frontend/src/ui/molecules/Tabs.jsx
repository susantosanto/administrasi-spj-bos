import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "../cn";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, value: controlledValue, onChange, children, className }) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue) => {
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div className={cn("flex flex-col gap-4", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className, ...rest }) {
  const ref = useRef(null);

  const handleKeyDown = (e) => {
    if (!ref.current) return;
    const tabs = Array.from(ref.current.querySelectorAll('[role="tab"]'));
    const currentIndex = tabs.findIndex((t) => t === document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    else if (e.key === "ArrowLeft")
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIndex = 0;
    else if (e.key === "End") nextIndex = tabs.length - 1;
    else return;

    e.preventDefault();
    tabs[nextIndex].focus();
    tabs[nextIndex].click();
  };

  return (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        "flex items-center gap-1 border-b border-border",
        className
      )}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Tab({ value, children, className, ...rest }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab must be inside <Tabs>");

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      tabIndex={isActive ? 0 : -1}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors",
        "border-b-2 -mb-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 rounded-t-md",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-text-muted hover:text-text-high hover:border-border-strong",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children, className, ...rest }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be inside <Tabs>");

  if (ctx.value !== value) return null;

  return (
    <div role="tabpanel" className={cn("text-sm text-text-high", className)} {...rest}>
      {children}
    </div>
  );
}
