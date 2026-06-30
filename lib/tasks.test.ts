import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeDb } from "./db";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "./tasks";

let TEST_DB = "";

beforeEach(async () => {
  await closeDb();
  TEST_DB = path.join(
    os.tmpdir(),
    `tasks-test-${Date.now()}-${Math.random()}.db`,
  );
  process.env.TASKS_DB_PATH = TEST_DB;
});

afterEach(async () => {
  await closeDb();
  delete process.env.TASKS_DB_PATH;
  if (fs.existsSync(TEST_DB)) {
    try {
      fs.unlinkSync(TEST_DB);
    } catch {
      /* Windows may keep handle briefly */
    }
  }
});

describe("tasks", () => {
  it("creates task in inbox by default", async () => {
    const task = await createTask({ title: "Hello" });
    expect(task.stage).toBe("inbox");
    expect(task.kind).toBe("task");
    expect(await listTasks("inbox")).toHaveLength(1);
  });

  it("forces bookmark to inbox", async () => {
    const task = await createTask({
      title: "Link",
      kind: "bookmark",
      url: "https://example.com",
      stage: "week",
    });
    expect(task.stage).toBe("inbox");
  });

  it("blocks invalid stage transition", async () => {
    const task = await createTask({ title: "Move me" });
    const result = await updateTask(task.id, { stage: "today" });
    expect("error" in result).toBe(true);
  });

  it("marks done in place without archiving", async () => {
    const task = await createTask({ title: "Done task" });
    await updateTask(task.id, { stage: "week" });
    await updateTask(task.id, { stage: "today" });
    const done = await updateTask(task.id, { done: true });
    expect("error" in done).toBe(false);
    if (!("error" in done)) {
      expect(done.stage).toBe("today");
      expect(done.done).toBe(true);
    }
  });

  it("supports tags and notes", async () => {
    const task = await createTask({
      title: "Tagged",
      notes: "note",
      tagNames: ["工作", "自定义"],
    });
    expect(task.notes).toBe("note");
    expect(task.tags.length).toBe(2);
    await deleteTask(task.id);
    expect(await getTask(task.id)).toBeNull();
  });
});
