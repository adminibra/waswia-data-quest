import { cn } from "@/lib/utils";

export function WaswiaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center bg-card px-3 py-2 shadow-sm", className)} aria-label="WASWIA">
      <span className="text-[13px] font-bold text-logo">WA</span>
      <span className="text-[13px] font-bold text-logo-accent">SWIA</span>
    </div>
  );
}