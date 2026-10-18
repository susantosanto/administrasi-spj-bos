import { GraduationCap } from "lucide-react";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] bg-bg flex flex-col items-center justify-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 animate-pulse">
        <GraduationCap className="w-8 h-8 text-on-primary" />
      </div>
      <h1 className="font-display text-2xl font-bold text-text-high mb-2">
        LPJ BOS/BOSP
      </h1>
      <p className="text-sm text-text-muted mb-6">Memuat aplikasi...</p>

      {/* Progress bar halus */}
      <div className="w-48 h-1 bg-surface-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[progress_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
