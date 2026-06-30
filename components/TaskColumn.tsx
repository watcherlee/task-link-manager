"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Briefcase, Home, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  groupInboxByCategory,
  groupTodayByPriority,
  weekProgress,
} from "@/lib/task-sort";
import type { InboxCategory, Priority, Stage, Task } from "@/lib/types";

const STAGE_DOT: Record<Stage, string> = {
  inbox: "bg-[var(--inbox-dot)]",
  week: "bg-[var(--week-dot)]",
  today: "bg-[var(--today-dot)]",
  archived: "bg-[var(--muted)]",
};

const PRIORITY_LABEL: Record<Priority, { bar: string; text: string }> = {
  2: { bar: "bg-[var(--p0)]", text: "text-[var(--p0)]" },
  1: { bar: "bg-[var(--p1)]", text: "text-[#9a7b1a]" },
  0: { bar: "bg-[var(--p2)]", text: "text-[var(--p2)]" },
};

function TaskList({
  tasks,
  onUpdate,
  highlightId,
}: {
  tasks: Task[];
  onUpdate: () => void;
  highlightId?: string;
}) {
  if (tasks.length === 0) return null;
  return (
    <SortableContext
      items={tasks.map((t) => t.id)}
      strategy={verticalListSortingStrategy}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          highlighted={task.id === highlightId}
        />
      ))}
    </SortableContext>
  );
}

function ColumnQuickAdd({
  stage,
  onAdded,
  onCancel,
}: {
  stage: Stage;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("column");
  const tc = useTranslations("category");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<InboxCategory>("work");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmed,
          stage,
          category: stage === "inbox" ? category : undefined,
          priority: stage === "today" ? 0 : undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        onAdded();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-3 animate-fade-up rounded-lg border border-[var(--accent)]/30 bg-[var(--accent-soft)]/40 p-2">
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={
          stage === "inbox"
            ? t("placeholder_inbox")
            : stage === "week"
              ? t("placeholder_week")
              : t("placeholder_today")
        }
        className="mb-2 h-8 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
          if (e.key === "Escape") onCancel();
        }}
      />
      {stage === "inbox" && (
        <div className="mb-2 flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={category === "work" ? "accent" : "outline"}
            className="h-7 text-[11px]"
            onClick={() => setCategory("work")}
          >
            {tc("work")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={category === "life" ? "accent" : "outline"}
            className="h-7 text-[11px]"
            onClick={() => setCategory("life")}
          >
            {tc("life")}
          </Button>
        </div>
      )}
      <div className="flex justify-end gap-1">
        <Button type="button" size="sm" variant="ghost" className="h-7 text-[11px]" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="accent"
          className="h-7 text-[11px]"
          disabled={saving || !title.trim()}
          onClick={() => void submit()}
        >
          {saving ? t("adding") : t("add")}
        </Button>
      </div>
    </div>
  );
}

export function TaskColumn({
  stage,
  title,
  tasks,
  onUpdate,
  hidden,
  highlightId,
}: {
  stage: Stage;
  title: string;
  tasks: Task[];
  onUpdate: () => void;
  hidden?: boolean;
  highlightId?: string;
}) {
  const t = useTranslations("empty");
  const tc = useTranslations("category");
  const tw = useTranslations("week");
  const tp = useTranslations("priority");
  const th = useTranslations("column");
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const inboxGroups =
    stage === "inbox" ? groupInboxByCategory(tasks) : null;
  const progress = stage === "week" ? weekProgress(tasks) : null;
  const todayGroups =
    stage === "today" ? groupTodayByPriority(tasks) : null;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[360px] flex-1 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-sm)] transition-colors",
        hidden && "hidden md:flex",
        isOver && "border-[var(--accent)] bg-[var(--accent-soft)]/30",
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", STAGE_DOT[stage])}
          />
          <h2 className="font-display text-sm font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-md bg-[var(--surface-elevated)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
            {tasks.length}
          </span>
          <button
            type="button"
            aria-label={th("addTo", { stage: title })}
            title={th("addTo", { stage: title })}
            className="flex h-6 w-6 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
            onClick={() => setQuickAddOpen((v) => !v)}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </header>

      {quickAddOpen && (
        <ColumnQuickAdd
          stage={stage}
          onAdded={() => {
            setQuickAddOpen(false);
            onUpdate();
          }}
          onCancel={() => setQuickAddOpen(false)}
        />
      )}

      {progress && progress.total > 0 && (
        <div className="mb-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
            <span>{tw("progress")}</span>
            <span>
              {tw("progressCount", {
                done: progress.done,
                total: progress.total,
              })}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#e5dfd4]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      <div className="panel-scroll flex-1 pr-0.5">
        {stage === "inbox" && inboxGroups ? (
          <div className="space-y-4">
            <SortableContext
              items={tasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                  <Briefcase className="h-3 w-3" />
                  {tc("work")}
                  <span className="text-[10px] opacity-70">
                    ({inboxGroups.work.length})
                  </span>
                </h3>
                {inboxGroups.work.length === 0 ? (
                  <p className="mb-2 text-xs text-[var(--muted)]/70">
                    {tc("emptyWork")}
                  </p>
                ) : (
                  inboxGroups.work.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdate}
                      highlighted={task.id === highlightId}
                    />
                  ))
                )}
              </div>
              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
                  <Home className="h-3 w-3" />
                  {tc("life")}
                  <span className="text-[10px] opacity-70">
                    ({inboxGroups.life.length})
                  </span>
                </h3>
                {inboxGroups.life.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]/70">
                    {tc("emptyLife")}
                  </p>
                ) : (
                  inboxGroups.life.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={onUpdate}
                      highlighted={task.id === highlightId}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </div>
        ) : stage === "today" && todayGroups ? (
          tasks.length === 0 ? (
            <p className="text-xs text-[var(--muted)]/70">{t("today")}</p>
          ) : (
            <div className="space-y-4">
              {todayGroups.map(({ priority, tasks: groupTasks }) => {
                if (groupTasks.length === 0) return null;
                const style = PRIORITY_LABEL[priority];
                return (
                  <div key={priority}>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn("h-3 w-0.5 rounded-full", style.bar)}
                      />
                      <h3
                        className={cn(
                          "text-[11px] font-semibold uppercase tracking-wide",
                          style.text,
                        )}
                      >
                        {tp(`label${priority}` as "label0" | "label1" | "label2")}
                      </h3>
                      <span className="text-[10px] text-[var(--muted)]">
                        ({groupTasks.length})
                      </span>
                    </div>
                    <TaskList
                      tasks={groupTasks}
                      onUpdate={onUpdate}
                      highlightId={highlightId}
                    />
                  </div>
                );
              })}
            </div>
          )
        ) : tasks.length === 0 ? (
          <p className="text-xs text-[var(--muted)]/70">
            {t(stage as "inbox" | "week" | "today")}
          </p>
        ) : (
          <TaskList
            tasks={tasks}
            onUpdate={onUpdate}
            highlightId={highlightId}
          />
        )}
      </div>
    </section>
  );
}
