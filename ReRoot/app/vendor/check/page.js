"use client";

// V5 Order Codes: type the student's 4-digit code, or confirm from the live list of orders waiting for pickup.
import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Header, Icon, Page } from "@/components/ui";
import BottomNav from "@/components/BottomNav";
import { SkeletonList } from "@/components/States";
import { useConfirm } from "@/components/ConfirmDialog";
import { useVendor } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { checkPickupCode, listenVendorListings, listenVendorReservations } from "@/lib/data";
import { dormName } from "@/lib/dorms";

export default function OrderCodes() {
  const t = useT();
  const { vendor } = useVendor();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // {ok, r, code} | {ok:false}
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState(null);
  const [dishes, setDishes] = useState({});
  const [dialog, confirm] = useConfirm();
  const input = useRef(null);

  useEffect(() => (vendor ? listenVendorReservations(vendor.id, setOrders) : undefined), [vendor]);
  useEffect(
    () => (vendor ? listenVendorListings(vendor.id, (ls) => setDishes(Object.fromEntries(ls.map((l) => [l.id, l.dish])))) : undefined),
    [vendor]
  );
  const waiting = useMemo(
    () => (orders ? orders.filter((r) => r.status === "reserved").sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0)) : null),
    [orders]
  );

  async function claim(c) {
    if (c.length !== 4 || !vendor) return;
    setBusy(true);
    try {
      const r = await checkPickupCode(vendor.id, c);
      setResult({ ok: true, r, code: c });
      setCode("");
    } catch {
      setResult({ ok: false });
    }
    setBusy(false);
  }

  async function submit(e) {
    e.preventDefault();
    await claim(code);
    input.current?.focus();
  }

  async function claimFromList(r) {
    const ok = await confirm({
      title: t("codeValid", { code: r.pickupCode }),
      body: `${r.name} · ${dormName(r.dorm)} · ${dishes[r.listingId] ?? ""} ×${r.qty}`,
      confirmLabel: t("confirmPickup"),
    });
    if (ok) await claim(r.pickupCode);
  }

  return (
    <>
      <Header title={t("checkTitle")} back="/vendor" />
      <Page narrow className="gap-4">
        <form onSubmit={submit} className="flex flex-col gap-3" noValidate>
          <label htmlFor="pickup-code" className="text-[15px] text-muted">{t("checkBody")}</label>
          <input
            id="pickup-code"
            ref={input}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 4));
              setResult(null);
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            autoFocus
            placeholder="• • • •"
            maxLength={4}
            className="h-[84px] w-full rounded-[14px] border-2 border-line bg-surface text-center text-[40px] font-extrabold tracking-[0.5em] tabular-nums outline-none placeholder:text-line focus:border-primary"
          />
          <Button type="submit" disabled={code.length !== 4 || busy}>{t("confirmPickup")}</Button>
        </form>

        {result?.ok && (
          <div className="flex flex-col gap-1.5 rounded-card border-[1.5px] border-success bg-primary-soft p-4" role="status">
            <p className="flex items-center gap-2 font-bold text-primary-dark"><Icon name="check" size={22} strokeWidth={2.5} className="text-success" /> {t("codeValid", { code: result.code })}</p>
            <p className="text-sm font-semibold">{result.r.name} · {dormName(result.r.dorm)} · ×{result.r.qty}</p>
            <p className="text-[13px] text-primary-dark">{t("markedClaimed")}</p>
          </div>
        )}
        {result && !result.ok && (
          <div className="flex items-center gap-2 rounded-card bg-danger-soft p-4 text-sm font-semibold text-danger-ink" role="alert">
            <Icon name="x" size={20} /> {t("codeNotFound")}
          </div>
        )}

        <section className="flex flex-col gap-2.5">
          <h2 className="flex items-baseline gap-2 text-base font-bold">
            {t("activeCodes")} {waiting && <span className="text-[13px] font-medium text-muted">{waiting.length}</span>}
          </h2>
          {!waiting ? (
            <SkeletonList n={2} />
          ) : waiting.length === 0 ? (
            <p className="rounded-card border border-dashed border-line p-4 text-center text-sm text-muted">{t("activeCodesNone")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {waiting.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
                  <span className="rounded-control bg-primary-soft px-3 py-2 text-xl font-extrabold tabular-nums tracking-widest text-primary-dark">{r.pickupCode}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{r.name} · ×{r.qty}</span>
                    <span className="block truncate text-[13px] text-muted">{dormName(r.dorm)}{dishes[r.listingId] ? ` · ${dishes[r.listingId]}` : ""}</span>
                  </span>
                  <Button variant="secondary" className="h-10! w-auto! shrink-0 px-3! text-sm!" disabled={busy} onClick={() => claimFromList(r)}>
                    {t("confirmShort")}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Page>
      <BottomNav kind="vendor" active="check" />
      {dialog}
    </>
  );
}
