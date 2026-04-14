import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  className?: string;
}

export const ProgressBar = ({ value, className }: ProgressBarProps) => (
  <div className={cn("h-3 overflow-hidden rounded-full bg-sage-100", className)}>
    <div
      className="h-full rounded-full bg-gradient-to-r from-sage-400 to-sage-700 transition-all duration-700"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
