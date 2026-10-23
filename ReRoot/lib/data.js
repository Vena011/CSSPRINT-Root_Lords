// The only file pages import data functions from.
// Uses Firebase (lib/db.js) when the NEXT_PUBLIC_FIREBASE_* env vars are set, otherwise the
// demo data layer (lib/mock.js). Force one with NEXT_PUBLIC_DATA=firebase or NEXT_PUBLIC_DATA=mock.
import * as mock from "./mock";
import * as real from "./db";
import { firebaseConfigured } from "./firebase";

const mode = process.env.NEXT_PUBLIC_DATA || (firebaseConfigured ? "firebase" : "mock");
const impl = mode === "firebase" ? real : mock;
export const dataMode = mode;

export const createVendor = (...a) => impl.createVendor(...a);
export const createListing = (...a) => impl.createListing(...a);
export const listenOpenListings = (...a) => impl.listenOpenListings(...a);
export const listenListing = (...a) => impl.listenListing(...a);
export const listenVendorListings = (...a) => impl.listenVendorListings(...a);
export const closeListing = (...a) => impl.closeListing(...a);
export const reserve = (...a) => impl.reserve(...a);
export const listenReservation = (...a) => impl.listenReservation(...a);
export const listenVendorReservations = (...a) => impl.listenVendorReservations(...a);
export const checkPickupCode = (...a) => impl.checkPickupCode(...a);
export const setStatusMsg = (...a) => impl.setStatusMsg(...a);
export const cancelReservation = (...a) => impl.cancelReservation(...a);
export const getTodayResults = (...a) => impl.getTodayResults(...a);
export const onAuth = (...a) => impl.onAuth(...a);
export const signIn = (...a) => impl.signIn(...a);
export const signUp = (...a) => impl.signUp(...a);
export const signOut = (...a) => impl.signOut(...a);
export const completeProfile = (...a) => impl.completeProfile(...a);
export const updateProfile = (...a) => impl.updateProfile(...a);
export const resetPassword = (...a) => impl.resetPassword(...a);
export const getDemandAlert = (...a) => impl.getDemandAlert(...a);
export const enablePush = (...a) => impl.enablePush(...a);
export const setSuspension = (...a) => (impl.setSuspension ? impl.setSuspension(...a) : Promise.resolve());
export const listenSettings = (...a) => (impl.listenSettings ? impl.listenSettings(...a) : (a[0]({ suspension: false }), () => {}));
export const isAdmin = (...a) => impl.isAdmin(...a);
export const sendMessage = (...a) => impl.sendMessage(...a);
export const listenMessages = (...a) => impl.listenMessages(...a);
export const listenMyReservations = (...a) => impl.listenMyReservations(...a);
export const ensureDemoNearby = (...a) => impl.ensureDemoNearby(...a);
export const notifyServer = (...a) => impl.notifyServer(...a);
