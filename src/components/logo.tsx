import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M7 23.5 16 9l9 14.5" fill="none" stroke="#E4F25A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M10.2 23.5 16 14.2l5.8 9.3" fill="none" stroke="#E4F25A" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("font-heading text-2xl font-semibold tracking-tight", light ? "text-white" : "text-foreground", className)}>
      HiVis
    </span>
  );
}
