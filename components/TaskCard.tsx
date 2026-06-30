"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Check,
  ChevronsUp,
  ChevronUp,
  Pencil,
  Star,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { PlatformIcon } from "@/components/PlatformIcon";
import { TaskEditDialog } from "@/components/TaskEditDialog";
import { cn } from "@/lib/utils";
import { canTransition } from "@/lib/stage-rules";
import type { Priority, Task } from "@/lib/types";

const PRIORITY_BAR: Record<Priority, string> = {
  2: "border-l-[var(--p0)]",
  1: "border-l-[var(--p1)]",
  0: "border-l-[var(--p2)]",
};

export function TaskCard({
  task,
  onUpdate,
  highlighted,
}: {
  task: Task;
  onUpdate: () => void;
  highlighted?: boolean;
}) {
  const t = useTranslations("actions");
  const ti = useTranslations("input");
  const tp = useTranslations("priority");
  const [editing, setEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id, disabled: task.done });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const patch = async (body: Record<string, unknown>) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) onUpdate();
  };

  const canToWeek =
    task.kind === "task" &&
    canTransition(task.kind, task.stage, "week") &&
    task.stage === "inbox" &&
    !task.done;

  const canToTodayFromWeek =
    task.kind === "task" &&
    task.stage === "week" &&
    !task.done &&
    canTransition(task.kind, task.stage, "today");

  const toggleDone = () => void patch({ done: !task.done });

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        id={`task-${task.id}`}
        className={cn("mb-2 touch-none", task.done && "opacity-75")}
      >
        <article
          className={cn(
            "rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]",
            task.stage === "today" && !task.done && `border-l-[3px] ${PRIORITY_BAR[task.priority]}`,
            highlighted && "ring-2 ring-[var(--accent)]/40",
            task.done && "bg-[#f5f2ec]",
          )}
        >
          <div className="flex items-start gap-2 p-2.5">
            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleDone();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-2">
                <PlatformIcon platform={task.platform} />
                <div className="min-w-0 flex-1">
                  {task.url ? (
                    <a
                      href={task.url}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        "block text-sm leading-snug hover:underline",
                        task.done
                          ? "text-[var(--muted)] line-through"
                          : "font-medium text-[var(--foreground)]",
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.title}
                    </a>
                  ) : (
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        task.done
                          ? "text-[var(--muted)] line-through"
                          : "font-medium",
                      )}
                    >
                      {task.title}
                    </p>
                  )}
                  {task.url && (
                    <p className="mt-0.5 truncate text-[10px] text-[var(--muted)]">
                      {task.url}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {task.stage === "today" && !task.done && (
                      <Badge
                        className={cn(
                          task.priority === 2 && "bg-[#f8e8e5] text-[var(--p0)]",
                          task.priority === 1 && "bg-[#fbf3dc] text-[#9a7b1a]",
                          task.priority === 0 && "bg-[#e5f0e8] text-[var(--p2)]",
                        )}
                      >
                        {tp(`p${task.priority}` as "p0" | "p1" | "p2")}
                      </Badge>
                    )}
                    {task.kind === "bookmark" && (
                      <Badge variant="platform">{ti("bookmark")}</Badge>
                    )}
                    {task.tags.map((tag) => (
                      <Badge key={tag.id}>{tag.name}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="flex shrink-0 flex-col items-end gap-1"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex flex-wrap justify-end gap-1">
                {task.stage === "inbox" && (
                  <>
                    <button
                      type="button"
                      disabled={!canToWeek}
                      className="action-pill action-pill-primary"
                      onClick={() => canToWeek && patch({ stage: "week" })}
                    >
                      <ChevronsUp className="h-3 w-3" />
                      {t("toWeekShort")}
                    </button>
                    <button
                      type="button"
                      disabled
                      className="action-pill"
                      title={t("toTodayHint")}
                    >
                      <ChevronUp className="h-3 w-3" />
                      <Star className="h-2 w-2 fill-current" />
                      {t("toTodayShort")}
                    </button>
                  </>
                )}
                {task.stage === "week" && (
                  <button
                    type="button"
                    disabled={!canToTodayFromWeek}
                    className="action-pill action-pill-primary"
                    onClick={() =>
                      canToTodayFromWeek && patch({ stage: "today" })
                    }
                  >
                    <ChevronUp className="h-3 w-3" />
                    <Star className="h-2 w-2 fill-current" />
                    {t("toTodayShort")}
                  </button>
                )}
                {task.stage === "today" && !task.done && (
                  <button
                    type="button"
                    className="action-pill action-pill-primary"
                    onClick={toggleDone}
                  >
                    <Check className="h-3 w-3" />
                    {t("complete")}
                  </button>
                )}
                <button
                  type="button"
                  className="action-pill"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                  {t("edit")}
                </button>
                <button
                  type="button"
                  className="action-pill action-pill-danger"
                  onClick={() =>
                    fetch(`/api/tasks/${task.id}`, { method: "DELETE" }).then(
                      onUpdate,
                    )
                  }
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <TaskEditDialog
        task={task}
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={onUpdate}
      />
    </>
  );
}
