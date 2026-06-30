import type { Stage, TaskKind } from "./types";

const TASK_TRANSITIONS: Record<Stage, Stage[]> = {
  inbox: ["week", "archived"],
  week: ["today", "inbox", "archived"],
  today: ["week", "archived"],
  archived: ["inbox"],
};

export function canTransition(
  kind: TaskKind,
  from: Stage,
  to: Stage,
): boolean {
  if (from === to) return true;

  if (kind === "bookmark") {
    if (from === "archived" && to === "inbox") return true;
    return from === "inbox" && to === "inbox";
  }

  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}

export function defaultStageForKind(kind: TaskKind): Stage {
  return "inbox";
}

export function nextStage(kind: TaskKind, current: Stage): Stage | null {
  if (kind === "bookmark") return null;
  if (current === "inbox") return "week";
  if (current === "week") return "today";
  return null;
}

export function prevStage(kind: TaskKind, current: Stage): Stage | null {
  if (kind === "bookmark") return null;
  if (current === "today") return "week";
  if (current === "week") return "inbox";
  return null;
}
