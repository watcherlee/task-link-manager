import { describe, expect, it } from "vitest";
import { shouldRunDaily, shouldRunWeekly } from "./rollover";

describe("rollover", () => {
  it("detects daily window", () => {
    const d = new Date("2026-06-29T16:08:00.000Z"); // 00:08 Shanghai
    expect(shouldRunDaily(d)).toBe(true);
  });

  it("detects weekly window on Monday", () => {
    const d = new Date("2026-06-29T16:12:00.000Z"); // Mon 00:12 Shanghai (2026-06-30 is Tue actually - let me check)
    // 2026-06-29 is Monday. 16:12 UTC = 00:12 next day in Shanghai? 
    // UTC+8: 16:12 UTC = 00:12 next calendar day in Shanghai
    // For Monday Shanghai 00:12: UTC Sunday 16:12 - need Mon in Shanghai
    const mon = new Date("2026-06-28T16:12:00.000Z"); // Mon Jun 29 00:12 CST
    expect(shouldRunWeekly(mon)).toBe(true);
  });
});
