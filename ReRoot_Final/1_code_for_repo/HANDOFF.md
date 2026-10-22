# ReRoot front end: handoff (Lawrence's W3–W8)

Built from the Figma file "ReRoot" (Screens page). It runs today on fake data (`lib/mock.js`) and switches to Firebase with **one line**.

## 1. Drop it into the repo (Lawrence, from your own account)

```bash
git checkout main && git pull
git checkout -b feat/ui-core
# unzip ReRoot_frontend.zip at the repo root (the folder that has package.json)
npm i leaflet react-leaflet @fontsource/plus-jakarta-sans
npm run dev        # open http://localhost:3000
```
Commit in small pieces so the history shows steady work, e.g.
`Add theme and layout` → `Add UI components` → `Build student screens` → `Build vendor screens` → `Add map, share sheet and language toggle`.

**Files in this zip.** Everything is Lawrence's except the three marked JC:
- `app/layout.js`, `app/globals.css` (theme tokens), `app/page.js` and every route under `app/l`, `app/r`, `app/vendor`
- `components/*`
- `lib/mock.js` (temporary), `lib/data.js` (the switch), `lib/copy.js` (EN/FIL text), `lib/dorms.js`, `lib/rank.js`, `lib/time.js`, `lib/demo-data.js` (Aleia's demo data)
- `data/demo-seed.json`: the same demo data as JSON for JC's seed script
- `README.md`: the full submission README (replaces the 7:30 one), `docs/screenshots/*` (W8)
- `lib/geo.js`: **JC**. Keep his if it's already on main; the function names are the same.
- `public/manifest.json`: **JC** (J7). Keep his if he made one.
- `public/*.png`, `logo-mark.svg`, `app/favicon.ico`: Lord's assets.

## 2. Test the demo before Firebase (2 tabs)
1. Tab A: `/`. Tap Chicken Adobo, reserve 2 servings, and you get a pickup code.
2. Tab B: `/login`. Log in with **nena@reroot.test** (any password, 6+ characters), then open Orders. The new order is there, grouped by dorm. Also try **Sign up** with a new email: you choose Student or Vendor on `/onboarding`. Demo student account: student@reroot.test.
3. Tap "Ready na po" in tab B, and tab A shows it live. Enter the code in "Check code" and it's claimed. The results card updates.
4. Post a dish. The share sheet opens. The new dish appears on the student home in tab A without refreshing.

## 3. W4: switch to JC's real data (9:00 PM)
In `lib/data.js`, change `export * from "./mock";` to `export * from "./db";`, then delete `lib/mock.js`.

**JC: db.js needs these exports, using the same names and arguments as mock.js.**
| Function | Notes |
|---|---|
| Section 5 contract | createVendor, createListing, listenOpenListings, listenListing, reserve, listenVendorReservations, checkPickupCode, setStatusMsg, closeListing, getTodayResults |
| `reserve()` return | Return `{ id, pickupCode }`. The UI needs the reservation id for `/r/[id]`. Throw `Error("SOLD_OUT")` when it's gone. |
| `checkPickupCode()` | Return the reservation, or throw when it isn't found |
| `listenReservation(id, cb)` | Pickup screen (live vendor message and claimed state) |
| `listenVendorListings(vendorId, cb)` | Dashboard "Today's listings", including closed ones |
| `onAuth(cb)` | ONE login for everyone. Calls `cb(user or null)` where `user = { uid, email, role, name, dorm, vendorId, vendor }` (`role` is `null` until onboarding, then `"student"` or `"vendor"`; `vendor` = the vendor doc when role is vendor). Wrap `onAuthStateChanged` + read `users/{uid}`. Returns an unsubscribe function, like every listener. |
| `signIn(email, pw)` → user, `signUp(email, pw)`, `signOut()` | Firebase email/password. `signUp` creates `users/{uid}` with `role: null`. |
| `completeProfile(role, data)` → user | After sign-up (`/onboarding`). Student: `{name, dorm}` saved on `users/{uid}`. Vendor: `{name, address, lat, lng}` → `createVendor(...)`, then `users/{uid}.vendorId` + `role: "vendor"`. Rules: a user writes only their own `users/{uid}`, and `role` can be set once. |
| Guest students | Still allowed: reserving without an account uses anonymous sign-in as before (`ensureStudentAuth`). |
| `resetPassword(email)` | `/forgot`. Firebase `sendPasswordResetEmail(auth, email)`. Resolve even if the email has no account (the page shows the same message either way). |
| `updateProfile(data)` → user | `/account`. Student: `{name, dorm}` on `users/{uid}`. Vendor: `{name, address}` on `users/{uid}` and `vendors/{vendorId}`. |
| `cancelReservation(id)` | Pickup screen "Cancel reservation". `runTransaction`: only if status is `reserved` → `cancelled`; add `qty` back to `servingsLeft`, `ordersLeft + 1`; reopen the listing if it closed by selling out and the cutoff hasn't passed (not if the vendor closed it: set `closedByVendor: true` in `closeListing`). Rules: the student who made it can cancel it. |
| `getDemandAlert()` | Returns `{ show, reason: "rain" or "suspension", probability }` (J6 Open-Meteo + settings/today) |
| `enablePush({lat,lng,radiusM})` | J7. Returns true if granted. Saves the token to pushTokens. |

Timestamps can be numbers (ms) or Firestore Timestamps; the UI converts both (`lib/time.js`).
`statusMsg` values are `"student:otw"`, `"student:lobby"`, `"vendor:ready"`, `"vendor:lobby"` and `"vendor:soldout"`. Allow these in the security rules.
After posting, the vendor app calls `POST /api/notify {listingId}` (J7). It fails silently until that route exists.
`/l/[id]/page.js` is a Server Component, so JC can add `generateMetadata` there for preview cards (J6).

## 4. Where things are
| Plan item | Where |
|---|---|
| W3 components | `components/ui.js` (Button, Input, Select, Badge, Chip, Header, LangToggle, Icon), `ListingCard.js`, `CountdownTimer.js` |
| S1 home: recommendations, radius, list/map | `app/page.js`, ranking formula in `lib/rank.js`, `components/MapView.js` (Leaflet, loaded with `ssr:false`) |
| Geolocation fallback to UST | `components/hooks.js` → `usePosition()` |
| Radius and view remembered | `useStored()` (localStorage in try/catch) |
| S2 / S3 / S4 | `components/ListingDetail.js`, `ReserveForm.js` (keeps `?dorm=`), `PickupCode.js` (quick status) |
| Login + role choice | `app/login` + `components/LoginForm.js` (one login for everyone, guest option), `app/onboarding` (Student or Vendor, then their details), `components/AccountButton.js` (header). `/vendor/login` redirects to `/login`. |
| V1–V5 | `VendorDashboard.js` (alert V6 + results V8), `app/vendor/post`, `VendorOrders.js` (grouped by dorm + Share per dorm + vendor quick status), `app/vendor/check` |
| V7 share sheet | `components/ShareSheet.js` (Web Share API, copy-link fallback, dorm links `?dorm=`) |
| W6 FIL/EN | `lib/copy.js` + `components/LangProvider.js`. Vendors default to FIL, students to EN, and the toggle in the header is remembered. **Aleia: replace the draft text, keep the keys.** |
| W7 notifications | `components/NotifyOptIn.js` (iPhone Add-to-Home-Screen steps, denied state) |
| States | `components/States.js` (empty, loading skeleton, error), sold-out toast and disabled button in `ReserveForm.js` |

Demo data lives in ONE place: `lib/demo-data.js` (vendors, dishes, sample orders) and `lib/dorms.js`. JC's seed script should read `data/demo-seed.json` (same data). `cutoffMin` / `ageMin` are minutes relative to seed time, so the demo works at any hour. The fake data layer re-seeds itself if the saved demo is more than 6 hours old.

## 5. Added for the UI/UX checklist (Oct 23, 12:30 AM)
| Checklist item | Where |
| --- | --- |
| Splash screen | `components/Splash.js` (logo on first load per session, rendered in `app/layout.js`) |
| Loading screen | `app/loading.js` (spinner) + skeletons in `components/States.js` |
| Welcome / landing | `components/WelcomeCard.js` on the student home (how it works in 3 steps; dismiss is remembered) |
| Login / sign-up / role | `/login` (one login for everyone, tabs), `/onboarding` (Student or Vendor after sign-up), `/vendor/login` redirects to `/login` |
| Forgot password | `/forgot` (`resetPassword`) |
| Validation + errors | Login, sign-up, onboarding, reserve, post, check code, account |
| Navigation | Header on every screen, `components/BottomNav.js`: student Home / My orders / Account, vendor Dashboard / Post / Orders / Code |
| Search + no results | Student home search box (dish or carinderia) with a "No dishes match" state |
| List / detail / create / edit | Home list + map, `/l/[id]`, `/vendor/post`, `/account` edits profile, vendor can close a listing |
| My orders | `/me` (reservation ids saved on the phone, live status) |
| Profile + settings + logout | `/account`: profile edit, language, notifications switch, default radius, help/privacy/terms, log out |
| Confirm before destructive actions | `components/ConfirmDialog.js`: cancel reservation, close listing, log out (Esc closes) |
| Toasts, modals, tabs, switch | `Toast.js`, `ShareSheet.js` (Esc closes), login tabs, `Switch` in `ui.js` |
| 404, help, privacy, terms | `app/not-found.js`, `/help`, `/privacy` (Data Privacy Act RA 10173), `/terms` |
| Responsive | Phone one column; iPad (768 px+) two-column card grids; desktop (1024 px+) three columns, max width 1160 px; forms stay max 576 px wide |
| Hover / focus / active | Button, chip, link hovers; visible focus ring for keyboard users (`globals.css`); reduced-motion respected |

