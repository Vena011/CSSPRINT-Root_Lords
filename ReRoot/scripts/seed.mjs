// Loads the demo data (data/demo-seed.json) into Firebase. Re-run before recording the demo to reset counts.
//   Real project:  FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json)" node scripts/seed.mjs
//   Emulator:      FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 GCLOUD_PROJECT=demo-reroot node scripts/seed.mjs
// Demo password for every seeded account: demo1234 · admin@reroot.test can use /admin.
import fs from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const emulator = !!process.env.FIRESTORE_EMULATOR_HOST;
initializeApp(emulator ? { projectId: process.env.GCLOUD_PROJECT || "demo-reroot" } : { credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
const db = getFirestore();
const auth = getAuth();
const seed = JSON.parse(fs.readFileSync(new URL("../data/demo-seed.json", import.meta.url)));
const PASSWORD = "demo1234";
const t = Date.now();

async function account(email, extra = {}) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password: PASSWORD });
  } catch {
    user = await auth.createUser({ email, password: PASSWORD, emailVerified: true });
  }
  if (extra.admin) await auth.setCustomUserClaims(user.uid, { admin: true });
  return user.uid;
}

async function wipe(name, field, values) {
  for (const v of values) {
    const snap = await db.collection(name).where(field, "==", v).get();
    // recursiveDelete also removes subcollections (the chat messages under each reservation)
    await Promise.all(snap.docs.map((d) => db.recursiveDelete(d.ref)));
  }
}

const vendorIds = seed.vendors.map((v) => v.id);
await wipe("listings", "vendorId", vendorIds);
await wipe("reservations", "vendorId", vendorIds);
await wipe("pickupCodes", "vendorId", vendorIds);

for (const v of seed.vendors) {
  const uid = await account(v.email);
  await db.doc(`vendors/${v.id}`).set({ name: v.name, address: v.address, lat: v.lat, lng: v.lng, email: v.email, ownerUid: uid, createdAt: t });
  await db.doc(`users/${uid}`).set({ email: v.email, role: "vendor", name: v.name, dorm: "", vendorId: v.id, createdAt: t });
}
const studentUid = await account("student@reroot.test");
await db.doc(`users/${studentUid}`).set({ email: "student@reroot.test", role: "student", name: "Juan D.", dorm: "dapitan", vendorId: null, createdAt: t });
const adminUid = await account("admin@reroot.test", { admin: true });
await db.doc(`users/${adminUid}`).set({ email: "admin@reroot.test", role: "student", name: "Admin", dorm: "other", vendorId: null, createdAt: t });

const byId = Object.fromEntries(seed.vendors.map((v) => [v.id, v]));
for (const { cutoffMin, ...l } of seed.listings) {
  const v = byId[l.vendorId];
  await db.doc(`listings/${l.id}`).set({ ...l, vendorName: v.name, pickupAddress: v.address, lat: v.lat, lng: v.lng, status: "open", closedByVendor: false, cutoffAt: t + cutoffMin * 60000, createdAt: t - 30 * 60000 });
}
const priceOf = Object.fromEntries(seed.listings.map((l) => [l.id, l.price]));
// "u-student" in the demo data means the demo student account (student@reroot.test).
const uidOf = (u) => (u === "u-student" ? studentUid : u || "seed");
for (const { ageMin, id, ...r } of seed.reservations) {
  const msgs = (seed.messages || []).filter((m) => m.reservationId === id);
  const last = msgs.reduce((a, m) => (!a || m.ageMin < a.ageMin ? m : a), null);
  await db.doc(`reservations/${id}`).set({
    ...r,
    studentUid: uidOf(r.studentUid),
    vendorName: byId[r.vendorId]?.name ?? "",
    price: priceOf[r.listingId],
    createdAt: t - ageMin * 60000,
    ...(last ? { lastMsg: last.text, lastMsgAt: t - last.ageMin * 60000, lastFrom: last.from } : {}),
  });
  await db.doc(`pickupCodes/${r.vendorId}_${r.pickupCode}`).set({ active: r.status === "reserved", vendorId: r.vendorId, studentUid: uidOf(r.studentUid), reservationId: id });
  for (const m of msgs) {
    await db.collection(`reservations/${id}/messages`).add({ from: m.from, kind: m.kind, key: m.key ?? null, text: m.text, uid: null, createdAt: t - m.ageMin * 60000 });
  }
}
await db.doc("settings/today").set({ suspension: false, note: "", updatedAt: t });
console.log(`Seeded ${seed.vendors.length} vendors, ${seed.listings.length} listings, ${seed.reservations.length} reservations, ${(seed.messages || []).length} messages. Password for all: ${PASSWORD}`);
process.exit(0);
