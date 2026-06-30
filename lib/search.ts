import type { Row } from "@libsql/client";
import { asNumber, asString, getClient } from "./db";
import { getTagsForTaskHelper } from "./tasks-search-helper";
import type { Stage, Task, TaskKind } from "./types";

interface TaskRow {
  id: string;
  user_id: string;
  kind: TaskKind;
  title: string;
  url: string | null;
  platform: string | null;
  notes: string | null;
  stage: Stage;
  category: "work" | "life";
  priority: number;
  sort_order: number;
  done: number;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

function toTaskRow(row: Row): TaskRow {
  return {
    id: asString(row.id)!,
    user_id: asString(row.user_id)!,
    kind: asString(row.kind) as TaskKind,
    title: asString(row.title)!,
    url: asString(row.url),
    platform: asString(row.platform),
    notes: asString(row.notes),
    stage: asString(row.stage) as Stage,
    category: (asString(row.category) ?? "work") as "work" | "life",
    priority: asNumber(row.priority),
    sort_order: asNumber(row.sort_order),
    done: asNumber(row.done),
    done_at: asString(row.done_at),
    created_at: asString(row.created_at)!,
    updated_at: asString(row.updated_at)!,
  };
}

async function mapRow(row: TaskRow): Promise<Task> {
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
    priority: Math.min(2, Math.max(0, row.priority ?? 0)) as Task["priority"],
    sortOrder: row.sort_order,
    done: row.done === 1,
    doneAt: row.done_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags: await getTagsForTaskHelper(row.id),
  };
}

export async function searchTasks(options: {
  q?: string;
  tag?: string;
  includeArchived?: boolean;
  userId?: string;
}): Promise<Task[]> {
  const { q, tag, includeArchived = true, userId = "default" } = options;
  let sql = "SELECT DISTINCT t.* FROM tasks t";
  const args: string[] = [];
  const where: string[] = ["t.user_id = ?"];
  args.push(userId);

  if (tag) {
    sql +=
      " JOIN task_tags tt ON tt.task_id = t.id JOIN tags tg ON tg.id = tt.tag_id";
    where.push("tg.name = ?");
    args.push(tag);
  }

  if (!includeArchived) {
    where.push("t.stage != 'archived'");
  }

  if (q?.trim()) {
    where.push("(t.title LIKE ? OR t.notes LIKE ? OR t.url LIKE ?)");
    const like = `%${q.trim()}%`;
    args.push(like, like, like);
  }

  sql += ` WHERE ${where.join(" AND ")} ORDER BY t.updated_at DESC LIMIT 50`;
  const c = await getClient();
  const result = await c.execute({ sql, args });
  return Promise.all(result.rows.map((row) => mapRow(toTaskRow(row))));
}
