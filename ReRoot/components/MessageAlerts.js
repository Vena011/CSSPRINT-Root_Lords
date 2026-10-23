"use client";

// Inbox alerts while the app is open: a banner for a new message (either side) and, for vendors, a new order.
// If the tab is in the background and notifications are allowed, a system notification is shown too.
// (When the app is closed, the push comes from /api/notify through Firebase Cloud Messaging.)
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./ui";
import { useThreads } from "./inbox";
import { useT } from "./LangProvider";
import { listenVendorListings } from "@/lib/data";
import { dormName } from "@/lib/dorms";
import { toMs } from "@/lib/time";

function systemNotify(title, body, link, tag) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    const opts = { body, icon: "/icon-192.png", tag, data: { link } };
    navigator.serviceWorker?.getRegistration().then((reg) => (reg ? reg.showNotification(title, opts) : new Notification(title, opts)));
  } catch {}
}

export default function MessageAlerts() {
  const t = useT();
  const { role, user, threads } = useThreads();
  const [alert, setAlert] = useState(null); // { title, body, href, cta }
  const prev = useRef(null); // Map id → lastMsgAt, from the previous snapshot
  const dishes = useRef({});
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const vendorId = role === "vendor" ? user?.vendor?.id : null;
  useEffect(() => (vendorId ? listenVendorListings(vendorId, (ls) => (dishes.current = Object.fromEntries(ls.map((l) => [l.id, l.dish])))) : undefined), [vendorId]);

  // A new account (log in / log out) starts fresh: nothing in the first snapshot counts as new.
  useEffect(() => {
    prev.current = null;
  }, [role, user?.uid]);

  useEffect(() => {
    if (!threads) return;
    const before = prev.current;
    prev.current = new Map(threads.map((r) => [r.id, r.lastMsgAt || 0]));
    if (!before) return;
    const tt = tRef.current;
    const here = window.location.pathname;
    for (const r of threads) {
      const was = before.get(r.id);
      if (was === undefined) {
        // New reservation: tell the vendor.
        if (role === "vendor" && r.status === "reserved" && Date.now() - (toMs(r.createdAt) || 0) < 5 * 60000) {
          const title = tt("newOrderTitle", { name: r.name, qty: r.qty });
          const body = tt("newOrderBody", { dish: dishes.current[r.listingId] ?? "", code: r.pickupCode, dorm: dormName(r.dorm) });
          setAlert({ title, body, href: "/vendor/orders", cta: tt("viewOrder"), id: r.id });
          systemNotify(title, body, "/vendor/orders", `order-${r.id}`);
        }
        continue;
      }
      if ((r.lastMsgAt || 0) > was && r.lastFrom && r.lastFrom !== role && here !== `/inbox/${r.id}`) {
        const title = role === "vendor" ? `${r.name} · ${dormName(r.dorm)}` : r.vendorName || tt("vendorSays", { msg: "" }).replace(/:\s*$/, "");
        const body = r.lastMsg || "";
        setAlert({ title, body, href: `/inbox/${r.id}`, cta: tt("viewChat"), id: r.id });
        systemNotify(title, body, `/inbox/${r.id}`, `msg-${r.id}`);
      }
    }
  }, [threads, role]);

  useEffect(() => {
    if (!alert) return;
    const id = setTimeout(() => setAlert(null), 8000);
    return () => clearTimeout(id);
  }, [alert]);

  if (!alert) return null;
  return (
    <div role="status" aria-live="polite" className="rr-sheet fixed inset-x-0 top-3 z-50 mx-auto w-[min(420px,calc(100%-24px))]">
      <div className="flex items-start gap-3 rounded-card border border-primary bg-surface p-3.5 shadow-xl">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
          <Icon name="chat" size={20} />
        </span>
        <Link href={alert.href} onClick={() => setAlert(null)} className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-primary-dark">{alert.title}</p>
          <p className="line-clamp-2 text-[13px] font-semibold text-ink">{alert.body}</p>
          <p className="mt-0.5 text-xs font-bold text-primary">{alert.cta} →</p>
        </Link>
        <button aria-label="Close" onClick={() => setAlert(null)} className="p-1 text-muted hover:text-ink">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
