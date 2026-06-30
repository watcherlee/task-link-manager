"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArchivePanel } from "@/components/ArchivePanel";
import { Button } from "@/components/ui/button";

export default function ArchivePage() {
  const t = useTranslations("archive");
  const locale = useLocale();

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">
            ←
          </Button>
        </Link>
      </div>
      <ArchivePanel />
    </main>
  );
}
