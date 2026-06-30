import { describe, expect, it } from "vitest";
import { detectPlatform, isValidHttpUrl } from "./detect";

describe("detect", () => {
  it("detects platforms", () => {
    expect(detectPlatform("https://www.bilibili.com/video/BV1xx")).toBe(
      "bilibili",
    );
    expect(detectPlatform("https://mp.weixin.qq.com/s/abc")).toBe("weixin");
    expect(detectPlatform("https://www.youtube.com/watch?v=abc")).toBe(
      "youtube",
    );
  });

  it("validates http urls", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
  });
});
