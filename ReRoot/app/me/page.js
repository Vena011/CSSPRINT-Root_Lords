"use client";

// My orders: reservations made on this phone (ids saved locally when reserving), live status.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Button, DishThumb, Header, Page } from "@/components/ui";
import BottomNav from "@/components/BottomNav";
import { EmptyState, SkeletonList } from "@/components/States";
import { myReservationIds, useStudentOnly } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { listenListing, listenReservation } from "@/lib/data";
import { dormName } from "@/lib/dorms";

function Row({ id }) {
  const t = useT();
  const [r, setR] = useState(undefined);
  const [l, setL] = useState(null);
  useEffect(() => listenReservation(id, setR), [id]);
  useEffect(() => (r?.listingId ? listenListing(r.listingId, setL) : undefined), [r?.listingId]);
  if (r === undefined) return <SkeletonList n={1} />;
  if (!r) return null;
  const tone = r.status === "claimed" ? "claimed" : r.status === "cancelled" ? "soldout" : "left";
  const label = r.status === "claimed" ? t("statusClaimed") : r.status === "cancelled" ? t("statusCancelled") : t("statusReserved");
  return (
    <Link href={`/r/${r.id}`} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3 hover:border-primary">
      <DishThumb size={56} icon={24} photo={l?.photo} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{l?.dish ?? "…"} × {r.qty}</p>
        <p className="truncate text-[13px] text-muted">{l?.vendorName} · {dormName(r.dorm)}</p>
        <p className="text-[13px] font-bold tabular-nums">{r.status === "reserved" ? `Code ${r.pickupCode}` : ""}</p>
      </div>
      <Badge tone={tone}>{label}</Badge>
    </Link>
  );
}

export default function Mine() {
  const t = useT();
  useStudentOnly();
  const [ids, setIds] = useState(null);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
  useEffect(() => setIds(myReservationIds()), []);
  return (
    <>
      <Header title={t("mineTitle")} />
      <Page narrow>
        {ids === null ? (
          <SkeletonList n={2} />
        ) : ids.length === 0 ? (
          <EmptyState title={t("mineEmpty")} body={t("mineEmptyBody")} action={<Button href="/">{t("browse")}</Button>} />
        ) : (
          ids.map((id) => <Row key={id} id={id} />)
        )}
      </Page>
      <BottomNav kind="student" active="mine" />
    </>
  );
}
