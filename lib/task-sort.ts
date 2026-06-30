import type { InboxCategory, Priority, Stage, Task } from "./types";

/** 未完成在前；已完成沉底；今日按优先级降序 */
export function sortTasksForDisplay(tasks: Task[], stage: Stage): Task[] {
  const active = tasks.filter((t) => !t.done);
  const completed = tasks.filter((t) => t.done);

  const byOrder = (a: Task, b: Task) => a.sortOrder - b.sortOrder;

  if (stage === "today") {
    active.sort((a, b) => b.priority - a.priority || byOrder(a, b));
  } else {
    active.sort(byOrder);
  }
  completed.sort(byOrder);

  return [...active, ...completed];
}

export function groupInboxByCategory(tasks: Task[]): Record<InboxCategory, Task[]> {
  const work = sortTasksForDisplay(
    tasks.filter((t) => t.category === "work"),
    "inbox",
  );
  const life = sortTasksForDisplay(
    tasks.filter((t) => t.category === "life"),
    "inbox",
  );
  return { work, life };
}

export function weekProgress(tasks: Task[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

export function groupTodayByPriority(tasks: Task[]): {
  priority: Priority;
  tasks: Task[];
}[] {
  const sorted = sortTasksForDisplay(tasks, "today");
  return ([2, 1, 0] as Priority[]).map((p) => ({
    priority: p,
    tasks: sorted.filter((t) => t.priority === p),
  }));
}

export function nextPriority(current: Priority): Priority {
  if (current === 2) return 0;
  return (current + 1) as Priority;
}
