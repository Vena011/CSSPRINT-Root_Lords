"use client";

import Link from "next/link";
import { Badge, DishThumb } from "./ui";
import { useT } from "./LangProvider";
import { formatDistance } from "@/lib/geo";
import { clockTime, isOpen, minutesLeft, toMs } from "@/lib/time";

// listing: Firestore listing doc. distance: metres (optional).
export default function ListingCard({ listing: l, distance, href }) {
  const t = useT();
  const open = isOpen(l);
  const ending = open && minutesLeft(l.cutoffAt) <= 30;
  const meta = [l.vendorName, distance != null ? formatDistance(distance) : null, t("until", { time: clockTime(toMs(l.cutoffAt)) })]
    .filter(Boolean)
    .join(" · ");
  return (
    <Link
      href={href ?? `/l/${l.id}`}
      className={`flex gap-3 rounded-card border border-line bg-surface p-3 transition-transform active:scale-[.99] ${open ? "" : "opacity-60"}`}
    >
      <DishThumb />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-base font-bold leading-snug">{l.dish}</h3>
          <span className="text-base font-extrabold text-primary">₱{l.price}</span>
        </div>
        <p className="text-[13px] font-medium leading-snug text-muted">{meta}</p>
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {open ? (
            <Badge tone="left">{t("left", { left: l.servingsLeft, total: l.servingsTotal })}</Badge>
          ) : (
            <Badge tone="soldout">{t("soldOut")}</Badge>
          )}
          <Badge tone="deal">{t(l.dealType === "bigger_serving" ? "biggerServing" : "lowerPrice")}</Badge>
          {ending && <Badge tone="ending">{t("endingSoon")}</Badge>}
        </div>
      </div>
    </Link>
  );
}
