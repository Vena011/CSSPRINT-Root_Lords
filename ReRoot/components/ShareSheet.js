"use client";

import { useEffect, useState } from "react";
import { Button, DishThumb, Icon } from "./ui";
import { useT } from "./LangProvider";
import { DORMS } from "@/lib/dorms";

export function listingLink(listingId, dormId) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/l/${listingId}${dormId && dormId !== "all" ? `?dorm=${dormId}` : ""}`;
}

// One-tap share to a dorm group chat (Web Share API, copy-link fallback).
export async function shareListing({ listing, dormId, t, onCopied }) {
  const url = listingLink(listing.id, dormId);
  const text = t("shareText", { dish: listing.dish, vendor: listing.vendorName, price: listing.price, left: listing.servingsLeft });
  try {
    if (navigator.share) {
      await navigator.share({ title: `${listing.dish} · ReRoot`, text, url });
      return;
    }
  } catch (e) {
    if (e?.name === "AbortError") return; // user closed the share sheet
  }
  try {
    await navigator.clipboard.writeText(`${text} ${url}`);
  } catch {
    window.prompt("Copy this link", url);
  }
  onCopied?.();
}

export default function ShareSheet({ listing, initialDorm = "dapitan", onClose, onCopied }) {
  const t = useT();
  const [dorm, setDorm] = useState(initialDorm);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  if (!listing) return null;
  const options = [...DORMS.filter((d) => d.id !== "other"), { id: "all", name: t("allDorms") }];
  const copy = async () => {
    const url = listingLink(listing.id, dorm);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link", url);
    }
    onCopied?.();
  };
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t("shareTitle")} className="rr-sheet flex max-h-[92dvh] w-full max-w-[440px] flex-col gap-3.5 overflow-y-auto rounded-t-3xl bg-surface px-4 pb-5 pt-3" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto h-[5px] w-10 rounded-full bg-line" />
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h2 className="text-xl font-bold">{t("shareTitle")}</h2>
            <p className="text-[13px] font-medium text-muted">{t("shareBody")}</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="p-1 text-muted">
            <Icon name="x" />
          </button>
        </div>
        <div className="overflow-hidden rounded-card border border-line">
          {options.map((d) => (
            <label key={d.id} className={`flex cursor-pointer items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 ${dorm === d.id ? "bg-primary-soft" : ""}`}>
              <input type="radio" name="dorm" className="h-5 w-5 accent-primary" checked={dorm === d.id} onChange={() => setDorm(d.id)} />
              <span className={`text-[15px] ${dorm === d.id ? "font-bold text-primary-dark" : "font-medium"}`}>{d.name}</span>
            </label>
          ))}
        </div>
        <div className="flex items-center gap-2.5 rounded-control border border-line bg-bg p-2.5">
          <DishThumb size={56} icon={24} photo={listing?.photo} />
          <div className="min-w-0 text-xs">
            <p className="text-[13px] font-bold">{listing.dish} · {listing.vendorName}</p>
            <p className="text-muted">₱{listing.price} · {listing.servingsLeft} left</p>
            <p className="truncate font-semibold text-primary">{listingLink(listing.id, dorm).replace(/^https?:\/\//, "")}</p>
          </div>
        </div>
        <Button onClick={() => shareListing({ listing, dormId: dorm, t, onCopied })}>
          <Icon name="share" size={18} /> {t("shareBtn")}
        </Button>
        <Button variant="secondary" onClick={copy}>
          <Icon name="copy" size={18} /> {t("copyLink")}
        </Button>
      </div>
    </div>
  );
}
