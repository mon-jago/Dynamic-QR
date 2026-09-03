import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[3px] transition-colors disabled:pointer-events-none cursor-pointer font-axiforma disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        lofi: "bg-black-600 text-primary-foreground hover:bg-black-700",
      },
      size: {
        sm: "py-2 px-3.5 font-b2",
        md: "py-2.5 px-4 font-b2",
        lg: "py-2.5 px-4.5 font-b1",
        xl: "py-3 px-5 font-b1",
        xxl: "py-4 px-7 font-b1",
        iconsm: "p-2",
        iconmd: "p-2.5",
        iconlg: "p-3",
        iconxl: "p-3.5",
        icon2xl: "p-4",
      },
    },
    defaultVariants: {
      variant: "lofi",
      size: "sm",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    isActive?: boolean;
  };

function Button({
  className,
  variant,
  size,
  isActive,
  ...props
}: ButtonProps) {
  return (
    <button
      data-active={isActive ? "true" : undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };