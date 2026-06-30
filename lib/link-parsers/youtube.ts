import type { MetadataResult } from "../types";

export async function parseYoutube(url: string): Promise<MetadataResult> {
  const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  const res = await fetch(oembed, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) {
    return { title: null, url, platform: "youtube", error: "oEmbed failed" };
  }
  const data = (await res.json()) as { title?: string };
  return { title: data.title ?? null, url, platform: "youtube" };
}

export async function parseYoutubeClient(url: string): Promise<MetadataResult | null> {
  try {
    const oembed = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembed);
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return { title: data.title ?? null, url, platform: "youtube" };
  } catch {
    return null;
  }
}
