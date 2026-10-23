// Recommendation ranking from the task plan (Section 5), kept simple so it is easy to explain:
// score = 40 × (1 − distance ÷ radius)
//       + 30 × (1 − minutesLeft ÷ 180, floored at 0)   ← ending soon
//       + 20 × (1 − price ÷ highest price shown)
//       + 10 if the student bought from this vendor before (stored on the device)
// Top 3 are "Recommended", everyone else is sorted by distance.
import { distanceM } from "./geo";
import { minutesLeft } from "./time";

export function rankListings(listings, position, radius, bought = new Set()) {
  const items = listings
    .map((l) => ({ listing: l, distance: distanceM(position, l) }))
    .filter((x) => x.distance <= radius);
  const maxPrice = Math.max(1, ...items.map((x) => x.listing.price || 0));
  for (const x of items) {
    const near = 40 * (1 - x.distance / radius);
    const soon = 30 * Math.max(0, 1 - minutesLeft(x.listing.cutoffAt) / 180);
    const cheap = 20 * (1 - (x.listing.price || 0) / maxPrice);
    const suki = bought.has(x.listing.vendorId) ? 10 : 0;
    x.score = near + soon + cheap + suki;
  }
  const byScore = [...items].sort((a, b) => b.score - a.score);
  const top = byScore.slice(0, 3);
  const topIds = new Set(top.map((x) => x.listing.id));
  const rest = items.filter((x) => !topIds.has(x.listing.id)).sort((a, b) => a.distance - b.distance);
  return { recommended: top.map((x) => ({ ...x, top: true })), rest, all: items };
}
