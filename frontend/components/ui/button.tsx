import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-emovert-cyan text-emovert-darker hover:bg-emovert-cyan/90 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-emovert-cyan/30 bg-transparent text-emovert-cyan hover:bg-emovert-cyan/10 hover:border-emovert-cyan/50",
        secondary:
          "bg-white/5 text-white hover:bg-white/10",
        ghost:
          "hover:bg-white/5 text-white/70 hover:text-white",
        link:
          "text-emovert-cyan underline-offset-4 hover:underline",
        glow:
          "bg-gradient-to-r from-emovert-cyan to-emovert-purple text-white hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        xl: "h-14 px-8 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
