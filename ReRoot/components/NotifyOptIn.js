"use client";

// Tier 3: push opt-in card on the student home, with iPhone "Add to Home Screen" steps.
import { useEffect, useState } from "react";
import { Button, Icon, Note } from "./ui";
import { useT } from "./LangProvider";
import { enablePush } from "@/lib/data";

const KEY = "reroot-notify-dismissed";

export default function NotifyOptIn({ position, radius }) {
  const t = useT();
  const [mode, setMode] = useState("hidden"); // hidden | ask | ios | denied | done

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {}
    if (dismissed) return;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone;
    if (typeof Notification === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
      if (ios && !standalone) setMode("ios");
      return;
    }
    if (Notification.permission === "default") setMode("ask");
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setMode("hidden");
  };

  const turnOn = async () => {
    try {
      const ok = await enablePush({ ...position, radiusM: radius });
      setMode(ok ? "done" : "denied");
      if (ok) {
        // confirmation, so the student can see notifications work on this device
        try {
          const reg = await navigator.serviceWorker?.getRegistration();
          const opts = { body: t("notifyDone"), icon: "/icon-192.png", tag: "reroot-welcome" };
          if (reg) reg.showNotification("ReRoot", opts);
          else new Notification("ReRoot", opts);
        } catch {}
      }
    } catch {
      setMode("denied");
    }
  };

  if (mode === "hidden") return null;
  if (mode === "done") return <Note icon="check">{t("notifyDone")}</Note>;
  if (mode === "denied") return <Note tone="gray" icon="bell">{t("notifyDenied")}</Note>;

  if (mode === "ios")
    return (
      <section className="flex flex-col gap-3 rounded-card bg-primary-soft p-4 text-primary-dark">
        <div className="flex items-start gap-2">
          <h2 className="flex-1 text-base font-bold">{t("iosTitle")}</h2>
          <button aria-label="Close" onClick={dismiss}><Icon name="x" size={18} /></button>
        </div>
        {[["sharebox", "ios1"], ["plussq", "ios2"], ["bell", "ios3"]].map(([ic, k], i) => (
          <div key={k} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary"><Icon name={ic} size={18} /></span>
            <span className="text-sm font-semibold">{i + 1}. {t(k)}</span>
          </div>
        ))}
      </section>
    );

  return (
    <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink"><Icon name="bell" size={22} /></span>
        <div>
          <h2 className="text-base font-bold leading-snug">{t("notifyTitle")}</h2>
          <p className="text-[13px] font-medium text-muted">{t("notifyBody")}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="h-11 text-sm" onClick={turnOn}>{t("notifyOn")}</Button>
        <Button className="h-11 w-auto px-4 text-sm" variant="secondary" onClick={dismiss}>{t("notNow")}</Button>
      </div>
    </section>
  );
}
