"use client";

// Leaflet map. Import with next/dynamic and ssr: false (see app/page.js).
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";
import { useRouter } from "next/navigation";

const pinIcon = (price, top) =>
  L.divIcon({ className: "", html: `<span class="rr-pin ${top ? "rr-pin-top" : ""}">₱${price}</span>`, iconSize: [0, 0] });
const meIcon = L.divIcon({ className: "", html: '<div class="rr-me"></div>', iconSize: [0, 0] });

// items: [{ listing, distance, top }]
export default function MapView({ center, radius, items }) {
  const router = useRouter();
  const zoom = radius <= 300 ? 17 : radius <= 500 ? 16 : 15;
  return (
    <div className="relative z-0 h-[60dvh] min-h-[380px] overflow-hidden rounded-card border border-line">
      <MapContainer key={`${radius}`} center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Circle center={[center.lat, center.lng]} radius={radius} pathOptions={{ color: "#2F7D4F", weight: 1.5, dashArray: "6 5", fillOpacity: 0.08 }} />
        <Marker position={[center.lat, center.lng]} icon={meIcon} />
        {items.map(({ listing: l, top }) => (
          <Marker key={l.id} position={[l.lat, l.lng]} icon={pinIcon(l.price, top)} eventHandlers={{ click: () => router.push(`/l/${l.id}`) }} />
        ))}
      </MapContainer>
    </div>
  );
}
