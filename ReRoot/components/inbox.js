"use client";

// Inbox data for the current user: one thread per reservation.
// Vendor → every order for their store. Student → their own reservations (guest or signed in).
// "Read" is remembered on this device (localStorage), so no extra writes or rules are needed.
import { useEffect, useMemo, useState } from "react";
import { useUser } from "./hooks";
import { listenMyReservations, listenVendorReservations } from "@/lib/data";
import { toMs } from "@/lib/time";

const READ_EVENT = "reroot-read";
const readKey = (role) => `reroot-read-${role}`;

function readMap(role) {
  try {
    return JSON.parse(localStorage.getItem(readKey(role)) || "{}");
  } catch {
    return {};
  }
}

export function markRead(role, reservationId, at) {
  try {
    const m = readMap(role);
    if ((m[reservationId] || 0) >= at) return;
    m[reservationId] = at;
    localStorage.setItem(readKey(role), JSON.stringify(m));
    window.dispatchEvent(new Event(READ_EVENT));
  } catch {}
}

export function isUnread(thread, role, map) {
  return !!thread.lastMsgAt && thread.lastFrom && thread.lastFrom !== role && thread.lastMsgAt > (map[thread.id] || 0);
}

// Sort key: newest activity first.
const activity = (r) => Math.max(r.lastMsgAt || 0, toMs(r.createdAt) || 0);

export function useThreads() {
  const { user, loading } = useUser();
  const role = user?.role === "vendor" ? "vendor" : "student";
  const vendorId = user?.role === "vendor" ? user.vendor?.id ?? null : null;
  const [list, setList] = useState(null);
  const [reads, setReads] = useState({});

  useEffect(() => {
    if (loading) return;
    if (role === "vendor") return vendorId ? listenVendorReservations(vendorId, setList) : undefined;
    return listenMyReservations(setList);
  }, [loading, role, vendorId]);

  useEffect(() => {
    const sync = () => setReads(readMap(role));
    sync();
    window.addEventListener(READ_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(READ_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [role]);

  const threads = useMemo(() => {
    if (!list) return null;
    // Vendor: orders that have a chat, plus active orders (so the vendor can start one). Student: all of theirs.
    const shown = role === "vendor" ? list.filter((r) => r.lastMsgAt || r.status === "reserved") : list.filter((r) => r.status !== "cancelled" || r.lastMsgAt);
    return [...shown].sort((a, b) => activity(b) - activity(a));
  }, [list, role]);
  const unread = threads ? threads.filter((th) => isUnread(th, role, reads)).length : 0;

  return { role, user, userLoading: loading, loading: loading || threads === null, threads, unread, reads };
}
