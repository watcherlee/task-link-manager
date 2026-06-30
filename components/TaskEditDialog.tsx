"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { TagPicker } from "@/components/TagPicker";
import type { InboxCategory, Priority, Task } from "@/lib/types";

export function TaskEditDialog({
  task,
  open,
  onClose,
  onSaved,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations("edit");
  const ti = useTranslations("input");
  const tp = useTranslations("priority");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState<InboxCategory>("work");
  const [priority, setPriority] = useState<Priority>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setNotes(task.notes ?? "");
    setTags(task.tags.map((tg) => tg.name));
    setCategory(task.category);
    setPriority(task.priority);
  }, [task]);

  if (!open || !task) return null;

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          notes: notes.trim() || null,
          tagNames: tags,
          category,
          priority,
        }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-fade-up rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-md)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-base font-semibold">{t("title")}</h3>
        <div className="mt-4 space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={ti("notesPlaceholder")}
          />
          {task.stage === "inbox" && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={category === "work" ? "accent" : "outline"}
                onClick={() => setCategory("work")}
              >
                {ti("work")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={category === "life" ? "accent" : "outline"}
                onClick={() => setCategory("life")}
              >
                {ti("life")}
              </Button>
            </div>
          )}
          {task.stage === "today" && (
            <div className="flex gap-2">
              {([2, 1, 0] as Priority[]).map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={priority === p ? "accent" : "outline"}
                  onClick={() => setPriority(p)}
                >
                  {tp(`p${p}` as "p0" | "p1" | "p2")}
                </Button>
              ))}
            </div>
          )}
          <TagPicker selected={tags} onChange={setTags} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="accent" size="sm" onClick={save} disabled={saving}>
            {t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
