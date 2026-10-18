import { GraduationCap } from "lucide-react";
import { cn } from "../ui/cn";

export default function TransitionOverlay({ show, message = "Memuat..." }) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-bg transition-opacity duration-300",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 animate-pulse">
        <GraduationCap className="w-8 h-8 text-on-primary" />
      </div>
      <p className="font-display text-lg font-semibold text-text-high mb-2">
        LPJ BOS/BOSP
      </p>
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  );
}
