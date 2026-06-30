import type { MetadataResult, Platform } from "../types";

const META_OG =
  /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i;
const META_OG_REV =
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i;
const TITLE_TAG = /<title[^>]*>([^<]+)<\/title>/i;

export async function fetchHtmlTitle(
  url: string,
  platform: Platform,
  headers: Record<string, string> = {},
): Promise<MetadataResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; TaskLinkBot/1.0)",
      ...headers,
    },
    redirect: "follow",
    signal: AbortSignal.timeout(5000),
  });
  const html = await res.text();
  const og =
    html.match(META_OG)?.[1] ?? html.match(META_OG_REV)?.[1] ?? null;
  const title = og ?? html.match(TITLE_TAG)?.[1]?.trim() ?? null;
  return {
    title: title ? decodeHtmlEntities(title) : null,
    url,
    platform,
  };
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export async function parseGeneric(url: string): Promise<MetadataResult> {
  return fetchHtmlTitle(url, "generic");
}
