"use client";

// Sale alerts for buyers: when a vendor nearby posts a new dish while the app is open,
// show an in-app banner, and a system notification if the buyer allowed notifications.
// (When the app is closed, the push comes from /api/notify through Firebase Cloud Messaging.)
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./ui";
import { useLang, useT } from "./LangProvider";
import { dataMode, listenOpenListings } from "@/lib/data";
import { dealAlertText } from "@/lib/deal";
import { UST, distanceM } from "@/lib/geo";

function myPlace() {
  try {
    const p = JSON.parse(localStorage.getItem("reroot-last-pos") || "null");
    if (p?.lat) return p;
  } catch {}
  return UST;
}
function myRadius() {
  try {
    return Number(JSON.parse(localStorage.getItem("reroot-radius") || "500")) || 500;
  } catch {
    return 500;
  }
}

export default function DealAlerts() {
  const t = useT();
  const { lang } = useLang();
  const [alert, setAlert] = useState(null);
  const seen = useRef(null);
  const langRef = useRef(lang);
  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    const startedAt = Date.now();
    const stop = listenOpenListings((list) => {
      if (window.location.pathname.startsWith("/vendor") || window.location.pathname.startsWith("/admin")) {
        seen.current = new Set(list.map((l) => l.id));
        return;
      }
      if (!seen.current) {
        seen.current = new Set(list.map((l) => l.id)); // first load: nothing is "new"
        return;
      }
      const here = myPlace();
      // Firebase mode: only posts within your radius (same rule as the push). Demo mode: every new post,
      // because demo vendors and testers are rarely at the same real location.
      const near = (l) => dataMode !== "firebase" || distanceM(here, l) <= myRadius();
      const fresh = list.filter((l) => !seen.current.has(l.id) && (l.createdAt || 0) >= startedAt - 60000 && near(l));
      list.forEach((l) => seen.current.add(l.id));
      if (!fresh.length) return;
      const l = fresh[0];
      const txt = dealAlertText(l, langRef.current);
      setAlert({ ...txt, id: l.id });
      try {
        // System notification whenever notifications are allowed, so it pops up even if this tab is in the background.
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          const opts = { body: txt.body, icon: "/icon-192.png", tag: `deal-${l.id}`, data: { link: `/l/${l.id}` } };
          navigator.serviceWorker?.getRegistration().then((reg) => (reg ? reg.showNotification(txt.title, opts) : new Notification(txt.title, opts)));
        }
      } catch {}
    });
    return stop;
  }, []);

  useEffect(() => {
    if (!alert) return;
    const id = setTimeout(() => setAlert(null), 9000);
    return () => clearTimeout(id);
  }, [alert]);

  if (!alert) return null;
  return (
    <div role="status" aria-live="polite" className="rr-sheet fixed inset-x-0 top-3 z-50 mx-auto w-[min(420px,calc(100%-24px))]">
      <div className="flex items-start gap-3 rounded-card border border-accent bg-surface p-3.5 shadow-xl">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-ink">
          <Icon name="bell" size={20} />
        </span>
        <Link href={`/l/${alert.id}`} onClick={() => setAlert(null)} className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-accent-ink">{alert.title}</p>
          <p className="text-[13px] font-semibold text-ink">{alert.body}</p>
          <p className="mt-0.5 text-xs font-bold text-primary">{t("viewDeal")} →</p>
        </Link>
        <button aria-label="Close" onClick={() => setAlert(null)} className="p-1 text-muted hover:text-ink">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
