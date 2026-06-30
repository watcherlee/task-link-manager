"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Cloud,
  Copy,
  Globe,
  Link2,
  Server,
  Zap,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

function isLocalHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.")
  );
}

function isTunnelHost(hostname: string) {
  return (
    hostname.endsWith(".loca.lt") ||
    hostname.endsWith(".trycloudflare.com") ||
    hostname.endsWith(".cfargotunnel.com")
  );
}

function isVercelHost(hostname: string) {
  return hostname.endsWith(".vercel.app");
}

export function ShareDeployPanel() {
  const t = useTranslations("deploy");
  const locale = useLocale();
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [cmdCopied, setCmdCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const hostname = useMemo(() => {
    try {
      return new URL(origin || "http://localhost").hostname;
    } catch {
      return "localhost";
    }
  }, [origin]);

  const isLocal = !origin || isLocalHost(hostname);
  const isTunnel = isTunnelHost(hostname);
  const isVercel = isVercelHost(hostname);
  const isOnline = !isLocal;

  const shareUrl = `${origin}/${locale}`;
  const shareCmd = "npm run share";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyCmd = async () => {
    await navigator.clipboard.writeText(shareCmd);
    setCmdCopied(true);
    setTimeout(() => setCmdCopied(false), 2000);
  };

  const badgeLabel = isVercel
    ? t("badgeVercel")
    : isTunnel
      ? t("badgeTunnel")
      : isOnline
        ? t("badgeOnline")
        : t("badgeFree");

  const titleLabel = isVercel
    ? t("titleVercel")
    : isTunnel
      ? t("titleTunnel")
      : isOnline
        ? t("titleOnline")
        : t("titleFree");

  const descLabel = isVercel
    ? t("descVercel")
    : isOnline
      ? t("descOnline")
      : t("descFree");

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-sm font-semibold">
            {isOnline ? (
              <>
                <Globe className="h-4 w-4 text-[var(--accent)]" />
                {titleLabel}
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 text-[var(--accent)]" />
                {titleLabel}
              </>
            )}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">{descLabel}</p>
        </div>
        <span
          className={
            isOnline
              ? "rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] text-[var(--accent)]"
              : "rounded-full bg-[#e8f0eb] px-2 py-0.5 text-[10px] text-[var(--accent)]"
          }
        >
          {badgeLabel}
        </span>
      </div>

      {isOnline && (
        <div className="mb-4 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)]/50 p-3">
          <p className="mb-2 text-[11px] text-[var(--muted)]">{t("yourLink")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 truncate rounded bg-white/70 px-2 py-1 text-xs">
              {shareUrl}
            </code>
            <Button type="button" size="sm" variant="accent" onClick={() => void copyLink()}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  {t("copyLink")}
                </>
              )}
            </Button>
          </div>
          {isTunnel && (
            <p className="mt-2 text-[10px] text-[var(--muted)]">{t("tunnelTip")}</p>
          )}
          {!isTunnel && (
            <p className="mt-2 text-[10px] text-[var(--muted)]">{t("onlineTip")}</p>
          )}
        </div>
      )}

      {isLocal && (
        <div className="space-y-3">
          <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)]/40 p-3">
            <div className="flex items-start gap-2">
              <Cloud className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
              <div>
                <p className="text-xs font-medium">{t("vercelTitle")}</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">{t("vercelDesc")}</p>
                <Link
                  href={`/${locale}/deploy`}
                  className="mt-2 inline-block text-[11px] text-[var(--accent)] underline"
                >
                  {t("vercelGuide")}
                </Link>
              </div>
            </div>
          </div>

          <DeployOption
            icon={Zap}
            title={t("tunnelTitle")}
            desc={t("tunnelDesc")}
            command={shareCmd}
          />

          <DeployOption
            icon={Server}
            title={t("dockerTitle")}
            desc={t("dockerDesc")}
            command="npm run deploy:docker"
          />

          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            {t("freeNote")}{" "}
            <Link href={`/${locale}/deploy`} className="text-[var(--accent)] underline">
              {t("fullGuide")}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

function DeployOption({
  icon: Icon,
  title,
  desc,
  command,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  command?: string;
}) {
  const t = useTranslations("deploy");
  const [copied, setCopied] = useState(false);

  const copyCmd = async () => {
    if (!command) return;
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] p-3">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">{title}</p>
          <p className="mt-0.5 text-[11px] text-[var(--muted)]">{desc}</p>
          {command && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="rounded bg-[#f5f2ec] px-2 py-1 text-[11px]">{command}</code>
              <Button type="button" size="sm" variant="outline" onClick={() => void copyCmd()}>
                {copied ? t("copied") : t("copyCmd")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
