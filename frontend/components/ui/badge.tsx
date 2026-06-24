import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emovert-cyan/20 text-emovert-cyan hover:bg-emovert-cyan/30",
        secondary:
          "border-transparent bg-white/5 text-white/70 hover:bg-white/10",
        destructive:
          "border-transparent bg-red-500/20 text-red-400 hover:bg-red-500/30",
        outline: "text-white/70 border-white/20",
        success:
          "border-transparent bg-emovert-green/20 text-emovert-green hover:bg-emovert-green/30",
        warning:
          "border-transparent bg-emovert-orange/20 text-emovert-orange hover:bg-emovert-orange/30",
        glow:
          "border-transparent bg-gradient-to-r from-emovert-cyan/20 to-emovert-purple/20 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
