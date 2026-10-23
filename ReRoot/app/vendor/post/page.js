"use client";

// V3 Post a dish
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button, Header, Icon, Input, Note, Page } from "@/components/ui";
import BottomNav from "@/components/BottomNav";
import { useVendor } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { createListing, notifyServer } from "@/lib/data";
import { resizePhoto } from "@/lib/photo";
import { UST } from "@/lib/geo";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => <div className="rr-shimmer h-full w-full bg-disabled" />,
});

function defaultCutoff() {
  const d = new Date(Date.now() + 2 * 3600000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(Math.floor(d.getMinutes() / 15) * 15).padStart(2, "0")}`;
}

export default function PostDish() {
  const t = useT();
  const router = useRouter();
  const { vendor } = useVendor();
  const [f, setF] = useState({ dish: "", servings: "", maxOrders: "", dealType: "lower_price", price: "", originalPrice: "", cutoff: "", dealNote: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(null); // resized JPEG data URL
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileRef = useRef(null);
  // Pickup location: starts at the store's saved address and pin; the vendor can change both per dish.
  const [place, setPlace] = useState(null); // { address, lat, lng }
  const [locBusy, setLocBusy] = useState(false);
  const [locNote, setLocNote] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- start from the store's saved location once it loads
    if (vendor && !place) setPlace({ address: vendor.address || "", lat: vendor.lat ?? UST.lat, lng: vendor.lng ?? UST.lng });
  }, [vendor, place]);
  function useHere() {
    if (!navigator.geolocation) return setLocNote(t("locationFailed"));
    setLocBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPlace((x) => ({ ...x, lat: p.coords.latitude, lng: p.coords.longitude }));
        setLocNote(t("locationUpdated"));
        setLocBusy(false);
      },
      () => {
        setLocNote(t("locationFailed"));
        setLocBusy(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function pickPhoto(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoBusy(true);
    try {
      setPhoto(await resizePhoto(file));
      setErr("");
    } catch {
      setErr(t("photoError"));
    }
    setPhotoBusy(false);
  }
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
    // A late-night post (e.g. 11 PM with a 1 AM cutoff) means tomorrow, not a time that already passed.
    if (cut.getTime() <= Date.now() && Date.now() - cut.getTime() > 6 * 3600000) cut.setDate(cut.getDate() + 1);
    if (cut.getTime() <= Date.now()) return setErr(t("cutoffPast"));
    if (!vendor) return setErr(t("errorBody"));
    if (!place?.address.trim()) return setErr(t("needAddress"));
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
        originalPrice: f.dealType === "lower_price" && parseInt(f.originalPrice, 10) > price ? parseInt(f.originalPrice, 10) : null,
        servingsTotal: servings,
        maxOrders: Math.max(1, Math.min(maxOrders, servings)),
        cutoffAt: cut.getTime(),
        lat: place.lat,
        lng: place.lng,
        pickupAddress: place.address.trim(),
        photo,
      });
      // J7: push to nearby students (Firebase mode only; demo mode shows the in-app alert instead).
      notifyServer({ type: "listing", listingId: id });
      router.replace(`/vendor?posted=${id}`);
    } catch (e2) {
      console.warn("[post] createListing failed:", e2?.code || e2?.message || e2);
      setBusy(false);
      setErr(t("errorBody"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
      <Header title={t("postDish")} back="/vendor" />
      <Page narrow className="gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">{t("photoLabel")}</span>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={pickPhoto} aria-label={t("addPhoto")} tabIndex={-1} />
          {photo ? (
            <div className="relative overflow-hidden rounded-card border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the resized photo */}
              <img src={photo} alt={f.dish || t("photoLabel")} className="h-48 w-full object-cover" />
              <div className="flex gap-2 p-2">
                <Button type="button" variant="secondary" className="h-10! text-sm!" onClick={() => fileRef.current?.click()}>
                  <Icon name="camera" size={18} /> {t("changePhoto")}
                </Button>
                <Button type="button" variant="secondary" className="h-10! w-auto! px-4! text-sm! border-danger! text-danger-ink!" onClick={() => setPhoto(null)}>
                  <Icon name="trash" size={18} /> {t("removePhoto")}
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={photoBusy}
              className="flex h-28 flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-line bg-surface text-sm font-bold text-primary-dark transition-colors hover:border-primary hover:bg-primary-soft"
            >
              {photoBusy ? <span className="rr-spin h-6 w-6 rounded-full border-[3px] border-primary-soft border-t-primary" /> : <Icon name="camera" size={26} />}
              {t("addPhoto")}
              <span className="text-xs font-medium text-muted">{t("photoHint")}</span>
            </button>
          )}
        </div>
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
          <Input label={f.dealType === "lower_price" ? t("salePrice") : t("price")} type="number" inputMode="numeric" min="1" placeholder="45" value={f.price} onChange={set("price")} />
          {f.dealType === "lower_price" && (
            <Input label={t("regularPrice")} type="number" inputMode="numeric" min="1" placeholder="60" value={f.originalPrice} onChange={set("originalPrice")} />
          )}
        </div>
        {f.dealType === "lower_price" && parseInt(f.originalPrice, 10) > parseInt(f.price, 10) && (
          <Note tone="warn" icon="spark">{t("salePreview", { o: f.originalPrice, p: f.price, pct: Math.round(((f.originalPrice - f.price) / f.originalPrice) * 100) })}</Note>
        )}
        <Input label={t("cutoff")} type="time" value={f.cutoff} onChange={set("cutoff")} />
        <Input label={t("dealNote")} placeholder={t("dealNotePh")} value={f.dealNote} onChange={set("dealNote")} maxLength={60} />
        <section className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-3.5">
          <div>
            <h2 className="flex items-center gap-1.5 text-[15px] font-bold"><Icon name="pin" size={18} className="text-primary" /> {t("pickupLocation")}</h2>
            <p className="text-[13px] text-muted">{t("pickupLocationHint")}</p>
          </div>
          <Input
            label={t("pickupAddressLabel")}
            placeholder={t("pickupAddressPh")}
            value={place?.address ?? ""}
            onChange={(e) => setPlace((x) => ({ ...(x ?? { lat: UST.lat, lng: UST.lng }), address: e.target.value }))}
            maxLength={100}
          />
          <div className="relative z-0 h-52 overflow-hidden rounded-control border border-line">
            {place && (
              <LeafletMap
                center={{ lat: place.lat, lng: place.lng }}
                zoom={17}
                markers={[{ id: "store", lat: place.lat, lng: place.lng, html: '<span class="rr-pin rr-pin-top">📍</span>' }]}
                onPick={(ll) => {
                  setPlace((x) => ({ ...x, ...ll }));
                  setLocNote("");
                }}
              />
            )}
          </div>
          <Button type="button" variant="secondary" className="h-11! text-sm!" disabled={locBusy} onClick={useHere}>
            <Icon name="pin" size={18} /> {t("useCurrentLocation")}
          </Button>
          {locNote && <p className="text-[13px] font-semibold text-primary-dark" role="status">{locNote}</p>}
        </section>
        {err ? <Note tone="red" icon="alert">{err}</Note> : <Note>{t("postHint")}</Note>}
        <Button type="submit" disabled={busy || !vendor}>{busy ? t("posting") : !vendor ? t("loading") : t("postBtn")}</Button>
      </Page>
      <BottomNav kind="vendor" active="post" />
    </form>
  );
}
