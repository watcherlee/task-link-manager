import { detectPlatform, extractUrlFromText } from "./detect";
import { parseYoutubeClient } from "./youtube";
import type { MetadataResult } from "../types";

export async function fetchMetadataClient(
  text: string,
): Promise<MetadataResult | null> {
  const url = extractUrlFromText(text);
  if (!url) return null;
  const platform = detectPlatform(url);
  if (platform === "youtube") {
    return parseYoutubeClient(url);
  }
  return null;
}

export { detectPlatform, extractUrlFromText };
