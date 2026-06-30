import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: React.ReactNode;
  variant?: "default" | "platform";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium",
        variant === "default" &&
          "bg-[#ebe6dc] text-[var(--muted)]",
        variant === "platform" &&
          "bg-[#dce8f5] text-[#4a6a8a]",
        className,
      )}
    >
      {children}
    </span>
  );
}
