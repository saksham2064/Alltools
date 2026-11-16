import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 rounded-lg text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28B45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FFFAF6] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#F28B45] text-white hover:bg-[#DF7731] active:bg-[#CE6924] shadow-[0_1px_2px_rgba(32,32,32,0.08)]",
        secondary:
          "bg-white text-[#202020] border border-[#EEE8E2] hover:bg-[#FAF3EC] hover:border-[#E2D8CE]",
        outline:
          "border border-[#EEE8E2] bg-transparent text-[#202020] hover:bg-[#FAF3EC]",
        ghost:
          "text-[#202020] hover:bg-[#FAF3EC]",
        subtle:
          "bg-[#FEF2E9] text-[#C8601C] border border-[#FADAC2] hover:bg-[#FCE6D5]",
        destructive:
          "bg-[#C93B3B] text-white hover:bg-[#B22E2E]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 px-3.5 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
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
