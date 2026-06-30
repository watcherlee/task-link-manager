"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { TagPicker } from "@/components/TagPicker";
import {
  detectPlatform,
  extractUrlFromText,
  fetchMetadataClient,
} from "@/lib/link-parsers/client";
import type { TaskKind, InboxCategory } from "@/lib/types";

export function TaskInput({ onCreated }: { onCreated: () => void }) {
  const t = useTranslations("input");
  const [kind, setKind] = useState<TaskKind>("task");
  const [category, setCategory] = useState<InboxCategory>("work");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const resolveMetadata = useCallback(async (text: string) => {
    const found = extractUrlFromText(text);
    if (!found) return;
    setUrl(found);
    setPlatform(detectPlatform(found));
    setLoading(true);
    try {
      const client = await fetchMetadataClient(found);
      if (client?.title) {
        setTitle(client.title);
        setPlatform(client.platform);
      } else {
        const res = await fetch(
          `/api/metadata?url=${encodeURIComponent(found)}`,
        );
        const data = await res.json();
        if (data.title) {
          setTitle(data.title);
          setPlatform(data.platform);
        } else if (!title) {
          setTitle(new URL(found).hostname);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [title]);

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (extractUrlFromText(text)) {
      void resolveMetadata(text);
    }
  };

  const submit = async () => {
    const finalTitle = title.trim() || url || "";
    if (!finalTitle) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          kind,
          url,
          platform,
          notes: notes.trim() || null,
          tagNames: tags,
          category,
        }),
      });
      if (res.ok) {
        setTitle("");
        setUrl(null);
        setPlatform(null);
        setNotes("");
        setTags([]);
        onCreated();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          className="h-11 flex-1 text-base shadow-[var(--shadow-sm)]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onPaste={handlePaste}
          placeholder={t("placeholder")}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
        />
        <Button
          type="button"
          variant="accent"
          className="h-11 shrink-0 whitespace-nowrap px-5 text-sm font-semibold"
          onClick={submit}
          disabled={loading}
        >
          {loading ? t("fetching") : t("add")}
        </Button>
      </div>

      {url && (
        <p className="truncate px-1 text-[11px] text-[var(--muted)]">{url}</p>
      )}

      <button
        type="button"
        className="flex items-center gap-1 px-1 text-[11px] text-[var(--muted)] hover:text-[var(--foreground)]"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
        {t("moreOptions")}
      </button>

      {expanded && (
        <div className="animate-fade-up space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={kind === "task" ? "accent" : "outline"}
              size="sm"
              onClick={() => setKind("task")}
            >
              {t("task")}
            </Button>
            <Button
              type="button"
              variant={kind === "bookmark" ? "accent" : "outline"}
              size="sm"
              onClick={() => setKind("bookmark")}
            >
              {t("bookmark")}
            </Button>
            <span className="mx-0.5 hidden h-5 w-px self-center bg-[var(--border)] sm:inline" />
            <Button
              type="button"
              variant={category === "work" ? "accent" : "outline"}
              size="sm"
              onClick={() => setCategory("work")}
            >
              {t("work")}
            </Button>
            <Button
              type="button"
              variant={category === "life" ? "accent" : "outline"}
              size="sm"
              onClick={() => setCategory("life")}
            >
              {t("life")}
            </Button>
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("notesPlaceholder")}
          />
          <TagPicker selected={tags} onChange={setTags} />
        </div>
      )}
    </div>
  );
}
