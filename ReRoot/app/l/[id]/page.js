import { Suspense } from "react";
import { connection } from "next/server";
import ListingDetail from "@/components/ListingDetail";
import { SkeletonList } from "@/components/States";

// Preview card for Messenger / Viber (J6): dish + vendor as the title, deal + servings left as the description.
// Reads the public listing through the Firestore REST API (listings are publicly readable in firestore.rules).
async function readListing(id) {
  const pid = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!pid || !key) return null;
  try {
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${pid}/databases/(default)/documents/listings/${encodeURIComponent(id)}?key=${key}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    const f = (await r.json()).fields || {};
    const v = (x) => x?.stringValue ?? x?.integerValue ?? x?.doubleValue;
    return { dish: v(f.dish), vendorName: v(f.vendorName), price: v(f.price), originalPrice: v(f.originalPrice), servingsLeft: v(f.servingsLeft), dealType: v(f.dealType) };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const l = await readListing(id);
  if (!l?.dish) return { title: "ReRoot · Tirang ulam malapit sa iyo" };
  const o = Number(l.originalPrice), p = Number(l.price);
  const deal = o > p ? `Sale ${Math.round(((o - p) / o) * 100)}% off (₱${o} → ₱${p})` : l.dealType === "bigger_serving" ? "Mas malaking serving" : "Mas mura";
  const title = `${l.dish} · ${l.vendorName}`;
  const description = `₱${l.price} · ${deal} · ${l.servingsLeft} na lang. Reserve on ReRoot, no account needed.`;
  return { title, description, openGraph: { title, description, images: [{ url: "/og-image.png", width: 1200, height: 630 }] } };
}

// The preview card needs the listing id from the URL, so metadata is built per request.
// This marker tells Next.js that is intentional; the page itself still prerenders and streams.
async function Connection() {
  await connection();
  return null;
}

export default function ListingPage() {
  return (
    <>
      <Suspense fallback={<div className="p-4"><SkeletonList n={1} /></div>}>
        <ListingDetail />
      </Suspense>
      <Suspense>
        <Connection />
      </Suspense>
    </>
  );
}
