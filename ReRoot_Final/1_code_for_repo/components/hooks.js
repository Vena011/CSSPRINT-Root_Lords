"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UST } from "@/lib/geo";
import { onVendorAuth } from "@/lib/data";

// Student location. Falls back to UST if denied or unavailable.
export function usePosition() {
  const [pos, setPos] = useState({ ...UST, fallback: true, ready: false });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    if (!navigator.geolocation) return setPos({ ...UST, fallback: true, ready: true });
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude, fallback: false, ready: true }),
      () => setPos({ ...UST, fallback: true, ready: true }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);
  return pos;
}

// Persisted value in localStorage (wrapped in try/catch, as the plan asks).
export function useStored(key, initial) {
  const [v, setV] = useState(initial);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
      if (raw != null) setV(JSON.parse(raw));
    } catch {}
  }, [key]);
  const set = (next) => {
    setV(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };
  return [v, set];
}

// Signed-in vendor, or redirect to /vendor/login.
export function useVendor({ redirect = true } = {}) {
  const router = useRouter();
  const [state, setState] = useState({ vendor: null, loading: true });
  useEffect(
    () =>
      onVendorAuth((vendor) => {
        setState({ vendor, loading: false });
        if (!vendor && redirect) router.replace("/vendor/login");
      }),
    [redirect, router]
  );
  return state;
}

export function rememberVendor(vendorId) {
  try {
    const list = JSON.parse(localStorage.getItem("reroot-bought") || "[]");
    if (!list.includes(vendorId)) localStorage.setItem("reroot-bought", JSON.stringify([...list, vendorId]));
  } catch {}
}

export function boughtFrom() {
  try {
    return new Set(JSON.parse(localStorage.getItem("reroot-bought") || "[]"));
  } catch {
    return new Set();
  }
}
