// Demo data (Aleia's A3). One source for the fake data layer (lib/mock.js)
// and for JC's seed script (data/demo-seed.json is generated from this file).
// Names are fictional. Coordinates are approximate: verify in Google Maps before the demo.
// cutoffMin = minutes after the seed is loaded, so the demo works at any hour.

export const DEMO_VENDORS = [
  { id: "v1", name: "Aling Nena's Carinderia", email: "nena@reroot.test", address: "Dapitan St.", lat: 14.6119, lng: 120.9897 },
  { id: "v2", name: "Kuya Ben Shakes", email: "ben@reroot.test", address: "Asturias St.", lat: 14.6087, lng: 120.9912 },
  { id: "v3", name: "Lutong Bahay ni Tess", email: "tess@reroot.test", address: "P. Noval St.", lat: 14.6071, lng: 120.9871 },
  { id: "v4", name: "Kusina sa Lacson", email: "lacson@reroot.test", address: "Lacson Ave.", lat: 14.6112, lng: 120.9933 },
  { id: "v5", name: "Mang Ramon's Turo-Turo", email: "ramon@reroot.test", address: "Dapitan cor. M. dela Fuente", lat: 14.6127, lng: 120.9918 },
  // Extra vendors so every radius has dishes: about 110 m and 240 m (300 m chip), 390 m (500 m chip), 740 m (1 km chip) from UST.
  { id: "v6", name: "Ate Liza's Lutong Bahay", email: "liza@reroot.test", address: "Espanya Blvd. (near Gate 1)", lat: 14.6106, lng: 120.9889 },
  { id: "v7", name: "Carinderia ni Aling Rosa", email: "rosa@reroot.test", address: "Padre Noval St.", lat: 14.608, lng: 120.988 },
  { id: "v8", name: "Tito Boy's Silog", email: "boy@reroot.test", address: "M. dela Fuente St.", lat: 14.6113, lng: 120.9862 },
  { id: "v9", name: "Lola Pacing's Kakanin", email: "pacing@reroot.test", address: "Lacson Ave. cor. Laong Laan", lat: 14.604, lng: 120.993 },
];

// Regular prices for the sale items (shown crossed out, and in the sale alert).
const REGULAR = { tortang: 45, shake: 45, sinigang: 75, ginataan: 50, bicol: 65, pancit: 50, lumpia: 40, liempo: 85, tapsilog: 70, puto: 30 };

// [id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin]
export const DEMO_LISTINGS = [
  ["adobo", "v1", "Chicken Adobo", "bigger_serving", "Extra sabaw and rice, same price", 45, 12, 4, 8, 4, 120],
  ["tortang", "v1", "Tortang Talong", "lower_price", "₱10 off", 35, 6, 6, 6, 6, 180],
  ["shake", "v2", "Mango Shake", "lower_price", "₱10 off, ₱45 → ₱35", 35, 10, 3, 10, 3, 25],
  ["buko", "v2", "Buko Pandan Shake", "bigger_serving", "Large cup, same price", 40, 8, 8, 8, 8, 150],
  ["sinigang", "v3", "Pork Sinigang", "lower_price", "₱15 off before 8 PM", 60, 8, 7, 6, 5, 150],
  ["ginataan", "v3", "Ginataang Kalabasa", "lower_price", "₱10 off", 40, 6, 5, 6, 5, 165],
  ["menudo", "v4", "Pork Menudo", "bigger_serving", "Bigger serving + free rice", 55, 10, 5, 8, 6, 20],
  ["bicol", "v4", "Bicol Express", "lower_price", "₱10 off", 55, 8, 6, 8, 6, 140],
  ["curry", "v5", "Chicken Curry", "bigger_serving", "Extra potato and rice", 50, 10, 9, 8, 8, 160],
  ["pancit", "v5", "Pancit Canton", "lower_price", "₱10 off, good for 2", 40, 6, 4, 6, 4, 130],
  ["lumpia", "v5", "Lumpiang Gulay (3 pcs)", "lower_price", "₱5 off", 35, 12, 10, 12, 10, 175],
  ["pinakbet", "v6", "Pinakbet", "bigger_serving", "Extra rice, same price", 45, 8, 6, 6, 5, 140],
  ["liempo", "v6", "Inihaw na Liempo", "lower_price", "₱20 off tonight", 65, 6, 4, 6, 4, 110],
  ["kare", "v7", "Kare-Kare", "bigger_serving", "Extra bagoong and rice", 70, 6, 5, 5, 4, 150],
  ["tinola", "v7", "Chicken Tinola", "lower_price", "₱10 off", 50, 8, 8, 8, 8, 170],
  ["tapsilog", "v8", "Tapsilog", "lower_price", "₱15 off", 55, 10, 7, 10, 7, 160],
  ["puto", "v9", "Puto at Kutsinta (6 pcs)", "lower_price", "₱5 off", 25, 15, 12, 10, 8, 180],
].map(([id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin]) => ({
  id, vendorId, dish, dealType, dealNote, price, servingsTotal, servingsLeft, maxOrders, ordersLeft, cutoffMin,
  originalPrice: REGULAR[id] ?? null,
}));

// Sample orders so the vendor's Orders screen isn't empty. ageMin = minutes ago.
export const DEMO_RESERVATIONS = [
  { id: "r-seed1", listingId: "adobo", vendorId: "v1", studentUid: "u-student", name: "Juan D.", dorm: "dapitan", qty: 2, pickupCode: "4821", status: "reserved", statusMsg: "", ageMin: 25 },
  { id: "r-seed2", listingId: "adobo", vendorId: "v1", name: "Mika R.", dorm: "dapitan", qty: 2, pickupCode: "3907", status: "claimed", statusMsg: "", ageMin: 20 },
  { id: "r-seed3", listingId: "adobo", vendorId: "v1", name: "Bea L.", dorm: "asturias", qty: 3, pickupCode: "7752", status: "reserved", statusMsg: "student:otw", ageMin: 10 },
  { id: "r-seed4", listingId: "adobo", vendorId: "v1", name: "Carlo M.", dorm: "asturias", qty: 1, pickupCode: "2240", status: "reserved", statusMsg: "", ageMin: 5 },
];

// Demo accounts (mock and seed): every vendor email above logs in as that vendor;
// student@reroot.test is a student (Juan D., Dapitan Dorm).

// Sample inbox messages (one chat per reservation). ageMin = minutes ago.
// r-seed1 belongs to the demo student account (student@reroot.test), so both sides of that chat can be shown.
export const DEMO_MESSAGES = [
  { reservationId: "r-seed1", from: "student", kind: "chat", text: "Hello po! Pwede po bang extra sabaw?", ageMin: 22 },
  { reservationId: "r-seed1", from: "vendor", kind: "chat", text: "Opo, lalagyan ko po. Kunin n'yo na lang dito sa tindahan.", ageMin: 20 },
  { reservationId: "r-seed3", from: "student", kind: "status", key: "student:otw", text: "On my way", ageMin: 8 },
];
