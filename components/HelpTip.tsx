"use client";

import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpTip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      <span
        tabIndex={0}
        aria-label={text}
        title={text}
        className="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full text-[var(--muted)]/70 transition-colors hover:bg-[var(--border)]/60 hover:text-[var(--foreground)]"
        onClick={(e) => e.stopPropagation()}
      >
        <CircleHelp className="h-3 w-3" strokeWidth={2} />
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-44 -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-2 py-1.5 text-[10px] leading-snug text-[var(--muted)] opacity-0 shadow-[var(--shadow-sm)] transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}
