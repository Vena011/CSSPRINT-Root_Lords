// Server-only Firebase Admin (API routes, seed script). Reads FIREBASE_SERVICE_ACCOUNT (JSON string).
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

export function adminReady() {
  return Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
}

function app() {
  if (getApps().length) return getApps()[0];
  return initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
}

export const adminDb = () => getFirestore(app());
export const adminMessaging = () => getMessaging(app());
