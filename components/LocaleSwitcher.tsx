"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = locale === "zh" ? "en" : "zh";
  const label = locale === "zh" ? "EN" : "中文";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        const next = pathname.replace(`/${locale}`, `/${switchTo}`);
        router.push(next);
      }}
    >
      {label}
    </Button>
  );
}
