# ReRoot: Documentation

Team Root Lords · CSSprint 2026 · Live app: **https://cssprint-root-lords.vercel.app**

This file explains how ReRoot works, how to run and deploy it, and what changed during testing. For the problem, users and pitch, see [README.md](README.md).

---

## 1. Overview

ReRoot connects prepare-ahead food vendors near UST with nearby students, so same-day surplus food is sold instead of thrown away.

- **Vendors** post a dish with servings, a deal (lower price or bigger serving), a cutoff time, a pickup location and an optional photo. They see orders grouped by dorm, chat with students, and confirm pickups with a 4-digit code.
- **Students** see dishes near them (300 m / 500 m / 1 km, list or map), reserve as a guest or with an account, get a pickup code, chat with the vendor, and get alerts for new and discounted dishes.
- **Pickup only:** there are no deliveries. Students go to the store with their code.

## 2. Tech stack

| Part | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, JavaScript), React 19, Tailwind CSS 4 |
| Database + realtime | Cloud Firestore |
| Login | Firebase Auth: email/password for everyone (role chosen at sign-up), anonymous sign-in for guest students |
| Push | Firebase Cloud Messaging (web push) + `/api/notify` using firebase-admin |
| Map | Leaflet + OpenStreetMap tiles |
| Weather | Open-Meteo forecast API |
| Hosting | Vercel |

## 3. Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the Firebase values, or leave empty for demo mode
npm run dev                  # http://localhost:3000
```

**Two data modes** (switched in `lib/data.js`):

| Mode | When | Data |
| --- | --- | --- |
| Firebase | the `NEXT_PUBLIC_FIREBASE_*` values are set | real Firestore, real login, push |
| Demo | no Firebase values, or `NEXT_PUBLIC_DATA=mock` | sample data in the browser (`localStorage`), shared across tabs; any password of 6+ characters works |

In demo mode each tab has its own login, so one browser window can hold a student tab and a vendor tab. In Firebase mode the login is shared by the browser, so test the student side in an incognito window or on another phone.

**Demo accounts** (password `demo1234`):
- Vendors: `nena@reroot.test`, `ben@reroot.test`, `tess@reroot.test`, `lacson@reroot.test`, `ramon@reroot.test`, `liza@reroot.test`, `rosa@reroot.test`, `boy@reroot.test`, `pacing@reroot.test`
- Student: `student@reroot.test` (has a sample chat with Aling Nena's)
- Admin: `admin@reroot.test` (class-suspension switch at `/admin`)

## 4. Environment variables

Put these in `.env.local` for local runs and in **Vercel → Settings → Environment Variables** for the live app. Never commit `.env.local` or the service-account file; `.gitignore` already excludes them.

| Name | Where to get it | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_STORAGE_BUCKET`, `_MESSAGING_SENDER_ID`, `_APP_ID` | Firebase → Project settings → General → Web app config | No (public web config; security comes from the rules) |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Firebase → Project settings → Cloud Messaging → Web Push certificates | No |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase → Project settings → Service accounts → Generate new private key; paste the JSON on one line | **Yes**, server only |
| `NEXT_PUBLIC_SITE_URL` | `https://cssprint-root-lords.vercel.app` (used for share links and preview cards) | No |
| `NEXT_PUBLIC_DATA` | optional: `firebase` or `mock` to force a data mode | No |

## 5. Firebase setup

1. **Authentication:** enable **Email/Password** and **Anonymous**. Under Settings → Authorized domains, add `cssprint-root-lords.vercel.app`.
2. **Firestore:** create the database, then paste all of `firestore.rules` into Firestore → Rules and **Publish**.
3. **Cloud Messaging:** generate a Web Push key pair, and put it in `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
4. **Demo data:** reset or load it with
   ```bash
   FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json)" node scripts/seed.mjs
   ```
   It should print `Seeded 9 vendors, 17 listings, 4 reservations, 3 messages`. Re-run it before a demo to reset counts.

## 6. Deploy

The Vercel project is connected to the GitHub repo, so **every push to `main` redeploys automatically** (about 2 minutes).

- After changing an environment variable in Vercel: Deployments → ⋯ → **Redeploy**.
- Vercel doesn't deploy `firestore.rules`: after changing them, publish them in the Firebase console.
- Changing code doesn't change data. To reset the demo data, run the seed script again.

## 7. How it works

### Data (Firestore)

| Collection | Fields | Who can write |
| --- | --- | --- |
| `users/{uid}` | email, role (`student` or `vendor`, set once), name, dorm, vendorId | the user |
| `vendors/{id}` | name, address, lat, lng, ownerUid | the owner |
| `listings/{id}` | vendorId, vendorName, dish, dealType, dealNote, price, originalPrice, photo, pickupAddress, lat, lng, servingsTotal/Left, maxOrders, ordersLeft, cutoffAt, status | the owning vendor; students only change the counts inside a reserve/cancel transaction |
| `reservations/{id}` | listingId, vendorId, vendorName, studentUid, name, dorm, qty, price, pickupCode, status, statusMsg, lastMsg, lastMsgAt, lastFrom | the student creates and cancels; the vendor claims |
| `reservations/{id}/messages/{mid}` | from, kind (`chat` or `status`), key, text, uid, createdAt | only that student and that vendor |
| `pickupCodes/{vendorId}_{code}` | active, reservationId | claimed inside the reserve transaction, so codes are unique per vendor |
| `pushTokens/{token}` | uid, lat, lng, radiusM | each user writes their own; only the server reads them |
| `settings/today` | suspension | admin only (custom claim) |

### Key flows

- **Reserve:** a Firestore transaction checks servings and the cutoff, claims a unique pickup code, creates the reservation and lowers the counts. Two students can never get the last serving. A listing closes itself when it sells out, is full, or passes its cutoff.
- **Order Codes:** the vendor types the student's code, or taps **Confirm** in the live "Waiting for pickup" list.
- **Inbox:** one chat per order. "On my way" / "I'm here" (student) and "Ready na po" / "Sorry, sold out" (vendor) are sent as chat messages. Read status is kept on each device, which drives the unread badges.
- **Notifications:**
  - App open: a banner.
  - App in the background: a system notification.
  - App closed: a push from `/api/notify`. It covers three things: new dishes near a student (sale posts say "Sale near you: N% off!"), new orders to the vendor, and new messages to the other side. The message text is always read from Firestore, never taken from the request.
- **Recommendations:** `score = 40 × (1 − distance ÷ radius) + 30 × (1 − minutesLeft ÷ 180) + 20 × (1 − price ÷ highest price) + 10 if bought from this vendor before`. The top 3 are shown as "Recommended".
- **Low-demand alert:** a rain probability of 70% or more, or 10 mm of rain or more (Open-Meteo, Sampaloc), or the admin's class-suspension switch, warns vendors to cook less or post early.
- **Photos:** resized on the phone to 720 px JPEG (about 60–150 KB) and stored on the listing, so no file storage service is needed.

### Folder structure

```
app/                 pages: / (student dashboard), /l/[id] dish, /l/[id]/reserve, /r/[id] pickup code,
                     /me my orders, /inbox and /inbox/[id] chat, /account, /login, /onboarding, /forgot,
                     /vendor (dashboard, post, orders, check = Order Codes), /admin, /help, /privacy, /terms
app/api/notify/      push notifications (firebase-admin)
components/          screens and UI (ListingCard, ChatThread, LeafletMap, MessageAlerts, DealAlerts, ...)
lib/                 data layer (data.js → db.js Firebase | mock.js demo), copy.js (EN/FIL), rank, geo, photo, deal
scripts/seed.mjs     loads data/demo-seed.json into Firebase
firestore.rules      security rules
public/              icons, logo, preview image, manifest
docs/screenshots/    README images
```

## 8. Testing checklist

Run it on two phones on the live link. On iPhone, add the app to the Home Screen first, or push won't work.

1. Sign up as a vendor and as a student, choosing the role on the sign-up form.
2. **Vendor:** post a dish with a photo, a pickup pin and a sale price (₱90 → ₱60). **Student:** a "Sale near you: 33% off!" alert appears.
3. **Student:** reserve and get a code, then tap **On my way**. **Vendor:** gets the "New order" alert, then the message.
4. **Vendor:** reply in the Inbox and tap **Ready na po**. **Student:** gets the alert.
5. **Vendor:** confirm the code in Order Codes. The results card updates.
6. **Student:** cancel a reservation. The serving comes back.
7. Check phone, iPad and desktop widths, the Filipino and English versions, and that logging out shows the confirmation above the nav bar.

## 9. Revision history (from team testing, Oct 23)

| Round | Changes |
| --- | --- |
| 1 | "I'm here" replaces the lobby wording. Late-night posting fixed (a cutoff after midnight now means the next day). The nav doesn't flash between roles. Role choice on the sign-up form. Login ⇄ sign-up animation. Vendor address saves. Separate student and vendor navigation, with "Dashboard" for both. **Order Codes** with a live waiting list. Grammarly hydration warning and the dish-page metadata warning fixed. |
| 2 | Inbox and chat per order. All lobby/delivery wording removed (pickup only). Notifications for messages and new orders. Demo dishes for 300 m and 500 m. Dish photos. New loading screen with a gradient and a progress bar. Account chip on every screen. |
| 3 | Buyer alerts pop up reliably, with system notifications. Pickup location per dish (address, map pin, directions). Map crash after going back fixed (rebuilt on plain Leaflet). |
| 4 | Account page uses the full width (two columns on iPad and desktop). The log-out confirmation is no longer hidden under the bottom nav. |
| 5 | README finalized with the live link. Internal handoff files removed. This documentation added. |

## 10. Design

The Figma file has the wireframes, the style guide (colors, type, components) and hi-fi screens for phone, iPad and desktop, with a click-through prototype: https://www.figma.com/design/ZcBuIaRZjjnQZaCYpBaHLn
