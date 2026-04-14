import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
}

export const buttonStyles = ({
  variant = "primary",
  fullWidth,
  className
}: Pick<ButtonProps, "variant" | "fullWidth" | "className"> = {}) =>
  cn(
    "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    variant === "primary" && "bg-sage-700 text-white shadow-card hover:bg-sage-800",
    variant === "secondary" &&
      "bg-white text-ink ring-1 ring-sage-200 hover:bg-sage-50",
    variant === "ghost" && "bg-transparent text-sage-700 hover:bg-sage-100/70",
    fullWidth && "w-full",
    className,
  );

export const Button = ({
  children,
  className,
  variant = "primary",
  fullWidth,
  ...props
}: ButtonProps) => (
  <button className={buttonStyles({ variant, fullWidth, className })} {...props}>
    {children}
  </button>
);
