# ReRoot: the whole app in one folder

Team Root Lords · CSSprint 2026 · Fri Oct 23

This folder is the complete repo: front end, Firebase backend, security rules, seed script, docs and brand assets. Unzip it, then `npm install` and `npm run dev`. It runs at once on demo data. When the Firebase keys are added to `.env.local`, it switches to the live backend by itself.

## Third revisions (Fri Oct 23, 9 AM): all 3 done
| # | Revision | What changed |
| --- | --- | --- |
| 1 | Buyers didn't get a pop-up when a vendor posts | **Demo mode:** the alert used to show only for posts within your radius of your real location, and demo stores are near UST, so testers elsewhere got nothing. Now every new post alerts in demo mode. **Firebase mode:** the radius still applies, the same rule as the push. A system notification now pops up whenever notifications are allowed, even if the tab is open or in the background. A confirmation notification shows when you turn alerts on. The "Turn on notifications" card moved to the top of the home screen. |
| 2 | Store location on each post | Post has a **Pickup location** section. The store address/landmark is pre-filled from the account. You can tap the map to move the pin, or press **Use my current location**. Each dish stores its own pickup address and pin. Students see the address on the card, and the dish page shows a map, "Pickup at …" and a **Directions** button (Google Maps). The pickup-code screen has the address and directions too. |
| 3 | Map error after going back (`appendChild`, `Map container is being reused`, `_map is null`) | The map was rebuilt without react-leaflet. Each map is created when the screen opens and fully removed when you leave. Next.js keeps hidden pages alive and replays their effects, which is what broke the old map. Opening the map, leaving and coming back three times in a row no longer causes errors. `react-leaflet` was removed from `package.json`. |

## Second revisions (Fri Oct 23, 8 AM): all 7 done
| # | Revision | What changed |
| --- | --- | --- |
| 1 | Chat between student and vendor; "On my way" did nothing | New **Inbox** (bottom nav, both roles) with one chat per order. Students reach it from the pickup screen ("Message the vendor") and vendors from each order ("Chat"). **On my way / I'm here** and **Ready na po / Sorry, sold out** are sent as chat messages, so the other side is notified. |
| 2 | Remove "lobby" everywhere (pickup only) | The vendor's "On the way to your lobby" is gone; only **On my way** and **I'm here** (student) and **Ready na po** and **Sorry, sold out** (vendor) remain. The README no longer mentions the lobby. |
| 3 | Inbox, then push notifications | **App open:** a banner for each new message and, for vendors, each new order ("New order: Lia ×1 · Pork Sisig · code 3336"). **App in the background:** a system notification. **App closed:** a push from `/api/notify` (Firebase mode). Vendors can now turn on notifications in Account. There's a red unread count on the Inbox tab. |
| 4 | Demo dishes for 300 m and 500 m | Added 4 carinderias and 6 dishes (about 110 m, 240 m, 390 m and 740 m from UST). In demo mode, if you test from somewhere else, 3 demo carinderias are added around your real location (about 150 m, 260 m and 430 m away), so every radius chip has dishes. |
| 5 | Vendor photo on the post | **Dish photo (optional)** on Post: pick from the gallery or camera, see a preview, change or remove it. The photo is resized on the phone (max 720 px) and shows on cards, the dish page, the reserve form, the share sheet and the inbox. |
| 6 | Loading page | A green gradient with a warm glow, the logo floats in, the name and tagline fade up, and a loading bar fills over about 2 s. The whole intro takes about 3 s. Page loads use the same bar. It plays once per browser session. In dev mode it used to vanish instantly (React runs effects twice in dev); that is fixed. |
| 7 | Account icon missing on other sections | The account chip (initial, or "Log in") is now in the header of every screen: Post, Orders, Order Codes, Inbox, Account, the dish and pickup pages, and so on. |

Figma matches this round:
- New screens: Inbox and Chat for both student and vendor, and the Loading screen.
- Both bottom navs have an Inbox tab, and every header has the account chip.
- Post has the photo picker, and the pickup screen has "Message the vendor".
- The lobby buttons are replaced with Chat.
- The prototype links the Inbox tabs and the chats.

Demo inbox: log in as **nena@reroot.test** to see 2 seeded chats, or as **student@reroot.test** to see Juan's chat with Aling Nena. The password is any 6+ characters, for example `demo1234`.

## Revisions from testing (Fri Oct 23, 2 AM): all 9 done
| # | Revision | What changed |
| --- | --- | --- |
| 1 | "Nasa lobby na ako" → "I'm here" | Student quick status is now **On my way / I'm here** (Filipino: "Papunta na ako / Nandito na ako"). Figma updated too. |
| 2 | Post didn't work for vendors | Posting late at night failed: a cutoff after midnight (e.g. 1:30 AM posted at 11:40 PM) was read as today, which had already passed. It now rolls to the next day. The Post page also has the bottom nav now, and the button waits until the store has loaded. |
| 3 | Orders icon changed when Account was tapped | The Account page showed the student nav for a moment before switching to the vendor nav. It now waits for the account to load, and Account is a tab in both navs. |
| 4 | No option to choose Student or Vendor | The **Sign up** tab now asks "I'm signing up as: Student / Vendor" first. The details page opens with that choice already selected. |
| 5 | Login ⇄ sign-up animation | The tab highlight slides between Log in and Sign up, and the title, role choice and hints fade in. Reduced-motion settings turn this off. |
| 6 | Vendor street/landmark didn't save | The form was being reset whenever the data changed in another tab, wiping what you typed. It now loads your details once and keeps your edits. Saving uses merge writes, and the store record updates live. |
| 7 | Separate student and vendor UI; "Dashboard" for both | Student nav: **Dashboard / My orders / Account**. Vendor nav: **Dashboard / Post / Orders / Order Codes / Account**. A signed-in vendor who opens a student page goes to the vendor dashboard; a student who opens a vendor page goes to the student dashboard. |
| 8 | "Code" didn't work; rename to "Order Codes" | Renamed to **Order Codes**. The hidden code field is now a normal, visible field. Below it is a live **Waiting for pickup** list with a Confirm button on each order, so typing is optional. |
| 9 | Console errors | **Hydration warning:** this came from the Grammarly browser extension adding attributes to `<body>`. React now ignores those attributes. **Blocking route on `/l/[id]`:** fixed the way the Next.js docs recommend, with a `connection()` marker, so the preview card is built per request and the page still prerenders. The dev-only "N" badge that covered the Dashboard tab is turned off. |

Testing note: in demo mode each tab has its own login, so one window can hold a student tab and a vendor tab. In Firebase mode the login is shared by the browser, so use an incognito window for the student.

## What's inside

| Path | What it is |
| --- | --- |
| `app/`, `components/` | Every screen: one login with role choice, student home / map / reserve / pickup code / my orders, vendor dashboard / post / orders by dorm / check code, account, help, privacy, terms, 404, admin |
| `lib/data.js` | The switch: Firebase (`db.js`) when the keys are set, demo data (`mock.js`) otherwise |
| `lib/db.js`, `lib/firebase.js`, `lib/firebase-admin.js` | The Firebase backend |
| `firestore.rules`, `firebase.json` | Security rules and emulator config |
| `app/api/notify/` | Push notifications to nearby students, including sale alerts |
| `scripts/seed.mjs`, `data/demo-seed.json` | Loads the demo vendors, dishes and accounts into Firestore |
| `public/`, `app/favicon.ico`, `app/icon.svg` | Logo, app icons, preview image, manifest |
| `README.md` | The submission README |
| `BACKEND_SETUP.md` | 13 steps to switch Firebase on and deploy (JC) |
| `HANDOFF.md` | Data contract, how to test with two tabs, the checklist and where each item is |
| `docs/RUNBOOK.md` | Timed plan for the rest of the hackathon (Lord) |
| `.env.example` | Every environment variable name; copy it to `.env.local` |

## New in this version: sale alerts for buyers
- When posting a dish with **Lower price**, the vendor can enter the **Regular price** (for example ₱90 → ₱60). Cards and the dish page show the old price crossed out and a "33% off" badge.
- Students near the vendor are alerted:
  - **App closed:** a push notification, "Sale near you: 33% off!", with the vendor, the dish, ₱90 → ₱60, and the number of servings left.
  - **App open:** the same alert shows as a banner at the top.
- Dishes posted without a discount still alert as "Leftover ulam near you".
- Files: `lib/deal.js`, `components/DealAlerts.js`, `app/api/notify/route.js`, `app/vendor/post/page.js`.

## Run it (anyone, 2 minutes)
```bash
npm install
npm run dev            # http://localhost:3000, demo data
```
Demo logins (any password in demo mode): vendor **nena@reroot.test**, student **student@reroot.test**, admin **admin@reroot.test**.
To try the sale alert: open the student home in one tab, log in as the vendor in another, then post a dish at ₱60 with regular price ₱90. The banner appears on the student tab.

## Step by step: who does what

**Lawrence (put it in the repo)**
1. `git checkout main && git pull && git checkout -b feat/full-app`
2. Copy everything in this folder into the repo root and replace existing files. Then run `git status`: no `.env.local`, `node_modules` or `.next` should be listed (`.gitignore` covers them).
3. Run `npm install`, then `npm run dev`, and click through the core loop with two tabs (`HANDOFF.md` section 2).
4. Commit in small pieces from your own account. For example: `Sale price and % off badge` → `Sale alerts for buyers` → `Firebase backend and rules` → `Docs`. Then push and open a PR to main.

**JC (switch on the backend)**
1. Follow `BACKEND_SETUP.md` steps 1–13: Firebase project, auth, Firestore, rules, keys in `.env.local`, seed, Vercel env vars, and the authorized domain.
2. Step 8 is the first live test of the security rules. Step 12 tests the sale push on two phones.
3. Confirm README section 4 (Tech stack).

**Aleia**
1. Check the new Filipino lines in `lib/copy.js` (search for `sale`, `regularPrice`, `percentOff`). Send any fixes to Lawrence.
2. Add "Sale alerts" to the demo script and the Q&A in the team doc.

**Lord**
1. Share the Figma file with the team: https://www.figma.com/design/ZcBuIaRZjjnQZaCYpBaHLn
2. Once the live link works, put screenshots into the deck placeholders (slides "Demo" and "Impact").
3. Continue with `docs/RUNBOOK.md`.

## Figma (finished)

**1 · Wireframes**
- The low-fidelity screens.

**2 · Style Guide + Assets**
- Colors (18 variables), type styles, spacing and radius.
- Components: buttons, inputs, badges, chips, the timer, ListingCard and the header.
- Navigation and responsive components: Nav/Top, Nav/VendorSidebar, ListingTile (with the sale price), BottomNav (student and vendor), DealAlert.
- Logo assets.

**3 · Screens + Prototype**
- The cover.
- Accounts: login, choose role, student setup, vendor setup, forgot password, account, my orders, and home with the sale alert.
- Student flow, vendor flow, and the Tier 2/3 screens and states.
- iPad: 4 screens.
- Desktop: student home, listing, pickup code, vendor dashboard with sidebar, and orders by dorm.
- The prototype has 4 flows. To play one, press **Present**, then pick a flow:
  - Sign up → choose role
  - Student: reserve a dish
  - Vendor: post and manage
  - Sale alert

## What was checked
- `eslint` is clean and `next build` passes. A fresh `npm ci` and build from this exact folder also passes.
- Browser tests pass on demo data:
  - The full core loop.
  - The sale alert ("Sale near you: 33% off! … Lechon Kawali ₱90 → ₱60 · 8 left").
  - Sign-up with role choice.
  - Every page on the UI/UX checklist, at phone, iPad and desktop widths.

**Not checked yet** (needs JC's Firebase project):
- Live Firestore and the security rules.
- Real push delivery to phones.

Until then, `/api/notify` answers 503, which is expected.
