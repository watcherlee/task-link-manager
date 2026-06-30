"use client";

import { cn } from "@/lib/utils";

export function MobileStageTabs({
  value,
  onValueChange,
  items,
}: {
  value: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 md:hidden">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors",
            value === item.value
              ? "bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
