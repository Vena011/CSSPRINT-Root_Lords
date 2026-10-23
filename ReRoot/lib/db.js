// Real data layer on Firebase (JC's file). Same function names and arguments as lib/mock.js,
// so lib/data.js can switch between them. Times are stored as numbers (ms since 1970).
//
// Collections:
//   users/{uid}        { email, role: null|"student"|"vendor", name, dorm, vendorId, createdAt }
//   vendors/{id}       { name, address, lat, lng, ownerUid, email, createdAt }
//   listings/{id}      { vendorId, vendorName, pickupAddress, dish, dealType, dealNote, price, servingsTotal, servingsLeft,
//                        maxOrders, ordersLeft, cutoffAt, status, closedByVendor, lat, lng, createdAt, lastTx }
//   reservations/{id}  { listingId, vendorId, studentUid, name, dorm, qty, price, pickupCode, status, statusMsg, createdAt,
//                        lastMsg, lastMsgAt, lastFrom }   ← last chat message, for the inbox list and unread badges
//   reservations/{id}/messages/{mid}  { from: "student"|"vendor", kind: "chat"|"status", key, text, uid, createdAt }
//   pushTokens/{token} { token, uid, lat, lng, radiusM, updatedAt }
//   settings/today     { suspension, note, updatedAt }
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { ensureStudentAuth, fb } from "./firebase";
import { UST } from "./geo";

const now = () => Date.now();
const withId = (snap) => (snap.exists() ? { id: snap.id, ...snap.data() } : null);
const warn = (where_) => (e) => console.warn(`[db] ${where_}:`, e?.code || e?.message || e);

// Wait for Firebase to restore the session before a listener starts, so rules see the right user.
function live(start) {
  let stop = () => {};
  let cancelled = false;
  fb()
    .auth.authStateReady()
    .then(() => {
      if (!cancelled) stop = start();
    });
  return () => {
    cancelled = true;
    stop();
  };
}

// ---------- vendors + listings ----------
export async function createVendor(data) {
  const { db, auth } = fb();
  const ref = await addDoc(collection(db, "vendors"), {
    name: data.name,
    address: data.address || "",
    lat: data.lat ?? UST.lat,
    lng: data.lng ?? UST.lng,
    email: data.email || auth.currentUser?.email || "",
    ownerUid: data.ownerUid || auth.currentUser?.uid,
    createdAt: now(),
  });
  return ref.id;
}

export async function createListing(data) {
  const { db } = fb();
  const ref = await addDoc(collection(db, "listings"), {
    vendorId: data.vendorId,
    vendorName: data.vendorName,
    dish: data.dish,
    dealType: data.dealType,
    dealNote: data.dealNote || "",
    price: Number(data.price),
    originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
    pickupAddress: String(data.pickupAddress || "").slice(0, 100),
    photo: typeof data.photo === "string" && data.photo.startsWith("data:image/") ? data.photo : null, // resized JPEG, ~60–150 KB
    servingsTotal: Number(data.servingsTotal),
    servingsLeft: Number(data.servingsTotal),
    maxOrders: Number(data.maxOrders),
    ordersLeft: Number(data.maxOrders),
    cutoffAt: Number(data.cutoffAt),
    status: "open",
    closedByVendor: false,
    lat: data.lat ?? UST.lat,
    lng: data.lng ?? UST.lng,
    createdAt: now(),
  });
  return ref.id;
}

// Open listings whose cutoff hasn't passed (cutoff filtered here, so no composite index is needed).
export function listenOpenListings(callback) {
  const { db } = fb();
  return onSnapshot(
    query(collection(db, "listings"), where("status", "==", "open")),
    (snap) => callback(snap.docs.map(withId).filter((l) => l.cutoffAt > now())),
    warn("listenOpenListings")
  );
}

export function listenListing(id, callback) {
  const { db } = fb();
  return onSnapshot(doc(db, "listings", id), (s) => callback(withId(s)), (e) => {
    warn("listenListing")(e);
    callback(null);
  });
}

export function listenVendorListings(vendorId, cb) {
  return live(() =>
    onSnapshot(query(collection(fb().db, "listings"), where("vendorId", "==", vendorId)), (snap) => cb(snap.docs.map(withId)), warn("listenVendorListings"))
  );
}

export async function closeListing(id) {
  await updateDoc(doc(fb().db, "listings", id), { status: "closed", closedByVendor: true });
}

// ---------- reservations ----------
// Pickup codes are unique per vendor while active: pickupCodes/{vendorId}_{code} is claimed inside the transaction.
const codeRef = (vendorId, code) => doc(fb().db, "pickupCodes", `${vendorId}_${code}`);
const randomCode = () => String(Math.floor(Math.random() * 10000)).padStart(4, "0");

// runTransaction: two students can never get the last serving. Returns { id, pickupCode }.
export async function reserve(listingId, { name, dorm, qty }) {
  const user = await ensureStudentAuth();
  const { db } = fb();
  const listingRef = doc(db, "listings", listingId);
  const resRef = doc(collection(db, "reservations"));
  let pickupCode;
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(listingRef);
    const l = snap.data();
    if (!l || l.status !== "open" || l.cutoffAt < now() || l.servingsLeft < qty || l.ordersLeft < 1) throw new Error("SOLD_OUT");
    const candidates = Array.from({ length: 6 }, randomCode);
    const taken = await Promise.all(candidates.map((c) => tx.get(codeRef(l.vendorId, c))));
    pickupCode = candidates.find((c, i) => !taken[i].exists() || !taken[i].data().active);
    if (!pickupCode) throw new Error("TRY_AGAIN");
    tx.set(codeRef(l.vendorId, pickupCode), { active: true, vendorId: l.vendorId, studentUid: user.uid, reservationId: resRef.id });
    const servingsLeft = l.servingsLeft - qty;
    const ordersLeft = l.ordersLeft - 1;
    tx.set(resRef, {
      listingId,
      vendorId: l.vendorId,
      vendorName: l.vendorName || "",
      studentUid: user.uid,
      name,
      dorm,
      qty,
      price: l.price,
      pickupCode,
      status: "reserved",
      statusMsg: "",
      createdAt: now(),
    });
    tx.update(listingRef, { servingsLeft, ordersLeft, status: servingsLeft <= 0 || ordersLeft <= 0 ? "closed" : "open", lastTx: resRef.id });
  });
  notifyServer({ type: "reservation", reservationId: resRef.id });
  return { id: resRef.id, pickupCode };
}

export function listenReservation(id, cb) {
  return live(() =>
    onSnapshot(doc(fb().db, "reservations", id), (s) => cb(withId(s)), (e) => {
      warn("listenReservation")(e);
      cb(null);
    })
  );
}

export function listenVendorReservations(vendorId, cb) {
  return live(() =>
    onSnapshot(query(collection(fb().db, "reservations"), where("vendorId", "==", vendorId)), (snap) => cb(snap.docs.map(withId)), warn("listenVendorReservations"))
  );
}

export async function checkPickupCode(vendorId, code) {
  const { db } = fb();
  const snap = await getDocs(query(collection(db, "reservations"), where("vendorId", "==", vendorId), where("pickupCode", "==", code), where("status", "==", "reserved")));
  if (snap.empty) throw new Error("NOT_FOUND");
  const d = snap.docs[0];
  await updateDoc(d.ref, { status: "claimed", claimedAt: now() });
  await setDoc(codeRef(vendorId, code), { active: false, vendorId, studentUid: d.data().studentUid, reservationId: d.id }).catch(warn("release code"));
  return { id: d.id, ...d.data(), status: "claimed" };
}

export async function setStatusMsg(reservationId, msg) {
  await updateDoc(doc(fb().db, "reservations", reservationId), { statusMsg: msg });
}

// Gives the servings and the order slot back; reopens the listing if it had sold out.
export async function cancelReservation(reservationId) {
  const { db } = fb();
  const resRef = doc(db, "reservations", reservationId);
  await runTransaction(db, async (tx) => {
    const r = (await tx.get(resRef)).data();
    if (!r || r.status !== "reserved") throw new Error("NOT_CANCELLABLE");
    const listingRef = doc(db, "listings", r.listingId);
    const l = (await tx.get(listingRef)).data();
    tx.update(resRef, { status: "cancelled", cancelledAt: now() });
    tx.set(codeRef(r.vendorId, r.pickupCode), { active: false, vendorId: r.vendorId, studentUid: r.studentUid, reservationId });
    if (l) {
      const reopen = l.status === "closed" && !l.closedByVendor && l.cutoffAt > now();
      tx.update(listingRef, {
        servingsLeft: l.servingsLeft + r.qty,
        ordersLeft: l.ordersLeft + 1,
        status: reopen ? "open" : l.status,
        lastTx: reservationId,
      });
    }
  });
}

export async function getTodayResults(vendorId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const snap = await getDocs(query(collection(fb().db, "reservations"), where("vendorId", "==", vendorId), where("status", "==", "claimed")));
  let servings = 0;
  let pesos = 0;
  for (const d of snap.docs) {
    const r = d.data();
    if (r.createdAt < start.getTime()) continue;
    servings += r.qty;
    pesos += r.qty * (r.price || 0);
  }
  return { servings, pesos };
}

// ---------- accounts: one login, role chosen after sign-up ----------
export function onAuth(cb) {
  const { auth, db } = fb();
  let stopUser = () => {};
  let stopVendor = () => {};
  const stopAuth = onAuthStateChanged(auth, (fu) => {
    stopUser();
    stopVendor();
    stopUser = stopVendor = () => {};
    if (!fu || fu.isAnonymous) return cb(null); // guests count as signed out
    let vendorId = null;
    stopUser = onSnapshot(
      doc(db, "users", fu.uid),
      (snap) => {
        const u = { uid: fu.uid, email: fu.email, role: null, name: "", dorm: "", vendorId: null, vendor: null, ...(snap.exists() ? snap.data() : {}) };
        if (u.role !== "vendor" || !u.vendorId) {
          stopVendor();
          stopVendor = () => {};
          vendorId = null;
          return cb(u);
        }
        if (vendorId === u.vendorId) return; // the vendor listener below already reports changes
        stopVendor();
        vendorId = u.vendorId;
        // Live vendor doc, so a saved store name or street/landmark shows everywhere right away.
        stopVendor = onSnapshot(
          doc(db, "vendors", u.vendorId),
          (v) => cb({ ...u, vendor: withId(v) }),
          (e) => {
            warn("onAuth vendor")(e);
            cb({ ...u, vendor: null });
          }
        );
      },
      (e) => {
        warn("onAuth")(e);
        cb({ uid: fu.uid, email: fu.email, role: null, vendor: null });
      }
    );
  });
  return () => {
    stopUser();
    stopVendor();
    stopAuth();
  };
}

async function readUser(uid) {
  const { db, auth } = fb();
  const snap = await getDoc(doc(db, "users", uid));
  const u = { uid, email: auth.currentUser?.email, role: null, ...(snap.exists() ? snap.data() : {}) };
  if (u.role === "vendor" && u.vendorId) u.vendor = withId(await getDoc(doc(db, "vendors", u.vendorId)));
  return u;
}

export async function signIn(email, password) {
  const c = await signInWithEmailAndPassword(fb().auth, email.trim(), password);
  return readUser(c.user.uid);
}

export async function signUp(email, password) {
  const { auth, db } = fb();
  const c = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await setDoc(doc(db, "users", c.user.uid), { email: c.user.email, role: null, name: "", dorm: "", vendorId: null, createdAt: now() });
}

export async function completeProfile(role, data) {
  const { auth, db } = fb();
  const u = auth.currentUser;
  if (!u || u.isAnonymous) throw new Error("NOT_SIGNED_IN");
  if (role === "vendor") {
    const vendorId = await createVendor({ ...data, email: u.email, ownerUid: u.uid });
    await setDoc(doc(db, "users", u.uid), { role: "vendor", vendorId, name: data.name }, { merge: true });
  } else {
    await setDoc(doc(db, "users", u.uid), { role: "student", name: data.name, dorm: data.dorm }, { merge: true });
  }
  return readUser(u.uid);
}

export async function updateProfile(data) {
  const { auth, db } = fb();
  const u = await readUser(auth.currentUser.uid);
  if (u.role === "vendor") {
    if (!u.vendorId) throw new Error("NO_VENDOR");
    await setDoc(doc(db, "vendors", u.vendorId), { name: data.name, address: data.address ?? "" }, { merge: true });
    await setDoc(doc(db, "users", u.uid), { name: data.name }, { merge: true });
  } else {
    await setDoc(doc(db, "users", u.uid), { name: data.name, dorm: data.dorm }, { merge: true });
  }
  return readUser(u.uid);
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(fb().auth, email);
  } catch (e) {
    warn("resetPassword")(e); // same message on the page either way
  }
  return true;
}

export async function signOut() {
  await fbSignOut(fb().auth);
}

// ---------- alert (J6) ----------
// Show if rain probability ≥ 70% or rain ≥ 10 mm today (Open-Meteo, Sampaloc), or settings/today.suspension.
export async function getDemandAlert() {
  let suspension = false;
  try {
    const s = await getDoc(doc(fb().db, "settings", "today"));
    suspension = !!s.data()?.suspension;
  } catch (e) {
    warn("settings")(e);
  }
  if (suspension) return { show: true, reason: "suspension" };
  try {
    const r = await fetch("https://api.open-meteo.com/v1/forecast?latitude=14.61&longitude=120.99&daily=precipitation_probability_max,precipitation_sum&timezone=Asia/Manila&forecast_days=1");
    const j = await r.json();
    const probability = j.daily?.precipitation_probability_max?.[0] ?? 0;
    const rainMm = j.daily?.precipitation_sum?.[0] ?? 0;
    return { show: probability >= 70 || rainMm >= 10, reason: "rain", probability, rainMm };
  } catch (e) {
    warn("open-meteo")(e);
    return { show: false };
  }
}

export async function isAdmin() {
  const u = fb().auth.currentUser;
  if (!u) return false;
  const r = await u.getIdTokenResult(true);
  return r.claims.admin === true;
}

export async function setSuspension(on, note = "") {
  await setDoc(doc(fb().db, "settings", "today"), { suspension: !!on, note, updatedAt: now() });
}

export function listenSettings(cb) {
  return onSnapshot(doc(fb().db, "settings", "today"), (s) => cb(s.data() || { suspension: false }), warn("settings"));
}

// ---------- inbox: one chat thread per reservation ----------
// A message and the reservation's lastMsg fields are written together in one batch.
export async function sendMessage(reservationId, { from, text, kind = "chat", key = null }) {
  if (from === "student") await ensureStudentAuth();
  const { db, auth } = fb();
  const clean = String(text || "").trim().slice(0, 500);
  if (!clean) throw new Error("EMPTY");
  const at = now();
  const batch = writeBatch(db);
  const mref = doc(collection(db, "reservations", reservationId, "messages"));
  batch.set(mref, { from, kind, key: kind === "status" ? key : null, text: clean, uid: auth.currentUser?.uid ?? null, createdAt: at });
  const upd = { lastMsg: clean, lastMsgAt: at, lastFrom: from };
  if (kind === "status" && key) upd.statusMsg = key;
  batch.update(doc(db, "reservations", reservationId), upd);
  await batch.commit();
  notifyServer({ type: "message", reservationId });
  return mref.id;
}

export function listenMessages(reservationId, cb) {
  return live(() =>
    onSnapshot(
      query(collection(fb().db, "reservations", reservationId, "messages"), orderBy("createdAt")),
      (snap) => cb(snap.docs.map(withId)),
      (e) => {
        warn("listenMessages")(e);
        cb([]);
      }
    )
  );
}

// The student's own reservations (guest or signed in). Restarts when the user changes (e.g. first reserve signs in anonymously).
export function listenMyReservations(cb) {
  const { auth, db } = fb();
  let stop = () => {};
  const stopAuth = onAuthStateChanged(auth, (u) => {
    stop();
    stop = () => {};
    if (!u) return cb([]);
    stop = onSnapshot(query(collection(db, "reservations"), where("studentUid", "==", u.uid)), (snap) => cb(snap.docs.map(withId)), warn("listenMyReservations"));
  });
  return () => {
    stop();
    stopAuth();
  };
}

// Demo-only helper in mock.js; nothing to do on the real backend.
export function ensureDemoNearby() {}

// Ask the server (/api/notify) to send the push. Never blocks the UI; push is best-effort.
export function notifyServer(payload) {
  if (typeof window === "undefined") return;
  fetch("/api/notify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }).catch(() => {});
}

// ---------- push (J7) ----------
export async function enablePush({ lat, lng, radiusM } = {}) {
  if (typeof window === "undefined" || typeof Notification === "undefined" || !("serviceWorker" in navigator)) return false;
  const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
  if (!(await isSupported())) return false;
  if ((await Notification.requestPermission()) !== "granted") return false;
  const user = await ensureStudentAuth();
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(getMessaging(fb().app), { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, serviceWorkerRegistration: registration });
  if (!token) return false;
  await setDoc(doc(fb().db, "pushTokens", token), { token, uid: user.uid, lat: lat ?? UST.lat, lng: lng ?? UST.lng, radiusM: radiusM ?? 500, updatedAt: now() });
  return true;
}
