import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const glassCardVariants = cva(
  "rounded-2xl backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-[var(--glass-shadow)]",
        subtle:
          "bg-[var(--glass-bg)] border-[var(--glass-border)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      hoverable: {
        true: "hover:scale-[1.02] hover:shadow-xl cursor-pointer",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      hoverable: false,
    },
  }
);

interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

export function GlassCard({
  className,
  variant,
  padding,
  hoverable,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(glassCardVariants({ variant, padding, hoverable }), className)}
      {...props}
    />
  );
}
