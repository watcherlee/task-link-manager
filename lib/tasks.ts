import { randomUUID } from "crypto";
import { asNumber, asString, getClient } from "./db";
import { sortTasksForDisplay } from "./task-sort";
import { canTransition, defaultStageForKind } from "./stage-rules";
import type {
  CreateTaskInput,
  InboxCategory,
  Priority,
  Stage,
  Tag,
  Task,
  UpdateTaskInput,
} from "./types";
import type { Row } from "@libsql/client";

interface TaskRow {
  id: string;
  user_id: string;
  kind: "task" | "bookmark";
  title: string;
  url: string | null;
  platform: string | null;
  notes: string | null;
  stage: Stage;
  category: InboxCategory;
  priority: number;
  sort_order: number;
  done: number;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TagRow {
  id: string;
  name: string;
  preset: number;
}

function nowIso() {
  return new Date().toISOString();
}

function mapTag(row: TagRow): Tag {
  return { id: row.id, name: row.name, preset: row.preset === 1 };
}

function toTaskRow(row: Row): TaskRow {
  return {
    id: asString(row.id)!,
    user_id: asString(row.user_id)!,
    kind: asString(row.kind) as TaskRow["kind"],
    title: asString(row.title)!,
    url: asString(row.url),
    platform: asString(row.platform),
    notes: asString(row.notes),
    stage: asString(row.stage) as Stage,
    category: (asString(row.category) ?? "work") as InboxCategory,
    priority: asNumber(row.priority),
    sort_order: asNumber(row.sort_order),
    done: asNumber(row.done),
    done_at: asString(row.done_at),
    created_at: asString(row.created_at)!,
    updated_at: asString(row.updated_at)!,
  };
}

function toTagRow(row: Row): TagRow {
  return {
    id: asString(row.id)!,
    name: asString(row.name)!,
    preset: asNumber(row.preset),
  };
}

async function getTagsForTask(taskId: string): Promise<Tag[]> {
  const c = await getClient();
  const result = await c.execute({
    sql: `SELECT t.id, t.name, t.preset FROM tags t
          JOIN task_tags tt ON tt.tag_id = t.id
          WHERE tt.task_id = ?`,
    args: [taskId],
  });
  return result.rows.map((row) => mapTag(toTagRow(row)));
}

async function mapTask(row: TaskRow): Promise<Task> {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    url: row.url,
    platform: row.platform as Task["platform"],
    notes: row.notes,
    stage: row.stage,
    category: row.category ?? "work",
    priority: Math.min(2, Math.max(0, row.priority ?? 0)) as Priority,
    sortOrder: row.sort_order,
    done: row.done === 1,
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: await getTagsForTask(row.id),
  };
}

async function maxSortOrder(stage: Stage, userId = "default"): Promise<number> {
  const c = await getClient();
  const result = await c.execute({
    sql: "SELECT COALESCE(MAX(sort_order), -1) AS max FROM tasks WHERE stage = ? AND user_id = ?",
    args: [stage, userId],
  });
  return asNumber(result.rows[0]?.max ?? -1);
}

async function nextSortOrder(stage: Stage, userId = "default"): Promise<number> {
  return (await maxSortOrder(stage, userId)) + 1;
}

async function upsertTags(tagNames: string[]): Promise<Tag[]> {
  const c = await getClient();
  const tags: Tag[] = [];

  for (const name of tagNames.map((n) => n.trim()).filter(Boolean)) {
    const found = await c.execute({
      sql: "SELECT id, name, preset FROM tags WHERE name = ?",
      args: [name],
    });
    let row = found.rows[0] ? toTagRow(found.rows[0]) : undefined;
    if (!row) {
      const id = randomUUID();
      await c.execute({
        sql: "INSERT INTO tags (id, name, preset) VALUES (?, ?, 0)",
        args: [id, name],
      });
      row = { id, name, preset: 0 };
    }
    tags.push(mapTag(row));
  }
  return tags;
}

async function setTaskTags(taskId: string, tagNames?: string[]) {
  const c = await getClient();
  await c.execute({
    sql: "DELETE FROM task_tags WHERE task_id = ?",
    args: [taskId],
  });
  if (!tagNames?.length) return;
  const tags = await upsertTags(tagNames);
  for (const tag of tags) {
    await c.execute({
      sql: "INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)",
      args: [taskId, tag.id],
    });
  }
}

export async function listTasks(stage?: Stage, userId = "default"): Promise<Task[]> {
  let sql =
    "SELECT * FROM tasks WHERE user_id = ? AND stage != 'archived'";
  const args: (string | number)[] = [userId];

  if (stage) {
    sql = "SELECT * FROM tasks WHERE user_id = ? AND stage = ?";
    args.push(stage);
  }

  sql += " ORDER BY sort_order ASC, created_at DESC";

  const c = await getClient();
  const result = await c.execute({ sql, args });
  const tasks = await Promise.all(
    result.rows.map((row) => mapTask(toTaskRow(row))),
  );

  if (stage) {
    return sortTasksForDisplay(tasks, stage);
  }
  return tasks;
}

export async function listArchived(userId = "default"): Promise<Task[]> {
  const c = await getClient();
  const result = await c.execute({
    sql: "SELECT * FROM tasks WHERE user_id = ? AND stage = 'archived' ORDER BY done_at DESC, updated_at DESC",
    args: [userId],
  });
  return Promise.all(result.rows.map((row) => mapTask(toTaskRow(row))));
}

export async function getTask(id: string): Promise<Task | null> {
  const c = await getClient();
  const result = await c.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0];
  return row ? mapTask(toTaskRow(row)) : null;
}

export async function createTask(
  input: CreateTaskInput,
  userId = "default",
): Promise<Task> {
  const kind = input.kind ?? "task";
  const stage =
    kind === "bookmark"
      ? "inbox"
      : (input.stage ?? defaultStageForKind(kind));
  const id = randomUUID();
  const ts = nowIso();
  const category = input.category ?? "work";
  const priority = input.priority ?? 0;

  const c = await getClient();
  await c.execute({
    sql: `INSERT INTO tasks (id, user_id, kind, title, url, platform, notes, stage, category, priority, sort_order, done, done_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?)`,
    args: [
      id,
      userId,
      kind,
      input.title.trim(),
      input.url ?? null,
      input.platform ?? null,
      input.notes ?? null,
      stage,
      category,
      priority,
      await nextSortOrder(stage, userId),
      ts,
      ts,
    ],
  });

  await setTaskTags(id, input.tagNames);
  return (await getTask(id))!;
}

export async function updateTask(
  id: string,
  input: UpdateTaskInput,
): Promise<Task | { error: string }> {
  const existing = await getTask(id);
  if (!existing) return { error: "Not found" };

  const nextStage = input.stage ?? existing.stage;
  if (
    nextStage !== existing.stage &&
    !canTransition(existing.kind, existing.stage, nextStage)
  ) {
    return { error: "Invalid stage transition" };
  }

  let done = input.done ?? existing.done;
  let stage = nextStage;
  let sortOrder = input.sortOrder ?? existing.sortOrder;
  let doneAt = existing.doneAt;

  if (input.done !== undefined && input.done !== existing.done) {
    if (input.done) {
      done = true;
      stage = existing.stage;
      sortOrder = (await maxSortOrder(existing.stage, existing.userId)) + 1;
      doneAt = nowIso();
    } else {
      done = false;
      doneAt = null;
    }
  }

  if (input.stage && input.stage !== existing.stage) {
    done = false;
    doneAt = null;
    sortOrder = await nextSortOrder(input.stage, existing.userId);
  }

  const ts = nowIso();
  const c = await getClient();
  await c.execute({
    sql: `UPDATE tasks SET
            title = ?, kind = ?, url = ?, platform = ?, notes = ?,
            stage = ?, category = ?, priority = ?, sort_order = ?, done = ?, done_at = ?, updated_at = ?
          WHERE id = ?`,
    args: [
      input.title?.trim() ?? existing.title,
      input.kind ?? existing.kind,
      input.url !== undefined ? input.url : existing.url,
      input.platform !== undefined ? input.platform : existing.platform,
      input.notes !== undefined ? input.notes : existing.notes,
      stage,
      input.category ?? existing.category,
      input.priority ?? existing.priority,
      sortOrder,
      done ? 1 : 0,
      doneAt,
      ts,
      id,
    ],
  });

  if (input.tagNames) await setTaskTags(id, input.tagNames);
  return (await getTask(id))!;
}

export async function archiveTask(id: string): Promise<Task | { error: string }> {
  const existing = await getTask(id);
  if (!existing) return { error: "Not found" };
  const ts = nowIso();
  const c = await getClient();
  await c.execute({
    sql: `UPDATE tasks SET stage = 'archived', done = 1, done_at = ?, updated_at = ? WHERE id = ?`,
    args: [ts, ts, id],
  });
  return (await getTask(id))!;
}

export async function deleteTask(id: string): Promise<boolean> {
  const c = await getClient();
  await c.execute({
    sql: "DELETE FROM task_tags WHERE task_id = ?",
    args: [id],
  });
  const result = await c.execute({
    sql: "DELETE FROM tasks WHERE id = ?",
    args: [id],
  });
  return result.rowsAffected > 0;
}

export async function listAllTags(): Promise<Tag[]> {
  const c = await getClient();
  const result = await c.execute({
    sql: "SELECT id, name, preset FROM tags ORDER BY preset DESC, name ASC",
  });
  return result.rows.map((row) => mapTag(toTagRow(row)));
}

export async function createTag(name: string): Promise<Tag | { error: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Tag name required" };
  if (trimmed.length > 32) return { error: "Tag name too long" };
  if (/^[?？]+$/.test(trimmed)) {
    return { error: "Invalid tag name" };
  }

  const tags = await upsertTags([trimmed]);
  return tags[0] ?? { error: "Failed to create tag" };
}

export async function deleteTag(id: string): Promise<{ ok: true } | { error: string }> {
  const c = await getClient();
  const found = await c.execute({
    sql: "SELECT id, name, preset FROM tags WHERE id = ?",
    args: [id],
  });
  const row = found.rows[0] ? toTagRow(found.rows[0]) : undefined;
  if (!row) return { error: "Not found" };
  if (row.preset) return { error: "Cannot delete preset tag" };

  await c.execute({
    sql: "DELETE FROM task_tags WHERE tag_id = ?",
    args: [id],
  });
  await c.execute({
    sql: "DELETE FROM tags WHERE id = ?",
    args: [id],
  });
  return { ok: true };
}

export async function restoreTask(id: string): Promise<Task | { error: string }> {
  return updateTask(id, { done: false, stage: "inbox" });
}
