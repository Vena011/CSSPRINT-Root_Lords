# ReRoot

**Rerouting already-cooked surplus from campus carinderias to the students nearby.**

Team **Root Lords** · CSSprint 2026: *Rooted in Innovation* · UST Computer Science Society

> Status: Day 1 initial project document (October 22, 2026). Sections marked **[to be filled after fieldwork]** will be completed with our interview results.

---

## 1. Problem

Carinderias near the University of Santo Tomas cook in batches at dawn for an expected crowd of students. Whatever is not sold by closing is taken home, given away, or thrown out, and the money spent on ingredients is lost. The loss is worst on **low-demand days**, such as class suspensions and heavy-rain days, when most student customers stay in their dorms or go home. These owners have no affordable way to reach the students who are still nearby: delivery apps take too large a commission, and a Facebook post cannot coordinate orders.

**In one sentence:** cook-ahead micro eateries near UST lose money on food that is already cooked because they have no affordable, fast way to sell it to the students who are still nearby.

### Evidence

- **Demand drops are frequent.** From August 1 to September 15, 2026, 12 of 28 class days were cancelled in Metro Manila and several provinces, about 43% of class days in that period [4]. Disasters disrupted 69 school days nationwide from January to early October 2025 [5]. DepEd is preparing modified and suspended class days for SY 2026-27 because of a potentially strong El Niño [6].
- **Every unsold serving costs more.** In April 2026, carinderia owners raised dish prices by ₱10-15 as LPG, rice, meat, and cooking oil became more expensive [10].
- **Food waste is large.** The Philippines wastes about 2,175 tons of food every day [11].
- **Existing channels do not fit.** Delivery apps charge restaurants about 20-33% commission, which a ₱50 dish cannot absorb [13].
- **Owners need simple tools.** 51% of surveyed MSMEs use only basic digital tools and 23% use none for business [2].

### Field evidence [to be filled after fieldwork]

| Measure | Result |
|---|---|
| Owners interviewed near UST | [number] |
| Owners who regularly have leftovers | [number] of [number] |
| Typical leftover servings, normal day | [range] |
| Typical leftover servings, suspension day | [range] |
| What owners do with leftovers | [answer] |
| Owners willing to post leftovers on an app | [number] of [number] |
| Students who would buy discounted leftover ulam | [percent] of [number] |

---

## 2. Target users

| Level | Target |
|---|---|
| **MSME size** | Micro enterprises: up to ₱3M assets and 9 or fewer workers [1][15][16] |
| **Sector** | Accommodation and Food Service Activities: 190,899 MSMEs, 15.37% of all MSMEs [1] |
| **Business model** | Cook-ahead eateries (carinderia, turo-turo), which commit money to food before any customer arrives |
| **Place** | Sampaloc, Manila: streets around UST (Dapitan, Asturias, P. Noval, Lacson) |
| **Primary user** | Carinderia owners whose customers are mainly students |
| **Secondary user** | Students living in dorms and boarding houses near UST |

**Why MSMEs specifically:** large food chains already have POS data, planning teams, delivery contracts, and formal waste programs [12]. A carinderia has a notebook and gut feel. One day of unsold food can erase several days of profit.

---

## 3. Solution

ReRoot is a mobile web app that helps carinderia owners avoid and recover losses on low-demand days.

### MVP flow

1. **Low-demand alert.** In the morning, owners get a warning when a low-demand day is likely, based on a real rain forecast and announced class suspensions, so they can cook less.
2. **Quick posting with capacity.** If food is left over, the owner posts each dish (name, servings, price, cutoff time) in under 30 seconds, and sets how many orders they can handle (for example, a maximum number of orders or dorm handoffs before cutoff).
3. **Live availability.** Buyers see remaining servings per dish and remaining order slots update in real time (for example, "4 of 12 servings left", "3 more orders accepted"). A dish or carinderia closes automatically when it is sold out or full, so nothing is oversold.
4. **Share button.** Anyone can share a listing in one tap to Messenger, Viber, or any app as a link with a preview card. The link opens in the browser with no install.
5. **Home: recommendations and nearby carinderias.** The first screen students see shows recommended leftover deals, ranked by distance, time left before the cutoff, price, and carinderias they bought from before, together with all carinderias with leftovers within a radius they choose (for example 300 m to 1 km) on a map or list.
6. **Push notifications.** Students who allow notifications get an alert every time a carinderia within their radius lists a sale, with no account needed.
7. **No-install reservation.** Students reserve from the home screen or a shared link without installing an app or creating an account. They choose their dorm when reserving, so orders are grouped by dorm automatically.
8. **Direct chat with the carinderia.** After reserving, the buyer and the owner can message each other in the app, with one-tap quick replies for the owner ("Ready na po", "Papunta na sa lobby", "Ubos na po"). The chat is tied to the reservation, so no account is needed, and it closes after pickup.
9. **Verified handoff.** A pickup code confirms each handoff, and the owner sees servings sold and money recovered.

### What makes it new

- **Event-triggered:** alerts come from real weather and suspension data, so owners are warned before the bad day, not after.
- **Nothing to install:** listings open from a shared link in any browser, and buyers reserve and chat without an account.
- **Instant reach:** push notifications alert nearby students the moment a sale is listed, and recommendations put the best deals first.
- **Self-pooling orders:** buyers pick their dorm when reserving, so orders are grouped by building and the owner makes one handoff per dorm.
- **Low-effort chat for owners:** one-tap quick replies let busy owners coordinate pickups without typing.
- **No commission:** free for vendors, no riders needed.
- **Localized, not copied:** surplus-food apps work abroad (Too Good To Go has 120 million users in 21 countries), but its first Asian market opened only in January 2026 and we found no Philippine launch [14]. None react to class suspensions or group orders by dorm.

### Out of scope for the MVP

In-app payments (cash or GCash on handoff), rider network, native mobile app, nationwide rollout.

---

## 4. Objectives

**General objective:** To help cook-ahead micro eateries around UST recover income from food they have already cooked by selling it quickly to nearby students, with a tool simple enough for owners with basic digital skills.

**Specific objectives:**

1. Alert owners in the morning when a low-demand day is likely, using a real rain forecast and announced class suspensions.
2. Let owners post leftover dishes in under 30 seconds and set how many orders they can handle.
3. Show buyers remaining servings and order slots in real time, and close listings automatically when sold out or full.
4. Let anyone share a listing in one tap to Messenger, Viber, or other apps, with a clear preview card.
5. Show students recommended deals and nearby carinderias with leftovers within a chosen radius on the first screen, and let them reserve without installing an app or creating an account, with orders grouped by dorm.
6. Notify students who opt in every time a carinderia within their radius lists a sale.
7. Let buyers and owners message each other directly about a reservation, with one-tap quick replies for owners.
8. Confirm each handoff with a pickup code and show owners servings sold and money recovered.
9. Keep the tool usable for owners with basic digital skills: works in a phone browser, minimal typing, Filipino and English.

---

## 5. Success criteria

| Criterion | Target |
|---|---|
| Alert (demo) | Alert appears when the forecast shows heavy rain or a suspension is entered |
| Posting speed (demo) | Owner posts a dish in under 30 seconds |
| Live availability (demo) | When one student reserves, the remaining servings drop on the other student's screen within seconds; a full listing closes automatically |
| Share link (demo) | Shared link shows a preview card in Messenger and opens on a student phone with no install |
| Direct chat (demo) | Buyer sends a message; owner replies with a one-tap quick reply; both see it within seconds |
| Home screen (demo) | Recommendations and nearby carinderias appear first; changing the radius updates the list |
| Push notification (demo) | A student phone receives a notification within seconds of a vendor posting |
| Pooled order (demo) | Two students from one dorm reserve; orders group under that dorm; pickup code verified |
| Owner test (Day 2) | 1-2 real UST-area owners try posting on their own phones; we record time taken and feedback |
| Pilot (after hackathon, goal) | 5-10 carinderias using it weekly |

---

## 6. Tech stack (planned)

> Final choices to be confirmed by the developers.

- **Front end:** mobile-first web app (React or Next.js)
- **Database and realtime updates:** hosted database with realtime support (for example Supabase or Firebase). Reservations must reduce remaining servings in a single transaction so two buyers cannot take the last serving at the same time.
- **Maps and distance:** browser geolocation with an open map library (for example Leaflet with OpenStreetMap)
- **Weather:** a free weather forecast API (for example Open-Meteo)
- **Sharing:** Web Share API and Open Graph preview cards
- **Direct chat:** messages stored in the realtime database, tied to each reservation and closed after pickup
- **Push notifications:** Web Push through a service worker (for example Firebase Cloud Messaging). On iPhones, web push works only after the student adds the site to the home screen (iOS 16.4 or later), so the share link remains the fallback.
- **Hosting:** free web hosting (for example Vercel)

---

## 7. Scalability roadmap

| Stage | What gets added |
|---|---|
| **MVP (hackathon)** | Low-demand alert, quick posting with capacity, live availability, share button, recommendations and nearby-by-radius home screen, push notifications, no-install reservations grouped by dorm, direct buyer-owner chat, pickup code, results card |
| **v2** | Prices that drop toward closing, photo posting (AI reads the display trays), suki points that turn rescue buyers into regulars |
| **v2.5** | Cooking guide based on each owner's leftover history |
| **v3** | Automatic suspension feeds from official announcements and school calendars; rain-day pre-orders from dorms |
| **v4** | The rest of the University Belt (about 56 schools [9]), other school districts, bakeries, school canteens |
| **v5 (startup model)** | Paid plan for small chains and canteens keeps it free for carinderias; district-level demand data grows more useful as more vendors join |

---

## 8. Team

| Member | Role |
|---|---|
| Lord Benedict Janda | Team Leader, Concept Lead |
| John Carlo Mananes | Lead Developer |
| Lawrence Christian Bonus | Developer |
| Aleia Cejas | Concept Support, Presenter |

---

## 9. Acknowledgments

- This project was developed during **CSSprint 2026: Rooted in Innovation**, organized by the UST Computer Science Society.
- **AI assistance:** Claude (Anthropic) was used for research summaries and drafting documentation. All content was reviewed by the team.
- Third-party libraries, APIs, and datasets will be listed here as they are added, with their licenses.

---

## 10. References

1. Department of Trade and Industry. (2023). *2023 Philippine MSME statistics*. https://dti.gov.ph/businesses/msmes/msmeresources/msme-statistics
2. Department of Trade and Industry. *MADALI e-commerce baseline survey*. https://ecommerce.dti.gov.ph/madali/baseline_survey.html
3. Malaya Business Insight. (2025). *MSMEs turn more optimistic but fear access to credit* (BCG survey). https://malaya.com.ph/business/business-news/msmes-turn-more-optimistic-but-fear-access-to-credit
4. Philippine Canadian Inquirer. (2026, September 16). *Blanket class suspensions: The growing cost to Filipino students' learning*. https://canadianinquirer.net/2026/09/16/blanket-class-suspensions-the-growing-cost-to-filipino-students-learning/
5. Magtulis, P. (2026, January 3). *Suspended, cancelled and lost*. The Data Dictionary. https://www.data-dict.com/class-suspensions/
6. Daily Tribune. (2026, October 19). *Shorter class days loom due El Niño*. https://tribune.net.ph/2026/10/19/shorter-class-days-loom-due-el-ni%C3%B1o
7. BusinessWorld. (2026, September 15). *Blanket suspensions seen hurting workers, businesses in Philippines*. https://bworldonline.com/top-stories/2026/09/15/777149/blanket-suspensions-seen-hurting-workers-businesses-in-philippines/
8. BusinessMirror. (2026, September 16). *Marcos, economic team push to end blanket class and work suspensions*. https://businessmirror.com.ph/2026/09/16/marcos-economic-team-push-to-end-blanket-class-and-work-suspensions/
9. Wikipedia. *University Belt*. https://en.wikipedia.org/wiki/University_Belt
10. MindaNews. (2026, April 19). *Carenderia owners, food stall vendors raise prices but customers understand*. https://mindanews.com/top-stories/2026/04/carenderia-owners-food-stall-vendors-raise-prices-but-customers-understand/
11. Manila Bulletin. (2025, December 4). *Help reduce food wastage* (DOST-FNRI data). https://mb.com.ph/2025/12/04/help-reduce-food-wastage
12. Aquino, T. (2025, May 28). *Nearly 3 out of 10 Filipinos are hungry, but so much food is wasted*. GMA News. https://www.gmanetwork.com/news/lifestyle/food/947584/nearly-3-out-of-10-filipinos-are-hungry-but-so-much-food-is-wasted-what-can-we-do-about-it/story/
13. Klikit. (2026, May 26). *Food delivery commission fees in the Philippines*. https://klikit.io/en/learn/food-delivery-commission-fees-philippines-guide
14. PR Newswire. (2026, January 28). *World's largest marketplace for surplus food, Too Good To Go, launches in Japan*. https://www.prnewswire.com/news-releases/worlds-largest-marketplace-for-surplus-food-too-good-to-go-launches-in-japan-302672081.html
15. GMA News. (2008, May 23). *Arroyo signs MSME law, redefines micro, small traders* (RA 9501). https://gmanetwork.com/news/money/content/97000/arroyo-signs-msme-law-redefines-micro-small-traders/story
16. Wikipedia. *Micro business in the Philippines*. https://en.wikipedia.org/wiki/Micro_business_in_the_Philippines
