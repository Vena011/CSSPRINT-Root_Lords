# Backend: what's built and how to switch it on (JC, about 20 minutes)

The Firebase backend is written. It runs in **Firebase mode** as soon as the `NEXT_PUBLIC_FIREBASE_*` env vars are set. Without them the app stays on the demo data, so nothing breaks while you set up. Read each file before you commit it (you'll explain it to judges).

| File | What it does |
| --- | --- |
| `lib/firebase.js` | Firebase init (lazy), `ensureStudentAuth()` (anonymous sign-in for guest students), emulator switch |
| `lib/db.js` | Every data function the screens call: listings, reserve/cancel transactions, pickup codes, orders, results, accounts (one login + role), profile, password reset, alert (Open-Meteo + suspension), push opt-in |
| `lib/data.js` | Picks `db.js` (Firebase) or `mock.js` (demo). Force with `NEXT_PUBLIC_DATA=firebase` or `NEXT_PUBLIC_DATA=mock` |
| `firestore.rules` | Security: role set once; owners edit their vendor/listings; students can only change counts inside a reserve/cancel transaction (checked against the reservation via `lastTx`); students read only their own reservations; vendors read only their own orders; `settings` writable only by an admin claim |
| `app/api/notify/route.js` + `lib/firebase-admin.js` | Push: new inbox messages to the other side of the order, new orders to the vendor, and new dishes to students within their radius (sale posts say "Sale near you: N% off!" with ₱regular → ₱sale, from `lib/deal.js`); more than 3 posts in a minute become one combined message; dead tokens cleaned up |
| `app/firebase-messaging-sw.js/route.js` | The push service worker, served with the public config filled in |
| `components/DealAlerts.js` | In-app sale banner while the app is open (and a system notification if the tab is in the background); works in demo mode too |
| `app/admin/page.js` | Class-suspension switch (log in as admin@reroot.test) |
| `scripts/seed.mjs` | Loads `data/demo-seed.json`: 5 vendors, 11 dishes, 4 sample orders, demo accounts (password `demo1234`). Re-run to reset the demo |
| `app/l/[id]/page.js` | Messenger/Viber preview card (dish, vendor, price, servings left) |
| `firebase.json`, `.env.example` | Rules path and emulator ports; every env var name |

## Steps
1. **Firebase console → Create project** `reroot-rootlords` (Analytics off).
2. **Build → Authentication → Get started:** enable **Email/Password** and **Anonymous**.
3. **Build → Firestore Database → Create:** production mode, location **asia-southeast1 (Singapore)**.
4. **Firestore → Rules:** paste all of `firestore.rules` → Publish.
5. **Project settings → General → Your apps → Web app** (`</>`): copy the config into `.env.local` using the names in `.env.example`.
6. **Project settings → Cloud Messaging → Web Push certificates → Generate key pair:** put it in `NEXT_PUBLIC_FIREBASE_VAPID_KEY`.
7. **Project settings → Service accounts → Generate new private key:** save it as `service-account.json` (already git-ignored). Then:
   ```bash
   npm i firebase firebase-admin
   FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json)" node scripts/seed.mjs
   ```
   You should see `Seeded 9 vendors, 17 listings, 4 reservations, 3 messages`.
8. `npm run dev` → log in as nena@reroot.test / demo1234 on one tab, reserve as a guest on another. The count must drop live.
9. **Vercel → Project → Settings → Environment Variables:** add every variable from `.env.local`. Put `FIREBASE_SERVICE_ACCOUNT` in as one line: run `cat service-account.json | tr -d '\n'` and paste the output. Redeploy.
10. **Firebase → Authentication → Settings → Authorized domains:** add your `*.vercel.app` domain.
11. Two real phones on the live link: run the core loop. On iPhone, Add to Home Screen first to test push.
12. **Sale alert test:** on phone A (student) open the app, tap **Enable alerts** and allow notifications, then lock the phone or switch apps. On phone B (vendor) post a dish with **Lower price**, price ₱60 and **Regular price** ₱90. Phone A should get "Sale near you: 33% off!" within a few seconds. With the app open, the same alert shows as a banner at the top instead.
13. **Inbox + push test:** phone B (vendor) → Account → turn on **Notifications**. Phone A (student) reserves a dish, then taps **On my way** on the pickup screen. Phone B gets "New order" and then the message as a push (app closed) or a banner (app open). Reply from **Inbox** on phone B; phone A gets it the same way. Messages are in `reservations/{id}/messages` (rules already included).

## If something fails
- **"Missing or insufficient permissions"** in the browser console: copy the exact line into the group chat. It names the collection. Don't loosen the rules to "allow all".
- **A query asks for an index:** click the link in the error (Firebase creates it), wait about 1 minute.
- **Push not arriving:** check the VAPID key and `FIREBASE_SERVICE_ACCOUNT` on Vercel. Push is Tier 3: if it isn't working by 12:30 AM, cut it, as the plan says.
- **Rules not tested here:** the Firestore emulator couldn't be downloaded in the build environment, so the first real test of `firestore.rules` is step 8. If one rule blocks a feature, tell Lord and fix that rule only.
