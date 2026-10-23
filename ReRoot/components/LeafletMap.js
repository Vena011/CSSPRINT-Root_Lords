"use client";

// Plain Leaflet map (no react-leaflet). The map is created in an effect and destroyed in its cleanup,
// so going back to a page (Next.js keeps hidden pages alive and re-runs effects) never reuses an old map.
// Import with next/dynamic and ssr: false.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

const TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// center {lat,lng}, zoom, circle {lat,lng,radius}?, markers [{ id, lat, lng, html, onClick }], onPick(latlng)?
export default function LeafletMap({ center, zoom = 16, circle, markers = [], onPick, className = "h-full w-full", fitMarkers = false }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const pickRef = useRef(onPick);
  useEffect(() => {
    pickRef.current = onPick;
  }, [onPick]);

  // create / destroy
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    if (node._leaflet_id) node._leaflet_id = null; // a previous map on this div was already removed
    const m = L.map(node, { zoomControl: true, attributionControl: true }).setView([center.lat, center.lng], zoom);
    L.tileLayer(TILES, { attribution: ATTR, maxZoom: 19 }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("click", (e) => pickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }));
    map.current = m;
    // the container may have been hidden when created; fix the size once it shows
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => m.invalidateSize()) : null;
    ro?.observe(node);
    return () => {
      ro?.disconnect();
      m.off();
      m.remove();
      map.current = null;
      layer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- created once; view and layers update below
  }, []);

  // view
  useEffect(() => {
    map.current?.setView([center.lat, center.lng], zoom, { animate: false });
  }, [center.lat, center.lng, zoom]);

  // layers
  const key = JSON.stringify({ circle, markers: markers.map(({ onClick, ...m }) => m) });
  const markersRef = useRef(markers);
  useEffect(() => {
    markersRef.current = markers;
  });
  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    if (circle) L.circle([circle.lat, circle.lng], { radius: circle.radius, color: "#2F7D4F", weight: 1.5, dashArray: "6 5", fillOpacity: 0.08 }).addTo(g);
    const pts = [];
    markersRef.current.forEach((mk, i) => {
      const marker = L.marker([mk.lat, mk.lng], { icon: L.divIcon({ className: "", html: mk.html, iconSize: [0, 0] }), keyboard: !!mk.onClick, zIndexOffset: mk.z ?? 0 });
      if (mk.onClick) marker.on("click", () => markersRef.current[i]?.onClick?.());
      marker.addTo(g);
      pts.push([mk.lat, mk.lng]);
    });
    if (fitMarkers && pts.length > 1 && map.current) map.current.fitBounds(pts, { padding: [40, 40], maxZoom: 17 });
  }, [key, circle, fitMarkers]);

  return <div ref={el} className={className} />;
}
