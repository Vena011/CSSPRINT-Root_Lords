"use client";

// Inbox: one chat per order. Students see their reservations; vendors see orders for their store.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, DishThumb, Header, Page } from "@/components/ui";
import BottomNav from "@/components/BottomNav";
import { EmptyState, SkeletonList } from "@/components/States";
import { isUnread, useThreads } from "@/components/inbox";
import { useT } from "@/components/LangProvider";
import { listenListing } from "@/lib/data";
import { dormName } from "@/lib/dorms";
import { clockTime, toMs } from "@/lib/time";

function when(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const today = new Date();
  return d.toDateString() === today.toDateString() ? clockTime(ms) : d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function ThreadRow({ r, role, unread }) {
  const t = useT();
  const [l, setL] = useState(null);
  useEffect(() => listenListing(r.listingId, setL), [r.listingId]);
  const title = role === "vendor" ? `${r.name} · ${dormName(r.dorm)}` : l?.vendorName ?? "…";
  const preview = r.lastMsg
    ? `${r.lastFrom === role ? `${t("you")}: ` : ""}${r.lastMsg}`
    : t("chatStart");
  const status = r.status === "claimed" ? ["claimed", t("statusClaimed")] : r.status === "cancelled" ? ["soldout", t("statusCancelled")] : ["left", t("statusReservedShort")];
  return (
    <Link href={`/inbox/${r.id}`} className={`flex items-center gap-3 rounded-card border bg-surface p-3 transition-colors hover:border-primary ${unread ? "border-primary/60" : "border-line"}`}>
      <DishThumb size={52} icon={24} photo={l?.photo} alt={l?.dish} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate ${unread ? "font-extrabold" : "font-bold"}`}>{title}</p>
          <span className={`shrink-0 text-xs ${unread ? "font-bold text-primary" : "text-muted"}`}>{when(r.lastMsgAt || toMs(r.createdAt))}</span>
        </div>
        <p className="truncate text-[13px] text-muted">
          {l?.dish ?? "…"} ×{r.qty} · {t("codeShort", { code: r.pickupCode })}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-[13px] ${unread ? "font-bold text-ink" : "text-muted"}`}>{preview}</p>
          {unread ? <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="unread" /> : <Badge tone={status[0]}>{status[1]}</Badge>}
        </div>
      </div>
    </Link>
  );
}

export default function Inbox() {
  const t = useT();
  const { role, userLoading, loading, threads, reads } = useThreads();
  return (
    <>
      <Header title={t("inboxTitle")} back={role === "vendor" ? "/vendor" : "/"} />
      <Page narrow className="gap-2.5">
        {loading ? (
          <SkeletonList n={3} />
        ) : threads.length === 0 ? (
          <EmptyState
            icon="chat"
            title={t("inboxTitle")}
            body={role === "vendor" ? t("inboxEmptyVendor") : t("inboxEmptyStudent")}
          />
        ) : (
          threads.map((r) => <ThreadRow key={r.id} r={r} role={role} unread={isUnread(r, role, reads)} />)
        )}
      </Page>
      {userLoading ? <div className="h-[72px]" aria-hidden="true" /> : <BottomNav kind={role === "vendor" ? "vendor" : "student"} active="inbox" />}
    </>
  );
}
