"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UST } from "@/lib/geo";
import { onAuth } from "@/lib/data";

// Student location. Falls back to UST if denied or unavailable.
export function usePosition() {
  const [pos, setPos] = useState({ ...UST, fallback: true, ready: false });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    if (!navigator.geolocation) return setPos({ ...UST, fallback: true, ready: true });
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, fallback: false, ready: true });
        try {
          localStorage.setItem("reroot-last-pos", JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }));
        } catch {}
      },
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

// Signed-in user (any role) or null. loading=true until the first answer.
export function useUser() {
  const [state, setState] = useState({ user: null, loading: true });
  useEffect(() => onAuth((user) => setState({ user, loading: false })), []);
  return state;
}

// Signed-in vendor, or send them where they belong:
// not signed in → /login, no role yet → /onboarding, a student → home.
export function useVendor({ redirect = true } = {}) {
  const router = useRouter();
  const [state, setState] = useState({ vendor: null, user: null, loading: true });
  useEffect(
    () =>
      onAuth((user) => {
        const vendor = user?.role === "vendor" ? user.vendor : null;
        setState({ vendor, user, loading: false });
        if (!redirect || vendor) return;
        if (!user) router.replace("/login?next=/vendor");
        else if (!user.role) router.replace("/onboarding");
        else if (user.role !== "vendor") router.replace("/");
        // role is vendor but the store record hasn't loaded: stay here (pages show a loading state) instead of bouncing to the student side
      }),
    [redirect, router]
  );
  return state;
}

// Student-side pages: a signed-in vendor is sent to their own dashboard, so each role only sees its own app.
export function useStudentOnly() {
  const router = useRouter();
  useEffect(
    () =>
      onAuth((user) => {
        if (user?.role === "vendor") router.replace("/vendor");
        else if (user && !user.role) router.replace("/onboarding");
      }),
    [router]
  );
}

// Where to go after logging in, by role.
export function homeFor(user) {
  if (!user?.role) return "/onboarding";
  return user.role === "vendor" ? "/vendor" : "/";
}

// Reservations made on this phone (for "My orders"), newest first.
export function myReservationIds() {
  try {
    return JSON.parse(localStorage.getItem("reroot-my-res") || "[]");
  } catch {
    return [];
  }
}
export function addMyReservation(id) {
  try {
    const list = myReservationIds().filter((x) => x !== id);
    localStorage.setItem("reroot-my-res", JSON.stringify([id, ...list].slice(0, 30)));
  } catch {}
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
