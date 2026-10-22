# ReRoot: everything except JC's backend, ready to use

Team Root Lords · CSSprint 2026 · package made Thu Oct 22, 8:40 PM

Everything Lord, Lawrence and Aleia own is built and connected to the same names and demo data. JC's backend is what's left: `lib/db.js`, security rules, `/app/api/notify`, deploy and the seed script. When it plugs in, the app goes live.

## UPDATE · Fri Oct 23, 12:35 AM: one login for everyone + full UI/UX checklist

**What changed**
- One login for everyone at `/login`. After signing up, the user picks Student or Vendor on `/onboarding`. Students can still reserve as guests.
- New pages: forgot password, My orders, Account (profile, settings, log out), Help, Privacy Policy, Terms, 404, a loading screen and a splash screen.
- New on existing screens: a welcome intro, search with a no-results state, bottom navigation, confirmation before cancel / close / log out, cancel a reservation, an iPad and desktop layout, hover and keyboard-focus states.
- Demo logins: **nena@reroot.test** (vendor), **student@reroot.test** (student), any password.
- Tested in a browser: sign-up as vendor and as student, guest reserve, cancel, my orders, edit profile, log out, forgot password, 404, the core loop, and phone / iPad / desktop widths. No errors.

**Lawrence: if you already committed the 8:40 PM version**, copy these from `1_code_for_repo/` over your repo (if you edited any of them since, compare with `git diff` before committing):
`app/` account, forgot, help, login, me, onboarding, privacy, terms (new folders), `app/loading.js`, `app/not-found.js`, `app/layout.js`, `app/page.js`, `app/globals.css`, `app/vendor/check/page.js`, `app/vendor/login/page.js`, `app/vendor/post/page.js` ·
`components/` AccountButton, BottomNav, ConfirmDialog, InfoPage, ListingDetail, LoginForm, PickupCode, ReserveForm, ShareSheet, Splash, VendorDashboard, VendorOrders, WelcomeCard, hooks, ui ·
`lib/copy.js`, `lib/demo-data.js`, `lib/mock.js`, `data/demo-seed.json`, `README.md`, `HANDOFF.md`.
Suggested commits: `One login with role choice after sign-up` → `Add account, my orders and cancel` → `Add help, privacy, terms, 404, loading, splash` → `Add search, bottom nav, confirm dialogs` → `Responsive iPad and desktop layout`.

**JC:** `HANDOFF.md` section 3 now has 3 more functions for `db.js`: `resetPassword`, `updateProfile` and `cancelReservation`, plus the `users/{uid}` collection and its rules. Section 5 lists every checklist item and where it is.

---

## What's in this package

| Folder / link | What it is | Who uses it |
| --- | --- | --- |
| `1_code_for_repo/` | The full front end (all 10 screens, Tier 1–3 UI), shared demo data, seed JSON, final README with screenshots, `HANDOFF.md` | Lawrence commits it; JC reads `HANDOFF.md` |
| `2_brand_assets/` | Logo, app icons (192/512/180), favicon, preview image (1200×630) | Already copied into `1_code_for_repo/public`; spares for the deck and Drive |
| `RUNBOOK.md` | Every timed step for tonight and Friday: checkpoints, design QA, video, final checklist, submission | Lord |
| Figma "ReRoot" | https://www.figma.com/design/ZcBuIaRZjjnQZaCYpBaHLn (wireframes, style guide + assets, hi-fi screens) | Everyone (view) |
| Team doc "ReRoot Copy & Data" | https://claude.ai/artifact/4QQQGAeaWiVoVde2wbc4Jo · UI copy EN/FIL, demo data, 2-min demo script, 15 Q&A answers, survey, decisions log | Everyone |
| Pitch deck "ReRoot Pitch Deck" | https://claude.ai/artifact/916LGZCkBJxcCUCdhCfqTf · 12 slides with speaker notes; dashed placeholders for live screenshots and numbers | Lord + Aleia |

The Figma file, team doc and deck are private until you share them: open each, then **Share** and add JC, Lawrence and Aleia.

---

## Step by step: do these now, in this order

### Lord (about 10 minutes, then the runbook)
1. **Share the three links** above with the team (Figma: Share → invite; doc and deck: Share menu).
2. **Send in the group chat:** this whole zip to Lawrence; `1_code_for_repo/HANDOFF.md` to JC; the team doc link to Aleia.
3. **Post the survey** if it isn't out yet (questions in the team doc, section 5). Ask the block and org GCs to answer before 10:45 PM.
4. **Tell JC two things** (they're in HANDOFF.md section 3): `reserve()` must return `{ id, pickupCode }`, and `db.js` needs the 8 extra functions listed there with the same names.
5. Then follow `RUNBOOK.md` from 9:00 PM.

### Lawrence (about 20 minutes)
1. `git checkout main && git pull`, then `git checkout -b feat/ui-core`.
2. Copy everything inside `1_code_for_repo/` into the repo root (the folder with `package.json`). Say yes to replacing `app/layout.js`, `app/page.js`, `app/globals.css`, `app/favicon.ico` and `README.md`. If JC already has `lib/geo.js` or `public/manifest.json`, keep his.
3. `npm i leaflet react-leaflet @fontsource/plus-jakarta-sans`, then `npm run dev`. Open http://localhost:3000.
4. Test with two tabs (HANDOFF.md section 2). Vendor login: **nena@reroot.test**, any password.
5. Commit in small pieces from your own account, for example: `Add theme and layout` → `Add UI components` → `Build student screens` → `Build vendor screens` → `Add map, share sheet and language toggle` → `Add demo data and README`. Push the branch.
6. Read through `components/` and `lib/` so you can explain them to judges (rank.js has the recommendation formula).
7. **At 9:00 PM (W4):** in `lib/data.js`, change `export * from "./mock";` to `export * from "./db";`, merge with JC, and test on the Vercel link.

### Aleia (about 15 minutes now, then 11 PM)
1. Open the team doc. **Section 1 (UI copy):** read the Filipino column and fix anything that doesn't sound natural. Send changed rows to Lawrence; he pastes them into `lib/copy.js` (same key).
2. **Section 2 (demo data):** check each vendor's coordinates in Google Maps (right-click → copy coordinates). Send corrections to Lawrence/JC; they go in `lib/demo-data.js`.
3. **Section 6 (decisions log):** copy the table into Notion's Decisions Log (A1/A10). Update Notion task statuses at each checkpoint.
4. Read the demo script (section 3) and Q&A (section 4). Your questions: 3, 4, 10.
5. **11:00 PM:** download the survey responses (.csv) and fill in the results table (section 5). Send the numbers to Lord for deck slide 10 and the README "Student survey" line.
6. **1:00–2:00 AM:** rehearse twice with Lord (A8); time it against the handbook's pitch length.

### JC (not in this package: his part)
Read `1_code_for_repo/HANDOFF.md` section 3. Build `lib/db.js` with the listed names, the security rules, the seed script (read `data/demo-seed.json`), `/app/api/notify`, the `/admin` suspension toggle, and deploy to Vercel. Confirm the README Tech stack section and check the credits against `package.json`.

---

## What was checked
- `next build` passes and `eslint` is clean on Next 16 + Tailwind 4.
- A browser run of the whole loop on the fake data passed: reserve → pickup code → vendor sees it by dorm → vendor's "Ready na po" appears live on the student phone → code confirmed → results card updates → new dish posted → share sheet opens → the dish appears on the student home without a refresh.
- The README and deck numbers were checked against their sources: 12 of 28 class days, 2,175 tons a day, 20–33% commission.

## Not checked yet (happens at the checkpoints)
- Real Firebase data, map tiles and push notifications. They need JC's backend and the live link.
- iPhones.
- Survey results. They must come from real replies. Never estimate them.
