"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Badge, Button, Footer, Header, Icon, Page } from "./ui";
import CountdownTimer from "./CountdownTimer";
import { EmptyState, SkeletonList } from "./States";
import { useT } from "./LangProvider";
import { listenListing } from "@/lib/data";
import { isOpen, minutesLeft } from "@/lib/time";
import { discount } from "@/lib/deal";

const LeafletMap = dynamic(() => import("./LeafletMap"), { ssr: false, loading: () => <div className="rr-shimmer h-full w-full bg-disabled" /> });
export const mapsLink = (l) => `https://www.google.com/maps/search/?api=1&query=${l.lat},${l.lng}`;

export default function ListingDetail() {
  const t = useT();
  const { id } = useParams();
  const dorm = useSearchParams().get("dorm");
  const [l, setL] = useState(undefined);
  useEffect(() => listenListing(id, setL), [id]);

  if (l === undefined)
    return (
      <>
        <Header title={t("dishDetails")} back="/" />
        <Page narrow><SkeletonList n={1} /></Page>
      </>
    );
  if (l === null)
    return (
      <>
        <Header title={t("dishDetails")} back="/" />
        <EmptyState title={t("notFound")} body="" action={<Button href="/" variant="secondary">{t("backHome")}</Button>} />
      </>
    );

  const open = isOpen(l);
  const pct = Math.max(4, Math.round((l.servingsLeft / l.servingsTotal) * 100));
  const reserveHref = `/l/${l.id}/reserve${dorm ? `?dorm=${encodeURIComponent(dorm)}` : ""}`;

  return (
    <>
      <Header title={t("dishDetails")} back="/" />
      {l.photo ? (
        // eslint-disable-next-line @next/next/no-img-element -- vendor photo stored as a small data URL
        <img src={l.photo} alt={l.dish} className="h-56 w-full object-cover md:h-72" />
      ) : (
        <div className="flex h-44 items-center justify-center bg-accent-soft text-accent">
          <Icon name="bowl" size={72} strokeWidth={1.6} />
        </div>
      )}
      <Page>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="deal">{t(l.dealType === "bigger_serving" ? "biggerServing" : "lowerPrice")}</Badge>
          {open && minutesLeft(l.cutoffAt) <= 30 && <Badge tone="ending">{t("endingSoon")}</Badge>}
          {!open && <Badge tone="soldout">{t("soldOut")}</Badge>}
        </div>
        <h2 className="text-[28px] font-extrabold leading-tight">{l.dish}</h2>
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-muted">
          <Icon name="store" size={16} /> {l.vendorName}
        </p>

        <section className="overflow-hidden rounded-card border border-line bg-surface">
          <div className="relative z-0 h-40">
            <LeafletMap center={{ lat: l.lat, lng: l.lng }} zoom={17} markers={[{ id: "store", lat: l.lat, lng: l.lng, html: '<span class="rr-pin rr-pin-top">📍</span>' }]} />
          </div>
          <div className="flex items-center gap-2 p-3">
            <Icon name="pin" size={18} className="shrink-0 text-primary" />
            <p className="min-w-0 flex-1 text-sm font-semibold">{t("pickupAt", { address: l.pickupAddress || l.vendorName })}</p>
            <a href={mapsLink(l)} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-primary-dark hover:border-primary">
              {t("openInMaps")} ↗
            </a>
          </div>
        </section>

        <section className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-4" aria-live="polite">
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xl font-bold">
              {open ? t("left", { left: l.servingsLeft, total: l.servingsTotal }) : t("soldOut")}
            </span>
            {open && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary-dark">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> {t("live")}
              </span>
            )}
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-primary-soft">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${open ? pct : 0}%` }} />
          </div>
          <CountdownTimer cutoffAt={l.cutoffAt} />
        </section>

        <p className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-primary">₱{l.price}</span>
          {discount(l) && <span className="text-lg font-bold text-muted line-through">₱{discount(l).original}</span>}
          {discount(l) && <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger-ink">{t("percentOff", { n: discount(l).percent })}</span>}
          <span className="text-[13px] font-medium text-muted">{t("perServing")}</span>
        </p>
        {l.dealNote && (
          <div className="flex items-center gap-2 rounded-control bg-accent-soft p-3 text-sm font-semibold text-accent-ink">
            <Icon name="bowl" size={18} className="shrink-0" /> {l.dealNote}
          </div>
        )}
      </Page>
      <Footer>
        {open ? <Button href={reserveHref}>{t("reserve")}</Button> : <Button disabled>{t("soldOut")}</Button>}
      </Footer>
    </>
  );
}
