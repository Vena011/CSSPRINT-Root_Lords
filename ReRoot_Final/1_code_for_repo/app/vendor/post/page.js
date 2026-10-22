"use client";

// V3 Post a dish
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Footer, Header, Input, Note, Page } from "@/components/ui";
import { useVendor } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { createListing } from "@/lib/data";

function defaultCutoff() {
  const d = new Date(Date.now() + 2 * 3600000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, "0")}`;
}

export default function PostDish() {
  const t = useT();
  const router = useRouter();
  const { vendor } = useVendor();
  const [f, setF] = useState({ dish: "", servings: "", maxOrders: "", dealType: "lower_price", price: "", cutoff: "", dealNote: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
  useEffect(() => setF((p) => (p.cutoff ? p : { ...p, cutoff: defaultCutoff() })), []);

  async function submit(e) {
    e.preventDefault();
    const servings = parseInt(f.servings, 10);
    const price = parseInt(f.price, 10);
    const maxOrders = parseInt(f.maxOrders || f.servings, 10);
    if (!f.dish.trim() || !(servings > 0) || !(price > 0) || !f.cutoff) return setErr(t("fillAll"));
    const [h, m] = f.cutoff.split(":").map(Number);
    const cut = new Date();
    cut.setHours(h, m, 0, 0);
    if (cut.getTime() <= Date.now()) return setErr(t("cutoffPast"));
    setErr("");
    setBusy(true);
    try {
      const id = await createListing({
        vendorId: vendor.id,
        vendorName: vendor.name,
        dish: f.dish.trim(),
        dealType: f.dealType,
        dealNote: f.dealNote.trim(),
        price,
        servingsTotal: servings,
        maxOrders: Math.max(1, Math.min(maxOrders, servings)),
        cutoffAt: cut.getTime(),
        lat: vendor.lat,
        lng: vendor.lng,
      });
      // J7: push to nearby students. Safe to fail while the API route isn't there yet.
      fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: id }) }).catch(() => {});
      router.replace(`/vendor?posted=${id}`);
    } catch {
      setBusy(false);
      setErr(t("errorBody"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
      <Header title={t("postDish")} back="/vendor" />
      <Page className="gap-3.5">
        <Input label={t("dishName")} placeholder={t("dishNamePh")} value={f.dish} onChange={set("dish")} maxLength={40} />
        <div className="flex gap-3">
          <Input label={t("servingsTotal")} type="number" inputMode="numeric" min="1" placeholder="12" value={f.servings} onChange={set("servings")} />
          <Input label={t("maxOrders")} type="number" inputMode="numeric" min="1" placeholder="6" value={f.maxOrders} onChange={set("maxOrders")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{t("dealType")}</span>
          <div className="flex gap-1 rounded-control border-[1.5px] border-line bg-surface p-1" role="radiogroup">
            {[["lower_price", "lowerPrice"], ["bigger_serving", "biggerServing"]].map(([v, k]) => (
              <button type="button" key={v} role="radio" aria-checked={f.dealType === v} onClick={() => setF({ ...f, dealType: v })} className={`h-11 flex-1 rounded-[9px] text-sm font-bold ${f.dealType === v ? "bg-primary text-white" : "text-muted"}`}>
                {t(k)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Input label={t("price")} type="number" inputMode="numeric" min="1" placeholder="45" value={f.price} onChange={set("price")} />
          <Input label={t("cutoff")} type="time" value={f.cutoff} onChange={set("cutoff")} />
        </div>
        <Input label={t("dealNote")} placeholder={t("dealNotePh")} value={f.dealNote} onChange={set("dealNote")} maxLength={60} />
        {err ? <Note tone="red" icon="alert">{err}</Note> : <Note>{t("postHint")}</Note>}
      </Page>
      <Footer>
        <Button type="submit" disabled={busy || !vendor}>{busy ? t("posting") : t("postBtn")}</Button>
      </Footer>
    </form>
  );
}
