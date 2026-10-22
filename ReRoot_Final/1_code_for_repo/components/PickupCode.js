"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Header, Icon, Page } from "./ui";
import { SkeletonList, EmptyState } from "./States";
import { useT } from "./LangProvider";
import { listenListing, listenReservation, setStatusMsg } from "@/lib/data";
import { dormName } from "@/lib/dorms";
import { clockTime, toMs } from "@/lib/time";

// statusMsg is stored as "who:key", e.g. "student:otw" or "vendor:ready" (see lib/copy.js msg.*)
export default function PickupCode() {
  const t = useT();
  const { id } = useParams();
  const [r, setR] = useState(undefined);
  const [l, setL] = useState(null);
  useEffect(() => listenReservation(id, setR), [id]);
  useEffect(() => (r?.listingId ? listenListing(r.listingId, setL) : undefined), [r?.listingId]);

  if (r === undefined) return (<><Header title={t("pickupTitle")} /><Page><SkeletonList n={1} /></Page></>);
  if (r === null) return (<><Header title={t("pickupTitle")} back="/" /><EmptyState title={t("notFound")} body="" action={<Button href="/" variant="secondary">{t("backHome")}</Button>} /></>);

  const claimed = r.status === "claimed";
  const [who] = (r.statusMsg || "").split(":");
  const msg = r.statusMsg ? t(`msg.${r.statusMsg}`) : null;

  return (
    <>
      <Header title={t("pickupTitle")} back="/" />
      <Page className="items-center gap-3.5 text-center">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${claimed ? "bg-success text-white" : "bg-primary-soft text-primary"}`}>
          <Icon name="check" size={30} strokeWidth={2.5} />
        </div>
        <h2 className="text-[28px] font-extrabold">{claimed ? t("pickedUp") : t("reserved")}</h2>
        {!claimed && <p className="text-sm text-muted">{t("showCode")}</p>}
        <div className={`flex gap-2.5 ${claimed ? "opacity-40" : ""}`} aria-label={`Pickup code ${r.pickupCode}`}>
          {r.pickupCode.split("").map((d, i) => (
            <span key={i} className="flex h-[78px] w-[66px] items-center justify-center rounded-[14px] border-2 border-primary bg-surface text-[40px] font-extrabold text-primary-dark">{d}</span>
          ))}
        </div>
        <div className="flex w-full flex-col gap-1.5 rounded-card border border-line bg-surface p-4 text-left">
          <p className="font-bold">{l?.dish ?? "…"} × {r.qty}</p>
          <p className="text-[13px] font-medium text-muted">{l?.vendorName} · {dormName(r.dorm)}</p>
          {l && <p className="text-[13px] font-medium text-muted">{t("pickupBefore", { time: clockTime(toMs(l.cutoffAt)), total: l.price * r.qty })}</p>}
        </div>
        {msg && (
          <div className={`flex w-full items-center gap-2 rounded-control p-3 text-left text-sm font-bold ${who === "vendor" ? "bg-primary-soft text-primary-dark" : "bg-disabled text-muted"}`} aria-live="polite">
            <Icon name="check" size={18} /> {who === "vendor" ? t("vendorSays", { msg }) : t("youSaid", { msg })}
          </div>
        )}
        {!claimed && (
          <div className="flex w-full flex-col gap-2 text-left">
            <p className="text-sm font-semibold">{t("letVendorKnow")}</p>
            <div className="flex gap-2">
              {["student:otw", "student:lobby"].map((k) => (
                <Button key={k} variant={r.statusMsg === k ? "primary" : "secondary"} className="text-[15px]" onClick={() => setStatusMsg(r.id, k)}>
                  {t(`msg.${k}`)}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Page>
    </>
  );
}
