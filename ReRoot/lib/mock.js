// TEMPORARY fake data layer (Lawrence's /lib/mock.js from the task plan).
// Same function names and arguments as JC's /lib/db.js contract (Section 5),
// so pages work before Firebase is ready. State lives in localStorage and syncs
// across tabs, so you can open a vendor tab and a student tab and watch the
// counts change live. Delete this file once lib/data.js points to ./db.
//
// Extra functions the screens need that are NOT in Section 5 yet (JC, please
// add them to db.js with the same names): listenReservation, listenVendorListings,
// onAuth, signIn, signUp, completeProfile, signOut, getDemandAlert, enablePush.

import { UST } from "./geo";
import { DEMO_LISTINGS, DEMO_MESSAGES, DEMO_RESERVATIONS, DEMO_VENDORS } from "./demo-data";
import { distanceM } from "./geo";

const KEY = "reroot-mock-v6";
// Demo login is per browser tab (sessionStorage), so one window can hold a vendor tab and a student tab
// side by side, like two phones. The demo data itself is shared across tabs through localStorage.
const SESSION = "reroot-mock-user";
const listeners = new Set();
let state = null;

const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 10);

function seed() {
  const t = now();
  const vendors = DEMO_VENDORS.map((v) => ({ ...v, ownerUid: v.email, createdAt: t }));
  const byId = Object.fromEntries(vendors.map((v) => [v.id, v]));
  const listings = DEMO_LISTINGS.map(({ cutoffMin, ...l }) => {
    const v = byId[l.vendorId];
    return { ...l, vendorName: v.name, pickupAddress: v.address, lat: v.lat, lng: v.lng, status: "open", cutoffAt: t + cutoffMin * 60000, createdAt: t - 30 * 60000 };
  });
  const reservations = DEMO_RESERVATIONS.map(({ ageMin, ...r }) => ({ studentUid: "seed", vendorName: byId[r.vendorId]?.name ?? "", ...r, createdAt: t - ageMin * 60000 }));
  const messages = DEMO_MESSAGES.map(({ ageMin, ...m }, i) => ({ id: `m-seed${i}`, key: null, ...m, createdAt: t - ageMin * 60000 }));
  for (const m of messages) {
    const r = reservations.find((x) => x.id === m.reservationId);
    if (r) Object.assign(r, { lastMsg: m.text, lastMsgAt: m.createdAt, lastFrom: m.from });
  }
  const users = [
    ...vendors.map((v) => ({ uid: "u-" + v.id, email: v.email, role: "vendor", name: v.name, dorm: "", vendorId: v.id, createdAt: t })),
    { uid: "u-student", email: "student@reroot.test", role: "student", name: "Juan D.", dorm: "dapitan", vendorId: null, createdAt: t },
    { uid: "u-admin", email: "admin@reroot.test", role: "student", name: "Admin", dorm: "other", vendorId: null, createdAt: t },
  ];
  return { vendors, listings, reservations, messages, users, seededAt: t };
}

function load() {
  if (state) return state;
  if (typeof window === "undefined") return (state = seed());
  try {
    const raw = window.localStorage.getItem(KEY);
    state = raw ? JSON.parse(raw) : seed();
    if (!state.seededAt || now() - state.seededAt > 6 * 3600000) state = seed();
  } catch {
    state = seed();
  }
  if (!window.__rrMockSync) {
    window.__rrMockSync = true;
    window.addEventListener("storage", (e) => {
      if (e.key === KEY && e.newValue) {
        state = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn());
      }
    });
  }
  return state;
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((fn) => fn());
}

function watch(fn) {
  load();
  const run = () => fn();
  listeners.add(run);
  // async first call, like Firestore onSnapshot
  const t = setTimeout(run, 250);
  return () => {
    clearTimeout(t);
    listeners.delete(run);
  };
}

const clone = (x) => (x == null ? x : JSON.parse(JSON.stringify(x)));
const studentUid = () => {
  try {
    let id = localStorage.getItem("reroot-student-uid");
    if (!id) localStorage.setItem("reroot-student-uid", (id = "anon-" + uid()));
    return id;
  } catch {
    return "anon";
  }
};

// ---------- Section 5 contract ----------
export async function createVendor(data) {
  const s = load();
  const v = { id: "v-" + uid(), createdAt: now(), ...data };
  s.vendors.push(v);
  save();
  return v.id;
}

export async function createListing(data) {
  const s = load();
  const v = s.vendors.find((x) => x.id === data.vendorId) || {};
  const l = {
    id: "l-" + uid(),
    vendorName: v.name,
    lat: v.lat ?? UST.lat,
    lng: v.lng ?? UST.lng,
    ...data,
    servingsLeft: data.servingsTotal,
    ordersLeft: data.maxOrders,
    status: "open",
    createdAt: now(),
  };
  s.listings.unshift(l);
  save();
  return l.id;
}

export function listenOpenListings(callback) {
  return watch(() =>
    callback(clone(load().listings.filter((l) => l.status === "open" && l.cutoffAt > now())))
  );
}

export function listenListing(id, callback) {
  return watch(() => callback(clone(load().listings.find((l) => l.id === id) ?? null)));
}

export async function reserve(listingId, { name, dorm, qty }) {
  await new Promise((r) => setTimeout(r, 400));
  const s = load();
  const l = s.listings.find((x) => x.id === listingId);
  if (!l || l.status !== "open" || l.cutoffAt < now() || l.servingsLeft < qty || l.ordersLeft < 1) {
    throw new Error("SOLD_OUT");
  }
  l.servingsLeft -= qty;
  l.ordersLeft -= 1;
  if (l.servingsLeft <= 0 || l.ordersLeft <= 0) l.status = "closed";
  const active = new Set(s.reservations.filter((r) => r.vendorId === l.vendorId && r.status === "reserved").map((r) => r.pickupCode));
  let code;
  do code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  while (active.has(code));
  const who = me();
  const r = { id: "r-" + uid(), listingId, vendorId: l.vendorId, vendorName: l.vendorName, studentUid: who?.role === "student" ? who.uid : studentUid(), name, dorm, qty, pickupCode: code, status: "reserved", statusMsg: "", createdAt: now() };
  s.reservations.push(r);
  save();
  return { id: r.id, pickupCode: code };
}

export function listenVendorReservations(vendorId, cb) {
  return watch(() => cb(clone(load().reservations.filter((r) => r.vendorId === vendorId))));
}

export async function checkPickupCode(vendorId, code) {
  const s = load();
  const r = s.reservations.find((x) => x.vendorId === vendorId && x.pickupCode === code && x.status === "reserved");
  if (!r) throw new Error("NOT_FOUND");
  r.status = "claimed";
  save();
  return clone(r);
}

export async function setStatusMsg(reservationId, msg) {
  const r = load().reservations.find((x) => x.id === reservationId);
  if (r) {
    r.statusMsg = msg;
    save();
  }
}

export async function closeListing(id) {
  const l = load().listings.find((x) => x.id === id);
  if (l) {
    l.status = "closed";
    l.closedByVendor = true;
    save();
  }
}

export async function getTodayResults(vendorId) {
  const s = load();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  let servings = 0;
  let pesos = 0;
  for (const r of s.reservations) {
    if (r.vendorId !== vendorId || r.status !== "claimed" || r.createdAt < start.getTime()) continue;
    const l = s.listings.find((x) => x.id === r.listingId);
    servings += r.qty;
    pesos += r.qty * (l?.price ?? 0);
  }
  return { servings, pesos };
}

// ---------- extras the screens need (please mirror in db.js) ----------
export function listenReservation(id, cb) {
  return watch(() => cb(clone(load().reservations.find((r) => r.id === id) ?? null)));
}

export function listenVendorListings(vendorId, cb) {
  return watch(() => cb(clone(load().listings.filter((l) => l.vendorId === vendorId))));
}

// ---------- accounts: one login for everyone, role chosen after sign-up ----------
// users: { uid, email, role: null | "student" | "vendor", name, dorm, vendorId }
const me = () => {
  let email = null;
  try {
    email = sessionStorage.getItem(SESSION);
  } catch {}
  return email ? load().users.find((u) => u.email === email) ?? null : null;
};
const withVendor = (u) => (u ? { ...clone(u), vendor: clone(load().vendors.find((v) => v.id === u.vendorId) ?? null) } : null);

// cb(user | null); user = { uid, email, role, name, dorm, vendorId, vendor }
export function onAuth(cb) {
  return watch(() => cb(withVendor(me())));
}

export async function signIn(email) {
  const u = load().users.find((x) => x.email === email.trim().toLowerCase());
  if (!u) throw new Error("NOT_FOUND");
  sessionStorage.setItem(SESSION, u.email);
  save();
  return withVendor(u);
}

export async function signUp(email) {
  const e = email.trim().toLowerCase();
  const s = load();
  if (s.users.some((u) => u.email === e)) throw new Error("EMAIL_IN_USE");
  s.users.push({ uid: "u-" + uid(), email: e, role: null, name: "", dorm: "", vendorId: null, createdAt: now() });
  sessionStorage.setItem(SESSION, e);
  save();
}

// After sign-up: role "student" → { name, dorm }; role "vendor" → { name, address, lat, lng }
export async function completeProfile(role, data) {
  const u = me();
  if (!u) throw new Error("NOT_SIGNED_IN");
  if (role === "vendor") {
    u.vendorId = await createVendor({ name: data.name, address: data.address, lat: data.lat, lng: data.lng, email: u.email, ownerUid: u.uid });
    u.name = data.name;
  } else {
    u.name = data.name;
    u.dorm = data.dorm;
  }
  u.role = role;
  save();
  return withVendor(u);
}

export async function signOut() {
  sessionStorage.removeItem(SESSION);
  save();
}

// Real version (J6): Open-Meteo rain probability ≥ 70% or rain ≥ 10 mm, or settings/today.suspension.
export async function getDemandAlert() {
  if (load().settings?.suspension) return { show: true, reason: "suspension" };
  return { show: true, reason: "rain", probability: 85, rainMm: 14 };
}
export async function isAdmin() {
  return me()?.email === "admin@reroot.test";
}
export async function setSuspension(on) {
  load().settings = { suspension: !!on, updatedAt: now() };
  save();
}
export function listenSettings(cb) {
  return watch(() => cb(load().settings || { suspension: false }));
}

// Real version (J7): request permission, getToken with VAPID key, save to pushTokens.
export async function enablePush() {
  if (typeof Notification === "undefined") return false;
  const p = await Notification.requestPermission();
  return p === "granted";
}

// ---------- checklist additions (JC: mirror these in db.js) ----------
// Firebase: sendPasswordResetEmail(auth, email). Always resolves, so the page never reveals which emails exist.
export async function resetPassword(email) {
  await new Promise((r) => setTimeout(r, 400));
  return !!email;
}

// Student: { name, dorm } on users/{uid}. Vendor: { name, address } on users/{uid} and vendors/{vendorId}.
export async function updateProfile(data) {
  const u = me();
  if (!u) throw new Error("NOT_SIGNED_IN");
  if (data.name != null) u.name = data.name;
  if (u.role === "student" && data.dorm != null) u.dorm = data.dorm;
  if (u.role === "vendor") {
    const v = load().vendors.find((x) => x.id === u.vendorId);
    if (v) {
      if (data.name != null) v.name = data.name;
      if (data.address != null) v.address = data.address;
    }
  }
  save();
  return withVendor(u);
}

// runTransaction: status reserved → cancelled, give servings and the order slot back, reopen if it had closed by selling out.
export async function cancelReservation(reservationId) {
  const s = load();
  const r = s.reservations.find((x) => x.id === reservationId);
  if (!r || r.status !== "reserved") throw new Error("NOT_CANCELLABLE");
  r.status = "cancelled";
  const l = s.listings.find((x) => x.id === r.listingId);
  if (l) {
    l.servingsLeft += r.qty;
    l.ordersLeft += 1;
    if (l.status === "closed" && l.cutoffAt > now() && !l.closedByVendor) l.status = "open";
  }
  save();
}

// ---------- inbox: one chat thread per reservation ----------
// message: { id, reservationId, from: "student"|"vendor", kind: "chat"|"status", key (status only), text, createdAt }
// The reservation keeps lastMsg / lastMsgAt / lastFrom so the inbox list and unread badges need no extra reads.
export async function sendMessage(reservationId, { from, text, kind = "chat", key = null }) {
  const s = load();
  const r = s.reservations.find((x) => x.id === reservationId);
  if (!r) throw new Error("NOT_FOUND");
  const clean = String(text || "").trim().slice(0, 500);
  if (!clean) throw new Error("EMPTY");
  if (from !== "student" && from !== "vendor") throw new Error("BAD_SENDER");
  s.messages = s.messages || [];
  const m = { id: "m-" + uid(), reservationId, from, kind, key: kind === "status" ? key : null, text: clean, createdAt: now() };
  s.messages.push(m);
  Object.assign(r, { lastMsg: clean, lastMsgAt: m.createdAt, lastFrom: from });
  if (kind === "status" && key) r.statusMsg = key;
  save();
  return m.id;
}

export function listenMessages(reservationId, cb) {
  return watch(() => cb(clone((load().messages || []).filter((m) => m.reservationId === reservationId).sort((a, b) => a.createdAt - b.createdAt))));
}

// The student's own reservations: made in this browser, or by the signed-in student account.
export function listenMyReservations(cb) {
  return watch(() => {
    const mine = studentUid();
    const u = me();
    cb(clone(load().reservations.filter((r) => r.studentUid === mine || (u?.role === "student" && r.studentUid === u.uid))));
  });
}

// Demo mode only: if you test far from UST, add three demo carinderias around you (about 140 m, 260 m and 430 m away)
// so the 300 m and 500 m chips have dishes too. Runs once per area; Firebase mode has no such thing.
const NEARBY_DEMO = [
  ["Ate Joy's Carinderia", 0.0012, 0.0006, [["Pork Adobo", "bigger_serving", "Extra rice, same price", 45, null], ["Ginisang Monggo", "lower_price", "₱10 off", 30, 40]]],
  ["Kuya Mark's Silog", -0.0018, -0.0016, [["Longsilog", "lower_price", "₱15 off", 50, 65]]],
  ["Tita Remy's Lutong Bahay", 0.0009, 0.0038, [["Chicken Afritada", "lower_price", "₱20 off tonight", 55, 75], ["Laing", "bigger_serving", "Bigger serving + free rice", 40, null]]],
];
export function ensureDemoNearby(pos) {
  if (!pos || pos.fallback || typeof window === "undefined") return;
  const s = load();
  const t = now();
  const open = s.listings.filter((l) => l.status === "open" && l.cutoffAt > t);
  const within = (m) => open.filter((l) => distanceM(pos, l) <= m).length;
  if (within(300) >= 2 && within(500) >= 4) return;
  if (s.vendors.some((v) => v.demoNearby && distanceM(pos, v) < 700)) return;
  NEARBY_DEMO.forEach(([name, dLat, dLng, dishes], i) => {
    const v = { id: `vn-${uid()}`, name, email: "", address: "Demo store near you", lat: pos.lat + dLat, lng: pos.lng + dLng, ownerUid: null, demoNearby: true, createdAt: t };
    s.vendors.push(v);
    dishes.forEach(([dish, dealType, dealNote, price, originalPrice], j) => {
      const total = 6 + ((i + j) % 3) * 2;
      s.listings.push({
        id: `ln-${uid()}`, vendorId: v.id, vendorName: v.name, pickupAddress: v.address, dish, dealType, dealNote, price, originalPrice,
        servingsTotal: total, servingsLeft: total - 1 - j, maxOrders: total, ordersLeft: total - 1 - j,
        cutoffAt: t + (100 + i * 25 + j * 15) * 60000, status: "open", lat: v.lat, lng: v.lng, createdAt: t - (20 + i * 5) * 60000,
      });
    });
  });
  save();
}

// Demo mode has no server, so there is no push to send (the in-app alerts still work).
export function notifyServer() {}

export function resetMock() {
  state = seed();
  save();
}
