"use client";

// Student map: you, your radius, and a price pin per dish. Import with next/dynamic and ssr: false (see app/page.js).
import { useRouter } from "next/navigation";
import LeafletMap from "./LeafletMap";

// items: [{ listing, distance, top }]
export default function MapView({ center, radius, items }) {
  const router = useRouter();
  const zoom = radius <= 300 ? 17 : radius <= 500 ? 16 : 15;
  const markers = [
    { id: "me", lat: center.lat, lng: center.lng, html: '<div class="rr-me"></div>', z: 1000 },
    ...items.map(({ listing: l, top }) => ({
      id: l.id,
      lat: l.lat,
      lng: l.lng,
      html: `<span class="rr-pin ${top ? "rr-pin-top" : ""}">₱${l.price}</span>`,
      onClick: () => router.push(`/l/${l.id}`),
    })),
  ];
  return (
    <div className="relative z-0 h-[60dvh] min-h-[380px] overflow-hidden rounded-card border border-line">
      <LeafletMap center={center} zoom={zoom} circle={{ lat: center.lat, lng: center.lng, radius }} markers={markers} />
    </div>
  );
}
