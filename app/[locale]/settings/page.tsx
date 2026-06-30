"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const [apiBase, setApiBase] = useState("http://localhost:3000");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("captureApiBase");
    if (saved) setApiBase(saved);
    else if (typeof window !== "undefined") {
      setApiBase(window.location.origin);
    }
  }, []);

  const save = () => {
    localStorage.setItem("captureApiBase", apiBase.replace(/\/$/, ""));
  };

  const fixedBookmarklet = `javascript:(function(){var b=localStorage.getItem('captureApiBase')||'${apiBase.replace(/\/$/, "")}';fetch(b+'/api/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:location.href,title:document.title,kind:'bookmark'})}).then(function(r){return r.json()}).then(function(d){alert(d.ok?'Saved':'Failed:'+(d.error||''))}).catch(function(e){alert('Error:'+e)})})();`;

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t("title")}</h1>
        <div className="flex gap-2">
          <LocaleSwitcher />
          <Link href={`/${locale}`}>
            <Button variant="outline" size="sm">
              ←
            </Button>
          </Link>
        </div>
      </div>

      <section className="space-y-2">
        <label className="text-sm font-medium">{t("apiBase")}</label>
        <p className="text-xs text-zinc-500">{t("apiBaseHint")}</p>
        <Input value={apiBase} onChange={(e) => setApiBase(e.target.value)} />
        <Button onClick={save}>Save</Button>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">{t("bookmarklet")}</h2>
        <p className="break-all rounded-md bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
          {fixedBookmarklet}
        </p>
        <Button
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(fixedBookmarklet);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "✓" : t("copy")}
        </Button>
        <p className="text-xs text-zinc-500">
          将上方链接拖到浏览器书签栏。使用前请在任意页面控制台执行：
          localStorage.setItem(&apos;captureApiBase&apos;,&apos;{apiBase}&apos;)
        </p>
      </section>
    </main>
  );
}
