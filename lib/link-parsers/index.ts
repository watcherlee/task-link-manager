import { detectPlatform } from "./detect";
import { parseBilibili } from "./bilibili";
import { parseGeneric } from "./generic";
import {
  parseFeishu,
  parseWeixin,
  parseXiaohongshu,
} from "./platform-html";
import { parseYoutube } from "./youtube";
import type { MetadataResult } from "../types";
import net from "net";
import dns from "dns/promises";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isPrivateIp(ip: string): boolean {
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1] ?? "0", 10);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80"))
    return true;
  return false;
}

export async function assertSafeUrl(url: string): Promise<void> {
  const u = new URL(url);
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Invalid protocol");
  }
  const host = u.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host)) throw new Error("Blocked host");
  if (net.isIP(host)) {
    if (isPrivateIp(host)) throw new Error("Private IP blocked");
    return;
  }
  const records = await dns.lookup(host, { all: true });
  for (const r of records) {
    if (isPrivateIp(r.address)) throw new Error("Private IP blocked");
  }
}

export async function fetchMetadata(url: string): Promise<MetadataResult> {
  await assertSafeUrl(url);
  const platform = detectPlatform(url);

  const parsers = [
    () => (platform === "bilibili" ? parseBilibili(url) : null),
    () => (platform === "weixin" ? parseWeixin(url) : null),
    () => (platform === "feishu" ? parseFeishu(url) : null),
    () => (platform === "xiaohongshu" ? parseXiaohongshu(url) : null),
    () => (platform === "youtube" ? parseYoutube(url) : null),
    () => parseGeneric(url),
  ];

  for (const run of parsers) {
    const result = await run();
    if (!result) continue;
    if (result.title) return result;
  }

  return {
    title: null,
    url,
    platform,
    error: "Could not parse title",
  };
}
