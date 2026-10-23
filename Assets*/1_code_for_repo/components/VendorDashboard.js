"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Header, Icon, Note, Page } from "./ui";
import { AlertCard, ResultsCard } from "./VendorCards";
import ShareSheet from "./ShareSheet";
import BottomNav from "./BottomNav";
import AccountButton from "./AccountButton";
import { useConfirm } from "./ConfirmDialog";
import { SkeletonList } from "./States";
import { useToast } from "./Toast";
import { useVendor } from "./hooks";
import { useT } from "./LangProvider";
import { closeListing, listenVendorListings, listenVendorReservations, signOut } from "@/lib/data";
import { clockTime, isOpen, toMs } from "@/lib/time";

export default function VendorDashboard() {
  const t = useT();
  const router = useRouter();
  const posted = useSearchParams().get("posted");
  const { vendor } = useVendor();
  const [listings, setListings] = useState(null);
  const [res, setRes] = useState([]);
  const [sharing, setSharing] = useState(null);
  const [toast, showToast] = useToast();
  const [dialog, confirm] = useConfirm();

  useEffect(() => (vendor ? listenVendorListings(vendor.id, setListings) : undefined), [vendor]);
  useEffect(() => (vendor ? listenVendorReservations(vendor.id, setRes) : undefined), [vendor]);

  // Right after posting, open the share sheet for the new dish.
  useEffect(() => {
    if (posted && listings) {
      const l = listings.find((x) => x.id === posted);
      if (l) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
        setSharing(l);
        showToast(t("posted"));
        router.replace("/vendor");
      }
    }
  }, [posted, listings, router, showToast, t]);

  const today = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return (listings ?? [])
      .filter((l) => toMs(l.createdAt) >= start.getTime() || isOpen(l))
      .sort((a, b) => Number(isOpen(b)) - Number(isOpen(a)) || toMs(b.createdAt) - toMs(a.createdAt));
  }, [listings]);
  const ordersFor = (id) => res.filter((r) => r.listingId === id && r.status !== "cancelled").length;
  const claimedCount = res.filter((r) => r.status === "claimed").length;

  if (!vendor) return (<><Header title="ReRoot" brand /><Page><SkeletonList n={2} /></Page></>);

  return (
    <>
      <Header title={vendor.name} brand right={<AccountButton />} />
      <Page>
        <AlertCard />
        <Button href="/vendor/post"><Icon name="plus" size={20} /> {t("postDish")}</Button>

        <h2 className="mt-1 flex items-baseline gap-2 text-base font-bold">
          {t("todaysListings")} <span className="text-[13px] font-medium text-muted">{today.length}</span>
        </h2>
        {!listings ? (
          <SkeletonList n={2} />
        ) : today.length === 0 ? (
          <Note tone="gray" icon="bowl">{t("noListings")}</Note>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
          {today.map((l) => {
            const open = isOpen(l);
            return (
              <div key={l.id} className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-3.5">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{l.dish}</p>
                    <p className="text-[13px] font-medium text-muted">
                      {t("left", { left: l.servingsLeft, total: l.servingsTotal })} · {t("ordersN", { n: ordersFor(l.id) })} · {t("until", { time: clockTime(toMs(l.cutoffAt)) })}
                    </p>
                  </div>
                  <Badge tone={open ? "left" : "soldout"}>{open ? t("open") : t("soldOut")}</Badge>
                </div>
                <div className="flex gap-2 text-[13px] font-bold">
                  <Link href={`/vendor/orders?l=${l.id}`} className="flex-1 rounded-control border border-line py-2.5 text-center">{t("orders")}</Link>
                  {open && (
                    <>
                      <button onClick={() => setSharing(l)} className="flex flex-1 items-center justify-center gap-1.5 rounded-control bg-primary py-2.5 text-white"><Icon name="share" size={15} /> {t("share")}</button>
                      <button onClick={async () => { if (await confirm({ title: t("confirmClose"), body: t("confirmCloseBody"), confirmLabel: t("yesClose") })) closeListing(l.id); }} className="flex-1 rounded-control border border-line py-2.5 text-muted hover:border-danger hover:text-danger-ink">{t("closeListing")}</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}

        <ResultsCard vendorId={vendor.id} refreshKey={claimedCount} />

        <div className="flex gap-2">
          <Button variant="secondary" href="/vendor/orders" className="text-[15px]">{t("ordersByDorm")}</Button>
          <Button variant="secondary" href="/vendor/check" className="text-[15px]">{t("checkCode")}</Button>
        </div>
        <button onClick={async () => { if (!(await confirm({ title: t("confirmLogout"), body: t("confirmLogoutBody"), confirmLabel: t("signOutShort") }))) return; await signOut(); router.replace("/login"); }} className="py-2 text-[13px] font-semibold text-muted hover:text-ink">
          {t("signOut")}
        </button>
      </Page>
      {sharing && <ShareSheet listing={sharing} onClose={() => setSharing(null)} onCopied={() => showToast(t("copied"))} />}
      <BottomNav kind="vendor" active="dashboard" />
      {dialog}
      {toast}
    </>
  );
}
