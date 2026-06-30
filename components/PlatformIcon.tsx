"use client";

import type { Platform } from "@/lib/types";

const LABELS: Record<Platform, string> = {
  bilibili: "B站",
  weixin: "微信",
  feishu: "飞书",
  xiaohongshu: "小红书",
  youtube: "YT",
  generic: "🔗",
};

export function PlatformIcon({ platform }: { platform: Platform | null }) {
  if (!platform) return null;
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center rounded bg-zinc-100 px-1 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
      title={platform}
    >
      {LABELS[platform]}
    </span>
  );
}
