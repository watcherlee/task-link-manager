import { getClient, getSetting, setSetting } from "./db";

export interface RolloverResult {
  dailyCount: number;
  weeklyCount: number;
  ranAt: string;
  message?: string;
}

function getShanghaiDateKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function getShanghaiMondayKey(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  });
  const weekday = fmt.format(now).slice(0, 3);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const day = dayMap[weekday] ?? 0;
  const offset = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(monday.getDate() - offset);
  return getShanghaiDateKey(monday);
}

function getShanghaiParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(
    parts.find((p) => p.type === "minute")?.value ?? "0",
    10,
  );
  const dayMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 0,
  };
  return { weekday: dayMap[weekday.slice(0, 3)] ?? 0, hour, minute };
}

export function shouldRunDaily(now = new Date()): boolean {
  const { hour, minute } = getShanghaiParts(now);
  return hour === 0 && minute >= 5 && minute < 15;
}

export function shouldRunWeekly(now = new Date()): boolean {
  const { weekday, hour, minute } = getShanghaiParts(now);
  return weekday === 1 && hour === 0 && minute >= 10 && minute < 20;
}

async function runDailyRollover(now = new Date()): Promise<number> {
  const c = await getClient();
  const todayKey = getShanghaiDateKey(now);
  const lastDaily = await getSetting("last_daily_rollover");
  if (lastDaily === todayKey) return 0;

  const result = await c.execute({
    sql: "SELECT COUNT(*) AS c FROM tasks WHERE stage = 'today' AND done = 0",
  });
  const count = Number(result.rows[0]?.c ?? 0);
  await setSetting("last_daily_rollover", todayKey);
  return count;
}

async function runWeeklyRollover(now = new Date()): Promise<number> {
  const c = await getClient();
  const weekKey = getShanghaiMondayKey(now);
  const lastWeekly = await getSetting("last_weekly_rollover");
  if (lastWeekly === weekKey) return 0;

  const ts = now.toISOString();
  const result = await c.execute({
    sql: "UPDATE tasks SET updated_at = ? WHERE stage = 'week' AND done = 0",
    args: [ts],
  });
  await setSetting("last_weekly_rollover", weekKey);
  return result.rowsAffected;
}

/** Cron: only runs during scheduled windows */
export async function runScheduledRollover(
  now = new Date(),
): Promise<RolloverResult> {
  const ts = now.toISOString();
  let dailyCount = 0;
  let weeklyCount = 0;

  if (shouldRunDaily(now)) dailyCount = await runDailyRollover(now);
  if (shouldRunWeekly(now)) weeklyCount = await runWeeklyRollover(now);

  await setSetting("last_rollover_at", ts);
  return { dailyCount, weeklyCount, ranAt: ts };
}

/** App open: compensate missed daily/weekly runs by date */
export async function runRolloverCompensation(
  now = new Date(),
): Promise<RolloverResult> {
  const ts = now.toISOString();
  const dailyCount = await runDailyRollover(now);
  const weeklyCount = await runWeeklyRollover(now);
  await setSetting("last_rollover_at", ts);

  let message: string | undefined;
  if (dailyCount > 0) {
    message = `rollover.daily:${dailyCount}`;
  }

  return { dailyCount, weeklyCount, ranAt: ts, message };
}

export async function runRolloverOnAppOpen(): Promise<RolloverResult> {
  return runRolloverCompensation(new Date());
}

/** @deprecated use runScheduledRollover or runRolloverCompensation */
export async function runRollover(now = new Date()): Promise<RolloverResult> {
  return runRolloverCompensation(now);
}
