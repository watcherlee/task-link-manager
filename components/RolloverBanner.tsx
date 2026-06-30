"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export function RolloverBanner() {
  const t = useTranslations("rollover");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/cron/rollover", { method: "POST" })
      .then((r) => r.json())
      .then((data: { dailyCount?: number; weeklyCount?: number }) => {
        if (data.dailyCount && data.dailyCount > 0) {
          setMessage(t("dailyPending", { count: data.dailyCount }));
        } else if (data.weeklyCount && data.weeklyCount > 0) {
          setMessage(t("weeklyPending", { count: data.weeklyCount }));
        }
      })
      .catch(() => undefined);
  }, [t]);

  if (!message) return null;

  return (
    <div className="rounded-lg border border-[#e8d4a8] bg-[#faf3e4] px-4 py-2 text-sm text-[#7a5c1a]">
      {message}
      <button
        type="button"
        className="ml-3 text-xs underline"
        onClick={() => setMessage(null)}
      >
        {t("dismiss")}
      </button>
    </div>
  );
}
