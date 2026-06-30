"use client";

import { useState } from "react";
import { Archive, BookOpen, Search, Settings, Share2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { HeaderAction } from "@/components/HeaderAction";
import { TaskInput } from "@/components/TaskInput";
import { TaskBoard } from "@/components/TaskBoard";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ArchivePanel } from "@/components/ArchivePanel";
import { ShareDeployPanel } from "@/components/ShareDeployPanel";
import { RolloverBanner } from "@/components/RolloverBanner";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { Stage, Task } from "@/lib/types";

export default function HomePage() {
  const t = useTranslations("app");
  const th = useTranslations("header");
  const locale = useLocale();
  const [refreshKey, setRefreshKey] = useState(0);
  const [archiveKey, setArchiveKey] = useState(0);
  const [focusStage, setFocusStage] = useState<Stage | undefined>();
  const [highlightId, setHighlightId] = useState<string | undefined>();
  const [searchOpen, setSearchOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    setArchiveKey((k) => k + 1);
  };

  const handleSearchSelect = (task: Task) => {
    if (task.stage !== "archived") {
      setFocusStage(task.stage);
      setHighlightId(task.id);
    }
    setSearchOpen(false);
    setTimeout(() => {
      document
        .getElementById(`task-${task.id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <main className="mx-auto flex min-h-full max-w-5xl flex-col gap-5 p-4 md:p-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-0.5 sm:justify-end">
          <HeaderAction
            icon={BookOpen}
            label={th("guide")}
            help={th("guideHelp")}
            href={`/${locale}/guide`}
          />
          <HeaderAction
            icon={Share2}
            label={th("share")}
            help={th("shareHelp")}
            active={shareOpen}
            onClick={() => setShareOpen((v) => !v)}
          />
          <HeaderAction
            icon={Search}
            label={th("search")}
            help={th("searchHelp")}
            active={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          />
          <HeaderAction
            icon={Archive}
            label={th("archive")}
            help={th("archiveHelp")}
            active={archiveOpen}
            onClick={() => setArchiveOpen((v) => !v)}
          />
          <HeaderAction
            icon={Settings}
            label={th("settings")}
            help={th("settingsHelp")}
            href={`/${locale}/settings`}
          />
          <LocaleSwitcher />
        </div>
      </header>

      <RolloverBanner />

      {shareOpen && (
        <div className="animate-fade-up">
          <ShareDeployPanel />
        </div>
      )}

      {searchOpen && (
        <div className="animate-fade-up">
          <GlobalSearch onSelect={handleSearchSelect} />
        </div>
      )}

      <TaskInput onCreated={refreshAll} />

      <TaskBoard
        key={`board-${refreshKey}`}
        focusStage={focusStage}
        highlightId={highlightId}
      />

      {archiveOpen && (
        <div className="animate-fade-up">
          <ArchivePanel key={`archive-${archiveKey}`} onChanged={refreshAll} />
        </div>
      )}
    </main>
  );
}
