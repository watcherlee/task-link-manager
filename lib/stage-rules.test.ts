import { describe, expect, it } from "vitest";
import { canTransition } from "./stage-rules";

describe("stage-rules", () => {
  it("blocks bookmark from leaving inbox", () => {
    expect(canTransition("bookmark", "inbox", "week")).toBe(false);
    expect(canTransition("bookmark", "inbox", "today")).toBe(false);
  });

  it("allows task forward and one-step back", () => {
    expect(canTransition("task", "inbox", "week")).toBe(true);
    expect(canTransition("task", "week", "today")).toBe(true);
    expect(canTransition("task", "today", "week")).toBe(true);
    expect(canTransition("task", "week", "inbox")).toBe(true);
  });

  it("blocks task today to inbox skip", () => {
    expect(canTransition("task", "today", "inbox")).toBe(false);
  });

  it("allows archive and restore", () => {
    expect(canTransition("task", "today", "archived")).toBe(true);
    expect(canTransition("task", "archived", "inbox")).toBe(true);
  });
});
