"use client";

// S1 Student home: recommendations + nearby list, radius chips, list/map toggle.
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Chip, Header, Icon, Note, Page, Button } from "@/components/ui";
import ListingCard from "@/components/ListingCard";
import NotifyOptIn from "@/components/NotifyOptIn";
import AccountButton from "@/components/AccountButton";
import BottomNav from "@/components/BottomNav";
import WelcomeCard from "@/components/WelcomeCard";
import { EmptyState, ErrorState, SkeletonList } from "@/components/States";
import { boughtFrom, usePosition, useStored } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { listenOpenListings } from "@/lib/data";
import { rankListings } from "@/lib/rank";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="rr-shimmer h-[60dvh] rounded-card bg-disabled" />,
});

const RADII = [300, 500, 1000];

export default function Home() {
  const t = useT();
  const pos = usePosition();
  const [radius, setRadius] = useStored("reroot-radius", 500);
  const [view, setView] = useStored("reroot-view", "list");
  const [listings, setListings] = useState(null);
  const [error, setError] = useState(false);
  const [tick, setTick] = useState(0);
  const [q, setQ] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    setError(false);
    try {
      return listenOpenListings(setListings);
    } catch {
      setError(true);
    }
  }, [tick]);

  // re-rank every minute so "ending soon" stays fresh
  const [, setNow] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, []);

  const ranked = useMemo(
    () => (listings ? rankListings(listings, pos, radius, boughtFrom()) : null),
    [listings, pos, radius]
  );
  // Search filters the ranked results by dish or vendor name.
  const needle = q.trim().toLowerCase();
  const match = ({ listing: l }) => !needle || `${l.dish} ${l.vendorName}`.toLowerCase().includes(needle);
  const shown = ranked && { recommended: needle ? [] : ranked.recommended, rest: needle ? ranked.all.filter(match).sort((a, b) => a.distance - b.distance) : ranked.rest };
  const GRID = "grid gap-3 md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <Header title={t("appName")} brand right={<AccountButton />} />
      <Page>
        <WelcomeCard />
        <label className="relative block">
          <span className="sr-only">{t("searchPh")}</span>
          <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchPh")} className="h-12 w-full rounded-full border-[1.5px] border-line bg-surface pl-10 pr-4 text-[15px] outline-none placeholder:text-muted focus:border-primary" />
        </label>
        <div className="flex items-center gap-1.5">
          <Icon name="pin" size={18} className="text-primary" />
          <span className="flex-1 text-sm font-semibold">{pos.fallback ? t("nearUST") : t("nearYou")}</span>
          <div className="flex rounded-full border border-line bg-surface p-[3px]" role="group" aria-label="View">
            {[["list", "list"], ["map", "map"]].map(([v, ic]) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-bold ${view === v ? "bg-primary text-white" : "text-muted"}`}>
                <Icon name={ic} size={14} /> {t(v)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {RADII.map((r) => (
            <Chip key={r} selected={radius === r} onClick={() => setRadius(r)}>
              {r < 1000 ? `${r} m` : "1 km"}
            </Chip>
          ))}
        </div>

        {pos.ready && pos.fallback && <Note tone="warn" icon="pin">{t("locationDenied")}</Note>}

        {error ? (
          <ErrorState onRetry={() => setTick((n) => n + 1)} />
        ) : !ranked ? (
          <SkeletonList />
        ) : ranked.all.length === 0 ? (
          <EmptyState action={radius < 1000 && <Button variant="secondary" onClick={() => setRadius(1000)}>{t("tryWider")}</Button>} />
        ) : needle && shown.rest.length === 0 ? (
          <EmptyState title={t("noResults", { q: q.trim() })} body={t("noResultsBody")} action={<Button variant="secondary" onClick={() => setQ("")}>{t("clearSearch")}</Button>} />
        ) : view === "map" ? (
          <MapView center={pos} radius={radius} items={needle ? shown.rest : [...ranked.recommended, ...ranked.rest]} />
        ) : (
          <>
            {shown.recommended.length > 0 && (
              <>
                <h2 className="mt-1 flex items-center gap-1.5 text-base font-bold">
                  <Icon name="spark" size={18} className="text-accent" /> {t("recommended")}
                </h2>
                <div className={GRID}>
                  {shown.recommended.map(({ listing, distance }) => (
                    <ListingCard key={listing.id} listing={listing} distance={distance} />
                  ))}
                </div>
              </>
            )}
            {shown.rest.length > 0 && (
              <h2 className="mt-1 flex items-baseline gap-2 text-base font-bold">
                {t("allNearby")} <span className="text-[13px] font-medium text-muted">{t("openCount", { n: needle ? shown.rest.length : ranked.all.length })}</span>
              </h2>
            )}
            <div className={GRID}>
              {shown.rest.map(({ listing, distance }) => (
                <ListingCard key={listing.id} listing={listing} distance={distance} />
              ))}
            </div>
          </>
        )}

        <NotifyOptIn position={{ lat: pos.lat, lng: pos.lng }} radius={radius} />

        <Link href="/login?next=/vendor" className="mt-auto py-3 text-center text-[13px] font-semibold text-primary">
          {t("vendorCta")} →
        </Link>
      </Page>
      <BottomNav kind="student" active="home" />
    </>
  );
}
