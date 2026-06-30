"use client";

import Link from "next/link";
import { HelpTip } from "@/components/HelpTip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HeaderAction({
  icon: Icon,
  label,
  help,
  onClick,
  active,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  help: string;
  onClick?: () => void;
  active?: boolean;
  href?: string;
}) {
  const cls = cn(
    "h-8 gap-1 px-2 text-xs font-normal",
    active && "bg-[var(--accent-soft)] text-[var(--accent)]",
  );

  const actionButton = (
    <Button type="button" variant="ghost" size="sm" className={cls} onClick={onClick}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </Button>
  );

  return (
    <div className="inline-flex items-center gap-0.5">
      {href ? <Link href={href}>{actionButton}</Link> : actionButton}
      <HelpTip text={help} />
    </div>
  );
}
