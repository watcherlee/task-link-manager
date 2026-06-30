"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Inbox,
  Link2,
  Search,
  Star,
  Tags,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <h2 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold">
        <Icon className="h-4 w-4 text-[var(--accent)]" />
        {title}
      </h2>
      <div className="space-y-2 text-sm leading-relaxed text-[var(--muted)]">
        {children}
      </div>
    </section>
  );
}

function Step({
  n,
  title,
  desc,
}: {
  n: number;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
        {n}
      </span>
      <div>
        <p className="font-medium text-[var(--foreground)]">{title}</p>
        <p className="mt-0.5 text-[13px]">{desc}</p>
      </div>
    </div>
  );
}

export default function GuidePage() {
  const t = useTranslations("guide");
  const locale = useLocale();

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-semibold md:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("subtitle")}</p>
        </div>
        <Link href={`/${locale}`}>
          <Button variant="outline" size="sm">
            {t("back")}
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)]/40 p-4 text-sm text-[var(--foreground)]">
        {t("welcome")}
      </div>

      <Section icon={Inbox} title={t("flowTitle")}>
        <p>{t("flowIntro")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--foreground)]">
          <span className="rounded-md bg-[#faf3e4] px-2 py-1">{t("flowInbox")}</span>
          <ArrowRight className="h-3 w-3 text-[var(--muted)]" />
          <span className="rounded-md bg-[#e8eef5] px-2 py-1">{t("flowWeek")}</span>
          <ArrowRight className="h-3 w-3 text-[var(--muted)]" />
          <span className="rounded-md bg-[#e8f0eb] px-2 py-1">{t("flowToday")}</span>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>{t("flowInboxDesc")}</li>
          <li>{t("flowWeekDesc")}</li>
          <li>{t("flowTodayDesc")}</li>
        </ul>
      </Section>

      <Section icon={BookOpen} title={t("quickStartTitle")}>
        <div className="space-y-4">
          <Step n={1} title={t("qs1Title")} desc={t("qs1Desc")} />
          <Step n={2} title={t("qs2Title")} desc={t("qs2Desc")} />
          <Step n={3} title={t("qs3Title")} desc={t("qs3Desc")} />
          <Step n={4} title={t("qs4Title")} desc={t("qs4Desc")} />
        </div>
      </Section>

      <Section icon={Link2} title={t("linkTitle")}>
        <p>{t("linkDesc")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t("link1")}</li>
          <li>{t("link2")}</li>
          <li>{t("link3")}</li>
        </ul>
      </Section>

      <Section icon={Star} title={t("actionTitle")}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--foreground)]">
                <th className="pb-2 pr-3 font-medium">{t("actionCol")}</th>
                <th className="pb-2 font-medium">{t("actionWhere")}</th>
              </tr>
            </thead>
            <tbody className="text-[var(--muted)]">
              <tr className="border-b border-[var(--border)]/60">
                <td className="py-2 pr-3">{t("actWeek")}</td>
                <td className="py-2">{t("actWeekWhere")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60">
                <td className="py-2 pr-3">{t("actToday")}</td>
                <td className="py-2">{t("actTodayWhere")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60">
                <td className="py-2 pr-3">{t("actDone")}</td>
                <td className="py-2">{t("actDoneWhere")}</td>
              </tr>
              <tr className="border-b border-[var(--border)]/60">
                <td className="py-2 pr-3">{t("actEdit")}</td>
                <td className="py-2">{t("actEditWhere")}</td>
              </tr>
              <tr>
                <td className="py-2 pr-3">{t("actDrag")}</td>
                <td className="py-2">{t("actDragWhere")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section icon={Tags} title={t("extraTitle")}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("extra1")}</li>
          <li>{t("extra2")}</li>
          <li>{t("extra3")}</li>
          <li>{t("extra4")}</li>
        </ul>
      </Section>

      <Section icon={Search} title={t("tipsTitle")}>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("tip1")}</li>
          <li>{t("tip2")}</li>
          <li>{t("tip3")}</li>
        </ul>
      </Section>

      <div className="flex flex-wrap gap-2 pt-2">
        <Link href={`/${locale}`}>
          <Button variant="accent" size="sm">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t("tryNow")}
          </Button>
        </Link>
        <Link href={`/${locale}/deploy`}>
          <Button variant="outline" size="sm">
            {t("deployLink")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
