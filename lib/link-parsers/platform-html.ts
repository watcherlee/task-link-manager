import type { MetadataResult } from "../types";
import { fetchHtmlTitle } from "./generic";

export async function parseWeixin(url: string): Promise<MetadataResult> {
  return fetchHtmlTitle(url, "weixin");
}

export async function parseFeishu(url: string): Promise<MetadataResult> {
  return fetchHtmlTitle(url, "feishu");
}

export async function parseXiaohongshu(url: string): Promise<MetadataResult> {
  return fetchHtmlTitle(url, "xiaohongshu", {
    "User-Agent":
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
  });
}
