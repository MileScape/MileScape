import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface MapHeroShellProps {
  children: ReactNode;
  className?: string;
  topFadeClassName?: string;
  bottomFadeClassName?: string;
  glowClassName?: string;
  vignetteClassName?: string;
  overlay?: ReactNode;
}

export const MapHeroShell = ({
  children,
  className,
  topFadeClassName,
  bottomFadeClassName,
  glowClassName,
  vignetteClassName,
  overlay,
}: MapHeroShellProps) => (
  <div className={cn("relative overflow-hidden", className)}>
    {children}
    {glowClassName ? <div className={cn("pointer-events-none absolute inset-0", glowClassName)} /> : null}
    {topFadeClassName ? <div className={cn("pointer-events-none absolute inset-x-0 top-0", topFadeClassName)} /> : null}
    {bottomFadeClassName ? <div className={cn("pointer-events-none absolute inset-x-0 bottom-0", bottomFadeClassName)} /> : null}
    {vignetteClassName ? <div className={cn("pointer-events-none absolute inset-0", vignetteClassName)} /> : null}
    {overlay}
  </div>
);
