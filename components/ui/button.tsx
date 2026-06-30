import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "accent";
  size?: "sm" | "md" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50",
          variant === "default" &&
            "bg-[var(--foreground)] text-[var(--surface)] hover:opacity-90",
          variant === "accent" &&
            "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)]",
          variant === "outline" &&
            "border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-white",
          variant === "ghost" &&
            "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--foreground)]",
          variant === "destructive" &&
            "bg-[#c45c4a] text-white hover:bg-[#b04f3f]",
          size === "sm" && "h-8 px-2.5 text-xs",
          size === "md" && "h-9 px-3.5 text-sm",
          size === "icon" && "h-8 w-8",
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
