"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Header, Icon, Note, Page } from "./ui";
import { shareListing } from "./ShareSheet";
import BottomNav from "./BottomNav";
import { SkeletonList } from "./States";
import { useToast } from "./Toast";
import { useVendor } from "./hooks";
import { useT } from "./LangProvider";
import { listenVendorListings, listenVendorReservations, sendMessage } from "@/lib/data";
import { dormName } from "@/lib/dorms";
import { isOpen, toMs } from "@/lib/time";

// Pickup only, no delivery: the vendor can say the order is ready, or that it sold out.
const VENDOR_MSGS = ["vendor:ready", "vendor:soldout"];

export default function VendorOrders() {
  const t = useT();
  const router = useRouter();
  const only = useSearchParams().get("l");
  const { vendor } = useVendor();
  const [listings, setListings] = useState([]);
  const [res, setRes] = useState(null);
  const [toast, showToast] = useToast();

  useEffect(() => (vendor ? listenVendorListings(vendor.id, setListings) : undefined), [vendor]);
  useEffect(() => (vendor ? listenVendorReservations(vendor.id, setRes) : undefined), [vendor]);

  const listing = listings.find((l) => l.id === only) ?? null;
  const shown = useMemo(() => (res ?? []).filter((r) => r.status !== "cancelled" && (!only || r.listingId === only)), [res, only]);
  const groups = useMemo(() => {
    const m = new Map();
    for (const r of [...shown].sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt))) {
      if (!m.has(r.dorm)) m.set(r.dorm, []);
      m.get(r.dorm).push(r);
    }
    return [...m.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [shown]);
  const byId = Object.fromEntries(listings.map((l) => [l.id, l]));
  const reservedServings = shown.reduce((s, r) => s + r.qty, 0);

  // Share button per dorm: shares this listing (or the newest open one) with ?dorm=
  const shareTarget = listing ?? listings.find(isOpen) ?? null;

  return (
    <>
      <Header title={listing ? `${t("ordersTitle")} · ${listing.dish}` : t("ordersTitle")} back="/vendor" />
      <Page>
        {listings.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => router.replace("/vendor/orders")} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-bold ${!only ? "bg-primary text-white" : "border border-line bg-surface"}`}>{t("allListings")}</button>
            {listings.map((l) => (
              <button key={l.id} onClick={() => router.replace(`/vendor/orders?l=${l.id}`)} className={`h-9 shrink-0 rounded-full px-3.5 text-[13px] font-bold ${only === l.id ? "bg-primary text-white" : "border border-line bg-surface"}`}>{l.dish}</button>
            ))}
          </div>
        )}
        {listing && (
          <p className="text-[13px] font-medium text-muted">
            {t("reservedSummary", { r: reservedServings, l: listing.servingsLeft, o: shown.length })}
          </p>
        )}
        {!res ? (
          <SkeletonList n={2} />
        ) : groups.length === 0 ? (
          <Note tone="gray" icon="share">{t("noOrders")}</Note>
        ) : (
          <div className="grid items-start gap-3 md:grid-cols-2">
          {groups.map(([dorm, list]) => (
            <section key={dorm} className="overflow-hidden rounded-card border border-line bg-surface">
              <div className="flex items-center gap-2 bg-primary-soft px-4 py-3">
                <div className="flex-1">
                  <h2 className="font-bold text-primary-dark">{dormName(dorm)}</h2>
                  <p className="text-[13px] text-primary-dark">
                    {t("ordersN", { n: list.length })} · {list.reduce((s, r) => s + r.qty, 0)} {t("servings").toLowerCase()}
                  </p>
                </div>
                {shareTarget && isOpen(shareTarget) && (
                  <button onClick={() => shareListing({ listing: shareTarget, dormId: dorm, t, onCopied: () => showToast(t("copied")) })} className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-[13px] font-bold text-white">
                    <Icon name="share" size={16} /> {t("share")}
                  </button>
                )}
              </div>
              {list.map((r) => (
                <div key={r.id} className="flex flex-col gap-2 border-t border-line px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {r.name}
                      {!only && byId[r.listingId] && <span className="font-medium text-muted"> · {byId[r.listingId].dish}</span>}
                    </span>
                    <span className="text-sm text-muted">×{r.qty}</span>
                    <span className="text-[15px] font-extrabold tabular-nums">{r.pickupCode}</span>
                    <Badge tone={r.status === "claimed" ? "claimed" : "left"}>{r.status === "claimed" ? t("statusClaimed") : t("statusReserved")}</Badge>
                  </div>
                  {r.statusMsg?.startsWith("student:") && r.status !== "claimed" && (
                    <p className="text-[13px] font-bold text-accent-ink">“{t(`msg.${r.statusMsg}`)}”</p>
                  )}
                  {r.status !== "claimed" && (
                    <div className="flex gap-1.5">
                      {VENDOR_MSGS.map((k) => (
                        <button
                          key={k}
                          onClick={() => sendMessage(r.id, { from: "vendor", kind: "status", key: k, text: t(`msg.${k}`) }).catch(() => showToast(t("sendFailed"), 4000))}
                          className={`h-9 flex-1 rounded-full text-xs font-bold ${r.statusMsg === k ? "bg-primary text-white" : "border border-line hover:border-primary"}`}
                        >
                          {t(`msg.${k}`)}
                        </button>
                      ))}
                      <Link href={`/inbox/${r.id}`} className="flex h-9 items-center gap-1 rounded-full border border-line px-3 text-xs font-bold text-primary-dark hover:border-primary" aria-label={`${t("chatBtn")} · ${r.name}`}>
                        <Icon name="chat" size={14} /> {t("chatBtn")}
                        {r.lastFrom === "student" && r.lastMsg && <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />}
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </section>
          ))}
          </div>
        )}
        <Button variant="secondary" href="/vendor/check"><Icon name="key" size={18} /> {t("checkCode")}</Button>
      </Page>
      <BottomNav kind="vendor" active="orders" />
      {toast}
    </>
  );
}
