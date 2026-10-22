"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button, DishThumb, Footer, Header, Icon, Input, Note, Page, Select } from "./ui";
import { SkeletonList } from "./States";
import { useToast } from "./Toast";
import { addMyReservation, rememberVendor, useUser } from "./hooks";
import { useT } from "./LangProvider";
import { listenListing, reserve } from "@/lib/data";
import { DORMS } from "@/lib/dorms";
import { isOpen } from "@/lib/time";

const MAX_PER_ORDER = 5;

export default function ReserveForm() {
  const t = useT();
  const router = useRouter();
  const { id } = useParams();
  const presetDorm = useSearchParams().get("dorm") ?? "";
  const [l, setL] = useState(undefined);
  const [name, setName] = useState("");
  const [dorm, setDorm] = useState(DORMS.some((d) => d.id === presetDorm) ? presetDorm : "");
  const [qty, setQty] = useState(1);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [soldOut, setSoldOut] = useState(false);
  const [toast, showToast] = useToast();
  const { user } = useUser();

  useEffect(() => listenListing(id, setL), [id]);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
      setName((n) => n || localStorage.getItem("reroot-name") || "");
    } catch {}
  }, []);
  // Signed-in students: fill in their saved name and dorm (a ?dorm= link still wins).
  useEffect(() => {
    if (user?.role !== "student") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the auth listener
    if (user.name) setName((n) => n || user.name);
    if (user.dorm) setDorm((d) => d || user.dorm);
  }, [user]);

  if (l === undefined) return (<><Header title={t("reserveTitle")} back /><Page><SkeletonList n={1} /></Page></>);

  const max = l ? Math.max(1, Math.min(MAX_PER_ORDER, l.servingsLeft)) : 1;
  const closed = !l || !isOpen(l) || soldOut;
  const q = Math.min(qty, max);

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = t("needName");
    if (!dorm) errs.dorm = t("needDorm");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const res = await reserve(l.id, { name: name.trim(), dorm, qty: q });
      // db.js may return just the code; mock returns { id, pickupCode }
      const resId = typeof res === "object" ? res.id : res;
      try {
        localStorage.setItem("reroot-name", name.trim());
      } catch {}
      rememberVendor(l.vendorId);
      addMyReservation(resId);
      router.replace(`/r/${resId}`);
    } catch (err) {
      setBusy(false);
      if (String(err?.message).includes("SOLD_OUT")) {
        setSoldOut(true);
        showToast(t("soldOutToast"), 5000);
      } else showToast(t("errorBody"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
      <Header title={t("reserveTitle")} back />
      <Page narrow className="gap-4">
        {l && (
          <div className="flex items-center gap-3 rounded-card border border-line bg-surface p-3">
            <DishThumb size={52} icon={26} />
            <div className="min-w-0">
              <p className="font-bold">{l.dish}</p>
              <p className="text-[13px] font-medium text-muted">
                ₱{l.price} · {t("left", { left: l.servingsLeft, total: l.servingsTotal })} · {l.vendorName}
              </p>
            </div>
          </div>
        )}
        <Input label={t("yourName")} placeholder={t("yourNamePh")} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" error={errors.name} maxLength={40} />
        <Select label={t("dorm")} value={dorm} onChange={(e) => setDorm(e.target.value)} error={errors.dorm}>
          <option value="" disabled>{t("dormPh")}</option>
          {DORMS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{t("servings")}</span>
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Less" onClick={() => setQty(Math.max(1, q - 1))} className="flex h-12 w-12 items-center justify-center rounded-control border-[1.5px] border-line bg-surface disabled:opacity-40" disabled={q <= 1}>
              <Icon name="minus" />
            </button>
            <span className="w-6 text-center text-[22px] font-extrabold" aria-live="polite">{q}</span>
            <button type="button" aria-label="More" onClick={() => setQty(Math.min(max, q + 1))} className="flex h-12 w-12 items-center justify-center rounded-control bg-primary text-white disabled:opacity-40" disabled={q >= max}>
              <Icon name="plus" />
            </button>
            <span className="text-[13px] font-medium text-muted">{t("max", { n: max })}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">{t("total")}</span>
          <span className="text-2xl font-extrabold text-primary">₱{(l?.price ?? 0) * q}</span>
        </div>
        <Note>{t("noAccount")}</Note>
      </Page>
      <Footer>
        {closed ? <Button disabled type="button">{t("soldOut")}</Button> : <Button type="submit" disabled={busy}>{busy ? t("reserving") : t("reserveN", { n: q })}</Button>}
      </Footer>
      {toast}
    </form>
  );
}
