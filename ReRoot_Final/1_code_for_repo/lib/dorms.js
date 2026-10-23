// Dorm / building options for the reserve form and the share sheet.
// Aleia: replace with the final list from "ReRoot Copy & Data" (keep the ids short, they go in links).
export const DORMS = [
  { id: "dapitan", name: "Dapitan Dorm" },
  { id: "asturias", name: "Asturias Hall" },
  { id: "pnoval", name: "P. Noval Residences" },
  { id: "lacson", name: "Lacson Tower" },
  { id: "padre-paredes", name: "Padre Paredes Boarding House" },
  { id: "other", name: "Other / walk-in" },
];

export function dormName(id) {
  return DORMS.find((d) => d.id === id)?.name ?? id ?? "";
}
