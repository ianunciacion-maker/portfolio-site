import { cn } from "@/lib/utils";

interface TechBadgeProps {
  name: string;
  className?: string;
}

export function TechBadge({ name, className }: TechBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-bg-tertiary/60 text-text-secondary dark:bg-white/10 dark:text-text-secondary",
        "border border-[var(--glass-border)]",
        className
      )}
    >
      {name}
    </span>
  );
}
