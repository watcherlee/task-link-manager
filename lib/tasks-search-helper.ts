import { asNumber, asString, getClient } from "./db";
import type { Tag } from "./types";

export async function getTagsForTaskHelper(taskId: string): Promise<Tag[]> {
  const c = await getClient();
  const result = await c.execute({
    sql: `SELECT t.id, t.name, t.preset FROM tags t
          JOIN task_tags tt ON tt.tag_id = t.id
          WHERE tt.task_id = ?`,
    args: [taskId],
  });
  return result.rows.map((row) => ({
    id: asString(row.id)!,
    name: asString(row.name)!,
    preset: asNumber(row.preset) === 1,
  }));
}
