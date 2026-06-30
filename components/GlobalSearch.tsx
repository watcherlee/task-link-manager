"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Task, Stage } from "@/lib/types";

export function GlobalSearch({
  onSelect,
}: {
  onSelect?: (task: Task) => void;
}) {
  const t = useTranslations("search");
  const ts = useTranslations("stages");
  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [results, setResults] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (query: string, tagFilter: string) => {
    if (!query && !tagFilter) {
      setResults([]);
      return;
    }
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tagFilter) params.set("tag", tagFilter);
    params.set("includeArchived", "1");
    const res = await fetch(`/api/search?${params}`);
    const data = await res.json();
    setResults(data.tasks ?? []);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => void search(q, tag), 300);
    return () => clearTimeout(timer);
  }, [q, tag, search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
        document.getElementById("global-search-input")?.focus();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stageLabel = (stage: Stage) => {
    if (stage === "archived") return ts("archived");
    return ts(stage);
  };

  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)]">
      <Input
        id="global-search-input"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={`${t("placeholder")} (⌘K)`}
      />
      <Input
        className="mt-2"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        placeholder={t("tagFilter")}
      />
      {open && (q || tag) && (
        <div
          role="listbox"
          className="absolute inset-x-3 top-full z-20 mt-1 max-h-64 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-md)]"
        >
          {results.length === 0 ? (
            <p className="p-3 text-sm text-[var(--muted)]">{t("noResults")}</p>
          ) : (
            results.map((task) => (
              <button
                key={task.id}
                type="button"
                role="option"
                className="w-full border-b border-[var(--border)] p-3 text-left text-sm last:border-0 hover:bg-[var(--accent-soft)]/40"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect?.(task);
                  setOpen(false);
                }}
              >
                <p className="font-medium">{task.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge>{stageLabel(task.stage)}</Badge>
                  {task.tags.map((tg) => (
                    <Badge key={tg.id}>{tg.name}</Badge>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
