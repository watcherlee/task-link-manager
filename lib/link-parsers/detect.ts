import type { Platform } from "../types";

export function detectPlatform(url: string): Platform {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("bilibili.com") || host === "b23.tv") return "bilibili";
    if (host.includes("mp.weixin.qq.com")) return "weixin";
    if (host.includes("feishu.cn") || host.includes("larksuite.com"))
      return "feishu";
    if (host.includes("xiaohongshu.com") || host.includes("xhslink.com"))
      return "xiaohongshu";
    if (
      host.includes("youtube.com") ||
      host.includes("youtu.be")
    )
      return "youtube";
  } catch {
    /* invalid url */
  }
  return "generic";
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractUrlFromText(text: string): string | null {
  const match = text.trim().match(/https?:\/\/[^\s]+/i);
  return match ? match[0].replace(/[.,;:!?)]+$/, "") : null;
}
