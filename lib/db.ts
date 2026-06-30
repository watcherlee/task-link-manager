import { createClient, type Client, type Row } from "@libsql/client";
import fs from "fs";
import path from "path";

let client: Client | null = null;
let activeUrl: string | null = null;
let initPromise: Promise<void> | null = null;

function resolveUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }
  const dbPath =
    process.env.TASKS_DB_PATH ?? path.join(process.cwd(), "data", "tasks.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return `file:${dbPath}`;
}

async function migrateTasksTable(c: Client) {
  const info = await c.execute("PRAGMA table_info(tasks)");
  const names = new Set(info.rows.map((r) => String(r.name)));
  if (!names.has("category")) {
    await c.execute(
      "ALTER TABLE tasks ADD COLUMN category TEXT NOT NULL DEFAULT 'work'",
    );
  }
  if (!names.has("priority")) {
    await c.execute(
      "ALTER TABLE tasks ADD COLUMN priority INTEGER NOT NULL DEFAULT 0",
    );
  }
}

async function seedTags(c: Client) {
  const presets = ["工作", "学习", "阅读", "视频", "文档", "其他"];
  for (const name of presets) {
    await c.execute({
      sql: "INSERT OR IGNORE INTO tags (id, name, preset) VALUES (?, ?, 1)",
      args: [`preset-${name}`, name],
    });
  }
  await c.execute({
    sql: `DELETE FROM tags
          WHERE preset = 0
            AND name GLOB '[?？]*'
            AND id NOT IN (SELECT tag_id FROM task_tags)`,
  });
}

async function initSchema(c: Client) {
  const schemaPath = path.join(process.cwd(), "lib", "db", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");
  await c.executeMultiple(sql);
  await migrateTasksTable(c);
  await seedTags(c);
}

export async function getClient(): Promise<Client> {
  const url = resolveUrl();
  if (client && activeUrl === url && initPromise) {
    await initPromise;
    return client;
  }
  client?.close();
  client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  activeUrl = url;
  initPromise = initSchema(client);
  await initPromise;
  return client;
}

export async function closeDb() {
  client?.close();
  client = null;
  activeUrl = null;
  initPromise = null;
}

export function asNumber(value: unknown): number {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseInt(value, 10) || 0;
  return 0;
}

export function asString(value: unknown): string | null {
  if (value == null) return null;
  return String(value);
}

export async function getSetting(key: string): Promise<string | null> {
  const c = await getClient();
  const result = await c.execute({
    sql: "SELECT value FROM settings WHERE key = ?",
    args: [key],
  });
  const row = result.rows[0];
  return row ? asString(row.value) : null;
}

export async function setSetting(key: string, value: string) {
  const c = await getClient();
  await c.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [key, value],
  });
}

export function rowToRecord(row: Row): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = value;
  }
  return out;
}
