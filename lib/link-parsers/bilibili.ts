import type { MetadataResult } from "../types";

export async function parseBilibili(url: string): Promise<MetadataResult> {
  const u = new URL(url);
  let bvid = "";
  const bvMatch = url.match(/BV[\w]+/i);
  if (bvMatch) bvid = bvMatch[0];
  if (!bvid && u.hostname === "b23.tv") {
    const res = await fetch(url, { redirect: "follow" });
    const final = res.url;
    const m = final.match(/BV[\w]+/i);
    if (m) bvid = m[0];
  }
  if (!bvid) {
    return { title: null, url, platform: "bilibili", error: "No BV id" };
  }
  const api = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const res = await fetch(api, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = (await res.json()) as {
    data?: { title?: string };
  };
  return {
    title: data.data?.title ?? null,
    url,
    platform: "bilibili",
  };
}
