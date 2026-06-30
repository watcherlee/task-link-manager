"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { MobileStageTabs } from "@/components/MobileStageTabs";
import { TaskColumn } from "@/components/TaskColumn";
import { canTransition } from "@/lib/stage-rules";
import { sortTasksForDisplay } from "@/lib/task-sort";
import type { Stage, Task } from "@/lib/types";

const STAGES: Stage[] = ["inbox", "week", "today"];

export function TaskBoard({
  focusStage,
  highlightId,
  onChanged,
}: {
  focusStage?: Stage;
  highlightId?: string;
  onChanged?: () => void;
}) {
  const t = useTranslations("stages");
  const te = useTranslations("errors");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mobileStage, setMobileStage] = useState<Stage>("inbox");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data.tasks ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (focusStage && STAGES.includes(focusStage)) {
      setMobileStage(focusStage);
    }
  }, [focusStage]);

  const refresh = useCallback(async () => {
    await load();
    onChanged?.();
  }, [load, onChanged]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const byStage = useMemo(() => {
    const map: Record<Stage, Task[]> = {
      inbox: [],
      week: [],
      today: [],
      archived: [],
    };
    for (const task of tasks) {
      if (map[task.stage]) map[task.stage].push(task);
    }
    for (const s of STAGES) {
      map[s] = sortTasksForDisplay(map[s], s);
    }
    return map;
  }, [tasks]);

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((item) => item.id === active.id);
    if (!task) return;

    const overStage = STAGES.includes(over.id as Stage)
      ? (over.id as Stage)
      : tasks.find((item) => item.id === over.id)?.stage;

    if (!overStage) return;

    if (overStage !== task.stage) {
      if (!canTransition(task.kind, task.stage, overStage)) {
        setError(te("invalidTransition"));
        return;
      }
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: overStage }),
      });
      if (!res.ok) {
        setError(te("invalidTransition"));
        return;
      }
      await refresh();
      return;
    }

    const stageTasks = byStage[task.stage];
    const oldIndex = stageTasks.findIndex((item) => item.id === active.id);
    const newIndex = stageTasks.findIndex((item) => item.id === over.id);
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      const reordered = arrayMove(stageTasks, oldIndex, newIndex);
      await Promise.all(
        reordered.map((item, i) =>
          fetch(`/api/tasks/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: i }),
          }),
        ),
      );
      await refresh();
    }
  };

  const activeTask = tasks.find((item) => item.id === activeId);

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <MobileStageTabs
        value={mobileStage}
        onValueChange={(v) => setMobileStage(v as Stage)}
        items={STAGES.map((s) => ({ value: s, label: t(s) }))}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-col gap-4 md:flex-row">
          {STAGES.map((stage) => (
            <TaskColumn
              key={stage}
              stage={stage}
              title={t(stage)}
              tasks={byStage[stage]}
              onUpdate={refresh}
              hidden={mobileStage !== stage}
              highlightId={highlightId}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3 shadow-[var(--shadow-md)]">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
