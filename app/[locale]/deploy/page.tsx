"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export default function DeployGuidePage() {
  const t = useTranslations("deployGuide");
  const locale = useLocale();

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">{t("title")}</h1>
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">
            ←
          </Button>
        </Link>
      </div>

      <section className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)]/40 p-4 text-sm">
        <h2 className="mb-2 font-semibold text-[var(--accent)]">{t("recommended")}</h2>
        <p className="mb-3 text-[var(--muted)]">{t("recommendedDesc")}</p>
        <ul className="space-y-1 text-[var(--muted)]">
          <li>{t("costFree")}</li>
          <li>{t("noSignup")}</li>
          <li>{t("keepPcOn")}</li>
        </ul>
      </section>

      <section className="space-y-3 text-sm">
        <h2 className="font-semibold">{t("stepsTitle")}</h2>
        <ol className="list-decimal space-y-3 pl-5 text-[var(--muted)]">
          <li>{t("step1")}</li>
          <li>{t("step2")}</li>
          <li>{t("step3")}</li>
          <li>{t("step4")}</li>
        </ol>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
        <h2 className="mb-2 font-semibold">{t("laterTitle")}</h2>
        <p className="text-[var(--muted)]">{t("laterDesc")}</p>
        <code className="mt-3 block rounded-lg bg-[#f5f2ec] p-3 text-xs">npm run share</code>
      </section>

      <p className="text-xs text-[var(--muted)]">{t("detailHint")}</p>
    </main>
  );
}
