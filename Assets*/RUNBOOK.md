# Lord's runbook: tonight and Friday

Follow it top to bottom. Each box matches a task in the plan (L5–L14).

## 9:00 PM · Checkpoint 1 (L5), 10 min
- [ ] JC and Lawrence have switched `lib/data.js` to `./db` and merged to main.
- [ ] Vercel link opens on two real phones (one Android, one iPhone if possible).
- [ ] **Pass test:** phone A logs in as a vendor and posts a dish. Phone B reserves it and gets a pickup code. Phone A sees it under the right dorm and confirms the code.
- [ ] Fail → everyone helps fix Tier 1 before any Tier 2 work. Post the error screenshot in the group chat.
- [ ] Update Notion task statuses (or ask Aleia).

## 9:30–11:00 PM · while they build
- [ ] Make sure Aleia's survey is out and getting replies.
- [ ] Rehearse slides 1–6 out loud once, using the speaker notes in the deck.

## 11:00 PM · Design QA (L8) + Checkpoint 2 (L9), 15 min
**Design QA on your phone, live link.** Send fixes to Lawrence as a numbered list with screenshots.
- [ ] Text is readable (nothing under about 13 px on the phone); Filipino strings fit their buttons.
- [ ] Every button is easy to tap; nothing overlaps the bottom bar.
- [ ] Colors match the style guide; badges read correctly (left / ending soon / sold out / deal).
- [ ] Empty state (pick 300 m somewhere with no vendors), loading skeleton, sold-out toast, error card all look right.
- [ ] Share sheet opens, and the shared link shows a preview card in Messenger (needs JC's metadata).

**Go / no-go on Tier 3** (record the decision in Notion):
- [ ] Go only if every Tier 1 and Tier 2 feature works on both phones.
- [ ] If go: push first, then results card, then quick status. If no-go: the rest of the night is bug fixing.

## 11:15 PM–12:45 AM · Deck (L10)
The deck is already designed. Only fill the dashed placeholders:
- [ ] **Slide 7 (Demo):** three live phone screenshots: vendor posting or share sheet; student listing with the live count; Check code showing "valid".
- [ ] **Slide 10 (Impact):** survey % and number of replies (from Aleia), servings saved in tonight's test, a screenshot of the results card.
- [ ] **Slide 4 notes:** the survey line.
- [ ] **Slide 12:** replace [LIVE APP LINK] with the Vercel link.
- [ ] Take screenshots with the demo data loaded. Put the same ones in the Drive folder.
- [ ] Download the deck as PDF (deck page → Share/Export) and put it in Drive "ReRoot Final".
- [ ] Review the content with Aleia once.

## 1:00 AM · Code freeze (L12)
- [ ] Announce in the group chat: "Code freeze. Bug fixes only."

## 1:00–1:45 AM · Demo video (L11)
- [ ] Check the handbook for the required length; default 2–3 minutes.
- [ ] JC resets the demo data (re-run the seed) so Chicken Adobo starts at 4 of 12 left.
- [ ] Quiet room. Record both phone screens (phone screen recorder on each, or laptop + phone) while you narrate the script in the team doc, section 3.
- [ ] One take of the core loop first, then the alert, radius/map and push if built.
- [ ] Upload to Drive "ReRoot Final" → Share → **Anyone with the link can view**. Open it in an incognito window to test.
- [ ] Download a copy to the laptop for the offline backup.

## 1:45 AM · Final check (L12): open every link in an incognito window
- [ ] GitHub repo is public (or shared with organizers) and opens without login. *(JC)*
- [ ] Commit history shows JC and Lawrence spread across the night. *(JC, Lawrence)*
- [ ] No secrets in the repo: no `.env.local`, no service-account JSON. *(JC)*
- [ ] README: live link, video link, deck link filled in (top of README); survey line filled; any feature that doesn't work moved to Roadmap. *(Lord, Aleia)*
- [ ] README credits match `package.json`. *(JC)*
- [ ] Live app works on a phone with demo data; core loop runs end to end. *(JC)*
- [ ] Demo video plays fully from the share link. *(Lord)*
- [ ] Deck finished, link shared, PDF exported. *(Lord, Aleia)*
- [ ] Problem Definition PDF (updated with survey results and the features actually built) in the Drive folder. *(Aleia)*
- [ ] All links collected in the submission note below.

## Friday Oct 23
**Before noon · morning check (L13)**
- [ ] Open the live app, repo, video and deck in incognito. Run the core loop once on two phones.

**4:15 PM · get ready (L14)**
- [ ] Fill this note and keep it open:

```
ReRoot · Team Root Lords · CSSprint 2026
GitHub repo:     https://github.com/Vena011/CSSPRINT-Root_Lords
README:          (in the repo root)
Live app:        [Vercel link]
Demo video:      [Drive link, anyone with the link can view]
Pitch deck:      [deck link]  ·  PDF: [Drive link]
Final docs:      [Problem Definition PDF, Drive link]
```

**4:30 PM sharp · submit**
- [ ] Submit the official final form at 4:30 (deadline 5:00, no late submissions).
- [ ] Screenshot the confirmation and post it in the group chat.

## Saturday Oct 24 · if Top 10
- [ ] All four onsite early. Test the app and the offline video on the presenting laptop.
- [ ] Charge two phones; JC re-seeds fresh demo data that morning.
- [ ] Q&A owners: Lord (concept, design, decisions), JC (backend, Firebase, push), Lawrence (front end, map, sharing), Aleia (problem, evidence, interviews, survey). Answers: team doc, section 4.
