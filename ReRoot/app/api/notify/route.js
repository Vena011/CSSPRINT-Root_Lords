// J7: push notifications. Three kinds, all sent with Firebase Cloud Messaging:
//   { type: "listing", listingId }         → "new ulam / sale near you" to students within their radius (after a vendor posts)
//   { type: "message", reservationId }     → a new inbox message, to the other side of that order's chat
//   { type: "reservation", reservationId } → "new order" to the vendor
// The text always comes from Firestore (never from the request body), so the endpoint can't be used to send made-up messages.
// Needs the server-only env var FIREBASE_SERVICE_ACCOUNT (the service-account JSON, one line). Never commit it.
import { NextResponse } from "next/server";
import { adminDb, adminMessaging, adminReady } from "@/lib/firebase-admin";
import { distanceM } from "@/lib/geo";
import { dealAlertText } from "@/lib/deal";
import { dormName } from "@/lib/dorms";

const recent = []; // [{ at, vendorName }] to combine bursts (more than 3 posts within a minute)

async function tokensFor(uid) {
  if (!uid) return [];
  const snap = await adminDb().collection("pushTokens").where("uid", "==", uid).get();
  return snap.docs.map((d) => d.data().token);
}

async function send(targets, { title, body, link }) {
  if (!targets.length) return { ok: true, sent: 0 };
  const res = await adminMessaging().sendEachForMulticast({
    tokens: targets.slice(0, 500),
    notification: { title, body },
    webpush: { fcmOptions: { link }, notification: { icon: "/icon-192.png", badge: "/icon-192.png" } },
  });
  // Clean up tokens that are no longer valid
  const dead = [];
  res.responses.forEach((r, i) => {
    if (!r.success && /registration-token-not-registered|invalid-argument/.test(r.error?.code || "")) dead.push(targets[i]);
  });
  await Promise.all(dead.map((t) => adminDb().collection("pushTokens").doc(t).delete().catch(() => {})));
  return { ok: true, sent: res.successCount, failed: res.failureCount };
}

// Inbox message or new order: one recipient, looked up from the reservation.
async function notifyOrderParty(type, reservationId) {
  const rs = await adminDb().collection("reservations").doc(String(reservationId)).get();
  if (!rs.exists) return NextResponse.json({ ok: false, reason: "not found" }, { status: 404 });
  const r = rs.data();
  const [vs, ls] = await Promise.all([
    adminDb().collection("vendors").doc(String(r.vendorId)).get(),
    adminDb().collection("listings").doc(String(r.listingId)).get(),
  ]);
  const v = vs.data() || {};
  const l = ls.data() || {};
  if (type === "reservation") {
    if (Date.now() - (r.createdAt || 0) > 5 * 60000) return NextResponse.json({ ok: false, reason: "not fresh" }, { status: 409 });
    return NextResponse.json(
      await send(await tokensFor(v.ownerUid), {
        title: `Bagong order: ${r.name} ×${r.qty}`,
        body: `${l.dish || "Order"} · code ${r.pickupCode} · ${dormName(r.dorm)}`,
        link: "/vendor/orders",
      })
    );
  }
  if (!r.lastMsgAt || Date.now() - r.lastMsgAt > 2 * 60000) return NextResponse.json({ ok: false, reason: "no fresh message" }, { status: 409 });
  const toVendor = r.lastFrom === "student";
  return NextResponse.json(
    await send(await tokensFor(toVendor ? v.ownerUid : r.studentUid), {
      title: toVendor ? `${r.name} · ${l.dish || "order"} (code ${r.pickupCode})` : v.name || l.vendorName || "ReRoot",
      body: r.lastMsg || "",
      link: `/inbox/${reservationId}`,
    })
  );
}

export async function POST(req) {
  if (!adminReady()) return NextResponse.json({ ok: false, reason: "push not configured" }, { status: 503 });
  const { type = "listing", listingId, reservationId } = await req.json().catch(() => ({}));
  if (type === "message" || type === "reservation") {
    if (!reservationId) return NextResponse.json({ ok: false, reason: "reservationId required" }, { status: 400 });
    return notifyOrderParty(type, reservationId);
  }
  if (!listingId) return NextResponse.json({ ok: false, reason: "listingId required" }, { status: 400 });

  const snap = await adminDb().collection("listings").doc(String(listingId)).get();
  if (!snap.exists) return NextResponse.json({ ok: false, reason: "not found" }, { status: 404 });
  const l = snap.data();
  if (l.status !== "open" || Date.now() - (l.createdAt || 0) > 10 * 60000) return NextResponse.json({ ok: false, reason: "not a fresh open listing" }, { status: 409 });

  const nowMs = Date.now();
  while (recent.length && nowMs - recent[0].at > 60000) recent.shift();
  recent.push({ at: nowMs, vendorName: l.vendorName });
  const combined = recent.length > 3;

  // Students only: vendors' tokens are for their own orders and messages.
  const vendorOwners = new Set((await adminDb().collection("vendors").select("ownerUid").get()).docs.map((d) => d.data().ownerUid));
  const tokens = await adminDb().collection("pushTokens").get();
  const targets = [];
  tokens.forEach((d) => {
    const t = d.data();
    if (vendorOwners.has(t.uid)) return;
    if (distanceM({ lat: t.lat, lng: t.lng }, { lat: l.lat, lng: l.lng }) <= (t.radiusM || 500)) targets.push(t.token);
  });

  const one = dealAlertText(l, "fil");
  const title = combined ? `${recent.length} carinderia malapit sa iyo ang nag-post ng ulam` : one.title;
  const body = combined ? "Silipin ang ReRoot bago maubos." : one.body;
  const link = combined ? "/" : `/l/${listingId}`;
  return NextResponse.json(await send(targets, { title, body, link }));
}
