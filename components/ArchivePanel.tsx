"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/types";

export function ArchivePanel({ onChanged }: { onChanged?: () => void }) {
  const t = useTranslations("archive");
  const ta = useTranslations("actions");
  const [tasks, setTasks] = useState<Task[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/archive");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <h2 className="font-display mb-3 text-sm font-semibold">{t("title")}</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{t("empty")}</p>
      ) : (
        <ul className="max-h-64 space-y-2 overflow-y-auto">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{task.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {task.tags.map((tag) => (
                    <Badge key={tag.id}>{tag.name}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await fetch(`/api/tasks/${task.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ done: false, stage: "inbox" }),
                    });
                    load();
                    onChanged?.();
                  }}
                >
                  {ta("restore")}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
                    load();
                    onChanged?.();
                  }}
                >
                  {ta("delete")}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
