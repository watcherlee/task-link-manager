"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/lib/types";

export function TagPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const t = useTranslations("tags");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    const data = await res.json();
    setAllTags(data.tags ?? []);
  }, []);

  useEffect(() => {
    void loadTags();
  }, [loadTags]);

  const presetTags = useMemo(
    () => allTags.filter((tag) => tag.preset),
    [allTags],
  );
  const customTags = useMemo(
    () => allTags.filter((tag) => !tag.preset),
    [allTags],
  );

  const toggle = (name: string) => {
    setError(null);
    if (selected.includes(name)) {
      onChange(selected.filter((item) => item !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const addCustom = async () => {
    const name = input.trim();
    if (!name) return;

    setError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? t("addFailed"));
        return;
      }

      const created = data.tag as Tag;
      await loadTags();

      if (!selected.includes(created.name)) {
        onChange([...selected, created.name]);
      }
      setInput("");
    } catch {
      setError(t("addFailed"));
    } finally {
      setAdding(false);
    }
  };

  const removeCustomTag = async (tag: Tag) => {
    if (tag.preset) return;
    setError(null);
    setDeletingId(tag.id);
    try {
      const res = await fetch(`/api/tags/${tag.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t("deleteFailed"));
        return;
      }
      onChange(selected.filter((name) => name !== tag.name));
      setAllTags((prev) => prev.filter((item) => item.id !== tag.id));
    } catch {
      setError(t("deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const renderPresetTag = (tag: Tag) => {
    const active = selected.includes(tag.name);
    return (
      <button key={tag.id} type="button" onClick={() => toggle(tag.name)}>
        <Badge
          className={
            active
              ? "border border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
              : "hover:border-[var(--border)] hover:bg-white"
          }
        >
          {tag.name}
        </Badge>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-[var(--foreground)]">
          {t("label")}
        </p>
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] text-[var(--accent)]"
              >
                {name}
                <button
                  type="button"
                  aria-label={t("remove", { name })}
                  className="rounded hover:bg-white/60"
                  onClick={() => toggle(name)}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--muted)]">{t("noneSelected")}</p>
        )}
      </div>

      {presetTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] text-[var(--muted)]">{t("presets")}</p>
          <div className="flex flex-wrap gap-1.5">
            {presetTags.map(renderPresetTag)}
          </div>
        </div>
      )}

      {customTags.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] text-[var(--muted)]">{t("custom")}</p>
          <div className="flex flex-wrap gap-1.5">
            {customTags.map((tag) => {
              const active = selected.includes(tag.name);
              return (
                <span
                  key={tag.id}
                  className="inline-flex items-center gap-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] pr-0.5"
                >
                  <button type="button" onClick={() => toggle(tag.name)}>
                    <Badge
                      className={
                        active
                          ? "border-0 bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "border-0 bg-transparent hover:bg-white"
                      }
                    >
                      {tag.name}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    aria-label={t("deleteTag", { name: tag.name })}
                    disabled={deletingId === tag.id}
                    className="flex h-5 w-5 items-center justify-center rounded text-[var(--muted)] hover:bg-[#fff5f5] hover:text-[#b54545] disabled:opacity-50"
                    onClick={() => void removeCustomTag(tag)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <p className="mb-1.5 text-[11px] text-[var(--muted)]">{t("addCustom")}</p>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            placeholder={t("placeholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addCustom();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 gap-1 whitespace-nowrap"
            onClick={() => void addCustom()}
            disabled={adding || !input.trim()}
          >
            <Plus className="h-3.5 w-3.5" />
            {adding ? t("adding") : t("add")}
          </Button>
        </div>
        {error && <p className="mt-1 text-[11px] text-[#b54545]">{error}</p>}
      </div>
    </div>
  );
}
